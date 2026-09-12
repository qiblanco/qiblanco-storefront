/**
 * Meta-Signale der Blog-/Magazin-Routen (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 L7, am 2026-08-14 live
 * nachgemessen): die drei Blog-Routen trugen unveränderte Titel aus dem
 * Hydrogen-Scaffold —
 *     /blogs        ->  "Hydrogen | Blogs"
 *     /blogs/news   ->  "Hydrogen | News blog"
 *     Artikel       ->  "Hydrogen | <Titel> article"
 * Das ist der Name des Frameworks im Suchergebnis einer Marke, und bei der
 * Artikelroute zusätzlich eine Sprachmischung. Keine der drei trug einen
 * Canonical oder eine description.
 *
 * WARUM NEBEN app/lib/seo.js: dieselbe Begründung wie bei produkt-seo.js —
 * seo.js wird u.a. von pages.support importiert, das einen etablierten
 * Formate-Beleg-Ordner hat; eine Änderung dort zöge über Gate 12 fremde
 * Seiten in die Prüfmenge. CANONICAL_ORIGIN wird GELESEN, nicht kopiert.
 *
 * ZUR BESCHREIBUNG: für die Übersicht steht hier ein gepflegter Text, für
 * Blog und Artikel kommt sie ausschließlich aus dem, was Shopify unter
 * `seo.description` wirklich pflegt. Fehlt sie dort, wird KEINE gerendert.
 * Ein generisch erfundener Fülltext stünde sonst wortgleich unter jedem
 * Artikel und wäre für eine Suchmaschine schlechter als gar keiner.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node — sonst wäre diese Datei nicht hermetisch testbar.
import {CANONICAL_ORIGIN, absoluteCanonical} from './seo.js';

/** Marken-Suffix — identisch zu den Produktrouten, damit die Marke im
 * Suchergebnis nicht je Bereich anders heißt. Die Rechtsform ist hier am
 * 2026-08-15 entfallen (Begründung an MARKE in produkt-seo.js: 24 Zeichen
 * ohne Suchwert, und "Qi Blanco" ist die Schreibweise von Organization-Schema
 * und Wikidata Q141070656). Bewusst als eigene Konstante und NICHT als Import
 * aus produkt-seo.js: das koppelte die Blog- an die Produkt-Import-Closure. */
export const MARKEN_SUFFIX = 'Qi Blanco';

/**
 * meta-Descriptoren einer Blog-Route.
 *
 * @param {{pfad: string, titel?: string, beschreibung?: string,
 *          bildUrl?: string, typ?: string}} args
 * @returns {Array<object>}
 */
export function blogMeta({pfad, titel, beschreibung, bildUrl, typ}) {
  const voll = titel ? `${titel} | ${MARKEN_SUFFIX}` : MARKEN_SUFFIX;
  const url = absoluteCanonical(pfad);
  const descriptoren = [
    {title: voll},
    // Canonical als echtes <link> und absolut — Begründung im Kopf von
    // app/lib/seo.js. Ohne tagName rendert react-router ein wirkungsloses
    // <meta rel="canonical">.
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:type', content: typ === 'article' ? 'article' : 'website'},
    {property: 'og:site_name', content: 'Qi Blanco'},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: voll},
    {property: 'og:url', content: url},
  ];
  if (beschreibung) {
    descriptoren.splice(1, 0, {name: 'description', content: beschreibung});
    descriptoren.push({property: 'og:description', content: beschreibung});
  }
  if (bildUrl) {
    descriptoren.push({property: 'og:image', content: bildUrl});
    // TWITTER-KARTE IN DERSELBEN BEDINGUNG WIE DAS BILD, und aus demselben
    // Grund wie in produkt-seo.js und products.$handle.jsx (2026-09-05):
    // `summary_large_image` sagt ein großes Bild ZU — ohne og:image wäre
    // das eine Zusage ohne Deckung. Deshalb hier drin und nicht daneben.
    //
    // WARUM DAS NACHGEZOGEN WURDE (2026-09-06): der Restposten-Bau vom
    // 2026-09-05 hat die Karte auf Startseite und Produktseiten gebracht und
    // die Blog-Familie ausgelassen — begründet mit „/blogs/wissen trägt
    // og:title, aber kein og:image". Das stimmt für die UEBERSICHT und war
    // für die ARTIKEL falsch: alle sieben tragen ein og:image (live gemessen
    // 2026-09-06, probe_dach_restposten_live.py), also genau die Bedingung,
    // unter der die Karte gesetzt gehört. Die Regel galt schon, ihre
    // Reichweite nicht.
    descriptoren.push({name: 'twitter:card', content: 'summary_large_image'});
  }
  return descriptoren;
}


