import {ReputonWidget} from '~/components/index-components/ReputonWidget';
import {useGoogleRating} from '~/lib/googleRating';
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
 * MmDas20TageVersprechen — Composer des Trust-Ketten-Hubs „Garantie / Risiko-
 * Umkehr". 20-Tage-Rückgabe als größter Bottom-of-Funnel-Einwand-Killer.
 * Strikt Spür-Regel #7: Die Rückgabe hängt an ZEIT (20 Tage) + ÜBERZEUGUNG,
 * nie daran, ob der Kunde etwas „spürt". Ton: beruhigend, konkret, ohne
 * Kleingedrucktes. Verlinkt von den Message-Match-LPs.
 */

const BADGES = [
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurück'},
  {mark: '∅', titel: 'Kein Grund', sub: 'nötig'},
  {mark: '▤', titel: '0% Finanzierung', sub: 'Klarna / PayPal'},
  {mark: '✓', titel: 'Käuferschutz', sub: 'inklusive'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '⚑', titel: 'Fertigung in Bayern', sub: 'Deutschland'},
];

const FAQ = [
  {
    frage: 'Wie lange habe ich genau Zeit?',
    antwort:
      '20 Tage ab Erhalt der Bestellung. Innerhalb dieser Frist kannst du die Rückgabe anstoßen.',
  },
  {
    frage: 'Muss ich einen Grund angeben?',
    antwort:
      'Nein. Bist du nicht überzeugt, genügt das. Es ist kein Grund und keine Rechtfertigung nötig.',
  },
  {
    frage: 'Gilt die Rückgabe auch bei Ratenzahlung?',
    antwort:
      'Ja. Auch wenn du über Klarna oder PayPal in Raten zahlst, gilt dieselbe 20-Tage-Rückgabe samt Käuferschutz.',
  },
  {
    frage: 'Muss ich etwas „gespürt" haben, um zurückzugeben?',
    antwort:
      'Nein — im Gegenteil. Die Rückgabe hängt ausdrücklich NICHT am Spüren, sondern nur an der Frist und deiner Überzeugung.',
  },
  {
    frage: 'Wie bekomme ich mein Geld zurück?',
    antwort:
      'Du meldest die Rückgabe, sendest das Produkt zurück und erhältst den Betrag erstattet. Unkompliziert, ohne Haken.',
  },
];

const FUNNEL = [
  {
    titel: 'Ist das Einbildung? Wir machen ihn auf',
    text: 'Aufbau, Messung, Erfahrung — für Skeptiker.',
    href: '/pages/wir-machen-ihn-auf',
    cta: 'Für Skeptiker',
  },
  {
    titel: 'So wirkt kohärentes Wasser',
    text: 'Der Mechanismus, in Ruhe erklärt.',
    href: '/pages/so-wirkt-kohaerentes-wasser',
    cta: 'Mechanismus',
  },
  {
    titel: 'Die Zellstudien, ehrlich',
    text: 'Die Evidenz mit Methode und Grenzen.',
    href: '/pages/zellstudien-ehrlich',
    cta: 'Evidenz',
  },
];

const PICK = [
  {handle: 'qione-2-pro', name: 'QiOne 2 Pro', note: 'Kette — auch in Raten', cta: 'Zum QiOne 2 Pro'},
  {handle: 'qibracelet', name: 'QiBracelet', note: 'Armband — auch in Raten', cta: 'Zum QiBracelet'},
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Für den Raum', cta: 'Zum QiHome Air'},
];

