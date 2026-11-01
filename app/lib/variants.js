import {useLocation} from 'react-router';
import {useMemo} from 'react';

/**
 * SHOPIFY-HANDLE UND SEITENPFAD SIND BEIM QI ALPHA ZWEI DINGE. Die Kaufseite
 * steht seit 2026-10-27 wieder unter /products/qi-alpha (Christian Z1
 * vom 27.10.2026), vom 26.10. bis dahin unter /products/the-alpha (Z4 vom
 * 25.10.2026: „wir gehen im link weg von qi-alpha hin zu the alpha"; Grossjob
 * 20261025-prio1-the-alpha-..., s06). In Shopify heißt das Produkt weiter
 * qi-master (ab dem Handle-Wechsel des Umbenennungs-Grossjobs qi-alpha), die
 * Add-ons ebenso. Ohne diese Karte führte jede Warenkorb-Zeile und jede
 * Produktkarte über eine 301-Hülle; mit ihr landet der Klick direkt.
 * Rückweg: Karte leeren, die 301-Hüllen tragen die alten Pfade weiter.
 */
const PFAD_HANDLE_JE_SHOPIFY_HANDLE = {
  'qi-master': 'qi-alpha',
  'qi-alpha': 'qi-alpha',
  'qi-master-wunschnummer': 'qi-alpha',
  'qi-alpha-wunschnummer': 'qi-alpha',
  'qi-master-goldkette': 'qi-alpha',
  'qi-alpha-goldkette': 'qi-alpha',
  // Inklusive Stahlkette (seit 31.10.2026, Job 20261101-prio1-qi-alpha-warenkorb-kette-...-r2):
  // es gibt sie nur mit dem Qi Alpha, ihr Tipp im Warenkorb führt deshalb dorthin.
  'qi-alpha-stahlkette': 'qi-alpha',
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
