/**
 * Product-/Breadcrumb-JSON-LD der Produktseiten (DACH) — SEO-Stufe S6.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js,
 * app/lib/produkt-seo.js und app/lib/entity-schema.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33, am 2026-08-14 gemessen):
 * Die Suche nach unserem eigenen Flaggschiff-Produktnamen "QiOne 2 Pro"
 * liefert auf google.de Platz 1 ebay.de, Platz 2 quarks.de, Platz 3
 * kleinanzeigen.de — und unsere eigene Produktseite steht NICHT in den Top 10.
 * Die einzige eigene Flaeche ist /pages/studien auf Platz 4, also die falsche
 * Seite. Der Gebrauchtmarkt besitzt unseren Produktnamen.
 *
 * WAS AN DER SEITE SCHON GUT WAR — und warum diese Datei trotzdem noetig ist:
 * Die naheliegende Massnahme "exakter Produktname in Title/H1/Meta" war am
 * Messtag bereits erfuellt: title und H1 tragen "QiOne(R) 2 Pro", der
 * Canonical ist absolut, die Beschreibung ist gepflegt, der sichtbare Text
 * hat rund 36.000 Zeichen. Was fehlte, war NICHT der Text, sondern die
 * maschinenlesbare Identitaet: auf der Produktseite lag ueberhaupt kein
 * Product-JSON-LD, nur FAQPage. Google bekam von uns keine Aussage darueber,
 * dass diese URL das Produkt mit diesem Namen dieser Marke IST.
 *
 * WAS DIESE DATEI EHRLICH NICHT LEISTET: Strukturierte Daten sind kein
 * bestaetigter Ranking-Faktor. Sie erzeugen Rich Results und schaerfen die
 * Entitaet — sie ueberholen keine Domain wie kleinanzeigen.de, die zu den
 * sichtbarsten Domains auf google.de gehoert. Der belastbare Satz lautet:
 * dieser Bau raeumt den Grund aus, aus dem Google uns fuer unseren eigenen
 * Produktnamen NICHT nennen KANN. Ob es reicht, entscheidet die Messung nach
 * dem Go-live, nicht dieses Modul.
 *
 * PREISE KOMMEN AUS SHOPIFY, NIE AUS DIESER DATEI. Der Preis wird
 * ausschliesslich aus den Loader-Daten der Variante gelesen. Eine Preiszahl
 * im Repo waere eine zweite Preisquelle neben der Storefront-API — genau die
 * Klasse, gegen die der Preis-Monitor gebaut wurde. Fehlt der Preis in den
 * Daten, entfaellt das Angebot ersatzlos, statt eine Zahl zu erfinden.
 *
 * KEIN aggregateRating. Wir haben 4,8 Sterne aus 438 Bewertungen — das sind
 * Bewertungen des UNTERNEHMENS aus dem Google-Unternehmensprofil, nicht
 * Bewertungen dieses Produkts. Sie als Product.aggregateRating auszugeben
 * waere eine Falschaussage ueber den Bewertungsgegenstand und genau die
 * Bauweise, gegen die Google mit Manual Actions vorgeht. Wenn echte
 * Produktbewertungen existieren, gehoeren sie hierher — vorher nicht.
 */

// Die Beschreibung kommt als ARGUMENT herein und wird NICHT aus
// produkt-seo.js importiert: produkt-seo.js ruft diese Datei auf, ein Import
// zurueck waere ein Zyklus. ESM traegt Zyklen zwar, aber die Reihenfolge der
// Initialisierung wird dann von der Ladereihenfolge bestimmt — eine
// Fehlerklasse, die im Test nie und im Build irgendwann auftritt.
import {absoluteCanonical, CANONICAL_ORIGIN} from './seo.js';
import {ORG_ID} from './entity-schema.js';

/**
 * Der Produktname ohne Schutzrechts-Zeichen.
 *
 * DAS IST DER KERN DIESER STUFE. Kundensichtbar schreiben wir
 * verbindlich "QiOne(R) 2 Pro" (Marken-Schreibregeln), gesucht wird aber
 * "QiOne 2 Pro" — ohne Zeichen. `name` traegt deshalb die Marken-Schreibung,
 * `alternateName` die Suchform. Beides ist wahr, und keine der beiden
 * Schreibweisen muss dafuer irgendwo im sichtbaren Text verbogen werden.
 *
 * Abgeleitet statt gepflegt: eine handgepflegte zweite Namensliste wuerde von
 * der Shopify-Quelle wegdriften, sobald jemand dort den Titel aendert.
 *
 * @param {string} titel
 * @returns {string}
 */
