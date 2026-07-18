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
 * DE-Anzeigewert + Konsolen-Warnung — NIE 0/leer/falsch rendern.
 *
 * Der Preis-Monitor (preiswatch, quelle-Ebene) prueft GENAU diese Datei und
 * haelt die Werte ueber den gegateten hb-deploy-Fix-Weg synchron zum
 * Shopify-Soll — hier NICHT von Hand pflegen.
 */
export const FALLBACK_PREISE = {
  'qione-2-pro': {bruttoWert: 1087, label: '1.087,00 €'},
};

/**
 * Letzter bekannter guter Anzeigewert eines Produkts (fail-closed-Rueckfall).
 * @param {string} handle Produkt-Handle
 * @returns {{bruttoWert: number, label: string} | null}
 */
export function fallbackPreis(handle) {
  const preis = FALLBACK_PREISE[handle] || null;
  if (preis && typeof console !== 'undefined') {
    console.warn(
      `[preis-fallback] ${handle}: API-Preis fehlt — letzter bekannter Anzeigewert ${preis.label} wird gezeigt.`,
    );
  }
  return preis;
}
