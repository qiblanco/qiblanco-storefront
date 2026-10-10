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
import {
  bewerte as laneBewerte,
  deckelScore,
  entscheide,
} from '../../app/lib/abwehr/kundenpfad.js';
import {ausVerlauf} from '../../app/lib/abwehr/kundenpfad_signale.js';

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

// ---- Erlaub-Lane (kundenpfad.js / kundenpfad_signale.js) ------------------
// ACHTUNG bei neuen Vektoren: ein Integral-Float im INT-Slot (z. B.
// `anfragen: 12.0`) ist ueber JSON nicht uebertragbar — Python bekaeme dort
// einen float und wuerde werfen, JS sieht 12 und wirft nicht. Solche Faelle
// gehoeren in scripts/abwehr/lane-test.mjs (JS-seitig), nicht hierher.
const LANE_ENTSCHEIDE = [
  {}, // Leer-Signale: alles auf Default => unbestimmt
  // --- Kunden-Muster (alle vier Achsen erfuellt) ---------------------------
  {anfragen: 3, distinkte_pfade: 3, katalog_ratio: 0.05, intent_ratio: 1, sweep_marker: false, tage_aktiv: 1},
  {anfragen: 12, distinkte_pfade: 8, katalog_ratio: 0.25, intent_ratio: 0.6, tage_aktiv: 1},
  // Genau NEBEN jeder Kunden-Schwelle (die Kanten, an denen ein Port driftet)
  {anfragen: 13, distinkte_pfade: 8, katalog_ratio: 0.25, intent_ratio: 0.6},
  {anfragen: 12, distinkte_pfade: 9, katalog_ratio: 0.25, intent_ratio: 0.6},
  {anfragen: 12, distinkte_pfade: 8, katalog_ratio: 0.26, intent_ratio: 0.6},
  {anfragen: 12, distinkte_pfade: 8, katalog_ratio: 0.25, intent_ratio: 0.59},
  {anfragen: 12, distinkte_pfade: 8, katalog_ratio: 0.25, intent_ratio: 0.6, sweep_marker: true},
  // --- die .2f-Gleichstaende j/8: hier weicht toFixed von Python ab --------
  {anfragen: 4, distinkte_pfade: 4, katalog_ratio: 0.125, intent_ratio: 0.875},
  {anfragen: 4, distinkte_pfade: 4, katalog_ratio: 0.375, intent_ratio: 0.625},
  {anfragen: 9, distinkte_pfade: 9, katalog_ratio: 0.625, intent_ratio: 0.125},
  {anfragen: 9, distinkte_pfade: 9, katalog_ratio: 0.875, intent_ratio: 0.375},
  // --- Bulk, je EINE Evidenz einzeln --------------------------------------
  {anfragen: 5, distinkte_pfade: 5, katalog_ratio: 0.5, intent_ratio: 1},
  {anfragen: 5, distinkte_pfade: 40, katalog_ratio: 0.1, intent_ratio: 1},
  {anfragen: 30, distinkte_pfade: 5, katalog_ratio: 0.1, intent_ratio: 1, sweep_marker: true},
  {anfragen: 29, distinkte_pfade: 5, katalog_ratio: 0.1, intent_ratio: 1, sweep_marker: true},
  {anfragen: 5, distinkte_pfade: 5, katalog_ratio: 0.25, intent_ratio: 1, tage_aktiv: 3},
  {anfragen: 5, distinkte_pfade: 5, katalog_ratio: 0.25, intent_ratio: 1, tage_aktiv: 2},
  // Mehrfach-Evidenz: Reihenfolge und Vollstaendigkeit der `belege`
  {anfragen: 99, distinkte_pfade: 80, katalog_ratio: 1, intent_ratio: 0, sweep_marker: true, tage_aktiv: 5},
  // --- Vorrang-Reihenfolge in entscheide() --------------------------------
  {evasion: true, netz_klasse: 'good_bot'}, // Evasion schlaegt Identitaet
  {evasion: true, anfragen: 3, distinkte_pfade: 3, katalog_ratio: 0.05, intent_ratio: 1},
  {netz_klasse: 'good_bot', katalog_ratio: 1, distinkte_pfade: 80, anfragen: 99}, // good_bot trotz Breite
  // --- alle Netz-Klassen (das Vokabular ist eine KOPIE -> Drift-Kandidat) --
  ...['good_bot', 'bot_behauptet', 'cdn_proxy', 'rechenzentrum', 'endkunde', 'unbestimmt'].map(
    (netz_klasse) => ({netz_klasse, anfragen: 3, distinkte_pfade: 3, katalog_ratio: 0.05, intent_ratio: 1}),
  ),
  // --- Fehlerfaelle: BEIDE Seiten muessen werfen --------------------------
  {ip: '203.0.113.7'},
  {user_agent: 'GPTBot'},
  {netz_klasse: '203.0.113.7'},
  {netz_klasse: 'datacenter'}, // alter Name aus scoring.py — kein Lane-Wort
  {netz_klasse: 'GOOD_BOT'},
  {anfragen: -1},
  {anfragen: true},
  {distinkte_pfade: -1},
  {tage_aktiv: 0},
  {katalog_ratio: 1.5},
  {katalog_ratio: -0.1},
  {intent_ratio: 1.0001},
  {sweep_marker: 'ja'},
  {evasion: 1},
];

