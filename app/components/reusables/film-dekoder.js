/*
 * Den Film selbst dekodieren, wenn iOS ihn nicht abspielen lässt.
 *
 * Christian 01.11.2026: „… dass eine 3D-Animation bei Apple immer
 * automatisch startet, ohne dass man irgendwas tippen oder sich bewegen
 * muss.“ Früher am Tag: „spiel das Video ab. Keine Ersatzdinger bauen.“
 *
 * Im Stromsparmodus (und mit „Video-Vorschauen automatisch abspielen“ aus)
 * lehnt iOS jedes <video> ohne Berührung ab, auch stumm (WebKit-Bug 168985,
 * „Disable autoplay of silent videos in low power mode“). Die Regel gilt dem
 * Medienelement, nicht dem Film: WebCodecs (iOS/Safari ab 16.4) dekodiert
 * dieselbe MP4-Datei Bild für Bild über den Hardware-Dekoder, und die Bilder
 * landen in einem <canvas>. Keine Bildfolge, kein zweites Medium: dieselbe
 * Datei, derselbe H.264-Strom, dieselben Pixel.
 *
 * Grenzen, bewusst: nur eine Videospur, nur avc1 (H.264), MP4 mit moov
 * (Shopify liefert faststart-MP4). Alles andere meldet beiFehler, und der
 * Aufrufer bleibt bei seinem bisherigen Weg.
 */

function kinder(d, von, bis, aus = []) {
  let o = von;
  while (o + 8 <= bis) {
    let groesse = d.getUint32(o);
    const typ = String.fromCharCode(
      d.getUint8(o + 4),
      d.getUint8(o + 5),
      d.getUint8(o + 6),
      d.getUint8(o + 7),
    );
    let kopf = 8;
    if (groesse === 1) {
      groesse = Number(d.getBigUint64(o + 8));
      kopf = 16;
    } else if (groesse === 0) {
      groesse = bis - o;
    }
    if (groesse < kopf || o + groesse > bis) break;
    aus.push({typ, start: o, inhalt: o + kopf, ende: o + groesse});
    o += groesse;
  }
  return aus;
}

function finde(d, box, typ) {
  return kinder(d, box.inhalt, box.ende).find((b) => b.typ === typ) || null;
}

function hex2(n) {
  return n.toString(16).padStart(2, '0');
}

function videoSpur(d, moov) {
  for (const trak of kinder(d, moov.inhalt, moov.ende)) {
    if (trak.typ !== 'trak') continue;
    const mdia = finde(d, trak, 'mdia');
    const hdlr = mdia && finde(d, mdia, 'hdlr');
    if (!hdlr) continue;
    const art = String.fromCharCode(
      d.getUint8(hdlr.inhalt + 8),
      d.getUint8(hdlr.inhalt + 9),
      d.getUint8(hdlr.inhalt + 10),
      d.getUint8(hdlr.inhalt + 11),
    );
    if (art === 'vide') return mdia;
  }
  return null;
}

/**
 * Liest die Videospur einer MP4-Datei: Codec, avcC und jede Probe mit Lage,
 * Größe, Zeit und Schlüsselbild-Kennung. Wirft bei allem, was nicht passt.
 * @param {ArrayBuffer} puffer
 */
