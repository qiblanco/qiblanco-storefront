/**
 * Hermetischer Test des Artikel-JSON-LD (node --test, ohne Bundler).
 *
 * DER EIGENTLICHE BEFUND, gegen den hier gewacht wird (2026-09-09): die acht
 * Fachartikel unter /blogs/wissen/ trugen NULL ld+json. Die Tests unten
 * prüfen deshalb nicht "irgendein Objekt entsteht", sondern genau die zwei
 * Angaben, wegen derer der Block gebaut wurde -- @type und datePublished --
 * und dazu die Faelle, in denen bewusst NICHTS entstehen soll.
 *
 * ZUR NEGATIV-SEITE: ein Test, der nur den Erfolgsfall kennt, kann nicht
 * zeigen, dass die Fabrik bei fehlenden Pflichtangaben schweigt statt einen
 * leeren Block zu bauen. Genau das ist hier die teurere Hälfte.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {artikelSchema} from '../app/lib/blog-schema.js';

/** Artikel-Knoten in der Form, die ARTICLE_QUERY liefert. */
const ARTIKEL = {
  handle: 'zellulaere-hydration-biophysik',
  title: 'Zelluläre Hydration: was die Biophysik misst',
  publishedAt: '2026-08-31T06:00:00Z',
  author: {name: 'Qi Blanco Redaktion'},
  excerpt: 'Wie Wasser in der Zelle gebunden wird — und was daran messbar ist.',
  seo: {description: '', title: 'Zelluläre Hydration'},
  image: {
    url: 'https://cdn.shopify.com/s/files/1/x/hydration.jpg',
    width: 1200,
    height: 630,
    altText: 'Mikroskopaufnahme',
  },
};

const PFAD = '/blogs/wissen/zellulaere-hydration-biophysik';

function beitrag(schema) {
  return schema['@graph'][0];
}

test('der Block trägt @type BlogPosting UND datePublished — der Befund selbst', () => {
  const s = artikelSchema({pfad: PFAD, artikel: ARTIKEL});
  assert.equal(s['@context'], 'https://schema.org');
  const b = beitrag(s);
  assert.equal(b['@type'], 'BlogPosting');
  assert.equal(b.datePublished, '2026-08-31T06:00:00Z');
  // Der Block muss durch JSON gehen: die Route serialisiert ihn, und ein
  // nicht serialisierbarer Wert (undefined, Zyklus) faellt sonst erst live auf.
  assert.deepEqual(JSON.parse(JSON.stringify(s)), s);
});

test('URL, @id und mainEntityOfPage sind absolut und zeigen auf dieselbe Seite', () => {
  const b = beitrag(artikelSchema({pfad: PFAD, artikel: ARTIKEL}));
  assert.equal(b.url, `https://qiblanco.com${PFAD}`);
  assert.equal(b['@id'], `https://qiblanco.com${PFAD}#artikel`);
  assert.equal(b.mainEntityOfPage['@id'], b.url);
});

test('headline ist die sichtbare <h1>, nicht der seo.title', () => {
  const b = beitrag(artikelSchema({pfad: PFAD, artikel: ARTIKEL}));
  // ARTIKEL.seo.title ist bewusst KUERZER als der Titel: weichen beide ab,
  // muss headline dem folgen, was die Seite als Überschrift rendert.
  assert.equal(b.headline, ARTIKEL.title);
  assert.notEqual(b.headline, ARTIKEL.seo.title);
});

test('description folgt derselben Rangfolge wie blogMeta: seo.description schlaegt excerpt', () => {
  const leer = beitrag(artikelSchema({pfad: PFAD, artikel: ARTIKEL}));
  assert.equal(leer.description, ARTIKEL.excerpt, 'leeres seo.description -> excerpt');

  const gepflegt = beitrag(
    artikelSchema({
      pfad: PFAD,
      artikel: {...ARTIKEL, seo: {description: '  Gepflegter Text.  '}},
    }),
  );
  assert.equal(gepflegt.description, 'Gepflegter Text.', 'getrimmt und bevorzugt');
});

