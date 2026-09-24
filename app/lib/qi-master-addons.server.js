import {CartForm} from '@shopify/hydrogen';
import {ADDON_ATTR, bindungsKorrektur} from '~/lib/qi-master-addons';

/*
 * Bindung der Qi-Master-Add-ons an den Qi Master — in der Warenkorb-Action.
 *
 * WARUM HIER: jede Warenkorb-Änderung dieser Storefront läuft durch
 * routes/cart.jsx `action`. Wer den Qi Master aus dem Warenkorb nimmt, nimmt
 * seine Add-ons mit; eine Wunschnummer steht höchstens einmal drin.
 *
 * WARUM EIN ZWEITER LESEAUFRUF: Mutationsergebnisse tragen keine Zeilen
 * (CART_MUTATE_FRAGMENT in lib/fragments.js: id, totalQuantity, checkoutUrl,
 * attributes). Gelesen wird deshalb NUR bei den drei Aktionen, die eine
 * Bindung brechen können: Entfernen, Menge ändern, und Hinzufügen MIT einer
 * Add-on-Zeile. Jeder andere Warenkorb-Klick im Laden kostet nichts.
 *
 * DECKUNGSGRENZE, benannt: ein Kauf am Hydrogen vorbei (Storefront-API
 * direkt, Warenkorb-Permalink /cart/<id>:1) läuft hier nicht durch. Den fängt
 * das Seriennummern-Register (rt qm-seriennummern-register) als Befund
 * ADDON_OHNE_QM an der Bestellung.
 *
 * FAIL-SOFT: scheitert das Nachlesen, bleibt das Ergebnis der Kundenaktion
 * unverändert — ein Lesefehler darf keinen Warenkorb leeren.
 */
export async function bindeQiMasterAddons({cart, action, inputs, result}) {
  const cartId = result?.cart?.id;
  if (!cartId) return result;
  const betroffen =
    action === CartForm.ACTIONS.LinesRemove ||
    action === CartForm.ACTIONS.LinesUpdate ||
    (action === CartForm.ACTIONS.LinesAdd &&
      (inputs?.lines || []).some((l) =>
        (l?.attributes || []).some((a) => a?.key === ADDON_ATTR),
      ));
  if (!betroffen) return result;

  let voll;
  try {
    voll = await cart.get({cartId});
  } catch {
    return result;
  }
  const zeilen = (voll?.lines?.nodes || []).map((z) => ({
    id: z.id,
    quantity: z.quantity,
    handle: z.merchandise?.product?.handle,
  }));
  const {entfernen, aendern} = bindungsKorrektur(zeilen);
  if (!entfernen.length && !aendern.length) return result;

  let neu = result;
  try {
    if (entfernen.length) neu = await cart.removeLines(entfernen, {cartId});
    if (aendern.length) neu = await cart.updateLines(aendern, {cartId});
  } catch {
    return result;
  }
  return neu?.cart ? neu : result;
}
