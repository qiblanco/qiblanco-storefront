// Währungs-Auswahl Kopf/Fuß (Job 20261122-prio1-shop-design-header-...): reine Datenfabrik.
import test from 'node:test';
import assert from 'node:assert/strict';
import {waehrungsListe, landAusCookie, cookieZeilen, zielOhneMarkt} from '../app/components/reusables/land-waehrung.js';
import {resolveCountry} from '../app/lib/markt-pricing.js';

const LOK = {
  country: {isoCode: 'TH', currency: {isoCode: 'THB', symbol: '฿'}},
  availableCountries: [
    {isoCode: 'DE', currency: {isoCode: 'EUR', symbol: '€'}},
    {isoCode: 'AT', currency: {isoCode: 'EUR', symbol: '€'}},
    {isoCode: 'CH', currency: {isoCode: 'CHF', symbol: 'CHF'}},
    {isoCode: 'US', currency: {isoCode: 'USD', symbol: '$'}},
    {isoCode: 'TH', currency: {isoCode: 'THB', symbol: '฿'}},
    {isoCode: 'JP', currency: {isoCode: 'JPY', symbol: '¥'}},
  ],
};
test('Liste nur aus Shopify-Angebot, Reihenfolge fest, aktive markiert', () => {
  const {aktiv, liste} = waehrungsListe(LOK, 'TH');
  assert.equal(aktiv, 'THB');
  assert.deepEqual(liste.map((w) => w.code), ['EUR', 'CHF', 'USD', 'THB']);
  assert.equal(liste.find((w) => w.aktiv).code, 'THB');
  assert.equal(liste.find((w) => w.code === 'CHF').land, 'CH');
});
test('fremde aktive Währung wird vorn ergänzt', () => {
  const {liste} = waehrungsListe({...LOK, country: {isoCode: 'JP', currency: {isoCode: 'JPY', symbol: '¥'}}}, 'JP');
  assert.equal(liste[0].code, 'JPY');
  assert.equal(liste[0].land, 'JP');
});
test('Rückfall ohne Shopify-Antwort', () => {
  const {aktiv, liste} = waehrungsListe(null, 'CH');
  assert.equal(aktiv, 'CHF');
  assert.deepEqual(liste.map((w) => w.code), ['EUR', 'CHF', 'USD', 'GBP']);
});
test('Cookie lesen/schreiben, ?markt entfernen', () => {
  assert.equal(landAusCookie('a=1; qb_land=ch; b=2'), 'CH');
  assert.equal(landAusCookie('qb_land=CHE'), '');
  assert.equal(cookieZeilen('us')[0].startsWith('qb_land=US;'), true);
  assert.deepEqual(cookieZeilen('X1'), []);
  assert.equal(zielOhneMarkt('https://qiblanco.com/p?markt=TH&a=1#k'), '/p?a=1#k');
});
test('resolveCountry: ?markt > Cookie > Geo', () => {
  const r = (u, c, g) => resolveCountry(new Request(u, {headers: {...(c ? {Cookie: c} : {}), ...(g ? {'oxygen-buyer-country': g} : {})}}));
  assert.equal(r('https://x/', 'qb_land=CH', 'TH'), 'CH');
  assert.equal(r('https://x/?markt=US', 'qb_land=CH', 'TH'), 'US');
  assert.equal(r('https://x/', 'qb_land=ZZ', 'TH'), 'TH');
  assert.equal(r('https://x/', 'qb_land=NO', ''), 'US');
  assert.equal(r('https://x/', '', ''), 'DE');
});
