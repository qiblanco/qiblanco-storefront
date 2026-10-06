import {data} from 'react-router';
import {KontoNav, KontoRahmen} from '~/components/konto/KontoUI';
import {
  PartnerKit,
  PartnerSeitencheck,
  PartnerZahlen,
} from '~/components/konto/PartnerUI';
import kontoStyles from '~/styles/konto.css?url';
import partnerStyles from '~/styles/konto-partner.css?url';

/**
 * MESS-VORSCHAU DES PARTNERBEREICHS — NUR IM DEV-MODUS ERREICHBAR.
 * Job 20261006-GROSSJOB-partnerbereich-salesforce-aufbau-login.
 *
 * WOZU: /account/partner ist nur angemeldet sichtbar, und eine Anmeldung vom
 * Server aus geht nicht (Shopify hält die Server-IP für einen Bot, gemessen im
 * Kundenbereich-Job 2026-09-01 s05). Ohne renderbares Objekt wäre die
 * Design-Pflicht nicht messbar. Diese Route rendert EXAKT die Bausteine aus
 * components/konto/PartnerUI.jsx im Konto-Rahmen mit Beispieldaten in der Form,
 * die der Datendienst liefert.
 *
 * WAS DIESER BELEG NICHT IST: ein Score hier misst Markup und CSS, nicht den
 * Loader-Pfad und nicht echte Partnerdaten. Er läuft unter eigenem Slug
 * (konto-vorschau-partner-fixture), genau wie konto-vorschau-fixture.
 *
 * DER RIEGEL: der Loader wirft in der Produktion 404.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: kontoStyles},
    {rel: 'stylesheet', href: partnerStyles},
  ];
}

export const meta = () => [
  {title: 'Partnerbereich-Vorschau (intern)'},
  {name: 'robots', content: 'noindex, nofollow'},
];

const LINK = 'https://qiblanco.com/?sca_ref=1234567.Beispiel';
const BEISPIEL = {
  stand_utc: '2026-10-06T14:55:02Z',
  veraltet: false,
  gemeinsam: {
    provision_prozent: 10,
    uppromote_portal: 'https://aff.revolution.qiblanco.com',
    seitencheck: {status: 'ok', url: 'https://qiblanco.com/pages/partner'},
  },
  konto: {
    partner_id: 'aff:BEISPIEL',
    seit: '2024-03-12',
    link: LINK,
    codes: ['BEISPIEL10'],
    provision: {offen: 98.4, freigegeben: 312.15, ausgezahlt: 1840.0},
    klicks: {tage_30: 46, tage_90: 131},
    verkaeufe: {
      gesamt: 27,
      umsatz_gesamt: 25840.5,
      tage_30: {anzahl: 2, umsatz: 1968.0, provision: 196.8},
      tage_90: {anzahl: 5, umsatz: 4410.0, provision: 441.0},
      letzte: [
        {datum: '2026-10-02', betrag: 984.0, provision: 98.4, status: 'pending'},
        {datum: '2026-09-21', betrag: 984.0, provision: 98.4, status: 'approved'},
        {datum: '2026-08-30', betrag: 1243.0, provision: 124.3, status: 'paid'},
      ],
    },
    links: [
      {
        name: 'QiOne® 2 Pro',
        kurztext: 'QiOne® 2 Pro von Qi Blanco. Kompakt. Innovativ. Stark.',
        bild: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne1.webp?v=1732874828',
        link: 'https://qiblanco.com/products/qione-2-pro?sca_ref=1234567.Beispiel',
      },
      {
        name: 'QiBracelet®',
        kurztext: 'QiBracelet® von Qi Blanco. Eleganz und Schutz: dein Support.',
        bild: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiBracelet1.webp?v=1732874909',
        link: 'https://qiblanco.com/products/qibracelet?sca_ref=1234567.Beispiel',
      },
    ],
  },
};

export async function loader() {
  if (process.env.NODE_ENV === 'production') {
    throw new Response('Not Found', {status: 404});
  }
  return data(BEISPIEL);
}

export default function KontoVorschauPartner() {
  const b = BEISPIEL;
  return (
    <KontoRahmen
      eyebrow="Dein Konto"
      titel="Willkommen, Mira"
      lede="Hier findest du deine Bestellungen, deine Daten und deine Adressen."
    >
      <KontoNav aktiv="/account/partner" />
      <div className="partner-bereich">
        <PartnerZahlen
          konto={b.konto}
          stand={b.stand_utc}
          veraltet={b.veraltet}
          portal={b.gemeinsam.uppromote_portal}
        />
        <PartnerKit konto={b.konto} provisionProzent={b.gemeinsam.provision_prozent} />
        <PartnerSeitencheck seitencheck={b.gemeinsam.seitencheck} />
      </div>
    </KontoRahmen>
  );
}
