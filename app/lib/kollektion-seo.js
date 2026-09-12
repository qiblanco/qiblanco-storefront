/**
 * Open Graph und strukturierte Daten der /collections-Klasse (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js,
 * produkt-seo.js, blog-seo.js und seiten-seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Vollzensus aller 11 Kollektions-URLs am
 * 2026-09-12, live abgerufen, keine Stichprobe): ALLE elf trugen KEIN
 * og:image und KEINE strukturierten Daten — die einzige Routenklasse des
 * Shops, in der kein einziges Signal stand. Wer einen Kollektionslink teilt,
 * bekommt einen nackten Link; eine Suchmaschine sieht eine Produktliste,
 * der niemand sagt, dass sie eine Kollektion ist.
 *
 * WARUM NEBEN app/lib/seo.js UND NICHT DARIN — dieselbe Begründung, die
 * produkt-seo.js, blog-seo.js und seiten-seo.js in ihren Köpfen führen:
 * seo.js wird von 36 Routen importiert, und hb-deploy Gate 12 löst eine
 * geänderte geteilte Datei über die Import-Closure auf. Eine Änderung dort
 * zöge fremde, unbeteiligte Seiten in die Prüfmenge. Diese Datei wird
 * ausschliesslich von den drei /collections-Routen importiert.
 *
 * WARUM NICHT seiten-seo.js MITBENUTZT, obwohl sie fast dasselbe tut — die
 * Antwort steht in seiten-seo.js selbst und ist der Grund, warum hier eine
 * eigene Brotkrume gebaut wird statt ihrer: dort heisst es wörtlich „Zwei
 * Stufen, weil es zwischen der Startseite und einer /pages-Seite keine echte
 * dritte gibt: eine erfundene Zwischenstufe entspricht keinem Link, den ein
 * Besucher je sieht". Für Kollektionen ist genau diese Bedingung UMGEKEHRT
 * erfüllt: /collections EXISTIERT als ausgelieferte Seite mit eigener H1 und
 * verlinkt jede Kollektion. Die dritte Stufe ist hier real. Wer
 * seiten-seo.js/brotkrume() hier wiederverwendet, unterschlägt eine Stufe,
 * die es gibt; wer sie dort auf drei Stufen umbaut, macht sie für ihre 31
 * /pages-Aufrufer falsch. Es sind zwei verschiedene richtige Antworten.
 *
 * WAS SIE AUSDRÜCKLICH NICHT TUT: sie setzt weder <title> noch
 * `name=description` noch den Canonical. Die stehen in den Routen bereits und
 * folgen dort einer eigenen, begründeten Rangfolge (seiten-beschreibung.js,
 * canonicalLink/noindexMeta mit der Regel ENTWEDER noindex ODER canonical).
 * Diese Datei ist ADDITIV — sie hängt an, was fehlt, und fasst nicht an, was
 * steht.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node. Der hermetische Test (node --test, ohne Bundler)
// könnte diese Datei sonst gar nicht laden.
import {CANONICAL_ORIGIN, absoluteCanonical} from './seo.js';

/**
 * Marke — identisch zu MARKE in seiten-seo.js/produkt-seo.js und
 * MARKEN_SUFFIX in blog-seo.js. Bewusst als eigene Konstante und NICHT als
 * Import: ein Import aus seiten-seo.js koppelte die Kollektions- an die
 * /pages-Import-Closure von Gate 12. Die Drift ist nicht gehofft, sondern
 * zugenagelt — test/kollektion-seo.test.mjs importiert BEIDE Dateien und
 * vergleicht die Werte.
 */
export const MARKE = 'Qi Blanco';

/** Anker des Entitäts-Graphen. Zur Begründung der Duplikation siehe MARKE. */
export const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
export const SITE_ID = `${CANONICAL_ORIGIN}/#website`;

/**
 * Das Standard-Teilbild der Marke — die LETZTE Auffanglinie.
 *
 * IDENTISCH zu MARKEN_TEILBILD in seiten-seo.js und zu OG_BILD in
 * app/routes/_index.jsx: dieselbe Datei, dieselbe Grösse. Nativgrösse
 * 1024x1024, am 2026-09-12 am Dateikopf nachgemessen. Das Shopify-CDN
 * skaliert mit `?width=` NICHT hoch, es deckelt nur — die Breitenangabe ist
 * kein Mittel, eine Grösse zu ERZEUGEN.
 */
export const MARKEN_TEILBILD = {
  url:
    'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/' +
    'qiblanco-com-qione-2-pro-transparent_1.webp?width=1024',
  breite: 1024,
  hoehe: 1024,
  alt: 'QiOne® 2 Pro von Qi Blanco – das Gerät für den Alltag',
};

