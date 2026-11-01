/**
 * Wächter: QI ALPHA A, gestreckter Takt am Touch-Gerät und Video am Scrollweg
 * (Elina 01.11.2026, Vorgang EL-20261101-ead0cb14: „Ein natürlicher langer
 * Daumenwisch bringt genau EINEN neuen Abschnitt bzw. ein neues Detail … ohne
 * hartes Einrasten oder Anhalten“; „Video: kein Einrasten und kein Stopp. Das
 * Video läuft durch das Wischen weiter (an das Scrollen gekoppelt), und man
 * braucht etwa zwei lange Wische, um am Video vorbeizukommen.“)
 * Nur die Landingpage /pages/Qi-Alpha (Variante A, Szenen-Kette); B, C und die
 * Kaufseite /products/qi-alpha bleiben, wie sie sind (Präzisierung
 * EL-20261101-c3dfba9a).
 * ROT VOR GRÜN: auf dem Stand von #1200 fehlt the-alpha-video-lauf.js (Import
 * scheitert), der Takt am Handy ist 96/160 px, A trägt den Stopper.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const CSS = lies('app/styles/the-alpha-premium.css');
const P = lies('app/components/campaign/TheAlphaPremium.jsx');
const lauf = await import(join(WURZEL, 'app/components/campaign/the-alpha-video-lauf.js'));

test('Touch-Gerät: jeder Schritt der Kette 130svh (ein langer Wisch), Desktop behält seinen Takt', () => {
  assert.match(CSS, /\.tap-js\.tap-kette \{\s*--tap-schritt-lang: 130svh;\s*--tap-schritt-video: 50svh;/);
  const touch = CSS.slice(CSS.indexOf('@media (hover: none) and (pointer: coarse)'));
  for (const art of ['wort', 'zeile', 'absatz', 'bild', 'video']) {
    assert.match(touch, new RegExp(`--tap-schritt-${art}: var\\(--tap-schritt-lang\\);`), art);
  }
  // Der Desktop-Takt (ab 768 px) ist unverändert.
  assert.match(CSS, /--tap-schritt-wort: 64px;\s*--tap-schritt-absatz: 200px;\s*--tap-schritt-zeile: 128px;/);
  // Keine Weiche nach der Fensterhöhe (Browserleisten).
  assert.doesNotMatch(CSS, /@media \([a-z-]*height[^)]*\)/);
});

test('Schrittmaß wird gemessen (svh), nicht als Text gelesen', () => {
  assert.match(P, /height:var\(--tap-schritt\);visibility:hidden/);
  assert.match(P, /s\.px = s\.lineal\.getBoundingClientRect\(\)\.height \|\| 48;/);
  assert.doesNotMatch(P, /parseFloat\(getComputedStyle\(s\.b\)\.getPropertyValue\('--tap-schritt'\)\)/);
  // Prüfschalter ?schritt=NN (svh) nur in der Kette.
  assert.match(P, /el\.style\.setProperty\('--tap-schritt-lang', `\$\{wunsch\}svh`\)/);
});

test('Video: eigene Bühne zwei Video-Schritte lang, sticky, kein Stopper an A', () => {
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-film-buehne \{[^}]*height: calc\(var\(--tap-video-hoehe, 0px\) \+ 2 \* var\(--tap-schritt-video\)\);/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-film-buehne > \.tap-film \{\s*position: sticky;\s*top: calc\(100svh - var\(--tap-video-hoehe, 0px\) - var\(--tap-video-luft\)\);/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-nach-video \{[^}]*margin-top: calc\(-100svh \+ var\(--tap-video-luft\)\);/);
  const film = P.slice(P.indexOf('export function TapFilm'), P.indexOf('function MarkeImText'));
  assert.match(film, /<div className="tap-film-buehne" ref=\{buehneRef\}>/);
  assert.match(film, /tapVideoLauf\(buehneRef\.current, figurRef\.current, filmRef\.current, window\)/);
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapFilm film=\{THE_ALPHA_FILM_OHNE_TEXT\} \/>/);
});

test('Video ruht, wenn es weicht oder das Logo hält (kein unsichtbares Dekodieren)', () => {
  assert.match(P, /const wartet = f\.classList\.contains\('tap-wartet'\) \|\| f\.classList\.contains\('tap-aus'\);/);
  const ton = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(ton, /!figur\.classList\.contains\('tap-aus'\) &&\s*!v\.dataset\.tapLaufEnde\)/);
});

test('B und C bleiben: alles Neue hängt an der Kette (nur A) bzw. an der Szenen-Fassung', () => {
  for (const f of ['TheAlphaVarianteB.jsx', 'TheAlphaVarianteC.jsx']) {
    const v = lies(`app/components/campaign/${f}`);
    assert.doesNotMatch(v, /film="szene"/, f);
  }
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapSeite variante="a" film="szene" ton="an">/);
  // Kaufseite: die Alpha-Vorlage kennt die Film-Bausteine nicht.
  assert.doesNotMatch(lies('app/components/product-pages/AlphaVorlage.jsx'), /TheAlphaPremium|the-alpha-video-lauf/);
});

test('anteil(): Weg durch die Bühne aus zwei Rechtecken', () => {
  assert.equal(lauf.anteil({top: 300, height: 1700}, {top: 300, height: 400}), 0);
  assert.equal(lauf.anteil({top: -350, height: 1700}, {top: 300, height: 400}), 0.5);
  assert.equal(lauf.anteil({top: -1200, height: 1700}, {top: 100, height: 400}), 1);
  assert.equal(lauf.anteil({top: 0, height: 300}, {top: 0, height: 400}), 0);
});

test('tempo(): Ruhe = normal, Vorsprung = schneller, gedeckelt, in halben Stufen', () => {
  assert.equal(lauf.tempo(0), 1);
  assert.equal(lauf.tempo(-3), 1);
  assert.equal(lauf.tempo(0.2), 1);
  assert.equal(lauf.tempo(2), 3.5);
  assert.equal(lauf.tempo(50), lauf.MAX_RATE);
  assert.ok(lauf.MAX_RATE <= 8);
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

test('Lauf: Wischen treibt das Video schneller voran, ohne zu spulen; Ruhe = normal', () => {
  const {win, video, figur, buehne} = attrappe();
  const weg = lauf.tapVideoLauf(buehne, figur, video, win);
  assert.equal(video.loop, false);
  win.takt();
  assert.equal(video.playbackRate, 1);
  // Ein langer Wisch: halber Weg durch die Bühne, Video erst bei 1 s.
  video.currentTime = 1;
  buehne.lage = {top: -350, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.ok(video.playbackRate > 1, `Tempo ${video.playbackRate}`);
  assert.equal(video.currentTime, 1, 'vorwärts wird nie gespult');
  // Aufgeholt: wieder Normaltempo, ohne neuen Scroll (Nachsehen läuft weiter).
  video.currentTime = 9.6;
  win.takt();
  assert.equal(video.playbackRate, 1);
  weg();
  assert.equal(video.loop, true);
});

test('Lauf: am Ende hält das Logo; zurück springt einmal und läuft weiter', () => {
  const {win, video, figur, buehne} = attrappe();
  lauf.tapVideoLauf(buehne, figur, video, win);
  buehne.lage = {top: -1000, height: 1700};
  video.currentTime = 19.2;
  video.feuer('timeupdate');
  assert.equal(video.paused, true);
  assert.equal(video.dataset.tapLaufEnde, '1');
  // Zurück an den Anfang der Bühne.
  buehne.lage = {top: 250, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.ok(video.currentTime < 1, `Zeit ${video.currentTime}`);
  assert.equal(video.paused, false);
  assert.equal(video.dataset.tapLaufEnde, undefined);
});

test('Lauf: unsichtbar (weicht/wartet) = Normaltempo, nichts gespult', () => {
  const {win, video, figur, buehne, klassen} = attrappe();
  lauf.tapVideoLauf(buehne, figur, video, win);
  video.playbackRate = 4;
  klassen.add('tap-aus');
  buehne.lage = {top: -1000, height: 1700};
  win.feuer('scroll');
  win.takt();
  assert.equal(video.playbackRate, 1);
  assert.equal(video.currentTime, 0);
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
