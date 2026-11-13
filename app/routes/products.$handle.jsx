import {useRef} from 'react';
import {Link, useLoaderData} from 'react-router';
import {redirect} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ANGEBOT_HINWEIS, istBegrenztesAngebot} from '~/lib/angebot-limit';
import {ProductImageList} from '~/components/ProductImageList';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {leiteUm, zusammenlegungFuer} from '~/lib/zusammenlegungen';
import {TenYearsDealPage} from '~/components/campaign/TenYearsDealPage';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {
  getTenYearsDealByHandle,
  TEN_YEARS_SALE_RETIRED,
} from '~/data/ten-years-deals';
import tenYearsDealStyles from '~/styles/ten-years-deal-page.css?url';

import {
  absoluteCanonical,
  canonicalLink,
  istNichtIndexierbaresProdukt,
  noindexMeta,
} from '~/lib/seo';
import {istVorlageOhneIndexwert} from '~/lib/vorlagen-ohne-indexwert';
import {brotkrumeSchema, produktSchema} from '~/lib/produkt-schema';
import {MARKE, produktBeschreibung} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';
import {fremdHtmlMitBildAuszeichnung} from '~/lib/fremd-html-bilder';
import {appleSeiteLaden, appleSeiteFuerPfad} from '~/lib/apple-seiten';
import {AppleSeite} from '~/components/apple-seite/AppleSeite';
import {AppleAnna} from '~/components/apple-seite/AppleSektionen';
import produktAppleStyles from '~/styles/produkt-apple.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {Kaufleiste} from '~/components/reusables/Kaufleiste';
import {
  bfDeal,
  bfDealBildSetzen,
  bfDealMarktPasst,
  bfDealPreiseSetzen,
  bfDealSeite,
  bfKakaoSet,
  bfKakaoUmleitung,
} from '~/components/black-friday-2026/bf-deals-daten';
import {ladeBfDealAlpha} from '~/components/black-friday-2026/bf-deal-seite.server';
import {BfDealAlpha} from '~/components/black-friday-2026/BfDealSeite';
import {BfDealRahmen, DealGalerie} from '~/components/black-friday-2026/DealGalerie';
import {BfKakaoDeal} from '~/components/black-friday-2026/BfKakaoDeal';
import {BfKakaoAnhang} from '~/components/black-friday-2026/BfDealAnhang';

