/**
 * Wächter: ELINAS B-SEITE der Qi-Alpha-LP, /pages/Qi-Alpha-Elina
 * (EL-20261101-a930d588: „komplett getrennt als eigene B-Seite unter eigener
 * Adresse … Geteilte Bausteine nur über Schalter, sodass die Live-Seite
 * unverändert bleibt“; EL-20261101-242cff9c: Takt in der Mitte, Textzeile ca.
 * alle 170-200 px; Video nur mit mehreren Wischen, Christians Slap-Stop +
 * 3-s-Halt; Video muss auch am iPhone abspielen).
 * Herkunft: gestreckte Vorschau EL-20261101-ead0cb14 / ce2055f2.
 * ROT VOR GRÜN: auf main c1e0b921 fehlen Route, TheAlphaElina.jsx,
 * the-alpha-elina.css und the-alpha-video-lauf.js (Import scheitert).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const P = lies('app/components/campaign/TheAlphaPremium.jsx');
const lauf = await import(join(WURZEL, 'app/components/campaign/the-alpha-video-lauf.js'));

const E = lies('app/styles/the-alpha-elina.css');
const touch = E.slice(E.indexOf('@media (hover: none) and (pointer: coarse)'));

test('Eigene Route /pages/Qi-Alpha-Elina: Elinas Baustein, eigener Stil, noindex', () => {
  const r = lies('app/routes/pages.Qi-Alpha-Elina.jsx');
  assert.match(r, /import TheAlphaElina from '~\/components\/campaign\/TheAlphaElina';/);
  assert.match(r, /const KANON_PFAD = '\/pages\/Qi-Alpha-Elina';/);
  assert.match(r, /\{rel: 'stylesheet', href: theAlphaElinaStyles\}/);
  assert.match(r, /\{name: 'robots', content: 'noindex, nofollow'\}/);
  assert.match(lies('app/lib/vorschau-noindex.js'), /\{pfad: '\/pages\/Qi-Alpha-Elina', googlebot: true/);
  const k = lies('app/components/campaign/TheAlphaElina.jsx');
  assert.match(k, /<TapSeite variante="a" film="szene" ton="an" elina>/);
  assert.match(k, /<TapFilm film=\{THE_ALPHA_FILM_OHNE_TEXT\} stopper \/>/);
});

test('Live-Seite bleibt Christians Stand: kein Schalter an A, B, C, Stil nur unter [data-tap-elina]', () => {
  for (const f of ['TheAlpha.jsx', 'TheAlphaVarianteB.jsx', 'TheAlphaVarianteC.jsx']) {
    assert.doesNotMatch(lies(`app/components/campaign/${f}`), /elina/i, f);
  }
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapSeite variante="a" film="szene" ton="an">/);
  assert.doesNotMatch(lies('app/styles/the-alpha-premium.css'), /tap-schritt-mitte|tap-film-buehne|data-tap-elina/);
  assert.doesNotMatch(lies('app/routes/pages.Qi-Alpha.jsx'), /TheAlphaElina|the-alpha-elina/);
  // Jede Regel der Elina-Datei hängt am Schalter.
  const regeln = E.replace(/\/\*[\s\S]*?\*\//g, '').split('{').slice(0, -1)
    .map((x) => x.split(/[;}]/).pop().trim()).filter((x) => x && !x.startsWith('@media'));
  assert.ok(regeln.length >= 10);
  for (const sel of regeln) {
    // Komma nur außerhalb von Klammern trennt Selektoren (:is(.a, .b)).
    for (const teil of sel.split(/,(?![^(]*\))/)) assert.match(teil.trim(), /^\.tap-seite\[data-tap-elina\]/, teil);
  }
  // Im geteilten Code ist alles Neue an den Schalter gebunden.
  assert.match(P, /const TapFassung = createContext\(\{szene: false, elina: false\}\);/);
  assert.match(P, /data-tap-elina=\{elina \? '' : undefined\}/);
  assert.match(P, /const buehne = szene && elina;/);
  assert.match(P, /if \(elina\) for \(const s of buehnen\) s\.lineal = lineal\(s\.b\);/);
  assert.match(P, /: parseFloat\(getComputedStyle\(s\.b\)\.getPropertyValue\('--tap-schritt'\)\) \|\| 48;/);
});

test('Takt am Touch-Gerät in der Mitte: 185 px je Zeile, Wort/Absatz/Bild im Verhältnis des Urzustands', () => {
  assert.match(E, /\.tap-seite\[data-tap-elina\]\.tap-js\.tap-kette \{\s*--tap-schritt-lang: 130svh;\s*--tap-schritt-video: 50svh;\s*--tap-video-schritte: 2;\s*--tap-schritt-mitte: 185px;/);
  assert.match(touch, /--tap-schritt-wort: calc\(var\(--tap-schritt-mitte\) \/ 2\);/);
  assert.match(touch, /--tap-schritt-zeile: var\(--tap-schritt-mitte\);/);
  assert.match(touch, /--tap-schritt-absatz: calc\(var\(--tap-schritt-mitte\) \* 5 \/ 3\);/);
  assert.match(touch, /--tap-schritt-bild: calc\(var\(--tap-schritt-mitte\) \* 5 \/ 3\);/);
  assert.match(touch, /--tap-schritt-video: var\(--tap-schritt-lang\);\s*--tap-video-schritte: 3;/);
  assert.doesNotMatch(E, /@media \([a-z-]*height[^)]*\)/);
  // Prüfschalter nur mit dem Schalter.
  assert.match(P, /if \(elina\) \{\s*const q = new URLSearchParams/);
  assert.match(P, /el\.style\.setProperty\('--tap-schritt-mitte', `\$\{zeile\}px`\)/);
});

test('Video: eigene Bühne, sticky, normale Geschwindigkeit, ruht wenn es weicht', () => {
  assert.match(E, /\.tap-film-buehne \{[^}]*height: calc\(var\(--tap-video-hoehe, 0px\) \+ var\(--tap-video-schritte\) \* var\(--tap-schritt-video\)\);/);
  assert.match(E, /\.tap-film-buehne > \.tap-film \{\s*position: sticky;/);
  assert.match(E, /\.tap-nach-video \{\s*margin-top: calc\(-100svh \+ var\(--tap-video-luft\)\);/);
  const film = P.slice(P.indexOf('export function TapFilm'), P.indexOf('function MarkeImText'));
  assert.match(film, /<div className="tap-film-buehne" ref=\{buehneRef\}>/);
  assert.match(film, /tapVideoLauf\(buehneRef\.current, figurRef\.current, filmRef\.current, window\)/);
  assert.match(P, /const wartet = f\.classList\.contains\('tap-wartet'\) \|\| \(elina && f\.classList\.contains\('tap-aus'\)\);/);
  const ton = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(ton, /!\(wurzel\.hasAttribute\('data-tap-elina'\) &&\s*\(figur\.classList\.contains\('tap-aus'\) \|\| v\.dataset\.tapLaufEnde\)\)/);
});

test('anteil(): Weg durch die Bühne aus zwei Rechtecken', () => {
  assert.equal(lauf.anteil({top: 300, height: 1700}, {top: 300, height: 400}), 0);
  assert.equal(lauf.anteil({top: -350, height: 1700}, {top: 300, height: 400}), 0.5);
  assert.equal(lauf.anteil({top: -1200, height: 1700}, {top: 100, height: 400}), 1);
  assert.equal(lauf.anteil({top: 0, height: 300}, {top: 0, height: 400}), 0);
});

test('Kopplung entfernt: kein Tempo, kein Rückwärts-Sprung im Modul', () => {
  assert.equal(lauf.tempo, undefined);
  assert.equal(lauf.MAX_RATE, undefined);
  const q = lies('app/components/campaign/the-alpha-video-lauf.js');
  const code = q.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /playbackRate/);
});

function attrappe({spulen = false} = {}) {
  const hoerer = {};
  const rafs = [];
  const win = {
    location: {search: spulen ? '?video=spulen' : ''},
    performance: {now: () => win.uhr},
    uhr: 1000,
    requestAnimationFrame: (f) => rafs.push(f),
    addEventListener: (t, f) => ((hoerer[t] ||= []).push(f)),
    removeEventListener: () => {},
    feuer: (t) => (hoerer[t] || []).forEach((f) => f()),
    rafs,
    takt() {
      // Ein Bild: nur, was bis jetzt angefordert ist (Nachsehen fordert neu an).
      win.uhr += 200;
      rafs.splice(0).forEach((f) => f());
    },
  };
  const vh = {};
  const video = {
    duration: 19.9,
    currentTime: 0,
    playbackRate: 1,
    paused: false,
    seeking: false,
    loop: true,
    dataset: {},
    addEventListener: (t, f) => ((vh[t] ||= []).push(f)),
    removeEventListener: () => {},
    feuer: (t) => (vh[t] || []).forEach((f) => f()),
    pause() {
      this.paused = true;
    },
    play() {
      this.paused = false;
      return Promise.resolve();
    },
  };
  const klassen = new Set(['tap-sichtbar']);
  const figur = {
    classList: {contains: (k) => klassen.has(k)},
    lage: {top: 300, height: 400},
    getBoundingClientRect() {
      return this.lage;
    },
  };
  const buehne = {
    lage: {top: 300, height: 1700},
    getBoundingClientRect() {
      return this.lage;
    },
  };
  return {win, video, figur, buehne, klassen};
}

test('Lauf: Wischen steuert das Video nicht (normales Tempo, kein Spulen, kein Anhalten)', () => {
  const {win, video, figur, buehne} = attrappe();
  const weg = lauf.tapVideoLauf(buehne, figur, video, win);
  assert.equal(video.loop, false);
  win.takt();
  // Drei lange Wische durch die Bühne, Video läuft dabei von selbst weiter.
  for (const [top, zeit] of [[-350, 1.2], [-900, 2.4], [-1300, 3.6]]) {
    video.currentTime = zeit;
    buehne.lage = {top, height: 1700};
    win.feuer('scroll');
    win.takt();
    assert.equal(video.playbackRate, 1);
    assert.equal(video.currentTime, zeit, 'nie gespult');
    assert.equal(video.paused, false, 'nie angehalten');
  }
  // Zurückwischen springt auch nicht.
  buehne.lage = {top: 250, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.equal(video.currentTime, 3.6);
  weg();
  assert.equal(video.loop, true);
});

test('Lauf: am Ende hält das Logo; erst wieder vor dem Video unsichtbar an den Anfang', () => {
  const {win, video, figur, buehne, klassen} = attrappe();
  lauf.tapVideoLauf(buehne, figur, video, win);
  video.currentTime = 19.2;
  video.feuer('timeupdate');
  assert.equal(video.paused, true);
  assert.equal(video.dataset.tapLaufEnde, '1');
  // Im Bild zurückwischen: Logo bleibt stehen, kein Sprung.
  buehne.lage = {top: 250, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.equal(video.currentTime, 19.2);
  // Wieder vor dem Video (Szene davor zu sehen): an den Anfang, unsichtbar.
  klassen.add('tap-wartet');
  win.feuer('scroll');
  win.takt();
  assert.equal(video.currentTime, 0);
  assert.equal(video.dataset.tapLaufEnde, undefined);
});

test('Prüfschalter ?video=spulen: Bild am Daumen, Video steht', () => {
  const {win, video, figur, buehne} = attrappe({spulen: true});
  lauf.tapVideoLauf(buehne, figur, video, win);
  buehne.lage = {top: -350, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.equal(video.paused, true);
  assert.ok(Math.abs(video.currentTime - 0.5 * (19.9 - lauf.ENDE_VOR_SCHLUSS_S)) < 0.01);
});

test('Abspiel-Zeichen, wenn iOS das Abspielen ohne Tipp ablehnt, fängt keine Tipps ab', () => {
  assert.match(E, /\.tap-seite\[data-tap-elina\] \.tap-film-bild:has\(> video\[data-tap-wartet-geste\]\)::before,/);
  const regel = E.slice(E.indexOf('.tap-seite[data-tap-elina] .tap-film-bild:has(> video[data-tap-wartet-geste])::before,'));
  assert.match(regel, /^[^}]*pointer-events: none;/);
  const ton = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(ton, /if \(e && e\.name === 'NotAllowedError'\) v\.dataset\.tapWartetGeste = '1';/);
  assert.match(ton, /const GESTEN = \['pointerup', 'touchend', 'mousedown', 'keydown', 'click'\];/);
});
