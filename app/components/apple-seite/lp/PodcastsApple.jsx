import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import lpApplePodcastsStyles from '~/styles/lp-apple-podcasts.css?url';
import {KursApple} from './KursApple';

/*
 * APPLE-FASSUNG /pages/podcasts und /pages/podcasts/seite-N (Grossjob
 * 20261029-GROSSJOB-alle-shop-seiten-apple-niveau-ausser-seo-geo, s07-r5).
 * Dieselben Daten wie C (components/campaign/Podcasts.jsx, lib/podcast-
 * daten.server.js) und derselbe Text, Wort für Wort: Überschrift, Einleitung,
 * Zähler, Folgen samt Beschreibung und Kapiteln, Gäste. Neu sind nur der
 * Satzspiegel der Apple-Lesefassung (KursApple: Typo-Skala, 8er-Raster, ein
 * Bild-Radius, Weißraum) und Anna am Ende.
 *   return appleSeite?.an ? <PodcastsApple seite={appleSeite.seite} … /> : <Podcasts … />;
 *
 * Was aus C bewusst mitkommt (siehe Kopf von Podcasts.jsx):
 * - Lite-Embed über YoutubeTimestamp, das Poster steht im HTML, der Player
 *   lädt erst nach dem Tipp.
 * - Text und Kapitel stehen als Fließtext im Dokument, nie hinter einem
 *   Umschalter (der Text ist der Grund, warum es die Seite gibt).
 * - `data-fremdtext` an allem, was aus dem YouTube-Schnappschuss oder einem
 *   Gastzitat stammt (der Hausstimme-Detektor schneidet es heraus).
 * - Echte Links zum Blättern, damit ein Crawler ohne JavaScript weiterkommt.
 */

/** Ein Kapitel-Zeitstempel als 1:02:33 bzw. 2:33 (wie C). */
function zeitText(s) {
  const std = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sek = s % 60;
  const zz = (n) => String(n).padStart(2, '0');
  return std > 0 ? `${std}:${zz(min)}:${zz(sek)}` : `${min}:${zz(sek)}`;
}

function Player({folge}) {
  if (!folge.id) return null;
  return (
    <YoutubeTimestamp
      videoId={folge.id}
      titel={folge.t}
      thumbnail={folge.thumb}
      className="as-pod__buehne"
      /* Leerer Inhalt: as-pod__knopf zeichnet das Dreieck selbst (::after). */
      playClassName="as-pod__knopf"
      playInhalt={null}
      zusatzParameter="rel=0"
      noscriptFallback
    />
  );
}

function Folge({folge}) {
  return (
    <article className="as-pod__folge" id={`folge-${folge.slug}`}>
      <Player folge={folge} />
      <div className="as-pod__inhalt">
        <h2 className="as-pod__titel" data-fremdtext="youtube-snapshot">
          {folge.t}
        </h2>
        <p className="as-pod__meta">
          <time dateTime={folge.d}>{folge.datum}</time>
          <span aria-hidden="true"> · </span>
          {folge.dauer}
        </p>
        <div className="as-pod__text" lang={folge.lang}>
          {folge.txt.map((absatz, i) => (
            <p
              key={i}
              data-fremdtext={
                i < (folge.eigen_ab ?? 0) ? 'youtube-snapshot' : undefined
              }
            >
              {absatz}
            </p>
          ))}
        </div>
        {folge.kap.length > 0 && (
          <div className="as-pod__kapitel">
            <h3 className="as-pod__klein">Kapitel</h3>
            <ol>
              {folge.kap.map(([sek, titel]) => (
                <li key={sek}>
                  <a
                    href={`https://www.youtube.com/watch?v=${folge.id}&t=${sek}`}
                    rel="noopener"
                  >
                    <span className="as-pod__zeit">{zeitText(sek)}</span>
                    <span data-fremdtext="youtube-snapshot">{titel}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}
        {folge.prod.length > 0 && (
          <p className="as-pod__produkte">
            <span className="as-pod__klein">Dazu im Gespräch:</span>
            {folge.prod.map(([pfad, name]) => (
              <a className="as-pod__produkt" key={pfad} href={pfad}>
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
  /* Wie C: ohne Video und mit ov=true wird der Eintrag eine Zitat-Karte. */
  const zitatKarte = !gast.id && gast.ov === true;
  return (
    <article
      className={zitatKarte ? 'as-pod__gast as-pod__gast--zitat' : 'as-pod__gast'}
      data-gast-form={zitatKarte ? 'zitat' : 'video'}
    >
      <h3 className="as-pod__gasttitel">{gast.t}</h3>
      {gast.id && <Player folge={gast} />}
      {zitatKarte ? (
        <blockquote className="as-pod__zitat">
          <p data-fremdtext="gastzitat">{gast.txt}</p>
        </blockquote>
      ) : (
        <div className="as-pod__text">
          <p data-fremdtext="gastzitat">{gast.txt}</p>
        </div>
      )}
    </article>
  );
}

function Blaettern({daten, pfade}) {
  if (daten.seitenZahl < 2) return null;
  return (
    <nav className="as-pod__blaettern" aria-label="Weitere Seiten">
      {daten.vorher ? (
        <a className="as-pod__weiter" href={daten.vorher} rel="prev">
          Neuere Folgen
        </a>
      ) : (
        <span />
      )}
      <ol className="as-pod__seiten">
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
        <a className="as-pod__weiter" href={daten.nachher} rel="next">
          Ältere Folgen
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function PodcastsApple({seite, daten, pfade, gaeste}) {
  const von = (daten.nr - 1) * 10 + 1;
  const bis = von + daten.folgen.length - 1;
  return (
    <KursApple seite={seite}>
      <link rel="stylesheet" href={lpApplePodcastsStyles} />
      <div className="as-pod" data-qbp-route="podcasts">
        <header className="as-pod__kopf">
          <h1>Podcasts von Qi Blanco</h1>
          <p className="as-pod__intro">
            Lange Gespräche über Wasser, Frequenzen und den Alltag mit
            Technologie, mit Gründer Christian Bauer und seinen Gästen. Jede
            Folge steht hier mit Beschreibung und Kapiteln, damit du vor dem
            Abspielen weißt, worum es geht.
          </p>
          <p className="as-pod__zaehler">
            {daten.nr === 1
              ? `${daten.gesamt} Folgen · neueste zuerst`
              : `Folgen ${von} bis ${bis} von ${daten.gesamt}`}
          </p>
        </header>

        <div className="as-pod__liste">
          {daten.folgen.map((f) => (
            <Folge key={f.id} folge={f} />
          ))}
        </div>

        <Blaettern daten={daten} pfade={pfade} />

        {gaeste.length > 0 && (
          <section className="as-pod__gaeste">
            <h2 className="as-pod__titel">Qi Blanco zu Gast bei anderen</h2>
            <div className="as-pod__gastliste">
              {gaeste.map((g, i) => (
                <Gast key={g.id || i} gast={g} />
              ))}
            </div>
          </section>
        )}
      </div>
    </KursApple>
  );
}

export default PodcastsApple;
