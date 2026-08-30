/**
 * JSON-LD für die Studien-Sektion. Reine Datenfabrik ohne React-Import
 * (Node-unit-testbar, analog seo.js / structured-data.js).
 *
 * WARUM: /pages/studien trug am 2026-08-14 gemessen NULL JSON-LD-Bloecke
 * (seo.db OnPage-Messung: `jsonld_typen: []`). Für Google und für zitierende
 * KI-Systeme war die Seite damit Fliesstext, kein wissenschaftlicher Beleg —
 * obwohl mehrere peer-reviewte Publikationen dahinterstehen. Das ist
 * Maßnahme St-3 aus dem SEO-Master-Konzept Kap. 6.4.
 *
 * TYPWAHL: `ScholarlyArticle` statt `MedicalScholarlyArticle`. Der
 * medizinische Subtyp erwartet eine medizinische Fachpublikation und zieht
 * Gesundheits-Auswertung nach sich; unsere Arbeiten sind zellbiologische
 * In-vitro-Untersuchungen ohne klinischen Endpunkt. Der engere Typ wäre hier
 * eine Behauptung über die Evidenzstufe, die die Studien nicht tragen.
 */

// Import-Spezifizierer MIT `.js` — wie in entity-schema.js und aus demselben
// Grund: Vite loest beide Formen auf, `node --test` nur diese. Ohne die
// Endung ist dieses Modul aus einem Bordmittel-Test baulich nicht erreichbar,
// und genau das war es bis 2026-08-24 auch (0 Tests auf den Studien-Graphen).
import {CANONICAL_ORIGIN, absoluteCanonical} from './seo.js';
import {ORG_ID} from './entity-schema.js';
import {standFuer} from '../data/redaktionsstand.js';

const VERLAG = {
  '@type': 'Organization',
  name: 'Dartsch Scientific GmbH',
  url: 'https://www.dartsch-scientific.com/',
};

const AUTOR = {
  '@type': 'Person',
  name: 'Prof. Dr. Peter C. Dartsch',
  affiliation: {
    '@type': 'Organization',
    name: 'Dartsch Scientific GmbH, Institute for Cell Biological Test Systems',
  },
};

/**
 * ScholarlyArticle-Graph EINER Studie, inkl. Abbildungen als ImageObject und
 * FAQPage, wenn die Studie Laien-Fragen mitbringt.
 */
export function studieSchema(studie) {
  const url = absoluteCanonical(`/pages/${studie.slug}`);
  const e = studie.eckdaten;

  const artikel = {
    '@type': 'ScholarlyArticle',
    '@id': `${url}#artikel`,
    headline: e.titelDeutsch || studie.seo.h1,
    alternativeHeadline: e.titelOriginal,
    name: e.titelDeutsch || studie.seo.h1,
    description: studie.laienSummary?.antwort || studie.seo.beschreibung,
    inLanguage: 'de',
    url,
    mainEntityOfPage: {'@type': 'WebPage', '@id': url},
    author: AUTOR,
    creator: AUTOR,
    publisher: {
      '@type': 'Organization',
      name: e.journal,
    },
    sourceOrganization: VERLAG,
    isBasedOn: e.pdfUrl || undefined,
    // Das Original ist englisch; die Seite ist die getreue deutsche Wiedergabe.
    workTranslation: undefined,
    translationOfWork: e.titelOriginal
      ? {'@type': 'ScholarlyArticle', name: e.titelOriginal, inLanguage: 'en'}
      : undefined,
    about: [e.produkt, 'Zellbiologie', 'In-vitro-Untersuchung'].filter(Boolean),
    learningResourceType: 'research paper',
  };

  if (e.veroeffentlicht) artikel.datePublished = e.veroeffentlicht;
  if (e.eingereicht) artikel.dateCreated = e.eingereicht;
  // ZWEI VERSCHIEDENE DATEN, DIE MAN LEICHT VERWECHSELT: `datePublished` ist
  // das Erscheinungsdatum der PUBLIKATION (2021 bei e0002 — daran ändern wir
  // nie etwas), `dateModified` ist der Stand UNSERER Wiedergabe. Am 2026-08-24
  // gemessen fehlte das zweite auf allen fünf Blättern; das Backlog nahm an,
  // die Blätter trügen es bereits und nur der Hub nicht. Sie trugen es nicht.
  artikel.dateModified = standFuer(`/pages/${studie.slug}`);
  if (e.lizenz) artikel.license = e.lizenz;
  if (e.doi) {
    // identifier ist eine KENNUNG — wahr, unabhängig davon, ob ein Resolver sie
    // kennt. sameAs ist dagegen die Behauptung "diese Seite ist dasselbe Ding wie
    // jene URL". Bei `doiAufloesbar: false` wäre das eine maschinenlesbare
    // Falschaussage an Suchmaschinen auf eine 404-URL — schlimmer als der
    // sichtbare tote Link, weil sie niemand sieht. Deshalb nur sameAs entfaellt.
    artikel.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: e.doi,
    };
    if (e.doiAufloesbar !== false) artikel.sameAs = `https://doi.org/${e.doi}`;
  }
  // Loest der DOI nicht auf, ist die Artikelseite des Journals der einzige
  // maschinenlesbare Weg zur Originalquelle.
  if (e.artikelUrl) artikel.isBasedOn = [e.pdfUrl, e.artikelUrl].filter(Boolean);
  if (e.issn) artikel.isPartOf = {'@type': 'Periodical', name: e.journal, issn: e.issn};
  else if (e.journal) artikel.isPartOf = {'@type': 'Periodical', name: e.journal};
  if (e.band) artikel.pagination = e.band;
  if (studie.zitation?.text) artikel.citation = studie.zitation.text;

  const bilder = (studie.grafiken || [])
    .filter((g) => g.url)
    .map((g) => ({
      '@type': 'ImageObject',
      '@id': `${url}#${g.key}`,
      contentUrl: g.url,
      url: g.url,
      caption: g.bildunterschrift,
      description: g.alt,
      representativeOfPage: false,
    }));
  if (bilder.length) artikel.image = bilder;

  const graph = [artikel, brotkrume(studie), ...bilder];

  const faq = faqSchema(studie, url);
  if (faq) graph.push(faq);

  return {'@context': 'https://schema.org', '@graph': graph};
}

