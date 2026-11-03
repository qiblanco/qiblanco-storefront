import {createContext} from 'react';
import appleSeiteStyles from '~/styles/apple-seite.css?url';
import rechtsseiteAppleStyles from '~/styles/rechtsseite-apple.css?url';

/*
 * TOKEN-CSS DER APPLE-RECHTSSEITEN IM KOPF STATT IM KÖRPER (Flanke #172, Job
 * 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo-s12-b172).
 *
 * Rechtsseite.jsx und AppleSeite.jsx laden ihr CSS als <link> im Körper, weil
 * links() einer Route die Loaderdaten (Schalter A/C) nicht kennt. root.jsx
 * Layout kennt sie über useMatches(). Für die Routen unten setzt Layout die
 * zwei Stylesheets deshalb ans Ende des <head> (nach <Links />, also an
 * derselben Stelle der Kaskade) und meldet das über AppleStilImKopf; die
 * Komponenten lassen ihre Body-Links dann weg.
 *
 * Gemessen 03.11.2026 (claude-jobs/<job>/belege/lage-statistik.txt), live,
 * Dokument im Browser umgeschrieben, n=16 gepaart, Mobilprofil (150 ms RTT,
 * 1,6 Mbit/s, CPU 4x): /pages/agb Kopf gegen Körper −40 ms LCP nach
 * Dokumentende, KI95 [−88; −21], 13 von 16 schneller. /pages/partner-details
 * (eine Nicht-Rechtsseite mit EINEM Body-Link): −8 ms, KI95 [−91; +67], also
 * keine Wirkung. Darum nur die Rechtsseiten, nicht der ganze Baukasten.
 *
 * AUSFALLSICHER IN BEIDE RICHTUNGEN: fehlt hier eine Route, behält sie die
 * Body-Links (Stand vor #172). Liefert eine gelistete Route kein
 * `appleSeite: {seite, an}`, bleibt die Liste leer und die Seite unverändert.
 * Ohne Provider (Fehlerseite, Test) ist der Kontext false: Body-Links bleiben.
 *
 * Bewusst ein eigenes kleines Modul: root.jsx importiert nur das hier, nicht
 * AppleSeite/Rechtsseite (sonst zögen deren Sektionen ins Root-Bundle jeder
 * Seite).
 */

/** true, wenn Layout das Token-CSS schon im <head> gesetzt hat. */
export const AppleStilImKopf = createContext(false);

/** Routen, die ihr Dokument über <Rechtsseite apple={appleSeite}> rendern. */
export const RECHTSSEITEN_ROUTEN = Object.freeze([
  'routes/pages.$handle',
  'routes/pages.agb',
  'routes/pages.cookie-erklaerung',
  'routes/pages.datenschutz',
  'routes/pages.impressum',
  'routes/pages.teilnahmebedingungen',
  'routes/policies',
]);

export {appleSeiteStyles, rechtsseiteAppleStyles};

/**
 * Die Stylesheets, die in den <head> gehören, oder []. Dieselbe Bedingung wie
 * in Rechtsseite (`apple.an && apple.seite`), gelesen aus den Loaderdaten der
 * gelisteten Route. Reihenfolge wie vorher im Körper: erst rechtsseite-apple,
 * dann apple-seite.
 * @param {Array<{id?: string, data?: any}>|undefined|null} matches
 * @returns {string[]}
 */
export function rechtsseiteStilKopf(matches) {
  const treffer = (matches || []).some((m) => {
    const a = m?.data?.appleSeite;
    return RECHTSSEITEN_ROUTEN.includes(m?.id) && Boolean(a?.an && a?.seite);
  });
  return treffer ? [rechtsseiteAppleStyles, appleSeiteStyles] : [];
}
