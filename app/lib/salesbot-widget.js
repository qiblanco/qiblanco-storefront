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
 *   PUBLIC_SALESBOT_WIDGET_ORIGIN=off   → Widget aus. Auf /pages/chat-bot
 *   kehrt dann der Gorgias-Chat automatisch zurück (root.jsx koppelt die
 *   Unterdrückung an das AKTIVE Widget, nicht an die Route) — die Seite
 *   steht also nie ohne Chat da. Abwesenheit der env = AN, nicht invertiert.
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
 * DACH-Region-Gate für den store-weiten Go-live (Christian-Freigabe
 * 2026-07-31: die GESAMTE Storefront nutzt AI-Anna; Gorgias wird für DE/AT/CH
 * abgeschaltet. USA bleibt VORERST auf Gorgias — nächste Stufe, hier NICHT
 * angefasst).
 *
 * Region-Quelle ist derselbe Oxygen-Geo-Header wie bei der Consent-Policy
 * (`oxygen-buyer-country`, siehe lib/consent-policy.js), im Root-Loader bereits
 * als `buyerCountry` aufgelöst. EINE Quelle für WO das Widget store-weit
 * erscheint — analog zu salesbotWidgetOrigin für OB.
 *
 * FAIL-CLOSED zugunsten des Bestands: unbekannte/leere/fremde Region => false
 * => Widget bleibt aus, Gorgias bleibt an. So kann ein fehlender Geo-Header
 * (Preview/localhost) oder ein US-Besucher NIE versehentlich store-weit auf
 * AI-Anna umschalten. Die USA-Trennung hängt damit nicht an einer Zusatz-
 * Bedingung, sondern ist die Default-Richtung dieses Gates.
 */
export const SALESBOT_DACH_LAENDER = ['DE', 'AT', 'CH'];

/**
 * @param {string | null | undefined} country ISO-3166-1-alpha-2 (z.B. 'DE'),
 *   '' / unbekannt = nicht-DACH (fail-closed)
 * @returns {boolean} true NUR für DE/AT/CH
 */
export function istSalesbotDachRegion(country) {
  const c = (country || '').trim().toUpperCase();
  return SALESBOT_DACH_LAENDER.includes(c);
}
