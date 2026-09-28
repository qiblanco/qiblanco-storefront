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
 * - Auslöser (Christian, 28.09.2026: "die Balken fahren zu früh und viel zu
 *   schnell hoch ... es ist schon fertig, obwohl man noch gar nicht wirklich
 *   hingescrollt hat"): beobachtet wird die Balkenfläche samt Grundlinie, nicht
 *   die ganze Figur mit Titel. Start erst, wenn die Fläche voll im Bild ist und
 *   mindestens 15 % über dem unteren Bildschirmrand steht (rootMargin unten
 *   -15 %, Schwelle 0,99). EINMAL (disconnect).
 * - Rückfall für eine Fläche, die höher ist als der Bildschirm (abzüglich der
 *   15 %): sie kann nie voll sichtbar werden. Sie startet, sobald sie 90 % des
 *   Beobachtungsfensters (Bildschirm ohne die unteren 15 %) füllt. Die feinen Stufen (alle 5 %) sorgen dafür, dass der
 *   Beobachter diesen Moment überhaupt meldet.
 * - Tempo (ebenfalls 28.09.2026, "auf 25 % von dem, was es jetzt ist"):
 *   4,8 s je Balken, der zweite 0,72 s später. Vorher 1,2 s und 0,18 s.
 *   Die Figur trägt die Dauer als data-qb-sb-dauer im Server-HTML; daran
 *   misst die Probe den ausgelieferten Stand.
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

const DAUER_MS = 4800;
const VERSATZ_MS = 720;
const SCHWELLE = 0.99;
const FUELLGRAD_HOHE_FLAECHE = 0.9;
const STUFEN = [...Array.from({length: 20}, (_, i) => i / 20), SCHWELLE, 1];

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

    const flaeche = el.querySelector('.qb-balkendiagramm__flaeche') || el;
    const imBild = (e) => {
      if (!e.isIntersecting) return false;
      if (e.intersectionRatio >= SCHWELLE) return true;
      const hoehe = e.rootBounds && e.rootBounds.height;
      return Boolean(hoehe) && e.intersectionRect.height >= hoehe * FUELLGRAD_HOHE_FLAECHE;
    };
    const beobachter = new IntersectionObserver(
      (eintraege) => {
        if (eintraege.some(imBild)) {
          beobachter.disconnect();
          abspielen();
        }
      },
      {threshold: STUFEN, rootMargin: '0px 0px -15% 0px'},
    );
    beobachter.observe(flaeche);
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
    <figure
      className="qb-balkendiagramm"
      data-zustand={zustand}
      data-qb-sb-dauer={DAUER_MS}
      ref={wurzel}
    >
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
