/**
 * Wächter: WISSENS-STRECKE und FRAGEN zum Qi Alpha (node --test, ohne
 * Bundler) — Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-
 * premium-gestaltung, Segment s07. Christian 26.10.2026 Z150–Z208.
 *
 * Gemessen: Christians acht Themen in seiner Folge, die Leitfrage wörtlich,
 * keine Weichmacher in den Antworten (Z175), die vergebenen Nummern aus der
 * einen Liste, die sechs Abschnitte in Christians Folge mit Quellen, und die
 * Verdrahtung unter „What's in the Box“.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const faq = await import(join(WURZEL, 'app/components/campaign/the-alpha-faq-daten.js'));
const serie = await import(join(WURZEL, 'app/components/campaign/the-alpha-daten-serie-vergeben.js'));
const wissen = await import(join(WURZEL, 'app/components/the-alpha-shop/the-alpha-wissen-daten.js'));

// Dieselbe Liste wie die Live-Probe (bin/probe_wissen_faq.py im Jobordner).
const WEICH = /(?<![\p{L}])(könnte\p{L}*|würde\p{L}*|sollte\p{L}*|soll|sollen|möglicherweise|vielleicht|eventuell|evtl\.?|nach Angaben|angeblich|vermutlich|vermutet|wohl|gegebenenfalls|ggf\.?|wäre\p{L}*|hätte\p{L}*|dürfte\p{L}*|scheint|scheinen|denkbar|theoretisch)(?![\p{L}])/giu;

test('Fragen: acht Themen in Christians Folge, Leitfrage wörtlich zuerst', () => {
  const ids = faq.THE_ALPHA_FAQ.map((f) => f.id);
  assert.deepEqual(ids, ['mehr', 'bereit', 'unterschied', 'gitterchip', 'diamant', 'sechs-g', 'sauna-wasser', 'passt-nicht']);
  assert.equal(
    faq.THE_ALPHA_FAQ[0].frage,
    'Was bekomme ich mit dem Qi Alpha, das kein anderes Qi-Blanco-Produkt kann?',
  );
});

test('Antworten: ohne Weichmacher, vergebene Nummern aus der einen Liste', () => {
  const fragen = faq.theAlphaFaqAufgeloest();
  const alles = fragen.flatMap((f) => f.antwort).join('\n');
  assert.deepEqual(alles.match(WEICH) ?? [], []);
  for (const f of fragen) for (const a of f.antwort) assert.equal(typeof a, 'string');
  for (const n of serie.THE_ALPHA_VERGEBEN) assert.match(alles, new RegExp(`\\b${n}\\b`));
  assert.match(faq.theAlphaFaqAufgeloest([7, 3]).find((f) => f.id === 'unterschied').antwort[1], /3 und 7\./);
});

test('Wissen: sechs Abschnitte in Christians Folge, jeder mit Quelle', () => {
  const ids = wissen.THE_ALPHA_WISSEN.map((a) => a.id);
  assert.deepEqual(ids, ['diamant', 'kristall', 'gleichtakt', 'licht', 'sechs-g']);
  for (const a of wissen.THE_ALPHA_WISSEN) assert.ok(a.quellen?.length, `${a.id} ohne Quelle`);
  assert.match(wissen.THE_ALPHA_LIGA.titel, /eine bisher unerreichte Liga/);
  const k = wissen.THE_ALPHA_WISSEN.find((a) => a.id === 'gleichtakt').absaetze.join(' ');
  for (const z of ['3.545 °C', 'Zehntel Mikrometer', 'Millionen Moleküle']) assert.ok(k.includes(z), z);
  const l = wissen.THE_ALPHA_WISSEN.find((a) => a.id === 'licht').absaetze.join(' ');
  for (const z of [/200 und 800 Nanometern/, /41 (%|Prozent)/, /fünf Minuten/]) assert.match(l, z);
});

test('Verdrahtung: Wissen und Fragen unter der Box, Stile route-gebunden', () => {
  const r = lies('app/routes/products.the-alpha.jsx');
  assert.match(r, /nachDerBox=\{\s*<>\s*<TheAlphaWissen \/>\s*<TheAlphaFaq ton="hell" \/>/);
  for (const s of ['shopStyles', 'wissenStyles', 'faqStyles']) assert.match(r, new RegExp(`href: ${s}`));
});
