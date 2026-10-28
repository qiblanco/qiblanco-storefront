/**
 * YouTube-Videos in der Nutzer-Video-Reihe der Produktseiten.
 *
 * Christian am 2026-10-28, wörtlich: „das video noch beim qione 2 pro ein
 * binden lassen unter user, als erstes video aber in IG Style auch wenn es
 * youtbe ist https://youtube.com/shorts/vgd7qKQ990o"
 *
 * WARUM EINE EIGENE DATEI UND KEIN EINTRAG IN ig-testimonials.js:
 * Die Instagram-Datenschicht wird erzeugt, nicht gepflegt, und vier stehende
 * Proben lesen jeden ihrer Codes als Instagram-Reel (Link auf
 * instagram.com/reel/<code>, VideoObject-Knoten, Auswahl-Rechnung). Ein
 * YouTube-Code dort wäre eine Behauptung, die keiner dieser Wege einlöst.
 * Die Kachel trägt deshalb auch kein `data-ig-reel`, sondern `data-yt-video`.
 *
 * WARUM KEINE EIGENE mp4 WIE BEI DEN INSTAGRAM-KACHELN: YouTube gibt die Datei
 * an Server-Adressen nicht heraus („Sign in to confirm you're not a bot",
 * gemessen am 2026-10-28 mit sieben Player-Varianten). Die Kachel spielt das
 * Video deshalb über die Haus-Fassade für YouTube (YoutubeTimestamp:
 * youtube-nocookie, erst nach dem Klick geladen). Liegt die Datei später auf
 * unserem CDN, wandert der Eintrag als Reel-Kachel in die Instagram-Reihe.
 *
 * FELDER
 *  youtubeId   Kennung bei YouTube (Shorts und Watch-Seite teilen sie).
 *  produkt     Wie `produkt` in ig-testimonials.js (Filter der Komponente).
 *  vorn        Stelle am Anfang der Reihe (1 = erste Kachel), Weisung.
 *  inDerReihe  true = steht auf der Fläche (FAIL-CLOSED wie dort).
 *  unterzeile  Bildunterschrift unter der Kachel, Kundentext.
 *  titel       Name des Videos für Vorlesehilfen (aria-label, iframe-title).
 *  posterAlt   Beschreibung des Standbilds.
 *
 * Das Video liegt auf unserem eigenen Kanal und zeigt keine namentlich
 * genannte Person. Unter der Kachel steht deshalb kein @handle (dieselbe
 * Grenze wie bei eigenen Instagram-Posts), sondern was man sieht und wo das
 * Original liegt.
 */
export const YT_NUTZER_VIDEOS = [
  {
    youtubeId: 'vgd7qKQ990o',
    produkt: 'QiOne 2 Pro',
    vorn: 1,
    inDerReihe: true,
    unterzeile: 'QiOne® 2 Pro im Alltag',
    titel: 'QiOne® 2 Pro im Alltag, Video von Qi Blanco',
    posterAlt: 'Standbild des Videos: eine Frau sitzt in einem Auto',
  },
];
