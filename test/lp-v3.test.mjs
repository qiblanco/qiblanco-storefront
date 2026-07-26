// Hermetische Tests der LP-V3-Kill-Entscheidung (Grossjob
// 20260726-lp-v3-apple-microsoft-scrollanim). Wie lp-ab-v2.test.mjs /
// catchall.test.mjs: node:test/node:assert sind Bordmittel, KEIN Netz.
// Ausfuehren: node --test test/lp-v3.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {LP_V3_PFAD, istV3Aus} from '../app/lib/lp-v3.server.js';

test('Pfad-Konstante: deterministischer 67a7-Slug (Abnahme-Vertrag)', () => {
  assert.equal(LP_V3_PFAD, '/pages/schlaf-zellen-schutz-v3-67a7');
});

test('KILL: nur explizites off nimmt die Seite vom Netz', () => {
  assert.equal(istV3Aus({LP_V3_MODE: 'off'}), true);
  assert.equal(istV3Aus({LP_V3_MODE: 'OFF'}), true);
  assert.equal(istV3Aus({LP_V3_MODE: ' off '}), true);
});

test('DEFAULT LIVE: Abwesenheit/andere Werte rendern die Seite', () => {
  assert.equal(istV3Aus({}), false);
  assert.equal(istV3Aus(undefined), false);
  assert.equal(istV3Aus(null), false);
  assert.equal(istV3Aus({LP_V3_MODE: ''}), false);
  assert.equal(istV3Aus({LP_V3_MODE: 'on'}), false);
  assert.equal(istV3Aus({LP_V3_MODE: '0'}), false);
  assert.equal(istV3Aus({LP_V3_MODE: 'false'}), false);
});
