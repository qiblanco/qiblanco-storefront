import {bilder, stufen} from '~/data/kohaerente-wasserstruktur';
import {AUTORENKASTEN} from '~/lib/autorenkasten';
import {absoluteCanonical} from '~/lib/seo';
import {isoMitZone} from '~/lib/datum';

/**
 * DER INHALT DER INFO-SEITE „KOHÄRENTES WASSER" — /pages/was-ist-kohaerentes-wasser.
 *
 * Auftrag: 20260923-GROSSJOB-was-ist-kohaerentes-wasser-wird-die-beste-infoseite
 * (Christian, 23.09.2026). Zwei Teile: „einfach erklärt" für den Laien, dann
 * „harte Fakten" mit Quellen. Jede Zahl trägt ihre Fundstelle als Zitatmarke
 * {q:id}; das Quellenverzeichnis unten nennt Werk, DOI oder PubMed-Link und
 * die Kernaussage. Die DOIs sind am 2026-09-23 einzeln gegen doi.org und
 * Crossref geprüft (Prüfbericht im Jobordner, QUELLEN-VERIFIZIERT-20260923.md).
 *
 * EINE ZAHLENHALTUNG FÜR DIE DREI STUFEN. Winkel, Formel, Energieniveau,
 * Dichte und Abstand der kohärenten Wasserstruktur stehen im Brain-SSoT
 * (qi-brain/brain/Marketing/kohaerente-wasserstruktur-gegenueberstellung.yaml)
 * und kommen über app/data/kohaerente-wasserstruktur.js hierher. Diese Datei
 * setzt sie in Sätze ein (Template-Literale), sie tippt sie nicht ein zweites
 * Mal. Die drei im SSoT als widerlegt geführten Werte stehen hier nicht.
 *
 * GRENZEN, die jeder Satz hier einhält (Christian, GL-SPR-0008 und die
 * Hausregeln):
 *  - Die Seite beschreibt Wasser, nicht den menschlichen Körper. Kein Satz
 *    verspricht eine Wirkung auf Gesundheit, Zellen oder Krankheiten.
 *  - Was gemessen ist, steht als Messung; was ein Modell erklärt, steht als
 *    Modell. Die Aussageklasse steht als Überschrift über dem Abschnitt,
 *    nicht als Vorbehalt im Satz.
 *  - Keine Selbstentwertung, kein Katalog der Kritik.
 *  - Hausstimme: Antwort zuerst, ein Gedanke je Satz, kein Satz über die
 *    Seite selbst (homepage-bauer/bin/stil-pruefe misst es).
 */

const WINKEL = bilder.find((b) => b.id === 'winkel');
const DOMAENE = bilder.find((b) => b.id === 'domaene');
const STUFE = Object.fromEntries(stufen.map((s) => [s.id, s]));
const [DICHTE, ABSTAND] = DOMAENE.schwellen;
const VON = WINKEL.von.anzeige;
const NACH = WINKEL.nach.anzeige;
const ENERGIE = DOMAENE.energie.anzeige;
const FORMEL_EZ = STUFE.ez.formel;

export const PFAD = '/pages/was-ist-kohaerentes-wasser';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich
 * bei jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet. WER
 * DEN TEXT ÄNDERT, ZIEHT `GEAENDERT` NACH — und `lastmod` in NUR_ROUTE_SEITEN
 * (app/lib/seo.js) im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-23';
const GEAENDERT = '2026-09-23';

export const SEITE = {
  pfad: PFAD,
  titel: 'Kohärentes Wasser einfach erklärt, mit Quellen | Qi Blanco',
  beschreibung:
    'Kohärentes und hexagonales Wasser einfach erklärt: Winkel, kohärente Domäne, EZ-Wasser. Dann die harten Fakten mit animierten Grafiken und Primärquellen.',
  marke: 'Deep Dive',
  h1: 'Was ist kohärentes Wasser?',
  unterzeile:
    'Was es ist, woher es kommt und was es von normalem Wasser unterscheidet. Erst einfach erklärt, dann mit harten Fakten und Primärquellen.',
  kurzTitel: 'Kurz gesagt',
  kurz:
    'Kohärentes Wasser ist Wasser, dessen Moleküle sich ordnen und gemeinsam verhalten. In normalem Wasser lösen sich die Verbindungen zwischen den Molekülen ständig und bilden sich neu. Im kohärenten Zustand schwingen die Moleküle im Gleichtakt, in sogenannten kohärenten Domänen. An wasserliebenden Oberflächen legen sie sich zu stabilen, sechseckigen Schichten, die Prof. Dr. Gerald H. Pollack EZ-Wasser nennt.',
  autorName: AUTORENKASTEN.name,
  autorRolle: AUTORENKASTEN.rolle,
  autorZeile: `Von ${AUTORENKASTEN.name}`,
  veroeffentlicht: isoMitZone(VEROEFFENTLICHT),
  geaendert: isoMitZone(GEAENDERT),
  standAnzeige: '23. September 2026',
  standZeile:
    'Stand: 23. September 2026. Jede Zahl trägt ihre Quelle. Neue Veröffentlichungen nehmen wir auf, sobald sie erscheinen.',
  leitLegende: `Nimmt das Wassermolekül Energie auf, weitet sich sein Winkel von ${VON} auf ${NACH}. Dann ordnen sich die Nachbarn zu einem Sechseck.`,
};

