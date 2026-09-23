/**
 * DIE GRAFIKEN DER INFO-SEITE „KOHÄRENTES WASSER" — inline-SVG, animiert.
 *
 * Christian, 23.09.2026: „mit sehr guten detaillierten Grafiken, die auch im
 * Idealfall animiert sind, Gimmicks." Gebaut als SVG direkt im Markup, ohne
 * Bilddatei und ohne Video: die Grafik steht im ausgelieferten HTML (Crawler
 * und KI-Leser sehen ihre Beschriftung), sie kostet keinen zweiten Abruf, und
 * sie bleibt auf jedem Bildschirm scharf.
 *
 * KEINE PHYSIKALISCHE ZAHL STEHT IN DIESER DATEI. Jede Zahl, die ein Leser in
 * einer Grafik liest, kommt als Wert herein: die drei Stufen und der Winkel aus
 * app/data/kohaerente-wasserstruktur.js (dem Konsumenten des Brain-SSoT), alles
 * Übrige aus app/data/kohaerentes-wasser-info.js, wo jede Zahl ihre Fundstelle
 * trägt. Was hier steht, sind Zeichenkoordinaten. Der Winkel der Leitgrafik
 * wird aus `grad` GERECHNET, damit Bild und Beschriftung nicht auseinanderlaufen
 * können.
 *
 * BEWEGUNG: jede Animation hängt an einer kw-Klasse, die
 * app/styles/kohaerentes-wasser.css unter `prefers-reduced-motion: reduce`
 * abschaltet. Abgeschaltet steht jedes Bild im Endzustand, nie im halben.
 * Animiert werden nur transform und opacity (kein Layout, kein Repaint der
 * Seite).
 *
 * FARBROLLEN wie im Wasserfenster: Flächen (Atome, Zonen) tragen
 * --qb-akzent, dünne goldene Linien und goldene Schrift --qb-akzent-tinte.
 * Ein zweiter Goldton entsteht hier nicht.
 */

const BOG = Math.PI / 180;
const f1 = (z) => Number(z.toFixed(1));

function punkt(ox, oy, r, richtung) {
  return {
    x: ox + r * Math.cos(richtung * BOG),
    y: oy + r * Math.sin(richtung * BOG),
  };
}

function bogen(ox, oy, r, von, bis) {
  const p = punkt(ox, oy, r, von);
  const q = punkt(ox, oy, r, bis);
  const gross = Math.abs(bis - von) > 180 ? 1 : 0;
  return `M ${f1(p.x)} ${f1(p.y)} A ${r} ${r} 0 ${gross} 1 ${f1(q.x)} ${f1(q.y)}`;
}

function sechseck(cx, cy, r, start = 30) {
  return Array.from({length: 6}, (_, k) => punkt(cx, cy, r, start + k * 60));
}

