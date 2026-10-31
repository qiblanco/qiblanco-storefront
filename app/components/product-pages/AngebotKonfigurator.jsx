import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {useMarktLand} from '~/lib/markt-land';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {betragText} from '~/lib/betrag-text';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import alphaAngebotStyles from '~/styles/alpha-angebot.css?url';

/*
 * ANGEBOTSSEITEN IM APPLE-STIL (s13-r3, Christian Zx 29.10.2026): die zwei
 * Angebote /products/pjdz538hgs0 (QiOne® 2 Pro + Necklace) und
 * /products/8kendiw34hd (2× QiOne® 2 Pro) auf demselben Gerüst wie
 * /products/qione-2-pro: AlphaVorlage mit den Slots Wissen, Stimmen, FAQ.
 * Die Daten je Angebot stehen in <handle>-alpha-daten.js. Die Stylesheets der
 * Alpha laden nur hier (links() der Route kennt die Loaderdaten nicht): ohne
 * Schalter dieselben <link>-Tags wie die heutige Seite.
 */
export function AngebotKonfigurator({product, ketten, daten}) {
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
      <link rel="stylesheet" href={alphaAngebotStyles} />
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
          faq: <AlphaFaqMitRate daten={mitPreis(daten.FAQ, preisText)} product={product} />,
        }}
      />
    </>
  );
}

/**
 * `{preis}` in den Fragen durch den Shopify-Preis ersetzen (Seite und Kasse
 * nennen dieselbe Zahl). Ohne Preis entfällt die Frage, die ihn nennt.
 * Dieselbe Regel wie in routes/products.qione-2-pro.jsx.
 */
export function mitPreis(faq, preisText) {
  const fragen = (faq?.fragen ?? [])
    .filter((x) => preisText || !`${x.f} ${x.a}`.includes('{preis}'))
    .map((x) => ({
      f: x.f.replaceAll('{preis}', preisText ?? ''),
      a: x.a.replaceAll('{preis}', preisText ?? ''),
    }));
  return {...faq, fragen};
}
