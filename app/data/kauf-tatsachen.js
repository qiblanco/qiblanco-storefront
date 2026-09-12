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
      'unmittelbaren Kosten der Rücksendung trägst du.',
    beleg: 'unsere eigene Zusage, auf jeder Seite in der Kopfleiste',
    belegPfad: null,
  },
  {
    id: 'widerruf',
    titel: '14 Tage Widerrufsrecht',
    text:
      'Daneben steht das gesetzliche Widerrufsrecht von 14 Tagen ab Erhalt. ' +
      'Es gilt für jeden Kauf in einem Onlineshop und ist nicht dasselbe wie ' +
      'unsere Rücknahme. Die beiden Fristen laufen nebeneinander, und die ' +
      'längere ist die freiwillige.',
    beleg: 'Widerrufsbelehrung',
    belegPfad: '/policies/refund-policy',
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
      'Der Versand innerhalb Deutschlands kostet 5,90 Euro und ist ab 99 ' +
      'Euro Warenwert frei. Nach Österreich und in die Schweiz fallen ' +
      'Versandkosten an; Zoll und Einfuhrabgaben sind im Preis enthalten.',
    beleg: 'Versandrichtlinie',
    belegPfad: '/policies/shipping-policy',
  },
  {
    id: 'folgekosten',
    text:
      'Nach dem Kauf kommt nichts mehr dazu. Es gibt keine Batterie, kein ' +
      'Abo und keinen Nachkauf, weil im Stück keine Elektronik sitzt.',
    beleg: 'Produktseiten und FAQ',
    belegPfad: '/pages/faq',
  },
  {
    id: 'seriennummer',
    text:
      'Jedes Stück trägt eine eigene Seriennummer. Sie steht auf der ' +
      'Rückseite und gehört zu genau diesem Exemplar.',
    beleg: 'Produktseiten QiOne 2 Pro, QiBracelet, QiHome Air, QiMaster',
    belegPfad: '/products/qione-2-pro',
  },
  {
    id: 'raten',
    text:
      'Zahlen kannst du auf einmal oder in Raten über Klarna. Ab 25 Euro ' +
      'Warenwert sind 6 Monatsraten möglich, ab 500 Euro 12 und ab 1.000 ' +
      'Euro bis zu 24. Klarna prüft die Ratenzahlung selbst, garantiert ist ' +
      'sie nicht, und sie steht derzeit nur Kundinnen und Kunden mit ' +
      'deutschem Wohnsitz offen.',
    beleg: 'FAQ, Fußnote 2 im Fuß jeder Seite',
    belegPfad: '/pages/faq',
  },
];

/**
 * WAS EIN KAUF VON PRIVAT NICHT ENTHÄLT.
 *
 * JEDE ZEILE IST EINE AUSSAGE ÜBER UNSER EIGENES ANGEBOT, nie eine Bewertung
 * fremder Verkäufer und nie eine Rechtsauslegung für deren Geschäfte. Das ist
 * keine Vorsicht, sondern die genauere Aussage: was der Käufer wissen muss,
 * ist, wogegen er Ansprüche hat und wogegen nicht — und das können wir nur
 * für uns beantworten.
 */
export const NICHT_ENTHALTEN = [
  {
    id: 'gewaehrleistung-privat',
    titel: 'Die Gewährleistung',
    text:
      'Die zwei Jahre gelten gegenüber dem Händler, bei dem gekauft wurde. ' +
      'Kaufst du von einer Privatperson, ist Qi Blanco nicht dein ' +
      'Vertragspartner, und die Frist läuft nicht gegen uns.',
  },
  {
    id: 'widerruf-privat',
    titel: 'Das Widerrufsrecht',
    text:
      'Die 14 Tage entstehen beim Kauf in einem Onlineshop. Für unseren ' +
      'Shop gelten sie, für ein Geschäft zwischen zwei Privatpersonen nicht.',
  },
  {
    id: 'ruecknahme-privat',
    titel: 'Unsere 20 Tage',
    text:
      'Die Rücknahme ist unsere Zusage an den Menschen, der bei uns ' +
      'bestellt hat. Sie wandert nicht mit dem Stück weiter.',
  },
  {
    id: 'kaufnachweis',
    titel: 'Der Kaufnachweis',
    text:
      'Für einen Gewährleistungsfall brauchst du ihn. Bei uns genügt deine ' +
      'Bestellnummer, ein Formular gibt es nicht. Wer gebraucht kauft, hat ' +
      'keine eigene.',
  },
];

