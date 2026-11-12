import {bfDeal, bfDealZeitAktiv} from './bf-deals-daten.js';

/*
 * BF-CODES JE DEAL, NUR AM SERVER (Elina EL-20261112-5c71f6ff, GO 12.11.2026:
 * „Deals müssen KOMBINIERBAR sein … Rabatte gelten je Deal nur auf dessen
 * Produkte … mehrere Deal-Rabatte gleichzeitig im selben Warenkorb … Rabatt nur
 * über Deal-Weg“).
 *
 * Alle Codes sind in Shopify „kombinierbar mit Produktrabatten“ und rabattieren
 * je Stück genau ein Produkt. Ohne Shopify Plus trägt ein Produkt im Warenkorb
 * nur EINEN Code (gemessen 12.11.: zwei Codes auf dem QiOne 2 Pro = „wird nicht
 * gewährt“). Darum teilen 2x QiOne 2 Pro und QiOne 2 Pro + Necklace einen
 * Stück-Code: −99 € je QiOne 2 Pro (2 × 1.087 − 198 = 1.976 €;
 * 1.087 − 99 + 94 = 1.082 €). Gemessen in der Storefront-API am 12.11.:
 * 2x Pro + Pro/Necklace + Kakao = 3.134 € = 1.976 + 1.082 + 76.
 *
 * Die Codes stehen nur hier (Server-Bündel), nie im HTML und nie im Browser.
 */
const BF_DEAL_CODES = {
  '2x-qione-2-pro': ['BF26-PRO-13GLX'],
  'qione-2-pro-necklace': ['BF26-PRO-13GLX'],
  qibracelet: ['BF26-BRACELET-GM5JJ'],
  'qihome-air': ['BF26-QIHOME-2DP8H'],
  kakao: ['BF26-KAKAO-NKSKX'],
};

/** Codes eines Deals, nur im Zeitfenster; sonst leer. */
export function bfDealCodes(dealId, jetzt = Date.now()) {
  if (!bfDeal(dealId) || !bfDealZeitAktiv(jetzt)) return [];
  return BF_DEAL_CODES[dealId] ?? [];
}

/**
 * Codes, die der Warenkorb nach dem Hinzufügen eines Deals trägt: alle
 * vorhandenen (andere Deals bleiben rabattiert) plus die des neuen Deals,
 * ohne Doppel. null = nichts zu ändern.
 */
export function bfDealCodesNachHinzufuegen(vorhanden, dealId, jetzt = Date.now()) {
  const neu = bfDealCodes(dealId, jetzt);
  if (!neu.length) return null;
  const alle = [];
  for (const c of [...(vorhanden ?? []), ...neu]) {
    const code = String(c ?? '').trim();
    if (code && !alle.some((x) => x.toUpperCase() === code.toUpperCase())) alle.push(code);
  }
  const vorher = (vorhanden ?? []).map((c) => String(c).toUpperCase());
  return alle.every((c) => vorher.includes(c.toUpperCase())) ? null : alle;
}
