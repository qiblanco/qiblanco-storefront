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
 * DIE AUFWEITUNG IST KLEIN, UND SIE WIRD NICHT GRÖSSER GEZEICHNET. Fünf Grad
 * sind fünf Grad. Sichtbar wird der Unterschied über die gestrichelte
 * Ausgangslage im rechten Feld und über die Bewegung beim Öffnen — nicht über
 * einen gestreckten Winkel, den es nicht gibt.
 *
 * BEWEGUNG NUR, WENN SIE GEWOLLT IST: jede Animation hängt an einer Klasse, die
 * app/styles/qb-erklaer-popup.css unter `prefers-reduced-motion: reduce`
 * abschaltet. Abgeschaltet steht das Bild im Endzustand, nicht im Anfangszustand.
 */

const BOG = Math.PI / 180;

/** Wo ein Wasserstoff-Atom liegt, wenn der Bindungswinkel `grad` beträgt. */
function h(ox, oy, r, grad, seite) {
  const halb = (grad / 2) * BOG;
  return {
    x: ox + seite * r * Math.sin(halb),
    y: oy + r * Math.cos(halb),
  };
}

/** Der Bogen, der den Winkel am Sauerstoff markiert. */
function bogen(ox, oy, r, grad) {
  const l = h(ox, oy, r, grad, -1);
  const re = h(ox, oy, r, grad, 1);
  return `M ${l.x.toFixed(2)} ${l.y.toFixed(2)} A ${r} ${r} 0 0 0 ${re.x.toFixed(
    2,
  )} ${re.y.toFixed(2)}`;
}

function MolekuelBild({ox, oy, grad, geist, bewegt}) {
  const R = 58;
  const l = h(ox, oy, R, grad, -1);
  const re = h(ox, oy, R, grad, 1);
  const gl = geist ? h(ox, oy, R, geist, -1) : null;
  const gr = geist ? h(ox, oy, R, geist, 1) : null;
  return (
    <g>
      {gl && gr && (
        <g className="qb-mol__geist">
          <line x1={ox} y1={oy} x2={gl.x} y2={gl.y} />
          <line x1={ox} y1={oy} x2={gr.x} y2={gr.y} />
          <circle cx={gl.x} cy={gl.y} r="8" />
          <circle cx={gr.x} cy={gr.y} r="8" />
        </g>
      )}
      <path className="qb-mol__bogen" d={bogen(ox, oy, 24, grad)} />
      <g className={bewegt ? 'qb-mol__arme qb-mol__arme--weitet' : 'qb-mol__arme'}>
        <line className="qb-mol__bindung" x1={ox} y1={oy} x2={l.x} y2={l.y} />
        <line className="qb-mol__bindung" x1={ox} y1={oy} x2={re.x} y2={re.y} />
        <circle className="qb-mol__h" cx={l.x} cy={l.y} r="9" />
        <circle className="qb-mol__h" cx={re.x} cy={re.y} r="9" />
        <text className="qb-mol__zeichen" x={l.x} y={l.y}>
          H
        </text>
        <text className="qb-mol__zeichen" x={re.x} y={re.y}>
          H
        </text>
      </g>
      <circle className="qb-mol__o" cx={ox} cy={oy} r="13" />
      <text className="qb-mol__zeichen" x={ox} y={oy}>
        O
      </text>
    </g>
  );
}

/** Bild 1 — derselbe Molekültyp zweimal, links normal, rechts energiereich. */
export function BildWinkel({von, nach}) {
  return (
    <svg
      className="qb-bild"
      viewBox="0 0 280 170"
      role="img"
      aria-label={`Ein Wassermolekül mit ${von.anzeige} Bindungswinkel neben demselben Molekül mit ${nach.anzeige}.`}
      data-wasser-bild="winkel"
    >
      <text className="qb-bild__wert" x="75" y="26">
        {von.anzeige}
      </text>
      <text className="qb-bild__wert qb-bild__wert--akzent" x="205" y="26">
        {nach.anzeige}
      </text>
      <MolekuelBild ox={75} oy={64} grad={von.grad} />
      <MolekuelBild ox={205} oy={64} grad={nach.grad} geist={von.grad} bewegt />
      <text className="qb-bild__notiz" x="75" y="152">
        {von.was}
      </text>
      <text className="qb-bild__notiz" x="205" y="152">
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

/** Bild 2 — dieselbe Anzahl Moleküle, einmal ungeordnet, einmal im Gitter. */
export function BildStruktur({von, nach}) {
  const ring = sechseck(205, 82, 44);
  return (
    <svg
      className="qb-bild"
      viewBox="0 0 280 170"
      role="img"
      aria-label={`Sieben Moleküle ungeordnet als ${von.anzeige} neben denselben sieben Molekülen im Sechseck-Gitter als ${nach.anzeige}.`}
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
            y2="82"
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
        <circle cx="205" cy="82" r="9" />
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

/** Bild 3 — aus einzelnen Schwingern wird ein gemeinsam schwingender Verband. */
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
