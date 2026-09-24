import {useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * DIE GRAFIKEN DER GITTERCHIP-SEITE: zwei neue Zeichnungen und die Szene, die
 * jede Grafik der Seite genau einmal abspielt.
 *
 * Christian, 23.09.2026: „GitterChip-Querschnitt mit Feldlinien … die Kette
 * Chip → Wasser → Zelle als eine durchgehende Scroll-Erzählung
 * (scrollgetrieben, einmal abspielend).“ Winkel, Domäne und EZ-Schicht sind
 * die Zeichnungen der Info-Seite (KwGrafiken.jsx), hier nur eingebunden.
 *
 * DIE SZENE hat drei Zustände, nach dem Rezept des Bausatz-Balkendiagramms:
 *   fertig  im Server-HTML und ohne JavaScript: das Endbild, nichts bewegt sich.
 *   bereit  nach dem Mount: das Startbild, die Animation steht angehalten.
 *   aktiv   sobald die Szene zu 30 % im Bild ist: die Animation läuft EINMAL.
 * Wer reduzierte Bewegung wünscht oder keinen IntersectionObserver hat, bleibt
 * auf „fertig“. Ohne JavaScript ist die Grafik nie leer.
 *
 * Die Bewegung selbst steht im Seiten-Stylesheet unter dem Zustand, nur
 * transform, opacity und stroke-dashoffset. Keine Zahl steht in dieser Datei;
 * was ein Leser liest, kommt als Wert aus app/data/gitterchip-seite.js.
 */

const SCHWELLE = 0.3;
const useFruehEffekt = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function Szene({name, legende, className = '', children}) {
  const wurzel = useRef(null);
  const [zustand, setZustand] = useState('fertig');

  useFruehEffekt(() => {
    const el = wurzel.current;
    if (!el || typeof window.IntersectionObserver !== 'function') return undefined;
    const ruhig =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (ruhig && ruhig.matches) return undefined;
    setZustand('bereit');
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) {
          beobachter.disconnect();
          setZustand('aktiv');
        }
      },
      {threshold: SCHWELLE},
    );
    beobachter.observe(el);
    return () => beobachter.disconnect();
  }, []);

  return (
    <figure
      ref={wurzel}
      className={`gc-szene ${className}`.trim()}
      data-gc-szene={name}
      data-zustand={zustand}
    >
      {children}
      {legende ? <figcaption>{legende}</figcaption> : null}
    </figure>
  );
}

const f1 = (z) => Number(z.toFixed(1));

/** Eine Feldlinie vom linken zum rechten Rand des Chips, Bogen der Höhe h. */
function feldlinie(x0, x1, y, h) {
  const k = (x1 - x0) * 0.12 + Math.abs(h) * 0.45;
  return `M ${x0} ${y} C ${f1(x0 - k)} ${f1(y - h)}, ${f1(x1 + k)} ${f1(y - h)}, ${x1} ${y}`;
}

/** Wassermolekül als Zeichen: Sauerstoff oben, zwei Wasserstoffe darunter. */
function H2oZeichen({x, y, kipp, verzoegerung}) {
  return (
    <g
      className="gc-h2o"
      style={{
        '--gc-kipp': `${kipp}deg`,
        animationDelay: `${verzoegerung}s`,
        transformOrigin: `${x}px ${y}px`,
      }}
    >
      <circle className="kw-atom-h" cx={x - 9} cy={y + 10} r="5.5" />
      <circle className="kw-atom-h" cx={x + 9} cy={y + 10} r="5.5" />
      <circle className="kw-atom-o" cx={x} cy={y} r="10" />
    </g>
  );
}

const H2O_ORTE = [
  {x: 92, y: 96, kipp: 70},
  {x: 150, y: 44, kipp: -55},
  {x: 232, y: 30, kipp: 110},
  {x: 408, y: 30, kipp: -95},
  {x: 490, y: 44, kipp: 60},
  {x: 548, y: 96, kipp: -80},
  {x: 92, y: 248, kipp: -120},
  {x: 170, y: 292, kipp: 85},
  {x: 470, y: 292, kipp: -65},
  {x: 548, y: 248, kipp: 130},
];

