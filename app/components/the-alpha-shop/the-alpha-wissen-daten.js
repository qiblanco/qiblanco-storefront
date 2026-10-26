/*
 * WISSENS-STRECKE unter „What's in the Box“ auf /products/the-alpha
 * (Christian 26.10.2026, Z150–Z171; Grossjob 20261026-prio1-the-alpha-
 * variante-a-designmeister-premium-gestaltung, Segment s07).
 *
 * Christian wörtlich (Z150–Z153): „ide alten texte nehemen aber so
 * verschlanken und bei den texten kohärent und licht daf der pr manager
 * nahcmal ran damit das einfach wird. aber charismatisch weil schon zahlen
 * entahlten sind. keien rechtsprüfung. kein krürzen weil xyz“.
 *
 * HERKUNFT JE ABSCHNITT:
 *  - Diamant, Kristall: die Literaturblöcke der bisherigen Qi-Alpha-Seite
 *    (app/data/qi-master-texte.js, QIMASTER_DIAMANT), verschlankt; Königs
 *    Zitate und Quellen wörtlich.
 *  - Kohärenz, Licht: vom PR-Manager neu geschrieben, einfach und mit allen
 *    Zahlen (Z169: 3.545 °C, ein Zehntel Mikrometer, Millionen Moleküle,
 *    200–800 nm, 41 % in fünf Minuten), Schluss von Licht in Christians
 *    eigenen Worten („ordnet Licht / ordnet Wasser“); „rund“/„etwa“ auf
 *    Wunsch des PR-Managers gestrichen (s07-pr-freigabe.md). Quellen wörtlich wie bisher.
 *  - Kristall: der bisherige, von Christian abgenommene Wortlaut.
 *  - 6G: Christians Fassung vom 17.09. (QIMASTER_SECHS_G) Wort für Wort, so
 *    wie sie auch in seiner Figma steht; Quellen [1]–[9] vollständig. Eine
 *    verschlankte Server-Fassung hat der KI-Klang-Richter am 26.10. 3 von 3
 *    verworfen (Christian hatte genau so einen Satz schon einmal ersetzt).
 *  - Qi Alpha: Christians drei Spalten, Wort für Wort (QiMaster.jsx).
 * Gekürzt ist nur für die Lesbarkeit (Z171), nie aus Vorsicht.
 *
 * BILDER: die vier Zeichnungen der Literaturblöcke (1024 × 1024 auf dem
 * Shopify-CDN, Herkunft in app/data/qi-master-literaturbilder.js). Es sind
 * dieselben Motive wie in Christians Figma-Ausschnitten (Gitter wird DNA,
 * goldenes Gitter, Wellen, Zelle). Größere Originale gibt es nicht; die Seite
 * zeigt sie höchstens 512 CSS-px breit, also mit doppelter Pixeldichte.
 */

import {QIMASTER_LITERATURBILDER as BILD} from '../../data/qi-master-literaturbilder.js';

const KOENIG = 'Dr. Michael König: Das Urwort – Die Physik Gottes. Scorpio, 2011';

