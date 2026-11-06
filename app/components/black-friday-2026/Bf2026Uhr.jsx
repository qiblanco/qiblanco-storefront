import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {
  bf2026Phase,
  bf2026Restzeit,
  bf2026Zeitpunkt,
  bf2026Ziel,
} from '~/data/black-friday-2026';
import {BF2026_UHR} from './bf2026-texte';

/*
 * UHR DER BLACK-FRIDAY-SEITEN (s04). Der Server rendert aus der Zeit des Loaders,
 * der Browser übernimmt nach dem Laden (kein Hydrationsfehler, kein Layout-
 * Sprung, weil alle Felder feste Breiten und tabular-nums tragen). Zeit immer aus
 * UTC-Zeitpunkten, Anzeige in Europe/Berlin. Kein Rot, kein Blinken.
 *
 * Springt die Uhr über eine Grenze, wechselt die ganze Seite die Phase, ohne
 * Neuladen: Preis, Knöpfe und Texte hängen an useBf2026Phase().
 */
const ZeitKontext = createContext(null);

export function Bf2026Zeit({jetztMs, gepinnt = null, children}) {
  const [phase, setPhase] = useState(() => bf2026Phase(jetztMs));
  // Verstellte Vorschau-Uhr: sie läuft ab dem Pin weiter wie die echte.
  const [versatz] = useState(() => (gepinnt ? jetztMs - Date.now() : 0));
  useEffect(() => {
    const stelle = () => setPhase(bf2026Phase(Date.now() + versatz));
    stelle();
    const uhr = setInterval(stelle, 1000);
    return () => clearInterval(uhr);
  }, [versatz]);
  const wert = useMemo(() => ({phase, jetztMs, versatz, gepinnt}), [phase, jetztMs, versatz, gepinnt]);
  return <ZeitKontext.Provider value={wert}>{children}</ZeitKontext.Provider>;
}

export function useBf2026Zeit() {
  return useContext(ZeitKontext);
}

const FELDER = [
  ['tage', 'Tage'],
  ['stunden', 'Stunden'],
  ['minuten', 'Minuten'],
  ['sekunden', 'Sekunden'],
];

const zweistellig = (n) => String(n).padStart(2, '0');

export function Bf2026Countdown({kompakt = false}) {
  const {phase, jetztMs, versatz} = useBf2026Zeit();
  const [ms, setMs] = useState(jetztMs);
  useEffect(() => {
    const stelle = () => setMs(Date.now() + versatz);
    stelle();
    const uhr = setInterval(stelle, 1000);
    return () => clearInterval(uhr);
  }, [versatz]);
  const ziel = bf2026Ziel(phase);
  const klasse = `bf-uhr${kompakt ? ' bf-uhr--kompakt' : ''}`;
  if (!ziel) {
    return (
      <div className={klasse} data-bf-countdown="" data-bf-phase={phase}>
        <p className="bf-uhr-titel">{BF2026_UHR.vorbei}</p>
      </div>
    );
  }
  const rest = bf2026Restzeit(ziel, ms);
  return (
    <div
      className={klasse}
      data-bf-countdown=""
      data-bf-ziel={ziel}
      data-bf-phase={phase}
      role="timer"
      aria-label={`${BF2026_UHR[phase]} ${rest.tage} Tagen, ${rest.stunden} Stunden, ${rest.minuten} Minuten`}
    >
      <p className="bf-uhr-titel">{BF2026_UHR[phase]}</p>
      <dl className="bf-uhr-felder">
        {FELDER.map(([schluessel, name]) => (
          <div key={schluessel} className="bf-uhr-feld">
            <dt className="bf-uhr-name">{name}</dt>
            <dd className="bf-uhr-zahl">{zweistellig(rest[schluessel])}</dd>
          </div>
        ))}
      </dl>
      <p className="bf-uhr-text">{bf2026Zeitpunkt(ziel)}</p>
    </div>
  );
}
