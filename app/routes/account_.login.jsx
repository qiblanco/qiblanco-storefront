import {KontoStoerung} from '~/components/konto/KontoUI';
import kontoStyles from '~/styles/konto.css?url';

/**
 * Anmeldung.
 *
 * DIE MECHANIK IST UNVERÄNDERT und bleibt es: context.customerAccount.login()
 * leitet den Kunden auf die von Shopify gehostete Anmeldung weiter (Customer
 * Account API). Es gibt hier bewusst KEIN eigenes Anmeldeformular — der Login
 * liegt nicht in unserer Storefront, und ein nachgebauter wäre nur Schein.
 *
 * NEU ist allein die Fehler-Grenze darunter. Diese Route ist über den
 * Unterstrich (`account_`) aus dem Konto-Layout ausgehängt und erbt dessen
 * ErrorBoundary deshalb NICHT — sie braucht eine eigene, sonst bleibt genau
 * hier der heute messbare Zustand: 500 mit 21 Byte text/plain.
 * Aus demselben Grund lädt sie konto.css selbst.
 */
export function links() {
  return [{rel: 'stylesheet', href: kontoStyles}];
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  return context.customerAccount.login();
}

export function ErrorBoundary() {
  return (
    <KontoStoerung
      titel="Die Anmeldung ist gerade nicht erreichbar"
      text="Wir können dich im Moment nicht anmelden. Das liegt an uns, nicht an deinen Daten — versuch es bitte in ein paar Minuten noch einmal."
    />
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
