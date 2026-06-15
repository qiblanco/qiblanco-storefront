import {useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {loadCourseProducts} from '~/lib/course-products';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import qioneZellschutzStyles from '~/styles/qione-zellschutz.css?url';

export function links() {
  return [{rel: 'stylesheet', href: qioneZellschutzStyles}];
}

export const meta = ({data}) => {
  return [
    {title: `Qi Blanco | ${data?.page.title ?? ''}`},
    {rel: 'canonical', href: '/pages/intuition-erfahren'},
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const [criticalData, products] = await Promise.all([
    loadCriticalData(args, 'intuition-erfahren'),
    loadCourseProducts(args.context),
  ]);
  return {...deferredData, ...criticalData, products};
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

export default function IntuitionErfahrenPage() {
  const {page, products} = useLoaderData();
  return (
    <CourseLesson
      title={page.title}
      body={page.body}
      courseTitle="Zeremonie Kakao Kurs"
      courseTo="/pages/zeremonie-kakao-kurs"
      products={products}
      videoEmbed="https://www.youtube-nocookie.com/embed/lgPFnXoDdYA?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3"
      nextLesson={{label: 'Nächste Lektion', to: '/pages/was-ist-zeremonie-kakao'}}
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
