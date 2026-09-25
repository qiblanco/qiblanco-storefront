import {LexikonHub} from '~/components/campaign/LexikonHub';
import lexikonStyles from '~/styles/lexikon.css?url';
import lexikonHubStyles from '~/styles/lexikon-hub.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {LEXIKON} from '~/data/lexikon';
import {hubSchema} from '~/lib/lexikon-schema';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';
import {isoMitZone} from '~/lib/datum';

const PFAD = '/pages/lexikon';

/**
 * /pages/lexikon — der Hub des Lexikons.
 *
 * Gebaut von 20260915-GEO-lexikon-frageseiten-und-ob-die-ki-uns-zitiert,
 * Segment s06, aus Christians Auftrag vom 2026-09-15: „Ein Lexikon, das von
 * der AI akzeptiert wird. Das ist der eigentliche Punkt."
 *
 * WAS „VON DER AI AKZEPTIERT" BAULICH BEDEUTET, und es ist keine Meinung: ein
 * Antwortsystem ordnet Texte ein. Ein Text, der seine eigene Reichweite nennt,
 * wird als Quelle behandelt; ein Text, der alles behauptet, als Werbung.
 * Deshalb trägt JEDER Eintrag einen Grenz-Abschnitt, und deshalb ist dieser
 * Abschnitt maschinell markiert (data-geo="grenze") statt bloß vorhanden.
 *
 * NICHT IM MENUE, ABER NICHT VERSTECKT — die Unterscheidung ist der ganze
 * Punkt. Verboten ist genau eines: verschiedene Inhalte je nach Besucher.
 * Diese Seite und ihre Eintraege liefern Mensch, Googlebot und OAI-SearchBot
 * denselben sichtbaren Text; gemessen wird das, nicht behauptet
 * (seo-manager/pruefungen/probe_lexikon_und_frageseiten_live.py vergleicht
 * drei User-Agents auf dem SICHTBAREN Text, nicht auf Roh-Bytes: Cookiebot
 * setzt je Abruf eine Zufalls-Nonce und React-Streaming liefert dem Browser
 * zusaetzliche Hydrations-Zeilen — auf der Byte-Achse irrt die Messung
 * beidseitig).
 *
 * SITEMAP ÜBER `NUR_ROUTE_SEITEN` (app/lib/seo.js), KEIN Shopify-Seitenobjekt
 * (Fremdsystem, zweiter Traeger). Ohne diesen Eintrag lieferte die Seite
 * HTTP 200 mit vollem Text und stuende in keiner Sitemap: erreichbar und
 * trotzdem unauffindbar.
 *
 * KEIN LOADER, KEIN KAUFWEG, KEINE COOKIES. Der Inhalt ist ein committetes
 * Datenmodul; Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen.
 */
const TITEL = 'Lexikon: unsere Begriffe in der Sprache der Physik | Qi Blanco';
const BESCHREIBUNG =
  'Hohe Frequenz, High Vibe, kohärentes Wasser, Elektrosmog: was Menschen ' +
  'damit meinen, welche messbare Größe dahintersteht – und wo das Bild ' +
  'aufhört zu tragen.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR — siehe pages.kritik.jsx. Wer
 * einen Eintrag ergänzt, zieht `GEAENDERT` und das `lastmod` in
 * NUR_ROUTE_SEITEN im selben Commit nach.
 */
const VEROEFFENTLICHT = '2026-09-15';
const GEAENDERT = '2026-09-25';

export function links() {
  return [
    {rel: 'stylesheet', href: lexikonStyles},
    {rel: 'stylesheet', href: lexikonHubStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => {
  const schema = hubSchema(LEXIKON, {
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

export default function LexikonRoute() {
  return <LexikonHub />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
