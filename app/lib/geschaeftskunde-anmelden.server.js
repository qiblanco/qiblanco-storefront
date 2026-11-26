import {redirect} from 'react-router';
import {
  GESCHAEFTSKUNDE_AN,
  KONTO_ROUTE,
  TEXT,
  datenAusFormular,
  rueckweg,
  spracheAus,
} from '~/lib/geschaeftskunde';
import {merke} from '~/lib/geschaeftskunde.server';

/**
 * Loader und Action des Login-Fensters (/account/anmelden) und der
 * Direktseite (/geschaeftskunde). Eigene .server-Datei, damit die Routen sie
 * teilen, ohne Servercode in den Browser-Bündel zu ziehen.
 */

/** Woher kam der Kunde? Nur eigene Pfade. */
function herkunft(request) {
  const url = new URL(request.url);
  const direkt = rueckweg(url.searchParams.get('return_to'));
  if (direkt) return direkt;
  try {
    const ref = new URL(request.headers.get('Referer') || '');
    if (ref.host === url.host) return rueckweg(ref.pathname + ref.search);
  } catch {
    /* kein Referer */
  }
  return '';
}

/** @param {{request: Request, context: any}} args */
export async function ladeAnmelden({request, context}, festeArt) {
  const url = new URL(request.url);
  const sp = spracheAus(url);
  const returnTo = herkunft(request);
  if (!GESCHAEFTSKUNDE_AN) {
    throw redirect(`/account/login${returnTo ? `?return_to=${encodeURIComponent(returnTo)}` : ''}`);
  }
  let eingeloggt = false;
  try {
    eingeloggt = await context.customerAccount.isLoggedIn();
  } catch {
    eingeloggt = false;
  }
  const art = festeArt || (url.searchParams.get('art') === 'geschaeftlich' ? 'geschaeftlich' : 'privat');
  if (eingeloggt) {
    throw redirect(art === 'geschaeftlich' ? `${KONTO_ROUTE}${sp === 'en' ? '?lang=en' : ''}` : '/account');
  }
  return {sp, art, returnTo};
}

/** Geschäftlich absenden: Daten merken, dann zur Anmeldung mit Rücksprung ins Geschäftskonto. */
export async function sendeAnmelden({request, context}) {
  let form;
  try {
    form = await request.formData();
  } catch {
    return {fehler: TEXT.de.fehlt};
  }
  const sp = form.get('lang') === 'en' ? 'en' : 'de';
  const {daten, fehler} = datenAusFormular(form, sp);
  if (fehler) return {fehler, daten};
  merke(context, daten);
  const ziel = `${KONTO_ROUTE}${sp === 'en' ? '?lang=en' : ''}`;
  return redirect(`/account/login?return_to=${encodeURIComponent(ziel)}`);
}


