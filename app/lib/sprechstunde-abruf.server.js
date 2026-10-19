/**
 * Sprechstunde mit Christian: Abruf des Buchungsdienstes und die zwei Cookies
 * der Seite /pages/sprechstunde (Route app/routes/pages.sprechstunde.jsx).
 *
 * Grossjob 20261019-GROSSJOB-sprechstunde-mit-christian-ticket-300-eur-freitags-
 * 20-uhr-buchung-live-unter-mehr, Segment s05 (Christian 19.10.2026). Der
 * Dienst lebt auf unserem Server (shared-state/sprechstunde, Vertrag in
 * KONZEPT.md Abschnitt 2a und im Kopf von src/server.py).
 *
 * WIEDERVERWENDET, NICHT KOPIERT: GET mit einem zweiten Versuch und der
 * einzelne POST kommen aus produktberatung-abruf.server.js (3500 + 3000 ms,
 * POST nie wiederholt). Hier steht nur, was die Sprechstunde anders hat.
 *
 * ZWEI COOKIES, BEIDE HttpOnly, Path=/pages, ein Tag, host-only:
 *   sp_verwalten  Token aus dem Mail-Link ?b=<token> (Verwalten, Umbuchen,
 *                 Kalenderdatei). Muster produktberatung-verwalten.server.js.
 *   sp_ticket     Ticketcode aus dem Mail-Link ?ticket=SP-XXXX-XXXX (Freitag
 *                 wählen). Wer den Code kennt, kann damit einen Freitag
 *                 buchen; er gehört deshalb so wenig in eine Adresse, die
 *                 Tracker und Chat-iframe lesen, wie der Verwalten-Token.
 * Die Route tauscht beide beim ersten Aufruf gegen den Cookie und leitet mit
 * 303 auf eine Adresse ohne Token um; die Seite mit ?b= oder ?ticket= wird nie
 * gerendert.
 */
export {
  holeJson,
  holeMitWiederholung,
  istFluechtig,
  termineBrauchbar,
} from '~/lib/produktberatung-abruf.server';

export const ENDPUNKT = 'https://sprechstunde.65-108-150-121.sslip.io';

/** Env SPRECHSTUNDE_API lenkt auf einen Wegwerf-Endpunkt um (lokale Vorschau); auf Oxygen nicht gesetzt. */
export function basis(context) {
  const env = context?.env?.SPRECHSTUNDE_API;
  return (typeof env === 'string' && env.trim()) || ENDPUNKT;
}

export const PFAD = '/pages/sprechstunde';
export const COOKIE_VERWALTEN = 'sp_verwalten';
export const COOKIE_TICKET = 'sp_ticket';
const MAX_S = 86400;

/** Wert eines Cookies der Anfrage, sonst ''. */
export function cookieWert(request, name) {
  const roh = request.headers.get('Cookie') || '';
  for (const teil of roh.split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(teil.slice(i + 1).trim());
      } catch {
        return '';
      }
    }
  }
  return '';
}

/** Set-Cookie-Wert; leerer Wert löscht den Cookie. */
export function setzeCookie(name, wert) {
  const alter = wert ? MAX_S : 0;
  return `${name}=${encodeURIComponent(wert || '')}; Path=/pages; Max-Age=${alter}; HttpOnly; Secure; SameSite=Lax`;
}

/** Ticketcode in Normalform (SP-XXXX-XXXX, Großbuchstaben, ohne Leerzeichen); Unbrauchbares -> ''. */
export function ticketCode(roh) {
  const v = String(roh || '')
    .toUpperCase()
    .replace(/\s+/g, '')
    .slice(0, 32);
  return /^[A-Z0-9-]{4,32}$/.test(v) ? v : '';
}
