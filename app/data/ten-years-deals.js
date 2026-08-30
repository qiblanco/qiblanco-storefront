export const TEN_YEARS_SALE_PATH = '/pages/10-jahre-sale';

/*
 * STILLLEGUNG DES JUBILÄUMS-SALES (Christian-Freigabe 2026-08-05, Job
 * jsale-offline-rabatt-deaktiv-20260805). Der Sale ist beendet: der Automatic
 * Discount „2er-Set QiOne 2 Pro" (166,40 € netto aufs Paar) ist seit dem
 * 30.07.2026 EXPIRED. Die Kampagnen-Flächen bewarben den Set-Preis 1.660,50 €
 * aber unverändert weiter, während der Warenkorb den Rabatt nicht mehr zog —
 * Differenz 198,02 € brutto je Kauf, laufender Kundenschaden.
 *
 * BEWUSST KEIN LÖSCHEN: Routen, Komponenten, Styles und Assets bleiben
 * unangetastet im Repo — das Know-how bleibt für eine Wiederverwendung
 * erhalten. Stillgelegt wird ausschließlich die öffentliche ERREICHBARKEIT;
 * das ist das Hydrogen-Äquivalent zu „unpublished/Entwurf".
 *
 * EIN HEBEL, EIN RÜCKWEG: TEN_YEARS_SALE_RETIRED = false stellt alle Flächen
 * wieder her. Der Rabatt selbst liegt in Shopify und ist von hier aus NICHT
 * schaltbar (fehlende Scopes).
 *
 * NACHTRAG 2026-08-22 (Job 20260821-shopmgr-s04-totes-kampagnenversprechen) —
 * DIE STILLLEGUNG SCHÜTZTE DIE ERREICHBARKEIT, NICHT DIE WAHRHEIT DER ZAHLEN.
 * Die Datenhälfte der Kampagne lebte weiter: `discountCode: 'Bracelet200'` und
 * `'Home400'` (beide in Shopify seit 2026-06-17 EXPIRED), dazu rabattierte
 * `price`/`compareAtPrice` in fünf Deals. Erreichbar war davon nichts — aber
 * ein einziges `TEN_YEARS_SALE_RETIRED = false` hätte alle Zusagen auf einen
 * Schlag wieder scharf gestellt, und keine davon wäre noch wahr gewesen.
 * Das war keine Altlast, sondern eine Mine mit genau einem Zünder.
 *
 * DESHALB GILT AB HIER: ein stillgelegter Deal trägt KEINE kommerzielle
 * Zusage. Kein `discountCode`, kein `/discount/…`-Link, kein `price`, kein
 * `compareAtPrice`, kein Euro-Betrag in `benefits` — auch nicht in der
 * Copy-Tabelle von TenYearsDealPage.jsx (`heroSavings`/`savingText`/
 * `ctaButton`), die dieselben Beträge ein zweites Mal führte und von keinem
 * Monitor gelesen wird. Durchgesetzt von test/ten-years-retired.test.mjs.
 *
 * WAS BLEIBT, UND WARUM: Struktur und Know-how — `key`, `handle`, `aliases`,
 * Varianten-IDs und -Titel, Bilder, Texte, `theme`. Die Einträge sind während
 * der Stilllegung LASTTRAGEND: `getTenYearsDealByHandle` speist den 404-Zaun
 * in products.$handle.jsx, und dahinter stehen echte Shopify-Produkte im
 * Status DRAFT („Sale: QiBracelet" 687ghgf4ed, „Sale: QiHome® Air"
 * 56huz67dds, gemessen 2026-08-22). Ein gelöschter Eintrag nimmt diesen Zaun
 * mit — ein Admin-Klick DRAFT→ACTIVE veröffentlichte dann eine „Sale:"-Seite
 * zum vollen Preis. Löschen ist hier also die GEFÄHRLICHERE Variante.
 *
 * WIEDERINBETRIEBNAHME ist damit bewusst kein Ein-Wort-Handgriff mehr: wer
 * `TEN_YEARS_SALE_RETIRED = false` setzt, muss Preise und Codes neu erheben
 * und gegen den echten Warenkorb messen (shop-manager landkarte). Genau diese
 * Messung hat zuletzt gefehlt.
 */
