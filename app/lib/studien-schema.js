/**
 * JSON-LD fuer die Studien-Sektion. Reine Datenfabrik ohne React-Import
 * (Node-unit-testbar, analog seo.js / structured-data.js).
 *
 * WARUM: /pages/studien trug am 2026-08-14 gemessen NULL JSON-LD-Bloecke
 * (seo.db OnPage-Messung: `jsonld_typen: []`). Fuer Google und fuer zitierende
 * KI-Systeme war die Seite damit Fliesstext, kein wissenschaftlicher Beleg —
 * obwohl vier peer-reviewte Publikationen mit DOI dahinterstehen. Das ist
 * Massnahme St-3 aus dem SEO-Master-Konzept Kap. 6.4.
 *
 * TYPWAHL: `ScholarlyArticle` statt `MedicalScholarlyArticle`. Der
 * medizinische Subtyp erwartet eine medizinische Fachpublikation und zieht
 * Gesundheits-Auswertung nach sich; unsere Arbeiten sind zellbiologische
 * In-vitro-Untersuchungen ohne klinischen Endpunkt. Der engere Typ waere hier
 * eine Behauptung ueber die Evidenzstufe, die die Studien nicht tragen.
 */

import {CANONICAL_ORIGIN, absoluteCanonical} from './seo';

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
  if (e.lizenz) artikel.license = e.lizenz;
  if (e.doi) {
    artikel.identifier = {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: e.doi,
    };
    artikel.sameAs = `https://doi.org/${e.doi}`;
  }
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
 * CollectionPage + ItemList fuer die Uebersicht. Die ItemList nennt die vier
 * Einzelseiten in derselben Reihenfolge, in der sie gerendert werden — eine
 * Liste, die eine andere Reihenfolge behauptet als die Seite zeigt, ist ein
 * Widerspruch, den Google als Unstimmigkeit liest.
 */
export function uebersichtSchema(studien) {
  const url = absoluteCanonical('/pages/studien');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#sammlung`,
        url,
        name: 'Wissenschaftliche Studien zu Qi Blanco',
        description:
          'Vier zellbiologische Fachpublikationen zu QiOne® 2 Pro und QiBracelet® — je mit Zusammenfassung in Normalsprache, deutschem Volltext, Abbildungen und Original-PDF.',
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
