import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
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
 *
 * RUHIG (Grossjob vom 30.10.2026 „Homepage gesamt prüfen“, s03): die Lage von
 * Kopf, Kaufknopf und Fuß misst lib/kaufleiste-sicht.js gegen die kleine
 * Bildschirmhöhe (100svh) mit Hysterese, nicht mehr ein IntersectionObserver
 * an der Fensterunterkante, die auf dem iPhone mit den Browserleisten wandert
 * („der rote Balken unten hüpft noch“).
 */
const ZIEL = '/products/qione-2-pro';

export function StickyKaufknopf({kopfSelektor, kaufknopfSelektor}) {
  const sichtbar = useKaufleisteSicht(
    () => {
      const kopf = document.querySelector(kopfSelektor);
      if (!kopf) return null;
      const knopf = kaufknopfSelektor ? document.querySelector(kaufknopfSelektor) : null;
      return {kopf, knopf, fuss: document.querySelector('footer')};
    },
    (lage) =>
      stickySichtbar({
        kopfImBild: lage.kopf.imBild,
        kopfUnterkante: lage.kopf.unten,
        kaufknopfImBild: lage.knopf.imBild,
        fussImBild: lage.fuss.imBild,
      }),
    [kopfSelektor, kaufknopfSelektor],
  );

  return (
    <div
      className={`qb-rs-sticky${sichtbar ? ' qb-rs-sticky--sichtbar' : ''}`}
      data-section="start-b-sticky-kaufknopf"
      // Annas Kugel rutscht über die stehende Leiste (s03-r2, Christian 26.10.:
      // „muss das Gesicht flüssig nach oben rutschen“), kaufknopf-chat.js AUSWEICH_SELEKTOR.
      data-qb-chat-weicht={sichtbar ? '' : undefined}
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
