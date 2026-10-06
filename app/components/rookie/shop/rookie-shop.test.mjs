// Rookie /pages/qione-2-pro-b (Experiment q2p-e1-gs080, GS-080).
// Lauf: node --test (findet *.test.mjs im ganzen Baum außer node_modules).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {stickySichtbar} from './sticky-lage.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', '..', '..');
const lies = (rel) => readFileSync(join(APP, rel), 'utf8');

test('Sticky: steht erst, wenn die Buybox nach oben aus dem Bild ist', () => {
  // Seitenanfang: Buybox im Bild -> kein Sticky
  assert.equal(stickySichtbar({buyboxImBild: true, buyboxUnterkante: 600, fussImBild: false}), false);
  // vorbeigescrollt, Fuß noch weit weg -> Sticky
  assert.equal(stickySichtbar({buyboxImBild: false, buyboxUnterkante: -10, fussImBild: false}), true);
  // Unterkante genau am Rand zählt als vorbei
  assert.equal(stickySichtbar({buyboxImBild: false, buyboxUnterkante: 0, fussImBild: false}), true);
});

test('Sticky: weg, sobald der Fuß im Bild ist (Impressum/Widerruf frei)', () => {
  assert.equal(stickySichtbar({buyboxImBild: false, buyboxUnterkante: -5000, fussImBild: true}), false);
});

test('Sticky: unbekannte Lage heißt nicht zeigen', () => {
  for (const u of [null, undefined, Number.NaN, Infinity]) {
    assert.equal(stickySichtbar({buyboxImBild: false, buyboxUnterkante: u, fussImBild: false}), false);
  }
  // Buybox liegt (noch) unter dem Fenster: nicht vorbei
  assert.equal(stickySichtbar({buyboxImBild: false, buyboxUnterkante: 900, fussImBild: false}), false);
});

// Die zwei Blöcke, die QiOne2Pro.jsx nicht exportiert, stehen in B wörtlich.
// Ändert jemand A, wird dieser Test rot und verlangt den Nachzug (kein neuer
// Text in B, A und B zeigen denselben Wortlaut).
function rumpf(quelle, name) {
  const m = quelle.match(new RegExp(`^(?:export )?function ${name}\\(\\) \\{\\n[\\s\\S]*?^\\}\\n`, 'm'));
  assert.ok(m, `${name} nicht gefunden`);
  return m[0].replace(/^export /, '');
}

test('Bestandsblöcke sind byte-gleich zur Quelle QiOne2Pro.jsx', () => {
  const a = lies('components/product-pages/QiOne2Pro.jsx');
  const b = lies('components/rookie/shop/bestandsbloecke.jsx');
  for (const name of ['RisikofreiErleben', 'MassgeschneiderteTechnologie']) {
    assert.equal(rumpf(b, name), rumpf(a, name), `${name} weicht von A ab`);
  }
});

test('Route: noindex doppelt, kein canonical, keine Weiche', () => {
  const r = lies('routes/pages.qione-2-pro-b.jsx').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(r, /name: 'robots', content: 'noindex,nofollow'/);
  assert.match(r, /'X-Robots-Tag': 'noindex, nofollow'/);
  assert.doesNotMatch(r, /canonical(Link)?\(/);
  assert.doesNotMatch(r, /experiment-weiche|lp-ab-v2/);
});

test('Rookie: Animationen raus, höchstens zwei Wiederholungs-Knöpfe', () => {
  const k = lies('components/rookie/shop/QiOne2ProRookie.jsx');
  const code = k.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  for (const weg of ['GitterchipMoleculesScrub', 'ScrollMikroskopVideo', 'ScrollScrubVideo', 'parallax=', 'StudienCards', 'UpsellLineUp']) {
    assert.ok(!code.includes(weg), `${weg} gehört nicht in B`);
  }
  const wiederholungen = code.match(/Hole dir jetzt deinen QiOne/g) || [];
  assert.ok(wiederholungen.length <= 2, `Wiederholungen: ${wiederholungen.length}`);
  // dieselben Messanker wie A
  assert.match(code, /'shopq-buybox'/);
  assert.match(code, /'shopq-reputon-reviews'/);
});

// Jeder benannte Import aus dem eigenen Baum muss dort exportiert sein. Eine
// Textersetzung in Kommentaren (ae -> ä) hat am 06.10. den Komponentennamen
// Geraetevergleich im Import mit umgeschrieben; Build und SSR liefen weiter,
// erst im Browser brach das Modul (keine Schrift, kein Menü).
test('Rookie: benannte Importe existieren in ihren Quelldateien', () => {
  for (const datei of ['components/rookie/shop/QiOne2ProRookie.jsx', 'components/rookie/shop/StickyWarenkorb.jsx', 'routes/pages.qione-2-pro-b.jsx']) {
    const q = lies(datei);
    for (const m of q.matchAll(/import \{([^}]+)\} from '(~\/[^']+|\.\/[^']+)'/g)) {
      const ziel = m[2].startsWith('~/') ? m[2].slice(2) : join(dirname(datei), m[2]);
      const kandidaten = ['', '.jsx', '.js'].map((e) => ziel + e);
      let quelle = null;
      for (const k of kandidaten) {
        try { quelle = lies(k); break; } catch { /* naechster Kandidat */ }
      }
      assert.ok(quelle, `${datei}: Quelle ${m[2]} nicht gefunden`);
      for (const roh of m[1].split(',')) {
        const name = roh.trim().split(/\s+as\s+/)[0];
        if (!name) continue;
        assert.match(quelle, new RegExp(`export (async )?(function|const|let) ${name}\\b`), `${datei}: ${name} fehlt in ${m[2]}`);
      }
    }
  }
});

test('rookie-shop.css nutzt nur Token-Namen, die es gibt', () => {
  const css = lies('styles/rookie-shop.css');
  const wurzel = lies('styles/qb-tokens.css') + lies('styles/pdp-qi.css') + lies('styles/overlay-ordnung.css') + css;
  for (const m of css.matchAll(/var\((--[a-z0-9-]+)/g)) {
    assert.ok(wurzel.includes(`${m[1]}:`), `${m[1]} ist nirgends definiert`);
  }
});
