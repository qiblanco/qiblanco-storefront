import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qibracelet-alpha-daten';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {APPLE_SEITE_ATTR} from '~/lib/apple-seiten';

/*
 * APPLE-FASSUNG /pages/qibracelet (Kampagnen-Kaufseite der Paid-Strecke; Grossjob
 * 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo, s05).
 *
 * Christian 28.09.2026: /pages/qibracelet ist dieselbe Seite wie /products/qibracelet.
 * Die Produktseite ist seit dem Konfigurator-Grossjob 20261027 die
 * Apple-Kaufseite (AlphaVorlage). Die Apple-Fassung hier rendert denselben
 * Konfigurator mit denselben Daten (qibracelet-alpha-daten.js) in einer Hülle mit
 * dem Marker data-apple-seite (Naht-Vertrag KONZEPT §4.1).
 *
 * NACHBAU, NICHT IMPORT (wie QiOneKampagneApple.jsx): der Rumpf unten ist
 * Zeile für Zeile Konfigurator() aus routes/products.qibracelet.jsx (Stand
 * origin/main 4e6548c5). Ein Import aus der Route zöge deren .server-Module
 * in den Client-Build, und die fertige Kaufseite bleibt unberührt.
 */

/** Hülle mit Marker: die Kaufseite der Kampagne in der Apple-Fassung. */
export function QiBraceletKampagneApple({product, ketten, vergleichsPreise, seite}) {
  return (
    <div {...{[APPLE_SEITE_ATTR]: seite}}>
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    </div>
  );
}

export {ALPHA_DATEN as QIBRACELET_ALPHA_DATEN};

function Konfigurator({product, ketten, vergleichsPreise}) {
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          // Gewinner (s02 Z40): Gerätevergleich als „Modelle vergleichen“.
          vergleich: (
            <AlphaVergleich
              handle="qibracelet"
              daten={ALPHA_DATEN.VERGLEICH}
              preise={vergleichsPreise}
              eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
            />
          ),
          wissen: (
            <AlphaWissen
              kapitel={ALPHA_DATEN.WISSEN.kapitel}
              studien={ALPHA_DATEN.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} igProdukt="QiBracelet" />,
          faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />,
        }}
      />
    </>
  );
}
