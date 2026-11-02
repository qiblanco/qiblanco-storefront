import {useLoaderData} from 'react-router';
import {
  qiHomeAirSeiteLinks,
  PRODUCT_QUERY,
} from '~/components/product-pages/QiHomeAirSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as DATEN from '~/components/product-pages/qihome-air-alpha-daten-b';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitRate,
  AlphaKachelBlock,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';

/*
 * B-FASSUNG DER APPLE-SEITE /products/qihome-air (Christian Zx 29.10.2026; Grossjob
 * 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s12). Der Oberteil
 * ist AlphaVorlage wie in A, nur `slots.reihe` steht anders: Raum zuerst.
 * /products/qihome-air-b bleibt C, das alte Design. Noindex, Kanonische auf A, keine Weiche.
 */
export function links() {
  return [...qiHomeAirSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  ...bMeta(
    produktMeta({
      produkt: data?.product,
      marktLand: data?.marktLand,
      pfad: '/products/qihome-air',
      titel: `${data?.product?.title ?? ''} | ${MARKE}`,
      bildUrl:
        data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
        data?.product?.images?.nodes?.[0]?.url,
    }),
  ),
  {name: 'robots', content: 'noindex,nofollow'},
];

export const headers = () => B_HEADERS;

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  return ladeProduktSeite(args, {
    handle: 'qihome-air',
    query: PRODUCT_QUERY,
    daten: DATEN,
    konfigurator: true,
  });
}

export default function ProductVariante() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise, ketten} = useLoaderData();
  const bilder = product?.images?.nodes ?? [];
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <AlphaVorlage
        product={product}
        daten={DATEN}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          reihe: [
            {name: 'einsatz', inhalt: <AlphaKachelBlock daten={DATEN.EINSATZ} />},
            'fakten',
            {name: 'raum', inhalt: <AlphaWissen kapitel={DATEN.RAUM.kapitel} bilder={bilder} />},
            {
              name: 'wissen',
              inhalt: (
                <AlphaWissen
                  kapitel={DATEN.BELEG.kapitel}
                  studien={DATEN.BELEG.studien}
                  bilder={bilder}
                />
              ),
            },
            'risikofrei',
            {name: 'stimmen', inhalt: <AlphaStimmen daten={DATEN.STIMMEN_GOOGLE} />},
            {
              name: 'vergleich',
              inhalt: (
                <AlphaVergleich
                  handle="qihome-air"
                  daten={DATEN.VERGLEICH}
                  preise={vergleichsPreise}
                  eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
                />
              ),
            },
            {name: 'faq', inhalt: <AlphaFaqMitRate daten={DATEN.FAQ} product={product} />},
          ],
        }}
      />
    </>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
