import {useEffect, useState} from 'react';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {KaufZusagePunkte} from '~/components/reusables/KaufZusage';
import {stickySichtbar} from './sticky-lage';

/*
 * STICKY "IN DEN WARENKORB LEGEN" MOBIL (Rookie /pages/qione-2-pro-b, GS-080,
 * Bestandteil "knoepfe": GS-065 Knopf immer erreichbar, GS-066 Beweis an der
 * Entscheidung).
 *
 * DERSELBE WARENKORB-WEG WIE DIE BUYBOX: AddToCartButton (CartForm LinesAdd auf
 * /cart) mit derselben Variante, Menge 1, danach oeffnet sich der Warenkorb wie
 * nach dem Buybox-Knopf (ProductForm.jsx). Das Ereignis add_to_cart entsteht
 * nicht hier, sondern routenunabhaengig aus Hydrogens product_added_to_cart
 * (QpxCommerce.jsx, MetaPixel.jsx). Beide Knoepfe loesen es deshalb gleich aus.
 *
 * DIESELBE VARIANTE: useOptimisticVariant mit denselben Eingaben wie
 * QiOneBuyBox. Waehlt jemand oben eine Variante, landet die Wahl per URL im
 * Loader und damit in product.selectedOrFirstAvailableVariant, also auch hier.
 *
 * KEIN NEUER TEXT: Wortlaut des Knopfs wie in ProductForm ("In den Warenkorb
 * legen" / "Ausverkauft"), die drei Zeilen darueber sind KaufZusagePunkte, wie
 * unter dem Buybox-Knopf (Ruecknahme, Raten, Google-Bewertungen).
 *
 * CHAT-BLASE (Hausregel, Lehre aus LP B 06.10.): der Knopf traegt
 * data-qb-kaufknopf (aus AddToCartButton), KaufknopfChatSignal laesst die
 * geschlossene Blase weichen, solange sie ihn deckt. Das Signal misst nur bei
 * scroll/resize/childList. Deshalb steht der Inhalt NUR im sichtbaren Zustand
 * im DOM (Einhaengen = childList), und er erscheint ohne Gleiten.
 *
 * Nur mobil (bis 767 px, rookie-shop.css). Auf breiten Fenstern bleibt der
 * Kasten leer und unsichtbar; dort steht die Buybox-Spalte ohnehin daneben.
 */
export function StickyWarenkorb({product, buyboxSelektor}) {
  const [sichtbar, setSichtbar] = useState(false);
  const {open} = useAside();
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const buybox = document.querySelector(buyboxSelektor);
    if (!buybox) return undefined;
    const fuss = document.querySelector('footer');
    const lage = {buyboxImBild: true, buyboxUnterkante: null, fussImBild: false};
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === buybox) {
          lage.buyboxImBild = e.isIntersecting;
          lage.buyboxUnterkante = e.boundingClientRect.bottom;
        } else if (e.target === fuss) {
          lage.fussImBild = e.isIntersecting;
        }
      }
      setSichtbar(stickySichtbar(lage));
    });
    beobachter.observe(buybox);
    if (fuss) beobachter.observe(fuss);
    return () => beobachter.disconnect();
  }, [buyboxSelektor]);

  const verfuegbar = !!selectedVariant?.availableForSale;
  return (
    <div
      className={`qb-rookie-sticky${sichtbar ? ' qb-rookie-sticky--sichtbar' : ''}`}
      data-section="shopq-b-sticky-warenkorb"
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <ul className="qb-rookie-sticky__zusage">
            <KaufZusagePunkte
              preis={product?.selectedOrFirstAvailableVariant?.price}
              handle={product?.handle}
            />
          </ul>
          <AddToCartButton
            disabled={!selectedVariant || !verfuegbar}
            onClick={() => {
              open('cart');
            }}
            lines={
              selectedVariant
                ? [{merchandiseId: selectedVariant.id, quantity: 1, selectedVariant}]
                : []
            }
          >
            {verfuegbar ? 'In den Warenkorb legen' : 'Ausverkauft'}
          </AddToCartButton>
        </>
      )}
    </div>
  );
}
