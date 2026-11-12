/**
 * BLACK-FRIDAY-FUNNEL (Elina EL-20261112-5f5fab2e): welche Seite rendert wie
 * Qi Alpha ohne Menü und Fuß, und welche zeigt nur lieferbare Kettenlängen?
 * Die Route erklärt es selbst, wie `handle.filmSeite` in root.jsx:
 *   export const handle = {bfFunnel: true}      (feste Funnel-Seiten)
 *   loader: return {..., bfFunnel: true}         (Deal-Seiten, nur im Aktionszeitraum)
 * Ohne Merkmal bleibt jede Seite unverändert. Eigenes Modul ohne Abhängigkeiten,
 * damit Kaufseiten-Bausteine (AlphaVorlage) es lesen können, ohne den Shop-Kopf
 * (Header.jsx) in ihre Kette zu ziehen.
 *
 * @param {Array<{handle?: unknown, data?: unknown}> | undefined} matches
 * @returns {boolean}
 */
export function istBfFunnelSeite(matches) {
  return (matches || []).some(
    (m) =>
      /** @type {any} */ (m?.handle)?.bfFunnel === true ||
      /** @type {any} */ (m?.data)?.bfFunnel === true,
  );
}
