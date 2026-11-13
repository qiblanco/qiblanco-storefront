/*
 * DEAL-PREIS IM LAND DES BESUCHERS (Job 20261113-deal-ruecklaeufer-seite-zeigt-
 * eur-in-ch-pl-se-cz, Christian-Auftrag aus Grossjob 20261004 preisanzeige:
 * „sichtbarer Preis je Markt in Landeswährung, gleich dem Kassenbetrag“).
 *
 * LAGE: Seit Elinas Notfall EL-20261113-5ea5fb42 laufen die Deal-Adressen in
 * jedem Land im Markt DE (lib/context.js, bfDealPfadImDeutschShop), damit sie
 * überall erreichbar sind. Die Seite nannte darum auch in CH, PL, SE, CZ den
 * Euro-Preis („1.976 €“). Der Kaufknopf legt die Deal-Zeilen aber über /cart
 * in den Warenkorb des Besucher-Landes, und dort rechnet Shopify in
 * Landeswährung: Listenpreis des Markts minus BF-Code, den Shopify per Kurs
 * umrechnet. Gemessen 13.11.2026 (Storefront-Cart-API, Zeilen + Code
 * BF26-PRO-13GLX): 2x QiOne 2 Pro CH 2.079,08 CHF, PL 8.883,88 PLN,
 * SE 22.355,92 SEK, CZ 49.180,12 CZK; DE 1.976 €.
 *
 * WAS DIESE DATEI TUT: außerhalb von DE fragt der Loader den Warenkorb, was
 * genau diese Deal-Zeilen mit genau diesen Codes im Land des Besuchers kosten
 * (Hausweg wie lib/cacao-pricing.js, Staffel-Kasse: den Kurs gibt die
 * Storefront-API nicht heraus, die Rundung ist nicht nachzubauen). Die Seite
 * nennt dann diesen Betrag. DE bleibt unverändert (Preise aus bf-deals-daten).
 *
 * WAS ENTSTEHT: je Land und Deal ein Warenkorb über die Storefront-API, ohne
 * Kunde, ohne Kasse, ohne Cookie für den Besucher; Shopify verwirft ihn nach
 * Ablauf. Merkmal `_messung` unterscheidet ihn von einem Kundenwarenkorb.
 * Ablage je Land+Deal ABLAGE_MS im Speicher, Frist FRIST_MS.
 *
 * FAIL-CLOSED AUF DEN STAND DAVOR: Fehler, Frist, Code nicht anwendbar,
 * fehlende Zeile -> null. Die Seite nennt dann wie bisher den Euro-Preis.
 */
import {bfDeal, bfDealZeilen} from './bf-deals-daten.js';
import {bfDealCodes} from './bf-deal-codes.server.js';

/** Wie lange ein gelesener Warenkorb-Betrag gilt (Wechselkurse wandern). */
const ABLAGE_MS = 15 * 60 * 1000;
/** Längste Wartezeit des Seitenaufbaus auf den Warenkorb. */
const FRIST_MS = 1500;
/** Obergrenze der Ablage (5 Deals x wenige Länder). */
const ABLAGE_MAX = 128;
/** Höchstens so viele Kettenlängen/Größen probieren (ausverkaufte fallen weg). */
const VERSUCHE_MAX = 3;

const ablage = new Map();

// Bewusst ohne #graphql-Kennung (wie cacao-pricing STAFFEL_SET_QUERY): gehört
// nicht in die Codegen-Typen.
const DEAL_KASSE_MUTATION = `
  mutation BfDealLandesPreis(
    $lines: [CartLineInput!]!
    $codes: [String!]
    $land: CountryCode!
  ) {
    cartCreate(
      input: {
        lines: $lines
        discountCodes: $codes
        buyerIdentity: {countryCode: $land}
        attributes: [{key: "_messung", value: "bf-deal-landespreis"}]
      }
    ) {
      cart {
        totalQuantity
        discountCodes {
          code
          applicable
        }
        lines(first: 5) {
          nodes {
            quantity
            cost {
              totalAmount {
                amount
                currencyCode
              }
              amountPerQuantity {
                amount
                currencyCode
              }
              compareAtAmountPerQuantity {
                amount
                currencyCode
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function mitFrist(versprechen, ms) {
  let uhr;
  const frist = new Promise((_, ablehnen) => {
    uhr = setTimeout(() => ablehnen(new Error('bf-landespreis: Frist')), ms);
  });
  return Promise.race([versprechen, frist]).finally(() => clearTimeout(uhr));
}

/**
 * Kandidaten für die Kaufknopf-Wahl des Deals, in Seitenreihenfolge: fester
 * Link, je Kettenlänge, je Variante. Jede Wahl ergibt dieselben Zeilen wie
 * der Kaufknopf (bfDealZeilen).
 */
export function dealWahlen(seite) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal) return [];
  if (seite.link || deal.link) return [null];
  if (deal.linkJeLaenge) {
    return Object.keys(deal.linkJeLaenge).map((cm) => [
      {attributes: [{key: 'Kettenlänge', value: `${cm} cm`}]},
    ]);
  }
  if (deal.linkJeVariante) {
    return Object.keys(deal.linkJeVariante).map((id) => [
      {merchandiseId: `gid://shopify/ProductVariant/${id}`},
    ]);
  }
  return [];
}

