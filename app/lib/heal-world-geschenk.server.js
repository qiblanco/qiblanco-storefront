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
 * WARUM EINE EIGENE ABFRAGE STATT cart.get(): ein über den Permalink angelegter
 * Warenkorb liefert beim Nachlesen `discountCodes: []`, obwohl HEALWORLD5 an
 * der Zeile hängt (gemessen 01.11.2026, Korb hinter /cart/<QiOne>:1?discount=
 * HEALWORLD5: discountCodes leer, discountAllocations.code = HEALWORLD5). Der
 * Code zählt deshalb auch, wenn er nur an einer Zuteilung steht.
 *
 * FAIL-SOFT: scheitert das Nachlesen oder die Korrektur, bleibt das Ergebnis
 * der Kundenaktion unverändert — ein Lesefehler darf keinen Warenkorb leeren.
 */
const HW_KORB_QUERY = `#graphql
  query HwGeschenkKorb($cartId: ID!) {
    cart(id: $cartId) {
      id
      discountCodes {
        code
      }
      discountAllocations {
        ... on CartCodeDiscountAllocation {
          code
        }
      }
      lines(first: 100) {
        nodes {
          id
          quantity
          merchandise {
            ... on ProductVariant {
              product {
                handle
              }
            }
          }
          discountAllocations {
            ... on CartCodeDiscountAllocation {
              code
            }
          }
        }
      }
    }
  }
`;

function codesAusKorb(korb) {
  const codes = [...(korb?.discountCodes || [])];
  for (const a of korb?.discountAllocations || []) if (a?.code) codes.push(a);
  for (const z of korb?.lines?.nodes || []) {
    for (const a of z?.discountAllocations || []) if (a?.code) codes.push(a);
  }
  return codes;
}

async function korbLesen({cart, storefront, cartId}) {
  if (storefront?.query) {
    const {cart: korb} = await storefront.query(HW_KORB_QUERY, {
      variables: {cartId},
      cache: storefront.CacheNone(),
    });
    return korb;
  }
  return cart.get({cartId});
}

const HW_AKTIONEN = new Set([
  CartForm.ACTIONS.LinesAdd,
  CartForm.ACTIONS.LinesUpdate,
  CartForm.ACTIONS.LinesRemove,
  CartForm.ACTIONS.DiscountCodesUpdate,
]);

export async function bindeHealWorldGeschenk({
  cart,
  storefront,
  action,
  result,
  jetzt,
}) {
  const cartId = result?.cart?.id;
  if (!cartId) return result;
  if (!HW_AKTIONEN.has(action)) return result;
  const zeit = jetzt ?? Date.now();
  if (!hwNachlesen(zeit)) return result;

  let voll;
  try {
    voll = await korbLesen({cart, storefront, cartId});
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
    codes: codesAusKorb(voll),
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
