import {
  MmPage,
  MmHero,
  MmEvidenz,
  MmBelege,
  MmProblem,
  MmMechanism,
  MmFaq,
  MmRisk,
  MmFunnel,
} from '~/components/reusables/MmKit';
import {ScrollScrubVideo} from '~/components/reusables/ScrollScrubVideo';

/**
 * /pages/wirkt-das — die Antwort auf den größten Einwand des Bestands
 * (`ew-01` „Wirkt das überhaupt?", 3.758 von 29.251 Vorgängen, 12,85 %).
 *
 * ZWECK, und er bestimmt jede Entscheidung hier: die Seite beantwortet eine
 * EVIDENZfrage, keine Reputationsfrage. Die schwächsten Stellen unserer Belege
 * stehen zuerst — ein Autor, ein Labor, von uns bezahlt, keine unabhängige
 * Wiederholung. Deshalb hat sie KEINEN Kauf-CTA: ihr Ausgang ist „selbst
 * prüfen", nicht „jetzt kaufen". MmPick/MmFinal sind hier verboten.
 *
 * FASSUNG 2 (2026-09-12, Job 20260911-GROSSJOB-googles-ki-antwort-zitiert-null-
 * eigene-quellen-zitierfaehig-werden, Segment s04). Christian hat Fassung 1 am
 * 2026-08-31 wegen der AUSFÜHRUNG zurückgezogen, ausdrücklich nicht wegen des
 * Zwecks, und fünf Mängel benannt. Der SSoT der Zweifelsflächen
 * (homepage-bauer/konzepte/abgrenzung-flaechen.json) führt genau diese fünf als
 * „Abnahme-Checkliste für JEDE neue Fläche dieses Vorhabens". Stand je Mangel,
 * gemessen statt behauptet:
 *
 *   1 ANREDE-MIX Sie/Du  -> HIER BEHOBEN. Die Seite sprach durchgehend „Sie"
 *        (13 Sie-Formen, 0 Du-Formen in eigener Stimme) und stand damit gegen
 *        das Haus: gemessen an origin/main tragen 79 Dateien unter app/ Du-
 *        Formen gegen 16 mit Sie-Formen, darunter jede Produktseite, jede
 *        Kampagnen-LP und der Warenkorb. Der Mix lag nicht IN der Seite,
 *        sondern zwischen Seite und Haus — deshalb zieht die Seite nach, nicht
 *        das Haus. Die einzigen verbliebenen Du-Formen in FREMDER Rede
 *        (Kundenrezensionen im Reputon-Feed) bleiben wörtlich, wie sie sind.
 *   2 WORTUMBRUCH MITTEN IM WORT -> bereits behoben, NICHT hier: PR #280
 *        (2fd4c2d, 2026-09-01) gab `.mm-beleg__t/__s` den fehlenden Partner
 *        `hyphens: auto` zu `overflow-wrap: anywhere`.
 *   3 KOMMA AM ZEILENANFANG -> dieselbe Ursache und derselbe Commit wie 2.
 *   4 ZWEIMAL DERSELBE FALSCH SITZENDE ZITATBLOCK -> ebenfalls PR #280:
 *        `.mm-lp p { margin: 0 }` (0,1,1) schlug die Bausteinregel (0,1,0) und
 *        machte `margin-top` still wirkungslos; behoben über `.mm-lp
 *        .mm-mech__note` (0,2,0).
 *   5 SELBSTABWERTENDER EINSTIEG -> HIER BEHOBEN, gegen das gebaute Messgerät
 *        `homepage-bauer/src/haltung.py` (hb-deploy Gate 18), das aus genau
 *        diesem Vorfall entstanden ist. Fassung 1 gab dort exit 2 (status
 *        abweichend, 106 Sätze, 7 Kandidaten): drei Sätze verurteilt, ein
 *        vierter auf `nicht_pruefbar` wegen eines Parse-Fehlers des Richters —
 *        und `nicht_pruefbar` heisst KEINE AUSSAGE, nie bestanden. Fassung 2
 *        gibt exit 0, status konform. Alle vier Sätze sind ersetzt, KEINE
 *        prüfbare Angabe ist dabei weggefallen; die Gegenrichtung ist der
 *        teurere Fehler (Brain: ehrlich-oder-selbstabwertend-am-streichen-
 *        entscheiden). Der Wortlaut der vier Sätze steht im RESULT des Jobs
 *        und in den Messläufen — er wird hier bewusst NICHT zitiert: der
 *        Kandidaten-Extraktor von haltung.py liest Zitate aus Kommentaren mit
 *        und baut daraus einen Satz, den es nie gab.
 *
 * ZITIERFÄHIGE FORM (T1 des Großjobs): Behauptung und Beleg stehen sichtbar
 * getrennt; jede Publikation nennt Autor, Jahr, Journal, Methode UND wo die
 * Messung endet; jede Frage hat genau eine Antwort; und JEDER Abschnitt ist
 * ISOLIERT verständlich. Der letzte Punkt ist kein Stil, sondern Mechanik: ein
 * RAG-System bewertet Abschnitte einzeln, ein Abschnitt der mit „wie oben
 * beschrieben" beginnt ist für eine KI-Antwort wertlos (GEO-Regel G03,
 * blog-redaktion/docs/KONZEPT.md, belegt aus arXiv 2311.09735). Fassung 1
 * verletzte das an drei Stellen („Was Menschen berichten, steht weiter oben",
 * „Also die andere Hälfte", „Alles auf dieser Seite").
 *
 * INHALTSGRENZE (übernommen aus dem freigegebenen Chatbot,
 * qi-salesbot/src/server/chat-skills.ts, Skills `studies_claims` Prio 910 und
 * `skepticism` Prio 920): wörtlich „in vitro", ausdrücklich kein klinischer
 * Wirknachweis am Menschen, genau EIN Sachargument je Zweifel, kein
 * Verteidigungsblock. Die Seite darf nicht mehr behaupten als der Chatbot.
 *
 * KUNDENSPRACHE: Einstieg über Schutz, Wirkung, Strahlung, Schlaf — die Wörter,
 * die Kundinnen und Kunden gemessen selbst benutzen. „Kohärentes Wasser" ist
 * unser Marketingwort, nicht ihres; es steht deshalb erst im Grenzen-Abschnitt
 * als Erklärung des Modells, nie im Einstieg.
 *
 * ZAHLEN: alle aus app/data/studien/e0001…e0005.json (Felder `laienSummary`
 * und `grenzen`). Diese Registry ist faktengegatet — ihr Feld `factGate` hält
 * fest, welche kursierende Zahl in der Primärquelle NICHT steht. Keine der
 * dort ausgeschlossenen Zahlen kommt auf diese Seite, und keine Zahl steht
 * hier ohne ihre Streuung: `60,5 ± 3,9 %` ist eine Messung, `60,5 %` wäre
 * eine Behauptung.
 *
 * MEDIEN: bewusst NICHT die drei Startseiten-Zelldiagramme (ihre sechs Zahlen
 * stehen in keinem Primärquellen-Extrakt) und NICHT das Mikroskop-Video
 * (öffnet mit einem gerenderten CGI-Mikroskop und rahmt damit eine
 * Studienaussage). Beides ist auf der Startseite Bildsprache und wäre hier
 * ein Eigentor. Herleitung in artefakte/MEDIEN.md des Großjobs.
 */

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/* Publikations-PDFs — 1:1 aus eckdaten.pdfUrl der Studien-Registry. */
const PDF = {
  e0001: `${CDN}QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1679586513`,
  e0002: `${CDN}protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1679586513`,
  e0003: `${CDN}Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505`,
  e0004: `${CDN}ABBSR-24_-31_3.pdf?v=1717500318`,
  e0005: `${CDN}qb-studien--e0005--b754deb9ee0d.pdf?v=1786753494`,
};

