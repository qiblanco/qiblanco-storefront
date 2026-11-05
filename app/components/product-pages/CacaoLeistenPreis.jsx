import {cacaoPricing} from '~/components/CacaoProductForm';
import {useMarktLand} from '~/lib/markt-land';

/**
 * Derselbe Betrag für die Kaufleiste (reusables/Kaufleiste.jsx, Prop
 * `preisAnzeige`): eine Rechnung, zwei Anzeigen. Die Leiste steht weit weg von
 * der Mengenwahl, darum nennt sie ab zwei Packungen die Menge dazu.
 * Den Streichpreis zeigt nur die Kaufbox: neben dem Betrag brach der Knopf in
 * CHF auf zwei Zeilen um (390 px, Preisspalte 156 px, gemessen 03.11.2026).
 */
export function CacaoLeistenPreis({quantity, selectedVariant, handle, staffelKasse = null}) {
  const marktLand = useMarktLand();
  const pricing = cacaoPricing(quantity, selectedVariant, handle, marktLand, staffelKasse);
  return (
    <div className="qb-kaufleiste__staffel">
      <div className="product-price">
        <span>{pricing.gesamt}</span>
      </div>
      {pricing.menge > 1 ? (
        <p className="qb-kaufleiste__menge">{pricing.menge} Packungen</p>
      ) : null}
    </div>
  );
}
