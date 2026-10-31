import {useEffect, useRef, useState} from 'react';
import {Analytics} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {bruttoAnzeige} from '~/lib/markt-pricing';
import {useMarktLand} from '~/lib/markt-land';
import {betragText} from '~/lib/betrag-text';
// ® klein hochgestellt wie auf /products/qi-alpha (EIN Maß im Haus, reusables/MarkeR.jsx)
import {MarkeR, mitMarkeR} from '~/components/reusables/MarkeR';
import {Produkt360Video} from '~/components/reusables/Produkt360Video';
import {ImgixVideo} from '~/components/reusables/ImgixVideo';
import {Schlussleiste} from '~/components/reusables/Schlussleiste';
import {ERSATZBILD_360} from '~/components/reusables/video360-ersatzbild';
import {PRODUCT_VARIANT_FRAGMENT} from '~/lib/qioneProductQuery';
import {
  auswahlAngebot,
  bezahlOptionen,
  boxKacheln,
  kettenKacheln,
  laengenAttribut,
  laengenKacheln,
  mitBreite,
  mitRate,
  schrittAbschnitt,
  startLaenge,
  startWahl,
  variantenOptionen,
  varianteZurWahl,
  warenkorbZeilen,
  zusammenfassung,
} from './alpha-vorlage-logik';

export {kettenKacheln};

/* Galerie-Hauptbild: Breitenstufen bis zum CDN-Master (2048/2056 px), damit
   Tablets mit dpr 2 nicht hochskalieren (Gate 12 bild-aufloesung). sizes folgt
   der im Testserver gemessenen Fläche je Format (31.10.2026: 328…868 px =
   100vw - 32 unter 1024, 551 px bei 1024, 653 px ab 1232 = (1200 - 32 - 48)
   * 7/12, Raster in the-alpha-produkt.css). Dieselbe Rechnung gilt für
   AlphaVorlage.jsx und TheAlphaShop.jsx, beide stehen auf .tas-raster-seite. */
const GALERIE_BREITEN = [600, 900, 1200, 1600, 2048];
const GALERIE_SIZES =
  '(min-width: 1232px) 654px, (min-width: 1024px) calc((100vw - 80px) * 0.584), calc(100vw - 32px)';

/*
 * PRODUKT-KONFIGURATOR NACH DER QI-ALPHA-KAUFSEITE (Christian 27.10.2026, Z2:
 * „dieses shopdesing auf die Verkaufseiten von qione 2 pro, qihome udn
 * qibralcet … von der Farbe her aber in gold statt rot ton“; Grossjob
 * 20261027-GROSSJOB-apple-konfigurator-qione-qihome-qibracelet-ab, s05,
 * KONZEPT §3). Ausgebaut aus Elinas Alpha-Vorlage (EL-20261027-c05a2273,
 * Dauerregel: Standard für alle Produktseiten, live je Seite nach ihrem GO).
 *
 * EIN GERÜST, DATEN JE PRODUKT: diese Datei kennt kein Produkt. Was eine Seite
 * zeigt, steht in <handle>-alpha-daten.js (Schnittstelle: claude-jobs/<grossjob>/
 * s05/SCHNITTSTELLE.md); Preise, Varianten und Lieferbarkeit nur aus Shopify.
 * Die reinen Regeln (Optionen, Raten, Zusammenfassung, Box) stehen in
 * alpha-vorlage-logik.js und sind ohne Build getestet.
 *
 * AUFBAU wie /products/qi-alpha, Schritt für Schritt untereinander:
 *   1 schwarzes Band mit dem 360-Grad-Loop (Poster zuerst, nie Schwarz)
 *   2 Produktkopf: Overline, Modus, Name®, Claim, Kurzzeile, drei Kernpunkte
 *     mit ruhig bewegten Zeichen in Gold, Preis allein (Apple-Muster, kein
 *     Preisanker), Herkunft
 *   3 Variante (nur wenn Shopify eine echte Wahl führt, z. B. Größe)
 *   4 Kette (nur wenn die Daten sie verlangen)
 *   5 Bezahlart: direkt oder in Raten, Monatsbetrag live aus der Auswahl
 *     (Gerät + Kette, Christian 29.10.2026 Z3)
 *   6 Zusammenfassung mit EINEM Kaufknopf; mobil wiederholt ihn die
 *     Schlussleiste, sobald er nach oben weggescrollt ist (reusables/
 *     Schlussleiste.jsx, 30.10.2026: am Seitenende ein aktiver Kaufknopf)
 *   7 What's in the Box: nur Bilder mit Bildunterschrift, keine Liste
 *   8 Slots: Faktenkacheln, 20-Tage-Element, Vergleich, Wissen, Stimmen, FAQ
 * Keine Seriennummer-Auswahl (Christian Z5). Akzent ist das Hausgold aus
 * qb-tokens.css (--qb-akzent), kein zweiter Goldton.
 *
 * MESSUNG OHNE EIGENEN PIXEL: die Wurzel trägt data-konfigurator="<handle>",
 * jeder Schritt data-konfigurator-schritt="<name>" und data-section=
 * "konfig-<name>". Die cookielose Zählung (public/qiblanco-qpx-basis.js) zählt
 * damit „Schritt gesehen“ und jeden Klick im Schritt; ViewContent kommt aus
 * <Analytics.ProductView>, AddToCart als Cart-Event. Kein neuer Identitäts-Key.
 *
 * WARENKORB: Gerät (gewählte Variante aus PRODUCT_QUERY, trägt product.handle)
 * zuerst, die Kette als eigene Zeile derselben LinesAdd-Aktion. Partnercodes
 * hängen am Warenkorb (lib/partnercode.server.js).
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

/**
 * Lädt die Ketten für die Daten einer Seite; null ohne Kette oder bei Fehler
 * (dann entfällt nur der Schritt, der Kauf des Geräts bleibt heil).
 */
