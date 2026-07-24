import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {useGoogleRating} from '~/lib/googleRating';
import {
  MmPage,
  MmHero,
  MmProblem,
  MmMechanism,
  MmDiagramChip,
  MmDiagramWasser,
  MmStatBand,
  MmEvidenz,
  MmReports,
  MmTrust,
  MmRisk,
  MmFaq,
  MmFunnel,
  MmPick,
  MmFinal,
  MmGrenzen,
} from '~/components/reusables/MmKit';

/**
 * MmWirMachenIhnAuf — Composer der Flagship-Message-Match-LP „Wir machen ihn auf".
 * Cluster Skeptiker/Mechanismus-Transparenz (Ad qb45-c1). Aufbau der Seite folgt
 * der Ad-Logik: Skepsis ernst nehmen -> Chip physisch öffnen (Aufbau) ->
 * gemessene Zell-Evidenz (präklinisch, ehrlich) -> Erfahrungen (deskriptiv) ->
 * 20-Tage-Selbsttest. Nordstern: WIE es wirkt, nicht DASS es Premium ist.
 */

const STUDIEN = [
  {
    tag: 'In-vitro · Immunzellen',
    titel: 'Schutzeffekt an Immunzellen',
    meta: 'Japan Journal of Medicine · 30. April 2021',
    body: 'Publizierte Untersuchung an kultivierten menschlichen Immunzellen unter Belastung.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705',
  },
  {
    tag: 'In-vitro · Darmzellen',
    titel: 'Schutzeffekt an Darmzellen',
    meta: 'Applied Cell Biology Journal · 2021',
    body: 'Protective effect an kultivierten intestinalen Epithelzellen — Zellkultur, nicht Mensch.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844',
  },
  {
    tag: 'In-vitro · Oxidativer Stress',
    titel: 'QiBracelet gegen oxidativen Stress',
    meta: 'Applied Cell Biology Journal · 12. Januar 2024',
    body: 'Messbarer Schutz kultivierter Zellen unter oxidativem Stress.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505',
  },
  {
    tag: 'Nutzererfahrung',
    titel: 'Forschungsartikel zur Nutzererfahrung',
    meta: 'Advances in Bioengineering & Biomedical Science Research · 10. Mai 2024',
    body: 'Auswertung berichteter Nutzererfahrungen — deskriptiv, ohne Kontrollgruppe.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318',
  },
];

const BADGES = [
  {mark: '✦', titel: '750er Gold', sub: 'im Gitterchip'},
  {mark: '⚑', titel: 'Fertigung in Bayern', sub: 'Deutschland'},
  {mark: '▤', titel: '4 Publikationen', sub: 'präklinisch, als PDF'},
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurück'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '∞', titel: 'Kein Akku', sub: 'passiv, wartungsfrei'},
];

