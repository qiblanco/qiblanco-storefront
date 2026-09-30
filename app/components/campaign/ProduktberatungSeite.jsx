import {useEffect, useState} from 'react';
import {Form, Link, useActionData, useLoaderData, useNavigation} from 'react-router';

/**
 * /pages/produktberatung — Darstellung (Route: app/routes/pages.produktberatung.jsx).
 *
 * Grossjob 20260928-GROSSJOB-produktberatung-live-mit-christian-buchen, s02.
 * Aufbau nach KONZEPT.md Abschnitt 5, mobil zuerst:
 *   Kopf -> Termine + Formular -> Ablauf -> Wer spricht mit dir -> Was du klärst.
 * Die Termine stehen direkt unter der Überschrift: wer die Seite öffnet, will
 * einen Termin, keinen Text davor.
 *
 * ZWEI ANSICHTEN, EINE SEITE:
 *   Buchen      (ohne ?b=)       Termine als große Tipp-Flächen (Radio im
 *                                Formular, funktioniert ohne JavaScript).
 *   Verwalten   (?b=<token>)     Termin, Zoom-Link, Kenncode, Kalenderdatei,
 *                                Absagen, Umbuchen. Zugleich die Bestätigung:
 *                                nach Buchen/Umbuchen leitet die Action hierher
 *                                weiter (?status=gebucht|umgebucht). Die Kundin
 *                                sieht alles sofort, nicht erst in der Mail, und
 *                                Neuladen bucht nie ein zweites Mal.
 *
 * BUCHUNG ZU (Zoom fehlt oder Schalter aus): Termine bleiben sichtbar, das
 * Formular weicht dem Satz „Die Buchung öffnet in Kürze." Kein toter Knopf.
 *
 * ZEITEN: angezeigt wird deutsche Zeit aus den Feldern `datum`/`zeit` des
 * Endpunkts, ohne Intl auf dem Server (zwei Uhren = Hydrierungsfehler). Die
 * Zeit der Kundin ergänzt erst der Browser nach dem Laden, und nur, wenn ihre
 * Zeitzone abweicht.
 *
 * KEIN PREIS, KEIN WARENKORB, KEIN HEILVERSPRECHEN. Die Seite wird am nächsten
 * Schritt gemessen: an der Buchung.
 */

const ZONE = 'Europe/Berlin';
const WOCHENTAGE = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const PRODUKTE = ['QiOne® 2 Pro', 'QiBracelet', 'QiHome Air', 'Qi Master', 'anderes / weiß noch nicht'];
export const TERMIN_API = 'https://termin.65-108-150-121.sslip.io';
/** Porträt aus dem Shopify-CDN (Master 1200 x 1535, dieselbe Datei wie /pages/partnerprogramm). */
const FOTO = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845';

/** '2026-10-01' -> 'Donnerstag, 1. Oktober' (deterministisch, ohne Intl). */
function tagName(datum, mitJahr = false) {
  const [j, m, t] = String(datum || '')
    .split('-')
    .map(Number);
  if (!j || !m || !t) return datum || '';
  const wt = WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];
  return `${wt}, ${t}. ${MONATE[m - 1]}${mitJahr ? ` ${j}` : ''}`;
}

/** '2026-10-01T19:00:00+02:00' -> {datum:'2026-10-01', zeit:'19:00'} (die Endpunkt-Zeit ist deutsche Zeit). */
function teile(slotStart) {
  const s = String(slotStart || '');
  return {datum: s.slice(0, 10), zeit: s.slice(11, 16)};
}

function nachTag(termine) {
  const tage = [];
  for (const t of termine) {
    const letzter = tage[tage.length - 1];
    if (letzter && letzter.datum === t.datum) letzter.termine.push(t);
    else tage.push({datum: t.datum, termine: [t]});
  }
  return tage;
}

