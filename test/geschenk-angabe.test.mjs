// Regressionstest zur Geschenk-Angabe am Kasse-Knopf
// (Job 20261001-s07-geschenkoption-warenkorb).
// Stil wie test/cart-herkunfts-marker.test.mjs: node:test/node:assert als
// Bordmittel, KEIN Netz, und die Route wird WIRKLICH ausgefuehrt — eine
// Quelltext-Zusicherung sähe einen Wert, der nie erreicht wird, als gruen.
// Ausfuehren: node --test test/geschenk-angabe.test.mjs
//
// DIE DREI ZUSTÄNDE, die jeder Arm auseinanderhält:
//   geschenk=ja    Haken gesetzt
//   geschenk=nein  Checkbox gezeigt, Haken nicht gesetzt
//   kein Schlüssel Frage nie gestellt (z. B. Kauf am Formular vorbei)
// Der Leser im postkauf-manager splittet Muster M2 nur bei ja/nein. Würde
// "nie gefragt" als 'nein' geschrieben, stünde jeder Altkunde still als
// "Zweitnutzung" im Segment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs|ts|tsx)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
  load(url, kontext, naechster) {
    // Die Route ist .jsx, enthält aber keine JSX-Syntax.
    if (url.endsWith('.jsx')) {
      return {
        format: 'module',
        shortCircuit: true,
        source: readFileSync(fileURLToPath(url), 'utf8'),
      };
    }
    return naechster(url, kontext);
  },
});

const {action: attributionAction} = await import(
  '../app/routes/cart.attribution.jsx'
);
const {
  geschenkAusFormular,
  geschenkCartAttributes,
  geschenkVermerkt,
  GESCHENK_TEXT,
} = await import('../app/lib/geschenk.js');

const CHECKOUT = 'https://checkout.qiblanco.com/c/1';

function cartAttrappe({bestand = []} = {}) {
  const spur = {updateAttributes: null, aufrufe: 0};
  return {
    spur,
    cart: {
      get: async () => ({id: 'gid://cart/1', checkoutUrl: CHECKOUT, attributes: bestand}),
      updateAttributes: async (attributes) => {
        spur.updateAttributes = attributes;
        spur.aufrufe += 1;
        return {cart: {id: 'gid://cart/1', checkoutUrl: CHECKOUT, attributes}};
      },
      setCartId: () => new Headers(),
    },
  };
}

function kassenAnfrage(felder) {
  const kopf = new Headers({'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'});
  if (felder === null) {
    // Kein lesbarer Body: die Route darf trotzdem nicht werfen.
    return new Request('https://qiblanco.com/cart/attribution', {method: 'POST', headers: kopf});
  }
  const körper = new FormData();
  for (const [k, v] of Object.entries(felder)) körper.set(k, v);
  return new Request('https://qiblanco.com/cart/attribution', {method: 'POST', headers: kopf, body: körper});
}

async function kasse(felder, attrappe) {
  const {spur, cart} = cartAttrappe(attrappe);
  const antwort = await attributionAction({
    request: kassenAnfrage(felder),
    context: {cart, env: {}},
  });
  const m = new Map((spur.updateAttributes ?? []).map((a) => [a.key, a.value]));
  return {antwort, spur, m};
}

test('ARM-G1 Haken gesetzt: geschenk=ja landet am Warenkorb, ohne Cookie-Consent', async () => {
  const {m, antwort} = await kasse({geschenk_angezeigt: '1', geschenk: 'ja'});
  assert.equal(m.get('geschenk'), 'ja', 'ARM-G1: geschenk=ja fehlt am Cart-Attribut');
  assert.equal(antwort.status, 302, 'ARM-G1: der Weg zur Kasse ist gestört');
  assert.ok(antwort.headers.get('Location')?.startsWith(CHECKOUT), 'ARM-G1: Ziel ist nicht die Kasse');
});

test('ARM-G2 Checkbox gezeigt, nicht angehakt: geschenk=nein', async () => {
  const {m} = await kasse({geschenk_angezeigt: '1'});
  assert.equal(m.get('geschenk'), 'nein', 'ARM-G2: "gesehen, nicht angehakt" muss nein sein');
});

