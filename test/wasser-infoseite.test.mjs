// Hermetische Tests der Info-Seite /pages/was-ist-kohaerentes-wasser (Großjob
// vom 23.09.2026, Christian: „die beste Info-Seite zu dem Thema im Netz").
// node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausführen: node --test test/wasser-infoseite.test.mjs
//
// WAS DIESE DATEI PRÜFT: die Zusagen des Datenmoduls am Quelltext — jede
// Zitatmarke hat eine Quelle, jede Quelle wird zitiert, mindestens zwölf
// verschiedene DOI-Links, keine Körper- oder Heilzusage, keine
// Selbstentwertung, die Werte der drei Stufen kommen aus dem SSoT-Konsumenten,
// und die strukturierten Daten tragen Article, FAQPage, DefinedTermSet und
// VideoObject aus dem sichtbaren Text. Ob die Seite LIVE hell ist, misst
// homepage-bauer/pruefungen/probe_infoseite_kohaerentes_wasser_hell__20260923.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';
import * as SSOT from '../app/data/kohaerente-wasserstruktur.js';

const DATEI = new URL('../app/data/wasser-infoseite.js', import.meta.url);
const W = await ladeMitAufgeloestenImporten(DATEI.pathname, 'kwinfo');

/** Alle Texte der Seite, wie sie gerendert werden (ohne Marken). */
function alleTexte() {
  const t = [
    W.SEITE.h1,
    W.SEITE.unterzeile,
    W.SEITE.kurz,
    W.SEITE.leitLegende,
    W.SEITE.standZeile,
  ];
  for (const teil of [W.TEIL_EINFACH, W.TEIL_FAKTEN]) {
    t.push(teil.titel, teil.einleitung);
    for (const a of teil.abschnitte) {
      t.push(a.titel, ...(a.absaetze || []), ...(a.nachGrafik || []));
      for (const k of a.karten || []) t.push(k.titel, k.text);
      if (a.tabelle) t.push(...a.tabelle.zeilen.flat());
      if (a.grafik)
        t.push(
          a.grafik.legende,
          ...Object.values(a.grafik.werte)
            .flat()
            .map((v) =>
              typeof v === 'object' ? JSON.stringify(v) : String(v),
            ),
        );
    }
  }
  for (const f of W.FRAGEN) t.push(f.q, f.a);
  for (const g of W.GLOSSAR) t.push(g.begriff, g.definition);
  for (const z of W.BEGRIFFE.zeilen) t.push(z.begriff, z.bedeutung, z.herkunft);
  t.push(...Object.values(W.STUFENTAFEL.erklaerung));
  return t.map((x) => String(x));
}

const MARKE_RX = /\{q:([a-z0-9-]+)\}/g;

test('jede Zitatmarke hat eine Quelle, jede Quelle wird zitiert', () => {
  const ids = new Set(W.QUELLEN.map((q) => q.id));
  const zitiert = new Set();
  for (const text of alleTexte()) {
    for (const m of text.matchAll(MARKE_RX)) {
      assert.ok(ids.has(m[1]), `Zitatmarke {q:${m[1]}} ohne Quelle`);
      zitiert.add(m[1]);
    }
  }
  for (const f of W.FRAGEN)
    for (const id of f.quellen || []) {
      assert.ok(ids.has(id), `Frage "${f.q}" nennt unbekannte Quelle ${id}`);
      zitiert.add(id);
    }
  const unzitiert = [...ids].filter((id) => !zitiert.has(id));
  assert.deepEqual(unzitiert, [], `Quellen ohne Zitat im Text: ${unzitiert}`);
});

test('Nummerierung folgt dem ersten Auftreten im Text', () => {
  assert.equal(W.quellenNummer(W.ZITATMARKEN[0]), 1);
  assert.equal(
    W.QUELLEN.length,
    new Set(W.QUELLEN.map((q) => q.id)).size,
    'doppelte Quellen-id',
  );
  assert.throws(() => W.quellenNummer('gibt-es-nicht'), /ohne Eintrag/);
});

test('mindestens zwoelf verschiedene DOI-Links, alle wohlgeformt', () => {
  const dois = W.QUELLEN.filter((q) => q.url).map((q) => q.url);
  assert.ok(new Set(dois).size >= 12, `nur ${new Set(dois).size} DOI-Links`);
  for (const u of dois)
    assert.match(u, /^https:\/\/doi\.org\/10\.\d{4,5}\/\S+$/, u);
});

test('kein Körper- oder Heilversprechen im sichtbaren Text (GL-SPR-0008)', () => {
  // Dasselbe Muster wie Arm H der Erfuellungsprobe, plus die Sperre des
  // Datenmoduls selbst. Titel fremder Werke im Quellenverzeichnis zählen
  // nicht: sie sind bibliografische Angabe, nicht unsere Aussage.
  const armH =
    /st(ä|ae)rkt (dein|das) Immunsystem|sch(ü|ue)tzt (deine )?Zellen vor|vor Viren|heilt|verhindert Krankheit|sch(ü|ue)tzt (dich|deinen K(ö|oe)rper) vor/i;
  for (const text of alleTexte()) {
    assert.doesNotMatch(text, armH, text);
    assert.ok(W.istSchemaSicher(text), `Koerpersperre trifft: ${text}`);
  }
});

