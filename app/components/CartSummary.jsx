import {useEffect, useState} from 'react';
import {Form} from 'react-router';
import {getCartLineGrossDisplayTotalExact} from '~/lib/cart-display-pricing';
import {formatPreis} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {cartLineContentIds} from '~/lib/pixel-content';
import {qpxTrack, buildInitiateCheckoutEvent} from '~/lib/qpx-commerce';
import {versandhinweisFürLinien} from '~/lib/vorbestellung';
import {KasseImBrowser} from '~/components/reusables/KasseImBrowser';

/**
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  // Der Warenkorb rechnet den Bruttobetrag selbst (Netto-Shop) und braucht
  // dafür den Satz des aufgeloesten Marktes -- in AT 20 statt 19 Prozent.
  const marktLand = useMarktLand();
  const className =
    layout === 'page' ? 'cart-summary-page' : 'cart-summary-aside';

  // Cent-genau statt "1.087,- €" (aiceo:digest54:p3, Option c, 2026-09-10):
  // die Kasse belastet den Cent-Betrag, die Zwischensumme muss ihn zeigen.
  // Format als "159,63 €" / "1.048 CHF" / "$1,383" (ganz ohne Nachkommastellen,
  // Christian 13.10.2026).
  const formatEuroPrice = (money) => {
    if (!money?.amount) return '';
    const amount = parseFloat(money.amount);
    // Nie "0 €" als Summe (Designstandard, Baustein schublade, Zustand
    // `lädt`; Register F-056): solange der Server die neue Zeile noch nicht
    // bestätigt hat, hat sie keinen Preis, und die Summe läge kurz bei 0.
    if (!Number.isFinite(amount) || amount <= 0) return '';
    return formatPreis(amount, money.currencyCode || 'EUR', 'cart-cent') || '';
  };

  const lines = cart?.lines?.nodes ?? [];
  const correctedTotal = lines.reduce(
    (total, line) => total + getCartLineGrossDisplayTotalExact(line, marktLand),
    0,
  );

  const currencyCode = cart.cost?.subtotalAmount?.currencyCode ?? 'EUR';
  const taxedSubtotal = {amount: correctedTotal.toFixed(2), currencyCode};

  return (
    <div aria-labelledby="cart-summary" className={className}>
      <div className="cart-aside-subtotal">
       <div>Zwischensumme:</div> {formatEuroPrice(taxedSubtotal)}
      </div>
      {/* Zwei Vertrauenszeilen unmittelbar über dem Kaufbutton.
          Der früher dazwischenstehende Punkt-Trenner (div.trenner) ist
          ersatzlos entfallen: sobald der erste Hinweis umbrach, setzte
          `align-items:center` ihn zwischen die Zeilen, wo er wie ein verirrtes
          Komma aussah. Gestapelt braucht es ihn nicht.
          "versichterter" war ein Tippfehler und stand damit auf jeder Seite des
          Shops direkt über dem Kaufbutton. */}
      <div className="cart-delivery-notes">
        {/* Die Lieferzusage hängt am Inhalt des Warenkorbs, nicht an einer
            festen Zeile: liegt eine Vorbestellung darin, nennt sie deren
            Termin, sonst bleibt es beim Standard. Beide Wortlaute stehen in
            ~/lib/vorbestellung — derselben Quelle, aus der CartLineItem den
            Zeilentitel zieht, und bewusst nicht hier. */}
        <small className="additional-delivery-notice">
          {versandhinweisFürLinien(lines)}
        </small>
        <small className="additional-delivery-notice">
          100&nbsp;% versicherter Versand!
        </small>
      </div>
      <CartCheckoutActions
        checkoutUrl={cart.checkoutUrl}
        subtotal={taxedSubtotal}
        numItems={lines.length}
        contentIds={cartLineContentIds(lines)}
      />
      {/* Direkt unter dem Kassenknopf und nur im Instagram-/Facebook-Browser:
          der Weg zu Apple Pay / Google Pay führt über die Kasse, nicht über
          diesen Warenkorb (Begründung und Rückweg in reusables/KasseImBrowser.jsx). */}
      {cart.checkoutUrl ? <KasseImBrowser layout={layout} /> : null}
      <PaymentMethods />
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string, subtotal?: {amount: string, currencyCode: string}, numItems?: number, contentIds?: string[]}}
 */
/**
 * Rückweg-Schalter (Job 20261031-meta-capi-luecken-dach-bau-ai-server-prio10):
 * false = InitiateCheckout kommt im Global Deutsch-Shop nur von der Shopify-
 * Meta-App an der Kasse (eine Quelle, gemeinsame Id Browser/Server). true =
 * der Storefront feuert wieder sein eigenes fbq-InitiateCheckout (Stand vor dem
 * 2026-10-31, Meta zählt dann doppelt). Das qpx-initiate_checkout darunter
 * läuft in beiden Stellungen unverändert: es ist der eigene Mess-Zeuge.
 */
export const STOREFRONT_IC_FBQ = false;

