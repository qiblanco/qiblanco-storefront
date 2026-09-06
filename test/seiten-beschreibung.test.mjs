// PROBE ZU DEN META-BESCHREIBUNGEN DER DACH-STOREFRONT
// (Job 20260906-BAU-seo-restposten-dach-…-prio6).
//
// WAS HIER GEMESSEN WIRD UND WARUM GENAU SO:
// Der Vorgängerbefund war NICHT „das Tag fehlt", sondern „die Verdrahtung
// allein wirkt nicht": `pages.$handle.jsx` holte `seo.description` und gab sie
// nie aus, UND 14 von 15 dieser Felder sind in Shopify leer. Eine Probe, die
// nur die Anwesenheit des Codes prüft, wäre gegen beide Hälften blind.
// Geprüft wird deshalb die RANGFOLGE (wer schlägt wen) und die DECKUNG (trägt
// jeder Pfad, der keine gepflegte Beschreibung hat, eine Auffanglinie).
//
// Jeder Arm trägt einen eigenen Marker, damit ein Rot-Nachweis sagen kann,
// WELCHER Arm rot war — ein geteilter Exit-Code trennt Geschwisterarme nicht.
//
// B2 (UMLAUTE) STEHT BEWUSST NICHT HIER — P10, Bestand vor Neubau.
// Der erste Entwurf hatte einen eigenen Umlaut-Arm mit dem Muster /(ae|oe|ue)/.
// Er schlug sofort an, und zwar FALSCH: „Christian Bernd Bauer" enthält „ue"
// als zwei normale Buchstaben, wie „neue", „Feuer", „Poesie". Ein Wächter, der
// Eigennamen anklagt, erzieht zum Wegklicken — und das Haus hat den richtigen
// längst: Gate 7b (UMLAUT_GATE=on, src/umlaut_gate.py) prüft kundensichtbaren
// Text beim Deploy und kennt die Unterscheidung. Ein zweiter, schlechterer
// Wächter daneben wäre keine Redundanz, sondern eine zweite Wahrheit.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {BESCHREIBUNGEN, beschreibungTags} from '../app/lib/seiten-beschreibung.js';
import {PRODUKT_BESCHREIBUNGEN, produktBeschreibung} from '../app/lib/produkt-seo.js';

const lies = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

/**
 * Schneidet den beschreibungTags-Aufruf aus einer Routendatei aus.
 *
 * WARUM PER INDEX UND NICHT PER REGEX: die erste Fassung von D3/D5 suchte in
 * der GANZEN Datei nach `/pages/${params.handle}` und traf damit die
 * bestehende canonicalLink-Zeile — beide Arme waren gruen, egal was
 * beschreibungTags bekam, und ueberlebten die Gegenprobe (Mutation M15/M16)
 * unbeschadet. Gemessen wird deshalb der AUFRUF, nicht die Datei.
 */
function aufrufVon(quelltext) {
  const start = quelltext.indexOf('...beschreibungTags(');
  if (start === -1) return null;
  const ende = quelltext.indexOf('),', start);
  return ende === -1 ? null : quelltext.slice(start, ende + 2);
}
const PFAD_ENTGIFTUNG = '/pages/entgiftung';

// --- A: RANGFOLGE ----------------------------------------------------------
test('A1 gepflegtes Shopify-Feld schlägt die kuratierte Karte', () => {
  const t = beschreibungTags(PFAD_ENTGIFTUNG, 'Aus Shopify gepflegt');
  assert.equal(t.length, 1);
  assert.equal(t[0].content, 'Aus Shopify gepflegt');
  assert.notEqual(t[0].content, BESCHREIBUNGEN[PFAD_ENTGIFTUNG]);
});

test('A2 leeres Shopify-Feld fällt auf die Karte zurück', () => {
  for (const leer of ['', '   ', null, undefined]) {
    const t = beschreibungTags(PFAD_ENTGIFTUNG, leer);
    assert.equal(t.length, 1, `Fallback fehlt bei ${JSON.stringify(leer)}`);
    assert.equal(t[0].content, BESCHREIBUNGEN[PFAD_ENTGIFTUNG]);
  }
});

test('A3 ohne Quelle UND ohne Karteneintrag entsteht KEIN Tag', () => {
  // Das ist die Zusage „lieber keine als eine erfundene Beschreibung".
  assert.deepEqual(beschreibungTags('/pages/gibt-es-nicht', ''), []);
  assert.deepEqual(beschreibungTags(undefined, undefined), []);
});

