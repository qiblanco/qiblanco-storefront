/**
 * Podcasts.jsx — Darstellung der Podcast-Folgen auf /pages/podcasts.
 *
 * Beide Routen (Seite 1 und Seite N) rendern DIESE Komponente, damit die
 * Seiten nachweislich denselben Aufbau haben und nicht auseinanderlaufen.
 *
 * ZWEI ENTSCHEIDUNGEN, die den Aufbau erklären:
 *
 * 1. LITE-EMBED statt iframe: der YouTube-Player wird erst nach Klick geladen.
 *    Vorher steht nur das echte Poster (i.ytimg.com) im Markup. Das hält die
 *    Seite schnell und lässt keine YouTube-Cookies vor einer Nutzerhandlung
 *    zu. Der Text der Folge steht IMMER im HTML — er ist der Grund, warum es
 *    diese Seite gibt, und darf nie von JavaScript abhaengen.
 *
 * 2. DER TEXT IST KEIN KLAPPINHALT: Beschreibung und Kapitel stehen als
 *    normaler Fliesstext im Dokument, nicht hinter einem Umschalter. Was ein
 *    Crawler nur nach einem Klick saehe, zählt für die Auffindbarkeit nicht.
 */
import {useState} from 'react';

/** Ein Kapitel-Zeitstempel als 1:02:33 bzw. 2:33. */
function zeitText(s) {
  const std = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sek = s % 60;
  const zz = (n) => String(n).padStart(2, '0');
  return std > 0 ? `${std}:${zz(min)}:${zz(sek)}` : `${min}:${zz(sek)}`;
}

function Player({folge}) {
  const [an, setAn] = useState(false);
  if (!folge.id) return null;
  if (an) {
    return (
      <div className="qbp__buehne">
        <iframe
          className="qbp__iframe"
          src={`https://www.youtube-nocookie.com/embed/${folge.id}?autoplay=1&rel=0`}
          title={folge.t}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      className="qbp__buehne qbp__start"
      onClick={() => setAn(true)}
      aria-label={`Folge abspielen: ${folge.t}`}
    >
      <img
        className="qbp__poster"
        src={folge.thumb}
        alt=""
        width="1280"
        height="720"
        loading="lazy"
      />
      <span className="qbp__knopf" aria-hidden="true" />
    </button>
  );
}

function Folge({folge}) {
  return (
    <article className="qbp__folge" id={`folge-${folge.slug}`}>
      <Player folge={folge} />
      <div className="qbp__inhalt">
        <h2 className="qbp__titel">{folge.t}</h2>
        <p className="qbp__meta">
          <time dateTime={folge.d}>{folge.datum}</time>
          <span className="qbp__punkt" aria-hidden="true">·</span>
          {folge.dauer}
        </p>
        <div className="qbp__text" lang={folge.lang}>
          {folge.txt.map((absatz, i) => (
            <p key={i}>{absatz}</p>
          ))}
        </div>
        {folge.kap.length > 0 && (
          <div className="qbp__kapitel">
            <h3 className="qbp__klein">Kapitel</h3>
            <ol>
              {folge.kap.map(([sek, titel]) => (
                <li key={sek}>
                  <a
                    href={`https://www.youtube.com/watch?v=${folge.id}&t=${sek}`}
                    rel="noopener"
                  >
                    <span className="qbp__zeit">{zeitText(sek)}</span>
                    {titel}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
        {folge.prod.length > 0 && (
          <p className="qbp__produkte">
            <span className="qbp__klein">Dazu im Gespräch:</span>
            {folge.prod.map(([pfad, name]) => (
              <a className="qbp__produkt" key={pfad} href={pfad}>
                {name}
              </a>
            ))}
          </p>
        )}
      </div>
    </article>
  );
}

function Gast({gast}) {
  return (
    <article className="qbp__gast">
      <h3 className="qbp__titel qbp__titel--klein">{gast.t}</h3>
      {gast.id && <Player folge={gast} />}
      <div className="qbp__text">
        <p>{gast.txt}</p>
      </div>
    </article>
  );
}

/** Seitennavigation — echte Links, damit ein Crawler ohne JS weiterkommt. */
function Blaettern({daten, pfade}) {
  if (daten.seitenZahl < 2) return null;
  return (
    <nav className="qbp__blaettern" aria-label="Weitere Seiten">
      {daten.vorher ? (
        <a className="qbp__weiter" href={daten.vorher} rel="prev">
          Neuere Folgen
        </a>
      ) : (
        <span />
      )}
      <ol className="qbp__seiten">
        {pfade.map((pfad, i) => {
          const nr = i + 1;
          return (
            <li key={pfad}>
              {nr === daten.nr ? (
                <span aria-current="page">{nr}</span>
              ) : (
                <a href={pfad}>{nr}</a>
              )}
            </li>
          );
        })}
      </ol>
      {daten.nachher ? (
        <a className="qbp__weiter" href={daten.nachher} rel="next">
          Ältere Folgen
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function Podcasts({daten, pfade, gaeste}) {
  const von = (daten.nr - 1) * 10 + 1;
  const bis = von + daten.folgen.length - 1;
  return (
    <div className="lp-a3" data-qbp-route="podcasts">
      <div className="qbp">
        <header className="qbp__kopf">
          <h1 className="qbp__h1">Podcasts von Qi Blanco</h1>
          <p className="qbp__intro">
            Lange Gespräche über Wasser, Frequenzen und den Alltag mit
            Technologie — mit Gründer Christian Bauer und seinen Gästen. Jede
            Folge steht hier mit Beschreibung und Kapiteln, damit du vor dem
            Abspielen weißt, worum es geht.
          </p>
          <p className="qbp__zaehler">
            {daten.nr === 1
              ? `${daten.gesamt} Folgen · neueste zuerst`
              : `Folgen ${von} bis ${bis} von ${daten.gesamt}`}
          </p>
        </header>

        <div className="qbp__liste">
          {daten.folgen.map((f) => (
            <Folge key={f.id} folge={f} />
          ))}
        </div>

        <Blaettern daten={daten} pfade={pfade} />

        {gaeste.length > 0 && (
          <section className="qbp__gaeste">
            <h2 className="qbp__titel">Qi Blanco zu Gast bei anderen</h2>
            <div className="qbp__gastliste">
              {gaeste.map((g, i) => (
                <Gast key={g.id || i} gast={g} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
