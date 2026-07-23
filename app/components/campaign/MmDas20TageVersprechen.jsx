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
 * MmDas20TageVersprechen — Composer des Trust-Ketten-Hubs „Garantie / Risiko-
 * Umkehr". 20-Tage-Rueckgabe als groesster Bottom-of-Funnel-Einwand-Killer.
 * Strikt Spuer-Regel #7: Die Rueckgabe haengt an ZEIT (20 Tage) + UEBERZEUGUNG,
 * nie daran, ob der Kunde etwas „spuert". Ton: beruhigend, konkret, ohne
 * Kleingedrucktes. Verlinkt von den Message-Match-LPs.
 */

const BADGES = [
  {mark: '↺', titel: '20 Tage', sub: 'Geld-zurueck'},
  {mark: '∅', titel: 'Kein Grund', sub: 'noetig'},
  {mark: '▤', titel: '0% Finanzierung', sub: 'Klarna / PayPal'},
  {mark: '✓', titel: 'Kaeuferschutz', sub: 'inklusive'},
  {mark: '★', titel: '4,8 / 5', sub: 'Google-Bewertung'},
  {mark: '⚑', titel: 'Fertigung in Bayern', sub: 'Deutschland'},
];

const FAQ = [
  {
    frage: 'Wie lange habe ich genau Zeit?',
    antwort:
      '20 Tage ab Erhalt der Bestellung. Innerhalb dieser Frist kannst du die Rueckgabe anstossen.',
  },
  {
    frage: 'Muss ich einen Grund angeben?',
    antwort:
      'Nein. Bist du nicht ueberzeugt, genuegt das. Es ist kein Grund und keine Rechtfertigung noetig.',
  },
  {
    frage: 'Gilt die Rueckgabe auch bei Ratenzahlung?',
    antwort:
      'Ja. Auch wenn du ueber Klarna oder PayPal in Raten zahlst, gilt dieselbe 20-Tage-Rueckgabe samt Kaeuferschutz.',
  },
  {
    frage: 'Muss ich etwas „gespuert" haben, um zurueckzugeben?',
    antwort:
      'Nein — im Gegenteil. Die Rueckgabe haengt ausdruecklich NICHT am Spueren, sondern nur an der Frist und deiner Ueberzeugung.',
  },
  {
    frage: 'Wie bekomme ich mein Geld zurueck?',
    antwort:
      'Du meldest die Rueckgabe, sendest das Produkt zurueck und erhaeltst den Betrag erstattet. Unkompliziert, ohne Haken.',
  },
];

