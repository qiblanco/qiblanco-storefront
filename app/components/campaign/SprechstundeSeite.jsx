import {useEffect, useState} from 'react';
import {Form, useLoaderData, useNavigation} from 'react-router';
import {useAktionsergebnisUeberRevalidierung} from '~/lib/aktionsergebnis';

/**
 * /pages/sprechstunde — Darstellung (Route: app/routes/pages.sprechstunde.jsx).
 *
 * LANDINGPAGE (Christian 20.10.2026, Job 20261020-sprechstunde-lp-umbau-
 * kundennutzen-3wochen-browserzeit): „mehr Fokus auf ‚what do I get?‘ als
 * Kunde“, „wie eine LP gebaut, nicht wie eine Selbstreflexion“, die Geschichte
 * nur kurz. Gliederung fest in neun Abschnitten, jeder mit data-section (das
 * Sim-Tor prüft die Reihenfolge je Gerät):
 *   1 sp-kopf  2 sp-abholen  3 sp-nutzen  4 sp-zielgruppe  5 sp-ablauf
 *   6 sp-christian (2 bis 4 Sätze Hintergrund)  7 sp-ticket  8 sp-fragen
 *   9 sp-termine (Handlungsaufruf mit Terminen und Formular).
 * Text: shared-state/sprechstunde/seite/text-de-lp.md, vom PR-Manager
 * (pr-manager chef, Gegenstand seite:/pages/sprechstunde) freigegeben; seine
 * Freigabe steht als pr_freigabe in sprechstunde/exports/stand.json. Christians
 * Grundaussage liegt wortgleich NUR auf dem Server (grundaussage_pfad).
 *
 * BLUE-GREEN: LP_FASSUNG = 'alt' stellt die Fassung vom 19.10. (#953) wieder
 * her, mit Zeitumschalter „Deutsche Zeit / In meiner Zeit“. Kein zweiter
 * Code-Pfad im Kaufweg: Formular, Action und Kasse sind dieselben.
 *
 * ZEITEN IN DER ZONE DES BROWSERS: der Server und der erste Render im Browser
 * zeigen deutsche Zeit (start_berlin, ohne Intl, damit beide gleich sind). Nach
 * dem Laden rechnet jede Terminangabe per Intl in
 * Intl.DateTimeFormat().resolvedOptions().timeZone um, und der Hinweis wechselt
 * auf „Zeiten in deiner Ortszeit“. Intern bleibt der Termin Freitag 20 bis 21
 * Uhr in Christians Zeit; gebucht wird immer über start_utc.
 * Die Route liefert nur Termine der nächsten 21 Tage (HORIZONT_TAGE).
 *
 * FUNKTIONIERT OHNE JAVASCRIPT: Termine sind Radio-Knöpfe im Formular, das
 * Formular ist ein echter POST (reloadDocument), die Kasse ein 303. Ohne
 * JavaScript steht der Haken „vorzeitig beginnen“ immer da (der Dienst
 * verlangt ihn nur bei einem Termin innerhalb der Widerrufsfrist); mit
 * JavaScript nur, wenn der gewählte Termin ihn braucht.
 */

export const LP_FASSUNG = 'neu';

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

/** Dieselben Teile in einer beliebigen Zone, per Intl (nur im Browser nach dem Laden). */
export function zonenTeile(startUtc, zone) {
  const d = new Date(startUtc);
  if (Number.isNaN(d.getTime())) return null;
  try {
    const t = Object.fromEntries(
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
      wochentag: t.weekday,
      tag: Number(t.day),
      monat: t.month,
      h: Number(t.hour),
      mi: Number(t.minute),
    };
  } catch {
    return null;
  }
}

function uhr(h, mi) {
  return mi ? `${h}:${String(mi).padStart(2, '0')} Uhr` : `${h} Uhr`;
}

