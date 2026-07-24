import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {UsBuyBox, UsBenefitList} from '~/components/us/UsBuyBox';
import {StarRating, GOOGLE_REVIEWS_URL} from '~/components/reusables/StarRating';
import usStyles from '~/styles/us.css?url';
import shopStyles from '~/styles/qione-2-pro-shop.css?url';

/*
 * US-QiOne-LP-Shopseite /en-us/pages/qione-2-pro — Vorabversion
 * (Job 20260720-usa-seite-auf-dach-basis-vorabversion s05).
 * STRUKTUR-Traeger: DACH pages.qione-2-pro.jsx (Campaign-PDP, BuyBox oben,
 * Content darunter); EN-Copy destilliert aus der Live-US-Produktseite +
 * US-Trust-Signalen (mp6 Kap. 3: outcome-first, Claims neu legitimiert,
 * "coherent water" NIE als Tatsachenbehauptung).
 *
 * PREIS: AUSSCHLIESSLICH dynamisch ueber den M3-Kanon mit EXPLIZITEM Markt
 * US — der Loader setzt country 'US' in der @inContext-Query (NICHT ueber
 * den Geo-Header: der Preview-Betrachter sitzt in DE, resolveCountry
 * lieferte DE). Format $1,383 via formatPreis (ProductPrice, USD =
 * Endbetrag, Satz 0). KEIN hartkodierter Preis (D-056-Lehre).
 */
export const handle = {htmlLang: 'en', layout: 'us'};

export function links() {
  return [
    {rel: 'stylesheet', href: usStyles},
    {rel: 'stylesheet', href: shopStyles},
  ];
}

/*
 * noindex,nofollow — LP-Shopseite gehoert wie ihr DACH-Pendant in den
 * noindex-Block (D-053) UND die ganze Vorab-Phase ist dunkel (1b P2).
 * BEWUSST KEIN canonical (noindex + canonical = widerspruechliche Signale).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'QiOne® 2 Pro — Get Yours Now | Qi Blanco'},
  {
    name: 'description',
    content:
      'QiOne® 2 Pro — compact wearable designed to support coherent water structuring. Peer-reviewed cell studies, over 14,000 users. Free insured shipping from Germany, duties included.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

/*
 * Loader: geteilte PRODUCT_QUERY (Query-SSoT wie beide DACH-QiOne-Routen),
 * Handle hart 'qione-2-pro', country hart 'US' (Markets-USD-Kontext der
 * Storefront-API; Hydrogen wuerde sonst storefront.i18n = resolveCountry
 * injizieren — fuer den DE-Preview-Betrachter EUR). language bleibt DE
 * (deutschsprachiger Store; die API akzeptiert language DE mit beliebigem
 * country — M3-belegt; Titel/Markenname sind sprachneutral).
 * @param {LoaderFunctionArgs} args
 */
export async function loader({context, request}) {
  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {
      handle: 'qione-2-pro',
      country: 'US',
      selectedOptions: getSelectedProductOptions(request),
    },
    cache: context.storefront.CacheShort(),
  });

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  return {product};
}

/*
 * KEIN Pixel-Code (D-006): ViewContent feuert aus <Analytics.ProductView>
 * in der UsBuyBox; R1/R2/R3 haengen im root-Layout.
 */
export default function UsQiOne2ProRoute() {
  const {product} = useLoaderData();
  return (
    <div className="shopq2">
      <section id="shopq-buybox" data-section="shopq-buybox">
        <UsBuyBox
          product={product}
          socialProof={
            <a
              className="product-rating product-rating--google"
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="4.7 out of 5 stars — see Google reviews for Qi Blanco"
            >
              <span>4.7</span> <StarRating value={4.7} />{' '}
              <span>Over 14,000 users</span>
            </a>
          }
          description={<UsHeroBullets />}
          topBadge={
            <p className="mt-2">
              <b>Over 14,000 users</b>
            </p>
          }
          priceLabel={<div className="BestsellerLabel">Bestseller</div>}
          benefitList={<UsBenefitList />}
        />
      </section>
      <UsProductStory />
    </div>
  );
}

/*
 * EN-Hero-Bullets (Traeger: QiOneHeroBulletsPages) — outcome-first,
 * hedged wording von der Live-US-Seite.
 */
