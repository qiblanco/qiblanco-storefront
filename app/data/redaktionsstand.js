/**
 * REDAKTIONSSTAND der inhaltstragenden Seiten — die Quelle für `dateModified`.
 *
 * Auftrag 20260823-seo-grossjob-…-prio50, Segment s06, Backlog-Posten B-10(b).
 *
 * WARUM ES DIESE DATEI GIBT: s04 hat live gemessen, dass auf KEINER Seite der
 * Domain ein `dateModified` steht. Für eine YMYL-Domain ist das die Angabe,
 * mit der eine Suchmaschine „ist dieser Gesundheitsinhalt gepflegt oder liegt
 * er seit Jahren?" beantwortet — ohne sie muss sie raten, und sie rät
 * konservativ.
 *
 * WARUM EIN DATENMODUL UND KEIN `new Date()`: ein zur Renderzeit erzeugtes
 * Datum behauptet, der Inhalt sei HEUTE geprüft worden — bei jedem Abruf aufs
 * Neue. Das wäre keine Angabe, sondern eine automatische Lüge, und sie wäre
 * ausgerechnet auf der Fläche gelogen, auf der Vertrauen der Gegenstand ist.
 * Oxygen läuft am Edge und kann zur Laufzeit ohnehin nichts über den Bestand
 * lesen (dieselbe Begründung wie bei app/data/uebersicht-links.js).
 *
 * WOHER DIE WERTE STAMMEN — gemessen, nicht gesetzt. Jeder Eintrag ist das
 * Commit-Datum der letzten INHALTLICHEN Änderung der jeweiligen Fläche,
 * erhoben am 2026-08-24 mit
 *
 *     git log -1 --format=%cs -- <pfad der Inhaltsdatei>
 *
 * Das Kommando steht hier, damit ein Nachfolger den Wert nachrechnen kann,
 * statt ihn glauben zu müssen.
 *
 * DIE PFLEGE-REGEL, und sie ist der einzige Weg, wie diese Datei ehrlich
 * bleibt: wer den INHALT einer hier geführten Fläche ändert, ändert im selben
 * Commit ihr Datum. Wer nur Technik am Drumherum ändert (Styling, Schema,
 * Routing), ändert es NICHT — `dateModified` beschreibt den Inhalt, nicht das
 * Markup. Ein Datum, das bei jedem Deploy hochspringt, ist genauso wertlos wie
 * keines.
 *
 * DER ENFORCER dazu steht in test/redaktionsstand.test.mjs: er fängt das
 * Zukunftsdatum, die kaputte Form und — der eigentliche Punkt — den FEHLENDEN
 * Eintrag. Ein fehlender Eintrag wäre `undefined`, und `undefined` fällt beim
 * JSON-Serialisieren still aus dem Graphen: die Seite sähe im Quelltext aus
 * wie erledigte Arbeit und trüge kein `dateModified`. Genau diese Sorte
 * Defekt hat dieses Segment an einer anderen Stelle schon einmal gekostet.
 */

import {isoMitZone} from '../lib/datum.js';

/**
 * Pfad -> Datum der letzten inhaltlichen Änderung (ISO-8601, `YYYY-MM-DD`).
 * @type {Record<string, string>}
 */
export const REDAKTIONSSTAND = {
  // Neu angelegt in genau diesem Segment. Ihr Inhalt ist an diesem Tag
  // entstanden, also ist das Datum kein Schätzwert, sondern eine Tatsache.
  '/pages/ueber-uns': '2026-08-24',

  // Studien-Hub und Einzelseiten teilen sich einen Stand, weil sie sich
  // dieselbe Datenquelle teilen: app/data/studien/e000{1..5}.json wurden
  // zuletzt gemeinsam in 923c2cc geändert (2026-08-18), die rendernde
  // StudienUebersicht.jsx in fd315e2 am selben Tag.
  '/pages/studien': '2026-08-18',
  '/pages/studie-darmbarriere': '2026-08-18',
  '/pages/studie-immunzellen': '2026-08-18',
  '/pages/studie-nutzererfahrung': '2026-08-18',
  '/pages/studie-oxidativer-stress': '2026-08-18',
  '/pages/studie-qihome-air': '2026-08-18',
};

/**
 * Bequemer Zugriff für die Über-uns-Seite — MIT Zone, wie `standFuer()`.
 * Ihr einziger Verwender ist das `dateModified` im JSON-LD dieser Seite.
 */
export const STAND_ISO = standFuer('/pages/ueber-uns');

/**
 * Stand einer Fläche.
 *
 * WIRFT bei unbekanntem Pfad, statt `undefined` zurückzugeben. Das ist
 * Absicht: ein stiller `undefined` verschwindet beim Serialisieren aus dem
 * JSON-LD und hinterlässt eine Seite, die aussieht, als trüge sie ein
 * `dateModified`. Ein Fehler beim Bauen ist billiger als eine Fläche, die
 * monatelang halb ausgezeichnet ausgeliefert wird.
 *
 * WARUM DIE RÜCKGABE EINEN ZEITSTEMPEL TRÄGT UND DIE TABELLE OBEN NICHT
 * (Job 20260913-REPAIR-uploaddate-ohne-uhrzeit-und-zeitzone, Segment s02): die
 * Tabelle ist die REDAKTIONELLE Angabe und bleibt ein Kalendertag — so wird sie
 * gepflegt, so wird sie gemessen (`git log -1 --format=%cs`), so prüft sie der
 * Enforcer. Der Verwender ist dagegen ausnahmslos ein `dateModified` im
 * JSON-LD, und dort ist ein Zeitpunkt mit Zone die bessere Angabe: ohne Zone
 * legt Google den Kalendertag nach dem Standort seines eigenen Crawlers aus.
 * Deshalb wird die Zone GENAU HIER angelegt, an der einen Stelle, durch die
 * jeder Verwender geht — nicht in jeder Fundstelle einzeln. Ein
 * Erscheinungsdatum ist ein Kalendertag; `isoMitZone` setzt dessen Anfang in
 * der Hauszone und behauptet damit keine Uhrzeit, die wir nicht kennen.
 *
 * @param {string} pfad
 * @returns {string} ISO-8601-Zeitstempel mit Zone, z. B.
 *   `2026-08-18T00:00:00+02:00`
 */
export function standFuer(pfad) {
  const wert = REDAKTIONSSTAND[pfad];
  if (!wert) {
    throw new Error(
      `redaktionsstand: kein Stand für "${pfad}" — Eintrag in ` +
        'app/data/redaktionsstand.js ergänzen (Datum aus ' +
        '`git log -1 --format=%cs -- <inhaltsdatei>`).',
    );
  }
  return isoMitZone(wert);
}
