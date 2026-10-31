// Apple-Fassungen der Produkt-LPs und Detailseiten (Grossjob 20261029-GROSSJOB-
// alle-shop-seiten-apple-niveau-ausser-seo-geo, s05).
// node --test app/components/apple-seite/produkt-details/produkt-details.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pruefeSeite} from '../apple-seite-logik.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';
import {QIONE_2_PRO_DETAILS, TECHNIK} from './qione-2-pro-details-daten.js';
import {KONJUNKTIV, texteVon} from '../apple-seite-logik.js';
import {QIHOME_DETAILS} from './qihome-details-daten.js';
import {QIBRACELET_DETAILS} from './qibracelet-details-daten.js';

const DETAILS = {
  'qione-2-pro-details': [QIONE_2_PRO_DETAILS, '/products/qione-2-pro'],
  'qihome-details': [QIHOME_DETAILS, '/products/qihome-air'],
  'qibracelet-details': [QIBRACELET_DETAILS, '/products/qibracelet'],
};

const nurBaukasten = (liste) => liste.filter((s) => !['video', 'mikroskop', 'technik'].includes(s.art));

test('Detailseiten: Baukasten-Regeln ohne Mangel (Hero zuerst, Anna, kein Preisanker, kein Konjunktiv)', () => {
  for (const [seite, [daten]] of Object.entries(DETAILS)) {
    assert.deepEqual(pruefeSeite(nurBaukasten(daten)), [], seite);
  }
});

test('Detailseiten: jeder Kaufknopf führt auf die eigene Kaufseite', () => {
  for (const [seite, [daten, kaufseite]] of Object.entries(DETAILS)) {
    const kaeufe = daten.filter((s) => s.cta?.text === 'Jetzt kaufen');
    assert.ok(kaeufe.length >= 2, `${seite}: Kopf und Abschluss tragen einen Kaufknopf`);
    for (const s of kaeufe) assert.equal(s.cta.href, kaufseite, `${seite} ${s.art}`);
  }
});

test('Routen lesen genau ihren Schalter und behalten C', () => {
  const routen = {
    'qione-2-pro-details': ['pages.qione-2-pro-details.jsx', '<QiOne />'],
    'qihome-details': ['pages.qihome-details.jsx', '<QiHomeLanding />'],
    'qibracelet-details': ['pages.qibracelet-details.jsx', '<QiBracelet />'],
    'qione-2-pro-shop': ['pages.qione-2-pro.jsx', '<QiOne2ProSeite'],
    'qihome-air': ['pages.qihome-air.jsx', '<QiHomeAirSeite'],
    qibracelet: ['pages.qibracelet.jsx', '<QiBraceletSeite'],
  };
  for (const [seite, [datei, alt]] of Object.entries(routen)) {
    assert.ok(APPLE_SEITEN[seite], `${seite} hat eine Zeile in apple-seiten.js`);
    const quelle = readFileSync(new URL(`../../../routes/${datei}`, import.meta.url), 'utf8');
    assert.ok(quelle.includes(`appleSeiteLaden(context, '${seite}')`), `${datei} liest ${seite}`);
    assert.ok(quelle.includes(`seite="${seite}"`), `${datei} setzt den Marker ${seite}`);
    assert.ok(quelle.includes(alt), `${datei} behält C`);
  }
});

test('Kampagnen-Zwillinge rendern dieselben Daten wie die Kaufseite', () => {
  for (const [datei, daten] of [
    ['QiOneKampagneApple.jsx', 'qione-2-pro-alpha-daten'],
    ['QiHomeAirKampagneApple.jsx', 'qihome-air-alpha-daten'],
    ['QiBraceletKampagneApple.jsx', 'qibracelet-alpha-daten'],
  ]) {
    const quelle = readFileSync(new URL(`../produkt-lp/${datei}`, import.meta.url), 'utf8');
    assert.ok(quelle.includes(`product-pages/${daten}'`), datei);
    assert.ok(quelle.includes('<AlphaVorlage'), datei);
    assert.ok(quelle.includes('APPLE_SEITE_ATTR'), datei);
  }
});

/* 360-Grad (s02, Christian 30.10.2026): kein 360-Ersatzbild ohne Drehung, und
   die Drehung passt zum Gerät im Dateinamen. Hero zuerst, damit der Kopf dreht. */
const DREHUNG_AUS_DATEI = {"360-qione-front": "qione", "360-qibracelet-winkel": "qibracelet", "360-qihome-front": "qihome"};
function pruefe360(bilder, name) {
  let n = 0;
  for (const b of bilder) {
    const m = /qb-video360-ersatzbild--(360-[a-z]+-[a-z]+)(?:-\d+)?--/.exec(b?.url || "");
    if (!m) continue;
    n++;
    assert.equal(b.drehung, DREHUNG_AUS_DATEI[m[1]], `${name}: ${m[1]} steht als Standbild`);
  }
  return n;
}

test('360: der Kopf jeder Detailseite dreht (kein Standbild)', () => {
  for (const [name, s, d] of [['qione-2-pro-details', QIONE_2_PRO_DETAILS, 'qione'], ['qihome-details', QIHOME_DETAILS, 'qihome'], ['qibracelet-details', QIBRACELET_DETAILS, 'qibracelet']]) {
    assert.equal(s[0].art, 'hero', name);
    assert.equal(s[0].bild.drehung, d, `${name}: der Kopf dreht`);
    pruefe360(s.map((x) => x.bild), name);
  }
});

// „So wirkt er“ (Auftrag 20261030-update-shop-startseite-detailseite-technologie-
// wissen-mehr-knopf): Christians Reihenfolge Feld -> Wasser -> Körper ->
// Forschung, je Schritt ein kurzer Text, ein Medium und ein „Mehr“.
test('QiOne-Detailseite: So wirkt er in Christians Reihenfolge, jeder Schritt mit Medium und Mehr', () => {
  assert.ok(QIONE_2_PRO_DETAILS.some((s) => s.art === 'technik'), 'Platz in der Sektionsliste');
  assert.deepEqual(TECHNIK.schritte.map((s) => s.id), ['feld', 'wasser', 'zelle', 'forschung']);
  for (const s of TECHNIK.schritte) {
    assert.ok(s.kurz?.length >= 1, `${s.id}: kurzer Text`);
    assert.ok(['bild', 'video', 'animation'].includes(s.medium?.art), `${s.id}: Medium`);
    if (s.medium.art === 'video') {
      assert.match(s.medium.mp4, /^https:\/\/cdn\.shopify\.com\//, `${s.id}: Video vom Shopify-CDN`);
      assert.ok(s.medium.poster, `${s.id}: Vorschaubild`);
    }
    const mehr = [...(s.mehr?.absaetze || []), ...(s.mehr?.liste?.punkte || []).map((x) => x.text)];
    assert.ok(s.mehr?.knopf && mehr.length >= 1, `${s.id}: Mehr mit Text`);
  }
  for (const t of texteVon(TECHNIK)) {
    assert.ok(!KONJUNKTIV.test(t), `Konjunktiv: ${t}`);
    assert.ok(!/™/.test(t), `Gitterchip mit ®: ${t}`);
  }
  for (const z of TECHNIK.schritte.find((s) => s.id === 'forschung').zahlen) {
    assert.match(z.quelle.href, /^\/pages\/studie-/, `${z.titel}: Fundstelle`);
  }
});
