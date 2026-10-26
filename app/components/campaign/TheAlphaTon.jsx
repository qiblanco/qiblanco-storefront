import {useEffect, useState} from 'react';

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
 *   aus und halten an. iOS: audioSession „ambient“, damit der Stummschalter
 *   gilt und fremde Musik nicht abbricht.
 * - Video ([data-tap-video]): Poster sofort, die ersten Sekunden nach dem
 *   Laden der Seite im Leerlauf, der Rest kurz vor der Szene. Abspielen beim
 *   Erreichen der Szene, Pause beim Wegscrollen, am Handy inline. Hat das
 *   Video Ton und ist „Sound on“ an: Grundsound weich herunter (Ducking),
 *   Video-Ton an, danach wieder hoch. Ohne „Sound on“: stumm, Untertitel an,
 *   ein Ton-Symbol im Video schaltet ein.
 *
 * Klänge: public/the-alpha-ton/*.mp3, Eigenproduktion (additive Synthese wie
 * die Qi-Blanco-Reihe qb-ambient-* aus reel-musik), Rezept im Jobordner s06.
 */

const PFAD = '/the-alpha-ton/';
const SPEICHER = 'tap-ton'; // 'an' | 'aus' | 'gesehen'

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
  }

  melde() {
    this.hoerer.forEach((h) => h(this.zustand));
  }

  /** Muss synchron in der Geste laufen (iOS gibt Audio sonst nicht frei). */
  einschalten() {
    if (typeof window === 'undefined') return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      // iOS 16.4+: Stummschalter gilt, fremde Musik läuft weiter.
      if (navigator.audioSession) navigator.audioSession.type = 'ambient';
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
      // stiller Puffer in der Geste: schaltet Audio auf iOS frei
      const still = this.ctx.createBufferSource();
      still.buffer = this.ctx.createBuffer(1, 1, 22050);
      still.connect(this.ctx.destination);
      still.start(0);
    }
    this.ctx.resume();
    this.zustand = 'an';
    this.blende(this.master.gain, MASTER, 1.2);
    this.lade().then(() => this.starteBett());
    this.melde();
  }

  ausschalten() {
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
    this.blende(this.master.gain, MASTER, 0.8);
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
      fetch(`${PFAD}${name}.mp3`)
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
    this.blende(this.bett.gain, this.geduckt ? BETT_GEDUCKT : BETT, 4);
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
    this.blende(this.bett.gain, this.geduckt ? BETT_GEDUCKT : BETT, this.geduckt ? 0.8 : 2.5);
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

  // Stufe 1: nach dem Laden der Seite, im Leerlauf, die ersten Sekunden.
  const vorladen = (stufe) => (v) => {
    const rang = {none: 0, metadata: 1, auto: 2};
    if (rang[v.preload] >= rang[stufe]) return;
    v.preload = stufe;
    if (v.readyState === 0 && v.networkState !== 2) v.load();
  };
  const leerlauf = () => {
    const los = () => videos.forEach(vorladen('metadata'));
    if ('requestIdleCallback' in window) window.requestIdleCallback(los, {timeout: 2500});
    else window.setTimeout(los, 1200);
  };
  if (document.readyState === 'complete') leerlauf();
  else {
    window.addEventListener('load', leerlauf, {once: true});
    aufraeumen.push(() => window.removeEventListener('load', leerlauf));
  }

  // Stufe 2: anderthalb Bildschirme vor der Szene den Rest puffern.
  const nah = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        if (e.isIntersecting) {
          vorladen('auto')(e.target);
          nah.unobserve(e.target);
        }
      }
    },
    {rootMargin: '150% 0px 150% 0px'},
  );
  // Abspielen ab gut einem Drittel im Bild, Pause, wenn es fast weg ist.
  const szene = new IntersectionObserver(
    (eintraege) => {
      for (const e of eintraege) {
        const v = e.target;
        if (e.intersectionRatio >= 0.35 && !document.hidden) {
          v.dataset.tapImBild = '1';
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
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
  });

  const zustand = () => videos.forEach(tonSetzen);
  m.hoerer.add(zustand);
  const sicht = () => {
    for (const v of videos) {
      if (document.hidden) v.pause();
      else if (v.dataset.tapImBild) v.play()?.catch?.(() => {});
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
  wurzel.querySelectorAll('[data-tap-ton]').forEach((el) => {
    (el.hasAttribute('data-tap-marke') ? marke : ein).observe(el);
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
    ein.disconnect();
    marke.disconnect();
    m.hoerer.delete(zustand);
  };
}

function Lautsprecher({an}) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z" fill="currentColor" />
      {an ? (
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
          <path d="M18 6.8a7.4 7.4 0 0 1 0 10.4" />
        </g>
      ) : (
        <path
          d="M15.5 9.5l5 5m0-5l-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

/**
 * Ton der Film-Seite: „Sound on“-Fenster, Lautsprecher-Symbol, Motor,
 * Akzente, Videos. Rendert auf dem Server nichts (kein Einfluss auf den
 * ersten Bildschirm), im Browser erst nach dem Hydrieren.
 */
export function TapTon({wurzel}) {
  const [bereit, setBereit] = useState(false);
  const [zustand, setZustand] = useState('aus');
  // Fenster: null (nie) | 'auf' | 'zu' (schließt gerade) | 'weg'
  const [fenster, setFenster] = useState(null);

  useEffect(() => {
    const el = wurzel.current;
    if (!el) return undefined;
    const m = holeMotor();
    const hoerer = (z) => {
      setZustand(z);
      el.dataset.tapTonStand = z;
    };
    m.hoerer.add(hoerer);
    el.dataset.tapTonStand = m.zustand;
    const weg = [binde_akzente(el, m), binde_videos(el, m)];

    const gemerkt = lies();
    let zuTimer = null;
    let anGeste = null;
    if (!gemerkt) {
      setFenster('auf');
      zuTimer = window.setTimeout(() => {
        merke('gesehen');
        setFenster((f) => (f === 'auf' ? 'zu' : f));
      }, FENSTER_ZU_MS);
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
      window.clearTimeout(zuTimer);
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
  }, [wurzel]);

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
  const umschalten = () => {
    if (zustand === 'an') {
      merke('aus');
      m.ausschalten();
    } else tonAn();
  };

  return (
    <>
      {fenster && fenster !== 'weg' ? (
        <div
          className={`tap-ton-fenster${fenster === 'zu' ? ' tap-ton-fenster-zu' : ''}`}
          role="dialog"
          aria-label="Sound on"
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
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className={`tap-ton-schalter${zustand === 'an' ? ' tap-ton-schalter-an' : ''}`}
        onClick={umschalten}
        aria-pressed={zustand === 'an'}
        aria-label={zustand === 'an' ? 'Ton aus' : 'Ton an'}
      >
        <Lautsprecher an={zustand === 'an'} />
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
