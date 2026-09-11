/**
 * Zentraler SEO-Helper (DACH-Storefront) — Canonical-Bausteine.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, analog
 * structured-data.js). Liefert ABSOLUTE Canonical-URLs für die
 * Route-`meta`-Exporte.
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 F_canonical):
 * react-router-7 rendert einen meta-Descriptor OHNE `tagName` als
 * `<meta ...>` mit allen Keys als Attribute (Renderschleife der
 * <Meta>-Komponente in den dist-Chunks von node_modules/react-router:
 * tagName -> title -> charset -> script:ld+json -> Fallback
 * `createElement('meta', {...metaProps})`). Ein Descriptor
 * `{rel:'canonical', href:X}` ergibt deshalb `<meta rel="canonical" href="X">`
 * — im Quelltext fast nicht von der korrekten Form zu unterscheiden, für
 * Suchmaschinen aber wirkungslos. Korrekt ist:
 *
 *     {tagName: 'link', rel: 'canonical', href: absoluteCanonical(pfad)}
 *
 * `isValidMetaTag` des Routers akzeptiert genau /^(meta|link)$/.
 *
 * WARUM ABSOLUT: react-router-7 merged `meta` NICHT baumweit (der nächste
 * Leaf gewinnt vollständig) — es gibt also keinen zentralen Ort, an dem ein
 * relativer Canonical serverseitig gegen die Produktions-Domain aufgeloest
 * wird. Auf einem Oxygen-Preview-Host würde ein relativer Canonical auf den
 * Preview-Host zeigen und die Preview-URL selbst kanonisieren. Ein absoluter
 * Canonical ist auf Preview wie Produktion identisch korrekt.
 *
 * API-KOMPATIBILITAET: Namen und Semantik von CANONICAL_ORIGIN und
 * absoluteCanonical() sind bewusst identisch zum Entwurf in PR #103
 * (geo/seo-entity-hygiene-dach), damit dessen breiterer Helper diese Datei
 * spaeter als Obermenge ersetzen kann statt neben ihr zu stehen.
 */

// Kanonische Produktions-Domain (apex). Quelle: TRACKING_PRODUCTION_HOSTS in
// app/lib/checkout-tracking.js. Canonicals zeigen IMMER hierauf, auch wenn die
// Seite gerade unter einer Preview-/Oxygen-URL ausgeliefert wird.
export const CANONICAL_ORIGIN = 'https://qiblanco.com';

/**
 * Absolute Canonical-URL für einen Pfad. Query/Hash werden entfernt, ein
 * abschliessender Slash (ausser Root) getrimmt.
 * @param {string} pathname
 * @returns {string}
 */
export function absoluteCanonical(pathname) {
  if (!pathname || pathname === '/') return `${CANONICAL_ORIGIN}/`;
  let p = String(pathname).split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return `${CANONICAL_ORIGIN}${p}`;
}

/**
 * Fertiger meta-Descriptor für den Canonical einer Route.
 * Rendert ein echtes `<link rel="canonical" href="...">`.
 * @param {string} pathname
 * @returns {{tagName: 'link', rel: 'canonical', href: string}}
 */
export function canonicalLink(pathname) {
  return {tagName: 'link', rel: 'canonical', href: absoluteCanonical(pathname)};
}

