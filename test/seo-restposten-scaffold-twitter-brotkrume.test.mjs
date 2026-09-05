/**
 * Hermetischer Test der drei SEO-Restposten aus den geschlossenen PRs
 * #100 (GEO FJ1, schema.org-Grundausstattung) und #103 (technische
 * SEO-/Entity-Hygiene) — node --test, ohne Bundler.
 *
 * WARUM ES DIESEN TEST GIBT: die beiden PRs wurden am 2026-09-05 geschlossen,
 * weil ihre Substanz auf anderem Weg live ging. Drei Zusagen gingen dabei NICHT
 * mit, und alle drei waren am 2026-09-05 live am äußeren Rand messbar:
 *   R1  /pages/superhuman trug `Hydrogen | Superhuman` — den unveränderten
 *       Gerüst-Titel — und war zugleich in sitemap/pages/1.xml gelistet und
 *       ohne noindex, wurde also aktiv zur Indexierung angeboten.
 *   R2  `twitter:card` gab es auf der gesamten Storefront nur in der
 *       Studien-Familie (5 Routen).
 *   R3  `BreadcrumbList` ebenfalls nur dort — auf den Produktseiten, für die
 *       PR #100 sie zusagte, nirgends.
 *
 * GEPRÜFT WIRD DIE KARDINALITÄT, NICHT DIE ANWESENHEIT. Bereichs-Falle
 * seo-manager (2026-08-15): eine Anwesenheitsprüfung auf geteilter Fläche wurde
 * vom Tag eines Parallel-Jobs grün, bevor der eigene Deploy draußen war — und
 * die dabei live ausgelieferte DOPPELUNG (zwei og:image aus #197/#198, git
 * mergte beide additiven Diffs konfliktfrei) sah kein Gate. `==1` fängt beide
 * Richtungen, `>=1` keine davon.
 *
 * DER SCAFFOLD-ARM PRÜFT DIE KLASSE, NICHT DIE ZWEI BEKANNTEN DATEIEN: ein
 * Zaun aus Literalen erreicht die nächste Kopie nicht, und `h2 generate routes`
 * schreibt diesen Titel bei jeder neuen Route erneut hin.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync} from 'node:fs';
import {produktMeta} from '../app/lib/produkt-seo.js';
import {
  OHNE_PREIS_NACHWEIS,
  brotkrumeSchema,
  produktSchema,
} from '../app/lib/produkt-schema.js';
import {CANONICAL_ORIGIN} from '../app/lib/seo.js';

const ROUTEN_ORDNER = new URL('../app/routes/', import.meta.url);

/**
 * Ein Produkt-Stub in der Form, in der die Routen ihn aus dem Loader
 * bekommen. Bewusst minimal: brotkrumeSchema() darf NICHTS ausser handle und
 * title brauchen, sonst fällt sie auf genau den Seiten aus, deren Daten
 * unvollständig sind — und das sind die, die den Restposten ausmachen.
 */
const PRODUKT = {
  handle: 'qione-2-pro',
  title: 'QiOne® 2 Pro',
  selectedOrFirstAvailableVariant: {
    price: {amount: '913.45', currencyCode: 'EUR'},
  },
  images: {nodes: [{url: 'https://cdn.example/bild.png'}]},
};

// --- R1: der Gerüst-Titel ---------------------------------------------------

