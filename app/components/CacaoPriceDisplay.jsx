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
export function CacaoPriceDisplay({quantity, selectedVariant, handle, staffelKasse = null}) {
  const marktLand = useMarktLand();
  const pricing = cacaoPricing(quantity, selectedVariant, handle, marktLand, staffelKasse);
  // "3 x 54,49 € pro Packung" nur, wenn die Rechnung den großen Betrag
  // darüber auf den Cent trifft (teilbar, lib/cacao-pricing.js). AT 3x ergäbe
  // 163,47 neben 163,46; dann steht der Zeilenbetrag allein.
  const nebenzeile = [
    pricing.menge > 1 && pricing.teilbar
      ? `${pricing.menge} x ${pricing.price} pro Packung`
      : null,
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

/**
 * Derselbe Betrag für die Kaufleiste (reusables/Kaufleiste.jsx, Prop
 * `preisAnzeige`): eine Rechnung, zwei Anzeigen. Die Leiste steht weit weg von
 * der Mengenwahl, darum nennt sie ab zwei Packungen die Menge dazu.
 */
export function CacaoLeistenPreis({quantity, selectedVariant, handle, staffelKasse = null}) {
  const marktLand = useMarktLand();
  const pricing = cacaoPricing(quantity, selectedVariant, handle, marktLand, staffelKasse);
  return (
    <div className="qb-kaufleiste__staffel">
      <div className="product-price">
        {pricing.compareAtGesamt ? (
          <div className="product-price-on-sale">
            <span className="gradient-price">{pricing.gesamt}</span>
            <s>{pricing.compareAtGesamt}</s>
          </div>
        ) : (
          <span>{pricing.gesamt}</span>
        )}
      </div>
      {pricing.menge > 1 ? (
        <p className="qb-kaufleiste__menge">{pricing.menge} Packungen</p>
      ) : null}
    </div>
  );
}
