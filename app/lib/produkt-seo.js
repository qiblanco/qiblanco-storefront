/**
 * Meta-Beschreibungen und Open-Graph-Signale der Produktseiten (DACH).
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js
 * und app/lib/entity-schema.js).
 *
 * WARUM ES DIESE DATEI GIBT (Befund SEO-2026-W33 L6/L3, am 2026-08-14 an der
 * Live-Auslieferung nachgemessen): alle sieben Produktrouten trugen einen
 * korrekten Canonical, aber KEINE `meta description` und NULL og-Tags. Für
 * eine Suchmaschine heisst das: sie reimt sich das Snippet aus dem Seitentext
 * selbst zusammen; für jedes soziale Netzwerk heisst es, dass es beim Teilen
 * selbst entscheidet, was erscheint. Das sind die Umsatzseiten — die Stelle,
 * an der ein zusammengereimtes Snippet am teuersten ist.
 *
 * WARUM NEBEN app/lib/seo.js UND NICHT DARIN:
 * seo.js liefert die Canonical-Bausteine und wird ausserdem von
 * pages.support/impressum/agb/datenschutz/teilnahmebedingungen importiert.
 * `support` hat einen etablierten Formate-Beleg-Ordner, und hb-deploy Gate 12
 * blockt im Modus FORMATE_GATE_REICHWEITE=beleg genau für solche Seiten. Eine
 * Änderung an seo.js würde diese fremden, völlig unbeteiligten Seiten in die
 * Prüfmenge ziehen. Diese Datei wird ausschliesslich von den Produktrouten
 * importiert; ihre Import-Closure sind damit die Produktseiten selbst.
 *
 * WER SIE VON EINER FREMDEN ROUTE IMPORTIERT, ZIEHT DEREN SEITE IN DIE
 * CLOSURE. Das ist gewollt und der Grund, warum hier kein Sammel-Helper
 * entstehen soll.
 *
 * ZUR SPRACHE DER TEXTE — das ist ein Chesterton-Zaun, keine Stilfrage:
 * Die Live-Produktseiten formulieren durchgehend "reduziert die Auswirkungen
 * von E-Smog" und "unterstützt ein Umfeld, das ... ermöglicht" — also über
 * das UMFELD, nie als Wirkzusage am Körper. Diese Bauweise ist der
 * Claim-Korridor (HWG §3/§11), und die Beschreibungen hier übernehmen sie
 * wörtlich statt sie zu "verbessern". Bei den Kakao-Sorten gilt zusätzlich
 * die Health-Claims-Verordnung (EU 1924/2006): dort steht bewusst NUR
 * Produktbeschaffenheit (Bio-Zertifikat, Sortenprofil, Geschmack) und KEINE
 * gesundheitsbezogene Angabe — der L-Tryptophan-/Theobromin-Gehalt der
 * Seite ist eine Nährwertangabe und trägt keinen zugelassenen Claim.
 *
 * KUNDENSPRACHE (SSoT kaufueberzeugung/kanon): Einstieg mit dem Wort des
 * Kunden — Schutz, E-Smog, Strahlung, Raum. NICHT mit "kohärentes Wasser":
 * dieser Begriff stammt aus unserem Marketing und wird von Kunden nur
 * zurückgespiegelt, wenn wir ihn zuerst benutzt haben.
 */

// Bewusst RELATIV statt über den '~'-Alias: der Alias wird nur von Vite
// aufgelöst, nicht von Node. Der hermetische Test (node --test, ohne Bundler)
// könnte diese Datei sonst gar nicht laden.
import {absoluteCanonical} from './seo.js';

/**
 * Beschreibung je Produktpfad.
 *
 * Der Schlüssel ist exakt der Pfad, der auch an canonicalLink() geht — so kann
 * eine Route nicht versehentlich die Beschreibung einer anderen ziehen.
 *
 * NICHT enthalten ist `/products/zeremonie-kakao`: diese URL antwortet live
 * mit HTTP 301 auf /products/crystal-cacao-create (am 2026-08-14 gemessen).
 * Eine Beschreibung dort wäre wirkungslos, weil die Seite nie ausgeliefert
 * wird — sie zu setzen würde einen Vollzug vortäuschen, den es nicht gibt.
 */
