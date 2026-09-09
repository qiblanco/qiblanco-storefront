import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox, QiOneBenefitList} from '~/components/product-pages/QiOneBuyBox';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';

/*
 * KEIN links()-EXPORT MEHR (2026-09-08, Elina EL-20260908-d8349a01).
 *
 * Hier hing zweifel-beleg.css als route-gebundenes Stylesheet, weil diese
 * Seite den <ZweifelBeleg> trug. Der ist entfallen (siehe unten). Ein
 * Stylesheet für eine Klasse, die auf dieser Seite nicht mehr vorkommt,
 * wäre ein Netz-Abruf ohne Wirkung -- und schlimmer: er würde beim
 * nächsten Leser den Eindruck erwecken, die Zeile sei noch da.
 *
 * Die Datei selbst BLEIBT: /cart trägt seine eigene Zweifel-Zeile und lädt
 * sie über sein eigenes links().
 */
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    pfad: '/products/qione-2-pro',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args, 'qione-2-pro'); // ✅ pass hardcoded handle

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data (above-the-fold content)
 * @param {LoaderFunctionArgs} args
 * @param {string} handle
 */
async function loadCriticalData({context, request}, handle) {
  const {storefront} = context;

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle, // ✅ use the static handle
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {product};
}

/**
 * Load deferred (non-critical) data
 */
function loadDeferredData({context, params}) {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product} = useLoaderData();

  const {descriptionHtml} = product;
  // Buy-Box-Struktur (Bilder + Preis + Varianten + ATC + Analytics) lebt jetzt
  // geteilt in QiOneBuyBox (Query-SSoT-Bau T1). Die organische PDP übergibt
  // ihren UNVERÄNDERTEN Bestand als Slots — DOM bleibt byte-identisch:
  // Social-Proof-Zeile (4.8★/„Über 14.000 Nutzer"), descriptionHtml,
  // „Mehr als 14.000+"-Absatz, Bestseller-Label, geteilte BenefitList.
  return (
    <>
      <QiOneBuyBox
        product={product}
        /* Die Pflichtmitteilung hängt auf dieser Seite NICHT mehr unter dem
           Kauf-Knopf, sondern weiter unten im benefitList-Slot (Elina
           EL-20260908-d8349a01). Sie ist damit verschoben, nicht entfernt —
           und dieser Schalter ist die einzige Stelle, die verhindert, dass
           sie zweimal auf der Seite steht. Jede andere Kaufflaeche behaelt
           den Default (siehe ProductForm.jsx). */
        gewaehrleistungsHinweis={false}
        socialProof={
          <SterneSprung className="product-rating"><span>4.8</span> <StarRating value={4.8} />{' '}<span>Über 14.000 Nutzer</span></SterneSprung>
        }
        description={
          <div
            className="ProductDescription"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        }
        topBadge={
          <p className="mt-2">
            <b>Mehr als 14.000+ aktive Nutzer</b>
          </p>
        }
        priceLabel={<div className="BestsellerLabel">Bestseller Angebot</div>}
        /* HIER STAND BIS ZUM 2026-09-08 DIE ZWEIFEL-ZEILE ("Wirkt das
           überhaupt? …"). Elina EL-20260908-d8349a01 nimmt sie ERSATZLOS
           heraus — ausdrücklich ohne Ersatzformulierung — und setzt an genau
           diese Stelle den Gewährleistungs-Trigger, der vorher weiter oben
           unter dem Kauf-Knopf hing.

           DIE ORTSBEGRÜNDUNG VON DAMALS TRÄGT DEN NEUEN INHALT MIT: unter der
           Nutzen-Liste, direkt neben Preis und Kaufknopf — die Stelle, an der
           VOR dem Kauf abgewogen wird. Für eine Pflichtmitteilung ist das
           sogar der schärfere Ort: Art. 6 Abs. 1 lit. l RL 2011/83/EU verlangt
           sie "in hervorgehobener Weise", BEVOR der Verbraucher gebunden ist.

           SEIT ELINA EL-20260909-395f848c STEHT ER NICHT MEHR NEBEN DER LISTE,
           SONDERN IN IHR — als fünfter Punkt derselben <ul>. Bestellt war der
           Eindruck ("wie ein weiterer Punkt, nicht wie ein separater Block
           darunter"); die Bauform ist der Weg dorthin, weil Zeilenabstand,
           Icon-Größe und Schrift dann GEERBT statt nachgebaut sind. Der Ort
           bleibt derselbe, die Begründung darüber gilt unverändert.

           Weiterhin Slot statt eigener Sektion, damit die Anker-frei-Regel
           dieser PDP unberührt bleibt: ein neues data-section hätte den
           Design-Rubrik-Collector verschoben. */
        benefitList={
          <QiOneBenefitList zusatzPunkt={<EuGewaehrleistungsListenpunkt />} />
        }
      />
      {/* GitterChip-Molecules-Scrub nach dem Gitterchip-Erklaerblock —
          von Christian 2026-07-17 ausdruecklich fuer die organische PDP
          freigegeben (Job 20260717-gitterchip-animation-3seiten-rollout).
          Aktivierung bewusst HIER in der Route (explizit wie die Campaign-
          PDP), QiOne2Pro-Default bleibt null. BEWUSST ohne dataSection:
          die PDP traegt sonst ihren ERSTEN data-section-Anker und der
          Design-Rubrik-Collector saehe nur noch 1 Sektion (Watch-Regression). */}
      {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen): auf
          dieser PDP fehlte er komplett (Christian-Bug — 4,8-Klick im Banner
          lief ins Leere). Gleicher Slot wie auf der Campaign-PDP
          /pages/qione-2-pro (trustNachSlider nach dem InfoSlider), Inhalt =
          Live-Reputon-Widget + Überschrift. BEWUSST ohne dataSection
          (Anker-frei-Regel dieser PDP, siehe oben). */}
      <QiOne2Pro
        gitterchipAnimation={<GitterchipMoleculesScrub />}
        trustNachSlider={<GoogleRezensionenBereich />}
      />
    </>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
