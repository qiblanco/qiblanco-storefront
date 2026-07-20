/**
 * ZENTRALE Campaign-Fallback-Preise — M1 der gestuften LP-Preis-Dynamik
 * (Auftrag 20260718-lp-preise-dynamisch-binden-gestuft; Konzept Preis-Job
 * 20260718-preis-konsistenz-fix-und-preis-monitor, Abschnitt "dynamisch
 * binden — gestuft").
 *
 * EIN Pflegepunkt statt fuenf verstreuter Literale: Die Campaign-LPs rendern
 * ihre Preise DYNAMISCH aus der Storefront-API (Loader-Query). Diese Werte
 * greifen AUSSCHLIESSLICH fail-closed, wenn der API-Preis im Loader fehlt
 * (Storefront-API nicht erreichbar o. ae.): letzter bekannter guter
 * Anzeigewert je Markt + Konsolen-Warnung — NIE 0/leer/falsch rendern.
 *
 * MARKT-DIMENSION (Auftrag 20260720-usa-seite-auf-dach-basis-vorabversion,
 * Konzept 1a Kap. 4): Struktur ist FALLBACK_PREISE[handle][markt]. Ein
 * EUR-Fallback vor einem US-Besucher waere eine falsche Preisauskunft —
 * deshalb FAIL-CLOSED JE MARKT: fehlt der Markt-Eintrag, liefert
 * fallbackPreis() null (Aufrufer rendert kein Preis-Element) und warnt.
 * NIE die Waehrung eines anderen Markts zeigen.
 *
 * Der Preis-Monitor (preiswatch, quelle-Ebene) prueft GENAU diese Datei und
 * haelt die WERTE ueber den gegateten hb-deploy-Fix-Weg synchron zum
 * Shopify-Soll — hier NICHT von Hand pflegen. Dieser Struktur-Umbau traegt
 * bewusst KEINE neuen Preis-WERTE ein (US-/CH-Eintraege schreibt preiswatch).
 */
export const FALLBACK_PREISE = {
  'qione-2-pro': {
    DE: {bruttoWert: 1087, label: '1.087,00 €'},
  },
};

/**
 * Letzter bekannter guter Anzeigewert eines Produkts im Markt-Kontext
 * (fail-closed-Rueckfall). Bestands-Aufrufer ohne markt-Argument laufen
 * unveraendert ueber den DE-Default (never-break).
 * @param {string} handle Produkt-Handle
 * @param {string} [markt] ISO-Laendercode des Markt-Kontexts (Default 'DE')
 * @returns {{bruttoWert: number, label: string} | null}
 */
export function fallbackPreis(handle, markt = 'DE') {
  const jeMarkt = FALLBACK_PREISE[handle] || null;
  const preis = (jeMarkt && jeMarkt[markt]) || null;
  if (!preis) {
    if (typeof console !== 'undefined') {
      console.warn(
        `[preis-fallback] ${handle}: kein Fallback fuer Markt ${markt} — nie Fremdwaehrung, Preis-Element wird nicht gerendert.`,
      );
    }
    return null;
  }
  if (typeof console !== 'undefined') {
    console.warn(
      `[preis-fallback] ${handle}: API-Preis fehlt — letzter bekannter Anzeigewert ${preis.label} (Markt ${markt}) wird gezeigt.`,
    );
  }
  return preis;
}
