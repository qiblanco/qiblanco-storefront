import {bilder} from '~/data/kohaerente-wasserstruktur';
import {AUTORENKASTEN} from '~/lib/autorenkasten';
import {absoluteCanonical} from '~/lib/seo';
import {isoMitZone} from '~/lib/datum';
import {
  QUELLEN as QUELLEN_INFOSEITE,
  PFAD as PFAD_INFOSEITE,
  istSchemaSicher,
} from '~/data/wasser-infoseite';

/**
 * DER INHALT DER SEITE „HEXAGONALES WASSER" — /pages/was-ist-hexagonales-wasser.
 *
 * Auftrag: Christian, 23.09.2026 (wörtlich): „Welche Seiten kommen als erstes,
 * wenn man hexagonales Wasser eingibt oder kohärentes Wasser? Wie können wir
 * hier einen Platz eins erreichen in SEO und GEO?" Träger der Zusage Z6:
 * der Grossjob „Platz eins für kohärentes und hexagonales Wasser“ vom 09.10.2026.
 *
 * WARUM EINE EIGENE SEITE UND KEIN ABSCHNITT DER INFO-SEITE (gemessen am
 * 09.10.2026): die Info-Seite /pages/was-ist-kohaerentes-wasser trägt seit dem
 * 23.09. eine Begriffstabelle mit „hexagonal" und eine Frage „Was ist
 * hexagonales Wasser?". In 18 Tagesläufen des Flächen-Zensus (google.de) stand
 * sie trotzdem nie unter den Treffern zu „hexagonales Wasser", die Search
 * Console zählt 0 Impressionen. 7 der 8 organischen Treffer tragen den Begriff
 * im Titel. Die Frage steht deshalb hier im Pfad, im Titel und in der H1.
 *
 * WELCHE LÜCKE DIESE SEITE FÜLLT (Wettbewerbs-Befund 23.09., Punkt 7):
 * keine Seite im Netz trennt hexagonal, Eis Ih, EZ, kohärent, strukturiert
 * und belebt sauber und sagt je Begriff, was gemessen ist und was ein Modell.
 *
 * QUELLEN: was die Info-Seite schon geprüft führt, kommt von dort (eine
 * Fundstelle, ein Eintrag). Neu sind drei Arbeiten, am 2026-10-09 einzeln
 * gegen Crossref geprüft (DOI, Autoren, Jahr, Seiten) und am Abstract
 * gelesen: Huang 2009, Miranda 1998, Libbrecht 2005.
 *
 * GRENZEN wie auf der Info-Seite (Christian, GL-SPR-0008 und die Hausregeln):
 * die Seite beschreibt Wasser, nicht den Körper; Messung steht als Messung,
 * Modell als Modell, die Aussageklasse als Überschrift, nie als Vorbehalt im
 * Satz; keine Kritik zitieren oder nacherzählen. Den Zweifel beantwortet die
 * Frage „Gibt es hexagonales Wasser wirklich?" mit dem Stärksten, das belegt
 * ist (Brain-Regel bestmoegliches-licht-kritik-nicht-selbst-verbreiten).
 */

const WINKEL = bilder.find((b) => b.id === 'winkel');
const VON = WINKEL.von.anzeige;
const NACH = WINKEL.nach.anzeige;

export const PFAD = '/pages/was-ist-hexagonales-wasser';

/**
 * DATUM ALS KONSTANTE: wer den Text ändert, zieht `GEAENDERT` nach — und
 * `lastmod` in NUR_ROUTE_SEITEN (app/lib/seo.js) im selben Commit.
 */
const VEROEFFENTLICHT = '2026-10-09';
const GEAENDERT = '2026-10-09';

