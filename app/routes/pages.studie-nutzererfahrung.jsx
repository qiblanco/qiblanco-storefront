import {StudieSeite} from '~/components/studien/StudieSeite';
import {STUDIEN_NACH_ID} from '~/data/studien';
import {studieSchema} from '~/lib/studien-schema';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import studienStyles from '~/styles/studien.css?url';

/**
 * TITEL, H1, ERSTER ABSATZ UND BESCHREIBUNG, GEÄNDERT AM 2026-11-10
 * (SEO-Maßnahme M-SP-20261017-studie-nutzererfahrung, Grossjob
 * seo-2026-w43-l26-studie-nutzererfahrung-e1b8-…, s02; Text wörtlich aus
 * dessen KONZEPT.md Abschnitt A1).
 *
 * WARUM HIER UND NICHT IN app/data/studien/e0004.json: `seo.h1` aus dem
 * Datenmodul speist auch den Kacheltitel auf /pages/studien
 * (StudienUebersicht.jsx) und die „Passend dazu"-Karten der anderen
 * Studienseiten (StudieSeite.jsx). Diese Änderung gilt nur für diese Seite.
 * Die Kachel auf /pages/studien zieht ein eigener Schritt nach (s03).
 *
 * Vorher (aus e0004.json, dort unverändert):
 *   Titel „Nutzererfahrungen QTA Gitterchip®-Technologie | Qi Blanco"
 *   h1    „QTA Gitterchip®-Technologie: Nutzererfahrungen und präklinische
 *          Daten im Vergleich"
 *   Beschreibung „171 Nutzerberichte zu QiOne® 2 Pro & QiBracelet®: 20 %
 *          berichten tieferen Schlaf, 17 % mehr Energie. Deskriptive
 *          Auswertung ohne Kontrollgruppe."
 * Rückweg: diesen Block entfernen und `STUDIE = STUDIE_DATEN` setzen.
 *
 * „Dauer" fehlt im ersten Absatz mit Absicht: die Arbeit nennt keine
 * Nutzungsdauer. Der Absatz sagt das offen, statt eine zu erfinden.
 */
const SEO_DIESER_SEITE = {
  titel:
    'Nutzerstudie zu Elektrosmog-Schutzprodukten: 171 Erfahrungsberichte | Qi Blanco',
  h1: 'Nutzerstudie zu Elektrosmog-Schutzprodukten: 171 Erfahrungsberichte und Labordaten im Vergleich',
  beschreibung:
    'Nutzerstudie zu Elektrosmog-Schutzprodukten: 171 Berichte zu QiOne® 2 Pro ' +
    'und QiBracelet®. Ruhe und tieferer Schlaf in je rund 20 % genannt, ohne ' +
    'Kontrollgruppe.',
  einstieg:
    'Die Nutzerstudie von Prof. Dr. Peter C. Dartsch (2024) wertet 171 ' +
    'Erfahrungsberichte zu QiOne® 2 Pro und QiBracelet® aus: Am häufigsten ' +
    'nennen sie mehr Ruhe und tieferen Schlaf, jeweils in rund 20 % der ' +
    'Beobachtungen. Die Nutzer haben ihre Beobachtungen freiwillig und ' +
    'unabhängig voneinander in sozialen Medien gepostet, ohne Fragebogen. Die ' +
    'Auswertung hat keine Kontrollgruppe. Wie lange die Geräte jeweils genutzt ' +
    'wurden, gibt die Arbeit nicht an.',
};

const STUDIE_DATEN = STUDIEN_NACH_ID['e0004'];
const STUDIE = {
  ...STUDIE_DATEN,
  seo: {...STUDIE_DATEN.seo, ...SEO_DIESER_SEITE},
};
const PFAD = '/pages/studie-nutzererfahrung';

export function links() {
  return [{rel: 'stylesheet', href: studienStyles}];
}

export const meta = () => [
  {title: STUDIE.seo.titel},
  {name: 'description', content: STUDIE.seo.beschreibung},
  canonicalLink(PFAD),
  {property: 'og:type', content: 'article'},
  {property: 'og:title', content: STUDIE.seo.titel},
  {property: 'og:description', content: STUDIE.seo.beschreibung},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:image', content: STUDIE.eckdaten.coverUrl},
  {name: 'twitter:card', content: 'summary_large_image'},
  {'script:ld+json': studieSchema(STUDIE)},
];

export default function StudieNutzererfahrung() {
  return <StudieSeite studie={STUDIE} />;
}
