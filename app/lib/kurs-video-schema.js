import {beschreibungTags} from './seiten-beschreibung.js';

/**
 * VideoObject-AUSZEICHNUNG FÜR DIE LEKTIONSVIDEOS DER KURS-SEITEN.
 *
 * DER BEFUND, DER DIESES MODUL AUSLÖST (live gemessen 2026-09-12, Segment s05
 * des Grossjobs 20260911-GROSSJOB-technische-auffindbarkeit-…): zehn Seiten
 * betten über `CourseLesson` je ein Video ein, und keine einzige nannte es.
 * Für eine Maschine war eine Seite, deren ganzer Inhalt ein Video ist, von
 * einer Textseite nicht zu unterscheiden. Das ist der Ort mit dem grössten
 * Hebel: auf den Zweifels-Suchbegriffen unserer Marke stammen 36 von 66
 * Zitatzeilen der Google-KI-Antwort von youtube.com — Video IST dort die
 * gelesene Quellenklasse.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE EINE REGEL: EIN UNVOLLSTÄNDIGES VideoObject IST SCHLECHTER ALS KEINES
 * ═══════════════════════════════════════════════════════════════════════════
 * Google verlangt `name`, `description`, `thumbnailUrl`, `uploadDate` sowie
 * `contentUrl` oder `embedUrl`. Fehlt eines, steht der Knoten dauerhaft als
 * FEHLER in der Search Console, während ein fehlender Knoten nur nichts
 * bewirkt. Dieselbe Linie fährt `ig-video-schema.js` schon, und sie ist hier
 * als BEDINGUNG gebaut, nicht als Zusage: fehlt ein Feld, entsteht kein
 * Knoten. `kursVideoSignale()` gibt dann eine leere Liste zurück.
 *
 * WOHER JEDES PFLICHTFELD KOMMT — und warum keines geschätzt ist:
 *
 *   name          YouTube-Titel des Videos. Quelle ist die Data-API-v3-Ernte
 *                 des EIGENEN Kanals (SSoT homepage-bauer/data/erfahrungen/
 *                 videos.json, erhoben 2026-09-11T21:00:09Z, 332 Videos).
 *   uploadDate    `publishedAt` derselben Ernte.
 *   duration      `contentDetails.duration` derselben Ernte.
 *   thumbnailUrl  `hqdefault` — die Auflösung, die YouTube für JEDE Kennung
 *                 garantiert. `maxresdefault` ist schöner, existiert aber
 *                 nicht für jedes Video; ein 404 in einem Pflichtfeld ist
 *                 schlechter als ein kleineres Bild. Identische Begründung
 *                 und identische Form wie in `erfahrungen-schema.js`.
 *   description   DIE HAUSGESCHRIEBENE SEITENBESCHREIBUNG, über dieselbe
 *                 Funktion aufgelöst, die auch das <meta name="description">
 *                 dieser Seite füllt (`beschreibungTags`) — Shopify-Feld
 *                 schlägt, kuratierter Text fängt auf, sonst nichts.
 *
 * WARUM NICHT DIE YOUTUBE-BESCHREIBUNG, obwohl sie in derselben Ernte steht
 * und ebenfalls von uns geschrieben ist: sie ist für die PLATTFORM verfasst
 * und trägt genau das, was in strukturierten Daten nichts zu suchen hat —
 * „👉 Erfahre mehr und starte jetzt den vollständigen Kurs - gratis: <Link>",
 * Kapitelmarken, Musicbed-SyncIDs, und bei einem Video den vollständigen
 * HWG-Transparenzhinweis. Die Seitenbeschreibung beschreibt dagegen genau
 * das, was IN DIESEM Video passiert („Tag 4 des Kurses: woher elektro-
 * magnetische Strahlung im Alltag kommt …") — auf einer Lektionsseite sind
 * Seiteninhalt und Videoinhalt dasselbe. Gemessen: alle zehn Seiten tragen
 * eine solche Beschreibung.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * WAS BEWUSST NICHT DRINSTEHT
 * ═══════════════════════════════════════════════════════════════════════════
 * `publisher` als Verweis auf die Organisations-@id — der Knoten ist nur auf
 * der Startseite definiert; ein hängender Verweis wäre eine Zusage ohne
 * Gegenstand. `isPartOf` zeigt stattdessen auf `#webpage` DIESER Seite, den
 * `seitenSignale()` im selben Dokument emittiert.
 *
 * `interactionStatistic` (Aufrufe) — die Ernte kennt die Zahl, aber sie ist
 * ein Schnappschuss und altert ab dem Deploy. Eine alternde Zahl in
 * strukturierten Daten ist eine Behauptung, die von selbst falsch wird.
 *
 * `transcript`/`hasPart` — die Untertitelspuren des Kanals sind maschinell
 * (`trackKind=asr`) und tragen belegte Hörfehler; der Dateikopf von
 * `app/data/erfahrungen-beitraege.js` führt das im Einzelnen aus.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DIE FREMDEN VIDEOS BEKOMMEN KEINEN KNOTEN — UND DAS IST DER GRUND FÜR DIE
 * ENGE DES GEGENSTANDS
 * ═══════════════════════════════════════════════════════════════════════════
 * Der Shopify-CMS-Rumpf mancher Lektionsseite bettet zusätzlich Videos ein.
 * Über YouTube-oEmbed gemessen (2026-09-12) gehören drei davon FREMDEN
 * Kanälen: `i-T7tCMUDXU` (TEDx Talks), `La9oLLoI5Rc` (Tom Bilyeu),
 * `BJIlBNu89GA` (ein Satsang-Kanal). Ein VideoObject darauf würde fremden
 * Inhalt als Video UNSERER Seite ausgeben. Dieses Modul zeichnet deshalb
 * ausschließlich das LEKTIONSVIDEO der Route aus — das, was die Route selbst
 * nennt, nicht das, was im Rumpf steht.
 *
 * Es gibt genau einen eigenen Rumpf-Kandidaten (`mH0vaUEeFqg`, ein 62-minütiges
 * Podcast-Video auf /pages/e-smog und /pages/mentales-setting). Er ist
 * vollständig geerntet, hat aber keine hausgeschriebene Beschreibung SEINES
 * Inhalts — und die Seitenbeschreibung beschreibt die Lektion, nicht ihn. Er
 * bleibt deshalb ohne Knoten; das ist ein benannter Rest, kein Versehen.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * KONSTANTEN-DUPLIKAT MIT ABSICHT
 * ═══════════════════════════════════════════════════════════════════════════
 * `CANONICAL_ORIGIN` steht hier als Literal statt als Import aus `seo.js`:
 * jener Import zöge die ganze Import-Closure von `seo.js` in die
 * Gate-12-Prüfmenge jeder Seite, die dieses Modul lädt. Dieselbe Entscheidung
 * begründen `seiten-seo.js`, `kollektion-seo.js` und `produkt-seo.js` in ihren
 * Köpfen. Gegen die Drift schützt kein Vorsatz, sondern
 * `test/kurs-video-schema.test.mjs`.
 */