export const TEN_YEARS_SALE_RETIRED = true;

/*
 * Die dedizierten JSale-SEITEN-Routen. Sie werden am Server-Entry abgefangen
 * (app/entry.server.jsx) statt in den Route-Dateien selbst: so bleibt jede
 * Route-Datei byte-identisch erhalten, und der Guard schlägt zusätzlich ein
 * etwaiges gleichnamiges Shopify-Admin-Page-Objekt — Code-Route und Admin-Page
 * teilen sich den Handle-Raum (siehe Kopf von pages.qione-2-pro-2x.jsx), und
 * ein Admin-Page-Objekt wäre von hier aus mangels Scopes nicht abschaltbar.
 */
export const TEN_YEARS_RETIRED_PAGE_PATHS = [
  '/pages/10-jahre-sale',
  '/pages/10-jahre-pre-access',
  '/pages/anmeldung-erfolgreich-pre-access',
  '/pages/qione-2-pro-2x',
];

/**
 * true, wenn dieser Pfad eine stillgelegte JSale-Seite ist. Normalisiert
 * Groß-/Kleinschreibung und einen abschließenden Slash (beides erreicht
 * dieselbe Route), vergleicht sonst EXAKT — kein Präfix-Match, damit
 * Nachbarpfade wie /pages/qione-2-pro-details oder /pages/qione-2-pro nie
 * mitgerissen werden.
 * @param {string} pathname
 */
export function istStillgelegteJSaleSeite(pathname) {
  if (!TEN_YEARS_SALE_RETIRED || typeof pathname !== 'string') return false;
  let pfad = pathname.toLowerCase();
  if (pfad.length > 1 && pfad.endsWith('/')) pfad = pfad.slice(0, -1);
  return TEN_YEARS_RETIRED_PAGE_PATHS.includes(pfad);
}

export function getTenYearsCountdownRemaining(now = new Date()) {
  const current = now instanceof Date ? now : new Date(now);
  const nextReset = new Date(current);
  nextReset.setHours(24, 0, 0, 0);

  const diff = Math.max(nextReset.getTime() - current.getTime(), 0);
  const seconds = Math.floor(diff / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
  };
}

const checkoutCdn = (path) => `https://checkout.qiblanco.com${path}`;

