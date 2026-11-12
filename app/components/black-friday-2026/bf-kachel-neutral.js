/*
 * STUDIEN NEUTRAL AUF DEN BF-SEITEN (Elina EL-20261112-0a9978b4, Punkt 1).
 * Wortlaut: „‚Prof. Dr. Peter C. Dartsch‘ bzw. ‚Dartsch‘ in TEXTEN ÜBERALL
 * entfernen – Deal-Seiten, bf-deals, Pre-Access [...] Studien-Kacheln. Neutral
 * und sachlich als UNSERE Studien formulieren (Qi Blanco hat sie in Auftrag
 * gegeben) [...] Zahlen und Link zur Studie bleiben, keine Personen- oder
 * Institutsnamen im Fließtext. Das Siegel auf Produktbildern darf bleiben.“
 *
 * Die Deal-Seiten zeigen die Wissens-Kacheln ihrer Basisprodukte
 * (*-alpha-daten.js). Hier wird nur die Fassung der Deal-Seite neutral, die
 * normalen Produktseiten bleiben unberührt. Bekannte Sätze bekommen Elinas
 * Formulierung („In unserer Laborstudie …“), Quellenzeilen verlieren den
 * Autor (Titel, Zeitschrift, Jahr und DOI bleiben). Ein Satz, der danach
 * noch einen Namen trägt, fällt weg.
 */

export const STUDIEN_NAMEN = /dartsch/i;

const ERSATZ = new Map([
  [
    'Prof. Dr. Peter C. Dartsch hat menschliche Immunzellen im Labor vier Stunden lang mit Handystrahlung belastet.',
    'In unserer Laborstudie wurden menschliche Immunzellen vier Stunden lang Handystrahlung ausgesetzt.',
  ],
  [
    'Ohne QiOne® 2 Pro behielten sie 60,5 Prozent ihrer Abwehrleistung, mit ihm 84,7 Prozent.',
    'Ohne QiOne® 2 Pro behielten sie 60,5 % ihrer Abwehrleistung, mit ihm 84,7 %.',
  ],
  [
    'Prof. Dr. Peter C. Dartsch hat das QiBracelet® im Labor an fünf Typen menschlicher Zellen getestet. Er setzte sie oxidativem Stress aus.',
    'In unserer Laborstudie wurde das QiBracelet® an fünf Typen menschlicher Zellen getestet, die oxidativem Stress ausgesetzt waren.',
  ],
  [
    'Prof. Dr. Peter C. Dartsch hat das QiHome® Air an menschlichen Nervenzellen getestet.',
    'In unserer Laborstudie wurde das QiHome® Air an menschlichen Nervenzellen getestet.',
  ],
]);

const AUTOR_VORN = /^\s*(?:Prof\.\s*)?(?:Dr\.\s*)?(?:Peter\s+C\.\s*|P\.\s*C\.\s*)?Dartsch(?:,?\s*P\.?\s*C\.?|\s+PC)?(?:\s+et\s+al\.?)?\s*(?:\(\d{4}\))?\s*[:.,]\s*/i;
const SATZENDE = /(?<=[.!?])(?<!\bProf\.)(?<!\bDr\.)(?<!\b[A-Z]\.)\s+(?=[A-ZÄÖÜ0-9„"])/;

/** Ein Text der Kachel: bekannter Satz -> Elinas Fassung, Quellenzeile ohne Autor, Rest-Satz mit Namen weg. */
export function textNeutral(t) {
  if (typeof t !== 'string' || !STUDIEN_NAMEN.test(t)) return ERSATZ.get(t) ?? t;
  if (ERSATZ.has(t)) return ERSATZ.get(t);
  const ohneAutor = t.replace(AUTOR_VORN, '');
  if (!STUDIEN_NAMEN.test(ohneAutor)) return ohneAutor;
  return t
    .split(SATZENDE)
    .map((s) => ERSATZ.get(s) ?? s)
    .filter((s) => !STUDIEN_NAMEN.test(s))
    .join(' ');
}

function tief(x) {
  if (typeof x === 'string') return textNeutral(x);
  if (Array.isArray(x)) return x.map(tief).filter((s) => s !== '');
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, tief(v)]));
  return x;
}

/** Daten eines Basisprodukts (Modul-Namensraum) -> dieselben Daten, WISSEN neutral. */
export function datenStudienNeutral(daten) {
  if (!daten?.WISSEN) return daten;
  return {...daten, WISSEN: tief(daten.WISSEN)};
}
