/*
 * produkt-videos.js — die Videos je Kaufseite, als EINE Datenquelle.
 *
 * Maßnahme „Produktseite, die verkauft“ (Grossjob growth-m-lp-produktseite-
 * verkauft, Christians Leitplanke vom 26.09.2026, Folien 11 und 15): „Amazon
 * Style Produkte Seite“, „Testimonials, Videos, so viel es geht“, „Zellvideos
 * zum jeweiligen Produkt online auf der Shopseite“, „Futuristische Animationen“.
 *
 * WAS HIER STEHT: je Produkt-Handle die Videos, die im Vorschaustreifen der
 * Produktgalerie hinter EINER Video-Kachel liegen (Amazon legt Videos in den
 * Streifen, dort schaut jeder Besucher hin; bei uns lag das Zellvideo des
 * QiOne auf 56 % Seitentiefe, das des QiBracelet auf keiner Seite).
 * Darstellung: components/reusables/ProduktVideos.jsx.
 *
 * WARUM EIN DATENMODUL: jeder Satz, den die Fläche zeigt, steht HIER und
 * nirgends sonst. Christian will die Texte seiner Kaufseiten selbst schreiben
 * (Folie 15); sein Wortlaut ersetzt die Felder `titel`/`text`/`quelle` 1:1,
 * ohne dass jemand die Komponente anfasst. Heute stehen dort nur
 * BESTANDSWORTLAUTE (Fundstelle je Feld im Kommentar) und Bedienwörter.
 *
 * SCHALTER (Rückweg ohne Code): `aktiv: false` nimmt ein Video heraus; ist
 * die Liste eines Produkts leer, rendert die Seite KEINE Kachel und der
 * Vorschaustreifen ist byte-gleich zum Stand vor diesem Bau.
 *
 * BEWUSST OHNE IMPORT (Hausmuster podcast-daten.server.js): so prüft
 * `node --test test/produkt-videos.test.mjs` die Regeln hermetisch.
 *
 * VERTRAG MIT DER RAND-PROBE (claude-jobs/growth-m-lp-produktseite-verkauft/
 * pruefungen/probe_produktvideos_am_rand.py): das erste aktive Video eines
 * Produkts ist sein ZELLVIDEO, die ids erscheinen am <video> als
 * data-video="galerie:<id>" — daran erkennt auch der Pixel (qpx medObjekt)
 * einen Start im Dialog.
 */

const IMGIX = 'https://qiblanco-video.imgix.net/';

/*
 * imgix liefert das Video (HLS, mp4). Das STANDBILD kommt NICHT von imgix,
 * obwohl imgix eines erzeugen kann (?fm=jpg): die Content-Security-Policy
 * des Shops (img-src) erlaubt qiblanco-video.imgix.net nicht — gemessen
 * 2026-09-26 in der Vorschau, die Kachel blieb schwarz. Das erste Bild
 * desselben Videos liegt deshalb auf dem Shopify-CDN (GL-PRO-0015), das
 * img-src erlaubt; `&width=` skaliert dort serverseitig.
 */
function imgixVideo(pfad, standbild) {
  return {
    hls: `${IMGIX}${pfad}?fm=hls`,
    mp4: `${IMGIX}${pfad}?fm=mp4`,
    poster: `${standbild}&width=720`,
    vorschau: `${standbild}&width=240`,
    familie: 'imgix',
  };
}

/*
 * Link auf die Seite „Wie funktioniert der GitterChip im QiOne?“ (homepage-
 * bauer D-2957 / PR #608). Bis 2026-10-01 aus, weil die Seite versteckt war
 * (Leitplanken-PDF 26.09., Frage 7). Entschieden am 30.09. (AI-CEO im Mandat,
 * Option a): Seite sichtbar, Link im Dialog der QiOne-Kaufseite. Freigegeben
 * in EINEM Zug mit dem Kopf von routes/pages.wie-funktioniert-der-gitterchip-
 * im-qione.jsx (canonical statt noindex), NUR_ROUTE_SEITEN in lib/seo.js und
 * dem Probentausch des Seiten-Jobs (Job growth-m-lp-produktseite-verkauft-s05).
 * Rückweg nur für den Link: false.
 */
export const WIE_FUNKTIONIERT_LINK = true;
export const WIE_FUNKTIONIERT_PFAD = '/pages/wie-funktioniert-der-gitterchip-im-qione';
export const WIE_FUNKTIONIERT_TEXT = 'Wie funktioniert der GitterChip im QiOne?';