/**
 * Shopify-Page-Handles, die NICHT in den Google-Index gehören.
 *
 * WARUM DIESE LISTE HIER STEHT UND NICHT IN DER ROUTE (Befund SEO-2026-W33,
 * Stufe S0): sie hat ZWEI Leser — die Route `pages.$handle.jsx` (setzt
 * `robots: noindex`) und die Sitemap-Route (wirft den Eintrag raus). Stünden
 * zwei Listen nebeneinander, driften sie auseinander, und der häufigere Fall
 * ist der gefährliche: Seite trägt `noindex`, steht aber weiter in der
 * Sitemap — dann meldet die Search Console dauerhaft einen Konflikt, und
 * niemand sieht ihn, weil beide Einzelstellen für sich richtig aussehen.
 *
 * BELEGTER ANLASS: `/pages/development-nicht-loschen` ist eine
 * Entwicklungsseite und stand am 2026-08-14 auf Platz 4 der Suche nach
 * "Qi Blanco Studien" — sie war NICHT intern verlinkt (0 Treffer im
 * gerenderten HTML der Startseite), sondern ausschließlich über
 * `sitemap/pages/1.xml` auffindbar (lastmod 2025-02-02). Der Discovery-Pfad
 * ist also die Sitemap, und deshalb genügt `noindex` allein nicht.
 *
 * AUFNAHME-KRITERIUM: nur Seiten, die für Kunden keinen Zweck haben
 * (Entwicklungs-/Test-/Rest-Seiten). Eine Seite, die Kunden nutzen sollen,
 * gehört NIE hierher — dann ist die richtige Antwort besserer Inhalt, nicht
 * Unsichtbarkeit. Funnel-Bestätigungsseiten sind der Grenzfall, der trotzdem
 * hierher gehört: Kunden SEHEN sie (nach dem Absenden eines Formulars), aber
 * niemand SUCHT nach ihnen — sie sind Ziel eines Klicks, nie eines Treffers.
 *
 * ZWEI WIRKUNGEN, EINE QUELLE — und warum `ausSitemap` je Eintrag steht
 * (Befund s05 des Grossjobs 20260823-seo-…-indexhygiene…, 2026-08-23):
 * Bis hierher löste EIN Listeneintrag BEIDE Wirkungen zugleich aus, weil
 * beide Leser dasselbe Array bekamen. Für `development-nicht-loschen` war das
 * richtig. Für `/pages/pre-access` ist es GENAU FALSCHHERUM: die Seite hat
 * NULL eingehende interne Links (gemessen über 79 gecrawlte DACH-Seiten), die
 * Sitemap ist also der einzige Weg, auf dem Google sie noch besucht. Wer sie
 * im selben Deploy aus der Sitemap wirft, nimmt Google die Gelegenheit, das
 * frische `noindex` überhaupt zu LESEN — die Seite bliebe im Index und wäre
 * zugleich unerreichbar für die Korrektur. Das ist derselbe Defekt wie ein
 * `Disallow` in der robots.txt, nur durch die zweite Tür: das Ausschluss-
 * Signal muss crawlbar bleiben, bis es gewirkt hat.
 *
 * Deshalb: `ausSitemap: false` heißt „noindex ja, Sitemap-Eintrag bleibt
 * vorerst". Der Preis ist bewusst gewählt und benannt — für die Dauer des
 * Übergangs besteht der Zustand „noindex UND in der Sitemap", vor dem der
 * Absatz oben warnt. Er ist hier gewollt und endlich, nicht versehentlich.
 * Aufgelöst wird er, wenn das noindex nachweislich gewirkt hat; dann kippt
 * der Eintrag auf `ausSitemap: true`.
 *
 * Was hier NICHT passieren darf, ist eine ZWEITE Liste: die beiden Sichten
 * unten werden aus DIESER einen Definition abgeleitet, können also nicht
 * auseinanderdriften.
 * @type {Array<{handle: string, ausSitemap: boolean, grund: string,
 *               seit: string}>}
 */
