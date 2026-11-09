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
import './elina-bewegung.js';

export function useElinaBewegung(wurzelRef, bezug = []) {
  useEffect(() => {
    const B = typeof window !== 'undefined' ? window.ElinaBewegung : null;
    if (!B || !wurzelRef.current) return undefined;
    return B.starte(wurzelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, bezug);
}