test('A4 der Descriptor hat die Form, die react-router als <meta> ausgibt', () => {
  const [d] = beschreibungTags(PFAD_ENTGIFTUNG, null);
  assert.deepEqual(Object.keys(d).sort(), ['content', 'name']);
  assert.equal(d.name, 'description');
});

// --- B: INHALT DER KARTEN --------------------------------------------------
test('B1 jede kuratierte Beschreibung ist nicht leer und snippet-tauglich lang', () => {
  const alle = {...BESCHREIBUNGEN, ...PRODUKT_BESCHREIBUNGEN};
  for (const [k, t] of Object.entries(alle)) {
    assert.equal(typeof t, 'string', `${k}: kein String`);
    assert.equal(t, t.trim(), `${k}: führende/abschließende Leerzeichen`);
    assert.ok(t.length >= 80, `${k}: zu kurz (${t.length})`);
    assert.ok(t.length <= 175, `${k}: zu lang (${t.length}) — Google schneidet ab`);
  }
});

test('B2 jeder Schlüssel ist ein Pfad, kein blanker Handle', () => {
  // Ein Handle ist nur in seiner Familie eindeutig; ein Pfad immer. Kippt das,
  // kann eine Kollektion still die Beschreibung einer Seite ziehen.
  for (const k of Object.keys(BESCHREIBUNGEN)) {
    assert.match(k, /^\/(pages|blogs|collections|products)\/[a-z0-9-]+$/, `${k}: kein Pfad`);
  }
});

test('B3 die drei LEEREN Kollektionen bekommen bewusst KEINE Beschreibung', () => {
  // Begründete Ausnahme, kein Übersehen: sie führen null Produkte, eine
  // Beschreibung könnte ihren Inhalt gar nicht treffen. Kippt das (Produkte
  // kommen dazu), soll dieser Arm rot werden und die Entscheidung neu stellen.
  for (const p of [
    '/collections/blackfriday-sale-artikel',
    '/collections/digitale-kurse',
    '/collections/valentinstag-angebote',
  ]) {
    assert.equal(BESCHREIBUNGEN[p], undefined, `${p} unerwartet in der Karte`);
  }
  assert.ok(BESCHREIBUNGEN['/collections/zeremonie-kakao'], 'die gefüllte Kollektion fehlt');
});

test('B4 die Karte deckt genau die gemessenen Lücken — kein Pfad zu viel', () => {
  // Unabhängiges Literal, BEWUSST nicht aus der Karte abgeleitet: sonst
  // verglichen sich Karte und Erwartung mit sich selbst und der Arm könnte
  // strukturell nie rot werden.
  const erwartet = [
    '/pages/das-beispiel', '/pages/e-smog', '/pages/entgiftung',
    '/pages/intuition-erfahren', '/pages/kakao-anwendung',
    '/pages/kohaerentes-wasser', '/pages/meditieren-mit-zeremonie-kakao',
    '/pages/mentales-setting', '/pages/qihome-details', '/pages/superhuman',
    '/pages/support-1', '/pages/vitamine-mineralien',
    '/pages/was-ist-zeremonie-kakao', '/pages/zeremonie-kakao-kurs',
    '/blogs/wissen', '/collections/zeremonie-kakao',
  ];
  assert.deepEqual(Object.keys(BESCHREIBUNGEN).sort(), erwartet.sort());
});

test('B5 die vier Bundles liegen im BESTAND, nicht in einer zweiten Karte', () => {
  // P10: app/lib/produkt-seo.js führt die Produktbeschreibungen je Pfad seit
  // 2026-08-14. Eine zweite Produktkarte daneben wäre genau die Zweiteilung,
  // die bei der Product-Auszeichnung schon einmal Seiten übersprungen hat.
  for (const p of [
    '/products/bundle-2x-awake', '/products/bundle-3x-awake',
    '/products/mengenrabatt-2x', '/products/mengenrabatt-3x-create',
  ]) {
    assert.ok(produktBeschreibung(p), `${p} fehlt im Bestand`);
    assert.equal(BESCHREIBUNGEN[p], undefined, `${p} doppelt in der zweiten Karte`);
  }
});

