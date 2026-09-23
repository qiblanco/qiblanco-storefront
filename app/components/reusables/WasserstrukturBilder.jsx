/**
 * DIE DREI BILDER ZUR KOHÄRENTEN WASSERSTRUKTUR — inline, ohne zweiten Abruf.
 *
 * Christian: „Im Popup hätte ich gerne 3 Dinge, die bildlich erklärt werden."
 * Bildlich heißt hier wörtlich: die Kernaussage soll man sehen und nicht lesen
 * müssen. Die Bilder stehen deshalb als SVG direkt im Markup — ein nachgeladenes
 * Bild wäre im Moment des Öffnens noch nicht da, und im ausgelieferten Quelltext
 * stünde nur ein Dateiname.
 *
 * KEINE ZAHL STEHT IN DIESER DATEI. Der Winkel kommt als `grad` herein und wird
 * zu Koordinaten GERECHNET. Damit kann die Zeichnung nicht von ihrer Beschriftung
 * abweichen: beide stammen aus demselben Wert, und der stammt aus dem SSoT.
 * Genau das misst probe_wasserstruktur_naht_eine_zahlenhaltung__20260922.py.
 *
 * DIE AUFWEITUNG IST KLEIN, UND SIE WIRD NICHT GRÖSSER GEZEICHNET. Christian,
 * 23.09.2026: „Der Winkel beim kohärenten Wasser optisch genau so groß wie beim
 * normalen." Das war kein Zeichenfehler, sondern die Zahl: fünf Grad sieht man
 * an zwei nebeneinander stehenden Molekülen nicht. Fassung 2 legt deshalb beide
 * Stellungen übereinander. Der linke Arm bleibt stehen, der rechte zeigt die
 * alte Lage gestrichelt und die neue kräftig; der Keil dazwischen IST die
 * Aufweitung, und seine Beschriftung wird aus beiden Werten gerechnet. Die Lupe
 * vergrößert die Stelle am wandernden Wasserstoff. Eine Vergrößerung ändert
 * Längen, keinen Winkel. Wer die Koordinaten nachmisst, findet beide Winkel
 * wieder (homepage-bauer/pruefungen/probe_wasserfenster_winkel_nachmessbar__20260923.py).
 *
 * BEWEGUNG NUR, WENN SIE GEWOLLT IST: jede Animation hängt an einer Klasse, die
 * app/styles/qb-erklaer-popup.css unter `prefers-reduced-motion: reduce`
 * abschaltet. Abgeschaltet steht das Bild im Endzustand, nicht im Anfangszustand.
 */

const BOG = Math.PI / 180;

/** Richtung (in Grad, Bildschirm-Koordinaten) vom Sauerstoff zum Punkt im Abstand r. */
function punkt(ox, oy, r, richtung) {
  return {
    x: ox + r * Math.cos(richtung * BOG),
    y: oy + r * Math.sin(richtung * BOG),
  };
}

const f2 = (z) => z.toFixed(2);

/** Kreisbogen um den Sauerstoff von Richtung a nach Richtung b (b < a). */
function bogen(ox, oy, r, a, b) {
  const p = punkt(ox, oy, r, a);
  const q = punkt(ox, oy, r, b);
  return `M ${f2(p.x)} ${f2(p.y)} A ${r} ${r} 0 0 0 ${f2(q.x)} ${f2(q.y)}`;
}

/** Eine Zahl so, wie der Kunde sie liest: Dezimalkomma, höchstens eine Stelle. */
function zahl(z) {
  return String(Math.round(z * 10) / 10).replace('.', ',');
}

/**
 * Bild 1 — dasselbe Molekül in beiden Stellungen übereinander.
 *
 * Die Geometrie ist GERECHNET: der linke Arm steht so, dass die Öffnung des
 * mittleren Winkels nach unten zeigt, der rechte Arm liegt um `grad` weiter.
 * Nichts hier kennt 104,5 oder 109,5; beide kommen als `von.grad` und
 * `nach.grad` herein.
 */