export const THE_ALPHA_WISSEN = [
  {
    id: 'diamant',
    etikett: 'Diamant',
    titel: 'Diamant ist reiner Kohlenstoff.',
    bild: BILD.kohlenstoff,
    absaetze: [
      'Die Grundlage unseres Lebens. Jedes Eiweiß, jede Zellmembran, jeder Strang deiner DNA hat ein Skelett aus Kohlenstoffatomen. Im Qi Alpha trägst du Kohlenstoff in seiner edelsten Form.',
    ],
    zitat:
      '„Zum einen besteht der Diamant zu hundert Prozent aus Kohlenstoff. Das chemische Element Kohlenstoff spielt ja gerade in biologischen Systemen eine bedeutende Rolle. […] Alles Leben, so wie wir es auf der Erde kennen, basiert auf Kohlenstoff.“',
    zitatVon: 'Dr. Michael König',
    quellen: [`${KOENIG}, S. 171–172.`],
  },
  {
    id: 'kristall',
    etikett: 'Kristall',
    titel: 'Licht im Kristallgitter.',
    bild: BILD.gitter,
    absaetze: [
      'Ein reiner Diamant lässt sichtbares Licht ungehindert durch; erst im ultravioletten Bereich, bei Wellenlängen unter 200 Nanometern, beginnt er Licht aufzunehmen. Dr. Michael König beschreibt, dass zwischen den Atomlagen des Gitters stehende Lichtwellen entstehen und ein Teil des ungeordneten Umgebungslichts geordnet, also kohärent, wieder abgegeben wird. Und weil die Kohlenstoffatome im Diamanten dieselben Anregungsstufen haben wie die Kohlenstoffatome in organischen Molekülen, folgert er:',
    ],
    zitat:
      '„Die Kohlenstoffatome im Diamanten senden also auf den richtigen Frequenzen, die die Kohlenstoffatome in biologischem Material empfangen können.“',
    zitatVon: 'Dr. Michael König',
    quellen: [`${KOENIG}, S. 169–172.`],
  },
  {
    id: 'kohaerenz',
    etikett: 'Kohärenz',
    titel: 'Kohärenz: alles schwingt im Gleichtakt.',
    bild: BILD['Kohärenz'],
    absaetze: [
      'Kohärenz heißt, dass viele Teilchen im selben Takt schwingen, wie ein Chor, in dem jede Stimme genau mit den anderen singt. Der Physiker Emilio Del Giudice nennt den Diamanten als Beispiel: Er hält diesen Takt bis 3.545 °C und verliert ihn erst, wenn er schmilzt.',
      'Auch Wasser kann das. Del Giudice hat darin Inseln von einem Zehntel Mikrometer beschrieben, in denen Millionen Moleküle im Takt schwingen. Der Gitterchip™ bringt die Wassermoleküle um dich herum in genau diesen Gleichtakt.',
    ],
    quellen: [
      'Emilio Del Giudice u. a.: The origin and the special role of coherent water in living systems. In: Fields of the Cell. Research Signpost, 2015, S. 97 und 100.',
      'Giuliano Preparata: QED Coherence in Matter. World Scientific, 1995.',
    ],
  },
  {
    id: 'licht',
    etikett: 'Licht',
    titel: 'Licht: deine Zellen leuchten.',
    bild: BILD.licht,
    absaetze: [
      'Jede lebende Zelle gibt Licht ab, so fein, dass dein Auge es nicht sieht. Der Biophysiker Fritz-Albert Popp hat es über Jahrzehnte gemessen: geordnetes Licht zwischen 200 und 800 Nanometern, mit der DNA als Quelle. Genau an seinem ultravioletten Ende nimmt ein Diamant Licht auf.',
      'Licht ordnet auch Wasser. Der Bioingenieur Gerald Pollack hat Wasser fünf Minuten lang mit mittlerem Infrarot bestrahlt, danach war die geordnete Wasserschicht 41 Prozent breiter. Im Qi Alpha arbeiten beide zusammen: „The One Eye“ ordnet das Licht, der Gitterchip™ das Wasser.',
    ],
    quellen: [
      'Fritz-Albert Popp: Biophotonen – Neue Horizonte in der Medizin. 3. Auflage, Haug, 2006, S. 51–54 und 229.',
      'Gerald H. Pollack: The Fourth Phase of Water. Ebner & Sons, 2013, Kap. 6.',
      'Anqi Wang, Gerald H. Pollack: Effect of infrared radiation on interfacial water at hydrophilic surfaces. Colloid and Interface Science Communications 42, 2021.',
    ],
  },
  {
    id: 'sechs-g',
    etikett: '6G',
    // Christians Wortlaut: das Stil-Tor schneidet ihn über data-fremdtext aus.
    wortlaut: 'christian-6g-2026-09-17',
    titel: '6G-Protection: Die Zukunft kommt.',
    bild: null,
    absaetze: [
      '6G steht vor der Tür, und die Debatte darüber wird bisher völlig falsch geführt. Wer glaubt, es gehe wieder nur um höhere Datenraten und ein stärkeres Signal, hat den entscheidenden Punkt nicht verstanden. 6G ist keine Verstärkung dessen, was wir kennen — es ist ein Bruch mit der bisherigen Funktechnik. [1][2]',
      'Der Grund heißt Integrated Sensing and Communication, kurz ISAC. Das Netz sendet nicht mehr nur, es misst. Jede Basisstation, jedes Endgerät wird gleichzeitig zum Radar. Das Netz erfasst Entfernung, Geschwindigkeit, Position, Ausrichtung, Größe, Form, Abbild und sogar Materialien von Objekten in seiner Umgebung [1][2][3][4] — und rekonstruiert daraus die physische Welt, in der es arbeitet. [4][5] Räume, Wände, Möbel, Bewegungen, Gesten, Atmung: alles wird zur auswertbaren Größe. Das ist keine Verschwörungstheorie, das ist der erklärte Zweck der Technologie, nachzulesen in den Papieren von ETSI, ITU und 3GPP.',
      'Und genau hier liegt das Problem. Wir bekommen eine Infrastruktur, die permanent, flächendeckend und unsichtbar den Raum abtastet, in dem wir leben [3][6] — ohne dass jemand die gesundheitliche Wirkung dieser neuen Signalform ernsthaft untersucht hätte. [8][9] Die Grenzwerte, auf die man sich beruft, stammen aus einer Zeit, in der Funk Sprache übertrug und nicht Räume vermaß. [7] Die Beweislast wird umgedreht: Ausgerollt wird zuerst, geprüft wird — vielleicht — später. Wer Bedenken anmeldet, gilt als fortschrittsfeindlich. Das ist die eigentliche Zumutung.',
    ],
    quellen: [
      '[1] International Telecommunication Union: Framework and Overall Objectives of the Future Development of IMT for 2030 and Beyond. Recommendation ITU-R M.2160-0, Genf, November 2023.',
      '[2] 3rd Generation Partnership Project: Feasibility Study on Integrated Sensing and Communication. 3GPP TR 22.837, Release 19, V19.4.0, Juni 2024. Ders.: Service Requirements for Integrated Sensing and Communication; Stage 1. 3GPP TS 22.137, Release 19.',
      '[3] European Telecommunications Standards Institute: ETSI Launches a New Group for Integrated Sensing and Communications, a Candidate Technology for 6G. Pressemitteilung, Sophia Antipolis, 21. November 2023.',
      '[4] Thorsten Wild, Artjom Grudnitsky, Silvio Mandelli, Marcus Henninger, Junqing Guan, Frank Schaich: 6G Integrated Sensing and Communication – From Vision to Realization. Nokia Bell Labs, Stuttgart 2023.',
      '[5] Yameng Liu, Jianhua Zhang, Yuxiang Zhang u. a.: A Novel Multi-Reference-Point Modeling Framework for Monostatic Background Channel – Toward 3GPP ISAC Standardization. 2025.',
      '[6] Elmehdi Illi, Marwa Qaraqe u. a.: Integrating Sensing and Communications in 6G? Not Until It Is Secure to Do So. 2025.',
      '[7] International Commission on Non-Ionizing Radiation Protection: Guidelines for Limiting Exposure to Electromagnetic Fields (100 kHz to 300 GHz). Health Physics 118(5), 2020, S. 483–524.',
      '[8] Peter C. Dartsch: Protective Effect of QiOne® 2 Pro on Cultured Intestinal Epithelial Cells after Mobile Phone Radiation. Applied Cell Biology 9(3), 2021, S. 69–74.',
      '[9] Ders.: QiOne® 2 Pro – Investigations on its Potential for the Exclusion of Unwanted Cellular Effects of Mobile Phone Radiation. Japanese Journal of Medicine 4(1), 2021, S. 484–488.',
    ],
  },
];

