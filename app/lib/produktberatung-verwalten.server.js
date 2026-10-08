/**
 * Der Verwalten-Token der Produktberatung reist im Cookie, nie in der Adresse.
 *
 * Job 20261008-produktberatung-verwalten-token-aus-der-url-vor-den-trackern
 * (offene Flanke #24 B): stand der Token als ?b= in der Adresse, lasen ihn
 * GA4, Meta, TikTok, Bing, Clarity, Taboola, Shopify-Monorail und das
 * Chat-iframe mit (gemessen 2026-10-08). Der Mail-Link bleibt ?b=<token>; die
 * Route pages.produktberatung.jsx tauscht ihn beim ersten Aufruf gegen diesen
 * Cookie und leitet auf ?verwalten=1 um.
 *
 * HttpOnly: kein Skript der Seite kann ihn lesen. Path=/pages: React Router
 * holt die Daten unter /pages/produktberatung.data, die Kalenderdatei liegt
 * unter /pages/produktberatung-kalender; ein Path=/pages/produktberatung
 * erreichte .data nicht (Pfadregel verlangt "/" nach dem Präfix). Host-only
 * (kein Domain): t.qiblanco.com und checkout.qiblanco.com bekommen ihn nie.
 * Ein Tag: so lange gilt der Weg ohne neuen Klick in der Mail.
 */
export const PFAD = '/pages/produktberatung';
const NAME = 'pb_verwalten';
const MAX_S = 86400;

/** Token aus dem Cookie der Anfrage, sonst ''. */
export function verwaltenToken(request) {
  const roh = request.headers.get('Cookie') || '';
  for (const teil of roh.split(';')) {
    const i = teil.indexOf('=');
    if (i > 0 && teil.slice(0, i).trim() === NAME) {
      try {
        return decodeURIComponent(teil.slice(i + 1).trim());
      } catch {
        return '';
      }
    }
  }
  return '';
}

/** Set-Cookie-Wert für den Token. */
export function verwaltenCookie(token) {
  return `${NAME}=${encodeURIComponent(token)}; Path=/pages; Max-Age=${MAX_S}; HttpOnly; Secure; SameSite=Lax`;
}

/**
 * Adresse der Verwalten-Ansicht, ohne Token. `pfad` ist der Pfad des Arms, auf
 * dem gebucht wurde (Seiten-Experiment pb-e1-gs107: A /pages/produktberatung,
 * B /pages/produktberatung-b). So landet die Bestätigung auf dem Pfad DES ARMS
 * und der Abschluss ist je Arm zählbar; der Cookie gilt für beide (Path=/pages).
 * Mail-Links (?b=) zeigen weiter auf A.
 */
export function verwaltenAdresse(status, pfad = PFAD) {
  return `${pfad}?verwalten=1${status ? `&status=${status}` : ''}`;
}