export const NICHT_INDEXIERBARE_SEITEN_DEF = [
  {
    handle: 'development-nicht-loschen',
    ausSitemap: true,
    grund: 'Entwicklungsseite; Sitemap war ihr einziger Discovery-Pfad (2026-08-14)',
    seit: '2026-08-14',
  },
  // Neu 2026-08-23 (s05). Jeder Handle live gemessen: HTTP 200, KEIN
  // robots-meta, in `sitemap/pages/1.xml` geführt. Die ersten sechs tragen
  // NULL eigene Wörter (das leere DACH-Gerüst misst 424 Wörter, sie messen
  // exakt 424), die Funnel-Seiten wenige Zeilen.
  {
    handle: 'pre-access',
    ausSitemap: false,
    grund: 'leere Kampagnen-Restseite, stand auf Platz 2 der Suche nach "QiOne 2 Pro"',
    seit: '2026-08-24',
  },
  {
    handle: 'qibracelet_',
    ausSitemap: false,
    grund: 'leerer Handle-Vertipper zu /pages/qibracelet',
    seit: '2026-08-24',
  },
  {
    handle: 'qiblanco-qibracelet',
    ausSitemap: false,
    grund: 'leere Dublette zu /pages/qibracelet',
    seit: '2026-08-24',
  },
  {
    handle: 'kakao-anwendung-de',
    ausSitemap: false,
    grund: 'leere Sprachvariante zu /pages/kakao-anwendung',
    seit: '2026-08-24',
  },
  {
    handle: 'kakao-anwendung-us',
    ausSitemap: false,
    grund: 'leere Sprachvariante, rankte auf der DACH-Markensuche',
    seit: '2026-08-24',
  },
  {
    handle: 'zeremonie-kakao-language-select',
    ausSitemap: false,
    grund: 'leere Sprachweiche ohne Inhalt',
    seit: '2026-08-24',
  },
  {
    handle: 'anmeldung-erfolgreich',
    ausSitemap: false,
    grund: 'Funnel-Bestätigung: Klickziel, kein Suchziel',
    seit: '2026-08-24',
  },
  {
    handle: 'kw-anmeldung-erfolgreich',
    ausSitemap: false,
    grund: 'Funnel-Bestätigung: Klickziel, kein Suchziel',
    seit: '2026-08-24',
  },
  {
    handle: 'superhuman-anmeldung-erfolgreich',
    ausSitemap: false,
    grund: 'Funnel-Bestätigung: Klickziel, kein Suchziel',
    seit: '2026-08-24',
  },
  {
    handle: 'erinnerung-erfolgreich',
    ausSitemap: false,
    grund: 'Funnel-Bestätigung: Klickziel, kein Suchziel',
    seit: '2026-08-24',
  },
  {
    handle: 'superhuman-kurs-bestatigung',
    ausSitemap: false,
    grund: 'Funnel-Bestätigung: Klickziel, kein Suchziel',
    seit: '2026-08-24',
  },
  // Neu 2026-08-26 (s04 des Grossjobs …seo-rest-kanonisierung…). Diese fünf
  // sind derselbe Fall wie `pre-access` oben, nur später gefunden: sie waren
  // nicht im damaligen Suchraum. Gemessen wurde nicht die Wortzahl, sondern
  // die DIFFERENZ zu zwei nachweislich leeren Referenzseiten (`pre-access`,
  // `qibracelet_` — beide oben mit Begründung geführt): das Gerüst aus Kopf,
  // Navigation und Fuß ist damit abgezogen. Alle fünf messen 0 eigene
  // Textstücke, tragen also NULL eigenen Inhalt, liefern HTTP 200 und stehen
  // in `sitemap/pages/1.xml` (Beleg: belege/inhalts-delta.json, 20:12Z).
  //
  // `qiblanco` ist dabei der teuerste: eine leere Seite unter dem MARKENNAMEN
  // konkurriert mit der Startseite um genau die Suche, die am sichersten
  // konvertiert. Das ist der Präzedenzfall `pre-access` („stand auf Platz 2
  // der Suche nach QiOne 2 Pro"), nur eine Ebene wichtiger.
  {
    handle: 'qiblanco',
    ausSitemap: false,
    grund: 'leere Restseite unter dem Markennamen; konkurriert mit der Startseite',
    seit: '2026-08-27',
  },
  {
    handle: 'linkseite',
    ausSitemap: false,
    grund: 'leere Link-in-Bio-Restseite ohne eigenen Inhalt',
    seit: '2026-08-27',
  },
  {
    handle: 'one-inch',
    ausSitemap: false,
    grund: 'leere Kampagnen-Restseite (One Inch Club), laut Grossjob depubliziert',
    seit: '2026-08-27',
  },
  {
    handle: 'ketogenes-wochenende',
    ausSitemap: false,
    grund: 'leere Kursseite; die zugehörige Bestätigungsseite ist bereits noindex',
    seit: '2026-08-27',
  },
  {
    handle: 'superhuman-kurs',
    ausSitemap: false,
    grund: 'leere Kursseite; die zugehörige Bestätigungsseite ist bereits noindex',
    seit: '2026-08-27',
  },
  // Neu 2026-08-29 (Job 20260829-ads-ziel-url-verstoss-...). Achse B der
  // landing-bereich-Wache: beide Handles standen in `sitemap/pages/1.xml`,
  // tragen live aber `noindex,nofollow` — wir bieten Google also eine Seite
  // an, die wir ihm zugleich verbieten.
  //
  // DIESE BEIDEN GEHEN DIREKT AUF `ausSitemap: true`, ANDERS ALS DIE
  // ÜBERGANGS-EINTRÄGE DARÜBER: die Zweistufigkeit existiert für Seiten,
  // deren EINZIGER Discovery-Pfad die Sitemap ist — dort würde ein sofortiges
  // Entfernen dafür sorgen, dass Google das frische `noindex` nie liest. Hier
  // ist das `noindex` kein frisches Signal, sondern steht seit dem
  // IA-Zweiblock-Umbau vom 2026-07-17 (~6 Wochen, live nachgemessen am
  // 2026-08-29). Stufe 1 ist damit abgelaufen, nicht übersprungen.
  //
  // NEBENWIRKUNGS-PRÜFUNG: `NICHT_INDEXIERBARE_SEITEN` (Sicht 1) wird nur von
  // `pages.$handle.jsx` gelesen. Beide Handles haben eigene Code-Routen
  // (pages.partner.jsx, pages.qibracelet.jsx) und laufen nie durch den
  // Catch-all — der Eintrag ändert also KEIN robots-meta, nur die Sitemap.
  // Insbesondere bleibt der öffentliche Zwilling /pages/qibracelet-details
  // unberührt, obwohl er denselben CMS-Handle 'qibracelet' abfragt.
  {
    handle: 'partner',
    ausSitemap: true,
    grund:
      'noindex-LP im Landing-Bereich (Partner-Funnel); stand trotz noindex in ' +
      'der Sitemap — Achse B der landing-bereich-Wache, gemessen 2026-08-29',
    seit: '2026-08-29',
  },
  {
    handle: 'qibracelet',
    ausSitemap: true,
    grund:
      'noindex-LP-Shopseite im Landing-Bereich; stand trotz noindex in der ' +
      'Sitemap. Der öffentliche Zwilling ist /pages/qibracelet-details und ' +
      'bleibt indexierbar — Achse B, gemessen 2026-08-29',
    seit: '2026-08-29',
  },
  // Neu 2026-08-31 (Vollzugsauftrag Christian, direkt). DIESER EINTRAG BRICHT
  // DAS AUFNAHME-KRITERIUM OBEN, UND ZWAR ABSICHTLICH — hier steht warum, damit
  // ihn niemand als Präzedenzfall missversteht.
  //
  // Das Kriterium lautet: „nur Seiten, die für Kunden keinen Zweck haben […]
  // Eine Seite, die Kunden nutzen sollen, gehört NIE hierher — dann ist die
  // richtige Antwort besserer Inhalt, nicht Unsichtbarkeit." `wirkt-das` HAT
  // einen Kundenzweck (der größte Einwand des Bestands, ew-01), und trotzdem
  // steht sie jetzt hier. Der Unterschied: die Entscheidung „besserer Inhalt
  // statt Unsichtbarkeit" IST getroffen worden — sie fiel gegen die Seite.
  // Christian am 2026-08-31 wörtlich: „die Seite ist so schlecht, dass sie
  // rausgenommen wird — also raus aus dem Reiter und nicht mehr crawlbar."
  // Das Kriterium schützt davor, schwachen Inhalt wegzuverstecken statt ihn zu
  // reparieren; es steht einer ausdrücklichen Rücknahme-Entscheidung nicht
  // entgegen. Wer die Seite wieder aufnimmt, repariert erst den Inhalt und
  // entfernt DANN diesen Eintrag — nicht umgekehrt.
  //
  // `ausSitemap: true` OHNE die Übergangsstufe `ausSitemap: false`: die
  // Begründung der Übergangsstufe („die Sitemap ist der einzige Weg, auf dem
  // Google die Seite noch besucht") gilt für Restseiten, die seit Jahren ohne
  // eingehende Links liegen. Diese Seite ging am 2026-08-26 live, stand fünf
  // Tage im Hauptmenü und auf der Produktseite und ist damit in der
  // Crawl-Frontier — sie wird auch ohne Sitemap-Eintrag wieder besucht und
  // trifft dann auf noindex in HTML und X-Robots-Tag. Der Widerspruch
  // „noindex UND in der Sitemap" entsteht hier also gar nicht erst.
  // Die beiden Einträge DIREKT DARÜBER (`partner`, `qibracelet`, 2026-08-29)
  // sind unabhängig zum selben Schluss gekommen und nennen dieselbe Bedingung:
  // die Zweistufigkeit existiert für Seiten, deren EINZIGER Discovery-Pfad die
  // Sitemap ist. Sie begründen ihr Überspringen mit „Stufe 1 ist abgelaufen"
  // (das noindex stand schon sechs Wochen), dieser hier mit „Stufe 1 ist
  // gegenstandslos" (die Sitemap war nie der einzige Weg). Zwei Wege, dieselbe
  // Regel — die Übergangsstufe ist die Ausnahme, nicht der Normalfall.
  //
  // WIRKUNG DIESES EINTRAGS IST NUR DIE SITEMAP: `/pages/wirkt-das` hat eine
  // EIGENE Route (`pages.wirkt-das.jsx`), die den Katchall `pages.$handle.jsx`
  // sticht — die Sicht `NICHT_INDEXIERBARE_SEITEN` erreicht sie deshalb nicht.
  // Das noindex-meta und der X-Robots-Tag stehen in der eigenen Route. Der
  // Eintrag hier bleibt trotzdem vollständig richtig: fiele die eigene Route
  // je weg, griffe der Katchall und trüge das noindex weiter.
  {
    handle: 'wirkt-das',
    ausSitemap: true,
    grund:
      'am 2026-08-31 von Christian wegen Textqualität zurückgezogen; URL bleibt 200, noindex in der eigenen Route',
    seit: '2026-08-31',
  },
];

