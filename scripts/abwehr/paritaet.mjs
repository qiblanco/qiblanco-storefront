/**
 * paritaet.mjs — Paritaets-Test der T2-JS-Portierung gegen die Python-SSoT
 * (shared-state/sicherheitsmeister/src, T1-Kern).
 *
 * Dieselben Vektoren laufen durch beide Implementierungen; jede Abweichung
 * (Score, Stufe, Aktions-Objekt, Signal-Extraktion, WAF-Regelwerk-Version)
 * ist ein FAIL. Exit 0 = Paritaet bewiesen, exit 1 = Drift, exit 2 = Python-
 * Seite nicht verfuegbar (SKIP — gilt NICHT als gruen).
 *
 * Aufruf:  node scripts/abwehr/paritaet.mjs   (auf dem Qi-Blanco-Server)
 */
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

import {score} from '../../app/lib/abwehr/scoring.js';
import {
  aktion,
  anwenden,
  stufeMitHysterese,
} from '../../app/lib/abwehr/eskalation.js';
import {
  headerSignale,
  pfadSignale,
  WAF_RULES_VERSION,
} from '../../app/lib/abwehr/signals.js';

// ---- Vektoren (deterministisch; Zahlen so gewaehlt, dass JSON sie fuer
// ---- Python und JS identisch typisiert — keine 2.0-Ambiguitaeten) ---------

const SCORING = [];
// Voll-Grid ueber alle 6 objektiven Signale (inkl. Banker's-Rounding-Kanten
// wie rate=30 => 10.5 => 10, NICHT 11).
for (const rate of [0, 15, 30, 50, 77, 100, 130, 200]) {
  for (const header of [false, true]) {
    for (const asn of ['unknown', 'datacenter', 'residential', 'mobile', 'business']) {
      for (const token of [false, true]) {
        for (const waf of [0, 1, 2, 3]) {
          for (const ratio of [0, 0.1, 0.3, 0.5, 0.917, 1]) {
            SCORING.push({
              rate_over_pct: rate,
              header_anomaly: header,
              asn_type: asn,
              missing_behavior_token: token,
              waf_severity: waf,
              vollkatalog_ratio: ratio,
            });
          }
        }
      }
    }
  }
}
// Partielle Signale (fehlende Felder = neutral) + leeres Objekt.
SCORING.push({}, {rate_over_pct: 42}, {header_anomaly: true}, {waf_severity: 3});
// INV-2-Fehlerfaelle: Identitaets-/Unbekannt-Felder + Definitionsbereich —
// BEIDE Seiten muessen werfen.
SCORING.push(
  {ip: '203.0.113.7'},
  {name: 'mustermann'},
  {kanzlei: 'x'},
  {rolle: 'pruefer'},
  {user_agent: 'x'},
  {asn_nummer: 15169},
  {herkunft: 'de'},
  {rate_over_pct: -1},
  {rate_over_pct: true},
  {header_anomaly: 'ja'},
  {asn_type: 'AS15169'},
  {asn_type: 'anwalt'},
  {missing_behavior_token: 1},
  {waf_severity: 4},
  {waf_severity: -1},
  {vollkatalog_ratio: 1.5},
  {vollkatalog_ratio: -0.1},
);

const ESKALATION = [];
for (let s = 0; s <= 100; s++) {
  ESKALATION.push({score: s});
}
for (const pfad of ['/checkout', '/cart/add', '/warenkorb', '/kasse', '/pay', '/payments/x', '/products/qione', '/CHECKOUT']) {
  for (const s of [0, 45, 65, 85, 100]) {
    ESKALATION.push({score: s, pfad});
  }
}
for (const verlauf of [[85], [85, 85], [85, 85, 85], [10, 85, 85], [85, 85, 10], [10, 10, 85], [45, 65, 85], [65, 65, 65], [100, 0, 100], [40, 59, 60]]) {
  ESKALATION.push({score: 0, pfad: '/products/x', verlauf});
  ESKALATION.push({score: 0, pfad: '/checkout', verlauf});
}
ESKALATION.push({score: -5}, {score: 101}, {score: 3.5});

const HYSTERESE = [
  [],
  [80],
  [80, 80],
  [80, 80, 80],
  [0, 80, 80],
  [80, 80, 0],
  [39, 40, 41],
  [100, 100, 100, 0],
  [0, 0, 0, 90, 90, 90],
];

const ANWENDEN = [];
for (const s of [0, 45, 65, 90]) {
  for (const mode of ['shadow', 'on', 'off', '']) {
    ANWENDEN.push({score: s, mode});
  }
}

