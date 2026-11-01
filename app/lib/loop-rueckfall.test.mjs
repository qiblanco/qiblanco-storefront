// Loop-Rückfall (lib/loop-rueckfall.js): wann tritt die Bildfolge an die
// Stelle des 360-Grad-Films? Lauf: node --test (findet *.test.mjs im Baum).
//
// Nachgestellt sind die Geräte, nicht der Browser: iOS mit Abspielsperre
// (play() -> NotAllowedError, autoplay greift nicht), iOS/Android/Desktop
// ohne Sperre, ein langsames Netz, ein Hintergrund-Tab und ein Film außerhalb
// des Fensters. Rückfall NUR bei Sperre (Christian 01.11.2026: Android und
// Desktop bleiben unverändert).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {starteLoop, LOOP_FRIST_MS} from './loop-rueckfall.js';

function uhrAttrappe() {
  let jetzt = 0;
  let n = 0;
  const wartend = new Map();
  return {
    setTimeout(fn, ms) {
      n += 1;
      wartend.set(n, {fn, bis: jetzt + ms});
      return n;
    },
    clearTimeout(id) {
      wartend.delete(id);
    },
    vor(ms) {
      const ziel = jetzt + ms;
      for (;;) {
        const faellig = [...wartend.entries()]
          .filter(([, w]) => w.bis <= ziel)
          .sort((a, b) => a[1].bis - b[1].bis)[0];
        if (!faellig) break;
        wartend.delete(faellig[0]);
        jetzt = faellig[1].bis;
        faellig[1].fn();
      }
      jetzt = ziel;
    },
  };
}

function filmAttrappe({sperre = false, readyState = 0} = {}) {
  const hoerer = {};
  const v = {
    paused: true,
    currentTime: 0,
    readyState,
    addEventListener(t, f) {
      (hoerer[t] ||= new Set()).add(f);
    },
    removeEventListener(t, f) {
      hoerer[t]?.delete(f);
    },
    feuere(t) {
      for (const f of [...(hoerer[t] || [])]) f();
    },
    play() {
      if (sperre) {
        const e = new Error('iOS: Geste noetig');
        e.name = 'NotAllowedError';
        return Promise.reject(e);
      }
      return new Promise(() => {});
    },
    // Gerät ohne Sperre: Daten da -> spielt -> Zeit läuft.
    spielt() {
      this.readyState = 4;
      this.feuere('canplay');
      this.paused = false;
      this.currentTime = 0.25;
      this.feuere('timeupdate');
    },
  };
  return v;
}

const tick = () => new Promise((r) => setImmediate(r));

test('iOS mit Abspielsperre: play() abgelehnt -> Rückfall sofort', async () => {
  const v = filmAttrappe({sperre: true});
  const gruende = [];
  starteLoop(v, (g) => gruende.push(g), {
    uhr: uhrAttrappe(),
    sichtbar: () => true,
  });
  await tick();
  assert.deepEqual(gruende, ['abgelehnt']);
});

test('iOS: autoplay greift nicht, play() hängt, Daten da -> Rückfall nach der Frist', async () => {
  const uhr = uhrAttrappe();
  const v = filmAttrappe();
  const gruende = [];
  starteLoop(v, (g) => gruende.push(g), {uhr, sichtbar: () => true});
  v.readyState = 4;
  v.feuere('canplay');
  uhr.vor(LOOP_FRIST_MS - 1);
  assert.deepEqual(gruende, []);
  uhr.vor(2);
  assert.deepEqual(gruende, ['steht']);
});

test('Android/Desktop: Film spielt -> nie ein Rückfall', async () => {
  const uhr = uhrAttrappe();
  const v = filmAttrappe();
  const gruende = [];
  starteLoop(v, (g) => gruende.push(g), {uhr, sichtbar: () => true});
  v.spielt();
  uhr.vor(60_000);
  await tick();
  assert.deepEqual(gruende, []);
});

test('langsames Netz: ohne Daten kein Rückfall, auch nach einer Minute', async () => {
  const uhr = uhrAttrappe();
  const v = filmAttrappe();
  const gruende = [];
  starteLoop(v, (g) => gruende.push(g), {uhr, sichtbar: () => true});
  uhr.vor(60_000);
  assert.deepEqual(gruende, []);
  v.spielt();
  uhr.vor(60_000);
  assert.deepEqual(gruende, []);
});

test('Hintergrund-Tab / außerhalb des Fensters: kein Rückfall, solange unsichtbar', async () => {
  const uhr = uhrAttrappe();
  const v = filmAttrappe();
  let sicht = false;
  const gruende = [];
  starteLoop(v, (g) => gruende.push(g), {uhr, sichtbar: () => sicht});
  v.readyState = 4;
  v.feuere('canplay');
  uhr.vor(30_000);
  assert.deepEqual(gruende, []);
  // Chrome startet ihn, sobald er ins Bild kommt -> nie ein Rückfall.
  sicht = true;
  v.paused = false;
  v.currentTime = 0.1;
  v.feuere('timeupdate');
  uhr.vor(30_000);
  assert.deepEqual(gruende, []);
});

test('Aufräumen beim Abbau: danach kein Rückfall mehr', async () => {
  const uhr = uhrAttrappe();
  const v = filmAttrappe();
  const gruende = [];
  const weg = starteLoop(v, (g) => gruende.push(g), {
    uhr,
    sichtbar: () => true,
  });
  v.readyState = 4;
  v.feuere('canplay');
  weg();
  uhr.vor(10_000);
  assert.deepEqual(gruende, []);
});

test('Naht: die Qi-Alpha-Kaufseite nutzt den Rückfall mit der Bildfolge aus den Daten', () => {
  const shop = readFileSync(
    new URL('../components/campaign/TheAlphaShop.jsx', import.meta.url),
    'utf8',
  );
  const daten = readFileSync(
    new URL('../components/campaign/the-alpha-shop-daten.js', import.meta.url),
    'utf8',
  );
  assert.match(shop, /starteLoop\(v, \(\) => setBildfolge\(true\)\)/);
  assert.match(shop, /src=\{loop\.bildfolge\}/);
  assert.match(daten, /bildfolge: `\$\{CDN\}\/files\/[^`]+\.webp/);
});
