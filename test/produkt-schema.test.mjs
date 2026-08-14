/**
 * Hermetischer Test des Product-/Breadcrumb-JSON-LD (node --test) — SEO S6.
 *
 * Prüft ABSICHTLICH nicht "das Feld ist gesetzt", sondern die Eigenschaften,
 * deren Verletzung real Schaden macht:
 *
 *  - Die SUCHFORM entsteht. Kundensichtbar schreiben wir "QiOne(R) 2 Pro",
 *    gesucht wird "QiOne 2 Pro". Fällt alternateName weg, ist der ganze
 *    Kern dieser Stufe weg — und zwar unsichtbar, weil die Seite weiter
 *    perfekt aussieht.
 *  - KEIN erfundener Preis. Fehlt der Preis in den Loader-Daten, darf kein
 *    Angebot entstehen. Eine Preiszahl aus dem Repo waere eine zweite
 *    Preisquelle neben Shopify.
 *  - KEIN aggregateRating. Unsere 4,8/438 sind UNTERNEHMENS-Bewertungen; sie
 *    als Produktbewertung auszugeben ist eine Falschaussage ueber den
 *    Bewertungsgegenstand.
 *  - Die Entitaets-Klammer haelt: brand und seller zeigen auf denselben
 *    Organization-Knoten, den die Startseite ausgibt. Ohne sie sind es zwei
 *    unverbundene Aussagen.
 *  - Rein additiv: eine Route, die kein `produkt` uebergibt, bekommt exakt
 *    die Descriptor-Liste von vorher.
 *  - Jede Produktroute ist wirklich verdrahtet — eine vergessene Route war
 *    genau der Ausgangsbefund der Vorgaengerstufe.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {
  produktGraph,
  suchform,
  verfuegbarkeit,
  angebot,
  breadcrumb,
} from '../app/lib/produkt-schema.js';
import {produktMeta} from '../app/lib/produkt-seo.js';

const PFAD = '/products/qione-2-pro';
// Nachbau der ECHTEN Loader-Form (app/lib/qioneProductQuery.js), nicht einer
// ausgedachten: title/vendor am Produkt, price/sku/availableForSale/image an
// der Variante.
const PRODUKT = {
  id: 'gid://shopify/Product/1',
  title: 'QiOne® 2 Pro',
  vendor: 'Qi Blanco',
  handle: 'qione-2-pro',
  selectedOrFirstAvailableVariant: {
    availableForSale: true,
    sku: 'QO2P-1',
    price: {amount: '1290.0', currencyCode: 'EUR'},
    image: {url: 'https://cdn.shopify.com/x.webp'},
  },
};

const knoten = (g, typ) => g['@graph'].find((k) => k['@type'] === typ);

test('die Suchform ohne Schutzzeichen entsteht — der Kern der Stufe', () => {
  assert.equal(suchform('QiOne® 2 Pro'), 'QiOne 2 Pro');
  assert.equal(suchform('QiHome® Air'), 'QiHome Air');
  assert.equal(suchform('QiBracelet®'), 'QiBracelet');
  // Auch ohne Leerzeichen vor dem Zeichen darf kein Wort verkleben.
  assert.equal(suchform('QiOne®2 Pro'), 'QiOne 2 Pro');

  const p = knoten(produktGraph({pfad: PFAD, produkt: PRODUKT}), 'Product');
  assert.equal(p.name, 'QiOne® 2 Pro', 'name traegt die Marken-Schreibung');
  assert.equal(p.alternateName, 'QiOne 2 Pro', 'alternateName traegt die Suchform');
});

test('alternateName entfaellt, wenn es nur eine Wiederholung waere', () => {
  const g = produktGraph({
    pfad: PFAD,
    produkt: {...PRODUKT, title: 'Zeremonie Kakao'},
  });
  assert.equal(knoten(g, 'Product').alternateName, undefined);
});

test('kein erfundener Preis — ohne Preisdaten kein Angebot', () => {
  assert.equal(angebot(undefined, true, 'https://x'), undefined);
  assert.equal(angebot({amount: '10.0'}, true, 'https://x'), undefined, 'ohne Waehrung');
  assert.equal(angebot({currencyCode: 'EUR'}, true, 'https://x'), undefined, 'ohne Betrag');

  const ohne = produktGraph({
    pfad: PFAD,
    produkt: {...PRODUKT, selectedOrFirstAvailableVariant: {sku: 'X'}},
  });
  assert.equal(knoten(ohne, 'Product').offers, undefined);

  const mit = knoten(produktGraph({pfad: PFAD, produkt: PRODUKT}), 'Product');
  assert.equal(mit.offers.price, '1290.0');
  assert.equal(mit.offers.priceCurrency, 'EUR');
  assert.equal(mit.offers.availability, 'https://schema.org/InStock');
});

test('unbekannte Verfuegbarkeit ist nicht "nicht verfuegbar"', () => {
  assert.equal(verfuegbarkeit(true), 'https://schema.org/InStock');
  assert.equal(verfuegbarkeit(false), 'https://schema.org/OutOfStock');
  assert.equal(verfuegbarkeit(undefined), undefined, 'kein Ratespiel');
});

test('kein aggregateRating — unsere Sterne bewerten die Firma, nicht das Produkt', () => {
  const roh = JSON.stringify(produktGraph({pfad: PFAD, produkt: PRODUKT}));
  assert.ok(!roh.includes('aggregateRating'), 'aggregateRating darf nicht entstehen');
  assert.ok(!roh.includes('4.8') && !roh.includes('438'), 'keine Firmen-Sterne im Produkt');
});

test('die Entitaets-Klammer haelt: brand und seller zeigen auf die Organisation', () => {
  const p = knoten(produktGraph({pfad: PFAD, produkt: PRODUKT}), 'Product');
  const ORG = 'https://qiblanco.com/#organization';
  assert.equal(p.brand['@id'], ORG);
  assert.equal(p.offers.seller['@id'], ORG);
  assert.equal(p['@id'], 'https://qiblanco.com/products/qione-2-pro#product');
  assert.equal(p.url, 'https://qiblanco.com/products/qione-2-pro');
});

test('Breadcrumb hat genau die zwei Stufen, die es wirklich gibt', () => {
  const b = breadcrumb({pfad: PFAD, name: 'QiOne® 2 Pro'});
  assert.equal(b.itemListElement.length, 2, 'keine erfundene Kategorie-Ebene');
  assert.equal(b.itemListElement[0].item, 'https://qiblanco.com/');
  assert.equal(b.itemListElement[1].item, 'https://qiblanco.com/products/qione-2-pro');
  assert.deepEqual(
    b.itemListElement.map((e) => e.position),
    [1, 2],
  );
});

test('ohne Loader-Daten entsteht kein leerer Knoten', () => {
  assert.equal(produktGraph({pfad: PFAD, produkt: undefined}), undefined);
  assert.equal(produktGraph({pfad: PFAD, produkt: {}}), undefined);
});

test('rein additiv: ohne `produkt` ist die Descriptor-Liste unveraendert', () => {
  const ohne = produktMeta({pfad: PFAD, titel: 'T'});
  const mit = produktMeta({pfad: PFAD, titel: 'T', produkt: PRODUKT});
  assert.equal(
    JSON.stringify(ohne),
    JSON.stringify(mit.filter((d) => !('script:ld+json' in d))),
    'die bestehenden Descriptoren duerfen sich nicht veraendern',
  );
  const ld = mit.find((d) => 'script:ld+json' in d);
  assert.ok(ld, 'mit `produkt` muss ein JSON-LD-Descriptor entstehen');
  assert.equal(ld['script:ld+json']['@context'], 'https://schema.org');
});

test('die Beschreibung kommt aus der gepflegten Quelle, nicht neu erfunden', () => {
  const p = knoten(produktGraph({pfad: PFAD, produkt: PRODUKT,
    beschreibung: 'gereicht'}), 'Product');
  assert.equal(p.description, 'gereicht');
  // Ohne gereichte Beschreibung KEIN description-Feld: produkt-schema.js darf
  // sich keine eigene ausdenken (Claim-Korridor).
  const ohne = knoten(produktGraph({pfad: PFAD, produkt: PRODUKT}), 'Product');
  assert.equal(ohne.description, undefined);
});

test('jede dedizierte Produktroute ist wirklich verdrahtet', () => {
  const dir = new URL('../app/routes/', import.meta.url);
  const routen = readdirSync(dir).filter(
    (f) => /^products\.[a-z0-9-]+\.jsx$/.test(f) && !f.includes('$'),
  );
  assert.ok(routen.length >= 6, `zu wenige Produktrouten gefunden: ${routen.length}`);
  for (const r of routen) {
    const src = readFileSync(new URL(r, dir), 'utf8');
    if (!src.includes('produktMeta(')) continue; // Route ohne produktMeta
    assert.match(
      src,
      /produkt:\s*data\?\.product/,
      `${r} ruft produktMeta ohne \`produkt\` — keine Product-Auszeichnung`,
    );
  }
});
