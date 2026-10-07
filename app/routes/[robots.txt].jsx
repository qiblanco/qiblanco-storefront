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
 * KI-CRAWLER: DREI GRUPPEN, DREI ENTSCHEIDUNGEN (Stand 2026-10-07).
 *   KI-TRAINING  gesperrt mit `Disallow: /`
 *                (Job 20260729-homepage-anti-scraping)
 *   KI-SUCHE     frei (Job 20260729-homepage-anti-scraping)
 *   KI-MODELLE   frei: GPTBot, ClaudeBot (mit anthropic-ai und Claude-Web)
 *                und Google-Extended. Christian am 2026-10-07, wörtlich:
 *                „robots.txt bzw. Shopify-Einstellungen für GPTBot,
 *                OAI-SearchBot, ChatGPT-User, PerplexityBot, Google-Extended,
 *                ClaudeBot, Bingbot prüfen und freigeben." Die vier übrigen
 *                waren an dem Tag schon frei (KI-SUCHE bzw. `*`).
 *                (Auftrag 20261007-GROSSJOB-geo-manager-chatgpt-perplexity-
 *                grok-gemini-sichtbarkeit, Segment s02)
 *
 * DIE REIHENFOLGE DER DREI GRUPPEN IST FÜR CRAWLER OHNE BEDEUTUNG (es gilt
 * die Gruppe mit dem passenden Namen, RFC 9309). KI-MODELLE steht hinter
 * KI-SUCHE, weil das Stil-Tor von hb-deploy die User-agent-Listen als
 * Sätze liest: zwischen KI-TRAINING und KI-SUCHE entstand so ein zusätzlicher
 * Langsatz aus Agentennamen, hinter KI-SUCHE entsteht keiner.
 *
 * DIE GRUPPE KI-MODELLE TRÄGT KEINE EIGENE Content-Signal-ZEILE, und das ist
 * Absicht: die Freigabe betrifft den ABRUF. Ein `ai-train=yes` wäre eine
 * Erklärung über die NUTZUNG, also ein Rechtstext. Der Nutzungsvorbehalt im
 * Kopf der Datei, AGB § 12, /.well-known/tdm-policy.json, tdmrep.json und der
 * Kopf `tdm-reservation` sind mit dieser Freigabe NICHT angefasst worden; ob
 * sie nachgezogen werden, entscheidet Christian.
 *
 * WER EINEN AGENTEN ZWISCHEN DEN GRUPPEN VERSCHIEBT, liest vorher die Leser
 * dieser Datei. Sie urteilen an der LIVE ausgelieferten robots.txt, nicht am
 * Repo, und jeder von ihnen kippt sonst gegen eine gewollte Entscheidung:
 *   sicherheitsmeister/src/tool_signaturen.yaml und src/kundenpfad.py
 *       eigene Listen derselben Agenten in der Abwehr-Schicht
 *   seo-manager/pruefungen/probe_robots_urteil_stimmt.py
 *       verlangt, dass ein benannter Agent der Gruppe KI-TRAINING auf `/`
 *       gesperrt ist (Gruppentrennung des Matchers)
 *   seo-manager/pruefungen/probe_ki_systeme_erreichen_gleiches.py
 *       ruft jede GEO-Fläche unter jedem KI-Agenten ab, dessen Gruppe kein
 *       `Disallow: /` trägt
 *   seo-manager/geo/conf/massnahmen.yaml (M01, M03)
 *       misst die Freigaben täglich; eine erneute Sperre meldet der
 *       GEO-Manager als Rückfall
 *
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
# Ausgenommen sind GPTBot, ClaudeBot und Google-Extended (Freigabe vom
# 07.10.2026, Gruppe KI-MODELLE).
User-agent: CCBot
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

