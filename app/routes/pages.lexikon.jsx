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
/*
 * TITEL UND BESCHREIBUNG FÜHREN SEIT 2026-11-14 DEN SUCHBEGRIFF VORN
 * (SEO-Maßnahme M-SP-20261102-lexikon, Pool-Job
 * seo-2026-w46-l26-lexikon-1efa-…): die Seite stand für „physikalische
 * begriffe" auf Platz 9 bis 20, ohne den Begriff im Titel zu tragen. Vorher:
 * 'Lexikon: unsere Begriffe in der Sprache der Physik | Qi Blanco'. Gemessen
 * wird die Wirkung im Wirkungskreislauf des SEO-Managers (gleiche id), nicht
 * am Deploy.
 *
 * Der Titel weicht vom Wortlaut der Maßnahme ab, die h1 nicht: die Maßnahme
 * nannte „Physikalische Begriffe einfach erklärt" vorn. Als Titel wären das
 * mit Marke 63 Zeichen ohne Kundenwort; die GEO-Seitenregel R3 des
 * SEO-Managers (seo-manager/geo/conf/seitenregeln.yaml) verlangt höchstens 60
 * Zeichen und ein Kundenwort. Der Titel führt deshalb den Suchbegriff vorn
 * und „Energie" als Kundenwort; „einfach erklärt" tragen h1 und description.
 * Die Zahl in der description (1 Hertz) steht sichtbar auf der Seite (R4).
 */
const TITEL = 'Physikalische Begriffe: Energie, Frequenz, Feld | Qi Blanco';
const BESCHREIBUNG =
  'Physikalische Begriffe einfach erklärt: 1 Hertz ist eine Schwingung je ' +
  'Sekunde. Dazu Feld, Kohärenz, Energie und Elektrosmog, je mit messbarer ' +
  'Größe und Grenze.';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR — siehe pages.kritik.jsx. Wer
 * einen Eintrag ergänzt, zieht `GEAENDERT` und das `lastmod` in
 * NUR_ROUTE_SEITEN im selben Commit nach.
 */
const VEROEFFENTLICHT = '2026-09-15';
const GEAENDERT = '2026-11-14';

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
