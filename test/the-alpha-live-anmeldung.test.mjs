// Hermetische Tests der Live-Anmeldung Qi Alpha und der Daten von Variante B
// (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s04).
// Bordmittel node:test/node:assert, KEIN Netz. Ausführen:
//   node --test app/components/campaign/the-alpha-live-anmeldung.test.mjs
// ARME: NAHT (Einwilligung, Version und Feldnamen gleichen der Action von
// /pages/live, sonst lehnt sie still als 'einwilligung'/'eingabe' ab),
// FORM (echtes <form> mit E-Mail-Feld an /pages/live), NUTZEN (3 bis 5
// Vorteile, jeder mit Grundlage), ALTLAST (kein „Qi Master“, keine Treppe).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import * as B from './the-alpha-variante-b-daten.js';

const hier = dirname(fileURLToPath(import.meta.url));
const lies = (...teile) => readFileSync(join(hier, ...teile), 'utf8');
const BAUSTEIN = lies('TheAlphaLiveAnmeldung.jsx');
const LIVE = lies('..', '..', 'routes', 'pages.live.jsx');
const SEITE = lies('TheAlphaVarianteB.jsx');

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

test('NUTZEN: 3 bis 5 Vorteile, jeder mit sichtbarer Grundlage', () => {
  const v = B.TAB_NUTZEN.vorteile;
  assert.ok(v.length >= 3 && v.length <= 5, `${v.length} Vorteile`);
  for (const x of v) {
    assert.ok(x.titel.trim().length > 0);
    assert.ok(x.grundlage.trim().length > 20, `Grundlage zu ${x.id} fehlt`);
  }
  // Die Seite rendert den Nutzen-Block zuerst.
  const reihe = ['<Nutzen />', '<Vorlage />', '<Inhalt />', '<Belege />', '<Einwaende />', '<Preis ', '<Live />', '<Fragen />'];
  const pos = reihe.map((r) => SEITE.indexOf(r));
  assert.ok(pos.every((p) => p > 0), `Abschnitt fehlt: ${reihe[pos.indexOf(-1)]}`);
  assert.deepEqual([...pos].sort((a, b) => a - b), pos, 'Reihenfolge der Abschnitte geändert');
});

test('ALTLAST: kein Qi Master, keine Rabattstaffel oder Vorverkaufstreppe', () => {
  const daten = JSON.stringify(B);
  for (const wort of ['Qi Master', 'Vorverkaufstreppe', 'Rabattstaffel', 'Frühbucher', 'Platzhalter', 'Karat']) {
    assert.ok(!daten.includes(wort), `„${wort}“ in den Daten von B`);
  }
  assert.ok(!/\d+\s*%\s*Rabatt/i.test(daten), 'Rabatt in Prozent in den Daten von B');
});
