/*
 * WISSENS-STRECKE: die vier Zeichnungen als Bewegung (Canvas 2D).
 * Christian 27.10.2026: „diese 4 grafiken auf high end niveau animaitonen
 * umsetzen“ (Job 20261027-qi-alpha-wissen-4-grafiken-high-end-animationen).
 *
 * WARUM CANVAS UND KEIN VIDEO: die Zeichnungen sind Linien und Kugeln auf
 * Papier. Als Vektor gerechnet sind sie auf jeder Pixeldichte scharf (auch
 * über 4K), der Loop ist nahtlos, weil jede Bewegung eine ganze Zahl von
 * Perioden in PERIODE_S durchläuft, und der Papierton ist exakt der Ton der
 * Fläche (bewusst ohne Papierkorn: Korn verschiebt den Mittelton und macht
 * das Poster fünfmal schwerer). Ein Video dieser vier Motive wöge je 1–2 MB und hätte an der
 * Schleifennaht einen Sprung.
 *
 * VERTRAG: jede Szene ist eine reine Funktion (ctx, breite, t) — gleiches t,
 * gleiches Bild. Das Vorschaubild (Poster) ist genau das Bild bei
 * POSTER_T[id]; dort setzt die Animation an, also gibt es keinen Sprung.
 * Gezeichnet wird in einem 1000er-Raster, das auf die Kantenlänge skaliert.
 */

export const PERIODE_S = 14;
export const PAPIER = '#f5f1e5';
// Für das Standbild (Poster, reduzierte Bewegung) gewählte Zeitpunkte.
export const POSTER_T = {diamant: 0, kristall: 0, gleichtakt: 0, licht: 6.2};

const TAU = Math.PI * 2;
const TINTE = (a) => `rgba(116, 86, 60, ${a})`;
const GOLD = (a) => `rgba(186, 138, 78, ${a})`;
const LICHT = (a) => `rgba(255, 250, 236, ${a})`;

function glatt(a, b, x) {
  const v = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return v * v * (3 - 2 * v);
}

function zufall(saat) {
  let s = saat >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* Kugel-Sprite: einmal je Pixelradius gerechnet, danach nur drawImage. */
const kugelCache = new Map();
function kugel(rPx) {
  const key = Math.max(1, Math.round(rPx * 2) / 2);
  let c = kugelCache.get(key);
  if (c) return c;
  const pad = 2;
  const d = Math.ceil(key * 2 + pad * 2);
  c = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!c) return null;
  c.width = d;
  c.height = d;
  const g = c.getContext('2d');
  const m = d / 2;
  const grad = g.createRadialGradient(
    m - key * 0.38, m - key * 0.42, key * 0.05, m, m, key,
  );
  grad.addColorStop(0, 'rgb(255, 253, 246)');
  grad.addColorStop(0.32, 'rgb(242, 233, 216)');
  grad.addColorStop(0.78, 'rgb(219, 201, 175)');
  grad.addColorStop(1, 'rgb(196, 172, 142)');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(m, m, key, 0, TAU);
  g.fill();
  // Schattensichel unten rechts, gezeichnet wie mit der Feder.
  g.strokeStyle = TINTE(0.35);
  g.lineWidth = Math.max(0.6, key * 0.1);
  g.beginPath();
  g.arc(m, m, key * 0.8, 0.1 * Math.PI, 0.62 * Math.PI);
  g.stroke();
  g.strokeStyle = TINTE(0.9);
  g.lineWidth = Math.max(0.7, key * 0.085);
  g.beginPath();
  g.arc(m, m, key - g.lineWidth / 2, 0, TAU);
  g.stroke();
  kugelCache.set(key, c);
  return c;
}

function zeichneKugel(ctx, x, y, r, alpha = 1) {
  const sp = kugel(r);
  if (!sp) return;
  const d = sp.width;
  const k = (Math.round(r * 2) / 2) / r || 1;
  const dd = d / k;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sp, x - dd / 2, y - dd / 2, dd, dd);
  ctx.globalAlpha = 1;
}

