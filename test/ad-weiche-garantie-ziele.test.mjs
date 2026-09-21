/**
 * Die zwei Landeplätze für „20 Tage testen / Rückgabe" überleben die Ad-Weiche.
 * Grossjob 20260921-GROSSJOB-die-bewertenden-markenbegriffe-gehoeren-uns,
 * Segment s04 (Bestandsprüfung der Sitelink-Ziele).
 *
 * WAS DIESER TEST BEWEIST: ein bezahlter Klick auf /pages/das-20-tage-
 * versprechen oder /pages/neu-oder-gebraucht wird NICHT auf LP A umgeleitet.
 * Live gemessen am 2026-09-21 mit ?gclid=S04PROBE: beide gaben 302 auf LP A —
 * ein Sitelink „20 Tage testen" hätte den Sucher auf einem Kaufversprechen
 * abgesetzt.
 *
 * DIE NEGATIV-KONTROLLE IST TRAGEND: die Weiche muss anderswo weiter feuern,
 * sonst wäre der Test auch bei abgeschalteter Weiche grün.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
// sm-ausnahme: Test-Fixture — die URLs sind nachgebaute Eingaben für
// entscheideAdWeiche(), kein Abruf und kein Zulauf auf einen echten Shop.
import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';

const ZIELE = ['/pages/das-20-tage-versprechen', '/pages/neu-oder-gebraucht'];
const PAID = ['utm_medium=paid&utm_source=google', 'gclid=S04PROBE'];

test('beide Garantie-Ziele sind in AUSSCHLUSS_SEGMENTE', () => {
  for (const p of ZIELE) assert.equal(istAusgeschlossen(p), true, `${p} muss ausgeschlossen sein`);
});

test('bezahlter Klick auf ein Garantie-Ziel bleibt auf der Seite', () => {
  for (const p of ZIELE) {
    for (const q of PAID) {
      assert.equal(entscheideAdWeiche(`https://qiblanco.com${p}?${q}`), null,
        `${p}?${q} darf nicht auf LP A geworfen werden`);
    }
  }
});

test('NEGATIV-KONTROLLE: die Weiche feuert anderswo weiter', () => {
  const start = entscheideAdWeiche('https://qiblanco.com/?utm_medium=paid');
  assert.notEqual(start, null, 'die Startseite muss weiter umgeleitet werden');
  assert.ok(start.ziel.startsWith(LP_A_PFAD));
  assert.notEqual(entscheideAdWeiche('https://qiblanco.com/widerruf?gclid=X'), null,
    '/widerruf steht bewusst nicht in der Liste');
});
