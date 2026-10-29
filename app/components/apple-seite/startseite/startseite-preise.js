import {fallbackPreis} from '~/lib/campaign-fallback-prices';
import {useLpPreis} from '~/lib/lp-preis';

/*
 * PREIS NEBEN JEDEM KAUFKNOPF DER STARTSEITE (s04). Ein Kaufknopf ohne Preis
 * im selben Abschnitt ist ein Sicht-Tor-Befund (kaufknopf_kontext). Der Preis
 * kommt wie auf den Ad-Landingpages aus der Storefront-API (Loader) und läuft
 * durch denselben Markt-Hook (lib/lp-preis.js): Steuersatz des Landes, eine
 * Zahl auf Seite und Kasse. Fällt die Abfrage aus, gilt für den QiOne® 2 Pro
 * der zentrale Rückfallwert (lib/campaign-fallback-prices.js), die anderen
 * Geräte stehen dann ohne Preiszeile. Nie 0, nie leer.
 *
 * Das ist ein echter Preis, kein Preisanker: keine Nutzerzahl, keine Note,
 * kein Streichpreis.
 */

const PRODUKTE_QUERY = `#graphql
  fragment StartseitePreis on Product {
    handle
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
  }

  query StartseitePreise($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...StartseitePreis
    }
    bracelet: product(handle: "qibracelet") {
      ...StartseitePreis
    }
    qihome: product(handle: "qihome-air") {
      ...StartseitePreis
    }
  }
`;

/**
 * Loader-Teil: die drei Produkte mit Preis, fail-closed eine leere Liste.
 * @param {any} context Loader-Kontext (context.storefront)
 * @returns {Promise<Array<{handle: string, priceRange: any}>>}
 */
export async function startseiteProdukte(context) {
  try {
    const data = await context.storefront.query(PRODUKTE_QUERY, {
      cache: context.storefront.CacheShort(),
    });
    return [data?.qione, data?.bracelet, data?.qihome].filter(Boolean);
  } catch (fehler) {
    console.error('[preis-fallback] Startseiten-Preise fehlgeschlagen:', fehler?.message || fehler);
    return [];
  }
}

/**
 * Preiszeile je Kaufseite: {'/products/qione-2-pro': '1.087 €', …}.
 * @param {Array<any>} produkte aus startseiteProdukte()
 * @returns {Record<string, string>}
 */
export function useStartseitePreise(produkte) {
  const {preisLabelVon} = useLpPreis();
  const zeilen = {};
  for (const p of produkte || []) {
    const label = preisLabelVon(p);
    // Nur der Betrag: kein MwSt-Hinweis (Shop-Regel S1, sales-manager).
    if (label) zeilen[`/products/${p.handle}`] = label;
  }
  if (!zeilen['/products/qione-2-pro'] && !(produkte || []).length) {
    const ersatz = fallbackPreis('qione-2-pro');
    if (ersatz) zeilen['/products/qione-2-pro'] = ersatz.label;
  }
  return zeilen;
}