/** Deterministische Streuung (gleiches Bild auf Server und im Browser). */
function streu(i, faktor) {
  const x = Math.sin((i + 1) * 12.9898 * faktor) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------------ */
/* 1  Die Leitgrafik: das Molekül weitet sich auf, dann ordnet sich der Ring  */
/* ------------------------------------------------------------------------ */

/**
 * Oben der Sauerstoff, darunter die beiden Wasserstoffe. Gezeichnet ist die
 * Endlage (`nach`); die Arme starten um die halbe Differenz gedreht und fahren
 * in die Endlage. Danach setzen sich sechs Nachbarn zu einem Sechseck.
 * Die Aufweitung um wenige Grad wäre neben dem Ring kaum zu sehen; die
 * gestrichelten Geister-Arme zeigen die Ausgangslage deshalb dauerhaft mit.
 */
export function GrafikLeit({von, nach}) {
  const M = {x: 260, y: 160};
  const O = {x: 260, y: 128};
  const R = 80;
  const halbNach = nach.grad / 2;
  const halbVon = von.grad / 2;
  const links = punkt(O.x, O.y, R, 90 + halbNach);
  const rechts = punkt(O.x, O.y, R, 90 - halbNach);
  const geistL = punkt(O.x, O.y, R, 90 + halbVon);
  const geistR = punkt(O.x, O.y, R, 90 - halbVon);
  const weg = (nach.grad - von.grad) / 2;
  const ring = sechseck(M.x, M.y, 136, 0);
  return (
    <svg
      className="kw-grafik kw-grafik--leit"
      viewBox="0 0 520 340"
      role="img"
      aria-label={`Ein Wassermolekül weitet seinen Winkel von ${von.anzeige} auf ${nach.anzeige}. Danach ordnen sich sechs Nachbarmoleküle zu einem Sechseck.`}
      data-kw-grafik="leit"
      data-winkel-von={von.grad}
      data-winkel-nach={nach.grad}
    >
      <g className="kw-leit__ring">
        {ring.map((p, i) => {
          const q = ring[(i + 1) % 6];
          return (
            <line
              key={`rl${i}`}
              className="kw-leit__ringkante"
              style={{animationDelay: `${f1(0.25 + i * 0.12)}s`}}
              x1={f1(p.x)}
              y1={f1(p.y)}
              x2={f1(q.x)}
              y2={f1(q.y)}
            />
          );
        })}
        {ring.map((p, i) => (
          <g
            key={`rn${i}`}
            className="kw-leit__nachbar"
            style={{animationDelay: `${f1(i * 0.12)}s`}}
          >
            <circle
              className="kw-atom-h"
              cx={f1(p.x - 9)}
              cy={f1(p.y + 11)}
              r="6"
            />
            <circle
              className="kw-atom-h"
              cx={f1(p.x + 9)}
              cy={f1(p.y + 11)}
              r="6"
            />
            <circle className="kw-atom-o" cx={f1(p.x)} cy={f1(p.y)} r="13" />
          </g>
        ))}
      </g>
      <line
        className="kw-geist"
        x1={O.x}
        y1={O.y}
        x2={f1(geistL.x)}
        y2={f1(geistL.y)}
      />
      <line
        className="kw-geist"
        x1={O.x}
        y1={O.y}
        x2={f1(geistR.x)}
        y2={f1(geistR.y)}
      />
      <path
        className="kw-leit__bogen-von"
        d={bogen(O.x, O.y, 32, 90 - halbVon, 90 + halbVon)}
      />
      <path
        className="kw-leit__bogen-nach"
        d={bogen(O.x, O.y, 48, 90 - halbNach, 90 + halbNach)}
      />
      <g
        className="kw-leit__arm"
        style={{
          '--kw-dreh': `${-weg}deg`,
          transformOrigin: `${O.x}px ${O.y}px`,
        }}
      >
        <line
          className="kw-bindung"
          x1={O.x}
          y1={O.y}
          x2={f1(links.x)}
          y2={f1(links.y)}
        />
        <circle
          className="kw-atom-h"
          cx={f1(links.x)}
          cy={f1(links.y)}
          r="17"
        />
        <text className="kw-zeichen" x={f1(links.x)} y={f1(links.y)}>
          H
        </text>
      </g>
      <g
        className="kw-leit__arm"
        style={{'--kw-dreh': `${weg}deg`, transformOrigin: `${O.x}px ${O.y}px`}}
      >
        <line
          className="kw-bindung"
          x1={O.x}
          y1={O.y}
          x2={f1(rechts.x)}
          y2={f1(rechts.y)}
        />
        <circle
          className="kw-atom-h"
          cx={f1(rechts.x)}
          cy={f1(rechts.y)}
          r="17"
        />
        <text className="kw-zeichen" x={f1(rechts.x)} y={f1(rechts.y)}>
          H
        </text>
      </g>
      <circle className="kw-atom-o" cx={O.x} cy={O.y} r="27" />
      <text className="kw-zeichen kw-zeichen--auf-akzent" x={O.x} y={O.y}>
        O
      </text>
      <text className="kw-wert kw-wert--akzent" x={O.x} y={O.y + 72}>
        {nach.anzeige}
      </text>
      <text className="kw-notiz kw-notiz--links" x="12" y="334">
        gestrichelt: {von.anzeige} ({von.was})
      </text>
      <text className="kw-notiz kw-notiz--rechts" x="508" y="334">
        kräftig: {nach.anzeige} ({nach.was})
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 2  Das Brückennetz: wechselnd gegen sechseckig                            */
/* ------------------------------------------------------------------------ */

const LOSE = [
  [52, 70],
  [110, 52],
  [168, 84],
  [214, 58],
  [74, 128],
  [138, 138],
  [196, 124],
  [60, 190],
  [122, 196],
  [186, 184],
  [232, 170],
];
const LOSE_KANTEN = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [5, 6],
  [2, 6],
  [4, 7],
  [7, 8],
  [5, 8],
  [8, 9],
  [9, 10],
  [6, 10],
];

/** Zwei verbundene Sechsecke, wie ein Ausschnitt aus dem Eisgitter. */
function wabe(cx, cy, r) {
  const a = sechseck(cx - r * 0.866, cy, r, 30);
  const b = sechseck(cx + r * 0.866, cy, r, 30);
  const knoten = [...a];
  const schluessel = (p) => `${Math.round(p.x)}:${Math.round(p.y)}`;
  const da = new Set(a.map(schluessel));
  b.forEach((p) => {
    if (!da.has(schluessel(p))) knoten.push(p);
  });
  const kanten = [];
  [a, b].forEach((ring) =>
    ring.forEach((p, i) => kanten.push([p, ring[(i + 1) % 6]])),
  );
  return {knoten, kanten};
}

export function GrafikBruecken({links, rechts}) {
  const w = wabe(410, 124, 50);
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 250"
      role="img"
      aria-label={`Links ${links.titel}: ${links.text}. Rechts ${rechts.titel}: ${rechts.text}.`}
      data-kw-grafik="bruecken"
    >
      <text className="kw-titelzeile" x="140" y="22">
        {links.titel}
      </text>
      <text className="kw-titelzeile kw-titelzeile--akzent" x="410" y="22">
        {rechts.titel}
      </text>
      <g className="kw-netz kw-netz--lose">
        {LOSE_KANTEN.map(([a, b], i) => (
          <line
            key={`k${a}-${b}`}
            className="kw-bruecke kw-bruecke--wechselt"
            style={{animationDelay: `${f1(streu(i, 1.7) * 2.4)}s`}}
            x1={LOSE[a][0]}
            y1={LOSE[a][1]}
            x2={LOSE[b][0]}
            y2={LOSE[b][1]}
          />
        ))}
        {LOSE.map(([x, y], i) => (
          <circle
            key={`p${x}-${y}`}
            className="kw-atom-o kw-atom-o--wackelt"
            style={{animationDelay: `${f1(streu(i, 3.1) * 2)}s`}}
            cx={x}
            cy={y}
            r="10"
          />
        ))}
      </g>
      <line className="kw-trenner" x1="280" y1="40" x2="280" y2="220" />
      <g className="kw-netz kw-netz--fest">
        {w.kanten.map(([p, q], i) => (
          <line
            key={`w${i}`}
            className="kw-bruecke kw-bruecke--haelt"
            x1={f1(p.x)}
            y1={f1(p.y)}
            x2={f1(q.x)}
            y2={f1(q.y)}
          />
        ))}
        {w.knoten.map((p) => (
          <circle
            key={`n${Math.round(p.x)}-${Math.round(p.y)}`}
            className="kw-atom-o"
            cx={f1(p.x)}
            cy={f1(p.y)}
            r="10"
          />
        ))}
      </g>
      <text className="kw-notiz" x="140" y="236">
        {links.text}
      </text>
      <text className="kw-notiz" x="410" y="236">
        {rechts.text}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 3  Die kohärente Domäne: einzeln gegen im Gleichtakt                      */
/* ------------------------------------------------------------------------ */

export function GrafikDomaene({energie, groesse, innen, aussen}) {
  const M = {x: 280, y: 126};
  const rDom = 84;
  const dipole = [];
  for (let zeile = 0; zeile < 5; zeile += 1) {
    for (let spalte = 0; spalte < 12; spalte += 1) {
      const x = 32 + spalte * 45 + (zeile % 2 ? 22 : 0);
      const y = 36 + zeile * 44;
      if (x > 540) continue;
      const drin = Math.hypot(x - M.x, y - M.y) < rDom - 12;
      dipole.push({x, y, drin, i: zeile * 12 + spalte});
    }
  }
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 262"
      role="img"
      aria-label={`Außen schwingen einzelne Wassermoleküle ungeordnet (${aussen}). Innen schwingen alle im Gleichtakt: ${innen}, Durchmesser ${groesse}, Energieniveau ${energie}.`}
      data-kw-grafik="domaene"
    >
      <circle className="kw-domaene__feld" cx={M.x} cy={M.y} r={rDom} />
      <circle className="kw-domaene__puls" cx={M.x} cy={M.y} r={rDom} />
      {dipole.map((d) => (
        <g
          key={`d${d.i}`}
          className={
            d.drin ? 'kw-dipol kw-dipol--takt' : 'kw-dipol kw-dipol--frei'
          }
          style={
            d.drin
              ? undefined
              : {
                  animationDelay: `${f1(streu(d.i, 2.3) * -3)}s`,
                  animationDuration: `${f1(2.2 + streu(d.i, 5.7) * 1.8)}s`,
                }
          }
        >
          <line x1={d.x} y1={d.y} x2={d.x} y2={d.y - 15} />
          <circle cx={d.x} cy={d.y} r="6" />
        </g>
      ))}
      <rect
        className="kw-schild"
        x="196"
        y="224"
        width="168"
        height="30"
        rx="8"
      />
      <text className="kw-notiz kw-notiz--stark" x={M.x} y="240">
        {innen}: {energie}
      </text>
      <text className="kw-notiz kw-notiz--links" x="14" y="254">
        {aussen}
      </text>
      <text className="kw-notiz kw-notiz--rechts" x="546" y="254">
        ⌀ {groesse}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 4  Die Ausschlusszone an einer wasserliebenden Oberfläche                */
/* ------------------------------------------------------------------------ */

export function GrafikAusschlusszone({
  oberflaeche,
  zone,
  verdraengt,
  ladungZone,
  ladungWasser,
  breite,
}) {
  const X0 = 64;
  const B = 190;
  const waben = [];
  for (let zeile = 0; zeile < 9; zeile += 1) {
    for (let spalte = 0; spalte < 8; spalte += 1) {
      const cx = X0 + 12 + spalte * 24 + (zeile % 2 ? 12 : 0);
      const cy = 40 + zeile * 21;
      if (cx > X0 + B - 8) continue;
      waben.push(sechseck(cx, cy, 11, 30));
    }
  }
  const teilchen = Array.from({length: 22}, (_, i) => ({
    x: f1(X0 + B + 28 + streu(i, 4.1) * 250),
    y: f1(42 + streu(i, 7.3) * 168),
    r: 5 + Math.round(streu(i, 9.9) * 3),
  }));
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 280"
      role="img"
      aria-label={`${oberflaeche} links. Davor wächst die ${zone} (${ladungZone}), ${breite}. Sie schiebt Teilchen hinaus: ${verdraengt}. Dahinter ist das Wasser ${ladungWasser}.`}
      data-kw-grafik="ausschlusszone"
    >
      <g className="kw-flaeche">
        <rect x="16" y="26" width={X0 - 16} height="204" />
        {Array.from({length: 12}, (_, i) => 30 + i * 17).map((y) => (
          <line
            key={`s${y}`}
            className="kw-flaeche__schraffur"
            x1="18"
            y1={y + 12}
            x2={X0 - 4}
            y2={y}
          />
        ))}
      </g>
      <g className="kw-zone" style={{transformOrigin: `${X0}px 128px`}}>
        <rect className="kw-zone__grund" x={X0} y="26" width={B} height="204" />
        {waben.map((w, i) => (
          <polygon
            key={`h${i}`}
            className="kw-zone__wabe"
            points={w.map((p) => `${f1(p.x)},${f1(p.y)}`).join(' ')}
          />
        ))}
        {[60, 110, 160, 205].map((y, i) => (
          <text
            key={`m${y}`}
            className="kw-ladung kw-ladung--minus"
            x={X0 + 36 + (i % 2) * 70}
            y={y}
          >
            −
          </text>
        ))}
        <line
          className="kw-zone__grenze"
          x1={X0 + B}
          y1="26"
          x2={X0 + B}
          y2="230"
        />
      </g>
      <g className="kw-teilchen">
        {teilchen.map((t, i) => (
          <circle
            key={`t${i}`}
            className="kw-teilchen__kugel"
            style={{animationDelay: `${f1(streu(i, 1.3) * 0.6)}s`}}
            cx={t.x}
            cy={t.y}
            r={t.r}
          />
        ))}
        {[70, 140, 200].map((y, i) => (
          <text
            key={`p${y}`}
            className="kw-ladung kw-ladung--plus"
            x={X0 + B + 60 + i * 84}
            y={y}
          >
            +
          </text>
        ))}
      </g>
      <text className="kw-notiz kw-notiz--links" x="16" y="250">
        {oberflaeche}
      </text>
      <text className="kw-notiz kw-notiz--stark" x={X0 + B / 2} y="18">
        {zone}
      </text>
      <text className="kw-notiz kw-notiz--rechts" x="546" y="18">
        {verdraengt}
      </text>
      <text className="kw-notiz kw-notiz--links" x="16" y="270">
        {breite}
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 5  Licht lässt die Zone wachsen                                           */
/* ------------------------------------------------------------------------ */

function welle(x0, x1, y, amp, laenge) {
  let d = `M ${x0} ${y}`;
  for (let x = x0; x <= x1; x += 4) {
    d += ` L ${x} ${f1(y + amp * Math.sin(((x - x0) / laenge) * 2 * Math.PI))}`;
  }
  return d;
}

export function GrafikLicht({ohne, mit, licht, zusatz}) {
  const zeilen = [
    {y: 60, text: ohne, breit: 70, animiert: false},
    {y: 168, text: mit, breit: 250, animiert: true},
  ];
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 236"
      role="img"
      aria-label={`Oben ${ohne}: eine schmale Zone. Unten ${mit}: die Zone ist deutlich breiter. ${zusatz}`}
      data-kw-grafik="licht"
    >
      {zeilen.map((z) => (
        <g key={`z${z.y}`}>
          <rect
            className="kw-flaeche__block"
            x="16"
            y={z.y - 34}
            width="40"
            height="68"
          />
          <rect
            className={
              z.animiert ? 'kw-balken kw-balken--waechst' : 'kw-balken'
            }
            style={{transformOrigin: `56px ${z.y}px`}}
            x="56"
            y={z.y - 34}
            width={z.breit}
            height="68"
          />
          <text className="kw-notiz kw-notiz--links" x="70" y={z.y + 56}>
            {z.text}
          </text>
        </g>
      ))}
      <path className="kw-welle" d={welle(360, 540, 168, 10, 40)} />
      <path
        className="kw-welle kw-welle--zwei"
        d={welle(360, 540, 150, 7, 40)}
      />
      <text className="kw-notiz kw-notiz--rechts" x="546" y="206">
        {licht}
      </text>
      <line className="kw-trenner" x1="16" y1="114" x2="544" y2="114" />
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 6  Der Größenmaßstab: vom Molekül zur Zone, logarithmisch                 */
/* ------------------------------------------------------------------------ */

/**
 * `marken` tragen ihre Größe in Metern (`meter`) und ihre Beschriftung
 * (`anzeige`, `was`). Die Achse reicht von 0,1 nm bis 1 mm, eine Dekade je
 * gleichem Abstand — sieben Zehnerpotenzen auf einer Linie.
 */
export function GrafikMassstab({marken, achse}) {
  const X0 = 30;
  const X1 = 530;
  const lgMin = -10;
  const lgMax = -3;
  const xVon = (m) =>
    X0 + ((Math.log10(m) - lgMin) / (lgMax - lgMin)) * (X1 - X0);
  const dekaden = Array.from({length: lgMax - lgMin + 1}, (_, k) => lgMin + k);
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 200"
      role="img"
      aria-label={`Größenmaßstab von ${achse[0]} bis ${achse[1]}: ${marken
        .map((m) => `${m.was} ${m.anzeige}`)
        .join(', ')}.`}
      data-kw-grafik="massstab"
    >
      <line className="kw-achse" x1={X0} y1="120" x2={X1} y2="120" />
      {dekaden.map((lg) => {
        const x = X0 + ((lg - lgMin) / (lgMax - lgMin)) * (X1 - X0);
        return (
          <line
            key={`t${lg}`}
            className="kw-achse__strich"
            x1={f1(x)}
            y1="114"
            x2={f1(x)}
            y2="126"
          />
        );
      })}
      <text className="kw-notiz kw-notiz--links" x={X0} y="148">
        {achse[0]}
      </text>
      <text className="kw-notiz kw-notiz--rechts" x={X1} y="148">
        {achse[1]}
      </text>
      {marken.map((m, i) => {
        const x = f1(xVon(m.meter));
        const bis = m.meterBis ? f1(xVon(m.meterBis)) : null;
        const oben = i % 2 === 0;
        return (
          <g
            key={m.was}
            className="kw-marke"
            style={{animationDelay: `${0.3 + i * 0.5}s`}}
          >
            {bis ? (
              <rect
                className="kw-marke__band"
                x={x}
                y="112"
                width={f1(bis - x)}
                height="16"
                rx="4"
              />
            ) : null}
            <circle className="kw-atom-o" cx={x} cy="120" r="8" />
            <line
              className="kw-marke__stiel"
              x1={x}
              y1={oben ? 108 : 132}
              x2={x}
              y2={oben ? 66 : 150}
            />
            <text
              className="kw-notiz kw-notiz--stark"
              x={x}
              y={oben ? 34 : 188}
            >
              {m.was}
            </text>
            <text className="kw-notiz" x={x} y={oben ? 56 : 168}>
              {m.anzeige}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------------ */
/* 7  Das Absorptionsspektrum: das Maximum der Zone                          */
/* ------------------------------------------------------------------------ */

export function GrafikSpektrum({
  maximumNm,
  bereichNm,
  zoneText,
  wasserText,
  achseText,
}) {
  const [nmMin, nmMax] = bereichNm;
  const X0 = 50;
  const X1 = 530;
  const Y0 = 190;
  const xVon = (nm) => X0 + ((nm - nmMin) / (nmMax - nmMin)) * (X1 - X0);
  const kurve = (hoehe, breite, basis) => {
    let d = '';
    for (let nm = nmMin; nm <= nmMax; nm += 4) {
      const y =
        Y0 -
        basis(nm) -
        hoehe * Math.exp(-((nm - maximumNm) ** 2) / (2 * breite ** 2));
      d += `${d ? ' L' : 'M'} ${f1(xVon(nm))} ${f1(y)}`;
    }
    return d;
  };
  const abfall = (nm) => 30 * Math.exp(-(nm - nmMin) / 40);
  const xMax = f1(xVon(maximumNm));
  return (
    <svg
      className="kw-grafik"
      viewBox="0 0 560 236"
      role="img"
      aria-label={`${achseText}: ${zoneText} mit einem Maximum bei ${maximumNm} Nanometern, ${wasserText} ohne dieses Maximum.`}
      data-kw-grafik="spektrum"
    >
      <line className="kw-achse" x1={X0} y1={Y0} x2={X1} y2={Y0} />
      <line className="kw-achse" x1={X0} y1={Y0} x2={X0} y2="24" />
      {[nmMin, maximumNm, nmMax].map((nm) => (
        <text key={`nm${nm}`} className="kw-notiz" x={f1(xVon(nm))} y={Y0 + 20}>
          {nm} nm
        </text>
      ))}
      <path className="kw-kurve kw-kurve--wasser" d={kurve(0, 30, abfall)} />
      <path className="kw-kurve kw-kurve--zone" d={kurve(120, 26, abfall)} />
      <line className="kw-marke__stiel" x1={xMax} y1="40" x2={xMax} y2={Y0} />
      <text className="kw-notiz kw-notiz--stark" x={xMax} y="30">
        {zoneText}
      </text>
      <text className="kw-notiz kw-notiz--rechts" x={X1} y={Y0 - 20}>
        {wasserText}
      </text>
      <text className="kw-notiz kw-notiz--links" x={X0} y="232">
        {achseText}
      </text>
    </svg>
  );
}
