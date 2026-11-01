import {CartForm} from '@shopify/hydrogen';
import {geschenkKorrektur, hwNachlesen} from '~/lib/heal-world-geschenk';

/*
 * Bindet die Heal-World-Geschenk-Zeile an Geräte und Janas Code (Regel in
 * ~/lib/heal-world-geschenk.js). Aufgerufen aus der Warenkorb-Action
 * (routes/cart.jsx), dem Warenkorb-Permalink (routes/cart.$lines.jsx) und dem
 * Rabatt-Link (routes/discount.$code.jsx) — jede Stelle, an der ein Gerät oder
 * der Code in den Warenkorb kommt.
 *
 * WARUM AUCH NACH DEM RABATTCODE: der Code kann nach dem Gerät kommen (Feld im
 * Warenkorb, /discount/HEALWORLD5). Dann erscheinen die Geschenke im selben
 * Schritt; wer den Code entfernt, verliert sie.
 *
 * NUR AM AKTIONSTAG UND KURZ DANACH: außerhalb von hwNachlesen() kostet die
 * Bindung nichts (kein Nachlesen).
 *
 * DECKUNGSGRENZE, benannt: ein Kauf am Hydrogen vorbei
 * (checkout.qiblanco.com/cart/<id>:N) läuft hier nicht durch.
 *
 * FAIL-SOFT: scheitert das Nachlesen oder die Korrektur, bleibt das Ergebnis
 * der Kundenaktion unverändert — ein Lesefehler darf keinen Warenkorb leeren.
 */
const HW_AKTIONEN = new Set([
  CartForm.ACTIONS.LinesAdd,
  CartForm.ACTIONS.LinesUpdate,
  CartForm.ACTIONS.LinesRemove,
  CartForm.ACTIONS.DiscountCodesUpdate,
]);

export async function bindeHealWorldGeschenk({cart, action, result, jetzt}) {
  const cartId = result?.cart?.id;
  if (!cartId) return result;
  if (!HW_AKTIONEN.has(action)) return result;
  const zeit = jetzt ?? Date.now();
  if (!hwNachlesen(zeit)) return result;

  let voll;
  try {
    voll = await cart.get({cartId});
  } catch (e) {
    console.warn('heal-world-geschenk: Warenkorb nicht lesbar', e?.message || e);
    return result;
  }
  const nodes = voll?.lines?.nodes;
  if (!Array.isArray(nodes)) return result;
  const zeilen = nodes.map((z) => ({
    id: z.id,
    quantity: z.quantity,
    handle: z.merchandise?.product?.handle,
  }));
  const {entfernen, aendern, hinzu} = geschenkKorrektur({
    zeilen,
    codes: voll?.discountCodes,
    jetzt: zeit,
  });
  if (!entfernen.length && !aendern.length && !hinzu.length) return result;

  let neu = result;
  try {
    if (entfernen.length) neu = await cart.removeLines(entfernen, {cartId});
    if (aendern.length) neu = await cart.updateLines(aendern, {cartId});
    if (hinzu.length) neu = await cart.addLines(hinzu, {cartId});
  } catch (e) {
    console.warn('heal-world-geschenk: Korrektur gescheitert', e?.message || e);
    return result;
  }
  return neu?.cart ? neu : result;
}
