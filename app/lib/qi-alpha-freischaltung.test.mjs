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
  menueMitQiAlpha,
} from './qi-alpha-freischaltung.js';

const VORHER = Date.parse('2026-11-01T10:10:59.999Z');
const AB = Date.parse('2026-11-01T10:11:00Z');

test('Freischaltung ist 11:11 Berlin = 10:11Z, keine Millisekunde frueher', () => {
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

test('Banner-Wahl bewertung holt die 4,8-Sterne-Leiste auch auf der Startseite zurueck', () => {
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

test('Menue: Qi Alpha® als erster Shop-Punkt auf die LP, erst ab Freischaltung', () => {
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