export function links() {
  return [{rel: 'stylesheet', href: tenYearsDealStyles}];
}
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  // BF-Deal-Seiten (Elina EL-20261111-aff06215): noindex, keine Kanonische,
  // keine Produkt-Auszeichnung mit dem Shopify-Preis des Basisprodukts.
  if (data?.bfDealSeite) {
    const name = data.bfDealSeite.name ?? bfDeal(data.bfDealSeite.deal)?.name ?? '';
    return [
      {title: `Black Friday: ${name} | ${MARKE}`},
      {name: 'robots', content: 'noindex,nofollow'},
    ];
  }
  if (data?.campaignDeal) {
    return [
      {title: `${data.campaignDeal.displayTitle} - 10 Jahre Jubiläums Sale`},
      {name: 'robots', content: 'noindex,nofollow'},
    ];
  }

  // Test-, Dubletten- und reine Link-Ziel-Handles aus dem Index nehmen.
  // Die Liste steht in ~/lib/seo, weil die Sitemap-Route sie ebenfalls liest:
  // bis 2026-08-15 lagen hier und dort ZWEI Listen mit gleichem Inhalt, und
  // genau vor deren Auseinanderdriften warnt der Kommentar an der Liste.
  // Dazu die Vorlagen ohne eigenen Indexwert (GEO M3, 2026-10-10): kaufbar,
  // aber nicht im Index. Ihre Liste steht in ~/lib/vorlagen-ohne-indexwert, die
  // Sitemap liest dieselbe. Kein canonical neben dem noindex.
  if (
    istNichtIndexierbaresProdukt(data?.product?.handle) ||
    istVorlageOhneIndexwert('products', data?.product?.handle)
  ) {
    return [
      {title: `${data.product.title ?? ''} | ${MARKE}`},
      noindexMeta(),
    ];
  }

  const titel = `${data?.product.title ?? ''} | ${MARKE}`;
  const url = absoluteCanonical(`/products/${data?.product.handle}`);
  const descriptoren = [
    {title: titel},
    canonicalLink(`/products/${data?.product.handle}`),
    // Open-Graph-Satz analog produktMeta() (app/lib/produkt-seo.js), das die
    // sechs eigenen Produktrouten bedient. Diese Sammelroute hatte bis
    // 2026-08-15 zwar og:description, aber weder Titel, URL noch Bild — eine
    // halb gebaute Karte: beim Teilen entschied jedes Netzwerk selbst, was
    // erscheint. Gemessen trugen 7 der 13 DACH-Produktseiten kein og:image,
    // und es waren genau die, die durch diese Route laufen.
    {property: 'og:type', content: 'product'},
    {property: 'og:site_name', content: MARKE},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: titel},
    {property: 'og:url', content: url},
  ];

  // Bildquelle in derselben Reihenfolge wie die eigenen Produktrouten: erst
  // das Bild der gewählten/ersten verfügbaren Variante, sonst das erste
  // Produktbild. Fehlt beides, entsteht bewusst KEIN leerer og:image-Knoten.
  const bildUrl =
    data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
    data?.product?.images?.nodes?.[0]?.url;
  if (bildUrl) {
    descriptoren.push({property: 'og:image', content: bildUrl});
    // Twitter-Karte in derselben Bedingung wie das og:image und in derselben
    // Form wie in produktMeta() (app/lib/produkt-seo.js) — Begründung dort.
    // Die Sammelroute muss sie eigenständig setzen: sie baut ihre
    // Descriptor-Liste selbst und läuft nicht durch produktMeta().
    descriptoren.push({name: 'twitter:card', content: 'summary_large_image'});
  }

  // Snippet-Vorgabe. Gemessen am 2026-08-15 trug KEINE der 17 DACH-Produkt-
  // URLs eine meta description — Google reimt sich das Snippet dann aus dem
  // Seitentext zusammen, ausgerechnet auf den Umsatzseiten. Der Text kommt
  // aus dem in Shopify gepflegten Beschreibungsfeld: dieselbe Aussage, die
  // im Backend steht, ohne eine Wirkzusage dazuzuerfinden.
  // DRITTE STUFE (2026-09-06): die vier Bundle-Handles führen in Shopify
  // WEDER `seo.description` NOCH einen `description`-Body — gegen die
  // Storefront-API gemessen, nicht vermutet. Für sie greift die kuratierte
  // Auffanglinie; sie beschreibt nur, WAS im Bundle ist und WOHER der Kakao
  // kommt (beides an anderer Stelle des Shops belegt), ohne Wirkzusage.
  // Das gepflegte Shopify-Feld schlägt sie unverändert.
  const beschreibung = kuerzeBeschreibung(
    data?.product?.seo?.description ||
      data?.product?.description ||
      produktBeschreibung(`/products/${data?.product?.handle}`),
  );
  if (beschreibung) {
    descriptoren.push({name: 'description', content: beschreibung});
    descriptoren.push({property: 'og:description', content: beschreibung});
  }

  // Produkt-Auszeichnung. Gemessen am 2026-08-15: 0 von 17 DACH-Produktseiten
  // trugen Product-Schema, während alle 6 US-Produktseiten es tragen. Ohne
  // sie kann Google Preis und Verfügbarkeit nicht als Rich Result zeigen.
  const schema = produktSchema(data?.product, data?.marktLand);
  if (schema) descriptoren.push({'script:ld+json': schema});

  // Brotkrume (PR-#100-Restposten, 2026-09-05). Eigener Knoten neben dem
  // Product-Knoten, und bewusst NICHT an `schema` gekoppelt: die fünf
  // Handles aus OHNE_PREIS_NACHWEIS laufen alle durch DIESE Route und
  // bekommen kein Product-JSON-LD — eine Brotkrume aber schon, weil sie über
  // den Preis nichts aussagt. Begründung an brotkrumeSchema().
  //
  // Die noindex-Handles sind hier nicht mehr im Rennen: der Zweig
  // `istNichtIndexierbaresProdukt` oben kehrt vor dieser Stelle um.
  const brotkrume = brotkrumeSchema(data?.product);
  if (brotkrume) descriptoren.push({'script:ld+json': brotkrume});

  return descriptoren;
};