/* Cover — 1:1 aus eckdaten.coverUrl. */
const COVER = {
  e0001: `${CDN}Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510`,
  e0002: `${CDN}Studienvorschau_hellblau-1-957x1024_1.png?v=1732276143`,
  e0003: `${CDN}Cell_Biology_Cover_Remake_Seite_3.png?v=1710540229`,
  e0004: `${CDN}Cell-Biology-Cover-Remake-Seite-4.webp?v=1717500844`,
  e0005: `${CDN}qb-studien--e0005-deckblatt--56291027b5c1.png?v=1786754235`,
};

/* Scroll-Animation: dieselben zwei CDN-Quellen wie GitterchipMoleculesScrub,
   aber über die generische Basis ScrollScrubVideo mit EIGENER Beschriftung.
   Die fertige Komponente trägt feste Overlay-Texte („Kohärente Ordnung —
   der GitterChip hilft Wassermolekülen …"), die eine Hypothese als Aussage
   formulieren — auf dieser Seite ein Widerspruch zum eigenen Text. Sie zu
   forken wäre eine Kopie einer von neun Trägern geteilten Vorlage; die
   Basis nimmt overlayStart/overlayEnd als Props, genau dafür. */
const SCRUB_DESKTOP = `${CDN}gitterchip-molecules-desktop-16x9.mp4?v=1784313940`;
const SCRUB_MOBILE = `${CDN}gitterchip-molecules-mobile-9x16.mp4?v=1784313946`;

