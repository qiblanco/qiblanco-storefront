import {redirect} from 'react-router';

/*
 * /pages/The-Alpha-B — 301 auf /pages/Qi-Alpha-B, in EINEM Sprung, jede Schreibweise.
 *
 * Christian 27.10.2026 (Z1): „Und den Link ändern wir auch wieder von The
 * Alpha in Qi Alpha“ (Job 20261027-prio1-umzug-the-alpha-zu-qi-alpha-links-
 * name). Die Seite lebt unverändert in pages.Qi-Alpha-B.jsx weiter. Der Query-String
 * bleibt (UTM, Click-IDs, Partnercode). Die Ad-Weiche lässt den Pfad durch
 * (AUSSCHLUSS_SEGMENTE), damit ein alter Anzeigen-Link die 301 erreicht.
 * Rückweg: git revert des Umzug-PR.
 */

/** @param {LoaderFunctionArgs} args */
export async function loader({request}) {
  const url = new URL(request.url);
  throw redirect(`/pages/Qi-Alpha-B${url.search}`, 301);
}

export default function TheAlphaBUmzugRedirect() {
  return null;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
