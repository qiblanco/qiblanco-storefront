/**
 * INHALT der Seite /pages/forschung: „Forschung bei Qi Blanco“.
 *
 * Christian, 24.09.2026, Sprachnachricht: „Wie versteht Qi Blanco Forschung?
 * Und wo sehen sie sich gerade selber? Und die erste Stufe ist immer noch: wir
 * sind immer noch in einer Beweisführung, dass es real ist … Und dann die
 * zweite Stufe … warum wirkt es unterschiedlich auf unterschiedliche
 * Zellarten, warum wirkt der Effekt über die Ferne hinweg, also diese ganzen
 * Warums aufzählen … dafür braucht es Grundlagenforschung. Und dann kommt
 * Stufe 3, eben das weltweite Ausrollen. Und das wird dann immer zügiger sein,
 * je mehr der Effekt, eben wie bei Fliegen und Aerodynamik, verstanden ist.“
 *
 * DIESE DATEI TRÄGT JEDEN SATZ DER SEITE. Die Darstellung
 * (app/components/campaign/ForschungSeite.jsx) trägt keinen Text.
 *
 * ZAHLEN: Jede Studienzahl steht in `zahlen` neben ihrer Studie (`studie` ist
 * der Slug der Studienseite). test/forschung-seite.test.mjs prüft, dass jede
 * dieser Zahlen wörtlich in app/data/studien/<id>.json steht, also in der
 * Übersetzung der Originalarbeit. Wer hier eine Zahl ändert, ohne sie dort zu
 * finden, macht den Test rot.
 *
 * WAS BEWUSST FEHLT: die Hauptmessgröße des Versuchsplans für die Studie am
 * Menschen (Stand 14.09.2026, intern). Ein gesundheitsbezogener Endpunkt auf
 * einer Seite des Herstellers berührt die Frage der Zweckbestimmung, die der
 * Versuchsplan selbst als Vorfrage vor allem anderen nennt. Die Seite nennt
 * deshalb nur die Bauweise der Studie. Ebenso fehlt jede Zusage, ein
 * negatives Ergebnis zu veröffentlichen: das ist nach Abschnitt 8.3 des
 * Versuchsplans Christians offene Entscheidung.
 *
 * Echte Umlaute (kundensichtbar). Der Shop duzt.
 */

const ZAHLWORTE = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
const zahlwort = (n) => ZAHLWORTE[n] || String(n);

export const PFAD = '/pages/forschung';

export const SEITE = {
  pfad: PFAD,
  titel: 'Forschung bei Qi Blanco: beweisen, verstehen, weltweit ausrollen',
  beschreibung:
    'Wie Qi Blanco Forschung versteht: erst der Beweis, dass die Effekte real und reproduzierbar sind, dann Grundlagenforschung an den offenen Warums, dann das weltweite Ausrollen.',
  dachzeile: 'Wie wir Forschung verstehen',
  h1: 'Forschung bei Qi Blanco',
  kurz: [
    'Forschung ist für uns ein Weg in drei Stufen. Zuerst beweisen wir, dass die Effekte, die wir beobachten, real und reproduzierbar sind. Dann erforschen wir, warum sie so auftreten. Dann rollen wir weltweit aus.',
    'Heute stehen wir in Stufe 1. Je besser ein Effekt verstanden ist, desto zügiger geht das Ausrollen. Beim Fliegen war es genauso.',
  ],
  inhaltTitel: 'Die fünf Abschnitte',
};

/**
 * Der Weg in drei Stufen, Kopfgrafik und Legende darunter. `stand` sagt, wie
 * weit Stufe 1 gegangen ist: der Anteil der erreichten Sprossen (SPROSSEN
 * unten), also keine eigene Zahl.
 */
export const WEG = {
  stufen: [
    {nr: 1, name: 'Beweis', zeile: 'real und reproduzierbar'},
    {nr: 2, name: 'Grundlagen', zeile: 'die Warums verstehen'},
    {nr: 3, name: 'Weltweit', zeile: 'zügig ausrollen'},
  ],
  hier: 'Hier stehen wir',
  legende:
    'Drei Stufen, ein Weg. Gold ist der gegangene Teil: Wir stehen in Stufe 1, auf der dritten von fünf Sprossen.',
};