export const SEITE = {
  pfad: PFAD,
  titel: 'Was ist hexagonales Wasser? Erklärt mit Quellen | Qi Blanco',
  beschreibung:
    'Hexagonales Wasser einfach erklärt: wo das Sechseck gemessen ist, im Eis, im flüssigen Wasser und an Oberflächen, und was es von kohärentem Wasser trennt.',
  marke: 'Deep Dive',
  h1: 'Was ist hexagonales Wasser?',
  unterzeile:
    'Wo Wasser sechseckig ist, was davon gemessen ist und wie sich hexagonal, Eis Ih, EZ, kohärent, strukturiert und belebt unterscheiden.',
  kurzTitel: 'Kurz gesagt',
  kurz: 'Hexagonales Wasser ist Wasser, dessen Moleküle sich zu Sechsecken ordnen. Im Eis ist diese Ordnung gemessen {q:kuhs1981}, und jede Schneeflocke zeigt sie: Sie wächst als sechseckiges Prisma {q:libbrecht2005}. Im flüssigen Wasser bilden sich eisähnlich geordnete Bereiche von rund einem Nanometer, die sich ständig umbauen {q:huang2009}. An Oberflächen ordnet sich Wasser zu eisähnlichen Schichten, auf Glimmer auch bei Raumtemperatur {q:miranda1998}.',
  autorName: AUTORENKASTEN.name,
  autorRolle: AUTORENKASTEN.rolle,
  autorZeile: `Von ${AUTORENKASTEN.name}`,
  veroeffentlicht: isoMitZone(VEROEFFENTLICHT),
  geaendert: isoMitZone(GEAENDERT),
  standAnzeige: '9. Oktober 2026',
  standZeile:
    'Stand: 9. Oktober 2026. Jede Aussage trägt ihre Quelle. Neue Veröffentlichungen nehmen wir auf, sobald sie erscheinen.',
  leitLegende: `Nimmt das Wassermolekül Energie auf, weitet sich sein Winkel nach dem Modell von Dr. Warnke von ${VON} auf ${NACH}, gerundet den Tetraederwinkel des Eises. Dann schließen sich sechs Nachbarn zu einem Ring.`,
};

export const INHALT = [
  {id: 'einfach', titel: 'Teil 1: einfach erklärt'},
  {id: 'fakten', titel: 'Teil 2: gemessen und Modell'},
  {id: 'abgrenzung', titel: 'Hexagonal, kohärent, EZ: der Unterschied'},
  {id: 'fragen', titel: 'Häufige Fragen'},
  {id: 'quellen', titel: 'Quellen'},
];

/* ======================================================================== */
/* TEIL 1 — EINFACH ERKLÄRT                                                 */
/* ======================================================================== */

export const TEIL_EINFACH = {
  id: 'einfach',
  nr: 'Teil 1',
  titel: 'Hexagonales Wasser einfach erklärt',
  einleitung:
    'Hexagonal heißt sechseckig. Gemeint ist die Ordnung der Moleküle, nicht die Form eines Tropfens.',
  abschnitte: [
    {
      id: 'sechseck',
      titel: 'Warum Wasser Sechsecke bildet',
      absaetze: [
        'Ein Wassermolekül kann über Wasserstoffbrücken an bis zu vier Nachbarn binden {q:nilsson2015}. Im Eis stehen diese vier im Tetraederwinkel um das Molekül {q:kuhs1981}. Sechs Moleküle schließen sich so zu einem Ring, und die Ringe stapeln sich zu einem Gitter aus Waben.',
        'Deshalb heißt das gewöhnliche Eis Eis Ih. Das h steht für hexagonal.',
      ],
    },
    {
      id: 'schneeflocke',
      titel: 'Die Schneeflocke zeigt das Sechseck',
      absaetze: [
        'Jede Schneeflocke wächst aus einem sechseckigen Prisma aus Eis {q:libbrecht2005}. Ihre sechs Arme sind die sichtbare Spur des Gitters im Inneren. Temperatur und Feuchte formen die Arme, die Sechszahl bleibt.',
      ],
    },
    {
      id: 'fluessig',
      titel: 'Und im flüssigen Wasser?',
      absaetze: [
        'Im flüssigen Wasser lösen sich die Brücken ständig und bilden sich neu, in Billionstel Sekunden {q:fecko2003}. Ordnung gibt es trotzdem. Röntgenmessungen zeigen eisähnlich geordnete Bereiche von rund einem Nanometer, die sich mit ungeordneten abwechseln {q:huang2009}.',
      ],
      grafik: {
        typ: 'bruecken',
        werte: {
          links: {
            titel: 'ungeordnet',
            text: 'Brücken wechseln in Pikosekunden',
          },
          rechts: {titel: 'eisähnlich', text: 'ein sechseckiges Netz'},
        },
        legende:
          'Links lösen sich die Brücken ständig und bilden sich neu. Rechts halten sie ein sechseckiges Netz wie im Eis. Im flüssigen Wasser wechseln beide Zustände auf engem Raum.',
      },
    },
  ],
};

