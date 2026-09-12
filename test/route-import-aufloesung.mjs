/**
 * Lädt eine echte Route/Bibliothek mit aufgelösten `~/`-Importen — TRANSITIV.
 *
 * WARUM ES DIESEN GEMEINSAMEN HELFER GIBT (2026-09-12, Job 20260912-sitemap-
 * index-ohne-lastmod-…): drei Tests laden dieselbe Sitemap-Familie, und jeder
 * hatte seine eigene Auflösung mit GENAU EINER Ebene. Das ging gut, solange
 * die geladenen Routen nur Bibliotheken ohne eigene `~/`-Importe zogen. Als
 * die Bestands-Abfragen in `~/lib/sitemap-bestand` umzogen (damit Index und
 * Kind dieselbe Menge lesen), zog eine Bibliothek zum ersten Mal selbst
 * weiter — und zwei Tests scheiterten am Import statt am Gegenstand. Ein
 * Testabbruch, der wie ein Defekt aussieht und keiner ist, ist teurer als
 * der Helfer.
 *
 * Die Ablage liegt bewusst IM Repo und nicht in /tmp: `@shopify/hydrogen`
 * wird über `node_modules` aufgelöst, und ausserhalb des Baums findet node
 * das Paket nicht (`ERR_MODULE_NOT_FOUND`). Die Dateien werden nach dem
 * Import wieder entfernt.
 */
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const hier = dirname(fileURLToPath(import.meta.url));
const wurzel = join(hier, '..');
const appDir = join(wurzel, 'app');

let lfd = 0;

/**
 * @param {string} pfad Datei, die geladen werden soll
 * @param {string} marke Namensteil der Wegwerf-Dateien (je Test eigener)
 * @param {(quelle: string) => string} wandle optionale Mutation der Route
 * @returns {Promise<object>} das importierte Modul
 */
export async function ladeMitAufgeloestenImporten(pfad, marke, wandle = (q) => q) {
  const wegwerf = [];
  const gesehen = new Map();

  const aufloesen = (datei, istWurzel) => {
    const schon = gesehen.get(datei);
    if (schon) return schon;
    const ziel = join(wurzel, `.${marke}-${process.pid}-${lfd++}.mjs`);
    const url = pathToFileURL(ziel).href;
    gesehen.set(datei, url);
    wegwerf.push(ziel);
    const roh = readFileSync(datei, 'utf8');
    const quelle = (istWurzel ? wandle(roh) : roh).replace(
      /from '~\/([^']+)'/g,
      (_, rest) => `from '${aufloesen(join(appDir, `${rest}.js`), false)}'`,
    );
    writeFileSync(ziel, quelle);
    return url;
  };

  try {
    return await import(aufloesen(pfad, true));
  } finally {
    for (const f of wegwerf) rmSync(f, {force: true});
  }
}
