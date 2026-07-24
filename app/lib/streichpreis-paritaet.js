/**
 * STREICHPREIS-PARITÄT — die EINE Quelle für Währungs-Streichpreise
 * (compare_at / Vergleichspreis), die Shopify Markets für USD/CHF (noch) NICHT
 * ausliefert. (Auftrag 20260724-streichpreis-usd-chf-dach-dynamisch-live.)
 *
 * WARUM diese Datei existiert:
 * Bei Währung USD/CHF liefert die Storefront-API `compareAtPrice = null` (die
 * Markets-Preislisten tragen dort keinen Vergleichspreis), während EUR ihn
 * trägt — deshalb erscheint in USD/CHF kein durchgestrichener Ausgangspreis
 * (Symptom: /pages/schlaf-zellen-schutz zeigt "$1,383" ohne Streich). Der
 * Shopify-Admin-Zugang ist read-only (kein write_markets/write_price_lists,
 * markets-GraphQL = ACCESS_DENIED) -> der Vergleichspreis kann NICHT in Shopify
 * gepflegt werden (Scope/Secret = Christian-Gate). Diese Datei liefert den
 * geprüften Vergleichspreis als FALLBACK, sobald Shopify für die Währung
 * nichts liefert.
 *
 * SELBST-ZURÜCKTRETEND: der API-Wert hat IMMER Vorrang (siehe
 * `mitStreichpreisFallback`). Trägt Christian den Vergleichspreis später in
 * Shopify nach, verschwindet dieser Fallback von selbst — kein Doppelwert.
 *
 * RECHTSGRUNDLAGE (der Streichpreis muss ein echter früherer Preis sein):
 * Inhaber-Bestätigung im Wortlaut, 2026-07-21 (Christian, Inhaber):
 *   "Die US- und CHF-Preise sind bereits rabattierte Preise. Sie wurden nur nie
 *    als solche ausgezeichnet. Der reguläre, höhere Preis hat in diesen
 *    Märkten also tatsächlich vorher gegolten."
 *
 * WERTE (geprüft im Paritäts-Konzept 20260721-streichpreis-paritaet-usd-chf,
 * Gates G1-G7; Aktionspreise bleiben UNVERÄNDERT):
 *   qione-2-pro / USD -> 1599  Belegklasse H2 (echter früherer USD-Preis des
 *                              USA-Shop-Zwillings; Aktionspreis 1383 USD).
 *   qione-2-pro / CHF -> 1420  GERECHNET: Parität zum DE-Rabatt 26,2157 % auf
 *                              den Aktionspreis 1048 CHF. KEIN historischer
 *                              CHF-Beleg -> inhaber-angeordnete Parität.
 *   aw783hfn    / USD -> 198   Belegklasse H2 (2x-AWAKE-Zwilling USA-Shop).
 *                              DATEN-only: der Cacao-Renderpfad
 *                              (CacaoProductForm, per-100g-Tier) verbraucht
 *                              diesen Wert derzeit NICHT — hier dokumentiert +
 *                              bereit, falls ein Standard-Renderpfad entsteht.
 *
 * BEWUSST NICHT enthalten:
 *   37cr378n / USD (2x CREATE): Preis-Anomalie (Aktion 159 USD vs. strukturgleiche
 *     99 USD) -> jeder Vergleichspreis wäre Kaschierung; Klärung = Christian
 *     (Konzept Block E3).
 *   EUR: die API liefert den Vergleichspreis bereits -> NIE ein EUR-Wert hier.
 */

/** @typedef {{amount: string, currencyCode: string}} Money */

// Vergleichspreise je Produkt-Handle und Währung. Beträge als String (API-Form).
const STREICHPREIS = {
  'qione-2-pro': {USD: '1599', CHF: '1420'},
  aw783hfn: {USD: '198'},
};

/**
 * Geprüfter Streichpreis-Fallback für {handle, Währung}, oder null.
 * EUR gibt IMMER null (die API liefert den Wert dort selbst).
 * @param {string} [handle] Produkt-Handle
 * @param {string} [currencyCode] Währung des aktiven Preises
 * @returns {Money|null}
 */
export function streichpreisFallback(handle, currencyCode) {
  if (!handle || !currencyCode || currencyCode === 'EUR') return null;
  const amount = STREICHPREIS[handle]?.[currencyCode];
  return amount ? {amount, currencyCode} : null;
}

/**
 * API-Vergleichspreis mit Vorrang; Fallback NUR, wenn die API nichts liefert.
 * Damit ist der Fallback selbst-zurücktretend, sobald Shopify den
 * Vergleichspreis für die Währung trägt.
 * @param {Money|null|undefined} apiMoney compareAtPrice aus der Storefront-API
 * @param {string} [handle] Produkt-Handle
 * @param {string} [currencyCode] Währung des aktiven Preises
 * @returns {Money|null}
 */
export function mitStreichpreisFallback(apiMoney, handle, currencyCode) {
  return apiMoney || streichpreisFallback(handle, currencyCode);
}
