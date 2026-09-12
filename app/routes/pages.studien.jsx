import {StudienUebersicht} from '~/components/studien/StudienUebersicht';
import {STUDIEN, zahlwort, untersuchteProdukte} from '~/data/studien';
import {übersichtSchema} from '~/lib/studien-schema';
import {buildFaqPageJsonLd} from '~/lib/faq-schema';
import {
  EVIDENZSTUFE_SOLL,
  evidenzstufeSchemaItems,
} from '~/data/studien-evidenzstufe';
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
      `${zahlwort(STUDIEN.length).replace(/^./, (c) => c.toUpperCase())} ` +
      'zellbiologische Fachpublikationen zu QiOne® 2 Pro, QiBracelet® und ' +
      'QiHome® Air — mit Zusammenfassung, deutschem Volltext und Original-PDF.',
  },
  {property: 'og:url', content: absoluteCanonical(PFAD)},
  {'script:ld+json': übersichtSchema(STUDIEN, untersuchteProdukte())},
  ...faqEintrag(),
];

/** Genau EIN Aufbau des Schemas je Aufruf — sonst baut die Meta-Liste dasselbe
 *  Objekt zweimal (einmal fuer die Bedingung, einmal fuer den Wert). */
function faqEintrag() {
  const schema = evidenzstufeSchema();
  return schema ? [{'script:ld+json': schema}] : [];
}

/**
 * DAS ZWEITE ld+json DIESER SEITE: die Evidenzstufe als FAQPage, gebaut aus
 * DEMSELBEN Text, den `Evidenzstufe` in StudienUebersicht.jsx rendert
 * (app/data/studien-evidenzstufe.js). Eine Frage im Schema, die auf der Seite
 * nicht steht, wäre ein Regelverstoß — deshalb gibt es keine zweite
 * Textfassung. Zwei JSON-LD-Blöcke auf einer Seite sind zulässig; der erste
 * (CollectionPage/ItemList) beschreibt die Sammlung, dieser die Antwort.
 *
 * DER STILLE VERLUST IST DER TEURE FALL: `buildFaqPageJsonLd` wirft Items aus,
 * die sein Deny-Netz treffen (etwa das Wort „kohärent"), und liefert dann
 * einfach ein kürzeres Schema — die Seite bliebe sichtbar und würde nur für
 * eine Maschine ärmer, ohne Fehlermeldung. Deshalb der SOLL-ZÄHLER: fällt auch
 * nur ein Paar durch, wird GAR KEIN FAQ-Schema ausgegeben, statt ein
 * unvollständiges auszuliefern, das wie ein vollständiges aussieht. Gegenprobe
 * am Live-Rand: homepage-bauer/pruefungen/probe_zitierfaehige_evidenzstufe.py.
 */
function evidenzstufeSchema() {
  const items = evidenzstufeSchemaItems();
  if (items.length !== EVIDENZSTUFE_SOLL) return null;
  const schema = buildFaqPageJsonLd(items, {
    inLanguage: 'de-DE',
    author: 'Qi Blanco',
  });
  if (!schema || schema.mainEntity.length !== EVIDENZSTUFE_SOLL) return null;
  return schema;
}

export function loader() {
  return {};
}

export default function StudienPage() {
  return <StudienUebersicht />;
}