export function mp4Lesen(puffer) {
  const d = new DataView(puffer);
  const oben = kinder(d, 0, d.byteLength);
  const moov = oben.find((b) => b.typ === 'moov');
  if (!moov) throw new Error('mp4: kein moov');
  const mdia = videoSpur(d, moov);
  if (!mdia) throw new Error('mp4: keine Videospur');
  const mdhd = finde(d, mdia, 'mdhd');
  const v1 = d.getUint8(mdhd.inhalt) === 1;
  const zeitbasis = d.getUint32(mdhd.inhalt + (v1 ? 20 : 12));
  const stbl = finde(d, finde(d, mdia, 'minf'), 'stbl');
  const box = (t) => finde(d, stbl, t);

  const stsd = box('stsd');
  const eintrag = kinder(d, stsd.inhalt + 8, stsd.ende)[0];
  if (!eintrag || !/^avc[13]$/.test(eintrag.typ)) {
    throw new Error('mp4: kein avc1 (' + (eintrag && eintrag.typ) + ')');
  }
  const breite = d.getUint16(eintrag.inhalt + 24);
  const hoehe = d.getUint16(eintrag.inhalt + 26);
  const avcC = kinder(d, eintrag.inhalt + 78, eintrag.ende).find(
    (b) => b.typ === 'avcC',
  );
  if (!avcC) throw new Error('mp4: kein avcC');
  const codec =
    'avc1.' +
    hex2(d.getUint8(avcC.inhalt + 1)) +
    hex2(d.getUint8(avcC.inhalt + 2)) +
    hex2(d.getUint8(avcC.inhalt + 3));
  const beschreibung = new Uint8Array(puffer.slice(avcC.inhalt, avcC.ende));

  // Größen
  const stsz = box('stsz');
  const festeGroesse = d.getUint32(stsz.inhalt + 4);
  const anzahl = d.getUint32(stsz.inhalt + 8);
  const umfang = new Array(anzahl);
  for (let i = 0; i < anzahl; i++) {
    umfang[i] = festeGroesse || d.getUint32(stsz.inhalt + 12 + 4 * i);
  }
  // Chunk-Lagen
  const stco = box('stco');
  const co64 = box('co64');
  const chunks = [];
  if (stco) {
    const n = d.getUint32(stco.inhalt + 4);
    for (let i = 0; i < n; i++)
      chunks.push(d.getUint32(stco.inhalt + 8 + 4 * i));
  } else if (co64) {
    const n = d.getUint32(co64.inhalt + 4);
    for (let i = 0; i < n; i++) {
      chunks.push(Number(d.getBigUint64(co64.inhalt + 8 + 8 * i)));
    }
  } else {
    throw new Error('mp4: kein stco/co64');
  }
  // Proben je Chunk -> Lage je Probe
  const stsc = box('stsc');
  const nStsc = d.getUint32(stsc.inhalt + 4);
  const lagen = new Array(anzahl);
  let probe = 0;
  for (let e = 0; e < nStsc; e++) {
    const erster = d.getUint32(stsc.inhalt + 8 + 12 * e) - 1;
    const jeChunk = d.getUint32(stsc.inhalt + 12 + 12 * e);
    const folgeChunk =
      e + 1 < nStsc
        ? d.getUint32(stsc.inhalt + 8 + 12 * (e + 1)) - 1
        : chunks.length;
    for (let c = erster; c < folgeChunk && probe < anzahl; c++) {
      let o = chunks[c];
      for (let k = 0; k < jeChunk && probe < anzahl; k++) {
        lagen[probe] = o;
        o += umfang[probe];
        probe++;
      }
    }
  }
  if (probe !== anzahl) throw new Error('mp4: stsc deckt die Proben nicht');
  // Dekodierzeit
  const stts = box('stts');
  const dts = new Array(anzahl);
  const dauer = new Array(anzahl);
  let t = 0;
  probe = 0;
  for (let e = 0, n = d.getUint32(stts.inhalt + 4); e < n; e++) {
    const zahl = d.getUint32(stts.inhalt + 8 + 8 * e);
    const delta = d.getUint32(stts.inhalt + 12 + 8 * e);
    for (let k = 0; k < zahl && probe < anzahl; k++) {
      dts[probe] = t;
      dauer[probe++] = delta;
      t += delta;
    }
  }
  // Anzeigezeit (B-Bilder)
  const ctts = box('ctts');
  const versatz = new Array(anzahl).fill(0);
  if (ctts) {
    const v = d.getUint8(ctts.inhalt);
    probe = 0;
    for (let e = 0, n = d.getUint32(ctts.inhalt + 4); e < n; e++) {
      const zahl = d.getUint32(ctts.inhalt + 8 + 8 * e);
      const off =
        v === 1
          ? d.getInt32(ctts.inhalt + 12 + 8 * e)
          : d.getUint32(ctts.inhalt + 12 + 8 * e);
      for (let k = 0; k < zahl && probe < anzahl; k++) versatz[probe++] = off;
    }
  }
  // Schlüsselbilder (ohne stss: jede Probe)
  const stss = box('stss');
  const schluessel = new Array(anzahl).fill(!stss);
  if (stss) {
    for (let e = 0, n = d.getUint32(stss.inhalt + 4); e < n; e++) {
      schluessel[d.getUint32(stss.inhalt + 8 + 4 * e) - 1] = true;
    }
  }
  if (!schluessel[0])
    throw new Error('mp4: erste Probe ist kein Schlüsselbild');

  let pts0 = Infinity;
  for (let i = 0; i < anzahl; i++) pts0 = Math.min(pts0, dts[i] + versatz[i]);
  const us = (x) => Math.round((x * 1e6) / zeitbasis);
  const proben = new Array(anzahl);
  for (let i = 0; i < anzahl; i++) {
    proben[i] = {
      lage: lagen[i],
      groesse: umfang[i],
      zeit: us(dts[i] + versatz[i] - pts0),
      dauer: us(dauer[i]),
      schluessel: schluessel[i],
    };
  }
  return {codec, beschreibung, breite, hoehe, dauer: us(t), proben};
}

const VORRAT = 6;

