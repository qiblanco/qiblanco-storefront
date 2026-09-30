// Einwilligung in die Bewertungsanfrage am Kasse-Knopf (E1,
// Job 20261001-aiceo-s08-i-checkout-optin-bewertung).
// Stil wie test/cart-herkunfts-marker.test.mjs: node:test/node:assert, KEIN
// Netz, die Route wird WIRKLICH ausgeführt (nicht ihr Quelltext gelesen).
// Ausführen: node --test test/bewertungsanfrage-optin.test.mjs
//
// WAS DIESE DATEI FESTNAGELT: an der Order muss "ja", "nein" und "nie
// gefragt" unterscheidbar ankommen. Genau diese Unterscheidung ist es, an der
// postkauf-manager/src/review_anstoss.py entscheidet, wer überhaupt eine
// Bewertungsanfrage bekommen darf. Ein "nein", das in Wahrheit "nie gefragt"
// war, wäre eine erfundene Erklärung; ein "ja" ohne Haken wäre schlimmer.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs|ts|tsx)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
  load(url, kontext, naechster) {
    // Die Route ist .jsx ohne JSX-Syntax; Node braucht das Format genannt.
    if (url.endsWith('.jsx')) {
      return {
        format: 'module',
        shortCircuit: true,
        source: readFileSync(fileURLToPath(url), 'utf8'),
      };
    }
    return naechster(url, kontext);
  },
});

const {action: attributionAction} = await import('../app/routes/cart.attribution.jsx');
const {persistAttributionOnCartResult} = await import(
  '../app/lib/cart-attribution.server.js'
);
const {
  BEWERTUNGSANFRAGE_ANGEZEIGT_FELD,
  BEWERTUNGSANFRAGE_FELD,
  BEWERTUNGSANFRAGE_KEY,
  BEWERTUNGSANFRAGE_TEXT,
  BEWERTUNGSANFRAGE_TEXT_KEY,
  BEWERTUNGSANFRAGE_VERSION,
  BEWERTUNGSANFRAGE_ZEIT_KEY,
  WORTLAUTE,
} = await import('../app/lib/bewertungsanfrage.js');

const OPTIN_KEYS = [
  BEWERTUNGSANFRAGE_KEY,
  BEWERTUNGSANFRAGE_TEXT_KEY,
  BEWERTUNGSANFRAGE_ZEIT_KEY,
];
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
// Absichtlich OHNE Marketing-Zustimmung: die Einwilligung ist kein Tracking
// und muss auch ohne Cookie-Consent ankommen.
const COOKIE_CONSENT_NEIN = 'CookieConsent={stamp:%27x%27,marketing:false}';

function cartAttrappe(bestand = []) {
  const spur = {updateAttributes: null, aufrufe: 0};
  return {
    spur,
    cart: {
      get: async () => ({
        id: 'gid://cart/1',
        checkoutUrl: 'https://checkout.qiblanco.com/c/1',
        attributes: bestand,
      }),
      updateAttributes: async (attributes) => {
        spur.updateAttributes = attributes;
        spur.aufrufe += 1;
        return {
          cart: {id: 'gid://cart/1', checkoutUrl: 'https://checkout.qiblanco.com/c/1', attributes},
        };
      },
      setCartId: () => new Headers(),
    },
  };
}

function kassenAnfrage(felder) {
  const kopf = new Headers({'User-Agent': UA, Cookie: COOKIE_CONSENT_NEIN});
  const körper = new FormData();
  for (const [k, v] of Object.entries(felder)) körper.set(k, v);
  return new Request('https://qiblanco.com/cart/attribution', {
    method: 'POST',
    headers: kopf,
    body: körper,
  });
}

async function kasse(felder, bestand = []) {
  const {spur, cart} = cartAttrappe(bestand);
  const antwort = await attributionAction({
    request: kassenAnfrage(felder),
    context: {cart, env: {}},
  });
  const m = new Map((spur.updateAttributes ?? bestand).map((a) => [a.key, a.value]));
  return {m, spur, antwort};
}

