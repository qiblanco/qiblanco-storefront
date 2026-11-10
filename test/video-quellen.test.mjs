/**
 * test/video-quellen.test.mjs — jedes Video der Seiten hat eine Shopify-Quelle.
 *
 * Anlass: imgix-Kontingent gekappt (HTTP 402 auf nicht gecachte Segmente),
 * Regelkreis video-spielbarkeit Arm BREIT, 03.10.2026; imgix gekündigt zum
 * 20.10.2026 und ausgebaut am 10.11.2026 (Elina EL-20261014-aea9424f,
 * Punkt 4): es gibt keinen Schalter und keinen imgix-Rückfall mehr. Ein Pfad
 * ohne Eintrag in SHOPIFY_VIDEOS hat KEINE Quelle (der Baustein zeigt sein
 * Ersatzbild). Deshalb muss jeder verwendete Pfad hier rot werden, bevor er
 * live geht. Die Pfade werden aus app/ GEERNTET, nicht abgetippt: ein neues
 * <ImgixVideo videoPath="..."> (oder videoPath:/video:/pfad: in einer
 * Datendatei, videoQuellen('...'), imgixVideo('...')) ohne Eintrag macht
 * diesen Test rot. Läuft in hb-deploy über die Unit-Suite (Gate 22).
 *
 * Lauf:  node --test test/video-quellen.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import * as videoQuellenModul from '../app/data/video-quellen.js';

const {SHOPIFY_VIDEOS, videoQuellen} = videoQuellenModul;
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

/*
 * Wo ein Videopfad in app/ steht. Direkt: <ImgixVideo videoPath="...">,
 * videoQuellen('...'), imgixVideo('...'). Über eine Datendatei:
 * videoPath: '...' (AlphaVorlage BAND), video: '...' (ExclusiveSolutions),
 * pfad: '...' (ProduktDetailsApple). Bei den Daten-Schlüsseln zählt nur ein
 * nackter Dateiname mit Videoendung (kein '/'), damit Seitenpfade und volle
 * CDN-URLs nicht mitgeerntet werden.
 */
