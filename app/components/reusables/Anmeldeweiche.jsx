import {useEffect, useId, useRef, useState} from 'react';
import anmeldeStyles from './anmeldeformular.css?url';
import {beobachten, starteNachschicken, zustellen} from './anmelde-puffer';

/*
 * ANMELDEFORMULAR — fest das eigene Formular (AC-Abschluss, Elina
 * EL-20261103-b633cb45, Punkt 5). Bis dahin war dies eine Weiche je Formular
 * zwischen ActiveCampaign und dem eigenen Weg (Stufe E1 der AC-Ablösung, Großjob
 * 20260926-GROSSJOB-activecampaign-abloesen-bis-28-november-stufenplan-alarm,
 * Segment s11). ActiveCampaign gibt es nach dem Kontoende nicht mehr; ein
 * Embed als Rückfall zeigte dann ein leeres Formular.
 *
 * WAS /w NOCH LIEFERT: Einwilligungssatz, Kennung, Knopftext und den Uhrstand.
 * Der Schalter je Formular (formulare[id]) wird nicht mehr gelesen.
 *
 * WAS BEI EINEM FEHLER PASSIERT:
 *  - /w antwortet nicht oder kennt das Formular nicht: ein zweiter Abruf ohne
 *    Cache, dann ein ruhiger Hinweis statt eines Formulars ohne Satz. Ohne den
 *    Satz aus /w gibt es keine Anmeldung, weil der Nachweis ihn nennen muss.
 *  - die Anmeldung scheitert (5xx, 429, Netz): der Rückfall-Puffer hält sie im
 *    Browser (anmelde-puffer.js); geht auch das nicht, die Bitte, es in ein
 *    paar Minuten noch einmal zu versuchen.
 *
 * DER EINWILLIGUNGSSATZ KOMMT AUS /w und steht nirgends in diesem Repo. Er ist
 * Teil des Nachweises im Kontakt-Tresor; eine Kopie hier liefe beim nächsten
 * Textwechsel still auseinander, und der Mensch hätte einem anderen Satz
 * zugestimmt als dem, den der Nachweis nennt.
 *
 * DAS ZEITFELD t IST PFLICHT: der Endpunkt verwirft eine Anmeldung STILL (202,
 * nichts gespeichert), wenn t fehlt, älter als 24 h ist oder weniger als 1,5 s
 * vor dem Absenden liegt (Automaten-Falle). t wird deshalb beim Anzeigen im
 * Browser gesetzt (useEffect), nie beim Serverrendern — eine gecachte Seite
 * trüge sonst einen alten Wert. Wer schneller absendet, wartet den Rest der
 * 1,6 s ab, statt still verworfen zu werden.
 * t STEHT IN SERVERZEIT, nicht in der Uhr des Besuchers: der Server rechnet
 * seine Uhr gegen t. Eine 30 s vorgehende Kundenuhr ergab sonst `zu_schnell`
 * und eine stille Danke-Meldung ohne Anmeldung (K3-Prüfung 06.10.2026, B3).
 * Der Versatz kommt aus `stand` von /w. Er ist durch Cache (≤ 60 s), Laufzeit
 * und Sekundenrundung immer zu klein, t also höchstens zu ALT — die sichere
 * Richtung, weil nur ein zu junges t (oder eines über 24 h) verworfen wird.
 *
 * DIE KENNUNG DES GEZEIGTEN SATZES GEHT MIT (einwilligung_id). Ändert sich der
 * Satz, während ein Tab offen steht, antwortet der Endpunkt 409; das Formular
 * holt den neuen Satz und bittet um einen zweiten Klick (K3-Prüfung, B2).
 *
 * VORSCHAU OHNE UMSCHALTEN (localStorage 'qb-anmeldung-vorschau') gilt nur
 * noch für WiederLieferbar.jsx (Weg 'aus'); die Anmeldeformulare hier zeigen
 * ohnehin immer das eigene Formular.
 */

// STELLE 1 VON 2 — die zweite ist connect-src in app/entry.server.jsx. Fehlt
// sie dort, blockt die CSP STILL und keine Seite zeigt ein Formular.
export const ANMELDE_ENDPUNKT = 'https://anmelden.dienst.qiblanco.com';

const WEICHE_ZEITLIMIT_MS = 2500;
const WEICHE_GUELTIG_MS = 5 * 60 * 1000;
const MIN_ANZEIGE_MS = 1600;
const MAX_ANZEIGE_MS = 23 * 3600 * 1000;
const VORSCHAU_SCHLUESSEL = 'qb-anmeldung-vorschau';

