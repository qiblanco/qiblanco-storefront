import {Fragment, useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {TheAlphaKauf} from '~/components/campaign/TheAlphaKauf';
import {TheAlphaLiveAnmeldung} from '~/components/campaign/TheAlphaLiveAnmeldung';
import {
  THE_ALPHA_KOPF,
  THE_ALPHA_ABSCHNITTE,
  THE_ALPHA_VIDEO,
} from '~/components/campaign/the-alpha-daten';
import {
  TAC_HELD,
  TAC_NUTZEN,
  TAC_INHALT,
  TAC_BELEGE,
  TAC_ABSCHLUSS,
  TAC_LIVE,
  TAC_FRAGEN,
  TAC_STICKY,
} from '~/components/campaign/the-alpha-variante-c-daten';

/*
 * THE ALPHA, Variante C = KI-optimierte Fassung (Christian Z5: „noch eine
 * Variante C (AI OPtimiert“), Adresse /pages/The-Alpha-B (Z6). Grossjob
 * 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s05.
 *
 * AUFGEBAUT AUS DEN DATEN DES SERVERS (Beleg je Abweichung von A im
 * Segment-RESULT): oben das Produkt groß, die Antwort im Kundenwort, Preis,
 * Knopf und die Rückgabe direkt unter dem Knopf; danach was man bekommt,
 * Christians Vorlage, das Produkt, die Belege als Abschluss vor dem Preis,
 * Live-Anmeldung, Fragen. Drei Knöpfe im Inhalt und ein fester Knopf mobil,
 * alle derselbe Baustein.
 *
 * GLEICHE MARKE, GLEICHE BILDER, GLEICHER KNOPF wie A: Bilder und Christians
 * Wortlaut aus the-alpha-daten.js, der Knopf ist TheAlphaKauf (Import).
 *
 * MESSMARKEN (Probe claude-jobs/<grossjob>/probe_c_the_alpha_b.py):
 * data-tac-held, data-tac-nutzen, data-tac-vorteil, data-tac-grundlage,
 * data-tac-vorlage, data-tac-inhalt, data-tac-belege, data-tac-abschluss,
 * data-tac-live, data-tac-fragen, data-tac-sticky; Wurzel
 * data-the-alpha-variante="C".
 * Stil: app/styles/the-alpha-variante-c.css.
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

function Held() {
  return (
    <section className="tac-held" data-tac-held="" aria-labelledby="tac-held-titel">
      <div className="tac-innen tac-held-raster">
        <div className="tac-held-bild">
          <Bild
            bild={THE_ALPHA_VIDEO.videoStandbild}
            className="tac-bild"
            sizes="(min-width: 1024px) 480px, 280px"
            loading="eager"
          />
        </div>
        <div className="tac-held-text">
          <p className="tac-auge">{TAC_HELD.auge}</p>
          <h1 className="tac-h1" id="tac-held-titel">
            {TAC_HELD.titel}
          </h1>
          <p className="tac-gegenstand">{TAC_HELD.gegenstand}</p>
          <p className="tac-preiszeile">{TAC_HELD.preiszeile}</p>
          <TheAlphaKauf className="tac-kauf" />
          <ul className="tac-sicher" data-tac-sicher="">
            {TAC_HELD.sicher.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Nutzen() {
  return (
    <section className="tac-nutzen" data-tac-nutzen="" aria-labelledby="tac-nutzen-titel">
      <div className="tac-innen">
        <h2 className="tac-h2" id="tac-nutzen-titel">
          {TAC_NUTZEN.titel}
        </h2>
        <ul className="tac-vorteile">
          {TAC_NUTZEN.vorteile.map((v) => (
            <li className="tac-vorteil" key={v.id} data-tac-vorteil={v.id}>
              <span className="tac-vorteil-titel">{v.titel}</span>
              <span className="tac-vorteil-grundlage" data-tac-grundlage="">
                {v.grundlage}
              </span>
            </li>
          ))}
        </ul>
        <TheAlphaKauf className="tac-kauf" />
      </div>
    </section>
  );
}

function Vorlage() {
  return (
    <section className="tac-vorlage" data-tac-vorlage="" aria-labelledby="tac-vorlage-titel">
      <div className="tac-innen tac-innen-schmal">
        <h2 className="tac-h2 tac-h2-hell" id="tac-vorlage-titel">
          {THE_ALPHA_KOPF.titel}
          <span className="tac-unterzeile">{THE_ALPHA_KOPF.untertitel}</span>
        </h2>
        <div className="tac-vorlage-text">
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
      <div className="tac-innen">
        <ul className="tac-saeulen">
          {THE_ALPHA_ABSCHNITTE.map((a) => (
            <li className="tac-saeule" key={a.id}>
              <h3 className="tac-h3 tac-h3-hell">{a.titel}</h3>
              <p className="tac-saeule-zeilen">
                {a.zeilen.map((z, i) => (
                  <Fragment key={z}>
                    {i > 0 ? <br /> : null}
                    {z}
                  </Fragment>
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
    <section className="tac-inhalt" data-tac-inhalt="" aria-labelledby="tac-inhalt-titel">
      <div className="tac-innen">
        <h2 className="tac-h2" id="tac-inhalt-titel">
          {TAC_INHALT.titel}
        </h2>
        <div className="tac-paar">
          {PROTECTION.bilder.map((b) => (
            <Bild key={b.url} bild={b} className="tac-bild" sizes="(min-width: 640px) 292px, 50vw" />
          ))}
        </div>
        <ul className="tac-punkte">
          {TAC_INHALT.punkte.map((p) => (
            <li className="tac-punkt" key={p.titel}>
              <h3 className="tac-h3">{p.titel}</h3>
              <p className="tac-text">{p.text}</p>
            </li>
          ))}
        </ul>
        <div className="tac-paar">
          {MANIFESTATION.bilder.map((b) => (
            <Bild key={b.url} bild={b} className="tac-bild" sizes="(min-width: 640px) 292px, 50vw" />
          ))}
        </div>
        <div className="tac-banner">
          <Bild bild={LONGEVITY.banner} className="tac-bild" sizes="(min-width: 832px) 800px, 100vw" />
        </div>
      </div>
    </section>
  );
}

function Belege() {
  return (
    <section className="tac-belege" data-tac-belege="" aria-labelledby="tac-belege-titel">
      <div className="tac-innen">
        <h2 className="tac-h2" id="tac-belege-titel">
          {TAC_BELEGE.titel}
        </h2>
        <ul className="tac-personen">
          {TAC_BELEGE.personen.map((p) => (
            <li className="tac-person" key={p.id} data-tac-beleg={p.id}>
              <figure className="tac-person-foto">
                <img
                  src={`${p.foto.src}&width=320`}
                  srcSet={[160, 240, 320, 480].map((w) => `${p.foto.src}&width=${w} ${w}w`).join(', ')}
                  sizes="(min-width: 768px) 160px, 120px"
                  width={p.foto.b}
                  height={p.foto.h}
                  alt={p.foto.alt}
                  loading="lazy"
                />
                <figcaption className="tac-vermerk">{p.foto.vermerk}</figcaption>
              </figure>
              <div className="tac-person-text">
                <h3 className="tac-h3">{p.name}</h3>
                <p className="tac-text">{p.text}</p>
                {p.link ? (
                  <Link className="tac-verweis" to={p.link.ziel} prefetch="intent">
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

/** Ganze Beträge ohne Nachkommastellen, echte Cents centgenau. */
function betrag({amount, currencyCode}) {
  const zahl = Number(amount);
  const ganz = Number.isInteger(zahl);
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currencyCode || 'EUR',
    minimumFractionDigits: ganz ? 0 : 2,
    maximumFractionDigits: ganz ? 0 : 2,
  }).format(zahl);
}

