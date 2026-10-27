// Hermetische Tests der Live-Anmeldung Qi Alpha und der Daten von Variante B
// (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s04).
// Bordmittel node:test/node:assert, KEIN Netz. Ausführen:
//   node --test test/the-alpha-live-anmeldung.test.mjs (läuft in der PR-Suite mit)
// ARME: NAHT (Einwilligung, Version und Feldnamen gleichen der Action von
// /pages/live, sonst lehnt sie still als 'einwilligung'/'eingabe' ab),
// FORM (echtes <form> mit E-Mail-Feld an /pages/live), FILM (Geschichte wie A,
// je Kapitel ein Nutzen-Akzent, seit 26.10.; Ende am Knopf seit 27.10.), ALTLAST (kein „Qi Master“, keine Treppe).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import * as B from '../app/components/campaign/the-alpha-variante-b-daten.js';

const hier = dirname(fileURLToPath(import.meta.url));
const lies = (...teile) => readFileSync(join(hier, ...teile), 'utf8');
const BAUSTEIN = lies('..', 'app', 'components', 'campaign', 'TheAlphaLiveAnmeldung.jsx');
const LIVE = lies('..', 'app', 'routes', 'pages.live.jsx');
const SEITE = lies('..', 'app', 'components', 'campaign', 'TheAlphaVarianteB.jsx');

/** Wert einer String-Konstante, auch wenn sie aus 'a' + 'b' zusammengesetzt ist. */
function konstante(quelle, name) {
  const m = quelle.match(new RegExp(`(?:export )?const ${name} =([\\s\\S]*?);\\n`));
  assert.ok(m, `Konstante ${name} nicht gefunden`);
  const teile = [...m[1].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((t) => t[1]);
  assert.ok(teile.length > 0, `Konstante ${name} ist kein String-Literal`);
  return teile.join('');
}

test('NAHT: Einwilligungs-Version gleicht /pages/live', () => {
  assert.equal(konstante(BAUSTEIN, 'EINWILLIGUNG_VERSION'), konstante(LIVE, 'EINWILLIGUNG_VERSION'));
});

test('NAHT: Einwilligungs-Wortlaut gleicht /pages/live Zeichen für Zeichen', () => {
  assert.equal(konstante(BAUSTEIN, 'EINWILLIGUNG_TEXT'), konstante(LIVE, 'EINWILLIGUNG_TEXT'));
});

test('NAHT: Feldnamen sind die, die die Action von /pages/live liest', () => {
  for (const feld of ['intent', 'name', 'email', 'einwilligung_version', 'hp']) {
    assert.match(LIVE, new RegExp(`form\\.get\\('${feld}'\\)|eingabePruefen\\(form`), `Action liest ${feld} nicht`);
    assert.match(BAUSTEIN, new RegExp(`name="${feld}"`), `Baustein sendet ${feld} nicht`);
  }
  assert.match(LIVE, /export async function action/);
});

test('FORM: echtes Formular mit E-Mail-Feld an /pages/live', () => {
  assert.equal(konstante(BAUSTEIN, 'LIVE_ACTION'), '/pages/live');
  assert.match(BAUSTEIN, /<fetcher\.Form[\s\S]*?method="post"[\s\S]*?action=\{LIVE_ACTION\}/);
  assert.match(BAUSTEIN, /data-qa-live-anmeldung=""/);
  assert.match(BAUSTEIN, /type="email"/);
  assert.match(BAUSTEIN, /export function TheAlphaLiveAnmeldung\(/);
});

test('FILM: B erzählt Christians Geschichte, je Kapitel ein Nutzen-Akzent', () => {
  // Seit 26.10.2026 (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-
  // premium-gestaltung, s02): Reihenfolge wie A (Christian Z7/Z8), Feinheit von
  // B ist der Akzent unter Christians Zeilen (Z9). Seit 27.10.2026 (Christian
  // Z258–Z263: „Die Seite muss hier aufhören“) endet B mit dem Knopf; Live und
  // Fragen stehen nicht mehr auf der Seite (Wächter: the-alpha-lp-ende.test.mjs).
  for (const id of ['manifestation', 'protection', 'longevity']) {
    const a = B.TAB_AKZENT[id];
    assert.ok(typeof a === 'string' && a.trim().length > 20, `Akzent zu ${id} fehlt`);
    assert.ok(a.split(/[.!?](\s|$)/).filter((t) => t && t.trim()).length === 1, `Akzent zu ${id} ist mehr als ein Satz`);
  }
  const reihe = [
    '<TapTitelkarte />',
    '<TapWoerterbuch />',
    '<TapFilm ',
    'abschnitt={MANIFESTATION} akzent={TAB_AKZENT.manifestation}',
    'abschnitt={PROTECTION} akzent={TAB_AKZENT.protection}',
    'abschnitt={LONGEVITY} akzent={TAB_AKZENT.longevity}',
    '<TapMarke ',
    '<TapEdition>',
  ];
  const pos = reihe.map((r) => SEITE.indexOf(r));
  assert.ok(pos.every((p) => p > 0), `Szene fehlt: ${reihe[pos.indexOf(-1)]}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'Reihenfolge der Szenen geändert');
  assert.match(SEITE, /<TapSeite variante="b">/);
});

test('ALTLAST: kein Qi Master, keine Rabattstaffel oder Vorverkaufstreppe', () => {
  const daten = JSON.stringify(B);
  for (const wort of ['Qi Master', 'Vorverkaufstreppe', 'Rabattstaffel', 'Frühbucher', 'Platzhalter', 'Karat']) {
    assert.ok(!daten.includes(wort), `„${wort}“ in den Daten von B`);
  }
  assert.ok(!/\d+\s*%\s*Rabatt/i.test(daten), 'Rabatt in Prozent in den Daten von B');
});
