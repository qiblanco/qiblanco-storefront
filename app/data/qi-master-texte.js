/**
 * Texte der drei QiMaster-Inhaltsbausteine (Diamant, 6G, Persoenlichkeits-
 * entwicklung) — /products/qi-master, Job 20260910-BAU-qi-master-produkt-und-
 * shopseite-diamant-6g-und-persoenlichkeitsentwicklung (Christian-Auftrag
 * CW-20260910-0e45045b, 2026-09-10).
 *
 * WARUM DIE TEXTE HIER LIEGEN UND NICHT IM MARKUP: jede Aussage trägt ihre
 * Quelle mit Jahr und Seite, und die Grenze zwischen „steht bei diesem Autor",
 * „haben wir gemessen" und „ist unsere Deutung" ist der Inhalt der Seite —
 * nicht ihr Schmuck. Ohne Markup lässt sich das prüfen (grep auf „Unsere
 * Deutung", auf Jahreszahlen, auf Seitenangaben), und ein Lektor kann den
 * Text lesen, ohne JSX zu lesen.
 *
 * BELEGLAGE (Bibliothek wissens-bibliothek-rag, Volltexte am 2026-09-10
 * gegen die PDFs geprueft; Yogananda: Project Gutenberg #7452, Erstausgabe
 * 1946, Kopie im Jobordner):
 *  - Koenig 2011: S. 169-175 (Diamant = Kohlenstoff, Energieluecke, kohärentes
 *    UV, „richtige Frequenzen", Rohdiamant-Produkte, „zu frueh" S. 174).
 *  - Del Giudice et al. 2015: S. 96-101 (Kohärenz, Diamant 3545 °C, CD 0,1 µm).
 *  - Preparata 1995 (Datei trägt „2011", Impressum 1995): S. 215-216.
 *  - Popp 2006 (3. Aufl.): S. 37-38, 51-54, 229.
 *  - Pollack 2013 Kap. 6; Wang & Pollack 2021 (EZ x1,41 nach 5 min IR).
 *  - Warnke 2019: S. 13, 113, 307, 338-341; Warnke 2013: S. 55, 321.
 *  - Dartsch 2021a (Jpn J Med 4(1):484-488), 2021b (Appl Cell Biol 9(3):69-74):
 *    Smartphone SAR 0,76 W/kg, WLAN an, 4 h, in vitro; TEER 152/1.837/2.542;
 *    Burst 60,5/84,7 % der Kontrolle. KEINE Frequenzangabe, kein 5G/6G.
 *  - Yogananda 1946: Kap. 13 („The Sleepless Saint") und Kap. 26 („The
 *    Science of Kriya Yoga"); deutsche Fassung hier = eigene Uebersetzung.
 *
 * WAS KEIN AUTOR SAGT und deshalb unter „Unsere Deutung" steht: dass ein
 * geschliffener Diamant in einem Schmuckstück am Körper Frequenzen erzeugt,
 * die dem Schwingungsbereich menschlicher Zellen naeher liegen; dass ein
 * Gitterchip die Vorbereitung meint, von der Yogananda spricht. Beides ist
 * die Ueberlegung, aus der der QiMaster entstanden ist — und beides ist nicht
 * gemessen. Der Text sagt das an genau der Stelle, an der es gilt.
 *
 * KEINE Gesundheits-, Heil- oder Wirkungsaussage über das Belegte hinaus.
 * Fremde Autoren werden zitiert, nicht zu Befuerwortern gemacht.
 * Kundensichtbar: echte Umlaute.
 */

