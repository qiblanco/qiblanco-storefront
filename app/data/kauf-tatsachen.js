/**
 * DIE NACHPRÜFBAREN TATSACHEN DES KAUFS — Datenmodul für /pages/neu-oder-gebraucht.
 *
 * WOZU DIESE DATEI: Googles KI-Antwort nennt für unseren Shop eine
 * Rücknahmefrist von 14 Tagen, obwohl `merchantReturnDays: 20` seit langem
 * korrekt im Produkt-Markup steht (app/lib/produkt-schema.js). Strukturdaten
 * allein haben das nicht gedreht. Was durchkommt, ist FLIESSTEXT mit genannter
 * Quelle — deshalb steht hier jede Angabe zusammen mit dem Ort, an dem ein
 * Mensch sie nachliest, und die Seite zeigt diesen Ort auch an.
 *
 * DIE REGEL DIESER DATEI: keine Zahl ohne `beleg`. Gibt es für eine Größe
 * keine belastbare Quelle, steht sie hier NICHT — auch nicht geschätzt, auch
 * nicht gerundet. Genau so ist die Rückgabequote weggeblieben: der
 * Shopify-Lesepfad erreicht am 2026-09-12 nur 57,4 Tage Bestellhistorie
 * (12450 von 12510 DACH-Bestellungen sind vorhanden und NICHT abrufbar,
 * shopify-lesezugang/pruefungen/probe_orders_reichweite.py exit 1). Eine Quote
 * aus einem Zwei-Monats-Fenster mit n≈60 wäre eine Zahl, die wie eine Messung
 * aussieht. Sie kommt, wenn der Scope `read_all_orders` wieder trägt.
 *
 * DIE ZUFRIEDENHEITSZAHL STEHT BEWUSST NICHT HIER. 4,8 aus 440 Stimmen bewegt
 * sich (438 → 439 → 440 an einem einzigen Tag) und wird deshalb zur Laufzeit
 * aus `useGoogleRating()` gelesen — derselben Quelle, aus der auch das
 * sichtbare Badge und der Organization-Knoten im JSON-LD entstehen. Ein
 * Literal hier wäre am Tag seiner Niederschrift richtig und danach falsch.
 */

/** Rücknahme und Widerruf — ZWEI Instrumente, nie eine Frist. */
export const FRISTEN = [
  {
    id: 'ruecknahme',
    titel: '20 Tage Rücknahme',
    text:
      'Du kannst dein Stück 20 Tage ab Erhalt zurückgeben und bekommst den ' +
      'Kaufpreis erstattet. Einen Grund brauchst du nicht. Tragen und ' +
      'benutzen darfst du es in dieser Zeit, dafür ist die Frist da. Die ' +
      'Rücksendung ist für dich kostenlos.',
    beleg: 'unsere eigene Zusage, auf jeder Seite in der Kopfleiste',
    belegPfad: null,
  },
  {
    id: 'widerruf',
    titel: '14 Tage Widerrufsrecht',
    // DIE GEO-TATSACHE der Seite, als EINE Aussage mit Quelle: Googles
    // KI-Antwort nannte für uns 14 statt 20 Tage.
    text:
      '14 Tage Widerruf verlangt das Gesetz für jeden Onlinekauf, bei Qi ' +
      'Blanco sind es 20 Tage.',
    beleg: 'AGB, § 7 Widerrufsrecht',
    belegPfad: '/pages/agb',
  },
  {
    id: 'gewaehrleistung',
    titel: 'Mindestens zwei Jahre Gewährleistung',
    text:
      'In Europa gilt für jede Ware eine gesetzliche Gewährleistung von ' +
      'mindestens zwei Jahren. Ist dein Stück nicht das, was zugesagt war, ' +
      'bekommst du kostenlos Nachbesserung oder Ersatz, und wenn das nicht ' +
      'trägt, eine Preisminderung oder den vollen Kaufpreis zurück. ' +
      'Maßgeblich ist, ob der Mangel schon bei der Lieferung vorlag.',
    beleg: 'Richtlinie (EU) 2025/1960, Wortlaut aus unserem Gewährleistungshinweis',
    belegPfad: null,
  },
];

