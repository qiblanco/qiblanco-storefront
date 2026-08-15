import {useLoaderData, Link} from 'react-router';
import {policyBeschreibungDe, policyTitelDe} from '~/lib/policy-titel';

export const meta = () => [
  {title: 'Rechtliche Hinweise | Qi Blanco'},
  {
    name: 'description',
    content:
      'Rückerstattung, Datenschutz, Versand und Nutzungsbedingungen von Qi Blanco im Überblick.',
  },
];

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const data = await context.storefront.query(POLICIES_QUERY);
  const policies = Object.values(data.shop || {});

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <div className="policies">
      <header className="rs-doc__kopf">
        <h1>Rechtliche Hinweise</h1>
        <p className="rs-doc__meta">
          Rückerstattung, Datenschutz, Versand und Nutzungsbedingungen im
          Überblick.
        </p>
      </header>
      {/* <fieldset> war hier ein Layout-Behelf aus der Hydrogen-Vorlage —
          semantisch gehoert es zu Formularfeldern. Eine Liste von Links ist
          eine Liste. */}
      <ul className="rs-doc__liste">
        {policies.map((policy) => {
          if (!policy) return null;
          return (
            <li key={policy.id}>
              <Link
                to={`/policies/${policy.handle}`}
                className="rs-doc__karte"
              >
                <span className="rs-doc__karte-titel">
                  {policyTitelDe(policy.handle, policy.title)}
                </span>
                {policyBeschreibungDe(policy.handle) ? (
                  <span className="rs-doc__karte-text">
                    {policyBeschreibungDe(policy.handle)}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
