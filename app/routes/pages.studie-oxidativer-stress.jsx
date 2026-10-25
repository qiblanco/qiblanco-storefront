import {StudieSeite} from '~/components/studien/StudieSeite';
import {STUDIEN_NACH_ID, untersuchteProdukte} from '~/data/studien';
import {citationMeta, studieSchema} from '~/lib/studien-schema';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import studienStyles from '~/styles/studien.css?url';

const STUDIE = STUDIEN_NACH_ID['e0003'];
const PFAD = '/pages/studie-oxidativer-stress';
// Kaufseite des untersuchten Produkts (Zuordnung in app/data/studien/index.js),
// für die about-Referenz im JSON-LD (Hypothese GS-203).
const PRODUKT_PFAD = untersuchteProdukte().find(
  (p) => p.name === STUDIE.eckdaten.produkt,
)?.pfad;

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
  ...citationMeta(STUDIE),
  {'script:ld+json': studieSchema(STUDIE, {produktPfad: PRODUKT_PFAD})},
];

export default function StudieOxidativerStress() {
  return <StudieSeite studie={STUDIE} />;
}