# --- KI-MODELLE -----------------------------------------------------------
# GPTBot, ClaudeBot und Google-Extended dürfen lesen.
# Freigabe: Christian Bauer (Geschäftsführer), 07.10.2026.
# Grund: Menschen fragen ChatGPT, Claude und Gemini nach Produkten wie
# unseren. GPTBot und ClaudeBot sammeln das Material, aus dem künftige
# Modelle lernen können. Google-Extended ist ein Schalter für Googles
# Crawler. Er steuert laut Google auch, ob Gemini unsere Seiten für seine
# Antworten heranziehen darf (Grounding).
# anthropic-ai und Claude-Web stehen in Anthropics Crawler-Doku heute nicht
# (Stand 07.10.2026). Sie stehen mit hier, damit für Anthropic ein Urteil
# gilt.
# Gesperrt bleiben alle übrigen Trainings-Crawler (Gruppe KI-TRAINING) und
# die Sperrpfade des Shops, dieselben wie unter User-agent: *.
User-agent: GPTBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Claude-Web
User-agent: Google-Extended
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
 * ZWEIFELSSEITEN — STAND 2026-09-12: ALLE DREI SIND FREI.
 * `/pages/erfahrungen`, `/pages/kritik` und seit heute auch
 * `/pages/hypothesen` stehen hier nicht mehr. Die Zweifelsseiten-Liste ist
 * damit LEER — das ist ein Zustand, kein Versehen, und wer hier eine Zeile
 * vermisst, liest die drei Freigaben unten.
 *
 * /pages/hypothesen war auf Christians ausdrückliche Anweisung dunkel gebaut
 * (Job 20260911-BAU-pages-hypothesen, PR #370) — wörtlich: „Aber noch nicht
 * crawlbar machen — mir zeigen, wenn es live ist." Die Seite trug deshalb alle
 * vier Sperren zugleich (meta robots noindex,nofollow + X-Robots-Tag + dieses
 * Disallow + kein Sitemap-Eintrag) und war über keinen internen Link
 * erreichbar.
 *
 * ER HAT SIE GELESEN UND AM 2026-09-12 FREIGEGEBEN, wörtlich: „Ja, ansonsten
 * kannst du das hier veröffentlichen, das liest sich gut." Damit ist die
 * verabredete Reihenfolge — erst live, dann prüfen, dann freigeben — zu Ende
 * gegangen, und alle vier Sperren fallen im selben Deploy (Job
 * 20260912-BAU-redakteursgedanken-…-und-hypothesen-freigeben).
 *
 * Der Eintrag war im Merge-Konflikt gegen PR #366/#367 entstanden und war die
 * bewusste Auflösung: ihre beiden Zeilen ausgetragen, meine hinzu.
 * Beides sind verschiedene Seiten und verschiedene Entscheidungen Christians;
 * wer eine davon mit der anderen begründet, hat die falsche Zeile vor sich.
 *
 * URSPRUNG (Job 20260910-BAU-zweifelsseiten-live-aber-noindex-und-nicht-im-
 * menue, Christian 2026-09-10): `/pages/erfahrungen` und `/pages/kritik` wurden
 * live, aber dunkel gebaut — noindex UND hier zusätzlich gesperrt (Christian:
 * Beides, nicht eines von beiden). Für Seiten, die NIE im Index waren, ist
 * Disallow + noindex kein Widerspruch; die Hygiene-Regel „Disallow blockiert das
 * Lesen des noindex" gilt für Seiten, die schon DRIN sind.
 *
 * CHRISTIAN HAT AM 2026-09-11 BEIDE GELESEN UND BEIDE FREIGEGEBEN, in zwei
 * getrennten Aufträgen und deshalb in zwei getrennten Deploys:
 *   /pages/kritik      ausgetragen mit PR #366 („Live schalten und bei ‚Mehr'
 *                      einbinden")
 *   /pages/erfahrungen ausgetragen mit PR #367 („Aber ja, können wir auch
 *                      freischalten … live schalten und crawlbar machen")
 * Die zweite Zeile fiel im Rebase gegen die erste — beide Aufträge hatten je
 * IHRE Zeile entfernt, und die richtige Auflösung war, KEINE von beiden zu
 * behalten. Wer hier eine „wieder herstellen" will, liest zuerst beide Aufträge.
 *
 * WER EINE SEITE WIEDER SPERRT: zuerst hier das Disallow rein UND das noindex in
 * der Route, und den Canonical raus (nie noindex und canonical zugleich). Wer
 * eine neue Seite freischaltet, geht den Weg rückwärts: zuerst hier das Disallow
 * raus, dann das noindex — sonst bleibt die Seite unsichtbar, während sie
 * indexierbar aussieht. Fallen beide im SELBEN Deploy, ist die Reihenfolge
 * gegenstandslos; getrennt deployt gilt sie strikt.
 *
 * ACHTUNG BEIM GEGENMESSEN: diese Funktion wird aus FÜNF User-agent-Gruppen
 * gerufen (`*`, KI-SUCHE, KI-MODELLE, AhrefsBot, AhrefsSiteAudit; bis zum
 * 2026-10-07 waren es vier, ohne KI-MODELLE). Eine Quellzeile hier ist fünf
 * Zeilen in der ausgelieferten robots.txt — wer live „beide Vorkommen" sucht
 * und entfernt, lässt drei stehen. Gemessen wird auf 0 von 5.
 *
 * Wachen: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py (Arm
 * A2-ROBOTS für dunkle, H2-ROBOTS für freigeschaltete Flächen) und
 * pruefungen/probe_erfahrungen_hell.py (Arm A3-ROBOTS).
 *
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

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
