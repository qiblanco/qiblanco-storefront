/**
 * Die fünf Ziele des Kritik-Suchers überleben die Ad-Weiche.
 * Grossjob 20260916-wer-kritik-sucht-soll-uns-zuerst-finden, Segment s04.
 *
 * WAS DIESER TEST BEWEIST: ein bezahlter Klick auf eines der fünf Ziele, die
 * Christians Auftrag vom 2026-09-16 namentlich nennt, wird NICHT auf LP A
 * umgeleitet. Ohne das bricht die Kritik-Anzeige ihr eigenes Versprechen:
 * der Sucher tippt "Qi Blanco Kritik" und landet auf der Kaufseite.
 *
 * DIE NEGATIV-KONTROLLE IST TRAGEND, NICHT SCHMUCK: ein Test, der nur
 * "diese fünf werden nicht umgeleitet" prüft, wäre auch dann grün, wenn
 * jemand die Weiche ganz abschaltet oder die Ausschlussliste auf alles
 * ausweitet. Deshalb prüft er im selben Lauf, dass die Weiche anderswo
 * WEITER feuert — und zwar auf der Startseite und auf /pages/wirkt-das,
 * das bewusst NICHT in der Liste steht.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
// sm-ausnahme: Test-Fixture — die URLs sind nachgebaute Eingaben für
// entscheideAdWeiche(), kein Abruf und kein Zulauf auf einen echten Shop.
import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';

/**
 * NACHTRAG 2026-09-19 (Job 20260919-kritikanzeige-weiche-ausschluss-und-
 * anzeige-scharf): DIE LISTE HIESS "die fünf" UND ZAEHLTE DIE FALSCHEN FÜNF.
 * Sie entstand am 2026-09-16; seither hat die AdGroup einen Sitelink dazu
 * bekommen und einen pausiert. Am Konto nachgemessen (GAQL ad_group_asset,
 * ad_group.id=197449168702, field_type=SITELINK) gilt heute:
 *   ENABLED (5): /pages/studien, /pages/erfahrungen, /pages/kritik,
 *                /blogs/wissen, /pages/so-wirkt-kohaerentes-wasser
 *   PAUSED  (1): /pages/technologie (Asset 419586567404)
 * Die beiden Mengen stehen deshalb jetzt GETRENNT da. Zusammengelegt wären
 * sie wieder eine Behauptung über den Kontostand statt eine Messung: der
 * Test würde weiter "fünf" sagen und dabei vier live geschaltete Ziele und
 * ein pausiertes meinen — genau der Fehler, der diesen Job ausgelöst hat.
 */

// Die fünf HEUTE ENABLED Sitelink-Ziele. Diese Menge trägt das
// Erfuellungskriterium des Auftrags und wird am Rand nachgemessen.
const KRITIK_ZIELE = [
  '/pages/kritik',
  '/blogs/wissen',
  '/pages/studien',
  '/pages/erfahrungen',
  '/pages/so-wirkt-kohaerentes-wasser',
];

// Der pausierte sechste. Er steht in der Ausschlussliste, damit der im
// Auftrag genannte Rückweg (`gads-assetlink schalte --asset 419586567404
// ... --auf ENABLED`) nicht sofort wieder auf der Kaufseite endet. Er wird
// hier MITGEPRÜFT, aber getrennt gezählt — sonst verschwindet der
// Unterschied zwischen "live" und "vorgehalten" wieder im Wort "fünf".
const RUECKWEG_ZIEL = '/pages/technologie';

// Beide Paid-Erkennungen, die Google-Klicks real tragen. utm_medium=paid steht
// im Meta-Template, gclid setzt Googles Auto-Tagging. fbclid ALLEIN ist
// bewusst kein Paid-Marker und wird darum hier nicht gemessen.
const PAID = ['utm_medium=paid&utm_source=google', 'gclid=TESTS04'];

test('die fünf ENABLED Kritik-Ziele sind ausgeschlossen', () => {
  assert.equal(KRITIK_ZIELE.length, 5, 'der Auftrag nennt genau fünf Ziele');
  for (const p of KRITIK_ZIELE) {
    assert.equal(istAusgeschlossen(p), true, `${p} muss ausgeschlossen sein`);
  }
});

test('der pausierte sechste bleibt vorgehalten ausgeschlossen', () => {
  assert.equal(istAusgeschlossen(RUECKWEG_ZIEL), true);
  assert.equal(
    entscheideAdWeiche(`https://qiblanco.com${RUECKWEG_ZIEL}?gclid=X`), null,
    'sonst endet der Rückweg zum sechsten Sitelink sofort wieder auf LP A');
});

test('bezahlter Klick auf ein Kritik-Ziel wird nicht umgeleitet', () => {
  for (const p of KRITIK_ZIELE) {
    for (const q of PAID) {
      assert.equal(
        entscheideAdWeiche(`https://qiblanco.com${p}?${q}`), null,
        `${p}?${q} darf nicht auf LP A geworfen werden`);
    }
  }
});

test('Artikelpfade unter /blogs/wissen erben den Ausschluss', () => {
  assert.equal(
    entscheideAdWeiche('https://qiblanco.com/blogs/wissen/ein-artikel?gclid=X'),
    null);
});

test('NEGATIV-KONTROLLE: die Weiche feuert anderswo weiter', () => {
  // Startseite: größter bezahlter Eintritt, muss weiter auf LP A gehen.
  const start = entscheideAdWeiche('https://qiblanco.com/?utm_medium=paid');
  assert.notEqual(start, null, 'die Startseite muss weiter umgeleitet werden');
  assert.ok(start.ziel.startsWith(LP_A_PFAD));
  // /pages/wirkt-das steht bewusst NICHT in der Liste.
  const wirkt = entscheideAdWeiche('https://qiblanco.com/pages/wirkt-das?gclid=X');
  assert.notEqual(wirkt, null, '/pages/wirkt-das steht bewusst nicht in der Liste');
});

test('NEGATIV-KONTROLLE: ohne Paid-Marker urteilt die Weiche gar nicht', () => {
  assert.equal(entscheideAdWeiche('https://qiblanco.com/pages/kritik'), null);
  assert.equal(entscheideAdWeiche('https://qiblanco.com/'), null);
});