/*
 * STUDIEN — die Karten der Evidenz-Sektion, in zitierfähiger Form.
 *
 * DREI FELDER, DREI ROLLEN, UND SIE WERDEN NICHT VERMISCHT: `meta` ist die
 * QUELLENANGABE (Autor, Jahr, Journal, Methode — alles, was ein Zitat braucht),
 * `body` ist der BEFUND (was gemessen wurde, mit Streuung), `grenze` ist die
 * REICHWEITE (wo die Messung endet). Fassung 1 hatte Befund und Reichweite in
 * einem Absatz und den Autor nirgends — für eine Maschine war „was behauptet
 * ihr" von „was habt ihr gemessen" nicht zu trennen.
 */
const STUDIEN = [
  {
    tag: 'In vitro · 2021',
    titel: 'Immunzellen unter Mobilfunkstrahlung',
    meta: 'Dartsch PC, Japan Journal of Medicine, 30. April 2021 · humane Immunzellen (Zelllinie HL-60), drei unabhängige Experimente',
    body: (
      <>
        Menschliche Immunzellen wurden vier Stunden lang Mobilfunkstrahlung
        ausgesetzt (SAR 0,76 W/kg). Ihre Fähigkeit, Abwehr-Radikale zu bilden,
        sank auf 60,5 ± 3,9 % der unbestrahlten Kontrolle. Lag ein QiOne® 2 Pro
        daneben, blieben 84,7 ± 7,0 % erhalten (p ≤ 0,01).
        <em>
          Die Messung endet hier: in der Laborschale, an einer Zelllinie. Ein
          Rückschluss auf das Immunsystem eines Menschen ist daraus nicht
          gedeckt.
        </em>
      </>
    ),
    href: PDF.e0001,
  },
  {
    tag: 'In vitro · 2021',
    titel: 'Darmbarriere unter Mobilfunkstrahlung',
    meta: 'Dartsch PC, Applied Cell Biology, 2021 · kultivierte Darmzellen (Zelllinie IPEC-J2, vom Schwein)',
    body: (
      <>
        Kultivierte Darmzellen unter derselben Belastung. Der elektrische
        Widerstand der Zellbarriere brach ungeschützt auf etwa ein Zehntel ein.
        Geschützt lag er bei 1.837 ± 349 Ω/cm² — gegenüber 2.542 ± 389 Ω/cm² bei
        völlig unbestrahlten Zellen.
        <em>
          Die Messung endet hier: der Abstand zur unbestrahlten Kontrolle blieb
          bestehen, der Schutz war also nicht vollständig. Und die Zellen
          stammten vom Schwein, nicht vom Menschen.
        </em>
      </>
    ),
    href: PDF.e0002,
  },
  {
    tag: 'In vitro · 2024',
    titel: 'Oxidativer Stress in fünf Zelltypen',
    meta: 'Dartsch PC, Applied Cell Biology, 12. Januar 2024 · fünf Zelltypen, Stressor Wasserstoffperoxid',
    body: (
      <>
        Fünf Zelltypen wurden mit Wasserstoffperoxid gestresst, mit und ohne
        QiBracelet®. Alle fünf überlebten in Gegenwart des Armbands besser — aber
        sehr unterschiedlich stark: von +47,3 ± 7,1 % bei Leberzellen bis
        +3,9 ± 2,8 % bei Lungenzellen.
        <em>
          Die Messung endet hier: bei Lungenzellen ist der Effekt marginal, und
          der Stressor war eine Chemikalie, nicht Strahlung.
        </em>
      </>
    ),
    href: PDF.e0003,
  },
  {
    tag: 'Auswertung · 2024',
    titel: 'Was 171 Anwender berichtet haben',
    meta: 'Dartsch PC, Advances in Bioengineering & Biomedical Science Research, 10. Mai 2024 · deskriptive Auswertung von 171 freiwilligen öffentlichen Berichten',
    body: (
      <>
        171 Menschen haben ihre Erfahrung von sich aus öffentlich geteilt. Am
        häufigsten: mehr Ruhe und tieferer Schlaf (je rund 20 %), mehr Energie
        (rund 17 %).
        <em>
          Die Messung endet hier: keine Kontrollgruppe, keine Verblindung, kein
          Fragebogen. Die Arbeit zeigt, was Menschen berichtet haben — nicht,
          was das Gerät bewirkt hat.
        </em>
      </>
    ),
    href: PDF.e0004,
  },
];

