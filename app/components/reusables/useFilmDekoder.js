import {useCallback, useEffect, useRef} from 'react';
import {filmAufLeinwand} from './film-dekoder';

/*
 * Apple-Upgrade für alle 360-Grad-Drehungen der Homepage (Christian
 * 01.11.2026: „Und bei den 360-Grad-Animationen ist es natürlich bei allen
 * anderen 360-Grad-Animationen auch so … für die gesamte Homepage ein
 * Apple-Upgrade“). Derselbe Weg wie auf der Qi-Alpha-Kaufseite
 * (TheAlphaShop.jsx BandLoop, PR #1208): Lehnt iOS den Film ab
 * (Stromsparmodus, „Video-Vorschauen automatisch abspielen“ aus), dekodiert
 * die Seite DENSELBEN Film über WebCodecs (iOS 16.4+) und zeichnet ihn in ein
 * Canvas an seiner Stelle (film-dekoder.js). Keine Bildfolge, kein Knopf.
 *
 * Für Bühnen mit Ersatzbild (video360-ersatzbild.jsx): Das Canvas liegt
 * absolut über Video und Ersatzbild und erscheint erst mit dem ersten
 * dekodierten Bild. Bis dahin bleibt das Ersatzbild stehen. Startet der Film
 * vorher doch noch (früher Tipp), gewinnt der Film und der Dekoder hört auf.
 * Darstellung (object-fit, mix-blend-mode, Radius) übernimmt das Canvas vom
 * Video, damit es in jeder Bühne genauso aussieht (z. B. `lighten` im Band
 * der Alpha-Vorlage).
 *
 * Bedienung: `abgelehnt()` dort aufrufen, wo der Aufrufer ein abgelehntes
 * play() bemerkt. `zeigt()` sagt dem Gesten-Weg, dass er nichts mehr tun
 * muss. Ohne WebCodecs (iOS < 16.4) und bei prefers-reduced-motion passiert
 * nichts; dann gilt der bisherige Weg (Start bei der ersten Berührung).
 *
 * GENAU EINE FASSUNG (Christian 15.11.2026, Z8: „beim kohärenten Wasser kommt
 * dann doch irgendwann ein Video, aber das ist in so einem Ghost-Modus“). Auf
 * den Produktseiten (Band der Alpha-Vorlage, QiBracelet/QiHome Air) trägt das
 * Video `mix-blend-mode: lighten`, und das Canvas übernimmt es. Ein mischendes
 * Canvas deckt nicht: darunter standen das Ersatzbild (Bild 0, Vorderansicht)
 * und das stehende Video mit seinem Poster, und `lighten` legte die drehende
 * Fassung über die stehende. Gemessen 15.11.2026 an qiblanco.com (WebKit,
 * iPhone, Stromsparmodus): Leinwand `spielt`, Ersatzbild Deckkraft 1, auf
 * QiOne 2 Pro, QiBracelet und QiHome Air; die Startseite mischt nicht
 * (`normal`) und war darum heil. Darum treten Ersatzbild und Video zurück
 * (visibility), solange ein mischendes Canvas zeigt; das Canvas mischt dann nur
 * noch mit dem Grund der Bühne, wie das laufende Video. Startet das echte Video
 * doch noch, gewinnt es immer: das Canvas tritt ab, Ersatzbild und Video kommen
 * zurück. Job 20261115-prio5-storefront-ios-3d-alle-produktseiten-ghost-weg-
 * ein-blase-anna-knopf-fest.
 */

/* Was unter einem mischenden Canvas durchscheinen würde: Ersatzbild und das
   stehende Video derselben Hülle. Gibt die Elemente mit ihrem alten Wert
   zurück, damit stoppen() genau den Zustand davor wiederherstellt. */
function untergrundVerbergen(leinwand) {
  const huelle = leinwand.parentElement;
  if (!huelle) return [];
  return [...huelle.querySelectorAll('video, [data-qb-ersatzbild]')].map((el) => {
    const vorher = el.style.visibility;
    el.style.visibility = 'hidden';
    return [el, vorher];
  });
}

/* Lage des Canvas in der Hülle (die Hülle ist position: relative). */
export const LEINWAND_STIL = Object.freeze({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  maxWidth: 'none',
  maxHeight: 'none',
  margin: 0,
  display: 'none',
  pointerEvents: 'none',
});

function ruheGewollt() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * @param {{current: HTMLVideoElement | null}} videoRef
 * @param {string | null | undefined} src MP4 (H.264) desselben Films
 * @param {boolean} [an]
 */
export function useFilmDekoder(videoRef, src, an = true) {
  const leinwandRef = useRef(null);
  const lage = useRef({dek: null, zeigt: false, verborgen: []});

  const stoppen = useCallback(() => {
    const z = lage.current;
    if (z.dek) z.dek.stopp();
    z.dek = null;
    z.zeigt = false;
    z.verborgen.forEach(([el, vorher]) => {
      el.style.visibility = vorher;
    });
    z.verborgen = [];
    const l = leinwandRef.current;
    if (l) {
      l.style.display = 'none';
      l.setAttribute('data-qb-dekoder', 'aus');
    }
  }, []);

  const abgelehnt = useCallback(() => {
    const z = lage.current;
    const v = videoRef.current;
    const l = leinwandRef.current;
    if (!an || !src || !v || !l || z.dek || ruheGewollt()) return;
    if (typeof window.VideoDecoder !== 'function') return;
    l.setAttribute('data-qb-dekoder', 'holt');
    z.dek = filmAufLeinwand(l, src, {
      buehne: l.parentElement,
      beiErstemBild: () => {
        if (!v.paused) {
          stoppen();
          return;
        }
        const s = window.getComputedStyle(v);
        l.style.objectFit = s.objectFit;
        l.style.mixBlendMode = s.mixBlendMode;
        l.style.borderRadius = s.borderRadius;
        if (s.mixBlendMode && s.mixBlendMode !== 'normal') {
          z.verborgen = untergrundVerbergen(l);
        }
        l.style.display = 'block';
        l.setAttribute('data-qb-dekoder', 'spielt');
        z.zeigt = true;
      },
      beiFehler: stoppen,
    });
  }, [an, src, videoRef, stoppen]);

  const zeigt = useCallback(() => lage.current.zeigt, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    // Startet der echte Film (früher Tipp, Gesten-Weg, Sicht-Beobachter),
    // gewinnt er, auch wenn das Canvas schon zeigt: nie zwei Fassungen.
    const beiFilm = () => {
      if (lage.current.dek) stoppen();
    };
    const ruhe =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    const beiRuhe = () => {
      if (ruhe && ruhe.matches) stoppen();
    };
    v.addEventListener('playing', beiFilm);
    ruhe?.addEventListener?.('change', beiRuhe);
    return () => {
      v.removeEventListener('playing', beiFilm);
      ruhe?.removeEventListener?.('change', beiRuhe);
      stoppen();
    };
  }, [videoRef, src, stoppen]);

  return {leinwandRef, abgelehnt, zeigt};
}
