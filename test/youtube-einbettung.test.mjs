/**
 * YouTube vor der Wahl: Kennung, Vorschaubild gleicher Herkunft und die
 * Umwandlung roher CMS-iframes (Auftrag einwilligung-scanner-20261023T144303Z-s02).
 *
 * Die Eingaben unten sind die LIVE gemessenen Formen aus dem Shopify-Seitentext
 * (2026-11-03, /pages/das-beispiel und /pages/mentales-setting), nicht erfunden.
 */
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  vorschauUrl,
  posterGleicherHerkunft,
  zerlegeEinbettung,
  cmsYoutubeUmwandeln,
  zaehleYoutubeIframes,
  PLATZHALTER_ATTR,
} from '../app/lib/youtube-einbettung.js';

const DAS_BEISPIEL =
  '<p> </p> <h2 style="text-align: center;">Das Beispiel</h2> <p style="text-align: center;">' +
  '<iframe width="1120" height="630" src="https://www.youtube.com/embed/p0FoQgQ3t6E?si=35zk0vS1FgwFT7FL" ' +
  'title="YouTube video player" frameborder="0" allow="accelerometer; autoplay" allowfullscreen=""></iframe></p> ' +
  '<p>Sehe anhand meines Beispiels</p>';

const MENTALES_SETTING =
  '<div class="text-block-section youtube-standard-iframe"> <div class="video-block-section"> ' +
  '<div class="video-wrapper"> <div class="box-video"> <div class="video-container">' +
  '<iframe width="560" height="315" class="br-image lazyload" data-src="https://www.youtube.com/embed/MwLL1db-og4?si=fFSiUg7PduCl9WKn" ' +
  'title="YouTube video player" frameborder="0" allowfullscreen=""></iframe></div> </div> </div> </div> </div>' +
  '<p>Zwischentext</p>' +
  '<div class="video-container"><iframe width="560" height="315" class="br-image lazyload" ' +
  'data-src="https://www.youtube.com/embed/La9oLLoI5Rc?si=_Z2YopFXRlqzYGzQ" title="YouTube video player"></iframe></div>';

describe('vorschauUrl', () => {
  it('gleiche Herkunft für gültige Kennung', () => {
    assert.equal(vorschauUrl('p0FoQgQ3t6E', 'maxresdefault'), '/yt-vorschau/p0FoQgQ3t6E?datei=maxresdefault');
    assert.equal(vorschauUrl('p0FoQgQ3t6E'), '/yt-vorschau/p0FoQgQ3t6E?datei=hqdefault');
  });
  it('kein offener Weg: falsche Kennung oder Datei ergibt leer', () => {
    assert.equal(vorschauUrl('../../etc', 'hqdefault'), '');
    assert.equal(vorschauUrl('p0FoQgQ3t6E', 'x/../y'), '');
    assert.equal(vorschauUrl('kurz', 'hqdefault'), '');
  });
});

describe('posterGleicherHerkunft', () => {
  it('schreibt i.ytimg.com um', () => {
    assert.equal(
      posterGleicherHerkunft('https://i.ytimg.com/vi/PQfmajgjR7E/maxresdefault.jpg'),
      '/yt-vorschau/PQfmajgjR7E?datei=maxresdefault',
    );
  });
  it('unbekannter ytimg-Dateiname fällt auf hqdefault, nie auf Google', () => {
    assert.equal(
      posterGleicherHerkunft('https://i.ytimg.com/vi/PQfmajgjR7E/hq720.jpg'),
      '/yt-vorschau/PQfmajgjR7E?datei=hqdefault',
    );
  });
  it('eigenes Standbild bleibt unverändert', () => {
    const cdn = 'https://cdn.shopify.com/s/files/1/x/poster.jpg';
    assert.equal(posterGleicherHerkunft(cdn), cdn);
  });
});

describe('zerlegeEinbettung', () => {
  it('youtube.com und -nocookie, si fällt weg, Zusatz bleibt', () => {
    assert.deepEqual(zerlegeEinbettung('https://www.youtube.com/embed/p0FoQgQ3t6E?si=35zk0vS1FgwFT7FL'), {
      videoId: 'p0FoQgQ3t6E',
      start: 0,
      zusatz: '',
    });
    assert.deepEqual(
      zerlegeEinbettung(
        'https://www.youtube-nocookie.com/embed/lgPFnXoDdYA?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3',
      ),
      {videoId: 'lgPFnXoDdYA', start: 0, zusatz: 'rel=0&modestbranding=1&playsinline=1&iv_load_policy=3'},
    );
    assert.equal(zerlegeEinbettung('https://www.youtube.com/embed/mH0vaUEeFqg?start=3463').start, 3463);
  });
  it('fremde Adressen sind keine Einbettung', () => {
    assert.equal(zerlegeEinbettung('https://player.vimeo.com/video/123'), null);
    assert.equal(zerlegeEinbettung('https://evil.example/www.youtube.com/embed/p0FoQgQ3t6E'), null);
    assert.equal(zerlegeEinbettung(''), null);
  });
});