function papier(ctx, w) {
  ctx.fillStyle = PAPIER;
  ctx.fillRect(0, 0, w, w);
}

/* ---------------------------------------------------------------------
 * 1  DIAMANT — das Kristallgitter fliesst in die Doppelhelix.
 * Scheiben wandern von links nach rechts. Links ist jede Scheibe ein
 * 3×3-Quadrat des kubischen Gitters, rechts ist sie eine Sprosse der
 * Helix; dazwischen faltet sich das Quadrat zur Sprosse und beginnt zu
 * drehen. In PERIODE_S rückt der Strom um genau SCHUB Scheiben vor: das
 * Bild am Ende ist das Bild am Anfang.
 * ------------------------------------------------------------------- */
const D = {
  n: 33, schub: 4, dreh: 1, e: 50, dxGit: 50, dxHel: 20, R: 116,
  a: 5.0, b: 10.5, drall: TAU / 16, kamY: -0.3, kamX: 0.26,
};
const D_GITTER = [];
for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) D_GITTER.push([j, k]);
// Jedem Gitterplatz seine Stelle auf der Sprosse: nach der Diagonale sortiert.
const D_SPROSSE = D_GITTER.map((p, i) => ({i, s: p[0] + p[1] * 0.999}))
  .sort((u, v) => u.s - v.s)
  .reduce((acc, o, rang) => {
    acc[o.i] = -1 + (2 * rang) / 8;
    return acc;
  }, []);
const D_STRANG = D_SPROSSE.map((f) => Math.abs(f) === 1);
const D_REIHE = D_SPROSSE.map((f, i) => ({f, i})).sort((u, v) => u.f - v.f).map((o) => o.i);

// x(ξ): numerisch integrierter Abstand, Gitter weit, Helix eng.
const D_X = (() => {
  const schritte = 680;
  const tab = new Float64Array(schritte + 1);
  let x = 0;
  const h = D.n / schritte;
  for (let i = 0; i <= schritte; i++) {
    tab[i] = x;
    const m = glatt(D.a, D.b, i * h);
    x += (D.dxGit + (D.dxHel - D.dxGit) * m) * h;
  }
  return {tab, h, laenge: x};
})();
function dX(xi) {
  const f = xi / D_X.h;
  const i = Math.max(0, Math.min(D_X.tab.length - 2, Math.floor(f)));
  const r = f - i;
  return D_X.tab[i] * (1 - r) + D_X.tab[i + 1] * r;
}

// Ort des Atoms i an der Stromstelle ξ, schon in die Bildebene projiziert.
function dOrt(i, xi, p) {
  const m = glatt(D.a, D.b, xi);
  // Der Drall setzt erst mit dem Falten ein. Dazu dreht sich der ganze
  // Strang, Gitter wie Helix, DREH-mal je Periode um seine Achse
  // (p = t / PERIODE_S). Die Drehung gilt überall gleich; mit m gewichtet
  // wäre sie im Übergang keine ganze Umdrehung und der Loop spränge.
  const theta = D.drall * Math.max(0, xi - D.a) * m + TAU * D.dreh * p;
  const ct = Math.cos(theta), st = Math.sin(theta);
  const [j, k] = D_GITTER[i];
  const gy = j * D.e, gz = k * D.e;
  const hy = D_SPROSSE[i] * D.R;
  const y = gy + (hy - gy) * m;
  const z = gz * (1 - m);
  const y2 = y * ct - z * st;
  const z2 = y * st + z * ct;
  const xw = (1000 - D_X.laenge) / 2 + dX(xi) - 500;
  const cY = Math.cos(D.kamY), sY = Math.sin(D.kamY);
  const cX = Math.cos(D.kamX), sX = Math.sin(D.kamX);
  const x3 = xw * cY + z2 * sY;
  const z3 = -xw * sY + z2 * cY;
  return {x: 500 + x3, y: 500 + y2 * cX - z3 * sX - xw * sY * sX, z: y2 * sX + z3 * cX, m};
}

