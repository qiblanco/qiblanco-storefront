import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useRouteLoaderData,
  useMatches,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import redesign3themenStyles from '~/styles/redesign-3themen.css?url';
import {PageLayout} from './components/PageLayout';
import '@fontsource-variable/open-sans';
import LoadingBar from './components/LoadingBar';
import {MetaPixel} from './components/MetaPixel';
import {isQiblancoProductionHost} from '~/lib/checkout-tracking';
import {strictRegions} from '~/lib/consent-policy';
import {ladeGoogleRating, GOOGLE_RATING_FALLBACK} from '~/lib/googleRating';
import {redirect} from '@shopify/remix-oxygen';
import {pruefeAdWeiche} from '~/lib/ad-weiche.server';
import {salesbotWidgetOrigin} from '~/lib/salesbot-widget';
import {SalesbotWidget} from './components/SalesbotWidget';
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
  // AD-TRAFFIC-WEICHE (Auftrag 20260724-ads-umleiten-schlafzellen-v2, Christian
  // 2026-07-24): erkannter Paid-Klick (utm_medium=paid / gclid & Co., Vetos +
  // Ausschluesse in ad-weiche.server.js) landet auf JEDER Route serverseitig
  // 302 auf LP A — vor jeder Datenarbeit; organischer Traffic kostet nichts.
  const adWeicheZiel = await pruefeAdWeiche(args.request);
  if (adWeicheZiel) {
    throw redirect(adWeicheZiel, {
      status: 302,
      headers: {'Cache-Control': 'no-store'},
    });
  }

  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    // Sitewide dynamische Google-Gesamtbewertung (Fix v2 Punkt 5): fail-safe,
    // 24h gecacht, fällt ohne API-Key auf 4,8/429 zurück (nie 500en/erfinden).
    googleRating: await ladeGoogleRating(args.context).catch(
      () => ({...GOOGLE_RATING_FALLBACK}),
    ),
    isProductionHost: isQiblancoProductionHost(args.request.url),
    enableTrackingInPreview: env.PUBLIC_ENABLE_TRACKING_IN_PREVIEW === 'true',
    // Region-aware Consent-Policy (Job 20260718): Oxygen-Geo-Land + Streng-
    // Regionen-Konfig als data-Attribute an den Client (tracker/qpx-loader).
    // Ohne PUBLIC_CONSENT_STRICT_REGIONS bleibt clientseitig ALLES beim
    // strengsten Consent-Verhalten (fail-closed, s. consent-policy.js).
    // Seit Job 20260724 (Consent-Mode-v2 EWR/UK-Floor): der Client bekommt
    // die AUFGELÖSTE Liste (Env vereinigt mit EEA_UK_STRICT_FLOOR), nicht
    // die rohe Env — so erben alle Client-Skripte den Floor automatisch.
    buyerCountry: args.request.headers.get('oxygen-buyer-country') || '',
    consentStrictRegions: strictRegions(env).join(','),
    // First-Party-Pixel (qpx): lädt NUR, wenn der Receiver-Endpoint gesetzt ist
    // (Rollout-Schalter; ohne env-Variable ist das Verhalten unverändert).
    qpxEndpoint: env.PUBLIC_QPX_ENDPOINT || '',
    // Cookielose BASIS-Ebene (einwilligungsfrei): lädt NUR, wenn der Basis-
    // Endpoint gesetzt ist (eigener Rollout-Schalter, Default leer = aus).
    // Bewusst UNABHÄNGIG vom Cookiebot-Consent (setzt keine Cookies/kein
    // localStorage/keine persistente ID) — Go-live = diese env + Server
    // (PIXEL_BASIS_MODE=on + Caddy /b), beides Christian-Hand.
    qpxBasisEndpoint: env.PUBLIC_QPX_BASIS_ENDPOINT || '',
    // Eigener Sales-Chat-Assistent (s05): der Origin des Bots. Default ist
    // der in s03 scharf geschaltete Edge, `PUBLIC_SALESBOT_WIDGET_ORIGIN=off`
    // schaltet ab (lib/salesbot-widget.js). Dieser Wert sagt NUR, OB der
    // Assistent verfügbar ist — WO er erscheint, entscheidet der
    // `handle`-Export der Route, nicht dieser Loader (siehe Layout).
    salesbotWidgetOrigin: salesbotWidgetOrigin(env),
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

  // ── WEICHE FÜR DEN EIGENEN CHAT-ASSISTENTEN (s05) ────────────────────────
  // Christians Vorgabe: der Assistent läuft ausschließlich auf der Route,
  // die ihn anfordert (heute /pages/chat-bot) — überall sonst bleibt Gorgias
  // unangetastet. Die Route erklärt das selbst über ihren `handle`-Export:
  //
  //     export const handle = {salesbotWidget: true};
  //
  // WARUM AUS DEN MATCHES UND NICHT AUS DEM ROOT-LOADER: `shouldRevalidate`
  // oben gibt für Sub-Navigationen bewusst `false` zurück — der Root-Loader
  // läuft bei Client-Navigation NICHT neu. Ein Loader-Feld wäre also nach dem
  // ersten Seitenaufruf eingefroren (Assistent würde bei SPA-Navigation auf
  // die Testseite fehlen und auf fremden Seiten hängenbleiben). `handle` kommt
  // aus den Matches und ist damit bei JEDER Navigation aktuell — und root.jsx
  // braucht keinen hartcodierten Pfad.
  //
  // SERVERSEITIG: die Matches stehen schon beim SSR fest, der Loader-Tag ist
  // deshalb auf fremden Seiten gar nicht erst im HTML — nicht bloß per CSS
  // versteckt.
  const matches = useMatches();
  const salesbotSeite = (matches || []).some(
    (match) => match?.handle?.salesbotWidget === true,
  );
  const salesbotAktiv = salesbotSeite && Boolean(data?.salesbotWidgetOrigin);

  const faviconUrl =
    data?.header?.shop?.brand?.squareLogo?.image?.url ||
    data?.header?.shop?.brand?.logo?.image?.url;

  return (
    <html
      lang="de"
      data-qiblanco-tracking-preview={isTrackingPreview ? 'true' : undefined}
      data-qb-region={data?.buyerCountry || undefined}
      data-qb-consent-strict={data?.consentStrictRegions || undefined}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={redesign3themenStyles}></link>
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
            {!salesbotAktiv && (
              // GORGIAS-CHAT — auf JEDER Seite ausser der, auf der unser
              // eigener Assistent aktiv läuft. Zwei Chat-Starter gleichzeitig
              // gehen baulich nicht gut: beide docken bottom-right an und
              // nutzen beide das z-index-Maximum (Stapel-Reihenfolge nicht
              // deterministisch), dazu doppelter Focus-Trap und doppelte
              // aria-live-Ansage für Screenreader — auf Mobil ist ohnehin kein
              // Platz für zwei.
              //
              // Die Bedingung hängt am AKTIVEN Assistenten, nicht an der
              // Route: schaltet PUBLIC_SALESBOT_WIDGET_ORIGIN=off den
              // Assistenten ab, kehrt Gorgias hier automatisch zurück — die
              // Seite steht nie ohne Chat da.
              //
              // Die zwei Gorgias-Loader darunter (mailto-replace, convert)
              // bleiben ABSICHTLICH auch hier aktiv: sie rendern keinen
              // konkurrierenden Chat-Starter, und ein grösserer Diff hätte nur
              // mehr Risiko ohne Nutzen.
              <script
                src="https://config.gorgias.chat/bundle-loader/shopify/qi-blanco.myshopify.com"
                data-gorgias-loader-chat=""
                nonce={nonce}
                defer
                suppressHydrationWarning
              />
            )}
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
        {/*
          EIGENER SALES-CHAT-ASSISTENT (s05) — BEWUSST AUSSERHALB des
          shouldLoadThirdPartyScripts-Blocks darüber.

          Jenes Gate ist `isProductionHost || enableTrackingInPreview` und
          schützt DRITT-Anbieter-Tracking (Cookiebot, Gorgias, Meta, qpx). Der
          Assistent ist unser EIGENER Dienst: er setzt im Eltern-Dokument
          keinen Cookie, liest keinen, und trägt seine Einwilligung selbst IM
          iframe (Zustimmungs-Screen vor dem ersten Modell-Aufruf, nicht vor
          dem iframe-Load). Stünde er im Gate, wäre er auf jedem Preview-Host
          und auf localhost unsichtbar — die Seite liesse sich dann vor dem
          Go-live nicht prüfen.
        */}
        {salesbotAktiv && (
          <SalesbotWidget origin={data.salesbotWidgetOrigin} nonce={nonce} />
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
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
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

  // 404 ist seit dem Catch-All-Umbau (Auftrag 20260720-ads-lpa-s02-
  // catchall-404) der Regelfall fuer unbekannte Pfade — freundlicher
  // deutscher Textblock statt "Oops" (bewusst klein, kein Redesign).
  if (errorStatus === 404) {
    return (
      <div className="route-error">
        <h1>Seite nicht gefunden</h1>
        <p>
          Diese Seite existiert leider nicht oder ist umgezogen.
        </p>
        <p>
          <a href="/">Zur Startseite</a>
        </p>
      </div>
    );
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
