import {useEffect, useLayoutEffect, useRef, useState} from 'react';

/**
 * DIE GRAFIKEN DER SEITE /pages/forschung: der Weg in drei Stufen (Kopf), die
 * Leiter der Reproduzierbarkeit, der Schutzgrad je Zellart und der
 * Versuchsaufbau über die Ferne. Dazu die Szene, die jede Grafik genau einmal
 * abspielt.
 *
 * DIE SZENE folgt dem Rezept der GitterChip-Seite (GcGrafiken.jsx) und des
 * Bausatz-Balkendiagramms, drei Zustände:
 *   fertig  im Server-HTML und ohne JavaScript: das Endbild, nichts bewegt sich.
 *   bereit  nach dem Mount: das Startbild, die Animation steht angehalten.
 *   aktiv   sobald die Szene zu 30 % im Bild ist: die Animation läuft EINMAL.
 * Wer reduzierte Bewegung wünscht oder keinen IntersectionObserver hat, bleibt
 * auf „fertig“. Eine eigene Szene statt der aus GcGrafiken.jsx, weil jene ihre
 * Klassen und Datenattribute auf die GitterChip-Seite zuschneidet.
 *
 * Die Bewegung selbst steht in app/styles/forschung.css unter dem Zustand:
 * nur transform, opacity und stroke-dashoffset. Kein Satz steht in dieser
 * Datei; jede Beschriftung kommt als Wert aus app/data/forschung-seite.js.
 */

const SCHWELLE = 0.3;
const useFruehEffekt = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function Szene({name, legende, titel, className = '', children}) {
  const wurzel = useRef(null);
  const [zustand, setZustand] = useState('fertig');

  useFruehEffekt(() => {
    const el = wurzel.current;
    if (!el || typeof window.IntersectionObserver !== 'function') return undefined;
    const ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
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
      className={`fo-szene ${className}`.trim()}
      data-fo-szene={name}
      data-zustand={zustand}
    >
      {titel ? <p className="fo-szene__titel">{titel}</p> : null}
      {children}
      {legende ? <figcaption>{legende}</figcaption> : null}
    </figure>
  );
}

const f1 = (z) => Number(z.toFixed(1));

/** Punkt einer quadratischen Kurve bei t. */
function aufKurve(p0, c, p2, t) {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1]];
}

/** Die drei Abschnitte des Weges, glatt aneinander (gleiche Tangente an jeder Naht). */
const WEG_TEILE = [
  {p0: [40, 222], c: [130, 222], p2: [220, 172]},
  {p0: [220, 172], c: [310, 122], p2: [400, 118]},
  {p0: [400, 118], c: [490, 114], p2: [580, 52]},
];

/**
 * Der Weg in drei Stufen. Jede Stufe beginnt an ihrer Nummer, am Ende steht
 * die Erde für „weltweit“. Die Grundlinie steht ganz, Gold ist der gegangene
 * Teil von Stufe 1 (`stand` zwischen 0 und 1, aus den Sprossen berechnet).
 * Im ersten Bildschirm: das Endbild steht vom ersten Pixel an, die Bewegung
 * ist ein Zusatz (ein Lichtpuls läuft einmal den goldenen Teil entlang, der
 * Standpunkt pulsiert einmal).
 */
export function GrafikWeg({stufen, stand, hier}) {
  const [a] = WEG_TEILE;
  const t = Math.min(1, Math.max(0, stand));
  const knick = [a.p0[0] + t * (a.c[0] - a.p0[0]), a.p0[1] + t * (a.c[1] - a.p0[1])];
  const punkt = aufKurve(a.p0, a.c, a.p2, t).map(f1);
  const grund = `M ${a.p0[0]} ${a.p0[1]} ${WEG_TEILE.map((w) => `Q ${w.c[0]} ${w.c[1]} ${w.p2[0]} ${w.p2[1]}`).join(' ')}`;
  const gold = `M ${a.p0[0]} ${a.p0[1]} Q ${f1(knick[0])} ${f1(knick[1])} ${punkt[0]} ${punkt[1]}`;
  const [erde] = WEG_TEILE.slice(-1).map((w) => w.p2);
  return (
    <svg
      className="fo-grafik fo-grafik--weg"
      viewBox="0 0 640 250"
      role="img"
      aria-label={`Ein Weg in drei Stufen: ${stufen.map((s) => `${s.nr} ${s.name}`).join(', ')}. ${hier}: in Stufe 1.`}
      data-fo-grafik="weg"
    >
      <path className="fo-weg__grund" d={grund} />
      <path className="fo-weg__gold" d={gold} />
      <path className="fo-weg__puls" d={gold} pathLength="100" aria-hidden="true" />
      {WEG_TEILE.map((w, i) => (
        <g key={stufen[i].nr} className="fo-weg__knoten">
          <circle cx={w.p0[0]} cy={w.p0[1]} r="22" />
          <text x={w.p0[0]} y={w.p0[1] + 8} textAnchor="middle">
            {stufen[i].nr}
          </text>
        </g>
      ))}
      <g className="fo-weg__erde" aria-hidden="true">
        <circle cx={erde[0]} cy={erde[1]} r="26" />
        <ellipse cx={erde[0]} cy={erde[1]} rx="11" ry="26" />
        <path d={`M ${erde[0] - 26} ${erde[1]} H ${erde[0] + 26}`} />
        <path d={`M ${erde[0] - 22} ${erde[1] - 13} H ${erde[0] + 22} M ${erde[0] - 22} ${erde[1] + 13} H ${erde[0] + 22}`} />
      </g>
      <circle className="fo-weg__ring" cx={punkt[0]} cy={punkt[1]} r="16" aria-hidden="true" />
      <circle className="fo-weg__punkt" cx={punkt[0]} cy={punkt[1]} r="9" />
    </svg>
  );
}

