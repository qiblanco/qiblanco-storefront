import {Fragment, useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {TapTon, TapFilmTon, videoQuellen} from '~/components/campaign/TheAlphaTon';
import {
  THE_ALPHA_KOPF,
  THE_ALPHA_SCHLUSS,
  THE_ALPHA_WOERTERBUCH,
  THE_ALPHA_MARKE,
  THE_ALPHA_KAUF_ZIEL,
} from '~/components/campaign/the-alpha-daten';

/*
 * THE ALPHA PREMIUM: die geteilten Bausteine der gestalteten The-Alpha-Seiten
 * (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung). Christian 26.10.2026: „diese Seit ist jetzt 1:1 das was ich
 * gesagt habe, aber das war nicht das Ziel, sondern der Desinger Meister
 * sollte das in eine umwandlen“. Seine Figma-Vorlage gibt Inhalt, Reihenfolge
 * und Aussage vor; die Gestaltung kommt vom Designmeister.
 *
 * LEITIDEE (Nachtrag Z24–Z57): die Seite ist ein Film. „Ich möchte eine
 * Geschichte erzählen und das soll wie ein Movie ausschauen“, „die ganze
 * Seite ist ja oben schwarz … und dann wird es eingeblendet in weißer
 * Schrift“, „Wir wollen hier Drama erzählen“. Darum: alles auf Schwarz,
 * Szene für Szene, vom Scrollen gesteuert, Bilder als Karten mit Etikett
 * (Figma-Ausschnitte christian-szene-1..4).
 *
 * DREHBUCH für A, B und C: Titelkarte „Kohärentes Licht“ → beim Scrollen
 * „- Ultra High Vibe Mode -“ → Wörterbuch (Pulp Fiction) → Video Luca →
 * Manifestation + RAW/DIAMANT → Protection + ENDLESS/POSSIBILITY → Longevity
 * → Seitenansicht THE ALPHA → „THE ALPHA“ → Limited 1st. Edition 111/111 →
 * roter Balken „Jetzt Exklusiv Reservieren“. Die Varianten setzen diese
 * Bausteine verschieden zusammen (Bildwahl, Länge, Akzent), die Geschichte
 * bleibt gleich. Ton und Video (Segment s06, TheAlphaTon.jsx): TapSeite
 * bringt „Sound on“, Grundsound und Lautsprecher mit; die Szenen tragen ihren
 * Akzent als [data-tap-ton] (Gong am Titel, Klang am Wörterbuch, „bam“ an den
 * Kapiteln, Glanz an der DIAMANT-Karte, tiefer Schlag an THE ALPHA,
 * Schlussakkord an 111/111). Eine Variante bekommt den Ton, indem sie diese
 * Bausteine benutzt.
 *
 * Texte und Bilder kommen aus the-alpha-daten.js (Christians Wortlaut, EINE
 * Datenstelle). Stil: app/styles/the-alpha-premium.css, alle Regeln hängen an
 * .tap-seite. Ohne JavaScript ist alles sichtbar; Einblendungen und
 * Szenenwechsel schaltet erst useTapFilm() zu (Klasse tap-js an der Wurzel).
 */

/**
 * Schaltet den Film zu.
 * - [data-tap-ein]: wird sichtbar, sobald es ins Bild kommt (bleibt sichtbar).
 * - [data-tap-marke]: unsichtbare Marke in einer Bühne [data-tap-buehne];
 *   erreicht sie die obere Bildhälfte, bekommt die Bühne die Klasse
 *   tap-weiter (zweite Einblendung derselben Szene, z. B. der Untertitel).
 * - Kaufleiste: sichtbar, sobald die Titelkarte [data-tap-anfang] aus dem
 *   Bild ist, und wieder weg, solange der Abschluss [data-tap-ende] zu sehen
 *   ist (dort steht der große Knopf).
 */
function useTapFilm(wurzel) {
  const [leiste, setLeiste] = useState(false);
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const beobachter = [];

    const ein = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.classList.add('tap-sichtbar');
            ein.unobserve(e.target);
          }
        }
      },
      {rootMargin: '0px 0px -10% 0px', threshold: 0.15},
    );
    el.querySelectorAll('[data-tap-ein]').forEach((z) => ein.observe(z));
    beobachter.push(ein);

    const marke = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.closest('[data-tap-buehne]')?.classList.add('tap-weiter');
            marke.unobserve(e.target);
          }
        }
      },
      {rootMargin: '0px 0px -45% 0px'},
    );
    el.querySelectorAll('[data-tap-marke]').forEach((z) => marke.observe(z));
    beobachter.push(marke);

    let anfangWeg = false;
    let endeDa = false;
    const kauf = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target.hasAttribute('data-tap-anfang')) {
          anfangWeg = !e.isIntersecting && e.boundingClientRect.top < 0;
        } else {
          // Abschluss im Bild oder schon vorbei (Fußbereich): Leiste weg.
          endeDa = e.isIntersecting || e.boundingClientRect.top < 0;
        }
      }
      setLeiste(anfangWeg && !endeDa);
    });
    el.querySelectorAll('[data-tap-anfang], [data-tap-ende]').forEach((z) => kauf.observe(z));
    beobachter.push(kauf);

    el.classList.add('tap-js');
    return () => beobachter.forEach((b) => b.disconnect());
  }, [wurzel]);
  return leiste;
}

