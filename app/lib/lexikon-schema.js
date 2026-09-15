/**
 * JSON-LD für das Lexikon (`DefinedTerm` je Eintrag, `DefinedTermSet` am Hub).
 * Reine Datenfabrik ohne React-Import — `node --test` kann sie direkt laden,
 * wie faq-schema.js und studien-schema.js.
 *
 * WOZU: ein Antwortsystem schneidet Texte in Abschnitte und bewertet sie
 * ISOLIERT. Ein Begriff, der nur ein Anker auf einer Sammelseite ist, wird mit
 * dem Nachbarbegriff zusammen geschnitten und verliert seine Definition.
 * Deshalb hat jeder Eintrag eine eigene URL — und `DefinedTerm` ist der Typ,
 * der sagt: das hier ist eine Begriffsklärung, keine Werbung.
 *
 * MIT DER EINSCHRÄNKUNG, DIE DAS HAUS SELBST BELEGT HAT: Markup allein bewegt
 * die Zitierung nicht. `merchantReturnDays: 20` stand korrekt im Produkt-
 * Markup, und Googles KI-Antwort nannte trotzdem 14 Tage. Das Markup ist die
 * Ordnung, der Text ist die Substanz.
 *
 * ── DAS DENY-NETZ: GEERBT, NICHT KOPIERT, UND AN EINER STELLE GESCHÄRFT ───
 *
 * `FORBIDDEN_PATTERNS` kommt aus faq-schema.js (P10 — ein Vokabular, nicht
 * zwei). Dort gilt die Regel „ein Treffer, also raus": eine FAQ-Antwort, die
 * einen unbelegten Wirkmechanismus behauptet, wird nicht maschinenlesbar
 * verstärkt. Das ist für eine FAQ richtig.
 *
 * FÜR EIN LEXIKON WÄRE ES FALSCH, und das ist gemessen, nicht vermutet
 * (2026-09-15, alle neun Einträge gegen alle zehn Muster): acht Einträge sind
 * frei. Genau EINER trifft, auf genau EINEM Muster — `/koh(ä|ae)rent/` bei
 * „kohärentes Wasser" — und er trifft dort in `begriff`, `definition`,
 * `gebrauch`, `uebertragung` UND in `grenze`. Der Treffer sitzt also auch in
 * dem Satz, der die Reichweite begrenzt: „«Kohärentes Wasser» trägt nicht als
 * dauerhafter Zustand und nicht als Speicher für Information."
 *
 * Das Muster ist im FAQ-Kontext ein STELLVERTRETER für „kohärente
 * Wasserstruktur als Wirkmechanismus behauptet". Im Lexikon ist derselbe
 * String das STICHWORT eines Eintrags, dessen ganzer Zweck die Begrenzung
 * ist. Das Netz unverändert anzuwenden hätte ausgerechnet die eine Seite aus
 * den strukturierten Daten geworfen, die den Anspruch eingrenzt — maschinell
 * ärmer und zugleich unbegrenzter.
 *
 * DIE SCHÄRFUNG LAUTET DESHALB: ein Muster darf im Eintrag stehen, WENN
 * dasselbe Muster auch in der Grenze steht. Ein umstrittenes Wort darf genannt
 * werden, wenn im selben Eintrag steht, wo es aufhört. Schweigt die Grenze
 * dazu, fällt der Eintrag aus dem Schema. Das ist an einer Stelle milder als
 * das FAQ-Netz und an einer anderen strenger — die FAQ verlangt keine Grenze,
 * hier ist sie Pflicht. faq-schema.js selbst bleibt unangetastet.
 *
 * DER STILLE VERLUST IST DER TEURE FALL: ein Filter, der Einträge auswirft,
 * liefert einfach ein kürzeres Schema, ohne Fehlermeldung — die Seite bliebe
 * sichtbar und würde nur für Maschinen ärmer. Dagegen steht
 * test/lexikon-vollstaendigkeit.test.mjs, und zwar OHNE gepinnte Zahl: er
 * vergleicht die Zahl der DefinedTerm-Knoten gegen `LEXIKON.length`. Wächst
 * das Lexikon, wächst der Sollwert mit.
 */

import {FORBIDDEN_PATTERNS, normalizeText} from './faq-schema.js';
import {CANONICAL_ORIGIN, absoluteCanonical} from './seo.js';
import {ORG_ID, SITE_ID} from './entity-schema.js';

export const HUB_PFAD = '/pages/lexikon';
export const SET_ID = `${absoluteCanonical(HUB_PFAD)}#begriffssammlung`;

/** Alle Textfelder, die eine AUSSAGE tragen (ohne die Grenze selbst). */
function anspruchstext(e) {
  return [
    e.definition,
    ...(e.gebrauch || []),
    ...(e.physik || []),
    e.uebertragung,
    ...(e.uebertragung_begruendung || []),
  ]
    .filter(Boolean)
    .join('\n');
}

/** Der Text, der die Reichweite begrenzt. */
function grenztext(e) {
  return [e.grenze, ...(e.grenze_begruendung || [])].filter(Boolean).join('\n');
}

