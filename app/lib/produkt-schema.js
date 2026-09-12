/**
 * Product-Auszeichnung (schema.org) für die DACH-Produktseiten.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js,
 * app/lib/produkt-seo.js und app/lib/entity-schema.js).
 *
 * WARUM ES DIESE DATEI GIBT (live gemessen 2026-08-15, beide Domains):
 * NULL der 17 DACH-Produkt-URLs trug eine Product-Auszeichnung, während
 * ALLE 6 US-Produktseiten sie tragen (dort liefert sie das Liquid-Theme
 * mit). Ohne diese Auszeichnung kann Google auf den Umsatzseiten weder
 * Preis noch Verfügbarkeit als Rich Result zeigen — die Suchergebnisse der
 * beiden Shops sehen deshalb unterschiedlich vollständig aus, obwohl das
 * Sortiment dasselbe ist.
 *
 * WAS BEWUSST NICHT DRINSTEHT — `aggregateRating` und `review`:
 * Beide sind die auffälligsten Rich-Result-Felder, und beide braucht man
 * sich nicht auszudenken: Google verlangt, dass eine ausgezeichnete Bewertung
 * auf der Seite auch SICHTBAR ist und aus echten Bewertungen stammt.
 * Erfundene oder von einer fremden Quelle geborgte Sternewerte sind ein
 * Verstoß gegen die Richtlinien für strukturierte Daten und können manuelle
 * Maßnahmen für die ganze Domain auslösen. Solange keine Produkt-Bewertungen
 * am Produkt selbst erhoben werden (Stand 2026-08-15 offen, siehe Konzept
 * „Händlerbewertungen/Produktbewertungen", Entscheidung E1), bleibt das Feld
 * leer. Das ist keine Lücke, sondern die einzige zulässige Antwort.
 *
 * WAS BEWUSST NICHT DRINSTEHT — `gtin`/`mpn`: Der GTIN-Bestand ist nicht
 * geprüft. Eine falsche GTIN ist schlechter als keine, weil Google sie gegen
 * den Produktkatalog abgleicht.
 *
 * DER PREIS IST BRUTTO, UND ZWAR ZWINGEND (Korrektur 2026-08-15, am selben
 * Tag live nachgemessen und behoben): Shopify speichert auf den EUR-Märkten
 * NETTO (`taxes_included=false`). Die erste Fassung dieser Datei schrieb den
 * API-Betrag ungeprüft ins Schema — für QiOne 2 Pro also 913.45, während die
 * Seite dem Kunden 1.087,- € zeigt (913,45 × 1,19). Ein Suchergebnis, das
 * einen NIEDRIGEREN Preis nennt als die Seite, ist gegenüber dem Kunden
 * irreführend, verstößt gegen Googles Richtlinien für strukturierte Daten
 * (der ausgezeichnete Preis muss der sein, den der Nutzer zahlt) und ist für
 * deutsche Endkundenpreise zusätzlich die falsche Größe (PAngV: Endpreis).
 *
 * Umgerechnet wird NICHT hier, sondern über `bruttoAnzeige()` aus
 * app/lib/markt-pricing.js — dem dokumentierten Kanon, der schon vorher die
 * EINE Stelle war, an der aus einem API-Preis der Anzeigewert wird (inkl.
 * 7 % statt 19 % bei den Kakao-Handles und inkl. der Regel, dass Nicht-EUR-
 * Märkte den Endbetrag bereits liefern). Eine eigene Umrechnung an dieser
 * Stelle wäre eine zweite Wahrheit über den Preis — genau der Fehler, den
 * der Kanon verhindern soll. So zeigt das Schema exakt den Betrag, der auch
 * auf der Seite steht.
 *
 * KEIN KNOTEN OHNE PREIS-NACHWEIS (Nachtrag 2026-08-15, an allen 13
 * Produktseiten einzeln nachgemessen): Auf den Angebots-, Bundle- und
 * Mengenrabatt-Seiten weicht der angezeigte Preis vom Kanon-Wert ab. Belegt
 * an `crystal-cacao-angebot`: der Kanon rechnet 71,03 x 1,07 = 76 EUR (der
 * Handle steht in CACAO_HANDLES, und der 7-%-Satz ist dort an 41 realen
 * Bestellpositionen belegt), die Buybox der Seite zeigt aber "85,- EUR",
 * also 71,03 x 1,19. Auf den Bundle-Seiten war überhaupt kein Preis-Element
 * auffindbar, der angezeigte Wert also nicht messbar.
 *
 * Beides führt zur selben Entscheidung: Wo nicht BEWIESEN ist, dass der
 * ausgezeichnete Preis dem angezeigten entspricht, entsteht KEIN Knoten. Ein
 * Rich Result, das weniger nennt als die Seite verlangt, ist gegenueber dem
 * Kunden irrefuehrend — und "nicht messbar" ist hier kein Freibrief, sondern
 * gilt wie ein Fehlschlag.
 *
 * DIE ABWEICHUNG SELBST IST NICHT HIER ZU HEILEN: ob die Buybox oder der
 * Kanon recht hat, ist eine Preis-Frage mit Wirkung bis in den Checkout und
 * gehört zum bestehenden preiswatch/Cacao-MwSt-Vorgang, nicht in eine
 * SEO-Auszeichnung. Diese Liste ist die konservative Zwischenlage, bis das
 * geklaert ist — sie schrumpft, sobald die Preise uebereinstimmen.
 *
 * ZUR SPRACHE DER BESCHREIBUNG: Es wird ausschließlich der in Shopify
 * gepflegte Text übernommen, nie ein hier formulierter. Damit sagt die
 * Auszeichnung exakt das, was der Shop ohnehin sagt, und der Claim-Korridor
 * (HWG §3/§11; bei den Kakao-Sorten zusätzlich EU 1924/2006) wird durch
 * diese Datei weder erweitert noch neu bewertet.
 *
 * RETOUREN UND VERSAND (Nachtrag 2026-09-01, Grossjob-Segment s03):
 * `hasMerchantReturnPolicy` und `shippingDetails` fehlten auf allen drei
 * gemeldeten Produktseiten — der Merchant-Wächter des SEO-Managers meldet
 * das seit Wochen (seo-manager/conf/merchant.yaml, die beiden Felder für
 * Rückgabe- und Versand-Strukturdaten).
 *
 * DIESELBE REGEL WIE BEIM PREIS, EINE ACHSE WEITER: kein Wert, der nicht
 * belegt ist. Jede Zahl unten stammt aus einer Live-Seite, die der Kunde
 * selbst lesen kann — nicht aus einer Annahme über unsere Konditionen. Wo
 * nichts belegt ist, entsteht KEIN Feld: eine Lücke bewirkt nichts, eine
 * erfundene Angabe ist eine Falschaussage gegenüber dem Kunden und ein
 * Verstoß gegen Googles Richtlinien für strukturierte Daten.
 *
 * WAS BEWUSST NICHT DRINSTEHT — jedes Land außer Deutschland: Die
 * Versandrichtlinie listet rund 90 Länder mit Preisen (Österreich 6,90 €,
 * Schweiz 21,00 €, …), die AGB § 5 sagen dagegen, die Übersendung erfolge
 * „innerhalb der Bundesrepublik Deutschland". Welcher der beiden Rechtstexte
 * gilt, ist eine Rechtsfrage und gehört Christian, nicht dieser Datei. Für
 * Deutschland sagen beide dasselbe — deshalb steht hier nur Deutschland.
 *
 * WAS BEWUSST NICHT DRINSTEHT — `returnShippingFeesAmount`: Die
 * Widerrufsbelehrung sagt, wer die Rücksendung zahlt („Sie tragen die
 * unmittelbaren Kosten der Rücksendung der Waren"), aber nirgends, wie viel
 * das ist. `ReturnFeesCustomerResponsibility` drückt genau diese Aussage aus
 * und braucht keinen Betrag; `ReturnShippingFees` würde einen verlangen, den
 * wir uns ausdenken müssten.
 */

