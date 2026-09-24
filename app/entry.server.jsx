import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import {salesbotWidgetCspQuellen} from '~/lib/salesbot-widget';
import {istStillgelegteJSaleSeite} from '~/data/ten-years-deals';

/**
 * First-Party-Pixel (qpx): erlaubt die Receiver-Origins in connect-src NUR,
 * wenn die jeweilige env-Variable gesetzt ist. Ohne env-Variablen bleibt die
 * CSP unverändert. Berücksichtigt BEIDE Pixel-Endpoints: PUBLIC_QPX_ENDPOINT
 * (qpx) UND PUBLIC_QPX_BASIS_ENDPOINT (cookielose Basis-Ebene /b) — seit der
 * ITP-Härtung (Job 20260726-storefront-tracking-deploy) zeigt der qpx-Endpoint
 * same-origin auf /collect (relativ, 'self' deckt ihn), der Basis-Endpoint
 * bleibt cross-origin und braucht seinen Origin weiterhin — sonst würde der
 * /b-Beacon still per CSP geblockt.
 * @param {Record<string, string | undefined>} env
 */
function qpxConnectSrc(env) {
  const origins = [];
  for (const endpoint of [
    env?.PUBLIC_QPX_ENDPOINT,
    env?.PUBLIC_QPX_BASIS_ENDPOINT,
  ]) {
    if (!endpoint) continue;
    try {
      origins.push(new URL(endpoint).origin);
    } catch {
      // relative Endpoints (same-origin, z.B. '/collect') deckt 'self'
    }
  }
  return [...new Set(origins)];
}

