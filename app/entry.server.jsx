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
      // Eigener Sales-Chat-Assistent (s05): das iframe, das der Loader auf
      // <origin>/widget/embed öffnet. STELLE 2 VON 2 — ohne diese Zeile lädt
      // das Loader-Skript, das iframe bleibt aber leer, und zwar STILL.
      ...salesbotWidgetCspQuellen(context.env),
    ],
    connectSrc: [
      "'self'",
      'https://monorail-edge.shopifysvc.com',
      'https://qiblanco-only-rating-serpapi.vercel.app',
      'https://*.reputon.com',
      'https://qiblanco-video.imgix.video',
      'https://*.imgix.video',
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
      // First-Party-Pixel (qpx): Receiver-Origin nur, wenn per env gesetzt.
      ...qpxConnectSrc(context.env),
    ],
    mediaSrc: [
      "'self'",
      'blob:',
      'https://cdn.shopify.com',
      'https://*.imgix.video',
    ],
    fontSrc: [
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
      'https://*.clarity.ms',
      'https://c.bing.com',
      'https://bat.bing.com',
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

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

/** @typedef {import('@shopify/remix-oxygen').AppLoadContext} AppLoadContext */
/** @typedef {import('react-router').EntryContext} EntryContext */
