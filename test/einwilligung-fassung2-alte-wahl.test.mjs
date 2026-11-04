// Einwilligung nach Fassung 2.0: die alte Wahl und das Ton-Fenster der Qi-Alpha-Seite
// (Job einwilligung-fassung2-alte-wahl-und-alpha-ton-20261103, Folgeauftrag aus
// einwilligung-scanner-20261023T144303Z-s04).
// Ausfuehren: node --test test/einwilligung-fassung2-alte-wahl.test.mjs
//
// Seit Fassung 2.0 (PR #1308) fragt der eigene Hinweis jeden Besucher mit einer Wahl
// der Fassung 1 neu (Cookiebot-Cookie ohne qbv oder qbv '1.x'): public/qb-einwilligung.js
// leseCookie verwirft sie, der Banner steht wieder unten, window.Cookiebot.hasResponse
// ist false. Zwei Stellen kannten die Regel nicht:
//   A. die Server-Leser (checkout-tracking, consent-policy, go-router) lasen die alte
//      Wahl weiter als Zustimmung — der Browser hielt sie für offen;
//   B. das Ton-Fenster (TheAlphaTon.jsx) ging sofort auf, während der Hinweis stand.
// Teil B führt den echten Quelltext der Komponente aus (Ausschnitt per vm), mit
// nachgebautem window/document, damit die Probe am Verhalten misst und nicht an Literalen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
});

const {
  consentStateFromCookies,
  hasCookiebotMarketingConsent,
  hasCookiebotMarketingDeclined,
} = await import('../app/lib/checkout-tracking.js');
const {hasRegionAwareTrackingPermission} = await import('../app/lib/consent-policy.js');
const {hatMarketingConsent} = await import('../app/lib/go-router-logic.js');

const JAHR_MS = 365 * 24 * 60 * 60 * 1000;

