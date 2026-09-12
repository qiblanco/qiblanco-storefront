/**
 * Zufriedenheits-Auszeichnung — die Google-Bewertung der MARKE als das
 * maschinenlesbar machen, was sie belegbar ist.
 *
 * Reine Datenfabrik ohne React-Import (Node-unit-testbar, wie app/lib/seo.js,
 * app/lib/entity-schema.js und app/lib/faq-schema.js).
 *
 * DER BEFUND, DER DIESES MODUL AUSLOEST (live gemessen 2026-09-12 am
 * ausgelieferten HTML von qiblanco.com): die fünf DACH-Produktseiten tragen
 * vier `ld+json`-Bloecke (Product, Offer, BreadcrumbList, FAQPage, VideoObject)
 * und darin KEINE einzige Zufriedenheitsangabe — waehrend auf derselben Seite
 * sichtbar „4,8 von 5 Sternen aus 440 Google-Rezensionen von Qi Blanco" steht.
 * Ein Mensch sieht die Zufriedenheit, eine Maschine findet sie nicht und nimmt,
 * was sie sonst findet.
 *
 * ================================================================
 * WAS HIER BEWUSST NICHT ENTSTEHT — `Product/aggregateRating`
 * ================================================================
 * Das ist das Feld, das man an dieser Stelle reflexhaft setzt, und es wäre
 * hier falsch. Die 4,8 aus 440 Stimmen sind GOOGLE-BUSINESS-Bewertungen über
 * das UNTERNEHMEN Qi Blanco (Quelle: Reputon-Feed des Business-Profils, siehe
 * app/lib/googleRating.js) — KEINE Bewertungen des QiOne 2 Pro. Sie an ein
 * Product zu hängen hiesse, eine Bewertung mit dem FALSCHEN SUBJEKT
 * auszuzeichnen: geborgte Sternewerte sind ein Verstoß gegen Googles
 * Richtlinien für strukturierte Daten und können manuelle Maßnahmen für
 * die GANZE Domain auslösen. app/lib/produkt-schema.js lässt das Feld seit
 * 2026-08-15 aus genau diesem Grund leer; diese Datei nimmt ihm die
 * Entscheidung nicht ab, sondern setzt sie fort — der korrekte Ort für eine
 * Händlerbewertung ist die Organization.
 *
 * Eine produktscharfe Bewertung bleibt damit offen (Entscheidung E1, Konzept
 * „Händlerbewertungen/Produktbewertungen", Stand 2026-08-15 unentschieden).
 * Wer sie später erhebt, baut sie in produkt-schema.js — nicht hier.
 *
 * ================================================================
 * WAS DIESER KNOTEN EHRLICHERWEISE NICHT BRINGT
 * ================================================================
 * KEINE STERNCHEN IM SUCHERGEBNIS, und das ist kein Mangel, sondern der
 * erwartete Zustand: Google spielt Rezensions-Sternchen für die EIGENE
 * Organisation auf der EIGENEN Domain seit 2019 ausdrücklich nicht aus
 * („self-serving reviews", Begründung ausfuehrlich in
 * app/lib/erfahrungen-schema.js). Wer hier ein Rich Result erwartet, wird
 * enttäuscht — und würde als nächstes auf die Idee kommen, den Wert ans
 * Product zu hängen, wo er ausgespielt WÜRDE. Genau dieser Weg ist oben
 * verschlossen.
 *
 * DER ADRESSAT IST EIN ANDERER: ein KI-Antwortsystem wendet Googles
 * Rich-Result-Zulassungspolitik nicht an, es liest Text und JSON-LD. „Kein
 * Sternchen im Suchergebnis" und „für eine Maschine unlesbar" sind zwei
 * verschiedene Aussagen; nur die zweite behebt dieser Knoten.
 *
 * UND AUCH DAS GEHÖRT HIERHER, damit niemand mehr erwartet, als der Knoten
 * einlöst: Googles eigene Reputations-Anweisung (General Guidelines 3.3.1)
 * sagt „Look for information written by a person or organization, not
 * statistics or other machine-compiled information". Ein aggregierter
 * Sternewert IST maschinell zusammengestellte Statistik — er zählt für
 * Googles Reputationsurteil also gar nicht. Dieser Knoten ist deshalb KEIN
 * Zitierfaehigkeits-Hebel und darf nicht als einer verkauft werden. Er macht
 * eine vorhandene, sichtbare Tatsache maschinell auffindbar; mehr sagt er
 * nicht zu.
 *
 * ================================================================
 * DIE ZAHL IST NIE EIN LITERAL — das ist die tragende Bauregel
 * ================================================================
 * Für dieselbe Größe standen am 2026-09-12 drei Zahlen im Haus: live 440
 * (Reputon), 439 (Messung vom selben Vormittag) und 438
 * (GOOGLE_RATING_FALLBACK). Alle drei waren zu ihrem Zeitpunkt richtig. Ein
 * hier eingetragener Wert wäre deshalb binnen Tagen falsch — und ein Markup,
 * das eine ANDERE Zahl nennt als die Seite anzeigt, ist genau der
 * Richtlinienverstoss, den produkt-schema.js seit der Preis-Brutto-Korrektur
 * vermeidet.
 *
 * Deshalb nimmt diese Funktion den Wert als ARGUMENT und erfindet keinen
 * eigenen Bezugsweg. Aufgerufen wird sie ausschließlich aus
 * `GoogleRatingBadge()` in app/components/index-components/ReputonWidget.jsx —
 * aus DERSELBEN `useGoogleRating()`-Variablen, aus der auch die sichtbare
 * Anzeige entsteht. Anzeige und Auszeichnung können damit nicht auseinander-
 * laufen, weil es nur EINEN Wert gibt: die Naht ist wegkonstruiert, nicht
 * bewacht.
 *
 * WER DIESE FUNKTION VON EINER ZWEITEN STELLE AUFRUFT, macht diese Zusage
 * zunichte und muss die Wertgleichheit dann selbst belegen.
 *
 * BAUFORM UEBERNOMMEN, NICHT ERFUNDEN (P10): app/components/ProductFAQ.jsx
 * emittiert seit langem `ld+json` im Rumpf neben dem sichtbaren Inhalt, über
 * einen String aus app/lib/faq-schema.js. Übernommen ist die Arbeitsteilung
 * (Datenfabrik hier, `<script>` dort), nicht der Inhalt.
 */

