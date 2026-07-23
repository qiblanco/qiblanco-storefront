import {GoogleReviews} from '~/components/index-components/GoogleReviews';
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
 * der Ad-Logik: Skepsis ernst nehmen -> Chip physisch oeffnen (Aufbau) ->
 * gemessene Zell-Evidenz (praeklinisch, ehrlich) -> Erfahrungen (deskriptiv) ->
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
  {mark: '▤', titel: '4 Publikationen', sub: 'praeklinisch, als PDF'},
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurueck'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '∞', titel: 'Kein Akku', sub: 'passiv, wartungsfrei'},
];

const FAQ = [
  {
    frage: 'Ist das ein Medizinprodukt?',
    antwort:
      'Nein. Der QiOne 2 Pro ist kein Medizinprodukt, und wir machen keine Heilversprechen. Wir zeigen drei prueffbare Ebenen: den physischen Aufbau, publizierte Zellstudien (praeklinisch) und ausgewertete Erfahrungsberichte (deskriptiv).',
  },
  {
    frage: 'Muss ich etwas spueren, damit es wirkt?',
    antwort:
      'Nein. Der Effekt, den die Studien beschreiben, ist nicht an eine bewusste Wahrnehmung gekoppelt. Manche Menschen spueren eine Veraenderung, andere nicht — beides ist normal. Die Rueckgabe haengt an deiner Ueberzeugung und der Frist, nie am Spueren.',
  },
  {
    frage: 'Was heisst „praeklinisch / in-vitro"?',
    antwort:
      'Die Studien wurden an Zellkulturen im Labor durchgefuehrt, nicht am Menschen. Das ist eine echte, aber begrenzte Evidenzstufe. Wir sagen das bewusst dazu, statt mehr zu behaupten.',
  },
  {
    frage: 'Kann ich die Studien selbst lesen?',
    antwort: 'Ja. Jede der vier Publikationen ist oben direkt als PDF verlinkt — nachlesbar, mit Journal und Datum.',
  },
  {
    frage: 'Was ist, wenn es bei mir nichts bringt?',
    antwort: 'Dann schickst du ihn innerhalb von 20 Tagen zurueck und bekommst dein Geld. Genau dafuer ist die Frist da.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohaerentes Wasser',
    text: 'Der Mechanismus in Ruhe erklaert — von der Gitterstruktur bis zur Zelle.',
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
    text: 'Wie die Rueckgabe wirklich ablaeuft — ohne Kleingedrucktes.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — nah am Koerper, unsichtbar', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — sichtbar getragen', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Fuer den Raum, in dem du schlaefst', cta: 'Zum QiHome Air'},
];