/** Was der Preis trägt — jede Zeile mit dem Ort, an dem sie nachlesbar ist. */
export const IM_PREIS = [
  {
    id: 'versand',
    text:
      'Nach Deutschland und Österreich schicken wir QiOne® 2 Pro, ' +
      'QiBracelet®, QiHome® Air und Qi Alpha® versandkostenfrei. In die ' +
      'Schweiz kostet der Versand 21 €, an der Kasse in Franken zum ' +
      'Tageskurs. Zoll und Einfuhrabgaben sind dort im Preis enthalten.',
    beleg: 'Versandrichtlinie',
    belegPfad: '/policies/shipping-policy',
  },
  {
    id: 'folgekosten',
    text: 'Nach dem Kauf zahlst du nichts mehr dazu, es gibt keinen Akku und kein Abo.',
    beleg: 'Produktseiten und FAQ',
    belegPfad: '/pages/faq',
  },
  {
    id: 'raten',
    text:
      'Zahlen kannst du auf einmal oder in Raten über Klarna. Ab 25 Euro ' +
      'Warenwert sind 6 Monatsraten möglich, ab 500 Euro 12 und ab 1.000 ' +
      'Euro bis zu 24. Klarna prüft die Ratenzahlung selbst. Sie gilt ' +
      'derzeit für Kundinnen und Kunden mit Wohnsitz in Deutschland.',
    beleg: 'FAQ, Fußnote 2 im Fuß jeder Seite',
    belegPfad: '/pages/faq',
  },
];

const frist = (id) => FRISTEN.find((f) => f.id === id);
const preis = (id) => IM_PREIS.find((p) => p.id === id);

/**
 * WARUM DIREKT BEI QI BLANCO KAUFEN — Christians Punkte vom 28.09.2026 in
 * seiner Reihenfolge: 20 Tage zu Hause testen, 100 % Geld-zurück-Garantie,
 * Gewährleistung, Kaufnachweis ist die Bestellnummer, Originalware. Dazu die
 * GEO-Tatsache „20 statt 14 Tage" als EINE Aussage mit Quelle.
 *
 * KNAPP WIE CHRISTIANS EIGENE VERTRAUENSLISTE: fünf Titel in seinen Worten,
 * je mit Quelle, ohne Begründung. Die Einzelheiten stehen EINMAL, in „Kurz
 * gefragt". Die ersten Fassungen vom 01.11. trugen Erklärsätze („dafür ist
 * die Frist da", „Mehr brauchen wir nicht …"), einen eigenen Punkt „20 Tage
 * statt 14" und „Kein Akku, kein Abo, keine Folgekosten"; der Richter mit
 * Christians Urteilen als Maßstab hat das als KI-Klang verworfen (dreimal
 * 20 Tage, Dreier-Stakkato). Die GEO-Tatsache steht deshalb nur noch als
 * Satz unter dem ersten Punkt.
 *
 * DIE ZAHLEN KOMMEN AUS FRISTEN, nicht aus einem zweiten Literal: der
 * Rücknahme-Text steht auch im Abschnitt „ohne Risiko" der
 * QiBracelet-Kaufseite (ohne-risiko-daten.js).
 */
