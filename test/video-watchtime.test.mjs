// Hermetischer Test der YouTube-Watchtime-Anbindung (Grossjob
// 20260903-tracking-videowatchtime, Segment s04).
// Stil wie die uebrigen Dateien hier: node:test/node:assert als Bordmittel,
// KEIN Netz, kein neuer Runner, kein echter Browser.
// Ausführen: node --test test/video-watchtime.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT — und er war in der ersten Fassung
// dieses Baus drin, gefunden beim Nachlesen, nicht durch einen Fehlerbericht:
//   Die MRC-Schwelle ("≥ 50 % Fläche ≥ 2 s zusammenhängend sichtbar") hing an
//   EINEM Timer, der 2 s nach dem EINHÄNGEN lief. Ein IntersectionObserver
//   meldet aber nur ÄNDERUNGEN: wird ein Video sichtbar und bleibt es, kommt
//   genau ein Ereignis und danach nie wieder eines. Ein Video UNTERHALB DES
//   FALZES war zum Zeitpunkt des Timers noch unsichtbar — die Schwelle wurde
//   also nie erreicht, `video_start` nie gemeldet, kein Quartil je gebucht.
//   Getroffen hätte das ausgerechnet die drei Startseiten-Testimonials, um die
//   dieses Segment geht. Die Fehlerrichtung ist STILL: keine Ausnahme, kein
//   Log, kein falscher Wert — einfach nichts, und der Bau sähe gesund aus.
//
// DIE ZWEITE HÄLFTE, damit der Fix nicht ins Gegenteil kippt: die Schwelle
// verlangt 2 s ZUSAMMENHÄNGEND. Zweimal eine Sekunde Vorbeiscrollen darf
// keinen View erzeugen — deshalb wird die Uhr beim Verschwinden gelöscht.
//
// NICHT Gegenstand dieser Datei: ob YouTube das postMessage-Protokoll
// beantwortet (das ist Laufzeit und im Kopf von app/lib/video-watchtime.js als
// ehrliche Grenze benannt). Geprüft wird, was WIR daraus machen.

import {test} from 'node:test';
import assert from 'node:assert/strict';

/* --- gestubbte Umgebung mit stellbarer Uhr ------------------------------- */
function mkUmgebung() {
  let CLOCK = 1788000000000;
  const timeouts = new Map();
  const intervals = new Map();
  let id = 1;
  const gemeldet = [];
  const ioListe = [];
  const listener = {};

  const win = {
    qpx: {
      medien: (e) => {
        gemeldet.push(JSON.parse(JSON.stringify(e)));
        return true;
      },
    },
    setTimeout: (fn, ms) => {
      const k = id++;
      timeouts.set(k, {fn, faellig: CLOCK + ms});
      return k;
    },
    clearTimeout: (k) => timeouts.delete(k),
    setInterval: (fn, ms) => {
      const k = id++;
      intervals.set(k, {fn, ms});
      return k;
    },
    clearInterval: (k) => intervals.delete(k),
    addEventListener: (t, fn) => {
      (listener[t] = listener[t] || []).push(fn);
    },
    IntersectionObserver: function (cb) {
      const eintrag = {cb, ziele: []};
      ioListe.push(eintrag);
      return {
        observe: (el) => eintrag.ziele.push(el),
        disconnect: () => {},
      };
    },
  };
  const doc = {
    visibilityState: 'visible',
    addEventListener: (t, fn) => {
      (listener[t] = listener[t] || []).push(fn);
    },
  };

  return {
    win,
    doc,
    gemeldet,
    /* Zeit vorstellen UND alle faelligen Timer feuern. */
    uhr(ms) {
      CLOCK += ms;
      for (const [k, t] of [...timeouts]) {
        if (t.faellig <= CLOCK) {
          timeouts.delete(k);
          t.fn();
        }
      }
    },
    jetzt: () => CLOCK,
    sicht(ratio) {
      for (const io of ioListe) {
        io.cb(
          io.ziele.map((el) => ({
            target: el,
            isIntersecting: ratio > 0,
            intersectionRatio: ratio,
          })),
        );
      }
    },
    nachricht(fenster, daten) {
      for (const fn of listener.message || []) {
        fn({source: fenster, data: JSON.stringify(daten)});
      }
    },
    tab(zustand) {
      doc.visibilityState = zustand;
      for (const fn of listener.visibilitychange || []) fn({});
    },
  };
}

