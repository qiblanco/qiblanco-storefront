import {useEffect, useId, useRef} from 'react';
import technikKetteStyles from '~/styles/technik-kette.css?url';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {useNaeheLaden} from '~/components/reusables/useNaeheLaden';
import {bildSrcSet, mitBreite} from '../apple-seite-logik';

/*
 * SO WIRKT ER: die Technik der Detailseite in vier Schritten (Auftrag
 * 20261030-update-shop-startseite-detailseite-technologie-wissen-mehr-knopf).
 * Je Schritt: Etikett, Titel, ein kurzer Absatz, ein Bild, Video oder eine
 * Animation, und ein „Mehr“ als <details> mit dem ausführlichen Text.
 * Die Texte stehen in produkt-details/<seite>-daten.js (TECHNIK), hier nur
 * Darstellung. Stil: styles/technik-kette.css, nur --as-*-Tokens.
 *
 * VERTRAG MIT DER PROBE (claude-jobs/<auftrag>/probe_wirkung.py):
 *   li[data-tk-schritt]   ein Schritt, Wert = id
 *   details[data-tk-mehr] das „Mehr“, Text im Server-HTML
 *   [data-tk-medium]      bild | video | animation
 */

/**
 * Kurzes Video ohne Ton in Dauerschleife. Die Quelle hängt erst an, wenn der
 * Schritt in die Nähe kommt (useNaeheLaden, derselbe Maßstab wie die übrigen
 * Videos des Shops); bis dahin steht das Vorschaubild. Bei
 * prefers-reduced-motion bleibt es beim Standbild.
 */
function LoopFilm({medium}) {
  const ref = useRef(null);
  const nah = useNaeheLaden(ref);

  useEffect(() => {
    const video = ref.current;
    if (!video || !nah) return undefined;
    const ruhe = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const anwenden = () => {
      if (ruhe?.matches) {
        video.autoplay = false;
        video.pause();
        return;
      }
      video.autoplay = true;
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    anwenden();
    ruhe?.addEventListener?.('change', anwenden);
    return () => ruhe?.removeEventListener?.('change', anwenden);
  }, [nah]);

  return (
    <video
      ref={ref}
      className="tk-film"
      src={nah ? medium.mp4 : undefined}
      poster={medium.poster}
      width={medium.breite}
      height={medium.hoehe}
      aria-hidden="true"
      data-video-familie="shopify-cdn"
      data-video-ton="stumm"
      muted
      loop
      playsInline
      preload="none"
    />
  );
}

/* Sechseck mit flacher Oberkante um (cx, cy), Radius r. */
function sechseck(cx, cy, r) {
  const p = [];
  for (let i = 0; i < 6; i += 1) {
    const w = (Math.PI / 3) * i;
    p.push(
      `${(cx + r * Math.cos(w)).toFixed(1)},${(cy + r * Math.sin(w)).toFixed(1)}`,
    );
  }
  return p.join(' ');
}

const WABEN = (() => {
  const r = 14;
  const dx = r * 1.5;
  const dy = r * Math.sqrt(3);
  const liste = [];
  for (let s = 0; s < 7; s += 1) {
    for (let z = -1; z < 8; z += 1) {
      liste.push(sechseck(72 + s * dx, 24 + z * dy + (s % 2 ? dy / 2 : 0), r));
    }
  }
  return liste;
})();

const TEILCHEN = [
  [262, 70],
  [300, 150],
  [248, 228],
  [330, 290],
  [284, 312],
  [356, 96],
  [392, 200],
  [420, 268],
];

/**
 * Die geordnete Wasserschicht an der Zelle (Ausschlusszone nach Pollack):
 * links die Zelle, daran wächst die Wabenschicht, innen negativ, davor
 * positiv, gelöste Teilchen weichen nach rechts. Reine SVG-Grafik, die
 * Bewegung kommt aus technik-kette.css und ruht bei prefers-reduced-motion
 * im Endzustand.
 */
function ZoneAnimation({legende}) {
  return (
    <svg
      className="tk-animation"
      viewBox="0 0 480 360"
      role="img"
      aria-label={legende}
    >
      <path className="tk-zelle" d="M0 0 H40 C64 90 64 270 40 360 H0 Z" />
      <g className="tk-zone">
        {WABEN.map((punkte) => (
          <polygon key={punkte} className="tk-wabe" points={punkte} />
        ))}
        {[60, 140, 220, 300].map((y) => (
          <rect
            key={y}
            className="tk-minus"
            x="132"
            y={y}
            width="16"
            height="3"
            rx="1.5"
          />
        ))}
      </g>
      <g className="tk-plus">
        {[90, 180, 270].map((y) => (
          <g key={y}>
            <rect x="222" y={y - 1.5} width="16" height="3" rx="1.5" />
            <rect x="228.5" y={y - 8} width="3" height="16" rx="1.5" />
          </g>
        ))}
      </g>
      <g className="tk-teilchen">
        {TEILCHEN.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" />
        ))}
      </g>
    </svg>
  );
}

