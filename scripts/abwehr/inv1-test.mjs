/**
 * inv1-test.mjs — automatischer Beweis der Anti-Cloaking-Leitplanke (INV-1)
 * fuer die T2-Abwehr-Middleware.
 *
 * Kern-Beweis (Ticket T2): zwei simulierte Requests (Score 0 vs. Score 90)
 * auf einer 200-Route liefern byte-identischen Body (gleicher Content-Hash).
 * Dazu strukturelle Pruefungen: Aktions-Objekte tragen NIE ein body-Feld,
 * Challenge-/Block-Seiten sind fuer JEDEN Besucher identische Konstanten,
 * Kill-/Fehler-Pfade sind reine Passthroughs (never-break).
 *
 * Aufruf:  node scripts/abwehr/inv1-test.mjs   (plain node, kein Build noetig)
 */
import {createHash} from 'node:crypto';

import {mitAbwehr, _testReset} from '../../app/lib/abwehr/abwehr.js';
import {aktion, AKTION_FELDER} from '../../app/lib/abwehr/eskalation.js';

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

const BODY = '<html><body>KONSTANTER SHOP-CONTENT 4711</body></html>';
const next = async () =>
  new Response(BODY, {status: 200, headers: {'Content-Type': 'text/html'}});

const hash = async (response) =>
  createHash('sha256')
    .update(Buffer.from(await response.arrayBuffer()))
    .digest('hex');

