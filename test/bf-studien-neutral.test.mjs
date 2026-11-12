// Elina EL-20261112-0a9978b4: keine Personen- oder Institutsnamen in den
// Studien-Kacheln der BF-Deal-Seiten, Zahlen und Studienlink bleiben.
import test from 'node:test';
import assert from 'node:assert/strict';
import {datenStudienNeutral, textNeutral} from '../app/components/black-friday-2026/bf-studien-neutral.js';
import * as D8K from '../app/components/product-pages/8kendiw34hd-alpha-daten.js';
import * as DPJDZ from '../app/components/product-pages/pjdz538hgs0-alpha-daten.js';
import * as DBR from '../app/components/product-pages/qibracelet-alpha-daten.js';
import * as DHOME from '../app/components/product-pages/qihome-air-alpha-daten.js';

const ZAHLEN = (s) => (s.match(/\d+(?:,\d+)?/g) ?? []).filter((z) => z !== '2').sort();

for (const [name, d] of Object.entries({D8K, DPJDZ, DBR, DHOME})) {
  test(`${name}: Wissens-Kacheln ohne Namen, Zahlen und Links bleiben`, () => {
    const vorher = JSON.stringify(d.WISSEN);
    const nachher = JSON.stringify(datenStudienNeutral(d).WISSEN);
    assert.ok(/dartsch/i.test(vorher), 'Rot-Arm: die Basisdaten nennen den Namen (sonst misst der Test nichts)');
    assert.doesNotMatch(nachher, /dartsch/i);
    assert.deepEqual(ZAHLEN(nachher.replace(/Prozent/g, '%')).filter((z) => !['84,7', '60,5'].includes(z)),
      ZAHLEN(vorher).filter((z) => !['84,7', '60,5'].includes(z)));
    for (const href of vorher.match(/\/pages\/[a-z0-9-]+/g) ?? []) assert.ok(nachher.includes(href), href);
    assert.equal(datenStudienNeutral(d).FAQ, d.FAQ, 'nur WISSEN wird umgeschrieben');
  });
}

test('Elinas Wortlaut für die Immunzellen-Kachel', () => {
  const d = datenStudienNeutral(D8K);
  const s = JSON.stringify(d.WISSEN);
  assert.ok(s.includes('In unserer Laborstudie wurden menschliche Immunzellen vier Stunden lang Handystrahlung ausgesetzt.'));
  assert.ok(s.includes('Ohne QiOne® 2 Pro behielten sie 60,5 % ihrer Abwehrleistung, mit ihm 84,7 %.'));
});

test('Quellenzeile verliert nur den Autor', () => {
  assert.equal(textNeutral('Peter C. Dartsch: Protective Effect of the QiBracelet® Against Oxidative Stress. Applied Cell Biology 12(1), 2024.'),
    'Protective Effect of the QiBracelet® Against Oxidative Stress. Applied Cell Biology 12(1), 2024.');
  assert.equal(textNeutral('Japan Journal of Medicine 2021'), 'Japan Journal of Medicine 2021');
});