function alsText(b) {
  if (!b) return {datum: '', zeit: '', tag: '', monat: ''};
  return {
    datum: `${b.wochentag}, ${b.tag}. ${b.monat}`,
    zeit: uhr(b.h, b.mi),
    tag: b.tag,
    monat: b.monat,
  };
}

/** „Freitag, 23. Oktober" und „15 Uhr" in deutscher Zeit. */
export function berlinText(startBerlin) {
  return alsText(berlinTeile(startBerlin));
}

/** Deutsche Zeit aus start_utc: die Buchungs-Antwort trägt kein start_berlin. */
function berlinAusUtc(startUtc) {
  const d = new Date(startUtc);
  if (Number.isNaN(d.getTime())) return '';
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
  return `${b.toISOString().slice(0, 19)}${sommer ? '+02:00' : '+01:00'}`;
}

/**
 * Angabe eines Termins: ohne Zone (Server, erster Render) deutsche Zeit, mit
 * Zone die Zeit dieser Zone. Scheitert Intl, bleibt es bei der deutschen Zeit.
 */
export function terminText(termin, zone) {
  const berlin = termin.start_berlin || berlinAusUtc(termin.start_utc);
  if (zone) {
    const z = zonenTeile(termin.start_utc, zone);
    if (z) return alsText(z);
  }
  return berlinText(berlin);
}

