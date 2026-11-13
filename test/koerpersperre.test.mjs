/**
 * Die Körpersperre (app/lib/koerpersperre.js): EIN Vokabular für alle Seiten,
 * die kohärentes Wasser oder ein fremdes Gerät erklären.
 *
 * Anlass (Auftrag 20261113-koerpersperre-healy-zweite-kopie): die Healy-Seite
 * führte eine eigene Abschrift der Sperre. Als die Wasser-Liste am 2026-11-13
 * um Entgiften und Körperwort + Wirkverb wuchs, blieb die Abschrift stehen, und
 * „damit deine Zellen besser entgiften" lief dort weiter durch. Dieser Test hält
 * die Sätze der Healy-Seite fest und zählt, wie viele Listen es unter app/ gibt.
 * Die Satzliste der Wasser-Seiten steht in test/hexagonales-wasser-seite.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {join, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {KOERPER_SPERRE, istSchemaSicher} from '../app/lib/koerpersperre.js';

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const HEIMAT = 'app/lib/koerpersperre.js';

/** Führt diese Quelle eine eigene Liste (KOERPER_SPERRE mit Array-Literal belegt)? */
function eigeneListe(quelle) {
  return /\bKOERPER_SPERRE\s*=\s*\[/.test(quelle);
}

/**
 * Alle Quelltexte unter app/, rekursiv, OHNE Punktdateien und -verzeichnisse.
 * Grund (gemessen 2026-11-13 an Gate 22, das alle Testdateien parallel fährt):
 * test/google-reviews-ausschluss.test.mjs legt kurz app/lib/.test-googleRating-
 * server-<pid>.mjs an und löscht sie wieder. Liest dieser Lauf sie zwischen
 * Auflisten und Lesen, endet er mit ENOENT statt mit einem Urteil. Punktdateien
 * sind Test-Schatten und Werkzeug-Ablagen, kein ausgelieferter Quelltext.
 */
function quellen(dir = join(WURZEL, 'app')) {
  const aus = [];
  for (const e of readdirSync(dir, {withFileTypes: true})) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) aus.push(...quellen(p));
    else if (/\.(m?jsx?|tsx?)$/.test(e.name)) aus.push(p);
  }
  return aus;
}

test('Healy-Seite: der Entgiften-Satz und Wirkzusagen über beide Geräte fallen aus dem Schema', () => {
  // Rot-Arm: diese Sätze liefen bis 2026-11-13 durch die Healy-Abschrift
  // (Beleg im Jobordner 20261113-koerpersperre-healy-zweite-kopie/rot-vor-bau.txt).
  const gesperrt = [
    'Trink hexagonales Wasser, damit deine Zellen besser entgiften.',
    'Healy-Programme helfen deinem Körper beim Entgiften.',
    'Ein Detox für deinen Darm.',
    'Der QiOne® 2 Pro stärkt deine Abwehrkräfte.',
    'Er schützt deinen Körper vor Strahlung.',
  ];
  for (const s of gesperrt) assert.equal(istSchemaSicher(s), false, `nicht gesperrt: ${s}`);
});

test('Healy-Seite: Trageweise, Bauart und Versuchsbeschreibung bleiben im Schema', () => {
  // Gegenrichtung, Sätze von der Seite: Körperwort ohne Wirkverb, „stärker"
  // als Adjektiv und das Kundenwort „Schutz" sind keine Zusage.
  const frei = [
    'Am Körper getragen bleibt der QiOne® 2 Pro auf Körpertemperatur, frei in der heißen Luft wird er unangenehm heiß.',
    'Es hat dieselbe Leistung wie der QiOne® 2 Pro und ist für den größeren Abstand zur Körpermitte rund 10 Prozent stärker gebaut.',
    'In der ersten Arbeit von 2021 wurden menschliche Immunzellen vier Stunden lang Handystrahlung ausgesetzt.',
    'Zu Healy Discover gehören Anschlusskabel, Klebeelektroden und zwei Armbänder.',
    'Viele, die nach einer Alternative zu Healy suchen, fragen nach Schutz vor Strahlung von Handy, WLAN und 5G und nach mehr Energie.',
  ];
  for (const s of frei) assert.equal(istSchemaSicher(s), true, `falsch gesperrt: ${s}`);
});

test('ein Vokabular: keine Datei unter app/ führt eine zweite Liste', () => {
  // Rot-Arm des Zauns: die Healy-Abschrift von 2026-10-07 und die alte
  // Wasser-Fassung hätten ihn ausgelöst, ein Re-Export nicht.
  assert.equal(eigeneListe('export const KOERPER_SPERRE = [\n  /Therapie|therapeut/i,\n];'), true);
  assert.equal(eigeneListe("export {KOERPER_SPERRE, istSchemaSicher};"), false);
  assert.equal(eigeneListe("import {KOERPER_SPERRE} from '~/lib/koerpersperre';"), false);

  const mitListe = quellen()
    .filter((p) => eigeneListe(readFileSync(p, 'utf8')))
    .map((p) => relative(WURZEL, p).split('\\').join('/'));
  // Die Heimat muss selbst gefunden werden, sonst hätte der Lauf nichts gesehen.
  assert.deepEqual(mitListe, [HEIMAT], `zweite Liste gefunden: ${mitListe.join(', ')}`);
  assert.ok(KOERPER_SPERRE.length > 0);
});

test('die Healy-Seite holt die Sperre aus der Heimat', () => {
  const quelle = readFileSync(join(WURZEL, 'app/components/campaign/HealyAlternativeSeite.jsx'), 'utf8');
  assert.match(quelle, /from '~\/lib\/koerpersperre'/);
});