/**
 * Die fünf Sprossen der Reproduzierbarkeit. `stand`: erreicht | offen | geplant.
 * Stufe 1 ist abgeschlossen, wenn alle fünf stehen.
 */
export const SPROSSEN = [
  {
    nr: 1,
    titel: 'Im Versuch',
    text: 'Jede Messung läuft mehrfach nebeneinander.',
    stand: 'erreicht',
  },
  {
    nr: 2,
    titel: 'Im Labor',
    text: 'Drei bis vier unabhängige Versuchsreihen je Zellstudie, über Wochen und Monate, jede mit eigener Kontrolle.',
    stand: 'erreicht',
  },
  {
    nr: 3,
    titel: 'Über Studien hinweg',
    text: 'Der Effekt zeigt sich mit drei Geräten, an sieben Zelllinien und unter zwei Arten von Belastung.',
    stand: 'erreicht',
  },
  {
    nr: 4,
    titel: 'In anderen Händen',
    text: 'Ein zweites, unabhängiges Labor wiederholt einen Versuch nach demselben Protokoll.',
    stand: 'offen',
  },
  {
    nr: 5,
    titel: 'Am Menschen',
    text: 'Eine Studie gegen ein Schein-Gerät, verblindet und vor dem ersten Teilnehmer registriert.',
    stand: 'geplant',
  },
];

export const STAND_TEXT = {
  erreicht: 'Erreicht',
  offen: 'Als Nächstes',
  geplant: 'Versuchsplan liegt vor',
};

const ERREICHT = SPROSSEN.filter((s) => s.stand === 'erreicht').length;

/** Anteil der gegangenen Strecke in Stufe 1, für die Kopfgrafik. */
export const STAND_STUFE_1 = ERREICHT / SPROSSEN.length;

/**
 * Die Rahmenbedingungen der fünf Studien, je eine Karte. `zahlen` sind die
 * Zeichenfolgen, die der Test in der Studie wiederfinden muss.
 */
export const STUDIEN_RAHMEN = [
  {
    studie: 'studie-immunzellen',
    titel: 'Immunzellen, 2021',
    produkt: 'QiOne® 2 Pro',
    zeilen: [
      ['Zellen', 'Menschliche Immunzellen (HL-60), zu Neutrophilen ausgereift'],
      ['Belastung', 'Sendendes Smartphone, SAR 0,76 W/kg'],
      ['Dauer', '4 Stunden, gemessen 20 Stunden danach'],
      ['Anordnung', 'Kulturflaschen auf dem Display und an der Rückseite'],
    ],
    ergebnis: 'Radikalbildung der Abwehr: 60,5 % der Kontrolle ohne Schutz, 84,7 % mit QiOne® 2 Pro',
    zahlen: ['0,76', '60,5', '84,7', '20 Stunden'],
  },
  {
    studie: 'studie-darmbarriere',
    titel: 'Darmbarriere, 2021',
    produkt: 'QiOne® 2 Pro',
    zeilen: [
      ['Zellen', 'Darmzellen vom Schwein (IPEC-J2)'],
      ['Belastung', 'Sendendes Smartphone mit WLAN'],
      ['Dauer', '4 Stunden, Barriere 24 Stunden danach gemessen'],
      ['Anordnung', 'Kulturschale auf dem Display'],
    ],
    ergebnis: 'Barrierewiderstand: 6,0 % der Kontrolle ohne Schutz, 72,6 % mit QiOne® 2 Pro',
    zahlen: ['6,0', '72,6', '24 Stunden'],
  },
  {
    studie: 'studie-oxidativer-stress',
    titel: 'Oxidativer Stress, 2024',
    produkt: 'QiBracelet®',
    zeilen: [
      ['Zellen', 'Fünf Zelllinien: Leber, Bindegewebe, Niere, Darm, Lunge'],
      ['Belastung', 'Wasserstoffperoxid, 0,25 bis 3 mM'],
      ['Dauer', '24 Stunden'],
      ['Anordnung', 'Kontrolle 20 Meter entfernt, mehrere Hauswände dazwischen'],
    ],
    ergebnis: 'Schutzgrad unter Stress: von 3,9 % bei Lunge bis 47,3 % bei Leber',
    zahlen: ['0,25', '3 mM', '20 Meter', '3,9', '47,3'],
  },
  {
    studie: 'studie-nutzererfahrung',
    titel: 'Anwenderberichte, 2024',
    produkt: 'QiOne® 2 Pro und QiBracelet®',
    zeilen: [
      ['Grundlage', '171 freiwillig veröffentlichte Berichte aus sozialen Medien'],
      ['Erhebung', 'Ohne Fragebogen, in den eigenen Worten der Anwender'],
    ],
    ergebnis: 'Je rund 20 % nennen mehr Ruhe und tieferen Schlaf, rund 17 % mehr Energie',
    zahlen: ['171', '20 %', '17 %'],
  },
  {
    studie: 'studie-qihome-air',
    titel: 'Nervenzellen, 2026',
    produkt: 'QiHome® Air',
    zeilen: [
      ['Zellen', 'Menschliche Nervenzellen (SH-SY5Y) und Immunzellen (HL-60)'],
      ['Belastung', 'Künstliche Lücke im Zellrasen; Wasserstoffperoxid'],
      ['Dauer', '10 Stunden, 24 Stunden und 3 Tage'],
      ['Anordnung', 'Gerät etwa 2 Meter neben dem Inkubator, Kontrolle in einem Haus 1,5 km entfernt'],
    ],
    ergebnis: 'Lücke 53,3 % besser geschlossen; Radikalbildung 16,4 % niedriger bei 20,7 % mehr Grundstoffwechsel',
    zahlen: ['10 Stunden', '2 Meter', '1,5 km', '53,3', '16,4', '20,7'],
  },
];