import {CANONICAL_ORIGIN} from './seo.js';
import {ORG_ID, ORGANISATION} from './entity-schema.js';
import {bruttoAnzeige} from './markt-pricing.js';

/**
 * Der Produktname ohne Schutzrechts-Zeichen — die SUCHFORM.
 *
 * WARUM ES DIESES FELD GIBT (SEO-Stufe S6, ursprünglich PR #201 vom
 * 2026-08-14; der PR wurde nicht gemergt, weil `main` diese Datei
 * zwischenzeitlich selbst angelegt und weiter ausgebaut hat — ein Merge
 * hätte die ärmere Fassung eingebracht. Die Substanz kommt deshalb hier
 * additiv an):
 * Kundensichtbar schreiben wir verbindlich „QiOne® 2 Pro“
 * (Marken-Schreibregeln). GESUCHT wird dagegen „QiOne 2 Pro“ — ohne
 * Zeichen. `name` trägt deshalb die Marken-Schreibung, `alternateName` die
 * Suchform. Beides ist wahr, und keine der beiden Schreibweisen muss dafür
 * irgendwo im sichtbaren Text verbogen werden.
 *
 * ABGELEITET STATT GEPFLEGT: eine zweite, handgepflegte Namensliste würde
 * von der Shopify-Quelle wegdriften, sobald dort jemand den Titel ändert.
 * Diese Funktion kann das nicht — sie hat keine eigene Wahrheit.
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
 * ALLE Schreibweisen, unter denen dieses Produkt real gesucht wird — als
 * Liste für `alternateName`.
 *
 * WARUM ZUSÄTZLICH ZU `suchform()` (an der Search Console gemessen
 * 2026-09-11, Property sc-domain:qiblanco.com, Fenster 2026-06-13..09-10,
 * 176 Queries): UNSERE KUNDEN TRENNEN „Qi" VOM REST DES MARKENNAMENS, und
 * zwar bei vier von vier Markenkomposita.
 *
 *   „qi one"      245 Impressionen,  32 Klicks, Pos 2,9
 *   „qione"       292 Impressionen,  18 Klicks, Pos 7,1
 *   „qi bracelet"  45 Impressionen,   3 Klicks, Pos 8,8
 *   „qibracelet"    0 Impressionen — die zusammengeschriebene Form wird NICHT gesucht
 *   „qi home"      34 Impressionen,   2 Klicks, Pos 15,2
 *   „qihome"        9 Impressionen,   2 Klicks, Pos 7,8
 *   „qi blanco"  1240 Impressionen, 261 Klicks — der größte Begriff der Property
 *
 * Die getrennte Form bringt bei „qi one" weniger Impressionen und trotzdem
 * MEHR Klicks als die zusammengeschriebene. Auf /products/qibracelet kam die
 * Zeichenfolge „Qi Bracelet" (mit Leerzeichen) im ausgelieferten HTML am
 * selben Tag NULL mal vor — die Form, die real gesucht wird, stand baulich
 * nirgends auf der Seite.
 *
 * ABGELEITET STATT GEPFLEGT — dieselbe Regel wie bei `suchform()` und aus
 * demselben Grund: getrennt wird an der Wortfuge Kleinbuchstabe/Ziffer →
 * Großbuchstabe, nicht über eine Liste. „QiBracelet" → „Qi Bracelet",
 * „QiOne 2 Pro" → „Qi One 2 Pro", „QiHome Air" → „Qi Home Air". Ein Titel
 * ohne solche Fuge („Crystal Cacao Awake") bleibt unverändert und erzeugt
 * keinen zweiten Eintrag. Eine gepflegte Liste getrennter Schreibweisen wäre
 * genau der Bau, den der Kopf dieser Datei verbietet — sie driftet von der
 * Shopify-Quelle weg, sobald dort jemand den Titel ändert.
 *
 * DIE MARKEN-SCHREIBUNG BLEIBT UNBERÜHRT: `alternateName` ist kein sichtbarer
 * Fließtext, sondern ein maschinenlesbares Feld für alternative Namen. Der
 * sichtbare Text und `name` tragen weiter „QiOne® 2 Pro" bzw. „QiBracelet®".
 *
 * @param {string} titel
 * @returns {string[]} distinkte Suchformen, ohne den Titel selbst
 */
