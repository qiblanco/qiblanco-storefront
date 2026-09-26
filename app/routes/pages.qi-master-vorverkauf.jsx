import {QiMasterWortlaut} from '~/components/product-pages/QiMasterWortlaut';
import {noindexMeta, noindexHeader} from '~/lib/seo';
import qiMasterStyles from '~/styles/qi-master.css?url';
import wortlautStyles from '~/styles/qi-master-wortlaut.css?url';
import lpStyles from '~/styles/qi-master-vorverkauf.css?url';

/**
 * /pages/qi-master-vorverkauf — die Landingpage zum Qi Master®.
 *
 * ─── STAND 22.09.2026: KEIN LAUFENDER VORVERKAUF, KEIN RABATT ─────────────
 *
 * Christian hat an diesem Tag die Vorverkaufsfassung abgelöst: „Durch seine
 * sehr aufwendige Herstellung ist der Preis des Qi Master® fixiert … Der
 * Vorverkauf starte im Oktober 2026." Diese Seite existierte ausschließlich
 * für die Treppe, die jetzt nicht läuft. Entschieden wurde UMBAUEN, nicht
 * entfernen (Grossjob 20260922-GROSSJOB-qi-master-ohne-laufenden-vorverkauf-
 * und-ohne-rabatt, Segment s03):
 *   - die Adresse steht in bereits verschickten Mails der Bestandskette; ein
 *     404 oder Redirect wäre für diese Leser der Abbruch statt eines Klicks,
 *     und ein Redirect ist kundenwirksam schwerer zurückzunehmen als ein Text;
 *   - der Oktober-Start ist angekündigt — der Tag, an dem die Seite wieder
 *     einen laufenden Vorverkauf trägt, kommt aus der einen Quelle
 *     app/data/qi-master-wortlaut.json (offene_frage, fällig 2026-10-01);
 *   - der Rückweg ist ein git revert, ohne Nebenwirkung auf Suchmaschinen
 *     (die Seite ist und bleibt noindex).
 * Ob die Seite nach dem Oktober-Start weiterlebt oder auf /products/qi-master
 * weiterleitet, ist eine eigene Frage und im RESULT des Segments benannt.
 *
 * WAS WEG IST, UND WARUM NICHTS DAVON UMGEBAUT WURDE: die Treppe (Tabelle,
 * „läuft jetzt", Angebotssatz, Überschrift), der Kopf „zum besten Preis, den
 * es je für ihn geben wird", der Abschnitt „Warum es diese Seite gibt"
 * (Nachlass als Dank) und „Die Zusage" (ab 01.01.2027 regulärer Preis). Alle
 * vier setzten einen Nachlass voraus, den es nicht mehr gibt. An ihre Stelle
 * tritt Christians Wortlaut, aus derselben Quelle wie auf der Produktseite.
 *
 * ─── DIE GESCHICHTE DER SEITE (bis 22.09.2026) ─────────────────────────────
 *
 * IHRE AUFGABE IST EINE ANDERE ALS DIE DER PRODUKTSEITE. /products/qi-master
 * verkauft ein Gerät und wird an der Bestellung gemessen; diese Seite erklärt
 * eine Gelegenheit und wird am NÄCHSTEN KLICK gemessen (Kaufüberzeugungs-Kanon:
 * „Die Landingpage verkauft nicht – sie erzeugt den nächsten Klick", Trichter
 * Ad/Mail -> Landingpage -> Kaufseite -> Kasse). Deshalb steht hier kein
 * Warenkorb, keine Variantenauswahl und kein zweiter Kaufweg: der einzige
 * Ausgang ist ein Knopf auf /products/qi-master.
 *
 * EIN WEG HINEIN, EIN WEG HINAUS. Hinein führt allein die Adresse aus der
 * Mailkette an den Bestand (Schwester-Grossjob 20260911-GROSSJOB-qi-master-
 * mailkette-an-bestandskunden-vorverkauf-ab-18-september). Es gibt bewusst
 * KEINE interne Verlinkung: kein Menü-Eintrag, kein Dropdown, kein Sitemap-
 * Eintrag. Genau das ist auch der Grund für die Sitemap-Entscheidung weiter
 * unten.
 *
 * DIESELBEN ZAHLEN WIE DIE PRODUKTSEITE, AUS DERSELBEN QUELLE. Beide Flächen
 * rendern denselben Baustein (QiMasterTreppe) aus demselben Aufruf
 * (`treppe()` aus ~/lib/qi-master-preisstufen, gespeist aus
 * app/data/qi-master-preisstufen.json). Hier wird nichts nachgerechnet und
 * nichts hingeschrieben — zwei Flächen mit zwei Preisen wären der teuerste
 * Fehler, den dieser Auftrag machen kann.
 *
 * SERVERSEITIG GERECHNET, wie auf der Produktseite und aus denselben zwei
 * Gründen: (1) nur so steht die laufende Stufe im ausgelieferten HTML, und nur
 * dort kann die Abnahme-Probe sie am äusseren Rand überhaupt sehen; (2) am
 * Stufenwechsel (Monatserster, Europe/Berlin) liefen Server- und Browserdatum
 * sonst auseinander und erzeugten einen Hydrations-Widerspruch.
 *
 * ─── NICHT INDEXIERBAR, UND ZWAR AUF DREI WEGEN ────────────────────────────
 *
 * (1) `noindexMeta()` im HTML-head und (2) `noindexHeader()` als X-Robots-Tag
 * — das Hausmuster „Gurt und Hosenträger" (D-006), wortgleich zu
 * `pages.wirkt-das.jsx` und `pages.uebersicht.jsx`. KEIN Canonical: entweder
 * noindex ODER canonical, nie beides (Hausregel, wörtlich in
 * `pages.uebersicht.jsx`) — ein Bot, der dem Canonical folgt, kann das noindex
 * der Zielseite zuordnen.
 *
 * (3) Der Eintrag `qi-master-vorverkauf` in `NICHT_INDEXIERBARE_SEITEN_DEF`
 * (app/lib/seo.js) mit `ausSitemap: true`. WARUM DORT DIE ÜBERGANGSSTUFE
 * `ausSitemap: false` FALSCH WÄRE — die Frage ist gestellt worden, hier ist die
 * Herleitung statt einer kopierten Konvention:
 *
 *   Der Zweck der Übergangsstufe ist, dass Google eine BEREITS INDEXIERTE
 *   Seite noch einmal besucht, um ihr frisches `noindex` überhaupt zu lesen —
 *   nimmt man sie im selben Deploy aus der Sitemap, liest Google das Signal
 *   nie. Diese Seite ist neu. Sie war nie im Index, stand nie in einer
 *   Sitemap, und es gibt kein Index-Eintrag, den ein Crawl zurücknehmen
 *   müsste. Stufe 1 hat hier schlicht kein Objekt. Dieselbe Herleitung steht
 *   im Bestand am Handle `wirkt-das` („Stufe 1 ist gegenstandslos"), während
 *   `pre-access` als seit Jahren indexierte Restseite zu Recht auf `false`
 *   steht.
 *
 *   UND DIE GEGENRICHTUNG IST DER EIGENTLICHE GRUND: diese Seite hat
 *   ausdrücklich KEINE interne Verlinkung. Genau deshalb wäre die Sitemap ihr
 *   EINZIGER Discovery-Pfad — also derselbe Weg, über den
 *   /pages/development-nicht-loschen am 2026-08-14 auf Platz 4 der Suche nach
 *   „Qi Blanco Studien" landete, ohne je intern verlinkt gewesen zu sein.
 *   `ausSitemap: false` würde hier den einen Weg offenhalten, den der Auftrag
 *   schließen will.
 *
 *   HEUTE IST DER EINTRAG WIRKUNGSLOS, und das ist Absicht: gemessen am
 *   2026-09-12 führt https://qiblanco.com/sitemap/pages/1.xml 52 URLs, davon 0
 *   mit `qi-master`. Es gibt kein Shopify-Seitenobjekt mit diesem Handle, und
 *   die pages-Sitemap entsteht aus der Shopify-Liste plus dem Nachtrag
 *   `NUR_ROUTE_SEITEN` — in den diese Seite NICHT gehört (dessen
 *   Aufnahme-Kriterium verlangt ausdrücklich „indexierbar gewollt"). Der
 *   Eintrag ist die Sperre für den Tag, an dem jemand im Shopify-Admin ein
 *   CMS-Seitenobjekt mit diesem Handle anlegt; mit `false` wanderte die Seite
 *   in genau diesem Moment still in die Sitemap.
 *
 * ─── GESTALTUNG ────────────────────────────────────────────────────────────
 *
 * Zwei Stylesheets, kein drittes Token-System: `qi-master.css` bringt die
 * `--qm-*`-Token und die Treppe (EIN Bauteil, zwei Flächen — ihr Kopfkommentar
 * sagt diese Seite wörtlich vorher), `qi-master-vorverkauf.css` nur das, was
 * es auf der Produktseite nicht gibt. Eine eigene Skala hier wäre ein zweiter
 * Goldton und eine zehnte Schriftgrösse.
 */