const FUNNEL = [
  {
    titel: 'Ist das Einbildung? Wir machen ihn auf',
    text: 'Aufbau, Messung, Erfahrung — fuer Skeptiker.',
    href: '/pages/wir-machen-ihn-auf',
    cta: 'Fuer Skeptiker',
  },
  {
    titel: 'So wirkt kohaerentes Wasser',
    text: 'Der Mechanismus, in Ruhe erklaert.',
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
  {handle: 'qihome-air', name: 'QiHome Air', note: 'Fuer den Raum', cta: 'Zum QiHome Air'},
];

export function MmDas20TageVersprechen({products}) {
  return (
    <MmPage scope="mm-garantie">
      <MmHero
        dataSection="mm-garantie-hero"
        eyebrow="Das Risiko liegt bei uns"
        headline={'20 Tage. Kein Kleingedrucktes. Kein „nur wenn".'}
        sub="Ein hochwertiges Produkt zu kaufen, das man nicht kennt, fuehlt sich riskant an. Deshalb drehen wir das Risiko um: Du testest 20 Tage in Ruhe. Ueberzeugt es dich nicht, bekommst du dein Geld zurueck — ohne Begruendung, ohne Haken."
        bullets={[
          '20 Tage ab Erhalt, um in Ruhe zu entscheiden',
          'Kein Grund noetig, kein „nur wenn du nichts spuerst"',
          'Klarna / PayPal moeglich — auch in Raten, mit Kaeuferschutz',
        ]}
        cta={{href: '#ablauf', label: 'So laeuft die Rueckgabe'}}
        ctaSekundaer={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        media={{
          src: 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/QiOne2Pro_04.jpg_1.webp?v=1670947919',
          alt: 'QiOne 2 Pro',
          hint: '20 Tage tragen — dann entscheidest du.',
        }}
      />

      <MmProblem
        dataSection="mm-garantie-problem"
        eyebrow="Die Angst vor dem Fehlkauf"
        title="Was, wenn es teuer war und dann nichts fuer mich ist?"
        text={[
          'Das ist die haeufigste Sorge kurz vor der Bestellung — und sie ist berechtigt. Niemand gibt gern Geld fuer etwas aus, das man vorher nicht ausprobieren konnte.',
          'Genau dafuer gibt es die 20 Tage. Nicht als Marketing-Floskel, sondern als klaren Ablauf: testen, und bei Nicht-Ueberzeugung unkompliziert zurueck. Das Risiko traegt Qi Blanco, nicht du.',
        ]}
        punkte={[
          'Kein Vorschuss-Vertrauen noetig.',
          'Kein Verkaufsdruck — du entscheidest in Ruhe.',
          'Kein Kleingedrucktes, das die Rueckgabe aushebelt.',
        ]}
      />

      <span id="ablauf" />
      <MmMechanism
        dataSection="mm-garantie-ablauf"
        eyebrow="So laeuft es"
        title="Rueckgabe in vier Schritten"
        intro="Klar und ohne Fallstricke — damit du genau weisst, worauf du dich einlaesst."
        schritte={[
          {titel: '1. Bestellen ohne Risiko', text: 'Du bestellst regulaer. Auf Wunsch in Raten ueber Klarna oder PayPal, mit Kaeuferschutz.'},
          {titel: '2. 20 Tage tragen', text: 'Trag ihn in deinem echten Alltag. Nimm dir die Zeit — es gibt keine Eile und keinen Countdown.'},
          {titel: '3. Nicht ueberzeugt? Melden', text: 'Bist du nicht ueberzeugt, meldest du dich innerhalb von 20 Tagen ab Erhalt. Du musst keinen Grund nennen.'},
          {titel: '4. Zuruecksenden & Erstattung', text: 'Du sendest zurueck und bekommst dein Geld erstattet. Unkompliziert, ohne Haken.'},
        ]}
        note={'Wichtig: Die Rueckgabe haengt an der Frist und an deiner Ueberzeugung — nicht daran, ob du etwas „spuerst". Warum, steht gleich darunter.'}
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-garantie-warum"
        eyebrow={'Warum kein „nur wenn du etwas spuerst"'}
        title={'Wir koppeln die Garantie bewusst NICHT ans Spueren'}
        text={[
          'Manche Anbieter sagen „Geld zurueck, wenn du nichts spuerst". Das klingt fair, ist aber ein Problem: Der beschriebene Effekt ist wahrnehmungs-unabhaengig — er haengt nicht davon ab, ob du ihn bewusst fuehlst. Eine Garantie ans Spueren zu binden, waere also unsauber.',
          'Deshalb binden wir sie an das, was klar und fair ist: eine feste Frist (20 Tage) und deine ehrliche Ueberzeugung. Bist du nicht ueberzeugt — aus welchem Grund auch immer — bekommst du dein Geld.',
        ]}
        punkte={[
          'Wirkung: wahrnehmungs-unabhaengig (Spueren ist kein Massstab).',
          'Garantie-Massstab: Frist + deine Ueberzeugung.',
          'Fair fuer beide Seiten, ohne Auslegungsspielraum.',
        ]}
      />

      <MmStatBand
        dataSection="mm-garantie-stats"
        stats={[
          {zahl: '20', label: 'Tage ab Erhalt'},
          {zahl: '0', label: 'Gruende noetig'},
          {zahl: '0 %', label: 'Finanzierung moeglich'},
          {zahl: '✓', label: 'Kaeuferschutz (Klarna/PayPal)'},
        ]}
      />

      <MmProblem
        variante="flaeche"
        dataSection="mm-garantie-reviews-intro"
        title="Stimmen aus der Praxis"
        text="Drei von tausenden Google-Bewertungen (Durchschnitt 4,8 / 5). Einzelerfahrungen, kein Wirknachweis."
      />
      <div className="mm-lp"><div className="mm-bahn" style={{paddingTop: 0}}><GoogleReviews dataSection="mm-garantie-reviews" /></div></div>

      <MmTrust
        dataSection="mm-garantie-trust"
        eyebrow="Kuratiert — deine Absicherung"
        title="Worauf du dich verlassen kannst"
        badges={BADGES}
      />

      <MmRisk
        dataSection="mm-garantie-risk"
        ring="20"
        title="Fair, klar, ohne Haken."
        text={'Zusammengefasst: 20 Tage ab Erhalt, kein Grund noetig, unkomplizierte Erstattung. Die Rueckgabe haengt an Frist und Ueberzeugung, nie am „Spueren".'}
        punkte={['Frist: 20 Tage ab Erhalt', 'Grund: keiner noetig', 'Ablauf: melden, zuruecksenden, Erstattung']}
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
        title="Fragen zur Rueckgabe"
        items={FAQ}
      />

      <MmFunnel dataSection="mm-garantie-funnel" links={FUNNEL} />

      <MmFinal
        dataSection="mm-garantie-final"
        title="Das Risiko liegt bei uns. Starte in Ruhe."
        text="20 Tage, kein Grund noetig, faire Erstattung. Mehr Sicherheit geht kaum."
        cta={{href: '/products/qione-2-pro', label: 'Zum QiOne 2 Pro'}}
        ctaSekundaer={{href: '/pages/wir-machen-ihn-auf', label: 'Erst die Belege ansehen'}}
      />

      <MmGrenzen dataSection="mm-garantie-grenzen">
        <strong>Transparenz-Hinweis:</strong> QiOne&reg; 2 Pro ist kein Medizinprodukt und nicht dazu bestimmt, Krankheiten
        zu diagnostizieren, zu behandeln oder zu heilen. Die genannten Studien sind praeklinische In-vitro-Untersuchungen an
        Zellkulturen; sie belegen keinen Heileffekt am Menschen. Erfahrungsberichte sind deskriptiv und ohne Kontrollgruppe.
        &bdquo;Kohaerentes Wasser&ldquo; bezeichnet ein Ordnungs-Modell und ist keine anerkannte medizinische Diagnose.
      </MmGrenzen>
    </MmPage>
  );
}
