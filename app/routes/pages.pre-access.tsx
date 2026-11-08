// app/routes/pages.pre-access.tsx
// Eintragungsseite Black Friday Pre-Sale DACH (Elina, GO vom 08.11.2026, EL-20261108-3a488064). Ablauf: Einladung an alle
// Newsletter-Abonnenten -> diese Seite -> Eintragen -> sofort weiter auf die Deal-Seite -> Zugangsmail; die Bestaetigungsmail
// (Double-Opt-in) bekommen nur Neue, das entscheidet der Endpunkt. Ersetzt die leere Shopify-Seite "Eintragungsseite".
// Formular, Einwilligung und Weiterleitung kommen aus dem Mail-Manager-Formular 27 (KONFIG), der Browser sendet direkt an den
// Endpunkt, damit die echte Anmelde-IP im Einwilligungsnachweis steht. Bleibt noindex wie bisher (Eintrag in ~/lib/seo).
// Rueckbau: diese Datei und app/styles/pre-access.css loeschen, dann rendert pages.$handle.jsx wieder die Shopify-Seite.
import {MailManagerFormular} from '../components/MailManagerFormular';
import {KONFIG} from '../components/formulare/PreAccessBlackFridayDENachbauF27PreAccesFormular';
import preAccessStyles from '../styles/pre-access.css?url';

const ENDPUNKT = 'https://anmelden.dienst.qiblanco.com';

export function links() {
  return [{rel: 'stylesheet', href: preAccessStyles}];
}

export const meta = () => [
  {title: 'Black Friday Pre-Sale | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

export default function PreAccess() {
  return (
    <div className="pre-access">
      <div className="pre-access__karte">
        <p className="pre-access__dach">Black Friday Pre-Sale</p>
        <h1 className="pre-access__titel">Exklusiver Zugang zu den Black-Friday-Deals</h1>
        <p className="pre-access__text">Trag dich kurz ein, danach geht es direkt zu den Deals.</p>
        <MailManagerFormular konfig={KONFIG} direkt={ENDPUNKT} />
      </div>
    </div>
  );
}
