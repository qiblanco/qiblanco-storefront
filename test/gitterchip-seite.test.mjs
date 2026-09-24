// Hermetische Tests der Seite /pages/wie-funktioniert-der-gitterchip-im-qione
// (Christian, 23.09.2026: „alles mit dem Salesmanager aufbauen … ohne
// Verteidigung … Die Seite noch nicht verlinken und nicht crawlbar machen.").
// node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausführen: node --test test/gitterchip-seite.test.mjs
//
// WAS DIESE DATEI PRÜFT: die Zusagen des Datenmoduls am Quelltext. Keine
// Verteidigung, kein Körper- oder Heilversprechen, jede übernommene Grafik
// findet ihre Werte im Datenmodul der Info-Seite, keine Wasserstruktur-Zahl
// steht als Literal im Datenmodul, jeder Studienlink hat eine Studie, jede
// Stufe endet mit einem Weiter auf einen vorhandenen Anker, die letzte mit dem
// Kaufweg, und die Route trägt noindex statt canonical. Ob die Seite LIVE
// gesiegelt, einmal animiert und versteckt ist, misst
// worker-pool/pruefungen/probe_gitterchip_seite_siegel_und_einmal_animiert__20260924.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';

import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';
import * as SSOT from '../app/data/kohaerente-wasserstruktur.js';

const DATEI = new URL('../app/data/gitterchip-seite.js', import.meta.url);
const G = await ladeMitAufgeloestenImporten(DATEI.pathname, 'gcseite');
const QUELLTEXT = readFileSync(DATEI, 'utf8');
// Die Route OHNE Kommentare: ihr Kopfkommentar beschreibt die Freigabe
// (canonical statt noindex) und darf den Test nicht täuschen.
const ROUTE = readFileSync(
  new URL('../app/routes/pages.wie-funktioniert-der-gitterchip-im-qione.jsx', import.meta.url),
  'utf8',
)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
const SEO = readFileSync(new URL('../app/lib/seo.js', import.meta.url), 'utf8');

function alleTexte() {
  const t = [G.SEITE.h1, G.SEITE.beschreibung, ...G.SEITE.kurz, G.SEITE.kopfGrafik.legende];
  for (const s of G.STUFEN) {
    t.push(s.marke, s.titel, ...s.absaetze);
    if (s.grafik) {
      t.push(s.grafik.legende);
      for (const gl of s.grafik.glieder || []) t.push(gl.titel, gl.text, gl.quelle);
    }
    for (const d of s.diagramme || []) t.push(...d.titel, d.messgroesse, d.zeile);
    for (const k of s.kennzahlen || []) t.push(k.text, k.zeile);
    if (s.weiter) t.push(s.weiter.text);
    if (s.kauf) t.push(s.kauf.text, s.neben.text);
  }
  return t.map(String);
}

// Dieselben Muster wie die Erfüllungsprobe des Auftrags (V und H) plus die
// Körpersperre der Info-Seite. Sie stehen hier ein zweites Mal, weil ein Test,
// der den Prüfer importiert, nur prüft, dass der Prüfer sich selbst glaubt.
const VERTEIDIGUNG =
  /nicht (vollst(ä|ae)ndig )?bewiesen|kein Nachweis|nicht belegt|umstritten|Lehrbuch-Konsens|Pseudowissenschaft|Hypothese|wissenschaftlich bewiesen|nicht versprechen|in Ruhe an/i;
const SPERRE_HEIL = [
  /st(ä|ae)rk\w* (dein|das|ihr|unser) Immunsystem/i,
  /sch(ü|ue)tz\w* (deine |die |unsere )?Zellen/i,
  /vor Viren/i,
  /\bheil(t|en|ung|end)\b/i,
  /verhinder\w* Krankheit/i,
  /sch(ü|ue)tz\w* (dich|deinen K(ö|oe)rper) vor/i,
  /Therapie|therapeut/i,
  /Krankheit|Erkrankung/i,
];

test('keine Verteidigung, kein Körper- oder Heilversprechen', () => {
  for (const text of alleTexte()) {
    assert.doesNotMatch(text, VERTEIDIGUNG, text);
    for (const rx of SPERRE_HEIL) assert.doesNotMatch(text, rx, text);
  }
});

