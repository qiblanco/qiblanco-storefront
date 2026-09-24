// Hermetische Tests der Seite /pages/forschung (Christian, 24.09.2026: „Die
// Page heißt /pages/forschung. Nicht crawlen, nicht veröffentlicht.“).
// node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausführen: node --test test/forschung-seite.test.mjs
//
// WAS DIESE DATEI PRÜFT: die Zusagen des Datenmoduls am Quelltext. Jede
// Studienzahl steht wörtlich in der Studie, auf die sie sich beruft; jedes
// Warum trägt Befund, Hypothese und Versuch; kein Körper- oder
// Heilversprechen; die Pflichtbegriffe des Auftrags stehen im Text; jeder
// Abschnitt führt weiter; die Route trägt noindex statt canonical; keine
// andere Datei unter app/ verlinkt die Seite. Ob sie LIVE versteckt ist und
// ihre Zahlen mit den Studienseiten übereinstimmen, misst
// worker-pool/pruefungen/probe_forschung_seite_warums_zahlen_versteckt__20260924.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

import {ladeMitAufgeloestenImporten} from './route-import-aufloesung.mjs';

const WURZEL = new URL('..', import.meta.url).pathname;
const DATEI = join(WURZEL, 'app/data/forschung-seite.js');
const F = await ladeMitAufgeloestenImporten(DATEI, 'foseite');

