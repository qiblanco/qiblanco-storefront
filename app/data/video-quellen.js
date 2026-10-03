/*
 * video-quellen.js — woher <ImgixVideo> und der Vorschaustreifen ein Video holen.
 *
 * ANLASS (Regelkreis video-spielbarkeit, Arm BREIT, Job 20261003-regelkreis-
 * video-spielbarkeit-arm-breit): das imgix-Konto qiblanco-video ist seit dem
 * 29.09.2026 gekappt. Jede Variante und jedes HLS-Segment, das imgix nicht
 * mehr im Zwischenspeicher hat, antwortet mit HTTP 402
 * `plan_credits_depleted_payment_required`. Gemessen am 03.10.2026: 11 von 93
 * Videoquellen der Seiten tot, alle auf qiblanco.com. Der Spieler bleibt dann
 * mitten im Video stehen. Mit jedem Cache-Verfall fällt eine weitere Quelle aus.
 *
 * WAS HIER STEHT: je imgix-Pfad dasselbe Video als Shopify-Video
 * (Shopify Files, GL-PRO-0015). Die Dateien sind aus den noch ausgelieferten
 * imgix-Segmenten zusammengesetzt (je Zeitabschnitt die höchste noch lieferbare
 * Stufe, auf 1080 Pixel an der kurzen Seite gerechnet). cdn.shopify.com steht
 * schon in img-src und media-src der CSP (entry.server.jsx).
 *
 * SCHALTER (Rückweg ohne Revert): VIDEO_QUELLE = 'imgix' stellt jede Einbindung
 * byte-gleich auf die imgix-URLs von vorher zurück. Ein Pfad ohne Eintrag
 * in SHOPIFY_VIDEOS bleibt immer auf imgix.
 *
 * BEWUSST OHNE IMPORT: so prüft `node --test test/video-quellen.test.mjs` die
 * Regeln hermetisch.
 */

export const VIDEO_QUELLE = 'shopify';

export const IMGIX_HOST = 'https://qiblanco-video.imgix.net/';

/*
 * Je imgix-Pfad: HLS-Manifest und mp4-Fassung des Shopify-Videos.
 * gid und Upload-Zeitpunkt im Kommentar, damit die Datei im Admin auffindbar ist.
 */
export const SHOPIFY_VIDEOS = {
  // gid://shopify/Video/77330515788044, hochgeladen 2026-10-03
  'VIDEO-QiOne60s-DE-2021.mov': {
    hls: 'https://cdn.shopify.com/videos/c/vp/241e78944ec64bb6bd20f82fdf50d51c/241e78944ec64bb6bd20f82fdf50d51c.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/241e78944ec64bb6bd20f82fdf50d51c/241e78944ec64bb6bd20f82fdf50d51c.HD-720p-3.0Mbps-96335412.mp4',
  },
  // gid://shopify/Video/77330517065996, hochgeladen 2026-10-03
  '230413_cellstudy_comparison_1x1_DE.mp4': {
    hls: 'https://cdn.shopify.com/videos/c/vp/2daca3f89b3d4f779db5c9b06bd2e8f5/2daca3f89b3d4f779db5c9b06bd2e8f5.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/2daca3f89b3d4f779db5c9b06bd2e8f5/2daca3f89b3d4f779db5c9b06bd2e8f5.HD-720p-3.0Mbps-96335446.mp4',
  },
  // gid://shopify/Video/77330519097612, hochgeladen 2026-10-03
  'Bracelet_Study_1x1_DE.mp4': {
    hls: 'https://cdn.shopify.com/videos/c/vp/f3fa39424a71456aa42e42300c2ab064/f3fa39424a71456aa42e42300c2ab064.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/f3fa39424a71456aa42e42300c2ab064/f3fa39424a71456aa42e42300c2ab064.HD-720p-2.1Mbps-96335464.mp4',
  },
  // gid://shopify/Video/77330520375564, hochgeladen 2026-10-03
  '240417_QIHome_Wohlfuehloase_16x9_EN.mov': {
    hls: 'https://cdn.shopify.com/videos/c/vp/4e3a19262aac4fd0b9e0c2804d85ae70/4e3a19262aac4fd0b9e0c2804d85ae70.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/4e3a19262aac4fd0b9e0c2804d85ae70/4e3a19262aac4fd0b9e0c2804d85ae70.HD-720p-2.1Mbps-96335492.mp4',
  },
  // gid://shopify/Video/77330520801548, hochgeladen 2026-10-03
  '360-QiHome-1x1.mov': {
    hls: 'https://cdn.shopify.com/videos/c/vp/d3db6ce59d7244e69319f505fa078f28/d3db6ce59d7244e69319f505fa078f28.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/d3db6ce59d7244e69319f505fa078f28/d3db6ce59d7244e69319f505fa078f28.HD-720p-1.6Mbps-96335510.mp4',
  },
  // gid://shopify/Video/77330521456908, hochgeladen 2026-10-03
  'new-360-QiBracelet-1x1.mov': {
    hls: 'https://cdn.shopify.com/videos/c/vp/98ba4a037af44162be1eaae86e92a912/98ba4a037af44162be1eaae86e92a912.m3u8',
    mp4: 'https://cdn.shopify.com/videos/c/vp/98ba4a037af44162be1eaae86e92a912/98ba4a037af44162be1eaae86e92a912.HD-720p-1.6Mbps-96335521.mp4',
  },
};

/*
 * `familie` bleibt 'imgix': sie ist der Name der Komponentenfamilie für den
 * Pixel (qpx.js MED_FAMILIEN kennt imgix, youtube, scrub, 360). Ein neuer Wert
 * fiele dort auf 'unbekannt' und risse die Medien-Zeitreihe. Woher das Video
 * wirklich kommt, sagt `quelle` (am <video> als data-video-quelle).
 */
/** {hls, mp4, familie, quelle} für einen imgix-Pfad. Nie null. */
export function videoQuellen(videoPath) {
  const s = VIDEO_QUELLE === 'shopify' ? SHOPIFY_VIDEOS[videoPath] : null;
  if (s) return {hls: s.hls, mp4: s.mp4, familie: 'imgix', quelle: 'shopify'};
  return {
    hls: `${IMGIX_HOST}${videoPath}?fm=hls`,
    mp4: `${IMGIX_HOST}${videoPath}?fm=mp4`,
    familie: 'imgix',
    quelle: 'imgix',
  };
}