/**
 * Betrag und Streichbetrag aus einer cartCreate-Antwort, oder Fehler.
 * Preis = Summe der Zeilenbeträge nach Rabatt (wie die Kasse), Streichpreis =
 * Summe der Vergleichspreise (ohne Vergleichspreis: Stückpreis) mal Menge.
 * @returns {{preis: number, uvp: number, waehrung: string}}
 */
export function auswerten(antwort, zeilen, codes) {
  const ergebnis = antwort?.cartCreate;
  if (ergebnis?.userErrors?.length) {
    throw new Error(`bf-landespreis: ${ergebnis.userErrors[0]?.message}`);
  }
  const cart = ergebnis?.cart;
  const menge = zeilen.reduce((s, z) => s + (z.quantity || 0), 0);
  if (!cart || cart.totalQuantity !== menge) {
    throw new Error('bf-landespreis: Warenkorb trägt nicht alle Deal-Zeilen');
  }
  const angewandt = (cart.discountCodes ?? []).filter((c) => c.applicable);
  if (codes.length && angewandt.length !== codes.length) {
    throw new Error('bf-landespreis: BF-Code im Land nicht anwendbar');
  }
  let preis = 0;
  let uvp = 0;
  let waehrung = null;
  for (const n of cart.lines?.nodes ?? []) {
    const gesamt = n.cost?.totalAmount;
    const stueck = n.cost?.compareAtAmountPerQuantity ?? n.cost?.amountPerQuantity;
    const a = Number.parseFloat(gesamt?.amount);
    const v = Number.parseFloat(stueck?.amount);
    if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(v)) {
      throw new Error('bf-landespreis: Zeile ohne Betrag');
    }
    if (waehrung && (gesamt.currencyCode !== waehrung || stueck.currencyCode !== waehrung)) {
      throw new Error('bf-landespreis: gemischte Währung');
    }
    waehrung = gesamt.currencyCode;
    preis += a;
    uvp += v * n.quantity;
  }
  if (!waehrung) throw new Error('bf-landespreis: leerer Warenkorb');
  const cent = (x) => Math.round(x * 100) / 100 + 0;
  return {preis: cent(preis), uvp: cent(Math.max(uvp, preis)), waehrung};
}

/**
 * Deal-Preis im Land: {preis, uvp, waehrung} oder null (DE, kein Deal,
 * Fehler, Frist). Wirft nie.
 */
export async function bfDealLandesPreis(storefront, seite, land, optionen = {}) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal || !land || land === 'DE' || !storefront?.mutate) return null;
  const jetzt = optionen.jetzt ?? Date.now();
  const schluessel = `${land}|${deal.id}`;
  const alt = ablage.get(schluessel);
  if (alt && jetzt - alt.zeit < ABLAGE_MS) return alt.wert;
  const codes = bfDealCodes(deal.id, jetzt);
  try {
    let wert = null;
    let letzterFehler = null;
    for (const wahl of dealWahlen(seite).slice(0, VERSUCHE_MAX)) {
      const zeilen = bfDealZeilen(seite, wahl);
      if (!zeilen.length) continue;
      try {
        const antwort = await mitFrist(
          storefront.mutate(DEAL_KASSE_MUTATION, {
            variables: {lines: zeilen, codes, land},
          }),
          optionen.fristMs ?? FRIST_MS,
        );
        wert = auswerten(antwort, zeilen, codes);
        break;
      } catch (e) {
        letzterFehler = e;
        if (String(e?.message).includes('Frist')) break;
      }
    }
    if (!wert) throw letzterFehler ?? new Error('bf-landespreis: keine Deal-Zeilen');
    if (ablage.size >= ABLAGE_MAX) ablage.clear();
    ablage.set(schluessel, {zeit: jetzt, wert});
    return wert;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`bf-landespreis ${schluessel}: ${e?.message ?? e} -> Euro-Preis (Stand davor)`);
    return null;
  }
}

/**
 * Preis und Streichpreis des Landes in die Produktdaten schreiben (jede
 * Variante im Baum, wie bfDealPreiseSetzen). Erwartet die Euro-Deal-Preise.
 */
export function bfDealLandesPreiseSetzen(product, landesPreis) {
  if (!product || !landesPreis) return product;
  const {preis, uvp, waehrung} = landesPreis;
  const neu = (wert, tiefe = 0) => {
    if (tiefe > 8 || wert === null || typeof wert !== 'object') return wert;
    if (Array.isArray(wert)) return wert.map((x) => neu(x, tiefe + 1));
    const kopie = {};
    for (const [k, v] of Object.entries(wert)) kopie[k] = neu(v, tiefe + 1);
    if (kopie.price?.amount !== undefined && kopie.price?.currencyCode === 'EUR') {
      kopie.price = {...kopie.price, amount: String(preis), currencyCode: waehrung};
      kopie.compareAtPrice = {amount: String(uvp), currencyCode: waehrung};
    }
    return kopie;
  };
  return neu(product);
}

/** Nur für Tests: Ablage leeren. */
export function _ablageLeeren() {
  ablage.clear();
}
