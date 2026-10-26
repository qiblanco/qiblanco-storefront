import {
  TapSeite,
  TapTitelkarte,
  TapWoerterbuch,
  TapFilm,
  TapKapitel,
  TapKarten,
  TapVollbild,
  TapMarke,
  TapEdition,
} from '~/components/campaign/TheAlphaPremium';
import {TheAlphaLiveAnmeldung} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {THE_ALPHA_VIDEO, THE_ALPHA_ABSCHNITTE} from '~/components/campaign/the-alpha-daten';
import {
  TAB_AKZENT,
  TAB_UNTERSEITE,
  TAB_SEITENBAND,
  TAB_ABSCHLUSS,
  TAB_LIVE,
  TAB_FRAGEN,
} from '~/components/campaign/the-alpha-variante-b-daten';

/*
 * THE ALPHA, Variante B (Server/Designmeister), Adresse /pages/The-Alpha-C.
 * Seit 26.10.2026 auf Christians Film-Geschichte (Grossjob 20261026-prio1-
 * the-alpha-variante-a-designmeister-premium-gestaltung, s02); die Fassung
 * vom 25.10. begann mit einem eigenen Nutzen-Block und hatte Christians
 * Konzept verlassen (Z6).
 *
 * GESCHICHTE WIE A (Z7/Z8, Drehbuch Z24–Z98): Titelkarte „Kohärentes Licht“
 * → „- Ultra High Vibe Mode -“ → Wörterbuch (Pulp Fiction, Quelle Google AI)
 * → Lucas Video → Manifestation (RAW/DIAMANT) → Protection
 * (ENDLESS/POSSIBILITY) → Longevity → THE ALPHA → Limited 1st. Edition
 * 111/111 → roter Knopf (TheAlphaKauf, Ziel aus the-alpha-daten.js).
 *
 * WAS B ANDERS MACHT (Z9, Feinheiten, nicht Geschichte):
 *  - unter Christians drei Zeilen je Kapitel ein Nutzen-Akzent (TAB_AKZENT),
 *  - Longevity mit eigenem Bild: die Unterseite „Made in Germany“ randlos,
 *  - im Abschluss der Preis, kleiner als der Titel, mit einer ruhigen Zeile;
 *    NACH dem Knopf die Live-Anmeldung 8. November und die Fragen.
 *
 * Bausteine und Tokens: TheAlphaPremium.jsx / the-alpha-premium.css (geteilt,
 * hier nicht geändert). Eigenes nur im Scope
 * .tap-seite[data-the-alpha-premium='b'] in app/styles/the-alpha-variante-b.css.
 * Ton und Video-Ton kommen über TapSeite/TapFilm aus dem Gerüst.
 *
 * ÜBERSCHRIFTEN: h2 tragen nur die drei Kapitel (EIN H2-Stil je Seite, die
 * Rubrik zählt Größe x Gewicht); Live und Fragen nach dem Knopf sind ruhige h3.
 *
 * MESSMARKEN: data-tab-preis (Preis im Abschluss), data-tab-live,
 * data-tab-fragen; Probe claude-jobs/<grossjob>/nachher/variante-b/probe_b_film.py.
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

/** „10.639 €“: glatte Beträge ohne Nachkommastellen, echte Cents bleiben. */
export function preisText(price) {
  const betrag = Number(price?.amount);
  if (!Number.isFinite(betrag) || betrag <= 0) return null;
  const ganz = Math.floor(betrag);
  const cent = Math.round((betrag - ganz) * 100);
  const tausender = String(ganz).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const zeichen = price.currencyCode === 'EUR' || !price.currencyCode ? '€' : price.currencyCode;
  return cent ? `${tausender},${String(cent).padStart(2, '0')} ${zeichen}` : `${tausender} ${zeichen}`;
}

function Abschluss({preis}) {
  const text = preisText(preis?.price) || preisText(TAB_ABSCHLUSS.festpreis);
  return (
    <div className="tab-abschluss" data-tap-ein="" style={{'--tap-folge': 3}}>
      <p className="tab-preis" data-tab-preis="" data-preis-quelle={preis ? 'shopify' : 'fest'}>
        {text}
      </p>
      <ul className="tab-preis-zeile">
        {TAB_ABSCHLUSS.zeilen.map((z) => (
          <li key={z}>{z}</li>
        ))}
      </ul>
    </div>
  );
}

function Live() {
  return (
    <section
      className="tab-live"
      data-tab-live=""
      id={TAB_LIVE.anker}
      aria-labelledby="tab-live-titel"
    >
      <h3 className="tab-h3" id="tab-live-titel">
        {TAB_LIVE.titel}
      </h3>
      <p className="tab-live-wann">{TAB_LIVE.wann}</p>
      <p className="tab-text">{TAB_LIVE.text}</p>
      <TheAlphaLiveAnmeldung className="tab-live-karte" quelle="the-alpha" variante="B" />
    </section>
  );
}

function Fragen() {
  return (
    <section className="tab-fragen" data-tab-fragen="" aria-labelledby="tab-fragen-titel">
      <h3 className="tab-h3" id="tab-fragen-titel">
        {TAB_FRAGEN.titel}
      </h3>
      {TAB_FRAGEN.liste.map((f) => (
        <details className="tab-frage" key={f.frage}>
          <summary className="tab-frage-kopf">{f.frage}</summary>
          <p className="tab-text">{f.antwort}</p>
        </details>
      ))}
    </section>
  );
}

/** @param {{preis: {handle: string, price: object} | null}} props */
export default function TheAlphaVarianteB({preis}) {
  return (
    <TapSeite variante="b">
      <TapTitelkarte />
      <TapWoerterbuch />
      <div className="tab-film">
        <TapFilm film={THE_ALPHA_VIDEO} />
      </div>
      <TapKapitel abschnitt={MANIFESTATION} akzent={TAB_AKZENT.manifestation}>
        <TapKarten bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION} akzent={TAB_AKZENT.protection}>
        <TapKarten bilder={PROTECTION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} akzent={TAB_AKZENT.longevity} />
      <div className="tab-unterseite">
        <TapVollbild bild={TAB_UNTERSEITE} />
      </div>
      <TapMarke bild={TAB_SEITENBAND} />
      <TapEdition>
        <Abschluss preis={preis} />
      </TapEdition>
      <Live />
      <Fragen />
    </TapSeite>
  );
}
