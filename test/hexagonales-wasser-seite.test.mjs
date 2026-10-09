// Hermetische Tests der Seite /pages/was-ist-hexagonales-wasser (Christian,
// 23.09.2026: „Platz eins in SEO und GEO" für hexagonales und kohärentes
// Wasser; Grossjob vom 09.10.2026).
// node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausführen: node --test test/hexagonales-wasser-seite.test.mjs
//
// WAS DIESE DATEI PRÜFT: die Zusagen des Datenmoduls am Quelltext. Jede
// Zitatmarke hat eine Quelle, jede Quelle wird zitiert, keine Körper- oder
// Heilzusage, keine Selbstentwertung und kein Zitat der Kritik, die
// Abgrenzungstabelle führt die sechs Begriffe des Auftrags, die Winkel kommen
// aus dem SSoT-Konsumenten, und die strukturierten Daten tragen Article,
// FAQPage und DefinedTermSet. Ob die Seite LIVE den Inhalt zeigt, misst die
// Abnahmeprobe im Jobordner (probe_hexagonal_seite_live.py).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';
import * as SSOT from '../app/data/kohaerente-wasserstruktur.js';

const DATEI = new URL('../app/data/hexagonales-wasser-seite.js', import.meta.url);
const H = await ladeMitAufgeloestenImporten(DATEI.pathname, 'hwseite');

function alleTexte() {
  const t = [
    H.SEITE.titel,
    H.SEITE.beschreibung,
    H.SEITE.h1,
    H.SEITE.unterzeile,
    H.SEITE.kurz,
    H.SEITE.leitLegende,
    H.SEITE.standZeile,
  ];
  for (const teil of [H.TEIL_EINFACH, H.TEIL_FAKTEN]) {
    t.push(teil.titel, teil.einleitung);
    for (const a of teil.abschnitte) {
      t.push(a.titel, ...(a.absaetze || []));
      if (a.grafik)
        t.push(
          a.grafik.legende,
          ...Object.values(a.grafik.werte).map((v) =>
            typeof v === 'object' ? JSON.stringify(v) : String(v),
          ),
        );
    }
  }
  t.push(H.ABGRENZUNG.titel, H.ABGRENZUNG.einleitung, H.ABGRENZUNG.legende);
  for (const z of H.ABGRENZUNG.zeilen) t.push(z.begriff, z.bedeutung, z.beleg);
  for (const f of H.FRAGEN) t.push(f.q, f.a);
  return t.map(String);
}

const MARKE_RX = /\{q:([a-z0-9-]+)\}/g;

test('jede Zitatmarke hat eine Quelle, jede Quelle wird zitiert', () => {
  const ids = new Set(H.QUELLEN.map((q) => q.id));
  const zitiert = new Set();
  for (const text of alleTexte())
    for (const m of text.matchAll(MARKE_RX)) {
      assert.ok(ids.has(m[1]), `Zitatmarke {q:${m[1]}} ohne Quelle`);
      zitiert.add(m[1]);
    }
  for (const f of H.FRAGEN)
    for (const id of f.quellen) {
      assert.ok(ids.has(id), `Frage "${f.q}" nennt unbekannte Quelle ${id}`);
      zitiert.add(id);
    }
  assert.deepEqual([...ids].filter((id) => !zitiert.has(id)), []);
  assert.equal(H.quellenNummer(H.QUELLEN[0].id), 1);
  assert.throws(() => H.quellenNummer('gibt-es-nicht'), /ohne Eintrag/);
});

test('mindestens zehn verschiedene DOI-Links, alle wohlgeformt', () => {
  const dois = H.QUELLEN.filter((q) => q.url).map((q) => q.url);
  assert.ok(new Set(dois).size >= 10, `nur ${new Set(dois).size} DOI-Links`);
  for (const u of dois.filter((x) => x.includes('doi.org')))
    assert.match(u, /^https:\/\/doi\.org\/10\.\d{4,5}\/\S+$/, u);
});

