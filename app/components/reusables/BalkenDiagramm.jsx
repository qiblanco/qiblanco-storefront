/**
 * BalkenDiagramm — ein Studien-Balkendiagramm aus dem Bausatz (qb-balkendiagramm).
 *
 * Christian, 23.09.2026: "sobald die Balken in den Sichtbereich kommen, so
 * darstellen, dass die Balken anwachsen und die Prozentzahl mit hoch steigt,
 * also mitzählt." Anwendungsregel: homepage-bauer/baukasten/qb-balkendiagramm/README.md
 *
 * WIE ES GEBAUT IST
 * - Die Endwerte stehen im Server-HTML. Ohne JavaScript, für Suchmaschinen und
 *   für Screenreader (aria-label je Balken) ist das Diagramm fertig.
 * - Erst nach dem Mount setzt die Komponente den Zustand "bereit" (Balken 0,
 *   Zahl 0) — und nur, wenn der Nutzer keine reduzierte Bewegung wünscht und
 *   der Browser IntersectionObserver kennt. Fällt JavaScript aus, bleibt der
 *   Endzustand stehen, nie eine leere Fläche.
 * - Auslöser: IntersectionObserver, 35 % sichtbar, EINMAL (unobserve).
 * - Bewegung: EIN requestAnimationFrame-Takt schreibt je Säule die Variable
 *   --qb-sb-p (0..1). Balken (transform: scaleY) und Zahl (Text + translateY)
 *   lesen dieselbe Variable und bleiben deshalb synchron. Nur transform —
 *   kein Layout, CLS 0.
 * - Die Zahl wird am Textknoten geschrieben (nodeValue), nicht über React-State:
 *   60 Renders je Sekunde je Säule wären teuer, und React hält den Text im
 *   JSX ohnehin auf dem Endwert.
 */
import {Link} from 'react-router';
import {useEffect, useLayoutEffect, useRef, useState} from 'react';

const DAUER_MS = 1200;
const VERSATZ_MS = 180;
const SCHWELLE = 0.35;

const useFruehEffekt = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Deutsche Schreibweise mit fester Stellenzahl: 56.3 -> "56,3". */
export function zahlDe(wert, stellen) {
  return wert.toFixed(stellen).replace('.', ',');
}

function ausrollen(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * @param {{
 *   titel: import('react').ReactNode,
 *   messgroesse: string,
 *   balken: Array<{bezeichnung: string, wert: number, stellen?: number, ton: 'ohne'|'mit'}>,
 *   studieHref: string,
 *   studieZeile: string,
 * }} props
 */
export function BalkenDiagramm({titel, messgroesse, balken, studieHref, studieZeile}) {
  const wurzel = useRef(null);
  const [zustand, setZustand] = useState('fertig');

  useFruehEffekt(() => {
    const el = wurzel.current;
    if (!el || typeof window.IntersectionObserver !== 'function') return undefined;
    const ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (ruhig && ruhig.matches) return undefined;

    const saeulen = [...el.querySelectorAll('[data-qb-sb-wert]')];
    const schreibe = (s, p) => {
      const ziel = Number(s.dataset.qbSbWert);
      const stellen = Number(s.dataset.qbSbStellen);
      s.style.setProperty('--qb-sb-p', String(p));
      const text = s.querySelector('.qb-balkendiagramm__zahl')?.firstChild;
      if (text) text.nodeValue = zahlDe(ziel * p, stellen);
    };
    saeulen.forEach((s) => schreibe(s, 0));
    setZustand('bereit');

    let rahmen = 0;
    const abspielen = () => {
      setZustand('aktiv');
      const start = performance.now();
      const takt = (jetzt) => {
        let offen = false;
        saeulen.forEach((s, i) => {
          const t = ruhig && ruhig.matches ? 1 : (jetzt - start - i * VERSATZ_MS) / DAUER_MS;
          const k = Math.min(1, Math.max(0, t));
          if (k < 1) offen = true;
          schreibe(s, ausrollen(k));
        });
        if (offen) {
          rahmen = requestAnimationFrame(takt);
        } else {
          saeulen.forEach((s) => {
            s.style.removeProperty('--qb-sb-p');
            schreibe(s, 1);
          });
          setZustand('fertig');
        }
      };
      rahmen = requestAnimationFrame(takt);
    };

    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some((e) => e.isIntersecting)) {
          beobachter.disconnect();
          abspielen();
        }
      },
      {threshold: SCHWELLE},
    );
    beobachter.observe(el);
    return () => {
      beobachter.disconnect();
      cancelAnimationFrame(rahmen);
      saeulen.forEach((s) => {
        s.style.removeProperty('--qb-sb-p');
        schreibe(s, 1);
      });
    };
  }, []);

  return (
    <figure className="qb-balkendiagramm" data-zustand={zustand} ref={wurzel}>
      <h3 className="qb-balkendiagramm__titel">{titel}</h3>
      <p className="qb-balkendiagramm__messgroesse">{messgroesse}</p>
      <div className="qb-balkendiagramm__flaeche">
        {balken.map((b) => {
          const stellen = b.stellen ?? 1;
          const text = zahlDe(b.wert, stellen);
          return (
            <Link
              key={b.bezeichnung}
              to={studieHref}
              className={`qb-balkendiagramm__saeule qb-balkendiagramm__saeule--${b.ton}`}
              style={{'--qb-sb-anteil': b.wert / 100}}
              data-qb-sb-wert={b.wert}
              data-qb-sb-stellen={stellen}
              aria-label={`${b.bezeichnung}: ${text} Prozent. Zur Studie`}
            >
              <span className="qb-balkendiagramm__wert" aria-hidden="true">
                <span className="qb-balkendiagramm__zahl">{text}</span> %
              </span>
              <span className="qb-balkendiagramm__balken" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
      <div className="qb-balkendiagramm__achse" aria-hidden="true">
        {balken.map((b) => (
          <span key={b.bezeichnung}>{b.bezeichnung}</span>
        ))}
      </div>
      <figcaption>
        <p className="micro-text qb-balkendiagramm__studie">{studieZeile}</p>
      </figcaption>
    </figure>
  );
}
