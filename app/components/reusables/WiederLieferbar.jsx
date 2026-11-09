import {useEffect, useId, useRef, useState} from 'react';
import anmeldeStyles from './anmeldeformular.css?url';
import lieferbarStyles from './wiederlieferbar.css?url';
import {
  ANMELDE_ENDPUNKT,
  holeAnmeldewege as holeWege,
  anmeldeVorschauEigen as vorschauEigen,
} from './Anmeldeweiche';
import {beobachten, starteNachschicken, zustellen} from './anmelde-puffer';

/*
 * WIEDER LIEFERBAR — „Benachrichtige mich, wenn wieder lieferbar“ unter dem
 * Knopf „Ausverkauft“ (Großjob 20261021-bau-wieder-lieferbar-eintragung-dunkel,
 * Segment s02; W-LAGER, Wurzel 2). Belegfall 18.10.2026: eine Kundin wollte
 * QiOne 2 Pro und Necklace XL, XL war ausverkauft, sie kaufte nur den QiOne.
 *
 * WER ENTSCHEIDET: der Anmelde-Endpunkt (Modul ac-eingang) meldet unter GET /w
 * für 'lieferbar-dach' den Weg 'aus' oder 'eigen'. Umgeschaltet wird dort
 * (`ac-eingang schalte lieferbar-dach eigen|aus`), ohne Deploy. Der /w-Abruf
 * ist DERSELBE wie in der Anmeldeweiche (ein Abruf je Seite, gleiche
 * Fehlerregeln: 2,5 s, 5xx, kaputtes JSON -> nichts).
 *
 * BEI JEDEM ZWEIFEL RENDERT DIESE KOMPONENTE NICHTS: Weg 'aus', /w nicht
 * erreichbar, Texte unvollständig, lieferbare Variante. Serverrendern und
 * erster Browser-Render geben immer nichts aus (der Weg steht erst nach /w
 * fest) — die Seite bleibt für Kunden byte-gleich, solange der Weg 'aus' ist.
 *
 * ALLE TEXTE KOMMEN AUS /w (titel, hinweis, email_feld, knopf, einwilligung).
 * Der Einwilligungssatz ist Teil des Nachweises; eine Kopie hier liefe beim
 * nächsten Textwechsel still auseinander. Hier stehen nur die Meldungen nach
 * dem Absenden.
 *
 * ZEITFELD t, Kennung des Satzes und Honigtopf wie in der Anmeldeweiche (dort
 * die Begründungen). variant_id ist die Storefront-gid der GEWÄHLTEN Variante;
 * der Endpunkt nimmt sie direkt an. Ein Variantenwechsel setzt das Formular
 * zurück (key auf die Variante), auch eine Danke-Meldung.
 *
 * VORSCHAU OHNE UMSCHALTEN: localStorage 'qb-anmeldung-vorschau' = 'eigen'
 * oder eine Liste mit 'lieferbar-dach' zeigt das Feld nur in DIESEM Browser
 * (Probe, Design-Beleg). Bewusst kein URL-Parameter.
 *
 * Stehende Probe: ac-eingang/pruefungen/probe_storefront_lieferbar.py.
 * Rückweg ohne Deploy: `ac-eingang schalte lieferbar-dach aus`.
 */

export const LIEFERBAR_FORMULAR = 'lieferbar-dach';

// Rückfall-Puffer (Elina EL-20261107-af9594f2, Punkt 4; anmelde-puffer.js), nur bei nachweislich gemerktem Wunsch.
const PUFFER_TEXT = {
  wartet: 'Wir haben deinen Wunsch. Er wird gleich übertragen.',
  gemerkt:
    'Wir haben deinen Wunsch. Er wird übertragen, sobald die Verbindung wieder steht. Lass die Seite dafür offen oder schau später noch einmal vorbei. Danach kommt die Mail zum Bestätigen.',
};

const MIN_ANZEIGE_MS = 1600;
const MAX_ANZEIGE_MS = 23 * 3600 * 1000;

function textDa(wert) {
  return typeof wert === 'string' && wert.trim() !== '';
}

function anzeigeVollstaendig(anzeige) {
  return Boolean(
    anzeige &&
      anzeige.art === 'lieferbar' &&
      textDa(anzeige.titel) &&
      textDa(anzeige.email_feld) &&
      textDa(anzeige.knopf) &&
      textDa(anzeige.einwilligung) &&
      anzeige.einwilligung_id,
  );
}

