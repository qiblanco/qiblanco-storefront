import {Link, useNavigate} from 'react-router';
import {AddToCartButton} from './AddToCartButton';
import {EuGewaehrleistungsHinweis} from './EuGewaehrleistungsLabel';
import {useAside} from './Aside';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 *   quantity?: number;
 *   ctaLabel?: string;
 *   gewaehrleistungsHinweis?: boolean;
 * }}
 *
 * `quantity` (Default 1) legt die Stückzahl der EINEN Add-to-Cart-Zeile fest.
 * Der Default hält jeden Bestands-Aufrufer byte-identisch; nur die Campaign-PDP
 * /pages/qione-2-pro-2x übergibt quantity={2} für das 2er-Set. Der Kampagnen-
 * PREIS entsteht NICHT hier, sondern über einen Automatic Discount am Warenkorb
 * (Konzept „Shopseite nach LP" Kap. 5: ein Produkt referenziert, kein Preis-
 * Klon-Produkt). `ctaLabel` erlaubt der Kampagne einen eigenen Button-Text,
 * ohne eine zweite Kauflogik zu bauen.
 *
 * `gewaehrleistungsHinweis` (Default TRUE, und der Default ist die eigentliche
 * Aussage) steuert, ob die EU-Pflichtmitteilung hier unter dem Kauf-Knopf
 * hängt. Elina EL-20260908-d8349a01 hat sie auf /products/qione-2-pro weiter
 * nach unten verschoben; dort schaltet die Route sie hier ab und montiert sie
 * selbst.
 *
 * SEIT ELINA EL-20260909-8c4001d1 IST DAS NICHT MEHR DIE AUSNAHME EINER
 * SEITE, SONDERN EINE REGEL: jede Kaufflaeche MIT eigener Nutzen-Liste
 * schaltet hier ab und hängt den Punkt in ihre Liste; jede Kaufflaeche OHNE
 * solche Liste behaelt ihn an dieser Stelle. Der Default trägt weiterhin
 * die zweite Gruppe -- und zwar die groessere: die meisten Kaufflaechen
 * entstehen über veroeffentlichte Shopify-Produkte ohne eigene Route-Datei
 * (Catch-all products.$handle) und können gar nichts abschalten.
 *
 * WARUM EIN ABSCHALTER UND NICHT EIN AUSBAU: die Naht sitzt hier, weil die
 * meisten Kaufflaechen über veroeffentlichte Shopify-Produkte OHNE eigene
 * Route-Datei laufen (Catch-all products.$handle). Wer sie hier herausnimmt,
 * um sie auf EINER Seite zu verschieben, nimmt sie damit still von ALLEN
 * uebrigen -- die Seiten antworten weiter HTTP 200 und sehen vollstaendig
 * aus. Ein Default-true-Schalter verschiebt genau eine Seite und lässt den
 * Rest, wo er ist.
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  quantity = 1,
  ctaLabel,
  gewaehrleistungsHinweis = true,
}) {
  const navigate = useNavigate();
  const {open} = useAside();
  return (
    <div className="product-form">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        return (
          <div className="product-options" key={option.name}>
            <h5>{option.name}</h5>
            <div className="product-options-grid">
              {option.optionValues.map((value) => {
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className="product-options-item"
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={`product-options-item${
                        exists && !selected ? ' link' : ''
                      }`}
                      key={option.name + name}
                      style={{
                        border: selected
                          ? '1px solid black'
                          : '1px solid transparent',
                        opacity: available ? 1 : 0.3,
                      }}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
            <br />
          </div>
        );
      })}
      <div className="AddToCartButtonWrapper">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale
            ? ctaLabel ?? 'In den Warenkorb legen'
            : 'Ausverkauft'}
        </AddToCartButton>
      </div>
      {/*
        Sichtbarer Text-Link zur Pflichtmitteilung, unmittelbar unter dem
        Kauf-Button (Art. 6 Abs. 1 lit. l RL 2011/83/EU: "in hervorgehobener
        Weise", BEVOR der Verbraucher gebunden ist). Die amtliche Grafik
        selbst erscheint erst im Overlay nach Klick -- so beschreiben es die
        Praxisleitlinien der Kommission (April 2026, Abschnitt 2.3) für die
        Mitteilung.

        Die Naht sitzt bewusst HIER und nicht in den einzelnen
        Produktseiten-Komponenten: die Kaufflaechen entstehen über
        veroeffentlichte Shopify-Produkte, von denen ein Grossteil ohne
        eigene Route-Datei über den Catch-all läuft. Eine Naht je Seite
        würde genau die stillschweigend auslassen.

        AUSNAHME SEIT 2026-09-08: eine Seite DARF die Mitteilung selbst
        montieren und schaltet sie dann hier ab (Prop oben). Das ist kein
        Rueckfall in die Naht-je-Seite -- der Default bleibt hier, und wer
        nichts sagt, bekommt sie hier.
      */}
      {gewaehrleistungsHinweis ? <EuGewaehrleistungsHinweis /> : null}
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
function ProductOptionSwatch({swatch, name}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="product-option-label-swatch"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} />}
    </div>
  );
}

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
