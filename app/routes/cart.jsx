import {useLoaderData} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import {data} from '@shopify/remix-oxygen';
import {CartMain} from '~/components/CartMain';
import {persistAttributionOnCartResult} from '~/lib/cart-attribution.server';

/**
 * @type {MetaFunction}
 */
export const meta = () => {
  // Stand vorher: `Hydrogen | Cart` — der Vorgabewert des Hydrogen-Starters. Er
  // stand englisch UND mit dem Namen des Frameworks im Browser-Tab und in der
  // Google-Trefferzeile der deutschen Storefront. Das Muster hier ist das der
  // übrigen Routen (agb, datenschutz, pages.$handle, partner): "<Seite> | Qi Blanco".
  return [{title: 'Warenkorb | Qi Blanco'}];
};

/**
 * @type {HeadersFunction}
 */
export const headers = ({actionHeaders}) => actionHeaders;

/**
 * @param {ActionFunctionArgs}
 */
export async function action({request, context}) {
  const {cart, env} = context;

  const formData = await request.formData();

  const {action, inputs} = CartForm.getFormInput(formData);

  if (!action) {
    throw new Error('No action provided');
  }

  let status = 200;
  let result;

  switch (action) {
    case CartForm.ACTIONS.LinesAdd: {
      result = await cart.addLines(inputs.lines);
      const discountCode =
        typeof inputs.discountCode === 'string' ? inputs.discountCode.trim() : '';
      const clearDiscountCodes = inputs.clearDiscountCodes === true;

      if (discountCode && result?.cart?.totalQuantity > 0) {
        result = await cart.updateDiscountCodes([discountCode]);
      } else if (clearDiscountCodes && result?.cart?.totalQuantity > 0) {
        result = await cart.updateDiscountCodes([]);
      }
      break;
    }
    case CartForm.ACTIONS.LinesUpdate:
      result = await cart.updateLines(inputs.lines);
      break;
    case CartForm.ACTIONS.LinesRemove:
      result = await cart.removeLines(inputs.lineIds);
      break;
    case CartForm.ACTIONS.DiscountCodesUpdate: {
      const formDiscountCode = inputs.discountCode;

      // User inputted discount code
      const discountCodes = formDiscountCode ? [formDiscountCode] : [];

      // Combine discount codes already applied on cart
      discountCodes.push(...inputs.discountCodes);

      result = await cart.updateDiscountCodes(discountCodes);
      break;
    }
    case CartForm.ACTIONS.GiftCardCodesUpdate: {
      const formGiftCardCode = inputs.giftCardCode;

      // User inputted gift card code
      const giftCardCodes = formGiftCardCode ? [formGiftCardCode] : [];

      // Combine gift card codes already applied on cart
      giftCardCodes.push(...inputs.giftCardCodes);

      result = await cart.updateGiftCardCodes(giftCardCodes);
      break;
    }
    case CartForm.ACTIONS.BuyerIdentityUpdate: {
      result = await cart.updateBuyerIdentity({
        ...inputs.buyerIdentity,
      });
      break;
    }
    default:
      throw new Error(`${action} cart action is not defined`);
  }

  result = await persistAttributionOnCartResult({cart, request, env, result});

  const cartId = result?.cart?.id;
  const headers = cartId ? cart.setCartId(result.cart.id) : new Headers();
  const {cart: cartResult, errors, warnings} = result;

  const redirectTo = formData.get('redirectTo') ?? null;
  if (typeof redirectTo === 'string') {
    status = 303;
    headers.set('Location', redirectTo);
  }

  return data(
    {
      cart: cartResult,
      errors,
      warnings,
      analytics: {
        cartId,
      },
    },
    {status, headers},
  );
}

/**
 * @param {LoaderFunctionArgs}
 */
export async function loader({context}) {
  const {cart} = context;
  return await cart.get();
}

export default function Cart() {
  /** @type {LoaderReturnData} */
  const cart = useLoaderData();

  // `.cart` ist der SEITENRAHMEN (Shop-Breite, Seitenabstand), `.cart-page-inner`
  // die INHALTSSPALTE in Drawer-Geometrie. Zwei Ebenen, weil beides verschiedene
  // Aufgaben hat: der Rahmen bindet die Seite an das Breitensystem des Shops, die
  // Spalte hält Label und Betrag beieinander. Die Überschrift steht MIT in der
  // Spalte — stünde sie im Rahmen, begänne sie 470 px links von der Produktzeile.
  return (
    <div className="cart">
      <div className="cart-page-inner">
        {/* Stand vorher: <h1>Cart</h1> — englisch auf der deutschen Storefront,
            während der Drawer daneben korrekt "Warenkorb" sagt. Bleibt bewusst
            ein <h1> (genau eine Hauptüberschrift je Seite) und behält damit die
            h1-Skala des Shops; der Drawer nutzt <h3>, weil er ein Dialog ist. */}
        <h1>Warenkorb</h1>
        <CartMain layout="page" cart={cart} />
      </div>
    </div>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/hydrogen').CartQueryDataReturn} CartQueryDataReturn */
/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').ActionFunctionArgs} ActionFunctionArgs */
/** @typedef {import('@shopify/remix-oxygen').HeadersFunction} HeadersFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
