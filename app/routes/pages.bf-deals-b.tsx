// app/routes/pages.bf-deals-b.tsx
// Black-Friday-Deal-Übersicht DACH als B-Fassung (Elina EL-20261109-79b117c7, gehört zu EL-20261109-bda7a985; fünfte Kachel
// Crystal Cacao aus EL-20261109-b0f2e574). Gleicher Aufbau wie die US-B-Seite qi-blanco.com/pages/bf-deals-b: EINE
// Master-Vorlage (bfd_master.py im Auftragsordner), je Markt nur Text, Preise, Links und Bilder.
// Nicht verlinkt, noindex. Seit Elinas GO vom 11.11.2026 (EL-20261111-e0dc0a54) spiegelt /pages/bf-deals diese Seite
// (pages.bf-deals.tsx); die B-Adresse bleibt als Vorschau.
// Countdown: Black Friday Fr 27.11.2026 00:00 MEZ = 2026-11-26T23:00:00Z. Vorschau eines anderen Zeitpunkts:
// ?pab_jetzt=2026-11-28T12:00:00Z. Bewegung: Baukasten elina-design-regel (useElinaBewegung), Kopf ohne Animation.
// Kacheln (EL-20261111-72d11cd3): Titel-Link zur Deal-Seite liegt über ::after auf der ganzen Fläche (auch Bild);
// darüber Pillen und der Knopf „Jetzt kaufen“.
// Umbau Elina EL-20261111-f72ec899: (1) Rabatt-Plakette Rot #B92200 mit weißer Schrift, deutlich größer; (2) „Jetzt kaufen“
// führt auf die BF-Deal-Seite des Deals (dort geht es per Warenkorb-Link mit BF-Endpreis weiter), seit EL-20261111-cc43922e
// ausnahmslos, auch Bild und Titel (siehe dealSeite); (3) die Seite beginnt ganz oben mit dem
// großen roten Countdown (#B92200, weiß, sekundengenau) bis Black-Friday-Start 27.11. 00:00, ab dann bis Sale-Ende.
// Rückbau: diese Datei und app/styles/bf-deals-b.css löschen.
import {useEffect, useRef, useState} from 'react';
import {BF_GOLD_BILDER, bfDealSeite} from '../components/black-friday-2026/bf-deals-daten';
import {useElinaBewegung} from '../components/reusables/useElinaBewegung';
import bfDealsBStyles from '../styles/bf-deals-b.css?url';
import elinaBewegungStyles from '../styles/elina-bewegung.css?url';

// Bilder (Elina EL-20261111-a9af196f + EL-20261111-83f5cc6d): die BF-Gold-Bilder aus der EINEN Datenstelle
// bf-deals-daten.js (BF_GOLD_BILDER), dieselben wie Deal-Galerie und Deal-Seiten. Werte ohne Query; die Kachel hängt
// ?width= an. Die Kakao-Kachel zeigt das Bild des gewählten Sets.
const BILDER: Record<string, string> = BF_GOLD_BILDER;

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

// aus: Größe ausverkauft (Bestand 0) - Pille bleibt sichtbar, ist aber nicht wählbar und führt in keinen Warenkorb.
type Set = {pille: string; neu: string; alt: string; link: string; aus?: boolean; bild?: string};
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
  // Größenwahl (EL-20261111-9065b985): gleiche Pillen wie die Kakao-Sets, ein Warenkorb-Link je Größe.
  varianten?: Set[];
  start?: number;
};