export function MmWirMachenIhnAuf({products}) {
  return (
    <MmPage scope="mm-messbar">
      <MmHero
        dataSection="mm-messbar-hero"
        eyebrow="Fuer Skeptiker — ohne Vorschuss-Vertrauen"
        headline={'„Ist das Einbildung?" Gute Frage. Machen wir ihn auf.'}
        sub="Kein Vertrauen im Voraus noetig. Wir zeigen dir, was physisch im QiOne 2 Pro steckt, was in Zellkulturen gemessen wurde und was Menschen berichten — mit Quellen und mit Grenzen."
        bullets={[
          'Sichtbarer Aufbau: 750er Gold-Gitter, kein Akku, keine App',
          '4 publizierte Zellstudien — als PDF nachlesbar (praeklinisch)',
          '20 Tage selbst testen, sonst Geld zurueck',
        ]}
        cta={{href: '#mechanismus', label: 'So ist er aufgebaut'}}
        ctaSekundaer={{href: '/products/qione-2-pro', label: 'Direkt zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861',
          alt: 'Querschnitt des QiOne 2 Pro mit sichtbarem Gold-Gitterchip',
          hint: 'Querschnitt: das Gold-Gitter im Inneren — nichts Verstecktes.',
        }}
      />

      <MmProblem
        dataSection="mm-messbar-problem"
        eyebrow="Haltung"
        title="Skepsis ist gesund. Wir rechnen mit ihr."
        text={[
          'Die meisten, die den QiOne kaufen, waren erst skeptisch — manche haben ihn ausdruecklich gekauft, um zu beweisen, dass er nichts bringt. Diese Haltung ist uns lieber als blinder Glaube.',
          'Deshalb reden wir nicht ueber Wunder, sondern ueber drei prueffbare Ebenen: Aufbau, Messung, Erfahrung. Danach entscheidest du.',
        ]}
        punkte={[
          'Kein Heilversprechen. Der QiOne ist kein Medizinprodukt.',
          'Kein „du musst nur daran glauben". Die Wirkung haengt nicht am Spueren.',
          'Keine versteckten Kosten. 20 Tage Rueckgabe, klar geregelt.',
        ]}
      />

      <span id="mechanismus" />
      <MmMechanism
        dataSection="mm-messbar-mechanismus"
        eyebrow="Ebene 1 — Aufbau"
        title="Was physisch im Chip steckt"
        intro="Der QiOne 2 Pro traegt einen strukturierten Gitterchip aus 750er Gold, eingefasst in einen Koerper aus Chirurgenstahl. Kein Akku, keine Elektronik, keine App. Die Idee: eine feste, praezise Gitterstruktur, die die Ordnung von Wasser beeinflussen soll — dem Stoff, aus dem dein Koerper zu rund zwei Dritteln besteht."
        schritte={[
          {titel: 'Praezises Gold-Gitter', text: 'Ein neues Herstellungsverfahren erzeugt eine definierte Gitterstruktur mit 22,61 mm3 Wirkvolumen. Fest, passiv, ueber Jahrzehnte stabil.'},
          {titel: 'Kontakt mit Wasser', text: 'Die Struktur soll benachbarte Wassermolekuele in eine geordnetere (kohaerentere) Anordnung bringen. Genau diesen Punkt haben die Zellstudien untersucht.'},
          {titel: 'Passiv, immer an', text: 'Du traegst ihn — mehr ist nicht noetig. Keine Ladezyklen, kein Bedienen. Er wirkt, ob du daran denkst oder nicht.'},
          {titel: 'Nachprueffbar statt behauptet', text: 'Wir stellen die Publikationen offen als PDF bereit und benennen die Grenzen: Zellkultur ist keine Studie am Menschen.'},
        ]}
        kinder={
          <>
            <MmDiagramChip caption="Aufbau-Schema: Gold-Gitter im Chirurgenstahl-Koerper (vereinfacht)." />
            <MmDiagramWasser caption="Modell: von ungeordneten zu geordneten Wassermolekuelen entlang der Gitterstruktur." />
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
        intro="Vier unabhaengig publizierte Untersuchungen. Wichtig und ehrlich: Das sind praeklinische In-vitro-Studien — an Zellen im Labor, nicht am Menschen. Sie zeigen einen messbaren Schutzeffekt unter Stress, kein Heilversprechen."
        studien={STUDIEN}
        mehrHref="/pages/zellstudien-ehrlich"
        mehrLabel="Die Studien im Detail — mit Grenzen"
      />

      <MmReports
        dataSection="mm-messbar-berichte"
        eyebrow="Ebene 3 — Erfahrung"
        title="Was 171 Menschen berichtet haben"
        text="Wir haben 171 oeffentliche Erfahrungsberichte ausgewertet. Das ist deskriptiv — ohne Kontrollgruppe, also kein wissenschaftlicher Beweis. Und ehrlich: Manche berichten gar nichts. Trotzdem zeigt sich ein wiederkehrendes Muster."
        balken={[
          {label: 'ruhiger / besserer Schlaf', wert: '~20 %', prozent: '20%'},
          {label: 'mehr Energie / Klarheit', wert: '~17 %', prozent: '17%'},
        ]}
        note="Deshalb der 20-Tage-Test: Statt uns zu glauben, prueffst du es an dir selbst."
      />

      <MmProblem variante="flaeche" dataSection="mm-messbar-reviews-intro" title="Stimmen aus der Praxis" text="Drei von tausenden Google-Bewertungen (Durchschnitt 4,8 / 5). Einzelerfahrungen, kein Wirknachweis." />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><GoogleReviews dataSection="mm-messbar-reviews" /></div></div>

      <MmTrust
        dataSection="mm-messbar-trust"
        eyebrow="Kuratiert — die 6 Signale, die zaehlen"
        title="Woran du dich festhalten kannst"
        badges={BADGES}
      />

      <MmRisk
        dataSection="mm-messbar-risk"
        ring="20"
        title="20 Tage. Deine Pruefung, nicht unser Versprechen."
        text={'Trag ihn 20 Tage. Bist du nicht ueberzeugt, schickst du ihn zurueck und bekommst dein Geld — unkompliziert. Die Rueckgabe haengt an deiner Ueberzeugung und der Frist, nicht daran, ob du etwas „spuerst".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner noetig', 'Ablauf: melden, zuruecksenden, Erstattung']}
      />

      <MmPick dataSection="mm-messbar-pick" title="Ein Chip, drei Trageformen" products={products} handles={PICK} variante="flaeche" />

      <MmFaq dataSection="mm-messbar-faq" title="Ehrliche Antworten auf die haeufigsten Zweifel" items={FAQ} />

      <MmFunnel dataSection="mm-messbar-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-messbar-final"
        title="Pruef es an dir selbst — 20 Tage."
        text="Kein Vorschuss-Vertrauen noetig. Aufbau sichtbar, Studien offen, Rueckgabe klar."
        cta={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/so-wirkt-kohaerentes-wasser', label: 'Erst den Mechanismus verstehen'}}
      />

      <MmGrenzen dataSection="mm-messbar-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind praeklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohaerentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
