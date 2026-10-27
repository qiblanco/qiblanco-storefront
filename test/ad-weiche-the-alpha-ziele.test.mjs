/**
 * Die drei The-Alpha-Landingpages und ihre alten Adressen überleben die Ad-Weiche.
 * Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * Segment s06 (Umzug qi-alpha -> the-alpha, Christian Z4 vom 25.10.2026).
 *
 * WAS DIESER TEST BEWEIST: ein bezahlter Klick auf A (/pages/The-Alpha),
 * C (/pages/The-Alpha-B) oder B (/pages/The-Alpha-C) wird NICHT auf LP A
 * (Schlafseite) umgeleitet, in jeder Schreibweise. Live gemessen am
 * 2026-10-25T16:00Z: /pages/The-Alpha?gclid=x gab 302 auf
 * /pages/schlaf-zellen-schutz?gclid=x&lp_m=w. Die drei Seiten sind die Arme
 * des A/B/C-Tests; ohne Ausschluss stünden alle drei für Google-Verkehr leer.
 *
 * DIE ALTEN ADRESSEN (/pages/qi-master-vorverkauf, /pages/qi-alpha-vorverkauf,
 * /pages/qi-alpha-b) leiten per 301 auf /pages/The-Alpha. Ein alter Link mit
 * gclid käme sonst gar nicht bis zur 301, sondern vorher auf LP A.
 *
 * SCHREIBWEISE: /pages/the-alpha und /pages/THE-ALPHA leiten per 301 auf
 * /pages/The-Alpha. Die Weiche läuft vor der Route; sie muss diese
 * Schreibweisen deshalb selbst als ausgeschlossen erkennen.
 *
 * NEGATIV-KONTROLLE (tragend): die Weiche feuert auf der Startseite und auf
 * /pages/wirkt-das weiter. Sonst wäre der Test auch bei abgeschalteter Weiche grün.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
// sm-ausnahme: Test-Fixture — die URLs sind nachgebaute Eingaben für
// entscheideAdWeiche(), kein Abruf und kein Zulauf auf einen echten Shop.
import {entscheideAdWeiche, istAusgeschlossen} from '../app/lib/ad-weiche.server.js';

// Seit dem Umzug Qi Alpha (Christian Z1 vom 27.10.2026) leben die Arme unter
// /pages/Qi-Alpha*, die The-Alpha-Pfade sind 301-Hüllen und bleiben ausgeschlossen.
const ARME = ['/pages/Qi-Alpha', '/pages/Qi-Alpha-B', '/pages/Qi-Alpha-C', '/pages/The-Alpha', '/pages/The-Alpha-B', '/pages/The-Alpha-C'];
const ALTE_LPS = [
  '/pages/qi-master-vorverkauf',
  '/pages/qi-alpha-vorverkauf',
  '/pages/qi-alpha-b',
];
const SCHREIBWEISEN = [
  '/pages/the-alpha',
  '/pages/THE-ALPHA',
  '/pages/the-alpha-b',
  '/pages/THE-ALPHA-C',
  '/pages/Qi-Alpha-B',
  '/pages/QI-MASTER-VORVERKAUF',
  '/pages/qi-alpha',
  '/pages/QI-ALPHA-C',
];
const PAID = ['utm_medium=paid&utm_source=google', 'gclid=TESTS06'];
const BASIS = 'https://qiblanco.com';

for (const pfad of [...ARME, ...ALTE_LPS, ...SCHREIBWEISEN]) {
  test(`${pfad} ist von der Ad-Weiche ausgeschlossen`, () => {
    assert.equal(istAusgeschlossen(pfad), true);
    for (const q of PAID) {
      assert.equal(entscheideAdWeiche(`${BASIS}${pfad}?${q}`), null, `${pfad}?${q}`);
    }
  });
}

test('Negativ-Kontrolle: die Weiche feuert anderswo weiter', () => {
  for (const pfad of ['/', '/pages/wirkt-das', '/pages/the-alpha-x', '/pages/qi-alpha-x']) {
    for (const q of PAID) {
      const e = entscheideAdWeiche(`${BASIS}${pfad}?${q}`);
      assert.ok(e && e.ziel.includes('/pages/schlaf-zellen-schutz'), `${pfad}?${q}`);
    }
  }
});
