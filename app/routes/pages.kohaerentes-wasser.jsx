import {Link, useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';
import {seitenSignale} from '~/lib/seiten-seo';
import {kursVideoSignale} from '~/lib/kurs-video-schema';

export const meta = ({data}) => {
  const titel = `Qi Blanco | ${data?.page.title ?? ''}`;
  return [
    {title: titel},
    ...beschreibungTags('/pages/kohaerentes-wasser', data?.page?.seo?.description),
    canonicalLink('/pages/kohaerentes-wasser'),
    ...seitenSignale({
      pfad: '/pages/kohaerentes-wasser',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
    // Das Lektionsvideo als VideoObject. Die Einbettungs-URL kommt aus
    // app/lib/kurs-video-schema.js und ist DIESELBE, die unten an
    // <CourseLesson videoEmbed=...> steht — dass die beiden nie
    // auseinanderlaufen, prüft test/kurs-video-schema.test.mjs Zeichen um
    // Zeichen, nicht diese Konvention.
    ...kursVideoSignale({
      pfad: '/pages/kohaerentes-wasser',
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'kohaerentes-wasser');
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}, handle) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {variables: {handle}}),
  ]);
  if (!page) throw new Response('Not Found', {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: page});
  return {page};
}

function loadDeferredData() {
  return {};
}

export default function KohaerentesWasserPage() {
  const {page} = useLoaderData();
  return (
    <>
      {/* Christian, 23.09.2026: Tag 5 bleibt, wie er ist, und bekommt oben
          einen Hinweis auf die Info-Seite zum Begriff. Die Info-Seite trägt
          Titel, H1 und strukturierte Daten zu „kohärentes Wasser"; dieser
          Verweis sagt Besuchern und Suchmaschinen, wo die Hauptseite steht.
          Bewusst HIER und nicht in CourseLesson.jsx: das Bauteil teilen zehn
          Lektionen, und nur diese eine bekommt den Hinweis. */}
      <div className="NormalSectionSize">
        <p
          data-kurs-vertiefung=""
          style={{
            margin: '24px 0 0',
            padding: '12px 16px',
            background: 'var(--qb-flaeche)',
            borderLeft: '3px solid var(--qb-akzent-kauf)',
            borderRadius: '0 8px 8px 0',
          }}
        >
          Alles zum Thema, ausführlich und mit Quellen:{' '}
          <Link to="/pages/was-ist-kohaerentes-wasser" prefetch="intent">
            → Kohärentes Wasser
          </Link>
        </p>
      </div>
      <CourseLesson
        title={page.title}
        body={page.body}
        courseTitle="Superhuman"
        courseTo="/pages/superhuman"
        videoEmbed="https://www.youtube.com/embed/oc0CB-fPlp4?si=fyriX2HtFKagDiBS"
        prevLesson={{label: 'Vorherige Lektion', to: '/pages/e-smog'}}
        nextLesson={{label: 'Nächste Lektion', to: '/pages/das-beispiel'}}
      />
    </>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  ) @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo { description title }
    }
  }
`;
