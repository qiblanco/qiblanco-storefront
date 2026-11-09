import {KohaerentesWasserSeite} from '~/components/campaign/KohaerentesWasserSeite';
import kwStyles from '~/styles/was-ist-kohaerentes-wasser.css?url';
import qbErklaerPopupStyles from '~/styles/qb-erklaer-popup.css?url';
import {canonicalLink} from '~/lib/seo';
import {seitenSignale} from '~/lib/seiten-seo';
import {SEITE, strukturierteDaten} from '~/data/wasser-infoseite';

/**
 * /pages/was-ist-kohaerentes-wasser — die Info-Seite „Kohärentes Wasser".
 *
 * Auftrag: Großjob vom 23.09.2026 „Info-Seite kohärentes Wasser"
 * (Christian, 23.09.2026, wörtlich: „die beste Info-Seite zu dem Thema im Netz
 * … Erster Teil: Kohärentes Wasser — einfach erklärt … Zweiter Teil: harte
 * Fakten … mit Quellen belegen und sehr guten detaillierten Grafiken").
 *
 * DIE ADRESSE IST CHRISTIANS ENTSCHEIDUNG (23.09.2026 ~22:20): die Frage steht
 * im Pfad, wie der Suchende sie stellt. /pages/kohaerentes-wasser bleibt Tag 5
 * des Kurses „In 5 Stufen zum Superhuman" und verweist oben hierher. Damit sich
 * beide Seiten nicht die Suchtreffer wegnehmen, trägt DIESE Seite Titel, H1,
 * strukturierte Daten und die internen Verweise zum Begriff.
 *
 * REINE ROUTE, KEIN SHOPIFY-SEITENOBJEKT und kein Loader: der Inhalt steht
 * committet in app/data/wasser-infoseite.js (Oxygen läuft am Edge und
 * liest shared-state zur Laufzeit nicht). In die Sitemap kommt die Seite über
 * NUR_ROUTE_SEITEN in app/lib/seo.js, ins Menü „Mehr" über das Shopify-Menü
 * main-menu (kein Code).
 *
 * INDEXIERBAR: canonical über canonicalLink() (Gate 17 verlangt die
 * <link>-Form), kein noindex, kein Disallow.
 *
 * ZWEI SEITEN, ZWEI ABSICHTEN (Hebel GS-253, 09.11.2026): diese Seite bleibt die
 * Begriffserklärung; der Fachartikel /blogs/wissen/kohaerentes-wasser-was-die-forschung-misst
 * ist die Studienlage. Die Kurzfassung verlinkt ihn mit eigenem Ankertext (KURZ_VERWEIS
 * unten), der Artikel verlinkt hierher zurück. Der Satz steht in der Route und nicht in
 * app/data/wasser-infoseite.js: jene Datei lesen auch die Hexagonal- und die Gitterchip®-
 * Seite, und SEITE.kurz geht roh als Article.abstract ins JSON-LD.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Schlüssel,
 * kein Kaufknopf. Das Video lädt erst auf Klick über youtube-nocookie.com
 * (YoutubeTimestamp). Die Tracking-Kette hängt pfad-agnostisch im root-Layout.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: qbErklaerPopupStyles},
    {rel: 'stylesheet', href: kwStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: SEITE.titel},
  {name: 'description', content: SEITE.beschreibung},
  canonicalLink(SEITE.pfad),
  ...seitenSignale({
    pfad: SEITE.pfad,
    titel: SEITE.titel,
    beschreibung: SEITE.beschreibung,
    hauptknoten: false,
  }).filter((d) => d.property !== 'og:type'),
  {property: 'og:type', content: 'article'},
  {property: 'article:published_time', content: SEITE.veroeffentlicht},
  {property: 'article:modified_time', content: SEITE.geaendert},
  ...strukturierteDaten().map((knoten) => ({'script:ld+json': knoten})),
];

/** Ein Satz am Ende der Kurzfassung, Verweis-Markup wie in app/data/wasser-infoseite.js. */
export const KURZ_VERWEIS =
  'Wenn du sehen willst, {l:/blogs/wissen/kohaerentes-wasser-was-die-forschung-misst|was Studien an kohärentem Wasser messen}, findest du die Zahlen in unserem Fachartikel.';

export default function WasIstKohaerentesWasserRoute() {
  return <KohaerentesWasserSeite kurzVerweis={KURZ_VERWEIS} />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
