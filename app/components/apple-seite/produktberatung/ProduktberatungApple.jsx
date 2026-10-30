import serviceAppleStyles from '~/styles/service-apple.css?url';
import {mitMarkeR} from '~/components/reusables/MarkeR';
import {useGoogleRating} from '~/lib/googleRating';
import {
  FOTO,
  FRAGEN,
  STIMMEN,
  STIMMEN_B,
  useProduktberatung,
} from '~/components/campaign/ProduktberatungSeite';
import {AppleSeite} from '../AppleSeite';
import {AppleAnna} from '../AppleSektionen';
import {bildSrcSet, mitBreite} from '../apple-seite-logik';
import {
  ABLAUF,
  CHRISTIAN_BLOCK,
  CHRISTIAN_EINSTIEG,
  CHRISTIAN_SCHON,
  FRAGEN_TITEL,
  KOPF,
  SCHLUSS,
  STIMMEN_LINK,
  STIMMEN_TITEL,
  reihenfolge,
} from './produktberatung-daten';

/*
 * APPLE-FASSUNG DER PRODUKTBERATUNG (s08): /pages/produktberatung ist Arm A,
 * /pages/produktberatung-b Arm B von pb-e1-gs107. Termine, Formular,
 * Verwalten und Bestätigung kommen unverändert aus der heutigen Komponente
 * (useProduktberatung): dieselben Felder, dieselbe Action, dieselbe Weiche.
 * Hier steht nur der Rahmen. Stil: styles/service-apple.css, nur --as-*.
 *
 * Messpunkte bleiben die der heutigen Seite (data-section pb-kopf, pb-person,
 * pb-termine, pb-angaben, pb-gebucht, pb-fragen, pb-ablauf, pb-stimmen,
 * pb-schluss), damit die Auswertung von pb-e1-gs107 weiterzählt.
 * Christians Wortlaut trägt weiter data-fremdtext.
 */

const WORTLAUT = 'christian-wortlaut-20261008';
const BREITEN = [480, 750, 1080, 1200];