/**
 * Shopify-`description` (Klartext, oft mehrere Absätze) auf Snippet-Länge
 * bringen. Google schneidet Snippets bei rund 160 Zeichen ab; wir schneiden
 * an der letzten Wortgrenze davor, damit kein Wort zerrissen wird. Fehlt die
 * Beschreibung, kommt `null` zurück — dann bleibt es beim bisherigen
 * Zustand statt bei einem leeren Tag.
 * @param {string|undefined} text
 * @returns {string|null}
 */
function kuerzeBeschreibung(text) {
  const roh = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!roh) return null;
  if (roh.length <= 160) return roh;
  const schnitt = roh.slice(0, 160);
  const grenze = schnitt.lastIndexOf(' ');
  return `${(grenze > 80 ? schnitt.slice(0, grenze) : schnitt).trim()}…`;
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // ZUSAMMENGELEGTE PRODUKTSEITEN (Job 20261007-seo-zusammenlegung-duenne-
  // seiten-301-umsetzen): ein Produkt-Handle mit Eintrag in
  // app/lib/zusammenlegungen.js zieht per 301 auf sein Ziel. Vor der
  // Produkt-Abfrage, weil ein Vorgänger im US-Markt oft nicht veröffentlicht
  // ist und die Route sonst 404 liefert. /products/qione-1 stand hier bis
  // 05.11.2026 (Rückweg H-b61a593538) und antwortet wieder selbst; die Liste
  // trägt heute kein Produkt.
  const alterPfad = `/products/${args.params.handle}`;
  if (zusammenlegungFuer(alterPfad)) leiteUm(args.request, alterPfad);

  // BF-DEAL-SEITEN DE (Elina EL-20261111-aff06215, bis 30.11.2026 23:59 Berlin):
  // die Deal-Adresse antwortet selbst mit 200 und rendert die Seite des
  // Basisprodukts mit BF-Preis, Warenkorb-Link und Deal-Galerie. Vor der
  // Produkt-Query, weil das Bundle-Produkt hinter dem Handle Entwurf bzw.
  // archiviert ist (404 -> Shopify-Weiterleitung auf eine falsche Seite).
  // Danach fällt der Handle wieder in den Weg darunter (404/Weiterleitung).
  // ALTE KAKAO-ADRESSEN (Elina EL-20261111-fa47cfd9, bis 30.11.2026 23:59 Berlin):
  // 302 auf die eine Kakao-Deal-Seite mit passender Set-Vorwahl, Parameter
  // bleiben. Die reinen Deal-Adressen sofort; die normalen Set-Seiten
  // (bundle-2x-awake, mengenrabatt-2x) erst nach der Produkt-Query, nur im
  // Euro-Markt (unten).
  const kakaoUmleitung = bfKakaoUmleitung(args.params.handle, args.request.url);
  if (kakaoUmleitung && !kakaoUmleitung.nurEuro) {
    throw redirect(kakaoUmleitung.pfad, 302);
  }

  const dealSeite = bfDealSeite(args.params.handle);
  // Nur im Euro-Markt (Deutsch-Shop); sonst 404 wie vor dem Deal.
  if (dealSeite?.art?.startsWith('alpha')) {
    const deal = await ladeBfDealAlpha(args, dealSeite);
    if (!deal) throw new Response(null, {status: 404});
    return {...deal, bfFunnel: true};
  }
  // bfFunnel: jede BF-Deal-Seite ist eine geschlossene Funnel-Seite wie Qi
  // Alpha, ohne Menü und Fuß (Elina EL-20261112-5f5fab2e; Weiche in
  // PageLayout.jsx, Leser black-friday-2026/bf-funnel.js). Nur hier, also nur
  // im Aktionszeitraum und Euro-Markt; jede andere Produktseite bleibt gleich.
  if (dealSeite?.art === 'kakao-sets') {
    return {...(await ladeBfDealKakao(args, dealSeite)), bfFunnel: true};
  }
  if (dealSeite) return {...(await ladeBfDealStandard(args, dealSeite)), bfFunnel: true};

  const campaignDeal = getTenYearsDealByHandle(args.params.handle);

  if (campaignDeal) {
    /*
     * STILLGELEGTER JUBILÄUMS-SALE (Schalter: app/data/ten-years-deals.js).
     * Diese Deal-Handles rendern sonst die Aktionsseite mit den Sale-Preisen.
     * Stillgelegt liefern sie 404 — BEWUSST statt eines Durchfallens in die
     * normale Produkt-Query: die Handles tragen Sale-Titel („Sale: …",
     * „Black Friday Sale: …"), ein Durchfallen würde die Aktion also weiter
     * bewerben statt sie zu beenden. Der 301 auf die ebenfalls stillgelegte
     * Campaign-PDP entfällt damit gewollt mit. Das 404 erlaubt zugleich, dass
     * eine in Shopify gepflegte Weiterleitung greift (storefrontRedirect).
     */
    if (TEN_YEARS_SALE_RETIRED) {
      throw new Response(null, {status: 404});
    }
    // Deal-Handles kurzschließen die Produkt-Query -> nie 404 -> der
    // Shopify-URL-Redirect (storefrontRedirect, greift NUR bei 404) kann
    // für Alt-Handles NIE feuern. Trägt der Deal ein redirectTo, ist die
    // Alt-URL dauerhaft umgezogen: 301 mit Query-Erhalt (fbclid/gclid/UTM
    // überleben die Weiterleitung; Params aus redirectTo gewinnen).
    if (campaignDeal.redirectTo) {
      const incoming = new URL(args.request.url);
      const target = new URL(campaignDeal.redirectTo, incoming.origin);
      incoming.searchParams.forEach((value, key) => {
        if (!target.searchParams.has(key)) {
          target.searchParams.set(key, value);
        }
      });
      throw redirect(target.pathname + target.search, 301);
    }
    return {campaignDeal, product: null};
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);
  if (kakaoUmleitung?.nurEuro && bfDealMarktPasst(criticalData.product)) {
    throw redirect(kakaoUmleitung.pfad, 302);
  }

  // Apple-Fassung nur für Produkte mit eigener Zeile in app/lib/apple-seiten.js.
  return {
    ...deferredData,
    ...criticalData,
    appleSeite: appleSeiteLaden(args.context, appleSeiteFuerPfad(alterPfad)),
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      // PREIS FRISCH, nicht streichen: ohne `cache` nimmt Hydrogen CacheDefault
      // (SWR 24 h), dann zeigt die Seite nach einer Preis- oder Kursaenderung bis
      // zu 24 h den alten Betrag (PL 13.10.: Seite 4.861 zl, Kasse 4.847 zl).
      // Grossjob 20261004-GROSSJOB-preisanzeige-netto-brutto-rundung-alle-shops-waehrungen s09;
      // Probe homepage-bauer/pruefungen/probe_preisabfrage_cache_kurz.py.
      cache: storefront.CacheShort(),
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    // Markt-Land in die Routendaten, weil `meta()` keinen Kontext hat: die
    // Produkt-Auszeichnung muss denselben Steuersatz rechnen wie die Seite
    // darunter (AT 20 statt 19 %, Job 20260913-at-paketkarte-rechnet-19-
    // prozent-kasse-nimmt-20-prio8).
    marktLand: storefront.i18n.country,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData() {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}
/**
function RenderProductPage({product}) {
  if (product.title === "QiOne® 2 Pro") {
    return (
      <QiOne2Pro />
    )
  }
  return (
    <></>
  )
} */

/**
 * BF-Deal-Seite in der Standard-Fassung (Kakao): Daten des Basisprodukts mit
 * BF-Preis und UVP aus der Datenstelle. Ausserhalb des Loaders, damit dessen
 * Reihenfolge (10-Jahre-Zaun vor Redirect und Produkt-Query) unberuehrt bleibt.
 * @param {LoaderFunctionArgs} args
 */
async function ladeBfDealStandard(args, dealSeite) {
  const basisDaten = await loadCriticalData({
    ...args,
    params: {...args.params, handle: dealSeite.basis},
  });
  if (!bfDealMarktPasst(basisDaten.product)) throw new Response(null, {status: 404});
  return {
    ...basisDaten,
    product: bfDealPreiseSetzen(bfDealBildSetzen(basisDaten.product, dealSeite), dealSeite),
    bfDealSeite: dealSeite,
  };
}

/**
 * Kakao-Deal-Seite mit Set-Wahl (Elina EL-20261111-fa47cfd9): ?set= wählt das
 * Set serverseitig vor, damit Bild und Warenkorb-Link schon im HTML stimmen.
 * Daten und Euro-Prüfung über das Basisprodukt wie die Standard-Fassung.
 * @param {LoaderFunctionArgs} args
 */
async function ladeBfDealKakao(args, dealSeite) {
  const set = bfKakaoSet(new URL(args.request.url).searchParams.get('set'));
  return ladeBfDealStandard(args, {
    ...dealSeite,
    set: set.id,
    link: set.link,
    bild: set.bild,
    bildAlt: set.bildAlt,
  });
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, campaignDeal, appleSeite, bfDealSeite: dealSeite, ketten} = useLoaderData();

  if (dealSeite?.art?.startsWith('alpha')) {
    return <BfDealAlpha seite={dealSeite} product={product} ketten={ketten} />;
  }
  if (dealSeite?.art === 'kakao-sets') {
    return (
      <BfDealRahmen seite={dealSeite}>
        <link rel="stylesheet" href={kaufleisteStyles} />
        <BfKakaoDeal setId={dealSeite.set} />
        {/* Elina EL-20261112-452cdd56: Schluss-Banner und Fragen unter der Kaufbox (Gegenüberstellung: EL-20261112-cb3c35ca). */}
        <BfKakaoAnhang />
      </BfDealRahmen>
    );
  }
  if (dealSeite) {
    return (
      <BfDealRahmen seite={dealSeite}>
        <link rel="stylesheet" href={kaufleisteStyles} />
        <StandardProduct product={product} kaufleiste />
      </BfDealRahmen>
    );
  }

  if (campaignDeal) {
    return <TenYearsDealPage deal={campaignDeal} />;
  }

  if (!appleSeite?.an || !appleSeite.seite) return <StandardProduct product={product} />;
  return (
    <>
      <link rel="stylesheet" href={produktAppleStyles} />
      <link rel="stylesheet" href={kaufleisteStyles} />
      <AppleSeite seite={appleSeite.seite}>
        {/* Nur die Apple-Fassung bekommt die klebende Kaufleiste (Grossjob
            20261029 alle-shop-seiten-apple-niveau, s12-r10): am Handy-Seitenende
            steht sonst kein aktiver Kaufknopf (Echtgeraet-Tor). Die Standard-PDP
            ohne Schalter bleibt ohne Leiste und ohne ihr Stylesheet. */}
        <StandardProduct product={product} kaufleiste />
        <AppleAnna />
      </AppleSeite>
    </>
  );
}

