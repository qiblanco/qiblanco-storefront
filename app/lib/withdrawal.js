const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WITHDRAWAL_PRODUCTS = [
  {value: 'qione', label: 'QiOne / QiOne 2 Pro'},
  {value: 'qibracelet', label: 'QiBracelet'},
  {value: 'qihome', label: 'QiHome / QiHome Air'},
  {value: 'other', label: 'Anderes Qi Blanco Produkt / Vertrag'},
];

export function validateWithdrawalFormData(formData) {
  const honeypot = String(formData.get('company') || '').trim();
  const values = {
    orderNumber: sanitizePlainText(String(formData.get('orderNumber') || ''), 80),
    name: sanitizePlainText(String(formData.get('name') || ''), 120),
    email: sanitizePlainText(String(formData.get('email') || ''), 254).toLowerCase(),
    product: sanitizePlainText(String(formData.get('product') || ''), 80),
  };
  const errors = {};

  if (honeypot) {
    return {ok: true, spam: true, values, errors};
  }

  if (values.orderNumber.length < 2 || values.orderNumber.length > 80) {
    errors.orderNumber = 'Bitte gib eine gültige Bestellnummer an.';
  }
  if (values.name.length < 2 || values.name.length > 120) {
    errors.name = 'Bitte gib deinen Namen an.';
  }
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) {
    errors.email = 'Bitte gib eine gültige E-Mail-Adresse an.';
  }
  if (!WITHDRAWAL_PRODUCTS.some((product) => product.value === values.product)) {
    errors.product = 'Bitte wähle das Produkt oder den Vertrag aus.';
  }

  return {ok: Object.keys(errors).length === 0, spam: false, values, errors};
}

export function getWithdrawalProductLabel(value) {
  return (
    WITHDRAWAL_PRODUCTS.find((product) => product.value === value)?.label ||
    'Nicht angegeben'
  );
}

export function buildServerTimestamp(date = new Date()) {
  return {
    iso: date.toISOString(),
    display: new Intl.DateTimeFormat('de-DE', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Berlin',
    }).format(date),
  };
}

export function sanitizePlainText(value, maxLength) {
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}
