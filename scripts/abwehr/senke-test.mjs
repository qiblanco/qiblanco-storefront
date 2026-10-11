/**
 * senke-test.mjs — Beweis, dass der Rückfluss an den Server (abwehr.js senke)
 * den Shop nie berührt (rz-0037 s02).
 *
 * Geprüft wird über den echten Einbau-Punkt mitAbwehr():
 *  - S0 ohne Lane-Dämpfung sendet nichts, S1 sendet genau einen Abruf über
 *    ctx.waitUntil, mit genau dem Inhalt, der auch ins Log geht;
 *  - der Körper trägt nur die Whitelist-Felder, keine IP und keinen User-Agent;
 *  - ein hängender, werfender oder abgelehnter fetch ändert die Antwort nicht
 *    (Body-Hash identisch, INV-1) und blockiert sie nicht;
 *  - SM_SENKE=off (auch 'aus', '0', ' off '), SM_MODE=off und ein fehlendes
 *    ctx senden nichts; SM_SENKE_PRO_MIN=0 sendet nichts;
 *  - der Deckel SM_SENKE_PRO_MIN greift je Minute (feste Uhr, kein
 *    Minutenwechsel mitten im Test);
 *  - der Abruf startet erst, NACHDEM next() die Antwort geliefert hat;
 *  - NETZ (2026-10-11): der Senke-Körper trägt das gekürzte Präfix (`netz`,
 *    /24 bzw. /48), das Log nie; SM_SENKE_NETZ=off lässt es weg;
 *  - STICHPROBE: S0 wird genau dann gesendet, wenn der Schlüssel mit '0'
 *    beginnt, und nur einmal je Schlüssel (`stichprobe: 16`);
 *    SM_STICHPROBE=off schaltet das ab.
 *
 * SENKE_KORPUS=<datei> schreibt die gesendeten Körper als JSONL — die Naht-Probe
 * sicherheitsmeister/proben/naht_storefront_senke.py prüft sie gegen die
 * Feld-Whitelist des Servers (storefront_spool.pruefe_eintrag).
 *
 * Aufruf:  node scripts/abwehr/senke-test.mjs   (plain node, kein Netz: fetch ist ersetzt)
 */
import {createHash} from 'node:crypto';
import {appendFileSync} from 'node:fs';

import {
  mitAbwehr,
  senke,
  eintragAusVerdikt,
  _testReset,
} from '../../app/lib/abwehr/abwehr.js';

let pass = 0;
let fail = 0;
const ok = (bedingung, name) => {
  if (bedingung) {
    pass++;
    console.log(`PASS ${name}`);
  } else {
    fail++;
    console.error(`FAIL ${name}`);
  }
};

// Feld-Whitelist des Servers (sicherheitsmeister/src/storefront_spool.py TOP_FELDER).
// Als Objekt-Schlüssel in Anführungszeichen geführt (Datenvertrag, kein Bezeichner).
const TOP_FELDER = new Set(
  Object.keys({
    "sm_abwehr": 1, "modus": 1, "stufe": 1, "score": 1, "score_roh": 1, "lane": 1,
    "lane_aktiv": 1, "lane_fehler": 1, "gruende": 1, "signale": 1, "schluessel": 1,
    "pfad": 1, "challenge_bestanden": 1, "aktion_typ": 1, "netz": 1, "stichprobe": 1,
  }),
);
const IP = '203.0.113.7';
const UA = 'Mozilla/5.0 SenkeTestBrowser/1.0';

const BODY = '<html><body>KONSTANTER SHOP-CONTENT 4711</body></html>';
const next = async () =>
  new Response(BODY, {status: 200, headers: {'Content-Type': 'text/html'}});
const hash = async (r) =>
  createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex');

const req = (pfad = '/products/qione', headers = {}) =>
  new Request(`https://qiblanco.com${pfad}`, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html',
      'Accept-Language': 'de-DE',
      'oxygen-buyer-ip': IP,
      ...headers,
    },
  });

const SIGNALE_0 = {};
const SIGNALE_45 = {header_anomaly: true, waf_severity: 3}; // 15+30 = 45 -> S1

