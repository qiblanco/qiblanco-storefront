import {useEffect, useRef, useState} from 'react';
import {Form, useNavigation} from 'react-router';
import {PT} from './potenzialtest-spec';
import {
  FRAGEN_IDS,
  anfrageAusFormular,
  mailSatz,
} from './potenzialtest-logik';

/**
 * /pages/potenzialtest — Darstellung (Route: app/routes/pages.potenzialtest.jsx,
 * Gestaltung: app/styles/potenzialtest.css, Scope .pt).
 *
 * EIN FORMULAR, VIELE SCHRITTE: alle Fragen stehen von Anfang an im HTML, in
 * einem einzigen <Form method="post">. JavaScript zeigt immer nur einen
 * Schritt (Einstieg, 15 Fragen, Qualifizierung, Kontakt). Ohne JavaScript
 * blendet der <noscript>-Stil alle Schritte ein: dann ist es ein langes
 * Formular mit normalem POST, und die Action prüft dieselben Regeln.
 *
 * BEDIENUNG: ein Klick auf eine Antwort springt weiter; mit der Tastatur
 * wählen die Pfeiltasten, Enter geht weiter (kein Sprung beim Durchblättern
 * mit Pfeilen). „Zurück" geht auf jeder Frage. Beim Schrittwechsel wandert der
 * Fokus auf die neue Frage, damit ein Bildschirmleser sie vorliest.
 */

const SCHRITT_QUALI = FRAGEN_IDS.length + 1; // 16
const SCHRITT_KONTAKT = FRAGEN_IDS.length + 2; // 17

/** Welcher Schritt zeigt das Feld, an dem ein Fehler hängt? */
function schrittFuerFeld(feld) {
  const i = FRAGEN_IDS.indexOf(feld);
  if (i >= 0) return i + 1;
  if (feld === 'q_interesse' || feld === 'q_gespraech') return SCHRITT_QUALI;
  return SCHRITT_KONTAKT;
}

function antwortenAus(eingabe) {
  const a = {};
  for (const id of FRAGEN_IDS) {
    const n = Number(eingabe?.[id]);
    if (Number.isInteger(n) && n >= 1 && n <= 5) a[id] = n;
  }
  return a;
}