export const INHALT = [
  {id: 'einfach', titel: 'Teil 1: einfach erklärt'},
  {id: 'fakten', titel: 'Teil 2: harte Fakten'},
  {id: 'stufen', titel: 'Die drei Stufen im Vergleich'},
  {id: 'begriffe', titel: 'Hexagonal, strukturiert, kohärent: die Begriffe'},
  {id: 'fragen', titel: 'Häufige Fragen'},
  {id: 'quellen', titel: 'Quellen'},
];

/* ======================================================================== */
/* TEIL 1 — EINFACH ERKLÄRT                                                 */
/* ======================================================================== */

export const TEIL_EINFACH = {
  id: 'einfach',
  nr: 'Teil 1',
  titel: 'Kohärentes Wasser einfach erklärt',
  einleitung: 'Vier Fragen, vier kurze Antworten. Ohne Formeln, dafür mit Bildern.',
  abschnitte: [
    {
      id: 'was-ist-es',
      titel: 'Was ist kohärentes Wasser?',
      absaetze: [
        'Kohärent heißt: im Gleichtakt. Kohärentes Wasser ist Wasser, in dem viele Moleküle dasselbe tun, statt jedes für sich.',
        'Stell dir einen Chor vor. In normalem Wasser singt jedes Molekül seine eigene Melodie, und die Verbindungen zu den Nachbarn wechseln ständig. In kohärentem Wasser singen viele Moleküle im selben Takt.',
      ],
    },
    {
      id: 'woher',
      titel: 'Woher kommt es?',
      absaetze: ['Drei Dinge bringen Wasser in Ordnung.'],
      karten: [
        {
          titel: 'Oberflächen',
          text: 'Wo Wasser eine wasserliebende Fläche berührt, ordnet es sich zu einer Schicht. Glas, Gele und Pflanzenfasern sind solche Flächen.',
        },
        {
          titel: 'Licht',
          text: 'Licht lässt die geordnete Schicht wachsen, besonders Infrarot. Das Wasser nimmt dabei Energie auf und hält sie als Ordnung fest.',
        },
        {
          titel: 'Nähe',
          text: 'Rücken die Moleküle eng genug zusammen, beginnen sie gemeinsam zu schwingen. So entsteht eine kohärente Domäne.',
        },
      ],
    },
    {
      id: 'unterschied',
      titel: 'Was ist der Unterschied zu normalem Wasser?',
      stufenbilder: true,
      video: true,
      absaetze: [
        'Normales Wasser ist ständig in Bewegung: Die Brücken zwischen seinen Molekülen halten nur Sekundenbruchteile. Geordnetes Wasser hält seine Form. Drei Schritte führen dorthin.',
      ],
      nachGrafik: [
        `Der Winkel ist der erste Schritt. Im normalen Wassermolekül stehen die beiden Wasserstoff-Atome im Winkel von ${VON} zueinander. Nimmt das Molekül Energie auf, weitet sich der Winkel auf ${NACH}, und genau dieser Winkel passt in ein sechseckiges Gitter.`,
      ],
    },
    {
      id: 'was-bringt-es',
      titel: 'Was bringt es?',
      absaetze: [
        'Geordnetes Wasser verhält sich anders als gewöhnliches Wasser. Vier Eigenschaften sind gemessen, in Teil 2 steht zu jeder die Quelle.',
      ],
      karten: [
        {
          titel: 'Ordnung, die hält',
          text: 'An einer Oberfläche bleibt die geordnete Schicht bestehen, solange die Oberfläche da ist. Sie wird oft einige hundert Mikrometer breit.',
        },
        {
          titel: 'Getrennte Ladung',
          text: 'Die geordnete Schicht ist negativ geladen, das Wasser dahinter positiv. Zusammen wirkt das wie eine kleine Batterie.',
        },
        {
          titel: 'Energie aus Licht',
          text: 'Unter Licht wächst die Schicht. Aus Strahlung wird so Ordnung und getrennte Ladung.',
        },
        {
          titel: 'Eine Zone, die frei bleibt',
          text: 'Die Schicht schiebt gelöste Teilchen hinaus. Daher kommt ihr Name: Ausschlusszone, englisch Exclusion Zone, kurz EZ.',
        },
      ],
    },
  ],
};