/** Wurzel jeder gestalteten The-Alpha-Seite, mit der dezenten Kaufleiste
 * (Z40: „Wer nicht scrollen will, findet den Kaufknopf“). Die Leiste sitzt
 * oben wie die Produktleiste auf Apple-Seiten: ein schmaler dunkler Streifen,
 * links der Name, rechts der Knopf; unten läge sie auf Bildern und Etiketten
 * (Challenger 26.10., Runde 4). */
export function TapSeite({
  children,
  variante = 'a',
  kaufText = THE_ALPHA_SCHLUSS.knopf,
  etikett = null,
}) {
  const wurzel = useRef(null);
  const leiste = useTapFilm(wurzel);
  return (
    <div
      className="tap-seite"
      data-the-alpha-premium={variante}
      data-tap-etikett={etikett || undefined}
      ref={wurzel}
    >
      {children}
      <TapTon wurzel={wurzel} />
      <div className={`tap-leiste${leiste ? ' tap-leiste-an' : ''}`} aria-hidden={!leiste}>
        <span className="tap-leiste-marke">{THE_ALPHA_MARKE}</span>
        <Link
          className="tap-leiste-knopf"
          to={THE_ALPHA_KAUF_ZIEL}
          prefetch="intent"
          tabIndex={leiste ? undefined : -1}
        >
          {kaufText}
        </Link>
      </div>
    </div>
  );
}

function Bild({bild, sizes, className, loading = 'lazy'}) {
  return (
    <Image
      className={className}
      data={{url: bild.url, altText: bild.alt, width: bild.width, height: bild.height}}
      sizes={sizes}
      loading={loading}
    />
  );
}

/** Szene 1 und 2: Titelkarte auf Schwarz. „Kohärentes Licht“ blendet beim
 * Laden ein, bleibt stehen, und beim Weiterscrollen erscheint darunter
 * „- Ultra High Vibe Mode -“ (eigene Einblendung, Z30/Z31/Z53). */
export function TapTitelkarte({titel = THE_ALPHA_KOPF.titel, untertitel = THE_ALPHA_KOPF.untertitel}) {
  return (
    <header className="tap-titelkarte" data-tap-buehne="" data-tap-anfang="">
      <div className="tap-titelkarte-bild">
        <h1 className="tap-hero-titel" data-tap-ton="gong">
          <span className="tap-hero-zeile">{titel}</span>
          <span className="tap-hero-unter">{untertitel}</span>
        </h1>
      </div>
      <span className="tap-buehne-marke" data-tap-marke="" aria-hidden="true" />
    </header>
  );
}

/** Szene 3: die Definition als Wörterbuch-Eintrag wie im Vorspann von Pulp
 * Fiction (cremeweiße Serifenschrift auf Schwarz, Quelle unten rechts). Die
 * Tafel steht still (sticky) und „poppt auf“, sobald man in die Szene
 * scrollt: erst der Eintrag, dann die zweite Bedeutung, dann die Quelle. */
export function TapWoerterbuch({eintrag = THE_ALPHA_WOERTERBUCH}) {
  const [erste, ...weitere] = eintrag.bedeutungen;
  return (
    <section className="tap-woerterbuch" aria-label={eintrag.lemma} data-tap-buehne="">
      <div className="tap-wb-bild">
        <div className="tap-wb-blatt">
          <p className="tap-wb-satz">
            <b>{eintrag.lemma}</b> <span className="tap-wb-laut">{eintrag.laut}</span>{' '}
            <i>{eintrag.wortart}</i> <b>1.</b> {erste}
          </p>
          {weitere.map((b, i) => (
            <p className="tap-wb-satz" key={b} style={{'--tap-folge': i + 1}}>
              <b>{i + 2}.</b> {b}
            </p>
          ))}
          <p className="tap-wb-quelle" style={{'--tap-folge': weitere.length + 1}}>
            {eintrag.quelle}
          </p>
        </div>
      </div>
      <span className="tap-buehne-marke" data-tap-marke="" data-tap-ton="klang" aria-hidden="true" />
    </section>
  );
}