export const QIMASTER_DIAMANT = {
  // „LITERATUR" — CHRISTIANS AUFTRAG VOM 2026-09-17, ABENDS:
  // „Oberhalb von diesem Text ‚Diamant ist reiner Kohlenstoff …‘ schreiben
  //  wir als Überschrift ‚Literatur‘."
  //
  // DER ABSCHNITT HATTE SEINE ÜBERSCHRIFT AM SELBEN TAG VERLOREN: „The One
  // Eye" ist mittags hinauf über die Diamantfotos gewandert (Auftrag
  // 20260917-the-one-eye-wandert-…) und wohnt seither
  // bei den Bildern, die sie überschreibt: qi-master-diamantbilder.js,
  // QIMASTER_DIAMANTBILDER_TITEL. Der Text stand danach ohne Titel da.
  // „Literatur" füllt genau diese Stelle — der `titel` kehrt zurück, mit
  // einem anderen Wort und einer anderen Aufgabe.
  //
  // ES IST EINE ABSCHNITTSÜBERSCHRIFT, KEIN ETIKETT FÜR DEN ERSTEN ABSATZ.
  // Was darunter folgt — der Kohlenstoff-Einstieg, „Diamant = Kohlenstoff"
  // mit Königs Zitat, das Kristallgitter, die Kohärenz, Popp und Pollack —
  // ist die Herleitung aus der Literatur. Die Überschrift eröffnet sie.
  // Deshalb rendert QiMaster.jsx sie als <h2>, in derselben Ebene wie die
  // übrigen Abschnittsüberschriften der Seite, nicht als kleine
  // Zwischenzeile.
  //
  // NICHT ZU VERWECHSELN MIT DEM LABEL „In der Literatur", das die Blöcke
  // `gitter`, `Kohärenz` und `licht` beim Bau dieser Zeile noch tragen.
  // Christian hat es am selben Abend zum Streichen bestellt (Auftrag
  // 20260917-in-der-literatur-raus-…, beim Schreiben dieses Kommentars noch
  // am Laufen) — die Überschrift hier macht
  // es ohnehin überflüssig. WER DIESE DATEI LIEST, PRÜFT ALSO NACH, ob die
  // Labels noch da sind; dieser Kommentar sagt, wie es AM 2026-09-17 stand,
  // nicht wie es heute ist.
  //
  // DIE LEHRE DARAUS ÜBERLEBT DEN LABEL-STRICH: Wortstamm „Literatur" stand
  // auf dieser Seite schon, bevor diese Überschrift existierte. Wer die
  // Überschrift messen will, vergleicht die h2 deshalb auf GLEICHHEIT und
  // mit Beachtung der Groß-/Kleinschreibung — ein Enthaltensein-Test wäre
  // durch die Labels schon vor dem Bau grün gewesen
  // (pruefungen/probe_literatur_ueberschrift.py, Arm `ueberschrift`).
  //
  // NUR DIE ÜBERSCHRIFT KOMMT DAZU: der Einstieg „Diamant ist reiner
  // Kohlenstoff …" bleibt Wort für Wort, „Diamant = Kohlenstoff" bleibt, wo
  // es ist, und die Quellen bleiben vollständig (Auftrag: „Es kommt eine
  // Zeile hinzu, es geht keine weg.").
  titel: 'Literatur',
  einstieg: [
    'Diamant ist reiner Kohlenstoff. Die Grundlage unseres Lebens. Jedes Eiweiß, jede Zellmembran, jeder Strang deiner DNA hat ein Skelett aus Kohlenstoffatomen. Hier nutzen wir Kohlenstoff in seiner edelsten Form.',
  ],
  befunde: [
    {
      id: 'kohlenstoff',
      // Christians Fassung vom 2026-09-17. Drei Dinge fallen hier weg und
      // eines kommt dazu:
      //  - die Zwischenüberschrift „In der Literatur“ (label: null). Sie
      //    fällt NUR über diesem Block; die drei Blöcke darunter behalten
      //    sie. Das Zitat steht für sich, mit seiner Quelle darunter.
      //  - die Jahreszahl im Einleitungssatz. Sie geht nicht verloren,
      //    sondern steht in der Quellenangabe, wo sie ohnehin hingehört.
      //  - „Sein erster Grund ist der Kohlenstoff:“. Das Zitat sagt es selbst.
      //  + der Autor trägt „Dr.“, im Einleitungssatz und in der Quelle.
      // Das wörtliche Zitat bleibt unverändert, samt Auslassungszeichen: es
      // ist fremder Text und wird nicht angefasst.
      titel: 'Diamant = Kohlenstoff',
      label: null,
      beleg: false,
      absaetze: [
        'Der Physiker Dr. Michael König beschreibt in „Das Urwort – Die Physik Gottes“, warum er unter allen Kristallen den Diamanten für den interessantesten hält, wenn es um lebende Organismen geht.',
      ],
      zitat:
        '„Zum einen besteht der Diamant zu hundert Prozent aus Kohlenstoff. Das chemische Element Kohlenstoff spielt ja gerade in biologischen Systemen eine bedeutende Rolle. […] Alles Leben, so wie wir es auf der Erde kennen, basiert auf Kohlenstoff.“',
      quelle: 'Dr. Michael König: Das Urwort – Die Physik Gottes. Scorpio, 2011, S. 171–172.',
    },
    {
      id: 'gitter',
      titel: 'Licht im Kristallgitter',
      label: 'In der Literatur',
      beleg: false,
      absaetze: [
        'Sein zweiter Gedanke betrifft das Gitter selbst. Ein reiner Diamant lässt sichtbares Licht ungehindert durch; erst im ultravioletten Bereich, bei Wellenlängen unter etwa 200 Nanometern, beginnt er Licht aufzunehmen. König beschreibt, dass zwischen den Atomlagen des Gitters stehende Lichtwellen entstehen und ein Teil des ungeordneten Umgebungslichts geordnet – kohärent – wieder abgegeben wird. Und weil die Kohlenstoffatome im Diamanten dieselben Anregungsstufen haben wie die Kohlenstoffatome in organischen Molekülen, folgert er:',
      ],
      zitat:
        '„Die Kohlenstoffatome im Diamanten senden also auf den richtigen Frequenzen, die die Kohlenstoffatome in biologischem Material empfangen können.“',
      quelle:
        'Michael König: Das Urwort – Die Physik Gottes. Scorpio, 2011, S. 169–172. – Das ist Königs Modell, und er sagt selbst, wo es endet: „Zwar ist es für medizinisch relevante Aussagen noch zu früh“ (S. 174). Wir zitieren ihn; wir beanspruchen ihn nicht.',
    },
    {
      id: 'Kohärenz',
      // GEKÜRZT am 2026-09-17 auf Christians Auftrag: „Kohärenz – was
      // Physiker damit meinen" -> „Kohärenz".
      //
      // DER ZUSATZ ERKLÄRTE, DASS GLEICH EINE ERKLÄRUNG KOMMT — und der
      // erste Satz des Absatzes darunter gibt sie: „Kohärenz heißt: viele
      // Teilchen schwingen im Gleichtakt." Eine Überschrift, die eine
      // Erklärung ankündigt, kostet die Zeile und liefert nichts; der
      // Leser hat die Antwort eine Zeile später ohnehin.
      //
      // ABSATZ, ZITATE UND QUELLE DIESES BLOCKS BLEIBEN WORT FÜR WORT.
      // Geändert ist genau der Titel (Auftrag: „Die Texte der vier
      // Abschnitte bleiben unverändert, ebenso die Zitate und
      // Quellenangaben"). Die `id` bleibt ebenfalls — sie ist der
      // Schlüssel, über den qi-master-literaturbilder.js das Bild zu
      // diesem Block findet.
      titel: 'Kohärenz',
      label: 'In der Literatur',
      beleg: false,
      absaetze: [
        'Kohärenz heißt: viele Teilchen schwingen im Gleichtakt. Kristalle sind das alltäglichste Beispiel dafür – der Physiker Emilio Del Giudice und seine Kollegen nennen den Diamanten, der seine Kohärenz erst bei rund 3.545 °C verliert, wenn er schmilzt. Dieselbe Arbeitsgruppe hat beschrieben, dass auch flüssiges Wasser kohärente Bereiche bildet: Domänen von etwa einem Zehntel Mikrometer, in denen Millionen Moleküle im Takt schwingen. Von dieser Ordnung im Wasser her denken wir auch den Gitterchip™.',
      ],
      zitat: null,
      quelle:
        'Emilio Del Giudice u. a.: The origin and the special role of coherent water in living systems. In: Fields of the Cell. Research Signpost, 2015, S. 97 und 100. Giuliano Preparata: QED Coherence in Matter. World Scientific, 1995.',
    },
    {
      id: 'licht',
      titel: 'Zellen und Licht',
      label: 'In der Literatur',
      beleg: false,
      absaetze: [
        'Dass lebende Zellen Licht abgeben, hat der Biophysiker Fritz-Albert Popp über Jahrzehnte gemessen: sehr schwaches, geordnetes Licht zwischen 200 und 800 Nanometern, als dessen Quelle er die DNA vermutet. Der Bereich, in dem Königs Diamant Licht aufnimmt, und der Bereich, in dem Popps Zellen Licht abgeben, überlappen am ultravioletten Ende. Und der Bioingenieur Gerald Pollack hat gezeigt, dass die geordnete Wasserschicht an wasserliebenden Oberflächen mit Licht wächst – vor allem mit Infrarot: fünf Minuten mittleres Infrarot, und die Schicht war um 41 Prozent breiter.',
      ],
      zitat: null,
      quelle:
        'Fritz-Albert Popp: Biophotonen – Neue Horizonte in der Medizin. 3. Auflage, Haug, 2006, S. 51–54 und 229. Gerald H. Pollack: The Fourth Phase of Water. Ebner & Sons, 2013, Kap. 6. Anqi Wang, Gerald H. Pollack: Effect of infrared radiation on interfacial water at hydrophilic surfaces. Colloid and Interface Science Communications 42, 2021.',
    },
  ],
  /* DER SCHLUSS DES ABSCHNITTS — Christian am 2026-09-17.
     Hier standen zwei Absaetze „Unsere Deutung" und darunter ein
     siebenzeiliger Quellenblock. Beide sind weg, ersetzt durch drei Zeilen.

     WAS BLEIBT, IST DER GEDANKE, NUR OHNE DIE EINSCHRAENKUNGEN: der zweite
     Absatz endete auf „einen Diamanten, der Licht ordnet, neben einem
     Gitterchip™, der Wasser ordnet" — genau das sagen die drei Zeilen,
     behauptet statt relativiert. Gestrichen ist die Rechtfertigung darum
     herum („allein auf unsere Rechnung", „haben wir nicht gemessen").

     DER QUELLENBLOCK WAR EINE WIEDERHOLUNG, KEIN ALLEINBELEG. Jede seiner
     sieben Quellen steht weiterhin oben bei der Aussage, die sie trägt —
     nachgezaehlt am 2026-09-17 am ausgelieferten Rumpf. Zwei seiner
     Zeichenfolgen („Arkana, 2019", „World Scientific, 1995") standen
     doppelt auf der Seite; sie fallen deshalb von zwei auf EINS, nicht auf
     null. Die Probe misst genau das, statt auf Abwesenheit zu prüfen.

     DIE DREI ZEILEN SIND DATEN UND KEIN MARKUP: Ausrichtung und Groesse
     stehen in qi-master.css (.qm-schluss), die Groesse kommt aus dem
     gemeinsamen Token --qm-fs-guete, das auch die Guetezeilen tragen. */
  schluss: [
    'Qi Master®',
    'The One Eye - ordnet Licht',
    'Gitterchip™ - ordnet Wasser',
  ],
};

