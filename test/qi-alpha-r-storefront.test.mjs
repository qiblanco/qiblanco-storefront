/**
 * Wächter: „Qi Alpha®“ in JEDEM Kundentext der Storefront (node --test, ohne
 * Bundler). Christian 27.10.2026: „Beim Namen fehlt das R Qi Alpha immer mti R“;
 * SSoT ai-ceo/wissen/kanon/qi-alpha-immer-mit-r.md; Folgejob
 * 20261028-folge-qi-alpha-r-storefront.
 *
 * Gemessen nach der EIGENSCHAFT über jede Quelldatei unter app/, nicht über
 * eine Dateiliste: eine neue Seite, die „Qi Alpha“ ohne Zeichen schreibt, fällt
 * hier auf, ohne dass jemand sie einträgt. Kommentare zählen nicht (sie werden
 * nicht ausgeliefert und zitieren oft Christians Originale). Handles, Routen und
 * Klassen tragen einen Bindestrich (qi-alpha, Qi-Alpha-B) und zählen nicht.
 *
 * Ausgenommen sind nur Dateien, deren Strings nie Kundentext sind (Politik,
 * nicht Ort): die generierte interne Linkliste /pages/uebersicht (noindex,
 * Quelle homepage-bauer/data/seitenzweck), die Sitemap-Begründungen in seo.js
 * und die Rollen-Etiketten in vorschau-noindex.js.
 * ROT VOR GRÜN: auf origin/main 19752493 rot (82 Zeilen in 21 Dateien, u. a.
 * product-faqs.js, QiMaster.jsx, pages.Qi-Alpha-B.jsx).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const KEIN_KUNDENTEXT = new Set([
  'app/data/uebersicht-links.js',
  'app/lib/seo.js',
  'app/lib/vorschau-noindex.js',
]);
const ohneKommentare = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
const ohneZeichen = /(?<![\w-])(Qi Alpha|QI ALPHA)(?![\w-]|\s*®)/g;

const dateien = (d) =>
  readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return statSync(p).isDirectory() ? dateien(p) : [p];
  });

test('Storefront: jeder Kundentext nennt „Qi Alpha®“ mit Zeichen (Christian 27.10.: „Qi Alpha immer mit R“)', () => {
  const funde = [];
  for (const p of dateien(join(WURZEL, 'app'))) {
    const f = relative(WURZEL, p);
    if (!/\.(jsx?|tsx?)$/.test(f) || KEIN_KUNDENTEXT.has(f)) continue;
    const t = ohneKommentare(readFileSync(p, 'utf8'));
    for (const m of t.matchAll(ohneZeichen)) {
      funde.push(`${f}: …${t.slice(Math.max(0, m.index - 40), m.index + 20).replace(/\s+/g, ' ')}…`);
    }
  }
  assert.deepEqual(funde, []);
});

test('Kette auf LP B heißt wie in Shopify, Warenkorb und Kasse (Christian 28.10.: „750er“)', () => {
  const lp = readFileSync(join(WURZEL, 'app/components/campaign/QiAlphaLpB.jsx'), 'utf8');
  assert.match(lp, /Qi Blanco® Goldkette – 750er ethisches Vollgold/);
  assert.doesNotMatch(lp, /Spezialsicherheitsverschluss/);
});
