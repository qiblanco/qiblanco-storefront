import {Fragment} from 'react';
import {Link} from 'react-router';
import {
  BildWinkel,
  BildDomaene,
  BildStruktur,
} from '~/components/reusables/WasserstrukturBilder';
import {YoutubeTimestamp} from '~/components/reusables/YoutubeTimestamp';
import {FaqListe} from '~/components/reusables/FaqListe';
import {WasserStufentafel} from '~/components/campaign/WasserStufentafel';
import {
  GrafikLeit,
  GrafikBruecken,
  GrafikDomaene,
  GrafikAusschlusszone,
  GrafikLicht,
  GrafikMassstab,
  GrafikSpektrum,
} from '~/components/campaign/KwGrafiken';
import {bilder as SSOT_BILDER} from '~/data/kohaerente-wasserstruktur';
import {
  SEITE,
  INHALT,
  TEIL_EINFACH,
  TEIL_FAKTEN,
  BEGRIFFE,
  STUFENTAFEL,
  VIDEO,
  FRAGEN,
  GLOSSAR,
  QUELLEN,
  WEITER,
  quellenNummer,
} from '~/data/wasser-infoseite';

/**
 * Die Info-Seite „Kohärentes Wasser" — Darstellung. DIESE DATEI TRÄGT KEINEN
 * INHALT: jeder Satz, jede Zahl und jede Quelle steht in
 * app/data/wasser-infoseite.js, die Werte der drei Stufen in
 * dem Datenmodul der Wasserstruktur (Konsument des Brain-SSoT). Wer Text
 * ändert, ändert das Datenmodul.
 *
 * AUFBAU nach Christians Zweiteilung: Kopf mit Kurzfassung (sie ist auch der
 * Satz, den eine KI zitiert), Teil 1 „einfach erklärt", Teil 2 „harte
 * Fakten", dann Begriffe, Fragen, Glossar und Quellen. Jede Sektion trägt
 * einen stabilen Anker; die Zitatnummern springen in das Quellenverzeichnis.
 */

const BILD = Object.fromEntries(SSOT_BILDER.map((b) => [b.id, b]));

const GRAFIKEN = {
  bruecken: GrafikBruecken,
  domaene: GrafikDomaene,
  ausschlusszone: GrafikAusschlusszone,
  licht: GrafikLicht,
  skala: GrafikMassstab,
  spektrum: GrafikSpektrum,
};

/** Text mit Zitatmarken {q:id} und internen Verweisen {l:/pfad|Text}. */
function Text({children}) {
  // Die Zitatnummer hängt am Wort, ohne Leerzeichen davor (wie im Fachtext).
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
      data-section={`kw-${a.id}`}
      aria-labelledby={`${a.id}-titel`}
    >
      <h3 id={`${a.id}-titel`}>{a.titel}</h3>
      {a.klasse ? <p className="kw-klasse">{a.klasse}</p> : null}
      <Absaetze liste={a.absaetze} />
      {a.tabelle ? <Tabelle tabelle={a.tabelle} /> : null}
      <Grafik grafik={a.grafik} />
      {a.nachGrafik ? <Absaetze liste={a.nachGrafik} /> : null}
      {a.stufentafel ? (
        <WasserStufentafel
          titel={STUFENTAFEL.titel}
          erklaerung={STUFENTAFEL.erklaerung}
        />
      ) : null}
      {a.video ? <Video /> : null}
      {a.begriffe ? <Begriffe /> : null}
    </section>
  );
}

