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
 * }}
 *
 * `quantity` (Default 1) legt die Stückzahl der EINEN Add-to-Cart-Zeile fest.
 * Der Default hält jeden Bestands-Aufrufer byte-identisch; nur die Campaign-PDP
 * /pages/qione-2-pro-2x übergibt quantity={2} für das 2er-Set. Der Kampagnen-
 * PREIS entsteht NICHT hier, sondern über einen Automatic Discount am Warenkorb
 * (Konzept „Shopseite nach LP" Kap. 5: ein Produkt referenziert, kein Preis-
 * Klon-Produkt). `ctaLabel` erlaubt der Kampagne einen eigenen Button-Text,
 * ohne eine zweite Kauflogik zu bauen.
 */
export function ProductForm({
  productOptions,
  selectedVariant,
  quantity = 1,
  ctaLabel,
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
      */}
      <EuGewaehrleistungsHinweis />
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
