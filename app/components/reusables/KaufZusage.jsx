import {useNavigate} from 'react-router';
import {useGoogleRating} from '~/lib/googleRating';
import {useMarktLand} from '~/lib/markt-land';
import {QIMASTER_SYMBOL_PFADE} from '~/lib/qi-master-symbole.generated';
import {BEWERTUNGEN_PFAD} from '~/components/reusables/AlleBewertungenLink';
import {
  findeRezensionsZiel,
  scrolleZuRezensionen,
} from '~/components/reusables/GoogleRezensionenBereich';

/*
 * KaufZusagePunkte: drei Punkte für die Nutzen-Liste direkt unter dem
 * Kaufknopf (Job 20260926-growth-kaufweg-vertrauen-dach, Maßnahme des
 * Growth-Managers, Christian 26.09.2026).
 *
 * WARUM: Gemessen vom 27.08. bis 26.09.2026 (echte Besucher, events.db)
 * landen 4,1 % der Sitzungen mit Produktansicht im Warenkorb, die Geräte
 * darunter (QiOne 2 Pro 3,0 %, QiBracelet 1,7 %, QiHome Air 1,1 %). Am
 * Kaufknopf dieser Seiten stand weder die Rücknahme noch die Zahlung in Raten,
 * die zwei stärksten Abschlusssignale des Hauskanons für DACH
 * (kaufueberzeugung/kanon/kanon.yaml). Die Google-Bewertungen sahen auf
 * /pages/qione-2-pro nur 9,4 % der Sitzungen ohne Warenkorb, den Kaufbereich
 * 78,7 %.
 *
 * BAUFORM GEERBT, NICHT NACHGEBAUT: die Punkte sind <li> derselben
 * .BenefitList wie „Kostenloser Versand" darunter. Schrift, Abstand, Farbe und
 * Icon-Größe kommen aus app.css (.BenefitList svg). Dieselbe Entscheidung wie
 * beim Gewährleistungs-Punkt (Elina EL-20260909-395f848c: „wie ein weiterer
 * Punkt, nicht wie ein separater Block") und wie in Christians Liste auf
 * /products/qi-master (16.09.2026: „0% Finanzierung (in Fett) mit PayPal und
 * Klarna"). Deshalb auch hier KEINE Laufzeit und KEINE Beispielrechnung: die
 * Zeile nennt ein Angebot, die Genehmigung entscheidet der Anbieter
 * (Fußnote 2 im Fuß jeder Seite).
 *
 * DIE DREI PUNKTE:
 *  1. Rücknahme. `ruecknahmeTage={null}` lässt die Zahl weg: auf
 *     /products/qihome-air verspricht der Inhalt weiter unten 30 Tage, AGB und
 *     Kopfbanner sagen 20. Der Widerspruch ist gemeldet und wird hier nicht
 *     durch eine dritte Zahl vergrößert.
 *  2. Raten, nur im Markt DE: Ratenzahlung steht laut Fußnote 2 nur Kundinnen
 *     und Kunden mit deutschem Wohnsitz offen.
 *  3. Der Weg zu den echten Google-Bewertungen. Anzahl und Note kommen zur
 *     Laufzeit aus useGoogleRating(), nie als Literal (4,8 aus 441 bewegt sich
 *     täglich). Der Knopf springt zum Bewertungsbereich DIESER Seite, mit
 *     demselben Ziel und demselben Kopf-Abstand wie die Sterne im Kopfbanner;
 *     trägt eine Seite keinen, führt er auf /pages/bewertungen.
 *     Bewusst OHNE Sternsymbol: ein Stern wäre nach dem Sterne-Vertrag
 *     (StarRating.jsx) eine Bewertungsansicht mit eigener Farb- und
 *     Klickpflicht. Die Sterne stehen schon oben neben dem Titel.
 *
 * data-qb-kaufzusage ist der Messanker (Geometrie, Rand-Proben). Kein
 * data-section: die Kaufseiten sind bewusst anker-frei (Design-Rubrik-
 * Collector, siehe products.qione-2-pro.jsx).
 */
export function KaufZusagePunkte({ruecknahmeTage = 20}) {
  const marktLand = useMarktLand();
  const bewertung = useGoogleRating();
  const navigate = useNavigate();
  /* useGoogleRating() lässt eine fehlende Anzahl als plausibel durch (die
     Places-Quelle liefert sie nicht immer). Ohne Zahl steht der Knopf ohne Zahl
     da, statt „undefined Google-Bewertungen" zu zeigen. */
  const anzahl =
    Number.isFinite(bewertung.total) && bewertung.total > 0 ? bewertung.total : null;

  const zuDenBewertungen = () => {
    const ziel = findeRezensionsZiel();
    if (ziel) {
      scrolleZuRezensionen(ziel);
    } else {
      navigate(BEWERTUNGEN_PFAD);
    }
  };

  return (
    <>
      <li data-qb-kaufzusage="ruecknahme">
        <SymbolRuecknahme />
        {/* Ganze Sätze als EIN String: React setzt zwischen Zahl und Text
            sonst einen Kommentar-Knoten, und eine Rand-Probe, die den Satz im
            ausgelieferten HTML sucht, fände ihn nie. */}
        <b>
          {ruecknahmeTage
            ? `${ruecknahmeTage} Tage zu Hause testen`
            : 'Zu Hause in Ruhe testen'}
        </b>
        , mit Geld-zurück-Garantie
      </li>
      {marktLand === 'DE' ? (
        <li data-qb-kaufzusage="raten">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path fill="currentColor" d={QIMASTER_SYMBOL_PFADE['finanzierung-null']} />
          </svg>
          {/* „²" verweist auf Fußnote 2 im Fuß jeder Seite (Genehmigung durch
              den Anbieter, deutscher Wohnsitz), dieselbe Marke wie am
              Raten-Banner der Kaufseiten. */}
          <b>In Raten zahlen</b>, mit 0&nbsp;% Finanzierung über PayPal und Klarna²
        </li>
      ) : null}
      <li data-qb-kaufzusage="bewertungen">
        <SymbolStimmen />
        <button
          type="button"
          onClick={zuDenBewertungen}
          className="kaufzusage-bewertungen font-semibold underline underline-offset-4 decoration-1 hover:decoration-2 cursor-pointer"
        >
          {anzahl ? `${anzahl} Google-Bewertungen lesen` : 'Google-Bewertungen lesen'}
        </button>
        {`, im Schnitt ${bewertung.komma} von 5`}
      </li>
    </>
  );
}

/* Rücknahme: der Rückpfeil aus dem Symbolsatz des Hauses (MmKit „↺", auf
   /pages/das-20-tage-versprechen das Zeichen für „20 Tage Geld-zurück"), als
   Linie in der Stärke der gefüllten Nachbar-Icons. */
function SymbolRuecknahme() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 8.5A8 8 0 1 1 4.5 13" />
      <path d="M5 4.5v4h4" />
    </svg>
  );
}

/* Bewertungen: eine Sprechblase statt eines Sterns (Begründung oben). */
function SymbolStimmen() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4 3.5h16A1.5 1.5 0 0 1 21.5 5v10.5A1.5 1.5 0 0 1 20 17h-9.5l-5 4v-4H4A1.5 1.5 0 0 1 2.5 15.5V5A1.5 1.5 0 0 1 4 3.5Z"
      />
    </svg>
  );
}
