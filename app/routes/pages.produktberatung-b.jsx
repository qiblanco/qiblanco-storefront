import {ProduktberatungSeite} from '~/components/campaign/ProduktberatungSeite';
import produktberatungStyles from '~/styles/produktberatung.css?url';
import {action as aktionA, loader as ladeA} from './pages.produktberatung';

/*
 * /pages/produktberatung-b — Arm B der Beratungsseite (Seiten-Experiment
 * pb-e1-gs107, Hypothese GS-107; Grossjob 20261008-GROSSJOB-produktberatung-
 * christians-text-und-seite-optimieren, s02; Christian 08.10.2026: „Live heißt
 * Test-Kreislauf, nicht nur Bericht").
 *
 * A = Christians Text + der Rest wie heute, B = Christians Text GLEICH + ein
 * umgebauter Rest. Beide Arme rendern DIESELBE Komponente; B schaltet nur
 * `variante="b"` (Kopf mit dem nächsten Termin, Christians Foto zuerst am Handy,
 * Reihenfolge und Stimmen). Christians Wortlaut ist damit baulich derselbe.
 *
 * Diese Route enthält KEINE Weiche, die sitzt im Loader von A. Loader und Action
 * sind die von A (dieselben Termine, dieselbe Buchungs-API, derselbe Cookie);
 * der Loader von A erkennt den Arm am Pfad und lenkt hier nie um, die Action
 * leitet nach dem Buchen auf /pages/produktberatung-b?verwalten=1&status=…,
 * damit der Abschluss je Arm zählbar ist.
 *
 * noindex, nofollow als Doppelgate wie die anderen B-Arme (Meta-robots +
 * X-Robots-Tag), KEIN canonical, kein Open Graph, keine Sitemap: B soll der
 * Seite A kein zweites Signal danebenstellen. Persönliche Daten: no-store.
 */
export function links() {
  return [{rel: 'stylesheet', href: produktberatungStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Produktberatung: 20 Minuten mit Christian per Zoom | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({
  'X-Robots-Tag': 'noindex, nofollow',
  'Cache-Control': 'private, no-store',
});

/** @param {LoaderFunctionArgs} args */
export async function loader(args) {
  return ladeA(args);
}

/** @param {ActionFunctionArgs} args */
export async function action(args) {
  return aktionA(args);
}

export default function ProduktberatungB() {
  return <ProduktberatungSeite variante="b" />;
}

/** @typedef {import('react-router').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('react-router').ActionFunctionArgs} ActionFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
