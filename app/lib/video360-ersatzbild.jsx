import {useCallback, useEffect, useRef, useState} from 'react';

/*
 * Ersatzbild an jeder 360-Grad-Drehung (Christian, 01.10.2026):
 * „wichtig wäre immer, wenn das 360 Video nicht läuft, dass ein vollwertiges
 * Bild aus dem Video als Ersatz angezeigt wird, z.B. eine Frontansicht, und
 * beim QiBracelet ein gekonnter Winkel."
 *
 * Vertrag: claude-jobs/20261001-bau-360-video-ersatzbild-aus-dem-video-dach-und-us/
 * VERTRAG-ersatzlogik.md (gilt gleich fuer DACH und US). Die drei Bilder sind
 * Einzelbilder AUS dem jeweiligen Video (QiOne und QiHome Bild 0 = von vorn,
 * QiBracelet Bild 270 = schraeg von vorn, beide Enden und der Chip sichtbar),
 * 1080 x 1080, auf dem Shopify-CDN. Bewusst NICHT ueber imgix: das Bild darf
 * nicht vom Videodienst abhaengen, der gerade ausfaellt.
 *
 * Diese Datei ist die EINE Stelle fuer Adresse und Alt-Text — QiHome und
 * QiBracelet stehen auf drei Seiten (Kaufseite, /pages/-Fassung,
 * Exclusive Solutions), und zwei Literale fuer dasselbe Bild sind zwei Stellen,
 * von denen beim naechsten Austausch eine still veraltet.
 */
const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

export const ERSATZBILD_360 = {
  qione: {
    drehung: 'qione',
    bild: CDN + 'qb-video360-ersatzbild--360-qione-front--f0024fcab5ec.jpg?v=1790809389',
    alt: 'QiOne® 2 Pro von vorn, gebürsteter Edelstahl mit goldenem Chip',
  },
  qihome: {
    drehung: 'qihome',
    bild: CDN + 'qb-video360-ersatzbild--360-qihome-front--d19c273efe67.jpg?v=1790809394',
    alt: 'QiHome® Air von vorn, Holz und gebürsteter Edelstahl mit goldenem Chip',
  },
  qibracelet: {
    drehung: 'qibracelet',
    bild: CDN + 'qb-video360-ersatzbild--360-qibracelet-winkel--a26b001f0816.jpg?v=1790809401',
    alt: 'QiBracelet® schräg von vorn, offener Reif mit goldenem Chip',
  },
};

/* Native Kantenlaenge aller drei Bilder und Videos (1:1). */
export const ERSATZBILD_KANTE = 1080;

/* Das Video gilt erst als laufend, wenn currentTime nach `playing` um
   mindestens so viel vorangekommen ist. `canplay` reicht nicht: bei
   blockiertem Autoplay feuert es, und das Video steht. */
const LAEUFT_AB_S = 0.25;
/* So lange darf ein `waiting`/`stalled` ohne Fortschritt dauern, bevor das
   Bild zurueckkommt. */
const STOCKEN_MS = 1500;
/* Herzschlag, solange das Video als laufend gilt. Gemessen 01.10.2026
   (Chromium, hls.js, Segmente nach dem ersten gesperrt): currentTime stand
   fast 3 s still, bevor `waiting` kam — mit nur den Ereignissen kam das Bild
   erst nach 4,4 s zurueck. Der Herzschlag prueft selbst, ob die Zeit
   weiterlaeuft, und haengt damit an keinem Ereignis, das spaet oder nie
   kommt. Er laeuft NUR im Zustand 'video'. */
const HERZSCHLAG_MS = 500;

export function bevorzugtRuhe() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/*
 * useErsatzbild — die Zustandslogik EINMAL, fuer <ImgixVideo> (hls.js, imgix)
 * und <Produkt360Video> (mp4, Shopify-CDN).
 *
 * Start und Server-HTML: 'bild'. Wechsel zu 'video' erst nach echtem
 * Fortschritt. Zurueck zu 'bild' bei error, emptied, pause (die Spieler haben
 * keine Bedienelemente, eine Pause ist nie gewollt) und bei waiting/stalled,
 * wenn currentTime binnen STOCKEN_MS nicht weiterlaeuft — und ueber den
 * Herzschlag auch dann, wenn currentTime stillsteht, ohne dass eines dieser
 * Ereignisse (rechtzeitig) kommt. `zuBild` ist fuer die
 * Fehlerwege, die das <video> nicht selbst meldet (fataler hls.js-Fehler,
 * abgelehntes play()).
 *
 * `an=false`: keine Zuhoerer, Zustand bleibt 'bild' — fuer Aufrufer ohne
 * Ersatzbild, deren Verhalten sich nicht aendern darf.
 */
