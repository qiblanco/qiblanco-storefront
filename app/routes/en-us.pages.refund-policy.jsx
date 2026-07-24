import {UsDraftNotice} from '~/components/us/UsDraftNotice';
import usStyles from '~/styles/us.css?url';

/*
 * US-Refund/Return-Policy /en-us/pages/refund-policy — ENTWURF (Vorab-
 * version, Job 20260720-usa-seite-auf-dach-basis-vorabversion s05).
 * Ausgangsmaterial: LIVE qi-blanco.com — Cancellation Policy (§ 7 der
 * terms-conditions: 14 Tage Widerruf, Erstattungs-Folgen), /pages/
 * return-instructions (3-Schritte-Rueckversand mit bezahltem Label +
 * Zoll-Rechnungen) und Support-FAQ ("no questions asked", erst Kontakt,
 * versichertes Retourenlabel). Modernisiert zusammengefuehrt; KEIN
 * Rechtsrat, US-Anwalts-Review vor Live = Christian-Gate.
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Refund & Return Policy | Qi Blanco'},
  {
    name: 'description',
    content:
      'Refund and return policy of the Qi Blanco online store: 14-day no-questions-asked returns with a prepaid, insured return label.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const pStyle = {lineHeight: '1.8'};

export default function UsRefundPolicyPage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <UsDraftNotice />
      <h1 style={{margin: '2rem 0 2.5rem'}}>Refund &amp; Return Policy</h1>

      <section style={{marginBottom: '2rem'}}>
        <h2>1. Our promise</h2>
        <p style={pStyle}>
          We are confident you will love your Qi Blanco® product. That is why
          we offer a <b>14-day “no questions asked” return policy</b> on all
          of our products. The period runs from the day on which you, or a
          third party designated by you (other than the carrier), receive the
          goods. If you contact us shortly after the period has expired, our
          customer support team will still do its best to assist you.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>2. How to start a return</h2>
        <p style={pStyle}>
          Please contact us <b>by email before returning a product</b>:{' '}
          <a href="mailto:service@qiblanco.com">service@qiblanco.com</a>. You
          will receive the return address, the return documents, and a{' '}
          <b>prepaid, insured return label</b> from us so you can safely send
          the product back. We are not liable for the shipment until the
          goods have been received by us — please always use the insured
          label we provide.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>3. Return instructions (international shipments)</h2>
        <ol style={{lineHeight: '1.9', marginTop: '0.5rem'}}>
          <li>
            <b>Packaging:</b> return the products in their original packaging
            to avoid damage during transportation. Use a sturdy shipping
            carton — returns in normal envelopes or similar packaging cannot
            be accepted.
          </li>
          <li>
            <b>Customs documents:</b> print out the original invoice and the
            return invoice (provided by us) and attach two copies of the
            return invoice to the outside of the packaging in a transparent
            cover so that customs can check them.
          </li>
          <li>
            <b>Shipping:</b> use the prepaid return label provided by us and
            keep the tracking link so you can follow the progress of the
            return.
          </li>
        </ol>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>4. Refunds</h2>
        <p style={pStyle}>
          Once we receive the returned product, we will refund all payments
          received from you for the purchase, without undue delay and no
          later than fourteen days from the day we receive your cancellation
          notice; we may withhold the refund until we have received the goods
          back or you have provided proof of return, whichever is earlier.
          The refund is issued using the same means of payment you used for
          the original transaction, unless expressly agreed otherwise; you
          will not be charged any fees for the refund.
        </p>
        <p style={pStyle}>
          You are only liable for any diminished value of the goods resulting
          from handling other than what is necessary to establish their
          nature, characteristics, and functioning.
        </p>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p style={pStyle}>
          Qi Blanco UG (haftungsbeschränkt), Brunnrangenstr. 25, 97711
          Maßbach, Germany ·{' '}
          <a href="mailto:service@qiblanco.com">service@qiblanco.com</a>
        </p>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
