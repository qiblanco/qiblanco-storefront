import {useMemo, useRef} from 'react';
import {AlphaVorlage} from '~/components/product-pages/AlphaVorlage';
import {mitPreis} from '~/components/product-pages/AngebotKonfigurator';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {
  AlphaFaqMitRate,
  AlphaStimmen,
  AlphaWissen,
} from '~/components/product-pages/AlphaVorlageSlots';
import {Einsatz, QiOneNutzen, QiOneWeltrekord} from '~/components/black-friday-2026/BfOriginalBausteine';
import * as DATEN_8K from '~/components/product-pages/8kendiw34hd-alpha-daten';
import * as DATEN_PJDZ from '~/components/product-pages/pjdz538hgs0-alpha-daten';
import * as DATEN_QIONE from '~/components/product-pages/qione-2-pro-alpha-daten';
import * as DATEN_QIBRACELET from '~/components/product-pages/qibracelet-alpha-daten';
import * as DATEN_QIHOME from '~/components/product-pages/qihome-air-alpha-daten';
import {useMarktLand} from '~/lib/markt-land';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {betragText} from '~/lib/betrag-text';
import produktVorlageStyles from '~/styles/the-alpha-produkt.css?url';
import alphaVorlageStyles from '~/styles/alpha-vorlage.css?url';
import alphaSlotStyles from '~/styles/alpha-vorlage-slots.css?url';
import alphaQiOneStyles from '~/styles/alpha-qione.css?url';
import alphaAngebotStyles from '~/styles/alpha-angebot.css?url';
import wissenStyles from '~/styles/the-alpha-shop.css?url';
import faqStyles from '~/styles/the-alpha-faq.css?url';
import kaufleisteStyles from '~/styles/qb-kaufleiste.css?url';
// Instagram-Reihe im Stimmen-Slot (AlphaStimmen): ohne dieses Stylesheet stehen die Kacheln am Computer
// untereinander in voller Breite (gemessen 12.11.2026: Slot 14 875 px statt 532 px wie auf /products/qione-2-pro).
import igStyles from '~/styles/ig-testimonials.css?url';
import {BfDealRahmen} from '~/components/black-friday-2026/DealGalerie';
import {datenStudienNeutral} from '~/components/black-friday-2026/bf-kachel-neutral';
import {
  BfSchlussBanner,
  ohneDartsch,
  useBfFunnelLinks,
} from '~/components/black-friday-2026/BfDealAnhang';

/*
 * BF-DEAL-SEITE in der Alpha-Fassung (Elina EL-20261111-aff06215): dieselbe
 * Seite wie das Basisprodukt, im BfDealKontext. Der Kontext macht den
 * Kaufknopf zum Warenkorb-Link und setzt die Deal-Galerie unter die
 * Zusammenfassung. Preise kommen schon gesetzt aus dem Loader
 * (bf-deal-seite.server.js).
 *
 * ÜBERZEUGUNGS-SECTIONS (Elina EL-20261112-452cdd56, präzisiert in -f4a91091
 * und -600b5d42): Was oben auf der Deal-Seite steht, bleibt (Kopf, Wahl,
 * Bezahlart, Zusammenfassung mit Kaufknopf, Galerie der anderen Deals, Box).
 * Darunter stehen die Sections der normalen Seite des HAUPTPRODUKTS in ihrer
 * Reihenfolge, mit denselben Bausteinen und denselben Daten, damit eine
 * Änderung am Original hier mitkommt:
 *   2x QiOne 2 Pro, QiOne 2 Pro + Necklace  -> /products/qione-2-pro (nur diese Seite)
 *   QiBracelet                               -> /products/qibracelet
 *   QiHome Air                               -> /products/qihome-air
 * Nicht übernommen: Kaufbereich und Preise des Originals und der
 * Gerätevergleich (er nennt die normalen Preise und führt auf die normalen
 * Seiten). Vor den Fragen steht der Schluss-Banner. Links in den Sections
 * führen nicht zurück in den Shop (useBfFunnelLinks), Studientexte ohne
 * Personennamen (ohneDartsch, EL-20261112-0a9978b4).
 */
// Studien-Kacheln ohne Personen- und Institutsnamen, als unsere Studien (Elina EL-20261112-0a9978b4).
const ANGEBOT = {'8kendiw34hd': datenStudienNeutral(DATEN_8K), pjdz538hgs0: datenStudienNeutral(DATEN_PJDZ)};
const PRODUKT_DATEN = {
  qibracelet: datenStudienNeutral(DATEN_QIBRACELET),
  'qihome-air': datenStudienNeutral(DATEN_QIHOME),
};
const IG_PRODUKT = {qibracelet: 'QiBracelet'};
// Überschrift der Instagram-Reihe nur auf den Deal-Seiten (Elina EL-20261113-f005fbd5); die normalen
// Produktseiten behalten „Auf Instagram.“ aus ihren Daten.
const BF_IG_UEBERSCHRIFT = 'Echte Kundenstimmen auf Instagram';

export function BfDealAlpha({seite, product, ketten}) {
  const wurzel = useRef(null);
  useBfFunnelLinks(wurzel);
  return (
    <BfDealRahmen seite={seite}>
      <div ref={wurzel} className="bf-deal-inhalt">
        {ANGEBOT[seite.basis] ? (
          <BfDealAngebot product={product} ketten={ketten} daten={ANGEBOT[seite.basis]} />
        ) : (
          <BfDealProdukt
            product={product}
            ketten={ketten}
            basis={seite.basis}
            daten={PRODUKT_DATEN[seite.basis]}
          />
        )}
      </div>
    </BfDealRahmen>
  );
}