function CartCheckoutActions({
  checkoutUrl,
  subtotal,
  numItems,
  contentIds,
}) {
  // Der Tracker hält den Ankunfts-Zustand als reine Fenster-Variable
  // (public/qiblanco-tracker.js, `merkeAnkunft`) — er speichert dafür nichts
  // und liest nur seinen eigenen, seit jeher pre-consent gefuellten Puffer.
  // Gelesen wird er erst NACH der Hydration, damit Server- und Client-Markup
  // identisch bleiben; der Knopfdruck kommt immer danach.
  const [adAnkunft, setAdAnkunft] = useState('');
  useEffect(() => {
    const zustand = window.__qbAdAnkunft;
    if (zustand === 'yes' || zustand === 'no') setAdAnkunft(zustand);
  }, []);

  // NACH den Hooks, nie davor: ein früher Ausstieg über einem Hook aendert
  // die Aufrufreihenfolge zwischen zwei Renders (eslint react-hooks/rules-of-hooks).
  if (!checkoutUrl) return null;

  // Meta-Pixel InitiateCheckout vom Storefront: STILLGELEGT (STOREFRONT_IC_FBQ,
  // oben). Die Shopify-Meta-App an der Kasse meldet InitiateCheckout als
  // Browser- und Server-Ereignis mit gemeinsamer Id; ein zweites Browser-
  // Ereignis von hier mit anderer Id zählte Meta doppelt. Die Form submittet
  // normal weiter — Tracking darf den Checkout nie blockieren.
  const trackInitiateCheckout = () => {
    try {
      if (
        STOREFRONT_IC_FBQ &&
        typeof window !== 'undefined' &&
        typeof window.fbq === 'function'
      ) {
        window.fbq('track', 'InitiateCheckout', {
          content_ids: contentIds || [],
          content_type: 'product',
          value: parseFloat(subtotal?.amount) || 0,
          currency: subtotal?.currencyCode || 'EUR',
          num_items: numItems || 0,
        });
      }
    } catch {
      // Tracking-Fehler ignorieren.
    }
    // First-Party (qpx-Receiver): schließt das initiate_checkout-Leck der
    // First-Party-Funnel-Messung (Job 20260723-commerce-microfunnel). Eigener
    // try/catch/no-op via qpxTrack — unabhängig vom Meta-Pixel, blockt nie.
    qpxTrack(
      'initiate_checkout',
      buildInitiateCheckoutEvent({subtotal, numItems, contentIds}),
    );
  };

  return (
    <Form
      action="/cart/attribution"
      className="cartSummaryWrapper"
      method="post"
      onSubmit={trackInitiateCheckout}
    >
      {/*
        KEIN GESCHENK-KÄSTCHEN MEHR (Job 20261025-repair-warenkorb-geschenk-
        feld-entfernen-checkout-funktions-wache, Christian 25.10.2026). Das
        Geschenk-Kästchen stand hier seit PR #737. Es zeigte nie
        einen Haken: app/styles/reset.css setzt `appearance: none !important`
        auf jedes input, und für :checked gab es keinen eigenen Stil. Wer es
        antippte, sah nichts passieren. Im Kaufweg steht nur, was nachweislich
        funktioniert (homepage-bauer/GOVERNANCE.md, Regel Kaufweg-Funktion).
        Ein neues Element hier braucht vorher einen Klick-Test auf Handy und
        Desktop. Die tägliche Wache dafür ist
        homepage-bauer/warenkorb-funktionswache.
      */}
      {/*
        CONSENT-FREIER ANKUNFTS-MARKER (Job 20260922-blinde-menge-...).
        Es reist EIN Wort — 'yes', 'no' oder (bei leerem Feld) nichts —, nie
        der Wert eines Ad-Parameters. Der Server lässt ohnehin nur die beiden
        bekannten Woerter durch (adParamsSeenMarker).

        WOZU DIESES FELD UEBERHAUPT: der Server sieht beim POST hierher weder
        die Landeseite noch ihren Query. Ohne diese Antwort erzeugen "kam ohne
        Ad-Parameter" und "kam mit, aber der Attributions-Cookie ueberlebte
        nicht" denselben Zustand an der Order (27 von 41 Orders am 2026-09-22).

        LEER IST EIN GUELTIGER ZUSTAND und heißt 'weiss nicht': vor der
        Hydration, ohne JavaScript oder mit geblocktem Tracker bleibt der Wert
        leer, und der Server schreibt 'unknown' statt 'no'. Ein Lesefehler darf
        nie wie eine belegte Abwesenheit aussehen.
      */}
      <input type="hidden" name="ad_params_seen" value={adAnkunft} />
      <button
        className="btn--primary"
        type="submit"
      >
        <p>Jetzt sicher zur Kasse</p>
      </button>
    </Form>
  );
}

function PaymentMethods() {
  return (
    <div className="PaymentMethods">
      {/* (all your SVGs remain unchanged) */}
    </div>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
