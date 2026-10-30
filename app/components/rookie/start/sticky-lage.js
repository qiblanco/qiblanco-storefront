/*
 * Wann steht der Sticky-Kaufknopf der Rookie-Startseite im Bild?
 * (Rookie /pages/start-b, Experiment start-e1-gs081, Hypothese GS-081,
 * Bestandteil Knöpfe: „mobil sticky Kaufknopf ab dem zweiten Bildschirm“.)
 *
 * Eine reine Funktion, damit die Regel ohne Browser prüfbar ist
 * (rookie-start.test.mjs). StickyKaufknopf.jsx liefert die Beobachtungen aus
 * dem Haken lib/kaufleiste-sicht.js (100svh, Hysterese).
 *
 * DIE REGEL: sichtbar, sobald der Kopf (data-section="hero") nach oben aus dem
 * Bild ist. Im Kopf steht „Jetzt kaufen“ schon; der Kopf ist mobil gut einen
 * Bildschirm hoch, der Knopf erscheint also im zweiten Bildschirm.
 * Weg ist er, solange ein anderer Kaufknopf der Seite im Bild ist (der Knopf
 * nach den Zell-Diagrammen): zwei gleiche Knöpfe übereinander wären Doppelung.
 * Am Seitenende bleibt er stehen (seit 30.10.2026, s03 des Grossjobs
 * 20261030-prio1-homepage-gesamt-pruefen-alpha-befunde-alle-seiten-geraete-
 * maerkte): bis dahin ging er, sobald der Fuß ins Bild kam, und die
 * Geräteprobe fand am Ende keinen aktiven Kaufknopf. Impressum, Datenschutz
 * und Widerruf bleiben frei, weil rookie-start.css dem Fuß mobil die Höhe des
 * Knopfs als Polster gibt.
 *
 * Fehlende Messung heißt „nicht zeigen“: ohne Lage des Kopfs (null/undefined)
 * bleibt der Knopf weg.
 *
 * Bewusst eine eigene Funktion und kein Import aus rookie/shop/sticky-lage.js,
 * obwohl die Regel dort fast gleich lautet: beide Rookies enden mit ihrem
 * Test, jeder für sich. Ein Import würde Start-B brechen, sobald die
 * Shopseiten-Rookie nach ihrem Urteil abgebaut wird.
 *
 * @param {{kopfImBild: boolean, kopfUnterkante: number|null|undefined,
 *   kaufknopfImBild: boolean}} lage
 * @returns {boolean}
 */
export function stickySichtbar({kopfImBild, kopfUnterkante, kaufknopfImBild}) {
  if (kopfImBild) return false;
  if (typeof kopfUnterkante !== 'number' || !Number.isFinite(kopfUnterkante)) {
    return false;
  }
  if (kopfUnterkante > 0) return false;
  return !kaufknopfImBild;
}
