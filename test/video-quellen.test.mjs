/**
 * test/video-quellen.test.mjs — jedes imgix-Video hat eine Shopify-Quelle.
 *
 * Anlass: imgix-Kontingent gekappt (HTTP 402 auf nicht gecachte Segmente),
 * Regelkreis video-spielbarkeit Arm BREIT, 03.10.2026. Geprüft wird, dass
 * KEIN Video der Seiten mehr an imgix hängt, solange VIDEO_QUELLE 'shopify'
 * steht, und dass der Schalter 'imgix' die alten URLs byte-gleich liefert.
 * Die Pfade werden aus app/ GEERNTET, nicht abgetippt: ein neues
 * <ImgixVideo videoPath="..."> ohne Eintrag macht diesen Test rot.
 *
 * Lauf:  node --test test/video-quellen.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  VIDEO_QUELLE,
  IMGIX_HOST,
  SHOPIFY_VIDEOS,
  videoQuellen,
} from '../app/data/video-quellen.js';
import {PRODUKT_VIDEOS} from '../app/data/produkt-videos.js';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');

function dateien(ordner) {
  const aus = [];
  for (const name of readdirSync(ordner)) {
    const p = join(ordner, name);
    if (statSync(p).isDirectory()) aus.push(...dateien(p));
    else if (/\.(jsx?|tsx?)$/.test(name)) aus.push(p);
  }
  return aus;
}

/** Alle imgix-Videopfade, die app/ an <ImgixVideo> oder imgixVideo() gibt. */
function geerntetePfade() {
  const pfade = new Set();
  const muster = [
    /videoPath="([^"]+)"/g,
    /\bvideo:\s*["']([^"']+\.(?:mov|mp4))["']/g,
    /imgixVideo\(\s*['"]([^'"]+)['"]/g,
  ];
  for (const datei of dateien(APP)) {
    const text = readFileSync(datei, 'utf8');
    for (const m of muster) for (const t of text.matchAll(m)) pfade.add(t[1]);
  }
  return [...pfade];
}

test('die Ernte findet die bekannten Einbindungen (Positivkontrolle)', () => {
  const pfade = geerntetePfade();
  // Mindestens die vier Seiten-Videos, an denen der 402-Befund gemessen wurde.
  for (const p of [
    'VIDEO-QiOne60s-DE-2021.mov',
    '240417_QIHome_Wohlfuehloase_16x9_EN.mov',
    '360-QiHome-1x1.mov',
    'Bracelet_Study_1x1_DE.mp4',
  ]) {
    assert.ok(pfade.includes(p), `Ernte blind für ${p}`);
  }
});

test('Schalter steht auf shopify und kein Seiten-Video hängt an imgix', () => {
  assert.equal(VIDEO_QUELLE, 'shopify');
  for (const p of geerntetePfade()) {
    const q = videoQuellen(p);
    assert.equal(q.quelle, 'shopify', `${p}: ohne Shopify-Eintrag, läuft weiter über imgix`);
    assert.ok(!q.hls.includes('imgix') && !q.mp4.includes('imgix'), `${p}: imgix-URL`);
  }
});

test('jede Shopify-Quelle ist ein HLS-Manifest plus mp4 auf cdn.shopify.com', () => {
  for (const [p, s] of Object.entries(SHOPIFY_VIDEOS)) {
    assert.match(s.hls, /^https:\/\/cdn\.shopify\.com\/videos\/c\/vp\/[0-9a-f]{32}\/[0-9a-f]{32}\.m3u8$/, p);
    assert.match(s.mp4, /^https:\/\/cdn\.shopify\.com\/videos\/c\/vp\/[0-9a-f]{32}\/[0-9a-f]{32}\.[A-Z]+-\d+p-[\d.]+Mbps-\d+\.mp4$/, p);
    // Manifest und mp4 gehören zum selben Video.
    assert.equal(s.hls.split('/')[6], s.mp4.split('/')[6], `${p}: hls und mp4 aus zwei Videos`);
  }
});

test('Vorschaustreifen nutzt dieselbe Quelle wie <ImgixVideo>', () => {
  for (const eintrag of Object.values(PRODUKT_VIDEOS)) {
    for (const v of eintrag.videos) {
      if (v.familie !== 'imgix') continue;
      assert.ok(v.hls.startsWith('https://cdn.shopify.com/'), `${v.id}: ${v.hls}`);
    }
  }
});

test('Rückweg: ein Pfad ohne Eintrag liefert die imgix-URLs von vorher', () => {
  const q = videoQuellen('gibt-es-nicht.mov');
  assert.equal(q.hls, `${IMGIX_HOST}gibt-es-nicht.mov?fm=hls`);
  assert.equal(q.mp4, `${IMGIX_HOST}gibt-es-nicht.mov?fm=mp4`);
  assert.equal(q.familie, 'imgix');
  assert.equal(q.quelle, 'imgix');
  assert.equal(IMGIX_HOST, 'https://qiblanco-video.imgix.net/');
});