// Countdown (EL-20261111-f72ec899): bis Black-Friday-Start Fr 27.11.2026 00:00 Berlin, ab dann bis Sale-Ende; danach
// verschwindet er. Sale-Ende 30.11.2026 23:59 Berlin ist vorläufig (Bestätigung Elina offen, gleicher Wert wie die rote
// Leiste der Deal-Seiten EL-20261111-cfcd9c5d, bf_countdown.py SALE_ENDE['de']) - nur UHR.ende ändern.
const UHR = {
  ziel: '2026-11-26T23:00:00Z',
  ende: '2026-11-30T22:59:00Z',
  titel: 'Black Friday für alle in',
  datum: 'Freitag, 27. November 2026 · 00:00 Uhr',
  titelSale: 'Black Friday endet in',
  datumSale: 'Montag, 30. November 2026 · 23:59 Uhr',
};
const EINHEITEN = ['Tage', 'Std', 'Min', 'Sek'];
const KACHELN: Kachel[] = [
  {
    breit: true,
    zeile: 'Bestseller · Für zwei',
    name: '2x QiOne® 2 Pro',
    rabatt: '−500 €',
    bild: '2x-qione-2-pro',
    bildAlt: 'Zwei QiOne® 2 Pro Anhänger nebeneinander',
    alt: '2.476 €',
    neu: '1.976 €',
    link: '/cart/39680087326790:2?discount=BF26-2XPRO-HDRSN',
  },
  {
    breit: false,
    zeile: 'Set · Mit Kette',
    name: 'QiOne® 2 Pro + Necklace',
    rabatt: '−250 €',
    bild: 'qione-2-pro-necklace',
    bildAlt: 'QiOne® 2 Pro Anhänger mit Kette',
    alt: '1.332 €',
    neu: '1.082 €',
    start: 1,
    varianten: [
      {pille: 'XS · 40 cm', neu: '1.082 €', alt: '1.332 €', link: '/cart/39680087326790:1,39285852176454:1?discount=BF26-PROKETTE-PMB52'},
      {pille: 'S · 45 cm', neu: '1.082 €', alt: '1.332 €', link: '/cart/39680087326790:1,31887553396806:1?discount=BF26-PROKETTE-PMB52'},
      {pille: 'M · 50 cm', neu: '1.082 €', alt: '1.332 €', link: '/cart/39680087326790:1,39285855223878:1?discount=BF26-PROKETTE-PMB52', aus: true},
      {pille: 'L · 60 cm', neu: '1.082 €', alt: '1.332 €', link: '/cart/39680087326790:1,31887553429574:1?discount=BF26-PROKETTE-PMB52'},
      {pille: 'XL · 75 cm', neu: '1.082 €', alt: '1.332 €', link: '/cart/39680087326790:1,39285858140230:1?discount=BF26-PROKETTE-PMB52', aus: true},
    ],
  },
  {
    breit: false,
    zeile: 'Am Handgelenk',
    name: 'QiBracelet®',
    rabatt: '−200 €',
    bild: 'qibracelet',
    bildAlt: 'QiBracelet® Armreif',
    alt: '1.578 €',
    neu: '1.378 €',
    start: 1,
    varianten: [
      {pille: 'S', neu: '1.378 €', alt: '1.578 €', link: '/cart/43666904056076:1?discount=BF26-BRACELET-GM5JJ'},
      {pille: 'M', neu: '1.378 €', alt: '1.578 €', link: '/cart/43666904088844:1?discount=BF26-BRACELET-GM5JJ'},
      {pille: 'L', neu: '1.378 €', alt: '1.578 €', link: '/cart/43673322160396:1?discount=BF26-BRACELET-GM5JJ'},
    ],
  },
  {
    breit: true,
    zeile: 'Für dein Zuhause',
    name: 'QiHome® Air',
    rabatt: '−400 €',
    bild: 'qihome-air',
    bildAlt: 'QiHome® Air',
    alt: '4.983 €',
    neu: '4.583 €',
    link: '/cart/32238705967174:1?discount=BF26-QIHOME-2DP8H',
  },
  {
    breit: true,
    zeile: 'Kauf 2, zahl 1 · Bio-Kakao',
    name: 'Crystal Cacao · Awake & Create',
    rabatt: '−76 €',
    bild: 'kakao-awake-create',
    bildAlt: 'Crystal Cacao Awake und Create, zwei Kakao-Packungen im Set',
    sets: [
      {
        pille: '1x Create + 1x Awake',
        bild: 'kakao-awake-create',
        neu: '76 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/cart/54540698485004:1,44685294567692:1?discount=BF26-KAKAO-NKSKX',
      },
      {
        pille: '2x Awake',
        bild: 'kakao-2x-awake',
        neu: '76 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/cart/54540698485004:2?discount=BF26-KAKAO-NKSKX',
      },
      {
        pille: '2x Create',
        bild: 'kakao-2x-create',
        neu: '76 €',
        alt: '152 €',
        link: 'https://crystal-cacao.com/cart/44685294567692:2?discount=BF26-KAKAO-NKSKX',
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
  // Phase: vor dem Start zählt die Uhr bis UHR.ziel, ab dem Start bis UHR.ende; nach dem Ende kein Countdown mehr.
  const sale = jetzt !== null && jetzt >= Date.parse(UHR.ziel);
  if (jetzt !== null && jetzt >= Date.parse(UHR.ende)) return null;
  const rest =
    jetzt === null
      ? null
      : Math.floor((Date.parse(sale ? UHR.ende : UHR.ziel) - jetzt) / 1000);
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
    <div className="bfd__uhr" role="timer" aria-live="off">
      <div className="bfd__uhr-innen">
        <p className="bfd__uhrtitel">{sale ? UHR.titelSale : UHR.titel}</p>
        <div className="bfd__zellen">
          {EINHEITEN.map((e, i) => (
            <div className="bfd__zelle" key={e}>
              <span className="bfd__zahl">{teile[i]}</span>
              <span className="bfd__einheit">{e}</span>
            </div>
          ))}
        </div>
        <p className="bfd__datum">{sale ? UHR.datumSale : UHR.datum}</p>
      </div>
    </div>
  );
}

function Bild({k, bild}: {k: Kachel; bild?: string}) {
  const u = BILDER[bild ?? k.bild];
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
              : `${u}?width=500 500w, ${u}?width=900 900w, ${u}?width=1200 1200w`
          }
          sizes={
            lokal
              ? undefined
              : k.breit
                ? '(min-width: 960px) 36rem, (min-width: 600px) 46vw, 92vw'
                : '(min-width: 960px) 34rem, (min-width: 600px) 46vw, 92vw'
          }
          width={1200}
          height={1200}
          alt={k.bildAlt}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <span className="bfd__plakette">{k.rabatt}</span>
    </figure>
  );
}

