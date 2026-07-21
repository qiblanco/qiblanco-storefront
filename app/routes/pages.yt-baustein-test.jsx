import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';

/**
 * TEST-EINSATZORT — Job YT-THUMB-MAXRES 2026-07-21, Abschnitt 5.2 (V7/V8).
 * NUR fuer die Preview-Verifikation auf dem Feature-Branch; wird vor dem
 * Merge nach main wieder entfernt. NICHT fuer Produktion.
 *
 * Prueft Christians Erweiterung am selben Video BQxzbXqREWE:
 *  - ABWEICHENDER start (120 statt 817 wie auf /pages/tiefer-schlaf)
 *  - ABWEICHENDES thumbnail (eigene Poster-URL statt YouTube-Kette)
 *  - Default-Einsatzort: nur videoId muss funktionieren (Spec 3.1b)
 */
export const meta = () => [
  {title: 'YT-Baustein-Test (Preview)'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function YtBausteinTest() {
  return (
    <main style={{maxWidth: '880px', margin: '0 auto', padding: '24px'}}>
      <h1>YT-Baustein-Test (Preview, V7/V8)</h1>
      <h2>A: abweichender start (120) + abweichendes thumbnail</h2>
      <YoutubeTimestamp
        videoId="BQxzbXqREWE"
        startSeconds={120}
        thumbnail="/images/redesign/j-sale-hero-all-products.jpg"
        titel="Test-Einsatzort A: eigener Startpunkt + eigenes Poster"
        dataSection="yt-baustein-test-a"
      />
      <h2>B: nur videoId (Defaults)</h2>
      <YoutubeTimestamp
        videoId="BQxzbXqREWE"
        titel="Test-Einsatzort B: Defaults"
        dataSection="yt-baustein-test-b"
      />
    </main>
  );
}
