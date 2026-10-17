/*
 * Wann steht die Kaufleiste der Produktseite im Bild?
 * (Baustein components/reusables/Kaufleiste.jsx, Bauplan
 * design-meister/db/designstandard/_basis.yaml, Seitenregel `pdp_falz.mobil`:
 * „im ersten Fenster preis und kaufknopf, Ersatz: klebende Kaufleiste mit
 * Preis und Knopf“.)
 *
 * Eine reine Funktion, damit die Regel ohne Browser prüfbar ist
 * (kaufleiste.test.mjs). Kaufleiste.jsx liefert die Beobachtungen aus einem
 * IntersectionObserver und aus matchMedia.
 *
 * DIE REGEL: sichtbar, solange der Kaufknopf der Kaufbox NICHT im Bild ist,
 * und zwar in beide Richtungen: ganz oben (der Knopf liegt mobil unter dem
 * ersten Fenster, gemessen 17.10.2026 bei 390x844 zwischen y=1183 und 2069)
 * ebenso wie nach dem Weiterscrollen. Weg ist sie, sobald der Knopf der
 * Kaufbox im Bild ist: zwei gleiche Knöpfe übereinander wären Doppelung.
 * Weg ist sie auch, sobald der Fuß ins Bild kommt. Dort stehen Impressum,
 * Datenschutz und Widerruf, und ein fester Balken läge genau darauf.
 *
 * Anders als die beiden Vorgänger (rookie/start/sticky-lage.js und
 * rookie/shop/sticky-lage.js) zählt hier NICHT, ob der Kopf oder die Buybox
 * schon nach oben weggescrollt ist. Auf der Kaufseite ist die Leiste der
 * Ersatz für den Kaufknopf im ersten Fenster; sie muss deshalb schon beim
 * Laden stehen.
 *
 * Fehlende Messung heißt „nicht zeigen“: ohne Lage des Kaufknopfs
 * (gemessen false) bleibt die Leiste weg. Eine Leiste, die erscheint, bevor
 * bekannt ist, wo der Knopf steht, kann ihn selbst verdecken.
 *
 * @param {{geraetAn: boolean, gemessen: boolean, kaufknopfImBild: boolean,
 *   fussImBild: boolean}} lage
 * @returns {boolean}
 */
export function kaufleisteSichtbar({geraetAn, gemessen, kaufknopfImBild, fussImBild}) {
  if (!geraetAn) return false;
  if (!gemessen) return false;
  if (kaufknopfImBild) return false;
  return !fussImBild;
}

/*
 * Wohin führt der Knopf der Leiste?
 *
 * EINE Variante (qione-2-pro, qihome-air, qi-master): in den Warenkorb, mit
 * genau den Zeilen der Kaufbox.
 *
 * MEHRERE Varianten (qibracelet Größe S/M/L, qione-kette Länge XS..XL): zur
 * Variantenwahl der Kaufbox, solange der Kunde in DIESEM Seitenaufruf keine
 * Größe angetippt hat. Erst danach legt der Knopf in den Warenkorb.
 * Warum nicht die vorgewählte Variante kaufen: die Kaufseite wählt beim
 * Laden selbst die erste verfügbare Variante (S – 17 bzw. XS - 40 cm) und
 * schreibt sie sogar in die Adresse (useSelectedOptionInUrlParam). Ein
 * Knopf, der sie kauft, kauft eine Größe, die niemand gewählt hat; die
 * Rücksendung trägt der Kunde. Auch ein Größen-Parameter in der Adresse ist
 * deshalb kein Beleg einer Wahl.
 *
 * @param {{mehrereVarianten: boolean, gewählt: boolean}} stand
 * @returns {'warenkorb'|'variantenwahl'}
 */
export function kaufleisteZiel({mehrereVarianten, gewählt}) {
  if (mehrereVarianten && !gewählt) return 'variantenwahl';
  return 'warenkorb';
}

/*
 * Die Beschriftung des Knopfs zur Variantenwahl: der Name der Option aus der
 * Kaufbox mit „wählen“. Shopify führt die Option der Kette als „Size“; im
 * deutschen Laden heißt der Knopf trotzdem „Größe wählen“.
 *
 * @param {string|undefined} optionName
 * @returns {string}
 */
const OPTION_DEUTSCH = {size: 'Größe', groesse: 'Größe', größe: 'Größe'};
export function variantenwahlText(optionName) {
  const name = String(optionName || '').trim();
  const deutsch = OPTION_DEUTSCH[name.toLowerCase()] || name || 'Größe';
  return `${deutsch} wählen`;
}
