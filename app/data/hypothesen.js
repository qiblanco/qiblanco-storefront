/**
 * INHALTS-SSoT der Hypothesen-Fläche `/pages/hypothesen`.
 *
 * Auftrag 20260911-BAU-pages-hypothesen (Christian, 2026-09-11, wörtlich:
 * „Sowas wie ‚Qi Blanco – unsere Hypothesen‘ und dann das ganze Wirkmodell von
 * Qi Blanco einstellen, so wie wir es erarbeitet haben, mit Stärken und
 * Schwächen. Aber noch nicht crawlbar machen … Und sehr viele Quellen
 * einstellen.").
 *
 * ABGRENZUNG ZU /pages/kritik — die Trennung ist der Wert, nicht die Schwäche:
 *   kritik     sagt: das ist gemessen, das nicht, und mehr behaupten wir nicht.
 *   hypothesen sagt: das ist unser Modell, das spricht dafür, das dagegen,
 *                    und hier sind die Quellen.
 * Wer sagt, wo sein Beleg endet, wird für das geglaubt, was er belegt.
 *
 * DER AUFBAU IST DIE TRAGENDE ENTSCHEIDUNG DES AUFTRAGS: jede Hypothese trägt
 * DIESELBEN VIER FELDER, damit man sie vergleichen kann —
 *   (1) `satz`          die Hypothese in einem Satz, ohne Fachwort;
 *   (2) `pro[]`         was dafür spricht, je mit Quellen statt Adjektiven;
 *   (3) `contra[]`      was dagegen spricht oder offen ist — ZUERST benannt,
 *                       nicht ans Ende gedrängt;
 *   (4) `bedeutet` / `bedeutetNicht`  was das für unser Produkt heißt — und
 *                       was ausdrücklich nicht.
 * Feld (4) ist das am leichtesten zu verfehlende: `bedeutetNicht` ist Pflicht
 * und darf NIE leer sein. Eine Hypothese ohne benannte Grenze ist auf dieser
 * Seite keine Hypothese, sondern eine Behauptung — und dann gehört sie nicht
 * hierher.
 *
 * `stand` ist die ehrliche Selbsteinschätzung und steuert NUR die Textmarke,
 * nie eine Farbe: die Seite hat genau EINEN Akzent, und der sitzt nicht auf
 * dem Urteil. Vier Werte, absichtlich auch der unangenehme:
 *   tragfaehig  — physikalisch gut belegt, unabhängig von uns
 *   teilweise   — belegt, aber nicht in unserem Anwendungsfall
 *   offen       — plausibel hergeleitet, nicht gemessen
 *   schwach     — es gibt eine Arbeit, die dagegen spricht, und wir nennen sie
 *
 * KEINE ZAHL, DIE NICHT IN DER ARBEIT SELBST STEHT. Die Werte aus dem
 * STUDIEN_FAKTENBLATT (Basalstoffwechsel, HRV) stehen in keinem der PDFs und
 * kommen deshalb hier nicht vor.
 *
 * Echte Umlaute (kundensichtbar, Hausregel). Der Shop duzt, durchgehend.
 */

/** Textmarken für `stand` — Text trägt das Urteil, nicht die Farbe. */
export const STAND = {
  tragfaehig: {
    kuerzel: 'tragfaehig',
    text: 'Gut belegt – unabhängig von uns',
  },
  teilweise: {
    kuerzel: 'teilweise',
    text: 'Belegt, aber nicht für unseren Fall',
  },
  offen: {
    kuerzel: 'offen',
    text: 'Hergeleitet, nicht gemessen',
  },
  schwach: {
    kuerzel: 'schwach',
    text: 'Hier spricht eine Arbeit dagegen',
  },
};

/**
 * Warum es Qi Blanco gibt — Christians Geschichte, in seinen Worten.
 *
 * QUELLE DER WÖRTLICHEN ABSÄTZE: app/components/kurse/Superhuman.jsx
 * („Über mich – Christian Bernd Bauer"), unverändert übernommen. Das ist der
 * stärkste Inhalt, den das Haus besitzt, und er stand bisher nur im Kurs.
 * Er gehört an den ANFANG: nicht als Marketing, sondern als Antwort auf die
 * Frage, warum jemand sich das antut.
 */
