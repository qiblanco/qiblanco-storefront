/**
 * Hermetischer Node-Test der Artikel-Pfad-Zuordnung (kein Netz, kein Shopify).
 *
 *   node test/blog-artikel-pfad.test.mjs      # exit 0 = gruen
 *
 * Der Test deckt bewusst die Faelle ab, die in Betrieb NICHT ausloesbar sind
 * und die deshalb sonst niemand prueft: den Artikel ohne bekannten Blog (der
 * Fall, der früher die tote /articles/-URL erzeugt haette), die kaputte
 * Antwort und die Handle-Kollision zwischen zwei Blogs.
 */
import assert from 'node:assert/strict';
import {
  ARTIKEL_PFAD_FRAGMENT,
  ARTIKEL_PRO_BLOG,
  artikelBlogKarte,
  artikelKarteUnvollstaendig,
  artikelPfad,
} from '../app/lib/blog-artikel-pfad.js';

const blog = (handle, artikelHandles, hasNextPage = false) => ({
  handle,
  artikel: {
    nodes: artikelHandles.map((h) => ({handle: h})),
    pageInfo: {hasNextPage},
  },
});

/**
 * Die sechs am 2026-09-05 live gemessenen Artikel, in der Adressform, unter
 * der sie wirklich antworten.
 */
const LIVE_PFADE = [
  '/blogs/wissen/kohaerentes-wasser-was-die-forschung-misst',
  '/blogs/wissen/nervensystem-regulieren-trend-innere-ruhe',
  '/blogs/wissen/schlaf-vermessen-trend-optimierte-nacht',
  '/blogs/wissen/schlafqualitaet-wasser-drei-studien',
  '/blogs/wissen/strukturiertes-wasser-trend-was-gemessen-ist',
  '/blogs/wissen/zellulaere-hydration-biophysik',
];

let gruen = 0;
function pruefe(name, fn) {
  fn();
  gruen += 1;
  console.log(`  ok  ${name}`);
}

pruefe('Artikel bekommt den Pfad seines Blogs', () => {
  const karte = artikelBlogKarte({nodes: [blog('wissen', ['zellulaere-hydration-biophysik'])]});
  assert.equal(
    artikelPfad(karte, 'zellulaere-hydration-biophysik'),
    '/blogs/wissen/zellulaere-hydration-biophysik',
  );
});

pruefe('die sechs live gemessenen Slugs landen unter /blogs/wissen/', () => {
  // Als PFADE geschrieben und die Handles daraus abgeleitet: so steht die
  // erwartete Adresse woertlich da, statt im Test zusammengebaut zu werden.
  const slugs = LIVE_PFADE.map((pfad) => pfad.split('/').pop());
  const karte = artikelBlogKarte({nodes: [blog('wissen', slugs)]});
  for (const slug of slugs) {
    assert.equal(artikelPfad(karte, slug), `/blogs/wissen/${slug}`);
    // Die alte, tote Form darf baulich nicht mehr entstehen können.
    assert.ok(!artikelPfad(karte, slug).startsWith('/articles/'));
  }
});

pruefe('mehrere Blogs werden je eigenem Handle zugeordnet', () => {
  const karte = artikelBlogKarte({
    nodes: [blog('wissen', ['a']), blog('e-smog', ['b'])],
  });
  assert.equal(artikelPfad(karte, 'a'), '/blogs/wissen/a');
  assert.equal(artikelPfad(karte, 'b'), '/blogs/e-smog/b');
});

pruefe('unbekannter Artikel gibt null statt einer geratenen URL', () => {
  const karte = artikelBlogKarte({nodes: [blog('wissen', ['a'])]});
  assert.equal(artikelPfad(karte, 'nie-gesehen'), null);
});

pruefe('kaputte Antwort erzeugt leere Karte, nie einen falschen Pfad', () => {
  for (const kaputt of [null, undefined, {}, {nodes: null}, {nodes: 'nein'}]) {
    const karte = artikelBlogKarte(kaputt);
    assert.equal(karte.size, 0);
    assert.equal(artikelPfad(karte, 'a'), null);
  }
});

pruefe('Blog ohne Handle und Artikel ohne Handle werden uebersprungen', () => {
  const karte = artikelBlogKarte({
    nodes: [
      {handle: null, artikel: {nodes: [{handle: 'a'}]}},
      blog('wissen', []),
      {handle: 'x', artikel: null},
      {handle: 'wissen', artikel: {nodes: [{handle: null}, {handle: 'b'}]}},
    ],
  });
  assert.equal(artikelPfad(karte, 'a'), null);
  assert.equal(artikelPfad(karte, 'b'), '/blogs/wissen/b');
});

pruefe('Handle-Kollision: der zuerst gelesene Blog gewinnt, deterministisch', () => {
  const karte = artikelBlogKarte({
    nodes: [blog('wissen', ['doppelt']), blog('news', ['doppelt'])],
  });
  assert.equal(artikelPfad(karte, 'doppelt'), '/blogs/wissen/doppelt');
});

pruefe('artikelPfad ist robust gegen fehlende Karte', () => {
  assert.equal(artikelPfad(null, 'a'), null);
  assert.equal(artikelPfad(undefined, 'a'), null);
  assert.equal(artikelPfad({}, 'a'), null);
  assert.equal(artikelPfad(new Map([['a', 'wissen']]), undefined), null);
});

pruefe('abgeschnittene Artikel-Liste wird gemeldet', () => {
  assert.equal(
    artikelKarteUnvollstaendig({nodes: [blog('wissen', ['a'], true)]}),
    true,
  );
  assert.equal(
    artikelKarteUnvollstaendig({nodes: [blog('wissen', ['a'], false)]}),
    false,
  );
  assert.equal(artikelKarteUnvollstaendig(null), false);
  assert.equal(artikelKarteUnvollstaendig({nodes: 'kaputt'}), false);
});

pruefe('das Fragment trägt den Blog-Handle und die Artikel-Handles', () => {
  assert.ok(ARTIKEL_PFAD_FRAGMENT.includes('fragment BlogArtikelPfad on Blog'));
  assert.ok(ARTIKEL_PFAD_FRAGMENT.includes('handle'));
  assert.ok(ARTIKEL_PFAD_FRAGMENT.includes(`articles(first: ${ARTIKEL_PRO_BLOG})`));
  assert.ok(ARTIKEL_PFAD_FRAGMENT.includes('hasNextPage'));
});

console.log(`\nblog-artikel-pfad: ${gruen} Pruefungen gruen`);
