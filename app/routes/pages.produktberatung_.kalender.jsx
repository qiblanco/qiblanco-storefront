import {basis} from './pages.produktberatung';
import {verwaltenToken} from '~/lib/produktberatung-verwalten.server';

/**
 * /pages/produktberatung/kalender — die Kalenderdatei des eigenen Termins.
 *
 * Bis 2026-10-08 zeigte der Knopf „In meinen Kalender" direkt auf den
 * Buchungs-Endpunkt mit ?t=<token>&ics=1. Damit stand der Token im HTML und,
 * als Link auf einen fremden Host, beim Klick in der Ausgangs-Klick-Messung
 * der Tracker. Jetzt holt diese Route die Datei mit dem Token aus dem Cookie
 * (lib/produktberatung-verwalten.server.js) und reicht sie durch. Job
 * 20261008-produktberatung-verwalten-token-aus-der-url-vor-den-trackern.
 */
export async function loader({request, context}) {
  const token = verwaltenToken(request);
  const kopf = {'Cache-Control': 'private, no-store'};
  if (!token)
    return new Response(
      'Öffne bitte den Link aus deiner Bestätigungsmail noch einmal.',
      {
        status: 404,
        headers: {...kopf, 'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  try {
    const r = await fetch(
      `${basis(context)}/api/buchung?t=${encodeURIComponent(token)}&ics=1`,
      {signal: AbortSignal.timeout?.(8000)},
    );
    if (r.status !== 200)
      return new Response('Diesen Termin kennen wir nicht.', {
        status: 404,
        headers: {...kopf, 'Content-Type': 'text/plain; charset=utf-8'},
      });
    return new Response(await r.text(), {
      status: 200,
      headers: {
        ...kopf,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition':
          'attachment; filename="produktberatung-qiblanco.ics"',
      },
    });
  } catch {
    return new Response(
      'Die Kalenderdatei lädt gerade nicht. Bitte versuch es gleich noch einmal.',
      {
        status: 503,
        headers: {...kopf, 'Content-Type': 'text/plain; charset=utf-8'},
      },
    );
  }
}
