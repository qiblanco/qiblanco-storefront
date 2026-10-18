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
  const code = route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  assert.ok(!/\b19(?:[:.]00)?\s*Uhr/.test(code), 'im Seitentext steht noch 19 Uhr');
  assert.match(code, /Coming Home live: jeden Sonntag um 12 Uhr/, 'Titel ohne 12 Uhr');
  assert.match(code, /Jeden Sonntag um 12 Uhr \(Berliner Zeit\) per Zoom/, 'Beschreibung ohne 12 Uhr Berlin');
  assert.match(code, /wert: 'Jeden Sonntag, 12 Uhr \(Berlin\)'/, 'Eckdatum Wann ohne 12 Uhr (Berlin)');
  assert.match(code, /titel: 'Sonntag um 12 Uhr'/, 'Schritt drei ohne 12 Uhr');
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
