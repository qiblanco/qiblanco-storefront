import {
  TapSeite,
  TapTitelkarte,
  TapWoerterbuch,
  TapFilm,
  TapKapitel,
  TapKarten,
  TapMarke,
  TapEdition,
} from '~/components/campaign/TheAlphaPremium';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {THE_ALPHA_VIDEO, THE_ALPHA_ABSCHNITTE} from '~/components/campaign/the-alpha-daten';
import {TAC_ABSCHLUSS} from '~/components/campaign/the-alpha-variante-c-daten';

/*
 * THE ALPHA, Variante C (KI-optimiert), Adresse /pages/The-Alpha-B.
 * Seit 26.10.2026 auf Christians Film-Geschichte (Grossjob 20261026-prio1-
 * the-alpha-variante-a-designmeister-premium-gestaltung, s03); die Fassung
 * vom 25.10. hatte Christians Konzept verlassen (Z5/Z6).
 *
 * GESCHICHTE WIE A (Z7/Z8, Drehbuch Z24–Z98): Titelkarte „Kohärentes Licht“
 * → „- Ultra High Vibe Mode -“ → Wörterbuch (Pulp Fiction, Quelle Google AI)
 * → Lucas Video → Manifestation (RAW/DIAMANT) → Protection
 * (ENDLESS/POSSIBILITY) → Longevity → THE ALPHA → Limited 1st. Edition
 * 111/111 → roter Knopf (TheAlphaKauf, Ziel aus the-alpha-daten.js).
 *
 * WAS C ANDERS MACHT (Z9, Feinheiten aus Messdaten, Belege in
 * the-alpha-variante-c-daten.js):
 *  - Länge: der kurze Schnitt, kürzere Bühnen, nichts nach dem Knopf,
 *  - nach Protection ein ruhiger zweiter Knopf (Umriss in Etikett-Schrift,
 *    kein Rot, derselbe Wortlaut wie der rote Knopf),
 *  - im Abschluss der Preis klein über dem roten Knopf, mit Rückgabe, Raten
 *    und Versand zwischen Preis und Knopf. Seit 27.10. endet die Seite mit
 *    dem Knopf (Christian Z258–Z263), die Zeilen stehen deshalb davor.
 *
 * Bausteine und Tokens: TheAlphaPremium.jsx / the-alpha-premium.css (geteilt,
 * hier nicht geändert). Eigenes nur im Scope
 * .tap-seite[data-the-alpha-premium='c'] in app/styles/the-alpha-variante-c.css.
 * Ton und Video-Ton kommen über TapSeite/TapFilm aus dem Gerüst.
 *
 * MESSMARKEN: data-tac-zwischen (zweiter Knopf), data-tac-preis (Preis im
 * Abschluss, data-preis-quelle shopify|fest), data-tac-sicher (Zeilen über
 * dem roten Knopf).
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

/** Seitenband „Qi Alpha ®“ wie in A (Zuschnitt 2:1 aus 05_side). */
const SEITENBAND = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/the-alpha-seitenband-2zu1.jpg?v=1793010108',
  alt: 'Seitenband des Qi Alpha mit der Gravur Qi Alpha',
  width: 1936,
  height: 968,
};

/** „10.639 €“: glatte Beträge ohne Nachkommastellen, echte Cents bleiben. */
export function preisText(price) {
  const betrag = Number(price?.amount);
  if (!Number.isFinite(betrag) || betrag <= 0) return null;
  const ganz = Number.isInteger(betrag);
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: price.currencyCode || 'EUR',
    minimumFractionDigits: ganz ? 0 : 2,
    maximumFractionDigits: ganz ? 0 : 2,
  }).format(betrag);
}

function Preis({preis}) {
  const text = preisText(preis?.price) || preisText(TAC_ABSCHLUSS.festpreis);
  return (
    <p
      className="tac-preis"
      data-tac-preis=""
      data-preis-quelle={preis ? 'shopify' : 'fest'}
      data-tap-ein=""
      style={{'--tap-folge': 3}}
    >
      {text}
    </p>
  );
}

/** @param {{preis: {handle: string, price: object} | null}} props */
export default function TheAlphaVarianteC({preis}) {
  return (
    <TapSeite variante="c">
      <TapTitelkarte />
      <TapWoerterbuch />
      <TapFilm film={THE_ALPHA_VIDEO} />
      <TapKapitel abschnitt={MANIFESTATION}>
        <TapKarten bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION}>
        <TapKarten bilder={PROTECTION.bilder} />
        <div className="tac-zwischen" data-tac-zwischen="" data-tap-ein="">
          <TheAlphaKauf className="tac-zwischen-kauf" />
        </div>
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} />
      <TapMarke bild={SEITENBAND} />
      <TapEdition>
        <Preis preis={preis} />
        <ul className="tac-sicher" data-tac-sicher="" data-tap-ein="" style={{'--tap-folge': 3}}>
          {TAC_ABSCHLUSS.sicher.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      </TapEdition>
    </TapSeite>
  );
}
