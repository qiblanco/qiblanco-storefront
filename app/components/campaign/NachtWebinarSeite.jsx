import {useEffect, useId, useRef, useState} from 'react';
import {Link} from 'react-router';
import {ANMELDE_ENDPUNKT, holeAnmeldewege} from '~/components/reusables/Anmeldeweiche';
import {qpxTrack} from '~/lib/qpx-commerce';
import {FORMULAR, OEFFNET_BALD, THEMA, anzeigeVollstaendig, antwortZustand, icsText} from './nacht-webinar';
import {kalenderErlaubt, leadSenden, nutzlast, terminAus, terminText, utmContent} from './nacht-webinar';

/**
 * ANMELDESEITE „DIE NACHT ENTSCHEIDET“ (eigene Live-Serie, alle zwei Wochen
 * sonntags). Grossjob 20261023-webinar-lp-die-nacht-entscheidet-serie-1511, s03.
 * Vorlage: WebinarSeite.jsx aus PR 838 (ungemergt), kopiert, nicht importiert.
 *
 * TEXTQUELLEN, wortgleich wo zitiert (webinar-manager/themen/longevity-esmog-wasser):
 * Unterzeile = thema.json versprechen; „Das nimmst du mit“ = folienplan.json
 * Folie 8; Christians Satz = quellen/cold_story.json Fassung 2B, Satz 1; das
 * Cebula-Zitat = konzept.json cebula Zitat 3, Zeitmarke am Wort-Transkript
 * gemessen (01:09:10); Vertrauen = konzept.json vertrauen, der Walach-Satz
 * genau so (Christian 23.10.2026, Z122); Erfahrungen = quellen LW-K1/LW-K2,
 * sinngemäß. „Für dich, wenn“ folgt der anonymen Persona (qi-brain).
 *
 * TERMIN UND FORMULARTEXTE KOMMEN AUS /w des Anmelde-Endpunkts (ac-eingang),
 * im Loader für das HTML und im Browser frisch. Nichts davon steht hier.
 * Solange das Formular dort auf 'aus' steht, sagt die Seite „Die Anmeldung
 * öffnet in Kürze.“ und schickt trotzdem ab: der Endpunkt entscheidet.
 * Marker: data-webinar (probe_livegang_lp.py), data-section wn-*, data-qa="cta".
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
// Personenkarten: mobil volle Spalte (bis 568 px bei 600), ab 768 halbe Breite der 1080er Spalte.
const PERSON_SIZES = '(max-width: 767px) calc(100vw - 32px), (max-width: 1127px) calc(50vw - 40px), 524px';
const FOTO = {
  christian: {src: `${CDN}Christian.jpg?v=1668985845`, b: 1200, h: 1535, alt: 'Christian, Gründer von Qi Blanco'},
  dartsch: {src: `${CDN}webinar-nacht-dartsch-portraet.jpg?v=1792770671`, b: 1132, h: 1400,
    alt: 'Prof. Dr. Peter C. Dartsch am Mikroskop', vermerk: 'Foto: Dartsch Scientific'},
  walach: {src: `${CDN}webinar-nacht-walach-portraet.jpg?v=1792770676`, b: 1400, h: 933,
    alt: 'Prof. Dr. Dr. Harald Walach', vermerk: 'Foto: Anja Jahn'},
};

const VERSPRECHEN =
  'In einer Stunde verstehst du, was dein Körper nachts erneuert, was Funk damit zu tun haben kann ' +
  'und warum Wasser die Hauptrolle spielt. Du nimmst drei Handgriffe für dein Schlafzimmer mit und ' +
  'kannst Christian live fragen.';
const FUER_DICH = [
  'du zuhause schon gegen Funk vorgesorgt hast und wissen willst, was nachts noch zählt.',
  'du verstehen willst, was in deinem Körper passiert, statt einfach etwas zu glauben.',
  'du deine Frage lieber persönlich stellst, und zwar jemandem, der die Technik versteht.',
];
const MITNEHMEN = [
  'Was dein Gehirn nachts macht',
  'Was Funk damit zu tun haben kann',
  'Warum Wasser die Hauptrolle spielt',
  'Drei Handgriffe für heute Abend',
];
const ERFAHRUNGEN = [
  ['Marion, Coach und Sängerin', 'Marion schläft durch und wacht ausgeruht auf. Nach ihren Auftritten fällt sie ' +
    'nicht mehr in ein Erschöpfungsloch. Ihre Bedingung: mindestens zwei Liter Wasser am Tag.'],
  ['Andreas, trägt das QiBracelet', 'Beim ersten Anlegen hat Andreas nichts gespürt. Nach zweieinhalb Monaten ' +
    'merkte er weniger Erschöpfung, mehr Energie am Morgen und besseren Schlaf.'],
];
const FRAGEN = [
  ['Gibt es eine Aufzeichnung?', 'Nein. Christian ist immer live, weil er mit dir sprechen will. ' +
    'Deine Fragen beantwortet er direkt im Webinar.'],
  ['Kostet das Webinar etwas?', 'Nein, es ist kostenlos.'],
  ['Wie lange dauert es?', '45 Minuten, danach hat Christian Zeit für deine Fragen.'],
  ['Wie bin ich dabei?', 'Per Zoom im Browser oder in der App. Den Link bekommst du per E-Mail.'],
];

function Bild({foto, breiten, sizes, className}) {
  const url = (w) => `${foto.src}&width=${w}`;
  return (
    <figure className={className}>
      <img src={url(breiten[1])} srcSet={breiten.map((w) => `${url(w)} ${w}w`).join(', ')} sizes={sizes}
        width={foto.b} height={foto.h} alt={foto.alt} loading="lazy" />
      {foto.vermerk ? <figcaption className="wn-vermerk">{foto.vermerk}</figcaption> : null}
    </figure>
  );
}

function Abschnitt({id, art = '', children, anker}) {
  return (
    <section className={`wn-abschnitt ${art}`} data-section={id} id={anker}>
      <div className="wn-innen">{children}</div>
    </section>
  );
}

function kalenderLaden(termin) {
  const url = URL.createObjectURL(new Blob([icsText(termin, Date.now())], {type: 'text/calendar;charset=utf-8'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qi-blanco-die-nacht-entscheidet.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function KalenderKnopf({termin}) {
  return (
    <button className="wn-knopf wn-knopf-zweit" type="button" onClick={() => kalenderLaden(termin)}>
      In den Kalender eintragen
    </button>
  );
}

function eventId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/** Das Formular. Texte, Termin und Einwilligung stammen aus /w (lage). */
function Anmeldung({lage, versatz, setLage}) {
  const kennung = useId();
  const angezeigt = useRef(0);
  const [stand, setStand] = useState('bereit');
  const [meldung, setMeldung] = useState('');
  const [kalender, setKalender] = useState(null);
  const {anzeige, weg} = lage;
  const termin = terminAus(anzeige);

  useEffect(() => {
    angezeigt.current = Date.now();
  }, []);

  if (!anzeigeVollstaendig(anzeige)) {
    return (
      <p className="wn-status" role="status">{OEFFNET_BALD}</p>
    );
  }

  async function absenden(ereignis) {
    ereignis.preventDefault();
    if (stand === 'sendet') return;
    const werte = new FormData(ereignis.currentTarget);
    const topf = String(werte.get('website') || '') !== '';
    // Über 23 h offen: neu zählen, sonst verwirft der Endpunkt still (Anmeldeweiche).
    if (!angezeigt.current || Date.now() - angezeigt.current > 23 * 3600 * 1000) angezeigt.current = Date.now();
    const t = angezeigt.current + versatz.current;
    const gesendet = termin;
    setStand('sendet');
    setMeldung('');
    const rest = 1600 - (Date.now() - angezeigt.current);
    if (rest > 0) await new Promise((weiter) => setTimeout(weiter, rest));
    const utm = utmContent(window.location.search);
    let status = 0;
    let antwort = null;
    try {
      const r = await fetch(`${ANMELDE_ENDPUNKT}/f/${FORMULAR}`, {
        method: 'POST',
        credentials: 'omit',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(nutzlast({werte, t, anzeige, termin: gesendet, seite: window.location.pathname, utm})),
      });
      status = r.status;
      antwort = await r.json().catch(() => null);
    } catch {
      status = 0;
    }
    const z = antwortZustand(status, antwort);
    if (z.zustand === 'neu_laden') {
      const wege = await holeAnmeldewege({frisch: true}).catch(() => null);
      const neu = wege ? wege.anzeige[FORMULAR] : null;
      if (anzeigeVollstaendig(neu)) {
        versatz.current = wege.versatz;
        setLage({anzeige: neu, weg: wege.formulare[FORMULAR]});
      }
    }
    if (z.zustand === 'fertig') {
      if (!topf) leadSenden({qpxTrack, fenster: window, webinarId: gesendet ? gesendet.webinar_id : '', utm, eventId: eventId()});
      setKalender(kalenderErlaubt(gesendet, Date.now() + versatz.current) ? gesendet : null);
    }
    setMeldung(z.meldung);
    setStand(z.zustand === 'fertig' ? 'fertig' : 'bereit');
  }

  if (stand === 'fertig') {
    return (
      <div className="wn-karte" data-webinar-zustand="fertig" data-formular={FORMULAR}>
        <p className="wn-danke" role="status">{meldung}</p>
        {kalender ? <KalenderKnopf termin={kalender} /> : <p className="wn-klein">Den Termin findest du in der Mail.</p>}
      </div>
    );
  }

  const frageMax = Number(anzeige.frage_max) > 0 ? Number(anzeige.frage_max) : 500;
  return (
    <form
      className="wn-karte"
      onSubmit={absenden}
      data-formular={FORMULAR}
      data-webinar-zustand={weg === 'eigen' ? 'offen' : 'bald'}
      data-einwilligung={anzeige.einwilligung_id}
    >
      {weg === 'eigen' ? null : (
        <p className="wn-status" role="status">{OEFFNET_BALD}</p>
      )}
      <label className="wn-feldname" htmlFor={`${kennung}-vorname`}>
        {anzeige.vorname_feld}
      </label>
      <input id={`${kennung}-vorname`} className="wn-feld" name="vorname" type="text" autoComplete="given-name" maxLength={80} required />
      <label className="wn-feldname" htmlFor={`${kennung}-email`}>
        {anzeige.email_feld}
      </label>
      <input id={`${kennung}-email`} className="wn-feld" name="email" type="email" inputMode="email"
        autoComplete="email" maxLength={254} required />
      <label className="wn-feldname" htmlFor={`${kennung}-frage`}>
        {anzeige.frage_feld || 'Deine Frage an Christian'}{' '}
        <span className="wn-gedaempft">({anzeige.frage_hinweis || 'freiwillig'})</span>
      </label>
      <textarea id={`${kennung}-frage`} className="wn-feld wn-frage-feld" name="frage" rows={3} maxLength={frageMax} />
      {/* Falle für Automaten wie in der Anmeldeweiche (Begründung dort). */}
      <div className="wn-falle" aria-hidden="true">
        <label htmlFor={`${kennung}-website`}>Bitte leer lassen</label>
        <input id={`${kennung}-website`} name="website" type="text" tabIndex={-1} autoComplete="new-password"
          data-1p-ignore="true" data-lpignore="true" data-bwignore="true" data-form-type="other" />
      </div>
      <p className="wn-einwilligung" id={`${kennung}-einwilligung`}>
        {anzeige.einwilligung}{' '}
        <Link className="wn-verweis" to="/pages/datenschutz" prefetch="intent">
          Datenschutz
        </Link>
      </p>
      <button className="wn-knopf" type="submit" aria-describedby={`${kennung}-einwilligung`} disabled={stand === 'sendet'} data-qa="cta">
        {stand === 'sendet' ? 'Wird gesendet …' : anzeige.knopf}
      </button>
      {meldung ? (
        <p className="wn-meldung" role="alert">{meldung}</p>
      ) : null}
    </form>
  );
}

