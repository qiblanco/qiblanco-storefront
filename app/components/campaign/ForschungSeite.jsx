import {Link} from 'react-router';
import {Szene, GrafikWeg, Leiter, GrafikZellarten, GrafikAbstand} from '~/components/campaign/FoGrafiken';
import {STUDIEN, studienPfad} from '~/data/studien';
import {
  SEITE,
  WEG,
  SPROSSEN,
  STAND_TEXT,
  STAND_STUFE_1,
  STUDIEN_RAHMEN,
  WARUMS,
  WARUM_TEILE,
  ABSCHNITTE,
  QUELLEN_TITEL,
  BESCHRIFTUNG,
} from '~/data/forschung-seite';

/**
 * Die Seite „Forschung bei Qi Blanco“, Darstellung. DIESE DATEI TRÄGT KEINEN
 * TEXT: jeder Satz und jede Studienzahl steht in app/data/forschung-seite.js.
 *
 * AUFBAU: ein Kopf mit der Antwort und dem Weg in drei Stufen, dann fünf
 * Abschnitte (Forschungsverständnis, Stufe 1, Stufe 2, Stufe 3, Standort).
 * Jeder Abschnitt endet mit einem Weiter auf den nächsten, der letzte mit der
 * Einladung zur Zusammenarbeit.
 *
 * DIE DATEN-ATTRIBUTE SIND DER VERTRAG MIT DER PROBE am Kundenrand
 * (worker-pool/pruefungen/probe_forschung_seite_warums_zahlen_versteckt__20260924.py):
 * section[data-fo-abschnitt] je Abschnitt, li[data-fo-warum] je Warum mit
 * [data-fo-teil] für Befund, Hypothese und Versuch, [data-fo-studie] und
 * [data-fo-zahlen] je Studienkarte für die Zahlen-Naht zur Studienseite,
 * [data-fo-szene] für die Einmal-Animation.
 */

const GRAFIKEN = {
  zellarten: (g) => <GrafikZellarten werte={g.werte} />,
  abstand: (g) => (
    <GrafikAbstand produkt={g.produkt} zellen={g.zellen} kontrolle={g.kontrolle} nah={g.nah} fern={g.fern} />
  ),
};

function Absaetze({liste, klasse = 'fo-text'}) {
  return (
    <div className={klasse}>
      {liste.map((a) => (
        <p key={a.slice(0, 48)}>{a}</p>
      ))}
    </div>
  );
}

function Weiter({weiter}) {
  if (!weiter) return null;
  return (
    <p className="fo-weiter">
      <a href={`#${weiter.anker}`} data-fo-weiter="">
        {weiter.text}
      </a>
    </p>
  );
}

function Verstaendnis({a}) {
  return (
    <>
      <Absaetze liste={a.absaetze} />
      <ol className="fo-stufen">
        {a.stufen.map((s) => (
          <li key={s.nr} className="fo-stufen__karte">
            <p className="fo-stufen__kopf">
              <span className="fo-stufen__nr">{s.nr}</span> {s.name}
            </p>
            <p>{s.text}</p>
          </li>
        ))}
      </ol>
      <aside className="fo-fliegen" aria-labelledby="fo-fliegen-titel">
        <h3 id="fo-fliegen-titel">{a.fliegen.titel}</h3>
        <Absaetze liste={a.fliegen.absaetze} />
      </aside>
    </>
  );
}

