import {AnmeldenSeite} from '~/components/konto/AnmeldenSeite';
import {TEXT} from '~/lib/geschaeftskunde';
import {ladeAnmelden, sendeAnmelden} from '~/lib/geschaeftskunde-anmelden.server';
import kontoStyles from '~/styles/konto.css?url';
import gkStyles from '~/styles/konto-geschaeftskunde.css?url';

/**
 * /account/anmelden — das Login-Fenster mit dem Schalter Privat / Geschäftlich
 * (Christian 26.11.2026: „oben im Login-Fenster irgendwie kombinieren, dass er
 * da quasi irgendwie eine Geschäftsadresse anlegen kann“). Der Konto-Knopf oben
 * im Kopf führt hierher.
 *
 *   Privat:        ein Knopf, weiter zur Shopify-Anmeldung (/account/login),
 *                  Rücksprung auf die Seite, von der der Kunde kam.
 *   Geschäftlich:  Firmenname, USt-IdNr. (sofort bei der EU geprüft, grün/rot),
 *                  Geschäftsadresse. Absenden merkt die Daten in der signierten
 *                  Sitzung und schickt zur Anmeldung; danach legt
 *                  /account/geschaeftskunde das Geschäftskonto an.
 *
 * /account/login selbst bleibt unverändert (direkte Weiterleitung): darauf
 * verlassen sich handleAuthStatus() und die Konto-Proben.
 * RÜCKWEG: GESCHAEFTSKUNDE_AN = false -> diese Seite leitet direkt zur Anmeldung.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: kontoStyles},
    {rel: 'stylesheet', href: gkStyles},
  ];
}

export const meta = ({data}) => {
  const sp = data?.sp || 'de';
  return [
    {title: `${TEXT[sp].titel} | Qi Blanco`},
    {name: 'robots', content: 'noindex'},
  ];
};

export function loader(args) {
  return ladeAnmelden(args, '');
}

export const action = sendeAnmelden;

export default function Anmelden() {
  return <AnmeldenSeite direkt={false} />;
}