/** Einträge einer Liste ohne Doppelte (erster gewinnt). */
function einmal(liste, schluessel) {
  const gesehen = new Set();
  return (liste ?? []).filter((x) => {
    const k = schluessel(x);
    if (gesehen.has(k)) return false;
    gesehen.add(k);
    return true;
  });
}

/*
 * Gleiche Frage = gleiche ersten zwei Wörter und gleiches letztes Wort
 * („Kann ich das Paket zurückgeben …?“ und „Kann ich ihn zurückgeben …?“).
 * So bleibt die Paket-Frage der Deal-Seite stehen, und die gleichlautende
 * Frage des Originals kommt nicht ein zweites Mal.
 */
function frageSchluessel(x) {
  const w = String(x?.f ?? '')
    .toLowerCase()
    .replace(/[®?.,:!]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return `${w.slice(0, 2).join(' ')}|${w[w.length - 1] ?? ''}`;
}

/*
 * Fragen des Originals, die seinen eigenen Preis nennen ({preis}, {rate…}),
 * passen nicht zum Deal-Preis und entfallen; die Deal-Seite hat ihre eigene
 * Preisfrage.
 */
function ohnePreisFragen(fragen) {
  return (fragen ?? []).filter((x) => !/\{(preis|rate)/.test(`${x.f} ${x.a}`));
}

function DealStile({qione = false}) {
  return (
    <>
      {/* wie auf der Originalseite zuerst geladen: spätere Deal-Stile gewinnen bei gleicher Spezifität */}
      <link rel="stylesheet" href={igStyles} />
      <link rel="stylesheet" href={produktVorlageStyles} />
      <link rel="stylesheet" href={alphaVorlageStyles} />
      <link rel="stylesheet" href={wissenStyles} />
      <link rel="stylesheet" href={faqStyles} />
      <link rel="stylesheet" href={alphaSlotStyles} />
      {qione ? <link rel="stylesheet" href={alphaQiOneStyles} /> : null}
      {qione ? <link rel="stylesheet" href={alphaAngebotStyles} /> : null}
      <link rel="stylesheet" href={kaufleisteStyles} />
    </>
  );
}

/** 2x QiOne 2 Pro / QiOne 2 Pro + Necklace: oben die Deal-Fassung, darunter die QiOne-2-Pro-Sections. */
function BfDealAngebot({product, ketten, daten}) {
  const land = useMarktLand();
  const money = product?.selectedOrFirstAvailableVariant?.price;
  const preisText = money
    ? betragText(bruttoAnzeige(money.amount, product.handle, money.currencyCode, land), money.currencyCode)
    : null;
  const deal = useMemo(() => ohneDartsch(daten), [daten]);
  const original = useMemo(() => ohneDartsch(DATEN_QIONE), []);
  const kapitel = einmal(
    [...(deal.WISSEN?.kapitel ?? []), ...(original.WISSEN?.kapitel ?? [])],
    (k) => k.titel,
  );
  const stimmen = {
    ...original.STIMMEN_GOOGLE,
    instagram: BF_IG_UEBERSCHRIFT,
    stimmen: einmal(
      [...(deal.STIMMEN_GOOGLE?.stimmen ?? []), ...(original.STIMMEN_GOOGLE?.stimmen ?? [])],
      (s) => s.text,
    ),
  };
  const faq = {
    ...deal.FAQ,
    fragen: einmal([...(deal.FAQ?.fragen ?? []), ...ohnePreisFragen(original.FAQ?.fragen)], frageSchluessel),
  };
  return (
    <>
      <DealStile qione />
      <AlphaVorlage
        product={product}
        daten={deal}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          wissen: (
            <>
              <QiOneNutzen daten={original.NUTZEN} />
              <AlphaWissen
                kapitel={kapitel}
                studien={deal.WISSEN?.studien ?? original.WISSEN?.studien}
                bilder={product?.images?.nodes ?? []}
              />
            </>
          ),
          stimmen: (
            <>
              <QiOneWeltrekord daten={original.WELTREKORD} />
              <AlphaStimmen daten={stimmen} igProdukt="QiOne 2 Pro" />
            </>
          ),
          faq: (
            <>
              <BfSchlussBanner />
              <AlphaFaqMitRate daten={mitPreis(faq, preisText)} product={product} />
            </>
          ),
        }}
      />
    </>
  );
}

/** QiBracelet® / QiHome® Air wie ihre Kaufseite, ohne Gerätevergleich (normale Preise). */
function BfDealProdukt({product, ketten, basis, daten: roh}) {
  const daten = useMemo(() => (roh ? ohneDartsch(roh) : null), [roh]);
  if (!daten) return null;
  return (
    <>
      <DealStile />
      <AlphaVorlage
        product={product}
        daten={daten}
        ketten={ketten}
        vertrauen={<EuGewaehrleistungsHinweis />}
        slots={{
          // QiHome Air: die Einsatz-Kacheln („Wohnung. Haus. Praxis.“) stehen im
          // Original im Vergleichs-Slot vor dem Gerätevergleich; nur sie kommen mit.
          vergleich: daten.EINSATZ ? <Einsatz daten={daten.EINSATZ} /> : null,
          wissen: (
            <AlphaWissen
              kapitel={daten.WISSEN.kapitel}
              studien={daten.WISSEN.studien}
              bilder={product?.images?.nodes ?? []}
            />
          ),
          stimmen: (
            <AlphaStimmen
              daten={{...daten.STIMMEN_GOOGLE, instagram: BF_IG_UEBERSCHRIFT}}
              igProdukt={IG_PRODUKT[basis] ?? null}
            />
          ),
          faq: (
            <>
              <BfSchlussBanner />
              <AlphaFaqMitRate daten={daten.FAQ} product={product} />
            </>
          ),
        }}
      />
    </>
  );
}
