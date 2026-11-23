import {useEffect, useId, useRef, useState} from 'react';
import {useLocation, useRouteLoaderData} from 'react-router';
import {ShopSwitch} from '~/components/ShopSwitch';
import {
  cookieZeilen,
  waehrungsListe,
  zielOhneMarkt,
} from '~/components/reusables/land-waehrung';

/**
 * WÄHRUNGS-AUSWAHL (Kopf und Fuß) und die Fuß-Zeile „Land/Sprache ·
 * Währung“ (Christian 22.11.2026, Job 20261122-prio1-shop-design-header-
 * flagge-waehrung-iphone-knoepfe-umbruch-us-glanz-bf-store). Optik:
 * app/styles/kopf-knoepfe.css (gleiche Pille wie die Flagge).
 *
 * Disclosure-Muster wie ShopSwitch: Button mit aria-expanded/aria-controls,
 * dahinter eine Liste echter Links. Ohne JS zeigen die Links ?markt=XX und
 * wirken für die eine Seite; mit JS merkt sich der Laden die Wahl (Cookie
 * qb_land, land-waehrung.js), stellt einen laufenden Warenkorb auf denselben
 * Markt um (BuyerIdentityUpdate über /cart) und lädt die Seite neu.
 */
export function WaehrungsWahl({oben = false}) {
  const root = useRouteLoaderData('root');
  const {aktiv, liste} = waehrungsListe(root?.lokalisierung, root?.marktLand);
  const [offen, setOffen] = useState(false);
  const [inArbeit, setInArbeit] = useState(false);
  const wurzelRef = useRef(null);
  const triggerRef = useRef(null);
  const panelId = useId();
  const {pathname, search} = useLocation();

  useEffect(() => {
    if (!offen) return undefined;
    function beiTaste(e) {
      if (e.key === 'Escape') {
        setOffen(false);
        triggerRef.current?.focus();
      }
    }
    function beiKlick(e) {
      if (wurzelRef.current && !wurzelRef.current.contains(e.target)) {
        setOffen(false);
      }
    }
    document.addEventListener('keydown', beiTaste);
    document.addEventListener('pointerdown', beiKlick);
    return () => {
      document.removeEventListener('keydown', beiTaste);
      document.removeEventListener('pointerdown', beiKlick);
    };
  }, [offen]);

  async function waehle(e, w) {
    e.preventDefault();
    setOffen(false);
    if (w.aktiv) return;
    setInArbeit(true);
    for (const z of cookieZeilen(w.land, window.location.protocol === 'https:')) {
      document.cookie = z;
    }
    // Laufender Warenkorb: auf denselben Markt umstellen, sonst zeigte die
    // Schublade die alte Währung. Fehler sind still: die Seite lädt trotzdem
    // im neuen Markt, die Kasse folgt ohnehin der Lieferadresse.
    if (/(?:^|;\s*)cart=/.test(document.cookie)) {
      try {
        const fd = new FormData();
        fd.append(
          'cartFormInput',
          JSON.stringify({
            action: 'BuyerIdentityUpdate',
            inputs: {buyerIdentity: {countryCode: w.land}},
          }),
        );
        await fetch('/cart.data', {method: 'POST', body: fd, credentials: 'same-origin'});
      } catch {
        // still: die Seite lädt im neuen Markt
      }
    }
    window.location.assign(zielOhneMarkt(window.location.href));
  }

  const hrefFuer = (w) => {
    const p = new URLSearchParams(search);
    p.set('markt', w.land);
    return `${pathname}?${p.toString()}`;
  };

  return (
    <div
      className={oben ? 'waehrung-wahl waehrung-wahl--oben' : 'waehrung-wahl'}
      ref={wurzelRef}
      data-qa-waehrung={aktiv}
    >
      <button
        type="button"
        ref={triggerRef}
        className="waehrung-wahl__trigger kopf-knopf kopf-knopf--pille reset"
        aria-expanded={offen}
        aria-controls={panelId}
        aria-label={`Währung wählen, aktuell ${aktiv}`}
        aria-busy={inArbeit || undefined}
        onClick={() => setOffen((v) => !v)}
      >
        <span className="waehrung-wahl__code">{aktiv}</span>
        <svg
          className="kopf-knopf__chevron"
          viewBox="0 0 24 24"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.waehrung-wahl:hover .waehrung-wahl__panel,' +
              '.waehrung-wahl:focus-within .waehrung-wahl__panel{display:block}',
          }}
        />
      </noscript>
      <ul
        id={panelId}
        className={
          offen
            ? 'waehrung-wahl__panel kopf-panel kopf-panel--offen'
            : 'waehrung-wahl__panel kopf-panel'
        }
      >
        {liste.map((w) => (
          <li key={w.code}>
            <a
              className={
                w.aktiv
                  ? 'kopf-panel__option kopf-panel__option--aktiv'
                  : 'kopf-panel__option'
              }
              href={hrefFuer(w)}
              rel="nofollow"
              {...(w.aktiv ? {'aria-current': 'true'} : {})}
              onClick={(e) => waehle(e, w)}
            >
              <span className="kopf-panel__symbol" aria-hidden="true">
                {w.symbol && w.symbol !== w.code ? w.symbol : ''}
              </span>
              <span className="kopf-panel__label">{w.code}</span>
              {w.aktiv ? (
                <svg
                  className="kopf-panel__haken"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Fuß-Zeile: Flagge (Shop/Sprache) und Währung, zentriert, auf jeder Seite.
 * Auf den geschlossenen Funnel-Seiten (BF, Qi Alpha) ist sie der ganze Fuß.
 */
export function LandWaehrungZeile({dunkel = false}) {
  return (
    <div
      className={dunkel ? 'land-waehrung-zeile land-waehrung-zeile--dunkel' : 'land-waehrung-zeile'}
      data-qa-land-waehrung=""
    >
      <span className="land-waehrung-zeile__text">Land/Sprache · Währung</span>
      <div className="land-waehrung-zeile__knoepfe">
        <ShopSwitch aktiv="de" oben />
        <WaehrungsWahl oben />
      </div>
    </div>
  );
}
