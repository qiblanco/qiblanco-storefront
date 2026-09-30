import {
  getAttributionCartAttributes,
  getOriginCartAttributes,
  hasAttributionConsent,
} from '~/lib/cart-attribution.server';
import {classifyUserAgent} from '~/lib/checkout-tracking';
import {buyerIpAusRequest, istInternerZugriff} from '~/lib/interner-verkehr';
import {EMAIL_RX, PFAD_RX, basis, holeJson} from '~/lib/inapp-bruecke';

/**
 * /link-per-mail — Ressourcen-Route für „Link per E-Mail schicken" im
 * Instagram-/Facebook-Browser (CJ-Großjob 20260930, Segment s06; Komponente
 * app/components/reusables/LinkPerMail.jsx).
 *
 *   GET  ?w=1   Weiche: {an: true|false}. Kunden: erst wenn der Kundenweg des
 *               Eigenversands offen ist. Interne Zugriffe (Haus-Marker, Server-
 *               IP): immer, damit die stummen Proben den Weg messen können.
 *   POST        Anforderung. Der Server (hyros-eigenbau/learning/inapp_bruecke)
 *               schickt die Mail; dieser Weg reicht nur weiter.
 *
 * WAS DER SERVER BEKOMMT, UND WAS NICHT:
 *   - die Adresse (nur für diese eine Mail, dort nie im Klartext gespeichert),
 *   - den Warenkorb dieser Sitzung (cart id). Auf einer Produktseite ohne
 *     Warenkorb wird hier ein leerer angelegt, mit DENSELBEN Attribut-Helfern
 *     wie jeder Kassen-Einstieg: Herkunftsmarker immer, personenbezogene
 *     Attribute nur mit Einwilligung. So reist die Anzeigen-ID dieser Sitzung
 *     mit dem Warenkorb in den anderen Browser und bis in die Bestellung.
 *   - `einwilligung` nach hasAttributionConsent, also genau der Regel, die auch
 *     `_qpx_anon` an den Warenkorb schreibt. Nur mit ihr gehen `_qpx_anon` mit
 *     und bekommt der Link die Kennung `qpx_eh`.
 *   - die Kunden-IP als X-Bruecke-Kunde-IP (nur für die Drossel je Netz).
 * KEIN neues Cookie, kein neuer Tracking-Schlüssel am Laden: TRACKING_COOKIE_NAMES
 * bleibt unberührt. Der einzige gesetzte Cookie ist der Warenkorb (cart) des
 * Bestands, und nur, wenn hier ein Warenkorb neu entsteht.
 *
 * Muster, Endpunkt und Testumgebung (Env INAPP_BRUECKE_API): app/lib/inapp-bruecke.js.
 */
const KOPF = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex'};

/**
 * @param {string | null} cookieHeader
 * @param {string} name
 */
function cookieWert(cookieHeader, name) {
  for (const teil of (cookieHeader || '').split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(teil.slice(i + 1).trim());
      } catch {
        return teil.slice(i + 1).trim();
      }
    }
  }
  return '';
}

function intern(request) {
  return istInternerZugriff({
    userAgent: request.headers.get('User-Agent'),
    ip: buyerIpAusRequest(request),
  });
}

export async function loader({request, context}) {
  const url = new URL(request.url);
  if (url.searchParams.get('w') !== '1') {
    return new Response('Not found', {status: 404, headers: KOPF});
  }
  const r = await holeJson(
    `${basis(context)}/w?intern=${intern(request) ? 1 : 0}`,
    {headers: {Accept: 'application/json'}},
    3000,
  );
  return Response.json(
    {an: r.status === 200 && r.body?.an === true},
    {headers: KOPF},
  );
}

export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false, code: 'eingabe'}, {status: 405, headers: KOPF});
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ok: false, code: 'eingabe'}, {status: 400, headers: KOPF});
  }
  const email = String(form.get('email') || '').trim().slice(0, 254);
  const art = String(form.get('art') || '') === 'warenkorb' ? 'warenkorb' : 'seite';
  const pfadRoh = String(form.get('pfad') || '');
  const pfad = art === 'warenkorb' ? '/cart' : PFAD_RX.test(pfadRoh) ? pfadRoh : '';
  if (!EMAIL_RX.test(email)) {
    return Response.json({ok: false, code: 'adresse'}, {headers: KOPF});
  }
  if (!pfad) {
    return Response.json({ok: false, code: 'eingabe'}, {headers: KOPF});
  }

  const {cart, env} = context;
  const ua = request.headers.get('User-Agent') || '';
  const ip = buyerIpAusRequest(request);
  const istIntern = intern(request);
  const einwilligung = hasAttributionConsent(request, env);
  const headers = new Headers(KOPF);

  let cartId = '';
  try {
    cartId = cart.getCartId() || '';
  } catch {
    cartId = '';
  }
  if (!cartId && art === 'seite') {
    // Produktseite ohne Warenkorb: ein leerer, der die Herkunft dieser Sitzung
    // trägt. Scheitert das, geht der Link trotzdem, nur ohne Warenkorb.
    try {
      const attribute = [
        ...getOriginCartAttributes(request),
        ...(einwilligung ? getAttributionCartAttributes(request) : []),
      ];
      const angelegt = await cart.create(
        attribute.length ? {attributes: attribute} : {},
      );
      if (angelegt?.cart?.id && !angelegt.errors?.length) {
        cartId = angelegt.cart.id;
        for (const [k, v] of cart.setCartId(cartId)) headers.append(k, v);
      }
    } catch {
      cartId = '';
    }
  }
  if (art === 'warenkorb' && !cartId) {
    return Response.json({ok: false, code: 'eingabe'}, {headers});
  }

  const anon = einwilligung ? cookieWert(request.headers.get('Cookie'), '_qpx_anon') : '';
  const r = await holeJson(
    `${basis(context)}/a`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Bruecke-Kunde-IP': ip,
      },
      body: JSON.stringify({
        email,
        art,
        pfad,
        cart_id: cartId,
        einwilligung,
        anon,
        ua_klasse: classifyUserAgent(ua, {intern: istIntern}),
        intern: istIntern,
        website: String(form.get('website') || '').slice(0, 200),
      }),
    },
    15000,
  );
  const ok = r.status === 200 && r.body?.ok === true;
  return Response.json(
    {ok, code: ok ? '' : String(r.body?.code || 'fehler')},
    {headers},
  );
}
