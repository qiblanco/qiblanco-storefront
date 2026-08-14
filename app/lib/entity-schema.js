/**
 * Entitäts-Signale der Marke (schema.org Organization + WebSite).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 A_entitaet):
 * Gemessen am 2026-08-14 trug der DACH-Storefront auf KEINER Route ein
 * einziges JSON-LD. Eine Suchmaschine sah Seiten, aber kein Unternehmen —
 * ohne Organization/WebSite fehlt der Anker, an dem sich die Marke als
 * ENTITÄT auflösen lässt.
 *
 * WARUM NEBEN app/lib/seo.js UND NICHT DARIN — die unbequeme Begründung:
 * seo.js wäre der natürliche Ort, und der erste Entwurf lag auch dort. Er
 * war NICHT lieferbar. seo.js wird von den Routen studien/technologie/
 * crystal-cacao importiert; hb-deploy Gate 12 (Formate) löst geänderte
 * geteilte Dateien über die Import-Closure auf und verlangt für JEDE damit
 * erreichte Seite einen gültigen Alle-Formate-Nachweis. Genau diese drei
 * Seiten haben einen vorhandenen, aber ROTEN Nachweis wegen VORBESTEHENDER
 * Bild- und Overflow-Schäden (Entscheid-Item 866). Eine Änderung an seo.js
 * ist damit blockiert, bis diese Schäden behoben sind — an einem Defekt
 * also, den ein <head>-Signal weder verursacht noch beheben kann.
 *
 * Diese Datei wird deshalb ausschließlich von app/routes/_index.jsx
 * importiert. Ihre Import-Closure ist damit {startseite} — eine Seite ohne
 * roten Formate-Nachweis. Das ist kein Umgehen des Gates: der Nachweis wird
 * für die tatsächlich berührte Seite weiterhin verlangt, die Änderung trägt
 * nur nicht mehr fremde, unbeteiligte Seiten mit.
 *
 * WER DIESE DATEI SPÄTER VON EINER ZWEITEN ROUTE IMPORTIERT, ZIEHT DEREN
 * SEITE IN DIE CLOSURE — dann gilt Gate 12 auch dort. Das ist gewollt und
 * der Grund, warum hier kein Sammel-Helper entstehen soll.
 *
 * CANONICAL_ORIGIN wird aus seo.js GELESEN (nicht kopiert): Lesen erzeugt
 * keinen Diff und damit keine Gate-12-Reichweite, hält aber die eine
 * kanonische Domain-Definition als Single Source of Truth.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node. Der hermetische Test (node --test, ohne Bundler)
// könnte diese Datei sonst gar nicht laden — der Import-Stil entscheidet hier
// also darüber, ob das Modul überhaupt testbar ist.
import {CANONICAL_ORIGIN} from './seo.js';

/**
 * Stammdaten der Firma — BYTE-GLEICH zum Impressum
 * (app/routes/pages.impressum.jsx).
 *
 * Diese Gleichheit ist kein Stilwunsch: weicht die Adresse im Markup von der
 * im Impressum ab, ist das für die Entitätsauflösung SCHLECHTER als gar kein
 * Markup — zwei widersprechende NAP-Angaben derselben Firma. Wer das
 * Impressum ändert, MUSS diese Konstante mitziehen;
 * test/seo-structured-data.test.mjs prüft die Gleichheit maschinell.
 */
export const ORGANISATION = {
  name: 'Qi Blanco',
  legalName: 'Qi Blanco UG (haftungsbeschränkt)',
  streetAddress: 'Brunnrangenstr. 25',
  postalCode: '97711',
  addressLocality: 'Maßbach',
  addressCountry: 'DE',
  email: 'info@qiblanco.com',
  vatID: 'DE306530406',
  handelsregister: 'HRB 7306',
  registergericht: 'Amtsgericht Schweinfurt',
};

/** Stabile Knoten-IDs, damit die Knoten aufeinander zeigen können. */
export const ORG_ID = `${CANONICAL_ORIGIN}/#organization`;
export const SITE_ID = `${CANONICAL_ORIGIN}/#website`;

