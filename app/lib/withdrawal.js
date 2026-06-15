const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const WITHDRAWAL_PRODUCTS = [
  {value: 'qione', label: 'QiOne / QiOne 2 Pro'},
  {value: 'qibracelet', label: 'QiBracelet'},
  {value: 'qihome', label: 'QiHome / QiHome Air'},
  {value: 'other', label: 'Anderes Qi Blanco Produkt / Vertrag'},
];

export const WITHDRAWAL_HONEYPOT_FIELD = 'qiblanco_withdrawal_hidden_check';

export function validateWithdrawalFormData(formData) {
  const honeypot = String(
    formData.get(WITHDRAWAL_HONEYPOT_FIELD) || '',
  ).trim();
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
  const parts = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    month: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Berlin',
    timeZoneName: 'short',
    year: 'numeric',
  })
    .formatToParts(date)
    .reduce((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});

  return {
    iso: date.toISOString(),
    localIso: buildBerlinIsoTimestamp(date, parts),
    display: `${parts.day}.${parts.month}.${parts.year} um ${parts.hour}:${parts.minute} Uhr (${parts.timeZoneName})`,
  };
}

function buildBerlinIsoTimestamp(date, parts) {
  const offsetMinutes = Math.round(
    (Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
      date.getUTCMilliseconds(),
    ) -
      date.getTime()) /
      60000,
  );
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absoluteOffset = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffset / 60)).padStart(2, '0');
  const offsetRemainder = String(absoluteOffset % 60).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${milliseconds}${sign}${offsetHours}:${offsetRemainder}`;
}

export function sanitizePlainText(value, maxLength) {
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
}
