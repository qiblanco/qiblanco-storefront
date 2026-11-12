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
 * Bilder (Elina EL-20261111-a9af196f + EL-20261111-83f5cc6d): die BF-Gold-Bilder
 * aus BF_GOLD_BILDER, EINE Stelle für bf-deals, Deal-Galerie und Deal-Seiten.
 * Die Originalproduktseiten behalten ihre Shopify-Bilder.
 */

export const BF_DEAL_ENDE = '2026-11-30T22:59:59Z';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/*
 * BF-GOLD-BILDER (Elina EL-20261111-a9af196f, Punkt 1): dunkler Grund mit
 * Goldlicht, 1200x1200, Shopify-Dateien DACH (Größe per ?width=). Bei 2x QiOne,
 * QiBracelet und QiHome Air die Fassung mit Dartsch-Siegel (EL-20261111-21205271).
 * Der Rand jedes Bildes ist #090806 (BF_GOLD_RAND): eine Bildfläche in anderem
 * Seitenverhältnis zeigt das Bild ganz (object-fit: contain) auf genau diesem
 * Ton, damit das Siegel unten rechts nie angeschnitten wird.
 */
export const BF_GOLD_RAND = '#090806';
export const BF_GOLD_BILDER = {
  '2x-qione-2-pro': CDN + 'mail-bf2026-2x-qione-2-pro-siegel.jpg',
  'qione-2-pro-necklace': CDN + 'mail-bf2026-qione-2-pro-necklace.jpg',
  qibracelet: CDN + 'mail-bf2026-qibracelet-siegel.jpg',
  'qihome-air': CDN + 'mail-bf2026-qihome-air-siegel.jpg',
  'kakao-awake-create': CDN + 'mail-bf2026-kakao-1x-awake-1x-create.jpg',
  'kakao-2x-awake': CDN + 'mail-bf2026-kakao-2x-awake.jpg',
  'kakao-2x-create': CDN + 'mail-bf2026-kakao-2x-create.jpg',
};
export const BF_GOLD_KANTE = 1200;

/** Kachel-Gruppen der Galerie, in der Reihenfolge von bf-deals. */
export const BF_DEALS = [
  {
    id: '2x-qione-2-pro',
    name: '2x QiOne® 2 Pro',
    rabatt: '−500 €',
    preis: 1976,
    uvp: 2476,
    bild: BF_GOLD_BILDER['2x-qione-2-pro'],
    bildAlt: 'Zwei QiOne® 2 Pro Anhänger nebeneinander',
    seite: '8kendiw34hd',
    link: '/cart/39680087326790:2?discount=BF26-2XPRO-HDRSN',
  },
  {
    id: 'qione-2-pro-necklace',
    name: 'QiOne® 2 Pro + Necklace',
    rabatt: '−250 €',
    preis: 1082,
    uvp: 1332,
    bild: BF_GOLD_BILDER['qione-2-pro-necklace'],
    bildAlt: 'QiOne® 2 Pro Anhänger mit Kette',
    seite: 'pjdz538hgs0',
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
    bild: BF_GOLD_BILDER.qibracelet,
    // Das frühere Deal-Bild (helles Shop-Foto) fällt auf der Deal-Seite weg (Elina EL-20261111-83f5cc6d).
    altBild: 'QiBracelet1.webp',
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
    bild: BF_GOLD_BILDER['qihome-air'],
    altBild: 'QiHome1.webp',
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
    bild: BF_GOLD_BILDER['kakao-awake-create'],
    bildAlt: 'Crystal Cacao Awake und Create, zwei Kakao-Packungen im Set',
    // EINE Kakao-Deal-Seite mit Set-Wahl (Elina EL-20261111-fa47cfd9, Dauerregel deal-seiten-regel).
    seite: 'j7hcyb802kn',
  },
];

/*
 * KAKAO: EINE DEAL-SEITE MIT SET-WAHL (Elina EL-20261111-fa47cfd9, GO 11.11.2026).
 * /products/j7hcyb802kn zeigt die drei Sets als Pillen; Bild, Preis und
 * Warenkorb-Link folgen dem gewählten Set. ?set=<id> wählt beim Laden vor
 * (serverseitig, Bild und Link stimmen schon im HTML). Ohne Parameter oder bei
 * unbekanntem Wert: das erste Set. Preise wörtlich: je Set 76 € statt 152 €
 * (kauf 2, zahl 1), Links aus Elinas gemessener Liste (Kasse = 76 €).
 */
