/**
 * Das YouTube-Short auf /products/qione-2-pro steht als ERSTES Video der
 * Nutzer-Reihe (Christian 2026-10-28: „als erstes video aber in IG Style auch
 * wenn es youtbe ist"), und die Instagram-Reihe dahinter behält ihre Ordnung.
 *
 * Die Gegenrichtung zählt mit: kein anderes Produkt bekommt die Kachel, und
 * ein Eintrag ohne `inDerReihe: true` steht nirgends (FAIL-CLOSED).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {nutzerVideoReihe} from '../app/lib/nutzer-video-reihe.js';
import {YT_NUTZER_VIDEOS} from '../app/data/yt-nutzer-videos.js';
import {IG_TESTIMONIALS} from '../app/data/ig-testimonials.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const ig = (produkt) =>
  IG_TESTIMONIALS.filter((t) => t.produkt === produkt && t.inDerReihe === true);

test('QiOne 2 Pro: das Short steht an Stelle 1, die Instagram-Reihe folgt unverändert', () => {
  const liste = ig('QiOne 2 Pro');
  const reihe = nutzerVideoReihe(liste, YT_NUTZER_VIDEOS, 'QiOne 2 Pro');
  assert.equal(reihe[0].art, 'yt');
  assert.equal(reihe[0].t.youtubeId, 'vgd7qKQ990o');
  assert.equal(reihe.length, liste.length + 1);
  assert.deepEqual(
    reihe.slice(1).map((k) => k.t.code),
    liste.map((t) => t.code),
  );
});

test('andere Produkte bekommen keine YouTube-Kachel', () => {
  for (const produkt of ['QiBracelet', 'Kakao', 'QiHome']) {
    const reihe = nutzerVideoReihe(ig(produkt), YT_NUTZER_VIDEOS, produkt);
    assert.ok(reihe.every((k) => k.art === 'ig'), produkt);
  }
});

test('vorn ordnet, fehlendes vorn heißt Ende, fehlendes inDerReihe heißt nirgends', () => {
  const liste = [{code: 'a'}, {code: 'b'}, {code: 'c'}];
  const yt = [
    {youtubeId: 'ende', produkt: 'P', inDerReihe: true},
    {youtubeId: 'zwei', produkt: 'P', inDerReihe: true, vorn: 2},
    {youtubeId: 'weg', produkt: 'P', vorn: 1},
  ];
  const r = nutzerVideoReihe(liste, yt, 'P').map((k) => k.t.code ?? k.t.youtubeId);
  assert.deepEqual(r, ['a', 'zwei', 'b', 'c', 'ende']);
});

test('die Kachel trägt data-yt-video, kein data-ig-reel, und spielt über die Haus-Fassade', () => {
  const quelle = lies('app/components/reusables/IgTestimonialSlideshow.jsx');
  const kachel = quelle.slice(quelle.indexOf('function YtKachel'), quelle.indexOf('export function'));
  assert.match(kachel, /data-yt-video=\{t\.youtubeId\}/);
  assert.doesNotMatch(kachel, /data-ig-reel/);
  assert.match(kachel, /<YoutubeTimestamp/);
  assert.match(quelle, /controls=0&loop=1&playlist=\$\{id\}/);
});
