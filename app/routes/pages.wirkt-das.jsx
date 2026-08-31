import {MmWirktDas} from '~/components/campaign/MmWirktDas';
import mmStyles from '~/styles/mm-lp.css?url';
import {noindexMeta, noindexHeader} from '~/lib/seo';

/**
 * /pages/wirkt-das — Antwort auf den größten Einwand des Bestands
 * (`ew-01` „Wirkt das überhaupt?", 3.758 von 29.251 Vorgängen).
 *
 * ZWEI TRAEGER, UND DAS IST ABSICHT — die Naht ist in s01 gemessen und in s03
 * am Bestand nachgewiesen worden:
 *   diese Route          trägt Design, Inhalt und Token-CSS
 *   die Shopify-Page mit
 *   Handle `wirkt-das`   trägt Sitemap-Eintrag und Menü-Ziel
 * Eine code-only-Route ist live HTTP 200 und steht NICHT in der Sitemap:
 * sitemap.$type.$page[.xml].jsx erzeugt die Liste über getSitemap() aus der
 * SHOPIFY-Page-Liste und kennt nur eine Ausschluss-Liste, keine Inclusion-
 * Liste. Gegenprobe im Bestand: /pages/zellstudien-ehrlich,
 * /pages/das-20-tage-versprechen und /pages/so-wirkt-kohaerentes-wasser
 * liefern je 200 und haben je 0 Treffer in sitemap/pages/1.xml. Die
 * Koexistenz beider Träger ist kein Konflikt, sondern der Regelfall: 30
 * Handles im Repo haben beides, darunter `technologie` — dort rendert
 * nachweislich die Route (eindeutiger Marker im Live-HTML) und der
 * Sitemap-Eintrag existiert trotzdem.
 *
 * AUSSER BETRIEB SEIT 2026-08-31 — NICHT MEHR INDEXIERBAR (Christian, direkt:
 * „die Seite ist so schlecht, dass sie rausgenommen wird — also raus aus dem
 * Reiter und nicht mehr crawlbar"). Bis dahin stand hier das Gegenteil: die
 * Seite war genau dafür gebaut, gefunden zu werden, und trug deshalb einen
 * Canonical und KEIN noindex. Anlass der Umkehr waren Mängel an der
 * ausgelieferten Seite selbst (durchgehender Anrede-Mix Sie/Du, ein
 * Wortumbruch mitten im Wort, ein Komma am Zeilenanfang, zweimal derselbe
 * falsch sitzende Zitatblock, ein sich selbst abwertender Einstieg) — nicht
 * am Zweck der Seite.
 *
 * ENTWEDER noindex ODER canonical, nie beides (Hausregel, wörtlich in
 * `pages.uebersicht.jsx`): ein Bot, der dem Canonical folgt, kann das noindex
 * der Zielseite zuordnen. Der `canonicalLink`-Aufruf ist deshalb ENTFERNT und
 * nicht auskommentiert stehengeblieben.
 *
 * DIE ROUTE BLEIBT ERREICHBAR (HTTP 200) — Variante (a) des Vollzugsauftrags.
 * Es gibt keinen externen eingehenden Link (gemessen: 0 Treffer in Mail-,
 * Ads- und Social-Beständen), aber die Seite ist erst fünf Tage alt und ihr
 * Inhalt soll wiederverwendbar bleiben; ein 404/410 würde Arbeit vernichten,
 * die eine spätere Entscheidung noch braucht. Der Rückweg steht im RESULT des
 * Jobs 20260831-vollzug-wirkt-das-aus-menue-und-index-nehmen-prio6.
 *
 * DER SITEMAP-EINTRAG fliegt zusätzlich raus — über den Handle `wirkt-das` in
 * `NICHT_INDEXIERBARE_SEITEN_DEF` (app/lib/seo.js, `ausSitemap: true`), also
 * über dieselbe eine Definition, aus der beide Sichten abgeleitet werden.
 * Warum hier KEINE Übergangsstufe `ausSitemap: false` wie bei `pre-access`:
 * die Begründung dort ist „die Sitemap ist der einzige Weg, auf dem Google die
 * Seite noch besucht" — sie gilt für eine seit Jahren liegende Restseite. Diese
 * hier war fünf Tage in der Sitemap; ihr Discovery-Pfad war zusätzlich das
 * Hauptmenü und die Produktseite. Sie steht damit in Googles Crawl-Frontier
 * und wird auch ohne Sitemap-Eintrag wieder besucht — und trifft dann auf
 * noindex im HTML UND im X-Robots-Tag.
 *
 * Tracking hängt global im root-Layout; die Seite braucht keine Produktdaten
 * und hat bewusst keinen Kauf-CTA — ihr Ausgang ist „selbst prüfen".
 */
export function links() {
  return [{rel: 'stylesheet', href: mmStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Wirkt das überhaupt? Was gemessen ist – und was nicht | Qi Blanco'},
  {
    name: 'description',
    content:
      'Fünf Zellstudien, ein Labor, klare Grenzen: was bei Qi Blanco im Labor gemessen wurde, was daraus folgt und was ausdrücklich nicht. Zum Selbstnachlesen.',
  },
  noindexMeta(),
];

/**
 * Die ZWEITE, vom HTML unabhängige Sperre desselben Signals (Hausmuster D-006,
 * „Gurt und Hosenträger"): greift auch bei einem Bot, der den HTML-head nicht
 * parst. Wortgleich zu `pages.uebersicht.jsx` und zum Katchall
 * `pages.$handle.jsx` — beide beziehen ihn aus `noindexHeader()`.
 */
export const headers = () => noindexHeader();

export function loader() {
  return {};
}

export default function WirktDasRoute() {
  return <MmWirktDas />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