export function PotenzialtestSeite({quelle, testLauf, antwort}) {
  const navigation = useNavigation();
  const sendet = navigation.state === 'submitting';
  const eingabe = antwort && !antwort.ok ? antwort.eingabe || {} : {};

  const [schritt, setSchritt] = useState(() =>
    antwort && !antwort.ok ? schrittFuerFeld(antwort.fehler?.feld) : 0,
  );
  const [antworten, setAntworten] = useState(() => antwortenAus(eingabe));
  const [qInteresse, setQInteresse] = useState(eingabe.q_interesse || '');
  const [qGespraech, setQGespraech] = useState(eingabe.q_gespraech || '');
  const [fehler, setFehler] = useState(
    antwort && !antwort.ok ? antwort.fehler : null,
  );
  const zeiger = useRef(false);
  const gewechselt = useRef(false);
  const kopf = useRef(null);

  // Neue Antwort der Action (Fehler): zum Feld springen, Satz zeigen.
  useEffect(() => {
    if (antwort && !antwort.ok) {
      setFehler(antwort.fehler);
      gewechselt.current = true;
      setSchritt(schrittFuerFeld(antwort.fehler?.feld));
    }
  }, [antwort]);

  // Fokus und Sicht auf den neuen Schritt (nicht beim ersten Aufbau).
  useEffect(() => {
    if (!gewechselt.current) return;
    const titel = document.getElementById(`pt-titel-${schritt}`);
    if (titel) titel.focus({preventScroll: true});
    // Die Shop-Kopfleiste steht fest oben: .pt trägt dafür scroll-margin-top
    // (potenzialtest.css); was darunter liegt, gilt als nicht sichtbar.
    const rand = parseFloat(getComputedStyle(kopf.current || document.body).scrollMarginTop) || 0;
    const oben = kopf.current?.getBoundingClientRect().top ?? 0;
    if (oben < rand || oben > window.innerHeight * 0.4) {
      kopf.current?.scrollIntoView({block: 'start'});
    }
  }, [schritt]);

  function gehe(ziel) {
    gewechselt.current = true;
    setFehler(null);
    setSchritt(ziel);
  }

  function weiter() {
    if (schritt >= 1 && schritt <= FRAGEN_IDS.length) {
      if (!antworten[FRAGEN_IDS[schritt - 1]]) {
        setFehler({feld: FRAGEN_IDS[schritt - 1], text: 'Bitte wähl eine Antwort.'});
        return;
      }
    }
    if (schritt === SCHRITT_QUALI) {
      if (!qInteresse) {
        setFehler({feld: 'q_interesse', text: 'Bitte wähle eine Antwort aus.'});
        return;
      }
      if (qInteresse !== 'nur_ergebnis' && !qGespraech) {
        setFehler({feld: 'q_gespraech', text: 'Bitte wähle Ja oder Nein.'});
        return;
      }
    }
    gehe(Math.min(schritt + 1, SCHRITT_KONTAKT));
  }

  function waehleAntwort(id, wert) {
    setAntworten((a) => ({...a, [id]: wert}));
    setFehler(null);
    if (zeiger.current) {
      zeiger.current = false;
      const i = FRAGEN_IDS.indexOf(id) + 1;
      window.setTimeout(() => {
        gewechselt.current = true;
        setSchritt((s) => (s === i ? i + 1 : s));
      }, 260);
    }
  }

  function beimAbsenden(ereignis) {
    const ergebnis = anfrageAusFormular(new FormData(ereignis.currentTarget));
    if (ergebnis.fehler) {
      ereignis.preventDefault();
      setFehler(ergebnis.fehler);
      gewechselt.current = true;
      setSchritt(schrittFuerFeld(ergebnis.fehler.feld));
    }
  }

  function taste(ereignis) {
    if (
      ereignis.key === 'Enter' &&
      schritt < SCHRITT_KONTAKT &&
      ereignis.target.tagName !== 'BUTTON' &&
      ereignis.target.tagName !== 'A'
    ) {
      ereignis.preventDefault();
      if (schritt === 0) gehe(1);
      else weiter();
    }
  }

  if (antwort?.ok) {
    return (
      <div className="pt" ref={kopf}>
        <Ergebnis
          ergebnis={antwort.ergebnis}
          vorname={antwort.vorname}
          terminweg={antwort.terminweg}
        />
      </div>
    );
  }

  const imTest = schritt >= 1 && schritt <= FRAGEN_IDS.length;
  const fortschritt = Math.round((Math.min(schritt, SCHRITT_KONTAKT) / SCHRITT_KONTAKT) * 100);
  const fehlerBei = (feld) => (fehler && fehler.feld === feld ? fehler.text : '');
  const fragtGespraech = qInteresse && qInteresse !== 'nur_ergebnis';

  return (
    <div className="pt" ref={kopf}>
      <noscript
        dangerouslySetInnerHTML={{
          __html:
            '<style>.pt [data-schritt][hidden],.pt [data-gespraech][hidden]{display:block}.pt .pt-nur-js{display:none}</style>',
        }}
      />
      <Form
        method="post"
        noValidate
        onSubmit={beimAbsenden}
        onKeyDown={taste}
        className="pt-test"
        aria-label="Potenzialtest"
      >
        <input type="hidden" name="quelle" value={quelle} />
        {testLauf ? <input type="hidden" name="test_lauf" value="1" /> : null}

        {schritt > 0 ? (
          <div className="pt-stand pt-nur-js">
            <p className="pt-stand__text" aria-live="polite">
              {imTest
                ? `Frage ${schritt} von ${FRAGEN_IDS.length}`
                : 'Fast geschafft'}
            </p>
            <div
              className="pt-stand__bahn"
              role="progressbar"
              aria-label="Fortschritt"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={fortschritt}
            >
              <span style={{width: `${fortschritt}%`}} />
            </div>
          </div>
        ) : null}

        {/* ── Einstieg ─────────────────────────────────────────────── */}
        <section className="pt-schritt pt-einstieg" data-schritt="0" hidden={schritt !== 0}>
          <p className="pt-kicker">Selbsteinschätzung · 3 Minuten</p>
          <h1 className="pt-h1" id="pt-titel-0" tabIndex={-1}>
            {PT.titel}
          </h1>
          <p className="pt-lead">{PT.untertitel}</p>
          <ul className="pt-eckdaten" aria-label="Was dich erwartet">
            <li>15 kurze Aussagen</li>
            <li>Ergebnis sofort hier</li>
            <li>Dazu als PDF per Mail</li>
          </ul>
          <div className="pt-aktion pt-nur-js">
            <button type="button" className="pt-knopf" onClick={() => gehe(1)}>
              Test starten
            </button>
          </div>
          <p className="pt-hinweis">{PT.hinweis}</p>
        </section>

        {/* ── 15 Fragen ────────────────────────────────────────────── */}
        {PT.fragen.map((f, i) => {
          const nr = i + 1;
          const satz = fehlerBei(f.id);
          return (
            <section
              key={f.id}
              className="pt-schritt"
              data-schritt={nr}
              hidden={schritt !== nr}
            >
              <fieldset
                className="pt-frage"
                aria-describedby={satz ? `pt-fehler-${f.id}` : undefined}
              >
                <legend className="pt-frage__text" id={`pt-titel-${nr}`} tabIndex={-1}>
                  <span className="pt-frage__nr">{nr}.</span> {f.text}
                </legend>
                <div className="pt-optionen">
                  {PT.skala.map((label, k) => {
                    const wert = k + 1;
                    return (
                      <label
                        key={wert}
                        className="pt-option"
                        onPointerDown={() => {
                          // Die ganze Zeile ist die Antwort: Zeiger auf Text oder Kreis springt weiter.
                          zeiger.current = true;
                        }}
                      >
                        <input
                          type="radio"
                          name={f.id}
                          value={wert}
                          checked={antworten[f.id] === wert}
                          onChange={() => waehleAntwort(f.id, wert)}
                        />
                        <span className="pt-option__text">{label}</span>
                      </label>
                    );
                  })}
                </div>
                {satz ? (
                  <p className="pt-fehler" id={`pt-fehler-${f.id}`} role="alert">
                    {satz}
                  </p>
                ) : null}
              </fieldset>
              <div className="pt-nav pt-nur-js">
                <button type="button" className="pt-vorher" onClick={() => gehe(nr - 1)}>
                  Zurück
                </button>
                <button type="button" className="pt-knopf pt-knopf--leise" onClick={weiter}>
                  Weiter
                </button>
              </div>
            </section>
          );
        })}

        {/* ── Qualifizierung ───────────────────────────────────────── */}
        <section className="pt-schritt" data-schritt={SCHRITT_QUALI} hidden={schritt !== SCHRITT_QUALI}>
          <h2 className="pt-h2" id={`pt-titel-${SCHRITT_QUALI}`} tabIndex={-1}>
            Zum Schluss zwei Fragen
          </h2>
          <fieldset className="pt-frage">
            <legend className="pt-frage__text">{PT.qInteresse.text}</legend>
            <div className="pt-optionen">
              {PT.qInteresse.optionen.map((o) => (
                <label key={o.id} className="pt-option">
                  <input
                    type="radio"
                    name="q_interesse"
                    value={o.id}
                    checked={qInteresse === o.id}
                    onChange={() => {
                      setQInteresse(o.id);
                      setFehler(null);
                    }}
                  />
                  <span className="pt-option__text">{o.text}</span>
                </label>
              ))}
            </div>
            {fehlerBei('q_interesse') ? (
              <p className="pt-fehler" role="alert">
                {fehlerBei('q_interesse')}
              </p>
            ) : null}
          </fieldset>
          <fieldset
            className="pt-frage"
            hidden={!fragtGespraech}
            data-gespraech=""
          >
            <legend className="pt-frage__text">{PT.qGespraech.text}</legend>
            <div className="pt-optionen pt-optionen--zwei">
              {PT.qGespraech.optionen.map((o) => (
                <label key={o.id} className="pt-option">
                  <input
                    type="radio"
                    name="q_gespraech"
                    value={o.id}
                    checked={qGespraech === o.id}
                    onChange={() => {
                      setQGespraech(o.id);
                      setFehler(null);
                    }}
                  />
                  <span className="pt-option__text">{o.text}</span>
                </label>
              ))}
            </div>
            {fehlerBei('q_gespraech') ? (
              <p className="pt-fehler" role="alert">
                {fehlerBei('q_gespraech')}
              </p>
            ) : null}
          </fieldset>
          <div className="pt-nav pt-nur-js">
            <button type="button" className="pt-vorher" onClick={() => gehe(SCHRITT_QUALI - 1)}>
              Zurück
            </button>
            <button type="button" className="pt-knopf pt-knopf--leise" onClick={weiter}>
              Weiter
            </button>
          </div>
        </section>

        {/* ── Kontakt + Absenden ───────────────────────────────────── */}
        <section className="pt-schritt" data-schritt={SCHRITT_KONTAKT} hidden={schritt !== SCHRITT_KONTAKT}>
          <h2 className="pt-h2" id={`pt-titel-${SCHRITT_KONTAKT}`} tabIndex={-1}>
            Wohin dürfen wir dein Ergebnis schicken?
          </h2>
          <p className="pt-text">
            Du siehst dein Ergebnis gleich hier. Als PDF kommt es zusätzlich per Mail.
          </p>
          <div className="pt-feld">
            <label htmlFor="pt-vorname">
              Vorname <span className="pt-feld__frei">(freiwillig)</span>
            </label>
            <input
              id="pt-vorname"
              name="vorname"
              type="text"
              autoComplete="given-name"
              defaultValue={eingabe.vorname || ''}
              maxLength={80}
            />
          </div>
          <div className="pt-feld">
            <label htmlFor="pt-email">E-Mail-Adresse</label>
            <input
              id="pt-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue={eingabe.email || ''}
              aria-invalid={fehlerBei('email') ? 'true' : undefined}
              aria-describedby={fehlerBei('email') ? 'pt-fehler-email' : undefined}
              maxLength={200}
            />
            {fehlerBei('email') ? (
              <p className="pt-fehler" id="pt-fehler-email" role="alert">
                {fehlerBei('email')}
              </p>
            ) : null}
          </div>
          <div className="pt-honig" aria-hidden="true">
            <label htmlFor="pt-website">Bitte leer lassen</label>
            <input id="pt-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="pt-einwilligung">
            <input
              type="checkbox"
              name="einwilligung"
              value="ja"
              defaultChecked={eingabe.einwilligung === 'ja'}
              aria-invalid={fehlerBei('einwilligung') ? 'true' : undefined}
            />
            <span>{PT.einwilligung}</span>
          </label>
          {fehlerBei('einwilligung') ? (
            <p className="pt-fehler" role="alert">
              {fehlerBei('einwilligung')}
            </p>
          ) : null}
          {fehler && fehler.feld === '' ? (
            <p className="pt-fehler pt-fehler--block" role="alert">
              {fehler.text}
            </p>
          ) : null}
          <div className="pt-nav">
            <button
              type="button"
              className="pt-vorher pt-nur-js"
              onClick={() => gehe(SCHRITT_KONTAKT - 1)}
            >
              Zurück
            </button>
            <button type="submit" className="pt-knopf" disabled={sendet}>
              {sendet ? 'Wird ausgewertet …' : 'Mein Ergebnis zeigen'}
            </button>
          </div>
          <p className="pt-hinweis">{PT.hinweis}</p>
        </section>
      </Form>
    </div>
  );
}

