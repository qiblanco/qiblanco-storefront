// app/routes/pages.bf-deals.tsx
// Echte Black-Friday-Deal-Uebersicht DACH (Elina GO 11.11.2026, EL-20261111-e0dc0a54). Hierher fuehrt das Pre-Access-Formular 27
// nach dem Eintragen (EL-20261109-4e7db5c4). Ersetzt die leere Shopify-Seite „Blackfriday Übersichtsseite“.
// SPIEGEL, KEINE KOPIE: Seite und Stil kommen aus pages.bf-deals-b.tsx (EL-20261109-79b117c7, b0f2e574), jede Aenderung dort
// gilt hier sofort mit; die B-Adresse bleibt als Vorschau bestehen.
// noindex wie die B-Fassung: die Deals sind bis 27.11. nur fuer Pre-Access-Mitglieder gedacht.
// Rueckbau: diese Datei loeschen, dann rendert pages.$handle.jsx wieder die Shopify-Seite.
export {default, links, meta} from './pages.bf-deals-b';

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}