/**
 * Die Leiter der Reproduzierbarkeit. Sprosse 1 steht unten; erreichte
 * Sprossen sind gold, offene gestrichelt. Die Sprosse, auf der wir stehen,
 * trägt die Marke `hier`.
 */
export function Leiter({sprossen, standText, hier}) {
  const oben = sprossen.filter((s) => s.stand === 'erreicht').length;
  return (
    <ol className="fo-leiter" data-fo-leiter="">
      {sprossen.map((s) => (
        <li
          key={s.nr}
          className={`fo-leiter__sprosse ist-${s.stand}`}
          data-fo-sprosse={s.nr}
          data-stand={s.stand}
          style={{'--fo-i': s.nr}}
        >
          <span className="fo-leiter__bild" aria-hidden="true">
            <span className="fo-leiter__stab" />
          </span>
          <span className="fo-leiter__text">
            <span className="fo-leiter__kopf">
              <span className="fo-leiter__nr">{s.nr}</span> {s.titel}
            </span>
            <span className="fo-leiter__satz">{s.text}</span>
            <span className="fo-leiter__stand">
              {standText[s.stand]}
              {s.nr === oben ? <span className="fo-leiter__hier">{hier}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Schutzgrad je Zellart als waagrechte Balken, Maßstab 0 bis 50 %. */
export function GrafikZellarten({werte}) {
  const max = 50;
  return (
    <ul className="fo-zellarten" data-fo-grafik="zellarten">
      {werte.map((w, i) => (
        <li key={w.name} className="fo-zellarten__zeile">
          <span className="fo-zellarten__name">{w.name}</span>
          <span className="fo-zellarten__bahn" aria-hidden="true">
            <span
              className="fo-zellarten__balken"
              style={{'--fo-anteil': f1(Math.min(1, w.wert / max) * 1000) / 1000, '--fo-i': i}}
            />
          </span>
          <span className="fo-zellarten__wert">{w.anzeige}</span>
        </li>
      ))}
    </ul>
  );
}

/** Ein Inkubator als Zeichen: Kasten mit drei Zellen darin. */
function Inkubator({x, y, klasse}) {
  return (
    <g className={klasse}>
      <rect x={x} y={y} width="96" height="88" rx="8" />
      <circle cx={x + 28} cy={y + 50} r="10" />
      <circle cx={x + 50} cy={y + 36} r="10" />
      <circle cx={x + 70} cy={y + 56} r="10" />
    </g>
  );
}

/**
 * Der Versuchsaufbau der QiHome®-Air-Studie: das Gerät, etwa zwei Meter
 * daneben der Inkubator mit den Zellen, weit entfernt die Kontrolle. Die
 * Wellen laufen einmal vom Gerät zu den Zellen.
 */
export function GrafikAbstand({produkt, zellen, kontrolle, nah, fern}) {
  return (
    <svg
      className="fo-grafik fo-grafik--abstand"
      viewBox="0 0 640 230"
      role="img"
      aria-label={`${produkt}, ${nah} daneben die ${zellen}, ${fern} entfernt die ${kontrolle}.`}
      data-fo-grafik="abstand"
    >
      <g className="fo-abstand__quelle">
        <rect x="40" y="70" width="60" height="112" rx="10" />
        <circle cx="70" cy="104" r="12" />
      </g>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          className="fo-abstand__welle"
          style={{'--fo-i': i}}
          d={`M ${122 + i * 30} ${96 - i * 10} Q ${146 + i * 36} 126 ${122 + i * 30} ${156 + i * 10}`}
        />
      ))}
      <g className="fo-abstand__mass">
        <path d="M 100 44 H 250 M 100 36 V 52 M 250 36 V 52" />
        <text x="175" y="30" textAnchor="middle">
          {nah}
        </text>
      </g>
      <Inkubator x={250} y={82} klasse="fo-abstand__inkubator" />
      <g className="fo-abstand__ferne">
        <path d="M 366 126 H 490" />
        <path className="fo-abstand__bruch" d="M 418 112 L 428 140 M 430 112 L 440 140" />
        <text x="429" y="100" textAnchor="middle">
          {fern}
        </text>
      </g>
      <Inkubator x={504} y={82} klasse="fo-abstand__inkubator fo-abstand__inkubator--kontrolle" />
      <g className="fo-abstand__namen">
        <text x="70" y="214" textAnchor="middle">
          {produkt}
        </text>
        <text x="298" y="214" textAnchor="middle">
          {zellen}
        </text>
        <text x="552" y="214" textAnchor="middle">
          {kontrolle}
        </text>
      </g>
    </svg>
  );
}
