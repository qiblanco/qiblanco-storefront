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
 *   Verwalten   (?verwalten=1)   Termin, Zoom-Link, Kenncode, Kalenderdatei,
 *                                Absagen, Umbuchen. Zugleich die Bestätigung:
 *                                nach Buchen/Umbuchen leitet die Action hierher
 *                                weiter (?status=gebucht|umgebucht). Die Kundin
 *                                sieht alles sofort, nicht erst in der Mail, und
 *                                Neuladen bucht nie ein zweites Mal.
 *                                Der Mail-Link ?b=<token> landet hier ohne
 *                                Token in der Adresse: er reist im HttpOnly-
 *                                Cookie (Route pages.produktberatung.jsx) und
 *                                steht weder im HTML noch in einem Formular.
 *
 * BUCHUNG ZU (Zoom fehlt oder Schalter aus): Termine bleiben sichtbar, das
 * Formular weicht dem Satz „Die Buchung öffnet in Kürze." Kein toter Knopf.
 *
 * ZEITEN (Christian 08.10.2026 ~07:10Z: „Es kann nicht sein, dass wir da zwei
 * Uhrzeiten anzeigen … Warum wird einfach nicht die Uhrzeit angezeigt in der
 * Zeitzone, in der sich der Browser befindet?"): je Termin EINE Uhrzeit, und
 * zwar in der Zeitzone des Browsers; auch Tag und Datum der Karte sind
 * Ortsdatum (aus Donnerstag kann in Australien Freitag werden). Gespeichert und
 * gebucht wird weiter über `slot_start`/`utc` des Endpunkts.
 * Server und erster Browser-Render zeigen die Zeitzone Berlin aus `datum`/`zeit`
 * (ohne Intl auf dem Server, sonst zwei Uhren = Hydrierungsfehler); erst nach
 * dem Laden setzt der Browser die Ortszeit, an derselben Stelle und gleich breit
 * (tabellarische Ziffern). Berlin, Wien und Zürich haben dieselbe Uhr: dort
 * bleibt alles, wie es ist, ohne Hinweis. Sonst steht unter den Terminen „Zeiten
 * in deiner Ortszeit." Ohne JavaScript bleibt Berlin, mit dem Hinweis
 * „Alle Zeiten: Zeitzone Berlin." (noscript).
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
 * CHRISTIANS EIGENER TEXT 2026-10-08 (Grossjob 20261008-GROSSJOB-produktberatung-
 * christians-text-und-seite-optimieren, s01): Einstieg (pb__lead) und der Block
 * neben seinem Foto sind SEIN Wortlaut. Erlaubt sind nur Rechtschreibung,
 * Zeichensetzung, Anrede und das Markenzeichen; jede Abweichung steht im Export
 * produktberatung/exports/seitentext-christian-20261008.json. Nicht umschreiben,
 * nicht glätten, auch nicht in einem Testarm: jeder Arm zeigt diese Sätze gleich.
 *
 * CHRISTIANS ENTSCHEIDUNGEN 08.10. ~07:25-07:35Z (s02, vor allen Testvarianten):
 * Überschrift mit Umbruch nach „Produktberatung:" (zwei Zeilen in derselben h1,
 * im Seitentitel bleibt es ein Satz); sein Block heißt „Live mit mir :)" und
 * trägt Fassung 2 seiner Gründungsgeschichte (Quelle: originaltexte-christian/
 * cold-story_2026-10-08.md bei Coworker A); unter dem Foto klein und
 * dezent „Dipl.-Ing. (FH) Christian Bernd Bauer" (ersetzt die Unterschriftzeile);
 * der Absatz „Du hast schon einen QiOne®? Dann komm erst recht :)" unter den
 * Fragen ist ebenfalls sein Wortlaut. Alles davon trägt data-fremdtext.
 *
 * ABDATEN IM BROWSER: siehe useJetzt()/nochBuchbar() unten. Die Grenze kommt
 * allein aus `buchungsschluss_min` des Endpunkts; die Seite kennt keine Zahl.
 *
 * CHRISTIAN-SPRACHMODUL (s02, BEIDE ARME; Christian 08.10. ~07:08Z: „anwenden
 * auf alle Texte, die ich heute nicht korrigiert habe"): Vorspann, Fragen,
 * Ablauf, Stimmen-Überschrift und -Link, Bestätigung und Absagen stehen in der
 * Fassung von menschlichkeit/bin/christian-fassung. Nicht übernommen, weil die
 * Fassung schlechter war: „Jetzt …"-Knöpfe, „In 3 Schritten zum Termin",
 * großgeschriebenes „Deinen". Unberührt: Christians Wortlaut, „Bis Donnerstag?"
 * mit dem Kakao-Satz (seine Korrektur), Formularfelder und Datenschutzsatz.
 * Jedes Paar alt -> neu steht im Export seitentext-christian-20261008.json
 * (ki_klang_glattung).
 *
 * TEST-KREISLAUF (Seiten-Experiment pb-e1-gs107, Hypothese GS-107): die Route
 * pages.produktberatung-b.jsx rendert diese Komponente mit variante="b". B hat
 * den nächsten Termin mit seinen freien Uhrzeiten im Kopf (ein Tipp wählt vor
 * und springt zu den Angaben), am Handy Christians Foto über seinem Text, nach
 * den Terminen zuerst den Ablauf, dann die Stimmen (andere Auswahl), dann die
 * Fragen. Alles andere ist in beiden Armen gleich, Christians Wortlaut sowieso.
 * MESSPUNKTE (first-party, Haus-Beacon, je Arm über den Pfad): data-section
 * „pb-angaben" an den Angaben (sichtbar erst nach der Terminwahl) und
 * „pb-gebucht" an der Bestätigung direkt nach dem Buchen. Kein Fremdwerkzeug.
 */

/** Zonen mit der Uhr Berlins: dort zeigt die Seite die Zeiten des Endpunkts ohne Hinweis. */
const ZONEN_WIE_BERLIN = new Set([
  'Europe/Berlin',
  'Europe/Vienna',
  'Europe/Zurich',
]);
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

/**
 * Zeitzone der Kundin, erst nach dem Laden: null auf dem Server und im ersten
 * Browser-Render (gleiches HTML), danach der Name der Zone oder '' (Zone nicht
 * lesbar oder vom Browser nicht formatierbar; dann bleibt Berlin mit Hinweis).
 */
function useKundenZone() {
  const [zone, setZone] = useState(null);
  useEffect(() => {
    let z = '';
    try {
      z = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (z) new Intl.DateTimeFormat('de-DE', {timeZone: z}).format(0);
    } catch {
      z = '';
    }
    setZone(z);
  }, []);
  return zone;
}

/** true, wenn die Seite die Zeiten in der Ortszeit der Kundin zeigt. */
function inOrtszeit(zone) {
  return Boolean(zone) && !ZONEN_WIE_BERLIN.has(zone);
}

/**
 * Datum und Uhrzeit eines Termins, wie die Kundin sie sieht: in ihrer Zone,
 * sobald der Browser sie kennt und sie nicht die Uhr Berlins hat; sonst die
 * Zeitzone Berlin aus `slot_start` (Server, erster Browser-Render, ohne JS).
 */
function ortsTeile(slotStart, zone) {
  const berlin = teile(slotStart);
  if (!inOrtszeit(zone)) return berlin;
  try {
    const w = {};
    for (const t of new Intl.DateTimeFormat('de-DE', {
      timeZone: zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date(slotStart))) {
      w[t.type] = t.value;
    }
    if (!w.year || !w.month || !w.day || !w.hour || !w.minute) return berlin;
    return {
      datum: `${w.year}-${w.month}-${w.day}`,
      zeit: `${w.hour}:${w.minute}`,
    };
  } catch {
    return berlin;
  }
}

/** Die Termine mit ihrer Anzeige (Ortsdatum, Ortszeit); slot_start bleibt der Wert des Formulars. */
function inAnzeige(termine, zone) {
  return termine.map((t) => ({...t, ...ortsTeile(t.slot_start, zone)}));
}

/**
 * Der eine Hinweis unter den Terminen: in Ortszeit „Zeiten in deiner Ortszeit.",
 * ohne lesbare Zone und ohne JavaScript (noscript) „Alle Zeiten: Zeitzone
 * Berlin.", in Berlin, Wien und Zürich keiner.
 */
function ZeitHinweis({zone}) {
  return (
    <>
      <noscript>
        <p className="pb__klein pb__zone">Alle Zeiten: Zeitzone Berlin.</p>
      </noscript>
      {zone === '' ? (
        <p className="pb__klein pb__zone">Alle Zeiten: Zeitzone Berlin.</p>
      ) : null}
      {inOrtszeit(zone) ? (
        <p className="pb__klein pb__zone">Zeiten in deiner Ortszeit.</p>
      ) : null}
    </>
  );
}

/**
 * ARM B (pb-e1-gs107, Hypothese GS-107): der nächste Termintag mit seinen freien
 * Uhrzeiten schon im ersten Bildschirm. Ein Tipp auf eine Uhrzeit wählt sie im
 * Formular vor und springt zu den Angaben. Ohne JavaScript (oder wenn die Zeit
 * inzwischen weg ist) lädt der Link die Seite mit ?termin=…: der Loader wählt
 * vor, die Seite springt zu den Terminen. Gezählt wird der Tipp wie der Knopf in
 * A als Klick im Kopf (Haus-Beacon: pb-kopf|anker).
 */
function NaechsterTermin({termine, zone}) {
  const tag = nachTag(inAnzeige(termine, zone))[0];
  if (!tag) return null;
  const waehle = (e, t) => {
    const radio = document.getElementById(`pb-slot-${t.utc}`);
    if (!radio) return;
    e.preventDefault();
    if (!radio.checked) radio.click();
    const ziel =
      document.getElementById('pb-angaben') ||
      document.getElementById('termine');
    window.requestAnimationFrame(() => ziel?.scrollIntoView({block: 'start'}));
  };
  return (
    <div className="pb__naechster">
      <p className="pb__naechster-titel">
        Nächster Termin:{' '}
        <span className="pb__naechster-tag">{tagName(tag.datum)}</span>
      </p>
      <ul className="pb__naechster-zeiten">
        {tag.termine.map((t) => (
          <li key={t.slot_start}>
            <a
              className="pb__naechster-zeit"
              href={`?termin=${encodeURIComponent(t.slot_start)}#termine`}
              onClick={(e) => waehle(e, t)}
            >
              {t.zeit} Uhr
            </a>
          </li>
        ))}
      </ul>
      <p className="pb__naechster-alle">
        <a href="#termine">Alle Termine</a>
      </p>
    </div>
  );
}

/**
 * Kopf: Überschrift, dann Christian selbst (Bild + seine Worte), dann der Weg zu
 * den Terminen. Christian 01.10.: der Bereich über ihn steht ÜBER „Wähl deinen
 * Termin". Einstieg und Gründungsgeschichte sind seit 08.10. Christians eigener
 * Wortlaut (siehe Kopfkommentar). Einspaltig, damit das Chat-Fenster unten
 * rechts Christians Worte nicht verdeckt.
 */
function Kopf({mitWeg, naechster, b}) {
  const g = useGoogleRating();
  const vertrauen = (
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
  );
  return (
    <section className="pb__kopf" data-section="pb-kopf">
      <div className="pb__inhalt pb__inhalt--breit">
        <div className="pb__kopf-text">
          <p className="pb__vorspann">Kostenlos und live per Zoom</p>
          {/* Christian 08.10. ~07:25Z: Umbruch nach dem Doppelpunkt, auf Handy und Rechner. */}
          <h1>
            <span className="pb__h1-zeile">Produktberatung:</span>{' '}
            <span className="pb__h1-zeile">20 Minuten mit Christian</span>
          </h1>
          <p className="pb__lead" data-fremdtext="christian-wortlaut-20261008">
            Du hast Fragen zu unseren Produkten? Ich nehme mir persönlich Zeit
            für dich!
          </p>
          <p className="pb__lead" data-fremdtext="christian-wortlaut-20261008">
            Wir können über deine aktuelle Situation sprechen, über den Grund,
            warum du einen QiOne® kaufen möchtest, oder auch einfach Fragen,
            die noch offen sind, klären.
          </p>
          {naechster ? (
            <>
              {naechster}
              {vertrauen}
            </>
          ) : (
            vertrauen
          )}
          {mitWeg && !naechster ? (
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
        <figure
          className={`pb__christian${b ? ' pb__christian--b' : ''}`}
          data-section="pb-person"
        >
          {/* Foto mit Bildunterschrift (Christian 08.10. ~07:27Z: „unter dem Bild von mir in klein
              und dezent"); sie ersetzt die frühere Unterschriftzeile. */}
          <div className="pb__foto-rahmen">
            <img
              className="pb__foto"
              src={`${FOTO}&width=480`}
              srcSet={`${FOTO}&width=240 240w, ${FOTO}&width=480 480w, ${FOTO}&width=720 720w`}
              sizes={
                b
                  ? '(min-width: 768px) 240px, 100vw'
                  : '(min-width: 768px) 240px, 112px'
              }
              width="240"
              height="307"
              fetchpriority="high"
              decoding="async"
              alt="Christian Bernd Bauer, Gründer von Qi Blanco"
            />
            <p
              className="pb__foto-name"
              data-fremdtext="christian-wortlaut-20261008"
            >
              Dipl.-Ing. (FH) Christian Bernd Bauer
            </p>
          </div>
          <figcaption
            className="pb__christian-text"
            data-fremdtext="christian-wortlaut-20261008"
          >
            <h2 className="pb__christian-titel">Live mit mir :)</h2>
            <p className="pb__christian-wort">
              Vor mehr als 10 Jahren habe ich Qi Blanco aus meiner eigenen
              Leidensgeschichte gegründet. Ich war Leiter einer
              Entwicklungsabteilung für Automotive und Aerospace. Das Büro wurde
              modernisiert. Das Spannende: Ich wurde müder, war ständig genervt
              und ging nicht mehr so glücklich wie früher durchs Leben. Die
              ersten Tage schob ich es auf meinen beruflichen Stress, dann auf
              meine Ernährung, dann auf meine Beziehung … bis ich ziemlich mit
              allem durch war, hatte ich vieles getestet. Und dann fiel es mir
              wie Schuppen von den Augen: Ein riesiger WLAN-Router hing auf
              einmal direkt rechts neben mir an der Wand. 60 cm oberhalb von
              meinem Kopf. Heureka! Es liegt nicht an mir, sondern am E-Smog,
              der direkt mein Nervensystem angriff! Als Ingenieur war klar: Ich
              brauche eine einfache und elegante Lösung. Einfach umhängen und
              das Problem ist erledigt.
            </p>
            <p className="pb__christian-wort">
              Gesagt, getan: In dieser Nacht entstand noch die Blaupause für den
              QiOne®.
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
        {nachTag(inAnzeige(termine, zone)).map((tag) => {
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
                          </label>
                        </>
                      ) : (
                        <span className="pb__slot pb__slot--anzeige">
                          <span className="pb__zeit">{t.zeit} Uhr</span>
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
      <ZeitHinweis zone={zone} />
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

/**
 * Die Zeile unter „Wähl deinen Termin"; die Frist nur, wenn der Endpunkt sie meldet.
 * Christian 08.10. ~07:05Z verwarf „Donnerstags halte ich mir dafür Zeit frei.
 * Spontan? …" als KI-Klang; seine Richtung „Jeden Donnerstag. Buchen kannst du
 * bis 8 Stunden vorher." steht hier wörtlich, die Zahl kommt aus der API.
 */
function Unterzeile({schlussMin}) {
  const frist = fristText(schlussMin);
  return (
    <p className="pb__unterzeile">
      Jeden Donnerstag.
      {frist ? ` Buchen kannst du bis ${frist} vorher.` : ''}
    </p>
  );
}

function Buchen({daten, fehler, zone, mitWahl}) {
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
      const {datum, zeit} = ortsTeile(markiert, zone);
      setVerpasst(
        `${tagName(datum)}, ${zeit} Uhr ist jetzt zu kurzfristig. Such dir bitte eine andere Zeit aus.`,
      );
      setMarkiert('');
    }
  }, [daten.termine, markiert, zone]);
  const nimm = (slot) => {
    setMarkiert(slot);
    setVerpasst('');
  };
  const gewaehlt = mitWahl && markiert ? ortsTeile(markiert, zone) : null;

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
          <input type="hidden" name="tz" value={zone || ''} />
          {/* Quelle aus dem Link (?von=warenkorb-mail), vom Loader gegen die Allowlist geprüft. */}
          {daten.von ? (
            <input type="hidden" name="von" value={daten.von} />
          ) : null}
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

          {/* data-section pb-angaben: sichtbar erst nach der Terminwahl (:has unten im CSS), der Haus-Beacon
              zählt sie je Besuch einmal ab 1 s Sichtbarkeit — das ist der Messpunkt „Termin gewählt". */}
          <div className="pb__felder" data-section="pb-angaben" id="pb-angaben">
            {gewaehlt ? (
              <p className="pb__gewaehlt">
                Dein Termin: {tagName(gewaehlt.datum)}, {gewaehlt.zeit} Uhr
              </p>
            ) : null}
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
function Termindaten({buchung, verwalten, zone}) {
  const {datum, zeit} = ortsTeile(buchung.slot_start, zone);
  return (
    <dl className="pb__daten" data-clarity-mask="true">
      <div>
        <dt>Termin</dt>
        <dd>
          {tagName(datum, true)}, <span className="pb__zeit-wert">{zeit}</span>{' '}
          Uhr
          {inOrtszeit(zone) ? (
            <span className="pb__lokal"> · deine Ortszeit</span>
          ) : null}
          {zone === '' ? (
            <span className="pb__lokal"> · Zeitzone Berlin</span>
          ) : null}
          <noscript>
            <span className="pb__lokal"> · Zeitzone Berlin</span>
          </noscript>
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
      {verwalten ? (
        <div className="pb__aktionen">
          <a
            className="pb__knopf-zwei"
            href="/pages/produktberatung-kalender"
            download="produktberatung-qiblanco.ics"
            rel="nofollow"
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
 * Verwalten-Ansicht (?verwalten=1), zugleich die Bestätigung: nach dem Buchen und
 * Umbuchen leitet die Action hierher weiter (?verwalten=1&status=gebucht|umgebucht).
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
            <Link to={daten.pfad || '/pages/produktberatung'}>
              Zu den freien Terminen
            </Link>
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
            <Link to={daten.pfad || '/pages/produktberatung'}>
              Neuen Termin wählen
            </Link>
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
        {/* pb-gebucht: der Messpunkt „Buchung abgeschlossen" je Arm (nur direkt nach dem Buchen, nicht beim
            Öffnen des Mail-Links und nicht nach dem Umbuchen). */}
        <div
          data-section={daten.status === 'gebucht' ? 'pb-gebucht' : undefined}
        >
          <h2>{titel}</h2>
          {neu ? (
            <p>
              Hebe dir diese Seite auf. Hier findest du jederzeit den Zoom-Link
              und Kenncode und kannst deinen Termin absagen oder umbuchen.
            </p>
          ) : null}
        </div>
        <Hinweis
          art="fehler"
          text={ergebnis && !ergebnis.ok ? ergebnis.text : ''}
        />
        <Termindaten buchung={b} verwalten zone={zone} />
        {vorbei ? null : (
          <>
            {daten.buchungMoeglich && andere.length ? (
              <Form method="post" className="pb__form" preventScrollReset>
                <input type="hidden" name="intent" value="umbuchen" />
                <h2>Umbuchen</h2>
                <Terminliste termine={andere} mitRadio zone={zone} />
                <button type="submit" className="pb__knopf" disabled={sendet}>
                  Auf diesen Termin umbuchen
                </button>
              </Form>
            ) : null}
            <Form method="post" className="pb__absagen" preventScrollReset>
              <input type="hidden" name="intent" value="absagen" />
              <h2>Absagen</h2>
              <p>
                Falls du doch keine Zeit hast, sag den Termin bitte ab, damit
                ein anderer den Platz bekommt.
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
    frage: 'Darf ich den QiOne® auch nachts im Bett tragen?',
  },
  {
    bild: `${CDN}qb-themen--themen-esmog-laptop-bali-05984--f786b6fa5b29.webp?v=1790161971`,
    alt: 'Eine Frau sitzt mit dem Laptop auf dem Sofa, vor ihr ein Holztisch mit einem Glas Wasser.',
    frage: 'Wohin stelle ich den QiHome® Air, wenn der Router im Flur steht?',
  },
  {
    bild: `${CDN}qb-themen--themen-zellen-qibracelet-gruensaft-canggu-06390--b4ab3f9b62c8.webp?v=1790161977`,
    alt: 'Ein Arm mit QiBracelet hält ein Glas grünen Saft vor Palmenblättern.',
    frage: 'Armband oder Anhänger, was trage ich, wenn ich viel unterwegs bin?',
  },
];

function Fragen() {
  return (
    <section className="pb__fragen" data-section="pb-fragen">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>Diese Fragen kannst du mir stellen</h2>
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
        {/* Christians Wortlaut (08.10. ~07:35Z), der Umbruch nach „:)" ist von ihm. */}
        <p className="pb__schon" data-fremdtext="christian-wortlaut-20261008">
          Du hast schon einen QiOne®? Dann komm erst recht :)
          <br />
          Wir können gerne über die Nutzung reden, deine persönlichen
          Erfahrungen oder Fragen klären, die erst bei der Nutzung entstanden
          sind. Oder welcher Vorteil ein QiHome® Air für dich sein könnte?
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
            <strong>Suche dir einen freien Termin am Donnerstag aus.</strong>{' '}
            Zum Buchen reichen dein Name und deine E-Mail.
          </li>
          <li>
            <strong>Dein Zoom-Link.</strong> Er steht direkt nach der Buchung
            auf der Seite, inklusive Kalenderdatei.
          </li>
          <li>
            <strong>Live mit mir per Zoom.</strong> Nach einem kurzen Warteraum
            hole ich dich persönlich rein. Ein Handy reicht, die Kamera ist
            freiwillig.
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
/**
 * Arm B: zuerst die Stimme einer Skeptikerin, die von den Menschen hinter Qi
 * Blanco erzählt („persönliches Interesse", „Service mit Herz"), dann Service
 * und Ergänzung (Anhänger + Armband), dann die kurze. Wörtlich wie in A.
 */
const STIMMEN_IDS_B = ['-1034576208', '-729236865', '-1868946154'];
const auswahl = (ids) =>
  ids
    .map((id) => GOOGLE_REVIEWS_CURATED.find((r) => r.id === id))
    .filter((r) => r && !/anna/i.test(`${r.name} ${r.text}`));
const STIMMEN = auswahl(STIMMEN_IDS);
const STIMMEN_B = auswahl(STIMMEN_IDS_B);

function Stimmen({b}) {
  const g = useGoogleRating();
  const stimmen = b ? STIMMEN_B : STIMMEN;
  if (!stimmen.length) return null;
  return (
    <section className="pb__stimmen" data-section="pb-stimmen">
      <div className="pb__inhalt pb__inhalt--breit">
        <h2>Das berichten unsere Anwender bei Google</h2>
        <ul className="pb__zitate">
          {stimmen.map((r) => (
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
            Alle Google-Bewertungen ansehen, im Schnitt {g.komma} von 5 Sternen
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
        <p>Such dir eine Zeit aus, mach dir einen Kakao, und dann reden wir.</p>
        <p className="pb__weg">
          <a href="#termine" className="pb__knopf-zwei">
            Termin aussuchen
          </a>
        </p>
      </div>
    </section>
  );
}

/**
 * @param {{variante?: 'a' | 'b'}} props  'b' = Arm B des Seiten-Experiments pb-e1-gs107
 *   (Route pages.produktberatung-b.jsx); ohne Angabe A, die Seite wie bisher.
 */
export function ProduktberatungSeite({variante = 'a'} = {}) {
  const b = variante === 'b';
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
  if (daten.verwalten)
    mitte = <Verwalten daten={daten} ergebnis={ergebnis} zone={zone} />;
  else if (ergebnis?.ok && ergebnis.intent === 'buchen') mitte = <Danke />;
  else
    mitte = (
      <Buchen
        daten={daten}
        fehler={ergebnis && !ergebnis.ok ? ergebnis : null}
        zone={zone}
        mitWahl={b}
      />
    );

  const buchenAnsicht =
    !daten.verwalten && !(ergebnis?.ok && ergebnis.intent === 'buchen');
  // Arm B: der nächste Termin im Kopf, nur wenn wirklich gebucht werden kann (sonst der Knopf wie in A).
  const naechster =
    b && buchenAnsicht && daten.buchungMoeglich && daten.termine.length ? (
      <NaechsterTermin termine={daten.termine} zone={zone} />
    ) : null;
  return (
    <div className={b ? 'pb pb--b' : 'pb'}>
      <Kopf mitWeg={buchenAnsicht} naechster={naechster} b={b} />
      {mitte}
      {b ? (
        <>
          <Ablauf />
          <Stimmen b />
          <Fragen />
        </>
      ) : (
        <>
          <Fragen />
          <Ablauf />
          <Stimmen />
        </>
      )}
      {buchenAnsicht ? <Schluss /> : null}
    </div>
  );
}