function UsHeroBullets() {
  return (
    <div data-qi-block="us-hero-bullets">
      <p className="mt-1">
        <strong>Engineered for your everyday well-being:</strong>
      </p>
      <p className="mt-1">
        <img
          width="17"
          height="17"
          className="inline-image"
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Person_ArmsUp_Icon_79524077-1a55-4f2e-9af6-d2a874f912f2.webp?v=1677002647"
          alt="Deeper sleep"
        />
        &nbsp; More restful nights
      </p>
      <p>
        <img
          width="17"
          height="17"
          className="inline-image"
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/WIFI_ICON_09426b68-adde-48d2-8fa4-2e1d5e43591d.webp?v=1676668860"
          alt="A calmer daily environment"
        />
        &nbsp; A calmer daily environment
      </p>
      <p>
        <img
          width="17"
          height="17"
          className="inline-image"
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Molecule_Icon_1930bc3d-20ef-4d76-a729-d9b6a19cc772.webp?v=1676669033"
          alt="More energy"
        />
        &nbsp; More energy and focus
      </p>
      <p className="mt-1 cellstudies-checkmark">
        <img
          width="17"
          height="17"
          className="inline-image"
          src="https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Green_Checkmark.webp?v=1676668861"
          alt="Effect confirmed in cell studies"
        />
        <strong>&nbsp; Effect confirmed in peer-reviewed cell studies</strong>
      </p>
    </div>
  );
}

/*
 * EN-Content unter der BuyBox — destillierte Produkt-Story (Mechanismus im
 * hedged Frame, Specs IMPERIAL, Studien, Garantie/Rueckgabe wie live US:
 * 14 Tage "no questions asked"). Kompakt bewusst: die Vorabversion beweist
 * Layout/Content/USD-Preis (1b P0), nicht die volle PDP-Dichte.
 */
function UsProductStory() {
  return (
    <div className="NormalSectionSize" data-section="us-product-story">
      <div className="text-center">
        <h2>What the QiOne® 2 Pro is — and what it is not</h2>
        <p style={{maxWidth: '760px', margin: '0.75rem auto', lineHeight: 1.8}}>
          The QiOne® 2 Pro is not an electronic device. Its core is the
          GitterChip™ — a precision gold-atom lattice engineered in Germany.
          Its specific atomic positioning creates a static field designed to
          support water molecules in transitioning toward an ordered,
          liquid-crystalline state. Water makes up a significant portion of
          your body — which is why we study the effect directly on human
          cells, in peer-reviewed publications.
        </p>
      </div>

      <div className="flex-container flex-row small--flex-column flex-align-start flex-justify-space-between g-50p mt-3" data-section="us-specs">
        <div>
          <h3>Built to be worn</h3>
          <ul className="us-trust-bullets">
            <li>Crafted from highly durable surgical-grade steel</li>
            <li>Withstands extreme heat and cold; resistant to chlorine, seawater, sweat and sunlight</li>
            <li>GitterChip™ gold-atom lattice, engineered and made in Germany</li>
            <li>No batteries, no charging, no maintenance — it simply works</li>
            <li>Cotton-ribbon necklace included; steel chains available in 5 sizes</li>
          </ul>
        </div>
        <div>
          <h3>Backed by research</h3>
          <ul className="us-trust-bullets">
            <li>4 peer-reviewed publications (2021–2024)</li>
            <li>75.0% reduction in cell strain caused by oxidative stress</li>
            <li>10-fold improvement of the cell barrier function (TEER)</li>
            <li>87.1% less cell damage under electromagnetic radiation</li>
          </ul>
          <p className="us-buybox-note">
            Results from controlled human cell studies; individual experiences
            vary. Not a medical device.
          </p>
        </div>
        <div>
          <h3>Zero-risk ordering</h3>
          <ul className="us-trust-bullets">
            <li>14-day “no questions asked” return policy</li>
            <li>Free, fully insured shipping from Germany</li>
            <li>All duties and taxes included — no surprises</li>
            <li>Ships within 2–5 days; customs usually clears in under a week</li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-3" data-section="us-story-cta">
        <a className="btn--primary m-center" href="#shopq-buybox">
          Get your QiOne® 2 Pro
        </a>
      </div>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
