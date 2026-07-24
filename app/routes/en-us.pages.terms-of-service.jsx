import {UsDraftNotice} from '~/components/us/UsDraftNotice';
import usStyles from '~/styles/us.css?url';

/*
 * US-Terms-of-Service /en-us/pages/terms-of-service — ENTWURF (Vorab-
 * version, Job 20260720-usa-seite-auf-dach-basis-vorabversion s05).
 * Ausgangsmaterial: LIVE qi-blanco.com/pages/terms-conditions (curl
 * 2026-07-20), modernisiert/gestrafft auf die neue Struktur. Der Live-Text
 * enthaelt operative Widersprueche zum US-Betrieb (z. B. "delivery ...
 * within the Federal Republic of Germany", "Contract language is
 * exclusively German") — solche Stellen sind hier als [To be confirmed in
 * legal review] markiert statt still "korrigiert" (KEIN Rechtsrat;
 * US-Anwalts-Review vor Live = Christian-Gate, Konzept 1a Kap. 3 ii).
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Terms of Service | Qi Blanco'},
  {
    name: 'description',
    content:
      'Terms of Service of the Qi Blanco online store, operated by Qi Blanco UG (haftungsbeschränkt), Germany.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const pStyle = {lineHeight: '1.8'};

function Clause({title, children}) {
  return (
    <section style={{marginBottom: '2rem'}}>
      <h2>{title}</h2>
      <div style={{marginTop: '0.5rem'}}>{children}</div>
    </section>
  );
}

export default function UsTermsOfServicePage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <UsDraftNotice />
      <h1 style={{margin: '2rem 0 2.5rem'}}>Terms of Service</h1>

      <Clause title="§ 1 Scope and provider">
        <p style={pStyle}>
          These Terms of Service apply to all orders placed by you in the
          online store of
        </p>
        <p style={{...pStyle, margin: '0.75rem 0'}}>
          Qi Blanco UG (haftungsbeschränkt)
          <br />
          Brunnrangenstr. 25
          <br />
          97711 Maßbach, Germany
          <br />
          Managing Director: Christian Bernd Bauer
        </p>
        <p style={pStyle}>
          The range of goods in our online store is directed exclusively at
          buyers who have reached the age of 18. Our deliveries, services,
          and offers are based exclusively on these Terms of Service.
          Conflicting general terms and conditions of a customer are hereby
          rejected. You can view the currently valid Terms of Service on this
          page and print them out.
        </p>
        <p style={pStyle}>
          [To be confirmed in legal review: contract language for U.S.
          customers — the previous store version stated German as the
          exclusive contract language.]
        </p>
      </Clause>

      <Clause title="§ 2 Use of the online store, conclusion of contract">
        <p style={pStyle}>
          In this online store, you can purchase the products presented for a
          fee. By clicking the buy button at checkout, you make a legally
          binding offer to Qi Blanco UG (haftungsbeschränkt) to purchase the
          products in your cart. Qi Blanco UG (haftungsbeschränkt) accepts
          this offer by sending an order confirmation email. The product
          description does not constitute a guarantee.
        </p>
      </Clause>

      <Clause title="§ 3 Prices and terms of payment">
        <p style={pStyle}>
          The price of each product and any shipping costs are displayed
          before you place your order. This total is part of the contract
          concluded between you and Qi Blanco UG (haftungsbeschränkt)
          pursuant to § 2. Payment is due upon conclusion of the contract.
          Payment is made using the payment methods offered at checkout
          (e.g., credit card, PayPal, or other displayed wallets). We use
          third-party companies to process payment transactions; all
          integrated third-party companies are indicated in the order or
          payment process, and their terms apply in addition.
        </p>
        <p style={pStyle}>
          [To be confirmed in legal review: tax treatment of U.S. orders —
          prices in the U.S. store are displayed as final amounts; the
          previous store version referenced German VAT.]
        </p>
      </Clause>

      <Clause title="§ 4 Retention of title">
        <p style={pStyle}>
          Qi Blanco UG (haftungsbeschränkt) retains ownership of the ordered
          item until full payment of the purchase price.
        </p>
      </Clause>

      <Clause title="§ 5 Delivery">
        <p style={pStyle}>
          Products are shipped by independent transport companies after
          receipt of payment. Orders ship from Germany; shipments to the
          United States are fully insured, and applicable duties and taxes
          are included. Details, timelines, and customs information can be
          found in our{' '}
          <a href="/en-us/pages/shipping-policy">Shipping Policy</a>.
          Collection in person is not possible. Place of performance is the
          registered office of Qi Blanco UG (haftungsbeschränkt).
        </p>
      </Clause>

      <Clause title="§ 6 Right of cancellation and returns">
        <p style={pStyle}>
          Consumers have a right of cancellation of fourteen days from the
          day on which you, or a third party designated by you (other than
          the carrier), receive the goods. To exercise this right, inform us
          by a clear statement (e.g., email to{' '}
          <a href="mailto:service@qiblanco.com">service@qiblanco.com</a>)
          before the cancellation period expires. The details of the
          cancellation consequences, refunds, and the return process are set
          out in our{' '}
          <a href="/en-us/pages/refund-policy">Refund &amp; Return Policy</a>.
        </p>
      </Clause>

      <Clause title="§ 7 Warranty">
        <p style={pStyle}>
          The statutory warranty provisions apply. Individual results with
          our products vary; the product description does not constitute a
          guarantee of specific personal outcomes.
        </p>
      </Clause>

      <Clause title="§ 8 Liability">
        <p style={pStyle}>
          Claims for damages against Qi Blanco UG (haftungsbeschränkt) are
          excluded in cases of slight negligence, unless essential
          contractual obligations are affected. Liability for injury to
          life, body, or health and under mandatory product liability law
          remains unaffected.
        </p>
      </Clause>

      <Clause title="§ 9 Final provisions">
        <p style={pStyle}>
          Should individual provisions of these Terms of Service be or become
          invalid, the validity of the remaining provisions shall remain
          unaffected. We are neither willing nor obliged to participate in
          dispute resolution proceedings before a consumer arbitration
          board.
        </p>
        <p style={pStyle}>
          [To be confirmed in legal review: governing law and jurisdiction
          clause for U.S. consumers.]
        </p>
      </Clause>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
