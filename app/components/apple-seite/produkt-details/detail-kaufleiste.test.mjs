// Kaufleiste der Detailseiten: am Seitenende ein Kaufknopf im Bild
// (Geräteprobe echtgeraet_probe.py, 31.10./01.11.2026).
// node --test app/components/apple-seite/produkt-details/detail-kaufleiste.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DETAIL_KAUFLEISTE_AN, detailKaufleisteSichtbar} from './detail-kaufleiste-lage.js';
import {KAUFLEISTE as QIONE, QIONE_2_PRO_DETAILS} from './qione-2-pro-details-daten.js';
import {KAUFLEISTE as QIHOME, QIHOME_DETAILS} from './qihome-details-daten.js';
import {KAUFLEISTE as QIBRACELET, QIBRACELET_DETAILS} from './qibracelet-details-daten.js';

const draussen = {da: true, imBild: false};
const kopfDarueber = {da: true, imBild: false, darueber: true};

test('Regel: erst nach dem Kopf, nie neben einem Kaufknopf der Seite, am Ende stehen', () => {
  const r = (kopf, knoepfe, geraetAn = true) => detailKaufleisteSichtbar({geraetAn, kopf, knoepfe});
  assert.equal(r({da: true, imBild: true, darueber: false}, {da: true, imBild: true}), false, 'Kopf im Bild');
  assert.equal(r({da: true, imBild: false, darueber: false}, draussen), false, 'Kopf noch nicht erreicht');
  assert.equal(r(kopfDarueber, {da: true, imBild: true}), false, 'Abschluss-Knopf im Bild');
  assert.equal(r(kopfDarueber, draussen), true, 'Mitte oder Seitenende (Fuß im Bild)');
  assert.equal(r(kopfDarueber, {da: false, imBild: false}), true, 'kein weiterer Knopf');
  assert.equal(r(kopfDarueber, draussen, false), false, 'Gerät aus (Desktop)');
  assert.equal(r(null, draussen), false, 'ohne gemessenen Kopf weg');
  assert.equal(r({da: false, imBild: false, darueber: false}, draussen), false, 'Kopf fehlt');
});

test('Schalter: mobil an, Desktop aus', () => {
  assert.deepEqual(DETAIL_KAUFLEISTE_AN, {desktop: false, mobil: true});
});

test('Jede Detailseite nennt Name und eigene Kaufseite der Leiste', () => {
  for (const [kl, daten, name] of [
    [QIONE, QIONE_2_PRO_DETAILS, 'QiOne® 2 Pro'],
    [QIHOME, QIHOME_DETAILS, 'QiHome® Air'],
    [QIBRACELET, QIBRACELET_DETAILS, 'QiBracelet®'],
  ]) {
    assert.equal(kl.name, name);
    const kopf = daten.find((s) => s.art === 'hero');
    assert.equal(kl.href, kopf.cta.href, `${name}: Leiste führt wohin der Kopf führt`);
  }
});

test('Routen reichen die Leiste durch, ProduktDetailsApple rendert sie', () => {
  for (const datei of ['pages.qione-2-pro-details.jsx', 'pages.qihome-details.jsx', 'pages.qibracelet-details.jsx']) {
    const q = readFileSync(new URL(`../../../routes/${datei}`, import.meta.url), 'utf8');
    assert.ok(q.includes('kaufleiste={KAUFLEISTE}'), datei);
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
