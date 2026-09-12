/**
 * `<lastmod>` je Kind-Sitemap im Sitemap-INDEX.
 *
 * DER ANLASS IST GEMESSEN, NICHT VERMUTET (2026-09-12, Job 20260912-sitemap-
 * index-ohne-lastmod-google-holt-pages-sitemap-seit-15-tagen-nicht):
 * `getSitemapIndex` aus @shopify/hydrogen 2025.7.0 schreibt nackte
 * `<loc>`-Zeilen — die Bibliothek kennt für den Index gar kein `lastmod`
 * (Typ `SitemapIndexOptions` hat kein solches Feld, der Generator baut
 * woertlich `<sitemap><loc>…</loc></sitemap>`). Googles `sitemaps.get` sagte
 * am selben Tag, was das kostet: `sitemap/pages/1.xml` zuletzt am 2026-08-28
 * geholt, also 15 Tage alt, waehrend `articles` täglich abgeholt wurde.
 * Sechs /pages-URLs, die NACH dem 2026-08-28 in die Datei kamen, waren Google
 * darum unbekannt.
 *
 * `<lastmod>` ist das einzige Signal, mit dem wir einen Neuabruf überhaupt
 * beeinflussen können: `sitemaps.submit` ist R3-Perimeter (vorlegen, nicht
 * beschaffen) und den Sitemap-Ping-Endpunkt hat Google 2023 abgekuendigt.
 *
 * DAS DATUM IST GEMESSEN, NICHT ERFUNDEN — DAS IST DER GANZE PUNKT. Ein
 * `lastmod`, das bei jedem Abruf "jetzt" sagt, ist eine Luege gegenüber
 * Google und wird von ihm abgewertet. Der Wert hier ist deshalb das MAXIMUM
 * der `updatedAt` GENAU DER Eintraege, die das Kind auch wirklich
 * ausliefert — also nach denselben Versteckt-Filtern und einschliesslich der
 * `NUR_ROUTE_SEITEN`, die die Kind-Route nachträgt. Die Mengen-Definitionen
 * werden dafür IMPORTIERT, nie nachgebaut: eine zweite Liste würde driften,
 * und dann naennte der Index ein Datum aus einem Eintrag, den das Kind gar
 * nicht führt.
 *
 * WAS KEIN DATUM BEKOMMT, BEKOMMT KEINES. `<lastmod>` ist im Sitemap-Protokoll
 * je Kind optional. Kann eine Menge nicht sauber bestimmt werden (Abfrage
 * fehlgeschlagen, Artikel-Zuordnung nicht messbar, kein einziger Eintrag mit
 * `updatedAt`), bleibt die Zeile so nackt wie heute. Ein geratenes Datum wäre
 * schlechter als keines.
 *
 * FAIL-OPEN, UND ZWAR HART: der Sitemap-Index ist die Wurzel der
 * Auffindbarkeit des ganzen Shops. Jeder Fehler in dieser Datei faellt auf die
 * unveraenderte Ausgabe von `getSitemapIndex` zurück — nie auf einen 500.
 */
import {
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  NICHT_INDEXIERBARE_PRODUKTE,
  NUR_ROUTE_SEITEN,
  ausSitemapEntfernteKollektionen,
} from '~/lib/seo';
import {artikelPfad} from '~/lib/blog-artikel-pfad';
import {artikelKarte, leereBlogHandles} from '~/lib/sitemap-bestand';

/**
 * Kind-Typ im URL-Pfad -> Enum-Wert der Storefront-API.
 * Die Namen links sind die, die `getSitemapIndex` in die `<loc>` schreibt.
 */
const TYP_ZU_ENUM = {
  products: 'PRODUCT',
  collections: 'COLLECTION',
  articles: 'ARTICLE',
  pages: 'PAGE',
  blogs: 'BLOG',
  metaObjects: 'METAOBJECT',
};

/**
 * Liest die Kinder aus dem fertigen Index-XML.
 *
 * Gelesen wird die AUSGABE von `getSitemapIndex`, nicht dessen Zaehl-Abfrage
 * noch einmal: so kann die Kinderliste des Index und die Liste, die hier ein
 * Datum bekommt, baulich nicht auseinanderlaufen — auch nicht, wenn eine
 * kuenftige Hydrogen-Fassung andere Kinder erzeugt.
 *
 * @param {string} xml
 * @returns {Array<{typ: string, seite: number, loc: string}>}
 */
export function kinderAusIndex(xml) {
  const kinder = [];
  for (const treffer of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = treffer[1];
    const pfad = loc.match(/\/sitemap\/([^/]+)\/(\d+)\.xml$/);
    if (!pfad) continue;
    kinder.push({typ: pfad[1], seite: Number(pfad[2]), loc});
  }
  return kinder;
}

/**
 * Welche Eintraege liefert das Kind wirklich aus?
 *
 * Dieselben Filter wie in `sitemap.$type.$page[.xml].jsx`, aus denselben
 * Quellen. `null` heißt NICHT GEMESSEN (kein Datum), nicht "leer".
 *
 * @param {string} typ
 * @param {Array<{handle: string, updatedAt: string}>} items
 * @param {{leereBlogs: string[], karte: Map<string,string>|null}} bestand
 * @returns {Array<{handle: string, updatedAt: string}>|null}
 */
