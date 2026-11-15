import {
  ereignisAusFormular,
  ereignisWeiterleiten,
} from '~/lib/partner-saleskit';

/**
 * Zähler des Sales-Kits: POST /account/partner/ereignis (Ressourcenroute, kein Markup).
 * Job 20261007-sales-kit-stufe2-einbindung-partnerbereich.
 *
 * Die Seite /account/partner meldet hierher jedes geöffnete Kapitel und jeden
 * Kopier-Klick (navigator.sendBeacon, gleicher Ursprung). Diese Route reicht das
 * Ereignis mit dem Kundentoken serverseitig an den Datendienst weiter, genau wie
 * der Loader der Seite. Der Dienst prüft das Token bei Shopify und zählt nur
 * Partner und nur IDs aus dem aktuellen Kit (partnerbereich/data/nutzung.jsonl).
 *
 * Antwort immer ohne Inhalt: der Browser wartet auf nichts. 204 heißt
 * angenommen, nicht gezählt; ob gezählt wurde, entscheidet der Dienst.
 *
 * RÜCKWEG ohne Deploy: PB_EREIGNIS=off in partnerbereich.conf -> der Dienst
 * zählt nichts mehr; diese Route antwortet weiter 204.
 */
export async function action({request, context}) {
  if (request.method !== 'POST') return new Response(null, {status: 405});

  // Fremde Seiten dürfen für einen angemeldeten Partner keine Ereignisse buchen.
  const herkunft = request.headers.get('Origin');
  if (herkunft) {
    let gleich = false;
    try {
      gleich = new URL(herkunft).host === new URL(request.url).host;
    } catch {
      gleich = false;
    }
    if (!gleich) return new Response(null, {status: 403});
  }

  let ereignis = null;
  try {
    ereignis = ereignisAusFormular(await request.formData());
  } catch {
    ereignis = null;
  }
  if (!ereignis) return new Response(null, {status: 400});

  if (!(await context.customerAccount.isLoggedIn())) {
    return new Response(null, {status: 401});
  }
  const token = await context.customerAccount.getAccessToken();
  if (!token) return new Response(null, {status: 401});

  await ereignisWeiterleiten({token, ereignis});
  return new Response(null, {
    status: 204,
    headers: {'Cache-Control': 'no-store'},
  });
}

export async function loader() {
  return new Response(null, {status: 405});
}
