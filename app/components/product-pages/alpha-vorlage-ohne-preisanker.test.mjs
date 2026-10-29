/*
 * Apple-Kaufseiten ohne Preisanker und ohne Box-Liste (Christian 29.10.2026,
 * Job 20261029-apple-seiten-box-foto-band-preisanker-weg-raten-mit-kette):
 *   node --test app/components/product-pages/alpha-vorlage-ohne-preisanker.test.mjs
 *
 * Z2 „das wirklich dauerhaft löaschen“: der Preisanker kam über zwei Wege
 * zurück, beide hält dieser Test fest.
 *   1. Die Vorlage rendert den Baustein Preisanker (dessen Vorgaben
 *      „+ 14.000 Nutzer“ und „Ultimate Power“ greifen auch ohne Daten).
 *   2. Die Daten je Produkt tragen ein Feld `preisanker`.
 * Am gerenderten Rand hält die Shop-Regel S6_apple_ohne_preisanker
 * (design-meister/db/webdesign/shop-regeln.yaml, hb-deploy Gate 30) dasselbe fest.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const VORLAGE = process.env.ALPHA_VORLAGE_JSX || join(HIER, 'AlphaVorlage.jsx');
const DATEN = ['qione-2-pro', 'qibracelet', 'qihome-air', 'qione-kette'].map((h) => ({
  handle: h,
  pfad: process.env[`ALPHA_DATEN_${h.replace(/-/g, '_').toUpperCase()}`] ||
    join(HIER, `${h}-alpha-daten.js`),
}));

test('Vorlage rendert keinen Preisanker, keine Nutzerzahl, kein Schild', () => {
  const src = readFileSync(VORLAGE, 'utf-8');
  assert.doesNotMatch(src, /<Preisanker\b/);
  assert.doesNotMatch(src, /reusables\/Preisanker/);
  assert.doesNotMatch(src, /14\.000|Ultimate Power|Bestseller Angebot/);
  assert.match(src, /data-av-preis=""/, 'Preis steht allein im Kopf');
});

test('Vorlage zeigt in der Box keine Liste', () => {
  const src = readFileSync(VORLAGE, 'utf-8');
  assert.doesNotMatch(src, /av-box-liste/);
});

for (const {handle, pfad} of DATEN) {
  test(`Daten ${handle}: kein preisanker-Feld, Box nur als Bilder`, async () => {
    const d = await import(`${pfad}?t=${Date.now()}`);
    assert.equal(d.PRODUKT.preisanker, undefined, `${handle}: PRODUKT.preisanker`);
    if (d.BOX) {
      assert.equal(d.BOX.teile, undefined, `${handle}: BOX.teile wäre wieder eine Liste`);
      for (const k of d.BOX.kacheln ?? []) {
        assert.ok(k.name && k.bild?.url && k.bild?.alt, `${handle}: Box-Kachel ohne Bild`);
      }
    }
  });
}

test('QiOne® 2 Pro: Baumwollband als Bild in der Box', async () => {
  const d = await import(DATEN[0].pfad);
  const band = (d.BOX.kacheln ?? []).find((k) => /Baumwollband/.test(k.name));
  assert.ok(band, 'Kachel Baumwollband fehlt');
  assert.match(band.bild.url, /^https:\/\/cdn\.shopify\.com\/.*\/box-baumwollband\.webp(\?|$)/);
});
