// Qi-Alpha-Freischaltung 01.11.2026 10:11Z (lib/qi-alpha-freischaltung.js).
// Lauf: node --test (findet *.test.mjs im ganzen Baum).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  QI_ALPHA_FREISCHALTUNG_MS,
  QI_ALPHA_LP,
  bannerVariante,
  freischaltungsDaten,
  istFreigeschaltet,
  istStartseite,
  ladeLeistenWahl,
  leistenWahlZuruecksetzen,
  menueMitQiAlpha,
  uebernehmeLeistenWahl,
} from './qi-alpha-freischaltung.js';

const VORHER = Date.parse('2026-11-01T10:10:59.999Z');
const AB = Date.parse('2026-11-01T10:11:00Z');

test('Freischaltung ist 11:11 Berlin = 10:11Z, keine Millisekunde früher', () => {
  assert.equal(QI_ALPHA_FREISCHALTUNG_MS, AB);
  assert.equal(istFreigeschaltet(VORHER), false);
  assert.equal(istFreigeschaltet(AB), true);
  assert.equal(istFreigeschaltet(undefined), false);
});

test('Banner: Qi Alpha nur auf den zwei Startseiten-Armen, sonst 4,8 Sterne', () => {
  for (const p of ['/', '/pages/start-b', '/pages/start-b/']) {
    assert.equal(bannerVariante({pathname: p, freigeschaltet: true}), 'qi-alpha', p);
    assert.equal(bannerVariante({pathname: p, freigeschaltet: false}), 'bewertung', p);
  }
  for (const p of ['/pages/Qi-Alpha', '/products/qi-alpha', '/products/qione-2-pro',
    '/collections/all', '/pages/studien', '/en', '/pages/start-a']) {
    assert.equal(bannerVariante({pathname: p, freigeschaltet: true}), 'bewertung', p);
  }
  assert.equal(istStartseite('/'), true);
});

test('Banner-Wahl bewertung holt die 4,8-Sterne-Leiste auch auf der Startseite zurück', () => {
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true, wahl: 'bewertung'}), 'bewertung');
});

const MENUE = {
  id: 'm',
  items: [
    {id: 'a', title: 'Start', url: '/', items: []},
    {id: 'b', title: 'Shop', url: '/collections/all', items: [
      {id: 'c', title: 'QiOne® 2 Pro', url: '/products/qione-2-pro', items: []},
    ]},
  ],
};

test('Menü: Qi Alpha® als erster Shop-Punkt auf die LP, erst ab Freischaltung', () => {
  assert.equal(menueMitQiAlpha(MENUE, false), MENUE);
  const neu = menueMitQiAlpha(MENUE, true);
  const shop = neu.items[1];
  assert.equal(shop.items[0].title, 'Qi Alpha®');
  assert.equal(shop.items[0].url, QI_ALPHA_LP);
  assert.notEqual(shop.items[0].url, '/products/qi-alpha');
  assert.equal(shop.items.length, 2);
  // Original unberuehrt, kein Doppel bei zweitem Durchlauf
  assert.equal(MENUE.items[1].items.length, 1);
  assert.equal(menueMitQiAlpha(neu, true).items[1].items.length, 2);
});

test('Probe-Uhr gilt nur ausserhalb der Produktion', () => {
  const env = {QI_ALPHA_PROBE_JETZT: '2026-11-01T10:11:00Z'};
  assert.equal(freischaltungsDaten({env, istProduktion: false, jetztMs: 1}).jetzt, AB);
  assert.equal(freischaltungsDaten({env, istProduktion: true, jetztMs: 1}).jetzt, 1);
});

test('Banner-Wahl per Metafeld: bewertung schaltet die Startseite zurück auf 4,8 Sterne', () => {
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true, wahl: 'bewertung'}), 'bewertung');
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true, wahl: 'qi-alpha'}), 'qi-alpha');
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true, wahl: undefined}), 'qi-alpha');
  assert.equal(bannerVariante({pathname: '/products/qi-alpha', freigeschaltet: true, wahl: 'qi-alpha'}), 'bewertung');
});

test('Metafeld-Quellen: gültig -> metafeld, danach unlesbar -> zuletzt, nie gelesen -> vorgabe', () => {
  leistenWahlZuruecksetzen();
  assert.deepEqual(uebernehmeLeistenWahl(null), {wahl: 'qi-alpha', quelle: 'vorgabe'});
  assert.deepEqual(uebernehmeLeistenWahl('quatsch'), {wahl: 'qi-alpha', quelle: 'vorgabe'});
  assert.deepEqual(uebernehmeLeistenWahl(' Bewertung '), {wahl: 'bewertung', quelle: 'metafeld'});
  assert.deepEqual(uebernehmeLeistenWahl(null), {wahl: 'bewertung', quelle: 'zuletzt'});
  assert.deepEqual(uebernehmeLeistenWahl('qi-alpha'), {wahl: 'qi-alpha', quelle: 'metafeld'});
  leistenWahlZuruecksetzen();
});

test('ladeLeistenWahl wirft nie und liest shop.metafield.value', async () => {
  leistenWahlZuruecksetzen();
  const gut = {query: async () => ({shop: {metafield: {value: 'bewertung'}}})};
  assert.deepEqual(await ladeLeistenWahl(gut), {wahl: 'bewertung', quelle: 'metafeld'});
  const kaputt = {query: async () => { throw new Error('netz'); }};
  assert.deepEqual(await ladeLeistenWahl(kaputt), {wahl: 'bewertung', quelle: 'zuletzt'});
  leistenWahlZuruecksetzen();
});
