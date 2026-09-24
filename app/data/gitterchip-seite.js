import {bilder, stufen, wasserstruktur} from '~/data/kohaerente-wasserstruktur';
import {VIDEO, TEIL_EINFACH, TEIL_FAKTEN} from '~/data/wasser-infoseite';

/**
 * DIE SEITE „WIE FUNKTIONIERT DER GITTERCHIP IM QIONE?“: jeder Satz und jede
 * Studienzahl der Seite. Die Darstellung (GitterChipSeite.jsx) trägt keinen
 * Text.
 *
 * Auftrag: Christian, 23.09.2026, ~22:30: „sauber verkaufsoptimiert erklären,
 * wie was zusammenhängt, mit Grafiken und Animation und ohne Verteidigung,
 * sondern so, wie wir es aus den Forschungen mit Warnke, Pollack und
 * Del Giudice ableiten können … Die Seite noch nicht verlinken und nicht
 * crawlbar machen.“
 *
 * EINE QUELLE JE GRÖSSE. Winkel und Energieniveau kommen aus dem Konsumenten
 * des Brain-SSoT (app/data/kohaerente-wasserstruktur.js), das Video und die
 * Werte der wiederverwendeten Grafiken aus dem Datenmodul der Info-Seite
 * /pages/was-ist-kohaerentes-wasser. Keine dieser Zahlen steht hier als
 * Literal. Die Studienzahlen stehen hier, jede mit ihrer Fundstelle; die
 * Probe am Kundenrand hält jede gegen die Seite, auf die ihr Balken führt.
 *
 * TON: der Salesmanager (qi-salesbot/bin/verkaufs-siegel, V1 bis V4) prüft
 * jede Stufe am ausgelieferten Text. Stärke zuerst, Beleg benannt, keine
 * Selbstentwertung, kein Körperversprechen. Die Wirkkette heißt „abgeleitet“,
 * „nach dem Modell von“, „so erklärt es“, nie „bewiesen“. Die Studien sprechen
 * von Zellen im Labor (GL-SPR-0008).
 */

export const PFAD = '/pages/wie-funktioniert-der-gitterchip-im-qione';
export const KAUFWEG = '/products/qione-2-pro';

const WINKEL = bilder.find((b) => b.id === 'winkel');
const DOMAENE = bilder.find((b) => b.id === 'domaene');
const EZ = stufen.find((s) => s.id === 'ez');

/**
 * Die Werte einer Grafik der Info-Seite, gelesen aus deren Datenmodul. Fehlt
 * sie dort, liefert die Funktion null: die Seite zeigt die Grafik dann nicht,
 * und test/gitterchip-seite.test.mjs wird rot.
 */
export function infoGrafik(typ) {
  for (const teil of [TEIL_EINFACH, TEIL_FAKTEN]) {
    for (const a of teil.abschnitte || []) {
      if (a.grafik && a.grafik.typ === typ) return a.grafik.werte;
    }
  }
  return null;
}

export const SEITE = {
  pfad: PFAD,
  titel: 'Wie funktioniert der GitterChip im QiOne? | Qi Blanco',
  beschreibung:
    'Der GitterChip im QiOne® 2 Pro bringt Ordnung ins Wasser. Stufe für Stufe erklärt nach Dr. Warnke, Prof. Del Giudice und Prof. Dr. Pollack, mit fünf Zellstudien.',
  dachzeile: 'QiOne® 2 Pro · GitterChip™',
  h1: 'Wie funktioniert der GitterChip im QiOne?',
  kurz: [
    'Der GitterChip bringt Ordnung ins Wasser. Sein statisches Feld regt Wassermoleküle an, in einen geordneten, energiereichen Zustand zu wechseln.',
    'So leiten wir es aus der Forschung von Dr. Ulrich Warnke, Prof. Emilio Del Giudice und Prof. Dr. Gerald Pollack ab. In fünf international publizierten Studien hat die GitterChip-Technik an Zellen im Labor deutlich gewirkt.',
  ],
  inhaltTitel: 'In sieben Stufen erklärt',
  kopfGrafik: {
    beschriftungGold: '750er Goldlegierung',
    beschriftungStahl: 'in Chirurgenstahl',
    beschriftungFeld: 'statisches Feld',
    legende:
      'Der GitterChip im Querschnitt: ein Gitter aus 750er Goldlegierung in Chirurgenstahl. Sein statisches Feld umgibt ihn dauerhaft, und Wassermoleküle darin richten sich aus.',
  },
};

