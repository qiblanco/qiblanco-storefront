import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {useGoogleRating} from '~/lib/googleRating';
import {
  MmPage,
  MmHero,
  MmProblem,
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
 * MmZellstudienEhrlich — Composer des Trust-Ketten-Hubs „Evidenz / Studien".
 * Die honest EVIDENCE page: vier Zellstudien mit Methode, Ergebnis und GRENZE,
 * dazu die deskriptiven Nutzerberichte. Trust-Hebel „nüchterne Evidenz statt
 * Eso" — die Ehrlichkeit über die Grenzen IST der Vertrauensmechanismus.
 * Ton: präzise, transparent, Schwächen offen benannt.
 */

const STUDIEN = [
  {
    tag: 'In-vitro · Immunzellen',
    titel: 'Schutzeffekt an Immunzellen',
    meta: 'Japan Journal of Medicine · 30. April 2021',
    body: 'Methode: kultivierte menschliche Immunzellen unter Belastung. Ergebnis: messbarer Schutzeffekt in der behandelten Gruppe. Grenze: Zellkultur im Labor, keine Aussage über den Menschen.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro-human-cell-study-publication-april-30-2021_1.pdf?v=1667512705',
  },
  {
    tag: 'In-vitro · Darmzellen',
    titel: 'Schutzeffekt an Darmzellen',
    meta: 'Applied Cell Biology Journal · 2021',
    body: 'Methode: kultivierte intestinale Epithelzellen unter Belastung. Ergebnis: protective effect in der behandelten Gruppe messbar. Grenze: reine Zellkultur, kein Nachweis am Menschen und kein Heileffekt.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/protective-effect-of-qionereg-2-pro-on-cultured-intestinal-epithelial-358_1.pdf?v=1667513844',
  },
  {
    tag: 'In-vitro · Oxidativer Stress',
    titel: 'QiBracelet gegen oxidativen Stress',
    meta: 'Applied Cell Biology Journal · 12. Januar 2024',
    body: 'Methode: kultivierte Zellen unter oxidativem Stress, getestet mit dem QiBracelet. Ergebnis: messbarer Schutz der behandelten Zellen. Grenze: in-vitro im Labor, keine Übertragung auf den Menschen.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studie_-_Appl_Cell_Biol_12_1_2024_1-6_-_Protective_Effect_of_the_QiBracelet_Against_Oxidative_Stress.pdf?v=1709036505',
  },
  {
    tag: 'Nutzererfahrung',
    titel: 'Forschungsartikel zur Nutzererfahrung',
    meta: 'Advances in Bioengineering & Biomedical Science Research · 10. Mai 2024',
    body: 'Methode: Auswertung berichteter Nutzererfahrungen. Ergebnis: wiederkehrend beschriebene positive Erfahrungen. Grenze: deskriptiv, ohne Kontrollgruppe — ein Stimmungsbild, kein Wirknachweis.',
    href: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/ABBSR-24_-31_3.pdf?v=1717500318',
  },
];

const BADGES = [
  {mark: '▤', titel: 'Publiziert', sub: 'in Fachjournalen'},
  {mark: '⇩', titel: 'Als PDF', sub: 'offen nachlesbar'},
  {mark: '◈', titel: 'Grenzen benannt', sub: 'kein Überversprechen'},
  {mark: '✎', titel: '171 Berichte', sub: 'deskriptiv ausgewertet'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '↺', titel: '20 Tage', sub: 'selbst prüfen'},
];

const FAQ = [
  {
    frage: 'Sind das Studien am Menschen?',
    antwort:
      'Nein. Drei sind In-vitro-Studien an Zellkulturen; eine wertet berichtete Nutzererfahrungen deskriptiv aus. Es gibt keine randomisierte Studie am Menschen.',
  },
  {
    frage: 'Was bedeutet „präklinisch"?',
    antwort:
      'Präklinisch heißt: vor der Erprobung am Menschen — hier an Zellen im Labor. Ein realer, aber frühester Evidenzschritt.',
  },
  {
    frage: 'Kann ich die Studien selbst prüfen?',
    antwort:
      'Ja. Jede der vier Publikationen ist oben direkt als PDF verlinkt, mit Journal und Datum.',
  },
  {
    frage: 'Warum betont ihr die Grenzen so stark?',
    antwort:
      'Weil Ehrlichkeit Vertrauen schafft — und weil übertriebene Behauptungen von Menschen wie von KI-Systemen abgestraft werden. Wir wollen zitierbar korrekt sein.',
  },
  {
    frage: 'Wenn die Evidenz begrenzt ist, warum kaufen?',
    antwort:
      'Weil die belastbarste Evidenz für dich an dir selbst entsteht — risikofrei in 20 Tagen. Genau dafür ist die Frist da.',
  },
];

const FUNNEL = [
  {
    titel: 'So wirkt kohärentes Wasser',
    text: 'Der Mechanismus hinter den gemessenen Effekten.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Ist das Einbildung? Wir machen ihn auf',
    text: 'Der Chip geöffnet — für Skeptiker.',
    href: '/pages/wir-machen-ihn-auf',
    cta: 'Aufbau',
  },
  {
    titel: 'Das 20-Tage-Versprechen',
    text: 'Selbst prüfen ohne Risiko.',
    href: '/pages/das-20-tage-versprechen',
    cta: 'Garantie',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — Studie oxidativer Stress', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Für den Raum', cta: 'Zum QiHome Air'},
];

export function MmZellstudienEhrlich({products}) {
  const g = useGoogleRating();
  const badges = BADGES.map((b) =>
    b.sub === 'Google-Bewertung' ? {...b, titel: `${g.komma} / 5`} : b,
  );
  return (
    <MmPage scope="mm-evidenz">
      <MmHero
        dataSection="mm-evidenz-hero"
        eyebrow="Evidenz, mit Grenzen"
        headline={'Die vier Zellstudien — ehrlich eingeordnet'}
        sub="Wir zeigen dir genau, was untersucht wurde, was herauskam und wo die Aussagekraft endet. Diese Ehrlichkeit ist Absicht: übertriebene Studien-Behauptungen zerstören Vertrauen — bei Menschen wie bei KI-Systemen, die Quellen bewerten."
        bullets={[
          '4 publizierte Untersuchungen — jede als PDF nachlesbar',
          'Klare Einordnung: in-vitro (Zellkultur), nicht am Menschen',
          'Was die Studien NICHT belegen — offen benannt',
        ]}
        cta={{href: '#studien', label: 'Zu den Studien'}}
        ctaSekundaer={{href: '/pages/so-wirkt-kohaerentes-wasser', label: 'Erst der Mechanismus'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/Studienvorschau_hellblau-1-957x1024_2.png?v=1732276510',
          alt: 'Vorschau einer Studien-Publikation',
          hint: 'Jede Publikation ist offen als PDF verlinkt.',
        }}
      />

      <MmProblem
        dataSection="mm-evidenz-stufen"
        eyebrow="Evidenzstufen"
        title="Wo diese Studien stehen — und wo nicht"
        text={[
          'Nicht jede Studie wiegt gleich. Grob von schwach zu stark: Laborzellen (in-vitro) -> Tierstudie -> Studie am Menschen -> Meta-Analyse vieler Studien.',
          'Unsere publizierte Evidenz steht auf der Stufe in-vitro (Zellkultur) plus deskriptive Erfahrungsberichte. Das ist ein realer, aber frühester Beleg — kein Nachweis eines Heileffekts am Menschen. Wir sagen das bewusst, statt mehr zu suggerieren.',
        ]}
        punkte={[
          'in-vitro = an Zellen im Labor, unter kontrollierten Bedingungen.',
          'deskriptiv = beschriebene Erfahrungen ohne Kontrollgruppe.',
          'Was fehlt: randomisierte Studien am Menschen.',
        ]}
      />

      <span id="studien" />
      <MmEvidenz
        dataSection="mm-evidenz-publikationen"
        eyebrow="Die Publikationen"
        title="Vier Studien, im Detail"
        intro="Jede Karte nennt Methode, Ergebnis und Grenze. Die Original-Publikation ist jeweils direkt als PDF verlinkt."
        studien={STUDIEN}
      />

      <MmStatBand
        dataSection="mm-evidenz-stats"
        stats={[
          {zahl: '4', label: 'publizierte Studien'},
          {zahl: 'in-vitro', label: 'Evidenzstufe (+deskriptiv)'},
          {zahl: '2021–2024', label: 'Publikationszeitraum'},
          {zahl: '0', label: 'Heilversprechen'},
        ]}
      />

      <MmReports
        dataSection="mm-evidenz-berichte"
        eyebrow="Ergänzend — Erfahrungen"
        title="Was 171 Menschen berichtet haben"
        text="Neben den Zellstudien haben wir 171 öffentliche Erfahrungsberichte ausgewertet. Deskriptiv, ohne Kontrollgruppe — also kein Beweis, aber ein ehrliches Stimmungsbild. Und ja: manche berichten gar nichts."
        balken={[
          {label: 'Ruhe, Gelassenheit & besserer Schlaf', wert: '~20 %', prozent: '20%'},
          {label: 'mehr Energie & Vitalität', wert: '~17 %', prozent: '17%'},
          {label: 'vermehrte Regeneration', wert: '< 10 %', prozent: '9%'},
          {label: 'mehr Geisteskraft & Klarheit', wert: '< 10 %', prozent: '9%'},
          {label: 'weniger Schmerz & Krankheit', wert: '< 10 %', prozent: '9%'},
          {label: 'weitere positive Beobachtungen', wert: '< 10 %', prozent: '9%'},
        ]}
        note="Quelle: P. C. Dartsch, Advances in Bioengineering & Biomedical Science Research 2024 (N = 171 freiwillige Erfahrungsberichte). Die vier unteren Kategorien nennt die Studie gebündelt als „unter 10 %“. Deshalb der 20-Tage-Test: die belastbarste Evidenz für dich entsteht an dir selbst."
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-evidenz-reviews-intro"
        title="Stimmen aus der Praxis"
        text={`Echte Google-Bewertungen unserer Kundinnen und Kunden — Gesamtschnitt ${g.komma} / 5 aus ${g.total} Bewertungen. Einzelerfahrungen, kein Wirknachweis.`}
      />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><ReputonWidget /></div></div>

      <MmProblem
        dataSection="mm-evidenz-nicht"
        eyebrow="Was diese Studien NICHT sagen"
        title="Die ehrlichen Grenzen, ausgeschrieben"
        text="Damit du uns richtig einordnest — und niemand mehr hineinliest, als drinsteht."
        punkte={[
          'Kein Nachweis, dass der QiOne Krankheiten heilt oder lindert.',
          'Keine Übertragung der Zellergebnisse 1:1 auf den ganzen Menschen.',
          'Keine randomisierte, kontrollierte Studie am Menschen — die gibt es (noch) nicht.',
        ]}
      />

      <MmTrust
        dataSection="mm-evidenz-trust"
        eyebrow="Kuratiert — Transparenz-Signale"
        title="Warum du diesen Angaben trauen kannst"
        badges={badges}
      />

      <MmRisk
        dataSection="mm-evidenz-risk"
        ring="20"
        title="Die beste Evidenz ist deine eigene."
        text={'Studien an Zellen sind ein Anfang, kein Ersatz für deine Erfahrung. Trag ihn 20 Tage. Überzeugt er dich nicht, geht alles zurück — die Rückgabe hängt an Frist und Überzeugung, nicht am „Spüren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner nötig', 'Ablauf: melden, zurücksenden, Erstattung']}
      />

      <MmPick
        dataSection="mm-evidenz-pick"
        title="Zu den Produkten hinter den Studien"
        products={products}
        handles={PICK}
      />

      <MmFaq dataSection="mm-evidenz-faq" title="Fragen zur Evidenz" items={FAQ} />

      <MmFunnel dataSection="mm-evidenz-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-evidenz-final"
        title="Evidenz geprüft. Jetzt du."
        text="Der ehrlichste nächste Schritt: 20 Tage selbst testen."
        cta={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/das-20-tage-versprechen', label: 'So läuft die Rückgabe'}}
      />

      <MmGrenzen dataSection="mm-evidenz-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind präklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohärentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