// Rückfall-Puffer (Elina EL-20261107-af9594f2, Punkt 4; anmelde-puffer.js): nur, wenn die Anmeldung
// nachweislich im Browser liegt. Sonst die Bitte „in ein paar Minuten“.
const PUFFER_TEXT = {
  de: {
    wartet: 'Wir haben deine Anmeldung. Sie wird gleich übertragen.',
    gemerkt:
      'Wir haben deine Anmeldung. Sie wird übertragen, sobald die Verbindung wieder steht. Lass die Seite dafür offen oder schau später noch einmal vorbei. Danach kommt die Mail zum Bestätigen.',
  },
  en: {
    wartet: 'We have your sign-up. It will be sent in a moment.',
    gemerkt:
      'We have your sign-up. It will be sent as soon as the connection is back. Keep this page open or visit us again later. Then you will get the email to confirm.',
  },
};

let wegeAnfrage = null;
let wegeGeholt = 0;

function wegeGueltig(wege) {
  return Boolean(
    wege &&
      wege.formulare &&
      typeof wege.formulare === 'object' &&
      wege.anzeige &&
      typeof wege.anzeige === 'object',
  );
}

function anzeigeVollstaendig(anzeige) {
  return Boolean(
    anzeige &&
      typeof anzeige.einwilligung === 'string' &&
      anzeige.einwilligung.trim() &&
      typeof anzeige.knopf === 'string' &&
      anzeige.knopf.trim() &&
      anzeige.einwilligung_id,
  );
}

// Versatz Serveruhr minus Besucheruhr in ms (0, wenn /w keinen Stand trägt).
function uhrVersatz(wege) {
  const server = Date.parse(wege && wege.stand);
  return Number.isFinite(server) ? server - Date.now() : 0;
}

function holeWege({frisch = false} = {}) {
  if (!frisch && wegeAnfrage && Date.now() - wegeGeholt < WEICHE_GUELTIG_MS) {
    return wegeAnfrage;
  }
  wegeGeholt = Date.now();
  wegeAnfrage = (async () => {
    const abbruch =
      typeof AbortController === 'undefined' ? null : new AbortController();
    const uhr = setTimeout(() => abbruch && abbruch.abort(), WEICHE_ZEITLIMIT_MS);
    try {
      const antwort = await fetch(`${ANMELDE_ENDPUNKT}/w`, {
        credentials: 'omit',
        cache: frisch ? 'no-cache' : 'default',
        signal: abbruch ? abbruch.signal : undefined,
      });
      if (!antwort.ok) return null;
      const wege = await antwort.json();
      if (!wegeGueltig(wege)) return null;
      return {...wege, versatz: uhrVersatz(wege)};
    } catch {
      return null;
    } finally {
      clearTimeout(uhr);
    }
  })();
  // Ein Fehlschlag wird nicht für die ganze Sitzung gemerkt.
  wegeAnfrage.then((wege) => {
    if (!wege) wegeAnfrage = null;
  });
  return wegeAnfrage;
}

function vorschauEigen(formId) {
  try {
    const wert = window.localStorage.getItem(VORSCHAU_SCHLUESSEL);
    if (!wert) return false;
    if (wert === 'eigen') return true;
    return wert
      .split(',')
      .map((teil) => teil.trim())
      .includes(String(formId));
  } catch {
    return false;
  }
}

/** Hinweis, wenn /w auch im zweiten Abruf keinen Satz liefert. */
const STOERUNG_TEXT = {
  de: 'Die Anmeldung ist gerade nicht erreichbar. Bitte versuche es in ein paar Minuten noch einmal.',
  en: 'Sign-up is not available right now. Please try again in a few minutes.',
};

/**
 * @param {{formId: string, dunkel?: boolean, sprache?: 'de' | 'en'}} props
 *   dunkel   heller Text auf dunklem Grund (Fußzeile)
 *   sprache  nur für den Störungshinweis (sonst kommt die Sprache aus /w)
 */
