import {useEffect, useRef, useState} from 'react';

/*
 * THE ALPHA TON: Ton und Video der Film-Seite (Grossjob 20261026-prio1-the-
 * alpha-variante-a-designmeister-premium-gestaltung, Segment s06). Gebaut
 * EINMAL im geteilten Gerüst: TapSeite bindet <TapTon> ein, TapFilm trägt die
 * Video-Marken. A, B und C bekommen den Ton damit gleich.
 *
 * Christian 26.10.2026 (Z99–Z130): „Und idealerweise hat die Homepage noch
 * einen Soundtrack“, „dass man vielleicht einen Grundsound hat und dass an
 * gewissen Stelle dann noch ein Ton mit reinkommt“, „wenn man die Seite
 * aufmacht … kurzes Pop-up … Sound on“, und zu Lucas Video: „es muss
 * vorgeladen werden, wenn die User auf die Seite kommen, dass es nahtlos
 * abspielbar ist“.
 *
 * So läuft es:
 * - Beim Öffnen geht unten ein schwarzes „Sound on“-Fenster auf. Der Titel
 *   bleibt frei und lädt wie vorher (das Fenster rendert erst im Browser).
 *   Ein Tipp startet den Ton und ist zugleich die Geste, die Browser für Audio
 *   verlangen. Wer nicht tippt, hört nichts; das Fenster schließt sich nach
 *   ein paar Sekunden von selbst. Das Lautsprecher-Symbol bleibt immer da.
 *   Die Entscheidung gilt für die Sitzung (sessionStorage), das Fenster kommt
 *   nicht wieder.
 * - Audio lädt erst NACH „Sound on“ (kein Byte für Besucher ohne Ton).
 *   Web Audio: ein Grundsound in nahtloser Schleife, darüber je Szene einmal
 *   ein Akzent ([data-tap-ton] im Gerüst). Tab-Wechsel und Verlassen blenden
 *   aus und halten an. iOS: audioSession „playback“ (siehe NACHTRAG 30.10.).
 * - Video ([data-tap-video]): erst steht der Titel, dann kommt das Poster
 *   (erstes Scrollen oder 3,5 s nach dem Laden), mit dem ersten Scrollen die
 *   ersten Sekunden, anderthalb Bildschirme vor der Szene der Rest. Abspielen beim
 *   Erreichen der Szene, Pause beim Wegscrollen, am Handy inline. Hat das
 *   Video Ton und ist „Sound on“ an: Grundsound weich herunter (Ducking),
 *   Video-Ton an, danach wieder hoch. Ohne „Sound on“: stumm, Untertitel an,
 *   ein Ton-Symbol im Video schaltet ein.
 *
 * TON ALS STANDARD (nur A, TapSeite ton="an"; Christian 28.10.2026, Z6: „auf
 * dieser seite immer sound on … und den sound knopf auf die rechte seite
 * stellen dort wo normalerweise ai anna wäre“): kein „Sound on“-Fenster, der
 * Schalter steht rechts unten und zeigt „Ton an“. Hörbar wird es mit der
 * ersten Geste, die der Browser als Nutzer-Aktivierung zählt: Tippen, Klick,
 * Taste (pointerup/touchend/mousedown/keydown/click). Scrollen per Rad,
 * Trackpad oder Wischen zählt in Chrome, Safari und Firefox NICHT; das ist
 * Browser-Regel (Autoplay-Policy), keine Einstellung der Seite. Erlaubt ein
 * Browser Ton ohne Geste (Chrome bei hoher Media-Engagement-Zahl, Safari mit
 * „Automatische Wiedergabe: Alle erlauben“), läuft er sofort. Wer ausschaltet,
 * bleibt für die Sitzung bei „aus“.
 *
 * NACHTRAG 29.10.2026 (Christian: „sound on ist auf dem desktop immer noch
 * nicht live und auch der sound knopf ist nicht auf der rechten seite“):
 * Hält der Browser den Ton zurück, steht unter „Kohärentes Licht“ der Hinweis
 * „Sound On“, das X links (Christian 28.10.). Ein Tipp darauf ist die Geste;
 * das X heißt ohne Ton. Er geht, sobald der Ton hörbar ist oder die
 * Titelkarte weiterläuft. A lädt die Klänge in der -14-LUFS-Fassung
 * (QUELLE_LAUT, PEGEL_LAUT; Wunsch „lauter“).
 *
 * NACHTRAG 30.10.2026 (Christian: „Bei Anna I Phone 18 Pro funktioniert weder
 * der Sound noch das Video“, Chrome auf dem iPhone; Job 20261030-prio3-repair-
 * qi-alpha-video-sound-iphone-safari-echtgeraet-standard):
 * - TON: bis 30.10. stand die iOS-audioSession auf „ambient“, damit der
 *   Stummschalter gilt. Annas iPhone war stumm geschaltet (Glocke
 *   durchgestrichen auf ihrem Screenshot): der Schalter zeigte „Ton an“, zu
 *   hören war nichts. Jetzt „playback“ wie ein Video mit Ton: wer den Ton
 *   antippt, hört ihn, auch mit Stummschalter.
 * - VIDEO: iOS lehnt play() ohne Geste auch für ein stummes Video ab, wenn
 *   der Stromsparmodus an ist, „Video-Vorschauen automatisch abspielen“
 *   (Bedienungshilfen > Bewegung) aus ist oder das Gerät drosselt (WebKit,
 *   HTMLMediaElement.cpp / MediaElementSession.cpp:
 *   RequireUserGestureForVideoRateChange, …DueToLowPowerMode, …Thermal). Bis
 *   30.10. wurde diese Ablehnung still verschluckt und nie wiederholt: das
 *   Poster blieb stehen, auch nach jedem Tippen. Jetzt startet die nächste
 *   Berührung der Seite (auch der Ton-Schalter) das Video im Rahmen der
 *   Geste, und es wird erneut versucht, sobald die Szene fertig
 *   eingeblendet ist.
 *
 * Klänge: Shopify-CDN (Shopify Files, GL-PRO-0015: Medien nicht ins Repo),
 * Eigenproduktion (additive Synthese wie die Qi-Blanco-Reihe qb-ambient-* aus
 * reel-musik), Rezept und Originale im Jobordner s06 (nachher/ton/).
 */

