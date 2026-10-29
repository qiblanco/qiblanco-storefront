/**
 * Wächter: QI-ALPHA-LANDINGPAGE A, Text UNTER dem Video statt im Bild, Zeilen
 * statt Wörter, „Sound On“ unter „Kohärentes Licht“, Klänge -14 LUFS
 * (node --test, ohne Bundler). Job 20261029-qi-alpha-lp-text-unter-video-
 * abspann-zeilenweise-offene-wuensche, Christian 29.10.2026: „der text ist
 * immer noch im Video zu sehen anstatt darunter“, „zeile für zeile aufbauen
 * nicht wort für wort“, „sound on ist auf dem desktop immer noch nicht live“.
 * ROT VOR GRÜN: auf origin/main 53fac142 fehlen THE_ALPHA_FILM_OHNE_TEXT,
 * figcaption.tap-film-texte, der Hinweis tap-ton-hinweis und QUELLE_LAUT;
 * die Unterzeile der Titelkarte baut sich Wort für Wort auf.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const daten = await import(join(WURZEL, 'app/components/campaign/the-alpha-daten.js'));

test('A zeigt Lucas Reveal ohne Text im Bild, B behält das alte Video', () => {
  const film = daten.THE_ALPHA_FILM_OHNE_TEXT;
  assert.ok(film, 'THE_ALPHA_FILM_OHNE_TEXT fehlt');
  assert.match(
    film.video.src,
    /^https:\/\/cdn\.shopify\.com\/videos\/c\/vp\/[0-9a-f]+\/[0-9a-f]+\.[^/]+\.mp4$/,
    'Adresse der hochgeladenen Fassung ohne Text fehlt (cdn-publish)',
  );
  assert.notEqual(film.video.src, daten.THE_ALPHA_VIDEO.video.src, 'noch das Video mit eingebrannten Sätzen');
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapFilm film=\{THE_ALPHA_FILM_OHNE_TEXT\} \/>/);
  assert.match(lies('app/components/campaign/TheAlphaVarianteB.jsx'), /<TapFilm film=\{THE_ALPHA_VIDEO\} \/>/);
});

test('Sätze im Takt des Films: einer nach dem anderen, der letzte erst mit vollem Logo', () => {
  const {texte} = daten.THE_ALPHA_FILM_OHNE_TEXT;
  assert.equal(texte.length, 3);
  for (let i = 0; i < texte.length; i += 1) {
    assert.ok(texte[i].von < texte[i].bis, `Satz ${i + 1}: von < bis`);
    if (i) assert.ok(texte[i].von > texte[i - 1].bis, `Satz ${i + 1} erst, wenn Satz ${i} weg ist`);
  }
  // Logo „Qi Alpha®“ im Reveal voll sichtbar ab 16,75 s (gemessen ax41, 29.10.).
  assert.ok(texte[2].von >= 16.75, 'Schluss-Satz vor dem vollen Logo');
  assert.equal(texte[2].text, 'Qi Alpha® – die nächste Dimension.');
  assert.match(texte[0].text, /The One Eye/);
  assert.match(texte[1].text, /^Die finale Politur/);
});

test('TapFilm: echter Text unter dem Bild (figcaption), höchstens einer an', () => {
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  const film = p.slice(p.indexOf('export function TapFilm'), p.indexOf('export function TapKapitel'));
  assert.match(film, /<figcaption className="tap-film-texte">/);
  assert.match(film, /i === aktiv \? ' tap-film-text-an' : ''/);
  assert.match(film, /'timeupdate'/);
  assert.ok(film.indexOf('</video>') < film.indexOf('<figcaption'), 'Text steht unter dem Video');
  const css = lies('app/styles/the-alpha-premium.css');
  assert.match(css, /\.tap-film-text \{\s*grid-area: 1 \/ 1;/);
  assert.match(css, /\.tap-js \.tap-film-text \{\s*opacity: 0;/);
  assert.match(css, /\.tap-js \.tap-film-text\.tap-film-text-an \{\s*opacity: 1;/);
});

test('Titelkarte der Szenen-Fassung: Unterzeile als ganze Zeile, ein Schritt', () => {
  const p = lies('app/components/campaign/TheAlphaPremium.jsx');
  const karte = p.slice(p.indexOf('export function TapTitelkarte'), p.indexOf('export function TapWoerterbuch'));
  assert.match(karte, /const worte = zeilenweise \? 1 : tapWorte\(untertitel\)\.length;/);
  assert.match(karte, /<span className="tap-zeile" data-tap-schritt="">\s*\{untertitel\}/);
});

test('Ton als Standard: „Sound On“ unter dem Titel, X links, Klänge -14 LUFS', () => {
  const t = lies('app/components/campaign/TheAlphaTon.jsx');
  const hinweis = t.slice(t.indexOf("tap-ton-hinweis${"));
  assert.ok(hinweis.length > 0, 'Hinweis fehlt');
  const x = hinweis.indexOf('onClick={hinweisOhne}');
  const an = hinweis.indexOf('onClick={hinweisAn}');
  assert.ok(x > 0 && an > x, 'X steht links vor „Sound On“');
  assert.match(hinweis, /<span>Sound On<\/span>/);
  assert.match(t, /closest\?\.\('\.tap-ton-schalter, \.tap-ton-hinweis'\)/);
  assert.match(t, /setOben\(Math\.round\(Math\.min\(r\.bottom \+ 48,/);
  assert.match(t, /m\.laut = tonStandard;/);
  const laut = t.slice(t.indexOf('const QUELLE_LAUT'), t.indexOf('const PEGEL_LAUT'));
  assert.equal((laut.match(/14lufs\.mp3/g) || []).length, 7);
  assert.doesNotMatch(laut, /EINSETZEN/, 'CDN-Adressen der -14-LUFS-Klänge fehlen');
});
