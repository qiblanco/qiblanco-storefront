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
 * ZUR SPRACHE DER BESCHREIBUNG: Es wird ausschließlich der in Shopify
 * gepflegte Text übernommen, nie ein hier formulierter. Damit sagt die
 * Auszeichnung exakt das, was der Shop ohnehin sagt, und der Claim-Korridor
 * (HWG §3/§11; bei den Kakao-Sorten zusätzlich EU 1924/2006) wird durch
 * diese Datei weder erweitert noch neu bewertet.
 */

import {CANONICAL_ORIGIN} from './seo.js';
import {ORG_ID, ORGANISATION} from './entity-schema.js';
import {bruttoAnzeige} from './markt-pricing.js';

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
export function produktSchema(produkt) {
  if (!produkt?.handle || !produkt?.title) return null;

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
    brand: {'@type': 'Brand', name: ORGANISATION.name},
    offers: {
      '@type': 'Offer',
      url,
      price: String(preis),
      priceCurrency: waehrung,
      availability: verfuegbarkeit(variante?.availableForSale),
      itemCondition: 'https://schema.org/NewCondition',
      seller: {'@id': ORG_ID},
    },
  };

  // Beschreibung: Vorrang für das gepflegte SEO-Feld, sonst der Produkttext.
  // Dieselbe Reihenfolge wie in pages.$handle.jsx für den Titel.
  const beschreibung = (produkt.seo?.description || produkt.description || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (beschreibung) knoten.description = beschreibung;

  if (bilder.length) knoten.image = bilder;
  if (variante?.sku) knoten.sku = variante.sku;

  return knoten;
}