/** Die Kette, die jede Stufe oben mitführt: an welchem Glied steht der Leser? */
export const KETTE = [
  {id: 'chip', name: 'Chip'},
  {id: 'wasser', name: 'Wasser'},
  {id: 'zelle', name: 'Zelle'},
];

export const STUFEN = [
  {
    id: 'chip',
    anker: 'gitterchip',
    glied: 'chip',
    marke: 'Der Chip',
    titel: 'Ein Gitter aus Gold, das ohne Strom arbeitet',
    oeffner: 'innenansicht',
    absaetze: [
      'Das Herz des QiOne® 2 Pro ist der GitterChip™: ein präzise strukturiertes Gitter aus einer eigens entwickelten 750er Goldlegierung. Er wird von Hand fertiggestellt und in Chirurgenstahl gefasst.',
      'Im Chip steckt keine Elektronik, kein Akku und keine Batterie, und er sendet nichts. Seine Kraft liegt in der Struktur selbst: Das Gitter trägt ein statisches Feld, das ohne Energiezufuhr besteht.',
      'Du musst nichts laden und nichts einschalten. Das Feld ist da, solange du den QiOne® 2 Pro trägst.',
    ],
    weiter: {text: 'Weiter: Was das Feld mit Wasser macht', anker: 'energie'},
  },
  {
    id: 'warnke',
    anker: 'energie',
    glied: 'wasser',
    marke: 'Wasser nimmt Energie auf',
    titel: 'Wasser nimmt Energie auf und öffnet sich für Ordnung',
    absaetze: [
      `Ein Wassermolekül besteht aus einem Sauerstoff und zwei Wasserstoffen. Im gewöhnlichen Wasser stehen die Wasserstoffe im Winkel von ${WINKEL.von.anzeige} zueinander.`,
      WINKEL.text,
      `Bei ${WINKEL.nach.anzeige} können sich die Moleküle zu Sechsecken verbinden. Dr. Ulrich Warnke beschreibt in seinem Buch „Bionisches Wasser“ genau diesen Schritt: Aus gewöhnlichem Wasser wird energiereiches, geordnetes Wasser.`,
    ],
    grafik: {
      typ: 'leit',
      werte: {von: WINKEL.von, nach: WINKEL.nach},
      legende:
        'Gestrichelt der Winkel im gewöhnlichen Wasser, kräftig nach der Energieaufnahme. Danach setzen sich sechs Nachbarn zum Sechseck zusammen. Nach Dr. Warnke.',
    },
    weiter: {text: 'Weiter: Wie daraus ein Gleichtakt wird', anker: 'gleichtakt'},
  },
  {
    id: 'del-giudice',
    anker: 'gleichtakt',
    glied: 'wasser',
    marke: 'Moleküle im Gleichtakt',
    titel: 'Aus einzelnen Molekülen wird ein Verband im Gleichtakt',
    absaetze: [
      DOMAENE.text,
      `Die Physik nennt einen solchen Verband eine kohärente Domäne. Das Modell stammt von Prof. Giuliano Preparata und Prof. Emilio Del Giudice aus der Quantenelektrodynamik. Ihre Domäne arbeitet auf einem eigenen Energieniveau von ${DOMAENE.energie.anzeige}.`,
      'Dr. Warnke baut auf diesem Modell auf. Wasser ist für ihn eine Mischung aus solchen geordneten Inseln und freiem Wasser dazwischen.',
    ],
    grafik: {
      typ: 'domaene',
      werte: infoGrafik('domaene'),
      legende:
        'Außen schwingt jedes Molekül für sich, in der Domäne alle im selben Takt. Nach dem Modell von Prof. Del Giudice und Prof. Preparata.',
    },
    video: {
      ...VIDEO,
      ueberschrift: 'Im Video erklärt: die kohärente Struktur',
    },
    weiter: {text: 'Weiter: Wo die Ordnung stabil wird', anker: 'grenzflaeche'},
  },
  {
    id: 'pollack',
    anker: 'grenzflaeche',
    glied: 'wasser',
    marke: 'Ordnung an Grenzflächen',
    titel: 'An Oberflächen wird die Ordnung stabil',
    absaetze: [
      'Prof. Dr. Gerald Pollack hat an der University of Washington gemessen, was Wasser an wasserliebenden Oberflächen tut. Es legt sich dort in sechseckigen Schichten an.',
      'Diese Schicht schiebt gelöste Teilchen hinaus, deshalb heißt sie Ausschlusszone, kurz EZ. In seinem Buch „The Fourth Phase of Water“ nennt Prof. Dr. Pollack sie die vierte Phase des Wassers, neben fest, flüssig und gasförmig.',
      'Die Zone ist negativ geladen, das Wasser davor positiv. Diese Ladungstrennung hält Energie wie eine Batterie, und Licht und Wärme lassen die Zone wachsen.',
      `Die Schicht ist ${EZ.bestaendigkeit}.`,
    ],
    grafik: {
      typ: 'ausschlusszone',
      werte: infoGrafik('ausschlusszone'),
      legende:
        'An einer wasserliebenden Oberfläche wächst die Zone und schiebt gelöste Teilchen hinaus. Sie ist negativ geladen, das Wasser davor positiv. Nach Prof. Dr. Pollack.',
    },
    weiter: {text: 'Weiter: Wie der GitterChip die Kette anstößt', anker: 'verbindung'},
  },
  {
    id: 'verbindung',
    anker: 'verbindung',
    glied: 'alle',
    marke: 'Die Verbindung',
    titel: 'Vom Chip über das Wasser bis zur Zelle',
    absaetze: [
      'Aus diesen drei Forschungslinien leiten wir ab, wie der GitterChip wirkt. Sein statisches Feld regt Wassermoleküle an, in den geordneten Zustand zu wechseln, den Dr. Warnke beschreibt.',
      'Die Moleküle finden in den Gleichtakt der Domänen nach Prof. Del Giudice. Wo dieses Wasser auf eine Oberfläche trifft, wächst die stabile Schicht, die Prof. Dr. Pollack gemessen hat.',
      'Jede Zelle ist eine solche Oberfläche. Sie ist von Wasser umgeben und besteht selbst zum größten Teil daraus. So entsteht die Kette, die der QiOne® 2 Pro anstößt: Feld, geordnetes Wasser, Zelle.',
      'Wie deutlich Zellen darauf reagieren, hat Prof. Dr. Peter C. Dartsch in fünf Studien gemessen.',
    ],
    grafik: {
      typ: 'kette',
      glieder: [
        {
          id: 'feld',
          titel: 'Feld',
          text: 'Der GitterChip trägt ein statisches Feld.',
          quelle: 'GitterChip™ im QiOne® 2 Pro',
        },
        {
          id: 'ordnung',
          titel: 'Ordnung',
          text: 'Wassermoleküle weiten sich und schwingen im Gleichtakt.',
          quelle: 'Dr. Warnke · Prof. Del Giudice',
        },
        {
          id: 'zelle',
          titel: 'Zelle',
          text: 'An der Zellmembran wächst die geordnete Schicht.',
          quelle: 'Prof. Dr. Pollack',
        },
      ],
      legende:
        'Die Kette, abgeleitet aus drei Forschungslinien: Feld, geordnetes Wasser, Zelle.',
    },
    weiter: {text: 'Weiter: Was die Zellstudien zeigen', anker: 'studien'},
  },
  {
    id: 'studien',
    anker: 'studien',
    glied: 'zelle',
    marke: 'Was die Zellstudien zeigen',
    titel: 'Fünf Studien, gemessen an Zellen im Labor',
    absaetze: [
      'Prof. Dr. Peter C. Dartsch hat die GitterChip-Technik an seinem Institut für zellbiologische Testsysteme untersucht. Fünf Studien sind international publiziert und Peer-Review-kontrolliert.',
      'Gemessen hat er an Immunzellen, Darmzellen, Leberzellen und Nervenzellen, unter Handystrahlung und unter oxidativem Stress.',
    ],
    diagramme: [
      {
        // e0001 laienSummary.punkte[0..1]: 60,5 ± 3,9 % und 84,7 ± 7,0 %
        // der unbestrahlten Kontrolle (Radikalbildung der Neutrophilen).
        id: 'immunzellen',
        titel: ['Abwehrleistung von Immunzellen', 'unter Handystrahlung'],
        messgroesse: 'Radikalbildung nach 4 Stunden, ohne Strahlung = 100 %',
        balken: [
          {bezeichnung: 'Ungeschützt', wert: 60.5, ton: 'ohne'},
          {bezeichnung: 'Mit QiOne® 2 Pro', wert: 84.7, ton: 'mit'},
        ],
        studie: 'studie-immunzellen',
        zeile: 'Studie zu QiOne® 2 Pro mit Immunzellen.',
      },
      {
        // Wie die Startseite (ZellDiagramme.jsx): Dartsch 2021, Abb. 5,
        // TEER relativ zur Kontrolle 6,0 ± 3,2 % und 72,6 ± 14,5 %.
        id: 'barriere',
        titel: ['Barrierefunktion der Zelle', 'unter E-Smog Stress'],
        messgroesse: 'Barriere-Widerstand, ohne E-Smog = 100 %',
        balken: [
          {bezeichnung: 'Ungeschützt', wert: 6.0, ton: 'ohne'},
          {bezeichnung: 'Mit QiOne® 2 Pro', wert: 72.6, ton: 'mit'},
        ],
        studie: 'studie-darmbarriere',
        zeile: 'Studie zu QiOne® 2 Pro mit Darmepithelzellen.',
      },
      {
        // Wie die Startseite: Dartsch 2021, Abb. 3, geschlossene Fläche
        // = 100 − verbleibende zellfreie Fläche (43,7 / 14,5 / 13,8 %).
        id: 'regeneration',
        titel: ['Zellregeneration', 'unter E-Smog Stress'],
        messgroesse: 'Geschlossene Fläche nach 8 h, ohne E-Smog 86,2 %',
        balken: [
          {bezeichnung: 'Ungeschützt', wert: 56.3, ton: 'ohne'},
          {bezeichnung: 'Mit QiOne® 2 Pro', wert: 85.5, ton: 'mit'},
        ],
        studie: 'studie-darmbarriere',
        zeile: 'Studie zu QiOne® 2 Pro mit Darmepithelzellen.',
      },
      {
        // Wie die Startseite: Dartsch 2024, Abb. 3A/3B, Hep G2, aus der
        // Abbildung abgelesen; Differenz 47 = publizierter Effekt 47,3 %.
        id: 'viabilitaet',
        titel: ['Lebende Leberzellen', 'unter oxidativem Stress'],
        messgroesse: 'Lebende Leberzellen nach 24 Stunden',
        balken: [
          {bezeichnung: 'Ungeschützt', wert: 41, stellen: 0, ton: 'ohne'},
          {bezeichnung: 'Mit QiBracelet®', wert: 88, stellen: 0, ton: 'mit'},
        ],
        studie: 'studie-oxidativer-stress',
        zeile: 'Studie zu QiBracelet® mit Leberzellen, gleiche GitterChip-Technik.',
      },
    ],
    kennzahlen: [
      {
        // e0005 laienSummary.punkte[0]: „53,3 % bessere Zellregeneration
        // neben dem QiHome® Air als ohne Gerät (p ≤ 0,01)“.
        id: 'qihome-air',
        wert: '53,3',
        anzeige: '+53,3 %',
        text: 'schnellere Zellregeneration bei Nervenzellen neben dem QiHome® Air',
        studie: 'studie-qihome-air',
        zeile: 'Studie zu QiHome® Air mit neuronalen Zellen.',
      },
      {
        // e0004 laienSummary: 171 freiwillig geteilte Erfahrungsberichte,
        // am häufigsten mehr Ruhe und Gelassenheit (rund 20 %).
        id: 'nutzer',
        wert: '171',
        anzeige: '171',
        text: 'Erfahrungsberichte ausgewertet, am häufigsten genannt: mehr Ruhe und Gelassenheit',
        studie: 'studie-nutzererfahrung',
        zeile: 'Studie zu QiOne® 2 Pro und QiBracelet® mit Nutzerbeobachtungen.',
      },
    ],
    weiter: {text: 'Weiter: Selbst erleben', anker: 'testen'},
  },
  {
    id: 'testen',
    anker: 'testen',
    glied: 'alle',
    marke: 'Selbst erleben',
    titel: 'Erlebe es selbst: 20 Tage zu Hause testen',
    absaetze: [
      'Trag den QiOne® 2 Pro 20 Tage lang zu Hause und unterwegs, bei der Arbeit und beim Sport.',
      'Überzeugt er dich nicht, schickst du ihn zurück und bekommst den vollen Kaufpreis erstattet.',
    ],
    kauf: {text: 'Zum QiOne® 2 Pro', href: KAUFWEG},
    neben: {text: 'Alle Studien im Überblick', href: '/pages/studien'},
  },
];

/** Die Quellenzeilen der Forschung, wortgleich aus dem SSoT-Konsumenten. */
export const QUELLEN = {
  titel: 'Quellen',
  forschung: wasserstruktur.quelle,
  studienTitel: 'Die fünf Studien',
};
