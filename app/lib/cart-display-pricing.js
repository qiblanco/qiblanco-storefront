const SALE_CACAO_HANDLES = new Set(['37cr378n', 'aw783hfn', 'awcr37shyj']);
// Lebensmittel-Satz statt Regelsatz. Alle Cacao-Produkte liegen in der
// Shopify-Collection Zeremonie Kakao (524038045964), die den 7%-Override
// trägt; taxable/tax_code/product_type sind identisch, die Collection ist
// das einzige steuerlich differenzierende Merkmal. Belegt an realen
// Bestellungen: SKU 6666/6668 mit rate 0.07 DE MwSt (41 Positionen).
// Job 20260729-cacao-mwst-anzeige-sku6667-klaerung.
const CACAO_HANDLES = new Set([
  ...SALE_CACAO_HANDLES,
  'crystal-cacao-awake',
  'crystal-cacao-create',
  'crystal-cacao-adfiefiale',
  'crystal-cacao-angebot',
]);

const SALE_CACAO_UNIT_GROSS_PRICE = 76;

function getProductHandle(line) {
  return line?.merchandise?.product?.handle ?? '';
}

function getLineQuantity(line) {
  const quantity = Number(line?.quantity ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

function getCurrencyCode(line) {
  return line?.cost?.totalAmount?.currencyCode ?? 'EUR';
}

export function taxRateForHandle(handle) {
  return CACAO_HANDLES.has(handle ?? '') ? 0.07 : 0.19;
}

export function getCartLineTaxRate(line) {
  return taxRateForHandle(getProductHandle(line));
}

export function getCartLinePriceDisplay(line) {
  return {
    price: {
      amount: String(getCartLineGrossDisplayTotal(line)),
      currencyCode: getCurrencyCode(line),
    },
    taxRate: 0,
  };
}

export function getCartLineGrossDisplayTotal(line) {
  // M3: Nicht-EUR-Maerkte (Shopify Markets, CHF/USD/GBP): der Cart-Betrag
  // IST der Endbetrag (belegt: Cart-API == @inContext, keine Steuer-Zeile)
  // — keine deutsche MwSt aufschlagen, nur Warenkorb-Kanon-Rundung.
  const net = parseFloat(line?.cost?.totalAmount?.amount ?? '0');
  if (!Number.isFinite(net)) return 0;

  if (getCurrencyCode(line) !== 'EUR') {
    return Math.round(net);
  }

  if (SALE_CACAO_HANDLES.has(getProductHandle(line))) {
    return SALE_CACAO_UNIT_GROSS_PRICE * getLineQuantity(line);
  }

  return Math.round(net * (1 + getCartLineTaxRate(line)));
}
