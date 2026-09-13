/*
 * fremd-html-ueberschriften — Rangkorrektur für Überschriften in FREMDEM
 * HTML, das wir rendern, aber nicht schreiben (Shopify `page.body`).
 *
 * ANLASS (2026-09-13, Job 20260913-auffindbarkeits-wache-dach-rest-og-h1-
 * und-die-noindex-frage-prio30): /pages/support-1 lieferte live ZWEI h1 —
 * „Support" aus dem Seitenkopf und „Deine Meinung ist wichtig!" aus dem
 * Shopify-Rumpf, einer aus einem Elementor-Import übernommenen Überschrift.
 * Der Arm [H1] der täglichen auffindbarkeits_wache stand deshalb auf 1.
 *
 * WARUM DER FIX HIER STEHT UND NICHT IN DEN SHOPIFY-DATEN — dieselbe
 * Begründung, mit der nebenan fremd-html-bilder.js entstanden ist: das Feld
 * wird im Rich-Text-Editor von Menschen bearbeitet. Eine einmalige Korrektur
 * der Daten hält bis zur nächsten Bearbeitung, und die nächste im Admin
 * angelegte Seite mit einer h1 im Rumpf bringt den Befund unbemerkt zurück.
 * Die Klasse ist nur am Render-Pfad zu schließen (Hausregel: wird eine
 * Dateiklasse nicht ausgeliefert, ist der Fix-Ort die VORLAGE).
 *
 * WARUM ES EINE EIGENE DATEI IST UND NICHT EIN ZWEITER EXPORT IN
 * fremd-html-bilder.js: jene Datei wird von ZWÖLF Routen importiert — allen
 * Produktrouten, den Blog-Artikeln und policies.$handle.jsx. Eine
 * Überschriften-Regel dort gälte damit auch für `descriptionHtml` einer
 * Produktseite, wo der Rumpf in einem ganz anderen Gerüst steckt und die
 * Aussage „der h1-Platz ist schon vergeben" NICHT gilt. Zusätzlich löst
 * hb-deploy Gate 12 eine geänderte geteilte Datei über ihre Import-Closure
 * auf; eine Änderung dort zöge zwölf unbeteiligte Seiten in die Prüfmenge.
 * Diese Datei wird ausschließlich von pages.$handle.jsx importiert.
 *
 * WAS SIE AUSDRÜCKLICH NICHT TUT: sie rät nicht. Sie verschiebt keinen Rang
 * nach Bedeutung, sie erfindet keine Struktur und sie fasst h2..h6 nicht an.
 * Sie beantwortet genau EINE geschlossene Frage: ist der h1-Platz dieses
 * Dokuments bereits vergeben? Nur dann wird eine h1 im fremden Rumpf zur h2 —
 * denn dann IST sie per Konstruktion eine zweite. Diese Frage ist maschinell
 * entscheidbar; „welcher Rang wäre semantisch richtig" wäre es nicht.
 *
 * DER AUFRUFER MUSS DIE ANTWORT LIEFERN, und das ist Absicht statt Bequem-
 * lichkeit: components/Rechtsseite.jsx rendert seine `<h1>{titel}</h1>` NUR
 * bei nichtleerem `titel`. Wer hier bedingungslos herabstufte, nähme einer
 * titellosen Seite ihre EINZIGE h1 und tauschte einen Befund gegen den
 * gegenteiligen. Am 2026-09-13 hat keine der 62 Shopify-Seiten einen leeren
 * Titel — das ist eine Messung von heute, keine bauliche Zusage, und deshalb
 * steht die Bedingung im Code und nicht in diesem Kommentar.
 *
 * ABGRENZUNG ZU EINEM ECHTEN HTML-PARSER: hier wird bewusst nicht geparst.
 * Der Eingriff ist eine Umbenennung des Tag-Namens an Ort und Stelle; Inhalt,
 * Attribute und Verschachtelung bleiben unberührt. Ein Parser müsste den
 * fremden Rumpf neu serialisieren und würde dabei genau das anfassen, was
 * diese Datei nicht anfassen will.
 */

/*
 * DIE MUSTER, UND WARUM SIE NICHT EINFACHER SIND. `<h1` allein trifft auch
 * ein erfundenes `<h1foo>`; verlangt wird deshalb ein echtes Tag-Ende —
 * Leerraum, `>` oder `/`. Das schließende Tag wird getrennt behandelt, weil
 * es keine Attribute trägt. Beide Muster sind bewusst NICHT quote-treu wie
 * der Bild-Scanner nebenan: ein `<h1` INNERHALB eines Attributwerts wäre
 * wohlgeformtes HTML nur als Entity, und ein Tag-Name lässt sich anders als
 * ein Attributwert nicht in Anführungszeichen verstecken.
 */
const H1_AUF = /<h1(?=[\s>/])/gi;
const H1_ZU = /<\/h1\s*>/gi;

/**
 * Zählt die h1-Öffnungen in einem HTML-Fragment.
 * @param {string} html
 * @returns {number}
 */
export function h1Zahl(html) {
  if (!html) return 0;
  return (String(html).match(H1_AUF) || []).length;
}

/**
 * Stuft jede h1 im fremden Rumpf auf h2 herab — aber NUR, wenn das Dokument
 * seine h1 schon anderswo hat.
 *
 * @param {string} html roher Shopify-`body`
 * @param {{h1BereitsVergeben: boolean}} lage
 * @returns {{html: string, herabgestuft: number}} `herabgestuft` ist die Zahl
 *   der umbenannten Überschriften — 0 heißt „nichts zu tun", nicht „Fehler".
 */
export function ueberschriftenRangKorrigiert(html, {h1BereitsVergeben}) {
  const roh = html || '';
  if (!h1BereitsVergeben) return {html: roh, herabgestuft: 0};
  const treffer = h1Zahl(roh);
  if (!treffer) return {html: roh, herabgestuft: 0};
  return {
    html: roh.replace(H1_AUF, '<h2').replace(H1_ZU, '</h2>'),
    herabgestuft: treffer,
  };
}

/**
 * Bequemlichkeits-Fassung für den Render-Pfad, die nur das HTML zurückgibt.
 * Die Zahl bleibt über die Fassung oben erreichbar — sie ist das Prüffeld
 * für Tests, nicht der Melder. Der stehende Melder dieser Klasse ist der Arm
 * [H1] der täglichen seo-manager/bin/auffindbarkeits_wache.py (Soll 0), die
 * an der LIVE-Auslieferung misst und nicht an dieser Funktion.
 * @param {string} html
 * @param {boolean} h1BereitsVergeben
 * @returns {string}
 */
export function fremdHtmlMitUeberschriftenRang(html, h1BereitsVergeben) {
  return ueberschriftenRangKorrigiert(html, {h1BereitsVergeben}).html;
}