function sichtbareEintraege(typ, items, bestand) {
  switch (typ) {
    case 'products':
      return items.filter((i) => !NICHT_INDEXIERBARE_PRODUKTE.includes(i.handle));
    case 'pages':
      return items.filter((i) => !AUS_SITEMAP_ENTFERNTE_SEITEN.includes(i.handle));
    case 'collections':
      return items.filter(
        (i) => !ausSitemapEntfernteKollektionen().includes(i.handle),
      );
    case 'blogs':
      return items.filter((i) => !bestand.leereBlogs.includes(i.handle));
    case 'articles':
      // Ohne Zuordnung liefert die Kind-Route gar keine Artikel aus (jeder
      // Eintrag trägt dann die OHNE_BLOG-Marke und fliegt raus). Ein Datum
      // aus der ungefilterten Menge wäre hier also nachweislich falsch.
      if (!bestand.karte) return null;
      return items.filter((i) => artikelPfad(bestand.karte, i.handle) !== null);
    default:
      return items;
  }
}

/**
 * Jüngstes Datum einer Liste von ISO-Zeitstempeln — als ORIGINALZEICHENKETTE.
 *
 * Verglichen wird über `Date.parse`, ausgegeben wird der unveraenderte Wert
 * der Storefront-API. Ein selbst formatiertes Datum wäre ein zweiter Stil im
 * selben Dokument, und das Kind schreibt den Rohwert.
 *
 * @param {string[]} werte
 * @returns {string|null}
 */
function juengstes(werte) {
  let besteZahl = -Infinity;
  let bester = null;
  for (const wert of werte) {
    const zahl = Date.parse(wert);
    if (Number.isNaN(zahl) || zahl <= besteZahl) continue;
    besteZahl = zahl;
    bester = wert;
  }
  return bester;
}

/**
 * Baut die Abfrage für genau die vorgefundenen Kinder.
 *
 * Bewusst dynamisch statt als feste Abfrage über alle sechs Typen: die
 * Seitenzahl je Typ steht erst im Index fest. Eine feste Abfrage auf `page: 1`
 * liesse ein zweites Kind desselben Typs still ohne Datum — und "still" ist
 * hier das Problem, das der ganze Job behandelt.
 *
 * @param {Array<{typ: string, seite: number}>} kinder
 * @returns {{query: string, schluessel: string[]}|null}
 */
function bestandsAbfrage(kinder) {
  const felder = [];
  const schluessel = [];
  kinder.forEach((kind, i) => {
    const enumWert = TYP_ZU_ENUM[kind.typ];
    if (!enumWert) return;
    const alias = `k${i}`;
    schluessel.push(alias);
    felder.push(
      `  ${alias}: sitemap(type: ${enumWert}) {\n` +
        `    resources(page: ${kind.seite}) {\n` +
        `      items {\n        handle\n        updatedAt\n      }\n` +
        `    }\n  }`,
    );
  });
  if (!felder.length) return null;
  return {
    query: `query SitemapKindLastmod {\n${felder.join('\n')}\n}\n`,
    schluessel,
  };
}

/**
 * `<lastmod>` je Kind — die eigentliche Messung.
 *
 * @param {{query: Function}} storefront
 * @param {Array<{typ: string, seite: number, loc: string}>} kinder
 * @returns {Promise<Map<string, string>>} loc -> ISO-Datum (nur wo bestimmbar)
 */
export async function lastmodJeKind(storefront, kinder) {
  const karte = new Map();
  const abfrage = bestandsAbfrage(kinder);
  if (!abfrage) return karte;

  const antwort = await storefront.query(abfrage.query);

  const brauchtBlogs = kinder.some((k) => k.typ === 'blogs');
  const brauchtArtikel = kinder.some((k) => k.typ === 'articles');
  const bestand = {
    leereBlogs: brauchtBlogs ? await leereBlogHandles(storefront) : [],
    karte: brauchtArtikel ? await artikelKarte(storefront) : null,
  };

  // Nur-Route-Seiten trägt die Kind-Route NACH dem Filter ein — sie gehoeren
  // also in das Maximum. Eintraege ohne eigenes `lastmod` bleiben draußen:
  // ein fehlendes Datum ist kein Datum.
  const nurRoute = NUR_ROUTE_SEITEN.map((s) => s.lastmod).filter(Boolean);

  kinder.forEach((kind, i) => {
    const alias = `k${i}`;
    if (!abfrage.schluessel.includes(alias)) return;
    const items = antwort?.[alias]?.resources?.items;
    if (!Array.isArray(items)) return;
    const sichtbar = sichtbareEintraege(kind.typ, items, bestand);
    if (!sichtbar) return;
    const werte = sichtbar.map((e) => e.updatedAt).filter(Boolean);
    if (kind.typ === 'pages') werte.push(...nurRoute);
    const wert = juengstes(werte);
    if (wert) karte.set(kind.loc, wert);
  });

  return karte;
}

/**
 * Trägt die gemessenen Daten in das Index-XML ein.
 *
 * @param {string} xml
 * @param {Map<string, string>} karte
 * @returns {string}
 */
export function mitKindLastmod(xml, karte) {
  return xml.replace(
    /<loc>([^<]+)<\/loc>/g,
    (treffer, loc) =>
      karte.has(loc)
        ? `<loc>${loc}</loc><lastmod>${karte.get(loc)}</lastmod>`
        : treffer,
  );
}
