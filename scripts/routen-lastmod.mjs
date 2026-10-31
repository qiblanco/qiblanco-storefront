/**
 * BUILD-ZEIT: Seiten-Handle -> Zeitpunkt der letzten INHALTLICHEN Änderung
 * seiner Code-Route (`app/routes/pages.<handle>.jsx`), als UTC-ISO.
 *
 * DER ANLASS (2026-10-07, Job 20261007-sitemap-lastmod-code-route-klasse):
 * `getSitemap` schreibt in sitemap/pages/1.xml das `updatedAt` des
 * Shopify-SEITENOBJEKTS. Steht der Inhalt einer Seite im Repo, bewegt eine
 * Inhaltsänderung dieses Objekt nie. Gemessen am selben Tag mit
 * homepage-bauer/pruefungen/probe_sitemap_lastmod_wahrhaftig.py: 28 von 44
 * Sitemap-Seiten mit eigener Code-Route meldeten Google ein Alter, das bis
 * zu 1395 Tage neben der Wirklichkeit lag. Einzelfall-Nachträge
 * (`NUR_ROUTE_SEITEN.lastmod`, `~/lib/zusammenlegungen-lastmod`) schlossen
 * je eine Handvoll Seiten, nie die Klasse.
 *
 * DIESELBE GRÖSSE WIE DAS MESSGERÄT, BEWUSST: Commit-Zeit (`%cI`) der Route
 * auf dem gebauten Stand, Kommentar- und Leerzeilen-Commits zählen nicht.
 * Genau so urteilt die Probe. Auf `main` ist die Commit-Zeit eines
 * Squash-Merges der Merge-Zeitpunkt, also wenige Minuten vor dem Deploy.
 *
 * NUR DIE ROUTENDATEI, NICHT IHRE KOMPONENTEN: eine Änderung an
 * `app/components/...` hebt das Datum nicht. Wer die Importe mitzählte,
 * zöge über gemeinsame Bibliotheken (`~/lib/seo` ändert sich fast täglich)
 * jede Seite bei jedem Deploy mit — ein Frischesignal ohne neuen Inhalt,
 * das Google abwertet. Die Untergrenze ist die ehrlichere Fehlerrichtung.
 *
 * DIE FLACHE KOPIE IST DIE EIGENTLICHE FALLE: dort erscheint jede Datei als
 * "im letzten Commit angelegt", und jede Seite bekäme das Datum des Deploys.
 * Der Oxygen-Workflow checkt mit `actions/checkout` flach aus (Tiefe 1). Den
 * Workflow auf `fetch-depth: 0` zu stellen, ging am 2026-10-07 nicht: der
 * Server-Token hat kein Recht `workflow`, GitHub lehnte den Push ab. Darum
 * VERTIEFT der Build die Kopie selbst (`git fetch --unshallow`). Die
 * Zugangsdaten dafür hat `actions/checkout` im Checkout hinterlegt
 * (persist-credentials). Scheitert das, liefert die Funktion `null`
 * (FAIL-OPEN): die Sitemap bleibt so, wie Shopify sie liefert, und die Probe
 * wird rot.
 *
 * EIN git-AUFRUF FÜR ALLE ROUTEN (2026-10-31, Grossjob
 * 20261031-GROSSJOB-prio1-ax41-ai-server-final-verschmelzen-wache-selbstreparatur, s05):
 * bis dahin lief je Routendatei ein eigenes `git log` (121 Aufrufe). Auf
 * ax41 läuft git über den Gehirn-Dienst, je Aufruf 1,2-3,2 s, also 3-7 min
 * je Laden der Vite-Konfiguration; ein Build lädt sie mehrfach. Jetzt holt
 * EIN `git log -- app/routes` die Historie, und jede Route nimmt den jüngsten
 * Commit mit inhaltlicher Änderung an genau ihrer Datei. `--no-renames`, weil
 * der Einzelaufruf eine umbenannte Datei als neu angelegt sah (die alte
 * Pfadseite lag außerhalb seines Pfads); mit Umbenennungs-Erkennung über das
 * ganze Verzeichnis zählte eine reine Umbenennung 0 Zeilen. Gleichheit der
 * Tabelle mit dem Einzelweg ist gemessen (Job-Ordner s05, vergleich-*.json).
 * Schalter zurück: ROUTEN_LASTMOD_EINZELN=1 (Verhalten vorher, je Datei).
 */
import {execFileSync} from 'node:child_process';
import {readdirSync} from 'node:fs';
import {join} from 'node:path';

