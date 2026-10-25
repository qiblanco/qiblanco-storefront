import {Fragment} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {TheAlphaLiveAnmeldung} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {Preisanker} from '~/components/reusables/Preisanker';
import {
  THE_ALPHA_KOPF,
  THE_ALPHA_ABSCHNITTE,
  THE_ALPHA_VIDEO,
} from '~/components/campaign/the-alpha-daten';
import {
  TAB_NUTZEN,
  TAB_INHALT,
  TAB_BELEGE,
  TAB_EINWAENDE,
  TAB_PREIS,
  TAB_LIVE,
  TAB_FRAGEN,
} from '~/components/campaign/the-alpha-variante-b-daten';

/*
 * THE ALPHA, Variante B = Server-Fassung (Christian Z5: „der Server soll
 * Vrainte B bauen“), Adresse /pages/The-Alpha-C. Grossjob 20261025-prio1-
 * the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, Segment s04.
 *
 * NUTZEN ZUERST (Christian 25.10.: „WHAT DO I GET!?“): der erste Block sagt in
 * vier Zeilen, was der Mensch bekommt, der den Qi Alpha trägt, je mit
 * sichtbarer Grundlage, und darunter den roten Knopf. Danach in dieser
 * Reihenfolge: Christians Vorlage (Kopftext und drei Säulen aus Variante A),
 * Produkt, Belege, Einwände, Preis mit Gold-Banner, Live-Anmeldung 08.11.,
 * Fragen. Keine Rabattstaffel, keine Vorverkaufstreppe.
 *
 * GLEICHE MARKE, GLEICHE BILDER, GLEICHER KNOPF wie A: Bilder und Christians
 * Wortlaut aus the-alpha-daten.js, der Knopf ist TheAlphaKauf (Import).
 *
 * MESSMARKEN (Probe claude-jobs/<grossjob>/probe_b_the_alpha_c.py):
 * data-tab-nutzen, data-tab-vorteil, data-tab-grundlage, data-tab-vorlage,
 * data-tab-inhalt, data-tab-belege, data-tab-einwaende, data-tab-preis,
 * data-tab-live, data-tab-fragen. Stil: app/styles/the-alpha-variante-b.css.
 */

const [MANIFESTATION, PROTECTION, LONGEVITY] = THE_ALPHA_ABSCHNITTE;

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

function Nutzen() {
  return (
    <section className="tab-nutzen" data-tab-nutzen="" aria-labelledby="tab-nutzen-titel">
      <div className="tab-innen tab-nutzen-raster">
        <div className="tab-nutzen-kopf">
          <p className="tab-auge">{TAB_NUTZEN.auge}</p>
          <h1 className="tab-h1" id="tab-nutzen-titel">
            {TAB_NUTZEN.titel}
          </h1>
        </div>
        <p className="tab-gegenstand">
          {TAB_NUTZEN.gegenstand}{' '}
          <span className="tab-preiszeile">{TAB_NUTZEN.preiszeile}</span>
        </p>
        <div className="tab-nutzen-bild">
          <Bild
            bild={THE_ALPHA_VIDEO.videoStandbild}
            className="tab-bild"
            sizes="(min-width: 1024px) 480px, 112px"
            loading="eager"
          />
        </div>
        <div className="tab-nutzen-rest">
          <ul className="tab-vorteile">
            {TAB_NUTZEN.vorteile.map((v) => (
              <li className="tab-vorteil" key={v.id} data-tab-vorteil={v.id}>
                <span className="tab-vorteil-titel">{v.titel}</span>
                <span className="tab-vorteil-grundlage" data-tab-grundlage="">
                  {v.grundlage}
                </span>
              </li>
            ))}
          </ul>
          <TheAlphaKauf className="tab-kauf" />
          <a className="tab-live-verweis" href={`#${TAB_LIVE.anker}`}>
            {TAB_NUTZEN.liveVerweis}
          </a>
        </div>
      </div>
    </section>
  );
}

