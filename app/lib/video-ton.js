/*
 * video-ton.js — zentrale, GEMESSENE Ton-Wahrheit je Video (SSoT).
 *
 * Warum ein Manifest und keine Feature-Detection im Browser?
 * ---------------------------------------------------------
 * Die naheliegende Loesung ("Audio-UI nur rendern, wenn eine Audiospur
 * existiert") loest den gemeldeten Fehler NICHT. Gemessen am 2026-08-15:
 * die 360-Grad-Produktvideos `360-QiHome-1x1.mov` und
 * `new-360-QiBracelet-1x1.mov` BESITZEN eine AAC-Spur mit 2 Kanaelen —
 * die aber digitale Stille traegt (mean/max_volume je -91.0 dB).
 * Jede Existenz-Pruefung im Browser (`video.audioTracks`,
 * `webkitAudioDecodedByteCount`, `mozHasAudio`) meldet dafuer TRUE. Der
 * Ton-Button waere also genau auf den Videos stehen geblieben, auf denen
 * er weg soll.
 *
 * HOERBARKEIT ist im Browser nur ueber eine Web-Audio-Analyse des
 * dekodierten Signals feststellbar (asynchron, teuer, und der Button
 * flackert erst auf und wieder weg). Darum wird die Ton-Wahrheit zur
 * BAUZEIT gemessen (ffprobe + ffmpeg volumedetect gegen die real
 * ausgelieferte imgix-URL) und hier hinterlegt.
 *
 * Zentral bleibt die Entscheidung trotzdem: sie faellt an EINER Stelle
 * (hier), nicht je Einbindung — die Aufrufer von <ImgixVideo> aendern
 * sich nicht und koennen die Regel auch nicht uebersteuern.
 *
 * WICHTIG — Default ist STUMM OHNE UI:
 * Ein Video, das hier nicht gelistet ist, bekommt KEINE Audio-Steuerung.
 * Ein vergessener Eintrag kostet damit einen fehlenden Ton-Button (sicht-
 * bar, harmlos, leicht zu beheben) statt einen Ton-Button auf einem
 * stummen Video (genau der gemeldete Fehler). Die Fehlrichtung ist
 * bewusst so gewaehlt.
 *
 * Pflege: NICHT von Hand raten. Der Waechter
 * `pruefungen/probe_video_ton_manifest.py` misst jedes im Code
 * referenzierte Video neu und meldet Abweichungen gegen diese Liste.
 */

/*
 * Schwelle: ab wann gilt Ton als "hoerbar"?
 * ffmpeg meldet fuer ein reines Null-Signal -91.0 dB. Echte Tonspuren
 * dieses Bestands liegen bei max_volume zwischen -2.7 und 0.0 dB, also
 * um Groessenordnungen darueber. -60 dB trennt beide Klassen mit sehr
 * grossem Abstand und faengt auch ein "fast stummes" Rausch-Restsignal
 * noch als stumm ein.
 */
export const HOERBAR_SCHWELLE_DBFS = -60;

/*
 * Gemessen 2026-08-15 gegen https://qiblanco-video.imgix.video/<pfad>?fm=mp4
 * (erste 60 s, `ffmpeg -af volumedetect`). `hoerbar: false` heisst: das
 * Video laeuft als stummes Hintergrund-/Produktvideo OHNE Audio-UI.
 */
export const VIDEO_TON = {
  'VIDEO-QiOne60s-DE-2021.mov': {
    hoerbar: true,
    mean_dbfs: -22.0,
    max_dbfs: -2.7,
    notiz: 'QiOne(R) 2 Pro Erklaervideo, gesprochener Ton',
  },
  '240417_QIHome_Wohlfuehloase_16x9_EN.mov': {
    hoerbar: true,
    mean_dbfs: -12.2,
    max_dbfs: -0.2,
    notiz: 'QiHome Air Wohlfuehloase, Musik/Sprache',
  },
  '230413_cellstudy_comparison_1x1_DE.mp4': {
    hoerbar: false,
    mean_dbfs: null,
    max_dbfs: null,
    notiz: 'Zellstudien-Vergleich — gar keine Audiospur im Container',
  },
  '360-QiHome-1x1.mov': {
    hoerbar: false,
    mean_dbfs: -91.0,
    max_dbfs: -91.0,
    notiz: '360-Grad-Produktdrehung — AAC-Spur vorhanden, aber digitale Stille',
  },
  'new-360-QiBracelet-1x1.mov': {
    hoerbar: false,
    mean_dbfs: -91.0,
    max_dbfs: -91.0,
    notiz: '360-Grad-Produktdrehung — AAC-Spur vorhanden, aber digitale Stille',
  },
};

/**
 * Traegt dieses Video hoerbaren Ton — und darf es deshalb eine
 * Ton-an/aus-Steuerung zeigen?
 *
 * Unbekannte Pfade sind bewusst `false` (siehe Kopf): kein Eintrag,
 * keine Audio-UI.
 *
 * @param {string} videoPath imgix-Pfad, wie an <ImgixVideo> uebergeben
 * @returns {boolean}
 */
export function hatHoerbarenTon(videoPath) {
  return VIDEO_TON[videoPath]?.hoerbar === true;
}
