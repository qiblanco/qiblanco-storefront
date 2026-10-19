import {useEffect, useState} from 'react';
import {Form, useActionData, useLoaderData, useNavigation} from 'react-router';

/**
 * /pages/sprechstunde — Darstellung (Route: app/routes/pages.sprechstunde.jsx).
 *
 * Grossjob 20261019-GROSSJOB-sprechstunde-mit-christian-ticket-300-eur-freitags-
 * 20-uhr-buchung-live-unter-mehr, s05. Reihenfolge nach KONZEPT 5
 * (Kaufüberzeugung: Menschen ziehen, Beweis schließt): Einstieg mit Christian
 * -> Was passiert -> Geschichte -> Ablauf (dunkler Akt) -> Freitage + Angaben
 * -> Gut zu wissen (eingeklappt unter dem Knopf) -> Fragen.
 *
 * TEXT WORTGLEICH aus shared-state/sprechstunde/seite/text-de.md (Variante B:
 * Christians Diktat, nur getaktet; s03). Nicht umschreiben, nicht glätten: die
 * Naht-Probe sprechstunde/seite/pruefung/probe_seite_live.py misst die
 * Wortlaut-Stellen am ausgelieferten HTML, und jedes geänderte Wort macht das
 * Richter-Urteil von s03 ungültig. Der Abschnitt „erfolge" fehlt mit Absicht:
 * dort steht noch der Platzhalter (kein Erfahrungsbericht mit Einwilligung).
 * Formular-, Fehler- und Hinweissätze sind Rahmen, nicht Christians Text.
 * Der Haken „vorzeitig beginnen" ist wortgleich aus
 * sprechstunde/konzept/rechtsklaerung-ticket.md (Pflichttext).
 *
 * ZEITEN: deutsche Zeit (start_berlin des Dienstes, ohne Intl gerechnet, damit
 * Server und erster Browser-Render gleich sind). Nach dem Laden erscheint der
 * Umschalter „in meiner Zeit" (Intl, Zone des Browsers), nur wenn die Uhr des
 * Browsers nicht die deutsche ist. Gebucht wird immer über start_utc.
 *
 * FUNKTIONIERT OHNE JAVASCRIPT: Freitage sind Radio-Knöpfe im Formular, das
 * Formular ist ein echter POST (reloadDocument), die Kasse ein 303. Ohne
 * JavaScript steht der Haken „vorzeitig beginnen" immer da (der Dienst
 * verlangt ihn nur bei einem Freitag innerhalb der Widerrufsfrist); mit
 * JavaScript nur, wenn der gewählte Freitag ihn braucht.
 */

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
const ZONEN_WIE_BERLIN = new Set([
  'Europe/Berlin',
  'Europe/Vienna',
  'Europe/Zurich',
]);
const SERVICE = 'service@qiblanco.com';
const FOTO =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Christian.jpg?v=1668985845';
const VORZEITIG_TEXT =
  'Bitte schon vor Ablauf der Widerrufsfrist beginnen; mir ist bewusst, dass mein Widerrufsrecht mit dem Gespräch erlischt.';

/** '2026-10-23T15:00:00+02:00' -> Teile der deutschen Zeit, ohne Intl (gleich auf Server und Browser). */
export function berlinTeile(startBerlin) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(
    String(startBerlin || ''),
  );
  if (!m) return null;
  const [j, mo, t, h, mi] = m.slice(1).map(Number);
  const wt = new Date(Date.UTC(j, mo - 1, t)).getUTCDay();
  return {wochentag: WOCHENTAGE[wt], tag: t, monat: MONATE[mo - 1], h, mi};
}

function uhr(h, mi) {
  return mi ? `${h}:${String(mi).padStart(2, '0')} Uhr` : `${h} Uhr`;
}

/** „Freitag, 23. Oktober" und „15 Uhr" in deutscher Zeit. */
export function berlinText(startBerlin) {
  const b = berlinTeile(startBerlin);
  if (!b) return {datum: '', zeit: ''};
  return {datum: `${b.wochentag}, ${b.tag}. ${b.monat}`, zeit: uhr(b.h, b.mi)};
}

