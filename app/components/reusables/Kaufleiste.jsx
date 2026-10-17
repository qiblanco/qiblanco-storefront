import {useEffect, useState} from 'react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductPrice} from '~/components/ProductPrice';
import {
  kaufleisteSichtbar,
  kaufleisteZiel,
  variantenwahlText,
} from './kaufleiste-lage';

/**
 * DIE KAUFLEISTE DER PRODUKTSEITE — Preis und Kaufknopf, klebend am unteren
 * Rand, solange der Kaufknopf der Kaufbox nicht im Bild ist.
 *
 * WARUM: Der Designstandard verlangt für jede Produktseite bei 390x844 Preis
 * und Kaufknopf im ersten Fenster; mobil ist der Ersatz ausdrücklich „eine
 * klebende Kaufleiste mit Preis und Knopf“ (design-meister/db/designstandard/
 * _basis.yaml, Seitenregel `pdp_falz.mobil`; Baustein `kauf_block`: „Klebende
 * Kaufleiste (mobil) wiederholt Preis UND Knopf, nicht nur den Knopf.“).
 * Gemessen am 17.10.2026 (Grossjob design-update, s12): bei 390x844 stand der
 * Kaufknopf auf qibracelet bei y=2069, auf qihome-air bei 1922, auf qi-master
 * bei 1183. Umordnen allein (PDP_KAUF_ZUERST.mobil) holte ihn nur auf 1022,
 * 916 und 942: Produktbild und Vorschaubilder füllen das erste Fenster.
 *
 * WAS SIE ZEIGT — NICHTS NEUES, ALLES AUS DER KAUFBOX:
 *  - Preis: <ProductPrice> mit genau den Props, mit denen die Kaufbox ihren
 *    Preis zeigt (`preis` = dasselbe Objekt). Gleiche Quelle, gleiches
 *    Format, gleiche Steuer- und Marktlogik.
 *  - Knopf: <AddToCartButton> mit denselben Warenkorbzeilen wie der Knopf der
 *    Kaufbox (gewählte Variante, Menge, bei qi-master die gewählten Add-ons),
 *    derselben Beschriftung („In den Warenkorb legen“ / „Ausverkauft“) und
 *    demselben Ablauf danach: die Warenkorb-Schublade öffnet sich. Das
 *    Ereignis add_to_cart entsteht routenunabhängig aus Hydrogens
 *    product_added_to_cart; beide Knöpfe lösen es gleich aus.
 *
 * MEHRERE VARIANTEN (qibracelet S/M/L, qione-kette XS..XL): der Knopf führt
 * zur Variantenwahl der Kaufbox („Größe wählen“), statt die Größe zu kaufen,
 * die die Seite beim Laden selbst vorgewählt hat. Erst wenn der Kunde in
 * diesem Seitenaufruf eine Größe angetippt hat, legt er in den Warenkorb.
 * Begründung ausführlich in kaufleiste-lage.js (kaufleisteZiel). Eine
 * Formulierung je Ziel: „In den Warenkorb legen“ heißt immer Warenkorb,
 * „Größe wählen“ heißt immer Variantenwahl.
 *
 * WANN SIE STEHT: Regel in kaufleiste-lage.js (kaufleisteSichtbar). Sichtbar,
 * solange der Kaufknopf der Kaufbox nicht im Bild ist, auch ganz oben; weg,
 * sobald er im Bild ist oder der Fuß erscheint. Solange ein Dialog offen ist
 * (Warenkorb-Schublade, Bildergalerie, ...), wird sie nicht dargestellt
 * (html[data-dialog-offen], DialogSignal.jsx; overlay_ordnung: „Solange ein
 * Dialog dargestellt ist, ist jedes schwebende Bedienelement display:none“).
 *
 * CHAT-BLASE (Hausregel, Lehre aus LP B 06.10.): der Knopf trägt
 * data-qb-kaufknopf, KaufknopfChatSignal lässt die geschlossene Blase
 * weichen, solange sie ihn deckt. Das Signal misst nur bei
 * scroll/resize/childList. Deshalb steht der Inhalt NUR im sichtbaren
 * Zustand im DOM (Einhängen = childList), und er erscheint ohne Gleiten.
 * Nebenwirkung, gewollt: solange die Leiste steht, steht die Chat-Pille
 * nicht über ihrem Knopf. Sie kommt zurück, sobald die Leiste geht.
 *
 * DER SCHALTER (mobil und desktop getrennt ausgerollt, wie PDP_KAUF_ZUERST
 * und KAUFBLOCK_AN): je Gerät `true` = Leiste, `false` = keine. Grenze 750 px
 * (Mobilgrenze des Hauses, max-width: 749px). Desktop bleibt aus: dort steht
 * der Kaufknopf seit PDP_KAUF_ZUERST.desktop im ersten Fenster.
 * Je Seite schaltet die Aufrufstelle zusätzlich über die Prop `kaufleiste`
 * der Kaufbox (QiOneBuyBox, QiBraceletSeite, QiHomeAirSeite, Route
 * qione-kette). Default ist aus: die Landingpage-Spiegel (/pages/qione-2-pro,
 * /pages/qibracelet, /pages/qihome-air), die Rookie-Seite und das 2er-Set
 * bekommen keine Leiste. Die Landingpage wird am nächsten Klick gemessen,
 * nicht am Warenkorb.
 *
 * Gestalt: styles/qb-kaufleiste.css (nur Rollen aus designstandard-dach.css),
 * geladen über links() der Kaufseiten. Bausteinregel:
 * homepage-bauer/baukasten/qb-kaufleiste/README.md.
 */