const VIDEO_ENDUNG = '(?:mov|mp4|m4v|webm)';
const ERNTE_MUSTER = [
  /\bvideoPath=\{?\s*["'`]([^"'`]+)["'`]/g,
  /\b(?:videoQuellen|imgixVideo)\(\s*["'`]([^"'`]+)["'`]/g,
  new RegExp(`\\b(?:videoPath|video|pfad):\\s*["'\`]([^"'\`/\\s]+\\.${VIDEO_ENDUNG})["'\`]`, 'g'),
];

/** Pfade aus einem Quelltext (rein, für die Selbstprobe unten). */
function erntePfade(text) {
  const pfade = new Set();
  for (const m of ERNTE_MUSTER) for (const t of text.matchAll(m)) pfade.add(t[1]);
  return pfade;
}

/** Alle Videopfade, die app/ verwendet, je Pfad die erste Fundstelle. */
function geernteteFundstellen() {
  const fund = new Map();
  for (const datei of dateien(APP)) {
    // Die Tabelle selbst ist keine Verwendung.
    if (datei.endsWith(join('data', 'video-quellen.js'))) continue;
    for (const p of erntePfade(readFileSync(datei, 'utf8'))) {
      if (!fund.has(p)) fund.set(p, datei.slice(APP.length + 1));
    }
  }
  return fund;
}

function geerntetePfade() {
  return [...geernteteFundstellen().keys()];
}

/** Verwendete Pfade ohne Eintrag in der Tabelle, als „pfad (datei)“. */
function fehlendeEintraege(fundstellen, tabelle) {
  return [...fundstellen]
    .filter(([p]) => !Object.hasOwn(tabelle, p))
    .map(([p, datei]) => `${p} (${datei})`);
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

test('Ernte-Selbstprobe: jede Schreibweise wird geerntet, ein fehlender Eintrag wird rot', () => {
  const probe = [
    '<ImgixVideo videoPath="a-direkt.mov" />',
    "<ImgixVideo videoPath={'b-klammer.mp4'} />",
    "const x = videoQuellen('c-aufruf.mov').mp4;",
    "...imgixVideo(\n  'd-galerie.mp4',\n  'https://cdn.shopify.com/x.jpg',\n)",
    "const BAND = {videoPath: 'e-band.mov'};",
    'const S = [{video: "f-kachel.mov"}];',
    "const V = {pfad: 'g-detail.mov', poster: 'x.jpg'};",
    // Nicht mitgeerntet: Seitenpfad, volle CDN-URL.
    "const R = {pfad: '/pages/qihome-details'};",
    "const U = {video: 'https://cdn.shopify.com/videos/c/vp/x/x.mp4'};",
  ].join('\n');
  const pfade = [...erntePfade(probe)].sort();
  assert.deepEqual(pfade, [
    'a-direkt.mov',
    'b-klammer.mp4',
    'c-aufruf.mov',
    'd-galerie.mp4',
    'e-band.mov',
    'f-kachel.mov',
    'g-detail.mov',
  ]);
  // Rot-Arm: gegen die echte Tabelle fehlen genau diese sieben.
  const fund = new Map(pfade.map((p) => [p, 'probe.jsx']));
  assert.equal(fehlendeEintraege(fund, SHOPIFY_VIDEOS).length, 7);
});

test('jeder in app/ verwendete Videopfad steht in SHOPIFY_VIDEOS', () => {
  const fehlend = fehlendeEintraege(geernteteFundstellen(), SHOPIFY_VIDEOS);
  assert.deepEqual(
    fehlend,
    [],
    `ohne Shopify-Eintrag (der Baustein zeigt dort nur das Ersatzbild): ${fehlend.join(', ')}`,
  );
  for (const p of geerntetePfade()) {
    const q = videoQuellen(p);
    assert.equal(q.quelle, 'shopify', p);
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
      assert.ok(typeof v.hls === 'string' && v.hls.startsWith('https://cdn.shopify.com/'), `${v.id}: ${v.hls}`);
    }
  }
});

test('ein Pfad ohne Eintrag hat keine Quelle und nie eine imgix-URL', () => {
  for (const p of ['gibt-es-nicht.mov', 'toString', '__proto__']) {
    const q = videoQuellen(p);
    assert.equal(q.hls, null, p);
    assert.equal(q.mp4, null, p);
    // familie bleibt 'imgix' (Pixel qpx.js MED_FAMILIEN), quelle sagt 'fehlt'.
    assert.equal(q.familie, 'imgix', p);
    assert.equal(q.quelle, 'fehlt', p);
  }
});

test('imgix ist ausgebaut: kein Schalter, kein Host, keine imgix-Adresse im Modul', () => {
  assert.equal('VIDEO_QUELLE' in videoQuellenModul, false, 'Schalter VIDEO_QUELLE ist zurück');
  assert.equal('IMGIX_HOST' in videoQuellenModul, false, 'IMGIX_HOST ist zurück');
  const quelltext = readFileSync(join(APP, 'data', 'video-quellen.js'), 'utf8');
  assert.doesNotMatch(quelltext, /imgix\.(?:net|video|com)/, 'imgix-Adresse in video-quellen.js');
});

test('ohne Quelle rendert <ImgixVideo> das Ersatzbild statt eines leeren Spielers', () => {
  const jsx = readFileSync(join(APP, 'components', 'reusables', 'ImgixVideo.jsx'), 'utf8');
  const zweig = jsx.match(/if \(ohneQuelle\) \{\n([\s\S]*?)\n {2}\}\n/);
  assert.ok(zweig, 'Zweig ohne Quelle fehlt');
  assert.doesNotMatch(zweig[1], /<video\b/, 'ohne Quelle steht ein <video>');
  assert.doesNotMatch(zweig[1], /sound-toggle|toggleTon/, 'ohne Quelle steht ein Ton-Knopf');
  assert.match(zweig[1], /<img\b/);
  assert.match(zweig[1], /data-video-quelle="fehlt"/);
  assert.match(zweig[1], /data-video-familie="imgix"/);
  assert.match(jsx, /const ohneQuelle = !hlsUrl && !mp4Url;/);
});

test('Stufendeckel greift auf jeder Quelle (seit dem imgix-Ausbau gibt es nur Shopify)', () => {
  const jsx = readFileSync(join(APP, 'components', 'reusables', 'ImgixVideo.jsx'), 'utf8');
  const deckel = jsx.match(/const HLS_STUFENDECKEL = \{([^}]*)\}/);
  assert.ok(deckel, 'HLS_STUFENDECKEL fehlt');
  assert.match(deckel[1], /capLevelToPlayerSize:\s*true/);
  assert.match(deckel[1], /maxDevicePixelRatio:\s*1\.5/);
  const basis = jsx.match(/const HLS_KONFIG = \{([^}]*)\}/);
  assert.ok(basis && !/capLevel/.test(basis[1]), 'Deckel gehört in HLS_STUFENDECKEL, nicht in die Basis');
  assert.match(
    jsx,
    // Der Leitungs-Deckel (3G, leitung.js) kommt obendrauf.
    /new Hls\(\{\s*\.\.\.HLS_KONFIG,\s*\.\.\.HLS_STUFENDECKEL,?\s*(\.\.\.\(stufe === 'langsam' \? HLS_STUFENDECKEL_LANGSAM : \{\}\),?\s*)?\}\)/,
    'Hls-Konstruktor setzt den Stufendeckel nicht',
  );
  assert.doesNotMatch(jsx, /quelle === 'shopify'/, 'toter imgix-Zweig am Hls-Konstruktor');
});
