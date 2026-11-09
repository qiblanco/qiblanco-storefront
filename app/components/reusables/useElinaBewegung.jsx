/* useElinaBewegung: Hydrogen-/React-Anschluss für elina-bewegung.js (Elinas Design-Dauerregel, EL-20261108-5bf00bf2).
 *
 *   import {useRef} from 'react';
 *   import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
 *   import '~/styles/elina-bewegung.css';
 *
 *   export function NeueSection() {
 *     const wurzel = useRef(null);
 *     useElinaBewegung(wurzel);
 *     return (
 *       <section ref={wurzel}>
 *         <h2 data-eb>Überschrift</h2>
 *         <div data-eb="gruppe">{karten}</div>
 *         <figure data-eb="zoom"><img src={bild} alt="" /></figure>
 *         <div data-eb="linie" />
 *       </section>
 *     );
 *   }
 *
 * Läuft nur im Browser (useEffect). Server-HTML zeigt alles; versteckt wird erst nach dem Mount.
 */
import {useEffect} from 'react';

/* NICHT als Seiteneffekt-Import (`import './elina-bewegung.js'`): package.json sagt
 * "sideEffects": false, dann wirft der Produktions-Build den Import still weg. Gemessen
 * am 09.11.2026 auf qiblanco.com/pages/video-galerie-vorschau: window.ElinaBewegung
 * undefined, kein Einblenden; im Dev-Server lief es. Ein dynamischer Import ist ein
 * eigener Einstieg und bleibt im Build. */
let laden = null;
function bewegung() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (window.ElinaBewegung) return Promise.resolve(window.ElinaBewegung);
  if (!laden) {
    laden = import('./elina-bewegung.js').then(
      () => window.ElinaBewegung || null,
      () => null,
    );
  }
  return laden;
}

export function useElinaBewegung(wurzelRef, bezug = []) {
  useEffect(() => {
    let aus = false;
    let stop = null;
    bewegung().then((B) => {
      if (aus || !B || !wurzelRef.current) return;
      stop = B.starte(wurzelRef.current);
    });
    return () => {
      aus = true;
      if (typeof stop === 'function') stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, bezug);
}
