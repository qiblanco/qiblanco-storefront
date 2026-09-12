/**
 * IG-Testimonial-Korpus der Produktseiten — Datenquelle, kein Layout.
 *
 * NICHT VON HAND PFLEGEN. Erzeugt von baue_datenschicht.py aus den Messdaten
 * des Segments s01; beide liegen im Job-Verzeichnis
 * claude-jobs/20260911-GROSSJOB-ig-testimonial-slideshow-… (reels-gemessen.json).
 * Kommt Nachschub, wird neu erzeugt statt nachgetippt.
 *
 * ==================== NUTZUNGSRECHTE: GEKLÄRT, NICHT ZU PRÜFEN ====================
 *
 * Christian am 2026-09-12, wörtlich: „Für die anderen Reels haben wir auch die
 * vollen Rechte."
 *
 * Damit gilt für ALLE hier geführten Reels — eigenes wie fremdes Konto —, dass
 * wir die vollen Nutzungsrechte an den VIDEOS haben. Der Inhaber hat das
 * entschieden; es ist NICHT zu prüfen, nicht nachzurecherchieren und nicht
 * erneut vorzulegen. Die früher geführte Trennung „41 eigene / 26 fremde" ist
 * als RECHTEfrage gegenstandslos.
 *
 * Sie bleibt für genau eines nützlich: WESSEN NAME UNTER DER KACHEL STEHT.
 * Das ist Redlichkeit und Wirkung, nicht Erlaubnis — ein Testimonial ohne
 * erkennbaren Menschen wirkt nicht. Deshalb trägt ein T3-Eintrag weiterhin
 * keine Namenszeile.
 *
 * NICHT umfasst: Kommentare und fremde TEXTE. Es geht um die Videos.
 * Tiefer verankert als Regel `volle-rechte-an-allen-geernteten-reels`
 * (coworker-brain, conf=hoch). Eingetragen von Job
 * 20260912-REPAIR-ig-reihe-…-und-zeigt-creator-mehrfach (die vollstaendige
 * Kennung steht im RESULT; hier gekürzt, weil das Umlaut-Gate eine blanke
 * Job-Kennung nicht als Slug maskiert und an einem Lexikon-Wort DARIN den
 * Merge blockt — der weggelassene Teil enthielt genau so eines).
 *
 * ==================== WARUM DER KORPUS SO AUSSIEHT ====================
 *
 * Die Quelle ist eine Liste von 71 Zeilen aus einem Google Doc. Daraus wurden
 * 67 distinkte Reels; hier stehen 66 PRODUKT-SLOTS über 65 distinkte Codes.
 * Die Differenz ist gemessen und KEIN Versehen:
 *
 *  - EIN Code faellt raus: DV1iezlChh0 (ein /p/-Post unter "isabellegloria",
 *    QiOne). Er gibt an der Plattform alle og-Felder leer zurück, genau wie
 *    ein frei erfundener Code — also geloescht oder privat. Ein toter Link ist
 *    kein Material.
 *  - EIN WEITERER Code faellt raus: DK2UrxwKRf2 (@vanessastehler). Er ist
 *    ÖFFENTLICH -- die og-Messung liefert Konto, Datum und Bildtext --, aber
 *    NICHT EINBETTBAR: der /embed/-Pfad antwortet im echten Browser byte-gleich
 *    wie ein erfundener Code, dreimal gemessen, waehrend eine Positiv-Kontrolle
 *    vom SELBEN Konto jedes Mal ein Video lieferte. "Gibt es den Post?"
 *    beantwortet nicht "darf ich ihn zeigen?". (Dieser Posten stand bis
 *    2026-09-11 nicht im Kopf, und genau deshalb zaehlte er 67 statt 66.)
 *  - EIN Slot faellt raus: Cl8-fEsMJfr stand im Doc unter QiOne UND unter
 *    QiHome. Am Reel selbst gemessen ist es ein QiHome-Post ("When arranging
 *    our home…"); die QiOne-Zeile ist der Zuordnungsfehler.
 *  - EIN Code steht berechtigt ZWEIMAL: DZcBRn9tKn4 unter QiBracelet und unter
 *    Kakao. Dieselbe Person zu zwei Produkten ist keine Dublette.
 *
 * ==================== DIE DREI STUFEN ====================
 *
 * `stufe` sagt, WEM das Video gehört — gemessen am og:url der Plattform,
 * nicht geraten:
 *
 *  T1  Das Reel liegt auf einem PERSOENLICHEN Konto. Der Profil-Klick trifft
 *      die Person. 25 Codes.
 *  T2  Unser eigener qiblanco-Post, der die Person per @handle NENNT, UND das
 *      genannte Konto existiert (im Browser geprueft). Das Video ist unseres,
 *      der Klick führt auf ihr Profil. 6 Codes.
 *  T3  Unser eigener qiblanco-Post ohne nennbare Person. Der Klick führt auf
 *      UNSER Profil. 35 Codes.
 *
 *      EINER DAVON WAR BIS ZUM 2026-09-11 EIN T2: C0mSOn3sdCQ nennt im
 *      Bildtext @_kamyata_, und dieses Konto gibt es nicht mehr (3 von 3
 *      Browser-Laeufen "Seite wurde entfernt", Positiv-Kontrolle jedes Mal
 *      sauber). Ein Profil-Klick ins Leere ist schlechter als keiner.
 *      FOLGE, die niemand uebersehen soll: QiHome hat damit NULL fremde
 *      Konten im Korpus -- 3 Kacheln, alle von uns. Das ist die Stelle, an der
 *      Christian echtes Fremdmaterial fehlt; es ist keine Bauluecke.
 *
 * DASS T3 UEBERHAUPT DRINSTEHT, IST EINE ENTSCHEIDUNG, KEIN VERSEHEN.
 * Segment s01 hatte T3 weggelassen, mit guter Begründung: 61,2 % der Reels
 * liegen auf unserem eigenen Konto, und ein Profil-Klick auf uns selbst belegt
 * nichts. Christian hat diesen Befund gesehen und am 2026-09-11 anders
 * entschieden, woertlich: "Trotzdem einen tollen Slider machen mit dem ganzen
 * Material. Du kannst ja die Dinge, die nicht bei uns auf dem Account liegen,
 * als erstes einreihen — und wir dann dahinter."
 *
 * Wer hier also 34 "schwache" Eintraege sieht: sie sind NICHT versehentlich
 * hier, und sie gehoeren NICHT geloescht. Die Ordnung trägt die Aussage —
 * das Array ist je Produkt nach T1 → T2 → T3 sortiert, innerhalb der Stufe das
 * juengste zuerst; die AUSGEWAEHLTEN stehen davor in ihrem Rang (siehe unten).
 *
 * ==================== WELCHE 18 VON 66 DIE FLÄCHE TRAGEN ====================
 *
 * Christian am 2026-09-12, nachdem er die gebaute Fläche gesehen hatte,
 * wörtlich: "Hier sind oft ganz viele Videos vom gleichen Kuenstler, das kommt
 * nicht gut. Hier sollte jeder Künstler nur einmal gezeigt werden, das beste
 * Video." Das ist die JÜNGERE Weisung und eine unmittelbare Reaktion auf das
 * Ergebnis der aelteren — sie sticht.
 *
 * AUFGELÖST WURDE SIE NICHT DURCH LÖSCHEN. Der Korpus bleibt vollstaendig bei
 * 66 Slots; welche 18 der Kunde sieht, sagt das Feld `inDerReihe`. Damit halten
 * BEIDE Weisungen: "nichts fliegt raus" bleibt wahr (auch unser eigenes Konto
 * ist mit genau EINER Kachel vertreten, hinten einsortiert), und "jeder
 * Künstler nur einmal" ist erfüllt.
 *
 * WARUM DER KORPUS NICHT AUF DIE 18 SCHRUMPFT, und das ist kein Geschmack: drei
 * stehende Proben rechnen über die VOLLE Grundmenge. pruefe_auswahl.py ARM-D
 * rechnet die Auswahl aus diesem Korpus NEU und vergleicht sie mit auswahl.json
 * — über einem auf die Sieger geschrumpften Korpus wäre er weiter grün und
 * würde nichts mehr prüfen. probe_ig_links_leben.py prüft 65 Reel- und 17
 * Profil-Links, probe_ig_poster_inhalt.py 66 Poster; beide verlören zwei
 * Drittel ihres Gegenstands. Eine Grundmenge, die man am Erfolg ausrichtet,
 * misst die Abwesenheit des Problems.
 *
 * DIE ORDNUNG DER GEWAEHLTEN IST DER RANG AUS auswahl.json, nicht das Datum.
 * Sie folgt (Stufe, Sprache, Ersatzordnung) — genau dem Schlüssel, nach dem
 * die Komponente ihre Liste ohnehin noch einmal stabil nachsortiert. So ist
 * diese Nachsortierung ein No-Op; stünde hier das Datum, sähe der Kunde eine
 * andere Reihenfolge als die, die auswahl.json begründet.
 *
 * WAS "das beste" BEDEUTET, ehrlich: Christians Kriterium ist die Abrufzahl. Die
 * gibt es nicht — zweimal gemessen (im Haus nicht vorhanden; der ausgeloggte
 * Instagram-Embed zeigt sie selbst auch nicht, 0 von 65 Codes). Die Ersatz-
 * ordnung ist BENANNT und steht in auswahl.json je Kachel als `rang_grund`:
 * views → likes → Datum → Code. Sie steht dort und NICHT hier, weil sie
 * niemandem auf der Fläche erzählt wird: das Wort "beste" kommt auf keiner
 * Kachel vor, und keine Like-Zahl steht dort. Die Zahl war unser Werkzeug, sie
 * ist keine Empfehlung für den Kunden.
 *
 * ==================== DIE EINE GRENZE, DIE BLEIBT ====================
 *
 * KEIN T3-EINTRAG BEKOMMT EINE NAMENSZEILE. Wo keine Person dahintersteht,
 * steht keine da — ein Reel ohne Namen ist erlaubt, ein Reel mit falschem
 * Namen nicht. Deshalb trägt T3 `profil: "qiblanco"` und sonst nichts.
 *
 * 12 der T3-Bildtexte nennen eine Person beim VORNAMEN ohne Handle (Scott,
 * Joshua, Ezgi, Natalie, Constantin, Dominic, Yann, Gerome, Allesandro, Glen
 * und Jasmin, Dr. Manuel Burzler, Yves). Drei dieser Vornamen haben im selben
 * Korpus ein bekanntes Konto (thescottschwenk, joshuajholland, yvesunser).
 * Die Zuordnung Vorname → Handle ist trotzdem NICHT gemacht worden: sie wäre
 * geraten, und ein falsch zugeordnetes Testimonial ist schlimmer als gar
 * keines. Bestaetigt Christian einen dieser Namen, wandert der Eintrag nach
 * T2 und rutscht nach vorn — das ist der billigste Weg, die Flaeche zu
 * verbessern.
 *
 * ==================== FELDER ====================
 *
 *  code         Instagram-Shortcode. Einbettung: …/{typ}/{code}/embed/
 *  typ          "reel" | "p" — der Pfad unterscheidet sich, EIN Eintrag ist /p/
 *  konto        Konto, auf dem der Post LIEGT (Messung, og:url der Plattform)
 *  profil       Konto, auf das der Klick ZEIGT (T1/T3: = konto, T2: der Credit)
 *  profilUrl    daraus gebaut, Ziel des Profil-Klicks (target="_blank")
 *  verifiziert  Das Profil, auf das `profil` zeigt, ist als existierend
 *               BELEGT. Bei T1/T3 gilt das von der Messung her (das Konto
 *               kommt aus dem og:url der Plattform bzw. ist unser eigenes).
 *               Bei T2 kam der Handle aus UNSEREM Bildtext und wurde von s03
 *               im BROWSER nachgeprueft: instagram.com/<handle>/embed/, mit
 *               Positiv- UND Negativ-Kontrolle in jedem Lauf. Wer nicht
 *               bestand, ist gar nicht mehr T2 -- das Feld steht deshalb heute
 *               ueberall auf true und ist ein ZUSTAND, kein Vorbehalt.
 *  video        false = Bild-/Karussell-Post, kein Video. Die Komponente zeigt
 *               darauf KEINEN Play-Knopf: ein Knopf, der ein Video verspricht,
 *               das es nicht gibt, ist eine Luege. 65 von 65 Codes im Browser
 *               gemessen (nicht nur die verdaechtigen drei), Negativ-Kontrolle
 *               gehalten: es sind genau drei.
 *  sprache      "de" | "en" | "beide" | "keine" — aus dem Bildtext gemessen.
 *               Die Sprach-Ordnung (deutsch zuerst auf der deutschen Seite)
 *               hängt an der SEITE, nicht am Korpus, und ist hier deshalb
 *               bewusst NICHT einsortiert. Die Komponente sortiert stabil
 *               INNERHALB der Stufe nach — nie über Stufengrenzen hinweg.
 *  datum        ISO. Steht heute bei ALLEN 66 Eintraegen (s04, 2026-09-11).
 *               Bis dahin fehlte es bei 11 -- nicht weil die Plattform
 *               keines nennt, sondern weil das Messmuster den Praefix
 *               "- " verlangte, den Instagram nur setzt, wenn es Like-
 *               und Kommentarzahlen rendert. Das Datum wird aus derselben
 *               gemessenen Beschreibung geborgen, und der Treffer gilt nur,
 *               wenn das darin gefangene Konto dem autoritativen Konto aus
 *               og:url entspricht: ein im Bildtext ZITIERTES Fremdkonto
 *               darf kein Datum liefern. Pflichtfeld für VideoObject.
 *  posterPfad   Standbild auf UNSEREM CDN. Niemals ein cdninstagram-Link:
 *               video.poster ist eine SIGNIERTE URL mit ?st=/&oe= und
 *               verfaellt — ein Hotlink wäre eine Flaeche, die in Wochen
 *               leer ist. Die Poster sind geerntet und selbst gehostet.
 *  inDerReihe   true = diese Kachel steht auf der Fläche. Die Komponente
 *               rendert FAIL-CLOSED nur `inDerReihe === true`: fehlt das Feld,
 *               steht gar keine Kachel und die Sektion verschwindet — laut.
 *               Ein `!== false` hätte bei fehlendem Feld still alle 66
 *               zurückgebracht, also genau den behobenen Fehler.
 *  videoUrl     Die mp4 auf UNSEREM CDN — dieselbe Linie wie posterPfad, und
 *               hier ist sie der ganze Zweck des Baus. Der Instagram-Embed
 *               zeigt einem AUSGELOGGTEN Besucher eine Anmeldewand statt eines
 *               Videos (261 KB, live gemessen am 2026-09-12); für ihn spielte
 *               nichts. Die Datei ist deshalb heruntergeladen und gespiegelt,
 *               NIE verlinkt: alle 56 signierten Instagram-Quellen tragen
 *               ihren Ablauf im Klartext, und keine hielt länger als vier Tage.
 *               null = für diesen Code existiert keine spielbare Datei (9 von
 *               65: drei Bild-Posts, sechs ohne <video> auf beiden Embed-
 *               Varianten gepaart gegengeprüft). Die Komponente zeigt darauf
 *               keinen Play-Knopf.
 *
 * Umlaute: diese Datei trägt keinen kundensichtbaren Fliesstext -- was der
 * Kunde liest, entsteht in der Komponente (s03). Die Kommentare hier tragen
 * trotzdem echte Umlaute, und zwar nicht aus Geschmack: das Umlaut-Gate des
 * Deploys (homepage-bauer/src/umlaut_gate.py, Gate 7b) scannt JEDE
 * hinzugefuegte Zeile einer .js-Datei gegen sein Lexikon und unterscheidet
 * Kommentar nicht von Kundentext. Gemessen 2026-09-11 in s05: 16 Zeilen
 * dieser Datei blockten den Merge. WAS DAS GATE NICHT KANN und was hier zwei
 * Zeilen gekostet hat: es maskiert URL-, Slug- und Import-Segmente, aber
 * KEINE Dateipfade im Fliesstext -- ein Verzeichnisname mit ASCII-Digraph ist
 * dort ununterscheidbar von einem falsch geschriebenen Wort, und eine
 * Ersetzung macht aus dem wahren Namen einen falschen. Solche Pfade gehoeren
 * deshalb nicht in den Kommentar einer .js-Datei (als offene Flanke an
 * homepage-bauer gemeldet, nicht hier repariert).
 */
