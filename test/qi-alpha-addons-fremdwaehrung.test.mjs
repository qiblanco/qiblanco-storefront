/**
 * Wächter: Wunschnummer und Goldkette in JEDEM Markt, in dem Shopify sie
 * verkauft (node --test, ohne Bundler). Job 20261030-repair-kaufweg-addons-
 * fremdwaehrung-fix-live, FEHLER-DB F-2755.
 *
 * Seit der Länder-Achse (PR #1105, 30.10.2026) bekommt Thailand den TH-Markt
 * in THB. Das Tor ADDON_WAEHRUNGEN = ['EUR', 'CHF'] blendete dort Nummern-
 * Schritt und Goldketten aus, obwohl der Loader beide Produkte mit THB-Preis
 * lieferte (Annas iPhone in Bangkok, Christian Z8/Z11/Z12).
 * ROT VOR GRÜN: auf origin/main 86faa6db fehlt kaufAuswahl (rot); mit dem
 * alten Währungstor in addonsImMarkt ist der TH-Fall rot (Mutant im RESULT).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const laden = await import(join(WURZEL, 'app/components/campaign/the-alpha-kauf-laden.js'));
const addonsLib = await import(join(WURZEL, 'app/lib/qi-master-addons.js'));

const preis = (amount, currencyCode) => ({amount: String(amount), currencyCode});
const markt = (waehrung, nummernPreis, kettePreis) => ({
  haupt: {id: 'gid://shopify/ProductVariant/1', availableForSale: true, price: preis(369834, waehrung)},
  addons: {
    wunschnummer: {
      handle: 'qi-alpha-wunschnummer',
      variants: {
        nodes: Array.from({length: 111}, (_, i) => ({
          id: `gid://shopify/ProductVariant/n${i + 1}`,
          title: `${i + 1}/111`,
          availableForSale: true,
          price: preis(nummernPreis, waehrung),
        })),
      },
    },
    kette: {
      handle: 'qi-alpha-goldkette',
      variants: {
        nodes: ['40 cm', '45 cm', '50 cm', '60 cm', '75 cm'].map((t) => ({
          id: `gid://shopify/ProductVariant/k${t}`,
          title: t,
          availableForSale: true,
          price: preis(kettePreis, waehrung),
        })),
      },
    },
  },
});

for (const [land, waehrung] of [
  ['DE', 'EUR'],
  ['TH', 'THB'],
  ['US', 'USD'],
  ['GB', 'GBP'],
]) {
  test(`Markt ${land}/${waehrung}, Add-ons verfügbar -> Nummern-Schritt und Goldketten da`, () => {
    const {haupt, addons} = markt(waehrung, 75000, 169609);
    const a = laden.kaufAuswahl(addons, haupt);
    assert.equal(a.nummernAn, true, `${land}: Nummern-Schritt fehlt`);
    assert.equal(a.stand.frei, 105, `${land}: 111 minus Christians 6 vergebene`);
    const gold = a.ketten.filter((k) => k.art === 'gold');
    assert.deepEqual(gold.map((k) => k.titel), ['60 cm', '50 cm', '45 cm'], `${land}: Goldketten fehlen`);
    assert.equal(a.ketten.at(-1).art, 'stahl');
    assert.equal(gold[0].variante.price.currencyCode, waehrung);
  });
}

test('Qi Alpha nicht kaufbar -> keine Add-ons, nur Stahl', () => {
  const {haupt, addons} = markt('THB', 75000, 169609);
  const a = laden.kaufAuswahl(addons, {...haupt, availableForSale: false});
  assert.equal(a.nummernAn, false);
  assert.deepEqual(a.ketten.map((k) => k.art), ['stahl']);
});

test('Add-on-Variante ohne Preis in der Marktwährung zählt nicht (kein Mischbetrag)', () => {
  const {haupt, addons} = markt('THB', 75000, 169609);
  addons.kette.variants.nodes[3].price = preis(4879, 'EUR'); // 60 cm in EUR
  const a = laden.kaufAuswahl(addons, haupt);
  assert.deepEqual(
    a.ketten.filter((k) => k.art === 'gold').map((k) => k.titel),
    ['50 cm', '45 cm'],
  );
  const leer = addonsLib.addonsImMarkt({wunschnummer: null, kette: null}, haupt);
  assert.deepEqual(leer, {wunschnummer: null, kette: null});
});

test('Kein Währungstor mehr in den Lesern (ADDON_WAEHRUNGEN entfernt)', () => {
  assert.equal('ADDON_WAEHRUNGEN' in addonsLib, false);
  for (const f of [
    'app/components/campaign/TheAlphaShop.jsx',
    'app/routes/products.qi-alpha-b.jsx',
  ]) {
    assert.doesNotMatch(lies(f), /ADDON_WAEHRUNGEN/, f);
  }
  assert.match(lies('app/components/campaign/TheAlphaShop.jsx'), /kaufAuswahl\(addons, haupt\)/);
  assert.match(lies('app/routes/products.qi-alpha-b.jsx'), /addonsImMarkt\(addons, qmVariante\)/);
});

test('Kartenbeträge in Marktwährung, auch die 0 (kein fest getipptes „€“)', () => {
  const quelle = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.doesNotMatch(quelle, /'0 €'|"\+ 0 €"|'\+ 0 €'/);
  assert.match(laden.betragText(0, 'THB'), /฿/);
  assert.doesNotMatch(laden.betragText(0, 'THB'), /€/);
  assert.match(laden.betragText(0, 'EUR'), /^0\s€$/);
});
