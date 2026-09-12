/**
 * MESSAGE-MATCH-ZIELE DER AD-WEICHE (Grossjob
 * 20260911-...-tracking-landingpage-hypothesen, Segment s04).
 *
 * DAS PROBLEM, GEMESSEN UND NICHT VERMUTET (2026-09-12):
 * Am 2026-07-24 sind sieben Message-Match-Landingpages fertig geworden
 * (app/components/campaign/Mm*.jsx, alle mtime 2026-07-24) — je eine Seite,
 * die das Versprechen EINER Ad-Welle woertlich aufnimmt. Am SELBEN Tag wurde
 * die Ad-Traffic-Weiche dekretiert, die jeden bezahlten Klick auf LP A
 * umleitet. Seither sind diese Seiten live, noindex, in der lp_registry —
 * und bekommen baulich keinen einzigen bezahlten Klick.
 * Am Kundenrand nachgemessen (events.db, ERSTE Landung je session_id,
 * utm_medium=paid, url_host=qiblanco.com, 14 Tage): über 99 Prozent der
 * bezahlten Meta-Landungen liegen auf LP A.
 *
 * WARUM DAS TEURER IST ALS ES KLINGT: LP A ist die EINZIGE Seite dieser
 * Familie, die das hauseigene Beauty-Gate NICHT besteht (Schwelle 80).
 * Gelesen aus homepage-bauer/exports/design-reviews/audits/<seite>/
 * design-review.json am 2026-09-12:
 *   /pages/haelt-das-mein-leben-aus  84 bestanden
 *   /pages/wir-machen-ihn-auf        83 bestanden
 *   /pages/zellstudien-ehrlich       80 bestanden
 *   /pages/zell-schutz               80 bestanden
 *   /pages/schlaf-zellen-schutz      78 NICHT bestanden   <- Ziel der Weiche
 * Die Weiche schickt also den gesamten bezahlten Verkehr auf die einzige
 * Seite, die durchfaellt, und an den vier vorbei, die bestehen.
 *
 * WAS HIER NEU IST — UND WAS AUSDRÜCKLICH NICHT:
 * Neu ist ein ZIEL je Anzeige. Die Ad-ID liest die Weiche bereits
 * (adIdAusQuery: utm_content, sonst h_ad_id; 98,7 Prozent Deckung über
 * 14 Tage). Es kommt also kein neuer Erkennungsweg dazu, nur ein anderes
 * Ziel auf einer vorhandenen Erkennung. NICHT gebaut wird: eine neue Seite
 * (es fehlt keine — für 10 der 11 aktiven DE-Anzeigen existiert eine
 * passende, das Gate bestehende LP), eine Aenderung an Meta (AdCreative ist
 * unveraenderlich, POST gibt HTTP 400 subcode 1815573) und ein zweiter
 * Konfigurations-Kanal.
 *
 * WARUM DIE KARTE IM CODE STEHT UND NICHT IN zuteilung.json:
 * zuteilung.json führt bereits eine Ad->LP-Tabelle (Feld `herkunft`,
 * 18 Eintraege). Sie taugt hier NICHT als Traeger, aus zwei gemessenen
 * Gruenden: (1) sie wird vom täglichen lp-rotation-Tick frisch berechnet
 * (src/zuteilung.py baue_inhalt) und ist KEIN Hand-Feld — ein Eintrag von
 * Hand wäre am nächsten Morgen um 05:35 weg; (2) ihre Werte stammen aus
 * lp-rotation/konstanten LP_PFAD und kennen nur die vier Rotations-LPs
 * A/B/C/D — /pages/haelt-das-mein-leben-aus kann sie gar nicht ausdruecken.
 * Die Karte ist deshalb Programmtext: git-versioniert, im Review sichtbar,
 * hermetisch testbar, ohne zusaetzlichen Netz-Hop im Hot-Path. Der
 * KILL-Schalter dagegen muss ohne Deploy wirken und liegt darum weiterhin in
 * zuteilung.json (Feld `ad_weiche_mm`, Hand-Feld wie `ad_weiche`).
 *
 * DIE ZUORDNUNG IST NICHT GERATEN — sie folgt dem Anzeigentext. Die Anzeigen
 * einer Welle tragen BYTE-IDENTISCHEN primary_text (gemessen an
 * ads_steuerung.db ad_content, status='active'); sie unterscheiden sich nur
 * im Video. Eine Seite bedient deshalb je 2-4 Anzeigen.
 */

