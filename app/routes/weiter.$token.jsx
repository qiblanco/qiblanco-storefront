import {redirect} from 'react-router';
import {classifyUserAgent} from '~/lib/checkout-tracking';
import {buyerIpAusRequest, istInternerZugriff} from '~/lib/interner-verkehr';
import {
  CART_RX,
  EH_RX,
  PFAD_RX,
  TOKEN_RX,
  basis,
  holeJson,
} from '~/lib/inapp-bruecke';

/**
 * /weiter/<token> — der Link aus der Mail „Link per E-Mail schicken"
 * (CJ-Großjob 20260930, Segment s06; Anforderung: app/routes/link-per-mail.jsx).
 *
 * Fragt den Server (hyros-eigenbau/learning/inapp_bruecke, GET /k/<token>),
 * wohin der Link führt, setzt den Warenkorb der Instagram-Sitzung als
 * Warenkorb DIESES Browsers (Cookie `cart` des Bestands, cart.setCartId) und
 * leitet weiter: /cart bzw. die angesehene Seite. Mit Einwilligung der
 * Instagram-Sitzung trägt das Ziel `?qpx_eh=<16 hex>`; qpx.js liest den
 * Parameter nur, wenn auch dieser Browser eingewilligt hat.
 *
 * WARUM DERSELBE WARENKORB: seine Attribute (Anzeigen-ID, Klick-ID, UTM; nur
 * mit Einwilligung gesetzt) reisen damit in die Bestellung. mergeCartAttributes
 * überschreibt nur Schlüssel, die dieser Browser selbst trägt.
 *
 * Unbekannt, abgelaufen oder Server nicht erreichbar: Startseite. Das Ziel
 * kommt nur als geprüfter Pfad auf dieser Domain zurück (kein offener
 * Redirect). Nie im Index (X-Robots-Tag), nie im Cache.
 */
export async function loader({request, params, context}) {
  const headers = new Headers({
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
  });
  const token = String(params.token || '');
  if (!TOKEN_RX.test(token)) return redirect('/', {headers});

  const ua = request.headers.get('User-Agent') || '';
  const intern = istInternerZugriff({userAgent: ua, ip: buyerIpAusRequest(request)});
  const r = await holeJson(
    `${basis(context)}/k/${token}`,
    {
      headers: {
        Accept: 'application/json',
        'X-Bruecke-UA-Klasse': classifyUserAgent(ua, {intern}),
      },
    },
    4000,
  );
  if (r.status !== 200 || r.body?.ok !== true) return redirect('/', {headers});

  const ziel = PFAD_RX.test(String(r.body.ziel || '')) ? r.body.ziel : '/';
  const cartId = String(r.body.cart_id || '');
  if (cartId && CART_RX.test(cartId)) {
    for (const [k, v] of context.cart.setCartId(cartId)) headers.append(k, v);
  }
  const eh = String(r.body.qpx_eh || '');
  return redirect(EH_RX.test(eh) ? `${ziel}?qpx_eh=${eh}` : ziel, {headers});
}