/** Zone des Browsers, nach dem Laden; vorher ''. */
function useBrowserZone() {
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

function useGeladen() {
  const [geladen, setGeladen] = useState(false);
  useEffect(() => setGeladen(true), []);
  return geladen;
}

/* ─── Zeitangaben: neu (Browser) und alt (Umschalter) ───────────────────── */

/**
 * Neu: die Zone des Browsers gilt immer. Alt (LP_FASSUNG 'alt'): deutsche Zeit,
 * die fremde Zone nur auf Knopfdruck.
 */
function useZeit(fassung) {
  const zone = useBrowserZone();
  const [meine, setMeine] = useState(false);
  if (fassung === 'alt') {
    const fremd = zone && !ZONEN_WIE_BERLIN.has(zone) ? zone : '';
    return {zone: meine ? fremd : '', fremd, meine, setMeine, fassung};
  }
  return {zone, fremd: '', meine: false, setMeine: () => {}, fassung};
}

function ZeitHinweis({zeit}) {
  if (zeit.fassung === 'alt') return <Zeitumschalter zeit={zeit} />;
  return (
    <p
      className="sp__zeithinweis"
      data-zeitzone={zeit.zone || 'Europe/Berlin'}
      data-zeitquelle={zeit.zone ? 'browser' : 'server'}
    >
      {zeit.zone ? 'Zeiten in deiner Ortszeit' : 'Zeiten in deutscher Zeit'}
    </p>
  );
}

function Zeitumschalter({zeit}) {
  if (!zeit.fremd) return null;
  return (
    <div className="sp__umschalter" role="group" aria-label="Zeitangabe">
      <button
        type="button"
        className="sp__umschalter-knopf"
        aria-pressed={!zeit.meine}
        onClick={() => zeit.setMeine(false)}
      >
        Deutsche Zeit
      </button>
      <button
        type="button"
        className="sp__umschalter-knopf"
        aria-pressed={zeit.meine}
        onClick={() => zeit.setMeine(true)}
      >
        In meiner Zeit
      </button>
    </div>
  );
}

/* ─── Bausteine ─────────────────────────────────────────────────────────── */

function Termine({termine, name, auswahl, setAuswahl, zeit, legende}) {
  return (
    <fieldset className="sp__freitage">
      <legend className="sp__legende">{legende}</legend>
      <ul className="sp__freitage-liste">
        {termine.map((t) => {
          const z = terminText(t, zeit.zone);
          return (
            <li key={t.start_utc}>
              <label
                className="sp__freitag"
                aria-label={`${z.datum}, ${z.zeit}`}
                data-termin-utc={t.start_utc}
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
                  <span className="sp__kachel-zahl">{z.tag}</span>
                  <span className="sp__kachel-monat">
                    {String(z.monat).slice(0, 3)}
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
      {/* Pflichttext wortgleich aus sprechstunde/konzept/rechtsklaerung-ticket.md
          (§ 356 Abs. 4 BGB), keine Hausstimme: darum data-fremdtext. */}
      <span data-fremdtext="rechtsklaerung-ticket">
        Bitte schon vor Ablauf der Widerrufsfrist beginnen; mir ist bewusst,
        dass mein Widerrufsrecht mit dem Gespräch erlischt.
      </span>
    </label>
  );
}

/** Zeitzone des Browsers für die Bestätigungsmail (nach dem Laden gesetzt). */
function TzFeld() {
  const zone = useBrowserZone();
  return <input type="hidden" name="tz" value={zone} />;
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

/* sizes: der Kopf der Landingpage zeigt das Bild mobil als 96-px-Portraet neben
 * der Ueberschrift (sprechstunde.css .sp__kopf), die Fassung 'alt' volle Breite. */
function Foto({
  sizes = '(min-width: 900px) 360px, (min-width: 640px) 600px, 100vw',
}) {
  return (
    <figure className="sp__foto">
      <img
        src={`${FOTO}&width=720`}
        srcSet={`${FOTO}&width=240 240w, ${FOTO}&width=480 480w, ${FOTO}&width=720 720w, ${FOTO}&width=1200 1200w`}
        sizes={sizes}
        width="1200"
        height="1535"
        alt="Christian Bernd Bauer, Gründer von Qi Blanco"
        fetchpriority="high"
      />
    </figure>
  );
}

/* ─── Landingpage (LP_FASSUNG 'neu') ────────────────────────────────────── */

function Kopf({termine, preisText, zeit}) {
  const naechster = termine[0] ? terminText(termine[0], zeit.zone) : null;
  return (
    <section className="sp__einstieg sp__kopf" data-section="sp-kopf">
      <div className="sp__inhalt sp__inhalt--breit sp__einstieg-raster">
        <div className="sp__einstieg-text">
          <h1>Sprechstunde mit Christian</h1>
          <p className="sp__unterzeile">
            Eine Stunde nur für dich und das, was dich gerade beschäftigt.
          </p>
          <p>
            Du bringst dein Anliegen mit. Christian nimmt sich eine ganze
            Stunde Zeit, hört zu und schaut mit dir, was dich gerade festhält.
          </p>
          <p className="sp__eckdaten">
            60 Minuten live per Zoom · ein Termin pro Woche · {preisText}
          </p>
          {naechster ? (
            <p className="sp__naechster">
              Nächster freier Termin: {naechster.datum}, {naechster.zeit}
            </p>
          ) : null}
          <a className="sp__knopf" href="#termine">
            Termin wählen
          </a>
        </div>
        <Foto sizes="(min-width: 900px) 360px, 96px" />
      </div>
    </section>
  );
}

function Abholen() {
  return (
    <section className="sp__akt-flaeche" data-section="sp-abholen">
      <div className="sp__inhalt">
        <h2>Du kommst bei einem Thema nicht weiter?</h2>
        <p className="sp__gross">
          Ein Thema begleitet dich schon länger. Du hast darüber nachgedacht,
          gelesen, vielleicht schon einiges ausprobiert. Und trotzdem hängst du
          an derselben Stelle.
        </p>
        <p className="sp__gross">
          Dann kann ein Gespräch weiterhelfen, in dem jemand eine Stunde lang
          ganz bei dir ist.
        </p>
      </div>
    </section>
  );
}

function Nutzen() {
  return (
    <section data-section="sp-nutzen">
      <div className="sp__inhalt">
        <h2>Was bekommst du in der Sprechstunde?</h2>
        <ul className="sp__punkte">
          <li>
            Eine volle Stunde mit Christian persönlich, live per Zoom. Nur ihr
            zwei.
          </li>
          <li>
            Dein Anliegen bestimmt die Stunde. Du schreibst vorher ein paar
            Sätze, damit Christian sich auf dich vorbereiten kann.
          </li>
          <li>
            Ein tiefes Gespräch über dein Jetzt: was dich gerade blockiert und
            was sich daran verändern lässt.
          </li>
          <li>
            Einen klareren Blick auf dein Thema, mit dem du nach der Stunde
            weitergehst.
          </li>
        </ul>
      </div>
    </section>
  );
}

function FuerWen() {
  return (
    <section className="sp__akt-flaeche" data-section="sp-zielgruppe">
      <div className="sp__inhalt">
        <h2>Für wen ist die Sprechstunde?</h2>
        <p>Für dich, wenn</p>
        <ul className="sp__punkte">
          <li>dich ein Anliegen gerade wirklich beschäftigt,</li>
          <li>du offen bist für ein ehrliches, persönliches Gespräch,</li>
          <li>
            du Christians Blick auf Physik und Spiritualität einmal direkt
            erleben möchtest.
          </li>
        </ul>
        <p className="sp__klein sp__abgrenzung">
          Die Sprechstunde ist ein Gespräch. Sie ersetzt keine ärztliche
          Behandlung und keine Therapie.
        </p>
      </div>
    </section>
  );
}

function Ablauf() {
  return (
    <section className="sp__akt-dunkel" data-section="sp-ablauf">
      <div className="sp__inhalt sp__inhalt--breit">
        <h2>So läuft es ab</h2>
        <ol className="sp__schritte sp__schritte--drei">
          <li>Freitag wählen und Ticket kaufen.</li>
          <li>Bestätigung mit Zoom-Link bekommen.</li>
          <li>Live mit Christian sprechen.</li>
        </ol>
      </div>
    </section>
  );
}

/**
 * Hintergrund: höchstens 4 Sätze (Christian 20.10.), aus der Grundaussage verdichtet.
 * Der Rücken steht als Bericht des Mannes, nicht als Tatsache (PR-Manager G1,
 * 2026-10-21): auf einer bezahlten Seite läse sich eine Tatsache wie ein Versprechen.
 */
function WerChristianIst() {
  return (
    <section className="sp__akt-flaeche" data-section="sp-christian">
      <div className="sp__inhalt">
        <h2>Wer ist Christian?</h2>
        <p className="sp__hintergrund">
          Christian Bernd Bauer hat Qi Blanco gegründet. Im Studium erzählte ihm
          auf einem Fachseminar ein Mann, dass sich sein eigener steifer Rücken nach
          Jahrzehnten in Sekunden gelöst hatte. Das hat Christian so
          fasziniert, dass er seitdem Physik und Spiritualität zusammenbringt.
          Seine 1:1-Arbeit mit Menschen bietet er jetzt zum ersten Mal
          öffentlich an.
        </p>
      </div>
    </section>
  );
}

function Ticket({preisText}) {
  return (
    <section id="ticket" data-section="sp-ticket">
      <div className="sp__inhalt">
        <h2>Was kostet die Sprechstunde?</h2>
        <p className="sp__gross">
          {preisText} für 60 Minuten. Du kaufst ein Ticket und wählst dabei
          gleich deinen Freitag.
        </p>
        <ul className="sp__punkte">
          <li>Ein Ticket gilt für ein Gespräch und läuft auf deinen Namen.</li>
          <li>
            Verschieben geht bis 24 Stunden vorher, mit dem Link aus deiner
            Bestätigung.
          </li>
          <li>
            Fällt ein Termin von unserer Seite aus, wählst du einen neuen oder
            bekommst dein Geld zurück.
          </li>
          <li>
            Du hast 14 Tage Widerrufsrecht ab dem Kauf. Ist dein Termin in
            diesen 14 Tagen, bestätigst du vor der Kasse, dass das Gespräch
            schon vor dem Ende der Frist stattfinden soll. Das Widerrufsrecht
            endet dann mit dem Gespräch.
          </li>
          <li>
            Einlösen kannst du dein Ticket bis zum 31.12. des dritten Jahres
            nach dem Kauf.
          </li>
        </ul>
      </div>
    </section>
  );
}

function Fragen() {
  return (
    <section className="sp__akt-flaeche" data-section="sp-fragen">
      <div className="sp__inhalt">
        <h2>Häufige Fragen</h2>
        <h3>Was soll ich vorbereiten?</h3>
        <p>
          Nur ein paar Sätze, worum es dir geht. Die schreibst du bei der
          Buchung, dann kann Christian sich auf dich vorbereiten.
        </p>
        <h3>Was brauche ich für Zoom?</h3>
        <p>
          Einen Computer oder ein Handy mit Kamera und Mikrofon und einen
          ruhigen Platz. Den Link bekommst du per Mail.
        </p>
        <h3>In welcher Zeit stehen die Termine?</h3>
        <p>
          In deiner Ortszeit. Die Seite rechnet sie aus der Uhr deines Browsers
          um.
        </p>
        <h3>Was ist, wenn ich an dem Freitag doch nicht kann?</h3>
        <p>
          Du verschiebst deinen Termin bis 24 Stunden vorher selbst, mit dem
          Link aus deiner Bestätigung. Später schreib uns einfach an{' '}
          <a href={`mailto:${SERVICE}`}>{SERVICE}</a>.
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

/* ─── Buchen (beide Fassungen) ──────────────────────────────────────────── */

function Buchen({daten, fehler, eingabe, fassung}) {
  const {termine, buchungMoeglich, preisText, vorzeitigVorUtc, anliegenMin} =
    daten;
  const neu = fassung !== 'alt';
  const geladen = useGeladen();
  const zeit = useZeit(fassung);
  const [auswahl, setAuswahl] = useState('');
  const nav = useNavigation();
  const sendet = nav.state === 'submitting';
  const vorzeitigNoetig =
    !geladen ||
    (auswahl && vorzeitigVorUtc && Date.parse(auswahl) < Date.parse(vorzeitigVorUtc));

  return (
    <section
      id={neu ? 'termine' : 'freitage'}
      className="sp__buchen"
      data-section={neu ? 'sp-termine' : undefined}
    >
      <div className="sp__inhalt">
        <h2>{neu ? 'Such dir deinen Termin aus' : 'Die nächsten Freitage'}</h2>
        {daten.ladeFehler ? (
          <p className="sp__hinweis">
            Die Termine sind gerade nicht erreichbar. Bitte versuch es gleich noch einmal
            oder schreib uns an <a href={`mailto:${SERVICE}`}>{SERVICE}</a>.
          </p>
        ) : termine.length === 0 ? (
          <p className="sp__hinweis">
            Gerade ist kein Termin frei. Schreib uns an{' '}
            <a href={`mailto:${SERVICE}`}>{SERVICE}</a>, dann melden wir uns.
          </p>
        ) : (
          <Form method="post" reloadDocument className="sp__formular">
            <input type="hidden" name="intent" value="reservieren" />
            <ZeitHinweis zeit={zeit} />
            <Termine
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              zeit={zeit}
              legende={neu ? 'Termine der nächsten drei Wochen' : 'Wähl deinen Freitag'}
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
                  {neu ? (
                    <span>
                      Ich habe die <a href="#ticket">Bedingungen</a> gelesen und
                      bin einverstanden.
                    </span>
                  ) : (
                    <span>
                      Ich habe „Gut zu wissen“ gelesen und bin mit den
                      Bedingungen einverstanden.
                    </span>
                  )}
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
                  Danach geht es direkt in die Kasse. Der Termin ist 30 Minuten
                  für dich reserviert.
                </p>
              </div>
            ) : (
              <p className="sp__hinweis">Die Buchung öffnet in Kürze.</p>
            )}
            {neu ? null : <AltGutZuWissen />}
          </Form>
        )}
      </div>
    </section>
  );
}

/* ─── Fassung vom 19.10. (LP_FASSUNG 'alt', Blue-Green-Rückweg) ─────────── */

function AltGutZuWissen() {
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

function AltEinstieg({termine, preisText}) {
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
        <Foto />
      </div>
    </section>
  );
}

function AltWasPassiert() {
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

function AltGeschichte() {
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

function AltAblauf() {
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

function AltFragen() {
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

/* ─── Ansichten mit Ticket oder Buchung ─────────────────────────────────── */

function Termin({buchung, zeit}) {
  const z = terminText({start_utc: buchung.start_utc}, zeit.zone);
  return (
    <p className="sp__termin" data-termin-utc={buchung.start_utc}>
      <span className="sp__freitag-datum">{z.datum}</span>
      <span className="sp__freitag-zeit">{z.zeit}, 60 Minuten</span>
    </p>
  );
}

function Verwalten({daten, fehler, fassung}) {
  const {buchung, status, umbuchenMoeglich, termine} = daten;
  const zeit = useZeit(fassung);
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
        <ZeitHinweis zeit={zeit} />
        <Termin buchung={buchung} zeit={zeit} />
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
            <Termine
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              zeit={zeit}
              legende="Auf einen anderen Termin verschieben"
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

function Einloesen({daten, fehler, fassung}) {
  const {ticket, buchung, einloesbar, termine, buchungMoeglich, vorzeitigVorUtc} =
    daten;
  const geladen = useGeladen();
  const zeit = useZeit(fassung);
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
            <p>Dein Termin steht schon:</p>
            <Termin buchung={buchung} zeit={zeit} />
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
            <ZeitHinweis zeit={zeit} />
            <Termine
              termine={termine}
              name="start_utc"
              auswahl={auswahl}
              setAuswahl={setAuswahl}
              zeit={zeit}
              legende="Wähl deinen Termin"
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
              Termin buchen
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
  const aktion = useAktionsergebnisUeberRevalidierung();
  const fehler = aktion && !aktion.ok ? aktion.text : '';
  const fassung = LP_FASSUNG;
  if (daten.ansicht === 'verwalten')
    return (
      <div className="sp">
        <Verwalten daten={daten} fehler={fehler} fassung={fassung} />
      </div>
    );
  if (daten.ansicht === 'einloesen')
    return (
      <div className="sp">
        <Einloesen daten={daten} fehler={fehler} fassung={fassung} />
      </div>
    );
  if (fassung === 'alt')
    return (
      <div className="sp">
        <AltEinstieg termine={daten.termine} preisText={daten.preisText} />
        <AltWasPassiert />
        <AltGeschichte />
        <AltAblauf />
        <Buchen
          daten={daten}
          fehler={fehler}
          eingabe={aktion?.eingabe}
          fassung={fassung}
        />
        <AltFragen />
      </div>
    );
  return (
    <div className="sp sp--lp">
      <KopfMitZeit termine={daten.termine} preisText={daten.preisText} />
      <Abholen />
      <Nutzen />
      <FuerWen />
      <Ablauf />
      <WerChristianIst />
      <Ticket preisText={daten.preisText} />
      <Fragen />
      <Buchen
        daten={daten}
        fehler={fehler}
        eingabe={aktion?.eingabe}
        fassung={fassung}
      />
    </div>
  );
}

/** Kopf mit eigener Zeit-Hook, damit der nächste Termin auch in Ortszeit steht. */
function KopfMitZeit(props) {
  const zeit = useZeit('neu');
  return <Kopf {...props} zeit={zeit} />;
}
