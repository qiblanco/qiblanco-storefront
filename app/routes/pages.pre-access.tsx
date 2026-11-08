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

// Die drei Schritte des Ablaufs, wie Elina ihn am 08.11.2026 festgelegt hat (EL-20261108-3a488064).
const SCHRITTE = [
  {titel: 'Eintragen', text: 'Vorname und E-Mail-Adresse, ein Klick auf den Knopf.'},
  {titel: 'Direkt zu den Deals', text: 'Danach landest du sofort auf der Seite mit den Black-Friday-Deals.'},
  {titel: 'Zugang per E-Mail', text: 'Den Link zu den Deals bekommst du zusätzlich per E-Mail.'},
];

export default function PreAccess() {
  return (
    <div className="pre-access">
      <div className="pre-access__karte">
        <p className="pre-access__dach">Black Friday Pre-Sale</p>
        <h1 className="pre-access__titel">Exklusiver Zugang zu den Black-Friday-Deals</h1>
        <p className="pre-access__text">Trag dich kurz ein, danach geht es direkt zu den Deals.</p>
        <MailManagerFormular konfig={KONFIG} direkt={ENDPUNKT} />
      </div>
      <section className="pre-access__schritte" aria-labelledby="pre-access-so-gehts">
        <h2 id="pre-access-so-gehts" className="pre-access__zwischentitel">So geht&apos;s</h2>
        <ol className="pre-access__liste">
          {SCHRITTE.map((s) => (
            <li key={s.titel} className="pre-access__schritt">
              <strong>{s.titel}</strong>
              <span>{s.text}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