function szeneDiamant(ctx, w, t) {
  const s = w / 1000;
  papier(ctx, w);
  const p = t / PERIODE_S;
  const versatz = p * D.schub;
  const sicht = (xi) => glatt(0, 1.4, xi) * (1 - glatt(D.n - 1.6, D.n - 0.1, xi));
  // Scheiben in Stromrichtung abarbeiten und die Tiefe gerundet sortieren:
  // so ist die Zeichenfolge am Periodenende dieselbe wie am Anfang (sonst
  // vertauschen Rundungsreste gleich tiefe Teile, und der Loop springt).
  const stellen = [];
  for (let k = 0; k < D.n; k++) stellen.push((k + versatz) % D.n);
  stellen.sort((u, v) => u - v);
  const teile = [];
  for (const xi of stellen) {
    const a = sicht(xi);
    const A = D_GITTER.map((_, i) => dOrt(i, xi, p));
    const m = A[0].m;
    // Gitterkanten der Scheibe, sie verblassen beim Falten
    for (let i = 0; i < 9; i++) {
      const [j, kk] = D_GITTER[i];
      if (j < 1) teile.push({art: 'l', pts: [A[i], A[i + 3]], a: (1 - m) * a, b: 1.5});
      if (kk < 1) teile.push({art: 'l', pts: [A[i], A[i + 1]], a: (1 - m) * a, b: 1.5});
    }
    // Die Sprosse, sie entsteht beim Falten
    teile.push({art: 'l', pts: D_REIHE.map((i) => A[i]), a: m * a * 0.6, b: 1.1});
    // Längsverbindungen zur nächsten Scheibe, als Kurve abgetastet
    if (xi + 1 < D.n) {
      const a2 = Math.min(a, sicht(xi + 1));
      for (let i = 0; i < 9; i++) {
        const pts = [];
        for (let u = 0; u <= 6; u++) pts.push(dOrt(i, xi + u / 6, p));
        const mm = (m + pts[6].m) / 2;
        const strang = D_STRANG[i];
        const al = strang ? a2 : a2 * (1 - mm);
        if (al > 0.01) teile.push({art: 'l', pts, a: al, b: strang ? 1.5 + 1.3 * mm : 1.5});
      }
    }
    for (let i = 0; i < 9; i++) {
      const strang = D_STRANG[i];
      const r = (strang ? 14 : 12.5) * (1 - m * (strang ? 0.04 : 0.66));
      teile.push({art: 'k', at: A[i], r, a: a * (strang ? 1 : 1 - m * 0.45)});
    }
  }
  teile.forEach((tl, n) => {
    const z = tl.art === 'k' ? tl.at.z : tl.pts.reduce((acc, q) => acc + q.z, 0) / tl.pts.length - 3;
    tl.z = Math.round(z * 100) / 100;
    tl.n = n;
  });
  teile.sort((u, v) => u.z - v.z || u.n - v.n);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const tl of teile) {
    const tiefe = glatt(-140, 140, tl.z);
    if (tl.art === 'l') {
      ctx.strokeStyle = TINTE(tl.a * (0.5 + 0.38 * tiefe));
      ctx.lineWidth = tl.b * s;
      ctx.beginPath();
      tl.pts.forEach((q, n) => (n ? ctx.lineTo(q.x * s, q.y * s) : ctx.moveTo(q.x * s, q.y * s)));
      ctx.stroke();
    } else {
      const r = tl.r * (0.88 + 0.16 * tiefe);
      zeichneKugel(ctx, tl.at.x * s, tl.at.y * s, r * s, tl.a * (0.78 + 0.22 * tiefe));
    }
  }
}