/**
 * Seiten, die es NUR als Hydrogen-Route gibt — ohne Shopify-Seitenobjekt.
 *
 * WOZU: `getSitemap` zieht ausschließlich Shopify-Ressourcen. Eine Seite, die
 * allein aus einer Route in diesem Repo besteht, liefert HTTP 200 mit vollem
 * Inhalt und steht in KEINER Sitemap — gebaut und für die Suche unsichtbar.
 * Die Sitemap-Route trägt die Einträge dieser Liste deshalb nach.
 *
 * AUFNAHME-KRITERIUM, bewusst eng: (1) die Seite hat eine eigene Route in
 * app/routes/, (2) sie ist indexierbar gewollt (kein noindex), (3) es gibt eine
 * stehende Wache auf ihren Live-Zustand — sonst wird aus dem Eintrag still eine
 * 404-URL in der Sitemap. Wer hier ergänzt, nennt die Wache im Grund.
 *
 * DAS IST DIE ZWEITE BAUFORM, NICHT DIE ABLOESUNG DER ERSTEN: der Hausweg
 * "leeres Shopify-Seitenobjekt als Sitemap-Träger" (technologie, studien)
 * bleibt gültig und wird von hier NICHT angefasst. Diese Liste ist für
 * Seiten, deren Träger sichtbar im Repo stehen soll.
 * @type {Array<{pfad: string, grund: string}>}
 */
