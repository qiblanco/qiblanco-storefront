/**
 * DER AUTORENKASTEN am Ende eines Fachartikels — Daten, Flag und Sichtbarkeit.
 *
 * Diese Datei ist bewusst PUR (kein React, kein Server-Zugriff): so ist die
 * Schaltlogik hermetisch testbar, ohne einen Renderer hochzufahren — dasselbe
 * Muster wie app/lib/eu-gewaehrleistungslabel.js.
 *
 * ---------------------------------------------------------------------------
 * WARUM DER KASTEN HIER ENTSTEHT UND NICHT IM body_html
 * ---------------------------------------------------------------------------
 * Richtungsentscheid s01 des Grossjobs 20260908-BAU-fachartikel-autorenkasten-
 * us-parallelausgabe-takt-und-schnelle-bilder: der Kasten ist für JEDEN Artikel
 * identisch (immer derselbe Autor). Im Shopify-`body_html` stuende er N-mal, und
 * jede spaetere Textkorrektur wäre N `articleUpdate`-Schreibzuege gegen den
 * Massen-Guard von shopify-write. In der Route ist es EIN Bauteil: eine Aenderung
 * wirkt auf alle Artikel, ohne einen einzigen Shop-Schreibzug.
 * BAULICHE FOLGE, und das ist der Punkt: der Kasten kann so gar nicht DOPPELT
 * entstehen. Genau diese Klasse misst blog-redaktion/pruefungen/
 * probe_autorenkasten_naht.py an der ausgelieferten Seite (Kasten == 1).
 *
 * ---------------------------------------------------------------------------
 * DAS FLAG — WARUM DER KASTEN SEIT DEM 2026-09-08 SICHTBAR IST
 * ---------------------------------------------------------------------------
 * Dieses Flag stand bis zum 2026-09-08 auf `false`, und zwar aus GENAU EINEM
 * Grund: Christian hatte angeordnet, den Text vor der Veroeffentlichung lesen
 * zu wollen ("Lass es Christian vor der Veroeffentlichung lesen — es ist ein
 * Text über ihn"). Das war ein EXPLIZIT-OVERRIDE nach Ausnahme [A] der
 * Autonomie-Policy, kein selbstgebautes Gate.
 *
 * AM 2026-09-08 HAT DERSELBE MENSCH DIESE ANORDNUNG ZURUECKGENOMMEN, woertlich:
 *   "Nein, das Foto sucht ihr auch aus. Und natürlich wird der Absatz
 *    veroeffentlicht, den lese ich dann spaeter."
 * Damit faellt der einzige Grund weg, aus dem das Flag `false` war. Es auf
 * `false` zu lassen wäre hier nicht Vorsicht, sondern das Gegenteil des
 * Auftrags — ein Server, der einen zurueckgenommenen Vorbehalt weiter vollzieht,
 * ueberstimmt den Menschen, statt ihm zu folgen.
 *
 * AUTORENKASTEN_LIVE = true   -> der Kasten rendert auf jeder Artikelseite.
 *
 * WAS DAMIT Ausdrücklich NICHT AUFGEHOBEN IST: der technische Freigabeweg der
 * Blogredaktion (BLOG_PUBLISH, FREIGABE_CHRISTIAN, `--wirklich`). Der gatet das
 * VEROEFFENTLICHEN VON ARTIKELN und wird von diesem Kasten nicht beruehrt — der
 * Kasten wird von DIESER Route auf bereits veroeffentlichte Artikel gerendert,
 * es faellt kein einziger Shopify-Schreibzug. Christian hat die INHALTLICHE
 * Vorlage zurueckgenommen, nicht den technischen Schutz; beides faellt hier
 * nicht zusammen, und deshalb musste auch nichts umgangen werden.
 *
 * ---------------------------------------------------------------------------
 * WARUM ES TROTZDEM EINEN VORSCHAUWEG GIBT (und warum er kein Schleichweg ist)
 * ---------------------------------------------------------------------------
 * Der Weg stammt aus der Zeit des Lesevorbehalts und BLEIBT, obwohl das Flag
 * jetzt `true` ist: er ist der Rueckweg. Wird der Kasten je wieder auf `false`
 * gelegt, ist er ohne ihn nicht mehr begutachtbar. Ein Flag ohne Vorschauweg
 * haette zwei Folgen, die beide gegen den Auftrag laufen:
 *   (1) Ein Text über einen Menschen wäre im abgeschalteten Zustand nur im
 *       Quelltext lesbar — nicht als die Seite, die der Leser spaeter sieht.
 *   (2) Die Design-Pflicht (Beauty-Gate) verlangt einen FRISCHEN Score der
 *       gerenderten Flaeche. Was nie rendert, kann nicht gescort werden, und
 *       "kann nicht rendern" ist dort ausdrücklich ein ABBRUCHGRUND, kein
 *       Vermerk. Ohne Vorschauweg wäre dieses Segment baulich nicht abnehmbar.
 * Der Weg ist `?autorenkasten=vorschau`. Er ist NICHT verlinkt, und die Route
 * setzt bei Vorschau `noindex` — die öffentliche Fassung der Seite bleibt
 * unveraendert, und es entsteht keine zweite indexierbare Variante.
 *
 * ---------------------------------------------------------------------------
 * WOHER DER TEXT KOMMT — SSoT UND WARUM HIER TROTZDEM EINE KOPIE STEHT
 * ---------------------------------------------------------------------------
 * SSoT ist blog-redaktion/profile/autorenkasten.json (Segment s02). Diese
 * Storefront ist ein EIGENES Repository und läuft auf Oxygen — sie kann
 * /srv/openclaw zur Laufzeit nicht lesen. Der Text MUSS also als Kopie hier
 * stehen; ihn "zur Laufzeit zu ziehen" ist keine Option, die es gibt.
 * DAMIT DIE KOPIE NICHT STILL AUSEINANDERLAEUFT, trägt sie den Hash des
 * SSoT-Kerns. Er wird von blog-redaktion/pruefungen/probe_autorenkasten_naht.py
 * (Arm A0 TEXTGLEICHHEIT) gegen die SSoT-Datei geprueft — eine Textkorrektur,
 * die nur an einem der beiden Orte ankommt, ist damit ein BEFUND und keine
 * Entdeckung für den Zufall.
 * AENDERT SICH DER TEXT: SSoT aendern, dann AUTORENKASTEN hier nachziehen und
 * AUTORENKASTEN_SSOT_SHA256 neu setzen (die Probe druckt den Sollwert).
 */

