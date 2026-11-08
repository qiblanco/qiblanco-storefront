import {useEffect, useId, useRef, useState} from 'react';
import {Form, useFetcher, useRouteLoaderData} from 'react-router';
import {useAside} from '~/components/Aside';
import {
  B2B_NETTO_AN,
  B2B_NETTO_ROUTE,
  LAENDER,
  LAND_CODES,
  TEXT,
  nettoWegMoeglich,
  zielErlaubt,
} from '~/lib/b2b-netto';

/**
 * „Als Firma ohne MwSt bestellen (EU, mit USt-IdNr.)“ — zweiter, ruhiger Weg
 * unter dem Kassenknopf (Drawer und /cart). Christian 08.11.2026: „… dass die
 * Rechnung und die Zahlung gleich ohne Mehrwertsteuer erfolgt …“.
 *
 * SICHTBAR nur, wenn (a) der Server-Weg scharf ist (/b2b-netto?w=1 fragt
 * serverseitig /healthz, 60 s gemerkt) und (b) der Warenkorb ohne Verlust
 * übergeben werden kann (nettoWegMoeglich: kein Rabatt, keine Zeilen-Merkmale).
 * Sonst existiert er nicht. Gelesen nach der Hydration: Server- und
 * Client-Markup bleiben identisch, und ohne JavaScript gibt es ihn nie.
 *
 * Im Drawer nur, solange der Drawer offen ist (wie KasseImBrowser): der
 * geschlossene Drawer steht im DOM vor der Seite.
 *
 * Bei {ok: true, url} geht es sofort zur Bezahlseite des steuerbefreiten
 * Entwurfs. Sonst steht der Satz der Tür da und daneben die normale Kasse.
 *
 * Anrede „Sie“: der Weg richtet sich an Firmen, und die Sätze der Tür
 * (b2b-ust netto.TEXT) siezen; im selben Kasten gemischt läse es sich falsch.
 *
 * Messmarker: data-b2b-netto, data-b2b-netto-zustand (zu|offen|sendet|weiter|abgelehnt).
 * RÜCKWEG: NETTO=aus am Server (ohne Deploy, ≤ 60 s), B2B_NETTO_AN = false
 * (ein Deploy) oder `hb-deploy revert` des Merge-Commits.
 */

// Ein Abruf der Weiche je Seitenaufruf und Minute, egal wie oft der Drawer aufgeht.
let weiche = {zeit: 0, anfrage: null};
function frageWeiche() {
  const jetzt = Date.now();
  if (weiche.anfrage && jetzt - weiche.zeit < 60_000) return weiche.anfrage;
  weiche = {
    zeit: jetzt,
    anfrage: fetch(`${B2B_NETTO_ROUTE}?w=1`, {headers: {Accept: 'application/json'}})
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => j?.an === true)
      .catch(() => false),
  };
  return weiche.anfrage;
}

/**
 * @param {{cart: any, layout?: 'page' | 'aside'}}
 */