export function suchformen(titel) {
  const original = String(titel || '').trim();
  const ohneZeichen = suchform(original);
  const getrennt = ohneZeichen.replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2');
  const formen = [];
  for (const f of [ohneZeichen, getrennt]) {
    if (f && f !== original && !formen.includes(f)) formen.push(f);
  }
  return formen;
}

/**
 * Handles der Produkte, zu denen es zellbiologische Untersuchungen gibt.
 *
 * WARUM DIESE DREI HANDLES HIER STEHEN UND NICHT IMPORTIERT WERDEN: die
 * Zuordnung Produkt → Studie liegt in `app/data/studien/index.js`, und diese
 * Datei importiert die fünf Studien-JSONs — 169 452 Byte, gemessen
 * 2026-09-11. Ein Import von dort würde die kompletten Studientexte in das
 * Bundle JEDER Produktseite ziehen, für eine Information von drei Wörtern.
 *
 * DASS ES ZWEI STELLEN SIND, IST DESHALB BEWUSST — UND GENAU DARUM STEHT EIN
 * DURCHSETZER DANEBEN: `test/produkt-schema.test.mjs` importiert BEIDE Seiten
 * und schlägt fehl, sobald sie auseinanderlaufen. Ohne ihn wäre das eine
 * zweite Wahrheit, die beim Ergänzen einer sechsten Studie still falsch wird.
 */
