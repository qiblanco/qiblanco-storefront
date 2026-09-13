import {Link, useLoaderData} from 'react-router';
import {policyTitelDe} from '~/lib/policy-titel';
import {canonicalLink} from '~/lib/seo';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {seitenSignale} from '~/lib/seiten-seo';

/**
 * @type {MetaFunction<typeof loader>} *
 * DIESE ROUTE LIEGT AB HIER IN DER IMPORT-CLOSURE VON app/lib/seiten-seo.js.
 * Der Kopf jener Datei sagt, sie werde "ausschliesslich von den /pages-Routen"
 * importiert -- das gilt seit diesem Commit nicht mehr, und das ist keine
 * Nebenbemerkung: hb-deploy Gate 12 loest eine geaenderte geteilte Datei ueber
 * ihre Import-Closure auf. Wer seiten-seo.js aendert, braucht ab jetzt auch
 * fuer diese Seite einen gueltigen Formate-Nachweis. Der Satz dort wird bewusst
 * NICHT nachgezogen: eine Kommentar-Aenderung an seiten-seo.js zieht ihrerseits
 * alle 31 /pages-Routen in dieselbe Pruefung, also genau den Preis, vor dem der
 * Satz warnt. Der Hinweis steht deshalb hier, beim neuen Importeur.
 */
export const meta = ({data, params}) => {
  const titel = policyTitelDe(params?.handle, data?.policy?.title);
  const vollerTitel = titel ? `${titel} | Qi Blanco` : 'Qi Blanco';
  const tags = [{title: vollerTitel}];
  // Selbst-canonical (s04, 2026-08-26). Die Rechtstexte (Versand, Widerruf,
  // Datenschutz, AGB) sind eigenständige, indexierbare Seiten mit echtem
  // Inhalt — `/policies/shipping-policy` misst 475 eigene Wörter gegen ein
  // nachweislich leeres Gerüst. Sie bleiben im Index; ihnen fehlte nur der
  // canonical, weil diese Route nie einen setzte.
  //
  // TEILBILD UND STRUKTURIERTE DATEN kamen am 2026-09-13 dazu (Job 20260912-
  // sieben-indexierbare-seiten-ohne-sitemap-und-ohne-auszeichnung-prio22).
  // s04 hat den Canonical gesetzt und die beiden anderen Signale offen
  // gelassen; gemessen am 2026-09-12 trugen alle vier Rechtstexte weiterhin
  // kein og:image und kein JSON-LD -- ein geteilter Link auf den Widerruf
  // zeigte ein nacktes Feld, und eine Suchmaschine sah einen Textblock, dem
  // niemand sagt, was er ist. Derselbe Zustand auf crystal-cacao.com: es ist
  // eine Luecke der GETEILTEN Routenklasse, nicht eines Ladens.
  //
  // DER PFAD KOMMT AUS `params`, NICHT AUS DEN GELADENEN DATEN: `params.handle`
  // ist die Adresse, die der Besucher aufgerufen hat, und genau die soll
  // kanonisiert und geteilt werden. Bleibt die Shopify-Abfrage leer, wirft der
  // Loader 404 und es gibt ohnehin nichts zu indexieren.
  //
  // DER RECHTSTEXT SELBST BLEIBT UNBERUEHRT -- hier wird der <head> ergaenzt.
  if (params?.handle) {
    const pfad = `/policies/${params.handle}`;
    tags.push(canonicalLink(pfad), ...seitenSignale({pfad, titel: vollerTitel}));
  }
  return tags;
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
        <Link to="/policies" className="rs-doc__back">
          ← Zurück zur Übersicht
        </Link>
        <h1>{policyTitelDe(handle, policy.title)}</h1>
      </header>
      {/* Rechtlich wirksamer Rumpf — unveraendert aus dem Shopify-Admin.
          Gestaltet wird er ausschließlich über .rs-doc__rumpf (CSS), nie
          durch Eingriff in den Text. */}
      <div
        className="rs-doc__rumpf"
        dangerouslySetInnerHTML={{__html: fremdHtmlMitBildAuszeichnung(policy.body)}}
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
