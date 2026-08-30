import {useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';

export const meta = ({data}) => {
  return [
    {title: `Qi Blanco | ${data?.page.title ?? ''}`},
    canonicalLink('/pages/mentales-setting'),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'mentales-setting');
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

export default function MentalesSettingPage() {
  const {page} = useLoaderData();
  return (
    <CourseLesson
      title={page.title}
      body={page.body}
      courseTitle="Superhuman"
      courseTo="/pages/superhuman"
      videoEmbed="https://www.youtube.com/embed/MwLL1db-og4?si=fFSiUg7PduCl9WKn"
      prevLesson={{label: 'Vorherige Lektion', to: '/pages/entgiftung'}}
      nextLesson={{label: 'Nächste Lektion', to: '/pages/vitamine-mineralien'}}
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
