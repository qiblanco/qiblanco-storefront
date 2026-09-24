// Hermetische Tests: Partnerlink setzt den Partnercode automatisch
// (Job 20260924-partnerlink-setzt-code-automatisch-und-permalink-einbettungsfest-prio12).
// node:test/node:assert, kein Netz. Ausfuehren: node --test test/partnercode.test.mjs
// Rot-vor-Gruen: test/rot-vor-gruen/partnercode-mutanten.sh
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  eintragFuer,
  partnercodeFuer,
  refAusAufruf,
  wendePartnercodeAn,
  PARTNERCODE_KOPF,
} from '../app/lib/partnercode.server.js';
import {erzeuge} from '../bin/partnercode-gen.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const REF = '2043355.AbCdEfGh12';
const CODE = 'TESTIX';

async function eintraege() {
  return [await eintragFuer(REF, CODE), await eintragFuer('77.ZzZzZzZz99', 'ANDERS')];
}

function aufruf(query, kopf = {}, methode = 'GET') {
  return new Request(`https://qiblanco.com/products/qione-2-pro${query}`, {
    method: methode,
    headers: kopf,
  });
}

/** Warenkorb-Attrappe mit den drei Methoden, die das Modul benutzt. */
function korb(codes, {wirft = false} = {}) {
  const aufrufe = [];
  return {
    aufrufe,
    async get() {
      aufrufe.push('get');
      if (wirft) throw new Error('Storefront weg');
      return codes === null ? null : {id: 'gid://shopify/Cart/1', discountCodes: codes.map((code) => ({code, applicable: true}))};
    },
    async updateDiscountCodes(liste) {
      aufrufe.push(['update', liste]);
      return {cart: {id: 'gid://shopify/Cart/neu'}, errors: []};
    },
    setCartId(id) {
      aufrufe.push(['setCartId', id]);
      const h = new Headers();
      h.append('Set-Cookie', `cart=${id.split('/').pop()}; Path=/`);
      return h;
    },
  };
}

// --- A: Entschluesselung ------------------------------------------------------

test('A1 der richtige Link liefert den Code', async () => {
  assert.equal(await partnercodeFuer(REF, await eintraege()), CODE);
});

test('A2 derselbe Partner mit falschem Token liefert NICHTS (kein Aufzaehlen ueber die id)', async () => {
  const e = await eintraege();
  assert.equal(await partnercodeFuer('2043355.AbCdEfGh13', e), null);
  assert.equal(await partnercodeFuer('2043355', e), null);
  assert.equal(await partnercodeFuer('2043355.', e), null);
});

test('A3 Unsinn und leere Daten werfen nie', async () => {
  assert.equal(await partnercodeFuer('<script>', await eintraege()), null);
  assert.equal(await partnercodeFuer(REF, []), null);
  assert.equal(await partnercodeFuer(REF, [{k: 'x', c: '!!'}]), null);
});

// --- B: Datenmodul traegt keinen Klartext -------------------------------------

test('B1 der Erzeuger schreibt weder Code noch Link-Token', async () => {
  const text = await erzeuge({eintraege: [{ref: REF, code: CODE}, {ref: '77.ZzZzZzZz99', code: 'ANDERS'}]});
  assert.ok(!text.includes(CODE), 'Code im Klartext');
  assert.ok(!text.includes('ANDERS'), 'Code im Klartext');
  assert.ok(!text.includes('AbCdEfGh12'), 'Token im Klartext');
  assert.ok(!text.includes('2043355'), 'Affiliate-id im Klartext');
  assert.match(text, /PARTNERCODE_ANZAHL = 2;/);
});

test('B2 der Erzeuger ist deterministisch (kein Diff-Rauschen im Abgleich)', async () => {
  const e = {eintraege: [{ref: REF, code: CODE}, {ref: '77.ZzZzZzZz99', code: 'ANDERS'}]};
  const umgedreht = {eintraege: [...e.eintraege].reverse()};
  assert.equal(await erzeuge(e), await erzeuge(umgedreht));
});

test('B3 das eingecheckte Datenmodul ist Erzeuger-Ausgabe (Kopf) und nur .server', () => {
  const text = readFileSync(join(WURZEL, 'app/lib/partnercode-daten.server.js'), 'utf8');
  assert.match(text, /^\/\/ ERZEUGT von bin\/partnercode-gen\.mjs/);
  // Kein Klartext-Feld: nur k und c.
  assert.ok(!/code\s*:/.test(text), 'Feld "code" im Datenmodul');
});

