import {FragenHub} from '~/components/campaign/FragenHub';
import fragenStyles from '~/styles/fragen.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {FRAGEN} from '~/data/fragen';
import {hubSchema} from '~/lib/fragen-schema';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/fragen';

/**
 * /pages/fragen — der Hub der Frageseiten.
 *
 * Gebaut von 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert,
 * Segment s07, aus Christians Auftrag vom 2026-09-15: „Fragen und Antworten,
 * die nicht für den Menschen gedacht sind, sondern nur für die AI" — gemeint
 * ist: so geschrieben, dass eine Maschine sie zitieren kann, NICHT vor
 * Menschen versteckt.
 *
 * DIE GRENZE, DIE ALLES ANDERE ZULAESST: verboten ist genau eines,
 * verschiedene Inhalte je nach Besucher. Diese Seite und ihre Frageseiten
 * liefern Mensch, Googlebot und OAI-SearchBot denselben sichtbaren Text;
 * gemessen wird das, nicht behauptet
 * (seo-manager/pruefungen/probe_lexikon_und_frageseiten_live.py vergleicht drei
 * User-Agents auf dem SICHTBAREN Text, nicht auf Roh-Bytes: Cookiebot setzt je
 * Abruf eine Zufalls-Nonce und React-Streaming liefert dem Browser
 * zusaetzliche Hydrations-Zeilen — auf der Byte-Achse irrt die Messung
 * beidseitig).
 *
 * WARUM EIN HUB UND NICHT NUR SECHS SEITEN: ein Begriff oder eine Frage, die
 * von mehreren Stellen angesteuert wird, gilt als definiert. Der Hub ist die
 * Stelle, an der die Ordnung sichtbar wird — er verlinkt die Frageseiten und
 * die beiden Zweifelsflaechen, und jede Frageseite verlinkt zurück auf die
 * Begriffe, die sie benutzt.
 *
 * SITEMAP ÜBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), KEIN Shopify-Seitenobjekt
 * (Fremdsystem, zweiter Traeger). Ohne diesen Eintrag lieferte die Seite HTTP
 * 200 mit vollem Text und stuende in keiner Sitemap: erreichbar und trotzdem
 * unauffindbar.
 *
 * KEIN LOADER, KEIN KAUFWEG, KEINE COOKIES. Der Inhalt ist ein committetes
 * Datenmodul; Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen.
 */
const TITEL = 'Fragen und Antworten | Qi Blanco';
const BESCHREIBUNG =
  'Zu jeder Frage eine eigene Seite: die Antwort zuerst, danach die Belege ' +
  'mit Zahl und Fundstelle — und am Ende, was wir nicht wissen.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR — siehe pages.lexikon.jsx. Wer
 * eine Frage ergänzt, zieht `GEAENDERT` und das `lastmod` in
 * NUR_ROUTE_SEITEN im selben Commit nach.
 */
const VEROEFFENTLICHT = '2026-09-16';
const GEAENDERT = '2026-09-16';

export function links() {
  return [{rel: 'stylesheet', href: fragenStyles}];
}

/** @type {MetaFunction} */
export const meta = () => {
  const schema = hubSchema(FRAGEN, {
    datePublished: isoMitZone(VEROEFFENTLICHT),
    dateModified: isoMitZone(GEAENDERT),
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    {property: 'og:site_name', content: MARKE},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export default function FragenRoute() {
  return <FragenHub />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
