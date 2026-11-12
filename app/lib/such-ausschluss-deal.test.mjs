// Deal-Seiten raus aus Suche und Kollektionen (Elina EL-20261111-fa47cfd9, D2).
// Lauf: node --test app/lib/such-ausschluss-deal.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {istDealSeite, istSuchAusgeschlossen, ohneAusgeschlossene} from './such-ausschluss.js';

const IM_FENSTER = Date.parse('2026-11-12T06:00:00Z');
const NACH_FENSTER = Date.parse('2026-12-01T06:00:00Z');
const eur = (handle) => ({handle, priceRange: {minVariantPrice: {currencyCode: 'EUR'}}});
const chf = (handle) => ({handle, priceRange: {minVariantPrice: {currencyCode: 'CHF'}}});

test('die beiden Shopify-Deal-Produkte sind immer ausgeschlossen', () => {
  for (const h of ['8kendiw34hd', 'pjdz538hgs0']) {
    assert.equal(istDealSeite(eur(h), IM_FENSTER), true, h);
    assert.equal(istDealSeite(eur(h), NACH_FENSTER), true, h);
    assert.equal(istSuchAusgeschlossen(eur(h)), true, h);
  }
});

test('alte Kakao-Adressen nur, solange sie weiterleiten', () => {
  assert.equal(istDealSeite(eur('bundle-2x-awake'), IM_FENSTER), true);
  assert.equal(istDealSeite(eur('mengenrabatt-2x'), IM_FENSTER), true);
  assert.equal(istDealSeite(eur('bundle-2x-awake'), NACH_FENSTER), false);
  // nurEuro: im Fremdmarkt leitet sie nicht weiter, die Kachel bleibt
  assert.equal(istDealSeite(chf('bundle-2x-awake'), IM_FENSTER), false);
  // unbekannte Waehrung zaehlt als Euro
  assert.equal(istDealSeite({handle: 'mengenrabatt-2x'}, IM_FENSTER), true);
});

test('normale Produkte bleiben im Raster', () => {
  for (const h of ['qione-2-pro', 'qibracelet', 'qihome-air', 'bundle-3x-awake', 'mengenrabatt-3x-create', 'crystal-cacao-create']) {
    assert.equal(istDealSeite(eur(h), IM_FENSTER), false, h);
  }
  // Basisprodukte der Deals sind kein Deal-Handle
  assert.equal(istDealSeite(eur('bundle-1x-awake-1x-create'), IM_FENSTER), false);
  assert.equal(istDealSeite(null), false);
  assert.equal(istDealSeite({}), false);
});

test('ohneAusgeschlossene nimmt Deal-Kacheln aus einer Liste', () => {
  const raster = ['qione-1', 'qione-2-pro', 'pjdz538hgs0', '8kendiw34hd', 'broschure'].map(eur);
  assert.deepEqual(ohneAusgeschlossene(raster).map((n) => n.handle), ['qione-1', 'qione-2-pro', 'broschure']);
});
