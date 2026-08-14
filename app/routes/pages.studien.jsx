import {StudienUebersicht} from '~/components/studien/StudienUebersicht';
import {STUDIEN} from '~/data/studien';
import {übersichtSchema} from '~/lib/studien-schema';
import {canonicalLink, absoluteCanonical} from '~/lib/seo';
import studienStyles from '~/styles/studien.css?url';

const PFAD = '/pages/studien';

export function links() {
  return [{rel: 'stylesheet', href: studienStyles}];
}

/**
 * TITEL UND BESCHREIBUNG BLEIBEN WORTGLEICH. Diese Seite stand am 2026-08-14
 * auf Platz 1 für "Qi Blanco Studien" und Platz 3 für "Qi Blanco"
 * (seo.db, Lauf 2026-W33). Ein Titelwechsel wäre ein Experiment mit einer
 * Position, die wir schon haben.
 *
 * GEAENDERT wurde genau eine Zeile: der Canonical. Er stand als
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
      'Wissenschaftlich getestet und in Fachpublikationen bestätigt. Zellstudien zur Wirkung des QiOne® 2 Pro auf Immunzellen, Darmzellen und oxidativen Stress.',
  },
  canonicalLink(PFAD),
  {property: 'og:type', content: 'website'},
  {property: 'og:title', content: 'Wissenschaftliche Studien | Qi Blanco'},
  {
    property: 'og:description',
    content:
      'Vier zellbiologische Fachpublikationen zu QiOne® 2 Pro und QiBracelet® — mit Zusammenfassung, deutschem Volltext und Original-PDF.',
  },
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {'script:ld+json': übersichtSchema(STUDIEN)},
];

export function loader() {
  return {};
}

export default function StudienPage() {
  return <StudienUebersicht />;
}
