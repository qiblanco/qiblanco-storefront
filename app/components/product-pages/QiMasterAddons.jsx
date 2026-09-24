import {ProductPrice} from '~/components/ProductPrice';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {QM_ADDON, QM_HANDLE} from '~/lib/qi-master-addons';

/*
 * QiMasterAddons — der Bereich direkt unter dem Kaufknopf von
 * /products/qi-master (Christian 2026-09-24: „einen Bereich unterhalb vom
 * Kaufknopf, wo man Add-ons auswählen kann").
 *
 * ZWEI KARTEN, ZWEI BEDIENFORMEN, UND DAS IST ABSICHT:
 *  - Wunschnummer: die Auswahl IST der Schalter. „Ohne Wunschnummer" steht
 *    vorn; wer eine Nummer wählt, hat das Add-on gewählt. Einen Schalter
 *    „an" ohne Nummer gibt es damit nicht — sonst läge im Warenkorb ein
 *    Add-on, von dem niemand weiß, welche Nummer es trägt.
 *  - Goldkette: Schalter plus Länge, 60 cm vorausgewählt (Festlegung des
 *    Auftrags). Wer die Länge ändert, will die Kette — der Schalter geht mit.
 *
 * DIE LÄNGEN STEHEN AUFSTEIGEND (40 · 45 · 50 · 60 · 75): eine Länge ist eine
 * Skala, der Kunde sucht seine Zahl. Die Beliebtheit, die für 60 cm spricht,
 * ist Nachfrage der QiOne-Kette, nicht dieses Stücks — sie steht deshalb
 * nicht als „meistgewählt" auf der Seite.
 *
 * VERGEBENE NUMMERN bleiben in der Liste sichtbar und gesperrt („vergeben").
 * Ob eine Nummer frei ist, sagt Shopify (availableForSale), nicht diese Datei;
 * das Register dahinter führt shop-manager/bin/qm-seriennummern.
 *
 * PREISE kommen aus Shopify (netto) und laufen durch dieselbe Anzeige wie der
 * Qi-Master-Preis darüber (ProductPrice, Markt-Land). Die Summe rechnet mit
 * denselben gerundeten Bruttowerten, die die Karten zeigen.
 */
export function QiMasterAddons({addons, qmPreis, auswahl, setAuswahl}) {
  const land = useMarktLand();
  const wn = addons?.wunschnummer;
  const kette = addons?.kette;
  if (!wn && !kette) return null;

  const wnVariante = wn?.variants?.nodes?.find((v) => v.id === auswahl.wunschnummer);
  const ketteVariante = kette?.variants?.nodes?.find((v) => v.id === auswahl.kette);
  const brutto = (money, handle) =>
    money ? bruttoAnzeige(money.amount, handle, money.currencyCode, land) : 0;
  const zusatz =
    (wnVariante ? brutto(wnVariante.price, QM_ADDON.wunschnummer) : 0) +
    (auswahl.ketteAn && ketteVariante ? brutto(ketteVariante.price, QM_ADDON.kette) : 0);
  const summe = zusatz ? brutto(qmPreis, QM_HANDLE) + zusatz : 0;

  return (
    <section className="qm-addons" aria-labelledby="qm-addons-titel">
      {/* Bewusst KEIN h2: die Seite führt genau EINEN H2-Stil
          (--qm-fs-h2, design-rubrik „EIN H2-Stil je Seite"), und der wäre in
          der schmalen Kaufspalte lauter als der Preis. Die Zeile benennt den
          Bereich über aria-labelledby. */}
      <p id="qm-addons-titel" className="qm-addons__titel">
        Dazu für deinen Qi Master®
      </p>
      <div className="qm-addons__karten">
        {wn ? (
          <div className={`qm-addon${wnVariante ? ' qm-addon--an' : ''}`}>
            <div className="qm-addon__kopf">
              <span className="qm-addon__name">Wunschnummer</span>
              <ProductPrice
                handle={QM_ADDON.wunschnummer}
                price={wn.variants.nodes[0]?.price}
              />
            </div>
            <p className="qm-addon__text">
              Jeder Qi Master® trägt eine Nummer der Alpha Serie von 1 bis 100.
              Wähle deine.
            </p>
            <label className="qm-addon__feld">
              <span className="qm-addon__feldname">Nummer</span>
              <select
                value={auswahl.wunschnummer || ''}
                onChange={(e) =>
                  setAuswahl({...auswahl, wunschnummer: e.target.value || null})
                }
              >
                <option value="">Ohne Wunschnummer</option>
                {wn.variants.nodes.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                    {v.availableForSale ? v.title : `${v.title} (vergeben)`}
                  </option>
                ))}
              </select>
            </label>
            <p className="qm-addon__hinweis">
              Ohne Wunschnummer bekommst du beim Versand eine freie Nummer der
              Serie.
            </p>
          </div>
        ) : null}
        {kette ? (
          <div className={`qm-addon${auswahl.ketteAn ? ' qm-addon--an' : ''}`}>
            <label className="qm-addon__kopf qm-addon__schalter">
              <input
                type="checkbox"
                checked={!!auswahl.ketteAn}
                onChange={(e) => setAuswahl({...auswahl, ketteAn: e.target.checked})}
              />
              <span className="qm-addon__name">Goldkette</span>
              <ProductPrice
                handle={QM_ADDON.kette}
                price={kette.variants.nodes[0]?.price}
              />
            </label>
            <p className="qm-addon__text">
              Mit Logo und Spezialsicherheitsverschluss.
            </p>
            <label className="qm-addon__feld">
              <span className="qm-addon__feldname">Länge</span>
              <select
                value={auswahl.kette || ''}
                onChange={(e) =>
                  setAuswahl({...auswahl, kette: e.target.value, ketteAn: true})
                }
              >
                {kette.variants.nodes.map((v) => (
                  <option key={v.id} value={v.id} disabled={!v.availableForSale}>
                    {v.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>
      {summe ? (
        <p className="qm-addons__summe" aria-live="polite">
          Zusammen: <strong>{formatPreis(summe, qmPreis?.currencyCode || 'EUR', 'pdp')}</strong>
        </p>
      ) : null}
    </section>
  );
}
