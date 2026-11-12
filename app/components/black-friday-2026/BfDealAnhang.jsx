import {useEffect, useRef} from 'react';
import {useElinaBewegung} from '~/components/reusables/useElinaBewegung';
import {useBfDealSeite} from '~/components/black-friday-2026/DealGalerie';
import {useBfUhr} from '~/components/black-friday-2026/BfCountdownLeiste';
import {BF_DEAL_SEITEN, bfDeal, bfDealBild} from '~/components/black-friday-2026/bf-deals-daten';
import {betragText} from '~/lib/betrag-text';
import {FAQ_CACAO} from '~/crystal-spiegel/data/product-faqs';

/*
 * ÜBERZEUGUNGS-TEIL DER BF-DEAL-SEITEN (Elina EL-20261112-452cdd56, GO 12.11.2026,
 * präzisiert in EL-20261112-f4a91091, -cb3c35ca, -600b5d42).
 *
 * Unter dem, was die Deal-Seite schon zeigt, stehen die Sections der normalen
 * Produktseite des HAUPTPRODUKTS, in derselben Reihenfolge, mit denselben
 * Bausteinen und Daten (BfDealSeite.jsx setzt sie zusammen). Hier liegen die
 * Teile, die es nur auf den Deal-Seiten gibt:
 *
 *   BfSchlussBanner   große Kachel direkt vor den Fragen: Gold-Bild links,
 *                     rechts Titel, Streichpreis/BF-Preis, grüne Rabattzeile,
 *                     kleiner Countdown, „In den Warenkorb“ mit derselben
 *                     Funktion wie der Kaufknopf oben. Mobil untereinander.
 *   useBfFunnelLinks  geschlossener Funnel: in den angehängten Sections führt
 *                     kein Link zurück in den Shop. Studien und fremde Seiten
 *                     öffnen in einem neuen Tab, Warenkorb und Deal-Seiten
 *                     bleiben, jeder andere Shop-Link wird zu Text.
 *   ohneDartsch       Studientexte ohne Personennamen (Elina EL-20261112-0a9978b4),
 *                     als Filter über die Daten, die die Deal-Seite zeigt.
 *   BfKakaoAnhang     Kakao-Deal-Seite: Schluss-Banner und Fragen (die
 *                     Gegenüberstellung Awake/Create baut EL-20261112-cb3c35ca).
 */

/* ------------------------------------------------------------------ */
/* Studientexte ohne Namen                                             */
/* ------------------------------------------------------------------ */

/*
 * Wörtliche Ersetzungen für die Sätze, die heute in den Daten stehen. Elinas
 * Vorlage: „In unserer Laborstudie wurden menschliche Immunzellen vier Stunden
 * lang Handystrahlung ausgesetzt.“ Zahlen und Studien-Links bleiben. Ist der
 * Satz im Original schon neutral, greift hier nichts.
 */
const OHNE_NAMEN = [
  [
    'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
    'In unserer Laborstudie wurden menschliche Immunzellen vier Stunden lang Handystrahlung ausgesetzt.',
  ],
  [
    'Prof. Dr. Peter C. Dartsch hat das QiBracelet® im Labor an fünf Typen menschlicher Zellen getestet. Er setzte sie oxidativem Stress aus.',
    'In unserer Laborstudie wurde das QiBracelet® an fünf Typen menschlicher Zellen getestet. Die Zellen wurden dabei oxidativem Stress ausgesetzt.',
  ],
  [
    'Prof. Dr. Peter C. Dartsch hat das QiHome® Air an menschlichen Nervenzellen getestet.',
    'In unserer Laborstudie wurde das QiHome® Air an menschlichen Nervenzellen getestet.',
  ],
];
const OHNE_NAMEN_MUSTER = [
  // Literaturangabe: der Titel, die Zeitschrift und die DOI bleiben, der Name fällt weg.
  [/(?:Prof\. Dr\. )?Peter C\. Dartsch:\s*/g, ''],
  [/\s*\((?:[^()]*\s)?Dartsch(?:[- ]Institut)?\)/g, ''],
  [/Prof\. Dr\. Peter C\. Dartsch hat /g, 'In unserer Laborstudie haben wir '],
];

function textOhneNamen(text) {
  if (typeof text !== 'string' || !text.includes('Dartsch')) return text;
  let t = text;
  for (const [alt, neu] of OHNE_NAMEN) t = t.split(alt).join(neu);
  for (const [muster, neu] of OHNE_NAMEN_MUSTER) t = t.replace(muster, neu);
  return t;
}