/**
 * Ein Shopify-Bild in die hier benutzte Form bringen — oder `null`, wenn es
 * unbrauchbar ist.
 *
 * MASSE KOMMEN AUS DER API, NIE AUS DEM DATEINAMEN. Am 2026-09-12 wurde
 * belegt, dass der Dateiname über die Masse lügt
 * (`QiHomeAir-Front-Alpha-Web2_1024x1024_….webp` ist real 1024x906). Fehlt
 * `width` oder `height`, wird das Bild deshalb VERWORFEN statt geraten: eine
 * falsche og:image:width ist schlechter als keine.
 *
 * @param {{url?: string, width?: number, height?: number, altText?: string}|null|undefined} bild
 * @param {string} [ersatzAlt] Beschreibung, wenn Shopify keine pflegt.
 * @returns {{url: string, breite: number, hoehe: number, alt: string}|null}
 */
export function bildAus(bild, ersatzAlt = '') {
  if (!bild?.url || !bild?.width || !bild?.height) return null;
  return {
    url: bild.url,
    breite: bild.width,
    hoehe: bild.height,
    // ES WIRD NICHTS ERFUNDEN: gepflegter altText gewinnt, sonst der
    // Produkt-/Kollektionsname. Genau diese Rangfolge fährt die Storefront an
    // dieser Stelle ohnehin schon (ProductItem: altText || product.title) —
    // ein dritter, hier erfundener Text wäre eine vierte Wahrheit.
    alt: (bild.altText || '').trim() || ersatzAlt || MARKE,
  };
}

/**
 * Das Teilbild einer Kollektionsseite, in fallender Güte.
 *
 * WARUM DREI STUFEN UND NICHT NUR DIE ERSTE: am 2026-09-12 über die
 * Storefront-API gemessen führt KEINE der neun Kollektionen ein eigenes Bild
 * (`image` ist neunmal `null`). Ein og:image „aus dem Kollektionsbild", wie
 * es naheliegt, wäre heute auf jeder Seite leer. Die erste Stufe bleibt
 * trotzdem stehen, GERADE WEIL sie heute nie greift: sobald jemand in Shopify
 * ein Kollektionsbild hinterlegt, wirkt es ohne Code-Änderung. Ohne diese
 * Stufe bliebe der Weg dauerhaft tot.
 *
 * Die zweite Stufe ist der heutige Normalfall und deshalb die eigentliche
 * Entscheidung: das Bild des ERSTEN Produkts der Kollektion. Es ist echt,
 * thematisch passend und stammt aus denselben Daten, die die Seite ohnehin
 * rendert — für `zeremonie-kakao` also ein Kakao-Bild statt eines generischen
 * Markengeräts.
 *
 * @param {{kollektionsBild?: object|null, erstesProdukt?: object|null,
 *          name?: string}} args
 */
export function teilbild({kollektionsBild, erstesProdukt, name} = {}) {
  return (
    bildAus(kollektionsBild, name) ||
    bildAus(erstesProdukt?.featuredImage, erstesProdukt?.title) ||
    MARKEN_TEILBILD
  );
}

/**
 * Brotkrume Startseite -> Kollektionen -> diese Kollektion.
 *
 * DREI STUFEN, und die mittlere ist keine erfundene: /collections ist eine
 * real ausgelieferte Seite (HTTP 200, eigene H1 „Kollektionen"), die jede
 * Kollektion verlinkt. Für die Übersicht selbst entfallen die dritte Stufe
 * und damit der Parameter `name`.
 *
 * @param {{url: string, name?: string}} args
 */
export function brotkrume({url, name}) {
  const stufen = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Startseite',
      item: `${CANONICAL_ORIGIN}/`,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Kollektionen',
      item: `${CANONICAL_ORIGIN}/collections`,
    },
  ];
  if (name) {
    stufen.push({'@type': 'ListItem', position: 3, name, item: url});
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${url}#brotkrume`,
    itemListElement: stufen,
  };
}

