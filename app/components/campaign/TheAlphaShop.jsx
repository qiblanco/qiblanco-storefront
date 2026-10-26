import {useState} from 'react';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {addonLinien, ADDON_WAEHRUNGEN, QM_ADDON} from '~/lib/qi-master-addons';
import {vorbestellungFürHandle} from '~/lib/vorbestellung';
import {TheAlphaNummernwahl} from './TheAlphaNummernwahl';
import {
  betragText,
  gravurText,
  kettenOptionen,
  nummernStand,
  ratenMoeglich,
} from './the-alpha-kauf-laden';
import {
  BEZAHLUNG,
  BOX,
  GALERIE,
  KETTE,
  KOPF,
  NUMMER,
  PRODUKT,
  RATEN,
  ZUSAMMENFASSUNG,
} from './the-alpha-shop-daten';
import {THE_ALPHA_SERIE} from './the-alpha-daten-serie-vergeben';

/*
 * SHOPSEITE /products/the-alpha — Apple-nahe Kaufseite (Christian 25.10.2026
 * Z9/Z14–Z41, 26.10.2026 Z56–Z85; Grossjob 20261025-prio1-the-alpha-
 * landingpage-figma-vorlage-a-server-b-ki-c, Segment s12). Vorbild:
 * apple.com/shop/buy-iphone/iphone-duo/…, Inhalte NUR aus Christians
 * Figma-Spalte „Shopseite /products/the-alpha“.
 *
 * AUFBAU wie Apple, Schritt für Schritt untereinander (Christian 26.10.: „man
 * wählt das Produkt aus und da unten drunter dann die Seriennummer und dann die
 * Ketten“): schwarzes Band, Produkt (Galerie links, fest beim Scrollen am
 * Desktop), Seriennummer mit Live-Gravur, Kette mit Gold-Ansicht, Bezahlart,
 * Zusammenfassung mit Kaufknopf, „What's in the Box“.
 *
 * KAUFWEG AUS DEM BESTAND: Hauptzeile = die Variante aus PRODUCT_QUERY (trägt
 * product.handle, sonst stürzt die optimistische Warenkorbzeile ab), Add-ons
 * über addonLinien() mit Merkmal _qm_addon; die Warenkorb-Action bindet sie
 * an den Qi Alpha (bindeQiMasterAddons). Kein eigener Pixel-Code:
 * ViewContent über <Analytics.ProductView>, AddToCart als Cart-Event, die
 * Identitäts-Keys laufen über lib/checkout-tracking.js.
 *
 * PREISE aus Shopify über dieselbe Anzeige wie jede Kaufseite (bruttoAnzeige,
 * Markt-Land): die Seite nennt, was die Kasse nimmt.
 *
 * PLATZ UNTER „What's in the Box“: dort setzt Segment s07 des Grossjobs
 * 20261026-prio1-the-alpha-variante-a-designmeister-premium-gestaltung die
 * Wissens-Strecke und die Fragen ein (Prop `nachDerBox`).
 */
