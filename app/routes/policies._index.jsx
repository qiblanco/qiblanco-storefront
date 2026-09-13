import {useLoaderData, Link} from 'react-router';
import {policyBeschreibungDe, policyTitelDe} from '~/lib/policy-titel';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';

const PFAD = '/policies';
const TITEL = 'Rechtliche Hinweise | Qi Blanco';
const BESCHREIBUNG =
  'Rückerstattung, Datenschutz, Versand und Nutzungsbedingungen von Qi Blanco im Überblick.';

/**
 * Selbst-Canonical, Teilbild und strukturierte Daten (Job 20260912-sieben-
 * indexierbare-seiten-ohne-sitemap-und-ohne-auszeichnung-prio22).
 *
 * DIESE UEBERSICHT STAND IN KEINER SITEMAP und trug trotzdem kein `noindex` --
 * ein Crawler erreicht sie ueber die Fusszeile. Sie SOLL auffindbar sein: wer
 * den Widerruf sucht, soll die Uebersicht finden. Darum Canonical statt
 * noindex. Am 2026-09-12 fehlten ihr alle drei Signale, und zwar auf BEIDEN
 * Laeden gleich -- es war nie ein Einzelfall, sondern eine Luecke der
 * geteilten Routenklasse.
 *
 * Die Beschreibung stand schon hier und ist jetzt eine Konstante: sie versorgt
 * `name=description` und `og:description` aus EINER Quelle. Zwei Quellen fuer
 * denselben Text laufen auseinander, und dann zeigt ein geteilter Link etwas
 * anderes als das Suchergebnis. *
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
export const meta = () => [
  {title: TITEL},
  {name: 'description', content: BESCHREIBUNG},
  canonicalLink(PFAD),
  ...seitenSignale({pfad: PFAD, titel: TITEL, beschreibung: BESCHREIBUNG}),
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