export const PRODUKT_BESCHREIBUNGEN = {
  '/products/qione-2-pro':
    'E-Smog ist überall, wo du bist — der QiOne® 2 Pro auch. Sein Gitterchip™ ' +
    'reduziert die Auswirkungen und unterstützt ein Umfeld aus Klarheit und Fokus.',
  '/products/qibracelet':
    'Schutz, den man nicht sieht: Der QiBracelet® reduziert mit integriertem ' +
    'Gitterchip™ die Auswirkungen von E-Smog und 5G — elegant am Handgelenk.',
  '/products/qihome-air':
    'Ein Gitterchip™ für den ganzen Raum: Das QiHome® Air deckt bis zu 300 m² ab ' +
    'und schafft eine harmonische Atmosphäre — ideal für Schlafzimmer und Büro.',
  '/products/qione-kette':
    'Die passende Kette für deinen QiOne® 2 Pro: hochwertig verarbeitet und ' +
    'angenehm zu tragen, damit dein Anhänger überall dabei ist.',
  '/products/crystal-cacao-awake':
    'Crystal Cacao® Awake: Zeremonie-Kakao in Bio-Qualität (DE-ÖKO-006), sanft ' +
    'im Sortenprofil und vollmundig im Geschmack. Für deine besondere Kakao-Zeit.',
  '/products/crystal-cacao-create':
    'Crystal Cacao® Create: Zeremonie-Kakao in Bio-Qualität (DE-ÖKO-006) mit dem ' +
    'kräftigsten Sortenprofil — intensiv und vollmundig im Geschmack.',
};

/**
 * Die Beschreibung eines Produktpfads. Unbekannter Pfad -> undefined, damit
 * der Aufrufer den Descriptor weglassen kann statt einen leeren zu rendern:
 * ein leeres `content` ist für eine Suchmaschine schlechter als gar keins,
 * weil es eine gepflegte Angabe vortäuscht.
 * @param {string} pfad
 * @returns {string|undefined}
 */
export function produktBeschreibung(pfad) {
  return PRODUKT_BESCHREIBUNGEN[pfad];
}

/**
 * Vollständige meta-Descriptor-Liste einer Produktroute: Titel, Beschreibung,
 * Canonical und Open Graph in EINEM Aufruf.
 *
 * Bewusst hier gebündelt statt in jeder Route einzeln aufgezählt: sonst
 * driften die Routen auseinander, und genau diese Drift war der Ausgangs-
 * befund (jede Route trug ihren Canonical, keine eine Beschreibung).
 *
 * @param {{pfad: string, titel: string, bildUrl?: string}} args
 * @returns {Array<object>} meta-Descriptoren für react-router 7
 */
export function produktMeta({pfad, titel, bildUrl}) {
  const beschreibung = produktBeschreibung(pfad);
  const url = absoluteCanonical(pfad);
  const descriptoren = [
    {title: titel},
    // Canonical als echtes <link> (tagName) und absolut — Begründung im Kopf
    // von app/lib/seo.js. Hier NICHT über canonicalLink(), weil derselbe
    // absoluteCanonical()-Wert unten auch als og:url gebraucht wird und zwei
    // getrennte Aufrufe auseinanderlaufen könnten.
    {tagName: 'link', rel: 'canonical', href: url},
    {property: 'og:type', content: 'product'},
    {property: 'og:site_name', content: 'Qi Blanco'},
    {property: 'og:locale', content: 'de_DE'},
    {property: 'og:title', content: titel},
    {property: 'og:url', content: url},
  ];
  if (beschreibung) {
    // Die Beschreibung steht an ZWEI Stellen (name=description und
    // og:description) und muss identisch sein: ein Netzwerk, das beim Teilen
    // etwas anderes zeigt als die Suchmaschine, erzeugt zwei Versprechen.
    descriptoren.splice(1, 0, {name: 'description', content: beschreibung});
    descriptoren.push({property: 'og:description', content: beschreibung});
  }
  if (bildUrl) {
    descriptoren.push({property: 'og:image', content: bildUrl});
  }
  return descriptoren;
}
