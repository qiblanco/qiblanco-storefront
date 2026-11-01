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
import {
  THE_ALPHA_FILM_OHNE_TEXT,
  THE_ALPHA_ABSCHNITTE,
  THE_ALPHA_ETIKETT,
} from '~/components/campaign/the-alpha-daten';

/*
 * ELINAS B-SEITE der Qi-Alpha-LP, /pages/Qi-Alpha-Elina (Elina 01.11.2026,
 * EL-20261101-a930d588: „Elinas Fassung läuft komplett getrennt als eigene
 * B-Seite unter eigener Adresse … die auf Christians Live-Stand nicht
 * zurückwirkt. Geteilte Bausteine nur über Schalter“). Dieselbe Geschichte wie
 * Variante A (TheAlpha.jsx, Christians Live-Seite /pages/Qi-Alpha, hier nicht
 * angefasst), mit dem Schalter `elina` an TapSeite (TheAlphaPremium.jsx,
 * the-alpha-elina.css):
 *  - Takt am Handy in der Mitte, 185 px je Zeile (EL-20261101-242cff9c (1)),
 *  - Video in eigener Bühne, drei lange Schritte, normale Geschwindigkeit,
 *    mit Christians Slap-Stop + 3-s-Halt (`stopper`, (2)),
 *  - Abspiel-Zeichen, wenn iOS das Abspielen ohne Tipp ablehnt ((3)).
 * Nicht live verlinkt, noindex (lib/vorschau-noindex.js); „bitte nicht
 * automatisch live schalten“.
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

/** Seitenband „Qi Alpha ®“, Zuschnitt 2:1 aus dem Original-Rendering 05_side
 * (2048 px), Riegel mittig mit Rand, der ausgebrannte Lichtpunkt am rechten
 * Bildrand auf den Grundton gelegt (Challenger 26.10.). Datei im Jobordner
 * bilder/the-alpha-seitenband-2zu1.jpg. */
const SEITENBAND = {
  url: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/the-alpha-seitenband-2zu1.jpg?v=1793010108',
  alt: 'Seitenband des Qi Alpha® mit der Gravur Qi Alpha®',
  width: 1936,
  height: 968,
};

export default function TheAlphaElina() {
  return (
    <TapSeite variante="a" film="szene" ton="an" elina>
      <TapTitelkarte />
      <TapWoerterbuch />
      <TapFilm film={THE_ALPHA_FILM_OHNE_TEXT} stopper />
      <TapKapitel abschnitt={MANIFESTATION}>
        <TapKarten bilder={MANIFESTATION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={PROTECTION}>
        <TapKarten bilder={PROTECTION.bilder} />
      </TapKapitel>
      <TapKapitel abschnitt={LONGEVITY} />
      <TapMarke bild={SEITENBAND} etikett={THE_ALPHA_ETIKETT} />
      <TapEdition />
    </TapSeite>
  );
}