export const NUR_ROUTE_SEITEN = [
  {
    pfad: '/pages/quellen',
    grund:
      'Quellenübersicht des Wissensforums (Grossjob 20260908-KONZEPT-' +
      'fachartikel-…, Segment s05). Sie besteht allein aus der Route ' +
      'pages.quellen.jsx und hat KEIN Shopify-Seitenobjekt — ohne diesen ' +
      'Eintrag liefert sie HTTP 200 mit voller Liste und steht in keiner ' +
      'Sitemap. Sie beantwortet einen gemessenen Kundeneinwand wörtlich ' +
      '("Warum nicht einfach einen Link zu den Studien bereitstellen?"). ' +
      'Wache (Kriterium 3): homepage-bauer/pruefungen/' +
      'probe_quellen_seite_live.py — prüft INHALT (≥ 10 Quellen-Einträge ' +
      'mit verschiedenen Jahren, Rückweg in einen Artikel), nicht den ' +
      'Statuscode, und zusätzlich probe_werk_snapshot_frisch.py gegen das ' +
      'Veralten des eingebackenen Auszugs.',
  },
  {
    pfad: '/pages/erfahrungen',
    grund:
      'Am 2026-09-11 von Christian freigegeben („Aber ja, können wir auch ' +
      'freischalten … live schalten und crawlbar machen"), nachdem die Seite ' +
      'seit dem 2026-09-08 als Freigabe-Ansicht dunkel lag. Sie besteht allein ' +
      'aus der Route pages.erfahrungen.jsx und hat KEIN Shopify-Seitenobjekt — ' +
      'ohne diesen Eintrag liefert sie HTTP 200 mit 13 Menschen in 17 Videos ' +
      'und steht in keiner Sitemap. Ein Seitenobjekt anzulegen wäre der zweite ' +
      'mögliche Träger und ist bewusst NICHT gewählt: er läge im Fremdsystem, ' +
      'während dieser hier im Repo sichtbar ist. ' +
      'Wache (Kriterium 3): homepage-bauer/pruefungen/' +
      'probe_erfahrungen_hell.py — prüft am ausgelieferten HTML INHALT ' +
      '(Beitragstexte, nicht den Statuscode), Freischaltung (kein noindex, ' +
      'kein Disallow, Sitemap-Eintrag, Menü-Link), die strukturierten Daten ' +
      '(VideoObject je Video, Person je Mensch) und die Dublettenfreiheit ' +
      '(h3.erf__name eindeutig). Sie löst probe_erfahrungen_erreichbar_aber_' +
      'dunkel.py ab, deren Aussage mit der Freigabe überholt ist.',
  },
  {
    pfad: '/pages/warum-qi-blanco',
    grund:
      'Die Absicht — warum es Qi Blanco gibt, in der ersten Person und mit ' +
      'Autor und Datum ausgezeichnet (Auftrag 20260911-BAU-die-absicht-…). ' +
      'Sie besteht allein aus der Route pages.warum-qi-blanco.jsx und hat ' +
      'KEIN Shopify-Seitenobjekt — ohne diesen Eintrag liefert sie HTTP 200 ' +
      'mit vollem Text und steht in keiner Sitemap, was von aussen nicht ' +
      'davon zu unterscheiden ist, dass alles stimmt. Sie ist der einzige ' +
      'Text der Domain, der ZURECHENBAR beantwortet, warum es dieses ' +
      'Unternehmen gibt — der gemessene Anlass ist, dass Googles KI-Antwort ' +
      'zu uns null eigene Quellen von sechs zitiert. Wache (Arm E): ' +
      'homepage-bauer/pruefungen/probe_absicht_am_kundenrand.py — prueft ' +
      'den Sitemap-Eintrag zusammen mit Autor, Datum und der ' +
      'Verkaufstext-Freiheit am ausgelieferten HTML, nicht den Statuscode.',
  },
  {
    pfad: '/pages/affiliate-partnerprogramm',
    grund:
      'Eigene indexierbare Antwort auf "Qi Blanco Partnerprogramm" (Job ' +
      '20260905-eigene-indexierbare-partnerseite-...-prio25). Sie ersetzt die ' +
      'Vendor-Seite aff.revolution.qiblanco.com/register, die mit dem ' +
      'entschiedenen X-Robots-Tag über die ganze Subdomain aus dem Index ' +
      'faellt. Wache: homepage-bauer/pruefungen/' +
      'probe_partnerseite_naht_sitemap_route.py (Sitemap-Eintrag UND ' +
      'Routen-Marker live) sowie probe_partnerseite_inhalt_live.py.',
  },
  {
    pfad: '/pages/kritik',
    grund:
      'Eigene indexierbare Antwort auf "Qi Blanco Kritik" (Job 20260911-BAU-' +
      'kritikseite-freischalten-…-s02; Christian 2026-09-11 nach dem Lesen ' +
      'der Seite: "Live schalten und bei Mehr einbinden"). Sie besteht allein ' +
      'aus der Route pages.kritik.jsx und hat KEIN Shopify-Seitenobjekt — ein ' +
      'zweiter Träger für dieselbe Seite ist bewusst NICHT angelegt. Ohne ' +
      'diesen Eintrag liefert sie HTTP 200 mit voller Beweisführung und ' +
      'steht in keiner Sitemap. Kriterium 2 erfüllt: das noindex ist im ' +
      'selben Commit aus pages.kritik.jsx entfernt und durch canonicalLink() ' +
      'ersetzt. WACHE (Kriterium 3): homepage-bauer/pruefungen/' +
      'probe_zweifelsseite_dunkel.py --flaeche kritik, hängt als ' +
      'nachbau-audit h1afce75b. Sie verzweigt am Feld `status` der SSoT ' +
      'konzepte/abgrenzung-flaechen.json und prüft für `live_indexiert` die ' +
      'HELL-Arme: H1-INHALT (die zugesagten Randmarker, nicht der ' +
      'Statuscode), H2-ROBOTS (kein Disallow), H2-NOINDEX (kein noindex, ' +
      'aber Canonical), H2-SITEMAP (steht in einer real AUSGELIEFERTEN ' +
      'Sitemap — nicht nur in dieser Liste) und H3-VERLINKT.',
  },
];