/*
 * ================================================================
 * CSP-MELDEWEG (2026-09-18) — REPORT-ONLY, DER NICHTS DURCHSETZT.
 * ================================================================
 * Die Richtlinie oben ist über Monate gewachsen, und JEDE Zeile
 * darin ist entstanden, nachdem etwas STILL kaputt war: der
 * UpPromote-Sende-Host stand nur im Skript selbst und nirgends in
 * der Einbau-Anleitung; der Salesbot lädt sein Loader-Skript und
 * zeigt ein leeres iframe, wenn nur eine der zwei Stellen fehlt.
 * Beide Male antwortete die Seite HTTP 200, beide Male war das
 * Markup vollständig, beide Male war jede Probe auf das Markup
 * grün. DAS IST DIE FEHLERFORM DIESES KOPFES: er blockiert leise,
 * und nichts im Haus sagt es. Gefunden wurde es jedes Mal dadurch,
 * dass ein Mensch zufällig eine Browser-Konsole offen hatte.
 *
 * Der Report-Only-Kopf dreht genau das um. Er trägt DIESELBE
 * Richtlinie wie der scharfe Kopf und setzt NICHTS durch — er ist
 * per Definition wirkungslos für den Besucher. Sein einziger Zweck
 * ist, dass der Browser jede Blockade, die der scharfe Kopf
 * ohnehin ausführt, zusätzlich MELDET. Der Rückweg ist deshalb
 * trivial: ein Kopf, der nichts erzwingt, kann nichts brechen.
 *
 * WARUM NICHT STRENGER ALS DER SCHARFE KOPF: die übliche Bauform
 * stellt Report-Only strenger, um eine geplante Verschärfung
 * vorzuwarnen. Hier ist die Frage die andere — was wird HEUTE
 * blockiert, ohne dass es jemand erfährt. Dafür muss die gemeldete
 * Richtlinie die DURCHGESETZTE sein, nicht eine zweite.
 *
 * WARUM EIN AUFRUF UND EIN STRING-ANHANG, obwohl
 * createContentSecurityPolicy Zusatz-Direktiven annehmen würde:
 * das Modul erzeugt bei JEDEM Aufruf ein NEUES nonce (2026-09-17
 * am installierten Modul gemessen, sechs Varianten). Ein zweiter
 * Aufruf für den Report-Only-Kopf hätte ein nonce genannt, das die
 * gerenderte Seite nicht trägt — der Browser hätte JEDES legitime
 * Inline-Skript der eigenen Seite gemeldet. Darum: EIN Aufruf, der
 * scharfe Kopf bekommt seinen `header` UNVERÄNDERT, der
 * Report-Only-Kopf ist derselbe String plus eine Direktive.
 *
 * WARUM NUR `report-uri` UND KEIN `report-to` — DAS WIDERSPRICHT
 * DEM URSPRÜNGLICHEN AUFTRAG UND IST GEMESSEN. Die naheliegende
 * Bauform ist "beide setzen, doppelt hält besser". Hermetisch
 * gemessen am Schwester-Laden (2026-09-17, echter headless
 * Chromium, echte Verletzung, derselbe Empfänger, drei Arme mit
 * derselben Verletzung):
 *   report-uri ALLEIN                       -> 1 Zeile abgelegt
 *   report-to ALLEIN + Reporting-Endpoints  -> 0 Zeilen nach 40 s
 *   BEIDE zusammen                          -> 0 Zeilen nach 70 s
 * Die dritte Zeile ist der Befund: `report-to` macht den
 * funktionierenden Weg KAPUTT. Der Browser lässt `report-uri`
 * fallen, sobald `report-to` dasteht — so sieht es die
 * Spezifikation vor —, und liefert die Reporting-API-Meldung dann
 * selbst nicht aus. Wer beide setzt, hat NULL Meldewege statt
 * zwei, und zwar STILL. Das ist exakt die Fehlerform, gegen die
 * dieser Bau gerichtet ist, eine Ebene höher. Wer `report-to`
 * später doch will, braucht ZUERST den positiven Zustellnachweis
 * gegen genau diesen Empfänger. Herleitung: devlog F-041 des
 * Kakao-Ladens.
 *
 * WAS BEWUSST NICHT GESETZT WURDE:
 *   - `report-to` (siehe oben).
 *   - Der Antwort-Kopf `Reporting-Endpoints`. Er bildet den
 *     Gruppennamen von `report-to` auf eine URL ab und ist ohne
 *     diese Direktive ein Kopf ohne Leser. Er fällt mit ihr.
 *   - Der alte `Report-To`-Kopf. Durch `Reporting-Endpoints`
 *     abgelöst und aus demselben Grund gegenstandslos.
 *
 * KOSTEN, BEZIFFERT STATT VERSCHWIEGEN: die Richtlinie steht damit
 * zweimal in jeder Antwort. Gemessen am Kundenrand 2026-09-18:
 * scharfer Kopf 3667 B bei 427 KB Seite, also +0,86 %. Das ist
 * rund das Zehnfache des Schwester-Ladens, weil DIESE Richtlinie
 * zehn Direktiven und ~25 Fremd-Ursprünge führt. Erwähnt, weil es
 * NICHT null ist.
 *
 * RÜCKWEG — UND HIER IST DIESER LADEN ANDERS ALS DER SCHWESTER-
 * LADEN, DESHALB STEHT ES HIER UND NICHT NUR IM RESULT: der
 * Schwester-Laden ist ein Node-Dienst auf unserem Server, dort ist
 * `<VAR>=off` in der .env plus Neustart ein echter Rückweg OHNE
 * Neubau. Hier läuft der Laden auf Oxygen, und sein Laufzeit-env
 * entsteht ausschließlich im `--env-file` des Deploy-Workflows:
 * was dort nicht steht, ist zur Laufzeit WEG (der Workflow sagt
 * das selbst, teuer bezahlt an PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID
 * und einer 500 auf /account/login).
 * DER SCHALTER UNTEN IST DESHALB EIN ERWEITERUNGSPUNKT, KEIN
 * NOTAUSGANG: solange `QIBLANCO_CSP_REPORT` nicht in BEIDEN
 * Stellen des Workflows steht (`env:`-Block UND printf-Zeile), ist
 * er zur Laufzeit undefined und der Default trägt. Wer ihn scharf
 * will, trägt ihn dort nach — und braucht dafür den SSH-Deploy-Key,
 * weil die Workflow-Scope-Sperre jeden PAT-Push auf
 * .github/workflows/ ablehnt (also NICHT über hb-deploy).
 * DER ECHTE RÜCKWEG DIESES BAUS IST DESHALB:
 *   hb-deploy revert --sha <commit> --auftrag <job-id>
 * Er kostet genau so viel wie eine Workflow-Zeile zu ändern — auf
 * Oxygen ist beides ein Commit auf main und derselbe Deploy.
 */
const CSP_BERICHT_ZIEL_DEFAULT = 'https://qpx.65-108-150-121.sslip.io/csp-report';

/**
 * Meldeziel auflösen. Leer oder 'off' = kein Report-Only-Kopf.
 * @param {Record<string, string|undefined>} env
 * @returns {string|null}
 */
function berichtsziel(env) {
  const roh = (env?.QIBLANCO_CSP_REPORT ?? CSP_BERICHT_ZIEL_DEFAULT).trim();
  if (!roh || roh.toLowerCase() === 'off') return null;
  return roh;
}