export const PRODUKT_VIDEOS = {
  'qione-2-pro': {
    produkt: 'QiOne® 2 Pro',
    videos: [
      {
        id: 'zellen-qione-2-pro',
        aktiv: true,
        art: 'zellen',
        // Überschrift des Zellfilms auf DIESER Seite (ScrollMikroskopVideo).
        titel: 'Zellbiologisch geprüft',
        // Untertitel desselben Films auf DIESER Seite, wörtlich.
        text: 'Deutlich gesteigerte Zellregeneration, trotz starkem E-Smog Einfluss',
        // Studien-Kachel e0002 (app/data/studien/e0002.json, kachel.zeile1+2).
        quelle: 'Wissenschaftliche Publikation an Darmepithelzellen, veröffentlicht in Applied Cell Biology 2021',
        link: {text: 'Zur Studie', href: '/pages/studie-darmbarriere'},
        // Mikroskopaufnahmen der Studie, 2160x2160, 16,6 s, ohne Tonspur
        // (video-ton.js). Oben „Ohne Schutz“, unten „GitterChip™“.
        ...imgixVideo(
          '230413_cellstudy_comparison_1x1_DE.mp4',
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--zellvideo-poster-230413-cellstudy-comparison-1x1-de--a112f9ac7cd0.jpg?v=1790462921',
        ),
        format: 'quadrat',
        ton: false,
        schleife: true,
        dauer_s: 17,
      },
      {
        id: 'stimme-daniela-cebula',
        aktiv: true,
        art: 'stimme',
        // Titelkarte des Schnitts (Video-Cutter-Kette, Gate tg-1.2.0 PASS 8/8,
        // Postausgang 25.09.): „DANIELA CEBULA: KEIN TAG OHNE QiOne“.
        titel: 'Daniela Cebula: Kein Tag ohne QiOne',
        text: '',
        // Einblendung im Video: „Daniela Cebula Podcast“.
        quelle: 'Aus dem Daniela Cebula Podcast',
        link: null,
        // Shopify-CDN (gid://shopify/Video/77272395579660, 26.09.2026),
        // 1080x1920, 33 s, mit Ton.
        hls: 'https://cdn.shopify.com/videos/c/vp/4a0f883f49c745b7913f2d31b886b322/4a0f883f49c745b7913f2d31b886b322.m3u8',
        mp4: 'https://cdn.shopify.com/videos/c/vp/4a0f883f49c745b7913f2d31b886b322/4a0f883f49c745b7913f2d31b886b322.HD-720p-4.5Mbps-95656208.mp4',
        poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/preview_images/4a0f883f49c745b7913f2d31b886b322.thumbnail.0000000000.jpg?v=1790461368&width=720',
        vorschau: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/preview_images/4a0f883f49c745b7913f2d31b886b322.thumbnail.0000000000.jpg?v=1790461368&width=240',
        familie: '',
        format: 'hoch',
        ton: true,
        schleife: false,
        dauer_s: 33,
      },
      {
        id: 'gitterchip-in-aktion',
        aktiv: true,
        art: 'animation',
        // Überschrift der Animation auf DIESER Seite (GitterchipMoleculesScrub).
        titel: 'Der GitterChip™ in Aktion',
        text: '',
        quelle: '',
        link: null,
        // Bestand: dieselbe Datei läuft als Scroll-Film auf dieser Seite.
        hls: '',
        mp4: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-desktop-16x9.mp4?v=1784313940',
        poster: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--gitterchip-in-aktion-poster--4d2c31b8e924.jpg?v=1790462204&width=720',
        vorschau: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--gitterchip-in-aktion-poster--4d2c31b8e924.jpg?v=1790462204&width=240',
        familie: '',
        format: 'quer',
        ton: false,
        schleife: true,
        dauer_s: 8,
      },
    ],
  },
  qibracelet: {
    produkt: 'QiBracelet®',
    videos: [
      {
        id: 'zellen-qibracelet',
        aktiv: true,
        art: 'zellen',
        // Überschrift des Zellfilms im Bestand (ScrollMikroskopVideo).
        titel: 'Zellbiologisch geprüft',
        // Studientitel deutsch, e0003 eckdaten.titelDeutsch.
        text: 'Schutzwirkung des QiBracelet® gegen oxidativen Stress',
        // Studien-Kachel e0003 (kachel.zeile1+2).
        quelle: 'Wissenschaftliche Publikation zum Schutz vor oxidativem Stress, veröffentlicht in Applied Cell Biology am 12. Januar 2024',
        link: {text: 'Zur Studie', href: '/pages/studie-oxidativer-stress'},
        // Mikroskopaufnahmen der QiBracelet-Studie (Leberzellen), 2160x2160,
        // 17,4 s, ohne Tonspur. Lag bis zu diesem Bau auf keiner Seite.
        ...imgixVideo(
          'Bracelet_Study_1x1_DE.mp4',
          'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--zellvideo-poster-bracelet-study-1x1-de--f625cf3d49ae.jpg?v=1790462925',
        ),
        format: 'quadrat',
        ton: false,
        schleife: true,
        dauer_s: 17,
      },
    ],
  },
};

/** Bedienwörter der Fläche (keine Aussagen über das Produkt). */
export const BEDIENUNG = {
  kachel: (n) => (n === 1 ? 'Video' : `${n} Videos`),
  kachelLabel: (produkt, n) =>
    n === 1 ? `Video zum ${produkt} ansehen` : `${n} Videos zum ${produkt} ansehen`,
  dialogTitel: (produkt) => `Videos zum ${produkt}`,
  zumachen: 'Schließen',
  auswahl: 'Video auswählen',
};

/** Die aktiven Videos eines Handles, in Anzeigereihenfolge. Nie null. */
export function aktiveVideos(handle) {
  const eintrag = PRODUKT_VIDEOS[handle];
  if (!eintrag) return [];
  return eintrag.videos.filter((v) => v && v.aktiv);
}

/** Produktname für Kachel und Dialog; leer, wenn der Handle unbekannt ist. */
export function produktName(handle) {
  return PRODUKT_VIDEOS[handle]?.produkt || '';
}

/** Der Wert von data-video am <video>: EIN Namensraum für den Pixel. */
export function videoMarke(video) {
  return `galerie:${video.id}`;
}
