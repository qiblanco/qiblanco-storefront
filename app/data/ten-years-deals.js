export const TEN_YEARS_SALE_PATH = '/pages/10-jahre-sale';

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
    productTitle: 'Black Friday Sale: 2x QiOne® 2 Pro',
    displayTitle: '2x QiOne® 2 Pro',
    eyebrow: 'Bundle-Angebot',
    shortCopy:
      'Das kraftvolle Duo für Zuhause, Arbeit und unterwegs. Zwei QiOne® 2 Pro im 10 Jahre Jubiläums Sale.',
    benefits: [
      '2x QiOne® 2 Pro im Bundle',
      'Ideal für Alltag, Schlafplatz und Arbeitsplatz',
      'Spare 500 Euro gegenüber dem regulären Preis',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-q2pro-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/2xQiOne2Profreistehend_1.png?v=1731614283',
    ),
    path: '/products/jhsdhze783?el=JSale2026',
    listingHref: '/products/jhsdhze783?el=JSale2026',
    theme: 'frequency',
    variants: [
      {
        id: '53739505058060',
        title: 'Default Title',
        price: 1660.5,
        compareAtPrice: 2476,
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
      'Spare 250 Euro gegenüber dem regulären Preis',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-q2pro-necklace-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/QiOne_NecklaceBundlev3Transparent_1.png?v=1719311888',
    ),
    path: '/products/734husd8hh?el=JSale2026',
    listingHref: '/products/734husd8hh?el=JSale2026',
    theme: 'frequency',
    variants: [
      {id: '53739513512204', title: 'XS - 40 cm', price: 909.24, compareAtPrice: 1332},
      {id: '53739513544972', title: 'S - 45cm', price: 909.24, compareAtPrice: 1332},
      {id: '53739513577740', title: 'M - 50 cm', price: 909.24, compareAtPrice: 1332},
      {id: '53739513610508', title: 'L - 60 cm', price: 909.24, compareAtPrice: 1332},
      {id: '53739513643276', title: 'XL - 75 cm', price: 909.24, compareAtPrice: 1332},
    ],
  },
  {
    key: 'qibracelet',
    handle: 'sale-qibracelet',
    aliases: ['bf-qibracelet', '687ghgf4ed'],
    title: 'QiBracelet',
    productTitle: 'Sale: QiBracelet',
    displayTitle: 'QiBracelet®',
    eyebrow: 'Rabattcode-Angebot',
    shortCopy:
      'Das elegante Bracelet für deinen Alltag. Der Rabatt wird im Pre-Sale über den Deal-Link aktiviert.',
    benefits: [
      'QiBracelet® in drei Größen',
      'Dezent tragbar im Alltag',
      'Rabattcode Bracelet200 wird über den Deal-Link angewendet',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-qibracelet-de.png',
    productImage: checkoutCdn('/cdn/shop/files/QiBracelet3.webp?v=1732874910'),
    path: '/products/sale-qibracelet?el=JSale2026',
    listingHref: '/products/sale-qibracelet?el=JSale2026',
    theme: 'frequency',
    variants: [
      {id: '53761546486028', title: 'S - 17', price: 1175.63, compareAtPrice: 1599},
      {id: '53761546518796', title: 'M - 19', price: 1175.63, compareAtPrice: 1599},
      {id: '53761546551564', title: 'L - 21', price: 1175.63, compareAtPrice: 1599},
    ],
  },
  {
    key: 'qihome',
    handle: 'sale-qihome-air',
    aliases: ['bf-qihome-air', '56huz67dds'],
    title: 'QiHome',
    productTitle: 'Sale: QiHome',
    displayTitle: 'QiHome® Air',
    eyebrow: 'Rabattcode-Angebot',
    shortCopy:
      'Die Lösung für dein Zuhause: QiHome® Air unterstützt dein Umfeld mit kohärenter Technologie.',
    benefits: [
      'QiHome® Air für Wohn- und Arbeitsbereiche',
      'Ein starkes Angebot für dein Zuhause',
      'Rabattcode Home400 wird über den Deal-Link angewendet',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-qihome-de.png',
    productImage: checkoutCdn('/cdn/shop/files/QiHome1.webp?v=1732874979'),
    path: '/products/sale-qihome-air?el=JSale2026',
    listingHref: '/products/sale-qihome-air?el=JSale2026',
    theme: 'frequency',
    variants: [
      {id: '53761506705676', title: 'Default Title', price: 3864.71, compareAtPrice: 4999},
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
      'Bundle-Rabatt wird automatisch über die Produktseite abgebildet',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-create-awake-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/Black_Friday_Sale-Kakao.png?v=1766336237',
    ),
    path: '/products/awcr37shyj?el=JSale2026',
    listingHref: '/products/awcr37shyj?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552762614028', title: 'Default Title', price: 71.03, compareAtPrice: 147.03},
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
      'Bundle-Rabatt wird automatisch über die Produktseite abgebildet',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-awake-de.png',
    productImage: checkoutCdn('/cdn/shop/files/6.png?v=1765893911'),
    path: '/products/aw783hfn?el=JSale2026',
    listingHref: '/products/aw783hfn?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552759697676', title: 'Default Title', price: 71.03, compareAtPrice: 147.03},
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
      'Bundle-Rabatt wird automatisch über die Produktseite abgebildet',
    ],
    tileSrc: '/campaigns/ten-years/j-sale-price-tile-2x-create-de.png',
    productImage: checkoutCdn(
      '/cdn/shop/files/Doypack_Mockup_1x1_text_v3b-min.png?v=1765893937',
    ),
    path: '/products/37cr378n?el=JSale2026',
    listingHref: '/products/37cr378n?el=JSale2026',
    theme: 'cacao',
    variants: [
      {id: '54552759140620', title: 'Default Title', price: 71.03, compareAtPrice: 147.03},
    ],
  },
];

export function getTenYearsDealByHandle(handle) {
  return TEN_YEARS_DEALS.find(
    (deal) => deal.handle === handle || deal.aliases?.includes(handle),
  );
}