// --- C: welcher Aufruf wird gefragt -------------------------------------------

test('C1 Seitenaufruf mit sca_ref -> Link-Wert', () => {
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}`, {'sec-fetch-dest': 'document'})), REF);
  // Browser ohne Sec-Fetch-Kopf
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}&utm_source=x`)), REF);
});

test('C2 kein Warenkorb fuer Datenabruf, Rahmen, POST, Bot oder fehlendes sca_ref', () => {
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}`, {'sec-fetch-dest': 'empty'})), null);
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}`, {'sec-fetch-dest': 'iframe'})), null);
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}`, {}, 'POST')), null);
  assert.equal(refAusAufruf(aufruf(`?sca_ref=${REF}`, {'user-agent': 'Googlebot'}), (ua) => /bot/i.test(ua)), null);
  assert.equal(refAusAufruf(aufruf('?utm_source=x')), null);
});

// --- D: Warenkorb --------------------------------------------------------------

test('D1 leerer bzw. fehlender Warenkorb bekommt den Code, Cookie geht an die Antwort', async () => {
  for (const vorher of [null, []]) {
    const k = korb(vorher);
    const kopf = new Headers();
    const z = await wendePartnercodeAn({ref: REF, cart: k, responseHeaders: kopf, eintraege: await eintraege(), an: true});
    assert.equal(z, 'gesetzt');
    assert.deepEqual(k.aufrufe.find((a) => a[0] === 'update'), ['update', [CODE]]);
    assert.match(kopf.get('set-cookie') || '', /cart=neu/);
    assert.equal(kopf.get(PARTNERCODE_KOPF), 'gesetzt');
  }
});

test('D2 ein schon gesetzter ANDERER Code wird NICHT ersetzt', async () => {
  const k = korb(['KUNDE10']);
  const kopf = new Headers();
  const z = await wendePartnercodeAn({ref: REF, cart: k, responseHeaders: kopf, eintraege: await eintraege(), an: true});
  assert.equal(z, 'fremder-code');
  assert.ok(!k.aufrufe.some((a) => a[0] === 'update'), 'update wurde gerufen');
  assert.equal(kopf.get('set-cookie'), null);
});

test('D3 derselbe Code (andere Schreibweise) -> nichts zu tun', async () => {
  const k = korb(['testix']);
  const z = await wendePartnercodeAn({ref: REF, cart: k, responseHeaders: new Headers(), eintraege: await eintraege(), an: true});
  assert.equal(z, 'schon-gesetzt');
  assert.ok(!k.aufrufe.some((a) => a[0] === 'update'));
});

test('D4 unbekannter Link fasst den Warenkorb nicht an', async () => {
  const k = korb([]);
  const z = await wendePartnercodeAn({ref: '9.unbekannt00', cart: k, responseHeaders: new Headers(), eintraege: await eintraege(), an: true});
  assert.equal(z, 'kein-treffer');
  assert.deepEqual(k.aufrufe, []);
});

test('D5 Schalter aus -> nichts; Stoerung -> kein Wurf, Zustand fehler', async () => {
  const k = korb([]);
  assert.equal(await wendePartnercodeAn({ref: REF, cart: k, responseHeaders: new Headers(), eintraege: await eintraege(), an: false}), 'aus');
  assert.deepEqual(k.aufrufe, []);
  const kaputt = korb([], {wirft: true});
  const kopf = new Headers();
  const alt = console.error;
  console.error = () => {};
  try {
    assert.equal(await wendePartnercodeAn({ref: REF, cart: kaputt, responseHeaders: kopf, eintraege: await eintraege(), an: true}), 'fehler');
  } finally {
    console.error = alt;
  }
  assert.equal(kopf.get(PARTNERCODE_KOPF), 'fehler');
});

// --- E: Naht zur Einhaengestelle -----------------------------------------------

test('E1 entry.server.jsx ruft die Anwendung VOR dem Rendern mit context.cart', () => {
  const src = readFileSync(join(WURZEL, 'app/entry.server.jsx'), 'utf8');
  const i = src.indexOf('wendePartnercodeAn({');
  const r = src.indexOf('await renderToReadableStream(');
  assert.ok(i > 0, 'Aufruf fehlt');
  assert.ok(i < r, 'Aufruf steht nicht vor dem Rendern');
  assert.match(src.slice(i, i + 200), /cart:\s*context\.cart/);
  assert.match(src, /refAusAufruf\(request,\s*isbot\)/);
});
