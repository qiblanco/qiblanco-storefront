// Hermetische Tests des Einstiegs-Puffers in public/qiblanco-tracker.js
// (Job 20260802-fj1-storefront-cart-attribut-early-return-reparatur).
// node:test + node:vm als Bordmittel, KEIN Netz, kein Browser, kein neuer Runner.
// Ausfuehren: node --test test/tracker-entry-buffer.test.mjs
//
// Der Tracker ist ein IIFE für den Browser. Wir laden ihn in einen node:vm-
// Kontext mit minimalen window/document-Stubs und prüfen VERHALTEN (was landet
// in sessionStorage/cookie), nicht Quelltext.
//
// Warum diese Tests: der Fix lässt den Attributions-Record jetzt AUCH ohne
// Klick-ID entstehen. Die Gefahr dabei ist Verdraengung — ein param-loser
// Record darf einen bestehenden Ad-Klick NIE ueberschreiben, sonst kostet der
// "Fix" Attribution statt sie zu gewinnen.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = readFileSync(
  join(HERE, '..', 'public', 'qiblanco-tracker.js'),
  'utf8',
);

const KEY = 'qiblanco_checkout_attribution';

/**
 * Lädt den Tracker in einen frischen VM-Kontext.
 *
 * @param {{url?: string, referrer?: string, cookie?: string,
 *          session?: Record<string,string>, consent?: boolean}} opts
 */
function runTracker({
  url = 'https://qiblanco.com/',
  referrer = '',
  cookie = '',
  session = {},
  consent = true,
} = {}) {
  const store = {...session};
  const parsed = new URL(url);
  let cookieJar = cookie;

  const documentElement = {
    getAttribute(name) {
      // Über das Preview-Attribut steuern wir trackingAllowed() deterministisch,
      // ohne einen ganzen Cookiebot nachzubauen.
      if (name === 'data-qiblanco-tracking-preview') {
        return consent ? 'true' : 'false';
      }
      return null;
    },
  };

  const sandbox = {
    URL,
    URLSearchParams,
    Date,
    JSON,
    RegExp,
    document: {
      documentElement,
      referrer,
      get cookie() {
        return cookieJar;
      },
      // Browser-Semantik: Zuweisung HÄNGT AN statt zu ersetzen.
      set cookie(entry) {
        const name = String(entry).split('=')[0];
        const kept = cookieJar
          .split(';')
          .map((p) => p.trim())
          .filter((p) => p && p.split('=')[0] !== name);
        kept.push(String(entry).split(';')[0]);
        cookieJar = kept.join('; ');
      },
      createElement: () => ({}),
      head: {appendChild() {}},
    },
    window: {
      location: {
        search: parsed.search,
        href: parsed.href,
        protocol: parsed.protocol,
        hostname: parsed.hostname,
      },
      sessionStorage: {
        getItem: (k) => (k in store ? store[k] : null),
        setItem: (k, v) => {
          store[k] = String(v);
        },
      },
      history: {pushState() {}, replaceState() {}},
      addEventListener() {},
      setTimeout() {},
    },
  };
  sandbox.window.window = sandbox.window;
  // boot() greift auf das GLOBALE `location` zu (Browser-Semantik), nicht auf
  // window.location — sonst ReferenceError im VM-Kontext.
  sandbox.location = sandbox.window.location;

  vm.createContext(sandbox);
  vm.runInContext(SOURCE, sandbox, {filename: 'qiblanco-tracker.js'});

  const readCookieValue = () => {
    const hit = cookieJar
      .split(';')
      .map((p) => p.trim())
      .find((p) => p.startsWith(KEY + '='));
    return hit ? decodeURIComponent(hit.slice(KEY.length + 1)) : '';
  };

  return {
    buffered: store[KEY] ? JSON.parse(store[KEY]) : null,
    cookieRecord: readCookieValue() ? JSON.parse(readCookieValue()) : null,
    cookieJar,
  };
}

// ── Der Fix: organischer Einstieg erzeugt jetzt ueberhaupt einen Record ──

