import {HomepageSections} from '~/components/homepage/HomepageSections';
import {LANDING_PAGES} from '~/lib/landingpages';

const HANDLE = 'zell-schutz';

/**
 * noindex, nofollow (Meta-robots) — BEWUSST KEIN canonical:
 * noindex + fremdes canonical = widerspruechliche Signale (Konzept §3).
 * @type {MetaFunction}
 */
export const meta = () => {
  return [
    {title: LANDING_PAGES[HANDLE].title},
    {name: 'robots', content: 'noindex,nofollow'},
  ];
};

/**
 * X-Robots-Tag zusaetzlich (Gurt + Hosentraeger): greift auch, wenn ein Bot
 * das HTML-head nicht parst. Identische Wirkung laut Google-Doku.
 * @type {HeadersFunction}
 */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

// Kein Loader: die Route braucht keine eigenen Shopify-Daten. Tracking erbt
// pfad-agnostisch aus dem root-Layout (kein zusaetzlicher Pixel = keine
// Doppelzaehlung).
export default function ZellSchutzLandingpage() {
  return <HomepageSections overrides={LANDING_PAGES[HANDLE].overrides} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
