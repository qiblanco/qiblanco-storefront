import {data as remixData, useLoaderData} from 'react-router';
import {
  PartnerKeinKonto,
  PartnerKit,
  PartnerSeitencheck,
  PartnerStoerung,
  PartnerZahlen,
} from '~/components/konto/PartnerUI';
import partnerStyles from '~/styles/konto-partner.css?url';

/**
 * Partnerbereich: /account/partner
 * Job 20261006-GROSSJOB-partnerbereich-salesforce-aufbau-login.
 *
 * ZUGANG: dieselbe Anmeldung wie jedes Kundenkonto (Shopify Customer Account API,
 * passwortloser Code per Mail). Ohne Anmeldung leitet handleAuthStatus() auf
 * /account/login um, bevor irgendetwas geladen wird.
 *
 * DATEN: der Loader reicht das Zugangstoken des angemeldeten Kunden an den
 * Datendienst des Servers weiter (POST, serverseitig, nie aus dem Browser).
 * Der Dienst prüft das Token selbst bei Shopify und gibt nur den Datensatz der
 * von Shopify bestätigten Mailadresse zurück. Ob jemand Partner ist, entscheidet
 * also der Server, nicht diese Seite und nicht ein "ist angemeldet".
 *
 * KEIN GEHEIMNIS IN DIESER DATEI: die Adresse des Dienstes ist öffentlich und
 * ohne gültiges Kundentoken antwortet er 401.
 *
 * RÜCKWEG ohne Deploy: PB_DIENST=off in partnerbereich.conf auf dem Server ->
 * der Dienst antwortet 503, die Seite zeigt PartnerStoerung und keine Zahlen.
 */
const PARTNER_API = 'https://partner.65-108-150-121.sslip.io/v1/bereich';

export function links() {
  return [{rel: 'stylesheet', href: partnerStyles}];
}

export const meta = () => {
  return [{title: 'Partnerbereich | Qi Blanco'}, {name: 'robots', content: 'noindex'}];
};

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();
  const token = await context.customerAccount.getAccessToken();

  let bereich = null;
  let stoerung = false;
  if (!token) {
    stoerung = true;
  } else {
    try {
      const antwort = await fetch(PARTNER_API, {
        method: 'POST',
        headers: {Authorization: token, 'User-Agent': 'qiblanco-storefront/partnerbereich'},
        signal: AbortSignal.timeout(8000),
      });
      if (antwort.status === 200) {
        bereich = await antwort.json();
      } else {
        stoerung = true;
      }
    } catch {
      stoerung = true;
    }
  }

  return remixData(
    {bereich, stoerung},
    {headers: {'Cache-Control': 'no-cache, no-store, must-revalidate'}},
  );
}

export default function Partnerbereich() {
  /** @type {LoaderReturnData} */
  const {bereich, stoerung} = useLoaderData();

  if (stoerung || !bereich) return <PartnerStoerung />;
  if (!bereich.partner) return <PartnerKeinKonto />;

  const gemeinsam = bereich.gemeinsam || {};
  const konten = bereich.konten || [];
  return (
    <div className="partner-bereich">
      {bereich.test ? (
        <p className="konto-merker konto-merker--gold">Testzugang mit Beispieldaten</p>
      ) : null}
      {konten.map((konto) => (
        <div key={konto.partner_id}>
          <PartnerZahlen
            konto={konto}
            stand={bereich.stand_utc}
            veraltet={bereich.veraltet}
            portal={gemeinsam.uppromote_portal}
          />
          <PartnerKit konto={konto} provisionProzent={gemeinsam.provision_prozent} />
        </div>
      ))}
      <PartnerSeitencheck seitencheck={gemeinsam.seitencheck} />
    </div>
  );
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').SerializeFrom<typeof loader>} LoaderReturnData */