/* Der 6G-Abschnitt trägt seit dem 2026-09-17 CHRISTIANS FASSUNG, Wort für Wort.
   Was hier vorher stand (»6G-Protection: nicht auf eine Frequenz gebaut«, der
   Absatz zur Bauweise, »Was gemessen ist« samt TEER-Wert), ist ersetzt — nicht
   umgeschrieben. Geglättet wurde nichts, kein Vorbehalt kam dazu; korrigiert
   sind allein Rechtschreibung und Zeichensetzung, also die echten Umlaute, die
   der kundensichtbare Text verlangt.

   DIE ZIFFERN SIND KEIN SCHMUCK, SIE SIND DIE ZUORDNUNG: Christian hat Absatz
   für Absatz geliefert, welche Quelle welche Aussage trägt. Die Marken stehen
   deshalb an der Aussage, nicht am Absatzende. Die Zuordnungstabelle selbst
   gehört NICHT auf die Seite — sie war die Bauanweisung.

   WARUM DIE QUELLEN ÜBERHAUPT DA SEIN MÜSSEN: der Text beruft sich selbst
   darauf, keine Verschwörungstheorie zu sein, und nennt ETSI, ITU und 3GPP als
   Beleg. Eine solche Berufung ohne auffindbaren Beleg ist angreifbar — sie
   macht genau die Angriffsfläche auf, die der Satz bestreiten will. Zuvor stand
   an dieser Stelle das Wort »telecomtv«: ein Kopierartefakt, keine Quelle.

   DIE OPTIK IST GEERBT, NICHT GEBAUT (Christian: »optisch so darstellen wie im
   Literaturbereich«): die Liste trägt .qm-quellen aus qi-master.css — dieselbe
   Schriftgröße (--qm-fs-xs) und dieselbe Dämpfung (--qm-muted) wie jede andere
   Quellenangabe dieser Seite, dazu den Hängeeinzug für die Ziffer. Die Klasse
   war seit dem Wegfall des Diamant-Quellenblocks (Commit 2261217, am selben
   Tag) ohne Nutzer; sie wird wiederverwendet, statt eine zweite Quellen-Optik
   neben die erste zu stellen. Wer die eine Größe ändert, ändert beide — das
   ist hier Absicht.

   [8] UND [9] SIND DIE DARTSCH-STUDIEN. Die Studienlage bleibt damit in diesem
   Abschnitt — nur nicht mehr als ausgebreiteter Text, sondern als Beleg. */