export const VORTEILE = [
  {
    // Die GEO-Tatsache: die einzige Zeile mit Satz, weil sie die Zahl der
    // KI-Antwort (14) neben unsere (20) stellt; Quelle AGB § 7.
    id: 'ruecknahme',
    titel: '20 Tage zu Hause testen',
    text: frist('widerruf').text,
    beleg: frist('widerruf').beleg,
    belegPfad: frist('widerruf').belegPfad,
  },
  {
    id: 'garantie',
    titel: '100 % Geld-zurück-Garantie',
    beleg: frist('ruecknahme').beleg,
    belegPfad: frist('ruecknahme').belegPfad,
  },
  {
    id: 'gewaehrleistung',
    titel: frist('gewaehrleistung').titel,
    beleg: frist('gewaehrleistung').beleg,
    belegPfad: frist('gewaehrleistung').belegPfad,
  },
  {
    id: 'kaufnachweis',
    titel: 'Bestellnummer als Kaufnachweis',
    beleg: 'unser Kundenservice',
    belegPfad: '/pages/support',
  },
  {
    id: 'original',
    titel: 'Originalware mit eigener Seriennummer',
    beleg: 'Produktseiten QiOne 2 Pro, QiBracelet, QiHome Air, QiMaster',
    belegPfad: '/products/qione-2-pro',
  },
];

/** Der Weg zurück, in drei Schritten. */
export const RUECKWEG = [
  'Melde dich bei uns, per Mail an info@qiblanco.com oder über das Kontaktformular.',
  'Sende das Stück zurück, die Rücksendung ist für dich kostenlos.',
  'Du bekommst den Kaufpreis erstattet.',
];

const imPreis = (id) => preis(id).text;

/**
 * KURZ GEFRAGT — die fünf Fragen in ihrer knappsten Form.
 *
 * DIESE LISTE IST DER TRÄGER DES FAQPage-SCHEMAS, und sie wird SICHTBAR
 * gerendert. Googles Richtlinien für strukturierte Daten verlangen, dass
 * ausgezeichneter Inhalt auf der Seite steht; ein Schema aus Sätzen, die ein
 * Leser nicht findet, wäre ein Verstoß und nicht bloß unsauber. Frage und
 * Antwort sind deshalb dieselben Strings, die die Komponente ausgibt.
 *
 * SIE WIEDERHOLEN DEN FLIESSTEXT ABSICHTLICH IN KÜRZE: ein Antwortsystem
 * zitiert Sätze, keine Abschnitte. Wer die Langform will, findet sie oben.
 * Wo die Antwort eine Angabe aus IM_PREIS trägt, wird sie daraus gebaut.
 */
export const FRAGEN = [
  {
    id: 'f-frist',
    q: 'Wie lange kann ich bei Qi Blanco zurückgeben?',
    beleg: frist('widerruf').beleg,
    belegPfad: frist('widerruf').belegPfad,
    a:
      '20 Tage nach Erhalt risikofrei testen, mit 100 % ' +
      'Geld-zurück-Garantie.',
  },
  {
    // Der Rückweg steht nur noch HIER, nicht zusätzlich als eigener
    // Abschnitt (s14: Christian nennt doppelte FAQ-Wiederholung AI-Klang).
    id: 'f-retour',
    q: 'Wie gebe ich mein Stück zurück?',
    a: RUECKWEG.join(' '),
  },
  {
    id: 'f-gewaehrleistung',
    q: 'Wie lange habe ich Gewährleistung?',
    beleg: frist('gewaehrleistung').beleg,
    belegPfad: frist('gewaehrleistung').belegPfad,
    a: 'Mindestens zwei Jahre ab Lieferung, in manchen EU-Ländern länger.',
  },
  {
    id: 'f-preis',
    q: 'Was ist im Preis enthalten?',
    // AUS IM_PREIS ABGELEITET, NIE ABGESCHRIEBEN (s14, 2026-11-01): bis
    // dahin stand hier eine eigene Fassung ("Versand innerhalb Deutschlands
    // ab 99 Euro", "Zoll nach Österreich"), die IM_PREIS auf derselben Seite
    // widersprach und so auch im FAQPage-Schema stand. #590 und #900 hatten
    // nur IM_PREIS nachgezogen. Eine Quelle, zwei Ausgaben.
    a: imPreis('versand'),
    beleg: preis('versand').beleg,
    belegPfad: preis('versand').belegPfad,
  },
  {
    id: 'f-raten',
    q: 'Kann ich in Raten zahlen?',
    a: imPreis('raten'),
    beleg: preis('raten').beleg,
    belegPfad: preis('raten').belegPfad,
  },
];