export const GESCHICHTE = {
  // Hieß bis 2026-09-11 'Warum es Qi Blanco gibt'. Geändert, weil der
  // Abschnitt darüber jetzt genau diese Frage trägt (und die eigene Seite
  // /pages/warum-qi-blanco ebenso) — zwei Abschnitte mit derselben
  // Überschrift auf einer Seite lesen sich wie ein Fehler, und eine Maschine
  // kann sie nicht auseinanderhalten. Dieser hier ist die persönliche
  // Herkunft, der andere die Absicht.
  vorspann: 'Woher es kommt',
  titel: 'Die Geschichte fängt mit einem Problem an, nicht mit einem Produkt',
  absaetze: [
    'Qi Blanco ist nicht aus einer Marktlücke entstanden, sondern aus einer Notlage. Christian Bernd Bauer, der Gründer, hat das Unternehmen nicht gegründet, weil er etwas verkaufen wollte, sondern weil er für sich selbst eine Antwort gesucht hat. Was er dazu sagt, steht hier unverändert so, wie er es seit Jahren in seinem Kurs erzählt.',
  ],
  zitat: {
    absaetze: [
      'Meine persönliche Leidensgeschichte hat mich dazu gebracht, den menschlichen Körper aus Sicht eines Ingenieurs, Physikers und Biochemikers zu betrachten.',
      'Mit dem Wissen, das ich angewandt und hier in diesem kostenfreien Kurs zusammengeschrieben habe, gelang es mir mein Burnout zu überwinden, dauerhaft 10 kg abzunehmen und meinen Haarausfall aufzuhalten und diesen sogar langsam wieder umzukehren.',
      'Ich habe mich dazu entschieden, diesen Kurs kostenlos anzubieten, weil ich glaube, dass jeder Mensch ein tieferes Verständnis von seinem Körper haben sollte, damit Leute wie du und ich in der Lage sind, unsere eigenen Entscheidungen zu treffen.',
    ],
    wer: 'Christian Bernd Bauer, Gründer von Qi Blanco',
  },
  nachsatz: [
    'Diese drei Berufsbilder – Ingenieur, Physiker, Biochemiker – erklären, warum das Modell auf dieser Seite so aussieht, wie es aussieht: es ist von der Physik her gedacht und nicht von der Medizin her. Das ist seine Stärke und zugleich seine größte Schwäche, und beides steht weiter unten.',
    'Was hier ausdrücklich nicht steht: dass seine Erfahrung ein Beleg ist. Eine persönliche Geschichte erklärt eine Motivation. Sie beweist keine Wirkung – auch nicht die eigene. Alles, was auf dieser Seite als Beleg auftritt, ist eine nachlesbare Arbeit mit Autor, Jahr und Fundstelle.',
  ],
};

/**
 * DIE HYPOTHESEN — die Kette des Wirkmodells, Glied für Glied.
 *
 * REIHENFOLGE = KETTE, nicht Wichtigkeit: von dem, was am besten belegt ist
 * (Physik des Grenzflächenwassers), zu dem, was am schwächsten belegt ist
 * (unser eigener Chip). Die Kette wird dadurch nach hinten schwächer — das ist
 * die ehrliche Form, und es ist genau die Stelle, an der ein Leser sie prüfen
 * können soll.
 */
