/**
 * Eigener Sales-Chat-Assistent — Origin-Auflösung.
 * Grossjob 20260728-leon-chatbot-live-pages-chatbot, Segment s05.
 *
 * EINE Quelle für ZWEI Verbraucher, die sonst auseinanderlaufen:
 *   app/entry.server.jsx  → CSP script-src UND frame-src
 *   app/root.jsx          → der <script>-Loader im <head>
 *
 * WARUM DAS ZUSAMMENGEHÖREN MUSS (teuer erkaufte Erkenntnis aus dem
 * Vorsegment s08): das Widget braucht ZWEI CSP-Direktiven — script-src für
 * den Loader `<origin>/embed/qiblanco-widget.js` und frame-src für das
 * iframe, das der Loader auf `<origin>/widget/embed` öffnet. Fehlt EINE,
 * blockt die CSP STILL: das Widget erscheint einfach nicht, ohne Fehler in
 * der Seite. Läge die Origin-Logik zweimal im Code, wäre genau dieser stille
 * Ausfall eine Frage der Zeit.
 *
 * `connect-src` ist bewusst NICHT dabei: die Chat-API läuft same-origin
 * INNERHALB des iframe (auf der Bot-Domain), nicht vom Storefront-Dokument
 * aus. Das Eltern-Dokument redet mit dem Bot ausschließlich über
 * postMessage (Grössenwechsel des iframe) — das braucht keine CSP-Direktive.
 */

/**
 * Der in Segment s03 scharf geschaltete öffentliche Edge des Bots
 * (Caddy-Vhost /etc/caddy/sites-enabled/qi-salesbot.caddy → 127.0.0.1:3011).
 *
 * WARUM EIN HARTER DEFAULT UND KEIN LEERER (Abweichung vom s08-Entwurf,
 * begründet): Christians Auftrag ist, dass der Assistent auf /pages/chat-bot
 * LÄUFT. Mit leerem Default wäre die Seite nach dem Merge live und leer, und
 * das Scharfschalten hinge an einer Oxygen-Runtime-env, die nur über das
 * --env-file des Deploy-Workflows gesetzt werden kann — also ein zweiter PR
 * plus zweiter Merge. Der Default macht die Seite mit dem Merge fertig; die
 * Umkehrbarkeit liefert `PUBLIC_SALESBOT_WIDGET_ORIGIN` (siehe unten).
 *
 * Die Domain braucht keinen DNS-Eintrag: sslip.io löst
 * <ip-mit-bindestrichen>.sslip.io auf ebendiese IP auf (gleiche Präzedenz wie
 * qpx.65-108-150-121.sslip.io seit 2026-07-09).
 */
export const SALESBOT_WIDGET_DEFAULT_ORIGIN =
  'https://salesbot.65-108-150-121.sslip.io';

/** Sentinel-Wert von `PUBLIC_SALESBOT_WIDGET_ORIGIN`, der das Widget abschaltet. */
export const SALESBOT_WIDGET_AUS = 'off';

/**
 * Origin des Widgets, oder '' wenn es nicht laden soll.
 *
 * KILL-SCHALTER (ohne Code-Änderung, ohne Merge):
 *   PUBLIC_SALESBOT_WIDGET_ORIGIN=off   → AI-Anna aus, und zwar STORE-WEIT
 *   (nicht nur auf /pages/chat-bot): der Wert ist die erste, alles
 *   beherrschende Konjunktion der Aktivierung in root.jsx. Abwesenheit der
 *   env = AN, nicht invertiert.
 *
 *   KEIN CHAT-FALLBACK AUF DACH — Gegenstück zum Block "GORGIAS-CHAT
 *   ENTFERNT" in root.jsx (Christian 2026-07-31, Weichen-Korrektur, PRs
 *   #154/#155): der Gorgias-CHAT-Loader ist auf diesem Storefront dauerhaft
 *   ENTFERNT, nicht nur unterdrückt. `off` nimmt der Seite damit JEDEN Chat;
 *   es gibt nichts, worauf zurückgefallen wird. Wer den Notaus zieht, muss
 *   das wissen — der Rückweg zum Chat ist ein `git revert` jenes Merges,
 *   keine env. Der separate US-/englische Store (us-qiblanco-2024, anderes
 *   Repo) behält seinen Gorgias-Chat und ist von dieser env nicht betroffen.
 *
 * Ein kaputter env-Wert darf die Seite nicht reissen: dann lädt das Widget
 * eben nicht (fail-closed, genau wie beim qpx-Endpoint).
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {string} Origin ohne Pfad, oder ''
 */