test('OHNE Pflichtangabe entsteht KEIN Block statt eines leeren', () => {
  assert.equal(artikelSchema({pfad: PFAD, artikel: null}), null);
  assert.equal(
    artikelSchema({pfad: PFAD, artikel: {...ARTIKEL, title: ''}}),
    null,
    'ohne Titel kein BlogPosting',
  );
  assert.equal(
    artikelSchema({pfad: PFAD, artikel: {...ARTIKEL, publishedAt: null}}),
    null,
    'ohne Datum kein BlogPosting — das Datum IST der Befund',
  );
});

test('nichts wird erfunden: fehlender Autor/Bild fehlen im Objekt, statt geraten zu werden', () => {
  const b = beitrag(
    artikelSchema({
      pfad: PFAD,
      artikel: {...ARTIKEL, author: null, image: null, excerpt: '', seo: {}},
    }),
  );
  assert.ok(!('author' in b), 'kein erfundener Autor');
  assert.ok(!('image' in b), 'kein erfundenes Bild');
  assert.ok(!('description' in b), 'keine erfundene Beschreibung');
  assert.ok(!('dateModified' in b), 'kein aus publishedAt abgeleitetes dateModified');
  // Das Pflicht-Geruest steht trotzdem.
  assert.equal(b['@type'], 'BlogPosting');
  assert.equal(b.datePublished, ARTIKEL.publishedAt);
});

test('Bildmasse werden uebernommen, aber nur wenn die API sie liefert', () => {
  const voll = beitrag(artikelSchema({pfad: PFAD, artikel: ARTIKEL}));
  assert.equal(voll.image.width, 1200);
  assert.equal(voll.image.caption, 'Mikroskopaufnahme');

  const ohneMasse = beitrag(
    artikelSchema({
      pfad: PFAD,
      artikel: {...ARTIKEL, image: {url: 'https://cdn.shopify.com/a.jpg'}},
    }),
  );
  assert.equal(ohneMasse.image.url, 'https://cdn.shopify.com/a.jpg');
  assert.ok(!('width' in ohneMasse.image), 'keine erfundene Breite');
});

test('publisher zeigt auf DIE Organisation aus entity-schema.js, nicht auf eine zweite', () => {
  const b = beitrag(artikelSchema({pfad: PFAD, artikel: ARTIKEL}));
  assert.equal(b.publisher['@id'], 'https://qiblanco.com/#organization');
});

test('KEIN ScholarlyArticle: der Typ gehört den peer-reviewten Arbeiten', () => {
  // Ein Wissensbeitrag, der Forschung erklärt, ist keine Publikation. Waechst
  // hier je ein ScholarlyArticle herein, ist das eine Aussage über die
  // Evidenzstufe, die der Text nicht trägt.
  const quelle = readFileSync(
    new URL('../app/lib/blog-schema.js', import.meta.url),
    'utf8',
  );
  const typZeilen = quelle
    .split('\n')
    .filter((z) => z.includes("'@type'") && !z.trimStart().startsWith('*'));
  assert.ok(
    !typZeilen.some((z) => z.includes('ScholarlyArticle')),
    'ScholarlyArticle als gesetzter @type in blog-schema.js',
  );
});

test('die Route zieht die Fabrik wirklich — ein Modul ohne Aufrufer ist wirkungslos', () => {
  // Regel "Ein Regelwerk ohne Aufrufer ist wirkungslos": die Fabrik kann
  // fehlerfrei sein und trotzdem nie im <head> landen. Geprueft wird deshalb
  // die Naht in der Route, nicht nur das Modul.
  const route = readFileSync(
    new URL('../app/routes/blogs.$blogHandle.$articleHandle.jsx', import.meta.url),
    'utf8',
  );
  assert.match(route, /import\s*\{\s*artikelSchema\s*\}\s*from\s*'~\/lib\/blog-schema'/);
  assert.match(route, /'script:ld\+json'/, 'Descriptor-Weg fehlt');
  assert.match(route, /artikelSchema\(\{/, 'Fabrik wird nicht aufgerufen');
});
