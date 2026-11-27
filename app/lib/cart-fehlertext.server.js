/**
 * WARENKORB-FEHLERTEXT SICHTBAR (Vorgang EL-20261127-8fe7809a, devlog F-3008).
 *
 * Zweimal fiel auf qiblanco.com die Warenkorb-Neuanlage über Oxygen aus
 * (18.11. 21:58-22:40Z, 27.11. ca. 03:00-04:00Z). Beide Male stand in der
 * Antwort nur `errors: [SanitizedError "Unexpected Server Error"]`: Hydrogen
 * liefert GraphQL-Fehler der Storefront-API als `GraphQLError`-Instanzen
 * (Unterklasse von Error), und React Router ersetzt jede Error-Instanz in den
 * Daten einer Produktions-Antwort durch genau diesen Satz. Der eigentliche
 * Wortlaut der Storefront-API (Meldung, Code, Request-ID) ging damit verloren,
 * und Oxygen-Protokolle liest der Server nicht.
 *
 * Dieses Modul macht daraus schlichte Objekte, die die Serialisierung
 * unverändert überleben. Es ändert nichts am Warenkorb: dieselbe Anzahl
 * Einträge, alle Leser im Repo prüfen nur `errors?.length`.
 *
 * Was mitgeht: `message` (bei GraphQLError mit Präfix
 * `[h2:error:storefront.mutation]` und ` - Request ID: …`), `code` aus
 * `extensions.code`, `path`. Was NIE mitgeht: `cause` (trägt die ganze Query
 * samt Variablen, also Warenkorb-Merkmale und Tracking-Werte), `locations`,
 * `stack`, Kopfzeilen, Tokens. Jeder Text ist auf 300 Zeichen gekappt.
 *
 * RÜCKWEG: in cart.jsx `fehlerAlsDaten(errors)` wieder durch `errors`
 * ersetzen, in cart.$lines.jsx das `headers`-Feld am 410 entfernen.
 */

export const FEHLER_KOPF = 'x-qb-cart-fehler';
export const MAX_ZEICHEN = 300;
// Shopify antwortet im Markt DE auf Deutsch ("existiert nicht", "für").
const UMSCHRIFT = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  Ä: 'Ae',
  Ö: 'Oe',
  Ü: 'Ue',
  ß: 'ss',
  '…': '...',
};

function kappen(text) {
  const s = typeof text === 'string' ? text : String(text ?? '');
  return s.length > MAX_ZEICHEN ? `${s.slice(0, MAX_ZEICHEN - 1)}…` : s;
}

function pfad(wert) {
  if (!Array.isArray(wert)) return null;
  return wert
    .slice(0, 12)
    .map((teil) => (typeof teil === 'number' ? teil : kappen(teil).slice(0, 80)));
}

/**
 * Error-Instanzen (und alles andere) -> {message, code, path} mit
 * String-/Zahl-Feldern. `undefined`/`null` bleiben, wie sie sind: der
 * Aufrufer soll keinen leeren Fehler-Array erfinden, wo keiner war.
 * @param {unknown} errors
 * @returns {Array<{message: string, code: string|null, path: Array<string|number>|null}>|undefined|null}
 */
export function fehlerAlsDaten(errors) {
  if (errors == null) return errors;
  const liste = Array.isArray(errors) ? errors : [errors];
  return liste.map((fehler) => {
    // GraphQLError: extensions.code; userErrors der Storefront-API: code/field.
    const code = fehler?.extensions?.code ?? fehler?.code;
    return {
      message: kappen(
        typeof fehler === 'string' ? fehler : (fehler?.message ?? fehler),
      ),
      code: code == null ? null : kappen(code),
      path: pfad(fehler?.path ?? fehler?.field),
    };
  });
}

/**
 * Eine Zeile für die Kopfzeile x-qb-cart-fehler: zuerst `errors`
 * (GraphQL-Ebene), sonst `userErrors` (z. B. ungültige Variante — auch das
 * endet am Permalink in 410). Nur druckbares ASCII (Umlaute umschrieben), damit
 * der Headers-Konstruktor nie wirft und aus einem 410 kein 500 wird.
 * @param {{errors?: unknown, userErrors?: unknown}|null|undefined} result
 * @returns {string|null}
 */
export function fehlerKopfwert(result) {
  try {
    const quelle = result?.errors?.length
      ? result.errors
      : result?.userErrors?.length
        ? result.userErrors
        : null;
    if (!quelle) return null;
    const teile = fehlerAlsDaten(quelle).map((f) =>
      [f.code, f.message].filter(Boolean).join(': '),
    );
    const zeile = kappen(teile.join(' | '))
      .replace(/[äöüÄÖÜß…]/g, (z) => UMSCHRIFT[z])
      .replace(/[^\x20-\x7E]/g, '?');
    return zeile || null;
  } catch {
    return null;
  }
}