/**
 * Abschluss: die drei Einwände, die vor dem Kauf entscheiden, dann der
 * Preis-Dreizeiler. Der Preis kommt zur Laufzeit aus der Storefront
 * (data-preis-quelle="shopify"); ohne Antwort Christians Endpreis ("fest"),
 * gleiche Form, gleiches Banner. Keine Sterne, keine Nutzerzahl: die gehören
 * zum QiOne 2 Pro (Begründung in the-alpha-variante-c-daten.js).
 */
function Abschluss({preis}) {
  const price = preis?.price?.amount ? preis.price : TAC_ABSCHLUSS.festpreis;
  return (
    <section
      className="tac-abschluss"
      data-tac-abschluss=""
      data-preis-quelle={preis ? 'shopify' : 'fest'}
      aria-labelledby="tac-abschluss-titel"
    >
      <div className="tac-innen">
        <h2 className="tac-h2" id="tac-abschluss-titel">
          {TAC_ABSCHLUSS.titel}
        </h2>
        <ul className="tac-karten">
          {TAC_ABSCHLUSS.fragen.map((f) => (
            <li className="tac-karte" key={f.frage}>
              <h3 className="tac-h3">{f.frage}</h3>
              <p className="tac-text">{f.antwort}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="tac-innen tac-innen-schmal tac-preis">
        <div className="qb-preisanker tac-preisanker" data-tac-preisanker="">
          {TAC_ABSCHLUSS.anker.map((z) => (
            <p className="tac-anker" key={z}>
              {z}
            </p>
          ))}
          <div className="qb-preisanker__preiszeile">
            <span className="tac-festpreis">{betrag(price)}</span>
            <span className="qb-preisanker__banner">{TAC_ABSCHLUSS.banner}</span>
          </div>
        </div>
        <ul className="tac-preis-zeilen">
          {TAC_ABSCHLUSS.zeilen.map((z) => (
            <li key={z}>{z}</li>
          ))}
        </ul>
        <TheAlphaKauf className="tac-kauf" />
        <p className="tac-text tac-beratung">
          {TAC_ABSCHLUSS.beratung.text}{' '}
          <Link className="tac-verweis" to={TAC_ABSCHLUSS.beratung.ziel} prefetch="intent">
            {TAC_ABSCHLUSS.beratung.knopf}
          </Link>
        </p>
      </div>
    </section>
  );
}

/**
 * Wann steht der feste Kaufknopf im Bild? Sobald der erste Block nach oben
 * aus dem Bild ist (dort steht der Knopf schon), aber nie, solange ein anderer
 * Knopf der Seite im Bild ist (zwei gleiche Knöpfe übereinander) oder der Fuß
 * mit Impressum und Widerruf. Fehlende Messung heißt „nicht zeigen“.
 * Eigene Funktion statt Import aus rookie/: die Rookie-Bausteine enden mit
 * ihrem Test (rookie/start/sticky-lage.js, Kopfkommentar).
 */
export function tacStickySichtbar({heldUnterkante, knopfImBild, fussImBild}) {
  if (typeof heldUnterkante !== 'number' || !Number.isFinite(heldUnterkante)) return false;
  if (heldUnterkante > 0) return false;
  if (knopfImBild) return false;
  return !fussImBild;
}

/**
 * Fester Kaufknopf mobil (bis 749 px, the-alpha-variante-c.css). Bauform wie
 * der Sticky von LP B (SchlafZellenSchutz.jsx, Test szs-e1-gs050: mobil
 * gewonnen). Der Inhalt steht NUR im sichtbaren Zustand im DOM: das
 * Chat-Signal (KaufknopfChatSignal) bemerkt ihn per childList und lässt die
 * Blase weichen. Der Knopf ist derselbe Baustein TheAlphaKauf.
 */
function StickyKauf() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const held = document.querySelector('[data-tac-held]');
    if (!held) return undefined;
    const knoepfe = Array.from(
      document.querySelectorAll('.tac-seite [data-the-alpha-kauf]'),
    ).filter((k) => !k.closest('[data-tac-sticky]'));
    const fuss = document.querySelector('footer');
    const imBild = new Set();
    const lage = {heldUnterkante: null, knopfImBild: false, fussImBild: false};
    const beobachter = new IntersectionObserver((eintraege) => {
      for (const e of eintraege) {
        if (e.target === held) {
          lage.heldUnterkante = e.boundingClientRect.bottom;
        } else if (e.target === fuss) {
          lage.fussImBild = e.isIntersecting;
        } else if (e.isIntersecting) {
          imBild.add(e.target);
        } else {
          imBild.delete(e.target);
        }
      }
      lage.knopfImBild = imBild.size > 0;
      setSichtbar(tacStickySichtbar(lage));
    });
    beobachter.observe(held);
    knoepfe.forEach((k) => beobachter.observe(k));
    if (fuss) beobachter.observe(fuss);
    return () => beobachter.disconnect();
  }, []);

  return (
    <div
      className={`tac-sticky${sichtbar ? ' tac-sticky--sichtbar' : ''}`}
      data-tac-sticky=""
      aria-hidden={sichtbar ? undefined : 'true'}
    >
      {sichtbar && (
        <>
          <span className="tac-sticky-name">{TAC_STICKY.name}</span>
          <TheAlphaKauf className="tac-sticky-kauf" />
        </>
      )}
    </div>
  );
}