export function useErsatzbild(videoRef, an = true) {
  const [zustand, setZustand] = useState('bild');
  const startRef = useRef(null);

  const zuBild = useCallback(() => {
    startRef.current = null;
    setZustand('bild');
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !an) return;
    let wache = null;
    let herz = null;
    const wacheAus = () => {
      if (wache) clearTimeout(wache);
      wache = null;
    };
    const herzAus = () => {
      if (herz) clearInterval(herz);
      herz = null;
    };
    const herzAn = () => {
      if (herz) return;
      let letzteZeit = video.currentTime;
      let still = 0;
      herz = setInterval(() => {
        if (video.paused) return;
        if (video.currentTime !== letzteZeit) {
          letzteZeit = video.currentTime;
          still = 0;
          return;
        }
        still += HERZSCHLAG_MS;
        if (still >= STOCKEN_MS) {
          herzAus();
          zuBild();
        }
      }, HERZSCHLAG_MS);
    };

    const beiPlaying = () => {
      startRef.current = video.currentTime;
    };
    const beiZeit = () => {
      if (video.paused) return;
      // Das Video kann schon vor der Hydration angelaufen sein (Quelle im
      // Server-HTML, autoplay) — dann gab es fuer uns kein `playing`.
      if (startRef.current === null) {
        startRef.current = video.currentTime;
        return;
      }
      // `loop` springt an den Anfang zurueck: neu ansetzen statt nie zu wechseln.
      if (video.currentTime < startRef.current) {
        startRef.current = video.currentTime;
        return;
      }
      if (video.currentTime - startRef.current >= LAEUFT_AB_S) {
        wacheAus();
        herzAn();
        setZustand('video');
      }
    };
    const beiStocken = () => {
      wacheAus();
      const t = video.currentTime;
      wache = setTimeout(() => {
        wache = null;
        if (Math.abs(video.currentTime - t) < 0.01) {
          herzAus();
          zuBild();
        }
      }, STOCKEN_MS);
    };
    const beiAbbruch = () => {
      wacheAus();
      herzAus();
      zuBild();
    };

    const zuhoerer = [
      ['playing', beiPlaying],
      ['timeupdate', beiZeit],
      ['waiting', beiStocken],
      ['stalled', beiStocken],
      ['error', beiAbbruch],
      ['emptied', beiAbbruch],
      ['pause', beiAbbruch],
    ];
    zuhoerer.forEach(([name, f]) => video.addEventListener(name, f));
    return () => {
      wacheAus();
      herzAus();
      zuhoerer.forEach(([name, f]) => video.removeEventListener(name, f));
    };
  }, [videoRef, an, zuBild]);

  return {zustand, zuBild};
}

/*
 * Das Bild ueber dem Video. Liegt absolut auf der Huelle (die Huelle hat die
 * Groesse des Videos), weicht per opacity — nie per display:none, sonst
 * springen Layout und Laden. Die Stile stehen inline, damit kein Blatt auf
 * jeder Route mitlaedt (app.css) und die Seiten-Stile (Radius, Schatten der
 * jeweiligen Bild-Tokens) das <img> wie jedes andere Bild der Seite treffen.
 * Bewusst OHNE pointer-events:none: die Spieler haben keine Bedienelemente,
 * und ein Bild, das fuer Treffertests unsichtbar ist, ist auch fuer
 * elementsFromPoint unsichtbar — also fuer jede Messung, die fragt, was an
 * dieser Stelle zu sehen ist.
 * fetchpriority high: alle Einbindungen stehen im Kopfbereich, das Bild ist
 * dort das groesste Element beim ersten Malen.
 */
export function Ersatzbild({ersatz, zustand, objectFit = 'contain'}) {
  return (
    <img
      data-qb-ersatzbild=""
      src={ersatz.bild}
      alt={ersatz.alt}
      width={ERSATZBILD_KANTE}
      height={ERSATZBILD_KANTE}
      decoding="async"
      fetchPriority="high"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        maxWidth: 'none',
        maxHeight: 'none',
        margin: 0,
        objectFit,
        opacity: zustand === 'bild' ? 1 : 0,
        transition: 'opacity 200ms ease',
      }}
    />
  );
}