/**
 * Die offenen Warums. Jedes trägt denselben Aufbau: die Frage, der Befund aus
 * einer Studie, unsere Hypothese, der Versuch, der sie prüft. Die Reihenfolge
 * folgt Christians Aufzählung, danach die Warums, die die Studienlage selbst
 * aufwirft.
 */
export const WARUMS = [
  {
    id: 'zellarten',
    frage: 'Warum wirkt es auf verschiedene Zellarten verschieden stark?',
    befund:
      'Unter Wasserstoffperoxid zeigte das QiBracelet® bei allen fünf Zellarten einen Schutzeffekt. Er reichte von 47,3 % bei Leberzellen bis 3,9 % bei Lungenzellen. Schon ohne Gerät waren die Zellarten verschieden empfindlich: Von den Lungenzellen überlebten 84 %, von den Bindegewebszellen 24 %.',
    hypothese:
      'Der Effekt ist dort am größten, wo eine Zelle selbst viel Radikallast trägt, etwa im stoffwechselstarken Lebergewebe. Lungenzellen, die den Stress ohnehin gut überstehen, gewinnen wenig.',
    versuch:
      'Vor dem Versuch Stoffwechselrate und eigene Radikallast jeder Zelllinie messen und gegen den Effekt auftragen. Dazu weitere Zelllinien mit bekannter Stoffwechselrate. Stimmt die Rangfolge, ist dieses Warum beantwortet.',
    studie: 'studie-oxidativer-stress',
    zahlen: ['47,3', '3,9', '84 %', '24 %'],
    grafik: {
      typ: 'zellarten',
      titel: 'Schutzgrad je Zellart unter Wasserstoffperoxid',
      werte: [
        {name: 'Leber', wert: 47.3, anzeige: '47,3 %'},
        {name: 'Bindegewebe', wert: 29.6, anzeige: '29,6 %'},
        {name: 'Niere', wert: 27.1, anzeige: '27,1 %'},
        {name: 'Darm', wert: 18.0, anzeige: '18,0 %'},
        {name: 'Lunge', wert: 3.9, anzeige: '3,9 %'},
      ],
      legende: 'Unter Wasserstoffperoxid, neben dem QiBracelet®. Prof. Dr. Peter C. Dartsch, 2024.',
    },
  },
  {
    id: 'ferne',
    frage: 'Warum wirkt der Effekt über die Ferne hinweg?',
    befund:
      'Der QiHome® Air stand etwa 2 Meter neben dem Inkubator, ohne Kontakt zu den Zellen. Die Kontrolle stand in einem anderen Haus, 1,5 km entfernt. In der QiBracelet®-Studie lagen 20 Meter und mehrere Hauswände zwischen den beiden Inkubatoren.',
    hypothese:
      'Der Effekt braucht keine Berührung. Unsere Hypothese: Ein Feld ordnet das Wasser in der Umgebung, und diese Ordnung erreicht die Zellen.',
    versuch:
      'Dasselbe Gerät in 0,5, 2, 5 und 20 Metern Abstand messen und dazwischen Abschirmungen stellen, etwa Metall oder eine Wand aus Wasser. Wie der Effekt mit dem Abstand abfällt und was ihn aufhält, verrät, welcher Art sein Träger ist.',
    studie: 'studie-qihome-air',
    zahlen: ['2 Meter', '1,5 km'],
    zweitstudie: 'studie-oxidativer-stress',
    zweitzahlen: ['20 Meter'],
    grafik: {
      typ: 'abstand',
      titel: 'So standen Gerät, Zellen und Kontrolle',
      produkt: 'QiHome® Air',
      zellen: 'Zellen',
      kontrolle: 'Kontrolle',
      nah: 'etwa 2 m',
      fern: '1,5 km',
      legende: 'Versuchsaufbau der QiHome®-Air-Studie. Prof. Dr. Peter C. Dartsch, 2026.',
    },
  },
  {
    id: 'nachwirkung',
    frage: 'Warum hält der Unterschied an, wenn das Gerät weg ist?',
    befund:
      'In der Immunzellstudie wirkte das Smartphone 4 Stunden auf die Zellen, mit und ohne QiOne® 2 Pro. Gemessen wurde erst 20 Stunden danach, und der Unterschied war da. Die Darmbarriere zeigte ihn 24 Stunden nach der Bestrahlung.',
    hypothese:
      'Die Zellen tragen den Zustand weiter, in dem sie die Belastung überstanden haben. Oder die Ordnung im Wasser hält länger an als die Einwirkung.',
    versuch:
      'Nach dem Ende der Einwirkung zu mehreren Zeitpunkten messen, etwa nach 0, 4, 20 und 48 Stunden. Und das Gerät erst nach der Belastung dazustellen. So trennt sich der Schutz während der Belastung von der Erholung danach.',
    studie: 'studie-immunzellen',
    zahlen: ['4 Stunden', '20 Stunden'],
    zweitstudie: 'studie-darmbarriere',
    zweitzahlen: ['24 Stunden'],
  },
  {
    id: 'belastungsgrad',
    frage: 'Warum wächst der Unterschied mit der Belastung?',
    befund:
      'Neben dem QiHome® Air lag die Lebensfähigkeit der Nervenzellen bei 1 mM Wasserstoffperoxid 34 % über der Kontrolle, bei 1,5 mM mehr als 80 % darüber. Dauer und Abstand waren in jeder Studie fest eingestellt.',
    hypothese: 'Der Effekt setzt am Stress an. Wo mehr abzupuffern ist, wird er größer.',
    versuch:
      'Belastung, Dauer und Abstand in einem Raster kreuzen: mehrere Konzentrationen, 1 bis 24 Stunden, 0,5 bis 5 Meter. Daraus entsteht eine Dosis-Wirkungs-Kurve, die Grundlage jeder späteren Prüfnorm.',
    studie: 'studie-qihome-air',
    zahlen: ['1 mM', '34 %', '1,5 mM', '80 %'],
  },
  {
    id: 'gitter',
    frage: 'Warum reagiert Wasser auf ein statisches Gitter?',
    befund:
      'Der GitterChip™ ist ein Gitter aus einer 750er Goldlegierung, gefasst in Chirurgenstahl. Er hat keine Elektronik und keinen Akku und sendet nichts. Die Publikationen beschreiben sein statisches Feld als Anstoß für Wassermoleküle, in den kohärenten Zustand zu wechseln.',
    hypothese:
      'Das präzise geschnittene Gitter gibt dem benachbarten Wasser eine Vorlage, an der es sich ausrichtet.',
    versuch:
      'Das Wasser selbst messen statt der Zellen: Infrarot-Spektrum, elektrische Eigenschaften und die Breite der geordneten Schicht an Oberflächen. Einmal neben einem echten Chip, einmal neben einem baugleichen Gehäuse ohne Gitter, verblindet ausgewertet.',
    link: {href: '/pages/hypothesen#h3-gitter-als-vorlage', text: 'Die Hypothese „Der Chip als Vorlage“ mit ihren Quellen'},
  },
  {
    id: 'modelle',
    frage: 'Warum passen drei Modelle auf denselben Befund, und welches trägt ihn?',
    befund:
      'Drei Forschungslinien beschreiben geordnetes Wasser. Dr. Ulrich Warnke beschreibt, wie ein Wassermolekül Energie aufnimmt. Prof. Emilio Del Giudice und Prof. Giuliano Preparata beschreiben kohärente Domänen, in denen viele Moleküle im Gleichtakt schwingen. Prof. Dr. Gerald Pollack hat an Oberflächen eine geordnete Schicht gemessen, das EZ-Wasser.',
    hypothese:
      'Die drei beschreiben dieselbe Ordnung auf drei Größenordnungen: im einzelnen Molekül, in der Domäne und an der Oberfläche.',
    versuch:
      'Aus jedem Modell eine Vorhersage ableiten, die die anderen nicht machen, und sie messen. Wächst die geordnete Schicht neben dem GitterChip™ schneller, und unter Infrarotlicht noch stärker, spricht das für den Weg über das EZ-Wasser nach Prof. Dr. Pollack.',
    link: {href: '/pages/was-ist-kohaerentes-wasser', text: 'Kohärentes Wasser einfach erklärt'},
  },
  {
    id: 'belastungen',
    frage: 'Warum wirkt es gegen Funkstrahlung und gegen chemischen Stress?',
    befund:
      'Die beiden Studien zum QiOne® 2 Pro arbeiteten mit einem sendenden Smartphone. Die Studien zum QiBracelet® und zum QiHome® Air arbeiteten mit Wasserstoffperoxid, einem chemischen Stressor. Unter beiden Belastungen schnitten die Zellen mit Gerät besser ab.',
    hypothese:
      'Beide Belastungen enden in der Zelle am selben Punkt, einem Überschuss an Radikalen. Dort setzt der Effekt an.',
    versuch:
      'Unter beiden Belastungen dieselben Radikal-Marker messen und eine dritte Belastung dazunehmen, etwa UV-Licht oder Wärme. Trifft die Vorhersage auch dort, ist der gemeinsame Angriffspunkt gefunden.',
  },
  {
    id: 'richtung',
    frage: 'Warum steigt die Radikalbildung der Immunzellen einmal und sinkt ein anderes Mal?',
    befund:
      'Unter dem sendenden Smartphone fiel die Radikalbildung der Immunzellen auf 60,5 % der Kontrolle, mit QiOne® 2 Pro lag sie bei 84,7 %. Ohne Smartphone, neben dem QiHome® Air, sank sie um 16,4 %, während ihr Grundstoffwechsel um 20,7 % stieg.',
    hypothese:
      'Der Effekt schiebt die Zelle zu ihrem Normalwert zurück. Eine gedämpfte Abwehr steigt, ein Überschuss sinkt.',
    versuch:
      'Beide Lagen in einem Versuch kreuzen: mit und ohne Belastung, jeweils mit und ohne Gerät, an denselben Zellen und mit demselben Gerät. Zieht das Gerät die Radikalbildung beide Male zum selben Wert, trägt die Hypothese.',
    studie: 'studie-immunzellen',
    zahlen: ['60,5', '84,7'],
    zweitstudie: 'studie-qihome-air',
    zweitzahlen: ['16,4', '20,7'],
  },
];

