import {useState} from 'react';
import {useNavigate} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {betragText} from '~/components/campaign/the-alpha-kauf-laden';
import {MarkenName} from '~/components/reusables/MarkenName';
import {BEWERTUNGEN_PFAD} from '~/components/reusables/AlleBewertungenLink';
import {
  findeRezensionsZiel,
  scrolleZuRezensionen,
} from '~/components/reusables/GoogleRezensionenBereich';
import {PRODUCT_VARIANT_FRAGMENT} from '~/lib/qioneProductQuery';

/*
 * ALPHA-VORLAGE FÜR PRODUKTSEITEN (Elina EL-20261027-c05a2273, 27.10.2026:
 * „Neue Produktseiten-Vorlage nach Qi Alpha … Quiet Luxury“, Dauerregel:
 * Standard für alle Produktseiten, schrittweise nach Elinas GO). Erste Seite:
 * /products/qione-2-pro, NUR VORSCHAU.
 *
 * Bauform und Stil kommen von der Qi-Alpha-Kaufseite (campaign/TheAlphaShop.jsx,
 * styles/the-alpha-produkt.css): dieselben tas-*-Klassen, damit eine Änderung
 * am Alpha-Stil hier mitgeht. Eigenes steht in styles/alpha-vorlage.css.
 *
 * AUFBAU (Elinas Reihenfolge, rechte Spalte von oben):
 *   1 Name mit kleinem ®   2 Claim   3 Sterne + Nutzerzahl
 *   4 drei Merkmale, dünne Linien, Linien-Icons in Gold
 *   5 Preis groß + „Designed in Germany. Made in Germany.“
 *   6 Ketten-Kacheln mit Länge, Preis, Kettenbildern (Gold vorbereitet, aus)
 *   7 „In den Warenkorb legen“ (Gerät + gewählte Kette)
 *   8 Vertrauens-Icons (Slot `vertrauen`)
 * Links Galerie, ab 1024 px klebend, bis die rechte Spalte durch ist.
 * Danach „What's in the Box“ — nur, wenn eine Kette gewählt ist.
 *
 * WARENKORB: Hauptzeile = Variante aus PRODUCT_QUERY (trägt product.handle,
 * sonst stürzt die optimistische Zeile ab), Kette als eigene Zeile derselben
 * LinesAdd-Aktion. Partnercodes hängen am WARENKORB, nicht an der Zeile
 * (lib/partnercode.server.js legt sie beim Seitenaufruf mit sca_ref an; ein
 * Code bleibt bei LinesAdd stehen). Kein eigener Pixel-Code: ViewContent über
 * <Analytics.ProductView>, AddToCart als Cart-Event.
 */