/**
 * Welche Muster nennt der Eintrag, ohne sie in seiner Grenze einzufangen?
 * Leeres Array = sauber. Das Ergebnis ist die BEGRÜNDUNG eines Ausschlusses
 * und wird vom Test ausgegeben — ein Ausschluss ohne Grund wäre ein stiller
 * Verlust.
 * @param {object} e
 * @returns {string[]} die Quelltexte der ungedeckten Muster
 */
export function ungedeckteMuster(e) {
  if (!e || typeof e.grenze !== 'string' || !e.grenze.trim()) {
    return ['(kein Feld `grenze` — ein Eintrag ohne seine Grenze wäre Werbung)'];
  }
  const anspruch = anspruchstext(e);
  const grenze = grenztext(e);
  return FORBIDDEN_PATTERNS.filter(
    (re) => re.test(anspruch) && !re.test(grenze),
  ).map((re) => re.source);
}

/**
 * Darf dieser Eintrag in die strukturierten Daten?
 * @param {object} e
 * @returns {boolean}
 */
export function istSchemaSicher(e) {
  return ungedeckteMuster(e).length === 0;
}

/**
 * `DefinedTerm` eines Eintrags.
 *
 * `description` trägt Definition UND Grenze in einem Feld — bewusst. Ein
 * Antwortsystem übernimmt oft genau dieses eine Feld; stünde die Grenze nur
 * daneben, könnte die Behauptung ohne ihre Reichweite zitiert werden. Genau
 * das soll dieses Lexikon verhindern.
 * @param {object} e
 */
export function definedTerm(e) {
  const url = absoluteCanonical(e.pfad);
  const belege = (e.quellen_aufgeloest || [])
    .map((q) => q && q.url)
    .filter(Boolean);
  return {
    '@type': 'DefinedTerm',
    '@id': `${url}#begriff`,
    name: normalizeText(e.begriff),
    url,
    inLanguage: 'de',
    description: normalizeText(`${e.definition} ${e.grenze}`),
    disambiguatingDescription: normalizeText(e.grenze),
    inDefinedTermSet: {'@type': 'DefinedTermSet', '@id': SET_ID},
    ...(belege.length ? {subjectOf: belege.map((u) => ({'@id': u}))} : {}),
  };
}

/**
 * Graph EINER Eintragsseite: die Seite, der Begriff darauf, die Brotkrume.
 * @param {object} e
 * @param {{datePublished: string, dateModified: string}} datum
 */
export function eintragSchema(e, datum) {
  if (!istSchemaSicher(e)) return null;
  const url = absoluteCanonical(e.pfad);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#seite`,
        url,
        name: normalizeText(e.begriff),
        inLanguage: 'de',
        isPartOf: {'@type': 'WebSite', '@id': SITE_ID},
        publisher: {'@id': ORG_ID},
        datePublished: datum.datePublished,
        dateModified: datum.dateModified,
        mainEntity: {'@id': `${url}#begriff`},
      },
      definedTerm(e),
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#brotkrume`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: `${CANONICAL_ORIGIN}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Lexikon',
            item: absoluteCanonical(HUB_PFAD),
          },
          {'@type': 'ListItem', position: 3, name: normalizeText(e.begriff), item: url},
        ],
      },
    ],
  };
}

/**
 * Graph des Hubs: die Sammlung, das Set, die Liste.
 *
 * KEINE FESTE ANZAHL: `numberOfItems` kommt aus den Daten. Eine Zahl im Code
 * war schon einmal die Naht, die beim Ergänzen des nächsten Eintrags riss.
 * @param {object[]} eintraege
 * @param {{datePublished: string, dateModified: string}} datum
 */
export function hubSchema(eintraege, datum) {
  const sicher = (eintraege || []).filter(istSchemaSicher);
  const url = absoluteCanonical(HUB_PFAD);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#sammlung`,
        url,
        name: 'Lexikon: unsere Begriffe in der Sprache der Physik',
        inLanguage: 'de',
        isPartOf: {'@type': 'WebSite', '@id': SITE_ID},
        publisher: {'@id': ORG_ID},
        author: {'@id': ORG_ID},
        datePublished: datum.datePublished,
        dateModified: datum.dateModified,
        description:
          'Begriffe, die im Gespräch über Energie, Schwingung und Schutz ' +
          'vorkommen — je mit dem alltäglichen Gebrauch, der physikalischen ' +
          'Größe dahinter, dem was die Übertragung trägt und dem was sie ' +
          'nicht trägt.',
        mainEntity: {'@id': SET_ID},
      },
      {
        '@type': 'DefinedTermSet',
        '@id': SET_ID,
        name: 'Qi Blanco Lexikon',
        url,
        inLanguage: 'de',
        publisher: {'@id': ORG_ID},
        hasDefinedTerm: sicher.map((e) => definedTerm(e)),
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#liste`,
        name: 'Begriffe im Lexikon',
        numberOfItems: sicher.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: sicher.map((e, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: normalizeText(e.begriff),
          url: absoluteCanonical(e.pfad),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${url}#brotkrume`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: `${CANONICAL_ORIGIN}/`,
          },
          {'@type': 'ListItem', position: 2, name: 'Lexikon', item: url},
        ],
      },
    ],
  };
}
