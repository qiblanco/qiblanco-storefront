/**
 * Such-Ausschluss: Produkte, die kaufbar bleiben, aber nicht mehr in der
 * Storefront-Suche auftauchen sollen.
 *
 * WARUM ES DIESE DATEI GIBT: Shopify kennt kein "aus der Suche nehmen" je
 * Produkt. Jeder Admin-Hebel, der die Storefront-Suche traefe (status DRAFT,
 * Publikation entziehen), tötet zugleich die Produktseite und damit die
 * Kaufbarkeit. Der einzige Traeger, der beides trennt, liegt deshalb hier im
 * Storefront-Code.
 *
 * ZWEI WEGE, BEWUSST BEIDE (der eine trägt heute, der andere den nächsten Fall):
 *
 *  (1) SUCH_AUSSCHLUSS_HANDLES — die benannte Liste. Trägt ohne jeden
 *      Schreibzugriff auf das Produkt, ist im Code review- und testbar und
 *      funktioniert auch dann, wenn niemand mehr an die Admin-API kommt.
 *      Preis: eine Änderung braucht einen Deploy.
 *
 *  (2) SUCH_AUSSCHLUSS_TAG — die Tag-Konvention am Produkt. Trägt den
 *      nächsten Dublettenfall OHNE Deploy: Tag setzen, fertig.
 *      Preis: sie braucht einen zweiten Schreibweg (Admin-API) und ist damit
 *      von einem fremden System abhängig.
 *
 * Ein Produkt ist ausgeschlossen, wenn EINER der beiden Wege zutrifft.
 * Wer einen Eintrag ergänzt, schreibt den Grund dazu — eine Liste ohne
 * Gründe ist in einem halben Jahr nicht mehr aufloesbar.
 */

/** Tag am Produkt (Admin: Produkt -> Tags), pflegbar ohne Deploy. */
export const SUCH_AUSSCHLUSS_TAG = 'qb-nicht-suchbar';

/**
 * Handles, die dauerhaft aus der Suche bleiben.
 * @type {ReadonlyArray<{handle: string, grund: string}>}
 */
export const SUCH_AUSSCHLUSS_HANDLES = [
  {
    handle: 'crystal-cacao-adfiefiale',
    grund:
      'Dublette von crystal-cacao (Digest 54, Weg A, 2026-09-10). Bleibt ' +
      'ausdrücklich kaufbar — bestehende Links und Bestellungen sollen ' +
      'weiter funktionieren —, soll aber nicht mehr neben dem Hauptprodukt ' +
      'in Ergebnisliste und Vorschlaegen stehen.',
  },
];

const HANDLE_SET = new Set(SUCH_AUSSCHLUSS_HANDLES.map((e) => e.handle));

/**
 * Ist dieser Produkt-Knoten von der Suche ausgeschlossen?
 * Fail-open: was kein erkennbares Produkt ist, bleibt drin — diese Funktion
 * darf nie zum stillen Löschfilter für die halbe Suche werden.
 * @param {{handle?: string, tags?: string[]}|null|undefined} node
 * @returns {boolean}
 */
export function istSuchAusgeschlossen(node) {
  if (!node) return false;
  if (node.handle && HANDLE_SET.has(node.handle)) return true;
  if (Array.isArray(node.tags)) {
    for (const tag of node.tags) {
      if (typeof tag === 'string' && tag.trim().toLowerCase() === SUCH_AUSSCHLUSS_TAG) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Filtert ausgeschlossene Produkte aus einer Knotenliste.
 * @template {{handle?: string, tags?: string[]}} T
 * @param {T[]|null|undefined} nodes
 * @returns {T[]}
 */
export function ohneAusgeschlossene(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes.filter((node) => !istSuchAusgeschlossen(node));
}
