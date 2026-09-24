import {cacaoPricing} from './CacaoProductForm';
import {useMarktLand} from '~/lib/markt-land';

/**
 * Preis-Anzeige der Kakao-Mengenstaffel — DYNAMISCH aus dem API-Preis der
 * Variante (M2, Auftrag 20260718-lp-preise-dynamisch-binden-gestuft);
 * fail-closed auf den letzten bekannten guten Stand (cacaoPricing).
 *
 * INVARIANTE (Wache kopfpreis-vs-kaufmenge-wache, Job
 * rtbefund-kopfpreis-vs-kaufmenge-wache-20260924): der große Preis ist das,
 * was der Kaufknopf mit EINEM Klick kostet, also Packungspreis mal gewählte
 * Menge. Vorher stand hier der Packungspreis, während der Knopf die Menge in
 * den Warenkorb legte (Anlass: Kaufabbruch 2026-04-17). Der Packungspreis
 * bleibt als Nebenzeile sichtbar, er ist das Argument der Staffel.
 */
export function CacaoPriceDisplay({quantity, selectedVariant, handle}) {
  const marktLand = useMarktLand();
  const pricing = cacaoPricing(quantity, selectedVariant, handle, marktLand);
  const nebenzeile = [
    pricing.menge > 1 ? `${pricing.menge} x ${pricing.price} pro Packung` : null,
    pricing.per100g,
    pricing.rabattImWarenkorb ? 'Mengenrabatt im Warenkorb' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="Bestseller-Price">
      <div className="CacaoPriceMain">
        <span className={`CacaoPriceCurrent ${pricing.compareAtGesamt ? 'sale' : 'exclusive'}`}>
          {pricing.gesamt}
        </span>
        {pricing.compareAtGesamt && (
          <span className="CacaoPriceCompare">{pricing.compareAtGesamt}</span>
        )}
      </div>
      <div className={`BestsellerLabel BestsellerLabel--${pricing.badgeStyle}`}>
        {pricing.badge}
      </div>
      <div className="CacaoPricePer100g">{nebenzeile}</div>
    </div>
  );
}
