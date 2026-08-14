/**
 * test/podcast-daten.test.mjs — die Regeln des Podcast-Index.
 *
 * Geprueft wird das generierte Datenmodul, nicht der Generator: im Deploy
 * landet die Datei, nicht das Python-Skript. Ein Regenerieren mit geaenderten
 * Regeln muss hier auffallen.
 *
 * Lauf:  node --test test/podcast-daten.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  beschreibung,
  FOLGEN,
  GAESTE,
  PRO_SEITE,
  SEITEN_ZAHL,
  ladeSeite,
  nummerAusSegment,
  schemaGraph,
  seite,
  seitenPfad,
} from '../app/lib/podcast-daten.server.js';

const BASIS = 'https://qiblanco.com';

// Folgen, deren YouTube-Beschreibung real KEINEN Fliesstext hergibt (hier: sie
// bestand nur aus einem Link). Nichts wird erfunden — die Folge läuft mit
// Titel und Video, die Schema-Beschreibung fällt auf den Titel zurück.
// Die Liste ist SELBSTAUFLOESEND: bekommt die Folge doch Text, wird der Test
// rot und verlangt, den Eintrag zu streichen. So bleibt keine stille Ausnahme.
const OHNE_ORIGINALTEXT = new Set(['rMuIWLlI-9Y']);

// --- Bestand ---------------------------------------------------------------

test('jede Folge trägt die Felder, die Markup und Schema brauchen', () => {
  assert.ok(FOLGEN.length > 0, 'keine Folgen im Modul');
  for (const f of FOLGEN) {
    assert.match(f.id, /^[A-Za-z0-9_-]{11}$/, `YouTube-ID unplausibel: ${f.id}`);
    assert.ok(f.t && f.t.trim().length > 5, `Titel fehlt: ${f.id}`);
    assert.match(f.d, /^\d{4}-\d{2}-\d{2}$/, `Datum unplausibel: ${f.id}`);
    assert.match(f.iso, /^PT/, `ISO-Dauer unplausibel: ${f.id}`);
    assert.ok(f.thumb.startsWith('https://i.ytimg.com/'), `kein echtes Poster: ${f.id}`);
    if (OHNE_ORIGINALTEXT.has(f.id)) {
      assert.equal(f.txt.length, 0, `${f.id} hat jetzt Text — Ausnahme streichen`);
    } else {
      assert.ok(f.txt.length > 0, `keine Beschreibung: ${f.id}`);
      assert.ok(f.txt.join(' ').length >= 40, `Beschreibung zu duenn: ${f.id}`);
    }
  }
});

test('neueste Folge zuerst', () => {
  const daten = FOLGEN.map((f) => f.d);
  assert.deepEqual(daten, [...daten].sort().reverse());
});

test('keine Folge doppelt', () => {
  assert.equal(new Set(FOLGEN.map((f) => f.id)).size, FOLGEN.length);
});

// --- Paginierung -----------------------------------------------------------

test('die Seiten decken alle Folgen ab, ueberschneidungsfrei', () => {
  assert.equal(SEITEN_ZAHL, Math.ceil(FOLGEN.length / PRO_SEITE));
  const gesehen = [];
  for (let nr = 1; nr <= SEITEN_ZAHL; nr++) {
    const s = seite(nr);
    assert.ok(s.folgen.length > 0 && s.folgen.length <= PRO_SEITE);
    gesehen.push(...s.folgen.map((f) => f.id));
  }
  assert.equal(gesehen.length, FOLGEN.length, 'Folgen gehen verloren oder doppeln sich');
  assert.equal(new Set(gesehen).size, FOLGEN.length);
});

test('vorher/nachher zeigen an den Raendern ins Leere', () => {
  assert.equal(seite(1).vorher, null);
  assert.equal(seite(SEITEN_ZAHL).nachher, null);
  assert.equal(seite(1).nachher, seitenPfad(2));
  assert.equal(seite(2).vorher, '/pages/podcasts');
});

test('Seite 1 hat den nackten Pfad, ab 2 den seite-N-Pfad', () => {
  assert.equal(seitenPfad(1), '/pages/podcasts');
  assert.equal(seitenPfad(2), '/pages/podcasts/seite-2');
});

test('nummerAusSegment ist streng — eine Seite, eine URL', () => {
  assert.equal(nummerAusSegment('seite-2'), 2);
  assert.equal(nummerAusSegment('seite-13'), 13);
  // Fuehrende Null, Muell und Leeres duerfen NICHT auf eine Seite zeigen,
  // sonst zeigt derselbe Inhalt unter mehreren URLs (Duplicate Content).
  for (const schlecht of ['seite-02', 'seite-', 'seite-2x', 'Seite-2', '2', '', null, undefined]) {
    assert.equal(nummerAusSegment(schlecht), null, `hätte null sein müssen: ${schlecht}`);
  }
});

// --- Die tragenden Regeln des Umzugs --------------------------------------

test('R1: kein Produktlink zeigt auf einen US-Pfad, der auf DACH 404 ist', () => {
  // Gemessen 2026-08-14 gegen qiblanco.com: /products/qione und
  // /products/qihome sind dort 404 (US-Handles). Ein Regenerieren ohne Remap
  // würde 25 tote Links auf die Seite stellen — das faengt dieser Test.
  const tot = ['/products/qione', '/products/qihome'];
  for (const f of FOLGEN) {
    for (const [pfad] of f.prod) {
      assert.ok(!tot.includes(pfad), `toter DACH-Link in Folge ${f.id}: ${pfad}`);
      assert.ok(pfad.startsWith('/'), `Produktlink nicht relativ: ${pfad}`);
    }
  }
});

test('R2: neben einer Folge mit Krankheit im Titel steht kein Kaufweg', () => {
  const heikel = ['zPULJ9yafAg', 'yX7N8X5jAgs', 'kZ-oZ_8F_6Y'];
  for (const id of heikel) {
    const f = FOLGEN.find((x) => x.id === id);
    if (!f) continue; // Folge kann aus dem Kanal verschwinden
    assert.equal(f.prod.length, 0, `Folge ${id} trägt trotz R2 einen Produktlink`);
  }
});

test('R3: kein YouTube-Restmuell im Beschreibungstext', () => {
  for (const f of FOLGEN) {
    const text = f.txt.join('\n');
    assert.ok(!/https?:\/\//.test(text), `URL im Text: ${f.id}`);
    assert.ok(!/^#\w+/m.test(text), `Hashtag-Zeile im Text: ${f.id}`);
    for (const a of f.txt) {
      // Haengendes Label: die URL dahinter ist weg, die Anrede blieb stehen.
      assert.ok(
        !(a.length < 80 && a.endsWith(':')),
        `haengendes CTA-Label in ${f.id}: ${JSON.stringify(a)}`,
      );
      // Nackte Domain in einer kurzen Zeile = Kontaktzeile, kein Inhalt.
      assert.ok(
        !(a.length < 90 && /www\.[a-z0-9-]+\.[a-z]{2,}/i.test(a)),
        `nackte Domain in ${f.id}: ${JSON.stringify(a)}`,
      );
    }
  }
});

test('die Schema-Beschreibung ist tragfähig und je Folge verschieden', () => {
  // Der Befund, der diesen Test erzwungen hat (adversariale Gegenprobe
  // 2026-08-14): drei Folgen lieferten dieselben 65 Zeichen "Erfahre mehr und
  // starte jetzt den vollständigen Kurs - gratis:" als description.
  // Identische Beschreibungen sind für eine Suchmaschine dünner Inhalt — und
  // genau dieser Text ist der Grund, warum es diese Seite gibt.
  const gesehen = new Map();
  for (const f of FOLGEN) {
    const b = beschreibung(f);
    assert.ok(b && b.trim().length > 0, `leere Beschreibung: ${f.id}`);
    if (f.txt.some((a) => a.length >= 120)) {
      assert.ok(b.length >= 120, `Beschreibung zu dünn trotz langem Text: ${f.id}`);
    }
    assert.equal(gesehen.get(b), undefined, `doppelte Beschreibung: ${f.id} = ${gesehen.get(b)}`);
    gesehen.set(b, f.id);
  }
});

// --- Schema ----------------------------------------------------------------

test('schemaGraph liefert CollectionPage, BreadcrumbList und ItemList', () => {
  const g = schemaGraph(seite(1), BASIS);
  const typen = g['@graph'].map((k) => k['@type']);
  assert.deepEqual(typen, ['CollectionPage', 'BreadcrumbList', 'ItemList']);
});

test('jedes VideoObject trägt die Pflichtfelder', () => {
  for (let nr = 1; nr <= SEITEN_ZAHL; nr++) {
    const liste = schemaGraph(seite(nr), BASIS)['@graph'][2];
    assert.equal(liste.numberOfItems, seite(nr).folgen.length);
    for (const v of liste.itemListElement) {
      assert.equal(v['@type'], 'VideoObject');
      for (const feld of ['name', 'description', 'thumbnailUrl', 'uploadDate', 'duration', 'embedUrl', 'contentUrl', 'url']) {
        assert.ok(String(v[feld] || '').trim(), `${feld} fehlt bei ${v.name}`);
      }
      assert.ok(v.embedUrl.includes('youtube-nocookie.com'), 'Embed ohne nocookie');
    }
  }
});

test('die Position zählt über die Seiten hinweg durch', () => {
  const ersteAufSeite2 = schemaGraph(seite(2), BASIS)['@graph'][2].itemListElement[0];
  assert.equal(ersteAufSeite2.position, PRO_SEITE + 1);
});

test('BreadcrumbList nennt ab Seite 2 die Seite selbst', () => {
  const b1 = schemaGraph(seite(1), BASIS)['@graph'][1];
  const b2 = schemaGraph(seite(2), BASIS)['@graph'][1];
  assert.equal(b1.itemListElement.length, 2);
  assert.equal(b2.itemListElement.length, 3);
  assert.equal(b2.itemListElement[2].item, `${BASIS}/pages/podcasts/seite-2`);
});

// --- Ladefunktion ----------------------------------------------------------

test('ladeSeite reicht nur die Folgen der Seite durch, mit Anzeigetexten', () => {
  const s = ladeSeite(2, BASIS);
  assert.equal(s.daten.folgen.length, PRO_SEITE);
  assert.equal(s.pfad, '/pages/podcasts/seite-2');
  assert.equal(s.pfade.length, SEITEN_ZAHL);
  assert.match(s.daten.folgen[0].datum, /^\d{2}\.\d{2}\.\d{4}$/);
  assert.match(s.daten.folgen[0].dauer, /(Std\.|Min\.)/);
});

test('die Bestands-Eintraege der Altseite erscheinen NUR auf Seite 1', () => {
  assert.ok(GAESTE.length > 0, 'die Altseite wurde nicht uebernommen');
  assert.equal(ladeSeite(1, BASIS).gaeste.length, GAESTE.length);
  assert.equal(ladeSeite(2, BASIS).gaeste.length, 0);
  for (const g of GAESTE) {
    assert.ok(g.t && g.t.trim(), 'Gast ohne Titel');
    assert.ok(g.txt && g.txt.trim(), 'Gast ohne Text');
  }
});

test('das Schema kanonisiert auf die uebergebene Basis, nie auf den Preview-Host', () => {
  const g = schemaGraph(seite(1), BASIS);
  assert.equal(g['@graph'][0]['@id'], `${BASIS}/pages/podcasts`);
});
