import {Fragment, useEffect, useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {THE_ALPHA_KOPF, THE_ALPHA_SCHLUSS} from '~/components/campaign/the-alpha-daten';

/*
 * THE ALPHA PREMIUM: die geteilten Bausteine der gestalteten The-Alpha-Seiten
 * (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-premium-
 * gestaltung). Christian 26.10.2026: „diese Seit ist jetzt 1:1 das was ich
 * gesagt habe, aber das war nicht das Ziel, sondern der Desinger Meister
 * sollte das in eine umwandlen“. Seine Figma-Vorlage gibt Inhalt, Reihenfolge
 * und Aussage vor; die Gestaltung kommt vom Designmeister.
 *
 * GEMEINSAME GESCHICHTE für A, B und C (Nachtrag Christian 26.10.): Kohärentes
 * Licht → Video → Manifestation → Protection → Longevity → 111/111 →
 * Reservieren. Die Varianten setzen diese Bausteine verschieden zusammen
 * (Bildwahl, Länge, Kauf-Element), die Geschichte bleibt gleich.
 *
 * HERO (verbindlich für alle drei): „Kohärentes Licht“ ist die größte Schrift
 * der Seite, darunter klein „- Ultra High Vibe Mode -“. Die Definition steht
 * erst im nächsten Abschnitt (TapDefinition), nicht im Hero.
 *
 * Texte und Bilder kommen aus the-alpha-daten.js (Christians Wortlaut, EINE
 * Datenstelle). Stil: app/styles/the-alpha-premium.css, alle Regeln hängen an
 * .tap-seite. Ohne JavaScript ist alles sichtbar; die ruhigen Einblendungen
 * schaltet erst useTapEinblenden() zu (Klasse tap-js an der Wurzel).
 */

/** Schaltet die Einblendungen zu: Elemente mit data-tap-ein werden sichtbar,
 * sobald sie ins Bild kommen. Einmal sichtbar, bleibt sichtbar (nichts springt
 * beim Zurückscrollen). */
function useTapEinblenden(wurzel) {
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const ziele = el.querySelectorAll('[data-tap-ein]');
    const io = new IntersectionObserver(
      (eintraege) => {
        for (const e of eintraege) {
          if (e.isIntersecting) {
            e.target.classList.add('tap-sichtbar');
            io.unobserve(e.target);
          }
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.12},
    );
    ziele.forEach((z) => io.observe(z));
    el.classList.add('tap-js');
    return () => io.disconnect();
  }, [wurzel]);
}

/** Wurzel jeder gestalteten The-Alpha-Seite. */
export function TapSeite({children, variante = 'a'}) {
  const wurzel = useRef(null);
  useTapEinblenden(wurzel);
  return (
    <div className="tap-seite" data-the-alpha-premium={variante} ref={wurzel}>
      {children}
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

/** Erster Bildschirm, dunkel: „Kohärentes Licht“ groß, Untertitel klein. */
export function TapHero({titel = THE_ALPHA_KOPF.titel, untertitel = THE_ALPHA_KOPF.untertitel}) {
  return (
    <header className="tap-hero tap-nacht">
      <div className="tap-licht" aria-hidden="true" />
      <h1 className="tap-hero-titel">
        {titel}
        <span className="tap-hero-unter">{untertitel}</span>
      </h1>
    </header>
  );
}

/** Christians Definition des Ultra High Vibe Mode, nach dem Hero und ruhig
 * gesetzt. Die erste Zeile der Vorlage wird zur kleinen Überschrift. */
export function TapDefinition({absaetze = THE_ALPHA_KOPF.absaetze}) {
  const [erster, ...rest] = absaetze;
  const kopf = erster[0]?.zeile ? erster[0] : null;
  const ersterRumpf = kopf ? erster.slice(1) : erster;
  return (
    <section className="tap-definition tap-nacht" aria-label="Ultra High Vibe Mode">
      {kopf ? (
        <p className="tap-auge" data-tap-ein="">
          {kopf.text.replace(/\s-(?=\S)/, ' – ')}
        </p>
      ) : null}
      {[ersterRumpf, ...rest].map((teile, i) => (
        <p className="tap-text" key={i} data-tap-ein="">
          {teile.map((t, j) => (
            <Fragment key={j}>{t.fett ? <strong>{t.text}</strong> : t.text}</Fragment>
          ))}
        </p>
      ))}
    </section>
  );
}

/** Vollflächen-Bild ohne Rahmen; die Ränder laufen in den Abschnitt aus. */
export function TapVollbild({bild, ton = 'nacht', format = 'hoch', loading = 'lazy'}) {
  return (
    <figure className={`tap-vollbild tap-${ton} tap-format-${format}`} data-tap-ein="">
      <Bild bild={bild} sizes="100vw" loading={loading} />
    </figure>
  );
}

/** Lucas Video. Solange es fehlt: das ruhige Standbild, nie ein schwarzes
 * Viereck. Mit Video: stumm, inline, Standbild als Poster. */
export function TapFilm({film, ton = 'nacht'}) {
  const {video, videoStandbild} = film;
  if (video?.src) {
    return (
      <figure className={`tap-vollbild tap-${ton} tap-format-hoch`} data-tap-ein="">
        <video
          src={video.src}
          poster={video.poster || videoStandbild.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </figure>
    );
  }
  return <TapVollbild bild={videoStandbild} ton={ton} />;
}

/** Ein Kapitel der Geschichte: große Überschrift, Christians drei Zeilen. */
export function TapKapitel({abschnitt, ton = 'tag', akzent = null, children}) {
  return (
    <section
      className={`tap-kapitel tap-${ton}`}
      id={abschnitt.id}
      aria-labelledby={`${abschnitt.id}-titel`}
    >
      <h2 className="tap-h2" id={`${abschnitt.id}-titel`} data-tap-ein="">
        {abschnitt.titel}
      </h2>
      <ul className="tap-zeilen">
        {abschnitt.zeilen.map((z, i) => (
          <li key={z} data-tap-ein="" style={{'--tap-folge': i}}>
            {z}
          </li>
        ))}
      </ul>
      {akzent ? (
        <p className="tap-akzent" data-tap-ein="">
          {akzent}
        </p>
      ) : null}
      {children}
    </section>
  );
}

/** Zwei Bilder nebeneinander ohne Rahmen (Diamant-Paar). */
export function TapPaar({bilder}) {
  return (
    <div className="tap-paar" data-tap-ein="">
      {bilder.map((b) => (
        <Bild key={b.url} bild={b} sizes="(min-width: 768px) 464px, 288px" />
      ))}
    </div>
  );
}

/** Abschluss, dunkel: Limited 1st. Edition, 111/111, der rote Knopf. */
export function TapEdition({schluss = THE_ALPHA_SCHLUSS, children}) {
  return (
    <section className="tap-edition tap-nacht" aria-label={schluss.edition}>
      <p className="tap-edition-titel" data-tap-ein="">
        {schluss.edition}
      </p>
      <p className="tap-zahl" data-tap-ein="">
        {schluss.auflage}
      </p>
      {children}
      <div data-tap-ein="">
        <TheAlphaKauf className="tap-kauf" knopfText={schluss.knopf} />
      </div>
    </section>
  );
}

export default TapSeite;
