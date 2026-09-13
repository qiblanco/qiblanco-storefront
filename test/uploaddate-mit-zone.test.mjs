/**
 * JEDES uploadDate, das dieses Haus erzeugt, traegt Uhrzeit UND Zone.
 *
 * ANLASS (Job 20260913-REPAIR-uploaddate-ohne-uhrzeit-und-zeitzone): die Search
 * Console meldete am 2026-09-13 zwei Probleme vom Typ "Videos fuer strukturierte
 * Daten" -- "Zeitzone in Datum/Uhrzeit-Attribut `uploadDate` fehlt" und
 * "ungueltiger Datum/Uhrzeit-Wert fuer `uploadDate`". Es waren nicht zwei
 * Fehler, sondern derselbe Wert zweimal beurteilt. Live gemessen am selben Tag:
 * 17 von 17 Werten auf den Produktseiten trugen ein blosses Datum.
 *
 * WARUM EINE PROBE UEBER ALLE ERZEUGER UND NICHT JE EINE: der gemeldete Fall
 * betraf die Instagram-Reihe, der Mangel aber drei Erzeuger auf sieben Seiten
 * (Inventur ueber alle drei Laeden, 134 URLs). Eine Probe je Fundstelle haette
 * den naechsten Erzeuger wieder nicht erfasst -- gemessen wird die EIGENSCHAFT
 * "erzeugt VideoObject", nicht eine Liste von Dateien.
 *
 * Die Ergaenzung am Kundenrand ist bin/probe_uploaddate_mit_zeitzone.py; diese
 * hier faellt schon vor dem Deploy.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {igVideoKnoten} from '../app/lib/ig-video-schema.js';
import {IG_TESTIMONIALS} from '../app/data/ig-testimonials.js';
import {schemaGraph, seite} from '../app/lib/podcast-daten.server.js';

/** Genau die Form, die Google fuer uploadDate verlangt. */
const ISO_MIT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

/** Alle uploadDate-Werte aus einem beliebig tiefen Knoten einsammeln. */
function uploadDates(knoten, raus = []) {
  if (Array.isArray(knoten)) {
    for (const k of knoten) uploadDates(k, raus);
  } else if (knoten && typeof knoten === 'object') {
    for (const [f, w] of Object.entries(knoten)) {
      if (f === 'uploadDate') raus.push(w);
      else uploadDates(w, raus);
    }
  }
  return raus;
}

test('Instagram-Reihe: jedes uploadDate traegt Uhrzeit und Zone', () => {
  // Ueber ALLE Produkte des Korpus, nicht ueber eines -- sonst misst die Probe
  // die Auswahl statt die Regel.
  const produkte = [...new Set(IG_TESTIMONIALS.map((t) => t.produkt))];
  let gesamt = 0;
  for (const produkt of produkte) {
    const werte = uploadDates(
      igVideoKnoten({produkt, pfad: '/products/qione-2-pro', produktTitel: 'QiOne® 2 Pro'}),
    );
    for (const w of werte) assert.match(w, ISO_MIT_ZONE, `${produkt}: ${w}`);
    gesamt += werte.length;
  }
  // POSITIVKONTROLLE: ohne sie waere die Probe gruen, GERADE WEIL kein Knoten
  // entsteht -- der Fehlerfall, den diese Datei verhindern soll.
  assert.ok(gesamt > 0, 'kein einziger VideoObject-Knoten erzeugt — Probe misst nichts');
});

test('Podcast-Seiten: jedes uploadDate traegt Uhrzeit und Zone', () => {
  let gesamt = 0;
  for (let nr = 1; nr <= 5; nr++) {
    const werte = uploadDates(schemaGraph(seite(nr), 'https://qiblanco.com'));
    for (const w of werte) assert.match(w, ISO_MIT_ZONE, `Seite ${nr}: ${w}`);
    gesamt += werte.length;
  }
  assert.ok(gesamt > 0, 'kein einziger VideoObject-Knoten erzeugt — Probe misst nichts');
});
