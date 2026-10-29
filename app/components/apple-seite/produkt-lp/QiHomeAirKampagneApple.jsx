import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qihome-air-alpha-daten';
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
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {APPLE_SEITE_ATTR} from '~/lib/apple-seiten';

/*
 * APPLE-FASSUNG /pages/qihome-air (Kampagnen-Kaufseite der Paid-Strecke; Grossjob
 * 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo, s05).
 *
 * Christian 28.09.2026: /pages/qihome-air ist dieselbe Seite wie /products/qihome-air.
 * Die Produktseite ist seit dem Konfigurator-Grossjob 20261027 die
 * Apple-Kaufseite (AlphaVorlage). Die Apple-Fassung hier rendert denselben
 * Konfigurator mit denselben Daten (qihome-air-alpha-daten.js) in einer Hülle mit
 * dem Marker data-apple-seite (Naht-Vertrag KONZEPT §4.1).
 *
 * NACHBAU, NICHT IMPORT (wie QiOneKampagneApple.jsx): der Rumpf unten ist
 * Zeile für Zeile Konfigurator() aus routes/products.qihome-air.jsx (Stand
 * origin/main 4e6548c5). Ein Import aus der Route zöge deren .server-Module
 * in den Client-Build, und die fertige Kaufseite bleibt unberührt.
 */

/** Hülle mit Marker: die Kaufseite der Kampagne in der Apple-Fassung. */
export function QiHomeAirKampagneApple({product, ketten, vergleichsPreise, seite}) {
  return (
    <div {...{[APPLE_SEITE_ATTR]: seite}}>
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    </div>
  );
}

export {ALPHA_DATEN as QIHOME_ALPHA_DATEN};

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
          // Erst „wo“ (Einsatz statt Varianten-Schritt, s04), dann „welches“:
          // der Gewinner-Kandidat Gerätevergleich (s02 Z40) als „Modelle
          // vergleichen“. Die Einsatzkarte bleibt in B (ihr fester Text „über
          // 450 … Teil der Revolution“ widerspricht Kachel „Über 400“ und den
          // in s04 gestrichenen Floskeln).
          vergleich: (
            <>
              <Einsatz daten={ALPHA_DATEN.EINSATZ} />
              <AlphaVergleich
                handle="qihome-air"
                daten={ALPHA_DATEN.VERGLEICH}
                preise={vergleichsPreise}
                eigenerPreis={product?.selectedOrFirstAvailableVariant?.price}
              />
            </>
          ),
          wissen: (
            <AlphaWissen
              kapitel={ALPHA_DATEN.WISSEN.kapitel}
              studien={ALPHA_DATEN.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} />,
          faq: <AlphaFaqMitRate daten={ALPHA_DATEN.FAQ} product={product} />,
        }}
      />
    </>
  );
}

/*
 * EINSATZ (nur QiHome Air, s04): drei Orte, keine Auswahl. Kachel-Stil der
 * Faktenkacheln (av-kacheln), eine Überschrift im H2-Stil der Slots.
 */
function Einsatz({daten}) {
  if (!daten?.zeilen?.length) return null;
  return (
    <div className="av-einsatz" data-av-einsatz="" style={{marginBottom: 'var(--tas-s-8)'}}>
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="av-kacheln">
        {daten.zeilen.map((z) => (
          <li key={z.titel} className="av-kachel">
            <span className="av-kachel-zahl">{z.titel}</span>
            <span className="av-kachel-satz">{mitMarkeR(z.zeile)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
