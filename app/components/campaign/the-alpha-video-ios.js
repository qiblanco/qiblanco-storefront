/*
 * IPHONE-VIDEO (Qi Alpha A, Lucas Reveal „The One Eye“). Job 20261101-prio1-
 * qi-alpha-lp-iphone-video-0-3s-standbild-nur-notfall-snap-r5, Christian
 * 01.11.2026, wörtlich:
 *  „das Video auf iPhone funktioniert, nur die Ladezeit ist extrem lang …
 *   man sieht das Standbild, … dann wird es schwarz … Und dann fängt erst
 *   das Video an zu laufen“
 *  „das Ziel höchstens eine Sekunde vom Sichtbarwerden bis zum Laufen, das
 *   ist mir zu wenig. Kannst du mal auf 0,3 Sekunden machen.“
 *  „ein Video, was von alleine anfängt, braucht eigentlich kein Standbild“
 *  „Wenn eben gar nichts lädt, ist natürlich ein Standbild besser als ein
 *   schwarzes Bild … das ist ja der perfekte Notfallplan.“
 *  „Besser finde ich eben die Idee des rechtzeitigen Laden, … weil die
 *   Homepage ja mit schwarzem Text anfängt.“
 *
 * URSACHE (bis 01.11.): videoQuellen() stellt die HLS-Liste vor die MP4.
 * iPhone (Safari UND Chrome, beide WebKit) nimmt HLS, und Shopifys Liste
 * beginnt mit 1080p (Spitze 12,6 Mbit/s); AVPlayer startet mit der ersten
 * Stufe. Zugleich lädt iOS vor play() keine Videodaten (preload wird auf
 * „metadata“ gekappt, WebKit MediaElementSession AutoPreloadingNotPermitted).
 * Das Laden begann also erst, wenn das Video sichtbar war, mit der größten
 * Stufe: Sekunden Standbild. Beim Start nimmt iOS das Poster weg, bevor das
 * erste Bild da ist: Schwarz. Das „Tippen“ war keine Bedingung, sondern die
 * Wartezeit (im Stromsparmodus lehnt iOS play() ohne Geste wirklich ab).
 *
 * WAS DIESER ZWEIG TUT (nur iPhone/iPad, Android und Desktop unverändert):
 *  - Rechtzeitig laden: kurz nach dem Laden der Seite, während der schwarze
 *    Text-Einstieg läuft, holt fetch() die kleine MP4 (480p, ~2,4 MB) ganz.
 *    fetch() unterliegt keiner Video-Ladesperre. Das Video spielt danach aus
 *    dem Speicher (blob:), der erste Bild kommt ohne Netz.
 *  - Hochwechseln: war die kleine Stufe schnell da, folgt die große (720p).
 *    Gewechselt wird nur, wo man es nicht sieht: bevor das Video je lief,
 *    wenn es pausiert (weggescrollt) oder am Schleifenanfang (der Film
 *    beginnt auf Schwarz).
 *  - Kein Standbild im Normalfall: das Video trägt kein Poster. Davor ist
 *    die Fläche schwarz wie die Seite.
 *  - Standbild nur als Notfallplan: kommt NOTFALL_MS nach dem Sichtbarwerden
 *    kein erstes Bild, lehnt iOS ab (Stromsparmodus) oder bricht das Video
 *    ab, liegt das Standbild über dem Video. Es geht erst, wenn das erste
 *    Bild WIRKLICH läuft: so gibt es kein Schwarz zwischen Bild und Film.
 *  - Kommt man vor der kleinen MP4 an (sehr schnell oder sehr langsames
 *    Netz), spielt die kleine MP4 direkt aus dem Netz (Low-Quality-Start).
 *  - Prüfschalter ?video=alt: alter Weg (HLS, Poster), zum Vergleich.
 */

