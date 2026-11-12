/**
 * Anschlüsse der Anmeldeseite /pages/coming-home: Sitemap und Ad-Weiche.
 * Grossjob growth-m-lp-coming-home-anmeldeseite, Segment s04.
 *
 * WAS DIESER TEST BEWEIST: (1) die Seite steht in NUR_ROUTE_SEITEN, mit
 * lastmod und ihrer Wache im Grund (Kriterium 3 der Liste). (2) Ein bezahlter
 * Klick, etwa aus der Anzeige V18, wird NICHT auf LP A umgeleitet. Gemessen
 * am 2026-10-01 vor diesem Eintrag: ?utm_medium=paid gab 302 auf LP A.
 *
 * DIE NEGATIV-KONTROLLE IST TRAGEND: „dieser Pfad wird nicht umgeleitet“
 * wäre auch grün, wenn jemand die Weiche abschaltet. Deshalb prüft der Test
 * im selben Lauf, dass sie auf der Startseite und auf einem Suffix-Slug
 * weiter feuert.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// sm-ausnahme: Test-Fixture — die URLs sind nachgebaute Eingaben für
// entscheideAdWeiche(), kein Abruf und kein Zulauf auf einen echten Shop.
import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {
  MESSFIXTUR_FIXTUR,
  MESSFIXTUR_JETZT,
  MESSFIXTUR_KOPF,
  MESSFIXTUR_NAME,
  istMessfixtur,
  messfixturDaten,
  seitenDaten as liveSeitenDaten,
} from '../app/lib/coming-home-live.server.js';
import {ohneProsa as ohneProsaMf} from './_quelltext.mjs';

const PFAD = '/pages/coming-home';
const PAID = ['utm_medium=paid&utm_source=facebook', 'utm_medium=paid&utm_source=google', 'gclid=TESTS04CH'];

test('die Seite steht in NUR_ROUTE_SEITEN, mit lastmod und Wache', () => {
  const e = NUR_ROUTE_SEITEN.find((s) => s.pfad === PFAD);
  assert.ok(e, 'kein NUR_ROUTE_SEITEN-Eintrag');
  assert.match(e.lastmod, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  assert.match(e.grund, /probe_coming_home_seite\.py/);
});

test('die Route existiert und setzt kein noindex auf das Dokument', () => {
  const route = readFileSync(new URL('../app/routes/pages.coming-home.jsx', import.meta.url), 'utf8');
  assert.match(route, /canonicalLink\(PFAD\)/);
  // X-Robots-Tag steht nur am Kopf der Action-Antwort (KOPF), nie in meta.
  assert.ok(!/name:\s*'robots'/.test(route), 'meta robots in der Route');
});

// UHRZEIT (Christian 18.10.2026, Übergabe #42 im Grossjob 20261018-GROSSJOB-
// coming-home-zoom-aufnahme-transkript-zusammenfassung-homepage-reiter-live,
// s09): „12 Uhr Berlin, das muss so geändert werden, da wir ja gerade in
// Thailand sind. Das gilt auf jeden Fall bis Anfang April 2027." Elinas
// Einladungen nennen seit dem 09.10. schon 12 Uhr. Die alte 19 Uhr darf auf der
// Seite nirgends mehr stehen, auch nicht im Titel oder in der Beschreibung.
test('/pages/coming-home nennt sonntags 12 Uhr (Berlin) und nirgends mehr 19 Uhr', () => {
  const route = readFileSync(new URL('../app/routes/pages.coming-home.jsx', import.meta.url), 'utf8');
  // Geschütztes Leerzeichen in JSX ({'\u00a0'}) und als Entity zählt wie ein
  // Leerzeichen: im H1 stand „19{'\u00a0'}Uhr", das ein Suchmuster auf „19 Uhr"
  // nicht findet (am 18.10. in der gerenderten Vorschau gefunden, nicht im Code).
  const code = route
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{'\\u00a0'\}|&nbsp;|\u00a0/g, ' ');
  assert.ok(!/\b19(?:[:.]00)?\s*Uhr/.test(code), 'im Seitentext steht noch 19 Uhr');
  assert.match(code, /Coming Home live: jeden Sonntag um 12 Uhr/, 'Titel ohne 12 Uhr');
  assert.match(code, /Jeden Sonntag um 12 Uhr \(Berliner Zeit\) per Zoom/, 'Beschreibung ohne 12 Uhr Berlin');
  assert.match(code, /wert: 'Jeden Sonntag, 12 Uhr \(Berlin\)'/, 'Eckdatum Wann ohne 12 Uhr (Berlin)');
  assert.match(code, /titel: 'Sonntag um 12 Uhr'/, 'Schritt drei ohne 12 Uhr');
  assert.match(code, /Jeden Sonntag um 12 Uhr: eine Stunde live/, 'H1 ohne 12 Uhr');
});

test('Testdaten von /pages/live tragen 12 Uhr, nicht 19 Uhr', async () => {
  const {fixturArtikel, terminAusArtikel, uhrzeit} = await import('../app/lib/coming-home-live.server.js');
  const artikel = fixturArtikel('voll', new Date('2026-10-18T08:00:00Z'));
  assert.ok(artikel.length >= 2);
  for (const a of artikel) {
    assert.ok(a.tags.includes('ch-zeit-1200'), `${a.handle}: ${a.tags}`);
    assert.ok(!a.tags.includes('ch-zeit-1900'), `${a.handle}: ${a.tags}`);
  }
  const t = terminAusArtikel(artikel[0]);
  assert.equal(uhrzeit(t.zeit), '12:00 Uhr');
});

test('/pages/coming-home ist von der Ad-Weiche ausgenommen', () => {
  assert.equal(istAusgeschlossen(PFAD), true);
  for (const q of PAID) {
    assert.equal(
      entscheideAdWeiche(`https://qiblanco.com${PFAD}?${q}`), null,
      `${PFAD}?${q} darf nicht auf LP A geworfen werden`);
  }
});

test('NEGATIV-KONTROLLE: die Weiche feuert anderswo weiter', () => {
  const start = entscheideAdWeiche('https://qiblanco.com/?utm_medium=paid');
  assert.notEqual(start, null, 'die Startseite muss weiter umgeleitet werden');
  assert.ok(start.ziel.startsWith(LP_A_PFAD));
  assert.notEqual(
    entscheideAdWeiche('https://qiblanco.com/pages/coming-home-alt?utm_medium=paid'), null,
    'ein Suffix-Slug erbt den Ausschluss nicht');
});

// Live-Seite /pages/live (Grossjob 20261018-GROSSJOB-coming-home-zoom-
// aufnahme-transkript-zusammenfassung-homepage-reiter-live, s08): reine Route
// ohne Shopify-Seitenobjekt, indexierbar gewollt. Route in main seit dem
// Merge von PR #943 (2026-10-18T10:52:20Z).
const LIVE = '/pages/live';

test('/pages/live steht in NUR_ROUTE_SEITEN, lastmod ab dem Route-Merge, mit Wache', () => {
  const e = NUR_ROUTE_SEITEN.filter((s) => s.pfad === LIVE);
  assert.equal(e.length, 1);
  assert.ok(e[0].lastmod >= '2026-10-18T10:52:20Z', `lastmod ${e[0].lastmod} vor dem Merge`);
  assert.match(e[0].grund, /probe_live_seite\.py/);
});

test('/pages/live: Canonical in der Route, noindex nur in den Schritt-Ansichten', () => {
  const route = readFileSync(new URL('../app/routes/pages.live.jsx', import.meta.url), 'utf8');
  assert.match(route, /canonicalLink\(PFAD\)/);
  assert.match(route, /d\?\.schritt \? \[\.\.\.basis, \{name: 'robots', content: 'noindex'\}\] : basis/);
});

// Neue Fassung /pages/live (Grossjob 20261020-GROSSJOB-coming-home-live-
// seite-neu-nach-christians-idee-pr-manager-als-chef-zusammenfassungen-live,
// s02). Christian 20.10.2026 zur vorigen Fassung: „auch die unbequemen
// Antworten? was für ein Quatsch. die Idee ist doch ganz anders.“ Der Test
// hält die Sätze, die er gestrichen hat, aus den Bausteinen der neuen Fassung
// heraus und prüft, dass die alte Fassung per Schalter erreichbar bleibt.
function liveRoute() {
  return readFileSync(new URL('../app/routes/pages.live.jsx', import.meta.url), 'utf8');
}

/** Quelltext der neuen Fassung: Konstanten und Bausteine bis zur alten Kopf-Funktion. */
function neueFassung(route) {
  const textAnfang = route.indexOf('const TITEL_NEU');
  const textEnde = route.indexOf('const ECKDATEN = [');
  const bauAnfang = route.indexOf('function LiveNeu(');
  const bauEnde = route.indexOf('function Kopf()');
  assert.ok(textAnfang > 0 && textEnde > textAnfang, 'Textblock der neuen Fassung fehlt');
  assert.ok(bauAnfang > 0 && bauEnde > bauAnfang, 'Bausteine der neuen Fassung fehlen');
  return route.slice(textAnfang, textEnde) + route.slice(bauAnfang, bauEnde);
}

