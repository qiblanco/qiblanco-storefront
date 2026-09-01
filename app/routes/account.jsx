import {data as remixData} from '@shopify/remix-oxygen';
import {Outlet, useLoaderData} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {
  KontoNav,
  KontoRahmen,
  KontoStoerung,
} from '~/components/konto/KontoUI';
import kontoStyles from '~/styles/konto.css?url';

/**
 * Layout-Route der Konto-Fläche.
 *
 * Route-gebundenes Stylesheet (Muster mm-lp.css): konto.css führt seine Tokens
 * unter dem Scope `.konto` und wird nur hier geladen — es leakt nichts in
 * fremde Routen. Weil alle Konto-Kindrouten unter diesem Layout hängen, genügt
 * dieser eine links()-Export für den ganzen Bereich.
 *
 * DIE AUTH-MECHANIK IST UNVERÄNDERT: der Loader fragt weiter über
 * context.customerAccount.query ab. Geändert sind Darstellung und Texte.
 */
export function links() {
  return [{rel: 'stylesheet', href: kontoStyles}];
}

export function shouldRevalidate() {
  return true;
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {data, errors} = await context.customerAccount.query(
    CUSTOMER_DETAILS_QUERY,
  );

  if (errors?.length || !data?.customer) {
    throw new Error('Kunde nicht gefunden');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();

  const titel = customer?.firstName
    ? `Willkommen, ${customer.firstName}`
    : 'Willkommen in deinem Konto';

  return (
    <KontoRahmen
      eyebrow="Dein Konto"
      titel={titel}
      lede="Hier findest du deine Bestellungen, deine Daten und deine Adressen."
    >
      <KontoNav />
      <Outlet context={{customer}} />
    </KontoRahmen>
  );
}

/**
 * Fängt jeden Fehler der Konto-Fläche ab — auch den dokumentierten 500er, den
 * Hydrogen wirft, solange die Customer-Account-API-Zugangsdaten fehlen.
 * Ohne diese Grenze sah der Kunde die generische "Hoppla"-Seite bzw. bei
 * /account/login 21 Byte text/plain.
 *
 * Der Fehler wird NICHT verschluckt: er geht weiter ins Server-Log (Hydrogen
 * protokolliert die geworfene Response), nur die Kunden-Ansicht ist eine andere.
 */
export function ErrorBoundary() {
  return <KontoStoerung />;
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