const GEZEIGT = {[BEWERTUNGSANFRAGE_ANGEZEIGT_FELD]: BEWERTUNGSANFRAGE_VERSION};

test('OPT-1 Haken gesetzt -> ja, Wortlaut-Version und Zeitpunkt, ohne Cookie-Consent', async () => {
  const {m, antwort} = await kasse({...GEZEIGT, [BEWERTUNGSANFRAGE_FELD]: 'ja'});
  assert.equal(m.get(BEWERTUNGSANFRAGE_KEY), 'ja', 'OPT-1 Wert');
  assert.equal(m.get(BEWERTUNGSANFRAGE_TEXT_KEY), 'v1', 'OPT-1 Version');
  assert.ok(
    !Number.isNaN(Date.parse(m.get(BEWERTUNGSANFRAGE_ZEIT_KEY) ?? '')),
    'OPT-1 Zeitpunkt ist kein ISO-Datum',
  );
  // Der Weg zur Kasse bleibt derselbe.
  assert.equal(antwort.status, 302, 'OPT-1 Weiterleitung');
  assert.match(antwort.headers.get('Location') ?? '', /^https:\/\/checkout\.qiblanco\.com\//);
});

test('OPT-2 Frage gezeigt, kein Haken -> nein (die leere Checkbox schickt der Browser nicht)', async () => {
  const {m} = await kasse({...GEZEIGT});
  assert.equal(m.get(BEWERTUNGSANFRAGE_KEY), 'nein', 'OPT-2');
});

test('OPT-3 Frage NICHT gezeigt -> gar kein Schlüssel, nie ein erfundenes nein', async () => {
  const {m} = await kasse({ad_params_seen: 'no'});
  for (const key of OPTIN_KEYS) {
    assert.equal(m.has(key), false, `OPT-3: ${key} ohne gestellte Frage geschrieben`);
  }
});

test('OPT-4 ein Haken ohne das Angezeigt-Feld zählt nicht (nur eine gestellte Frage hat eine Antwort)', async () => {
  const {m} = await kasse({[BEWERTUNGSANFRAGE_FELD]: 'ja'});
  assert.equal(m.has(BEWERTUNGSANFRAGE_KEY), false, 'OPT-4');
});

test('OPT-5 unbekannte Wortlaut-Version -> kein Schlüssel (kein Nachweis ohne Text)', async () => {
  const {m} = await kasse({
    [BEWERTUNGSANFRAGE_ANGEZEIGT_FELD]: 'v999',
    [BEWERTUNGSANFRAGE_FELD]: 'ja',
  });
  assert.equal(m.has(BEWERTUNGSANFRAGE_KEY), false, 'OPT-5');
});

test('OPT-6 ein anderer Wert als "ja" im Haken-Feld ist kein ja', async () => {
  const {m} = await kasse({...GEZEIGT, [BEWERTUNGSANFRAGE_FELD]: 'on'});
  assert.equal(m.get(BEWERTUNGSANFRAGE_KEY), 'nein', 'OPT-6');
});

test('OPT-7 gleiche Antwort beim zweiten Klick: Zeitpunkt der ersten Erklärung bleibt', async () => {
  const bestand = [
    {key: BEWERTUNGSANFRAGE_KEY, value: 'ja'},
    {key: BEWERTUNGSANFRAGE_TEXT_KEY, value: 'v1'},
    {key: BEWERTUNGSANFRAGE_ZEIT_KEY, value: '2026-09-01T10:00:00.000Z'},
  ];
  const {m} = await kasse({...GEZEIGT, [BEWERTUNGSANFRAGE_FELD]: 'ja'}, bestand);
  assert.equal(m.get(BEWERTUNGSANFRAGE_ZEIT_KEY), '2026-09-01T10:00:00.000Z', 'OPT-7');
});

test('OPT-8 Haken wieder entfernt: die letzte Erklärung gilt, mit neuem Zeitpunkt', async () => {
  const bestand = [
    {key: BEWERTUNGSANFRAGE_KEY, value: 'ja'},
    {key: BEWERTUNGSANFRAGE_TEXT_KEY, value: 'v1'},
    {key: BEWERTUNGSANFRAGE_ZEIT_KEY, value: '2026-09-01T10:00:00.000Z'},
  ];
  const {m} = await kasse({...GEZEIGT}, bestand);
  assert.equal(m.get(BEWERTUNGSANFRAGE_KEY), 'nein', 'OPT-8 Wert');
  assert.notEqual(m.get(BEWERTUNGSANFRAGE_ZEIT_KEY), '2026-09-01T10:00:00.000Z', 'OPT-8 Zeit');
});

test('OPT-9 das Formular wird einmal gelesen: der Ankunfts-Marker kommt weiter an', async () => {
  const {m} = await kasse({...GEZEIGT, [BEWERTUNGSANFRAGE_FELD]: 'ja', ad_params_seen: 'yes'});
  assert.equal(m.get('ad_params_seen'), 'yes_client', 'OPT-9 Ankunfts-Marker verloren');
  assert.equal(m.get(BEWERTUNGSANFRAGE_KEY), 'ja', 'OPT-9 Einwilligung verloren');
});

test('OPT-10 die übrigen Cart-Eintrittspunkte schreiben NIE eine Einwilligung', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: new Request('https://qiblanco.com/cart', {headers: {'User-Agent': UA}}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  const keys = (spur.updateAttributes ?? []).map((a) => a.key);
  for (const key of OPTIN_KEYS) {
    assert.equal(keys.includes(key), false, `OPT-10: ${key} ausserhalb der Kasse geschrieben`);
  }
});

test('OPT-11 die Checkbox im Kasse-Formular ist separat, unvorausgefüllt und nicht Pflicht', () => {
  const quelle = readFileSync(
    fileURLToPath(new URL('../app/components/CartSummary.jsx', import.meta.url)),
    'utf8',
  );
  const label = quelle.match(/<label className="cart-bewertung-optin">([\s\S]*?)<\/label>/);
  assert.ok(label, 'OPT-11: das Label der Einwilligung fehlt im Kasse-Formular');
  const box = label[1].match(/<input[^>]*type="checkbox"[^>]*\/>/);
  assert.ok(box, 'OPT-11: keine Checkbox im Label');
  assert.match(box[0], /name=\{BEWERTUNGSANFRAGE_FELD\}/, 'OPT-11 Feldname');
  assert.match(box[0], /value="ja"/, 'OPT-11 Wert');
  for (const verboten of ['checked', 'defaultChecked', 'required']) {
    assert.equal(
      new RegExp(`\\b${verboten}\\b`).test(box[0]),
      false,
      `OPT-11: Checkbox trägt "${verboten}" — vorausgefüllt oder an den Kauf gekoppelt`,
    );
  }
  assert.match(
    quelle,
    /name=\{BEWERTUNGSANFRAGE_ANGEZEIGT_FELD\}[\s\S]{0,80}value=\{BEWERTUNGSANFRAGE_VERSION\}/,
    'OPT-11: das Angezeigt-Feld fehlt — "nie gesehen" wäre von "nein" nicht zu trennen',
  );
  // Der Knopf darf nie am Haken hängen.
  assert.equal(/disabled=\{/.test(quelle), false, 'OPT-11: Kasse-Knopf ist abschaltbar');
});

test('OPT-12 der gezeigte Text ist der versionierte Wortlaut und nennt Zweck und Abmeldung', () => {
  assert.equal(BEWERTUNGSANFRAGE_TEXT, WORTLAUTE[BEWERTUNGSANFRAGE_VERSION], 'OPT-12');
  assert.match(BEWERTUNGSANFRAGE_TEXT, /Bewertung/, 'OPT-12 Zweck');
  assert.match(BEWERTUNGSANFRAGE_TEXT, /E-Mail/, 'OPT-12 Kanal');
  assert.match(BEWERTUNGSANFRAGE_TEXT, /abbestellbar/, 'OPT-12 Abmeldung');
});
