/**
 * Der Landeplatz für „Qi Blanco Bewertungen" überlebt die Ad-Weiche.
 * Grossjob 20260921-GROSSJOB-die-bewertenden-markenbegriffe-gehoeren-uns,
 * Segment s04.
 *
 * WAS DIESER TEST BEWEIST: ein bezahlter Klick auf /pages/bewertungen wird
 * NICHT auf LP A umgeleitet. Ohne das bräche der Sitelink, den Segment s05 an
 * die Marken-Kampagne hängt, sein eigenes Versprechen: der Sucher tippt
 * „Bewertungen" und landet auf einem Kaufversprechen — der Fall der fünf
 * Kritik-Ziele vor PR #541, nur einen Begriff weiter.
 *
 * EIGENE DATEI, nicht ein Eintrag in ad-weiche-kritik-ziele.test.mjs: jene
 * Datei zählt die ENABLED Sitelinks der Kritik-AdGroup 197449168702 gegen den
 * Kontostand („genau fünf"). Dieser Pfad gehört zu einer anderen AdGroup und
 * würde dort die Zählung verfälschen.
 *
 * DIE NEGATIV-KONTROLLE IST TRAGEND: ein Test, der nur „dieser Pfad wird nicht
 * umgeleitet" prüft, wäre auch grün, wenn jemand die Weiche abschaltet. Deshalb
 * prüft er im selben Lauf, dass sie auf der Startseite WEITER feuert.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
// sm-ausnahme: Test-Fixture — die URLs sind nachgebaute Eingaben für
// entscheideAdWeiche(), kein Abruf und kein Zulauf auf einen echten Shop.
import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';

const ZIEL = '/pages/bewertungen';

// Beide Paid-Erkennungen, die Google-Klicks real tragen (Auto-Tagging gclid
// und das utm-Template). fbclid ALLEIN ist bewusst kein Paid-Marker.
const PAID = ['utm_medium=paid&utm_source=google', 'gclid=TESTS04BEW', 'gad_source=1&gclid=X'];

test('/pages/bewertungen ist in AUSSCHLUSS_SEGMENTE', () => {
  assert.equal(istAusgeschlossen(ZIEL), true);
});

test('bezahlter Klick auf /pages/bewertungen bleibt auf der Seite', () => {
  for (const q of PAID) {
    assert.equal(
      entscheideAdWeiche(`https://qiblanco.com${ZIEL}?${q}`), null,
      `${ZIEL}?${q} darf nicht auf LP A geworfen werden`);
  }
});

test('NEGATIV-KONTROLLE: die Weiche feuert anderswo weiter', () => {
  const start = entscheideAdWeiche('https://qiblanco.com/?utm_medium=paid');
  assert.notEqual(start, null, 'die Startseite muss weiter umgeleitet werden');
  assert.ok(start.ziel.startsWith(LP_A_PFAD));
  // Ein Nachbarpfad, der NICHT in der Liste steht, wird weiter umgeleitet —
  // der Ausschluss ist exakt oder '<eintrag>/...', kein Präfix.
  assert.notEqual(
    entscheideAdWeiche('https://qiblanco.com/pages/bewertungen-alt?gclid=X'), null,
    'ein Suffix-Slug erbt den Ausschluss nicht');
});
