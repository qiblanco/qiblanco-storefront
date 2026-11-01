/**
 * Wächter: QI ALPHA A, iPhone-Video ohne Standbild, Standbild nur als
 * Notfallplan, Einrasten nur am iPhone (node --test, ohne Bundler).
 * Job 20261101-prio1-qi-alpha-lp-iphone-video-0-3s-standbild-nur-notfall-
 * snap-r5, Christian 01.11.2026: „Kannst du mal auf 0,3 Sekunden machen“,
 * „ein Video, was von alleine anfängt, braucht eigentlich kein Standbild“,
 * Standbild „der perfekte Notfallplan“; Samsung „echt perfekt“ (Android
 * bleibt wie live).
 * ROT VOR GRÜN: auf origin/main 4adbb7e6 fehlt the-alpha-video-ios.js
 * (Import scheitert), der Film trägt kein data-tap-klein, binde_videos setzt
 * das Poster an jedem Gerät.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const vi = await import(join(WURZEL, 'app/components/campaign/the-alpha-video-ios.js'));
const ra = await import(join(WURZEL, 'app/components/campaign/the-alpha-einrasten.js'));

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/141.0.7390.96 Mobile/15E148 Safari/604.1';
const SAMSUNG_CHROME =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36';
const MAC_SAFARI =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';

test('iPhone-Zweig: Safari und Chrome am iPhone, iPad als Mac; nie Android, nie Mac-Desktop', () => {
  assert.equal(vi.istIos({userAgent: IPHONE_SAFARI}), true);
  assert.equal(vi.istIos({userAgent: IPHONE_CHROME}), true);
  assert.equal(vi.istIos({userAgent: MAC_SAFARI, maxTouchPoints: 5}), true, 'iPadOS gibt sich als Mac aus');
  assert.equal(vi.istIos({userAgent: SAMSUNG_CHROME, maxTouchPoints: 5}), false);
  assert.equal(vi.istIos({userAgent: MAC_SAFARI, maxTouchPoints: 0}), false);
});

test('iosZweigAn: nur mit kleiner Quelle, ?video=alt schaltet ab', () => {
  const v = {dataset: {tapKlein: 'https://cdn/x.mp4'}};
  assert.equal(vi.iosZweigAn(v, {userAgent: IPHONE_SAFARI}, ''), true);
  assert.equal(vi.iosZweigAn(v, {userAgent: IPHONE_SAFARI}, '?video=alt'), false);
  assert.equal(vi.iosZweigAn({dataset: {}}, {userAgent: IPHONE_SAFARI}, ''), false);
  assert.equal(vi.iosZweigAn(v, {userAgent: SAMSUNG_CHROME}, ''), false);
});

test('Einrasten nur am iPhone (Android/Desktop wie live), ?rast=an/aus für Prüfer', () => {
  assert.equal(ra.einrastenAn({userAgent: IPHONE_SAFARI}, ''), true);
  assert.equal(ra.einrastenAn({userAgent: IPHONE_CHROME}, ''), true);
  assert.equal(ra.einrastenAn({userAgent: SAMSUNG_CHROME}, ''), false);
  assert.equal(ra.einrastenAn({userAgent: MAC_SAFARI}, ''), false);
  assert.equal(ra.einrastenAn({userAgent: SAMSUNG_CHROME}, '?rast=an'), true);
  assert.equal(ra.einrastenAn({userAgent: IPHONE_SAFARI}, '?x=1&rast=aus'), false);
  const prem = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(prem, /einrastenAn\(navigator, window\.location\.search\)/);
});

test('Daten und Verdrahtung: A trägt die kleine 480p-MP4, B/C nicht; Poster-Stufen nur ohne iPhone-Zweig', () => {
  const daten = lies('app/components/campaign/the-alpha-daten.js');
  const ohne = daten.slice(daten.indexOf('export const THE_ALPHA_FILM_OHNE_TEXT'));
  assert.match(ohne, /klein:\s*'https:\/\/cdn\.shopify\.com\/videos\/c\/vp\/[0-9a-f]+\/[0-9a-f]+\.SD-480p-[\d.]+Mbps-\d+\.mp4'/);
  const b = daten.slice(daten.indexOf('export const THE_ALPHA_VIDEO'), daten.indexOf('export const THE_ALPHA_FILM_OHNE_TEXT'));
  assert.doesNotMatch(b, /klein:/, 'B/C (THE_ALPHA_VIDEO) bleiben unverändert');
  const prem = lies('app/components/campaign/TheAlphaPremium.jsx');
  assert.match(prem, /data-tap-klein=\{video\.klein\}/);
  const ton = lies('app/components/campaign/TheAlphaTon.jsx');
  assert.match(ton, /const normal = alleVideos\.filter\(\(v\) => !iosZweigAn\(v, navigator, suche\)\)/);
  assert.match(ton, /const poster = \(\) => normal\.forEach/);
  assert.match(ton, /normal\.forEach\(vorladen\('metadata'\)\)/);
  assert.match(ton, /if \(!ios\.has\(v\)\) nah\.observe\(v\)/);
  assert.match(ton, /if \(iv\) iv\.abgelehnt\(\)/);
  const css = lies('app/styles/the-alpha-premium.css');
  assert.match(css, /\.tap-film-bild > img\.tap-film-notbild \{[^}]*position: absolute/);
});

/* ---- Verhalten mit nachgebauten Browser-Teilen ---- */
function welt({fetchOk = true} = {}) {
  const uhren = [];
  let jetzt = 0;
  const ereig = {};
  const fenster = {
    performance: {now: () => jetzt},
    setTimeout: (f, ms) => {
      uhren.push({f, um: jetzt + ms, id: uhren.length + 1});
      return uhren.length;
    },
    clearTimeout: (id) => {
      const u = uhren.find((x) => x.id === id);
      if (u) u.f = null;
    },
    addEventListener: (t, f) => ((ereig[t] = ereig[t] || []).push(f)),
    removeEventListener: () => {},
    URL: {createObjectURL: () => 'blob:klein', revokeObjectURL: () => {}},
    fetch: () =>
      fetchOk
        ? Promise.resolve({ok: true, headers: {get: () => '100'}, body: null, arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))})
        : new Promise(() => {}),
  };
  const kinder = [];
  const eltern = {
    insertBefore: (el) => kinder.push(el),
  };
  const vEreig = {};
  const attr = {};
  const v = {
    dataset: {tapKlein: 'https://cdn/klein.mp4', tapPoster: 'https://cdn/poster.jpg'},
    parentElement: eltern,
    nextSibling: null,
    offsetLeft: 0,
    offsetTop: 0,
    offsetWidth: 400,
    offsetHeight: 225,
    paused: true,
    currentTime: 0,
    preload: 'none',
    querySelectorAll: () => [{getAttribute: (n) => (n === 'type' ? 'video/mp4' : 'https://cdn/gross.mp4')}],
    addEventListener: (t, f) => ((vEreig[t] = vEreig[t] || []).push(f)),
    removeEventListener: () => {},
    removeAttribute: (n) => delete attr[n],
    getAttribute: (n) => attr[n] ?? null,
    load() {},
    set src(u) {
      attr.src = u;
    },
    get src() {
      return attr.src;
    },
    set poster(u) {
      attr.poster = u;
    },
  };
  const doc = {
    readyState: 'complete',
    createElement: () => {
      const cls = new Set();
      return {
        style: {},
        setAttribute() {},
        classList: {add: (c) => cls.add(c), remove: (c) => cls.delete(c), has: (c) => cls.has(c)},
        remove() {},
      };
    },
  };
  const lauf = async (ms) => {
    const ziel = jetzt + ms;
    for (;;) {
      await new Promise((r) => setImmediate(r));
      const u = uhren.filter((x) => x.f && x.um <= ziel).sort((a, b) => a.um - b.um)[0];
      if (!u) break;
      jetzt = u.um;
      const f = u.f;
      u.f = null;
      f();
    }
    jetzt = ziel;
    await new Promise((r) => setImmediate(r));
  };
  const feuer = (t) => (vEreig[t] || []).forEach((f) => f());
  return {fenster, doc, v, kinder, attr, lauf, feuer};
}

