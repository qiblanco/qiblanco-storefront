import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {Money} from '@shopify/hydrogen';
import {crossSellVorschlag} from '~/components/reusables/cartCrossSell';

/**
 * The main cart component that displays the cart items and summary.
 * It is used by both the /cart route and the cart aside dialog.
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // The useOptimisticCart hook applies pending actions to the cart
  // so the user immediately sees feedback when they modify the cart.
  const cart = useOptimisticCart(originalCart);

  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const withDiscount =
    cart &&
    Boolean(cart?.discountCodes?.filter((code) => code.applicable)?.length);
  const className = `cart-main ${withDiscount ? 'with-discount' : ''}`;
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;

  return (
    <div className={className}>
      <CartEmpty hidden={linesCount} layout={layout} />
      {cartHasItems && <FreeShipping cart={cart} />}
      <div className="cart-details">
        <div aria-labelledby="cart-lines">
          <ul>
            {(cart?.lines?.nodes ?? []).map((line) => (
              <CartLineItem key={line.id} line={line} layout={layout} />
            ))}
          </ul>
        </div>
      </div>
      {cartHasItems && <CrossSellHinweis cart={cart} />}
      {cartHasItems && <CartSummary cart={cart} layout={layout} />}
    </div>
  );
}

/**
 * @param {{
 *   hidden: boolean;
 *   layout?: CartMainProps['layout'];
 * }}
 */
function CartEmpty({hidden = false}) {
  const {close} = useAside();
  return (
    <div hidden={hidden}>
      <br />
      <p>
        Dein Warenkorb ist zurzeit leer!
      </p>
      <br />
    </div>
  );
}

// Beide Zahlen stammen aus DERSELBEN Quelle — der Versandpolicy des DACH-Shops
// (checkout.qiblanco.com/policies/shipping-policy, live nachgemessen über
// /cart/shipping_rates.json am 2026-08-12): Deutschland 5,90 EUR, ab 99 EUR
// versandkostenfrei. Sie stehen deshalb nebeneinander statt verstreut: vorher
// lag die Schwelle im Rechenweg und der Versandpreis als Textliteral tief im
// JSX — und dieses Literal war mit "4,96" der NETTO-Betrag (5,90 / 1,19), dem
// B2C-Kunden also zu niedrig ausgewiesen. Wer eine der Zahlen anfasst, sieht
// jetzt die andere.
const SCHWELLE_DE = 99;
const VERSAND_DE = '5,90';

function FreeShipping({cart}){
  // Die Schwelle gilt ausschließlich für Deutschland — Österreich (6,90 EUR)
  // und die Schweiz (21,00 EUR) haben überhaupt keine. Der Währungs-Riegel
  // unten blendet den Banner in Nicht-EUR-Märkten aus (CHF/USD) und fängt
  // damit die Schweiz, NICHT aber Österreich: das kauft ebenfalls in EUR und
  // sähe hier sonst einen Fortschrittsbalken auf ein Versprechen zu, das der
  // Checkout ihm nie einlöst. Deshalb nennt jeder Satz das Land ausdrücklich.
  if ((cart?.cost?.subtotalAmount?.currencyCode ?? "EUR") !== "EUR") {
    return null;
  }
  let subtotal = parseFloat(cart?.cost?.subtotalAmount?.amount || "0");
  let difference = SCHWELLE_DE - subtotal;
  let progress = (subtotal / SCHWELLE_DE) * 100;

  let diffMoney = {
    amount: difference.toFixed(2),
    currencyCode: cart?.cost?.subtotalAmount?.currencyCode ?? "EUR",
  };

  if(difference <= 0){
    progress = 100;
    return;
  }

  return (
    <div className="free-shipping-wrapper">
      <small className="free-shipping-header"> 
        Nur noch <b><Money data={diffMoney} /></b> bis zum kostenlosen Versand innerhalb Deutschlands!
      </small>
      <div className="freeshipping-tracker-and-icon">
        <div className="free-shipping-progress">
          <div className="free-shipping-tracker" style={{width: `${progress}%`}}></div>
        </div>
        <div className="svg"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><g fill="currentColor"><path d="M128 129.09V232a8 8 0 0 1-3.84-1l-88-48.18a8 8 0 0 1-4.16-7V80.18a8 8 0 0 1 .7-3.25Z" opacity={0.2}></path><path d="m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44l-29.77 16.3l-80.35-44Zm0 88L47.66 76l33.9-18.56l80.34 44ZM40 90l80 43.78v85.79l-80-43.75Zm176 85.78l-80 43.79v-85.75l32-17.51V152a8 8 0 0 0 16 0v-44.45L216 90v85.77Z"></path></g></svg></div>
      </div> 
      <small className="free-shipping-footer">
        Versandkosten innerhalb von Deutschland: €{VERSAND_DE}
      </small>
    </div>
  )
}

