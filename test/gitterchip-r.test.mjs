// Christian 28.10.2026: „ja Gitterchip machen wir ab jetzt überall mit ®“
// (Job 20261028-gitterchip-ueberall-mit-registered-zeichen; ersetzt die TM-Regel
// vom 16.09.2026). Waechter ueber JEDEN Kundentext im Repo: kein „Gitterchip“
// (GitterChip, Gitter-Chip, mit ™ oder nackt) ohne unmittelbar folgendes ® bzw.
// <sup>®</sup>. Ausgenommen: Kommentare, Bezeichner (Komponenten, Klassen,
// Slugs), der Publikationstitel „QTA Gitterchip Technology“ und in den
// Studien-Nachdrucken (app/data/studien, fremde Rede) das nackte Wort.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

const WURZEL = new URL('../app/', import.meta.url).pathname;
const WORT =
  /(?<![A-Za-z0-9_$./<#@\\])Gitter(?:-C|C|c)hips?(?!®|<sup>®|[A-Za-z0-9_$])/g;
const ZITAT = /QTA[\s-]+Gitter[\s-]?chip[\s-]+Technology/i;

function dateien(dir, out = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) dateien(p, out);
    else if (/\.(jsx?|json)$/.test(n)) out.push(p);
  }
  return out;
}

const ohneKommentare = (t) =>
  t
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:\\'"`])\/\/[^\n]*/g, (m, a) => a);

export function verstoesse(pfad, text) {
  const roh = pfad.endsWith('.json') ? text : ohneKommentare(text);
  const studie = pfad.includes('/data/studien/');
  const funde = [];
  for (const m of roh.matchAll(WORT)) {
    const umfeld = roh.slice(Math.max(0, m.index - 6), m.index + 40);
    if (ZITAT.test(umfeld)) continue;
    const zeile = roh.slice(roh.lastIndexOf('\n', m.index) + 1, roh.indexOf('\n', m.index));
    if (/^\s*(import|export\s+(default\s+)?function|function)\b/.test(zeile)) continue;
    const nachher = roh.slice(m.index + m[0].length, m.index + m[0].length + 1);
    if (studie && nachher !== '™') continue;
    funde.push(`${pfad.slice(WURZEL.length)}: …${roh.slice(Math.max(0, m.index - 25), m.index + 20).replace(/\s+/g, ' ')}…`);
  }
  return funde;
}

describe('Gitterchip® – Schreibregel im Kundentext (Christian 28.10.2026)', () => {
  it('Waechter erkennt ™, nackt und GitterChip – und laesst ® und <sup>®</sup> durch', () => {
    const p = WURZEL + 'x.jsx';
    assert.equal(verstoesse(p, "'Der Gitterchip™ wirkt'").length, 1);
    assert.equal(verstoesse(p, '<p>Der GitterChip hilft</p>').length, 1);
    assert.equal(verstoesse(p, "'QTA-GitterChip™-Technologie'").length, 1);
    assert.equal(verstoesse(p, "'Der Gitterchip® wirkt'").length, 0);
    assert.equal(verstoesse(p, '<p>Der Gitterchip<sup>®</sup> hilft</p>').length, 0);
    assert.equal(verstoesse(p, "import {Gitterchip} from './x';\n<GitterchipMoleculesScrub />").length, 0);
    assert.equal(verstoesse(p, '// der GitterChip im Kommentar\n').length, 0);
    assert.equal(verstoesse(p, "'Dartsch PC. QTA Gitterchip Technology: Relationship'").length, 0);
  });

  it('kein Kundentext im Repo traegt „Gitterchip“ ohne ®', () => {
    const funde = dateien(WURZEL).flatMap((p) => verstoesse(p, readFileSync(p, 'utf8')));
    assert.deepEqual(funde, []);
  });
});
