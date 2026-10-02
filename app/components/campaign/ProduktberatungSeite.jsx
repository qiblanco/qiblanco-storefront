import {useEffect, useRef, useState} from 'react';
import {
  Form,
  Link,
  useLoaderData,
  useNavigation,
  useRevalidator,
} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';
import {useGoogleRating} from '~/lib/googleRating';
import {GOOGLE_REVIEWS_CURATED} from '~/lib/googleReviewsCurated';

/**
 * /pages/produktberatung — Darstellung (Route: app/routes/pages.produktberatung.jsx).
 *
 * Grossjob 20260928-GROSSJOB-produktberatung-live-mit-christian-buchen, s02.
 * Aufbau (Umbau 20261001-bau-beratungsseite-gestaltung-und-text-in-christians-stimme,
 * Christian 01.10.2026: „noch etwas schöner", „der Text ist super schwach",
 * „dieser Bereich muss oberhalb von ‚Wähl deinen Termin' stehen"), mobil zuerst:
 *   Kopf mit Christian (Bild + seine Worte) -> Termine als Tageskarten +
 *   Formular -> Ablauf in drei Schritten (mit Warteraum) -> Was wir klären +
 *   Für wen -> Kundenstimmen (wörtlich, Google) -> Schluss mit Weg zurück zu
 *   den Terminen.
 * ANNA WIRD NICHT GENANNT (Christian): es ist sein Gespräch, und Kunden würden
 * sie mit der AI Anna aus dem Chat verwechseln. Das gilt auch für die
 * Kundenstimmen: eine Rezension, die Anna nennt, wird nie gezeigt (Filter unten).
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
 * ZEITEN: angezeigt wird die Zeitzone Berlin aus den Feldern `datum`/`zeit` des
 * Endpunkts, ohne Intl auf dem Server (zwei Uhren = Hydrierungsfehler). Die
 * Zeit der Kundin ergänzt erst der Browser nach dem Laden, und nur, wenn ihre
 * Zeitzone abweicht.
 *
 * KEIN PREIS, KEIN WARENKORB, KEIN HEILVERSPRECHEN. Die Seite wird am nächsten
 * Schritt gemessen: an der Buchung.
 *
 * UMBAU 2026-10-02 „lebensfroh" (Grossjob 20261002-GROSSJOB-beratung-8h-schluss-
 * termine-rollen-kontrolle-lebensfroh, s02; Christian: „klingt noch ein bisschen
 * nach AI … cool und lebensfroh, nicht so eine trostlose Show"): Text in
 * Christians Ich-Form neu, gegengelesen aus Annas Sicht (Review-Befunde im
 * Job-Ordner), Termintage mit Kalender-Kachel, „Was du mich fragen kannst" mit
 * echten Alltagsbildern aus dem Shopify-Bestand, Ablauf als dunkler Akt.
 * Die Listen „Was wir klären"/„Für wen" sind in Christians Worten aufgegangen.
 *
 * ABDATEN IM BROWSER: siehe useJetzt()/nochBuchbar() unten. Die Grenze kommt
 * allein aus `buchungsschluss_min` des Endpunkts; die Seite kennt keine Zahl.
 */

const ZONE = 'Europe/Berlin';
const WOCHENTAGE = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
];
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
const PRODUKTE = [
  'QiOne® 2 Pro',
  'QiBracelet',
  'QiHome Air',
  'Qi Master',
  'anderes / weiß noch nicht',
];
export const TERMIN_API = 'https://termin.65-108-150-121.sslip.io';
/** Porträt aus dem Shopify-CDN (Master 1200 x 1535, dieselbe Datei wie /pages/partnerprogramm). */
const FOTO =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845';

const MONATE_KURZ = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
];

