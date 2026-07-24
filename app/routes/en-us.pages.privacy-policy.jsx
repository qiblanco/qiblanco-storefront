import {UsDraftNotice} from '~/components/us/UsDraftNotice';
import usStyles from '~/styles/us.css?url';

/*
 * US-Privacy-Policy /en-us/pages/privacy-policy — ENTWURF (Vorabversion,
 * Job 20260720-usa-seite-auf-dach-basis-vorabversion s05).
 *
 * Ausgangsmaterial: LIVE qi-blanco.com/pages/privacy-policy (curl
 * 2026-07-20; DSGVO-Grundgeruest der Live-Seite modernisiert/gestrafft).
 * MESSBEFUND: Die Live-Policy enthaelt KEINEN CCPA/CPRA-Abschnitt und
 * /pages/ccpa-opt-out ist live HTTP 404 — der California-Abschnitt hier
 * ist daher NEU-Entwurf (Konzept 1a Kap. 3 ii: "Do Not Sell or Share"-Link
 * konsistent zum Opt-Out-Consent, PUBLIC_CONSENT_STRICT_REGIONS='DE,AT,CH'
 * => US = Opt-Out-Modell). KEIN Rechtsrat; US-Anwalts-Review vor Live =
 * Christian-Gate. Anker #do-not-sell wird vom Footer-Link genutzt.
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Privacy Policy | Qi Blanco'},
  {
    name: 'description',
    content:
      'Privacy Policy of Qi Blanco UG (haftungsbeschränkt), including your California privacy rights (CCPA/CPRA) and how to opt out of the sale or sharing of personal information.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const h3Style = {marginTop: '1.25rem', marginBottom: '0.4rem'};
const pStyle = {lineHeight: '1.8'};

export default function UsPrivacyPolicyPage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <UsDraftNotice />
      <h1 style={{margin: '2rem 0 2.5rem'}}>Privacy Policy</h1>

      <section style={{marginBottom: '2rem'}}>
        <h2>1. Controller</h2>
        <p style={{marginTop: '0.5rem', lineHeight: '1.8'}}>
          Qi Blanco UG (haftungsbeschränkt)
          <br />
          Managing Director: Christian Bernd Bauer
          <br />
          Brunnrangenstr. 25, 97711 Maßbach, Germany
          <br />
          Email: <a href="mailto:info@qiblanco.com">info@qiblanco.com</a>
          <br />
          Register court: Local Court Schweinfurt, HRB 7306 · VAT ID:
          DE306530406
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>2. What data we process</h2>
        <p style={pStyle}>
          Depending on how you use our online store, we process the following
          categories of data:
        </p>
        <ul style={{lineHeight: '1.9', marginTop: '0.5rem'}}>
          <li>
            <b>Identifiers and contact data</b> — such as name, shipping and
            billing address, email address, phone number.
          </li>
          <li>
            <b>Order and payment data</b> — products ordered, order value, and
            payment status. Payment card details are processed by our payment
            providers, not stored by us.
          </li>
          <li>
            <b>Usage data</b> — pages visited, interactions, access times.
          </li>
          <li>
            <b>Device and communication metadata</b> — device information, IP
            address, browser type.
          </li>
          <li>
            <b>Content data</b> — messages you send us (e.g., support
            requests, product reviews).
          </li>
        </ul>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>3. Purposes of processing</h2>
        <ul style={{lineHeight: '1.9', marginTop: '0.5rem'}}>
          <li>Providing the online store, its functions and content</li>
          <li>Processing orders, payment, shipping, and returns</li>
          <li>Answering contact requests and providing customer support</li>
          <li>Security measures and fraud prevention</li>
          <li>Reach measurement and marketing (only as permitted by law and, where required, with your consent or subject to your opt-out)</li>
        </ul>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>4. Service providers and sharing</h2>
        <p style={pStyle}>
          We share personal data with service providers only to the extent
          required to run this store: our e-commerce platform (Shopify),
          payment processors, shipping and logistics partners, email/customer
          service tools, and analytics/advertising services. These providers
          process data on our behalf or as independent controllers under
          their own privacy policies. We do not sell personal data for money.
          Some analytics/advertising cookies may constitute “sharing” for
          cross-context behavioral advertising under California law — see
          section 7 for your opt-out rights.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>5. Cookies and tracking</h2>
        <p style={pStyle}>
          We use cookies and similar technologies for essential store
          functions (e.g., cart), performance measurement, and marketing.
          Where legally required, non-essential technologies are only used
          with your consent; where an opt-out model applies (e.g., for U.S.
          visitors), you can object at any time via the cookie settings on
          this site or the opt-out link in section 7. If you actively decline
          tracking, your choice is respected.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>6. Your rights (GDPR)</h2>
        <p style={pStyle}>
          As a company based in Germany, we apply the EU General Data
          Protection Regulation (GDPR) as our baseline standard. You have the
          right to request information about your stored data, its origin and
          recipients, and the purpose of processing, as well as the right to
          rectification, erasure, restriction of processing, data
          portability, and objection. You also have the right to lodge a
          complaint with a supervisory authority. To exercise these rights,
          contact <a href="mailto:info@qiblanco.com">info@qiblanco.com</a>.
        </p>
      </section>

      <section id="do-not-sell" style={{marginBottom: '2rem'}}>
        <h2>7. California privacy rights (CCPA/CPRA)</h2>
        <p style={pStyle}>
          This section applies to California residents and supplements the
          rest of this Privacy Policy. Under the California Consumer Privacy
          Act (CCPA), as amended by the California Privacy Rights Act (CPRA),
          you have the following rights:
        </p>
        <ul style={{lineHeight: '1.9', marginTop: '0.5rem'}}>
          <li>
            <b>Right to know</b> — request disclosure of the categories and
            specific pieces of personal information we have collected about
            you, the sources, the purposes, and the categories of third
            parties with whom it is disclosed.
          </li>
          <li>
            <b>Right to delete</b> — request deletion of personal information
            we have collected from you, subject to legal exceptions (e.g.,
            completing a transaction, legal obligations).
          </li>
          <li>
            <b>Right to correct</b> — request correction of inaccurate
            personal information.
          </li>
          <li>
            <b>Right to opt out of sale or sharing</b> — we do not sell
            personal information for money; to the extent that
            analytics/advertising technologies are considered “selling” or
            “sharing” for cross-context behavioral advertising, you can opt
            out as described below.
          </li>
          <li>
            <b>Right to limit use of sensitive personal information</b> — we
            do not use sensitive personal information for purposes requiring
            a right to limit.
          </li>
          <li>
            <b>Right to non-discrimination</b> — we will not discriminate
            against you for exercising any of these rights.
          </li>
        </ul>
        <h3 style={h3Style}>Do Not Sell or Share My Personal Information</h3>
        <p style={pStyle}>
          To opt out of the sale or sharing of your personal information for
          cross-context behavioral advertising:
        </p>
        <ul style={{lineHeight: '1.9', marginTop: '0.5rem'}}>
          <li>
            decline or disable marketing/statistics cookies in the cookie
            settings of this website (your active opt-out is respected), or
          </li>
          <li>
            email us at{' '}
            <a href="mailto:info@qiblanco.com?subject=Do%20Not%20Sell%20or%20Share%20My%20Personal%20Information">
              info@qiblanco.com
            </a>{' '}
            with the subject “Do Not Sell or Share My Personal Information”.
          </li>
        </ul>
        <p style={pStyle}>
          We will verify requests to know, delete, or correct by matching the
          information you provide with information we already hold. You may
          designate an authorized agent to make a request on your behalf.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>8. Data retention</h2>
        <p style={pStyle}>
          We retain personal data only as long as necessary for the purposes
          described above or as required by statutory retention obligations
          (e.g., commercial and tax law), and delete it afterwards.
        </p>
      </section>

      <section>
        <h2>9. Changes to this policy</h2>
        <p style={pStyle}>
          We may update this Privacy Policy to reflect changes in our
          services or legal requirements. The current version is always
          available on this page.
        </p>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
