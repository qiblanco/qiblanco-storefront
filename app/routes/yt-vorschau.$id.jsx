import {istYoutubeId, VORSCHAU_DATEIEN} from '~/lib/youtube-einbettung';

/*
 * /yt-vorschau/<id>?datei=<maxresdefault|sddefault|hqdefault|mqdefault>
 *
 * Das Vorschaubild eines YouTube-Videos von GLEICHER Herkunft
 * (Auftrag einwilligung-scanner-20261023T144303Z-s02, 2026-11-03).
 *
 * WARUM: Die Video-Fassade lud ihr Poster von i.ytimg.com. Das ist eine
 * Anfrage an Google vor jeder Wahl im Einwilligungshinweis, auf 18 Seiten
 * gemessen. Diese Route holt das Bild am Server und liefert es aus. Der
 * Browser des Besuchers spricht nur mit qiblanco.com. Beim Abruf am Server
 * reisen weder Cookies noch die Adresse des Besuchers mit.
 *
 * KEIN OFFENER PROXY: nur eine Kennung nach ^[A-Za-z0-9_-]{11}$ und nur
 * die vier Dateinamen aus VORSCHAU_DATEIEN, das Ziel ist fest i.ytimg.com.
 * Alles andere ergibt 404.
 *
 * KOSTEN (Variantenvergleich im RESULT des Auftrags): je Bild und Edge
 * höchstens ein Abruf je TTL über den Hauscache `caches.open('hydrogen')`,
 * dasselbe Muster wie googleRating.server.js. Der Browser hält das Bild
 * eine Woche (`Cache-Control: public`).
 *
 * FEHLT DAS BILD BEI YOUTUBE (maxresdefault gibt es nicht zu jedem Video),
 * antwortet die Route 404 OHNE Rumpf. Das ist Absicht: die Fassade steigt
 * auf das `error`-Ereignis des Bildes eine Stufe ab (maxres → sd → hq).
 */

const TTL_S = 60 * 60 * 24 * 7;
const FEHLT_TTL_S = 60 * 60;
const MAX_BYTES = 2 * 1024 * 1024;

function fehlt(status = 404) {
  return new Response(null, {
    status,
    headers: {'Cache-Control': `public, max-age=${FEHLT_TTL_S}`},
  });
}

function bild(rumpf, typ, herkunft) {
  return new Response(rumpf, {
    status: 200,
    headers: {
      'Content-Type': typ,
      'Cache-Control': `public, max-age=${TTL_S}, stale-while-revalidate=86400`,
      'X-Content-Type-Options': 'nosniff',
      'X-QB-Vorschau': herkunft,
    },
  });
}

/** @param {import('react-router').LoaderFunctionArgs} args */
export async function loader({params, request, context}) {
  const id = params.id || '';
  const datei = new URL(request.url).searchParams.get('datei') || 'hqdefault';
  if (!istYoutubeId(id) || !VORSCHAU_DATEIEN.includes(datei)) return fehlt();

  /* Fester Schlüssel ohne Fremd-Parameter: ein angehängter Cache-Brecher
   * erzeugt keinen zweiten Abruf bei YouTube. */
  const schluessel = new Request(`https://yt-vorschau.intern/${id}/${datei}`);
  let cache = null;
  try {
    if (typeof caches !== 'undefined') {
      cache = await caches.open('hydrogen');
      const treffer = await cache.match(schluessel);
      if (treffer) {
        return bild(treffer.body, treffer.headers.get('Content-Type') || 'image/jpeg', 'cache');
      }
    }
  } catch {
    /* Cache nicht verfügbar: dann direkt abrufen */
  }

  let antwort;
  try {
    antwort = await fetch(`https://i.ytimg.com/vi/${id}/${datei}.jpg`, {
      headers: {Accept: 'image/jpeg,image/*'},
    });
  } catch {
    return fehlt(502);
  }
  if (!antwort.ok) return fehlt();
  const typ = antwort.headers.get('Content-Type') || 'image/jpeg';
  if (!/^image\/(jpeg|webp)\b/.test(typ)) return fehlt(502);
  const rumpf = await antwort.arrayBuffer();
  if (!rumpf.byteLength || rumpf.byteLength > MAX_BYTES) return fehlt(502);

  if (cache) {
    try {
      const ablage = cache.put(
        schluessel,
        new Response(rumpf.slice(0), {
          headers: {'Content-Type': typ, 'Cache-Control': `max-age=${TTL_S}`},
        }),
      );
      if (context?.waitUntil) context.waitUntil(ablage);
      else await ablage;
    } catch {
      /* Ablage gescheitert: nächster Abruf holt erneut */
    }
  }
  return bild(rumpf, typ, 'quelle');
}
