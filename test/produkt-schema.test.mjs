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
import {readFileSync} from 'node:fs';

import {
  produktSchema,
  suchform,
  suchformen,
  STUDIERTE_HANDLES,
} from '../app/lib/produkt-schema.js';
import {übersichtSchema, ueberEntitaeten} from '../app/lib/studien-schema.js';
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
  // NACHGEZOGEN 2026-09-11 (s03): seit `suchformen()` trägt das Feld ALLE
  // real gesuchten Schreibweisen, nicht nur die ohne Schutzzeichen. Die
  // Regel-Assertion bleibt eine Regel — sie vergleicht gegen die Funktion,
  // nicht gegen ein Literal.
  assert.deepEqual(k.alternateName, suchformen(k.name));
  // suchform() bleibt die erste dieser Formen und ist unverändert gültig.
  assert.equal(k.alternateName[0], suchform(k.name));
});

test('die Regel überlebt eine Umbenennung (kein gepflegtes Literal)', () => {
  const k = produktSchema(produkt('Neuname® X'));
  assert.equal(k.alternateName, 'Neuname X');
  assert.equal(k.alternateName, suchform(k.name));
});

test('UNTERDRÜCKUNG: ein Titel ohne ABLEITBARE Form bekommt KEIN alternateName', () => {
  // Der Kern des Feldes: eine wortgleiche Wiederholung von `name` wäre kein
  // neutraler Zusatz, sondern eine Aussage ohne Inhalt. Ohne diesen Test
  // könnte die Bedingung wegfallen, ohne dass irgendetwas rot wird.
  //
  // DIE FIXTURE WURDE 2026-09-11 (s03) GETAUSCHT, UND ZWAR ABSICHTLICH: sie
  // war 'QiBracelet' und stützte sich darauf, dass ohne Schutzzeichen gar
  // keine Form entsteht. Seit `suchformen()` ist das Schutzzeichen nicht mehr
  // die einzige Quelle — aus 'QiBracelet' wird die real gesuchte
  // Getrenntschreibung 'Qi Bracelet' (Search Console: 45 Impressionen,
  // während die zusammengeschriebene Form NULL hat). Die alte Fixture
  // behauptete damit eine Abwesenheit, die nicht mehr der Sollzustand ist.
  // Die ZUSAGE des Tests ist unverändert; nur der Fall, der sie auslöst, ist
  // jetzt einer OHNE jede ableitbare Form.
  const k = produktSchema(produkt('Crystal Cacao Awake', 'crystal-cacao-awake'));
  assert.equal(k.name, 'Crystal Cacao Awake');
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
  const k = produktSchema(produkt('Crystal Cacao Awake®', 'crystal-cacao-awake'));
  assert.equal(k.alternateName, 'Crystal Cacao Awake');
});