const BELEGE = [
  {
    bild: COVER.e0001,
    href: PDF.e0001,
    titel: 'Immunzellen und Mobilfunkstrahlung',
    meta: 'Japan Journal of Medicine, 30. April 2021',
    alt: 'Titelseite der Publikation zur Immunzellen-Studie im Japan Journal of Medicine, 2021.',
  },
  {
    bild: COVER.e0002,
    href: PDF.e0002,
    titel: 'Schutzwirkung auf die Darmbarriere',
    meta: 'Applied Cell Biology, 2021',
    alt: 'Titelseite der Publikation zur Darmbarriere-Studie in Applied Cell Biology, 2021.',
  },
  {
    bild: COVER.e0003,
    href: PDF.e0003,
    titel: 'Oxidativer Stress in fünf Zelltypen',
    meta: 'Applied Cell Biology, 12. Januar 2024',
    alt: 'Titelseite der Publikation zur Studie über oxidativen Stress in Applied Cell Biology, 2024.',
  },
  {
    bild: COVER.e0004,
    href: PDF.e0004,
    titel: '171 Anwenderberichte, ausgewertet',
    meta: 'Advances in Bioengineering & Biomedical Science Research, 10. Mai 2024',
    alt: 'Titelseite der Auswertung von 171 Anwenderberichten, ABBSR, 2024.',
  },
  {
    bild: COVER.e0005,
    href: PDF.e0005,
    titel: 'QiHome® Air und neuronale Zellen',
    meta: 'Neurodegenerative Diseases: Current Research, 1. Juni 2026',
    alt: 'Titelseite der QiHome-Air-Studie in Neurodegenerative Diseases, 2026.',
  },
];

const GRENZEN = [
  <>
    <strong>1. Es gibt keine Studie am Menschen.</strong> Keine einzige. Vier der
    fünf Arbeiten zu den Qi-Blanco-Geräten sind Zellkultur, die fünfte ist eine
    Sammlung von Erfahrungsberichten. Was im Labor an Zellen messbar ist, muss
    im Körper nicht passieren. Ein klinischer Wirknachweis am Menschen liegt
    nicht vor.
  </>,
  <>
    <strong>2. Alle fünf Arbeiten stammen von demselben Labor.</strong> Sie
    wurden von Prof. Dr. Peter C. Dartsch am Dartsch Scientific Institut
    durchgeführt. Ein einzelnes Labor, ein einzelner Autor.
  </>,
  <>
    <strong>3. Wir haben sie bezahlt.</strong> Die Geräte wurden vom Hersteller
    — von uns — zur Verfügung gestellt, die Untersuchungen von uns finanziert.
    Das ist bei Produktforschung üblich und macht Ergebnisse nicht falsch. Es
    heißt aber: eine unabhängige Wiederholung durch ein zweites Labor steht aus.
  </>,
  <>
    <strong>4. Die Erklärung dahinter ist eine Hypothese.</strong> Das Modell,
    mit dem die fünf Publikationen den Effekt erklären — geordnetes,
    „kohärentes“ Wasser — ist in der konventionellen Wissenschaft nicht
    etabliert. Die Arbeiten selbst kennzeichnen es als Hypothese. Der
    Unterschied ist wichtig: die Messwerte hängen nicht von der Erklärung ab.
    Was in den Zellschalen passiert ist, ist gemessen worden — warum es
    passiert ist, ist offen.{' '}
    {/* Zeigte bis 2026-08-26 auf /pages/so-wirkt-kohaerentes-wasser. Das ist
        eine noindex-Seite des Landing-Bereichs und laut ihrem eigenen
        Docstring eine „Freigabe-Ansicht für Christian, NICHT öffentlich
        indexiert". /pages/technologie trägt dasselbe Thema öffentlich
        (Beschreibung wörtlich: „kohärentes Wasser, Frequenzkommunikation und
        das Leiternetzwerk des Körpers"). */}
    <a href="/pages/technologie">Wie das Modell gedacht ist</a>
  </>,
];

