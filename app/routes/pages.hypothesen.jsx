import {HypothesenSeite} from '~/components/campaign/HypothesenSeite';
import hypothesenStyles from '~/styles/hypothesen.css?url';
import absichtStyles from '~/styles/absicht.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {VIDEOS} from '~/data/hypothesen-quellen';
import {ABSENDER} from '~/data/absicht';

/**
 * /pages/hypothesen — LIVE UND INDEXIERBAR seit 2026-09-12.
 *
 * Auftrag: 20260911-BAU-pages-hypothesen (Christian, 2026-09-11, wörtlich: „Sowas wie ‚Qi Blanco – unsere
 * Hypothesen‘ und dann das ganze Wirkmodell von Qi Blanco einstellen, so wie
 * wir es erarbeitet haben, mit Stärken und Schwächen. Aber noch nicht crawlbar
 * machen — mir zeigen, wenn es live ist. Und sehr viele Quellen einstellen.
 * Dann als /pages/hypothesen einbinden.").
 *
 * CHRISTIAN HAT SIE GELESEN UND FREIGEGEBEN, wörtlich am 2026-09-12: „Ja,
 * ansonsten kannst du das hier veröffentlichen, das liest sich gut." Damit ist
 * die verabredete Reihenfolge zu Ende gegangen — erst live, dann prüfen, dann
 * freigeben — und ALLE VIER Sperren des Ursprungsbaus sind aufgehoben. Die
 * folgende Auflistung beschreibt, was sie WAREN und wie jede einzelne
 * zurückgenommen wurde; sie bleibt stehen, weil sie der Rückweg ist.
 *
 * (1) NOINDEX im HTML-head UND als X-Robots-Tag („Gurt und Hosenträger").
 *     BEIDE SIND RAUS; an ihre Stelle tritt der `canonical`. Nie beides
 *     zugleich: ein Bot, der einem Canonical folgt, kann ein noindex der
 *     Zielseite zuordnen. Deshalb trug diese Route bis heute bewusst KEINEN
 *     Canonical und trägt jetzt ihn und kein noindex.
 *
 * (2) ROBOTS.TXT: `Disallow: /pages/hypothesen` in `generalDisallowRules`
 *     ([robots.txt].jsx) — EINE Quellzeile, die live VIER Mal erscheint, weil
 *     vier User-agent-Gruppen sie rufen. SIE IST RAUS, und sie ist ZUERST
 *     raus: ein Bot, den Disallow aussperrt, kann ein noindex gar nicht erst
 *     LESEN. Fiele das noindex zuerst, bliebe die Seite unsichtbar und sähe
 *     dabei indexierbar aus. Hier fallen beide im selben Deploy, womit die
 *     Reihenfolge gegenstandslos ist — die Regel gilt für getrennte Deploys.
 *
 * (3) SITEMAP: nachgetragen über `NUR_ROUTE_SEITEN` in app/lib/seo.js — die
 *     ZWEITE Bauform für Seiten ohne Shopify-Seitenobjekt. Der Satz der
 *     Erstfassung („eine Code-Route kommt baulich nie in die Sitemap, also
 *     braucht es ein Shopify-Page-Objekt") ist damit ÜBERHOLT: die Liste gibt
 *     es seit dem Quellen-Bau, und /pages/kritik, /pages/erfahrungen und
 *     /pages/warum-qi-blanco stehen bereits darin. Es wird ausdrücklich KEIN
 *     Shopify-Page-Objekt angelegt — das wäre ein zweiter Träger für dieselbe
 *     Seite und ein Schreibzugriff ins Fremdsystem.
 *
 * (4) VERLINKUNG: /pages/warum-qi-blanco verweist jetzt hierher. Genau dieser
 *     Verweis war bis heute VERBOTEN und in drei Dateien als Sperre
 *     festgehalten (AbsichtSeite.jsx, abgrenzung-flaechen.json Feld
 *     `nicht_verlinkt`, probe_absicht_naht.py Arm N3) — er hätte die vierte
 *     Sperre von der indexierten Seite her aufgebrochen. Mit der Freigabe ist
 *     er die sachlich nächstliegende Verlinkung: die Absicht sagt selbst
 *     „deshalb legen wir unsere Annahmen offen", und hier liegen sie. Die
 *     Gegenrichtung (Hypothesen -> Absicht) bestand schon und bleibt.
 *
 * WER DIESE SEITE WIEDER SPERRT, geht den Weg rückwärts: zuerst das Disallow
 * rein UND das noindex in diese Route, den Canonical raus, den Sitemap-Eintrag
 * raus, den Verweis auf AbsichtSeite.jsx raus — und dreht den `status` in
 * homepage-bauer/konzepte/abgrenzung-flaechen.json zurück. DER STATUS IST DER
 * SCHALTER: probe_hypothesen_noindex.py, probe_zweifelsseite_dunkel.py und
 * probe_absicht_naht.py lesen ihn alle drei und drehen sich mit ihm. Wer die
 * Sperre hier von Hand wiederherstellt und den Status vergisst, hat drei
 * Wachen gegen sich, die weiterhin den freien Zustand einfordern.
 *
 * VIDEO-AUSZEICHNUNG, von Anfang an drin und ab heute wirksam: Videos sind
 * die Quellenklasse, die Googles KI-Antwort auf unseren Zweifelsbegriffen mit
 * Abstand am häufigsten zitiert (36 von 66 Zitatzeilen von youtube.com). Die
 * Seite trägt deshalb ein VideoObject-@graph — sie trug es schon, solange sie
 * auf noindex stand, damit es am Tag der Freischaltung fertig ist und nicht
 * nachgezogen werden muss. Dieser Tag ist der 2026-09-12. Sie beschreibt
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
const PFAD = '/pages/hypothesen';

export function links() {
  // absicht.css liefert das Token-System des Absichts-Abschnitts (Scope .ab).
  // Es wird mitgeladen statt kopiert, damit Abschnitt und eigene Seite
  // baulich dieselbe Gestalt haben und nicht auseinanderlaufen.
  return [
    {rel: 'stylesheet', href: hypothesenStyles},
    {rel: 'stylesheet', href: absichtStyles},
  ];
}

/** @type {MetaFunction} */
export const meta = () => [
  {title: 'Qi Blanco – unsere Hypothesen: das Wirkmodell mit Stärken und Schwächen | Qi Blanco'},
  {
    name: 'description',
    content:
      'Das Wirkmodell hinter Qi Blanco, offen gelegt: sechs Hypothesen, je mit dem, was dafür spricht, was dagegen spricht und was sie für unser Produkt nicht bedeuten – mit allen Quellen und ihrer Reichweite.',
  },
  // Die Autorenangabe. Sie stand hier schon, als die Seite noch auf noindex
  // stand — damit sie am Tag der Freischaltung fertig ist. Ein Text mit Autor
  // ist eine Quelle, einer ohne ist Werbematerial; genau daran scheitert
  // unsere heutige Sichtbarkeit.
  {name: 'author', content: ABSENDER.name},
  // Der Canonical ist an die Stelle des noindex getreten (Freigabe
  // 2026-09-12). Er steht NIE neben einem noindex — siehe (1) im Kopf.
  canonicalLink(PFAD),
  {property: 'og:type', content: 'article'},
  {property: 'og:site_name', content: 'Qi Blanco'},
  {property: 'og:locale', content: 'de_DE'},
  {property: 'og:url', content: absoluteCanonical(PFAD)},
];

// KEIN `headers`-Export mehr: er trug ausschliesslich den X-Robots-Tag
// (noindexHeader). Ein leerer Header-Export waere kein Rueckweg, sondern eine
// Attrappe — der Rueckweg steht als Anleitung im Kopf dieser Datei.

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
