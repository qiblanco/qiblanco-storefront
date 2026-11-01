import {Fragment, useCallback, useEffect, useRef, useState} from 'react';
import {useSearchParams} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {EuGewaehrleistungsHinweis} from '~/components/EuGewaehrleistungsLabel';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {addonLinien, addonsImMarkt, QM_ADDON} from '~/lib/qi-master-addons';
import {vorbestellungFürHandle} from '~/lib/vorbestellung';
import {
  einheitenLinien,
  reservierungsMerkmale,
  reserviertStand,
} from '~/lib/qi-alpha-reservierung';
import {
  aufteilung,
  konfigText,
  ratenMarkt,
  teil1Link,
  vorgangsKennung,
} from '~/lib/qi-alpha-teilzahlung';
import {TeilzahlungFenster} from './TeilzahlungFenster';
import {TheAlphaNummernwahl} from './TheAlphaNummernwahl';
import {betragText, gravurText, kaufAuswahl} from './the-alpha-kauf-laden';
import {
  BEZAHLUNG,
  BOX,
  GALERIE,
  KETTE,
  KETTE_STAHL_PREIS,
  KOPF,
  NUMMER,
  PRODUKT,
  TEILZAHLUNG_TEXT,
  ZUSAMMENFASSUNG,
} from './the-alpha-shop-daten';
import {THE_ALPHA_SERIE} from './the-alpha-daten-serie-vergeben';
import {MarkeR, mitMarkeR} from '~/components/reusables/MarkeR';
import {Schlussleiste} from '~/components/reusables/Schlussleiste';

/* Galerie-Hauptbild: Breitenstufen bis zum CDN-Master (2048/2056 px), damit
   Tablets mit dpr 2 nicht hochskalieren (Gate 12 bild-aufloesung). sizes folgt
   der im Testserver gemessenen Fläche je Format (31.10.2026: 328…868 px =
   100vw - 32 unter 1024, 551 px bei 1024, 653 px ab 1232 = (1200 - 32 - 48)
   * 7/12, Raster in the-alpha-produkt.css). Dieselbe Rechnung gilt für
   AlphaVorlage.jsx und TheAlphaShop.jsx, beide stehen auf .tas-raster-seite. */
const GALERIE_BREITEN = [600, 900, 1200, 1600, 2048];
const GALERIE_SIZES =
  '(min-width: 1232px) 654px, (min-width: 1024px) calc((100vw - 80px) * 0.584), calc(100vw - 32px)';
/* Gravurbild in der rechten Spalte (5fr): 1728 ist die Breite des Ausschnitts,
   größer liefert das CDN nicht. Unter 1024 volle Breite wie die Galerie. */
const GRAVUR_BREITEN = [600, 1200, 1728];
const GRAVUR_SIZES =
  '(min-width: 1232px) 467px, (min-width: 1024px) calc((100vw - 80px) * 0.417), calc(100vw - 32px)';

