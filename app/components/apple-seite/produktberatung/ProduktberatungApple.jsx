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
 * Christians Wortlaut steht hier als JSX unter data-fremdtext (Zeichen für
 * Zeichen wie in ProduktberatungSeite.jsx, der Test prüft das): nur das
 * Attribut, nicht ein Kommentar am String, nimmt fremde Rede aus Stil-Tor und
 * Seiten-Freigabe aus. Das Attribut steht darum als fester String da.
 */

const BREITEN = [480, 750, 1080, 1200];

function Foto() {
  return (
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
      <figcaption
        className="pba-foto-name"
        data-fremdtext="christian-wortlaut-20261008"
      >
        Dipl.-Ing. (FH) Christian Bernd Bauer
      </figcaption>
    </figure>
  );
}

/** Kopf: links Überschrift, Einstieg und Weg zu den Terminen, rechts Christian. */
function Kopf({naechster}) {
  return (
    <section className="as-hero pba-kopf" data-section="pb-kopf">
      <div className="as-hero-text pba-kopf-text">
        <p className="as-overline">{KOPF.overline}</p>
        <h1 className="as-h1">
          <span className="pba-h1-zeile">{KOPF.h1[0]}</span>{' '}
          <span className="pba-h1-zeile">{KOPF.h1[1]}</span>
        </h1>
        <p className="as-unter" data-fremdtext="christian-wortlaut-20261008">
          Du hast Fragen zu unseren Produkten? Ich nehme mir persönlich Zeit für
          dich!
        </p>
        <p className="as-unter" data-fremdtext="christian-wortlaut-20261008">
          {mitMarkeR(
            'Wir können über deine aktuelle Situation sprechen und darüber, warum du einen QiOne® kaufen möchtest. Oder wir klären einfach die Fragen, die noch offen sind.',
          )}
        </p>
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
      <Foto />
    </section>
  );
}

/** Sein Block „Live mit mir :)“: das Foto steht darüber im Kopf (Christian 08.10.: Foto über dem Text). */
function Person() {
  return (
    <section className="as-sektion pba-person" data-section="pb-person">
      <div
        className="pba-person-text"
        data-fremdtext="christian-wortlaut-20261008"
      >
        <h2 className="as-h2">Live mit mir :)</h2>
        <p className="as-absatz">
          Vor mehr als 10 Jahren habe ich Qi Blanco gegründet, aus meiner
          eigenen Leidensgeschichte heraus. Damals leitete ich eine
          Entwicklungsabteilung für Automotive und Aerospace, und unser Büro
          wurde gerade modernisiert. Das Spannende: Ab da wurde ich immer müder,
          war ständig genervt und ging nicht mehr so glücklich durchs Leben wie
          früher. Die ersten Tage schob ich es auf meinen beruflichen Stress,
          dann auf meine Ernährung, dann auf meine Beziehung … Ich habe vieles
          getestet, bis ich mit allem ziemlich durch war. Und dann fiel es mir
          wie Schuppen von den Augen: Seit dem Umbau hing ein riesiger
          WLAN-Router direkt rechts neben mir an der Wand, 60 cm über meinem
          Kopf. Heureka! Es lag nicht an mir, sondern am E-Smog, der direkt mein
          Nervensystem angriff! Als Ingenieur war mir klar: Ich brauche eine
          einfache und elegante Lösung. Einfach umhängen, und das Problem ist
          erledigt.
        </p>
        <p className="as-absatz">
          {mitMarkeR(
            'Gesagt, getan: Noch in derselben Nacht entstand die Blaupause für den QiOne®.',
          )}
        </p>
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
      <p
        className="as-absatz pba-schon"
        data-fremdtext="christian-wortlaut-20261008"
      >
        {mitMarkeR('Du hast schon einen QiOne®? Dann komm erst recht :)')}
        <br />
        {mitMarkeR(
          'Wir können gerne über die Nutzung reden und über deine persönlichen Erfahrungen. Oder wir klären Fragen, die erst bei der Nutzung entstanden sind. Vielleicht auch, welchen Vorteil dir ein QiHome® Air bringen könnte?',
        )}
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