/* ======================================================================== */
/* TEIL 2 — GEMESSEN UND MODELL                                             */
/* ======================================================================== */

export const TEIL_FAKTEN = {
  id: 'fakten',
  nr: 'Teil 2',
  titel: 'Hexagonales Wasser: was gemessen ist, was ein Modell beschreibt',
  einleitung:
    'Wasser ordnet sich an drei Orten sechseckig oder eisähnlich, und jeder hat seine Messung. Für die Ordnung an Oberflächen beschreibt ein Modell die Wabenschicht.',
  abschnitte: [
    {
      id: 'eis',
      titel: 'Eis Ih: das Sechseck im Kristall',
      klasse: 'Messung',
      absaetze: [
        'Neutronenbeugung zeigt die Lage jedes Atoms im Eis Ih. Jedes Molekül sitzt tetraedrisch zwischen vier Nachbarn, im Gitter aus sechseckigen Ringen {q:kuhs1981}. Das erste Strukturmodell von Eis und flüssigem Wasser stammt von Bernal und Fowler aus dem Jahr 1933 {q:bernal1933}.',
      ],
    },
    {
      id: 'inseln',
      titel: 'Flüssiges Wasser: eisähnliche Inseln',
      klasse: 'Messung',
      absaetze: [
        'Kleinwinkel-Röntgenstreuung misst im Wasser Dichteschwankungen auf einer Länge von rund einem Nanometer {q:huang2009}. Röntgenspektren ordnen sie zwei Arten lokaler Struktur zu: tetraedrisch geordnet wie im Eis und verzerrt {q:huang2009}.',
        'Je kälter das Wasser, desto stärker die Schwankung. Den Unterschied der beiden Strukturen finden die Messungen von Raumtemperatur bis nahe an den Siedepunkt {q:huang2009}. Die meisten Moleküle tragen dabei zwei starke Brücken, nicht vier wie im Eis {q:wernet2004}.',
      ],
    },
    {
      id: 'oberflaechen',
      titel: 'An Oberflächen: geordnete Schichten',
      klasse: 'Messung',
      absaetze: [
        'Auf Glimmer bildet Wasser bei Raumtemperatur eine eisähnlich geordnete Lage, sobald die Oberfläche voll bedeckt ist {q:miranda1998}.',
        'An wasserliebenden Oberflächen wächst eine geordnete Zone von typischerweise mehreren hundert Mikrometern, das EZ-Wasser {q:zheng2006}. Sie ist negativ geladen {q:das2013} und absorbiert UV-Licht bei rund 270 Nanometern {q:chai2008}. Mehrere Labore haben die Zone gemessen {q:elton2020}.',
      ],
      grafik: {
        typ: 'ausschlusszone',
        werte: {
          oberflaeche: 'wasserliebende Oberfläche',
          zone: 'Ausschlusszone (EZ)',
          verdraengt: 'Teilchen werden verdrängt',
          ladungZone: 'negativ geladen',
          ladungWasser: 'positiv geladen',
          breite: 'Breite: 100 bis einige 100 µm',
        },
        legende:
          'An einer wasserliebenden Oberfläche wächst die Zone und schiebt gelöste Teilchen hinaus. Sie ist negativ geladen, das Wasser davor positiv.',
      },
    },
    {
      id: 'wabenschicht',
      titel: 'Die Wabenschicht: das Modell von Pollack',
      klasse: 'Modell',
      absaetze: [
        'Prof. Dr. Gerald H. Pollack beschreibt EZ-Wasser als Stapel sechseckiger Wabenschichten {q:pollack2013}. Er nennt diesen Zustand die vierte Phase des Wassers, zwischen Eis und flüssigem Wasser. Beim Schmelzen von Eis erscheint die UV-Signatur der Zone für kurze Zeit {q:so2011}.',
        `Nach dem Modell von Dr. Ulrich Warnke weitet sich der Winkel des Moleküls von ${VON} auf ${NACH}, wenn es Energie aufnimmt. Dann entstehen hexagonale Strukturen {q:warnke2019}. ${NACH} ist gerundet der Tetraederwinkel des Eises.`,
        'Gemessen sind das Sechseck im Eis, die eisähnlichen Inseln im flüssigen Wasser und die geordnete Zone an Oberflächen. Die Wabenschicht im Inneren der Zone beschreibt das Modell.',
      ],
    },
  ],
};

