// Rookie /pages/start-b (Experiment start-e1-gs081, GS-081).
// Lauf: node --test (findet *.test.mjs im ganzen Baum außer node_modules).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {stickySichtbar} from './sticky-lage.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', '..', '..');
const lies = (rel) => readFileSync(join(APP, rel), 'utf8');
const ohneKommentare = (q) =>
  q.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const lage = (x) => ({kopfImBild: false, kopfUnterkante: -10, kaufknopfImBild: false, fussImBild: false, ...x});

test('Sticky: steht erst, wenn der Kopf nach oben aus dem Bild ist', () => {
  assert.equal(stickySichtbar(lage({kopfImBild: true, kopfUnterkante: 600})), false);
  assert.equal(stickySichtbar(lage({})), true);
  // Unterkante genau am Rand zählt als vorbei
  assert.equal(stickySichtbar(lage({kopfUnterkante: 0})), true);
});

test('Sticky: weg, solange der Knopf nach den Zell-Diagrammen im Bild ist', () => {
  assert.equal(stickySichtbar(lage({kaufknopfImBild: true})), false);
});

test('Sticky: weg, sobald der Fuß im Bild ist (Impressum/Widerruf frei)', () => {
  assert.equal(stickySichtbar(lage({kopfUnterkante: -9000, fussImBild: true})), false);
});

test('Sticky: unbekannte Lage heißt nicht zeigen', () => {
  for (const u of [null, undefined, Number.NaN, Infinity]) {
    assert.equal(stickySichtbar(lage({kopfUnterkante: u})), false);
  }
  // Kopf liegt (noch) unter dem Fenster: nicht vorbei
  assert.equal(stickySichtbar(lage({kopfUnterkante: 900})), false);
});

test('Route: noindex doppelt, kein canonical, kein Open Graph, keine Weiche', () => {
  const r = ohneKommentare(lies('routes/pages.start-b.jsx'));
  assert.match(r, /name: 'robots', content: 'noindex,nofollow'/);
  assert.match(r, /'X-Robots-Tag': 'noindex, nofollow'/);
  assert.doesNotMatch(r, /canonical(Link)?\(|og:|entityGraph|ld\+json/);
  assert.doesNotMatch(r, /experiment-weiche|lp-ab-v2/);
  // Titel ist nicht der Titel der Startseite
  const a = lies('routes/_index.jsx');
  const titelA = a.match(/const TITEL = '([^']+)'/)[1];
  assert.ok(!r.includes(titelA), 'B trägt den Titel der Startseite');
  // Gate 25 liest einen Gedankenstrich im Titel einer neuen Route als KI-Muster
  const titelB = r.match(/title: '([^']+)'/)[1];
  assert.doesNotMatch(titelB, /[—–]| - /);
});

test('Rookie: keine 360-Drehung, keine Scroll-Videos, Beleg-Blöcke raus', () => {
  for (const datei of ['components/rookie/start/StartRookie.jsx', 'components/rookie/start/RookieKopf.jsx']) {
    const code = ohneKommentare(lies(datei));
    for (const weg of ['Produkt360Video', 'featured-image--360', 'HerobannerFeatured\'', 'GitterchipMoleculesScrub', 'ScrollMikroskopVideo', 'PeerReviewStudies', 'Studien ', 'Finanzierungsbanner', 'UpsellLineUp', 'parallax', 'kohärent']) {
      assert.ok(!code.includes(weg), `${weg} gehört nicht in B (${datei})`);
    }
  }
});