function Tabelle({tabelle}) {
  return (
    <table className="kw-begriffe kw-tabelle">
      <thead>
        <tr>
          {tabelle.spalten.map((s) => (
            <th scope="col" key={s}>
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tabelle.zeilen.map(([kopf, befund]) => (
          <tr key={kopf}>
            <th scope="row">{kopf}</th>
            <td>
              <Text>{befund}</Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Video() {
  return (
    <figure className="kw-video" data-kw-video={VIDEO.id}>
      <div className="kw-video__rahmen">
        <YoutubeTimestamp
          videoId={VIDEO.id}
          titel={VIDEO.titel}
          posterAlt={VIDEO.posterAlt}
          sizes="(max-width: 800px) 100vw, 760px"
        />
      </div>
      <figcaption>
        {VIDEO.legende}{' '}
        <a href={VIDEO.playlistUrl} target="_blank" rel="noopener noreferrer">
          {VIDEO.playlistText}
        </a>
      </figcaption>
    </figure>
  );
}

function Begriffe() {
  return (
    <table className="kw-begriffe">
      <caption className="kw-meta">{BEGRIFFE.legende}</caption>
      <thead>
        <tr>
          {BEGRIFFE.spalten.map((s) => (
            <th scope="col" key={s}>
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {BEGRIFFE.zeilen.map((z) => (
          <tr key={z.begriff}>
            <th scope="row">{z.begriff}</th>
            <td>
              <Text>{z.bedeutung}</Text>
            </td>
            <td>
              <Text>{z.herkunft}</Text>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TeilEinfach() {
  const t = TEIL_EINFACH;
  return (
    <section className="kw-teil" id={t.id} aria-labelledby={`${t.id}-titel`}>
      <p className="kw-teil__nr">{t.nr}</p>
      <h2 id={`${t.id}-titel`}>{t.titel}</h2>
      <p className="kw-teil__einleitung">
        <Text>{t.einleitung}</Text>
      </p>
      {t.abschnitte.map((a) =>
        a.stufenbilder ? (
          <section
            className="kw-abschnitt"
            id={a.id}
            key={a.id}
            data-section={`kw-${a.id}`}
            aria-labelledby={`${a.id}-titel`}
          >
            <h3 id={`${a.id}-titel`}>{a.titel}</h3>
            <Absaetze liste={a.absaetze} />
            <ul className="kw-karten">
              <li className="kw-karte">
                <BildWinkel von={BILD.winkel.von} nach={BILD.winkel.nach} />
                <h4>{BILD.winkel.titel}</h4>
                <p>{BILD.winkel.text}</p>
                <p className="kw-karte__folge">{BILD.winkel.folge}</p>
              </li>
              <li className="kw-karte">
                <BildDomaene
                  schwellen={BILD.domaene.schwellen}
                  energie={BILD.domaene.energie}
                />
                <h4>{BILD.domaene.titel}</h4>
                <p>{BILD.domaene.text}</p>
                <p className="kw-karte__folge">{BILD.domaene.folge}</p>
              </li>
              <li className="kw-karte">
                <BildStruktur
                  von={BILD.struktur.von}
                  nach={BILD.struktur.nach}
                />
                <h4>{BILD.struktur.titel}</h4>
                <p>{BILD.struktur.text}</p>
                <p className="kw-karte__folge">{BILD.struktur.folge}</p>
              </li>
            </ul>
            {a.nachGrafik ? <Absaetze liste={a.nachGrafik} /> : null}
            {a.video ? <Video /> : null}
          </section>
        ) : a.karten ? (
          <section
            className="kw-abschnitt"
            id={a.id}
            key={a.id}
            data-section={`kw-${a.id}`}
            aria-labelledby={`${a.id}-titel`}
          >
            <h3 id={`${a.id}-titel`}>{a.titel}</h3>
            <Absaetze liste={a.absaetze} />
            <ul
              className={`kw-karten${a.karten.length === 4 ? ' kw-karten--vier' : ''}`}
            >
              {a.karten.map((k) => (
                <li className="kw-karte" key={k.titel}>
                  <h4>{k.titel}</h4>
                  <p>
                    <Text>{k.text}</Text>
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <Abschnitt a={a} key={a.id} />
        ),
      )}
    </section>
  );
}

function TeilFakten() {
  const t = TEIL_FAKTEN;
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

export function KohaerentesWasserSeite() {
  const winkel = BILD.winkel;
  return (
    <article className="kw" data-kw-seite="" lang="de">
      <header className="kw-kopf" data-section="kw-kopf">
        <div className="kw-kopf__text">
          <p className="kw-kopf__marke">{SEITE.marke}</p>
          <h1>{SEITE.h1}</h1>
          <p className="kw-kopf__unter">{SEITE.unterzeile}</p>
          <div className="kw-kurz" data-kw-kurzfassung="">
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
        data-section="kw-inhalt"
        aria-labelledby="kw-inhalt-titel"
      >
        <p className="kw-inhalt__titel" id="kw-inhalt-titel">
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

      <TeilEinfach />
      <TeilFakten />

      <section
        className="kw-teil kw-fragen"
        id="fragen"
        data-section="kw-fragen"
        aria-labelledby="fragen-titel"
      >
        <h2 id="fragen-titel">Häufige Fragen zu kohärentem Wasser</h2>
        <FaqListe items={FRAGEN} />
      </section>

      <section
        className="kw-teil"
        id="glossar"
        data-section="kw-glossar"
        aria-labelledby="glossar-titel"
      >
        <h2 id="glossar-titel">Glossar</h2>
        <dl className="kw-glossar">
          {GLOSSAR.map((g) => (
            <Fragment key={g.id}>
              <dt id={`begriff-${g.id}`}>{g.begriff}</dt>
              <dd>
                <Text>{g.definition}</Text>
              </dd>
            </Fragment>
          ))}
        </dl>
      </section>

      <section
        className="kw-teil"
        id="quellen"
        data-section="kw-quellen"
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
        data-section="kw-weiter"
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
