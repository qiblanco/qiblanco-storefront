// app/routes/pages.bf-deals-b.tsx
// Black-Friday-Deal-Übersicht DACH als B-Fassung (Elina EL-20261109-79b117c7, gehört zu EL-20261109-bda7a985; fünfte Kachel
// Crystal Cacao aus EL-20261109-b0f2e574). Gleicher Aufbau wie die US-B-Seite qi-blanco.com/pages/bf-deals-b: EINE
// Master-Vorlage (bfd_master.py im Auftragsordner), je Markt nur Text, Preise, Links und Bilder.
// Nicht verlinkt, noindex. /pages/bf-deals bleibt unverändert, bis Elina GO gibt.
// Countdown: Black Friday Fr 27.11.2026 00:00 MEZ = 2026-11-26T23:00:00Z. Vorschau eines anderen Zeitpunkts:
// ?pab_jetzt=2026-11-28T12:00:00Z. Bewegung: Baukasten elina-design-regel (useElinaBewegung), Kopf ohne Animation.
// Die ganze Kachel ist der Link; bei der Set-Kachel liegt der Link über ::after auf der ganzen Fläche, die Pillen darüber.
// Rückbau: diese Datei und app/styles/bf-deals-b.css löschen.
import {useEffect, useRef, useState} from 'react';
import {useElinaBewegung} from '../components/reusables/useElinaBewegung';
import bfDealsBStyles from '../styles/bf-deals-b.css?url';
import elinaBewegungStyles from '../styles/elina-bewegung.css?url';

// Bilder: Shopify-Dateien DACH (Medien aufs CDN, nicht ins Repo). Die zwei neuen Bundle-Bilder und das Kakao-Set-Bild
// (EL-20261109-79b117c7 bzw. b0f2e574) liegen seit 10.11.2026 in den DACH-Dateien (cdn-upload, werk/bild-urls.json).
// Werte ohne Query; die Kachel hängt ?width= an.
const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
const BILDER: Record<string, string> = {
  'bundle-2x-qione-2-pro': CDN + 'bundle-2x-qione-2-pro.webp',
  'bundle-qione-2-pro-necklace': CDN + 'bundle-qione-2-pro-necklace.webp',
  QiBracelet1: CDN + 'QiBracelet1.webp',
  QiHome1: CDN + 'QiHome1.webp',
  'crystal-cacao-set-awake-create-dunkel-gold-4x3':
    CDN + 'crystal-cacao-set-awake-create-dunkel-gold-4x3.webp',
};

export function links() {
  return [
    {rel: 'stylesheet', href: elinaBewegungStyles},
    {rel: 'stylesheet', href: bfDealsBStyles},
  ];
}

