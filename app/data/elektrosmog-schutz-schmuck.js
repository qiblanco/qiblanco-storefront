import {isoMitZone} from '~/lib/datum';

/**
 * /pages/elektrosmog-schutz-schmuck — Ratgeber und Produktübersicht für die
 * Kaufbegriffe der Kategorie: „Elektrosmog Schutz Armband", „EMF Schutz
 * Armband", „EMF Schutz Anhänger", „Schutz vor Strahlung Schmuck",
 * „Elektrosmog Schutz worauf achten".
 *
 * Auftrag: Grossjob 20261114-seo-kategorie-kaufbegriffe-suchabsicht-r2,
 * Segment s02 (Christian 14.11.2026: „ranken wir so wie vorgestellt, auch ohne
 * Geld, einfach durch geilen Inhalt?"). Befund B1: diese Begriffe hingen an
 * der Markenseite /pages/warum-qi-blanco, die keinen Kaufratgeber tragen darf.
 * Google zeigt für sie Ratgeber und Kategorien mit Produktübersicht
 * (Flächen-Zensus 10.11.2026, seo.db flaeche), darum ist diese Seite genau
 * das: Antwort zuerst, Produkte mit Preis, prüfbare Kaufpunkte, Fragen.
 *
 * NICHT DOPPELN: die Kaufpunkte antworten in einem Satz und verlinken auf die
 * Antwortseiten (FAQ, Duschen/Sauna, Studien, Wie funktioniert Schutz vor
 * Elektrosmog). Diese stehen auf Platz 1 für ihre Fragen und bleiben die
 * Quelle der Tiefe.
 *
 * QUELLEN DER AUSSAGEN (keine neue Tatsache, alles aus dem Bestand):
 *  - Material, Herstellung, Wasser/Sauna, gleiche Leistung von QiOne® 2 Pro
 *    und QiBracelet®, 20 Tage Rückgabe: _design/gorgias-fact-gate/
 *    fakten-basis.yaml, wortgleich wie auf /pages/healy-alternative.
 *  - Studienzahlen (60,5 ± 3,9 % gegen 84,7 ± 7,0 %, 171 Berichte):
 *    STUDIEN_FAKTENBLATT.md e0001/e0004, Seiten /pages/studie-immunzellen und
 *    /pages/studie-nutzererfahrung.
 *  - Raten: app/data/faq-seite.js („Kann ich in Raten zahlen?"), Fußnote 2.
 *  - Christians Wortlaut: pr-manager botschaften, Sprachnachricht
 *    14.10.2026 11:25Z (Faktenbank „Kurz", Satz 1), gekürzt um „Also,
 *    einfach gesagt" und das Füllwort, sonst wortgleich.
 *  - Preise: live aus der Storefront-API im Loader der Route, nie als Literal.
 *
 * WER DEN TEXT ÄNDERT, ZIEHT `GEAENDERT` NACH. Die US-Fassung auf
 * qi-blanco.com (/pages/emf-protection-jewelry, Segment s03) übersetzt aus
 * diesem Stand.
 */

export const PFAD = '/pages/elektrosmog-schutz-schmuck';
const VEROEFFENTLICHT = '2026-11-14';
const GEAENDERT = '2026-11-14';

export const SEITE = {
  pfad: PFAD,
  titel: 'Elektrosmog-Schutz als Schmuck: Armband, Anhänger, Kette | Qi Blanco',
  vorspann: 'Ratgeber und Überblick',
  h1: 'Elektrosmog-Schutz zum Tragen: Armband, Anhänger oder Kette?',
  beschreibung:
    'Elektrosmog-Schutz als Armband oder Anhänger: QiBracelet® und QiOne® 2 Pro im Überblick. Ohne Akku, für Dusche und Sauna, 20 Tage Rückgabe, Raten über Klarna.',
  antwort: [
    'Einen Elektrosmog-Schutz zum Tragen gibt es bei Qi Blanco als Anhänger und als Armband: den QiOne® 2 Pro und das QiBracelet®. Beide haben dieselbe Leistung, brauchen keinen Akku und begleiten dich Tag und Nacht, auch unter der Dusche.',
    'Welcher passt, entscheidest du danach, wo du ihn tragen willst. Den Anhänger trägst du an einer Kette um den Hals, das Armband am Handgelenk.',
    'Handy, WLAN und Router gehören zum Leben. Mit einem Schutz am Körper musst du auf nichts davon verzichten.',
  ],
  veroeffentlicht: isoMitZone(VEROEFFENTLICHT),
  geaendert: isoMitZone(GEAENDERT),
};

