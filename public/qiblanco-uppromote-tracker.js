/*
 * UpPromote-Affiliate-Basis-Code für qiblanco.com.
 *
 * WARUM EIGENES SKRIPT: qiblanco.com ist ein Third-Party-Store (Hydrogen auf
 * Oxygen) mit GETRENNTER Checkout-Domain checkout.qiblanco.com. Das
 * UpPromote-App-Embed einer Theme-Storefront gibt es hier nicht, und weil
 * Storefront und Checkout auf verschiedenen Domains liegen, geht die
 * Affiliate-Klick-Zuordnung beim Domainwechsel ohne Cross-Site-Linker
 * verloren. Der linker-Config-Aufruf reicht die Referenz weiter.
 *
 * WAS DIESE DATEI TUT — UND WAS NICHT: sie legt ausschließlich die Queue
 * (window.upDataLayer) und den upTag-Stub an und schreibt zwei
 * Konfigurationswerte HINEIN. Sie setzt nichts auf dem Endgerät, lädt nichts
 * nach und sendet nichts. Die Werte liegen nur im Arbeitsspeicher, bis
 * collect.js sie abarbeitet.
 *
 * DAS EINWILLIGUNGSPFLICHTIGE STÜCK ist das Nachladen von
 * https://static-pixel.uppromote.com/collect/v1/collect.js. Das passiert
 * BEWUSST NICHT hier und BEWUSST NICHT als eigener <script>-Tag in root.jsx,
 * sondern in app/components/UpPromoteTracking.jsx hinter demselben
 * Cookiebot-Marketing-Tor wie das Meta-Pixel (trackingAllowed() aus
 * MetaPixel.jsx). Ein fester Tag in root.jsx würde collect.js bei JEDEM
 * Seitenaufruf laden — auch ohne Einwilligung.
 *
 * REIHENFOLGE: dieses Skript hängt als defer-Tag in root.jsx und läuft damit
 * vor der React-Hydration. Wenn UpPromoteTracking.jsx collect.js nachlädt,
 * liegen die config-Aufrufe also bereits in der Queue — genau die Reihenfolge,
 * die UpPromote verlangt.
 */
(function () {
  if (window._qiblancoUpPromoteBasisGeladen) return;
  window._qiblancoUpPromoteBasisGeladen = true;

  window.upDataLayer = window.upDataLayer || [];
  if (typeof window.upTag !== 'function') {
    window.upTag = function upTag() {
      return window.upDataLayer.push(arguments);
    };
  }

  window.upTag('config', 'myshopify_domain', 'qi-blanco.myshopify.com');
  // Beide Domains gehören in die Linker-Liste: die Referenz wird beim Übergang
  // Storefront -> Checkout weitergereicht UND zurück.
  window.upTag('config', 'linker', ['checkout.qiblanco.com', 'qiblanco.com']);
})();
