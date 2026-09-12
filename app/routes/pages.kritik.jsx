import {KritikSeite} from '~/components/campaign/KritikSeite';
import kritikStyles from '~/styles/kritik.css?url';
import absichtHinweisStyles from '~/styles/absicht-hinweis.css?url';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {FRAGEN} from '~/data/kritik-vorwuerfe';
import {teilbildTags} from '~/lib/seiten-seo';

const PFAD = '/pages/kritik';

/**
 * /pages/kritik — FREIGESCHALTET, INDEXIERBAR.
 *
 * Gebaut als dunkle Freigabe-Ansicht von 20260910-BAU-zweifelsseiten-live-aber-
 * noindex-und-nicht-im-menue („erstmal nur bauen und live schalten sodass wir
 * es kontrollieren können"). Christian hat sie am 2026-09-11 gelesen und
 * entschieden: „ist schon sehr gut. Live schalten und bei ‚Mehr' einbinden."
 * Freigeschaltet von 20260911-BAU-kritikseite-freischalten-…-s02.
 *
 * WARUM EINE NEUE ROUTE UND NICHT /pages/wirkt-das UMGEBAUT: Christians
 * Entscheidung vom 2026-09-10 lautet „eine eigene Seite JE Zweifelsfrage" —
 * für „Qi Blanco Kritik" also eine Seite, die diese Frage im Namen trägt.
 * /pages/wirkt-das bleibt unangetastet (zurückgezogen, noindex).
 *
 * DIE VIER SPERREN UND WIE SIE GEFALLEN SIND — in dieser Reihenfolge gebaut,
 * weil sie einander bedingen:
 *
 * (1) ROBOTS.TXT: `Disallow: /pages/kritik` ist aus generalDisallowRules in
 *     [robots.txt].jsx ENTFERNT. Diese Sperre muss ZUERST fallen: solange sie
 *     steht, kann Google die Seite nicht abrufen und damit auch kein noindex
 *     lesen — eine Seite, die indexierbar aussieht und unsichtbar bleibt.
 *     Im Quelltext stand die Zeile genau EINMAL, in der Auslieferung viermal
 *     (generalDisallowRules wird aus vier User-agent-Gruppen gerufen). Wer sie
 *     live sucht und „beide Vorkommen" entfernt, lässt zwei stehen.
 *
 * (2) NOINDEX RAUS, CANONICAL REIN — im selben Zug, nie einzeln. Die alte
 *     Fassung trug `noindexMeta()` + `noindexHeader()` und BEWUSST keinen
 *     Canonical („entweder noindex ODER canonical, nie beides"). Die Umkehrung
 *     gilt genauso: eine indexierbare Seite ohne Canonical ist der nächste
 *     Befund. `canonicalLink()` rendert ein echtes `<link rel="canonical">`;
 *     ein `{rel:'canonical'}` ohne `tagName` ergäbe `<meta rel="canonical">`
 *     und wäre wirkungslos (Befund L11, siehe pages.studien.jsx).
 *
 * (3) SITEMAP — ÜBER DEN BESTAND, NICHT ÜBER EIN SHOPIFY-PAGE-OBJEKT. Der
 *     frühere Satz an dieser Stelle („die Sitemap entsteht aus der Shopify-
 *     Page-Liste; eine Code-Route kommt dort baulich nie hinein") war zum
 *     Zeitpunkt seines Schreibens richtig und ist es SEITHER NICHT MEHR:
 *     app/lib/seo.js führt `NUR_ROUTE_SEITEN`, und die Sitemap-Route
 *     `sitemap.$type.$page[.xml].jsx` trägt diese Einträge nach. Diese Seite
 *     steht dort. Ein zusätzliches Shopify-Page-Objekt wäre ein ZWEITER Träger
 *     für dieselbe Seite und ist deshalb bewusst nicht angelegt.
 *
 * (4) VERLINKT von einer indexierten Seite: die FAQ-Antwort zur öffentlichen
 *     Kritik verweist hierher (app/data/faq-seite.js, Feld `weiter`) — genau
 *     der Weg, den der Abgrenzungs-SSoT für die FAQ vorsieht. Der Eintrag im
 *     Menü „Mehr" ist ein Shopify-Admin-Schreibvorgang und kommt aus dem
 *     Folgesegment s03; die Verlinkung hängt nicht daran.
 *
 * TRACKING-NAHT: keine Cookies, kein neuer Identitäts- oder Tracking-Key, kein
 * eigener Pixel. Die R1/R2/R3-Kette hängt pfad-agnostisch im root-Layout;
 * TRACKING_COOKIE_NAMES bleibt unangetastet. Keine Bereichsgrenze an dieser
 * Route. KEIN Kaufknopf — auf dieser Seite gibt es keinen Kaufweg zu messen.
 *
 * KEIN LOADER: der Inhalt ist ein committetes Datenmodul (app/data/kritik-
 * vorwuerfe.js). Oxygen läuft am Edge und kann shared-state zur Laufzeit nicht
 * lesen — dieselbe Bauform wie /pages/erfahrungen und /pages/uebersicht.
 *
 * WACHE: homepage-bauer/pruefungen/probe_zweifelsseite_dunkel.py --flaeche
 * kritik (nachbau-audit h1afce75b). Sie misst am Live-Rand und verzweigt am
 * Feld `status` der SSoT konzepte/abgrenzung-flaechen.json: für diese Flaeche
 * steht dort seit der Freischaltung `live_indexiert`, und die Probe prüft
 * damit die HELL-Arme (Inhalt unverändert, kein Disallow, kein noindex,
 * Canonical vorhanden, in einer Sitemap, verlinkt) statt der Dunkel-Arme.
 * WER DIESE SEITE WIEDER ZURÜCKZIEHT, setzt den Status zurück — die Wache
 * dreht dann von selbst mit, und es ist kein Code zu ändern.
 */
