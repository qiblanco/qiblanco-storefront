// node --test app/components/apple-seite/lp/lp.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pruefeSeite, texteVon} from '../apple-seite-logik.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';
import {ALLTAG_SEKTIONEN} from './lp-alltag.js';
import {SKEPTIKER_SEKTIONEN} from './lp-skeptiker.js';
import {VERSPRECHEN_SEKTIONEN} from './lp-versprechen.js';
import {TRAGEFORM_SEKTIONEN} from './lp-trageform.js';
import {ZELLSTUDIEN_SEKTIONEN} from './lp-zellstudien.js';
import {EINFACH_SEKTIONEN} from './lp-einfach.js';
import {MECHANISMUS_SEKTIONEN} from './lp-mechanismus.js';

const SEITEN = {
  '/pages/haelt-das-mein-leben-aus': ALLTAG_SEKTIONEN,
  '/pages/wir-machen-ihn-auf': SKEPTIKER_SEKTIONEN,
  '/pages/das-20-tage-versprechen': VERSPRECHEN_SEKTIONEN,
  '/pages/kette-oder-armband': TRAGEFORM_SEKTIONEN,
  '/pages/zellstudien-ehrlich': ZELLSTUDIEN_SEKTIONEN,
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
