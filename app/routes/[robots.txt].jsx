import {parseGid} from '@shopify/hydrogen';

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);

  const {shop} = await context.storefront.query(ROBOTS_QUERY);

  const shopId = parseGid(shop.id).id;
  const body = robotsTxtData({url: url.origin, shopId});

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',

      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

/**
 * @param {{shopId?: string; url?: string}}
 */
function robotsTxtData({url, shopId}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
# ---------------------------------------------------------------------------
# NUTZUNGSVORBEHALT / TDM RESERVATION  (Job 20260729-homepage-anti-scraping)
#
# Die Betreiberin behält sich die Nutzung der Inhalte dieser Website für
# kommerzielles Text- und Data-Mining im Sinne von 44b UrhG ausdrücklich
# vor (Art. 4 Abs. 3 DSM-RL 2019/790/EU).
#
# Dieser Vorbehalt wird MASCHINENLESBAR erklärt - hier, per W3C TDMRep unter
# /.well-known/tdmrep.json und per HTTP-Header 'tdm-reservation: 1'. Grund:
# das OLG Hamburg hat am 10.12.2025 (5 U 104/24, Kneschke ./. LAION) die
# gegenteilige Lesart der Vorinstanz aufgehoben - ein Vorbehalt in bloßer
# Prosa genügt danach NICHT (Revision zum BGH zugelassen, Stand 2026-07-29).
#
# Content Signals (Cloudflare Content Signals Policy, 24.09.2025):
#   search=yes, ai-input=yes, ai-train=no
# Lies: gefunden werden JA, als Antwortquelle zitiert werden JA,
#       als Trainingsmaterial verwendet werden NEIN.
# ---------------------------------------------------------------------------

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
${generalDisallowRules({sitemapUrl, shopId})}

# --- KI-TRAINING: nicht erwünscht -----------------------------------------
# Diese Crawler sammeln Material für Modell-TRAINING. Sie bringen uns keine
# Kunden und keinen Traffic. Der Vorbehalt oben gilt ihnen ausdrücklich.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: CCBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bytespider
User-agent: meta-externalagent
User-agent: FacebookBot
User-agent: cohere-ai
User-agent: cohere-training-data-crawler
User-agent: Diffbot
User-agent: Omgilibot
User-agent: Webzio-Extended
User-agent: ImagesiftBot
User-agent: PanguBot
User-agent: Timpibot
User-agent: YouBot
User-agent: AI2Bot
Disallow: /

# --- KI-SUCHE / KUNDEN-AI: ausdrücklich ERWÜNSCHT ------------------------
# Bewusste Ausnahme, und zwar aus Geschäftsinteresse: wenn ein Kunde SEINE
# AI fragt, ob unser Produkt zu ihm passt, ist das ein Discovery- und
# Kaufkanal, kein Angriff. Diese Agenten holen die Seite AUF ZURUF EINES
# MENSCHEN und führen keinen Trainingslauf.
# ACHTUNG bei Änderungen: dieselbe Unterscheidung ist in der Abwehr-Schicht
# als Code gebaut (sicherheitsmeister/src/kundenpfad.py, Job 20260729-anti-
# scraping-feiner-pfad-kunden-ai-guardrail). Wer hier zumacht, ohne dort
# zuzumachen, erzeugt zwei Wahrheiten.
User-agent: OAI-SearchBot
User-agent: ChatGPT-User
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Perplexity-User
${generalDisallowRules({sitemapUrl, shopId})}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
Disallow: /checkouts/
Disallow: /checkout
Disallow: /carts
Disallow: /orders
${shopId ? `Disallow: /${shopId}/checkouts` : ''}
${shopId ? `Disallow: /${shopId}/orders` : ''}
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
${generalDisallowRules({sitemapUrl, shopId})}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
${generalDisallowRules({sitemapUrl, shopId})}

User-agent: MJ12bot
Crawl-Delay: 10

User-agent: Pinterest
Crawl-delay: 1
`.trim();
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 * @param {{
 *   shopId?: string;
 *   sitemapUrl?: string;
 * }}
 */
function generalDisallowRules({shopId, sitemapUrl}) {
  return `Disallow: /admin
Disallow: /cart
Disallow: /orders
Disallow: /checkouts/
Disallow: /checkout
${shopId ? `Disallow: /${shopId}/checkouts` : ''}
${shopId ? `Disallow: /${shopId}/orders` : ''}
Disallow: /carts
Disallow: /account
Disallow: /products/bundle-fundament
Disallow: /products/bundle-unabhangig
Disallow: /products/bundle-erholungs-residenz
Disallow: /pages/schlaf-zellen-schutz-v3-67a7
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: */collections/*filter*&*filter*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /*?*oseid=*
Disallow: /*preview_theme_id*
Disallow: /*preview_script_id*
Disallow: /policies/
Disallow: /*/*?*ls=*&ls=*
Disallow: /*/*?*ls%3D*%3Fls%3D*
Disallow: /*/*?*ls%3d*%3fls%3d*
Disallow: /search
Allow: /search/
Disallow: /search/?*
Disallow: /apple-app-site-association
Disallow: /.well-known/shopify/monorail
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;
}

const ROBOTS_QUERY = `#graphql
  query StoreRobots($country: CountryCode, $language: LanguageCode)
   @inContext(country: $country, language: $language) {
    shop {
      id
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
