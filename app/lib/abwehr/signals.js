/**
 * signals.js — objektive Signal-Extraktion (Header-Heuristik, Pfad-/Payload-
 * Anomalie via WAF-Regelwerk, Vollkatalog-Ratio).
 *
 * JS-PORTIERUNG der Python-SSoT `shared-state/sicherheitsmeister/src/signals.py`
 * + `waf_rules.yaml` (version 1). Die YAML-Datei bleibt die Regel-Wahrheit —
 * neue Regeln dort = HIER nachziehen (der Paritaets-Test scripts/abwehr/
 * paritaet.mjs reißt bei Drift). Oxygen/workerd lädt kein YAML zur Laufzeit,
 * darum sind die Regeln hier als Konstante eingebettet (inkl. version-Feld
 * für den Drift-Abgleich).
 *
 * Uniform-Prinzip (Anti-Cloaking): bewertet VERHALTEN/FORM der Anfrage —
 * nie, WER anfragt. Roh-Header/UA werden NUR in-memory ausgewertet; zurück
 * kommen ausschließlich Booleans, Severities und Regel-IDs (INV-3).
 */

// Spiegel von waf_rules.yaml — version MUSS mit der YAML uebereinstimmen.
export const WAF_RULES_VERSION = 1;
export const WAF_RULES = [
  // (?i)-Praefixe der Python-Patterns sind hier als /i-Flag portiert.
  {id: 'waf-wp-admin', severity: 2, target: 'path', re: /^\/wp-(admin|login|content|includes)/},
  {id: 'waf-dotenv', severity: 3, target: 'path', re: /\.env($|\.)/},
  {id: 'waf-git-dir', severity: 3, target: 'path', re: /(^|\/)\.git(\/|$)/},
  {id: 'waf-php-probe', severity: 2, target: 'path', re: /\.(php|asp|aspx|jsp|cgi)($|\?)/},
  {id: 'waf-traversal', severity: 3, target: 'path', re: /(\.\.\/|%2e%2e%2f|%2e%2e\/|\.\.%2f)/},
  {id: 'waf-sqli', severity: 3, target: 'query', re: /(union\s+select|or\s+1\s*=\s*1|sleep\s*\(|benchmark\s*\(|';--)/i},
  {id: 'waf-xss', severity: 3, target: 'query', re: /(<script|javascript:|onerror\s*=|onload\s*=)/i},
  {id: 'waf-oversize-query', severity: 1, target: 'query_len', grenze: 2048},
  {id: 'waf-graphql-flood', severity: 1, target: 'path', re: /^\/api\/graphql/},
];

// Scraper-/Automations-Bibliotheken (UA-Muster; nur FORM, keine Identitaet).
const SCRAPER_UA = [
  'python-requests', 'python-urllib', 'curl/', 'wget/', 'scrapy',
  'go-http-client', 'java/', 'okhttp', 'aiohttp', 'httpx', 'libwww',
  'node-fetch', 'axios', 'phantomjs', 'headlesschrome', 'puppeteer',
  'playwright', 'selenium',
];

/** @param {string} uaL */
function istBekannterBot(uaL) {
  // Nur für die Sprach-Header-Heuristik (legitime Crawler senden keine
  // Accept-Language). KEINE Allowlist — die Verifikation guter Bots läuft
  // über Reverse-DNS (Eigenserver/T3), auf Oxygen nicht verfuegbar.
  return ['googlebot', 'bingbot', 'duckduckbot', 'applebot'].some((b) =>
    uaL.includes(b),
  );
}

/**
 * Header-Anomalie-Heuristik. Eingabe: Header-Objekt (in-memory, wird NICHT
 * gespeichert). Ausgabe: {header_anomaly: bool, Gründe: [regel-ids]}.
 * @param {Record<string, string>} headers
 */
export function headerSignale(headers) {
  /** @type {Record<string, string>} */
  const h = {};
  for (const [k, v] of Object.entries(headers || {})) {
    h[String(k).toLowerCase()] = String(v);
  }
  const ua = h['user-agent'] || '';
  const uaL = ua.toLowerCase();
  // Der JSON-Schlüssel der Liste steht im Rückgabeobjekt (Parität zur
  // Python-SSoT); als JS-Bezeichner trägt sie den Namen ursachen.
  const ursachen = [];

  if (!h['accept']) ursachen.push('hdr-kein-accept');
  if (!h['accept-language'] && !istBekannterBot(uaL)) {
    ursachen.push('hdr-keine-sprache');
  }
  if (SCRAPER_UA.some((m) => uaL.includes(m))) ursachen.push('hdr-scraper-lib');
  if (!ua) ursachen.push('hdr-kein-ua');
  // Browser-UA behauptet Chrome/Chromium, aber Client-Hints fehlen komplett:
  // moderne Chrome-Browser senden sec-ch-ua immer mit (UA<->Hints-Mismatch).
  if ((uaL.includes('chrome/') || uaL.includes('chromium/')) && !('sec-ch-ua' in h)) {
    ursachen.push('hdr-ua-hints-mismatch');
  }

  return {header_anomaly: ursachen.length > 0, "gruende": ursachen};
}

/**
 * WAF-Regelwerk gegen (reduzierten) Pfad + fluechtigen Query-String.
 * Ausgabe: {waf_severity: 0..3, treffer: [regel-ids]}. Der Query-String
 * wird NUR in-memory geprueft, nie zurueckgegeben oder gespeichert.
 * @param {string} pfad
 * @param {string} [query]
 */
export function pfadSignale(pfad, query = '') {
  const treffer = [];
  let severity = 0;
  for (const r of WAF_RULES) {
    let hit = false;
    if (r.target === 'path') {
      hit = r.re.test(pfad || '');
    } else if (r.target === 'query') {
      hit = r.re.test(query || '');
    } else if (r.target === 'query_len') {
      hit = (query || '').length > r.grenze;
    }
    if (hit) {
      treffer.push(r.id);
      severity = Math.max(severity, r.severity);
    }
  }
  return {waf_severity: severity, treffer};
}

/**
 * Anteil des Katalogs, den EIN Schluessel im Zeitfenster abgegriffen hat
 * (OWASP-OAT-011-Muster). Rein arithmetisch.
 * @param {number} distinctKatalogPfade
 * @param {number} katalogGroesse
 */
export function vollkatalogRatio(distinctKatalogPfade, katalogGroesse) {
  if (katalogGroesse <= 0) return 0.0;
  return Math.max(0.0, Math.min(1.0, distinctKatalogPfade / katalogGroesse));
}