/**
 * Knoten-ID der Organisation.
 *
 * BEWUSST EIN LITERAL STATT EINES IMPORTS aus app/lib/entity-schema.js, und
 * das ist keine Bequemlichkeit: der Kopf jener Datei warnt ausdrücklich, dass
 * jeder neue Importeur SEINE Seiten in die Gate-12-Closure zieht. Diese Datei
 * wird von ReputonWidget erreicht, also von Startseite, Kampagnenseiten UND
 * Produktseiten — der Import würde jede kuenftige Änderung an
 * entity-schema.js mit Formate-Nachweisen für all diese Seiten belasten.
 *
 * Die Gleichheit wird stattdessen MASCHINELL geprüft: test/zufriedenheit-
 * schema.test.mjs importiert beide Dateien und vergleicht. Das ist dasselbe
 * Muster, mit dem entity-schema.js seine Stammdaten gegen das Impressum hält
 * — ein Test ist keine Route und erzeugt keine Gate-12-Reichweite.
 */
export const ORG_ID_LITERAL = 'https://qiblanco.com/#organization';

/** Die Organisation, über die geurteilt wird — byte-gleich zu ORGANISATION.name. */
export const ORG_NAME = 'Qi Blanco';

/** Wer die Bewertungen ERHOBEN hat. Nicht wir. */
export const ERHEBER = {
  '@type': 'Organization',
  name: 'Google',
  url: 'https://www.google.com/',
};

/**
 * Der Organization-Knoten mit der Gesamtbewertung — oder `null`.
 *
 * `null` ist der Normalfall und kein Fehler: wo kein sichtbarer, plausibler
 * Wert vorliegt, entsteht KEIN Knoten. Ein unvollständiger Knoten steht
 * dauerhaft als Fehler in der Search Console, ein fehlender bewirkt nur
 * nichts — dieselbe Regel, die produkt-schema.js für den Preis führt.
 *
 * @param {{value?: number, total?: number, url?: string}} bewertung
 *   Genau die Form, die `useGoogleRating()` zurückgibt.
 * @returns {object|null}
 */
export function zufriedenheitSchema(bewertung) {
  const wert = bewertung?.value;
  const anzahl = bewertung?.total;
  // Plausibilitaet wie in googleRating.js `istPlausibel` — eine 0, ein NaN
  // oder eine 6 sind kein „neutraler" Wert, sondern ein kaputter Knoten.
  if (typeof wert !== 'number' || !(wert >= 1) || !(wert <= 5)) return null;
  if (typeof anzahl !== 'number' || !Number.isFinite(anzahl) || anzahl < 1) return null;

  const bewertungsKnoten = {
    '@type': 'AggregateRating',
    ratingValue: wert,
    // `reviewCount` statt `ratingCount`: der Reputon-Feed zählt Google-
    // Rezensionen, also Stimmen MIT Text-Möglichkeit — nicht blosse
    // Sterne-Klicks. Beide Felder existieren in schema.org und bedeuten
    // Verschiedenes; das falsche zu nehmen wäre eine kleine Luege über die
    // Grundmenge.
    reviewCount: anzahl,
    bestRating: 5,
    worstRating: 1,
    author: ERHEBER,
    // WER ERHOBEN HAT — das ist die „benannte Quelle" und der Grund, warum
    // dieser Knoten ehrlich ist. Ohne sie wäre er eine Zahl ohne Herkunft.
    // WO EIN MENSCH DIE GRUNDLAGE NACHPRUEFT. Derselbe Link, den das
    // sichtbare Badge trägt — nicht ein zweiter, eigener.
    url: bewertung?.url,
  };
  if (!bewertungsKnoten.url) delete bewertungsKnoten.url;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID_LITERAL,
    name: ORG_NAME,
    url: 'https://qiblanco.com/',
    aggregateRating: bewertungsKnoten,
  };
}

/**
 * Derselbe Knoten als einbettungsfertiger String — oder `''`.
 *
 * `</script>` wird maskiert, weil dieser String über
 * `dangerouslySetInnerHTML` in ein `<script>`-Element geht (Muster
 * `faqPageJsonLdString`). Die Werte stammen zwar aus unserem eigenen Feed,
 * aber ein Rezensions-Feed ist FREMDER Text — die Maskierung ist deshalb
 * keine Formalie.
 *
 * @param {{value?: number, total?: number, url?: string}} bewertung
 * @returns {string}
 */
export function zufriedenheitJsonLdString(bewertung) {
  const knoten = zufriedenheitSchema(bewertung);
  if (!knoten) return '';
  return JSON.stringify(knoten).replace(/</g, '\\u003c');
}
