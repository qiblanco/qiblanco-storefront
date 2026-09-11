import {Link} from 'react-router';

/**
 * DER VERWEIS AUF DIE ABSICHT — einmal gebaut, mehrfach ausgeliefert.
 *
 * Auftrag 20260911-BAU-die-absicht-… : „Und sie wird von den anderen Flächen
 * aus erreichbar: Über-uns, Kritik, Erfahrungen, Startseite. Eine Absicht, auf
 * die nichts zeigt, wird nicht gefunden."
 *
 * WARUM EIN BAUTEIL UND NICHT DREI ABSÄTZE: der Verweis ist auf jeder Fläche
 * derselbe. Als drei Absätze wäre er dreimal zu pflegen und driftete ab dem
 * Tag, an dem jemand einen davon anfasst. Dieselbe Begründung wie beim
 * Autorenkasten (app/lib/autorenkasten.js).
 *
 * WARUM ER IM INHALT STEHT UND NICHT NUR IM FUSSMENÜ: ein Menüeintrag steht
 * auf JEDER Seite. Zählte man ihn als „Fläche", wäre die Zusage „von drei
 * Flächen verlinkt" durch einen einzigen Eintrag erfüllt und damit baulich
 * nicht mehr verletzbar — eine Prüfung, die strukturell nie rot werden kann,
 * misst nichts. Arm F der Wache zählt deshalb ausschließlich Verweise im
 * INHALT und ignoriert das Menü.
 *
 * ER BRINGT KEINE EIGENE TYPO-SKALA MIT. Die Gastgeberseiten haben eigene
 * Token-Systeme (.uu, .kr, .erf); ein Baustein mit eigenen Schriftgrößen
 * addierte auf jeder davon Größen und erzeugte genau den Befund, den die
 * Design-Rubrik als „zu viele Schriftgrößen" meldet. Er erbt deshalb Größe und
 * Farbe vom Gastgeber und bringt nur Struktur mit (app/styles/absicht.css,
 * Block `.ab-hinweis`).
 *
 * @param {{einleitung?: string}} p — der Satz davor darf je Fläche anders
 *   lauten, weil er an den Kontext der Gastgeberseite anschließt. Der LINK
 *   und sein Text sind überall gleich; nur die Überleitung ändert sich.
 */
export function AbsichtHinweis({einleitung}) {
  return (
    <aside className="ab-hinweis" data-absicht-hinweis>
      <p className="ab-hinweis-titel">Warum es Qi Blanco gibt</p>
      <p className="ab-hinweis-text">
        {einleitung ? `${einleitung} ` : ''}
        <Link className="ab-link" to="/pages/warum-qi-blanco" prefetch="intent">
          Christian Bernd Bauer hat aufgeschrieben, woran er seit zwanzig Jahren
          arbeitet und warum
        </Link>{' '}
        — in der ersten Person, ohne Verkaufstext.
      </p>
    </aside>
  );
}