/** '2026-10-01' -> {zahl:'1', monat:'Okt'} für die Kalender-Kachel (nur Schmuck, steht per CSS da). */
function kachel(datum) {
  const [, m, t] = String(datum || '')
    .split('-')
    .map(Number);
  return m && t
    ? {zahl: String(t), monat: MONATE_KURZ[m - 1]}
    : {zahl: '', monat: ''};
}

/** 480 -> '8 Stunden', 60 -> 'eine Stunde', 90 -> '90 Minuten'; unbekannt -> '' (dann kein Satz). */
export function fristText(min) {
  if (typeof min !== 'number' || !Number.isFinite(min) || min <= 0) return '';
  if (min % 60 === 0) {
    const h = min / 60;
    return h === 1 ? 'eine Stunde' : `${h} Stunden`;
  }
  return `${min} Minuten`;
}

/**
 * Abdaten: ein Termin bleibt nur sichtbar, solange Beginn minus Buchungsschluss
 * in der Zukunft liegt. `jetzt` ist null auf dem Server und im ersten
 * Browser-Render (gleiches HTML, kein Hydrierungsfehler); fehlt der
 * Buchungsschluss, bleibt die Liste wie vom Endpunkt.
 */
export function nochBuchbar(termine, schlussMin, jetzt) {
  if (
    jetzt == null ||
    typeof schlussMin !== 'number' ||
    !Number.isFinite(schlussMin)
  )
    return termine;
  const grenze = jetzt + schlussMin * 60000;
  return termine.filter((t) => {
    const ms = Date.parse(t.utc);
    return !Number.isFinite(ms) || ms > grenze;
  });
}

/**
 * Die Uhr der Seite: nach dem Laden, alle 60 s und beim Zurückkehren in den
 * Tab. Kommt der Tab zurück, holt die Seite zusätzlich frische Termine beim
 * Endpunkt (revalidate), damit der nächste Donnerstag nachrückt.
 */
function useJetzt() {
  const [jetzt, setJetzt] = useState(null);
  const revalidator = useRevalidator();
  const reval = useRef(revalidator);
  reval.current = revalidator;
  useEffect(() => {
    const tick = () => setJetzt(Date.now());
    tick();
    const takt = window.setInterval(tick, 60000);
    const sichtbar = () => {
      if (document.visibilityState !== 'visible') return;
      tick();
      if (reval.current.state === 'idle') reval.current.revalidate();
    };
    document.addEventListener('visibilitychange', sichtbar);
    return () => {
      window.clearInterval(takt);
      document.removeEventListener('visibilitychange', sichtbar);
    };
  }, []);
  return jetzt;
}

/** '2026-10-01' -> 'Donnerstag, 1. Oktober' (deterministisch, ohne Intl). */
function tagName(datum, mitJahr = false) {
  const [j, m, t] = String(datum || '')
    .split('-')
    .map(Number);
  if (!j || !m || !t) return datum || '';
  const wt = WOCHENTAGE[new Date(Date.UTC(j, m - 1, t)).getUTCDay()];
  return `${wt}, ${t}. ${MONATE[m - 1]}${mitJahr ? ` ${j}` : ''}`;
}

/** '2026-10-01T19:00:00+02:00' -> {datum:'2026-10-01', zeit:'19:00'} (die Endpunkt-Zeit ist Zeitzone Berlin). */
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

/**
 * Kopf: Überschrift, dann Christian selbst (Bild + seine Worte), dann der Weg zu
 * den Terminen. Christian 01.10.: der Bereich „Wer mit dir spricht" steht ÜBER
 * „Wähl deinen Termin". Die Seite fängt bei der Lage des Besuchers an (drei Tabs
 * offen, welches Stück passt), nicht bei uns. Einspaltig, damit das Chat-Fenster
 * unten rechts Christians Worte nicht verdeckt.
 */
