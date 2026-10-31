import {useEffect, useId, useRef} from 'react';
import {Link, useFetcher} from 'react-router';
import liveAnmeldungStil from '~/styles/the-alpha-live-anmeldung.css?url';

/*
 * LIVE-ANMELDUNG QI ALPHA — Anmeldung zur Live-Vorstellung mit Christian am
 * Sonntag, 8. November 2026 (Grossjob 20261025-prio1-the-alpha-landingpage-
 * figma-vorlage-a-server-b-ki-c, s04). Christian 25.10.2026: „Es soll auf der
 * qi alpha seite unteen eine anmeldungs möglciheite geben für das Live mit
 * Christian“.
 *
 * KEIN NEUES FORMULAR, KEIN NEUER DIENST: das Live IST der Coming-Home-Call
 * vom 08.11. (coming-home/config/themen.json „Coming Home Spezial: Qi Alpha
 * Live-Präsentation“, Zoom 2026-11-08T11:00Z). Dieser Baustein sendet an die
 * bestehende Action von /pages/live (app/routes/pages.live.jsx), die an den
 * Anmeldedienst weiterreicht (Double-Opt-in, Zoom-Link, Erinnerung).
 * Felder genau wie dort: intent, name, email, einwilligung_version, hp.
 *
 * WIEDERVERWENDBAR (Bitte des Grossjobs 20261025-qi-alpha-produktseite-
 * englisch-aufbauen-a-auf-b-niveau): named export, ohne Pflicht-Props, echtes
 * <form data-qa-live-anmeldung method="post" action="/pages/live"> mit
 * input[type=email] im Server-HTML. Ohne JavaScript sendet das Formular
 * normal und der Besucher landet auf /pages/live mit der Antwort.
 * Stil: THE_ALPHA_LIVE_ANMELDUNG_STIL in links() der Route einbinden.
 * `quelle`/`variante` stehen als data-Attribute am Formular (Messung im
 * Seiten-Tracking); der Anmeldedienst bucht heute jede Anmeldung von
 * /pages/live als quelle 'live-de'.
 *
 * EINWILLIGUNG: Version und Wortlaut müssen denen in pages.live.jsx gleichen
 * (EINWILLIGUNG_VERSION / EINWILLIGUNG_TEXT). Die Action prüft die Version;
 * der Test the-alpha-live-anmeldung.test.mjs prüft den Wortlaut gegen die
 * Quelle, damit beide nie still auseinanderlaufen.
 *
 * TRACKING-NAHT: kein Cookie, kein neuer Identitäts- oder Tracking-Schlüssel.
 */

export const THE_ALPHA_LIVE_ANMELDUNG_STIL = liveAnmeldungStil;

export const LIVE_ACTION = '/pages/live';
export const EINWILLIGUNG_VERSION = 'ch-live-1';
export const EINWILLIGUNG_TEXT =
  'Ja, ich möchte zu Coming Home eingeladen werden. Qi Blanco schickt mir ' +
  'dafür den Zoom-Link und vor jedem Termin eine Erinnerung per Mail. Das ist ' +
  'kein Newsletter. Abmelden geht jederzeit mit einem Klick in jeder Mail.';

const FERTIG = ['doi_gesendet', 'schon_bestaetigt', 'gedrosselt', 'direkt'];

const ERFOLG_TITEL = {
  doi_gesendet: 'Schau in dein Postfach',
  schon_bestaetigt: 'Du bist schon angemeldet',
  gedrosselt: 'Die Mail ist schon unterwegs',
  direkt: 'Das hat gerade nicht geklappt',
};

const ERFOLG_TEXT = {
  doi_gesendet:
    'Wir haben dir eine Mail geschickt. Klick dort auf den Knopf, dann bekommst du ' +
    'deinen persönlichen Zoom-Link. Schau auch im Spam-Ordner nach.',
  schon_bestaetigt:
    'Vor jedem Termin bekommst du eine Erinnerung per Mail, mit deinem persönlichen Link, ' +
    'auch vor dem 8. November.',
  gedrosselt: 'Schau auch im Spam-Ordner nach.',
  direkt: 'Bitte versuch es in ein paar Minuten noch einmal.',
};

