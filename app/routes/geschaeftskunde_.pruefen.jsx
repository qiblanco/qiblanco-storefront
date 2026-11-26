import {LAND_CODES, uidFormOk, uidNorm} from '~/lib/geschaeftskunde';
import {pruefen} from '~/lib/geschaeftskunde.server';

/**
 * /geschaeftskunde/pruefen — Ressourcen-Route für die Live-Prüfung im
 * Login-Fenster (grün/rot). POST {uid, land} -> {ok, status, name}.
 * Der Server prüft bei VIES und schreibt den Nachweis (Zeit, Abfrage-Kennung).
 */
const KOPF = {'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex'};

export function loader() {
  return new Response('Not found', {status: 404, headers: KOPF});
}

export async function action({request, context}) {
  if (request.method !== 'POST') {
    return Response.json({ok: false}, {status: 405, headers: KOPF});
  }
  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ok: false}, {status: 400, headers: KOPF});
  }
  const uid = uidNorm(form.get('uid'));
  const land = String(form.get('land') || '').toUpperCase().slice(0, 2);
  if (!uidFormOk(uid) || !LAND_CODES.has(land)) {
    return Response.json({ok: true, status: 'ungueltig'}, {headers: KOPF});
  }
  const r = await pruefen(context, {uid, land});
  // VIES meldet bei manchen Ländern statt eines Namens '---' (nicht mitgeteilt): dann keinen zeigen.
  const name = /[A-Za-z0-9]/.test(String(r?.name || '')) ? String(r.name).slice(0, 120) : '';
  return Response.json(
    {ok: Boolean(r?.ok), status: r?.status || 'nicht_pruefbar', name},
    {headers: KOPF},
  );
}
