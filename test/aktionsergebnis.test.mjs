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
//
// A4/A5 nach der adversarialen Prüfung (Punkt 6: A1-A3 blieben grün, wenn der
// Hook-Körper nur `return actionData` zurückgab). A4 fährt den ECHTEN Router
// (createMemoryRouter: POST, revalidate(), GET) durch die Halte-Logik — so
// zeigt der Test, dass genau location.key und actionData die Größen sind, die
// sich bei einer Revalidierung so verhalten, wie der Halt es annimmt. A5
// bindet den Hook-Körper an beide: ohne Aufruf von halteAktionsergebnis oder
// ohne den Schlüssel aus useLocation() wird er rot. Einen Render-Test gibt es
// nicht (keine DOM-Bibliothek im Repo); die Wirkung im Browser misst
// homepage-bauer/pruefungen/probe_formular_antwort_ueberlebt_revalidierung.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createMemoryRouter} from 'react-router';
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

const AUFRUFER = [
  'routes/pages.support.jsx',
  'components/campaign/ProduktberatungSeite.jsx',
  'routes/account.profile.jsx',
  'routes/account.addresses.jsx',
  'routes/widerruf_.bestaetigen.jsx',
];

test('A3: useActionData nur im gemeinsamen Hook, jeder Aufrufer nutzt ihn', () => {
  // Wortgrenze statt Aufruf: auch ein Import unter anderem Namen fällt auf.
  const roh = dateien(APP)
    .filter((p) => /\buseActionData\b/.test(readFileSync(p, 'utf8')))
    .map((p) => relative(APP, p));
  assert.deepEqual(roh, ['lib/aktionsergebnis.js']);
  for (const datei of AUFRUFER) {
    const text = readFileSync(join(APP, datei), 'utf8');
    assert.match(
      text,
      /import \{useAktionsergebnisUeberRevalidierung\} from '~\/lib\/aktionsergebnis';/,
      datei,
    );
    assert.match(text, /=\s*useAktionsergebnisUeberRevalidierung\(\)/, datei);
  }
});

test('A4: echter Router — POST, revalidate(), GET durch die Halte-Logik', async () => {
  const router = createMemoryRouter([
    {id: 'r', path: '/', action: async () => ({ok: true}), loader: () => null, Component: () => null},
  ]);
  router.initialize();
  let h = LEER;
  const schritt = () => {
    h = halteAktionsergebnis(h, router.state.actionData?.r, router.state.location.key);
    return h.data;
  };
  const fd = new FormData();
  fd.set('x', '1');
  await router.navigate('/', {formMethod: 'post', formData: fd});
  const antwort = schritt();
  assert.deepEqual(antwort, {ok: true});
  await router.revalidate();
  // Die Prämisse selbst: der Router räumt actionData, der Schlüssel bleibt.
  assert.equal(router.state.actionData, null);
  assert.deepEqual(schritt(), {ok: true});
  await router.navigate('/');
  assert.equal(schritt(), null);
  router.dispose();
});

test('A5: der Hook-Körper reicht actionData und location.key in den Halt', () => {
  const quelle = readFileSync(join(APP, 'lib/aktionsergebnis.js'), 'utf8');
  const rumpf = quelle.slice(quelle.indexOf('export function useAktionsergebnisUeberRevalidierung'));
  assert.match(rumpf, /const actionData = useActionData\(\);/);
  assert.match(rumpf, /const \{key\} = useLocation\(\);/);
  assert.match(rumpf, /halteAktionsergebnis\(gehalten\.current, actionData, key\)/);
  assert.match(rumpf, /return gehalten\.current\.data;/);
});