test('Organik ohne Klick-ID: Einstiegs-Record entsteht (war vorher gar keiner)', () => {
  const {buffered} = runTracker({
    url: 'https://qiblanco.com/products/qione',
    referrer: 'https://www.google.com/',
    consent: false, // sessionStorage-Puffer braucht KEINE Einwilligung
  });

  assert.ok(buffered, 'ohne Klick-ID muss jetzt ein Record gepuffert werden');
  assert.deepEqual(buffered.params, []);
  assert.equal(buffered.href, 'https://qiblanco.com/products/qione');
  assert.equal(buffered.referrer, 'https://www.google.com/');
  assert.ok(buffered.savedAt, 'savedAt fehlt');
});

test('Ohne Einwilligung entsteht KEIN Cookie (Consent-Bindung unveraendert)', () => {
  const {cookieRecord} = runTracker({
    url: 'https://qiblanco.com/products/qione',
    consent: false,
  });

  assert.equal(cookieRecord, null, 'Cookie darf ohne Consent nicht entstehen');
});

test('Mit Einwilligung wird der Einstiegs-Record zum Cookie', () => {
  const {cookieRecord} = runTracker({
    url: 'https://qiblanco.com/products/qione',
    referrer: 'https://www.bing.com/',
    consent: true,
  });

  assert.ok(cookieRecord, 'Cookie fehlt');
  assert.equal(cookieRecord.href, 'https://qiblanco.com/products/qione');
});

// ── Regression: der Klick-Pfad muss unveraendert bleiben ──

test('Ad-Einstieg mit fbclid: Params werden wie bisher gepuffert', () => {
  const {buffered} = runTracker({
    url: 'https://qiblanco.com/pages/schlaf?fbclid=F-42',
    consent: true,
  });

  assert.deepEqual(buffered.params, [['fbclid', 'F-42']]);
});

// ── Verdraengungs-Schutz: die eigentliche Gefahr des Fixes ──

test('SPA/Folgeseite ohne Params verdraengt den gepufferten Ad-Klick NICHT', () => {
  const bestand = {
    params: [['fbclid', 'F-42']],
    href: 'https://qiblanco.com/pages/schlaf?fbclid=F-42',
    referrer: 'https://www.facebook.com/',
    savedAt: '2026-08-02T09:00:00.000Z',
  };

  const {buffered} = runTracker({
    url: 'https://qiblanco.com/products/qione', // interne Folgeseite, keine Params
    session: {[KEY]: JSON.stringify(bestand)},
    consent: true,
  });

  assert.deepEqual(
    buffered,
    bestand,
    'der param-lose Record hat den Ad-Klick ueberschrieben',
  );
});

test('Organische Rueckkehr in neuer Session verdraengt das Klick-Cookie NICHT', () => {
  // Neue Session: sessionStorage leer, aber das 90-Tage-Cookie des Ad-Klicks
  // lebt noch. Ohne Schutz würde hier ein param-loser Record das Cookie
  // ueberschreiben und die Klick-Attribution des Kaufs vernichten.
  const bestand = {
    params: [['fbclid', 'F-42']],
    href: 'https://qiblanco.com/pages/schlaf?fbclid=F-42',
    referrer: 'https://www.facebook.com/',
    savedAt: '2026-08-02T09:00:00.000Z',
  };

  const {cookieRecord} = runTracker({
    url: 'https://qiblanco.com/products/qione',
    cookie: `${KEY}=${encodeURIComponent(JSON.stringify(bestand))}`,
    session: {},
    consent: true,
  });

  assert.deepEqual(
    cookieRecord,
    bestand,
    'das Klick-Cookie wurde von einem param-losen Record ueberschrieben',
  );
});

test('Neuer Ad-Klick ueberschreibt einen aelteren Record weiterhin (Last-Click)', () => {
  const alt = {
    params: [['fbclid', 'ALT']],
    href: 'https://qiblanco.com/a?fbclid=ALT',
    referrer: '',
    savedAt: '2026-08-01T09:00:00.000Z',
  };

  const {buffered} = runTracker({
    url: 'https://qiblanco.com/b?gclid=NEU',
    session: {[KEY]: JSON.stringify(alt)},
    consent: true,
  });

  assert.deepEqual(
    buffered.params,
    [['gclid', 'NEU']],
    'ein Record MIT Params muss weiterhin ueberschreiben',
  );
});