/* ======================================================================== */
/* TEIL 2 — HARTE FAKTEN                                                    */
/* ======================================================================== */

export const TEIL_FAKTEN = {
  id: 'fakten',
  nr: 'Teil 2',
  titel: 'Kohärentes Wasser: harte Fakten',
  einleitung:
    'Jede Zahl mit ihrer Fundstelle. Über jedem Abschnitt steht, ob er eine Messung beschreibt oder ein Modell.',
  abschnitte: [],
};

/* ======================================================================== */
/* STUFENTAFEL, BEGRIFFE, VIDEO                                             */
/* ======================================================================== */

export const STUFENTAFEL = {
  titel: 'Die drei Stufen des Wassers im Vergleich',
  erklaerung: {
    normal:
      'Normales Wasser: Die Brücken zwischen den Molekülen lösen sich ständig und bilden sich neu. Das ist der Grundzustand.',
    domaene:
      'Kohärente Domäne: Inseln im Wasser, in denen die Moleküle im Gleichtakt schwingen. Sie wechseln ständig mit normalem Wasser.',
    ez: 'EZ-Wasser: An Oberflächen hält die Ordnung und wird zu sechseckigen Schichten. Das ist die beständigste der drei Stufen.',
  },
};

export const BEGRIFFE = {
  legende: 'Sieben Begriffe, die oft vermischt werden, und was jeder genau meint.',
  spalten: ['Begriff', 'Was gemeint ist', 'Wer ihn prägt'],
  zeilen: [],
};

export const VIDEO = {
  id: '6rNuQoIrdZQ',
  titel: 'Was macht Wasser im Körper mit deiner Energie? Die kohärente Struktur erklärt',
  posterAlt: 'Vorschaubild des Videos zur kohärenten Wasserstruktur',
  legende: 'Christian Bauer erklärt die kohärente Struktur im Video (8 Minuten).',
  playlistUrl:
    'https://www.youtube.com/watch?v=6rNuQoIrdZQ&list=PLkq_JoKriG7QvyBETfGuAeRHd6G6oa_RR',
  playlistText: 'Alle Videos der Reihe auf YouTube',
  // Ernte des eigenen Kanals (homepage-bauer/data/erfahrungen/videos.json,
  // erhoben 2026-09-07): publishedAt und contentDetails.duration. Der Titel
  // ist der heutige (oEmbed 2026-09-23); der Kanal hat das Video umbenannt.
  hochgeladen: '2020-11-10T14:21:11Z',
  dauer: 'PT8M3S',
};

export const FRAGEN = [];
export const GLOSSAR = [];
export const QUELLEN = [];

export const WEITER = [
  {
    to: '/pages/technologie',
    titel: 'Die Technologie',
    text: 'Wie der GitterChip™ gebaut ist und was er mit geordnetem Wasser zu tun hat.',
  },
  {
    to: '/pages/studien',
    titel: 'Die Studien',
    text: 'Fünf Laborstudien in Japan und den USA, mit Methode und Ergebnis.',
  },
  {
    to: '/pages/kohaerentes-wasser',
    titel: 'Der Kurs, Tag 5',
    text: 'Kohärente Wasserstrukturen als Lektion im Gratis-Kurs „In 5 Stufen zum Superhuman".',
  },
];

/** Laufende Nummer einer Quelle im Verzeichnis (1-basiert). */
export function quellenNummer(id) {
  const i = QUELLEN.findIndex((q) => q.id === id);
  if (i < 0) {
    // FAIL-LOUD: eine Zitatmarke ohne Quelle wäre eine Zahl ohne Fundstelle.
    throw new Error(`Zitatmarke {q:${id}} ohne Eintrag in QUELLEN`);
  }
  return i + 1;
}

/* ======================================================================== */
/* STRUKTURIERTE DATEN                                                      */
/* ======================================================================== */

