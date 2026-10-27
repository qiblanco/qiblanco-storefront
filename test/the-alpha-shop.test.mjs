/**
 * Wächter: SHOPSEITE /products/the-alpha (node --test, ohne Bundler) —
 * Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * Segment s12. Christian 25.10.2026 Z9/Z10, 26.10.2026 Z56–Z85.
 *
 * Gemessen werden die reinen Regeln (Nummernstand, Kettenwahl, Gravur, Raten)
 * und die Verdrahtung der beiden Routen: /products/the-alpha zeigt die neue
 * Seite, /products/the-alpha-b die bisherige Kaufseite unverändert.
 * ROT VOR GRÜN: auf origin/main vor s12 fehlen Module und Route B (rot).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const regeln = await import(join(WURZEL, 'app/components/campaign/the-alpha-kauf-laden.js'));
const daten = await import(join(WURZEL, 'app/components/campaign/the-alpha-shop-daten.js'));

const variante = (n, frei = true) => ({
  id: `gid://shopify/ProductVariant/${n}`,
  title: n <= 100 ? `Alpha ${n}/100` : `Alpha ${n}/111`,
  availableForSale: frei,
  price: {amount: '2000.0', currencyCode: 'EUR'},
});

test('Nummernstand: 1..111, Christians vergebene 2/44/88/99/111 nie wählbar', () => {
  const alle = Array.from({length: 111}, (_, i) => variante(i + 1));
  const {nummern, frei} = regeln.nummernStand(alle);
  assert.equal(nummern.length, 111);
  for (const n of [2, 44, 88, 99, 111]) assert.equal(nummern[n - 1].status, 'vergeben', String(n));
  assert.equal(frei, 106);
  assert.equal(nummern[68].status, 'frei');
  assert.equal(nummern[68].variante.id, 'gid://shopify/ProductVariant/69');
});

test('Nummernstand: Shopify-Sperre und fehlende Variante sind nicht wählbar', () => {
  const v = [variante(1), variante(3, false)];
  const {nummern} = regeln.nummernStand(v);
  assert.equal(nummern[0].status, 'frei');
  assert.equal(nummern[2].status, 'vergeben');
  assert.equal(nummern[4].status, 'fehlt');
});

test('Kettenwahl: Christians 60/50/45 in seiner Reihenfolge, dann Chirurgenstahl; 40/75 nicht', () => {
  const kette = {
    variants: {
      nodes: ['40 cm', '45 cm', '50 cm', '60 cm', '75 cm'].map((t) => ({
        id: t, title: t, availableForSale: true, price: {amount: '4879.0', currencyCode: 'EUR'},
      })),
    },
  };
  const o = regeln.kettenOptionen(kette);
  assert.deepEqual(o.map((x) => x.name), [
    '60 cm - 750iger ethisches Vollgold',
    '50 cm - 750iger ethisches Vollgold',
    '45 cm - 750iger ethisches Vollgold',
    '60 cm Kette aus Chirurgenstahl',
  ]);
  assert.equal(o[3].variante, null);
  // Box-Unterschrift (Christian 26.10.: „so wie "60 cm - 750iger ethisches Vollgold"“)
  assert.deepEqual(o.map((x) => x.box), [
    '60 cm - 750iger ethisches Vollgold',
    '50 cm - 750iger ethisches Vollgold',
    '45 cm - 750iger ethisches Vollgold',
    '60 cm - Kette aus Chirurgenstahl',
  ]);
  // ohne Goldkette-Produkt bleibt nur der Stahl
  assert.deepEqual(regeln.kettenOptionen(null).map((x) => x.art), ['stahl']);
});

test('Gravur und Box-Unterschrift: „69/111 - 1st. Edition“, ohne Wunsch „xx/111“', () => {
  assert.equal(regeln.gravurText(69), '69/111 - 1st. Edition');
  assert.equal(regeln.gravurText(null), 'xx/111 - 1st. Edition');
});

test('Raten: nur ohne Wunschnummer und mit Stahlkette (Ratencode 9.999 € gilt nicht mit Extras)', () => {
  assert.equal(regeln.ratenMoeglich({nummer: null, kette: {art: 'stahl'}}), true);
  assert.equal(regeln.ratenMoeglich({nummer: 69, kette: {art: 'stahl'}}), false);
  assert.equal(regeln.ratenMoeglich({nummer: null, kette: {art: 'gold'}}), false);
  assert.equal(daten.RATEN.ratenpreis, 9999);
  assert.doesNotMatch(JSON.stringify(daten), /0 ?% (APR|Finanzierung|Zins)/i);
});

test('Betrag: ganze Euro ohne Cent (10.639 €), echte Cents bleiben', () => {
  assert.equal(regeln.betragText(10639).replace(/\s/g, ' '), '10.639 €');
  assert.equal(regeln.betragText(9.5).replace(/\s/g, ' '), '9,50 €');
});

test('Inhalte nur aus Christians Vorlage: Kopf, Produkt, Zusammenfassung, Box', () => {
  assert.equal(daten.KOPF.titel, 'Kohärentes Licht');
  assert.equal(daten.KOPF.unter, '- Ultra High Vibe Mode -');
  assert.equal(daten.PRODUKT.name, 'Qi Alpha®');
  assert.equal(daten.PRODUKT.edition, '1st. Edition · 111 Stück');
  assert.deepEqual(daten.PRODUKT.herkunft, ['Designed in Germany.', 'Made in Germany.']);
  assert.equal(daten.ZUSAMMENFASSUNG.titel, 'Dein neuer Qi Alpha.');
  assert.equal(daten.ZUSAMMENFASSUNG.unter, 'Genau so, wie du ihn willst.');
  assert.equal(daten.BOX.titel, "What's in the Box");
  // keine QiOne-2-Pro-Fotos in der Galerie
  for (const b of daten.GALERIE.bilder) assert.match(b.url, /qi-alpha-0\d/);
});

test('Verdrahtung: /products/qi-alpha rendert TheAlphaShop, qi-alpha-b die bisherige Kaufseite (Umzug 27.10.2026)', () => {
  const a = lies('app/routes/products.qi-alpha.jsx');
  // seit s07 (Grossjob 20261026) mit Wissens-Strecke und Fragen unter der Box
  assert.match(a, /<TheAlphaShop\s+product=\{product\}\s+addons=\{addons\}[\s\S]*?\/>/);
  assert.match(a, /const THE_ALPHA_PDP_PFAD = '\/products\/qi-alpha';/);
  assert.match(a, /\{name: 'robots', content: 'noindex,nofollow'\}/);
  const b = lies('app/routes/products.qi-alpha-b.jsx');
  assert.match(b, /const THE_ALPHA_PDP_PFAD = '\/products\/qi-alpha-b';/);
  assert.match(b, /<QiOneBuyBox/);
  assert.match(b, /<QiMasterAddons/);
  assert.match(b, /throw redirect\(`\$\{THE_ALPHA_PDP_PFAD\}\$\{url\.search\}`, 301\)/);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  // Kaufweg aus dem Bestand: Add-on-Zeilen mit Merkmal, Hauptzeile mit Variante
  assert.match(shop, /addonLinien\(\{/);
  assert.match(shop, /\{merchandiseId: haupt\.id, quantity: 1, selectedVariant: haupt\}/);
  assert.match(shop, /<EuGewaehrleistungsHinweis \/>/);
  assert.match(shop, /<Analytics\.ProductView/);
});

test('Kettenbilder: je Aufnahme ein Stahl- und ein Goldbild, die Box-Unterschrift liest `box` (s04)', () => {
  for (const b of daten.KETTE.bilder) {
    assert.match(b.stahl, /the-alpha-kette-.+-stahl(-f5)?\.jpg/);
    assert.match(b.gold, /the-alpha-kette-.+-gold(-f5)?\.jpg/);
  }
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.match(shop, /data-tas-box-kette="">\s*\{kette\?\.box/);
});

test('Produktkopf (s07-r2, Christian 27.10. Z237–Z252): genau Christians Zeilen, kein Knopf, keine Steuerzeile', () => {
  assert.equal(daten.PRODUKT.name, 'Qi Alpha®');
  assert.equal(daten.PRODUKT.claim, 'Ultimate Wearable');
  assert.deepEqual(
    daten.PRODUKT.punkte.map((p) => p.text),
    [
      'Zweiteiliger Gitterchip®',
      'Hochreiner Natur Diamant eingelassen in den Gitterchip®',
      'Kohärentes Licht vereinigt sich mit Kohärentem Wasser',
    ],
  );
  assert.deepEqual(daten.PRODUKT.punkte.map((p) => p.zeichen), ['gitter', 'diamant', 'licht-wasser']);
  assert.equal(daten.PRODUKT.preisZusatz, undefined);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  const kopf = shop.slice(shop.indexOf('data-tas-kopf'), shop.indexOf('{nummernAn ?'));
  assert.ok(kopf.length > 100, 'Kopfbereich gefunden');
  assert.doesNotMatch(kopf, /AddToCartButton|MwSt|Weltneuheit|preisZusatz|tas-kauf-oben/);
  assert.doesNotMatch(shop, /inkl\. 19 % MwSt/);
  // der Konfigurator unten behält den einen Kaufknopf
  assert.equal((shop.match(/<AddToCartButton/g) || []).length, 1);
  const css = lies('app/styles/the-alpha-produkt.css');
  assert.match(css, /--tas-rot: #b92200;/);
  assert.match(css, /prefers-reduced-motion: reduce\)[\s\S]*\.tas-zeichen-puls/);
});

test('360-Grad-Loop im schwarzen Band (Z218–Z220): stumm, Schleife, inline, Poster vom CDN, ohne Viereck', () => {
  assert.match(daten.KOPF.loop.src, /^https:\/\/cdn\.shopify\.com\/videos\/.+\.mp4$/);
  assert.match(daten.KOPF.loop.poster, /^https:\/\/cdn\.shopify\.com\/.+qi-alpha-360-poster\.jpg/);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  const band = shop.slice(shop.indexOf('data-tas-band'), shop.indexOf('</header>'));
  assert.match(band, /<BandLoop loop=\{KOPF\.loop\}/);
  // Z2 (27.10.): das Band ist die Bühne der Galerie-Spalte, nicht mehr ein Streifen über dem Raster
  const galerie = shop.indexOf('data-tas-galerie');
  assert.ok(galerie > 0 && galerie < shop.indexOf('data-tas-band'), 'Band steht in der Galerie');
  assert.ok(shop.indexOf('data-tas-band') < shop.indexOf('className="tas-auswahl"'), 'Band vor der Auswahl-Spalte');
  assert.match(shop, /useState\(KOPF\.loop \? -1 : 0\)/);
  assert.match(shop, /tas-daumen-knopf--loop/);
  const loop = shop.slice(shop.indexOf('function BandLoop'), shop.indexOf('function Zeichen'));
  for (const attr of ['autoPlay', 'muted', 'loop', 'playsInline', 'poster={loop.poster}']) assert.ok(loop.includes(attr), attr);
  const css = lies('app/styles/the-alpha-produkt.css');
  assert.match(css, /\.tas-band-loop \{[^}]*mix-blend-mode: lighten;/);
  const route = lies('app/routes/products.qi-alpha.jsx');
  assert.match(route, /rel: 'preload', as: 'image', href: KOPF\.loop\.poster/);
});

test('Erstes Fenster (Christian Z2, 27.10.): Preisanker-Dreizeiler im Kopf, erste Option direkt darunter, kein Sprung', () => {
  assert.equal(daten.PRODUKT.sprung, undefined);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.doesNotMatch(shop, /data-tas-sprung|springeZumKonfigurator/);
  const kopf = shop.slice(shop.indexOf('data-tas-kopf'), shop.indexOf('</section>', shop.indexOf('data-tas-kopf')));
  assert.match(kopf, /<TasPreisanker betrag=\{betragText\(hauptPreis, waehrung\)\} \/>/);
  // Kanon preisanker-und-videokante.md: Bewertung -> Nutzer -> Preis, die Klassen des Haus-Bausteins (Shop-Tor S3)
  const anker = shop.slice(shop.indexOf('function TasPreisanker'), shop.indexOf('/** Eine Auswahl-Karte'));
  const pos = ['qb-preisanker__bewertung"', 'qb-preisanker__nutzer', 'qb-preisanker__preiszeile'].map((k) => anker.indexOf(k));
  assert.ok(pos.every((x) => x > 0) && pos[0] < pos[1] && pos[1] < pos[2], 'Reihenfolge Bewertung, Nutzer, Preis');
  assert.match(anker, /data-qb-preisanker=""/);
  assert.match(anker, /href=\{GOOGLE_REVIEWS_URL\}/);
  assert.doesNotMatch(anker, /SterneSprung|qb-preisanker__banner/);
  // Punkte als Liste: Text direkt im <li> (Shop-Tor D4 K1), Zeichen davor
  assert.match(kopf, /<Zeichen art=\{p\.zeichen\} \/>\s*\{p\.text\}/);
  // genau ein erster Schritt je Zustand: Nummer-Schritt, sonst Ketten-Schritt
  assert.match(shop, /id="tas-konfigurator"\s+className="tas-schritt tas-schritt--erster"\s+aria-labelledby="tas-nummer-titel"/);
  assert.match(shop, /id=\{nummernAn \? undefined : 'tas-konfigurator'\}/);
  const css = lies('app/styles/the-alpha-produkt.css');
  // Handy: Kopf, erste Option, dann Bühne; keine Spalte breiter als das Fenster
  assert.match(css, /\.tas-produkt \{\s*order: -2;/);
  assert.match(css, /\.tas-schritt--erster \{\s*order: -1;/);
  assert.match(css, /grid-template-columns: minmax\(0, 1fr\);/);
  // Nutzerzahl >= 80 % der Preisschrift (28 zu 32 px)
  assert.match(css, /--tas-fs-5: 1\.75rem;/);
  assert.match(css, /--tas-fs-preis: 2rem;/);
});