/**
 * @param {{quelle?: string, variante?: string, titel?: string, knopf?: string, className?: string}} props
 */
export function TheAlphaLiveAnmeldung({
  quelle = 'the-alpha',
  variante = '',
  titel = 'Melde dich an, dein persönlicher Zugang kommt per Mail',
  knopf = 'Kostenlos anmelden',
  className = '',
}) {
  const fetcher = useFetcher();
  const id = useId();
  const erfolgRef = useRef(null);
  const antwort = fetcher.data ?? null;
  const sendet = fetcher.state !== 'idle';
  const zustand = sendet ? 'sendet' : antwort?.zustand || 'offen';
  const fertig = FERTIG.includes(zustand);

  useEffect(() => {
    if (fertig) erfolgRef.current?.focus();
  }, [fertig]);

  if (fertig) {
    return (
      <div
        className={`tal-karte ${className}`}
        data-qa-live-anmeldung=""
        data-zustand={zustand}
        data-quelle={quelle}
        data-variante={variante}
      >
        <p className="tal-titel" tabIndex={-1} ref={erfolgRef}>
          {ERFOLG_TITEL[zustand]}
        </p>
        <p className="tal-text">{ERFOLG_TEXT[zustand]}</p>
        {antwort?.link ? (
          <a className="tal-link" href={antwort.link} target="_blank" rel="noopener noreferrer">
            Zum Zoom-Meeting
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <fetcher.Form
      method="post"
      action={LIVE_ACTION}
      className={`tal-karte ${className}`}
      data-qa-live-anmeldung=""
      data-zustand={zustand}
      data-quelle={quelle}
      data-variante={variante}
    >
      <p className="tal-titel">{titel}</p>
      <input type="hidden" name="intent" value="anmelden" />
      <label className="tal-feldname" htmlFor={`${id}-name`}>
        Dein Name
      </label>
      <input
        id={`${id}-name`}
        className="tal-feld"
        type="text"
        name="name"
        autoComplete="name"
        required
        maxLength={120}
      />
      <label className="tal-feldname" htmlFor={`${id}-email`}>
        Deine E-Mail-Adresse
      </label>
      <input
        id={`${id}-email`}
        className="tal-feld"
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        required
        maxLength={254}
      />
      <label className="tal-einwilligung" htmlFor={`${id}-einwilligung`}>
        <input
          id={`${id}-einwilligung`}
          className="tal-haken"
          type="checkbox"
          name="einwilligung_version"
          value={EINWILLIGUNG_VERSION}
          required
        />
        <span>{EINWILLIGUNG_TEXT}</span>
      </label>
      {/* Falle für Automaten wie auf /pages/live (Begründung dort). */}
      <input
        className="tal-topf"
        type="text"
        name="hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-lpignore="true"
        data-1p-ignore=""
        data-bwignore=""
        data-form-type="other"
      />
      <button className="tal-knopf" type="submit" disabled={sendet}>
        {sendet ? 'Wird gesendet …' : knopf}
      </button>
      {zustand === 'fehler' || zustand === 'eingabe' || zustand === 'ungueltig' ? (
        <p className="tal-fehler" role="alert">
          {antwort?.grund === 'einwilligung'
            ? 'Setz bitte den Haken, damit wir dir den Link schicken dürfen.'
            : 'Das hat nicht geklappt. Bitte prüf deinen Namen und deine E-Mail-Adresse.'}
        </p>
      ) : null}
      <p className="tal-hinweis">
        Du bekommst eine Mail mit einem Knopf zum Bestätigen. Danach schicken wir dir deinen
        persönlichen Zoom-Link. Er gilt nur für dich.{' '}
        <Link className="tal-verweis" to="/pages/datenschutz" prefetch="intent">
          Datenschutz
        </Link>
      </p>
    </fetcher.Form>
  );
}

export default TheAlphaLiveAnmeldung;
