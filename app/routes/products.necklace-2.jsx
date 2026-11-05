import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/necklace-2-alpha-daten';
import {NECKLACE_2_ENTWURF} from '~/components/product-pages/necklace-2-entwurf';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {AlphaFaqMitRate} from '~/components/product-pages/AlphaVorlageSlots';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import alphaKetteStyles from '~/styles/alpha-kette.css?url';

/*
 * Kaufseite Necklace 2 (Christian 04.11.2026). Das Produkt steht in Shopify als
 * ENTWURF und ist damit für die Storefront-API unsichtbar. Nur mit
 * NECKLACE2_VORSCHAU=on (Vorschau-Dienst, nie Oxygen) zeigt die Route den Stand
 * aus necklace-2-entwurf.js und sperrt den Kaufknopf. Ohne Schalter und ohne
 * freigegebenes Produkt: 404. Freigabe: Schalter und Entwurfsdatei entfallen.
 */
export const meta = ({data}) => {
  return [
    ...produktMeta({
      produkt: data?.product,
      marktLand: data?.marktLand,
      pfad: '/products/necklace-2',
      titel: `${data?.product?.title ?? ''} | ${MARKE}`,
      bildUrl: data?.product?.images?.nodes?.[0]?.url,
    }),
    ...(data?.vorschau ? [{name: 'robots', content: 'noindex, nofollow'}] : []),
  ];
};

export async function loader({context, request}) {
  const {storefront} = context;
  const {product} = await storefront.query(NECKLACE_2_QUERY, {
    cache: storefront.CacheShort(),
    variables: {handle: 'necklace-2', selectedOptions: getSelectedProductOptions(request)},
  });
  if (product?.id) {
    redirectIfHandleIsLocalized(request, {handle: 'necklace-2', data: product});
    return {product, marktLand: storefront.i18n.country, vorschau: false};
  }
  if (context.env?.NECKLACE2_VORSCHAU === 'on') {
    return {product: NECKLACE_2_ENTWURF, marktLand: storefront.i18n.country, vorschau: true};
  }
  throw new Response(null, {status: 404});
}

export default function Product() {
  const {product, vorschau} = useLoaderData();
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={alphaKetteStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        kaufErstNachFreigabe={vorschau}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />}}
      />
    </>
  );
}

const VARIANTE_FRAGMENT = `#graphql
  fragment Necklace2Variante on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
`;

const NECKLACE_2_QUERY = `#graphql
  query Necklace2(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      id
      title
      vendor
      handle
      descriptionHtml
      description
      images(first: 10) { nodes { id url altText width height } }
      options { name optionValues { name firstSelectableVariant { ...Necklace2Variante } } }
      selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
        ...Necklace2Variante
      }
      adjacentVariants(selectedOptions: $selectedOptions) { ...Necklace2Variante }
      variants(first: 20) { nodes { ...Necklace2Variante } }
      seo { description title }
    }
  }
  ${VARIANTE_FRAGMENT}
`;