function StudienKarte({r}) {
  return (
    <li
      className="fo-studie"
      data-fo-studie={r.studie}
      data-fo-zahlen={r.zahlen.join('|')}
    >
      <p className="fo-studie__produkt">{r.produkt}</p>
      <h4 className="fo-studie__titel">{r.titel}</h4>
      <dl className="fo-studie__rahmen">
        {r.zeilen.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className="fo-studie__ergebnis">{r.ergebnis}</p>
      <Link to={studienPfad(r.studie)} prefetch="intent" className="fo-studie__link">
        {BESCHRIFTUNG.zurStudie}
      </Link>
    </li>
  );
}

function Beweis({a}) {
  return (
    <>
      <Absaetze liste={a.absaetze} />
      <h3 className="fo-zwischen">{a.rahmenTitel}</h3>
      <ul className="fo-studien">
        {STUDIEN_RAHMEN.map((r) => (
          <StudienKarte key={r.studie} r={r} />
        ))}
      </ul>
      <div className="fo-repro">
        <div className="fo-repro__text">
          <h3 className="fo-zwischen">{a.reproTitel}</h3>
          <p>{a.reproIntro}</p>
          <p className="fo-repro__schluss">{a.reproSchluss}</p>
        </div>
        <Szene name="leiter" className="fo-szene--leiter">
          <Leiter sprossen={SPROSSEN} standText={STAND_TEXT} hier={WEG.hier} />
        </Szene>
      </div>
      <div className="fo-naechster">
        <h3 className="fo-zwischen">{a.naechsterTitel}</h3>
        <Absaetze liste={a.naechster} />
      </div>
    </>
  );
}

function Warum({w, nr}) {
  const g = w.grafik;
  return (
    <li className="fo-warum" id={`warum-${w.id}`} data-fo-warum={w.id}>
      <p className="fo-warum__marke">
        {BESCHRIFTUNG.warum} {nr}
      </p>
      <h3 className="fo-warum__frage">{w.frage}</h3>
      <div className="fo-warum__teile">
        {WARUM_TEILE.map((t) => (
          <div key={t.feld} className={`fo-warum__teil fo-warum__teil--${t.feld}`} data-fo-teil={t.feld}>
            <p className="fo-warum__klasse">{t.titel}</p>
            <p>{w[t.feld]}</p>
          </div>
        ))}
      </div>
      {g && GRAFIKEN[g.typ] ? (
        <Szene name={g.typ} titel={g.titel} legende={g.legende} className={`fo-szene--${g.typ}`}>
          {GRAFIKEN[g.typ](g)}
        </Szene>
      ) : null}
      {w.link ? (
        <p className="fo-warum__link">
          <Link to={w.link.href} prefetch="intent">
            {w.link.text}
          </Link>
        </p>
      ) : null}
    </li>
  );
}

function Grundlagen({a}) {
  return (
    <>
      <Absaetze liste={a.absaetze} />
      <ol className="fo-warums">
        {WARUMS.map((w, i) => (
          <Warum key={w.id} w={w} nr={i + 1} />
        ))}
      </ol>
      <p className="fo-modell">
        <Link to={a.modellLink.href} prefetch="intent">
          {a.modellLink.text}
        </Link>
      </p>
    </>
  );
}

function Weltweit({a}) {
  return (
    <>
      <Absaetze liste={a.absaetze} />
      <ul className="fo-hebel">
        {a.hebel.map((h) => (
          <li key={h.titel} className="fo-hebel__karte">
            <h3>{h.titel}</h3>
            <p>{h.text}</p>
          </li>
        ))}
      </ul>
      <p className="fo-schluss">{a.schluss}</p>
    </>
  );
}

function Standort({a}) {
  const e = a.einladung;
  return (
    <>
      <Absaetze liste={a.absaetze} />
      <div className="fo-spalten">
        {a.spalten.map((s) => (
          <div key={s.titel} className="fo-spalte">
            <h3>{s.titel}</h3>
            <ul>
              {s.punkte.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="fo-einladung" data-section="fo-einladung">
        <h3>{e.titel}</h3>
        <p>{e.text}</p>
        <div className="fo-einladung__wege">
          <a href={e.knopf.href} className="btn--primary">
            {e.knopf.text}
          </a>
          <Link to={e.neben.href} prefetch="intent" className="btn--text">
            {e.neben.text}
          </Link>
        </div>
      </div>
    </>
  );
}

const INHALT = {
  verstaendnis: Verstaendnis,
  beweis: Beweis,
  grundlagen: Grundlagen,
  weltweit: Weltweit,
  standort: Standort,
};

function Abschnitt({a}) {
  const Inhalt = INHALT[a.id];
  return (
    <section
      className={`fo-abschnitt fo-abschnitt--${a.id}`}
      id={a.anker}
      data-fo-abschnitt={a.id}
      data-section={`fo-${a.id}`}
      aria-labelledby={`${a.anker}-titel`}
    >
      <header className="fo-abschnitt__kopf">
        <p className="fo-marke">{a.marke}</p>
        <h2 id={`${a.anker}-titel`}>{a.titel}</h2>
      </header>
      {Inhalt ? <Inhalt a={a} /> : null}
      <Weiter weiter={a.weiter} />
    </section>
  );
}

function Quellen() {
  return (
    <section className="fo-quellen" id="quellen" data-section="fo-quellen" aria-labelledby="quellen-titel">
      <h2 id="quellen-titel">{QUELLEN_TITEL}</h2>
      <ul>
        {STUDIEN.map((st) => {
          const e = st.eckdaten;
          return (
            <li key={st.slug}>
              {e.autor}:{' '}
              <Link to={studienPfad(st.slug)} prefetch="intent">
                {e.titelDeutsch}
              </Link>
              . {e.journal} {e.band}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ForschungSeite() {
  return (
    <article className="fo">
      <header className="fo-kopf" data-section="fo-kopf">
        <div className="fo-kopf__text">
          <p className="fo-dachzeile">{SEITE.dachzeile}</p>
          <h1>{SEITE.h1}</h1>
          {SEITE.kurz.map((p) => (
            <p className="fo-kurz" key={p.slice(0, 48)}>
              {p}
            </p>
          ))}
          <nav className="fo-inhalt" aria-label={SEITE.inhaltTitel}>
            <p className="fo-inhalt__titel">{SEITE.inhaltTitel}</p>
            <ol>
              {ABSCHNITTE.map((a) => (
                <li key={a.id}>
                  <a href={`#${a.anker}`}>{a.marke}</a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
        <Szene name="weg" className="fo-szene--weg" legende={WEG.legende}>
          <GrafikWeg stufen={WEG.stufen} stand={STAND_STUFE_1} hier={WEG.hier} />
          <ol className="fo-weg__legende">
            {WEG.stufen.map((s) => (
              <li key={s.nr} className={s.nr === 1 ? 'ist-hier' : ''}>
                <span className="fo-weg__nr">{s.nr}</span>
                <span className="fo-weg__name">{s.name}</span>
                <span className="fo-weg__zeile">{s.zeile}</span>
                {s.nr === 1 ? <span className="fo-weg__hier">{WEG.hier}</span> : null}
              </li>
            ))}
          </ol>
        </Szene>
      </header>
      {ABSCHNITTE.map((a) => (
        <Abschnitt key={a.id} a={a} />
      ))}
      <Quellen />
    </article>
  );
}
