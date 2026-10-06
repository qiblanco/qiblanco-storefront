import {AddToCartButton} from './AddToCartButton';
import {EuGewaehrleistungsHinweis} from './EuGewaehrleistungsLabel';
import {useAside} from './Aside';
import {useMarktLand} from '~/lib/markt-land';
import {cacaoPricing, cacaoSizeOptions} from '~/lib/cacao-pricing';

// Die Staffel-Rechnung steht seit 2026-10-06 in lib/cacao-pricing.js (ohne
// React prüfbar, für crystal-cacao.com byte-gleich übernehmbar). Die Namen
// bleiben hier exportiert: CacaoPriceDisplay und der Sortenvergleich
// (AmazonStil) rechnen über genau diese Funktion.
export {cacaoPricing, cacaoSizeOptions};

/**
 * Custom add-to-cart form for Crystal Cacao products.
 * No Shopify variants — the dropdown controls the quantity
 * of the single product variant added to the cart.
 *
 * @param {{ selectedVariant: object, handle?: string, quantity: string,
 *   onQuantityChange: (val: string) => void,
 *   gewaehrleistungsHinweis?: boolean,
 *   staffelKasse?: {waehrung: string, zeilen: Object<string, number>}|null }} props
 *
 * `staffelKasse` (Job 20261006-preisanzeige-rest): Netto-Zeilenbeträge der
 * Kasse je Menge, vom Loader aus einem Warenkorb des Landes gelesen
 * (lib/cacao-pricing.js, ladeStaffelKasse). Nur außerhalb des EUR-Markts gesetzt; ohne
 * ihn gilt der Stand davor.
 *
 * `gewaehrleistungsHinweis` (Default TRUE, und der Default ist die
 * eigentliche Aussage) steuert, ob die EU-Pflichtmitteilung hier unter dem
 * Kauf-Knopf hängt -- wortgleich zur Prop in ProductForm, damit die beiden
 * Nahtstellen nicht zwei Bedeutungen desselben Namens tragen.
 *
 * Seit Elina EL-20260909-8c4001d1 montieren die beiden Kakao-Kaufflaechen
 * die Mitteilung selbst -- als sechsten Punkt ihrer Nutzen-Liste -- und
 * schalten sie deshalb hier ab. WARUM EIN ABSCHALTER UND KEIN AUSBAU: der
 * Default trägt jede kuenftige Kakao-Kaufflaeche, die ohne Nutzen-Liste
 * gebaut wird. Wer die Naht hier herausnimmt, um sie auf zwei Seiten zu
 * verschieben, nimmt sie damit still von allen uebrigen; die antworten
 * weiter HTTP 200 und sehen vollstaendig aus.
 */
export function CacaoProductForm({
  selectedVariant,
  handle,
  quantity,
  onQuantityChange,
  gewaehrleistungsHinweis = true,
  staffelKasse = null,
}) {
  const {open} = useAside();
  // Der Lebensmittelsatz ist NICHT ueberall 7 % -- in AT sind es 10 %
  // (gemessen 2026-09-13, cart-display-pricing.js SATZ_JE_LAND).
  const marktLand = useMarktLand();

  return (
    <div className="product-form">
      <div className="product-options">
        <h5>Größe</h5>
        <select
          className="CacaoVariantSelect"
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
        >
          {cacaoSizeOptions(selectedVariant, handle, marktLand, staffelKasse).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="AddToCartButtonWrapper">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: parseInt(quantity, 10),
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale
            ? 'In den Warenkorb legen'
            : 'Ausverkauft'}
        </AddToCartButton>
      </div>
      {/*
        Sichtbarer Text-Link zur Pflichtmitteilung, unmittelbar unter dem
        Kauf-Button (Art. 6 Abs. 1 lit. l RL 2011/83/EU: "in hervorgehobener
        Weise", BEVOR der Verbraucher gebunden ist). Die amtliche Grafik
        selbst erscheint erst im Overlay nach Klick -- so beschreiben es die
        Praxisleitlinien der Kommission (April 2026, Abschnitt 2.3) für die
        Mitteilung.

        Die Naht sitzt bewusst HIER und nicht in den einzelnen
        Produktseiten-Komponenten: die Kaufflaechen entstehen über
        veroeffentlichte Shopify-Produkte, von denen ein Grossteil ohne
        eigene Route-Datei über den Catch-all läuft. Eine Naht je Seite
        würde genau die stillschweigend auslassen.
      */}
      {gewaehrleistungsHinweis ? <EuGewaehrleistungsHinweis /> : null}
    </div>
  );
}
