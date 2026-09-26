import {AddToCartButton} from './AddToCartButton';
import {EuGewaehrleistungsHinweis} from './EuGewaehrleistungsLabel';
import {useAside} from './Aside';
import {anzeigeSatz, formatPreis, ganzEuroAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';

/**
 * Mengenstaffel Crystal Cacao® — GESCHAEFTSREGEL (Prozente + Badges), KEINE
 * Preiszahlen (M2, Auftrag 20260718-lp-preise-dynamisch-binden-gestuft).
 * Die Prozente spiegeln die Shopify-Automatik "Mengenrabatt 2x/3x Crystal
 * Cacao®" (Cart-Probe 2026-07-18: Rabatt pro Einheit centgenau
 * abgeschnitten, 71,03 x 20 % = 14,206 -> 14,20). Der Packungspreis wird
 * aus dem API-Preis der Variante abgeleitet:
 *   round((netto - trunc2(netto * rabatt)) * (1 + satz))
 * — reproduziert exakt 76/61/53 beim heutigen Netto 71,03 (satz 7 %).
 */
export const CACAO_STAFFEL = {
  '1': {rabattProzent: 0, badge: 'Exklusiv', badgeStyle: 'gold'},
  '2': {rabattProzent: 20, badge: 'Angebot', badgeStyle: 'red'},
  '3': {rabattProzent: 30, badge: 'Bestseller Angebot', badgeStyle: 'gradient'},
};

// FAIL-CLOSED: letzter bekannter guter Stand (DE/EUR-Anzeige), wenn der
// API-Preis fehlt — nie 0/leer/falsch. preiswatch haelt die Werte synchron.
const CACAO_FALLBACK = {
  '1': {einzel: 76, compareAt: null},
  '2': {einzel: 61, compareAt: 76},
  '3': {einzel: 53, compareAt: 76},
};

const PACKUNG_GRAMM = 420;

function formatPer100g(wert, waehrung) {
  if (waehrung === 'USD') {
    return `$${wert.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} / 100g`;
  }
  const de = wert.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return waehrung === 'EUR' ? `${de}€ / 100g` : `${de} ${waehrung} / 100g`;
}

/**
 * Staffel-Anzeige je Menge, DYNAMISCH aus dem API-Preis der Variante.
 * @param {string} quantity '1' | '2' | '3'
 * @param {object} [selectedVariant] Variante mit price {amount, currencyCode}
 * @param {string} [handle] Produkt-Handle (Steuersatz-Zuordnung, 7 % Kakao)
 */
export function cacaoPricing(quantity, selectedVariant, handle, land) {
  const staffel = CACAO_STAFFEL[quantity] || CACAO_STAFFEL['1'];
  const netto = Number.parseFloat(selectedVariant?.price?.amount);
  let waehrung = selectedVariant?.price?.currencyCode || 'EUR';
  let einzel;
  let compareAt;
  // NICHT-EUR-MAERKTE BEKOMMEN KEINE STAFFEL-BEHAUPTUNG (2026-09-12).
  // Der Mengenrabatt ist seit dem 2026-09-12 ein FESTBETRAG in EUR; Shopify
  // rechnet ihn je Markt per Wechselkurs um. Diesen Kurs kann die Kaufseite
  // baulich nicht kennen (ein Automatikrabatt existiert erst mit einem
  // Warenkorb) — jede hier gerechnete Prozentzahl ist geraten. Gemessen am
  // Kundenrand war sie zu NIEDRIG geraten: US 3x bewarb 207,00 USD, die Kasse
  // belastete 220,69 USD. Darum nennt die Seite ausserhalb des EUR-Markts den
  // LISTENPREIS und verspricht keinen Staffelpreis; der Rabatt zeigt sich im
  // Warenkorb. Im EUR-Markt bleibt die Rechnung unveraendert — dort trifft der
  // Festbetrag den runden Bruttobetrag exakt.
  const rabattProzent =
    waehrung === 'EUR' ? staffel.rabattProzent : 0;
  const rabattImWarenkorb = waehrung !== 'EUR' && staffel.rabattProzent > 0;
  if (Number.isFinite(netto)) {
    const satz = anzeigeSatz(handle, waehrung, land);
    const rabattProEinheit =
      Math.floor(netto * (rabattProzent / 100) * 100) / 100;
    // Ganz-Euro-Regel je Land (markt-pricing.js, ganzEuroAnzeige): DE
    // gerundet, sonst aufgerundet -- AT 1x nennt 79 statt 78 bei 78,13 Kasse.
    einzel = ganzEuroAnzeige((netto - rabattProEinheit) * (1 + satz), land);
    compareAt =
      rabattProzent > 0 ? ganzEuroAnzeige(netto * (1 + satz), land) : null;
  } else {
    if (typeof console !== 'undefined') {
      console.warn(
        `[preis-fallback] Kakao-Staffel ${quantity}x: API-Preis fehlt — letzter bekannter Stand wird gezeigt.`,
      );
    }
    const fallback = CACAO_FALLBACK[quantity] || CACAO_FALLBACK['1'];
    waehrung = 'EUR';
    einzel = fallback.einzel;
    compareAt = fallback.compareAt;
  }
  // GESAMTPREIS DES KAUFKNOPFS (Job rtbefund-kopfpreis-vs-kaufmenge-wache-
  // 20260924): der Knopf legt `quantity` Packungen in den Warenkorb, also ist
  // DAS der Betrag, den ein Klick kostet. Im EUR-Markt trifft der Festbetrag
  // seit 2026-09-12 den runden Bruttobetrag je Packung exakt, darum ist
  // Packungspreis mal Menge hier gleich dem Warenkorb (gemessen 2026-09-24 per
  // cartCreate: 76 / 122 / 159). Eine Zeilen-Rundung wie im Entwurf vom
  // 2026-09-01 (3x = 160) wäre seit dem Festbetrag FALSCH.
  const menge = Number.parseInt(quantity, 10) || 1;
  return {
    price: formatPreis(einzel, waehrung, 'pdp'),
    priceNum: einzel,
    compareAt: compareAt != null ? formatPreis(compareAt, waehrung, 'pdp') : null,
    menge,
    gesamt: formatPreis(einzel * menge, waehrung, 'pdp'),
    gesamtNum: einzel * menge,
    compareAtGesamt:
      compareAt != null ? formatPreis(compareAt * menge, waehrung, 'pdp') : null,
    per100g: formatPer100g(einzel / (PACKUNG_GRAMM / 100), waehrung),
    badge: staffel.badge,
    badgeStyle: staffel.badgeStyle,
    rabattProzent,
    rabattImWarenkorb,
  };
}

/**
 * Dropdown-Optionen der Mengenstaffel (Preise dynamisch abgeleitet).
 */
export function cacaoSizeOptions(selectedVariant, handle, land) {
  return ['3', '2', '1'].map((value) => {
    const pricing = cacaoPricing(value, selectedVariant, handle, land);
    const rabatt =
      pricing.rabattProzent > 0 ? `${pricing.rabattProzent}% Rabatt | ` : '';
    // Ausserhalb des EUR-Markts nennt die Zeile den Listenpreis und sagt, dass
    // der Mengenrabatt im Warenkorb abgezogen wird — statt einen Staffelpreis
    // zu versprechen, den die Kasse nicht einloest (siehe cacaoPricing).
    const hinweis = pricing.rabattImWarenkorb
      ? ' | Mengenrabatt im Warenkorb'
      : '';
    return {
      value,
      label: `${value}x ${PACKUNG_GRAMM}g | ${rabatt}${pricing.price} pro Packung${hinweis}`,
    };
  });
}

/**
 * Custom add-to-cart form for Crystal Cacao products.
 * No Shopify variants — the dropdown controls the quantity
 * of the single product variant added to the cart.
 *
 * @param {{ selectedVariant: object, handle?: string, quantity: string,
 *   onQuantityChange: (val: string) => void,
 *   gewaehrleistungsHinweis?: boolean }} props
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
          {cacaoSizeOptions(selectedVariant, handle, marktLand).map((opt) => (
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