// CDN-Adressen der Klänge, hochgeladen per medien-hosting/bin/cdn-upload
// (Segment s09). Ein neuer Klang: hochladen, URL hier eintragen.
const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
const QUELLE = {
  grundsound: `${CDN}grundsound.mp3?v=1793065581`,
  gong: `${CDN}gong.mp3?v=1793065573`,
  klang: `${CDN}klang.mp3?v=1793065586`,
  bam: `${CDN}bam.mp3?v=1793065565`,
  glanz: `${CDN}glanz.mp3?v=1793065569`,
  tief: `${CDN}tief.mp3?v=1793065594`,
  schluss: `${CDN}schluss.mp3?v=1793065591`,
};
// LAUTER, nur A (Ton als Standard; Christians Wunsch 28.10.: „lauter,
// -14 LUFS“). Dieselben Klänge, auf ax41 linear auf -14 LUFS integriert
// normiert (True Peak <= -1 dBTP, keine Dynamik verändert, Schleife des
// Grundsounds bleibt periodisch). Messung und Dateien im Jobordner
// 20261029-qi-alpha-lp-text-unter-video-abspann-zeilenweise-offene-wuensche.
// Vorher: -19 bis -29 LUFS je Datei, mal MASTER 0,5 also hörbar um -30 LUFS.
const QUELLE_LAUT = {
  grundsound: `${CDN}grundsound-14lufs.mp3?v=1793272271`,
  gong: `${CDN}gong-14lufs.mp3?v=1793272275`,
  klang: `${CDN}klang-14lufs.mp3?v=1793272281`,
  bam: `${CDN}bam-14lufs.mp3?v=1793272286`,
  glanz: `${CDN}glanz-14lufs.mp3?v=1793272290`,
  tief: `${CDN}tief-14lufs.mp3?v=1793272295`,
  schluss: `${CDN}schluss-14lufs.mp3?v=1793272301`,
};
// Pegel der lauten Fassung: Master voll, der Grundsound knapp unter den
// Akzenten (Z119 „darüber gemischt“), geduckt im selben Verhältnis wie sonst.
const PEGEL_LAUT = {master: 1, bett: 0.8, geduckt: 0.16};
const SPEICHER = 'tap-ton'; // 'an' | 'aus' | 'gesehen'
// Ereignisse, die Browser als Nutzer-Aktivierung zählen (HTML: „activation
// triggering input event“). pointerdown zählt nur mit der Maus, darum
// pointerup/touchend für Finger. Kein scroll/wheel/touchmove: zählt nirgends.
const GESTEN = ['pointerup', 'touchend', 'mousedown', 'keydown', 'click'];

// Lautstärke zurückhaltend (Z120). Gesamt 0,5; der Grundsound liegt darunter,
// die Akzente sind über ihm gemischt und nie laut (Z119).
const MASTER = 0.5;
const BETT = 0.6;
const BETT_GEDUCKT = 0.12;
// Schleife [0,5 s, 72,5 s]: die Datei ist exakt periodisch (T = 72 s), die
// Naht liegt so nie am Dateianfang, wo MP3-Decoder Vorlauf-Stille einfügen.
const SCHLEIFE = [0.5, 72.5];
const KLAENGE = {
  grundsound: 1,
  gong: 0.8,
  klang: 0.7,
  bam: 0.75,
  glanz: 1,
  tief: 0.8,
  schluss: 0.85,
};
const FENSTER_ZU_MS = 6000; // unbeachtet schließt das Fenster von selbst
// Beim Erstbesuch liegt der Cookie-Hinweis modal über der Seite. Ginge das
// Fenster sofort auf, liefe es unsichtbar darunter ab (live gemessen 27.10.,
// s09). Es wartet deshalb, bis die Cookie-Frage beantwortet ist.
const NACH_HINWEIS_MS = 400; // Atempause, nachdem der Hinweis zugeht
const OHNE_HINWEIS_MS = 5000; // kein Hinweis zu sehen: dann trotzdem auf
const HINWEIS_IDS = ['cookiebanner', 'CybotCookiebotDialog'];
const EINWILLIGUNG_EREIGNISSE = [
  'CookiebotOnAccept',
  'CookiebotOnDecline',
  'CookiebotOnConsentReady',
];

function einwilligungBeantwortet() {
  if (/(?:^|;\s*)CookieConsent=/.test(document.cookie)) return true;
  return Boolean(window.Cookiebot && window.Cookiebot.hasResponse);
}

