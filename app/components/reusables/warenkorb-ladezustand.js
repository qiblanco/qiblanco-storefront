// LADEZUSTAND DES WARENKORB-FENSTERS (Prio-1-Auftrag vom 24.11.2026).
// Christian 24.11.2026: „Also das Warenkorbfenster
// springt auf, dann ist es leer und dann wird es angezeigt erst.“
//
// URSACHE, gemessen am 24.11. auf qiblanco.com (Handy 390 px, leerer Korb):
// jeder Kaufknopf ruft open('cart') im CLICK, das Hinzufügen startet erst im
// SUBMIT danach. Das Fenster stand offen, bevor der LinesAdd-Fetcher
// registriert war; useOptimisticCart hatte also noch keine Zeile, und
// CartMain zeigte „Dein Warenkorb ist zurzeit leer!“ (15-200 ms im Messlauf,
// auf einem langsamen Handy länger). Ohne selectedVariant in der Zeile
// (ExclusiveSolutions, /cart/$lines) bleibt das Fenster sogar bis zur
// Server-Antwort leer (1,4-2,3 s gemessen).
//
// DIE REGEL: solange ein Hinzufügen läuft, zeigt das leere Fenster einen
// Ladezustand statt „leer“. „Läuft“ hat zwei Quellen, die einander die Lücke
// abnehmen:
//   1. der Klick auf einen Hinzufügen-Knopf (vor dem Fetcher, schließt die
//      Lücke zwischen click und submit) — mit Frist, damit ein Klick, aus dem
//      nie ein Hinzufügen wird, den Zustand nicht festhält;
//   2. ein LinesAdd-Fetcher, der nicht idle ist (deckt die Serverzeit).
// Endet der Fetcher, endet auch der Klick-Zustand: schlug das Hinzufügen fehl,
// ist „leer“ dann die Wahrheit.

/** Name des versteckten Felds, das Hydrogens CartForm schreibt (CartForm.INPUT_NAME). */
export const CART_FORM_FELD = 'cartFormInput';

/** Höchstdauer des Klick-Zustands ohne Fetcher (ms). */
export const KLICK_FRIST_MS = 8000;

/** Liest die CartForm-Aktion aus einem Formularfeldwert; nie wirft. */
export function aktionAusFeldwert(wert) {
  if (typeof wert !== 'string' || !wert) return null;
  try {
    const daten = JSON.parse(wert);
    return typeof daten?.action === 'string' ? daten.action : null;
  } catch {
    return null;
  }
}

/** Ist dieser Fetcher (aus useFetchers) ein laufendes LinesAdd? */
export function istLaufendesHinzufuegen(fetcher) {
  if (!fetcher || fetcher.state === 'idle') return false;
  const formData = fetcher.formData;
  if (!formData || typeof formData.get !== 'function') return false;
  return aktionAusFeldwert(formData.get(CART_FORM_FELD)) === 'LinesAdd';
}

/**
 * Ist das Klickziel ein Hinzufügen-Knopf? Ja für jeden Knopf mit
 * data-qb-kaufknopf (AddToCartButton) und für jeden Absendeknopf eines
 * CartForm-Formulars mit Aktion LinesAdd (ExclusiveSolutions u. a.).
 * Gesperrte Knöpfe zählen nicht.
 */
export function istHinzufuegenKlick(ziel) {
  const knopf = ziel?.closest?.('button, input[type="submit"]');
  if (!knopf || knopf.disabled) return false;
  if (knopf.hasAttribute?.('data-qb-kaufknopf')) return true;
  const typ = String(knopf.getAttribute?.('type') || 'submit').toLowerCase();
  if (typ !== 'submit') return false;
  const feld = knopf.form?.querySelector?.(`input[name="${CART_FORM_FELD}"]`);
  return aktionAusFeldwert(feld?.value) === 'LinesAdd';
}

/** Was zeigt das Fenster? 'zeilen' | 'ladezustand' | 'leer'. */
export function fensterZustand({zeilen, fetcherLaeuft, klickLaeuft}) {
  if (zeilen > 0) return 'zeilen';
  if (fetcherLaeuft || klickLaeuft) return 'ladezustand';
  return 'leer';
}