test('die drei Forscher stehen im Text, mit Christians Titeln', () => {
  const alles = alleTexte().join(' ');
  for (const name of ['Dr. Ulrich Warnke', 'Del Giudice', 'Prof. Dr. Gerald Pollack', 'Prof. Dr. Pollack']) {
    assert.ok(alles.includes(name), name);
  }
});

test('übernommene Grafiken finden ihre Werte im Datenmodul der Info-Seite', () => {
  for (const s of G.STUFEN) {
    if (!s.grafik || s.grafik.typ === 'kette') continue;
    assert.ok(s.grafik.werte, `Grafik ${s.grafik.typ} ohne Werte`);
  }
  assert.ok(G.infoGrafik('domaene'));
  assert.ok(G.infoGrafik('ausschlusszone'));
});

test('keine Wasserstruktur-Zahl steht als Literal im Datenmodul', () => {
  const zahlen = new Set();
  for (const b of SSOT.bilder) {
    for (const k of ['von', 'nach', 'energie']) if (b[k] && b[k].anzeige) zahlen.add(b[k].anzeige);
  }
  for (const s of SSOT.stufen) for (const v of [s.winkel, s.energie]) if (/\d/.test(v)) zahlen.add(v);
  assert.ok(zahlen.size >= 3, 'SSoT-Konsument liefert keine Zahlen');
  for (const z of zahlen) assert.ok(!QUELLTEXT.includes(z), `Literal ${z} im Datenmodul`);
  // Die widerlegten Werte des SSoT kommen gar nicht vor.
  for (const w of ['180°', '13,5 eV', 'H3O ', 'H₃O ']) {
    assert.ok(!alleTexte().join(' ').includes(w), w);
  }
});

test('jeder Studienlink hat eine Studie', () => {
  const slugs = [];
  for (const s of G.STUFEN) {
    for (const d of s.diagramme || []) slugs.push(d.studie);
    for (const k of s.kennzahlen || []) slugs.push(k.studie);
  }
  assert.equal(new Set(slugs).size, 5, 'fünf verschiedene Studien');
  const bekannt = new Set();
  for (const n of ['e0001', 'e0002', 'e0003', 'e0004', 'e0005']) {
    const pfad = new URL(`../app/data/studien/${n}.json`, import.meta.url);
    assert.ok(existsSync(pfad), n);
    bekannt.add(JSON.parse(readFileSync(pfad, 'utf8')).slug);
  }
  for (const s of slugs) assert.ok(bekannt.has(s), s);
});

test('jede Stufe führt weiter, die letzte zum Kaufweg', () => {
  const anker = new Set(G.STUFEN.map((s) => s.anker));
  const letzte = G.STUFEN[G.STUFEN.length - 1];
  for (const s of G.STUFEN.slice(0, -1)) {
    assert.ok(s.weiter && anker.has(s.weiter.anker), `${s.id} ohne gültiges Weiter`);
  }
  assert.equal(letzte.kauf.href, G.KAUFWEG);
  assert.equal(G.KAUFWEG, '/products/qione-2-pro');
});

test('versteckt: noindex in der Route, kein canonical, Sitemap-Sperre in seo.js', () => {
  assert.match(ROUTE, /noindexMeta\(\)/);
  assert.match(ROUTE, /headers = \(\) => noindexHeader\(\)/);
  assert.doesNotMatch(ROUTE, /canonicalLink\(SEITE/);
  const eintrag = SEO.match(/handle: 'wie-funktioniert-der-gitterchip-im-qione',\s*ausSitemap: (true|false)/);
  assert.ok(eintrag, 'Eintrag in NICHT_INDEXIERBARE_SEITEN_DEF fehlt');
  assert.equal(eintrag[1], 'true');
  const nurRoute = SEO.slice(SEO.indexOf('export const NUR_ROUTE_SEITEN'));
  assert.ok(!nurRoute.includes('wie-funktioniert-der-gitterchip-im-qione'), 'steht in NUR_ROUTE_SEITEN');
});
