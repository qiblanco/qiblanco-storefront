/**
 * hreflang-Auszeichnung zwischen den beiden Storefronts.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js
 * und app/lib/produkt-seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (live gemessen 2026-08-15, beide Domains):
 * Qi Blanco fährt zwei eigenständige Shops auf zwei eigenen Domains mit
 * demselben Sortiment in zwei Sprachen — qiblanco.com (DACH, Hydrogen) und
 * qi-blanco.com (US, Liquid). Genau dafür gibt es hreflang. Gemessen trug
 * die US-Startseite die Auszeichnung bereits vollständig:
 *
 *   <link rel="alternate" hreflang="en"        href="https://qi-blanco.com/">
 *   <link rel="alternate" hreflang="de"        href="https://qiblanco.com/">
 *   <link rel="alternate" hreflang="x-default" href="https://qi-blanco.com/">
 *
 * — und die DACH-Startseite trug NULL hreflang-Tags (0 von 76 DACH-Seiten).
 *
 * DAS IST DER PUNKT, UM DEN ES HIER GEHT: hreflang ist keine Ansage, sondern
 * eine BESTÄTIGUNG. Google verlangt Gegenseitigkeit — nennt Seite A die
 * Seite B als ihre deutsche Fassung, B aber A nicht zurück, verwirft Google
 * die Auszeichnung KOMPLETT statt der Hälfte zu glauben (andernfalls könnte
 * jede fremde Domain sich unaufgefordert an eine starke Domain hängen).
 * Die bereits ausgelieferte US-Seite war damit wirkungslos: sie hat nie
 * jemand bestätigt. Diese Datei liefert die fehlende Gegenrichtung.
 *
 * DESHALB IST DIE PAAR-TABELLE ABSICHTLICH KURZ UND NICHT „vollständig":
 * ein einseitig ausgezeichnetes Paar ist nicht etwa halb so gut, sondern
 * wirkungslos — es sieht nur nach Arbeit aus. Aufgenommen wird ein Paar
 * daher erst, wenn die GEGENSEITE die Auszeichnung ebenfalls trägt. Für die
 * sechs Produktpaare (crystal-cacao-awake/-create, qibracelet,
 * qihome-air↔qihome, qione-2-pro↔qione, qione-kette↔necklace — inhaltlich
 * am 2026-08-15 über die Live-Titel geprüft und identisch) ist das derzeit
 * NICHT der Fall: 49 der 50 US-Seiten tragen kein hreflang. Sie gehören
 * hier erst hinein, wenn das US-Theme (us-qiblanco-2024, layout/theme.liquid)
 * seine Hälfte ausliefert — sonst tragen wir eine Zusage ein, die niemand
 * bestätigt.
 *
 * WARUM DIE WERTE EXAKT DIE DER US-SEITE SPIEGELN: In einer hreflang-Gruppe
 * müssen alle Seiten DIESELBE Menge an Alternativen nennen, sich selbst
 * eingeschlossen. Wir übernehmen deshalb wörtlich, was die US-Seite bereits
 * erklärt — inklusive `x-default` auf die US-Seite. `x-default` ist kein
 * Rang, sondern die Anlaufstelle für Besucher, deren Sprache in keiner
 * Fassung vorkommt; für ein englisches Storefront ist das die übliche und
 * hier bereits gesetzte Wahl. Eine abweichende Angabe wäre ein Widerspruch
 * innerhalb der Gruppe und damit schlechter als gar keine.
 *
 * SPRACHCODES statt Sprache-Land (`de` statt `de-DE`): Die DACH-Seite
 * bedient Deutschland, Österreich und die Schweiz. `de-DE` würde die
 * Auszeichnung auf Deutschland verengen und österreichische wie Schweizer
 * Suchende ausschließen — der bloße Sprachcode deckt alle drei ab. Auch das
 * entspricht dem, was die US-Seite bereits deklariert.
 */

export const DACH_ORIGIN = 'https://qiblanco.com';
export const US_ORIGIN = 'https://qi-blanco.com';

/**
 * Belegte, BEIDSEITIG ausgezeichnete Seitenpaare.
 * Schlüssel = Pfad auf der DACH-Domain, Wert = Pfad auf der US-Domain.
 *
 * Aufnahmebedingung (nicht verhandelbar, siehe Kopf): die US-Seite liefert
 * die Gegenrichtung bereits aus. Am 2026-08-15 erfüllt das genau die
 * Startseite.
 * @type {Record<string, string>}
 */
export const SEITEN_PAARE = {
  '/': '/',
};

/**
 * hreflang-Descriptoren für einen DACH-Pfad.
 *
 * Rendert echte `<link rel="alternate" hreflang="..." href="...">`-Elemente:
 * react-router 7 macht aus einem meta-Descriptor OHNE `tagName` ein
 * `<meta ...>` mit allen Keys als Attribute — für Suchmaschinen wirkungslos
 * und im Quelltext kaum zu unterscheiden. `isValidMetaTag` des Routers
 * akzeptiert genau /^(meta|link)$/. Dieselbe Falle ist in app/lib/seo.js
 * für den Canonical dokumentiert.
 *
 * Kennt die Tabelle den Pfad nicht, kommt eine LEERE Liste zurück — eine
 * geratene Zuordnung wäre schlechter als keine, weil Google dann zwei
 * inhaltlich verschiedene Seiten als Übersetzung voneinander behandelt.
 *
 * @param {string} dachPfad
 * @returns {Array<{tagName: 'link', rel: 'alternate', hrefLang: string, href: string}>}
 */
export function hreflangLinks(dachPfad) {
  const usPfad = SEITEN_PAARE[normalisiere(dachPfad)];
  if (!usPfad) return [];
  const de = `${DACH_ORIGIN}${usPfad === '/' ? '/' : normalisiere(dachPfad)}`;
  const en = `${US_ORIGIN}${usPfad}`;
  return [
    {tagName: 'link', rel: 'alternate', hrefLang: 'en', href: en},
    {tagName: 'link', rel: 'alternate', hrefLang: 'de', href: de},
    {tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: en},
  ];
}

/**
 * Pfad auf die Form bringen, in der die Tabelle ihn führt: führender Slash,
 * ohne Query/Hash, ohne abschließenden Slash (außer Root).
 * @param {string} pfad
 * @returns {string}
 */
export function normalisiere(pfad) {
  if (!pfad) return '/';
  let p = String(pfad).split('?')[0].split('#')[0];
  if (!p.startsWith('/')) p = `/${p}`;
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
  return p;
}
