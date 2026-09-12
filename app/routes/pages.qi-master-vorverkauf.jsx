import {useLoaderData} from 'react-router';
import {QiMasterTreppe} from '~/components/product-pages/QiMasterTreppe';
import {treppe as treppeRechnen} from '~/lib/qi-master-preisstufen';
import preisstufen from '~/data/qi-master-preisstufen.json';
import {noindexMeta, noindexHeader} from '~/lib/seo';
import qiMasterStyles from '~/styles/qi-master.css?url';
import lpStyles from '~/styles/qi-master-vorverkauf.css?url';

/**
 * /pages/qi-master-vorverkauf — die Landingpage zum QiMaster-Vorverkauf.
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
    {rel: 'stylesheet', href: lpStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'QiMaster Vorverkauf – die Treppe bis Ende des Jahres | Qi Blanco'},
  {
    name: 'description',
    content:
      'Der QiMaster geht nie in eine Rabattaktion. Bis zum 31.12.2026 gibt es eine Ausnahme, und sie wird jeden Monat kleiner.',
  },
  noindexMeta(),
];

/**
 * Zweite, vom HTML unabhängige Sperre desselben Signals: greift auch bei einem
 * Bot, der den head nicht parst. Wortgleich aus `noindexHeader()`.
 */
export const headers = () => noindexHeader();

export function loader() {
  return {treppe: treppeRechnen(preisstufen)};
}

export default function QiMasterVorverkaufRoute() {
  const {treppe} = useLoaderData();

  return (
    <div className="qm-lp">
      <header className="qm-lp__sektion qm-lp__kopf">
        <div className="qm-lp__kopf-innen">
          <span className="qm-lp__auge">Vorverkauf</span>
          <h1 className="qm-lp__titel">
            Du warst schon da. Deshalb bekommst du den QiMaster zuerst – und zum
            besten Preis, den es je für ihn geben wird.
          </h1>
          <p className="qm-lp__vorspann">
            Diese Seite ist nicht öffentlich. Du hast sie bekommen, weil du
            schon einmal bei uns warst.
          </p>
        </div>
      </header>

      <section className="qm-lp__sektion" aria-labelledby="qm-lp-warum">
        <h2 id="qm-lp-warum">Warum es diese Seite gibt</h2>
        <p>
          Das hier ist kein Abverkauf. Die Fertigung läuft ohnehin, kein Stück
          bleibt liegen, und niemand muss etwas loswerden. Der Nachlass ist ein
          Dank an die Menschen, die vor allen anderen da waren – keine Notlage.
        </p>
        <p>
          Und weil es ein Dank ist und keine Verkaufsmechanik, wird er jeden
          Monat kleiner statt grösser. Du siehst unten die ganze Treppe bis zum
          Jahresende, bevor du dich entscheidest. Es gibt nichts, was danach
          noch kommt.
        </p>
      </section>

      <section className="qm-lp__sektion" aria-labelledby="qm-lp-treppe-titel">
        <QiMasterTreppe treppe={treppe} titelId="qm-lp-treppe-titel" />
      </section>

      <section className="qm-lp__sektion" aria-labelledby="qm-lp-gerät">
        <h2 id="qm-lp-gerät">Warum es den QiMaster überhaupt gibt</h2>
        <p>
          Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede
          Zelle deines Körpers gebaut ist. Das ist der Gedanke, aus dem der
          QiMaster entstanden ist: nicht ein Stein als Schmuck, sondern derselbe
          Grundstoff, gefasst am Gitterchip.
        </p>

        <h3>Der Gitterchip der zweiten Generation</h3>
        <p>
          Der Kern ist derselbe Gitterchip, den auch der QiOne® 2 Pro trägt:
          eine 750er Goldlegierung, deren Atome in einer festgelegten Ordnung
          stehen. Ohne Elektronik, ohne Batterie, ohne Verschleiß.
        </p>

        <h3>Ein Stück, das es nur einmal gibt</h3>
        <ul className="qm-lp__liste">
          <li>Echte Diamanten, gefasst am Gitterchip.</li>
          <li>
            Kette und Verschluss aus 750er Gold, beides mit Qi-Blanco-Logo.
          </li>
          <li>
            Eigene Seriennummer auf jedem Stück – deinen gibt es kein zweites
            Mal.
          </li>
        </ul>
      </section>

      <section
        className="qm-lp__sektion qm-lp__grenzen"
        aria-labelledby="qm-lp-grenzen"
      >
        <h2 id="qm-lp-grenzen">Was er kann – und was er nicht kann</h2>
        <p>
          Untersucht wurde der Gitterchip, nicht das Schmuckstück: die
          Zellstudien sind am QiOne® 2 Pro in vitro durchgeführt worden, also
          an Zellen im Labor. Sie belegen keinen Heileffekt am Menschen.
        </p>
        <p>
          Was du bekommst, ist ein Stück mit einer nachvollziehbaren Herkunft
          und 20 Tagen Zeit, es in deinen Alltag zu nehmen und selbst zu
          entscheiden. Wenn es dir nichts gibt, schickst du es zurück.
        </p>
      </section>

      <section className="qm-lp__sektion qm-lp__handlung">
        <a className="qm-lp__knopf" href="/products/qi-master">
          Zum QiMaster
        </a>
        <p className="qm-lp__knopf-hinweis">
          Der Preis deiner Stufe steht auf der Produktseite – dort kaufst du
          auch.
        </p>
      </section>

      <section
        className="qm-lp__sektion qm-lp__zusage"
        aria-labelledby="qm-lp-zusage"
      >
        <div className="qm-lp__zusage-innen">
          <h2 id="qm-lp-zusage">Die Zusage</h2>
          <p>
            Ab dem 01.01.2027 gilt dauerhaft der reguläre Preis. Kein Black
            Friday, keine Aktion, keine Ausnahme – auch nicht still und auch
            nicht für einzelne.
          </p>
          <p>
            Wir schreiben das hier auf, damit es nachlesbar ist: wer den
            QiMaster später kauft, soll nicht das Gefühl haben, zu früh gekauft
            zu haben.
          </p>
        </div>
      </section>
    </div>
  );
}

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