const FAQ = [
  {
    frage: 'Ist das ein Medizinprodukt?',
    antwort:
      'Nein. Der QiOne 2 Pro ist kein Medizinprodukt, und wir machen keine Heilversprechen. Wir zeigen drei prüfbare Ebenen: den physischen Aufbau, publizierte Zellstudien (präklinisch) und ausgewertete Erfahrungsberichte (deskriptiv).',
  },
  {
    frage: 'Muss ich etwas spüren, damit es wirkt?',
    antwort:
      'Nein. Der Effekt, den die Studien beschreiben, ist nicht an eine bewusste Wahrnehmung gekoppelt. Manche Menschen spüren eine Veränderung, andere nicht — beides ist normal. Die Rückgabe hängt an deiner Überzeugung und der Frist, nie am Spüren.',
  },
  {
    frage: 'Was heißt „präklinisch / in-vitro"?',
    antwort:
      'Die Studien wurden an Zellkulturen im Labor durchgeführt, nicht am Menschen. Das ist eine echte, aber begrenzte Evidenzstufe. Wir sagen das bewusst dazu, statt mehr zu behaupten.',
  },
  {
    frage: 'Kann ich die Studien selbst lesen?',
    antwort: 'Ja. Jede der vier Publikationen ist oben direkt als PDF verlinkt — nachlesbar, mit Journal und Datum.',
  },
  {
    frage: 'Was ist, wenn es bei mir nichts bringt?',
    antwort: 'Dann schickst du ihn innerhalb von 20 Tagen zurück und bekommst dein Geld. Genau dafür ist die Frist da.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohärentes Wasser',
    text: 'Der Mechanismus in Ruhe erklärt — von der Gitterstruktur bis zur Zelle.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Die Zellstudien, ehrlich',
    text: 'Alle vier Publikationen mit Methode, Ergebnis und ehrlichen Grenzen.',
    href: '/pages/zellstudien-ehrlich',
    cta: 'Evidenz',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Wie die Rückgabe wirklich abläuft — ohne Kleingedrucktes.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — nah am Körper, unsichtbar', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — sichtbar getragen', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Für den Raum, in dem du schläfst', cta: 'Zum QiHome Air'},
];

export function MmWirMachenIhnAuf({products}) {
  const g = useGoogleRating();
  const badges = BADGES.map((b) =>
    b.sub === 'Google-Bewertung' ? {...b, titel: `${g.komma} / 5`} : b,
  );
  return (
    <MmPage scope="mm-messbar">
      <MmHero
        dataSection="mm-messbar-hero"
        eyebrow="Für Skeptiker — ohne Vorschuss-Vertrauen"
        headline={'„Ist das Einbildung?" Gute Frage. Machen wir ihn auf.'}
        sub="Kein Vertrauen im Voraus nötig. Wir zeigen dir, was physisch im QiOne 2 Pro steckt, was in Zellkulturen gemessen wurde und was Menschen berichten — mit Quellen und mit Grenzen."
        bullets={[
          'Sichtbarer Aufbau: 750er Gold-Gitter, kein Akku, keine App',
          '4 publizierte Zellstudien — als PDF nachlesbar (präklinisch)',
          '20 Tage selbst testen, sonst Geld zurück',
        ]}
        cta={{href: '#mechanismus', label: 'So ist er aufgebaut'}}
        ctaSekundaer={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Direkt zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_04.jpg_1.webp?v=1670947919',
          alt: 'Querschnitt des QiOne 2 Pro mit sichtbarem Gold-Gitterchip',
          hint: 'Querschnitt: das Gold-Gitter im Inneren — nichts Verstecktes.',
        }}
      />

      <MmProblem
        dataSection="mm-messbar-problem"
        eyebrow="Haltung"
        title="Skepsis ist gesund. Wir rechnen mit ihr."
        text={[
          'Die meisten, die den QiOne kaufen, waren erst skeptisch — manche haben ihn ausdrücklich gekauft, um zu beweisen, dass er nichts bringt. Diese Haltung ist uns lieber als blinder Glaube.',
          'Deshalb reden wir nicht über Wunder, sondern über drei prüfbare Ebenen: Aufbau, Messung, Erfahrung. Danach entscheidest du.',
        ]}
        punkte={[
          'Kein Heilversprechen. Der QiOne ist kein Medizinprodukt.',
          'Kein „du musst nur daran glauben". Die Wirkung hängt nicht am Spüren.',
          'Keine versteckten Kosten. 20 Tage Rückgabe, klar geregelt.',
        ]}
      />

      <span id="mechanismus" />
      <MmMechanism
        dataSection="mm-messbar-mechanismus"
        eyebrow="Ebene 1 — Aufbau"
        title="Was physisch im Chip steckt"
        intro="Der QiOne 2 Pro trägt einen strukturierten Gitterchip aus 750er Gold, eingefasst in einen Körper aus Chirurgenstahl. Kein Akku, keine Elektronik, keine App. Die Idee: eine feste, präzise Gitterstruktur, die die Ordnung von Wasser beeinflussen soll — dem Stoff, aus dem dein Körper zu rund zwei Dritteln besteht."
        schritte={[
          {titel: 'Präzises Gold-Gitter', text: 'Ein neues Herstellungsverfahren erzeugt eine definierte Gitterstruktur mit 22,61 mm3 Wirkvolumen. Fest, passiv, über Jahrzehnte stabil.'},
          {titel: 'Kontakt mit Wasser', text: 'Die Struktur soll benachbarte Wassermoleküle in eine geordnetere (kohärentere) Anordnung bringen. Genau diesen Punkt haben die Zellstudien untersucht.'},
          {titel: 'Passiv, immer an', text: 'Du trägst ihn — mehr ist nicht nötig. Keine Ladezyklen, kein Bedienen. Er wirkt, ob du daran denkst oder nicht.'},
          {titel: 'Nachprüfbar statt behauptet', text: 'Wir stellen die Publikationen offen als PDF bereit und benennen die Grenzen: Zellkultur ist keine Studie am Menschen.'},
        ]}
        kinder={
          <>
            <MmDiagramChip caption="Aufbau-Schema: Gold-Gitter im Chirurgenstahl-Körper (vereinfacht)." />
            <MmDiagramWasser caption="Modell: von ungeordneten zu geordneten Wassermolekülen entlang der Gitterstruktur." />
          </>
        }
        note="Ehrliche Grenze: Der beschriebene Mechanismus ist ein Modell. Belegt sind Effekte in Zellkulturen (Ebene 2), nicht ein Heileffekt am Menschen. Die Diagramme sind schematische Darstellungen, keine Messbilder."
      />

      <MmStatBand
        dataSection="mm-messbar-stats"
        stats={[
          {zahl: '22,61 mm³', label: 'Wirkvolumen Gitterchip'},
          {zahl: '750er', label: 'Gold im Gitter'},
          {zahl: '4', label: 'publizierte Zellstudien'},
          {zahl: '0', label: 'Akku · Elektronik · App'},
        ]}
      />

      <MmEvidenz
        dataSection="mm-messbar-evidenz"
        eyebrow="Ebene 2 — Messung"
        title="Was in Zellkulturen gemessen wurde"
        intro="Vier unabhängig publizierte Untersuchungen. Wichtig und ehrlich: Das sind präklinische In-vitro-Studien — an Zellen im Labor, nicht am Menschen. Sie zeigen einen messbaren Schutzeffekt unter Stress, kein Heilversprechen."
        studien={STUDIEN}
        mehrHref="/pages/zellstudien-ehrlich"
        mehrLabel="Die Studien im Detail — mit Grenzen"
      />

      <MmReports
        dataSection="mm-messbar-berichte"
        eyebrow="Ebene 3 — Erfahrung"
        title="Was 171 Menschen berichtet haben"
        text="Wir haben 171 öffentliche Erfahrungsberichte ausgewertet. Das ist deskriptiv — ohne Kontrollgruppe, also kein wissenschaftlicher Beweis. Und ehrlich: Manche berichten gar nichts. Trotzdem zeigt sich ein wiederkehrendes Muster."
        balken={[
          {label: 'Ruhe, Gelassenheit & besserer Schlaf', wert: '~20 %', prozent: '20%'},
          {label: 'mehr Energie & Vitalität', wert: '~17 %', prozent: '17%'},
          {label: 'vermehrte Regeneration', wert: '< 10 %', prozent: '9%'},
          {label: 'mehr Geisteskraft & Klarheit', wert: '< 10 %', prozent: '9%'},
          {label: 'weniger Schmerz & Krankheit', wert: '< 10 %', prozent: '9%'},
          {label: 'weitere positive Beobachtungen', wert: '< 10 %', prozent: '9%'},
        ]}
        note="Quelle: P. C. Dartsch, Advances in Bioengineering & Biomedical Science Research 2024 (N = 171 freiwillige Erfahrungsberichte). Die vier unteren Kategorien nennt die Studie gebündelt als „unter 10 %“. Deshalb der 20-Tage-Test: Statt uns zu glauben, prüfst du es an dir selbst."
      />

      <MmProblem variante="flaeche" dataSection="mm-messbar-reviews-intro" title="Stimmen aus der Praxis" text={`Echte Google-Bewertungen unserer Kundinnen und Kunden — Gesamtschnitt ${g.komma} / 5 aus ${g.total} Bewertungen. Einzelerfahrungen, kein Wirknachweis.`} />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><ReputonWidget /></div></div>

      <MmTrust
        dataSection="mm-messbar-trust"
        eyebrow="Kuratiert — die 6 Signale, die zählen"
        title="Woran du dich festhalten kannst"
        badges={badges}
      />

      <MmRisk
        dataSection="mm-messbar-risk"
        ring="20"
        title="20 Tage. Deine Prüfung, nicht unser Versprechen."
        text={'Trag ihn 20 Tage. Bist du nicht überzeugt, schickst du ihn zurück und bekommst dein Geld — unkompliziert. Die Rückgabe hängt an deiner Überzeugung und der Frist, nicht daran, ob du etwas „spürst".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner nötig', 'Ablauf: melden, zurücksenden, Erstattung']}
      />

      <MmPick dataSection="mm-messbar-pick" title="Ein Chip, drei Möglichkeiten" products={products} handles={PICK} variante="flaeche" />

      <MmFaq dataSection="mm-messbar-faq" title="Ehrliche Antworten auf die häufigsten Zweifel" items={FAQ} />

      <MmFunnel dataSection="mm-messbar-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-messbar-final"
        title="Prüf es an dir selbst — 20 Tage."
        text="Kein Vorschuss-Vertrauen nötig. Aufbau sichtbar, Studien offen, Rückgabe klar."
        cta={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/so-wirkt-kohaerentes-wasser', label: 'Erst den Mechanismus verstehen'}}
      />

      <MmGrenzen dataSection="mm-messbar-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind präklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohärentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
