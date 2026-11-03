/*
 * YOUTUBE VOR DER WAHL — die eine Stelle für Kennung, Vorschaubild und
 * CMS-Einbettung (Auftrag einwilligung-scanner-20261023T144303Z-s02,
 * 2026-11-03; Herkunft Christians Auftrag zur Cookiebot-Ablösung).
 *
 * ZIEL: Vor der Wahl im Einwilligungshinweis geht von keiner Seite eine
 * Anfrage an YouTube oder Google, und YouTube setzt kein Cookie. Gleichzeitig
 * bleibt jedes Video vor der Wahl benutzbar (Christian Z4): ein Tipp auf das
 * Vorschaubild spielt es ab. Das ist die bestehende Fassade
 * (`YoutubeTimestamp`), sie wird NICHT hinter die Einwilligung gesperrt.
 *
 * GEMESSEN VOR DEM BAU (Wache einwilligung-scanner, Motor eigen, 18 Seiten):
 *   1. CourseLesson rendert ein `<iframe src=youtube.com/embed/…>` im
 *      Server-HTML, und der Shopify-Seitentext trägt DASSELBE Video ein
 *      zweites Mal als rohes iframe (`<p><iframe width=1120 …>`, teils als
 *      `<div class=video-container><iframe data-src=… class=lazyload>`).
 *   2. Die Fassade lud ihr Vorschaubild von i.ytimg.com — eine Anfrage an
 *      Google vor jeder Wahl, auch ohne Klick.
 *
 * DIESES MODUL BAUT DAFÜR NUR REINE FUNKTIONEN (Server und Browser gleich,
 * keine React-Abhängigkeit), damit `test/youtube-einbettung.test.mjs` sie
 * ohne Renderer prüfen kann.
 */

/** Eine YouTube-Kennung: genau 11 Zeichen aus [A-Za-z0-9_-]. */
export const YT_ID_MUSTER = /^[A-Za-z0-9_-]{11}$/;

/*
 * Die Vorschaubilder, die YouTube je Video ausliefert und die unser Bestand
 * benutzt. Nur diese Namen beantwortet die Route `/yt-vorschau/<id>`; alles
 * andere ist 404. So bleibt die Route ein Bild-Spiegel für genau einen
 * Zweck und wird kein offener Proxy.
 */
export const VORSCHAU_DATEIEN = ['maxresdefault', 'sddefault', 'hqdefault', 'mqdefault'];

/** Pfad der Ressourcen-Route (gleiche Herkunft). */
export const VORSCHAU_PFAD = '/yt-vorschau';

export function istYoutubeId(id) {
  return typeof id === 'string' && YT_ID_MUSTER.test(id);
}

/**
 * Vorschaubild eines Videos von GLEICHER Herkunft.
 * Ungültige Kennung oder unbekannter Dateiname ergeben '' (kein Bild statt
 * einer Anfrage an eine fremde Adresse).
 */
export function vorschauUrl(id, datei = 'hqdefault') {
  if (!istYoutubeId(id) || !VORSCHAU_DATEIEN.includes(datei)) return '';
  return `${VORSCHAU_PFAD}/${id}?datei=${datei}`;
}

