import {UsDraftNotice} from '~/components/us/UsDraftNotice';
import usStyles from '~/styles/us.css?url';

/*
 * US-Shipping-Policy /en-us/pages/shipping-policy — ENTWURF (Vorabversion,
 * Job 20260720-usa-seite-auf-dach-basis-vorabversion s05). Die Live-US-
 * Seite hat KEINE eigene Shipping-Policy-Seite (Konzept 1a Kap. 3 ii:
 * "Shipping Policy (neu)") — Inhalte destilliert aus den belegten Live-
 * Fakten: Versand aus Deutschland (Fertigung Muenchen), 2–5 Tage
 * Bearbeitung, Tracking-Mail, US-Zoll i. d. R. < 1 Woche (bis zu 4
 * Wochen), voll versichert, Free Shipping, duties & taxes included
 * (Startseiten-Trust-Bullets + Support-FAQ + Order-Befund N4).
 * KEIN Rechtsrat; US-Anwalts-Review vor Live = Christian-Gate.
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Shipping Policy | Qi Blanco'},
  {
    name: 'description',
    content:
      'Shipping policy of the Qi Blanco online store: free, fully insured shipping from Germany to the U.S. — all duties and taxes included.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const pStyle = {lineHeight: '1.8'};

export default function UsShippingPolicyPage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <UsDraftNotice />
      <h1 style={{margin: '2rem 0 2.5rem'}}>Shipping Policy</h1>

      <section style={{marginBottom: '2rem'}}>
        <h2>1. Free, insured shipping</h2>
        <p style={pStyle}>
          Shipping to the United States is <b>free of charge</b> and every
          shipment is <b>fully insured</b> by Qi Blanco®. All applicable
          duties and taxes are included — there are no extra costs for you at
          delivery.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>2. Processing and transit times</h2>
        <p style={pStyle}>
          Our products are manufactured at our facility in Munich, Germany,
          from where they ship. Once your order is placed and payment is
          received, we prepare your order for shipment within <b>2–5 days</b>.
          As soon as your order has shipped, you will receive an email from
          our customer service team confirming the shipment and providing
          your tracking number, so you can check the progress of your
          shipment at any time.
        </p>
        <p style={pStyle}>
          Since your order ships from Germany, it has to clear U.S. customs.
          This usually takes <b>less than a week</b>, but can in certain
          instances take up to 4 weeks. This is out of our control, but we
          prepare every shipment carefully for smooth customs clearance.
        </p>
      </section>

      <section style={{marginBottom: '2rem'}}>
        <h2>3. Order tracking</h2>
        <p style={pStyle}>
          Every shipment includes a tracking link. If your tracking has not
          updated for an unusually long time or you have questions about your
          delivery, contact us at{' '}
          <a href="mailto:service@qiblanco.com">service@qiblanco.com</a> — we
          are happy to help.
        </p>
      </section>

      <section>
        <h2>4. Returns</h2>
        <p style={pStyle}>
          For returns, please see our{' '}
          <a href="/en-us/pages/refund-policy">Refund &amp; Return Policy</a>.
          We provide a prepaid, insured return label and the customs
          documents you need.
        </p>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
