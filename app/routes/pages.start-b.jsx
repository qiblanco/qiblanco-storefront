import {StartRookie} from '~/components/rookie/start/StartRookie';
import externeStimmenStyles from '~/styles/externe-stimmen.css?url';
import startseiteStyles from '~/styles/startseite.css?url';
import rookieStartStyles from '~/styles/rookie-start.css?url';

/*
 * ROOKIE /pages/start-b — Variante B der Startseite / (Experiment
 * start-e1-gs081, Hypothese GS-081, 15 % der Besucher von A, sobald die Weiche
 * app/lib/experiment-weiche.server.js scharf ist; Grossjob
 * 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-startseite).
 *
 * Bis dahin ist die Seite DUNKEL: erreichbar, aber nirgends verlinkt und ohne
 * Verkehr. Diese Route enthält KEINE Weiche; die sitzt im Loader von A.
 *
 * KEIN LOADER: die Startseite lädt eine Kollektion und vier Produkte, die ihre
 * Sektionen gar nicht lesen (HomepageSections hat kein useLoaderData). B
 * braucht davon nichts.
 *
 * Dieselben Stylesheets wie A (_index.jsx) plus rookie-start.css, die nur
 * hinzufügt, was B mehr hat.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: externeStimmenStyles},
    {rel: 'stylesheet', href: startseiteStyles},
    {rel: 'stylesheet', href: rookieStartStyles},
  ];
}

/*
 * noindex, nofollow als Doppelgate wie LP B und die Shopseiten-Rookie (D-006):
 * Meta-robots + X-Robots-Tag. KEIN canonical, KEIN Open Graph, KEIN
 * Entitäts-Graph: die Startseite ist die wichtigste Seite der Markensuche, B
 * soll ihr kein zweites Signal danebenstellen. Der Titel ist die Überschrift
 * der Seite (Bestandstext) statt des Startseiten-Titels.
 * @type {MetaFunction}
 */
export const meta = () => [
  {title: 'Tragbares Hightech mit messbaren Effekten auf Zellebene | Qi Blanco'},
  {name: 'robots', content: 'noindex,nofollow'},
];

/** @type {HeadersFunction} */
export const headers = () => ({'X-Robots-Tag': 'noindex, nofollow'});

export default function StartRookieRoute() {
  return <StartRookie />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
