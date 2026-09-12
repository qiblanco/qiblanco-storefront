import {useLoaderData} from 'react-router';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/lib/qioneProductQuery';
import {QiOneBuyBox, QiOneBenefitList} from '~/components/product-pages/QiOneBuyBox';
import QiOne2Pro from '~/components/product-pages/QiOne2Pro';
import {GitterchipMoleculesScrub} from '~/components/reusables/GitterchipMoleculesScrub';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {EuGewaehrleistungsListenpunkt} from '~/components/EuGewaehrleistungsLabel';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import igStyles from '~/styles/ig-testimonials.css?url';
import {igVideoDescriptor} from '~/lib/ig-video-schema';
import {produktMeta, MARKE} from '~/lib/produkt-seo';
import {StarRating, SterneSprung} from '~/components/reusables/StarRating';

/*
 * ZWEIFEL-BELEG IST HIER ENTFALLEN (2026-09-08, Elina EL-20260908-d8349a01).
 *
 * Hier hing zweifel-beleg.css als route-gebundenes Stylesheet, weil diese
 * Seite den <ZweifelBeleg> trug. Der ist entfallen -- sein Stylesheet lädt
 * diese Route deshalb NICHT mehr. Die Datei selbst BLEIBT: /cart trägt seine
 * eigene Zweifel-Zeile und lädt sie über sein eigenes links().
 *
 * Das links() unten kam am 2026-09-11 zurück, aber für eine ANDERE Datei
 * (ig-testimonials.css) -- der alte Satz "kein links()-Export mehr" stand hier
 * bis dahin woertlich und wäre ab dieser Zeile eine falsche Selbstauskunft.
 */
export function links() {
  // ig-testimonials.css ist ROUTE-gebunden aus demselben Grund, aus dem es
  // zweifel-beleg.css war: die globale app.css erreicht 45 Seiten, die
  // Slideshow steht auf vieren. Die Datei setzt ihre Token bewusst auf
  // `.qb-igt` und nicht auf `:root` -- ein Route-Stylesheet mit :root-Token
  // wäre auf jeder anderen Route undefiniert, und `var(--x)` ohne Rueckfall
  // kippt dort still in Vererbung.
  return [{rel: 'stylesheet', href: igStyles}];
}
/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const basis = produktMeta({
    // Product-Auszeichnung (Preis/Verfügbarkeit) — siehe produkt-seo.js
    produkt: data?.product,
    pfad: '/products/qione-2-pro',
    titel: `${data?.product?.title ?? ''} | ${MARKE}`,
    bildUrl:
      data?.product?.selectedOrFirstAvailableVariant?.image?.url ??
      data?.product?.images?.nodes?.[0]?.url,
  });
  // VideoObject je Instagram-Beitrag MIT Video (43 von 44 Kacheln dieser
  // Seite — CYHc4RClQLb ist ein Bild-Post und bekommt deshalb keinen Knoten).
  // Der Descriptor ist null, wenn es nichts zu sagen gibt; dann wird bewusst
  // nichts angehängt statt ein leerer Container ausgeliefert.
  const videos = igVideoDescriptor({
    produkt: 'QiOne 2 Pro',
    pfad: '/products/qione-2-pro',
    produktTitel: data?.product?.title,
  });
  return videos ? [...basis, videos] : basis;
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
      {/*
        DIE INSTAGRAM-STIMMEN — WEIT OBEN, und zwar hier und nicht tiefer:
        unmittelbar nach dem Kaufblock (QiOneBuyBox trägt Bilder, Preis,
        Varianten, Kaufknopf) und VOR dem langen Inhaltsteil. Das ist die
        Stelle, an der der Zweifel vor dem Kauf entsteht — dieselbe
        Begründung, aus der hier bis zum 2026-09-08 der ZweifelBeleg stand.

        BEWUSST OHNE dataSection: diese PDP ist anker-frei. Ein erstes
        data-section würde den Design-Rubrik-Collector auf genau eine Sektion
        einengen (Watch-Regression) — dieselbe Begründung wie bei
        GitterchipMoleculesScrub und GoogleRezensionenBereich darunter.

        BEKANNTE NEBENWIRKUNG, gemeldet und nicht hier repariert: die Fläche
        steht damit im DOM ÜBER dem YouTube-Kasten des Inhaltsteils. Das
        fremde Messgerät homepage-bauer/bin/mess_videoumschaltung.py liest
        seine Spur über document.querySelector('[data-qb-video-zustand]'),
        also global statt am gemessenen Kasten, und zeigt dann den Zustand
        UNSERER ersten Kachel. Das verfälscht kein Verdikt (der Wahl-Schritt
        verwirft unsere Kacheln ohnehin, weil ihre Vorschau kein ytimg-Bild
        ist), aber es verfälscht jede Spur, die ein Mensch danach liest.
        Befund beim Eigentümer: review
        20260911-GROSSJOB-ig-testimonial-slideshow-auf-die-produktseiten-weit-oben-s03:software:h:09efed4e1f
      */}
      <IgTestimonialSlideshow produkt="QiOne 2 Pro" />
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
