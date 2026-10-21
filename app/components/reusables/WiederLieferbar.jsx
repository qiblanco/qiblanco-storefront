import {useEffect, useId, useRef, useState} from 'react';
import anmeldeStyles from './anmeldeformular.css?url';
import lieferbarStyles from './wiederlieferbar.css?url';
import {
  ANMELDE_ENDPUNKT,
  holeAnmeldewege as holeWege,
  anmeldeVorschauEigen as vorschauEigen,
} from './Anmeldeweiche';

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
        const anzeige = wege ? wege.anzeige[LIEFERBAR_FORMULAR] : null;
        const zeigen =
          anzeigeVollstaendig(anzeige) &&
          (wege.formulare[LIEFERBAR_FORMULAR] === 'eigen' ||
            vorschauEigen(LIEFERBAR_FORMULAR));
        setLage(zeigen ? {anzeige, versatz: wege.versatz} : null);
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

  useEffect(() => {
    angezeigt.current = Date.now();
  }, []);

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

    let status = 0;
    let antwort = null;
    try {
      const r = await fetch(
        `${ANMELDE_ENDPUNKT}/f/${encodeURIComponent(LIEFERBAR_FORMULAR)}`,
        {
          method: 'POST',
          credentials: 'omit',
          headers: {'Content-Type': 'application/json', Accept: 'application/json'},
          body: JSON.stringify({
            email: String(daten.get('email') || ''),
            website: String(daten.get('website') || ''),
            t: String(t),
            variant_id: String(variantId),
            einwilligung_id: String(anzeige.einwilligung_id),
            seite: window.location.pathname,
          }),
        },
      );
      status = r.status;
      antwort = await r.json().catch(() => null);
    } catch {
      status = 0;
    }
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
    setStand('bereit');
    setMeldung('Das hat gerade nicht geklappt. Bitte versuch es in ein paar Minuten noch einmal.');
  }

  if (stand === 'fertig') {
    return (
      <div
        className="qb-anmelden qb-lieferbar"
        data-anmeldeweg="eigen"
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
        <p className="qb-anmelden__meldung" role="alert">
          {meldung}
        </p>
      ) : null}
    </form>
  );
}
