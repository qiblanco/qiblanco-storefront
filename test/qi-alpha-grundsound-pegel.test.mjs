/**
 * Wächter: QI-ALPHA-LANDINGPAGE A, nur der Grundsound lauter (node --test,
 * ohne Bundler). Job 20261101-prio1-qi-alpha-lp-nur-grundsound-lauter-pings-
 * unveraendert, Christian 01.11.2026: „einfach nur mal den Grundton lauter
 * machen und dann gucken, wie es sich anfühlt“, „nicht das eine lauter und
 * das andere leiser“.
 * ROT VOR GRÜN: auf origin/main 4adbb7e6 steht PEGEL_LAUT.bett auf 0,8.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const t = readFileSync(join(WURZEL, 'app/components/campaign/TheAlphaTon.jsx'), 'utf8');
const objekt = (name) => {
  const m = t.match(new RegExp(`const ${name} = \\{([^}]*)\\}`));
  assert.ok(m, `${name} fehlt`);
  return Object.fromEntries(
    m[1].split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => s.split(':').map((x) => x.trim()))
      .map(([k, v]) => [k, Number(v)]),
  );
};

test('Grundsound +3 dB, Master und Akzente unverändert', () => {
  const p = objekt('PEGEL_LAUT');
  assert.equal(p.master, 1, 'Master bleibt 1');
  const db = 20 * Math.log10(p.bett / 0.8);
  assert.ok(db > 2.9 && db < 3.1, `Grundsound +3 dB gegenüber 0,8 (ist ${db.toFixed(2)} dB)`);
  assert.ok(Math.abs(p.geduckt / p.bett - 0.2) < 0.005, 'Ducking im selben Verhältnis');
  assert.deepEqual(objekt('KLAENGE'), {
    grundsound: 1, gong: 0.8, klang: 0.7, bam: 0.75, glanz: 1, tief: 0.8, schluss: 0.85,
  });
  assert.match(t, /gong: `\$\{CDN\}gong-14lufs\.mp3\?v=1793272275`/);
  assert.match(t, /glanz: `\$\{CDN\}glanz-14lufs\.mp3\?v=1793272290`/);
  assert.match(t, /grundsound: `\$\{CDN\}grundsound-14lufs\.mp3\?v=1793272271`/);
});
