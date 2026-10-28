/**
 * Wächter: „®“ AUF DER QI-ALPHA-KAUFSEITE KLEIN HOCHGESTELLT (node --test,
 * ohne Bundler). Christian 28.10.2026 Z1: „das R so groß ist und nicht
 * hochgestellt“; Z17 (BS-Fund): „Gitterchip™“ in den Fragen, sonst
 * „Gitterchip®“; Z15: „750er“ statt „750iger“. Grossjob 20261028-qi-alpha-
 * kopf-99-registered-hochgestellt-ohne-bewertungen-chat-ratenzahlung, s03.
 *
 * Gemessen nach der EIGENSCHAFT: jede Stelle, an der eine der drei Seiten-
 * Komponenten einen Datentext mit „®“ zeichnet, läuft durch MarkeR bzw.
 * mitMarkeR. Die Daten selbst bleiben lesbare Zeichenketten mit „®“.
 * Die gerenderte Seite misst die Abnahme-Probe (<sup>® im ausgelieferten
 * HTML, Größe am Browser), nicht dieser Test.
 * ROT VOR GRÜN: auf origin/main 19752493 rot (MarkeR.jsx fehlt, 13x „™“,
 * 8x „750iger“, Titel ohne Helfer).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const ohneKommentare = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');

const DATEN = [
  'app/components/campaign/the-alpha-shop-daten.js',
  'app/components/campaign/the-alpha-faq-daten.js',
  'app/components/the-alpha-shop/the-alpha-wissen-daten.js',
];

test('ein Helfer: MarkeR setzt ® als <sup> mit 0,45 em, gleicher Farbe und Stärke', () => {
  assert.ok(existsSync(join(WURZEL, 'app/components/reusables/MarkeR.jsx')), 'MarkeR.jsx fehlt');
  const h = lies('app/components/reusables/MarkeR.jsx');
  assert.match(h, /<sup[\s\S]*className="qb-marke-r"/);
  assert.match(h, /fontSize: '0\.45em'/);
  assert.match(h, /color: 'inherit'/);
  assert.match(h, /fontWeight: 'inherit'/);
  assert.match(h, /lineHeight: 0/);
});

test('Gitterchip® statt Gitterchip™ und 750er statt 750iger in allen Texten der Kaufseite', () => {
  for (const f of DATEN) {
    const s = ohneKommentare(lies(f));
    assert.doesNotMatch(s, /™/, `${f}: ™`);
    assert.doesNotMatch(s, /750iger/, `${f}: 750iger`);
  }
});

test('jede gezeichnete Stelle mit ® läuft durch den Helfer (Kopf, Zusammenfassung, Box, Wissen, Fragen)', () => {
  const shop = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.match(shop, /<h1 id="tas-name" className="tas-name">\s*<MarkeR text=\{PRODUKT\.name\} \/>/);
  assert.match(shop, /<Zeichen art=\{p\.zeichen\} \/>\s*\{mitMarkeR\(p\.text\)\}/);
  assert.match(shop, /<MarkeR text=\{ZUSAMMENFASSUNG\.titel\} \/>/);
  // Zusammenfassung und Box: „Qi Alpha® · 19/111 - 1st. Edition“
  assert.equal((shop.match(/<MarkeR text=\{PRODUKT\.name\} \/> · \{gravur\}/g) || []).length, 2);
  // kein Datentext mit ® roh gezeichnet
  assert.doesNotMatch(ohneKommentare(shop), /\{PRODUKT\.name\}(?! \/>)|\{ZUSAMMENFASSUNG\.titel\}(?! \/>)|(?<!key=)\{p\.text\}/);

  const faq = ohneKommentare(lies('app/components/campaign/TheAlphaFaq.jsx'));
  for (const stelle of ['THE_ALPHA_FAQ_TITEL', 'f.frage', 'a', 'THE_ALPHA_FAQ_ANNA.titel', 'THE_ALPHA_FAQ_ANNA.text']) {
    const roh = new RegExp(`>\\s*\\{${stelle.replace('.', '\\.')}\\}\\s*<`);
    assert.doesNotMatch(faq, roh, `Fragen: {${stelle}} roh`);
  }
  assert.match(faq, /mitMarkeR\(f\.frage\)/);

  const wissen = ohneKommentare(lies('app/components/the-alpha-shop/TheAlphaWissen.jsx'));
  for (const stelle of ['p', 'a.zitat', 's.titel', 's.text', 'etikett', 'titel', 'q', 'a.zitatVon']) {
    const roh = new RegExp(`>\\s*\\{${stelle.replace('.', '\\.')}\\}\\s*<`);
    assert.doesNotMatch(wissen, roh, `Wissen: {${stelle}} roh`);
  }
});
