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
 */

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
  const lage = useRef({dek: null, zeigt: false});

  const stoppen = useCallback(() => {
    const z = lage.current;
    if (z.dek) z.dek.stopp();
    z.dek = null;
    z.zeigt = false;
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
    // Ein früher Tipp startet den Film, bevor der Dekoder sein erstes Bild hat.
    const beiFilm = () => {
      if (lage.current.dek && !lage.current.zeigt) stoppen();
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
