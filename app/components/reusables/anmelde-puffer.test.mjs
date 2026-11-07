// Hermetische Tests des Rückfall-Puffers für Anmeldungen (Elina EL-20261107-af9594f2, Punkt 4).
// Bordmittel node:test/node:assert, KEIN Netz: fetch, Speicher, Uhr und Schlaf sind Attrappen.
// Ausführen:  node --test app/components/reusables/anmelde-puffer.test.mjs
// ARME: VERLUST (Empfang weg -> Anmeldung bleibt im Speicher, nichts geht verloren), WIEDERHOLUNG
// (drei Runden), ZWEITER WEG (Shop-Route bei totem Direktweg), NACHSCHICKEN (nächster Seitenaufruf),
// KENNUNG (dieselbe anmelde_id auf allen Wegen), ENDGÜLTIG (4xx nimmt raus), HONIGTOPF, SPEICHER KAPUTT,
// ABLAUF (23 h), T (Automaten-Falle bleibt gültig), SHOP-ANTWORT, POSITIVKONTROLLE (alter Weg verliert).
// Der Rot-Arm: jede Mutation, die Wiederholung, Puffer oder zweiten Weg abschaltet, lässt mindestens
// einen dieser Tests scheitern (Mutationslauf im Job-Ordner 20261107-formular-rueckfall-puffer-browser-EL-af9594f2).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as P from './anmelde-puffer.js';

const ENDPUNKT = 'https://anmelden.example';
const T0 = Date.parse('2026-11-08T10:00:00Z');
const FELDER = {
  vorname: 'Ina',
  email: 'ina@example.org',
  frage: 'Schlaf?',
  webinar_id: 'longevity-esmog-wasser-2026-11-15',
  website: '',
  t: '0',
  einwilligung_id: '50873feedb1e',
  seite: '/pages/webinar-die-nacht-entscheidet',
  utm_content: 'wns-a1',
};

function speicher() {
  const m = new Map();
  return {
    m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
}

function kaputterSpeicher() {
  return {
    getItem: () => null,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {},
  };
}

/** Attrappe für fetch. antworten: (url, aufruf) -> {status, json} | 'netz' */
function netz(antworten) {
  const aufrufe = [];
  const holen = async (url, opt) => {
    const aufruf = {url, opt};
    aufrufe.push(aufruf);
    const a = antworten(url, aufruf, aufrufe.length);
    if (a === 'netz') throw new TypeError('Failed to fetch');
    return {status: a.status, json: async () => a.json ?? null};
  };
  return {holen, aufrufe};
}

const istDirekt = (u) => u.startsWith(ENDPUNKT);
const istShop = (u) => u === P.ZWEITER_WEG;

function deps(extra) {
  const pausen = [];
  return {
    pausen,
    d: {endpunkt: ENDPUNKT, jetzt: () => T0, schlafen: async (ms) => pausen.push(ms), ...extra},
  };
}

function liste(sp) {
  const roh = sp.getItem(P.PUFFER_SCHLUESSEL);
  return roh ? JSON.parse(roh) : [];
}

test.beforeEach(() => P._zuruecksetzen());

test('WIEDERHOLBAR: Netz, 5xx und 429 ja, Antworten des Empfangs nein', () => {
  for (const s of [0, 429, 500, 502, 503, 504, NaN]) assert.equal(P.wiederholbar(s), true, String(s));
  for (const s of [202, 400, 403, 404, 409]) assert.equal(P.wiederholbar(s), false, String(s));
});

test('DIREKT OK: ein Aufruf, Puffer danach leer, Körper wie bisher plus anmelde_id', async () => {
  const sp = speicher();
  const n = netz(() => ({status: 202, json: {ok: true, text: 'Mail kommt'}}));
  const {d} = deps({speicher: sp, holen: n.holen});
  const r = await P.zustellen({formular: 'webinar-nacht', felder: FELDER, t: T0 - 5000, versatz: 0}, d);
  assert.equal(r.status, 202);
  assert.equal(r.weg, 'direkt');
  assert.equal(r.gepuffert, false);
  assert.equal(n.aufrufe.length, 1);
  assert.equal(n.aufrufe[0].url, `${ENDPUNKT}/f/webinar-nacht`);
  const k = JSON.parse(n.aufrufe[0].opt.body);
  assert.equal(k.t, String(T0 - 5000));
  assert.equal(k.anmelde_id, r.id);
  assert.equal(k.email, FELDER.email);
  assert.equal(k.frage, FELDER.frage);
  assert.equal(k.website, '');
  assert.deepEqual(liste(sp), []);
});

test('VERLUST: Empfang ganz weg -> drei Runden, Anmeldung liegt sicher im Speicher', async () => {
  const sp = speicher();
  const n = netz(() => 'netz');
  const gewartet = [];
  const {d, pausen} = deps({speicher: sp, holen: n.holen, beiWarten: (g) => gewartet.push(g)});
  const r = await P.zustellen({formular: 'webinar-nacht', felder: FELDER, t: T0 - 5000, versatz: 1234}, d);
  assert.equal(r.gepuffert, true);
  assert.equal(r.status, 0);
  // drei Runden zu je zwei Wegen, mit Backoff dazwischen
  assert.equal(n.aufrufe.length, 6);
  assert.deepEqual(n.aufrufe.map((a) => (istDirekt(a.url) ? 'd' : istShop(a.url) ? 's' : '?')).join(''), 'dsdsds');
  assert.deepEqual(pausen, [5000, 15000]);
  assert.deepEqual(gewartet, [true, true]);
  const l = liste(sp);
  assert.equal(l.length, 1);
  assert.equal(l[0].id, r.id);
  assert.equal(l[0].formular, 'webinar-nacht');
  assert.equal(l[0].felder.email, FELDER.email);
  assert.equal(l[0].felder.einwilligung_id, FELDER.einwilligung_id);
  assert.equal('website' in l[0].felder, false);
  assert.equal(l[0].t, T0 - 5000);
  assert.equal(l[0].bis, T0 + 23 * 3600 * 1000);
});

test('WIEDERHOLUNG: zweite Runde trägt, Puffer danach leer', async () => {
  const sp = speicher();
  const n = netz((u, a, i) => (i <= 2 ? {status: 502, json: null} : {status: 202, json: {ok: true}}));
  const {d} = deps({speicher: sp, holen: n.holen});
  const r = await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, d);
  assert.equal(r.status, 202);
  assert.equal(r.gepuffert, false);
  assert.equal(n.aufrufe.length, 3);
  assert.deepEqual(liste(sp), []);
});