/**
 * Open Graph, Twitter-Karte und strukturierte Daten EINER Kollektions-URL.
 *
 * Additiv gedacht: das Ergebnis wird an die bestehende meta-Liste einer Route
 * ANGEHÄNGT (`...kollektionSignale({…})`), es ersetzt sie nicht.
 *
 * `eintraege` sind die Einträge, die die Seite TATSÄCHLICH ZEIGT — Produkte
 * auf einer Kollektionsseite, Kollektionen auf der Übersicht. Die Reihenfolge
 * ist die gerenderte.
 *
 * WARUM DIE ItemList NUR AUF DER ERSTEN SEITE ENTSTEHT (`ersteSeite`): die
 * Kollektionsrouten paginieren CURSOR-basiert und kanonisieren dabei jede
 * Cursor-URL auf die Kollektion selbst (Begründung in
 * collections.$handle.jsx). Eine ItemList mit `position: 1..n` auf einer
 * Folgeseite behauptete damit unter der KANONISCHEN URL eine Reihenfolge, die
 * dort nicht gilt — sie wäre schlicht falsch. Auf Folgeseiten entstehen
 * deshalb CollectionPage und Brotkrume, aber keine ItemList.
 *
 * WARUM EINE LEERE ItemList TROTZDEM AUSGEGEBEN WIRD: drei der vier
 * indexierbaren Kollektionen führen am 2026-09-12 null Produkte.
 * `numberOfItems: 0` ist darüber eine WAHRE Aussage und keine Zusage ohne
 * Deckung — anders als eine `twitter:card summary_large_image` ohne Bild, die
 * ein Bild ZUSAGT. Der eigentliche Befund (eine indexierbare Kollektionsseite
 * ohne Produkte) ist ein eigener Vorgang, den collections.$handle.jsx bereits
 * benennt; er wird hier nicht mit Markup zugedeckt.
 *
 * @param {{pfad: string, titel?: string, beschreibung?: string|null,
 *          bild?: {url: string, breite: number, hoehe: number, alt: string},
 *          name?: string, eintraege?: Array<{url: string, name: string}>,
 *          ersteSeite?: boolean, uebersicht?: boolean}} args
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function kollektionSignale({
  pfad,
  titel,
  beschreibung,
  bild,
  name,
  eintraege = [],
  ersteSeite = true,
  uebersicht = false,
}) {
  const url = absoluteCanonical(pfad);
  const kurz = (name || titel || '').trim() || MARKE;
  const vollerTitel = (titel || '').trim() || `${kurz} | ${MARKE}`;
  const text = (beschreibung || '').trim();
  const b = bild || MARKEN_TEILBILD;

  const descriptoren = [
    {property: 'og:type', content: 'website'},
    {property: 'og:site_name', content: MARKE},
    {property: 'og:locale', content: 'de_DE'},
    // Muss dem <title> der Route folgen, nicht einem eigenen Rohwert: sonst
    // zeigt ein geteilter Link etwas anderes als das Suchergebnis.
    {property: 'og:title', content: vollerTitel},
    {property: 'og:url', content: url},
    {property: 'og:image', content: b.url},
    {property: 'og:image:width', content: String(b.breite)},
    {property: 'og:image:height', content: String(b.hoehe)},
    {property: 'og:image:alt', content: b.alt},
    // Die Kartenangabe steht in derselben Liste wie das Bild und ist von ihm
    // gedeckt. Kein eigenes og:image:type: der Content-Type folgt bei Shopify
    // NICHT der Dateiendung (`.webp` kommt als image/png oder image/jpeg
    // zurück, ausgehandelt über den Accept-Header, am 2026-09-12 gemessen) —
    // ein Feld, das sich nicht zuverlässig vorhersagen lässt, ist als Zusage
    // schlechter als sein Fehlen.
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
  if (text) {
    descriptoren.push({property: 'og:description', content: text});
  }

  const knoten = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    // Eigene @id mit Fragment, damit der Knoten neben Brotkrume und ItemList
    // desselben Dokuments eindeutig adressierbar bleibt.
    '@id': `${url}#collection`,
    url,
    name: kurz,
    inLanguage: 'de-DE',
    isPartOf: {'@id': SITE_ID},
    publisher: {'@id': ORG_ID},
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: b.url,
      width: b.breite,
      height: b.hoehe,
    },
  };
  if (text) knoten.description = text;
  if (ersteSeite) knoten.mainEntity = {'@id': `${url}#liste`};
  // react-router 7 rendert diesen Descriptor nativ als
  // <script type="application/ld+json"> und maskiert den Inhalt selbst.
  descriptoren.push({'script:ld+json': knoten});

  if (ersteSeite) {
    descriptoren.push({
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${url}#liste`,
        name: kurz,
        // Die Reihenfolge IST die gerenderte, deshalb `Ascending` und nicht
        // `Unordered`: die Position im Markup entspricht der Position auf der
        // Seite.
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        numberOfItems: eintraege.length,
        itemListElement: eintraege.map((e, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: e.name,
          url: e.url,
        })),
      },
    });
  }

  descriptoren.push({
    'script:ld+json': brotkrume({url, name: uebersicht ? '' : kurz}),
  });
  return descriptoren;
}
