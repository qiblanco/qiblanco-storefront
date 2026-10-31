import {ScrollScrubVideo} from './ScrollScrubVideo';

const GITTERCHIP_VIDEO_DESKTOP =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-desktop-16x9.mp4?v=1784313940';
const GITTERCHIP_VIDEO_MOBILE =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-mobile-9x16.mp4?v=1784313946';
// Start- und Endbild der beiden Videos (WebP, aus dem ersten und letzten Bild
// gezogen, 31.10.2026): Poster bis zum ersten dekodierten Bild, Endbild als
// Rückfall auf Geräten, die das Video nicht abspielen (iOS ohne Geste,
// Stromsparmodus), und bei reduzierter Bewegung.
const GITTERCHIP_BILD = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-';
const GITTERCHIP_POSTER_DESKTOP = `${GITTERCHIP_BILD}desktop-16x9-start.webp?v=1793445786`;
const GITTERCHIP_POSTER_MOBILE = `${GITTERCHIP_BILD}mobile-9x16-start.webp?v=1793445778`;
const GITTERCHIP_ENDBILD_DESKTOP = `${GITTERCHIP_BILD}desktop-16x9-ende.webp?v=1793445799`;
const GITTERCHIP_ENDBILD_MOBILE = `${GITTERCHIP_BILD}mobile-9x16-ende.webp?v=1793445782`;

/*
 * GitterchipMoleculesScrub -- die EINE Definition der GitterChip-Molecules-
 * Scroll-Scrub-Animation (CDN-Quellen 16:9/9:16 + Overlay-Texte), wieder-
 * verwendet auf /pages/qione-2-pro, /pages/exclusive-solutions,
 * /products/qione-2-pro und der Startseite. Overlay-Texte NUR als
 * ASCII-Escapes (Mojibake-Falle 2026-07-17, Fix #60: Literal-Sonderzeichen
 * wurden beim Schreiben doppelt-encodiert) -- die Zentralisierung hier macht
 * Text-Drift zwischen den Seiten baulich unmoeglich.
 * `dataSection` je Seite = Watch-/Heatmap-Anker (sektion_registry pflegt
 * hb-heatmap-sync automatisch).
 * `heightVhDesktop`/`heightVhMobile` sind OPTIONAL und reichen nur durch:
 * ohne Angabe gilt weiter die Vorgabe des Bausteins (500/400vh), der
 * Bestand ändert sich also nicht. Gesetzt werden sie nur dort, wo eine
 * Seite eine ZWEITE Scroll-Strecke trägt (heute: /pages/schlaf-zellen-
 * schutz, 300/250vh) -- der Scroll-Weg ist eine Eigenschaft der SEITE,
 * nicht des Videos. Die Overlay-Texte bleiben zentral und unveränderbar.
 * `laden` reicht ebenso nur durch (ScrollScrubVideo, Schalter je Seite):
 * ohne Angabe gilt das Nähe-Laden, "bisher" stellt den Rand bis 14.10.2026
 * für genau diese Seite zurück.
 */
export function GitterchipMoleculesScrub({
  dataSection,
  heightVhDesktop,
  heightVhMobile,
  laden,
}) {
  return (
    <ScrollScrubVideo
      dataSection={dataSection}
      {...(laden ? {laden} : {})}
      {...(heightVhDesktop ? {heightVhDesktop} : {})}
      {...(heightVhMobile ? {heightVhMobile} : {})}
      srcDesktop={GITTERCHIP_VIDEO_DESKTOP}
      srcMobile={GITTERCHIP_VIDEO_MOBILE}
      posterDesktop={GITTERCHIP_POSTER_DESKTOP}
      posterMobile={GITTERCHIP_POSTER_MOBILE}
      endbildDesktop={GITTERCHIP_ENDBILD_DESKTOP}
      endbildMobile={GITTERCHIP_ENDBILD_MOBILE}
      overlayStart={{
        titel: 'Der Gitterchip® in Aktion',
        text: 'Scrolle: der Blick ins Innere des QiOne\u00ae 2 Pro.',
      }}
      overlayEnd={[
        {
          titel: 'Koh\u00e4rente Ordnung',
          text: 'Der Gitterchip® hilft Wassermolek\u00fclen, in den koh\u00e4renten, geordneten Zustand \u00fcberzugehen.',
        },
      ]}
    />
  );
}