// Kaufknopf (Elina EL-20261111-72d11cd3, Dauerregel): Text statt Pfeil-Kreis, Kit-Gold #F2BF72 mit dunkler Schrift,
// volle Breite der Textspalte. Ziel (EL-20261111-f72ec899): die BF-Deal-Seite des Deals; dort führt „In den Warenkorb“
// per Warenkorb-Link mit BF-Endpreis weiter. In den MAILS bleibt „Jetzt kaufen“ direkt zur Kasse.
const KAUFEN = 'Jetzt kaufen';
// Link-Regel (Elina EL-20261111-cc43922e, ersetzt für SEITEN EL-20261111-72d11cd3): Bild, Titel UND „Jetzt kaufen“ führen
// IMMER auf die BF-Deal-Seite des Deals, nie auf die Originalseite, nie direkt zur Kasse. Erst auf der Deal-Seite führt
// „In den Warenkorb“ per Warenkorb-Link zur Kasse. In den MAILS bleibt „Jetzt kaufen“ der Warenkorb-Link.
// Ziele DE: 2x QiOne 2 Pro -> 8kendiw34hd, QiOne 2 Pro + Necklace -> pjdz538hgs0, QiBracelet -> 687ghgf4ed,
// QiHome Air -> 56huz67dds, Kakao -> die Deal-Seite des gewählten Sets. Die Deal-Seiten rendert die Storefront selbst
// (BF_DEAL_SEITEN in bf-deals-daten.js), darum gibt es keine Shopify-Abfrage mehr: die frühere Prüfung „ist das
// Produkt veröffentlicht“ war für die Entwurfs-Bundles immer falsch und ließ die Kacheln auf Originalseite und Kasse.
// 2x QiOne / Necklace: Elinas Ziele 8kendiw34hd / pjdz538hgs0, sobald deren Deal-Fassung in BF_DEAL_SEITEN steht
// (Folgeauftrag zu EL-20261111-aff06215); bis dahin die gleichwertigen Deal-Adressen jhsdhze783 / 734husd8hh, die dieselbe
// Deal-Fassung rendern. Die Umschaltung geschieht mit dem Eintrag in bf-deals-daten.js von selbst, ohne Änderung hier.
const DEAL_HANDLE: Record<string, string[]> = {
  '2x QiOne® 2 Pro': ['8kendiw34hd', 'jhsdhze783'],
  'QiOne® 2 Pro + Necklace': ['pjdz538hgs0', '734husd8hh'],
  'QiBracelet®': ['687ghgf4ed'],
  'QiHome® Air': ['56huz67dds'],
  '1x Create + 1x Awake': ['awcr37shyj'],
  '2x Awake': ['aw783hfn'],
  '2x Create': ['37cr378n'],
};
// el-Kennung wie „Zum Deal“ in den Serien-Mails (mm_bf_serie.deal_seite: /products/<handle>?el=BF2025).
const DEAL_EL = 'BF2025';

