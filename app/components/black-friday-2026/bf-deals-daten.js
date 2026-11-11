/*
 * BF-DEAL-SEITEN DE (Elina EL-20261111-aff06215, GO 11.11.2026): EINE Datenstelle
 * für Preis, Streichpreis, Warenkorb-Link und Galerie-Kachel je Deal.
 *
 * Preise wörtlich nach Elinas Preisliste EL-20261111-4f071c31: Preis = BF-Preis,
 * Streichpreis = UVP. Die Warenkorb-Links sind die in der echten Kasse
 * gemessenen Links (EL-20261111-4f071c31, BF2026-Preispruefung-Warenkorb.csv):
 * Einzelprodukte + BF-Code, Endpreis = BF-Preis. Kette M und XL sind
 * ausverkauft und tragen bewusst KEINEN Link (die Kette fiele aus dem
 * Warenkorb, die Kasse nähme 1.087 €).
 *
 * Die Bundle-Produkte hinter den Deal-Adressen bleiben Entwurf bzw. archiviert
 * (Elina EL-20261111-9065b985). Darum rendert die Deal-Adresse die Seite des
 * BASISPRODUKTS (`basis`) mit den Preisen von hier.
 *
 * Zeitfenster: bis Ende der Codes, 30.11.2026 23:59 Berlin. Danach liefern die
 * Deal-Handles wieder 404 (Shopify-Weiterleitung wie vorher), und
 * 8kendiw34hd / pjdz538hgs0 zeigen wieder ihre normale Seite.
 *
 * Bilder: dieselben Shopify-Dateien wie die Kacheln auf /pages/bf-deals-b.
 */

export const BF_DEAL_ENDE = '2026-11-30T22:59:59Z';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/** Kachel-Gruppen der Galerie, in der Reihenfolge von bf-deals. */
export const BF_DEALS = [
  {
    id: '2x-qione-2-pro',
    name: '2x QiOne® 2 Pro',
    rabatt: '−500 €',
    preis: 1976,
    uvp: 2476,
    bild: CDN + 'bundle-2x-qione-2-pro.webp',
    bildAlt: 'Zwei QiOne® 2 Pro Anhänger nebeneinander',
    seite: 'jhsdhze783',
    link: '/cart/39680087326790:2?discount=BF26-2XPRO-HDRSN',
  },
  {
    id: 'qione-2-pro-necklace',
    name: 'QiOne® 2 Pro + Necklace',
    rabatt: '−250 €',
    preis: 1082,
    uvp: 1332,
    bild: CDN + 'bundle-qione-2-pro-necklace.webp',
    bildAlt: 'QiOne® 2 Pro Anhänger mit Kette',
    seite: '734husd8hh',
    // Je Kettenlänge (cm) der Link mit der Kette dieser Größe. M (50) und XL (75)
    // ausverkauft: kein Link, die Seite sperrt die Länge.
    linkJeLaenge: {
      40: '/cart/39680087326790:1,39285852176454:1?discount=BF26-PROKETTE-PMB52',
      45: '/cart/39680087326790:1,31887553396806:1?discount=BF26-PROKETTE-PMB52',
      60: '/cart/39680087326790:1,31887553429574:1?discount=BF26-PROKETTE-PMB52',
    },
  },
  {
    id: 'qibracelet',
    name: 'QiBracelet®',
    rabatt: '−200 €',
    preis: 1378,
    uvp: 1578,
    bild: CDN + 'QiBracelet1.webp',
    bildAlt: 'QiBracelet® Armreif',
    seite: '687ghgf4ed',
    // Je Variante (Shopify-Varianten-Nummer von qibracelet S/M/L).
    linkJeVariante: {
      43666904056076: '/cart/43666904056076:1?discount=BF26-BRACELET-GM5JJ',
      43666904088844: '/cart/43666904088844:1?discount=BF26-BRACELET-GM5JJ',
      43673322160396: '/cart/43673322160396:1?discount=BF26-BRACELET-GM5JJ',
    },
  },
  {
    id: 'qihome-air',
    name: 'QiHome® Air',
    rabatt: '−400 €',
    preis: 4583,
    uvp: 4983,
    bild: CDN + 'QiHome1.webp',
    bildAlt: 'QiHome® Air',
    seite: '56huz67dds',
    link: '/cart/32238705967174:1?discount=BF26-QIHOME-2DP8H',
  },
  {
    id: 'kakao',
    name: 'Crystal Cacao · Awake & Create',
    rabatt: '−76 €',
    preis: 76,
    uvp: 152,
    bild: CDN + 'crystal-cacao-set-awake-create-dunkel-gold-4x3.webp',
    bildAlt: 'Crystal Cacao Awake und Create, zwei Kakao-Packungen im Set',
    seite: 'awcr37shyj',
  },
];

/**
 * Deal-Seiten: Handle unter /products/ -> Deal. `basis` ist das Produkt, dessen
 * Seite gerendert wird, `art` die Fassung (alpha-angebot, alpha-qibracelet,
 * alpha-qihome, standard).
 */
