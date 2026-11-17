// Anmeldeweiche ohne ActiveCampaign-Rückfall (Elina EL-20261110-5a9e5746, Punkt 3: "Künftig Formulare/Neueinsteiger
// nie mehr an den AC-Stopp koppeln"; seit 17.11.2026 ganz ohne AC-Weg, Elina EL-20261117-190e62ed). Hermetisch, ohne Browser.
// Ausführen:  node --test app/components/reusables/anmelde-weiche-entscheidung.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {RUECKFALL_ANZEIGE} from './anmelde-rueckfallstand.js';
import {RUECKFALL_VERSATZ_MS, weicheEntscheiden} from './anmelde-weiche-entscheidung.js';

const hier = dirname(fileURLToPath(import.meta.url));
const BEKANNT = ['13', '15', '21', '25', '27', '33', '7', '9', 'cc-21'];
// Wie ac-eingang/src/formulare.py einwilligung_id(): sha256 des Satzes mit einfachen Leerzeichen, 12 Zeichen.
const kennung = (satz) => createHash('sha256').update(satz.split(/\s+/).filter(Boolean).join(' '), 'utf8').digest('hex').slice(0, 12);
const anzeige = (id) => ({...RUECKFALL_ANZEIGE[id]});

test('Rückfallstand: alle bekannten Formulare, jede Kennung passt zu ihrem Satz', () => {
  assert.deepEqual(Object.keys(RUECKFALL_ANZEIGE).sort(), [...BEKANNT].sort());
  for (const id of BEKANNT) {
    const a = RUECKFALL_ANZEIGE[id];
    assert.equal(a.einwilligung_id, kennung(a.einwilligung), `Formular ${id}`);
    assert.ok(a.knopf.trim() && a.vorname_feld.trim(), `Formular ${id}`);
  }
});

for (const id of BEKANNT) {
  test(`Formular ${id}: /w antwortet nicht -> eigenes Formular aus dem Rückfallstand, nie AC`, () => {
    const lage = weicheEntscheiden(id, null);
    assert.equal(lage.weg, 'eigen');
    assert.equal(lage.quelle, 'rueckfallstand');
    assert.equal(lage.rueckfallAc, false);
    assert.equal(lage.anzeige.einwilligung_id, RUECKFALL_ANZEIGE[id].einwilligung_id);
    assert.equal(lage.versatz, RUECKFALL_VERSATZ_MS);
  });
}

test('auch ein ausdrückliches ac zeigt das eigene Formular, nie AC (EL-20261117-190e62ed)', () => {
  for (const id of BEKANNT) {
    const mit = weicheEntscheiden(id, {formulare: {[id]: 'ac'}, anzeige: {[id]: anzeige(id)}});
    assert.equal(mit.weg, 'eigen', `Formular ${id}`);
    assert.equal(mit.quelle, 'w');
    assert.equal(mit.rueckfallAc, false);
    const ohne = weicheEntscheiden(id, {formulare: {[id]: 'ac'}, anzeige: {}});
    assert.equal(ohne.weg, 'eigen', `Formular ${id} ohne Satz`);
    assert.equal(ohne.quelle, 'rueckfallstand');
  }
  assert.equal(weicheEntscheiden('15', {formulare: {15: 'ac'}, anzeige: {15: anzeige('15')}}, true).weg, 'eigen');
});

test('/w meldet eigen -> Satz, Versatz und rueckfall_ac aus /w', () => {
  const w = {formulare: {13: 'eigen'}, anzeige: {13: {...anzeige('13'), einwilligung: 'Neu.', einwilligung_id: '0123456789ab'}}, versatz: 1234, rueckfall_ac: false};
  const lage = weicheEntscheiden('13', w);
  assert.equal(lage.quelle, 'w');
  assert.equal(lage.anzeige.einwilligung, 'Neu.');
  assert.equal(lage.versatz, 1234);
  assert.equal(lage.rueckfallAc, false);
});

test('/w kennt das Formular nicht oder liefert keinen vollständigen Satz -> Rückfallstand mit dem Versatz aus /w', () => {
  const ohne = weicheEntscheiden('21', {formulare: {}, anzeige: {}, versatz: 50});
  assert.equal(ohne.quelle, 'rueckfallstand');
  assert.equal(ohne.versatz, 50);
  const halb = weicheEntscheiden('21', {formulare: {21: 'eigen'}, anzeige: {21: {einwilligung: 'x'}}, versatz: 7});
  assert.equal(halb.quelle, 'rueckfallstand');
});

test('ausdrücklich abgeschaltet (aus) -> Hinweiszeile, kein Formular aus dem Rückfallstand', () => {
  assert.deepEqual(weicheEntscheiden('15', {formulare: {15: 'aus'}, anzeige: {}}), {weg: 'hinweis'});
});

test('kein Satz ohne Kennung: unbekanntes Formular ohne /w -> Hinweiszeile', () => {
  assert.deepEqual(weicheEntscheiden('999', null), {weg: 'hinweis'});
});

test('Quelltext: kein Fehlerweg der Weiche endet beim AC-Formular', () => {
  const q = readFileSync(join(hier, 'Anmeldeweiche.jsx'), 'utf8');
  const weiche = q.slice(q.indexOf('export function AnmeldeWeiche'), q.indexOf('function EigenesFormular'));
  assert.doesNotMatch(weiche, /setLage\(\{weg: 'ac'\}\)/);
  assert.match(weiche, /weicheEntscheiden\(/);
  assert.match(weiche, /data-anmeldeweg="hinweis"/);
});

test('rueckfall_ac fehlt oder ist kein true -> kein AC-Rückfall nach dem Absenden (Gegenprüfung 12.11.)', () => {
  for (const r of [undefined, 'false', 'true', 1, null]) {
    const w = {formulare: {15: 'eigen'}, anzeige: {15: anzeige('15')}};
    if (r !== undefined) w.rueckfall_ac = r;
    assert.equal(weicheEntscheiden('15', w).rueckfallAc, false, `rueckfall_ac=${String(r)}`);
  }
  // Seit 17.11.2026 öffnet auch ein ausdrückliches true keinen AC-Rückfall mehr.
  assert.equal(weicheEntscheiden('15', {formulare: {15: 'eigen'}, anzeige: {15: anzeige('15')}, rueckfall_ac: true}).rueckfallAc, false);
});

test('Quelltext: kein AC-Embed mehr in Weiche, Formular-Hülle und Fußzeile (EL-20261117-190e62ed)', () => {
  for (const datei of ['Anmeldeweiche.jsx', 'ActiveCampaignForm.jsx', join('..', 'Footer.jsx')]) {
    const q = readFileSync(join(hier, datei), 'utf8');
    assert.doesNotMatch(q, /activehosted\.com/, datei);
    assert.doesNotMatch(q, /weg === 'ac'/, datei);
    assert.doesNotMatch(q, /\bac=\{/, datei);
  }
});

test('Kennung aus /w unbrauchbar (leer, Leerzeichen, Objekt) -> Satz aus dem Rückfallstand, nie Satz ohne Kennung', () => {
  for (const k of ['', ' ', {}, 12, 'xyz']) {
    const lage = weicheEntscheiden('13', {formulare: {13: 'eigen'}, anzeige: {13: {...anzeige('13'), einwilligung: 'Anders.', einwilligung_id: k}}});
    assert.equal(lage.quelle, 'rueckfallstand', `kennung=${JSON.stringify(k)}`);
    assert.equal(lage.anzeige.einwilligung_id, RUECKFALL_ANZEIGE['13'].einwilligung_id);
  }
});
