// Zuteilung des A/B-Tests der Kaufleiste (app/lib/kaufleiste-ab.server.js),
// Grossjob 20261025-design-ai-anna-fenster-wie-apple-handy-hochrutschen-ab-
// jetzt-kaufen s03. Hermetisch, kein Netz: node --test test/kaufleiste-ab.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ANTEIL_B,
  KAUFLEISTE_AB_SALZ,
  kaufleisteAbAktiv,
  kaufleisteAbDaten,
  kaufleisteArm,
} from '../app/lib/kaufleiste-ab.server.js';
import {besucherEimer} from '../app/lib/lp-ab-v2.server.js';

const UA_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const anfrage = (pfad, {ip = '203.0.113.7', ua = UA_IPHONE} = {}) =>
  new Request('https://qiblanco.com' + pfad, {
    headers: {'user-agent': ua, ...(ip ? {'oxygen-buyer-ip': ip} : {})},
  });

test('Zuteilung folgt besucherEimer mit eigenem Salz, stabil je Besucher', () => {
  for (const ip of ['203.0.113.7', '198.51.100.20', '192.0.2.99']) {
    const erwartet = besucherEimer(ip, UA_IPHONE, KAUFLEISTE_AB_SALZ) < ANTEIL_B ? 'b' : 'a';
    const r1 = kaufleisteArm(anfrage('/products/qione-2-pro', {ip}), {}, 'qione-2-pro');
    const r2 = kaufleisteArm(anfrage('/products/qibracelet', {ip}), {}, 'qibracelet');
    assert.deepEqual(r1, {arm: erwartet, erzwungen: false});
    assert.equal(r2.arm, erwartet, 'derselbe Arm auf allen Kaufseiten');
  }
});

test('50/50: über 2000 Besucherkennungen fallen beide Arme nahe der Hälfte', () => {
  let b = 0;
  const n = 2000;
  for (let i = 0; i < n; i += 1) {
    const ip = `10.${(i >> 8) & 255}.${i & 255}.${(i * 7) & 255}`;
    // 10.x ist nicht intern (interner-verkehr.js kennt nur die Server-Netze)
    const r = kaufleisteArm(anfrage('/products/qione-2-pro', {ip: `198.18.${(i >> 8) & 255}.${i & 255}`}), {}, 'qione-2-pro');
    assert.ok(r, ip);
    if (r.arm === 'b') b += 1;
  }
  assert.ok(b > n * 0.45 && b < n * 0.55, `b=${b}`);
});

test('Pin ?kaufleiste=a|b erzwingt den Arm und markiert ihn', () => {
  assert.deepEqual(kaufleisteArm(anfrage('/products/qione-2-pro?kaufleiste=b'), {}, 'qione-2-pro'),
    {arm: 'b', erzwungen: true});
  assert.deepEqual(kaufleisteArm(anfrage('/products/qione-2-pro?kaufleiste=a'), {}, 'qione-2-pro'),
    {arm: 'a', erzwungen: true});
  // Pin gilt auch für den eigenen Verkehr (Messwerkzeuge)
  const intern = anfrage('/products/qione-2-pro?kaufleiste=b', {ua: 'QiBlancoInternal/1.0 (probe)'});
  assert.deepEqual(kaufleisteArm(intern, {}, 'qione-2-pro'), {arm: 'b', erzwungen: true});
});

test('nicht im Test: eigener Verkehr, Bots, ohne IP, Produkt ohne Nutzen, Kill', () => {
  assert.equal(kaufleisteArm(anfrage('/products/qione-2-pro', {ua: 'QiBlancoInternal/1.0 (x)'}), {}, 'qione-2-pro'), null);
  assert.equal(kaufleisteArm(anfrage('/products/qione-2-pro', {ua: 'Googlebot/2.1 (+http://www.google.com/bot.html)'}), {}, 'qione-2-pro'), null);
  assert.equal(kaufleisteArm(anfrage('/products/qione-2-pro', {ip: ''}), {}, 'qione-2-pro'), null);
  assert.equal(kaufleisteArm(anfrage('/products/qi-master?kaufleiste=b'), {}, 'qi-master'), null);
  assert.equal(kaufleisteArm(anfrage('/products/qione-2-pro?kaufleiste=b'), {KAUFLEISTE_AB_MODE: 'off'}, 'qione-2-pro'), null);
  assert.equal(kaufleisteArm(anfrage('/products/qione-2-pro?kaufleiste=b'), {}, 'qione-2-pro', false), null);
  assert.equal(kaufleisteAbAktiv({KAUFLEISTE_AB_MODE: 'on'}), true);
  assert.equal(kaufleisteAbAktiv({KAUFLEISTE_AB_MODE: 'aus'}), true, "nur 'off' schaltet ab");
});

test('Loaderdaten: Schlüssel nur im Test', () => {
  const req = anfrage('/products/qione-2-pro?kaufleiste=b');
  assert.deepEqual(kaufleisteAbDaten({request: req, context: {env: {}}}, 'qione-2-pro'),
    {kaufleisteAb: {arm: 'b', erzwungen: true}});
  assert.deepEqual(kaufleisteAbDaten({request: req, context: {env: {KAUFLEISTE_AB_MODE: 'off'}}}, 'qione-2-pro'), {});
});
