/**
 * Die fünf Ziele des Kritik-Suchers ueberleben die Ad-Weiche.
 * Grossjob 20260916-wer-kritik-sucht-soll-uns-zuerst-finden, Segment s04.
 *
 * WAS DIESER TEST BEWEIST: ein bezahlter Klick auf eines der fünf Ziele, die
 * Christians Auftrag vom 2026-09-16 namentlich nennt, wird NICHT auf LP A
 * umgeleitet. Ohne das bricht die Kritik-Anzeige ihr eigenes Versprechen:
 * der Sucher tippt "Qi Blanco Kritik" und landet auf der Kaufseite.
 *
 * DIE NEGATIV-KONTROLLE IST TRAGEND, NICHT SCHMUCK: ein Test, der nur
 * "diese fünf werden nicht umgeleitet" prueft, wäre auch dann gruen, wenn
 * jemand die Weiche ganz abschaltet oder die Ausschlussliste auf alles
 * ausweitet. Deshalb prueft er im selben Lauf, dass die Weiche anderswo
 * WEITER feuert — und zwar auf der Startseite und auf /pages/wirkt-das,
 * das bewusst NICHT in der Liste steht.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';

const KRITIK_ZIELE = [
  '/pages/kritik',
  '/blogs/wissen',
  '/pages/studien',
  '/pages/erfahrungen',
  '/pages/technologie',
];

// Beide Paid-Erkennungen, die Google-Klicks real tragen. utm_medium=paid steht
// im Meta-Template, gclid setzt Googles Auto-Tagging. fbclid ALLEIN ist
// bewusst kein Paid-Marker und wird darum hier nicht gemessen.
const PAID = ['utm_medium=paid&utm_source=google', 'gclid=TESTS04'];

test('die fünf Kritik-Ziele sind ausgeschlossen', () => {
  for (const p of KRITIK_ZIELE) {
    assert.equal(istAusgeschlossen(p), true, `${p} muss ausgeschlossen sein`);
  }
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
