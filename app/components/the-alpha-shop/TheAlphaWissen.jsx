import {THE_ALPHA_LIGA, THE_ALPHA_WISSEN} from './the-alpha-wissen-daten.js';

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
            {a.bild ? (
              <figure className="taw-bild">
                <img
                  src={`${a.bild.src}&width=1024`}
                  srcSet={`${a.bild.src}&width=512 512w, ${a.bild.src}&width=1024 1024w`}
                  sizes="(min-width: 1024px) 512px, calc(100vw - 32px)"
                  alt={a.bild.alt}
                  width={a.bild.breite}
                  height={a.bild.hoehe}
                  loading="lazy"
                  decoding="async"
                  data-herkunft={a.bild.herkunft}
                />
              </figure>
            ) : null}
            <div className="taw-text">
              <div data-fremdtext={a.wortlaut || undefined}>
                {a.absaetze.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {a.zitat ? (
                <blockquote className="taw-zitat">
                  <p>{a.zitat}</p>
                  {/* <cite>, nicht <footer>: app.css gibt jedem footer
                      50 px Abstand und weiße Schrift (Seiten-Fuß). */}
                  <cite className="taw-zitat-von">{a.zitatVon}</cite>
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
              <h3 className="taw-spalte-titel">{s.titel}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
        <Quellen liste={THE_ALPHA_LIGA.quellen} />
      </section>
    </div>
  );
}

function Kopf({etikett, titel, id}) {
  return (
    <header className="taw-kopf">
      <p className="taw-etikett">{etikett}</p>
      <h2 id={id} className="taw-titel">
        {titel}
      </h2>
    </header>
  );
}

function Quellen({liste}) {
  if (!liste?.length) return null;
  return (
    <ol className="taw-quellen" aria-label="Quellen">
      {liste.map((q) => (
        <li key={q}>{q}</li>
      ))}
    </ol>
  );
}

export default TheAlphaWissen;