test('keine Selbstentwertung (Arm L der Erfuellungsprobe)', () => {
  const armL = /kein Lehrbuch-Konsens|nicht belegt|Pseudowissenschaft|Humbug/i;
  for (const text of alleTexte()) assert.doesNotMatch(text, armL, text);
});

test('die widerlegten SSoT-Werte stehen nirgends', () => {
  const verboten = [/\b180\s*°/, /13,5\s*eV/, /\bH3O\b(?![₂⁺+-])/];
  for (const text of alleTexte())
    for (const rx of verboten) assert.doesNotMatch(text, rx, text);
});

test('die drei Stufen kommen aus dem SSoT-Konsumenten (eine Zahlenhaltung)', () => {
  const winkel = SSOT.bilder.find((b) => b.id === 'winkel');
  const kurz = alleTexte().join('\n');
  assert.ok(
    kurz.includes(winkel.von.anzeige) && kurz.includes(winkel.nach.anzeige),
  );
  const ez = SSOT.stufen.find((s) => s.id === 'ez');
  assert.ok(kurz.includes(ez.formel), 'EZ-Formel aus dem SSoT fehlt');
  // Die Ladungs-Zeile ersetzt seit 2026-09-23 die Hydronium-Zeile.
  assert.ok(SSOT.vergleich.zeilen.some((z) => z.feld === 'ladung'));
  assert.ok(!SSOT.vergleich.zeilen.some((z) => z.feld === 'hydronium'));
  for (const z of SSOT.vergleich.zeilen) {
    const werte = SSOT.stufen.map((s) => s[z.feld]);
    assert.notEqual(
      new Set(werte).size,
      1,
      `Zeile ${z.label} hat in allen Spalten denselben Wert`,
    );
  }
});

test('strukturierte Daten: Article, FAQPage, DefinedTermSet, VideoObject', () => {
  const knoten = W.strukturierteDaten();
  const typen = knoten.map((k) => k['@type']);
  for (const t of ['Article', 'FAQPage', 'DefinedTermSet', 'VideoObject']) {
    assert.ok(typen.includes(t), `JSON-LD ohne ${t}`);
  }
  const faq = knoten.find((k) => k['@type'] === 'FAQPage');
  assert.equal(
    faq.mainEntity.length,
    W.FRAGEN.length,
    'eine Frage fiel still aus dem Schema',
  );
  for (const q of faq.mainEntity)
    assert.doesNotMatch(q.acceptedAnswer.text, /\{q:|\{l:/);
  const glossar = knoten.find((k) => k['@type'] === 'DefinedTermSet');
  assert.equal(
    glossar.hasDefinedTerm.length,
    W.GLOSSAR.length,
    'ein Begriff fiel still aus dem Schema',
  );
  const artikel = knoten.find((k) => k['@type'] === 'Article');
  assert.ok(
    artikel.citation.length >= 12,
    'Article nennt weniger als zwoelf Quellen',
  );
  assert.match(
    artikel.datePublished,
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/,
  );
  const video = knoten.find((k) => k['@type'] === 'VideoObject');
  for (const f of [
    'name',
    'description',
    'thumbnailUrl',
    'uploadDate',
    'embedUrl',
  ]) {
    assert.ok(video[f], `VideoObject ohne ${f}`);
  }
  // Auf der Seite gilt: dieselben Knoten müssen JSON-serialisierbar sein.
  for (const k of knoten) JSON.parse(JSON.stringify(k));
});

test('die Route trägt canonicalLink und kein noindex', () => {
  // Der Dateiname folgt aus dem Pfad der Seite; so steht er nur an EINER Stelle.
  const datei = `../app/routes/pages.${W.PFAD.split('/').pop()}.jsx`;
  const route = readFileSync(new URL(datei, import.meta.url), 'utf8');
  assert.match(route, /canonicalLink\(SEITE\.pfad\)/);
  const code = route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /noindex/);
});

test('Titel und Beschreibung passen in die Suchergebnis-Laenge', () => {
  assert.ok(
    W.SEITE.titel.length <= 60,
    `Titel ${W.SEITE.titel.length} Zeichen`,
  );
  assert.ok(
    W.SEITE.beschreibung.length <= 160,
    `Beschreibung ${W.SEITE.beschreibung.length} Zeichen`,
  );
  assert.match(W.SEITE.titel, /Koh(ä|ae)rentes Wasser/i);
  assert.doesNotMatch(W.SEITE.titel + W.SEITE.h1, /Tag 5/);
});