// 8kendiw34hd und pjdz538hgs0 (die bisherigen Ziele der Weiterleitung) stehen
// noch NICHT in dieser Liste: ihre Deal-Fassung geht als eigener Schritt live
// (Folgeauftrag zu EL-20261111-aff06215): Route verdrahten wie
// products.$handle.jsx (bfDealSeite -> ladeBfDealAlpha -> BfDealAlpha) und hier:
//   '8kendiw34hd': {deal: '2x-qione-2-pro', basis: '8kendiw34hd', art: 'alpha-angebot'},
//   pjdz538hgs0: {deal: 'qione-2-pro-necklace', basis: 'pjdz538hgs0', art: 'alpha-angebot'},
export const BF_DEAL_SEITEN = {
  jhsdhze783: {deal: '2x-qione-2-pro', basis: '8kendiw34hd', art: 'alpha-angebot'},
  '734husd8hh': {deal: 'qione-2-pro-necklace', basis: 'pjdz538hgs0', art: 'alpha-angebot'},
  '687ghgf4ed': {deal: 'qibracelet', basis: 'qibracelet', art: 'alpha-qibracelet'},
  '56huz67dds': {deal: 'qihome-air', basis: 'qihome-air', art: 'alpha-qihome'},
  awcr37shyj: {
    deal: 'kakao',
    basis: 'bundle-1x-awake-1x-create',
    art: 'standard',
    name: 'Crystal Cacao 1x Create + 1x Awake',
    link: 'https://crystal-cacao.com/cart/54540698485004:1,44685294567692:1?discount=BF26-KAKAO-NKSKX',
  },
  aw783hfn: {
    deal: 'kakao',
    basis: 'bundle-2x-awake',
    art: 'standard',
    name: 'Crystal Cacao 2x Awake',
    link: 'https://crystal-cacao.com/cart/54540698485004:2?discount=BF26-KAKAO-NKSKX',
  },
  '37cr378n': {
    deal: 'kakao',
    basis: 'mengenrabatt-2x',
    art: 'standard',
    name: 'Crystal Cacao 2x Create',
    link: 'https://crystal-cacao.com/cart/44685294567692:2?discount=BF26-KAKAO-NKSKX',
  },
};

/** true, solange die BF-Codes gelten (Ende 30.11.2026 23:59 Berlin). */
export function bfDealZeitAktiv(jetzt = Date.now()) {
  return jetzt <= Date.parse(BF_DEAL_ENDE);
}

/**
 * Deal-Seite zu einem Handle, nur im Zeitfenster; sonst null.
 * @returns {{handle: string, deal: string, basis: string, art: string} | null}
 */
export function bfDealSeite(handle, jetzt = Date.now()) {
  const s = BF_DEAL_SEITEN[handle];
  if (!s || !bfDealZeitAktiv(jetzt)) return null;
  return {handle, ...s};
}

export function bfDeal(id) {
  return BF_DEALS.find((d) => d.id === id) ?? null;
}

/**
 * Preis und Streichpreis des Deals in die Produktdaten schreiben (Loader), damit
 * jede Stelle der Seite, die aus Shopify liest (Preiszeile, Raten, Bezahlart,
 * Zusammenfassung, Kaufleiste, FAQ), denselben BF-Preis nennt. Nur in Euro:
 * die BF-Codes gelten im Global Deutsch-Shop in EUR, eine Fremdwährung behält
 * ihren Shopify-Preis.
 */
export function bfDealPreiseSetzen(product, seite) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!product || !deal) return product;
  // Jede Variante im Baum, auch die in options[].optionValues[].firstSelectableVariant
  // und adjacentVariants: die Größenwahl liest dort, und nach einem Wechsel darf
  // kein Shopify-Preis des Basisprodukts auftauchen.
  const neu = (wert, tiefe = 0) => {
    if (tiefe > 8 || wert === null || typeof wert !== 'object') return wert;
    if (Array.isArray(wert)) return wert.map((x) => neu(x, tiefe + 1));
    const kopie = {};
    for (const [k, v] of Object.entries(wert)) kopie[k] = neu(v, tiefe + 1);
    if (kopie.price?.amount !== undefined && kopie.price?.currencyCode === 'EUR') {
      kopie.price = {...kopie.price, amount: String(deal.preis)};
      kopie.compareAtPrice = {amount: String(deal.uvp), currencyCode: 'EUR'};
    }
    return kopie;
  };
  return neu(product);
}

/**
 * Gilt die Deal-Fassung für den Markt dieses Abrufs? Die BF-Codes und Links
 * gelten im Deutsch-Shop in Euro. In einem anderen Markt (z. B. USA, USD)
 * bleibt alles wie vor dem Deal: die Bundle-Adressen antworten 404 (Shopify-
 * Weiterleitung), 8kendiw34hd/pjdz538hgs0 zeigen ihre normale Seite.
 */
export function bfDealMarktPasst(product) {
  const c =
    product?.selectedOrFirstAvailableVariant?.price?.currencyCode ??
    product?.variants?.nodes?.[0]?.price?.currencyCode ??
    null;
  return c === 'EUR';
}

function variantenNummer(gid) {
  const m = /(\d+)$/.exec(String(gid ?? ''));
  return m ? m[1] : null;
}

/**
 * Warenkorb-Link des Deals zu den Zeilen des Kaufknopfs. null = für diese Wahl
 * gibt es keinen Deal-Link (z. B. ausverkaufte Kettenlänge): dann ist der
 * Knopf gesperrt, nie der normale Warenkorb des Basisprodukts.
 */
export function bfDealLink(seite, lines) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal) return null;
  if (seite.link) return seite.link;
  const zeile = Array.isArray(lines) ? lines[0] : null;
  if (deal.linkJeVariante) {
    return deal.linkJeVariante[variantenNummer(zeile?.merchandiseId)] ?? null;
  }
  if (deal.linkJeLaenge) {
    const attr = (zeile?.attributes ?? []).find((a) => a.key === 'Kettenlänge');
    const cm = attr ? Number.parseInt(attr.value, 10) : NaN;
    return deal.linkJeLaenge[cm] ?? null;
  }
  return deal.link ?? null;
}

/** Galerie-Kacheln ohne den aktuellen Deal. */
export function andereDeals(seite) {
  return BF_DEALS.filter((d) => d.id !== seite?.deal);
}