export function BildWinkel({von, nach}) {
  const O = {x: 108, y: 30};
  const R = 100;
  const mitte = (von.grad + nach.grad) / 2;
  const links = 90 + mitte / 2;
  const rechtsVon = links - von.grad;
  const rechtsNach = links - nach.grad;
  const differenz = nach.grad - von.grad;
  const plus = `+${zahl(differenz)}°`;

  const hL = punkt(O.x, O.y, R, links);
  const hVon = punkt(O.x, O.y, R, rechtsVon);
  const hNach = punkt(O.x, O.y, R, rechtsNach);
  const keil = `M ${O.x} ${O.y} L ${f2(hVon.x)} ${f2(hVon.y)} A ${R} ${R} 0 0 0 ${f2(
    hNach.x,
  )} ${f2(hNach.y)} Z`;

  // Die Beschriftungen stehen auf der Winkelhalbierenden des jeweiligen Winkels.
  const etVon = punkt(O.x, O.y, 38, links - von.grad / 2);
  const etNach = punkt(O.x, O.y, 76, links - nach.grad / 2);
  const etPlus = punkt(O.x, O.y, R + 22, (rechtsVon + rechtsNach) / 2);

  // Die Lupe: Ausschnitt um den Punkt P auf dem Keil, k-fach vergrößert und
  // nach L verschoben. x' = L + k·(x − P) ist eine Streckung: Längen wachsen,
  // Winkel bleiben. Gezeichnet werden die gestreckten Koordinaten selbst, damit
  // die Probe sie ohne Transform-Rechnung nachmessen kann.
  const k = 3;
  const lupeR = 30;
  const P = punkt(O.x, O.y, 70, (rechtsVon + rechtsNach) / 2);
  const L = {x: 242, y: 42};
  const strecke = (q) => ({x: L.x + k * (q.x - P.x), y: L.y + k * (q.y - P.y)});
  const lupenArm = (richtung) => {
    const a = strecke(punkt(O.x, O.y, 70 - lupeR / k - 4, richtung));
    const b = strecke(punkt(O.x, O.y, 70 + lupeR / k + 4, richtung));
    return {x1: f2(a.x), y1: f2(a.y), x2: f2(b.x), y2: f2(b.y)};
  };
  const lupeVon = lupenArm(rechtsVon);
  const lupeNach = lupenArm(rechtsNach);
  const lupeKeil = [
    strecke(punkt(O.x, O.y, 70 - lupeR / k - 4, rechtsVon)),
    strecke(punkt(O.x, O.y, 70 + lupeR / k + 4, rechtsVon)),
    strecke(punkt(O.x, O.y, 70 + lupeR / k + 4, rechtsNach)),
    strecke(punkt(O.x, O.y, 70 - lupeR / k - 4, rechtsNach)),
  ]
    .map((q) => `${f2(q.x)},${f2(q.y)}`)
    .join(' ');
  const zuLupe = {x: L.x - P.x, y: L.y - P.y};
  const n = Math.hypot(zuLupe.x, zuLupe.y);
  const u = {x: zuLupe.x / n, y: zuLupe.y / n};
  const kleinR = lupeR / k;

  return (
    <svg
      className="qb-bild"
      viewBox="0 0 280 170"
      role="img"
      aria-label={`Ein Wassermolekül in zwei Stellungen übereinander: gestrichelt mit ${von.anzeige} (${von.was}), kräftig mit ${nach.anzeige} (${nach.was}). Der Keil zeigt die Aufweitung um ${plus}, die Lupe zeigt die Stelle vergrößert.`}
      data-wasser-bild="winkel"
      data-winkel-von={von.grad}
      data-winkel-nach={nach.grad}
    >
      <defs>
        <clipPath id="qb-winkel-lupe">
          <circle cx={L.x} cy={L.y} r={lupeR} />
        </clipPath>
      </defs>

      <path className="qb-winkel__keil" d={keil} />
      <path
        className="qb-winkel__bogen qb-winkel__bogen--von"
        d={bogen(O.x, O.y, 24, links, rechtsVon)}
      />
      <path
        className="qb-winkel__bogen qb-winkel__bogen--nach"
        d={bogen(O.x, O.y, 60, links, rechtsNach)}
      />
      <path
        className="qb-winkel__keilkante"
        d={bogen(O.x, O.y, R, rechtsVon, rechtsNach)}
      />

      <line
        className="qb-mol__bindung"
        data-winkel-arm="links"
        x1={O.x}
        y1={O.y}
        x2={f2(hL.x)}
        y2={f2(hL.y)}
      />
      <g className="qb-mol__geist">
        <line
          data-winkel-arm="von"
          x1={O.x}
          y1={O.y}
          x2={f2(hVon.x)}
          y2={f2(hVon.y)}
        />
        <circle cx={f2(hVon.x)} cy={f2(hVon.y)} r="9" />
      </g>
      <g
        className="qb-mol__arme qb-mol__arme--weitet"
        style={{
          '--qb-winkel-weg': `${differenz}deg`,
          transformOrigin: `${O.x}px ${O.y}px`,
        }}
      >
        <line
          className="qb-mol__bindung"
          data-winkel-arm="nach"
          x1={O.x}
          y1={O.y}
          x2={f2(hNach.x)}
          y2={f2(hNach.y)}
        />
        <circle className="qb-mol__h" cx={f2(hNach.x)} cy={f2(hNach.y)} r="9" />
        <text className="qb-mol__zeichen" x={f2(hNach.x)} y={f2(hNach.y)}>
          H
        </text>
      </g>
      <circle className="qb-mol__h" cx={f2(hL.x)} cy={f2(hL.y)} r="9" />
      <text className="qb-mol__zeichen" x={f2(hL.x)} y={f2(hL.y)}>
        H
      </text>
      <circle className="qb-mol__o" cx={O.x} cy={O.y} r="13" />
      <text className="qb-mol__zeichen" x={O.x} y={O.y}>
        O
      </text>

      <text className="qb-bild__wert" x={f2(etVon.x)} y={f2(etVon.y)}>
        {von.anzeige}
      </text>
      <text
        className="qb-bild__wert qb-bild__wert--akzent"
        x={f2(etNach.x)}
        y={f2(etNach.y)}
      >
        {nach.anzeige}
      </text>
      <text className="qb-winkel__plus" x={f2(etPlus.x)} y={f2(etPlus.y)}>
        {plus}
      </text>

      <circle className="qb-winkel__ausschnitt" cx={f2(P.x)} cy={f2(P.y)} r={kleinR} />
      <line
        className="qb-winkel__ausschnitt"
        x1={f2(P.x + u.x * kleinR)}
        y1={f2(P.y + u.y * kleinR)}
        x2={f2(L.x - u.x * lupeR)}
        y2={f2(L.y - u.y * lupeR)}
      />
      <circle className="qb-winkel__lupe" cx={L.x} cy={L.y} r={lupeR} />
      <g clipPath="url(#qb-winkel-lupe)">
        <polygon className="qb-winkel__keil" points={lupeKeil} />
        <line
          className="qb-mol__geist-linie"
          data-winkel-lupe="von"
          {...lupeVon}
        />
        <line className="qb-mol__bindung" data-winkel-lupe="nach" {...lupeNach} />
      </g>
      <circle className="qb-winkel__lupenrand" cx={L.x} cy={L.y} r={lupeR} />
      <text
        className="qb-bild__notiz qb-bild__notiz--rechtsbuendig"
        x={L.x - lupeR - 6}
        y={L.y - lupeR + 12}
      >
        vergrößert
      </text>

      <line className="qb-winkel__muster qb-winkel__muster--von" x1="22" y1="150" x2="46" y2="150" />
      <text className="qb-bild__notiz qb-bild__notiz--links" x="52" y="155">
        {von.was}
      </text>
      <line className="qb-winkel__muster" x1="140" y1="150" x2="164" y2="150" />
      <text className="qb-bild__notiz qb-bild__notiz--links" x="170" y="155">
        {nach.was}
      </text>
    </svg>
  );
}