/** Christians Wortlaut (nie erfinden; Quelle im Dateikopf). */
export const STIMME = {
  text: '„Man schützt sich vor E-Smog oder man schützt seine Zellen, unter anderem vor E-Smog."',
  quelle: 'Christian Bernd Bauer, Gründer von Qi Blanco',
};

/**
 * Die Produktübersicht: was du tragen kannst. Reihenfolge = Kaufabsicht der
 * Suchbegriffe (Armband zuerst gesucht, Anhänger am meisten gekauft).
 * `preis` kommt live über den Handle.
 */
export const PRODUKTE = [
  {
    handle: 'qibracelet',
    art: 'Armband',
    titel: 'QiBracelet®',
    text: 'Das Armband hat dieselbe Leistung wie der QiOne® 2 Pro. Weil dein Handgelenk weiter von der Körpermitte entfernt ist, ist es rund 10 Prozent stärker gebaut.',
    linktext: 'Zum QiBracelet®',
  },
  {
    handle: 'qione-2-pro',
    art: 'Anhänger',
    titel: 'QiOne® 2 Pro',
    text: 'Der Anhänger aus 316L-Chirurgenstahl trägt einen Gitterchip® aus 750er Gold. Du hängst ihn um und trägst ihn beim Duschen, beim Sport und nachts.',
    linktext: 'Zum QiOne® 2 Pro',
    haupt: true,
  },
  {
    handle: 'qione-kette',
    art: 'Kette',
    titel: 'Kette für den QiOne®',
    text: 'Die Kette aus Chirurgenstahl macht deinen QiOne® zur Halskette. Hast du schon einen QiOne®, ist sie der einfachste Weg, ihn jeden Tag zu tragen.',
    linktext: 'Zur Kette',
  },
];

/**
 * Worauf achten beim Kauf: je Punkt eine prüfbare Antwort und der Weg in die
 * Tiefe. Die Zielseiten sind die Antwortseiten mit Platz 1 (nicht doppeln).
 */
export const ACHTEN = [
  {
    id: 'testen',
    frage: 'Kannst du ihn in Ruhe testen?',
    text: 'Achte auf eine Rückgabe, die dir Zeit lässt. Bei Qi Blanco hast du 20 Tage ab Ankunft, und passt er nicht zu dir, bekommst du den vollen Kaufpreis zurück.',
    link: {to: '/pages/faq', text: 'Rückgabe in 20 Tagen'},
  },
  {
    id: 'messungen',
    frage: 'Gibt es Messungen mit Quelle?',
    text: 'Frag nach veröffentlichten Messungen. Unsere fünf Arbeiten des Dartsch Scientific Instituts stehen mit Zeitschrift und allen Zahlen online.',
    link: {to: '/pages/studien', text: 'Alle fünf Arbeiten im Überblick'},
  },
  {
    id: 'alltag',
    frage: 'Passt er in deinen Alltag?',
    text: 'Ein Schutz bringt dir nur etwas, wenn du ihn trägst. QiOne® 2 Pro und QiBracelet® haben keinen Akku und keine App, und Wasser, Schweiß und Sauna machen ihnen nichts aus.',
    link: {to: '/pages/armband-duschen-sauna', text: 'Duschen und Sauna mit dem Armband'},
  },
  {
    id: 'erklaerung',
    frage: 'Weißt du, wie der Schutz wirken soll?',
    text: 'Lass dir erklären, was am Körper passiert, wenn du deinen Schutz trägst. Wir zeigen es dir Schritt für Schritt.',
    link: {
      to: '/pages/wie-funktioniert-schutz-vor-elektrosmog',
      text: 'Wie Schutz vor Elektrosmog am Körper funktioniert',
    },
  },
  {
    id: 'raten',
    frage: 'Kannst du in Raten zahlen?',
    text: 'Ab 25 € geht das über Klarna in 6 Monatsraten, ab 500 € in 12 und ab 1.000 € in bis zu 24. Das klappt derzeit mit Wohnsitz in Deutschland.',
    link: {to: '/pages/faq', text: 'Ratenzahlung Schritt für Schritt'},
  },
];

