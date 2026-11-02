import {cacaoPricing} from './CacaoProductForm';
import {useMarktLand} from '~/lib/markt-land';

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
