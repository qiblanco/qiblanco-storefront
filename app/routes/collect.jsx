/**
 * First-Party-Pixel-Proxy /collect (Job 20260718-storefront-pixel-tracking-
 * vertiefung, OPTIONAL + ENV-GATED AUS).
 *
 * WARUM: Safari ITP kappt JS-gesetzte Cookies auf 7 Tage (24h bei Klick-ID in
 * der Landing-URL). Nur ein HTTP-Set-Cookie von der ECHTEN First-Party
 * (qiblanco.com selbst, kein CNAME) ist davon ausgenommen (bis 400 Tage).
 * Diese Route nimmt qpx-Beacons same-origin entgegen, reicht sie server-seitig
 * an den Receiver weiter und FRISCHT dabei vorhandene First-Party-Cookies
 * (_qpx_anon/_fbp/_fbc) als HTTP-Cookies mit 400-Tage-Laufzeit auf.
 *
 * GATE (fail-closed): Ohne Oxygen-Env QPX_PROXY_UPSTREAM (Server-URL des
 * Receivers, Christian-Hand) antwortet die Route 404 — Verhalten wie heute.
 * Aktivierung = QPX_PROXY_UPSTREAM setzen UND PUBLIC_QPX_ENDPOINT auf
 * '/collect' stellen (dann sendet qpx same-origin hierher).
 *
 * Es werden KEINE neuen Cookies erzeugt und KEINE Werte erfunden — nur
 * vorhandene, format-geprüfte Werte werden verlaengert. Kein PII-Speicher.
 */

const MAX_BODY_BYTES = 262144; // 256 KB, Spiegel des Receiver-Caps
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // 400 Tage (Chrome-Obergrenze)

export async function loader() {
  return new Response('Not found', {status: 404});
}

/**
 * @param {{request: Request, context: {env: Record<string, string | undefined>}}} args
 */
export async function action({request, context}) {
  const upstream = context.env.QPX_PROXY_UPSTREAM;
  if (!upstream) return new Response('Not found', {status: 404});
  if (request.method !== 'POST') return new Response(null, {status: 405});

  let body = '';
  try {
    body = await request.text();
  } catch {
    return new Response(null, {status: 400});
  }
  if (!body || body.length > MAX_BODY_BYTES) {
    return new Response(null, {status: 413});
  }

  let upstreamOk = false;
  try {
    const res = await fetch(upstream, {
      method: 'POST',
      body,
      headers: {'Content-Type': 'application/json'},
    });
    upstreamOk = res.status < 400;
  } catch {
    // Receiver nicht erreichbar: Beacon geht verloren (wie heute bei
    // direktem Send), aber der Cookie-Refresh unten passiert trotzdem.
  }

  const headers = new Headers({'Content-Type': 'application/json'});
  for (const cookie of refreshCookies(request)) {
    headers.append('Set-Cookie', cookie);
  }
  return new Response(JSON.stringify({ok: upstreamOk}), {status: 200, headers});
}

/**
 * Vorhandene First-Party-Tracking-Cookies format-geprüft als HTTP-Cookies
 * verlaengern (ITP-Exemption). Nie erfinden, nie umschreiben.
 *
 * @param {Request} request
 */
function refreshCookies(request) {
  const jar = parseCookieHeader(request.headers.get('Cookie'));
  const out = [];
  const specs = [
    // _qpx_anon: UUID-artig (qpx.js uuid())
    ['_qpx_anon', /^[0-9a-fA-F-]{16,64}$/],
    // Meta-Browser-/Klick-Cookies: immer 'fb.'-Prefix
    ['_fbp', /^fb\.[0-9]\.[0-9]{10,16}\.[\w.-]{1,128}$/],
    ['_fbc', /^fb\.[0-9]\.[0-9]{10,16}\.[\w.-]{1,255}$/],
  ];
  let domain = '';
  try {
    const host = new URL(request.url).hostname;
    if (/(^|\.)qiblanco\.com$/.test(host)) domain = '; Domain=.qiblanco.com';
  } catch {
    domain = '';
  }
  for (const [name, re] of specs) {
    const value = jar[name];
    if (!value || !re.test(value)) continue;
    out.push(
      `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${COOKIE_MAX_AGE}` +
        `; SameSite=Lax; Secure${domain}`,
    );
  }
  return out;
}

/**
 * @param {string | null} cookieHeader
 */
function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');
    if (separatorIndex === -1) return cookies;
    const name = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (name) cookies[name] = safeDecode(value);
    return cookies;
  }, {});
}

/**
 * @param {string} value
 */
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