export function B2bNettoWeg({cart, layout}) {
  const [bereit, setBereit] = useState(false);
  const [offen, setOffen] = useState(false);
  const [adAnkunft, setAdAnkunft] = useState('');
  const formRef = useRef(null);
  const fetcher = useFetcher();
  const id = useId();
  const drawerOffen = useAside().type === 'cart';
  const root = useRouteLoaderData('root');
  const passt = nettoWegMoeglich(cart);

  // Bei jedem Öffnen des Drawers neu (der Drawer bleibt über Seitenwechsel
  // eingebunden; ohne das stünde der Weg nach NETTO=aus bis zum Neuladen da).
  // frageWeiche merkt sich die Antwort 60 s, öfter fragt der Browser nie.
  useEffect(() => {
    if (!B2B_NETTO_AN) return undefined;
    let aktiv = true;
    frageWeiche().then((an) => {
      if (aktiv) setBereit(an);
    });
    return () => {
      aktiv = false;
    };
  }, [drawerOffen]);

  // Ankunfts-Wort wie am Kassenknopf (CartSummary.jsx): sonst trüge die
  // Netto-Bestellung immer ad_params_seen=unknown.
  useEffect(() => {
    const zustand = window.__qbAdAnkunft;
    if (zustand === 'yes' || zustand === 'no') setAdAnkunft(zustand);
  }, []);

  // Der Textknopf verschwindet beim Öffnen; der Fokus geht ins erste Feld statt auf body.
  useEffect(() => {
    if (offen) formRef.current?.querySelector('input')?.focus();
  }, [offen]);

  const antwort = fetcher.data;
  const weiter = antwort?.ok === true && zielErlaubt(antwort.url);
  useEffect(() => {
    if (weiter) window.location.assign(antwort.url);
  }, [weiter, antwort?.url]);

  if (!bereit || !passt) return null;
  if (layout === 'aside' && !drawerOffen) return null;

  const sendet = fetcher.state !== 'idle';
  const abgelehnt = antwort && antwort.ok !== true;
  const zustand = !offen
    ? 'zu'
    : weiter
      ? 'weiter'
      : sendet
        ? 'sendet'
        : abgelehnt
          ? 'abgelehnt'
          : 'offen';
  const kaeuferLand = String(root?.buyerCountry || '').toUpperCase();
  const landVorwahl = LAND_CODES.has(kaeuferLand) ? kaeuferLand : '';

  return (
    <div
      className="b2b-netto"
      data-b2b-netto=""
      data-b2b-netto-zustand={zustand}
    >
      {!offen ? (
        <button
          type="button"
          className="btn--text b2b-netto__auf"
          aria-expanded="false"
          onClick={() => setOffen(true)}
        >
          {TEXT.auf}
        </button>
      ) : weiter ? (
        <p className="b2b-netto__satz" role="status">
          {TEXT.weiter}
        </p>
      ) : (
        <fetcher.Form
          ref={formRef}
          method="post"
          action={B2B_NETTO_ROUTE}
          className="b2b-netto__form"
        >
          <input type="hidden" name="ad_params_seen" value={adAnkunft} />
          <p className="b2b-netto__titel">{TEXT.auf}</p>
          <p className="b2b-netto__satz">{TEXT.satz}</p>
          <Feld id={id} name="firma" label="Firma" auto="organization" max={120} />
          <Feld
            id={id}
            name="uid"
            label="USt-IdNr."
            max={20}
            hinweis="z. B. ATU12345678"
            auto="off"
          />
          <div className="b2b-netto__paar">
            <Feld id={id} name="vorname" label="Vorname" auto="given-name" max={60} />
            <Feld id={id} name="nachname" label="Nachname" auto="family-name" max={60} />
          </div>
          <Feld
            id={id}
            name="anschrift"
            label="Straße und Hausnummer"
            auto="address-line1"
            max={120}
          />
          <div className="b2b-netto__paar b2b-netto__paar--plz">
            <Feld id={id} name="plz" label="PLZ" auto="postal-code" max={20} />
            <Feld id={id} name="ort" label="Ort" auto="address-level2" max={60} />
          </div>
          <label className="b2b-netto__label" htmlFor={`${id}-land`}>
            Lieferland
          </label>
          <select
            id={`${id}-land`}
            name="land"
            className="b2b-netto__eingabe"
            autoComplete="country"
            required
            defaultValue={landVorwahl}
          >
            <option value="" disabled>
              Bitte wählen
            </option>
            {LAENDER.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
          <Feld
            id={id}
            name="email"
            label="E-Mail für Rechnung und Bestätigung"
            typ="email"
            auto="email"
            max={254}
          />
          <input
            className="b2b-netto__topf"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          {abgelehnt && !sendet ? (
            <p className="b2b-netto__fehler" role="alert">
              {antwort.text || TEXT.fehler}
            </p>
          ) : null}
          <button
            type="submit"
            className="btn--secondary b2b-netto__senden"
            disabled={sendet}
          >
            {sendet ? TEXT.sendet : TEXT.senden}
          </button>
        </fetcher.Form>
      )}
      {abgelehnt && !sendet && !weiter ? (
        // Die normale Kasse direkt hier, nicht nur oben: wer abgelehnt wurde,
        // soll nicht suchen müssen. Derselbe Weg wie der Kassenknopf
        // (cart.attribution.jsx), mit demselben Ankunfts-Wort.
        <Form action="/cart/attribution" method="post" className="b2b-netto__normal">
          <input type="hidden" name="ad_params_seen" value={adAnkunft} />
          <button type="submit" className="btn--primary">
            <p>{TEXT.normal}</p>
          </button>
        </Form>
      ) : null}
    </div>
  );
}

/**
 * @param {{id: string, name: string, label: string, max: number, typ?: string, auto?: string, hinweis?: string}}
 */
function Feld({id, name, label, max, typ = 'text', auto, hinweis}) {
  return (
    <div className="b2b-netto__feld">
      <label className="b2b-netto__label" htmlFor={`${id}-${name}`}>
        {label}
      </label>
      <input
        id={`${id}-${name}`}
        className="b2b-netto__eingabe"
        type={typ}
        name={name}
        autoComplete={auto}
        inputMode={typ === 'email' ? 'email' : undefined}
        placeholder={hinweis}
        required
        maxLength={max}
      />
    </div>
  );
}
