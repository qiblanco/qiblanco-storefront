/**
 * Versionsangabe aus dem Inhalt für die Skripte in public/.
 * Anlass: Job 20261007-storefront-pixelskripte-ohne-version-jahrescache.
 */
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync, writeFileSync, readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {publicSkriptVersionen} from '../scripts/public-skript-version.mjs';
import {publicSkript} from '../app/lib/public-skript.js';

const sha8 = (b) => createHash('sha256').update(b).digest('hex').slice(0, 8);

describe('publicSkriptVersionen', () => {
  it('nimmt nur .js direkt in public/ und hasht den Inhalt', () => {
    const d = mkdtempSync(join(tmpdir(), 'pubskript-'));
    writeFileSync(join(d, 'a.js'), 'eins');
    writeFileSync(join(d, 'b.txt'), 'nein');
    const t = publicSkriptVersionen(d);
    assert.deepEqual(Object.keys(t), ['/a.js']);
    assert.equal(t['/a.js'], sha8('eins'));
  });

  it('ein geändertes Byte ergibt eine andere Version', () => {
    const d = mkdtempSync(join(tmpdir(), 'pubskript-'));
    writeFileSync(join(d, 'a.js'), 'eins');
    const vorher = publicSkriptVersionen(d)['/a.js'];
    writeFileSync(join(d, 'a.js'), 'einz');
    assert.notEqual(publicSkriptVersionen(d)['/a.js'], vorher);
  });

  it('deckt jedes Skript, das root.jsx über publicSkript() einbindet', () => {
    const wurzel = fileURLToPath(new URL('..', import.meta.url));
    const t = publicSkriptVersionen(join(wurzel, 'public'));
    const root = readFileSync(join(wurzel, 'app/root.jsx'), 'utf8');
    const genannt = [...root.matchAll(/publicSkript\('([^']+)'\)/g)].map(
      (m) => m[1],
    );
    assert.ok(genannt.length >= 7, `nur ${genannt.length} Aufrufe`);
    for (const p of genannt) assert.ok(t[p], `${p} fehlt in public/`);
  });
});

describe('publicSkript', () => {
  it('hängt ?v= an, wenn die Tabelle die Datei kennt', () => {
    assert.equal(publicSkript('/x.js', {'/x.js': 'abcd1234'}), '/x.js?v=abcd1234');
  });
  it('ohne Eintrag bleibt der Pfad unverändert', () => {
    assert.equal(publicSkript('/x.js', {}), '/x.js');
    assert.equal(publicSkript('/x.js'), '/x.js');
  });
});