/** Muss `seo.js` CANONICAL_ORIGIN entsprechen — der Test nagelt das fest. */
export const CANONICAL_ORIGIN = 'https://qiblanco.com';

/**
 * Pfad -> Einbettungs-URL des Lektionsvideos.
 *
 * WARUM DIE URL HIER STEHT UND NICHT NUR IM JSX DER ROUTE — und warum das
 * trotzdem KEINE zweite Wahrheit ist: `meta()` und die Komponente brauchen
 * dieselbe URL. Stünde sie zweimal im Quelltext, könnte das VideoObject eines
 * Tages ein anderes Video nennen als der Player zeigt, und das fiele niemandem
 * auf, weil beide Seiten für sich richtig aussähen. Sie steht deshalb HIER,
 * und `test/kurs-video-schema.test.mjs` vergleicht sie Zeichen für Zeichen
 * gegen das `videoEmbed="…"` der Route; dasselbe tut am freigegebenen Stand
 * `seo-manager/pruefungen/probe_kursvideo_verdrahtet.py`.
 *
 * DIE NAHELIEGENDE ALTERNATIVE WAR EINE KONSTANTE IN DER ROUTE, die Player und
 * Auszeichnung speist — sie war gebaut und ist verworfen: sie ändert die
 * Komponentenzeile und macht den Diff damit für Gate 9 und Gate 12 zu einer
 * SICHTBAREN Änderung, obwohl sich am gerenderten Ergebnis nichts ändert
 * (`src/render_neutral.py` entscheidet je Datei: meta-Export und Importe
 * abziehen, Rest byte-identisch). Zehn Design-Belege und zehn
 * Alle-Formate-Belege für eine Änderung, die nichts rendert, wären der
 * gemessene Preis gewesen — und nach dem Kopf jenes Moduls genau der
 * Fehlalarm, gegen den es gebaut wurde. Der Schutz gegen Drift wandert
 * deshalb von der Bauform in eine PRÜFUNG, die schärfer ist als die Bauform.
 *
 * Der Abfrageteil (`?si=…`, `?rel=0…`) steht bewusst MIT drin: hier ist die
 * URL abgebildet, die der Player wirklich bekommt. Ins Markup geht sie ohne
 * Abfrageteil (siehe `blankeEinbettung`).
 */