const req = (pfad = '/products/qione', headers = {}) =>
  new Request(`https://qiblanco.com${pfad}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 Firefox/127.0',
      'Accept': 'text/html',
      'Accept-Language': 'de-DE',
      'oxygen-buyer-ip': '203.0.113.7',
      ...headers,
    },
  });

// Signal-Saetze (objektiv, INV-2-konform), die die Ziel-Scores erzeugen:
const SIGNALE_0 = {};
const SIGNALE_45 = {rate_over_pct: 100, header_anomaly: true}; // 35+15=50 -> S1
const SIGNALE_90 = {
  rate_over_pct: 200,
  header_anomaly: true,
  waf_severity: 3,
  missing_behavior_token: true,
}; // 35+15+30+10=90 -> S3

// LANE-LAGE (seit der Erlaub-Lane, kundenpfad.js): der Score allein bestimmt
// die Stufe nicht mehr — er wird VOR der Eskalation lane-gedeckelt. Ein
// Besucher, ueber den nichts Belastendes bekannt ist, kommt hoechstens auf S2;
// ein Besucher mit Kunden-Muster hoechstens auf S1. Tests, die eine BESTIMMTE
// Stufe erzwingen wollen, muessen die Lane-Lage deshalb explizit benennen —
// sie zu umgehen waere genau die Test-Umgebung, in der die Lane nie laeuft.
const LANE_BULK = {evasion: true}; // positive Bulk-Evidenz => kein Deckel

// ---- 1) Struktur: Aktions-Objekt kann baulich keinen Content tragen --------
{
  let sauber = true;
  for (let s = 0; s <= 100; s++) {
    const a = aktion(s, '/products/x');
    const felder = Object.keys(a);
    if (
      'body' in a ||
      felder.length !== AKTION_FELDER.size ||
      !felder.every((f) => AKTION_FELDER.has(f))
    ) {
      sauber = false;
    }
  }
  ok(sauber, 'Struktur: aktion(0..100) traegt nie ein body-Feld (INV-1)');
}

// ---- 2) SHADOW (Default): Score 0 vs. 90 -> identischer 200-Body -----------
{
  _testReset();
  const env = {}; // SM_MODE fehlt = shadow-Default
  const r0 = await mitAbwehr(req(), env, undefined, next, SIGNALE_0);
  _testReset();
  const r90 = await mitAbwehr(req(), env, undefined, next, SIGNALE_90);
  ok(
    r0.status === 200 && r90.status === 200,
    'Shadow: beide Requests bekommen 200 (keine Wirkung ohne on-Flip, INV-5)',
  );
  ok(
    (await hash(r0)) === (await hash(r90)),
    'INV-1 KERN (shadow): Score 0 vs. 90 -> gleicher Content-Hash',
  );
}

// ---- 3) ON: jede 200-Antwort bleibt byte-identisch (S0 vs. S1) -------------
{
  _testReset();
  const env = {SM_MODE: 'on'};
  const r0 = await mitAbwehr(req(), env, undefined, next, SIGNALE_0);
  _testReset();
  const r45 = await mitAbwehr(req(), env, undefined, next, SIGNALE_45);
  ok(
    r0.status === 200 && r45.status === 200,
    'On/S1: Soft-Drossel bleibt Statuscode 200',
  );
  ok(
    (await hash(r0)) === (await hash(r45)),
    'INV-1 KERN (on): 200-Body bei S0 und S1 byte-identisch (nur Header/Tarpit)',
  );
  ok(
    r45.headers.get('Retry-After') === '5' && !r0.headers.get('Retry-After'),
    'On/S1: Retry-After-Header nur auf der eskalierten Antwort',
  );
}

// ---- 4) ON: S3 aendert NUR den Statuscode/Transport -------------------------
{
  _testReset();
  const env = {SM_MODE: 'on'};
  const r90 = await mitAbwehr(req(), env, undefined, next, SIGNALE_90, LANE_BULK);
  ok(
    r90.status === 503 && r90.headers.get('Retry-After') === '900',
    'On/S3: uniformer befristeter 503-Temp-Block (Statuscode-Eskalation erlaubt)',
  );
}

// ---- 5) Never-block-Checkout: S3 wird auf Challenge gekappt ----------------
{
  _testReset();
  const env = {SM_MODE: 'on'};
  const rCart = await mitAbwehr(req('/cart'), env, undefined, next, SIGNALE_90, LANE_BULK);
  ok(
    rCart.status === 429,
    'On/Checkout: S3 auf /cart wird zur Challenge gekappt (never-block-Checkout)',
  );
}

// ---- 6) Challenge-Seite ist fuer JEDEN Besucher identisch ------------------
{
  _testReset();
  const env = {SM_MODE: 'on'};
  const SIGNALE_65 = {rate_over_pct: 100, header_anomaly: true, missing_behavior_token: true};
  const a = await mitAbwehr(
    req('/products/a', {'User-Agent': 'BesucherA/1.0'}),
    env,
    undefined,
    next,
    SIGNALE_65,
    LANE_BULK,
  );
  _testReset();
  const b = await mitAbwehr(
    req('/products/b', {'User-Agent': 'BesucherB/2.0', 'oxygen-buyer-ip': '198.51.100.9'}),
    env,
    undefined,
    next,
    SIGNALE_65,
    LANE_BULK,
  );
  ok(
    a.status === 429 && b.status === 429 && (await hash(a)) === (await hash(b)),
    'On/S2: Challenge-Seite byte-identisch fuer verschiedene Besucher (uniform)',
  );
}

// ---- 7) Kill-Switch + never-break -------------------------------------------
{
  _testReset();
  const off = await mitAbwehr(req(), {SM_MODE: 'off'}, undefined, next, SIGNALE_90);
  ok(
    off.status === 200 && (await hash(off)) === (await hash(await next())),
    'Kill: SM_MODE=off => purer Passthrough trotz Score 90',
  );

  _testReset();
  // Identitaets-Feld in den Signalen: scoring wirft (INV-2) -> die Middleware
  // faengt das und faellt auf den normalen Handler zurueck (never-break).
  const kaputt = await mitAbwehr(
    req(),
    {SM_MODE: 'on'},
    undefined,
    next,
    {ip: '203.0.113.7', rolle: 'pruefer'},
  );
  ok(
    kaputt.status === 200 && (await hash(kaputt)) === (await hash(await next())),
    'Never-break: interner Abwehr-Fehler => normaler 200-Passthrough',
  );
}

console.log(`INV-1-TEST: ${pass} PASS / ${fail} FAIL`);
console.log(fail === 0 ? 'INV-1 GRUEN' : 'INV-1 ROT');
process.exit(fail === 0 ? 0 : 1);
