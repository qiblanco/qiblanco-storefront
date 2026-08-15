import {StudienSlider} from '~/components/reusables/StudienSlider';

/*
 * StudienCards — der Studien-Block der QiOne-2-Pro-Produktseite.
 *
 * ── 2026-08-15, Job 20260814-studien-slider-5-... s03: KOPIE AUFGELOEST ─────
 * Diese Datei war eine vollstaendige KOPIE des Studien-Sliders: dasselbe
 * `.ghx-studien`-Markup, dasselbe hartkodierte Vier-Studien-Array, dieselbe
 * Fussnote, derselbe Button — dazu ein zweites Mal alle `.ghx-*`-CSS-Regeln,
 * inline als <style>-Block mit `.qione-studien-cards`-Praefix.
 *
 * IHRE BEGRÜNDUNG WAR ZUM ZEITPUNKT DES BAUS RICHTIG und ist es heute nicht
 * mehr. Der Kopfkommentar sagte woertlich: "eigenstaendig mit colocated +
 * gescoptem CSS ... So funktioniert die Darstellung auf den QiOne-2-Pro-Seiten
 * ohne das exclusive-solutions-Stylesheet." Genau diese Lage hat sich am
 * 2026-07-27 geaendert: mit dem Umzug des Sliders nach
 * reusables/StudienSlider.jsx sind die `.ghx-studien*`-Regeln nach
 * app/styles/app.css gewandert, und app.css lädt das root-Layout GLOBAL.
 * Der Grund für die Kopie ist damit entfallen — geblieben wäre nur ihr
 * Preis: eine fuenfte Studie haette hier ein zweites Mal gepflegt werden
 * müssen, und ausgerechnet die wichtigste Produktseite haette sonst weiter
 * vier Studien gezeigt.
 *
 * NEBENBEI BEHOBEN: die Kopie kannte `useDragSwipe` nicht. Auf
 * /pages/qione-2-pro liess sich der Streifen bisher NICHT mit der Maus ziehen
 * (nur Pfeile + natives Touch-Wischen). Über den geteilten Slider gilt dort
 * jetzt derselbe Baustandard GL-DES-0012 wie ueberall sonst.
 *
 * Der Name und die Signatur bleiben, damit die aufrufende Produktseite
 * (product-pages/QiOne2Pro.jsx) unveraendert bleibt. Es ist keine zweite
 * Definition mehr, sondern eine Weiterleitung: hier liegen keine Studien-Daten
 * und kein Kachel-Markup, also kann hier auch nichts mehr auseinanderdriften.
 *
 * Die drei Abstandswerte des alten Inline-CSS (nav 28px statt 14px, footnote
 * 30/22px statt 18/10px, btn 14px) entfallen bewusst: der Block bekommt damit
 * exakt dieselben Abstaende wie die beiden anderen Slider-Seiten. Das ist eine
 * Vereinheitlichung, kein Verlust.
 */
export function StudienCards({headline = 'Wirkung an menschlichen Zellen bestätigt!'}) {
  return (
    <div className="qione-studien-cards NormalSectionSize">
      <StudienSlider headline={headline} />
    </div>
  );
}