function Vorlage() {
  return (
    <section className="tab-vorlage" data-tab-vorlage="" aria-labelledby="tab-vorlage-titel">
      <div className="tab-innen tab-innen-schmal">
        <h2 className="tab-h2 tab-h2-hell" id="tab-vorlage-titel">
          {THE_ALPHA_KOPF.titel}
          <span className="tab-unterzeile">{THE_ALPHA_KOPF.untertitel}</span>
        </h2>
        <div className="tab-vorlage-text">
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
      </div>
      <div className="tab-innen">
        <ul className="tab-saeulen">
          {THE_ALPHA_ABSCHNITTE.map((a) => (
            <li className="tab-saeule" key={a.id}>
              <h3 className="tab-h3 tab-h3-hell">{a.titel}</h3>
              <p className="tab-saeule-zeilen">
                {a.zeilen.map((z) => (
                  <span key={z}>{z}</span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Inhalt() {
  return (
    <section className="tab-inhalt" data-tab-inhalt="" aria-labelledby="tab-inhalt-titel">
      <div className="tab-innen">
        <div className="tab-paar">
          {PROTECTION.bilder.map((b) => (
            <Bild key={b.url} bild={b} className="tab-bild" sizes="(min-width: 640px) 292px, 50vw" />
          ))}
        </div>
        <h2 className="tab-h2" id="tab-inhalt-titel">
          {TAB_INHALT.titel}
        </h2>
        <ul className="tab-punkte">
          {TAB_INHALT.punkte.map((p) => (
            <li className="tab-punkt" key={p.titel}>
              <h3 className="tab-h3">{p.titel}</h3>
              <p className="tab-text">{p.text}</p>
            </li>
          ))}
        </ul>
        <div className="tab-paar">
          {MANIFESTATION.bilder.map((b) => (
            <Bild key={b.url} bild={b} className="tab-bild" sizes="(min-width: 640px) 292px, 50vw" />
          ))}
        </div>
        <div className="tab-banner">
          <Bild bild={LONGEVITY.banner} className="tab-bild" sizes="(min-width: 1024px) 976px, 100vw" />
        </div>
      </div>
    </section>
  );
}

function Belege() {
  return (
    <section className="tab-belege" data-tab-belege="" aria-labelledby="tab-belege-titel">
      <div className="tab-innen">
        <h2 className="tab-h2" id="tab-belege-titel">
          {TAB_BELEGE.titel}
        </h2>
        <ul className="tab-personen">
          {TAB_BELEGE.personen.map((p) => (
            <li className="tab-person" key={p.id} data-tab-beleg={p.id}>
              <figure className="tab-person-foto">
                <img
                  src={`${p.foto.src}&width=640`}
                  srcSet={[320, 640, 960].map((w) => `${p.foto.src}&width=${w} ${w}w`).join(', ')}
                  sizes="(min-width: 768px) 200px, 120px"
                  width={p.foto.b}
                  height={p.foto.h}
                  alt={p.foto.alt}
                  loading="lazy"
                />
                <figcaption className="tab-vermerk">{p.foto.vermerk}</figcaption>
              </figure>
              <div className="tab-person-text">
                <h3 className="tab-h3">{p.name}</h3>
                <p className="tab-text">{p.text}</p>
                {p.link ? (
                  <Link className="tab-verweis" to={p.link.ziel} prefetch="intent">
                    {p.link.text}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Einwaende() {
  return (
    <section className="tab-einwaende" data-tab-einwaende="" aria-labelledby="tab-einwaende-titel">
      <div className="tab-innen">
        <h2 className="tab-h2" id="tab-einwaende-titel">
          {TAB_EINWAENDE.titel}
        </h2>
        <ul className="tab-karten">
          {TAB_EINWAENDE.fragen.map((f) => (
            <li className="tab-karte" key={f.frage}>
              <h3 className="tab-h3">{f.frage}</h3>
              <p className="tab-text">{f.antwort}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * Preis zur Laufzeit aus der Storefront (preis.quelle 'shopify'); ohne
 * Antwort Christians Endpreis als Text, gleiche Form, gleiches Banner.
 */
function Preis({preis}) {
  return (
    <section
      className="tab-preis"
      data-tab-preis=""
      data-preis-quelle={preis ? 'shopify' : 'fest'}
      aria-labelledby="tab-preis-titel"
    >
      <div className="tab-innen tab-innen-schmal">
        <h2 className="tab-h2" id="tab-preis-titel">
          {TAB_PREIS.titel}
        </h2>
        {preis ? (
          <Preisanker preis={preis} nutzer={TAB_PREIS.nutzer} />
        ) : (
          <div className="qb-preisanker" data-qb-preisanker="">
            <p className="qb-preisanker__nutzer">{TAB_PREIS.nutzer}</p>
            <div className="qb-preisanker__preiszeile">
              <span className="tab-festpreis">10.639 €</span>
              <span className="qb-preisanker__banner">Ultimate Power</span>
            </div>
          </div>
        )}
        <ul className="tab-preis-zeilen">
          {TAB_PREIS.zeilen.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
        <TheAlphaKauf className="tab-kauf" />
        <p className="tab-text tab-beratung">
          {TAB_PREIS.beratung.text}{' '}
          <Link className="tab-verweis" to={TAB_PREIS.beratung.ziel} prefetch="intent">
            {TAB_PREIS.beratung.knopf}
          </Link>
        </p>
      </div>
    </section>
  );
}

function Live() {
  return (
    <section
      className="tab-live"
      data-tab-live=""
      id={TAB_LIVE.anker}
      aria-labelledby="tab-live-titel"
    >
      <div className="tab-innen tab-innen-schmal">
        <h2 className="tab-h2 tab-h2-hell" id="tab-live-titel">
          {TAB_LIVE.titel}
        </h2>
        <p className="tab-live-wann">{TAB_LIVE.wann}</p>
        <p className="tab-text tab-text-hell">{TAB_LIVE.text}</p>
        <TheAlphaLiveAnmeldung quelle="the-alpha" variante="B" />
      </div>
    </section>
  );
}

function Fragen() {
  return (
    <section className="tab-fragen" data-tab-fragen="" aria-labelledby="tab-fragen-titel">
      <div className="tab-innen tab-innen-schmal">
        <h2 className="tab-h2" id="tab-fragen-titel">
          {TAB_FRAGEN.titel}
        </h2>
        {TAB_FRAGEN.liste.map((f) => (
          <details className="tab-frage" key={f.frage}>
            <summary className="tab-frage-kopf">{f.frage}</summary>
            <p className="tab-text">{f.antwort}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** @param {{preis: {handle: string, price: object} | null}} props */
export default function TheAlphaVarianteB({preis}) {
  return (
    <div className="tab-seite" data-the-alpha-variante="B">
      <Nutzen />
      <Vorlage />
      <Inhalt />
      <Belege />
      <Einwaende />
      <Preis preis={preis} />
      <Live />
      <Fragen />
    </div>
  );
}
