import {useEffect, useRef} from 'react';
import {useAnalytics} from '@shopify/hydrogen';
import {
  qpxTrack,
  buildViewContentEvent,
  buildAddToCartEvent,
} from '~/lib/qpx-commerce';
import {
  eventIdFuer,
  META_EVENT_VIEW_CONTENT,
  META_EVENT_ADD_TO_CART,
} from '~/lib/meta-event-id';

/**
 * QpxCommerce — First-Party-Commerce-Bridge für den eigenen qpx-Receiver.
 *
 * Zweiter, UNABHAENGIGER Konsument der Hydrogen-Analytics-Events, die auch
 * MetaPixel.jsx nutzt: product_viewed -> qpx view_content, product_added_to_cart
 * -> qpx add_to_cart. So wird der Mid-Funnel (page_view -> view_content ->
 * add_to_cart -> initiate_checkout -> purchase) First-Party messbar
 * (Job 20260723-commerce-microfunnel-instrumentierung-messluecke).
 *
 * BEWUSST getrennt von MetaPixel.jsx: eine Aenderung dort würde die schon
 * gruenen ViewContent/AddToCart-Meta-Events beruehren (Regressionsrisiko,
 * s. pixel-content.js). Consent + Versand liegen im qpx-Loader/qpx.js; qpxTrack
 * puffert bis dahin über den Standard-Queue-Stub. initiate_checkout feuert
 * NICHT hier, sondern beim Checkout-Submit in CartSummary.jsx.
 *
 * event_id (seit 2026-10-31): dieselbe `qbm-<uuid>`, die MetaPixel.jsx dem
 * Browser-Pixel als eventID gibt (app/lib/meta-event-id.js, eine Id je
 * Payload). qpx.js base() übernimmt Props über die eigene uuid(), der Receiver
 * legt die Id unverändert als PRIMARY KEY ab, und capi-rueckspeisung meldet das
 * Ereignis mit genau dieser Id server-seitig an Meta.
 *
 * Rendert nichts.
 */
export function QpxCommerce() {
  const {subscribe} = useAnalytics();
  const subscribed = useRef(false);

  useEffect(() => {
    if (subscribed.current) return;
    subscribed.current = true;

    subscribe('product_viewed', (data) => {
      const ev = buildViewContentEvent(data);
      if (ev) {
        qpxTrack('view_content', {
          ...ev,
          event_id: eventIdFuer(data, META_EVENT_VIEW_CONTENT),
        });
      }
    });

    subscribe('product_added_to_cart', (data) => {
      const ev = buildAddToCartEvent(data);
      if (ev) {
        qpxTrack('add_to_cart', {
          ...ev,
          event_id: eventIdFuer(data, META_EVENT_ADD_TO_CART),
        });
      }
    });
  }, [subscribe]);

  return null;
}
