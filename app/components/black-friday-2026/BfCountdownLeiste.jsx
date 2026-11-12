import {useEffect, useState} from 'react';
import {bfPhase, bfRestSekunden} from '~/components/black-friday-2026/bf-deals-daten';

/*
 * Rote Countdown-Leiste ganz oben auf jeder BF-Deal-Seite DE (Elina EL-20261111-cfcd9c5d, gesetzt mit
 * EL-20261111-a9af196f „roter Countdown oben“). Phasen seit Elina EL-20261112-5c71f6ff aus
 * bf-deals-daten.js (BF_PHASEN) (eine Stelle für alle BF-Seiten):
 *   vor 13.11. 18:00 Berlin -> „Pre-Sale startet in TT:HH:MM:SS“ (Korrektur Elina EL-20261112-6b5fe5df)
 *   bis 26.11. 23:59 Berlin -> „Pre-Sale endet in TT:HH:MM:SS“
 *   bis 30.11. 23:59 Berlin -> „Black Friday endet in TT:HH:MM:SS“
 *   danach                  -> keine Leiste
 * Server-HTML: der Satz mit Datum, ohne Uhr; die Uhr rechnet erst im Browser.
 * Testzeit wie auf bf-deals: ?pab_jetzt=<ISO>. Kein Scroll-Zuhörer, nur ein 1-s-Takt. Stil in bf-deal-dunkel.css.
 */
function zwei(n) {
  return n < 10 ? '0' + n : String(n);
}

/**
 * Die Uhr der Leiste als Haken, damit der Schluss-Banner (BfSchlussBanner.jsx,
 * Elina EL-20261112-452cdd56) dieselben Zeiten und Texte zeigt.
 * @returns {{vorbei: boolean, sale: boolean, tickt: boolean, text: string, zeit: string, phase: string}}
 */
export function useBfUhr() {
  const [jetzt, setJetzt] = useState(null);
  useEffect(() => {
    let versatz = 0;
    try {
      const q = new URLSearchParams(window.location.search).get('pab_jetzt');
      if (q && Number.isFinite(Date.parse(q))) versatz = Date.parse(q) - Date.now();
    } catch {
      /* ohne Vorschau-Zeit gilt die Uhr */
    }
    const tick = () => setJetzt(Date.now() + versatz);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const phase = bfPhase(jetzt ?? Date.now());
  if (!phase) {
    return {vorbei: true, sale: true, tickt: true, text: '', zeit: '', phase: ''};
  }
  let text = phase.satz;
  let zeit = '';
  if (jetzt !== null) {
    text = phase.titel;
    const r = bfRestSekunden(phase, jetzt);
    zeit = `${zwei(Math.floor(r / 86400))}:${zwei(Math.floor((r % 86400) / 3600))}:${zwei(
      Math.floor((r % 3600) / 60),
    )}:${zwei(r % 60)}`;
  }
  return {vorbei: false, sale: phase.id === 'sale', tickt: jetzt !== null, text, zeit, phase: phase.id};
}

export function BfCountdownLeiste() {
  const {vorbei, tickt, text, zeit, phase} = useBfUhr();
  if (vorbei) return null;
  return (
    <div
      className="bfc"
      data-bfc=""
      data-bfc-phase={tickt ? phase : undefined}
      role="timer"
      aria-live="off"
      aria-label="Countdown Black Friday"
    >
      <p className="bfc__innen">
        <span className="bfc__text">{text}</span>
        <span className="bfc__zeit">{zeit}</span>
      </p>
    </div>
  );
}