/*
 * CROSS-SELL IM WARENKORB (Doing pdf-cross-selling-...#006, Job
 * nachhol-pdf-cross-selling-zwei-saeulen-ein-funda-006).
 *
 * WARUM HIER UND NICHT AUF DER DANKE-SEITE: Das Konzept nennt als wirksamsten
 * Ort die Danke-Seite. Die liegt aber auf checkout.qiblanco.com (Shopify) und
 * ist nur über eine Checkout-UI-Extension erreichbar — Partner-Dashboard-
 * Deploy, also Perimeter/R3 und nicht autonom. Der Warenkorb ist die letzte
 * Flaeche im Kaufpfad, die WIR ausliefern. Er trägt dieselbe These: gemessen
 * 12 Kaeufer haben Geraet und Kakao am SELBEN Tag gekauft, der gemeinsame
 * Checkout existiert also real (postkauf.db, 2026-08-18).
 *
 * BESITZ-BEWUSST (Prinzip aus dem postkauf-manager): vorgeschlagen wird immer
 * nur die Saeule, die NICHT schon im Warenkorb liegt. Liegen beide drin, ist
 * der Kunde bereits Beide-Kaeufer und bekommt nichts — kein Nachfassen auf
 * etwas, das er schon hat.
 *
 * DREI BAULICHE AUFLAGEN, die aus echten Fallen stammen:
 * (1) CartMain rendert NICHT nur /cart, sondern auch den Cart-Aside auf JEDER
 *     Seite (PageLayout.jsx). Ein Fehler hier wäre seitenweit sichtbar —
 *     deshalb ist die Funktion total: jeder Fehler endet in `return null`,
 *     der Warenkorb bleibt in jedem Fall stehen.
 * (2) KEIN AddToCart. Nur ein Link auf die Produktseite. Ein eigener
 *     Warenkorb-Schreibpfad würde an `persistAttributionOnCartResult`
 *     (routes/cart.jsx) vorbeilaufen und die Attributions-Naht beschaedigen —
 *     exakt die _qpx_anon-Fehlerklasse. Es wird kein Identitaets-/Tracking-Key
 *     gesetzt, gelesen oder weitergereicht.
 * (3) Kakao und Geraet stehen NIE im selben Satz. Das ist nicht Kosmetik,
 *     sondern GL-DES-0009 Evidenz-Hygiene (claim-korridor crystal-cacao-de
 *     EU-S08): der Kakao leiht sich nie die Geraete-Evidenz.
 */
function CrossSellHinweis({cart}) {
  try {
    const v = crossSellVorschlag(cart?.lines?.nodes);
    if (!v) return null;

    return (
      <aside className="cart-crosssell" data-section="cart-crosssell">
        <small className="cart-crosssell-titel">{v.titel}</small>
        <p className="cart-crosssell-text">{v.text}</p>
        <Link className="cart-crosssell-link" to={v.ziel} prefetch="intent">
          {v.linkText}
        </Link>
      </aside>
    );
  } catch {
    // Auflage (1): der Warenkorb steht in jedem Fall.
    return null;
  }
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