/**
 * Anker des Entitäts-Graphen — identisch zu entity-schema.js, seiten-seo.js
 * und kollektion-seo.js. Bewusst als eigene Konstanten und NICHT als Import
 * aus entity-schema.js: die wird heute nur von der Startseite importiert
 * (und, für die ARTIKEL-Route, von blog-schema.js); ein Import HIER zöge sie
 * zusätzlich in die Closure der beiden Index-Routen. Die Drift ist
 * zugenagelt — test/kollektion-seo.test.mjs vergleicht alle vier Quellen.
 */
export const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
export const SITE_ID = `${CANONICAL_ORIGIN}/#website`;

/**
 * Das Standard-Teilbild der Marke — die letzte Auffanglinie, wenn eine
 * Blog-Fläche kein eigenes Bild hat.
 *
 * IDENTISCH zu MARKEN_TEILBILD in seiten-seo.js und kollektion-seo.js und zu
 * OG_BILD in app/routes/_index.jsx; die Drift ist in
 * test/kollektion-seo.test.mjs zugenagelt.
 *
 * WARUM ES DAS HIER BRAUCHT — eine im Bau selbst korrigierte Fehlentscheidung
 * (s04, 2026-09-12): die Blog-Übersicht /blogs sollte zunächst BEWUSST ohne
 * og:image bleiben, begründet damit, dass sie selbst keine Beitragsbilder
 * zeigt. Die lokale Messung hat gezeigt, dass das eine Sonderregel gewesen
 * wäre, die dem Haus widerspricht: seiten-seo.js gibt JEDER /pages-Seite ein
 * Teilbild und fällt dafür auf genau dieses Markenbild zurück — auch auf
 * Seiten ohne eigene Bilder. Der einzige dokumentierte Verzicht im Haus
 * (crystal-cacao, app/routes/_index.jsx) ist anders begründet: dort gibt es
 * ÜBERHAUPT kein gepflegtes Teilen-Bild. Hier gibt es eines. Ein geteilter
 * /blogs-Link ohne Bild wäre also keine Zurückhaltung, sondern eine Lücke.
 */
export const MARKEN_TEILBILD_URL =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
  'qiblanco-com-qione-2-pro-transparent_1.webp?width=1024';

/**
 * Brotkrume Startseite -> diese Seite.
 *
 * ZWEI STUFEN, nicht drei: zwischen der Startseite und einer Blog-Übersicht
 * gibt es keinen Zwischenschritt, den ein Besucher je anklickt. Dieselbe
 * Begründung wie in seiten-seo.js — und der ausdrückliche Unterschied zu
 * kollektion-seo.js, wo /collections als reale Zwischenstufe existiert.
 * @param {{url: string, name: string}} args
 */
function brotkrume({url, name}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#brotkrume`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Startseite',
        item: `${CANONICAL_ORIGIN}/`,
      },
      {'@type': 'ListItem', position: 2, name, item: url},
    ],
  };
}