export const STUDIERTE_HANDLES = ['qione-2-pro', 'qibracelet', 'qihome-air'];

/**
 * schema.org-Verfügbarkeit aus dem Shopify-Flag.
 * @param {boolean|undefined} verfuegbar
 * @returns {string}
 */
function verfuegbarkeit(verfuegbar) {
  return verfuegbar
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';
}

/**
 * Product-Knoten für eine Produktseite.
 *
 * Gibt `null` zurück, wenn die tragenden Felder fehlen. Ein unvollständiger
 * Product-Knoten ist schlechter als keiner: Google meldet ihn in der Search
 * Console als fehlerhaftes Element, und ein Fehler steht dort dauerhaft,
 * während ein fehlendes Element nur nichts bewirkt.
 *
 * @param {object|undefined} produkt Shopify-Produkt aus PRODUCT_QUERY
 * @returns {object|null}
 */
export const OHNE_PREIS_NACHWEIS = [
  'crystal-cacao-angebot',
  'bundle-2x-awake',
  'bundle-3x-awake',
  'mengenrabatt-2x',
  'mengenrabatt-3x-create',
];

/**
 * Versandtabelle Deutschland — wörtlich aus /policies/shipping-policy
 * („Versandrichtlinie", live gelesen 2026-09-01):
 *   „Deutschland 5,90 € (Versandkostenfrei ab 99€)"
 *
 * WARUM DIE SCHWELLE HIER NACHGERECHNET WIRD STATT PAUSCHAL „KOSTENLOS":
 * Sie ist die einzige Form, in der die Auszeichnung dasselbe sagt wie die
 * Seite. An allen fünf Produktseiten mit Preis nachgemessen (2026-09-01):
 *   qione-2-pro 1087 € · qibracelet 1578 € · qihome-air 4983 €
 *     → Buybox: „Kostenloser Versand innerhalb Deutschlands" (unbedingt)
 *   qione-kette 94 € · crystal-cacao-create 76 €
 *     → Buybox: „Kostenloser Versand ab 99 € innerhalb Deutschlands"
 * Die Regel reproduziert damit 5 von 5 sichtbaren Seitenaussagen. Ein
 * pauschales „kostenlos" hätte auf den beiden Kakao-/Ketten-Seiten das
 * Gegenteil dessen behauptet, was dort steht.
 */
const DE_VERSAND_EUR = 5.9;
const DE_VERSANDFREI_AB_EUR = 99;

/**
 * Lieferzeit in Tagen [min, max] — NUR für Handles, deren Seite selbst eine
 * nennt. An allen 13 DACH-Produktseiten live abgezählt (2026-09-01; die
 * Kakao-Seiten am 2026-09-09 auf die Hausform nachgezogen):
 *   „In 2-3 Tagen bei Dir"      → qione-2-pro, qibracelet, qihome-air,
 *                                  qione-kette
 *   „In 1-3 Tagen bei Dir"       → crystal-cacao-awake, crystal-cacao-create
 *   keine Aussage                → die übrigen sieben
 *
 * ES GIBT ALSO KEINE EINE LIEFERZEIT, DIE MAN GLOBAL EINTRAGEN KÖNNTE. Der
 * naheliegende Griff — eine Zahl für den ganzen Shop — hätte auf mindestens
 * neun von dreizehn Seiten etwas anderes gesagt als die Seite selbst.
 *
 * Die Versandrichtlinie hilft hier NICHT: ihre Fußnote verweist für
 * Lieferzeiten auf „Liefer- und Zahlungsbedingungen", und dieser Link zeigt
 * auf /policies/shipping-policy — also auf sich selbst. Ein neues Produkt
 * bekommt deshalb kein `deliveryTime`, bis seine Seite eine Zusage trägt.
 * Das ist die gewollte Richtung: lieber ein Feld weniger als eine Zahl,
 * die der Kunde auf der Seite nicht wiederfindet.
 */