/** Alle Texte eines Datenobjekts ohne Dartsch-Namen (nur Strings, Arrays und einfache Objekte). */
export function ohneDartsch(wert, tiefe = 0) {
  if (typeof wert === 'string') return textOhneNamen(wert);
  if (tiefe > 10 || wert === null || typeof wert !== 'object') return wert;
  if (Array.isArray(wert)) return wert.map((x) => ohneDartsch(x, tiefe + 1));
  const proto = Object.getPrototypeOf(wert);
  if (proto !== Object.prototype && proto !== null) {
    // Modul-Namensraum (import * as …) oder anderes Objekt: Schlüssel einzeln kopieren.
    if (Object.prototype.toString.call(wert) !== '[object Module]') return wert;
  }
  const kopie = {};
  for (const [k, v] of Object.entries(wert)) kopie[k] = ohneDartsch(v, tiefe + 1);
  return kopie;
}

/* ------------------------------------------------------------------ */
/* Geschlossener Funnel: Links in den angehängten Sections            */
/* ------------------------------------------------------------------ */

const STUDIE = /studie|study|\/blogs\/|\.pdf(?:$|\?)|doi\.org/i;
const DEAL_PFADE = new Set(Object.keys(BF_DEAL_SEITEN).map((h) => `/products/${h}`));

/**
 * Was mit einem Link in den angehängten Sections passiert.
 * @returns {'bleibt'|'neuer-tab'|'aus'}
 */
export function funnelLinkArt(href, eigenerHost) {
  if (!href || href.startsWith('#') || /^(mailto|tel):/i.test(href)) return 'bleibt';
  let u;
  try {
    u = new URL(href, `https://${eigenerHost || 'qiblanco.com'}`);
  } catch {
    return 'bleibt';
  }
  const fremd = eigenerHost ? u.host !== eigenerHost : !href.startsWith('/');
  if (fremd) return /(^|\.)qiblanco\.com$/i.test(u.host) ? artIntern(u) : 'neuer-tab';
  return artIntern(u);
}

function artIntern(u) {
  if (STUDIE.test(u.pathname)) return 'neuer-tab';
  if (u.pathname.startsWith('/cart') || u.pathname.startsWith('/checkout')) return 'bleibt';
  if (DEAL_PFADE.has(u.pathname.replace(/\/$/, ''))) return 'bleibt';
  return 'aus';
}

const ANHANG = '[data-konfigurator-slot] a[href], [data-bf-anhang] a[href]';

function linksPruefen(wurzel) {
  const host = window.location.host;
  wurzel.querySelectorAll(ANHANG).forEach((a) => {
    const art = funnelLinkArt(a.getAttribute('href'), host);
    if (art === 'neuer-tab') {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    } else if (art === 'aus') {
      a.setAttribute('data-bf-weglink-aus', a.getAttribute('href'));
      a.removeAttribute('href');
      a.removeAttribute('target');
      a.setAttribute('tabindex', '-1');
    }
  });
}

/**
 * Hält die angehängten Sections einer Deal-Seite geschlossen, auch für Teile,
 * die erst später rendern (Instagram-Stimmen, Fragen).
 */
export function useBfFunnelLinks(wurzel) {
  useEffect(() => {
    const el = wurzel.current;
    if (!el || typeof MutationObserver === 'undefined') return undefined;
    linksPruefen(el);
    const beobachter = new MutationObserver(() => linksPruefen(el));
    beobachter.observe(el, {childList: true, subtree: true, attributes: true, attributeFilter: ['href']});
    return () => beobachter.disconnect();
  }, [wurzel]);
}

/* ------------------------------------------------------------------ */
/* Schluss-Banner                                                      */
/* ------------------------------------------------------------------ */

/** Der Kaufknopf oben auf der Deal-Seite (Konfigurator oder Kakao-Kaufbox). */
function kaufknopfOben(von) {
  const seite = von.closest('.bf-deal-seite') ?? document;
  return seite.querySelector('.av-kaufknopf [data-qb-kaufknopf], [data-bkd-kaufen]');
}