test('GEGENPROBE zur getauschten Fixture: QiBracelet bekommt jetzt die Trennform', () => {
  // Belegt, dass der Fixture-Tausch oben KEINE Abschwächung war: derselbe
  // früher leere Fall trägt heute genau die Schreibweise, die real gesucht
  // wird — und der sichtbare Name bleibt die Marken-Schreibung.
  const k = produktSchema(produkt('QiBracelet', 'qibracelet'));
  assert.equal(k.name, 'QiBracelet');
  assert.equal(k.alternateName, 'Qi Bracelet');
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
  assert.deepEqual(JSON.parse(roh).alternateName, ['QiOne 2 Pro', 'Qi One 2 Pro']);
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

// --- Die getrennte Suchform (Segment s03, 2026-09-11) -----------------------
//
// Geprüft wird wieder die REGEL, nicht das Literal: „die Wortfuge
// Kleinbuchstabe/Ziffer vor Großbuchstabe wird aufgetrennt, und eine Form,
// die nichts Neues sagt, entsteht gar nicht erst."

test('suchformen trennt die Wortfuge und liefert beide Schreibweisen', () => {
  assert.deepEqual(suchformen('QiOne® 2 Pro'), ['QiOne 2 Pro', 'Qi One 2 Pro']);
  assert.deepEqual(suchformen('QiBracelet®'), ['QiBracelet', 'Qi Bracelet']);
  assert.deepEqual(suchformen('QiHome® Air'), ['QiHome Air', 'Qi Home Air']);
});

test('suchformen erzeugt KEINE Form ohne Wortfuge und keine Dublette', () => {
  assert.deepEqual(suchformen('Crystal Cacao Awake'), []);
  assert.deepEqual(suchformen('Zeremonie Kakao'), []);
  for (const titel of ['QiOne® 2 Pro', 'QiBracelet®', 'Crystal Cacao Awake']) {
    assert.ok(!suchformen(titel).includes(titel));
  }
});

test('alternateName trägt beide Suchformen, sobald es zwei gibt', () => {
  const k = produktSchema(produkt('QiOne® 2 Pro'));
  assert.deepEqual(k.alternateName, ['QiOne 2 Pro', 'Qi One 2 Pro']);
  // Genau die Schreibweise, die laut Search Console real gesucht wird und im
  // ausgelieferten HTML vorher NULL mal vorkam.
  assert.ok(k.alternateName.includes('Qi One 2 Pro'));
});

test('alternateName bleibt ein String, wenn es nur EINE Suchform gibt', () => {
  const k = produktSchema(produkt('Crystal Cacao Awake®', 'crystal-cacao-awake'));
  assert.equal(k.alternateName, 'Crystal Cacao Awake');
});

// --- Die NAHT Kaufseite <-> Studienseite ------------------------------------
//
// Zwei Seiten, die JEDE FÜR SICH gültiges JSON-LD erzeugen, können trotzdem
// aneinander vorbeizeigen — dann verweist jede auf eine `@id`, die es auf der
// Gegenseite nicht gibt, und beide Modul-Tests bleiben grün. Geprüft wird
// deshalb die GRENZE: dass die beiden `@id`-Werte einander wirklich treffen.
//
// Die Produktliste wird als Fixture übergeben, weil die echte Registry
// (app/data/studien/index.js) ihre JSONs per `import ... from './e0001.json'`
// lädt — eine Form, die `node --test` ohne Import-Attribut ablehnt.

const PRODUKTE_FIXTURE = [
  {name: 'QiOne® 2 Pro', pfad: '/products/qione-2-pro'},
  {name: 'QiBracelet®', pfad: '/products/qibracelet'},
];

function sammlung(graph) {
  return graph['@graph'].find((n) => n['@type'] === 'CollectionPage');
}

test('about der Übersicht ist eine @id-Referenz, kein freier Text mehr', () => {
  const s = sammlung(übersichtSchema([], PRODUKTE_FIXTURE));
  assert.ok(Array.isArray(s.about), 'about muss eine Liste sein');
  const refs = s.about.filter((x) => typeof x === 'object');
  assert.equal(refs.length, 2);
  assert.equal(refs[0]['@id'], 'https://qiblanco.com/products/qione-2-pro#product');
  // Das Sachthema bleibt daneben stehen — die Referenz ERSETZT es nicht.
  assert.ok(s.about.some((x) => typeof x === 'string'));
});

test('jedes untersuchte Produkt erscheint GENAU EINMAL', () => {
  const doppelt = [...PRODUKTE_FIXTURE, PRODUKTE_FIXTURE[0]];
  const ids = ueberEntitaeten(doppelt, []).map((x) => x['@id']);
  assert.equal(ids.length, new Set(ids).size, `Dublette in ${JSON.stringify(ids)}`);
  assert.equal(ids.length, 2);
});

test('ohne Produktangabe entsteht KEINE geratene Referenz', () => {
  // Eine `@id` auf eine Seite, die es nicht gibt, ist schlimmer als keine.
  const s = sammlung(übersichtSchema([]));
  assert.equal(s.about.filter((x) => typeof x === 'object').length, 0);
  assert.equal(ueberEntitaeten([{name: 'Ohne Pfad'}], []).length, 0);
});

test('ein Produkt MIT Studien trägt subjectOf auf die Sammlung', () => {
  assert.deepEqual(produktSchema(produkt('QiOne® 2 Pro', 'qione-2-pro')).subjectOf, {
    '@id': 'https://qiblanco.com/pages/studien#sammlung',
  });
});

test('NEGATIV-KONTROLLE: ein Produkt OHNE Studien trägt kein subjectOf', () => {
  // Ohne diesen Arm wäre die Bedingung wirkungslos und niemand würde es
  // merken — jede Kakao-Sorte behauptete dann eine Studie, die es nicht gibt.
  const k = produktSchema(produkt('Crystal Cacao Awake®', 'crystal-cacao-awake'));
  assert.ok(!('subjectOf' in k));
});

test('NAHT: die @id der einen Richtung ist der Knoten der anderen', () => {
  const s = sammlung(übersichtSchema([], PRODUKTE_FIXTURE));
  const vonStudien = s.about.filter((x) => typeof x === 'object').map((x) => x['@id']);
  const produktKnoten = produktSchema(produkt('QiOne® 2 Pro', 'qione-2-pro'));

  // Die Studienseite zeigt auf GENAU den Knoten, den die Kaufseite ausgibt.
  assert.ok(
    vonStudien.includes(produktKnoten['@id']),
    `${produktKnoten['@id']} fehlt in ${JSON.stringify(vonStudien)}`,
  );
  // Und die Gegenrichtung zeigt auf GENAU die Sammlung, die die Studienseite
  // ausgibt.
  assert.equal(produktKnoten.subjectOf['@id'], s['@id']);
});

test('DURCHSETZER: die Handle-Liste deckt sich mit der Studien-Registry', () => {
  // STUDIERTE_HANDLES ist bewusst eine zweite Stelle (die Registry zieht
  // 169 KB JSON in jedes Bundle, das sie importiert). Damit aus „bewusst
  // zwei Stellen" kein „die falsche gewinnt still" wird, liest dieser Test
  // die echte Registry als TEXT — der Import scheitert an den JSON-Dateien,
  // die Tabelle selbst ist aber reines JS und eindeutig auslesbar.
  const quelle = readFileSync(
    new URL('../app/data/studien/index.js', import.meta.url),
    'utf8',
  );
  const ausRegistry = [...quelle.matchAll(/pfad:\s*'\/products\/([a-z0-9-]+)'/g)]
    .map((m) => m[1])
    .sort();
  assert.ok(ausRegistry.length >= 3, `Registry unerwartet leer: ${ausRegistry}`);
  assert.deepEqual([...STUDIERTE_HANDLES].sort(), ausRegistry);
});
