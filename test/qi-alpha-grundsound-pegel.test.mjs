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

test('Grundsound +3 dB, Master und KLAENGE (B/C) unverändert', () => {
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

// NACHTRAG 03.11.2026 (Auftrag Google AI weg, Peaks 1,2-fach),
// Christian und Anna: Grundsound bleibt,
// Peaks 20 % lauter als der Grundsound. ROT VOR GRÜN: auf origin/main
// 47664891 gibt es AKZENTE_LAUT nicht, A spielt KLAENGE (Faktor 1,13 bis 1,59).
// Lautheit der -14-LUFS-Dateien, gemessen auf ax41 (ffmpeg ebur128, Jobordner
// ton/vorher-20261103.json, md5 wie 20261101): Grundsound I, Akzente M_max.
const GRUND_I = -14.3;
const M_MAX = {gong: -8.0, klang: -7.1, bam: -9.7, glanz: -9.2, tief: -9.2, schluss: -9.1};

test('Peaks hörbar das 1,2-Fache des Grundsounds (1,15 bis 1,25), nur in A', () => {
  const p = objekt('PEGEL_LAUT');
  assert.equal(p.bett, 1.13, 'Grundsound unverändert');
  assert.equal(p.master, 1, 'Master unverändert');
  const a = objekt('AKZENTE_LAUT');
  assert.deepEqual(Object.keys(a).sort(), Object.keys(M_MAX).sort());
  const grund = GRUND_I + 20 * Math.log10(p.bett * p.master);
  for (const [n, g] of Object.entries(a)) {
    const f = 10 ** ((M_MAX[n] + 20 * Math.log10(g * p.master) - grund) / 20);
    assert.ok(f >= 1.15 && f <= 1.25, `${n}: Faktor ${f.toFixed(3)} ausserhalb 1,15..1,25`);
  }
  assert.match(t, /g\.gain\.value = \(this\.laut \? AKZENTE_LAUT : KLAENGE\)\[name\]/);
});
