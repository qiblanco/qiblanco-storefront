/*
 * Wann steht der Sticky-Warenkorb-Knopf der Rookie-Shopseite im Bild?
 * (Rookie /pages/qione-2-pro-b, Experiment q2p-e1-gs080, Hypothese GS-080
 * Bestandteil Knöpfe = GS-065/066/067.)
 *
 * Eine reine Funktion, damit die Regel ohne Browser prüfbar ist
 * (rookie-shop.test.mjs). StickyWarenkorb.jsx liefert die drei Beobachtungen
 * aus einem IntersectionObserver.
 *
 * DIE REGEL (KONZEPT 3a): sichtbar, sobald die Buybox aus dem Bild ist, und
 * zwar NACH unten weggescrollt (ihre Unterkante liegt über dem Fenster). Wird
 * die Buybox wieder sichtbar, geht er weg: dort steht der echte Knopf.
 * Am Seitenende geht er ebenfalls weg, sobald der Fuß ins Bild kommt. Der
 * Fuß trägt Impressum, Datenschutz und Widerruf, und ein fester Balken
 * darüber läge sonst genau auf ihnen.
 *
 * Fehlende Messung heißt "nicht zeigen": ohne Buybox-Lage (null/undefined)
 * bleibt der Knopf weg. Ein Knopf, der an einer unbekannten Stelle erscheint,
 * kann die Buybox selbst verdecken.
 *
 * @param {{buyboxImBild: boolean, buyboxUnterkante: number|null|undefined,
 *   fussImBild: boolean}} lage
 * @returns {boolean}
 */
export function stickySichtbar({buyboxImBild, buyboxUnterkante, fussImBild}) {
  if (buyboxImBild) return false;
  if (typeof buyboxUnterkante !== 'number' || !Number.isFinite(buyboxUnterkante)) {
    return false;
  }
  if (buyboxUnterkante > 0) return false;
  return !fussImBild;
}
