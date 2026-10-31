import {useEffect} from 'react';

/*
 * useBewegungImBild — Animationen starten, wenn der Leser sie sieht.
 *
 * Christian, 31.10.2026: „die hälfte der animaitonen funktioniert weider bei
 * anna meiner frau auf apple produkten nicht.“ Gemessen in WebKit und
 * Chromium: einmalige Animationen (Skala, Spektrum, Winkel) liefen beim
 * Seitenaufruf ab und waren fertig, lange bevor jemand hinscrollte. In jedem
 * Browser, nur sieht man es auf dem Handy am deutlichsten.
 *
 * Wirkung: nach dem Mount trägt jedes Element, das `auswahl` trifft,
 * data-bewegung="wartet" (die Seiten-CSS hält dann alle Animationen darin
 * an), und sobald es zu SCHWELLE im Bild ist, data-bewegung="spielt".
 * Laufende Animationen beginnen ab dann (einmalige spielen also einmal vor
 * den Augen des Lesers, Schleifen laufen weiter wie bisher).
 * Das untere Viertel des Bildschirms zählt nicht mit (RAND): eine Grafik,
 * die gerade erst unten hereinlugt, startet noch nicht. Gemessen 31.10.2026
 * (iPhone Chrome, 690 px hoch): mit 30 % am unteren Rand lief die Skala ab,
 * während der Leser noch die Grafik darüber ansah.
 * Rückfall: ohne JavaScript und ohne IntersectionObserver gibt es kein
 * Attribut, alles läuft wie vorher und endet im gezeichneten Endbild.
 */
const SCHWELLE = 0.3;
const RAND = '0px 0px -25% 0px';

export function useBewegungImBild(wurzelRef, auswahl) {
  useEffect(() => {
    const wurzel = wurzelRef.current;
    if (!wurzel || typeof window.IntersectionObserver !== 'function') return undefined;
    const elemente = Array.from(wurzel.querySelectorAll(auswahl));
    if (!elemente.length) return undefined;
    const starte = (el) => {
      el.setAttribute('data-bewegung', 'spielt');
      // Einmalige Animationen sind seit dem Seitenaufruf angehalten; vom
      // Anfang spielen, damit der Leser den Vorgang sieht, nicht das Ende.
      if (typeof el.getAnimations === 'function') {
        el.getAnimations({subtree: true}).forEach((a) => {
          const t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
          if (t && t.iterations !== Infinity) a.currentTime = 0;
        });
      }
    };
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        eintraege.forEach((e) => {
          if (e.isIntersecting) {
            beobachter.unobserve(e.target);
            starte(e.target);
          }
        });
      },
      {threshold: SCHWELLE, rootMargin: RAND},
    );
    elemente.forEach((el) => {
      el.setAttribute('data-bewegung', 'wartet');
      beobachter.observe(el);
    });
    return () => beobachter.disconnect();
  }, [wurzelRef, auswahl]);
}