export function links() {
  return [
    {rel: 'stylesheet', href: qiMasterStyles},
    {rel: 'stylesheet', href: wortlautStyles},
    {rel: 'stylesheet', href: lpStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Master® – Alpha Serie, limitiert auf 100 Stück | Qi Blanco'},
  {
    name: 'description',
    content:
      'Der Preis des Qi Master® ist fixiert. Limitierte Auflage von 100 Stück, von Goldschmieden per Hand poliert. Designed in Germany. Made in Germany.',
  },
  noindexMeta(),
];

/**
 * Zweite, vom HTML unabhängige Sperre desselben Signals: greift auch bei einem
 * Bot, der den head nicht parst. Wortgleich aus `noindexHeader()`.
 */
export const headers = () => noindexHeader();

export default function QiMasterVorverkaufRoute() {
  return (
    <div className="qm-lp">
      <header className="qm-lp__inhalt qm-lp__kopf">
        <div className="qm-lp__kopf-inhalt">
          <span className="qm-lp__auge">Alpha Serie</span>
          <h1 className="qm-lp__titel">
            Qi Master®: 100 Stück, von Hand poliert, zu einem festen Preis.
          </h1>
        </div>
      </header>

      <section className="qm-lp__inhalt qm-lp__wortlaut">
        <QiMasterWortlaut />
      </section>

      <section className="qm-lp__inhalt" aria-labelledby="qm-lp-gerät">
        <h2 id="qm-lp-gerät">Warum es den Qi Master® überhaupt gibt</h2>
        <p>
          Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede
          Zelle deines Körpers gebaut ist. Das ist der Gedanke, aus dem der
          Qi Master® entstanden ist: nicht ein Stein als Schmuck, sondern derselbe
          Grundstoff, gefasst am Gitterchip™.
        </p>

        <h3>Der Gitterchip™ der zweiten Generation</h3>
        <p>
          Der Kern ist derselbe Gitterchip™, den auch der QiOne® 2 Pro trägt:
          eine 750er Goldlegierung, deren Atome in einer festgelegten Ordnung
          stehen. Ohne Elektronik, ohne Batterie, ohne Verschleiß.
        </p>

        <h3>Ein Stück, das es nur einmal gibt</h3>
        <ul className="qm-lp__liste">
          <li>Echte Diamanten, gefasst am Gitterchip™.</li>
          {/* CHRISTIAN 2026-09-22: die Gold-Aussage wechselt den Gegenstand —
              von Kette und Verschluss auf den Gitterchip™. Bis dahin stand
              hier „Kette und Verschluss aus 750er Gold, beides mit
              Qi-Blanco-Logo."; dieselbe abgeloeste Aussage lag auf
              /products/qi-master und in der Fragenliste und ist dort im selben
              Zug mitgezogen. */}
          <li>
            Für den Gitterchip™ kommt eine eigene spezielle 750er
            Goldlegierung zum Einsatz.
          </li>
          <li>
            Eigene Seriennummer auf jedem Stück – deinen gibt es kein zweites
            Mal.
          </li>
        </ul>
      </section>

      <section
        className="qm-lp__inhalt qm-lp__grenzen"
        aria-labelledby="qm-lp-grenzen"
      >
        <h2 id="qm-lp-grenzen">Was er kann – und was er nicht kann</h2>
        <p>
          Untersucht wurde der Gitterchip™, nicht das Schmuckstück: die
          Zellstudien sind am QiOne® 2 Pro in vitro durchgeführt worden, also
          an Zellen im Labor. Sie belegen keinen Heileffekt am Menschen.
        </p>
        <p>
          Was du bekommst, ist ein Stück mit einer nachvollziehbaren Herkunft
          und 20 Tagen Zeit, es in deinen Alltag zu nehmen und selbst zu
          entscheiden. Wenn es dir nichts gibt, schickst du es zurück.
        </p>
      </section>

      <section className="qm-lp__inhalt qm-lp__abschluss">
        <div className="qm-lp__abschluss-inhalt">
          {/* data-qb-kaufknopf: der einzige Ausgang dieser Seite zählt für
              KaufknopfChatSignal wie ein Kaufknopf — das Chat-Widget
              weicht ihm, solange es ihn überdeckt. */}
          <a
            className="qm-lp__knopf"
            href="/products/qi-master"
            data-qb-kaufknopf=""
          >
            Zum Qi Master®
          </a>
          <p className="qm-lp__knopf-hinweis">
            Preis, Bilder und alle Details stehen auf der Produktseite.
          </p>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
