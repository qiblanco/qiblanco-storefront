/*
 * EINBETTUNGS-WEICHE als EINE Quelle (Job 20260924-partnerlink-setzt-code-
 * automatisch-und-permalink-einbettungsfest-prio12).
 *
 * Gebaut im Elternjob 20260924-GROSSJOB-partnerlinks-sauber-in-die-kasse-
 * partnerseite-und-mail-an-elina (dort Begründung und Messung). Die Weiche
 * lag zuerst nur in app/entry.server.jsx und griff damit ausschließlich für
 * SEITEN, die React rendert. Der Warenkorb-Permalink /cart/<variante>:<n>
 * (app/routes/cart.$lines.jsx) ist eine Ressourcen-Route: sein Loader
 * antwortet selbst mit einer Weiterleitung auf checkout.qiblanco.com
 * (X-Frame-Options DENY) und kommt an entry.server.jsx nie vorbei. Genau
 * dieser Link starb in Christians Bildschirmfoto vom 2026-09-24 mit
 * ERR_BLOCKED_BY_RESPONSE.
 *
 * Deshalb steht die Weiche hier, und beide Stellen rufen dieselbe Funktion.
 * Wer sie ändert, ändert sie für Seiten UND Permalink.
 *
 * Messung am Rand: partner-manager/pruefungen/probe_permalink_einbettung.py
 * (Rahmen -> Weiter-Seite, direkt -> Kasse) und partner-manager/bin/
 * partnerlink-check (linkart "einbettung").
 * RÜCKWEG: den Aufruf in cart.$lines.jsx bzw. entry.server.jsx entfernen.
 */
const EINBETTUNG_ZIELE = new Set(['iframe', 'frame']);
const EINBETTUNG_FREMD = new Set(['cross-site', 'same-site']);

function htmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Navigation IN einem Rahmen einer FREMDEN Seite? (Sec-Fetch-Dest iframe/frame
 * UND Sec-Fetch-Site cross-site/same-site). Eigene Rahmen, Seitenaufrufe,
 * Datenabrufe und Browser ohne Sec-Fetch-Kopf: nein.
 * @param {Request} request
 * @returns {boolean}
 */
export function istFremderRahmen(request) {
  if (request.method !== 'GET') return false;
  const ziel = (request.headers.get('sec-fetch-dest') || '').toLowerCase();
  const herkunft = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  return EINBETTUNG_ZIELE.has(ziel) && EINBETTUNG_FREMD.has(herkunft);
}

/**
 * @param {Request} request
 * @returns {Response | null}
 */
export function einbettungsWeiche(request) {
  try {
    if (!istFremderRahmen(request)) return null;
    const url = new URL(request.url);
    // Nur die eigene Adresse, nie ein Ziel aus dem Anfrage-Inhalt.
    const weiter = `${url.origin}${url.pathname}${url.search}`;
    const w = htmlEscape(weiter);
    const html = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Weiter zu Qi Blanco</title>
<style>
body{margin:0;font-family:"Open Sans",Arial,sans-serif;background:#faf8f5;color:#2b2b2b}
main{max-width:440px;margin:0 auto;padding:32px 24px;text-align:center}
.marke{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#6b6358;margin:0 0 16px}
h1{font-size:22px;line-height:1.3;margin:0 0 12px;font-weight:600}
p{font-size:15px;line-height:1.5;margin:0 0 20px}
a.knopf{display:inline-block;background:#2b2b2b;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 28px;border-radius:8px}
.klein{font-size:13px;color:#6b6358;margin-top:24px;word-break:break-all}
</style></head>
<body><main>
<p class="marke">Qi Blanco</p>
<h1>Weiter zu Qi Blanco</h1>
<p>Dieser Link öffnet sich in einem eigenen Fenster. Dort kommen Rabatt und Kasse sicher an.</p>
<a class="knopf" data-einbettung-weiter href="${w}" target="_blank" rel="noopener">Jetzt öffnen</a>
<p class="klein">Öffnet sich nichts? Kopiere diese Adresse in deinen Browser:<br>${w}</p>
</main></body></html>`;
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy':
          "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors *",
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        Vary: 'Sec-Fetch-Dest, Sec-Fetch-Site',
      },
    });
  } catch (error) {
    // Die Weiche darf eine Seite nie verhindern: im Zweifel normal rendern.
    console.error(error);
    return null;
  }
}