export function links() {
  return [
    {rel: 'stylesheet', href: kritikStyles},
    {rel: 'stylesheet', href: absichtHinweisStyles},
  ];
}

/**
 * DER TITEL BLEIBT, WIE ER IST — er bedient die Suche „Qi Blanco Kritik" und
 * stellt genau die Frage, die der Suchende hat. Das Wort trägt hier und in der
 * H1; im Fließtext der Seite steht es bewusst NICHT mehr (siehe KritikSeite.jsx).
 */
const TITEL = 'Qi Blanco Kritik – was stimmt davon? | Qi Blanco';
const BESCHREIBUNG =
  'Die sieben härtesten Fragen zu Qi Blanco, gerade beantwortet: was gemessen ist, was offen ist – und was du in 20 Tagen selbst prüfen kannst.';

/**
 * SCHEMA-DATEN. `datePublished` ist der Tag der Freischaltung dieser Seite,
 * `dateModified` der Tag ihrer letzten inhaltlichen Änderung — BEIDE sind
 * Konstanten und KEINE Laufzeit-Uhr: ein `dateModified`, das sich bei jedem
 * Abruf bewegt, behauptet eine Pflege, die nicht stattfindet. WER DEN INHALT
 * DIESER SEITE ÄNDERT, ZIEHT `KRITIK_GEAENDERT` IM SELBEN COMMIT NACH.
 */
const KRITIK_VEROEFFENTLICHT = '2026-09-11';
const KRITIK_GEAENDERT = '2026-09-11';

/**
 * DAS FAQPage-SCHEMA kommt aus app/lib/faq-schema.js (P10: die Fabrik
 * existiert samt Deny-Netz) und wird AUS DEM SICHTBAREN TEXT gebaut — Frage und
 * Antwort sind dieselben Strings, die die Komponente rendert. Eine Frage im
 * Schema, die auf der Seite nicht steht, wäre ein Regelverstoß; deshalb gibt es
 * hier keine eigene Schema-Textfassung.
 *
 * DER STILLE VERLUST IST DER TEURE FALL: `buildFaqPageJsonLd` wirft Items aus,
 * die das Deny-Netz treffen (z. B. das Wort „kohärent"), und liefert dann
 * einfach ein kürzeres Schema — die Seite bliebe sichtbar und würde nur für
 * Google ärmer, ohne Fehlermeldung. Am 2026-09-11 passieren alle 7 Fragen das
 * Netz; homepage-bauer/bin/probe_kritik_eigene_worte.py hält mit einem
 * Soll-Zähler von 7 Question-Einträgen dagegen.
 */
const schemaItems = () =>
  FRAGEN.map((f) => ({q: f.frage, a: [f.kurz, ...f.antwort].join(' ')}));

/** @type {MetaFunction} */
export const meta = () => {
  const schema = buildFaqPageJsonLd(schemaItems(), {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
    datePublished: KRITIK_VEROEFFENTLICHT,
    dateModified: KRITIK_GEAENDERT,
  });
  return [
    {title: TITEL},
    {name: 'description', content: BESCHREIBUNG},
    canonicalLink(PFAD),
    ...teilbildTags(PFAD),
    {property: 'og:type', content: 'website'},
    {property: 'og:title', content: TITEL},
    {property: 'og:description', content: BESCHREIBUNG},
    {property: 'og:url', content: absoluteCanonical(PFAD)},
    ...(schema ? [{'script:ld+json': schema}] : []),
  ];
};

export default function KritikRoute() {
  return <KritikSeite />;
}

/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
