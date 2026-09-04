import {useEffect} from 'react';

/** Die id, die der Loader seinem iframe gibt. */
const RAHMEN_ID = 'qiblanco-salesbot-widget-frame';

/** Loader-Attribute an EINER Stelle — SSR-Tag und Nachzug dürfen nicht driften. */
const LOADER_DATEN = {
  tenantId: 'tenant_qiblanco',
  projectId: 'project_qiblanco_sales',
  zIndex: '200',
  placement: 'right',
  initialOpen: 'false',
};

/**
 * Loader-Einbindung des eigenen Sales-Chat-Assistenten.
 * Grossjob 20260728-leon-chatbot-live-pages-chatbot, Segment s05.
 *
 * Gerendert wird genau EIN <script>-Tag — nach demselben Muster wie die
 * Gorgias-Loader eine Ebene höher (nonce, defer, suppressHydrationWarning).
 * Das Skript erzeugt clientseitig ein iframe auf `<origin>/widget/embed` und
 * gibt window.location.href als `pageUrl` mit; daraus löst der Bot seinen
 * Rechtsraum auf (bekannter Host → dessen Region, fremder Host →
 * fail-closed).
 *
 * TRACKING: der Assistent bekommt KEINEN eigenen Identitäts-Key und liest
 * `_qpx_anon` NICHT — er lebt im iframe auf einer FREMDEN Origin und kann die
 * First-Party-Cookies der Storefront baulich nicht sehen. Deshalb berührt
 * diese Komponente die Cross-Boundary-Kette nicht (keine neue Zeile in
 * TRACKING_COOKIE_NAMES nötig; maschinell belegt über `linkage-check`).
 *
 * data-z-index: seit 2026-09-04 die Stufe `schwebend` der Ebenenleiter
 * (SSoT design-meister db/webdesign/web-soll.yaml, Abschnitt
 * `overlay_ordnung`) — über dem Kopf (100), unter jedem Dialog (300).
 * Vorher 4900, und genau diese Zahl war Christians gemessener Befund: bei
 * offener Warenkorb-Schublade (`.overlay` lag bei 5000) war das Widget
 * SICHTBAR und sein X trotzdem nicht treffbar. Die Ebene allein heilt das
 * nicht — dafür sorgt die Unterdrückung über `data-dialog-offen`
 * (components/DialogSignal.jsx). Beides zusammen ist bewusst nicht dieselbe
 * Sperre zweimal: die eine liest „welche Ebene", die andere „ist ein Dialog
 * offen".
 *
 * DIE ZAHL BLEIBT EINE ZAHL UND WIRD KEIN `var(--z-schwebend)`, obwohl das
 * hier naheliegt: der Loader macht daraus `parseInt(zIndex, 10) ||
 * 2147483000` (qi-salesbot route.ts). Ein `var(...)` ergäbe NaN und damit
 * still den Loader-Default knapp unter dem 32-Bit-Maximum — also die
 * größtmögliche Ebenen-Inversion, erzeugt durch den vermeintlich saubereren
 * Bau. Wer die Stufe verschiebt, zieht diese Zahl von Hand nach; der Wächter
 * `design-meister/bin/overlay-ordnung pruefe` sieht sie.
 *
 * data-initial-open="false": der Bot-Default wäre OFFEN (initialOpen=true aus
 * getDefaultWidgetSettings — im Browser gemessen stand das iframe ohne dieses
 * Attribut sofort mit 420x620 px vor der Seite). Diese Route ist eine
 * inhaltliche Kopie der Kauf-Landingpage; ein Panel, das ein Drittel des
 * Sichtfelds überdeckt, bevor der Besucher etwas getan hat, verdeckt genau den
 * Kaufkontext, in dem der Assistent getestet werden soll — und die
 * Design-Rubrik misst die Seite samt Panel. Ein Klick auf den Starter öffnet
 * ihn; der Hinweis-Balken oben auf der Seite sagt bereits, dass hier ein
 * Assistent im Test läuft.
 */