const STREUUNG = [
  [38, 54],
  [74, 40],
  [112, 62],
  [44, 94],
  [82, 84],
  [116, 104],
  [62, 122],
];

function sechseck(cx, cy, r) {
  return Array.from({length: 6}, (_, k) => ({
    x: cx + r * Math.cos(k * 60 * BOG),
    y: cy + r * Math.sin(k * 60 * BOG),
  }));
}

/** Wo die Oberfläche liegt, an der das Gitter hält (SSoT: „an einer Oberfläche"). */
const OBERFLAECHE_Y = 128;

/**
 * Bild 3 — dieselbe Anzahl Moleküle, links ungeordnet, rechts als
 * Sechseck-Gitter an einer Oberfläche. Die Linie mit Schraffur darunter ist
 * die Oberfläche: an ihr hält die Ordnung, im freien Wasser nicht.
 */
export function BildStruktur({von, nach}) {
  const ring = sechseck(205, 74, 44);
  return (
    <svg
      className="qb-bild"
      viewBox="0 0 280 170"
      role="img"
      aria-label={`Sieben Moleküle ungeordnet als ${von.anzeige} neben denselben sieben Molekülen im Sechseck-Gitter an einer Oberfläche als ${nach.anzeige}.`}
      data-wasser-bild="struktur"
    >
      <g className="qb-gitter qb-gitter--lose">
        {STREUUNG.slice(0, 6).map(([x, y], i) => {
          const [x2, y2] = STREUUNG[i + 1];
          return <line key={`l${x}-${y}`} x1={x} y1={y} x2={x2} y2={y2} />;
        })}
        {STREUUNG.map(([x, y]) => (
          <circle key={`p${x}-${y}`} cx={x} cy={y} r="9" />
        ))}
      </g>
      <g className="qb-gitter qb-gitter--fest">
        {ring.map((p, i) => {
          const q = ring[(i + 1) % 6];
          return (
            <line
              key={`r${p.x.toFixed(1)}-${p.y.toFixed(1)}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
            />
          );
        })}
        {ring.map((p) => (
          <line
            key={`s${p.x.toFixed(1)}-${p.y.toFixed(1)}`}
            x1={p.x}
            y1={p.y}
            x2="205"
            y2="74"
          />
        ))}
        {ring.map((p) => (
          <circle
            key={`k${p.x.toFixed(1)}-${p.y.toFixed(1)}`}
            cx={p.x}
            cy={p.y}
            r="9"
          />
        ))}
        <circle cx="205" cy="74" r="9" />
      </g>
      <g className="qb-oberflaeche">
        <line x1="150" y1={OBERFLAECHE_Y} x2="262" y2={OBERFLAECHE_Y} />
        {Array.from({length: 11}, (_, i) => 154 + i * 10).map((x) => (
          <line
            key={`o${x}`}
            className="qb-oberflaeche__schraffur"
            x1={x}
            y1={OBERFLAECHE_Y}
            x2={x - 6}
            y2={OBERFLAECHE_Y + 6}
          />
        ))}
      </g>
      <text className="qb-bild__notiz" x="75" y="152">
        {von.was}
      </text>
      <text className="qb-bild__notiz qb-bild__notiz--akzent" x="205" y="152">
        {nach.was}
      </text>
    </svg>
  );
}

const VERSTREUT = [
  [34, 48, 18],
  [70, 36, 74],
  [110, 58, 140],
  [40, 88, 205],
  [78, 80, 261],
  [114, 100, 318],
  [56, 120, 96],
];

/** Bild 2 — aus einzelnen Schwingern wird ein gemeinsam schwingender Verband. */
export function BildDomaene({schwellen, energie}) {
  const ring = sechseck(205, 80, 40);
  return (
    <svg
      className="qb-bild"
      viewBox="0 0 280 170"
      role="img"
      aria-label={`Einzeln schwingende Moleküle ordnen sich zu einem Verband, der bei ${schwellen[0].anzeige} Dichte und ${schwellen[1].anzeige} Abstand auf ${energie.anzeige} arbeitet.`}
      data-wasser-bild="domaene"
    >
      <g className="qb-schwarm qb-schwarm--einzeln">
        {VERSTREUT.map(([x, y, w]) => (
          <g key={`e${x}-${y}`} transform={`rotate(${w} ${x} ${y})`}>
            <circle cx={x} cy={y} r="8" />
            <line x1={x} y1={y - 14} x2={x} y2={y - 20} />
          </g>
        ))}
      </g>
      <circle className="qb-schwarm__feld" cx="205" cy="80" r="58" />
      <g className="qb-schwarm qb-schwarm--verband">
        {ring.concat([{x: 205, y: 80}]).map((p) => (
          <g key={`v${p.x.toFixed(1)}-${p.y.toFixed(1)}`}>
            <circle cx={p.x} cy={p.y} r="8" />
            <line x1={p.x} y1={p.y - 14} x2={p.x} y2={p.y - 20} />
          </g>
        ))}
      </g>
      <text className="qb-bild__notiz" x="75" y="152">
        einzeln
      </text>
      <text className="qb-bild__notiz qb-bild__notiz--akzent" x="205" y="152">
        im Gleichtakt
      </text>
    </svg>
  );
}