// Ab Sichtbarwerden: so lange ohne erstes Bild, dann das Standbild.
export const NOTFALL_MS = 1500;
// Beim Sichtbarwerden ohne messbaren Fortschritt so lange auf die kleine MP4
// im Speicher warten, dann direkt aus dem Netz.
export const WARTEN_MS = 700;
// Erst so lange nach dem Binden holen, wenn das load-Ereignis noch fehlt
// (der Titel ist dann längst da; Bandbreite gehört vorher der Seite).
export const VORLADEN_SPAETESTENS_MS = 400;
// Große Stufe nur, wenn die kleine mindestens so schnell kam (Bit/s).
export const HOCH_AB_BPS = 4e6;

/** iPhone, iPod, iPad (auch iPadOS, das sich als Mac ausgibt). Chrome auf
 * dem iPhone (CriOS) ist WebKit und gehört dazu. */
export function istIos(nav) {
  if (!nav) return false;
  const ua = String(nav.userAgent || '');
  if (/iPhone|iPad|iPod/.test(ua)) return true;
  return /Macintosh/.test(ua) && Number(nav.maxTouchPoints || 0) > 1;
}

/** Soll der iPhone-Zweig dieses Video übernehmen? */
export function iosZweigAn(v, nav, suche) {
  if (!v || !v.dataset || !v.dataset.tapKlein) return false;
  if (/(^|[?&])video=alt(&|$)/.test(String(suche || ''))) return false;
  return istIos(nav);
}

/** Die MP4 der großen Stufe (die <source> mit video/mp4). */
export function hoheQuelle(v) {
  for (const s of v.querySelectorAll('source')) {
    if (/mp4/.test(s.getAttribute('type') || '')) return s.getAttribute('src');
  }
  return null;
}

/** Bindet ein Video. `spiele(v)` ist der Abspiel-Weg der Seite
 * (binde_videos: nur in der Szene, eingeblendet, sichtbar). Gibt das
 * Aufräumen zurück. */
