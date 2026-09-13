import {bruttoAnzeige, formatPreis} from './markt-pricing.js';
import {mitStreichpreisFallback} from './streichpreis-paritaet.js';
import {useMarktLand} from './markt-land.js';

/**
 * DER PREISBLOCK DER AD-LANDINGPAGES — einmal, statt achtmal.
 *
 * WARUM ES DIESE DATEI GIBT (Job 20260913-at-paketkarte-rechnet-19-prozent-
 * kasse-nimmt-20-prio8). Bis zum 2026-09-13 stand derselbe Helferblock
 * BYTE-IDENTISCH in acht Landingpage-Komponenten (SchlafZellenSchutz, V2, V3,
 * TieferSchlaf, ESmogSchutz, ZellSchutz, Partner, QiOneZellschutz --
 * md5 6cfefd8c7bb63a1329edc82a4f45f9f0 in allen acht). Achtfache Kopie heisst:
 * jede Preis-Lehre muss achtmal nachgezogen werden, und genau dieses Nachziehen
 * ist in diesem Haus schon zweimal ausgeblieben. Der Kopf von
 * components/ProductPrice.jsx protokolliert den ersten Fall (Kakaosatz nur im
 * Warenkorb-Konsumenten gefixt, die Kaufseite daneben rechnete weiter 19 %);
 * der zweite ist der Anlass dieser Datei (Markt-Steuersatz).
 *
 * WARUM EIN HOOK UND KEINE FREIEN FUNKTIONEN: der Steuersatz haengt jetzt am
 * aufgeloesten MARKT, nicht nur an der Waehrung -- AT fuehrt 20 statt 19
 * Prozent. Der Markt steht in den root-Loaderdaten, und die sind nur aus einer
 * Komponente erreichbar. Ein Modul-Helfer koennte ihn baulich nicht sehen und
 * muesste ihn wieder aus der Waehrung raten; genau dieses Raten war der Defekt.
 *
 * `waehrungVon` bleibt eine freie Funktion: sie liest ein Feld und braucht
 * keinen Markt.
 */

/** Waehrung des API-Preises eines Produkts (Default EUR). */
export const waehrungVon = (p) =>
  p?.priceRange?.minVariantPrice?.currencyCode || 'EUR';

/**
 * Die vier Preis-Helfer einer Landingpage, gebunden an den aufgeloesten Markt.
 *
 * Aufrufform in der Komponente:
 *   const {preisWert, preisLabelVon, compareLabelVon} = useLpPreis();
 *
 * @returns {{preisWert: (p:any)=>number|null,
 *            preisLabelVon: (p:any)=>string|null,
 *            getCompareAtMoney: (p:any)=>any,
 *            compareLabelVon: (p:any)=>string|null}}
 */
export function useLpPreis() {
  const land = useMarktLand();

  const preisWert = (p) =>
    bruttoAnzeige(
      p?.priceRange?.minVariantPrice?.amount,
      p?.handle,
      waehrungVon(p),
      land,
    );
  const preisLabelVon = (p) => formatPreis(preisWert(p), waehrungVon(p));
  const getCompareAtMoney = (p) => {
    const v = p?.variants?.nodes?.[0] || p?.variants?.[0];
    return mitStreichpreisFallback(v?.compareAtPrice, p?.handle, waehrungVon(p));
  };
  // Streichpreis: API-Wert ist bereits der Anzeigewert (kein Steueraufschlag),
  // also kommt der Markt hier bewusst NICHT vor.
  const compareLabelVon = (p) => {
    const money = getCompareAtMoney(p);
    const n = Number.parseFloat(money?.amount);
    if (!Number.isFinite(n)) return null;
    return formatPreis(Math.round(n), money.currencyCode || waehrungVon(p));
  };

  return {preisWert, preisLabelVon, getCompareAtMoney, compareLabelVon};
}
