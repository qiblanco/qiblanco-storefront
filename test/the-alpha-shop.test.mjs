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
import {existsSync, readFileSync, readdirSync} from 'node:fs';
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
    '60 cm - 750er ethisches Vollgold',
    '50 cm - 750er ethisches Vollgold',
    '45 cm - 750er ethisches Vollgold',
    '60 cm Kette aus Chirurgenstahl',
  ]);
  assert.equal(o[3].variante, null);
  // Box-Unterschrift (Christian 26.10.: „so wie "60 cm - 750er ethisches Vollgold"“)
  assert.deepEqual(o.map((x) => x.box), [
    '60 cm - 750er ethisches Vollgold',
    '50 cm - 750er ethisches Vollgold',
    '45 cm - 750er ethisches Vollgold',
    '60 cm - Kette aus Chirurgenstahl',
  ]);
  // ohne Goldkette-Produkt bleibt nur der Stahl
  assert.deepEqual(regeln.kettenOptionen(null).map((x) => x.art), ['stahl']);
});

test('Gravur und Box-Unterschrift: „69/111 - 1st. Edition“, ohne Wunsch „xx/111“', () => {
  assert.equal(regeln.gravurText(69), '69/111 - 1st. Edition');
  assert.equal(regeln.gravurText(null), 'xx/111 - 1st. Edition');
});

