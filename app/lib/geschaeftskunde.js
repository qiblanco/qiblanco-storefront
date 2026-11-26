/**
 * Geschäftskonto im Shop (Global Deutsch-Shop): Login-Schalter Privat /
 * Geschäftlich, Selbstanlage, Geschäftspreise. Geteilte Regeln und Sätze.
 *
 * Christian 26.11.2026: „Legt der Kunde das selber an? Kann er das selber
 * anlegen? Oben im Login oder was?“ / „oben im Login-Fenster irgendwie
 * kombinieren, dass er da quasi irgendwie eine Geschäftsadresse anlegen
 * kann.“ / „Wenn eben die Mehrwertsteuer nicht verifizierbar ist, dann kann
 * das da trotzdem bestellen, aber halt ganz normal mit Mehrwertsteuer.“
 *
 * Die Arbeit macht der Server (b2b-ust/src/geschaeftskunde.py hinter
 * https://b2b.dienst.qiblanco.com/api/gk/*): VIES-Prüfung mit Abfrage-Kennung,
 * BZSt-Bestätigung, Register der Geschäftskunden, eigenes Bestell-Angebot je
 * Kunde (Kakao 38 € netto, Qi Alpha® netto, versandfrei ab 200 € netto).
 * Wer der Kunde ist, entscheidet der Server mit dem Zugangstoken bei Shopify.
 *
 * RÜCKWEG: GESCHAEFTSKUNDE_AN = false (ein Deploy, die Anmeldung läuft dann
 * wieder direkt) oder sofort GK=aus in b2b-ust/config/b2b-ust.conf.
 */
export const GESCHAEFTSKUNDE_AN = true;

export const SESSION_SCHLUESSEL = 'qb_gk_anmeldung';
export const PRUEF_ROUTE = '/geschaeftskunde/vies';
export const KONTO_ROUTE = '/account/geschaeftskunde';
/** Kopf-Knopf: /account/login?wahl=1 öffnet das Login-Fenster mit Schalter (account_.login.jsx). */
export const WAHL_PARAM = 'wahl';

/** EU-Länder (Deutschland zuerst). Griechenland: Land GR, Nummer EL. */
export const LAENDER = [
  ['DE', 'Deutschland', 'Germany'],
  ['AT', 'Österreich', 'Austria'],
  ['BE', 'Belgien', 'Belgium'],
  ['BG', 'Bulgarien', 'Bulgaria'],
  ['DK', 'Dänemark', 'Denmark'],
  ['EE', 'Estland', 'Estonia'],
  ['FI', 'Finnland', 'Finland'],
  ['FR', 'Frankreich', 'France'],
  ['GR', 'Griechenland', 'Greece'],
  ['IE', 'Irland', 'Ireland'],
  ['IT', 'Italien', 'Italy'],
  ['HR', 'Kroatien', 'Croatia'],
  ['LV', 'Lettland', 'Latvia'],
  ['LT', 'Litauen', 'Lithuania'],
  ['LU', 'Luxemburg', 'Luxembourg'],
  ['MT', 'Malta', 'Malta'],
  ['NL', 'Niederlande', 'Netherlands'],
  ['PL', 'Polen', 'Poland'],
  ['PT', 'Portugal', 'Portugal'],
  ['RO', 'Rumänien', 'Romania'],
  ['SE', 'Schweden', 'Sweden'],
  ['SK', 'Slowakei', 'Slovakia'],
  ['SI', 'Slowenien', 'Slovenia'],
  ['ES', 'Spanien', 'Spain'],
  ['CZ', 'Tschechien', 'Czechia'],
  ['HU', 'Ungarn', 'Hungary'],
  ['CY', 'Zypern', 'Cyprus'],
];
export const LAND_CODES = new Set(LAENDER.map(([code]) => code));