export const QIMASTER_SECHS_G = {
  titel: '6G-Protection: Die Zukunft kommt.',
  absaetze: [
    '6G steht vor der Tür, und die Debatte darüber wird bisher völlig falsch geführt. Wer glaubt, es gehe wieder nur um höhere Datenraten und ein stärkeres Signal, hat den entscheidenden Punkt nicht verstanden. 6G ist keine Verstärkung dessen, was wir kennen — es ist ein Bruch mit der bisherigen Funktechnik. [1][2]',
    'Der Grund heißt Integrated Sensing and Communication, kurz ISAC. Das Netz sendet nicht mehr nur, es misst. Jede Basisstation, jedes Endgerät wird gleichzeitig zum Radar. Das Netz erfasst Entfernung, Geschwindigkeit, Position, Ausrichtung, Größe, Form, Abbild und sogar Materialien von Objekten in seiner Umgebung [1][2][3][4] — und rekonstruiert daraus die physische Welt, in der es arbeitet. [4][5] Räume, Wände, Möbel, Bewegungen, Gesten, Atmung: alles wird zur auswertbaren Größe. Das ist keine Verschwörungstheorie, das ist der erklärte Zweck der Technologie, nachzulesen in den Papieren von ETSI, ITU und 3GPP.',
    'Und genau hier liegt das Problem. Wir bekommen eine Infrastruktur, die permanent, flächendeckend und unsichtbar den Raum abtastet, in dem wir leben [3][6] — ohne dass jemand die gesundheitliche Wirkung dieser neuen Signalform ernsthaft untersucht hätte. [8][9] Die Grenzwerte, auf die man sich beruft, stammen aus einer Zeit, in der Funk Sprache übertrug und nicht Räume vermaß. [7] Die Beweislast wird umgedreht: Ausgerollt wird zuerst, geprüft wird — vielleicht — später. Wer Bedenken anmeldet, gilt als fortschrittsfeindlich. Das ist die eigentliche Zumutung.',
  ],
  quellen: [
    '[1] International Telecommunication Union: Framework and Overall Objectives of the Future Development of IMT for 2030 and Beyond. Recommendation ITU-R M.2160-0, Genf, November 2023. Definiert ISAC als eines von sechs Nutzungsszenarien für IMT-2030.',
    '[2] 3rd Generation Partnership Project: Feasibility Study on Integrated Sensing and Communication. 3GPP TR 22.837, Release 19, V19.4.0, Juni 2024. Ders.: Service Requirements for Integrated Sensing and Communication; Stage 1. 3GPP TS 22.137, Release 19.',
    '[3] European Telecommunications Standards Institute: ETSI Launches a New Group for Integrated Sensing and Communications, a Candidate Technology for 6G. Pressemitteilung, Sophia Antipolis, 21. November 2023.',
    '[4] Thorsten Wild, Artjom Grudnitsky, Silvio Mandelli, Marcus Henninger, Junqing Guan, Frank Schaich: 6G Integrated Sensing and Communication – From Vision to Realization. Nokia Bell Labs, Stuttgart 2023. Proof-of-Concept mit gleichzeitiger Datenübertragung und Umgebungserfassung.',
    '[5] Yameng Liu, Jianhua Zhang, Yuxiang Zhang u. a.: A Novel Multi-Reference-Point Modeling Framework for Monostatic Background Channel – Toward 3GPP ISAC Standardization. 2025.',
    '[6] Elmehdi Illi, Marwa Qaraqe u. a.: Integrating Sensing and Communications in 6G? Not Until It Is Secure to Do So. 2025.',
    '[7] International Commission on Non-Ionizing Radiation Protection: Guidelines for Limiting Exposure to Electromagnetic Fields (100 kHz to 300 GHz). Health Physics 118(5), 2020, S. 483–524.',
    '[8] Peter C. Dartsch: Protective Effect of QiOne® 2 Pro on Cultured Intestinal Epithelial Cells after Mobile Phone Radiation. Applied Cell Biology 9(3), 2021, S. 69–74.',
    '[9] Ders.: QiOne® 2 Pro – Investigations on its Potential for the Exclusion of Unwanted Cellular Effects of Mobile Phone Radiation. Japanese Journal of Medicine 4(1), 2021, S. 484–488.',
  ],
};

