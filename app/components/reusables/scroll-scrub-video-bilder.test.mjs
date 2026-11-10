// Start- und Endbild von ScrollScrubVideo sind als Schmuck markiert.
// Wochenwache alt-text-wache-woechentlich (seo-manager/alt-texte/rand_messung.py)
// zählt ein <img alt=""> ohne role="presentation"|"none" oder aria-hidden="true"
// als Befund (leer_nicht_dekorativ_n, Soll 0).
// Lauf: node --test.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const QUELLE = readFileSync(new URL('./ScrollScrubVideo.jsx', import.meta.url), 'utf8');

// Jedes JSX-<img ...> bis zum schließenden "/>". Kommentare tragen "<img>"
// ohne Attribute und werden vorher entfernt, sonst schluckt ein Treffer aus
// dem Kommentarkopf das erste echte Tag (gemessen am Rot-Lauf 10.11.2026).
export function imgTags(quelle) {
  const ohneKommentare = quelle.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  return [...ohneKommentare.matchAll(/<img\s[\s\S]*?\/>/g)].map((m) => m[0]);
}

export function istBefund(tag) {
  const alt = tag.match(/\balt=(?:"([^"]*)"|\{([^}]*)\})/);
  if (!alt) return true; // kein alt: immer Befund
  const leer = alt[1] !== undefined ? alt[1].trim() === '' : /^\s*(''|""|``)\s*$/.test(alt[2]);
  if (!leer) return false;
  return !/\brole="(presentation|none)"|\baria-hidden="true"|\baria-hidden=\{true\}/.test(tag);
}

test('Prüfer schlägt an: alt="" ohne Markierung ist Befund (Rot-Kontrolle)', () => {
  assert.equal(istBefund('<img className="x" src={a} alt="" decoding="async" />'), true);
  assert.equal(istBefund('<img src={a} />'), true);
  assert.equal(istBefund('<img src={a} alt="" role="presentation" />'), false);
  assert.equal(istBefund('<img src={a} alt="" aria-hidden="true" />'), false);
  assert.equal(istBefund('<img src={a} alt="Kohärente Ordnung" />'), false);
});

test('ScrollScrubVideo rendert Start- und Endbild, je ein Tag', () => {
  const tags = imgTags(QUELLE);
  assert.equal(tags.length, 2, `erwartet 2 <img>, gefunden ${tags.length}`);
  assert.ok(tags.some((t) => t.includes('ScrollScrubVideo-standbild')), 'Endbild-<img> fehlt');
  assert.ok(tags.some((t) => t.includes('ScrollScrubVideo-startbild')), 'Startbild-<img> fehlt');
});

test('Kein <img> in ScrollScrubVideo ist leer und unmarkiert', () => {
  const befunde = imgTags(QUELLE).filter(istBefund);
  assert.deepEqual(befunde, []);
});