async function ladeModul(U) {
  globalThis.window = U.win;
  globalThis.document = U.doc;
  globalThis.Date.now = U.jetzt;
  // Cache-Buster: jeder Test bekommt eine frische Modul-Instanz, sonst teilen
  // sich die Faelle den modulweiten Empfaenger und die Spieler-Liste.
  return import('../app/lib/video-watchtime.js?t=' + Math.random());
}

const RAHMEN = () => ({contentWindow: {postMessage: () => {}}});
const nurArt = (l, art) => l.filter((e) => e.art === art);

test('mitJsApi hängt enablejsapi an, ohne Bestehendes zu verlieren', async () => {
  const U = mkUmgebung();
  const {mitJsApi} = await ladeModul(U);
  assert.equal(
    mitJsApi('https://www.youtube.com/embed/abc?si=xy&controls=0'),
    'https://www.youtube.com/embed/abc?si=xy&controls=0&enablejsapi=1',
  );
  assert.equal(
    mitJsApi('https://www.youtube.com/embed/abc'),
    'https://www.youtube.com/embed/abc?enablejsapi=1',
  );
  // idempotent — ein zweiter Durchlauf darf nichts doppeln
  const einmal = mitJsApi('https://www.youtube.com/embed/abc');
  assert.equal(mitJsApi(einmal), einmal);
  // ein Fragment bleibt hinten
  assert.equal(
    mitJsApi('https://www.youtube.com/embed/abc#t=5'),
    'https://www.youtube.com/embed/abc?enablejsapi=1#t=5',
  );
});

test('DER FALZ-FALL: ein Video, das erst spaet sichtbar wird, erreicht die MRC-Schwelle', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: 'youtube-testimonial-guse'});

  // 30 s lang unsichtbar (unterhalb des Falzes), Video läuft bereits
  U.uhr(30000);
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});
  assert.equal(
    nurArt(U.gemeldet, 'video_start').length,
    0,
    'ohne Sichtbarkeit darf es keinen Start geben',
  );

  // jetzt scrollt der Besucher hin
  U.sicht(0.9);
  U.uhr(1000);
  assert.equal(
    nurArt(U.gemeldet, 'video_start').length,
    0,
    'nach 1 s ist die MRC-Schwelle noch nicht erreicht',
  );

  U.uhr(1500); // zusammen 2,5 s sichtbar
  const start = nurArt(U.gemeldet, 'video_start');
  assert.equal(start.length, 1, 'nach 2 s sichtbar MUSS der Start kommen');
  assert.equal(start[0].obj, 'youtube-testimonial-guse');
  assert.equal(start[0].fam, 'youtube');
  assert.equal(start[0].meta.obj_q, 'anker');
});

test('2 s ZUSAMMENHAENGEND: zweimal eine Sekunde Vorbeiscrollen ist kein View', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: 'yt-vorbei'});
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});

  U.sicht(0.9);
  U.uhr(1000);
  U.sicht(0); // weggescrollt
  U.uhr(5000);
  U.sicht(0.9); // wieder da
  U.uhr(1000);
  assert.equal(
    nurArt(U.gemeldet, 'video_start').length,
    0,
    'zwei Haelften duerfen sich nicht zu einem View addieren',
  );
  U.uhr(1500);
  assert.equal(
    nurArt(U.gemeldet, 'video_start').length,
    1,
    'zusammenhaengend erreicht die Schwelle dann doch',
  );
});

test('Quartile kommen als Marken, jede genau einmal, in aufsteigender Folge', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: 'yt-q'});
  U.sicht(0.9);
  U.uhr(2500);
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});

  for (const t of [5, 26, 51, 76, 100]) {
    U.uhr(1000);
    U.nachricht(rahmen.contentWindow, {
      event: 'infoDelivery',
      info: {currentTime: t, duration: 100, playerState: 1, muted: false},
    });
  }
  const q = nurArt(U.gemeldet, 'video_quartil').map((e) => e.wert);
  assert.deepEqual(q, [25, 50, 75, 100]);

  // ein weiterer Tick auf derselben Stelle erzeugt keine zweite Marke
  const vorher = q.length;
  U.uhr(1000);
  U.nachricht(rahmen.contentWindow, {
    event: 'infoDelivery',
    info: {currentTime: 100, duration: 100, playerState: 1},
  });
  assert.equal(nurArt(U.gemeldet, 'video_quartil').length, vorher);
});