// --- C: DAS MODUL ZIEHT KEINE SEITE IN EINE GATE-PRÜFMENGE -----------------
test('C1 seiten-beschreibung.js hat eine LEERE Import-Closure', () => {
  // Begründung im Dateikopf und im Kopf von produkt-seo.js: ein Import zöge
  // die Closure der importierenden Route in die Gate-12-Prüfmenge.
  const q = lies('app/lib/seiten-beschreibung.js');
  assert.doesNotMatch(q, /^\s*import\s/m, 'das Modul importiert etwas');
  assert.doesNotMatch(q, /require\(/, 'das Modul benutzt require()');
});

// --- D: DIE VERDRAHTUNG AN DEN ROUTEN --------------------------------------
// Abgeleitet statt wiederholt: eine zweite Aufzählung derselben Pfade wiche
// eines Tages von der Karte ab, und dann prüfte D1 eine Menge, die es nicht
// mehr gibt. /pages/support-1 fällt raus — diese eine Seite läuft über die
// Sammelroute und hat keine eigene Datei; sie wird von D3 geprüft.
const SEITEN_ROUTEN = Object.keys(BESCHREIBUNGEN)
  .filter((p) => p.startsWith('/pages/') && p !== '/pages/support-1')
  .map((p) => p.slice('/pages/'.length));

test('D1 jede eigene Seitenroute reicht ihren Pfad und das Shopify-Feld durch', () => {
  assert.equal(SEITEN_ROUTEN.length, 13, 'unerwartete Zahl eigener Seitenrouten');
  for (const h of SEITEN_ROUTEN) {
    const q = lies(`app/routes/pages.${h}.jsx`);
    assert.match(q, /import \{beschreibungTags\} from '~\/lib\/seiten-beschreibung';/, `${h}: Import fehlt`);
    assert.ok(
      q.includes(`...beschreibungTags('/pages/${h}', data?.page?.seo?.description)`),
      `${h}: Aufruf fehlt oder nennt einen anderen Pfad`,
    );
  }
});

test('D2 jede eigene Seitenroute HOLT die Beschreibung auch (sonst ist sie immer leer)', () => {
  // Der teure Fall: Aufruf da, Feld nie geladen -> stumm die Karte, und das
  // gepflegte Shopify-Feld könnte NIE gewinnen.
  for (const h of SEITEN_ROUTEN) {
    const q = lies(`app/routes/pages.${h}.jsx`);
    const seo = q.match(/seo\s*\{[^}]*\}/s);
    assert.ok(seo, `${h}: kein seo-Block in der Query`);
    assert.match(seo[0], /description/, `${h}: seo-Block ohne description`);
  }
});

test('D3 die Sammelroute pages.$handle gibt die Beschreibung aus', () => {
  const aufruf = aufrufVon(lies('app/routes/pages.$handle.jsx'));
  assert.ok(aufruf, 'kein beschreibungTags-Aufruf gefunden');
  assert.match(aufruf, /`\/pages\/\$\{params\.handle\}`/, 'Aufruf baut den Pfad nicht');
  assert.match(aufruf, /data\?\.page\?\.seo\?\.description/, 'Aufruf reicht das Shopify-Feld nicht durch');
});

test('D4 der Blog-Artikel fällt auf den excerpt zurück UND holt ihn', () => {
  const q = lies('app/routes/blogs.$blogHandle.$articleHandle.jsx');
  assert.match(q, /data\?\.article\?\.seo\?\.description\?\.trim\(\) \|\| data\?\.article\?\.excerpt/);
  // Ohne das Feld in der Query ist der Fallback dauerhaft undefined.
  assert.match(q, /^\s*excerpt$/m, 'excerpt fehlt in der ARTICLE_QUERY');
});

test('D5 Kollektionen und Bundle-Produkte hängen an ihrer Quelle', () => {
  const k = lies('app/routes/collections.$handle.jsx');
  const kAufruf = aufrufVon(k);
  assert.ok(kAufruf, 'kein beschreibungTags-Aufruf in der Kollektionsroute');
  assert.match(kAufruf, /`\/collections\/\$\{params\.handle\}`/, 'Aufruf baut den Pfad nicht');
  assert.match(k, /seo \{\s*description\s*\}/s, 'Collection-Query holt seo.description nicht');
  const pr = lies('app/routes/products.$handle.jsx');
  assert.match(pr, /produktBeschreibung\(`\/products\/\$\{data\?\.product\?\.handle\}`\)/);
});

test('D6 die kuratierte Karte steht IMMER hinter dem gepflegten Feld', () => {
  // Reihenfolge im Quelltext, nicht nur im Verhalten: wer die Karte vor
  // `seo.description` schöbe, entzöge der Redaktion still die Hoheit.
  const p = lies('app/routes/products.$handle.jsx');
  const i = p.indexOf('data?.product?.seo?.description');
  const j = p.indexOf('produktBeschreibung(');
  assert.ok(i > -1 && j > -1 && i < j, 'die Karte steht vor dem gepflegten Feld');
});
