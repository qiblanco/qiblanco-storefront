// Quelltext-Pflichten des Rückfall-Puffers in Anmeldeweiche und „Wieder lieferbar“ (Elina EL-20261107-af9594f2,
// Punkt 4). Die Logik selbst prüft anmelde-puffer.test.mjs hermetisch; hier steht, dass beide Formulare sie benutzen.
// Ausführen:  node --test app/components/reusables/anmelde-weiche-puffer.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const hier = dirname(fileURLToPath(import.meta.url));
const lies = (n) => readFileSync(join(hier, n), 'utf8');

for (const datei of ['Anmeldeweiche.jsx', 'WiederLieferbar.jsx']) {
  test(`${datei}: sendet über zustellen(), nie mehr nackt an /f/`, () => {
    const q = lies(datei);
    assert.match(q, /from '\.\/anmelde-puffer'/);
    assert.match(q, /await zustellen\(/);
    assert.doesNotMatch(q, /fetch\(\s*`\$\{ANMELDE_ENDPUNKT\}\/f\//);
    assert.match(q, /if \(ergebnis\.gepuffert\)/);
    assert.match(q, /'gepuffert'/);
    assert.match(q, /starteNachschicken\(\{endpunkt: ANMELDE_ENDPUNKT\}\)/);
    assert.match(q, /beobachten\(/);
  });
}

test('Anmeldeweiche: die Fußzeile schickt auf JEDER Seite nach (Effekt der Weiche, nicht des Formulars)', () => {
  const q = lies('Anmeldeweiche.jsx');
  const weiche = q.slice(q.indexOf('export function AnmeldeWeiche'), q.indexOf('function EigenesFormular'));
  assert.match(weiche, /starteNachschicken\(\{endpunkt: ANMELDE_ENDPUNKT\}\)/);
  assert.match(q, /Wir haben deine Anmeldung\. Sie wird gleich übertragen\./);
  assert.match(q, /We have your sign-up\./);
});

test('Wieder lieferbar: Satz für den Wunsch, variant_id geht mit', () => {
  const q = lies('WiederLieferbar.jsx');
  assert.match(q, /Wir haben deinen Wunsch\. Er wird gleich übertragen\./);
  assert.match(q, /variant_id: String\(variantId\)/);
});
