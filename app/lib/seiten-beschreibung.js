// META-BESCHREIBUNGEN FÜR SEITEN, DIE IN SHOPIFY KEINE GEPFLEGTE HABEN.
//
// WARUM ES DIESE DATEI GIBT — die Verdrahtung allein wirkt nicht.
// Das Papier vom 2026-08-15 (Job 20260815-seo-reflexion-lowhigh-hanging-fruits)
// stellte richtig fest, dass `pages.$handle.jsx` das Feld `seo.description`
// zwar per PAGE_QUERY HOLT, aber nie ausgibt, und empfahl: „einmal verdrahten,
// dann redaktionell pflegen". Der erste Teil stimmt. Der zweite unterstellt,
// dass die Felder in Shopify gefüllt sind — das ist am 2026-09-06 gegen die
// Storefront-API gemessen worden und war FALSCH: von den 15 indexierbaren
// /pages/-URLs ohne Beschreibung trägt genau EINE (/pages/widerrufsbelehrung)
// ein gepflegtes `seo.description`. Wer nur verdrahtet, ändert 1 von 15 Seiten
// und hält den Auftrag für erledigt.
//
// DIE RANGFOLGE IST DESHALB ZWEISTUFIG, und die Reihenfolge ist der Punkt:
//   1. `seo.description` aus Shopify — schlägt IMMER. Die Redaktion behält
//      damit die Hoheit, und die Empfehlung des Papiers bleibt gültig: wer das
//      Feld in Shopify füllt, überstimmt diese Datei ohne Deploy.
//   2. der kuratierte Text hier — nur als Auffanglinie, wenn Shopify leer ist.
//   3. sonst GAR KEIN Tag. Eine erfundene Beschreibung ist schlechter als
//      keine: Google verwirft sie und der Besucher fühlt sich getäuscht.
//
// JEDER TEXT UNTEN IST AUS DEM SEITENINHALT GELESEN, nicht erfunden — Quelle
// war der Shopify-`body` der Seite bzw. die Kampagnen-Komponente, die sie
// rendert. Keine Aussage, die über den Seiteninhalt hinausgeht; keine
// Wirkzusage, keine Superlative aus dem Marketing-Text.
//
// DER SCHLÜSSEL IST DER PFAD, NICHT DER HANDLE — aus zwei Gründen, und der
// zweite ist der weniger offensichtliche:
//   (a) Ein Handle ist nur innerhalb seiner Familie eindeutig. Ein
//       Kollektions-Handle, der eines Tages genauso heißt wie ein Seiten-
//       Handle, gewänne in einer gemeinsamen Karte still die falsche
//       Beschreibung. Ein Pfad kann das nicht.
//   (b) Gate 7b (UMLAUT_GATE) maskiert die Pfadform /pages/<slug>, nicht aber
//       den blanken Slug: der Slug in /pages/kohaerentes-wasser IST die echte
//       URL und muss ASCII bleiben, wurde als blanker String aber als Digraph-
//       Fehler gemeldet (BLOCK, real eingetreten am 2026-09-06). Die
//       Alternative wäre
//       gewesen, die Maske des gemeinsamen Wächters zu erweitern, damit der
//       eigene Bau durchkommt — der teurere Weg, und der falsche.
//
// KEINE IMPORTS, UND DAS IST ABSICHT. Der Dateikopf von `produkt-seo.js`
// begründet, dass ein Import die Import-Closure der importierenden Seite in
// die Gate-12-Prüfmenge zieht; `pages.superhuman.jsx` schreibt deshalb
// „Qi Blanco" als Literal statt `MARKE` zu importieren. Diese Datei ist reine
// Datenhaltung plus eine reine Funktion und hat eine LEERE Closure — sie kann
// keine Seite in eine Prüfmenge ziehen, egal wer sie importiert.

/**
 * Pfad -> Meta-Beschreibung. Auffanglinie für Seiten ohne gepflegtes
 * `seo.description` in Shopify.
 */
