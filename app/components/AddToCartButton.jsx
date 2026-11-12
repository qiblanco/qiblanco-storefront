import {CartForm} from '@shopify/hydrogen';
import {useBfDealSeite} from '~/components/black-friday-2026/DealGalerie';
import {bfDealZeilen} from '~/components/black-friday-2026/bf-deals-daten';

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
  // BF-DEAL-SEITE (Elina EL-20261111-aff06215; seit EL-20261112-5c71f6ff
  // Warenkorb statt Kasse): der Knopf legt die Zeilen DES DEALS (Einzelprodukte,
  // Merkmal _bf_deal) in den Warenkorb, nie das Basisprodukt; die BF-Codes setzt
  // der Server dazu (bfDeal). Ohne Zeilen für die Wahl (ausverkaufte
  // Kettenlänge) bleibt er gesperrt. Ohne Kontext (jede andere Seite): wie bisher.
  const dealSeite = useBfDealSeite();
  if (dealSeite) {
    const dealZeilen = disabled ? [] : bfDealZeilen(dealSeite, lines);
    if (!dealZeilen.length) {
      return (
        <button className="btn--primary" data-qb-kaufknopf="" type="button" disabled>
          Ausverkauft
        </button>
      );
    }
    return (
      <CartForm
        route="/cart"
        inputs={{lines: dealZeilen, bfDeal: dealSeite.deal}}
        action={CartForm.ACTIONS.LinesAdd}
      >
        {(fetcher) => (
          <button
            className="btn--primary bf-deal-kaufen"
            data-qb-kaufknopf=""
            data-bf-deal-warenkorb={dealSeite.deal}
            type="submit"
            onClick={onClick}
            disabled={fetcher.state !== 'idle'}
          >
            In den Warenkorb
          </button>
        )}
      </CartForm>
    );
  }

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

/** @typedef {import('react-router').FetcherWithComponents} FetcherWithComponents */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLineInput} OptimisticCartLineInput */