/** Ketten-Abfrage: Stahlkette und (vorbereitet) Goldkette, je fail-soft. */
export function kettenQuery({gold}) {
  return `#graphql
  query AlphaVorlageKetten(
    $country: CountryCode
    $language: LanguageCode
    $stahl: String!
    ${gold ? '$gold: String!' : ''}
  ) @inContext(country: $country, language: $language) {
    stahl: product(handle: $stahl) { ...AlphaVorlageKette }
    ${gold ? 'gold: product(handle: $gold) { ...AlphaVorlageKette }' : ''}
  }
  fragment AlphaVorlageKette on Product {
    id
    handle
    title
    variants(first: 50) {
      nodes {
        ...ProductVariant
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;
}

/** Länge in cm aus dem Variantentitel („S - 45cm“, „L - 60 cm“). */
function laengeCm(titel) {
  const m = /(\d{2,3})\s*cm/i.exec(String(titel || ''));
  return m ? Number(m[1]) : null;
}

/**
 * Kachel-Liste aus den Shopify-Varianten: nur kaufbare Größen, kurz nach lang.
 * @returns {Array<{schluessel: string, art: string, cm: number, name: string, box: string, variante: object}>}
 */
export function kettenKacheln(produkt, art, texte) {
  const nodes = produkt?.variants?.nodes ?? [];
  return nodes
    .filter((v) => v?.availableForSale && v?.id)
    .map((v) => ({v, cm: laengeCm(v.title)}))
    .filter((x) => x.cm)
    .sort((a, b) => a.cm - b.cm)
    .map(({v, cm}) => ({
      schluessel: `${art}-${cm}`,
      art,
      cm,
      name: texte.name(cm),
      box: texte.box(cm),
      variante: v,
    }));
}

export function AlphaVorlage({
  product,
  daten,
  ketten,
  vertrauen = null,
  videoKachel = null,
}) {
  const {PRODUKT, KETTE, KETTE_GOLD, BOX} = daten;
  const land = useMarktLand();
  const {open} = useAside();
  const haupt = product.selectedOrFirstAvailableVariant;
  const waehrung = haupt?.price?.currencyCode || 'EUR';
  const bilder = product?.images?.nodes ?? [];
  const [bild, setBild] = useState(0);
  const grossesBild = bilder[bild] ?? bilder[0];

  const kacheln = [
    ...kettenKacheln(ketten?.stahl, 'stahl', KETTE),
    ...(KETTE_GOLD?.sichtbar ? kettenKacheln(ketten?.gold, 'gold', KETTE_GOLD) : []),
  ];
  const [wahl, setWahl] = useState(null);
  const kette = kacheln.find((k) => k.schluessel === wahl) ?? null;

  const preis = (money, handle) =>
    money ? bruttoAnzeige(money.amount, handle, money.currencyCode, land) : 0;
  const hauptPreis = preis(haupt?.price, product.handle);
  const kettenPreis = (k) =>
    preis(k.variante.price, k.art === 'gold' ? KETTE_GOLD.handle : KETTE.handle);
  const kettenBilder =
    kette?.art === 'gold' && KETTE_GOLD.bilder ? KETTE_GOLD.bilder : KETTE.bilder;

  const linien = haupt?.id
    ? [
        {merchandiseId: haupt.id, quantity: 1, selectedVariant: haupt},
        ...(kette
          ? [
              {
                merchandiseId: kette.variante.id,
                quantity: 1,
                selectedVariant: kette.variante,
              },
            ]
          : []),
      ]
    : [];

  return (
    <div className="tas-seite av-seite" data-alpha-vorlage={product.handle}>
      <div className="tas-raster-seite">
        <div className="tas-galerie" data-tas-galerie="">
          <div className="tas-galerie-fest">
            <div className="tas-galerie-haupt">
              {grossesBild ? (
                <img
                  key={grossesBild.url}
                  className="tas-bild tas-blende"
                  src={mitBreite(grossesBild.url, 1200)}
                  alt={grossesBild.altText || product.title}
                  width="1200"
                  height="1200"
                  fetchPriority="high"
                />
              ) : null}
            </div>
            <div className="tas-daumen" role="group" aria-label="Ansichten">
              {bilder.map((b, i) => (
                <button
                  key={b.url}
                  type="button"
                  className="tas-daumen-knopf"
                  aria-pressed={bild === i}
                  aria-label={b.altText || `${product.title}, Ansicht ${i + 1}`}
                  onClick={() => setBild(i)}
                >
                  <img
                    src={mitBreite(b.url, 160)}
                    alt=""
                    width="80"
                    height="80"
                    loading="lazy"
                  />
                </button>
              ))}
              {videoKachel}
            </div>
          </div>
        </div>

        <div className="tas-auswahl">
          <section
            className="tas-produkt"
            aria-labelledby="av-name"
            data-tas-kopf=""
          >
            <h1 id="av-name" className="tas-name">
              <MarkenName text={PRODUKT.name} />
            </h1>
            <p className="tas-claim">{PRODUKT.claim}</p>
            <Bewertung bewertung={PRODUKT.bewertung} />
            <ul className="tas-punkte">
              {PRODUKT.punkte.map((p) => (
                <li key={p.text} className="tas-punkt">
                  <Zeichen art={p.zeichen} />
                  <span>{p.text}</span>
                </li>
              ))}
            </ul>
            <p className="tas-preis" data-tas-preis="">
              {betragText(hauptPreis, waehrung)}
            </p>
            <p className="tas-herkunft">
              {PRODUKT.herkunft.map((z) => (
                <span key={z}>{z}</span>
              ))}
            </p>
          </section>

          {kacheln.length ? (
            <section
              className="tas-schritt av-kette"
              aria-labelledby="av-kette-titel"
              data-tas-schritt="kette"
            >
              <h2 id="av-kette-titel" className="tas-schritt-titel">
                <span className="tas-auszeichnung">{KETTE.auszeichnung}</span>{' '}
                <span className="tas-titel-rest">{KETTE.titel}</span>
              </h2>
              <div
                className="tas-karten"
                role="radiogroup"
                aria-labelledby="av-kette-titel"
              >
                <Karte
                  an={!kette}
                  onClick={() => setWahl(null)}
                  titel={KETTE.ohne.titel}
                  text={KETTE.ohne.text}
                  preis={betragText(0, waehrung)}
                  data={{'data-av-kette': 'ohne'}}
                />
                {kacheln.map((k) => (
                  <Karte
                    key={k.schluessel}
                    an={kette?.schluessel === k.schluessel}
                    onClick={() => setWahl(k.schluessel)}
                    titel={k.name}
                    preis={betragText(kettenPreis(k), waehrung)}
                    data={{'data-av-kette': k.schluessel}}
                  />
                ))}
              </div>
              <div className="tas-bildpaar">
                {kettenBilder.map((b) => (
                  <figure key={b.url} className="tas-kette-bild av-kette-bild">
                    <img
                      src={mitBreite(b.url, 900)}
                      alt={b.alt}
                      width="900"
                      height="900"
                      loading="lazy"
                    />
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <div className="av-kauf" data-av-kauf="">
            <div className="tas-kaufknopf av-kaufknopf">
              <AddToCartButton
                disabled={!haupt?.availableForSale}
                onClick={() => open('cart')}
                lines={linien}
              >
                {haupt?.availableForSale ? 'In den Warenkorb legen' : 'Ausverkauft'}
              </AddToCartButton>
            </div>
            {vertrauen}
          </div>
        </div>
      </div>

      {kette ? (
        <section
          className="tas-box av-box"
          aria-labelledby="av-box-titel"
          data-av-box=""
        >
          <h2 id="av-box-titel" className="tas-box-titel">
            {BOX.titel}
          </h2>
          <div className="tas-box-flaeche">
            {bilder[0] ? (
              <figure className="tas-box-teil">
                <img
                  src={mitBreite(bilder[0].url, 600)}
                  alt={bilder[0].altText || product.title}
                  width="300"
                  height="300"
                  loading="lazy"
                />
                <figcaption data-av-box-haupt="">
                  <MarkenName text={PRODUKT.name} />
                </figcaption>
              </figure>
            ) : null}
            <figure className="tas-box-teil">
              <img
                src={mitBreite(kettenBilder[0].url, 600)}
                alt={kettenBilder[0].alt}
                width="300"
                height="300"
                loading="lazy"
              />
              <figcaption data-av-box-kette="">{kette.box}</figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: haupt?.price?.amount || '0',
              vendor: product.vendor,
              variantId: haupt?.id || '',
              variantTitle: haupt?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/** Shopify-CDN-Breite anhängen, egal ob die URL schon eine Query trägt. */
function mitBreite(url, breite) {
  return `${url}${url.includes('?') ? '&' : '?'}width=${breite}`;
}

/**
 * Sterne und Nutzerzahl an der Stelle der Alpha-Edition (Elina Punkt 3).
 * Der Klick führt zu den Google-Bewertungen weiter unten auf der Seite
 * (dasselbe Ziel wie der Bewertungspunkt der Vertrauensliste).
 */
function Bewertung({bewertung}) {
  const navigate = useNavigate();
  if (!bewertung) return null;
  const zuDenBewertungen = () => {
    const ziel = findeRezensionsZiel();
    if (ziel) scrolleZuRezensionen(ziel);
    else navigate(BEWERTUNGEN_PFAD);
  };
  return (
    <p className="tas-edition av-bewertung" data-av-bewertung="">
      <button
        type="button"
        className="av-bewertung-knopf"
        onClick={zuDenBewertungen}
        aria-label={`Bewertung ${bewertung.wert} von 5 Sternen, zu den Google-Bewertungen`}
      >
        <span className="av-bewertung-wert">{bewertung.wert}</span>
        <span className="av-sterne" aria-hidden="true">
          ★★★★★
        </span>
      </button>
      <span className="av-trenner" aria-hidden="true">
        ·
      </span>
      <span>{bewertung.nutzer}</span>
    </p>
  );
}

/** Auswahl-Karte im Alpha-Stil (gleiches Markup wie TheAlphaShop). */
function Karte({an, onClick, titel, text = null, preis = null, data = {}}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={an}
      className="tas-karte"
      onClick={onClick}
      {...data}
    >
      <span className="tas-karte-kopf">
        <span className="tas-karte-titel">{titel}</span>
        {preis ? <span className="tas-karte-preis">{preis}</span> : null}
      </span>
      {text ? <span className="tas-karte-text">{text}</span> : null}
    </button>
  );
}

/*
 * Linien-Icons der drei Merkmale, in Gold (Elina Punkt 4: „Linien-Icons in
 * GOLD statt Rot“). Gleiches Feld, gleiche Linie und dieselbe ruhige Bewegung
 * wie die Alpha-Zeichen (tas-zeichen-puls, ruht bei prefers-reduced-motion).
 */
function Zeichen({art}) {
  const gemeinsam = {
    className: `tas-zeichen av-zeichen av-zeichen--${art}`,
    viewBox: '0 0 32 32',
    width: 32,
    height: 32,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    focusable: 'false',
  };
  if (art === 'wachstum') {
    // Spross aus dem Boden: Stiel, zwei Blätter, oben ein Lichtpunkt.
    return (
      <svg {...gemeinsam}>
        <path d="M16 27.5V12.5" />
        <path d="M16 20c-1.2-5-5.2-7.4-10.5-7.2.2 5.2 4.2 8 10.5 7.2Z" />
        <path d="M16 16.5c1-5.2 5-8 10.5-8-.2 5.4-4.2 8.4-10.5 8Z" />
        <path d="M8 27.5h16" />
        <g className="tas-zeichen-puls">
          <path d="M16 3.5v4M11.8 5.2l1.4 2.4M20.2 5.2l-1.4 2.4" />
        </g>
      </svg>
    );
  }
  if (art === 'schutz') {
    // Schild mit drei Funkbögen, die außen abprallen.
    return (
      <svg {...gemeinsam}>
        <path d="M16 4.5 26 8v7.5c0 6-4.2 10.4-10 12-5.8-1.6-10-6-10-12V8z" />
        <g className="tas-zeichen-puls">
          <path d="M11.5 17.5a6.4 6.4 0 0 1 9 0" />
          <path d="M13.6 20.4a3.4 3.4 0 0 1 4.8 0" />
        </g>
        <circle cx="16" cy="23" r="0.6" fill="currentColor" />
      </svg>
    );
  }
  // Quantenfeld: Kern mit zwei Bahnen und Feldpunkten.
  return (
    <svg {...gemeinsam}>
      <circle cx="16" cy="16" r="2.2" />
      <ellipse cx="16" cy="16" rx="11" ry="4.6" />
      <ellipse cx="16" cy="16" rx="11" ry="4.6" transform="rotate(60 16 16)" />
      <g className="tas-zeichen-puls">
        <circle cx="5" cy="6" r="0.6" fill="currentColor" />
        <circle cx="27" cy="26" r="0.6" fill="currentColor" />
        <circle cx="27" cy="6.5" r="0.6" fill="currentColor" />
      </g>
    </svg>
  );
}

export default AlphaVorlage;
