import {GoogleReviews} from '~/components/index-components/GoogleReviews';
import {
  MmPage,
  MmHero,
  MmProblem,
  MmMechanism,
  MmStatBand,
  MmTrust,
  MmRisk,
  MmFaq,
  MmFunnel,
  MmPick,
  MmFinal,
  MmGrenzen,
} from '~/components/reusables/MmKit';

/**
 * MmKetteOderArmband — Composer der Message-Match-LP „Kette oder Armband?".
 * Cluster Produktwahl/Kaufentscheidung (Ad qb45-c2). Positionierung (Spuer-Regel
 * #7): die Wahl ist Sichtbarkeit/Lifestyle, NICHT „willst du es spueren". Beide
 * tragen denselben 750er-Gold-Gitterchip — der EINZIGE Unterschied ist die
 * Trageweise. Die Wirkung unterscheidet sich nicht und haengt an nichts, was man
 * fuehlt.
 */

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — unsichtbar, nah am Koerper', cta: 'QiOne 2 Pro waehlen'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — sichtbar am Handgelenk', cta: 'QiBracelet waehlen'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Ergaenzung fuer deinen Raum', cta: 'QiHome Air ansehen'},
];

const BADGES = [
  {mark: '✦', titel: '750er Gold', sub: 'gleicher Gitterchip'},
  {mark: '∞', titel: 'Kein Akku', sub: 'passiv, wartungsfrei'},
  {mark: '♨', titel: 'Alltagsfest', sub: 'Hitze, Chlor, Schweiss'},
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurueck'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '▤', titel: '4 Studien', sub: 'praeklinisch, als PDF'},
];

