import {useLoaderData} from 'react-router';
import {ChatBotTestseite} from '~/components/campaign/ChatBotTestseite';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import chatBotStyles from '~/styles/chat-bot.css?url';

/**
 * /pages/chat-bot — Testseite für den neuen KI-Chat-Assistenten
 * (Grossjob 20260728-leon-chatbot-live-pages-chatbot, Segment s04).
 *
 * Inhaltlich eine Kopie der bewährten LP A /pages/schlaf-zellen-schutz: die
 * Seite rendert deren Original-Komponente unverändert, damit Christian den
 * Assistenten in einem ECHTEN Kaufkontext testet und nicht auf einer
 * Attrappe. Der Chat selbst kommt im Folge-Segment s05 dazu.
 *
 * DESIGN: geteilte Token-Quelle styles/schlaf-zellen-schutz.css (Scope .lp-a3,
 * gleiches Ableitungs-Muster wie /pages/partner) + additive styles/chat-bot.css
 * (nur lp-cb-*-Regeln). Keine Änderung an Bestandsdateien.
 *
 * TRACKING-NAHT: KEIN Redirect in diesem Loader, KEIN eigener Pixel, KEINE
 * neuen Cookies — die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout
 * (D-006, keine Doppelzählung). TRACKING_COOKIE_NAMES bleibt unverändert.
 */

/**
 * WIDGET-WEICHE (Segment s05): DIESE Route — und nur sie — fordert den eigenen
 * Chat-Assistenten an. `app/root.jsx` liest das Flag über `useMatches()` und
 * rendert daraufhin den Loader im <head>, während es den Gorgias-Chat-Loader
 * für genau diesen Seitenaufruf auslässt (ein Chat-Starter, nicht zwei).
 *
 * WARUM HIER UND NICHT IN root.jsx: die Route weiss selbst, was sie braucht —
 * root.jsx bleibt frei von hartcodierten Pfaden, und die Weiche greift schon
 * beim SSR (der Loader steht auf fremden Seiten gar nicht im HTML) UND bei
 * Client-Navigation (Matches sind immer aktuell, der Root-Loader wäre es
 * wegen `shouldRevalidate: false` nicht).
 *
 * Abschalten des Assistenten ohne Code-Änderung:
 * `PUBLIC_SALESBOT_WIDGET_ORIGIN=off` — dann kehrt hier der Gorgias-Chat
 * zurück, die Seite bleibt also nie ohne Chat.
 */
export const handle = {salesbotWidget: true};
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: chatBotStyles},
  ];
}

/**
 * noindex, nofollow — Testseite, kein Suchmaschinen-Ziel (Christian-Nachtrag
 * 28.07.2026). Doppelgate wie die Schwester-LPs (Hausmuster D-006):
 * Meta-robots UND X-Robots-Tag, damit das Signal auch greift, wenn ein Bot das
 * HTML-head nicht parst. BEWUSST KEIN canonical (noindex + fremdes canonical =
 * widersprüchliche Signale).
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Chat-Assistent im Test — QiOne® 2 Pro | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag als zweite, vom HTML unabhängige Sperre (Hausmuster D-006).
 *
 * BEWUSST OHNE Cache-Control: no-store: das trägt die LP A nur, weil dort ein
 * A/B-Split im Loader sitzt, den eine CDN-Kopie einfrieren würde. Diese Seite
 * hat keinen Split — der Kopf gehört zum Split, nicht zum noindex.
 * @type {HeadersFunction}
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export async function loader({context}) {
  let data;
  try {
    data = await context.storefront.query(CAMPAIGN_PRODUCTS_QUERY, {
      cache: context.storefront.CacheShort(),
    });
  } catch (fehler) {
    // FAIL-CLOSED (Hausmuster M1, 20260718-lp-preise-dynamisch-binden-
    // gestuft): Storefront-API nicht erreichbar -> leere Produktliste; die
    // Komponenten zeigen den letzten bekannten guten Preis aus
    // campaign-fallback-prices (+ Warnung) statt eines 500ers. Preise werden
    // NIE hart in die Seite geschrieben.
    console.error(
      '[preis-fallback] Chat-Bot-Query fehlgeschlagen:',
      fehler?.message || fehler,
    );
    return {products: []};
  }

  return {
    products: [data.qione, data.bracelet, data.qihome]
      .filter(Boolean)
      .map((product) => ({
        ...product,
        images: product.images?.nodes || [],
      })),
  };
}

export default function ChatBotRoute() {
  const {products} = useLoaderData();
  return <ChatBotTestseite products={products} />;
}

const CAMPAIGN_PRODUCTS_QUERY = `#graphql
  fragment ChatBotProduct on Product {
    handle
    title
    featuredImage {
      url
      altText
    }
    images(first: 1) {
      nodes {
        url
        altText
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 1) {
      nodes {
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
  }

  query CampaignProductsChatBot($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    qione: product(handle: "qione-2-pro") {
      ...ChatBotProduct
    }
    bracelet: product(handle: "qibracelet") {
      ...ChatBotProduct
    }
    qihome: product(handle: "qihome-air") {
      ...ChatBotProduct
    }
  }
`;

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
