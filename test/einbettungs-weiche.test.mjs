// Hermetische Tests der Einbettungs-Weiche als EINE Quelle für Seiten und
// Warenkorb-Permalink (Job 20260924-partnerlink-setzt-code-automatisch-und-
// permalink-einbettungsfest-prio12). Ausführen: node --test test/einbettungs-weiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {einbettungsWeiche, istFremderRahmen} from '../app/lib/einbettungs-weiche.server.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const PERMALINK = 'https://qiblanco.com/cart/39680087326790:1?discount=JULIEDETOX';

function anfrage(url, kopf = {}, methode = 'GET') {
  return new Request(url, {method: methode, headers: kopf});
}

test('W1 fremder Rahmen -> Weiter-Seite mit demselben Link, einbettbar', async () => {
  for (const [dest, site] of [['iframe', 'cross-site'], ['frame', 'same-site']]) {
    const r = einbettungsWeiche(anfrage(PERMALINK, {'sec-fetch-dest': dest, 'sec-fetch-site': site}));
    assert.ok(r, `${dest}/${site} ohne Weiter-Seite`);
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.match(html, /data-einbettung-weiter/);
    assert.ok(html.includes('href="https://qiblanco.com/cart/39680087326790:1?discount=JULIEDETOX"'));
    assert.match(r.headers.get('content-security-policy'), /frame-ancestors \*/);
    assert.equal(r.headers.get('x-frame-options'), null);
  }
});

test('W2 kein Eingriff: Dokument, eigener Rahmen, Datenabruf, ohne Kopf, POST', () => {
  assert.equal(einbettungsWeiche(anfrage(PERMALINK, {'sec-fetch-dest': 'document', 'sec-fetch-site': 'cross-site'})), null);
  assert.equal(einbettungsWeiche(anfrage(PERMALINK, {'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'same-origin'})), null);
  assert.equal(einbettungsWeiche(anfrage(PERMALINK, {'sec-fetch-dest': 'empty', 'sec-fetch-site': 'cross-site'})), null);
  assert.equal(einbettungsWeiche(anfrage(PERMALINK)), null);
  assert.equal(einbettungsWeiche(anfrage(PERMALINK, {'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'cross-site'}, 'POST')), null);
});

test('W3 Link wird maskiert (kein HTML aus der Anfrage)', async () => {
  const r = einbettungsWeiche(anfrage('https://qiblanco.com/cart/1:1?discount=%22%3E%3Cscript%3E', {'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'cross-site'}));
  const html = await r.text();
  assert.ok(!html.includes('"><script>'), 'unmaskiert');
  // URL normalisiert < > " schon selbst; das & zwischen zwei Parametern
  // bleibt roh und MUSS im Attribut als &amp; stehen.
  const r2 = einbettungsWeiche(anfrage('https://qiblanco.com/cart/1:1?discount=X&sca_ref=1.abcdefghij', {'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'cross-site'}));
  assert.ok((await r2.text()).includes('discount=X&amp;sca_ref=1.abcdefghij'), '& nicht maskiert');
});

test('W4 cart.$lines legt im fremden Rahmen KEINEN Warenkorb an und leitet nicht weiter', () => {
  const src = readFileSync(join(WURZEL, 'app/routes/cart.$lines.jsx'), 'utf8');
  const w = src.indexOf('if (istFremderRahmen(request)) return null;');
  const c = src.indexOf('cart.create(');
  assert.ok(w > 0, 'Aufruf fehlt');
  assert.ok(w < c, 'Weiche steht hinter cart.create');
  assert.equal(istFremderRahmen(anfrage(PERMALINK, {'sec-fetch-dest': 'iframe', 'sec-fetch-site': 'cross-site'})), true);
  assert.equal(istFremderRahmen(anfrage(PERMALINK, {'sec-fetch-dest': 'document', 'sec-fetch-site': 'none'})), false);
});

test('W5 entry.server.jsx ruft die EINE Weiche vor dem Rendern und fuehrt keine eigene Kopie', () => {
  const src = readFileSync(join(WURZEL, 'app/entry.server.jsx'), 'utf8');
  assert.match(src, /import \{einbettungsWeiche\} from '~\/lib\/einbettungs-weiche\.server';/);
  const w = src.indexOf('einbettungsWeiche(request)');
  const r = src.indexOf('await renderToReadableStream(');
  assert.ok(w > 0, 'Aufruf fehlt');
  assert.ok(w < r, 'Weiche steht hinter dem Rendern');
  assert.match(src.slice(w, w + 120), /\n\s*if \((\w+)\) return \1;/, 'Antwort der Weiche wird nicht zurueckgegeben');
  assert.ok(!/function einbettungsWeiche\s*\(/.test(src), 'zweite Kopie der Weiche in entry.server.jsx');
  assert.ok(!src.includes('data-einbettung-weiter'), 'Weiter-Markup doppelt in entry.server.jsx');
});
