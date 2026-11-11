/*
 * LOADER DER BF-DEAL-SEITEN DE (Elina EL-20261111-aff06215). Die Deal-Adresse
 * lädt das Basisprodukt (die Bundle-Produkte bleiben Entwurf/archiviert,
 * EL-20261111-9065b985) in der Apple-/Alpha-Fassung, wie Elina sie kennt, und
 * setzt Preis/Streichpreis aus bf-deals-daten.js. Antwort 200 unter der
 * Deal-Adresse selbst, damit Shopifys Weiterleitung (storefrontRedirect, nur
 * bei 404) nicht greift.
 */
import {ladeProduktSeite} from '~/lib/produkt-seite-laden.server';
import {PRODUCT_QUERY as QIONE_QUERY} from '~/lib/qioneProductQuery';
import {PRODUCT_QUERY as QIBRACELET_QUERY} from '~/components/product-pages/QiBraceletSeite';
import {PRODUCT_QUERY as QIHOME_QUERY} from '~/components/product-pages/QiHomeAirSeite';
import * as DATEN_8K from '~/components/product-pages/8kendiw34hd-alpha-daten';
import * as DATEN_PJDZ from '~/components/product-pages/pjdz538hgs0-alpha-daten';
import * as DATEN_QIBRACELET from '~/components/product-pages/qibracelet-alpha-daten';
import * as DATEN_QIHOME from '~/components/product-pages/qihome-air-alpha-daten';
import {bfDeal, bfDealMarktPasst, bfDealPreiseSetzen} from '~/components/black-friday-2026/bf-deals-daten';

/*
 * BILDER DER DEAL-SEITE: vorn steht das Deal-Bild der Galerie-Kachel (2000 px,
 * dieselbe Datei wie auf bf-deals-b). Produktfotos unter MIN_KANTE fallen auf
 * der Deal-Seite weg: gemessen 11.11.2026 (hb-formate, products-8kendiw34hd)
 * wird 2xQiOne2Pro.png (737 px) ab 600 px Breite hochskaliert und ist sichtbar
 * unscharf. Die normalen Produktseiten behalten ihre Bilder.
 */
const MIN_KANTE = 1600;

function dealBilder(product, seite) {
  const deal = bfDeal(seite.deal);
  const nodes = product?.images?.nodes;
  if (!deal?.bild || !Array.isArray(nodes)) return product;
  const scharf = nodes.filter((b) => !(Number(b?.width) > 0) || Number(b.width) >= MIN_KANTE);
  const vorn = {id: `bf-deal-bild-${deal.id}`, url: deal.bild, altText: deal.bildAlt, width: 2000, height: 2000};
  return {...product, images: {...product.images, nodes: [vorn, ...scharf]}};
}

const ALPHA = {
  '8kendiw34hd': {query: QIONE_QUERY, daten: DATEN_8K},
  pjdz538hgs0: {query: QIONE_QUERY, daten: DATEN_PJDZ},
  qibracelet: {query: QIBRACELET_QUERY, daten: DATEN_QIBRACELET},
  'qihome-air': {query: QIHOME_QUERY, daten: DATEN_QIHOME},
};

/**
 * Loaderdaten der Alpha-Fassung einer Deal-Seite. `seite` aus bfDealSeite().
 * Der Gerätevergleich entfällt (er nennt die normalen Preise).
 * null = Markt ohne Deal (nicht Euro): der Aufrufer nimmt den Weg wie vorher.
 */
export async function ladeBfDealAlpha(args, seite) {
  const a = ALPHA[seite.basis];
  if (!a) throw new Response(null, {status: 404});
  // eslint-disable-next-line no-unused-vars
  const {vergleichsPreise: _weg, ...daten} = await ladeProduktSeite(args, {
    handle: seite.basis,
    query: a.query,
    daten: a.daten,
    konfigurator: true,
  });
  if (!bfDealMarktPasst(daten.product)) return null;
  return {
    ...daten,
    product: bfDealPreiseSetzen(seite.art === 'alpha-angebot' ? dealBilder(daten.product, seite) : daten.product, seite),
    bfDealSeite: seite,
  };
}