export function bindeIosVideo(v, {spiele, fenster = window, doc = document} = {}) {
  const klein = v.dataset.tapKlein;
  const hoch = hoheQuelle(v);
  const notbildUrl = v.dataset.tapPoster;
  const figurBild = v.parentElement;
  const st = {
    phase: 'leer', // leer | holt | blob | netz
    blobKlein: null,
    blobHoch: null,
    url: null,
    erstesBild: false,
    lief: false,
    sichtbarSeit: 0,
    notTimer: 0,
    notbild: null,
    weg: false,
    abbruch: typeof AbortController === 'function' ? new AbortController() : null,
    // Fortschritt der kleinen MP4 (für die Entscheidung beim Sichtbarwerden)
    geholt: 0,
    gesamt: 0,
    holStart: 0,
    // Anwärmen: die aktuelle Quelle hat schon ein Bild geliefert (dekodiert)
    warm: false,
    waermt: false,
  };
  v.dataset.tapIos = 'leer';
  v.removeAttribute('poster');
  // preload bleibt „none“, bis eine eigene Quelle gesetzt ist: sonst holt
  // der Browser schon die Quellen der Seite (HLS/720p) und belegt die
  // Leitung, die die kleine MP4 braucht.

  const merke = (p) => {
    st.phase = p;
    v.dataset.tapIos = p;
  };

  const setzeQuelle = (url, phase) => {
    const alt = st.url;
    st.url = url;
    v.preload = 'auto';
    v.src = url;
    v.load();
    merke(phase);
    st.erstesBild = false;
    st.warm = false;
    if (alt && alt.startsWith('blob:') && alt !== url) fenster.URL.revokeObjectURL(alt);
    anwaermen();
  };

  // ANWÄRMEN, solange das Video noch nicht zu sehen ist: stumm abspielen bis
  // zum ersten Bild, dann anhalten und an den Anfang. Damit hat iPhone die
  // Daten geladen und den Dekoder offen, bevor man ankommt (iOS lädt vor
  // play() keine Videodaten). Der Film beginnt auf Schwarz: zu sehen ist
  // davon nichts, und die Szene steht ohnehin noch unsichtbar.
  function anwaermen() {
    if (st.sichtbarSeit || st.weg || st.warm) return;
    st.waermt = true;
    let p;
    try {
      p = v.play();
    } catch {
      st.waermt = false;
      return;
    }
    if (p && p.catch) {
      p.catch(() => {
        // Abgelehnt (Stromsparmodus) oder abgebrochen: beim Sichtbarwerden
        // greift der Notfallplan.
        st.waermt = false;
      });
    }
  }
  const warmFertig = () => {
    st.waermt = false;
    st.warm = true;
    v.dataset.tapIosWarm = st.phase;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      // vor den Metadaten nicht setzbar: egal, es steht am Anfang
    }
    // Erst, wenn der Speicher-Lauf auch nach dem ersten Bild fehlerfrei
    // bleibt (ein Gerät, das blob: nicht dekodiert, meldet es kurz danach).
    fenster.setTimeout(holeHoch, 800);
  };

  // Notfallplan: Standbild ÜBER dem Video, bis das erste Bild läuft.
  const notbildAn = (grund) => {
    if (st.erstesBild || st.weg || !notbildUrl || !figurBild) return;
    v.poster = notbildUrl;
    v.dataset.tapNotbild = grund;
    if (st.notbild) {
      st.notbild.classList.remove('tap-film-notbild-weg');
      return;
    }
    const img = doc.createElement('img');
    img.className = 'tap-film-notbild';
    img.src = notbildUrl;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.decoding = 'async';
    // Genau über dem Video (es ist schmaler als die Figur, wo der Text
    // darunter Platz braucht).
    img.style.left = `${v.offsetLeft}px`;
    img.style.top = `${v.offsetTop}px`;
    img.style.width = `${v.offsetWidth}px`;
    img.style.height = `${v.offsetHeight}px`;
    figurBild.insertBefore(img, v.nextSibling);
    st.notbild = img;
  };
  const notbildWeg = () => {
    if (!st.notbild) return;
    const img = st.notbild;
    st.notbild = null;
    img.classList.add('tap-film-notbild-weg');
    fenster.setTimeout(() => img.remove(), 400);
    v.removeAttribute('poster');
    delete v.dataset.tapNotbild;
  };

  const bildDa = () => {
    if (!st.sichtbarSeit && !v.dataset.tapImBild) {
      if (st.waermt) warmFertig();
      return;
    }
    if (st.erstesBild) return;
    st.erstesBild = true;
    st.lief = true;
    fenster.clearTimeout(st.notTimer);
    v.dataset.tapIosBild = '1';
    notbildWeg();
  };
  // Erstes Bild: requestVideoFrameCallback (Safari 15.4+), sonst die Zeit.
  // Nur ein LAUFENDES Bild zählt: steht das Video (Stromsparmodus lehnt
  // play() ab), meldet WebKit trotzdem das erste dekodierte Bild, und das ist
  // im Film schwarz. Dann weiter warten, das Standbild bleibt.
  const warteAufBild = () => {
    if (typeof v.requestVideoFrameCallback === 'function') {
      v.requestVideoFrameCallback(() => (v.paused ? warteAufBild() : bildDa()));
    }
  };
  const zeit = () => {
    if (v.currentTime > 0.04 && !v.paused) bildDa();
  };


  // Restzeit der kleinen MP4 nach bisherigem Tempo (ms), Infinity = unbekannt.
  const restMs = () => {
    if (!st.gesamt || !st.geholt) return Infinity;
    const ms = fenster.performance.now() - st.holStart;
    return ((st.gesamt - st.geholt) * ms) / st.geholt;
  };
  const insNetz = () => {
    if (st.abbruch) st.abbruch.abort();
    setzeQuelle(klein, 'netz');
  };
  // Sichtbarwerden: binde_videos ruft spiele(); wir merken die Zeit und
  // stellen die Notfall-Uhr. Ist die kleine MP4 noch nicht ganz da: kommt der
  // Rest schneller als NOTFALL_MS, warten wir auf sie (dann läuft das Video
  // aus dem Speicher); sonst spielt sie direkt aus dem Netz (Low-Quality-
  // Start: das Video beginnt, sobald die ersten Sekunden da sind).
  const sichtbar = () => {
    if (st.erstesBild || st.weg) return;
    if (!st.sichtbarSeit) st.sichtbarSeit = fenster.performance.now();
    if (st.phase === 'leer') insNetz();
    else if (st.phase === 'holt') {
      const rest = restMs();
      if (rest !== Infinity && rest > NOTFALL_MS) insNetz();
      else if (rest === Infinity) {
        // Noch kein Fortschritt messbar: kurz auf den Speicher warten.
        fenster.clearTimeout(st.wartTimer);
        st.wartTimer = fenster.setTimeout(() => {
          if (st.phase === 'holt' && !st.weg) {
            insNetz();
            spiele(v);
          }
        }, WARTEN_MS);
      }
    }
    fenster.clearTimeout(st.notTimer);
    st.notTimer = fenster.setTimeout(() => notbildAn('langsam'), NOTFALL_MS);
    warteAufBild();
  };

  const abgelehnt = () => notbildAn('abgelehnt');
  // Rückfallkette: blob (Speicher) -> kleine MP4 aus dem Netz -> Quellen der
  // Seite (HLS/MP4). Ein Video, das ein Gerät aus dem Speicher nicht
  // dekodiert, fällt beim Anwärmen auf, nicht erst vor den Augen des Kunden.
  const fehler = () => {
    if (st.weg) return;
    st.waermt = false;
    if (st.phase === 'blob' || st.phase === 'hoch') {
      st.blobHoch = null;
      st.blobDefekt = true;
      setzeQuelle(klein, 'netz');
      if (st.sichtbarSeit) spiele(v);
      return;
    }
    if (st.sichtbarSeit) notbildAn('fehler');
    if (v.getAttribute('src')) {
      v.removeAttribute('src');
      st.url = null;
      merke('quellen');
      v.load();
      if (st.sichtbarSeit) spiele(v);
    }
  };
  const pause = () => {
    // Nur wenn weggescrollt (binde_videos nimmt tapImBild weg, ehe es
    // anhält): Uhr zurück, jetzt unsichtbar hochwechseln. Eine Pause durch
    // Quellwechsel oder Anwärmen zählt nicht.
    if (v.dataset.tapImBild) return;
    st.sichtbarSeit = 0;
    fenster.clearTimeout(st.notTimer);
    wechsle();
  };
  let letzte = 0;
  const schleife = () => {
    const t = v.currentTime;
    if (t + 1 < letzte) wechsle(true);
    letzte = t;
  };

  const wechsle = (amAnfang = false) => {
    if (!st.blobHoch || st.phase === 'hoch') return;
    if (!amAnfang && !v.paused) return;
    const lief = !v.paused;
    setzeQuelle(st.blobHoch, 'hoch');
    if (lief) spiele(v);
  };

  // Ganz holen, mit Fortschritt (Stück für Stück), niedrige Priorität: der
  // Seitenaufbau geht vor.
  // Große Stufe erst, wenn die kleine aus dem Speicher nachweislich läuft
  // (angewärmt) und schnell kam.
  function holeHoch() {
    if (st.hochGeholt || !hoch || st.phase !== 'blob' || st.blobDefekt || v.error || st.weg) return;
    if (!(st.bps >= HOCH_AB_BPS)) return;
    st.hochGeholt = true;
    holen(hoch)
      .then(({url: g}) => {
        if (st.weg) return fenster.URL.revokeObjectURL(g);
        st.blobHoch = g;
        if (!st.lief) setzeQuelle(g, 'hoch');
        else wechsle();
        return undefined;
      })
      .catch(() => {});
  }

  const holen = (url, mitFortschritt = false) =>
    fenster
      .fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        priority: 'low',
        signal: st.abbruch ? st.abbruch.signal : undefined,
      })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        if (!mitFortschritt || !r.body || typeof r.body.getReader !== 'function') {
          const b = await r.arrayBuffer();
          return [b];
        }
        st.gesamt = Number(r.headers.get('content-length') || 0);
        const leser = r.body.getReader();
        const teile = [];
        for (;;) {
          // eslint-disable-next-line no-await-in-loop
          const {done, value} = await leser.read();
          if (done) break;
          teile.push(value);
          st.geholt += value.byteLength;
          // Sichtbar geworden, und der Rest dauert zu lange: ab ins Netz.
          if (st.sichtbarSeit && st.phase === 'holt' && restMs() > NOTFALL_MS) insNetz();
        }
        return teile;
      })
      .then((teile) => {
        const blob = new Blob(teile, {type: 'video/mp4'});
        return {url: fenster.URL.createObjectURL(blob), bytes: blob.size};
      });

  const vorladen = () => {
    if (st.phase !== 'leer' || st.weg) return;
    merke('holt');
    const t0 = fenster.performance.now();
    st.holStart = t0;
    holen(klein, true).then(
      ({url, bytes}) => {
        if (st.weg) return fenster.URL.revokeObjectURL(url);
        st.blobKlein = url;
        // Noch nicht angefangen (oder läuft noch nicht): aus dem Speicher.
        if (st.phase === 'holt' || (st.phase === 'netz' && !st.lief)) {
          setzeQuelle(url, 'blob');
          if (st.sichtbarSeit) spiele(v);
        }
        const ms = Math.max(1, fenster.performance.now() - t0);
        st.bps = (bytes * 8 * 1000) / ms;
        return undefined;
      },
      () => {
        // Abgebrochen (Netz-Start übernahm) oder fehlgeschlagen: der Netz-
        // Weg bleibt, sichtbar() setzt ihn spätestens beim Sichtbarwerden.
        if (st.phase !== 'holt') return;
        merke('leer');
        if (st.sichtbarSeit && !st.weg) {
          insNetz();
          spiele(v);
        }
      },
    ).catch(() => {});
  };

  // Los, sobald die Seite steht (load) oder spätestens kurz nach dem
  // Hydrieren; der erste Wisch startet es sofort.
  let frueh = 0;
  const los = () => {
    fenster.clearTimeout(frueh);
    vorladen();
  };
  if (doc.readyState === 'complete') fenster.setTimeout(los, 0);
  else fenster.addEventListener('load', los, {once: true});
  frueh = fenster.setTimeout(los, VORLADEN_SPAETESTENS_MS);
  fenster.addEventListener('scroll', los, {passive: true, once: true});

  const ereignisse = [
    ['playing', warteAufBild],
    ['timeupdate', zeit],
    ['timeupdate', schleife],
    ['error', fehler],
    ['pause', pause],
  ];
  ereignisse.forEach(([t, f]) => v.addEventListener(t, f));

  return {
    sichtbar,
    abgelehnt,
    aufraeumen() {
      st.weg = true;
      if (st.abbruch) st.abbruch.abort();
      fenster.clearTimeout(st.notTimer);
      fenster.clearTimeout(st.wartTimer);
      fenster.clearTimeout(frueh);
      fenster.removeEventListener('load', los);
      fenster.removeEventListener('scroll', los);
      ereignisse.forEach(([t, f]) => v.removeEventListener(t, f));
      [st.blobKlein, st.blobHoch].forEach((u) => u && fenster.URL.revokeObjectURL(u));
      if (st.notbild) st.notbild.remove();
    },
  };
}
