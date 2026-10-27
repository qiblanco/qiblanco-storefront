/**
 * Wächter: ENDFASSUNG DER QI-ALPHA-LANDINGPAGES A/B/C (node --test, ohne
 * Bundler). Job 20261027-the-alpha-film-seiten-dunkler-kopf-z52, Christians
 * Nachträge vom 27.10.2026 (Z258–Z299):
 *  - die Seite endet mit dem roten Knopf (Z258–Z263), B ohne Live/Fragen,
 *  - der Schluss-Titel heißt „Qi Alpha®“ und steht in der Schluss-Szene
 *    über Limited 1st. Edition (Z264, Z268–Z274),
 *  - Shop-Kopf, Band, Fuß und AI Anna fehlen auf den Film-Routen (Z275–Z279),
 *    über das Routen-Merkmal handle.filmSeite, nicht über einen Pfad,
 *  - Wörter bauen sich mit dem Scrollen auf (Z294), das Wörterbuch trägt die
 *    Fettungen der Vorlage bei unverändertem Wortlaut (Z289).
 * ROT VOR GRÜN: auf origin/main ee31b030 fehlen handle.filmSeite, istFilmSeite
 * und tapWorte, THE_ALPHA_MARKE ist 'THE ALPHA', B rendert Live und Fragen.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const daten = await import(join(WURZEL, 'app/components/campaign/the-alpha-daten.js'));

const FILM_ROUTEN = [
  'app/routes/pages.The-Alpha.jsx',
  'app/routes/pages.The-Alpha-B.jsx',
  'app/routes/pages.The-Alpha-C.jsx',
];

test('Film-Routen tragen das Merkmal handle.filmSeite', () => {
  for (const r of FILM_ROUTEN) {
    assert.match(lies(r), /export const handle = \{filmSeite: true\};/, r);
  }
  // Gegenprobe: die Shopseite bleibt ein Shop (Kopf, Band, Anna nach Standard).
  assert.doesNotMatch(lies('app/routes/products.the-alpha.jsx'), /filmSeite/);
});

test('root.jsx: Film-Seite ohne PageLayout und ohne Assistent', () => {
  const root = lies('app/root.jsx');
  assert.match(root, /export function istFilmSeite\(matches\)/);
  assert.match(root, /match\?\.handle\?\.filmSeite === true/);
  assert.match(root, /!filmSeite &&\s*\(salesbotSeite \|\| salesbotDeutscherShop\)/);
  assert.match(root, /filmSeite \? \(\s*(\/\/[^\n]*\n\s*)*<main data-film-seite="">/);
  // Kein Pfad-Literal der Film-Seiten im Layout.
  assert.doesNotMatch(root, /The-Alpha/);
});

test('Schluss-Titel heißt Qi Alpha® und steht in der Schluss-Szene', () => {
  assert.equal(daten.THE_ALPHA_MARKE, 'Qi Alpha®');
  assert.equal(daten.QI_ALPHA_LEISTE, 'QI ALPHA®');
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  const edition = p.slice(p.indexOf('export function TapEdition'));
  const name = edition.indexOf('tap-marke-name');
  const titel = edition.indexOf('tap-edition-titel');
  const knopf = edition.indexOf('<TheAlphaKauf');
  assert.ok(name > 0 && name < titel && titel < knopf, 'Reihenfolge Qi Alpha® < Edition < Knopf');
  assert.doesNotMatch(p, /tap-marke-szene/, 'kein eigener Namens-Bildschirm mehr');
});

test('Seitenende: nach dem roten Knopf kommt nichts (A, B, C)', () => {
  const ende = (f) => {
    const s = lies(f);
    const nach = s.slice(s.lastIndexOf('</TapEdition>') >= 0 ? s.lastIndexOf('</TapEdition>') : s.lastIndexOf('<TapEdition />'));
    return nach.replace(/<\/?TapEdition[^>]*>/, '').split('</TapSeite>')[0].trim();
  };
  for (const f of [
    'app/components/campaign/TheAlpha.jsx',
    'app/components/campaign/TheAlphaVarianteB.jsx',
    'app/components/campaign/TheAlphaVarianteC.jsx',
  ]) {
    assert.equal(ende(f), '', `${f}: nach TapEdition steht noch etwas`);
  }
  const b = lies('app/components/campaign/TheAlphaVarianteB.jsx');
  assert.doesNotMatch(b, /<Live \/>|<Fragen \/>|TheAlphaLiveAnmeldung/);
});

test('Wörter bauen sich mit dem Scrollen auf (tapWorte)', async () => {
  const src = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(src, /data-tap-scrub=""/);
  assert.match(src, /data-tap-schritt=""/);
  // Die reine Zerlegung ohne Bundler nachrechnen (Funktion als Quelltext).
  const body = src.slice(src.indexOf('export function tapWorte'), src.indexOf('function Worte('));
  const tapWorte = new Function(`${body.replace('export ', '')}; return tapWorte;`)();
  assert.deepEqual(tapWorte('- Ultra High Vibe Mode -'), ['- Ultra', 'High', 'Vibe', 'Mode -']);
  assert.deepEqual(tapWorte('Klare Eingebung.'), ['Klare', 'Eingebung.']);
});

test('Wörterbuch: Wortlaut unverändert, Fettungen der Vorlage', () => {
  const wb = daten.THE_ALPHA_WOERTERBUCH;
  const text = wb.bedeutungen.map((b) => b.map((t) => t.text).join(''));
  assert.equal(text[0], 'extrem positive Ausstrahlung.');
  assert.ok(text[1].startsWith('Es beschreibt einen Zustand, in dem du voller Lebensenergie'));
  assert.ok(text[1].endsWith('die positive Erlebnisse, Erfolg und gesunde Beziehungen wie ein Magnet anzieht.'));
  const fett = wb.bedeutungen.flat().filter((t) => t.fett).map((t) => t.text);
  assert.ok(fett.includes('voller Lebensenergie, Freude, innerem Frieden und Dankbarkeit'));
  assert.equal(wb.quelle, 'Google AI');
});
