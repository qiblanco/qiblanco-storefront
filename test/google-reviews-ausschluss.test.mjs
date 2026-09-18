import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, unlinkSync} from 'node:fs';
import {
  GOOGLE_REVIEWS_AUSSCHLUSS,
  AUSSCHLUSS_IDS,
  wendeAusschlussAn,
} from '../app/lib/googleReviewsAusschluss.js';

/**
 * googleRating.js benutzt den Vite-Alias `~/lib/…`, den node nicht kennt —
 * das Hausmuster (test/datumsfelder-zone-naht.test.mjs) liest solche Module
 * deshalb als TEXT. Text allein kann den Filter aber nicht AUSFUEHREN, und
 * ein Rot-Nachweis am Quelltext belegt nur die Schreibweise.
 *
 * Also: dieselbe Datei, `~/lib/` auf `./` umgeschrieben, als Geschwisterdatei
 * neben dem Original abgelegt — dort lösen die relativen Importe und
 * node_modules genauso auf wie im Bau. Der Name trägt die PID, weil zwei
 * gleichzeitige Läufe sonst denselben Pfad wählen (die Kollision ist
 * korreliert, nicht zufällig). Die Datei wird in jedem Fall wieder entfernt.
 */
const originalUrl = new URL('../app/lib/googleRating.js', import.meta.url);
const schattenUrl = new URL(
  `../app/lib/.test-googleRating-${process.pid}.mjs`,
  import.meta.url,
);
writeFileSync(
  schattenUrl,
  readFileSync(originalUrl, 'utf8').replace(
    /from '~\/lib\/([A-Za-z0-9_.-]+)'/g,
    (_m, name) => `from './${name}${name.endsWith('.js') ? '' : '.js'}'`,
  ),
);
let normalisiereReputonAntwort;
try {
  ({normalisiereReputonAntwort} = await import(schattenUrl.href));
} finally {
  unlinkSync(schattenUrl);
}

/**
 * Hermetischer Wächter des Rezensions-Ausschlusses.
 *
 * ROT-ARM IST C1: er baut eine Feed-Antwort, die eine ausgeschlossene
 * Rezension enthält, und fährt sie durch dieselbe Funktion, die im
 * root-Loader läuft. Vor dem Bau vom 2026-09-18 kam sie dort heil heraus —
 * das war der Live-Zustand, nicht ein gestellter. Ein Rückbau des Filters
 * rötet genau diesen Arm.
 *
 * Die Fixture NENNT den Ausschluss nicht, sie LIEST ihn: die Testdaten
 * entstehen aus GOOGLE_REVIEWS_AUSSCHLUSS. Wird ein Eintrag entfernt oder
 * kommt einer dazu, wandert der Test mit, statt zu verfallen. Ist die Liste
 * leer, gibt es nichts zu prüfen — das meldet C0 als Messausfall und nie
 * als Erfolg.
 */

function feedMit(reviews) {
  return {business: [{rating: 4.8, reviewsNumber: 440, reviews}]};
}
function roh(id, text, zeitText = 'vor 1 Monat') {
  return {
    hashId: id,
    authorName: 'Test',
    rating: 5,
    text,
    hide: false,
    relativeTimeDescription: zeitText,
    time: 1770000000,
  };
}

test('C0 — die Ausschlussliste hat überhaupt einen Gegenstand', () => {
  assert.ok(
    GOOGLE_REVIEWS_AUSSCHLUSS.length > 0,
    'MESSAUSFALL: leere Ausschlussliste — dieser Test kann nichts belegen.',
  );
  for (const e of GOOGLE_REVIEWS_AUSSCHLUSS) {
    assert.match(e.id, /^-?\d+$/, `id unplausibel: ${e.id}`);
    assert.ok(e.grund && e.grund.length > 40, `Grund zu dünn bei ${e.id}`);
    assert.match(e.belegtAm, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(AUSSCHLUSS_IDS.size, GOOGLE_REVIEWS_AUSSCHLUSS.length, 'doppelte id');
});

test('C1 (ROT-ARM) — eine ausgeschlossene Rezension verlässt den Chokepoint nicht', () => {
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const out = normalisiereReputonAntwort(
    feedMit([
      roh(eintrag.id, 'Ausgeschlossener Text, lang genug zum Durchkommen.'),
      roh('99999901', 'Eine echte, begeisterte Rezension — die bleibt.'),
    ]),
  );
  const ids = out.reviews.map((r) => r.id);
  assert.ok(!ids.includes(eintrag.id), `LECK: ${eintrag.id} wurde ausgeliefert`);
  assert.ok(ids.includes('99999901'), 'der Filter hat zu viel weggenommen');
  assert.equal(out.ausschlussTreffer[eintrag.id], 1);
});

test('C2 — der Ausschluss greift VOR dem Deckel, kostet also keinen Platz', () => {
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const viele = [roh(eintrag.id, 'Ausgeschlossen, steht ganz vorn.')];
  for (let i = 0; i < 60; i++) viele.push(roh(`8${i}`, `Echte Rezension Nummer ${i}.`));
  const out = normalisiereReputonAntwort(feedMit(viele));
  assert.equal(out.reviews.length, 50, 'MAX_REVIEWS nicht ausgeschöpft');
  assert.ok(!out.reviews.map((r) => r.id).includes(eintrag.id));
});

test('C3 — keine Übergriffigkeit: ohne Ausschlussfall bleibt alles stehen', () => {
  const out = normalisiereReputonAntwort(
    feedMit([roh('77770001', 'Begeistert!'), roh('77770002', 'Großartig, danke!')]),
  );
  assert.equal(out.reviews.length, 2);
  for (const e of GOOGLE_REVIEWS_AUSSCHLUSS) {
    assert.equal(out.ausschlussTreffer[e.id], 0);
  }
});

test('C4 — der bestehende Rahmen bleibt unangetastet (5 Sterne, !hide, Text)', () => {
  const out = normalisiereReputonAntwort(
    feedMit([
      roh('66660001', 'Fünf Sterne, sichtbar.'),
      {...roh('66660002', 'Versteckt.'), hide: true},
      {...roh('66660003', 'Vier Sterne.'), rating: 4},
      roh('66660004', '   '),
    ]),
  );
  assert.deepEqual(out.reviews.map((r) => r.id), ['66660001']);
});

test('C5 — wendeAusschlussAn zählt und fällt nicht auf Unrat herein', () => {
  assert.deepEqual(wendeAusschlussAn(null).reviews, []);
  assert.deepEqual(wendeAusschlussAn(undefined).reviews, []);
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  // Zahl statt String: der Feed normalisiert auf String, ein Roh-Aufrufer
  // könnte es nicht tun — der Ausschluss darf daran nicht vorbeigreifen.
  const r = wendeAusschlussAn([{id: Number(eintrag.id)}, {id: null}, {}]);
  assert.equal(r.treffer[eintrag.id], 1);
  assert.equal(r.reviews.length, 2);
});
