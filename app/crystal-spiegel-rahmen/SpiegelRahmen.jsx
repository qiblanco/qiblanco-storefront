/**
 * RAHMEN DES CRYSTAL-SPIEGELS — die Reiter und die Wurzel, unter der das
 * crystal-CSS gilt.
 *
 * AUFTRAG (Christian, 16.10.2026, Übergabe #71): „auf der Qi Blanco Seite
 * führen wir unter Kristall Kakao doch wieder die 3 Reiter ein wie auf dem
 * Screenshot, sie sind dann eine 1:1 Kopie des Crystal Kakao Shops … ausser
 * eben das Drop-down, das ist dann so wie vorher.“ Der Kopf mit dem
 * Drop-down bleibt deshalb qiblancos eigener (Header.jsx ist unberührt);
 * darunter steht die Reiter-Leiste, darunter der Spiegel.
 *
 * DIE REITER SIND ABGELEITET, NICHT ABGESCHRIEBEN: Titel und Reihenfolge
 * kommen aus crystals KAKAO_MENUE (im Spiegel: lib/kakao-zone.js). Ein Reiter
 * ist jeder Menüpunkt, dessen Ziel eine Spiegel-Seite ist (pfade.js) — heute
 * „Unser Kakao“, „AWAKE“, „CREATE“; „Alle Sorten“ führt in die Kollektion und
 * ist deshalb keiner. Benennt crystal einen Reiter um, folgt er hier mit dem
 * nächsten Spiegel-Nachzug.
 *
 * DIE GESTALT IST CRYSTALS EIGENE: die Leiste trägt crystals Klassen
 * `header` / `header-menu-desktop` / `header-menu-item` und dieselbe
 * Inline-Regel für den aktiven Reiter (fett) wie crystals Header.jsx
 * (activeLinkStyle). Inline überschrieben ist nur, was im qiblanco-Laden
 * anders sein MUSS: die Leiste klebt nicht (qiblancos Kopf klebt schon) und
 * steht auch unter 64em (crystal zeigt die Reiter dort im Burger-Menü, das
 * hier qiblancos Drop-down ist).
 *
 * DIE WURZEL `#ccsp`: unter ihr gilt das gescopte crystal-CSS
 * (app/crystal-spiegel/styles/, erzeugt). `data-cc-sorte` steht bei crystal
 * auf <html>; hier steht es auf der Wurzel, damit der Farb-Akzent je Sorte
 * dieselben Regeln trifft. Das Element <ccsp-main> vertritt crystals <main>
 * (ein zweites <main> im qiblanco-<main> wäre ungültig); der Erzeuger schreibt
 * den Typ-Selektor `main` zum Typ `ccsp-main` um — ein Typ, keine Klasse,
 * damit die Spezifität dieselbe bleibt wie bei crystal.
 */
import {NavLink, useLocation} from 'react-router';
import {KAKAO_MENUE, sorteZuPfad} from '~/crystal-spiegel/lib/kakao-zone';
import {SPIEGEL_STILE, SPIEGEL_WURZEL_ID} from '~/crystal-spiegel/stile';
import {SPIEGEL_SEITEN, zuCrystal} from './pfade';

/** Stylesheets des Spiegels: crystals Wurzel-Stylesheets, gescoped. */
export function spiegelStile() {
  return SPIEGEL_STILE.map((href) => ({rel: 'stylesheet', href}));
}

/** Die Reiter: Menüpunkte von crystal-cacao.com, deren Ziel gespiegelt ist. */
export const REITER = KAKAO_MENUE.items
  .filter((item) => Object.prototype.hasOwnProperty.call(SPIEGEL_SEITEN, item.url))
  .map((item) => ({id: item.id, titel: item.title, ziel: SPIEGEL_SEITEN[item.url]}));

/** Wörtlich crystals activeLinkStyle (Header.jsx). */
function aktivStil({isActive, isPending}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'var(--cc-muted, grey)' : 'var(--cc-dunkel, black)',
  };
}

export function SpiegelReiter() {
  return (
    <div className="header ccsp-reiter" style={{position: 'relative', top: 'auto'}}>
      <nav
        className="header-menu-desktop"
        role="navigation"
        aria-label="Crystal Cacao"
        style={{display: 'flex', marginLeft: 0}}
      >
        {REITER.map((r) => (
          <NavLink
            key={r.id}
            className="header-menu-item"
            end
            prefetch="intent"
            style={aktivStil}
            to={r.ziel}
          >
            {r.titel}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function SpiegelRahmen({children}) {
  const {pathname} = useLocation();
  const sorte = sorteZuPfad(zuCrystal(pathname));
  return (
    <div id={SPIEGEL_WURZEL_ID} data-cc-sorte={sorte || undefined}>
      <SpiegelReiter />
      <ccsp-main>{children}</ccsp-main>
    </div>
  );
}
