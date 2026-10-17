/**
 * JSON-LD für die Frageseiten (`FAQPage` je Seite).
 * Reine Datenfabrik ohne React-Import — `node --test` kann sie direkt laden,
 * wie faq-schema.js, lexikon-schema.js und studien-schema.js.
 *
 * ── GENAU EINE FRAGE JE SEITE, UND DAS IST DER GANZE PUNKT ────────────────
 *
 * Ein Antwortsystem schneidet Texte in Abschnitte und bewertet sie ISOLIERT
 * (Chunk-Autarkie). Eine FAQPage mit zwölf Fragen liefert zwölf Kandidaten,
 * die um dieselbe URL konkurrieren; keiner von ihnen ist für sich die Antwort
 * auf die Frage, unter der jemand gesucht hat. Eine Seite, deren Adresse, deren
 * Überschrift und deren einzige `Question` dieselbe Frage tragen, ist es.
 *
 * Deshalb ist die Bestands-FAQ (`/pages/faq`, viele Fragen auf einer Seite)
 * hier KEIN Vorbild und wird auch nicht abgelöst: sie bedient den Menschen, der
 * blättert. Diese Seiten bedienen die Frage, die jemand gestellt hat.
 *
 * NACHTRAG 2026-10-16, DIE 1-FRAGE-FAQPAGE FÜR DIE FAMILIE ENTSCHIEDEN
 * (Auftrag 20261016-seo-duenne-vorlagenseiten-zweiter-schnitt-serioes-und-
 * familie): Die Hauptfrage bleibt die erste `Question`, und eine Seite mit
 * genau einer sichtbaren Frage behält genau eine. Belegt am 16.10.: alle drei
 * verbliebenen Frageseiten mit 1-Frage-FAQPage sind indexiert, zwei tragen
 * Impressionen auf Platz ≤ 10. Strukturierte Daten trennen Gewinner nicht von
 * Verlierern (Musterregel 6 der Gewinner-Analyse, Konfidenz hoch). Neu ist nur,
 * dass das Schema JEDE sichtbare Frage trägt: Setzt eine Seite `teilfragen`,
 * stehen diese als Zwischenüberschriften auf der Seite und als weitere
 * `Question` im Schema, je mit ihrem Absatz als Antwort (Musterregel 5:
 * FAQPage nur mit allen sichtbaren Fragen). Jeder Abschnitt bleibt für sich
 * die Antwort auf seine Frage. Die Chunk-Autarkie gilt also weiter.
 *
 * ── DAS SCHEMA WIRD AUS DEM SICHTBAREN TEXT GEBAUT, NICHT DANEBEN ─────────
 *
 * `name` ist `seite.frage` — derselbe String, den die Route als H1 rendert.
 * `acceptedAnswer.text` ist `seite.antwort` — derselbe Satz, den die Seite als
 * ersten Absatz zeigt. Markup, das etwas anderes sagt als die Seite, ist die
 * schlechteste aller Welten: es ist als Täuschung angreifbar und als Inhalt
 * wertlos. Der Test hält die beiden Felder gegen die Komponente.
 *
 * ── DAS DENY-NETZ: GEERBT, UNVERÄNDERT, UND DAS IST GEMESSEN ──────────────
 *
 * `buildFaqPageJsonLd` kommt aus faq-schema.js (P10 — ein Vokabular, nicht
 * zwei). Es prüft `q\na`, also genau das Paar, das hier ins Schema geht.
 *
 * Das Lexikon musste das Netz SCHÄRFEN, weil dort der Begriff selbst das
 * Stichwort eines Eintrags ist. Hier war das zu prüfen und nicht zu vermuten
 * (2026-09-16, alle sechs Seiten gegen alle zehn Muster, getrennt nach
 * Schema-Paar und Fließtext):
 *
 *   * Im SCHEMA-PAAR (`frage` + `antwort`) trifft KEIN Muster. Alle sechs
 *     Seiten gehen unverändert durch das geerbte Netz.
 *   * Im FLIESSTEXT trifft genau eine Seite auf genau einem Muster —
 *     `/koh(ä|ae)rent/` auf /pages/was-sagen-die-quarks-science-cops, wo der
 *     Begriff als Gegenstand der Kritik vorkommt. Dieser Text steht NICHT im
 *     Schema und wird deshalb auch nicht davon berührt.
 *
 * Eine Schärfung wäre hier also eine Lockerung ohne Anlass gewesen.
 * faq-schema.js bleibt unangetastet.
 *
 * ── DER STILLE VERLUST IST DER TEURE FALL ─────────────────────────────────
 *
 * `buildFaqPageJsonLd` liefert `null`, wenn kein sauberes Item übrig bleibt —
 * ohne Fehlermeldung. Die Seite bliebe sichtbar und würde nur für Maschinen
 * ärmer. Dagegen steht test/fragen-vollstaendigkeit.test.mjs, und zwar OHNE
 * gepinnte Zahl: er vergleicht die Zahl der Question-Knoten gegen
 * `FRAGEN.length`. `warumKeinSchema()` liefert dazu die BEGRÜNDUNG, damit ein
 * Ausschluss nie nur eine fehlende Zahl ist.
 */