const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const HEADER = [
  // vollstaendiger Browser: keine Anomalie
  {'User-Agent': CHROME_UA, 'Accept': 'text/html', 'Accept-Language': 'de-DE', 'sec-ch-ua': '"Chromium";v="126"'},
  // Chrome-UA OHNE Client-Hints: Mismatch
  {'User-Agent': CHROME_UA, 'Accept': 'text/html', 'Accept-Language': 'de-DE'},
  // Scraper-Libs
  {'User-Agent': 'python-requests/2.32.0'},
  {'User-Agent': 'curl/8.5.0', 'Accept': '*/*'},
  {'User-Agent': 'Scrapy/2.11 (+https://scrapy.org)', 'Accept': 'text/html'},
  {'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)', 'Accept': 'text/html'},
  {'User-Agent': 'axios/1.7.2', 'Accept': 'application/json', 'Accept-Language': 'en'},
  {'User-Agent': 'Mozilla/5.0 HeadlessChrome/126.0.0.0', 'Accept': 'text/html', 'Accept-Language': 'de'},
  // leer / kaputt
  {},
  {'Accept': 'text/html'},
  {'User-Agent': '', 'Accept': ''},
  // Firefox ohne sec-ch-ua ist KEIN Mismatch (sendet keine Client-Hints)
  {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0', 'Accept': 'text/html', 'Accept-Language': 'de'},
  // Gross-/Kleinschreibung der Headernamen
  {'USER-AGENT': CHROME_UA, 'ACCEPT': 'text/html', 'ACCEPT-LANGUAGE': 'de', 'SEC-CH-UA': '"Chromium"'},
];

const PFAD = [
  {pfad: '/products/qione-2-pro'},
  {pfad: '/pages/zell-schutz'},
  {pfad: '/wp-admin/setup.php'},
  {pfad: '/wp-login.php'},
  {pfad: '/.env'},
  {pfad: '/config/.env.backup'},
  {pfad: '/.git/config'},
  {pfad: '/foo/.git/'},
  {pfad: '/index.php'},
  {pfad: '/test.aspx'},
  {pfad: '/../../etc/passwd'},
  {pfad: '/a/%2e%2e%2fetc'},
  {pfad: '/api/graphql'},
  {pfad: '/products/x', query: "id=1 UNION SELECT * FROM users"},
  {pfad: '/products/x', query: "q=1 or 1 = 1"},
  {pfad: '/search', query: 'q=<script>alert(1)</script>'},
  {pfad: '/search', query: 'q=javascript:void(0)'},
  {pfad: '/search', query: 'img=x onerror = alert(1)'},
  {pfad: '/search', query: 'q=' + 'a'.repeat(2100)},
  {pfad: '/search', query: 'q=' + 'a'.repeat(2040)},
  {pfad: '', query: ''},
  {pfad: '/.git/config', query: 'x=UNION SELECT 1'},
];

// ---- JS-Seite rechnen -------------------------------------------------------

const safe = (fn) => {
  try {
    return fn();
  } catch {
    return {wirft: true};
  }
};

const jsErgebnis = {
  scoring: SCORING.map((v) => safe(() => ({score: score(v)}))),
  eskalation: ESKALATION.map((v) =>
    safe(() => ({aktion: aktion(v.score, v.pfad ?? '', v.verlauf ?? null)})),
  ),
  hysterese: HYSTERESE.map((v) => safe(() => ({stufe: stufeMitHysterese(v)}))),
  anwenden: ANWENDEN.map((v) =>
    safe(() => ({wirkung: anwenden(aktion(v.score), v.mode)})),
  ),
  header: HEADER.map((v) => safe(() => headerSignale(v))),
  pfad: PFAD.map((v) => safe(() => pfadSignale(v.pfad ?? '', v.query ?? ''))),
  waf_version: WAF_RULES_VERSION,
};

// ---- Python-Seite rechnen ---------------------------------------------------

const runner = fileURLToPath(new URL('./paritaet_runner.py', import.meta.url));
const vektoren = {
  scoring: SCORING,
  eskalation: ESKALATION,
  hysterese: HYSTERESE,
  anwenden: ANWENDEN,
  header: HEADER,
  pfad: PFAD,
};
const py = spawnSync('python3', [runner], {
  input: JSON.stringify(vektoren),
  encoding: 'utf-8',
  maxBuffer: 64 * 1024 * 1024,
});
if (py.error || py.status !== 0) {
  console.error('SKIP: Python-SSoT nicht verfuegbar — Paritaet NICHT bewiesen.');
  console.error(py.error ? String(py.error) : py.stderr);
  process.exit(2);
}
const pyErgebnis = JSON.parse(py.stdout);

// ---- Vergleich (kanonisch: sortierte Schluessel) ----------------------------

function kanonisch(x) {
  if (Array.isArray(x)) return x.map(kanonisch);
  if (x && typeof x === 'object') {
    return Object.fromEntries(
      Object.keys(x)
        .sort()
        .map((k) => [k, kanonisch(x[k])]),
    );
  }
  return x;
}
const gleich = (a, b) =>
  JSON.stringify(kanonisch(a)) === JSON.stringify(kanonisch(b));

let pass = 0;
let fail = 0;
for (const kategorie of Object.keys(vektoren)) {
  const js = jsErgebnis[kategorie];
  const pyk = pyErgebnis[kategorie];
  for (let i = 0; i < js.length; i++) {
    if (gleich(js[i], pyk[i])) {
      pass++;
    } else {
      fail++;
      console.error(
        `FAIL ${kategorie}[${i}] vektor=${JSON.stringify(vektoren[kategorie][i]).slice(0, 200)}\n  js=${JSON.stringify(js[i])}\n  py=${JSON.stringify(pyk[i])}`,
      );
    }
  }
}
if (jsErgebnis.waf_version === pyErgebnis.waf_version) {
  pass++;
  console.log(`WAF-Regelwerk-Version synchron: v${jsErgebnis.waf_version}`);
} else {
  fail++;
  console.error(
    `FAIL waf_version: js=v${jsErgebnis.waf_version} py=v${pyErgebnis.waf_version} — JS-Spiegel veraltet!`,
  );
}

console.log(
  `PARITAET JS<->PYTHON: ${pass} PASS / ${fail} FAIL (Vektoren: scoring=${SCORING.length}, eskalation=${ESKALATION.length}, hysterese=${HYSTERESE.length}, anwenden=${ANWENDEN.length}, header=${HEADER.length}, pfad=${PFAD.length})`,
);
console.log(fail === 0 ? 'PARITAET GRUEN' : 'PARITAET ROT');
process.exit(fail === 0 ? 0 : 1);
