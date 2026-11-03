// Erst jede Person einmal, dann die Wiederholungen (lib/reihe-erst-jede-person.js).
// Lauf: node --test (findet *.test.mjs im ganzen Baum).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reiheErstJedePerson, personVon} from './reihe-erst-jede-person.js';
import {IG_TESTIMONIALS} from '../data/ig-testimonials.js';

const reihe = (profile) =>
  reiheErstJedePerson([...profile].map((profil, i) => ({profil, code: String(i)})))
    .map(personVon)
    .join('');

test('ohne Wiederholung bleibt die Reihe, wie sie ist', () => {
  assert.equal(reihe('abc'), 'abc');
});

test('erst jede Person einmal, dann die Wiederholungen in derselben Reihenfolge', () => {
  assert.equal(reihe('aabbc'), 'abcab');
  assert.equal(reihe('abcabd'), 'abcdab');
});

test('an der Rundengrenze nie dieselbe Person nebeneinander', () => {
  assert.equal(reihe('baab'), 'baba');
});

test('nur noch eine Person übrig: keine andere Reihe möglich', () => {
  assert.equal(reihe('aaa'), 'aaa');
});

test('Person ist `person` vor `profil`, ohne Groß/Klein', () => {
  const r = reiheErstJedePerson([
    {profil: 'A', code: '1'},
    {profil: 'zweitkonto', person: 'a', code: '2'},
    {profil: 'b', code: '3'},
  ]);
  assert.deepEqual(r.map((t) => t.code), ['1', '3', '2']);
});

test('Kakao-Reihe aus Christians Beispiel (02.11.2026)', () => {
  const k = [
    ['geldhelden_org', '2026-11-02'], ['vanessastehler', '2026-02-05'],
    ['maxxpansion', '2026-06-11'], ['maxxpansion', '2026-04-09'],
    ['flucid.temple', '2026-08-27'], ['friquencita', '2026-04-02'],
    ['friquencita', '2026-04-28'],
  ].map(([profil, datum], i) => ({profil, datum, code: String(i)}))
    .sort((a, b) => b.datum.localeCompare(a.datum));
  assert.deepEqual(reiheErstJedePerson(k).map(personVon), [
    'geldhelden_org', 'flucid.temple', 'maxxpansion', 'friquencita',
    'vanessastehler', 'maxxpansion', 'friquencita',
  ]);
});

test('jede Produktreihe des Bestands: jede Person zuerst einmal', () => {
  for (const p of new Set(IG_TESTIMONIALS.map((t) => t.produkt))) {
    const h = reiheErstJedePerson(
      IG_TESTIMONIALS.filter((t) => t.produkt === p && t.inDerReihe === true),
    ).map(personVon);
    const n = new Set(h).size;
    assert.equal(new Set(h.slice(0, n)).size, n, p);
  }
});
