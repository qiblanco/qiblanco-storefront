import {useEffect, useState} from 'react';

/*
 * Rote Countdown-Leiste ganz oben auf jeder BF-Deal-Seite DE (Elina EL-20261111-cfcd9c5d, gesetzt mit
 * EL-20261111-a9af196f „roter Countdown oben“). Baustein bf-countdown.js/-css aus
 * claude-jobs/el83-e-bf-verkaufsseiten-vorschau, als React-Komponente: dieselben Zeiten, Texte und Klassen.
 *   jetzt < PRESALE_ENDE -> „Pre-Sale endet in TT:HH:MM:SS“ (bis Black-Friday-Start Fr 27.11. 00:00 Berlin)
 *   jetzt < SALE_ENDE    -> „Black Friday endet in TT:HH:MM:SS“ (bis 30.11. 23:59 Berlin, wie bf-deals UHR.ende)
 *   danach               -> keine Leiste
 * Server-HTML: der Satz mit Datum, ohne Uhr (kein Hydration-Unterschied); die Uhr rechnet erst im Browser.
 * Testzeit wie auf bf-deals: ?pab_jetzt=<ISO>. Kein Scroll-Zuhörer, nur ein 1-s-Takt. Stil in bf-deal-dunkel.css.
 */
const PRESALE_ENDE = '2026-11-26T23:00:00Z';
const SALE_ENDE = '2026-11-30T22:59:00Z';
const TEXT_PRESALE = 'Pre-Sale endet in';
const TEXT_SALE = 'Black Friday endet in';
const OHNE_UHR = 'Pre-Sale endet am 27.11.2026 um 00:00 Uhr';

function zwei(n) {
  return n < 10 ? '0' + n : String(n);
}

export function BfCountdownLeiste() {
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

  if (jetzt !== null && jetzt >= Date.parse(SALE_ENDE)) return null;
  const sale = jetzt !== null && jetzt >= Date.parse(PRESALE_ENDE);
  let text = OHNE_UHR;
  let zeit = '';
  if (jetzt !== null) {
    text = sale ? TEXT_SALE : TEXT_PRESALE;
    const r = Math.max(0, Math.floor((Date.parse(sale ? SALE_ENDE : PRESALE_ENDE) - jetzt) / 1000));
    zeit = `${zwei(Math.floor(r / 86400))}:${zwei(Math.floor((r % 86400) / 3600))}:${zwei(
      Math.floor((r % 3600) / 60),
    )}:${zwei(r % 60)}`;
  }
  return (
    <div
      className="bfc"
      data-bfc=""
      data-bfc-phase={jetzt === null ? undefined : sale ? 'sale' : 'presale'}
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
