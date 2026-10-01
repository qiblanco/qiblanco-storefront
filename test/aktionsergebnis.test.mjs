// Die Antwort einer Formular-Aktion überlebt eine Revalidierung, und nur die
// (Job 20261001-kontakt-produktberatung-revalidierung-wirft-erfolgsmeldung-weg-
// prio30, Folge von F-2566/PR #724). Ausführen: node --test test/aktionsergebnis.test.mjs
//
// A1 ist der Defekt: nach einer Revalidierung (gleicher location.key,
// actionData null) muss die Antwort stehen bleiben. A2 ist die Gegenrichtung:
// eine echte Navigation (neuer Schlüssel) darf sie nicht unterschieben. Ein
// Test nur auf A1 wäre auch grün, wenn der Hook die erste Antwort für immer
// hielte. A3 hält den Aufrufer-Bestand: keine Formularseite liest rohes
// useActionData() — eine neue würde den Defekt still zurückbringen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {halteAktionsergebnis} from '../app/lib/aktionsergebnis.js';

const LEER = {key: null, data: null};
const ANTWORT = {ok: true};

test('A1: Revalidierung (gleicher Schlüssel, actionData null) hält die Antwort', () => {
  let h = halteAktionsergebnis(LEER, ANTWORT, 'k1');
  assert.equal(h.data, ANTWORT);
  h = halteAktionsergebnis(h, undefined, 'k1');
  assert.equal(h.data, ANTWORT);
  h = halteAktionsergebnis(h, null, 'k1');
  assert.equal(h.data, ANTWORT);
});

test('A2: echte Navigation (neuer Schlüssel) räumt, neue Antwort ersetzt', () => {
  let h = halteAktionsergebnis(LEER, ANTWORT, 'k1');
  h = halteAktionsergebnis(h, undefined, 'k2');
  assert.equal(h.data, null);
  h = halteAktionsergebnis(h, undefined, 'k2');
  assert.equal(h.data, null);
  const zweite = {ok: false, error: 'x'};
  h = halteAktionsergebnis(halteAktionsergebnis(LEER, ANTWORT, 'k1'), zweite, 'k1');
  assert.equal(h.data, zweite);
  assert.equal(halteAktionsergebnis(LEER, undefined, 'k0').data, null);
});

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');
function dateien(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.(jsx?|tsx?)$/.test(n) ? [p] : [];
  });
}

test('A3: useActionData() nur im gemeinsamen Hook', () => {
  const roh = dateien(APP)
    .filter((p) => /\buseActionData\s*\(/.test(readFileSync(p, 'utf8')))
    .map((p) => relative(APP, p));
  assert.deepEqual(roh, ['lib/aktionsergebnis.js']);
});
