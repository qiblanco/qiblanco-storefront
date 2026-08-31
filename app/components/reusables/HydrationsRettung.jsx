import {useEffect} from 'react';
import {useNonce} from '@shopify/hydrogen';

/**
 * HydrationsRettung — holt eine Seite zurück, deren Client-Bundle an EINEM
 * fehlgeschlagenen Chunk hängengeblieben ist.
 *
 * ── DER GEMESSENE DEFEKT (2026-08-31, Route-Abort gegen die Live-LP) ────────
 * React Router legt sein Bootstrap in ein INLINE `<script type="module">`, das
 * die Route-Module STATISCH importiert:
 *
 *     import * as route0 from ".../assets/root-<hash>.js";
 *     import * as route1 from ".../assets/pages.schlaf-zellen-schutz-<hash>.js";
 *     window.__reactRouterManifest = { ... }
 *
 * Statische ESM-Importe sind alles-oder-nichts: schlägt EIN Modul aus diesem
 * Graphen fehl (auf /pages/schlaf-zellen-schutz sind es 35 Chunks), läuft das
 * gesamte Skript NIE — inklusive `hydrateRoot`. Die Seite bleibt als reines
 * SSR-HTML stehen: Inhalt vollständig lesbar, aber KEIN einziger React-Handler
 * im ganzen Dokument.
 *
 * GEMESSEN, desktop 1440x900, Kennzahl `karussells_bedienbar` des
 * design-meister-Kollektors (Referenz 39–41):
 *
 *   blockierter Chunk        bedienbar   reputon   google   hydriert
 *   ──────────────────────────────────────────────────────────────────
 *   (keiner)                    41         17        12      ja
 *   ReputonWidget-*.js          15          1         1      nein
 *   GoogleReviews-*.js          15          1         1      nein
 *   YoutubeTimestamp-*.js       15          1         1      nein
 *   CartMain-*.js               15          1         1      nein
 *
 * Die beiden Bewertungs-Sektionen sind also NICHT aneinander gekoppelt — jeder
 * beliebige Chunk des Graphen erzeugt exakt dasselbe Bild, auch einer, der mit
 * Bewertungen nichts zu tun hat. Die Kopplung ist der ESM-Graph, nicht der
 * Bauplan der Sektionen.
 *
 * ── WARUM RELOAD UND NICHT EIN SICHTBARER RÜCKFALL-ZUSTAND ─────────────────
 * Weil die Fläche nicht leer ist: im Ausfall stehen weiterhin 37 Reputon- und
 * 12 Google-Karten mit vollem Text im DOM (Textmenge je Sektion vorher/nachher
 * 16067/15875 bzw. 7750/7618 Zeichen — der Unterschied sind allein die erst
 * nach Hydration erscheinenden „weiterlesen"-Knöpfe). Eine Ersatzfläche würde
 * echten sozialen Beweis gegen einen Hinweistext eintauschen. Verloren ist die
 * BEDIENBARKEIT, und die holt ein Neuladen vollständig zurück.
 *
 * ── AUSLÖSER: GEMESSEN, NICHT GERATEN ─────────────────────────────────────
 * Der Fehlschlag ist am `error`-Ereignis des Bootstrap-Skripts erkennbar
 * (Capture-Phase; `window.onerror` sieht Ressourcen-Fehler NICHT). Bewusst
 * KEIN Zeit-Wächter („nach N Sekunden nicht hydriert ⇒ neu laden"): auf einer
 * langsamen Verbindung wäre das ein Neuladen mitten in einer gesunden, nur
 * langsamen Hydration — ein Schaden, den es heute nicht gibt.
 *
 * Das Skript ist klassisch (kein `type="module"`) und läuft damit schon beim
 * Parsen, also VOR dem verzögerten Bootstrap-Modul, dessen Fehler es hören
 * soll.
 *
 * ── SCHLEIFENSCHUTZ (die teuerste Fehlerrichtung) ──────────────────────────
 *  • Die Marke wird VOR dem Neuladen gesetzt ⇒ höchstens EIN zusätzlicher
 *    Seitenaufruf, nie eine Schleife. Bleibt der Chunk dauerhaft weg, landet
 *    der Besucher im heutigen Zustand — nicht schlechter als ohne diesen Bau.
 *  • Kein `sessionStorage` (Privat-Modus, blockierte Speicher) ⇒ KEIN Neuladen.
 *    Fail-closed gegen die Schleife, nicht gegen die Rettung.
 *  • Die Marke hängt am Pfad und wird nach GELUNGENER Hydration wieder
 *    entfernt, damit ein zweiter Ausfall später in derselben Sitzung erneut
 *    gerettet werden kann.
 *  • Nie in einer Vorab-Darstellung (`document.prerendering`) und nie in einem
 *    fremden Rahmen (`window.top !== window`) — dort gehört uns das Fenster
 *    nicht, und ein Neuladen wäre für niemanden sichtbar.
 *
 * ── WAS DIESE RETTUNG NICHT ABDECKT (Grenze, nicht Versehen) ──────────────
 * Sie hört einen fehlgeschlagenen FETCH eines Moduls. Ein Parse- oder
 * Laufzeitfehler INNERHALB eines geladenen Chunks kann die Hydration ebenfalls
 * verhindern und meldet sich über `window.onerror` statt hier. Dieser Fall ist
 * heute NICHT gemessen; der einzige Auslöser, der ihn mitnähme, wäre die oben
 * verworfene Zeitschranke. Bewusst nicht gebaut: ein ungemessener Auslöser auf
 * bezahltem Verkehr kann nur Schaden anrichten, den es heute nicht gibt.
 *
 * ── WARUM EIN NEULADEN HIER WIRKLICH HILFT (und nicht dieselbe Leiche holt) ─
 * Die Route setzt `Cache-Control: no-store` unkonditional (siehe headers() in
 * pages.schlaf-zellen-schutz.jsx) — es existiert also keine CDN-/Proxy-Kopie
 * des Dokuments, die dieselbe tote Chunk-Referenz zurückgäbe. Die Chunk-URLs
 * sind inhalts-gehasht und unveränderlich; ein Netz-Aussetzer wiederholt sich
 * nicht deterministisch.
 *
 * BEWUSST KEIN Reload-Marker in der URL (`?_rr=1`): der Loader dieser Route
 * entscheidet den A/B-Split V1/V2 aus dem Query und sichert ausdrücklich zu,
 * dass „der rohe Query byte-identisch mitfährt". Ein zusätzlicher Parameter
 * würde diese Invariante brechen und die Zuordnung verfälschen — teurer als
 * der Zähler, den er sauber machen soll. Der überlebende Zeuge ist die
 * `sessionStorage`-Marke: die steht nach dem Neuladen noch da.
 *
 * ── EHRLICHE NEBENWIRKUNG ─────────────────────────────────────────────────
 * Ein Neuladen erzeugt einen ZWEITEN Seitenaufruf in der Messung (qpx-Basis,
 * Meta-Pixel). Die Identitäts-Schlüssel (`_qpx_anon`, `_fbc`/`_fbp`, UTM)
 * liegen in Cookies bzw. in der URL und überleben das Neuladen unverändert —
 * es geht kein Schlüssel verloren, es entsteht eine Dopplung im Zähler. Wie oft
 * das real vorkommt, ist heute NICHT gemessen (der js_error-Kanal in
 * public/qiblanco-qpx.js hängt an `window.onerror` und sieht Ressourcen-Fehler
 * baulich nicht); die Marke `data-qb-hydr-rettung` am `<html>` ist der Haken,
 * an dem eine spätere Messung ansetzen kann.
 */