/* ======================================================================== */
/* ABGRENZUNG — die Tabelle, die es so im Netz nicht gab                    */
/* ======================================================================== */

export const ABGRENZUNG = {
  id: 'abgrenzung',
  titel: 'Hexagonal, Eis Ih, EZ, kohärent, strukturiert, belebt: der Unterschied',
  einleitung:
    'Hexagonal beschreibt die Form, kohärent das Verhalten, EZ den Ort. Eis Ih ist der Kristall. Strukturiert und belebt sind Sammel- und Handelsbegriffe.',
  legende: 'Sieben Begriffe, je mit Bedeutung und Aussageklasse.',
  spalten: ['Begriff', 'Was gemeint ist', 'Messung oder Modell'],
  zeilen: [
    {
      id: 'hexagonales-wasser',
      begriff: 'Hexagonales Wasser',
      bedeutung: 'Wasser mit sechseckiger Ordnung der Moleküle.',
      beleg:
        'Messung: im Eis vollständig {q:kuhs1981}; im flüssigen Wasser eisähnliche Bereiche um einen Nanometer, die sich ständig umbauen {q:huang2009}.',
    },
    {
      id: 'eis-ih',
      begriff: 'Eis Ih',
      bedeutung: 'Das gewöhnliche Eis: ein Gitter aus sechseckigen Ringen.',
      beleg:
        'Messung: Neutronenbeugung {q:kuhs1981}; Schneekristalle wachsen als sechseckige Prismen {q:libbrecht2005}.',
    },
    {
      id: 'ez-wasser',
      begriff: 'EZ-Wasser',
      bedeutung:
        'Geordnete, negativ geladene Zone an wasserliebenden Oberflächen, die gelöste Teilchen ausschließt.',
      beleg:
        'Messung: Breite, Ladung und UV-Bande in mehreren Laboren {q:zheng2006} {q:elton2020}. Modell: Wabenschichten {q:pollack2013}.',
    },
    {
      id: 'vierte-phase',
      begriff: 'Vierte Phase',
      bedeutung:
        'Pollacks Name für EZ-Wasser, als Zustand zwischen Eis und flüssigem Wasser.',
      beleg: 'Modell {q:pollack2013}.',
    },
    {
      id: 'gleichtakt',
      begriff: 'Kohärentes Wasser',
      bedeutung:
        'Wasser, dessen Moleküle im Gleichtakt schwingen, in kohärenten Domänen.',
      beleg: `Modell der Quantenelektrodynamik {q:delgiudice1988}. Ausführlich: {l:${PFAD_INFOSEITE}|Was ist kohärentes Wasser?}`,
    },
    {
      id: 'strukturiertes-wasser',
      begriff: 'Strukturiertes Wasser',
      bedeutung:
        'Sammelbegriff für Wasser mit mehr Ordnung als gewöhnlich, ohne feste Definition.',
      beleg: 'Gemessen wird je nach Bedeutung das Eis, die eisähnlichen Bereiche oder die Ausschlusszone.',
    },
    {
      id: 'belebtes-wasser',
      begriff: 'Belebtes Wasser',
      bedeutung: 'Handelsbegriff für Wasser, das mit Geräten aufbereitet wird.',
      beleg: 'Der Begriff nennt ein Verfahren, keine Struktur.',
    },
  ],
};

