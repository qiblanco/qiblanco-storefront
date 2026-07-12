import {PRODUKT_TRIO, PRODUKT_TRIO_TITEL} from '~/lib/redesign3themen';

const VAT = 1.19;

/**
 * Brutto-Preis-Formatierung — identisches Muster wie TieferSchlaf PricingSection
 * (priceRange.minVariantPrice * MwSt, gerundet, de-DE-EUR ohne Nachkommastellen).
 * Gibt null zurueck, wenn kein Preis vorliegt (dann wird KEIN Preis gerendert).
 */
const fmtBrutto = (amount) => {
  if (!amount) return null;
  const n = Math.round(parseFloat(amount) * VAT);
  return n.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

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
export function ProduktTrio({dataSection, products}) {
  const preisVon = (handle) => {
    if (!products || !products.length) return null;
    const p = products.find((x) => x?.handle === handle);
    return fmtBrutto(p?.priceRange?.minVariantPrice?.amount);
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
                  href={produkt.linkKauf}
                >
                  Jetzt kaufen
                </a>
                <a className="rd3-trio__detail" href={produkt.linkDetail}>
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