/**
 * Sicht 1 — alle Handles, die ein `noindex` bekommen. Leser: die Route
 * `pages.$handle.jsx` (robots-meta UND X-Robots-Tag).
 * @type {string[]}
 */
export const NICHT_INDEXIERBARE_SEITEN = NICHT_INDEXIERBARE_SEITEN_DEF.map(
  (e) => e.handle,
);

/**
 * Sicht 2 — die TEILMENGE, die zusätzlich aus der Sitemap fliegt. Leser: die
 * Sitemap-Route. Immer eine Teilmenge von Sicht 1: aus der Sitemap fliegt nur,
 * was ohnehin schon `noindex` trägt — nie umgekehrt.
 * @type {string[]}
 */
export const AUS_SITEMAP_ENTFERNTE_SEITEN = NICHT_INDEXIERBARE_SEITEN_DEF.filter(
  (e) => e.ausSitemap,
).map((e) => e.handle);

/**
 * Gehört dieser Page-Handle aus dem Index?
 * @param {string|undefined} handle
 * @returns {boolean}
 */
export function istNichtIndexierbar(handle) {
  return !!handle && NICHT_INDEXIERBARE_SEITEN.includes(handle);
}

/**
 * meta-Descriptor, der eine Seite aus dem Index nimmt.
 * `noindex` schließt den Index aus, `nofollow` verhindert, dass die Seite
 * ihre Linkkraft weiterreicht — bei einer Entwicklungsseite ist beides
 * gewollt.
 * @returns {{name: 'robots', content: string}}
 */
export function noindexMeta() {
  return {name: 'robots', content: 'noindex,nofollow'};
}

/**
 * Die ZWEITE, vom HTML unabhängige Sperre desselben Signals (Hausmuster
 * D-006, „Gurt und Hosenträger"): greift auch bei einem Bot, der den
 * HTML-head nicht parst. Bewusst wortgleich zu dem, was die eigenen Routen
 * mit eigener Datei setzen (z. B. `pages.uebersicht.jsx`) — ein zweiter
 * Wortlaut wäre ein zweiter Wartungspunkt ohne Nutzen.
 * @returns {{'X-Robots-Tag': string}}
 */
export function noindexHeader() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

/**
 * Produkt-Handles, die NICHT in den Google-Index gehören.
 *
 * WARUM DIESE LISTE HIER STEHT (und zwei Vorgänger-Listen ersetzt):
 * Für Produkte existierte dieselbe Trennung bereits ZWEIMAL nebeneinander —
 * `HIDDEN_BUNDLE_PRODUCT_HANDLES` in `products.$handle.jsx` (setzt das
 * robots-meta) und `HIDDEN_PRODUCT_HANDLES` in der Sitemap-Route (wirft den
 * Eintrag raus). Beide trugen zufällig denselben Inhalt. Genau vor dieser
 * Doppelung warnt der Kommentar an NICHT_INDEXIERBARE_SEITEN oben; für
 * Seiten wurde sie deshalb schon zusammengelegt, für Produkte war es nur
 * noch nicht passiert. Zwei Listen driften, und der gefährliche Fall ist
 * der leise: Produkt trägt `noindex`, steht aber weiter in der Sitemap —
 * die Search Console meldet das dauerhaft als Konflikt, während jede
 * Einzelstelle für sich richtig aussieht.
 *
 * BELEGTER ANLASS (live gemessen 2026-08-15 gegen sitemap/products/1.xml,
 * 19 Einträge): SECHS der 19 Produkt-URLs sind keine Kundenseiten.
 *   - `test-page-crystal-cacao®-create-spater-wieder-loschen` — eine
 *     Testseite, die ihren Zweck im eigenen Handle nennt, ausgeliefert mit
 *     HTTP 200 und indexierbar.
 *   - `crystal-cacao-adfiefiale` — Vertipper-Handle, Titel identisch mit
 *     `crystal-cacao-create`: eine Dublette der Umsatzseite.
 *   - `8kendiw34hd`, `pjdz538hgs0` — Angebots-Handles aus Zufallszeichen.
 *     Sie sind Ziel verschickter Angebotslinks, nicht Suchergebnis.
 *   - `aw783hfn`, `37cr378n` — antworten selbst mit HTTP 404 und standen
 *     trotzdem in der Sitemap: wir haben Google aktiv auf zwei tote URLs
 *     gezeigt.
 * Für die Suche heißt das: rund um das umsatztragende Wort
 * "Crystal Cacao Create" konkurrieren mehrere fast gleiche Seiten, und
 * Google muss selbst raten, welche die echte ist.
 *
 * AUFNAHME-KRITERIUM (bewusst identisch zu NICHT_INDEXIERBARE_SEITEN): nur
 * Handles, die für Kunden keinen Zweck haben — Test-, Rest-, Dubletten- und
 * reine Link-Ziel-Handles. NICHT aufgenommen sind deshalb die realen
 * Bundle-/Mengenrabatt-Produkte (`bundle-2x-awake`, `mengenrabatt-3x-create`
 * u. a.): die kann man kaufen. Sie sind inhaltlich dünn, aber die richtige
 * Antwort darauf ist besserer Inhalt, nicht Unsichtbarkeit.
 * @type {string[]}
 */