function hinweisSichtbar() {
  return HINWEIS_IDS.some((id) => {
    const h = document.getElementById(id);
    if (!h) return false;
    const r = h.getBoundingClientRect();
    const s = window.getComputedStyle(h);
    return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden';
  });
}

/**
 * Ruft `los` auf, sobald die Cookie-Frage beantwortet ist (beide Motoren,
 * Cookiebot und der eigene Hinweis, feuern die Cookiebot-Ereignisse). Ist nach
 * OHNE_HINWEIS_MS kein Hinweis zu sehen (Skript blockiert), geht es trotzdem
 * los. Gibt die Aufräum-Funktion zurück.
 */
function nachEinwilligung(los) {
  if (einwilligungBeantwortet() && !hinweisSichtbar()) {
    los();
    return () => {};
  }
  let fertig = false;
  let pause = null;
  let notfall = null;
  let beiEreignis = null;
  const aufraeumen = () => {
    window.clearTimeout(notfall);
    EINWILLIGUNG_EREIGNISSE.forEach((e) => window.removeEventListener(e, beiEreignis));
  };
  const ende = () => {
    if (fertig) return;
    fertig = true;
    aufraeumen();
    los();
  };
  beiEreignis = () => {
    if (!einwilligungBeantwortet()) return;
    window.clearTimeout(pause);
    pause = window.setTimeout(ende, NACH_HINWEIS_MS);
  };
  const pruefe = () => {
    if (!hinweisSichtbar()) ende();
    else notfall = window.setTimeout(pruefe, 1000);
  };
  notfall = window.setTimeout(pruefe, OHNE_HINWEIS_MS);
  EINWILLIGUNG_EREIGNISSE.forEach((e) => window.addEventListener(e, beiEreignis));
  return () => {
    fertig = true;
    window.clearTimeout(pause);
    aufraeumen();
  };
}

function lies() {
  try {
    return window.sessionStorage.getItem(SPEICHER);
  } catch {
    return null;
  }
}

function merke(wert) {
  try {
    window.sessionStorage.setItem(SPEICHER, wert);
  } catch {
    /* privater Modus ohne Speicher: dann gilt die Entscheidung nur bis zum Neuladen */
  }
}

/**
 * Der Ton-Motor: ein AudioContext für die ganze Seite. Wird erst bei der
 * ersten Geste gebaut. Zustand: 'aus' | 'an'.
 */
class TonMotor {
  constructor() {
    this.zustand = 'aus';
    this.ctx = null;
    this.puffer = {};
    this.laden = null;
    this.bettQuelle = null;
    this.hoerer = new Set();
    this.geduckt = 0;
    this.warteAkzent = null;
    // Laute Fassung (A): vor dem ersten Laden gesetzt, gilt für die Seite.
    this.laut = false;
  }

  pegel(was) {
    if (this.laut) return PEGEL_LAUT[was];
    return {master: MASTER, bett: BETT, geduckt: BETT_GEDUCKT}[was];
  }

  melde() {
    this.hoerer.forEach((h) => h(this.zustand));
  }

  /** Muss synchron in der Geste laufen (iOS gibt Audio sonst nicht frei).
   * Ohne Geste aufgerufen (Ton als Standard) ist es ein Versuch: läuft der
   * AudioContext danach, erlaubt der Browser Ton ohne Geste; sonst bleibt
   * der Zustand 'aus', bis eine Geste kommt. 'an' heißt immer: hörbar. */
  einschalten() {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      // iOS 16.4+: „playback“ = hörbar auch mit Stummschalter, wie ein Video
      // mit Ton (NACHTRAG 30.10.; bis dahin „ambient“, Annas iPhone blieb stumm).
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch {
      /* nicht unterstützt */
    }
    if (!this.ctx) {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
      this.bett = this.ctx.createGain();
      this.bett.gain.value = 0;
      this.bett.connect(this.master);
    }
    this.gewollt = true;
    // stiller Puffer in der Geste: schaltet Audio auf iOS frei
    const still = this.ctx.createBufferSource();
    still.buffer = this.ctx.createBuffer(1, 1, 22050);
    still.connect(this.ctx.destination);
    still.start(0);
    const los = () => {
      if (this.gewollt && this.ctx.state === 'running') this.hoerbar();
    };
    const p = this.ctx.resume();
    if (p && p.then) p.then(los, () => {});
    los();
  }

  hoerbar() {
    if (this.zustand === 'an') return;
    this.zustand = 'an';
    this.blende(this.master.gain, this.pegel('master'), 1.2);
    this.lade().then(() => this.starteBett());
    this.melde();
  }

  ausschalten() {
    this.gewollt = false;
    this.zustand = 'aus';
    this.warteAkzent = null;
    if (this.ctx) {
      this.blende(this.master.gain, 0, 0.6);
      const ctx = this.ctx;
      window.setTimeout(() => {
        if (this.zustand === 'aus' && ctx.state === 'running') ctx.suspend();
      }, 700);
    }
    this.melde();
  }

  /** Tab weg / Seite verlassen: ausblenden und anhalten, Zustand bleibt. */
  ruhe() {
    if (!this.ctx || this.ctx.state !== 'running') return;
    this.blende(this.master.gain, 0, 0.25);
    const ctx = this.ctx;
    window.setTimeout(() => {
      if (document.hidden || this.zustand !== 'an') ctx.suspend();
    }, 300);
  }