const LIEFERZEIT_TAGE = {
  'qione-2-pro': [2, 3],
  qibracelet: [2, 3],
  'qihome-air': [2, 3],
  'qione-kette': [2, 3],
  'crystal-cacao-awake': [1, 3],
  'crystal-cacao-create': [1, 3],
};

/**
 * Rückgabefrist in Tagen ab Erhalt.
 *
 * DIE EINE ENTSCHEIDUNG DIESER DATEI, DIE EINE BEGRÜNDUNG BRAUCHT: Der Shop
 * nennt ZWEI Fristen, und sie meinen nicht dasselbe.
 *
 *  - Die Widerrufsbelehrung (/policies/refund-policy) nennt „vierzehn Tage".
 *    Das ist das gesetzliche Widerrufsrecht — ein eigener Rechtsbehelf, der
 *    von dieser Datei nicht berührt, nicht ausgelegt und nicht verkürzt wird.
 *  - Die Kopfleiste JEDER Seite nennt „Jetzt 20 Tage risikofrei erleben!",
 *    der Seitentitel der QiOne-Produktseite lautet „QiOne® 2 Pro kaufen —
 *    20 Tage risikofrei", und die Bedingungen sind ausformuliert:
 *    „Frist: 20 Tage ab Erhalt · Grund: keiner nötig · Ablauf: melden,
 *    zurücksenden, Erstattung" (app/components/campaign/MmWirMachenIhnAuf.jsx
 *    und Schwesterseiten).
 *
 * `merchantReturnDays` fragt nach der Zahl der Tage nach Zustellung, in denen
 * der Kunde zurückgeben kann. Die Antwort, die unser Shop dem Kunden auf
 * genau der ausgezeichneten Seite gibt, ist 20 — und sie ist die für ihn
 * günstigere. Hier 14 einzutragen hieße, die Auszeichnung gegen die eigene,
 * überall sichtbare Zusage zu stellen: Google vergleicht strukturierte Daten
 * mit dem Seiteninhalt, und der Kunde läse zwei verschiedene Versprechen.
 */
const RETOURENFRIST_TAGE_AB_ERHALT = 20;

/**
 * Versandbedingungen für Deutschland. `null`, wenn die EUR-Tabelle oben auf
 * den Markt des Produkts nicht anwendbar ist — dann lieber kein Knoten als
 * ein Betrag in der falschen Währung.
 *
 * @param {string} handle
 * @param {number} preis Brutto-Anzeigewert (bruttoAnzeige)
 * @param {string} waehrung ISO-4217 aus der Variante
 * @returns {object|null}
 */
function versandDetails(handle, preis, waehrung) {
  if (waehrung !== 'EUR') return null;

  const satz = preis >= DE_VERSANDFREI_AB_EUR ? 0 : DE_VERSAND_EUR;
  const details = {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: satz,
      currency: 'EUR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'DE',
    },
  };

  const spanne = LIEFERZEIT_TAGE[handle];
  if (spanne) {
    details.deliveryTime = {
      '@type': 'ShippingDeliveryTime',
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: spanne[0],
        maxValue: spanne[1],
        unitCode: 'DAY',
      },
    };
  }
  return details;
}

/**
 * Rückgabebedingungen. Für alle Produkte gleich — anders als beim Versand
 * kennt der Shop hier keine Staffelung nach Produkt oder Warenwert.
 *
 * `handlingTime` fehlt bewusst: die Seiten nennen eine Gesamtzusage („in
 * 2-3 Tagen bei Dir"), keine Aufteilung in Bearbeitung und Transport. Sie zu
 * erfinden würde die zugesagte Gesamtdauer verlängern.
 *
 * @returns {object}
 */
function retourenRichtlinie() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'DE',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: RETOURENFRIST_TAGE_AB_ERHALT,
    returnMethod: 'https://schema.org/ReturnByMail',
    // „Sie tragen die unmittelbaren Kosten der Rücksendung der Waren."
    // (/policies/refund-policy) — die Aussage ohne Betrag, den niemand
    // beziffert hat.
    returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  };
}