/**
 * Strukturierte Daten der Beitrags-Übersicht EINES Blogs (/blogs/<handle>).
 *
 * WARUM ES DIESE FUNKTION GIBT — und warum sie kleiner ist als der
 * Ursprungsauftrag des Grossjobs annahm: jener nannte „/blogs/wissen hat
 * keinerlei Auszeichnung" den grössten Einzelposten und führte „kein Article,
 * kein Blog, kein Autor, kein Datum" auf. Der Vollzensus vom 2026-09-11 hat
 * das WIDERLEGT: alle neun ARTIKEL tragen seit dem 2026-09-09 BlogPosting,
 * Person, ImageObject und og:image (app/lib/blog-schema.js). Ohne Auszeichnung
 * war ausschliesslich die INDEX-Seite selbst. Genau sie schliesst diese
 * Funktion — nicht mehr.
 *
 * WARUM DAS TROTZDEM ZÄHLT: die einzelnen Artikel sagen einer Maschine „hier
 * ist ein Beitrag". Erst der `Blog`-Knoten mit seinen `blogPost`-Einträgen
 * sagt ihr, dass sie zusammen EIN Publikationsorgan sind — das ist die
 * Aussage, über die eine KI den Bestand als Ganzes erfasst statt als neun
 * unverbundene Texte.
 *
 * DIE `blogPost`-EINTRÄGE TRAGEN DIESELBE `@id` WIE DIE ARTIKELSEITEN
 * (`<artikel-url>#artikel`, vergeben in blog-schema.js). Das ist Absicht und
 * der eigentliche Zweck: Index und Artikelseite beschreiben damit DIESELBE
 * Entität aus zwei Richtungen, statt zwei Entitäten mit gleichem Inhalt zu
 * behaupten. Ein abweichendes Fragment hier hätte den Graphen verdoppelt.
 *
 * ES WIRD NICHTS ERFUNDEN: Autor und Bild entstehen nur, wenn Shopify sie
 * führt — dieselbe Regel und dieselben Felder wie in blog-schema.js.
 *
 * @param {{pfad: string, name: string, beschreibung?: string,
 *          artikel?: Array<object>, ersteSeite?: boolean}} args
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function blogIndexSignale({
  pfad,
  name,
  beschreibung,
  artikel = [],
  ersteSeite = true,
}) {
  const url = absoluteCanonical(pfad);
  const knoten = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url,
    name,
    inLanguage: 'de-DE',
    isPartOf: {'@id': SITE_ID},
    publisher: {'@id': ORG_ID},
  };
  if (beschreibung) knoten.description = beschreibung;

  // NUR AUF DER ERSTEN SEITE: die Übersicht paginiert cursor-basiert und
  // kanonisiert jede Cursor-URL auf sich selbst. Eine Beitragsliste auf einer
  // Folgeseite behauptete unter der kanonischen URL einen Bestand, der dort
  // nicht steht.
  if (ersteSeite) {
    const beitraege = artikel
      .filter((a) => a?.title && a?.publishedAt && a?.handle)
      .map((a) => {
        const aUrl = absoluteCanonical(
          `/blogs/${a.blog?.handle ?? ''}/${a.handle}`,
        );
        const eintrag = {
          '@type': 'BlogPosting',
          '@id': `${aUrl}#artikel`,
          headline: a.title,
          name: a.title,
          url: aUrl,
          datePublished: a.publishedAt,
          inLanguage: 'de',
        };
        if (a.author?.name) {
          eintrag.author = {'@type': 'Person', name: a.author.name};
        }
        if (a.image?.url) {
          const bild = {'@type': 'ImageObject', url: a.image.url};
          if (a.image.width) bild.width = a.image.width;
          if (a.image.height) bild.height = a.image.height;
          if (a.image.altText) bild.caption = a.image.altText;
          eintrag.image = bild;
        }
        return eintrag;
      });
    if (beitraege.length) knoten.blogPost = beitraege;
  }

  return [{'script:ld+json': knoten}, {'script:ld+json': brotkrume({url, name})}];
}

/**
 * Strukturierte Daten der BLOG-ÜBERSICHT /blogs — der Liste der Blogs.
 *
 * SIE IST KEIN `Blog`, UND DAS IST DER GANZE UNTERSCHIED ZU blogIndexSignale:
 * /blogs listet Blogs auf, /blogs/wissen listet Beiträge auf. Ihr den
 * `Blog`-Typ zu geben, hiesse zu behaupten, die Übersicht SEI das
 * Publikationsorgan — dann gäbe es zwei davon. Richtig ist eine
 * `CollectionPage` mit einer `ItemList` der Blogs.
 *
 * @param {{pfad: string, name: string, beschreibung?: string,
 *          blogs?: Array<{handle: string, title: string}>,
 *          ersteSeite?: boolean}} args
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function blogUebersichtSignale({
  pfad,
  name,
  beschreibung,
  blogs = [],
  ersteSeite = true,
}) {
  const url = absoluteCanonical(pfad);
  const seite = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection`,
    url,
    name,
    inLanguage: 'de-DE',
    isPartOf: {'@id': SITE_ID},
    publisher: {'@id': ORG_ID},
  };
  if (beschreibung) seite.description = beschreibung;
  const descriptoren = [];
  if (ersteSeite) {
    seite.mainEntity = {'@id': `${url}#liste`};
    descriptoren.push({'script:ld+json': seite});
    descriptoren.push({
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${url}#liste`,
        name,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: blogs.length,
        itemListElement: blogs.map((b, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: b.title,
          // DIESELBE `@id` WIE DER BLOG-INDEX SIE SICH SELBST GIBT — Übersicht
          // und Blog beschreiben dieselbe Entität, nicht zwei.
          url: absoluteCanonical(`/blogs/${b.handle}`),
        })),
      },
    });
  } else {
    descriptoren.push({'script:ld+json': seite});
  }
  descriptoren.push({'script:ld+json': brotkrume({url, name})});
  return descriptoren;
}