test('kein Körper- oder Heilversprechen (GL-SPR-0008), keine Kritik im Text', () => {
  const armL =
    /kein Lehrbuch-Konsens|nicht belegt|Pseudowissenschaft|Humbug|Quatsch|Science Cops|Quarks|Esoterik/i;
  for (const text of alleTexte()) {
    assert.ok(H_SICHER(text), `Koerpersperre trifft: ${text}`);
    assert.doesNotMatch(text, armL, text);
  }
});

const W = await ladeMitAufgeloestenImporten(
  new URL('../app/data/wasser-infoseite.js', import.meta.url).pathname,
  'hwinfo',
);
function H_SICHER(text) {
  return W.istSchemaSicher(text);
}

test('die Abgrenzung führt die sechs Begriffe des Auftrags', () => {
  const namen = H.ABGRENZUNG.zeilen.map((z) => z.begriff.toLowerCase());
  for (const b of ['hexagonal', 'strukturiert', 'kohärent', 'ez', 'belebt', 'eis ih'])
    assert.ok(
      namen.some((n) => n.includes(b)),
      `Begriff "${b}" fehlt in der Abgrenzung`,
    );
  for (const z of H.ABGRENZUNG.zeilen)
    assert.ok(z.bedeutung && z.beleg, `Zeile ${z.begriff} unvollständig`);
});

test('die Winkel kommen aus dem SSoT-Konsumenten (eine Zahlenhaltung)', () => {
  const winkel = SSOT.bilder.find((b) => b.id === 'winkel');
  const alles = alleTexte().join('\n');
  assert.ok(alles.includes(winkel.von.anzeige));
  assert.ok(alles.includes(winkel.nach.anzeige));
});

test('strukturierte Daten: Article, FAQPage, DefinedTermSet', () => {
  const knoten = H.strukturierteDaten();
  const typen = knoten.map((k) => k['@type']);
  assert.deepEqual(typen, ['Article', 'FAQPage', 'DefinedTermSet']);
  const [artikel, faq, set] = knoten;
  assert.equal(artikel.headline, H.SEITE.h1);
  assert.ok(artikel.citation.length >= 10);
  assert.equal(faq.mainEntity.length, H.FRAGEN.length);
  assert.equal(set.hasDefinedTerm.length, H.ABGRENZUNG.zeilen.length);
  assert.doesNotMatch(JSON.stringify(knoten), /\{q:|\{l:/);
});

test('Titel und Beschreibung: Frage vorn, Länge im Suchergebnis', () => {
  assert.ok(H.SEITE.titel.length <= 60, `Titel ${H.SEITE.titel.length}`);
  assert.ok(H.SEITE.beschreibung.length <= 160, 'Beschreibung zu lang');
  assert.match(H.SEITE.titel, /^Was ist hexagonales Wasser\?/);
  assert.equal(H.SEITE.h1, 'Was ist hexagonales Wasser?');
});

test('die Route trägt canonicalLink und kein noindex', () => {
  const route = readFileSync(
    new URL('../app/routes/pages.was-ist-hexagonales-wasser.jsx', import.meta.url),
    'utf8',
  );
  assert.match(route, /canonicalLink\(SEITE\.pfad\)/);
  // Ein noindex wäre ein Meta-Wert in Anführungszeichen; der Kommentar der
  // Route nennt das Wort und zählt nicht.
  assert.doesNotMatch(route, /['"][^'"\n]*noindex/);
  const seo = readFileSync(new URL('../app/lib/seo.js', import.meta.url), 'utf8');
  assert.match(seo, /pfad: '\/pages\/was-ist-hexagonales-wasser'/);
});

test('die beiden Seiten verweisen aufeinander', () => {
  assert.ok(H.WEITER.some((w) => w.to === W.PFAD));
  assert.ok(W.WEITER.some((w) => w.to === H.PFAD));
});