/* Abschnitt 6, Christians drei Spalten Wort für Wort (Figma „Qi Alpha“,
   bisher QiMaster.jsx „Eine bisher unerreichte Liga“). */
export const THE_ALPHA_LIGA = {
  etikett: 'Qi Alpha',
  wortlaut: 'christian-liga-2026-09-17',
  titel: 'Qi Alpha – eine bisher unerreichte Liga.',
  spalten: [
    {
      titel: 'Der Gitterchip™ der ultimativen Generation',
      text: 'Der Kern des Qi Alpha ist ein zweiteiliger Gitterchip™, definiert durch die über ein Jahrzehnt andauernde Forschung am QiOne®. Das Ergebnis ist die außergewöhnlichste Erscheinung: Eine Goldlegierung, deren Atome in einer einmalig definierten Ordnung stehen. Kohärent wirkend und ihre Umgebung aktiv prägend.',
    },
    {
      titel: '„The One Eye“ – Hochreiner Natur Diamant',
      text: 'Ein Diamant ist reiner Kohlenstoff – dasselbe Element, aus dem jede Zelle deines Körpers gebaut ist. Alles Leben, so wie wir es auf der Erde kennen, basiert auf Kohlenstoff. „Die Kohlenstoffatome im Diamanten senden also auf den richtigen Frequenzen, die die Kohlenstoffatome in biologischem Material empfangen können.“ – Dr. Michael König',
    },
    {
      titel: 'Pure Leistung. Pure Entspannung.',
      text: 'Durch dieses einmalige Duett des Gitterchips™ und „The One Eye“ ist der Qi Alpha auf jegliche erdenkbare Zukunft vorbereitet. Egal ob sie 6G, Umweltgifte oder Schicksalsschläge lautet. Der Qi Alpha leistet auf jeder Ebene das erdenkliche Maximum.',
    },
  ],
  quellen: [`${KOENIG}, S. 169–172.`],
};