/** Das benannte Flag. true = sichtbar auf jeder Artikelseite (2026-09-08).
 *  Rueckweg: auf `false` setzen, committen, deployen — ein Zeichen, kein
 *  zweiter Ort. Der Kasten verschwindet dann vollstaendig, ohne dass an einem
 *  Artikel im Shop irgendetwas angefasst werden müsste. */
export const AUTORENKASTEN_LIVE = true;

/** Query-Parameter, der den Kasten für einen einzelnen Abruf sichtbar macht. */
export const AUTORENKASTEN_VORSCHAU_PARAM = 'autorenkasten';
export const AUTORENKASTEN_VORSCHAU_WERT = 'vorschau';

/**
 * sha256 über den KERN des SSoT (name, rolle, saetze, foto). Erzeugt 2026-09-08.
 *
 * DAS REZEPT IST TEIL DES VERTRAGS UND STEHT DESHALB HIER AUSGESCHRIEBEN --
 * "sortierte Schluessel" allein genügt NICHT und hat am 2026-09-08 genau eine
 * Fehlmessung erzeugt (der richtige Hash sah falsch aus, weil der Leser anders
 * kanonisierte als der Schreiber):
 *   1. rekursiv alle Schluessel mit fuehrendem Unterstrich WEGLASSEN -- die
 *      sind im SSoT Dokumentation (_grund_leer, _so_fuellen, _grenzen) und
 *      duerfen den Hash nicht bewegen, sonst ist jede Kommentar-Korrektur an
 *      der SSoT-Datei ein Drift-Befund über einen unveraenderten Text.
 *   2. Schluessel sortieren, rekursiv.
 *   3. JSON ohne Leerzeichen (Trenner "," und ":").
 *   4. UTF-8, nicht escaped -- 'GitterChip\u2122' und 'GitterChip™'
 *      sind sonst zwei verschiedene Hashes für denselben Text.
 * Gemessen wird das von blog-redaktion/pruefungen/probe_autorenkasten_naht.py
 * (Arm A0) und hermetisch von test/autorenkasten.test.mjs.
 */
export const AUTORENKASTEN_SSOT_SHA256 =
  '6f8c84baf08b218c8a61397788f6dbd6848534026c5e8d5a6ab206050a9edc8f';