function Kopf({naechster}) {
  return (
    <section className="as-hero pba-kopf" data-section="pb-kopf">
      <div className="as-hero-text">
        <p className="as-overline">{KOPF.overline}</p>
        <h1 className="as-h1">
          <span className="pba-h1-zeile">{KOPF.h1[0]}</span>{' '}
          <span className="pba-h1-zeile">{KOPF.h1[1]}</span>
        </h1>
        {CHRISTIAN_EINSTIEG.map((p) => (
          <p key={p} className="as-unter" data-fremdtext={WORTLAUT}>
            {mitMarkeR(p)}
          </p>
        ))}
        {naechster ? (
          <div className="pb pba-naechster">{naechster}</div>
        ) : (
          <div className="as-knoepfe">
            <a
              className="btn btn--primary as-knopf"
              href={KOPF.knopf.href}
              data-qa="cta"
              data-as-cta="primary"
            >
              {KOPF.knopf.text}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function Person() {
  return (
    <section className="as-sektion pba-person" data-section="pb-person">
      <figure className="pba-foto">
        <img
          className="as-bild"
          src={mitBreite(FOTO, 750)}
          srcSet={bildSrcSet(FOTO, BREITEN)}
          sizes="(min-width: 750px) 400px, 100vw"
          width="1200"
          height="1535"
          alt="Christian Bernd Bauer, Gründer von Qi Blanco"
          fetchpriority="high"
          decoding="async"
        />
        <figcaption className="pba-foto-name" data-fremdtext={WORTLAUT}>
          {CHRISTIAN_BLOCK.name}
        </figcaption>
      </figure>
      <div className="pba-person-text" data-fremdtext={WORTLAUT}>
        <h2 className="as-h2">{CHRISTIAN_BLOCK.titel}</h2>
        {CHRISTIAN_BLOCK.absaetze.map((p) => (
          <p key={p.slice(0, 32)} className="as-absatz">
            {mitMarkeR(p)}
          </p>
        ))}
      </div>
    </section>
  );
}

function Fragen() {
  return (
    <section className="as-sektion" data-section="pb-fragen">
      <h2 className="as-h2">{FRAGEN_TITEL}</h2>
      <ul className="pba-fragen">
        {FRAGEN.map((f) => (
          <li key={f.frage}>
            <figure className="pba-frage">
              <img
                className="as-bild"
                src={mitBreite(f.bild, 750)}
                srcSet={bildSrcSet(f.bild, [480, 750, 1080])}
                sizes="(min-width: 750px) 33vw, 100vw"
                width="600"
                height="450"
                loading="lazy"
                decoding="async"
                alt={f.alt}
              />
              <figcaption className="pba-frage-text">
                {mitMarkeR(f.frage)}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="as-absatz pba-schon" data-fremdtext={WORTLAUT}>
        {mitMarkeR(CHRISTIAN_SCHON[0])}
        <br />
        {mitMarkeR(CHRISTIAN_SCHON[1])}
      </p>
    </section>
  );
}

function Ablauf() {
  return (
    <section
      className="as-cta-band as-dunkel pba-ablauf"
      data-section="pb-ablauf"
    >
      <div className="pba-ablauf-innen">
        <h2 className="as-h2">{ABLAUF.titel}</h2>
        <ol className="pba-schritte">
          {ABLAUF.schritte.map((s) => (
            <li key={s.titel} className="pba-schritt">
              <strong className="pba-schritt-titel">{s.titel}</strong>{' '}
              <span className="pba-schritt-satz">{s.satz}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Stimmen({b}) {
  const g = useGoogleRating();
  const stimmen = b ? STIMMEN_B : STIMMEN;
  if (!stimmen.length) return null;
  return (
    <section className="as-sektion" data-section="pb-stimmen">
      <h2 className="as-h2">{STIMMEN_TITEL}</h2>
      <ul className="as-stimmen">
        {stimmen.map((r) => (
          <li key={r.id} className="as-stimme">
            <blockquote className="as-stimme-text pba-stimme-text">
              {r.text.split('\n').map((zeile) => (
                <p key={zeile.slice(0, 32)}>{zeile}</p>
              ))}
            </blockquote>
            <p className="as-stimme-quelle">{r.name}, Google-Rezension</p>
          </li>
        ))}
      </ul>
      <a
        className="as-link"
        href={g.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {STIMMEN_LINK}
      </a>
    </section>
  );
}

function Schluss() {
  return (
    <section className="as-sektion pba-schluss" data-section="pb-schluss">
      <h2 className="as-h2">{SCHLUSS.titel}</h2>
      <p className="as-unter">{SCHLUSS.text}</p>
      <div className="as-knoepfe">
        <a
          className="btn btn--primary as-knopf"
          href={SCHLUSS.knopf.href}
          data-as-cta="primary"
        >
          {SCHLUSS.knopf.text}
        </a>
      </div>
    </section>
  );
}

const TEILE = {fragen: Fragen, ablauf: Ablauf, stimmen: Stimmen};

/**
 * @param {{seite: 'produktberatung'|'produktberatung-b'}} props
 */
export function ProduktberatungApple({seite}) {
  const b = seite === 'produktberatung-b';
  const {mitte, buchenAnsicht, naechster} = useProduktberatung(b);
  return (
    <>
      <link rel="stylesheet" href={serviceAppleStyles} />
      <AppleSeite seite={seite}>
        <Kopf naechster={naechster} />
        <Person />
        <div className={b ? 'pb pb--b pba-mitte' : 'pb pba-mitte'}>{mitte}</div>
        {reihenfolge(b ? 'b' : 'a').map((teil) => {
          const Teil = TEILE[teil];
          return <Teil key={teil} b={b} />;
        })}
        {buchenAnsicht ? <Schluss /> : null}
        <AppleAnna />
      </AppleSeite>
    </>
  );
}
