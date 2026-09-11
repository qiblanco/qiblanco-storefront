import {HypothesenSeite} from '~/components/campaign/HypothesenSeite';
import hypothesenStyles from '~/styles/hypothesen.css?url';
import {noindexMeta, noindexHeader} from '~/lib/seo';
import {VIDEOS} from '~/data/hypothesen-quellen';

/**
 * /pages/hypothesen — ERREICHBAR, ABER DUNKEL.
 *
 * Auftrag: 20260911-BAU-pages-hypothesen-das-wirkmodell-mit-staerken-und-
 * schwaechen (Christian, 2026-09-11, wörtlich: „Sowas wie ‚Qi Blanco – unsere
 * Hypothesen‘ und dann das ganze Wirkmodell von Qi Blanco einstellen, so wie
 * wir es erarbeitet haben, mit Stärken und Schwächen. Aber noch nicht crawlbar
 * machen — mir zeigen, wenn es live ist. Und sehr viele Quellen einstellen.
 * Dann als /pages/hypothesen einbinden.").
 *
 * DAS DUNKEL HAT DIESELBEN VIER SPERREN WIE /pages/kritik — die Bauform ist
 * bewusst wortgleich übernommen, weil sie dort nachweislich getragen hat:
 *
 * (1) NOINDEX im HTML-head UND als X-Robots-Tag („Gurt und Hosenträger").
 *     BEWUSST KEIN canonical: entweder noindex ODER canonical, nie beides.
 *
 * (2) ROBOTS.TXT: `Disallow: /pages/hypothesen` in der `User-agent: *`-Gruppe
 *     ([robots.txt].jsx, generalDisallowRules). Die Seite war nie im Index —
 *     Disallow verhindert den Erstbesuch, noindex ist der Gurt für den Bot,
 *     der über einen fremden Link trotzdem kommt. WER DIE SEITE FREISCHALTET,
 *     NIMMT ZUERST DAS DISALLOW RAUS, DANN DAS NOINDEX — in dieser Reihenfolge,
 *     sonst kann Google das noindex nicht mehr lesen.
 *
 * (3) NICHT IN DER SITEMAP — durch die Wahl des Trägers: reine Hydrogen-Route,
 *     KEIN Shopify-Page-Objekt. Die Sitemap entsteht aus der Shopify-Page-
 *     Liste; eine Code-Route kommt dort baulich nie hinein.
 *
 * (4) NICHT VERLINKT — kein Eintrag in Navigation, Footer, Übersicht oder auf
 *     einer indexierten Seite. Ausgehende Links (auf /pages/kritik,
 *     /pages/studien, /pages/superhuman) sind erlaubt und gewollt.
 *
 * WER DIESE SEITE SPÄTER LIVE NIMMT: Disallow raus, noindex raus (dann
 * canonical setzen), Shopify-Page-Objekt `hypothesen` anlegen (Sitemap +
 * Menü-Ziel), Verlinkung setzen. Das ist Christians Entscheidung, nicht unsere.
 *
 * VIDEO-AUSZEICHNUNG, und warum sie hier von Anfang an drin ist: Videos sind
 * die Quellenklasse, die Googles KI-Antwort auf unseren Zweifelsbegriffen mit
 * Abstand am häufigsten zitiert (36 von 66 Zitatzeilen von youtube.com). Die
 * Seite trägt deshalb ein VideoObject-@graph — auch solange sie auf noindex
 * steht: die Auszeichnung ist dann wirkungslos, aber sie ist am Tag der
 * Freischaltung fertig und muss nicht nachgezogen werden. Sie beschreibt
 * ausschließlich FREMDE Videos (Pollack-Vorträge) und behauptet nichts über
 * unser Produkt.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel. Die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout;
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Keine Bereichsgrenze an dieser
 * Route. KEIN Kaufknopf — auf dieser Seite gibt es keinen Kaufweg zu messen.
 *
 * KEIN LOADER: der Inhalt sind committete Datenmodule (app/data/hypothesen.js,
 * app/data/hypothesen-quellen.js). Oxygen läuft am Edge und kann shared-state
 * zur Laufzeit nicht lesen — dieselbe Bauform wie /pages/kritik.
 */
export function links() {
  return [{rel: 'stylesheet', href: hypothesenStyles}];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Blanco – unsere Hypothesen: das Wirkmodell mit Stärken und Schwächen | Qi Blanco'},
  {
    name: 'description',
    content:
      'Das Wirkmodell hinter Qi Blanco, offen gelegt: sechs Hypothesen, je mit dem, was dafür spricht, was dagegen spricht und was sie für unser Produkt nicht bedeuten – mit allen Quellen und ihrer Reichweite.',
  },
  noindexMeta(),
];

/** @type {HeadersFunction} */
export const headers = () => noindexHeader();

/**
 * VideoObject-@graph der eingebetteten Vorträge.
 *
 * `description` ist bewusst die EINORDNUNG aus der Datei (`zeigt`), nicht die
 * YouTube-Beschreibung: was die Maschine zitiert, soll derselbe Satz sein, den
 * ein Mensch auf der Seite liest. Maskierung von `<` wie im Hausmuster
 * (faq-schema.js), damit ein „</script>" im Text den Tag nicht schließt.
 */
function videoJsonLd() {
  const graph = VIDEOS.map((v) => ({
    '@type': 'VideoObject',
    name: v.titel,
    description: v.zeigt,
    uploadDate: v.veroeffentlicht,
    duration: v.dauerIso,
    inLanguage: v.sprache,
    thumbnailUrl: [`https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`],
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.videoId}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    publisher: {'@type': 'Organization', name: v.kanal},
  }));
  return JSON.stringify({'@context': 'https://schema.org', '@graph': graph}).replace(
    /</g,
    '\\u003c',
  );
}

export default function HypothesenRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: videoJsonLd()}}
      />
      <HypothesenSeite />
    </>
  );
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('react-router').HeadersFunction} HeadersFunction */