function dealSeite(schluessel: string): string | null {
  // bfDealSeite: nur Handles, die die Storefront als Deal-Seite ausliefert, und nur bis Deal-Ende (30.11. 23:59 Berlin).
  const h = (DEAL_HANDLE[schluessel] ?? []).find((x) => bfDealSeite(x));
  return h ? `/products/${h}?el=${DEAL_EL}` : null;
}

// Der Spiegel pages.bf-deals.tsx reicht den loader durch; die Kachel-Ziele brauchen keine Daten mehr.
export async function loader() {
  return {};
}

// Rückfall NUR nach dem Deal-Ende: die normale Produktseite (Kakao: die Set-Seite auf crystal-cacao.com). Nie die Kasse.
const SEITE: Record<string, string> = {
  '2x QiOne® 2 Pro': '/products/qione-2-pro',
  'QiOne® 2 Pro + Necklace': '/products/qione-2-pro',
  'QiBracelet®': '/products/qibracelet',
  'QiHome® Air': '/products/qihome-air',
};
const SET_SEITE: Record<string, string> = {
  '1x Create + 1x Awake':
    'https://crystal-cacao.com/products/bundle-1x-awake-1x-create',
  '2x Awake': 'https://crystal-cacao.com/products/bundle-2x-awake',
  '2x Create': 'https://crystal-cacao.com/products/mengenrabatt-2x',
};

function Kaufen({href, name}: {href: string; name: string}) {
  return (
    <a className="bfd__kaufen" href={href} aria-label={`${KAUFEN}: ${name}`}>
      {KAUFEN}
    </a>
  );
}

function SetKachel({k}: {k: Kachel}) {
  const sets = (k.sets || k.varianten) as Set[];
  const [wahl, setWahl] = useState(k.start ?? 0);
  const s = sets[wahl];
  const ziel =
    dealSeite(s.pille) ||
    dealSeite(k.name) ||
    SET_SEITE[s.pille] ||
    SEITE[k.name] ||
    '/';
  const klasse = k.sets
    ? 'bfd--breit bfd--wahl'
    : `${k.breit ? 'bfd--breit' : 'bfd--klein'} bfd--groesse`;
  return (
    <li className={klasse}>
      <div className="bfd__kachel" data-eb="">
        <Bild k={k} bild={s.bild} />
        <div className="bfd__text">
          <p className="bfd__zeile">{k.zeile}</p>
          <h2 className="bfd__name">
            <a
              className="bfd__link"
              href={ziel}
            >
              {k.name}
            </a>
          </h2>
          <div className="bfd__pillen" role="group" aria-label={k.sets ? 'Set wählen' : 'Größe wählen'}>
            {sets.map((x, i) => (
              <button
                type="button"
                className="bfd__pille"
                aria-pressed={i === wahl}
                key={x.link}
                disabled={x.aus}
                aria-label={x.aus ? `${x.pille}, ausverkauft` : undefined}
                title={x.aus ? 'ausverkauft' : undefined}
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
          <Kaufen href={ziel} name={k.name} />
        </div>
      </div>
    </li>
  );
}

function LinkKachel({k}: {k: Kachel}) {
  const ziel = dealSeite(k.name) || SEITE[k.name] || '/';
  return (
    <li className={k.breit ? 'bfd--breit' : 'bfd--klein'}>
      <div className="bfd__kachel" data-eb="">
        <Bild k={k} />
        <div className="bfd__text">
          <p className="bfd__zeile">{k.zeile}</p>
          <h2 className="bfd__name">
            <a
              className="bfd__link"
              href={ziel}
            >
              {k.name}
            </a>
          </h2>
          <p className="bfd__preis">
            <s className="bfd__alt">{k.alt}</s>
            <span className="bfd__neu">{k.neu}</span>
          </p>
          <Kaufen href={ziel} name={k.name} />
        </div>
      </div>
    </li>
  );
}

export default function BfDealsB() {
  const wurzel = useRef<HTMLDivElement>(null);
  useElinaBewegung(wurzel);
  const jetzt = useJetzt();
  return (
    <div className="bfd" id="bfd" lang="de" ref={wurzel}>
      <Countdown jetzt={jetzt} />
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
        </header>
        <ul className="bfd__liste" aria-label="Black-Friday-Angebote">
          {KACHELN.map((k) =>
            k.sets || k.varianten ? (
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
