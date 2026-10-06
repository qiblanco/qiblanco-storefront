import {useEffect, useState} from 'react';
import {stickySichtbar} from './sticky-lage';

/*
 * STICKY-KAUFKNOPF MOBIL (Rookie /pages/start-b, GS-081, Bestandteil Knöpfe).
 *
 * Ziel und Wortlaut wie der Kopf-Knopf von A (HerobannerFeatured: „Jetzt
 * kaufen“ auf /products/qione-2-pro), daneben der Produktname aus derselben
 * Stelle. Kein Preis, keine neue Aussage. Bauform wie der Sticky von LP B
 * (SchlafZellenSchutz.jsx, StickyKaufknopf): Name links, Knopf rechts.
 *
 * Ein Link, kein Warenkorb-Knopf: die Startseite führt auf die Kaufseite, wie
 * jeder Kaufknopf von A. Damit bleibt die Primär-KPI (Weiterklick auf die
 * Kaufseite) für beide Arme dieselbe Handlung.
 *
 * CHAT-BLASE (Hausregel, Lehre aus LP B 06.10.): KaufknopfChatSignal erkennt
 * jeden Link in <main> auf /products/<handle> mit Knopf-Optik und lässt die
 * geschlossene Blase weichen, solange sie ihn deckt. Das Signal misst bei
 * scroll/resize/childList. Deshalb steht der Inhalt NUR im sichtbaren Zustand
 * im DOM (Einhängen = childList), und er erscheint ohne Gleiten.
 *
 * Nur mobil (bis 749 px, rookie-start.css; dieselbe Grenze, an der der Kopf
 * einspaltig wird). Auf breiten Fenstern bleibt der Kasten leer und
 * unsichtbar.
 */
const ZIEL = '/products/qione-2-pro';

export function StickyKaufknopf({kopfSelektor, kaufknopfSelektor}) {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const kopf = document.querySelector(kopfSelektor);
    if (!kopf) return undefined;
    const knopf = kaufknopfSelektor ? document.querySelector(kaufknopfSelektor) : null;
    const fuss = document.querySelector('footer');
    const lage = {kopfImBild: true, kopfUnterkante: null, kaufknopfImBild: false, fussImBild: false};
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === kopf) {
          lage.kopfImBild = e.isIntersecting;
          lage.kopfUnterkante = e.boundingClientRect.bottom;
        } else if (e.target === knopf) {
          lage.kaufknopfImBild = e.isIntersecting;
        } else if (e.target === fuss) {
          lage.fussImBild = e.isIntersecting;
        }
      }
      setSichtbar(stickySichtbar(lage));
    });
    beobachter.observe(kopf);
    if (knopf) beobachter.observe(knopf);
    if (fuss) beobachter.observe(fuss);
    return () => beobachter.disconnect();
  }, [kopfSelektor, kaufknopfSelektor]);

  return (
    <div
      className={`qb-rs-sticky${sichtbar ? ' qb-rs-sticky--sichtbar' : ''}`}
      data-section="start-b-sticky-kaufknopf"
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <span className="qb-rs-sticky__name">QiOne® 2 Pro</span>
          <a className="btn--primary" href={ZIEL}>
            Jetzt kaufen
          </a>
        </>
      )}
    </div>
  );
}