  weiter() {
    if (!this.ctx || this.zustand !== 'an') return;
    this.ctx.resume();
    this.blende(this.master.gain, this.pegel('master'), 0.8);
  }

  blende(param, ziel, sekunden) {
    const jetzt = this.ctx.currentTime;
    param.cancelScheduledValues(jetzt);
    param.setValueAtTime(param.value, jetzt);
    param.linearRampToValueAtTime(ziel, jetzt + sekunden);
  }

  lade() {
    if (this.laden) return this.laden;
    const holen = (name) =>
      fetch((this.laut ? QUELLE_LAUT : QUELLE)[name])
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(r.status))))
        // Rückruf-Form: ältere Safari kennen das Promise von decodeAudioData nicht
        .then((daten) => new Promise((ok, fehler) => this.ctx.decodeAudioData(daten, ok, fehler)))
        .then((puffer) => {
          this.puffer[name] = puffer;
          if (this.warteAkzent?.name === name) {
            const w = this.warteAkzent;
            this.warteAkzent = null;
            if (performance.now() - w.seit < 2500) this.akzent(name);
          }
        })
        .catch(() => {
          /* ein fehlender Klang lässt den Rest der Seite in Ruhe */
        });
    // Grundsound zuerst, die Akzente parallel dazu (sie sind klein).
    this.laden = Promise.all(Object.keys(KLAENGE).map(holen));
    return this.laden;
  }

  starteBett() {
    const puffer = this.puffer.grundsound;
    if (!puffer || this.bettQuelle || !this.ctx) return;
    const q = this.ctx.createBufferSource();
    q.buffer = puffer;
    q.loop = true;
    q.loopStart = SCHLEIFE[0];
    q.loopEnd = Math.min(SCHLEIFE[1], puffer.duration);
    q.connect(this.bett);
    q.start(0, SCHLEIFE[0]);
    this.bettQuelle = q;
    this.blende(this.bett.gain, this.pegel(this.geduckt ? 'geduckt' : 'bett'), 4);
  }

  /** Ein Akzent, einmal. Ist der Klang noch nicht geladen (erster Gong direkt
   * nach dem Tipp), wird er kurz vorgemerkt statt verschluckt. */
  akzent(name, verzugMs = 0) {
    if (this.zustand !== 'an' || !this.ctx) return;
    const puffer = this.puffer[name];
    if (!puffer) {
      this.warteAkzent = {name, seit: performance.now()};
      return;
    }
    const g = this.ctx.createGain();
    g.gain.value = KLAENGE[name] ?? 0.7;
    g.connect(this.master);
    const q = this.ctx.createBufferSource();
    q.buffer = puffer;
    q.connect(g);
    q.start(this.ctx.currentTime + verzugMs / 1000);
  }

  /** Video mit Ton spielt: Grundsound weich herunter, danach wieder hoch. */
  ducken(an) {
    this.geduckt = Math.max(0, this.geduckt + (an ? 1 : -1));
    if (!this.ctx || !this.bettQuelle) return;
    this.blende(
      this.bett.gain,
      this.pegel(this.geduckt ? 'geduckt' : 'bett'),
      this.geduckt ? 0.8 : 2.5,
    );
  }
}

let motor = null;
function holeMotor() {
  if (!motor) motor = new TonMotor();
  return motor;
}

/** Hat ein Video hörbaren Ton? Daten-Feld `ton` gewinnt; fehlt es, misst der
 * Browser selbst (Lucas Reveal vom 26.10. ist stumm aufbereitet). */
function hatTon(v) {
  if (v.dataset.tapVideoTon === 'ja') return true;
  if (v.dataset.tapVideoTon === 'nein') return false;
  if (typeof v.mozHasAudio === 'boolean') return v.mozHasAudio;
  if (typeof v.webkitAudioDecodedByteCount === 'number') return v.webkitAudioDecodedByteCount > 0;
  if (v.audioTracks) return v.audioTracks.length > 0;
  return false;
}