export const QIMASTER_PERSOENLICHKEIT = {
  titel: 'Persönlichkeitsentwicklung durch erhöhte Zellschwingung – was wir damit meinen',
  einstieg: [
    'Der Qi Master® ist für Menschen gebaut, die an sich arbeiten. Der Satz „Persönlichkeitsentwicklung durch erhöhte Zellschwingung“ kommt aus einer Überlieferung, die älter ist als jede Messung – und er steht auf einem Fundament, das wir messen können. Beides gehört auf diese Seite. Damit du es unterscheiden kannst, steht es nebeneinander.',
  ],
  ueberlieferung: {
    label: 'Überlieferung',
    titel: 'Das Bild von der Glühbirne',
    absaetze: [
      'Paramahansa Yogananda erzählt in seiner „Autobiographie eines Yogi“ (1946) zweimal dasselbe Bild. Als junger Mann bittet er einen Heiligen um die Erfahrung des Samadhi, und der lehnt ab:',
    ],
    zitate: [
      {
        text:
          '„Dein Körper ist noch nicht darauf gestimmt. So wie eine kleine Lampe eine zu hohe elektrische Spannung nicht aushält, sind deine Nerven für den kosmischen Strom noch nicht bereit. Gäbe ich dir jetzt die unendliche Ekstase, würdest du brennen, als stünde jede Zelle in Flammen.“',
        quelle:
          'Paramahansa Yogananda: Autobiography of a Yogi. 1946, Kapitel 13 („The Sleepless Saint“). Eigene Übersetzung.',
      },
      {
        text:
          '„Der Körper des Durchschnittsmenschen gleicht einer Fünfzig-Watt-Lampe, die die Milliarden Watt an Kraft nicht fassen kann, die eine übermäßige Praxis des Kriya weckt. Durch die allmähliche und regelmäßige Steigerung der einfachen und „narrensicheren“ Methoden des Kriya wird der Körper Tag für Tag astral verwandelt und schließlich fähig, die unendlichen Möglichkeiten kosmischer Energie auszudrücken – des ersten materiell wirksamen Ausdrucks des Geistes.“',
        quelle:
          'Ebd., Kapitel 26 („The Science of Kriya Yoga“). Eigene Übersetzung.',
      },
    ],
    nachsatz:
      'Das Bild ist einfach: Feinere Energie verlangt ein Gefäß, das sie tragen kann. Der Mensch bereitet sich vor – durch Übung, über Zeit –, damit er aufnehmen kann, was ihn sonst überfordern würde. Diese Vorbereitung ist bei Yogananda Yoga. Sie ist kein Schmuckstück, und wir machen sie nicht dazu.',
  },
  fundament: {
    label: 'Gebaut und gemessen',
    titel: 'Das technische Fundament',
    absaetze: [
      'Gebaut: Der Gitterchip™ im Qi Master® ist ein Bauteil ohne Elektronik – eine 750er Goldlegierung, deren Atome in einer festgelegten Ordnung stehen. Diese Ordnung prägt Wasser in seiner Umgebung: Die Moleküle bilden mehr Wasserstoffbrücken aus, ein Zustand, den die Physik kohärent nennt.',
      'Gemessen: In begutachteten Zellstudien (Dartsch, 2021) behielten Zellen unter der Strahlung eines sendenden Smartphones mit dem QiOne® 2 Pro – demselben Gitterchip™ – ihre Barrierefunktion rund zwölfmal besser als ungeschützte Zellen, und Immunzellen ihre Fähigkeit, Sauerstoffradikale zu bilden, zu 84,7 statt 60,5 Prozent des Kontrollwerts. Das sind Zellkulturen. Es sind keine Menschen, und es ist keine Aussage über Persönlichkeit.',
      'Dazu ein Modell, das wir nicht gemessen haben: Ulrich Warnke beschreibt, dass jede Zellmembran bei jeder Erregung eine kohärente elektromagnetische Welle im fernen Infrarot abstrahlt – bei einer Frequenz, die überraschend nah an einer Eigenfrequenz des Wassers liegt. Wenn das stimmt, sind Wasser und Zelle aufeinander abgestimmt, und Ordnung im Wasser wäre Ordnung, mit der die Zelle etwas anfangen kann. Das ist Warnkes Beschreibung; sie handelt von Zellen und Wasser, nicht von uns.',
    ],
    quelle:
      'Peter C. Dartsch: Applied Cell Biology 9(3), 2021, S. 69–74; Japanese Journal of Medicine 4(1), 2021, S. 484–488. Ulrich Warnke: Bionisches Wasser. Arkana, 2019, S. 338–341. Emilio Del Giudice u. a.: Fields of the Cell, 2015, S. 100–101.',
  },
  deutung: [
    'Zwischen der Überlieferung und dem Fundament liegt ein Sprung, und den machen wir – nicht Yogananda, nicht Warnke, nicht Dartsch. Er lautet: Wer an sich arbeitet, arbeitet auch an seinem Gefäß. Ein Körper, dessen Wasser geordneter ist, ist – in unserer Deutung – ein Körper, der feinere Schwingung leichter trägt. Das ist der Gedanke hinter „erhöhte Zellschwingung“, und er ist genau das: ein Gedanke, der auf einem gemessenen Fundament steht und über es hinausgeht.',
    'Der Qi Master® ersetzt keine Übung, keine Meditation und keinen Lehrer. Er begleitet den, der sie hat.',
  ],
};
