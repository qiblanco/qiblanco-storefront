import {Link} from 'react-router';

/**
 * ZweifelBeleg — eine Zeile, die den Beleg-Ort dorthin holt, wo der Zweifel
 * ENTSTEHT: an die Produktseite (vor dem Kauf) und in den Warenkorb (bei der
 * Entscheidung). Der Menüpunkt unter „Mehr" ist die Pflicht, das hier ist die
 * Wirkung — gemessen ist ein Menüpunkt ein schwacher Kanal, während 12,8 %
 * der Support-Vorgänge genau diese Frage stellen.
 *
 * WARUM EINE EIGENE KOMPONENTE UND NICHT ZWEI MAL DERSELBE JSX-BLOCK:
 * damit der Ziel-Pfad genau EINMAL im Repo steht. Ändert sich der Handle,
 * gibt es eine Stelle und nicht drei, die auseinanderlaufen können.
 *
 * WARUM DIE FRAGE UND NICHT DER SEITENNAME: der Kunde sucht keine „Seite
 * Wirkt das", er hat einen Zweifel. Die Zeile spricht seinen Zustand an, nicht
 * unser Artefakt (KWD-0001) — und sie verspricht ausdrücklich auch die
 * GRENZEN, weil genau das die Seite einlöst und ein bloßes „unsere Studien"
 * die Skepsis eher bestätigt als auflöst.
 *
 * Die Gestaltung liegt in app/styles/zweifel-beleg.css und wird von den
 * benutzenden Routen über ihren links()-Export geladen (Muster mm-lp.css) —
 * bewusst NICHT in der globalen app.css, siehe Begründung dort.
 *
 * @param {{
 *   text?: string,
 *   className?: string,
 * }} props
 */
export function ZweifelBeleg({
  text = 'Wirkt das überhaupt? Wir legen unsere Belege offen — samt ihrer Grenzen.',
  className = '',
}) {
  return (
    <p className={`qb-zweifel ${className}`.trim()}>
      <Link to="/pages/wirkt-das" className="qb-zweifel__link">
        {text}
      </Link>
    </p>
  );
}
