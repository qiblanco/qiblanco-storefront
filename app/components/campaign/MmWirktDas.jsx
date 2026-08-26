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
 * EVIDENZfrage, keine Reputationsfrage. Sie nennt die schwächsten Stellen
 * unserer eigenen Belege zuerst — ein Autor, ein Labor, von uns bezahlt, keine
 * unabhängige Wiederholung. Deshalb hat sie KEINEN Kauf-CTA: ihr Ausgang ist
 * „selbst prüfen", nicht „jetzt kaufen". MmPick/MmFinal sind hier verboten.
 *
 * INHALTSGRENZE (übernommen aus dem freigegebenen Chatbot,
 * qi-salesbot/src/server/chat-skills.ts, Skills `studies_claims` Prio 910 und
 * `skepticism` Prio 920): wörtlich „in vitro", ausdrücklich kein klinischer
 * Wirknachweis am Menschen, genau EIN Sachargument je Zweifel, kein
 * Verteidigungsblock. Die Seite darf nicht mehr behaupten als der Chatbot.
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

const STUDIEN = [
  {
    tag: 'In vitro · 2021',
    titel: 'Immunzellen',
    meta: 'Japan Journal of Medicine · humane Immunzellen (HL-60), drei unabhängige Experimente',
    body: (
      <>
        Menschliche Immunzellen wurden vier Stunden lang Mobilfunkstrahlung
        ausgesetzt (SAR 0,76 W/kg). Ihre Fähigkeit, Abwehr-Radikale zu bilden,
        sank auf 60,5 ± 3,9 % der unbestrahlten Kontrolle. Lag ein QiOne® 2 Pro
        daneben, blieben 84,7 ± 7,0 % erhalten (p ≤ 0,01).
        <em>
          Gemessen in vitro, an einer Zelllinie, in drei unabhängigen
          Experimenten.
        </em>
      </>
    ),
    href: PDF.e0001,
  },
  {
    tag: 'In vitro · 2021',
    titel: 'Darmbarriere',
    meta: 'Applied Cell Biology · kultivierte Darmzellen (IPEC-J2, Schwein)',
    body: (
      <>
        Kultivierte Darmzellen unter derselben Belastung. Der elektrische
        Widerstand der Zellbarriere brach ungeschützt auf etwa ein Zehntel ein.
        Geschützt lag er bei 1.837 ± 349 Ω/cm² — gegenüber 2.542 ± 389 Ω/cm² bei
        völlig unbestrahlten Zellen.
        <em>
          Der Abstand zur unbestrahlten Kontrolle blieb bestehen. Der Schutz war
          also nicht vollständig — und die Zellen stammten vom Schwein, nicht
          vom Menschen.
        </em>
      </>
    ),
    href: PDF.e0002,
  },
  {
    tag: 'In vitro · 2024',
    titel: 'Oxidativer Stress',
    meta: 'Applied Cell Biology · fünf Zelltypen, Stressor Wasserstoffperoxid',
    body: (
      <>
        Fünf Zelltypen wurden mit Wasserstoffperoxid gestresst, mit und ohne
        QiBracelet®. Alle fünf überlebten in Gegenwart des Armbands besser — aber
        sehr unterschiedlich stark: von +47,3 ± 7,1 % bei Leberzellen bis
        +3,9 ± 2,8 % bei Lungenzellen.
        <em>
          Bei Lungenzellen ist der Effekt damit marginal. Und der Stressor war
          eine Chemikalie, nicht Strahlung.
        </em>
      </>
    ),
    href: PDF.e0003,
  },
  {
    tag: 'Auswertung · 2024',
    titel: 'Was Anwender berichten',
    meta: 'Advances in Bioengineering & Biomedical Science Research · 171 freiwillige Berichte',
    body: (
      <>
        171 Menschen haben ihre Erfahrung von sich aus öffentlich geteilt. Am
        häufigsten: mehr Ruhe und tieferer Schlaf (je rund 20 %), mehr Energie
        (rund 17 %).
        <em>
          Das ist die methodisch schwächste unserer Arbeiten: keine
          Kontrollgruppe, keine Verblindung, kein Fragebogen. Es zeigt, was
          Menschen berichtet haben — nicht, was das Gerät bewirkt hat.
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
    fünf Arbeiten sind Zellkultur, die fünfte ist eine Sammlung von
    Erfahrungsberichten. Was im Labor an Zellen messbar ist, muss im Körper
    nicht passieren. Ein klinischer Wirknachweis am Menschen liegt nicht vor.
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
    Bis dahin ist das ein offener Punkt, und zwar unserer.
  </>,
  <>
    <strong>4. Die Erklärung dahinter ist eine Hypothese.</strong> Das Modell,
    mit dem die Publikationen den Effekt erklären — geordnetes, „kohärentes“
    Wasser — ist in der konventionellen Wissenschaft nicht etabliert. Die
    Arbeiten selbst kennzeichnen es als Hypothese. Das ist weniger schlimm, als
    es klingt, und wichtiger, als es aussieht: Die Messwerte hängen nicht von
    der Erklärung ab. Was in den Zellschalen passiert ist, ist gemessen worden —
    warum es passiert ist, ist offen. Beides auseinanderzuhalten ist der
    ehrlichste Umgang mit dieser Datenlage.{' '}
    {/* Zeigte bis 2026-08-26 auf /pages/so-wirkt-kohaerentes-wasser. Das ist
        eine noindex-Seite des Landing-Bereichs und laut ihrem eigenen
        Docstring eine „Freigabe-Ansicht für Christian, NICHT öffentlich
        indexiert" — diese Seite hier ist das Gegenteil: öffentlich und
        ausdrücklich zum Gefundenwerden gebaut. /pages/technologie trägt
        dasselbe Thema öffentlich (Beschreibung wörtlich: „kohärentes Wasser,
        Frequenzkommunikation und das Leiternetzwerk des Körpers"). */}
    <a href="/pages/technologie">Wie das Modell gedacht ist</a>
  </>,
];

const LEITER = [
  {
    titel: 'Zellkultur (in vitro)',
    text: 'Hier stehen wir. Ein realer Schritt — der Punkt, an dem jede Forschung anfängt. Und der früheste.',
  },
  {
    titel: 'Tierversuch',
    text: 'Zeigt, ob ein Effekt auch in einem lebenden Organismus auftritt. Für unsere Geräte liegt dazu nichts vor.',
  },
  {
    titel: 'Studie am Menschen',
    text: 'Kontrolliert, verblindet, mit Vergleichsgruppe. Erst hier entsteht eine Aussage über Wirkung bei Ihnen.',
  },
  {
    titel: 'Meta-Analyse',
    text: 'Fasst mehrere unabhängige Studien am Menschen zusammen. Die belastbarste Stufe.',
  },
];

const ZWEIFEL = [
  {
    frage: 'Sind das Studien an Menschen?',
    antwort:
      'Nein. Vier sind In-vitro-Studien an Zellkulturen, eine wertet freiwillige Erfahrungsberichte aus. Eine randomisierte Studie am Menschen gibt es nicht.',
  },
  {
    frage: 'Wer hat die Studien gemacht — und wer hat sie bezahlt?',
    antwort:
      'Prof. Dr. Peter C. Dartsch, Dartsch Scientific Institut. Bezahlt haben wir sie, und wir haben die Geräte gestellt. Das steht auch in den Publikationen.',
  },
  {
    frage: 'Gibt es eine unabhängige Wiederholung?',
    antwort:
      'Nein. Das ist die größte offene Stelle unserer Datenlage, und sie liegt bei uns.',
  },
  {
    frage: 'Ist der Wirkmechanismus wissenschaftlich anerkannt?',
    antwort:
      'Nein. Er ist in den Publikationen als Hypothese gekennzeichnet. Die Messergebnisse hängen nicht von ihm ab — gemessen wurde, was in den Zellen passiert ist, nicht warum.',
  },
  {
    frage: 'Heißt „im Labor gemessen“, dass ich etwas merken werde?',
    antwort:
      'Nein, und das ist wichtig: Aus einem Zelleffekt folgt keine Aussage darüber, wie es Ihnen damit geht. Was Menschen berichten, steht weiter oben — als das, was es ist: Berichte.',
  },
  {
    frage: 'Warum steht überall „in vitro“?',
    antwort:
      'Weil es der ehrliche Ausdruck für „in der Laborschale“ ist. Wir schreiben ihn hin, statt „wissenschaftlich bestätigt“ zu sagen — das wäre auf dieser Evidenzstufe zu viel.',
  },
  {
    frage: 'Was wäre der nächste echte Schritt?',
    antwort:
      'Eine kontrollierte Studie am Menschen, und eine Wiederholung der Zellversuche durch ein Labor, das nicht von uns bezahlt wird. Beides steht aus.',
  },
  {
    frage: 'Kann ich die Originale selbst lesen?',
    antwort: (
      <>
        Ja. Alle fünf liegen als PDF offen — mit Methode, Zahlen und den Grenzen,
        die die Autoren selbst benennen.{' '}
        <a href="/pages/studien">Zu den Studien</a>
      </>
    ),
  },
  {
    frage: 'Und wenn mich das alles nicht überzeugt?',
    antwort:
      'Dann ist das eine vernünftige Reaktion auf diese Evidenzstufe. Sie müssen uns nichts glauben — Sie können es 20 Tage lang an sich selbst prüfen und ohne Angabe von Gründen zurückgeben.',
  },
];

/*
 * JEDES ZIEL HIER MUSS ÖFFENTLICH SEIN — diese Seite ist indexierbar und
 * bekommt organischen Verkehr. Drei der ursprünglich vier Karten zeigten in
 * den noindex-Landing-Bereich (/pages/das-20-tage-versprechen,
 * /pages/zellstudien-ehrlich, /pages/so-wirkt-kohaerentes-wasser). Diese
 * Fläche trägt ihre Aussagekraft aus genau einer Bedingung: dorthin führt
 * kein öffentlicher Link, deshalb IST Bewegung dort Ads-Verkehr. Ein Link
 * kostet nicht die verlinkte Seite, sondern die Zahlen der ganzen Fläche —
 * live gemessen am 2026-08-26, drei von damals 17 Verweisen.
 *
 * ZWEI KARTEN SIND DESHALB WEGGEFALLEN, und beide waren mit dem eigenen
 * Seiteninhalt ohnehin doppelt:
 *   „So funktionieren die 20 Tage" — die Zusage steht wörtlich im FAQ dieser
 *       Seite („20 Tage lang an sich selbst prüfen und ohne Angabe von
 *       Gründen zurückgeben").
 *   „Jede Studie mit ihrer Grenze" — die Einschränkungen stehen als eigener
 *       Abschnitt („Vier Dinge, die dagegen sprechen") auf dieser Seite.
 * Die dritte ist umgebogen auf die öffentliche Themenseite. Der Ausgang der
 * Seite bleibt damit „selbst prüfen", nur ohne Tür in den Paid-Funnel.
 */
const WEITER = [
  {
    titel: 'Die fünf Studien im Original',
    text: 'Jede Publikation mit Eckdaten, Zahlen und PDF zum Nachlesen.',
    href: '/pages/studien',
    cta: 'Zu den Studien',
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
            Häufiger als jede Frage nach Größe, Preis oder Versand. Sie verdient
            keine Broschüre, sondern eine Antwort.{' '}
            <strong>
              Die kurze Fassung: Ja, es ist etwas gemessen worden — im Labor, an
              Zellkulturen. Nein, es gibt keinen Nachweis am Menschen.
            </strong>{' '}
            Alles Weitere auf dieser Seite ist die lange Fassung davon, mit
            Zahlen und mit den Stellen, an denen unsere Belege schwach sind.
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
        intro="Es gibt fünf veröffentlichte Arbeiten zu unseren Geräten. Vier davon sind In-vitro-Studien: Zellen in einer Laborschale, nicht im Körper. Die fünfte wertet aus, was Anwender von sich aus berichtet haben. Vier Beispiele, so genau, wie die Originale es hergeben:"
        studien={STUDIEN}
        mehrHref="/pages/studien"
        mehrLabel="Die Studien im Überblick"
      />

      <MmBelege
        dataSection="belege"
        variante="flaeche"
        eyebrow="Zum Selbstnachlesen"
        title="Die fünf Arbeiten im Original"
        intro="Alle fünf sind veröffentlicht und liegen als PDF frei zugänglich. Jede Titelseite führt direkt zur Publikation — mit Methode, Zahlen und den Grenzen, die die Autoren selbst benennen."
        belege={BELEGE}
        note="Die Deckblätter sind eigene Montagen aus Journal-Titel und einer Seite der jeweiligen Arbeit — keine Scans der Originalhefte. Die verlinkten PDFs sind die Publikationen selbst."
      />

      <MmProblem
        dataSection="grenzen"
        eyebrow="Abschnitt 2"
        title="Und was wir nicht wissen"
        text="Diese Seite wäre wertlos, wenn sie hier aufhörte. Also die andere Hälfte — vier Punkte, die jeder findet, der genau hinsieht. Wir nennen sie lieber selbst:"
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
          text: 'Scrollen Sie: der Aufbau im Inneren.',
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
        title="Wo das auf der Beweisleiter steht"
        intro="Forschung läuft in Stufen. Es hilft zu wissen, auf welcher wir stehen — von der Laborschale bis zur Zusammenfassung mehrerer unabhängiger Studien am Menschen."
        schritte={LEITER}
        note="Wir stehen auf der ersten Stufe. Das ist mehr als nichts — und es ist der früheste Punkt der Kette. Niemand sollte ihn als Beleg für eine Wirkung an Ihnen lesen."
      />

      <MmFaq
        dataSection="zweifel"
        title="Was Sie sich jetzt vermutlich fragen"
        items={ZWEIFEL}
      />

      <MmRisk
        dataSection="risiko"
        variante="dunkel"
        ring="20"
        title="Der einzige Beleg, der für Sie zählt"
        text="Alles auf dieser Seite ist im Labor entstanden. Der einzige Beleg, der Ihre Frage wirklich beantwortet, entsteht woanders — bei Ihnen. Deshalb haben Sie 20 Tage ab Erhalt."
        punkte={[
          'Kein Grund nötig, keine Bedingung, die am Spüren hängt.',
          'Überzeugt es Sie nicht, bekommen Sie Ihr Geld zurück.',
          'Solange die Belege dort stehen, wo sie stehen, tragen wir das Risiko — nicht Sie.',
        ]}
      />

      <MmFunnel
        dataSection="weiter"
        title="Wenn Sie selbst nachsehen wollen"
        links={WEITER}
      />
    </MmPage>
  );
}
