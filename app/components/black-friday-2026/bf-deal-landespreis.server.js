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
 * KAKAO (Job 20261113-deal-landespreis-rest-bf-deals-kakao-no): der Kakao-Deal
 * legt seit Elina EL-20261112-5c71f6ff die Set-Variante mit Merkmal _bf_deal
 * in den Qi-Blanco-Warenkorb (nicht mehr crystal-cacao.com), den Code setzt der
 * Server. Gemessen 13.11.2026 (Set + BF26-KAKAO-NKSKX): DE 76 €, CH 80,54 CHF,
 * PL 342,10 PLN, US/NO 107,14 USD. Darum gilt derselbe Weg; Zeilen aus
 * bfKakaoZeilen, je Set eine Ablage (seite.set).
 *
 * FAIL-CLOSED AUF DEN STAND DAVOR: Fehler, Frist, Code nicht anwendbar,
 * fehlende Zeile -> null. Die Seite nennt dann wie bisher den Euro-Preis.
 */
import {
  BF_KAKAO_SETS,
  andereDeals,
  bfDeal,
  bfDealZeilen,
  bfKakaoZeilen,
} from './bf-deals-daten.js';
import {bfDealCodes} from './bf-deal-codes.server.js';

/**
 * Wie lange ein gelesener Warenkorb-Betrag gilt. Kurz wie CacheShort der
 * übrigen Produktseiten (1 s + 9 s): Shopify verschiebt den Umrechnungskurs
 * mehrmals am Tag, und die Kasse rechnet immer mit dem aktuellen. Gemessen
 * 13.11.2026, 2x QiOne CH: 12:17Z 2.078,94 CHF, 13:01Z 2.102,98 CHF,
 * 13:12Z 2.102,76 CHF. Mit 15 min Ablage nannte die Seite um 13:05Z noch den
 * alten Betrag (Abnahme rot); mit 10 s ist das Fenster unter 1 %.
 */
const ABLAGE_MS = 10 * 1000;
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

// Einzelpackungs-Preise des Landes (Streichpreis des Kakao-Deals). Wie
// DEAL_KASSE_MUTATION ohne #graphql-Kennung.
const KAKAO_EINZEL_QUERY = `
  query BfKakaoEinzel($ids: [ID!]!, $land: CountryCode!)
  @inContext(country: $land) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        price {
          amount
          currencyCode
        }
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
 * Warenkorbzeilen je Kaufknopf-Wahl, in Seitenreihenfolge. Kakao: die Zeile des
 * gewählten Sets (seite.set), ohne Wahl die Sets in Seitenreihenfolge.
 */
export function dealZeilenListe(seite) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal) return [];
  if (deal.id === 'kakao') {
    const ids = seite.set ? [seite.set] : BF_KAKAO_SETS.map((s) => s.id);
    return ids.map((id) => bfKakaoZeilen(id)).filter((z) => z.length);
  }
  return dealWahlen(seite)
    .map((wahl) => bfDealZeilen(seite, wahl))
    .filter((z) => z.length);
}

/**
 * Streichpreis des Kakao-Deals im Land: Summe der Einzelpackungen, die das Set
 * enthält (Kauf 2, zahl 1: DE 76 + 76 = 152 €, CH 78 + 77 = 155 CHF). Die
 * Einzelpackungen stehen im Link des Sets (Variante:Menge).
 */
export function kakaoEinzelZeilen(setId) {
  const set = BF_KAKAO_SETS.find((x) => x.id === setId) ?? BF_KAKAO_SETS[0];
  return String(set.link ?? '')
    .replace(/^.*\/cart\//, '')
    .split(',')
    .map((teil) => teil.split(':'))
    .filter(([id]) => /^\d+$/.test(id))
    .map(([id, menge]) => ({id: `gid://shopify/ProductVariant/${id}`, menge: Number.parseInt(menge ?? '1', 10) || 1}));
}