/** Der Inhalt. Wort für Wort aus dem SSoT, echte Umlaute (Hausregel). */
export const AUTORENKASTEN = {
  name: 'Dipl.-Ing. (FH) Christian Bernd Bauer',
  rolle: 'Erfinder des GitterChip™ und Geschäftsführer von Qi Blanco',
  saetze: [
    'Dipl.-Ing. (FH) Christian Bernd Bauer ist Erfinder des GitterChip™ und Geschäftsführer von Qi Blanco.',
    'Die Technik, die in jedem Qi-Blanco-Produkt steckt, geht auf seine eigene Entwicklungsarbeit als Ingenieur zurück.',
    'In seinen Fachartikeln steht zu jeder Aussage die gemessene Größe mit ihrer Quelle — und ebenso, welche Frage damit offen bleibt. So können Sie sich Ihr eigenes Urteil bilden.',
  ],
  // DAS FOTO — gewählt am 2026-09-08, nicht erfragt (Christian: "das Foto
  // sucht ihr auch aus"). Es ist ein ECHTES Foto von ihm aus UNSEREM eigenen
  // Bestand: die Datei liegt in den Shopify-Files des DACH-Shops und wird
  // heute schon auf unserer eigenen Seite ausgeliefert (app/components/kurse/
  // Superhuman.jsx, dort mit alt "Christian Bernd Bauer").
  //
  // WARUM DIESE UND NICHT EINE DER DREI ANDEREN: in den Shopify-Files stehen
  // vier Portraets von ihm. Gewählt wurde nach den vier Eignungskriterien des
  // Auftrags — Gesicht erkennbar, ruhiger Hintergrund, quadratisch
  // beschneidbar, ausreichende Aufloesung. Nur diese erfuellt alle vier:
  // die 512x512-Fassung hat eine unruhige gruene Landschaft im Ruecken, die
  // beiden ~300px-Fassungen reichen für 96 CSS-px bei dpr 3 (288 px) nicht.
  // Master 1200x1535, über die CdnBild-Leiter ausgeliefert mit 3 956 B
  // (width=96) bis 11 852 B (width=288) als image/webp — der Browser zieht
  // GENAU EINE Sprosse. Ohne Größen-Parameter wären es 90 438 B.
  foto: {
    bild_id:
      'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845',
    alt: 'Portraitfoto von Christian Bernd Bauer',
    // Echte Masterbreite: klemmt die srcset-Leiter, damit keine Sprosse ihren
    // w-Deskriptor ueberzeichnet (shopifyBildQuellen kennt den Master sonst nicht).
    masterBreite: 1200,
  },
};

/**
 * Soll der Kasten für DIESEN Abruf gerendert werden?
 *
 * WARUM `live` EIN PARAMETER IST UND NICHT NUR DIE KONSTANTE:
 * Der Aufrufer uebergibt ihn nie — der Vorgabewert IST die Konstante, das
 * Verhalten der Route ist unveraendert. Er existiert für die Prüfung. Vor dem
 * 2026-09-08 las die hermetische Probe die Konstante direkt und war damit an
 * den DAMALIGEN Zustand verdrahtet: sie bewies "das Flag ist zu, und zu heißt
 * unsichtbar". Beim Umlegen auf `true` wäre genau der Arm rot geworden, der
 * die ZU-Richtung absichert — und die naheliegende Heilung (den Arm loeschen)
 * haette den Rueckweg ungeprueft gelassen, ab dem Moment, in dem er gebraucht
 * wird. Mit dem Parameter beweist die Probe BEIDE Richtungen zu jeder Zeit:
 * dass `true` zeigt, und dass `false` fail-closed schließt.
 *
 * @param {URL|string|null|undefined} url
 * @param {boolean} [live=AUTORENKASTEN_LIVE]
 * @returns {{sichtbar: boolean, vorschau: boolean}}
 */
export function autorenkastenSichtbarkeit(url, live = AUTORENKASTEN_LIVE) {
  if (live) return {sichtbar: true, vorschau: false};
  let wert = null;
  try {
    const u = typeof url === 'string' ? new URL(url) : url;
    wert = u?.searchParams?.get(AUTORENKASTEN_VORSCHAU_PARAM) ?? null;
  } catch {
    // Eine unbrauchbare URL ist KEIN Grund, etwas zu zeigen: fail-closed.
    return {sichtbar: false, vorschau: false};
  }
  const vorschau = wert === AUTORENKASTEN_VORSCHAU_WERT;
  return {sichtbar: vorschau, vorschau};
}