export const LEKTIONSVIDEOS = {
  '/pages/das-beispiel':
    'https://www.youtube.com/embed/p0FoQgQ3t6E?si=35zk0vS1FgwFT7FL',
  '/pages/e-smog':
    'https://www.youtube.com/embed/JmDaIlhOYaA?si=fUstmDJgspa2eDli',
  '/pages/entgiftung':
    'https://www.youtube.com/embed/oNwG0CB5PFQ?si=jNiXZR-A2Uow4RJ2',
  '/pages/intuition-erfahren':
    'https://www.youtube-nocookie.com/embed/lgPFnXoDdYA?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3',
  '/pages/kakao-anwendung':
    'https://www.youtube-nocookie.com/embed/O4kT1CY7Dg0?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3',
  '/pages/kohaerentes-wasser':
    'https://www.youtube.com/embed/oc0CB-fPlp4?si=fyriX2HtFKagDiBS',
  '/pages/meditieren-mit-zeremonie-kakao':
    'https://www.youtube-nocookie.com/embed/oDsYOC6zNJQ?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3',
  '/pages/mentales-setting':
    'https://www.youtube.com/embed/MwLL1db-og4?si=fFSiUg7PduCl9WKn',
  '/pages/vitamine-mineralien':
    'https://www.youtube.com/embed/dHwlb37bRVQ?si=EcS1aOzGuHsF5KmH',
  '/pages/was-ist-zeremonie-kakao':
    'https://www.youtube-nocookie.com/embed/ninA8ZeJ58k?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3',
};

/**
 * Die Videos der Kurs-Lektionen. Jede Zeile stammt aus der Data-API-v3-Ernte
 * des eigenen Kanals (homepage-bauer/data/erfahrungen/videos.json, erhoben
 * 2026-09-11T21:00:09Z) — keine Zeile ist geschätzt oder aus einem Dateinamen
 * gelesen.
 *
 * `sichtbarkeit` wird MITGEFÜHRT, obwohl das Markup sie nicht ausgibt: fünf
 * der zehn Videos sind `unlisted`. Das ist zulässig (sie sind über die
 * Einbettung öffentlich abrufbar und ihre Vorschaubilder sind es auch), aber
 * es ist der Zustand, der am leichtesten kippt — wird eines `private`, zeigt
 * der Knoten auf ein Video, das es für die Öffentlichkeit nicht mehr gibt.
 * Genau darauf misst der Arm V5 der stehenden Probe TÄGLICH gegen YouTube.
 */
export const KURS_VIDEOS = {
  // /pages/entgiftung
  'oNwG0CB5PFQ': {
    titel: 'Entgiftung leicht gemacht - Wie kann sich dein Körper selbst heilen? Befreie ihn von Schadstoffen!',
    veroeffentlicht: '2024-11-21T05:08:27Z',
    dauer: 'PT9M26S',
    sichtbarkeit: 'public',
  },
  // /pages/mentales-setting
  'MwLL1db-og4': {
    titel: 'Mentales Setting: Wie du dein Denken neu programmierst und deine Realität veränderst!',
    veroeffentlicht: '2024-11-21T05:08:56Z',
    dauer: 'PT18M10S',
    sichtbarkeit: 'public',
  },
  // /pages/vitamine-mineralien
  'dHwlb37bRVQ': {
    titel: '120 Jahre alt und kerngesund? Entdecke die wahren Geheimnisse von Mineralien und Vitaminen!',
    veroeffentlicht: '2024-11-21T05:23:06Z',
    dauer: 'PT15M29S',
    sichtbarkeit: 'public',
  },
  // /pages/e-smog
  'JmDaIlhOYaA': {
    titel: 'Wie du dich vor E-Smog und 5G schützen kannst – Die unsichtbare Gefahr!',
    veroeffentlicht: '2024-11-21T05:28:02Z',
    dauer: 'PT17M8S',
    sichtbarkeit: 'public',
  },
  // /pages/kohaerentes-wasser
  'oc0CB-fPlp4': {
    titel: 'Kohärentes Wasser: Die unsichtbare Superkraft für deine Gesundheit!',
    veroeffentlicht: '2024-11-21T05:46:47Z',
    dauer: 'PT6M33S',
    sichtbarkeit: 'public',
  },
  // /pages/das-beispiel
  'p0FoQgQ3t6E': {
    titel: 'Bonuslektion - In 5 Stufen zum Superhuman',
    veroeffentlicht: '2020-03-14T05:37:24Z',
    dauer: 'PT2M35S',
    sichtbarkeit: 'unlisted',
  },
  // /pages/intuition-erfahren
  'lgPFnXoDdYA': {
    titel: 'Teil 1: Intuition erfahren',
    veroeffentlicht: '2026-06-09T15:49:38Z',
    dauer: 'PT8M12S',
    sichtbarkeit: 'unlisted',
  },
  // /pages/was-ist-zeremonie-kakao
  'ninA8ZeJ58k': {
    titel: 'Teil 2: Was ist Zeremonie Kakao?',
    veroeffentlicht: '2026-06-09T16:09:06Z',
    dauer: 'PT8M12S',
    sichtbarkeit: 'unlisted',
  },
  // /pages/kakao-anwendung
  'O4kT1CY7Dg0': {
    titel: 'Teil 3: Anwendung und Wirkung',
    veroeffentlicht: '2026-06-09T16:17:52Z',
    dauer: 'PT7M50S',
    sichtbarkeit: 'unlisted',
  },
  // /pages/meditieren-mit-zeremonie-kakao
  'oDsYOC6zNJQ': {
    titel: 'Teil 4: Mit Zeremonie-Kakao meditieren',
    veroeffentlicht: '2026-06-09T16:23:59Z',
    dauer: 'PT4M20S',
    sichtbarkeit: 'unlisted',
  },
};