export const HYPOTHESEN = [
  {
    id: 'h1-grenzflaechenwasser',
    kurz: 'Wasser an Grenzflächen',
    satz: 'Direkt an einer Oberfläche verhält sich Wasser anders als ein paar Millimeter weiter weg – es ordnet sich dort.',
    stand: 'tragfaehig',
    pro: [
      {
        text: 'Pollacks Labor hat an hydrophilen Oberflächen eine Zone gefunden, aus der Mikrokügelchen und gelöste Stoffe verdrängt werden. Sie ist bis zu mehrere hundert Mikrometer breit – für Wasser eine enorme Reichweite – und ihre Eigenschaften unterscheiden sich messbar vom übrigen Wasser: anderes elektrisches Potential, anderer pH-Wert am Rand, anderes Verhalten im Infrarot.',
        quellen: ['pollack-2013', 'pollack-2010', 'pollack-2001'],
      },
      {
        text: 'Der Aufbau der Zone braucht Energie von außen, vor allem Infrarotlicht. Das ist die Messung, die am schwersten wegzuerklären ist: bestrahlt man die Zone, wächst sie – ein Artefakt der Probenvorbereitung würde sich nicht so verhalten.',
        quellen: ['pollack-2013', 'nhan-pollack-2011'],
      },
      {
        text: 'Dass Grenzflächenwasser eigene Eigenschaften hat, ist unabhängig von Pollack Gegenstand der physikalischen Chemie. Strittig ist die Reichweite und die Deutung, nicht die Existenz des Phänomens.',
        quellen: ['wang-pollack-2021', 'so-pollack-2011'],
      },
    ],
    contra: [
      {
        text: 'Wie breit die Zone wirklich ist und wodurch sie zustande kommt, ist in der Fachwelt nicht entschieden. Es gibt gut begründete Gegenvorschläge, die ohne eine eigene „vierte Phase" auskommen und die Beobachtungen über bekannte Effekte an Grenzflächen erklären. Pollacks Deutung ist eine Deutung, kein Konsens.',
        quellen: ['pollack-2013'],
      },
      {
        text: 'Fast alle diese Messungen kommen aus einem einzigen Labor, und zwar aus Pollacks eigenem. Unabhängige Wiederholung in der Breite fehlt. Das ist keine Unterstellung, sondern der übliche Maßstab: eine Beobachtung wird durch Wiederholung woanders stark, nicht durch Wiederholung am selben Ort.',
        quellen: ['pollack-2013', 'pollack-2010'],
      },
    ],
    bedeutet:
      'Das ist das Fundament, auf dem alles Weitere steht: Wasser ist an Oberflächen beeinflussbar. Ohne diesen Befund gäbe es für unser Produkt keine denkbare physikalische Grundlage.',
    bedeutetNicht:
      'Es sagt nichts über Gesundheit, nichts über den Körper und nichts über unseren Chip. Gemessen wurde in einer Küvette, an einem Gel oder an einer Metallprobe – nicht an einem Menschen und nicht mit einem getragenen Anhänger.',
  },
  {
    id: 'h2-ordnung-theorie',
    kurz: 'Warum Ordnung entstehen kann',
    satz: 'Es gibt eine physikalische Theorie, die erklärt, wieso sich sehr viele Wassermoleküle überhaupt gemeinsam ordnen können, statt jedes für sich zu zappeln.',
    stand: 'offen',
    pro: [
      {
        text: 'Die Quantenelektrodynamik des kondensierten Zustands beschreibt sogenannte kohärente Domänen: Bereiche, in denen sehr viele Moleküle im Takt mit dem elektromagnetischen Feld schwingen. Preparata hat das Modell ausgearbeitet, Del Giudice und Kollegen haben es auf Wasser in lebenden Systemen angewandt.',
        quellen: ['preparata-1995', 'delgiudice-2015'],
      },
      {
        text: 'Aus dieser Theorie lassen sich Eigenschaften ableiten, die zu Pollacks Messungen passen – unter anderem, dass ein solcher Bereich Stoffe ausschließt und ein anderes elektrisches Potential trägt. Zwei voneinander unabhängige Zugänge, die auf dasselbe Bild zeigen, sind ein Argument.',
        quellen: ['delgiudice-2015', 'pollack-2013'],
      },
    ],
    contra: [
      {
        text: 'Das ist Theorie, keine Messung. Die Herleitung ist in sich schlüssig, aber eine schlüssige Herleitung ist kein Experiment. Ein direkter Nachweis kohärenter Domänen in Wasser bei Körpertemperatur steht aus.',
        quellen: ['preparata-1995', 'delgiudice-2015'],
      },
      {
        text: 'Die Theorie ist in der Physik eine Minderheitenposition. Sie wird nicht widerlegt herumgereicht, sie wird überwiegend nicht verwendet – was praktisch dasselbe Gewicht hat, wenn man ehrlich ist.',
        quellen: ['preparata-1995'],
      },
      {
        text: 'Wir können diese Theorie nicht prüfen. Sie ist der Teil unseres Modells, der am weitesten von allem entfernt ist, was wir selbst messen könnten. Wir übernehmen sie, weil sie das Beobachtete erklärt – nicht, weil wir sie belegt hätten.',
        quellen: ['delgiudice-2015', 'warnke-bionisch'],
      },
    ],
    bedeutet:
      'Sie liefert die Sprache, in der wir das Wort „kohärent" überhaupt benutzen: gemeint ist eine geordnete, gemeinsame Anordnung – nicht „energetisiert" und nicht „informiert".',
    bedeutetNicht:
      'Sie belegt nicht, dass in deinem Körper solche Bereiche existieren, und schon gar nicht, dass unser Chip sie erzeugt. Wer diese Theorie als Beweis für ein Produkt anführt, überdehnt sie – auch wir.',
  },
  {
    id: 'h3-gitter-als-vorlage',
    kurz: 'Der Chip als Vorlage',
    satz: 'Ein festes, präzise geschnittenes Gitter kann für benachbartes Wasser als Vorlage wirken, an der es sich ausrichtet – ohne Strom, allein durch seine Struktur.',
    stand: 'schwach',
    pro: [
      {
        text: 'Dass die Oberfläche selbst entscheidet, was daneben passiert, ist der Kern von Hypothese 1: an unterschiedlichen Materialien entstehen unterschiedlich große Zonen. Damit ist die Materialwahl grundsätzlich ein Hebel und nicht beliebig.',
        quellen: ['chai-pollack-2012', 'pollack-2013'],
      },
      {
        text: 'Auch schwache äußere Felder verändern nachweislich die Ausdehnung solcher Zonen: statische Magnetfelder erzeugen sie an beiden Polen, und schwache niederfrequente elektrische Felder verändern die Wasserstruktur messbar. Ein Einfluss braucht also keine große Energie.',
        quellen: ['shalatonin-pollack-2022', 'rad-pollack-2021'],
      },
      {
        text: 'Die Zonengröße reagiert auf die chemische Umgebung: gesundheitsfördernde Stoffe vergrößerten sie in einer Messreihe, ein Herbizid verkleinerte sie. Das Phänomen ist also empfindlich und nicht starr.',
        quellen: ['sharma-pollack-2018'],
      },
    ],
    contra: [
      {
        text: 'Die stärkste Arbeit gegen diese Hypothese kommt aus Pollacks eigenem Labor, und wir stellen sie deshalb an den Anfang: Chai, Mahtani und Pollack haben 2012 sieben Metalle verglichen. Neben Zink entstand eine Zone von rund 200 Mikrometern, neben Aluminium, Zinn, Blei und Wolfram kleinere – „while precious metals such as platinum and gold did not produce any". Neben Gold entstand keine. Unser Gitter ist aus 750er Gold.',
        quellen: ['chai-pollack-2012'],
      },
      {
        text: 'Was diesen Befund abschwächt, aber nicht aufhebt: gemessen wurde reines Metall als flache Probe in Wasser. Nicht eine Legierung, nicht unsere Gittergeometrie, nicht der Aufbau, den wir tatsächlich verwenden, und nicht am Körper. Die Arbeit trifft unser Material, nicht zwingend unser Bauteil. Das ist ein Unterschied – aber es ist ein schwächeres Argument als der Befund selbst, und so muss man es auch gewichten.',
        quellen: ['chai-pollack-2012'],
      },
      {
        text: 'Für den Schritt vom Gitter zum Wasser im Körper haben wir keine eigene physikalische Messung. Es gibt keine Arbeit, die zeigt, dass unser Chip die Struktur von Wasser in seiner Umgebung verändert. Das ist die größte offene Stelle des ganzen Modells, und sie liegt genau in der Mitte der Kette.',
        quellen: [],
      },
    ],
    bedeutet:
      'Das ist die Stelle, an der unser Produkt vom allgemeinen Befund zur eigenen Behauptung wird – und sie ist die am schlechtesten belegte der ganzen Seite. Wer unser Modell angreifen will, sollte hier angreifen.',
    bedeutetNicht:
      'Wir können nicht zeigen, dass der Chip Wasser strukturiert. Wir halten es für plausibel und haben eine Arbeit gegen uns, die wir oben selbst zitieren. Wer etwas anderes sagt, sagt mehr, als wir belegen können.',
  },
  {
    id: 'h4-wasser-in-der-zelle',
    kurz: 'Wasser in der Zelle',
    satz: 'Auch das Wasser in unseren Zellen liegt größtenteils an Oberflächen – deshalb könnte seine Ordnung für die Zelle eine Rolle spielen.',
    stand: 'teilweise',
    pro: [
      {
        text: 'In einer Zelle ist praktisch jedes Wassermolekül nah an einer Oberfläche: an Eiweißen, an Membranen, am Zellskelett. Freies Wasser wie im Glas gibt es dort kaum. Wenn Grenzflächenwasser besondere Eigenschaften hat, dann ist das in der Zelle der Normalfall und nicht die Ausnahme.',
        quellen: ['pollack-2001', 'delgiudice-2015'],
      },
      {
        text: 'Pollack hat dieses Bild in „Cells, Gels and the Engines of Life" ausgearbeitet: Zellfunktionen wie Transport und Kontraktion werden dort über den Zustand des Zellwassers erklärt statt allein über Pumpen in der Membran.',
        quellen: ['pollack-2001'],
      },
    ],
    contra: [
      {
        text: 'Dass Zellwasser strukturiert vorliegt, ist gut begründet. Dass seine Ordnung ein Stellhebel für Gesundheit ist, ist der Sprung – und der ist nicht belegt. Zwischen „das Wasser ist geordnet" und „mehr Ordnung ist besser" liegt eine Annahme, die niemand gemessen hat.',
        quellen: ['pollack-2001'],
      },
      {
        text: 'Die etablierte Zellbiologie erklärt dieselben Vorgänge über Membranproteine und Ionenpumpen, und sie tut das erfolgreich. Pollacks Modell ist eine Alternative, die sich nicht durchgesetzt hat.',
        quellen: ['pollack-2001'],
      },
    ],
    bedeutet:
      'Es liefert den Grund, warum wir überhaupt einen Zusammenhang zwischen Wasserordnung und Zellzustand für denkbar halten – und warum unsere eigenen Messungen an Zellen ansetzen und nicht an Symptomen.',
    bedeutetNicht:
      'Es sagt nicht, dass geordneteres Zellwasser gesünder ist. Diese Gleichung steht in keiner der Arbeiten, und wir stellen sie hier nicht auf.',
  },
  {
    id: 'h5-emf-zellstress',
    kurz: 'Strahlung und Zellstress',
    satz: 'Elektromagnetische Felder können in Zellen oxidativen Stress auslösen – das ist der Belastungsfall, für den wir gebaut haben.',
    stand: 'teilweise',
    pro: [
      {
        text: 'Die Schweizer Beratende Expertengruppe BERENIS hat die Literatur gesichtet und kommt zu einem klaren Zwischenstand: „the majority of the animal and more than half of the cell studies provided evidence of increased oxidative stress caused by RF-EMF or ELF-MF". Das ist keine Randmeinung, sondern ein Behördenbericht.',
        quellen: ['berenis-2021'],
      },
      {
        text: 'Oxidativer Stress ist ein etablierter, messbarer Zellzustand mit anerkannten Markern. Er ist damit genau die Art von Größe, an der man einen Schutzeffekt überhaupt prüfen kann – anders als „Wohlbefinden".',
        quellen: ['berenis-2021', 'kim-2019'],
      },
    ],
    contra: [
      {
        text: 'Derselbe Bericht sagt im selben Satz, dass es keinen Konsens gibt: „a scientific consensus is not yet achieved". Und er benennt methodische Schwächen der Studienlage – unter anderem Kontrollproben, die in einem anderen Brutschrank standen als die bestrahlten. Genau dieses Design steckt auch in einer unserer eigenen Studien; wir sagen das auf der Studienseite selbst.',
        quellen: ['berenis-2021', 'dartsch-2021a'],
      },
      {
        text: 'Der Schweizer Bericht zur Mobilfunkstrahlung kommt für oxidativen Stress zu keiner Evidenzbeurteilung und weist darauf hin, dass reaktive Sauerstoffspezies in niedriger Menge normale, sogar nützliche Signalstoffe sind. Mehr davon ist nicht automatisch schlecht.',
        quellen: ['uvek-2019'],
      },
      {
        text: 'Und die entscheidende Lücke: dass Felder Zellstress auslösen können, sagt nichts darüber, ob irgendetwas ihn abfängt. Die Belastung zu belegen ist nicht dasselbe wie einen Schutz zu belegen.',
        quellen: ['berenis-2021'],
      },
    ],
    bedeutet:
      'Es rechtfertigt die Fragestellung. Wir messen gegen oxidativen Stress, weil das der Zustand ist, den die Literatur als plausible Folge von Feldbelastung beschreibt.',
    bedeutetNicht:
      'Es belegt keine Gesundheitsgefahr durch Mobilfunk im Alltag, und es belegt nicht, dass du einen Schutz brauchst. Die Behörden, die wir hier zitieren, sagen ausdrücklich, dass die Lage nicht entschieden ist.',
  },
  {
    id: 'h6-eigene-messungen',
    kurz: 'Was wir selbst gemessen haben',
    satz: 'In Zellkulturen unter Belastung haben unabhängig beauftragte Labore einen Unterschied zwischen Proben mit und ohne unser Produkt gefunden.',
    stand: 'teilweise',
    pro: [
      {
        text: 'Fünf Arbeiten liegen veröffentlicht vor, jede mit Methode und Zahlen im Original nachlesbar: an menschlichen Immunzellen, an Darm-Epithelzellen und gegen oxidativen Stress. In den belasteten Kulturen mit Produkt fiel der gemessene Zellschaden geringer aus als ohne.',
        quellen: ['dartsch-2021a', 'dartsch-2021b', 'dartsch-2024a'],
      },
      {
        text: 'Die Arbeiten wurden extern beauftragt und durchgeführt, nicht bei uns im Haus, und sie sind vollständig als PDF abrufbar – auch die Stellen, die uns nicht gefallen.',
        quellen: ['dartsch-2024b', 'dartsch-2026'],
      },
    ],
    contra: [
      {
        text: 'Das sind Zellkulturen, kein Mensch. Ein Effekt in der Schale sagt nichts darüber, ob im Körper etwas davon ankommt – die allermeisten Effekte, die man in vitro sieht, überstehen diesen Schritt nicht. Eine klinische Studie am Menschen gibt es nicht.',
        quellen: ['dartsch-2021a', 'dartsch-2021b'],
      },
      {
        text: 'Die Arbeiten sind von uns beauftragt und bezahlt. Das macht sie nicht falsch, aber es ist ein Interessenkonflikt, und er gehört genannt. Eine unabhängige Wiederholung durch ein Labor, das nichts mit uns zu tun hat, fehlt.',
        quellen: ['dartsch-2024a', 'dartsch-2024b'],
      },
      {
        text: 'Die Fallzahlen sind klein, und bei mindestens einer Arbeit standen Kontroll- und Versuchsproben nicht im selben Brutschrank – genau die methodische Schwäche, die der BERENIS-Bericht der ganzen Forschungsrichtung vorhält. Wir nennen diese Grenzen auf jeder einzelnen Studienseite.',
        quellen: ['dartsch-2021a', 'berenis-2021'],
      },
      {
        text: 'Und das Wichtigste: keine dieser Arbeiten misst Wasserstruktur. Sie messen einen Zellzustand. Ob der beobachtete Unterschied über den Weg zustande kommt, den die Hypothesen 1 bis 4 beschreiben, ist damit nicht gezeigt – nur, dass ein Unterschied da war.',
        quellen: ['dartsch-2021b', 'dartsch-2024a'],
      },
    ],
    bedeutet:
      'Das ist der einzige Teil des Modells, zu dem wir eigene, veröffentlichte Messungen haben. Deshalb ist es auch der einzige Teil, zu dem wir überhaupt etwas behaupten.',
    bedeutetNicht:
      'Es belegt keinen Heileffekt am Menschen, und wir leiten daraus keinen ab. Wer von diesen Zellstudien auf eine Wirkung bei dir schließt, macht einen Schritt, den die Arbeiten nicht hergeben.',
  },
];

