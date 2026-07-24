import {PRODUKT_TRIO, PRODUKT_TRIO_TITEL} from '~/lib/redesign3themen';
import {BLOCK_PUBLIC, produktLink} from '~/components/reusables/blockLinks';
import {bruttoAnzeige, formatPreis} from '~/lib/markt-pricing';

/**
 * ProduktTrio (Konzept B3, Pos 24): Standard-Closer mit Kurz-Vorstellung aller
 * drei Produkte als 3er-Karten-Grid. Mitte = QiOne 2 Pro mit Bestseller-Badge.
 * Je Karte: Bild, Titel, Tagline, zwei Links (Kauf primary-gold, Details schlicht).
 *
 * Optionale Live-Preise via `products`: liegt das Array vor (z.B. auf einer LP
 * mit Loader), wird der Brutto-Preis wie in TieferSchlaf formatiert; fehlt es
 * (Homepage — loader-frei!), zeigt die Komponente KEINE Preise.
 * Die Komponente selbst nutzt KEINEN Loader.
 *
 * @param {{dataSection?: string, products?: Array}} props
 */
/*
 * Zwei-Block-IA (Job 20260717-storefront-ia-zweiblock-umbau): Link-Ziele
 * block-abhaengig aus der Kontext-Link-Map (Karte rendert im LP-Block auf
 * TieferSchlaf und kuenftig public auf der Homepage); die statischen
 * Datenfelder linkKauf/linkDetail in PRODUKT_TRIO sind damit abgeloest.
 * Default BLOCK_PUBLIC = fail-safe.
 */
export function ProduktTrio({dataSection, products, block = BLOCK_PUBLIC}) {
  // Brutto-Anzeigepreis DELEGIERT an den Markt-Preis-Kanon (markt-pricing.js:
  // bruttoAnzeige + formatPreis) — identisch zu TieferSchlaf/QiOneZellschutz.
  // KEINE eigene Rechenlogik, KEIN fester Steuersatz (der Kanon setzt 0 fuer
  // Nicht-EUR-Endbetraege), KEINE feste Waehrung (Symbol aus dem echten
  // currencyCode des Loaders). Vorher waehrungsblind: round(amount*1.19)+EUR
  // fest -> US-Kachel "1.646 €" statt "$1,383" (Bug 2026-07-21). bruttoAnzeige
  // liefert null bei fehlendem Betrag -> es wird KEIN Preis gerendert.
  const preisVon = (handle) => {
    if (!products || !products.length) return null;
    const p = products.find((x) => x?.handle === handle);
    const waehrung = p?.priceRange?.minVariantPrice?.currencyCode || 'EUR';
    return formatPreis(
      bruttoAnzeige(p?.priceRange?.minVariantPrice?.amount, handle, waehrung),
      waehrung,
    );
  };

  return (
    <section
      className="rd3-trio NormalSectionSize"
      data-section={dataSection}
    >
      <h2 className="rd3-trio__h2">{PRODUKT_TRIO_TITEL}</h2>
      <div className="rd3-trio__grid">
        {PRODUKT_TRIO.map((produkt) => {
          const preis = preisVon(produkt.handle);
          return (
            <article
              key={produkt.id}
              className={`rd3-trio__card${
                produkt.bestseller ? ' rd3-trio__card--bestseller' : ''
              }`}
            >
              {produkt.bestseller && (
                <span className="rd3-trio__badge">Bestseller</span>
              )}
              <div className="rd3-trio__media">
                <img src={produkt.bild} alt={produkt.alt} loading="lazy" />
              </div>
              <h3 className="rd3-trio__titel">{produkt.title}</h3>
              <p className="rd3-trio__tagline">{produkt.tagline}</p>
              {preis && <p className="rd3-trio__preis">ab {preis}</p>}
              <div className="rd3-trio__links">
                <a
                  className="btn--primary rd3-trio__kauf"
                  href={produktLink(produkt.handle, block, 'kauf')}
                >
                  Jetzt kaufen
                </a>
                <a className="rd3-trio__detail" href={produktLink(produkt.handle, block, 'detail')}>
                  Mehr erfahren
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
