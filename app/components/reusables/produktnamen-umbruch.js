/**
 * PRODUKTNAMEN NIE TRENNEN (Christian 22.11.2026, Job 20261122-prio1-shop-
 * design-header-flagge-waehrung-iphone-knoepfe-umbruch-us-glanz-bf-store):
 * „das wieder G1.1 und dann ist das 1 in der neuen Zeile … idealerweise
 * vermeidet man solche Zeilenumbrüche, wo man so einen Namen auseinander macht.“
 *
 * Ersetzt in Textknoten die Leerzeichen INNERHALB fester Wortgruppen durch
 * ein geschütztes Leerzeichen (U+00A0): Produktnamen mit Nummer/Zusatz und
 * Zahl + Einheit. Läuft erst nach der Hydration (root.jsx, useEffect) und
 * danach für jeden neuen Text (MutationObserver), damit React beim Hydrieren
 * denselben Text sieht wie der Server. Idempotent: ein zweiter Lauf ändert
 * nichts mehr.
 *
 * QUELLE DER MUSTER für beide Shops: diese Datei. Der Global Englisch-Shop
 * trägt eine Kopie (us-qiblanco-2024 assets/produktnamen-umbruch.js) mit
 * denselben Mustern plus den englischen Einheiten.
 * Reine Funktion `schuetze` ohne DOM: node --test-fähig
 * (test/produktnamen-umbruch.test.mjs).
 */

const NB = ' ';

/**
 * Muster: jede Gruppe ist eine Folge von Wörtern, zwischen denen nie
 * umbrochen werden darf. Das ® darf direkt am Namen oder mit hochgestelltem
 * Zeichen stehen; Leerzeichen auch schon geschützt (idempotent).
 */
const LZ = '[ \\u00A0]+';
export const MUSTER = [
  // QiOne® 1 / QiOne 2 / QiOne® 2 Pro / QiOne® 2 Pro Kette
  new RegExp(`QiOne®?${LZ}\\d+(?:${LZ}Pro)?(?:${LZ}(?:Kette|Necklace))?`, 'g'),
  // Qi Alpha® (Qi + Alpha), Qi Blanco, Qi Master
  new RegExp(`Qi${LZ}(?:Alpha|Blanco|Master)®?`, 'g'),
  // QiHome Air
  new RegExp(`QiHome®?${LZ}Air`, 'g'),
  // Zahl + Einheit / Zählwort (deutsch und englisch)
  new RegExp(
    `\\d+(?:[.,]\\d+)?${LZ}(?:Prozent|percent|%|Tage|Tagen|days|Stunden|hours|Minuten|minutes|Jahre|Jahren|years|Wochen|weeks|Monate|Monaten|months|mm|cm|m|km|g|kg|mg|Hz|GHz|MHz|€|EUR|CHF|USD|THB|GBP|Studien|studies|Bewertungen|reviews|x|×)(?![\\p{L}\\d])`,
    'gu',
  ),
];

/**
 * Schützt alle Wortgruppen in einem Text.
 * @param {string} text
 * @returns {string}
 */
export function schuetze(text) {
  if (!text || !/\s/.test(text)) return text;
  let aus = text;
  for (const m of MUSTER) {
    m.lastIndex = 0;
    aus = aus.replace(m, (treffer) => treffer.replace(/ +/g, NB));
  }
  return aus;
}

/**
 * Text direkt hinter einem abgesetzten ®: das führende Leerzeichen vor der
 * Nummer bzw. vor „Air“/„Pro“ wird geschützt („QiOne® 2 Pro“).
 * @param {string} text
 * @returns {string}
 */
export function nachMarke(text) {
  return String(text || '').replace(
    /^[ \u00A0]+(?:\d+(?:[ \u00A0]+Pro)?|Air|Pro)(?![\p{L}])/u,
    (t) => t.replace(/ +/g, NB),
  );
}

const UEBERSPRINGEN = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'NOSCRIPT', 'TEMPLATE']);

function bearbeiteKnoten(knoten) {
  if (knoten.nodeType === 3) {
    const p = knoten.parentNode;
    if (!p || UEBERSPRINGEN.has(p.nodeName) || p.isContentEditable) return;
    const alt = knoten.nodeValue;
    let neu = schuetze(alt);
    // Das ® steht oft als eigenes <sup> (MarkeR): „QiOne“<sup>®</sup>„ 1.“.
    // Dann beginnt der nächste Textknoten mit dem Leerzeichen vor der Nummer.
    const vor = knoten.previousSibling;
    if (vor && vor.nodeType === 1 && /^\s*®\s*$/.test(vor.textContent || '')) {
      neu = nachMarke(neu);
    }
    if (neu !== alt) knoten.nodeValue = neu;
    return;
  }
  if (knoten.nodeType !== 1 || UEBERSPRINGEN.has(knoten.nodeName)) return;
  const gaenger = knoten.ownerDocument.createTreeWalker(knoten, 4);
  let t = gaenger.nextNode();
  while (t) {
    bearbeiteKnoten(t);
    t = gaenger.nextNode();
  }
}

/**
 * Startet den Schutz für das ganze Dokument. Gibt eine Stopp-Funktion zurück.
 * Wirft nie: ein Fehler lässt die Seite unberührt.
 * @param {Document} doc
 */
export function starteUmbruchSchutz(doc) {
  try {
    if (!doc?.body) return () => {};
    bearbeiteKnoten(doc.body);
    const beobachter = new MutationObserver((liste) => {
      for (const m of liste) {
        if (m.type === 'characterData') bearbeiteKnoten(m.target);
        else m.addedNodes.forEach(bearbeiteKnoten);
      }
    });
    beobachter.observe(doc.body, {childList: true, subtree: true, characterData: true});
    return () => beobachter.disconnect();
  } catch {
    return () => {};
  }
}
