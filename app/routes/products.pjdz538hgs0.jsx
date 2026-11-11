import {useLoaderData} from 'react-router';
import {MARKE} from '~/lib/produkt-seo';
import tenYearsDealStyles from '~/styles/ten-years-deal-page.css?url';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {
  konfiguratorAn,
  ladeProduktSeite,
} from '~/lib/produkt-seite-laden.server';
import {
  ladeHeutigeSeite,
  StandardProduct,
} from '~/components/product-pages/AngebotHeutigeSeite';
import {AngebotKonfigurator} from '~/components/product-pages/AngebotKonfigurator';
import {
  bfDeal,
  bfDealSeite,
} from '~/components/black-friday-2026/bf-deals-daten';
import {ladeBfDealAlpha} from '~/components/black-friday-2026/bf-deal-seite.server';
import {BfDealAlpha} from '~/components/black-friday-2026/BfDealSeite';
import * as ALPHA_DATEN from '~/components/product-pages/pjdz538hgs0-alpha-daten';

/*
 * ANGEBOT /products/pjdz538hgs0 (QiOne® 2 Pro + Necklace), Ziel verschickter Angebotslinks.
 * Eigene Route seit s13-r3 (Grossjob 20261027-GROSSJOB-apple-konfigurator-
 * qione-qihome-qibracelet-ab, Christian Zx 29.10.2026). Ohne Schalter
 * KONFIGURATOR_PJDZ538HGS0 (Default aus) rendert sie die heutige Seite der
 * Sammelroute products.$handle.jsx (Kopie in AngebotHeutigeSeite.jsx), mit
 * Schalter das Apple-Gerüst (AngebotKonfigurator, Daten pjdz538hgs0-alpha-daten.js).
 * Beide Fassungen bleiben noindex (lib/seo.js NICHT_INDEXIERBARE_PRODUKTE).
 * Rückweg: Schalter aus, dann die heutige Seite.
 *
 * BF-DEAL-FASSUNG (Elina EL-20261111-aff06215, bis 30.11.2026 23:59 Berlin):
 * im Euro-Markt zeigt diese Adresse dieselbe Deal-Fassung wie
 * /products/734husd8hh (BF-Preis, Warenkorb-Link „Jetzt kaufen“, Deal-Galerie).
 * Die Deal-Daten stehen allein in bf-deals-daten.js (Eintrag 734husd8hh);
 * diese Route leiht sie nur aus. Nach dem Ende oder in einem anderen Markt
 * fällt sie von selbst in den Weg darunter zurück.
 */
const BF_DEAL_WIE = '734husd8hh';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsDealStyles}];
}

/** @type {MetaFunction<typeof loader>} */
export const meta = ({data}) => {
  if (data?.bfDealSeite) {
    const name =
      data.bfDealSeite.name ?? bfDeal(data.bfDealSeite.deal)?.name ?? '';
    return [
      {title: `Black Friday: ${name} | ${MARKE}`},
      {name: 'robots', content: 'noindex,nofollow'},
    ];
  }
  return metaNormal({data});
};

const metaNormal = ({data}) => [
  {title: `${data?.product?.title ?? ''} | ${MARKE}`},
  // Statisches Literal (gleicher Wert wie lib/seo.js): die Gates lesen es
  // (design-zufahrt, Link-Ziel-Ausnahme in test/produkt-seo.test.mjs).
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const dealSeite = bfDealSeite(BF_DEAL_WIE);
  if (dealSeite) {
    // null = Markt ohne Deal (nicht Euro): dann der Weg wie vorher.
    const deal = await ladeBfDealAlpha(args, {
      ...dealSeite,
      handle: 'pjdz538hgs0',
    });
    if (deal) return deal;
  }
  if (konfiguratorAn(args.context.env, 'pjdz538hgs0')) {
    return ladeProduktSeite(args, {
      handle: 'pjdz538hgs0',
      query: PRODUCT_QUERY,
      daten: ALPHA_DATEN,
      konfigurator: true,
    });
  }
  return ladeHeutigeSeite(args, 'pjdz538hgs0');
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {
    product,
    konfigurator,
    ketten,
    bfDealSeite: dealSeite,
  } = useLoaderData();
  if (dealSeite) {
    return <BfDealAlpha seite={dealSeite} product={product} ketten={ketten} />;
  }
  if (konfigurator) {
    return (
      <AngebotKonfigurator
        product={product}
        ketten={ketten}
        daten={ALPHA_DATEN}
      />
    );
  }
  return <StandardProduct product={product} />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