test('Normalfall: vorgeladen aus dem Speicher, nie ein Standbild, kein Poster', async () => {
  const w = welt();
  const gespielt = [];
  const iv = vi.bindeIosVideo(w.v, {spiele: (x) => gespielt.push(x), fenster: w.fenster, doc: w.doc});
  assert.equal(w.attr.poster, undefined, 'kein Poster vorab');
  await w.lauf(50);
  assert.equal(w.v.dataset.tapIos, 'blob', 'kleine MP4 liegt im Speicher, bevor das Video sichtbar ist');
  assert.equal(w.attr.src, 'blob:klein');
  iv.sichtbar();
  w.v.paused = false;
  w.v.currentTime = 0.1;
  w.feuer('timeupdate');
  await w.lauf(vi.NOTFALL_MS + 500);
  assert.equal(w.kinder.length, 0, 'kein Standbild');
  assert.equal(w.attr.poster, undefined);
  iv.aufraeumen();
});

test('Notfallplan: lädt nichts, liegt nach NOTFALL_MS das Standbild über dem Video; geht erst mit dem ersten Bild', async () => {
  const w = welt({fetchOk: false});
  const iv = vi.bindeIosVideo(w.v, {spiele: () => {}, fenster: w.fenster, doc: w.doc});
  await w.lauf(10);
  iv.sichtbar();
  await w.lauf(vi.NOTFALL_MS - 100);
  assert.equal(w.kinder.length, 0, 'vor der Frist kein Standbild');
  await w.lauf(200);
  assert.equal(w.kinder.length, 1, 'Standbild statt Schwarz');
  assert.equal(w.kinder[0].className, 'tap-film-notbild');
  assert.equal(w.attr.poster, 'https://cdn/poster.jpg');
  w.v.paused = false;
  w.v.currentTime = 0.2;
  w.feuer('timeupdate');
  assert.equal(w.kinder[0].classList.has('tap-film-notbild-weg'), true, 'Standbild geht, sobald das Bild läuft');
  iv.aufraeumen();
});

