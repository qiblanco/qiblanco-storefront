import {useEffect, useRef, useState} from 'react';
import {useLocation} from 'react-router';
import {SHOP_LABEL, switchTarget} from '~/lib/shop-switch';

/**
 * Shop-Umschalter (DACH -> USA und zurück).
 *
 * Warum die Ziele schon im gerenderten HTML stehen: die Optionen sind echte
 * <a href> aus switchTarget(). Der Umschalter funktioniert damit ohne JS und
 * ist crawlbar; JS trägt hier nur das Auf-/Zuklappen, nicht das Ziel.
 *
 * Warum Inline-SVG statt Icon-CDN: die Optik muss in BEIDEN Shops identisch
 * sein. Das ist über zwei Plattformen (Hydrogen/Liquid) nur garantiert, wenn
 * beide dasselbe Markup rendern — ein CDN-Icon lädt asynchron (Flackern) und
 * hängt einen Drittanbieter in den Header-Kritischpfad.
 *
 * Die Zuordnung selbst wird NICHT hier gepflegt: app/lib/shop-switch.js ist
 * generiert aus homepage-bauer/shop-switch/shop-mapping.yaml.
 */

const SHOPS = ['de', 'us'];

/** Deutschland: schwarz/rot/gold, 3 waagerechte Streifen (20x14). */
function FlaggeDe() {
  return (
    <svg
      className="shop-switch__flag"
      viewBox="0 0 20 14"
      width="20"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="14" fill="#000000" />
      <rect y="4.6667" width="20" height="4.6667" fill="#DD0000" />
      <rect y="9.3333" width="20" height="4.6667" fill="#FFCE00" />
    </svg>
  );
}

/** USA: 13 Streifen + blaues Feld (vereinfachtes Sternenfeld, 20x14). */
function FlaggeUs() {
  const streifen = [];
  for (let i = 0; i < 13; i++) {
    streifen.push(
      <rect
        key={i}
        y={(i * 14) / 13}
        width="20"
        height={14 / 13}
        fill={i % 2 === 0 ? '#B22234' : '#FFFFFF'}
      />,
    );
  }
  return (
    <svg
      className="shop-switch__flag"
      viewBox="0 0 20 14"
      width="20"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="20" height="14" fill="#FFFFFF" />
      {streifen}
      <rect width="9" height="7.5385" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        <circle cx="1.8" cy="1.5" r="0.55" />
        <circle cx="4.5" cy="1.5" r="0.55" />
        <circle cx="7.2" cy="1.5" r="0.55" />
        <circle cx="3.15" cy="3.15" r="0.55" />
        <circle cx="5.85" cy="3.15" r="0.55" />
        <circle cx="1.8" cy="4.8" r="0.55" />
        <circle cx="4.5" cy="4.8" r="0.55" />
        <circle cx="7.2" cy="4.8" r="0.55" />
        <circle cx="3.15" cy="6.4" r="0.55" />
        <circle cx="5.85" cy="6.4" r="0.55" />
      </g>
    </svg>
  );
}

function Flagge({shop}) {
  return shop === 'us' ? <FlaggeUs /> : <FlaggeDe />;
}

/**
 * @param {{aktiv?: 'de'|'us'}} props
 */
export function ShopSwitch({aktiv = 'de'}) {
  const [offen, setOffen] = useState(false);
  const wurzelRef = useRef(null);
  const location = useLocation();
  const pfad = location?.pathname || '/';

  // Schließen per Esc und Klick nach außen. Beides nur solange offen —
  // ein dauerhaft hängender document-Listener im Header ist unnötige Last.
  useEffect(() => {
    if (!offen) return undefined;

    function beiTaste(e) {
      if (e.key === 'Escape') setOffen(false);
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

  return (
    <div className="shop-switch" ref={wurzelRef}>
      <button
        type="button"
        className="shop-switch__trigger reset"
        aria-expanded={offen}
        aria-haspopup="listbox"
        aria-label={`Shop wechseln — aktuell ${SHOP_LABEL[aktiv]}`}
        onClick={() => setOffen((v) => !v)}
      >
        <Flagge shop={aktiv} />
        <svg
          className="shop-switch__chevron"
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Ohne JS klappt kein Zustand um — dann uebernimmt CSS und zeigt die
          Liste bei Hover/Fokus. Die Ziele stehen ohnehin schon als echte
          href im HTML; das hier macht sie auch bedienbar statt nur lesbar.
          Als <noscript> gekapselt, damit es den JS-Pfad nicht stoert. */}
      <noscript>
        <style
          dangerouslySetInnerHTML={{
            __html:
              '.shop-switch:hover .shop-switch__panel,' +
              '.shop-switch:focus-within .shop-switch__panel{display:block}',
          }}
        />
      </noscript>

      <ul
        className={
          offen
            ? 'shop-switch__panel shop-switch__panel--offen'
            : 'shop-switch__panel'
        }
        role="listbox"
        aria-label="Shop"
      >
        {SHOPS.map((shop) => {
          const istAktiv = shop === aktiv;
          return (
            <li key={shop} role="none">
              <a
                className={
                  istAktiv
                    ? 'shop-switch__option shop-switch__option--aktiv'
                    : 'shop-switch__option'
                }
                role="option"
                aria-selected={istAktiv}
                {...(istAktiv ? {'aria-current': 'true'} : {})}
                /* Die aktive Option zeigt auf die Seite, auf der man steht —
                   nicht auf die Startseite. switchTarget wäre hier falsch:
                   seine Rückwärts-Karte erwartet einen Pfad des ANDEREN
                   Shops und fände für den eigenen nichts, also die Front. */
                href={istAktiv ? pfad : switchTarget(pfad, shop)}
                onClick={() => setOffen(false)}
              >
                <Flagge shop={shop} />
                <span className="shop-switch__label">{SHOP_LABEL[shop]}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
