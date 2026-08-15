import {Link, useLoaderData} from 'react-router';
import {policyTitelDe} from '~/lib/policy-titel';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data, params}) => {
  const titel = policyTitelDe(params?.handle, data?.policy?.title);
  return [{title: titel ? `${titel} | Qi Blanco` : 'Qi Blanco'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({params, context}) {
  if (!params.handle) {
    throw new Response('No handle was passed in', {status: 404});
  }

  const policyName = params.handle.replace(/-([a-z])/g, (_, m1) =>
    m1.toUpperCase(),
  );

  const data = await context.storefront.query(POLICY_CONTENT_QUERY, {
    variables: {
      privacyPolicy: false,
      shippingPolicy: false,
      termsOfService: false,
      refundPolicy: false,
      [policyName]: true,
      language: context.storefront.i18n?.language,
    },
  });

  const policy = data.shop?.[policyName];

  if (!policy) {
    throw new Response('Could not find the policy', {status: 404});
  }

  return {policy, handle: params.handle};
}

export default function Policy() {
  /** @type {LoaderReturnData} */
  const {policy, handle} = useLoaderData();

  return (
    <article className="policy">
      <header className="rs-doc__kopf">
        <Link to="/policies" className="rs-doc__zurueck">
          ← Zurück zur Übersicht
        </Link>
        <h1>{policyTitelDe(handle, policy.title)}</h1>
      </header>
      {/* Rechtlich wirksamer Rumpf — unveraendert aus dem Shopify-Admin.
          Gestaltet wird er ausschliesslich ueber .rs-doc__rumpf (CSS), nie
          durch Eingriff in den Text. */}
      <div
        className="rs-doc__rumpf"
        dangerouslySetInnerHTML={{__html: policy.body}}
      />
    </article>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/objects/Shop
const POLICY_CONTENT_QUERY = `#graphql
  fragment Policy on ShopPolicy {
    body
    handle
    id
    title
    url
  }
  query Policy(
    $country: CountryCode
    $language: LanguageCode
    $privacyPolicy: Boolean!
    $refundPolicy: Boolean!
    $shippingPolicy: Boolean!
    $termsOfService: Boolean!
  ) @inContext(language: $language, country: $country) {
    shop {
      privacyPolicy @include(if: $privacyPolicy) {
        ...Policy
      }
      shippingPolicy @include(if: $shippingPolicy) {
        ...Policy
      }
      termsOfService @include(if: $termsOfService) {
        ...Policy
      }
      refundPolicy @include(if: $refundPolicy) {
        ...Policy
      }
    }
  }
`;

/**
 * @typedef {keyof Pick<
 *   Shop,
 *   'privacyPolicy' | 'shippingPolicy' | 'termsOfService' | 'refundPolicy'
 * >} SelectedPolicies
 */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Shop} Shop */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
