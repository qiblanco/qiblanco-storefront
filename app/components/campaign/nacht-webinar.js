/**
 * Logik der Anmeldeseite /pages/webinar-die-nacht-entscheidet, ohne React und
 * ohne Netz, damit nacht-webinar.test.mjs jeden Zweig hermetisch prüfen kann
 * (Grossjob 20261023-webinar-lp-die-nacht-entscheidet-serie-1511, s03).
 * Schnittstelle zum Anmelde-Endpunkt (ac-eingang): VERTRAG.md im Job-Ordner.
 *
 * Der Termin steht nie in diesem Repo. Er kommt aus /w (anzeige.termin), das
 * ac-eingang aus webinar-manager/exports/termine-<thema>.json liest. Fehlt er,
 * zeigt die Seite keinen Tag und keine Uhrzeit.
 */

export const FORMULAR = 'webinar-nacht';
export const THEMA = 'longevity-esmog-wasser';
export const OHNE_TERMIN = 'Den nächsten Termin geben wir in Kürze bekannt.';
export const OEFFNET_BALD = 'Die Anmeldung öffnet in Kürze.';
export const META_LEAD = {content_name: 'Webinar Die Nacht entscheidet', content_category: 'webinar'};

/** Abstand zum Start, ab dem die Seite den Kalendereintrag nicht mehr selbst baut. */
export const KALENDER_SICHERHEIT_MS = 5 * 60 * 1000;

const FEHLER = {
  400: 'Bitte prüf deine E-Mail-Adresse.',
  geaendert: 'Der Text über dem Knopf hat sich gerade geändert. Bitte lies ihn und klick noch einmal.',
  sonst: 'Das hat gerade nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.',
};

/** Termin aus /w nur, wenn er vollständig ist (sonst gilt er als fehlend). */
export function terminAus(anzeige) {
  const t = anzeige && anzeige.termin;
  if (!t || typeof t.webinar_id !== 'string' || !t.webinar_id) return null;
  if (!Number.isFinite(Date.parse(t.utc)) || !Number.isFinite(Date.parse(t.ende))) return null;
  return t;
}

/** „Sonntag, 15. November, 10 Uhr“ in Berliner Zeit, auf Server und Browser gleich. */
export function terminText(termin) {
  if (!termin) return OHNE_TERMIN;
  const teile = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Europe/Berlin',
  }).formatToParts(new Date(termin.utc));
  const w = Object.fromEntries(teile.map((t) => [t.type, t.value]));
  const uhr = w.minute === '00' ? `${Number(w.hour)} Uhr` : `${Number(w.hour)}:${w.minute} Uhr`;
  return `${w.weekday}, ${w.day}. ${w.month}, ${uhr}`;
}

/** Vollständige Formulartexte aus /w (Hausregel: keine Kopie im Repo). */
export function anzeigeVollstaendig(anzeige) {
  const da = (v) => typeof v === 'string' && v.trim() !== '';
  return Boolean(
    anzeige &&
      anzeige.art === 'webinar' &&
      da(anzeige.einwilligung) &&
      da(anzeige.knopf) &&
      da(anzeige.vorname_feld) &&
      da(anzeige.email_feld) &&
      anzeige.einwilligung_id,
  );
}

/** utm_content der Seiten-URL (VERTRAG §6): nur [A-Za-z0-9_-], höchstens 64 Zeichen. */
export function utmContent(suche) {
  try {
    const wert = new URLSearchParams(suche || '').get('utm_content') || '';
    return /^[A-Za-z0-9_-]{1,64}$/.test(wert) ? wert : '';
  } catch {
    return '';
  }
}

/** Der Körper von POST /f/webinar-nacht. t ist die Anzeigezeit in Serverzeit. */
export function nutzlast({werte, t, anzeige, termin, seite, utm}) {
  const feld = (name) => String(werte.get(name) || '');
  const n = {
    vorname: feld('vorname'),
    email: feld('email'),
    frage: feld('frage'),
    webinar_id: termin ? termin.webinar_id : '',
    website: feld('website'),
    t: String(Math.round(t)),
    einwilligung_id: String(anzeige.einwilligung_id),
    seite,
  };
  if (utm) n.utm_content = utm;
  return n;
}

/**
 * Was die Seite nach der Antwort des Endpunkts tut (VERTRAG §2).
 * -> {zustand: 'fertig'|'bereit'|'neu_laden', meldung, lead}
 */
export function antwortZustand(status, antwort) {
  if (status === 202 && antwort && antwort.ok) {
    return {zustand: 'fertig', meldung: String(antwort.text || ''), lead: true};
  }
  if (status === 404) return {zustand: 'bereit', meldung: OEFFNET_BALD, lead: false};
  if (status === 409) return {zustand: 'neu_laden', meldung: FEHLER.geaendert, lead: false};
  if (status === 400) return {zustand: 'bereit', meldung: FEHLER[400], lead: false};
  return {zustand: 'bereit', meldung: FEHLER.sonst, lead: false};
}

/**
 * Darf die Seite nach 202 den angezeigten Termin als Kalendereintrag anbieten?
 * Die 202-Antwort nennt den zugeordneten Termin nicht (s02, Befund F9). Der
 * Endpunkt behält die gesendete webinar_id, solange sie in der Zukunft liegt;
 * mit fünf Minuten Abstand zum Start ist sie also auch der zugeordnete Termin.
 */
export function kalenderErlaubt(termin, serverJetztMs) {
  if (!termin || !Number.isFinite(serverJetztMs)) return false;
  return Date.parse(termin.utc) - serverJetztMs > KALENDER_SICHERHEIT_MS;
}

/** Kalenderdatei (RFC 5545) für den Termin. Der Zoom-Link steht nur in der Mail. */
export function icsText(termin, jetztMs) {
  const utc = (ms) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Qi Blanco//Webinar//DE',
    'BEGIN:VEVENT',
    `UID:${termin.webinar_id}@qiblanco.com`,
    `DTSTAMP:${utc(jetztMs)}`,
    `DTSTART:${utc(Date.parse(termin.utc))}`,
    `DTEND:${utc(Date.parse(termin.ende))}`,
    'SUMMARY:Die Nacht entscheidet: Live-Webinar mit Christian (Qi Blanco)',
    'DESCRIPTION:Den Zoom-Link findest du in deiner E-Mail von Qi Blanco.',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

/**
 * Lead-Ereignis nach einer Annahme (VERTRAG §4): eigener Empfänger über qpx,
 * Meta nur bei schon gebootetem Pixel (dasselbe Tor wie MetaPixel.jsx).
 * Kein Cookie, kein Speicher, kein neuer Schlüssel.
 * @param {{qpxTrack: Function, fenster: object, webinarId: string, utm: string, eventId: string}} o
 * @returns {{qpx: boolean, meta: boolean}}
 */
export function leadSenden({qpxTrack, fenster, webinarId, utm, eventId}) {
  const props = {formular: FORMULAR, webinar_id: webinarId || ''};
  if (utm) props.utm_content = utm;
  const aus = {qpx: false, meta: false};
  try {
    qpxTrack('lead', props);
    aus.qpx = true;
  } catch {
    // Tracking darf die Anmeldung nie brechen.
  }
  if (fenster && fenster._qiblancoMetaPixelBooted && typeof fenster.fbq === 'function') {
    try {
      fenster.fbq('track', 'Lead', {...META_LEAD}, {eventID: eventId});
      aus.meta = true;
    } catch {
      // wie oben
    }
  }
  return aus;
}