/** @param {{daten: {anzeige: object|null, weg: string, stand: string, bestaetigt: boolean}}} props */
export function NachtWebinarSeite({daten}) {
  const [lage, setLage] = useState({anzeige: daten.anzeige, weg: daten.weg});
  const versatz = useRef(0);
  const termin = terminAus(lage.anzeige);

  useEffect(() => {
    const server = Date.parse(daten.stand);
    versatz.current = Number.isFinite(server) ? server - Date.now() : 0;
    let aktiv = true;
    holeAnmeldewege()
      .then((wege) => {
        const neu = wege ? wege.anzeige[FORMULAR] : null;
        if (!aktiv || !anzeigeVollstaendig(neu)) return;
        versatz.current = wege.versatz;
        setLage({anzeige: neu, weg: wege.formulare[FORMULAR]});
      })
      .catch(() => {});
    return () => {
      aktiv = false;
    };
  }, [daten.stand]);

  return (
    <div className="wn" data-webinar={THEMA} data-webinar-seite="anmeldung">
      <Abschnitt id="wn-kopf" art="wn-kopf">
        <p className="wn-vorzeile">Kostenloses Live-Webinar mit Christian</p>
        <h1 className="wn-h1">Die Nacht entscheidet</h1>
        <p className="wn-lede">{VERSPRECHEN}</p>
        <p className="wn-termin" data-webinar-termin={termin ? termin.webinar_id : ''}>
          {terminText(termin)}
        </p>
        <ul className="wn-merkmale">
          <li>Live, keine Aufzeichnung</li>
          <li>45 Minuten, danach deine Fragen</li>
          <li>Kostenlos per Zoom</li>
        </ul>
        {daten.bestaetigt ? (
          <div className="wn-karte wn-bestaetigt" role="status" data-webinar-zustand="bestaetigt">
            <p className="wn-danke">Deine Anmeldung ist bestätigt. Den Zoom-Link schicken wir dir per E-Mail.</p>
            {termin ? <KalenderKnopf termin={termin} /> : null}
          </div>
        ) : (
          <a className="wn-knopf" href="#anmelden" data-qa="cta" data-qb-kaufknopf="">
            Zur Anmeldung
          </a>
        )}
      </Abschnitt>

      <Abschnitt id="wn-zielgruppe" art="wn-flaeche">
        <h2 className="wn-h2">Für dich, wenn …</h2>
        <ul className="wn-liste">
          {FUER_DICH.map((satz) => (
            <li key={satz}>{satz}</li>
          ))}
        </ul>
      </Abschnitt>

      <Abschnitt id="wn-mitnehmen">
        <h2 className="wn-h2">Das nimmst du mit</h2>
        <ol className="wn-schritte">
          {MITNEHMEN.map((punkt, i) => (
            <li key={punkt}>
              <span className="wn-nr" aria-hidden="true">{i + 1}</span>
              {punkt}
            </li>
          ))}
        </ol>
        <p className="wn-text wn-mitte">45 Minuten, ein Experiment, danach deine Fragen.</p>
      </Abschnitt>

      <Abschnitt id="wn-sprecher" art="wn-flaeche">
        <div className="wn-paar">
          <Bild foto={FOTO.christian} breiten={[320, 480, 640]} sizes="(max-width: 767px) 60vw, 320px" className="wn-bild" />
          <div>
            <h2 className="wn-h2">Live im Webinar: Christian</h2>
            <p className="wn-text">Christian, Diplom-Ingenieur und Gründer von Qi Blanco.</p>
            <blockquote className="wn-zitat" data-fremdtext="christian-cold-story-2b-20261008">
              <p>„Vor mehr als 10 Jahren habe ich Qi Blanco gegründet, aus meiner eigenen Leidensgeschichte heraus.“</p>
            </blockquote>
            <p className="wn-text">Im Webinar erzählt er, wie es dazu kam, und beantwortet live deine Fragen.</p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt id="wn-gast">
        <h2 className="wn-h2">Ein Gedanke von Matthias Cebula</h2>
        <figure className="wn-gast">
          <blockquote className="wn-zitat" data-fremdtext="cebula-podcast-austherapiert-010910">
            <p>
              „… das grundsätzliche Wissen darum, dass wir hier unser Gehirn maximal schützen können, indem wir
              sagen, wir schlafen nicht im Elektrosmog …“
            </p>
          </blockquote>
          <figcaption className="wn-klein">
            Matthias Cebula, Autor von „Austherapiert“, im Podcast mit Christian (01:09:10)
          </figcaption>
        </figure>
      </Abschnitt>

      <Abschnitt id="wn-vertrauen" art="wn-flaeche">
        <h2 className="wn-h2">Wer für uns prüft</h2>
        <div className="wn-zwei">
          <div className="wn-person">
            <Bild foto={FOTO.dartsch} breiten={[480, 800, 1132]} sizes={PERSON_SIZES} className="wn-bild" />
            <h3 className="wn-h3">Prof. Dr. Peter C. Dartsch</h3>
            <p className="wn-text">
              Er leitet das Institut Dartsch Scientific und hat in unserem Auftrag vier Zellstudien zu unseren
              Produkten gemacht.
            </p>
          </div>
          <div className="wn-person">
            <Bild foto={FOTO.walach} breiten={[480, 800, 1200]} sizes={PERSON_SIZES} className="wn-bild" />
            <h3 className="wn-h3">Prof. Dr. Dr. Harald Walach</h3>
            <p className="wn-text">
              Eine placebokontrollierte Humanstudie mit HRV-Messung ist in Vorbereitung, Prof. Dr. Dr. Walach berät uns.
            </p>
          </div>
        </div>
      </Abschnitt>

      <Abschnitt id="wn-erfahrungen">
        <h2 className="wn-h2">Was andere erleben</h2>
        <div className="wn-zwei">
          {ERFAHRUNGEN.map(([wer, was]) => (
            <figure className="wn-karte wn-karte-hell" key={wer}>
              <blockquote className="wn-text">{was}</blockquote>
              <figcaption className="wn-wer">{wer}</figcaption>
            </figure>
          ))}
        </div>
        <p className="wn-klein wn-mitte">Sinngemäß aus ihren Videos.</p>
      </Abschnitt>

      <Abschnitt id="wn-anmeldung" art="wn-dunkel" anker="anmelden">
        <h2 className="wn-h2">Melde dich kostenlos an</h2>
        <p className="wn-text wn-mitte">{terminText(termin)} · live per Zoom</p>
        <Anmeldung lage={lage} versatz={versatz} setLage={setLage} />
      </Abschnitt>

      <Abschnitt id="wn-fragen">
        <h2 className="wn-h2">Häufige Fragen</h2>
        <dl className="wn-fragen">
          {FRAGEN.map(([frage, antwort]) => (
            <div key={frage}>
              <dt className="wn-h3">{frage}</dt>
              <dd className="wn-text">{antwort}</dd>
            </div>
          ))}
        </dl>
      </Abschnitt>
    </div>
  );
}
