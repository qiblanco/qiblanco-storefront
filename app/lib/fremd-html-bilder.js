/*
 * fremd-html-bilder — Auszeichnung für Bilder in FREMDEM HTML, das wir
 * rendern, aber nicht schreiben (Shopify `descriptionHtml`).
 *
 * ANLASS (2026-09-12, s07 des Grossjobs 20260911-...-technische-auffindbarkeit):
 * Auf /products/qione-2-pro und /products/qihome-air trugen je drei Bilder
 * überhaupt kein alt-Attribut. Sie stammen NICHT aus dem Repo, sondern aus dem
 * Shopify-Feld `descriptionHtml`, das per dangerouslySetInnerHTML gerendert
 * wird. Keine Komponenten-Änderung erreicht sie.
 *
 * WARUM DER FIX HIER STEHT UND NICHT IN DEN SHOPIFY-DATEN: das Feld wird im
 * Rich-Text-Editor von Menschen bearbeitet, und der RTE setzt beim Einfuegen
 * eines Bildes KEIN alt. Eine einmalige Korrektur der Daten hält deshalb nur
 * bis zur nächsten Bearbeitung und hat keinen Wächter. Die Klasse ist nur am
 * Render-Pfad zu schließen (Hausregel: wird eine Dateiklasse nicht
 * ausgeliefert, ist der Fix-Ort die VORLAGE).
 *
 * WAS DIESE DATEI AUSDRÜCKLICH NICHT TUT -- und das ist ihre wichtigste
 * Eigenschaft: sie fuellt NICHT pauschal jedes alt-lose Bild mit alt="".
 * Ein alt="" sagt einem Screenreader "überspring mich"; auf ein INHALTSBILD
 * angewandt ist das keine Auszeichnung, sondern eine Löschung. Ein erfundener
 * Alternativtext ist schlechter als keiner, und eine erfundene DEKORATIONS-
 * Erklärung ist es genauso.
 *
 * Ausgezeichnet wird deshalb nur, was das Haus bereits ALS DEKORATIV ENTSCHIEDEN
 * HAT: die vier Beschriftungs-Icons der Hero-Bullets. Ihre Bedeutung steht als
 * Text unmittelbar daneben ("E-Smog Schutz", "Zellgesundheit", ...), und die
 * Schwesterkomponente QiBraceletHeroBullets.jsx führt sie seit je mit alt="".
 * Erkannt werden sie am stabilen Namensteil der Bildquelle, nicht an einer
 * vollstaendigen URL -- dieselbe Datei existiert in mehreren Größenvarianten
 * (_16x16, _480x480), und ein URL-Literal würde die nächste Variante verfehlen.
 *
 * JEDES ANDERE alt-lose Bild bleibt UNBERUEHRT und wird GEZAEHLT UND BENANNT
 * (`bilderAuszeichnen().offen`). Das ist Absicht: ein Einschluss-Selektor sagt
 * nur, was er NIMMT, und schuldet deshalb einen Restbericht über das, was er
 * liegen lässt. Der stehende Arm [ALT] der auffindbarkeits_wache wird bei so
 * einem Bild rot -- und dann entscheidet ein Mensch über sein Motiv, statt dass
 * eine Maschine es raet.
 */

/**
 * Die vier Beschriftungs-Icons der Hero-Bullets, als stabiler Namensteil ihrer
 * Bildquelle. Die Entscheidung "dekorativ" ist NICHT hier gefallen, sie ist hier
 * nur angewendet: SSoT sind QiBraceletHeroBullets.jsx (alt="" auf allen vieren)
 * und seo-manager/pruefungen/probe_icon_alt_kongruenz.py, die genau diese vier
 * über alle Erzeuger hinweg auf Gleichheit prueft.
 */
export const DEKORATIVE_ICONS = [
  'Person_ArmsUp_Icon',
  'WIFI_ICON',
  'Molecule_Icon',
  'Green_Checkmark',
];

const IMG_TAG = /<img\b[^>]*>/gi;
const HAT_ALT = /\balt\s*=/i;
const SRC = /\bsrc\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;

function quelleVon(tag) {
  const m = tag.match(SRC);
  if (!m) return '';
  return m[2] ?? m[3] ?? m[4] ?? '';
}

/**
 * Zeichnet bekannte dekorative Icons in fremdem HTML mit alt="" aus.
 *
 * @param {string} html rohes Fremd-HTML (Shopify descriptionHtml)
 * @returns {{html: string, gesetzt: string[], offen: string[]}}
 *   html    — dasselbe HTML, nur mit alt="" an den bekannten Icons
 *   gesetzt — Bildquellen, die ausgezeichnet wurden
 *   offen   — Bildquellen OHNE alt, die bewusst unberührt blieben, weil ihr
 *             Motiv hier nicht bekannt ist (der Restbericht des Selektors)
 */
export function bilderAuszeichnen(html) {
  const gesetzt = [];
  const offen = [];
  if (typeof html !== 'string' || html === '') {
    return {html: typeof html === 'string' ? html : '', gesetzt, offen};
  }
  const neu = html.replace(IMG_TAG, (tag) => {
    if (HAT_ALT.test(tag)) return tag;
    const quelle = quelleVon(tag);
    const bekannt = DEKORATIVE_ICONS.some((n) => quelle.includes(n));
    if (!bekannt) {
      offen.push(quelle);
      return tag;
    }
    gesetzt.push(quelle);
    // Direkt hinter "<img" einsetzen: das ist die einzige Stelle, die
    // unabhängig von der Attribut-Reihenfolge und von "/>" gegen ">" ist.
    return tag.replace(/^<img\b/i, '<img alt=""');
  });
  return {html: neu, gesetzt, offen};
}

/**
 * Bequemlichkeitsform für den Render-Pfad: gibt nur das HTML zurück.
 * @param {string} html
 * @returns {string}
 */
export function fremdHtmlMitBildAuszeichnung(html) {
  return bilderAuszeichnen(html).html;
}
