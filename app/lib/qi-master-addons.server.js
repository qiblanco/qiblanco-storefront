import {CartForm} from '@shopify/hydrogen';
import {addonArt, bindungsKorrektur, QM_ADDON} from '~/lib/qi-master-addons';
import {QM_STAHLKETTE} from '~/components/campaign/the-alpha-shop-daten';
import {
  nummerAusVariantenTitel,
  reservierungsSperre,
} from '~/lib/qi-alpha-reservierung';
import {RESERVIERUNGEN} from '~/lib/qi-alpha-reservierungen.server';

/*
 * Die inklusive Stahlkette (0 €, EL-20261030-ae569366) zählt in der
 * Bindungsregel als Kette: ohne Qi Alpha keine Kette, je Qi Alpha höchstens
 * eine (Gold ODER Stahl). Abgebildet über den Handle, damit die geteilte
 * Regel in lib/qi-master-addons.js unverändert bleibt.
 */
const alsBindungsHandle = (handle) =>
  handle === QM_STAHLKETTE ? QM_ADDON.kette : handle;

/*
 * Bindung der Qi-Master-Add-ons an den Qi Master — in der Warenkorb-Action
 * (routes/cart.jsx) und im Warenkorb-Permalink (routes/cart.$lines.jsx).
 *
 * WARUM HIER: jede Warenkorb-Änderung dieser Storefront läuft durch eine der
 * beiden Routen. Wer den Qi Master aus dem Warenkorb nimmt, nimmt seine
 * Add-ons mit; eine Wunschnummer steht höchstens einmal drin.
 *
 * WARUM EIN ZWEITER LESEAUFRUF: Mutationsergebnisse tragen keine Zeilen
 * (CART_MUTATE_FRAGMENT in lib/fragments.js: id, totalQuantity, checkoutUrl,
 * attributes). Gelesen wird deshalb nach JEDER Zeilen-Aktion (Hinzufügen,
 * Menge ändern, Entfernen) — eine Cart-Query je Klick. Rabattcode, Kundendaten
 * und Attribute ändern keine Zeile und kosten weiterhin nichts.
 *
 * WARUM NICHT MEHR AM ZEILEN-MERKMAL: bis 2026-09-25 las die Action beim
 * Hinzufügen nur nach, wenn eine Eingabezeile `_qm_addon` trug. Das Merkmal
 * setzt der CLIENT; ein POST an /cart ohne es legte eine Wunschnummer ohne
 * Qi Master, mit Menge 2 oder doppelt in den Warenkorb, und der direkte Weg
 * zur Kasse löste keine Nachprüfung mehr aus (K3-Widerleger s05, Versuche
 * H1/H1b/H3b/H6; Job 20260925-qm-addon-bindung-greift-nur-bei-attribut).
 * Erkannt wird ein Add-on jetzt am Produkt-Handle der GELESENEN Zeile, nie an
 * der Eingabe. Fehlt einer behaltenen Add-on-Zeile das Merkmal, setzt der
 * Server es selbst — die Bestellung trägt es dann wie auf dem regulären Weg.
 *
 * DECKUNGSGRENZE, benannt: ein Kauf am Hydrogen vorbei (Storefront-API
 * direkt, checkout.qiblanco.com/cart/<id>:1) läuft hier nicht durch. Den fängt
 * das Seriennummern-Register (rt qm-seriennummern-register) als Befund
 * ADDON_OHNE_QM/DOPPELT an der Bestellung, eine reservierte Nummer ohne den
 * Schlüssel ihres Links als RESERVIERT_FREMD.
 *
 * FAIL-SOFT: scheitert das Nachlesen, bleibt das Ergebnis der Kundenaktion
 * unverändert — ein Lesefehler darf keinen Warenkorb leeren.
 */
export const ZEILEN_AKTIONEN = new Set([
  CartForm.ACTIONS.LinesAdd,
  CartForm.ACTIONS.LinesUpdate,
  CartForm.ACTIONS.LinesRemove,
]);

export async function bindeQiMasterAddons({cart, action, result}) {
  const cartId = result?.cart?.id;
  if (!cartId) return result;
  if (!ZEILEN_AKTIONEN.has(action)) return result;

  // 250 Zeilen (Höchstwert der Storefront API je Abruf) wie cart.$lines.jsx:
  // ohne Angabe liest Hydrogen nur 100, und Shopify liefert die Zeilen in
  // umgekehrter Eingabe-Reihenfolge — eine reservierte Nummer als erste von
  // 101 Zeilen blieb so ungeprüft im Korb (Gegenprüfung 01.11.2026).
  let voll;
  try {
    voll = await cart.get({cartId, numCartLines: 250});
  } catch {
    return result;
  }
  const alle = (voll?.lines?.nodes || []).map((z) => ({
    id: z.id,
    quantity: z.quantity,
    handle: alsBindungsHandle(z.merchandise?.product?.handle),
    variantId: z.merchandise?.id,
    attributes: z.attributes,
    nummer:
      addonArt(z.merchandise?.product?.handle) === 'wunschnummer'
        ? nummerAusVariantenTitel(z.merchandise?.title)
        : null,
  }));
  // RESERVIERTE NUMMERN (Job 20261101-prio2-qi-alpha-premium-checkout-
  // reservierte-nummern-links): eine Nummer aus lib/qi-alpha-reservierungen
  // .server.js bleibt nur mit dem Schlüssel ihres persönlichen Links an der
  // Zeile. Zuerst, damit die Bindungsregel danach mit dem echten Rest rechnet.
  const gesperrt = reservierungsSperre(
    alle.filter((z) => z.nummer),
    RESERVIERUNGEN,
  );
  const zeilen = alle.filter((z) => !gesperrt.includes(z.id));
  const bindung = bindungsKorrektur(zeilen);
  const entfernen = [...gesperrt, ...bindung.entfernen];
  const aendern = bindung.aendern;
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
