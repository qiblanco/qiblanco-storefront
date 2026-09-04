import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  useRouteLoaderData,
  useMatches,
  useLocation,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
// Ebenenleiter, Randabstands-Form und Mindest-Tippziel als :root-Tokens.
// ERZEUGT aus der SSoT (design-meister db/webdesign/web-soll.yaml, Abschnitt
// overlay_ordnung) mit `design-meister/bin/overlay-ordnung css` — nie von Hand
// aendern, sonst laufen Regelwerk und Stylesheet auseinander. Steht bewusst
// VOR app.css: die Datei deklariert nur Custom Properties und ueberschreibt
// nichts, und so ist im Head auf einen Blick sichtbar, woher die Zahlen
// kommen, die weiter unten benutzt werden.
import overlayOrdnungStyles from '~/styles/overlay-ordnung.css?url';
import appStyles from '~/styles/app.css?url';
import redesign3themenStyles from '~/styles/redesign-3themen.css?url';
// Baukasten qb-swipetab: global eingebunden, weil er an mehreren Stellen
// wiederverwendbar sein soll. Wirkt ausschließlich innerhalb von .qb-swipetab —
// eine Seite ohne den Baustein sieht davon baulich nichts.
import qbSwipetabStyles from '~/styles/qb-swipetab.css?url';
// Dokument-/Rechtstext-Seiten (Impressum, Datenschutz, AGB, Widerruf,
// Teilnahmebedingungen, /policies/*): nach demselben Muster global geladen.
// Wirkt ausschließlich innerhalb von .rs-doc — eine Seite ohne diese Klasse
// sieht davon baulich nichts. Bewusst NICHT per links() je Route: genau das
// "daran denken müssen" hat die ungestalteten Rechtsseiten erzeugt.
import rechtstextStyles from '~/styles/rechtstext.css?url';
// Global geladen wie qb-swipetab: ein Route-eigenes links() zoege jede
// nutzende Route in den Design-Gate-Diff. Alles ist auf .eu-gwl gescopt.
import euGewaehrleistungStyles from '~/styles/eu-gewaehrleistung.css?url';
import {hreflangLinks} from '~/lib/hreflang';
import {PageLayout} from './components/PageLayout';
import {EuLabelProvider} from './components/EuGewaehrleistungsLabel';
import '@fontsource-variable/open-sans';
import LoadingBar from './components/LoadingBar';
import {MetaPixel} from './components/MetaPixel';
import {QpxCommerce} from './components/QpxCommerce';
import {UpPromoteTracking} from './components/UpPromoteTracking';
import {isQiblancoProductionHost} from '~/lib/checkout-tracking';
import {strictRegions} from '~/lib/consent-policy';
import {ladeGoogleRating, GOOGLE_RATING_FALLBACK} from '~/lib/googleRating';
import {redirect} from '@shopify/remix-oxygen';
import {pruefeAdWeiche} from '~/lib/ad-weiche.server';
import {salesbotWidgetOrigin, istSalesbotDeutscherShop} from '~/lib/salesbot-widget';
import {SalesbotWidget} from './components/SalesbotWidget';
import {DialogSignal} from './components/DialogSignal';
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
    // Sitewide dynamische Google-Gesamtbewertung + neueste 5-Sterne-Reviews
    // (Fix v2 Punkt 5; Repair 2026-07-31): fail-safe, 6h gecacht (Reputon-
    // Feed, kein Key nötig), fällt auf 4,8/437-Schnappschuss zurück (nie
    // 500en/erfinden).
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
    // Gewählte Seitensprache/Locale des geladenen Shops
    // (storefront.i18n.language; context.js: konstant 'DE' = deutschsprachiger
    // DACH-Storefront). Steuert die store-weite Chat-Weiche AI-Anna vs Gorgias
    // nach dem SHOP, NICHT nach der Besucher-IP (Weichen-Korrektur 2026-07-31).
    storefrontSprache: storefront.i18n.language,
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
  const {pathname} = useLocation();
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
  // STORE-WEITER GO-LIVE DACH (Christian-Freigabe 2026-07-31): in DE/AT/CH
  // rendert der Assistent auf JEDER Seite und verdrängt dort Gorgias; USA und
  // alle Nicht-DACH-Regionen bleiben unverändert auf Gorgias (istSalesbotDach-
  // Region ist fail-closed, s. lib/salesbot-widget.js). Die Region kommt aus
  // dem Root-Loader-Feld `buyerCountry` (Oxygen-Geo-Header, EINMAL pro Dokument
  // aufgelöst) — anders als der pro-Navigation wechselnde `handle` ist die
  // Region über die Session konstant, das eingefrorene Loader-Feld ist hier
  // also KORREKT (kein shouldRevalidate-Problem wie beim handle).
  //
  // Die Testseite /pages/chat-bot (handle.salesbotWidget) bleibt ZUSÄTZLICH
  // erhalten, damit Christians Prüf-Route regionsunabhängig funktioniert.
  const salesbotDeutscherShop = istSalesbotDeutscherShop(data?.storefrontSprache);
  const salesbotAktiv =
    Boolean(data?.salesbotWidgetOrigin) &&
    (salesbotSeite || salesbotDeutscherShop);

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
        {/*
          Nutzungsvorbehalt / TDM reservation (W3C TDMRep), Job 20260729-anti-
          scraping-s04. Dritter Träger neben /.well-known/tdmrep.json und
          robots.txt (beide seit PR #141 live) und Gegenstück zur Prosa-Klausel
          im Impressum (PR #142), die diese maschinenlesbare Erklärung
          ausdrücklich NENNT — Deklaration muss dem realen Bestand entsprechen.
          Der HTML-meta-Träger war im Konzept mitgeplant, fehlte aber real:
          das Live-HTML hatte 0 Treffer. Bewusst hier und NICHT als sitewide
          HTTP-Header: der gehörte nach entry.server.jsx (nicht in ALLOW_GLOB)
          und ließe sich ohne Oxygen-Preview nicht verifizieren.
        */}
        <meta name="tdm-reservation" content="1" />
        {/*
          hreflang-Naht DACH <-> USA — ZENTRAL HIER UND NICHT JE ROUTE.

          WARUM ZENTRAL: die Gegenseite (us-qiblanco-2024,
          snippets/qb-seo-hreflang.liquid) ist EIN Snippet im <head> ihres
          Layouts, das für JEDE Seite dieselbe Tabelle befragt. Läge unsere
          Hälfte in zwanzig einzelnen Routen, wäre die Menge der ausgezeichneten
          Seiten auf beiden Seiten nur so lange gleich, wie niemand eine Route
          vergisst — und ein hreflang, das nur eine Seite ausspricht, wird von
          Google vollständig verworfen. Hier ist die Deckungsgleichheit BAULICH,
          nicht durch Sorgfalt hergestellt: beide Seiten fragen dieselbe Tabelle,
          jede auf ihrer Plattform, an genau einer Stelle.

          Die Tabelle selbst steht in keiner der beiden: sie ist generiert aus
          homepage-bauer/shop-switch/shop-mapping.yaml (SSoT). Kennt sie den
          Pfad nicht, kommt eine leere Liste — dann steht hier nichts, und das
          ist die richtige Antwort. Eine geratene Zuordnung wäre schlechter als
          keine (Begründung im Kopf von app/lib/hreflang.js).

          Vorbild für die Platzierung ist das tdm-reservation-meta darüber:
          eine sitewide Kopfzeile gehört in dieses Layout, nicht in jede Route.
        */}
        {hreflangLinks(pathname).map((l) => (
          <link
            key={l.hrefLang}
            rel={l.rel}
            hrefLang={l.hrefLang}
            href={l.href}
          />
        ))}
        {faviconUrl && <link rel="icon" href={faviconUrl} />}
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={overlayOrdnungStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <link rel="stylesheet" href={redesign3themenStyles}></link>
        <link rel="stylesheet" href={qbSwipetabStyles}></link>
        <link rel="stylesheet" href={rechtstextStyles}></link>
        <link rel="stylesheet" href={euGewaehrleistungStyles}></link>
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
            {/*
              UpPromote-Affiliate-Basis-Code (Third-Party-Store): Queue +
              upTag-Stub + die zwei config-Werte (myshopify_domain, linker zur
              Checkout-Domain). Inert — setzt nichts auf dem Endgerät und sendet
              nichts, deshalb steht er hier ungegatet neben den anderen
              First-Party-Skripten.
              Das einwilligungspflichtige collect.js von uppromote.com steht
              BEWUSST NICHT als eigener Tag hier: ein fester Tag würde bei JEDEM
              Seitenaufruf laden, auch ohne Einwilligung. Es wird von
              <UpPromoteTracking /> unten hinter demselben Cookiebot-
              Marketing-Tor wie das Meta-Pixel nachgeladen.
            */}
            <script
              src="/qiblanco-uppromote-tracker.js"
              nonce={nonce}
              defer
              suppressHydrationWarning
            />
            {/*
              GORGIAS-CHAT ENTFERNT (Christian 2026-07-31, Weichen-Korrektur):
              Auf dem deutschsprachigen DACH-Storefront läuft AI-Anna store-weit
              für ALLE Besucher; der Gorgias-Chat-Loader ist hier dauerhaft raus
              (nicht nur unterdrückt). Rollback = git revert dieses Merges;
              PUBLIC_SALESBOT_WIDGET_ORIGIN=off schaltet AI-Anna ab, bringt den
              Gorgias-Chat NICHT zurück (entfernt). Der separate US-/englische
              Store (us-qiblanco-2024) behält seinen Gorgias-Chat — anderes Repo.
              Die Gorgias mailto-replace-/convert-Loader unten sind KEIN Chat und
              bleiben unverändert.
            */}
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
        {/* Setzt `data-dialog-offen` am <html>, solange eine modale Flaeche
            offen ist. Daran haengt die Unterdrueckung des Chat-Widgets in
            app.css — die Naht zwischen Storefront und qi-salesbot. Rendert
            nichts und steht deshalb bewusst ohne Bedingung hier: die
            Unterdrueckung muss auch dann greifen, wenn das Widget erst per
            Client-Navigation dazukommt. */}
        <DialogSignal />
        <LoadingBar />
        {data ? (
          <Analytics.Provider
          cart={data.cart}
          shop={data.shop}
          consent={data.consent}
          >
            {/*
              EU-Gewaehrleistungs-Mitteilung (VO (EU) 2025/1960, ab
              27.09.2026). Der Provider hält GENAU EIN Overlay je Seite --
              Produktseite und Footer teilen es sich. Er steht hier und nicht
              in den einzelnen Bausteinen, damit nicht jede Naht ein eigenes
              Overlay in den Baum hängt.
            */}
            <EuLabelProvider>
              <PageLayout {...data}>{children}</PageLayout>
            </EuLabelProvider>
            {(data.isProductionHost || data.enableTrackingInPreview) && (
              <>
                <MetaPixel />
                <QpxCommerce />
                {/*
                  UpPromote-Affiliate-Tracking: lädt collect.js nach und gibt
                  cart_updated für den Auto-Rabatt weiter. Steht bewusst HIER im
                  selben Production/Preview-Gate wie Meta/qpx und trägt sein
                  Cookiebot-Marketing-Tor zusätzlich in sich (importiert aus
                  MetaPixel.jsx).
                */}
                <UpPromoteTracking />
              </>
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
  // catchall-404) der Regelfall für unbekannte Pfade — freundlicher
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
      <h1>Hoppla</h1>
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