const LANE_DECKEL = [];
for (const lane of ['kunden_pfad', 'unbestimmt', 'bulk']) {
  for (const score of [0, 39, 40, 59, 60, 79, 80, 100]) {
    LANE_DECKEL.push({score, lane}); // Standard-Deckel des Verdikts
    LANE_DECKEL.push({score, lane, max_stufe: null, explizit: true});
    for (const max_stufe of ['S0', 'S1', 'S2', 'S3']) {
      LANE_DECKEL.push({score, lane, max_stufe, explizit: true});
    }
  }
}
// Fehlerfaelle
LANE_DECKEL.push(
  {score: -1, lane: 'kunden_pfad'},
  {score: 101, lane: 'kunden_pfad'},
  {score: 50, lane: 'unbekannt'},
  {score: 50, lane: 'kunden_pfad', max_stufe: 'S4', explizit: true},
  {score: 50, lane: 'kunden_pfad', max_stufe: 's1', explizit: true},
);

const LANE_BEWERTE = [];
for (const score of [0, 42, 59, 62, 66, 90, 100]) {
  for (const sig of LANE_ENTSCHEIDE.slice(0, 22)) {
    LANE_BEWERTE.push({score, signale: sig});
  }
}
// Betriebs-Deckel (caps) ueberschreiben — inkl. Teil-caps mit Fallback
for (const caps of [
  {kunden_pfad: 'S0', unbestimmt: 'S1', bulk: null},
  {kunden_pfad: 'S3', unbestimmt: 'S3', bulk: null},
  {kunden_pfad: null, unbestimmt: null, bulk: null},
  {kunden_pfad: 'S2'},
  {},
]) {
  for (const score of [30, 62, 90]) {
    LANE_BEWERTE.push({score, signale: {anfragen: 3, distinkte_pfade: 3, katalog_ratio: 0.05, intent_ratio: 1}, caps});
    LANE_BEWERTE.push({score, signale: {katalog_ratio: 0.9, distinkte_pfade: 70, anfragen: 90}, caps});
    LANE_BEWERTE.push({score, signale: {}, caps});
  }
}

const LANE_SIGNALE = [
  {abrufe: []},
  {abrufe: [['/products/qione', '2026-08-04']]},
  {abrufe: [['/products/a', '2026-08-04'], ['/products/b', '2026-08-04'], ['/products/a', '2026-08-04']]},
  // 10 distinkte von 80 => katalog_ratio 0.125 (der .2f-Gleichstand)
  {abrufe: Array.from({length: 10}, (_, i) => [`/products/p${i}`, '2026-08-04']), katalog_groesse: 80},
  {abrufe: [['/sitemap.xml', '2026-08-04']]},
  {abrufe: [['/products/a?page=3', '2026-08-04']]},
  {abrufe: [['/products/a?page=2', '2026-08-04']]},
  {abrufe: [['/products/a?page=abc', '2026-08-04']]},
  {abrufe: [['/products/a?page=3abc', '2026-08-04']]}, // parseInt-Falle: Python wirft
  {abrufe: [['/products/a?cursor=7', '2026-08-04']]},
  {abrufe: [['/products/a?limit=+4', '2026-08-04']]},
  {abrufe: [['/products/a?offset=-9', '2026-08-04']]},
  {abrufe: [['/PRODUCTS/GROSS', '2026-08-04']]},
  {abrufe: [['/impressum', '2026-08-04'], ['/products/a', '2026-08-04'], ['/x', '2026-08-04']]},
  {abrufe: [['/products/a', 'mo'], ['/products/b', 'di'], ['/products/c', 'mi']]},
  {abrufe: [['/products/a', ''], ['/products/b', '']]}, // leerer Tag zaehlt nicht
  {abrufe: [{pfad: '/pages/zell-schutz', tag: '2026-08-04'}]}, // dict-Form
  {abrufe: [{pfad: '/wp-admin/x', tag: '2026-08-04'}]},
  {abrufe: [['/products/a', '2026-08-04']], katalog_groesse: 0}, // max(1, ...)
  {abrufe: [['/products/a', '2026-08-04']], katalog_groesse: 1},
  {abrufe: [['/products/a', '2026-08-04']], netz_klasse: 'good_bot'},
  {abrufe: [['/products/a', '2026-08-04']], evasion: true},
  {abrufe: Array.from({length: 45}, (_, i) => [`/products/p${i}`, '2026-08-04'])},
];

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
  lane_entscheide: LANE_ENTSCHEIDE.map((v) => safe(() => entscheide(v))),
  lane_deckel: LANE_DECKEL.map((v) =>
    safe(() => ({
      score: v.explizit
        ? deckelScore(v.score, v.lane, v.max_stufe)
        : deckelScore(v.score, v.lane),
    })),
  ),
  lane_bewerte: LANE_BEWERTE.map((v) =>
    safe(() => laneBewerte(v.score, v.signale, v.caps ?? null)),
  ),
  lane_signale: LANE_SIGNALE.map((v) =>
    safe(() =>
      ausVerlauf(
        v.abrufe,
        v.katalog_groesse ?? 60,
        v.netz_klasse ?? 'unbestimmt',
        v.evasion ?? false,
      ),
    ),
  ),
  waf_version: WAF_RULES_VERSION,
};

