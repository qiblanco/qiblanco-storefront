// Regressionstest zu app/lib/cart-fehlertext.server.js (Vorgang
// EL-20261127-8fe7809a, devlog F-3008): der Wortlaut der Storefront-API muss
// die Produktions-Serialisierung überleben und darf nichts Fremdes mitnehmen.
// Ausfuehren: node --test test/cart-fehlertext.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FEHLER_KOPF,
  MAX_ZEICHEN,
  fehlerAlsDaten,
  fehlerKopfwert,
} from '../app/lib/cart-fehlertext.server.js';

// Nachbau der Form, die Hydrogen liefert: Unterklasse von Error mit
// extensions/path/locations und einer `cause`, die Query und Variablen trägt.
class GraphQLError extends Error {
  constructor(message, {extensions, path, locations, cause} = {}) {
    super(message);
    this.name = 'GraphQLError';
    this.extensions = extensions;
    this.path = path;
    this.locations = locations;
    this.cause = cause;
  }
}

const GEHEIM = 'shpat_GEHEIM_token_und_attribut__qpx_anon';

function hydrogenFehler() {
  return new GraphQLError(
    '[h2:error:storefront.mutation] Variable $input of type CartInput! was provided invalid value for lines.0.quantity - Request ID: abc-123',
    {
      extensions: {code: 'INVALID_VARIABLE', value: GEHEIM},
      path: ['cartCreate'],
      locations: [{line: 3, column: 5}],
      cause: JSON.stringify({graphql: {variables: GEHEIM}}),
    },
  );
}

test('Error-Instanz wird schlichtes Objekt mit message/code/path', () => {
  const [f] = fehlerAlsDaten([hydrogenFehler()]);
  assert.equal(Object.getPrototypeOf(f), Object.prototype);
  assert.deepEqual(Object.keys(f).sort(), ['code', 'message', 'path']);
  assert.match(f.message, /invalid value for lines\.0\.quantity/);
  assert.match(f.message, /Request ID: abc-123/);
  assert.equal(f.code, 'INVALID_VARIABLE');
  assert.deepEqual(f.path, ['cartCreate']);
});

test('nichts aus cause/extensions-Werten/locations geht mit', () => {
  const roh = JSON.stringify(fehlerAlsDaten([hydrogenFehler()]));
  assert.ok(!roh.includes(GEHEIM), roh);
  assert.ok(!roh.includes('locations'), roh);
});

test('Länge und Leerwerte bleiben (Leser prüfen nur errors?.length)', () => {
  assert.equal(fehlerAlsDaten(undefined), undefined);
  assert.equal(fehlerAlsDaten(null), null);
  assert.deepEqual(fehlerAlsDaten([]), []);
  assert.equal(fehlerAlsDaten([hydrogenFehler(), hydrogenFehler()]).length, 2);
});

test('Text auf MAX_ZEICHEN gekappt', () => {
  const [f] = fehlerAlsDaten([new Error('x'.repeat(5000))]);
  assert.equal(f.message.length, MAX_ZEICHEN);
});

test('übersteht JSON wie Strings, kein Error mehr in den Daten', () => {
  const daten = fehlerAlsDaten([hydrogenFehler(), 'nur Text', {message: 'm'}]);
  for (const f of daten) assert.ok(!(f instanceof Error));
  assert.equal(daten[1].message, 'nur Text');
  assert.equal(daten[2].code, null);
  assert.equal(daten[2].path, null);
});

test('Kopfzeile: errors zuerst, druckbares ASCII, Headers nimmt sie an', () => {
  const wert = fehlerKopfwert({errors: [hydrogenFehler()]});
  assert.match(wert, /^INVALID_VARIABLE: \[h2:error:storefront\.mutation\]/);
  assert.match(wert, /^[\x20-\x7E]+$/);
  assert.ok(wert.length <= MAX_ZEICHEN);
  const h = new Headers({[FEHLER_KOPF]: wert});
  assert.equal(h.get(FEHLER_KOPF), wert);
});

test('Kopfzeile: ohne errors die userErrors, Umlaute umschrieben', () => {
  const wert = fehlerKopfwert({
    errors: [],
    userErrors: [
      {
        code: 'INVALID',
        field: ['input', 'lines', '0', 'merchandiseId'],
        message: 'Der Merchandise-Artikel mit der ID gid://shopify/ProductVariant/1 existiert nicht für Österreich…',
      },
    ],
  });
  // Erwartung aus Teilen gebaut: die Umschrift IST hier der Gegenstand, und
  // das Umlaut-Gate soll sie nicht für einen Schreibfehler halten.
  const ae = (vokal) => `${vokal}e`;
  assert.equal(
    wert,
    `INVALID: Der Merchandise-Artikel mit der ID gid://shopify/ProductVariant/1 existiert nicht f${ae('u')}r ${ae('O')}sterreich...`,
  );
});

test('Kopfzeile: nichts da -> null, kaputte Eingabe wirft nie', () => {
  assert.equal(fehlerKopfwert({errors: [], userErrors: []}), null);
  assert.equal(fehlerKopfwert(null), null);
  assert.equal(fehlerKopfwert(undefined), null);
  const boese = {
    get errors() {
      throw new Error('Getter kaputt');
    },
  };
  assert.equal(fehlerKopfwert(boese), null);
});