/** Zeigt der Weg das Formular? Weg 'eigen' (oder Vorschau hier) und Texte vollständig. */
function formularAn(wege) {
  const anzeige = wege ? wege.anzeige[LIEFERBAR_FORMULAR] : null;
  return (
    anzeigeVollstaendig(anzeige) &&
    (wege.formulare[LIEFERBAR_FORMULAR] === 'eigen' || vorschauEigen(LIEFERBAR_FORMULAR))
  );
}

/**
 * Für Vorlagen, in denen ausverkaufte Varianten sonst nicht wählbar sind
 * (AlphaVorlage.jsx, Job 20261109-wiederlieferbar-in-alphavorlage): true erst,
 * wenn das Formular erscheinen würde. Dann darf die Vorlage eine ausverkaufte
 * Karte wählbar machen, damit jemand für genau diese Variante den Wunsch
 * eintragen kann. Serverrender, erster Browser-Render und Weg 'aus' geben false:
 * die Seite bleibt dann wie vorher. Derselbe /w-Abruf wie überall (einer je Seite).
 */
export function useWiederLieferbarAn() {
  const [an, setAn] = useState(false);
  useEffect(() => {
    let aktiv = true;
    holeWege()
      .then((wege) => {
        if (aktiv) setAn(Boolean(formularAn(wege)));
      })
      .catch(() => {
        if (aktiv) setAn(false);
      });
    return () => {
      aktiv = false;
    };
  }, []);
  return an;
}

/**
 * @param {{variantId?: string, ausverkauft: boolean}} props
 *   variantId    Storefront-gid der gewählten Variante
 *   ausverkauft  true, wenn die gewählte Variante nicht kaufbar ist
 */
export function WiederLieferbar({variantId, ausverkauft}) {
  const [lage, setLage] = useState(null);
  const gefragt = Boolean(ausverkauft && variantId);

  useEffect(() => {
    if (!gefragt) {
      setLage(null);
      return undefined;
    }
    let aktiv = true;
    holeWege()
      .then((wege) => {
        if (!aktiv) return;
        setLage(
          formularAn(wege)
            ? {anzeige: wege.anzeige[LIEFERBAR_FORMULAR], versatz: wege.versatz}
            : null,
        );
      })
      .catch(() => {
        if (aktiv) setLage(null);
      });
    return () => {
      aktiv = false;
    };
  }, [gefragt]);

  if (!gefragt || !lage) return null;
  return (
    <>
      <link rel="stylesheet" href={anmeldeStyles} />
      <link rel="stylesheet" href={lieferbarStyles} />
      <LieferbarFormular
        key={variantId}
        variantId={variantId}
        anzeige={lage.anzeige}
        versatz={lage.versatz}
      />
    </>
  );
}