test('ARM-G3 nie gefragt: KEIN geschenk-Schlüssel (nicht nein)', async () => {
  const {m, spur} = await kasse({ad_params_seen: 'no'});
  assert.ok(spur.updateAttributes, 'ARM-G3: Herkunfts-Marker sollten trotzdem geschrieben werden');
  assert.equal(m.has('geschenk'), false, 'ARM-G3: ohne angezeigt-Feld darf kein geschenk-Attribut entstehen');
});

test('ARM-G4 Haken wieder entfernt: nein ersetzt ein früheres ja', async () => {
  const {m} = await kasse(
    {geschenk_angezeigt: '1'},
    {bestand: [{key: 'geschenk', value: 'ja'}]},
  );
  assert.equal(m.get('geschenk'), 'nein', 'ARM-G4: die letzte Antwort muss gelten');
});

test('ARM-G5 unveränderte Antwort: der Wert bleibt, ohne eigene Mutation', async () => {
  const attrs = geschenkCartAttributes('ja', {bestehendeAttribute: [{key: 'geschenk', value: 'ja'}]});
  assert.deepEqual(attrs, [], 'ARM-G5: gleiche Antwort darf kein neues Attribut liefern');
  const {m} = await kasse(
    {geschenk_angezeigt: '1', geschenk: 'ja'},
    {bestand: [{key: 'geschenk', value: 'ja'}]},
  );
  // Die Route schreibt wegen der Herkunfts-Marker trotzdem; das ja bleibt drin.
  if (m.size) assert.equal(m.get('geschenk'), 'ja', 'ARM-G5: Vorbestand ja ging verloren');
});

test('ARM-G6 NAHT zum Ankunfts-Marker: die Kopie des Requests stiehlt ihm den Body nicht', async () => {
  const {m} = await kasse({geschenk_angezeigt: '1', geschenk: 'ja', ad_params_seen: 'yes'});
  assert.equal(m.get('geschenk'), 'ja', 'ARM-G6: geschenk fehlt');
  assert.equal(m.get('ad_params_seen'), 'yes_client',
    'ARM-G6: ad_params_seen kam nicht mehr an — die Geschenk-Lesung hat den Body verbraucht');
});

test('ARM-G7 fremde Werte: nur das versteckte Feld "1" zählt als gefragt', () => {
  const f = (o) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(o)) fd.set(k, v);
    return fd;
  };
  assert.equal(geschenkAusFormular(f({geschenk: 'ja'})), null, 'ARM-G7a: ohne angezeigt kein Wert');
  assert.equal(geschenkAusFormular(f({geschenk_angezeigt: '2', geschenk: 'ja'})), null, 'ARM-G7b');
  assert.equal(geschenkAusFormular(f({geschenk_angezeigt: '1', geschenk: 'vielleicht'})), 'nein', 'ARM-G7c');
  assert.equal(geschenkAusFormular(null), null, 'ARM-G7d');
  assert.deepEqual(geschenkCartAttributes('egal'), [], 'ARM-G7e: nur ja/nein werden geschrieben');
});

test('ARM-G8 Body unlesbar: die Route wirft nicht und leitet zur Kasse', async () => {
  const {antwort, m} = await kasse(null);
  assert.equal(antwort.status, 302, 'ARM-G8');
  assert.equal(m.has('geschenk'), false, 'ARM-G8: ohne Formular kein geschenk');
});

test('ARM-G9 Vorbelegung des Hakens folgt nur einem echten ja', () => {
  assert.equal(geschenkVermerkt([{key: 'geschenk', value: 'ja'}]), true, 'ARM-G9a');
  assert.equal(geschenkVermerkt([{key: 'geschenk', value: 'nein'}]), false, 'ARM-G9b');
  assert.equal(geschenkVermerkt(null), false, 'ARM-G9c');
});

test('ARM-G10 Wortlaut: echte Umlaute-tauglich, kein Versprechen', () => {
  assert.equal(GESCHENK_TEXT, 'Das ist ein Geschenk');
  const quelle = readFileSync(new URL('../app/components/CartSummary.jsx', import.meta.url), 'utf8');
  assert.ok(!/defaultChecked=\{true\}|\bchecked\b(?!=)/.test(quelle.replace(/defaultChecked=\{geschenk\}/, '')),
    'ARM-G10: die Checkbox darf nie fest vorausgefüllt sein');
  assert.ok(!/Rechnung/.test(quelle), 'ARM-G10: kein Rechnungs-Versprechen ohne Beleg des Versandwegs');
});