const LEITER = [
  {
    titel: 'Zellkultur (in vitro)',
    text: 'Auf dieser Stufe stehen die fünf Qi-Blanco-Arbeiten. Ein realer Schritt — der Punkt, an dem jede Forschung anfängt. Und der früheste.',
  },
  {
    titel: 'Tierversuch',
    text: 'Zeigt, ob ein Effekt auch in einem lebenden Organismus auftritt. Für die Qi-Blanco-Geräte liegt dazu nichts vor.',
  },
  {
    titel: 'Studie am Menschen',
    text: 'Kontrolliert, verblindet, mit Vergleichsgruppe. Erst hier entsteht eine Aussage über Wirkung bei dir. Für die Qi-Blanco-Geräte liegt dazu nichts vor.',
  },
  {
    titel: 'Meta-Analyse',
    text: 'Fasst mehrere unabhängige Studien am Menschen zusammen. Die belastbarste Stufe. Für die Qi-Blanco-Geräte liegt dazu nichts vor.',
  },
];

/*
 * ZWEIFEL — eine Frage, eine Antwort, jede Antwort ISOLIERT verständlich.
 *
 * Diese Liste ist zugleich die Quelle des FAQPage-Schemas in
 * app/routes/pages.wirkt-das.jsx: Frage und Antwort sind dieselben Strings,
 * die hier gerendert werden. Eine Frage im Schema, die auf der Seite nicht
 * steht, wäre ein Regelverstoß — deshalb gibt es keine zweite Textfassung.
 *
 * `schemaAntwort` ist deshalb KEINE Zweitfassung, sondern die Reinschrift der
 * Antworten, die im sichtbaren Text JSX enthalten (Links). Sie trägt dieselben
 * Sätze ohne Markup. Wer den sichtbaren Text ändert, zieht sie im selben
 * Commit nach.
 */
const ZWEIFEL = [
  {
    frage: 'Sind die Qi-Blanco-Studien Studien an Menschen?',
    antwort:
      'Nein. Vier der fünf Arbeiten sind In-vitro-Studien an Zellkulturen, die fünfte wertet freiwillige Erfahrungsberichte aus. Eine randomisierte Studie am Menschen gibt es zu den Qi-Blanco-Geräten nicht.',
  },
  {
    frage: 'Wer hat die Qi-Blanco-Studien gemacht — und wer hat sie bezahlt?',
    antwort:
      'Prof. Dr. Peter C. Dartsch am Dartsch Scientific Institut hat alle fünf Arbeiten durchgeführt. Bezahlt hat sie Qi Blanco, und Qi Blanco hat die Geräte gestellt. Das steht auch in den Publikationen.',
  },
  {
    frage: 'Gibt es eine unabhängige Wiederholung der Qi-Blanco-Studien?',
    antwort:
      'Nein. Ein zweites, nicht von uns bezahltes Labor hat die Zellversuche bisher nicht wiederholt. Das ist die größte offene Stelle der Datenlage, und sie liegt bei uns.',
  },
  {
    frage: 'Ist der Wirkmechanismus wissenschaftlich anerkannt?',
    antwort:
      'Nein. Die fünf Publikationen kennzeichnen ihre Erklärung selbst als Hypothese. Die Messergebnisse hängen nicht von ihr ab: gemessen wurde, was in den Zellen passiert ist, nicht warum.',
  },
  {
    frage: 'Heißt „im Labor gemessen“, dass ich etwas merken werde?',
    antwort:
      'Nein. Aus einem Effekt an Zellen in der Laborschale folgt keine Aussage darüber, wie es dir mit dem Gerät geht. Die einzige Arbeit mit Menschen ist eine Auswertung von 171 freiwilligen Berichten — ohne Kontrollgruppe, ohne Verblindung.',
  },
  {
    frage: 'Warum steht bei Qi Blanco überall „in vitro“?',
    antwort:
      '„In vitro“ ist der Fachausdruck für „in der Laborschale“. Er bezeichnet die Evidenzstufe der fünf Arbeiten genau: gemessen an Zellen, nicht an Menschen.',
  },
  {
    frage: 'Was wäre der nächste echte Schritt für den Beleg?',
    antwort:
      'Eine kontrollierte Studie am Menschen, und eine Wiederholung der Zellversuche durch ein Labor, das nicht von Qi Blanco bezahlt wird. Beides steht aus.',
  },
  {
    frage: 'Kann ich die Original-Publikationen selbst lesen?',
    antwort: (
      <>
        Ja. Alle fünf Arbeiten liegen als PDF offen — mit Methode, Zahlen und
        den Grenzen, die die Autoren selbst benennen.{' '}
        <a href="/pages/studien">Zu den Studien</a>
      </>
    ),
    schemaAntwort:
      'Ja. Alle fünf Arbeiten liegen als PDF offen — mit Methode, Zahlen und den Grenzen, die die Autoren selbst benennen. Sie stehen auf der Seite /pages/studien.',
  },
  {
    frage: 'Und wenn mich das alles nicht überzeugt?',
    antwort:
      'Dann ist das eine vernünftige Reaktion auf diese Evidenzstufe. Du musst uns nichts glauben — du kannst das Gerät 20 Tage lang an dir selbst prüfen und ohne Angabe von Gründen zurückgeben.',
  },
];