/** Die elfstellige YouTube-Kennung aus einer Einbettungs-URL. */
export function videoKennung(einbettung) {
  if (typeof einbettung !== 'string') return '';
  const treffer = einbettung.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed|v)\/|youtu\.be\/|[?&]v=)([A-Za-z0-9_-]{11})/,
  );
  return treffer ? treffer[1] : '';
}

/**
 * Vorschaubild in der Auflösung, die YouTube für JEDE Kennung garantiert.
 * Begründung im Dateikopf.
 */
export function vorschaubild(videoId) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/**
 * Die Einbettungs-URL ohne Abfrageteil. Der Player bekommt weiterhin die
 * volle URL mit `?si=`/`?rel=0` — in die strukturierten Daten gehört die
 * blanke Adresse des Videos, nicht unsere Player-Einstellungen.
 */
function blankeEinbettung(einbettung) {
  return String(einbettung).split('?')[0];
}

/**
 * Die JSON-LD-Descriptoren für das Lektionsvideo einer Kurs-Seite.
 *
 * Gibt eine LEERE Liste zurück, sobald irgendetwas fehlt — der Pfad, die
 * Kennung, der Eintrag in der Ernte, eines der Pflichtfelder. Das ist die
 * Bedingung aus dem Dateikopf, und sie ist der Grund, warum hier nichts
 * geraten wird.
 *
 * `einbettung` ist ein Notausgang für Tests und für eine Route, die ihr Video
 * eines Tages zur Laufzeit bekommt; im Normalfall kommt die URL aus
 * LEKTIONSVIDEOS und der Aufrufer nennt nur seinen Pfad.
 *
 * @param {{pfad: string, einbettung?: string, beschreibung?: string}} args
 * @returns {Array<object>}
 */
export function kursVideoSignale({pfad, einbettung, beschreibung}) {
  const quelle = einbettung || LEKTIONSVIDEOS[pfad];
  const videoId = videoKennung(quelle);
  if (!videoId) return [];
  const video = KURS_VIDEOS[videoId];
  if (!video) return [];

  // IDENTISCH zur Route: dieselbe Funktion, dieselbe Rangfolge, damit die
  // Beschreibung im Markup nie eine andere ist als die im <meta>-Tag.
  const text = beschreibungTags(pfad, beschreibung)[0]?.content;
  if (!text) return [];
  if (!video.titel || !video.veroeffentlicht) return [];

  const seiteUrl = `${CANONICAL_ORIGIN}${pfad}`;
  const knoten = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${seiteUrl}#video-${videoId}`,
    name: video.titel,
    description: text,
    thumbnailUrl: vorschaubild(videoId),
    uploadDate: video.veroeffentlicht,
    embedUrl: blankeEinbettung(quelle),
    // Zeigt auf den WebPage-Knoten, den `seitenSignale()` im SELBEN Dokument
    // emittiert — kein hängender Verweis auf einen Knoten anderswo.
    isPartOf: {'@id': `${seiteUrl}#webpage`},
  };
  if (video.dauer) knoten.duration = video.dauer;
  return [{'script:ld+json': knoten}];
}