function LieferbarFormular({variantId, anzeige: ersteAnzeige, versatz: ersterVersatz}) {
  const kennung = useId();
  const angezeigt = useRef(0);
  const versatz = useRef(ersterVersatz || 0);
  const [anzeige, setAnzeige] = useState(ersteAnzeige);
  const [stand, setStand] = useState('bereit');
  const [meldung, setMeldung] = useState('');
  const gepuffert = useRef('');

  useEffect(() => {
    angezeigt.current = Date.now();
    starteNachschicken({endpunkt: ANMELDE_ENDPUNKT});
  }, []);

  useEffect(() => {
    if (stand !== 'gepuffert') return undefined;
    return beobachten((id, ergebnis) => {
      if (id !== gepuffert.current || ergebnis.status !== 202 || !ergebnis.antwort || !ergebnis.antwort.ok) return;
      setMeldung(ergebnis.antwort.text || 'Wir haben dir gerade eine Mail geschickt. Bestätige darin deinen Wunsch.');
      setStand('fertig');
    });
  }, [stand]);

  async function absenden(ereignis) {
    ereignis.preventDefault();
    if (stand === 'sendet') return;
    const daten = new FormData(ereignis.currentTarget);
    if (!angezeigt.current || Date.now() - angezeigt.current > MAX_ANZEIGE_MS) {
      angezeigt.current = Date.now();
    }
    const t = Math.round(angezeigt.current + versatz.current);
    setStand('sendet');
    setMeldung('');
    const rest = MIN_ANZEIGE_MS - (Date.now() - angezeigt.current);
    if (rest > 0) await new Promise((fertig) => setTimeout(fertig, rest));

    const ergebnis = await zustellen(
      {
        formular: LIEFERBAR_FORMULAR,
        felder: {
          email: String(daten.get('email') || ''),
          website: String(daten.get('website') || ''),
          variant_id: String(variantId),
          einwilligung_id: String(anzeige.einwilligung_id),
          seite: window.location.pathname,
        },
        t,
        versatz: versatz.current,
      },
      {endpunkt: ANMELDE_ENDPUNKT, beiWarten: (gemerkt) => gemerkt && setMeldung(PUFFER_TEXT.wartet)},
    );
    if (ergebnis.gepuffert) {
      gepuffert.current = ergebnis.id;
      setMeldung(PUFFER_TEXT.gemerkt);
      setStand('gepuffert');
      starteNachschicken({endpunkt: ANMELDE_ENDPUNKT, sofort: false});
      return;
    }
    const {status, antwort} = ergebnis;
    const fehler = antwort && antwort.fehler;

    if (status === 202 && antwort && antwort.ok) {
      setStand('fertig');
      setMeldung(
        antwort.text ||
          'Wir haben dir gerade eine Mail geschickt. Bestätige darin deinen Wunsch.',
      );
      return;
    }
    if (status === 409 && fehler === 'einwilligung_veraltet') {
      const wege = await holeWege({frisch: true}).catch(() => null);
      const neu = wege ? wege.anzeige[LIEFERBAR_FORMULAR] : null;
      if (anzeigeVollstaendig(neu)) {
        versatz.current = wege.versatz;
        setAnzeige(neu);
        setStand('bereit');
        setMeldung(
          'Der Text über dem Knopf hat sich gerade geändert. Bitte lies ihn und klick noch einmal.',
        );
        return;
      }
    }
    if (status === 409 && fehler === 'variante_lieferbar') {
      setStand('bereit');
      setMeldung(
        'Diese Variante ist gerade wieder lieferbar. Lade die Seite neu, dann kannst du sie bestellen.',
      );
      return;
    }
    if (status === 400) {
      setStand('bereit');
      setMeldung('Bitte prüf deine E-Mail-Adresse.');
      return;
    }
    // Gesperrte Adresse: der Endpunkt nennt den Grund selbst (Feld text).
    if (status === 403 && antwort && textDa(antwort.text)) {
      setStand('bereit');
      setMeldung(antwort.text);
      return;
    }
    // Keine Antwort (Netz weg, Zeitüberschreitung): der Wunsch kann schon gespeichert sein. Wortgleich mit
    // FEHLER_TEXT.de.unklar in mail-manager/src/mm_formulare.py (Elina EL-20261103-ca2f6465).
    if (status === 0) {
      setStand('bereit');
      setMeldung(
        'Wir konnten gerade nicht prüfen, ob deine Anmeldung angekommen ist. Schau bitte in dein Postfach. Kommt in ein paar Minuten keine Mail von uns, versuch es noch einmal.',
      );
      return;
    }
    setStand('bereit');
    setMeldung('Das hat gerade nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.');
  }

  if (stand === 'fertig' || stand === 'gepuffert') {
    return (
      <div
        className="qb-anmelden qb-lieferbar"
        data-anmeldeweg={stand === 'gepuffert' ? 'gepuffert' : 'eigen'}
        data-formular={LIEFERBAR_FORMULAR}
        data-variante={variantId}
      >
        <p className="qb-anmelden__danke" role="status">
          {meldung}
        </p>
      </div>
    );
  }

  return (
    <form
      className="qb-anmelden qb-lieferbar"
      onSubmit={absenden}
      data-anmeldeweg="eigen"
      data-formular={LIEFERBAR_FORMULAR}
      data-variante={variantId}
      data-einwilligung={anzeige.einwilligung_id}
    >
      <div className="qb-lieferbar__kopf">
        <p className="qb-lieferbar__titel">{anzeige.titel}</p>
        {textDa(anzeige.hinweis) ? (
          <p className="qb-lieferbar__hinweis">{anzeige.hinweis}</p>
        ) : null}
      </div>
      <label className="qb-anmelden__unsichtbar" htmlFor={`${kennung}-email`}>
        {anzeige.email_feld}
      </label>
      <input
        id={`${kennung}-email`}
        className="qb-anmelden__feld"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={anzeige.email_feld}
        maxLength={254}
        required
      />
      {/* Falle für Automaten, wie in der Anmeldeweiche (Begründung dort). */}
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
