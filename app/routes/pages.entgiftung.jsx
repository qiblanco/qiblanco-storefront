import {useLoaderData} from 'react-router';
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
    ...beschreibungTags('/pages/entgiftung', data?.page?.seo?.description),
    canonicalLink('/pages/entgiftung'),
    ...seitenSignale({
      pfad: '/pages/entgiftung',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
    // Das Lektionsvideo als VideoObject. Die Einbettungs-URL kommt aus
    // app/lib/kurs-video-schema.js und ist DIESELBE, die unten an
    // <CourseLesson videoEmbed=...> steht — dass die beiden nie
    // auseinanderlaufen, prüft test/kurs-video-schema.test.mjs Zeichen um
    // Zeichen, nicht diese Konvention.
    ...kursVideoSignale({
      pfad: '/pages/entgiftung',
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'entgiftung');
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

export default function EntgiftungPage() {
  const {page} = useLoaderData();
  return (
    <CourseLesson
      title={page.title}
      body={page.body}
      courseTitle="Superhuman"
      courseTo="/pages/superhuman"
      videoEmbed="https://www.youtube.com/embed/oNwG0CB5PFQ?si=jNiXZR-A2Uow4RJ2"
      nextLesson={{label: 'Nächste Lektion', to: '/pages/mentales-setting'}}
    />
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
