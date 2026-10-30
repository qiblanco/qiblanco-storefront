import {useEffect} from 'react';

/** Die id, die der Loader seinem iframe gibt. */
const RAHMEN_ID = 'qiblanco-salesbot-widget-frame';

/** Selektor des echten, nach `load` eingefügten Loaders. */
const LADE_MARKE = 'data-qiblanco-salesbot-loader="nach-load"';

/** Loader-Attribute an EINER Stelle — SSR-Merkmal und Lader dürfen nicht driften. */
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
 * Gerendert wird genau EIN inertes <script type="text/plain">-Merkmal; der
 * echte Loader kommt nach `load` (Begründung im Effekt). Das Skript erzeugt clientseitig ein iframe auf `<origin>/widget/embed` und
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
     * LADEN ERST NACH `load` (seit 2026-10-30, Job
     * 20261030-folge-dienste-auf-eigene-domain-nach-dns). Vorher stand hier ein
     * SSR-Tag mit `defer`. Gemessen im Eltern-Auftrag
     * 20261030-prio3-kaufweg-unabhaengig-von-sslip-io-eigene-domain: verwirft
     * ein Netz den Abruf still, bleibt `document.readyState` auf 'interactive',
     * DOMContentLoaded und load kommen erst nach dem TCP-Timeout, und alles,
     * was darauf wartet (Poster-Vorladen, Banner-Beobachtung, qpx), steht.
     * `async` allein hilft nicht: ein async-Skript hält `load` genauso auf,
     * und im <head> bricht es den Loader (er liest `document.body.dataset`
     * sofort). Ein Skript, das NACH `load` eingefügt wird, hält nichts mehr auf.
     *
     * Dieser Weg ersetzt auch den früheren NACHZUG (Loader lief vor der
     * Hydration, React räumte sein iframe weg, das Flag blockte den zweiten
     * Lauf): nach `load` ist die Hydration durch oder der Rahmen wird vom
     * Entdoppler gehalten, und ein Flag ohne Rahmen wird hier verworfen.
     */
    const laden = () => {
      if (document.getElementById(RAHMEN_ID)) return;
      if (document.querySelector(`script[${LADE_MARKE}]`)) return;
      delete window.__QiBlancoWidgetLoaded;
      const tag = document.createElement('script');
      tag.src = `${origin}/embed/qiblanco-widget.js`;
      tag.async = true;
      // Eigener Marker-Wert: im SSR-HTML bleibt genau EIN Loader-Merkmal
      // zählbar (Prüfgrösse der Auslieferungs-Wache), der echte Lader ist
      // unterscheidbar.
      tag.dataset.qiblancoSalesbotLoader = 'nach-load';
      Object.assign(tag.dataset, LOADER_DATEN);
      // Unter 'strict-dynamic' wäre das Skript schon deshalb erlaubt, weil es
      // ein vertrauenswürdiges Skript erzeugt; die nonce deckt zusätzlich
      // Browser ab, die 'strict-dynamic' nicht kennen.
      if (nonce) tag.nonce = nonce;
      document.body.appendChild(tag);
    };
    if (document.readyState === 'complete') {
      laden();
    } else {
      window.addEventListener('load', laden, {once: true});
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
      window.removeEventListener('load', laden);
      waechter.disconnect();
      // ALLE Rahmen, nicht nur den ersten: sollte doch einmal ein Duplikat
      // entstehen, darf es die Seite nicht überleben.
      document
        .querySelectorAll(`#${RAHMEN_ID}`)
        .forEach((rahmen) => rahmen.remove());
      document
        .querySelectorAll(`script[${LADE_MARKE}]`)
        .forEach((tag) => tag.remove());
      delete window.__QiBlancoWidgetLoaded;
    };
  }, [origin, nonce]);

  // TRÄGT NICHTS AUS, LÄDT NICHTS: type="text/plain" — der Browser holt ein
  // Skript mit fremdem Typ nicht. Das Tag bleibt als Merkmal im HTML, weil die
  // Auslieferungs-Wache (qi-salesbot/data/widget-auslieferungs-vertrag.json,
  // an_muster/traeger_muster) und die Pixelmaske genau dieses Tag lesen.
  // Geladen wird oben im Effekt, nach `load`.
  return (
    <script
      type="text/plain"
      src={`${origin}/embed/qiblanco-widget.js`}
      data-qiblanco-salesbot-loader=""
      data-tenant-id="tenant_qiblanco"
      data-project-id="project_qiblanco_sales"
      data-z-index="200"
      data-placement="right"
      data-initial-open="false"
      nonce={nonce}
      suppressHydrationWarning
    />
  );
}
