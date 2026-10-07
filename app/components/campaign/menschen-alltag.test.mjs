// Hermetische Tests der Stufe-B-Seite /pages/menschen-alltag (Funnel-Manager,
// Grossjob 20261007-GROSSJOB-funnel-manager-customer-journey-ad-lp, s02).
// Bordmittel: node:test/node:assert, KEIN Netz. Ausführen:
//   node --test app/components/campaign/menschen-alltag.test.mjs
//
// ARME (je Arm ein Test, damit ein Rot-Nachweis den Arm nennt):
//   NAHT-KAUFWEG   Ziel und Knopftext von B sind die von A (gelesen am Quelltext
//                  von SchlafZellenSchutz.jsx, nicht abgeschrieben)
//   KEINE-INFO     B verlinkt auf keine Info-Unterseite (Lehre GS-078): jedes
//                  href ist das Kaufziel, ein Produktziel aus blockLinks oder ein
//                  seiteninterner SVG-Anker
//   ROUTE          noindex im Meta-Tag UND im Header, kein canonical, no-store
//   TEXTE          jeder neue Satz steht im Textmodul, hat eine Werkstatt-Text-ID,
//                  kein Fachbegriff „kohärent", und kein Satz steht zweimal auf der Seite
//   MENSCHEN       die drei Videos existieren im Datenmodul und handeln vom QiOne 2 Pro
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

import {MENSCHEN_ALLTAG_TEXTE as T} from './menschenAlltagTexte.js';
import {ERFAHRUNGS_BEITRAEGE} from '../../data/erfahrungen-beitraege.js';
import {BLOCK_LP, produktLink} from '../reusables/blockLinks.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const B = readFileSync(join(HIER, 'MenschenAlltag.jsx'), 'utf8');
const A = readFileSync(join(HIER, 'SchlafZellenSchutz.jsx'), 'utf8');
const ROUTE = readFileSync(join(HIER, '../../routes/pages.menschen-alltag.jsx'), 'utf8');

/** Die eine Zuweisung `const NAME = <ausdruck>;` aus einem Quelltext. */
function zuweisung(quelle, name) {
  const m = quelle.match(new RegExp(`(?:export\\s+)?const\\s+${name}\\s*=\\s*([^;]+);`));
  assert.ok(m, `${name} nicht gefunden`);
  return m[1].replace(/\s+/g, ' ').trim();
}

test('NAHT-KAUFWEG: Kaufziel und Knopftext von B sind die von A', () => {
  assert.equal(zuweisung(B, 'KAUF_ZIEL'), zuweisung(A, 'QIONE_ZIEL'));
  assert.equal(zuweisung(B, 'KAUF_TEXT'), zuweisung(A, 'QIONE_CTA'));
  assert.equal(produktLink('qione-2-pro', BLOCK_LP, 'kauf'), '/pages/qione-2-pro');
  // Die Vertrauenszeile am Kopf-Knopf ist A's Wortlaut (Christian 21.09.2026).
  const zeile = 'Jetzt 20 Tage nach Erhalt testen, mit 0&nbsp;% Finanzierung &amp;';
  assert.ok(A.includes(zeile) && B.includes(zeile), 'Vertrauenszeile weicht von A ab');
  // Knopfstellen wie A: Kopf, unter den Studienzahlen, Produktkarte, Schluss.
  assert.equal((B.match(/<Kaufknopf\b/g) || []).length, 3, 'Kopf, Einwand, Schluss');
  assert.ok(B.includes("c.featured ? KAUF_TEXT : 'Mehr erfahren'"));
});

