/*
 * Wann steht der Sticky-Warenkorb-Knopf der Rookie-Shopseite im Bild?
 * (Rookie /pages/qione-2-pro-b, Experiment q2p-e1-gs080, Hypothese GS-080
 * Bestandteil "knoepfe" = GS-065/066/067.)
 *
 * Eine reine Funktion, damit die Regel ohne Browser pruefbar ist
 * (rookie-shop.test.mjs). StickyWarenkorb.jsx liefert die drei Beobachtungen
 * aus einem IntersectionObserver.
 *
 * DIE REGEL (KONZEPT 3a): sichtbar, sobald die Buybox aus dem Bild ist, und
 * zwar NACH unten weggescrollt (ihre Unterkante liegt ueber dem Fenster). Wird
 * die Buybox wieder sichtbar, geht er weg: dort steht der echte Knopf.
 * Am Seitenende geht er ebenfalls weg, sobald der Fuss ins Bild kommt. Der
 * Fuss traegt Impressum, Datenschutz und Widerruf, und ein fester Balken
 * darueber laege sonst genau auf ihnen.
 *
 * Fehlende Messung heisst "nicht zeigen": ohne Buybox-Lage (null/undefined)
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
