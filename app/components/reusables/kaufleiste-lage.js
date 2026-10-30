/*
 * Wann steht die Kaufleiste der Produktseite im Bild?
 * (Baustein components/reusables/Kaufleiste.jsx, Bauplan
 * design-meister/db/designstandard/_basis.yaml, Seitenregel `pdp_falz.mobil`:
 * „im ersten Fenster preis und kaufknopf, Ersatz: klebende Kaufleiste mit
 * Preis und Knopf“.)
 *
 * Eine reine Funktion, damit die Regel ohne Browser prüfbar ist
 * (kaufleiste.test.mjs). Kaufleiste.jsx liefert die Beobachtungen aus dem Haken
 * lib/kaufleiste-sicht.js (100svh, Hysterese) und aus matchMedia.
 *
 * DIE REGEL: sichtbar, solange der Kaufknopf der Kaufbox NICHT im Bild ist,
 * und zwar in beide Richtungen: ganz oben (der Knopf liegt mobil unter dem
 * ersten Fenster, gemessen 17.10.2026 bei 390x844 zwischen y=1183 und 2069)
 * ebenso wie nach dem Weiterscrollen. Weg ist sie, sobald der Knopf der
 * Kaufbox im Bild ist: zwei gleiche Knöpfe übereinander wären Doppelung.
 * AM SEITENENDE BLEIBT SIE STEHEN (seit 30.10.2026, Grossjob 20261030-prio1-
 * homepage-gesamt-pruefen-alpha-befunde-alle-seiten-geraete-maerkte, s03).
 * Bis dahin ging sie, sobald der Fuß ins Bild kam, weil dort Impressum,
 * Datenschutz und Widerruf stehen und ein fester Balken genau darauf läge.
 * Die Geräteprobe (echtgeraet_probe.py, Christian 30.10.: „Das müsste doch
 * eigentlich Standard sein“) fand deshalb auf iPhone und Android am Ende der
 * Kaufseiten keinen aktiven Kaufknopf mehr. Jetzt hält qb-kaufleiste.css
 * unter dem Fuß mobil die Höhe der Leiste frei: der Fuß bleibt ganz lesbar,
 * und der Knopf steht bis zum Schluss.
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
 * @param {{geraetAn: boolean, gemessen: boolean, kaufknopfImBild: boolean}} lage
 * @returns {boolean}
 */
export function kaufleisteSichtbar({geraetAn, gemessen, kaufknopfImBild}) {
  if (!geraetAn) return false;
  if (!gemessen) return false;
  return !kaufknopfImBild;
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

/*
 * A/B-TEST DER KAUFLEISTE (Grossjob 20261025-design-ai-anna-fenster-wie-
 * apple-handy-hochrutschen-ab-jetzt-kaufen, s03; Christian 25.10.2026: „statt
 * dem Preis etwas wie "E-Smog Schutz" "Jetzt kaufen" also eine Nutzenaussage
 * und auch obowhl es nur in den warenkorb gelegt wird, ruhigh mal "Jetzt
 * kaufen" abfragen. und dann wie gewohtn weiter machen und den warenkorb
 * äöffnen.“).
 *
 * Arm a (Kontrolle): Preis + „In den Warenkorb legen“, wie bisher.
 * Arm b: Nutzenaussage statt Preis + „Jetzt kaufen“. Die Aktion bleibt
 * dieselbe: dieselben Warenkorbzeilen, die Schublade öffnet sich. Bei
 * mehreren Varianten bleibt „Größe wählen“ der erste Schritt (kaufleisteZiel),
 * erst danach heißt der Knopf „Jetzt kaufen“.
 *
 * Die Ausnahme von der Formulierungsregel in Kaufleiste.jsx („In den
 * Warenkorb legen heißt immer Warenkorb“) ist Christians Auftrag und gilt
 * nur für Arm b dieses Tests.
 *
 * NUTZENAUSSAGE JE PRODUKT, je mit Quelle (eine Zeile bei 390 px, echte
 * Umlaute). Alle vier stehen wortgleich in der Nutzenleiste der eigenen
 * Seite:
 *  - qione-2-pro: Christians Wortlaut (prompt.txt des Auftrags) und
 *    product-pages/QiOneHeroBulletsPages.jsx ('E-Smog Schutz').
 *  - qione-kette: dieselbe QiOne-Familie, QiOneHeroBulletsPages.jsx.
 *  - qibracelet: product-pages/QiBraceletHeroBullets.jsx ('E-Smog Schutz').
 *  - qihome-air: product-pages/QiHomeHeroBullets.jsx ('E-Smog Schutz').
 * qi-master ist NICHT im Test: seine Texte (data/qi-master-texte.js,
 * qi-master-wortlaut.json) tragen keinen kurzen Nutzen in Kundensprache, und
 * einen zu erfinden wäre eine zweite Wahrheit neben Christians Wortlaut. Ohne
 * Eintrag bekommt die Seite keinen Arm (kaufleiste-ab.server.js) und zeigt a.
 */
export const KAUFLEISTE_NUTZEN = Object.freeze({
  'qione-2-pro': 'E-Smog Schutz',
  'qione-kette': 'E-Smog Schutz',
  qibracelet: 'E-Smog Schutz',
  'qihome-air': 'E-Smog Schutz',
});

/** Kennung des Tests im Stempel ab_zuteilung (events.db, [a-z0-9_]{1,32}). */
export const KAUFLEISTE_AB_TEST = 'kaufleiste_z4';

/** Beschriftung des Kaufknopfs in Arm b. */
export const JETZT_KAUFEN = 'Jetzt kaufen';

/**
 * Was zeigt die Leiste? Reine Entscheidung über Arm und Produkt.
 *
 * @param {{arm?: string|null, handle?: string|null}} stand
 * @returns {{arm: 'a'|'b', nutzen: string|null, knopf: string|null}}
 *   nutzen = Text statt Preis (nur b), knopf = Beschriftung des
 *   Warenkorb-Knopfs (null = die der Kaufbox)
 */
export function kaufleisteAnzeige({arm, handle}) {
  const nutzen = KAUFLEISTE_NUTZEN[String(handle || '')] || null;
  if (arm === 'b' && nutzen) return {arm: 'b', nutzen, knopf: JETZT_KAUFEN};
  return {arm: 'a', nutzen: null, knopf: null};
}