test('keine Route trägt mehr den Hydrogen-Gerüst-Titel', () => {
  // Das Muster ist die INTERPOLIERTE Form aus dem Scaffold — `Hydrogen | ${...}`
  // im title-Descriptor. Ein blosses Vorkommen des Wortes „Hydrogen" ist KEIN
  // Befund: es steht zu Recht in Dutzenden erklärenden Kommentaren („Stand
  // vorher: Hydrogen | Cart"), und ein Zaun, der die Erklärung des behobenen
  // Fehlers bestraft, erzieht zum Löschen der Erklärung.
  const muster = /\{\s*title:\s*`Hydrogen \|/;
  const treffer = [];
  for (const datei of readdirSync(ROUTEN_ORDNER)) {
    if (!datei.endsWith('.jsx') && !datei.endsWith('.tsx')) continue;
    const text = readFileSync(new URL(datei, ROUTEN_ORDNER), 'utf8');
    if (muster.test(text)) treffer.push(datei);
  }
  assert.deepEqual(
    treffer,
    [],
    `Gerüst-Titel in: ${treffer.join(', ')} — erwartet ist die Hauskonvention ` +
      '`<Seite> | Qi Blanco` (so schreiben es collections.all, cart, ' +
      'policies.$handle, collections.$handle und pages.$handle bereits).',
  );
});

test('die Positivkontrolle des Scaffold-Musters trifft wirklich', () => {
  // Ohne diesen Arm wäre der Test oben von einem kaputten Suchmuster nicht zu
  // unterscheiden: 0 Treffer hiesse dann Messausfall statt Befundfreiheit.
  const muster = /\{\s*title:\s*`Hydrogen \|/;
  assert.ok(
    muster.test("  return [\n    {title: `Hydrogen | ${data?.page.title ?? ''}`},"),
    'Suchmuster trifft die Original-Scaffold-Zeile nicht mehr — der Test oben ' +
      'misst dann nichts.',
  );
  assert.ok(
    !muster.test('// Stand vorher: `Hydrogen | Cart` — der Vorgabewert'),
    'Suchmuster trifft einen erklärenden Kommentar — es würde behobene Stellen ' +
      'anklagen.',
  );
});

// --- R3: die Brotkrume ------------------------------------------------------

test('brotkrumeSchema liefert genau drei Stufen mit absoluten item-URLs', () => {
  const k = brotkrumeSchema(PRODUKT);
  assert.equal(k['@type'], 'BreadcrumbList');
  assert.equal(k.itemListElement.length, 3);
  assert.deepEqual(
    k.itemListElement.map((s) => s.position),
    [1, 2, 3],
  );
  for (const stufe of k.itemListElement) {
    assert.ok(
      stufe.item.startsWith(CANONICAL_ORIGIN),
      `item ist nicht absolut: ${stufe.item} — Google prüft diese URLs, eine ` +
        'relative Angabe ist auf einem Preview-Host die falsche Seite.',
    );
    assert.ok(stufe.name, 'Stufe ohne name');
  }
  assert.equal(
    k.itemListElement[2].item,
    `${CANONICAL_ORIGIN}/products/${PRODUKT.handle}`,
    'die letzte Stufe muss auf die Seite selbst zeigen',
  );
});

test('brotkrumeSchema entsteht AUCH ohne Preisnachweis — Product-Schema nicht', () => {
  // DIE TRAGENDE NAHT dieses Baus, und die einzige Stelle, an der die beiden
  // Fabriken bewusst verschieden urteilen: die fünf Handles in
  // OHNE_PREIS_NACHWEIS tragen absichtlich kein Product-JSON-LD (ein
  // unvollständiger Product-Knoten ist schlechter als keiner). Eine Brotkrume
  // sagt über den Preis nichts aus und kann deshalb auch nicht falsch werden.
  // Alle fünf stehen in sitemap/products/1.xml, sind also genau die
  // „indexierbaren Produktseiten", die PR #100 nennt.
  assert.ok(OHNE_PREIS_NACHWEIS.length > 0, 'Liste ist leer — Test misst nichts');
  for (const handle of OHNE_PREIS_NACHWEIS) {
    const p = {...PRODUKT, handle, title: `Titel ${handle}`};
    assert.equal(
      produktSchema(p),
      null,
      `${handle}: Product-Schema entstanden, obwohl kein Preisnachweis vorliegt`,
    );
    const k = brotkrumeSchema(p);
    assert.ok(k, `${handle}: keine Brotkrume — genau das ist der Restposten`);
    assert.equal(k['@type'], 'BreadcrumbList');
  }
});

test('brotkrumeSchema gibt null ohne handle oder title', () => {
  assert.equal(brotkrumeSchema(undefined), null);
  assert.equal(brotkrumeSchema({}), null);
  assert.equal(brotkrumeSchema({handle: 'x'}), null);
  assert.equal(brotkrumeSchema({title: 'x'}), null);
});

// --- R2 + R3 an der Naht: was produktMeta() wirklich ausliefert --------------

/** Alle ld+json-Knoten einer Descriptor-Liste. */
function ldKnoten(descriptoren) {
  return descriptoren
    .filter((d) => d && d['script:ld+json'])
    .map((d) => d['script:ld+json']);
}

/** Wie oft trägt die Liste ein meta mit diesem name? */
function zaehleName(descriptoren, name) {
  return descriptoren.filter((d) => d && d.name === name).length;
}

test('produktMeta liefert genau EIN twitter:card und genau EINE BreadcrumbList', () => {
  const m = produktMeta({
    pfad: '/products/qione-2-pro',
    titel: 'QiOne® 2 Pro | Qi Blanco',
    bildUrl: 'https://cdn.example/bild.png',
    produkt: PRODUKT,
  });
  assert.equal(
    zaehleName(m, 'twitter:card'),
    1,
    'nicht genau ein twitter:card — 0 ist der Ausgangsbefund, 2 die Regression',
  );
  const krumen = ldKnoten(m).filter((k) => k['@type'] === 'BreadcrumbList');
  assert.equal(
    krumen.length,
    1,
    'nicht genau eine BreadcrumbList — zwei Emitter existieren (produktMeta ' +
      'und products.$handle.jsx), Duplikate sind hier die wahrscheinlichere ' +
      'Regression',
  );
  // Der Product-Knoten darf dabei nicht verlorengegangen sein.
  assert.equal(
    ldKnoten(m).filter((k) => k['@type'] === 'Product').length,
    1,
    'Product-Knoten verschwunden — die Brotkrume darf ihn nicht verdrängen',
  );
  assert.notEqual(
    krumen[0]['@id'],
    ldKnoten(m).find((k) => k['@type'] === 'Product')['@id'],
    'beide Knoten tragen dieselbe @id und überschreiben sich',
  );
});

test('produktMeta setzt KEIN twitter:card ohne og:image', () => {
  // Die Deckungsbedingung: `summary_large_image` sagt ein grosses Bild zu.
  // Ohne og:image wäre das eine Zusage ohne Träger, und die Karte fällt beim
  // Teilen auf einen nackten Link zurück.
  const m = produktMeta({
    pfad: '/products/qione-2-pro',
    titel: 'QiOne® 2 Pro | Qi Blanco',
    produkt: PRODUKT,
  });
  assert.equal(m.filter((d) => d.property === 'og:image').length, 0);
  assert.equal(zaehleName(m, 'twitter:card'), 0);
  // Die Brotkrume hängt NICHT am Bild und muss trotzdem da sein.
  assert.equal(
    ldKnoten(m).filter((k) => k['@type'] === 'BreadcrumbList').length,
    1,
  );
});

test('produktMeta ohne produkt liefert keine Brotkrume und kein Product', () => {
  const m = produktMeta({
    pfad: '/products/qione-2-pro',
    titel: 'QiOne® 2 Pro | Qi Blanco',
    bildUrl: 'https://cdn.example/bild.png',
  });
  assert.equal(ldKnoten(m).length, 0);
  assert.equal(zaehleName(m, 'twitter:card'), 1);
});

test('kein site-weiter Twitter-Emitter in app/root.jsx', () => {
  // Die Korrektur an PR #103: der entwarf site-weite Default-OG/Twitter-Tags in
  // root.jsx. Der Bestand setzt OG PRO ROUTE (#187/#189) — ein zweiter,
  // site-weiter Emitter daneben erzeugt genau die Duplikate, vor denen der
  // Kommentarblock in products.$handle.jsx warnt. Dieser Arm hält die
  // Entscheidung fest, statt sie nur in einen Kommentar zu schreiben.
  const root = readFileSync(new URL('../app/root.jsx', import.meta.url), 'utf8');
  assert.ok(
    !/['"]twitter:/.test(root),
    'app/root.jsx emittiert twitter-Tags — zusammen mit den Route-Emittern ' +
      'liefert dann jede Produktseite die Karte doppelt aus.',
  );
});
