// app/routes/pages.bf-deals.tsx
// Echte Black-Friday-Deal-Übersicht DACH (Elina GO 11.11.2026, EL-20261111-e0dc0a54). Hierher führt das Pre-Access-Formular 27
// nach dem Eintragen (EL-20261109-4e7db5c4). Ersetzt die leere Shopify-Seite „Blackfriday Übersichtsseite“.
// SPIEGEL, KEINE KOPIE: Seite und Stil kommen aus pages.bf-deals-b.tsx (EL-20261109-79b117c7, b0f2e574), jede Änderung dort
// gilt hier sofort mit; die B-Adresse bleibt als Vorschau bestehen.
// noindex wie die B-Fassung: die Deals sind bis 27.11. nur für Pre-Access-Mitglieder gedacht.
// Rückbau: diese Datei löschen, dann rendert pages.$handle.jsx wieder die Shopify-Seite.
export {default, links} from './pages.bf-deals-b';

export const meta = () => [
  {title: 'Black Friday Deals | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}