export function suchform(titel) {
  return String(titel || '')
    .replace(/[®™©]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * schema.org-Verfuegbarkeit aus dem Shopify-Flag.
 *
 * Bewusst zweiwertig und ohne Ratespiel: `undefined` (Feld fehlte in den
 * Daten) ist NICHT "nicht verfuegbar". In dem Fall gibt es kein
 * availability-Feld, statt eine Aussage zu erfinden, die wir nicht gemessen
 * haben.
 * @param {boolean|undefined} verfuegbar
 * @returns {string|undefined}
 */
export function verfuegbarkeit(verfuegbar) {
  if (verfuegbar === true) return 'https://schema.org/InStock';
  if (verfuegbar === false) return 'https://schema.org/OutOfStock';
  return undefined;
}

/**
 * Das Angebot — oder `undefined`, wenn kein belastbarer Preis vorliegt.
 * @param {{amount?: string, currencyCode?: string}|undefined} preis
 * @param {boolean|undefined} verfuegbar
 * @param {string} url
 * @returns {object|undefined}
 */
export function angebot(preis, verfuegbar, url) {
  const betrag = preis?.amount;
  const waehrung = preis?.currencyCode;
  // Ein Angebot ohne Preis oder ohne Waehrung ist fuer Google unbrauchbar und
  // fuer uns eine Behauptung ohne Deckung — dann lieber gar keins.
  if (!betrag || !waehrung) return undefined;
  const o = {
    '@type': 'Offer',
    price: String(betrag),
    priceCurrency: waehrung,
    url,
    seller: {'@id': ORG_ID},
  };
  const v = verfuegbarkeit(verfuegbar);
  if (v) o.availability = v;
  return o;
}

/**
 * Der Brotkrumen-Pfad Startseite -> Produkt.
 *
 * WARUM NUR ZWEI STUFEN: mehr waere erfunden. Die Produktseiten haengen in
 * dieser Storefront direkt unter der Wurzel, es gibt keine Kategorie-Ebene
 * dazwischen. Eine dritte, nicht existierende Stufe waere eine Aussage ueber
 * eine Struktur, die kein Besucher vorfindet.
 *
 * WAS BREADCRUMBS HIER NICHT TUN: Es gibt keine Google-Primaerquelle, die
 * BreadcrumbList als Sitelink-Signal belegt (Evidenzklasse A/F). Sie stehen
 * hier fuer ihren EIGENEN Zweck — den Breadcrumb-Pfad in der Desktop-Anzeige
 * und eine klare Hierarchie-Aussage — nicht als Sitelink-Trick.
 *
 * @param {{pfad: string, name: string}} args
 * @returns {object}
 */
export function breadcrumb({pfad, name}) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteCanonical(pfad)}#breadcrumb`,
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
        name,
        item: absoluteCanonical(pfad),
      },
    ],
  };
}

/**
 * Der vollstaendige JSON-LD-Graph einer Produktseite: Product + BreadcrumbList.
 *
 * Als `@graph` gebaut wie auf der Startseite (entity-schema.js), damit beide
 * Knoten EIN Script-Tag teilen und ueber `@id` aufeinander zeigen koennen.
 *
 * ENTITAETS-KOPPLUNG (der zweite Hebel dieser Stufe): `brand` und `seller`
 * zeigen per `@id` auf denselben Organization-Knoten, den die Startseite
 * ausgibt. Damit sagen wir Google nicht nur "es gibt ein Produkt namens X",
 * sondern "dieses Produkt gehoert zu genau der Organisation, die diese Domain
 * betreibt". Ohne diese Klammer sind es zwei unverbundene Aussagen.
 *
 * @param {{pfad: string, produkt: object|undefined, variante?: object,
 *          beschreibung?: string}} args
 * @returns {object|undefined} `undefined`, wenn die Loader-Daten fehlen
 */
export function produktGraph({pfad, produkt, variante, beschreibung}) {
  const titel = produkt?.title;
  // Ohne Titel gibt es kein Produkt, ueber das wir etwas aussagen koennten.
  // Ein leerer Product-Knoten waere schlechter als keiner: er behauptet
  // Struktur, wo keine Information ist.
  if (!titel) return undefined;

  // Die Variante wird NOTFALLS SELBST aus dem Produkt geholt, statt sie vom
  // Aufrufer zu verlangen. Grund ist ein gemessener Fallstrick: wer sie
  // vergisst, verliert `offers` und `sku` STILL — die Seite rendert weiter,
  // das Schema ist gueltig, nur aermer. Ein Pflichtargument haette diese
  // Klasse nicht verhindert, ein Default verhindert sie ganz.
  const v = variante ?? produkt?.selectedOrFirstAvailableVariant;

  const url = absoluteCanonical(pfad);
  const alt = suchform(titel);
  const bild = v?.image?.url ?? produkt?.images?.nodes?.[0]?.url ?? undefined;

  const product = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: titel,
    url,
    brand: {
      '@type': 'Brand',
      '@id': ORG_ID,
      name: 'Qi Blanco',
    },
  };

  // Nur ausgeben, wenn die Suchform sich vom Namen unterscheidet: sonst waere
  // alternateName eine wortgleiche Wiederholung und damit reines Rauschen.
  if (alt && alt !== titel) product.alternateName = alt;
  if (beschreibung) product.description = beschreibung;
  if (bild) product.image = bild;
  if (v?.sku) product.sku = v.sku;

  const o = angebot(v?.price, v?.availableForSale, url);
  if (o) product.offers = o;

  return {
    '@context': 'https://schema.org',
    '@graph': [product, breadcrumb({pfad, name: titel})],
  };
}