export const BF_KAKAO_SEITE = 'j7hcyb802kn';
export const BF_KAKAO_SETS = [
  {
    id: 'create-awake',
    pille: '1x Awake + 1x Create',
    name: 'Crystal Cacao 1x Awake + 1x Create',
    basis: 'bundle-1x-awake-1x-create',
    bild: BF_GOLD_BILDER['kakao-awake-create'],
    bildAlt: 'Crystal Cacao Awake und Create, je eine Packung',
    link: 'https://crystal-cacao.com/cart/54540698485004:1,44685294567692:1?discount=BF26-KAKAO-NKSKX',
  },
  {
    id: '2x-awake',
    pille: '2x Awake',
    name: 'Crystal Cacao 2x Awake',
    basis: 'bundle-2x-awake',
    bild: BF_GOLD_BILDER['kakao-2x-awake'],
    bildAlt: 'Zwei Packungen Crystal Cacao Awake',
    link: 'https://crystal-cacao.com/cart/54540698485004:2?discount=BF26-KAKAO-NKSKX',
  },
  {
    id: '2x-create',
    pille: '2x Create',
    name: 'Crystal Cacao 2x Create',
    basis: 'mengenrabatt-2x',
    bild: BF_GOLD_BILDER['kakao-2x-create'],
    bildAlt: 'Zwei Packungen Crystal Cacao Create',
    link: 'https://crystal-cacao.com/cart/44685294567692:2?discount=BF26-KAKAO-NKSKX',
  },
];

/** Set zu einer id; unbekannt oder leer = das erste Set (1x Awake + 1x Create). */
export function bfKakaoSet(id) {
  return BF_KAKAO_SETS.find((s) => s.id === id) ?? BF_KAKAO_SETS[0];
}

/** Adresse der Kakao-Deal-Seite mit Set-Vorwahl (für bf-deals, Mails, Ads). */
export function bfKakaoPfad(setId, el = null) {
  const q = new URLSearchParams({set: bfKakaoSet(setId).id});
  if (el) q.set('el', el);
  return `/products/${BF_KAKAO_SEITE}?${q.toString()}`;
}

/*
 * WEITERLEITUNGEN DER ALTEN KAKAO-ADRESSEN (Elina EL-20261111-fa47cfd9, Punkt 3),
 * nur bis BF_DEAL_ENDE, 302 (vorübergehend), mit passender Set-Vorwahl. Alle
 * Abfrageparameter (el, utm_*, fbclid, markt ...) kommen mit; `set` setzt die
 * Tabelle. `nurEuro`: bundle-2x-awake und mengenrabatt-2x sind die normalen
 * Kakao-Set-Seiten. Sie leiten nur im Euro-Markt weiter (dort gilt der Code);
 * in jedem anderen Markt und nach dem 30.11. zeigen sie ihre normale Seite.
 * Die übrigen Adressen sind reine Deal-Adressen ohne eigene Seite.
 */
export const BF_KAKAO_UMLEITUNGEN = {
  awcr37shyj: {set: 'create-awake'},
  aw783hfn: {set: '2x-awake'},
  '37cr378n': {set: '2x-create'},
  'crystal-cacao-angebot': {set: 'create-awake'},
  'bundle-2x-awake': {set: '2x-awake', nurEuro: true},
  'mengenrabatt-2x': {set: '2x-create', nurEuro: true},
};

/**
 * Ziel der Weiterleitung einer alten Kakao-Adresse, nur im Zeitfenster.
 * @returns {{pfad: string, nurEuro: boolean} | null}
 */
export function bfKakaoUmleitung(handle, requestUrl, jetzt = Date.now()) {
  const u = BF_KAKAO_UMLEITUNGEN[handle];
  if (!u || !bfDealZeitAktiv(jetzt)) return null;
  const q = new URLSearchParams({set: u.set});
  let alt;
  try {
    alt = new URL(requestUrl).searchParams;
  } catch {
    alt = new URLSearchParams();
  }
  alt.forEach((wert, schluessel) => {
    if (schluessel !== 'set') q.append(schluessel, wert);
  });
  return {pfad: `/products/${BF_KAKAO_SEITE}?${q.toString()}`, nurEuro: Boolean(u.nurEuro)};
}

/**
 * Deal-Seiten: Handle unter /products/ -> Deal. `basis` ist das Produkt, dessen
 * Seite gerendert wird, `art` die Fassung (alpha-angebot, alpha-qibracelet,
 * alpha-qihome, standard).
 */