test('429 ist wiederholbar, nicht endgültig', async () => {
  const sp = speicher();
  const n = netz((u, a, i) => (i === 1 ? {status: 429, json: {ok: false, fehler: 'zu_viele_anfragen'}} : {status: 202, json: {ok: true}}));
  const {d} = deps({speicher: sp, holen: n.holen, zweiterWeg: false});
  const r = await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, d);
  assert.equal(r.status, 202);
  assert.equal(n.aufrufe.length, 2);
});

test('ZWEITER WEG: Direktweg tot, Shop-Route trägt mit derselben Kennung und allen Feldern', async () => {
  const sp = speicher();
  const n = netz((u) => (istDirekt(u) ? 'netz' : {status: 200, json: {ok: true, http: 202, text: 'Mail kommt'}}));
  const {d} = deps({speicher: sp, holen: n.holen});
  const r = await P.zustellen({formular: 'webinar-nacht', felder: FELDER, t: T0 - 7000, versatz: 0}, d);
  assert.equal(r.status, 202);
  assert.equal(r.weg, 'shop');
  assert.equal(r.antwort.text, 'Mail kommt');
  assert.deepEqual(liste(sp), []);
  const direkt = JSON.parse(n.aufrufe[0].opt.body);
  const shop = new URLSearchParams(n.aufrufe[1].opt.body);
  assert.equal(shop.get('anmelde_id'), direkt.anmelde_id);
  assert.equal(shop.get('formular_id'), 'webinar-nacht');
  assert.equal(shop.get('dauer_ms'), '7000');
  for (const k of ['vorname', 'email', 'frage', 'webinar_id', 'einwilligung_id', 'utm_content']) {
    assert.equal(shop.get(k), FELDER[k], k);
  }
  assert.equal(shop.get('website'), '');
  assert.equal(shop.has('t'), false);
  assert.equal(n.aufrufe[1].opt.headers['Content-Type'], 'application/x-www-form-urlencoded');
});

