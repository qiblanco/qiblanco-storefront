import {
  TapSeite,
  TapHero,
  TapDefinition,
  TapFilm,
  TapKapitel,
  TapPaar,
  TapVollbild,
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
 * Reihenfolge wie die Vorlage, Wortlaut Christians: Kohärentes Licht (Hero)
 * → Definition → Video Luca → Manifestation + Diamant-Paar → Protection +
 * Gerät → Longevity + Seitenband „Qi Alpha ®“ → Limited 1st. Edition 111/111
 * → „Jetzt Exklusiv Reservieren“ (TheAlphaKauf, Ziel aus the-alpha-daten.js).
 *
 * Rhythmus: dunkel (Hero, Definition, Video) → Sand (Manifestation, der Grund
 * der Diamant-Aufnahmen) → dunkel (Protection) → hell (Longevity) → dunkel
 * (Abschluss).
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

export default function TheAlpha() {
  return (
    <TapSeite variante="a">
      <TapHero />
      <TapDefinition />
      <TapFilm film={THE_ALPHA_VIDEO} />
      <TapKapitel abschnitt={MANIFESTATION} ton="sand">
        <TapPaar bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION} ton="nacht" />
      <TapVollbild bild={PROTECTION.bilder[1]} ton="nacht" />
      <TapKapitel abschnitt={LONGEVITY} ton="tag" />
      <TapVollbild bild={SEITENBAND} ton="tag" format="band" />
      <TapEdition />
    </TapSeite>
  );
}
