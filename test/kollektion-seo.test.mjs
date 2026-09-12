/**
 * Hermetischer Test der /collections- und Blog-Index-Signale (node --test,
 * ohne Bundler).
 *
 * Er prüft ABSICHTLICH nicht "die Funktion existiert", sondern die
 * Eigenschaften, deren Verletzung real Schaden macht — jede davon eine
 * Fehlerklasse, die in diesem Repo oder in diesem Bau schon eingetreten ist:
 *
 *  - DIE ENTITÄTS-ANKER STIMMEN ÜBER ALLE VIER QUELLEN ÜBEREIN. ORG_ID,
 *    SITE_ID und MARKE stehen in entity-schema.js, seiten-seo.js,
 *    kollektion-seo.js und blog-seo.js NEBENEINANDER statt importiert — jede
 *    dieser Dateien begründet das mit der Import-Closure von Gate 12. DIESER
 *    TEST IST DER RIEGEL GEGEN DIE DRIFT, DIE DADURCH MÖGLICH WIRD; ohne ihn
 *    wäre die Begründung in vier Dateiköpfen eine Zusage ohne Träger.
 *  - KEIN DOPPELTES TAG in einer meta-Liste. Auf der Startseite standen live
 *    zwei og:image (PR #197/#198, konfliktfrei gemergt) — ein Duplikat sieht
 *    im Diff nach nichts aus.
 *  - twitter:card NUR MIT og:image: `summary_large_image` ohne Bild ist eine
 *    Zusage ohne Deckung.
 *  - KEINE ZWEI JSON-LD-KNOTEN MIT DERSELBEN @id in einem Dokument.
 *  - DIE ItemList NENNT NUR, WAS SIE ZEIGT, und auf einer Cursor-Folgeseite
 *    entsteht KEINE — eine Liste mit `position: 1..n` unter der kanonischen
 *    URL wäre dort schlicht falsch.
 *  - MASSE WERDEN NIE GERATEN: ein Bild ohne width/height wird verworfen, statt
 *    eine Grösse zu erfinden (der Dateiname lügt über die Masse, am 2026-09-12
 *    belegt).
 *  - JEDE KOLLEKTIONS-ROUTE RUFT DIE HILFE AUCH AUF. Eine vergessene Route ist
 *    der Ausgangsbefund dieses Baus: 11 von 11 Kollektions-URLs trugen kein
 *    einziges Signal, weil es die Stelle nicht gab, an der es entsteht.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  MARKE,
  MARKEN_TEILBILD,
  ORG_ID,
  SITE_ID,
  bildAus,
  brotkrume,
  kollektionSignale,
  teilbild,
} from '../app/lib/kollektion-seo.js';
import * as seiten from '../app/lib/seiten-seo.js';
import * as entitaet from '../app/lib/entity-schema.js';
import {
  MARKEN_TEILBILD_URL,
  ORG_ID as BLOG_ORG_ID,
  SITE_ID as BLOG_SITE_ID,
  blogIndexSignale,
  blogUebersichtSignale,
} from '../app/lib/blog-seo.js';

const ld = (liste) =>
  liste.filter((d) => d['script:ld+json']).map((d) => d['script:ld+json']);
const typen = (liste) => ld(liste).map((k) => k['@type']);
const finde = (liste, typ) => ld(liste).find((k) => k['@type'] === typ);

test('Entitaets-Anker stimmen über alle vier Quellen überein', () => {
  for (const [wo, org, site] of [
    ['seiten-seo', seiten.ORG_ID, seiten.SITE_ID],
    ['entity-schema', entitaet.ORG_ID, entitaet.SITE_ID],
    ['blog-seo', BLOG_ORG_ID, BLOG_SITE_ID],
  ]) {
    assert.equal(ORG_ID, org, `ORG_ID weicht von ${wo} ab`);
    assert.equal(SITE_ID, site, `SITE_ID weicht von ${wo} ab`);
  }
  assert.equal(MARKE, seiten.MARKE, 'MARKE weicht von seiten-seo ab');
});

test('Markenbild ist byte-identisch zu dem in seiten-seo.js', () => {
  assert.deepEqual(MARKEN_TEILBILD, seiten.MARKEN_TEILBILD);
  // blog-seo.js führt nur die URL (blogMeta nimmt eine URL, kein Bildobjekt) —
  // sie muss dieselbe sein, sonst teilt /blogs ein anderes Bild als der Rest
  // des Ladens.
  assert.equal(MARKEN_TEILBILD_URL, MARKEN_TEILBILD.url);
});

test('bildAus verwirft ein Bild ohne Masse, statt sie zu raten', () => {
  assert.equal(bildAus({url: 'u'}), null);
  assert.equal(bildAus({url: 'u', width: 10}), null);
  assert.equal(bildAus(null), null);
  assert.deepEqual(bildAus({url: 'u', width: 4, height: 2, altText: 'A'}), {
    url: 'u',
    breite: 4,
    hoehe: 2,
    alt: 'A',
  });
});

test('bildAus erfindet keinen alt-Text, sondern nimmt den Ersatznamen', () => {
  assert.equal(bildAus({url: 'u', width: 1, height: 1}, 'Kakao').alt, 'Kakao');
  // Leerer altText von Shopify zählt wie keiner — am 2026-09-12 ist er auf
  // JEDEM Produktbild leer.
  assert.equal(
    bildAus({url: 'u', width: 1, height: 1, altText: '  '}, 'Kakao').alt,
    'Kakao',
  );
});

test('teilbild faellt in der belegten Rangfolge zurück', () => {
  const koll = {url: 'k', width: 2, height: 2};
  const prod = {title: 'P', featuredImage: {url: 'p', width: 3, height: 3}};
  assert.equal(teilbild({kollektionsBild: koll, erstesProdukt: prod}).url, 'k');
  assert.equal(teilbild({erstesProdukt: prod}).url, 'p');
  // Der heutige Normalfall: keine Kollektion hat ein Bild, leere Kollektionen
  // haben kein Produkt.
  assert.deepEqual(teilbild({}), MARKEN_TEILBILD);
});

test('Kollektions-Brotkrume hat drei Stufen, die Uebersicht zwei', () => {
  const k = brotkrume({url: 'https://x/c/a', name: 'A'});
  assert.deepEqual(
    k.itemListElement.map((e) => e.name),
    ['Startseite', 'Kollektionen', 'A'],
  );
  const u = brotkrume({url: 'https://x/c', name: ''});
  assert.deepEqual(
    u.itemListElement.map((e) => e.name),
    ['Startseite', 'Kollektionen'],
  );
});

test('kollektionSignale: kein doppeltes Tag, keine doppelte @id', () => {
  const s = kollektionSignale({
    pfad: '/collections/zeremonie-kakao',
    titel: 'Zeremonie Kakao | Qi Blanco',
    name: 'Zeremonie Kakao',
    beschreibung: 'Text',
    eintraege: [{url: 'https://qiblanco.com/products/a', name: 'A'}],
  });
  const schluessel = s
    .filter((d) => d.property || d.name)
    .map((d) => d.property || d.name);
  assert.equal(
    new Set(schluessel).size,
    schluessel.length,
    'doppeltes meta-Tag: ' + schluessel.join(','),
  );
  const ids = ld(s).map((k) => k['@id']);
  assert.equal(new Set(ids).size, ids.length, 'doppelte @id: ' + ids.join(','));
  assert.deepEqual(typen(s), ['CollectionPage', 'ItemList', 'BreadcrumbList']);
});

test('twitter:card steht nie ohne og:image', () => {
  for (const s of [
    kollektionSignale({pfad: '/collections/x'}),
    kollektionSignale({pfad: '/collections/x', eintraege: []}),
  ]) {
    const hatKarte = s.some((d) => d.name === 'twitter:card');
    const hatBild = s.some((d) => d.property === 'og:image');
    assert.equal(hatKarte, hatBild);
  }
});

test('ItemList nennt genau die uebergebenen Eintraege in ihrer Reihenfolge', () => {
  const eintraege = [
    {url: 'https://qiblanco.com/products/a', name: 'A'},
    {url: 'https://qiblanco.com/products/b', name: 'B'},
  ];
  const liste = finde(
    kollektionSignale({pfad: '/collections/x', eintraege}),
    'ItemList',
  );
  assert.equal(liste.numberOfItems, 2);
  assert.deepEqual(
    liste.itemListElement.map((e) => [e.position, e.name, e.url]),
    [
      [1, 'A', 'https://qiblanco.com/products/a'],
      [2, 'B', 'https://qiblanco.com/products/b'],
    ],
  );
});

test('leere Kollektion sagt numberOfItems 0, statt die Liste wegzulassen', () => {
  const liste = finde(
    kollektionSignale({pfad: '/collections/leer', eintraege: []}),
    'ItemList',
  );
  assert.equal(liste.numberOfItems, 0);
  assert.deepEqual(liste.itemListElement, []);
});

test('auf einer Cursor-Folgeseite entsteht KEINE ItemList', () => {
  const s = kollektionSignale({
    pfad: '/collections/x',
    eintraege: [{url: 'u', name: 'A'}],
    ersteSeite: false,
  });
  assert.deepEqual(typen(s), ['CollectionPage', 'BreadcrumbList']);
  // ...und die CollectionPage verweist dann auch nicht auf eine Liste, die es
  // nicht gibt.
  assert.equal(finde(s, 'CollectionPage').mainEntity, undefined);
});

test('Blog-Index ist ein Blog, die Blog-Uebersicht ist es NICHT', () => {
  const idx = blogIndexSignale({
    pfad: '/blogs/wissen',
    name: 'Wissen',
    artikel: [
      {
        title: 'T',
        publishedAt: '2026-01-01',
        handle: 'h',
        blog: {handle: 'wissen'},
        author: {name: 'A'},
      },
    ],
  });
  assert.deepEqual(typen(idx), ['Blog', 'BreadcrumbList']);
  const uebersicht = blogUebersichtSignale({
    pfad: '/blogs',
    name: 'Wissen',
    blogs: [{handle: 'wissen', title: 'Wissen'}],
  });
  assert.deepEqual(typen(uebersicht), [
    'CollectionPage',
    'ItemList',
    'BreadcrumbList',
  ]);
});

test('blogPost trägt DIESELBE @id wie die Artikelseite (blog-schema.js)', () => {
  const blog = finde(
    blogIndexSignale({
      pfad: '/blogs/wissen',
      name: 'Wissen',
      artikel: [
        {
          title: 'T',
          publishedAt: '2026-01-01',
          handle: 'mein-artikel',
          blog: {handle: 'wissen'},
        },
      ],
    }),
    'Blog',
  );
  assert.equal(
    blog.blogPost[0]['@id'],
    'https://qiblanco.com/blogs/wissen/mein-artikel#artikel',
  );
});

test('unvollstaendige Artikel fliegen raus, statt halbe Knoten zu bauen', () => {
  const blog = finde(
    blogIndexSignale({
      pfad: '/blogs/wissen',
      name: 'Wissen',
      artikel: [
        {title: 'ohne Datum', handle: 'a', blog: {handle: 'wissen'}},
        {publishedAt: '2026-01-01', handle: 'b', blog: {handle: 'wissen'}},
        {
          title: 'gut',
          publishedAt: '2026-01-01',
          handle: 'c',
          blog: {handle: 'wissen'},
        },
      ],
    }),
    'Blog',
  );
  assert.equal(blog.blogPost.length, 1);
  assert.equal(blog.blogPost[0].headline, 'gut');
});

test('auf einer Cursor-Folgeseite entsteht KEIN Teilbild', () => {
  // Befund einer unabhaengigen Gegenpruefung (2026-09-12): die erste Fassung
  // band die ItemList an `ersteSeite`, das BILD aber nicht. Weil das Teilbild
  // aus dem ersten Produkt DER SEITE stammt, lieferte
  // /collections/all?direction=next ein anderes og:image als
  // /collections/all — bei identischem canonical.
  const s = kollektionSignale({
    pfad: '/collections/all',
    eintraege: [{url: 'u', name: 'A'}],
    bild: {url: 'seite2.webp', breite: 1200, hoehe: 1200, alt: 'x'},
    ersteSeite: false,
  });
  assert.equal(
    s.some((d) => d.property === 'og:image'),
    false,
    'Folgeseite emittiert ein og:image',
  );
  // ...und ohne Bild auch keine Karte, die eines zusagt.
  assert.equal(s.some((d) => d.name === 'twitter:card'), false);
  assert.equal(finde(s, 'CollectionPage').primaryImageOfPage, undefined);
  // Gegenprobe: auf der ersten Seite steht beides.
  const e = kollektionSignale({
    pfad: '/collections/all',
    eintraege: [{url: 'u', name: 'A'}],
    bild: {url: 'seite1.webp', breite: 1200, hoehe: 1200, alt: 'x'},
  });
  assert.equal(
    e.filter((d) => d.property === 'og:image').length,
    1,
    'erste Seite ohne og:image',
  );
  assert.ok(finde(e, 'CollectionPage').primaryImageOfPage);
});

test('die ItemList nennt kein nicht-indexierbares Produkt', () => {
  // DER FEHLER, DEN DIESER TEST FESTNAGELT (Befund einer unabhaengigen
  // Gegenpruefung, 2026-09-12): /collections/all nannte pjdz538hgs0 und
  // 8kendiw34hd — beide live `noindex,nofollow`, beide in
  // NICHT_INDEXIERBARE_PRODUKTE. Der Filter für KOLLEKTIONEN war gebaut, der
  // für PRODUKTE nicht — dieselbe Regel, andere Achse.
  for (const datei of [
    'app/routes/collections.$handle.jsx',
    'app/routes/collections.all.jsx',
  ]) {
    const quelle = readFileSync(new URL('../' + datei, import.meta.url), 'utf8');
    // AUF DEN AUFRUF, NICHT AUF DAS WORT: die erste Fassung dieses Tests
    // suchte nur `/istNichtIndexierbaresProdukt/` — und blieb im
    // Mutationstest gruen, weil der Name auch im ERKLAERENDEN KOMMENTAR
    // darueber steht. Ein Zaun, den ein Kommentar erfuellt, misst die
    // Wortwahl und nicht den Code.
    assert.match(
      quelle,
      /\.filter\(\s*\(\w+\)\s*=>\s*!istNichtIndexierbaresProdukt\(/,
      `${datei} filtert nicht-indexierbare Produkte nicht aus der ItemList`,
    );
  }
});

test('jede Kollektions-Route ruft die Hilfe auch auf', () => {
  for (const datei of [
    'app/routes/collections.$handle.jsx',
    'app/routes/collections._index.jsx',
    'app/routes/collections.all.jsx',
  ]) {
    const quelle = readFileSync(new URL('../' + datei, import.meta.url), 'utf8');
    assert.match(
      quelle,
      /kollektionSignale\(/,
      `${datei} ruft kollektionSignale nicht auf`,
    );
  }
});

test('die Kollektions-Uebersicht filtert nicht-indexierbare Kollektionen', () => {
  // Ohne diesen Filter listete die ItemList Seiten, denen wir per noindex
  // gerade gesagt haben, sie moegen ignoriert werden — am 2026-09-12 waren
  // drei der vier gezeigten Kacheln genau solche.
  const quelle = readFileSync(
    new URL('../app/routes/collections._index.jsx', import.meta.url),
    'utf8',
  );
  assert.match(quelle, /istNichtIndexierbareKollektion/);
});
