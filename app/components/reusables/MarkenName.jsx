/*
 * MARKENNAME MIT KLEINEM, HOCHGESTELLTEM ® (Elina EL-20261027-c05a2273,
 * 27.10.2026: „mit kleinem hochgestelltem Registerzeichen wie im
 * Qi-Blanco-Logo (nicht in Schriftgröße des Namens)“).
 *
 * Teilt den Text an jedem ® und setzt das Zeichen als <sup className="qb-reg">.
 * Größe und Lage stehen in styles/the-alpha-produkt.css (.qb-reg); jede
 * Seite, die den Namen so setzt, lädt diese Datei (Qi Alpha, Alpha-Vorlage). Der Text bleibt für Suche und
 * Vorleser derselbe („Qi Alpha®“).
 */
export function MarkenName({text}) {
  const teile = String(text ?? '').split('®');
  return (
    <>
      {teile.map((t, i) => (
        <span key={i}>
          {t}
          {i < teile.length - 1 ? <sup className="qb-reg">®</sup> : null}
        </span>
      ))}
    </>
  );
}

export default MarkenName;
