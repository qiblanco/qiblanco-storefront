#!/usr/bin/env node
/*
 * partnercode-gen — erzeugt app/lib/partnercode-daten.server.js.
 *
 * EINGABE (stdin, JSON): {"eintraege": [{"ref": "<id>.<token>", "code": "X"}, ...]}
 * Die Eingabe traegt Links und Codes im KLARTEXT und darf deshalb nie auf
 * Platte liegen bleiben: der Aufrufer (partner-manager/bin/partnercode-abgleich)
 * reicht sie ueber eine Pipe herein. Die AUSGABE traegt beides nicht mehr —
 * jeder Eintrag ist nur mit dem Link selbst lesbar (app/lib/partnercode.server.js).
 *
 * Deterministisch: gleiche Eingabe -> byte-gleiche Datei (sortiert nach
 * Suchfeld, IV aus Link+Code). Der taegliche Abgleich erzeugt deshalb nur dann
 * einen Deploy, wenn sich die Partnermenge wirklich geaendert hat.
 *
 * Aufruf:  node bin/partnercode-gen.mjs [--ziel PFAD] [--pruefe]  < eingabe.json
 *   --pruefe: schreibt nichts, exit 1 wenn die Datei nicht zur Eingabe passt
 * Exit: 0 ok · 1 Datei weicht ab (--pruefe) · 2 Eingabe unbrauchbar
 */
import {readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {eintragFuer, normiereRef} from '../app/lib/partnercode.server.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
export const ZIEL = join(WURZEL, 'app/lib/partnercode-daten.server.js');
const JE_ZEILE = 6;

export async function erzeuge(eingabe) {
  const roh = Array.isArray(eingabe?.eintraege) ? eingabe.eintraege : null;
  if (!roh) throw new Error('Eingabe ohne Liste "eintraege"');
  const gesehen = new Set();
  const liste = [];
  for (const e of roh) {
    const ref = normiereRef(e?.ref);
    const code = String(e?.code ?? '').trim();
    if (!ref || !code || gesehen.has(ref)) continue;
    gesehen.add(ref);
    liste.push(await eintragFuer(ref, code));
  }
  liste.sort((a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : 0));
  const zeilen = [];
  for (let i = 0; i < liste.length; i += JE_ZEILE) {
    zeilen.push(
      '  ' +
        liste
          .slice(i, i + JE_ZEILE)
          .map((x) => `{k:'${x.k}',c:'${x.c}'}`)
          .join(',') +
        ',',
    );
  }
  return (
    '// ERZEUGT von bin/partnercode-gen.mjs — NICHT VON HAND AENDERN.\n' +
    '// Quelle: UpPromote (nur lesend) ueber partner-manager/bin/partnercode-abgleich.\n' +
    '// Jeder Eintrag ist nur mit dem vollstaendigen Partnerlink-Wert lesbar;\n' +
    '// Klartext-Codes stehen hier nicht (Begruendung: app/lib/partnercode.server.js).\n' +
    `export const PARTNERCODE_ANZAHL = ${liste.length};\n` +
    'export const PARTNERCODE_EINTRAEGE = [\n' +
    zeilen.join('\n') +
    (zeilen.length ? '\n' : '') +
    '];\n'
  );
}

async function main(argv) {
  let ziel = ZIEL;
  let pruefe = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--ziel') ziel = argv[++i];
    else if (argv[i] === '--pruefe') pruefe = true;
  }
  let eingabe;
  try {
    eingabe = JSON.parse(readFileSync(0, 'utf8'));
  } catch (e) {
    console.error('partnercode-gen: Eingabe ist kein JSON');
    return 2;
  }
  let text;
  try {
    text = await erzeuge(eingabe);
  } catch (e) {
    console.error('partnercode-gen: ' + e.message);
    return 2;
  }
  if (pruefe) {
    let alt = '';
    try {
      alt = readFileSync(ziel, 'utf8');
    } catch {
      alt = '';
    }
    console.log(alt === text ? 'GLEICH' : 'ABWEICHUNG');
    return alt === text ? 0 : 1;
  }
  writeFileSync(ziel, text);
  const n = (text.match(/\{k:/g) || []).length;
  console.log(`geschrieben: ${n} Eintraege -> ${ziel}`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2)).then((rc) => process.exit(rc));
}