/** Speicher-Marke; am Pfad, damit eine Rettung nicht fremde Seiten sperrt. */
export const HYDRATIONS_MARKE = 'qb-hydr-rettung';

/**
 * Klassisches Skript (ES5, keine optionalen Verkettungen): es muss auch in
 * genau den Browsern laufen, in denen etwas schiefgeht.
 */
const RETTUNGS_SKRIPT = `(function () {
  var MARKE = ${JSON.stringify(HYDRATIONS_MARKE)};
  function marke() { return MARKE + ':' + location.pathname; }
  function rette(grund) {
    if (window.__qbHydratationOk) return;
    // Nie in einer Vorab-Darstellung (der Nutzer sieht die Seite noch gar nicht)
    // und nie in einem fremden Rahmen (dort gehört uns das Fenster nicht).
    if (document.prerendering) return;
    try { if (window.top !== window) return; } catch (e) { return; }
    var speicher;
    try { speicher = window.sessionStorage; } catch (e) { return; }
    if (!speicher) return;
    try {
      if (speicher.getItem(marke())) return;
      speicher.setItem(marke(), grund);
    } catch (e) { return; }
    document.documentElement.setAttribute('data-qb-hydr-rettung', grund);
    location.reload();
  }
  window.addEventListener('error', function (ereignis) {
    var ziel = ereignis && ereignis.target;
    if (!ziel || ziel.nodeType !== 1 || ziel.tagName !== 'SCRIPT') return;
    if (ziel.getAttribute('type') !== 'module') return;
    // NUR das React-Router-Bootstrap, nie ein fremdes Modul-Skript: das
    // Manifest steht ausschließlich dort.
    if (String(ziel.textContent || '').indexOf('__reactRouterManifest') === -1) return;
    rette('modulgraph');
  }, true);
})();`;

/**
 * In den Seitenkörper einhängen — vor `<Scripts />`, das root.jsx am Ende des
 * `<body>` rendert.
 */
export function HydrationsRettung() {
  const nonce = useNonce();

  useEffect(() => {
    // Läuft ausschließlich nach GELUNGENER Hydration. Damit ist dieser Effekt
    // zugleich der Beweis, den das Skript oben abfragt.
    window.__qbHydratationOk = true;
    document.documentElement.removeAttribute('data-qb-hydr-rettung');
    try {
      window.sessionStorage.removeItem(`${HYDRATIONS_MARKE}:${location.pathname}`);
    } catch {
      // Kein Speicher, keine Marke, nichts aufzuräumen.
    }
  }, []);

  return (
    <script
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{__html: RETTUNGS_SKRIPT}}
    />
  );
}