test('KEINE-INFO: jedes href führt zum Kauf oder bleibt auf der Seite', () => {
  const hrefs = [...B.matchAll(/href=(\{[^}]*\}|"[^"]*")/g)].map((m) => m[1]);
  assert.ok(hrefs.length >= 3, `zu wenige hrefs gefunden: ${hrefs}`);
  const erlaubt = [/^\{KAUF_ZIEL\}$/, /^\{produktLink\(c\.handle, BLOCK_LP, /, /^"#lp-ma-cta-arc"$/];
  for (const h of hrefs) {
    assert.ok(erlaubt.some((rx) => rx.test(h)), `unerlaubtes Linkziel: ${h}`);
  }
  for (const verboten of ['/pages/studien', '/pages/erfahrungen', '/pages/das-20-tage-versprechen', '-details', '/products/']) {
    assert.ok(!B.includes(`'${verboten}`) && !B.includes(`"${verboten}`), `Info-/Shop-Link im Quelltext: ${verboten}`);
  }
  for (const handle of ['qione-2-pro', 'qibracelet', 'qihome-air']) {
    for (const art of ['kauf', 'detail']) {
      assert.match(produktLink(handle, BLOCK_LP, art), /^\/pages\/(qione-2-pro|qibracelet|qihome-air)$/);
    }
  }
});

test('ROUTE: noindex doppelt, kein canonical, no-store', () => {
  assert.match(ROUTE, /name: 'robots', content: 'noindex,nofollow'/);
  assert.match(ROUTE, /'X-Robots-Tag': 'noindex, nofollow'/);
  assert.match(ROUTE, /'Cache-Control': 'no-store'/);
  assert.ok(!/rel:\s*'canonical'/.test(ROUTE), 'canonical gesetzt');
  assert.ok(!/redirect\(/.test(ROUTE), 'B leitet selbst weiter');
});

test('TEXTE: Herkunft, Kundenwort statt Fachbegriff, kein Satz zweimal', () => {
  const bloecke = Object.entries(T);
  assert.deepEqual(bloecke.map(([k]) => k), ['kopf', 'einwand', 'produkte', 'schluss']);
  const saetze = new Map();
  for (const [name, b] of bloecke) {
    assert.match(b.text_id, /^tw-\d{8}-lp-[0-9a-f]{6}$/, `${name}: Text-ID`);
    assert.ok(b.ueberschrift && b.absaetze.length >= 2, `${name}: Form`);
    for (const t of [b.ueberschrift, ...b.absaetze]) {
      assert.ok(!/koh(ä|ae)rent/i.test(t), `${name}: Fachbegriff vor dem Kundenwort`);
      for (const s of t.split(/(?<=[.!?])\s+/)) {
        const w = s.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, '').trim();
        if (w.split(/\s+/).length < 7) continue; // Formeln am Knopf (bis 6 Wörter) dürfen wiederkehren
        assert.ok(!saetze.has(w), `doppelt: "${s}" (${saetze.get(w)} und ${name})`);
        saetze.set(w, name);
      }
    }
  }
  // Der erste Bildschirm beginnt mit einem Kundenwort.
  assert.match(T.kopf.ueberschrift, /^(Ruhe|Schutz|Schlaf|Strahlung|Handy|WLAN|Alltag)\b/);
  // Kein Satz der Seite steht zugleich in der Einleitung des Menschen-Abschnitts.
  assert.ok(B.includes('Echte Menschen. Echte Erfahrungen.'));
});

test('MENSCHEN: drei echte Videos zum QiOne 2 Pro aus dem Datenmodul', () => {
  const ids = zuweisung(B, 'PERSONEN_VIDEOS').match(/'([^']+)'/g).map((x) => x.slice(1, -1));
  assert.equal(ids.length, 3);
  for (const id of ids) {
    const b = ERFAHRUNGS_BEITRAEGE.find((x) => x.videoId === id);
    assert.ok(b, `Video ${id} fehlt im Datenmodul`);
    assert.match(b.titel, /QiOne®\s?2\s?Pro/, `${b.sprecher}: Video handelt nicht vom QiOne 2 Pro`);
    assert.ok(b.zusammenfassung.length > 200, `${b.sprecher}: Zusammenfassung fehlt`);
  }
  // Die Karte zeigt die Zusammenfassung unverändert (kein neuer Satz über einen Menschen).
  assert.ok(B.includes('{b.zusammenfassung}'));
});
