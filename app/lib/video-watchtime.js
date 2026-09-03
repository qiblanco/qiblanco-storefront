/*
 * video-watchtime.js — Watchtime für YouTube-Einbettungen (Grossjob
 * 20260903-tracking-videowatchtime, Segment s04).
 *
 * WARUM ES DAS GIBT
 * -----------------
 * Ein YouTube-`<iframe>` ist von aussen stumm: kein `play`, kein `timeupdate`,
 * kein `currentTime`. Die Medien-Erfassung des Pixels (qpx v2.7, Segment s03)
 * misst deshalb an den drei Startseiten-Testimonials heute NICHTS — nur die
 * Verweildauer der umgebenden Sektion, was etwas anderes ist. Mit
 * `enablejsapi=1` beantwortet der Player Nachrichten und meldet seinen Zustand
 * zurück; erst damit gibt es überhaupt eine Watchtime.
 *
 * WARUM KEIN `https://www.youtube.com/iframe_api`
 * ----------------------------------------------
 * Die offizielle API ist ein NACHGELADENES Fremdskript (plus `www-widgetapi`).
 * Genau diese Player-Infrastruktur hat der Parallel-Auftrag
 * `20260903-BAU-vorausschauendes-laden` am selben Tag von der Startseite
 * entfernt (gemessen: 593.892 Byte im Median, bevor jemand geklickt hat). Sie
 * für eine Messung zurückzuholen wäre eine echte Verschlechterung der
 * Ladezeit — und der Auftrag dieses Segments verbietet das ausdrücklich.
 * Benutzt wird deshalb das `postMessage`-Protokoll, über das die offizielle
 * API selbst spricht: Handshake `{"event":"listening"}` an das iframe,
 * Antworten `onReady` / `onStateChange` / `infoDelivery`. Kosten: null Bytes
 * Netz, kein zusätzlicher Request.
 *
 * EHRLICHE GRENZE: dieses Protokoll ist nicht förmlich dokumentiert. Bleiben
 * die Antworten aus, passiert genau NICHTS — keine Ereignisse, kein Fehler,
 * kein Rückfall auf geratene Zahlen. Der Zustand ist dann derselbe wie heute
 * (keine Watchtime), nie ein falscher Wert.
 *
 * WAS GEMESSEN WIRD — und warum es dieselben fünf Konten sind
 * ----------------------------------------------------------
 * s03 führt die Abspielzeit je Zustand getrennt (`sichtbar_ton`,
 * `unsichtbar_ton`, `sichtbar_stumm`, `unsichtbar_stumm`, `hintergrund`), weil
 * eine Summe mit Etikett den Fall „weggescrollt, läuft mit Ton weiter" nicht
 * abbildet. Würde YouTube stattdessen EINE Zahl liefern, mischte die
 * Auswertung in s06 zwei verschiedene Grössen unter einer Spalte — genau der
 * Fehler, den `familie` verhindern soll. Die drei Signale sind dieselben:
 * `document.visibilityState`, ein IntersectionObserver (MRC: >= 50 % Fläche)
 * und der Ton-Zustand, den der Player in `infoDelivery.muted`/`volume`
 * mitliefert.
 *
 * Die Uhr läuft NUR während `playerState === 1` (abspielend) und wird bei
 * jedem eingehenden Ereignis, jedem Sichtbarkeits- und jedem Ton-Wechsel in
 * das gerade geltende Konto gebucht. Kein `setInterval`, kein Polling.
 *
 * Übergeben wird über die von s03 gebaute Naht `window.qpx.medien(eintrag)` —
 * kein zweites Skript, kein zweiter Netzweg, derselbe Flush (15 s +
 * `visibilitychange`). Der Kill-Schalter `QPX_CONFIG.medien = false` wirkt
 * damit auch hier: die Naht weist dann jeden Eintrag ab.
 */

const ZUSTAND_ABSPIELEND = 1;
const ZUSTAND_ENDE = 0;
const MRC_ANTEIL = 0.5;      // >= 50 % Fläche, wie in qpx.js
const MRC_MS = 2000;         // ... >= 2 s zusammenhängend
const QUARTILE = [25, 50, 75, 100];

/* Ein einziger Nachrichten-Empfänger für alle Player der Seite. Er entsteht
 * erst mit dem ersten angebundenen iframe — auf einer Seite ohne YouTube
 * kostet dieses Modul nichts als seine Bytes. */
let empfaengerLaeuft = false;
const spieler = [];          // {fenster, konto}

function jetzt() {
  return Date.now();
}

function istHoerbar(konto) {
  return konto.tonBekannt && !konto.stumm;
}

function zustandVon(konto) {
  if (konto.verdeckt) return 'hintergrund';
  if (konto.sichtbar) return istHoerbar(konto) ? 'sichtbar_ton' : 'sichtbar_stumm';
  return istHoerbar(konto) ? 'unsichtbar_ton' : 'unsichtbar_stumm';
}

/* Verstrichene Zeit in das GERADE GELTENDE Konto buchen und die Uhr neu
 * stellen. Wird vor jeder Zustandsänderung gerufen — sonst landete die Zeit
 * im falschen Konto. */