import {
  FORBIDDEN_PATTERNS,
  buildFaqPageJsonLd,
} from './faq-schema.js';
import {absoluteCanonical} from './seo.js';
import {MARKE} from './seiten-seo.js';

/**
 * WO DIE FRAGESEITEN GESAMMELT STEHEN. Bis 2026-09-25 war das der eigene Hub
 * /pages/fragen; seither ist es der Abschnitt `#einzelfragen` der FAQ
 * (Auftrag 20260926-seo-duenne-vorlagenseiten-aufwerten-oder-zusammenfuehren,
 * Begründung im Kopf von app/routes/pages.fragen.jsx, die per 301 dorthin
 * führt). Brotkrume der Frageseiten, Weiterleitung und Abschnitt lesen beide
 * Werte von hier — ein Umzug ist eine Zeile, nicht drei.
 */
export const HUB_PFAD = '/pages/faq';
export const HUB_ANKER = 'einzelfragen';

/** Ein Satz? Der Antwort-zuerst-Vertrag in einer Zeile. */
const SATZ_ENDE = /[.!?]["»„]?\s+\S/;

/**
 * Warum landet diese Seite NICHT im FAQPage-Schema? Leeres Array = sie landet
 * darin. Das Ergebnis ist die BEGRÜNDUNG eines Ausschlusses und wird vom Test
 * ausgegeben — ein Ausschluss ohne Grund wäre ein stiller Verlust.
 * @param {object} s
 * @returns {string[]}
 */
export function warumKeinSchema(s) {
  if (!s || typeof s.frage !== 'string' || !s.frage.trim()) {
    return ['(kein Feld `frage`)'];
  }
  if (typeof s.antwort !== 'string' || !s.antwort.trim()) {
    return ['(kein Feld `antwort` — eine Frageseite ohne Antwort wäre eine Hülle)'];
  }
  const paar = `${s.frage}\n${s.antwort}`;
  return FORBIDDEN_PATTERNS.filter((re) => re.test(paar)).map((re) => re.source);
}

/**
 * Trägt das Antwort-Feld GENAU EINEN Satz? Der Vertrag stammt aus s05
 * (`bau_fragen.py` fällt rot, sobald es zwei sind: zwei Sätze sind bereits
 * eine Begründung). Er wird hier ein zweites Mal geprüft, weil das Datenmodul
 * und der Erzeuger seit dem Bau getrennte Wege gehen.
 * @param {object} s
 */
export function antwortIstEinSatz(s) {
  return !SATZ_ENDE.test(String(s?.antwort || '').trim());
}

/**
 * Die sichtbaren Teilfragen einer Seite als Paare (Frage, Absatz darunter).
 * `teilfragen[i]` gehört zum Begründungsabsatz an derselben Stelle; leer heißt: über
 * diesem Absatz steht keine Frage.
 * @param {object} s
 * @returns {Array<{q: string, a: string}>}
 */
export function teilfragenPaare(s) {
  const {"begruendung": absaetze = []} = s || {};
  const fragen = Array.isArray(s?.teilfragen) ? s.teilfragen : [];
  return absaetze
    .map((a, i) => ({q: fragen[i], a}))
    .filter((p) => typeof p.q === 'string' && p.q.trim() && typeof p.a === 'string');
}

/**
 * Warum fällt eine Teilfrage aus dem Schema? Liefert je ausgeschlossener
 * Teilfrage `{frage, muster}`. Leer = alle sichtbaren Teilfragen stehen im
 * Schema. Der Test verlangt leer: eine sichtbare Frage, die still aus dem
 * Markup fällt, wäre der stille Verlust von oben.
 * @param {object} s
 */
export function warumTeilfrageOhneSchema(s) {
  return teilfragenPaare(s)
    .map((p) => ({
      frage: p.q,
      muster: FORBIDDEN_PATTERNS.filter((re) => re.test(`${p.q}\n${p.a}`)).map((re) => re.source),
    }))
    .filter((x) => x.muster.length > 0);
}

/**
 * `FAQPage` mit der Hauptfrage als erster `Question` — oder null, wenn das
 * geerbte Deny-Netz auf dem Hauptpaar greift. Trägt die Seite sichtbare
 * Teilfragen (Feld `teilfragen`), folgen sie als weitere `Question`, jede mit
 * ihrem Absatz als Antwort: das Schema trägt alle sichtbaren Fragen der Seite
 * und keine unsichtbare (Musterregel 5 und 6 der Gewinner-Analyse).
 * @param {object} s
 * @param {{datePublished?: string, dateModified?: string}} [datum]
 * @returns {object|null}
 */
export function frageSchema(s, datum = {}) {
  if (warumKeinSchema(s).length > 0) return null;
  const schema = buildFaqPageJsonLd([{q: s.frage, a: s.antwort}, ...teilfragenPaare(s)], {
    inLanguage: 'de-DE',
    author: MARKE,
    ...(datum.datePublished ? {datePublished: datum.datePublished} : {}),
    ...(datum.dateModified ? {dateModified: datum.dateModified} : {}),
  });
  if (!schema) return null;
  return {...schema, '@id': `${absoluteCanonical(s.pfad)}#frage`, url: absoluteCanonical(s.pfad)};
}