// Kategorien, deren Ergebnis FLIESSKOMMA-Felder traegt (katalog_ratio,
// intent_ratio). Python serialisiert `0.0` als "0.0", JS `0` als "0" — ein
// strikter JSON-Vergleich meldet dort einen Unterschied, den es nicht gibt.
// Fuer diese Kategorien werden Zahlen deshalb beidseitig auf dieselbe
// kanonische Dezimalform gebracht. Das schwaecht den Vergleich NICHT: beide
// Runtimes rechnen IEEE-754-double, und die kanonische Form ist die
// kuerzeste rundreise-treue Darstellung — verschiedene Werte bleiben
// verschiedene Strings. Die uebrigen Kategorien vergleichen unveraendert strikt.
const ZAHLEN_LOCKER = new Set([
  'lane_entscheide',
  'lane_bewerte',
  'lane_signale',
]);

// ---- Python-Seite rechnen ---------------------------------------------------

const runner = fileURLToPath(new URL('./paritaet_runner.py', import.meta.url));
const vektoren = {
  scoring: SCORING,
  eskalation: ESKALATION,
  hysterese: HYSTERESE,
  anwenden: ANWENDEN,
  header: HEADER,
  pfad: PFAD,
  lane_entscheide: LANE_ENTSCHEIDE,
  lane_deckel: LANE_DECKEL,
  lane_bewerte: LANE_BEWERTE,
  lane_signale: LANE_SIGNALE,
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

function kanonisch(x, zahlenLocker = false) {
  if (Array.isArray(x)) return x.map((y) => kanonisch(y, zahlenLocker));
  if (x && typeof x === 'object') {
    return Object.fromEntries(
      Object.keys(x)
        .sort()
        .map((k) => [k, kanonisch(x[k], zahlenLocker)]),
    );
  }
  if (zahlenLocker && typeof x === 'number') {
    // int 0 und float 0.0 sind derselbe Wert — nur ihre JSON-Schreibweise
    // unterscheidet sich zwischen den Runtimes.
    return Number.isInteger(x) ? `${x}.0` : String(x);
  }
  return x;
}
const gleich = (a, b, zahlenLocker = false) =>
  JSON.stringify(kanonisch(a, zahlenLocker)) ===
  JSON.stringify(kanonisch(b, zahlenLocker));

let pass = 0;
let fail = 0;
for (const kategorie of Object.keys(vektoren)) {
  const js = jsErgebnis[kategorie];
  const pyk = pyErgebnis[kategorie];
  const locker = ZAHLEN_LOCKER.has(kategorie);
  for (let i = 0; i < js.length; i++) {
    if (gleich(js[i], pyk[i], locker)) {
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
  `PARITAET JS<->PYTHON: ${pass} PASS / ${fail} FAIL (Vektoren: scoring=${SCORING.length}, eskalation=${ESKALATION.length}, hysterese=${HYSTERESE.length}, anwenden=${ANWENDEN.length}, header=${HEADER.length}, pfad=${PFAD.length}, lane_entscheide=${LANE_ENTSCHEIDE.length}, lane_deckel=${LANE_DECKEL.length}, lane_bewerte=${LANE_BEWERTE.length}, lane_signale=${LANE_SIGNALE.length})`,
);
console.log(fail === 0 ? 'PARITAET GRUEN' : 'PARITAET ROT');
process.exit(fail === 0 ? 0 : 1);