function buche(konto) {
  const t = jetzt();
  if (konto.spieltSeit && konto.spielt) {
    const delta = t - konto.spieltSeit;
    // Ein einzelnes Segment über 6 h ist ein Defekt, kein Zuschauer (dieselbe
    // Schranke, die qpx.js für die interne Erfassung zieht).
    if (delta > 0 && delta < 6 * 3600000) {
      const z = zustandVon(konto);
      konto.konten[z] = (konto.konten[z] || 0) + delta;
    }
  }
  konto.spieltSeit = konto.spielt ? t : 0;
}

function melde(konto, eintrag) {
  try {
    const qpx = typeof window !== 'undefined' && window.qpx;
    if (!qpx || typeof qpx.medien !== 'function') return false;
    return qpx.medien(eintrag);
  } catch {
    return false;
  }
}

function meldeStand(konto) {
  buche(konto);
  const summe = Object.keys(konto.konten).reduce((s, k) => s + konto.konten[k], 0);
  if (!summe && !konto.gestartet) return;
  const meta = {
    mrc: konto.mrc ? 1 : 0,
    obj_q: konto.objektQuelle,
    fam_q: 'anker',
    ton_bekannt: konto.tonBekannt ? 1 : 0,
  };
  for (const k of Object.keys(konto.konten)) meta[k] = Math.round(konto.konten[k]);
  if (konto.dauer) meta.dauer_s = Math.round(konto.dauer);
  melde(konto, {
    art: 'video_stand',
    obj: konto.objekt,
    fam: 'youtube',
    wert: Math.round(summe),
    zus: zustandVon(konto),
    meta,
  });
}

function pruefeQuartile(konto) {
  if (!konto.dauer || konto.dauer <= 0) return;
  const pct = (konto.position / konto.dauer) * 100;
  for (const q of QUARTILE) {
    if (pct + 0.5 < q || konto.quartile[q]) continue;
    konto.quartile[q] = 1;
    melde(konto, {
      art: 'video_quartil',
      obj: konto.objekt,
      fam: 'youtube',
      wert: q,
      zus: zustandVon(konto),
      meta: {zustand_marke: zustandVon(konto)},
    });
  }
}

/* MRC-Schwelle: erst >= 50 % Fläche >= 2 s zusammenhängend sichtbar macht aus
 * einem Vorbeiscrollen einen Start. Ohne sie beginnt die Verlaufskurve bei
 * einer erfundenen Grundmenge. */
function pruefeStart(konto) {
  if (konto.gestartet || !konto.spielt || !konto.mrc) return;
  konto.gestartet = 1;
  melde(konto, {
    art: 'video_start',
    obj: konto.objekt,
    fam: 'youtube',
    wert: 1,
    meta: {
      obj_q: konto.objektQuelle,
      fam_q: 'anker',
      ton_bekannt: konto.tonBekannt ? 1 : 0,
      dauer_s: konto.dauer ? Math.round(konto.dauer) : 0,
    },
  });
}

function aufNachricht(ev) {
  const eintrag = spieler.find((s) => s.fenster && s.fenster === ev.source);
  if (!eintrag) return;
  let d;
  try {
    d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
  } catch {
    return;
  }
  if (!d || typeof d !== 'object') return;
  const konto = eintrag.konto;
  const info = d.info && typeof d.info === 'object' ? d.info : null;

  if (d.event === 'onReady') konto.bereit = 1;

  let neuerLauf = konto.spielt;
  if (d.event === 'onStateChange') {
    const st = typeof d.info === 'number' ? d.info : (info && info.playerState);
    neuerLauf = st === ZUSTAND_ABSPIELEND;
    if (st === ZUSTAND_ENDE) {
      konto.position = konto.dauer || konto.position;
    }
  }
  if (info) {
    if (typeof info.duration === 'number' && info.duration > 0) konto.dauer = info.duration;
    if (typeof info.currentTime === 'number') konto.position = info.currentTime;
    if (typeof info.playerState === 'number') neuerLauf = info.playerState === ZUSTAND_ABSPIELEND;
    // Ton: der Player kennt seinen eigenen Zustand — anders als beim
    // <video>-Element ist das hier KEINE Browser-Feature-Detection, sondern
    // eine Auskunft des Abspielers über sich selbst.
    if (typeof info.muted === 'boolean' || typeof info.volume === 'number') {
      konto.tonBekannt = 1;
      konto.stumm = info.muted === true || info.volume === 0;
    }
  }

  if (neuerLauf !== konto.spielt) {
    buche(konto);
    konto.spielt = neuerLauf ? 1 : 0;
    konto.spieltSeit = neuerLauf ? jetzt() : 0;
  } else {
    buche(konto);
  }
  pruefeStart(konto);
  pruefeQuartile(konto);
  if (konto.gestartet) meldeStand(konto);
}