function Live() {
  return (
    <section
      className="tac-live"
      data-tac-live=""
      id={TAC_LIVE.anker}
      aria-labelledby="tac-live-titel"
    >
      <div className="tac-innen tac-innen-schmal">
        <h2 className="tac-h2 tac-h2-hell" id="tac-live-titel">
          {TAC_LIVE.titel}
        </h2>
        <p className="tac-live-wann">{TAC_LIVE.wann}</p>
        <p className="tac-text tac-text-hell">{TAC_LIVE.text}</p>
        <TheAlphaLiveAnmeldung quelle="the-alpha" variante="C" />
      </div>
    </section>
  );
}

function Fragen() {
  return (
    <section className="tac-fragen" data-tac-fragen="" aria-labelledby="tac-fragen-titel">
      <div className="tac-innen tac-innen-schmal">
        <h2 className="tac-h2" id="tac-fragen-titel">
          {TAC_FRAGEN.titel}
        </h2>
        {TAC_FRAGEN.liste.map((f) => (
          <details className="tac-frage" key={f.frage}>
            <summary className="tac-frage-kopf">{f.frage}</summary>
            <p className="tac-text">{f.antwort}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** @param {{preis: {handle: string, price: object} | null}} props */
export default function TheAlphaVarianteC({preis}) {
  return (
    <div className="tac-seite" data-the-alpha-variante="C">
      <Held />
      <Nutzen />
      <Vorlage />
      <Inhalt />
      <Belege />
      <Abschluss preis={preis} />
      <Live />
      <Fragen />
      <StickyKauf />
    </div>
  );
}