export function SalesbotWidget({origin, nonce}) {
  useEffect(() => {
    /**
     * ENTDOPPLER — hält die Invariante „GENAU EIN Rahmen" durch, statt sich auf
     * eine Ausführungs-Reihenfolge zu verlassen.
     *
     * Warum das nötig ist, ist gemessen und nicht gefürchtet: je nachdem, ob
     * das Loader-Skript beim SPA-Eintritt aus dem Cache kommt oder erst geholt
     * wird, läuft es VOR oder NACH diesem Effekt — und die Reihenfolge
     * entscheidet, ob ein Nachzug nötig ist oder ein Duplikat erzeugt. Genau
     * diese Reihenfolge kann diese Komponente nicht kontrollieren; die
     * INVARIANTE kann sie kontrollieren. Zwei gestapelte Starter sind derselbe
     * Fehler, den die Gorgias-Unterdrückung verhindern soll.
     */
    const entdoppeln = () => {
      const rahmen = document.querySelectorAll(`#${RAHMEN_ID}`);
      for (let i = 1; i < rahmen.length; i += 1) rahmen[i].remove();
    };
    entdoppeln();
    // Der Loader hängt sein iframe an document.body — dort genügt childList.
    const waechter = new MutationObserver(entdoppeln);
    waechter.observe(document.body, {childList: true});

    /**
     * NACHZUG — behebt einen GEMESSENEN Wackler, keinen theoretischen:
     * in 1 von 3 Läufen gegen den Produktionsbau war der Loader im DOM, das
     * iframe aber NICHT. Ursache ist ein Rennen, das der Loader selbst nicht
     * übersteht: er läuft als defer-Skript VOR dem React-Entry, hängt sein
     * iframe an `document.body` und setzt `window.__QiBlancoWidgetLoaded`.
     * Ersetzt React danach den Body (auf dieser Bank scheitert die Hydration
     * auch auf der unangetasteten Bestands-LP), ist das iframe weg — und das
     * erneut eingefügte Loader-Skript steigt wegen des schon gesetzten Flags
     * sofort wieder aus. Loader da, Widget weg, keine Fehlermeldung.
     *
     * DIE BEDINGUNG IST BEWUSST ZWEITEILIG — hier hat die erste, naive Fassung
     * einen zweiten Fehler gebaut (gemessen: nach einer SPA-Navigation auf die
     * Testseite hingen ZWEI iframes übereinander, also genau der Doppel-Starter,
     * den die Gorgias-Unterdrückung verhindern soll):
     *
     *   `__QiBlancoWidgetLoaded` gesetzt  = der Loader ist nachweislich schon
     *                                       DURCHGELAUFEN. Fehlt das iframe
     *                                       trotzdem, hat die Hydration es
     *                                       weggeräumt → nachziehen ist richtig.
     *   Flag NICHT gesetzt                = es lädt noch ein Loader-Tag (so ist
     *                                       es bei Client-Navigation: React
     *                                       fügt ein frisches <script> ein, das
     *                                       asynchron lädt). Dann NICHTS tun —
     *                                       dieses Tag erzeugt das iframe
     *                                       selbst. Die alte Fassung löschte
     *                                       hier das Flag und zog nach, worauf
     *                                       BEIDE Skripte ein iframe bauten.
     *
     * So braucht der Nachzug keinen Timer und kein Zeitfenster: er hängt an
     * einem Signal, das genau das bedeutet, was er wissen muss.
     */
    const loaderLiefSchon = Boolean(window.__QiBlancoWidgetLoaded);
    if (loaderLiefSchon && !document.getElementById(RAHMEN_ID)) {
      delete window.__QiBlancoWidgetLoaded;
      const nachzug = document.createElement('script');
      nachzug.src = `${origin}/embed/qiblanco-widget.js`;
      // Eigener Marker-Wert: so bleibt im SSR-HTML genau EIN Loader zählbar
      // (das ist die Prüfgrösse der Weiche) und der Nachzug ist unterscheidbar.
      nachzug.dataset.qiblancoSalesbotLoader = 'nachzug';
      Object.assign(nachzug.dataset, LOADER_DATEN);
      // Unter 'strict-dynamic' wäre der Nachzug schon deshalb erlaubt, weil ihn
      // ein vertrauenswürdiges Skript erzeugt; die nonce deckt zusätzlich
      // Browser ab, die 'strict-dynamic' nicht kennen und nur die Allowlist
      // auswerten.
      if (nonce) nachzug.nonce = nonce;
      document.head.appendChild(nachzug);
    }

    /**
     * AUFRÄUMEN BEI CLIENT-NAVIGATION: iframe und Flag überleben das Entfernen
     * des <script>-Tags. Ohne diesen Rückbau bliebe der Assistent nach einer
     * SPA-Navigation von /pages/chat-bot auf eine FREMDE Seite dort sichtbar
     * stehen — und Christians Vorgabe ist „ausschließlich auf /pages/chat-bot".
     * Die serverseitige Weiche in root.jsx deckt nur den ersten Seitenaufruf
     * ab, nicht den Weg danach.
     *
     * Das Flag wird mit zurückgesetzt, damit eine Rück-Navigation auf die
     * Testseite den Assistenten wieder aufbaut statt stumm zu bleiben.
     */
    return () => {
      waechter.disconnect();
      // ALLE Rahmen, nicht nur den ersten: sollte doch einmal ein Duplikat
      // entstehen, darf es die Seite nicht überleben.
      document
        .querySelectorAll(`#${RAHMEN_ID}`)
        .forEach((rahmen) => rahmen.remove());
      document
        .querySelectorAll('script[data-qiblanco-salesbot-loader="nachzug"]')
        .forEach((tag) => tag.remove());
      delete window.__QiBlancoWidgetLoaded;
    };
  }, [origin, nonce]);

  return (
    <script
      src={`${origin}/embed/qiblanco-widget.js`}
      data-qiblanco-salesbot-loader=""
      data-tenant-id="tenant_qiblanco"
      data-project-id="project_qiblanco_sales"
      data-z-index="200"
      data-placement="right"
      data-initial-open="false"
      nonce={nonce}
      defer
      suppressHydrationWarning
    />
  );
}