test('SHOP-ANTWORT: Status des Empfangs zählt, ohne http keine Antwort', () => {
  assert.deepEqual(P.shopAntwort(200, {ok: true, http: 202, text: 'x'}), {status: 202, antwort: {ok: true, text: 'x'}});
  assert.equal(P.shopAntwort(400, {ok: false, fehler: 'nicht_erreichbar', http: 0}).status, 0);
  assert.equal(P.shopAntwort(400, {ok: false, fehler: 'einwilligung_veraltet', http: 409}).status, 409);
  assert.equal(P.shopAntwort(400, {ok: false, fehler: 'fehler', http: 503}).status, 503);
  // alte Route ohne http, Oxygen-Fehlerseite, kaputtes JSON: keine Antwort (wiederholbar)
  for (const j of [{ok: true}, null, 'x']) assert.equal(P.shopAntwort(200, j).status, 0);
});

test('ENDGÜLTIG: 409/400/403/404 nehmen den Eintrag raus und werden nicht wiederholt', async () => {
  for (const s of [400, 403, 404, 409]) {
    P._zuruecksetzen();
    const sp = speicher();
    const n = netz(() => ({status: s, json: {ok: false, fehler: 'x'}}));
    const {d} = deps({speicher: sp, holen: n.holen});
    const r = await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, d);
    assert.equal(r.status, s);
    assert.equal(r.gepuffert, false);
    assert.equal(n.aufrufe.length, 1, String(s));
    assert.deepEqual(liste(sp), [], String(s));
  }
});

test('NACHSCHICKEN: der nächste Seitenaufruf stellt zu, gleiche Kennung, Beobachter erfährt es', async () => {
  const sp = speicher();
  const tot = netz(() => 'netz');
  const r = await P.zustellen({formular: 'webinar-nacht', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: tot.holen}).d);
  assert.equal(r.gepuffert, true);
  P._zuruecksetzen();
  const gemeldet = [];
  P.beobachten((id, e) => gemeldet.push([id, e.status]));
  const lebt = netz(() => ({status: 202, json: {ok: true}}));
  const spaeter = T0 + 2 * 3600 * 1000;
  const aus = await P.nachschicken({speicher: sp, holen: lebt.holen, endpunkt: ENDPUNKT, jetzt: () => spaeter});
  assert.deepEqual(aus, [{id: r.id, formular: 'webinar-nacht', status: 202, weg: 'direkt'}]);
  assert.equal(JSON.parse(lebt.aufrufe[0].opt.body).anmelde_id, r.id);
  assert.deepEqual(gemeldet, [[r.id, 202]]);
  assert.deepEqual(liste(sp), []);
});

test('NACHSCHICKEN: noch tot -> bleibt liegen, nichts verloren', async () => {
  const sp = speicher();
  const tot = netz(() => 'netz');
  await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: tot.holen}).d);
  const aus = await P.nachschicken({speicher: sp, holen: tot.holen, endpunkt: ENDPUNKT, jetzt: () => T0 + 60000});
  assert.equal(aus.length, 1);
  assert.equal(aus[0].status, 0);
  assert.equal(liste(sp).length, 1);
});

test('ABLAUF: nach 23 h weggeräumt und nicht mehr gesendet', async () => {
  const sp = speicher();
  await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: netz(() => 'netz').holen}).d);
  const n = netz(() => ({status: 202, json: {ok: true}}));
  const aus = await P.nachschicken({speicher: sp, holen: n.holen, endpunkt: ENDPUNKT, jetzt: () => T0 + 23 * 3600 * 1000 + 1});
  assert.deepEqual(aus, []);
  assert.equal(n.aufrufe.length, 0);
  assert.deepEqual(liste(sp), []);
});

test('T: frisches t bleibt, altes wird zur Absendezeit (nie älter als 23 h, nie zu jung)', () => {
  const frisch = P.eintragAnlegen({formular: '15', felder: FELDER, t: T0 - 10000, versatz: 0}, T0);
  assert.equal(P.tZumSenden(frisch, T0 + 3600 * 1000), T0 - 10000);
  const alt = P.eintragAnlegen({formular: '15', felder: FELDER, t: T0 - 22 * 3600 * 1000, versatz: 0}, T0);
  const spaeter = T0 + 2 * 3600 * 1000;
  assert.equal(P.tZumSenden(alt, spaeter), T0);
  assert.ok(spaeter - P.tZumSenden(alt, spaeter) < 24 * 3600 * 1000);
  assert.ok(spaeter - P.tZumSenden(alt, spaeter) >= 1500);
  // Uhrversatz: t und ab stehen in Serverzeit
  const v = P.eintragAnlegen({formular: '15', felder: FELDER, t: T0 + 30000 - 5000, versatz: 30000}, T0);
  assert.equal(v.ab, T0 + 30000);
  assert.equal(P.koerperDirekt(v, T0).t, String(T0 + 25000));
});

