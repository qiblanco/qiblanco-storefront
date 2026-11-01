/*
 * Heal-World-Geschenk 1. November 2026 (Christian 01.11.2026, Pool-Job
 * 20261101-prio1-heal-world-jana-code):
 * „pro G1, pro G-Bracelet, pro G-Home, was gekauft wird, kriegt er jeweils eine
 * Tüte" Crystal Cacao® Awake und Create, „wenn er den Code von Jana einlöst".
 *
 * REGEL: Liegt Janas Code HEALWORLD5 im Warenkorb, gehört je Gerät (QiOne® 2 Pro,
 * QiBracelet®, QiHome® Air; „2x QiOne" zählt zwei) genau eine Geschenk-Zeile
 * hinein. Die Geschenk-Zeile ist das native Bundle `awcr37shyj` (1× Awake +
 * 1× Create, Lager über die Komponenten). Den Preis 0 € setzt der
 * Shopify-Automatikrabatt auf genau dieses Bundle; er endet am 01.11. um
 * 23:59:59 Berlin von selbst.
 *
 * DIE MENGE HÄLT DER SERVER: gelesen wird der Warenkorb, nie die Eingabe. Ohne
 * Code, ohne Gerät oder außerhalb des Tages fällt jede Geschenk-Zeile heraus;
 * mehr Geschenke als Geräte gibt es nicht.
 *
 * ALTER TRÄGER: der Pitch-Link der Folie (QR) legt 2× `crystal-cacao-adfiefiale`
 * ein (Tagesbonus vom 26.10.). Am Aktionstag ersetzt die Geschenk-Zeile ihn;
 * er wird sonst nirgends verkauft.
 */

export const HW_GESCHENK = {
  handle: 'awcr37shyj',
  variantId: 'gid://shopify/ProductVariant/54552762614028',
  code: 'HEALWORLD5',
  // Berliner 01.11.2026 = 2026-10-31T23:00Z bis 2026-11-01T23:00Z (MEZ, exklusiv).
  start: Date.parse('2026-10-31T23:00:00Z'),
  ende: Date.parse('2026-11-01T23:00:00Z'),
  // Bis hierhin liest die Bindung den Warenkorb nach, damit eine übrig
  // gebliebene Geschenk-Zeile nach dem Tag noch herausfällt.
  nachlauf_bis: Date.parse('2026-11-03T00:00:00Z'),
  alt_traeger: 'crystal-cacao-adfiefiale',
  attr: '_hw_geschenk',
  attr_wert: 'heal-world-0111',
};

/** Geräte je Zeilen-Einheit, nach Produkt-Handle (Global Deutsch-Shop). */
export const HW_GERAETE = {
  'qione-2-pro': 1,
  '8kendiw34hd': 2, // Angebot: 2x QiOne® 2 Pro
  pjdz538hgs0: 1, // Angebot: QiOne® 2 Pro + Necklace
  qibracelet: 1,
  'qihome-air': 1,
};

export function istHwGeschenk(handle) {
  return handle === HW_GESCHENK.handle;
}

export function hwAktiv(jetzt) {
  const t = jetzt instanceof Date ? jetzt.getTime() : Number(jetzt);
  return t >= HW_GESCHENK.start && t < HW_GESCHENK.ende;
}

export function hwNachlesen(jetzt) {
  const t = jetzt instanceof Date ? jetzt.getTime() : Number(jetzt);
  return t >= HW_GESCHENK.start && t < HW_GESCHENK.nachlauf_bis;
}

export function hwCodeDa(codes) {
  return (codes || []).some(
    (c) => String(c?.code || '').trim().toUpperCase() === HW_GESCHENK.code,
  );
}

export function hwGeraete(zeilen) {
  let n = 0;
  for (const z of zeilen || []) {
    const je = HW_GERAETE[z.handle] || 0;
    const menge = Number(z.quantity) || 0;
    if (je > 0 && menge > 0) n += je * menge;
  }
  return n;
}

/**
 * @param {{zeilen: Array<{id: string, quantity: number, handle: string}>,
 *   codes: Array<{code: string}>, jetzt: Date|number}} lage
 * @returns {{soll: number, entfernen: string[],
 *   aendern: Array<{id: string, quantity: number}>,
 *   hinzu: Array<{merchandiseId: string, quantity: number,
 *     attributes: Array<{key: string, value: string}>}>}}
 */
export function geschenkKorrektur({zeilen, codes, jetzt}) {
  const aktiv = hwAktiv(jetzt);
  const soll = aktiv && hwCodeDa(codes) ? hwGeraete(zeilen) : 0;
  const entfernen = [];
  const aendern = [];
  const hinzu = [];

  const geschenk = (zeilen || []).filter((z) => istHwGeschenk(z.handle));
  if (soll > 0) {
    const [erste, ...rest] = geschenk;
    if (!erste) {
      hinzu.push({
        merchandiseId: HW_GESCHENK.variantId,
        quantity: soll,
        attributes: [{key: HW_GESCHENK.attr, value: HW_GESCHENK.attr_wert}],
      });
    } else if (Number(erste.quantity) !== soll) {
      aendern.push({id: erste.id, quantity: soll});
    }
    for (const z of rest) entfernen.push(z.id);
  } else {
    for (const z of geschenk) entfernen.push(z.id);
  }
  if (aktiv) {
    for (const z of zeilen || []) {
      if (z.handle === HW_GESCHENK.alt_traeger) entfernen.push(z.id);
    }
  }
  return {soll, entfernen, aendern, hinzu};
}