/**
 * „In den Warenkorb“ mit derselben Funktion wie der Kaufknopf oben: der Klick
 * löst genau diesen Knopf aus (gleicher Warenkorb-Link, dieselbe Größe,
 * Kettenlänge oder dasselbe Kakao-Set). Ist oben noch keine Wahl getroffen
 * (Knopf gesperrt), springt der Link zur Wahl oben (Sprungmarke, kein
 * Scroll-Skript). Ohne JavaScript: der feste Deal-Link, wo es einen gibt.
 */
function bannerKlick(ereignis) {
  const oben = kaufknopfOben(ereignis.currentTarget);
  if (!oben || oben === ereignis.currentTarget) return;
  if (oben.tagName === 'A' && oben.getAttribute('href')) {
    ereignis.preventDefault();
    oben.click();
  }
}

export function BfSchlussBanner() {
  const seite = useBfDealSeite();
  const wurzel = useRef(null);
  useElinaBewegung(wurzel);
  const uhr = useBfUhr();
  const deal = seite ? bfDeal(seite.deal) : null;
  if (!deal) return null;
  const bild = bfDealBild(seite);
  const name = seite.name ?? deal.name;
  const fest = seite.link ?? deal.link ?? null;
  const sprung = String(seite.art ?? '').startsWith('kakao') ? '#bkd-titel' : '#av-summe-titel';
  const ersparnis = deal.uvp - deal.preis;
  const prozent = Math.round((ersparnis / deal.uvp) * 100);
  return (
    <section
      ref={wurzel}
      className="bfsb"
      aria-labelledby="bfsb-titel"
      data-bf-anhang=""
      data-bf-schluss-banner={seite.deal}
      data-section="bf-schluss-banner"
    >
      <div className="bfsb__kachel" data-eb="">
        <figure className="bfsb__bild">
          {bild?.url ? (
            <img
              src={`${bild.url}?width=800`}
              srcSet={`${bild.url}?width=480 480w, ${bild.url}?width=800 800w, ${bild.url}?width=1200 1200w`}
              sizes="(min-width: 960px) 34rem, 92vw"
              width="800"
              height="800"
              alt={bild.altText ?? name}
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </figure>
        <div className="bfsb__text">
          <p className="bfsb__zeile">Black Friday 2026</p>
          <h2 id="bfsb-titel" className="bfsb__titel">
            {name}
          </h2>
          <p className="bfsb__preise">
            <s className="bfsb__alt">{betragText(deal.uvp, 'EUR')}</s>{' '}
            <span className="bfsb__neu">{betragText(deal.preis, 'EUR')}</span>
          </p>
          <p className="bfsb__rabatt" data-bfsb-rabatt="">
            Du sparst {betragText(ersparnis, 'EUR')} ({prozent} %)
          </p>
          {uhr.vorbei ? null : (
            <p className="bfsb__uhr" role="timer" aria-live="off">
              <span>{uhr.text}</span> <span className="bfsb__zeit">{uhr.zeit}</span>
            </p>
          )}
          <a
            className="bfsb__knopf"
            href={fest ?? sprung}
            onClick={bannerKlick}
            data-bfsb-knopf=""
            rel="nofollow"
          >
            In den Warenkorb
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Kakao: Schluss-Banner und Fragen                                    */
/* ------------------------------------------------------------------ */

/*
 * Die Gegenüberstellung Awake und Create mit dem gemeinsamen Block baut
 * EL-20261112-cb3c35ca (BfKakaoVergleich, unter der Kaufbox). Hier kommt
 * danach nur, was alle Deal-Seiten tragen: Schluss-Banner, dann die Fragen,
 * dieselben wie auf den Crystal-Cacao-Seiten (FAQ_CACAO, gespiegelt von
 * crystal-cacao.com).
 */
function KakaoFragen() {
  return (
    <section className="bfkv bfkv--fragen" aria-labelledby="bfkv-fragen" data-bf-anhang="" data-section="bf-kakao-faq">
      <h2 id="bfkv-fragen" className="bfkv__titel">
        Deine Fragen zum Kakao.
      </h2>
      <div className="bfkv__fragen">
        {FAQ_CACAO.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{textOhneNamen(f.a)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/** Unter der Kakao-Kaufbox (und der Gegenüberstellung): Schluss-Banner, dann Fragen. */
export function BfKakaoAnhang() {
  const wurzel = useRef(null);
  useBfFunnelLinks(wurzel);
  return (
    <div ref={wurzel} className="bfka" data-bf-kakao-anhang="">
      <BfSchlussBanner />
      <KakaoFragen />
    </div>
  );
}
