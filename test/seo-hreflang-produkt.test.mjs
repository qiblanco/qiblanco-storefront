// Hermetische Tests der SEO-Nachtraege vom 2026-08-15 (Auftrag
// 20260815-seo-reflexion-lowhigh-hanging-fruits):
//   - hreflang-Gegenrichtung zur US-Startseite  (app/lib/hreflang.js)
//   - Product-Auszeichnung der Produktseiten    (app/lib/produkt-schema.js)
//   - Index-Hygiene der Produkt-Handles         (app/lib/seo.js)
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/seo-hreflang-produkt.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DACH_ORIGIN,
  SEITEN_PAARE,
  US_ORIGIN,
  hreflangLinks,
  normalisiere,
} from '../app/lib/hreflang.js';
import {produktSchema} from '../app/lib/produkt-schema.js';
import {
  NICHT_INDEXIERBARE_PRODUKTE,
  istNichtIndexierbaresProdukt,
} from '../app/lib/seo.js';

// --- hreflang: dieselbe Renderfalle wie beim Canonical ----------------------
// Ohne `tagName` rendert react-router-7 den Descriptor als <meta ...> statt
// als <link> — im Quelltext kaum zu unterscheiden, für Suchmaschinen
// wirkungslos. isValidMetaTag des Routers akzeptiert genau /^(meta|link)$/.
test('hreflangLinks tragen tagName=link (sonst rendert react-router <meta>)', () => {
  const links = hreflangLinks('/');
  assert.equal(links.length, 3);
  for (const l of links) {
    assert.equal(l.tagName, 'link');
    assert.match(l.tagName, /^(meta|link)$/);
    assert.equal(l.rel, 'alternate');
    assert.ok(l.hrefLang, 'hrefLang fehlt');
    assert.ok(l.href.startsWith('https://'), 'href muss absolut sein');
  }
});

// --- Der eigentliche Befund: Gegenseitigkeit --------------------------------
// Die US-Startseite liefert seit jeher exakt diese drei Angaben aus. Google
// verwirft eine hreflang-Gruppe vollständig, wenn die Gegenseite sie nicht
// bestaetigt — die DACH-Seite MUSS deshalb wortgleich dieselbe Menge nennen.
test('Startseite spiegelt die drei Angaben der US-Seite exakt', () => {
  const nach = Object.fromEntries(
    hreflangLinks('/').map((l) => [l.hrefLang, l.href]),
  );
  assert.deepEqual(nach, {
    en: `${US_ORIGIN}/`,
    de: `${DACH_ORIGIN}/`,
    'x-default': `${US_ORIGIN}/`,
  });
});

test('x-default zeigt auf dieselbe Seite wie en (sonst Widerspruch in der Gruppe)', () => {
  const nach = Object.fromEntries(
    hreflangLinks('/').map((l) => [l.hrefLang, l.href]),
  );
  assert.equal(nach['x-default'], nach.en);
});

// Sprachcode, nicht Sprache-Land: `de-DE` würde Oesterreich und die Schweiz
// aus der Auszeichnung werfen, obwohl die DACH-Seite sie mitbedient.
test('deutscher Zweig ist der reine Sprachcode, nicht de-DE', () => {
  assert.ok(hreflangLinks('/').some((l) => l.hrefLang === 'de'));
  assert.ok(!hreflangLinks('/').some((l) => l.hrefLang === 'de-DE'));
});

// --- Die Aufnahmebedingung ist der Schutz vor Wirkungslosigkeit -------------
// Ein Paar ohne Gegenrichtung ist nicht halb so gut, sondern wirkungslos.
// Solange das US-Theme kein hreflang ausliefert, darf hier NUR die Startseite
// stehen. Dieser Test fällt absichtlich, wenn jemand Produktpaare einträgt,
// ohne die US-Seite mitzuliefern.
test('Paar-Tabelle enthält nur beidseitig belegte Paare', () => {
  assert.deepEqual(Object.keys(SEITEN_PAARE), ['/']);
});

test('unbekannter Pfad ergibt KEINE geratene Zuordnung', () => {
  assert.deepEqual(hreflangLinks('/products/qione-2-pro'), []);
  assert.deepEqual(hreflangLinks('/pages/studien'), []);
});

test('normalisiere trimmt Query, Hash und Schluss-Slash', () => {
  assert.equal(normalisiere('/pages/x/'), '/pages/x');
  assert.equal(normalisiere('/pages/x?a=1'), '/pages/x');
  assert.equal(normalisiere('/pages/x#y'), '/pages/x');
  assert.equal(normalisiere('/'), '/');
  assert.equal(normalisiere(''), '/');
});

// --- Index-Hygiene der Produkte --------------------------------------------
test('die sechs am 2026-08-15 belegten Handles stehen auf der Liste', () => {
  for (const handle of [
    'test-page-crystal-cacao®-create-spater-wieder-loschen',
    'crystal-cacao-adfiefiale',
    '8kendiw34hd',
    'pjdz538hgs0',
    'aw783hfn',
    '37cr378n',
  ]) {
    assert.ok(
      istNichtIndexierbaresProdukt(handle),
      `${handle} fehlt in NICHT_INDEXIERBARE_PRODUKTE`,
    );
  }
});