test('HONIGTOPF: genau ein Versuch, nie im Speicher', async () => {
  const sp = speicher();
  const n = netz(() => 'netz');
  const r = await P.zustellen({formular: '15', felder: {...FELDER, website: 'x'}, t: T0 - 5000}, deps({speicher: sp, holen: n.holen}).d);
  assert.equal(r.gepuffert, false);
  assert.equal(n.aufrufe.length, 1);
  assert.equal(JSON.parse(n.aufrufe[0].opt.body).website, 'x');
  assert.deepEqual(liste(sp), []);
});

test('SPEICHER KAPUTT: keine Zusage (gepuffert false), Versuche laufen trotzdem', async () => {
  for (const sp of [kaputterSpeicher(), null]) {
    P._zuruecksetzen();
    const n = netz(() => 'netz');
    const r = await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: n.holen}).d);
    assert.equal(r.gepuffert, false);
    assert.equal(r.status, 0);
    assert.equal(n.aufrufe.length, 6);
  }
});

test('POSITIVKONTROLLE: der alte Weg (ein fetch, kein Puffer) verliert dieselbe Anmeldung', async () => {
  // So sendete die Seite vor diesem Bau: ein Aufruf, bei Netzfehler Status 0 und nichts behalten.
  const sp = speicher();
  const n = netz(() => 'netz');
  let status = 0;
  try {
    const r = await n.holen(`${ENDPUNKT}/f/webinar-nacht`, {method: 'POST', body: JSON.stringify(FELDER)});
    status = r.status;
  } catch {
    status = 0;
  }
  assert.equal(status, 0);
  assert.deepEqual(liste(sp), [], 'alter Weg: nichts im Speicher, die Anmeldung ist weg');
  // derselbe Ausfall mit dem Puffer: sie liegt da
  const r = await P.zustellen({formular: 'webinar-nacht', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: n.holen}).d);
  assert.equal(liste(sp).length, 1);
  assert.equal(r.gepuffert, true);
});

test('EINZEILE JE ID: zweimal derselbe Eintrag bleibt einer, höchstens 20 liegen', () => {
  const sp = speicher();
  const e = P.eintragAnlegen({formular: '15', felder: FELDER, t: T0}, T0);
  assert.equal(P.puffern(e, {speicher: sp}), true);
  assert.equal(P.puffern(e, {speicher: sp}), true);
  assert.equal(liste(sp).length, 1);
  for (let i = 0; i < 25; i += 1) P.puffern(P.eintragAnlegen({formular: '15', felder: FELDER, t: T0}, T0), {speicher: sp});
  assert.equal(liste(sp).length, 20);
});

test('PUFFER_AN steht auf an (Rückweg ist ein Deploy mit false)', () => {
  assert.equal(P.PUFFER_AN, true);
  assert.deepEqual(P.RUNDEN_PAUSEN_MS, [0, 5000, 15000]);
});

test('TAKT: nach drei gescheiterten Runden kein sofortiger vierter Versuch, beim Seitenaufruf sofort', async () => {
  const sp = speicher();
  await P.zustellen({formular: '15', felder: FELDER, t: T0 - 5000}, deps({speicher: sp, holen: netz(() => 'netz').holen}).d);
  const n = netz(() => 'netz');
  const fenster = {addEventListener: () => {}, removeEventListener: () => {}};
  const vorher = globalThis.window;
  globalThis.window = fenster;
  try {
    P.starteNachschicken({speicher: sp, holen: n.holen, endpunkt: ENDPUNKT, jetzt: () => T0, sofort: false});
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(n.aufrufe.length, 0, 'sofort: false darf nicht gleich senden');
    P._zuruecksetzen();
    P.starteNachschicken({speicher: sp, holen: n.holen, endpunkt: ENDPUNKT, jetzt: () => T0});
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(n.aufrufe.length, 2, 'Seitenaufruf: ein Versuch über beide Wege');
  } finally {
    P._zuruecksetzen();
    globalThis.window = vorher;
  }
});
