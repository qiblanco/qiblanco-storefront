// Hermetische Tests der Entitaets-/E-E-A-T-Auszeichnung (Auftrag
// 20260823-seo-grossjob-…-prio50, Segment s06, Backlog B-10).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/entitaet-eeat.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

import {
  REDAKTIONSSTAND,
  STAND_ISO,
  standFuer,
} from '../app/data/redaktionsstand.js';
import {übersichtSchema, studieSchema} from '../app/lib/studien-schema.js';
import {ORG_ID} from '../app/lib/entity-schema.js';

// Die Studien-Registry app/data/studien/index.js importiert ihre fuenf
// JSON-Dateien per `import ... from './e0001.json'` — eine Form, die Vite
// aufloest und `node --test` ohne Import-Attribut ablehnt. Statt die
// Bestandsdatei fuer den Test umzubauen, liest der Test die JSON-Dateien
// selbst; das ist zugleich die haertere Pruefung, weil er dann NICHT von der
// Registry abhaengt, sondern vom Dateibestand.
const STUDIEN_DIR = new URL('../app/data/studien/', import.meta.url);
const STUDIEN = readdirSync(STUDIEN_DIR)
  .filter((n) => n.endsWith('.json'))
  .sort()
  .map((n) => JSON.parse(readFileSync(new URL(n, STUDIEN_DIR), 'utf8')));

test('die Testvorbedingung haelt: fuenf Studien gefunden', () => {
  // Positiv-Kontrolle. Eine leere Liste wuerde jede Schleife unten still
  // gruen machen — ein Test ueber null Elemente belegt nichts.
  assert.ok(STUDIEN.length >= 5, `nur ${STUDIEN.length} Studien gelesen`);
  for (const s of STUDIEN) assert.ok(s.slug, 'Studie ohne slug');
});

// ── Redaktionsstand: der Enforcer der Pflege-Regel ─────────────────────────
// Der teuerste Fehler waere NICHT ein falsches Datum, sondern ein FEHLENDES:
// `undefined` faellt beim Serialisieren still aus dem JSON-LD, und die Seite
// saehe im Quelltext aus wie erledigte Arbeit.

test('jeder Redaktionsstand ist ein wohlgeformtes ISO-Datum', () => {
  for (const [pfad, datum] of Object.entries(REDAKTIONSSTAND)) {
    assert.match(datum, /^\d{4}-\d{2}-\d{2}$/, `kaputte Form bei ${pfad}`);
    assert.equal(
      Number.isNaN(Date.parse(datum)),
      false,
      `unparsbares Datum bei ${pfad}`,
    );
  }
});

test('kein Redaktionsstand liegt in der Zukunft', () => {
  // Ein Datum in der Zukunft ist keine Angabe, sondern eine Behauptung ueber
  // Arbeit, die noch nicht stattgefunden hat. Grosszuegige Toleranz von einem
  // Tag, damit ein Deploy ueber die UTC-Mitternacht nicht rot wird.
  const morgen = Date.now() + 24 * 60 * 60 * 1000;
  for (const [pfad, datum] of Object.entries(REDAKTIONSSTAND)) {
    assert.ok(Date.parse(datum) <= morgen, `${pfad} datiert in die Zukunft`);
  }
});

test('standFuer WIRFT bei unbekanntem Pfad statt undefined zu liefern', () => {
  // Das ist der eigentliche Schutz: ein stiller undefined-Wert erzeugt eine
  // Seite OHNE dateModified, die im Diff wie eine Seite MIT aussieht.
  assert.throws(() => standFuer('/pages/gibt-es-nicht'), /kein Stand/);
});

test('jede Studie hat einen eigenen Stand — sonst wirft der Schema-Bau', () => {
  for (const s of STUDIEN) {
    assert.doesNotThrow(
      () => standFuer(`/pages/${s.slug}`),
      `Studie ${s.slug} fehlt in REDAKTIONSSTAND`,
    );
  }
});

// ── B-10(c): der Hub war schwaecher ausgezeichnet als seine Blaetter ───────

test('Studien-Hub traegt author UND dateModified', () => {
  const graph = übersichtSchema(STUDIEN)['@graph'];
  const sammlung = graph.find((n) => n['@type'] === 'CollectionPage');
  assert.ok(sammlung, 'CollectionPage fehlt im Hub-Graphen');
  assert.deepEqual(sammlung.author, {'@id': ORG_ID});
  assert.equal(sammlung.dateModified, REDAKTIONSSTAND['/pages/studien']);
});

test('der Hub referenziert die Organisation, statt sie zu doppeln', () => {
  // Zwei Knoten mit derselben Identitaet und verschiedenen Feldern sind die
  // Drift, die eine Entitaetsaufloesung ruiniert. author/publisher duerfen
  // deshalb NUR eine @id-Referenz sein, nie ein zweiter Organization-Knoten.
  const graph = übersichtSchema(STUDIEN)['@graph'];
  const sammlung = graph.find((n) => n['@type'] === 'CollectionPage');
  for (const feld of ['author', 'publisher']) {
    assert.deepEqual(Object.keys(sammlung[feld]), ['@id']);
  }
  assert.equal(
    graph.filter((n) => n['@type'] === 'Organization').length,
    0,
    'der Hub baut einen eigenen Organization-Knoten — das ist die Doppelung',
  );
});

test('der Studienautor bleibt auf den Blaettern und wandert NICHT auf den Hub', () => {
  // Prof. Dr. Dartsch hat die Untersuchungen verfasst, nicht unsere Uebersicht
  // ueber sie. Ihn auf dem Hub als Autor zu fuehren waere eine Zuschreibung,
  // die er nie gemacht hat — auf einer YMYL-Domain der teuerste Fehlertyp.
  const hub = JSON.stringify(übersichtSchema(STUDIEN));
  assert.equal(
    hub.includes('Dartsch'),
    false,
    'der Studienautor steht faelschlich im Hub-Graphen',
  );
  const blatt = studieSchema(STUDIEN[0]);
  const artikel = blatt['@graph'].find((n) => n['@type'] === 'ScholarlyArticle');
  assert.equal(artikel.author.name, 'Prof. Dr. Peter C. Dartsch');
});

test('jedes Studien-Blatt traegt dateModified NEBEN datePublished', () => {
  // Die beiden bedeuten Verschiedenes: datePublished ist das Erscheinungsjahr
  // der Publikation, dateModified der Stand UNSERER Wiedergabe. Gemessen am
  // 2026-08-24 trugen alle fuenf Blaetter nur das erste.
  for (const s of STUDIEN) {
    const artikel = studieSchema(s)['@graph'].find(
      (n) => n['@type'] === 'ScholarlyArticle',
    );
    assert.equal(artikel.dateModified, REDAKTIONSSTAND[`/pages/${s.slug}`]);
    if (s.eckdaten.veroeffentlicht) {
      assert.notEqual(
        artikel.dateModified,
        artikel.datePublished,
        `${s.slug}: dateModified darf datePublished nicht ueberschreiben`,
      );
    }
  }
});

// ── B-10(a): die Ueber-uns-Seite nennt einen ECHTEN Menschen ──────────────

test('der Stand der Ueber-uns-Seite ist gefuehrt', () => {
  assert.equal(STAND_ISO, REDAKTIONSSTAND['/pages/ueber-uns']);
  assert.match(STAND_ISO, /^\d{4}-\d{2}-\d{2}$/);
});
