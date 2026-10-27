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
 * THE ALPHA, Variante A: Christians Figma-Geschichte, vom Designmeister
 * gestaltet (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-
 * premium-gestaltung, s01). Bis 26.10.2026 stand hier ein 1:1-Abbild der
 * Vorlage; Christian: „das war nicht das Ziel, sondern der Desinger Meister
 * sollte das in eine umwandlen“.
 *
 * Drehbuch (Christian 26.10., Nachträge Z24–Z98, Figma-Ausschnitte
 * christian-szene-1..4): die Seite ist ein Film, alles auf Schwarz.
 * Titelkarte „Kohärentes Licht“ → beim Scrollen „- Ultra High Vibe Mode -“ →
 * Wörterbuch im Pulp-Fiction-Stil (Quelle Google AI) → Video Luca →
 * Manifestation + RAW/DIAMANT → Protection + ENDLESS/POSSIBILITY → Longevity
 * → Seitenansicht mit Etikett THE ALPHA → „THE ALPHA“ → Limited 1st. Edition
 * 111/111 → roter Balken „Jetzt Exklusiv Reservieren“ (TheAlphaKauf, Ziel aus
 * the-alpha-daten.js).
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

/** Seitenband „Qi Alpha ®“, Zuschnitt 2:1 aus dem Original-Rendering 05_side
 * (2048 px), Riegel mittig mit Rand, der ausgebrannte Lichtpunkt am rechten
 * Bildrand auf den Grundton gelegt (Challenger 26.10.). Datei im Jobordner
 * bilder/the-alpha-seitenband-2zu1.jpg. */
const SEITENBAND = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/the-alpha-seitenband-2zu1.jpg?v=1793010108',
  alt: 'Seitenband des Qi Alpha mit der Gravur Qi Alpha',
  width: 1936,
  height: 968,
};

/** Elina 27.10.2026 (EL-20261027-9707359d, Vorschau): die Dreier-Zeilen
 * stehen in EINER Zeile mit Mittelpunkt (`reihe`), die Bild-Etiketten ohne
 * schwarzen Balken. `etikett` = 'verlauf' (Variante A) oder 'pille'
 * (Variante B); Elina wählt, danach bleibt nur ihr Wert stehen. */
export default function TheAlpha({etikett = 'verlauf'}) {
  return (
    <TapSeite variante="a" etikett={etikett}>
      <TapTitelkarte />
      <TapWoerterbuch />
      <TapFilm film={THE_ALPHA_VIDEO} />
      <TapKapitel abschnitt={MANIFESTATION} reihe>
        <TapKarten bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION} reihe>
        <TapKarten bilder={PROTECTION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} reihe />
      <TapMarke bild={SEITENBAND} />
      <TapEdition />
    </TapSeite>
  );
}
