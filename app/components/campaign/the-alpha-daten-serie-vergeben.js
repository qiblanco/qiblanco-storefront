/** Die Alpha-Serie: Nummern 1 bis 111 (Christian 25.10.: „es geht nun bis 111“). */
export const THE_ALPHA_SERIE = 111;

/**
 * Vergebene Wunschnummern, Christian wörtlich (Z7): „Vergeben sind bei den
 * nummern übrings 88, 44, 2, 99 und 111“. Am 29.10.2026 dazu: „die nummer 33
 * ist auch schon verkauft“ (Job 20261029-qi-alpha-wunschnummer-bild-180-grad-
 * nr33-verkauft; in Shopify per qm-seriennummern vorab 33 gesperrt).
 *
 * WARUM ZUSÄTZLICH ZUR SHOPIFY-SPERRE: verbindlich ist die Sperre am Produkt
 * (Variante inventoryPolicy DENY -> availableForSale false, an Seite,
 * Warenkorb und Kasse). Diese Liste sorgt dafür, dass die Seite Christians
 * Wort nie widerspricht, auch wenn Shopify hinterherläuft. Eine Nummer ist
 * auf der Seite frei NUR, wenn sie hier fehlt UND ihre Shopify-Variante
 * kaufbar ist. (Übergabe s03 des Grossjobs 20261025-prio1-the-alpha-…)
 */
export const THE_ALPHA_VERGEBEN = [2, 33, 44, 88, 99, 111];
