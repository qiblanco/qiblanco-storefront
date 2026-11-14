// Qi-Alpha-Freischaltung 01.11.2026 10:11Z (lib/qi-alpha-freischaltung.js).
// Lauf: node --test (findet *.test.mjs im ganzen Baum).
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  APPLE_KAUFSEITEN_OHNE_LEISTE,
  QI_ALPHA_FREISCHALTUNG_MS,
  QI_ALPHA_LP,
  bannerVariante,
  freischaltungsDaten,
  istAppleKaufseite,
  istFreigeschaltet,
  istStartseite,
  ladeLeistenWahl,
  leistenWahlZuruecksetzen,
  menueMitQiAlpha,
  uebernehmeAppleWahl,
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
  for (const p of ['/pages/Qi-Alpha', '/products/qi-alpha', '/products/qione-kette',
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
  assert.deepEqual(await ladeLeistenWahl(gut),
    {wahl: 'bewertung', quelle: 'metafeld', appleSeiten: 'keine', appleQuelle: 'vorgabe'});
  const kaputt = {query: async () => { throw new Error('netz'); }};
  assert.deepEqual(await ladeLeistenWahl(kaputt),
    {wahl: 'bewertung', quelle: 'zuletzt', appleSeiten: 'keine', appleQuelle: 'vorgabe'});
  leistenWahlZuruecksetzen();
});

test('Apple-Kaufseiten: genau drei Pfade ohne Leiste, vor und nach der Freischaltung', () => {
  assert.deepEqual([...APPLE_KAUFSEITEN_OHNE_LEISTE],
    ['/products/qione-2-pro', '/products/qibracelet', '/products/qihome-air']);
  for (const p of APPLE_KAUFSEITEN_OHNE_LEISTE) {
    assert.equal(bannerVariante({pathname: p, freigeschaltet: true}), 'keine', p);
    assert.equal(bannerVariante({pathname: p, freigeschaltet: false}), 'keine', p);
    assert.equal(bannerVariante({pathname: `${p}/`, freigeschaltet: true}), 'keine', p);
    assert.equal(bannerVariante({pathname: p.toUpperCase(), freigeschaltet: true}), 'keine', p);
  }
});

test('Apple-Kaufseiten: Nachbarn und Startseite behalten ihre Leiste', () => {
  for (const p of ['/products/qione-2-pro-b', '/products/qibracelet-b', '/products/qihome-air-b',
    '/pages/qione-2-pro', '/pages/qibracelet', '/pages/qihome-air', '/products/qione-kette',
    '/products/qi-alpha']) {
    assert.equal(istAppleKaufseite(p), false, p);
    assert.equal(bannerVariante({pathname: p, freigeschaltet: true}), 'bewertung', p);
  }
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true}), 'qi-alpha');
  assert.equal(bannerVariante({pathname: '/', freigeschaltet: true, appleSeiten: 'keine'}), 'qi-alpha');
});

test('Apple-Wahl bewertung holt die Leiste zurück, die Startseiten-Wahl wirkt dort nicht', () => {
  const p = '/products/qione-2-pro';
  assert.equal(bannerVariante({pathname: p, freigeschaltet: true, appleSeiten: 'bewertung'}), 'bewertung');
  assert.equal(bannerVariante({pathname: p, freigeschaltet: true, wahl: 'bewertung'}), 'keine');
  assert.equal(bannerVariante({pathname: p, freigeschaltet: true, wahl: 'qi-alpha'}), 'keine');
});

test('Apple-Feld: gültig -> metafeld, unlesbar -> zuletzt, nie gelesen -> keine Leiste', () => {
  leistenWahlZuruecksetzen();
  assert.deepEqual(uebernehmeAppleWahl(null), {appleSeiten: 'keine', appleQuelle: 'vorgabe'});
  assert.deepEqual(uebernehmeAppleWahl('qi-alpha'), {appleSeiten: 'keine', appleQuelle: 'vorgabe'});
  assert.deepEqual(uebernehmeAppleWahl('bewertung'), {appleSeiten: 'bewertung', appleQuelle: 'metafeld'});
  assert.deepEqual(uebernehmeAppleWahl(null), {appleSeiten: 'bewertung', appleQuelle: 'zuletzt'});
  leistenWahlZuruecksetzen();
});

test('ladeLeistenWahl liest beide Felder aus einer Abfrage und wirft nie', async () => {
  leistenWahlZuruecksetzen();
  const fremd = {query: async () => ({shop: {
    metafield: {value: 'bewertung'}, appleSeiten: {value: 'bewertung'},
  }})};
  assert.deepEqual(await ladeLeistenWahl(fremd),
    {wahl: 'bewertung', quelle: 'metafeld', appleSeiten: 'bewertung', appleQuelle: 'metafeld'});
  leistenWahlZuruecksetzen();
  const kaputt = {query: async () => { throw new Error('netz'); }};
  const r = await ladeLeistenWahl(kaputt);
  assert.equal(r.appleSeiten, 'keine');
  assert.equal(r.appleQuelle, 'vorgabe');
  leistenWahlZuruecksetzen();
});

// Nr.-1-Leiste der Startseite (Christian 14.11.2026, Job 20261114-prio1-homepage-banner-weltweit-nr1-...).
import {NR_EINS_TEXT, STUDIEN_SEITE, zeigeNrEinsLeiste} from './qi-alpha-freischaltung.js';

test('Nr.-1-Leiste: Startseite (beide Arme) und jede andere Seite mit Leiste, ausser Kakao', () => {
  for (const p of ['/', '/pages/start-b']) {
    assert.equal(zeigeNrEinsLeiste({pathname: p, leiste: 'qi-alpha'}), true, p);
    assert.equal(zeigeNrEinsLeiste({pathname: p, leiste: 'bewertung'}), true, p);
  }
  for (const p of ['/products/qione', '/collections/all', '/pages/studien', '/blogs/news/x', '/products/qione-2-pro-b']) {
    assert.equal(zeigeNrEinsLeiste({pathname: p, leiste: 'bewertung', alleSeiten: true}), true, p);
    assert.equal(zeigeNrEinsLeiste({pathname: p, leiste: 'bewertung', alleSeiten: true, kakao: true}), false, p);
    // Vorgabe bis zur Baseline-Freigabe: andere Seiten wie vorher.
    assert.equal(zeigeNrEinsLeiste({pathname: p, leiste: 'bewertung'}), false, p);
  }
});

test('Nr.-1-Leiste: Rueckweg-Schalter und Seiten ohne Leiste', () => {
  assert.equal(zeigeNrEinsLeiste({pathname: '/', leiste: 'qi-alpha', an: false}), false);
  assert.equal(zeigeNrEinsLeiste({pathname: '/', leiste: 'keine'}), false);
});

test('Nr.-1-Leiste: Christians Aussage und Ziel Studienseite', () => {
  assert.match(NR_EINS_TEXT, /^Weltweit Nr\. 1 bei Energieprodukten/);
  assert.equal(STUDIEN_SEITE, '/pages/studien');
});
