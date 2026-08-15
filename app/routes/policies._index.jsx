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
        {/* Orientierung statt nackter Linkliste: die Seite bestand vorher nur
            aus Titeln, und wer ein konkretes Anliegen hatte (zurückgeben,
            widerrufen), musste raten, hinter welchem Dokument es steht.
            Beschreibt ausschließlich den WEG — bewusst keine Frist, keine
            Bedingung, keine Zusage: was gilt, steht im jeweiligen Dokument. */}
        <p className="rs-doc__lead">
          Hier finden Sie alle verbindlichen Dokumente zu Ihrem Einkauf. Wenn
          Sie ein konkretes Anliegen haben, führt Sie die passende Karte direkt
          dorthin — für die Rückgabe einer Bestellung in die
          Rückerstattungsrichtlinie, für den Widerruf zur Widerrufsbelehrung
          und zum Formular.
        </p>
      </header>
      {/* <fieldset> war hier ein Layout-Behelf aus der Hydrogen-Vorlage —
          semantisch gehört es zu Formularfeldern. Eine Liste von Links ist
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

      {/* ZWEITER BLOCK — die eigentliche Luecke dieser Seite.
          /policies listet ausschließlich die vier Shopify-Policies. Wer hier
          nach Impressum, AGB oder Widerrufsbelehrung sucht (die als eigene
          Seiten unter /pages/ liegen), fand bis hierher nichts und musste
          zurück in den Footer. Diese Liste ist reine NAVIGATION — sie
          wiederholt keinen Rechtstext und trifft keine Aussage über Inhalte,
          sie zeigt nur, wo was steht. */}
      <section className="rs-doc__weiter" aria-labelledby="weitere-angaben">
        <h2 id="weitere-angaben">Weitere rechtliche Angaben</h2>
        <ul className="rs-doc__liste">
          {WEITERE_SEITEN.map((s) => (
            <li key={s.pfad}>
              <Link to={s.pfad} className="rs-doc__karte">
                <span className="rs-doc__karte-titel">{s.titel}</span>
                <span className="rs-doc__karte-text">{s.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/**
 * Die deutschen Rechtsseiten, die NICHT als Shopify-Policy gepflegt sind,
 * sondern als eigene Route existieren.
 *
 * Jede Zeile ist aus der Sicht des Lesers formuliert (was findet ER dort),
 * nicht als Dokumenttyp — Kundenwert-Doktrin KWD-0001. Bewusst KEINE
 * inhaltliche Zusage: "Wie Sie widerrufen" beschreibt den Zweck der Seite,
 * nicht den Umfang eines Rechts.
 *
 * Wird eine dieser Seiten umbenannt oder entfernt, faellt der Link hier auf
 * (Link-Monitor des homepage-bauer) — darum stehen die Pfade als Liste und
 * nicht verstreut im JSX.
 */
const WEITERE_SEITEN = [
  {
    pfad: '/pages/widerrufsbelehrung',
    titel: 'Widerrufsbelehrung',
    text: 'Ihr Widerrufsrecht und die Fristen dazu.',
  },
  {
    pfad: '/widerruf',
    titel: 'Widerruf erklären',
    text: 'Das Formular — ohne Kundenkonto und ohne Login.',
  },
  {
    pfad: '/pages/agb',
    titel: 'Allgemeine Geschäftsbedingungen',
    text: 'Die Bedingungen Ihres Kaufs bei uns.',
  },
  {
    pfad: '/pages/datenschutz',
    titel: 'Datenschutzerklärung',
    text: 'Welche Daten wir verarbeiten und wie Sie widersprechen.',
  },
  {
    pfad: '/pages/impressum',
    titel: 'Impressum',
    text: 'Wer hinter diesem Shop steht und wie Sie uns erreichen.',
  },
];

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
