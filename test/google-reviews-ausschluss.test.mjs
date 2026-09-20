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
/**
 * Baut eine Roh-Rezension. ERSTES ARGUMENT IST DIE GOOGLE-`id` — der stabile
 * Schlüssel, an dem der Ausschluss hängt. Die `hashId` wird bewusst
 * ABWEICHEND gesetzt (Präfix `wandert-`): sie ist im echten Feed nicht
 * stabil (gemessen 2026-09-20: Sprung bei unverändertem Text), und kein
 * Testfall darf versehentlich über sie greifen und dadurch grün werden.
 */
function roh(googleId, text, zeitText = 'vor 1 Monat', hashId = null) {
  return {
    id: googleId,
    hashId: hashId === null ? `wandert-${googleId}-${zeitText}` : hashId,
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
    // Der Schlüssel MUSS die Google-id sein, nicht die wandernde hashId.
    // Eine rein numerische Kennung ist genau die alte, verfallene Form —
    // sie hier durchzulassen hiesse, den Fehler wieder einzubauen.
    assert.ok(e.googleId && e.googleId.length > 20, `googleId fehlt/zu kurz: ${e.googleId}`);
    assert.ok(
      !/^-?\d+$/.test(e.googleId),
      `googleId sieht aus wie eine hashId (${e.googleId}) — die wandert und taugt nicht als Schlüssel`,
    );
    assert.ok(e.grund && e.grund.length > 40, `Grund zu dünn bei ${e.googleId}`);
    assert.match(e.belegtAm, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(AUSSCHLUSS_IDS.size, GOOGLE_REVIEWS_AUSSCHLUSS.length, 'doppelte googleId');
});

test('C1 (ROT-ARM) — eine ausgeschlossene Rezension verlässt den Chokepoint nicht', () => {
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const out = normalisiereReputonAntwort(
    feedMit([
      roh(eintrag.googleId, 'Ausgeschlossener Text, lang genug zum Durchkommen.'),
      roh('99999901', 'Eine echte, begeisterte Rezension — die bleibt.'),
    ]),
  );
  const quellIds = out.reviews.map((r) => r.quellId);
  assert.ok(
    !quellIds.includes(eintrag.googleId),
    `LECK: ${eintrag.googleId} wurde ausgeliefert`,
  );
  assert.ok(quellIds.includes('99999901'), 'der Filter hat zu viel weggenommen');
  assert.equal(out.ausschlussTreffer[eintrag.googleId], 1);
});

test('C2 — der Ausschluss greift VOR dem Deckel, kostet also keinen Platz', () => {
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const viele = [roh(eintrag.googleId, 'Ausgeschlossen, steht ganz vorn.')];
  for (let i = 0; i < 60; i++) viele.push(roh(`8${i}`, `Echte Rezension Nummer ${i}.`));
  const out = normalisiereReputonAntwort(feedMit(viele));
  assert.equal(out.reviews.length, 50, 'MAX_REVIEWS nicht ausgeschöpft');
  assert.ok(!out.reviews.map((r) => r.quellId).includes(eintrag.googleId));
});

test('C3 — keine Übergriffigkeit: ohne Ausschlussfall bleibt alles stehen', () => {
  const out = normalisiereReputonAntwort(
    feedMit([roh('77770001', 'Begeistert!'), roh('77770002', 'Großartig, danke!')]),
  );
  assert.equal(out.reviews.length, 2);
  for (const e of GOOGLE_REVIEWS_AUSSCHLUSS) {
    assert.equal(out.ausschlussTreffer[e.googleId], 0);
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
  assert.deepEqual(out.reviews.map((r) => r.quellId), ['66660001']);
});

test('C5 — wendeAusschlussAn zählt und fällt nicht auf Unrat herein', () => {
  assert.deepEqual(wendeAusschlussAn(null).reviews, []);
  assert.deepEqual(wendeAusschlussAn(undefined).reviews, []);
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const r = wendeAusschlussAn([{quellId: eintrag.googleId}, {quellId: null}, {}]);
  assert.equal(r.treffer[eintrag.googleId], 1);
  assert.equal(r.reviews.length, 2);
  // RÜCKFALL: liefert der Feed einmal keine hashId, legt
  // normalisiereReputonAntwort die Google-id in `id` ab. Auch dann muss der
  // Eintrag greifen — sonst macht ein Feld-Ausfall den Ausschluss still
  // wirkungslos.
  const r2 = wendeAusschlussAn([{id: eintrag.googleId}]);
  assert.equal(r2.treffer[eintrag.googleId], 1);
  assert.equal(r2.reviews.length, 0);
});

test('C6 (ANLASSFALL) — die hashId wandert, der Ausschluss greift trotzdem', () => {
  // DER FALL, DER DIESEN UMBAU AUSGELÖST HAT, gemessen am DACH-Live-Feed
  // 2026-09-20: dieselbe Rezension, unveränderter Text (1954 Zeichen),
  // unveränderte Google-id — hashId aber von -582554336 auf -1130994804
  // gesprungen. Der erste Bau (2026-09-18) hing an der hashId und wäre nach
  // dem Merge still wirkungslos gewesen.
  //
  // Zwei Abrufe DESSELBEN Gegenstands mit VERSCHIEDENER hashId; beide Male
  // muss die Rezension verschwinden. Hinge der Filter wieder an der hashId,
  // wäre höchstens einer der beiden Arme grün.
  const eintrag = GOOGLE_REVIEWS_AUSSCHLUSS[0];
  const text = 'Derselbe Text, zweimal abgerufen — nur die hashId wandert.';
  for (const [lauf, hashId] of [
    ['vorher', '-582554336'],
    ['nachher', '-1130994804'],
  ]) {
    const out = normalisiereReputonAntwort(
      feedMit([
        roh(eintrag.googleId, text, 'vor 9 Monaten', hashId),
        roh('99999902', 'Eine echte Rezension — die bleibt.'),
      ]),
    );
    assert.ok(
      !out.reviews.map((r) => r.quellId).includes(eintrag.googleId),
      `LECK im Lauf '${lauf}' (hashId ${hashId}): der Ausschluss hängt wieder an der wandernden Kennung`,
    );
    assert.equal(out.ausschlussTreffer[eintrag.googleId], 1, `Lauf '${lauf}'`);
    assert.equal(out.reviews.length, 1, `Lauf '${lauf}': zu viel weggenommen`);
  }
});