export const IG_TESTIMONIALS = [
  {
    code: "DUY4iOojqSh",
    produkt: "Kakao",
    stufe: "T1",
    typ: "reel",
    konto: "vanessastehler",
    profil: "vanessastehler",
    profilUrl: "https://www.instagram.com/vanessastehler/",
    verifiziert: true,
    video: true,
    datum: "2026-02-05",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-duy4ioojqsh--db2ff5efaebe.jpg?v=1789160999",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-duy4ioojqsh--2f0ee6d877e0.mp4?v=1789239635",
  },
  {
    code: "DZcBRn9tKn4",
    produkt: "Kakao",
    stufe: "T1",
    typ: "reel",
    konto: "maxinfreiheit",
    profil: "maxinfreiheit",
    profilUrl: "https://www.instagram.com/maxinfreiheit/",
    verifiziert: true,
    video: true,
    datum: "2026-06-11",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzcbrn9tkn4--3755578bda65.jpg?v=1789161035",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DW59RV8Db8k",
    produkt: "Kakao",
    stufe: "T1",
    typ: "p",
    konto: "maxinfreiheit",
    profil: "maxinfreiheit",
    profilUrl: "https://www.instagram.com/maxinfreiheit/",
    verifiziert: true,
    video: false,
    datum: "2026-04-09",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dw59rv8db8k--9c18e689fa30.jpg?v=1789161080",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DRK-x7OjATx",
    produkt: "Kakao",
    stufe: "T1",
    typ: "reel",
    konto: "gesunde.psyche",
    profil: "gesunde.psyche",
    profilUrl: "https://www.instagram.com/gesunde.psyche/",
    verifiziert: true,
    video: false,
    datum: "2025-11-17",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-drk-x7ojatx--b4d0b04d774b.jpg?v=1789161076",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DVJo5KcDepJ",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "gianky261",
    profil: "gianky261",
    profilUrl: "https://www.instagram.com/gianky261/",
    verifiziert: true,
    video: true,
    datum: "2026-02-24",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dvjo5kcdepj--a3ecd0f1605b.jpg?v=1789161002",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dvjo5kcdepj--2dea72403756.mp4?v=1789239644",
  },
  {
    code: "DZPDuPBu_i-",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "desiree_witschel",
    profil: "desiree_witschel",
    profilUrl: "https://www.instagram.com/desiree_witschel/",
    verifiziert: true,
    video: true,
    datum: "2026-05-26",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzpdupbu-i--dd93ce088f50.jpg?v=1789161030",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzpdupbu-i--f6a865d42fb1.mp4?v=1789239699",
  },
  {
    code: "DWRvSt1DfRD",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "xcreatorslife",
    profil: "xcreatorslife",
    profilUrl: "https://www.instagram.com/xcreatorslife/",
    verifiziert: true,
    video: true,
    datum: "2026-03-24",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dwrvst1dfrd--2a7b4686834d.jpg?v=1789161010",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dwrvst1dfrd--3905e70616a4.mp4?v=1789239652",
  },
  {
    code: "DXxEwcUM2tv",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "naehrstoffwissen",
    profil: "naehrstoffwissen",
    profilUrl: "https://www.instagram.com/naehrstoffwissen/",
    verifiziert: true,
    video: true,
    datum: "2026-04-30",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dxxewcum2tv--be1a963d268d.jpg?v=1789161020",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dxxewcum2tv--04f46161aae4.mp4?v=1789239659",
  },
  {
    code: "C0cPj-uPKlx",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "thescottschwenk",
    profil: "thescottschwenk",
    profilUrl: "https://www.instagram.com/thescottschwenk/",
    verifiziert: true,
    video: true,
    datum: "2023-12-04",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c0cpj-upklx--a9516081a431.jpg?v=1789160783",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c0cpj-upklx-web--8045aa502c97.mp4?v=1789239302",
  },
  {
    code: "DE7RtJ6MEIn",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-01-17",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-de7rtj6mein--f8a353b4928e.jpg?v=1789161071",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-de7rtj6mein--3d4497e9072f.mp4?v=1789239546",
  },
  {
    code: "DZz7q6JSvfX",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "naehrstoffwissen",
    profil: "naehrstoffwissen",
    profilUrl: "https://www.instagram.com/naehrstoffwissen/",
    verifiziert: true,
    video: true,
    datum: "2026-06-20",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzz7q6jsvfx--8ad46211f05b.jpg?v=1789161040",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzz7q6jsvfx--172fb574598a.mp4?v=1789238848",
  },
  {
    code: "DZcBRn9tKn4",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "maxinfreiheit",
    profil: "maxinfreiheit",
    profilUrl: "https://www.instagram.com/maxinfreiheit/",
    verifiziert: true,
    video: true,
    datum: "2026-06-11",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dzcbrn9tkn4--3755578bda65.jpg?v=1789161035",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DYY-_BhOmHy",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "desiree_witschel",
    profil: "desiree_witschel",
    profilUrl: "https://www.instagram.com/desiree_witschel/",
    verifiziert: true,
    video: true,
    datum: "2026-05-15",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dyy-bhomhy--b339a6110a4f.jpg?v=1789161024",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dyy-bhomhy-web--cebcbeaee323.mp4?v=1789239689",
  },
  {
    code: "DWWikE-jUwA",
    produkt: "QiBracelet",
    stufe: "T1",
    typ: "reel",
    konto: "maxinfreiheit",
    profil: "maxinfreiheit",
    profilUrl: "https://www.instagram.com/maxinfreiheit/",
    verifiziert: true,
    video: true,
    datum: "2026-03-26",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dwwike-juwa--a35c813a87d8.jpg?v=1789161015",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DOVx7GLCnaQ",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-09-08",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dovx7glcnaq--ed217fb0c9e9.jpg?v=1789160982",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dovx7glcnaq--23567c2802b0.mp4?v=1789239607",
  },
  {
    code: "DNiGzJEsKBv",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-08-19",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dnigzjeskbv--5f053cad3434.jpg?v=1789160978",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dnigzjeskbv--b3e3b5f137c9.mp4?v=1789239600",
  },
  {
    code: "DF4zZaXMeJw",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-02-10",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-df4zzaxmejw--0742f0704166.jpg?v=1789160958",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-df4zzaxmejw--d37b27416601.mp4?v=1789239569",
  },
  {
    code: "DFnbuLZsBHM",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-02-03",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dfnbulzsbhm--8ec647936735.jpg?v=1789160961",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dfnbulzsbhm--cc39609e872a.mp4?v=1789239577",
  },
  {
    code: "DEzqzkzRQ_Q",
    produkt: "QiBracelet",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-01-14",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dezqzkzrq-q--12819327466d.jpg?v=1789160953",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dezqzkzrq-q--a53146755f09.mp4?v=1789239562",
  },
  {
    code: "Cl8-fEsMJfr",
    produkt: "QiHome",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-12-09",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cl8-fesmjfr--13f144d04546.jpg?v=1789160878",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cl8-fesmjfr--c61ae980de41.mp4?v=1789239376",
  },
  {
    code: "DEpsd2OseT5",
    produkt: "QiHome",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2025-01-10",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-depsd2oset5--a423adbea0ec.jpg?v=1789160947",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-depsd2oset5--ab2697e781ed.mp4?v=1789239554",
  },
  {
    code: "C0mSOn3sdCQ",
    produkt: "QiHome",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-12-08",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c0mson3sdcq--95442d638403.jpg?v=1789160788",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c0mson3sdcq--f21b551fc938.mp4?v=1789239156",
  },
  {
    code: "DQCe9F3jP00",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "gianky261",
    profil: "gianky261",
    profilUrl: "https://www.instagram.com/gianky261/",
    verifiziert: true,
    video: true,
    datum: "2025-10-20",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dqce9f3jp00--df321f359483.jpg?v=1789160989",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dqce9f3jp00--79c96d98c6bc.mp4?v=1789239621",
  },
  {
    code: "DQcS62ljf9c",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "xcreatorslife",
    profil: "xcreatorslife",
    profilUrl: "https://www.instagram.com/xcreatorslife/",
    verifiziert: true,
    video: true,
    datum: "2025-10-30",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dqcs62ljf9c--74328077871d.jpg?v=1789160994",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dqcs62ljf9c--404107a78858.mp4?v=1789239628",
  },
  {
    code: "C-juBxzN_Jw",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "_kate_chernyak_",
    profil: "_kate_chernyak_",
    profilUrl: "https://www.instagram.com/_kate_chernyak_/",
    verifiziert: true,
    video: true,
    datum: "2024-08-11",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-jubxzn-jw--8beebaa116df.jpg?v=1789160767",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-jubxzn-jw--f7464fa3e03c.mp4?v=1789239066",
  },
  {
    code: "CbTJ_kChUQe",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "andi.lew",
    profil: "andi.lew",
    profilUrl: "https://www.instagram.com/andi.lew/",
    verifiziert: true,
    video: true,
    datum: "2022-03-19",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbtj-kchuqe--fa6eafa098af.jpg?v=1789160860",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbtj-kchuqe--a28de8649e36.mp4?v=1789239350",
  },
  {
    code: "CyGnSmVu4h0",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "stevefitatx",
    profil: "stevefitatx",
    profilUrl: "https://www.instagram.com/stevefitatx/",
    verifiziert: true,
    video: true,
    datum: "2023-10-07",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cygnsmvu4h0--b8c7cbff33ec.jpg?v=1789160920",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cygnsmvu4h0--f885da6e2904.mp4?v=1789239441",
  },
  {
    code: "DJb-pzBMjHs",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "yvesunser",
    profilUrl: "https://www.instagram.com/yvesunser/",
    verifiziert: true,
    video: true,
    datum: "2025-05-09",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-djb-pzbmjhs--4ea38a3bac29.jpg?v=1789160969",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-djb-pzbmjhs--9c460897430b.mp4?v=1789239584",
  },
  {
    code: "DAbBsVCsI4r",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "social._verena",
    profilUrl: "https://www.instagram.com/social._verena/",
    verifiziert: true,
    video: true,
    datum: "2024-09-27",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dabbsvcsi4r--0b1350ae31df.jpg?v=1789160928",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dabbsvcsi4r--2ff22e2d3888.mp4?v=1789239453",
  },
  {
    code: "CbfodD7O0tR",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "joshuajholland",
    profilUrl: "https://www.instagram.com/joshuajholland/",
    verifiziert: true,
    video: true,
    datum: "2022-03-24",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbfodd7o0tr--0a14ecc7b081.jpg?v=1789160866",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbfodd7o0tr--8494c61e37db.mp4?v=1789239358",
  },
  {
    code: "CWdvAkFvHB-",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "mario.prawira",
    profilUrl: "https://www.instagram.com/mario.prawira/",
    verifiziert: true,
    video: true,
    datum: "2021-11-19",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwdvakfvhb--6a543536d0d2.jpg?v=1789160820",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwdvakfvhb--d7889bbb4df0.mp4?v=1789239220",
  },
  {
    code: "C-o4vQQsv1H",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-08-13",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-o4vqqsv1h--be051bda5347.jpg?v=1789160771",
    inDerReihe: true,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-o4vqqsv1h--2a1d0674cd5c.mp4?v=1789239075",
  },
  {
    code: "DVgJM1bAs5m",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "morerawfood",
    profil: "morerawfood",
    profilUrl: "https://www.instagram.com/morerawfood/",
    verifiziert: true,
    video: true,
    datum: "2026-03-03",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dvgjm1bas5m--eafb6df977b0.jpg?v=1789161007",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "DQ4xTxBDZAC",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "gianky261",
    profil: "gianky261",
    profilUrl: "https://www.instagram.com/gianky261/",
    verifiziert: true,
    video: true,
    datum: "2025-11-10",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dq4xtxbdzac--5735f0140225.jpg?v=1789160985",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dq4xtxbdzac--88bc8efb573a.mp4?v=1789239614",
  },
  {
    code: "DMVjWgbCF19",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "gianky261",
    profil: "gianky261",
    profilUrl: "https://www.instagram.com/gianky261/",
    verifiziert: true,
    video: true,
    datum: "2025-07-20",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dmvjwgbcf19--ac4fb7422247.jpg?v=1789160973",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dmvjwgbcf19--b83936202977.mp4?v=1789239592",
  },
  {
    code: "DI_3Mrai_5Y",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "gianky261",
    profil: "gianky261",
    profilUrl: "https://www.instagram.com/gianky261/",
    verifiziert: true,
    video: true,
    datum: "2025-04-28",
    sprache: "de",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-di-3mrai-5y--2cffdbc2a4f2.jpg?v=1789160965",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "C-RtRpsthAL",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "_kate_chernyak_",
    profil: "_kate_chernyak_",
    profilUrl: "https://www.instagram.com/_kate_chernyak_/",
    verifiziert: true,
    video: true,
    datum: "2024-08-04",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-rtrpsthal--9aab811aebdd.jpg?v=1789160763",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c-rtrpsthal--33aab358a6c1.mp4?v=1789239057",
  },
  {
    code: "C0Yc_9ROt61",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "andi.lew",
    profil: "andi.lew",
    profilUrl: "https://www.instagram.com/andi.lew/",
    verifiziert: true,
    video: true,
    datum: "2023-12-02",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c0yc-9rot61--9d8aa621185b.jpg?v=1789160776",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "CYHc4RClQLb",
    produkt: "QiOne 2 Pro",
    stufe: "T1",
    typ: "reel",
    konto: "vanessastehler",
    profil: "vanessastehler",
    profilUrl: "https://www.instagram.com/vanessastehler/",
    verifiziert: true,
    video: false,
    datum: "2021-12-30",
    sprache: "en",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cyhc4rclqlb--a5c2bdb4f86c.jpg?v=1789161067",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "Cb0OoX4gL50",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "joshuajholland",
    profilUrl: "https://www.instagram.com/joshuajholland/",
    verifiziert: true,
    video: true,
    datum: "2022-04-01",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cb0oox4gl50--9e56029d97ec.jpg?v=1789160852",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cb0oox4gl50--1dac38698307.mp4?v=1789239333",
  },
  {
    code: "CWvtawPN9I6",
    produkt: "QiOne 2 Pro",
    stufe: "T2",
    typ: "reel",
    konto: "qiblanco",
    profil: "mario.prawira",
    profilUrl: "https://www.instagram.com/mario.prawira/",
    verifiziert: true,
    video: true,
    datum: "2021-11-26",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwvtawpn9i6--8706a1576fed.jpg?v=1789160825",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwvtawpn9i6--0d19a4308ec8.mp4?v=1789239228",
  },
  {
    code: "DD_uO7wsU3y",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-12-23",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dd-uo7wsu3y--279c25b79c6e.jpg?v=1789160936",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dd-uo7wsu3y--a3027821be8d.mp4?v=1789239467",
  },
  {
    code: "DDhaYihs-_T",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-12-13",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-ddhayihs-t--49025f7a1b5e.jpg?v=1789160941",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-ddhayihs-t--e73ade3f8c10.mp4?v=1789239474",
  },
  {
    code: "DCW4xEbMWen",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-11-14",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dcw4xebmwen--1e0dedf5d932.jpg?v=1789160932",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-dcw4xebmwen--0d7f16d8be96.mp4?v=1789239461",
  },
  {
    code: "C84UEDMMLjC",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-07-01",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c84uedmmljc--0bc1072ef69a.jpg?v=1789160805",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c84uedmmljc--f4d3ce1b3910.mp4?v=1789239197",
  },
  {
    code: "C8KC-Nusajm",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-06-13",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c8kc-nusajm--d9089fda957a.jpg?v=1789160809",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c8kc-nusajm--86af7075a1b8.mp4?v=1789239206",
  },
  {
    code: "C76ENsZMHto",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-06-07",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c76enszmhto--22628270d15e.jpg?v=1789160801",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c76enszmhto--ff3e9d1a9f39.mp4?v=1789239188",
  },
  {
    code: "C68WicCMCLL",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-05-14",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c68wiccmcll--655a982cde77.jpg?v=1789160797",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c68wiccmcll--2860056a8c15.mp4?v=1789239181",
  },
  {
    code: "C42-tl-sEyt",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-03-23",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c42-tl-seyt--2ccd5ab38933.jpg?v=1789160793",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c42-tl-seyt--0e35d8025fb5.mp4?v=1789239174",
  },
  {
    code: "C32DCyNMD4V",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2024-02-27",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-probelauf--0028ab410579.jpg?v=1789160327",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-c32dcynmd4v--731c3718f156.mp4?v=1789239165",
  },
  {
    code: "CyxwpFAMfoi",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-10-24",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cyxwpfamfoi--f0f6b0975400.jpg?v=1789160924",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cyxwpfamfoi--2f1647d8b6a9.mp4?v=1789239447",
  },
  {
    code: "CxXeQFXs_I2",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-09-19",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxxeqfxs-i2--26a90c260948.jpg?v=1789160916",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxxeqfxs-i2--157e4d292c26.mp4?v=1789239433",
  },
  {
    code: "Cwf1Lhusu3e",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-08-28",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwf1lhusu3e--a968a2d0b342.jpg?v=1789160912",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cwf1lhusu3e--18aadb491f21.mp4?v=1789239425",
  },
  {
    code: "Crd4akbsvth",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-04-25",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-crd4akbsvth--190386697a99.jpg?v=1789160906",
    inDerReihe: false,
    videoUrl: null,
  },
  {
    code: "CpUg_U_OiEe",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-03-03",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cpug-u-oiee--817251c533ad.jpg?v=1789160900",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cpug-u-oiee--7fe2fd530280.mp4?v=1789239415",
  },
  {
    code: "CoutMFKs_oA",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-02-16",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-coutmfks-oa--f398038b992d.jpg?v=1789160893",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-coutmfks-oa--7817a054b6bb.mp4?v=1789239406",
  },
  {
    code: "CofYlSIL9bC",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-02-10",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cofylsil9bc--5ee4a8a2b161.jpg?v=1789160890",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cofylsil9bc--71fe6ad424b6.mp4?v=1789239399",
  },
  {
    code: "CoNHl_WAoDz",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2023-02-03",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-conhl-waodz--b718bbe0c7b3.jpg?v=1789160885",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-conhl-waodz--1b4527725759.mp4?v=1789239391",
  },
  {
    code: "Clq86xkuqXw",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-12-02",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-clq86xkuqxw--de541087d688.jpg?v=1789160881",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-clq86xkuqxw--3c7da3dcbc55.mp4?v=1789239385",
  },
  {
    code: "CcGStWQJeeA",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-04-08",
    sprache: "keine",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-ccgstwqjeea--a2439c1ffa7d.jpg?v=1789160871",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-ccgstwqjeea--466adfd3e4ae.mp4?v=1789239367",
  },
  {
    code: "CbQSQROr83r",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-03-18",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbqsqror83r--f6c28424cc5c.jpg?v=1789160856",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cbqsqror83r--1dfdea330b7c.mp4?v=1789239340",
  },
  {
    code: "CaaMTjIvu3A",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-02-25",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-caamtjivu3a--ec3f339c6d1a.jpg?v=1789160847",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-caamtjivu3a--7e78b9aeece0.mp4?v=1789239326",
  },
  {
    code: "CZSGnxFq05P",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2022-01-28",
    sprache: "beide",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-czsgnxfq05p--28c2d79d912e.jpg?v=1789160840",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-czsgnxfq05p--fa7dbeff76ba.mp4?v=1789239317",
  },
  {
    code: "CXohjTvgKaD",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2021-12-18",
    sprache: "keine",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxohjtvgkad--65f4bd8ddbfe.jpg?v=1789160836",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxohjtvgkad--0c731751dfed.mp4?v=1789239310",
  },
  {
    code: "CXT10RPNcAC",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2021-12-10",
    sprache: "keine",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxt10rpncac--d490188d4e42.jpg?v=1789160831",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cxt10rpncac--b71eceba86c5.mp4?v=1789239235",
  },
  {
    code: "CWS-70UMhQE",
    produkt: "QiOne 2 Pro",
    stufe: "T3",
    typ: "reel",
    konto: "qiblanco",
    profil: "qiblanco",
    profilUrl: "https://www.instagram.com/qiblanco/",
    verifiziert: true,
    video: true,
    datum: "2021-11-15",
    sprache: "keine",
    posterPfad:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cws-70umhqe--7aca8f5d6e27.jpg?v=1789160815",
    inDerReihe: false,
    videoUrl:
      "https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-ig-testimonials--ig-cws-70umhqe--a0cab1fe6eb8.mp4?v=1789239213",
  },
];
