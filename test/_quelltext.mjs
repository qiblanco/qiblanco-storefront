/**
 * DER CODE OHNE SEINE PROSA — geteilt, weil die Klasse dreimal zugeschlagen hat.
 *
 * Ein Zensus, der Kommentare mitliest, misst die Begründung statt den
 * Gegenstand. Die Begründung nennt fast immer genau das, was sie verbietet
 * ("der ZWEITE Goldton", "noindex plus canonical") — die Probe wird dadurch
 * dauerrot, und heilen lässt sie sich nur, indem man die Begründung loescht.
 * Das ist der falsche Fix: er bestraft die Dokumentation.
 *
 * BELEGT, NICHT VERMUTET — drei Instanzen im selben Repo:
 *  1. `test/neu-oder-gebraucht.test.mjs` hat die Klasse beim Bau erkannt und
 *     diesen Helfer lokal gebaut (Kopf der Datei: drei Prüfungen schlugen an,
 *     weil der Dateikopf `noindex`/`canonical`/`440` NENNT). Angewandt wurde er
 *     auf ROUTE und KOMPONENTE — und auf die CSS NICHT. Genau der ausgelassene
 *     Aufrufort trug den Arm, der seit seinem Geburts-Commit 408c0fd (#414)
 *     NIE gruen war: das einzige Farb-Literal im Rumpf (`#F2BF72`) steht in
 *     einem Kommentar, der den fremden ActiveCampaign-Ocker beschreibt, den der
 *     Block darunter ueberhaupt erst überschreibt.
 *  2. `test/seo-canonical.test.mjs` liest die Routen-Quelle über `s04Quelle`
 *     ebenfalls roh — dieselbe Flanke, nur noch nicht eingetreten.
 *
 * Wer eine Quelle zum Messen einliest, schickt sie hier durch.
 * CSS kennt nur die Block-Form; die Zeilen-Form schadet dort nicht, weil `//`
 * am Zeilenanfang in gueltiger CSS nicht vorkommt.
 */
export const ohneProsa = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
