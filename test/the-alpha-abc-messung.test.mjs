/**
 * A/B/C-Test the-alpha-abc-e1, Messung und bezahlter Verkehr (Grossjob
 * 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c, s07;
 * Christian Z5: „A/B/C Test wie bei den Ads").
 *
 * WAS DIESER TEST BEWEIST:
 *  1. Das Cookie qb_ab_the_alpha_abc (gesetzt von TheAlphaArm.jsx auf der Seite
 *     des Arms) wird zum Warenkorb-Attribut _the_alpha_variante, consent-frei
 *     wie consent_state/ua_class, und nur für a|b|c. Ohne Cookie: kein Attribut,
 *     die übrigen Herkunfts-Marker bleiben byte-gleich.
 *  2. Bezahlter Verkehr auf einer Qi-Alpha-Kaufseite (/products/the-alpha und
 *     die alten Adressen) geht auf /pages/Qi-Alpha statt auf LP A (QiOne).
 *     Live gemessen 2026-10-26 ~12:55Z: /products/the-alpha?fbclid=x&utm_medium=paid
 *     -> 302 /pages/schlaf-zellen-schutz. Andere Kaufseiten bleiben bei LP A,
 *     Google-Klicks auf /products/* bleiben auf der Produktseite.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  THE_ALPHA_ARM_COOKIE,
  THE_ALPHA_VARIANTE_ATTRIBUT,
  buildOriginCartAttributes,
  mergeCartAttributes,
  theAlphaVarianteAusCookie,
} from '../app/lib/checkout-tracking.js';
import {entscheideAdWeiche} from '../app/lib/ad-weiche.server.js';
import {produktLpZiel, THE_ALPHA_PRODUKT_PFADE} from '../app/lib/ad-weiche-ziele.js';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const wert = (attrs, key) => attrs.find((a) => a.key === key)?.value;

test('Cookie-Name und Attribut-Name stehen fest (Leser: Auswertung the-alpha-abc, Bestellung note_attributes)', () => {
  assert.equal(THE_ALPHA_ARM_COOKIE, 'qb_ab_the_alpha_abc');
  assert.equal(THE_ALPHA_VARIANTE_ATTRIBUT, '_the_alpha_variante');
});

test('Variante aus dem Cookie: nur a|b|c, Groß/klein egal, alles andere null', () => {
  for (const [roh, soll] of [
    ['qb_ab_the_alpha_abc=a', 'a'],
    ['x=1; qb_ab_the_alpha_abc=b; _fbp=fb.1', 'b'],
    ['qb_ab_the_alpha_abc=C', 'c'],
    ['qb_ab_the_alpha_abc=d', null],
    ['qb_ab_the_alpha_abc=', null],
    ['qb_ab_the_alpha_abc=ab', null],
    ['qb_ab_andere=b', null],
    ['', null],
  ]) {
    assert.equal(theAlphaVarianteAusCookie(roh), soll, roh);
  }
  assert.equal(theAlphaVarianteAusCookie(null), null);
});

test('Herkunfts-Marker tragen _the_alpha_variante je Arm, ohne Einwilligungs-Cookie (consent-frei)', () => {
  for (const arm of ['a', 'b', 'c']) {
    const attrs = buildOriginCartAttributes({userAgent: IPHONE, cookieHeader: `qb_ab_the_alpha_abc=${arm}`});
    assert.equal(wert(attrs, '_the_alpha_variante'), arm);
    assert.equal(wert(attrs, 'attribution_source'), 'qiblanco_hydrogen');
  }
});

test('Ohne Cookie: kein Attribut, die Bestands-Marker bleiben dieselben (Schlüssel und Reihenfolge)', () => {
  const ohne = buildOriginCartAttributes({userAgent: IPHONE, cookieHeader: 'CookieConsent=x'});
  assert.equal(wert(ohne, '_the_alpha_variante'), undefined);
  assert.deepEqual(
    ohne.map((a) => a.key),
    ['attribution_source', 'consent_state', 'ua_class', 'ad_params_seen'],
  );
  const mit = buildOriginCartAttributes({userAgent: IPHONE, cookieHeader: 'CookieConsent=x; qb_ab_the_alpha_abc=b'});
  assert.deepEqual(mit.slice(0, 4), ohne);
});

test('Merge: ein späterer Arm überschreibt den früheren am Warenkorb (letzte gesehene Variante gilt)', () => {
  const vorher = [{key: '_the_alpha_variante', value: 'a'}, {key: 'consent_state', value: 'granted'}];
  const neu = buildOriginCartAttributes({userAgent: IPHONE, cookieHeader: 'qb_ab_the_alpha_abc=c'});
  const {attributes, changed} = mergeCartAttributes(vorher, neu);
  assert.equal(changed, true);
  assert.equal(wert(attributes, '_the_alpha_variante'), 'c');
});

test('Ad-Weiche: bezahlter Klick auf eine Qi-Alpha-Kaufseite geht auf /pages/Qi-Alpha, Query byte-gleich', () => {
  const q = '?fbclid=x&utm_medium=paid&utm_content=120250590409220704';
  for (const pfad of ['/products/the-alpha', '/products/The-Alpha', '/products/qi-master', '/products/qi-alpha', '/products/qi-master-wunschnummer']) {
    const e = entscheideAdWeiche(`https://qiblanco.com${pfad}${q}`);
    assert.equal(e.ziel, `/pages/Qi-Alpha${q}&lp_m=w`, pfad);
  }
  assert.equal(produktLpZiel('/products/the-alpha/'), '/pages/Qi-Alpha');
  assert.ok(THE_ALPHA_PRODUKT_PFADE.every((p) => p === p.toLowerCase()));
});

test('Ad-Weiche: andere Kaufseiten bleiben bei LP A, Google auf /products/* bleibt auf der Produktseite, The-Alpha selbst wird nie umgeleitet', () => {
  const q = '?fbclid=x&utm_medium=paid';
  assert.equal(entscheideAdWeiche(`https://qiblanco.com/products/qione-2-pro${q}`).ziel, `/pages/schlaf-zellen-schutz${q}&lp_m=w`);
  assert.equal(entscheideAdWeiche('https://qiblanco.com/products/the-alpha?gclid=x'), null);
  assert.equal(entscheideAdWeiche(`https://qiblanco.com/pages/The-Alpha${q}`), null);
  assert.equal(entscheideAdWeiche(`https://qiblanco.com/pages/The-Alpha-B${q}`), null);
  assert.equal(entscheideAdWeiche(`https://qiblanco.com/pages/The-Alpha-C${q}`), null);
  assert.equal(entscheideAdWeiche('https://qiblanco.com/products/the-alpha'), null);
});
