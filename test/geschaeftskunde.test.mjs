// Wächter: Login-Schalter Privat / Geschäftlich und Geschäftskonto (node --test,
// ohne Bundler, ohne Netz). Job 20261126-prio1-b2b-link-portugal-...-r2.
// Christian 26.11.2026: „oben im Login-Fenster irgendwie kombinieren, dass er da
// quasi irgendwie eine Geschäftsadresse anlegen kann.“
//
// Gemessen werden Loader/Action WIRKLICH (gestellte Sitzung, gestelltes
// Kundenkonto, gestellte Tür über globalThis.fetch):
//   - Privat bleibt ein Knopf zur unveränderten Anmeldung, Rücksprung nur auf eigene Pfade,
//   - Geschäftlich merkt die Firmendaten in der Sitzung und schickt zur Anmeldung
//     mit Rücksprung ins Geschäftskonto,
//   - die NAHT zur Tür: der Shop schickt genau die Felder, die b2b-ust/src/geschaeftskunde.py
//     liest (firma, uid, adresse.anschrift (Altname wird am Server weiter gelesen), plz, ort, land), das Kundentoken im
//     Kopf Authorization, und liest bestaetigt (true|false|null).
// ROT VOR GRÜN: auf origin/main 10cae498 fehlen app/lib/geschaeftskunde*.js (Import scheitert).
// Ausführen: node --test test/geschaeftskunde.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(s, k, n) {
    if (s.startsWith('~/')) {
      const p = APP + s.slice(2);
      return n(/\.(js|jsx|mjs)$/.test(p) ? p : p + '.js', k);
    }
    return n(s, k);
  },
});

const lib = await import('../app/lib/geschaeftskunde.js');
const srv = await import('../app/lib/geschaeftskunde.server.js');
const anm = await import('../app/lib/geschaeftskunde-anmelden.server.js');

function sitzung() {
  const m = new Map();
  return {get: (k) => m.get(k), set: (k, v) => m.set(k, v), unset: (k) => m.delete(k), _m: m};
}
function kontext({eingeloggt = false, token = 'kundentoken-aaaaaaaaaaaaaaaa'} = {}) {
  return {
    session: sitzung(),
    env: {},
    customerAccount: {isLoggedIn: async () => eingeloggt, getAccessToken: async () => token},
  };
}
function formular(felder) {
  const f = new FormData();
  for (const [k, v] of Object.entries(felder)) f.set(k, v);
  return f;
}
const FIRMA = {firma: 'Empresa Teste Lda', uid: 'pt 500 697 256', anschrift: 'Rua Teste 1', plz: '1000-001', ort: 'Lisboa', land: 'PT', lang: 'en'};

test('Privat: Knopf zur unveränderten Anmeldung, Rücksprung nur eigene Pfade', async () => {
  const r = await anm.ladeAnmelden({request: new Request('https://qiblanco.com/account/anmelden?return_to=%2Fproducts%2Fqi-alpha'), context: kontext()}, '');
  assert.equal(r.art, 'privat');
  assert.equal(r.returnTo, '/products/qi-alpha');
  assert.equal(lib.rueckweg('//boese.example/x'), '');
  assert.equal(lib.rueckweg('/account/anmelden?art=privat'), '');
  assert.equal(lib.rueckweg('/account/login'), '');
});

test('Eingeloggt: Geschäftlich führt direkt ins Geschäftskonto', async () => {
  await assert.rejects(
    anm.ladeAnmelden({request: new Request('https://qiblanco.com/geschaeftskunde?lang=en'), context: kontext({eingeloggt: true})}, 'geschaeftlich'),
    (res) => res instanceof Response && res.headers.get('Location') === '/account/geschaeftskunde?lang=en',
  );
});

test('Geschäftlich absenden: Firmendaten in der Sitzung, Weiterleitung zur Anmeldung mit Rücksprung', async () => {
  const ctx = kontext();
  const req = new Request('https://qiblanco.com/account/anmelden', {method: 'POST', body: formular(FIRMA)});
  const res = await anm.sendeAnmelden({request: req, context: ctx});
  assert.ok(res instanceof Response);
  assert.equal(res.headers.get('Location'), '/account/login?return_to=%2Faccount%2Fgeschaeftskunde%3Flang%3Den');
  const gemerkt = ctx.session.get(lib.SESSION_SCHLUESSEL);
  assert.equal(gemerkt.daten.uid, 'PT500697256');
  assert.equal(gemerkt.daten.adresse.land, 'PT');
  // hole() löscht den Merkposten (einmalige Anmeldung)
  assert.equal(srv.hole(ctx).firma, 'Empresa Teste Lda');
  assert.equal(srv.hole(ctx), null);
});

test('Geschäftlich unvollständig: Satz statt Weiterleitung, nichts gemerkt', async () => {
  const ctx = kontext();
  const req = new Request('https://qiblanco.com/account/anmelden', {method: 'POST', body: formular({...FIRMA, anschrift: ''})});
  const res = await anm.sendeAnmelden({request: req, context: ctx});
  assert.ok(res.fehler);
  assert.equal(ctx.session.get(lib.SESSION_SCHLUESSEL), undefined);
  assert.equal(lib.datenAusFormular(formular({...FIRMA, uid: '12345'}), 'de').fehler, lib.TEXT.de.uidForm);
});

test('NAHT zur Tür: Felder, Kundentoken und bestaetigt', async () => {
  const gesehen = [];
  const alt = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    gesehen.push({url: String(url), init});
    const weg = String(url).split('/api/gk/')[1];
    const body = weg === 'vies' ? {ok: true, bestaetigt: true, name: 'EDP, S.A.'} : {ok: true, geschaeftskunde: true, bestaetigt: false};
    return new Response(JSON.stringify(body), {status: 200, headers: {'Content-Type': 'application/json'}});
  };
  try {
    const v = await srv.viesAbfrage(kontext(), {uid: 'PT500697256', land: 'PT'});
    assert.equal(v.bestaetigt, true);
    const {daten} = lib.datenAusFormular(formular(FIRMA), 'en');
    const a = await srv.anmelden(kontext(), daten);
    assert.equal(a.bestaetigt, false);
    const [g1, g2] = gesehen;
    assert.equal(g1.url, 'https://b2b.dienst.qiblanco.com/api/gk/vies');
    assert.deepEqual(JSON.parse(g1.init.body), {uid: 'PT500697256', adresse: {land: 'PT'}});
    assert.equal(g2.url, 'https://b2b.dienst.qiblanco.com/api/gk/anmelden');
    assert.equal(g2.init.headers.Authorization, 'kundentoken-aaaaaaaaaaaaaaaa');
    const b = JSON.parse(g2.init.body);
    assert.deepEqual(Object.keys(b.adresse).sort(), ['anschrift', 'land', 'ort', 'plz']);
    assert.equal(b.firma, 'Empresa Teste Lda');
    // ohne Kundentoken geht keine Anmeldung an die Tür
    const n = gesehen.length;
    const ohne = await srv.anmelden(kontext({token: ''}), daten);
    assert.equal(ohne.grund, 'token');
    assert.equal(gesehen.length, n);
  } finally {
    globalThis.fetch = alt;
  }
});

test('Tür gestört: nie ein Wurf, ok=false', async () => {
  const alt = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('netz weg');
  };
  try {
    const r = await srv.status(kontext());
    assert.deepEqual(r, {ok: false, grund: 'messausfall'});
  } finally {
    globalThis.fetch = alt;
  }
});