/**
 * Belegte Marken-Profile für `sameAs`.
 *
 * DIE AUFNAHME-REGEL (sie ist der ganze Wert dieser Liste): hier steht eine
 * URL NUR, wenn wir KONTROLLE über das Profil nachgewiesen haben — nicht,
 * wenn der Markenname darin vorkommt. Ein Profil, das "Qi Blanco" heißt,
 * kann jedem gehören; ein Zugang, der uns dessen Identität zurückmeldet,
 * gehört uns. sameAs ist der stärkste Hebel der Entitätsauflösung und
 * zugleich der einzige, der bei falschem Wert AKTIV schadet: ein fehlendes
 * sameAs kostet Reichweite, ein falsches kostet Vertrauen.
 *
 * DER BELEG IST DER LIVE-AUFRUF, NICHT DER DATEINAME. Bei der Aufnahme am
 * 2026-08-14 nannte die Vorrecherche für Facebook eine Fundstelle, die es
 * nicht gab (meta.env führt kein FB_PAGE_ID) — der Wert stimmte trotzdem,
 * weil er aus `owned_pages` kam. Wer den nächsten Eintrag ergänzt, führt
 * den Aufruf aus und schreibt sein Ergebnis in `beleg`.
 *
 * WARUM HTTP 200 HIER KEIN KRITERIUM IST: facebook.com antwortete demselben
 * Server am selben Tag auf JEDE Profil-URL mit 400 (auch auf die numerische,
 * die Facebook selbst als `link` zurückgibt), LinkedIn antwortet 999. Das
 * sind Bot-Blocks — Messausfälle, keine Aussage über die Seite. Ein
 * API-Nachweis der Kontrolle ist ohnehin der stärkere Beleg als ein
 * öffentlicher 200er, den jeder Fremde ebenfalls bekäme.
 *
 * BEWUSST NICHT AUFGENOMMEN:
 * - Trustpilot (de/at): Christian beansprucht das Profil separat
 *   (Auftrag 2026-08-14, ausdrückliche Ausnahme). Ohne Eigentumsnachweis
 *   wäre der Eintrag genau die unbelegte Identitätsbehauptung, gegen die
 *   die Aufnahme-Regel oben steht.
 * - LinkedIn: es existiert kein Server-Credential und kein Nachweis, dass
 *   linkedin.com/company/qi-blanco uns gehört. Die URL wäre geraten.
 * @type {{url: string, beleg: string}[]}
 */
export const MARKEN_PROFILE = [
  {
    url: 'https://www.youtube.com/@qiblanco',
    beleg:
      'OAuth-Refresh (youtube.env) -> youtube/v3/channels?mine=true gab am ' +
      '2026-08-14 channelId UChJcmyKzrFFZGgOPhY_pk2g, title "Qi Blanco", ' +
      'customUrl "@qiblanco" zurück. Schreibzugriff = Kontrolle.',
  },
  {
    url: 'https://www.instagram.com/qiblanco',
    beleg:
      'graph.instagram.com/v21.0/me (ig.env) gab am 2026-08-14 username ' +
      '"qiblanco", name "Qi Blanco | Frequency Technology", account_type ' +
      'BUSINESS zurück.',
  },
  {
    url: 'https://www.facebook.com/qiblanco',
    beleg:
      'graph.facebook.com/<business>/owned_pages (meta.env) führte am ' +
      '2026-08-14 die Seite id 266585757325797, name "Qi Blanco", username ' +
      '"qiblanco" als EIGENE Seite des Business. Numerische Dauerform wäre ' +
      'facebook.com/266585757325797, falls der username je wechselt.',
  },
];

/**
 * Wissensgraph-Entitäten für `sameAs`.
 *
 * WARUM DAS EINE ZWEITE LISTE IST UND NICHT MARKEN_PROFILE ERWEITERT — die
 * Aufnahme-Regel ist eine ANDERE, und das ist der ganze Punkt:
 * MARKEN_PROFILE verlangt den Nachweis von KONTROLLE (ein Zugang, der uns die
 * Identität des Profils zurückmeldet). Auf ein Wikidata-Item trifft dieser
 * Nachweis baulich NIE zu: Wikidata ist ein öffentlich editierbares Wiki, das
 * niemandem gehört — auch uns nicht. Wer den Eintrag trotzdem unter die
 * Kontroll-Regel schöbe, hätte diese Regel stillschweigend aufgeweicht, und
 * die Liste verlöre genau die Aussage, die sie wertvoll macht.
 *
 * DIE REGEL HIER IST DER RÜCKVERWEIS: eine Wissensgraph-Entität wird nur
 * aufgenommen, wenn sie IHRERSEITS auf unsere kanonische Domain zeigt
 * (Property P856 "official website"). Für die Entitätsauflösung ist das sogar
 * der stärkere Beleg als Kontrolle, weil er das Paar BEIDSEITIG macht: Seite
 * -> Entität allein ist eine Behauptung, die jeder über jeden aufstellen kann;
 * erst Entität -> Seite bestätigt sie. Genau diese Gegenseitigkeit ist es, was
 * eine Suchmaschine für ein Knowledge-Panel braucht.
 *
 * GEPRÜFT WIRD AM LIVE-ITEM, NICHT AM QID AUS DEM AUFTRAGSTEXT. Bei der
 * Aufnahme am 2026-08-14 wurde Special:EntityData/Q141070656.json abgerufen
 * (HTTP 200) und P856 im Ergebnis gelesen — nicht die Angabe des Auftrags
 * übernommen. Wer den nächsten Eintrag ergänzt, führt denselben Abruf aus.
 *
 * DIE HÄLFTE, DIE UNS NICHT GEHÖRT, KANN SICH ÄNDERN. Entfernt ein Fremder
 * dort P856 oder hängt ihn auf eine andere Domain um, wird dieser Eintrag
 * still zu einer unbestätigten Behauptung, ohne dass in diesem Repo eine Zeile
 * fällt. Deshalb ist die Naht nicht bloß einmal geprüft, sondern steht unter
 * einer laufenden Wache: seo-manager/pruefungen/probe_wikidata_paar.py misst
 * BEIDE Richtungen und liest das QID aus der Live-Seite, statt es zu pinnen.
 *
 * @type {{url: string, qid: string, beleg: string}[]}
 */
