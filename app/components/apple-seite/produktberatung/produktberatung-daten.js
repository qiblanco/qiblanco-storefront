/*
 * DATEN DER APPLE-FASSUNG /pages/produktberatung und /pages/produktberatung-b
 * (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo,
 * s08). Rein, ohne React: der Test liest sie direkt.
 *
 * CHRISTIANS WORTLAUT (seit 08.10.2026, siehe Kopfkommentar von
 * components/campaign/ProduktberatungSeite.jsx) steht NICHT hier, sondern als
 * JSX unter data-fremdtext in ProduktberatungApple.jsx: nur dort nehmen
 * Stil-Tor und Seiten-Freigabe fremde Rede aus. Der Test
 * produktberatung.test.mjs prüft ihn Zeichen für Zeichen gegen die heutige
 * Komponente.
 *
 * Weggelassen gegenüber heute (Christian 29.10.: kein Preisanker): die
 * Google-Note mit Sternen im Kopf und an jeder Stimme. Die Stimmen selbst
 * bleiben im Wortlaut, der Link zu Google bleibt, ohne Note.
 */

export const KOPF = Object.freeze({
  overline: 'Kostenlos und live per Zoom',
  // Christian 08.10. ~07:25Z: Umbruch nach dem Doppelpunkt, auf Handy und Rechner.
  h1: ['Produktberatung:', '20 Minuten mit Christian'],
  knopf: {text: 'Termin aussuchen', href: '#termine'},
});

export const FRAGEN_TITEL = 'Diese Fragen kannst du mir stellen';

/** Drei Schritte, wie heute (Christian-Sprachmodul 08.10., Satz 1 seit 17.10.). */
export const ABLAUF = Object.freeze({
  titel: 'So läuft es ab',
  schritte: Object.freeze([
    {
      titel: 'Suche dir einen freien Termin am Donnerstag aus.',
      satz: 'Zum Buchen reichen dein Name, deine E-Mail und ein kurzer Satz, worum es geht.',
    },
    {
      titel: 'Dein Zoom-Link.',
      satz: 'Er steht direkt nach der Buchung auf der Seite, inklusive Kalenderdatei.',
    },
    {
      titel: 'Live mit mir per Zoom.',
      satz: 'Nach einem kurzen Warteraum hole ich dich persönlich rein. Ein Handy reicht, die Kamera ist freiwillig.',
    },
  ]),
});

export const STIMMEN_TITEL = 'Das berichten unsere Anwender bei Google';
export const STIMMEN_LINK = 'Alle Google-Bewertungen ansehen';

export const SCHLUSS = Object.freeze({
  titel: 'Bis Donnerstag?',
  text: 'Such dir eine Zeit aus, mach dir einen Kakao, und dann reden wir.',
  knopf: {text: 'Termin aussuchen', href: '#termine'},
});

/** Reihenfolge nach dem Buchungsteil je Arm (pb-e1-gs107 bleibt unterscheidbar). */
export function reihenfolge(arm) {
  return arm === 'b'
    ? ['ablauf', 'stimmen', 'fragen']
    : ['fragen', 'ablauf', 'stimmen'];
}
