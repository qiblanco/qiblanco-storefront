// Rabattlink /discount/<CODE>?redirect=… leitet nur auf eigene Pfade weiter
// (Job 20260924-GROSSJOB-partnerlinks-sauber-in-die-kasse-partnerseite-und-
// mail-an-elina). Ausführen: node --test test/discount-ziel.test.mjs
//
// Z1 sind die Angriffe, die der adversariale Prüfer am 2026-09-24 live
// belegt hat (303 mit Location /\evil.example.com). Z2 bis Z4 sind die
// Negativ-Kontrolle: die Links, die Partner und Ad-Weiche heute benutzen,
// kommen unverändert an. Ein Test, der nur Z1 prüft, wäre auch grün, wenn
// die Route jedes Ziel auf / würfe.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {rabattlinkZiel} from '../app/lib/discount-ziel.js';
import {rabattZiel} from '../app/lib/ad-weiche.server.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASIS = 'https://qiblanco.com/discount/TESTIX';

function ziel(query) {
  return rabattlinkZiel(`${BASIS}?${query}`);
}

function landetAufEigenerHerkunft(pfad) {
  // So löst ein Browser den Location-Kopf auf.
  return new URL(pfad, 'https://qiblanco.com/').origin === 'https://qiblanco.com';
}

test('Z1 fremde Ziele fallen auf die Startseite (live belegte Angriffe)', () => {
  const angriffe = [
    'redirect=/%5Cevil.example.com',
    'redirect=%2F%5Cevil.example.com',
    'redirect=/%5C%5Cevil.example.com',
    'redirect=//evil.example.com',
    'redirect=https://evil.example.com',
    'redirect=javascript:alert(1)',
    'redirect=data:text/html,x',
    'redirect=/%09/evil.example.com',
    'redirect=/%0A/evil.example.com',
    'redirect=evil.example.com',
    'return_to=/%5Cevil.example.com',
  ];
  for (const q of angriffe) {
    const z = ziel(q);
    assert.ok(z === '/' || z.startsWith('/?'), `${q} -> ${z}`);
    assert.ok(landetAufEigenerHerkunft(z), `${q} verlässt die Herkunft: ${z}`);
  }
});

test('Z2 Partner-Rabattlink trägt Ziel und Referenz wie bisher', () => {
  assert.equal(
    ziel('redirect=/products/qione-2-pro&sca_ref=2043355.abcDEF'),
    '/products/qione-2-pro?sca_ref=2043355.abcDEF',
  );
  assert.equal(ziel('redirect=/pages/studien'), '/pages/studien');
  assert.equal(ziel(''), '/');
  assert.equal(
    ziel('return_to=/products/qibracelet&sca_ref=1.x'),
    '/products/qibracelet?sca_ref=1.x',
  );
});

test('Z3 Ziel mit eigenem Query verliert seine Parameter nicht mehr', () => {
  assert.equal(
    ziel('redirect=/products/qibracelet?variant=7&sca_ref=1.x'),
    '/products/qibracelet?variant=7&sca_ref=1.x',
  );
});

test('Z4 Ad-Weiche: der Original-Query kommt vollständig auf der LP an', () => {
  const link = rabattZiel(
    '/pages/tiefer-schlaf?utm_content=abc&h_ad_id=120251220869070704',
    '120251220869070704',
    {aktiv: true, codes: {'120251220869070704': 'ADTEST'}},
  );
  assert.ok(link, 'rabattZiel lieferte keinen Link');
  const z = rabattlinkZiel(`https://qiblanco.com${link}`);
  assert.equal(z, '/pages/tiefer-schlaf?utm_content=abc&h_ad_id=120251220869070704');
});

test('Z5 die Route benutzt genau diese Funktion', () => {
  const route = readFileSync(join(WURZEL, 'app/routes/discount.$code.jsx'), 'utf8');
  assert.match(route, /rabattlinkZiel\(request\.url\)/);
  assert.doesNotMatch(route, /redirectParam/);
});