// ---- Attrappen: fetch, ctx, console.log ------------------------------------
let abrufe = [];
let fetchArt = 'ok'; // ok | blockiert | wirft | lehnt_ab
const echtesFetch = globalThis.fetch;
globalThis.fetch = (url, init) => {
  abrufe.push({url: String(url), init});
  if (process.env.SENKE_KORPUS && init?.body) {
    appendFileSync(process.env.SENKE_KORPUS, init.body + '\n');
  }
  if (fetchArt === 'wirft') throw new Error('fetch kaputt');
  if (fetchArt === 'lehnt_ab') return Promise.reject(new Error('Netz weg'));
  if (fetchArt === 'blockiert') return new Promise(() => {});
  return Promise.resolve(new Response(null, {status: 204}));
};
const ctx = () => {
  const c = {versprechen: [], waitUntil: (p) => c.versprechen.push(p)};
  return c;
};
let logs = [];
const echtesLog = console.log;
const logMitschnitt = (...a) => {
  const t = a.join(' ');
  if (t.startsWith('{"sm_abwehr"')) logs.push(t);
  else echtesLog(...a);
};
const frisch = () => {
  _testReset();
  abrufe = [];
  logs = [];
  fetchArt = 'ok';
};
const mitFrist = (p, ms) =>
  Promise.race([p, new Promise((r) => setTimeout(() => r('FRIST'), ms))]);