export const NICHT_INDEXIERBARE_PRODUKTE = [
  // Bestand: nie beworbene Bundle-Handles (bis 2026-08-15 in zwei Listen).
  'bundle-fundament',
  'bundle-unabhangig',
  'bundle-erholungs-residenz',
  // Neu 2026-08-15, jeder Handle an der Live-Auslieferung belegt.
  'test-page-crystal-cacao®-create-spater-wieder-loschen',
  'crystal-cacao-adfiefiale',
  '8kendiw34hd',
  'pjdz538hgs0',
  'aw783hfn',
  '37cr378n',
];

/**
 * Gehört dieser Produkt-Handle aus dem Index?
 * @param {string|undefined} handle
 * @returns {boolean}
 */
export function istNichtIndexierbaresProdukt(handle) {
  return !!handle && NICHT_INDEXIERBARE_PRODUKTE.includes(handle);
}

/**
 * Kollektions-Handles, die NICHT in den Google-Index gehören.
 *
 * WARUM DIE DRITTE LISTE UND NICHT EIN EINTRAG IN EINER DER OBEREN: Seiten,
 * Produkte und Kollektionen sind drei getrennte Shopify-Namensräume mit je
 * eigenem URL-Präfix. Ein Handle `products` existiert als Kollektion UND
 * könnte als Seite existieren; eine gemeinsame Liste müsste den Typ mitführen
 * und wäre an jeder Lesestelle zu filtern. Die Trennung ist hier billiger als
 * die Vereinigung — die Doppelungs-Warnung oben richtet sich gegen ZWEI Listen
 * für DENSELBEN Namensraum, nicht gegen eine je Namensraum.
 *
 * AUFNAHME-KRITERIUM (wortgleich zu den beiden Listen oben): nur Handles ohne
 * Zweck für Kunden. Entscheidend ist NICHT, ob die Kollektion heute leer ist —
 * eine leere Saison-Kollektion (`valentinstag-angebote`,
 * `blackfriday-sale-artikel`) ist eine echte Kundenkategorie, die wieder
 * gefüllt wird; dort ist die richtige Antwort Inhalt, nicht Unsichtbarkeit.
 * Aufgenommen ist nur, was seiner NATUR nach intern ist.
 *
 * BELEGTER ANLASS (live gemessen 2026-08-26T20:07Z gegen alle neun in der
 * Sitemap geführten Kollektionen, belege/inhalts-delta.json): fünf davon sind
 * Steuerungs-Kollektionen des Shops, keine Kategorien.
 *   - `slider` sagt es in der eigenen Beschreibung: „Artikel, die im Slider
 *     angezeigt werden sollen." Das ist eine Konfiguration der Startseite,
 *     die versehentlich eine öffentliche URL bekommen hat.
 *   - `frontpage` („Home page") und `products` („Products") legt Shopify
 *     selbst an. Beide tragen einen ENGLISCHEN Titel auf der deutschen
 *     Storefront und dieselben Produkte wie `/collections/all` — sie sind
 *     Dubletten der Kategorieübersicht, nicht eigene Kategorien.
 *   - `digital-goods-vat-tax` ist eine steuerliche Gruppierung für die
 *     Umsatzsteuer digitaler Güter, `cross-selling` eine Merchandising-Quelle
 *     für Produktempfehlungen. Beide messen 0 eigene Produkte.
 *
 * WARUM noindex UND KEIN canonical: dieselbe Regel, die schon
 * `pages.uebersicht.jsx` trägt — noindex neben einem canonical auf eine
 * andere URL sind widersprüchliche Signale. Für `frontpage`/`products` wäre
 * ein canonical auf `/collections/all` fachlich naheliegend und trotzdem
 * falsch: es machte die Dublette wieder crawlbar.
 * @type {Array<{handle: string, ausSitemap: boolean, grund: string,
 *               seit: string}>}
 */
export const NICHT_INDEXIERBARE_KOLLEKTIONEN_DEF = [
  {
    handle: 'frontpage',
    ausSitemap: false,
    grund:
      'von Shopify selbst angelegte "Home page"-Kollektion, englischer Titel ' +
      'auf der deutschen Storefront, dieselben Produkte wie /collections/all',
    seit: '2026-08-27',
  },
  {
    handle: 'products',
    ausSitemap: false,
    grund:
      'von Shopify selbst angelegte "Products"-Kollektion, Dublette der ' +
      'Kategorieübersicht',
    seit: '2026-08-27',
  },
  {
    handle: 'slider',
    ausSitemap: false,
    grund:
      'Startseiten-Konfiguration ("Artikel, die im Slider angezeigt werden ' +
      'sollen"), die versehentlich eine öffentliche URL bekommen hat',
    seit: '2026-08-27',
  },
  {
    handle: 'cross-selling',
    ausSitemap: false,
    grund: 'Merchandising-Quelle für Produktempfehlungen, 0 eigene Produkte',
    seit: '2026-08-27',
  },
  {
    handle: 'digital-goods-vat-tax',
    ausSitemap: false,
    grund:
      'steuerliche Gruppierung für die Umsatzsteuer digitaler Güter, ' +
      '0 eigene Produkte',
    seit: '2026-08-27',
  },
];