// Die Route OHNE Kommentare: ihr Kopfkommentar beschreibt die Freigabe
// (canonical statt noindex) und darf den Test nicht täuschen.
const ROUTE = readFileSync(join(WURZEL, 'app/routes/pages.forschung.jsx'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
const SEO = readFileSync(join(WURZEL, 'app/lib/seo.js'), 'utf8');

/** Studientext je Slug, aus den übersetzten Originalarbeiten. */
const STUDIE = {};
for (const n of ['e0001', 'e0002', 'e0003', 'e0004', 'e0005']) {
  const roh = readFileSync(join(WURZEL, `app/data/studien/${n}.json`), 'utf8');
  STUDIE[JSON.parse(roh).slug] = roh.replace(/\u00a0/g, ' ');
}

function alleTexte() {
  const t = [F.SEITE.titel, F.SEITE.beschreibung, F.SEITE.dachzeile, F.SEITE.h1, ...F.SEITE.kurz];
  t.push(F.WEG.legende, F.WEG.hier, ...F.WEG.stufen.flatMap((s) => [s.name, s.zeile]));
  for (const s of F.SPROSSEN) t.push(s.titel, s.text);
  for (const r of F.STUDIEN_RAHMEN) t.push(r.titel, r.produkt, r.ergebnis, ...r.zeilen.flat());
  for (const w of F.WARUMS) {
    t.push(w.frage, w.befund, w.hypothese, w.versuch);
    if (w.grafik) t.push(w.grafik.titel, w.grafik.legende);
    if (w.link) t.push(w.link.text);
  }
  for (const a of F.ABSCHNITTE) {
    t.push(a.marke, a.titel, ...a.absaetze);
    for (const k of ['rahmenTitel', 'reproTitel', 'reproIntro', 'reproSchluss', 'naechsterTitel', 'schluss']) {
      if (a[k]) t.push(a[k]);
    }
    for (const s of a.stufen || []) t.push(s.name, s.text);
    if (a.fliegen) t.push(a.fliegen.titel, ...a.fliegen.absaetze);
    for (const x of a.naechster || []) t.push(x);
    for (const h of a.hebel || []) t.push(h.titel, h.text);
    for (const s of a.spalten || []) t.push(s.titel, ...s.punkte);
    if (a.einladung) t.push(a.einladung.titel, a.einladung.text, a.einladung.knopf.text, a.einladung.neben.text);
    if (a.weiter) t.push(a.weiter.text);
  }
  return t.map(String);
}

const TEXT = alleTexte().join('\n');

// Dieselben Muster wie Arm H der Erfüllungsprobe plus die Körpersperre der
// GitterChip-Seite. Sie stehen hier ein zweites Mal, weil ein Test, der den
// Prüfer importiert, nur prüft, dass der Prüfer sich selbst glaubt.
const SPERRE_HEIL = [
  /st(ä|ae)rk\w* (dein|das|ihr|unser) Immunsystem/i,
  /sch(ü|ue)tz\w* (deine |die |unsere )?Zellen vor/i,
  /vor Viren/i,
  /\bheil(t|en|ung|end)\b/i,
  /verhinder\w* Krankheit/i,
  /sch(ü|ue)tz\w* (dich|deinen K(ö|oe)rper) vor/i,
  /Therapie|therapeut/i,
  /Krankheit|Erkrankung/i,
];

test('kein Körper- oder Heilversprechen', () => {
  for (const text of alleTexte()) {
    for (const rx of SPERRE_HEIL) assert.doesNotMatch(text, rx, text);
  }
});

test('die Pflichtbegriffe des Auftrags stehen im Text, mindestens sechs Warums', () => {
  for (const rx of [/reproduzierbar/i, /Grundlagenforschung/i, /weltweit/i, /Aerodynamik|Fliegen/i]) {
    assert.match(TEXT, rx);
  }
  // Gerendert kommt je Warum-Karte noch die Marke „Warum N“ dazu; hier zählt
  // allein das Datenmodul, also die strengere Untergrenze.
  assert.ok((TEXT.match(/Warum/gi) || []).length >= 6);
  assert.ok(F.WARUMS.length >= 6, `nur ${F.WARUMS.length} Warums`);
});

test('jedes Warum trägt Frage, Befund, Hypothese und Versuch', () => {
  const ids = new Set();
  for (const w of F.WARUMS) {
    assert.match(w.frage, /^Warum /, w.id);
    assert.match(w.frage, /\?$/, w.id);
    for (const k of ['befund', 'hypothese', 'versuch']) {
      assert.ok(typeof w[k] === 'string' && w[k].length >= 40, `${w.id}.${k} fehlt oder ist zu kurz`);
    }
    assert.ok(!ids.has(w.id), `doppelte id ${w.id}`);
    ids.add(w.id);
  }
  assert.deepEqual(
    F.WARUM_TEILE.map((t) => t.feld),
    ['befund', 'hypothese', 'versuch'],
  );
});

test('Christians zwei genannte Warums stehen vorn', () => {
  assert.match(F.WARUMS[0].frage, /Zellarten/);
  assert.match(F.WARUMS[1].frage, /Ferne/);
});

test('jede Studienzahl steht wörtlich in ihrer Studie', () => {
  const paare = [];
  for (const r of F.STUDIEN_RAHMEN) {
    for (const z of r.zahlen) paare.push([r.studie, z, r.titel]);
    const karte = [r.ergebnis, ...r.zeilen.flat()].join(' ');
    for (const z of r.zahlen) assert.ok(karte.includes(z), `${r.titel}: ${z} steht nicht auf der Karte`);
  }
  for (const w of F.WARUMS) {
    for (const z of w.zahlen || []) {
      paare.push([w.studie, z, w.id]);
      assert.ok(w.befund.includes(z), `${w.id}: ${z} steht nicht im Befund`);
    }
    for (const z of w.zweitzahlen || []) {
      paare.push([w.zweitstudie, z, w.id]);
      assert.ok(w.befund.includes(z), `${w.id}: ${z} steht nicht im Befund`);
    }
    if (w.grafik && w.grafik.typ === 'zellarten') {
      for (const g of w.grafik.werte) paare.push([w.studie, g.anzeige.replace(' %', ''), `${w.id}/${g.name}`]);
    }
  }
  assert.ok(paare.length >= 30, `nur ${paare.length} Zahlen geprüft`);
  for (const [slug, zahl, wo] of paare) {
    assert.ok(STUDIE[slug], `${wo}: unbekannte Studie ${slug}`);
    assert.ok(STUDIE[slug].includes(zahl), `${wo}: „${zahl}“ steht nicht in ${slug}`);
  }
});

test('jede Zahl im Befund eines Warums ist einer Studie zugeordnet', () => {
  for (const w of F.WARUMS) {
    const zugeordnet = [...(w.zahlen || []), ...(w.zweitzahlen || [])].join(' ');
    // Zahlen mit Komma oder Einheit, die aus einer Studie stammen müssen.
    for (const m of w.befund.matchAll(/\d+(,\d+)?\s?(%|mM|Meter|km|Stunden)/g)) {
      const kern = m[0].replace(/\s/, ' ');
      const ohneEinheit = m[0].split(/\s|%/)[0];
      assert.ok(
        zugeordnet.includes(kern) || zugeordnet.includes(ohneEinheit),
        `${w.id}: „${m[0]}“ ohne Studienzuordnung`,
      );
    }
  }
});

test('die Leiter: drei erreicht, Stufe-1-Stand folgt aus ihr', () => {
  const erreicht = F.SPROSSEN.filter((s) => s.stand === 'erreicht').length;
  assert.equal(F.SPROSSEN.length, 5);
  assert.equal(F.STAND_STUFE_1, erreicht / 5);
  for (const s of F.SPROSSEN) assert.ok(F.STAND_TEXT[s.stand], s.stand);
  const beweis = F.ABSCHNITTE.find((a) => a.id === 'beweis');
  assert.match(beweis.reproSchluss, new RegExp(`Sprosse ${erreicht}\\b`));
});

test('jeder Abschnitt führt weiter, der letzte endet mit der Einladung', () => {
  const anker = new Set(F.ABSCHNITTE.map((a) => a.anker));
  const letzter = F.ABSCHNITTE[F.ABSCHNITTE.length - 1];
  for (const a of F.ABSCHNITTE.slice(0, -1)) {
    assert.ok(a.weiter && anker.has(a.weiter.anker), `${a.id} ohne gültiges Weiter`);
  }
  assert.ok(!letzter.weiter);
  assert.match(letzter.einladung.knopf.href, /^mailto:info@qiblanco\.com/);
});

test('die Anzahl der Warums im Text folgt der Liste', () => {
  const standort = F.ABSCHNITTE.find((a) => a.id === 'standort');
  const worte = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
  assert.ok(standort.absaetze.join(' ').includes(`${worte[F.WARUMS.length]} Warums`));
});

test('versteckt: noindex in der Route, kein canonical, Sitemap-Sperre in seo.js', () => {
  assert.match(ROUTE, /name: 'robots', content: 'noindex,nofollow'/);
  assert.match(ROUTE, /headers = \(\) => \(\{'X-Robots-Tag': 'noindex, nofollow'\}\)/);
  assert.doesNotMatch(ROUTE, /canonical/i);
  const eintrag = SEO.match(/handle: 'forschung',\s*ausSitemap: (true|false)/);
  assert.ok(eintrag, 'Eintrag in NICHT_INDEXIERBARE_SEITEN_DEF fehlt');
  assert.equal(eintrag[1], 'true');
  const nurRoute = SEO.slice(SEO.indexOf('export const NUR_ROUTE_SEITEN'));
  assert.ok(!/['"/]forschung['"]/.test(nurRoute.slice(0, nurRoute.indexOf('];'))), 'steht in NUR_ROUTE_SEITEN');
});

test('keine andere Datei unter app/ verlinkt die Seite', () => {
  const eigene = new Set([
    'app/routes/pages.forschung.jsx',
    'app/data/forschung-seite.js',
    'app/components/campaign/ForschungSeite.jsx',
    'app/components/campaign/FoGrafiken.jsx',
  ]);
  const treffer = [];
  const lauf = (rel) => {
    for (const name of readdirSync(join(WURZEL, rel))) {
      const r = `${rel}/${name}`;
      const st = statSync(join(WURZEL, r));
      if (st.isDirectory()) lauf(r);
      else if (/\.(jsx?|mjs|json|ts|tsx)$/.test(name) && !eigene.has(r)) {
        // Kommentare zählen nicht: seo.js nennt die Seite in der Begründung
        // ihres Sitemap-Eintrags, und das ist kein Link.
        const code = readFileSync(join(WURZEL, r), 'utf8')
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/^\s*\/\/.*$/gm, '');
        if (/\/pages\/forschung(?![-\w])/.test(code)) treffer.push(r);
      }
    }
  };
  lauf('app');
  assert.deepEqual(treffer, []);
});