export const KAUFLEISTE_AN = {desktop: false, mobil: true};

const MOBIL_MEDIA = '(max-width: 749px)';

/**
 * @param {{
 *   kaufbox: {current: HTMLElement | null},
 *   preis: {handle?: string, price?: any, compareAtPrice?: any},
 *   selectedVariant: any,
 *   productOptions: Array<any>,
 *   quantity?: number,
 *   ctaLabel?: string,
 *   zusatzLinien?: Array<object>,
 * }} props
 */
export function Kaufleiste({
  kaufbox,
  preis,
  selectedVariant,
  productOptions,
  quantity = 1,
  ctaLabel,
  zusatzLinien = undefined,
}) {
  const [sichtbar, setSichtbar] = useState(false);
  const [gewählt, setGewählt] = useState(false);
  const {open} = useAside();

  const wahlOption = (productOptions || []).find(
    (o) => (o?.optionValues?.length || 0) > 1,
  );
  const ziel = kaufleisteZiel({mehrereVarianten: !!wahlOption, gewählt});

  useEffect(() => {
    const box = kaufbox?.current;
    if (!box || typeof IntersectionObserver === 'undefined') return undefined;
    const knopf = box.querySelector('.product-form [data-qb-kaufknopf]');
    const fuss = document.querySelector('footer');
    const medien =
      typeof window.matchMedia === 'function' ? window.matchMedia(MOBIL_MEDIA) : null;
    const geraetAn = () =>
      medien && medien.matches ? KAUFLEISTE_AN.mobil : KAUFLEISTE_AN.desktop;
    const lage = {gemessen: false, kaufknopfImBild: false, fussImBild: false};
    const urteil = () => setSichtbar(kaufleisteSichtbar({...lage, geraetAn: geraetAn()}));
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === knopf) {
          lage.gemessen = true;
          lage.kaufknopfImBild = e.isIntersecting;
        } else if (e.target === fuss) {
          lage.fussImBild = e.isIntersecting;
        }
      }
      urteil();
    });
    if (knopf) beobachter.observe(knopf);
    if (fuss) beobachter.observe(fuss);
    medien?.addEventListener?.('change', urteil);

    // Eine Größe gilt als gewählt, sobald der Kunde in der Variantenwahl der
    // Kaufbox eine antippt, auch die schon vorgewählte.
    const beiWahl = (e) => {
      if (e.target?.closest?.('.product-options-item')) setGewählt(true);
    };
    box.addEventListener('click', beiWahl);
    return () => {
      beobachter.disconnect();
      medien?.removeEventListener?.('change', urteil);
      box.removeEventListener('click', beiWahl);
    };
  }, [kaufbox]);

  const zurWahl = () => {
    const wahl = kaufbox?.current?.querySelector('.product-options');
    if (!wahl) return;
    wahl.scrollIntoView({block: 'center', behavior: 'smooth'});
    const erste =
      wahl.querySelector('.product-options-item:not(.link)') ||
      wahl.querySelector('.product-options-item');
    erste?.focus?.({preventScroll: true});
  };

  const verfuegbar = !!selectedVariant?.availableForSale;
  return (
    <div
      className={`qb-kaufleiste${sichtbar ? ' qb-kaufleiste--sichtbar' : ''}`}
      data-section="pdp-kaufleiste"
      data-kaufleiste-desktop={KAUFLEISTE_AN.desktop ? 'an' : 'aus'}
      data-kaufleiste-mobil={KAUFLEISTE_AN.mobil ? 'an' : 'aus'}
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <div className="qb-kaufleiste__preis">
            <ProductPrice
              handle={preis?.handle}
              price={preis?.price}
              compareAtPrice={preis?.compareAtPrice}
            />
          </div>
          {ziel === 'variantenwahl' ? (
            <button
              type="button"
              className="btn--primary"
              data-qb-kaufknopf=""
              onClick={zurWahl}
            >
              {variantenwahlText(wahlOption?.name)}
            </button>
          ) : (
            <AddToCartButton
              disabled={!selectedVariant || !verfuegbar}
              onClick={() => {
                open('cart');
              }}
              lines={
                selectedVariant
                  ? [
                      {merchandiseId: selectedVariant.id, quantity, selectedVariant},
                      ...(zusatzLinien || []),
                    ]
                  : []
              }
            >
              {verfuegbar ? ctaLabel ?? 'In den Warenkorb legen' : 'Ausverkauft'}
            </AddToCartButton>
          )}
        </>
      )}
    </div>
  );
}
