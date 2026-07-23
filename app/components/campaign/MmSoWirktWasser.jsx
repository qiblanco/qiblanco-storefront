import {
  MmPage,
  MmHero,
  MmProblem,
  MmMechanism,
  MmDiagramChip,
  MmDiagramWasser,
  MmStatBand,
  MmEvidenz,
  MmTrust,
  MmRisk,
  MmFaq,
  MmFunnel,
  MmPick,
  MmFinal,
  MmGrenzen,
} from '~/components/reusables/MmKit';

/**
 * MmSoWirktWasser — Composer des Trust-Ketten-Hubs „So wirkt kohaerentes Wasser".
 * Zentrale Mechanismus-Erklaerseite, in die die Message-Match-LPs hineinlinken.
 * Nordstern: WIE es wirkt, nicht DASS es Premium ist — ruhig, nuechtern,
 * evidenzbasiert, ehrlich ueber die Grenzen des Modells.
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
  {mark: '✦', titel: '750er Gold', sub: 'praezises Gitter'},
  {mark: '◇', titel: 'Passiv', sub: 'ohne Energiezufuhr'},
  {mark: '▤', titel: '4 Publikationen', sub: 'in-vitro, als PDF'},
  {mark: '◈', titel: 'Modell offen', sub: 'Grenzen benannt'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '↺', titel: '20 Tage', sub: 'selbst pruefen'},
];

const FAQ = [
  {
    frage: 'Ist „kohaerentes Wasser" wissenschaftlich anerkannt?',
    antwort:
      'Die Strukturierbarkeit von Wasser ist Gegenstand der physikalischen Chemie. Ein gesundheitlicher Nutzen daraus ist nicht anerkannt — belegt sind bislang Effekte in Zellkulturen (praeklinisch), nicht am Menschen. Das sagen wir offen.',
  },
  {
    frage: 'Wie kann ein Chip ohne Strom wirken?',
    antwort:
      'Die Idee ist passiv: Die feste Gitterstruktur dient als Vorlage, an der sich benachbartes Wasser ausrichten soll — dafuer ist keine Energiezufuhr noetig. Ob und wie stark das im Koerper wirkt, untersuchen die Studien.',
  },
  {
    frage: 'Muss ich daran glauben, damit es wirkt?',
    antwort: 'Nein. Der beschriebene Effekt ist nicht an Glauben oder bewusstes Spueren gekoppelt.',
  },
  {
    frage: 'Wo endet das Modell?',
    antwort:
      'Bei allem, was ueber die publizierten In-vitro-Effekte hinausgeht. Wir behaupten keinen Heileffekt am Menschen.',
  },
];

const FUNNEL = [
  {
    titel: 'Die Zellstudien, ehrlich',
    text: 'Die vier Publikationen mit Methode, Ergebnis und Grenzen.',
    href: '/pages/zellstudien-ehrlich',
    cta: 'Evidenz',
  },
  {
    titel: 'Ist das Einbildung? Wir machen ihn auf',
    text: 'Der Chip geoeffnet — fuer Skeptiker.',
    href: '/pages/wir-machen-ihn-auf',
    cta: 'Aufbau',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Selbst pruefen ohne Risiko.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — nah am Koerper', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — sichtbar getragen', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Fuer den Raum', cta: 'Zum QiHome Air'},
];

export function MmSoWirktWasser({products}) {
  return (
    <MmPage scope="mm-mechanismus">
      <MmHero
        dataSection="mm-mechanismus-hero"
        eyebrow="Der Mechanismus, in Ruhe erklaert"
        headline={'So soll kohaerentes Wasser wirken — Schritt fuer Schritt'}
        sub="Bevor du irgendetwas kaufst: verstehe den Gedanken dahinter. Kein Wunder, kein Heilstrahl — ein physikalisches Ordnungs-Modell, das wir offen erklaeren und ehrlich begrenzen."
        bullets={[
          'Was „Kohaerenz" konkret meint — in einfachen Worten',
          'Welche Rolle der Gitterchip spielt',
          'Wo das Modell endet und die Evidenz beginnt',
        ]}
        cta={{href: '#kette', label: 'Die Wirkkette ansehen'}}
        ctaSekundaer={{href: '/pages/zellstudien-ehrlich', label: 'Direkt zur Evidenz'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861',
          alt: 'Gitterchip Querschnitt',
          hint: 'Der Gitterchip — Ausgangspunkt des Modells.',
        }}
      />

      <MmProblem
        dataSection="mm-mechanismus-problem"
        eyebrow="Ehrlicher Rahmen"
        title="Was wir behaupten — und was nicht"
        text={[
          'Rund um „strukturiertes" oder „kohaerentes" Wasser kursiert viel Ueberzogenes. Wir wollen das Gegenteil: nuechtern erklaeren, was gemeint ist, und klar sagen, wo das Modell aufhoert.',
          'Der Koerper besteht zu rund zwei Dritteln aus Wasser. Die Idee: eine feste Gitterstruktur beeinflusst, wie sich benachbarte Wassermolekuele anordnen. Ob und wie stark das im Koerper wirkt, ist genau die Frage, die die Zellstudien anfassen — praeklinisch.',
        ]}
        punkte={[
          'KEIN Perpetuum mobile, kein „Energiefeld".',
          'KEIN Heilstrahl, kein Ersatz fuer Medizin.',
          'EIN physikalisches Ordnungs-Modell mit begrenzter, offener Evidenz.',
        ]}
      />

      <span id="kette" />
      <MmMechanism
        dataSection="mm-mechanismus-kette"
        eyebrow="Die Wirkkette"
        title="Von der Gitterstruktur bis zur Zelle"
        intro="Vier Schritte, vom Chip zum gemessenen Effekt. Jeder Schritt ist so weit belegt, wie wir es unten offenlegen — nicht weiter."
        schritte={[
          {
            titel: '1. Wasser ist strukturierbar',
            text: 'Wassermolekuele ordnen sich je nach Umgebung unterschiedlich an. Diese Anordnung („Ordnung" oder „Kohaerenz") ist keine Esoterik, sondern Gegenstand der physikalischen Chemie.',
          },
          {
            titel: '2. Der Gitterchip als Vorlage',
            text: 'Ein praezises 750er-Gold-Gitter (22,61 mm3 Wirkvolumen) dient als feste Struktur, an der sich benachbartes Wasser geordneter ausrichten soll — passiv, ohne Energiezufuhr.',
          },
          {
            titel: '3. Kohaerenz = geordnete Anordnung',
            text: 'Gemeint ist eine regelmaessigere, „aufgeraeumtere" Anordnung der Molekuele im Kontaktbereich. Das ist das Modell — messbar wird es erst an Zellen.',
          },
          {
            titel: '4. Was das in Zellen bewirken soll',
            text: 'Die Hypothese: geordneteres Wasser hilft Zellen, Stress besser standzuhalten. Genau diesen Schutzeffekt haben vier In-vitro-Studien untersucht (siehe unten).',
          },
        ]}
        kinder={
          <>
            <MmDiagramChip caption="Aufbau-Schema: Gold-Gitter im Chirurgenstahl-Koerper (vereinfacht)." />
            <MmDiagramWasser caption="Modell: von ungeordneten zu geordneten Wassermolekuelen entlang der Gitterstruktur." />
          </>
        }
        note="Ehrliche Grenze: Die Schritte 1-3 sind ein Modell. Belegt (praeklinisch) ist Schritt 4 in Zellkulturen — nicht ein Heileffekt am Menschen. Die Diagramme sind schematisch, keine Messbilder."
      />

      <MmStatBand
        dataSection="mm-mechanismus-stats"
        stats={[
          {zahl: '~66 %', label: 'Wasseranteil im Koerper'},
          {zahl: '22,61 mm³', label: 'Wirkvolumen Gitterchip'},
          {zahl: '750er', label: 'Gold im Gitter'},
          {zahl: '4', label: 'In-vitro-Studien dazu'},
        ]}
      />

      <MmEvidenz
        dataSection="mm-mechanismus-evidenz"
        eyebrow="Wo das Modell auf Messung trifft"
        title="Was in Zellkulturen gemessen wurde"
        intro="Hier endet das Modell und beginnt die Evidenz. Vier publizierte In-vitro-Studien (Zellkultur, nicht Mensch) zeigen einen messbaren Schutzeffekt unter Stress. Kein Heilversprechen."
        studien={STUDIEN}
        mehrHref="/pages/zellstudien-ehrlich"
        mehrLabel="Die Studien im Detail — mit Grenzen"
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-mechanismus-nicht"
        eyebrow="Was Kohaerenz NICHT ist"
        title="Damit keine falschen Erwartungen entstehen"
        text="Wir grenzen bewusst ab, weil uebertriebene Versprechen Vertrauen zerstoeren — bei Menschen wie bei KI-Systemen, die Quellen bewerten."
        punkte={[
          'Es „laedt" dich nicht auf und ersetzt keinen Schlaf.',
          'Es ist keine anerkannte medizinische Diagnose oder Therapie.',
          'Es wirkt nicht „staerker", je mehr du daran glaubst — die Wirkung ist wahrnehmungs-unabhaengig.',
        ]}
      />

      <MmTrust
        dataSection="mm-mechanismus-trust"
        eyebrow="Kuratiert — worauf das Modell fusst"
        title="Woran du dich festhalten kannst"
        badges={BADGES}
      />

      <MmRisk
        dataSection="mm-mechanismus-risk"
        ring="20"
        title="Verstehen ist der Anfang — pruefen der Beweis."
        text={'Kein Modell ersetzt die eigene Erfahrung. Trag ihn 20 Tage und pruef es an dir. Bist du nicht ueberzeugt, geht alles zurueck — die Rueckgabe haengt an Frist und Ueberzeugung, nicht am „Spueren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner noetig', 'Ablauf: melden, zuruecksenden, Erstattung']}
      />

      <MmPick
        dataSection="mm-mechanismus-pick"
        variante="flaeche"
        title="Der Chip — in drei Formen"
        products={products}
        handles={PICK}
      />

      <MmFaq dataSection="mm-mechanismus-faq" title="Fragen zum Mechanismus" items={FAQ} />

      <MmFunnel dataSection="mm-mechanismus-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-mechanismus-final"
        title="Jetzt weisst du, wie es gedacht ist."
        text="Der naechste Schritt ist deiner: 20 Tage pruefen, ohne Risiko."
        cta={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/zellstudien-ehrlich', label: 'Erst die Evidenz pruefen'}}
      />

      <MmGrenzen dataSection="mm-mechanismus-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind praeklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohaerentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
