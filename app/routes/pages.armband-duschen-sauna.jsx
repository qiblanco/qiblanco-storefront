import {FrageSeite} from '~/components/campaign/FrageSeite';
import fragenStyles from '~/styles/fragen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {seiteFuer} from '~/data/fragen';
import {frageSchema} from '~/lib/fragen-schema';
import {MARKE, brotkrume, kurzName, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/armband-duschen-sauna';
// EIN Traeger für die Adresse: der Slug wird abgeleitet, nicht danebengeschrieben.
const SLUG = PFAD.slice('/pages/'.length);

/**
 * /pages/armband-duschen-sauna — die Frage „Kann man ein Armband gegen Elektrosmog beim Duschen und in der Sauna tragen?".
 *
 * Gebaut vom Großjob 20260919-…-wer-spricht-über-uns-wenn-die-ki-gefragt-wird,
 * Segment s08. Die Frage ist anhand der Zitatmessung des seo-manager
 * ausgewählt (exports/KI-QUELLENLUECKE.json — sie hält fest, welche Quellen
 * Antwortsysteme heute zu welcher Frage zitieren). Den Text schrieb dasselbe Segment; er steht committet in
 * app/data/fragen.js, die Darstellung in
 * app/components/campaign/FrageSeite.jsx. DIESE DATEI TRÄGT KEINEN INHALT —
 * wer den Text aendert, aendert das Datenmodul, nicht die Route.
 *
 * DIE FRAGE IST DIE ADRESSE UND DIE UEBERSCHRIFT. Das ist keine Kosmetik: ein
 * Antwortsystem schneidet Texte in Abschnitte und bewertet sie isoliert. Eine
 * Frage, die nur eine Zeile unter zwoelf anderen auf /pages/faq ist,
 * konkurriert mit ihren Nachbarn um dieselbe URL. Die Bestands-FAQ bleibt
 * unangetastet — sie bedient den Menschen, der blaettert.
 *
 * Die Datei sticht ausserdem den Katchall pages.$handle.jsx, der sonst ein
 * Shopify-Seitenobjekt dieses Handles suchen und 404 liefern würde.
 *
 * ZUSAMMENLEGUNG ZURÜCKGENOMMEN (23.10.2026): vom 07.10. bis 23.10. trug diese
 * Route nur einen 301 auf /pages/faq#armband-duschen-sauna (PR #815). /pages/faq
 * fiel am Kontrollpunkt Tag 14 ab; nach der Entscheidung vom 07.10. (Coworker A
 * im Auftrag Christians) kommen die 301 dann zurück. Folgeauftrag des
 * Wirkungskreislaufs 20261023-seo-wk-rueckweg-301-faq-395796ad98, Hypothese
 * H-395796ad98. Der übernommene Abschnitt auf /pages/faq bleibt stehen
 * (FaqSeite.jsx, FrageAbschnitt, Anker am Slug).
 *
 * SITEMAP ÜBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), NICHT über ein
 * Shopify-Seitenobjekt: die Shopify-Sitemap entsteht aus Seitenobjekten, eine
 * reine Route kaeme dort baulich nie hinein und wäre erreichbar UND
 * unauffindbar. Ein Seitenobjekt wäre der zweite mögliche Traeger und ist
 * bewusst nicht gewählt (Fremdsystem) — dieselbe Begründung wie bei
 * /pages/kritik, /pages/hypothesen und /pages/lexikon.
 *
 * NICHT IM MENUE, UND DAS IST KEIN VERSTECK: die Route hängt nicht am
 * Shopify-Menue-Objekt, also gibt es keinen Dropdown-Eintrag. Öffentlich,
 * indexierbar, in der Sitemap, vom Fragen-Hub verlinkt — nur eben nicht im
 * Navigationsband. Jeder Besucher bekommt denselben Text, Mensch wie Crawler;
 * das misst die Abnahme und nicht dieser Kommentar.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitaets- oder Tracking-Key,
 * kein eigener Pixel, kein Kaufknopf. Die R1/R2/R3-Kette hängt pfad-agnostisch
 * im root-Layout; TRACKING_COOKIE_NAMES bleibt unangetastet.
 *
 * KEIN LOADER: Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen.
 */
const SEITE = seiteFuer(SLUG);
if (!SEITE) {
  // FAIL-LOUD AN DER RICHTIGEN STELLE. Faehrt jemand diese Frage aus
  // app/data/fragen.js heraus, wäre die stille Variante eine leere Seite mit
  // HTTP 200 — erreichbar und inhaltslos, also genau der Zustand, den der
  // Wissens-Blog monatelang hatte. Ein Fehler beim Rendern ist laut und trifft
  // nur diese eine Route.
  throw new Error(
    `Frageseite "${SLUG}" fehlt in app/data/fragen.js — ` +
      'Route und Datenmodul sind auseinandergelaufen.',
  );
}

const TITEL = "Kann man ein Armband gegen Elektrosmog beim Duschen und in der Sauna tragen? | Qi Blanco";
// Beschreibung = der Antwortsatz der Seite, beim Rückweg (23.10.) auf
// höchstens 160 Zeichen gebracht (GEO-Seitenregel R4, wie die übrigen
// Frageseiten seit dem 11.10.). Inhalt und Reihenfolge bleiben.
const BESCHREIBUNG =
  'Ja, das QiBracelet® und den QiOne® 2 Pro kannst du beim Duschen, Schwimmen ' +
  'und in der Sauna anbehalten. Ihr Gehäuse aus Chirurgenstahl wird in der Sauna warm.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich bei
 * jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet.
 * WER DEN TEXT DIESER SEITE AENDERT, ZIEHT `GEAENDERT` NACH — und den
 * `lastmod`-Wert in NUR_ROUTE_SEITEN im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-19';
// Der Antworttext in app/data/fragen.js wurde zuletzt am 14.10. geändert (#913).
const GEAENDERT = '2026-10-14';

export function links() {
  return [{rel: 'stylesheet', href: fragenStyles}];
}

/** @type {MetaFunction} */
export const meta = () => {
  const schema = frageSchema(SEITE, {
    datePublished: isoMitZone(VEROEFFENTLICHT),
    dateModified: isoMitZone(GEAENDERT),
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'article'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    ...(schema ? [{'script:ld+json': schema}] : []),
    // Brotkrume Startseite -> diese Seite (GEO-Seitenregel R6,
    // schema_pflicht.frageseite), aus der gemeinsamen Fabrik.
    {
      'script:ld+json': brotkrume({
        url: absoluteCanonical(PFAD),
        name: kurzName(TITEL),
      }),
    },
  ];
};

export default function FrageRoute() {
  return <FrageSeite seite={SEITE} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