describe('cmsYoutubeUmwandeln', () => {
  it('Duplikat des Lektionsvideos fällt samt leerer Hülle weg', () => {
    const {html, videos, entfernt} = cmsYoutubeUmwandeln(DAS_BEISPIEL, {ohneVideoId: 'p0FoQgQ3t6E'});
    assert.equal(entfernt, 1);
    assert.equal(videos.length, 0);
    assert.equal(zaehleYoutubeIframes(html), 0);
    assert.ok(!/youtube\.com\/embed/.test(html));
    assert.ok(!/<p style="text-align: center;">\s*<\/p>/.test(html), 'leerer Absatz bleibt nicht stehen');
    assert.ok(html.includes('Sehe anhand meines Beispiels'));
  });
  it('anderes Video wird Platzhalter mit Bild gleicher Herkunft (auch data-src)', () => {
    const {html, videos, entfernt} = cmsYoutubeUmwandeln(MENTALES_SETTING, {ohneVideoId: 'MwLL1db-og4'});
    assert.equal(entfernt, 1);
    assert.deepEqual(videos.map((v) => v.videoId), ['La9oLLoI5Rc']);
    assert.equal(zaehleYoutubeIframes(html), 0);
    assert.ok(html.includes(`${PLATZHALTER_ATTR}="La9oLLoI5Rc"`));
    assert.ok(html.includes('src="/yt-vorschau/La9oLLoI5Rc?datei=hqdefault"'));
    assert.ok(!/i\.ytimg\.com/.test(html));
    assert.ok(html.includes('Zwischentext'));
  });
  it('ohne verwaltetes Video bleibt jedes Video als Fassade', () => {
    const {videos, entfernt} = cmsYoutubeUmwandeln(DAS_BEISPIEL);
    assert.equal(entfernt, 0);
    assert.equal(videos.length, 1);
  });
  it('Text ohne YouTube-iframe bleibt byte-gleich (auch Vimeo-iframe)', () => {
    const roh = '<p>Text</p><iframe src="https://player.vimeo.com/video/1"></iframe>';
    assert.equal(cmsYoutubeUmwandeln(roh).html, roh);
    assert.equal(cmsYoutubeUmwandeln('').html, '');
  });
  it('Titel wird als Attribut entschärft', () => {
    const roh = '<iframe src="https://www.youtube.com/embed/p0FoQgQ3t6E" title="a&quot; onload=&quot;x"></iframe>';
    const {html} = cmsYoutubeUmwandeln(roh);
    assert.ok(!/onload="/.test(html));
  });
});

/* Fälle des adversarialen Zweitprüfers (K3, P2), 2026-11-03. */
describe('Randfälle aus der Gegenprüfung', () => {
  it('src= in einem anderen Attributwert oder x-src täuscht nicht', () => {
    const roh =
      '<iframe title="Quelle: src=Quellen" x-src="nix" class="video-src=x" ' +
      'src="https://www.youtube.com/embed/p0FoQgQ3t6E"></iframe>';
    assert.equal(zaehleYoutubeIframes(cmsYoutubeUmwandeln(roh).html), 0);
  });
  it('> im Attributwert vor src bricht die Erkennung nicht', () => {
    const roh = '<iframe title="a > b" src="https://www.youtube.com/embed/p0FoQgQ3t6E"></iframe>';
    const {html, videos} = cmsYoutubeUmwandeln(roh);
    assert.equal(videos.length, 1);
    assert.ok(!/youtube\.com\/embed/.test(html));
  });
  it('m.youtube.com und führendes Leerzeichen werden erkannt', () => {
    assert.equal(zerlegeEinbettung(' https://m.youtube.com/embed/p0FoQgQ3t6E').videoId, 'p0FoQgQ3t6E');
  });
  it('videoseries und live_stream sind keine Kennung', () => {
    assert.equal(zerlegeEinbettung('https://www.youtube.com/embed/videoseries?list=PLx'), null);
    assert.equal(vorschauUrl('live_stream'), '');
  });
  it('Kapitelsprung desselben Videos bleibt als Fassade', () => {
    const roh = '<p><iframe src="https://www.youtube.com/embed/p0FoQgQ3t6E?start=600"></iframe></p>';
    const {videos, entfernt} = cmsYoutubeUmwandeln(roh, {ohneVideoId: 'p0FoQgQ3t6E', ohneStart: 0});
    assert.equal(entfernt, 0);
    assert.equal(videos[0].start, 600);
  });
  it('Titel wird nicht doppelt kodiert', () => {
    const roh = '<iframe src="https://www.youtube.com/embed/p0FoQgQ3t6E" title="Tom &amp; Jerry"></iframe>';
    const {html, videos} = cmsYoutubeUmwandeln(roh);
    assert.equal(videos[0].titel, 'Tom & Jerry');
    assert.ok(html.includes('data-titel="Tom &amp; Jerry"'));
  });
});
