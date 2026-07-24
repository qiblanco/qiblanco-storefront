import usStyles from '~/styles/us.css?url';

/*
 * US-Support-Seite /en-us/pages/support — Vorabversion (Job 20260720-usa-
 * seite-auf-dach-basis-vorabversion s05, SOLL 9). EN-Inhalt destilliert
 * aus der LIVE US-Support-Seite qi-blanco.com/pages/support (curl
 * 2026-07-20): FAQ-Bestand 1:1-nah uebernommen (hedged Formulierungen der
 * Live-Seite beibehalten), Kontakt als E-Mail statt Formular (kein
 * EN-Formular-Backend in der Vorab-Phase).
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [{rel: 'stylesheet', href: usStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Support & FAQ | Qi Blanco'},
  {
    name: 'description',
    content:
      'Frequently asked questions about the QiOne® 2 Pro and the Qi Blanco store: how it works, wearing, returns, shipping to the U.S., and how to get in touch.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const FAQ = [
  {
    q: 'How does the QiOne® 2 Pro work?',
    a: [
      'The QiOne® 2 Pro is like a booster for your well-being — and it is not an electronic device. Its golden “heart” is the specially developed GitterChip™: a precise arrangement of gold atoms that creates a static field designed to promote the transition of water molecules into the so-called coherent state, in which they arrange in a liquid-crystalline structure.',
      'Water makes up a significant portion of your body’s composition. The more ordered water structures are present, the more potential benefits may arise — many users report improvements in sleep, energy, and resilience against everyday stressors. Individual experiences vary.',
    ],
  },
  {
    q: 'Can the formation of ordered water structures be measured?',
    a: [
      'Yes — there are several methods to observe the formation of ordered water structures. One of the most accessible is microscopic observation, particularly on hydrophobic surfaces. You can find our peer-reviewed cell study publications on the home page.',
    ],
  },
  {
    q: 'Do you offer a special device for smartphones?',
    a: [
      'No. Many products out there claim to harmonize, shield, block, or neutralize EMFs — they typically aim to keep EMFs away from you. Our approach is different: our products are designed to support you at the cellular level, so once you wear your QiOne® 2 Pro, there is no need for additional devices.',
    ],
  },
  {
    q: 'Can I return your products?',
    a: [
      'We are so confident that you will like your QiOne® 2 Pro that we offer a “no questions asked” return policy on all of our products for 14 days. Please contact us by email before returning a product — you will receive the address and a prepaid, insured return label from us. Once we receive the returned product, your refund will be issued. See our Refund & Return Policy for details.',
    ],
  },
  {
    q: 'Can I use the sauna with the QiOne® 2 Pro? Can it get wet?',
    a: [
      'The QiOne® 2 Pro is made of very durable surgical-grade steel and is resistant to chlorine and sea water, sweat, sunlight, and heat. Avoid long, blazing midday sun, sauna, and long exposure to sea and chlorinated water, and your QiOne® 2 Pro is built to last.',
    ],
  },
  {
    q: 'Can I wear the QiOne® 2 Pro on a different chain?',
    a: [
      'Yes. If the included cotton-ribbon necklace does not work for you, you can purchase a stainless steel chain from Qi Blanco® in 5 different sizes.',
    ],
  },
  {
    q: 'How should I wear the QiOne® 2 Pro?',
    a: [
      'Whatever is most comfortable for you. Most users wear it around their neck. Direct skin contact provides the best results, but it can also be worn over clothing or carried in your pocket — just make sure not to lose it.',
    ],
  },
  {
    q: 'Does the effect diminish over time?',
    a: [
      'No — your QiOne® 2 Pro always works. Some people notice a change right away; reported sensations include tingling, chills, or feelings of warmth. The perceived intensity differs from person to person and often diminishes over time, which many describe as habituation — while others notice changes only days or weeks later, or when they take the QiOne® 2 Pro off for a while. Individual experiences vary.',
    ],
  },
  {
    q: 'Does the QiOne® 2 Pro influence the water I drink?',
    a: [
      'The water you drink is directly encouraged to form ordered structures — the underlying effect is designed to be self-replicating. This is one of the aspects we examine in our cell study publications.',
    ],
  },
  {
    q: 'When will I receive my order?',
    a: [
      'The QiOne® 2 Pro is manufactured in our facility in Munich, Germany, from where it ships. Once your order is placed and payment received, we prepare it for shipment within 2–5 days. You will receive a confirmation email with your tracking number as soon as it ships. Since it ships from Germany, it has to clear U.S. customs — usually in less than a week, in rare cases up to 4 weeks. Every shipment is fully insured by Qi Blanco®, and all duties and taxes are included.',
    ],
  },
];

export default function UsSupportPage() {
  return (
    <div
      className="NormalSectionSize"
      style={{maxWidth: '860px', padding: '3rem 1.5rem 5rem'}}
    >
      <h1 style={{marginBottom: '0.75rem'}}>We are happy to help</h1>
      <p style={{lineHeight: '1.8'}}>
        Find answers to the most common questions below — or{' '}
        <a href="#us-contact">get in touch</a> directly.
      </p>

      <h2 style={{margin: '2.5rem 0 1rem'}}>Frequently asked questions</h2>
      <div>
        {FAQ.map(({q, a}) => (
          <div className="us-faq-item" key={q}>
            <h3>{q}</h3>
            {a.map((absatz) => (
              <p key={absatz.slice(0, 40)}>{absatz}</p>
            ))}
          </div>
        ))}
      </div>

      <section id="us-contact" style={{marginTop: '3rem'}}>
        <h2>Get in touch</h2>
        <p style={{lineHeight: '1.8'}}>
          We are here for you! If you have more questions or want to chat
          about something else, email us at{' '}
          <a href="mailto:service@qiblanco.com">service@qiblanco.com</a> — or
          use the support chat on this website.
        </p>
      </section>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
