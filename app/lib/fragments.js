// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
`;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
      squareLogo {
        image {
          url
        }
      }
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

export const FOOTER_QUERY = `#graphql
  query Footer(
    $country: CountryCode
    $footerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    menu(handle: $footerMenuHandle) {
      ...Menu
    }
  }
  ${MENU_FRAGMENT}
`;

// Job 20260923-adparams-monotonie-tot-auf-hauptpfad-und-no-ist-kein-beleg.
//
// WARUM ES DIESES FRAGMENT ÜBERHAUPT GIBT: Hydrogen hat ZWEI Cart-Fragmente,
// nicht eines. `queryFragment` gilt für `cart.get()`, `mutateFragment` für
// JEDE Mutation (addLines/updateLines/removeLines/updateDiscountCodes/
// updateGiftCardCodes/updateBuyerIdentity/updateAttributes/create). Wird
// `mutateFragment` nicht gesetzt, greift Hydrogens Default — nachgelesen in
// node_modules/@shopify/hydrogen/dist/production/index.js, `fragment
// CartApiMutation on Cart { id totalQuantity checkoutUrl }`. Ein
// Mutationsergebnis trägt dann NIE ein `attributes`-Feld.
//
// WAS DAS KAPUTT MACHTE: `persistAttributionOnCartResult` liest genau dieses
// `result.cart.attributes` als Vorbestand für die Monotonie-Regel von
// `ad_params_seen`. Ohne das Feld war der Vorbestand immer `null`, und jede
// Warenkorb-Änderung von einer Seite ohne Ad-Parameter wertete ein belegtes
// `yes_*` still auf `unknown` ab — der Marker war auf dem Hauptpfad tot.
// Gesund war allein `cart.attribution.jsx`, weil es `cart.get()` benutzt.
//
// DER NAME IST VERTRAGLICH: Hydrogen spreizt `...CartApiMutation` in seine
// Mutations-Dokumente und hängt diesen String darunter. Heißt das Fragment
// anders, ist das GraphQL-Dokument ungültig. ARM-H2 nagelt das fest.
//
// ADDITIV: die drei Default-Felder bleiben, `attributes` kommt dazu. Kein
// bestehender Konsument eines Mutationsergebnisses verliert etwas.
export const CART_MUTATE_FRAGMENT = `#graphql
  fragment CartApiMutation on Cart {
    id
    totalQuantity
    checkoutUrl
    attributes {
      key
      value
    }
  }
`;
