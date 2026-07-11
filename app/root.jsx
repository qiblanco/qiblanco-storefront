import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useRouteLoaderData,
  useLocation,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import {useEffect, useState} from 'react';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import {PageLayout} from './components/PageLayout';
import '@fontsource-variable/open-sans';
import LoadingBar from './components/LoadingBar';
import {MetaPixel} from './components/MetaPixel';
import {isQiblancoProductionHost} from '~/lib/checkout-tracking';
/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
  ];
}

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    isProductionHost: isQiblancoProductionHost(args.request.url),
    enableTrackingInPreview: env.PUBLIC_ENABLE_TRACKING_IN_PREVIEW === 'true',
    // First-Party-Pixel (qpx): lädt NUR, wenn der Receiver-Endpoint gesetzt ist
    // (Rollout-Schalter; ohne env-Variable ist das Verhalten unverändert).
    qpxEndpoint: env.PUBLIC_QPX_ENDPOINT || '',
    // Cookielose BASIS-Ebene (einwilligungsfrei): lädt NUR, wenn der Basis-
    // Endpoint gesetzt ist (eigener Rollout-Schalter, Default leer = aus).
    // Bewusst UNABHÄNGIG vom Cookiebot-Consent (setzt keine Cookies/kein
    // localStorage/keine persistente ID) — Go-live = diese env + Server
    // (PIXEL_BASIS_MODE=on + Caddy /b), beides Christian-Hand.
    qpxBasisEndpoint: env.PUBLIC_QPX_BASIS_ENDPOINT || '',
    salesbotWidget: getSalesbotWidgetConfig(env, args.request.url),
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');
  const shouldLoadThirdPartyScripts =
    data?.isProductionHost || data?.enableTrackingInPreview;
  const isTrackingPreview =
    Boolean(data?.enableTrackingInPreview) && !data?.isProductionHost;
  const salesbotWidget = data?.salesbotWidget;
  const faviconUrl =
    data?.header?.shop?.brand?.squareLogo?.image?.url ||
    data?.header?.shop?.brand?.logo?.image?.url;

  return (
    <html
      lang="de"
      data-qiblanco-tracking-preview={isTrackingPreview ? 'true' : undefined}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        {shouldLoadThirdPartyScripts && (
          <script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid="66dc4c98-f24c-4dfe-a18b-ac77444136c5"
            data-blockingmode="auto"
            type="text/javascript"
            nonce={nonce}
            async
            suppressHydrationWarning
          />
        )}
        <Meta />
        <Links />
        {shouldLoadThirdPartyScripts && (
          <>
            <script
              src="/cookiebot-shopify-consent-sync.js"
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            <script src="/hotjar.js" nonce={nonce} defer suppressHydrationWarning />
            <script
              src="/qiblanco-tracker.js"
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            <script
              src="/qiblanco-google-tracking.js"
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            <script
              src="https://config.gorgias.chat/bundle-loader/shopify/qi-blanco.myshopify.com"
              data-gorgias-loader-chat=""
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            <script
              src="https://config.gorgias.help/api/contact-forms/replace-mailto-script.js?shopName=qi-blanco"
              data-gorgias-loader-mailto-replace=""
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            <script
              src="https://content.9gtb.com/loader.js"
              data-gorgias-loader-convert=""
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            {data?.qpxEndpoint ? (
              <script
                src="/qiblanco-qpx-loader.js"
                data-qpx-endpoint={data.qpxEndpoint}
                nonce={nonce}
                defer
                suppressHydrationWarning
              />
            ) : null}
            {data?.qpxBasisEndpoint ? (
              // Cookielose Basis-Ebene: BEWUSST direkt (nicht über den
              // Consent-Loader) — einwilligungsfrei, setzt nichts auf dem
              // Endgerät. Ohne PUBLIC_QPX_BASIS_ENDPOINT rendert nichts.
              <script
                src="/qiblanco-qpx-basis.js"
                data-qpx-basis-endpoint={data.qpxBasisEndpoint}
                nonce={nonce}
                defer
                suppressHydrationWarning
              />
            ) : null}
          </>
        )}
      </head>
      <body>
        <LoadingBar />
        {data ? (
          <Analytics.Provider
          cart={data.cart}
          shop={data.shop}
          consent={data.consent}
          >
            <PageLayout {...data}>{children}</PageLayout>
            {(data.isProductionHost || data.enableTrackingInPreview) && (
              <MetaPixel />
            )}
          </Analytics.Provider>
        ) : (
          children
        )}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <SalesbotPreviewFrame config={salesbotWidget} />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function isTruthyEnv(value) {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());
}