/* ---------------------------------------------------------------------
 * 2  KRISTALL — ungeordnetes Licht tritt ein, geordnetes tritt aus.
 * Links ein loses Bündel Lichtfäden, im Gitter verlieren sie ihr Zittern,
 * rechts verlassen sie es als parallele Schar, auf der Lichtpulse laufen.
 * Das Gitter atmet im Takt: alle Kugeln zugleich, und eine Lichtwelle
 * läuft im selben Takt durch die Reihen.
 * ------------------------------------------------------------------- */
const K = {spalten: 10, zeilen: 10, abstand: 46, r: 17.5, cx: 512, cy: 500};
const K_FAEDEN = (() => {
  const rnd = zufall(77);
  return Array.from({length: 17}, (_, j) => ({
    j,
    yLinks: 300 + rnd() * 400,
    wellen: Array.from({length: 3}, (_, w) => ({
      amp: 14 + rnd() * 22,
      k: (0.012 + rnd() * 0.02) * (w + 1),
      n: 1 + Math.floor(rnd() * 2),
      ph: rnd() * TAU,
    })),
    puls: rnd(),
  }));
})();

function szeneKristall(ctx, w, t) {
  const s = w / 1000;
  papier(ctx, w);
  const p = t / PERIODE_S;
  const x0 = K.cx - ((K.spalten - 1) * K.abstand) / 2;
  const y0 = K.cy - ((K.zeilen - 1) * K.abstand) / 2;
  const xRechts = x0 + (K.spalten - 1) * K.abstand;
  const atem = 1 + 0.045 * Math.sin(TAU * 2 * p);
  const nF = K_FAEDEN.length;

  // Gitter
  for (let c = 0; c < K.spalten; c++) {
    const welle = Math.pow(Math.max(0, Math.cos(TAU * (2 * p - c / K.spalten))), 6);
    for (let r = 0; r < K.zeilen; r++) {
      const x = x0 + c * K.abstand;
      const y = y0 + r * K.abstand;
      zeichneKugel(ctx, x * s, y * s, K.r * atem * s, 0.96);
      if (welle > 0.02) {
        const g = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, K.r * 1.5 * s);
        g.addColorStop(0, LICHT(0.85 * welle));
        g.addColorStop(1, LICHT(0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x * s, y * s, K.r * 1.5 * s, 0, TAU);
        ctx.fill();
      }
    }
  }

  // Lichtfäden
  ctx.lineCap = 'round';
  for (const f of K_FAEDEN) {
    const yBand = K.cy - 62 + (f.j / (nF - 1)) * 124;
    const yAus = K.cy - 170 + (f.j / (nF - 1)) * 340;
    ctx.strokeStyle = GOLD(0.62);
    ctx.lineWidth = 1.25 * s;
    ctx.beginPath();
    for (let x = 0; x <= 1000; x += 5) {
      const ordnung = glatt(x0 - 40, xRechts - 30, x);
      let y;
      if (x < xRechts) {
        const zu = glatt(0, x0 + 40, x);
        y = f.yLinks + (yBand - f.yLinks) * zu;
      } else {
        y = yBand + (yAus - yBand) * glatt(xRechts, 1000, x) * ((x - xRechts) / (1000 - xRechts));
      }
      let chaos = 0;
      for (const wl of f.wellen) chaos += wl.amp * Math.sin(wl.k * x + TAU * wl.n * p + wl.ph);
      y += chaos * (1 - ordnung);
      if (x === 0) ctx.moveTo(x * s, y * s);
      else ctx.lineTo(x * s, y * s);
    }
    ctx.stroke();
  }
  // Pulse auf der geordneten Schar
  for (const f of K_FAEDEN) {
    const yBand = K.cy - 62 + (f.j / (nF - 1)) * 124;
    const yAus = K.cy - 170 + (f.j / (nF - 1)) * 340;
    const q = (2 * p + f.puls) % 1;
    const x = xRechts + 8 + q * (1000 - xRechts);
    const y = yBand + (yAus - yBand) * glatt(xRechts, 1000, x) * ((x - xRechts) / (1000 - xRechts));
    const a = Math.sin(Math.PI * q);
    const g = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, 16 * s);
    g.addColorStop(0, GOLD(0.55 * a));
    g.addColorStop(0.35, LICHT(0.5 * a));
    g.addColorStop(1, LICHT(0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x * s, y * s, 16 * s, 0, TAU);
    ctx.fill();
  }
}