export function salesbotWidgetOrigin(env) {
  const roh = (env?.PUBLIC_SALESBOT_WIDGET_ORIGIN || '').trim();
  if (roh.toLowerCase() === SALESBOT_WIDGET_AUS) return '';
  try {
    return new URL(roh || SALESBOT_WIDGET_DEFAULT_ORIGIN).origin;
  } catch {
    return '';
  }
}

/**
 * Dieselbe Auflösung als Liste — die Form, die `createContentSecurityPolicy`
 * beim Spreaden in script-src/frame-src braucht. Leere Liste = CSP bleibt
 * byte-gleich zum Vorzustand.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {string[]}
 */
export function salesbotWidgetCspQuellen(env) {
  const origin = salesbotWidgetOrigin(env);
  return origin ? [origin] : [];
}

/**
 * Shop-Sprach-Gate für den store-weiten Go-live (Christian-Freigabe
 * 2026-07-31, Weichen-Korrektur 2026-07-31): die Sichtbarkeit hängt an der
 * GEWÄHLTEN Seitensprache/dem Markt des geladenen Shops — NICHT an der
 * Besucher-IP. Fehlerfall vorher: ein Besucher mit US-IP im deutschen Shop
 * bekam über `oxygen-buyer-country` fälschlich Gorgias.
 *
 * Quelle ist `storefront.i18n.language` (im Root-Loader als `storefrontSprache`
 * aufgelöst): der qiblanco.com-Storefront ist der deutschsprachige DACH-Shop
 * (language === 'DE' für JEDEN Besucher, auch mit US-IP oder USD-Markt). Der
 * englischsprachige US-Store (us-qiblanco-2024) ist ein SEPARATER Shopify-Store
 * und NICHT dieses Repo. Die Region ist damit eine Eigenschaft des SHOPS, nicht
 * des Besuchers — wie in der Region-Logik des qi-salesbot (region-source.ts:
 * Region ist eine Eigenschaft des Shops, nicht der Sprache).
 *
 * FAIL-CLOSED zugunsten des Bestands: unbekannte/leere Sprache => false =>
 * Widget bleibt aus. Auf diesem Storefront ist `language` konstant 'DE'
 * (context.js), AI-Anna läuft also store-weit für ALLE Besucher.
 */
export const SALESBOT_SHOP_SPRACHEN = ['DE'];

/**
 * @param {string | null | undefined} language Storefront-Sprache aus
 *   storefront.i18n.language (z.B. 'DE'); '' / unbekannt = false (fail-closed)
 * @returns {boolean} true für den deutschsprachigen DACH-Shop
 */
export function istSalesbotDeutscherShop(language) {
  const l = (language || '').trim().toUpperCase();
  return SALESBOT_SHOP_SPRACHEN.includes(l);
}

/**
 * Muss SalesbotWidget den Loader beim Einhängen selbst nachziehen?
 *
 * JA, SOBALD KEIN RAHMEN STEHT UND KEIN NACHZUG UNTERWEGS IST — unabhängig
 * davon, ob der Loader in diesem Dokument schon einmal gelaufen ist.
 *
 * Bis 29.10.2026 hing der Nachzug zusätzlich an `window.__QiBlancoWidgetLoaded`
 * („Flag nicht gesetzt = React fügt gerade ein frisches <script> ein, das
 * lädt selbst“). Diese Annahme ist falsch: React 18 legt client-seitig
 * gerenderte <script>-Tags über innerHTML an, und solche Skripte führt der
 * Browser nie aus. Live gemessen (Job 20261029-qi-alpha-kaufseite-ai-anna-
 * fehlt-nur-lp-ohne): Klick von der LP /pages/Qi-Alpha (Film-Seite, ohne
 * Loader) auf /products/qi-alpha → Loader-Tag im DOM, Flag false, 0 Rahmen,
 * Desktop und Handy. Direkt aufgerufen stand Anna da. Christian sah die
 * Kaufseite deshalb auf genau dem Weg ohne Anna, den der Funnel vorsieht.
 *
 * Doppelte Rahmen verhindert das nicht diese Entscheidung, sondern zweierlei,
 * das unabhängig davon gilt: der Loader steigt beim gesetzten Flag selbst aus
 * (der erste Lauf gewinnt), und der Entdoppler in SalesbotWidget hält „genau
 * ein Rahmen“.
 *
 * @param {{rahmenDa: boolean, nachzugUnterwegs: boolean}} lage
 * @returns {boolean}
 */
export function loaderNachziehen({rahmenDa, nachzugUnterwegs}) {
  return !rahmenDa && !nachzugUnterwegs;
}
