import {leiteUm} from '~/lib/zusammenlegungen';

const PFAD = '/pages/was-senkt-elektrosmog-im-alltag';

/**
 * /pages/was-senkt-elektrosmog-im-alltag — permanenter 301 auf /pages/was-ist-
 * elektrosmog.
 *
 * Bis 07.10.2026 stand hier die Frageseite „Was senkt die Belastung durch
 * Elektrosmog im Alltag?". Die Seite ist in /pages/was-ist-elektrosmog
 * aufgegangen (die vollständige Antwort als Abschnitt von „Was ist
 * Elektrosmog?", Anker #was-senkt-elektrosmog-im- alltag), Entscheidung vom
 * 07.10.2026 (Coworker A im Auftrag Christians), gebaut von Job 20261007-seo-
 * zusammenlegung-duenne-seiten-301-umsetzen. Der Text liegt unverändert im
 * Datenmodul; diese Route trägt nur noch die Weiterleitung.
 *
 * WARUM DIE ROUTE BLEIBT: ohne sie übernähme pages.$handle.jsx, fände kein
 * Shopify-Seitenobjekt und lieferte 404. Alte Links, Lesezeichen und Zitate
 * laufen so auf den neuen Abschnitt. Ziel und Anker stehen in EINEM Träger,
 * app/lib/zusammenlegungen.js; der Query-String bleibt erhalten.
 *
 * RÜCKWEG: hb-deploy revert --sha <merge> stellt die Seite wieder her.
 */

/**
 * @param {{request: Request}} args
 */
export async function loader({request}) {
  leiteUm(request, PFAD);
}

export default function WasSenktElektrosmogImAlltagWeiterleitung() {
  return null;
}