export const TEXT = {
  de: {
    eyebrow: 'Qi Blanco ID',
    titel: 'Anmelden oder registrieren',
    privat: 'Privat',
    geschaeftlich: 'Geschäftlich',
    privatSatz:
      'Mit deiner E-Mail-Adresse. Du bekommst einen Code per Mail, ein Passwort brauchst du nicht.',
    privatKnopf: 'Weiter zur Anmeldung',
    gkSatz:
      'Für Firmen: Geschäftspreise, und mit gültiger USt-IdNr. aus einem anderen EU-Land ohne Mehrwertsteuer.',
    gkSatz2:
      'Danach melden Sie sich mit Ihrer E-Mail-Adresse an. Das Konto ist sofort Ihr Geschäftskonto.',
    firma: 'Firmenname',
    uid: 'USt-IdNr.',
    anschrift: 'Straße und Hausnummer',
    plz: 'Postleitzahl',
    ort: 'Ort',
    land: 'Land',
    gkKnopf: 'Geschäftskonto anlegen und anmelden',
    gkSpeichern: 'Geschäftsadresse speichern',
    prueft: 'Wird bei der EU geprüft …',
    gruen: 'Von der EU bestätigt',
    rot: 'Nicht bestätigt. Sie können das Konto trotzdem anlegen und bestellen dann mit Mehrwertsteuer.',
    weg: 'Die EU-Datenbank antwortet gerade nicht. Sie können das Konto trotzdem anlegen, wir prüfen später noch einmal.',
    fehlt: 'Bitte füllen Sie alle Felder aus.',
    uidForm: 'Die USt-IdNr. beginnt mit dem Länderkürzel, zum Beispiel PT123456789.',
    anders: 'English',
    andersLang: 'en',
    direktTitel: 'Geschäftskonto',
    direktLede:
      'Firmen bestellen bei uns zu Geschäftspreisen. Mit gültiger USt-IdNr. aus einem anderen EU-Land berechnen wir keine Mehrwertsteuer.',
    // Konto
    kontoTitel: 'Geschäftskunde',
    status: 'USt-IdNr.',
    statusGruen: 'Bestätigt',
    statusRot: 'Nicht bestätigt',
    statusWeg: 'Noch nicht geprüft',
    geprueft: 'Geprüft am',
    kennung: 'Abfrage-Kennung',
    ohneMwst: 'Sie bestellen ohne Mehrwertsteuer (innergemeinschaftliche Lieferung).',
    mitMwstInland: 'Lieferung in Deutschland: Geschäftspreis zuzüglich Mehrwertsteuer.',
    mitMwst:
      'USt-IdNr. nicht bestätigt: Sie bestellen zum Geschäftspreis mit Mehrwertsteuer. Wir prüfen die Nummer täglich erneut.',
    bestellen: 'Zum Geschäftspreis bestellen',
    preise: 'Kakao 38 € netto je Tüte, Sorten frei kombinierbar, ab 200 € netto versandfrei. Qi Alpha® zum Nettopreis.',
    aendern: 'Geschäftsadresse ändern',
    hinzufuegen: 'Geschäftsadresse hinzufügen',
    keinGk: 'Sie bestellen als Privatkunde. Als Firma legen Sie hier Ihre Geschäftsadresse an.',
    stoerung: 'Das Geschäftskonto ist gerade nicht erreichbar. Bitte versuchen Sie es in ein paar Minuten noch einmal.',
    gespeichert: 'Gespeichert.',
  },
  en: {
    eyebrow: 'Qi Blanco ID',
    titel: 'Sign in or create an account',
    privat: 'Personal',
    geschaeftlich: 'Business',
    privatSatz: 'With your email address. We send you a code, no password needed.',
    privatKnopf: 'Continue to sign in',
    gkSatz:
      'For companies: business prices, and no VAT with a valid VAT number from another EU country.',
    gkSatz2: 'Then sign in with your email address. Your account is your business account right away.',
    firma: 'Company name',
    uid: 'VAT number',
    anschrift: 'Street and number',
    plz: 'Postal code',
    ort: 'City',
    land: 'Country',
    gkKnopf: 'Create business account and sign in',
    gkSpeichern: 'Save business address',
    prueft: 'Checking with the EU …',
    gruen: 'Confirmed by the EU',
    rot: 'Not confirmed. You can still create the account and then order with VAT.',
    weg: 'The EU database is not responding right now. You can still create the account, we will check again later.',
    fehlt: 'Please fill in all fields.',
    uidForm: 'The VAT number starts with the country code, for example PT123456789.',
    anders: 'Deutsch',
    andersLang: 'de',
    direktTitel: 'Business account',
    direktLede:
      'Companies order from us at business prices. With a valid VAT number from another EU country we charge no VAT.',
    kontoTitel: 'Business customer',
    status: 'VAT number',
    statusGruen: 'Confirmed',
    statusRot: 'Not confirmed',
    statusWeg: 'Not checked yet',
    geprueft: 'Checked on',
    kennung: 'Request ID',
    ohneMwst: 'You order without VAT (intra-community supply).',
    mitMwstInland: 'Delivery within Germany: business price plus VAT.',
    mitMwst:
      'VAT number not confirmed: you order at the business price with VAT. We check the number again every day.',
    bestellen: 'Order at business price',
    preise: 'Cacao € 38 net per bag, mix varieties freely, free shipping from € 200 net. Qi Alpha® at the net price.',
    aendern: 'Change business address',
    hinzufuegen: 'Add business address',
    keinGk: 'You order as a private customer. As a company, add your business address here.',
    stoerung: 'The business account is not available right now. Please try again in a few minutes.',
    gespeichert: 'Saved.',
  },
};

