import {FrageSeite} from '~/components/campaign/FrageSeite';
import fragenStyles from '~/styles/fragen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {seiteFuer} from '~/data/fragen';
import {frageSchema} from '~/lib/fragen-schema';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/was-senkt-elektrosmog-im-alltag';
// EIN Traeger für die Adresse: der Slug wird abgeleitet, nicht danebengeschrieben.
const SLUG = PFAD.slice('/pages/'.length);

/**
 * /pages/was-senkt-elektrosmog-im-alltag — die Frage „Was senkt die Belastung durch Elektrosmog im Alltag?".
 *
 * Gebaut von 20260919-GROSSJOB-von-4-prozent-auf-80-wer-spricht-ueber-uns-wenn-die-ki-
 * gefragt-wird, Segment s08, gegen eine GEMESSENE Quellenluecke (seo-manager
 * exports/KI-QUELLENLUECKE.json): Dritte sagen diesen Satz ueber unser Thema,
 * wir sagten ihn auf keiner eigenen Seite. Den Text schrieb dasselbe Segment; er steht committet in
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

const TITEL = "Was senkt die Belastung durch Elektrosmog im Alltag? | Qi Blanco";
const BESCHREIBUNG = "Abstand halten, den Flugmodus einschalten und Funkquellen abschalten senken die Belastung im Alltag sofort, kosten nichts und brauchen kein Produkt.";

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich bei
 * jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet.
 * WER DEN TEXT DIESER SEITE AENDERT, ZIEHT `GEAENDERT` NACH — und den
 * `lastmod`-Wert in NUR_ROUTE_SEITEN im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-19';
const GEAENDERT = '2026-09-19';

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
  ];
};

export default function FrageRoute() {
  return <FrageSeite seite={SEITE} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
