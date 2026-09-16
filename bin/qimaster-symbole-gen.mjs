#!/usr/bin/env node
/*
 * qimaster-symbole-gen — erzeugt app/lib/qi-master-symbole.generated.js aus den
 * SVG-Dateien in app/assets/qi-master-symbole/.
 *
 * WARUM ES DIESEN SCHRITT GIBT: die Symbole muessen INLINE in die Seite, weil der
 * Kopfblock aus dem Shopify-Feld `descriptionHtml` kommt und per
 * dangerouslySetInnerHTML gerendert wird -- ein <img>-Verweis waere ein zweiter
 * Request je Zeile und wuerde `currentColor` verlieren, also genau die Eigenschaft,
 * die der Auftrag verlangt. Gleichzeitig soll die ZEICHNUNG eine echte .svg-Datei
 * bleiben: Christian kann sie oeffnen, und der Auftrag prueft sie als Datei.
 *
 * Die .svg-Dateien sind die SSoT, die generierte Datei ist abgeleitet und mit
 * eingecheckt. Dass sie nicht driften koennen, prueft test/qi-master-kopfsymbole.test.mjs
 * -- die Gleichheit ist damit nicht zugesagt, sondern gemessen, und sie laeuft in der
 * Suite mit, die es schon gibt (kein zweiter Traeger).
 *
 * Aufruf:  node bin/qimaster-symbole-gen.mjs [--pruefe]
 *   ohne Schalter: schreibt die Datei
 *   --pruefe:      schreibt nichts, exit 1 wenn die Datei nicht zum Bestand passt
 */
import {readdirSync, readFileSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SYMBOL_DIR = join(WURZEL, 'app/assets/qi-master-symbole');
export const ZIEL = join(WURZEL, 'app/lib/qi-master-symbole.generated.js');

/** Genau die Attribute, die die Vorlage traegt (gemessen, siehe HERKUNFT.md). */
const PFAD_RX = /<path\s+fill="currentColor"\s+d="([^"]+)"\s*\/>/;

export function lesePfade(dir = SYMBOL_DIR) {
  const raus = {};
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.svg')).sort()) {
    const roh = readFileSync(join(dir, name), 'utf8');
    const m = roh.match(PFAD_RX);
    if (!m) throw new Error(`${name}: kein <path fill="currentColor" d="..."/> gefunden`);
    if ((roh.match(/<path/g) || []).length !== 1) throw new Error(`${name}: mehr als ein Pfad`);
    raus[name.replace(/\.svg$/, '')] = m[1];
  }
  return raus;
}

export function baueDatei(pfade) {
  const zeilen = Object.entries(pfade).map(([k, v]) => `  '${k}': '${v}',`).join('\n');
  return `/*\n * GENERIERT von bin/qimaster-symbole-gen.mjs aus app/assets/qi-master-symbole/*.svg.\n * NICHT VON HAND AENDERN -- die .svg-Dateien sind die Quelle. Neu erzeugen:\n *   node bin/qimaster-symbole-gen.mjs\n * test/qi-master-kopfsymbole.test.mjs faellt, wenn diese Datei von den .svg abweicht.\n */\nexport const QIMASTER_SYMBOL_PFADE = {\n${zeilen}\n};\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const soll = baueDatei(lesePfade());
  if (process.argv.includes('--pruefe')) {
    let ist = '';
    try { ist = readFileSync(ZIEL, 'utf8'); } catch { /* fehlt */ }
    if (ist !== soll) {
      console.error('qimaster-symbole-gen: generierte Datei weicht von den .svg ab -> node bin/qimaster-symbole-gen.mjs');
      process.exit(1);
    }
    console.log('qimaster-symbole-gen: generierte Datei passt zu den .svg');
  } else {
    writeFileSync(ZIEL, soll);
    console.log(`qimaster-symbole-gen: ${ZIEL} geschrieben (${Object.keys(lesePfade()).length} Symbole)`);
  }
}
