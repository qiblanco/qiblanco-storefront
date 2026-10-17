/**
 * Crystal-Spiegel (Christian, 16.10.2026, Übergabe #71): die Reiter-Seiten
 * „Unser Kakao / AWAKE / CREATE“ auf qiblanco.com sind eine 1:1-Kopie von
 * crystal-cacao.com. Geprüft wird hier, was der qiblanco-Rahmen um den
 * ERZEUGTEN Spiegel selbst entscheidet: die Pfad-Karte und was die
 * Suchmaschine erfährt. Ob der Spiegel synchron ist, misst
 * crystal-cacao-node/bin/spiegel-nachzug vergleiche (rt-Task crystal-spiegel-synchron).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {zuQiblanco, zuCrystal, istExtern, SPIEGEL_SEITEN} from '../app/crystal-spiegel-rahmen/pfade.js';
import {istGespiegelt, gespiegelteHandles} from '../app/crystal-spiegel-rahmen/suchmaschine.js';
import {GESPIEGELTE_PFADE} from '../app/crystal-spiegel/seiten.js';
import {hreflangLinks} from '../app/lib/hreflang.js';

test('Pfad-Karte: crystal-Startseite wird zur Reiter-Seite, Anker und Suche bleiben', () => {
  assert.equal(zuQiblanco('/'), '/pages/crystal-cacao');
  assert.equal(zuQiblanco('/#kundenstimmen'), '/pages/crystal-cacao#kundenstimmen');
  assert.equal(zuQiblanco('/?x=1#a'), '/pages/crystal-cacao?x=1#a');
  assert.equal(zuCrystal('/pages/crystal-cacao'), '/');
});

test('Pfad-Karte: geteilter Katalog, Warenkorb und Rechtstexte bleiben im Laden', () => {
  for (const p of ['/products/crystal-cacao-awake', '/collections/kakao', '/cart', '/policies/privacy-policy',
    '/pages/impressum', '/discount/X']) {
    assert.equal(zuQiblanco(p), p, p);
  }
});

test('Pfad-Karte: was es nur bei crystal gibt, geht absolut dorthin (kein 404 im Laden)', () => {
  // gemessen 17.10.2026: qiblanco.com/pages/warum-crystal-cacao -> 404
  const z = zuQiblanco('/pages/warum-crystal-cacao');
  assert.equal(z, 'https://crystal-cacao.com/pages/warum-crystal-cacao');
  assert.equal(istExtern(z), true);
  assert.equal(zuQiblanco('/pages/impressum-x'), 'https://crystal-cacao.com/pages/impressum-x');
});

test('Pfad-Karte: Anker, fremde Hosts und Objekt-Ziele bleiben unverfälscht', () => {
  assert.equal(zuQiblanco('#cc-kaufen'), '#cc-kaufen');
  assert.equal(zuQiblanco('https://www.instagram.com/x/'), 'https://www.instagram.com/x/');
  assert.equal(zuQiblanco('//cdn.example/x'), '//cdn.example/x');
  assert.deepEqual(zuQiblanco({pathname: '/', search: '?a'}), {pathname: '/pages/crystal-cacao', search: '?a'});
});

test('jede gespiegelte Seite ist eine Reiter-Seite der Karte', () => {
  const ziele = new Set(Object.values(SPIEGEL_SEITEN));
  assert.ok(GESPIEGELTE_PFADE.length >= 2, 'mindestens Unser Kakao und AWAKE');
  for (const p of GESPIEGELTE_PFADE) assert.ok(ziele.has(p), p);
});

test('Suchmaschine: gespiegelte Seiten stehen in keiner hreflang-Gruppe', () => {
  for (const p of GESPIEGELTE_PFADE) {
    assert.equal(istGespiegelt(p), true, p);
    assert.equal(istGespiegelt(p + '/'), true, p + '/');
    assert.deepEqual(hreflangLinks(p), [], p);
  }
});

test('ROT: eine nicht gespiegelte Seite mit Paar behält ihr hreflang', () => {
  // Gegenprobe: der Ausschluss darf die Gruppe nicht pauschal leeren.
  const ungespiegelt = ['/products/qi-master', '/products/crystal-cacao-create', '/'].filter(
    (p) => !istGespiegelt(p) && hreflangLinks(p).length > 0,
  );
  assert.ok(ungespiegelt.length > 0, 'mindestens ein gepaartes, ungespiegeltes Ziel');
});

test('Suchmaschine: Sitemap-Handles je Typ folgen der erzeugten Menge', () => {
  const alle = [...gespiegelteHandles('pages').map((h) => `/pages/${h}`),
    ...gespiegelteHandles('products').map((h) => `/products/${h}`)].sort();
  assert.deepEqual(alle, [...GESPIEGELTE_PFADE].sort());
});

test('Sitemap-Route und Sitemap-Index lesen beide die Spiegel-Menge (eine Vereinigung, zwei Leser)', () => {
  const kind = readFileSync('app/routes/sitemap.$type.$page[.xml].jsx', 'utf8');
  const index = readFileSync('app/lib/sitemap-lastmod.js', 'utf8');
  for (const [name, code] of [['Kind-Route', kind], ['Index', index]]) {
    assert.match(code, /gespiegelteHandles\('pages'\)/, name);
    assert.match(code, /gespiegelteHandles\('products'\)/, name);
  }
});