const YTIMG_MUSTER =
  /^(?:https?:)?\/\/i\d?\.ytimg\.com\/vi(?:_webp)?\/([A-Za-z0-9_-]{11})\/([a-z0-9]+)\.(?:jpg|webp)(?:[?#].*)?$/i;

/**
 * Schreibt eine i.ytimg.com-Poster-Adresse auf die eigene Route um.
 * Alles andere (eigenes Standbild auf cdn.shopify.com, data:-Vorstufe)
 * bleibt unverändert. Eine ytimg-Adresse mit unbekanntem Dateinamen fällt
 * auf hqdefault desselben Videos: lieber ein Bild gleicher Herkunft als
 * eine Anfrage an Google.
 */
export function posterGleicherHerkunft(url) {
  const text = String(url || '');
  const treffer = text.match(YTIMG_MUSTER);
  if (!treffer) return text;
  const [, id, datei] = treffer;
  return vorschauUrl(id, VORSCHAU_DATEIEN.includes(datei) ? datei : 'hqdefault');
}

/**
 * Kennung, Startsekunde und übrige Parameter aus einer Einbettungs-Adresse
 * (youtube.com oder youtube-nocookie.com, `/embed/<id>`).
 * `si=` (Teilen-Zeiger einer fremden Sitzung), `autoplay`, `enablejsapi`
 * fallen raus: die Fassade setzt sie selbst.
 */
export function zerlegeEinbettung(src) {
  const text = String(src || '').replace(/&amp;/g, '&');
  const kennung = text.match(
    /^(?:https?:)?\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([A-Za-z0-9_-]{11})(?=[?#/]|$)/i,
  );
  if (!kennung) return null;
  const zeit = text.match(/[?&](?:start|t)=(\d+)/);
  const frage = text.indexOf('?');
  const zusatz =
    frage < 0
      ? []
      : text
          .slice(frage + 1)
          .split('#')[0]
          .split('&')
          .filter((teil) => {
            const name = teil.split('=')[0];
            return (
              teil &&
              /^[A-Za-z0-9_]+=[A-Za-z0-9_.-]*$/.test(teil) &&
              !['start', 't', 'si', 'autoplay', 'enablejsapi', 'origin', 'widgetid'].includes(name)
            );
          });
  return {
    videoId: kennung[1],
    start: zeit ? parseInt(zeit[1], 10) : 0,
    zusatz: zusatz.join('&'),
  };
}

/*
 * CMS-EINBETTUNGEN IM SEITENTEXT.
 *
 * Ein rohes YouTube-iframe im Shopify-Seitentext wird beim RENDERN ersetzt,
 * nicht im Admin. So fängt die Umwandlung auch Einbettungen, die künftig
 * jemand in den Text einfügt.
 *
 * Erkannt wird jedes `<iframe …>…</iframe>`, dessen `src` ODER `data-src`
 * (Lazyload-Form aus dem alten Theme) auf youtube.com/embed oder
 * youtube-nocookie.com/embed zeigt.
 *
 * Ersetzt wird es durch einen PLATZHALTER mit der Kennung. Im Server-HTML
 * trägt der Platzhalter schon das Vorschaubild gleicher Herkunft und einen
 * echten Link auf das Video (funktioniert ohne Skript). Nach dem Hydrieren
 * setzt `CmsHtmlMitVideos` die Fassade `YoutubeTimestamp` hinein: dieselbe
 * Fassade wie überall, keine zweite Bauweise.
 *
 * Ist es DASSELBE Video wie das verwaltete Lektionsvideo, fällt das iframe
 * ersatzlos weg (Duplikat), samt einer Hülle, die nur dieses iframe trug.
 */
const IFRAME_MUSTER = /<iframe\b([^>]*)>[\s\S]*?<\/iframe>/gi;

function attribut(attrs, name) {
  const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : '';
}

function htmlAttr(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Marker-Attribut, an dem `CmsHtmlMitVideos` seine Platzhalter findet. */
export const PLATZHALTER_ATTR = 'data-qb-yt-platzhalter';

function platzhalterHtml({videoId, start, zusatz}, titel) {
  const watch =
    `https://www.youtube.com/watch?v=${videoId}` + (start > 0 ? `&amp;t=${start}s` : '');
  const name = titel || 'Video';
  return (
    `<span class="qb-yt-cms" ${PLATZHALTER_ATTR}="${videoId}" data-start="${start}"` +
    ` data-zusatz="${htmlAttr(zusatz)}" data-titel="${htmlAttr(name)}">` +
    `<a class="qb-yt-cms__vorab" href="${watch}" target="_blank" rel="noopener noreferrer"` +
    ` aria-label="Video auf YouTube ansehen (neuer Tab): ${htmlAttr(name)}">` +
    `<img src="${vorschauUrl(videoId, 'hqdefault')}" alt="" role="presentation"` +
    ` width="480" height="360" loading="lazy" decoding="async"/>` +
    `<span class="qb-yt-cms__play" aria-hidden="true">▶</span></a></span>`
  );
}

/*
 * Hüllen, die NUR das iframe trugen und mit ihm wegfallen, wenn es ein
 * Duplikat war: ein Absatz (`<p …>`) und die verschachtelten `<div>`-Hüllen
 * des alten Themes (video-container/box-video/…). Geprüft wird
 * „zwischen öffnendem und schließendem Tag steht nur Leerraum“ — eine Hülle
 * mit eigenem Text bleibt stehen.
 */
const DUPLIKAT_MARKE = '<!--qb-yt-duplikat-->';

/**
 * @param {string} html  Seitentext aus dem Shopify-Admin
 * @param {{ohneVideoId?: string}} [optionen]  Kennung des verwalteten
 *   Lektionsvideos: dieses Video fällt als Duplikat weg.
 * @returns {{html: string, videos: Array<{videoId:string,start:number,zusatz:string,titel:string}>, entfernt: number}}
 */
export function cmsYoutubeUmwandeln(html, optionen = {}) {
  const {ohneVideoId = ''} = optionen;
  const videos = [];
  let entfernt = 0;
  let aus = String(html || '').replace(IFRAME_MUSTER, (ganz, attrs) => {
    const quelle = attribut(attrs, 'src') || '';
    const lazy = attribut(attrs, 'data-src') || '';
    const teile = zerlegeEinbettung(quelle) || zerlegeEinbettung(lazy);
    if (!teile) return ganz;
    if (ohneVideoId && teile.videoId === ohneVideoId) {
      entfernt += 1;
      return DUPLIKAT_MARKE;
    }
    const titelRoh = attribut(attrs, 'title');
    const titel = titelRoh && !/^youtube video player$/i.test(titelRoh) ? titelRoh : '';
    videos.push({...teile, titel});
    return platzhalterHtml(teile, titel);
  });
  if (entfernt) {
    /* Hüllen um die Duplikat-Marke abtragen, von innen nach außen. */
    let vorher;
    do {
      vorher = aus;
      aus = aus.replace(
        new RegExp(`<(p|div)\\b[^>]*>(?:\\s|&nbsp;)*${DUPLIKAT_MARKE}(?:\\s|&nbsp;)*<\\/\\1>`, 'gi'),
        DUPLIKAT_MARKE,
      );
    } while (aus !== vorher);
    aus = aus.split(DUPLIKAT_MARKE).join('');
  }
  return {html: aus, videos, entfernt};
}

/** Nur für Tests und Proben: zählt rohe YouTube-iframes in einem HTML-Text. */
export function zaehleYoutubeIframes(html) {
  let n = 0;
  String(html || '').replace(IFRAME_MUSTER, (ganz, attrs) => {
    if (zerlegeEinbettung(attribut(attrs, 'src')) || zerlegeEinbettung(attribut(attrs, 'data-src'))) n += 1;
    return ganz;
  });
  return n;
}