/**
 * Die ehrliche Zusammenfassung der Kette — sie steht NACH den Hypothesen und
 * fasst zusammen, wo sie hält und wo sie reißt. Ohne diesen Abschnitt wäre die
 * Seite eine Sammlung von Einzelteilen; er ist der Grund, warum jemand ihr
 * glaubt.
 */
export const KETTE = {
  titel: 'Wo die Kette hält – und wo sie reißt',
  absaetze: [
    'Das Modell ist eine Kette aus sechs Gliedern, und eine Kette ist so stark wie ihr schwächstes. Die ersten beiden Glieder sind Physik und stehen unabhängig von uns. Das vierte und fünfte sind gut begründete Fragestellungen. Das sechste sind unsere eigenen Messungen, in vitro, mit benannten Grenzen.',
    'Das dritte Glied ist das schwache: der Schritt vom Gitter zum Wasser. Für ihn haben wir keine eigene Messung, und die einzige Arbeit, die unser Material direkt betrifft, spricht gegen uns – Pollacks Labor fand neben Gold keine Ausschlusszone. Wir zitieren sie oben im Wortlaut, weil das Gegenteil davon Auswahl wäre und keine Herleitung.',
    'Damit steht das Modell so da: physikalisch anschlussfähig an den Enden, unbelegt in der Mitte, und mit einem gemessenen Effekt am Ende, dessen Zustandekommen wir nicht erklären können. Das ist weniger, als eine Werbeseite behaupten würde. Es ist genau das, was wir haben.',
    'Wir halten diese Hypothesen für plausibel genug, um danach zu bauen und weiter zu messen. Wir halten sie nicht für bewiesen. Wenn eine Messung sie widerlegt, gehört das auf diese Seite – dieselbe Seite, auf der sie heute stehen.',
  ],
};