/** Videos der Seite: Vorladen in Stufen, Abspielen in der Szene, Ton-Weiche. */
function binde_videos(wurzel, m) {
  const videos = [...wurzel.querySelectorAll('video[data-tap-video]')];
  if (!videos.length) return () => {};
  const aufraeumen = [];

  const tonSetzen = (v) => {
    const mitTon = m.zustand === 'an' && hatTon(v);
    const figur = v.closest('[data-tap-film]');
    if (figur) figur.classList.toggle('tap-film-hat-ton', hatTon(v));
    if (mitTon && v.muted && !v.paused) {
      m.ducken(true);
      v.dataset.tapGeduckt = '1';
      // erst den Grundsound senken, dann den Video-Ton öffnen (kein Sprung)
      window.setTimeout(() => {
        if (m.zustand === 'an' && !v.paused) v.muted = false;
      }, 500);
    } else if (!mitTon && !v.muted) {
      v.muted = true;
    }
    if (!mitTon && v.dataset.tapGeduckt) {
      delete v.dataset.tapGeduckt;
      m.ducken(false);
    }
    // Untertitel nur, solange der Ton des Videos nicht zu hören ist (Z127)
    for (const spur of v.textTracks || []) spur.mode = mitTon ? 'hidden' : 'showing';
  };

  for (const v of videos) {
    v.muted = true;
    const ende = () => {
      if (v.dataset.tapGeduckt) {
        delete v.dataset.tapGeduckt;
        m.ducken(false);
      }
    };
    const spielt = () => tonSetzen(v);
    // Ob Ton drin ist, weiß Chrome erst nach den ersten dekodierten Bytes.
    const zeit = () => {
      if (v.currentTime > 0.4) {
        v.removeEventListener('timeupdate', zeit);
        tonSetzen(v);
      }
    };
    // Pause: wieder stumm, damit der nächste Start erneut erst duckt, dann öffnet.
    const halt = () => {
      ende();
      v.muted = true;
    };
    v.addEventListener('playing', spielt);
    v.addEventListener('timeupdate', zeit);
    v.addEventListener('pause', halt);
    v.addEventListener('ended', ende);
    aufraeumen.push(() => {
      v.removeEventListener('playing', spielt);
      v.removeEventListener('timeupdate', zeit);
      v.removeEventListener('pause', halt);
      v.removeEventListener('ended', ende);
    });
  }

  // Stufe 1: das Poster, Stufe 2: die ersten Sekunden. Beides erst, wenn der
  // Titel steht: beim ersten Scrollen (der Besucher will weiter) oder 3,5 s
  // nach dem Laden. Gemessen 26.10. (Lighthouse Handy, je 5 Läufe): Poster im
  // HTML und Vorladen im Leerlauf kosteten +477 ms LCP, weil das Poster vor
  // dem Titel lud und Chrome über HLS bei „metadata“ schon ~6 MB holte.
  const vorladen = (stufe) => (v) => {
    const rang = {none: 0, metadata: 1, auto: 2};
    if (!v.poster && v.dataset.tapPoster) v.poster = v.dataset.tapPoster;
    if (rang[v.preload] >= rang[stufe]) return;
    v.preload = stufe;
    if (v.readyState === 0 && v.networkState !== 2) v.load();
  };
  let ersteStufe = false;
  const poster = () => videos.forEach((v) => {
    if (!v.poster && v.dataset.tapPoster) v.poster = v.dataset.tapPoster;
  });
  const gescrollt = () => {
    if (ersteStufe) return;
    ersteStufe = true;
    poster();
    videos.forEach(vorladen('metadata'));
  };
  let spaet = null;
  const geladen = () => {
    spaet = window.setTimeout(poster, 3500);
  };
  window.addEventListener('scroll', gescrollt, {passive: true, once: true});
  if (document.readyState === 'complete') geladen();
  else window.addEventListener('load', geladen, {once: true});
  aufraeumen.push(() => {
    window.clearTimeout(spaet);
    window.removeEventListener('scroll', gescrollt);
    window.removeEventListener('load', geladen);
  });

  // Stufe 2: anderthalb Bildschirme vor der Szene den Rest puffern, aber nie
  // vor dem ersten Scrollen. In der Szenen-Kette (Qi Alpha A, 31.10.) liegt das
  // Video im Dokument nah am Titel und war sonst schon beim Laden „nah“
  // (probe_video_a.py D1: 2 Video-Anfragen ohne Scrollen).
  const nahDa = new Set();
  const puffern = (v) => {
    vorladen('auto')(v);
    nah.unobserve(v);
    nahDa.delete(v);
  };
  const nah = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (!e.isIntersecting) nahDa.delete(e.target);
        else if (ersteStufe) puffern(e.target);
        else nahDa.add(e.target);
      }
    },
    {rootMargin: '150% 0px 150% 0px'},
  );
  const nachgeholt = () => [...nahDa].forEach(puffern);
  window.addEventListener('scroll', nachgeholt, {passive: true, once: true});
  aufraeumen.push(() => window.removeEventListener('scroll', nachgeholt));
  // Abspielen ab gut einem Drittel im Bild, Pause, wenn es fast weg ist.
  // Ein Video in einer Einblendung ([data-tap-ein]) startet erst, wenn es
  // eingeblendet ist; vorher liefe sein Anfang unsichtbar ab (bis 28.10.
  // ab 35 % im Bild, eingeblendet wird erst ganz im Bild).
  const eingeblendet = (v) => {
    const figur = v.closest('[data-tap-ein]');
    return !figur || !wurzel.classList.contains('tap-js') || figur.classList.contains('tap-sichtbar');
  };
  // Lehnt der Browser ab (iOS: Stromsparmodus, „Video-Vorschauen
  // automatisch abspielen“ aus; NACHTRAG 30.10.), bleibt das Poster stehen,
  // bis eine Geste kommt: dann startet nachholen() es im Rahmen der Geste.
  const spiele = (v) => {
    if (!v.dataset.tapImBild || document.hidden || !eingeblendet(v)) return;
    let p;
    try {
      p = v.play();
    } catch {
      // Manche iOS-Fassungen werfen hier, statt abzulehnen (WebKit-Bug 216887).
      v.dataset.tapWartetGeste = '1';
      return;
    }
    if (p && p.then) {
      p.then(
        () => delete v.dataset.tapWartetGeste,
        (e) => {
          if (e && e.name === 'NotAllowedError') v.dataset.tapWartetGeste = '1';
        },
      );
    }
  };
  const nachholen = () => {
    for (const v of videos) if (v.paused) spiele(v);
  };
  GESTEN.forEach((t) =>
    document.addEventListener(t, nachholen, {capture: true, passive: true}),
  );
  aufraeumen.push(() =>
    GESTEN.forEach((t) =>
      document.removeEventListener(t, nachholen, {capture: true}),
    ),
  );
  const szene = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        const v = e.target;
        if (e.intersectionRatio >= 0.35 && !document.hidden) {
          v.dataset.tapImBild = '1';
          spiele(v);
        } else if (e.intersectionRatio < 0.1) {
          delete v.dataset.tapImBild;
          if (!v.paused) v.pause();
        }
      }
    },
    {threshold: [0, 0.1, 0.35, 0.6]},
  );
  videos.forEach((v) => {
    nah.observe(v);
    szene.observe(v);
    const figur = v.closest('[data-tap-ein]');
    if (figur) {
      const wach = () => spiele(v);
      // Erneut, wenn die Einblendung fertig ist: beim Ereignis steht die
      // Szene noch auf Deckkraft 0.
      const fertig = (e) => {
        if (e.target === figur && v.paused) spiele(v);
      };
      figur.addEventListener('tap-sichtbar', wach);
      figur.addEventListener('transitionend', fertig);
      aufraeumen.push(() => {
        figur.removeEventListener('tap-sichtbar', wach);
        figur.removeEventListener('transitionend', fertig);
      });
    }
  });

  const zustand = () => videos.forEach(tonSetzen);
  m.hoerer.add(zustand);
  const sicht = () => {
    for (const v of videos) {
      if (document.hidden) v.pause();
      else spiele(v);
    }
  };
  document.addEventListener('visibilitychange', sicht);

  return () => {
    nah.disconnect();
    szene.disconnect();
    m.hoerer.delete(zustand);
    document.removeEventListener('visibilitychange', sicht);
    aufraeumen.forEach((f) => f());
  };
}