export async function ladeAlphaKetten(storefront, daten) {
  // KETTE: Kette als Zusatz (Geräteseiten); KETTE_IM_SET: die Kette liegt
  // bei, gefragt ist nur ihre Länge (s13-r3, Angebot QiOne® 2 Pro + Necklace).
  const stahl = daten?.KETTE?.handle ?? daten?.KETTE_IM_SET?.handle;
  if (!stahl) return null;
  const gold = Boolean(daten.KETTE?.handle && daten.KETTE_GOLD?.sichtbar);
  try {
    return await storefront.query(kettenQuery({gold}), {
      // PREIS FRISCH (Kettenpreis im Konfigurator): ohne `cache` CacheDefault =
      // SWR 24 h. Grossjob 20261004-GROSSJOB-preisanzeige-netto-brutto-rundung-alle-shops-waehrungen s12-r2.
      cache: storefront.CacheShort(),
      variables: {
        stahl,
        ...(gold ? {gold: daten.KETTE_GOLD.handle} : {}),
      },
    });
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   product: object,
 *   daten: object,
 *   ketten?: object|null,
 *   slots?: {vergleich?: import('react').ReactNode, wissen?: import('react').ReactNode,
 *            stimmen?: import('react').ReactNode, faq?: import('react').ReactNode},
 *   vertrauen?: import('react').ReactNode,
 *   videoKachel?: import('react').ReactNode,
 * }} props
 */
