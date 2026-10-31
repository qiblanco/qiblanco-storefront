// node --test app/components/apple-seite/startseite/startseite.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pruefeSeite, texteVon} from '../apple-seite-logik.js';
import {startseiteSektionen, MODELLE, KAUFSEITE} from './startseite-daten.js';

const ohneModelle = (l) => l.filter((s) => s.art !== 'modelle');

test('beide Arme bestehen pruefeSeite (Hero zuerst, Anna, kein Preisanker, kein Konjunktiv)', () => {
  for (const arm of ['a', 'b']) assert.deepEqual(pruefeSeite(ohneModelle(startseiteSektionen(arm))), [], arm);
});

test('GS-081 bleibt je Arm unterscheidbar', () => {
  const a = startseiteSektionen('a');
  const b = startseiteSektionen('b');
  assert.equal(b[0].cta2, undefined, 'B: ein Knopf im Kopf');
  assert.ok(a[0].cta2, 'A: zwei Knöpfe im Kopf');
  const laborB = b.find((s) => s.etikett === 'Wissenschaft');
  assert.equal(laborB.cta.href, KAUFSEITE, 'B: Kaufknopf nach dem Laborbefund');
  assert.ok(b.findIndex((s) => s.art === 'modelle') < a.findIndex((s) => s.art === 'modelle'), 'B: Geräte früher');
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
  for (const g of MODELLE.liste) je.set(g.kaufen, new Set([...(je.get(g.kaufen) ?? []), 'Jetzt kaufen']));
  for (const [ziel, texte] of je) assert.equal(texte.size, 1, `${ziel}: ${[...texte]}`);
});

test('kein Preisanker in der Gerätereihe', () => {
  const t = texteVon(MODELLE).join(' ');
  assert.doesNotMatch(t, /14\.000|4,8|★|Ultimate Power/);
});

/* 360-Grad (s02, Christian 30.10.2026): kein 360-Ersatzbild ohne Drehung, und
   die Drehung passt zum Gerät im Dateinamen. Hero zuerst, damit der Kopf dreht. */
const DREHUNG_AUS_DATEI = {"360-qione-front": "qione", "360-qibracelet-winkel": "qibracelet", "360-qihome-front": "qihome"};
function pruefe360(bilder, name) {
  let n = 0;
  for (const b of bilder) {
    const m = /qb-video360-ersatzbild--(360-[a-z]+-[a-z]+)(?:-\d+)?--/.exec(b?.url || "");
    if (!m) continue;
    n++;
    assert.equal(b.drehung, DREHUNG_AUS_DATEI[m[1]], `${name}: ${m[1]} steht als Standbild`);
  }
  return n;
}

test('360: Kopf und Gerätereihe drehen in beiden Armen (kein Standbild)', () => {
  for (const arm of ['a', 'b']) {
    const s = startseiteSektionen(arm);
    assert.equal(s[0].bild.drehung, 'qione', `Arm ${arm}: der Kopf dreht`);
    assert.ok(pruefe360(s.map((x) => x.bild), `Arm ${arm}`) >= 1);
  }
  assert.equal(pruefe360(MODELLE.liste.map((g) => g.bild), 'Gerätereihe'), 3);
});
