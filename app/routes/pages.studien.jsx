import {STUDIEN, zahlwort, untersuchteProdukte} from '~/data/studien';
import {übersichtSchema} from '~/lib/studien-schema';
import {StudienUebersicht} from '~/components/studien/StudienUebersicht';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import studienStyles from '~/styles/studien.css?url';
import {MARKE, teilbildTags} from '~/lib/seiten-seo';

const PFAD = '/pages/studien';

export function links() {
  return [{rel: 'stylesheet', href: studienStyles}];
}

/**
 * DER TITEL BLEIBT WORTGLEICH, DIE BESCHREIBUNG NICHT MEHR. Bis zum
 * 2026-09-14 stand hier „Titel UND Beschreibung bleiben wortgleich": diese
 * Seite stand am 2026-08-14 auf Platz 1 für "Qi Blanco Studien" und Platz 3
 * für "Qi Blanco" (seo.db, Lauf 2026-W33), und ein Titelwechsel wäre ein
 * Experiment mit einer Position, die wir schon haben. Für den `title` gilt
 * das unverändert — er trägt die gemessenen Positionen und wird nicht
 * angefasst.
 *
 * DIE BESCHREIBUNG IST AM 2026-09-14 GEÄNDERT WORDEN, zusammen mit der H1
 * (Job 20260914-studien-h1-sagt-was-die-eigene-antwortseite-verbietet-prio12).
 * Beide trugen wortgleich „Wissenschaftlich getestet und in Fachpublikationen
 * bestätigt" — eine Aussage, die über der Evidenzstufe dieser Seite liegt.
 * Vier der fünf Arbeiten sind In-vitro-Studien an Zellkulturen, die fünfte
 * wertet 171 Erfahrungsberichte deskriptiv aus; eine Publikation ist zudem
 * keine Bestätigung. /pages/kritik trägt dieselbe Hausregel als Bauvorschrift:
 * „Wer hier je ‚wissenschaftlich bestätigt' o. ä. einbaut, bricht die Seite
 * von der anderen Seite her auf."
 *
 * DER TAUSCH IN DREI WORTEN: „getestet" → „gemessen" (getestet klingt nach
 * Produktprüfung mit Zertifikat), „bestätigt" → „veröffentlicht" (eine
 * Publikation bestätigt nichts), und „an Zellkulturen" neu dazu, damit die
 * Evidenzstufe in der Überschrift selbst steht. Das Wort „Fachjournalen" ist
 * enger als „Fachpublikationen" und deshalb geprüft: alle fünf Arbeiten
 * tragen ein Journal in `eckdaten.journal`.
 *
 * DER CANONICAL, aus dem Bau davor: er stand als
 * `{rel:'canonical', href:'/pages/studien'}` ohne `tagName` in der Datei und
 * rendert so als `<meta rel="canonical">` — eine Form, die Google
 * vollständig ignoriert (Befund L11; live gemessen: `canonical_link: null`,
 * `canonical_meta_kaputt: true`). `canonicalLink()` liefert das korrekte
 * `<link rel="canonical">` mit absoluter URL.
 */
export const meta = () => [
  {title: 'Wissenschaftliche Studien | Qi Blanco'},
  {
    name: 'description',
    content:
      'Wirkung an Zellkulturen gemessen, in Fachjournalen veröffentlicht. Zellstudien zum QiOne® 2 Pro an Immunzellen, Darmzellen und oxidativem Stress.',
  },
  canonicalLink(PFAD),
  ...teilbildTags(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: 'Wissenschaftliche Studien | Qi Blanco'},
  {
    property: 'og:description',
    content:
      `${zahlwort(STUDIEN.length).replace(/^./, (c) => c.toUpperCase())} ` +
      'zellbiologische Fachpublikationen zu QiOne® 2 Pro, QiBracelet® und ' +
      'QiHome® Air — mit Zusammenfassung, deutschem Volltext und Original-PDF.',
  },
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {property: 'og:site_name', content: MARKE},
  {'script:ld+json': übersichtSchema(STUDIEN, untersuchteProdukte())},
];

export function loader() {
  return {};
}

export default function StudienPage() {
  return <StudienUebersicht />;
}