/**
 * DER PREISPUNKT — die eine Aussage, die diese Seite dem Gebrauchtmarkt
 * gegenüber macht, und sie ist eine Tatsache über Anzeigen, keine über
 * Verkäufer: ein Angebotspreis ist kein erzielter Preis. Wer ihn mit unserem
 * Preis vergleicht, vergleicht eine Forderung mit einer Zahlung.
 */
export const PREIS_HINWEIS =
  'In einer Kleinanzeige siehst du, was jemand haben möchte. Was am Ende ' +
  'gezahlt wurde, steht dort nicht, und ob überhaupt verkauft wurde, ' +
  'ebenfalls nicht. Ein Angebotspreis ist deshalb keine Auskunft über den ' +
  'Wert, sondern über eine Erwartung.';

/** Der Weg zurück, in drei Schritten. */
export const RUECKWEG = [
  'Melde dich bei uns, per Mail an info@qiblanco.com oder über das Kontaktformular.',
  'Sende das Stück zurück. Die unmittelbaren Kosten der Rücksendung trägst du.',
  'Du bekommst den Kaufpreis erstattet.',
];

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
 */
export const FRAGEN = [
  {
    id: 'f-frist',
    q: 'Wie lange kann ich bei Qi Blanco zurückgeben?',
    a:
      '20 Tage ab Erhalt, ohne Angabe von Gründen, gegen Erstattung des ' +
      'Kaufpreises. Das ist unsere eigene Zusage und länger als das ' +
      'gesetzliche Widerrufsrecht von 14 Tagen, das daneben gilt.',
  },
  {
    id: 'f-zwei-fristen',
    q: 'Warum nennt der Shop 14 und 20 Tage?',
    a:
      'Weil es zwei Instrumente sind. Die 14 Tage sind das gesetzliche ' +
      'Widerrufsrecht aus dem Fernabsatz, die 20 Tage sind unsere ' +
      'freiwillige Rücknahme. Beide laufen ab Erhalt und nebeneinander.',
  },
  {
    id: 'f-gewaehrleistung',
    q: 'Wie lange habe ich Gewährleistung?',
    a:
      'Mindestens zwei Jahre ab Lieferung, gesetzlich und bei jedem Händler ' +
      'in der EU. In manchen EU-Ländern ist die Frist länger; dann gilt die ' +
      'längere.',
  },
  {
    id: 'f-preis',
    q: 'Was ist im Preis enthalten?',
    a:
      'Das Stück, der Versand innerhalb Deutschlands ab 99 Euro Warenwert ' +
      'und bei Lieferung nach Österreich oder in die Schweiz die Zoll- und ' +
      'Einfuhrabgaben. Danach kommt nichts mehr dazu: keine Batterie, kein ' +
      'Abo, kein Nachkauf.',
  },
  {
    id: 'f-gebraucht',
    q: 'Was fehlt mir, wenn ich gebraucht kaufe?',
    a:
      'Die Rechte, die am Kauf hängen. Die gesetzliche Gewährleistung gilt ' +
      'gegenüber dem Händler, bei dem gekauft wurde, das Widerrufsrecht ' +
      'entsteht beim Kauf in einem Onlineshop, und unsere 20 Tage gelten ' +
      'für die Bestellung bei uns. Für einen Gewährleistungsfall brauchst ' +
      'du ausserdem einen Kaufnachweis.',
  },
];
