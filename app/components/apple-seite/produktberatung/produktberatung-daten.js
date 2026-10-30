/*
 * DATEN DER APPLE-FASSUNG /pages/produktberatung und /pages/produktberatung-b
 * (Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo,
 * s08). Rein, ohne React: der Test liest sie direkt.
 *
 * CHRISTIANS WORTLAUT (seit 08.10.2026, siehe Kopfkommentar von
 * components/campaign/ProduktberatungSeite.jsx) steht hier Zeichen für Zeichen
 * wie in der heutigen Fassung. Der Test produktberatung.test.mjs prüft das
 * gegen den Quelltext der heutigen Komponente: ändert sich dort ein Satz,
 * wird er hier rot, statt still auseinanderzulaufen.
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

/** Christians Einstieg, sein Wortlaut (data-fremdtext christian-wortlaut-20261008). */
export const CHRISTIAN_EINSTIEG = Object.freeze([
  'Du hast Fragen zu unseren Produkten? Ich nehme mir persönlich Zeit für dich!'/*@fremdtext:christian-wortlaut-20261008*/,
  'Wir können über deine aktuelle Situation sprechen und darüber, warum du einen QiOne® kaufen möchtest. Oder wir klären einfach die Fragen, die noch offen sind.'/*@fremdtext:christian-wortlaut-20261008*/,
]);

/** Sein Block „Live mit mir :)“, Fassung 2 seiner Gründungsgeschichte. */
export const CHRISTIAN_BLOCK = Object.freeze({
  titel: 'Live mit mir :)',
  name: 'Dipl.-Ing. (FH) Christian Bernd Bauer'/*@fremdtext:christian-wortlaut-20261008*/,
  absaetze: Object.freeze([
    'Vor mehr als 10 Jahren habe ich Qi Blanco gegründet, aus meiner eigenen Leidensgeschichte heraus. Damals leitete ich eine Entwicklungsabteilung für Automotive und Aerospace, und unser Büro wurde gerade modernisiert. Das Spannende: Ab da wurde ich immer müder, war ständig genervt und ging nicht mehr so glücklich durchs Leben wie früher. Die ersten Tage schob ich es auf meinen beruflichen Stress, dann auf meine Ernährung, dann auf meine Beziehung … Ich habe vieles getestet, bis ich mit allem ziemlich durch war. Und dann fiel es mir wie Schuppen von den Augen: Seit dem Umbau hing ein riesiger WLAN-Router direkt rechts neben mir an der Wand, 60 cm über meinem Kopf. Heureka! Es lag nicht an mir, sondern am E-Smog, der direkt mein Nervensystem angriff! Als Ingenieur war mir klar: Ich brauche eine einfache und elegante Lösung. Einfach umhängen, und das Problem ist erledigt.'/*@fremdtext:christian-wortlaut-20261008*/,
    'Gesagt, getan: Noch in derselben Nacht entstand die Blaupause für den QiOne®.'/*@fremdtext:christian-wortlaut-20261008*/,
  ]),
});

/** „Du hast schon einen QiOne®?“, sein Wortlaut; der Umbruch nach „:)“ ist von ihm. */
export const CHRISTIAN_SCHON = Object.freeze([
  'Du hast schon einen QiOne®? Dann komm erst recht :)'/*@fremdtext:christian-wortlaut-20261008*/,
  'Wir können gerne über die Nutzung reden und über deine persönlichen Erfahrungen. Oder wir klären Fragen, die erst bei der Nutzung entstanden sind. Vielleicht auch, welchen Vorteil dir ein QiHome® Air bringen könnte?'/*@fremdtext:christian-wortlaut-20261008*/,
]);

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