export const BESCHREIBUNGEN = {
  // --- Superhuman-Kurs (fünf Tageskapitel + Bonus) -------------------------
  // Quelle: Shopify-`body` der jeweiligen Seite.
  '/pages/entgiftung':
    'Tag 1 des Kurses: wie Umweltgifte den Körper über die Zeit belasten – und worauf du achten solltest, bevor du mit einer Entgiftung beginnst.',
  '/pages/mentales-setting':
    'Tag 2 des Kurses: was das Doppelspaltexperiment über den Akt der Beobachtung zeigt – und wie du deinen Verstand zum Verbündeten machst.',
  '/pages/vitamine-mineralien':
    'Tag 3 des Kurses: was Telomere über die mögliche Lebensspanne verraten und welche Rolle Vitamine und Mineralien für deine Zellen spielen.',
  '/pages/e-smog':
    'Tag 4 des Kurses: woher elektromagnetische Strahlung im Alltag kommt, warum Wellenlänge und Intensität sie ausmachen – und wo du ihr täglich begegnest.',
  '/pages/kohaerentes-wasser':
    'Tag 5 des Kurses: warum Wasser für den Körper so zentral ist, was mit kohärenten Wasserstrukturen gemeint ist und wie viel du täglich trinken solltest.',
  '/pages/das-beispiel':
    'Bonus-Kapitel: ein persönliches Beispiel, wie die fünf Bausteine des Kurses – Entgiftung, mentales Setting, Mineralien, E-Smog und Wasser – im Alltag zusammenkommen.',
  // Quelle: app/components/kurse/Superhuman.jsx (die Kapitel-Überschriften).
  '/pages/superhuman':
    'Der kostenlose Videokurs von Christian Bernd Bauer: Entgiftung, mentale Programmierung, Mineralstoffe und Vitamine sowie Schutz vor E-Smog.',

  // --- Zeremonie-Kakao-Kurs (vier Videokapitel) ---------------------------
  // Quelle: Shopify-`body` der jeweiligen Seite; Laufzeiten aus deren Titel.
  '/pages/intuition-erfahren':
    'Teil 1 des Zeremonie-Kakao-Kurses (9 Min.): was Intuition bedeutet, welchen Vorteil sie dir im Alltag bringt und welche Rolle der Kakao dabei spielt.',
  '/pages/was-ist-zeremonie-kakao':
    'Teil 2 des Zeremonie-Kakao-Kurses (8 Min.): woher unser Kakao stammt, was die Albino-Sorte aus dem Piura-Tal besonders macht und was in ihr steckt.',
  '/pages/kakao-anwendung':
    'Teil 3 des Zeremonie-Kakao-Kurses (8 Min.): wie du den Kakao richtig erwärmst, die Inhaltsstoffe schonst und die Kur über mehrere Tage anlegst.',
  '/pages/meditieren-mit-zeremonie-kakao':
    'Teil 4 des Zeremonie-Kakao-Kurses (4 Min.): wie du Meditation und Zeremonie-Kakao verbindest – und warum dafür schon fünf Minuten genügen.',
  // Quelle: app/components/kurse/KakaoKurs.jsx (die vier Video-Überschriften).
  '/pages/zeremonie-kakao-kurs':
    'Der Zeremonie-Kakao-Kurs in vier Videos: Intuition, Herkunft und Inhaltsstoffe, die Kur in der Anwendung und Meditation mit Kakao.',

  // --- Produkt-Detailseite -------------------------------------------------
  // Quelle: app/components/index-components/detailseiten/QiHomeLanding.jsx.
  // Die Nutzerzahl steht dort als Auszeichnung der Seite selbst; die
  // Superlative des Marketing-Textes („der ultimative Schutz") bleiben
  // bewusst draußen — eine Meta-Beschreibung ist kein Werbeplatz.
  '/pages/qihome-details':
    'QiHome® Air im Detail: wie das Gerät dein Zuhause abdeckt, welche Technologie dahintersteckt und was über 14.000 Nutzer daran schätzen.',

  // --- Service -------------------------------------------------------------
  // Quelle: Shopify-`body` von /pages/support-1 (Rückmeldeformular).
  '/pages/support-1':
    'Etwas ist schiefgelaufen? Schreib uns, was passiert ist – wir kümmern uns darum und melden uns bei dir.',

  // --- Blog-Übersicht ------------------------------------------------------
  // Der Blog selbst führt kein `seo.description` und hat keinen excerpt; die
  // sieben ARTIKEL brauchen hier nichts, sie tragen alle einen redaktionellen
  // excerpt in Meta-Länge (140–157 Zeichen) und werden daraus bedient.
  '/blogs/wissen':
    'Wissen von Qi Blanco: Beiträge zu Wasser, Schlaf, Zellen und Strahlung – und was dazu tatsächlich gemessen ist.',

  // --- Kollektionen --------------------------------------------------------
  // BEWUSST NUR EINE: /collections/blackfriday-sale-artikel,
  // /collections/digitale-kurse und /collections/valentinstag-angebote führen
  // am 2026-09-06 NULL Produkte. Für eine leere Seite lässt sich keine
  // Beschreibung schreiben, die ihren Inhalt trifft — sie bekommen deshalb
  // keine. Das ist die begründete Ausnahme, kein Übersehen; der eigentliche
  // Befund dort ist die leere, indexierbare Seite, und der gehört in einen
  // eigenen Vorgang statt unter einen Text.
  '/collections/zeremonie-kakao':
    'Zeremonie-Kakao von Qi Blanco: Crystal Cacao® Create und Awake – Bio, einzeln und im Bundle.'
};

/**
 * Baut den `description`-Descriptor nach der oben begründeten Rangfolge.
 *
 * @param {string|undefined|null} pfad     Pfad der Seite, z. B. /pages/e-smog
 * @param {string|undefined|null} gepflegt Wert aus Shopify (`seo.description`)
 * @returns {Array<{name:string,content:string}>} leer, wenn es nichts zu sagen gibt
 */
export function beschreibungTags(pfad, gepflegt) {
  // `trim()` ist nicht kosmetisch: Shopify liefert für ein im Admin geleertes
  // Feld einen leeren String statt null, und ein leerer String ist wahrheits-
  // wertig falsch, aber ein Feld aus einem Leerzeichen wäre es nicht.
  const ausShopify = typeof gepflegt === 'string' ? gepflegt.trim() : '';
  const text = ausShopify || (pfad ? BESCHREIBUNGEN[pfad] : '') || '';
  return text ? [{name: 'description', content: text}] : [];
}
