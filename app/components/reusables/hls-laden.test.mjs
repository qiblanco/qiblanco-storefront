// hls.js erst bei Bedarf (hls-laden.js, Grossjob Ladezeiten s13).
// Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const ohneKommentare = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const APP = fileURLToPath(new URL('../../', import.meta.url));

function dateien(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return dateien(p);
    return /\.(jsx?|tsx?|mjs)$/.test(n) && !/\.test\./.test(n) ? [p] : [];
  });
}

test('kein statischer Import von hls.js unter app/ (sonst Server-Bundle + modulepreload)', () => {
  const statisch = /^\s*import\s+[^;]*?from\s+['"]hls\.js['"]/m;
  const treffer = dateien(APP).filter((p) => statisch.test(ohneKommentare(readFileSync(p, 'utf8'))));
  assert.deepEqual(treffer, []);
});

test('ladeHls: import() nur außerhalb des Server-Builds', () => {
  const c = ohneKommentare(readFileSync(new URL('./hls-laden.js', import.meta.url), 'utf8'));
  assert.match(c, /if \(!import\.meta\.env\.SSR && !hlsVersprechen\) \{\s*hlsVersprechen = import\('hls\.js'\)/);
});

test('ImgixVideo: Apple nativ und ohne MSE kein Chunk, Importfehler -> mp4, Abbau stoppt späten Import', () => {
  const c = ohneKommentare(readFileSync(new URL('./ImgixVideo.jsx', import.meta.url), 'utf8'));
  const laden = c.slice(c.indexOf('function laden()'), c.indexOf('function ohneHlsJs()'));
  assert.ok(laden.indexOf('appleNativHls(video)') < laden.indexOf('ladeHls()'));
  assert.ok(laden.indexOf('mseVorhanden()') < laden.indexOf('ladeHls()'));
  assert.match(laden, /\.catch\(\(\) => \{\s*if \(!abgebaut\) aufMp4\(\);/);
  assert.match(c, /function mitHlsJs\(Hls\) \{\s*if \(abgebaut\) return;/);
  assert.match(c, /return \(\) => \{\s*abgebaut = true;/);
});

test('ProduktVideos: derselbe Ladeweg', () => {
  const c = ohneKommentare(readFileSync(new URL('./ProduktVideos.jsx', import.meta.url), 'utf8'));
  assert.match(c, /video\.hls && !appleNativHls\(el\) && mseVorhanden\(\)/);
  assert.match(c, /if \(abgebaut\) return;\s*if \(Hls\.isSupported\(\)\)/);
  assert.match(c, /el\.src = video\.mp4;\s*if \(autoStart\) starte\(\);/);
});