function brotkrume(studie) {
  const url = absoluteCanonical(`/pages/${studie.slug}`);
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#brotkrume`,
    itemListElement: [
      {'@type': 'ListItem', position: 1, name: 'Startseite', item: `${CANONICAL_ORIGIN}/`},
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Studien',
        item: absoluteCanonical('/pages/studien'),
      },
      {'@type': 'ListItem', position: 3, name: studie.seo.h1, item: url},
    ],
  };
}

function faqSchema(studie, url) {
  const faq = (studie.faq || []).filter((f) => f.frage && f.antwort);
  if (!faq.length) return null;
  return {
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.frage,
      acceptedAnswer: {'@type': 'Answer', text: f.antwort},
    })),
  };
}

/**
 * Zahlwort am Satzanfang. Bewusst LOKAL statt aus ~/data/studien importiert:
 * dieses Modul ist eine reine Datenfabrik ohne Registry-Abhaengigkeit und soll
 * mit einer beliebigen Studien-Liste als Argument testbar bleiben.
 */
const ZAHLWORTE_CAP = ['Null', 'Eine', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht'];

function zahlwortCap(n) {
  return ZAHLWORTE_CAP[n] || String(n);
}

/** „QiOne® 2 Pro, QiBracelet® und QiHome® Air" — aus den Daten, nach Studienzahl. */
function produktAufzaehlung(studien) {
  const zahl = new Map();
  for (const s of studien) {
    for (const p of s.produkte || [s.eckdaten?.produkt]) {
      if (p) zahl.set(p, (zahl.get(p) || 0) + 1);
    }
  }
  const namen = [...zahl.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([n]) => n);
  if (namen.length <= 1) return namen[0] || '';
  return `${namen.slice(0, -1).join(', ')} und ${namen[namen.length - 1]}`;
}

/**
 * CollectionPage + ItemList für die Übersicht. Die ItemList nennt die
 * Einzelseiten in derselben Reihenfolge, in der sie gerendert werden — eine
 * Liste, die eine andere Reihenfolge behauptet als die Seite zeigt, ist ein
 * Widerspruch, den Google als Unstimmigkeit liest.
 *
 * URHEBERSCHAFT UND DATIERUNG (Backlog-Posten B-10(c), ergänzt 2026-08-24):
 * Der Hub war schwächer ausgezeichnet als seine eigenen Blätter — die
 * Einzelseiten tragen seit jeher `author` (Prof. Dr. Dartsch) und
 * `datePublished`, die Übersicht trug NICHTS davon. Genau verkehrt herum: die
 * Übersicht ist die Seite, auf der eine Suchmaschine einsteigt.
 *
 * WER IST HIER `author`, UND WARUM NICHT DER STUDIENAUTOR: diese Seite ist
 * keine Publikation, sondern eine redaktionelle Zusammenstellung. Prof. Dr.
 * Dartsch hat die Untersuchungen verfasst, nicht unsere Übersicht über sie —
 * ihn hier als Autor zu führen wäre eine Zuschreibung, die er nie gemacht
 * hat. Autor der Zusammenstellung ist die Organisation, und sie wird per
 * `@id` referenziert statt gedoppelt (der Knoten entsteht einmal in
 * app/lib/entity-schema.js). Der Studienautor steht unverändert dort, wo er
 * hingehört: auf jedem einzelnen ScholarlyArticle.
 *
 * `dateModified` kommt aus app/data/redaktionsstand.js — einem gemessenen
 * Datum, nicht aus `new Date()`. Begründung im Kopf jener Datei.
 */
export function übersichtSchema(studien) {
  const url = absoluteCanonical('/pages/studien');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#sammlung`,
        url,
        name: 'Wissenschaftliche Studien zu Qi Blanco',
        author: {'@id': ORG_ID},
        publisher: {'@id': ORG_ID},
        dateModified: standFuer('/pages/studien'),
        // Anzahl und Produktliste kommen aus den Daten: eine feste Zahl hier war
        // schon einmal die Naht, die beim Ergänzen der fuenften Studie riss.
        description:
          `${zahlwortCap(studien.length)} zellbiologische Fachpublikationen zu ` +
          `${produktAufzaehlung(studien)} — je mit Zusammenfassung in Normalsprache, ` +
          'deutschem Volltext, Abbildungen und Original-PDF.',
        inLanguage: 'de',
        isPartOf: {'@type': 'WebSite', '@id': `${CANONICAL_ORIGIN}/#website`},
        about: 'Zellbiologische In-vitro-Untersuchungen zu Qi Blanco Produkten',
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#liste`,
        name: 'Studienübersicht',
        numberOfItems: studien.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: studien.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: s.eckdaten.titelDeutsch || s.seo.h1,
          url: absoluteCanonical(`/pages/${s.slug}`),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#brotkrume`,
        itemListElement: [
          {'@type': 'ListItem', position: 1, name: 'Startseite', item: `${CANONICAL_ORIGIN}/`},
          {'@type': 'ListItem', position: 2, name: 'Studien', item: url},
        ],
      },
    ],
  };
}
