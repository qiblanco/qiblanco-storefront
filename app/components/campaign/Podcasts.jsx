/**
 * Podcasts.jsx — Darstellung der Podcast-Folgen auf /pages/podcasts.
 *
 * Beide Routen (Seite 1 und Seite N) rendern DIESE Komponente, damit die
 * Seiten nachweislich denselben Aufbau haben und nicht auseinanderlaufen.
 *
 * DREI ENTSCHEIDUNGEN, die den Aufbau erklären:
 *
 * 1. LITE-EMBED statt iframe: der YouTube-Player wird erst nach Klick geladen.
 *    Seit 2026-09-11 über den gemeinsamen Baustein YoutubeTimestamp statt über
 *    einen eigenen Zustands-Tausch — die Vorschau bleibt dabei liegen, bis der
 *    Player Bild hat.
 *    Vorher steht nur das echte Poster (i.ytimg.com) im Markup. Das hält die
 *    Seite schnell und lässt keine YouTube-Cookies vor einer Nutzerhandlung
 *    zu. Der Text der Folge steht IMMER im HTML — er ist der Grund, warum es
 *    diese Seite gibt, und darf nie von JavaScript abhaengen.
 *
 * 2. DER TEXT IST KEIN KLAPPINHALT: Beschreibung und Kapitel stehen als
 *    normaler Fliesstext im Dokument, nicht hinter einem Umschalter. Was ein
 *    Crawler nur nach einem Klick saehe, zählt für die Auffindbarkeit nicht.
 *
 * 3. HERKUNFT STEHT IM MARKUP: was aus dem eingefrorenen YouTube-Schnappschuss
 *    kommt, trägt `data-fremdtext`. Diese Seite gibt den Schnappschuss wieder,
 *    sie verfasst ihn nicht — auf qiblanco.com ist er nicht redigierbar, denn
 *    die Datenquelle ist generiert und das Original liegt auf YouTube. Der
 *    Hausstimme-Detektor (homepage-bauer/src/stil_marotten.py) schneidet genau
 *    diese Bereiche heraus, bevor er zählt, und berichtet sie getrennt.
 *    UNSER EIGENER Text auf derselben Seite bleibt MESSBAR: Überschrift,
 *    Einleitung, Zähler, Beschriftungen, die Gast-Titel — und die Absätze ab
 *    `folge.eigen_ab`, die wir für diese Seite geschrieben haben
 *    (Generator-Regel R4, heute drei Folgen auf Seite 4). Fehlt das Feld,
 *    fällt die Marke zur messenden Seite hin aus: dann wird kein einziger
 *    Absatz ausgenommen.
 */
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';

/** Ein Kapitel-Zeitstempel als 1:02:33 bzw. 2:33. */
function zeitText(s) {
  const std = Math.floor(s / 3600);
  const min = Math.floor((s % 3600) / 60);
  const sek = s % 60;
  const zz = (n) => String(n).padStart(2, '0');
  return std > 0 ? `${std}:${zz(min)}:${zz(sek)}` : `${min}:${zz(sek)}`;
}

function Player({folge}) {
  if (!folge.id) return null;
  /*
   * ÄNDERUNG 2026-09-11 (Job 20260911-BAU-videoumschaltung-seite-bricht-beim-
   * play-klick-zusammen): eigener Zustands-Tausch ersetzt durch den EINEN
   * Baustein.
   *
   * Hier stand dieselbe Bauform, die Christian an den anderen Videos
   * beanstandet hat: `if (an) return <div><iframe/></div>` — beim Klick flog
   * der Knopf mitsamt Poster aus dem Baum und ein leerer Rahmen kam hinein.
   * Die Vorschau war weg, bevor der Ersatz Bild hatte.
   *
   * Diese Stelle ist im ersten Durchgang des Jobs ÜBERSEHEN worden: die
   * Bestandsaufnahme suchte nach den bekannten Bausteinnamen, und dieser
   * Player trug keinen davon. Gefunden hat sie erst
   * pruefungen/probe_videoeinbettung_einheitlich.py — die Probe, die nach der
   * EIGENSCHAFT sucht ("ein YouTube-iframe am Baustein vorbei") statt nach
   * Namen. Genau dafür gibt es sie.
   *
   * `thumbnail` ist gesetzt, weil diese Seite ihre Poster-URL mitbringt
   * (folge.thumb) — die YouTube-Posterkette des Bausteins wird dadurch
   * bewusst nicht benutzt, das Bild bleibt exakt dasselbe wie vorher.
   */
  return (
    <YoutubeTimestamp
      videoId={folge.id}
      titel={folge.t}
      thumbnail={folge.thumb}
      className="qbp__buehne qbp__start"
      /* Das Abzeichen behält den Goldkreis dieser Seite: podcasts.css malt
       * ihn auf .qbp__knopf und zeichnet das Dreieck selbst als ::after —
       * deshalb bleibt der Inhalt des Abzeichens hier LEER, sonst stünden
       * zwei Dreiecke übereinander. */
      playClassName="qbp__knopf"
      playInhalt={null}
      zusatzParameter="rel=0"
      noscriptFallback
    />
  );
}