/** Szenen-Akzente: [data-tap-ton="gong|klang|bam|glanz|tief|schluss"], je
 * Element einmal. Gleiche Auslöse-Linien wie die Einblendungen in useTapFilm,
 * damit der Ton mit dem Bild kommt: Bühnen-Marken wie [data-tap-marke],
 * alles andere wie [data-tap-ein]. */
function binde_akzente(wurzel, m) {
  const gefeuert = new WeakSet();
  const sichtbar = new Set();
  const feuer = (el) => {
    if (gefeuert.has(el) || m.zustand !== 'an') return;
    gefeuert.add(el);
    m.akzent(el.dataset.tapTon, Number(el.dataset.tapTonVerzug || 0));
  };
  const rueckruf = (eintraege) => {
    for (const e of eintraege) {
      if (e.isIntersecting) {
        sichtbar.add(e.target);
        feuer(e.target);
      } else sichtbar.delete(e.target);
    }
  };
  const ein = new IntersectionObserver(rueckruf, {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.15,
  });
  const marke = new IntersectionObserver(rueckruf, {rootMargin: '0px 0px -45% 0px'});
  // Eine Bühne, deren erste Zeile schon vor dem Stillstand kommt (Szenen-
  // Fassung, useTapFilm), meldet das mit tap-akzent: Ton mit dem Bild.
  const vorab = (e) => feuer(e.currentTarget);
  wurzel.querySelectorAll('[data-tap-ton]').forEach((el) => {
    (el.hasAttribute('data-tap-marke') ? marke : ein).observe(el);
    if (el.hasAttribute('data-tap-marke')) el.addEventListener('tap-akzent', vorab);
  });
  // Ton geht an, während eine Szene im Bild ist (der Titel beim Tipp auf
  // „Sound on“): ihr Akzent kommt jetzt, nur der oberste, nie ein Stapel.
  const zustand = (z) => {
    if (z !== 'an') return;
    const offen = [...sichtbar].filter((el) => !gefeuert.has(el));
    offen.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    if (offen[0]) feuer(offen[0]);
  };
  m.hoerer.add(zustand);
  return () => {
    wurzel
      .querySelectorAll('[data-tap-marke][data-tap-ton]')
      .forEach((el) => el.removeEventListener('tap-akzent', vorab));
    ein.disconnect();
    marke.disconnect();
    m.hoerer.delete(zustand);
  };
}

/** Lautsprecher als Linie in der Strichstärke der Schrift (Challenger 26.10.:
 * ein gefülltes Symbol neben gesperrter, leichter Schrift wirkte schwer). */
function Lautsprecher({an}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" />
      {an ? (
        <>
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" />
        </>
      ) : (
        <path d="M15.5 9.5l5 5m0-5l-5 5" />
      )}
    </svg>
  );
}

function Kreuz() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/**
 * Ton der Film-Seite: „Sound on“-Fenster, Lautsprecher-Symbol, Motor,
 * Akzente, Videos. Rendert auf dem Server nichts (kein Einfluss auf den
 * ersten Bildschirm), im Browser erst nach dem Hydrieren.
 */
