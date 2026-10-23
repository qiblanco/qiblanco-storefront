import {useEffect} from 'react';
import {data as remixData} from 'react-router';
import {Outlet, useLoaderData} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';
import {KontoNav, KontoRahmen, KontoStoerung} from '~/components/konto/KontoUI';
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

/**
 * Kunden-identify der Konto-Fläche (Global Deutsch-Shop, Folgeauftrag
 * 20261023-global-deutsch-shop-konto-route-qpx-identify-kunden-email).
 *
 * Ein eingeloggter Kunde wird mit seinem Gerät verbunden: Gegenstück zu
 * kundeIdentify() in public/qiblanco-qpx.js, das im Global Englisch-Shop aus
 * dem Liquid-Theme die E-Mail bekommt. Hydrogen kennt die E-Mail nur über die
 * Customer-Account-API, und die fragt nur diese Route ab (no-store). Darum
 * sitzt der Aufruf hier und nicht im Root-Loader.
 *
 * Gerufen wird NUR, wenn qpx.js wirklich geladen ist (`window.qpx.identify`
 * setzt erst qpx.js; der Warteschlangen-Stub aus qpx-commerce.js hat es
 * nicht). qpx.js lädt der Loader nur ohne Banner-Ablehnung, und send() in
 * qpx.js prüft GPC. Dieser Code lädt qpx nie und legt keinen Stub an.
 * Ablehnende bleiben also unberührt.
 *
 * Wie kundeIdentify(): Kill-Schalter QPX_CONFIG.identity === false,
 * gleiche Normalisierung, höchstens ein identify je Sitzung und Adresse
 * (sessionStorage hält nur einen Hash, nie die Adresse).
 *
 * RÜCKWEG: KONTO_IDENTIFY_AN = false (ein Deploy) oder `hb-deploy revert`
 * des Merge-Commits.
 */
const KONTO_IDENTIFY_AN = true;

const KONTO_IDENTIFY_SCHLUESSEL = '_qpx_idkonto';
const KONTO_IDENTIFY_TAKT_MS = 500;
const KONTO_IDENTIFY_VERSUCHE = 60; // 30 s: Zeit für den Banner-Klick

function kontoMailNormal(roh) {
  const mail = String(roh || '')
    .trim()
    .toLowerCase();
  if (!mail || mail.indexOf('@') < 1 || mail.length > 254) return '';
  return mail;
}

function kontoMailSignatur(mail) {
  let h = 5381;
  for (let i = 0; i < mail.length; i++)
    h = ((h << 5) + h + mail.charCodeAt(i)) | 0;
  return 'k' + String(h);
}

function qpxGeladen() {
  return (
    typeof window !== 'undefined' &&
    typeof window.qpx === 'function' &&
    typeof window.qpx.identify === 'function'
  );
}

/**
 * Ein Versuch. true heißt: erledigt (gesendet, schon gesendet oder
 * abgeschaltet), weiteres Warten ist überflüssig.
 */
function kontoIdentifyVersuch(mail) {
  if (!qpxGeladen()) return false;
  try {
    if (window.QPX_CONFIG && window.QPX_CONFIG.identity === false) return true;
    const sig = kontoMailSignatur(mail);
    let gesehen = null;
    try {
      gesehen = window.sessionStorage.getItem(KONTO_IDENTIFY_SCHLUESSEL);
    } catch {
      gesehen = null;
    }
    if (gesehen === sig) return true;
    try {
      window.sessionStorage.setItem(KONTO_IDENTIFY_SCHLUESSEL, sig);
    } catch {
      // ohne sessionStorage: einmal je Seitenaufruf
    }
    window.qpx.identify(mail);
  } catch {
    // Tracking darf das Konto nie brechen.
  }
  return true;
}

function useKontoIdentify(roh) {
  const mail = kontoMailNormal(roh);
  useEffect(() => {
    if (!KONTO_IDENTIFY_AN || !mail) return undefined;
    if (kontoIdentifyVersuch(mail)) return undefined;
    let rest = KONTO_IDENTIFY_VERSUCHE;
    const takt = window.setInterval(() => {
      rest -= 1;
      if (kontoIdentifyVersuch(mail) || rest <= 0) window.clearInterval(takt);
    }, KONTO_IDENTIFY_TAKT_MS);
    return () => window.clearInterval(takt);
  }, [mail]);
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();
  useKontoIdentify(customer?.emailAddress?.emailAddress);

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

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