export const meta = () => [
  {title: 'Black Friday Deals | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

export function headers() {
  return {'X-Robots-Tag': 'noindex, nofollow'};
}

type Set = {pille: string; neu: string; alt: string; link: string};
type Kachel = {
  breit: boolean;
  zeile: string;
  name: string;
  rabatt: string;
  bild: string;
  bildAlt: string;
  alt?: string;
  neu?: string;
  link?: string;
  sets?: Set[];
};

const UHR = {
  ziel: '2026-11-26T23:00:00Z',
  titel: 'Black Friday für alle in',
  offen: 'Black Friday läuft',
  datum: 'Freitag, 27. November 2026 · 00:00 Uhr',
};
const EINHEITEN = ['Tage', 'Std', 'Min', 'Sek'];
const KACHELN: Kachel[] = [
  {
    breit: true,
    zeile: 'Bestseller · Für zwei',
    name: '2x QiOne® 2 Pro',
    rabatt: '−500 €',
    bild: 'bundle-2x-qione-2-pro',
    bildAlt: 'Zwei QiOne® 2 Pro Anhänger nebeneinander',
    alt: '2.476 €',
    neu: '1.976 €',
    link: '/products/jhsdhze783?el=BF2026',
  },
  {
    breit: false,
    zeile: 'Set · Mit Kette',
    name: 'QiOne® 2 Pro + Necklace',
    rabatt: '−250 €',
    bild: 'bundle-qione-2-pro-necklace',
    bildAlt: 'QiOne® 2 Pro Anhänger mit Kette',
    alt: '1.332 €',
    neu: '1.082 €',
    link: '/products/734husd8hh?el=BF2026',
  },
  {
    breit: false,
    zeile: 'Am Handgelenk',
    name: 'QiBracelet®',
    rabatt: '−200 €',
    bild: 'QiBracelet1',
    bildAlt: 'QiBracelet® Armreif',
    alt: '1.578 €',
    neu: '1.378 €',
    link: '/products/687ghgf4ed?el=BF2026',
  },
  {
    breit: true,
    zeile: 'Für dein Zuhause',
    name: 'QiHome® Air',
    rabatt: '−400 €',
    bild: 'QiHome1',
    bildAlt: 'QiHome® Air',
    alt: '4.983 €',
    neu: '4.583 €',
    link: '/products/56huz67dds?el=BF2026',
  },
  {
    breit: true,
    zeile: 'Neu im Set · Bio-Kakao',
    name: 'Crystal Cacao · Awake & Create',
    rabatt: '−30 €',
    bild: 'crystal-cacao-set-awake-create-dunkel-gold-4x3',
    bildAlt: 'Crystal Cacao Awake und Create, zwei Kakao-Packungen im Set',
    sets: [
      {
        pille: '1x Create + 1x Awake',
        neu: '122 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/products/bundle-1x-awake-1x-create?el=BF2026',
      },
      {
        pille: '2x Awake',
        neu: '122 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/products/bundle-2x-awake?el=BF2026',
      },
      {
        pille: '2x Create',
        neu: '122 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/products/mengenrabatt-2x?el=BF2026',
      },
    ],
  },
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

function Countdown({jetzt}: {jetzt: number | null}) {
  const rest =
    jetzt === null ? null : Math.floor((Date.parse(UHR.ziel) - jetzt) / 1000);
  const offen = rest !== null && rest <= 0;
  const r = rest !== null && rest > 0 ? rest : 0;
  const teile =
    rest === null
      ? ['00', '00', '00', '00']
      : [
          String(Math.floor(r / 86400)),
          zwei(Math.floor((r % 86400) / 3600)),
          zwei(Math.floor((r % 3600) / 60)),
          zwei(r % 60),
        ];
  return (
    <div
      className={'bfd__uhr' + (offen ? ' ist-offen' : '')}
      role="timer"
      aria-live="off"
    >
      <p className="bfd__uhrtitel">{UHR.titel}</p>
      <div className="bfd__zellen">
        {EINHEITEN.map((e, i) => (
          <div className="bfd__zelle" key={e}>
            <span className="bfd__zahl">{teile[i]}</span>
            <span className="bfd__einheit">{e}</span>
          </div>
        ))}
      </div>
      <p className="bfd__offen">{UHR.offen}</p>
      <p className="bfd__datum">{UHR.datum}</p>
    </div>
  );
}

function Bild({k}: {k: Kachel}) {
  const u = BILDER[k.bild];
  const wahl = Boolean(k.sets);
  // Shopify-Bilder skaliert das CDN per ?width=; ein Pfad ab „/“ wäre eine feste Datei ohne Skalierung.
  const lokal = u.startsWith('/');
  return (
    <figure className="bfd__bild" data-eb="zoom">
      {u ? (
        <img
          src={lokal ? u : `${u}?width=900`}
          srcSet={
            lokal
              ? undefined
              : `${u}?width=500 500w, ${u}?width=900 900w, ${u}?width=1300 1300w`
          }
          sizes={
            lokal
              ? undefined
              : k.breit
                ? '(min-width: 960px) 36rem, (min-width: 600px) 46vw, 92vw'
                : '(min-width: 960px) 34rem, (min-width: 600px) 46vw, 92vw'
          }
          width={wahl ? 1200 : 900}
          height={900}
          alt={k.bildAlt}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <span className="bfd__plakette">{k.rabatt}</span>
    </figure>
  );
}

const Pfeil = () => (
  <span className="bfd__pfeil" aria-hidden="true">
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
    </svg>
  </span>
);

function SetKachel({k}: {k: Kachel}) {
  const sets = k.sets as Set[];
  const [wahl, setWahl] = useState(0);
  const s = sets[wahl];
  return (
    <li className="bfd--breit bfd--wahl">
      <div className="bfd__kachel" data-eb="">
        <Bild k={k} />
        <div className="bfd__text">
          <p className="bfd__zeile">{k.zeile}</p>
          <h2 className="bfd__name">
            <a className="bfd__link" href={s.link}>
              {k.name}
            </a>
          </h2>
          <div className="bfd__pillen" role="group" aria-label="Set wählen">
            {sets.map((x, i) => (
              <button
                type="button"
                className="bfd__pille"
                aria-pressed={i === wahl}
                key={x.link}
                onClick={() => setWahl(i)}
              >
                {x.pille}
              </button>
            ))}
          </div>
          <p className="bfd__preis">
            <s className="bfd__alt">{s.alt}</s>
            <span className="bfd__neu">{s.neu}</span>
          </p>
          <Pfeil />
        </div>
      </div>
    </li>
  );
}

function LinkKachel({k}: {k: Kachel}) {
  return (
    <li className={k.breit ? 'bfd--breit' : 'bfd--klein'}>
      <a
        className="bfd__kachel"
        href={k.link}
        data-eb=""
        aria-label={`${k.name} – Zum Angebot ${k.rabatt}, ${k.neu}`}
      >
        <Bild k={k} />
        <div className="bfd__text">
          <p className="bfd__zeile">{k.zeile}</p>
          <h2 className="bfd__name">{k.name}</h2>
          <p className="bfd__preis">
            <s className="bfd__alt">{k.alt}</s>
            <span className="bfd__neu">{k.neu}</span>
          </p>
          <Pfeil />
        </div>
      </a>
    </li>
  );
}

export default function BfDealsB() {
  const wurzel = useRef<HTMLDivElement>(null);
  useElinaBewegung(wurzel);
  const jetzt = useJetzt();
  return (
    <div className="bfd" id="bfd" lang="de" ref={wurzel}>
      <section className="bfd__innen" aria-label="Black Friday Deals">
        <header className="bfd__kopf">
          <div className="bfd__kopftext">
            <p className="bfd__dach">
              <span>
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
                Black Friday 2026 · Pre-Access
              </span>
            </p>
            <h1 className="bfd__titel">
              <span className="bfd__titel-oben">Deine exklusiven</span>{' '}
              <span className="bfd__titel-unten">Black Friday Deals</span>
            </h1>
            <p className="bfd__spar">
              Spare bis zu <span className="bfd__spar-betrag">500&nbsp;€</span>
            </p>
          </div>
          <Countdown jetzt={jetzt} />
        </header>
        <ul className="bfd__liste" aria-label="Black-Friday-Angebote">
          {KACHELN.map((k) =>
            k.sets ? (
              <SetKachel key={k.name} k={k} />
            ) : (
              <LinkKachel key={k.name} k={k} />
            ),
          )}
        </ul>
        <ul className="bfd__vertrauen" data-eb="gruppe">
          <li>Kostenloser versicherter Versand</li>
          <li>20 Tage risikofrei</li>
          <li>Made in Germany</li>
          <li>
            <b>4,8/5</b> 14.000+ Anwender
          </li>
        </ul>
      </section>
    </div>
  );
}