/** Vollflächen-Bild auf Schwarz, randlos. */
export function TapVollbild({bild, format = 'hoch', loading = 'lazy'}) {
  return (
    <figure className={`tap-vollbild tap-format-${format}`} data-tap-ein="">
      <Bild bild={bild} sizes="100vw" loading={loading} />
    </figure>
  );
}

/** Lucas Video. Solange es fehlt: das ruhige Standbild, nie ein schwarzes
 * Viereck. Mit Video: Poster nach dem Titel, Vorladen in Stufen, Abspielen beim
 * Erreichen der Szene, Pause beim Wegscrollen, inline (TheAlphaTon.jsx).
 * Felder in the-alpha-daten.js THE_ALPHA_VIDEO.video: src (MP4, Pflicht),
 * poster, optional hls (sonst aus der Shopify-CDN-Adresse abgeleitet),
 * untertitel (WebVTT, gezeigt solange der Video-Ton nicht zu hören ist) und
 * ton (true/false; fehlt es, misst der Browser, ob Ton drin ist). */
export function TapFilm({film}) {
  const {video, videoStandbild} = film;
  if (video?.src) {
    const tonFeld = video.ton === true ? 'ja' : video.ton === false ? 'nein' : undefined;
    return (
      <figure className="tap-vollbild tap-format-hoch tap-film" data-tap-ein="" data-tap-film="">
        <video
          data-tap-video=""
          data-tap-video-ton={tonFeld}
          data-tap-poster={video.poster || videoStandbild.url}
          muted
          loop
          playsInline
          preload="none"
          aria-label={videoStandbild.alt}
        >
          {videoQuellen(video).map((q) => (
            <source key={q.src} src={q.src} type={q.type} />
          ))}
          {video.untertitel ? (
            <track kind="captions" src={video.untertitel} srcLang="de" label="Deutsch" default />
          ) : null}
        </video>
        <TapFilmTon />
      </figure>
    );
  }
  return <TapVollbild bild={videoStandbild} />;
}

/** Dreier-Zeile in EINER Zeile (Elina EL-20261027-9707359d): „Starker Schutz
 * · Starke Zellen · Starker Willen“, Mittelpunkt statt Punkt am Ende. Bricht
 * die Zeile am Handy um, darf kein Punkt am Zeilenrand hängen: der Trenner vor
 * dem ersten Wort einer neuen Zeile wird zum harten Umbruch ohne Breite
 * (tap-reihe-bruch), so steht jede Zeile sauber zentriert. Gemessen wird mit
 * allen Trennern sichtbar; der Umbruch ist erzwungen, also springt nach dem
 * Ausblenden nichts zurück. Ohne JavaScript bleibt die Reihe lesbar. */
function useReihenUmbruch(reihe) {
  useEffect(() => {
    const el = reihe.current;
    if (!el) return undefined;
    let breite = -1;
    const messen = () => {
      const trenner = el.querySelectorAll('.tap-reihe-trenner');
      trenner.forEach((t) => t.classList.remove('tap-reihe-bruch'));
      const woerter = el.querySelectorAll('.tap-reihe-wort');
      for (let i = 1; i < woerter.length; i++) {
        if (woerter[i].offsetTop > woerter[i - 1].offsetTop + 2) {
          trenner[i - 1]?.classList.add('tap-reihe-bruch');
        }
      }
    };
    messen();
    document.fonts?.ready?.then(messen);
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width);
      if (w === breite) return;
      breite = w;
      messen();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [reihe]);
}

function TapReihe({zeilen}) {
  const reihe = useRef(null);
  useReihenUmbruch(reihe);
  const woerter = zeilen.map((z) => z.replace(/\.\s*$/, ''));
  return (
    <p className="tap-zeilen tap-reihe" ref={reihe}>
      {woerter.map((w, i) => (
        <Fragment key={w}>
          {i > 0 ? (
            <span
              className="tap-reihe-trenner"
              aria-hidden="true"
              data-tap-ein=""
              style={{'--tap-folge': i + 1}}
            >
              ·
            </span>
          ) : null}
          <span className="tap-reihe-wort" data-tap-ein="" style={{'--tap-folge': i + 1}}>
            {w}
          </span>
        </Fragment>
      ))}
    </p>
  );
}

