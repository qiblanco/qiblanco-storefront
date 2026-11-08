import {VideoGalerie} from '~/components/reusables/VideoGalerie';
import {VORSCHAU_KACHELN, VORSCHAU_KOPF} from '~/components/reusables/video-galerie-daten';
import videoGalerieStyles from '~/styles/video-galerie.css?url';

/*
 * /pages/video-galerie-vorschau — Vorschau der neuen Sektion „Video-Galerie /
 * Stimmen-Karussell“ (Elina, EL-20261108-a7401ffd), damit sie am Handy und am
 * Desktop angesehen werden kann. Eingebaut auf weiteren Seiten wird erst nach
 * Elinas GO je Seite.
 *
 * DUNKEL wie die anderen B-Seiten: nirgends verlinkt, nicht im Menü, nicht in der
 * Sitemap. noindex, nofollow als Doppelgate (Meta-robots + X-Robots-Tag), kein
 * canonical, kein Open Graph.
 *
 * Rückbau: diese Datei löschen; ohne Aufrufer stört der Baustein nicht.
 */
export function links() {
  return [{rel: 'stylesheet', href: videoGalerieStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Video-Galerie Vorschau | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function VideoGalerieVorschau() {
  return (
    <div className="vg-vorschau">
      <VideoGalerie kopf={VORSCHAU_KOPF} kacheln={VORSCHAU_KACHELN} />
    </div>
  );
}