// 8kendiw34hd und pjdz538hgs0 haben eigene Routen (products.8kendiw34hd.jsx,
// products.pjdz538hgs0.jsx); die leihen die Deal-Fassung von jhsdhze783 bzw.
// 734husd8hh. Ihr Eintrag hier macht sie zum Klickziel von bf-deals und der
// Galerie (Elina EL-20261111-cc43922e: Bild, Titel und „Jetzt kaufen“ führen auf
// 8kendiw34hd / pjdz538hgs0). jhsdhze783 / 734husd8hh bleiben als Mail-Adressen.
export const BF_DEAL_SEITEN = {
  '8kendiw34hd': {deal: '2x-qione-2-pro', basis: '8kendiw34hd', art: 'alpha-angebot'},
  pjdz538hgs0: {deal: 'qione-2-pro-necklace', basis: 'pjdz538hgs0', art: 'alpha-angebot'},
  jhsdhze783: {deal: '2x-qione-2-pro', basis: '8kendiw34hd', art: 'alpha-angebot'},
  '734husd8hh': {deal: 'qione-2-pro-necklace', basis: 'pjdz538hgs0', art: 'alpha-angebot'},
  '687ghgf4ed': {deal: 'qibracelet', basis: 'qibracelet', art: 'alpha-qibracelet'},
  '56huz67dds': {deal: 'qihome-air', basis: 'qihome-air', art: 'alpha-qihome'},
  // Kakao: EINE Seite mit Set-Wahl (Elina EL-20261111-fa47cfd9). Die früheren drei Kakao-Deal-Adressen
  // awcr37shyj / aw783hfn / 37cr378n leiten bis BF_DEAL_ENDE auf sie weiter (BF_KAKAO_UMLEITUNGEN).
  [BF_KAKAO_SEITE]: {
    deal: 'kakao',
    basis: 'bundle-1x-awake-1x-create',
    art: 'kakao-sets',
    name: 'Crystal Cacao · Kauf 2, zahl 1',
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

/** BF-Gold-Bild einer Deal-Seite (Kakao: das Bild des Sets der Seite). */
export function bfDealBild(seite) {
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal) return null;
  return {url: seite.bild ?? deal.bild, altText: seite.bildAlt ?? deal.bildAlt};
}

/**
 * BF-Gold-Bild als erstes Bild der Deal-Seite (Elina EL-20261111-a9af196f): vorn
 * in product.images und als Bild der gewählten Variante (die Standard-Seite
 * zeigt selectedOrFirstAvailableVariant.image als Hauptbild). `filter` darf
 * Produktfotos aussortieren (z. B. unscharfe auf der Angebotsfassung).
 */
export function bfDealBildSetzen(product, seite, filter = null) {
  const b = bfDealBild(seite);
  const nodes = product?.images?.nodes;
  if (!b?.url || !Array.isArray(nodes)) return product;
  const vorn = {
    id: `bf-deal-bild-${seite.handle ?? seite.deal}`,
    url: b.url,
    altText: b.altText,
    width: BF_GOLD_KANTE,
    height: BF_GOLD_KANTE,
  };
  const alt = bfDeal(seite.deal)?.altBild;
  const rest = (filter ? nodes.filter(filter) : nodes).filter(
    (n) => n?.url !== b.url && !(alt && String(n?.url ?? '').split('?')[0].endsWith('/' + alt)),
  );
  const variante = (v) => (v && typeof v === 'object' ? {...v, image: vorn} : v);
  // Das frühere Deal-Bild auch in Varianten-Bildern (Größenwahl, Nachbarvarianten) durch das Gold-Bild ersetzen,
  // damit es nach einem Größenwechsel nicht zurückkommt.
  const tausch = (wert, tiefe = 0) => {
    if (!alt || tiefe > 8 || wert === null || typeof wert !== 'object') return wert;
    if (Array.isArray(wert)) return wert.map((x) => tausch(x, tiefe + 1));
    if (typeof wert.url === 'string' && wert.url.split('?')[0].endsWith('/' + alt)) return vorn;
    const kopie = {};
    for (const [k, v] of Object.entries(wert)) kopie[k] = tausch(v, tiefe + 1);
    return kopie;
  };
  const neu = tausch(product);
  return {
    ...neu,
    images: {...product.images, nodes: [vorn, ...rest]},
    selectedOrFirstAvailableVariant: variante(neu.selectedOrFirstAvailableVariant),
  };
}

/** Galerie-Kacheln ohne den aktuellen Deal. */
export function andereDeals(seite) {
  return BF_DEALS.filter((d) => d.id !== seite?.deal);
}
