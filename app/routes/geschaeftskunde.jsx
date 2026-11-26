import {AnmeldenSeite} from '~/components/konto/AnmeldenSeite';
import {ladeAnmelden, sendeAnmelden} from '~/lib/geschaeftskunde-anmelden.server';
import {TEXT} from '~/lib/geschaeftskunde';
import kontoStyles from '~/styles/konto.css?url';
import gkStyles from '~/styles/konto-geschaeftskunde.css?url';

/**
 * /geschaeftskunde — Direktseite für Firmen (zusätzlich zum Schalter im
 * Login-Fenster /account/anmelden). Gleiches Formular, gleicher Weg:
 * Firmendaten merken, anmelden, Geschäftskonto anlegen. Eingeloggte Kunden
 * gehen direkt in ihr Geschäftskonto (/account/geschaeftskunde).
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
    {title: `${TEXT[sp].direktTitel} | Qi Blanco`},
    {name: 'description', content: TEXT[sp].direktLede},
  ];
};

export function loader(args) {
  return ladeAnmelden(args, 'geschaeftlich');
}

export const action = sendeAnmelden;

export default function Geschaeftskunde() {
  return <AnmeldenSeite direkt />;
}
