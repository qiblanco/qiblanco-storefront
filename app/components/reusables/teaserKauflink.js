/**
 * TEASER SIND NAVIGATION, KEIN KAUF-BLOCK (s12 des Grossjobs
 * 20261015-GROSSJOB-design-update-designmeister-homepagebauer-fehler-wurzel-
 * alle-beheben, 17.10.2026).
 *
 * Zwei Teaser-Bausteine trugen je Produkt zwei Links: „Mehr erfahren“ und
 * „Jetzt kaufen“, der zweite ohne Preis — UpsellLineUp (Startseite und alle
 * Produktseiten) und index-components/FeaturedProduct (Startseite). Das
 * Sicht-Tor führte das als Kaufknopf ohne Kontext (Register F-118, F-119,
 * F-128, F-142, F-148, F-155, F-161, F-173) und, weil die Karten verschieden
 * hohe Texte tragen und die Links deshalb versetzt stehen, als zwei
 * Kaufknöpfe untereinander (F-120, F-129, F-143, F-149, F-156, F-162,
 * F-174). Der Designstandard lässt einen Kaufknopf nie ohne Preis stehen
 * (design-meister/db/designstandard/_basis.yaml, Baustein `kauf_block`).
 *
 * ENTSCHEIDUNG: der Teaser bleibt Navigation mit EINEM Link, der vorhandenen
 * Formulierung „Mehr erfahren“. Ein Preis je Karte hätte Shopify-Daten in
 * jedem der rund zwölf Gastgeber-Loader gebraucht; eine feste Preisliste wiche
 * je Markt vom Preis der Kaufseite ab. Gekauft wird eine Seite weiter, auf der
 * Detail- bzw. Kaufseite mit Preis und Kaufbox.
 *
 * DER SCHALTER (mobil und desktop getrennt ausgerollt, wie KAUFBLOCK_AN in
 * reusables/Kaufblock.jsx): TEASER_KAUFLINK sagt je Gerät, ob der alte
 * „Jetzt kaufen“-Link sichtbar bleibt. `true` stellt das Original wieder her;
 * das ist der Umschaltplan der Gewinnerseite / (zielsteuerung/exports/
 * gewinner-schutz.json). Der Link bleibt im DOM und wird nur ausgeblendet,
 * damit das Original ohne Codeänderung zurückkommt.
 * `hidden!` statt `hidden`: Tailwind-Klassen liegen in @layer utilities und
 * verlören ohne `!` gegen ungelayerte Regeln wie `.UpsellLink { display:
 * block }` in app.css. Grenze 750 px = Mobilgrenze des Hauses.
 */
export const TEASER_KAUFLINK = {desktop: false, mobil: true};

/** Zusatzklassen für den „Jetzt kaufen“-Link eines Teasers. */
export const TEASER_KAUFLINK_KLASSE =
  (TEASER_KAUFLINK.desktop ? '' : ' min-[750px]:hidden!') +
  (TEASER_KAUFLINK.mobil ? '' : ' max-[749px]:hidden!');
