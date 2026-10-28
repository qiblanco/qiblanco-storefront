import {useCallback, useEffect, useRef, useState} from 'react';
import {useSearchParams} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {
  GOOGLE_REVIEWS_URL,
  StarRating,
} from '~/components/reusables/StarRating';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {addonLinien, ADDON_WAEHRUNGEN, QM_ADDON} from '~/lib/qi-master-addons';
import {vorbestellungFürHandle} from '~/lib/vorbestellung';
import {
  aufteilung,
  konfigText,
  ratenMarkt,
  teil1Link,
  vorgangsKennung,
} from '~/lib/qi-alpha-teilzahlung';
import {TeilzahlungFenster} from './TeilzahlungFenster';
import {TheAlphaNummernwahl} from './TheAlphaNummernwahl';
import {
  betragText,
  gravurText,
  kettenOptionen,
  nummernStand,
} from './the-alpha-kauf-laden';
import {
  BEZAHLUNG,
  BOX,
  GALERIE,
  KETTE,
  KOPF,
  NUMMER,
  PRODUKT,
  TEILZAHLUNG_TEXT,
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
 * RATENZAHLUNG (seit 28.10.2026, Grossjob 20261027-qi-alpha-geteilte-zahlung-
 * 10000-raten-rest-sofort, s03): im Markt DE/AT zeigt die Bezahlart
 * „Ratenzahlung“ die Aufteilung (10.000 € in Raten, Rest sofort) und öffnet
 * das Fenster TeilzahlungFenster.jsx; dessen Knopf führt in den Schritt-1-
 * Checkout. Regeln: lib/qi-alpha-teilzahlung.js. Der Ratencode 9.999 € ist
 * hier weg.
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
  // ?bezahlart=ratenzahlung wählt die Ratenzahlung vor und öffnet das
  // Fenster nach dem Laden (Link aus Chat, Mail oder Anzeige).
  const [such] = useSearchParams();
  const vorwahlRaten = such.get('bezahlart') === 'ratenzahlung';
  const [zahlart, setZahlart] = useState(vorwahlRaten ? 'raten' : 'direkt');
  const [fenster, setFenster] = useState(null);
  const [bild, setBild] = useState(KOPF.loop ? -1 : 0);

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
  // GETEILTE ZAHLUNG (Grossjob 20261027-qi-alpha-geteilte-zahlung-10000-
  // raten-rest-sofort, s03): nur im EUR-Markt DE/AT, Aufteilung aus derselben
  // Summe wie die Zusammenfassung. Über 10.000 € zahlt der Kunde 10.000 € in
  // Raten und den Rest sofort; bis 10.000 € gilt der normale Ratenweg.
  const ratenAn = ratenMarkt({waehrung, land});
  const art = ratenAn ? zahlart : 'direkt';
  const teilung = aufteilung({summe, waehrung, land});
  const geteilt = art === 'raten' && teilung;
  const betrag = (wert) => betragText(wert, waehrung);
  const oeffneFenster = () => {
    if (!teilung || !haupt?.id) return;
    setFenster({
      vorgang: vorgangsKennung(),
    });
  };
  const schliesseFenster = useCallback(() => setFenster(null), []);
  useEffect(() => {
    if (vorwahlRaten && teilung && haupt?.availableForSale) {
      setFenster({vorgang: vorgangsKennung()});
    }
    // Nur beim ersten Laden: die Vorwahl öffnet einmal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const vorbestellung = vorbestellungFürHandle(product.handle);

  // Shopify legt die Zeilen eines cartLinesAdd umgekehrt in den Warenkorb
  // (gemessen 28.10.2026). Übergeben wird Kette, Nummer, Qi Alpha®, damit
  // Warenkorb und Kasse Qi Alpha®, Nummer, Kette zeigen (Christian 27.10. Z3).
  const linien = haupt?.id
    ? [
        ...addonLinien({
          wunschnummer: nummerEintrag?.variante ?? null,
          kette: kette?.art === 'gold' ? kette.variante : null,
        }).reverse(),
        {merchandiseId: haupt.id, quantity: 1, selectedVariant: haupt},
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
  const grossesBild = GALERIE.bilder[Math.max(bild, 0)] ?? GALERIE.bilder[0];

  return (
    <div className="tas-seite" data-the-alpha-shop="">
      {/* ERSTES FENSTER (Christian 27.10. Z2 „abständige, schriftgrößen,
          kompositionen“; Sicht-Tor seitenregeln.pdp_falz.konfigurator): Bühne,
          Preis und die erste Option stehen ohne Scrollen da. Das schwarze Band
          mit dem 360-Grad-Loop (Z218) ist dafür die Bühne der linken Spalte
          geworden: am Desktop steht es neben dem Kopf statt darüber (vorher
          Preis y=1205, erste Option y=1525 bei 1440x900). */}
      <div className="tas-raster-seite">
        <div className="tas-galerie" data-tas-galerie="">
          <div className="tas-galerie-fest">
            {bild < 0 ? (
              <header
                className="tas-band"
                data-tas-band=""
                data-tas-buehne="loop"
              >
                <p className="tas-band-titel">{KOPF.titel}</p>
                <p className="tas-band-unter">{KOPF.unter}</p>
                {KOPF.loop ? <BandLoop loop={KOPF.loop} /> : null}
              </header>
            ) : (
              <div className="tas-galerie-haupt" data-tas-buehne="bild">
                <img
                  key={grossesBild.url}
                  className="tas-bild tas-blende"
                  src={`${grossesBild.url}&width=1200`}
                  alt={grossesBild.alt}
                  width="1200"
                  height="1200"
                />
              </div>
            )}
            <div className="tas-daumen" role="group" aria-label="Ansichten">
              {KOPF.loop ? (
                <button
                  type="button"
                  className="tas-daumen-knopf tas-daumen-knopf--loop"
                  aria-pressed={bild < 0}
                  aria-label={KOPF.loop.alt}
                  onClick={() => setBild(-1)}
                >
                  <img
                    src={`${KOPF.loop.poster}&width=160`}
                    alt=""
                    width="80"
                    height="80"
                    loading="lazy"
                  />
                </button>
              ) : null}
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
          {/* Produktkopf in Christians Folge (27.10. Z243–Z248): Name, Claim,
              Edition, drei Punkte mit rotem Zeichen, Preis, Herkunft. Der Preis
              steht im Preisanker-Dreizeiler (Shop-Regel S3, Kanon
              preisanker-und-videokante.md). Kein Knopf, keine Steuerzeile:
              gekauft wird im Konfigurator direkt darunter (Z229–Z233). */}
          <section
            className="tas-produkt"
            aria-labelledby="tas-name"
            data-tas-kopf=""
          >
            <h1 id="tas-name" className="tas-name">
              {PRODUKT.name}
            </h1>
            <p className="tas-claim">{PRODUKT.claim}</p>
            <p className="tas-edition">{PRODUKT.edition}</p>
            <ul className="tas-punkte">
              {PRODUKT.punkte.map((p) => (
                <li key={p.text} className="tas-punkt">
                  <Zeichen art={p.zeichen} />
                  {p.text}
                </li>
              ))}
            </ul>
            <TasPreisanker betrag={betragText(hauptPreis, waehrung)} />
            <p className="tas-herkunft">{PRODUKT.herkunft.join(' ')}</p>
          </section>

          {nummernAn ? (
            <section
              id="tas-konfigurator"
              className="tas-schritt tas-schritt--erster"
              aria-labelledby="tas-nummer-titel"
              data-tas-schritt="nummer"
            >
              <h2 id="tas-nummer-titel" className="tas-schritt-titel">
                <span className="tas-auszeichnung">{NUMMER.auszeichnung}</span>{' '}
                <span className="tas-titel-rest">{NUMMER.titel}</span>
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
                  aktiv={nummerEintrag?.n ?? null}
                  onWaehle={(n) => wahlNummer(n)}
                />
              ) : null}
              {/* Ein Bild: die Gravur mit der gewählten Nummer. Das Bild
                  „Made in Germany“ rechts daneben ist weg (Christian
                  27.10.2026: „hier noch das rechte bild löschen“). */}
              <div className="tas-bildpaar tas-bildpaar--einzeln">
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
              </div>
            </section>
          ) : null}

          <section
            id={nummernAn ? undefined : 'tas-konfigurator'}
            className={
              nummernAn ? 'tas-schritt' : 'tas-schritt tas-schritt--erster'
            }
            aria-labelledby="tas-kette-titel"
            data-tas-schritt="kette"
          >
            <h2 id="tas-kette-titel" className="tas-schritt-titel">
              <span className="tas-auszeichnung">{KETTE.auszeichnung}</span>{' '}
              <span className="tas-titel-rest">{KETTE.titel}</span>
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
                <figure key={b.stahl} className="tas-kette-bild">
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
              <span className="tas-titel-rest">
                {ratenAn ? BEZAHLUNG.unter : BEZAHLUNG.unterDirekt}
              </span>
            </h2>
            <div
              className={
                ratenAn ? 'tas-karten tas-karten--zwei' : 'tas-karten'
              }
              role="radiogroup"
              aria-labelledby="tas-zahl-titel"
            >
              <Karte
                an={art === 'direkt'}
                onClick={() => setZahlart('direkt')}
                titel={BEZAHLUNG.direkt.name}
                text={BEZAHLUNG.direkt.text}
                data={{'data-tas-zahlart': 'direkt'}}
              />
              {ratenAn ? (
                <Karte
                  an={art === 'raten'}
                  onClick={() => {
                    setZahlart('raten');
                    oeffneFenster();
                  }}
                  titel={BEZAHLUNG.raten.name}
                  text={teilung ? BEZAHLUNG.raten.text : BEZAHLUNG.raten.textGanz}
                  data={{'data-tas-zahlart': 'raten'}}
                />
              ) : null}
            </div>
            {geteilt ? (
              <div
                className="tas-hinweis"
                data-tas-raten="geteilt"
                aria-live="polite"
              >
                <p>
                  {TEILZAHLUNG_TEXT.hinweis(
                    betrag(teilung.sofort),
                    betrag(teilung.raten),
                  )}
                </p>
                <button
                  type="button"
                  className="tas-textknopf"
                  onClick={oeffneFenster}
                  data-tas-raten-ablauf=""
                >
                  {TEILZAHLUNG_TEXT.ablauf}
                </button>
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
            <span className="tas-titel-rest tas-summe-unter">
              {ZUSAMMENFASSUNG.unter}
            </span>
          </h2>
          <img
            className="tas-summe-bild"
            src={`${BOX.hauptBild.url}&width=480`}
            alt={BOX.hauptBild.alt}
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
            {geteilt ? (
              <>
                <div className="tas-posten-teil" data-tas-teilung="sofort">
                  <dt>{TEILZAHLUNG_TEXT.sofort}</dt>
                  <dd data-tas-teilung-sofort="">{betrag(teilung.sofort)}</dd>
                </div>
                <div className="tas-posten-teil" data-tas-teilung="raten">
                  <dt>{TEILZAHLUNG_TEXT.raten}</dt>
                  <dd data-tas-teilung-raten="">{betrag(teilung.raten)}</dd>
                </div>
              </>
            ) : null}
          </dl>
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
            {geteilt && haupt?.availableForSale ? (
              // Ratenzahlung über 10.000 €: nicht in den Warenkorb (die Kasse
              // nähme den ganzen Betrag), sondern ins Fenster mit Schritt 1.
              <button
                type="button"
                className="btn--primary"
                data-qb-kaufknopf=""
                data-tas-raten-weiter=""
                onClick={oeffneFenster}
              >
                {TEILZAHLUNG_TEXT.weiter}
              </button>
            ) : (
              <AddToCartButton
                disabled={!haupt?.availableForSale}
                onClick={() => open('cart')}
                lines={linien}
              >
                {haupt?.availableForSale ? ZUSAMMENFASSUNG.knopf : 'Ausverkauft'}
              </AddToCartButton>
            )}
          </div>
          <EuGewaehrleistungsHinweis />
          <p className="tas-klein">{ZUSAMMENFASSUNG.frist}</p>
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
              src={`${BOX.hauptBild.url}&width=600`}
              alt={BOX.hauptBild.alt}
              width="300"
              height="300"
              loading="lazy"
            />
            <figcaption data-tas-box-haupt="">
              {PRODUKT.name} · {gravur}
            </figcaption>
          </figure>
          <figure
            className="tas-box-teil"
            data-tas-kette-farbe={ketteGold ? 'gold' : 'stahl'}
          >
            <KettenBild bild={KETTE.bilder[1]} breite={600} />
            <figcaption data-tas-box-kette="">
              {kette?.box ?? kette?.name}
            </figcaption>
          </figure>
        </div>
      </section>
      {nachDerBox}

      {fenster && teilung ? (
        <TeilzahlungFenster
          teilung={teilung}
          betrag={betrag}
          link={teil1Link({
            vorgang: fenster.vorgang,
            konfig: konfigText({
              qiAlpha: haupt?.id,
              nummer: nummerEintrag?.variante?.id ?? null,
              kette: ketteGold ? kette.variante?.id : null,
            }),
          })}
          onClose={schliesseFenster}
        />
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

/**
 * Lucas 360-Grad-Loop im schwarzen Band: stumm, inline, in Schleife, ohne
 * Bedienleiste; beim Laden steht das Poster. Wer weniger Bewegung wünscht
 * (prefers-reduced-motion), sieht den ersten Rahmen still.
 */
function BandLoop({loop}) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
    }
  }, []);
  return (
    <video
      ref={ref}
      className="tas-band-loop"
      src={loop.src}
      poster={loop.poster}
      width="720"
      height="720"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-label={loop.alt}
      data-tas-loop=""
    />
  );
}

/*
 * Die drei Zeichen des Produktkopfs (Christian Z240/Z251: „jeweils mit Gimik
 * in Rot, die leicht animiert ist, also sich ruhig bewegt“): Gitterchip aus
 * zwei Hälften, Diamant mit Facetten, Licht über Wasser. Linien in
 * currentColor (Qi-Alpha-Rot), Bewegung nur in CSS (the-alpha-produkt.css,
 * ruht bei prefers-reduced-motion).
 */
function Zeichen({art}) {
  const gemeinsam = {
    className: `tas-zeichen tas-zeichen--${art}`,
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
  // Alle drei Zeichen füllen dasselbe Feld 5..27 (Designmeister s07-r2:
  // gleiche optische Masse, bündig links).
  if (art === 'gitter') {
    return (
      <svg {...gemeinsam}>
        <rect x="5" y="5.5" width="10" height="21" rx="2" />
        <rect x="17" y="5.5" width="10" height="21" rx="2" />
        <g className="tas-zeichen-puls">
          <path d="M5 12.5h10M5 19.5h10M10 5.5v21M17 12.5h10M17 19.5h10M22 5.5v21" />
        </g>
      </svg>
    );
  }
  if (art === 'diamant') {
    return (
      <svg {...gemeinsam}>
        <path d="M10 8h12l5 6-11 13L5 14z" />
        <path d="M5 14h22M13 8l-2 6 5 13M19 8l2 6-5 13" />
        <g className="tas-zeichen-funkeln">
          <path d="M26 2.5v4M24 4.5h4" />
        </g>
      </svg>
    );
  }
  return (
    <svg {...gemeinsam}>
      <defs>
        <clipPath id="tas-zeichen-feld">
          <rect x="5" y="0" width="22" height="32" />
        </clipPath>
      </defs>
      <g className="tas-zeichen-puls">
        <path d="M16 4v3.5M10.5 6l1.8 2.8M21.5 6l-1.8 2.8" />
      </g>
      <circle cx="16" cy="14" r="3" />
      {/* Wellen eine Periode (15) breiter als das Feld: die Bewegung um 15
          nach rechts ist nahtlos. */}
      <g clipPath="url(#tas-zeichen-feld)">
        <g className="tas-zeichen-welle">
          <path d="M-28 21.5c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0" />
          <path d="M-28 26.5c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0c2.5-2 5-2 7.5 0s5 2 7.5 0" />
        </g>
      </g>
    </svg>
  );
}

/**
 * PREISANKER-DREIZEILER der Konfigurator-Seite: „4.8 ★★★★★ Google
 * Bewertungen“ / „+ 14.000 Nutzer“ / Preis (Kanon preisanker-und-videokante.md,
 * Christian 25./26.10.2026; Shop-Regel S3). Dieselben Klassen wie der
 * Haus-Baustein reusables/Preisanker.jsx, daran misst das Shop-Tor. Eigene
 * Fassung aus zwei Gründen: der Preis ist derselbe Betrag wie in der
 * Zusammenfassung (betragText, eine Rechnung für Kopf und Summe), und die
 * Bewertung ist hier kein Sprung-Knopf, weil diese Seite keinen
 * Bewertungsbereich trägt (ein Knopf ohne Ziel wäre ein toter Klick). Kein
 * Banner: der Kanon nennt für den Qi Alpha keines (Regel 3). Gestaltung im
 * Scope .tas-seite (the-alpha-produkt.css), Tokens der Seite.
 */
function TasPreisanker({betrag}) {
  return (
    <div className="qb-preisanker tas-anker" data-qb-preisanker="">
      <p className="qb-preisanker__bewertungszeile">
        <span className="qb-preisanker__bewertung">
          <span className="qb-preisanker__note">4.8</span>
          <StarRating value={4.8} size={16} qb={null} />
        </span>
        <a
          className="qb-preisanker__quelle"
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Bewertungen
        </a>
      </p>
      <p className="qb-preisanker__nutzer">+ 14.000 Nutzer</p>
      <p className="qb-preisanker__preiszeile">
        <span className="tas-preis" data-tas-preis="">
          {betrag}
        </span>
      </p>
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
 * Kettenbild in zwei Lagen: unten die Stahlaufnahme, darüber die Goldfassung
 * derselben Aufnahme (gleicher Grund, gleiche Lage). Die Wahl blendet nur die
 * Deckkraft der oberen Lage um, so springt nichts (Christian 26.10.:
 * Überblendung).
 */
function KettenBild({bild, breite}) {
  return (
    <span className="tas-kette-lagen">
      <img
        src={`${bild.stahl}&width=${breite}`}
        alt={bild.alt}
        width={breite}
        height={breite}
        loading="lazy"
      />
      <img
        className="tas-kette-gold"
        src={`${bild.gold}&width=${breite}`}
        alt=""
        aria-hidden="true"
        width={breite}
        height={breite}
        loading="lazy"
      />
    </span>
  );
}

export default TheAlphaShop;