export function AnmeldeWeiche({formId, dunkel = false, sprache = 'de'}) {
  const [lage, setLage] = useState({weg: 'offen'});

  useEffect(() => {
    // Jede Seite trägt die Fußzeile: hier gehen liegengebliebene Anmeldungen beim nächsten Seitenaufruf raus.
    starteNachschicken({endpunkt: ANMELDE_ENDPUNKT});
    let aktiv = true;
    const id = String(formId);
    const lesen = (wege) => {
      const anzeige = wege ? wege.anzeige[id] : null;
      return anzeigeVollstaendig(anzeige) ? {weg: 'eigen', anzeige, versatz: wege.versatz} : null;
    };
    holeWege()
      .then((wege) => lesen(wege) || holeWege({frisch: true}).then(lesen))
      .then((neu) => {
        if (aktiv) setLage(neu || {weg: 'stoerung'});
      })
      .catch(() => {
        if (aktiv) setLage({weg: 'stoerung'});
      });
    return () => {
      aktiv = false;
    };
  }, [formId]);

  const klasse = `qb-anmelden${dunkel ? ' qb-anmelden--dunkel' : ''}`;
  return (
    <>
      {/* Immer mitgerendert, damit das Formular nicht ungestaltet aufblitzt,
          wenn es nach /w erscheint. */}
      <link rel="stylesheet" href={anmeldeStyles} />
      {lage.weg === 'offen' ? (
        <div className="qb-anmelden-platz" data-anmeldeweg="offen" />
      ) : null}
      {lage.weg === 'stoerung' ? (
        <div className={klasse} data-anmeldeweg="stoerung" data-formular={String(formId)}>
          <p className="qb-anmelden__meldung" role="status">
            {STOERUNG_TEXT[sprache === 'en' ? 'en' : 'de']}
          </p>
        </div>
      ) : null}
      {lage.weg === 'eigen' ? (
        <EigenesFormular
          formId={String(formId)}
          anzeige={lage.anzeige}
          versatz={lage.versatz}
          dunkel={dunkel}
        />
      ) : null}
    </>
  );
}