/**
 * Bewusstsein und die fünf Stufen — AUSDRÜCKLICH ALS CHRISTIANS SICHT
 * GEKENNZEICHNET, und baulich vom Modell getrennt.
 *
 * WARUM DAS HIER RICHTIG IST UND WOANDERS NICHT: Christian hat diesen Teil
 * angefragt („ich würde hier noch gerne unsere Geschichte erzählen"), und diese
 * Seite ist dafür gebaut — sie deklariert im Titel, dass sie Hypothesen trägt.
 * Der Abschnitt steht deshalb NACH der Kette, trägt eine eigene Kennzeichnung
 * und führt KEINE Quellen: er ist Weltanschauung und tritt nicht als Beleg auf.
 * Genau diese Trennung ist es, die den Rest der Seite trägt.
 */
export const BEWUSSTSEIN = {
  vorspann: 'Persönliche Sicht des Gründers',
  titel: 'Was Christian darüber hinaus annimmt – und warum das hier getrennt steht',
  hinweis:
    'Alles ab hier ist die persönliche Überzeugung von Christian Bernd Bauer. Es ist nicht Teil des Wirkmodells oben, es wird von keiner der Quellen dieser Seite gestützt, und wir führen es nicht als Beleg. Es steht hier, weil es ehrlicher ist, es zu benennen, als es wegzulassen und so zu tun, als spiele es für die Motivation hinter Qi Blanco keine Rolle.',
  absaetze: [
    'Christian geht davon aus, dass der Zustand des Körpers und der Zustand des Bewusstseins zusammenhängen – dass also nicht nur Ernährung, Bewegung und Umweltbelastung zählen, sondern auch, in welcher inneren Verfassung jemand lebt. Aus dieser Annahme heraus hat er seinen kostenlosen Kurs „In 5 Stufen zum Superhuman" aufgebaut.',
    'Die fünf Stufen dort sind: Entgiftung, mentales Setting, Mineralien und Vitamine, Schutz vor E-Smog, und kohärentes Wasser. Nur die letzten beiden berühren unser Produkt; die ersten drei haben nichts mit Qi Blanco zu tun und verkaufen nichts.',
    'Für diese Annahmen gibt es keine Studienlage, die wir hier anführen könnten, und wir tun so etwas auch nicht. Wer das Modell oben prüfen will, kann diesen Abschnitt vollständig ignorieren, ohne dass sich an der Kette etwas ändert. Das ist der Sinn der Trennung.',
  ],
  verweis: {
    text: 'Den Kurs gibt es kostenlos',
    href: '/pages/superhuman',
  },
};

