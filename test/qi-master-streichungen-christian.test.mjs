/**
 * Wächter: CHRISTIAN 2026-09-28 ERSATZLOS GESTRICHEN (node --test, ohne Bundler)
 * -- Job 20260928-update-qimaster-seite-streichungen-christian.
 *
 * Christian am 2026-09-28 über die Qi-Master-Seite, wörtlich:
 *   „ersatzlos löschen auf Qi Master Seite: Gemessen — Darmepithelzellen
 *    behielten ihre Barrierefunktion rund zwölfmal besser … [8] / Menschliche
 *    Immunzellen … zu 84,7 statt 60,5 Prozent des Kontrollwerts. [9] / Beide
 *    Male lagen die Zellen vier Stunden lang auf einem sendenden Smartphone …"
 *   „die Verlinkung ist auch sehr irreführend: ‚Alle Bewertungen lesen' bitte
 *    ersatzlos löschen"
 * Den Link hat Christian am selben Abend für ALLE Seiten gestrichen
 * (CHRISTIAN 2026-09-28 KEIN WEGLINK); die seitenweite Sperre dafür ist
 * hb-deploy Gate 23 (bin/weglink-sperre). Hier steht nur der Qi-Master-Teil.
 *
 * WARUM EIN TEST UND NICHT NUR EIN KOMMENTAR: dieselben Werte hat Christian
 * schon am 2026-09-17 gestrichen, und am 2026-09-26 hat ein AI-CEO-Entscheid
 * sie zurückgeholt (PR #645) -- der Dateikopf sagte danach „Die Werte nicht
 * wieder entfernen". Ein Kommentar hält keinen Maschinenentscheid auf. Dieser
 * Test läuft in `hb-deploy check` (Gate „suite", test/*.test.mjs) und blockt
 * jeden PR, der den Block oder den Link auf die Qi-Master-Seite zurückbringt.
 * Aufheben kann das nur Christian; wer diesen Test löscht oder lockert, hebt
 * eine Christian-Entscheidung auf.
 *
 * GEMESSEN WIRD DER QUELLTEXT OHNE KOMMENTARE: die Kommentare zitieren die
 * gestrichenen Sätze absichtlich (als Protokoll der Entscheidung). Gezählt
 * wird nur, was gerendert werden kann.
 *
 * ROT VOR GRÜN: QM_STREICH_WURZEL=<Checkout von 803d328> node --test <diese
 * Datei> muss rot sein (dort stehen Block und Link noch).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const WURZEL =
  process.env.QM_STREICH_WURZEL || join(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = 'CHRISTIAN 2026-09-28 ERSATZLOS GESTRICHEN';

// Die drei gestrichenen Sätze, je an einer Stelle, die nur sie tragen.
const SAETZE = [
  /zw(ö|oe)lfmal besser/,
  /Sauerstoffradikale zu bilden, zu 84,7/,
  /vier Stunden lang auf einem sendenden Smartphone/,
];

const lies = (rel) => readFileSync(join(WURZEL, rel), 'utf8');

/** Quelltext ohne Block- und Zeilenkommentare (auch JSX-{/* *\/}). */
function ohneKommentare(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .split('\n')
    .filter((z) => !z.trim().startsWith('//'))
    .join('\n');
}

/** Alle Dateien unter app/, deren Name die Qi-Master-Seite trägt. */
function qiMasterDateien() {
  const out = [];
  const lauf = (dir) => {
    for (const n of readdirSync(dir)) {
      const p = join(dir, n);
      if (statSync(p).isDirectory()) lauf(p);
      else if (/qi-?master/i.test(n) && /\.(jsx?|json)$/.test(n)) out.push(p);
    }
  };
  lauf(join(WURZEL, 'app'));
  return out;
}

test('Qi-Master-Quellen: keiner der drei gestrichenen Sätze ist renderbar', () => {
  const dateien = qiMasterDateien();
  // Positivkontrolle: ohne die beiden Kerndateien misst der Test den falschen Ort.
  const namen = dateien.map((p) => relative(WURZEL, p));
  assert.ok(namen.includes('app/data/qi-master-texte.js'), 'qi-master-texte.js fehlt im Suchraum');
  assert.ok(
    namen.includes('app/components/product-pages/QiMaster.jsx'),
    'QiMaster.jsx fehlt im Suchraum',
  );
  const funde = [];
  for (const p of dateien) {
    const code = ohneKommentare(readFileSync(p, 'utf8'));
    for (const re of SAETZE) if (re.test(code)) funde.push(`${relative(WURZEL, p)}: ${re}`);
  }
  assert.deepEqual(funde, [], `gestrichene Sätze wieder im Code: ${funde.join('; ')}`);
});

test('Zellwerte-Block: kein Export, kein Render (qm-zellwerte)', () => {
  const texte = ohneKommentare(lies('app/data/qi-master-texte.js'));
  const qm = ohneKommentare(lies('app/components/product-pages/QiMaster.jsx'));
  assert.doesNotMatch(texte, /QIMASTER_ZELLWERTE/, 'Export QIMASTER_ZELLWERTE ist zurück');
  assert.doesNotMatch(qm, /QIMASTER_ZELLWERTE/, 'QiMaster.jsx liest QIMASTER_ZELLWERTE');
  assert.doesNotMatch(qm, /qm-zellwerte/, 'QiMaster.jsx rendert data-block="qm-zellwerte"');
  // Positivkontrolle: der Abschnitt selbst bleibt (nur der Werteblock ging).
  assert.match(qm, /<StudienCards headline="Publizierte Zellstudien zum Gitterchip™"/);
});

test('Quellen [8]/[9] zeigen nicht ins Leere', () => {
  const texte = ohneKommentare(lies('app/data/qi-master-texte.js'));
  for (const n of ['8', '9']) {
    const zitiert = new RegExp(`\\[${n}\\]`).test(texte.replace(/'\[\d\][^']*'/g, ''));
    const gelistet = new RegExp(`'\\[${n}\\] `).test(texte);
    assert.equal(gelistet, zitiert, `[${n}]: gelistet=${gelistet}, im Text zitiert=${zitiert}`);
  }
});

test('Sperre steht im Quelltext-Kopf beider Dateien', () => {
  for (const rel of [
    'app/data/qi-master-texte.js',
    'app/components/product-pages/QiMaster.jsx',
  ]) {
    const s = lies(rel);
    assert.ok(s.includes(MARKER), `${rel}: Marker fehlt`);
    // Der aufgehobene Satz vom 26.09. stand als Anweisung da („… entfernen,
    // und sie nicht zurück …"); zitiert werden darf er, gelten nicht.
    assert.doesNotMatch(s, /Die Werte nicht wieder\s+(\*\s+)?entfernen,/,
      `${rel}: der aufgehobene Satz „Die Werte nicht wieder entfernen" steht noch als Anweisung`);
  }
});

test('„Alle Bewertungen lesen": QiMaster.jsx rendert den Link nicht selbst', () => {
  // Seitenweit ist der Link seit CHRISTIAN 2026-09-28 KEIN WEGLINK auf ALLEN
  // Seiten gestrichen; das trägt hb-deploy Gate 23 (bin/weglink-sperre) über
  // den ganzen Baum. Dieser Arm hält nur die Qi-Master-Datei selbst fest.
  const qm = ohneKommentare(lies('app/components/product-pages/QiMaster.jsx'));
  assert.doesNotMatch(qm, /AlleBewertungenLink|Alle Bewertungen lesen|\/pages\/bewertungen/,
    'QiMaster.jsx rendert den Link oder den Weg auf /pages/bewertungen');
});
