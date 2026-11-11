// ERZEUGT von crystal-cacao-node/bin/spiegel-nachzug aus crystal-cacao-node/repo/app/components/AddToCartButton.jsx
// NICHT VON HAND AENDERN: die Quelle ist crystal-cacao.com, Herkunft in SPIEGEL.json.
import {CartForm} from '@shopify/hydrogen';

/**
 * @param {{
 *   analytics?: unknown;
 *   children: React.ReactNode;
 *   clearDiscountCodes?: boolean;
 *   disabled?: boolean;
 *   discountCode?: string;
 *   lines: Array<OptimisticCartLineInput>;
 *   onClick?: () => void;
 * }}
 */
export function AddToCartButton({
  analytics,
  children,
  clearDiscountCodes,
  disabled,
  discountCode,
  lines,
  onClick,
}) {
  const inputs = {
    lines,
    ...(discountCode ? {discountCode} : {}),
    ...(clearDiscountCodes ? {clearDiscountCodes: true} : {}),
  };

  return (
    <CartForm
      route="/cart"
      inputs={inputs}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher) => (
        <>
          <input
            name="analytics"
            type="hidden"
            value={JSON.stringify(analytics)}
          />
          {/* data-qb-kaufknopf: daran erkennt KaufknopfChatSignal den
              Kaufknopf und unterdrückt das Chat-Widget, solange es ihn
              überdeckt. */}
          <button className='btn--primary'
            data-qb-kaufknopf=""
            type="submit"
            onClick={onClick}
            disabled={disabled ?? fetcher.state !== 'idle'}
          >
            {children}
          </button>
        </>
      )}
    </CartForm>
  );
}

/** @typedef {import('~/crystal-spiegel-rahmen/router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