/** Der Closer: was drin ist, was gemessen ist, und die Einladung. */
export const BELEG = {
  titel: 'Was gemessen ist und was Menschen erzählen',
  material:
    'Wir stellen den Gitterchip® aus 750er Gold in Bayern selbst her. Das Gehäuse ist aus 316L-Chirurgenstahl, wie man ihn für Implantate verwendet, und jeder QiOne® trägt seine eigene Seriennummer.',
  klasse: 'Im Labor an Zellkulturen gemessen',
  zahl:
    'In der ersten Arbeit von 2021 wurden menschliche Immunzellen vier Stunden lang Handystrahlung ausgesetzt. Ihre Fähigkeit, Abwehr-Radikale zu bilden, sank auf 60,5 ± 3,9 Prozent der unbestrahlten Kontrolle. Lag ein QiOne® 2 Pro daneben, blieben 84,7 ± 7,0 Prozent erhalten.',
  klasseErfahrung: 'Von Anwenderinnen und Anwendern berichtet',
  erfahrung:
    'Mehr als 14.000 Menschen tragen heute einen QiOne®. In 171 ausgewerteten Erfahrungsberichten nannten sie am häufigsten mehr Ruhe und Gelassenheit sowie tieferen Schlaf, je in rund 20 Prozent der Berichte, danach mehr Energie mit rund 17 Prozent.',
  einladung:
    'Am besten probierst du es selbst aus. Trag deinen Schutz 20 Tage, und wenn er nicht zu dir passt, bekommst du den vollen Kaufpreis zurück.',
};

/**
 * Häufige Fragen. `preise` = {qione, bracelet} als Anzeigetext in Euro oder
 * null (Storefront-API nicht erreichbar oder kein Euro-Markt): dann nennt die
 * Antwort keinen Betrag, statt einen alten zu raten.
 */
export function fragen(preise = {}) {
  const {qione = null, bracelet = null} = preise || {};
  return [
    {
      id: 'armband-oder-anhaenger',
      q: 'Elektrosmog-Schutz als Armband oder als Anhänger: was ist besser?',
      a: 'Beide haben dieselbe Leistung. Der QiOne® 2 Pro hängt an einer Kette nah an deiner Körpermitte. Das QiBracelet® trägst du am Handgelenk, und es ist für den größeren Abstand rund 10 Prozent stärker gebaut. Nimm das, was du lieber jeden Tag trägst.',
    },
    {
      id: 'gemessen',
      q: 'Was ist an einem Elektrosmog-Schutz von Qi Blanco gemessen?',
      a: 'Das Dartsch Scientific Institut hat unsere Produkte in unserem Auftrag in fünf veröffentlichten Arbeiten untersucht. Vier davon sind Zellstudien im Labor, die fünfte wertet 171 Erfahrungsberichte aus, in denen am häufigsten mehr Ruhe, tieferer Schlaf und mehr Energie genannt werden.',
    },
    {
      id: 'duschen-sauna',
      q: 'Kann ich mit dem Armband oder Anhänger duschen und in die Sauna?',
      a: 'Ja. Wasser, Chlor, Meerwasser und Schweiß machen QiOne® 2 Pro und QiBracelet® nichts aus. In der Sauna kann sich das Metall erhitzen: am Körper getragen bleibt es auf Körpertemperatur, frei in der heißen Luft wird es unangenehm heiß.',
    },
    {
      id: 'aufladen',
      q: 'Muss man den Schutz aufladen?',
      a: 'Nein. QiOne® 2 Pro und QiBracelet® haben keinen Akku und keine Elektronik. Sie brauchen keine Steckdose, haben keine Verschleißteile, und es kommen keine Folgekosten auf dich zu.',
    },
    {
      id: 'preis',
      q: 'Was kostet ein Elektrosmog-Schutz zum Tragen?',
      a:
        qione && bracelet
          ? `Der QiOne® 2 Pro kostet ${qione}, das QiBracelet® ${bracelet}. Du bezahlst einmal, ohne Abo und ohne Folgekosten.`
          : 'Du bezahlst einmal, ohne Abo und ohne Folgekosten. Den aktuellen Preis nennt die Produktseite.',
    },
    {
      id: 'raten',
      q: 'Kann ich in Raten zahlen?',
      a: 'Ja, über Klarna an der Kasse. Ab 25 € Warenwert geht das in 6 Monatsraten, ab 500 € in 12 und ab 1.000 € in bis zu 24. Ob die Ratenzahlung klappt, prüft Klarna selbst, und derzeit geht sie nur mit Wohnsitz in Deutschland.',
    },
    {
      id: 'rueckgabe',
      q: 'Wie lange kann ich zurückgeben?',
      a: 'Du hast 20 Tage ab Ankunft der Lieferung. Passt dein Schutz nicht zu dir, bekommst du den vollen Kaufpreis zurück, ohne Angabe von Gründen.',
    },
  ];
}