/**
 * NACHFOLGER AUSVERKAUFTER PRODUKTE (Job 20261105-qione1-ausverkauft-weg-zum-
 * nachfolger). /products/qione-1 antwortet seit dem Rückweg vom 05.11.2026
 * (PR #1365) wieder selbst, ist aber nicht kaufbar: der Knopf zeigt
 * „Ausverkauft“, und im Inhalt führte kein Link zum Nachfolger. Wer dort
 * landet, stand in einer Sackgasse. Der Hinweis steht deshalb direkt unter
 * dem Knopf, nur solange die gewählte Variante ausverkauft ist, und nur für
 * Produkte mit Eintrag in dieser Liste. Wird der Vorgänger wieder kaufbar,
 * verschwindet er von selbst.
 *
 * Eine Liste im Code statt eines Shopify-Metafelds: es gibt heute genau ein
 * Paar, und die Seite braucht keinen zweiten Abfrageweg. Kommt ein zweites
 * Paar dazu, eine Zeile ergänzen.
 */
const NACHFOLGER = {
  'qione-1': {handle: 'qione-2-pro', name: 'QiOne® 2 Pro'},
};

function NachfolgerHinweis({handle, ausverkauft}) {
  const nachfolger = NACHFOLGER[handle];
  if (!ausverkauft || !nachfolger) return null;
  return (
    <p className="mt-2" data-nachfolger={nachfolger.handle}>
      Es gibt einen Nachfolger:{' '}
      {/* Farbe und Unterstreichung wie der Gewährleistungs-Link darunter
          (eu-gewaehrleistung.css): ohne sie las sich der Link im Vorschau-
          Bild vom 10.11. wie Fließtext, und niemand hätte getippt. */}
      <Link
        to={`/products/${nachfolger.handle}`}
        prefetch="intent"
        style={{
          color: 'var(--color-accent-ink)',
          textDecoration: 'underline',
          fontWeight: 600,
        }}
      >
        {nachfolger.name} ansehen
      </Link>
    </p>
  );
}

