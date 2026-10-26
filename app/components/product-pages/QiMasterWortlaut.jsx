/**
 * QiMasterWortlaut — Christians Fassung zum Qi Master® vom 22.09.2026, als EIN
 * Baustein auf ZWEI Flächen.
 *
 * Steht im `priceLabel`-Slot der Produktseite /products/qi-master (zwischen
 * Preiszeile und Kaufknopf, also dort, wo bis zum 22.09.2026 die
 * Vorverkaufstreppe stand) und auf der Landingpage /pages/qi-master-vorverkauf.
 *
 * DER TEXT STEHT NICHT HIER. Er kommt aus app/data/qi-master-wortlaut.json —
 * derselben Datei, aus der auch Anna (qi-salesbot, über bin/qi-master-vertrag)
 * ihre Auskunft zieht. Wer hier einen Satz hinschreibt, baut die zweite
 * Wahrheit, und die Seite sagt dann etwas anderes als der Chat.
 *
 * NICHTS WIRD UMFORMULIERT: vier Absätze in Christians Reihenfolge, jeder als
 * eigener Absatz, keiner gekürzt, keiner ergänzt — auch nicht „starte"
 * (GL-SPR-0008). Deshalb auch KEINE sichtbare Überschrift: jede Überschrift
 * wäre ein Satz, den Christian nicht geschrieben hat, und stünde über seinem.
 * Die Gliederung trägt `aria-label` für Screenreader.
 *
 * DIE ABGELÖSTE FASSUNG IST WEG, NICHT VERSTECKT: die Treppe mit vier Stufen,
 * Tabellenkopf, der Marke „läuft jetzt", dem Angebotssatz („Sichere dir jetzt
 * …") und der Überschrift („Hole dir jetzt ein einmaliges Angebot …") fällt
 * ersatzlos (Christian am 22.09.2026: „die alte Fassung ist abgelöst"). Zuerst
 * auf der Landingpage, im Folge-PR auf der Produktseite; mit dem zweiten PR
 * wird QiMasterTreppe.jsx gelöscht. Die Zahlen-Quelle
 * app/data/qi-master-preisstufen.json bleibt im Repo stehen, weil shop-manager
 * sie aus origin/main liest — sie wird nur nicht mehr ausgeliefert.
 *
 * GESTALTET IN app/styles/qi-master-wortlaut.css (eigene Datei, damit der
 * erste PR nur die Landingpage erreicht; Begründung im Kopf der Datei).
 */
import quelle from '~/data/qi-master-wortlaut.json';

/**
 * Die Rolle eines Absatzes bestimmt nur seine Gestaltung, nie seinen Text.
 * Zugeordnet über die Position in Christians Reihenfolge; ändert er die
 * Absatzzahl, fällt ein unbekannter Absatz auf die ruhige Grundform zurück —
 * nie auf eine Lücke.
 */
const ROLLE = ['grund', 'herkunft', 'termin', 'versand'];

/**
 * DER PRODUKTNAME IST SEIT 2026-10-17 „Qi Alpha" (Christian: „ja bitte auch
 * die Shopseite und das Produkt. es heißt nun Qi Alpha"). Die Quelle
 * app/data/qi-master-wortlaut.json bleibt Christians Fassung vom 22.09.2026
 * Wort für Wort; ersetzt wird beim Anzeigen NUR der Name, kein anderes Wort.
 * Die Marke ist noch nicht angemeldet, darum ohne ®. Rückweg: diese Funktion
 * auf `(t) => t` setzen.
 */
export function heutigerName(text) {
  return String(text ?? '').replace(/Qi Master®?/g, 'Qi Alpha');
}

/**
 * @param {{kompakt?: boolean, ariaLabel?: string}} props
 * `kompakt` schaltet nur die Dichte um (Produktseite: neben dem Kaufknopf;
 * Landingpage: eigener Abschnitt). Es ändert KEINEN Satz.
 */
export function QiMasterWortlaut({
  kompakt = false,
  ariaLabel = 'Preis, Auflage und Versand des Qi Alpha',
}) {
  const absaetze = quelle?.wortlaut?.absaetze ?? [];
  if (!absaetze.length) return null;

  return (
    <section
      className={`qm-wortlaut${kompakt ? ' qm-wortlaut--kompakt' : ''}`}
      aria-label={ariaLabel}
    >
      {absaetze.map((roh, i) => {
        const text = heutigerName(roh);
        return (
          <p
            key={ROLLE[i] ?? `absatz-${i}`}
            className={`qm-wortlaut__absatz qm-wortlaut__absatz--${ROLLE[i] ?? 'grund'}`}
          >
            {text}
          </p>
        );
      })}
    </section>
  );
}

export default QiMasterWortlaut;