export function kakaoUvp(antwort, setId, waehrung) {
  const preise = new Map();
  for (const n of antwort?.nodes ?? []) {
    if (n?.id) preise.set(n.id, n.price);
  }
  let summe = 0;
  const zeilen = kakaoEinzelZeilen(setId);
  if (!zeilen.length) throw new Error('bf-landespreis: Kakao-Set ohne Einzelpackungen');
  for (const {id, menge} of zeilen) {
    const p = preise.get(id);
    const betrag = Number.parseFloat(p?.amount);
    if (!Number.isFinite(betrag) || betrag <= 0 || p.currencyCode !== waehrung) {
      throw new Error('bf-landespreis: Einzelpreis fehlt oder andere Währung');
    }
    summe += betrag * menge;
  }
  return Math.round(summe * 100) / 100;
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
    const einzeln = n.cost?.compareAtAmountPerQuantity ?? n.cost?.amountPerQuantity;
    const a = Number.parseFloat(gesamt?.amount);
    const v = Number.parseFloat(einzeln?.amount);
    if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(v)) {
      throw new Error('bf-landespreis: Zeile ohne Betrag');
    }
    if (waehrung && (gesamt.currencyCode !== waehrung || einzeln.currencyCode !== waehrung)) {
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
 * BF-STAND DES STREICHPREISES (Job 20261113-folge-bf-dealseite-auslandsansicht-
 * streichpreis-halten-qione2pro-prio1; Christian CW-20261113-bb47c38d „Kein
 * Einfluss auf BF“, Elina EL-20261113-a7edaf0e „Erst mal so belassen“).
 *
 * LAGE: Am 13.11. bekam QiOne 2 Pro einen neuen Grundpreis (1.214 €) und
 * Streichpreis (1.349 €), die BF-Codes wurden um die Differenz erhöht. Der
 * Endpreis blieb überall gleich. auswerten() liest den Streichpreis aber aus
 * dem Shopify-Streichpreis der Warenkorbzeilen: in AT stand darum 2 x 1.349 =
 * 2.698 € statt 2.476 € (Du sparst 722 € statt 500 €).
 *
 * REGEL (gilt für die Alpha-Deals, nicht für Kakao):
 * - Euro-Land: Streichpreis = deal.uvp aus bf-deals-daten (2.476 / 1.332 €), wie DE.
 * - Schweiz (CHF): unverändert der Shopify-Streichpreis (Elina: „so lassen“).
 * - andere Währung: deal.uvp x Landes-Endpreis / deal.preis, auf die ganze
 *   Einheit gerundet. Das ist das BF-Verhältnis (2.476 : 1.976) auf den Betrag,
 *   den die Kasse im Land nimmt. Es braucht keinen Basis-Streichpreis und
 *   keinen Kurs. Gemessen 13.11.: bei nicht neu bepreisten Deals trifft es den
 *   Shopify-Streichpreis genau (QiBracelet PL 7.095, SE 17.882; QiHome PL
 *   22.403, CZ 124.120).
 * Der Endpreis kommt immer aus dem Warenkorb; nie unter dem Endpreis.
 */
export function bfStandStreichpreis(deal, gelesen) {
  if (!deal || deal.id === 'kakao' || !gelesen) return gelesen;
  const {preis, waehrung} = gelesen;
  if (waehrung === 'CHF') return gelesen;
  if (!(deal.uvp > 0) || !(deal.preis > 0)) return gelesen;
  const uvp = waehrung === 'EUR' ? deal.uvp : Math.round((preis * deal.uvp) / deal.preis);
  return {...gelesen, uvp: Math.max(uvp, preis)};
}

/**
 * Deal-Preis im Land: {preis, uvp, waehrung} oder null (DE, kein Deal,
 * Fehler, Frist). Wirft nie.
 */
export async function bfDealLandesPreis(storefront, seite, land, optionen = {}) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal || !land || land === 'DE' || !storefront?.mutate) return null;
  const jetzt = optionen.jetzt ?? Date.now();
  const schluessel = `${land}|${deal.id}${seite.set ? `|${seite.set}` : ''}`;
  const alt = ablage.get(schluessel);
  if (alt && jetzt - alt.zeit < ABLAGE_MS) return alt.wert;
  const codes = bfDealCodes(deal.id, jetzt);
  try {
    let wert = null;
    let letzterFehler = null;
    for (const zeilen of dealZeilenListe(seite).slice(0, VERSUCHE_MAX)) {
      try {
        const antwort = await mitFrist(
          storefront.mutate(DEAL_KASSE_MUTATION, {
            variables: {lines: zeilen, codes, land},
          }),
          optionen.fristMs ?? FRIST_MS,
        );
        let gelesen = bfStandStreichpreis(deal, auswerten(antwort, zeilen, codes));
        if (deal.id === 'kakao') {
          // Streichpreis = Einzelpackungen im Land (Kauf 2, zahl 1), nicht der Set-Preis.
          const einzel = await mitFrist(
            storefront.query(KAKAO_EINZEL_QUERY, {
              variables: {
                ids: kakaoEinzelZeilen(seite.set).map((z) => z.id),
                land,
              },
              cache: storefront.CacheShort?.(),
            }),
            optionen.fristMs ?? FRIST_MS,
          );
          gelesen = {
            ...gelesen,
            uvp: Math.max(kakaoUvp(einzel, seite.set, gelesen.waehrung), gelesen.preis),
          };
        }
        wert = gelesen; // erst nach allen Prüfungen: ein Teilergebnis gilt nie
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
 * Deal-Preise mehrerer Deals im Land, parallel (eigener Deal + Galerie
 * „andere Deals“). -> {dealId: {preis, uvp, waehrung}} nur für Deals mit
 * Ergebnis; fehlt ein Deal, nennt seine Kachel den Euro-Preis wie bisher.
 */
export async function bfDealLandesPreise(storefront, dealIds, land, optionen = {}) {
  if (!land || land === 'DE') return {};
  const ids = [...new Set(dealIds ?? [])];
  const werte = await Promise.all(
    ids.map((id) => bfDealLandesPreis(storefront, {deal: id}, land, optionen)),
  );
  const out = {};
  ids.forEach((id, i) => {
    if (werte[i]) out[id] = werte[i];
  });
  return out;
}

/**
 * Kakao-Preise je Set im Land, parallel -> {setId: {preis, uvp, waehrung}};
 * fehlt ein Set, nennt es den Euro-Preis wie bisher. DE: {} ohne Abruf.
 */
export async function bfKakaoSetPreise(storefront, land, optionen = {}) {
  if (!land || land === 'DE') return {};
  const werte = await Promise.all(
    BF_KAKAO_SETS.map((s) =>
      bfDealLandesPreis(storefront, {deal: 'kakao', set: s.id}, land, optionen),
    ),
  );
  const out = {};
  BF_KAKAO_SETS.forEach((s, i) => {
    if (werte[i]) out[s.id] = werte[i];
  });
  return out;
}

/**
 * Landesdaten der Kakao-Deal-Seite (Loader products.$handle ladeBfDealKakao):
 * Preis je Set (Kaufbox, Kaufleiste), Preis des vorgewählten Sets
 * (Schluss-Banner) und Galerie „andere Deals“. null in DE oder ohne Ergebnis:
 * die Seite bleibt wie bisher.
 * @returns {Promise<{landesPreis: object|null, landesPreise: object,
 *   kakaoSetPreise: object}|null>}
 */
export async function bfKakaoLandesDaten(storefront, seite, land, optionen = {}) {
  if (!seite || !land || land === 'DE') return null;
  const [kakaoSetPreise, landesPreise] = await Promise.all([
    bfKakaoSetPreise(storefront, land, optionen),
    bfDealLandesPreise(
      storefront,
      andereDeals(seite).map((d) => d.id),
      land,
      optionen,
    ),
  ]);
  if (!Object.keys(kakaoSetPreise).length && !Object.keys(landesPreise).length) {
    return null;
  }
  return {
    landesPreis: kakaoSetPreise[seite.set] ?? null,
    landesPreise,
    kakaoSetPreise,
  };
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
