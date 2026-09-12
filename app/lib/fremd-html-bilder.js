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
 * JEDES ANDERE alt-lose Bild bleibt UNBERÜHRT. Das ist Absicht: ein
 * Einschluss-Selektor sagt nur, was er NIMMT, und schuldet deshalb einen
 * Restbericht über das, was er liegen lässt.
 *
 * WER DIESEN RESTBERICHT WIRKLICH FÜHRT — hier stand bis zum 2026-09-12 eine
 * Zusage, die im Betrieb niemand einlöste: `bilderAuszeichnen().offen` gibt die
 * Liste zurück, aber der Render-Pfad ruft `fremdHtmlMitBildAuszeichnung()` und
 * VERWIRFT sie; gelesen wurde `offen` allein im Test. Eine Zusage ohne Leser ist
 * keine. Der echte, stehende Leser ist die Live-Messung
 * `seo-manager/pruefungen/probe_alt_attribut_vollstaendig.py` und über sie der
 * tägliche Arm [ALT] der auffindbarkeits_wache (Soll 0): ein unbekanntes
 * alt-loses Bild wird DORT rot, und dann entscheidet ein MENSCH über sein Motiv.
 * `offen` bleibt das Prüffeld für Tests und für Aufrufer, die es auswerten
 * WOLLEN — es ist ausdrücklich NICHT der Melder.
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

/*
 * DIE MUSTER, UND WARUM SIE NICHT EINFACHER SIND. Die drei Verschärfungen
 * stammen aus einer unabhängigen Gegenprüfung am 2026-09-12, die je eine
 * Eingabe vorführte, an der die naive Fassung still danebenlag. Alle drei
 * Fehler fielen fail-open aus (das Bild blieb ohne alt, es entstand NIE ein
 * falsches alt) — sie waren also nicht gefährlich, aber unsichtbar.
 *
 * Tag-Scanner: `<img[^>]*>` bricht an einem `>` INNERHALB eines Attributwerts
 *   ab (`<img title="a > b" src="…">`). Gescannt wird deshalb quote-treu.
 * HAT_ALT: `\balt\s*=` trifft auch `data-alt=`, weil `-` eine Wortgrenze ist.
 *   Verlangt wird deshalb ein echter Attribut-Anfang: Tag-Beginn oder Leerraum.
 * SRC: dieselbe Wurzel in der Gegenrichtung — ein `?alt=de` IN der Bild-URL
 *   darf nicht als vorhandenes alt gelesen werden; das erledigt HAT_ALT mit.
 */
const HAT_ALT = /(?:^<img|\s)alt\s*=/i;
const SRC = /(?:^<img|\s)src\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;

/**
 * Alle <img>-Tags quote-treu einsammeln. Ein `>` in einem Attributwert beendet
 * das Tag NICHT. Ein unabgeschlossenes Tag wird übersprungen statt geraten.
 * @param {string} html
 * @returns {Array<{tag: string, start: number, ende: number}>}
 */
function imgTags(html) {
  const raus = [];
  const anfang = /<img\b/gi;
  let m;
  while ((m = anfang.exec(html)) !== null) {
    let i = m.index + m[0].length;
    let quote = null;
    while (i < html.length) {
      const c = html[i];
      if (quote) {
        if (c === quote) quote = null;
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === '>') {
        break;
      }
      i += 1;
    }
    if (i >= html.length) break;
    raus.push({tag: html.slice(m.index, i + 1), start: m.index, ende: i + 1});
    anfang.lastIndex = i + 1;
  }
  return raus;
}

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
  let neu = '';
  let zuletzt = 0;
  for (const {tag, start, ende} of imgTags(html)) {
    neu += html.slice(zuletzt, start);
    zuletzt = ende;
    if (HAT_ALT.test(tag)) {
      neu += tag;
      continue;
    }
    const quelle = quelleVon(tag);
    const bekannt = DEKORATIVE_ICONS.some((n) => quelle.includes(n));
    if (!bekannt) {
      offen.push(quelle);
      neu += tag;
      continue;
    }
    gesetzt.push(quelle);
    // Direkt hinter "<img" einsetzen: die einzige Stelle, die unabhängig von
    // der Attribut-Reihenfolge und von "/>" gegen ">" ist.
    neu += tag.replace(/^<img\b/i, '<img alt=""');
  }
  neu += html.slice(zuletzt);
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