/* ======================================================================== */
/* HÄUFIGE FRAGEN                                                           */
/* ======================================================================== */

/**
 * Reiner Text (FaqListe rendert Zeichenketten); die Fundstellen stehen in
 * `quellen` und laufen als Nachweis mit (der Test prüft jede).
 */
export const FRAGEN = [
  {
    q: 'Was ist hexagonales Wasser?',
    a: 'Hexagonales Wasser ist Wasser, dessen Moleküle sich zu Sechsecken ordnen. Im Eis ist diese Ordnung vollständig und gemessen. Im flüssigen Wasser bilden sich eisähnliche Bereiche von rund einem Nanometer, die sich ständig umbauen. An wasserliebenden Oberflächen beschreibt Prof. Dr. Gerald H. Pollack sechseckige Wabenschichten, das EZ-Wasser.',
    quellen: ['kuhs1981', 'huang2009', 'pollack2013'],
  },
  {
    q: 'Gibt es hexagonales Wasser wirklich?',
    a: 'Ja. Eis ist hexagonal, das zeigen die Neutronenbeugung und jede Schneeflocke. Im flüssigen Wasser messen Röntgenverfahren eisähnlich geordnete Bereiche von rund einem Nanometer. An Oberflächen ordnet sich Wasser zu eisähnlichen Schichten, auf Glimmer auch bei Raumtemperatur. Beständige Wabenschichten an wasserliebenden Oberflächen beschreibt das EZ-Modell von Prof. Dr. Pollack.',
    quellen: [
      'kuhs1981',
      'libbrecht2005',
      'huang2009',
      'miranda1998',
      'pollack2013',
    ],
  },
  {
    q: 'Ist Eis hexagonales Wasser?',
    a: 'Ja, gewöhnliches Eis ist hexagonal. Es heißt Eis Ih, das h steht für hexagonal. Die Moleküle bilden ein Gitter aus sechseckigen Ringen, jedes im Tetraederwinkel zu vier Nachbarn.',
    quellen: ['kuhs1981'],
  },
  {
    q: 'Was unterscheidet hexagonales und kohärentes Wasser?',
    a: 'Hexagonal nennt die Form, kohärent das Verhalten. Hexagonal heißt, dass sich die Moleküle zu Sechsecken ordnen. Kohärent heißt, dass sie im Gleichtakt schwingen. EZ-Wasser verbindet beides: Es ist eine geordnete Schicht, die Pollack sechseckig beschreibt und Del Giudice kohärent.',
    quellen: ['pollack2013', 'delgiudice2013'],
  },
  {
    q: 'Was unterscheidet hexagonales und strukturiertes Wasser?',
    a: 'Hexagonal nennt eine bestimmte Ordnung, das Sechseck. Strukturiert ist ein Sammelbegriff für Wasser mit mehr Ordnung als gewöhnlich und hat keine feste Definition. Hexagonales Wasser ist damit eine Form von strukturiertem Wasser.',
    quellen: [],
  },
  {
    q: 'Ist belebtes Wasser dasselbe wie hexagonales Wasser?',
    a: 'Nein. Belebtes Wasser ist ein Handelsbegriff für Wasser, das mit Geräten aufbereitet wird. Hexagonal beschreibt die Ordnung der Moleküle. Der eine Begriff nennt ein Verfahren, der andere eine Struktur.',
    quellen: [],
  },
  {
    q: 'Wie lange hält die sechseckige Ordnung im flüssigen Wasser?',
    a: 'Im Inneren des Wassers bauen sich die Brücken in Billionstel Sekunden um, und die eisähnlichen Bereiche formen sich ständig neu. An wasserliebenden Oberflächen ist die Ordnung beständig: Die Ausschlusszone wächst binnen Minuten auf über 100 Mikrometer.',
    quellen: ['fecko2003', 'huang2009', 'huszar2014'],
  },
  {
    q: 'Was ist EZ-Wasser?',
    a: 'EZ steht für Exclusion Zone, Ausschlusszone. So heißt die geordnete Wasserschicht an wasserliebenden Oberflächen, die gelöste Teilchen hinausschiebt. Prof. Dr. Gerald H. Pollack beschreibt sie als Stapel sechseckiger Wabenschichten.',
    quellen: ['zheng2006', 'pollack2013'],
  },
];

