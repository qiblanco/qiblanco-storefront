import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {useGoogleRating} from '~/lib/googleRating';
import {
  MmPage,
  MmHero,
  MmProblem,
  MmMechanism,
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
 * MmHaeltDasAus — Composer der Message-Match-LP „Hält das mein Leben aus?".
 * Cluster Alltags-Durability (Ad-Welle B, qb45-b3 „Hält das mein Leben aus?
 * Dusche, Sport, Sauna — er bleibt einfach dran"). Aufbau der Seite folgt der
 * Ad-Logik: die Sorge (muss ich ihn abnehmen?) ernst nehmen -> zeigen, warum
 * ihm Wasser/Hitze/Schweiß/Chlor nichts anhaben (passiv, keine Elektronik) ->
 * gemessene Zell-Evidenz (präklinisch, ehrlich) -> 20-Tage-Selbsttest.
 * Nordstern: robust genug für den ganzen Alltag — anlegen und vergessen.
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
  {mark: '⚙', titel: 'Chirurgenstahl', sub: 'korrosionsfester Körper'},
  {mark: '♨', titel: 'Hitze & Chlor', sub: 'beständig'},
  {mark: '∞', titel: 'Kein Akku', sub: 'passiv, wartungsfrei'},
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurück'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '⚑', titel: 'Fertigung in Bayern', sub: 'Deutschland'},
];

const FAQ = [
  {
    frage: 'Kann ich damit wirklich in die Sauna und ins Schwimmbad?',
    antwort: 'Ja. Er ist beständig gegen Hitze und Chlor. Du kannst ihn anbehalten.',
  },
  {
    frage: 'Muss ich ihn zum Duschen oder Sport abnehmen?',
    antwort: 'Nein. Es gibt keine Elektronik und keinen Akku, dem Wasser oder Schweiß schaden könnten.',
  },
  {
    frage: 'Muss ich ihn laden oder pflegen?',
    antwort: 'Nein. Der Chip ist passiv — kein Laden, keine App, kein Pflegeaufwand. Anlegen und vergessen.',
  },
  {
    frage: 'Hält er wirklich Jahrzehnte?',
    antwort:
      'Das Herstellungsverfahren ist auf sehr lange Lebensdauer ausgelegt und bewusst vererbbar gedacht. Verschleißteile gibt es keine.',
  },
  {
    frage: 'Und die gesundheitliche Wirkung?',
    antwort:
      'Dazu gibt es vier publizierte Zellstudien (in-vitro, präklinisch) und deskriptive Erfahrungsberichte. Wir machen kein Heilversprechen — teste selbst in 20 Tagen.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohärentes Wasser',
    text: 'Der Mechanismus in Ruhe erklärt.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Ist das Einbildung? Wir machen ihn auf',
    text: 'Der Chip geöffnet — Aufbau, Messung, Erfahrung.',
    href: '/pages/wir-machen-ihn-auf',
    cta: 'Für Skeptiker',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Wie die Rückgabe wirklich abläuft.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — unsichtbar unter der Kleidung', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — robust am Handgelenk', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Für den Raum daheim', cta: 'Zum QiHome Air'},
];

export function MmHaeltDasAus({products}) {
  const g = useGoogleRating();
  const badges = BADGES.map((b) =>
    b.sub === 'Google-Bewertung' ? {...b, titel: `${g.komma} / 5`} : b,
  );
  return (
    <MmPage scope="mm-alltag">
      <MmHero
        dataSection="mm-alltag-hero"
        eyebrow="Alltag, ehrlich getestet"
        headline={'„Hält das mein Leben aus?" Dusche, Sport, Sauna — er bleibt dran.'}
        sub="Ein Premium-Schmuckstück, das man schont, wäre kein Alltagsbegleiter. Der QiOne 2 Pro ist bewusst so gebaut, dass ihm Wasser, Hitze, Schweiß und Chlor nichts anhaben — weil er passiv ist und keine Elektronik enthält."
        bullets={[
          'Hitze-, Chlor- und schweißbeständig — Sauna und Schwimmbad inklusive',
          'Kein Akku, kein Laden, keine Wartung',
          '20 Tage selbst testen, sonst Geld zurück',
        ]}
        cta={{href: '#mechanismus', label: 'Warum ihm Alltag nichts anhaben kann'}}
        ctaSekundaer={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Direkt zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861',
          alt: 'Frontansicht des QiOne 2 Pro mit dem Gold-Gitter',
          hint: 'Chirurgenstahl-Körper, 750er Gold-Gitter — robust im Alltag.',
        }}
      />

      <MmProblem
        dataSection="mm-alltag-problem"
        eyebrow="Die Sorge"
        title="Muss ich ihn abnehmen, wenn es drauf ankommt?"
        text={[
          'Bei einem teuren Schmuckstück denkt man sofort: bloß nicht beim Duschen, beim Sport, in der Sauna. Genau dann würde man den größten Nutzen verlieren — die Wirkung soll ja durchgehend laufen.',
          'Der QiOne 2 Pro ist deshalb kein empfindliches Schmuckstück, sondern ein robuster Alltagsbegleiter. Du sollst ihn tragen und vergessen können.',
        ]}
        punkte={[
          'Kein Akku, der leer wird.',
          'Keine Elektronik, die Wasser scheut.',
          'Kein Pflegeaufwand — anlegen und vergessen.',
        ]}
      />

      <span id="mechanismus" />
      <MmMechanism
        dataSection="mm-alltag-mechanismus"
        eyebrow="Warum das geht"
        title="Was ihm nichts anhaben kann — und warum"
        intro="Der Grund ist simpel: Was nicht elektronisch ist, kann nicht durch Wasser oder Hitze ausfallen. Der Chip ist eine feste, passive Gitterstruktur aus 750er Gold in einem Körper aus Chirurgenstahl."
        schritte={[
          {titel: 'Dusche & Alltag', text: 'Wasser macht ihm nichts — es gibt keine Batterie und keine Kontakte, die korrodieren könnten.'},
          {titel: 'Sport & Schweiß', text: 'Schweiß ist kein Problem. Chirurgenstahl ist korrosionsbeständig, das Gold-Gitter ohnehin.'},
          {titel: 'Sauna & Schwimmbad', text: 'Beständig gegen Hitze und Chlor. Du kannst ihn anbehalten, wo du ihn sonst abnehmen würdest.'},
          {titel: 'Über Jahrzehnte', text: 'Das Herstellungsverfahren macht ihn extrem langlebig — bewusst vererbbar gedacht, nicht als Wegwerfprodukt.'},
        ]}
        note="Ehrliche Grenze: Robustheit ist eine Materialeigenschaft — sie sagt nichts über eine gesundheitliche Wirkung aus. Was in Zellkulturen gemessen wurde, steht weiter unten (präklinisch)."
      />

      <MmStatBand
        dataSection="mm-alltag-stats"
        stats={[
          {zahl: 'Jahrzehnte', label: 'gedachte Lebensdauer'},
          {zahl: '0', label: 'Ladezyklen · Wartung'},
          {zahl: 'Hitze · Chlor', label: 'beständig'},
          {zahl: '24/7', label: 'tragbar, auch nachts'},
        ]}
      />

      <MmEvidenz
        dataSection="mm-alltag-evidenz"
        eyebrow="Und die Wirkung?"
        title="Was gemessen wurde — kurz und ehrlich"
        intro="Robustheit ist das eine. Die eigentliche Frage ist die Wirkung. Vier publizierte In-vitro-Studien (Zellkultur, nicht Mensch) zeigen einen messbaren Schutzeffekt unter Stress. Kein Heilversprechen."
        studien={STUDIEN}
        mehrHref="/pages/zellstudien-ehrlich"
        mehrLabel="Die Studien im Detail — mit Grenzen"
      />

      <MmProblem variante="flaeche" dataSection="mm-alltag-reviews-intro" title="Stimmen aus der Praxis" text={`Echte Google-Bewertungen unserer Kundinnen und Kunden — Gesamtschnitt ${g.komma} / 5 aus ${g.total} Bewertungen. Einzelerfahrungen, kein Wirknachweis.`} />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><ReputonWidget /></div></div>

      <MmTrust
        dataSection="mm-alltag-trust"
        eyebrow="Kuratiert — die 6 Signale, die zählen"
        title="Woran du dich festhalten kannst"
        badges={badges}
      />

      <MmRisk
        dataSection="mm-alltag-risk"
        ring="20"
        title="20 Tage im echten Alltag testen"
        text={'Trag ihn 20 Tage durch deinen Alltag — Dusche, Sport, Sauna. Bist du nicht überzeugt, schickst du ihn zurück und bekommst dein Geld. Die Rückgabe hängt an deiner Überzeugung und der Frist, nicht am „Spüren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner nötig', 'Ablauf: melden, zurücksenden, Erstattung']}
      />

      <MmPick dataSection="mm-alltag-pick" title="Drei Möglichkeiten für deinen Alltag" products={products} handles={PICK} variante="flaeche" />

      <MmFaq dataSection="mm-alltag-faq" title="Ehrliche Antworten zum Alltag" items={FAQ} />

      <MmFunnel dataSection="mm-alltag-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-alltag-final"
        title="Anlegen. Vergessen. 20 Tage testen."
        text="Robust genug für deinen ganzen Alltag — mit Rückgabe ohne Kleingedrucktes."
        cta={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/das-20-tage-versprechen', label: 'So läuft die Rückgabe'}}
      />

      <MmGrenzen dataSection="mm-alltag-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind präklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohärentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
