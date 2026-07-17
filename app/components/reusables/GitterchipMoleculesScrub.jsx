import {ScrollScrubVideo} from './ScrollScrubVideo';

const GITTERCHIP_VIDEO_DESKTOP =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-desktop-16x9.mp4?v=1784313940';
const GITTERCHIP_VIDEO_MOBILE =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/gitterchip-molecules-mobile-9x16.mp4?v=1784313946';

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
 */
export function GitterchipMoleculesScrub({dataSection}) {
  return (
    <ScrollScrubVideo
      dataSection={dataSection}
      srcDesktop={GITTERCHIP_VIDEO_DESKTOP}
      srcMobile={GITTERCHIP_VIDEO_MOBILE}
      overlayStart={{
        titel: 'Der GitterChip\u2122 in Aktion',
        text: 'Scrolle: der Blick ins Innere des QiOne\u00ae 2 Pro.',
      }}
      overlayEnd={[
        {
          titel: 'Koh\u00e4rente Ordnung',
          text: 'Der GitterChip\u2122 hilft Wassermolek\u00fclen, in den koh\u00e4renten, geordneten Zustand \u00fcberzugehen.',
        },
      ]}
    />
  );
}
