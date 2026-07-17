import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

/**
 * First-Party-Pixel (qpx): erlaubt den Receiver-Origin in connect-src NUR,
 * wenn PUBLIC_QPX_ENDPOINT gesetzt ist. Ohne env-Variable bleibt die CSP
 * unverändert.
 * @param {Record<string, string | undefined>} env
 */
function qpxConnectSrc(env) {
  const endpoint = env?.PUBLIC_QPX_ENDPOINT;
  if (!endpoint) return [];
  try {
    return [new URL(endpoint).origin];
  } catch {
    return [];
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
