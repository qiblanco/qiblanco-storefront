import {useLocation} from 'react-router';
import {useMemo} from 'react';

/**
 * SHOPIFY-HANDLE UND SEITENPFAD SIND BEIM QI ALPHA ZWEI DINGE. Die Kaufseite
 * steht seit 2026-10-26 unter /products/the-alpha (Christian Z4 vom
 * 25.10.2026: „wir gehen im link weg von qi-alpha hin zu the alpha"; Grossjob
 * 20261025-prio1-the-alpha-..., s06). In Shopify heißt das Produkt weiter
 * qi-master (ab dem Handle-Wechsel des Umbenennungs-Grossjobs qi-alpha), die
 * Add-ons ebenso. Ohne diese Karte führte jede Warenkorb-Zeile und jede
 * Produktkarte über eine 301-Hülle; mit ihr landet der Klick direkt.
 * Rückweg: Karte leeren, die 301-Hüllen tragen die alten Pfade weiter.
 */
const PFAD_HANDLE_JE_SHOPIFY_HANDLE = {
  'qi-master': 'the-alpha',
  'qi-alpha': 'the-alpha',
  'qi-master-wunschnummer': 'the-alpha',
  'qi-alpha-wunschnummer': 'the-alpha',
  'qi-master-goldkette': 'the-alpha',
  'qi-alpha-goldkette': 'the-alpha',
};

/**
 * @param {string} handle
 * @param {SelectedOption[]} [selectedOptions]
 */
export function useVariantUrl(handle, selectedOptions) {
  const {pathname} = useLocation();

  return useMemo(() => {
    return getVariantUrl({
      handle,
      pathname,
      searchParams: new URLSearchParams(),
      selectedOptions,
    });
  }, [handle, selectedOptions, pathname]);
}

/**
 * @param {{
 *   handle: string;
 *   pathname: string;
 *   searchParams: URLSearchParams;
 *   selectedOptions?: SelectedOption[];
 * }}
 */
export function getVariantUrl({
  handle,
  pathname,
  searchParams,
  selectedOptions,
}) {
  const match = /(\/[a-zA-Z]{2}-[a-zA-Z]{2}\/)/g.exec(pathname);
  const isLocalePathname = match && match.length > 0;
  const pfadHandle = PFAD_HANDLE_JE_SHOPIFY_HANDLE[handle] ?? handle;

  const path = isLocalePathname
    ? `${match[0]}products/${pfadHandle}`
    : `/products/${pfadHandle}`;

  selectedOptions?.forEach((option) => {
    searchParams.set(option.name, option.value);
  });

  const searchString = searchParams.toString();

  return path + (searchString ? '?' + searchParams.toString() : '');
}

/** @typedef {import('@shopify/hydrogen/storefront-api-types').SelectedOption} SelectedOption */
