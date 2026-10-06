import {
  anzeigeSatz,
  formatPreis,
  kassenAnzeige,
  streichAnzeige,
} from '~/lib/markt-pricing';
import {istBrutto} from '~/lib/preismodus';
import {useMarktLand} from '~/lib/markt-land';

/**
 * Der Preisblock der Kaufseiten.
 *
 * WARUM DIESE DATEI KEINEN STEUERSATZ MEHR KENNT (Job 20260910-REPAIR-qiblanco-
 * dieselbe-ware-kostet-gleichzeitig-53-und-85-euro):
 * Bis zum 2026-09-09 stand hier `taxRate = 0.19` als Vorgabewert, und KEINE
 * einzige Kaufseite hat den Wert je uebergeben. Der Lebensmittelsatz von 7 %
 * für Kakao lebte deshalb nur im Warenkorb-Kanon (cart-display-pricing.js) —
 * die Kaufseite davor rechnete unverandert mit 19 %.
 *
 * WAS DAS GEKOSTET HAT, gemessen am Kundenrand:
 * /products/crystal-cacao-adfiefiale zeigte 85 Euro (gerundet aus 71,03 mal
 * 1,19), waehrend Warenkorb und Kasse für DIESELBE Ware (SKU 6666, 420 g)
 * 44,08 Euro belasteten und die Schwesterseite /products/crystal-cacao-create
 * für die gleiche Packung 76 Euro auswies.
 * (Beträge hier ohne Eurozeichen: preiswatch liest auf der Quelltext-Ebene
 * jede Zahl mit Eurozeichen als Preis, auch im Kommentar. Mit Zeichen stand
 * die 85 seit dem Soll-Wechsel vom 2026-10-06 als Abweichung im Bericht.) Der Fix vom 2026-07-29 (PR #144/#145,
 * "Lebensmittel-MwSt für crystal-cacao-adfiefiale + -angebot") hat genau
 * diese Klasse geschlossen — aber nur beim Warenkorb-Konsumenten. Der zweite
 * Konsument stand daneben und wurde nicht mitgezogen.
 *
 * DESHALB: der Satz wird HIER NICHT MEHR ENTSCHIEDEN, sondern geholt.
 * `anzeigeSatz(handle, waehrung)` ist die eine Stelle (markt-pricing.js ->
 * cart-display-pricing.js), die weiss, welche Ware welchen Satz trägt und
 * dass Nicht-EUR-Maerkte den Endbetrag liefern. Wer eine neue Kakaoseite
 * baut, trägt nichts mehr nach.
 *
 * DIE PROP `taxRate` BLEIBT — sie ist eine AUSNAHME, kein Vorgabewert:
 * der Warenkorb (CartLineItem) uebergibt 0, weil sein Betrag SCHON brutto ist
 * (getCartLineGrossDisplayTotal hat gerechnet). Ohne diese Ausnahme würden
 * 7 % ein zweites Mal aufgeschlagen. `taxRate` sticht deshalb den Handle —
 * aber nur, wenn er ausdrücklich gesetzt ist.
 *
 * DAS MARKT-LAND KOMMT NICHT ALS PROP, SONDERN AUS DEM KONTEXT (2026-09-13):
 * der Satz hängt nicht nur an der Ware, sondern am aufgeloesten Markt -- AT
 * führt 20 statt 19 Prozent und 10 statt 7. Eine Prop haette wieder verlangt,
 * dass 13 Aufrufer daran denken; genau daran ist der 19-Prozent-Vorgabewert
 * oben schon einmal gescheitert. `useMarktLand()` holt ihn aus denselben
 * root-Loaderdaten, aus denen ihn jede andere Preisanzeige holt.
 *
 * DIE PROP `centGenau` (aiceo:digest54:p3, 2026-09-10): der Warenkorb
 * bekommt den bereits cent-genauen Betrag aus getCartLinePriceDisplayExact
 * (taxRate dabei 0, satzFuer() also 0) — hier wird NICHT zweimal versteuert,
 * nur noch auf Cent statt auf ganze Euro gerundet und entsprechend formatiert.
 *
 * @param {{price?: any, compareAtPrice?: any, handle?: string, taxRate?: number, centGenau?: boolean}} props
 */
export function ProductPrice({price, compareAtPrice, handle, taxRate, centGenau = false}) {
  const marktLand = useMarktLand();
  const satzFuer = (money) => {
    if (taxRate != null) {
      // Ausdrueckliche Ausnahme (Warenkorb: Betrag ist schon brutto).
      // Nicht-EUR bleibt auch hier steuerfrei — das ist die Markt-Mechanik
      // aus markt-pricing.js und gilt für beide Wege gleich.
      // Im Preismodus brutto ist jeder EUR-Betrag schon der Endbetrag -- auch
      // eine ausdrückliche Ausnahme darf dann nichts mehr aufschlagen.
      return (money.currencyCode || 'EUR') === 'EUR' && !istBrutto()
        ? taxRate
        : 0;
    }
    return anzeigeSatz(handle, money.currencyCode, marktLand);
  };

  const applyTax = (money) => {
    if (!money) return null;
    const numericAmount = Number.parseFloat(money.amount);
    if (!Number.isFinite(numericAmount)) return null;
    // Kassenbetrag-Regel (markt-pricing.js, kassenAnzeige; Grossjob 20261004
    // preisanzeige, s03):
    // die Seite nennt den Betrag der Kasse, ganz ohne Cent, sonst cent-genau
    // (AT Kakao 78,13 statt 79). DE mit 1 Cent Kalibrier-Toleranz: QiOne 2 Pro
    // 913,45 netto = 1087,0055 bleibt 1.087.
    const roh = numericAmount * (1 + satzFuer(money));
    const amount = centGenau
      ? Math.round(roh * 100) / 100
      : kassenAnzeige(roh, marktLand);
    return {...money, amount};
  };

  // Streichpreis: im Warenkorb (taxRate gesetzt) wie bisher ganz und
  // unversteuert; auf der Seite auf derselben Satz-Achse wie der Kaufpreis
  // (markt-pricing.js streichAnzeige, Job 20261006-preisanzeige-rest).
  const streich = (money) => {
    if (!money) return null;
    if (taxRate != null || centGenau) return money;
    const amount = streichAnzeige(money, handle, marktLand);
    return amount == null ? null : {...money, amount};
  };

  const formatMarktPreis = (money, runden = false) => {
    if (!money) return null;
    const amount = Number(money.amount);
    if (!Number.isFinite(amount)) return null;
    if (centGenau) {
      return formatPreis(amount, money.currencyCode || 'EUR', 'cart-cent');
    }
    // Kauf- und Streichpreis kommen schon auf den Cent aus kassenAnzeige bzw.
    // streichAnzeige und werden nicht ein zweites Mal gerundet; nur der
    // Streichpreis im Warenkorb bleibt ganz wie bisher.
    return formatPreis(
      runden ? Math.round(amount) : amount,
      money.currencyCode || 'EUR',
      'pdp',
    );
  };

  const taxedPrice = formatMarktPreis(applyTax(price));
  const compareAtFormatted = formatMarktPreis(
    streich(compareAtPrice),
    taxRate != null,
  );

  return (
    <div className="product-price">
      {compareAtFormatted ? (
        <div className="product-price-on-sale">
          {taxedPrice ? <span className="gradient-price">{taxedPrice}</span> : null}
          <s>{compareAtFormatted}</s>
        </div>
      ) : taxedPrice ? (
        <span>{taxedPrice}</span>
      ) : (
        <span>&nbsp;</span>
      )}
    </div>
  );
}
