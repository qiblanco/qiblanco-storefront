/**
 * Wächter: QI ALPHA A, Szenen-Kette (node --test, ohne Bundler). Job
 * 20261031-prio1-qi-alpha-lp-scrollstrecken-deutlich-kuerzen, Christian
 * 31.10.2026: „die Scrollbewegungen sind noch deutlich zu lang, damit was
 * Neues kommt“. Gemessen vorher (390 x 844, live): 10 Strecken über einen
 * halben Bildschirm ohne Neues, bis 848 px.
 * ROT VOR GRÜN: auf origin/main bb189ffe fehlen tap-kette, tap-aus,
 * tap-nachruecken; Karten und Seitenband sind keine Bühnen.
 * NAHTLOS (Job 20261031-prio1-qi-alpha-lp-alt-weg-neu-sofort-nahtlos, Christian
 * 31.10.2026: „wenn das Alte weg ist, dann kommt direkt das Neue“): die nächste
 * Bühne steht im selben Moment, in dem die vorige weicht. ROT VOR GRÜN: auf
 * origin/main ebe8daa6 Bühne + 1,5 Schritte, halber Schritt Schwarz, Bild-Takt
 * 200 px, keine Sperre gegen Neues über dem gehaltenen Video.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const P = lies('app/components/campaign/TheAlphaPremium.jsx');
const CSS = lies('app/styles/the-alpha-premium.css');

test('Kette nur in der Szenen-Fassung mit Bewegung, Klassen werden wieder entfernt', () => {
  assert.match(P, /const kette = szene && !still;/);
  assert.match(P, /el\.classList\.add\('tap-kette'\)/);
  assert.match(P, /el\.classList\.remove\('tap-kette'\)/);
  // B und C bleiben in der Standard-Fassung, dort gibt es keine Kette.
  for (const f of ['TheAlphaVarianteB.jsx', 'TheAlphaVarianteC.jsx']) {
    assert.doesNotMatch(lies(`app/components/campaign/${f}`), /film="szene"/, f);
  }
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapSeite variante="a" film="szene"/);
});

test('Bühne weicht einen Schritt nach ihrem letzten, die Schluss-Bühne nie', () => {
  assert.match(P, /if \(kette && !s\.ende\) \{/);
  assert.match(P, /const aus = oben <= 1 && Math\.floor\(\(1 - oben\) \/ s\.px\) >= s\.zahl \+ 1;/);
  assert.match(P, /ende: b\.hasAttribute\('data-tap-ende'\)/);
  // Eine ausgeblendete Szene gilt als weg (Neues erst, wenn das Alte weg ist).
  assert.match(P, /const frei = !vor \|\| vor\.classList\.contains\('tap-aus'\) \|\| unterkante\(vor\) <= 0;/);
});

test('Geometrie nahtlos: Bildschirm + Schritte + 1, Nachrücken um einen Bildschirm, kein halber Schritt', () => {
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-scrub:not\(\[data-tap-ende\]\) \{\s*height: calc\(100svh \+ \(var\(--tap-schritte, 0\) \+ 1\) \* var\(--tap-schritt\)\);/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-nachruecken \{\s*margin-top: -100svh;/);
  // Video: Unterkante 5 % über dem Bildrand, wenn die Bühne davor weicht (Start unverändert).
  assert.match(CSS, /margin-top: calc\(-1 \* var\(--tap-video-hoehe, 0px\) - 5svh\);/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-nach-video \{\s*margin-top: calc\(-1 \* var\(--tap-video-hoehe, 0px\) - 10svh\);/);
  assert.doesNotMatch(CSS, /\+ 1\.5\) \* var\(--tap-schritt\)|--tap-schritt-absatz\) \/ 2|10svh \+ var\(--tap-schritt\) \/ 2/);
  // Übereinander liegende Bühnen fangen keine Tipps ab (Ton-Knopf am Video).
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-scrub \{\s*pointer-events: none;/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-scrub \[data-tap-schritt\]\.tap-an \{\s*pointer-events: auto;/);
});

test('Video: Start und Stopper unverändert, es weicht nur, wenn der Stopper nicht hält', () => {
  assert.match(P, /f\.getBoundingClientRect\(\)\.top < window\.innerHeight \* 0\.1 &&/);
  assert.match(P, /f\.dataset\.tapStopperStand !== 'hält'/);
  assert.match(lies('app/components/campaign/TheAlpha.jsx'), /<TapFilm film=\{THE_ALPHA_FILM_OHNE_TEXT\} stopper \/>/);
});

test('Karten und Seitenband sind in der Szenen-Fassung eigene Bühnen', () => {
  const karten = P.slice(P.indexOf('export function TapKarten'), P.indexOf('export function TapMarke'));
  assert.match(karten, /className="tap-karten-buehne tap-scrub tap-scrub-bilder"/);
  assert.match(karten, /data-tap-scrub-start="1"/);
  assert.match(karten, /<Karte key=\{b\.url\} bild=\{b\} schritt /);
  // Glanz-Ton an einer Marke auf Höhe des Karten-Schritts.
  assert.match(karten, /data-tap-ton="glanz"/);
  assert.match(karten, /top: `calc\(55svh \+ \$\{i\} \* var\(--tap-schritt\)\)`/);
  const marke = P.slice(P.indexOf('export function TapMarke'), P.indexOf('export function TapEdition'));
  assert.match(marke, /className="tap-marke-buehne tap-scrub tap-scrub-bilder"/);
  assert.match(CSS, /\.tap-scrub-bilder \{\s*--tap-schritt: var\(--tap-schritt-bild\);/);
  // Ein Bild-Schritt bleibt am Handy unter einem Viertel Bildschirm (844: 0,19; iPhone Chrome 690: 0,23).
  assert.match(CSS, /--tap-schritt-bild: 160px;/);
  // Keine Weiche nach der Fensterhöhe: sie schaltete mit den Browserleisten um (Kaufleiste blinkte).
  assert.doesNotMatch(CSS, /@media \([a-z-]*height[^)]*\)/);
});

test('Nahtlos: Neues erst, wenn das Alte weicht; erst weg, dann direkt neu', () => {
  // Hält der Stopper das Video (Desktop), zeigt die Bühne danach noch nichts.
  assert.match(P, /if \(kette && n > 0 && s\.vor && !s\.vor\.classList\.contains\('tap-aus'\) && unterkante\(s\.vor\) > 0\) \{\s*n = 0;/);
  // Erster Schritt der nachrückenden Bühne: kurz nach dem Ausblenden des Alten.
  assert.match(P, /s\.matches\('\.tap-nachruecken, \.tap-nach-video'\)/);
  assert.match(P, /eintritt\.forEach\(\(w\) => w\.classList\.add\('tap-eintritt'\)\)/);
  assert.match(P, /eintritt\.forEach\(\(w\) => w\.classList\.remove\('tap-eintritt'\)\)/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-scrub\.tap-aus > \.tap-scrub-bild,\s*\.tap-js\.tap-kette \.tap-film\.tap-aus \{\s*opacity: 0;\s*transition: opacity 200ms ease;/);
  assert.match(CSS, /\.tap-js\.tap-kette \.tap-eintritt\[data-tap-schritt\]\.tap-an \{\s*transition-delay: 180ms;/);
  // Wörterbuch-Tafel: kleiner Rand oben/unten, sonst liegt die Quelle auf kurzen Handys unter dem Rand.
  assert.match(CSS, /\.tap-seite\[data-tap-fassung='szene'\] \.tap-wb-bild \{\s*padding: var\(--tap-s-2\) var\(--tap-s-3\);/);
  // B und C behalten ihren Rand.
  assert.match(CSS, /\n\.tap-wb-bild \{\s*padding: var\(--tap-s-6\) var\(--tap-s-3\);/);
});

test('Kaufleiste: die Schluss-Bühne zählt erst ab ihrem Stillstand', () => {
  assert.match(P, /const versatz = ende\?\.classList\.contains\('tap-nachruecken'\) \? kleinesBild : 0;/);
  assert.match(P, /const oben = ende \? ende\.getBoundingClientRect\(\)\.top \+ versatz : Infinity;/);
});

test('Video puffert in der Kette nie vor dem ersten Scrollen (probe_video_a.py D1)', () => {
  // Live nach #1138: das Video liegt nah am Titel, Stufe 2 lud es schon beim Laden.
  const T = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(T, /else if \(ersteStufe\) puffern\(e\.target\);\s*else nahDa\.add\(e\.target\);/);
  assert.match(T, /const nachgeholt = \(\) => \[\.\.\.nahDa\]\.forEach\(puffern\);/);
  assert.match(T, /window\.addEventListener\('scroll', nachgeholt, \{passive: true, once: true\}\);/);
  // Die Hörer laufen in Reihenfolge: erst gescrollt() (ersteStufe = true), dann nachgeholt.
  assert.ok(T.indexOf("addEventListener('scroll', gescrollt") < T.indexOf("addEventListener('scroll', nachgeholt"));
});