/*
 * SHOPSEITE /products/the-alpha — Apple-nahe Kaufseite (Christian 25.10.2026
 * Z9/Z14–Z41, 26.10.2026 Z56–Z85; Grossjob 20261025-prio1-the-alpha-
 * landingpage-figma-vorlage-a-server-b-ki-c, Segment s12). Vorbild:
 * apple.com/shop/buy-iphone/iphone-duo/…, Inhalte NUR aus Christians
 * Figma-Spalte „Shopseite /products/the-alpha“.
 *
 * AUFBAU wie Apple, Schritt für Schritt untereinander (Christian 26.10.: „man
 * wählt das Produkt aus und da unten drunter dann die Seriennummer und dann die
 * Ketten“): oben der eigene Abschnitt „Kohärentes Licht“ mit der 360-Grad-
 * Rotation (Christian 28.10. Z16), dann Produkt (Galerie links, fest beim
 * Scrollen am Desktop), Seriennummer mit Live-Gravur, Kette mit Gold-Ansicht,
 * Bezahlart, Zusammenfassung mit Kaufknopf, „What's in the Box“. Mobil
 * wiederholt die Schlussleiste den Kaufknopf, sobald er nach oben
 * weggescrollt ist (reusables/Schlussleiste.jsx, 30.10.2026: am Seitenende
 * ein aktiver Kaufknopf).
 *
 * MARKENZEICHEN: jedes „®“ zeichnet MarkeR klein hochgestellt (Christian
 * 28.10. Z1); die Daten tragen es als normales Zeichen.
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
export function TheAlphaShop({
  product,
  addons,
  reservierung = null,
  nachDerBox = null,
}) {
  const land = useMarktLand();
  const {open} = useAside();
  const haupt = product.selectedOrFirstAvailableVariant;
  const waehrung = haupt?.price?.currencyCode || 'EUR';
  // Add-ons nur neben einem kaufbaren Qi Alpha, sonst in jedem Markt, in
  // dem Shopify sie mit Preis in der Marktwährung führt (addonsImMarkt; bis
  // 30.10.2026 nur EUR/CHF, F-2755). Dieselbe Regel wie die Kaufseite B.
  const {
    stand,
    nummernAn: nummernFrei,
    ketten,
    marktAddons,
  } = kaufAuswahl(addons, haupt);
  // PREMIUM-KUNDEN-CHECKOUT (Christian 01.11.2026, Job 20261101-prio2-qi-
  // alpha-premium-checkout-reservierte-nummern-links): `reservierung` kommt
  // nur aus dem Spiegel products.qi-alpha-reserviert.$schluessel.jsx. Dann
  // stehen in der Nummernwahl oben NUR die reservierte(n) Nummer(n) mit
  // „Reserviert für <Name>“, darunter die freie Auswahl, kein Vorschlag und
  // kein „Ohne Wunschnummer“. Jede gewählte Nummer ist ein Gerät mit eigener
  // Kette („wenn er die zwei Nummern auswählt, dann kommen auch zwei G-Master
  // in den Korb“). Ohne `reservierung` bleibt alles wie bisher.
  const premium = Boolean(reservierung);
  const reserviert = premium
    ? reserviertStand(reservierung, marktAddons.wunschnummer?.variants?.nodes)
    : [];
  const nummernAn = nummernFrei || reserviert.length > 0;
  const [reserviertAn, setReserviertAn] = useState(() =>
    reserviert.filter((x) => x.variante).map((x) => x.n),
  );
  const [kettenJe, setKettenJe] = useState({});
  const [fokus, setFokus] = useState(null);

  const [nummer, setNummer] = useState(null);
  const [freiOffen, setFreiOffen] = useState(false);
  const [ketteTitel, setKetteTitel] = useState('stahl');
  // ?bezahlart=ratenzahlung wählt die Ratenzahlung vor und öffnet das
  // Fenster nach dem Laden (Link aus Chat, Mail oder Anzeige).
  const [such] = useSearchParams();
  const vorwahlRaten = such.get('bezahlart') === 'ratenzahlung';
  const [zahlart, setZahlart] = useState(vorwahlRaten ? 'raten' : 'direkt');
  const [fenster, setFenster] = useState(null);
  const [bild, setBild] = useState(0);

  const nummerEintrag = stand.nummern.find(
    (x) => x.n === nummer && x.status === 'frei',
  );
  const kette =
    ketten.find((k) => k.titel === ketteTitel) ??
    ketten.find((k) => k.titel === 'stahl') ??
    ketten[ketten.length - 1];
  // Die Geräte im Premium-Bereich: angewählte reservierte Nummern, dann die
  // frei gewählte. Ab zwei Geräten wählt jedes seine Kette selbst.
  const einheiten = premium
    ? [
        ...reserviert
          .filter((x) => x.variante && reserviertAn.includes(x.n))
          .map((x) => ({n: x.n, variante: x.variante, name: x.name})),
        ...(nummerEintrag
          ? [{n: nummerEintrag.n, variante: nummerEintrag.variante, name: null}]
          : []),
      ]
    : [];
  const mehrere = einheiten.length > 1;
  const ketteFuer = (n) =>
    (mehrere && ketten.find((k) => k.titel === kettenJe[n])) || kette;
  const fokusNummer =
    einheiten.find((g) => g.n === fokus)?.n ?? einheiten[0]?.n ?? null;

  const brutto = (money, handle) =>
    money ? bruttoAnzeige(money.amount, handle, money.currencyCode, land) : 0;
  const hauptPreis = brutto(haupt?.price, product.handle);
  const nummerPreisBasis = marktAddons.wunschnummer?.variants?.nodes?.find(
    (v) => v.price,
  )?.price;
  const nummerPreis = brutto(nummerPreisBasis, QM_ADDON.wunschnummer);
  const kettePreis = (k) =>
    k?.variante ? brutto(k.variante.price, QM_ADDON.kette) : 0;
  const kettenBetrag = (k) => (k?.art === 'gold' ? kettePreis(k) : 0);
  const summe = premium
    ? einheiten.reduce(
        (s, g) => s + hauptPreis + nummerPreis + kettenBetrag(ketteFuer(g.n)),
        0,
      )
    : hauptPreis +
      (nummerEintrag ? nummerPreis : 0) +
      (kette?.art === 'gold' ? kettePreis(kette) : 0);
  // GETEILTE ZAHLUNG (Grossjob 20261027-qi-alpha-geteilte-zahlung-10000-
  // raten-rest-sofort, s03): nur im EUR-Markt DE/AT, Aufteilung aus derselben
  // Summe wie die Zusammenfassung. Über 10.000 € zahlt der Kunde 10.000 € in
  // Raten und den Rest sofort; bis 10.000 € gilt der normale Ratenweg.
  // Im Premium-Bereich nur Direktzahlung: der Rest-Link der geteilten Zahlung
  // (qi-alpha-teilzahlung) trägt keinen Reservierungs-Schlüssel, und die
  // Sperre im Warenkorb nähme die reservierte Nummer dort wieder heraus.
  const ratenAn = !premium && ratenMarkt({waehrung, land});
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
    if (!premium && vorwahlRaten && teilung && haupt?.availableForSale) {
      setFenster({vorgang: vorgangsKennung()});
    }
    // Nur beim ersten Laden: die Vorwahl öffnet einmal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const vorbestellung = vorbestellungFürHandle(product.handle);

  // Shopify legt die Zeilen eines cartLinesAdd umgekehrt in den Warenkorb
  // (gemessen 28.10.2026). Übergeben wird Kette, Nummer, Qi Alpha®, damit
  // Warenkorb und Kasse Qi Alpha®, Nummer, Kette zeigen (Christian 27.10. Z3).
  // Die Kette geht als Zeile mit, ob Gold oder die inklusive Stahlkette zu
  // 0 € (Elina 30.10.2026, EL-20261030-ae569366: „damit Monta beide Artikel
  // bekommt“). Stahl ohne Variante (Rückfall, s. kettenOptionen) = keine Zeile.
  // Premium: je Gerät Nummer (reserviert mit Schlüssel und Name als
  // Zeilen-Merkmal, lib/qi-alpha-reservierung.js) und Kette, dazu der
  // Qi Alpha® in der Menge der Geräte.
  const premiumLinien = einheitenLinien({
    haupt,
    linie: addonLinien,
    einheiten: einheiten.map((g) => ({
      nummer: g.variante,
      merkmale: g.name
        ? reservierungsMerkmale(reservierung.schluessel, g.name)
        : null,
      kette: ketteFuer(g.n)?.variante ?? null,
    })),
  });
  const linien = haupt?.id
    ? [
        ...addonLinien({
          wunschnummer: nummerEintrag?.variante ?? null,
          kette: kette?.variante ?? null,
        }).reverse(),
        {merchandiseId: haupt.id, quantity: 1, selectedVariant: haupt},
      ]
    : [];

  // Gravur: nur Nummer und Edition, nie der Name (Christian: „auf der
  // Laserung steht dann nur 88 von 111“). Premium zeigt das zuletzt
  // angewählte Gerät.
  const gravur = gravurText(
    premium ? fokusNummer : (nummerEintrag?.n ?? null),
    THE_ALPHA_SERIE,
  );
  const ketteAnsicht =
    premium && einheiten.length ? ketteFuer(fokusNummer) : kette;
  const ketteGold = ketteAnsicht?.art === 'gold';
  const wahlNummer = (n) => {
    setNummer(n);
    if (n === null) setFreiOffen(false);
    if (n !== null) setFokus(n);
  };
  const vorschlagFrei = (n) =>
    stand.nummern.find((x) => x.n === n)?.status === 'frei';
  const freiGewaehlt =
    nummerEintrag && (premium || !NUMMER.vorschlaege.includes(nummerEintrag.n));
  const schalteReserviert = (n) => {
    const an = reserviertAn.includes(n);
    setReserviertAn(
      an ? reserviertAn.filter((x) => x !== n) : [...reserviertAn, n],
    );
    if (!an) setFokus(n);
  };
  const schalteFrei = () => {
    if (freiOffen || nummerEintrag) {
      setFreiOffen(false);
      setNummer(null);
    } else {
      setFreiOffen(true);
    }
  };
  const grossesBild = GALERIE.bilder[bild] ?? GALERIE.bilder[0];
  const seite = useRef(null);
  // Der eine Kaufknopf: in der Zusammenfassung und, mobil nach ihr, in der
  // Schlussleiste (dieselben Zeilen, dieselbe Beschriftung, derselbe Weg).
  const kaufknopf =
    geteilt && haupt?.availableForSale ? (
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
        disabled={!haupt?.availableForSale || (premium && !einheiten.length)}
        onClick={() => open('cart')}
        lines={premium ? premiumLinien : linien}
      >
        {haupt?.availableForSale ? ZUSAMMENFASSUNG.knopf : 'Ausverkauft'}
      </AddToCartButton>
    );

  return (
    <div ref={seite} className="tas-seite" data-the-alpha-shop="">
      {/* KOHÄRENTES LICHT OBEN, EIGENER ABSCHNITT (Christian 28.10.2026 Z16:
          „dass dieses kohärente Licht oben in der 360-Grad-Rotation steht …
          Und dann geht es runter zu den Bildern und zu der Shop-Beschreibung“).
          Am Desktop stehen Animation und Text nebeneinander, die Animation so
          groß wie das Galeriebild darunter (gleiches Raster 7fr | 5fr); am
          Handy untereinander, Text zuerst. Die Galerie zeigt nur Bilder. */}
      <section
        className="tas-licht"
        aria-labelledby="tas-licht-titel"
        data-tas-licht=""
      >
        <div className="tas-licht-raster">
          <div className="tas-licht-buehne" data-tas-band="">
            {KOPF.loop ? <BandLoop loop={KOPF.loop} /> : null}
          </div>
          <div className="tas-licht-text">
            {/* <p>, keine Überschrift: die erste Überschrift der Seite bleibt
                das h1 „Qi Alpha®“ im Produktkopf. */}
            <p id="tas-licht-titel" className="tas-band-titel">
              {KOPF.titel}
            </p>
            <p className="tas-band-unter">{KOPF.unter}</p>
          </div>
        </div>
      </section>

      <div className="tas-raster-seite">
        <div className="tas-galerie" data-tas-galerie="">
          <div className="tas-galerie-fest">
            <div className="tas-galerie-haupt" data-tas-buehne="bild">
              <img
                key={grossesBild.url}
                className="tas-bild tas-blende"
                src={`${grossesBild.url}&width=1200`}
                srcSet={GALERIE_BREITEN.map(
                  (w) => `${grossesBild.url}&width=${w} ${w}w`,
                ).join(', ')}
                sizes={GALERIE_SIZES}
                alt={grossesBild.alt}
                width="1200"
                height="1200"
              />
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
          {/* Produktkopf in Christians Folge (27.10. Z243–Z248): Name, Claim,
              Edition, drei Punkte mit rotem Zeichen, Preis, Herkunft. Der Preis
              steht allein, ohne Bewertung und Nutzerzahl: der Qi Alpha wird
              erst vorgestellt (Christian 28.10. Z1/Z2, Shop-Regel
              S5_launch_ohne_bewertung). Kein Knopf, keine Steuerzeile:
              gekauft wird im Konfigurator direkt darunter (Z229–Z233). */}
          <section
            className="tas-produkt"
            aria-labelledby="tas-name"
            data-tas-kopf=""
          >
            <h1 id="tas-name" className="tas-name">
              <MarkeR text={PRODUKT.name} />
            </h1>
            <p className="tas-claim">{PRODUKT.claim}</p>
            <p className="tas-edition">{PRODUKT.edition}</p>
            <ul className="tas-punkte">
              {PRODUKT.punkte.map((p) => (
                <li key={p.text} className="tas-punkt">
                  <Zeichen art={p.zeichen} />
                  {mitMarkeR(p.text)}
                </li>
              ))}
            </ul>
            <p className="tas-preiszeile">
              <span className="tas-preis" data-tas-preis="">
                {betragText(hauptPreis, waehrung)}
              </span>
            </p>
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
                role={premium ? 'group' : 'radiogroup'}
                aria-labelledby="tas-nummer-titel"
              >
                {premium
                  ? reserviert.map((x) => (
                      <Karte
                        key={x.n}
                        rolle="checkbox"
                        an={Boolean(x.variante) && reserviertAn.includes(x.n)}
                        gesperrt={!x.variante}
                        onClick={() => schalteReserviert(x.n)}
                        titel={`${x.n}/${THE_ALPHA_SERIE}`}
                        text={
                          x.variante
                            ? `Reserviert für ${x.name}`
                            : `Reserviert für ${x.name}, bereits gekauft`
                        }
                        preis={`+ ${betragText(nummerPreis, waehrung)}`}
                        data={{
                          'data-tas-nummer': String(x.n),
                          'data-tas-reserviert': x.status,
                        }}
                      />
                    ))
                  : null}
                {premium ? null : (
                  <Karte
                    an={!nummerEintrag && !freiOffen}
                    onClick={() => wahlNummer(null)}
                    titel={NUMMER.ohneTitel}
                    text={NUMMER.ohneHinweis}
                    preis={`+ ${betragText(0, waehrung)}`}
                    data={{'data-tas-nummer': 'ohne'}}
                  />
                )}
                {(premium ? [] : NUMMER.vorschlaege).map((n) =>
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
                  rolle={premium ? 'checkbox' : 'radio'}
                  an={freiOffen || Boolean(freiGewaehlt)}
                  onClick={premium ? schalteFrei : () => setFreiOffen(true)}
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
                    <img
                      className="tas-gravur-foto"
                      src={`${NUMMER.bildGravur.url}&width=${NUMMER.bildGravur.breite}`}
                      srcSet={GRAVUR_BREITEN.map(
                        (w) => `${NUMMER.bildGravur.url}&width=${w} ${w}w`,
                      ).join(', ')}
                      sizes={GRAVUR_SIZES}
                      alt={NUMMER.bildGravur.alt}
                      width={NUMMER.bildGravur.breite}
                      height={NUMMER.bildGravur.hoehe}
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
            {/* Premium mit zwei oder mehr Geräten: je Gerät eine Kettenwahl
                („Ketten je Gerät frei“), sonst die eine wie bisher. */}
            {mehrere ? (
              einheiten.map((g) => (
                <Fragment key={g.n}>
                  <p
                    id={`tas-kette-${g.n}`}
                    className="tas-einheit-titel"
                    data-tas-einheit={g.n}
                  >
                    {mitMarkeR(`Kette zu Qi Alpha® ${g.n}/${THE_ALPHA_SERIE}`)}
                  </p>
                  <div
                    className="tas-karten"
                    role="radiogroup"
                    aria-labelledby={`tas-kette-${g.n}`}
                    data-tas-einheit-ketten={g.n}
                  >
                    {ketten.map((k) => (
                      <Karte
                        key={k.titel}
                        an={ketteFuer(g.n)?.titel === k.titel}
                        onClick={() => {
                          setKettenJe({...kettenJe, [g.n]: k.titel});
                          setFokus(g.n);
                        }}
                        titel={k.name}
                        preis={
                          k.art === 'gold'
                            ? betragText(kettePreis(k), waehrung)
                            : KETTE_STAHL_PREIS
                        }
                        data={{'data-tas-kette': k.titel}}
                      />
                    ))}
                  </div>
                </Fragment>
              ))
            ) : (
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
                        : KETTE_STAHL_PREIS
                    }
                    data={{'data-tas-kette': k.titel}}
                  />
                ))}
              </div>
            )}
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
              className={ratenAn ? 'tas-karten tas-karten--zwei' : 'tas-karten'}
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
                  text={
                    teilung ? BEZAHLUNG.raten.text : BEZAHLUNG.raten.textGanz
                  }
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
            <MarkeR text={ZUSAMMENFASSUNG.titel} />{' '}
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
            {premium ? (
              // Je Gerät Qi Alpha® mit Gravur und seine Kette (Christian:
              // „was im Paket steht, dann zweimal G-Master und einmal
              // Goldkette und einmal Stahlkette“).
              einheiten.map((g) => {
                const k = ketteFuer(g.n);
                return (
                  <Fragment key={g.n}>
                    <div data-tas-posten-einheit={g.n}>
                      <dt>
                        <MarkeR text={PRODUKT.name} /> ·{' '}
                        {gravurText(g.n, THE_ALPHA_SERIE)}
                      </dt>
                      <dd>{betragText(hauptPreis + nummerPreis, waehrung)}</dd>
                    </div>
                    <div data-tas-posten-kette={k?.art}>
                      <dt>{mitMarkeR(k?.name)}</dt>
                      <dd>
                        {k?.art === 'gold'
                          ? betragText(kettePreis(k), waehrung)
                          : KETTE_STAHL_PREIS}
                      </dd>
                    </div>
                  </Fragment>
                );
              })
            ) : (
              <>
                <div>
                  <dt>
                    <MarkeR text={PRODUKT.name} /> · {gravur}
                  </dt>
                  <dd>
                    {betragText(
                      hauptPreis + (nummerEintrag ? nummerPreis : 0),
                      waehrung,
                    )}
                  </dd>
                </div>
                <div>
                  <dt>{mitMarkeR(kette?.name)}</dt>
                  <dd>
                    {ketteGold
                      ? betragText(kettePreis(kette), waehrung)
                      : KETTE_STAHL_PREIS}
                  </dd>
                </div>
              </>
            )}
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
          <div className="tas-kaufknopf">{kaufknopf}</div>
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
              <MarkeR text={PRODUKT.name} /> · {gravur}
            </figcaption>
          </figure>
          <figure
            className="tas-box-teil"
            data-tas-kette-farbe={ketteGold ? 'gold' : 'stahl'}
          >
            <KettenBild bild={KETTE.bilder[1]} breite={600} />
            <figcaption data-tas-box-kette="">
              {mitMarkeR(kette?.box ?? kette?.name)}
            </figcaption>
          </figure>
        </div>
      </section>
      {nachDerBox}

      <Schlussleiste
        wurzel={seite}
        name={<MarkeR text={PRODUKT.name} />}
        betrag={betragText(summe, waehrung)}
        abschnitt="tas-schlussleiste"
      >
        {kaufknopf}
      </Schlussleiste>

      {fenster && teilung ? (
        <TeilzahlungFenster
          teilung={teilung}
          betrag={betrag}
          link={teil1Link({
            vorgang: fenster.vorgang,
            konfig: konfigText({
              qiAlpha: haupt?.id,
              nummer: nummerEintrag?.variante?.id ?? null,
              kette: kette?.variante?.id ?? null,
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
 * Lucas 360-Grad-Loop im Abschnitt „Kohärentes Licht“: stumm, inline, in Schleife, ohne
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

/** Eine Auswahl-Karte wie bei Apple: Rahmen, gewählt = dunkel umrandet. */
function Karte({
  an,
  onClick,
  titel,
  text = null,
  preis = null,
  data = {},
  rolle = 'radio',
  gesperrt = false,
}) {
  return (
    <button
      type="button"
      role={rolle}
      aria-checked={an}
      className="tas-karte"
      onClick={onClick}
      disabled={gesperrt}
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
