import {Fragment} from 'react';
import {Link} from 'react-router';
import {FaqListe} from '~/components/reusables/FaqListe';
import {
  GrafikLeit,
  GrafikBruecken,
  GrafikAusschlusszone,
} from '~/components/campaign/KwGrafiken';
import {bilder as SSOT_BILDER} from '~/data/kohaerente-wasserstruktur';
import {
  SEITE,
  INHALT,
  TEIL_EINFACH,
  TEIL_FAKTEN,
  ABGRENZUNG,
  FRAGEN,
  QUELLEN,
  WEITER,
  quellenNummer,
} from '~/data/hexagonales-wasser-seite';

/**
 * Die Seite „Hexagonales Wasser" — Darstellung. DIESE DATEI TRÄGT KEINEN
 * INHALT: jeder Satz und jede Quelle steht in app/data/hexagonales-wasser-
 * seite.js. Wer Text ändert, ändert das Datenmodul.
 *
 * Bauform und Klassen wie auf der Info-Seite „Kohärentes Wasser" (das
 * Stylesheet der Info-Seite gilt hier mit, die Route lädt beide): Kopf mit
 * Kurzfassung (der Satz, den eine KI zitiert), Teil 1 einfach, Teil 2
 * gemessen und Modell, dann die Abgrenzungstabelle, Fragen und Quellen. Die
 * Grafiken kommen aus demselben Bausatz (KwGrafiken), ohne neue Zahl.
 */

const BILD = Object.fromEntries(SSOT_BILDER.map((b) => [b.id, b]));

const GRAFIKEN = {
  bruecken: GrafikBruecken,
  ausschlusszone: GrafikAusschlusszone,
};

/** Text mit Zitatmarken {q:id} und internen Verweisen {l:/pfad|Text}. */
function Text({children}) {
  const roh = String(children).replace(/\s+(\{q:)/g, '$1');
  const teile = roh.split(/(\{q:[a-z0-9-]+\}|\{l:[^}|]+\|[^}]+\})/g);
  return teile.map((teil, i) => {
    const zitat = teil.match(/^\{q:([a-z0-9-]+)\}$/);
    if (zitat) {
      const nr = quellenNummer(zitat[1]);
      return (
        <sup className="kw-zitat" key={`z${i}`}>
          <a href={`#q-${zitat[1]}`} aria-label={`Quelle ${nr}`}>
            [{nr}]
          </a>
        </sup>
      );
    }
    const verweis = teil.match(/^\{l:([^}|]+)\|([^}]+)\}$/);
    if (verweis) {
      return (
        <Link key={`l${i}`} to={verweis[1]} prefetch="intent">
          {verweis[2]}
        </Link>
      );
    }
    return <Fragment key={`t${i}`}>{teil}</Fragment>;
  });
}

function Absaetze({liste}) {
  return (liste || []).map((a) => (
    <p key={a.slice(0, 48)}>
      <Text>{a}</Text>
    </p>
  ));
}

function Grafik({grafik}) {
  if (!grafik) return null;
  const Bauteil = GRAFIKEN[grafik.typ];
  if (!Bauteil) return null;
  return (
    <figure className="kw-figur" data-kw-figur={grafik.typ}>
      <Bauteil {...grafik.werte} />
      <figcaption>
        <Text>{grafik.legende}</Text>
      </figcaption>
    </figure>
  );
}

function Abschnitt({a}) {
  return (
    <section
      className="kw-abschnitt"
      id={a.id}
      data-section={`hw-${a.id}`}
      aria-labelledby={`${a.id}-titel`}
    >
      <h3 id={`${a.id}-titel`}>{a.titel}</h3>
      {a.klasse ? <p className="kw-klasse">{a.klasse}</p> : null}
      <Absaetze liste={a.absaetze} />
      <Grafik grafik={a.grafik} />
    </section>
  );
}

function Teil({t}) {
  return (
    <section className="kw-teil" id={t.id} aria-labelledby={`${t.id}-titel`}>
      <p className="kw-teil__nr">{t.nr}</p>
      <h2 id={`${t.id}-titel`}>{t.titel}</h2>
      <p className="kw-teil__einleitung">
        <Text>{t.einleitung}</Text>
      </p>
      {t.abschnitte.map((a) => (
        <Abschnitt a={a} key={a.id} />
      ))}
    </section>
  );
}