console.log = logMitschnitt;
try {
  // S1: S0 ohne Dämpfung -> nichts
  frisch();
  {
    const c = ctx();
    // Ohne Stichprobe: sonst sendet ein Schlüssel mit '0' (1/16) zu Recht.
    await mitAbwehr(req(), {SM_STICHPROBE: 'off'}, c, next, SIGNALE_0);
    ok(abrufe.length === 0 && c.versprechen.length === 0, 'S1 s0-sendet-nichts');
  }

  // S2: S1 -> genau ein Abruf, über waitUntil, Default-URL, POST
  frisch();
  const c2 = ctx();
  const r2 = await mitAbwehr(req('/x.env'), {}, c2, next, SIGNALE_45);
  ok(abrufe.length === 1, 'S2 s1-genau-ein-abruf');
  ok(c2.versprechen.length === 1, 'S2 via-waitUntil');
  ok(abrufe[0]?.url === 'https://qpx.65-108-150-121.sslip.io/sm', 'S2 default-url');
  ok(abrufe[0]?.init?.method === 'POST', 'S2 post');
  const inhalt = JSON.parse(abrufe[0]?.init?.body || '{}');
  ok(
    Object.keys(inhalt).every((k) => TOP_FELDER.has(k)) && inhalt.sm_abwehr === 1,
    'S2 nur-whitelist-felder',
  );
  const roh = abrufe[0]?.init?.body || '';
  ok(!roh.includes(IP) && !roh.includes('SenkeTestBrowser'), 'S2 keine-ip-kein-ua');
  ok(/^[0-9a-f]{16}$/.test(inhalt.schluessel || ''), 'S2 schluessel-hash');
  ok(inhalt.pfad === '/x.env' && inhalt.stufe === 'S1', 'S2 pfad-und-stufe');
  {
    // Senke = Log + genau das Feld `netz`; das Log trägt kein Präfix.
    const ohneNetz = {...inhalt};
    delete ohneNetz.netz;
    ok(
      logs.length === 1 && JSON.stringify(JSON.parse(logs[0])) === JSON.stringify(ohneNetz),
      'S2 log-und-senke-identisch-bis-auf-netz',
    );
    ok(inhalt.netz === '203.0.113.0/24', `N1 netz-im-senke-gesendet (${inhalt.netz})`);
    ok(logs.length === 1 && !logs[0].includes('203.0.113') && !('netz' in JSON.parse(logs[0])),
      'N2 log-ohne-netz');
  }
  ok((await hash(r2)) === createHash('sha256').update(BODY).digest('hex'), 'S2 body-unveraendert');
  await Promise.all(c2.versprechen);

  // S3: hängender fetch blockiert die Antwort nicht
  frisch();
  fetchArt = 'blockiert';
  {
    const c = ctx();
    const r = await mitFrist(mitAbwehr(req('/a.env'), {}, c, next, SIGNALE_45), 1000);
    ok(r !== 'FRIST' && r.status === 200, 'S3 blockierter-fetch-ohne-wartezeit');
  }

  // S4: werfender fetch -> Antwort identisch, kein Wurf
  frisch();
  fetchArt = 'wirft';
  {
    const c = ctx();
    let geworfen = false;
    let r;
    try {
      r = await mitAbwehr(req('/b.env'), {}, c, next, SIGNALE_45);
    } catch {
      geworfen = true;
    }
    ok(!geworfen && r.status === 200, 'S4 werfender-fetch-never-break');
    ok(r && (await hash(r)) === createHash('sha256').update(BODY).digest('hex'), 'S4 body-identisch');
    const erg = await mitFrist(Promise.allSettled(c.versprechen), 500);
    ok(erg !== 'FRIST' && erg.every((e) => e.status === 'fulfilled'), 'S4 waitUntil-versprechen-erfuellt');
  }

  // S5: abgelehnter fetch -> waitUntil-Versprechen erfüllt (keine unbehandelte Ablehnung)
  frisch();
  fetchArt = 'lehnt_ab';
  {
    const c = ctx();
    await mitAbwehr(req('/c.env'), {}, c, next, SIGNALE_45);
    const erg = await mitFrist(Promise.allSettled(c.versprechen), 500);
    ok(
      c.versprechen.length === 1 && erg !== 'FRIST' && erg[0].status === 'fulfilled',
      'S5 ablehnung-geschluckt',
    );
  }

  // S6: SM_SENKE=off -> kein Abruf, Log bleibt
  frisch();
  {
    const c = ctx();
    await mitAbwehr(req('/d.env'), {SM_SENKE: 'off'}, c, next, SIGNALE_45);
    ok(abrufe.length === 0 && logs.length === 1, 'S6 senke-off-nur-log');
  }

  // S7: kein ctx -> kein Abruf
  frisch();
  await mitAbwehr(req('/e.env'), {}, undefined, next, SIGNALE_45);
  ok(abrufe.length === 0, 'S7 ohne-ctx-kein-abruf');

  // S8: SM_MODE=off -> Kill-Pfad, kein Abruf
  frisch();
  await mitAbwehr(req('/f.env'), {SM_MODE: 'off'}, ctx(), next, SIGNALE_45);
  ok(abrufe.length === 0 && logs.length === 0, 'S8 mode-off-nichts');

  // S9: Deckel je Minute — feste Uhr: ein Minutenwechsel mitten in der
  // Schleife setzte sonst den Zähler zurück (Review K3-P2: Wackel-Arm).
  frisch();
  {
    const env = {SM_SENKE_PRO_MIN: '5'};
    const c = ctx();
    const e = eintragAusVerdikt({
      // in sich stimmig wie ein echtes Verdikt (15+30 = 45 -> S1): die Naht-Probe
      // prüft jeden gesendeten Körper gegen die Plausibilität des Servers.
      stufe: 'S1', modus: 'shadow', score: 45, score_roh: 45, aktion: {typ: 'none'},
      lane: null, lane_aktiv: false, lane_fehler: null, "gruende": [],
      signale: {header_anomaly: true, waf_severity: 3},
      schluessel: '0123456789abcdef', pfad: '/h', challengeBestanden: false,
    });
    const t0 = 1_800_000_000_000; // Minutenanfang
    for (let i = 0; i < 20; i++) senke(e, env, c, t0 + i);
    ok(abrufe.length === 5, `S9 deckel-5-je-minute (ist ${abrufe.length})`);
    const vorher = abrufe.length;
    senke(e, env, c, t0 + 120_000); // nächste Minute
    ok(abrufe.length === vorher + 1, 'S9 deckel-folgeminute-frei');
    // Deckel 0 = nichts senden (vorher fiel 0 still auf den Default 30)
    frisch();
    for (let i = 0; i < 3; i++) senke(e, {SM_SENKE_PRO_MIN: '0'}, c, t0 + i);
    ok(abrufe.length === 0, `S9 deckel-0-sendet-nichts (ist ${abrufe.length})`);
  }

  // S12: Kill-Varianten — jede Schreibweise von "aus" schaltet ab
  for (const wert of ['aus', '0', ' off ', 'OFF', 'false', 'nein']) {
    frisch();
    await mitAbwehr(req('/k.env'), {SM_SENKE: wert}, ctx(), next, SIGNALE_45);
    ok(abrufe.length === 0 && logs.length === 1, `S12 senke-${JSON.stringify(wert)}-aus`);
  }
  frisch();
  await mitAbwehr(req('/k.env'), {SM_SENKE: 'on'}, ctx(), next, SIGNALE_45);
  ok(abrufe.length === 1, 'S12 senke-on-sendet');

  // S13: Reihenfolge — next() liefert, DANN startet der Abruf
  frisch();
  {
    const folge = [];
    const echt = globalThis.fetch;
    globalThis.fetch = (url, init) => {
      folge.push('fetch');
      return echt(url, init);
    };
    const nextMitSpur = async () => {
      folge.push('next-start');
      await new Promise((r) => setTimeout(r, 5));
      folge.push('next-fertig');
      return next();
    };
    try {
      await mitAbwehr(req('/l.env'), {}, ctx(), nextMitSpur, SIGNALE_45);
    } finally {
      globalThis.fetch = echt;
    }
    ok(
      JSON.stringify(folge) === JSON.stringify(['next-start', 'next-fertig', 'fetch']),
      `S13 abruf-nach-next (${folge.join('>')})`,
    );
  }

  // N3: SM_SENKE_NETZ=off -> kein Präfix im Körper, Abruf trotzdem
  frisch();
  await mitAbwehr(req('/n.env'), {SM_SENKE_NETZ: 'off'}, ctx(), next, SIGNALE_45);
  ok(abrufe.length === 1 && !('netz' in JSON.parse(abrufe[0]?.init?.body || '{}')),
    'N3 netz-off-ohne-praefix');

  // N4: IPv6 -> /48
  frisch();
  await mitAbwehr(req('/n6.env', {'oxygen-buyer-ip': '2001:db8:1:2::77'}), {}, ctx(), next, SIGNALE_45);
  ok(JSON.parse(abrufe[0]?.init?.body || '{}').netz === '2001:db8:1::/48', 'N4 v6-48');
  ok(!(abrufe[0]?.init?.body || '').includes('2::77'), 'N4 v6-ohne-hostteil');

  // N5/N6: Stichprobe — S0 geht genau dann raus, wenn der Schlüssel mit '0'
  // beginnt, und nur beim ersten Mal. Ein Salz für den ganzen Lauf.
  frisch();
  {
    const ips = Array.from({length: 254}, (_, i) => `198.51.100.${i + 1}`);
    for (const ip of ips) {
      await mitAbwehr(req('/', {'oxygen-buyer-ip': ip}), {}, ctx(), next, SIGNALE_0);
    }
    const gesendet = abrufe.map((a) => JSON.parse(a.init.body));
    ok(gesendet.length > 0, `N5 stichprobe-sendet (${gesendet.length} von 254)`);
    ok(
      gesendet.every((k) => k.stichprobe === 16 && k.schluessel.startsWith('0') && k.stufe === 'S0'),
      'N5 nur-raum-0-mit-stichprobe-16',
    );
    ok(new Set(gesendet.map((k) => k.schluessel)).size === gesendet.length, 'N5 je-schluessel-einmal');
    const n = abrufe.length;
    for (const ip of ips) {
      await mitAbwehr(req('/', {'oxygen-buyer-ip': ip}), {}, ctx(), next, SIGNALE_0);
    }
    ok(abrufe.length === n, 'N6 zweite-anfrage-nicht-erneut');
    // Ein Schlüssel ausserhalb des Raums auf S1 trägt kein stichprobe-Feld.
    frisch();
    await mitAbwehr(req('/s.env'), {SM_STICHPROBE: 'off'}, ctx(), next, SIGNALE_45);
    ok(!('stichprobe' in JSON.parse(abrufe[0]?.init?.body || '{}')), 'N6 off-ohne-feld');
  }

  // N7: SM_STICHPROBE=off -> kein S0 wird gesendet
  frisch();
  for (let i = 1; i <= 254; i++) {
    await mitAbwehr(req('/', {'oxygen-buyer-ip': `192.0.2.${i}`}), {SM_STICHPROBE: 'off'},
      ctx(), next, SIGNALE_0);
  }
  ok(abrufe.length === 0, `N7 stichprobe-off (${abrufe.length})`);

  // S10: URL-Override
  frisch();
  await mitAbwehr(req('/i.env'), {SM_SENKE_URL: 'https://beispiel.invalid/sm'}, ctx(), next, SIGNALE_45);
  ok(abrufe[0]?.url === 'https://beispiel.invalid/sm', 'S10 url-override');

  // S11: senke() mit null-Eintrag oder kaputtem env wirft nie
  frisch();
  let wurf = false;
  try {
    senke(null, {}, ctx());
    const e = eintragAusVerdikt({
      stufe: 'S1', modus: 'shadow', score: 45, score_roh: 45, aktion: {typ: 'retry_after_hint'},
      lane: null, lane_aktiv: true, lane_fehler: null, "gruende": ['waf-dotenv'],
      signale: {header_anomaly: true, waf_severity: 3}, schluessel: 'fedcba9876543210', pfad: '/j',
      challengeBestanden: false,
    });
    senke(e, null, {waitUntil: () => { throw new Error('x'); }});
  } catch {
    wurf = true;
  }
  ok(!wurf, 'S11 senke-wirft-nie');
} finally {
  console.log = echtesLog;
  globalThis.fetch = echtesFetch;
}

console.log(`SENKE-TEST: ${pass} PASS / ${fail} FAIL`);
console.log(fail === 0 ? 'SENKE GRUEN' : 'SENKE ROT');
process.exit(fail === 0 ? 0 : 1);