/** Marker in der Ziel-URL: m = Message-Match. Unterscheidbar von
 * w (Weiche), v (LP-A/B-V2), r (lp-pause), f/h/p/b (go-router). Der Marker
 * ist für die Attribution gedacht — die ARM-TRENNUNG für die
 * Vorher-Nachher-Messung hängt NICHT an ihm, sondern am Landepfad:
 * events.db speichert in url_path keinen Query-String (0 Zeilen mit '?'),
 * ein lp_m-Wert wäre dort also gar nicht lesbar. */
export const MM_MARKER = 'm';

/**
 * Anteil (0-100) der bezahlten Klicks einer zugeordneten Anzeige, die auf
 * ihre eigene Seite gehen. Der Rest bleibt auf LP A und ist der KONTROLLARM.
 *
 * WARUM UEBERHAUPT EIN SPLIT UND NICHT 100 PROZENT: Christians Dekret vom
 * 2026-07-24 lautet "ALLE Ads landen auf LP A". Eine Maschine ueberstimmt
 * keinen Menschen — sie legt ihm eine Messung vor. Der Split macht aus der
 * Zuordnung einen TEST mit lebendem Kontrollarm statt einer Ersetzung, und
 * genau das verlangt Christians juengere Anweisung vom 2026-09-11
 * ("alles durchgehen", Erfuellungskriterium "mit Vorher-Nachher-Messung").
 * 50/50 wie beim Bestands-Split lp-ab-v2 (gleiche Power je Arm).
 */
export const MM_ANTEIL_PROZENT = 50;

/**
 * Ad-ID -> Zielseite. Schluessel sind Plattform-Ad-IDs als String.
 *
 * Jede Zeile nennt die Anzeige im Klartext, das Versprechen, das die Seite
 * aufnimmt, und den Design-Score der Seite (Schwelle 80). Eine Seite ohne
 * bestandenen Beleg gehört NICHT in diese Karte — sonst würde die Weiche
 * bezahlten Verkehr auf eine Flaeche lenken, die das eigene Gate nicht
 * besteht, und der Fehler von LP A wäre nur verschoben.
 */
export const MM_ZIELE = Object.freeze({
  // --- Welle B3 "Alltagsdemo", headline "Hält das meinen Alltag aus?"
  //     Versprechen: Duschen, Sport, Sauna, Schlafen — er bleibt dran.
  //     Seite: MmHaeltDasAus.jsx, Score 84 (Beleg 2026-09-08). Ihr eigener
  //     Routen-Kommentar nennt die Ad-Welle namentlich ("Ad-Welle B: qb45-b3").
  '120251810451900704': '/pages/haelt-das-mein-leben-aus', // B3 Hook1 Wasser
  '120251810453940704': '/pages/haelt-das-mein-leben-aus', // B3 Hook2 Fragespiegel
  '120251810454960704': '/pages/haelt-das-mein-leben-aus', // B3 Hook3 Material

  // --- Welle C1 "Aufmachen", headline "Jetzt weißt du, was du trägst"
  //     Versprechen: "Ist das nicht ein Scam? Faire Frage — also machen wir
  //     ihn auf": Gitterchip, Chirurgenstahl, Bayern, präklinisch in vitro.
  //     Seite: MmWirMachenIhnAuf.jsx, Score 83 (Beleg 2026-09-08).
  '120252458563300704': '/pages/wir-machen-ihn-auf', // C1 Hook1
  '120252458564580704': '/pages/wir-machen-ihn-auf', // C1 Hook2
  '120252458565780704': '/pages/wir-machen-ihn-auf', // C1 Hook3
  '120252458566560704': '/pages/wir-machen-ihn-auf', // C1 Hook4

  // --- Welle B5 "FuenfFragen", headline "Fünf ehrliche Antworten"
  //     Versprechen: "Wirkt das wirklich? Wir zeigen, was gemessen ist: vier
  //     präklinische Zellstudien, ehrlich gelabelt."
  //     Seite: MmZellstudienEhrlich.jsx, Score 80 (Beleg 2026-09-10).
  //     ABWEICHUNG VON zuteilung.json, bewusst und benannt: die dortige
  //     `herkunft`-Tabelle führt genau diese beiden IDs auf
  //     /pages/zell-schutz. Dieser Eintrag ist seit jeher WIRKUNGSLOS
  //     (Feld `modus` steht auf 'aus', KASKADEN_TIEFE['aus'] = 0 — die
  //     Tabelle hat keinen Leser), und /pages/zell-schutz nimmt das
  //     Zellstudien-Versprechen nicht woertlich auf. Wird `modus` je
  //     eingeschaltet, fuehren zwei Stellen dasselbe Ziel — dann gilt die
  //     Regel "zwei Stellen fuehren denselben Status" und eine der beiden
  //     muss weichen. Als offene Flanke im RESULT benannt.
  '120251810595810704': '/pages/zellstudien-ehrlich', // B5 Hook1 Metahook
  '120251810596960704': '/pages/zellstudien-ehrlich', // B5 Hook2 Schwerstefrage
});