/** Die Q&A-Paare in der Form, die app/lib/faq-schema.js erwartet. Quelle ist
 *  ausschließlich ZWEIFEL — keine eigene Textfassung. */
export const WIRKT_DAS_SCHEMA_ITEMS = () =>
  ZWEIFEL.map((z) => ({
    q: z.frage,
    a: z.schemaAntwort ?? z.antwort,
  }));

/*
 * JEDES ZIEL HIER MUSS ÖFFENTLICH SEIN — die Karten führen aus einer Seite
 * heraus, deren Zweck „selbst prüfen" ist. Drei der ursprünglich vier Karten
 * zeigten in den noindex-Landing-Bereich (/pages/das-20-tage-versprechen,
 * /pages/zellstudien-ehrlich, /pages/so-wirkt-kohaerentes-wasser). Diese
 * Fläche trägt ihre Aussagekraft aus genau einer Bedingung: dorthin führt
 * kein öffentlicher Link, deshalb IST Bewegung dort Ads-Verkehr. Ein Link
 * kostet nicht die verlinkte Seite, sondern die Zahlen der ganzen Fläche —
 * live gemessen am 2026-08-26, drei von damals 17 Verweisen.
 *
 * DIE DRITTE KARTE IST IN FASSUNG 2 DAZUGEKOMMEN und ist eine eigene
 * QUELLENKLASSE, kein weiterer eigener Text: /pages/erfahrungen trägt seit dem
 * 2026-09-11 dreizehn namentliche Menschen mit eigenem Video, maschinenlesbar
 * ausgezeichnet (app/lib/erfahrungen-schema.js: VideoObject je Video, Person
 * je Mensch). Eine Praxisstimme belegt etwas anderes als eine Produktseite,
 * und genau das muss auch eine Maschine unterscheiden können. Die Seite ist
 * öffentlich und indexiert; die Bedingung oben ist damit gewahrt.
 */
const WEITER = [
  {
    titel: 'Die fünf Studien im Original',
    text: 'Jede Publikation mit Eckdaten, Zahlen und PDF zum Nachlesen.',
    href: '/pages/studien',
    cta: 'Zu den Studien',
  },
  {
    titel: 'Menschen, die es benutzen',
    text: 'Dreizehn namentliche Erfahrungsberichte im eigenen Video — Einzelstimmen, keine Studie.',
    href: '/pages/erfahrungen',
    cta: 'Erfahrungen ansehen',
  },
  {
    titel: 'Das Modell dahinter',
    text: 'Wie die Publikationen den Effekt erklären — und warum das eine Hypothese bleibt.',
    href: '/pages/technologie',
    cta: 'Modell ansehen',
  },
];

