import {useLoaderData} from 'react-router';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {qiOne2ProSeiteLinks} from '~/components/product-pages/QiOne2ProSeite';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {bMeta, B_HEADERS} from '~/lib/produkt-seite-b';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as DATEN from '~/components/product-pages/qione-2-pro-alpha-daten-b';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitPreis,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWeltrekord,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';

/*
 * B-FASSUNG DER APPLE-SEITE /products/qione-2-pro (Christian Zx 29.10.2026:
 * „die B-Seite läuft dann einfach ganz normal weiter, dass man die Alpha-Seite
 * eventuell editiert … in dem unteren Bereich“; Grossjob 20261027-GROSSJOB-apple-
 * konfigurator-qione-qihome-qibracelet-ab, s12). Der Oberteil ist AlphaVorlage wie
 * in A, nur `slots.reihe` steht anders: kurz, Video zuerst. /products/qione-2-pro-b
 * bleibt C, das alte Design. Noindex, Kanonische auf A, keine Weiche.
 */
export function links() {
  return [...qiOne2ProSeiteLinks(), {rel: 'stylesheet', href: kaufleisteStyles}];
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => [
  ...bMeta(
    produktMeta({
      produkt: data?.product,
      marktLand: data?.marktLand,
      pfad: '/products/qione-2-pro',
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
    handle: 'qione-2-pro',
    query: PRODUCT_QUERY,
    daten: DATEN,
    konfigurator: true,
  });
}

export default function ProductVariante() {
  /** @type {LoaderReturnData} */
  const {product, vergleichsPreise, ketten} = useLoaderData();
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={alphaQiOneStyles} />
      <AlphaVorlage
        product={product}
        daten={DATEN}
        ketten={ketten}
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          reihe: [
            'risikofrei',
            {
              name: 'video',
              inhalt: (
                <>
                  <AlphaWissen kapitel={[DATEN.VIDEO_KAPITEL]} />
                  <GitterchipMoleculesScrub
                    dataSection="konfig-b-gitterchip-video"
                    heightVhDesktop={200}
                    heightVhMobile={200}
                  />
                </>
              ),
            },
            {
              name: 'stimmen',
              inhalt: (
                <>
                  <AlphaWeltrekord daten={DATEN.WELTREKORD} />
                  <AlphaStimmen daten={DATEN.STIMMEN_GOOGLE} />
                </>
              ),
            },
            {
              // Ziel des Kopf-Links (s03 kopf.vergleich_link) und Kundenfrage
              // Nummer eins (24 von 106, s02): der Vergleich bleibt auch in „kurz“.
              name: 'vergleich',
              inhalt: (
                <div id="geraetevergleich">
                  <AlphaVergleich
                    handle="qione-2-pro"
                    daten={DATEN.VERGLEICH}
                    preise={vergleichsPreise}
                    eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
                  />
                </div>
              ),
            },
            {
              name: 'wissen',
              inhalt: <AlphaWissen kapitel={DATEN.BEWEIS.kapitel} studien={DATEN.BEWEIS.studien} />,
            },
            {name: 'faq', inhalt: <AlphaFaqMitPreis daten={DATEN.FAQ} product={product} />},
          ],
        }}
      />
    </>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
