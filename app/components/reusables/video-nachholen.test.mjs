// Abgelehntes Autoplay nachholen (video-nachholen.js, useVideoNachholen in
// video360-ersatzbild.jsx, ImgixVideo.jsx).
// Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {GESTEN, spieleSicher} from './video-nachholen.js';

test('spieleSicher: läuft an -> true', async () => {
  assert.equal(await spieleSicher({paused: true, play: () => Promise.resolve()}), true);
});

test('spieleSicher: iOS lehnt ab (NotAllowedError) -> false, kein Wurf', async () => {
  const fehler = Object.assign(new Error('Geste nötig'), {name: 'NotAllowedError'});
  assert.equal(await spieleSicher({paused: true, play: () => Promise.reject(fehler)}), false);
});

test('spieleSicher: synchroner Wurf (ältere iOS-Fassungen) -> false, kein Wurf', async () => {
  const v = {paused: true, play: () => { throw new Error('sync'); }};
  assert.equal(await spieleSicher(v), false);
});

test('spieleSicher: alter Browser ohne Promise -> Zustand des Videos', async () => {
  assert.equal(await spieleSicher({paused: false, play: () => undefined}), true);
  assert.equal(await spieleSicher({paused: true, play: () => undefined}), false);
});

test('GESTEN: die Ereignisse, in denen iOS und Chrome play() als Geste zählen', () => {
  for (const t of ['touchend', 'click', 'pointerup']) assert.ok(GESTEN.includes(t), t);
});

const ohneKommentare = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const lies = (rel) => ohneKommentare(readFileSync(new URL(rel, import.meta.url), 'utf8'));

test('ImgixVideo holt nach und spielt auf Apple-Geräten natives HLS, mit mp4-Rückfall', () => {
  const c = lies('./ImgixVideo.jsx');
  assert.match(c, /useVideoNachholen\(videoRef\)/);
  // natives HLS VOR hls.js, sobald Apple + canPlayType
  assert.ok(c.indexOf('appleNativHls(video)') < c.indexOf('Hls.isSupported()'));
  assert.match(c, /setTimeout\(aufMp4, RUECKFALL_MS\)/);
  // kein ungeschütztes video.play() mehr
  assert.doesNotMatch(c, /video\.play\(\)/);
});

test('useVideoNachholen: Sicht, Daten und Geste; reduce-motion bleibt Standbild', () => {
  const c = lies('./video360-ersatzbild.jsx');
  const h = c.slice(c.indexOf('export function useVideoNachholen'));
  assert.match(h, /bevorzugtRuhe\(\)\) return undefined/);
  assert.match(h, /new IntersectionObserver/);
  assert.match(h, /addEventListener\(t, beiGeste, \{capture: true, passive: true\}\)/);
  assert.match(h, /'playing', beiLaeuft/);
  assert.match(h, /spieleSicher\(video\)/);
});
