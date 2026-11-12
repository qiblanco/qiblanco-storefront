import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import {AngebotKonfigurator} from '~/components/product-pages/AngebotKonfigurator';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import * as DATEN_8K from '~/components/product-pages/8kendiw34hd-alpha-daten';
import * as DATEN_PJDZ from '~/components/product-pages/pjdz538hgs0-alpha-daten';
import * as DATEN_QIBRACELET from '~/components/product-pages/qibracelet-alpha-daten';
import * as DATEN_QIHOME from '~/components/product-pages/qihome-air-alpha-daten';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
import {BfDealRahmen} from '~/components/black-friday-2026/DealGalerie';
import {datenStudienNeutral} from '~/components/black-friday-2026/bf-studien-neutral';

/*
 * BF-DEAL-SEITE in der Alpha-Fassung (Elina EL-20261111-aff06215): dieselbe
 * Seite wie das Basisprodukt (AngebotKonfigurator bzw. AlphaVorlage), im
 * BfDealKontext. Der Kontext macht den Kaufknopf zum Warenkorb-Link und setzt
 * die Deal-Galerie unter die Zusammenfassung. Preise kommen schon gesetzt aus
 * dem Loader (bf-deal-seite.server.js).
 */
// Studien-Kacheln ohne Personen- und Institutsnamen, als unsere Studien (Elina EL-20261112-0a9978b4).
const ANGEBOT = {'8kendiw34hd': datenStudienNeutral(DATEN_8K), pjdz538hgs0: datenStudienNeutral(DATEN_PJDZ)};
const PRODUKT_DATEN = {
  qibracelet: datenStudienNeutral(DATEN_QIBRACELET),
  'qihome-air': datenStudienNeutral(DATEN_QIHOME),
};

export function BfDealAlpha({seite, product, ketten}) {
  return (
    <BfDealRahmen seite={seite}>
      {ANGEBOT[seite.basis] ? (
        <AngebotKonfigurator product={product} ketten={ketten} daten={ANGEBOT[seite.basis]} />
      ) : (
        <BfDealProdukt product={product} ketten={ketten} daten={PRODUKT_DATEN[seite.basis]} />
      )}
    </BfDealRahmen>
  );
}

/** QiBracelet® / QiHome® Air wie ihre Kaufseite, ohne Gerätevergleich (normale Preise). */
function BfDealProdukt({product, ketten, daten}) {
  if (!daten) return null;
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={kaufleisteStyles} />
      <AlphaVorlage
        product={product}
        daten={daten}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          wissen: (
            <AlphaWissen
              kapitel={daten.WISSEN.kapitel}
              studien={daten.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={daten.STIMMEN_GOOGLE} />,
          faq: <AlphaFaqMitRate daten={daten.FAQ} product={product} />,
        }}
      />
    </>
  );
}