export function produktSchema(produkt) {
  if (!produkt?.handle || !produkt?.title) return null;
  if (OHNE_PREIS_NACHWEIS.includes(produkt.handle)) return null;

  const variante = produkt.selectedOrFirstAvailableVariant;
  const waehrung = variante?.price?.currencyCode;
  // Brutto — siehe Kopf. bruttoAnzeige() liefert denselben Wert, den die
  // Seite anzeigt; null, wenn der Betrag fehlt oder unbrauchbar ist.
  const preis = bruttoAnzeige(variante?.price?.amount, produkt.handle, waehrung);
  // Ohne Preis KEIN offers-Block und damit kein Rich Result — dann lohnt der
  // ganze Knoten nicht, denn Preis und Verfügbarkeit sind sein einziger
  // Mehrwert gegenüber dem, was Google ohnehin aus der Seite liest.
  if (preis == null || !waehrung) return null;

  const url = `${CANONICAL_ORIGIN}/products/${produkt.handle}`;
  const bilder = (produkt.images?.nodes ?? [])
    .map((b) => b?.url)
    .filter(Boolean)
    .slice(0, 5);

  const knoten = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: produkt.title,
    url,
    // `@id` klammert die Marke an den Organization-Knoten aus
    // entity-schema.js. Ohne sie stehen zwei gleichnamige, aber für eine
    // Maschine unverbundene Aussagen nebeneinander: eine Marke „Qi Blanco“
    // auf der Produktseite und eine Organisation „Qi Blanco“ im
    // Wissensgraphen. Der Name bleibt derselbe — hinzu kommt allein die
    // Verknüpfung.
    brand: {'@type': 'Brand', '@id': ORG_ID, name: ORGANISATION.name},
    offers: {
      '@type': 'Offer',
      url,
      price: String(preis),
      priceCurrency: waehrung,
      availability: verfuegbarkeit(variante?.availableForSale),
      itemCondition: 'https://schema.org/NewCondition',
      seller: {'@id': ORG_ID},
      hasMerchantReturnPolicy: retourenRichtlinie(),
    },
  };

  // Suchform NUR ausgeben, wenn sie sich vom Namen unterscheidet: sonst
  // wäre `alternateName` eine wortgleiche Wiederholung von `name` und damit
  // reines Rauschen — ein Feld, das nichts hinzufügt, ist kein neutraler
  // Zusatz, sondern eine Aussage ohne Inhalt.
  const suchnamen = suchformen(produkt.title);
  if (suchnamen.length === 1) knoten.alternateName = suchnamen[0];
  else if (suchnamen.length > 1) knoten.alternateName = suchnamen;

  const versand = versandDetails(produkt.handle, preis, waehrung);
  if (versand) knoten.offers.shippingDetails = versand;

  // Beschreibung: Vorrang für das gepflegte SEO-Feld, sonst der Produkttext.
  // Dieselbe Reihenfolge wie in pages.$handle.jsx für den Titel.
  const beschreibung = (produkt.seo?.description || produkt.description || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (beschreibung) knoten.description = beschreibung;

  if (bilder.length) knoten.image = bilder;
  if (variante?.sku) knoten.sku = variante.sku;

  // DIE ZWEITE RICHTUNG DER STUDIEN-NAHT. /pages/studien sagt seit
  // 2026-09-11 `about` → diesen Produktknoten; `subjectOf` ist die
  // Gegenrichtung und sagt: zu DIESEM Produkt gibt es ein Dokument. Eine
  // Naht hat zwei Richtungen — steht nur eine davon da, zeigt sie auf eine
  // `@id`, die die Gegenseite nicht bestätigt.
  //
  // WOZU (Search Console, Fenster 2026-08-12..09-10): auf der Query
  // „qione 2 pro" ranken BEIDE eigenen Seiten, aber in der falschen
  // Reihenfolge — /pages/studien auf Position 2,7 mit 177 Impressionen,
  // /products/qione-2-pro auf 5,5 mit 4. Google wählt die Studienseite als
  // DIE Antwort der Domain auf einen Produktnamen. Im maschinenlesbaren Teil
  // stand bis dahin nichts, was die beiden Seiten unterscheidet: das `about`
  // der Studienseite war freier Text, für eine Maschine also kein Bezug auf
  // ein Produkt. Diese beiden Kanten sagen die Hierarchie aus, die vorher nur
  // ein Mensch aus dem Text erschließen konnte — hier ist das Produkt, dort
  // ist ein Dokument darüber.
  if (STUDIERTE_HANDLES.includes(produkt.handle)) {
    knoten.subjectOf = {'@id': `${CANONICAL_ORIGIN}/pages/studien#sammlung`};
  }

  return knoten;
}