export const TEN_YEARS_DEALS = [
  {
    key: 'qione-2-pro-duo',
    handle: 'jhsdhze783',
    title: '2x QiOne 2 Pro',
    // Inhalts-Fix EL-20260724-9b18d2ba: BF24-Resttitel ersetzt — die Kampagne
    // läuft als 10 Jahre Jubiläums Sale (Titel-Wortlaut von Elina).
    productTitle: '2x QiOne® 2 Pro — 10 Jahre Jubiläums Sale',
    displayTitle: '2x QiOne® 2 Pro',
    eyebrow: 'Bundle-Angebot',
    shortCopy:
      'Das kraftvolle Duo für Zuhause, Arbeit und unterwegs. Zwei QiOne® 2 Pro im 10 Jahre Jubiläums Sale.',
    benefits: [
      '2x QiOne® 2 Pro im Bundle',
      'Ideal für Alltag, Schlafplatz und Arbeitsplatz',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-q2pro-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/2xQiOne2Profreistehend_1.png?v=1731614283',
    ),
    // Repoint (EL-20260722-04de90b3, Christian-Freigabe 24.07.2026):
    // Campaign-PDP statt Preis-Klon — Set-Preis kommt vom Automatic Discount.
    // handle bleibt 'jhsdhze783' (getTenYearsDealByHandle).
    path: '/pages/qione-2-pro-2x?el=JSale2026',
    listingHref: '/pages/qione-2-pro-2x?el=JSale2026',
    // Alt-URL /products/jhsdhze783 → Campaign-PDP: als Code-301 im Loader
    // (products.$handle.jsx), weil die Deal-Route nie 404 liefert und der
    // Shopify-URL-Redirect (storefrontRedirect greift NUR bei 404) hier
    // deshalb nie feuern kann (Inhalts-Fix EL-20260724-9b18d2ba).
    redirectTo: '/pages/qione-2-pro-2x?el=JSale2026',
    // Kauf-Referenz = das EINE kanonische Produkt (kein Klon): 2× qione-2-pro.
    cartProductHandle: 'qione-2-pro',
    cartProductTitle: 'QiOne® 2 Pro',
    cartQuantity: 2,
    theme: 'frequency',
    variants: [
      {
        id: '53739505058060',
        title: 'Default Title',
        // Kanonische Variante QiOne® 2 Pro (Admin-verifiziert 2026-07-24).
        // Zusage entfernt 2026-08-22: `price: 1660.5` war der Set-Preis aus
        // dem Automatic Discount „2er-Set QiOne 2 Pro", der seit 2026-07-30
        // EXPIRED ist. Gemessen am Warenkorb: 1826.90 statt 1660.50 netto.
        cartVariantId: '39680087326790',
      },
    ],
  },
  {
    key: 'qione-2-pro-necklace',
    handle: '734husd8hh',
    title: 'QiOne 2 Pro + Necklace',
    productTitle: 'Black Friday Sale: QiOne 2 Pro + Necklace',
    displayTitle: 'QiOne® 2 Pro + Necklace',
    eyebrow: 'Bundle-Angebot',
    shortCopy:
      'QiOne® 2 Pro plus Necklace als hochwertiges Set für täglichen Schutz und klare Präsenz.',
    benefits: [
      'QiOne® 2 Pro plus Necklace',
      'Mehrere Necklace-Größen auswählbar',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-q2pro-necklace-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/QiOne_NecklaceBundlev3Transparent_1.png?v=1719311888',
    ),
    path: '/products/734husd8hh?el=JSale2026',
    listingHref: '/products/734husd8hh?el=JSale2026',
    theme: 'frequency',
    // Zusage entfernt 2026-08-22: alle fünf Varianten trugen `price: 909.24`
    // für eine Kauf-Variante, die an der Storefront nicht mehr existiert —
    // der Warenkorb legte eine LEERE Zeile an (Betrag 0,00), gemeldet als
    // `landkarte_kaufweg_tot`. Ohne Preis-Zusage gibt es keinen Kaufweg, den
    // diese Daten versprechen; die Variante-IDs bleiben als Größenraster.
    variants: [
      {id: '53739513512204', title: 'XS - 40 cm'},
      {id: '53739513544972', title: 'S - 45cm'},
      {id: '53739513577740', title: 'M - 50 cm'},
      {id: '53739513610508', title: 'L - 60 cm'},
      {id: '53739513643276', title: 'XL - 75 cm'},
    ],
  },
  {
    key: 'qibracelet',
    handle: 'sale-qibracelet',
    aliases: ['bf-qibracelet', '687ghgf4ed'],
    title: 'QiBracelet',
    productTitle: 'Sale: QiBracelet',
    displayTitle: 'QiBracelet®',
    eyebrow: 'Angebot',
    shortCopy: 'Das elegante Bracelet für deinen Alltag.',
    benefits: [
      'QiBracelet® in drei Größen',
      'Dezent tragbar im Alltag',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-qibracelet-de.png',
    productImage: checkoutCdn('/cdn/shop/files/QiBracelet3.webp?v=1732874910'),
    path: '/products/sale-qibracelet?el=JSale2026',
    // Zusage entfernt 2026-08-22: `discountCode: 'Bracelet200'` und der
    // listingHref `/discount/Bracelet200?redirect=…` versprachen einen Code,
    // der in Shopify seit 2026-06-17 EXPIRED ist (gemessen: 1326.05 ohne
    // Code, 1326.05 mit Code, Abzug 0,00). Der listingHref zeigt jetzt auf
    // denselben Pfad wie `path` — kein Code-Einlösen mehr im Link.
    listingHref: '/products/sale-qibracelet?el=JSale2026',
    theme: 'frequency',
    variants: [
      {
        id: '53761546486028',
        cartVariantId: '43666904056076',
        cartProductHandle: 'qibracelet',
        cartProductTitle: 'QiBracelet®',
        title: 'S - 17',
      },
      {
        id: '53761546518796',
        cartVariantId: '43666904088844',
        cartProductHandle: 'qibracelet',
        cartProductTitle: 'QiBracelet®',
        title: 'M - 19',
      },
      {
        id: '53761546551564',
        cartVariantId: '43673322160396',
        cartProductHandle: 'qibracelet',
        cartProductTitle: 'QiBracelet®',
        title: 'L - 21',
      },
    ],
  },
  {
    key: 'qihome',
    handle: 'sale-qihome-air',
    aliases: ['bf-qihome-air', '56huz67dds'],
    title: 'QiHome',
    productTitle: 'Sale: QiHome',
    displayTitle: 'QiHome® Air',
    eyebrow: 'Angebot',
    shortCopy:
      'Die Lösung für dein Zuhause: QiHome® Air unterstützt dein Umfeld mit kohärenter Technologie.',
    benefits: [
      'QiHome® Air für Wohn- und Arbeitsbereiche',
      'Ein starkes Angebot für dein Zuhause',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-qihome-de.png',
    productImage: checkoutCdn('/cdn/shop/files/QiHome1.webp?v=1732874979'),
    path: '/products/sale-qihome-air?el=JSale2026',
    // Zusage entfernt 2026-08-22: `discountCode: 'Home400'` + der
    // `/discount/Home400?redirect=…`-listingHref. Code seit 2026-06-17
    // EXPIRED (gemessen: 4187.40 ohne Code, 4187.40 mit Code, Abzug 0,00).
    listingHref: '/products/sale-qihome-air?el=JSale2026',
    theme: 'frequency',
    variants: [
      {
        id: '53761506705676',
        cartVariantId: '32238705967174',
        cartProductHandle: 'qihome-air',
        cartProductTitle: 'QiHome® Air',
        title: 'Default Title',
      },
    ],
  },
  {
    key: 'cacao-create-awake',
    handle: 'awcr37shyj',
    title: '1x Create + 1x Awake',
    productTitle: 'BF: Crystal Cacao® Create & Awake - Bio',
    displayTitle: 'Crystal Cacao® Create + Awake',
    eyebrow: 'Kakao-Bundle',
    shortCopy:
      'Ein Bundle für klare Energie und bewusste Rituale: Create und Awake im Jubiläumsangebot.',
    benefits: [
      '1x Crystal Cacao® Create',
      '1x Crystal Cacao® Awake',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-create-awake-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/Black_Friday_Sale-Kakao.png?v=1766336237',
    ),
    path: '/products/awcr37shyj?el=JSale2026',
    listingHref: '/products/awcr37shyj?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552762614028', title: 'Default Title'},
    ],
  },
  {
    key: 'cacao-awake-duo',
    handle: 'aw783hfn',
    title: '2x Awake',
    productTitle: '2x Crystal Cacao® AWAKE - 100% Bio',
    displayTitle: '2x Crystal Cacao® Awake',
    eyebrow: 'Kakao-Bundle',
    shortCopy:
      'Zweimal Awake für einen klaren, wachen Alltag mit naturreinem Crystal Cacao®.',
    benefits: [
      '2x Crystal Cacao® Awake',
      'Bio-zertifiziert und laboranalytisch geprüft',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-awake-de.png',
    productImage: checkoutCdn('/cdn/shop/files/6.png?v=1765893911'),
    path: '/products/aw783hfn?el=JSale2026',
    listingHref: '/products/aw783hfn?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552759697676', title: 'Default Title'},
    ],
  },
  {
    key: 'cacao-create-duo',
    handle: '37cr378n',
    title: '2x Create',
    productTitle: '2x Crystal Cacao® CREATE - 100% Bio',
    displayTitle: '2x Crystal Cacao® Create',
    eyebrow: 'Kakao-Bundle',
    shortCopy:
      'Zweimal Create für Fokus, Kreativität und bewusste Energie im Alltag.',
    benefits: [
      '2x Crystal Cacao® Create',
      '100% naturrein und in Bio-Qualität',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-create-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/Doypack_Mockup_1x1_text_v3b-min.png?v=1765893937',
    ),
    path: '/products/37cr378n?el=JSale2026',
    listingHref: '/products/37cr378n?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552759140620', title: 'Default Title'},
    ],
  },
];

export function getTenYearsDealByHandle(handle) {
  return TEN_YEARS_DEALS.find(
    (deal) => deal.handle === handle || deal.aliases?.includes(handle),
  );
}