/** Was diese Seite ausdrücklich nicht ist — steht im Kopf, nicht im Fuß. */
export const ABGRENZUNG = [
  {
    titel: 'Das hier sind Hypothesen, keine Befunde',
    text: 'Eine Hypothese ist eine begründete Annahme, die man prüfen kann – nicht ein Beweis und nicht eine Meinung. Wir schreiben das in die Überschrift und nicht ins Kleingedruckte, weil es die ehrliche Beschreibung dessen ist, was wir haben.',
  },
  {
    titel: 'Was gemessen ist, steht woanders',
    text: 'Diese Seite erklärt unser Modell. Was davon tatsächlich gemessen wurde und was nicht, beantwortet die Seite zur Kritik an Qi Blanco – Punkt für Punkt und mit Urteil.',
  },
  {
    titel: 'Keine Quelle, die wir nicht gelesen haben',
    text: 'Jede Arbeit unten liegt uns im Volltext vor. Die wörtlichen Zitate sind daran geprüft. Wo ein Zitat eine Seitenzahl hat, steht sie dabei.',
  },
  {
    titel: 'Wir behaupten keinen Heileffekt am Menschen',
    text: 'Die vorliegenden Arbeiten sind Zellkulturstudien. Sie belegen keinen Heileffekt am Menschen, und wir leiten keinen daraus ab.',
  },
];
