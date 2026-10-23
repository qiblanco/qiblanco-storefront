import {useState} from 'react';
import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox} from '~/components/product-pages/QiOneBuyBox';
import {QiMasterBenefitList} from '~/components/product-pages/QiMaster';
import QiAlphaShopB from '~/components/product-pages/QiAlphaShopB';
import {
  QA_AUFLAGE,
  QA_NAME,
  alpha,
  alphaWortlaut,
} from '~/components/campaign/QiAlphaLpB';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import qiMasterStyles from '~/styles/qi-master.css?url';
import wortlautStyles from '~/styles/qi-master-wortlaut.css?url';
import kaufZuerstStyles from '~/styles/qb-pdp-kauf-zuerst.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import qiAlphaBStyles from '~/styles/qi-alpha-b.css?url';
import {kaufZuerstAttribute} from '~/components/product-pages/pdpKaufZuerst';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {fremdHtmlMitKopfsymbolen} from '~/lib/qi-master-kopfsymbole';
import {QiMasterAddons} from '~/components/product-pages/QiMasterAddons';
import {
  QM_ADDONS_QUERY,
  ADDON_WAEHRUNGEN,
  KETTE_VORWAHL,
  addonLinien,
} from '~/lib/qi-master-addons';

/*
 * /products/qi-alpha-b — Shop B zum Qi Alpha (Vorschau, Grossjob 20261023-
 * GROSSJOB-qi-alpha-landingpage-produktseite-finalisieren-lp-simulation, s04).
 *
 * DERSELBE KAUFWEG WIE SHOP A (products.qi-master.jsx): geteilte QiOneBuyBox,
 * dieselbe PRODUCT_QUERY, dieselben Add-ons (Wunschnummer, Goldkette) mit
 * derselben Warenkorb-Bindung, dieselbe Kaufleiste mobil. Kein zweites
 * Produkt, keine Kopie: geladen wird das echte DACH-Produkt, handle-tolerant
 * (qi-alpha, sonst qi-master), weil der Umbenennungs-Grossjob den Handle
 * wechselt. KEIN redirectIfHandleIsLocalized: er leitete diese Adresse auf
 * den Produkt-Handle um, und B wäre nicht mehr erreichbar.
 *
 * TRACKING: kein Pixel-Code und kein neuer Schlüssel. ViewContent kommt aus
 * der geteilten Kaufbox, AddToCart als Cart-Ereignis, die Identitäts-Keys
 * laufen über app/lib/checkout-tracking.js wie auf A.
 *
 * AUFFINDBARKEIT: meta robots + X-Robots-Tag, KEIN canonical (wie
 * /pages/qione-2-pro-b), dazu die zentrale Pfadliste app/lib/vorschau-noindex.js.
 *
 * BILDER: die Kaufbox zeigt product.images, also die Shopify-Produktmedien
 * (heute 0, Segment s03 lädt die finalen nach). Ohne Medien bleibt die
 * Galerie leer, es erscheint kein Bild eines anderen Produkts.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: qiMasterStyles},
    {rel: 'stylesheet', href: wortlautStyles},
    {rel: 'stylesheet', href: kaufZuerstStyles},
    {rel: 'stylesheet', href: kaufleisteStyles},
    {rel: 'stylesheet', href: qiAlphaBStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Alpha | Qi Blanco'},
  {
    name: 'description',
    content:
      'Qi Alpha: Naturdiamant am Gitterchip™, eigene Seriennummer, erste Edition mit 111 Stück. Versand ab Mitte Januar 2027.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

const QA_HANDLES = ['qi-alpha', 'qi-master'];
// Rollen der Wortlaut-Absätze ohne den entfallenen Terminsatz (Gestaltung
// aus qi-master-wortlaut.css, wie auf A).
const WORTLAUT_ROLLE = ['grund', 'herkunft', 'versand'];

/** @param {LoaderFunctionArgs} args */
export async function loader({context, request}) {
  const {storefront} = context;
  const selectedOptions = getSelectedProductOptions(request);
  const [a, b, addonDaten] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle: QA_HANDLES[0], selectedOptions},
    }),
    storefront.query(PRODUCT_QUERY, {
      variables: {handle: QA_HANDLES[1], selectedOptions},
    }),
    // Fail-soft wie auf A: fehlt ein Add-on, entfällt nur der Bereich.
    storefront.query(QM_ADDONS_QUERY).catch(() => null),
  ]);
  const product = a?.product?.id ? a.product : b?.product;
  if (!product?.id) throw new Response(null, {status: 404});

  return {
    product,
    addons: {
      wunschnummer: addonDaten?.wunschnummer ?? null,
      kette: addonDaten?.kette ?? null,
    },
  };
}