/** Die Aussageklassen stehen als Überschrift über ihrem Absatz. */
export const WARUM_TEILE = [
  {feld: 'befund', titel: 'Befund'},
  {feld: 'hypothese', titel: 'Unsere Hypothese'},
  {feld: 'versuch', titel: 'Der Versuch'},
];

/**
 * Die fünf Abschnitte der Seite. Jeder endet mit einem Weiter auf den
 * nächsten Anker, der letzte mit der Einladung.
 */
export const ABSCHNITTE = [
  {
    id: 'verstaendnis',
    anker: 'verstaendnis',
    marke: 'Unser Forschungsverständnis',
    titel: 'Forschung ist ein Weg in drei Stufen',
    absaetze: [
      'Wir beobachten Effekte an Zellen im Labor, und wir wollen sie verstehen. Dafür gehen wir drei Stufen, in dieser Reihenfolge.',
    ],
    stufen: [
      {
        nr: 1,
        name: 'Beweis',
        text: 'Wir zeigen, dass die Effekte real sind und sich wiederholen lassen, unter genau benannten Rahmenbedingungen.',
      },
      {
        nr: 2,
        name: 'Grundlagen',
        text: 'Wir erforschen für jeden Effekt, warum er so auftritt. Jede offene Frage bekommt eine Hypothese und einen Versuch.',
      },
      {
        nr: 3,
        name: 'Weltweit',
        text: 'Wir rollen aus. Je mehr Warums beantwortet sind, desto zügiger geht es.',
      },
    ],
    fliegen: {
      titel: 'Das Bild dahinter: Fliegen',
      absaetze: [
        'Menschen flogen, lange bevor die Aerodynamik verstanden war. Otto Lilienthal glitt ab 1891 durch die Luft, die Brüder Wright flogen 1903 mit Motor.',
        'Dazwischen bauten die Wrights 1901 einen eigenen Windkanal und maßen darin rund 200 Flügelformen. Die Theorie, warum ein Flügel trägt, entstand in denselben Jahren, mit Kutta, Joukowski und Prandtl.',
        'Erst dieses Verstehen machte Fliegen sicher, planbar und weltweit. Denselben Weg gehen wir mit unseren Effekten.',
      ],
    },
    weiter: {anker: 'stufe-1-beweis', text: 'Weiter zu Stufe 1: Wo der Beweis heute steht'},
  },
  {
    id: 'beweis',
    anker: 'stufe-1-beweis',
    marke: 'Stufe 1 · Beweisführung',
    titel: 'Beweisen, dass die Effekte real und reproduzierbar sind',
    absaetze: [
      'Fünf Arbeiten sind von 2021 bis 2026 international mit Peer-Review erschienen. Vier davon sind Zellstudien, eine wertet 171 Berichte von Anwendern aus. Alle fünf stammen von Prof. Dr. Peter C. Dartsch und seinem Institut Dartsch Scientific, und wir haben sie beauftragt.',
      'In den Zellstudien lief jeder Versuch gegen eine Kontrolle ohne Gerät, in drei bis vier unabhängigen Versuchsreihen. Ausgewertet wurde auf dem strengen Signifikanzniveau p ≤ 0,01.',
    ],
    rahmenTitel: 'Die Rahmenbedingungen der fünf Studien',
    reproTitel: 'Was reproduzierbar konkret heißt',
    reproIntro:
      'Reproduzierbar heißt: Wer den Versuch wiederholt, findet denselben Effekt. Das hat fünf Sprossen, und jede ist schwerer zu nehmen als die davor.',
    reproSchluss: `Wir stehen auf Sprosse ${ERREICHT}. Stufe 1 ist abgeschlossen, wenn auch die Sprossen ${ERREICHT + 1} und ${SPROSSEN.length} stehen.`,
    naechsterTitel: 'Der nächste Nachweis',
    naechster: [
      'Für die Studie am Menschen liegt seit dem 14. September 2026 ein Versuchsplan im Entwurf vor. Verglichen wird mit einem Schein-Gerät, das von außen nicht zu unterscheiden ist.',
      'Weder die Teilnehmer noch die Untersucher wissen, wer welches Gerät trägt. Eine einzige Hauptmessgröße steht vor dem ersten Teilnehmer fest und wird im Deutschen Register Klinischer Studien eingetragen.',
      'Am stärksten wird sie, wenn eine Hochschule sie leitet. Dann stehen die Sprossen 4 und 5 in einem Schritt.',
    ],
    weiter: {anker: 'stufe-2-warum', text: 'Weiter zu Stufe 2: die offenen Warums'},
  },
  {
    id: 'grundlagen',
    anker: 'stufe-2-warum',
    marke: 'Stufe 2 · Grundlagenforschung',
    titel: 'Für jeden Effekt muss erkennbar sein, warum',
    absaetze: [
      'Jeder Befund aus Stufe 1 wirft eine Frage auf. Solange sie offen ist, wissen wir, dass etwas wirkt, aber nicht warum. Diese Antworten liefert nur Grundlagenforschung.',
      'Prof. Dr. Peter C. Dartsch schließt seine Arbeit zum QiBracelet® selbst mit diesem Schritt: Weitere Forschung sei nötig, um die zugrunde liegenden Mechanismen zu verstehen.',
    ],
    modellLink: {href: '/pages/hypothesen', text: 'Unser ganzes Wirkmodell mit allen Quellen'},
    weiter: {anker: 'stufe-3-weltweit', text: 'Weiter zu Stufe 3: weltweit ausrollen'},
  },
  {
    id: 'weltweit',
    anker: 'stufe-3-weltweit',
    marke: 'Stufe 3 · Weltweites Ausrollen',
    titel: 'Je mehr verstanden ist, desto zügiger geht es weltweit',
    absaetze: [
      'Ausrollen heißt: Menschen in allen Ländern erreichen, in jeder Stückzahl und in gleicher Qualität. Jedes beantwortete Warum räumt dafür ein Hindernis aus dem Weg.',
    ],
    hebel: [
      {
        titel: 'Produktion',
        text: 'Wer weiß, welche Eigenschaft des Gitters wirkt, prüft jedes Stück vor dem Versand genau daran. So bleibt die Qualität in jeder Stückzahl gleich.',
      },
      {
        titel: 'Normen',
        text: 'Eine messbare Größe lässt sich in eine Prüfnorm schreiben. Nach ihr misst jedes Labor der Welt gleich, und Ergebnisse werden vergleichbar.',
      },
      {
        titel: 'Zulassungen',
        text: 'Jeder neue Markt fragt: Was wirkt, und woran misst man es? Mit einem verstandenen Mechanismus beantworten wir beides mit Messwerten.',
      },
      {
        titel: 'Partner',
        text: 'Hochschulen und Institute bauen auf einem verstandenen Effekt auf, statt ihn erst prüfen zu müssen. Aus einer Firma, die forscht, wird ein Forschungsfeld.',
      },
      {
        titel: 'Produkte',
        text: 'Wer versteht, warum Leberzellen stärker reagieren als Lungenzellen, entwickelt gezielt statt durch Ausprobieren.',
      },
    ],
    schluss:
      'Beim Fliegen war es dasselbe. Mit der Aerodynamik wurde aus einzelnen Flügen ein Verkehr um die ganze Welt.',
    weiter: {anker: 'standort', text: 'Weiter: Wo wir heute stehen'},
  },
  {
    id: 'standort',
    anker: 'standort',
    marke: 'Standort',
    titel: 'Wo Qi Blanco heute steht',
    absaetze: [
      `Wir stehen in Stufe 1, auf Sprosse ${ERREICHT}. Die Effekte sind gemessen, in unabhängigen Versuchsreihen wiederholt und an sieben Zelllinien gesehen.`,
      `Den Abschluss von Stufe 1 bringen andere Hände: ein zweites Labor und eine Studie am Menschen. Stufe 2 liegt als Liste bereit, ${zahlwort(WARUMS.length)} Warums mit je einem Versuch.`,
    ],
    spalten: [
      {
        titel: 'Erreicht',
        punkte: [
          'Fünf veröffentlichte Arbeiten, 2021 bis 2026',
          'Sieben Zelllinien, drei Geräte, zwei Arten von Belastung',
          'Drei bis vier unabhängige Versuchsreihen je Zellstudie',
        ],
      },
      {
        titel: 'Als Nächstes',
        punkte: [
          'Wiederholung in einem zweiten, unabhängigen Labor',
          'Studie am Menschen nach dem Versuchsplan vom 14. September 2026',
        ],
      },
      {
        titel: 'Danach',
        punkte: [
          `Grundlagenforschung an den ${zahlwort(WARUMS.length)} Warums`,
          'Weltweites Ausrollen, zügiger mit jedem beantworteten Warum',
        ],
      },
    ],
    einladung: {
      titel: 'Forsch mit uns',
      text: 'Wir suchen Labore und Hochschulen, die einen unserer Versuche wiederholen oder eines der Warums mit uns erforschen. Schreib uns.',
      knopf: {href: 'mailto:info@qiblanco.com?subject=Forschung%20mit%20Qi%20Blanco', text: 'Zusammenarbeit anfragen'},
      neben: {href: '/pages/studien', text: 'Die fünf Studien im Überblick'},
    },
  },
];

export const QUELLEN_TITEL = 'Die fünf Arbeiten';

/** Kleine Beschriftungen der Darstellung, damit ForschungSeite.jsx keinen Text trägt. */
export const BESCHRIFTUNG = {
  zurStudie: 'Zur Studie',
  warum: 'Warum',
};