/* ---------------------------------------------------------------------
 * 3  KOHÄRENZ — Teilchen finden in den Gleichtakt.
 * Links pulsieren viele kleine Quellen, jede in ihrem eigenen Takt; je
 * weiter rechts, desto genauer schwingen sie zusammen, bis sie als lange,
 * parallele Wellenkämme weiterlaufen.
 * ------------------------------------------------------------------- */
const G = (() => {
  const rnd = zufall(31);
  const quellen = [];
  while (quellen.length < 96) {
    const x = 40 + rnd() * 500;
    if (rnd() > 1 - glatt(560, 120, x) * 0.95) continue;
    quellen.push({
      x, y: 372 + rnd() * 256, rMax: 22 + rnd() * 22, ph: rnd(), rnd: rnd(),
    });
  }
  const teilchen = Array.from({length: 46}, () => ({
    x: 200 + rnd() * 560, y: 384 + rnd() * 232, ph: rnd(),
  }));
  return {quellen, teilchen};
})();
const G_LAMBDA = 170;
const G_TAKT = 2; // Schwingungen je Periode

function szeneGleichtakt(ctx, w, t) {
  const s = w / 1000;
  papier(ctx, w);
  const p = t / PERIODE_S;
  const sync = (x) => glatt(180, 600, x);
  // Phase am Ort x, wenn alles im Gleichtakt läuft (die Welle rechts).
  const wellenPhase = (x) => x / G_LAMBDA - G_TAKT * p;

  // Wellenkämme rechts
  ctx.lineCap = 'round';
  for (let i = 0; i < 21; i++) {
    const yb = 370 + i * 13;
    ctx.strokeStyle = TINTE(0.62);
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    let erster = true;
    for (let x = 330; x <= 1000; x += 4) {
      const ein = glatt(330, 560, x);
      const amp = 9 * ein + 2.5 * Math.sin(i * 0.9 + x * 0.004);
      const y = yb + amp * Math.sin(TAU * wellenPhase(x)) + (i - 10) * 0.9 * (x - 330) / 670;
      ctx.globalAlpha = 1;
      if (erster) {
        ctx.moveTo(x * s, y * s);
        erster = false;
      } else ctx.lineTo(x * s, y * s);
    }
    ctx.stroke();
  }
  // Ausblendung des Wellenanfangs
  const fade = ctx.createLinearGradient(320 * s, 0, 560 * s, 0);
  fade.addColorStop(0, 'rgba(245,241,229,1)');
  fade.addColorStop(1, 'rgba(245,241,229,0)');
  ctx.fillStyle = fade;
  ctx.fillRect(318 * s, 330 * s, 244 * s, 340 * s);

  // Quellen mit Ringen
  for (const q of G.quellen) {
    const sy = sync(q.x);
    const ph = q.ph * (1 - sy) + (0.5 - q.x / G_LAMBDA) * sy;
    for (let ring = 0; ring < 3; ring++) {
      const f = (((G_TAKT * p + ph + ring / 3) % 1) + 1) % 1;
      const r = 2 + f * q.rMax;
      const a = Math.pow(1 - f, 1.2) * 0.8 * (1 - sy * 0.3);
      ctx.strokeStyle = TINTE(a);
      ctx.lineWidth = (1.5 - f * 0.6) * s;
      ctx.beginPath();
      ctx.ellipse(q.x * s, q.y * s, r * s, r * 0.62 * s, 0, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = TINTE(0.75);
    ctx.beginPath();
    ctx.arc(q.x * s, q.y * s, 1.8 * s, 0, TAU);
    ctx.fill();
  }

  // Teilchen: eigener Takt links, gemeinsamer Takt rechts
  for (const tc of G.teilchen) {
    const sy = sync(tc.x);
    // Im Gleichtakt reitet das Teilchen auf dem Wellenkamm (zeitfreie Phase, damit der Loop schliesst).
    const ph = tc.ph * (1 - sy) + (0.5 - tc.x / G_LAMBDA) * sy;
    const y = tc.y + 9 * Math.sin(TAU * (G_TAKT * p + ph));
    const x = tc.x;
    const g = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, 9 * s);
    g.addColorStop(0, GOLD(0.32 + 0.3 * sy));
    g.addColorStop(1, GOLD(0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x * s, y * s, 9 * s, 0, TAU);
    ctx.fill();
    zeichneKugel(ctx, x * s, y * s, 4.2 * s, 0.95);
  }
}

/* ---------------------------------------------------------------------
 * 4  LICHT — die Zelle beginnt zu leuchten (Biophotonen).
 * Ein ruhiges Ein- und Ausatmen des Lichts über die Periode; aus der
 * Membran lösen sich einzelne Lichtpunkte und wandern nach außen.
 * ------------------------------------------------------------------- */
const L = (() => {
  const rnd = zufall(9);
  return {
    strahlen: Array.from({length: 170}, (_, i) => ({
      w: (i / 170) * TAU + rnd() * 0.02, l: 0.18 + rnd() * 0.42, a: 0.4 + rnd() * 0.6,
    })),
    photonen: Array.from({length: 44}, () => ({
      w: rnd() * TAU, n: 1 + Math.floor(rnd() * 2), ph: rnd(), weit: 0.5 + rnd() * 0.5,
    })),
    blasen: Array.from({length: 11}, () => {
      const w = rnd() * TAU, d = 0.3 + rnd() * 0.55;
      return {x: Math.cos(w) * d, y: Math.sin(w) * d, r: 4 + rnd() * 9, ph: rnd()};
    }),
    schraffur: Array.from({length: 46}, () => ({
      w: -0.9 + rnd() * 0.25, o: -1 + rnd() * 2, a: 0.05 + rnd() * 0.07,
    })),
  };
})();

function zellRand(w, p, R) {
  return R * (1 + 0.017 * Math.sin(3 * w + TAU * p) + 0.011 * Math.sin(5 * w - TAU * 2 * p + 1.3)
    + 0.007 * Math.sin(8 * w + 2.1));
}

function szeneLicht(ctx, w, t) {
  const s = w / 1000;
  papier(ctx, w);
  const p = t / PERIODE_S;
  const cx = 500, cy = 500, R = 228;
  const g = 0.5 - 0.5 * Math.cos(TAU * p); // 0 → 1 → 0
  const hell = 0.3 + 0.7 * g;

  // Lichthof
  const hof = ctx.createRadialGradient(cx * s, cy * s, R * 0.4 * s, cx * s, cy * s, R * 1.75 * s);
  hof.addColorStop(0, LICHT(0.95 * hell));
  hof.addColorStop(0.55, LICHT(0.55 * hell));
  hof.addColorStop(1, LICHT(0));
  ctx.fillStyle = hof;
  ctx.fillRect(0, 0, w, w);

  // Strahlen
  ctx.lineCap = 'round';
  for (const st of L.strahlen) {
    const r0 = zellRand(st.w, p, R) * 1.03;
    const lang = R * st.l * (0.75 + 0.35 * hell);
    const flackern = 0.65 + 0.35 * Math.sin(st.w * 7 + TAU * p * 2);
    ctx.strokeStyle = GOLD(0.28 * st.a * hell * flackern + 0.04);
    ctx.lineWidth = 1 * s;
    const c = Math.cos(st.w), sn = Math.sin(st.w);
    ctx.beginPath();
    ctx.moveTo((cx + c * r0) * s, (cy + sn * r0) * s);
    ctx.lineTo((cx + c * (r0 + lang)) * s, (cy + sn * (r0 + lang)) * s);
    ctx.stroke();
  }

  // Zellkörper
  const pfad = () => {
    ctx.beginPath();
    for (let i = 0; i <= 180; i++) {
      const wi = (i / 180) * TAU;
      const r = zellRand(wi, p, R);
      const x = (cx + Math.cos(wi) * r) * s, y = (cy + Math.sin(wi) * r) * s;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  };
  ctx.save();
  pfad();
  const innen = ctx.createRadialGradient((cx - 60) * s, (cy - 70) * s, 10 * s, cx * s, cy * s, R * s);
  innen.addColorStop(0, `rgba(250, 243, 228, ${0.85})`);
  innen.addColorStop(1, `rgba(232, 216, 190, ${0.75 - 0.25 * g})`);
  ctx.fillStyle = innen;
  ctx.fill();
  ctx.clip();
  // Schraffur, wie mit der Feder
  ctx.lineWidth = 0.9 * s;
  for (const h of L.schraffur) {
    const c = Math.cos(h.w), sn = Math.sin(h.w);
    const ox = cx + -sn * h.o * R, oy = cy + c * h.o * R;
    ctx.strokeStyle = TINTE(h.a);
    ctx.beginPath();
    ctx.moveTo((ox - c * R) * s, (oy - sn * R) * s);
    ctx.lineTo((ox + c * R) * s, (oy + sn * R) * s);
    ctx.stroke();
  }
  // Endoplasmatisches Netz: zwei weiche Bänder
  for (let b = 0; b < 2; b++) {
    ctx.strokeStyle = TINTE(0.32);
    ctx.lineWidth = 1.1 * s;
    for (let l = 0; l < 4; l++) {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const u = i / 60;
        const wi = (b ? 0.35 : 2.6) + u * 1.5;
        const rr = R * (0.68 + l * 0.045) + 6 * Math.sin(u * 14 + TAU * p + b);
        const x = (cx + Math.cos(wi) * rr) * s, y = (cy + Math.sin(wi) * rr) * s;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
  // Bläschen
  for (const bl of L.blasen) {
    const dx = 3 * Math.sin(TAU * (p + bl.ph)), dy = 3 * Math.cos(TAU * (p + bl.ph));
    const x = (cx + bl.x * R + dx) * s, y = (cy + bl.y * R + dy) * s;
    zeichneKugel(ctx, x, y, bl.r * s, 0.8);
  }
  // Kern mit eigenem Leuchten
  const kx = cx + 12, ky = cy - 22, kr = 62;
  const kl = ctx.createRadialGradient(kx * s, ky * s, 0, kx * s, ky * s, kr * 2.1 * s);
  kl.addColorStop(0, LICHT(0.9 * hell));
  kl.addColorStop(1, LICHT(0));
  ctx.fillStyle = kl;
  ctx.fillRect(0, 0, w, w);
  zeichneKugel(ctx, kx * s, ky * s, kr * s, 1);
  ctx.fillStyle = TINTE(0.22);
  ctx.beginPath();
  ctx.arc((kx + 14) * s, (ky + 10) * s, 13 * s, 0, TAU);
  ctx.fill();
  ctx.restore();

  // Membran, doppelt gezogen
  ctx.strokeStyle = TINTE(0.88);
  ctx.lineWidth = 2.2 * s;
  pfad();
  ctx.stroke();
  ctx.save();
  ctx.translate(cx * s, cy * s);
  ctx.scale(0.965, 0.965);
  ctx.translate(-cx * s, -cy * s);
  ctx.strokeStyle = TINTE(0.38);
  ctx.lineWidth = 1.1 * s;
  pfad();
  ctx.stroke();
  ctx.restore();

  // Biophotonen
  for (const ph of L.photonen) {
    const q = (((ph.n * p + ph.ph) % 1) + 1) % 1;
    const r0 = zellRand(ph.w, p, R);
    const r = r0 + q * R * 0.75 * ph.weit;
    const x = cx + Math.cos(ph.w) * r, y = cy + Math.sin(ph.w) * r;
    const a = Math.sin(Math.PI * q) * (0.25 + 0.75 * hell);
    const rad = 13 * s;
    const gl = ctx.createRadialGradient(x * s, y * s, 0, x * s, y * s, rad);
    gl.addColorStop(0, LICHT(a));
    gl.addColorStop(0.28, LICHT(0.8 * a));
    gl.addColorStop(0.55, GOLD(0.22 * a));
    gl.addColorStop(1, GOLD(0));
    ctx.fillStyle = gl;
    ctx.beginPath();
    ctx.arc(x * s, y * s, rad, 0, TAU);
    ctx.fill();
  }
}

export const SZENEN = {
  diamant: szeneDiamant,
  kristall: szeneKristall,
  gleichtakt: szeneGleichtakt,
  licht: szeneLicht,
};

/* Poster je Szene: das Bild bei POSTER_T[id], gerechnet aus genau diesem
   Modul und auf das Shopify-CDN gelegt (medien-hosting/bin/cdn-publish).
   Ändert sich eine Szene, muss ihr Poster neu gerechnet werden; der Wächter
   test/the-alpha-wissen-animationen.test.mjs prüft den Fingerabdruck. */
const HERKUNFT =
  'gerechnet am 2026-10-27 aus wissen-animationen.js (Canvas 2D, Startbild der Szene, 2048 px), Job 20261027-qi-alpha-wissen-4-grafiken-high-end-animationen';

export const WISSEN_POSTER = {
  diamant: {
    src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-alpha-wissen--qi-alpha-wissen-diamant--4a2e382366dd.webp?v=1793110354',
    alt: 'Zeichnung: ein Gitter aus Kugeln und Stäben faltet sich Scheibe für Scheibe zur Doppelhelix, die sich langsam um ihre Achse dreht. Animierte Zeichnung.',
    herkunft: HERKUNFT,
    abdruck: 'c5b63d0eb21a5516',
  },
  kristall: {
    src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-alpha-wissen--qi-alpha-wissen-kristall--e7bd524f5ae5.webp?v=1793109763',
    alt: 'Zeichnung: ungeordnete Lichtfäden treten von links in ein regelmäßiges Kugelgitter ein und verlassen es rechts als ruhige, parallele Schar. Animierte Zeichnung.',
    herkunft: HERKUNFT,
    abdruck: '0cacea853a3c02e1',
  },
  gleichtakt: {
    src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-alpha-wissen--qi-alpha-wissen-gleichtakt--bebdf32b3ce2.webp?v=1793109766',
    alt: 'Zeichnung: links pulsieren viele kleine Wellenringe jeder in eigenem Takt, nach rechts hin schwingen sie zusammen und laufen als parallele Wellenkämme weiter. Animierte Zeichnung.',
    herkunft: HERKUNFT,
    abdruck: '783d26b0fbc6c7dd',
  },
  licht: {
    src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-qi-alpha-wissen--qi-alpha-wissen-licht--2259aef33e4a.webp?v=1793109769',
    alt: 'Zeichnung: eine Zelle mit Kern und doppelter Membran, um die ein feiner Lichtsaum leuchtet und von der einzelne Lichtpunkte nach außen wandern. Animierte Zeichnung.',
    herkunft: HERKUNFT,
    abdruck: 'c0a00e86da0085c3',
  },
};