/*
 * ================================================================
 * EINBETTUNGS-WEICHE (Job 20260924-GROSSJOB-partnerlinks-sauber-in-
 * die-kasse-partnerseite-und-mail-an-elina, Christian 2026-09-24).
 * ================================================================
 * Diese Seite sendet `frame-ancestors 'none'` (unten, scharf), die Kasse
 * checkout.qiblanco.com sendet dasselbe plus `X-Frame-Options: DENY` —
 * die Kasse ist bei Shopify NICHT abschaltbar. Oeffnet ein fremdes Werkzeug
 * einen unserer Links in einem Rahmen (Link-in-Bio-Vorschau, Website-
 * Einbettung, App-Vorschau), zeigt Chrome deshalb nur
 * "... hat die Verbindung abgelehnt / ERR_BLOCKED_BY_RESPONSE". Genau das
 * hat eine Partnerin am 2026-09-24 gemeldet; reproduziert fuer Kassen-,
 * Produkt- und Rabattlink.
 *
 * WAS DIE WEICHE TUT: erkennt eine Navigation IN einem Rahmen einer
 * FREMDEN Seite (Sec-Fetch-Dest iframe/frame UND Sec-Fetch-Site cross-site/
 * same-site) und antwortet statt mit der blockierten Seite mit einer
 * kleinen, einbettbaren Weiter-Seite: ein Knopf, der denselben Link in
 * einem eigenen Fenster oeffnet. Dort laeuft alles wie gewohnt (Rabatt,
 * Zuordnung, Kasse).
 *
 * WARUM DAS NICHTS KAPUTT MACHEN KANN: jede Antwort, die heute unter diese
 * Bedingung faellt, wird vom Browser ohnehin verworfen (frame-ancestors
 * 'none'). Die Weiche ersetzt also nur eine Fehlerseite. Eigene Rahmen
 * (same-origin), normale Seitenaufrufe (document), Datenabrufe (empty) und
 * Browser ohne Sec-Fetch-Kopf laufen unveraendert durch. Die Weiter-Seite
 * enthaelt nur einen Link auf unsere eigene Adresse — kein Formular, keine
 * Aktion, also nichts, was ein fremder Rahmen ausnutzen koennte.
 *
 * MESSUNG: partner-manager/bin/partnerlink-check (taeglich, linkart
 * "einbettung") erkennt die Seite am Attribut data-einbettung-weiter.
 * RUECKWEG: den Aufruf oben in handleRequest entfernen.
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
 * @param {Request} request
 * @returns {Response | null}
 */