export function TapTon({wurzel, standard = 'fenster'}) {
  const tonStandard = standard === 'an';
  const [bereit, setBereit] = useState(false);
  const [zustand, setZustand] = useState('aus');
  // Was der Besucher will (Schalter-Anzeige), getrennt davon, ob es schon
  // hörbar ist (zustand). Ohne Ton-Standard fallen beide zusammen.
  const [wunsch, setWunsch] = useState(tonStandard ? 'an' : 'aus');
  // Fenster: null (nie) | 'auf' | 'zu' (schließt gerade) | 'weg'
  const [fenster, setFenster] = useState(null);
  const [oben, setOben] = useState(null);
  // „Sound On“-Hinweis bei Ton als Standard (A): null | 'auf' | 'zu' | 'weg'.
  const [hinweis, setHinweis] = useState(null);
  // Hörbar VOR dem Tipp auf den Schalter? (NACHTRAG 30.10.: dieselbe
  // Berührung gibt den wartenden AudioContext frei, React rendert „an“ noch
  // vor dem click, und der erste Tipp schaltete den Ton wieder aus.)
  const vorGeste = useRef(null);

  useEffect(() => {
    const el = wurzel.current;
    if (!el) return undefined;
    const m = holeMotor();
    const hoerer = (z) => {
      setZustand(z);
      el.dataset.tapTonStand = z;
      // Hörbar: der Hinweis hat seinen Zweck erfüllt und geht.
      if (z === 'an') setHinweis((h) => (h === 'auf' ? 'zu' : h));
    };
    m.laut = tonStandard;
    m.hoerer.add(hoerer);
    el.dataset.tapTonStand = m.zustand;
    const weg = [binde_akzente(el, m), binde_videos(el, m)];

    const gemerkt = lies();
    let zuTimer = null;
    let anGeste = null;
    let gesten = [];
    let warteHinweis = () => {};
    let hinweisWeg = () => {};
    if (tonStandard) {
      // Ton ist Standard (Z6): kein Fenster. Ausgeschaltet bleibt aus.
      const will = gemerkt !== 'aus';
      setWunsch(will ? 'an' : 'aus');
      el.dataset.tapTonWunsch = will ? 'an' : 'aus';
      if (will) {
        anGeste = (e) => {
          // Schalter und Hinweis regeln sich selbst (sonst schaltete derselbe
          // Tipp erst ein und dann wieder aus, und das X schaltete ein).
          if (e.target?.closest?.('.tap-ton-schalter, .tap-ton-hinweis')) return;
          if (lies() === 'aus' || m.zustand === 'an') return;
          m.einschalten();
        };
        gesten = GESTEN;
        gesten.forEach((t) => document.addEventListener(t, anGeste, {capture: true, passive: true}));
        const fertig = (z) => {
          if (z !== 'an') return;
          gesten.forEach((t) => document.removeEventListener(t, anGeste, {capture: true}));
          gesten = [];
          m.hoerer.delete(fertig);
        };
        m.hoerer.add(fertig);
        // Versuch ohne Geste: manche Browser erlauben Ton sofort.
        m.einschalten();
        // Hält der Browser den Ton zurück (Desktop ohne Klick, Christian
        // 29.10.: „sound on ist auf dem desktop immer noch nicht live“),
        // steht unter „Kohärentes Licht“ der Hinweis „Sound On“, X links
        // (Christian 28.10.). Erst nach der Cookie-Frage, sonst liefe er
        // unsichtbar unter dem Hinweis ab (s13, 27.10.). Er geht, sobald der
        // Ton hörbar ist, das X tippt oder die Titelkarte sich bewegt.
        warteHinweis = nachEinwilligung(() => {
          if (m.zustand === 'an' || lies() === 'aus') return;
          const titel = el.querySelector('.tap-hero-titel');
          const buehne = el.querySelector('.tap-titelkarte');
          if (!titel || !buehne) return;
          const r = titel.getBoundingClientRect();
          setOben(Math.round(Math.min(r.bottom + 48, window.innerHeight - 112)));
          setHinweis('auf');
          const pruefe = () => {
            if (buehne.getBoundingClientRect().bottom < window.innerHeight - 2) {
              setHinweis((h) => (h === 'auf' ? 'zu' : h));
            }
          };
          window.addEventListener('scroll', pruefe, {passive: true});
          hinweisWeg = () => window.removeEventListener('scroll', pruefe);
        });
      }
    } else if (!gemerkt) {
      warteHinweis = nachEinwilligung(() => {
        // Fester Abstand über dem Titel (48 px), nie höher als knapp unter den
        // Kopf: „Sound on“, dann „Kohärentes Licht“ (Z109/Z114, Challenger 26.10.).
        const titel = el.querySelector('.tap-hero-titel');
        const buehne = el.querySelector('.tap-titelkarte');
        if (titel && buehne) {
          const t = titel.getBoundingClientRect().top;
          const b = buehne.getBoundingClientRect().top;
          setOben(Math.round(Math.max(b + 24, t - 64 - 48)));
        }
        setFenster('auf');
        zuTimer = window.setTimeout(() => {
          merke('gesehen');
          setFenster((f) => (f === 'auf' ? 'zu' : f));
        }, FENSTER_ZU_MS);
      });
    } else if (gemerkt === 'an' && m.zustand !== 'an') {
      // Neu geladen mit „Sound on“: Browser verlangen wieder eine Geste. Die
      // erste Berührung der Seite startet den Ton, ohne neues Fenster.
      anGeste = () => {
        if (lies() === 'an' && m.zustand !== 'an') m.einschalten();
      };
      document.addEventListener('pointerdown', anGeste, {once: true, capture: true});
      document.addEventListener('keydown', anGeste, {once: true, capture: true});
    }

    const sicht = () => (document.hidden ? m.ruhe() : m.weiter());
    const verlassen = () => m.ruhe();
    document.addEventListener('visibilitychange', sicht);
    window.addEventListener('pagehide', verlassen);
    setBereit(true);

    return () => {
      warteHinweis();
      hinweisWeg();
      window.clearTimeout(zuTimer);
      gesten.forEach((t) => document.removeEventListener(t, anGeste, {capture: true}));
      if (anGeste) {
        document.removeEventListener('pointerdown', anGeste, {capture: true});
        document.removeEventListener('keydown', anGeste, {capture: true});
      }
      document.removeEventListener('visibilitychange', sicht);
      window.removeEventListener('pagehide', verlassen);
      m.hoerer.delete(hoerer);
      weg.forEach((f) => f());
      m.ausschalten();
    };
  }, [wurzel, tonStandard]);

  if (!bereit) return null;
  const m = holeMotor();

  const tonAn = () => {
    merke('an');
    m.einschalten();
    setFenster((f) => (f ? 'zu' : f));
  };
  const ohneTon = () => {
    merke('aus');
    setFenster('zu');
  };
  const wunschSetzen = (w) => {
    setWunsch(w);
    if (wurzel.current) wurzel.current.dataset.tapTonWunsch = w;
  };
  const merkeVorGeste = () => {
    vorGeste.current = m.zustand;
  };
  const umschalten = () => {
    const war = vorGeste.current ?? zustand;
    vorGeste.current = null;
    if (tonStandard && wunsch === 'an' && war !== 'an') {
      // „Ton an“ steht schon, es war nur noch nicht hörbar: dieser Tipp ist
      // die Geste, die der Browser verlangt.
      merke('an');
      m.einschalten();
    } else if (war === 'an' || (tonStandard && wunsch === 'an')) {
      merke('aus');
      m.ausschalten();
      if (tonStandard) wunschSetzen('aus');
    } else {
      tonAn();
      if (tonStandard) wunschSetzen('an');
    }
  };
  const an = tonStandard ? wunsch === 'an' : zustand === 'an';
  const hinweisAn = () => {
    merke('an');
    m.einschalten();
    setHinweis('zu');
  };
  const hinweisOhne = () => {
    merke('aus');
    m.ausschalten();
    wunschSetzen('aus');
    setHinweis('zu');
  };

  return (
    <>
      {tonStandard && hinweis && hinweis !== 'weg' ? (
        <div
          className={`tap-ton-hinweis${hinweis === 'zu' ? ' tap-ton-hinweis-zu' : ''}`}
          role="group"
          aria-label="Sound On"
          style={oben === null ? undefined : {top: `${oben}px`}}
          onAnimationEnd={() => {
            if (hinweis === 'zu') setHinweis('weg');
          }}
        >
          <button
            type="button"
            className="tap-ton-fenster-ohne"
            onClick={hinweisOhne}
            aria-label="Ohne Ton weiter"
          >
            <Kreuz />
          </button>
          <button type="button" className="tap-ton-fenster-an" onClick={hinweisAn}>
            <Lautsprecher an />
            <span>Sound On</span>
          </button>
        </div>
      ) : null}
      {fenster && fenster !== 'weg' ? (
        <div
          className={`tap-ton-fenster${fenster === 'zu' ? ' tap-ton-fenster-zu' : ''}`}
          role="dialog"
          aria-label="Sound on"
          style={oben === null ? undefined : {top: `${oben}px`}}
          onAnimationEnd={() => {
            if (fenster === 'zu') setFenster('weg');
          }}
        >
          <button type="button" className="tap-ton-fenster-an" onClick={tonAn}>
            <Lautsprecher an />
            <span>Sound on</span>
          </button>
          <button
            type="button"
            className="tap-ton-fenster-ohne"
            onClick={ohneTon}
            aria-label="Ohne Ton weiter"
          >
            <Kreuz />
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className={`tap-ton-schalter${an ? ' tap-ton-schalter-an' : ''}`}
        onPointerDown={merkeVorGeste}
        onClick={umschalten}
        aria-pressed={an}
        aria-label={an ? 'Ton aus' : 'Ton an'}
        data-tap-hoerbar={zustand === 'an' ? 'ja' : 'nein'}
      >
        <Lautsprecher an={an} />
      </button>
    </>
  );
}

/** Ton-Symbol im Video (nur sichtbar, wenn das Video Ton hat und „Sound on“
 * aus ist, siehe CSS): schaltet den Ton der ganzen Seite ein. */
export function TapFilmTon() {
  return (
    <button
      type="button"
      className="tap-film-ton"
      aria-label="Ton an"
      onClick={() => {
        merke('an');
        holeMotor().einschalten();
      }}
    >
      <Lautsprecher an={false} />
    </button>
  );
}

/** Quellen eines Videos: HLS zuerst (adaptiv, Safari/iOS), MP4 als Rückfall.
 * Bei Shopify-CDN-Videos liegt die HLS-Liste im selben Ordner
 * (…/vp/<id>/<id>.m3u8); ein Browser ohne HLS nimmt die MP4. */
export function videoQuellen(video) {
  const quellen = [];
  const hls =
    video.hls ||
    video.src.replace(
      /^(https:\/\/cdn\.shopify\.com\/videos\/c\/vp\/([0-9a-f]+)\/)\2\.[^/]+\.mp4$/,
      '$1$2.m3u8',
    );
  if (hls && hls !== video.src && hls.endsWith('.m3u8')) {
    quellen.push({src: hls, type: 'application/vnd.apple.mpegurl'});
  }
  quellen.push({src: video.src, type: 'video/mp4'});
  return quellen;
}

export default TapTon;
