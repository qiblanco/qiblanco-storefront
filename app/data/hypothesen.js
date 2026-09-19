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
 *   teilweise   — in der Forschung belegt, für unseren Fall noch offen
 *   offen       — plausibel hergeleitet, nicht gemessen
 *   schwach     — der Schritt, an dem wir gerade selbst messen
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
    text: 'In der Forschung belegt – für unseren Fall noch offen',
  },
  offen: {
    kuerzel: 'offen',
    text: 'Hergeleitet, nicht gemessen',
  },
  schwach: {
    kuerzel: 'schwach',
    text: 'Hier arbeiten wir – die eigene Messung steht aus',
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
    'Diese drei Berufsbilder erklären das Modell: es ist von der Physik her gedacht, nicht von der Medizin her.',
    'Eine persönliche Geschichte erklärt eine Motivation. Ein Beleg ist sie nicht. Als Beleg tritt bei uns eine nachlesbare Arbeit auf, mit Autor, Jahr und Fundstelle.',
  ],
};

/**
 * DIE HYPOTHESEN — die Kette des Wirkmodells, Glied für Glied.
 *
 * REIHENFOLGE = KETTE, nicht Wichtigkeit: von dem, was am besten belegt ist
 * (Physik des Grenzflächenwassers), bis zu dem, was wir selbst gemessen haben.
 *
 * FASSUNG 2026-09-19 (Christian, wörtlich: „das braucht ein Updaten für unsere
 * Chancen, nicht für unsere Niederlage"). WAS SICH GEÄNDERT HAT UND WAS NICHT:
 * `contra` heißt auf der Fläche jetzt „Was offen ist" und steht KURZ, in ganzen
 * Sätzen, ohne ein Urteil über uns selbst. Verschwunden sind ausschließlich
 * SELBSTBEWERTUNGEN — Sätze, in denen wir eine fremde Arbeit nicht referieren,
 * sondern unser eigenes Vorhaben benoten. Kein einziger QUELLENBEFUND ist
 * weggefallen, auch nicht der Gold-Befund aus Chai/Mahtani/Pollack 2012 in h3.
 * Eine Angabe zur Quellenlage bleibt; ein Urteil über uns selbst gehört nicht
 * auf eine Verkaufsfläche.
 *
 * DIE GESTRICHENEN WENDUNGEN STEHEN HIER BEWUSST NICHT IM WORTLAUT: eine Wache,
 * die ihre eigenen Suchmuster als Treffer liest, meldet die Reparatur als den
 * Schaden. Der volle Wortlaut steht in der Commit-Nachricht und in
 * pruefungen/probe_hypothesen_sprechen_fuer_uns__20260919.py.
 *
 * `bedeutetNicht` ist weiterhin PFLICHT und darf NIE leer sein — es ist jetzt
 * EIN Satz und keine zweite Gegen-Seite. Sechsmal wiederholt wird aus einer
 * Abgrenzung die Botschaft der Seite.
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
        text: 'Wie breit die Zone genau ist und wodurch sie zustande kommt, ist in der Fachwelt nicht entschieden. Es gibt Gegenvorschläge, die die Beobachtungen über bekannte Effekte an Grenzflächen erklären, ohne eine eigene „vierte Phase" anzunehmen.',
        quellen: ['pollack-2013'],
      },
      {
        text: 'Die meisten dieser Messungen stammen aus Pollacks eigenem Labor. Eine unabhängige Wiederholung in der Breite steht aus.',
        quellen: ['pollack-2013', 'pollack-2010'],
      },
    ],
    bedeutet:
      'Darauf baut alles Weitere auf: Wasser lässt sich an einer Oberfläche beeinflussen, und der Unterschied ist messbar. Das ist die physikalische Grundlage, von der wir ausgehen.',
    bedeutetNicht:
      'Gemessen wurde in der Küvette, am Gel und an Metallproben – nicht an einem Menschen und nicht mit einem getragenen Anhänger.',
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
        text: 'Das ist Theorie, keine Messung. Ein direkter Nachweis kohärenter Domänen in Wasser bei Körpertemperatur steht aus.',
        quellen: ['preparata-1995', 'delgiudice-2015'],
      },
      {
        text: 'In der Physik ist dieses Modell eine Minderheitenposition: die meisten Arbeiten kommen ohne es aus. Wir übernehmen es, weil es das Beobachtete erklärt.',
        quellen: ['preparata-1995', 'warnke-bionisch'],
      },
    ],
    bedeutet:
      'Sie liefert die Sprache, in der wir das Wort „kohärent" überhaupt benutzen: gemeint ist eine geordnete, gemeinsame Anordnung – nicht „energetisiert" und nicht „informiert".',
    bedeutetNicht:
      'Ob es solche Bereiche in deinem Körper gibt und ob unser Chip sie erzeugt, sagt diese Theorie nicht.',
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
        text: 'Chai, Mahtani und Pollack haben 2012 sieben Metalle verglichen. Neben Zink entstand eine Zone von rund 200 Mikrometern, neben Aluminium, Zinn, Blei und Wolfram kleinere – „while precious metals such as platinum and gold did not produce any". Gemessen wurde reines Metall als flache Probe in Wasser: nicht eine Legierung, nicht unsere Gittergeometrie, nicht der Aufbau, den wir verwenden.',
        quellen: ['chai-pollack-2012'],
      },
      {
        text: 'Für den Schritt vom Gitter zum Wasser im Körper haben wir noch keine eigene physikalische Messung. Genau dort setzt unsere nächste an.',
        quellen: [],
      },
    ],
    bedeutet:
      'Hier wird aus dem allgemeinen Befund unsere eigene Bauentscheidung. Material und Geometrie des Gitters sind der Hebel, an dem wir arbeiten – und der Grund, warum wir überhaupt fertigen statt nur zu lesen.',
    bedeutetNicht:
      'Dass der Chip Wasser strukturiert, können wir heute nicht zeigen.',
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
        text: 'Zwischen „das Wasser ist geordnet" und „mehr Ordnung ist besser" liegt eine Annahme, die niemand gemessen hat.',
        quellen: ['pollack-2001'],
      },
      {
        text: 'Die etablierte Zellbiologie erklärt dieselben Vorgänge über Membranproteine und Ionenpumpen. Pollacks Modell steht als Alternative daneben.',
        quellen: ['pollack-2001'],
      },
    ],
    bedeutet:
      'Es liefert den Grund, warum wir überhaupt einen Zusammenhang zwischen Wasserordnung und Zellzustand für denkbar halten – und warum unsere eigenen Messungen an Zellen ansetzen und nicht an Symptomen.',
    bedeutetNicht:
      'Dass geordneteres Zellwasser gesünder ist, steht in keiner dieser Arbeiten.',
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
      {
        text: 'Der Bericht sieht diese Hinweise auch unterhalb der geltenden Grenzwerte. Eine Übersichtsarbeit zum Nervensystem kommt zum selben Bild: Mobilfunkfelder können in Zell- und Tiermodellen als Stressquelle wirken.',
        quellen: ['berenis-2021', 'kim-2019'],
      },
    ],
    contra: [
      {
        text: 'Derselbe Bericht hält fest, dass es keinen Konsens gibt: „a scientific consensus is not yet achieved". Er benennt methodische Schwächen der Studienlage – unter anderem Kontrollproben aus einem anderen Brutschrank. Dieses Design steckt auch in einer unserer eigenen Studien, und wir nennen es dort.',
        quellen: ['berenis-2021', 'dartsch-2021a'],
      },
      {
        text: 'Der Schweizer Bericht zur Mobilfunkstrahlung gibt für oxidativen Stress keine Evidenzbeurteilung ab und weist darauf hin, dass reaktive Sauerstoffspezies in niedriger Menge normale Signalstoffe sind.',
        quellen: ['uvek-2019'],
      },
      {
        text: 'Dass Felder Zellstress auslösen können, ist eine Aussage über die Belastung, nicht über einen Schutz davor.',
        quellen: ['berenis-2021'],
      },
    ],
    bedeutet:
      'Es rechtfertigt die Fragestellung. Wir messen gegen oxidativen Stress, weil das der Zustand ist, den die Literatur als plausible Folge von Feldbelastung beschreibt.',
    bedeutetNicht:
      'Eine Gesundheitsgefahr durch Mobilfunk im Alltag belegen diese Berichte nicht; sie halten selbst fest, dass die Lage nicht entschieden ist.',
  },
  {
    id: 'h6-eigene-messungen',
    kurz: 'Was wir selbst gemessen haben',
    satz: 'In Zellkulturen unter Belastung haben unabhängig beauftragte Labore einen Unterschied zwischen Proben mit und ohne unser Produkt gefunden.',
    stand: 'teilweise',
    pro: [
      {
        text: 'Fünf Arbeiten liegen veröffentlicht vor, jede mit Methode und Zahlen im Original nachlesbar: an menschlichen Immunzellen, an Darm-Epithelzellen, an Nervenzellen und gegen chemisch ausgelösten oxidativen Stress. In den belasteten Kulturen mit Produkt fiel der gemessene Zellschaden jedes Mal geringer aus als ohne.',
        quellen: ['dartsch-2021a', 'dartsch-2021b', 'dartsch-2024a'],
      },
      {
        text: 'Zwei Zahlen daraus, beide in der Zellkultur gemessen. Unter Mobilfunkbestrahlung sank die Radikalbildung menschlicher Immunzellen ohne Schutz auf 60,5 ± 3,9 % der unbestrahlten Kontrolle. Mit Produkt blieb sie bei 84,7 ± 7,0 % (p ≤ 0,01). Der Barrierewiderstand von Darmepithelzellen lag ungeschützt bei 152 ± 16 und mit Produkt bei 1.837 ± 349 Ω/cm².',
        quellen: ['dartsch-2021a', 'dartsch-2021b'],
      },
      {
        text: 'Die Arbeiten wurden extern beauftragt und außer Haus durchgeführt. Sie liegen vollständig als PDF vor, mit Methodenteil und Einzelwerten.',
        quellen: ['dartsch-2024b', 'dartsch-2026'],
      },
    ],
    contra: [
      {
        text: 'Das sind Zellkulturen, kein Mensch. Eine klinische Studie am Menschen gibt es nicht.',
        quellen: ['dartsch-2021a', 'dartsch-2021b'],
      },
      {
        text: 'Die Arbeiten sind von uns beauftragt und bezahlt, die Fallzahlen sind klein, und bei mindestens einer standen Kontroll- und Versuchsproben nicht im selben Brutschrank. Eine unabhängige Wiederholung durch ein Labor ohne Verbindung zu uns steht aus.',
        quellen: ['dartsch-2024a', 'dartsch-2024b', 'berenis-2021'],
      },
      {
        text: 'Keine dieser Arbeiten misst Wasserstruktur, sondern einen Zellzustand: gezeigt ist der Unterschied, nicht der Weg dorthin.',
        quellen: ['dartsch-2021b', 'dartsch-2024a'],
      },
    ],
    bedeutet:
      'Das ist der einzige Teil des Modells, zu dem wir eigene, veröffentlichte Messungen haben. Deshalb ist es auch der einzige Teil, zu dem wir überhaupt etwas behaupten.',
    bedeutetNicht:
      'Einen Heileffekt am Menschen belegen sie nicht, und wir leiten keinen daraus ab.',
  },
];

/**
 * Die ehrliche Zusammenfassung der Kette — sie steht NACH den Hypothesen und
 * fasst zusammen, wo sie hält und wo sie reißt. Ohne diesen Abschnitt wäre die
 * Seite eine Sammlung von Einzelteilen; er ist der Grund, warum jemand ihr
 * glaubt.
 */