function einbettungsWeiche(request) {
  try {
    if (request.method !== 'GET') return null;
    const ziel = (request.headers.get('sec-fetch-dest') || '').toLowerCase();
    const herkunft = (request.headers.get('sec-fetch-site') || '').toLowerCase();
    if (!EINBETTUNG_ZIELE.has(ziel) || !EINBETTUNG_FREMD.has(herkunft)) {
      return null;
    }
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

/**
 * @param {Request} request
 * @param {number} responseStatusCode
 * @param {Headers} responseHeaders
 * @param {EntryContext} reactRouterContext
 * @param {AppLoadContext} context
 */
export default async function handleRequest(
  request,
  responseStatusCode,
  responseHeaders,
  reactRouterContext,
  context,
) {
  /*
   * STILLGELEGTER JUBILÄUMS-SALE (Schalter + Pfadliste: app/data/ten-years-deals.js).
   * Der Guard sitzt bewusst HIER und nicht in den vier Route-Dateien: er greift
   * damit VOR dem Router und schlägt sowohl die Code-Route als auch ein
   * etwaiges gleichnamiges Shopify-Admin-Page-Objekt (letzteres wäre mangels
   * write_content von uns nicht abschaltbar). Die Route-Dateien bleiben
   * unverändert erhalten — stillgelegt ist die Erreichbarkeit, nicht der Code.
   *
   * 404 statt Redirect: ein Redirect-Ziel wäre eine Marketing-Entscheidung, die
   * hier niemand getroffen hat. Das 404 fließt in server.js weiter durch
   * storefrontRedirect — eine in Shopify gepflegte Weiterleitung greift also
   * weiterhin, ohne dass wir eine erfinden.
   */
  if (istStillgelegteJSaleSeite(new URL(request.url).pathname)) {
    return new Response(null, {status: 404});
  }

  // EINBETTUNGS-WEICHE: siehe einbettungsWeiche() unten.
  const einbettung = einbettungsWeiche(request);
  if (einbettung) return einbettung;

  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    defaultSrc: [
      "'self'",
      'https://cdn.shopify.com',
      'https://*.gorgias.chat',
      'https://*.gorgias.help',
      'https://*.gorgias.io',
      'https://*.gorgias-convert.com',
      'https://*.9gtb.com',
      'https://*.9gti.com',
    ],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",
      "'strict-dynamic'",
      'https://cdn.shopify.com',
      'https://cdn.grw.reputon.com',
      'https://qiblanco-only-rating-serpapi.vercel.app',
      'https://qiblanco.activehosted.com',
      'https://consent.cookiebot.com',
      'https://consentcdn.cookiebot.com',
      'https://t.qiblanco.com',
      'https://lg.hyr.so',
      'https://static.icexyz.com',
      'https://app.hyros.com',
      'blob:',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://www.clarity.ms',
      'https://*.clarity.ms',
      'https://config.gorgias.chat',
      'https://config.gorgias.help',
      'https://assets.gorgias.chat',
      'https://client.gorgias.chat',
      'https://content.9gtb.com',
      'https://*.gorgias-convert.com',
      'https://gorgias-convert.com',
      'https://connect.facebook.net',
      // UpPromote-Affiliate-Pixel (collect.js, von UpPromoteTracking.jsx nach
      // Einwilligung nachgeladen). STELLE 1 VON 2 — die zweite ist connect-src
      // weiter unten. Fehlt eine davon, blockt die CSP STILL.
      'https://static-pixel.uppromote.com',
      // Eigener Sales-Chat-Assistent (s05): das Loader-Skript
      // <origin>/embed/qiblanco-widget.js. STELLE 1 VON 2 — die zweite ist
      // frame-src weiter unten. Fehlt eine davon, blockt die CSP STILL.
      ...salesbotWidgetCspQuellen(context.env),
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.shopify.com',
      'https://*.reputon.com',
      'https://qiblanco.activehosted.com',
      'https://consentcdn.cookiebot.com',
      'https://fonts.googleapis.com',
      /*
       * fonts.bunny.net STEHT HIER BEWUSST NICHT, und das ist seit dem
       * 2026-08-24 entschieden (Job 20260824-storefront-hydration-418-und-
       * csp-bunny-prio15, RESULT Entscheidung 2). Verursacher ist NICHT
       * eine Browser-Erweiterung, sondern unser eigenes ActiveCampaign-
       * Embed (embed.php Z. 166), das aus seiner Formular-Font-Einstellung
       * einen bunny-<link> baut — samt defekter Query.
       * Vier Gründe, die unverändert gelten: der Block ist der Status quo
       * und nicht der Schaden (Erlauben würde einen Dritt-Font NEU
       * einführen, nicht etwas wiederherstellen); es ist nicht unser Font;
       * ein Dritt-Font-CDN sähe die Kunden-IP jedes Seitenaufrufs auf einem
       * Cookiebot-geführten Shop; und die kosmetischen Kosten treffen nur
       * Labels im Newsletter-Formular, weil unsere eigene Regel font-family
       * für input/button/._submit ohnehin per !important gewinnt.
       * Behebung gehört an die QUELLE (Font-Einstellung des AC-Formulars
       * id=15 im ActiveCampaign-Konto), nicht in diese Liste.
       * Am 2026-09-18 wieder gemeldet (3 Meldungen, /pages/crystal-cacao) —
       * die Entscheidung wurde geprüft und bestätigt, nicht übersehen.
       */
      'https://assets.gorgias.chat',
      'https://client.gorgias.chat',
    ],
    frameSrc: [
      "'self'",
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://player.vimeo.com',
      'https://*.reputon.com',
      'https://consentcdn.cookiebot.com',
      'https://client.gorgias.chat',
      'https://*.gorgias.chat',
      // Meta-Pixel, STELLE 3 VON 3. www.facebook.com steht seit dem
      // Altbestands-Nachzug in connect-src UND img-src — der Cookie-Sync
      // öffnet zusätzlich ein iframe, und das fällt hier heraus. Gemessen
      // 2026-09-18 auf /products/qihome-air (2 Meldungen).
      'https://www.facebook.com',
      // Eigener Sales-Chat-Assistent (s05): das iframe, das der Loader auf
      // <origin>/widget/embed öffnet. STELLE 2 VON 2 — ohne diese Zeile lädt
      // das Loader-Skript, das iframe bleibt aber leer, und zwar STILL.
      ...salesbotWidgetCspQuellen(context.env),
    ],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      // Shopify-eigene Telemetrie (OpenTelemetry-Kollektor). GLEICHE
      // REGISTRIERBARE DOMAIN wie monorail-edge daneben, also derselbe
      // Anbieter — und dieser Anbieter ist die Plattform, die den ganzen
      // Laden ausliefert. Gemessen 2026-09-18 mit 63 Meldungen die größte
      // Klasse des Tages, durchgehend von 03:44Z bis 07:03Z. Der Host kommt
      // NICHT aus unseren Bundles (0 Treffer in 866 KB über 65 eigene
      // Assets) — er wird von Shopifys eigener Laufzeit gebildet, die wir
      // über cdn.shopify.com in script-src ohnehin tragen.
      'https://otlp-http-production.shopifysvc.com',
      'https://qiblanco-only-rating-serpapi.vercel.app',
      'https://*.reputon.com',
      // Video-Auslieferung, seit 2026-09-18 auf imgix.net (Vorgang
      // EL-20260814-9a7f9a50). Der Wildcard *.imgix.video stand hier für den
      // 302 auf stream.media.imgix.video, den der .video-Weg für HLS machte.
      // Auf .net gibt es diesen Sprung nicht: Manifest UND Segmente liegen auf
      // qiblanco-video.imgix.net und werden relativ referenziert (gemessen
      // 2026-09-18). Ein Host genügt, der Wildcard entfällt.
      'https://qiblanco-video.imgix.net',
      'https://qiblanco.activehosted.com',
      'https://*.myshopify.dev',
      'https://*.vimeo.com',
      'https://*.vimeocdn.com',
      'https://t.qiblanco.com',
      'https://lg.hyr.so',
      'https://static.icexyz.com',
      'https://app.hyros.com',
      'https://www.google-analytics.com',
      'https://region1.google-analytics.com',
      'https://analytics.google.com',
      'https://stats.g.doubleclick.net',
      /*
       * ================================================================
       * BELEGTE TRACKING-URSPRÜNGE (2026-09-18, Großjob-Segment s03).
       * ================================================================
       * Jede Zeile bis zum Ende dieses Blocks ist am Kundenrand GEMESSEN,
       * nicht vermutet: sauberer Chromium ohne Erweiterungen, live auf
       * qiblanco.com, Einwilligung angenommen, Initiator-Kette je Ursprung
       * aus CDP-Stackframes. Jede Kette endet in UNSERER eigenen Datei —
       * app/root.jsx:556 -> public/qiblanco-google-tracking.js ->
       * gtm.js?id=GTM-N7DRSN5 —, und jeder Anbieter trägt UNSERE Konto-ID
       * (Hotjar 1218483, Taboola 1695700, TikTok CDLS75JC77U4R0MG10QG und
       * CIE7FTBC77U6OH8ULQ20). Die Gegenhypothese "das sind Erweiterungen
       * der Besucher" ist widerlegt: derselbe Browser OHNE Einwilligung
       * erzeugt 0 Verletzungen bei 163 Requests, MIT Einwilligung 114 bei
       * 242.
       *
       * WAS OHNE DIESE ZEILEN PASSIERT, und es ist nicht das, wonach es
       * aussieht: die DURCHGESETZTE Richtlinie ist byte-identisch mit der
       * Report-Only-Richtlinie (einziger Unterschied: report-uri). Das ist
       * also kein Report-Only-Befund. Diese Messpunkte sterben JETZT bei
       * jedem eingewilligten Besucher — GA4-Hauptmesspunkt
       * region1.analytics.google.com mit 43 Meldungen, TikTok mit 105.
       *
       * WILDCARD ODER EXAKTER HOST — die Entscheidung steht je Anbieter:
       * bei TikTok, Taboola und Hotjar wächst die HOST-Menge (16 -> 22 ->
       * 23 gemeldete Klassen binnen 30 Minuten), die ANBIETER-Menge nicht.
       * Dort steht die Wildcard auf der Anbieter-Domain, und sie ist
       * ausdrücklich BREITER als der gemessene Host: *.tiktok.com erlaubt
       * jeden TikTok-Host, nicht nur analytics.tiktok.com. Das ist gewollt
       * und kostet, was ein Anbieter kostet, dem wir ohnehin ein Konto und
       * ein Skript im eigenen GTM anvertrauen. Bei Bing, GA4 und
       * DoubleClick bleibt es beim exakten Host: dort ist die Hausform
       * schon exakt (stats.g.doubleclick.net, region1.google-analytics.com)
       * und die Menge wächst nicht.
       */
      // GA4-Regionalendpunkt. Der Nachbar region1.google-analytics.com steht
      // seit jeher oben — dies ist der neue Hostname derselben Sache, und ein
      // Namens-Beinahetreffer ist keine Deckung.
      'https://region1.analytics.google.com',
      // Bing UET (bat.js aus dem eigenen GTM). bat.bing.com steht schon in
      // img-src: das ist die Hausform STELLE 1 VON 2 — das Bild lädt, der
      // Beacon stirbt. bat.bing.net ist der Geschwisterhost derselben Kette.
      'https://bat.bing.com',
      'https://bat.bing.net',
      // Google Ads / DoubleClick aus gtm.js:422. stats.g.doubleclick.net
      // steht oben, ad.doubleclick.net und cm.g.doubleclick.net nicht.
      'https://ad.doubleclick.net',
      'https://cm.g.doubleclick.net',
      // TikTok, zwei eigene Pixel-IDs. Zwei Domains, nicht eine:
      // analytics.tiktok.com und analytics-ipv6.tiktokw.us.
      'https://*.tiktok.com',
      'https://*.tiktokw.us',
      // Taboola (Konto 1695700). Gemessen: trc-events, cds, pips, psb —
      // vier Hosts in einer halben Stunde, deshalb die Anbieter-Domain.
      'https://*.taboola.com',
      // Hotjar (Site 1218483). ZWEI Domains und zwei Schemata: die
      // Messpunkte liegen auf *.hotjar.io, der Sitzungs-Socket auf
      // wss://ws.hotjar.com. Wer nur eine davon schreibt, heilt die Hälfte.
      'https://*.hotjar.io',
      'wss://*.hotjar.com',
      /*
       * GOOGLE-CCTLD-MATCHING — HIER IST WILDCARD BAULICH KEINE OPTION.
       * CSP kennt keine TLD-Wildcard: 'https://www.google.*' ist keine
       * gültige Quelle (der Stern ist nur als Host-PRÄFIX erlaubt), und
       * 'https://*.google.com' deckt google.de nicht. Wer "Wildcard auf die
       * Anbieter-Domain" hier wörtlich nimmt, schreibt eine Zeile, die der
       * Browser verwirft — die Klasse bleibt blockiert, und die Datei sieht
       * geheilt aus.
       * Google wählt den Cookie-Matching-Host nach dem Standort des
       * Abrufenden; es gibt über 190 davon. Alle aufzuzählen kostet rund
       * 4,2 KB je Direktive, in zwei Direktiven und bei einer Richtlinie,
       * die zweimal je Antwort ausgeht: rund 16,7 KB auf eine 427-KB-Seite
       * (+3,9 %). Dafür ist ein Remarketing-Ping aus rund 180 seltenen
       * Ländern zu wenig. Aufgenommen wird deshalb NUR, was gemessen ist.
       * WAS SICH AM 2026-09-18 GEÄNDERT HAT, und zwar nicht die Meinung,
       * sondern die Datenlage: der Absatz darüber hielt die ccTLD-Frage
       * für eine img-src-Frage und nannte die übrigen ccTLDs eine "offene
       * Flanke mit Melder". Der Melder hat geliefert. Fünf Stunden später
       * standen ZEHN weitere ccTLDs in csp.db (at, cm, co.id, co.jp, co.th,
       * co.uk, gr, nl, rs — und at zusätzlich auf connect-src, wo laut
       * jenem Absatz "genau ein Host" liegen sollte).
       *
       * DAMIT IST DIE REGEL "NUR WAS GEMESSEN IST" WIDERLEGT — nicht als
       * Nachlässigkeit, sondern rechnerisch: sie erzeugt je neuem
       * Besucherland eine neue Klasse, einen neuen Vorgang und einen neuen
       * Nachtrag, und der Tagesdeckel des Auflösers liegt bei zwei
       * Meldungen. Eine Menge, die schneller wächst, als man sie abträgt,
       * ist keine Liste, sondern ein Laufband.
       *
       * DIE MENGE WIRD DESHALB AB HIER ABGELEITET STATT GEMESSEN, und die
       * Ableitung hat eine Quelle im Haus: MARKT_LAENDER in
       * app/lib/markt-pricing.js — DE, AT, CH, LI, US, GB. Das ist die
       * Länderliste, für die dieser Laden überhaupt gebaut ist (Preis,
       * Steuersatz, Währung). Ein Remarketing-Ping ist genau dort etwas
       * wert, wo wir auch liefern und abrechnen können.
       *
       * Aufgenommen ist damit VOLLSTÄNDIG und im Voraus:
       *   DE -> google.de · AT -> google.at · CH -> google.ch
       *   LI -> google.li · US -> google.com · GB -> google.co.uk
       * google.li und google.co.uk stehen hier, BEVOR eine Meldung sie
       * verlangt — das ist der Unterschied zwischen einer abgeleiteten und
       * einer nachgetragenen Liste. Kosten: 6 Hosts je Direktive, rund
       * 150 Byte, gegen die 4,2 KB einer Vollaufzählung aller ~190.
       *
       * NICHT ERLAUBT UND BEWUSST WEITER BLOCKIERT: jede ccTLD ausserhalb
       * MARKT_LAENDER — gemessen sind das heute google.gr (3), google.nl,
       * google.cm, google.co.id, google.co.jp, google.co.th, google.rs (je
       * 1). Diese Besucher kaufen nicht bei uns; ihr Audience-Ping ist
       * nichts wert. Der csp-auflöser wird sie weiter melden, und nach
       * sieben Tagen als [BEFUND:ALTBESTAND-OFFEN] — DAS IST DIE RICHTIGE
       * ANTWORT UND KEIN UNERLEDIGTER REST. Wer sie einzeln nachträgt,
       * stellt das Laufband wieder an.
       * DER EINZIGE ANLASS, hier eine Zeile zu ergänzen, ist ein neues
       * MARKT_LAND. Bewacht: probe_csp_richtlinie_trägt_marktlaender.py
       * liest MARKT_LAENDER aus markt-pricing.js und fällt rot, sobald ein
       * Marktland hier keinen Host hat.
       *
       * ZWEI ZEILEN IN img-src STEHEN AUSSERHALB DIESER ABLEITUNG, und sie
       * sind kein Gegenbeispiel: google.cz ist ein gemessener Nachtrag vom
       * selben Morgen (#502) aus der Zeit vor der Regel und bleibt stehen,
       * weil Entfernen einen Deploy kostet und nichts bringt. google.fi ist
       * die ccTLD unseres eigenen MESSPLATZES und trägt dort eine eigene,
       * weiterhin gültige Begründung — siehe img-src.
       */
      'https://www.google.com',
      'https://www.google.de',
      'https://www.google.at',
      'https://www.google.ch',
      'https://www.google.li',
      'https://www.google.co.uk',
      // Google Tag Manager, STELLE 3 VON 3. gtm.js wird von script-src
      // geladen und von img-src gepingt — beides steht seit jeher. Der
      // Container sendet zusätzlich per fetch/beacon zurück, und das
      // fällt hier heraus. Gemessen 2026-09-18, 4 Meldungen.
      'https://www.googletagmanager.com',
      // Google Ads Conversion Linker. Nachbar von doubleclick und
      // googletagmanager, die beide schon stehen; dieser Host stand auf
      // KEINER Direktive. Gemessen 2026-09-18 auf /products/qibracelet,
      // 3 Meldungen auf connect-src und 3 auf img-src — also beide Stellen.
      'https://www.googleadservices.com',
      'https://*.clarity.ms',
      'https://consent.cookiebot.com',
      'https://consentcdn.cookiebot.com',
      'https://config.gorgias.chat',
      'https://config.gorgias.help',
      'https://*.gorgias.chat',
      'https://*.gorgias.io',
      'https://*.gorgias.help',
      'wss://*.gorgias.chat',
      'wss://*.gorgias.io',
      'https://content.9gtb.com',
      'https://*.9gtb.com',
      'https://*.9gti.com',
      'https://gorgias-convert.com',
      'https://*.gorgias-convert.com',
      'https://www.facebook.com',
      'https://connect.facebook.net',
      // UpPromote-Affiliate-Pixel: die Messpunkte, die collect.js sendet
      // (Klick-Zuordnung + cart_updated). STELLE 2 VON 2 zu script-src oben.
      //
      // ZWEI HOSTS, UND SIE SIND VERSCHIEDEN — das ist keine Redundanz:
      // GELADEN wird collect.js von static-pixel.uppromote.com (script-src),
      // GESENDET wird an pixel.uppromote.com. Der Sende-Host steht nur im
      // Skript selbst (`pixelHost:"https://pixel.uppromote.com"`), nie im
      // src-Attribut und nicht in der Einbau-Anleitung des Herstellers.
      // Fehlt er hier, blockt die CSP den POST auf /api/logs — und das ist
      // KEIN Teilausfall: der Server erfährt vom Klick nichts, und weil das
      // Folgeereignis `affiliate_tracked` ausschließlich im .then() dieses
      // POSTs gefeuert wird (ohne .catch()), stehen auch Linker und Redirect
      // still. Gemessen 2026-08-25 am ausgelieferten Bundle, Großjob s03.
      'https://static-pixel.uppromote.com',
      'https://pixel.uppromote.com',
      // First-Party-Pixel (qpx): Receiver-Origin nur, wenn per env gesetzt.
      ...qpxConnectSrc(context.env),
    ],
    mediaSrc: [
      "'self'",
      'blob:',
      'https://cdn.shopify.com',
      // Safari spielt HLS nativ über video.src — das faellt auf mediaSrc,
      // nicht auf connectSrc. Beide Listen müssen denselben Host tragen,
      // sonst läuft das Video in genau einem Browser nicht.
      'https://qiblanco-video.imgix.net',
    ],
    fontSrc: [
      /*
       * images.simplycodes.com steht hier bewusst NICHT. Anders als bunny
       * daneben ist das wirklich eine Browser-Erweiterung des Besuchers
       * (SimplyCodes, ein Gutschein-Add-on): 0 Treffer in 866 KB über
       * unsere 65 eigenen Assets, und das Meldemuster ist der Beweis —
       * 27 Schriftdateien in EINER Sekunde (2026-09-18T03:44:10Z, zuerst
       * und zuletzt identisch) aus einer einzigen Sitzung, danach nie
       * wieder. Ein Anbieter, den wir einbinden, meldet sich über den Tag
       * verteilt; eine Erweiterung feuert einmal beim Aufklappen.
       * Wir weiten die Richtlinie nicht für Software, die der Kunde
       * installiert hat: sie gehört ihm, nicht uns, und ihr Ausfall ist
       * für seinen Kauf folgenlos.
       */
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://cdn.grw.reputon.com',
      'https://fonts.gstatic.com',
      'https://assets.gorgias.chat',
      'https://client.gorgias.chat',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://cdn.shopify.com',
      'https://i.ytimg.com',
      'https://*.googleusercontent.com',
      'https://lh3.googleusercontent.com',
      'https://maps.googleapis.com',
      'https://maps.gstatic.com',
      'https://cdn.grw.reputon.com',
      'https://i.vimeocdn.com',
      'https://i.ytimg.com',
      'https://t.qiblanco.com',
      'https://lg.hyr.so',
      'https://static.icexyz.com',
      'https://app.hyros.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://stats.g.doubleclick.net',
      // GA4-Regionalendpunkt, STELLE 2 VON 2 zu connect-src oben. Der
      // Messpunkt hat zwei Transporte: fetch/beacon (connect-src, seit s03)
      // und den Zählpixel (hier). Bisher deckte img-src nur den GLOBALEN
      // Endpunkt www.google-analytics.com — der regionale fehlte, also genau
      // der, den GA4 für diesen Laden tatsächlich wählt. Ein
      // Namens-Beinahetreffer ist keine Deckung. Gemessen 2026-09-19 auf
      // /pages/schlaf-zellen-schutz, 1 Meldung; exakter Host, weil bei GA4
      // die Hausform exakt ist und die Hostmenge nicht wächst.
      'https://region1.analytics.google.com',
      'https://*.clarity.ms',
      'https://c.bing.com',
      'https://bat.bing.com',
      // Belegte Tracking-Urspruenge (2026-09-18, s03) — Herleitung, Messung
      // und die Wildcard-Entscheidung stehen einmal bei connect-src oben.
      // Hier stehen nur die Ursprünge, die als img-src gemeldet wurden.
      'https://ad.doubleclick.net',
      'https://cm.g.doubleclick.net',
      'https://*.tiktok.com',
      'https://*.tiktokw.us',
      // Taboola (Konto 1695700), STELLE 2 VON 2 zu connect-src oben. img-src
      // führte bisher GAR KEIN Taboola, während connect-src die
      // Anbieter-Domain seit s03 trägt — der Beacon lebte, das Zählbild
      // starb. Gemessen 2026-09-20 auf /pages/superhuman (trc.taboola.com,
      // 1 Meldung). WILDCARD und nicht der gemessene Host: die
      // Anbieter-Entscheidung steht bei connect-src oben und gilt hier
      // unverändert — Taboolas HOSTmenge wächst (trc-events, cds, pips,
      // psb, jetzt trc), seine Anbietermenge nicht. Wer hier 'trc' literal
      // schreibt, stellt das Laufband wieder an, das der ccTLD-Block oben
      // beschreibt.
      'https://*.taboola.com',
      // Google-ccTLD-Matching aus gtm.js:422. Die Liste ist seit dem
      // 2026-09-18 ABGELEITET statt gemessen: sie ist genau MARKT_LAENDER
      // aus app/lib/markt-pricing.js. Herleitung, Kostenrechnung und die
      // Liste der bewusst WEITER blockierten ccTLDs stehen einmal bei
      // connect-src oben — hier nicht wiederholt, damit sie nicht
      // auseinanderlaufen können.
      'https://www.google.com',
      'https://www.google.de',
      'https://www.google.at',
      'https://www.google.ch',
      'https://www.google.li',
      'https://www.google.co.uk',
      // ZWEI ZEILEN AUSSERHALB DER ABLEITUNG, und beide bleiben mit Grund:
      // .cz ist ein gemessener Nachtrag vom selben Morgen (#502) aus der
      // Zeit vor der Regel — entfernen kostet einen Deploy und bringt
      // nichts. .fi steht in csp.db NIE und gehört trotzdem hierher: es
      // ist die ccTLD, die GOOGLE UNSEREM MESSPLATZ zuweist. Wer künftig
      // vom Server aus am Kundenrand misst, sieht sie — ohne diese Zeile
      // liest er den Standort des Servers als Misserfolg des Baus.
      'https://www.google.cz',
      'https://www.google.fi',
      // Google Ads Conversion Linker — STELLE 2 VON 2 zu connect-src oben.
      // Gemessen 2026-09-18 auf BEIDEN Direktiven mit je 3 Meldungen; wer
      // nur eine schreibt, heilt die Hälfte.
      'https://www.googleadservices.com',
      // Meta-Pixel: connect.facebook.net steht in script-src UND
      // connect-src, www.facebook.com daneben in img-src — der Pixel lädt
      // sein Zählbild aber von connect.facebook.net. Ein
      // Namens-Beinahetreffer ist keine Deckung. Gemessen 2026-09-18 auf
      // /products/qione-kette, 2 Meldungen.
      'https://connect.facebook.net',
      'https://assets.gorgias.chat',
      'https://client.gorgias.chat',
      'https://*.gorgias.chat',
      'https://*.gorgias.io',
      'https://*.gorgias-convert.com',
      'https://www.facebook.com',
    ],
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  // Meldeweg: siehe den Block CSP-MELDEWEG am Kopf dieser Datei.
  // `header` geht UNVERÄNDERT in den scharfen Kopf darüber — dieser
  // Zweig liest ihn nur, er schreibt ihn nie um.
  const berichtZiel = berichtsziel(context.env);
  if (berichtZiel) {
    responseHeaders.set(
      'Content-Security-Policy-Report-Only',
      `${header}; report-uri ${berichtZiel}`,
    );
  }

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('react-router').EntryContext} EntryContext */
