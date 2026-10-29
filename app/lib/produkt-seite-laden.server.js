/**
 * EINE LADEFUNKTION FÜR A UND B der Kaufseiten /products/qione-2-pro,
 * /products/qihome-air und /products/qibracelet (Grossjob 20261027-GROSSJOB-
 * apple-konfigurator-qione-qihome-qibracelet-ab, s05, KONZEPT §4).
 *
 *   A  /products/<h>    trägt den Konfigurator, sobald KONFIGURATOR_<X>=on
 *   B  /products/<h>-b  die heutige Seite, noindex, Kanonische auf A
 *
 * Beide Routen rufen GENAU diese Funktion. Mit `konfigurator: false` liefert
 * sie dieselben Loaderdaten wie die Kaufseite vor s05 (product, marktLand,
 * vergleichsPreise): der Rumpf ist der bisherige loadCriticalData der drei
 * Routen, Schlüssel für Schlüssel. Erst mit `konfigurator: true` kommen die
 * Ketten dazu (nur wenn die Produktdaten eine Kette führen), und das Feld
 * `konfigurator` sagt der Seite, dass sie das Gerüst rendert.
 *
 * RÜCKWEG in einem Handgriff (Oxygen-Env, kein Deploy): KONFIGURATOR_<X>
 * auf etwas anderes als 'on' -> die A-Route rendert die heutige Seite für
 * 100 %. Der A/B-Test hat seinen eigenen Kill (EXP_KONFIG_<X>_MODE=off, lib/
 * experiment-weiche.server.js).
 */
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ladeVergleichsPreise} from '~/components/reusables/amazonstil-daten';
import {ladeAlphaKetten} from '~/components/product-pages/AlphaVorlage';

/** Schalter je Produkt (Env). Nur der Wert 'on' schaltet das Gerüst ein. */
export const KONFIGURATOR_SCHALTER = Object.freeze({
  'qione-2-pro': 'KONFIGURATOR_QIONE_2_PRO',
  'qihome-air': 'KONFIGURATOR_QIHOME_AIR',
  qibracelet: 'KONFIGURATOR_QIBRACELET',
  // s13 (Christian Zx 29.10.2026): weitere Shop-Seiten im Apple-Stil.
  'qione-kette': 'KONFIGURATOR_QIONE_KETTE',
});

/** true nur, wenn der Schalter des Produkts genau 'on' ist (Default AUS). */
export function konfiguratorAn(env, handle) {
  const name = KONFIGURATOR_SCHALTER[handle];
  return Boolean(name && env && env[name] === 'on');
}

/**
 * @param {{context: object, request: Request}} args
 * @param {{handle: string, query: string, daten?: object|null, konfigurator?: boolean}} opt
 */
export async function ladeProduktSeite({context, request}, {handle, query, daten = null, konfigurator = false}) {
  const {storefront} = context;

  const [{product}, vergleichsPreise, ketten] = await Promise.all([
    storefront.query(query, {
      // PREIS FRISCH, nicht streichen: ohne `cache` nimmt Hydrogen CacheDefault
      // (SWR 24 h), dann zeigt die Seite nach einer Preis- oder Kursaenderung bis
      // zu 24 h den alten Betrag (PL 13.10.: Seite 4.861 zl, Kasse 4.847 zl).
      // Grossjob 20261004-GROSSJOB-preisanzeige-netto-brutto-rundung-alle-shops-waehrungen s09/s12-r2;
      // Probe homepage-bauer/pruefungen/probe_preisabfrage_cache_kurz.py.
      cache: storefront.CacheShort(),
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
    // Preise der drei Geräte für den Gerätevergleich, parallel zur Kaufbox
    // und aus demselben Variantenfeld (amazonstil-daten.js). Fail-soft;
    // null = Vergleich aus, dann fragt niemand.
    ladeVergleichsPreise(storefront),
    // Ketten-Kacheln des Konfigurators. FAIL-SOFT: scheitert die Abfrage,
    // entfällt nur der Schritt, der Kauf des Geräts bleibt heil.
    konfigurator && daten?.KETTE ? ladeAlphaKetten(storefront, daten) : null,
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
    // Markt-Land für die Produkt-Auszeichnung: `meta()` hat keinen Kontext,
    // und der ausgezeichnete Preis muss derselbe sein wie der sichtbare
    // (AT 20 statt 19 %). Job 20260913-at-paketkarte-rechnet-19-prozent-
    // kasse-nimmt-20-prio8.
    marktLand: storefront.i18n.country,
    // Nur bei eingeschaltetem Vergleich: aus heißt auch ohne Schlüssel in
    // den Loaderdaten, die Seite ist dann byte-gleich zum Stand vor s04.
    ...(vergleichsPreise ? {vergleichsPreise} : {}),
    // Nur mit Konfigurator: aus heißt ohne Schlüssel, Loaderdaten wie heute.
    ...(konfigurator ? {konfigurator: true} : {}),
    ...(konfigurator && ketten ? {ketten} : {}),
  };
}