test('Notfallplan: lehnt iOS ab (Stromsparmodus), steht das Standbild sofort', async () => {
  const w = welt();
  const iv = vi.bindeIosVideo(w.v, {spiele: () => {}, fenster: w.fenster, doc: w.doc});
  await w.lauf(10);
  iv.sichtbar();
  iv.abgelehnt();
  assert.equal(w.kinder.length, 1);
  iv.aufraeumen();
});

test('Stromsparmodus: das stehende erste Bild (schwarz) zählt nicht als Film, das Standbild kommt trotzdem', async () => {
  const w = welt();
  const rueckrufe = [];
  w.v.requestVideoFrameCallback = (f) => rueckrufe.push(f);
  const iv = vi.bindeIosVideo(w.v, {spiele: () => {}, fenster: w.fenster, doc: w.doc});
  await w.lauf(10);
  iv.sichtbar();
  // WebKit meldet das erste dekodierte Bild auch bei stehendem Video
  rueckrufe.splice(0).forEach((f) => f());
  iv.abgelehnt();
  assert.equal(w.kinder.length, 1, 'Standbild statt Schwarz');
  assert.equal(rueckrufe.length, 1, 'wartet weiter auf ein laufendes Bild');
  w.v.paused = false;
  rueckrufe.splice(0).forEach((f) => f());
  assert.equal(w.kinder[0].classList.has('tap-film-notbild-weg'), true, 'Standbild geht mit dem ersten laufenden Bild');
  iv.aufraeumen();
});
