/**
 * IG-Testimonial-Korpus der Produktseiten — Datenquelle, kein Layout.
 *
 * NICHT VON HAND PFLEGEN. Erzeugt von
 * jobdaten/gross/<job>/baue_datenschicht.py aus den Messdaten des Segments s01
 * (claude-jobs/20260911-GROSSJOB-ig-testimonial-slideshow-…/reels-gemessen.json).
 * Kommt Nachschub, wird neu erzeugt statt nachgetippt.
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
 * juengste zuerst.
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
 *
 * Umlaute: diese Datei trägt keinen kundensichtbaren Fliesstext -- was der
 * Kunde liest, entsteht in der Komponente (s03). Die Kommentare hier tragen
 * trotzdem echte Umlaute, und zwar nicht aus Geschmack: das Umlaut-Gate des
 * Deploys (homepage-bauer/src/umlaut_gate.py, Gate 7b) scannt JEDE
 * hinzugefuegte Zeile einer .js-Datei gegen sein Lexikon und unterscheidet
 * Kommentar nicht von Kundentext. Gemessen 2026-09-11 in s05: 16 Zeilen
 * dieser Datei blockten den Merge. Ausgenommen bleiben Pfade und Bezeichner
 * (jobdaten/gross/...) -- dort ist der Digraph der WAHRE Name.
 */
export const IG_TESTIMONIALS = [
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
  },
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
  },
];