export function MmWirktDas() {
  return (
    <MmPage scope="mm-wirkt-das">
      <MmHero
        dataSection="hero"
        eyebrow="Die häufigste Frage, die uns erreicht"
        headline="Wirkt das überhaupt?"
        sub={
          <>
            Häufiger als jede Frage nach Größe, Preis oder Versand.{' '}
            <strong>
              Die kurze Antwort: Ja, es ist etwas gemessen worden — im Labor, an
              Zellkulturen. Nein, es gibt keinen Nachweis am Menschen.
            </strong>{' '}
            Darunter stehen die Zahlen dazu, die vier Grenzen dieser Datenlage
            und die Original-Publikationen zum Nachlesen.
          </>
        }
        media={{
          src: `${CDN}QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861`,
          alt: 'QiOne 2 Pro, Vorderseite mit sichtbarem GitterChip.',
          hint: 'QiOne® 2 Pro — der Gegenstand, um den es geht.',
        }}
      />

      <MmEvidenz
        dataSection="gemessen"
        eyebrow="Abschnitt 1"
        title="Was tatsächlich gemessen wurde"
        intro="Zu den Qi-Blanco-Geräten gibt es fünf veröffentlichte Arbeiten. Vier davon sind In-vitro-Studien: Zellen in einer Laborschale, nicht im Körper. Die fünfte wertet aus, was Anwender von sich aus berichtet haben. Vier Beispiele, so genau, wie die Originale es hergeben — je mit Quelle, Befund und der Stelle, an der die Messung endet:"
        studien={STUDIEN}
        mehrHref="/pages/studien"
        mehrLabel="Die Studien im Überblick"
      />

      <MmBelege
        dataSection="belege"
        variante="flaeche"
        eyebrow="Zum Selbstnachlesen"
        title="Die fünf Arbeiten im Original"
        intro="Alle fünf Publikationen zu den Qi-Blanco-Geräten sind veröffentlicht und liegen als PDF frei zugänglich. Jede Titelseite führt direkt zur Publikation — mit Methode, Zahlen und den Grenzen, die die Autoren selbst benennen."
        belege={BELEGE}
        note="Die Deckblätter sind eigene Montagen aus Journal-Titel und einer Seite der jeweiligen Arbeit — keine Scans der Originalhefte. Die verlinkten PDFs sind die Publikationen selbst."
      />

      <MmProblem
        dataSection="grenzen"
        eyebrow="Abschnitt 2"
        title="Was diese Belege nicht zeigen"
        text="Vier Punkte schränken die fünf Arbeiten ein. Jeder davon ist in den Publikationen nachlesbar:"
        punkte={GRENZEN}
      />

      <ScrollScrubVideo
        dataSection="modell"
        srcDesktop={SCRUB_DESKTOP}
        srcMobile={SCRUB_MOBILE}
        heightVhDesktop={200}
        heightVhMobile={160}
        overlayStart={{
          titel: 'So ist es gedacht',
          text: 'Scroll weiter: der Aufbau im Inneren.',
        }}
        overlayEnd={[
          {
            titel: 'Ein Modell, keine Messung',
            text: 'Wie sich das auf Zellen auswirkt, wurde gemessen. Warum — ist eine offene Frage.',
          },
        ]}
        fussnote="Animation: Aufbau des GitterChip im QiOne® 2 Pro und die modellhafte Ausrichtung benachbarter Wassermoleküle. Eine Darstellung des Erklärmodells, keine Aufnahme eines Versuchs."
      />

      <MmMechanism
        dataSection="leiter"
        variante="flaeche"
        eyebrow="Abschnitt 3"
        title="Wo die Qi-Blanco-Studien auf der Beweisleiter stehen"
        intro="Forschung läuft in Stufen — von der Laborschale bis zur Zusammenfassung mehrerer unabhängiger Studien am Menschen. Die fünf Arbeiten zu den Qi-Blanco-Geräten stehen auf der ersten:"
        schritte={LEITER}
        note="Stufe 1 von 4 ist mehr als nichts — und es ist der früheste Punkt der Kette. Ein Beleg für eine Wirkung bei dir ist sie nicht."
      />

      <MmFaq
        dataSection="zweifel"
        title="Neun Fragen zur Beleglage, einzeln beantwortet"
        items={ZWEIFEL}
      />

      <MmRisk
        dataSection="risiko"
        variante="dunkel"
        ring="20"
        title="Der einzige Beleg, der für dich zählt"
        text="Die fünf Arbeiten sind im Labor entstanden. Der Beleg, der deine Frage wirklich beantwortet, entsteht woanders — bei dir. Deshalb hast du 20 Tage ab Erhalt."
        punkte={[
          'Kein Grund nötig, keine Bedingung, die am Spüren hängt.',
          'Überzeugt es dich nicht, bekommst du dein Geld zurück.',
          'Solange die Belege dort stehen, wo sie stehen, tragen wir das Risiko — nicht du.',
        ]}
      />

      <MmFunnel
        dataSection="weiter"
        title="Wenn du selbst nachsehen willst"
        links={WEITER}
      />
    </MmPage>
  );
}
