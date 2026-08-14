import {StudieSeite} from '~/components/studien/StudieSeite';
import {STUDIEN_NACH_ID} from '~/data/studien';
import {studieSchema} from '~/lib/studien-schema';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import studienStyles from '~/styles/studien.css?url';

const STUDIE = STUDIEN_NACH_ID['e0003'];
const PFAD = '/pages/studie-oxidativer-stress';

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
  {property: 'og:image', content: STUDIE.eckdaten.coverUrl},
  {name: 'twitter:card', content: 'summary_large_image'},
  {'script:ld+json': studieSchema(STUDIE)},
];

export default function StudieOxidativerStress() {
  return <StudieSeite studie={STUDIE} />;
}