export default function QiAlphaShopBRoute() {
  /** @type {LoaderReturnData} */
  const {product, addons} = useLoaderData();
  const qmVariante = product.selectedOrFirstAvailableVariant;
  const addonsSichtbar =
    qmVariante?.availableForSale &&
    ADDON_WAEHRUNGEN.includes(qmVariante?.price?.currencyCode)
      ? addons
      : null;
  const [auswahl, setAuswahl] = useState(() => ({
    wunschnummer: null,
    ketteAn: false,
    kette:
      addons?.kette?.variants?.nodes?.find((v) => v.title === KETTE_VORWAHL)?.id ??
      addons?.kette?.variants?.nodes?.[0]?.id ??
      null,
  }));
  const zusatzLinien = addonsSichtbar
    ? addonLinien({
        wunschnummer: addonsSichtbar.wunschnummer?.variants?.nodes?.find(
          (v) => v.id === auswahl.wunschnummer && v.availableForSale,
        ),
        kette: auswahl.ketteAn
          ? addonsSichtbar.kette?.variants?.nodes?.find((v) => v.id === auswahl.kette)
          : null,
      })
    : [];
  // Nur die Anzeige trägt den neuen Namen; Kaufweg und Ereignisse laufen über
  // dasselbe Produkt (id, Varianten) wie auf A.
  const anzeige = {...product, title: QA_NAME};

  return (
    <div className="qm-pdp qa-b" {...kaufZuerstAttribute()}>
      <QiOneBuyBox
        product={anzeige}
        ankerId="qm-buybox"
        kaufleiste
        gewaehrleistungsHinweis={false}
        zusatzLinien={zusatzLinien}
        socialProof={<p className="qa-auge qa-auge--kaufbox">Erste Edition · {QA_AUFLAGE}</p>}
        unterKaufknopf={
          <>
            <QiMasterAddons
              addons={addonsSichtbar}
              qmPreis={qmVariante?.price}
              auswahl={auswahl}
              setAuswahl={setAuswahl}
            />
            <p className="qa-shop__beratung">
              <a href="/pages/produktberatung">Persönlich beraten lassen</a>
            </p>
          </>
        }
        description={
          <div
            className="ProductDescription"
            dangerouslySetInnerHTML={{
              __html: alpha(
                fremdHtmlMitKopfsymbolen(
                  fremdHtmlMitBildAuszeichnung(product.descriptionHtml),
                ),
              ),
            }}
          />
        }
        priceLabel={
          <>
            <p className="qm-steuerhinweis">inkl. 19 % MwSt.</p>
            <section
              className="qm-wortlaut qm-wortlaut--kompakt"
              aria-label="Preis, Auflage und Versand des Qi Alpha"
            >
              {alphaWortlaut().map((text, i) => (
                <p
                  className={`qm-wortlaut__absatz qm-wortlaut__absatz--${WORTLAUT_ROLLE[i] ?? 'grund'}`}
                  key={text.slice(0, 32)}
                >
                  {text}
                </p>
              ))}
            </section>
          </>
        }
        benefitList={
          <QiMasterBenefitList zusatzPunkt={<EuGewaehrleistungsListenpunkt />} />
        }
      />
      <QiAlphaShopB />
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