/**
 * BreadcrumbList (schema.org) einer Produktseite.
 *
 * WARUM ES DIESE FUNKTION GIBT: PR #100 (GEO FJ1, 2026-07-23) sagte eine
 * BreadcrumbList auf ALLEN indexierbaren Produktseiten zu. Der PR wurde am
 * 2026-09-05 geschlossen, weil seine übrige Substanz auf anderem Weg live
 * ging (#187/#189/#217) — diese Zusage ging dabei NICHT mit. Am 2026-09-05
 * live nachgemessen: die PDPs tragen Product/Brand/Offer/MerchantReturnPolicy/
 * OfferShippingDetails (vollzählig an allen 13 Sitemap-Produkten), aber
 * `BreadcrumbList` kam auf der gesamten Storefront nur in der Studien-Familie
 * vor (app/lib/studien-schema.js, Funktion `brotkrume`). Es fehlte also nicht
 * die Fähigkeit, sondern ihre Reichweite.
 *
 * WARUM HIER UND NICHT ZWEIMAL IN DEN ROUTEN: die Produktseiten laufen über
 * ZWEI Emitter — sechs Flaggschiff-Routen über `produktMeta()`
 * (app/lib/produkt-seo.js) und der Rest über die Sammelroute
 * `products.$handle.jsx`. Genau diese Zweiteilung hat bei der
 * Product-Auszeichnung schon einmal dazu geführt, dass sie überall ankam,
 * nur nicht auf den sechs wichtigsten Seiten (PR #217, siehe Kopf von
 * produkt-seo.js). Ein Knoten, zwei Aufrufer.
 *
 * WARUM SIE AUCH FÜR `OHNE_PREIS_NACHWEIS`-HANDLES ENTSTEHT — die einzige
 * Stelle, an der diese Funktion bewusst ANDERS urteilt als produktSchema():
 * Die fünf dort geführten Handles (Bundles, Mengenrabatte, das
 * Kakao-Angebot) tragen absichtlich KEIN Product-JSON-LD, weil ein
 * Product-Knoten ohne belastbaren Preis schlechter ist als keiner. Eine
 * Brotkrume trifft darüber gar keine Aussage: sie beschreibt den Weg zur
 * Seite, nicht ihren Preis, und kann deshalb auch nicht falsch werden, wenn
 * der Preis unklar ist. Alle fünf stehen ausserdem in
 * sitemap/products/1.xml (live gezählt 2026-09-05, 13 Einträge) — sie sind
 * genau die "indexierbaren Produktseiten", die die Zusage aus PR #100 nennt.
 * Der Preis-Vorbehalt bleibt davon unberührt.
 *
 * AUSGENOMMEN sind allein die Handles aus `NICHT_INDEXIERBARE_PRODUKTE`
 * (~/lib/seo). Das steht NICHT hier, sondern bei den Aufrufern: beide setzen
 * für diese Handles `robots: noindex` und kehren VOR der Auszeichnung um.
 * Strukturierte Daten auf einer Seite, die nicht in den Index soll, wären
 * ein widersprüchliches Signal.
 *
 * DIE ZWEITE STUFE IST BELEGT, NICHT ERFUNDEN: `/collections/all` liefert
 * live HTTP 200 und trägt den Titel „Alle Produkte | Qi Blanco"
 * (gemessen 2026-09-05); der Name der Stufe ist genau dieser Seitentitel ohne
 * Marken-Suffix. Eine erfundene Zwischenstufe („Shop", „Produkte") wäre eine
 * Brotkrume auf eine URL, die es nicht gibt — Google prüft die `item`-URLs.
 *
 * @param {{handle?: string, title?: string}|undefined} produkt
 * @returns {object|null} BreadcrumbList-Knoten oder null
 */
export function brotkrumeSchema(produkt) {
  if (!produkt?.handle || !produkt?.title) return null;
  const url = `${CANONICAL_ORIGIN}/products/${produkt.handle}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    // Eigene @id mit Fragment, damit der Knoten neben dem Product-Knoten
    // (`#product`) eindeutig adressierbar bleibt und zwei Knoten derselben
    // Seite sich nicht überschreiben.
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
        name: 'Alle Produkte',
        item: `${CANONICAL_ORIGIN}/collections/all`,
      },
      {'@type': 'ListItem', position: 3, name: produkt.title, item: url},
    ],
  };
}
