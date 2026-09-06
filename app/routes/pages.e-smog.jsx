import {useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';

export const meta = ({data}) => {
  return [
    {title: `Qi Blanco | ${data?.page.title ?? ''}`},
    ...beschreibungTags('/pages/e-smog', data?.page?.seo?.description),
    canonicalLink('/pages/e-smog'),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'e-smog');
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

export default function ESmogPage() {
  const {page} = useLoaderData();
  return (
    <CourseLesson
      title={page.title}
      body={page.body}
      courseTitle="Superhuman"
      courseTo="/pages/superhuman"
      videoEmbed="https://www.youtube.com/embed/JmDaIlhOYaA?si=fUstmDJgspa2eDli"
      prevLesson={{label: 'Vorherige Lektion', to: '/pages/vitamine-mineralien'}}
      nextLesson={{label: 'Nächste Lektion', to: '/pages/kohaerentes-wasser'}}
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
