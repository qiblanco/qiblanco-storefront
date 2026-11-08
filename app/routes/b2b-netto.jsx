import {
  anfrageAusFormular,
  frageTuer,
  istIntern,
  knopfSichtbar,
  merkmaleFuer,
  nettoStand,
} from '~/lib/b2b-netto.server';
import {B2B_NETTO_AN, TEXT} from '~/lib/b2b-netto';

/**
 * /b2b-netto — Ressourcen-Route für „Als Firma ohne MwSt bestellen“ im
 * Warenkorb (Komponente app/components/reusables/B2bNettoWeg.jsx, Regeln
 * app/lib/b2b-netto.js). Muster: app/routes/link-per-mail.jsx.
 *
 *   GET  ?w=1   Weiche {an: true|false}. an nur, wenn die Tür am Server
 *               /healthz netto=an meldet (60 s gemerkt); interne Zugriffe
 *               auch bei 'trocken'.
 *   POST        Formular. Liest den Warenkorb DIESER Sitzung serverseitig
 *               (nie Zeilen aus dem Browser), fragt die Tür und antwortet
 *               {ok: true, url} oder {ok: false, text}.
 *
 * Kein neues Cookie, kein neuer Tracking-Schlüssel: TRACKING_COOKIE_NAMES
 * bleibt unberührt. Die vorhandenen Schlüssel reisen als `merkmale` zur Tür.
 */
const KOPF = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex'};

export async function loader({request, context}) {
  const url = new URL(request.url);
  if (url.searchParams.get('w') !== '1') {
    return new Response('Not found', {status: 404, headers: KOPF});
  }
  if (!B2B_NETTO_AN) return Response.json({an: false}, {headers: KOPF});
  const stand = await nettoStand(context);
  return Response.json(
    {an: knopfSichtbar(stand, istIntern(request))},
    {headers: KOPF},
  );
}

export async function action({request, context}) {
  if (request.method !== 'POST' || !B2B_NETTO_AN) {
    return Response.json({ok: false, text: TEXT.fehler}, {status: 405, headers: KOPF});
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ok: false, text: TEXT.fehler}, {status: 400, headers: KOPF});
  }
  const {cart, env} = context;
  let warenkorb = null;
  try {
    warenkorb = await cart.get();
  } catch {
    warenkorb = null;
  }
  const {anfrage, fehler} = anfrageAusFormular(
    form,
    warenkorb,
    merkmaleFuer(request, env, warenkorb, form.get('ad_params_seen')),
  );
  if (fehler) return Response.json({ok: false, text: fehler}, {headers: KOPF});
  const antwort = await frageTuer(context, anfrage);
  return Response.json(antwort, {headers: KOPF});
}