/** Ein Kapitel: die englische Überschrift kommt mit Wucht („bam, bam, bam“),
 * danach Christians drei Zeilen nacheinander, mit `reihe` in einer Zeile
 * (TapReihe). */
export function TapKapitel({abschnitt, akzent = null, reihe = false, children}) {
  return (
    <section
      className="tap-kapitel"
      id={abschnitt.id}
      aria-labelledby={`${abschnitt.id}-titel`}
    >
      <h2
        className="tap-h2 tap-bam"
        id={`${abschnitt.id}-titel`}
        data-tap-ein=""
        data-tap-ton="bam"
      >
        {abschnitt.titel}
      </h2>
      {reihe ? (
        <TapReihe zeilen={abschnitt.zeilen} />
      ) : (
        <ul className="tap-zeilen">
          {abschnitt.zeilen.map((z, i) => (
            <li key={z} data-tap-ein="" style={{'--tap-folge': i + 1}}>
              {z}
            </li>
          ))}
        </ul>
      )}
      {akzent ? (
        <p className="tap-akzent" data-tap-ein="">
          {akzent}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** Bildkarte mit schwarzem Etikett unten mittig (Figma-Stil). Die
 * DIAMANT-Karte klingt beim Erscheinen (Glanz-Ton, RAW → DIAMANT).
 * Etikett-Stil über TapSeite etikett (Elina EL-20261027-9707359d, Vorschau):
 * 'verlauf' = Variante A, weißes Wort auf weichem schwarzem Verlauf;
 * 'pille' = Variante B, schwarzes Wort in heller Pille mit Haarlinie.
 * Ohne Angabe bleibt der schwarze Balken. Nur CSS (tap-karte-etikett). */
function Karte({bild, sizes, folge = 0, format = 'quadrat'}) {
  const glanz = /diamant/i.test(bild.etikett || '');
  return (
    <figure
      className={`tap-karte tap-karte-${format}${bild.etikett ? ' tap-karte-etikett' : ''}`}
      data-tap-ein=""
      data-tap-ton={glanz ? 'glanz' : undefined}
      data-tap-ton-verzug={glanz ? folge * 180 : undefined}
      style={{'--tap-folge': folge}}
    >
      <Bild bild={bild} sizes={sizes} />
      {bild.etikett ? <figcaption className="tap-etikett">{bild.etikett}</figcaption> : null}
    </figure>
  );
}

/** Zwei Karten: am Handy untereinander, ab 768 px nebeneinander; die zweite
 * kommt nach der ersten (RAW → DIAMANT, ENDLESS → POSSIBILITY). */
export function TapKarten({bilder}) {
  return (
    <div className="tap-karten">
      {bilder.map((b, i) => (
        <Karte key={b.url} bild={b} folge={i * 3} sizes="(min-width: 768px) 560px, 90vw" />
      ))}
    </div>
  );
}

/** Seitenansicht als breite Karte mit Etikett, danach der Name groß auf
 * Schwarz. */
export function TapMarke({bild, marke = THE_ALPHA_MARKE}) {
  return (
    <section className="tap-marke" aria-label={marke}>
      <div className="tap-band">
        <Karte bild={{...bild, etikett: marke}} format="band" sizes="(min-width: 1200px) 1152px, 100vw" />
      </div>
      <div className="tap-marke-szene">
        <p className="tap-marke-name tap-bam" data-tap-ein="" data-tap-ton="tief">
          {marke}
        </p>
      </div>
    </section>
  );
}

/** Abspann: Limited 1st. Edition, 111/111, der rote Balken. */
export function TapEdition({schluss = THE_ALPHA_SCHLUSS, children}) {
  return (
    <section className="tap-edition" aria-label={schluss.edition} data-tap-ende="">
      <p className="tap-edition-titel" data-tap-ein="">
        {schluss.edition}
      </p>
      <p
        className="tap-zahl"
        data-tap-ein=""
        data-tap-ton="schluss"
        data-tap-ton-verzug={360}
        style={{'--tap-folge': 2}}
      >
        {schluss.auflage}
      </p>
      {children}
      <div data-tap-ein="" style={{'--tap-folge': 4}}>
        <TheAlphaKauf className="tap-kauf" knopfText={schluss.knopf} />
      </div>
    </section>
  );
}

export default TapSeite;
