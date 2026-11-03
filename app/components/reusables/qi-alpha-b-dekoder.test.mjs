/**
 * Wächter: /products/qi-alpha-b, Reveal-Film auf dem iPhone (Apple-Upgrade,
 * Christian 01.11.2026). Gemessen 02.11.2026 live im iOS-Profil „streng“:
 * der Film stand, auch nach einem Tipp. Lehnt iOS ihn ab, dreht derselbe Film
 * im Canvas; ohne WebCodecs startet ihn die erste Berührung (node --test).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');

test('QaSchleifenVideo: Dekoder nach Ablehnung, Tipp-Weg, keine Bildfolge', () => {
  const c = lies('app/components/campaign/QiAlphaLpB.jsx');
  const h = c.slice(c.indexOf('function QaSchleifenVideo'), c.indexOf('export default function QiAlphaLpB'));
  assert.match(h, /useFilmDekoder\(ref, video\.src\)/);
  assert.match(h, /useVideoNachholen\(ref[,)]/);
  assert.match(h, /<canvas[\s\S]*data-qb-dekoder="aus"/);
  assert.doesNotMatch(h, /<img|bildfolge/i);
});

test('useFilmDekoder: nur nach Ablehnung, nur mit WebCodecs, nie bei reduzierter Bewegung', () => {
  const c = lies('app/components/reusables/useFilmDekoder.js');
  const ab = c.slice(c.indexOf('const abgelehnt = useCallback'));
  assert.match(ab, /ruheGewollt\(\)\) return;/);
  assert.match(ab, /typeof window\.VideoDecoder !== 'function'\) return;/);
  assert.match(ab, /if \(!v\.paused\) \{\s*stoppen\(\);/);
});