/**
 * Der GitterChip im Querschnitt: eine Fassung aus Chirurgenstahl, darin das
 * Goldgitter, darum die Linien des statischen Feldes. Im Kopf der Seite, also
 * im ersten Bildschirm: kein Einblenden (Bausatz-Regel „der erste Bildschirm
 * ist sofort da“). Die Bewegung ist ein ZUSATZ: ein goldener Puls läuft einmal
 * die Feldlinien entlang, und die Moleküle drehen sich in dieselbe Richtung.
 * Das Endbild steht vom ersten Pixel an.
 */
export function GrafikGitterChip({beschriftungGold, beschriftungStahl, beschriftungFeld}) {
  const X0 = 236;
  const X1 = 404;
  const Y = 160;
  const hoehen = [44, 82, 122];
  const stege = [];
  for (let x = X0 + 10; x < X1 - 4; x += 12) stege.push(x);
  return (
    <svg
      className="gc-grafik gc-grafik--chip"
      viewBox="0 0 640 320"
      role="img"
      aria-label={`Der GitterChip im Querschnitt: ${beschriftungGold} in einer ${beschriftungStahl}, umgeben von den Linien seines statischen Feldes. Die Wassermoleküle im Feld richten sich gleich aus.`}
      data-gc-grafik="chip"
    >
      <g className="gc-feld">
        {hoehen.map((h) => (
          <path key={`o${h}`} className="gc-feld__linie" d={feldlinie(X0, X1, Y - 16, h)} />
        ))}
        {hoehen.map((h) => (
          <path key={`u${h}`} className="gc-feld__linie" d={feldlinie(X0, X1, Y + 16, -h)} />
        ))}
      </g>
      <g className="gc-feld gc-feld--puls" aria-hidden="true">
        {hoehen.map((h, i) => (
          <path
            key={`po${h}`}
            className="gc-feld__puls"
            style={{animationDelay: `${f1(0.3 + i * 0.25)}s`}}
            pathLength="100"
            d={feldlinie(X0, X1, Y - 16, h)}
          />
        ))}
        {hoehen.map((h, i) => (
          <path
            key={`pu${h}`}
            className="gc-feld__puls"
            style={{animationDelay: `${f1(0.45 + i * 0.25)}s`}}
            pathLength="100"
            d={feldlinie(X0, X1, Y + 16, -h)}
          />
        ))}
      </g>
      <rect className="gc-chip__fassung" x={X0 - 18} y={Y - 30} width={X1 - X0 + 36} height="60" rx="14" />
      <rect className="gc-chip__gold" x={X0} y={Y - 12} width={X1 - X0} height="24" rx="3" />
      <g className="gc-chip__gitter">
        {stege.map((x) => (
          <line key={`s${x}`} x1={x} y1={Y - 12} x2={x} y2={Y + 12} />
        ))}
        <line x1={X0} y1={Y} x2={X1} y2={Y} />
      </g>
      {H2O_ORTE.map((m, i) => (
        <H2oZeichen key={`m${i}`} {...m} verzoegerung={f1(0.6 + i * 0.08)} />
      ))}
      <g className="gc-beschriftung">
        <text className="kw-notiz kw-notiz--rechts kw-notiz--stark" x={X0 - 30} y={Y - 4}>
          {beschriftungGold}
        </text>
        <text className="kw-notiz kw-notiz--rechts" x={X0 - 30} y={Y + 18}>
          {beschriftungStahl}
        </text>
        <text className="kw-notiz kw-notiz--links gc-beschriftung__feld" x={X1 + 30} y={Y + 5}>
          {beschriftungFeld}
        </text>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* Die Kette: Feld → Ordnung → Zelle, drei Tafeln in einer Szene             */
/* ------------------------------------------------------------------------ */

function TafelFeld() {
  return (
    <svg className="gc-grafik gc-tafel" viewBox="0 0 240 180" role="img" aria-label="Der GitterChip mit den Ringen seines statischen Feldes" data-gc-grafik="kette-feld">
      {[0, 1, 2].map((i) => (
        <rect
          key={`r${i}`}
          className="gc-tafel__ring"
          style={{animationDelay: `${f1(0.2 + i * 0.25)}s`}}
          x={60 - i * 20}
          y={74 - i * 20}
          width={120 + i * 40}
          height={32 + i * 40}
          rx={16 + i * 20}
        />
      ))}
      <rect className="gc-chip__gold" x="80" y="80" width="80" height="20" rx="3" />
      <g className="gc-chip__gitter">
        {[92, 104, 116, 128, 140, 152].map((x) => (
          <line key={`g${x}`} x1={x} y1="80" x2={x} y2="100" />
        ))}
      </g>
    </svg>
  );
}

const SECHSECK = Array.from({length: 6}, (_, i) => {
  const w = ((60 * i - 90) * Math.PI) / 180;
  return {x: f1(120 + 52 * Math.cos(w)), y: f1(92 + 52 * Math.sin(w))};
});
const STREU = [
  [-40, -24],
  [34, -30],
  [46, 18],
  [22, 40],
  [-36, 34],
  [-50, 6],
];

function TafelOrdnung() {
  return (
    <svg className="gc-grafik gc-tafel" viewBox="0 0 240 180" role="img" aria-label="Sechs Wassermoleküle finden sich zu einem Sechseck zusammen" data-gc-grafik="kette-ordnung">
      <polygon className="gc-tafel__sechseck" points={SECHSECK.map((p) => `${p.x},${p.y}`).join(' ')} />
      {SECHSECK.map((p, i) => (
        <g
          key={`m${i}`}
          className="gc-tafel__h2o"
          style={{
            '--gc-dx': `${STREU[i][0]}px`,
            '--gc-dy': `${STREU[i][1]}px`,
            animationDelay: `${f1(1.1 + i * 0.08)}s`,
          }}
        >
          <circle className="kw-atom-h" cx={p.x - 6} cy={p.y + 7} r="4" />
          <circle className="kw-atom-h" cx={p.x + 6} cy={p.y + 7} r="4" />
          <circle className="kw-atom-o" cx={p.x} cy={p.y} r="8" />
        </g>
      ))}
    </svg>
  );
}

function TafelZelle() {
  const waben = [];
  for (let i = 0; i < 9; i += 1) {
    const cx = 30 + i * 22;
    waben.push({cx, cy: i % 2 ? 106 : 118});
  }
  return (
    <svg className="gc-grafik gc-tafel" viewBox="0 0 240 180" role="img" aria-label="An der Membran einer Zelle wächst eine geordnete Wasserschicht" data-gc-grafik="kette-zelle">
      <path className="gc-tafel__zelle" d="M 8 176 C 60 132, 180 132, 232 176 Z" />
      <path className="gc-tafel__membran" d="M 8 176 C 60 132, 180 132, 232 176" />
      <g className="gc-tafel__schicht" style={{transformOrigin: '20px 120px'}}>
        {waben.map((w) => (
          <polygon
            key={`w${w.cx}`}
            className="kw-zone__wabe"
            points={[0, 60, 120, 180, 240, 300]
              .map((g) => {
                const r = ((g + 30) * Math.PI) / 180;
                return `${f1(w.cx + 11 * Math.cos(r))},${f1(w.cy + 11 * Math.sin(r))}`;
              })
              .join(' ')}
          />
        ))}
      </g>
      {[48, 104, 160].map((x) => (
        <text key={`q${x}`} className="kw-ladung kw-ladung--minus gc-tafel__ladung" x={x} y="80">
          −
        </text>
      ))}
    </svg>
  );
}

const TAFELN = {feld: TafelFeld, ordnung: TafelOrdnung, zelle: TafelZelle};

function Pfeil({nr}) {
  return (
    <svg className="gc-pfeil" viewBox="0 0 48 24" aria-hidden="true" data-gc-pfeil={nr}>
      <path className="gc-pfeil__linie" pathLength="100" d="M 4 12 L 40 12 M 32 5 L 41 12 L 32 19" />
    </svg>
  );
}

/**
 * @param {{glieder: Array<{id: string, titel: string, text: string, quelle: string}>}} props
 */
export function GrafikKette({glieder}) {
  return (
    <div className="gc-kettenbild" data-gc-grafik="kette">
      {glieder.map((g, i) => {
        const Tafel = TAFELN[g.id];
        return (
          <div className="gc-kettenbild__schritt" key={g.id}>
            {i > 0 ? <Pfeil nr={i} /> : null}
            <div className="gc-kettenbild__glied" data-gc-glied={g.id}>
              {Tafel ? <Tafel /> : null}
              <p className="gc-kettenbild__titel">{g.titel}</p>
              <p className="gc-kettenbild__text">{g.text}</p>
              <p className="gc-kettenbild__quelle">{g.quelle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
