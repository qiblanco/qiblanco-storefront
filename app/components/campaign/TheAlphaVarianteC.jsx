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
import {THE_ALPHA_VIDEO, THE_ALPHA_ABSCHNITTE} from '~/components/campaign/the-alpha-daten';

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
 *  - Länge: der kurze Schnitt, kürzere Bühnen, nichts nach dem Knopf.
 * Seit 27.10. (Christian, Nachtrag ~21:40 Bangkok): kein zweiter Knopf mit
 * Umriss mehr, und die Schluss-Szene trägt weder Preis noch Detailzeile. Sie
 * heißt genau Qi Alpha® / Limited 1st. Edition / 111/111 / roter Knopf / Ende,
 * wie in A und B. Preis und Details zeigt die Shopseite.
 *
 * Bausteine und Tokens: TheAlphaPremium.jsx / the-alpha-premium.css (geteilt,
 * hier nicht geändert). Eigenes nur im Scope
 * .tap-seite[data-the-alpha-premium='c'] in app/styles/the-alpha-variante-c.css.
 * Ton und Video-Ton kommen über TapSeite/TapFilm aus dem Gerüst.
 *
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

/** Seitenband „Qi Alpha ®“ wie in A (Zuschnitt 2:1 aus 05_side). */
const SEITENBAND = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/the-alpha-seitenband-2zu1.jpg?v=1793010108',
  alt: 'Seitenband des Qi Alpha mit der Gravur Qi Alpha',
  width: 1936,
  height: 968,
};

export default function TheAlphaVarianteC() {
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
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} />
      <TapMarke bild={SEITENBAND} />
      <TapEdition />
    </TapSeite>
  );
}
