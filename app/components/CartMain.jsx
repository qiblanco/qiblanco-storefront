import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {formatPreis} from '~/lib/markt-pricing';
import {taxRateForHandle} from '~/lib/cart-display-pricing';
import {istBrutto} from '~/lib/preismodus';

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
// versandkostenfrei. Die 99 sind NETTO (Warenwert vor Mehrwertsteuer), solange
// der Shop im Preismodus netto steht (lib/preismodus.js):
// nachgemessen 2026-09-23 an cartCreate/deliveryGroups, 2x Kakao mit Subtotal
// 114,02 netto ist frei (Job 20260923-bot-versandfakten-gegen-rate-engine-prio40).
// Sie stehen deshalb nebeneinander statt verstreut: vorher
// lag die Schwelle im Rechenweg und der Versandpreis als Textliteral tief im
// JSX — und dieses Literal war mit "4,96" der NETTO-Betrag (5,90 / 1,19), dem
// B2C-Kunden also zu niedrig ausgewiesen. Wer eine der Zahlen anfasst, sieht
// jetzt die andere.
const SCHWELLE_DE = 99;
const VERSAND_DE = '5,90';

function FreeShipping({cart}){
  // Dieser Banner zeigt nur die deutsche Schwelle. Österreich hat eine eigene
  // (6,90 EUR bis 250 EUR netto, Geräte dort ohnehin versandkostenfrei), die
  // Schweiz rechnet in CHF (9 bzw. 21 CHF, ohne Schwelle); gemessen 2026-09-23
  // an cartCreate/deliveryGroups, Stand wie die FAQ seit PR #590.
  // Der Währungs-Riegel
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

  // ANZEIGE IN BRUTTO: Schwelle und Rechenweg sind netto (subtotalAmount im
  // Netto-Shop), jede andere Zahl im Warenkorb steht aber brutto da. Bis
  // 2026-09-23 stand hier die Netto-Differenz ("Nur noch 20,01 €" beim Necklace
  // für 94 €). Aufgeschlagen wird der Regelsatz: fehlt der Rest mit Kakao
  // (ermäßigter Satz), reicht sogar etwas weniger. Der Betrag ist damit eine
  // Obergrenze und nie zu klein.
  // PREISMODUS brutto (s02 Grossjob 20260924-kasse-zeigt-bruttopreise-...):
  // subtotalAmount ist dann schon brutto, und Shopify vergleicht die
  // Versandschwelle gegen genau diese Zahl -- kein Aufschlag mehr. Die 99 bleibt
  // die Zahl, die in der Shopify-Versandrate steht; zieht jemand sie dort auf
  // brutto (117,81), muss SCHWELLE_DE im selben Zug mit (offene Flanke s04).
  const diffBrutto = istBrutto()
    ? difference
    : difference * (1 + taxRateForHandle(null, 'DE'));
  // Geschrieben wie Zeile und Zwischensumme ("23,81 €", CartSummary nutzt
  // denselben Formatierer). <Money> schrieb hier "€23.81" neben "94,00 €".
  const diffText = formatPreis(diffBrutto, 'EUR', 'cart-cent');

  if(difference <= 0){
    progress = 100;
    return;
  }

  return (
    <div className="free-shipping-wrapper">
      <small className="free-shipping-header"> 
        Nur noch <b>{diffText}</b> bis zum kostenlosen Versand innerhalb Deutschlands!
      </small>
      <div className="freeshipping-tracker-and-icon">
        <div className="free-shipping-progress">
          <div className="free-shipping-tracker" style={{width: `${progress}%`}}></div>
        </div>
        <div className="svg"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><g fill="currentColor"><path d="M128 129.09V232a8 8 0 0 1-3.84-1l-88-48.18a8 8 0 0 1-4.16-7V80.18a8 8 0 0 1 .7-3.25Z" opacity={0.2}></path><path d="m223.68 66.15l-88-48.15a15.88 15.88 0 0 0-15.36 0l-88 48.17a16 16 0 0 0-8.32 14v95.64a16 16 0 0 0 8.32 14l88 48.17a15.88 15.88 0 0 0 15.36 0l88-48.17a16 16 0 0 0 8.32-14V80.18a16 16 0 0 0-8.32-14.03M128 32l80.34 44l-29.77 16.3l-80.35-44Zm0 88L47.66 76l33.9-18.56l80.34 44ZM40 90l80 43.78v85.79l-80-43.75Zm176 85.78l-80 43.79v-85.75l32-17.51V152a8 8 0 0 0 16 0v-44.45L216 90v85.77Z"></path></g></svg></div>
      </div> 
      <small className="free-shipping-footer">
        Versandkosten innerhalb von Deutschland: {VERSAND_DE} €
      </small>
    </div>
  )
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
