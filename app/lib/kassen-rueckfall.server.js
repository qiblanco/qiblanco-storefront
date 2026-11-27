/**
 * KASSEN-RÜCKFALL (Notfall Black Friday 27.11.2026, Job
 * 20261127-notfall-de-warenkorb-oxygen-neuanlage-wieder-aus, Elina
 * EL-20261127-8fe7809a „sofort beheben").
 *
 * Lage: Die Neuanlage eines Warenkorbs über Oxygen (Hydrogen `cartCreate` mit
 * privatem Storefront-Token) scheitert stundenweise mit einem GraphQL-Fehler
 * (18.11. 21:58–22:40Z, 27.11. ca. 03:14–03:57Z und ab ca. 05:05Z). In
 * derselben Minute legt der native Shopify-Kassenweg
 * `https://checkout.qiblanco.com/cart/<variante>:<menge>` den Korb an und
 * leitet in die Kasse (gemessen 27.11. 05:36Z: 302 in /checkouts/cn/...).
 * Ein Kunde ohne Warenkorb bekam bisher einen leeren Korb (Kaufknopf), 410
 * (Kassen-Link) oder 500 (Rabattlink).
 *
 * Regel: NUR wenn die Neuanlage gescheitert ist (kein Warenkorb, GraphQL-
 * Fehler), geht der Kunde über den nativen Kassenweg weiter, mit denselben
 * Zeilen, denselben Codes und den Herkunfts-Merkmalen als Warenkorb-Attribut.
 * Im gesunden Zustand ändert sich nichts. Der Qi-Alpha-Ratenanteil bekommt
 * nie einen Rückfall (seine Bindung lebt nur im Hydrogen-Weg).
 *
 * Schalter: Env `KASSEN_RUECKFALL=off` schaltet den Rückfall ab (dann wie
 * vorher: leerer Korb / 410 / 500).
 */
import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  getTrackedCheckoutUrl,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {mitRatenanteil} from '~/lib/qi-alpha-teilzahlung';

/** Nativer Shopify-Kassenweg des Global Deutsch-Shops. */
export const KASSE = 'https://checkout.qiblanco.com';

/** Kopfzeile, an der eine Messung den Rückfall erkennt. */
export const RUECKFALL_KOPF = 'x-qb-kassen-rueckfall';

/** Rabattcode aus einem Rabattlink, der im Störfenster keinen Korb bekam. */
export const RABATT_COOKIE = 'qb_rabatt_offen';

/** @param {Record<string, string | undefined> | undefined} env */
export function rueckfallAn(env) {
  return String(env?.KASSEN_RUECKFALL ?? '').toLowerCase() !== 'off';
}

/**
 * Ist die NEUANLAGE gescheitert? Kein Warenkorb UND ein Fehler der API.
 * userErrors allein (z. B. ausverkauft) sind keine Störung.
 * @param {any} result
 */
export function neuanlageGescheitert(result) {
  return !result?.cart?.id && Array.isArray(result?.errors) && result.errors.length > 0;
}

/** @param {string} gid */
function variantenNummer(gid) {
  const m = String(gid ?? '').match(/(\d+)\s*$/);
  return m ? m[1] : '';
}

/**
 * Zeilen für den Permalink, oder null, wenn ein Rückfall nicht erlaubt ist.
 * @param {Array<{merchandiseId?: string, quantity?: number}>} zeilen
 */
export function permalinkTeil(zeilen) {
  if (!Array.isArray(zeilen) || !zeilen.length) return null;
  if (mitRatenanteil(zeilen.map((z) => z?.merchandiseId))) return null;
  const teile = [];
  for (const z of zeilen) {
    const nr = variantenNummer(z?.merchandiseId);
    const menge = Number.isFinite(Number(z?.quantity)) ? Math.trunc(Number(z.quantity)) : 1;
    if (!nr || menge < 1 || menge > 99) return null;
    teile.push(`${nr}:${menge}`);
  }
  return teile.join(',');
}

/**
 * Code aus dem Cookie eines gescheiterten Rabattlinks.
 * @param {Request} request
 */
export function offenerRabatt(request) {
  const m = String(request.headers.get('Cookie') || '').match(
    new RegExp(`(?:^|;\\s*)${RABATT_COOKIE}=([^;]*)`),
  );
  if (!m) return '';
  let c = m[1];
  try {
    c = decodeURIComponent(c);
  } catch {
    return '';
  }
  return /^[A-Za-z0-9_-]{1,64}$/.test(c) ? c : '';
}

/**
 * Set-Cookie für den Code eines Rabattlinks (24 h, nur dieser Shop).
 * @param {string} code
 */
export function rabattCookie(code) {
  const c = String(code ?? '').trim();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(c)) return null;
  return `${RABATT_COOKIE}=${encodeURIComponent(c)}; Path=/; Max-Age=86400; SameSite=Lax; Secure`;
}

/**
 * URL des nativen Kassenwegs mit Codes und Herkunfts-Merkmalen.
 * @param {{zeilen: string, codes?: string[], request: Request, env: any}} a
 * @returns {string}
 */
export function rueckfallUrl({zeilen, codes = [], request, env}) {
  const url = new URL(`${KASSE}/cart/${zeilen}`);
  const eindeutig = [];
  for (const c of codes) {
    const s = String(c ?? '').trim();
    if (s && !eindeutig.some((x) => x.toUpperCase() === s.toUpperCase())) eindeutig.push(s);
  }
  if (eindeutig.length) url.searchParams.set('discount', eindeutig.slice(0, 5).join(','));

  const zustimmung = hasAttributionConsent(request, env);
  /** @type {Array<{key: string, value: string}>} */
  let merkmale = [];
  try {
    merkmale = [
      ...getOriginCartAttributes(request),
      ...(zustimmung ? getAttributionCartAttributes(request) : []),
    ];
  } catch {
    merkmale = [];
  }
  const gesehen = new Set();
  for (const m of merkmale) {
    if (!m?.key || m.value == null || gesehen.has(m.key)) continue;
    gesehen.add(m.key);
    url.searchParams.set(`attributes[${m.key}]`, String(m.value).slice(0, 500));
  }
  url.searchParams.set('attributes[kassen_rueckfall]', 'oxygen-neuanlage');

  const ziel = url.toString();
  try {
    return zustimmung ? getTrackedCheckoutUrl(ziel, request, env) : ziel;
  } catch {
    return ziel;
  }
}