test('Die Zeit wird JE ZUSTAND gebucht, nicht summiert und etikettiert', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: 'yt-zustaende'});
  U.sicht(0.9);
  U.uhr(2500);

  const tick = (info) =>
    U.nachricht(rahmen.contentWindow, {event: 'infoDelivery', info});

  // sichtbar + Ton
  tick({currentTime: 1, duration: 100, playerState: 1, muted: false});
  U.uhr(4000);
  tick({currentTime: 5, duration: 100, playerState: 1, muted: false});
  // weggescrollt, Ton läuft weiter — der Fall, um den es Christian geht
  U.sicht(0);
  U.uhr(6000);
  tick({currentTime: 11, duration: 100, playerState: 1, muted: false});
  // stumm geschaltet, weiter unsichtbar
  tick({currentTime: 11, duration: 100, playerState: 1, muted: true});
  U.uhr(3000);
  tick({currentTime: 14, duration: 100, playerState: 1, muted: true});
  // Tab in den Hintergrund
  U.tab('hidden');
  U.uhr(5000);
  tick({currentTime: 19, duration: 100, playerState: 1, muted: true});

  const staende = nurArt(U.gemeldet, 'video_stand');
  assert.ok(staende.length > 0, 'es muss ein Stand gemeldet werden');
  const k = staende[staende.length - 1].meta;
  assert.ok(k.sichtbar_ton >= 4000, 'sichtbar_ton: ' + k.sichtbar_ton);
  assert.ok(k.unsichtbar_ton >= 6000, 'unsichtbar_ton: ' + k.unsichtbar_ton);
  assert.ok(k.unsichtbar_stumm >= 3000, 'unsichtbar_stumm: ' + k.unsichtbar_stumm);
  assert.ok(k.hintergrund >= 5000, 'hintergrund: ' + k.hintergrund);
  const belegt = [
    'sichtbar_ton',
    'unsichtbar_ton',
    'sichtbar_stumm',
    'unsichtbar_stumm',
    'hintergrund',
  ].filter((n) => k[n]);
  assert.ok(
    belegt.length >= 4,
    'ein Verlauf durch vier Zustaende muss vier Konten belegen, nicht eines: ' +
      JSON.stringify(belegt),
  );
});

test('Ohne Auskunft des Players gilt STUMM — und ton_bekannt=0 wird mitgemeldet', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: 'yt-stumm'});
  U.sicht(0.9);
  U.uhr(2500);
  // Zustandswechsel OHNE muted/volume — der Player sagt nichts über den Ton
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});
  U.uhr(3000);
  U.nachricht(rahmen.contentWindow, {
    event: 'infoDelivery',
    info: {currentTime: 3, duration: 100, playerState: 1},
  });
  const stand = nurArt(U.gemeldet, 'video_stand').pop();
  assert.equal(stand.meta.ton_bekannt, 0, 'unbekannter Ton wird als solcher gemeldet');
  assert.ok(!stand.meta.sichtbar_ton, 'ohne bekannten Ton wird KEINE Ton-Zeit gebucht');
  assert.ok(stand.meta.sichtbar_stumm > 0, 'die Zeit landet im stummen Konto');
});

test('Kein qpx auf der Seite: die Anbindung faellt still aus statt zu werfen', async () => {
  const U = mkUmgebung();
  delete U.win.qpx;
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  const ab = youtubeWatchtimeAnbinden(rahmen, {objekt: 'yt-ohne-pixel'});
  U.sicht(0.9);
  U.uhr(2500);
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});
  U.uhr(3000);
  ab();
  assert.equal(U.gemeldet.length, 0);
});

test('Ohne Anker wird nichts angebunden — ein Notbehelf wäre hier ein erfundener Name', async () => {
  const U = mkUmgebung();
  const {youtubeWatchtimeAnbinden} = await ladeModul(U);
  const rahmen = RAHMEN();
  youtubeWatchtimeAnbinden(rahmen, {objekt: ''});
  U.sicht(0.9);
  U.uhr(5000);
  U.nachricht(rahmen.contentWindow, {event: 'onStateChange', info: 1});
  assert.equal(U.gemeldet.length, 0);
});
