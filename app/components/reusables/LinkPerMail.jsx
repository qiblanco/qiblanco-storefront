import {useEffect, useId, useState} from 'react';
import {useFetcher} from 'react-router';
import {
  LINK_PER_MAIL_ROUTE,
  PFAD_RX,
  istMetaBrowser,
} from '~/lib/inapp-bruecke';

/**
 * „Link per E-Mail schicken" für Besucher im Instagram-/Facebook-Browser
 * (CJ-Großjob 20260930-GROSSJOB-customer-journey-tracking-meta-kaufzuordnung-
 * 30-prozent, Segment s06).
 *
 * WARUM: 96 % der bezahlten Meta-Besucher sind im Browser der App. Wer dort
 * nicht kauft, kauft später woanders, und dieser Kauf war nie mit der Anzeige
 * verbunden (0 von 7.144 Meta-Kennungen trugen eine E-Mail, gemessen 30.09.).
 * Der Besucher bekommt hier auf Wunsch seinen Warenkorb bzw. diese Seite als
 * Link per Mail. Der Link öffnet über /weiter/<token> DENSELBEN Warenkorb im
 * anderen Browser (app/routes/weiter.$token.jsx).
 *
 * EINWILLIGUNG: entschieden wird serverseitig in app/routes/link-per-mail.jsx
 * mit derselben Regel wie für die personenbezogenen Warenkorb-Attribute. Das
 * identify dieser Sitzung macht der BESTAND: qpx.js meldet beim Absenden eines
 * <form> mit E-Mail-Feld ein identify (initIdentify, Capture-Phase, auch vor
 * dem preventDefault von React Router) und lädt nur mit Marketing-Einwilligung.
 * Deshalb ist dies ein echtes <form> mit input[type=email] und es gibt hier
 * KEINEN eigenen identify-Aufruf.
 *
 * SICHTBAR nur im Meta-Browser (dieselbe Markerliste wie classifyUserAgent,
 * keine zweite) UND nur, wenn die Weiche des Servers „an" sagt: Kunden sehen
 * das Element erst, wenn der Kundenweg des Eigenversands offen ist; unsere
 * stummen Proben (Haus-Marker) sehen es immer. Gelesen nach der Hydration:
 * Server- und Client-Markup bleiben identisch.
 *
 * Höchstens EIN Element je Seite: eine Seite mit zwei Kaufboxen bekäme sonst
 * zwei Formulare.
 *
 * Messmarker: data-link-per-mail, data-link-per-mail-art.
 * RÜCKWEG: LINK_PER_MAIL_AN = false (ein Deploy), sofort ohne Deploy über die
 * Weiche (hyros-eigenbau/learning/inapp_bruecke/config/inapp_bruecke.conf
 * BRUECKE_ANZEIGE=aus) oder `hb-deploy revert` des Merge-Commits.
 */
export const LINK_PER_MAIL_AN = true;

const TEXTE = {
  warenkorb: {
    auf: 'Später weitermachen? Warenkorb per E-Mail schicken',
    satz: 'Du bekommst einen Link zu deinem Warenkorb. Er öffnet ihn überall, auch am Laptop.',
  },
  seite: {
    auf: 'Später weitermachen? Link per E-Mail schicken',
    satz: 'Du bekommst einen Link zu dieser Seite. Er öffnet sie überall, auch am Laptop.',
  },
};

const FEHLER = {
  adresse: 'Bitte prüf deine E-Mail-Adresse.',
  drossel: 'Wir haben dir gerade schon einen Link geschickt. Schau in dein Postfach.',
};
const FEHLER_SONST =
  'Das hat gerade nicht geklappt. Bitte versuch es gleich noch einmal.';

// Je Art höchstens ein Element auf der Seite (zwei Kaufboxen = ein Formular).
// Warenkorb und Seite zählen getrennt: im geöffneten Warenkorb auf einer
// Produktseite gehört der Warenkorb-Link dazu.
const belegt = {warenkorb: false, seite: false};

/**
 * @param {{art: 'warenkorb' | 'seite'}}
 */
export function LinkPerMail({art}) {
  const [bereit, setBereit] = useState(false);
  const [offen, setOffen] = useState(false);
  const [pfad, setPfad] = useState('');
  const fetcher = useFetcher();
  const id = useId();

  useEffect(() => {
    if (!LINK_PER_MAIL_AN || belegt[art]) return undefined;
    if (!istMetaBrowser(window.navigator?.userAgent)) return undefined;
    const hier = art === 'warenkorb' ? '/cart' : window.location.pathname;
    if (!PFAD_RX.test(hier)) return undefined;
    belegt[art] = true;
    let aktiv = true;
    fetch(`${LINK_PER_MAIL_ROUTE}?w=1`, {headers: {Accept: 'application/json'}})
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (aktiv && j?.an === true) {
          setPfad(hier);
          setBereit(true);
        }
      })
      .catch(() => {});
    return () => {
      aktiv = false;
      belegt[art] = false;
    };
  }, [art]);

  if (!bereit) return null;
  const text = TEXTE[art] || TEXTE.seite;
  const antwort = fetcher.data;
  const sendet = fetcher.state !== 'idle';

  return (
    <div
      className="link-per-mail"
      data-link-per-mail=""
      data-link-per-mail-art={art}
    >
      {!offen ? (
        <button
          type="button"
          className="btn--text link-per-mail__auf"
          aria-expanded="false"
          onClick={() => setOffen(true)}
        >
          {text.auf}
        </button>
      ) : antwort?.ok ? (
        <p className="link-per-mail__satz" role="status">
          Der Link ist unterwegs. Schau gleich in dein Postfach.
        </p>
      ) : (
        <fetcher.Form
          method="post"
          action={LINK_PER_MAIL_ROUTE}
          className="link-per-mail__form"
        >
          <p className="link-per-mail__satz">{text.satz}</p>
          <label className="link-per-mail__label" htmlFor={`${id}-email`}>
            Deine E-Mail-Adresse
          </label>
          <div className="link-per-mail__zeile">
            <input
              id={`${id}-email`}
              className="link-per-mail__eingabe"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              required
              maxLength={254}
            />
            <button
              type="submit"
              className="btn--secondary link-per-mail__senden"
              disabled={sendet}
            >
              {sendet ? 'Wird geschickt …' : 'Link schicken'}
            </button>
          </div>
          <input type="hidden" name="art" value={art} />
          <input type="hidden" name="pfad" value={pfad} />
          <input
            className="link-per-mail__topf"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          {antwort && !antwort.ok ? (
            <p className="link-per-mail__fehler" role="alert">
              {FEHLER[antwort.code] || FEHLER_SONST}
            </p>
          ) : null}
          <p className="link-per-mail__hinweis">
            Nur dieser eine Link, kein Newsletter.
          </p>
        </fetcher.Form>
      )}
    </div>
  );
}
