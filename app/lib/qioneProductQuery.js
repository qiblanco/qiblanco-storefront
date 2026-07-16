/**
 * Query-SSoT für das QiOne-2-Pro-Produkt (Konzept „Shopseite nach LP" Kap. 3, T1).
 *
 * PRODUCT_QUERY + Fragmente leben ab jetzt EINMAL hier und werden von BEIDEN
 * Routen importiert:
 *   - app/routes/products.qione-2-pro.jsx  (organische PDP)
 *   - app/routes/pages.qione-2-pro.jsx     (Campaign-PDP nach LP)
 *
 * „Ware identisch dargestellt" ist damit eine CODE-INVARIANTE, kein Zufall:
 * dieselbe GraphQL-Query -> dieselben Varianten-/Options-/Bild-/Preis-Daten
 * auf beiden Seiten. Wer die Produkt-Darstellung ändern will, ändert sie hier
 * genau einmal (Lean-PM-Prinzip: ein Produkt, referenziert statt dupliziert).
 *
 * Reiner GraphQL-String — KEIN React/Remix-Import, damit das Modul provider-
 * agnostisch bleibt und die Query ohne Build-Toolchain lesbar/prüfbar ist.
 */

export const PRODUCT_VARIANT_FRAGMENT = `#graphql
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

export const PRODUCT_FRAGMENT = `#graphql
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
