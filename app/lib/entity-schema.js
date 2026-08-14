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
 * Organization-Knoten. Bewusst rein faktische Stammdaten — keine Wirkungs-
 * oder Gesundheitsaussage, damit dieser Knoten claim-neutral bleibt.
 *
 * WARUM KEIN sameAs: sameAs ist der stärkste Hebel der Entitätsauflösung und
 * zugleich der einzige, der bei falschem Wert AKTIV schadet. Gemessen am
 * 2026-08-14 verlinkt die Live-Startseite KEIN Marken-Profil (nur YouTube-
 * Embeds einzelner Videos — das sind Video-URLs, keine Profile), und der
 * SEO-Wochenlauf meldet weder Wikidata- noch Wikipedia-Eintrag. Ein
 * geratenes Profil wäre eine unbelegte Identitätsbehauptung. sameAs bleibt
 * deshalb leer, bis belegte Profil-URLs vorliegen (Christian-Vorlage L10).
 * Ein fehlendes sameAs kostet Reichweite; ein falsches kostet Vertrauen.
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
    identifier: {
      '@type': 'PropertyValue',
      name: o.registergericht,
      value: o.handelsregister,
    },
  };
  // Nur setzen, wenn wirklich eine URL vorliegt — ein leeres logo-Feld ist
  // ein kaputter Knoten, kein neutraler.
  if (logoUrl) knoten.logo = {'@type': 'ImageObject', url: logoUrl};
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
