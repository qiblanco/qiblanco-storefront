/**
 * Hermetischer Test der VideoObject-Auszeichnung der Kurs-Lektionen
 * (node --test, ohne Bundler).
 *
 * Er prüft ABSICHTLICH nicht „die Funktion existiert", sondern die
 * Eigenschaften, deren Verletzung real Schaden macht:
 *
 *  - CANONICAL_ORIGIN STIMMT MIT seo.js ÜBEREIN. Die Konstante steht in
 *    kurs-video-schema.js als Literal, weil ein Import die Import-Closure von
 *    seo.js in die Gate-12-Prüfmenge jeder Lektionsseite zöge. DIESER TEST IST
 *    DER RIEGEL GEGEN DIE DRIFT, die dadurch möglich wird — ohne ihn wäre die
 *    Begründung im Dateikopf eine Zusage ohne Träger.
 *  - KEIN KNOTEN OHNE PFLICHTFELD. Ein unvollständiges VideoObject ist
 *    schlechter als keines (Google verwirft es und bucht es als Fehler). Der
 *    Test fährt jedes Pflichtfeld EINZELN gegen den Ausfall seiner Quelle.
 *  - DIE BESCHREIBUNG IST DIESELBE WIE IM <meta>-TAG. Zwei Quellen für
 *    denselben Text driften auseinander; hier wird belegt, dass es eine ist.
 *  - JEDE ROUTE, DIE EINE LEKTION RENDERT, IST AUCH VERDRAHTET — und das
 *    `videoEmbed="…"` ihres Players ist ZEICHENGLEICH mit dem Eintrag in
 *    LEKTIONSVIDEOS. Das ist der eigentliche Grund, warum die URL überhaupt
 *    in der Hilfe stehen darf: ohne diesen Test wären es zwei Wahrheiten, und
 *    das VideoObject könnte eines Tages ein anderes Video nennen als der
 *    Player zeigt, ohne dass es irgendwo auffiele.
 *  - DIE ERNTE UND DIE SEITENBESCHREIBUNGEN DECKEN EINANDER: für jede
 *    verdrahtete Route existiert ein Eintrag in KURS_VIDEOS UND eine
 *    Beschreibung. Fehlt eines, entstünde still kein Knoten — die gefährlichste
 *    Fehlerform, weil sie wie „gebaut" aussieht.
 */
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {test} from 'node:test';

import {CANONICAL_ORIGIN as SEO_ORIGIN} from '../app/lib/seo.js';
import {beschreibungTags} from '../app/lib/seiten-beschreibung.js';
import {
  CANONICAL_ORIGIN,
  KURS_VIDEOS,
  LEKTIONSVIDEOS,
  kursVideoSignale,
  videoKennung,
  vorschaubild,
} from '../app/lib/kurs-video-schema.js';

const PFAD = '/pages/e-smog';
const EINBETTUNG = 'https://www.youtube.com/embed/JmDaIlhOYaA?si=fUstmDJgspa2eDli';
const PFLICHT = ['name', 'description', 'thumbnailUrl', 'uploadDate', 'embedUrl'];

function knoten(args = {}) {
  const raus = kursVideoSignale({pfad: PFAD, ...args});
  return raus.length ? raus[0]['script:ld+json'] : null;
}

test('CANONICAL_ORIGIN driftet nicht von seo.js weg', () => {
  assert.equal(CANONICAL_ORIGIN, SEO_ORIGIN);
});

test('der Knoten trägt jedes Pflichtfeld nicht leer', () => {
  const k = knoten();
  assert.ok(k, 'kein Knoten entstanden');
  assert.equal(k['@type'], 'VideoObject');
  for (const feld of PFLICHT) {
    assert.equal(typeof k[feld], 'string', `${feld} ist kein String`);
    assert.ok(k[feld].trim().length > 0, `${feld} ist leer`);
  }
  assert.match(k.uploadDate, /^\d{4}-\d{2}-\d{2}T/, 'uploadDate ist kein ISO-Datum');
  for (const feld of ['thumbnailUrl', 'embedUrl']) {
    assert.ok(k[feld].startsWith('https://'), `${feld} ist nicht absolut`);
  }
  assert.equal(k['@id'], `${CANONICAL_ORIGIN}${PFAD}#video-JmDaIlhOYaA`);
  assert.equal(k.isPartOf['@id'], `${CANONICAL_ORIGIN}${PFAD}#webpage`);
});

test('embedUrl trägt keine Player-Parameter', () => {
  assert.equal(knoten().embedUrl, 'https://www.youtube.com/embed/JmDaIlhOYaA');
});

test('die Beschreibung ist DIESELBE wie im meta-Tag', () => {
  assert.equal(knoten().description, beschreibungTags(PFAD)[0].content);
});

test('das gepflegte Shopify-Feld schlägt den kuratierten Text — in beiden', () => {
  const aus_shopify = 'Aus dem Shopify-Admin gepflegt.';
  assert.equal(knoten({beschreibung: aus_shopify}).description, aus_shopify);
  assert.equal(beschreibungTags(PFAD, aus_shopify)[0].content, aus_shopify);
});