test('/pages/live: neue Fassung ist an und trägt ihr Merkmal', () => {
  const route = liveRoute();
  assert.match(route, /^const SEITE_NEU_AN = true;$/m);
  assert.match(route, /if \(SEITE_NEU_AN\) return <LiveNeu d=\{d\} \/>;/);
  assert.match(neueFassung(route), /data-ch-live-fassung="neu-20261020"/);
});

test('/pages/live neu: Eckdaten, Aufnahme-Satz, Leerzustand und Linktext nach Vertrag', () => {
  const neu = neueFassung(liveRoute());
  assert.match(neu, /wert: 'Jeden Sonntag, 12:00 Uhr \(Berlin\)'/);
  assert.match(neu, /wert: '90 Minuten'/);
  assert.match(neu, /'Nach jedem Sonntag steht hier, worüber wir gesprochen haben\.'/);
  assert.match(neu, /const WOCHE_AUFKLAPPEN = 'Zusammenfassung lesen';/);
  assert.match(neu.replace(/' \+\s+'/g, ''), /Namen und persönliche Geschichten aus der Runde veröffentlichen wir nicht\./);
  // Reihenfolge der Abschnitte: Kopf, Termin, Anmeldung, Wochen.
  const lauf = neu.slice(neu.indexOf('function LiveNeu('));
  const pos = ['<KopfNeu />', '<Termin ', 'data-ch-live="anmeldung"', '<Zusammenfassungen'].map((m) => lauf.indexOf(m));
  assert.ok(pos.every((p) => p > 0), `Abschnitt fehlt: ${pos}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, `Reihenfolge ${pos}`);
});

test('/pages/live neu: keine der gestrichenen Sätze in der neuen Fassung', () => {
  const neu = neueFassung(liveRoute()).replace(/' \+\s+'/g, '');
  for (const satz of [
    /unbequem/i,
    /Eine Stunde mit Anna und Christian/,
    /60 Minuten/,
    /eine Stunde live/i,
    /erste Zusammenfassung erscheint/,
    /Geschichte lesen/,
    /Du fragst, wir antworten/,
  ]) {
    assert.ok(!satz.test(neu), `neue Fassung enthält ${satz}`);
  }
});

test('NEGATIV-KONTROLLE /pages/live: die alte Fassung bleibt per Schalter erreichbar', () => {
  const route = liveRoute();
  // Ohne diesen Bestand wäre SEITE_NEU_AN = false kein Rückweg.
  assert.match(route, /Du fragst, wir antworten\. Auch die unbequemen Fragen\./);
  assert.match(route, /'Die erste Zusammenfassung erscheint nach dem nächsten Sonntag\.'/);
  // Seit der Messfixtur (Job 20261019-repair-gate12-...) trägt sie dazu den Marker-Parameter.
  assert.match(route, /function Rueckblick\(\{rueckblicke, gesamt, ladeFehler(, messfixtur)?\}\)/);
  // Und der Test der gestrichenen Sätze sähe sie, stünden sie in der neuen Fassung.
  assert.ok(/unbequem/i.test(route.slice(route.indexOf('function Kopf()'))));
});

test('/pages/live: Termin gilt 90 Minuten, Überschriften im Artikel werden h4', async () => {
  const m = await import('../app/lib/coming-home-live.server.js');
  assert.equal(m.DAUER_MIN, 90);
  assert.equal(
    m.ueberschriftenTiefer('<h2 id="a">Die Inhalte</h2><ul><li>x</li></ul><h3>Zum Mitnehmen</h3><hr>'),
    '<h4 id="a">Die Inhalte</h4><ul><li>x</li></ul><h4>Zum Mitnehmen</h4><hr>',
  );
  // 12:00 Uhr Beginn: um 13:29 noch der nächste Termin, um 13:31 vorbei.
  const artikel = [{
    handle: 'coming-home-2026-10-25', title: 'T', excerpt: '', contentHtml: '',
    tags: ['ch-termin', 'ch-datum-2026-10-25', 'ch-zeit-1200', 'ch-vorschau'],
  }];
  assert.equal(m.seitenDaten(artikel, new Date('2026-10-25T12:29:00Z')).naechster.quelle, 'blog');
  assert.equal(m.seitenDaten(artikel, new Date('2026-10-25T12:31:00Z')).naechster.quelle, 'annahme');
});

/**
 * MESSFIXTUR /pages/live des Formate-Prüfers (Job 20261019-repair-gate12-
 * live-pixelsoll-datengetrieben-terminwechsel, s02).
 *
 * WAS DIESER TEST BEWEIST: der Kopf x-hbfmt-messfixtur: 1 schaltet die Seite
 * NUR an der lokalen Bank (localhost/127.0.0.1/::1) auf feste Daten. Auf
 * qiblanco.com, auf einer Oxygen-Vorschau und unter einem Host, der nur mit
 * "localhost." anfängt, bleiben es Shop-Daten, auch wenn jemand den Kopf
 * mitschickt. Die Fixtur zeigt den vollen Zustand (Vorschau mit Uhrzeit,
 * Titel und Auszug, drei Rückblicke) zu einem festen Zeitpunkt, und der
 * Loader nimmt diesen Zeitpunkt statt der Uhr.
 *
 * NEGATIV-KONTROLLEN SIND TRAGEND: "Bank erkannt" wäre auch grün, wenn
 * istMessfixtur() immer true gäbe (Mutant aus s01: rot).
 *
 * Steht hier statt in einer eigenen Datei, weil diese Datei schon in der
 * Scope-Allowlist von hb-deploy steht (homepage-bauer/config/deploy.conf).
 */
const mfReq = (url, kopf) => ({
  url,
  headers: new Headers(kopf === undefined ? {} : {[MESSFIXTUR_KOPF]: kopf}),
});

test('Bank localhost mit Kopf -> Fixtur', () => {
  assert.equal(istMessfixtur(mfReq('http://localhost:3241/pages/live', '1')), true);
});
test('Bank 127.0.0.1 mit Kopf -> Fixtur', () => {
  assert.equal(istMessfixtur(mfReq('http://127.0.0.1:3241/pages/live', '1')), true);
});
test('Bank ::1 mit Kopf -> Fixtur', () => {
  assert.equal(istMessfixtur(mfReq('http://[::1]:3241/pages/live', '1')), true);
});
test('Bank ohne Kopf -> Shop-Daten', () => {
  assert.equal(istMessfixtur(mfReq('http://localhost:3241/pages/live')), false);
});
test('Bank mit anderem Wert -> Shop-Daten', () => {
  assert.equal(istMessfixtur(mfReq('http://localhost:3241/pages/live', '0')), false);
});
test('qiblanco.com mit Kopf -> Shop-Daten', () => {
  assert.equal(istMessfixtur(mfReq('https://qiblanco.com/pages/live', '1')), false);
});
test('Oxygen-Vorschau mit Kopf -> Shop-Daten', () => {
  assert.equal(istMessfixtur(mfReq('https://x.o2.myshopify.dev/pages/live', '1')), false);
});
test('localhost als Subdomain -> Shop-Daten', () => {
  assert.equal(
    istMessfixtur(mfReq('https://localhost.qiblanco.com/pages/live', '1')),
    false,
  );
});
test('kaputte URL -> Shop-Daten', () => {
  assert.equal(istMessfixtur(mfReq('nicht-url', '1')), false);
});
test('Name ist der, den homepage-bauer probe_live_pixelsoll_haelt erwartet', () => {
  assert.equal(MESSFIXTUR_NAME, 'coming-home-live');
  assert.equal(MESSFIXTUR_KOPF, 'x-hbfmt-messfixtur');
});

test('Fixtur zeigt den vollen Zustand zu festem Zeitpunkt', () => {
  assert.ok(!Number.isNaN(new Date(MESSFIXTUR_JETZT).getTime()));
  const {artikel, ladeFehler, jetzt} = messfixturDaten();
  assert.equal(ladeFehler, false);
  assert.equal(jetzt.toISOString(), new Date(MESSFIXTUR_JETZT).toISOString());
  const d = liveSeitenDaten(artikel, jetzt);
  assert.equal(d.naechster.quelle, 'blog');
  assert.ok(d.naechster.uhrzeit, 'Vorschau mit Uhrzeit');
  assert.ok(d.naechster.titel, 'Vorschau mit Titel');
  assert.ok(d.naechster.teaser, 'Vorschau mit Auszug');
  assert.equal(d.naechster.extern, null);
  assert.equal(d.rueckblicke.length, 3);
  assert.ok(d.rueckblicke[0].html.length > 100, 'neuester Rückblick mit Inhalt');
});

test('Fixtur hängt nicht an der Uhr: zwei Aufrufe liefern dieselben Daten', () => {
  const a = messfixturDaten();
  const b = messfixturDaten();
  assert.deepEqual(
    JSON.parse(JSON.stringify(liveSeitenDaten(a.artikel, a.jetzt))),
    JSON.parse(JSON.stringify(liveSeitenDaten(b.artikel, b.jetzt))),
  );
  assert.equal(MESSFIXTUR_FIXTUR, 'drei');
});

test('Loader: Kopf vor Blog und Uhr, Marker an termin und rueckblick', () => {
  const quelle = ohneProsaMf(
    readFileSync(new URL('../app/routes/pages.live.jsx', import.meta.url), 'utf8'),
  );
  assert.match(quelle, /const mess = istMessfixtur\(request\)/);
  assert.match(quelle, /seitenDaten\(artikel, jetzt\)/);
  // Keine zweite Uhr in der Route, die am Messkopf vorbeiliefe.
  assert.equal((quelle.match(/new Date\(\)/g) || []).length, 1);
  assert.doesNotMatch(quelle, /Date\.now\(/);
  // Termin-Bereich (LiveNeu und seit dem Rework 12.11.2026 auch TerminApple
  // der Apple-Fassung) und beide Rückblick-Fassungen tragen den Marker.
  assert.equal((quelle.match(/data-messfixtur=\{messfixtur \|\| undefined\}/g) || []).length, 4);
});
