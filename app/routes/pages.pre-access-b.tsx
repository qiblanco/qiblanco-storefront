// app/routes/pages.pre-access-b.tsx
// B-Fassung der Eintragungsseite Black Friday Pre-Sale DACH (Elina 09.11.2026: EL-20261109-3f406304 Entwurf, d4b574b1 Termine,
// 7b510b53 Sparbetrag, 5ecead8d + 8ae83097 Korrekturen; gebaut EL-20261109-bda7a985). Gleiche Gestaltung wie die US-B-Seite
// qi-blanco.com/pages/pre-access-b. Nicht verlinkt, noindex. /pages/pre-access bleibt unveraendert die echte Pre-Access-Adresse,
// bis Elina GO gibt.
// Formular: Mail-Manager-Formular 27 UNVERAENDERT (KONFIG wie /pages/pre-access: Liste, Tags, Einwilligung, Erfolgsseite), der
// Browser sendet direkt an den Endpunkt wie dort. Countdowns: Pre-Access Fr 13.11.2026 00:00 MEZ = 2026-11-12T23:00:00Z,
// Black Friday Fr 27.11.2026 00:00 MEZ = 2026-11-26T23:00:00Z. Vorschau eines anderen Zeitpunkts: ?pab_jetzt=2026-11-14T12:00:00Z
// Bewegung: Baukasten elina-design-regel (useElinaBewegung), erster Bildschirm ohne Animation.
// Rueckbau: diese Datei und app/styles/pre-access-b.css loeschen.
import {useEffect, useRef, useState} from 'react';
import {MailManagerFormular} from '../components/MailManagerFormular';
import {KONFIG} from '../components/formulare/PreAccessBlackFridayDENachbauF27PreAccesFormular';
import {useElinaBewegung} from '../components/reusables/useElinaBewegung';
import preAccessBStyles from '../styles/pre-access-b.css?url';
import elinaBewegungStyles from '../styles/elina-bewegung.css?url';

const ENDPUNKT = 'https://anmelden.dienst.qiblanco.com';
const BILD =
  'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/productohoto_48a1ddae-fff5-4e7f-bc61-385f08a6ad26.png';

export function links() {
  return [
    {rel: 'stylesheet', href: elinaBewegungStyles},
    {rel: 'stylesheet', href: preAccessBStyles},
  ];
}

export const meta = () => [
  {title: 'Black Friday Pre-Sale | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

type Uhr = {
  ziel: string;
  titel: string;
  offen: string;
  datum: string;
  haupt?: boolean;
};

const UHREN: Uhr[] = [
  {
    ziel: '2026-11-12T23:00:00Z',
    titel: 'Pre-Access startet in',
    offen: 'Pre-Access läuft',
    datum: 'Freitag, 13. November 2026 · 00:00 Uhr',
    haupt: true,
  },
  {
    ziel: '2026-11-26T23:00:00Z',
    titel: 'Black Friday für alle',
    offen: 'Black Friday läuft',
    datum: 'Freitag, 27. November 2026 · 00:00 Uhr',
  },
];

const EINHEITEN = ['Tage', 'Stunden', 'Min', 'Sek'];

const VERTRAUEN = [
  'Versicherter Gratisversand',
  '20 Tage risikofrei',
  'Made in Germany',
  '4,8/5 ★ 14.000+ Anwender',
];

function zwei(n: number) {
  return n < 10 ? '0' + n : String(n);
}

// Server-HTML zeigt 00; erst nach dem Laden rechnet der Browser (kein Hydration-Unterschied).
function useJetzt() {
  const [jetzt, setJetzt] = useState<number | null>(null);
  useEffect(() => {
    let versatz = 0;
    try {
      const q = new URLSearchParams(window.location.search).get('pab_jetzt');
      if (q && Number.isFinite(Date.parse(q)))
        versatz = Date.parse(q) - Date.now();
    } catch {
      /* ohne Vorschau-Zeit gilt die Uhr */
    }
    const tick = () => setJetzt(Date.now() + versatz);
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return jetzt;
}

function Countdown({uhr, jetzt}: {uhr: Uhr; jetzt: number | null}) {
  const rest =
    jetzt === null ? null : Math.floor((Date.parse(uhr.ziel) - jetzt) / 1000);
  const offen = rest !== null && rest <= 0;
  const r = rest !== null && rest > 0 ? rest : 0;
  const teile = [
    String(Math.floor(r / 86400)),
    zwei(Math.floor((r % 86400) / 3600)),
    zwei(Math.floor((r % 3600) / 60)),
    zwei(r % 60),
  ];
  if (rest === null) teile.splice(0, 4, '00', '00', '00', '00');
  // data-eb sitzt auf der Huelle: der Wechsel auf ist-offen schreibt className neu und darf eb-da nicht loeschen.
  return (
    <div data-eb="">
      <div
        className={
          'pab__uhr ' +
          (uhr.haupt ? 'pab__uhr--haupt' : 'pab__uhr--klein') +
          (offen ? ' ist-offen' : '')
        }
        role="timer"
        aria-live="off"
      >
        <p className="pab__uhrtitel">{uhr.titel}</p>
        <div className="pab__zellen">
          {EINHEITEN.map((e, i) => (
            <div className="pab__zelle" key={e}>
              <span className="pab__zahl">{teile[i]}</span>
              <span className="pab__einheit">{e}</span>
            </div>
          ))}
        </div>
        <p className="pab__offen">{uhr.offen}</p>
        <p className="pab__datum">{uhr.datum}</p>
      </div>
    </div>
  );
}

export default function PreAccessB() {
  const wurzel = useRef<HTMLDivElement>(null);
  useElinaBewegung(wurzel);
  const jetzt = useJetzt();
  return (
    <div className="pab" id="pab" ref={wurzel}>
      <div className="pab__innen" data-section="pre-access-b">
        <figure className="pab__bild" data-eb="zoom">
          <img
            src={`${BILD}?width=1100`}
            srcSet={`${BILD}?width=600 600w, ${BILD}?width=1100 1100w, ${BILD}?width=1600 1600w`}
            sizes="(min-width: 960px) 48vw, 100vw"
            width={1100}
            height={1100}
            alt="Frau trägt den QiOne® 2 Pro Anhänger an einer Kette"
            fetchPriority="high"
          />
          <figcaption className="pab__bildzeile">
            Black Friday 2026 · bis zu 500 € sparen
          </figcaption>
        </figure>
        <div className="pab__text">
          <p className="pab__dach" data-eb="">
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="3" y="7" width="10" height="7.5" rx="1.6" />
              <path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" />
            </svg>
            Black Friday Pre-Sale · Nur für Mitglieder
          </p>
          <h1 className="pab__titel" data-eb="">
            <span className="pab__titel-oben">Exklusiver Zugang zu den</span>{' '}
            <span className="pab__titel-unten">Black-Friday-Deals</span>{' '}
            <span className="pab__spar">
              <span className="pab__spar-vor">Spare bis zu</span>
              <span className="pab__spar-betrag">500&nbsp;€</span>
            </span>
          </h1>
          <p className="pab__cta" data-eb="">
            Trag dich in wenigen Sekunden ein und du landest direkt bei den
            Deals.
          </p>
          {UHREN.map((u) => (
            <Countdown key={u.ziel} uhr={u} jetzt={jetzt} />
          ))}
          <div data-eb="">
            <MailManagerFormular konfig={KONFIG} direkt={ENDPUNKT} />
          </div>
          <ul className="pab__vertrauen" data-eb="gruppe">
            {VERTRAUEN.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
