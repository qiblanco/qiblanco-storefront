import {
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {useRef, useState} from 'react';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {ProductImageList} from '~/components/ProductImageList';
import {Kaufleiste} from '~/components/reusables/Kaufleiste';
import {QiBracelet} from '~/components/product-pages/QiBracelet';
import {GoogleRezensionenBereich} from '~/components/reusables/GoogleRezensionenBereich';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {ERSATZBILD_360} from '~/components/reusables/video360-ersatzbild';
import {ProductPrice} from '~/components/ProductPrice';
import {useMarktLand} from '~/lib/markt-land';
import {IgTestimonialSlideshow} from '~/components/reusables/IgTestimonialSlideshow';
import igStyles from '~/styles/ig-testimonials.css?url';
import pdpQiStyles from '~/styles/pdp-qi.css?url';
import kaufZuerstStyles from '~/styles/qb-pdp-kauf-zuerst.css?url';
import rand360Styles from '~/styles/qb-360-rand.css?url';
import {kaufZuerstAttribute} from '~/components/product-pages/pdpKaufZuerst';
import produktVideoStyles from '~/styles/produkt-videos.css?url';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import amazonstilStyles from '~/styles/amazonstil.css?url';
import {Geraetevergleich, Kundenfragen} from '~/components/reusables/AmazonStil';
import {OhneRisikoKaufen, SaunaWeg} from '~/components/reusables/OhneRisikoKaufen';
import ohneRisikoStyles from '~/styles/qb-ohne-risiko.css?url';
import {amazonstilAn, teileFragen} from '~/components/reusables/amazonstil-daten';
import {BLOCK_PUBLIC} from '~/components/reusables/blockLinks';
import {FAQ_QIBRACELET} from '~/data/product-faqs';

/*
 * DIE SEITE /products/qibracelet UND IHR LP-SPIEGEL /pages/qibracelet — EINE
 * KOMPONENTE (Christian 28.09.2026: "diese Shopseiten ... bitte auch anpassen
 * auf das Niveau von /products/qione-2-pro, d.h. die Seiten sind gleich bis
 * auf den Beschreibungstext oben beim Produkt").
 *
 * Bis zum 28.09.2026 gab es zwei Fassungen (Rumpf in der Route
 * products.qibracelet.jsx, Nachbau in QiBraceletShop.jsx), und der Spiegel blieb
 * hinter der Produktseite zurück. Seitdem rendern BEIDE Routen diese
 * Komponente; was hier geändert wird, gilt auf beiden.
 *
 * Was je Route verschieden bleibt, steht in der ROUTE, nicht hier:
 *   - meta/headers: /products indexierbar mit Produkt-Auszeichnung,
 *     /pages noindex,nofollow (Doppelgate) ohne canonical.
 *   - Loader: /products mit Localize-Redirect, /pages mit hartem Handle;
 *     beide mit derselben PRODUCT_QUERY von hier (eine Quelle, keine Kopie).
 * Was die Route hereingibt:
 *   - beschreibung: der Text oben am Produkt (die EINZIGE sichtbare
 *     Abweichung).
 *   - block: BLOCK_LP auf /pages -> Karten und Vergleich verlinken die
 *     Geschwister-Landeziele (Zwei-Block-IA, reusables/blockLinks.js, Wache
 *     homepage-bauer/selftest_zweiblock.py).
 *   - shopMarker: data-qi-shop des Spiegels (Testbarkeit, unsichtbar).
 */

/*
 * ZWEI route-gebundene Stylesheets — zwei Gründe, keines ersetzt das andere.
 *
 * MERGE-NOTIZ (2026-09-12): dieser Block war ein echter Konflikt. PR #376
 * (IG-Testimonial-Slideshow) und PR #377 (Token-Schicht pdp-qi) haben
 * unabhängig voneinander je einen links()-Export an genau diese Stelle
 * geschrieben; aufgelöst wird additiv.
 *
 * - ig-testimonials.css (PR #376): Slideshow-Fläche, steht auf vier
 *   Kaufseiten. Setzt ihre Token bewusst auf `.qb-igt` statt auf `:root` —
 *   ein Route-Stylesheet mit :root-Token wäre auf jeder anderen Route
 *   undefiniert, und `var(--x)` ohne Rückfall kippt dort still in Vererbung.
 * - pdp-qi.css (PR #377): Token-Schicht genau der zwei Flaggschiff-
 *   Kaufseiten (Score 59 -> 84 bzw. 56 -> 83), innen zusätzlich auf `main`
 *   gescoped. Jeder ihrer Selektoren trifft hier gemessen (h2,
 *   .NormalSectionSize, .snap-start, .HeroBannerAlt, main img) — der
 *   Entfall-Grund von zweifel-beleg.css oben ("Stylesheet für eine Klasse,
 *   die es hier nicht mehr gibt") spricht also nicht gegen diese Zeile,
 *   sondern verlangt genau diese Prüfung.
 *
 * REIHENFOLGE IST TRAGEND: pdp-qi.css steht HINTER ig-testimonials.css.
 * Beide sind ungelayert; bei gleicher Spezifität gewinnt die später
 * geladene. pdp-qi.css setzt den EINEN H2-Stil dieser Seite und braucht
 * deshalb die letzte Stimme — die Slideshow-Überschrift ist genau der Fall,
 * den Commit 765faef schon einmal auf die H2-Regel der Gastgeber-Seite
 * zurückgeholt hat.
 */
export function qiBraceletSeiteLinks() {
  return [
    {rel: 'stylesheet', href: igStyles},
    {rel: 'stylesheet', href: pdpQiStyles},
    {rel: 'stylesheet', href: kaufZuerstStyles},
    // Weicher Rand des 360-Videos ins schwarze Band (Job 20261025-design-
    // repair-qihome-air-animation-schwarz-preisanker-ultimate-power).
    // Rückweg: diese Zeile entfernen.
    {rel: 'stylesheet', href: rand360Styles},
    // Video-Kachel im Vorschaustreifen + Video-Dialog (Maßnahme „Produktseite,
    // die verkauft“, 26.09.2026). Eigene Klassen (.qb-pv-*).
    {rel: 'stylesheet', href: produktVideoStyles},
    // Gerätevergleich + Kundenfragen (Amazon-Stil Stufe 2, s04, 27.09.2026).
    // Eigene Klassen (.qb-gv-*, .qb-kf-*); beide Schalter aus = keine Zeile.
    ...(amazonstilAn('qibracelet') ? [{rel: 'stylesheet', href: amazonstilStyles}] : []),
    // Rückgabe/Raten in Kundenworten + Weg zur Sauna-Antwort (Auftrag
    // zs-marke-energie-schmuck-20260927-s02). Eigene Klassen (.qb-or*).
    {rel: 'stylesheet', href: ohneRisikoStyles},
  ];
}

/**
 * @param {{
 *   product: object,
 *   vergleichsPreise?: object,
 *   beschreibung: import('react').ReactNode,
 *   block?: string,
 *   shopMarker?: string,
 *   kaufleiste?: boolean,
 * }} props
 */
export function QiBraceletSeite({
  product,
  vergleichsPreise,
  beschreibung,
  block = BLOCK_PUBLIC,
  shopMarker = undefined,
  kaufleiste = false,
  kaufbereich = null,
}) {
  // Kundenfragen oben, der Rest bleibt in der FAQ unten (Regel und
  // Reihenfolge in amazonstil-daten.js). Schalter aus: oben leer, unten die
  // unveränderte Liste.
  const fragen = teileFragen('qibracelet', FAQ_QIBRACELET);

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

  const [featuredImage, setFeaturedImage] = useState(product?.images.nodes[0]);
  const kaufbox = useRef(null);
  // Derselbe Preis für Kaufbox und Kaufleiste: EIN Objekt, zwei Anzeigen.
  const preis = {
    handle: product.handle,
    price: selectedVariant?.price,
    compareAtPrice: selectedVariant?.compareAtPrice,
  };
  const {title, } = product;

  return (
    <>
    {/* KONFIGURATOR (Grossjob 20261027-GROSSJOB-apple-konfigurator-qione-
        qihome-qibracelet-ab, s05): gibt die Route einen `kaufbereich` herein,
        steht er an der Stelle von 360-Kopf, Kaufbox und Kaufleiste; alles
        darunter bleibt. Ohne die Prop ist die Seite byte-gleich: je Kind ein
        Ausdruck an seiner alten Stelle, keine Hülle (eine Hülle verschöbe die
        useId-Pfade aller Geschwister danach).
        Muster: QiOne2ProSeite (Elina EL-20261027-c05a2273). */}
    {kaufbereich ?? (
    <div className="qb-pdp-kopf" {...kaufZuerstAttribute()}>
    <div className="product-360-hero">
      <div className="product-360-hero__text">
        <h2>QiBracelet®</h2>
        <h3>Entwickelt für Superhumans</h3>
        <p>
          Deine leistungsstarke Unterstützung – edel und dezent.
          <br />
          Passend für jede Situation und jeden Style.
        </p>
      </div>
      <div className="product-360-hero__video">
        {/* Ersatzbild statt JjGdCuv.webp (zeigte die Kante des Reifs, bleibt auf dem CDN):
            steht die Drehung, steht der Reif schräg von vorn aus dem Video. */}
        <ImgixVideo videoPath="new-360-QiBracelet-1x1.mov" ersatz={ERSATZBILD_360.qibracelet} />
      </div>
    </div>
    {/* id="product" = Anker-Ziel der "#product"-CTAs im QiBracelet-Content
        darunter (war toter Anker; linkwatch anker-Prüfebene wacht darüber). */}
    <div className="product" id="product" data-qi-shop={shopMarker} {...kaufZuerstAttribute()} ref={kaufbox}>
      <div className="ProductImages">
          <div className="ProductImageWrapperSticky">

        {/* LCP ist hier das 360-Video: Bild eager, aber ohne hohe Priorität. */}
        <ProductImage image={featuredImage} vorrang={false} />
        {/* Videos im Vorschaustreifen (Amazon-Muster, Maßnahme „Produktseite,
            die verkauft“, 26.09.2026): das Zellvideo der QiBracelet-Studie,
            bis heute auf keiner Seite. Daten: app/data/produkt-videos.js. */}
        <ProductImageList
          images={product?.images}
          onSelectImage={(image) => setFeaturedImage(image)}
          videoKachel={<ProduktVideoKachel handle="qibracelet" />}
        />
      </div>
      </div>
      <div className="product-main">
        <h1>{title}</h1>
        {/* DIE EINZIGE ABWEICHUNG ZWISCHEN DEN BEIDEN ROUTEN (Christian
            28.09.2026: "gleich bis auf den Beschreibungstext oben beim
            Produkt"): /products den Shopify-Beschreibungstext, /pages die
            Hero-Punkte der Landingpage-Fassung. */}
        {beschreibung}

        {/* DER PREIS STEHT ALLEIN (Christian 29.10.2026 Z7/Z9, Shop-Regel S6
            apple_ohne_preisanker; Job 20261023-repair-qibracelet-
            groessenhilfe-eindeutig-machen s06). Bis zum 10.11.2026 stand hier
            der Preisanker-Dreizeiler „4.8 ★★★★★ Google Bewertungen / + 14.000
            Nutzer / Preis“ (reusables/Preisanker.jsx, 26.10.2026). Diese Seite
            ist der Rückweg des Schalters KONFIGURATOR_QIBRACELET: steht er
            nicht auf on, rendert /products/qibracelet genau diesen Kopf, und
            dann gilt Christians „das passt nich mehr hin“. Vorbild ist der
            Konfigurator (A): Preis ohne Sterne, ohne Nutzerzahl, ohne Schild.
            Die Bewertungen stehen weiter unten (GoogleRezensionenBereich). */}
        <div className="qb-preis-allein" style={PREIS_ALLEIN}>
          <ProductPrice
            handle={preis.handle}
            price={preis.price}
            compareAtPrice={preis.compareAtPrice}
          />
        </div>
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
          /* Die EU-Pflichtmitteilung hängt wieder unter dem Kaufknopf
             (Default von ProductForm), wie auf der Apple-Seite A
             (products.qibracelet.jsx: vertrauen={<EuGewaehrleistungsHinweis />}).
             Bis zum 10.11.2026 stand sie als Listenpunkt mit Schild-Symbol
             in der Nutzen-Liste darunter (Elina EL-20260909-8c4001d1). Ein
             Symbol vor einem Listenpunkt im Kopf ruft seit Christians Z1 vom
             27.10.2026 („keine gimgis vor den aufzählungspunkten“, Shop-Regel
             D1) STOP; die Mitteilung selbst bleibt einmal auf der Seite,
             direkt am Kaufknopf. */
        />
        <BenefitList />
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
    </div>
    )}
    {/* Klebende Kaufleiste mobil (reusables/Kaufleiste.jsx): nur die
        Kaufseite schaltet sie ein (Prop `kaufleiste`), der Landingpage-
        Spiegel nicht. Preis und Warenkorbzeilen aus DIESER Kaufbox. */}
    {!kaufbereich && kaufleiste ? (
      <Kaufleiste
        kaufbox={kaufbox}
        preis={preis}
        selectedVariant={selectedVariant}
        productOptions={productOptions}
      />
    ) : null}
      {/*
        DIE INSTAGRAM-STIMMEN — WEIT OBEN: unmittelbar nach dem Kaufblock
        (Bilder, Preis, Varianten, Kaufknopf) und VOR dem langen Inhaltsteil.
        Das ist die Stelle, an der der Zweifel vor dem Kauf entsteht.

        BEWUSST OHNE dataSection: diese PDP führt heute kein einziges
        data-section. Das erste würde den Design-Rubrik-Collector auf genau
        eine Sektion einengen (Watch-Regression) — dieselbe Begründung, mit
        der products.qione-2-pro.jsx seine Anker-frei-Regel führt.
      */}
      <IgTestimonialSlideshow produkt="QiBracelet" />
      {/*
        AMAZON-STIL STUFE 2 (Christian 26.09.2026, Leitplanke Folie 11;
        Grossjob growth-m-lp-produktseite-verkauft, s04): der Vergleich der
        drei Geräte und die häufigsten Kundenfragen direkt nach den
        Instagram-Stimmen, statt bei 90 % Seitentiefe. Seit dem 28.09.2026
        auch auf /pages/qibracelet (bis dahin Kontrollgruppe der
        Wirkungsmessung). `block` hält die Geräte-Links im Landing-Bereich.
        BEWUSST ohne dataSection.
      */}
      <Geraetevergleich
        handle="qibracelet"
        block={block}
        preise={vergleichsPreise}
        eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
      />
      {/* Google-Rezensionsbereich (Job 20260731-google-rezensionen):
          Live-Reputon + Überschrift + Anker für den 4,8-Banner-Klick. */}
      {/* Vertrauensblock vor den Kundenfragen, die Kundenfragen direkt
          darunter (Christian 28.09.2026 ~19:45: "das FAQ kommt direkt
          darunter, nicht oben drüber, dann wirkt es insgesamt stimmiger";
          löst die Reihenfolge von ~19:25 ab). Genau einmal auf der Seite. */}
      {/* Messanker ohne Eingriff in den geteilten Baustein: display:contents
          erzeugt keine eigene Box, das Layout bleibt wie ohne Hülle. */}
      <div data-qb-block="zufriedene-kunden" style={{display: 'contents'}}>
        <GoogleRezensionenBereich />
      </div>
      <Kundenfragen handle="qibracelet" oben={fragen.oben} alle={FAQ_QIBRACELET} />
      {/* Sichtbarer Weg zur Sauna-Antwortseite direkt unter den
          Kundenfragen, deren erste Frage hier Wasser und Sauna ist. */}
      <SaunaWeg handle="qibracelet" />
      {/* Rückgabe und Raten in Kundenworten, offen unter den Kundenfragen:
          die zwei Fragen, die vor dem Kauf zögern lassen (Auftrag
          zs-marke-energie-schmuck-20260927-s02, 26.10.2026; Texte und
          Schalter in reusables/ohne-risiko-daten.js). BEWUSST ohne
          dataSection. */}
      <OhneRisikoKaufen handle="qibracelet" />
      <QiBracelet block={block} faqItems={fragen.unten} />
    </>
  );
}

/*
 * NUTZEN-LISTE OHNE SYMBOLE (Christian 27.10.2026 Z1: „keine gimgis vor den
 * aufzählungspunkten“, Shop-Regel D1; Z7/Z9 vom 29.10.2026: im Kopf einer
 * Apple-Kaufseite keine Bewertungs- oder Nutzerzahl, Shop-Regel S6).
 *
 * Bis zum 10.11.2026 standen hier KaufZusagePunkte (Rücknahme, Raten, „447
 * Google-Bewertungen, im Schnitt 4,8 von 5“), drei Versandzeilen und der
 * Gewährleistungs-Punkt, jeder mit einem Symbol davor. Geblieben sind die
 * Zusagen als reine Textzeilen, wie die Versandzeile der Apple-Seite A
 * (`tas-versand`, ohne Symbol). Der Bewertungs-Punkt ist weg: die
 * Bewertungen stehen weiter unten auf der Seite. Die Pflichtmitteilung hängt
 * unter dem Kaufknopf (ProductForm, Default).
 *
 * KaufZusagePunkte selbst bleibt unverändert, andere Seiten nutzen es. Die
 * Messanker data-qb-kaufzusage (ruecknahme, raten) bleiben an denselben
 * Zeilen. Raten wie dort nur im Markt DE (Fußnote 2: deutscher Wohnsitz).
 *
 * ZEILE_OHNE_SYMBOL hebt die Symbol-Spalte von `.BenefitList li` (app.css)
 * auf: ohne Symbol bliebe sonst der hängende Einzug, und am Handy stünde
 * die zweite Zeile einer langen Zusage eingerückt unter der ersten.
 */
const ZEILE_OHNE_SYMBOL = {paddingLeft: 0, textIndent: 0};

/*
 * Der Preis allein: Abstand und Reihenfolge, die vorher der Preisanker trug
 * (qb-preisanker.css: margin 16px 0). `order: 1` hält ihn am Desktop mit
 * Kauf-zuerst direkt unter dem Titel (qb-pdp-kauf-zuerst.css ordnet nur
 * direkte Kinder von .product-main); ohne Abstand stand er 0 px unter dem H1
 * (shop-tor D4 A1 „Gedränge“). 16 px = zwei Schritte des 8er-Rasters.
 */
const PREIS_ALLEIN = {order: 1, margin: 'calc(2 * var(--qb-ref-raster, 8px)) 0'};

function BenefitList() {
  const marktLand = useMarktLand();
  return (
    <div className="BenefitList">
      <ul>
        <li data-qb-kaufzusage="ruecknahme" style={ZEILE_OHNE_SYMBOL}>
          <b>20 Tage zu Hause testen</b>, 100% Geld-zurück-Garantie
        </li>
        {marktLand === 'DE' ? (
          <li data-qb-kaufzusage="raten" style={ZEILE_OHNE_SYMBOL}>
            <b>In Raten zahlen</b>, mit 0&nbsp;% Finanzierung mit PayPal und Klarna
          </li>
        ) : null}
        <li style={ZEILE_OHNE_SYMBOL}>
          <b>Kostenloser Versand</b> innerhalb Deutschlands
        </li>
        <li style={ZEILE_OHNE_SYMBOL}>
          <b>In 2-3 Tagen</b> bei Dir
        </li>
        <li style={ZEILE_OHNE_SYMBOL}>
          <b>100% Versicherter Versand</b>
        </li>
      </ul>
    </div>
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

export const PRODUCT_QUERY = `#graphql
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
