/**
 * Wächter: geteilte Zahlung am Qi Alpha (node --test, ohne Bundler) —
 * Grossjob 20261027-qi-alpha-geteilte-zahlung-10000-raten-rest-sofort, s03.
 * Christian 27.10.2026 Z3: „zahle jetzt sofort … und eben 10.000 Euro bequem
 * in Raten. Also abhängig davon, was er ausgewählt hat.“
 *
 * Gemessen werden die Aufteilungsrechnung, der Schritt-1-Link, die
 * Warenkorb-Merkmale aus der Adresse, die Rabattcode-Liste und die NAHT zum
 * Wächter-Vertrag (qi-alpha-teilzahlung/config/vertrag.json): Variante,
 * Betrag, Märkte und Merkmalsnamen der Seite sind die des Vertrags.
 * ROT VOR GRÜN: auf origin/main d9860fb7 fehlt app/lib/qi-alpha-teilzahlung.js
 * (Import scheitert, alle Tests rot).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {registerHooks} from 'node:module';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const tz = await import(join(WURZEL, 'app/lib/qi-alpha-teilzahlung.js'));
const VERTRAG_PFAD =
  process.env.QA_VERTRAG ||
  '/srv/openclaw/shared-state/qi-alpha-teilzahlung/config/vertrag.json';

test('Aufteilung: Summe minus 10.000 sofort, 10.000 in Raten (DE und AT, EUR)', () => {
  assert.deepEqual(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'DE'}), {
    gesamt: 15518,
    raten: 10000,
    sofort: 5518,
  });
  assert.deepEqual(tz.aufteilung({summe: 10639, waehrung: 'EUR', land: 'AT'}), {
    gesamt: 10639,
    raten: 10000,
    sofort: 639,
  });
});

test('Aufteilung: Cents bleiben centgenau, kein Gleitkomma-Rest', () => {
  const a = tz.aufteilung({summe: 12660.41, waehrung: 'EUR', land: 'AT'});
  assert.equal(a.sofort, 2660.41);
  const b = tz.aufteilung({summe: 10000.1, waehrung: 'EUR', land: 'DE'});
  assert.equal(b.sofort, 0.1);
});

test('Aufteilung: bis 10.000 € gibt es keine (normaler Ratenweg)', () => {
  assert.equal(tz.aufteilung({summe: 10000, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: 9999, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: 0, waehrung: 'EUR', land: 'DE'}), null);
  assert.equal(tz.aufteilung({summe: NaN, waehrung: 'EUR', land: 'DE'}), null);
});

test('Aufteilung: nur EUR-Markt DE/AT, nie CHF, USD oder ein anderes EUR-Land', () => {
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'CHF', land: 'CH'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'USD', land: 'US'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'CH'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'EUR', land: 'NL'}), null);
  assert.equal(tz.aufteilung({summe: 15518, waehrung: 'CHF', land: 'DE'}), null);
  assert.equal(tz.ratenMarkt({waehrung: 'EUR', land: 'DE'}), true);
  assert.equal(tz.ratenMarkt({waehrung: 'CHF', land: 'CH'}), false);
});

test('Konfig: Format des Vertrags, Varianten als Ziffern aus der GID', () => {
  assert.equal(
    tz.konfigText({
      qiAlpha: 'gid://shopify/ProductVariant/62077673767180',
      nummer: 'gid://shopify/ProductVariant/65965789577484',
      kette: null,
    }),
    'qi-alpha=62077673767180;nummer=65965789577484;kette=-;partner=-',
  );
  assert.equal(
    tz.konfigText({qiAlpha: '1', nummer: null, kette: 'gid://shopify/ProductVariant/7', partner: 'LEVELUP5'}),
    'qi-alpha=1;nummer=-;kette=7;partner=LEVELUP5',
  );
});

test('Schritt-1-Link: genau die Ratenanteil-Variante, Menge 1, beide Merkmale', () => {
  const link = tz.teil1Link({
    vorgang: 'qa-abc123-x7k2',
    konfig: 'qi-alpha=1;nummer=-;kette=-;partner=-',
  });
  const u = new URL(link, 'https://qiblanco.com');
  assert.equal(u.pathname, `/cart/${tz.TEILZAHLUNG.variante}:1`);
  assert.equal(u.searchParams.get('_qa_vorgang'), 'qa-abc123-x7k2');
  assert.equal(u.searchParams.get('_qa_konfig'), 'qi-alpha=1;nummer=-;kette=-;partner=-');
  assert.equal(u.searchParams.get('discount'), null);
});

test('Vorgangskennung: Form, die merkmaleAusQuery annimmt', () => {
  const v = tz.vorgangsKennung(() => 0.5, 1761638400000);
  assert.match(v, /^qa-[a-z0-9]+-[a-z0-9]{4}$/);
  const zwei = tz.vorgangsKennung(() => 0.25, 1761638400000);
  assert.notEqual(v, zwei);
});

test('Merkmale aus der Adresse: nur die zwei Vertragsschlüssel, geprüft und gekappt', () => {
  const q = new URLSearchParams({
    _qa_vorgang: 'qa-abc123-x7k2',
    _qa_konfig: 'qi-alpha=1;nummer=2;kette=-;partner=-',
    _fremd: 'boese',
    _qpx_anon: 'nicht-aus-der-adresse',
  });
  assert.deepEqual(tz.merkmaleAusQuery(q), [
    {key: '_qa_vorgang', value: 'qa-abc123-x7k2'},
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=2;kette=-;partner=-'},
  ]);
  // Ungültige Form fällt weg (nicht gekürzt, nicht repariert).
  assert.deepEqual(
    tz.merkmaleAusQuery(new URLSearchParams({_qa_vorgang: 'a b<script>', _qa_konfig: 'x'.repeat(500)})),
    [],
  );
  assert.deepEqual(
    tz.merkmaleAusQuery(new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=2;kette=-;partner=-;extra=1'})),
    [],
  );
  assert.deepEqual(tz.merkmaleAusQuery(new URLSearchParams('')), []);
});

test('Merkmale: Partnercode der Sitzung ersetzt partner=-, ein gesetzter bleibt', () => {
  const q = new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=-;kette=-;partner=-'});
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['LEVELUP5']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=LEVELUP5'},
  ]);
  // Ein QA-REST-Anrechnungscode ist kein Partnercode.
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['QA-REST-1001-AB12', 'PARTNER5']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=PARTNER5'},
  ]);
  assert.deepEqual(tz.merkmaleAusQuery(q, {sitzungsCodes: ['mit leer']}), [
    {key: '_qa_konfig', value: 'qi-alpha=1;nummer=-;kette=-;partner=-'},
  ]);
  const gesetzt = new URLSearchParams({_qa_konfig: 'qi-alpha=1;nummer=-;kette=-;partner=DNX'});
  assert.equal(tz.merkmaleAusQuery(gesetzt, {sitzungsCodes: ['LEVELUP5']})[0].value.endsWith('partner=DNX'), true);
});

test('Rabattcodes: Komma-Liste wird zu mehreren Codes, ein Code bleibt einer', () => {
  assert.deepEqual(tz.rabattcodesAusQuery(new URLSearchParams('discount=HYDROBOARD')), ['HYDROBOARD']);
  assert.deepEqual(
    tz.rabattcodesAusQuery(new URLSearchParams('discount=QA-REST-1001-AB12,LEVELUP5')),
    ['QA-REST-1001-AB12', 'LEVELUP5'],
  );
  assert.deepEqual(
    tz.rabattcodesAusQuery(new URLSearchParams('discount= A , ,A,B,C,D,E,F')),
    ['A', 'B', 'C', 'D', 'E'],
  );
  assert.deepEqual(tz.rabattcodesAusQuery(new URLSearchParams('')), []);
});

test('Teil-1-Warenkorb nur in DE/AT, andere Permalinks überall', () => {
  const anteil = `gid://shopify/ProductVariant/${tz.TEILZAHLUNG.variante}`;
  assert.equal(tz.teil1Erlaubt({varianten: [anteil], land: 'DE'}), true);
  assert.equal(tz.teil1Erlaubt({varianten: [anteil], land: 'AT'}), true);
  assert.equal(tz.teil1Erlaubt({varianten: [anteil], land: 'CH'}), false);
  assert.equal(tz.teil1Erlaubt({varianten: [anteil], land: 'US'}), false);
  assert.equal(tz.teil1Erlaubt({varianten: ['gid://shopify/ProductVariant/1'], land: 'US'}), true);
});

test('Teil-1-Sperre ist nicht per Schreibweise umgehbar (Gegenpruefer 28.10.: /cart/0<Variante>:1?markt=CH legte 9.428 CHF an)', () => {
  const v = tz.TEILZAHLUNG.variante;
  // Shopify liest die führenden Ziffern (gemessen 28.10. live, CH: 0<v>, <v>e0
  // und <v>abc legten je einen Ratenanteil-Warenkorb zu 9.427 CHF an).
  for (const roh of [`0${v}`, `000${v}`, ` ${v}`, `${v} `, `+${v}`, `${v}e0`, `${v}abc`, `${v}.0`, `0${v}e5`]) {
    const gid = `gid://shopify/ProductVariant/${roh}`;
    assert.equal(tz.teil1Erlaubt({varianten: [gid], land: 'CH'}), false, roh);
    assert.equal(tz.teil1Erlaubt({varianten: [gid], land: undefined}), false, roh);
    assert.equal(tz.mitRatenanteil([gid]), true, roh);
  }
  assert.equal(tz.mitRatenanteil(['gid://shopify/ProductVariant/62077673767180']), false);
  assert.equal(tz.mitRatenanteil([`gid://shopify/ProductVariant/1${v}`]), false);
  assert.equal(tz.mitRatenanteil([`gid://shopify/ProductVariant/${v}1`]), false);
});

test('Zweite Linie: außerhalb DE/AT zählt der angelegte Warenkorb, nicht die Schreibweise im Link', () => {
  const permalink = lies('app/routes/cart.$lines.jsx');
  const nachAnlage = permalink.slice(permalink.indexOf('const cartResult = result.cart'));
  assert.match(nachAnlage, /cart\.get\(/, 'nach cart.create muss der angelegte Warenkorb gelesen werden');
  assert.match(nachAnlage, /teil1Erlaubt\(/, 'die angelegten Zeilen laufen durch teil1Erlaubt');
  const sperre = nachAnlage.slice(0, nachAnlage.indexOf('cart.setCartId'));
  assert.match(sperre, /redirect\('\/products\/qi-alpha'\)/, 'Sperre vor dem Cookie, ohne Warenkorb-Kopf');
});

test('Merkmale _qa_* nur am Permalink mit Ratenanteil (Gegenpruefer 28.10.)', () => {
  const permalink = lies('app/routes/cart.$lines.jsx');
  assert.match(permalink, /mitRatenanteil\(/);
  const block = permalink.slice(permalink.indexOf('const mitTeilzahlung'), permalink.indexOf('let sitzungsCodes'));
  assert.match(block, /mitRatenanteil\(/, 'mitTeilzahlung muss den Ratenanteil im Link verlangen');
});

test('NAHT Vertrag: Variante, Betrag, Märkte und Merkmale der Seite = vertrag.json', () => {
  assert.ok(existsSync(VERTRAG_PFAD), `Vertrag fehlt: ${VERTRAG_PFAD}`);
  const v = JSON.parse(readFileSync(VERTRAG_PFAD, 'utf8'));
  assert.equal(tz.TEILZAHLUNG.variante, String(v.ratenanteil.variant_id));
  assert.equal(tz.TEILZAHLUNG.betrag, Number(v.ratenanteil.betrag_eur));
  assert.equal(tz.TEILZAHLUNG.waehrung, v.ratenanteil.waehrung);
  assert.deepEqual(tz.TEILZAHLUNG.maerkte, v.ratenanteil.maerkte);
  assert.deepEqual(tz.TEILZAHLUNG.merkmale, v.merkmale);
  // Die Form, die die Seite baut, liest der Wächter (parse_konfig) so.
  const k = tz.konfigText({qiAlpha: v.qi_alpha_standard_variante, nummer: null, kette: null});
  assert.equal(k.split(';').map((t) => t.split('=')[0]).join(';'), 'qi-alpha;nummer;kette;partner');
});

test('Verdrahtung: Seite zeigt Ratenzahlung statt Ratencode, cart.$lines liest Merkmale und Codes', () => {
  const seite = lies('app/components/campaign/TheAlphaShop.jsx');
  const daten = lies('app/components/campaign/the-alpha-shop-daten.js');
  assert.doesNotMatch(seite, /ratenMoeglich|RATEN\.ratenpreis|Code von Anna/);
  assert.doesNotMatch(daten, /ratenpreis: 9999/);
  assert.match(daten, /Zahle 10\.000\\u00a0€ der Gesamtsumme in Raten/);
  assert.match(seite, /TeilzahlungFenster/);
  const permalink = lies('app/routes/cart.$lines.jsx');
  assert.match(permalink, /merkmaleAusQuery\(/);
  assert.match(permalink, /rabattcodesAusQuery\(/);
  assert.match(permalink, /teil1Erlaubt\(/);
  const route = lies('app/routes/products.qi-alpha.jsx');
  assert.match(route, /qi-alpha-teilzahlung\.css\?url/);
});

// Verhalten der zweiten Linie am echten Loader (Attrappen-Kontext wie in
// test/cart-herkunfts-marker.test.mjs, ~/-Alias per registerHooks).
const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, weiter) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return weiter(/\.(js|jsx|mjs|ts|tsx)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return weiter(spez, kontext);
  },
  load(url, kontext, weiter) {
    if (url.endsWith('.jsx')) {
      return {format: 'module', shortCircuit: true, source: readFileSync(fileURLToPath(url), 'utf8')};
    }
    return weiter(url, kontext);
  },
});

async function permalink({land, angelegt, getWirft = false}) {
  const spur = {get: 0, setCartId: 0};
  const cart = {
    get: async () => {
      spur.get += 1;
      if (getWirft) throw new Error('Storefront-API nicht erreichbar');
      return {id: 'gid://cart/1', lines: {nodes: angelegt.map((id) => ({merchandise: {id}}))}};
    },
    create: async (e) => ({cart: {id: 'gid://cart/1', checkoutUrl: 'https://checkout.qiblanco.com/c/1', totalQuantity: 1, attributes: e.attributes ?? []}}),
    updateAttributes: async (attributes) => ({cart: {id: 'gid://cart/1', attributes}}),
    setCartId: () => {
      spur.setCartId += 1;
      return new Headers();
    },
  };
  const {loader} = await import('../app/routes/cart.$lines.jsx');
  let antwort;
  try {
    antwort = await loader({
      request: new Request('https://qiblanco.com/cart/41007289663544:1'),
      context: {cart, env: {}, storefront: {i18n: {country: land}}},
      params: {lines: '41007289663544:1'},
    });
  } catch (e) {
    antwort = e;
  }
  return {ort: antwort?.headers?.get?.('Location'), spur};
}

test('Zweite Linie (Verhalten): Shopify legt in CH den Ratenanteil an -> kein Cookie, zurück zur Kaufseite', async () => {
  const anteil = `gid://shopify/ProductVariant/${tz.TEILZAHLUNG.variante}`;
  const gesperrt = await permalink({land: 'CH', angelegt: [anteil]});
  assert.equal(gesperrt.ort, '/products/qi-alpha');
  assert.equal(gesperrt.spur.setCartId, 0, 'gesperrt wird ohne Warenkorb-Cookie');
  // Positiv-Kontrolle: anderer Artikel in CH geht zur Kasse.
  const frei = await permalink({land: 'CH', angelegt: ['gid://shopify/ProductVariant/41007289663544']});
  assert.match(frei.ort ?? '', /checkout\.qiblanco\.com/);
  // DE/AT: Ratenanteil geht zur Kasse, ohne den zusätzlichen Lesezugriff
  // (andere Bindungen lesen den Warenkorb auch, verglichen wird die Differenz).
  const de = await permalink({land: 'DE', angelegt: [anteil]});
  assert.match(de.ort ?? '', /checkout\.qiblanco\.com/);
  const deFrei = await permalink({land: 'DE', angelegt: ['gid://shopify/ProductVariant/41007289663544']});
  assert.equal(frei.spur.get - deFrei.spur.get, 1);
  // Lesefehler sperrt nicht (erste Linie hat den Link schon geprüft).
  const lesefehler = await permalink({land: 'CH', angelegt: [], getWirft: true});
  assert.match(lesefehler.ort ?? '', /checkout\.qiblanco\.com/);
});

// ---------------------------------------------------------------------------
// Storefront-Sperre für den Ratenanteil in POST /cart und Menge 1 im
// Permalink (Großjob 20261028-qi-alpha-teilzahlung-waechter-zweite-linie-v3,
// s02). Live am 29.10.2026 gemessen, Stand eb5f92c5: POST /cart?markt=CH legte
// den Ratenanteil an, DE :3 30.000 €, Permalink :2 und :1,0<R>:1 je 20.000 €.
// ROT VOR GRÜN: auf eb5f92c5 fehlen permalinkZeilen, ratenanteilKorrektur,
// ratenanteilPruefen und bindeRatenanteil.
const R_GID = `gid://shopify/ProductVariant/${tz.TEILZAHLUNG.variante}`;
const QI_GID = 'gid://shopify/ProductVariant/62077673767180';

test('Permalink-Zeilen: Ratenanteil höchstens einmal, Menge 1, andere Zeilen unverändert', () => {
  assert.deepEqual(tz.permalinkZeilen([{merchandiseId: R_GID, quantity: 2}]), [
    {merchandiseId: R_GID, quantity: 1},
  ]);
  const doppelt = tz.permalinkZeilen([
    {merchandiseId: R_GID, quantity: 1},
    {merchandiseId: QI_GID, quantity: 2},
    {merchandiseId: `gid://shopify/ProductVariant/0${tz.TEILZAHLUNG.variante}`, quantity: 1},
    {merchandiseId: `gid://shopify/ProductVariant/${tz.TEILZAHLUNG.variante}e0`, quantity: 5},
  ]);
  assert.deepEqual(doppelt, [
    {merchandiseId: R_GID, quantity: 1},
    {merchandiseId: QI_GID, quantity: 2},
  ]);
  // Menge 0/ungültig bleibt: dann entsteht wie bisher kein Warenkorb.
  assert.deepEqual(tz.permalinkZeilen([{merchandiseId: R_GID, quantity: 0}]), [
    {merchandiseId: R_GID, quantity: 0},
  ]);
});

test('Korrektur Permalink: außerhalb DE/AT fällt der Ratenanteil, in DE höchstens eine Zeile mit Menge 1', () => {
  const z = [
    {id: 'l1', quantity: 3, variantId: R_GID},
    {id: 'l3', quantity: 1, variantId: R_GID},
  ];
  const k = (laender, zeilen = z) => tz.ratenanteilKorrektur({zeilen, laender, permalink: true});
  assert.deepEqual(k(['DE', 'DE']), {entfernen: ['l3'], aendern: [{id: 'l1', quantity: 1}]});
  assert.deepEqual(k(['CH', 'CH']), {entfernen: ['l1', 'l3'], aendern: []});
  // Markt DE, Warenkorb aber in CH (Marktwechsel): zählt jedes Land.
  assert.deepEqual(k(['DE', 'CH']).entfernen, ['l1', 'l3']);
  // Kein Land bekannt: gesperrt (wie teil1Erlaubt).
  assert.deepEqual(k([]).entfernen, ['l1', 'l3']);
  // Kontrolle: sauberer Schritt-1-Korb in AT bleibt, andere Artikel bleiben immer.
  assert.deepEqual(k(['AT'], [{id: 'l1', quantity: 1, variantId: R_GID}]), {entfernen: [], aendern: []});
  assert.deepEqual(k(['US'], [{id: 'l2', quantity: 1, variantId: QI_GID}]), {entfernen: [], aendern: []});
});

// Folgejob 20261029-qi-alpha-ratenanteil-schritt1-ueberschreibt-sitzungskorb.
// Live am 29.10.2026 (origin/main 53fac142): Schritt 1 setzte das Cookie
// `cart` auf den Ratenanteil-Warenkorb; zurück + „Direkt bezahlen“ ergab eine
// Kasse über 27.018 € statt 17.018 € (Ratenanteil + Ware).
// ROT VOR GRÜN: die Tests bis „Verdrahtung Sitzungs-Warenkorb“ sind auf
// 53fac142 rot (Sitzungs-Warenkorb behielt in DE einen Ratenanteil, der
// Permalink setzte das Cookie, permalinkSetztSitzungskorb fehlte).
test('Korrektur Sitzungs-Warenkorb (POST /cart): der Ratenanteil fällt immer, im Permalink fällt er neben Ware', () => {
  const r = {id: 'l1', quantity: 1, variantId: R_GID};
  const ware = [
    {id: 'l2', quantity: 1, variantId: QI_GID},
    {id: 'l4', quantity: 1, variantId: 'gid://shopify/ProductVariant/65965789577484'},
  ];
  // Vorgabe = Sitzungs-Warenkorb: auch allein und in DE kein Ratenanteil.
  assert.deepEqual(tz.ratenanteilKorrektur({zeilen: [r], laender: ['DE', 'DE']}), {entfernen: ['l1'], aendern: []});
  // Der Mischkorb aus dem Befund: Ratenanteil fällt, Ware bleibt.
  assert.deepEqual(tz.ratenanteilKorrektur({zeilen: [r, ...ware], laender: ['DE', 'DE']}), {
    entfernen: ['l1'],
    aendern: [],
  });
  // Auch im Permalink kein Mischkorb (/cart/<R>:1,<Qi Alpha>:1).
  assert.deepEqual(tz.ratenanteilKorrektur({zeilen: [ware[0], r], laender: ['DE'], permalink: true}), {
    entfernen: ['l1'],
    aendern: [],
  });
  // Kontrolle: Ware allein bleibt unverändert.
  assert.deepEqual(tz.ratenanteilKorrektur({zeilen: ware, laender: ['DE']}), {entfernen: [], aendern: []});
});

test('Nachlesen, wenn der Warenkorb ein Schritt-1-Merkmal trägt (alter Sitzungs-Warenkorb mit Ratenanteil)', () => {
  const add = {lines: [{merchandiseId: QI_GID, quantity: 1}]};
  const mit = (key) => ({cart: {id: 'gid://cart/1', attributes: [{key: '_qpx_anon', value: 'x'}, {key, value: 'v'}]}});
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: add, result: mit('_qa_vorgang')}), true);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: add, result: mit('_qa_konfig')}), true);
  assert.equal(
    tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l2', quantity: 1}]}, result: mit('_qa_vorgang')}),
    true,
  );
  // Kontrolle: ohne Merkmal kostet ein normaler Klick nichts, LinesRemove nie.
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: add, result: mit('_qa_anderes')}), false);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: add, result: {cart: {id: 'c'}}}), false);
  assert.equal(
    tz.ratenanteilPruefen({action: 'LinesRemove', inputs: {lineIds: ['l1']}, result: mit('_qa_vorgang')}),
    false,
  );
});

test('Permalink setzt den Sitzungs-Warenkorb nur ohne mögliche Ratenanteil-Zeile', () => {
  const z = (ids) => ids.map((merchandiseId) => ({merchandiseId, quantity: 1}));
  assert.equal(tz.permalinkSetztSitzungskorb(z([QI_GID])), true);
  assert.equal(tz.permalinkSetztSitzungskorb(z([QI_GID, 'gid://shopify/ProductVariant/41007289663544'])), true);
  assert.equal(tz.permalinkSetztSitzungskorb(z([R_GID])), false);
  assert.equal(tz.permalinkSetztSitzungskorb(z([QI_GID, R_GID])), false);
  for (const id of ['gid://shopify/ProductVariant/6604_8336396556', `gid://shopify/ProductVariant/0${tz.TEILZAHLUNG.variante}`]) {
    assert.equal(tz.permalinkSetztSitzungskorb(z([id])), false, id);
  }
});

test('Nachlesen nur, wenn die Aktion den Ratenanteil bringt oder eine Menge über 1 setzt', () => {
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: [{merchandiseId: QI_GID, quantity: 1}]}}), false);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: [{merchandiseId: R_GID, quantity: 1}]}}), true);
  assert.equal(
    tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: [{merchandiseId: `0${tz.TEILZAHLUNG.variante}`}]}}),
    true,
  );
  assert.equal(tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l1', quantity: 1}]}}), false);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l1', quantity: 2}]}}), true);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l1', merchandiseId: R_GID}]}}), true);
  assert.equal(tz.ratenanteilPruefen({action: 'LinesRemove', inputs: {lineIds: ['l1']}}), false);
  assert.equal(tz.ratenanteilPruefen({action: 'DiscountCodesUpdate', inputs: {}}), false);
});

function attrappenKorb({zeilen, land, getWirft = false, seite = Infinity}) {
  const spur = {get: 0, removeLines: [], updateLines: [], numCartLines: []};
  let korb = zeilen.map(([id, quantity, mid]) => ({id, quantity, mid}));
  return {
    spur,
    korb: () => korb,
    cart: {
      get: async (e) => {
        spur.get += 1;
        spur.numCartLines.push(e?.numCartLines);
        if (getWirft) throw new Error('Storefront-API nicht erreichbar');
        const n = Math.min(seite, e?.numCartLines ?? 100);
        return {
          id: 'gid://cart/1',
          buyerIdentity: {countryCode: land},
          lines: {nodes: korb.slice(0, n).map((z) => ({id: z.id, quantity: z.quantity, merchandise: {id: z.mid}}))},
        };
      },
      removeLines: async (ids) => {
        spur.removeLines.push(ids);
        korb = korb.filter((z) => !ids.includes(z.id));
        return {cart: {id: 'gid://cart/1', totalQuantity: korb.length}};
      },
      updateLines: async (l) => {
        spur.updateLines.push(l);
        for (const u of l) korb.find((z) => z.id === u.id).quantity = u.quantity;
        return {cart: {id: 'gid://cart/1', totalQuantity: korb.length}};
      },
    },
  };
}

test('Bindung (Verhalten): CH entfernt, DE klemmt, Lesefehler und fremde Artikel lassen das Ergebnis stehen', async () => {
  const ergebnis = {cart: {id: 'gid://cart/1', totalQuantity: 1}};
  const add = {lines: [{merchandiseId: R_GID, quantity: 1}]};
  const ch = attrappenKorb({zeilen: [['l1', 1, R_GID]], land: 'CH'});
  await tz.bindeRatenanteil({cart: ch.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land: 'CH', permalink: true});
  assert.deepEqual(ch.spur.removeLines, [['l1']]);
  const de = attrappenKorb({zeilen: [['l1', 3, R_GID]], land: 'DE'});
  await tz.bindeRatenanteil({cart: de.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land: 'DE', permalink: true});
  assert.deepEqual(de.spur.updateLines, [[{id: 'l1', quantity: 1}]]);
  assert.deepEqual(de.spur.removeLines, []);
  // Sitzungs-Warenkorb (POST /cart, Vorgabe): auch in DE fällt der Ratenanteil.
  const sitzung = attrappenKorb({zeilen: [['l1', 1, R_GID]], land: 'DE'});
  await tz.bindeRatenanteil({cart: sitzung.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land: 'DE'});
  assert.deepEqual(sitzung.spur.removeLines, [['l1']]);
  // Kontrolle: sauberer DE-Schritt-1-Korb wird gelesen, aber nicht verändert.
  const sauber = attrappenKorb({zeilen: [['l1', 1, R_GID]], land: 'DE'});
  const r = await tz.bindeRatenanteil({
    cart: sauber.cart,
    action: 'LinesAdd',
    inputs: add,
    result: ergebnis,
    land: 'DE',
    permalink: true,
  });
  assert.equal(r, ergebnis);
  assert.equal(sauber.spur.get, 1);
  assert.deepEqual([sauber.spur.removeLines, sauber.spur.updateLines], [[], []]);
  // Anderer Artikel: kein zusätzlicher Lesezugriff.
  const fremd = attrappenKorb({zeilen: [['l1', 1, R_GID]], land: 'CH'});
  await tz.bindeRatenanteil({
    cart: fremd.cart,
    action: 'LinesAdd',
    inputs: {lines: [{merchandiseId: QI_GID, quantity: 1}]},
    result: ergebnis,
    land: 'CH',
  });
  assert.equal(fremd.spur.get, 0);
  // Lesefehler: Ergebnis der Kundenaktion bleibt (der Wächter bleibt die Linie).
  const kaputt = attrappenKorb({zeilen: [], land: 'CH', getWirft: true});
  assert.equal(
    await tz.bindeRatenanteil({cart: kaputt.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land: 'CH'}),
    ergebnis,
  );
});

test('Verdrahtung: cart.jsx bindet den Ratenanteil vor den übrigen Bindungen, cart.$lines klemmt die Zeilen', () => {
  const route = lies('app/routes/cart.jsx');
  const bindung = route.indexOf('await bindeRatenanteil(');
  assert.ok(bindung > 0, 'cart.jsx ruft bindeRatenanteil');
  assert.ok(bindung < route.indexOf('await begrenzeAngebot('), 'vor begrenzeAngebot');
  assert.match(route.slice(bindung, bindung + 200), /land: storefront\?\.i18n\?\.country/);
  assert.match(lies('app/routes/cart.$lines.jsx'), /const linesMap = permalinkZeilen\(/);
});

test('Permalink (Verhalten): /cart/<R>:2 und /cart/<R>:1,0<R>:1 legen genau eine Zeile mit Menge 1 an', async () => {
  const {loader} = await import('../app/routes/cart.$lines.jsx');
  for (const lines of [`${tz.TEILZAHLUNG.variante}:2`, `${tz.TEILZAHLUNG.variante}:1,0${tz.TEILZAHLUNG.variante}:1`]) {
    let angelegt;
    const cart = {
      get: async () => ({id: 'gid://cart/1', lines: {nodes: []}}),
      create: async (e) => {
        angelegt = e.lines;
        return {cart: {id: 'gid://cart/1', checkoutUrl: 'https://checkout.qiblanco.com/c/1', totalQuantity: 1}};
      },
      setCartId: () => new Headers(),
    };
    await loader({
      request: new Request(`https://qiblanco.com/cart/${lines}`),
      context: {cart, env: {}, storefront: {i18n: {country: 'DE'}}},
      params: {lines},
    }).catch((e) => e);
    assert.deepEqual(angelegt, [{merchandiseId: R_GID, quantity: 1}], lines);
  }
});

// K3-Widerleger s02 (29.10.2026, live gegen 6a9385cb): Shopify liest auch
// „6604_8336396556“, die Base64-GID und „…/<R>?a=/“ als Ratenanteil; ein
// LinesAdd mit 101 Ratenanteil-Zeilen ließ nach 100 gelesenen eine zweite
// stehen; der Permalink /cart/6604_8336396556:3 legte in DE 30.000 € an.
// ROT VOR GRÜN: die drei Tests unten sind auf 6a9385cb rot.
const SCHREIBWEISEN = [
  'gid://shopify/ProductVariant/6604_8336396556',
  Buffer.from(R_GID).toString('base64'),
  `${R_GID}?a=/`,
  tz.TEILZAHLUNG.variante,
];

test('Widerleger F1: jede Schreibweise außer der kanonischen GID eines anderen Artikels löst das Nachlesen aus', () => {
  for (const id of SCHREIBWEISEN) {
    assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: [{merchandiseId: id, quantity: 3}]}}), true, id);
    assert.equal(
      tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l1', merchandiseId: id, quantity: 1}]}}),
      true,
      id,
    );
  }
  // Kein Array: nachlesen statt raten.
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: {0: {merchandiseId: QI_GID}}}}), true);
  // Kontrolle: kanonische GID eines anderen Artikels kostet nichts.
  assert.equal(tz.ratenanteilPruefen({action: 'LinesAdd', inputs: {lines: [{merchandiseId: QI_GID, quantity: 5}]}}), false);
  assert.equal(
    tz.ratenanteilPruefen({action: 'LinesUpdate', inputs: {lines: [{id: 'l1', merchandiseId: QI_GID, quantity: 1}]}}),
    false,
  );
});

test('Widerleger F3: 101 und 600 Ratenanteil-Zeilen werden in Runden zu genau einer (DE) bzw. keiner (CH)', async () => {
  const ergebnis = {cart: {id: 'gid://cart/1', totalQuantity: 101}};
  const add = {lines: [{merchandiseId: R_GID, quantity: 1}]};
  for (const [n, land, rest, permalink] of [
    [101, 'DE', 1, true],
    [600, 'DE', 1, true],
    [101, 'CH', 0, true],
    [600, 'DE', 0, false],
  ]) {
    const k = attrappenKorb({
      zeilen: Array.from({length: n}, (_, i) => [`l${i}`, 1, R_GID]),
      land,
      seite: 250,
    });
    await tz.bindeRatenanteil({cart: k.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land, permalink});
    assert.equal(k.korb().length, rest, `${n} Zeilen ${land}`);
    assert.ok(k.spur.numCartLines.every((x) => x === 250), 'liest die volle Seite');
  }
});

test('Widerleger F2 (Verhalten): Permalink /cart/6604_8336396556:3 in DE klemmt am angelegten Warenkorb', async () => {
  const {loader} = await import('../app/routes/cart.$lines.jsx');
  const lines = '6604_8336396556:3';
  const k = attrappenKorb({zeilen: [['l1', 3, R_GID]], land: 'DE'});
  const cart = {
    ...k.cart,
    create: async () => ({cart: {id: 'gid://cart/1', checkoutUrl: 'https://checkout.qiblanco.com/c/1', totalQuantity: 3}}),
    setCartId: () => new Headers(),
  };
  await loader({
    request: new Request(`https://qiblanco.com/cart/${lines}`),
    context: {cart, env: {}, storefront: {i18n: {country: 'DE'}}},
    params: {lines},
  }).catch((e) => e);
  assert.deepEqual(k.korb().map((z) => [z.id, z.quantity]), [['l1', 1]]);
});

// Folgejob 20261029-qi-alpha-ratenanteil-schritt1-ueberschreibt-sitzungskorb:
// der Kundenweg aus dem Befund, am echten Loader bzw. an der Bindung.
test('Permalink (Verhalten): Schritt 1 geht ohne Cookie in die Kasse, ein normaler Permalink setzt es weiter', async () => {
  const {loader} = await import('../app/routes/cart.$lines.jsx');
  const lauf = async (lines, query = '') => {
    const spur = {setCartId: 0, attribute: null};
    const cart = {
      get: async () => ({id: 'gid://cart/9', lines: {nodes: lines.split(',').map((l) => ({id: l, quantity: 1, merchandise: {id: `gid://shopify/ProductVariant/${l.split(':')[0]}`}}))}}),
      create: async (e) => {
        spur.attribute = e.attributes;
        return {cart: {id: 'gid://cart/9', checkoutUrl: 'https://checkout.qiblanco.com/cart/c/9', totalQuantity: 1, attributes: e.attributes ?? []}};
      },
      setCartId: () => {
        spur.setCartId += 1;
        return new Headers({'Set-Cookie': 'cart=9; path=/'});
      },
    };
    const antwort = await loader({
      request: new Request(`https://qiblanco.com/cart/${lines}${query}`),
      context: {cart, env: {}, storefront: {i18n: {country: 'DE'}}},
      params: {lines},
    }).catch((e) => e);
    return {ort: antwort?.headers?.get?.('Location'), cookie: antwort?.headers?.get?.('Set-Cookie'), spur};
  };
  const teil1 = await lauf(
    `${tz.TEILZAHLUNG.variante}:1`,
    '?_qa_vorgang=qa-test-0001&_qa_konfig=qi-alpha%3D62077673767180%3Bnummer%3D-%3Bkette%3D-%3Bpartner%3D-',
  );
  assert.match(teil1.ort ?? '', /checkout\.qiblanco\.com/, 'Schritt 1 führt in die Kasse');
  assert.equal(teil1.spur.setCartId, 0, 'Schritt 1 setzt keinen Sitzungs-Warenkorb');
  assert.equal(teil1.cookie, null);
  // Wächter-Naht unverändert: beide Merkmale stehen am angelegten Warenkorb.
  assert.deepEqual(
    (teil1.spur.attribute || []).filter((a) => a.key.startsWith('_qa_')).map((a) => a.key),
    ['_qa_vorgang', '_qa_konfig'],
  );
  // Kontrolle: ein normaler Permalink setzt das Cookie wie bisher.
  const normal = await lauf('62077673767180:1');
  assert.match(normal.ort ?? '', /checkout\.qiblanco\.com/);
  assert.equal(normal.spur.setCartId, 1);
  assert.match(normal.cookie ?? '', /^cart=/);
});

test('Zurück-Weg (Verhalten): Ware in einen alten Schritt-1-Sitzungs-Warenkorb -> Ratenanteil fällt, Ware bleibt', async () => {
  const NR = 'gid://shopify/ProductVariant/65965789577484';
  const KETTE = 'gid://shopify/ProductVariant/65965789610252';
  const k = attrappenKorb({
    zeilen: [['r', 1, R_GID], ['a', 1, QI_GID], ['n', 1, NR], ['k', 1, KETTE]],
    land: 'DE',
  });
  // „In den Warenkorb“ nach „Direkt bezahlen“: drei kanonische GIDs, der
  // Warenkorb trägt die Merkmale aus Schritt 1 (Ergebnis der Mutation).
  const ergebnis = {
    cart: {id: 'gid://cart/1', totalQuantity: 4, attributes: [{key: '_qa_vorgang', value: 'qa-x'}, {key: '_qa_konfig', value: 'k'}]},
  };
  const add = {lines: [QI_GID, NR, KETTE].map((merchandiseId) => ({merchandiseId, quantity: 1}))};
  await tz.bindeRatenanteil({cart: k.cart, action: 'LinesAdd', inputs: add, result: ergebnis, land: 'DE'});
  assert.deepEqual(k.korb().map((z) => z.id), ['a', 'n', 'k']);
  // Kontrolle: ohne Merkmal und ohne Ratenanteil kein zusätzlicher Lesezugriff.
  const leer = attrappenKorb({zeilen: [['a', 1, QI_GID]], land: 'DE'});
  await tz.bindeRatenanteil({
    cart: leer.cart,
    action: 'LinesAdd',
    inputs: add,
    result: {cart: {id: 'gid://cart/2', totalQuantity: 1, attributes: []}},
    land: 'DE',
  });
  assert.equal(leer.spur.get, 0);
});

test('Verdrahtung Sitzungs-Warenkorb: cart.$lines bindet als Permalink und setzt das Cookie nur über permalinkSetztSitzungskorb', () => {
  const permalink = lies('app/routes/cart.$lines.jsx');
  const bindung = permalink.slice(permalink.indexOf('await bindeRatenanteil('));
  assert.match(bindung.slice(0, 300), /permalink: true/);
  assert.match(permalink, /permalinkSetztSitzungskorb\(linesMap\)\s*\?\s*cart\.setCartId\(/);
  assert.equal(permalink.match(/cart\.setCartId\(/g).length, 1, 'genau eine Stelle setzt das Cookie');
  // POST /cart bindet als Sitzungs-Warenkorb (Vorgabe, kein permalink-Schalter).
  const route = lies('app/routes/cart.jsx');
  const b = route.indexOf('await bindeRatenanteil(');
  assert.doesNotMatch(route.slice(b, b + 200), /permalink/);
});
