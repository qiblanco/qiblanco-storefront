import {Fragment} from 'react';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {
  THE_ALPHA_KOPF,
  THE_ALPHA_VIDEO,
  THE_ALPHA_ABSCHNITTE,
  THE_ALPHA_SCHLUSS,
} from '~/components/campaign/the-alpha-daten';

/*
 * THE ALPHA, Variante A = Christians Figma-Vorlage 1:1 (Z5: „das bie Figma ist
 * meine vorgab … das ist Variante A“). Reihenfolge, Texte und Farben wie in
 * vorlage/the-alpha-figma-x3.png: schwarzer Kopf, Video-Feld, Manifestation,
 * Diamant-Paar, Protection, Produkt-Paar, Longevity, Breitbanner, Limited 1st.
 * Edition 111/111, roter Knopf. Keine eigenen Zusätze. Der Knopf (TheAlphaKauf)
 * führt auf die Kaufseite (Christian Z9/Z10: der Kauf lebt auf der Shopseite).
 *
 * Handy zuerst; ab 640 px bleibt die Spalte schmal und zentriert wie in der
 * Vorlage. Alle Werte aus den Tokens in app/styles/the-alpha.css.
 */

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

function VideoFeld() {
  const {video, videoStandbild} = THE_ALPHA_VIDEO;
  if (video?.src) {
    return (
      <div className="ta-video">
        <video
          src={video.src}
          poster={video.poster || videoStandbild.url}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      </div>
    );
  }
  return (
    <div className="ta-video">
      <Bild
        bild={videoStandbild}
        sizes="(min-width: 640px) 560px, 100vw"
        loading="eager"
      />
    </div>
  );
}

function Kopf() {
  return (
    <header className="ta-kopf">
      <h1 className="ta-kopf-titel">
        {THE_ALPHA_KOPF.titel}
        <span className="ta-kopf-unter">{THE_ALPHA_KOPF.untertitel}</span>
      </h1>
      <div className="ta-kopf-text">
        {THE_ALPHA_KOPF.absaetze.map((teile, i) => (
          <p key={i}>
            {teile.map((t, j) => (
              <Fragment key={j}>
                {t.fett ? <strong>{t.text}</strong> : t.text}
                {t.zeile ? <br /> : null}
              </Fragment>
            ))}
          </p>
        ))}
      </div>
    </header>
  );
}

function Abschnitt({a}) {
  return (
    <>
      <section className="ta-abschnitt" id={a.id} aria-labelledby={`${a.id}-titel`}>
        <h2 className="ta-h2" id={`${a.id}-titel`}>
          {a.titel}
        </h2>
        <ul className="ta-zeilen">
          {a.zeilen.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
      </section>
      {a.bilder ? (
        <div className="ta-paar">
          {a.bilder.map((b) => (
            <Bild key={b.url} bild={b} className="ta-bild" sizes="(min-width: 640px) 272px, 50vw" />
          ))}
        </div>
      ) : null}
      {a.banner ? (
        <div className="ta-banner">
          <Bild bild={a.banner} className="ta-bild" sizes="(min-width: 640px) 560px, 100vw" />
        </div>
      ) : null}
    </>
  );
}

export default function TheAlpha() {
  return (
    <div className="ta-seite">
      <div className="ta-spalte">
        <Kopf />
        <VideoFeld />
        {THE_ALPHA_ABSCHNITTE.map((a) => (
          <Abschnitt key={a.id} a={a} />
        ))}
        <section className="ta-edition" aria-label="Limited 1st. Edition">
          <p className="ta-edition-titel">{THE_ALPHA_SCHLUSS.edition}</p>
          <p className="ta-edition-titel">{THE_ALPHA_SCHLUSS.auflage}</p>
        </section>
        <TheAlphaKauf />
      </div>
    </div>
  );
}