const FAQ = [
  {
    frage: 'Wirkt die Kette staerker als das Armband?',
    antwort:
      'Nein. Beide enthalten denselben 750er-Gold-Gitterchip mit identischer Technik. Es gibt keinen Unterschied in der Wirkung — nur in der Trageweise.',
  },
  {
    frage: 'Wann ist die Kette die bessere Wahl?',
    antwort:
      'Wenn du ihn diskret und unsichtbar unter der Kleidung tragen moechtest, durchgehend, ohne dass man ihn sieht.',
  },
  {
    frage: 'Wann ist das Armband die bessere Wahl?',
    antwort: 'Wenn du ihn offen am Handgelenk tragen und sichtbar haben moechtest.',
  },
  {
    frage: 'Kann ich beide gleichzeitig tragen?',
    antwort:
      'Ja, das ist moeglich. Notwendig ist es nicht — ein Chip genuegt fuer die beschriebene Wirkung.',
  },
  {
    frage: 'Was, wenn ich mich falsch entscheide?',
    antwort: 'Dann tauschst oder erstattest du innerhalb von 20 Tagen. Dafuer ist die Frist da.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohaerentes Wasser',
    text: 'Der gemeinsame Mechanismus beider Formen.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Die Zellstudien, ehrlich',
    text: 'Die Evidenz, die fuer beide gilt.',
    href: '/pages/zellstudien-ehrlich',
    cta: 'Evidenz',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Rueckgabe und Umtausch ohne Kleingedrucktes.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

export function MmKetteOderArmband({products}) {
  return (
    <MmPage scope="mm-wahl">
      <MmHero
        dataSection="mm-wahl-hero"
        eyebrow="Entscheidungshilfe"
        headline={'Kette oder Armband? Gleiche Technik — deine Trageform.'}
        sub="Die haeufigste Frage kurz vor der Bestellung. Die gute Nachricht: Du kannst nichts falsch machen. Beide tragen denselben 750er-Gold-Gitterchip. Der Unterschied ist nur, wie du ihn traegst."
        bullets={[
          'Identische Technik in beiden — gleiche Wirkung',
          'Kette: unsichtbar unter der Kleidung. Armband: sichtbar getragen.',
          '20 Tage Rueckgabe — auch beim Umtausch von Kette zu Armband',
        ]}
        cta={{href: '#vergleich', label: 'Direkt vergleichen'}}
        ctaSekundaer={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_04.jpg_1.webp?v=1670947919',
          alt: 'QiOne 2 Pro',
          hint: 'Ein Chip — zwei Wege, ihn zu tragen.',
        }}
      />

      <MmProblem
        dataSection="mm-wahl-problem"
        eyebrow="Worum es wirklich geht"
        title="Nicht welcher wirkt besser — sondern welcher zu dir passt"
        text={[
          'Viele fragen kurz vor der Bestellung, ob Kette oder Armband „staerker" wirkt. Tut keiner von beiden — es ist derselbe Chip, dieselbe Technik.',
          'Die einzige echte Frage: Soll er unsichtbar unter der Kleidung mitlaufen (Kette) oder sichtbar am Handgelenk getragen werden (Armband)? Das entscheidest du nach deinem Alltag und Stil.',
        ]}
        punkte={[
          'Gleicher 750er-Gold-Gitterchip in beiden.',
          'Gleiche 20-Tage-Rueckgabe.',
          'Kein Unterschied in der Wirkung — nur im Tragen.',
        ]}
      />

      <span id="vergleich" />
      <MmMechanism
        dataSection="mm-wahl-mechanismus"
        eyebrow="Der direkte Vergleich"
        title="Kette oder Armband — nebeneinander"
        intro="Beide enthalten dieselbe Gitterchip-Technik. Waehle nach Sichtbarkeit und Trageweise, nicht nach vermeintlicher Staerke."
        schritte={[
          {titel: 'QiOne 2 Pro — die Kette', text: 'Wird nah am Koerper getragen, unsichtbar unter der Kleidung. Ideal, wenn du ihn diskret und durchgehend tragen willst.'},
          {titel: 'QiBracelet — das Armband', text: 'Sichtbar am Handgelenk getragen. Ideal, wenn du ihn offen tragen und im Blick haben moechtest.'},
        ]}
        note="Beide sind hitze-, chlor- und schweissbestaendig, ohne Akku, ueber Jahrzehnte ausgelegt. Der Chip ist identisch — die Studienlage gilt fuer beide Trageformen gleichermassen."
      />

      <MmStatBand
        dataSection="mm-wahl-stats"
        stats={[
          {zahl: '1', label: 'Chip-Technik in beiden'},
          {zahl: '2', label: 'Trageformen zur Wahl'},
          {zahl: '20', label: 'Tage Rueckgabe (beide)'},
          {zahl: '4,8', label: '/ 5 Google-Bewertung'},
        ]}
      />

      <MmPick
        dataSection="mm-wahl-pick"
        title="Deine Wahl — mit Live-Preis"
        products={products}
        handles={PICK}
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-wahl-reviews-intro"
        title="Stimmen aus der Praxis"
        text="Drei von tausenden Google-Bewertungen (Durchschnitt 4,8 / 5). Einzelerfahrungen, kein Wirknachweis."
      />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><GoogleReviews dataSection="mm-wahl-reviews" /></div></div>

      <MmTrust
        dataSection="mm-wahl-trust"
        eyebrow="Kuratiert — die 6 Signale, die zaehlen"
        title="Bei beiden gleich"
        badges={BADGES}
      />

      <MmRisk
        dataSection="mm-wahl-risk"
        ring="20"
        title="Unsicher? 20 Tage entscheiden lassen."
        text={'Bestell die Form, zu der du tendierst, und trag sie 20 Tage. Passt sie nicht zu deinem Alltag, tauschst oder erstattest du — die Rueckgabe haengt an Frist und Ueberzeugung, nicht am „Spueren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Umtausch Kette <-> Armband moeglich', 'Grund: keiner noetig']}
      />

      <MmFaq
        dataSection="mm-wahl-faq"
        title="Kette oder Armband — die haeufigsten Fragen"
        items={FAQ}
      />

      <MmFunnel dataSection="mm-wahl-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-wahl-final"
        title="Du kannst nichts falsch machen."
        text="Gleiche Technik, deine Trageform — und 20 Tage, um sicher zu sein."
        cta={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/products/qibracelet', label: 'Zum QiBracelet'}}
      />

      <MmGrenzen dataSection="mm-wahl-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind praeklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohaerentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