// Wie public/qb-einwilligung.js schreibeCookie (Fassung 2) bzw. Cookiebot (ohne qbv).
function cookie({marketing = true, qbv = '2.0', utc = Date.now()} = {}) {
  const wert =
    "{stamp:'einwilligungFassung2Test==',necessary:true,preferences:true,statistics:true," +
    `marketing:${marketing},method:'explicit',ver:1,utc:${utc},region:'de'` +
    (qbv ? `,qbv:'${qbv}'}` : '}');
  return 'CookieConsent=' + wert.replace(/'/g, '%27').replace(/,/g, '%2C');
}

const anfrage = (cookieHeader) =>
  new Request('https://qiblanco.com/products/qione-2-pro', {
    headers: {Cookie: cookieHeader, 'oxygen-buyer-country': 'DE'},
  });

test('A1 Fassung 2.0 mit Marketing: alle Server-Leser sagen ja', () => {
  const c = cookie();
  assert.equal(hasCookiebotMarketingConsent(c), true);
  assert.equal(consentStateFromCookies(c), 'granted');
  assert.equal(hasRegionAwareTrackingPermission(anfrage(c), {}), true);
  assert.equal(hatMarketingConsent(c), true);
});

for (const [name, c] of [
  ['Cookiebot-Cookie ohne qbv', cookie({qbv: ''})],
  ["qbv '1.0'", cookie({qbv: '1.0'})],
  ["qbv '1.9'", cookie({qbv: '1.9'})],
  ['Fassung 2.0, älter als 12 Monate', cookie({utc: Date.now() - JAHR_MS - 60_000})],
]) {
  test(`A2 alte Wahl (${name}): keine Zustimmung, bis neu gewählt ist`, () => {
    assert.equal(hasCookiebotMarketingConsent(c), false);
    assert.equal(consentStateFromCookies(c), 'unknown');
    assert.equal(hasRegionAwareTrackingPermission(anfrage(c), {}), false);
    assert.equal(hatMarketingConsent(c), false);
  });
}

test('A3 eine Ablehnung bleibt in jeder Fassung eine Ablehnung (nie gegen erklärten Willen)', () => {
  for (const c of [cookie({marketing: false}), cookie({marketing: false, qbv: ''})]) {
    assert.equal(hasCookiebotMarketingConsent(c), false);
    assert.equal(hasCookiebotMarketingDeclined(c), true);
    assert.equal(consentStateFromCookies(c), 'denied');
    // optout-Region nach Env-Flip: die alte Ablehnung hält weiter.
    const us = new Request('https://qiblanco.com/', {
      headers: {Cookie: c, 'oxygen-buyer-country': 'US'},
    });
    assert.equal(
      hasRegionAwareTrackingPermission(us, {PUBLIC_CONSENT_STRICT_REGIONS: 'DE'}),
      false,
    );
  }
});

test('A5 zwei CookieConsent-Cookies (verschiedene Domains): der Server liest das erste, wie der Hinweis', () => {
  const nein = cookie({marketing: false});
  const ja = cookie();
  // Erst die Ablehnung: der Hinweis zeigt "abgelehnt", der Server darf nicht "ja" sagen.
  assert.equal(hasCookiebotMarketingConsent(nein + '; ' + ja), false);
  assert.equal(hasCookiebotMarketingDeclined(nein + '; ' + ja), true);
  assert.equal(hatMarketingConsent(nein + '; ' + ja), false);
  // Erst eine alte Wahl der Fassung 1: offen, keine Zustimmung.
  assert.equal(hasCookiebotMarketingConsent(cookie({qbv: ''}) + '; ' + ja), false);
  // Erst die gültige Zustimmung: ja, und keine Ablehnung.
  assert.equal(hasCookiebotMarketingConsent(ja + '; ' + nein), true);
  assert.equal(hasCookiebotMarketingDeclined(ja + '; ' + nein), false);
});

test('A6 doppelt kodiertes qbv wird wie im Browser nur einmal dekodiert', () => {
  const c = cookie().replace('qbv:%272.0%27', 'qbv:%25272.0%2527');
  assert.notEqual(c, cookie(), 'Fixtur nicht umgebaut');
  assert.equal(hasCookiebotMarketingConsent(c), false);
});

test('A4 Motor cookiebot (Rückweg): Cookiebot prüft selbst, Lesart wie vor Fassung 2.0', () => {
  const c = cookie({qbv: ''}) + '; qb_einwilligung_motor=cookiebot';
  assert.equal(hasCookiebotMarketingConsent(c), true);
  assert.equal(consentStateFromCookies(c), 'granted');
  assert.equal(hatMarketingConsent(c), true);
});

// ---------------------------------------------------------------------------
// Teil B: das Ton-Fenster wartet auf den Hinweis
// ---------------------------------------------------------------------------
const QUELLE = readFileSync(
  new URL('../app/components/campaign/TheAlphaTon.jsx', import.meta.url),
  'utf8',
);
const anfang = QUELLE.indexOf('const NACH_HINWEIS_MS');
const ende = QUELLE.indexOf('function lies()');
assert.ok(anfang > 0 && ende > anfang, 'Ausschnitt nachEinwilligung in TheAlphaTon.jsx nicht gefunden');
const AUSSCHNITT =
  QUELLE.slice(anfang, ende) +
  '\nglobalThis.__ton = {nachEinwilligung};\n';

function welt({cookie: cookieWert = '', banner = 'sichtbar', dialog = 'zu', cookiebot} = {}) {
  let uhr = 0;
  let naechsteId = 1;
  const timer = new Map();
  const hoerer = new Map();
  const element = (zustand) => ({zustand});
  const elemente = {
    'qb-einwilligung': banner ? element(banner) : null,
    'qb-einwilligung-dialog': element(dialog === 'offen' ? 'sichtbar' : 'verborgen'),
  };
  const sichtbar = (el) => el.zustand === 'sichtbar';
  const fenster = {
    setTimeout(fn, ms) {
      const id = naechsteId++;
      timer.set(id, {fn, um: uhr + ms});
      return id;
    },
    clearTimeout(id) {
      timer.delete(id);
    },
    addEventListener(n, fn) {
      if (!hoerer.has(n)) hoerer.set(n, new Set());
      hoerer.get(n).add(fn);
    },
    removeEventListener(n, fn) {
      hoerer.get(n)?.delete(fn);
    },
    getComputedStyle: (el) => ({
      display: sichtbar(el) ? 'block' : 'none',
      visibility: 'visible',
    }),
    Cookiebot: cookiebot,
  };
  fenster.document = {
    cookie: cookieWert,
    getElementById: (id) => {
      const el = elemente[id];
      if (!el) return null;
      return {
        getBoundingClientRect: () =>
          sichtbar(el) ? {width: 390, height: 120} : {width: 0, height: 0},
        _el: el,
      };
    },
  };
  // getComputedStyle bekommt das Objekt aus getElementById.
  const roh = fenster.getComputedStyle;
  fenster.getComputedStyle = (h) => roh(h._el);
  fenster.window = fenster;
  const ctx = vm.createContext(fenster);
  vm.runInContext(AUSSCHNITT, ctx);
  return {
    ton: ctx.__ton,
    fenster,
    elemente,
    vergehe(ms) {
      const ziel = uhr + ms;
      for (;;) {
        const faellig = [...timer.entries()]
          .filter(([, t]) => t.um <= ziel)
          .sort((a, b) => a[1].um - b[1].um)[0];
        if (!faellig) break;
        timer.delete(faellig[0]);
        uhr = faellig[1].um;
        faellig[1].fn();
      }
      uhr = ziel;
    },
    feuere(n) {
      for (const fn of [...(hoerer.get(n) || [])]) fn();
    },
  };
}

test('B1 Bestandsbesucher mit Wahl der Fassung 1: Fenster wartet, bis der Hinweis zu ist', () => {
  const w = welt({cookie: cookie({qbv: ''}), cookiebot: {hasResponse: false}});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  assert.equal(auf, 0, 'Fenster ging sofort auf, während #qb-einwilligung unten steht');
  w.vergehe(15_000);
  assert.equal(auf, 0, 'Fenster ging nach Ablauf der Notfrist auf, obwohl der Hinweis steht');
  // Besucher wählt neu: der Hinweis setzt hasResponse, versteckt sich, feuert Accept.
  w.fenster.Cookiebot.hasResponse = true;
  w.elemente['qb-einwilligung'].zustand = 'verborgen';
  w.feuere('CookiebotOnConsentReady');
  w.feuere('CookiebotOnAccept');
  w.vergehe(1_000);
  assert.equal(auf, 1, 'nach der neuen Wahl muss das Fenster genau einmal aufgehen');
});

test('B1b Wahl innerhalb der Notfrist: das Fenster kommt über das Ereignis nach 400 ms, nicht erst über die Abfrage', () => {
  const w = welt({cookie: cookie({qbv: ''}), cookiebot: {hasResponse: false}});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(1_000);
  // Ein Ereignis ohne Antwort (hasResponse false) öffnet nichts.
  w.feuere('CookiebotOnConsentReady');
  w.vergehe(1_000);
  assert.equal(auf, 0, 'Ereignis ohne gültige Antwort darf das Fenster nicht öffnen');
  w.fenster.Cookiebot.hasResponse = true;
  w.elemente['qb-einwilligung'].zustand = 'verborgen';
  w.feuere('CookiebotOnAccept');
  w.vergehe(300);
  assert.equal(auf, 0, 'Atempause NACH_HINWEIS_MS fehlt');
  w.vergehe(200);
  assert.equal(auf, 1, 'nach der Wahl in den ersten 5 s muss das Fenster binnen 500 ms aufgehen');
});

test('B2 Hinweis-Skript lädt spät, altes Cookie: der sichtbare Banner hält das Fenster', () => {
  const w = welt({cookie: cookie({qbv: '1.0'}), cookiebot: undefined});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(1_000);
  w.fenster.Cookiebot = {hasResponse: false}; // qb-einwilligung.js ist da
  w.vergehe(15_000);
  assert.equal(auf, 0);
});

test('B7 Hinweis-Skript lädt nie (Banner steht tot im Server-HTML): nach der Notfrist trotzdem auf', () => {
  const w = welt({cookie: cookie({qbv: '1.0'}), cookiebot: undefined});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(4_000);
  assert.equal(auf, 0);
  w.vergehe(2_000);
  assert.equal(auf, 1);
});

test('B8 Motor cookiebot vor uc.js: window.Cookiebot ist das <script id="Cookiebot">, gültiges Cookie zählt', () => {
  const skript = {tagName: 'SCRIPT', id: 'Cookiebot'}; // benannter Zugriff, kein hasResponse
  const w = welt({cookie: cookie({qbv: ''}), banner: null, cookiebot: skript});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  assert.equal(auf, 1, 'Bestandsbesucher im Rückweg-Motor: Fenster sofort wie vor Fassung 2.0');
});

test('B3 Erstbesuch ohne Cookie: das Fenster wartet auch nach der Notfrist', () => {
  const w = welt({cookiebot: {hasResponse: false}});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(15_000);
  assert.equal(auf, 0);
});

test('B4 Einstellungs-Dialog offen (Banner verborgen): das Fenster wartet', () => {
  const w = welt({banner: 'verborgen', dialog: 'offen', cookiebot: {hasResponse: false}});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(15_000);
  assert.equal(auf, 0);
});

test('B5 gültige Wahl der Fassung 2.0, Hinweis zu: das Fenster geht sofort auf (Positiv-Kontrolle)', () => {
  const w = welt({cookie: cookie(), banner: 'verborgen', cookiebot: {hasResponse: true}});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  assert.equal(auf, 1);
});

test('B6 Hinweis-Skript blockiert (kein Banner, kein Cookiebot): nach der Notfrist trotzdem auf', () => {
  const w = welt({banner: null, cookiebot: undefined});
  let auf = 0;
  w.ton.nachEinwilligung(() => auf++);
  w.vergehe(4_000);
  assert.equal(auf, 0);
  w.vergehe(2_000);
  assert.equal(auf, 1);
});

// ---------------------------------------------------------------------------
// Teil C: Parität mit dem echten Hinweis (public/qb-einwilligung.js per vm)
// ---------------------------------------------------------------------------
// Teil A prüft gegen eigene Sollwerte. Hier urteilt das ausgelieferte Skript selbst,
// und der Server muss für denselben Cookie-Kopf dasselbe sagen.
const HINWEIS_SKRIPT = readFileSync(new URL('../public/qb-einwilligung.js', import.meta.url), 'utf8');
const {EINWILLIGUNG_FASSUNG} = await import('../app/lib/einwilligung-texte.js');

function browserUrteil(cookieKopf) {
  const banner = {getAttribute: (n) => (n === 'data-qb-fassung' ? EINWILLIGUNG_FASSUNG : null)};
  const w = {
    setTimeout: () => 0,
    addEventListener: () => {},
    dispatchEvent: () => true,
    crypto: {randomUUID: () => 'test-uuid'},
  };
  w.document = {
    cookie: cookieKopf,
    readyState: 'complete',
    currentScript: null,
    documentElement: {getAttribute: () => '', setAttribute: () => {}, removeAttribute: () => {}, style: {setProperty: () => {}}},
    getElementById: (id) => (id === 'qb-einwilligung' ? banner : null),
    addEventListener: () => {},
  };
  w.window = w;
  const ctx = vm.createContext(w);
  vm.runInContext(HINWEIS_SKRIPT, ctx);
  return Boolean(ctx.Cookiebot.hasResponse && ctx.Cookiebot.consent.marketing);
}

test('C1 Server und ausgelieferter Hinweis urteilen für jeden Cookie-Stand gleich', () => {
  const ja = cookie();
  const nein = cookie({marketing: false});
  const staende = {
    'ohne': '',
    'Fassung 2 ja': ja,
    'Fassung 2 nein': nein,
    'Fassung 1 ohne qbv ja': cookie({qbv: ''}),
    "qbv '1.0' ja": cookie({qbv: '1.0'}),
    'Fassung 2 ja, älter als 12 Monate': cookie({utc: Date.now() - JAHR_MS - 60_000}),
    "qbv '10.0' ja": cookie({qbv: '10.0'}),
    'zwei Cookies: nein, dann ja': nein + '; ' + ja,
    'zwei Cookies: ja, dann nein': ja + '; ' + nein,
    'zwei Cookies: Fassung 1, dann Fassung 2': cookie({qbv: ''}) + '; ' + ja,
    'doppelt kodiertes qbv': ja.replace('qbv:%272.0%27', 'qbv:%25272.0%2527'),
    'anderes Cookie davor': 'qb_lp_hist=A; ' + ja,
  };
  // Positiv-Kontrolle: der Hinweis sagt bei der gültigen Wahl wirklich ja.
  assert.equal(browserUrteil(ja), true, 'Hinweis-Nachbau misst nichts');
  for (const [name, kopf] of Object.entries(staende)) {
    assert.equal(hasCookiebotMarketingConsent(kopf), browserUrteil(kopf), `Naht reißt: ${name}`);
  }
});
