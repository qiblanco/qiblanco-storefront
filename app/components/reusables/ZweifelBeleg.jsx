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
 * unser Artefakt (KWD-0001).
 *
 * ZIEL GEÄNDERT AM 2026-08-31: von `/pages/wirkt-das` auf `/pages/studien`.
 * Christian hat die Zweifelseite wegen ihrer Textqualität zurückgezogen (raus
 * aus dem Menü, noindex, raus aus der Sitemap). Sie ist zwar weiterhin HTTP
 * 200, aber eine Seite, die zu schlecht für den Index ist, ist erst recht zu
 * schlecht für den Warenkorb — dort steht der Kunde unmittelbar vor der
 * Entscheidung. Die Zeile SELBST bleibt: der Zweifel, den sie adressiert, ist
 * unverändert da (12,8 % der Support-Vorgänge), und ihn wortlos zu lassen wäre
 * die schlechtere Antwort als ihn auf einen belastbaren Beleg zu führen.
 * `/pages/studien` ist öffentlich, ohne noindex und stand am 2026-08-14 auf
 * Platz 1 für „Qi Blanco Studien" — es ist der stärkste Beleg-Ort, den wir
 * haben.
 *
 * DER TEXT WURDE MITGEZOGEN, NICHT NUR DER LINK. Vorher versprach die Zeile
 * „samt ihrer Grenzen" — das löste die Zweifelseite ein, die Studienübersicht
 * tut es nicht. Ein Versprechen stehen zu lassen, dessen Ziel es nicht mehr
 * einlöst, ist derselbe Vertrauensbruch, den die Zeile eigentlich heilen soll.
 * Sie verspricht jetzt, was `/pages/studien` tatsächlich liefert: Volltext und
 * Original-PDF zum Selbstnachlesen.
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
  text = 'Wirkt das überhaupt? Lies die Studien im Volltext — mit Original-PDF, und urteile selbst.',
  className = '',
}) {
  return (
    <p className={`qb-zweifel ${className}`.trim()}>
      <Link to="/pages/studien" className="qb-zweifel__link">
        {text}
      </Link>
    </p>
  );
}