export function AlphaVorlage({
  product,
  daten,
  ketten = null,
  slots = {},
  vertrauen = null,
  videoKachel = null,
}) {
  const {PRODUKT, BAND, VARIANTE, KETTE, KETTE_GOLD, BEZAHLART, ZUSAMMENFASSUNG, BOX} =
    daten;
  // Optional (s13-r3): Kette liegt im Set bei, der Kunde wählt nur die Länge.
  const KETTE_IM_SET = daten.KETTE_IM_SET ?? null;
  const land = useMarktLand();
  const {open} = useAside();
  const handle = product.handle;

  const optionen = variantenOptionen(product);
  const [wahl, setWahl] = useState(() => startWahl(product));
  const variante = varianteZurWahl(product, wahl);
  const waehrung =
    variante?.price?.currencyCode ||
    product.selectedOrFirstAvailableVariant?.price?.currencyCode ||
    'EUR';

  const bilder = product?.images?.nodes ?? [];
  const band = bandQuelle(BAND);
  const [bild, setBild] = useState(0);
  const grossesBild = bilder[bild] ?? bilder[0];

  const kacheln = KETTE
    ? [
        ...kettenKacheln(ketten?.stahl, 'stahl', KETTE),
        ...(KETTE_GOLD?.sichtbar ? kettenKacheln(ketten?.gold, 'gold', KETTE_GOLD) : []),
      ]
    : [];
  const [ketteWahl, setKetteWahl] = useState(null);
  const kette = kacheln.find((k) => k.schluessel === ketteWahl) ?? null;

  const laengen = KETTE_IM_SET
    ? laengenKacheln(ketten?.stahl, Object.keys(KETTE_IM_SET.zeilen ?? {}))
    : [];
  const [laengeWahl, setLaengeWahl] = useState(() =>
    startLaenge(laengen, KETTE_IM_SET?.vorwahl ?? null),
  );
  const laenge = laengen.find((l) => l.cm === laengeWahl && l.verfuegbar) ?? null;

  const preis = (money, h) =>
    money ? bruttoAnzeige(money.amount, h, money.currencyCode, land) : 0;
  const hauptPreis = preis(variante?.price, handle);
  const kettenPreis = (k) =>
    preis(k.variante.price, k.art === 'gold' ? KETTE_GOLD.handle : KETTE.handle);

  // Raten aus der ganzen Auswahl, nicht nur aus dem Gerät: mit Kette stand
  // die Zeile „12 × … € im Monat“ still beim Gerätepreis (Christian
  // 29.10.2026 Z3: „bleibt … stehen“). Dieselbe Summe wie die Zusammenfassung.
  const angebot = auswahlAngebot({
    hauptPreis,
    kettePreis: kette ? kettenPreis(kette) : 0,
    waehrung,
    land,
  });
  const zahlOptionen = bezahlOptionen(BEZAHLART?.optionen, angebot);
  const [zahlart, setZahlart] = useState('direkt');
  const art = zahlOptionen.some((o) => o.id === zahlart) ? zahlart : 'direkt';
  const summe = zusammenfassung({
    name: laenge ? `${PRODUKT.name} · ${KETTE_IM_SET.name(laenge.cm)}` : PRODUKT.name,
    variante,
    varianteName: anzeigeName(VARIANTE, variante?.title),
    hauptPreis,
    kette,
    kettePreis: kette ? kettenPreis(kette) : 0,
    zahlart: art,
    waehrung,
    land,
  });
  const linien = warenkorbZeilen(variante, kette, laengenAttribut(laenge?.cm));
  // Kette im Set: ohne lieferbare Länge kein Kauf (nie eine Länge versprechen,
  // die nicht da ist).
  const kaufbar = linien.length > 0 && (!laengen.length || Boolean(laenge));
  const kettenBilder =
    kette?.art === 'gold' && KETTE_GOLD?.bilder ? KETTE_GOLD.bilder : KETTE?.bilder ?? [];
  const setBilder = KETTE_IM_SET?.bilder ?? [];
  const boxBilder = boxKacheln(BOX?.kacheln);
  const erster = optionen.length
    ? 'variante'
    : laengen.length
      ? 'laenge'
      : kacheln.length
        ? 'kette'
        : 'bezahlart';
  const seite = useRef(null);
  // Der eine Kaufknopf: in der Zusammenfassung und, mobil nach ihr, in der
  // Schlussleiste (dieselben Zeilen, dieselbe Beschriftung).
  const kaufknopf = (
    <AddToCartButton disabled={!kaufbar} onClick={() => open('cart')} lines={linien}>
      {kaufbar ? ZUSAMMENFASSUNG.knopf : 'Ausverkauft'}
    </AddToCartButton>
  );

  return (
    <div
      ref={seite}
      className="tas-seite av-seite"
      data-konfigurator={handle}
      data-alpha-vorlage={handle}
    >
      {/* BAND OBEN, EIGENER ABSCHNITT wie der Qi-Alpha-Endstand (#1068,
          Christian 28.10.2026 Z16 zur Qi Alpha; hier Z34 „der obere Bereich
          sehr, sehr, sehr ähnlich“): Desktop 360-Grad-Bühne so groß wie das
          Galeriebild, Text daneben; Handy untereinander, Text zuerst. Die
          Galerie darunter zeigt nur Bilder. Seit s08 (vorher stand das Band
          im Galeriefeld). */}
      {band ? (
        <section
          className="tas-licht av-licht"
          aria-labelledby={BAND.titel ? 'av-licht-titel' : undefined}
          data-tas-licht=""
          data-konfigurator-schritt="band"
          data-section={schrittAbschnitt('band')}
        >
          <div className="tas-licht-raster">
            <div className="tas-licht-buehne av-licht-buehne" data-tas-band="">
              <BandVideo band={band} />
            </div>
            {BAND.titel || BAND.unter ? (
              <div className="tas-licht-text">
                {/* <p>, keine Überschrift: die erste Überschrift bleibt das h1. */}
                {BAND.titel ? (
                  <p id="av-licht-titel" className="tas-band-titel">
                    {mitMarkeR(BAND.titel)}
                  </p>
                ) : null}
                {BAND.unter ? <p className="tas-band-unter">{mitMarkeR(BAND.unter)}</p> : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="tas-raster-seite">
        <div className="tas-galerie" data-tas-galerie="">
          <div className="tas-galerie-fest">
            {grossesBild ? (
              <div className="tas-galerie-haupt">
                <img
                  key={grossesBild.url}
                  className="tas-bild tas-blende"
                  src={mitBreite(grossesBild.url, 1200)}
                  srcSet={GALERIE_BREITEN.map((w) => `${mitBreite(grossesBild.url, w)} ${w}w`).join(', ')}
                  sizes={GALERIE_SIZES}
                  alt={grossesBild.altText || product.title}
                  width="1200"
                  height="1200"
                />
              </div>
            ) : null}
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
          {/* Produktkopf in der Folge der Qi-Alpha-Seite. Kein Knopf im Kopf:
              gekauft wird im Konfigurator direkt darunter (Shop-Regel: kein
              zweiter Kaufknopf). */}
          <section
            className="tas-produkt"
            aria-labelledby="av-name"
            data-tas-kopf=""
            data-konfigurator-schritt="kopf"
            data-section={schrittAbschnitt('kopf')}
          >
            {PRODUKT.overline ? <p className="av-overline">{PRODUKT.overline}</p> : null}
            {PRODUKT.modus ? <p className="av-modus">{PRODUKT.modus}</p> : null}
            <h1 id="av-name" className="tas-name">
              <MarkeR text={PRODUKT.name} />
            </h1>
            {PRODUKT.claim ? <p className="tas-claim">{PRODUKT.claim}</p> : null}
            {PRODUKT.kurzzeile ? <p className="tas-edition">{mitMarkeR(PRODUKT.kurzzeile)}</p> : null}
            <ul className="tas-punkte">
              {PRODUKT.punkte.map((p) => (
                <li key={p.text} className="tas-punkt">
                  <Zeichen art={p.zeichen} />
                  <span>{mitMarkeR(p.text)}</span>
                </li>
              ))}
            </ul>
            {/* Optional (QiOne® 2 Pro, s06): Textlink zum Vergleich weiter unten,
                Kundenfrage Nr. 1. Ein Link, kein zweiter Knopf im Kopf. */}
            {PRODUKT.vergleichLink?.href ? (
              <p className="av-vergleich-link">
                <a href={PRODUKT.vergleichLink.href} data-av-vergleich-link="">
                  {mitMarkeR(PRODUKT.vergleichLink.text)}
                </a>
              </p>
            ) : null}
            {/* PREIS ALLEIN, wie Apple und die Qi-Alpha-Kaufseite (.tas-preiszeile):
                kein Preisanker, keine Sterne, keine Nutzerzahl, kein Schild.
                Christian 29.10.2026 Z2: „das passt nich mehr hin … dauerhaft
                löaschen“; Shop-Regel S6_apple_ohne_preisanker hält es fest. */}
            {variante?.price ? (
              <p className="tas-preiszeile av-preiszeile">
                <span className="tas-preis" data-tas-preis="" data-av-preis="">
                  {betragText(hauptPreis, waehrung)}
                </span>
                {streichPreis(variante, hauptPreis, preis, handle) ? (
                  <s className="av-streichpreis" data-av-streichpreis="">
                    {betragText(streichPreis(variante, hauptPreis, preis, handle), waehrung)}
                  </s>
                ) : null}
              </p>
            ) : null}
            <p className="tas-herkunft">
              {PRODUKT.herkunft.map((z) => (
                <span key={z}>{z} </span>
              ))}
            </p>
          </section>

          {optionen.length ? (
            <Schritt
              name="variante"
              erster={erster === 'variante'}
              auszeichnung={VARIANTE?.auszeichnung ?? optionen[0].name}
              titel={VARIANTE?.titel}
            >
              {VARIANTE?.anleitung ? <p className="av-anleitung">{VARIANTE.anleitung}</p> : null}
              {optionen.map((o) => (
                <div
                  key={o.name}
                  className="tas-karten av-karten--drei"
                  role="radiogroup"
                  aria-label={o.name}
                >
                  {o.werte.map((w) => (
                    <Karte
                      key={w.name}
                      an={wahl[o.name] === w.name}
                      aus={!w.verfuegbar}
                      onClick={() => setWahl({...wahl, [o.name]: w.name})}
                      titel={anzeigeName(VARIANTE, w.name)}
                      text={
                        w.verfuegbar
                          ? VARIANTE?.zeilen?.[w.name] ?? null
                          : [VARIANTE?.zeilen?.[w.name], 'Ausverkauft'].filter(Boolean).join(' · ')
                      }
                      data={{'data-av-variante': w.name}}
                    />
                  ))}
                </div>
              ))}
              {VARIANTE?.grenzregel ? (
                <p className="av-grenzregel" data-av-grenzregel="">
                  {VARIANTE.grenzregel}
                </p>
              ) : null}
              {VARIANTE?.anpassen ? <p className="tas-klein">{VARIANTE.anpassen}</p> : null}
            </Schritt>
          ) : null}

          {laengen.length ? (
            <Schritt
              name="laenge"
              erster={erster === 'laenge'}
              auszeichnung={KETTE_IM_SET.auszeichnung}
              titel={KETTE_IM_SET.titel}
            >
              {KETTE_IM_SET.anleitung ? (
                <p className="av-anleitung">{mitMarkeR(KETTE_IM_SET.anleitung)}</p>
              ) : null}
              <div
                className="tas-karten av-karten--drei"
                role="radiogroup"
                aria-label={KETTE_IM_SET.auszeichnung}
              >
                {laengen.map((l) => (
                  <Karte
                    key={l.schluessel}
                    an={laenge?.cm === l.cm}
                    aus={!l.verfuegbar}
                    onClick={() => setLaengeWahl(l.cm)}
                    titel={`${l.cm} cm`}
                    text={
                      l.verfuegbar
                        ? KETTE_IM_SET.zeilen?.[l.cm] ?? null
                        : [KETTE_IM_SET.zeilen?.[l.cm], 'Ausverkauft'].filter(Boolean).join(' · ')
                    }
                    data={{'data-av-laenge': String(l.cm)}}
                  />
                ))}
              </div>
              {KETTE_IM_SET.grenzregel ? (
                <p className="av-grenzregel" data-av-grenzregel="">
                  {KETTE_IM_SET.grenzregel}
                </p>
              ) : null}
            </Schritt>
          ) : null}

          {kacheln.length ? (
            <Schritt
              name="kette"
              erster={erster === 'kette'}
              auszeichnung={KETTE.auszeichnung}
              titel={KETTE.titel}
            >
              {KETTE.zeile ? <p className="av-anleitung">{mitMarkeR(KETTE.zeile)}</p> : null}
              <div className="tas-karten" role="radiogroup" aria-label={KETTE.auszeichnung}>
                <Karte
                  an={!kette}
                  onClick={() => setKetteWahl(null)}
                  titel={KETTE.ohne.titel}
                  text={KETTE.ohne.text}
                  preis={betragText(0, waehrung)}
                  data={{'data-av-kette': 'ohne'}}
                />
                {kacheln.map((k) => (
                  <Karte
                    key={k.schluessel}
                    an={kette?.schluessel === k.schluessel}
                    onClick={() => setKetteWahl(k.schluessel)}
                    titel={k.name}
                    preis={betragText(kettenPreis(k), waehrung)}
                    data={{'data-av-kette': k.schluessel}}
                  />
                ))}
              </div>
              {kettenBilder.length ? (
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
              ) : null}
            </Schritt>
          ) : null}

          {BEZAHLART ? (
            <Schritt
              name="bezahlart"
              erster={erster === 'bezahlart'}
              auszeichnung={BEZAHLART.auszeichnung}
              // Ohne Ratenangebot (Markt nicht DE, unter 500 €) kein Raten-Titel:
              // titelDirekt oder gar keiner, nie ein Versprechen ohne Angebot.
              titel={angebot ? BEZAHLART.titel : BEZAHLART.titelDirekt}
            >
              <div
                className={`tas-karten${zahlOptionen.length > 2 ? ' av-karten--drei' : ''}`}
                role="radiogroup"
                aria-label={BEZAHLART.auszeichnung}
              >
                {zahlOptionen.map((o) => (
                  <Karte
                    key={o.id}
                    an={art === o.id}
                    onClick={() => setZahlart(o.id)}
                    titel={o.titel}
                    text={o.zeile}
                    data={{'data-av-zahlart': o.id}}
                  />
                ))}
              </div>
              {angebot && art !== 'direkt' && BEZAHLART.hinweis ? (
                <p className="tas-klein" data-av-raten="" aria-live="polite">
                  {mitRate(BEZAHLART.hinweis, angebot)}
                </p>
              ) : null}
            </Schritt>
          ) : null}
        </div>
      </div>

      <section
        className="tas-summe"
        aria-labelledby="av-summe-titel"
        data-tas-zusammenfassung=""
        data-konfigurator-schritt="zusammenfassung"
        data-section={schrittAbschnitt('zusammenfassung')}
      >
        <div className="tas-summe-kopf">
          <h2 id="av-summe-titel" className="tas-summe-titel">
            {mitMarkeR(ZUSAMMENFASSUNG.auszeichnung)}{' '}
            {ZUSAMMENFASSUNG.titel ? (
              <span className="tas-titel-rest tas-summe-unter">
                {mitMarkeR(ZUSAMMENFASSUNG.titel)}
              </span>
            ) : null}
          </h2>
          {bilder[0] ? (
            <img
              className="tas-summe-bild"
              src={mitBreite(bilder[0].url, 480)}
              alt={bilder[0].altText || product.title}
              width="240"
              height="240"
              loading="lazy"
            />
          ) : null}
        </div>
        <div className="tas-summe-zeilen">
          <dl className="tas-posten">
            {summe.posten.map((p) => (
              <div key={p.schluessel}>
                <dt>
                  <MarkeR text={p.name} />
                </dt>
                <dd>{betragText(p.betrag, waehrung)}</dd>
              </div>
            ))}
            <div className="tas-posten-summe">
              <dt>Summe</dt>
              <dd data-av-summe="">{betragText(summe.summe, waehrung)}</dd>
            </div>
            {summe.rate ? (
              <div className="tas-posten-teil" data-av-summe-rate="">
                <dt>{ZUSAMMENFASSUNG.rateName ?? 'Monatlich'}</dt>
                <dd>
                  {summe.rate.anzahl} × {summe.rate.text}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div className="tas-summe-kasse">
          <ul className="tas-versand">
            {(ZUSAMMENFASSUNG.zeilen ?? []).map((z) => (
              <li key={z}>{mitMarkeR(z)}</li>
            ))}
          </ul>
          <div className="tas-kaufknopf av-kaufknopf">{kaufknopf}</div>
          {ZUSAMMENFASSUNG.ruecknahme ? (
            <p className="tas-klein">{mitMarkeR(ZUSAMMENFASSUNG.ruecknahme)}</p>
          ) : null}
          {vertrauen}
        </div>
      </section>

      {BOX ? (
        <section
          className="tas-box av-box"
          aria-labelledby="av-box-titel"
          data-av-box=""
          data-konfigurator-schritt="box"
          data-section={schrittAbschnitt('box')}
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
                  <MarkeR text={BOX.haupt ?? PRODUKT.name} />
                </figcaption>
              </figure>
            ) : null}
            {/* Weitere Teile als Bild mit Bildunterschrift (QiOne® 2 Pro: das
                Baumwollband). Keine Liste darunter, wie beim QiBracelet®
                (Christian 29.10.2026 Z1). */}
            {boxBilder.map((t) => (
              <figure key={t.name} className="tas-box-teil" data-av-box-teil={t.schluessel}>
                <img
                  src={mitBreite(t.bild.url, 600)}
                  alt={t.bild.alt}
                  width="300"
                  height="300"
                  loading="lazy"
                />
                <figcaption>
                  <MarkeR text={t.name} />
                </figcaption>
              </figure>
            ))}
            {laenge && setBilder[0] ? (
              <figure className="tas-box-teil">
                <img
                  src={mitBreite(setBilder[0].url, 600)}
                  alt={setBilder[0].alt}
                  width="300"
                  height="300"
                  loading="lazy"
                />
                <figcaption data-av-box-kette="">{KETTE_IM_SET.box(laenge.cm)}</figcaption>
              </figure>
            ) : null}
            {kette && kettenBilder[0] ? (
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
            ) : null}
          </div>
        </section>
      ) : null}

      <Slots daten={daten} slots={slots} />

      <Schlussleiste
        wurzel={seite}
        name={<MarkeR text={PRODUKT.name} />}
        betrag={betragText(summe.summe, waehrung)}
        abschnitt={schrittAbschnitt('schlussleiste')}
      >
        {kaufknopf}
      </Schlussleiste>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: variante?.price?.amount || '0',
              vendor: product.vendor,
              variantId: variante?.id || '',
              variantTitle: variante?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/** Ein Konfigurator-Schritt: ein H2-Stil, Messanker je Schritt. */
function Schritt({name, erster = false, auszeichnung, titel = null, children}) {
  const id = `av-${name}-titel`;
  return (
    <section
      id={erster ? 'av-konfigurator' : undefined}
      className={erster ? 'tas-schritt tas-schritt--erster' : 'tas-schritt'}
      aria-labelledby={id}
      data-tas-schritt={name}
      data-konfigurator-schritt={name}
      data-section={schrittAbschnitt(name)}
    >
      <h2 id={id} className="tas-schritt-titel">
        <span className="tas-auszeichnung">{mitMarkeR(auszeichnung)}</span>
        {titel ? (
          <>
            {' '}
            <span className="tas-titel-rest">{mitMarkeR(titel)}</span>
          </>
        ) : null}
      </h2>
      {children}
    </section>
  );
}

/*
 * Slots unter der Box, feste Reihenfolge (KONZEPT §3.8): Faktenkacheln,
 * 20-Tage-Element, Vergleich, Wissen, Stimmen, FAQ. Datengetrieben, wo die
 * Daten den Block tragen (FAKTEN, RISIKOFREI, STIMMEN, FAQ); Vergleich und
 * Wissen sind Bausteine, die die Route hereingibt (z. B. AmazonStil). Ein
 * leerer Slot rendert nichts.
 */
function Slots({daten, slots}) {
  const {FAKTEN, RISIKOFREI, STIMMEN, FAQ} = daten;
  return (
    <>
      {FAKTEN?.kacheln?.length ? (
        <SlotHuelle name="fakten" titel={FAKTEN.ueberschrift}>
          <ul className="av-kacheln">
            {FAKTEN.kacheln.map((k) => (
              <li key={`${k.zahl}-${k.satz}`} className="av-kachel">
                {k.icon ? <FaktZeichen art={k.icon} /> : null}
                <span className="av-kachel-zahl">{k.zahl}</span>
                {/* Optional (s06): Titel zwischen Zahl und Satz (s03 kacheln). */}
                {k.titel ? <span className="av-kachel-titel">{mitMarkeR(k.titel)}</span> : null}
                <span className="av-kachel-satz">
                  <MarkeR text={k.satz} />
                </span>
              </li>
            ))}
          </ul>
        </SlotHuelle>
      ) : null}
      {RISIKOFREI?.zeile ? (
        <SlotHuelle name="risikofrei">
          <details className="av-risikofrei">
            <summary>
              <SymbolSchild />
              <span>{mitMarkeR(RISIKOFREI.zeile)}</span>
            </summary>
            {(RISIKOFREI.details ?? []).map((d) => (
              <p key={d}>{d}</p>
            ))}
            {RISIKOFREI.link?.href ? (
              <p>
                {RISIKOFREI.link.vor ? `${RISIKOFREI.link.vor} ` : null}
                <a href={RISIKOFREI.link.href}>{RISIKOFREI.link.text}</a>.
              </p>
            ) : null}
          </details>
        </SlotHuelle>
      ) : null}
      {slots.vergleich ? <SlotHuelle name="vergleich">{slots.vergleich}</SlotHuelle> : null}
      {slots.wissen ? <SlotHuelle name="wissen">{slots.wissen}</SlotHuelle> : null}
      {slots.stimmen ? (
        <SlotHuelle name="stimmen">{slots.stimmen}</SlotHuelle>
      ) : STIMMEN?.stimmen?.length ? (
        <SlotHuelle name="stimmen" titel={STIMMEN.ueberschrift}>
          <ul className="av-stimmen">
            {STIMMEN.stimmen.map((s) => (
              <li key={s.text}>
                <blockquote>{s.text}</blockquote>
                {s.name ? <p className="tas-klein">{s.name}</p> : null}
              </li>
            ))}
          </ul>
        </SlotHuelle>
      ) : null}
      {slots.faq ? (
        <SlotHuelle name="faq">{slots.faq}</SlotHuelle>
      ) : FAQ?.fragen?.length ? (
        <SlotHuelle name="faq" titel={FAQ.ueberschrift}>
          <div className="av-faq">
            {FAQ.fragen.map((f) => (
              <details key={f.f}>
                <summary>{f.f}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </SlotHuelle>
      ) : null}
    </>
  );
}

function SlotHuelle({name, titel = null, children}) {
  return (
    <section
      className={`av-slot av-slot--${name}`}
      data-konfigurator-slot={name}
      data-section={schrittAbschnitt(name)}
    >
      {titel ? <h2 className="tas-box-titel">{mitMarkeR(titel)}</h2> : null}
      {children}
    </section>
  );
}

/**
 * Quelle der Bühne aus den Daten: ein eigener Loop (src + poster wie bei der
 * Qi Alpha) oder die vorhandene 360-Grad-Drehung je Produkt mit Ersatzbild.
 */
function bandQuelle(BAND) {
  if (!BAND) return null;
  if (BAND.loop?.src) return {art: 'loop', ...BAND.loop};
  const ersatz = BAND.drehung ? ERSATZBILD_360[BAND.drehung] : null;
  if (!ersatz) return null;
  return {art: BAND.drehung, poster: ersatz.bild, alt: ersatz.alt, ersatz, videoPath: BAND.videoPath};
}

/*
 * Die Bühne im Band. Poster zuerst, nie ein schwarzer Ladebildschirm: der
 * eigene Loop setzt das Poster, die 360-Drehungen bringen ihr Ersatzbild mit
 * (video360-ersatzbild.jsx), bis das Video wirklich läuft.
 */
function BandVideo({band}) {
  if (band.art === 'loop') return <BandLoop loop={band} />;
  if (band.art === 'qione') return <Produkt360Video className="av-band-video" />;
  return <ImgixVideo videoPath={band.videoPath} ersatz={band.ersatz} className="av-band-video" />;
}

/**
 * Anzeigename eines Variantenwerts: VARIANTE.namen bildet den Shopify-Wert auf
 * das ab, was der Kunde liest (QiBracelet: „S – 17“ -> „S“, EIN Maßsystem,
 * Repair 20261023-repair-qibracelet-groessenhilfe-eindeutig-machen). Ohne
 * Eintrag bleibt der Shopify-Wert stehen.
 */
function anzeigeName(VARIANTE, wert) {
  return VARIANTE?.namen?.[wert] ?? wert;
}

function BandLoop({loop}) {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || typeof window.matchMedia !== 'function') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) v.pause();
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

/** Auswahl-Karte im Alpha-Stil (gleiches Markup wie TheAlphaShop). */
function Karte({an, aus = false, onClick, titel, text = null, preis = null, data = {}}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={an}
      aria-disabled={aus || undefined}
      className="tas-karte"
      onClick={aus ? undefined : onClick}
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

function SymbolSchild() {
  return (
    <svg
      className="av-symbol"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 3 20 6v6c0 4.6-3.3 8-8 9-4.7-1-8-4.4-8-9V6z" />
      <path d="m8.5 12 2.4 2.4 4.6-4.8" />
    </svg>
  );
}

/*
 * Zeichen der Faktenkacheln (Shop-Regel: Icons statt nackter Listenpunkte),
 * gleiche Linie und Farbe wie die Kernpunkt-Zeichen, ohne Bewegung. Unbekannte
 * Art: kein Zeichen.
 */
const FAKT_PFADE = {
  generationen: ['M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z', 'M4 25c0-4 2.7-7 6-7s6 3 6 7', 'M22 15a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z', 'M18 25c0-3.3 1.8-5.6 4-5.6s4 2.3 4 5.6'],
  wellen: ['M4 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0', 'M4 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0', 'M4 24c2-2 4-2 6 0s4 2 6 0 4-2 6 0 4 2 6 0'],
  material: ['M16 4 27 10v12l-11 6-11-6V10z', 'M5 10l11 6 11-6', 'M16 16v12'],
  handgelenk: ['M9 6c-2.5 2.6-4 6.2-4 10s1.5 7.4 4 10', 'M23 6c2.5 2.6 4 6.2 4 10s-1.5 7.4-4 10', 'M12.5 16h7'],
  bayern: ['M16 28s-9-7.6-9-15a9 9 0 0 1 18 0c0 7.4-9 15-9 15Z', 'M16 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z'],
  // QiHome® Air (s07): Reichweite, Kraft, ohne Strom, Zuhause.
  radius: ['M16 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M10.3 21.7a8 8 0 0 1 0-11.4', 'M21.7 10.3a8 8 0 0 1 0 11.4', 'M6.1 25.9a14 14 0 0 1 0-19.8', 'M25.9 6.1a14 14 0 0 1 0 19.8'],
  kraft: ['M18 3 7 18h8l-2 11 12-16h-8z'],
  'ohne-strom': ['M11 4v6', 'M21 4v6', 'M8 10h16v4a8 8 0 0 1-16 0z', 'M16 22v6', 'M5 27 27 5'],
  haus: ['M5 15.5 16 6l11 9.5', 'M8 13.5V26h16V13.5', 'M13.5 26v-6h5v6'],
};

function FaktZeichen({art}) {
  const pfade = FAKT_PFADE[art];
  if (!pfade) return null;
  return (
    <svg
      className="av-fakt-zeichen"
      viewBox="0 0 32 32"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-av-fakt-zeichen={art}
    >
      {pfade.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/*
 * Linien-Zeichen der drei Kernpunkte, in Gold (Christian Z4, Elina Punkt 4).
 * Gleiches Feld, gleiche Linie und dieselbe ruhige Bewegung wie die
 * Alpha-Zeichen (tas-zeichen-puls, ruht bei prefers-reduced-motion).
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
    // Schild mit Funkbögen, die außen abprallen.
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
  if (art === 'zuhause') {
    // Haus mit ruhig atmender Wärme darüber (QiHome® Air: Wohlfühlatmosphäre).
    return (
      <svg {...gemeinsam}>
        <path d="M5 15.5 16 6l11 9.5" />
        <path d="M8 13.5V26h16V13.5" />
        <path d="M13.5 26v-6h5v6" />
        <g className="tas-zeichen-puls">
          <path d="M22 3.5c1 1 1 2 0 3s-1 2 0 3" />
        </g>
      </svg>
    );
  }
  // Weitere Seiten (s13, z. B. die Kette): ein Kernpunkt darf ein Zeichen der
  // Faktenkacheln tragen (gleiche Linie, gleiche Farbe). Die drei Arten oben
  // und das Quantenfeld bleiben unverändert.
  if (art !== 'quantenfeld' && FAKT_PFADE[art]) {
    return (
      <svg {...gemeinsam}>
        {FAKT_PFADE[art].map((d) => (
          <path key={d} d={d} />
        ))}
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

/**
 * Streichpreis nur, wenn Shopify einen höheren Vergleichspreis führt
 * (compareAtPrice); sonst null. Dieselbe Umrechnung wie der Preis.
 */
function streichPreis(variante, hauptPreis, preis, handle) {
  const alt = variante?.compareAtPrice ? preis(variante.compareAtPrice, handle) : 0;
  return alt > hauptPreis ? alt : null;
}
