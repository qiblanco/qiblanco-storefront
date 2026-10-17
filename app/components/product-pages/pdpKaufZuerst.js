/**
 * KAUF ZUERST — Preis, Variante und Kaufknopf der Produktseite stehen im
 * ersten Bildschirm, der Beschreibungstext darunter.
 *
 * WARUM: Der Designstandard verlangt für jede Produktseite Bild, Preis,
 * Variante und Kaufknopf im ersten Fenster bei 1440x900 und 2560x1440
 * (design-meister/db/designstandard/_basis.yaml, seitenregeln.pdp_falz;
 * Baustein `kauf_block`: Bild, Titel, Preiszeile, Variante, Kaufknopf,
 * Zusage). Gemessen am 17.10.2026 (Sicht-Tor vorab gegen qiblanco.com):
 * auf qibracelet und qihome-air stand der Kaufknopf bei 1440 erst bei
 * y=1372 bzw. 1266, auf qione-kette bei 974. Ursache ist die Reihenfolge in
 * `.product-main`: Titel, Sterne, Beschreibungstext, Preis, Knopf. Der Text
 * schiebt den Kauf unter den Falz; auf qibracelet und qihome-air steht
 * zusätzlich das schwarze 360°-Band vor der Kaufbox.
 *
 * WIE: Nur die Reihenfolge ändert sich, nicht der Inhalt. Im DOM bleibt alles
 * an seinem Platz (Text, Schema, Analytics, Anker unverändert); die Reihenfolge
 * am Bildschirm setzt styles/qb-pdp-kauf-zuerst.css über `order`. Das
 * Stylesheet laden nur die Kaufseiten, die es brauchen (links() der Route bzw.
 * der Seitenkomponente). Ohne das Stylesheet wirken die Attribute nicht.
 *
 * DER SCHALTER (mobil und desktop getrennt ausgerollt, wie KAUFBLOCK_AN in
 * reusables/Kaufblock.jsx): je Gerät `true` = Kauf zuerst, `false` = die
 * Reihenfolge von vorher. qione-kette steht auf der Gewinnerschutz-Liste
 * (zielsteuerung/exports/gewinner-schutz.json): der Schalter ist ihr
 * Umschaltplan, das Original bleibt mit `false` aktivierbar.
 * Grenze desktop/mobil: 750 px (Mobilgrenze des Hauses, max-width: 749px).
 */
export const PDP_KAUF_ZUERST = {desktop: true, mobil: false};

/**
 * Datenattribute für die Kaufbox (`.product`) oder einen Wrapper um sie.
 * Ausrollen je Seite in eigenen Merges: zuerst qibracelet und qihome-air
 * (Seitenkomponenten), dann qione-kette und qi-master je über ihre eigene
 * Route — eine Kaufseite pro Route-Diff, damit jeder Merge genau eine Seite
 * umbaut.
 */
export function kaufZuerstAttribute() {
  return {
    'data-kauf-zuerst-desktop': PDP_KAUF_ZUERST.desktop ? 'an' : 'aus',
    'data-kauf-zuerst-mobil': PDP_KAUF_ZUERST.mobil ? 'an' : 'aus',
  };
}