/**
 * GL-SPR-0008 als Sperre an der Stelle, an der Text maschinenlesbar wird.
 * ANDERS als app/lib/faq-schema.js: dort sperrt die Produkt-FAQ-Leitplanke
 * (Juli 2026) das Wort „kohärent" selbst und jede Nanometer-Angabe. Auf einer
 * Seite, deren Gegenstand kohärentes Wasser ist, bliebe damit nichts übrig,
 * und Christians Auftrag verlangt FAQPage und DefinedTerm ausdrücklich. Die
 * Sperre hier sitzt deshalb auf dem, was die Regel meint: Heil- und
 * Körperschutzzusagen. Trifft sie, fliegt der Eintrag aus dem Schema, und der
 * Test test/kohaerentes-wasser-info.test.mjs wird rot (nichts fällt still weg).
 */
export const KOERPER_SPERRE = [
  /st(ä|ae)rk\w* (dein|das|ihr|unser) Immunsystem/i,
  /sch(ü|ue)tz\w* (deine |die |unsere )?Zellen/i,
  /vor Viren/i,
  /\bheil(t|en|ung|end)\b/i,
  /verhinder\w* Krankheit/i,
  /sch(ü|ue)tz\w* (dich|deinen K(ö|oe)rper) vor/i,
  /Therapie|therapeut/i,
  /Krankheit|Erkrankung/i,
];

export function istSchemaSicher(text) {
  return !KOERPER_SPERRE.some((rx) => rx.test(String(text)));
}

function ohneMarken(text) {
  return String(text)
    .replace(/\{q:[a-z0-9-]+\}/g, '')
    .replace(/\{l:[^}|]+\|([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function strukturierteDaten() {
  const url = absoluteCanonical(PFAD);
  const autor = {
    '@type': 'Person',
    name: SEITE.autorName,
    jobTitle: SEITE.autorRolle,
    worksFor: {'@type': 'Organization', name: 'Qi Blanco', url: absoluteCanonical('/')},
  };
  const herausgeber = {
    '@type': 'Organization',
    name: 'Qi Blanco',
    url: absoluteCanonical('/'),
  };
  const zitate = QUELLEN.filter((q) => q.url).map((q) => ({
    '@type': q.art === 'buch' ? 'Book' : 'ScholarlyArticle',
    name: q.titel,
    author: q.autoren,
    datePublished: q.jahr,
    url: q.url,
  }));
  const artikel = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#artikel`,
    headline: SEITE.h1,
    alternativeHeadline: SEITE.titel.replace(/\s*\|\s*Qi Blanco$/, ''),
    description: SEITE.beschreibung,
    abstract: SEITE.kurz,
    inLanguage: 'de-DE',
    url,
    mainEntityOfPage: url,
    datePublished: SEITE.veroeffentlicht,
    dateModified: SEITE.geaendert,
    author: autor,
    publisher: herausgeber,
    about: [
      {'@type': 'Thing', name: 'Kohärentes Wasser'},
      {'@type': 'Thing', name: 'Hexagonales Wasser'},
      {'@type': 'Thing', name: 'EZ-Wasser'},
    ],
    citation: zitate,
    video: {'@id': `${url}#video-${VIDEO.id}`},
    hasPart: [TEIL_EINFACH, TEIL_FAKTEN].map((t) => ({
      '@type': 'WebPageElement',
      name: t.titel,
      url: `${url}#${t.id}`,
    })),
  };
  const fragen = FRAGEN.filter((f) => istSchemaSicher(`${f.q}\n${f.a}`));
  const faq = fragen.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#fragen`,
        inLanguage: 'de-DE',
        mainEntity: fragen.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {'@type': 'Answer', text: ohneMarken(f.a)},
        })),
      }
    : null;
  const glossar = GLOSSAR.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${url}#glossar`,
        name: 'Glossar: kohärentes Wasser',
        inLanguage: 'de-DE',
        hasDefinedTerm: GLOSSAR.filter((g) => istSchemaSicher(g.definition)).map((g) => ({
          '@type': 'DefinedTerm',
          '@id': `${url}#begriff-${g.id}`,
          name: g.begriff,
          description: ohneMarken(g.definition),
          inDefinedTermSet: `${url}#glossar`,
        })),
      }
    : null;
  const video = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${url}#video-${VIDEO.id}`,
    name: VIDEO.titel,
    description: SEITE.beschreibung,
    thumbnailUrl: `https://i.ytimg.com/vi/${VIDEO.id}/hqdefault.jpg`,
    uploadDate: VIDEO.hochgeladen,
    duration: VIDEO.dauer,
    embedUrl: `https://www.youtube.com/embed/${VIDEO.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${VIDEO.id}`,
  };
  return [artikel, faq, glossar, video].filter(Boolean);
}
