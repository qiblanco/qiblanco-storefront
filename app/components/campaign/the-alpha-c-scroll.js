/*
 * QI ALPHA, Variante C (/pages/Qi-Alpha-B): Scrollgefühl nach Apples
 * iPhone-18-Pro-Seite. Christian 27.10.2026: „muss sich vom scrollgefühl so
 * anfühlen wie die https://www.apple.com/iphone-18-pro/“ (Job 20261027-qi-
 * alpha-c-scrollgefuehl-apple-iphone-18-pro; Analyse und Know-how:
 * ai-ceo/wissen/kanon/scrollgefuehl-apple-iphone-pro.md).
 *
 * Was Apple tut (gemessen 28.10.2026, Handy 390 px und Desktop 1440 px):
 *  - natives Scrollen, kein smooth-scroll, kein Einrasten;
 *  - stehende Szenen: ein Bildschirm hoch, rund 1,2 Bildschirme Laufbahn; der
 *    Inhalt blendet im Stehen ein und wieder aus, statt aus dem Bild gezogen
 *    zu werden;
 *  - Einmal-Einblendungen beim Erreichen: Opazität 0,9 s, 0,15 s Versatz;
 *  - Videos spielen beim Erreichen, Bilder und Videos öffnen sich im Stehen.
 *
 * Diese Datei schaltet das für C zu, nur an der Wurzel
 * .tap-seite[data-the-alpha-premium='c'] und nur mit Bewegung: bei
 * prefers-reduced-motion und ?film=still läuft sie nicht (useTapFilm stellt
 * dann alles still hin). Sie schreibt in einem requestAnimationFrame je Bild
 * nur opacity und transform (Compositor, 60 fps), liest vorher alle Maße.
 * Christians Regeln vom 27.10. bleiben: ein Bild oder Element blendet erst
 * ein, wenn es ganz im Bild ist (hier: wenn seine Bühne steht), die Wörter
 * bauen sich mit dem Scrollen auf, nichts schiebt sich herein.
 *
 * Die Rechenregeln stehen als reine Funktionen oben (Test:
 * test/the-alpha-c-scroll.test.mjs), die DOM-Anbindung unten.
 */

/** Stellschrauben der Szenen, in Anteilen eines Bildschirms bzw. Faktoren. */
export const TAC_SZENE = {
  // Am Ende jeder stehenden Bühne blendet ihr Inhalt über 35 % eines
  // Bildschirms Scrollweg aus und wird dabei etwas kleiner (Apple: der Inhalt
  // geht im Stehen aus). Die Bühnen sind dafür in the-alpha-variante-c.css um
  // --tac-aus (35svh) länger; beide Zahlen gehören zusammen.
  aus: 0.35,
  ausSkala: 0.06,
  // Film-Leinwand: beginnt bei 86 % Größe, blendet über das erste Drittel
  // der Laufbahn auf und ist nach der Hälfte bildschirmbreit.
  filmVon: 0.86,
  filmEin: 0.3,
  filmZoom: 0.5,
  // Seitenband: das Bild steht 8 % größer im Rahmen und setzt sich auf dem
  // Weg durch den Bildschirm auf 100 % (Zoom im Rahmen, kein Hereinschieben).
  bandZoom: 0.08,
};

/** Begrenzt auf 0 … 1. */
export function klemme(x) {
  if (!(x > 0)) return 0;
  return x > 1 ? 1 : x;
}

/** Sanft auslaufende Kurve für Größen (ease-out, kubisch). */
export function auslauf(t) {
  const u = 1 - klemme(t);
  return 1 - u * u * u;
}

/**
 * Ausblende-Fortschritt einer stehenden Bühne.
 * oben: Oberkante der Bühne relativ zum Bildschirm (negativ beim Scrollen),
 * hoehe: Höhe der Bühne, bild: Höhe ihres stehenden Inhalts (ein Bildschirm),
 * aus: Scrollweg der Ausblendung in px.
 * 0, solange der Inhalt steht; 1, wenn die Laufbahn zu Ende ist.
 */
export function ausblendung(oben, hoehe, bild, aus) {
  if (!(aus > 0)) return 0;
  const laufbahn = hoehe - bild;
  return klemme((-oben - (laufbahn - aus)) / aus);
}

/**
 * Fortschritt der Wort-Bühne in Schritten, gebrochen: 0 bis zum Stillstand,
 * danach start + Scrollweg / Schrittweite. Ganze Zahl n heißt: n Schritte
 * stehen ganz da (gleich der Zählung von useTapFilm).
 */
export function schrittFortschritt(oben, px, start = 0) {
  if (oben > 1) return 0;
  return start + Math.max(0, -oben) / (px > 0 ? px : 48);
}

/** Deckung des i-ten Schritts bei Fortschritt f: er folgt dem Finger. */
export function schrittDeckung(f, i) {
  return klemme(f - i);
}

/** Film-Leinwand: Deckung und Größe aus dem Fortschritt p (0 … 1) der Laufbahn. */
export function filmZustand(p, sz = TAC_SZENE) {
  return {
    deckung: klemme(p / sz.filmEin),
    skala: sz.filmVon + (1 - sz.filmVon) * auslauf(p / sz.filmZoom),
  };
}

/** Seitenband: Zoom im Rahmen aus der Lage im Bildschirm (oben, hoehe, bild). */
export function bandSkala(oben, hoehe, bild, sz = TAC_SZENE) {
  const t = klemme((bild - oben) / (bild + hoehe));
  return 1 + sz.bandZoom * (1 - t);
}