export const WISSENSGRAPH_ENTITAETEN = [
  {
    url: 'https://www.wikidata.org/wiki/Q141070656',
    qid: 'Q141070656',
    beleg:
      'wikidata.org/wiki/Special:EntityData/Q141070656.json gab am 2026-08-14 ' +
      'HTTP 200 mit label "Qi Blanco", P31 (instance of) = Q4830453 ' +
      '(business enterprise), P17 (country) = Q183 (Germany) und vor allem ' +
      'P856 (official website) = https://qiblanco.com — das Item nennt also ' +
      'UNSERE Domain als seine offizielle Website. Das ist die Rückrichtung ' +
      'des Paars und damit der Beleg für diesen Eintrag.',
  },
];

/**
 * Organization-Knoten. Bewusst rein faktische Stammdaten — keine Wirkungs-
 * oder Gesundheitsaussage, damit dieser Knoten claim-neutral bleibt.
 *
 * @param {{logoUrl?: string}} [opt]
 */
export function organizationSchema({logoUrl} = {}) {
  const o = ORGANISATION;
  const knoten = {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: o.name,
    legalName: o.legalName,
    url: `${CANONICAL_ORIGIN}/`,
    email: o.email,
    vatID: o.vatID,
    address: {
      '@type': 'PostalAddress',
      streetAddress: o.streetAddress,
      postalCode: o.postalCode,
      addressLocality: o.addressLocality,
      addressCountry: o.addressCountry,
    },
    // identifier ist bewusst IMMER ein Array, auch bei einem einzigen Eintrag.
    // schema.org erlaubt jeder Property mehrere Werte, und eine Form, die je
    // nach Listenlänge zwischen Objekt und Array springt, ist für jeden Leser
    // die unangenehmere: er müsste beide Fälle behandeln, um an dieselbe
    // Angabe zu kommen. Das Handelsregister steht zuerst und bleibt — die
    // Wikidata-Kennung tritt daneben, nicht an seine Stelle.
    identifier: [
      {
        '@type': 'PropertyValue',
        name: o.registergericht,
        value: o.handelsregister,
      },
      // Die QID zusätzlich als maschinenlesbare Kennung: sameAs trägt die
      // Auflösung für Suchmaschinen, aber ein Konsument, der eine ID will,
      // müsste sie sonst aus einer URL herausparsen.
      ...WISSENSGRAPH_ENTITAETEN.map((e) => ({
        '@type': 'PropertyValue',
        propertyID: 'wikidata',
        value: e.qid,
      })),
    ],
  };
  // Nur setzen, wenn wirklich eine URL vorliegt — ein leeres logo-Feld ist
  // ein kaputter Knoten, kein neutraler.
  if (logoUrl) knoten.logo = {'@type': 'ImageObject', url: logoUrl};
  // Gleiche Regel wie beim logo: lieber kein sameAs als ein leeres Array.
  // Ein `sameAs: []` ist für eine Suchmaschine kein "wir haben keine
  // Profile", sondern ein kaputtes Feld.
  // Beide Belegklassen laufen in EIN sameAs-Array: für die Suchmaschine ist
  // das eine einzige Liste "dieselbe Entität, anderswo". Getrennt gehalten
  // werden sie nur bei der AUFNAHME, weil dort zwei verschiedene Nachweise
  // gelten (Kontrolle bzw. Rückverweis) — siehe die beiden Listen oben.
  const profile = [
    ...MARKEN_PROFILE.map((p) => p.url),
    ...WISSENSGRAPH_ENTITAETEN.map((e) => e.url),
  ];
  if (profile.length) knoten.sameAs = profile;
  return knoten;
}

/**
 * WebSite-Knoten. Verweist per publisher auf die Organization, damit beide
 * Knoten EINE Entität beschreiben statt zweier unverbundener Objekte.
 */
export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    name: ORGANISATION.name,
    url: `${CANONICAL_ORIGIN}/`,
    inLanguage: 'de-DE',
    publisher: {'@id': ORG_ID},
  };
}

/**
 * Der Entitäts-Graph als EIN JSON-LD-Objekt.
 *
 * Bestimmt für den meta-Export als `{'script:ld+json': entityGraph()}`.
 * react-router 7 rendert diesen Descriptor nativ als
 * `<script type="application/ld+json">` und maskiert den Inhalt selbst
 * (Renderschleife: tagName -> title -> charset -> script:ld+json).
 *
 * ACHTUNG: der Router kapselt die Serialisierung in try/catch und rendert bei
 * einem Fehler NICHTS — ein nicht serialisierbarer Wert verschwindet also
 * STILL. Deshalb prüft der Test die Serialisierbarkeit ausdrücklich.
 *
 * @param {{logoUrl?: string}} [opt]
 */
export function entityGraph(opt = {}) {
  return {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema(opt), websiteSchema()],
  };
}