/**
 * BEWUSST NICHT IN DER KARTE (die Abwesenheit ist eine Aussage, kein Loch):
 *
 *  - 120250590409220704 "DE | TOF-A | Frequency-Hook-3" — mit 1702
 *    Erst-Landungen/14d die groesste aktive Anzeige. Ihr Versprechen
 *    (Referenzfeld, tieferer Schlaf, klareres Denken, mehr Energie) ist von
 *    LP A "Schlaf & Zellen-Schutz" thematisch bereits gedeckt; die einzige
 *    spezifischere Seite /pages/tiefer-schlaf faellt mit Score 67 durch das
 *    Beauty-Gate. Eine Zuordnung wäre hier eine Verschlechterung.
 *  - 120251220869070704 "DE | TOF-C | Unternehmer-Hook2" — 741 Erst-Landungen/14d
 *    und damit der groesste Posten, den diese Karte haette tragen können.
 *    Sie stand hier, bis die Nachmessung ihr Ziel widerlegt hat: der
 *    gespeicherte Beleg von /pages/zell-schutz sagte 80 bestanden (2026-09-11),
 *    frisch gemessen am 2026-09-12 sagt dieselbe Rubrik 78 — NICHT bestanden,
 *    exakt gleichauf mit LP A. Die Anzeige dorthin zu leiten wäre die
 *    Wiederholung des Defekts, den dieser Bau behebt: bezahlter Verkehr auf
 *    eine Flaeche, die das eigene Gate nicht besteht. Kommt zell-schutz über
 *    80, gehört diese Zeile zurück — die Befundliste dafür steht im RESULT.
 *    LEHRE: ein design-review.json trägt ein DATUM, keinen Zustand.
 *  - 120251221856670704 / 120251221858640704 (BESTOF-Revivals) — beide ohne
 *    destination_url und ohne wellenspezifisches Versprechen; sie werben die
 *    Marke, nicht eine Frage. LP A ist für sie das richtige Ziel.
 *  - /pages/wirkt-das — Score 89, die beste Seite der Familie, und trotzdem
 *    gesperrt: am 2026-08-31 von Christian DIREKT aus Menue, Index und
 *    Sitemap genommen (Job 20260831-vollzug-wirkt-das-aus-menue-und-index-
 *    nehmen-prio6). Eine Maschine ueberstimmt keinen Menschen.
 */

/**
 * WARUM DER SCHALTER NICHT HIER STEHT, sondern in ad-weiche.server.js
 * (mmAktivAusRoh) — das ist kein Stilfrage, sondern eine NAHT:
 * lp-rotation/pruefungen/probe_handfelder_ueberleben_tick.py (ARM-NAHT)
 * erzwingt, dass JEDES Feld, das die Storefront ROH aus zuteilung.json liest,
 * drueben in HAND_FELDER steht — sonst loescht der tägliche Tick es um 05:35.
 * Ihr Detektor liest aber nur Dateien, die die Konstante mit der
 * Zuteilungs-URL enthalten, und sucht dort nach `<var>.<feld>` mit <var> aus
 * `await res.json()`. (Deshalb steht dieser Name hier ausgeschrieben NICHT:
 * bereits seine blosse ERWAEHNUNG in einem Kommentar machte diese Datei für
 * den Detektor zum Roh-Leser ohne json()-Bauform — die Probe fiel real auf
 * exit 4 MESSAUSFALL, gemessen 2026-09-12 beim Bau dieses Moduls.) Stuende der
 * Zugriff `roh.ad_weiche_mm` in DIESER Datei, saehe die Naht ihn nie und der
 * Schutz des Feldes wäre still unbewacht. Deshalb liegt der Feldzugriff
 * dort, wo er gesehen wird, und hier nur die reine Entscheidung.
 */