/* ======================================================================== */
/* QUELLEN                                                                  */
/* ======================================================================== */

const DOI = (d) => `https://doi.org/${d}`;

/** Neu für diese Seite, am 2026-10-09 gegen Crossref geprüft. */
const QUELLEN_NEU = [
  {
    id: 'huang2009',
    autoren: 'Huang C, Wikfeldt KT, Tokushima T u. a.',
    jahr: '2009',
    titel: 'The inhomogeneous structure of water at ambient conditions',
    ort: 'PNAS 106, 15214–15218',
    url: DOI('10.1073/pnas.0904743106'),
    kern: 'Röntgenstreuung: Dichteschwankungen auf rund 1 nm, tetraedrisch geordnete und verzerrte Bereiche wechseln sich ab.',
  },
  {
    id: 'miranda1998',
    autoren: 'Miranda PB, Xu L, Shen YR, Salmeron M',
    jahr: '1998',
    titel: 'Icelike Water Monolayer Adsorbed on Mica at Room Temperature',
    ort: 'Phys. Rev. Lett. 81, 5876–5879',
    url: DOI('10.1103/PhysRevLett.81.5876'),
    kern: 'Bei Raumtemperatur bildet Wasser auf Glimmer eine eisähnlich geordnete Lage.',
  },
  {
    id: 'libbrecht2005',
    autoren: 'Libbrecht KG',
    jahr: '2005',
    titel: 'The physics of snow crystals',
    ort: 'Rep. Prog. Phys. 68, 855–895',
    url: DOI('10.1088/0034-4885/68/4/R03'),
    kern: 'Schneekristalle wachsen als sechseckige Eisprismen.',
  },
];

const ALLE = [...QUELLEN_NEU, ...QUELLEN_INFOSEITE];

/** Alle Texte mit Zitatmarken, in Lesereihenfolge. */
function texteInReihenfolge() {
  return [
    SEITE.kurz,
    ...[TEIL_EINFACH, TEIL_FAKTEN].flatMap((t) =>
      t.abschnitte.flatMap((a) => [
        ...(a.absaetze || []),
        a.grafik ? a.grafik.legende : '',
      ]),
    ),
    ...ABGRENZUNG.zeilen.map((z) => `${z.bedeutung} ${z.beleg}`),
    ...FRAGEN.map((f) => f.quellen.map((id) => `{q:${id}}`).join(' ')),
  ];
}

function zitierteIds() {
  const ids = [];
  for (const t of texteInReihenfolge()) {
    for (const m of String(t).matchAll(/\{q:([a-z0-9-]+)\}/g)) {
      if (!ids.includes(m[1])) ids.push(m[1]);
    }
  }
  return ids;
}

