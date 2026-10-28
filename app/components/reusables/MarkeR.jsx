/*
 * MARKENZEICHEN ® KLEIN HOCHGESTELLT (Christian 28.10.2026 Z1: „das R so groß
 * ist und nicht hochgestellt“; Grossjob 20261028-qi-alpha-kopf-99-registered-
 * hochgestellt-ohne-bewertungen-chat-ratenzahlung, s03).
 *
 * Die Texte bleiben lesbare Zeichenketten mit „®“ (Daten, Alt-Texte,
 * Strukturdaten, Chat-Wissen). Erst beim Zeichnen setzt MarkeR jedes „®“ als
 * <sup>: rund 0,45 em, oben an der Versalhöhe, gleiche Farbe und Stärke wie
 * das Wort davor. Ein Helfer für alle Stellen, damit kein zweites Maß entsteht.
 *
 * Maß (gemessen an Open Sans, der Schrift des Ladens): das Zeichen hat 0,45 em
 * der Umgebung; um 0,85 seiner eigenen Größe angehoben schließt seine
 * Oberkante mit der Versalhöhe des Wortes ab. line-height 0 hält die Zeile so
 * hoch wie ohne Zeichen.
 */

export const MARKE_R = '®';

export const MARKE_R_STIL = {
  fontSize: '0.45em',
  lineHeight: 0,
  verticalAlign: '0.85em',
  marginLeft: '0.04em',
  letterSpacing: 0,
  fontWeight: 'inherit',
  color: 'inherit',
};

/** Zerlegt einen Text an jedem „®“; ohne Zeichen kommt der Text unverändert zurück. */
export function mitMarkeR(text) {
  if (typeof text !== 'string' || !text.includes(MARKE_R)) return text;
  const teile = text.split(MARKE_R);
  return teile.flatMap((teil, i) =>
    i === 0
      ? [teil]
      : [
          <sup
            // eslint-disable-next-line react/no-array-index-key
            key={`r${i}`}
            className="qb-marke-r"
            style={MARKE_R_STIL}
          >
            {MARKE_R}
          </sup>,
          teil,
        ],
  ).filter((x) => x !== '');
}

/** <MarkeR>Qi Alpha®</MarkeR> bzw. <MarkeR text="…" /> */
export function MarkeR({text, children}) {
  return <>{mitMarkeR(text ?? children)}</>;
}

export default MarkeR;
