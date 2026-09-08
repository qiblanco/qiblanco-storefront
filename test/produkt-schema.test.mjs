// Hermetische Tests der Produkt-IDENTITÄT im JSON-LD (SEO-Stufe S6).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausführen: node --test test/produkt-schema.test.mjs
//
// WARUM DIESE DATEI NEU IST UND NICHT ERGÄNZT WURDE: `produktSchema()` wird
// heute in zwei fremden Dateien mitgetestet (seo-hreflang-produkt.test.mjs,
// seo-restposten-scaffold-twitter-brotkrume.test.mjs). Beide gehören zu
// anderen Aufträgen, und die erste trug am 2026-09-07 fremde, noch nicht
// eingecheckte Änderungen im geteilten Arbeitsbaum. Ein Nachtrag dort wäre
// ein Konflikt mit fremder Arbeit gewesen. Diese Datei trägt den Modulnamen
// und ist ein eigenes, überschneidungsfreies Gebiet.
//
// WAS SIE PRÜFT: die REGEL, nicht das Literal. Nicht
// „alternateName === 'QiOne 2 Pro'“ — das wäre nach der ersten
// Produktumbenennung still falsch —, sondern „alternateName ist der name
// ohne Schutzrechts-Zeichen, und er entsteht NUR, wenn er sich vom name
// unterscheidet“.
import test from 'node:test';
import assert from 'node:assert/strict';

import {produktSchema, suchform} from '../app/lib/produkt-schema.js';
import {ORG_ID, ORGANISATION} from '../app/lib/entity-schema.js';

/**
 * Ein Produkt in der Form, in der die Routen es aus dem Loader bekommen.
 * Der Preis ist der NETTO-Betrag aus Shopify — produktSchema() rechnet ihn
 * über den Kanon auf den Anzeigewert hoch (siehe Kopf der Bibliothek).
 */
function produkt(titel, handle = 'qione-2-pro') {
  return {
    handle,
    title: titel,
    selectedOrFirstAvailableVariant: {
      availableForSale: true,
      sku: 'QO2P-1',
      price: {amount: '913.45', currencyCode: 'EUR'},
    },
    images: {nodes: [{url: 'https://cdn.shopify.com/x.webp'}]},
    description: 'Testbeschreibung',
  };
}

// --- Die Suchform selbst ----------------------------------------------------

test('suchform entfernt die Schutzrechts-Zeichen und faltet die Lücke', () => {
  assert.equal(suchform('QiOne® 2 Pro'), 'QiOne 2 Pro');
  assert.equal(suchform('QiOne™ 2 Pro'), 'QiOne 2 Pro');
  assert.equal(suchform('QiOne© 2 Pro'), 'QiOne 2 Pro');
});

test('suchform lässt einen Titel ohne Schutzzeichen unverändert', () => {
  assert.equal(suchform('QiBracelet'), 'QiBracelet');
  assert.equal(suchform('Crystal Cacao Awake'), 'Crystal Cacao Awake');
});

test('suchform trimmt und verträgt fehlende Eingaben', () => {
  assert.equal(suchform('  QiHome   Air  '), 'QiHome Air');
  assert.equal(suchform(undefined), '');
  assert.equal(suchform(null), '');
});

// --- Der Knoten: Regel statt Literal ---------------------------------------

test('Product trägt die Marken-Schreibung als name und die Suchform als alternateName', () => {
  const k = produktSchema(produkt('QiOne® 2 Pro'));
  assert.equal(k.name, 'QiOne® 2 Pro');
  assert.equal(k.alternateName, 'QiOne 2 Pro');
  // Die Regel, nicht das Literal: alternateName IST suchform(name).
  assert.equal(k.alternateName, suchform(k.name));
});

test('die Regel überlebt eine Umbenennung (kein gepflegtes Literal)', () => {
  const k = produktSchema(produkt('Neuname® X'));
  assert.equal(k.alternateName, 'Neuname X');
  assert.equal(k.alternateName, suchform(k.name));
});

test('UNTERDRÜCKUNG: Titel ohne Schutzzeichen bekommt KEIN alternateName', () => {
  // Der Kern des Feldes: eine wortgleiche Wiederholung von `name` wäre kein
  // neutraler Zusatz, sondern eine Aussage ohne Inhalt. Ohne diesen Test
  // könnte die Bedingung wegfallen, ohne dass irgendetwas rot wird.
  const k = produktSchema(produkt('QiBracelet', 'qibracelet'));
  assert.equal(k.name, 'QiBracelet');
  assert.ok(
    !('alternateName' in k),
    `alternateName darf hier gar nicht existieren, ist aber ${JSON.stringify(
      k.alternateName,
    )}`,
  );
});

test('POSITIV-KONTROLLE: derselbe Aufbau MIT Schutzzeichen setzt das Feld', () => {
  // Beweis, dass der Unterdrückungs-Test oben überhaupt etwas misst: an
  // genau demselben Handle und denselben Daten entsteht das Feld, sobald
  // der Titel ein Schutzzeichen trägt. Ein Test, der nicht rot werden kann,
  // belegt nichts.
  const k = produktSchema(produkt('QiBracelet®', 'qibracelet'));
  assert.equal(k.alternateName, 'QiBracelet');
});

// --- Die Klammer zur Organisation (die zweite Hälfte der Naht) --------------

test('brand ist über @id an den Organization-Knoten geklammert', () => {
  const k = produktSchema(produkt('QiOne® 2 Pro'));
  assert.equal(k.brand['@type'], 'Brand');
  assert.equal(k.brand['@id'], ORG_ID);
  // Der Name bleibt, was er war — die @id kommt hinzu, sie ersetzt nichts.
  assert.equal(k.brand.name, ORGANISATION.name);
});

test('der Knoten bleibt serialisierbar (sonst rendert react-router STILL nichts)', () => {
  // react-router kapselt JSON.stringify des script:ld+json-Descriptors in
  // try/catch und gibt bei einem Fehler null zurück — der Block verschwindet
  // dann ohne jede Fehlermeldung.
  const roh = JSON.stringify(produktSchema(produkt('QiOne® 2 Pro')));
  assert.equal(typeof roh, 'string');
  assert.equal(JSON.parse(roh).alternateName, 'QiOne 2 Pro');
});

test('die Nachbarfelder sind vom Nachtrag unberührt geblieben', () => {
  // Der Nachtrag ist additiv. Diese Datei ist über vier fremde PRs gewachsen
  // (offers, MerchantReturnPolicy, OfferShippingDetails, brotkrumeSchema);
  // ein Feld hinzuzufügen darf keines davon verändern.
  const k = produktSchema(produkt('QiOne® 2 Pro'));
  assert.equal(k['@type'], 'Product');
  assert.equal(k.offers.priceCurrency, 'EUR');
  assert.equal(k.offers.hasMerchantReturnPolicy['@type'], 'MerchantReturnPolicy');
  assert.equal(k.offers.shippingDetails['@type'], 'OfferShippingDetails');
  assert.equal(k.sku, 'QO2P-1');
});