function Folge({folge}) {
  return (
    <article className="qbp__folge" id={`folge-${folge.slug}`}>
      <Player folge={folge} />
      <div className="qbp__inhalt">
        <h2 className="qbp__titel" data-fremdtext="youtube-snapshot">
          {folge.t}
        </h2>
        <p className="qbp__meta">
          <time dateTime={folge.d}>{folge.datum}</time>
          <span className="qbp__punkt" aria-hidden="true">·</span>
          {folge.dauer}
        </p>
        <div className="qbp__text" lang={folge.lang}>
          {folge.txt.map((absatz, i) => (
            <p
              key={i}
              /* Absätze VOR `eigen_ab` stammen aus der YouTube-Beschreibung,
               * die dahinter haben wir selbst geschrieben (R4/R5). Fehlt das
               * Feld, ist `eigen_ab` null und KEIN Absatz wird ausgezeichnet —
               * die Marke fällt dann zur messenden Seite hin aus, nie zur
               * stummen. */
              data-fremdtext={
                i < (folge.eigen_ab ?? 0) ? 'youtube-snapshot' : undefined
              }
            >
              {absatz}
            </p>
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
                    <span data-fremdtext="youtube-snapshot">{titel}</span>
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
  /* ZWEI FORMEN, und die zweite ist eine ENTSCHEIDUNG, kein Zustand:
   * mit Video steht der Player über dem Zitat. Ohne Video (ov=true, vom
   * Generator nur gesetzt, wenn die Quelle das ausdrücklich so entschieden
   * hat — Regel R8) wird der Eintrag eine Zitat-Karte: das Zitat trägt die
   * Karte, kein leerer Rahmen wartet auf ein Video, das der Gastgeber
   * gelöscht hat. Ein Eintrag ohne id UND ohne ov bleibt absichtlich die
   * alte, sichtbar unfertige Form — damit die Rand-Probe ihn weiter findet
   * statt ihn für "bewusst umgebaut" zu halten. */
  const zitatKarte = !gast.id && gast.ov === true;
  return (
    <article
      className={zitatKarte ? 'qbp__gast qbp__gast--zitat' : 'qbp__gast'}
      data-gast-form={zitatKarte ? 'zitat' : 'video'}
    >
      <h3 className="qbp__titel qbp__titel--klein">{gast.t}</h3>
      {gast.id && <Player folge={gast} />}
      {zitatKarte ? (
        <blockquote className="qbp__zitat">
          {/* Wörtlich samt Nennung — siehe unten. */}
          <p data-fremdtext="gastzitat">{gast.txt}</p>
        </blockquote>
      ) : (
        <div className="qbp__text">
          {/* Der Titel darüber ist die Überschrift UNSERER früheren DACH-Seite
           * und bleibt gemessen. Der Text hier ist das Zitat des fremden
           * Gastgebers, wörtlich samt Nennung — ihn zu glätten wäre eine
           * Fälschung. */}
          <p data-fremdtext="gastzitat">{gast.txt}</p>
        </div>
      )}
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
            Technologie, mit Gründer Christian Bauer und seinen Gästen. Jede
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
