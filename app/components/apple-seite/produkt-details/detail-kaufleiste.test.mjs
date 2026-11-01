// Kaufleiste der Detailseiten: am Seitenende ein Kaufknopf im Bild
// (Geräteprobe echtgeraet_probe.py, 31.10./01.11.2026).
// node --test app/components/apple-seite/produkt-details/detail-kaufleiste.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DETAIL_KAUFLEISTE_AN, detailKaufleiste, detailKaufleisteSichtbar} from './detail-kaufleiste-lage.js';
import {QIONE_2_PRO_DETAILS} from './qione-2-pro-details-daten.js';
import {QIHOME_DETAILS} from './qihome-details-daten.js';
import {QIBRACELET_DETAILS} from './qibracelet-details-daten.js';

const weg = {da: true, imBild: false};
const kopfDarueber = {da: true, imBild: false, darueber: true};

test('Regel: erst nach dem Kopf, nie neben einem Kaufknopf der Seite, am Ende stehen', () => {
  const r = (kopf, knoepfe, geraetAn = true) => detailKaufleisteSichtbar({geraetAn, kopf, knoepfe});
  assert.equal(r({da: true, imBild: true, darueber: false}, {da: true, imBild: true}), false, 'Kopf im Bild');
  assert.equal(r({da: true, imBild: false, darueber: false}, weg), false, 'Kopf noch nicht erreicht');
  assert.equal(r(kopfDarueber, {da: true, imBild: true}), false, 'Abschluss-Knopf im Bild');
  assert.equal(r(kopfDarueber, weg), true, 'Mitte oder Seitenende (Fuß im Bild)');
  assert.equal(r(kopfDarueber, {da: false, imBild: false}), true, 'kein weiterer Knopf');
  assert.equal(r(kopfDarueber, weg, false), false, 'Gerät aus (Desktop)');
  assert.equal(r(null, weg), false, 'ohne gemessenen Kopf weg');
  assert.equal(r({da: false, imBild: false, darueber: false}, weg), false, 'Kopf fehlt');
});

test('Schalter: mobil an, Desktop aus', () => {
  assert.deepEqual(DETAIL_KAUFLEISTE_AN, {desktop: false, mobil: true});
});

test('Jede Detailseite nennt Name und eigene Kaufseite der Leiste', () => {
  for (const [seite, daten, name] of [
    ['qione-2-pro-details', QIONE_2_PRO_DETAILS, 'QiOne® 2 Pro'],
    ['qihome-details', QIHOME_DETAILS, 'QiHome® Air'],
    ['qibracelet-details', QIBRACELET_DETAILS, 'QiBracelet®'],
  ]) {
    const kl = detailKaufleiste(seite, daten);
    assert.equal(kl.name, name);
    const kopf = daten.find((s) => s.art === 'hero');
    assert.equal(kl.href, kopf.cta.href, `${name}: Leiste führt wohin der Kopf führt`);
  }
  assert.equal(detailKaufleiste('andere-seite', QIONE_2_PRO_DETAILS), null, 'fremde Seite ohne Leiste');
  assert.equal(detailKaufleiste('qihome-details', []), null, 'ohne Kopf keine Leiste');
});

test('Routen nennen die Seite, ProduktDetailsApple rendert die Leiste', () => {
  for (const seite of ['qione-2-pro-details', 'qihome-details', 'qibracelet-details']) {
    const q = readFileSync(new URL(`../../../routes/pages.${seite}.jsx`, import.meta.url), 'utf8');
    assert.ok(q.includes(`seite="${seite}"`), seite);
  }
  const pda = readFileSync(new URL('./ProduktDetailsApple.jsx', import.meta.url), 'utf8');
  assert.ok(pda.includes('<DetailKaufleiste'), 'ProduktDetailsApple');
});

test('Leiste findet sich nicht selbst und hält dem Fuß Platz frei', () => {
  const jsx = readFileSync(new URL('./DetailKaufleiste.jsx', import.meta.url), 'utf8');
  assert.ok(jsx.includes(`data-as-cta="leiste"`), 'eigener Knopf nicht primary');
  assert.ok(jsx.includes(`[data-as-cta='primary']`), 'sucht die Knöpfe der Seite');
  assert.ok(jsx.includes('useKaufleisteSicht'), 'ruhige Lage (100svh + Hysterese)');
  const css = readFileSync(new URL('../../../styles/produkt-details-apple.css', import.meta.url), 'utf8');
  assert.match(css, /body:has\(\.pd-kaufleiste\[data-kaufleiste-mobil='an'\]\) footer \{\s*padding-bottom:/);
  assert.match(css, /\.as-seite > \.pd-kaufleiste:last-child \{\s*margin-bottom: 0;/);
});