test('Rookie: ein Ziel im Kopf, Kaufknopf nach den Zell-Diagrammen, Karten hinter der Statistik', () => {
  const kopf = ohneKommentare(lies('components/rookie/start/RookieKopf.jsx'));
  const ziele = [...kopf.matchAll(/\b(?:to|href)=(\{[^}]+\}|"[^"]*"|'[^']*')/g)].map((m) => m[1]);
  assert.deepEqual(ziele, ['{ZIEL}'], 'Kopf-Ziele');
  assert.ok(!/Mehr erfahren|SterneSprung|ReviewCount/.test(kopf), 'Kopf trägt einen zweiten Weg');
  assert.match(kopf, /const ZIEL = '\/products\/qione-2-pro'/);
  assert.equal((kopf.match(/<Link /g) || []).length, 1, 'genau ein Link im Kopf');

  const b = ohneKommentare(lies('components/rookie/start/StartRookie.jsx'));
  const reihe = [...b.matchAll(/data-?[Ss]ection="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(reihe.slice(0, 7), [
    'hero', 'zell-diagramme', 'zell-cta', 'logo-bar', 'nutzer-statistik',
    'featured-qione-2-pro', 'featured-qibracelet',
  ]);
  assert.ok(reihe.includes('featured-qihome-air'));
});

// Kein neuer Text: jede sichtbare Textzeile von B steht wörtlich in A.
test('Rookie: Bestandstext, Messanker wie A', () => {
  const a = lies('components/homepage/HomepageSections.jsx') + lies('components/index-components/HerobannerFeatured.jsx');
  const b = ohneKommentare(lies('components/rookie/start/StartRookie.jsx') + lies('components/rookie/start/RookieKopf.jsx') + lies('components/rookie/start/StickyKaufknopf.jsx'));
  const texte = [...b.matchAll(/>([^<>{}\n]*[A-Za-zÄÖÜäöüß][^<>{}\n]*)</g)].map((m) => m[1].trim()).filter(Boolean);
  assert.ok(texte.length >= 10, `zu wenig Text gefunden: ${texte.length}`);
  for (const t of texte) assert.ok(a.includes(t), `neuer Text in B: "${t}"`);
  for (const anker of ['zell-diagramme', 'logo-bar', 'nutzer-statistik', 'info-slider', 'externe-stimmen', 'featured-qione-2-pro', 'youtube-testimonial-preis']) {
    assert.ok(a.includes(`"${anker}"`), `Anker ${anker} fehlt in A`);
  }
});

// Jeder benannte Import aus dem eigenen Baum muss dort exportiert sein (Lehre
// s02 06.10.: eine Textersetzung ae -> ä traf einen Importnamen, erst der
// Browser brach).
test('Rookie: benannte Importe existieren in ihren Quelldateien', () => {
  for (const datei of ['components/rookie/start/StartRookie.jsx', 'components/rookie/start/RookieKopf.jsx', 'components/rookie/start/StickyKaufknopf.jsx', 'routes/pages.start-b.jsx']) {
    const q = lies(datei);
    for (const m of q.matchAll(/import \{([^}]+)\} from '(~\/[^']+|\.\/[^']+)'/g)) {
      const basis = m[2].startsWith('~/') ? join(APP, m[2].slice(2)) : join(dirname(join(APP, datei)), m[2]);
      const kandidat = ['.jsx', '.js', ''].map((e) => basis + e).find((p) => existsSync(p));
      assert.ok(kandidat, `${m[2]} nicht gefunden (${datei})`);
      const ziel = readFileSync(kandidat, 'utf8');
      for (const name of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
        assert.match(ziel, new RegExp(`export (?:function|const) ${name}\\b`), `${name} fehlt in ${m[2]}`);
      }
    }
    // Default-Importe (LazyImage ist ein Default-Export; ein benannter Import
    // wäre undefined und bräche den Kopf erst beim Rendern).
    for (const m of q.matchAll(/import ([A-Za-z]\w*) from '(~\/[^']+|\.\/[^']+)'/g)) {
      const basis = m[2].startsWith('~/') ? join(APP, m[2].slice(2)) : join(dirname(join(APP, datei)), m[2]);
      const kandidat = ['.jsx', '.js'].map((e) => basis + e).find((p) => existsSync(p));
      if (!kandidat) continue; // ?url-Importe von Stylesheets
      assert.match(readFileSync(kandidat, 'utf8'), /export default /, `${m[1]}: kein Default-Export in ${m[2]}`);
    }
  }
});

// Jede in rookie-start.css gelesene Variable ist irgendwo definiert (Lehre s02:
// ein umgeschriebener Token-Name fällt still auf den Vorgabewert).
test('CSS: jede gelesene Variable ist definiert', () => {
  const css = lies('styles/rookie-start.css');
  const definiert = lies('styles/startseite.css') + lies('styles/qb-tokens.css') + lies('styles/overlay-ordnung.css') + css;
  for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    assert.ok(new RegExp(`${m[1]}\\s*:`).test(definiert), `${m[1]} ist nirgends definiert`);
  }
});
