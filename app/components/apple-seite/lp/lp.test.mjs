// node --test app/components/apple-seite/lp/lp.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pruefeSeite, texteVon} from '../apple-seite-logik.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';
import {ALLTAG_SEKTIONEN} from './lp-alltag.js';
import {VERSPRECHEN_SEKTIONEN} from './lp-versprechen.js';
import {TRAGEFORM_SEKTIONEN} from './lp-trageform.js';
import {EINFACH_SEKTIONEN} from './lp-einfach.js';
import {MECHANISMUS_SEKTIONEN} from './lp-mechanismus.js';

const SEITEN = {
  '/pages/haelt-das-mein-leben-aus': ALLTAG_SEKTIONEN,
  '/pages/das-20-tage-versprechen': VERSPRECHEN_SEKTIONEN,
  '/pages/kette-oder-armband': TRAGEFORM_SEKTIONEN,
  '/pages/so-funktioniert-der-qione': EINFACH_SEKTIONEN,
  '/pages/so-wirkt-kohaerentes-wasser': MECHANISMUS_SEKTIONEN,
};

test('jede Seite besteht pruefeSeite (Hero zuerst, Anna, kein Preisanker, kein Konjunktiv)', () => {
  for (const [pfad, s] of Object.entries(SEITEN)) assert.deepEqual(pruefeSeite(s), [], pfad);
});

test('jede Seite hat einen Schalter in der Tabelle', () => {
  const pfade = new Set(Object.values(APPLE_SEITEN).map((e) => e.pfad));
  for (const pfad of Object.keys(SEITEN)) assert.ok(pfade.has(pfad), pfad);
});

test('jedes Ziel trägt je Seite genau eine Beschriftung, Ziele intern oder Shopify-CDN', () => {
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    const je = new Map();
    for (const s of sektionen) {
      for (const c of [s.cta, s.cta2, s.link].filter(Boolean)) {
        assert.match(c.href, /^(\/|https:\/\/cdn\.shopify\.com\/)/, `${pfad}: ${c.href}`);
        je.set(c.href, new Set([...(je.get(c.href) ?? []), c.text]));
      }
    }
    for (const [href, texte] of je) assert.equal(texte.size, 1, `${pfad}: ${href} ${[...texte]}`);
  }
});

test('kein Kaufknopf ohne Preis: CTA-Texte sind keine Kauf-Wörter (Sicht-Tor kaufknopf_kontext)', () => {
  const KAUF = /(in den warenkorb|jetzt kaufen|kaufen$|^kaufen|jetzt bestellen|zur kasse)/i;
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    for (const s of sektionen) for (const c of [s.cta, s.cta2].filter(Boolean)) assert.ok(!KAUF.test(c.text), `${pfad}: ${c.text}`);
  }
});

test('keine Sterne, keine Note in den Stimmen', () => {
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    for (const t of texteVon(sektionen)) assert.ok(!/★|\d[.,]\d\s*\/\s*5/.test(t), `${pfad}: ${t}`);
  }
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

test('360: jede LP-Ansicht der Geräte dreht (kein Standbild)', () => {
  let n = 0;
  for (const [name, s] of Object.entries({ALLTAG_SEKTIONEN, VERSPRECHEN_SEKTIONEN, TRAGEFORM_SEKTIONEN, EINFACH_SEKTIONEN, MECHANISMUS_SEKTIONEN})) {
    n += pruefe360(s.map((x) => x.bild), name);
  }
  assert.ok(n >= 3, `mindestens die drei bekannten 360-Stellen, gefunden ${n}`);
});
