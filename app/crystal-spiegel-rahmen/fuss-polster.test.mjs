import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const lies = (pfad) => readFileSync(new URL(pfad, import.meta.url), 'utf8');

test('Hülle hält dem Fuß Platz frei, solange die Kaufleiste sichtbar ist', () => {
  const css = lies('../styles/crystal-spiegel-rahmen.css');
  assert.match(css, /body:has\(#ccsp \.cc-kaufleiste:not\(\[hidden\]\)\) footer \{\s*padding-bottom:/);
  assert.match(css, /body:has\(#ccsp \.cc-kaufleiste:not\(\[hidden\]\)\) #ccsp \{\s*padding-bottom: 0 !important;/);
});

test('Jede Spiegel-Seite lädt die Regeln der Hülle', () => {
  const jsx = lies('./SpiegelRahmen.jsx');
  assert.match(jsx, /import rahmenStil from '~\/styles\/crystal-spiegel-rahmen\.css\?url';/);
  assert.match(jsx, /\[\.\.\.SPIEGEL_STILE, rahmenStil\]/);
});
