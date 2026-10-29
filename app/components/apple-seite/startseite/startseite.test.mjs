// node --test app/components/apple-seite/startseite/startseite.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pruefeSeite, texteVon} from '../apple-seite-logik.js';
import {startseiteSektionen, GERAETE, KAUFSEITE} from './startseite-daten.js';

const ohneGeraete = (l) => l.filter((s) => s.art !== 'geraete');

test('beide Arme bestehen pruefeSeite (Hero zuerst, Anna, kein Preisanker, kein Konjunktiv)', () => {
  for (const arm of ['a', 'b']) assert.deepEqual(pruefeSeite(ohneGeraete(startseiteSektionen(arm))), [], arm);
});

test('GS-081 bleibt je Arm unterscheidbar', () => {
  const a = startseiteSektionen('a');
  const b = startseiteSektionen('b');
  assert.equal(b[0].cta2, undefined, 'B: ein Knopf im Kopf');
  assert.ok(a[0].cta2, 'A: zwei Knöpfe im Kopf');
  const laborB = b.find((s) => s.etikett === 'Wissenschaft');
  assert.equal(laborB.cta.href, KAUFSEITE, 'B: Kaufknopf nach dem Laborbefund');
  assert.ok(b.findIndex((s) => s.art === 'geraete') < a.findIndex((s) => s.art === 'geraete'), 'B: Geräte früher');
});

test('jedes Ziel trägt genau eine Beschriftung', () => {
  const je = new Map();
  for (const arm of ['a', 'b']) {
    for (const s of startseiteSektionen(arm)) {
      for (const c of [s.cta, s.cta2].filter(Boolean)) {
        je.set(c.href, new Set([...(je.get(c.href) ?? []), c.text]));
      }
    }
  }
  for (const g of GERAETE.liste) je.set(g.kaufen, new Set([...(je.get(g.kaufen) ?? []), 'Jetzt kaufen']));
  for (const [ziel, texte] of je) assert.equal(texte.size, 1, `${ziel}: ${[...texte]}`);
});

test('kein Preisanker in der Gerätereihe', () => {
  const t = texteVon(GERAETE).join(' ');
  assert.doesNotMatch(t, /14\.000|4,8|★|Ultimate Power/);
});