function productKeyFromRequestUrl(requestUrl) {
  const pathname = new URL(requestUrl).pathname;
  const match = pathname.match(/^\/products\/([^/]+)/);
  return match?.[1] || '';
}

function getSalesbotWidgetConfig(env, requestUrl) {
  return {
    enabled: isTruthyEnv(env.PUBLIC_SALESBOT_WIDGET_ENABLED),
    origin:
      env.PUBLIC_SALESBOT_WIDGET_ORIGIN ||
      originFromUrl(env.PUBLIC_SALESBOT_WIDGET_SCRIPT_URL),
    tenantId: env.PUBLIC_SALESBOT_WIDGET_TENANT_ID || 'tenant_qiblanco',
    projectId:
      env.PUBLIC_SALESBOT_WIDGET_PROJECT_ID || 'project_qiblanco_sales',
    productKey:
      env.PUBLIC_SALESBOT_WIDGET_PRODUCT_KEY ||
      productKeyFromRequestUrl(requestUrl),
    placement: env.PUBLIC_SALESBOT_WIDGET_PLACEMENT || 'right',
    zIndex: env.PUBLIC_SALESBOT_WIDGET_Z_INDEX || '2147483000',
    initialOpen: String(isTruthyEnv(env.PUBLIC_SALESBOT_WIDGET_INITIAL_OPEN)),
  };
}

function originFromUrl(value) {
  if (!value) return '';

  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

function SalesbotPreviewFrame({config}) {
  const location = useLocation();
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsOpen(isTruthyEnv(config?.initialOpen));
  }, [config?.initialOpen]);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 560px)');
    const updateViewport = () => setIsSmall(query.matches);
    updateViewport();
    query.addEventListener?.('change', updateViewport);
    return () => query.removeEventListener?.('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!config?.origin) return undefined;

    const handleMessage = (event) => {
      if (event.origin !== config.origin) return;
      if (event.data?.type !== 'qiblanco-widget:state') return;
      setIsOpen(Boolean(event.data.isOpen));
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [config?.origin]);

  if (!isMounted || !config?.enabled || !config.origin) return null;

  const productKey = productKeyFromRequestUrl(
    `${window.location.origin}${location.pathname}`,
  );
  const params = new URLSearchParams({
    tenantId: config.tenantId,
    projectId: config.projectId,
    pageUrl: window.location.href,
    initialOpen: config.initialOpen,
  });
  if (productKey) params.set('productKey', productKey);

  const mobileOpen = isOpen && isSmall;
  const placementLeft = config.placement === 'left';
  const frameStyle = {
    position: 'fixed',
    bottom: mobileOpen ? '12px' : '20px',
    left: mobileOpen ? '12px' : placementLeft ? '20px' : 'auto',
    right: mobileOpen ? '12px' : placementLeft ? 'auto' : '20px',
    width: mobileOpen ? 'calc(100vw - 24px)' : isOpen ? '420px' : '86px',
    height: mobileOpen
      ? 'min(620px, calc(100vh - 24px))'
      : isOpen
        ? '620px'
        : '86px',
    border: 0,
    background: 'transparent',
    zIndex: config.zIndex,
    colorScheme: 'normal',
  };

  return (
    <iframe
      id="qiblanco-salesbot-widget-frame"
      title="Qi Blanco Chat"
      src={`${config.origin}/widget/embed?${params.toString()}`}
      allow="clipboard-write"
      aria-label="Qi Blanco Chat"
      style={frameStyle}
    />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage && (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      )}
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