function Medium({medium}) {
  if (!medium) return null;
  return (
    <figure className="tk-medium" data-tk-medium={medium.art}>
      <div className={`tk-rahmen tk-rahmen--${medium.art}`}>
        {medium.art === 'video' ? <LoopFilm medium={medium} /> : null}
        {medium.art === 'animation' ? (
          <ZoneAnimation legende={medium.legende} />
        ) : null}
        {medium.art === 'bild' && medium.bild?.url ? (
          <img
            className="tk-bild"
            src={mitBreite(medium.bild.url, 1024)}
            srcSet={bildSrcSet(medium.bild.url, [480, 750, 1024])}
            sizes="(min-width: 600px) 560px, 100vw"
            alt={medium.bild.alt ?? ''}
            width={medium.bild.breite}
            height={medium.bild.hoehe}
            loading="lazy"
            decoding="async"
          />
        ) : null}
      </div>
      {medium.legende ? (
        <figcaption className="tk-legende">
          {mitMarkeR(medium.legende)}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Zahlen({zahlen}) {
  if (!zahlen?.length) return null;
  return (
    <ul className="tk-zahlen">
      {zahlen.map((z) => (
        <li key={z.titel} className="tk-zahl">
          <p className="tk-zahl-titel">{mitMarkeR(z.titel)}</p>
          <dl className="tk-zahl-werte">
            <div className="tk-zahl-zeile">
              <dt>{mitMarkeR('ohne QiOne® 2 Pro')}</dt>
              <dd>{z.ohne}</dd>
              <span
                className="tk-balken"
                style={{
                  '--tk-wert': z.ohne.replace(',', '.').replace(' %', '%'),
                }}
              />
            </div>
            <div className="tk-zahl-zeile tk-zahl-zeile--mit">
              <dt>{mitMarkeR('mit QiOne® 2 Pro')}</dt>
              <dd>{z.mit}</dd>
              <span
                className="tk-balken"
                style={{
                  '--tk-wert': z.mit.replace(',', '.').replace(' %', '%'),
                }}
              />
            </div>
          </dl>
          <p className="tk-zahl-quelle">
            {mitMarkeR(z.einheit)} ·{' '}
            <a href={z.quelle.href} className="tk-quelle-link">
              {mitMarkeR(z.quelle.text)}
            </a>
          </p>
        </li>
      ))}
    </ul>
  );
}

function Mehr({mehr}) {
  if (!mehr) return null;
  return (
    <details className="tk-mehr" data-tk-mehr="">
      <summary className="tk-mehr-knopf">
        <span>{mitMarkeR(mehr.knopf)}</span>
        <span className="as-faq-zeichen" aria-hidden="true" />
      </summary>
      <div className="tk-mehr-inhalt">
        {(mehr.absaetze || []).map((p) => (
          <p key={p} className="as-absatz">
            {mitMarkeR(p)}
          </p>
        ))}
        {mehr.liste ? (
          <>
            <p className="tk-liste-titel">{mitMarkeR(mehr.liste.titel)}</p>
            <dl className="tk-liste">
              {mehr.liste.punkte.map((x) => (
                <div key={x.titel} className="tk-liste-punkt">
                  <dt>{mitMarkeR(x.titel)}</dt>
                  <dd>{mitMarkeR(x.text)}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : null}
        {mehr.quellen?.length ? (
          <ol className="as-quellen" aria-label="Quellen">
            {mehr.quellen.map((q) => (
              <li key={q}>{mitMarkeR(q)}</li>
            ))}
          </ol>
        ) : null}
        {mehr.link?.href ? (
          <a
            className="as-link"
            href={mehr.link.href}
            {...(mehr.link.extern
              ? {target: '_blank', rel: 'noopener noreferrer'}
              : {})}
          >
            {mitMarkeR(mehr.link.text)}
          </a>
        ) : null}
      </div>
    </details>
  );
}

/**
 * @param {{etikett: string, titel: string, schritte: Array<any>}} props
 */
export function TechnikKette({etikett, titel, schritte}) {
  const id = useId();
  if (!schritte?.length) return null;
  return (
    <section className="as-sektion tk" aria-labelledby={id}>
      <link rel="stylesheet" href={technikKetteStyles} />
      {/* data-section je Teil statt am Ganzen: die Seite misst Sektionen an
          [data-section], und vier Schritte am Stück wären ein Block von
          dreitausend Pixeln. Kein Schlüssel mit „lp-“, also kein Pixel-Anker. */}
      <header className="tk-kopf" data-section="as-technik">
        <p className="as-etikett">{mitMarkeR(etikett)}</p>
        <h2 id={id} className="as-h2">
          {mitMarkeR(titel)}
        </h2>
        <ol className="tk-kette">
          {schritte.map((s, i) => (
            <li key={s.id}>
              <a className="tk-kette-glied" href={`#tk-${s.id}`}>
                <span className="tk-kette-nr" aria-hidden="true">
                  {i + 1}
                </span>
                {s.kurzname}
              </a>
            </li>
          ))}
        </ol>
      </header>
      <ol className="tk-schritte">
        {schritte.map((s, i) => (
          <li
            key={s.id}
            id={`tk-${s.id}`}
            className={`tk-schritt${i % 2 ? ' tk-schritt--rechts' : ''}`}
            data-tk-schritt={s.id}
            data-section={`as-technik-${s.id}`}
          >
            <div className="tk-schritt-kopf">
              <p className="as-etikett">{mitMarkeR(s.etikett)}</p>
              <h3 className="tk-h3">{mitMarkeR(s.titel)}</h3>
            </div>
            <Medium medium={s.medium} />
            <div className="tk-schritt-rumpf">
              {(s.kurz || []).map((p) => (
                <p key={p} className="as-absatz tk-kurz">
                  {mitMarkeR(p)}
                </p>
              ))}
              <Zahlen zahlen={s.zahlen} />
              <Mehr mehr={s.mehr} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default TechnikKette;