/**
 * Sicht 1 — alle Kollektions-Handles, die ein `noindex` bekommen.
 * Leser: `collections.$handle.jsx` und `collections.all.jsx`. Form und
 * Semantik unverändert (string[]), damit kein Aufrufer nachgezogen werden
 * muss.
 * @type {string[]}
 */
export const NICHT_INDEXIERBARE_KOLLEKTIONEN =
  NICHT_INDEXIERBARE_KOLLEKTIONEN_DEF.map((e) => e.handle);

/**
 * Sicht 2 — die TEILMENGE, die zusätzlich aus der Sitemap fliegt.
 * Leser: die Sitemap-Route. Abgeleitet aus DERSELBEN einen Definition wie
 * Sicht 1 — die beiden können also nicht auseinanderdriften.
 *
 * WARUM FUNKTION UND NICHT KONSTANTE, anders als beim Seiten-Zwilling
 * `AUS_SITEMAP_ENTFERNTE_SEITEN`: dieses Modul wird von 36 Seiten gelesen,
 * und der Render-Neutralitäts-Beweis von Gate 12 (homepage-bauer
 * src/render_neutral.py, Teil 2) ist fail-closed gegenüber jeder NEUEN
 * Top-Level-Deklaration, die beim Modul-Laden AUSGEFÜHRT wird — ein
 * `const X = […].filter(…)` fällt darunter. Gemessen am 2026-09-08: mit
 * einer solchen Konstante werden 0 von 36 Seiten befreit und der Deploy
 * blockt an vorbestehender Bild-Schuld auf sechs fremden Produktseiten, die
 * diese Änderung weder verursacht noch beheben kann. Als Pfeil-Funktion
 * läuft beim Laden nichts, die Ableitung bleibt an genau EINER Stelle, und
 * der Beweis geht durch. Der Seiten-Zwilling darf Konstante bleiben: er ist
 * kein NEUER Name mehr.
 *
 * WARUM SIE HEUTE LEER IST, UND WARUM DAS DER RICHTIGE ZUSTAND IST
 * (2026-09-08, Discovery-Kette Glied für Glied nachgemessen): für alle fünf
 * Kollektionen ist die Sitemap der EINZIGE Weg, auf dem Google sie noch
 * besucht. Ihr einziger eingehender Link kommt von `/pages/uebersicht`, und
 * die trägt selbst `noindex,nofollow` — Google folgt ihren Links also nicht.
 * Der zweite Kandidat `/collections` ist zwar follow-bar, hat aber selbst
 * keinen Sitemap-Eintrag und ebenfalls nur `/pages/uebersicht` als Zugang;
 * die Kette endet dort. Wer sie jetzt aus der Sitemap nimmt, sorgt dafür,
 * dass das `noindex` NIE gelesen wird und die Seiten mit ihrem letzten Stand
 * im Index bleiben.
 *
 * DIE ZAHL `links_rein` AUS EINEM CRAWL-ZENSUS TÄUSCHT HIER: sie meldet 1
 * bis 2 eingehende Links und liest sich wie „es gibt einen Weg". Ein Link von
 * einer `nofollow`-Seite ist keiner. Wer `links_rein > 0` als Discovery-Beleg
 * nimmt, hält genau die Seiten für sicher entfernbar, bei denen das Gegenteil
 * gilt.
 *
 * BIS HIERHER GAB ES DIESE SICHT GAR NICHT — `VERSTECKTE_HANDLES` in der
 * Sitemap-Route kannte nur `products` und `pages`. Der Widerspruch „noindex
 * UND in der Sitemap" konnte für Kollektionen deshalb baulich nie enden.
 * Jetzt kann er es: ein Eintrag kippt auf `ausSitemap: true`, sobald das
 * Signal nachweislich gewirkt hat. Wann das ist, entscheidet ein Mensch —
 * die Frage stellt homepage-bauer/pruefungen/probe_uebergangsstufe_ohne_ende.py
 * (Adressat AI-CEO), und sie kippt bewusst nichts selbst.
 * @returns {string[]}
 */
export const ausSitemapEntfernteKollektionen = () =>
  NICHT_INDEXIERBARE_KOLLEKTIONEN_DEF.filter((e) => e.ausSitemap).map(
    (e) => e.handle,
  );

/**
 * Gehört dieser Kollektions-Handle aus dem Index?
 * @param {string|undefined} handle
 * @returns {boolean}
 */
export function istNichtIndexierbareKollektion(handle) {
  return !!handle && NICHT_INDEXIERBARE_KOLLEKTIONEN.includes(handle);
}
