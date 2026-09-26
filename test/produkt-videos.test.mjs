/**
 * test/produkt-videos.test.mjs — die Regeln der Videos im Vorschaustreifen.
 *
 * Maßnahme „Produktseite, die verkauft“ (Grossjob growth-m-lp-produktseite-
 * verkauft, 26.09.2026). Geprüft wird das Datenmodul, das die Kaufseiten
 * rendern; die Wirkung am Kundenrand misst die Rand-Probe
 * claude-jobs/growth-m-lp-produktseite-verkauft/pruefungen/
 * probe_produktvideos_am_rand.py.
 *
 * Lauf:  node --test test/produkt-videos.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PRODUKT_VIDEOS,
  BEDIENUNG,
  WIE_FUNKTIONIERT_LINK,
  WIE_FUNKTIONIERT_PFAD,
  aktiveVideos,
  produktName,
  videoMarke,
} from '../app/data/produkt-videos.js';

const https = (u) => typeof u === 'string' && u.startsWith('https://');

test('jedes aktive Video hat Titel, abspielbare Quelle und Standbilder', () => {
  for (const [handle, eintrag] of Object.entries(PRODUKT_VIDEOS)) {
    assert.ok(eintrag.produkt, `${handle}: Produktname fehlt`);
    for (const v of aktiveVideos(handle)) {
      assert.ok(v.id && /^[a-z0-9-]+$/.test(v.id), `${handle}: ungültige id ${v.id}`);
      assert.ok(v.titel && v.titel.trim(), `${v.id}: Titel fehlt`);
      assert.ok(https(v.mp4) || https(v.hls), `${v.id}: keine https-Quelle`);
      if (v.hls) assert.ok(https(v.hls), `${v.id}: HLS nicht https`);
      assert.ok(https(v.mp4), `${v.id}: mp4-Rückfall fehlt`);
      assert.ok(https(v.poster), `${v.id}: Poster fehlt`);
      assert.ok(https(v.vorschau), `${v.id}: Vorschaubild fehlt`);
      assert.ok(['quadrat', 'hoch', 'quer'].includes(v.format), `${v.id}: Format ${v.format}`);
      assert.equal(typeof v.ton, 'boolean', `${v.id}: ton muss boolean sein`);
      if (v.link) {
        assert.ok(v.link.href.startsWith('/pages/'), `${v.id}: Link nicht intern`);
        assert.ok(v.link.text, `${v.id}: Linktext fehlt`);
      }
    }
  }
});

test('das erste aktive Video jedes Produkts ist sein Zellvideo (Vertrag mit der Rand-Probe)', () => {
  for (const handle of Object.keys(PRODUKT_VIDEOS)) {
    const liste = aktiveVideos(handle);
    if (!liste.length) continue;
    assert.equal(liste[0].art, 'zellen', `${handle}: erstes Video ist ${liste[0].art}`);
    assert.equal(liste[0].id, `zellen-${handle}`, `${handle}: Zellvideo-id`);
  }
});

test('ids sind über alle Produkte eindeutig, die Pixel-Marke hat einen Namensraum', () => {
  const ids = Object.keys(PRODUKT_VIDEOS).flatMap((h) => PRODUKT_VIDEOS[h].videos.map((v) => v.id));
  assert.equal(new Set(ids).size, ids.length, 'doppelte id');
  const v = aktiveVideos('qione-2-pro')[0];
  assert.equal(videoMarke(v), 'galerie:zellen-qione-2-pro');
});

test('Rückweg ohne Code: aktiv:false nimmt ein Video heraus, unbekannter Handle rendert nichts', () => {
  const eintrag = PRODUKT_VIDEOS['qione-2-pro'];
  const vorher = aktiveVideos('qione-2-pro').length;
  const v = eintrag.videos[1];
  const alt = v.aktiv;
  try {
    v.aktiv = false;
    assert.equal(aktiveVideos('qione-2-pro').length, vorher - 1);
  } finally {
    v.aktiv = alt;
  }
  assert.deepEqual(aktiveVideos('gibt-es-nicht'), []);
  assert.equal(produktName('gibt-es-nicht'), '');
});

test('QiHome Air hat noch keine Kachel (kein Zellvideo, wartet auf Christians Material)', () => {
  assert.deepEqual(aktiveVideos('qihome-air'), []);
});

test('Wie-funktioniert-Link bleibt aus, bis Christian entscheidet, und zeigt auf die gebaute Seite', () => {
  assert.equal(WIE_FUNKTIONIERT_LINK, false);
  assert.equal(WIE_FUNKTIONIERT_PFAD, '/pages/wie-funktioniert-der-gitterchip-im-qione');
});

test('Bedienwörter: Einzahl und Mehrzahl, echte Umlaute', () => {
  assert.equal(BEDIENUNG.kachel(1), 'Video');
  assert.equal(BEDIENUNG.kachel(3), '3 Videos');
  assert.equal(BEDIENUNG.zumachen, 'Schließen');
  assert.equal(BEDIENUNG.kachelLabel('QiOne® 2 Pro', 3), '3 Videos zum QiOne® 2 Pro ansehen');
});

test('kein Ersatzwortlaut: sichtbare Texte sind Bestand oder leer', () => {
  // Christian schreibt die Texte der Kaufseiten selbst (Leitplanke Folie 15).
  // Dieses Modul trägt nur Bestandswortlaute; neue Sätze gehören in seinen
  // Wortlaut, nicht hierher. Wer hier einen Satz ergänzt, ergänzt ihn in
  // dieser Liste bewusst.
  const erlaubt = new Set([
    'Zellbiologisch geprüft',
    'Deutlich gesteigerte Zellregeneration, trotz starkem E-Smog Einfluss',
    'Wissenschaftliche Publikation an Darmepithelzellen, veröffentlicht in Applied Cell Biology 2021',
    'Daniela Cebula: Kein Tag ohne QiOne',
    'Aus dem Daniela Cebula Podcast',
    'Der GitterChip™ in Aktion',
    'Schutzwirkung des QiBracelet® gegen oxidativen Stress',
    'Wissenschaftliche Publikation zum Schutz vor oxidativem Stress, veröffentlicht in Applied Cell Biology am 12. Januar 2024',
    '',
  ]);
  for (const handle of Object.keys(PRODUKT_VIDEOS)) {
    for (const v of PRODUKT_VIDEOS[handle].videos) {
      for (const feld of ['titel', 'text', 'quelle']) {
        assert.ok(erlaubt.has(v[feld] || ''), `${v.id}.${feld} ist kein Bestandswortlaut: ${v[feld]}`);
      }
    }
  }
});
