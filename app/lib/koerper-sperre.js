/**
 * Die Körpersperre: welcher Satz darf in FAQPage und DefinedTerm, wenn eine
 * Seite über kohärentes Wasser oder über ein fremdes Gerät spricht?
 * Reine Datenfabrik ohne Import, damit `node --test` sie direkt laden kann.
 *
 * EIN VOKABULAR, EINE STELLE (seit 2026-11-13, Auftrag 20261113-koerpersperre-
 * healy-zweite-kopie). Bis dahin standen zwei Literal-Listen im Repo:
 * app/data/wasser-infoseite.js (acht Muster, seit 2026-09-24) und eine Abschrift
 * in app/components/campaign/HealyAlternativeSeite.jsx (sechs Muster, seit
 * 2026-10-07, ohne „vor Viren" und „schützt dich vor"; einen Grund für die zwei
 * fehlenden Muster nennt weder der Code noch das Segment-RESULT). Als die
 * Wasser-Liste am 2026-11-13 um Entgiften und Körperwort + Wirkverb wuchs, blieb
 * die Abschrift stehen, und „damit deine Zellen besser entgiften" lief auf der
 * Healy-Seite weiter durch. Heute importieren beide Seiten von hier;
 * hexagonales-wasser-seite.js holt sie über wasser-infoseite.js.
 *
 * WARUM EIN EIGENES MODUL und kein Import aus wasser-infoseite.js: die Healy-
 * Route braucht die Sperre auch im Browser (meta() baut das JSON-LD), und der
 * Import hätte den ganzen Inhalt der Wasser-Seite mitgezogen. Gemessen am Build
 * vom 2026-11-13: der Chunk mit wasser-infoseite.js wiegt 18,7 KB gzip, die
 * Healy-Route selbst 6,3 KB gzip.
 *
 * GL-SPR-0008 als Sperre an der Stelle, an der Text maschinenlesbar wird.
 * ANDERS als app/lib/faq-schema.js: dort sperrt die Produkt-FAQ-Leitplanke
 * (Juli 2026) das Wort „kohärent" selbst und jede Nanometer-Angabe, dazu
 * „energetisch". Auf einer Seite, deren Gegenstand kohärentes Wasser ist, bliebe
 * damit nichts übrig, und Christians Auftrag verlangt FAQPage und DefinedTerm.
 * Auf der Healy-Seite würde dasselbe Netz Fragen zu Healys „bioenergetischem
 * Feld" still verschlucken. Die Sperre hier sitzt deshalb auf dem, was die Regel
 * meint: Heil- und Körperschutzzusagen. Trifft sie, fliegt der Eintrag aus dem
 * Schema, und der Test bzw. die Probe der Seite wird rot (nichts fällt still weg).
 *
 * LÜCKE GESCHLOSSEN 2026-11-13 (Auftrag 20261111-koerpersperre-istschemasicher-
 * luecke-entgiften): die acht festen Wendungen fingen den Satz „Trink
 * hexagonales Wasser, damit deine Zellen besser entgiften." nicht, ebenso wenig
 * „reinigt deine Zellen", „regeneriert deinen Körper", „stärkt deine
 * Abwehrkräfte". `/entgift/` und `/detox/` stehen im Produkt-FAQ-Netz längst.
 * Neu sind deshalb (a) dieselben Detox-Wörter und (b) ein Körperwort und ein
 * Wirkverb im selben Satz, höchstens 40 Zeichen auseinander, in beiden
 * Reihenfolgen.
 *
 * WAS DIE SPERRE ABSICHTLICH NICHT FÄNGT (gemessen an allen 463 Textblättern von
 * wasser-infoseite.js, hexagonales-wasser-seite.js und lexikon.js und allen 153
 * Textblättern der Healy-Seite, 0 Treffer):
 *  - „kohärent", „hexagonal", Nanometer: das ist der Gegenstand der Seiten.
 *  - Das Körperwort ohne Wirkverb: „Wasser im Körper", „an Zellen im Labor",
 *    „die Wärmestrahlung der Haut", „wie der Körper Energie umsetzt", „am
 *    Körper getragen". Das sind Physik, Versuchsbeschreibung und Trageweise,
 *    keine Zusage.
 *  - „stärker", „am stärksten", „Feldstärke": das Verbmuster verlangt die
 *    Verbform (stärkt, stärken) am Wortanfang.
 *  - „Schutz vor Strahlung" (das Kundenwort): das Verbmuster verlangt „schütz".
 * BEKANNTE GRENZE, kein Freibrief: eine Wirkzusage ganz ohne Körperwort („macht
 * dich wacher", „gibt dir Energie") fängt dieses Wortnetz nicht. Sie bleibt
 * Sache des Schreibenden und des Stil-Tors.
 *
 * WER HIER EIN MUSTER ÄNDERT, misst vorher alle Nutzer: `git grep -n
 * koerper-sperre app` zeigt sie, und test/koerper-sperre.test.mjs hält fest,
 * dass keine Datei unter app/ eine zweite Liste führt.
 */
const KOERPER_WORT =
  '(?:\\bZellen?\\b|\\bK(?:ö|oe)rpers?\\b|\\bOrganismus\\b|\\bImmunsystems?\\b|' +
  'Abwehrkr(?:ä|ae)fte|Selbstheilung\\w*|\\bDarm\\w*|\\bLeber\\b|\\bNieren?\\b|' +
  '\\bHaut\\b|\\bGehirns?\\b|\\bNerven\\w*|\\bStoffwechsels?\\b|\\bBlut\\b|' +
  '\\bOrgane?\\b|\\bGewebe\\b)';
const WIRK_VERB =
  '(?:\\breinig\\w*|\\bregenerier\\w*|\\bverj(?:ü|ue)ng\\w*|\\brevitalisier\\w*|' +
  '\\baktivier\\w*|\\bst(?:ä|ae)rk(?:t|en|e|st)\\b|\\bentschlack\\w*|' +
  '\\bversorg\\w*|\\bbeleb\\w*|\\berneuer\\w*|\\bkr(?:ä|ae)ftig\\w*|' +
  '\\bentlast\\w*|\\bsch(?:ü|ue)tz\\w*)';
const NAH = '[^.!?]{0,40}?';

export const KOERPER_SPERRE = [
  /st(ä|ae)rk\w* (dein|das|ihr|unser) Immunsystem/i,
  /sch(ü|ue)tz\w* (deine |die |unsere )?Zellen/i,
  /vor Viren/i,
  /\bheil(t|en|ung|end)\b/i,
  /verhinder\w* Krankheit/i,
  /sch(ü|ue)tz\w* (dich|deinen K(ö|oe)rper) vor/i,
  /Therapie|therapeut/i,
  /Krankheit|Erkrankung/i,
  /entgift|\bdetox/i,
  new RegExp(`${KOERPER_WORT}${NAH}${WIRK_VERB}|${WIRK_VERB}${NAH}${KOERPER_WORT}`, 'i'),
];

/**
 * Darf dieser Text in die strukturierten Daten?
 * @param {string} text Frage und Antwort zusammen (`${q}\n${a}`) oder eine Definition
 * @returns {boolean} false, sobald ein Muster trifft
 */
export function istSchemaSicher(text) {
  return !KOERPER_SPERRE.some((rx) => rx.test(String(text)));
}