/** @param {URL|string} url */
export function spracheAus(url) {
  try {
    const u = typeof url === 'string' ? new URL(url) : url;
    return u.searchParams.get('lang') === 'en' ? 'en' : 'de';
  } catch {
    return 'de';
  }
}

/** 'pt 500.697-256' -> 'PT500697256' */
export function uidNorm(roh) {
  return String(roh || '')
    .toUpperCase()
    .replace(/[^A-Z0-9+*]/g, '');
}

/** Grobe Form wie am Server (Länderkürzel + 2 bis 13 Zeichen); der Server prüft genau. */
export function uidFormOk(uid) {
  return /^(AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)[0-9A-Z+*]{2,13}$/.test(
    uidNorm(uid),
  );
}

/**
 * Formular -> {daten} oder {fehler}. Prüft nur, was ohne Netz geht.
 * @param {FormData} form
 * @param {'de'|'en'} sp
 */
export function datenAusFormular(form, sp) {
  const t = TEXT[sp] || TEXT.de;
  const feld = (name, max) => String(form.get(name) || '').trim().slice(0, max);
  if (feld('website', 200)) return {fehler: t.fehlt};
  const daten = {
    firma: feld('firma', 120),
    uid: uidNorm(feld('uid', 30)),
    sprache: sp,
    adresse: {
      anschrift: feld('anschrift', 120),
      plz: feld('plz', 20),
      ort: feld('ort', 60),
      land: feld('land', 2).toUpperCase(),
    },
  };
  const a = daten.adresse;
  if (!daten.firma || !daten.uid || !a.anschrift || !a.plz || !a.ort || !LAND_CODES.has(a.land)) {
    return {fehler: t.fehlt, daten};
  }
  if (!uidFormOk(daten.uid)) return {fehler: t.uidForm, daten};
  return {daten};
}

/**
 * Rücksprung nach der Privat-Anmeldung: nur eigene Pfade, nie zurück in die
 * Anmeldung selbst (sonst landet der Kunde nach dem Code wieder hier).
 * @param {string|null} roh
 */
export function rueckweg(roh) {
  const p = String(roh || '');
  if (!p.startsWith('/') || p.startsWith('//')) return '';
  if (/^\/account\/(anmelden|login|authorize|logout)/.test(p)) return '';
  if (/^\/geschaeftskunde/.test(p)) return '';
  return p.slice(0, 300);
}