/**
 * Spielt `src` (MP4, H.264) über WebCodecs in `leinwand` in Schleife ab,
 * ohne <video>. Bilder ruhen, solange die Seite verborgen oder `buehne`
 * außerhalb des Fensters ist.
 * @param {HTMLCanvasElement} leinwand
 * @param {string} src
 * @param {{buehne?: Element, beiErstemBild?: () => void, beiFehler?: (e: unknown) => void}} [opt]
 * @returns {{stopp: () => void}}
 */
export function filmAufLeinwand(leinwand, src, opt = {}) {
  const {buehne = leinwand.parentElement, beiErstemBild, beiFehler} = opt;
  const abbruch = new AbortController();
  const schlange = [];
  let dek = null;
  let film = null;
  let bytes = null;
  let zeiger = 0;
  let runde = 0;
  let leert = false;
  let anker = null;
  let raf = 0;
  let imBild = true;
  let erstes = true;
  let aus = false;
  let io = null;

  const stopp = () => {
    if (aus) return;
    aus = true;
    abbruch.abort();
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', beiSicht);
    while (schlange.length) schlange.shift().close();
    if (dek && dek.state !== 'closed') {
      try {
        dek.close();
      } catch {
        /* schon zu */
      }
    }
  };
  const fehler = (e) => {
    if (aus) return;
    stopp();
    if (beiFehler) beiFehler(e);
  };

  function fuettern() {
    if (aus || !dek || leert) return;
    while (
      dek.decodeQueueSize < 2 &&
      schlange.length + dek.decodeQueueSize < VORRAT
    ) {
      if (zeiger >= film.proben.length) {
        // Schleife: Rest ausgeben (B-Bilder), dann von vorn ab dem Schlüsselbild.
        leert = true;
        dek.flush().then(() => {
          leert = false;
          zeiger = 0;
          runde++;
          fuettern();
        }, fehler);
        return;
      }
      const p = film.proben[zeiger++];
      dek.decode(
        new EncodedVideoChunk({
          type: p.schluessel ? 'key' : 'delta',
          timestamp: p.zeit + runde * film.dauer,
          duration: p.dauer,
          data: bytes.subarray(p.lage, p.lage + p.groesse),
        }),
      );
    }
  }

  function bild(jetzt) {
    raf = 0;
    if (aus || !imBild || document.hidden) return;
    if (schlange.length) {
      const vorn = schlange[0].timestamp / 1000;
      // Neu ansetzen beim Start, nach einer Pause oder wenn der Dekoder
      // zurückliegt: nie im Zeitraffer aufholen.
      if (anker === null || jetzt - anker - vorn > 250) anker = jetzt - vorn;
      let zeigen = null;
      while (schlange.length && schlange[0].timestamp / 1000 <= jetzt - anker) {
        if (zeigen) zeigen.close();
        zeigen = schlange.shift();
      }
      if (zeigen) {
        const c = leinwand.getContext('2d');
        c.drawImage(zeigen, 0, 0, leinwand.width, leinwand.height);
        zeigen.close();
        if (erstes) {
          erstes = false;
          if (beiErstemBild) beiErstemBild();
        }
      }
    }
    fuettern();
    if (!aus) raf = requestAnimationFrame(bild);
  }

  function weiter() {
    if (aus || raf || !imBild || document.hidden || !dek) return;
    anker = null;
    raf = requestAnimationFrame(bild);
  }

  function beiSicht() {
    if (!document.hidden) {
      weiter();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }

  (async () => {
    if (
      typeof VideoDecoder !== 'function' ||
      typeof EncodedVideoChunk !== 'function'
    ) {
      throw new Error('kein WebCodecs');
    }
    const antwort = await fetch(src, {mode: 'cors', signal: abbruch.signal});
    if (!antwort.ok) throw new Error('film HTTP ' + antwort.status);
    const puffer = await antwort.arrayBuffer();
    if (aus) return;
    film = mp4Lesen(puffer);
    bytes = new Uint8Array(puffer);
    const konfig = {
      codec: film.codec,
      codedWidth: film.breite,
      codedHeight: film.hoehe,
      description: film.beschreibung,
    };
    const geht = await VideoDecoder.isConfigSupported(konfig);
    if (!geht || !geht.supported)
      throw new Error('codec ' + film.codec + ' nicht unterstützt');
    if (aus) return;
    dek = new VideoDecoder({
      output: (f) => {
        if (aus) f.close();
        else schlange.push(f);
      },
      error: fehler,
    });
    dek.configure(konfig);
    document.addEventListener('visibilitychange', beiSicht);
    if (buehne && typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver((e) => {
        imBild = e[e.length - 1].isIntersecting;
        if (imBild) weiter();
      });
      io.observe(buehne);
    }
    fuettern();
    weiter();
  })().catch(fehler);

  return {stopp};
}