function EigenesFormular({formId, anzeige: ersteAnzeige, versatz: ersterVersatz, dunkel}) {
  const kennung = useId();
  const angezeigt = useRef(0);
  const [anzeige, setAnzeige] = useState(ersteAnzeige);
  const versatz = useRef(ersterVersatz || 0);
  const [stand, setStand] = useState('bereit');
  const [meldung, setMeldung] = useState('');
  const gepuffert = useRef('');
  const deutsch = anzeige.sprache !== 'en';
  const puffer = PUFFER_TEXT[deutsch ? 'de' : 'en'];

  useEffect(() => {
    angezeigt.current = Date.now();
  }, []);

  // Geht die gepufferte Anmeldung später durch (Takt, Netz zurück), zeigt das Formular den Danke-Satz.
  useEffect(() => {
    if (stand !== 'gepuffert') return undefined;
    return beobachten((id, ergebnis) => {
      if (id !== gepuffert.current || ergebnis.status !== 202 || !ergebnis.antwort || !ergebnis.antwort.ok) return;
      setMeldung(
        ergebnis.antwort.text ||
          (deutsch
            ? 'Wir haben dir gerade eine Mail geschickt. Bestätige darin deine Anmeldung.'
            : "We've just sent you an email. Confirm your subscription there."),
      );
      setStand('fertig');
    });
  }, [stand, deutsch]);

  async function absenden(ereignis) {
    ereignis.preventDefault();
    if (stand === 'sendet') return;
    const daten = new FormData(ereignis.currentTarget);
    // Anzeigezeit in Besucheruhr: nur für Abstände (Wartezeit, 23 h).
    if (!angezeigt.current || Date.now() - angezeigt.current > MAX_ANZEIGE_MS) {
      angezeigt.current = Date.now();
    }
    // Was der Server bekommt: dieselbe Anzeigezeit in Serverzeit.
    const t = Math.round(angezeigt.current + versatz.current);
    setStand('sendet');
    setMeldung('');
    const rest = MIN_ANZEIGE_MS - (Date.now() - angezeigt.current);
    if (rest > 0) await new Promise((fertig) => setTimeout(fertig, rest));

    // Rückfall-Puffer: ablegen, bis zu drei Runden direkt und über die Shop-Route (anmelde-puffer.js).
    const ergebnis = await zustellen(
      {
        formular: formId,
        felder: {
          vorname: String(daten.get('vorname') || ''),
          email: String(daten.get('email') || ''),
          website: String(daten.get('website') || ''),
          einwilligung_id: String(anzeige.einwilligung_id),
          seite: window.location.pathname,
        },
        t,
        versatz: versatz.current,
      },
      {endpunkt: ANMELDE_ENDPUNKT, beiWarten: (gemerkt) => gemerkt && setMeldung(puffer.wartet)},
    );
    if (ergebnis.gepuffert) {
      gepuffert.current = ergebnis.id;
      setMeldung(puffer.gemerkt);
      setStand('gepuffert');
      starteNachschicken({endpunkt: ANMELDE_ENDPUNKT, sofort: false});
      return;
    }
    const {status, antwort} = ergebnis;

    if (status === 202 && antwort && antwort.ok) {
      setStand('fertig');
      setMeldung(
        antwort.text ||
          (deutsch
            ? 'Wir haben dir gerade eine Mail geschickt. Bestätige darin deine Anmeldung.'
            : "We've just sent you an email. Confirm your subscription there."),
      );
      return;
    }
    if (status === 409) {
      // Der Satz hat sich geändert, seit das Formular erschien: neuen Satz
      // holen und zeigen, der Mensch bestätigt den Satz, den er jetzt sieht.
      const wege = await holeWege({frisch: true}).catch(() => null);
      const neu = wege ? wege.anzeige[formId] : null;
      if (anzeigeVollstaendig(neu)) {
        versatz.current = wege.versatz;
        setAnzeige(neu);
        setStand('bereit');
        setMeldung(
          deutsch
            ? 'Der Text über dem Knopf hat sich gerade geändert. Bitte lies ihn und klick noch einmal.'
            : 'The text above the button has just changed. Please read it and click again.',
        );
        return;
      }
    }
    if (status === 400) {
      setStand('bereit');
      setMeldung(
        deutsch
          ? 'Bitte prüf deine E-Mail-Adresse.'
          : 'Please check your email address.',
      );
      return;
    }
    setStand('bereit');
    setMeldung(
      deutsch
        ? 'Bitte versuche es in ein paar Minuten noch einmal.'
        : 'Please try again in a few minutes.',
    );
  }

  const klasse = `qb-anmelden${dunkel ? ' qb-anmelden--dunkel' : ''}`;

  if (stand === 'gepuffert') {
    return (
      <div className={klasse} data-anmeldeweg="gepuffert" data-formular={formId}>
        <p className="qb-anmelden__danke" role="status">
          {meldung}
        </p>
      </div>
    );
  }

  if (stand === 'fertig') {
    return (
      <div className={klasse} data-anmeldeweg="eigen" data-formular={formId}>
        <p className="qb-anmelden__danke" role="status">
          {meldung}
        </p>
      </div>
    );
  }

  return (
    <form
      className={klasse}
      onSubmit={absenden}
      data-anmeldeweg="eigen"
      data-formular={formId}
      data-einwilligung={anzeige.einwilligung_id}
    >
      <div className="qb-anmelden__felder">
        <label className="qb-anmelden__unsichtbar" htmlFor={`${kennung}-vorname`}>
          {anzeige.vorname_feld}
        </label>
        <input
          id={`${kennung}-vorname`}
          className="qb-anmelden__feld"
          name="vorname"
          type="text"
          autoComplete="given-name"
          placeholder={anzeige.vorname_feld}
          maxLength={80}
          required
        />
        <label className="qb-anmelden__unsichtbar" htmlFor={`${kennung}-email`}>
          {deutsch ? 'E-Mail-Adresse' : 'Email address'}
        </label>
        <input
          id={`${kennung}-email`}
          className="qb-anmelden__feld"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={deutsch ? 'E-Mail-Adresse' : 'Email address'}
          maxLength={254}
          required
        />
      </div>
      {/* Falle für Automaten: ein Mensch sieht und füllt dieses Feld nie. */}
      {/* Neutrales Label und die Ignorier-Merkmale der verbreiteten
          Passwortmanager (1Password, LastPass, Bitwarden, Dashlane): ein
          automatisch befülltes Feld hieße eine stille Danke-Meldung ohne
          Anmeldung (K3-Prüfung, B5). */}
      <div className="qb-anmelden__falle" aria-hidden="true">
        <label htmlFor={`${kennung}-website`}>Bitte leer lassen</label>
        <input
          id={`${kennung}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="new-password"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          data-form-type="other"
        />
      </div>
      <p className="qb-anmelden__einwilligung" id={`${kennung}-einwilligung`}>
        {anzeige.einwilligung}
      </p>
      <button
        type="submit"
        className="qb-anmelden__knopf"
        aria-describedby={`${kennung}-einwilligung`}
        disabled={stand === 'sendet'}
      >
        {anzeige.knopf}
      </button>
      {meldung ? (
        <p className="qb-anmelden__meldung" role={stand === 'sendet' ? 'status' : 'alert'}>
          {meldung}
        </p>
      ) : null}
    </form>
  );
}

// Zugang für WiederLieferbar.jsx: derselbe /w-Abruf (ein Abruf je Seite, gleiche
// Fehlerregeln) und dieselbe Vorschau-Regel. Als NEUE Namen statt `export` an
// holeWege/vorschauEigen: so bleiben alle bestehenden Deklarationen byte-gleich,
// und die Seiten, die nur AnmeldeWeiche binden, sind render-neutral (Gate 12).
export function holeAnmeldewege(optionen) {
  return holeWege(optionen);
}

export function anmeldeVorschauEigen(formId) {
  return vorschauEigen(formId);
}