function Ergebnis({ergebnis, vorname, terminweg}) {
  const titel = useRef(null);
  useEffect(() => {
    titel.current?.focus({preventScroll: true});
    // Ergebnis = neue Ansicht: ganz nach oben, sonst liegt der Typ unter der Kopfleiste.
    window.scrollTo({top: 0});
  }, []);
  const namen = Object.fromEntries(PT.dimensionen.map((d) => [d.id, d.name]));
  return (
    <article className="pt-ergebnis" data-typ={ergebnis.typ} data-ergebnis-id={ergebnis.ergebnis_id}>
      <section className="pt-ergebnis__kopf">
        <p className="pt-kicker">{vorname ? `Dein Ergebnis, ${vorname}` : 'Dein Ergebnis'}</p>
        <h1 className="pt-h1" ref={titel} tabIndex={-1}>
          {ergebnis.typ_name}
        </h1>
        <p className="pt-index">
          <span className="pt-index__zahl" data-index={ergebnis.index}>
            {ergebnis.index}
          </span>
          <span className="pt-index__text">Potenzial-Index von 100</span>
        </p>
        <p className="pt-lead">{ergebnis.satz}</p>
      </section>

      <section className="pt-ergebnis__teil" aria-labelledby="pt-bereiche">
        <h2 className="pt-h2" id="pt-bereiche">
          Deine fünf Bereiche
        </h2>
        <ul className="pt-balken">
          {ergebnis.dimensionen.map((d) => (
            <li key={d.id} className="pt-balken__zeile" data-dim={d.id}>
              <span className="pt-balken__name">{namen[d.id]}</span>
              <span className="pt-balken__wert">{d.wert} %</span>
              <span className="pt-balken__bahn" aria-hidden="true">
                <span style={{width: `${d.wert}%`}} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="pt-ergebnis__teil" aria-labelledby="pt-hebel">
        <h2 className="pt-h2" id="pt-hebel">
          Drei Hebel, die zu dir passen
        </h2>
        <ol className="pt-hebel">
          {ergebnis.hebel.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
        <p className="pt-mail" data-mail-status={ergebnis.mail_status}>
          {mailSatz(ergebnis.mail_status)}
          {ergebnis.pdf_url ? (
            <>
              {' '}
              <a href={ergebnis.pdf_url} className="pt-link" target="_blank" rel="noopener">
                PDF jetzt öffnen
              </a>
            </>
          ) : null}
        </p>
      </section>

      {terminweg ? (
        <section className="pt-ergebnis__teil pt-termin" data-terminweg="" aria-labelledby="pt-termin">
          <h2 className="pt-h2" id="pt-termin">
            Lass uns über dein Ergebnis sprechen
          </h2>
          <p className="pt-text">
            20 Minuten per Zoom mit Christian, kostenlos. Du wählst den Termin, der dir passt.
          </p>
          <div className="pt-aktion">
            <a className="pt-knopf" href="/pages/produktberatung?von=potenzialtest">
              Termin wählen
            </a>
          </div>
        </section>
      ) : null}

      <section className="pt-ergebnis__teil pt-ergebnis__fuss">
        <details className="pt-grundlagen">
          <summary>Worauf die fünf Bereiche beruhen</summary>
          <dl>
            {PT.dimensionen.map((d) => (
              <div key={d.id}>
                <dt>{d.name}</dt>
                <dd>{d.grundlage}</dd>
              </div>
            ))}
          </dl>
        </details>
        <p className="pt-hinweis">{PT.hinweis}</p>
        <p className="pt-text">
          <a href="/pages/potenzialtest" className="pt-link">
            Test noch einmal machen
          </a>
        </p>
      </section>
    </article>
  );
}