export const KETTE = {
  titel: 'Wo das Modell heute steht – und woran wir arbeiten',
  absaetze: [
    'Das Modell ist eine Kette aus sechs Gliedern. Die ersten beiden sind Physik und stehen unabhängig von uns. Das vierte und fünfte sind Fragestellungen, die die Literatur trägt. Das sechste sind unsere eigenen, veröffentlichten Messungen an Zellkulturen.',
    'Offen ist das dritte Glied, der Schritt vom Gitter zum Wasser. Dafür haben wir noch keine eigene Messung, und die eine Arbeit zu reinem Gold fand dort keine Ausschlusszone. Genau dort setzt unsere nächste Messung an.',
    'Damit steht das Modell so da: physikalisch anschlussfähig an beiden Enden, mit einem gemessenen Effekt am Ende und einer offenen Stelle in der Mitte. Danach bauen wir, und danach messen wir weiter.',
    'Wir halten diese Hypothesen für plausibel genug, um danach zu bauen. Für bewiesen halten wir sie nicht. Widerlegt eine Messung eine davon, steht sie hier.',
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
    'Alles ab hier ist die persönliche Überzeugung von Christian Bernd Bauer. Es gehört nicht zum Wirkmodell, keine der Quellen stützt es, und als Beleg tritt es nicht auf. Es steht hier, weil es zur Motivation hinter Qi Blanco gehört.',
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