function Abgrenzung() {
  const t = ABGRENZUNG;
  return (
    <section
      className="kw-teil hw-abgrenzung"
      id={t.id}
      data-section="hw-abgrenzung"
      aria-labelledby={`${t.id}-titel`}
    >
      <h2 id={`${t.id}-titel`}>{t.titel}</h2>
      <p className="kw-teil__einleitung">{t.einleitung}</p>
      <div className="hw-abgrenzung__rahmen">
        <table className="kw-begriffe hw-abgrenzung__tabelle">
          <caption className="kw-meta">{t.legende}</caption>
          <thead>
            <tr>
              {t.spalten.map((s) => (
                <th scope="col" key={s}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.zeilen.map((z) => (
              <tr key={z.id} id={`begriff-${z.id}`}>
                <th scope="row">{z.begriff}</th>
                <td>{z.bedeutung}</td>
                <td>
                  <Text>{z.beleg}</Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function HexagonalesWasserSeite() {
  const winkel = BILD.winkel;
  return (
    <article className="kw hw" data-hw-seite="" lang="de">
      <header className="kw-kopf" data-section="hw-kopf">
        <div className="kw-kopf__text">
          <p className="kw-kopf__marke">{SEITE.marke}</p>
          <h1>{SEITE.h1}</h1>
          <p className="kw-kopf__unter">{SEITE.unterzeile}</p>
          <div className="kw-kurz" data-hw-kurzfassung="">
            <p className="kw-kurz__titel">{SEITE.kurzTitel}</p>
            <p>
              <Text>{SEITE.kurz}</Text>
            </p>
          </div>
          <p className="kw-meta">
            {SEITE.autorZeile} · Stand {SEITE.standAnzeige} · {QUELLEN.length}{' '}
            Quellen
          </p>
        </div>
        <figure className="kw-figur kw-figur--leit">
          <GrafikLeit von={winkel.von} nach={winkel.nach} />
          <figcaption>{SEITE.leitLegende}</figcaption>
        </figure>
      </header>

      <nav
        className="kw-inhalt"
        data-section="hw-inhalt"
        aria-labelledby="hw-inhalt-titel"
      >
        <p className="kw-inhalt__titel" id="hw-inhalt-titel">
          Inhalt
        </p>
        <ol>
          {INHALT.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`}>{e.titel}</a>
            </li>
          ))}
        </ol>
      </nav>

      <Teil t={TEIL_EINFACH} />
      <Teil t={TEIL_FAKTEN} />
      <Abgrenzung />

      <section
        className="kw-teil kw-fragen"
        id="fragen"
        data-section="hw-fragen"
        aria-labelledby="fragen-titel"
      >
        <h2 id="fragen-titel">Häufige Fragen zu hexagonalem Wasser</h2>
        <FaqListe items={FRAGEN} />
      </section>

      <section
        className="kw-teil"
        id="quellen"
        data-section="hw-quellen"
        aria-labelledby="quellen-titel"
      >
        <h2 id="quellen-titel">Quellen</h2>
        <ol className="kw-quellen">
          {QUELLEN.map((q) => (
            <li id={`q-${q.id}`} key={q.id}>
              {q.autoren} ({q.jahr}): <cite>{q.titel}</cite>. {q.ort}.{' '}
              {q.url ? (
                <a href={q.url} target="_blank" rel="noopener noreferrer">
                  {q.url.replace(/^https:\/\//, '')}
                </a>
              ) : null}
              {q.kern ? (
                <span className="kw-quellen__kern">{q.kern}</span>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="kw-teil"
        id="weiter"
        data-section="hw-weiter"
        aria-labelledby="weiter-titel"
      >
        <h2 id="weiter-titel">Weiterlesen</h2>
        <ul className="kw-weiter">
          {WEITER.map((w) => (
            <li key={w.to}>
              <Link to={w.to} prefetch="intent">
                {w.titel}
              </Link>
              <p>{w.text}</p>
            </li>
          ))}
        </ul>
        <p className="kw-stand">{SEITE.standZeile}</p>
      </section>
    </article>
  );
}
