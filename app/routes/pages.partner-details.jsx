import {PartnerDetails} from '~/components/campaign/PartnerDetails';
import lpTokenStyles from '~/styles/schlaf-zellen-schutz.css?url';
import ppStyles from '~/styles/affiliate-partnerprogramm.css?url';
import pdStyles from '~/styles/partner-details.css?url';

/**
 * /pages/partner-details — Hilfeseite für BESTEHENDE Partner: welcher Link
 * wofür, wie der Rabatt beim Kunden ankommt, Provision und Auszahlung, was
 * tun, wenn etwas hakt (Christian 2026-09-24, Job 20260924-GROSSJOB-
 * partnerlinks-sauber-in-die-kasse-partnerseite-und-mail-an-elina).
 *
 * Christian nannte den Pfad "pages/Partner/details"; Shopify-Handles kennen
 * keinen Schrägstrich, deshalb `partner-details`.
 *
 * ABGRENZUNG: /pages/affiliate-partnerprogramm wirbt NEUE Partner (indexiert),
 * /pages/partner empfängt geworbene KUNDEN (noindex). Diese Seite erklärt
 * angemeldeten Partnern ihre Werkzeuge und ist wie /pages/partner
 * `noindex,nofollow`: sie wird über das Partnerkonto, die Partner-Mails und
 * den Hinweis auf /pages/affiliate-partnerprogramm erreicht, nicht über Suche.
 * Nicht im Hauptmenü.
 *
 * TRACKING-NAHT: KEIN Redirect, KEIN Pixel, KEINE Cookies. Der Link-Baukasten
 * rechnet ausschließlich im Browser (kein Formular-Versand, kein Abruf).
 *
 * BILDER: echte Bildschirmfotos vom 2026-09-24, auf dem Shopify-CDN
 * (GL-PRO-0015). Gezeigt ist ein TEST-Partner; Code und Referenz sind im Bild
 * unkenntlich gemacht (DEINCODE / 12345.abcdef), damit kein gültiger Code
 * öffentlich lesbar wird.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: lpTokenStyles},
    {rel: 'stylesheet', href: ppStyles},
    {rel: 'stylesheet', href: pdStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'So funktionieren deine Partnerlinks | Qi Blanco'},
  {
    name: 'description',
    content:
      'Welcher Link wofür, wie der Rabatt beim Kunden ankommt, Provision und ' +
      'Auszahlung, und was du tust, wenn ein Link nicht funktioniert.',
  },
  {name: 'robots', content: 'noindex,nofollow'},
];

/**
 * X-Robots-Tag zusätzlich (Gurt + Hosenträger, Hausmuster D-006).
 * @type {HeadersFunction}
 */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'no-store',
});

export function loader() {
  return {};
}

export default function PartnerDetailsRoute() {
  return <PartnerDetails />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
