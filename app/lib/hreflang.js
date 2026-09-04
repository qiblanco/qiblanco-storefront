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
 * ===========================================================================
 * ERWEITERUNG 2026-09-04 — Job 20260831-GROSSJOB-seo-warum-ranken-kritiker-
 * über-uns-fruechte-prio6, Segment s05. VON EINEM PAAR AUF ZWANZIG.
 * ===========================================================================
 *
 * Die alte Fassung fuehrte SEITEN_PAARE als handgepflegte Tabelle mit genau
 * einem Eintrag und begründete das so: die US-Gegenseite trage ihre Haelfte
 * nicht, also duerfe hier nichts stehen. Das war richtig gemessen und ist
 * heute überholt — die Gegenseite wird im selben Zug gebaut
 * (us-qiblanco-2024, snippets/qb-seo-hreflang.liquid), und beide Seiten
 * speisen sich aus DERSELBEN Quelle.
 *
 * DIE TABELLE IST DESHALB NICHT MEHR HIER. Sie kommt aus dem generierten
 * app/lib/shop-switch.js, das seinerseits aus dem SSoT
 * homepage-bauer/shop-switch/shop-mapping.yaml fällt (Erzeuger
 * bin/shop-switch-gen). Zwei von Hand gepflegte Tabellen für dieselbe Größe
 * driften auseinander, ohne dass eine Seite für sich falsch aussieht — genau
 * der Naht-Fehler, gegen den dieser SSoT 2026-08-06 gebaut wurde. Ein
 * hreflang-Paar IST eine Seiten-Aequivalenz; es gibt keinen Grund, sie ein
 * zweites Mal zu behaupten.
 *
 * WARUM HREFLANG_PAARE UND NICHT MAP_DE_US: hreflang ist ENGER als der
 * Flaggen-Umschalter, aus zwei Gruenden, die beide in shop-mapping.yaml
 * ausgeschrieben sind.
 *   (1) bijektiv    — Paare mit `reverse: false` fallen heraus. Zwei
 *       DE-Generationen auf EIN US-Produkt (qione-1/qione-2-pro) wären als
 *       hreflang-Gruppe mehrdeutig.
 *   (2) indexierbar — Paare mit `hreflang: false` fallen heraus. Gemessen
 *       2026-09-04 tragen fünf DACH-Seiten noindex (linkseite, partner,
 *       pre-access, qibracelet, qihome-air). Ein hreflang, das als deutsche
 *       Fassung eine noindex-Seite benennt, benennt eine Fassung, die Google
 *       gar nicht indexieren darf — das Paar kann nie wirken.
 *   Der Umschalter darf diese Seiten weiter anspringen: dort hat ein MENSCH
 *   geklickt, und der soll ankommen. Nur die Aussage an die Suchmaschine fällt weg.
 *
 * MESSUNG 2026-09-04 (je Seite einzeln, OHNE Redirect-Folgen, drei Kriterien:
 * HTTP 200 + kein noindex + selbst-referenzierendes canonical):
 * 25 bijektive Paare inkl. Startseite -> 20 hreflang-tauglich, 5 ausgeschlossen.
 *
 * DIE AUFNAHMEBEDINGUNG GILT UNVERAENDERT WEITER — sie ist nur umgezogen:
 * sie steht jetzt als Regel im SSoT und wird dort erfuellt, statt hier als
 * kurze Tabelle vorgeführt zu werden.
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

// Relativ und nicht über den `~/`-Alias: diese Datei wird von
// test/seo-hreflang-produkt.test.mjs direkt mit node:test importiert, und node
// kennt den Vite-Alias nicht. Dieselbe Form nutzen app/lib/entity-schema.js und
// app/lib/blog-seo.js für ./seo.js.
import {HREFLANG_PAARE} from './shop-switch.js';

export const DACH_ORIGIN = 'https://qiblanco.com';
export const US_ORIGIN = 'https://qi-blanco.com';

/**
 * Belegte, BEIDSEITIG ausgezeichnete Seitenpaare.
 * Schlüssel = Pfad auf der DACH-Domain, Wert = Pfad auf der US-Domain.
 *
 * NICHT hier gepflegt — generiert aus homepage-bauer/shop-switch/shop-mapping.yaml.
 * Begründung im Kopf dieser Datei. Der Re-Export bleibt bestehen, damit
 * bestehende Leser (Tests, Proben) ihren Namen behalten.
 * @type {Record<string, string>}
 */
export const SEITEN_PAARE = HREFLANG_PAARE;

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
  const pfad = normalisiere(dachPfad);
  const usPfad = SEITEN_PAARE[pfad];
  if (!usPfad) return [];
  const de = `${DACH_ORIGIN}${pfad}`;
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