/** Pfade, auf die diese Karte ueberhaupt zeigen darf. EINE Definition,
 * damit Schleifenschutz und Test dieselbe Menge lesen wie die Weiche. */
export const MM_ZIELPFADE = Object.freeze([...new Set(Object.values(MM_ZIELE))]);

/**
 * Reine Entscheidungsfunktion: welcher LP-Pfad gilt für diese Anzeige?
 * Liefert null, wenn die Anzeige nicht zugeordnet ist, der Schalter aus ist,
 * der Wuerfel in den Kontrollarm faellt — oder wenn das Ziel der Pfad ist,
 * auf dem der Klick ohnehin schon steht.
 *
 * DER LETZTE PUNKT IST DER SCHLEIFENSCHUTZ und er ist nicht theoretisch: die
 * Weiche feuert auf JEDER Dokument-Route. Ohne ihn würde eine zugeordnete
 * Anzeige, deren Klick auf ihrer eigenen Zielseite ankommt (genau der Fall
 * TOF-C: destination_url = /pages/zell-schutz), endlos auf sich selbst
 * umgeleitet. Die DEV-DB-Regel im Kopf von ad-weiche.server.js verlangt
 * genau diese Prüfung für jede Route, die ihrerseits weiterleitet.
 * Er ersetzt zugleich einen Eintrag in AUSSCHLUSS_SEGMENTE: ein dortiger
 * Eintrag würde die Weiche auf diesen Seiten für ALLE Anzeigen abschalten,
 * auch für die nicht zugeordneten — diese Prüfung wirkt nur dort, wo sie
 * muss.
 *
 * @param {string} aktuellerPfad  z.B. '/' oder '/pages/zell-schutz'
 * @param {string | null} adId
 * @param {URLSearchParams} searchParams
 * @param {boolean} aktiv  Ergebnis von mmAktivAusRoh() — der Schalter wird
 *   bewusst DRUEBEN in ad-weiche.server.js gelesen, siehe Hinweis unten
 * @param {() => number} [zufall]
 * @returns {string | null}
 */
export function mmZielPfad(aktuellerPfad, adId, searchParams, aktiv, zufall = Math.random) {
  if (!adId || !aktiv) return null;
  const ziel = MM_ZIELE[adId];
  if (!ziel) return null;
  if (ziel === aktuellerPfad) return null; // Schleifenschutz, siehe oben

  // VARIANTEN-PIN (Muster lp-ab-v2 entscheideLpAbV2, dort nach einem real
  // beobachteten Kollateral-Defekt eingebaut): ein Zufalls-Split macht die
  // Quell-URL für JEDES Messwerkzeug mehrdeutig. Ohne Pin wäre die
  // Abnahme-Probe auf einen Zufallsarm angewiesen, und der tägliche
  // Design-Watch könnte der Weiche folgen und den Beleg der falschen Seite
  // ueberschreiben — hb-deploy Gate 9 liest genau diese Datei.
  //   ?lp_mm=an  -> immer die Message-Match-Seite
  //   ?lp_mm=aus -> immer LP A (Kontrollarm)
  // Der Kill-Schalter dominiert weiterhin (er steht oben, vor dem Pin).
  const pin = searchParams && searchParams.get('lp_mm');
  if (pin === 'aus') return null;
  if (pin === 'an') return ziel;

  if (MM_ANTEIL_PROZENT <= 0) return null;
  if (zufall() * 100 >= MM_ANTEIL_PROZENT) return null; // Kontrollarm: LP A
  return ziel;
}