// Gegenrichtung: die Liste darf keine Seite treffen, die man kaufen kann.
// Genau das ist ihr Aufnahme-Kriterium, und ohne diesen Test wäre ein
// versehentlich zuviel eingetragener Handle von außen nicht zu bemerken.
test('kaufbare Produkte bleiben indexierbar', () => {
  for (const handle of [
    'qione-2-pro',
    'qibracelet',
    'qihome-air',
    'qione-kette',
    'crystal-cacao-awake',
    'crystal-cacao-create',
    'bundle-2x-awake',
    'mengenrabatt-3x-create',
    'broschure',
    'qione-1',
  ]) {
    assert.ok(
      !istNichtIndexierbaresProdukt(handle),
      `${handle} darf NICHT auf der Liste stehen`,
    );
  }
});

test('die drei Bestands-Bundles sind beim Zusammenlegen nicht verloren gegangen', () => {
  for (const handle of [
    'bundle-fundament',
    'bundle-unabhangig',
    'bundle-erholungs-residenz',
  ]) {
    assert.ok(NICHT_INDEXIERBARE_PRODUKTE.includes(handle), handle);
  }
});

test('istNichtIndexierbaresProdukt verträgt undefined', () => {
  assert.equal(istNichtIndexierbaresProdukt(undefined), false);
  assert.equal(istNichtIndexierbaresProdukt(''), false);
});

// --- Product-Auszeichnung ---------------------------------------------------
const PRODUKT = {
  handle: 'qione-2-pro',
  title: 'QiOne® 2 Pro',
  description: 'Schutz  im\nAlltag.',
  images: {nodes: [{url: 'https://cdn.example/1.webp'}, {url: null}]},
  selectedOrFirstAvailableVariant: {
    availableForSale: true,
    sku: 'QO2P',
    price: {amount: '1290.00', currencyCode: 'EUR'},
  },
};

test('Product-Knoten trägt die tragenden Felder', () => {
  const s = produktSchema(PRODUKT);
  assert.equal(s['@type'], 'Product');
  assert.equal(s.name, 'QiOne® 2 Pro');
  assert.equal(s.url, 'https://qiblanco.com/products/qione-2-pro');
  assert.equal(s.offers.price, '1290.00');
  assert.equal(s.offers.priceCurrency, 'EUR');
  assert.equal(s.offers.availability, 'https://schema.org/InStock');
  assert.equal(s.sku, 'QO2P');
  assert.deepEqual(s.image, ['https://cdn.example/1.webp']);
  assert.equal(s.description, 'Schutz im Alltag.');
});

test('ausverkauft wird als OutOfStock ausgezeichnet', () => {
  const s = produktSchema({
    ...PRODUKT,
    selectedOrFirstAvailableVariant: {
      ...PRODUKT.selectedOrFirstAvailableVariant,
      availableForSale: false,
    },
  });
  assert.equal(s.offers.availability, 'https://schema.org/OutOfStock');
});

test('gepflegtes seo.description hat Vorrang vor dem Produkttext', () => {
  const s = produktSchema({...PRODUKT, seo: {description: 'Gepflegt.'}});
  assert.equal(s.description, 'Gepflegt.');
});

// Lieber gar kein Knoten als ein unvollständiger: ein fehlerhaftes Element
// steht dauerhaft in der Search Console, ein fehlendes bewirkt nur nichts.
test('ohne Preis entsteht KEIN Knoten', () => {
  assert.equal(
    produktSchema({...PRODUKT, selectedOrFirstAvailableVariant: {}}),
    null,
  );
  assert.equal(produktSchema({...PRODUKT, selectedOrFirstAvailableVariant: undefined}), null);
});

test('ohne Handle oder Titel entsteht KEIN Knoten', () => {
  assert.equal(produktSchema({...PRODUKT, handle: undefined}), null);
  assert.equal(produktSchema({...PRODUKT, title: ''}), null);
  assert.equal(produktSchema(undefined), null);
});

// Erfundene Sterne sind ein Richtlinienverstoss mit Domain-weiter Wirkung.
// Solange keine Produktbewertungen erhoben werden, darf das Feld nicht
// entstehen — auch nicht "vorsorglich" aus einer fremden Quelle.
test('KEINE erfundene aggregateRating/review-Auszeichnung', () => {
  const s = produktSchema(PRODUKT);
  assert.equal(s.aggregateRating, undefined);
  assert.equal(s.review, undefined);
});

test('KEINE geratene GTIN/MPN', () => {
  const s = produktSchema(PRODUKT);
  assert.equal(s.gtin, undefined);
  assert.equal(s.gtin13, undefined);
  assert.equal(s.mpn, undefined);
});
