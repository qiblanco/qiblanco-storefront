import {useEffect, useRef} from 'react';
import {THE_ALPHA_LIGA, THE_ALPHA_WISSEN} from './the-alpha-wissen-daten.js';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {PERIODE_S, POSTER_T, SZENEN, WISSEN_POSTER} from './wissen-animationen.js';

/*
 * WISSENS-STRECKE der Shopseite /products/the-alpha, direkt unter „What's in
 * the Box“ (Christian 26.10.2026, Z150–Z171; Grossjob 20261026-prio1-the-
 * alpha-variante-a-designmeister-premium-gestaltung, Segment s07).
 *
 * Sechs ruhige Abschnitte im Stil der Seite (Tokens aus the-alpha-produkt.css,
 * gleiche Schrift, ein H2-Stil, zentriert wie „What's in the Box“): Etikett im
 * bekannten Stil (schwarzes Schild, weiße Schrift), Überschrift, Bild in der
 * hellen Fläche, Text, Zitat, Quellen als dezente Fußnote (Z170). Handy
 * zuerst: alles untereinander; ab 1024 px Bild und Text nebeneinander, die
 * Seite wechselt je Abschnitt.
 *
 * Eingehängt über die Prop `nachDerBox` von TheAlphaShop (s12).
 */
export function TheAlphaWissen() {
  return (
    <div className="taw" data-the-alpha-wissen="">
      {THE_ALPHA_WISSEN.map((a, i) => (
        <section
          key={a.id}
          className={`taw-abschnitt${a.bild ? '' : ' taw-abschnitt--text'}`}
          data-taw-abschnitt={a.id}
          data-taw-seite={i % 2 ? 'rechts' : 'links'}
          aria-labelledby={`taw-${a.id}`}
        >
          <Kopf etikett={a.etikett} titel={a.titel} id={`taw-${a.id}`} />
          <div className="taw-raster">
            {a.bild ? <WissensBild id={a.id} bild={a.bild} /> : null}
            <div className="taw-text">
              <div data-fremdtext={a.wortlaut || undefined}>
                {a.absaetze.map((p) => (
                  <p key={p}>{mitMarkeR(p)}</p>
                ))}
              </div>
              {a.zitat ? (
                <blockquote className="taw-zitat">
                  <p>{mitMarkeR(a.zitat)}</p>
                  {/* <cite>, nicht <footer>: app.css gibt jedem footer
                      50 px Abstand und weiße Schrift (Seiten-Fuß). */}
                  <cite className="taw-zitat-von">{mitMarkeR(a.zitatVon)}</cite>
                </blockquote>
              ) : null}
              <Quellen liste={a.quellen} />
            </div>
          </div>
        </section>
      ))}

      <section
        className="taw-abschnitt taw-liga"
        data-taw-abschnitt="qi-alpha"
        aria-labelledby="taw-qi-alpha"
      >
        <Kopf
          etikett={THE_ALPHA_LIGA.etikett}
          titel={THE_ALPHA_LIGA.titel}
          id="taw-qi-alpha"
        />
        <div
          className="taw-spalten"
          data-fremdtext={THE_ALPHA_LIGA.wortlaut}
        >
          {THE_ALPHA_LIGA.spalten.map((s) => (
            <div key={s.titel} className="taw-spalte">
              <h3 className="taw-spalte-titel">{mitMarkeR(s.titel)}</h3>
              <p>{mitMarkeR(s.text)}</p>
            </div>
          ))}
        </div>
        <Quellen liste={THE_ALPHA_LIGA.quellen} />
      </section>
    </div>
  );
}

/*
 * Die Zeichnung als Bewegung (Christian 27.10.2026: „diese 4 grafiken auf
 * high end niveau animaitonen umsetzen“). Im Server-HTML steht das Poster,
 * das genau das Startbild der Szene ist; darüber liegt die Leinwand. Sie
 * läuft nur, solange sie im Sichtbereich ist, und bleibt bei reduzierter
 * Bewegung ganz aus: dann bleibt das Poster als Standbild.
 */
function WissensBild({id, bild}) {
  const leinwand = useRef(null);
  const szene = SZENEN[id];
  const poster = WISSEN_POSTER[id];

  useEffect(() => {
    const c = leinwand.current;
    if (!c || !szene) return undefined;
    const ruhe = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (ruhe?.matches) return undefined;
    const ctx = c.getContext('2d');
    if (!ctx) return undefined;

    let kante = 0;
    let raf = 0;
    let start = null;
    let tBasis = POSTER_T[id] ?? 0;
    let sichtbar = false;

    const passe = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const px = Math.round(Math.min(c.clientWidth * dpr, 1200));
      if (px > 0 && px !== kante) {
        kante = px;
        c.width = px;
        c.height = px;
        // Neue Kante leert die Leinwand; steht die Schleife, sofort neu zeichnen.
        if (!raf && c.hasAttribute('data-aktiv')) szene(ctx, kante, tBasis % PERIODE_S);
      }
    };
    const bild = (jetzt) => {
      if (start === null) start = jetzt;
      const t = (tBasis + (jetzt - start) / 1000) % PERIODE_S;
      if (kante) szene(ctx, kante, t);
      if (!c.hasAttribute('data-aktiv')) c.setAttribute('data-aktiv', '');
      raf = requestAnimationFrame(bild);
    };
    const los = () => {
      if (raf || !sichtbar || document.hidden) return;
      passe();
      raf = requestAnimationFrame(bild);
    };
    const halt = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      if (start !== null) tBasis += (performance.now() - start) / 1000;
      start = null;
    };
    const io = new IntersectionObserver(
      ([e]) => {
        sichtbar = e.isIntersecting;
        if (sichtbar) los();
        else halt();
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.15},
    );
    io.observe(c);
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(passe) : null;
    ro?.observe(c);
    const sicht = () => (document.hidden ? halt() : los());
    document.addEventListener('visibilitychange', sicht);
    const ruheWechsel = () => {
      if (!ruhe.matches) return;
      halt();
      io.disconnect();
      c.removeAttribute('data-aktiv');
    };
    ruhe?.addEventListener?.('change', ruheWechsel);
    return () => {
      halt();
      io.disconnect();
      ro?.disconnect();
      document.removeEventListener('visibilitychange', sicht);
      ruhe?.removeEventListener?.('change', ruheWechsel);
    };
  }, [id, szene]);

  const src = poster?.src || bild.src;
  return (
    <figure className="taw-bild taw-anim">
      <img
        src={`${src}&width=1024`}
        srcSet={`${src}&width=512 512w, ${src}&width=1024 1024w`}
        sizes="(min-width: 1024px) 512px, calc(100vw - 32px)"
        alt={poster?.alt || bild.alt}
        width={1024}
        height={1024}
        loading="lazy"
        decoding="async"
        data-herkunft={poster?.herkunft || bild.herkunft}
      />
      {szene ? (
        <canvas
          ref={leinwand}
          className="taw-leinwand"
          data-wissen-anim={id}
          data-poster={src}
          aria-hidden="true"
        />
      ) : null}
    </figure>
  );
}

function Kopf({etikett, titel, id}) {
  return (
    <header className="taw-kopf">
      <p className="taw-etikett">{mitMarkeR(etikett)}</p>
      <h2 id={id} className="taw-titel">
        {mitMarkeR(titel)}
      </h2>
    </header>
  );
}

function Quellen({liste}) {
  if (!liste?.length) return null;
  return (
    <ol className="taw-quellen" aria-label="Quellen">
      {liste.map((q) => (
        <li key={q}>{mitMarkeR(q)}</li>
      ))}
    </ol>
  );
}

export default TheAlphaWissen;
