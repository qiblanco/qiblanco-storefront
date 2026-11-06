/*
 * LOADER DER BLACK-FRIDAY-SEITEN 2026 (s04). Server-only: die freigegebenen Sätze
 * der Kaufseiten kommen aus deren Datenstellen (wortgleich, keine zweite Kopie) und
 * reisen als Loaderdaten. Das hält die Sammelroute products.$handle.jsx für alle
 * anderen Produkte klein.
 *
 * Eine fehlgeschlagene Produktabfrage ist kein „ausverkauft“: produkte bleibt
 * leer, und der Knopf sagt „Gerade nicht verfügbar“.
 */
import {BF2026, bf2026Jetzt} from '~/data/black-friday-2026';
import {BF2026_BILDER} from '~/components/black-friday-2026/bf2026-texte';
import * as QIONE from '~/components/product-pages/qione-2-pro-alpha-daten';
import * as QIHOME from '~/components/product-pages/qihome-air-alpha-daten';
import * as QIBRACELET from '~/components/product-pages/qibracelet-alpha-daten';
import * as KETTE_DATEN from '~/components/product-pages/qione-kette-alpha-daten';

const BF2026_PRODUKTE_QUERY = `#graphql
  query Bf2026Produkte($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    qihome: product(handle: "qihome-air") { ...Bf2026Produkt }
    qibracelet: product(handle: "qibracelet") { ...Bf2026Produkt }
    qione: product(handle: "qione-2-pro") { ...Bf2026Produkt }
    kette: product(handle: "qione-kette") { ...Bf2026Produkt }
  }
  fragment Bf2026Produkt on Product {
    id
    handle
    title
    vendor
    images(first: 8) { nodes { url altText width height } }
    variants(first: 20) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { __typename id url altText width height }
        product { title handle }
      }
    }
  }
`;

async function ladeProdukte(storefront) {
  try {
    const d = await storefront.query(BF2026_PRODUKTE_QUERY, {
      // PREIS FRISCH wie die Kaufseiten (lib/produkt-seite-laden.server.js).
      cache: storefront.CacheShort(),
    });
    const produkte = {};
    for (const p of [d?.qihome, d?.qibracelet, d?.qione, d?.kette]) {
      if (p?.handle) produkte[p.handle] = p;
    }
    return produkte;
  } catch (fehler) {
    console.error('bf2026: Produktabfrage fehlgeschlagen', fehler);
    return {};
  }
}

/** Ein Kapitel der Kaufseite als Bild-Text-Band; fehlt es, entfällt das Band. */
function band(daten, titel, produkt, ersatzBild) {
  const k = daten.WISSEN?.kapitel?.find((x) => x.titel === titel);
  if (!k) return null;
  const nr = Number.isInteger(k.bild) ? k.bild : null;
  const b = nr !== null ? produkt?.images?.nodes?.[nr] : null;
  const bild = b
    ? {url: b.url, alt: b.altText ?? '', breite: b.width, hoehe: b.height}
    : ersatzBild;
  return {etikett: k.etikett, titel: k.titel, text: k.absaetze, bild};
}

/** Fragen der Kaufseite ohne Platzhalter (kein {preis}, keine Rate). */
function fragen(daten, anzahl) {
  return (daten.FAQ?.fragen ?? [])
    .filter((x) => !`${x.f} ${x.a}`.includes('{'))
    .slice(0, anzahl);
}

/** Vertrauenszeilen unter dem Kaufknopf: die der Kaufseite. */
function vertrauen(daten) {
  const z = daten.ZUSAMMENFASSUNG;
  return [...(z?.zeilen ?? []), ...(z?.ruecknahme ? [z.ruecknahme] : [])];
}

const INHALT = {
  qihome: (p) => ({
    drehung: 'qihome',
    faqTitel: 'Deine Fragen zum QiHome® Air.',
    vertrauen: vertrauen(QIHOME),
    baender: [band(QIHOME, 'Hinstellen. Fertig.', p['qihome-air'], BF2026_BILDER.qihome)],
    fragen: fragen(QIHOME, 3),
  }),
  qibracelet: (p) => ({
    drehung: 'qibracelet',
    faqTitel: 'Deine Fragen zum QiBracelet®.',
    vertrauen: vertrauen(QIBRACELET),
    baender: [band(QIBRACELET, 'Gleiche Leistung wie der QiOne® 2 Pro.', p.qibracelet, BF2026_BILDER.qibracelet)],
    fragen: fragen(QIBRACELET, 3),
  }),
  'qione-2x': (p) => ({
    drehung: null,
    faqTitel: 'Deine Fragen zum QiOne® 2 Pro.',
    vertrauen: vertrauen(QIONE),
    baender: [band(QIONE, 'Ruhig schlafen, egal was unter dir liegt.', p['qione-2-pro'], BF2026_BILDER['qione-2x'])],
    fragen: fragen(QIONE, 3),
  }),
  'qione-kette': (p) => ({
    drehung: null,
    faqTitel: 'Deine Fragen zu QiOne® 2 Pro und Kette.',
    vertrauen: vertrauen(QIONE),
    baender: [band(KETTE_DATEN, KETTE_DATEN.WISSEN?.kapitel?.[0]?.titel, p['qione-kette'], BF2026_BILDER['qione-kette'])],
    fragen: fragen(QIONE, 3),
  }),
};

function basis({request}, modus) {
  const {ms, gepinnt} = bf2026Jetzt({modus, url: request.url});
  return {modus, jetztMs: ms, gepinnt};
}

export async function bf2026LandingLaden(args, modus) {
  const produkte = await ladeProdukte(args.context.storefront);
  return {...basis(args, modus), art: 'landing', pfad: BF2026.landing.pfad, produkte};
}

export async function bf2026AngebotLaden(args, modus, angebot) {
  const produkte = await ladeProdukte(args.context.storefront);
  const inhalt = INHALT[angebot.key](produkte);
  return {
    ...basis(args, modus),
    art: 'angebot',
    pfad: `/products/${angebot.url_handle}`,
    angebot,
    produkte,
    inhalt: {...inhalt, baender: inhalt.baender.filter(Boolean)},
  };
}