const runde = (x) => Math.round(x * 1000) / 1000;

/**
 * Schaltet das Scrollgefühl an der Wurzel zu und gibt die Aufräumfunktion
 * zurück (oder undefined, wenn es nicht läuft).
 */
export function tacScrollFilm(wurzel, win = typeof window === 'undefined' ? undefined : window) {
  if (!wurzel || !win || typeof win.requestAnimationFrame !== 'function') return undefined;
  const still =
    win.matchMedia?.('(prefers-reduced-motion: reduce)').matches ||
    new URLSearchParams(win.location.search).get('film') === 'still';
  if (still) return undefined;

  const buehnen = [...wurzel.querySelectorAll('.tap-scrub')].map((b) => ({
    b,
    bild: b.querySelector('.tap-scrub-bild'),
    schritte: [...b.querySelectorAll('[data-tap-schritt]')],
    start: Number(b.dataset.tapScrubStart || 0),
    px: 48,
    werte: [],
    q: -1,
  }));
  const filme = [...wurzel.querySelectorAll('.tac-film-buehne')].map((b) => ({
    b,
    bild: b.querySelector('.tac-film-bild'),
    leinwand: b.querySelector('.tap-film, .tap-vollbild'),
    zustand: '',
  }));
  const baender = [...wurzel.querySelectorAll('.tap-marke .tap-karte img')].map((img) => ({img, s: -1}));

  const masse = () => {
    for (const s of buehnen) {
      s.px = parseFloat(win.getComputedStyle(s.b).getPropertyValue('--tap-schritt')) || 48;
    }
  };

  const zeichnen = () => {
    const vh = win.innerHeight;
    // Erst alles lesen, dann alles schreiben (kein Layout-Flattern).
    const lage = buehnen.map((s) => (s.bild ? s.b.getBoundingClientRect() : null));
    const filmLage = filme.map((f) => f.b.getBoundingClientRect());
    const bandLage = baender.map((x) => x.img.getBoundingClientRect());
    const bildHoehe = buehnen.map((s) => (s.bild ? s.bild.offsetHeight : 0));
    const filmBild = filme.map((f) => (f.bild ? f.bild.offsetHeight : 0));

    buehnen.forEach((s, k) => {
      const r = lage[k];
      if (!r || r.bottom < -vh || r.top > 2 * vh) return;
      // Wörter und Absätze: Deckung folgt dem Scrollweg.
      const f = schrittFortschritt(r.top, s.px, s.start);
      s.schritte.forEach((w, i) => {
        // Was beim Stillstehen schon da ist (data-tap-scrub-start), kommt mit
        // dem kurzen Fade aus dem Gerüst, ebenso der „bam“ der Überschrift.
        if (i < s.start || w.classList.contains('tap-bam')) return;
        const d = runde(schrittDeckung(f, i));
        if (s.werte[i] === d) return;
        s.werte[i] = d;
        w.style.opacity = String(d);
      });
      // Szenenende: der stehende Inhalt blendet aus und wird etwas kleiner.
      const q = runde(ausblendung(r.top, r.height, bildHoehe[k], TAC_SZENE.aus * bildHoehe[k]));
      if (q === s.q) return;
      s.q = q;
      s.bild.style.opacity = q > 0 ? String(runde(1 - q)) : '';
      s.bild.style.transform = q > 0 ? `scale(${runde(1 - TAC_SZENE.ausSkala * q)})` : '';
    });

    filme.forEach((f, k) => {
      const r = filmLage[k];
      if (!f.leinwand || r.bottom < -vh || r.top > 2 * vh) return;
      const laufbahn = Math.max(1, r.height - filmBild[k]);
      const p = r.top > 0 ? 0 : klemme(-r.top / laufbahn);
      const {deckung, skala} = filmZustand(p);
      const q = ausblendung(r.top, r.height, filmBild[k], TAC_SZENE.aus * filmBild[k]);
      const op = runde(Math.min(deckung, 1 - q));
      const sk = runde(skala * (1 - TAC_SZENE.ausSkala * q));
      const neu = `${op}|${sk}`;
      if (neu === f.zustand) return;
      f.zustand = neu;
      f.leinwand.style.opacity = String(op);
      f.leinwand.style.transform = sk === 1 ? '' : `scale(${sk})`;
    });

    baender.forEach((x, k) => {
      const r = bandLage[k];
      if (r.bottom < -vh || r.top > 2 * vh) return;
      const s = runde(bandSkala(r.top, r.height, vh));
      if (s === x.s) return;
      x.s = s;
      x.img.style.transform = s === 1 ? '' : `scale(${s})`;
    });
  };

  let angefordert = false;
  const anfordern = () => {
    if (angefordert) return;
    angefordert = true;
    win.requestAnimationFrame(() => {
      angefordert = false;
      zeichnen();
    });
  };
  const neu = () => {
    masse();
    anfordern();
  };

  wurzel.classList.add('tac-scroll');
  masse();
  zeichnen();
  win.addEventListener('scroll', anfordern, {passive: true});
  win.addEventListener('resize', neu);
  return () => {
    win.removeEventListener('scroll', anfordern);
    win.removeEventListener('resize', neu);
    wurzel.classList.remove('tac-scroll');
  };
}