function StandardProduct({product, kaufleiste = false}) {
  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;
  // Kaufbox-Ref für die Kaufleiste: sie misst, ob der Kaufknopf der Kaufbox
  // im Bild ist (reusables/Kaufleiste.jsx).
  const kaufbox = useRef(null);

  return (
    <>
    {/* data-section-Anker: instrumentieren die Standard-PDP (products.$handle,
        z.B. /products/qione) wie Homepage/LPs für den qpx-Sektions-Tracker
        (behavior_section). Drei DISJUNKTE Zonen (kein Verschachteln — sonst
        zählt Dwell doppelt und Description-Klicks stanzen ein Loch in die
        Buybox): pdp-gallery (Bilder), pdp-description (Produkttext), pdp-buybox
        (Preis + Kauf/ATC). Reine Attribute bzw. EIN Wrapper-Div in normalem
        Blockfluss (.product-main ist kein Flex/Grid mit gap/>child) — kein
        Layout-Effekt. Erfasst beim HARD-LOAD (Ad-Traffic landet hart) analog
        zum bestehenden Tracker; SPA-navigierte PDPs bleiben ungemessen (Eigen-
        schaft des Trackers, s. RESULT). Job 20260723-commerce-microfunnel. */}
    {/* data-produkt: reiner Anker fuer seitengenaue Optik (app.css, Abschnitt
        Broschuere), kein Layout-Effekt. */}
    <div className="product" data-produkt={product.handle} ref={kaufbox}>
      <div className="ProductImages" data-section="pdp-gallery">
        <ProductImage image={selectedVariant?.image} />
        <ProductImageList images={product?.images} />
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        <SterneSprung className="product-rating mt-2"><span style={{color: 'var(--color-accent-ink)'}}>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        <div className="ProductDescription" data-section="pdp-description" dangerouslySetInnerHTML={{__html: fremdHtmlMitBildAuszeichnung(descriptionHtml)}} />

        <p className='mt-2'><b>Mehr als 14.000+ aktive Nutzer</b></p>

        <div data-section="pdp-buybox">
          <ProductPrice
            handle={product.handle}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            unterKaufknopf={
              istBegrenztesAngebot(product.handle) ? (
                <p className="mt-2">{ANGEBOT_HINWEIS}</p>
              ) : (
                <NachfolgerHinweis
                  handle={product.handle}
                  ausverkauft={!selectedVariant?.availableForSale}
                />
              )
            }
          />
        </div>
      </div>
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
    {/* BF-Deal-Galerie unter der Kaufbox (nur auf einer BF-Deal-Seite). */}
    <DealGalerie />
    {kaufleiste ? (
      <Kaufleiste
        kaufbox={kaufbox}
        preis={{
          handle: product.handle,
          price: selectedVariant?.price,
          compareAtPrice: selectedVariant?.compareAtPrice,
        }}
        selectedVariant={selectedVariant}
        productOptions={productOptions}
      />
    ) : null}

    {/* Google-Rezensionsbereich sitewide auf Produktseiten (Job
        20260731-google-rezensionen): auch die generischen PDPs tragen die
        echten Google-Bewertungen (Live-Reputon) + Anker für den
        4,8-Banner-Klick. Marken-Bewertung (Qi Blanco), daher produkt-
        unabhängig korrekt. */}
    <GoogleRezensionenBereich />
    </>
  );
}



const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 10) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