test('Raten: der Ratencode 9.999 € ist weg, Ratenzahlung geht mit jeder Konfiguration', () => {
  // Geteilte Zahlung (Grossjob 20261027-qi-alpha-geteilte-zahlung-10000-
  // raten-rest-sofort, s03); die Regeln misst test/qi-alpha-teilzahlung.test.mjs.
  assert.equal(regeln.ratenMoeglich, undefined);
  assert.equal(daten.RATEN, undefined);
  assert.equal(daten.BEZAHLUNG.raten.name, 'Ratenzahlung');
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
  assert.equal(daten.ZUSAMMENFASSUNG.titel, 'Dein neuer Qi Alpha®.');
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
  assert.match(shop, /data-tas-box-kette="">\s*\{mitMarkeR\(kette\?\.box/);
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

test('360-Grad-Loop oben im eigenen Abschnitt „Kohärentes Licht“ (Z218–Z220, Christian 28.10. Z16): stumm, Schleife, inline, Poster vom CDN, ohne Viereck, nicht mehr in der Galerie', () => {
  assert.match(daten.KOPF.loop.src, /^https:\/\/cdn\.shopify\.com\/videos\/.+\.mp4$/);
  assert.match(daten.KOPF.loop.poster, /^https:\/\/cdn\.shopify\.com\/.+qi-alpha-360-poster\.jpg/);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  const licht = shop.indexOf('data-tas-licht=""');
  const galerie = shop.indexOf('data-tas-galerie=""');
  assert.ok(licht > 0, 'Abschnitt Kohärentes Licht fehlt');
  // Z16: erst die Rotation, dann Bilder und Shop-Beschreibung
  assert.ok(licht < shop.indexOf('className="tas-raster-seite"'), 'Licht steht über dem Raster');
  const abschnitt = shop.slice(licht, galerie);
  assert.match(abschnitt, /<BandLoop loop=\{KOPF\.loop\}/);
  assert.match(abschnitt, /\{KOPF\.titel\}[\s\S]*\{KOPF\.unter\}/);
  // die Galerie zeigt nur Bilder: kein Loop, kein Loop-Daumen, Start auf Bild 0
  const galerieTeil = shop.slice(galerie, shop.indexOf('className="tas-auswahl"'));
  assert.doesNotMatch(galerieTeil, /BandLoop|KOPF\.loop|tas-daumen-knopf--loop/);
  assert.match(shop, /useState\(0\)/);
  const loop = shop.slice(shop.indexOf('function BandLoop'), shop.indexOf('function Zeichen'));
  for (const attr of ['autoPlay', 'muted', 'loop', 'playsInline', 'poster={loop.poster}']) assert.ok(loop.includes(attr), attr);
  const css = lies('app/styles/the-alpha-produkt.css');
  assert.match(css, /\.tas-band-loop \{[^}]*mix-blend-mode: lighten;/);
  // Desktop: dasselbe Raster wie Galerie | Auswahl, Rotation füllt die Galeriespalte (gleich groß wie das Galeriebild)
  const desktop = css.slice(css.indexOf('@media (min-width: 1024px)'));
  assert.match(desktop, /\.tas-licht-raster \{[^}]*grid-template-columns: minmax\(0, 7fr\) minmax\(0, 5fr\);[^}]*gap: var\(--tas-s-6\);/);
  assert.match(desktop, /\.tas-raster-seite \{[^}]*grid-template-columns: minmax\(0, 7fr\) minmax\(0, 5fr\);[^}]*gap: var\(--tas-s-6\);/);
  assert.match(desktop, /\.tas-licht-buehne \{[^}]*width: 100%;/);
  // Handy: untereinander, Text zuerst
  assert.match(css, /\.tas-licht-text \{\s*order: -1;/);
  const route = lies('app/routes/products.qi-alpha.jsx');
  assert.match(route, /rel: 'preload', as: 'image', href: KOPF\.loop\.poster/);
});

test('Erstes Fenster (Christian Z2, 27.10.; Z1/Z2 28.10.): Preis allein im Kopf, ohne Bewertung und Nutzerzahl, erste Option direkt darunter, kein Sprung', () => {
  assert.equal(daten.PRODUKT.sprung, undefined);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.doesNotMatch(shop, /data-tas-sprung|springeZumKonfigurator/);
  const kopf = shop.slice(shop.indexOf('data-tas-kopf'), shop.indexOf('</section>', shop.indexOf('data-tas-kopf')));
  // Launch ohne Bewertungen (Shop-Regel S5_launch_ohne_bewertung): kein Preisanker, keine Sterne, keine Nutzerzahl
  assert.match(kopf, /className="tas-preiszeile"[\s\S]*data-tas-preis=""[\s\S]*\{betragText\(hauptPreis, waehrung\)\}/);
  assert.doesNotMatch(shop, /TasPreisanker|data-qb-preisanker|qb-preisanker|StarRating|Google Bewertungen|14\.000 Nutzer/);
  // Punkte als Liste: Text direkt im <li> (Shop-Tor D4 K1), Zeichen davor
  assert.match(kopf, /<Zeichen art=\{p\.zeichen\} \/>\s*\{mitMarkeR\(p\.text\)\}/);
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

test('Nummer aus dem Variantentitel: alt „Alpha 19/111“ und neu „19/111“ (Christian 27.10.: „Qi Alpha® 19/111“)', () => {
  assert.equal(regeln.nummerAusTitel('Alpha 19/111'), 19);
  assert.equal(regeln.nummerAusTitel('Alpha 105/100'), 105);
  assert.equal(regeln.nummerAusTitel('19/111'), 19);
  assert.equal(regeln.nummerAusTitel('110/111'), 110);
  assert.equal(regeln.nummerAusTitel('Default Title'), null);
  assert.equal(regeln.nummerAusTitel(''), null);
});

test('Kasse zeigt Qi Alpha®, Nummer, Kette: übergeben wird umgekehrt, Qi Alpha® zuletzt (Shopify dreht cartLinesAdd)', () => {
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  const linien = /const linien = haupt\?\.id\s*\?\s*\[([\s\S]*?)\]\s*:\s*\[\];/.exec(shop);
  assert.ok(linien, 'linien-Block nicht gefunden');
  const block = linien[1];
  assert.match(block, /addonLinien\(\{[\s\S]*?\}\)\.reverse\(\)/);
  assert.ok(
    block.indexOf('addonLinien(') < block.indexOf('merchandiseId: haupt.id'),
    'Hauptzeile muss NACH den Add-ons übergeben werden',
  );
});

test('Nummern-Schritt: nur das Gravurbild, kein zweites Bild „Made in Germany“ (Christian 27.10.)', () => {
  assert.equal(daten.NUMMER.bildRueckseite, undefined);
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.doesNotMatch(shop, /bildRueckseite/);
  assert.match(shop, /tas-bildpaar tas-bildpaar--einzeln/);
});

test('Shopseite: jeder Text nennt „Qi Alpha®“ mit Zeichen (Christian 27.10.: „Qi Alpha immer mit R“)', async () => {
  const module = [
    daten,
    await import(join(WURZEL, 'app/components/campaign/the-alpha-faq-daten.js')),
    await import(join(WURZEL, 'app/components/the-alpha-shop/the-alpha-wissen-daten.js')),
  ];
  const ohneZeichen = /(?<![\w-])Qi Alpha(?![\w-]|\s*®)/;
  const funde = [];
  const gehe = (wert, pfad) => {
    if (typeof wert === 'string') {
      if (ohneZeichen.test(wert)) funde.push(`${pfad}: ${wert.slice(0, 60)}`);
    } else if (typeof wert === 'function') {
      if (wert.length === 0) gehe(wert(), `${pfad}()`);
    } else if (wert && typeof wert === 'object') {
      for (const [k, v] of Object.entries(wert)) gehe(v, `${pfad}.${k}`);
    }
  };
  module.forEach((m, i) => gehe(m, `modul${i}`));
  assert.deepEqual(funde, []);
});

// KEINE STEUERANGABE AUF DEN PRODUKTSEITEN (Christian 27.10.2026, Register
// Z223/Z232-Z233: „das mit den Mehrwertsteuern wird nirgendwo angezeigt, das
// zeigen wir erst im Checkout"; Grossjob 20261027-produktseiten-mwst-zeile-raus-z233 s03).
// Gemessen nach der Eigenschaft über JEDE Route app/routes/products.* und
// qi-master.css, ohne Kommentare (sie erzählen die Geschichte der entfernten
// Zeile und werden nicht ausgeliefert). ROT VOR GRÜN: auf origin/main cb5afb77
// rot (products.qi-alpha-b.jsx trug <p className="qm-steuerhinweis">).
// Landingpages (/pages/*) sind nicht Teil dieses Auftrags.
const ohneKommentare = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
const STEUER = /qm-steuerhinweis|MwSt|Mehrwertsteuer|Umsatzsteuer/i;

test('Produkt-Routen rendern keine Steuerangabe', () => {
  const routen = readdirSync(join(WURZEL, 'app/routes')).filter((f) =>
    /^products\..*\.jsx$/.test(f),
  );
  assert.ok(routen.length >= 5, `Produkt-Routen gefunden: ${routen.length}`);
  const funde = routen.filter((f) => STEUER.test(ohneKommentare(lies(`app/routes/${f}`))));
  assert.deepEqual(funde, []);
});

test('qi-master.css: keine Regel für den Steuerhinweis, keine inline-flex-Preiszeile', () => {
  const css = ohneKommentare(lies('app/styles/qi-master.css'));
  assert.ok(css.length > 1000, 'qi-master.css gelesen');
  assert.doesNotMatch(css, /\.qm-steuerhinweis/);
  assert.doesNotMatch(css, /\.qm-pdp \.Bestseller-Price > \.product-price/);
});

// ® KLEIN HOCHGESTELLT, Gitterchip®, 750er (Christian 28.10.2026 Z1, Z15, Z17;
// Grossjob 20261028-qi-alpha-kopf-99-registered-hochgestellt-ohne-bewertungen-
// chat-ratenzahlung, s03). Gemessen nach der Eigenschaft: jede Stelle, an der
// die Seiten-Komponenten einen Datentext mit „®“ zeichnen, läuft durch MarkeR
// bzw. mitMarkeR; die Daten bleiben lesbare Zeichenketten. Die gerenderte
// Seite misst die Abnahme-Probe. ROT VOR GRÜN: auf origin/main 19752493 rot.
const ohneKommentareMR = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');

const MR_DATEN = [
  'app/components/campaign/the-alpha-shop-daten.js',
  'app/components/campaign/the-alpha-faq-daten.js',
  'app/components/the-alpha-shop/the-alpha-wissen-daten.js',
];

test('ein Helfer: MarkeR setzt ® als <sup> mit 0,45 em, gleicher Farbe und Stärke', () => {
  assert.ok(existsSync(join(WURZEL, 'app/components/reusables/MarkeR.jsx')), 'MarkeR.jsx fehlt');
  const h = lies('app/components/reusables/MarkeR.jsx');
  assert.match(h, /<sup[\s\S]*className="qb-marke-r"/);
  assert.match(h, /fontSize: '0\.45em'/);
  assert.match(h, /color: 'inherit'/);
  assert.match(h, /fontWeight: 'inherit'/);
  assert.match(h, /lineHeight: 0/);
});

test('Gitterchip® statt Gitterchip™ und 750er statt 750iger in allen Texten der Kaufseite', () => {
  for (const f of MR_DATEN) {
    const s = ohneKommentareMR(lies(f));
    assert.doesNotMatch(s, /™/, `${f}: ™`);
    assert.doesNotMatch(s, /750iger/, `${f}: 750iger`);
  }
});

test('jede gezeichnete Stelle mit ® läuft durch den Helfer (Kopf, Zusammenfassung, Box, Wissen, Fragen)', () => {
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.match(shop, /<h1 id="tas-name" className="tas-name">\s*<MarkeR text=\{PRODUKT\.name\} \/>/);
  assert.match(shop, /<Zeichen art=\{p\.zeichen\} \/>\s*\{mitMarkeR\(p\.text\)\}/);
  assert.match(shop, /<MarkeR text=\{ZUSAMMENFASSUNG\.titel\} \/>/);
  // Zusammenfassung und Box: „Qi Alpha® · 19/111 - 1st. Edition“
  assert.equal((shop.match(/<MarkeR text=\{PRODUKT\.name\} \/> · \{gravur\}/g) || []).length, 2);
  // kein Datentext mit ® roh gezeichnet
  assert.doesNotMatch(ohneKommentareMR(shop), /\{PRODUKT\.name\}(?! \/>)|\{ZUSAMMENFASSUNG\.titel\}(?! \/>)|(?<!key=)\{p\.text\}/);

  const faq = ohneKommentareMR(lies('app/components/campaign/TheAlphaFaq.jsx'));
  for (const stelle of ['THE_ALPHA_FAQ_TITEL', 'f.frage', 'a', 'THE_ALPHA_FAQ_ANNA.titel', 'THE_ALPHA_FAQ_ANNA.text']) {
    const roh = new RegExp(`>\\s*\\{${stelle.replace('.', '\\.')}\\}\\s*<`);
    assert.doesNotMatch(faq, roh, `Fragen: {${stelle}} roh`);
  }
  assert.match(faq, /mitMarkeR\(f\.frage\)/);

  const wissen = ohneKommentareMR(lies('app/components/the-alpha-shop/TheAlphaWissen.jsx'));
  for (const stelle of ['p', 'a.zitat', 's.titel', 's.text', 'etikett', 'titel', 'q', 'a.zitatVon']) {
    const roh = new RegExp(`>\\s*\\{${stelle.replace('.', '\\.')}\\}\\s*<`);
    assert.doesNotMatch(wissen, roh, `Wissen: {${stelle}} roh`);
  }
});
