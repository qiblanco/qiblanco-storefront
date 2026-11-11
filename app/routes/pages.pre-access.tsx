// app/routes/pages.pre-access.tsx
// Echte Eintragungsseite Black Friday Pre-Sale DACH. Seit Elinas GO vom 11.11.2026 (EL-20261111-e0dc0a54) zeigt sie die
// B-Fassung /pages/pre-access-b (Spare bis zu 500 €, zwei Countdowns, stehendes Bild am Rechner, gebaut EL-20261109-bda7a985,
// ausgerollt d4b574b1). SPIEGEL, KEINE KOPIE: Seite und Stil kommen aus pages.pre-access-b.tsx, jede Änderung dort gilt hier
// sofort mit; die B-Adresse bleibt als Vorschau bestehen.
// Formular: Mail-Manager-Formular 27 (KONFIG), Erfolgsseite exakt https://qiblanco.com/pages/bf-deals (EL-20261109-4e7db5c4).
// Bleibt noindex wie bisher (Eintrag in ~/lib/seo).
// Rückbau: die Fassung vor EL-20261111-e0dc0a54 aus git zurückholen (Datei + app/styles/pre-access.css).
import {loader as bLoader} from './pages.pre-access-b';

export {default, links} from './pages.pre-access-b';

// Loader der B-Seite (Messfixtur Gate 12, feste Uhr nur an der lokalen Bank) gilt hier mit.
export function loader(args: {request: Request}) {
  return bLoader(args);
}

export const meta = () => [
  {title: 'Black Friday Pre-Sale | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}