function Kopf({mitWeg}) {
  const g = useGoogleRating();
  return (
    <section className="pb__kopf" data-section="pb-kopf">
      <div className="pb__inhalt pb__inhalt--breit">
        <div className="pb__kopf-text">
          <p className="pb__vorspann">Kostenlos · live per Zoom</p>
          <h1>Produktberatung: 20 Minuten mit Christian</h1>
          <p className="pb__lead">
            Du hast drei Tabs offen und weißt nicht, ob der Anhänger, das
            Armband oder der QiHome Air zu dir passt? Frag mich. 20 Minuten, du
            und ich, per Zoom. Kaufen musst du danach nichts.
          </p>
          <p className="pb__vertrauen">
            <a
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pb__sterne-link"
            >
              <span className="pb__sterne" aria-hidden="true">
                ★★★★★
              </span>{' '}
              {g.komma} von 5 bei Google
            </a>
          </p>
          {mitWeg ? (
            <p className="pb__weg">
              {/* Der sichtbare Einstieg in die Buchung (design-qa Q2): der Buchen-Knopf selbst
                  erscheint erst nach der Terminwahl. */}
              <a
                href="#termine"
                className="pb__knopf pb__knopf--weg"
                data-qa="cta"
              >
                Termin aussuchen
              </a>
            </p>
          ) : null}
        </div>
        <figure className="pb__christian" data-section="pb-person">
          <img
            className="pb__foto"
            src={`${FOTO}&width=480`}
            srcSet={`${FOTO}&width=240 240w, ${FOTO}&width=480 480w, ${FOTO}&width=720 720w`}
            sizes="(min-width: 768px) 240px, 112px"
            width="240"
            height="307"
            fetchpriority="high"
            decoding="async"
            alt="Christian Bernd Bauer, Gründer von Qi Blanco"
          />
          <figcaption className="pb__christian-text">
            <p className="pb__vorspann">Wer mit dir spricht</p>
            <p className="pb__christian-wort">
              Ich bin Christian, und seit mehr als zehn Jahren baue ich Qi
              Blanco. Erzähl mir, wie dein Tag aussieht, von der ersten Mail bis
              zum Handy am Bett. Dann sage ich dir, welches Stück zu dir passt
              und wie du es am besten trägst.
            </p>
            <p>
              Frag mich die ganz praktischen Sachen: Unterm Shirt oder drüber?
              Auch beim Sport? Und wenn du skeptisch bist, bring genau das mit.
              Deine kritischste Frage ist mir die liebste.
            </p>
            <p className="pb__unterschrift">
              Christian Bauer, Gründer von Qi Blanco®
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Hinweis({text, art = 'hinweis'}) {
  if (!text) return null;
  return (
    <p
      className={`pb__hinweis pb__hinweis--${art}`}
      role={art === 'fehler' ? 'alert' : 'status'}
    >
      {text}
    </p>
  );
}

/**
 * Die Terminliste. `mitRadio` = Radio im Formular, sonst reine Anzeige.
 * Jeder Tag ist eine Karte mit Kalender-Kachel: Zahl und Monat stehen als
 * data-Attribute an der Legende und erscheinen per CSS (Schmuck, nicht im
 * Seitentext). Der Seitentext trägt das Datum ganz: „Donnerstag, 8. Oktober".
 */
function Terminliste({
  termine,
  mitRadio,
  auswahl,
  zone,
  feldname = 'slot_start',
  onWahl,
}) {
  return (
    <>
      <div className="pb__tage">
        {nachTag(termine).map((tag) => {
          const k = kachel(tag.datum);
          return (
            <fieldset className="pb__tag" key={tag.datum}>
              <legend
                className="pb__tagname"
                data-tag={k.zahl}
                data-monat={k.monat}
              >
                <span className="pb__tagtext">
                  <span className="pb__tagdatum">{tagName(tag.datum)}</span>
                  <span className="pb__tagzahl">
                    {tag.termine.length === 1
                      ? 'eine Zeit frei'
                      : `${tag.termine.length} Zeiten frei`}
                  </span>
                </span>
              </legend>
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
                            onChange={
                              onWahl ? () => onWahl(t.slot_start) : undefined
                            }
                            required
                          />
                          <label className="pb__slot" htmlFor={id}>
                            <span className="pb__zeit">{t.zeit} Uhr</span>
                            {lokal ? (
                              <span className="pb__lokal">bei dir {lokal}</span>
                            ) : null}
                          </label>
                        </>
                      ) : (
                        <span className="pb__slot pb__slot--anzeige">
                          <span className="pb__zeit">{t.zeit} Uhr</span>
                          {lokal ? (
                            <span className="pb__lokal">bei dir {lokal}</span>
                          ) : null}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          );
        })}
      </div>
      <p className="pb__klein pb__zone">
        Alle Uhrzeiten gelten für die Zeitzone Berlin. In Wien und Zürich ist es
        dieselbe Uhrzeit.
      </p>
    </>
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

/** Der eine Satz unter „Wähl deinen Termin"; die Frist nur, wenn der Endpunkt sie meldet. */
function Unterzeile({schlussMin}) {
  const frist = fristText(schlussMin);
  return (
    <p className="pb__unterzeile">
      Donnerstags halte ich mir dafür Zeit frei.
      {frist ? ` Spontan? Bis ${frist} vorher kannst du noch buchen.` : ''}
    </p>
  );
}

function Buchen({daten, fehler, zone}) {
  const nav = useNavigation();
  const sendet =
    nav.state !== 'idle' && nav.formData?.get('intent') === 'buchen';
  const e = fehler?.eingabe || {};
  const auswahl = fehler?.slot || daten.vorwahl || '';
  // Gewählter Termin, damit die Seite merkt, wenn er beim Abdaten verschwindet. Nur ein
  // Termin, den es beim ersten Bild gab, zählt (eine alte Vorwahl löst keinen Hinweis aus).
  const [markiert, setMarkiert] = useState(() =>
    daten.termine.some((t) => t.slot_start === auswahl) ? auswahl : '',
  );
  const [verpasst, setVerpasst] = useState('');
  useEffect(() => {
    if (markiert && !daten.termine.some((t) => t.slot_start === markiert)) {
      const {datum, zeit} = teile(markiert);
      setVerpasst(
        `${tagName(datum)}, ${zeit} Uhr ist jetzt zu kurzfristig. Such dir bitte eine andere Zeit aus.`,
      );
      setMarkiert('');
    }
  }, [daten.termine, markiert]);
  const nimm = (slot) => {
    setMarkiert(slot);
    setVerpasst('');
  };

  if (daten.ladeFehler) {
    return (
      <section className="pb__termine" data-section="pb-termine" id="termine">
        <div className="pb__inhalt pb__inhalt--breit">
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
        <div className="pb__inhalt pb__inhalt--breit">
          <h2>Termine</h2>
          <p>
            Gerade sind alle Termine vergeben, neue kommen jede Woche dazu.
            Schreib uns gern an service@qiblanco.com.
          </p>
        </div>
      </section>
    );
  }

  if (!daten.buchungMoeglich) {
    return (
      <section className="pb__termine" data-section="pb-termine" id="termine">
        <div className="pb__inhalt pb__inhalt--breit">
          <h2>Die nächsten Termine</h2>
          <Unterzeile schlussMin={daten.buchungsschlussMin} />
          <Terminliste termine={daten.termine} mitRadio={false} zone={zone} />
          <p className="pb__bald">Die Buchung öffnet in Kürze.</p>
          <p>Bis dahin erreichst du uns unter service@qiblanco.com.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pb__termine" data-section="pb-termine" id="termine">
      <div className="pb__inhalt pb__inhalt--breit">
        <Form method="post" className="pb__form" preventScrollReset>
          <input type="hidden" name="intent" value="buchen" />
          <input type="hidden" name="tz" value={zone} />
          {/* Der Fehlersatz steht ÜBER der Terminliste: ist der gewählte Termin inzwischen vergeben, fehlt
              er nach dem Neuladen, kein Radio ist gewählt und :has() blendet die Angaben aus. */}
          <Hinweis art="fehler" text={fehler?.text} />
          <h2>Wähl deinen Termin</h2>
          <Unterzeile schlussMin={daten.buchungsschlussMin} />
          <Hinweis text={verpasst} />
          <Terminliste
            termine={daten.termine}
            mitRadio
            auswahl={auswahl}
            zone={zone}
            onWahl={nimm}
          />

          <div className="pb__felder">
            <h2>Deine Angaben</h2>
            <Feld name="name" label="Name" pflicht auto="name" wert={e.name} />
            <Feld
              name="email"
              label="E-Mail"
              typ="email"
              pflicht
              auto="email"
              wert={e.email}
            />
            <Feld
              name="telefon"
              label="Telefon"
              typ="tel"
              auto="tel"
              wert={e.telefon}
            />
            <div className="pb__feld">
              <label htmlFor="pb-produkt">
                Um welches Produkt geht es?
                <span className="pb__frei"> (freiwillig)</span>
              </label>
              <select
                id="pb-produkt"
                name="produkt"
                defaultValue={e.produkt || ''}
              >
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
              <textarea
                id="pb-anliegen"
                name="anliegen"
                rows={3}
                maxLength={1000}
                defaultValue={e.anliegen || ''}
              />
            </div>
            {/* Honigtopf: Menschen sehen und erreichen dieses Feld nicht (neben dem
                Bild, ohne Tab-Halt, ohne Autofill). Wer es füllt, bucht nicht. */}
            <div className="pb__topf" aria-hidden="true">
              <label htmlFor="pb-website">Website</label>
              <input
                id="pb-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>
            <button
              type="submit"
              className="pb__knopf"
              disabled={sendet}
              data-qa="cta"
            >
              {sendet ? 'Einen Moment …' : 'Termin verbindlich buchen'}
            </button>
            <p className="pb__klein">
              Wir speichern deinen Namen, deine E-Mail und deine freiwilligen
              Angaben nur für dieses Gespräch und löschen sie 60 Tage nach dem
              Termin. Mehr dazu in unserer{' '}
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
          {tagName(datum, true)}, {zeit} Uhr (Zeitzone Berlin)
          {lokal ? <span className="pb__lokal"> · bei dir {lokal}</span> : null}
        </dd>
      </div>
      {buchung.zoom_url ? (
        <div>
          <dt>Zoom-Link</dt>
          <dd>
            <a
              href={buchung.zoom_url}
              rel="noopener noreferrer"
              target="_blank"
              className="pb__zoom"
            >
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
        <p>
          Kommt keine Bestätigung, schreib uns bitte an service@qiblanco.com.
        </p>
      </div>
    </section>
  );
}

/** Warum ein Termin abgesagt ist: das entscheidet den Satz (der Endpunkt meldet es grob). */
const ABGESAGT = {
  kundin: [
    'Dein Termin ist abgesagt.',
    'Danke, dass du Bescheid gegeben hast, der Platz ist jetzt wieder frei.',
  ],
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

  const b =
    ergebnis?.ok && ergebnis.intent === 'absagen' && ergebnis.buchung
      ? ergebnis.buchung
      : daten.buchung;
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
    <section
      className={`pb__termine${neu ? ' pb__bestaetigt' : ''}`}
      data-section="pb-verwalten"
      id="termine"
    >
      <div className="pb__inhalt">
        <h2>{titel}</h2>
        {neu ? (
          <p>
            Heb dir diese Seite auf. Hier findest du jederzeit Zoom-Link und
            Kenncode, und hier kannst du absagen oder umbuchen.
          </p>
        ) : null}
        <Hinweis
          art="fehler"
          text={ergebnis && !ergebnis.ok ? ergebnis.text : ''}
        />
        <Termindaten
          buchung={b}
          token={daten.token}
          zone={zone}
          api={daten.api}
        />
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
              <p>
                Wenn du nicht kannst, sag ab, damit der Platz für jemand anderen
                frei wird.
              </p>
              <button
                type="submit"
                className="pb__knopf-zwei"
                disabled={sendet}
              >
                Termin absagen
              </button>
            </Form>
          </>
        )}
      </div>
    </section>
  );
}

/**
 * Was man Christian fragen kann: drei echte Alltagsbilder aus dem Shopify-Bestand
 * (dieselben Dateien wie Infoslider und Themenseiten), je eine praktische Frage.
 * Die Fragen werden hier nicht beantwortet: das ist das Gespräch. Die Menschen auf
 * den Bildern sind Models aus dem Bali-Shooting, keine Kunden, und werden nicht so
 * ausgegeben.
 */
const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
const FRAGEN = [
  {
    bild: `${CDN}qb-infoslider--infoslider-erholsame-naechte-bali-06825--2f21555b63e2.webp?v=1790389248`,
    alt: 'Ein Mann schläft im Bademantel auf weißer Bettwäsche, um den Hals trägt er einen Anhänger.',
    frage: 'Darf der Anhänger mit ins Bett?',
  },
  {
    bild: `${CDN}qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp?v=1790161971`,
    alt: 'Eine Frau sitzt mit dem Laptop auf dem Sofa, vor ihr ein Holztisch mit einem Glas Wasser.',
    frage: 'Wohin mit dem QiHome Air, wenn der Router im Flur steht?',
  },
  {
    bild: `${CDN}qb-themen--themen-zellen-qibracelet-gruensaft-canggu-06390--b4ab3f9b62c8.webp?v=1790161977`,
    alt: 'Ein Arm mit QiBracelet hält ein Glas grünen Saft vor Palmenblättern.',
    frage: 'Armband oder Anhänger: Was trage ich, wenn ich viel unterwegs bin?',
  },
];

function Fragen() {
  return (
    <section className="pb__fragen" data-section="pb-fragen">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>Was du mich fragen kannst</h2>
        <ul className="pb__bilder">
          {FRAGEN.map((f) => (
            <li key={f.frage}>
              <figure className="pb__bild">
                <img
                  src={`${f.bild}&width=600`}
                  srcSet={`${f.bild}&width=400 400w, ${f.bild}&width=600 600w, ${f.bild}&width=900 900w, ${f.bild}&width=1200 1200w`}
                  sizes="(min-width: 768px) 336px, 100vw"
                  width="600"
                  height="450"
                  loading="lazy"
                  decoding="async"
                  alt={f.alt}
                />
                <figcaption>{f.frage}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="pb__schon">
          Du trägst schon eins? Dann komm erst recht. Wir reden über die
          Kleinigkeiten: wie lang die Kette sein soll, ob du ihn nachts
          abnimmst, ob das Armband als Ergänzung Sinn ergibt.
        </p>
      </div>
    </section>
  );
}

/**
 * Drei Schritte, der dunkle Akt der Seite. In Christians Stimme (Anna-Review: die
 * Infinitive lasen sich wie eine Bedienungsanleitung; im dritten Schritt sprach die
 * Seite plötzlich in der dritten Person über ihn). Warteraum ist an (Christian 01.10.).
 */
function Ablauf() {
  return (
    <section className="pb__ablauf" data-section="pb-ablauf">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>So läuft es ab</h2>
        <ol className="pb__schritte">
          <li>
            <strong>Du suchst dir eine Zeit aus.</strong> Name und E-Mail
            reichen.
          </li>
          <li>
            <strong>Du bekommst den Zoom-Link.</strong> Er steht gleich nach der
            Buchung da, samt Kalenderdatei.
          </li>
          <li>
            <strong>Du klickst pünktlich rein.</strong> Kurz Warteraum, dann
            hole ich dich rein. Kamera an oder aus, wie du magst. Ein Handy
            reicht.
          </li>
        </ol>
      </div>
    </section>
  );
}

/**
 * Kundenstimmen: WÖRTLICH aus der kuratierten, echten Google-Liste
 * (app/lib/googleReviewsCurated.js), ausgewählt per id, nichts gekürzt oder
 * geglättet. Eine Stimme, die Anna nennt, fällt heraus (Christian 01.10.) —
 * deshalb hier nicht der Standard-Bewertungsblock: dessen Kartenreihe zeigt
 * die ganze Liste, auch die Rezension mit „Danke … an Anna und Christian".
 * Die Note verlinkt auf das Google-Profil (lp-paritaet T-02); der Klick zu
 * Google ist wie im Bewertungsblock der einzige Weg aus dem Block.
 */
const STIMMEN_IDS = ['-729236865', '850007411', '-1868946154'];
const STIMMEN = STIMMEN_IDS.map((id) =>
  GOOGLE_REVIEWS_CURATED.find((r) => r.id === id),
).filter((r) => r && !/anna/i.test(`${r.name} ${r.text}`));

function Stimmen() {
  const g = useGoogleRating();
  if (!STIMMEN.length) return null;
  return (
    <section className="pb__stimmen" data-section="pb-stimmen">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>Das schreiben Kunden bei Google</h2>
        <ul className="pb__zitate">
          {STIMMEN.map((r) => (
            <li key={r.id} className="pb__zitat">
              <p className="pb__sterne" aria-label="5 von 5 Sternen">
                ★★★★★
              </p>
              <blockquote>
                {r.text.split('\n').map((zeile) => (
                  <p key={zeile.slice(0, 32)}>{zeile}</p>
                ))}
              </blockquote>
              <p className="pb__zitat-name">{r.name}, Google-Rezension</p>
            </li>
          ))}
        </ul>
        <p className="pb__quelle">
          <a href={g.url} target="_blank" rel="noopener noreferrer">
            Alle Google-Rezensionen ansehen: {g.komma} von 5 Sternen
          </a>
        </p>
      </div>
    </section>
  );
}

/** Schluss: ein Satz und der Weg zurück zu den Terminen (nur in der Buchen-Ansicht). */
function Schluss() {
  return (
    <section className="pb__schluss" data-section="pb-schluss">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>Bis Donnerstag?</h2>
        <p>Such dir eine Zeit aus, hol dir einen Kaffee, und dann reden wir.</p>
        <p className="pb__weg">
          <a href="#termine" className="pb__knopf-zwei">
            Termin aussuchen
          </a>
        </p>
      </div>
    </section>
  );
}

export function ProduktberatungSeite() {
  const roh = useLoaderData();
  const ergebnis = useAktionsergebnisUeberRevalidierung();
  const zone = useKundenZone();
  const jetzt = useJetzt();
  // Abgedatete Termine fallen hier heraus, für Buchen UND Umbuchen; leere Tageskarten mit ihnen.
  const daten = {
    ...roh,
    termine: nochBuchbar(roh.termine || [], roh.buchungsschlussMin, jetzt),
  };

  let mitte;
  if (daten.token)
    mitte = <Verwalten daten={daten} ergebnis={ergebnis} zone={zone} />;
  else if (ergebnis?.ok && ergebnis.intent === 'buchen') mitte = <Danke />;
  else
    mitte = (
      <Buchen
        daten={daten}
        fehler={ergebnis && !ergebnis.ok ? ergebnis : null}
        zone={zone}
      />
    );

  const buchenAnsicht =
    !daten.token && !(ergebnis?.ok && ergebnis.intent === 'buchen');
  return (
    <div className="pb">
      <Kopf mitWeg={buchenAnsicht} />
      {mitte}
      <Fragen />
      <Ablauf />
      <Stimmen />
      {buchenAnsicht ? <Schluss /> : null}
    </div>
  );
}
