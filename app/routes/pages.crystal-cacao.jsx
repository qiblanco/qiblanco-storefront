import {redirect, useLoaderData} from 'react-router';
import {kakaoLadenZiel} from '~/lib/kakao-laden-weiche.server';
import {Kakao} from '~/components/product-pages/Kakao';
import crystalCacaoStyles from '~/styles/crystal-cacao.css?url';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * Token-Schicht dieser Route. Sie hängt NUR hier und trägt
 * deshalb auf keiner anderen Seite - app.css bleibt unangetastet. Der Scope
 * ist die Klasse `cc` am Wurzel-Element der Kakao-Komponente.
 */
export function links() {
  return [{rel: 'stylesheet', href: crystalCacaoStyles}];
}

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // TITEL (2026-09-26, AI-CEO-Entscheid seo:entscheidung:vorlage-titel-und-
  // beschreibungen-dach-20260908): 30-65 Zeichen, weil die Suchergebnis-Zeile
  // darunter Flaeche verschenkt und darueber abschneidet. Aussage vorn, Marke
  // hinten, keine Kurs-Nummerierung und keine Minutenangabe: beides sagt dem
  // Suchenden nicht, was er auf der Seite bekommt.
  // GEO M5-F2 (2026-10-11, SAGEO), Job
  // 20261011-geo-sageo-m5f2-strukturfelder-ratgeber-de-us-crystal:
  // Title höchstens 60 Zeichen mit Gegenstand,
  // Marke am Ende (Seitenregel R3); Meta 120-160 Zeichen mit Zahlen, die die
  // Seite sichtbar trägt (R4). Arm A eines A/B, Kontrolle Arm B bis 28 Tage
  // nach Livegang. Vorher: 'Crystal Cacao®: Kakao für einen wachen, klaren Kopf | Qi Blanco'
  // Meta vorher: 'Crystal Cacao® – High Performance Cacao. Wach. Klar. …' (109 Zeichen)
  const titel = 'Crystal Cacao®: Kakao für Energie und Klarheit | Qi Blanco';
  return [
    {title: titel},
    {
      name: 'description',
      content:
        'Crystal Cacao® aus Peru: 24 Mineralstoffe, 158 mg Theobromin und ' +
        '21 mg Koffein je 15 g. Bio, ohne Zucker, 20 Tage ' +
        'Geld-zurück-Garantie.',
    },
    canonicalLink('/pages/crystal-cacao'),
    ...seitenSignale({
      pfad: '/pages/crystal-cacao',
      titel,
    }),
  ];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // KAKAO-LADEN-WEICHE (20260930-growth-crystal-laden-zulauf-traeger): Einstiege
  // aus eigenen Kanälen (Social organisch, Mail) gehen per 302 in den eigenen
  // Laden crystal-cacao.com; Suche, bezahlt, intern und ohne Referrer bleiben.
  // Schalter Shop-Metafeld qb_routing.kakao_laden, fail-safe aus.
  const kakaoZiel = await kakaoLadenZiel(args);
  if (kakaoZiel) {
    throw redirect(kakaoZiel, {status: 302, headers: {'Cache-Control': 'no-store'}});
  }
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args, 'crystal-cacao');
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, request}, handle) {
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {
      variables: {handle},
    }),
  ]);

  // Graceful fallback — Shopify page optional; component is self-contained
  if (page) {
    redirectIfHandleIsLocalized(request, {handle, data: page});
  }

  return {page: page ?? null};
}

function loadDeferredData() {
  return {};
}

export default function CrystalCacaoPage() {
  return <Kakao scope="cc" />;
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