/** Zeitzone der Kundin, erst nach dem Laden (Server und erster Browser-Render sind gleich). */
function useKundenZone() {
  const [zone, setZone] = useState('');
  useEffect(() => {
    try {
      setZone(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch {
      setZone('');
    }
  }, []);
  return zone;
}

function lokaleZeit(utc, zone) {
  if (!utc || !zone || zone === ZONE) return '';
  try {
    return new Intl.DateTimeFormat('de-DE', {
      timeZone: zone,
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    }).format(new Date(utc));
  } catch {
    return '';
  }
}

function Kopf() {
  return (
    <section className="pb__kopf" data-section="pb-kopf">
      <div className="pb__inhalt">
        <p className="pb__vorspann">Kostenlos · live per Zoom · Kamera freiwillig</p>
        <h1>Produktberatung: 20 Minuten mit Christian</h1>
        <p className="pb__lead">
          Du hast eine Frage zu unseren Produkten? Stell sie mir direkt, live per Zoom.
        </p>
      </div>
    </section>
  );
}

function Hinweis({text, art = 'hinweis'}) {
  if (!text) return null;
  return (
    <p className={`pb__hinweis pb__hinweis--${art}`} role={art === 'fehler' ? 'alert' : 'status'}>
      {text}
    </p>
  );
}

/** Die Terminliste. `mitRadio` = Radio im Formular, sonst reine Anzeige. */
function Terminliste({termine, mitRadio, auswahl, zone, feldname = 'slot_start'}) {
  return (
    <div className="pb__tage">
      {nachTag(termine).map((tag) => (
        <fieldset className="pb__tag" key={tag.datum}>
          <legend className="pb__tagname">{tagName(tag.datum)}</legend>
          <ul className="pb__slots">
            {tag.termine.map((t) => {
              const lokal = lokaleZeit(t.utc, zone);
              const id = `pb-slot-${t.utc}`;
              return (
                <li key={t.slot_start} data-pb-slot={t.slot_start}>
                  {mitRadio ? (
                    <>
                      <input
                        className="pb__radio"
                        type="radio"
                        id={id}
                        name={feldname}
                        value={t.slot_start}
                        defaultChecked={auswahl === t.slot_start}
                        required
                      />
                      <label className="pb__slot" htmlFor={id}>
                        <span className="pb__zeit">{t.zeit} Uhr</span>
                        {lokal ? <span className="pb__lokal">bei dir {lokal}</span> : null}
                      </label>
                    </>
                  ) : (
                    <span className="pb__slot pb__slot--anzeige">
                      <span className="pb__zeit">{t.zeit} Uhr</span>
                      {lokal ? <span className="pb__lokal">bei dir {lokal}</span> : null}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
      <p className="pb__klein">Alle Zeiten in deutscher Zeit. Ein Gespräch dauert 20 Minuten.</p>
    </div>
  );
}

function Feld({name, label, typ = 'text', pflicht = false, auto, wert}) {
  return (
    <div className="pb__feld">
      <label htmlFor={`pb-${name}`}>
        {label}
        {pflicht ? null : <span className="pb__frei"> (freiwillig)</span>}
      </label>
      <input
        id={`pb-${name}`}
        name={name}
        type={typ}
        required={pflicht}
        autoComplete={auto}
        defaultValue={wert || ''}
        maxLength={typ === 'email' ? 254 : 120}
      />
    </div>
  );
}

function Buchen({daten, fehler, zone}) {
  const nav = useNavigation();
  const sendet = nav.state !== 'idle' && nav.formData?.get('intent') === 'buchen';
  const e = fehler?.eingabe || {};
  const auswahl = fehler?.slot || daten.vorwahl || '';

  if (daten.ladeFehler) {
    return (
      <section className="pb__termine" data-section="pb-termine" id="termine">
        <div className="pb__inhalt">
          <h2>Termine</h2>
          <Hinweis
            art="fehler"
            text="Die Termine laden gerade nicht. Schreib uns an service@qiblanco.com."
          />
        </div>
      </section>
    );
  }

  if (!daten.termine.length) {
    return (
      <section className="pb__termine" data-section="pb-termine" id="termine">
        <div className="pb__inhalt">
          <h2>Termine</h2>
          <p>
            Gerade sind alle Termine vergeben, neue kommen jede Woche dazu. Schreib uns gern an
            service@qiblanco.com.
          </p>
        </div>
      </section>
    );
  }

  if (!daten.buchungMoeglich) {
    return (
      <section className="pb__termine" data-section="pb-termine" id="termine">
        <div className="pb__inhalt">
          <h2>Die nächsten Termine</h2>
          <Terminliste termine={daten.termine} mitRadio={false} zone={zone} />
          <p className="pb__bald">Die Buchung öffnet in Kürze.</p>
          <p>Bis dahin erreichst du uns unter service@qiblanco.com.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb__termine" data-section="pb-termine" id="termine">
      <div className="pb__inhalt">
        <Form method="post" className="pb__form" preventScrollReset>
          <input type="hidden" name="intent" value="buchen" />
          <input type="hidden" name="tz" value={zone} />
          {/* Der Fehlersatz steht ÜBER der Terminliste: ist der gewählte Termin inzwischen vergeben, fehlt
              er nach dem Neuladen, kein Radio ist gewählt und :has() blendet die Angaben aus. */}
          <Hinweis art="fehler" text={fehler?.text} />
          <h2>1. Wähl deinen Termin</h2>
          <Terminliste termine={daten.termine} mitRadio auswahl={auswahl} zone={zone} />

          <div className="pb__felder">
            <h2>2. Deine Angaben</h2>
            <Feld name="name" label="Name" pflicht auto="name" wert={e.name} />
            <Feld name="email" label="E-Mail" typ="email" pflicht auto="email" wert={e.email} />
            <Feld name="telefon" label="Telefon" typ="tel" auto="tel" wert={e.telefon} />
            <div className="pb__feld">
              <label htmlFor="pb-produkt">
                Um welches Produkt geht es?<span className="pb__frei"> (freiwillig)</span>
              </label>
              <select id="pb-produkt" name="produkt" defaultValue={e.produkt || ''}>
                <option value="">bitte wählen</option>
                {PRODUKTE.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="pb__feld">
              <label htmlFor="pb-anliegen">
                Worum geht es?<span className="pb__frei"> (freiwillig)</span>
              </label>
              <textarea id="pb-anliegen" name="anliegen" rows={3} maxLength={1000} defaultValue={e.anliegen || ''} />
            </div>
            {/* Honigtopf: Menschen sehen und erreichen dieses Feld nicht (neben dem
                Bild, ohne Tab-Halt, ohne Autofill). Wer es füllt, bucht nicht. */}
            <div className="pb__topf" aria-hidden="true">
              <label htmlFor="pb-website">Website</label>
              <input id="pb-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
            </div>
            <button type="submit" className="pb__knopf" disabled={sendet}>
              {sendet ? 'Einen Moment …' : 'Termin verbindlich buchen'}
            </button>
            <p className="pb__klein">
              Wir speichern deinen Namen, deine E-Mail und deine freiwilligen Angaben nur für dieses Gespräch
              und löschen sie 60 Tage nach dem Termin. Mehr dazu in unserer{' '}
              <Link to="/pages/datenschutz">Datenschutzerklärung</Link>.
            </p>
          </div>
        </Form>
      </div>
    </section>
  );
}

/**
 * Termin, Zoom, Kalender: dieselben Angaben in Bestätigung und Verwalten-Ansicht.
 * `data-clarity-mask`: Zoom-Link und Kenncode gehören nicht in eine Sitzungsaufzeichnung.
 */
function Termindaten({buchung, token, zone, api}) {
  const {datum, zeit} = teile(buchung.slot_start);
  const lokal = lokaleZeit(buchung.slot_utc, zone);
  return (
    <dl className="pb__daten" data-clarity-mask="true">
      <div>
        <dt>Termin</dt>
        <dd>
          {tagName(datum, true)}, {zeit} Uhr (deutsche Zeit)
          {lokal ? <span className="pb__lokal"> · bei dir {lokal}</span> : null}
        </dd>
      </div>
      {buchung.zoom_url ? (
        <div>
          <dt>Zoom-Link</dt>
          <dd>
            <a href={buchung.zoom_url} rel="noopener noreferrer" target="_blank" className="pb__zoom">
              {buchung.zoom_url}
            </a>
          </dd>
        </div>
      ) : null}
      {buchung.zoom_kenncode ? (
        <div>
          <dt>Kenncode</dt>
          <dd className="pb__kenncode">{buchung.zoom_kenncode}</dd>
        </div>
      ) : null}
      {token ? (
        <div className="pb__aktionen">
          <a
            className="pb__knopf-zwei"
            href={`${api || TERMIN_API}/api/buchung?t=${encodeURIComponent(token)}&ics=1`}
            rel="nofollow noopener"
          >
            In meinen Kalender
          </a>
        </div>
      ) : null}
    </dl>
  );
}

/** Nur noch für den Honigtopf: der Endpunkt bucht nicht und sagt nichts, die Seite dankt neutral. */
function Danke() {
  return (
    <section className="pb__termine" data-section="pb-bestaetigung">
      <div className="pb__inhalt">
        <h2>Danke.</h2>
        <p>Kommt keine Bestätigung, schreib uns bitte an service@qiblanco.com.</p>
      </div>
    </section>
  );
}

/** Warum ein Termin abgesagt ist: das entscheidet den Satz (der Endpunkt meldet es grob). */
const ABGESAGT = {
  kundin: ['Dein Termin ist abgesagt.', 'Danke, dass du Bescheid gegeben hast, der Platz ist jetzt wieder frei.'],
  christian: [
    'Christian musste diesen Termin leider absagen.',
    'Das tut uns leid. Wähl gern einen neuen Termin, wir freuen uns auf dich.',
  ],
  umgebucht: [
    'Dieser Termin wurde umgebucht.',
    'Deinen neuen Termin findest du über den Link in deiner neuesten Bestätigung.',
  ],
};

/**
 * Verwalten-Ansicht (?b=<token>), zugleich die Bestätigung: nach dem Buchen und
 * Umbuchen leitet die Action hierher weiter (?status=gebucht|umgebucht).
 */
function Verwalten({daten, ergebnis, zone}) {
  const nav = useNavigation();
  const sendet = nav.state !== 'idle';

  if (!daten.buchung) {
    return (
      <section className="pb__termine" data-section="pb-verwalten" id="termine">
        <div className="pb__inhalt">
          <h2>Dein Termin</h2>
          <Hinweis art="fehler" text={daten.verwaltenFehler} />
          <p>
            <Link to="/pages/produktberatung">Zu den freien Terminen</Link>
          </p>
        </div>
      </section>
    );
  }

  const b = ergebnis?.ok && ergebnis.intent === 'absagen' && ergebnis.buchung ? ergebnis.buchung : daten.buchung;
  const vorbei = b.slot_utc && daten.jetzt && b.slot_utc <= daten.jetzt;
  if (b.storniert) {
    const [kopf, satz] = ABGESAGT[b.storno_von] || ABGESAGT.kundin;
    return (
      <section className="pb__termine" data-section="pb-verwalten" id="termine">
        <div className="pb__inhalt">
          <h2>{kopf}</h2>
          <p>{satz}</p>
          <p>
            <Link to="/pages/produktberatung">Neuen Termin wählen</Link>
          </p>
        </div>
      </section>
    );
  }

  const neu = daten.status === 'gebucht' || daten.status === 'umgebucht';
  const gruss = b.vorname ? `, ${b.vorname}` : '';
  const titel =
    daten.status === 'umgebucht'
      ? 'Dein neuer Termin steht.'
      : daten.status === 'gebucht'
        ? `Dein Termin steht${gruss}.`
        : `Dein Termin${gruss}`;
  const andere = daten.termine.filter((t) => t.slot_start !== b.slot_start);
  return (
    <section className={`pb__termine${neu ? ' pb__bestaetigt' : ''}`} data-section="pb-verwalten" id="termine">
      <div className="pb__inhalt">
        <h2>{titel}</h2>
        {neu ? (
          <p>
            Heb dir diese Seite auf. Hier findest du jederzeit Zoom-Link und Kenncode, und hier kannst du
            absagen oder umbuchen.
          </p>
        ) : null}
        <Hinweis art="fehler" text={ergebnis && !ergebnis.ok ? ergebnis.text : ''} />
        <Termindaten buchung={b} token={daten.token} zone={zone} api={daten.api} />
        {vorbei ? null : (
          <>
            {daten.buchungMoeglich && andere.length ? (
              <Form method="post" className="pb__form" preventScrollReset>
                <input type="hidden" name="intent" value="umbuchen" />
                <input type="hidden" name="t" value={daten.token} />
                <h2>Umbuchen</h2>
                <Terminliste termine={andere} mitRadio zone={zone} />
                <button type="submit" className="pb__knopf" disabled={sendet}>
                  Auf diesen Termin umbuchen
                </button>
              </Form>
            ) : null}
            <Form method="post" className="pb__absagen" preventScrollReset>
              <input type="hidden" name="intent" value="absagen" />
              <input type="hidden" name="t" value={daten.token} />
              <h2>Absagen</h2>
              <p>Wenn du nicht kannst, sag ab, damit der Platz für jemand anderen frei wird.</p>
              <button type="submit" className="pb__knopf-zwei" disabled={sendet}>
                Termin absagen
              </button>
            </Form>
          </>
        )}
      </div>
    </section>
  );
}

function Ablauf() {
  return (
    <section className="pb__ablauf" data-section="pb-ablauf">
      <div className="pb__inhalt">
        <h2>So läuft es ab</h2>
        <ol className="pb__schritte">
          <li>
            <strong>Termin wählen.</strong> Name und E-Mail genügen.
          </li>
          <li>
            <strong>Zoom-Link bekommen.</strong> Du siehst ihn direkt nach der Buchung, samt Kalenderdatei.
          </li>
          <li>
            <strong>Zur Zeit auf den Link tippen.</strong> Die Kamera ist freiwillig, ein Handy reicht.
          </li>
        </ol>
      </div>
    </section>
  );
}

function WerSpricht() {
  return (
    <section className="pb__person" data-section="pb-person">
      <div className="pb__inhalt">
        <h2>Wer mit dir spricht</h2>
        <div className="pb__wer">
          <img
            className="pb__foto"
            src={`${FOTO}&width=320`}
            srcSet={`${FOTO}&width=160 160w, ${FOTO}&width=320 320w, ${FOTO}&width=480 480w`}
            sizes="160px"
            width="160"
            height="205"
            loading="lazy"
            decoding="async"
            alt="Christian Bernd Bauer, Gründer von Qi Blanco"
          />
          <p>
            Ich bin Christian Bauer und habe Qi Blanco mit Anna gegründet. In unserem Gespräch beantworte
            ich deine Fragen selbst.
          </p>
        </div>
        <h2>Was du in 20 Minuten klärst</h2>
        <ul className="pb__liste">
          <li>welches Produkt zu deinem Alltag passt</li>
          <li>wie du es trägst oder aufstellst</li>
          <li>was du erwarten kannst, und wo die Grenzen liegen</li>
        </ul>
        <p>Willst du es genauer wissen, erkläre ich dir die Studienlage offen.</p>
      </div>
    </section>
  );
}

export function ProduktberatungSeite() {
  const daten = useLoaderData();
  const ergebnis = useActionData();
  const zone = useKundenZone();

  let mitte;
  if (daten.token) mitte = <Verwalten daten={daten} ergebnis={ergebnis} zone={zone} />;
  else if (ergebnis?.ok && ergebnis.intent === 'buchen') mitte = <Danke />;
  else mitte = <Buchen daten={daten} fehler={ergebnis && !ergebnis.ok ? ergebnis : null} zone={zone} />;

  return (
    <div className="pb">
      <Kopf />
      {mitte}
      <Ablauf />
      <WerSpricht />
    </div>
  );
}