function empfaengerStarten() {
  if (empfaengerLaeuft || typeof window === 'undefined') return;
  empfaengerLaeuft = true;
  window.addEventListener('message', aufNachricht);
  const aufSichtbarkeit = () => {
    const verdeckt = document.visibilityState === 'hidden';
    for (const s of spieler) {
      buche(s.konto);
      s.konto.verdeckt = verdeckt ? 1 : 0;
      if (s.konto.gestartet) meldeStand(s.konto);
    }
  };
  document.addEventListener('visibilitychange', aufSichtbarkeit);
}

/**
 * Bindet ein YouTube-`<iframe>` an die Medien-Erfassung.
 *
 * @param {HTMLIFrameElement} iframe  das eingebettete iframe (mit enablejsapi=1)
 * @param {{objekt: string, objektQuelle?: string}} opts
 *        `objekt` ist der stabile Anker (data-video / data-section);
 *        `objektQuelle` sagt, WOHER er kommt — ein vom Menschen vergebener
 *        Anker und ein Notbehelf dürfen in der Auswertung nicht gleich wiegen.
 * @returns {() => void} Abmelder
 */
export function youtubeWatchtimeAnbinden(iframe, {objekt, objektQuelle = 'anker'} = {}) {
  if (typeof window === 'undefined' || !iframe || !objekt) return () => {};
  const konto = {
    objekt,
    objektQuelle,
    konten: {},
    quartile: {},
    spielt: 0,
    spieltSeit: 0,
    position: 0,
    dauer: 0,
    // Ohne Auskunft des Players gilt STUMM — dieselbe Fehlrichtung, die
    // video-ton.js und qpx.js gewählt haben: lieber eine fehlende Ton-Zeit
    // als eine erfundene. `ton_bekannt: 0` wird mitgemeldet.
    tonBekannt: 0,
    stumm: true,
    sichtbar: 0,
    verdeckt: typeof document !== 'undefined' && document.visibilityState === 'hidden' ? 1 : 0,
    mrc: 0,
    sichtbarSeit: 0,
    bereit: 0,
    gestartet: 0,
  };
  const eintrag = {fenster: null, konto};
  spieler.push(eintrag);
  empfaengerStarten();

  /* Handshake. Der Player antwortet erst, wenn er zuhört — bis `onReady` wird
   * er deshalb ein paar Mal angesprochen und dann nicht mehr. Kein Dauer-Timer. */
  let versuche = 0;
  let handschlag = 0;
  const anklopfen = () => {
    versuche += 1;
    try {
      const f = iframe.contentWindow;
      if (f) {
        eintrag.fenster = f;
        f.postMessage(
          JSON.stringify({event: 'listening', id: 1, channel: 'widget'}),
          'https://www.youtube.com',
        );
        f.postMessage(
          JSON.stringify({event: 'listening', id: 1, channel: 'widget'}),
          'https://www.youtube-nocookie.com',
        );
      }
    } catch {
      /* fremdes Fenster noch nicht bereit — beim nächsten Versuch wieder */
    }
    if (konto.bereit || versuche >= 8) {
      window.clearInterval(handschlag);
      handschlag = 0;
    }
  };
  anklopfen();
  handschlag = window.setInterval(anklopfen, 700);

  /* MRC-Sichtbarkeit am iframe selbst. */
  let io = null;
  if (typeof window.IntersectionObserver === 'function') {
    io = new window.IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          const sichtbar = e.isIntersecting && e.intersectionRatio >= MRC_ANTEIL;
          if (sichtbar === Boolean(konto.sichtbar)) continue;
          buche(konto);
          konto.sichtbar = sichtbar ? 1 : 0;
          if (sichtbar) {
            konto.sichtbarSeit = jetzt();
          } else {
            konto.sichtbarSeit = 0;
          }
        }
        if (konto.sichtbar && !konto.mrc && konto.sichtbarSeit &&
            jetzt() - konto.sichtbarSeit >= MRC_MS) {
          konto.mrc = 1;
        }
        pruefeStart(konto);
      },
      {threshold: [0, MRC_ANTEIL, 1]},
    );
    io.observe(iframe);
  } else {
    konto.sichtbar = 1;
    konto.mrc = 1;
  }

  /* Die MRC-Schwelle braucht eine Zeitkante — der Beobachter feuert nicht von
   * selbst nach 2 s. Genau EIN Timer je Video, danach nie wieder. */
  const mrcUhr = window.setTimeout(() => {
    if (konto.sichtbar) konto.mrc = 1;
    pruefeStart(konto);
  }, MRC_MS);

  return () => {
    window.clearInterval(handschlag);
    window.clearTimeout(mrcUhr);
    if (io) io.disconnect();
    const i = spieler.indexOf(eintrag);
    if (i >= 0) spieler.splice(i, 1);
  };
}

/**
 * Hängt `enablejsapi=1` an eine YouTube-Einbettungs-URL, ohne bestehende
 * Parameter (`start`, `si`, `controls`) zu verlieren. Idempotent.
 */
export function mitJsApi(url) {
  const s = String(url || '');
  if (!s || s.indexOf('enablejsapi=') >= 0) return s;
  const [ohneRaute, raute] = s.split('#');
  const trenner = ohneRaute.indexOf('?') >= 0 ? '&' : '?';
  return ohneRaute + trenner + 'enablejsapi=1' + (raute ? '#' + raute : '');
}