/**
 * Nur die zitierten Quellen, in der Reihenfolge des ersten Zitats. Fehlt eine
 * (Tippfehler, Eintrag auf der Info-Seite entfernt), wirft der Import: eine
 * Zitatmarke ohne Fundstelle wäre eine Aussage ohne Beleg.
 */
export const QUELLEN = zitierteIds().map((id) => {
  const q = ALLE.find((x) => x.id === id);
  if (!q) throw new Error(`Zitatmarke {q:${id}} ohne Eintrag in den Quellen`);
  return q;
});

export function quellenNummer(id) {
  const i = QUELLEN.findIndex((q) => q.id === id);
  if (i < 0) throw new Error(`Zitatmarke {q:${id}} ohne Eintrag in QUELLEN`);
  return i + 1;
}

export const WEITER = [
  {
    to: PFAD_INFOSEITE,
    titel: 'Was ist kohärentes Wasser?',
    text: 'Gleichtakt der Moleküle, kohärente Domänen und EZ-Wasser, mit animierten Grafiken und Primärquellen.',
  },
  {
    to: '/pages/technologie',
    titel: 'Die Technologie',
    text: 'Wie der GitterChip™ gebaut ist und was er mit geordnetem Wasser zu tun hat.',
  },
];

/* ======================================================================== */
/* STRUKTURIERTE DATEN                                                      */
/* ======================================================================== */

function ohneMarken(text) {
  return String(text)
    .replace(/\{q:[a-z0-9-]+\}/g, '')
    .replace(/\{l:[^}|]+\|([^}]+)\}/g, '$1')
    .replace(/\s+([.,;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function strukturierteDaten() {
  const url = absoluteCanonical(PFAD);
  const herausgeber = {
    '@type': 'Organization',
    name: 'Qi Blanco',
    url: absoluteCanonical('/'),
  };
  const artikel = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#artikel`,
    headline: SEITE.h1,
    alternativeHeadline: SEITE.titel.replace(/\s*\|\s*Qi Blanco$/, ''),
    description: SEITE.beschreibung,
    abstract: ohneMarken(SEITE.kurz),
    inLanguage: 'de-DE',
    url,
    mainEntityOfPage: url,
    datePublished: SEITE.veroeffentlicht,
    dateModified: SEITE.geaendert,
    author: {
      '@type': 'Person',
      name: SEITE.autorName,
      jobTitle: SEITE.autorRolle,
      worksFor: herausgeber,
    },
    publisher: herausgeber,
    about: [
      {'@type': 'Thing', name: 'Hexagonales Wasser'},
      {'@type': 'Thing', name: 'Eis Ih'},
      {'@type': 'Thing', name: 'EZ-Wasser'},
    ],
    isPartOf: {'@id': `${absoluteCanonical(PFAD_INFOSEITE)}#artikel`},
    citation: QUELLEN.filter((q) => q.url).map((q) => ({
      '@type': q.art === 'buch' ? 'Book' : 'ScholarlyArticle',
      name: q.titel,
      author: q.autoren,
      datePublished: q.jahr,
      url: q.url,
    })),
  };
  const fragen = FRAGEN.filter((f) => istSchemaSicher(`${f.q}\n${f.a}`));
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#fragen`,
    inLanguage: 'de-DE',
    mainEntity: fragen.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {'@type': 'Answer', text: f.a},
    })),
  };
  const begriffe = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${url}#abgrenzung`,
    name: 'Hexagonales Wasser und verwandte Begriffe',
    inLanguage: 'de-DE',
    hasDefinedTerm: ABGRENZUNG.zeilen
      .filter((z) => istSchemaSicher(z.bedeutung))
      .map((z) => ({
        '@type': 'DefinedTerm',
        '@id': `${url}#begriff-${z.id}`,
        name: z.begriff,
        description: z.bedeutung,
        inDefinedTermSet: `${url}#abgrenzung`,
      })),
  };
  return [artikel, faq, begriffe];
}
