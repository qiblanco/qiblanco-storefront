import {useLoaderData} from 'react-router';
import {CourseLesson} from '~/components/kurse/CourseLesson';
import {appleSeiteFuerPfad, appleSeiteLaden} from '~/lib/apple-seiten';
import {KursApple} from '~/components/apple-seite/lp/KursApple';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {beschreibungTags} from '~/lib/seiten-beschreibung';
import {seitenSignale} from '~/lib/seiten-seo';
import {kursVideoSignale} from '~/lib/kurs-video-schema';

export const meta = ({data}) => {
  const titel = `Qi Blanco | ${data?.page.title ?? ''}`;
  return [
    {title: titel},
    ...beschreibungTags('/pages/vitamine-mineralien', data?.page?.seo?.description),
    canonicalLink('/pages/vitamine-mineralien'),
    ...seitenSignale({
      pfad: '/pages/vitamine-mineralien',
      titel,
      beschreibung: data?.page?.seo?.description,
    }),
    // Das Lektionsvideo als VideoObject. Die Einbettungs-URL kommt aus
    // app/lib/kurs-video-schema.js und ist DIESELBE, die unten an
    // <CourseLesson videoEmbed=...> steht — dass die beiden nie
    // auseinanderlaufen, prüft test/kurs-video-schema.test.mjs Zeichen um
    // Zeichen, nicht diese Konvention.
    ...kursVideoSignale({
      pfad: '/pages/vitamine-mineralien',
      beschreibung: data?.page?.seo?.description,
    }),
  ];
};

export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'vitamine-mineralien');
  // APPLE-FASSUNG (s07-r3): Schalter in app/lib/apple-seiten.js, aus = C unverändert.
  const appleSeite = appleSeiteLaden(args.context, appleSeiteFuerPfad('/pages/vitamine-mineralien'));
  return {...deferredData, ...criticalData, appleSeite};
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

export default function VitamineMineralienPage() {
  const {page, appleSeite} = useLoaderData();
  const lektion = (
    <CourseLesson
      title={page.title}
      body={page.body}
      courseTitle="Superhuman"
      courseTo="/pages/superhuman"
      videoEmbed="https://www.youtube.com/embed/dHwlb37bRVQ?si=EcS1aOzGuHsF5KmH"
      prevLesson={{label: 'Vorherige Lektion', to: '/pages/mentales-setting'}}
      nextLesson={{label: 'Nächste Lektion', to: '/pages/e-smog'}}
    />
  );
  return appleSeite?.an ? <KursApple seite={appleSeite.seite}>{lektion}</KursApple> : lektion;
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