/** Dieselbe Angabe in der Zone des Browsers (nur nach dem Laden aufgerufen). */
function ortText(startUtc, zone) {
  const d = new Date(startUtc);
  if (Number.isNaN(d.getTime())) return {datum: '', zeit: ''};
  const teile = Object.fromEntries(
    new Intl.DateTimeFormat('de-DE', {
      timeZone: zone,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(d)
      .map((p) => [p.type, p.value]),
  );
  return {
    datum: `${teile.weekday}, ${teile.day}. ${teile.month}`,
    zeit: uhr(Number(teile.hour), Number(teile.minute)),
  };
}

/** Zone des Browsers, wenn sie nicht die deutsche Uhr hat; sonst ''. */
function useFremdeZone() {
  const [zone, setZone] = useState('');
  useEffect(() => {
    try {
      const z = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (z && !ZONEN_WIE_BERLIN.has(z)) setZone(z);
    } catch {
      setZone('');
    }
  }, []);
  return zone;
}

function useGeladen() {
  const [geladen, setGeladen] = useState(false);
  useEffect(() => setGeladen(true), []);
  return geladen;
}

function zeitFuer(termin, meine, zone) {
  return meine && zone
    ? ortText(termin.start_utc, zone)
    : berlinText(termin.start_berlin);
}

/* ─── Bausteine ─────────────────────────────────────────────────────────── */

function Zeitumschalter({zone, meine, setMeine}) {
  if (!zone) return null;
  return (
    <div className="sp__umschalter" role="group" aria-label="Zeitangabe">
      <button
        type="button"
        className="sp__umschalter-knopf"
        aria-pressed={!meine}
        onClick={() => setMeine(false)}
      >
        Deutsche Zeit
      </button>
      <button
        type="button"
        className="sp__umschalter-knopf"
        aria-pressed={meine}
        onClick={() => setMeine(true)}
      >
        In meiner Zeit
      </button>
    </div>
  );
}

function Freitage({termine, name, auswahl, setAuswahl, meine, zone, legende}) {
  return (
    <fieldset className="sp__freitage">
      <legend className="sp__legende">{legende}</legend>
      <ul className="sp__freitage-liste">
        {termine.map((t) => {
          const z = zeitFuer(t, meine, zone);
          const b = berlinTeile(t.start_berlin);
          return (
            <li key={t.start_utc}>
              <label
                className="sp__freitag"
                aria-label={`${z.datum}, ${z.zeit}`}
              >
                <input
                  type="radio"
                  name={name}
                  value={t.start_utc}
                  checked={auswahl === t.start_utc}
                  onChange={() => setAuswahl(t.start_utc)}
                  required
                />
                <span className="sp__kachel" aria-hidden="true">
                  <span className="sp__kachel-zahl">{b?.tag}</span>
                  <span className="sp__kachel-monat">
                    {b?.monat.slice(0, 3)}
                  </span>
                </span>
                <span className="sp__freitag-text">
                  <span className="sp__freitag-datum">{z.datum}</span>
                  <span className="sp__freitag-zeit">{z.zeit}, 60 Minuten</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

function Fehler({text}) {
  if (!text) return null;
  return (
    <p className="sp__fehler" role="alert">
      {text}
    </p>
  );
}

function Vorzeitig({sichtbar}) {
  if (!sichtbar) return null;
  return (
    <label className="sp__haken">
      <input type="checkbox" name="zustimmung_vorzeitig" value="1" />
      <span>{VORZEITIG_TEXT}</span>
    </label>
  );
}

function GutZuWissen() {
  return (
    <details className="sp__wissen">
      <summary>Gut zu wissen</summary>
      <div className="sp__wissen-text">
        <p>
          Ich nehme mir für dich eine ganze Stunde, live per Zoom, und dafür
          kaufst du vorher ein Ticket für 300 EUR. Ein Ticket gilt für ein
          Gespräch. Idealerweise ist das Ticket gleich einem Termin zugeordnet.
          Du kannst den Freitag aber auch später mit deinem Ticketcode wählen.
        </p>
        <p>
          Das Ticket verfällt nicht, falls ein Termin ausfallen sollte. Fällt er
          von unserer Seite aus, wählst du einen neuen Freitag oder bekommst dein
          Geld zurück.
        </p>
        <p>
          Das Ticket ist persönlich und läuft auf deinen Namen. Schaffst du es
          doch nicht, schreib uns, dann tragen wir gern jemand anderen ein.
          Verschieben geht bis 24 Stunden vorher, mit dem Link aus deiner
          Bestätigung.
        </p>
        <p>
          Es besteht das klassische 14 Tage Widerrufsrecht ab dem Kauf. Liegt
          dein Freitag schon innerhalb dieser 14 Tage, bestätigst du vor der
          Kasse, dass wir vorher starten. Das Widerrufsrecht endet dann mit
          unserem Gespräch. Einlösen kannst du dein Ticket bis zum 31.12. des
          dritten Jahres nach dem Kauf.
        </p>
      </div>
    </details>
  );
}

/* ─── Ansicht Buchen ────────────────────────────────────────────────────── */

function Einstieg({termine, preisText}) {
  const naechster = termine[0] ? berlinText(termine[0].start_berlin) : null;
  return (
    <section className="sp__einstieg">
      <div className="sp__inhalt sp__inhalt--breit sp__einstieg-raster">
        <div className="sp__einstieg-text">
          <h1>Sprechstunde mit Christian</h1>
          <p className="sp__unterzeile">
            Ein sehr tiefes Gespräch, auf Basis des Jetzt.
          </p>
          <p>
            Ich biete pro Woche nur einen Termin an. Der ist freitags um 8 Uhr
            abends bei mir, von 8 bis 9. Die deutsche Zeit passt sich dann immer
            an.
          </p>
          <p className="sp__eckdaten">
            Freitags, 60 Minuten live per Zoom · {preisText}
          </p>
          {naechster ? (
            <p className="sp__naechster">
              Nächster Termin: {naechster.datum}, {naechster.zeit}
            </p>
          ) : null}
          <a className="sp__knopf" href="#freitage">
            Freitag wählen
          </a>
        </div>
        <figure className="sp__foto">
          <img
            src={`${FOTO}&width=720`}
            srcSet={`${FOTO}&width=480 480w, ${FOTO}&width=720 720w, ${FOTO}&width=1200 1200w`}
            sizes="(min-width: 768px) 360px, 100vw"
            width="1200"
            height="1535"
            alt="Christian Bernd Bauer, Gründer von Qi Blanco"
            fetchpriority="high"
          />
        </figure>
      </div>
    </section>
  );
}

function WasPassiert() {
  return (
    <section className="sp__akt-flaeche">
      <div className="sp__inhalt">
        <h2>Was in der Sprechstunde passiert</h2>
        <p className="sp__gross">
          Das Ziel ist, dass wir ein sehr tiefes Gespräch führen auf Basis des
          Jetzt. Und Limitierungen, die den aktuellen Zustand blockieren,
          erkennen und verändern.
        </p>
      </div>
    </section>
  );
}

function Geschichte() {
  return (
    <section>
      <div className="sp__inhalt">
        <h2>Wie es angefangen hat</h2>
        <p>
          Während meines Diplomstudiums war ich auf einem Fachseminar zur
          Paleo-Ernährung. Dort hat mich ein Doktor der Wirtschaftswissenschaften
          auf eine Spontanheilung nach dem Besuch eines Geistheilers aufmerksam
          gemacht.
        </p>
        <p>
          Er selbst konnte das noch nicht so richtig einordnen, weil er überhaupt
          nicht dafür offen war, solche spirituellen Dinge zu erfahren. Aber er
          konnte es nicht mehr leugnen. Sein ganzer physischer Zustand hatte sich
          innerhalb von wenigen Sekunden geändert. Sein steifer Rücken, den er
          seit Jahrzehnten hatte, hat sich komplett aufgelöst. Und er konnte
          seitdem mit flachen Händen auf dem Boden lang, mit ausgestreckten
          Knien.
        </p>
        <p>
          Dieses Phänomen hat mich so fasziniert, dass ich gesagt habe: Okay, ich
          möchte dem auf den Grund gehen.
        </p>
        <p>
          Ich habe angefangen, diesen Geistheiler zu besuchen und eine Ausbildung
          bei ihm zu machen. Ich wollte verstehen, welche physikalischen
          Grundlagen da passieren in der Realität. Bis dato war das als rein
          esoterisch verschrien.
        </p>
        <p>
          Auf dieser Basis habe ich erfahren, dass Gedanken, gelöste Traumata,
          Gedankenmuster via Gehirnfrequenzen übertragbar sind auf andere Gehirne.
          Und somit das lernende Gehirn schlagartig Veränderungen im
          Nervensystem erzeugen kann.
        </p>
        <p>
          Es war für mich so weltverändernd, dass ich dann immer weitergegangen
          bin. Daraus resultiert meine Leidenschaft, die Physik und die
          Spiritualität ineinander zu bringen. Das war für mich eins der
          entscheidendsten Beispiele, dass es real ist.
        </p>
        <p>
          Begründet mit den Entdeckungen der Quantenphysik und dem tiefen Glauben
          aller großen Wissenschaftler an Gott habe ich mich auf den Weg gemacht,
          um diese unerforschte Wissenschaft für die Alltagssituation nahbar zu
          machen.
        </p>
        <p>
          Ein Teil daraus ist Qi Blanco geworden. Ein anderer Teil ist eine 1:1
          Arbeit am Menschen, die ich bis 2026 nicht öffentlich beworben habe.
          Ich kann schon große Erfolge damit vorzeigen. Und ab 2026 möchte ich es
          der Öffentlichkeit zur Verfügung stellen.
        </p>
      </div>
    </section>
  );
}

function Ablauf() {
  return (
    <section className="sp__akt-dunkel">
      <div className="sp__inhalt sp__inhalt--breit">
        <h2>So läuft es ab</h2>
        <ol className="sp__schritte">
          <li>Such dir einen freien Freitag aus.</li>
          <li>Kauf dein Ticket.</li>
          <li>Du bekommst deine Bestätigung mit dem Zoom-Link.</li>
          <li>Live mit mir per Zoom :)</li>
        </ol>
      </div>
    </section>
  );
}

function Buchen({daten, fehler, eingabe}) {
  const {termine, buchungMoeglich, preisText, vorzeitigVorUtc, anliegenMin} =
    daten;
  const geladen = useGeladen();
  const zone = useFremdeZone();
  const [meine, setMeine] = useState(false);
  const [auswahl, setAuswahl] = useState('');
  const nav = useNavigation();
  const sendet = nav.state === 'submitting';
  const vorzeitigNoetig =
    !geladen ||
    (auswahl && vorzeitigVorUtc && Date.parse(auswahl) < Date.parse(vorzeitigVorUtc));

  return (
    <section id="freitage" className="sp__buchen">
      <div className="sp__inhalt">
        <h2>Die nächsten Freitage</h2>
        {daten.ladeFehler ? (
          <p className="sp__hinweis">
            Die Freitage laden gerade nicht. Bitte versuch es gleich noch einmal
            oder schreib uns an <a href={`mailto:${SERVICE}`}>{SERVICE}</a>.
          </p>
        ) : termine.length === 0 ? (
          <p className="sp__hinweis">
            Gerade ist kein Freitag frei. Schreib uns an{' '}
            <a href={`mailto:${SERVICE}`}>{SERVICE}</a>, dann melden wir uns.
          </p>
        ) : (
          <Form method="post" reloadDocument className="sp__formular">
            <input type="hidden" name="intent" value="reservieren" />
            <Zeitumschalter zone={zone} meine={meine} setMeine={setMeine} />
            <Freitage
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              meine={meine}
              zone={zone}
              legende="Wähl deinen Freitag"
            />
            {buchungMoeglich ? (
              <div className="sp__angaben">
                <TzFeld />
                <div className="sp__feld">
                  <label htmlFor="sp-name">Dein Name (steht auf dem Ticket)</label>
                  <input
                    id="sp-name"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={120}
                    defaultValue={eingabe?.name}
                  />
                </div>
                <div className="sp__feld">
                  <label htmlFor="sp-email">E-Mail</label>
                  <input
                    id="sp-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={200}
                    defaultValue={eingabe?.email}
                  />
                </div>
                <div className="sp__feld">
                  <label htmlFor="sp-telefon">Telefon (freiwillig)</label>
                  <input
                    id="sp-telefon"
                    name="telefon"
                    type="tel"
                    autoComplete="tel"
                    maxLength={60}
                    defaultValue={eingabe?.telefon}
                  />
                </div>
                <div className="sp__feld">
                  <label htmlFor="sp-anliegen">Worum geht es dir?</label>
                  <textarea
                    id="sp-anliegen"
                    name="anliegen"
                    required
                    minLength={anliegenMin}
                    maxLength={2000}
                    rows={5}
                    defaultValue={eingabe?.anliegen}
                    aria-describedby="sp-anliegen-hinweis"
                  />
                  <p id="sp-anliegen-hinweis" className="sp__klein">
                    Ein paar Sätze, mindestens {anliegenMin} Zeichen.
                  </p>
                </div>
                <div className="sp__honig" aria-hidden="true">
                  <label htmlFor="sp-website">Website</label>
                  <input
                    id="sp-website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <label className="sp__haken">
                  <input
                    type="checkbox"
                    name="zustimmung_bedingungen"
                    value="1"
                    required
                  />
                  <span>
                    Ich habe „Gut zu wissen“ gelesen und bin mit den Bedingungen
                    einverstanden.
                  </span>
                </label>
                <Vorzeitig sichtbar={vorzeitigNoetig} />
                <Fehler text={fehler} />
                <button
                  type="submit"
                  className="sp__knopf sp__knopf--breit"
                  disabled={sendet}
                >
                  Ticket kaufen · {preisText}
                </button>
                <p className="sp__klein">
                  Danach geht es direkt in die Kasse. Der Freitag ist 30 Minuten
                  für dich reserviert.
                </p>
              </div>
            ) : (
              <p className="sp__hinweis">Die Buchung öffnet in Kürze.</p>
            )}
            <GutZuWissen />
          </Form>
        )}
      </div>
    </section>
  );
}

/** Zeitzone des Browsers für die Bestätigungsmail (nach dem Laden gesetzt). */
function TzFeld() {
  const [tz, setTz] = useState('');
  useEffect(() => {
    try {
      setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    } catch {
      setTz('');
    }
  }, []);
  return <input type="hidden" name="tz" value={tz} />;
}

function Fragen() {
  return (
    <section className="sp__akt-flaeche">
      <div className="sp__inhalt">
        <h2>Fragen</h2>
        <h3>Was soll ich vorbereiten?</h3>
        <p>
          Schreib mir bei der Buchung ein paar Sätze, worum es dir geht, dann
          kann ich mich auf dich vorbereiten.
        </p>
        <h3>Du hast schon ein Ticket?</h3>
        <p>
          Super :) Mit dem Ticketcode aus deiner Mail suchst du dir deinen
          Freitag aus.
        </p>
        <TicketcodeFormular />
      </div>
    </section>
  );
}

function TicketcodeFormular() {
  return (
    <form method="get" action="/pages/sprechstunde" className="sp__code">
      <label htmlFor="sp-code">Ticketcode</label>
      <div className="sp__code-zeile">
        <input
          id="sp-code"
          name="ticket"
          placeholder="SP-XXXX-XXXX"
          autoComplete="off"
          required
          maxLength={32}
        />
        <button type="submit" className="sp__knopf-zweit">
          Code einlösen
        </button>
      </div>
    </form>
  );
}

/* ─── Ansichten mit Ticket oder Buchung ─────────────────────────────────── */

function Termin({buchung, meine, zone}) {
  const z = zeitFuer(
    {start_utc: buchung.start_utc, start_berlin: buchung.start_berlin},
    meine,
    zone,
  );
  const deutsch = berlinTextAusUtc(buchung.start_utc);
  const zeige = meine && zone ? z : deutsch;
  return (
    <p className="sp__termin">
      <span className="sp__freitag-datum">{zeige.datum}</span>
      <span className="sp__freitag-zeit">{zeige.zeit}, 60 Minuten</span>
    </p>
  );
}

/** Deutsche Zeit aus start_utc: die Buchungs-Antwort trägt kein start_berlin. */
function berlinTextAusUtc(startUtc) {
  const d = new Date(startUtc);
  if (Number.isNaN(d.getTime())) return {datum: '', zeit: ''};
  // Sommerzeit Berlin: letzter Sonntag März 01:00 UTC bis letzter Sonntag Oktober 01:00 UTC.
  const j = d.getUTCFullYear();
  const letzterSonntag = (m) => {
    const x = new Date(Date.UTC(j, m + 1, 0, 1));
    x.setUTCDate(x.getUTCDate() - x.getUTCDay());
    return x.getTime();
  };
  const sommer =
    d.getTime() >= letzterSonntag(2) && d.getTime() < letzterSonntag(9);
  const b = new Date(d.getTime() + (sommer ? 2 : 1) * 3600000);
  const iso = `${b.toISOString().slice(0, 19)}${sommer ? '+02:00' : '+01:00'}`;
  return berlinText(iso);
}

function Verwalten({daten, fehler}) {
  const {buchung, status, umbuchenMoeglich, termine} = daten;
  const zone = useFremdeZone();
  const [meine, setMeine] = useState(false);
  const [auswahl, setAuswahl] = useState('');
  if (!buchung) {
    return (
      <section className="sp__buchen">
        <div className="sp__inhalt">
          <h1>Dein Termin</h1>
          <p className="sp__hinweis">{daten.fehler}</p>
        </div>
      </section>
    );
  }
  const aktiv = buchung.status === 'gebucht';
  return (
    <section className="sp__buchen">
      <div className="sp__inhalt">
        <h1>
          {status === 'umgebucht'
            ? 'Dein neuer Termin steht'
            : aktiv
            ? 'Dein Termin steht'
            : 'Dein Termin'}
        </h1>
        <Zeitumschalter zone={zone} meine={meine} setMeine={setMeine} />
        <Termin buchung={buchung} meine={meine} zone={zone} />
        {aktiv ? (
          <div className="sp__karte">
            {buchung.zoom_bereit && buchung.zoom_url ? (
              <>
                <p>
                  <a className="sp__knopf" href={buchung.zoom_url}>
                    Zoom öffnen
                  </a>
                </p>
                {buchung.zoom_kenncode ? (
                  <p>Kenncode: {buchung.zoom_kenncode}</p>
                ) : null}
              </>
            ) : (
              <p>Den Zoom-Link bekommst du per Mail, sobald er bereit ist.</p>
            )}
            <p>
              <a
                className="sp__knopf-zweit"
                href="/pages/sprechstunde?verwalten=1&kalender=1"
                download
              >
                In den Kalender
              </a>
            </p>
            {buchung.ticket_code ? (
              <p className="sp__klein">Ticketcode: {buchung.ticket_code}</p>
            ) : null}
          </div>
        ) : (
          <p className="sp__hinweis">
            Dieser Termin ist nicht mehr aktiv. Schreib uns gern an{' '}
            <a href={`mailto:${SERVICE}`}>{SERVICE}</a>.
          </p>
        )}
        {aktiv && umbuchenMoeglich && termine.length ? (
          <Form method="post" reloadDocument className="sp__formular">
            <input type="hidden" name="intent" value="umbuchen" />
            <Freitage
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              meine={meine}
              zone={zone}
              legende="Auf einen anderen Freitag verschieben"
            />
            <Fehler text={fehler} />
            <button type="submit" className="sp__knopf-zweit">
              Verschieben
            </button>
          </Form>
        ) : aktiv ? (
          <p className="sp__klein">
            Verschieben geht bis 24 Stunden vorher. Danach schreib uns an{' '}
            <a href={`mailto:${SERVICE}`}>{SERVICE}</a>.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function Einloesen({daten, fehler}) {
  const {ticket, buchung, einloesbar, termine, buchungMoeglich, vorzeitigVorUtc} =
    daten;
  const geladen = useGeladen();
  const zone = useFremdeZone();
  const [meine, setMeine] = useState(false);
  const [auswahl, setAuswahl] = useState('');
  const vorzeitigNoetig =
    !geladen ||
    (auswahl && vorzeitigVorUtc && Date.parse(auswahl) < Date.parse(vorzeitigVorUtc));
  return (
    <section className="sp__buchen">
      <div className="sp__inhalt">
        <h1>
          {ticket?.vorname ? `Dein Ticket, ${ticket.vorname}` : 'Dein Ticket'}
        </h1>
        {!ticket ? <p className="sp__hinweis">{daten.fehler}</p> : null}
        {buchung ? (
          <>
            <p>Dein Freitag steht schon:</p>
            <Termin buchung={buchung} meine={meine} zone={zone} />
          </>
        ) : null}
        {ticket && !einloesbar && daten.hinweis ? (
          <p className="sp__hinweis">{daten.hinweis}</p>
        ) : null}
        {ticket && einloesbar && !buchungMoeglich ? (
          <p className="sp__hinweis">Die Buchung öffnet in Kürze.</p>
        ) : null}
        {ticket && einloesbar && buchungMoeglich && termine.length ? (
          <Form method="post" reloadDocument className="sp__formular">
            <input type="hidden" name="intent" value="einloesen" />
            <TzFeld />
            <Zeitumschalter zone={zone} meine={meine} setMeine={setMeine} />
            <Freitage
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              meine={meine}
              zone={zone}
              legende="Wähl deinen Freitag"
            />
            {!ticket.anliegen_vorhanden ? (
              <div className="sp__feld">
                <label htmlFor="sp-anliegen">Worum geht es dir?</label>
                <textarea
                  id="sp-anliegen"
                  name="anliegen"
                  required
                  minLength={daten.anliegenMin}
                  maxLength={2000}
                  rows={5}
                />
              </div>
            ) : null}
            <Vorzeitig sichtbar={vorzeitigNoetig} />
            <Fehler text={fehler} />
            <button type="submit" className="sp__knopf sp__knopf--breit">
              Freitag buchen
            </button>
          </Form>
        ) : null}
        {!ticket ? <TicketcodeFormular /> : null}
      </div>
    </section>
  );
}

export function SprechstundeSeite() {
  const daten = useLoaderData();
  const aktion = useActionData();
  const fehler = aktion && !aktion.ok ? aktion.text : '';
  if (daten.ansicht === 'verwalten')
    return (
      <div className="sp">
        <Verwalten daten={daten} fehler={fehler} />
      </div>
    );
  if (daten.ansicht === 'einloesen')
    return (
      <div className="sp">
        <Einloesen daten={daten} fehler={fehler} />
      </div>
    );
  return (
    <div className="sp">
      <Einstieg termine={daten.termine} preisText={daten.preisText} />
      <WasPassiert />
      <Geschichte />
      <Ablauf />
      <Buchen daten={daten} fehler={fehler} eingabe={aktion?.eingabe} />
      <Fragen />
    </div>
  );
}
