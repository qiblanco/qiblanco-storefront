import {useEffect} from 'react';
import {messeKopfHoehe} from '~/components/reusables/GoogleRezensionenBereich';

/**
 * `--qb-kopf-hoehe-oben` für die Apple-Kaufseiten (AlphaVorlage): die Ruhelage
 * des festen Kopfes am Seitenanfang, egal ob gerade gescrollt wird.
 *
 * `--qb-kopf-hoehe` (useKopfHoeheVariable) trägt auch den Rand, den der Kopf
 * NUR gescrollt oben trägt (Header.jsx: `.header` marginTop scrolled ? 10px : 0).
 * Für Sprungziele ist das richtig, für einen ABSTAND im Seitenfluss nicht:
 * die erste Karte der Vorlage wuchs beim ersten Scroll um 10 px und die ganze
 * Seite sprang (gemessen 20.11.2026 auf /products/qihome-air: .av-seite
 * 163 -> 173 px; Christian Z4, Kanon preisanker-und-videokante.md Regel 4
 * „kein Springen“). Job
 * zusagen-20261025-design-repair-qihome-air-animation-schwarz--vollzug-ovd218dcd7cc.
 *
 * Bewusst hier und nicht in der globalen useKopfHoeheVariable: nur die
 * Vorlage liest den Wert (alpha-vorlage.css), andere Seiten bleiben
 * unberührt. Weitere Layout-Abstände derselben Klasse: Folgejob
 * 20261120-kopfhoehe-oben-alle-layout-abstaende-kein-scrollsprung.
 * Während des Übergangs liefern Rand und Kastenhöhe denselben Frame, die
 * Differenz bleibt konstant. Fällt der Wert aus, greift in der CSS der
 * Rückfall `--qb-kopf-hoehe` (Verhalten wie vorher).
 */
function kopfScrollRand() {
  const kopf = document.querySelector('.header-wrapper > .header');
  if (!kopf) return 0;
  const rand = parseFloat(window.getComputedStyle(kopf).marginTop);
  return Number.isFinite(rand) && rand > 0 ? rand : 0;
}

export function useKopfHoeheOben() {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const wurzel = document.documentElement;
    let offen = false;
    const schreibe = () => {
      offen = false;
      const h = messeKopfHoehe();
      if (h <= 0) return;
      wurzel.style.setProperty(
        '--qb-kopf-hoehe-oben',
        `${Math.round(Math.max(0, h - kopfScrollRand()))}px`,
      );
    };
    const anfordern = () => {
      if (offen) return;
      offen = true;
      window.requestAnimationFrame(schreibe);
    };
    schreibe();
    window.addEventListener('scroll', anfordern, {passive: true});
    window.addEventListener('resize', anfordern);
    window.addEventListener('orientationchange', anfordern);
    const beobachter =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(anfordern);
    if (beobachter) {
      for (const el of document.querySelectorAll('header, .header-wrapper, .announcement-bar')) {
        beobachter.observe(el);
      }
    }
    let aktiv = true;
    document.fonts?.ready?.then(() => {
      if (aktiv) anfordern();
    });
    return () => {
      aktiv = false;
      beobachter?.disconnect();
      window.removeEventListener('scroll', anfordern);
      window.removeEventListener('resize', anfordern);
      window.removeEventListener('orientationchange', anfordern);
      wurzel.style.removeProperty('--qb-kopf-hoehe-oben');
    };
  }, []);
}