export function MmDas20TageVersprechen({products}) {
  const g = useGoogleRating();
  const badges = BADGES.map((b) =>
    b.sub === 'Google-Bewertung' ? {...b, titel: `${g.komma} / 5`} : b,
  );
  return (
    <MmPage scope="mm-garantie">
      <MmHero
        dataSection="mm-garantie-hero"
        eyebrow="Das Risiko liegt bei uns"
        headline={'20 Tage. Kein Kleingedrucktes. Kein „nur wenn".'}
        sub="Ein hochwertiges Produkt zu kaufen, das man nicht kennt, fühlt sich riskant an. Deshalb drehen wir das Risiko um: Du testest 20 Tage in Ruhe. Überzeugt es dich nicht, bekommst du dein Geld zurück — ohne Begründung, ohne Haken."
        bullets={[
          '20 Tage ab Erhalt, um in Ruhe zu entscheiden',
          'Kein Grund nötig, kein „nur wenn du nichts spürst"',
          'Klarna / PayPal möglich — auch in Raten, mit Käuferschutz',
        ]}
        cta={{href: '#ablauf', label: 'So läuft die Rückgabe'}}
        ctaSekundaer={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne_Gitterchip-1-1024x1024.jpg_1.webp?v=1670947861',
          alt: 'Frontansicht des QiOne 2 Pro mit dem Gold-Gitter',
          hint: '20 Tage tragen — dann entscheidest du.',
        }}
      />

      <MmProblem
        dataSection="mm-garantie-problem"
        eyebrow="Die Angst vor dem Fehlkauf"
        title="Was, wenn es teuer war und dann nichts für mich ist?"
        text={[
          'Das ist die häufigste Sorge kurz vor der Bestellung — und sie ist berechtigt. Niemand gibt gern Geld für etwas aus, das man vorher nicht ausprobieren konnte.',
          'Genau dafür gibt es die 20 Tage. Nicht als Marketing-Floskel, sondern als klaren Ablauf: testen, und bei Nicht-Überzeugung unkompliziert zurück. Das Risiko trägt Qi Blanco, nicht du.',
        ]}
        punkte={[
          'Kein Vorschuss-Vertrauen nötig.',
          'Kein Verkaufsdruck — du entscheidest in Ruhe.',
          'Kein Kleingedrucktes, das die Rückgabe aushebelt.',
        ]}
      />

      <span id="ablauf" />
      <MmMechanism
        dataSection="mm-garantie-ablauf"
        eyebrow="So läuft es"
        title="Rückgabe in vier Schritten"
        intro="Klar und ohne Fallstricke — damit du genau weißt, worauf du dich einlässt."
        schritte={[
          {titel: '1. Bestellen ohne Risiko', text: 'Du bestellst regulär. Auf Wunsch in Raten über Klarna oder PayPal, mit Käuferschutz.'},
          {titel: '2. 20 Tage tragen', text: 'Trag ihn in deinem echten Alltag. Nimm dir die Zeit — es gibt keine Eile und keinen Countdown.'},
          {titel: '3. Nicht überzeugt? Melden', text: 'Bist du nicht überzeugt, meldest du dich innerhalb von 20 Tagen ab Erhalt. Du musst keinen Grund nennen.'},
          {titel: '4. Zurücksenden & Erstattung', text: 'Du sendest zurück und bekommst dein Geld erstattet. Unkompliziert, ohne Haken.'},
        ]}
        note={'Wichtig: Die Rückgabe hängt an der Frist und an deiner Überzeugung — nicht daran, ob du etwas „spürst". Warum, steht gleich darunter.'}
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-garantie-warum"
        eyebrow={'Warum kein „nur wenn du etwas spürst"'}
        title={'Wir koppeln die Garantie bewusst NICHT ans Spüren'}
        text={[
          'Manche Anbieter sagen „Geld zurück, wenn du nichts spürst". Das klingt fair, ist aber ein Problem: Der beschriebene Effekt ist wahrnehmungs-unabhängig — er hängt nicht davon ab, ob du ihn bewusst fühlst. Eine Garantie ans Spüren zu binden, wäre also unsauber.',
          'Deshalb binden wir sie an das, was klar und fair ist: eine feste Frist (20 Tage) und deine ehrliche Überzeugung. Bist du nicht überzeugt — aus welchem Grund auch immer — bekommst du dein Geld.',
        ]}
        punkte={[
          'Wirkung: wahrnehmungs-unabhängig (Spüren ist kein Maßstab).',
          'Garantie-Maßstab: Frist + deine Überzeugung.',
          'Fair für beide Seiten, ohne Auslegungsspielraum.',
        ]}
      />

      <MmStatBand
        dataSection="mm-garantie-stats"
        stats={[
          {zahl: '20', label: 'Tage ab Erhalt'},
          {zahl: '0', label: 'Gründe nötig'},
          {zahl: '0 %', label: 'Finanzierung möglich'},
          {zahl: '✓', label: 'Käuferschutz (Klarna/PayPal)'},
        ]}
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-garantie-reviews-intro"
        title="Stimmen aus der Praxis"
        text={`Echte Google-Bewertungen unserer Kundinnen und Kunden — Gesamtschnitt ${g.komma} / 5 aus ${g.total} Bewertungen. Einzelerfahrungen, kein Wirknachweis.`}
      />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><ReputonWidget /></div></div>

      <MmTrust
        dataSection="mm-garantie-trust"
        eyebrow="Kuratiert — deine Absicherung"
        title="Worauf du dich verlassen kannst"
        badges={badges}
      />

      <MmRisk
        dataSection="mm-garantie-risk"
        ring="20"
        title="Fair, klar, ohne Haken."
        text={'Zusammengefasst: 20 Tage ab Erhalt, kein Grund nötig, unkomplizierte Erstattung. Die Rückgabe hängt an Frist und Überzeugung, nie am „Spüren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner nötig', 'Ablauf: melden, zurücksenden, Erstattung']}
      />

      <MmPick
        variante="flaeche"
        dataSection="mm-garantie-pick"
        title="Risikofrei starten"
        products={products}
        handles={PICK}
      />

      <MmFaq
        dataSection="mm-garantie-faq"
        title="Fragen zur Rückgabe"
        items={FAQ}
      />

      <MmFunnel dataSection="mm-garantie-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-garantie-final"
        title="Das Risiko liegt bei uns. Starte in Ruhe."
        text="20 Tage, kein Grund nötig, faire Erstattung. Mehr Sicherheit geht kaum."
        cta={{href: '/pages/qione-2-pro?Title=Default+Title', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/wir-machen-ihn-auf', label: 'Erst die Belege ansehen'}}
      />

      <MmGrenzen dataSection="mm-garantie-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind präklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohärentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