/** @param {string} wurzel @param {string[]} args */
function git(wurzel, args) {
  return execFileSync('git', ['-C', wurzel, ...args], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
}

/**
 * Zählt geänderte Zeilen eines Diff-Abschnitts ohne Kommentar- und
 * Leerzeilen — dieselbe Regel wie `_inhaltliche_zeilen` der Probe.
 *
 * @param {string[]} zeilen
 */
export function inhaltlicheZeilen(zeilen) {
  let n = 0;
  for (const zeile of zeilen) {
    const kopf = zeile.slice(0, 1);
    if ((kopf !== '+' && kopf !== '-') || zeile.startsWith('+++') || zeile.startsWith('---')) {
      continue;
    }
    const rumpf = zeile.slice(1).trim();
    if (!rumpf || rumpf.startsWith('//') || rumpf.startsWith('*') || rumpf.startsWith('/*')) {
      continue;
    }
    n += 1;
  }
  return n;
}

const MARKE = '@@QB-COMMIT@@';

/**
 * Jüngster Commit mit inhaltlicher Änderung an `pfad`, als UTC-ISO, oder null.
 *
 * @param {string} wurzel
 * @param {string} pfad
 */
function letzteInhaltlicheAenderung(wurzel, pfad) {
  const log = git(wurzel, ['log', `--format=${MARKE}%cI`, '-p', '-U0', '--', pfad]);
  for (const block of log.split(MARKE).slice(1)) {
    const [datum, ...rest] = block.split('\n');
    if (inhaltlicheZeilen(rest) > 0) {
      return new Date(datum.trim()).toISOString().replace('.000Z', 'Z');
    }
  }
  return null;
}

/**
 * Pfade, die git auch mit core.quotePath=false in Anführung setzt
 * (Anführungszeichen, Backslash, Steuerzeichen). Sie laufen einzeln.
 */
const NICHT_IM_GESAMTLOG = /["\\\x00-\x1f\x7f]/;
const DIFF_KOPF = 'diff --git a/';

/**
 * Wie letzteInhaltlicheAenderung, für alle `pfade` mit EINEM git-Aufruf über
 * app/routes: Pfad -> UTC-ISO des jüngsten Commits mit inhaltlicher Änderung.
 *
 * @param {string} wurzel
 * @param {string[]} pfade
 * @returns {Map<string, string>}
 */
function alleInhaltlichenAenderungen(wurzel, pfade) {
  const offen = new Set(pfade);
  const datum = new Map();
  const log = git(wurzel, [
    '-c',
    'core.quotePath=false',
    'log',
    '--no-renames',
    `--format=${MARKE}%cI`,
    '-p',
    '-U0',
    '--',
    'app/routes',
  ]);
  for (const block of log.split(MARKE).slice(1)) {
    if (offen.size === 0) break;
    const [kopf, ...rest] = block.split('\n');
    /** @type {Map<string, string[]>} */
    const jeDatei = new Map();
    let aktuell = null;
    for (const zeile of rest) {
      if (zeile.startsWith(DIFF_KOPF)) {
        // `diff --git a/<p> b/<p>`: ohne Umbenennung beide Seiten gleich lang
        const beide = zeile.slice(DIFF_KOPF.length);
        const pfad = beide.slice(0, (beide.length - ' b/'.length) / 2);
        aktuell = offen.has(pfad) ? pfad : null;
        if (aktuell && !jeDatei.has(aktuell)) jeDatei.set(aktuell, []);
        continue;
      }
      if (aktuell) jeDatei.get(aktuell).push(zeile);
    }
    for (const [pfad, zeilen] of jeDatei) {
      if (inhaltlicheZeilen(zeilen) > 0) {
        datum.set(
          pfad,
          new Date(kopf.trim()).toISOString().replace('.000Z', 'Z'),
        );
        offen.delete(pfad);
      }
    }
  }
  return datum;
}

/** @param {string} wurzel */
function istVoll(wurzel) {
  return git(wurzel, ['rev-parse', '--is-shallow-repository']).trim() === 'false';
}

/**
 * @param {string} wurzel Repo-Wurzel
 * @param {{vertiefen?: boolean}} [optionen] vertiefen: eine flache Kopie per
 *   `git fetch --unshallow` nachladen (nur der Build; Tests prüfen ohne)
 * @returns {Record<string, string>|null} null = nicht messbar (kein Datum)
 */
export function routenLastmod(wurzel, {vertiefen = false} = {}) {
  try {
    if (!istVoll(wurzel)) {
      if (!vertiefen) return null;
      execFileSync('git', ['-C', wurzel, 'fetch', '--quiet', '--unshallow'], {
        stdio: 'ignore',
        timeout: 180000,
      });
      if (!istVoll(wurzel)) return null;
    }
  } catch {
    return null;
  }
  const tabelle = {};
  const routen = readdirSync(join(wurzel, 'app', 'routes'));
  /** @type {[string, string][]} Handle, Pfad */
  const seiten = [];
  for (const name of routen) {
    if (!name.startsWith('pages.') || !name.endsWith('.jsx')) continue;
    const handle = name.slice('pages.'.length, -'.jsx'.length);
    // Dynamische Routen ($handle, podcasts_.$seite) sind keine Seiten-Handles.
    if (handle.includes('$') || handle.includes('.')) continue;
    seiten.push([handle, `app/routes/${name}`]);
  }
  let gesamt = null;
  if (!process.env.ROUTEN_LASTMOD_EINZELN) {
    try {
      gesamt = alleInhaltlichenAenderungen(
        wurzel,
        seiten.map(([, pfad]) => pfad),
      );
    } catch {
      gesamt = null; // dann je Datei, wie vorher
    }
  }
  for (const [handle, pfad] of seiten) {
    try {
      const datum =
        gesamt && !NICHT_IM_GESAMTLOG.test(pfad)
          ? gesamt.get(pfad)
          : letzteInhaltlicheAenderung(wurzel, pfad);
      if (datum) tabelle[handle] = datum;
    } catch {
      // eine unlesbare Route bekommt kein Datum, die anderen schon
    }
  }
  return tabelle;
}

// Direkt aufgerufen: Tabelle ausgeben (Sichtprüfung, Probe-Gegenstand).
if (import.meta.url === `file://${process.argv[1]}`) {
  const tabelle = routenLastmod(process.argv[2] ?? process.cwd());
  process.stdout.write(`${JSON.stringify(tabelle, null, 2)}\n`);
  process.exit(tabelle === null ? 4 : 0);
}