test('ohne Kennung, ohne Ernte-Eintrag oder ohne Beschreibung entsteht KEIN Knoten', () => {
  assert.deepEqual(kursVideoSignale({pfad: PFAD, einbettung: 'https://example.com/x'}), []);
  // Ein Pfad, den die Tabelle nicht kennt — kein Video, also kein Knoten.
  assert.deepEqual(kursVideoSignale({pfad: '/pages/kein-kurs'}), []);
  assert.deepEqual(kursVideoSignale({}), []);
  // Eine Kennung, die es gibt, aber nicht in der Ernte steht (das TEDx-Video
  // aus dem CMS-Rumpf von /pages/kohaerentes-wasser).
  assert.deepEqual(
    kursVideoSignale({
      pfad: PFAD,
      einbettung: 'https://www.youtube.com/embed/i-T7tCMUDXU',
    }),
    [],
  );
  // Ein Pfad ohne jede Beschreibung — das Pflichtfeld fehlt, also kein Knoten.
  assert.deepEqual(
    kursVideoSignale({pfad: '/pages/gibt-es-nicht', einbettung: EINBETTUNG}),
    [],
  );
});

test('jeder Ernte-Eintrag ist vollständig und plausibel', () => {
  for (const [id, v] of Object.entries(KURS_VIDEOS)) {
    assert.match(id, /^[A-Za-z0-9_-]{11}$/, `${id} ist keine YouTube-Kennung`);
    assert.ok(v.titel && v.titel.trim(), `${id} ohne Titel`);
    assert.match(v.veroeffentlicht, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
      `${id}: veroeffentlicht ist kein ISO-Zeitpunkt`);
    assert.match(v.dauer, /^PT(\d+H)?(\d+M)?(\d+S)?$/, `${id}: dauer ist keine ISO-Dauer`);
    assert.ok(['public', 'unlisted'].includes(v.sichtbarkeit),
      `${id}: ${v.sichtbarkeit} — ein privates Video gehört nicht ins Markup`);
    assert.equal(vorschaubild(id), `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
    assert.equal(videoKennung(`https://www.youtube.com/embed/${id}?si=x`), id);
  }
});

/* ── Die Naht: Route ↔ Hilfe ─────────────────────────────────────────────── */

const ROUTEN = readdirSync(new URL('../app/routes', import.meta.url))
  .filter((f) => f.endsWith('.jsx'))
  .map((f) => [f, readFileSync(new URL(`../app/routes/${f}`, import.meta.url), 'utf8')])
  .filter(([, q]) => /<CourseLesson\b/.test(q) && /videoEmbed=/.test(q));

test('es gibt überhaupt Lektionsrouten — sonst misst der nächste Test nichts', () => {
  assert.ok(ROUTEN.length >= 10, `nur ${ROUTEN.length} Lektionsrouten gefunden`);
});

test('jede Lektionsroute ist verdrahtet und Player-URL == Tabellen-URL', () => {
  for (const [datei, quelle] of ROUTEN) {
    assert.match(quelle, /\.\.\.kursVideoSignale\(\{/, `${datei}: ruft kursVideoSignale nicht auf`);
    const pfad = quelle.match(/\.\.\.kursVideoSignale\(\{\s*\n\s*pfad: '([^']+)'/);
    assert.ok(pfad, `${datei}: kursVideoSignale ohne pfad`);
    const spieler = quelle.match(/videoEmbed="([^"]+)"/);
    assert.ok(spieler, `${datei}: kein videoEmbed im Player`);
    assert.equal(
      LEKTIONSVIDEOS[pfad[1]],
      spieler[1],
      `${datei}: LEKTIONSVIDEOS['${pfad[1]}'] weicht vom videoEmbed des Players ab — `
        + 'das VideoObject nennt dann ein anderes Video als der Player zeigt',
    );
    const id = videoKennung(spieler[1]);
    assert.ok(KURS_VIDEOS[id], `${datei}: ${id} fehlt in KURS_VIDEOS`);
    // Der Knoten muss für DIESE Route wirklich entstehen — sonst ist die
    // Verdrahtung da und wirkungslos.
    assert.equal(
      kursVideoSignale({pfad: pfad[1]}).length,
      1,
      `${datei}: verdrahtet, aber es entsteht kein Knoten (Pfad ${pfad[1]})`,
    );
  }
});

test('die Tabelle enthält keinen Eintrag ohne Route und keinen ohne Ernte', () => {
  const pfadeDerRouten = new Set(
    ROUTEN.map(([, q]) => (q.match(/\.\.\.kursVideoSignale\(\{\s*\n\s*pfad: '([^']+)'/) || [])[1]),
  );
  for (const [pfad, url] of Object.entries(LEKTIONSVIDEOS)) {
    assert.ok(pfadeDerRouten.has(pfad), `LEKTIONSVIDEOS['${pfad}'] hat keine Route`);
    assert.ok(KURS_VIDEOS[videoKennung(url)], `${pfad}: Kennung fehlt in KURS_VIDEOS`);
  }
  assert.equal(Object.keys(LEKTIONSVIDEOS).length, ROUTEN.length);
});

test('keine zwei Lektionsrouten zeigen auf dasselbe Video', () => {
  const gesehen = new Map();
  for (const [datei, quelle] of ROUTEN) {
    const id = videoKennung(quelle.match(/videoEmbed="([^"]+)"/)[1]);
    assert.ok(!gesehen.has(id),
      `${datei} und ${gesehen.get(id)} zeichnen beide ${id} aus — zwei @id für ein Video`);
    gesehen.set(id, datei);
  }
});
