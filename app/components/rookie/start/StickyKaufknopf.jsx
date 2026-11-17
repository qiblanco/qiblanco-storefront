import {mitMarkeR} from '~/components/reusables/MarkeR';
import {useKaufleisteSicht} from '~/lib/kaufleiste-sicht';
import {stickySichtbar} from './sticky-lage';

/*
 * STICKY-KAUFKNOPF MOBIL (Rookie /pages/start-b, GS-081, Bestandteil Knöpfe).
 *
 * Ziel und Wortlaut wie der Kopf-Knopf von A (HerobannerFeatured: „Jetzt
 * kaufen“ auf /products/qione-2-pro), daneben der Produktname aus derselben
 * Stelle. Keine neue Aussage; der Preis seit 17.11.2026 (unten). Bauform wie der Sticky von LP B
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
 * RUHIG (30.10.2026, Grossjob „Homepage gesamt prüfen“, s03): die Lage von Kopf und Kaufknopf
 * misst lib/kaufleiste-sicht.js gegen die kleine Bildschirmhöhe (100svh) mit
 * Hysterese, nicht mehr ein IntersectionObserver an der Fensterunterkante, die
 * auf dem iPhone mit den Browserleisten wandert („der rote Balken unten hüpft
 * noch“). Am Seitenende bleibt der Knopf stehen; rookie-start.css hält dem
 * Fuß darunter Platz frei.
 *
 * GESTALT WIE DIE KAUFLEISTE DER PRODUKTSEITEN (17.11.2026, Christian zur
 * Startseite: „unten bei dem Buy Now, da ist auch das QiOne 2 Pro noch komisch
 * formatiert“). Vorher brach „QiOne® / 2 Pro“ mobil zweizeilig um, das ® stand
 * in voller Größe, kein Preis. Jetzt wie DetailKaufleiste.jsx: Name in einer
 * Zeile mit kleinem hochgestelltem ® (mitMarkeR), der Preis klein darunter,
 * der Knopf rechts. Den Preis reicht die Seite herein (StartseiteApple aus
 * startseite-preise.js, derselbe Wert wie unter den anderen Kaufknöpfen der
 * Startseite); ohne Preis steht nur der Name. Lage und Abstände setzt das
 * Stylesheet der Seite (start-b-apple.css bzw. rookie-start.css).
 */
const ZIEL = '/products/qione-2-pro';
const NAME = 'QiOne® 2 Pro';

export function StickyKaufknopf({kopfSelektor, kaufknopfSelektor, preis = null}) {
  const sichtbar = useKaufleisteSicht(
    () => {
      const kopf = document.querySelector(kopfSelektor);
      if (!kopf) return null;
      const knopf = kaufknopfSelektor ? document.querySelector(kaufknopfSelektor) : null;
      return {kopf, knopf};
    },
    (lage) =>
      stickySichtbar({
        kopfImBild: lage.kopf.imBild,
        kopfUnterkante: lage.kopf.unten,
        kaufknopfImBild: lage.knopf.imBild,
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
          <span className="qb-rs-sticky__auswahl">
            <span className="qb-rs-sticky__name">{mitMarkeR(NAME)}</span>
            {preis ? <span className="qb-rs-sticky__preis">{preis}</span> : null}
          </span>
          <a className="btn--primary" href={ZIEL}>
            Jetzt kaufen
          </a>
        </>
      )}
    </div>
  );
}
