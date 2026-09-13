// Die NAHT zwischen isoMitZone() und den Flächen, die ein Datum auszeichnen
// (Job 20260913-REPAIR-uploaddate-ohne-uhrzeit-und-zeitzone, Segment s02).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/datumsfelder-zone-naht.test.mjs
//
// WAS DIESE DATEI PRUEFT UND WAS NICHT. test/datum-iso-mit-zone.test.mjs prüft
// die FUNKTION, und sie ist gruen, seit es sie gibt. Gruen war damals auch jede
// Seite — die Funktion wurde nur nirgends aufgerufen. Genau diese Naht reißt
// in diesem Haus am häufigsten: zwei gruene Seiten, eine kaputte Verbindung.
// Hier wird deshalb die VERBINDUNG gemessen. Ob die Seite LIVE einen Zeitstempel
// ausliefert, kann diese Datei nicht wissen; das misst
// homepage-bauer/bin/probe_datumsfelder_mit_zone.py am ausgelieferten HTML.
//
// DIE GRENZE DIESER DATEI, damit sie niemand für mehr hält, als sie ist: sie
// ist eine Rückfall-Sperre für die Änderung von s02, KEIN Zensus über alle
// Datumsfelder des Repos. Die stehende Wache über die ganze Klasse entsteht in
// Segment s03 im Flächen-Zensus des seo-manager.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {ohneProsa} from './_quelltext.mjs';
import {REDAKTIONSSTAND, STAND_ISO, standFür} from '../app/data/redaktionsstand.js';

const lies = (p) => ohneProsa(readFileSync(new URL(p, import.meta.url), 'utf8'));
const MIT_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/;

// Die vier Routen, deren Datumswerte als DATEI-LOKALE Konstanten dastehen und
// die deshalb nicht über `standFür()` geheilt werden können.
const ROUTEN = [
  '../app/routes/pages.kritik.jsx',
  '../app/routes/pages.neu-oder-gebraucht.jsx',
  '../app/routes/pages.wirkt-das.jsx',
  '../app/routes/pages.warum-qi-blanco.jsx',
];

test('jede Route reicht ihr Datum durch isoMitZone, statt es roh zu setzen', () => {
  for (const r of ROUTEN) {
    const code = lies(r);
    const roh = [...code.matchAll(/\b(datePublished|dateModified|dateCreated)\s*:\s*([^,\n]+)/g)]
      .filter(([, , wert]) => !wert.includes('isoMitZone('));
    assert.deepEqual(
      roh.map(([, feld, wert]) => `${feld}: ${wert.trim()}`),
      [],
      `${r}: Datumsfeld ohne Zone`,
    );
    assert.match(code, /import \{isoMitZone\} from '~\/lib\/datum'/, `${r}: Import fehlt`);
  }
});

test('standFür liefert den Zeitstempel — und verschiebt den Kalendertag nicht', () => {
  // Die Tabelle bleibt die redaktionelle Angabe in Kalendertagen; die Zone
  // entsteht erst im Zugriff. Beides zugleich ist der Punkt: eine Zone, die den
  // Tag verschiebt, wäre schlimmer als gar keine.
  for (const [pfad, tag] of Object.entries(REDAKTIONSSTAND)) {
    const v = standFür(pfad);
    assert.match(v, MIT_ZONE, `${pfad} -> ${v}`);
    assert.ok(v.startsWith(tag), `${pfad}: ${tag} wurde zu ${v} verschoben`);
    assert.match(tag, /^\d{4}-\d{2}-\d{2}$/, `${pfad}: die Tabelle soll ein Kalendertag bleiben`);
  }
  assert.equal(STAND_ISO, standFür('/pages/über-uns'));
});

test('KEINE ERFUNDENE GENAUIGKEIT: fremde Publikationsdaten bleiben unberührt', () => {
  // `datePublished`/`dateCreated` eines ScholarlyArticle sind Erscheinungs- und
  // Einreichungsdatum FREMDER Arbeiten, teils nur als Jahr bekannt. Der
  // Schema-Bau darf sie nicht durch isoMitZone schicken — nicht weil es schadete
  // (die Funktion lässt sie durch), sondern weil der Aufruf die Absicht
  // fälschlich als "wir hätten hier gern eine Uhrzeit" liest.
  const code = lies('../app/lib/studien-schema.js');
  assert.match(code, /artikel\.datePublished = e\.veroeffentlicht;/);
  assert.match(code, /artikel\.dateCreated = e\.eingereicht;/);
});
