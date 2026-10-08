import {Suspense, useEffect, useState} from 'react';
import {Await, Link, useLocation} from 'react-router';

/*
 * KASSEN-RÜCKKEHRER ABHOLEN (Job 20261007-ep-startseite-kassen-rueckkehrer-leiste,
 * Hypothese GS-090, Christian 07.10.2026).
 *
 * WER SIE SIEHT: genau die Schicht `kasse_rueckkehr` des heatmap-managers
 * (src/hm_experiment.py schicht_von): die Sitzung BEGINNT auf der Startseite und
 * der Referrer ist `checkout.*`. Gemessen 22.09.-06.10.: diese Besucher klicken zu
 * 16,9 % weiter (11/65), alle anderen zu 34,9 %.
 *
 * BEIDE ARME VON start-e1-gs081: `/` (A) und `/pages/start-b` (B). Die Weiche
 * (lib/experiment-weiche.server.js) leitet per 302 um; der Browser trägt den
 * ursprünglichen Referrer über die Umleitung, `document.referrer` auf B ist also
 * derselbe wie auf A. Die Leiste ist in beiden Armen identisch und verzerrt den
 * laufenden Test deshalb nicht.
 *
 * WARUM IM CLIENT UND NICHT IM LOADER: der Root-Loader läuft bei Client-
 * Navigation nicht neu (shouldRevalidate in root.jsx), und eine serverseitig vom
 * Referer-Header abhängige Ausgabe wäre für jeden HTML-Cache dazwischen ein
 * Leck an fremde Besucher. `document.referrer` bleibt dagegen nach Client-
 * Navigation stehen. Deshalb gilt nur der ERSTE Seitenaufruf: die Leiste merkt
 * sich ihren Einstiegspfad und verschwindet, sobald die Sitzung weitergeht.
 *
 * WAHRHEIT DES SATZES: "Dein Warenkorb ist noch da" steht nur, wenn er es ist
 * (totalQuantity > 0). Nach einem abgeschlossenen Kauf ist der Warenkorb leer
 * und die Leiste bleibt aus.
 *
 * PIN FÜR MESSWERKZEUGE: `?kasse_leiste=1` zeigt die Leiste ohne Referrer und
 * ohne Warenkorb (Design-Score, Live-Verify) - wie `?start_exp=a|b` der Weiche.
 *
 * TEXT: nur Bestand. Kopfzeile und Knopf aus dem Auftrag, die zweite Zeile ist die
 * Garantie-/Finanzierungszeile des Startseiten-Kopfs (HerobannerFeatured.jsx).
 * Kein Preis, keine Aktion, keine neue Aussage.
 */

export const STARTSEITEN_PFADE = ['/', '/pages/start-b'];
export const PIN_PARAM = 'kasse_leiste';

/** true, wenn der Referrer von einem Host `checkout.*` stammt (wie hm schicht_von). */
export function istKassenReferrer(referrer) {
  if (!referrer) return false;
  try {
    return new URL(referrer).hostname.toLowerCase().startsWith('checkout.');
  } catch {
    return false;
  }
}

/**
 * Entscheidet beim ersten Client-Render, ob diese Sitzung eine Kassen-Rückkehr ist.
 * Rückgabe: null (nein) oder {pfad, pin}.
 */
export function kassenRueckkehrEinstieg({pathname, search, referrer}) {
  if (!STARTSEITEN_PFADE.includes(pathname)) return null;
  const pin = new URLSearchParams(search || '').get(PIN_PARAM) === '1';
  if (!pin && !istKassenReferrer(referrer)) return null;
  return {pfad: pathname, pin};
}

/** @param {{cart: Promise<CartApiQueryFragment | null> | CartApiQueryFragment | null}} */
export function KassenRueckkehrLeiste({cart}) {
  const {pathname} = useLocation();
  const [einstieg, setEinstieg] = useState(null);
  const [geschlossen, setGeschlossen] = useState(false);
  const [vorbei, setVorbei] = useState(false);

  // Einmal nach der Hydration: Einstiegspfad und Referrer des ERSTEN Aufrufs.
  useEffect(() => {
    setEinstieg(
      kassenRueckkehrEinstieg({
        pathname: window.location.pathname,
        search: window.location.search,
        referrer: document.referrer,
      }),
    );
  }, []);

  // Die Sitzung ist weitergegangen: auch der Weg zurück auf die Startseite
  // zeigt die Leiste nicht wieder (document.referrer steht dann noch auf der Kasse).
  useEffect(() => {
    if (einstieg && pathname !== einstieg.pfad) setVorbei(true);
  }, [einstieg, pathname]);

  if (!einstieg || geschlossen || vorbei || pathname !== einstieg.pfad) {
    return null;
  }

  const leiste = <Leiste onSchliessen={() => setGeschlossen(true)} />;
  if (einstieg.pin) return leiste;

  return (
    <Suspense fallback={null}>
      <Await resolve={cart} errorElement={null}>
        {(warenkorb) => ((warenkorb?.totalQuantity ?? 0) > 0 ? leiste : null)}
      </Await>
    </Suspense>
  );
}

function Leiste({onSchliessen}) {
  return (
    // div statt aside: app.css gestaltet `aside` global als Schublade
    // (Warenkorb, Suche, Menü) und färbt sie um.
    <div
      className="kassen-leiste"
      role="region"
      aria-label="Dein Warenkorb"
      data-kassen-rueckkehr-leiste=""
    >
      <div className="kassen-leiste__text">
        <p className="kassen-leiste__kopf">Dein Warenkorb ist noch da.</p>
        <p className="kassen-leiste__zeile">
          <span>20 Tage nach Erhalt testen</span>
          <span aria-hidden="true">&nbsp;· </span>
          <span>0&nbsp;% Finanzierung &amp; Käuferschutz</span>
          <span aria-hidden="true">&nbsp;· </span>
          <span>100&nbsp;% Geld-zurück-Garantie</span>
        </p>
      </div>
      <Link prefetch="intent" to="/cart" className="kassen-leiste__knopf">
        Weiter zur Kasse
      </Link>
      <button
        type="button"
        className="kassen-leiste__zu"
        aria-label="Hinweis schließen"
        onClick={onSchliessen}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
