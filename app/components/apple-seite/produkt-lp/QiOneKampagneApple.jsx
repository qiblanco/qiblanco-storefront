import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import * as ALPHA_DATEN from '~/components/product-pages/qione-2-pro-alpha-daten';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {ProduktVideoKachel} from '~/components/reusables/ProduktVideos';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaVergleich,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {YoutubeIframe} from '~/components/reusables/YoutubeIframe';
import {useGoogleRating} from '~/lib/googleRating';
import {useMarktLand} from '~/lib/markt-land';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {betragText} from '~/lib/betrag-text';
import {APPLE_SEITE_ATTR} from '~/lib/apple-seiten';

/*
 * APPLE-FASSUNG /pages/qione-2-pro (Kampagnen-Kaufseite der Paid-Strecke;
 * Grossjob 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo, s05).
 *
 * Christian 28.09.2026: diese Seite ist GLEICH DER PRODUKTSEITE bis auf die
 * Beschreibung. Die Produktseite /products/qione-2-pro ist seit dem
 * Konfigurator-Grossjob 20261027 die Apple-Kaufseite (AlphaVorlage). Die
 * Apple-Fassung hier rendert deshalb denselben Konfigurator mit denselben
 * Daten (qione-2-pro-alpha-daten.js), nur in einer Hülle mit dem Marker
 * data-apple-seite (Naht-Vertrag KONZEPT §4.1).
 *
 * NACHBAU, NICHT IMPORT: der Konfigurator ist in routes/products.qione-2-pro.jsx
 * eine lokale Funktion. Ein Import aus einer anderen Route zöge deren .server-
 * Module in den Client-Build, und die fertige Kaufseite bleibt in diesem
 * Grossjob unberührt. Der Rumpf unten ist Zeile für Zeile der von
 * Konfigurator() dort (Stand origin/main 4e6548c5). Wer dort etwas ändert,
 * zieht es hier nach; gemeinsame Teile (AlphaVorlage, Slots, Daten) wirken
 * ohnehin auf beide.
 */

/** Hülle mit Marker: die Kaufseite der Kampagne in der Apple-Fassung. */
export function QiOneKampagneApple({product, ketten, vergleichsPreise, seite}) {
  return (
    <div {...{[APPLE_SEITE_ATTR]: seite}}>
      <Konfigurator product={product} ketten={ketten} vergleichsPreise={vergleichsPreise} />
    </div>
  );
}

export {ALPHA_DATEN as QIONE_ALPHA_DATEN};

function Konfigurator({product, ketten, vergleichsPreise}) {
  const land = useMarktLand();
  const money = product?.selectedOrFirstAvailableVariant?.price;
  const preisText = money
    ? betragText(
        bruttoAnzeige(money.amount, product.handle, money.currencyCode, land),
        money.currencyCode,
      )
    : null;
  return (
    <>
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      <link rel="stylesheet" href={alphaQiOneStyles} />
      <AlphaVorlage
        product={product}
        daten={ALPHA_DATEN}
        ketten={ketten}
        videoKachel={<ProduktVideoKachel handle="qione-2-pro" />}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          // Gewinner (s02 Z40): Gerätevergleich als „Modelle vergleichen“.
          // Die id ist das Ziel des Kopf-Links (s03 kopf.vergleich_link).
          vergleich: (
            <div id="geraetevergleich">
              <AlphaVergleich
                handle="qione-2-pro"
                daten={ALPHA_DATEN.VERGLEICH}
                preise={vergleichsPreise}
                eigenerPreis={money}
              />
            </div>
          ),
          wissen: (
            <>
              <QiOneNutzen daten={ALPHA_DATEN.NUTZEN} />
              <AlphaWissen
                kapitel={ALPHA_DATEN.WISSEN.kapitel}
                studien={ALPHA_DATEN.WISSEN.studien}
                bilder={product?.images?.nodes ?? []}
              />
            </>
          ),
          // Menschen zuerst (Kanon: Menschen ziehen): der Weltrekordhalter,
          // dann die Google-Stimmen und die Instagram-Reihe der heutigen Seite.
          stimmen: (
            <>
              <QiOneWeltrekord daten={ALPHA_DATEN.WELTREKORD} />
              <AlphaStimmen daten={ALPHA_DATEN.STIMMEN_GOOGLE} igProdukt="QiOne 2 Pro" />
            </>
          ),
          faq: <AlphaFaqMitRate daten={mitPreis(ALPHA_DATEN.FAQ, preisText)} product={product} />,
        }}
      />
    </>
  );
}

/**
 * `{preis}` in den Fragen durch den Shopify-Preis ersetzen (Seite und Kasse
 * nennen dieselbe Zahl). Ohne Preis entfällt die Frage, die ihn nennt.
 */
function mitPreis(faq, preisText) {
  const fragen = (faq?.fragen ?? [])
    .filter((x) => preisText || !`${x.f} ${x.a}`.includes('{preis}'))
    .map((x) => ({
      f: x.f.replaceAll('{preis}', preisText ?? ''),
      a: x.a.replaceAll('{preis}', preisText ?? ''),
    }));
  return {...faq, fragen};
}

/** Nutzen-Raster (s03 nutzen) nach Apple: vier Spalten, Etikett, Titel, Text. */
function QiOneNutzen({daten}) {
  const google = useGoogleRating();
  if (!daten?.spalten?.length) return null;
  return (
    <div className="avq-nutzen" data-av-nutzen="">
      <h2 className="tas-box-titel">{mitMarkeR(daten.ueberschrift)}</h2>
      <ul className="avq-nutzen-raster">
        {daten.spalten.map((s) => {
          const link = s.link
            ? {
                text: s.link.text.replace('{sterne}', google.komma),
                href: s.link.href === 'google' ? google.url : s.link.href,
                fremd: s.link.href === 'google',
              }
            : null;
          return (
            <li key={s.etikett} className="avq-spalte">
              <p className="avq-etikett">{s.etikett}</p>
              <h3 className="avq-titel">{mitMarkeR(s.titel)}</h3>
              <p className="avq-text">{mitMarkeR(s.text)}</p>
              {link ? (
                <a
                  className="avq-link"
                  href={link.href}
                  {...(link.fremd ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
                >
                  {link.text}
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Weltrekordhalter (s03 weltrekord): Video-Fassade links, Text rechts. */
function QiOneWeltrekord({daten}) {
  if (!daten?.video) return null;
  return (
    <div className="avq-weltrekord" data-av-weltrekord="">
      <div className="avq-weltrekord-video">
        <YoutubeIframe
          link={`https://www.youtube.com/embed/${daten.video}`}
          titel={daten.videoTitel}
        />
      </div>
      <div className="avq-weltrekord-text">
        <p className="taw-etikett">{daten.siegel}</p>
        <h2 className="tas-box-titel">{daten.titel}</h2>
        <p>{daten.text}</p>
        {daten.quellen?.length ? (
          <ul className="avq-quellen" aria-label="Quellen">
            {daten.quellen.map((q) => (
              <li key={q.href}>
                <a href={q.href} target="_blank" rel="noopener noreferrer">
                  {q.text}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