export function TheAlphaShop({product, addons, nachDerBox = null}) {
  const land = useMarktLand();
  const {open} = useAside();
  const haupt = product.selectedOrFirstAvailableVariant;
  const waehrung = haupt?.price?.currencyCode || 'EUR';
  // Add-ons nur neben einem kaufbaren Qi Alpha und nur in den Märkten mit
  // Christians Preis (dieselbe Regel wie die bisherige Kaufseite).
  const addonsAn =
    Boolean(haupt?.availableForSale) && ADDON_WAEHRUNGEN.includes(waehrung);
  const stand = addonsAn
    ? nummernStand(addons?.wunschnummer?.variants?.nodes)
    : {nummern: [], frei: 0};
  const nummernAn = addonsAn && stand.frei > 0;
  const ketten = addonsAn
    ? kettenOptionen(addons?.kette)
    : kettenOptionen(null);

  const [nummer, setNummer] = useState(null);
  const [freiOffen, setFreiOffen] = useState(false);
  const [ketteTitel, setKetteTitel] = useState('stahl');
  const [zahlart, setZahlart] = useState('direkt');
  const [bild, setBild] = useState(0);

  const nummerEintrag = stand.nummern.find(
    (x) => x.n === nummer && x.status === 'frei',
  );
  const kette =
    ketten.find((k) => k.titel === ketteTitel) ?? ketten[ketten.length - 1];

  const brutto = (money, handle) =>
    money ? bruttoAnzeige(money.amount, handle, money.currencyCode, land) : 0;
  const hauptPreis = brutto(haupt?.price, product.handle);
  const nummerPreisBasis = addons?.wunschnummer?.variants?.nodes?.find(
    (v) => v.price,
  )?.price;
  const nummerPreis = brutto(nummerPreisBasis, QM_ADDON.wunschnummer);
  const kettePreis = (k) =>
    k?.variante ? brutto(k.variante.price, QM_ADDON.kette) : 0;
  const summe =
    hauptPreis +
    (nummerEintrag ? nummerPreis : 0) +
    (kette?.art === 'gold' ? kettePreis(kette) : 0);
  const raten = ratenMoeglich({nummer: nummerEintrag?.n, kette});
  const vorbestellung = vorbestellungFürHandle(product.handle);

  const linien = haupt?.id
    ? [
        {merchandiseId: haupt.id, quantity: 1, selectedVariant: haupt},
        ...addonLinien({
          wunschnummer: nummerEintrag?.variante ?? null,
          kette: kette?.art === 'gold' ? kette.variante : null,
        }),
      ]
    : [];

  const gravur = gravurText(nummerEintrag?.n ?? null, THE_ALPHA_SERIE);
  const ketteGold = kette?.art === 'gold';
  const wahlNummer = (n) => {
    setNummer(n);
    if (n === null) setFreiOffen(false);
  };
  const vorschlagFrei = (n) =>
    stand.nummern.find((x) => x.n === n)?.status === 'frei';
  const freiGewaehlt =
    nummerEintrag && !NUMMER.vorschlaege.includes(nummerEintrag.n);
  const grossesBild = GALERIE.bilder[bild] ?? GALERIE.bilder[0];

  return (
    <div className="tas-seite" data-the-alpha-shop="">
      <GoldFilter />
      <header className="tas-band">
        <p className="tas-band-titel">{KOPF.titel}</p>
        <p className="tas-band-unter">{KOPF.unter}</p>
      </header>

      <div className="tas-raster-seite">
        <div className="tas-galerie" data-tas-galerie="">
          <div className="tas-galerie-fest">
            <div className="tas-galerie-gross">
              {GALERIE.animation360 ? (
                <video
                  className="tas-bild"
                  src={GALERIE.animation360.src}
                  poster={GALERIE.animation360.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  aria-label="Qi Alpha, 360-Grad-Ansicht"
                />
              ) : (
                <img
                  key={grossesBild.url}
                  className="tas-bild tas-blende"
                  src={`${grossesBild.url}&width=1200`}
                  alt={grossesBild.alt}
                  width="1200"
                  height="1200"
                  fetchPriority="high"
                />
              )}
            </div>
            <div className="tas-daumen" role="group" aria-label="Ansichten">
              {GALERIE.bilder.map((b, i) => (
                <button
                  key={b.url}
                  type="button"
                  className="tas-daumen-knopf"
                  aria-pressed={bild === i}
                  aria-label={b.alt}
                  onClick={() => setBild(i)}
                >
                  <img
                    src={`${b.url}&width=160`}
                    alt=""
                    width="80"
                    height="80"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tas-auswahl">
          <section className="tas-produkt" aria-labelledby="tas-name">
            <h1 id="tas-name" className="tas-name">
              {PRODUKT.name}
            </h1>
            <p className="tas-edition">{PRODUKT.edition}</p>
            <p className="tas-claim">{PRODUKT.claim}</p>
            <ul className="tas-punkte">
              {PRODUKT.punkte.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <p className="tas-preis" data-tas-preis="">
              {betragText(hauptPreis, waehrung)} - {PRODUKT.preisZusatz}
            </p>
            <p className="tas-klein">inkl. 19 % MwSt.</p>
            <p className="tas-herkunft">{PRODUKT.herkunft}</p>
          </section>

          {nummernAn ? (
            <section
              className="tas-schritt"
              aria-labelledby="tas-nummer-titel"
              data-tas-schritt="nummer"
            >
              <h2 id="tas-nummer-titel" className="tas-schritt-titel">
                <span className="tas-auszeichnung">{NUMMER.auszeichnung}</span>{' '}
                {NUMMER.titel}
              </h2>
              <div
                className="tas-karten"
                role="radiogroup"
                aria-labelledby="tas-nummer-titel"
              >
                <Karte
                  an={!nummerEintrag && !freiOffen}
                  onClick={() => wahlNummer(null)}
                  titel={NUMMER.ohneTitel}
                  text={NUMMER.ohneHinweis}
                  preis="+ 0 €"
                  data={{'data-tas-nummer': 'ohne'}}
                />
                {NUMMER.vorschlaege.map((n) =>
                  vorschlagFrei(n) ? (
                    <Karte
                      key={n}
                      an={nummerEintrag?.n === n}
                      onClick={() => {
                        setFreiOffen(false);
                        wahlNummer(n);
                      }}
                      titel={`${n}/${THE_ALPHA_SERIE}`}
                      preis={`+ ${betragText(nummerPreis, waehrung)}`}
                      data={{'data-tas-nummer': String(n)}}
                    />
                  ) : null,
                )}
                <Karte
                  an={freiOffen || Boolean(freiGewaehlt)}
                  onClick={() => setFreiOffen(true)}
                  titel={
                    freiGewaehlt
                      ? `${NUMMER.freiTitel}: ${nummerEintrag.n}/${THE_ALPHA_SERIE}`
                      : NUMMER.freiTitel
                  }
                  text={`${stand.frei} von ${THE_ALPHA_SERIE} frei`}
                  preis={`+ ${betragText(nummerPreis, waehrung)}`}
                  data={{'data-tas-nummer': 'frei'}}
                />
              </div>
              {freiOffen ? (
                <TheAlphaNummernwahl
                  nummern={stand.nummern}
                  gewaehlt={nummerEintrag?.n ?? null}
                  onWaehle={(n) => wahlNummer(n)}
                />
              ) : null}
              <div className="tas-bildpaar">
                <figure className="tas-gravur-bild">
                  <div className="tas-gravur-rahmen">
                    <div
                      className="tas-zoom"
                      style={{'--tas-zoom-mitte': '62% 49%'}}
                    >
                      <img
                        src={`${NUMMER.bildGravur.url}&width=900`}
                        alt={NUMMER.bildGravur.alt}
                        width="900"
                        height="900"
                        loading="lazy"
                      />
                      <span
                        className="tas-gravur"
                        data-tas-gravur=""
                        aria-live="polite"
                        style={{
                          left: `${NUMMER.bildGravur.gravur.x * 100}%`,
                          top: `${NUMMER.bildGravur.gravur.y * 100}%`,
                        }}
                      >
                        <span key={gravur} className="tas-blende">
                          {gravur}
                        </span>
                      </span>
                    </div>
                  </div>
                </figure>
                <figure className="tas-gravur-bild">
                  <div className="tas-gravur-rahmen">
                    <div
                      className="tas-zoom"
                      style={{'--tas-zoom-mitte': '58% 48%'}}
                    >
                      <img
                        src={`${NUMMER.bildRueckseite.url}&width=900`}
                        alt={NUMMER.bildRueckseite.alt}
                        width="900"
                        height="900"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </figure>
              </div>
            </section>
          ) : null}

          <section
            className="tas-schritt"
            aria-labelledby="tas-kette-titel"
            data-tas-schritt="kette"
          >
            <h2 id="tas-kette-titel" className="tas-schritt-titel">
              <span className="tas-auszeichnung">{KETTE.auszeichnung}</span>{' '}
              {KETTE.titel}
            </h2>
            <div
              className="tas-karten"
              role="radiogroup"
              aria-labelledby="tas-kette-titel"
            >
              {ketten.map((k) => (
                <Karte
                  key={k.titel}
                  an={kette?.titel === k.titel}
                  onClick={() => setKetteTitel(k.titel)}
                  titel={k.name}
                  preis={
                    k.art === 'gold'
                      ? betragText(kettePreis(k), waehrung)
                      : '0 €'
                  }
                  data={{'data-tas-kette': k.titel}}
                />
              ))}
            </div>
            <div
              className="tas-bildpaar"
              data-tas-kette-farbe={ketteGold ? 'gold' : 'stahl'}
            >
              {KETTE.bilder.map((b) => (
                <figure key={b.url} className="tas-kette-bild">
                  <KettenBild bild={b} breite={900} />
                </figure>
              ))}
            </div>
          </section>

          <section
            className="tas-schritt"
            aria-labelledby="tas-zahl-titel"
            data-tas-schritt="bezahlung"
          >
            <h2 id="tas-zahl-titel" className="tas-schritt-titel">
              <span className="tas-auszeichnung">{BEZAHLUNG.titel}</span>{' '}
              {BEZAHLUNG.unter}
            </h2>
            <div
              className="tas-karten tas-karten--zwei"
              role="radiogroup"
              aria-labelledby="tas-zahl-titel"
            >
              <Karte
                an={zahlart === 'direkt'}
                onClick={() => setZahlart('direkt')}
                titel={BEZAHLUNG.direkt.name}
                text={BEZAHLUNG.direkt.text}
                data={{'data-tas-zahlart': 'direkt'}}
              />
              <Karte
                an={zahlart === 'raten'}
                onClick={() => setZahlart('raten')}
                titel={BEZAHLUNG.raten.name}
                text={RATEN.text}
                data={{'data-tas-zahlart': 'raten'}}
              />
            </div>
            {zahlart === 'raten' ? (
              <div
                className="tas-hinweis"
                data-tas-raten={raten ? 'moeglich' : 'extras'}
                aria-live="polite"
              >
                {raten ? (
                  <p>{RATEN.code}</p>
                ) : (
                  <>
                    <p>{RATEN.mitExtras}</p>
                    <button
                      type="button"
                      className="tas-textknopf"
                      onClick={() => {
                        wahlNummer(null);
                        setKetteTitel('stahl');
                      }}
                    >
                      {RATEN.extrasAbwaehlen}
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <section
        className="tas-summe"
        aria-labelledby="tas-summe-titel"
        data-tas-zusammenfassung=""
      >
        <div className="tas-summe-kopf">
          <h2 id="tas-summe-titel" className="tas-summe-titel">
            {ZUSAMMENFASSUNG.titel}{' '}
            <span className="tas-summe-unter">{ZUSAMMENFASSUNG.unter}</span>
          </h2>
          <img
            className="tas-summe-bild"
            src={`${BOX.geraetBild.url}&width=480`}
            alt={BOX.geraetBild.alt}
            width="240"
            height="240"
            loading="lazy"
          />
        </div>
        <div className="tas-summe-zeilen">
          <dl className="tas-posten">
            <div>
              <dt>
                {PRODUKT.name} · {gravur}
              </dt>
              <dd>
                {betragText(
                  hauptPreis + (nummerEintrag ? nummerPreis : 0),
                  waehrung,
                )}
              </dd>
            </div>
            <div>
              <dt>{kette?.name}</dt>
              <dd>
                {ketteGold ? betragText(kettePreis(kette), waehrung) : '0 €'}
              </dd>
            </div>
            <div className="tas-posten-summe">
              <dt>Summe</dt>
              <dd data-tas-summe="">{betragText(summe, waehrung)}</dd>
            </div>
            {zahlart === 'raten' && raten ? (
              <div>
                <dt>Ratenpreis mit Code von Anna</dt>
                <dd>{betragText(RATEN.ratenpreis, waehrung)}</dd>
              </div>
            ) : null}
          </dl>
          <p className="tas-klein">inkl. 19 % MwSt.</p>
        </div>
        <div className="tas-summe-kasse">
          <ul className="tas-versand">
            {vorbestellung?.versandhinweis ? (
              <li>{vorbestellung.versandhinweis}</li>
            ) : null}
            {ZUSAMMENFASSUNG.versand.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
          <div className="tas-kaufknopf">
            <AddToCartButton
              disabled={!haupt?.availableForSale}
              onClick={() => open('cart')}
              lines={linien}
            >
              {haupt?.availableForSale ? ZUSAMMENFASSUNG.knopf : 'Ausverkauft'}
            </AddToCartButton>
          </div>
          <EuGewaehrleistungsHinweis />
          <p className="tas-klein">{ZUSAMMENFASSUNG.rueckgabe}</p>
        </div>
      </section>

      <section
        className="tas-box"
        aria-labelledby="tas-box-titel"
        data-tas-box=""
      >
        <h2 id="tas-box-titel" className="tas-box-titel">
          {BOX.titel}
        </h2>
        <div className="tas-box-flaeche">
          <figure className="tas-box-teil">
            <img
              src={`${BOX.geraetBild.url}&width=600`}
              alt={BOX.geraetBild.alt}
              width="300"
              height="300"
              loading="lazy"
            />
            <figcaption data-tas-box-geraet="">
              {PRODUKT.name} · {gravur}
            </figcaption>
          </figure>
          <figure
            className="tas-box-teil"
            data-tas-kette-farbe={ketteGold ? 'gold' : 'stahl'}
          >
            <KettenBild bild={KETTE.bilder[1]} breite={600} />
            <figcaption data-tas-box-kette="">{kette?.name}</figcaption>
          </figure>
        </div>
      </section>
      {nachDerBox}

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

/** Eine Auswahl-Karte wie bei Apple: Rahmen, gewählt = dunkel umrandet. */
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

/**
 * Kettenbild in zwei Lagen: unten die Aufnahme (Chirurgenstahl), darüber
 * dieselbe Aufnahme durch den Goldfilter. Die Wahl blendet nur die Deckkraft
 * der oberen Lage um, so springt nichts (Christian 26.10.: Überblendung).
 */
function KettenBild({bild, breite}) {
  const src = `${bild.url}&width=${breite}`;
  return (
    <span className="tas-kette-lagen">
      <img
        src={src}
        alt={bild.alt}
        width={breite}
        height={breite}
        loading="lazy"
      />
      <img
        className="tas-kette-gold"
        src={src}
        alt=""
        aria-hidden="true"
        width={breite}
        height={breite}
        loading="lazy"
      />
    </span>
  );
}

/*
 * GOLD-ANSICHT DER KETTE (Christian 26.10.: „bei der asuwahl an godl sich die
 * kettenfarbe in gold ändert … das gold von der umrandung beim diamten ist
 * sehr gut getroffen, bitte das farbscheme übernehemn“). Verfahren: Gradient
 * Map, also die Graustufen der Silberaufnahme auf eine mehrstufige Goldrampe
 * gelegt, damit Glanzlichter und Schatten bleiben (statt einer flachen
 * Farbe). Die Rampe ist an der Diamant-Fassung in qi-alpha-02-detail.jpg
 * gemessen (Perzentile 5–99: #614601 · #846a37 · #a2712f · #c9a46f · #e1c192);
 * die hellsten Stufen laufen in ein warmes Weiß aus, damit der helle
 * Bildgrund hell bleibt.
 */
function GoldFilter() {
  return (
    <svg
      className="tas-unsichtbar"
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
    >
      <filter id="tas-gold" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR
            type="table"
            tableValues="0.18 0.38 0.52 0.64 0.79 0.88 0.96 0.99"
          />
          <feFuncG
            type="table"
            tableValues="0.12 0.27 0.42 0.44 0.64 0.76 0.92 0.97"
          />
          <feFuncB
            type="table"
            tableValues="0.00 0.01 0.22 0.18 0.44 0.57 0.84 0.94"
          />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

export default TheAlphaShop;
