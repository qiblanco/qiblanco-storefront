import assert from 'node:assert/strict';
import test from 'node:test';
import {
  artikelInhaltAufraeumen,
  ohneDoppeltenTitel,
  ohneMarkdownTrenner,
} from '../app/lib/blog-inhalt.js';

// DIE FIXTURE IST DER ECHTE LIVE-ZUSTAND, nicht ein nachgebautes Minimalbeispiel:
// so kam /blogs/wissen/kohärentes-wasser-was-die-forschung-misst am 2026-09-04
// aus der Storefront-API (Titel doppelt, danach der wörtliche Markdown-Trenner).
const LIVE_TITEL = 'Kohärentes Wasser: Was die Forschung wirklich misst';
const LIVE_ARTIKELTEXT =
  '<h1>Kohärentes Wasser: Was die Forschung wirklich misst</h1>\n' +
  '<p>Kohärentes Wasser ist ein Begriff aus dem Marketing.</p>\n' +
  '<p>---</p>\n' +
  '<h2>Was Kohärenz in der Physik überhaupt bedeutet</h2>\n' +
  '<p>Kohärenz bezeichnet einen festen Phasenbezug.</p>';

test('der Live-Fall: Titel steht danach nur noch einmal und kein Trenner mehr', () => {
  const raus = artikelInhaltAufraeumen(LIVE_ARTIKELTEXT, LIVE_TITEL);
  // ROT VOR GRUEN: genau diese beiden Zusicherungen scheitern am Rohkoerper.
  assert.equal(LIVE_ARTIKELTEXT.includes('<h1>'), true, 'Fixture ohne Defekt = kein Beweis');
  assert.equal(LIVE_ARTIKELTEXT.includes('<p>---</p>'), true, 'Fixture ohne Defekt = kein Beweis');
  assert.equal(raus.includes('<h1>'), false);
  assert.equal(raus.includes('---'), false);
  // und der Text selbst ist unangetastet
  assert.equal(raus.includes('Kohärentes Wasser ist ein Begriff aus dem Marketing.'), true);
  assert.equal(raus.includes('<h2>Was Kohärenz in der Physik überhaupt bedeutet</h2>'), true);
});

test('eine fuehrende Ueberschrift, die NICHT der Titel ist, bleibt stehen', () => {
  const h = '<h1>Ganz etwas anderes</h1><p>Text</p>';
  assert.equal(ohneDoppeltenTitel(h, LIVE_TITEL), h);
});

test('nur die ERSTE Ueberschrift wird geprueft — eine spaetere gleichlautende bleibt', () => {
  const h = `<p>Vorspann</p><h2>${LIVE_TITEL}</h2>`;
  assert.equal(ohneDoppeltenTitel(h, LIVE_TITEL), h);
});

test('Vergleich ist unempfindlich gegen Entitaeten, Auszeichnung und Whitespace', () => {
  const h = '<h1> <strong>A &amp; B</strong>&nbsp;</h1><p>Text</p>';
  assert.equal(ohneDoppeltenTitel(h, 'A & B'), '<p>Text</p>');
});

test('ein Absatz mit Strichen UND Text bleibt unangetastet', () => {
  const h = '<p>--- so nicht ---</p>';
  assert.equal(ohneMarkdownTrenner(h), h);
});

test('Stern- und Unterstrich-Trenner fallen genauso', () => {
  assert.equal(ohneMarkdownTrenner('<p>***</p><p>A</p><p>____</p>'), '<p>A</p>');
});

test('leere/fehlende Eingaben kippen nichts', () => {
  assert.equal(artikelInhaltAufraeumen(null, LIVE_TITEL), '');
  assert.equal(artikelInhaltAufraeumen('<p>A</p>', null), '<p>A</p>');
  assert.equal(artikelInhaltAufraeumen('<p>A</p>', ''), '<p>A</p>');
});
