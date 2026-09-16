/**
 * Hermetischer Test der Qi-Master-Kopfsymbole (node --test, ohne Bundler)
 * -- Hausmuster wie test/eu-gewaehrleistung.test.mjs.
 *
 * WAS HIER GEMESSEN WIRD UND WARUM GERADE DAS:
 *
 *  1. DIE SOLL-MACHART WIRD AUS DER VORLAGE GERECHNET, NICHT HINGESCHRIEBEN.
 *     Christians Anweisung lautet „Farbe und Stil wie unten bei ‚Ein Stück, kein
 *     Serienteil'" -- also ist die VORLAGE der Maßstab, nicht ein Literal in
 *     dieser Datei. Der Test liest die Symbole des Fertigung-Abschnitts aus
 *     QiMaster.jsx und leitet daraus ab, was stilkonform heißt.
 *     Das ist zugleich die POSITIVKONTROLLE, die der Auftrag verlangt: erkennt
 *     der Maßstab die Vorlage nicht als stilkonform, misst er den falschen Ort
 *     und der Test faellt -- statt die neuen Symbole falsch freizusprechen.
 *     UND ES IST DER GRUND, WARUM DER AUFTRAGSTEXT HIER NICHT WOERTLICH GILT:
 *     er nennt `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`. Die
 *     Seite hat davon nichts, auf 8 von 8 Symbolen, und hatte es nie. Ein
 *     Literal-Maßstab aus dem Auftragstext wäre an der Vorlage selbst rot.
 *
 *  2. KEINE FESTE FARBE. Ein Hexwert in der Zeichnung ist ab dem Tag falsch, an
 *     dem das Haus seinen Akzent wechselt, und es faellt niemandem auf.
 *
 *  3. DIE GENERIERTE DATEI DARF NICHT DRIFTEN. Die .svg sind die Quelle,
 *     app/lib/qi-master-symbole.generated.js ist abgeleitet. Ohne diesen Arm
 *     könnte die Seite etwas anderes zeigen als die Datei, die Christian
 *     ansieht -- und beide Seiten wären für sich stimmig.
 *
 *  4. DIE ZUORDNUNG TRIFFT ALLE VIER ZEILEN, UND ZWAR AN CHRISTIANS ECHTEM
 *     WORTLAUT. Der Restbericht `offen` ist die Zusage aus
 *     qi-master-kopfsymbole.js; hier wird sie gelesen. Ohne Leser wäre sie keine.
 *
 *  5. TRENNSCHAERFE. Die Diamant-Zeile trägt das Wort „Gitterchip™" ebenfalls.
 *     Dass keine Regel die falsche Zeile greift, ist der Arm, der bei einer
 *     spaeteren Umformulierung als Erstes faellt.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {
  ZUORDNUNG,
  symbolMarkup,
  kopfsymboleEinsetzen,
} from '../app/lib/qi-master-kopfsymbole.js';
import {QIMASTER_SYMBOL_PFADE} from '../app/lib/qi-master-symbole.generated.js';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const SYMBOL_DIR = join(WURZEL, 'app/assets/qi-master-symbole');
const QIMASTER_JSX = join(WURZEL, 'app/components/product-pages/QiMaster.jsx');

/** Christians Wortlaut, wie er am 2026-09-16 live im Shopify-Feld steht. */
const KOPFBLOCK_HTML = `<div class="qi-de">
<p class="p1">Das ultimative Wearable der Zukunft – Gitterchip™ der nächsten Generation</p>
<ul>
<li><b>"The One Eye" - Look</b></li>
<li><b>Zweiteiliger Gitterchip™</b></li>
<li><b>Hochreiner Natur Diamant eingelassen in den Gitterchip™</b></li>
<li><b>Alpha Charge - Limitiert auf 100 Stück</b></li>
</ul>
</div>`;

const svgDateien = () =>
  readdirSync(SYMBOL_DIR)
    .filter((f) => f.endsWith('.svg'))
    .sort();

/**
 * Die Machart der VORLAGE, zur Laufzeit aus QiMaster.jsx erhoben.
 * Bewusst nicht als Literal: waechst die Vorlage weiter, wandert der Maßstab mit.
 */
function vorlageMachart() {
  const quelle = readFileSync(QIMASTER_JSX, 'utf8');
  const ab = quelle.indexOf('function Fertigung(');
  assert.ok(ab > 0, 'Fertigung() nicht gefunden -- Vorlage-Abschnitt umbenannt?');
  const abschnitt = quelle.slice(ab);
  const svgs = abschnitt.match(/<svg[\s\S]*?<\/svg>/g) || [];
  assert.ok(
    svgs.length >= 4,
    `Vorlage-Abschnitt trägt nur ${svgs.length} Symbole -- erwartet mindestens 4`,
  );
  return {
    svgs,
    viewBox: '0 0 24 24',
    fuellung: 'currentColor',
  };
}

/** Der Maßstab selbst: trägt dieses SVG-Markup die Machart der Vorlage? */
function stilkonform(markup, machart) {
  const fehler = [];
  if (!new RegExp(`viewBox="${machart.viewBox}"`).test(markup))
    fehler.push(`viewBox != "${machart.viewBox}"`);
  const fills = markup.match(/fill="([^"]*)"/g) || [];
  if (fills.length !== 1) fehler.push(`${fills.length} fill-Attribute, erwartet 1`);
  else if (fills[0] !== `fill="${machart.fuellung}"`)
    fehler.push(`${fills[0]} statt fill="${machart.fuellung}"`);
  if (/\sstroke[a-z-]*=/.test(markup)) fehler.push('trägt ein stroke-Attribut');
  if ((markup.match(/<path/g) || []).length !== 1) fehler.push('nicht genau ein <path>');
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(markup)) fehler.push('trägt eine feste Farbe');
  return fehler;
}

test('POSITIVKONTROLLE: der Maßstab erkennt die Symbole der Vorlage als stilkonform', () => {
  const machart = vorlageMachart();
  for (const [i, svg] of machart.svgs.entries()) {
    assert.deepEqual(
      stilkonform(svg, machart),
      [],
      `Vorlage-Symbol ${i + 1} gilt dem Maßstab als NICHT stilkonform -- dann misst ` +
        `der Maßstab den falschen Ort, nicht das Symbol`,
    );
  }
});

test('GEGENKONTROLLE: der Maßstab weist eine Strichzeichnung und eine feste Farbe ab', () => {
  const machart = vorlageMachart();
  // Genau die Machart, die der Auftragstext verlangt -- sie ist hier der ROT-Fall.
  const strich =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16"/></svg>';
  assert.notDeepEqual(stilkonform(strich, machart), [], 'Strichzeichnung müsste auffallen');

  const hart = '<svg viewBox="0 0 24 24"><path fill="#f2bf72" d="M4 4h16Z"/></svg>';
  assert.notDeepEqual(stilkonform(hart, machart), [], 'feste Farbe müsste auffallen');

  const falscherRahmen = '<svg viewBox="0 0 48 48"><path fill="currentColor" d="M4 4h16Z"/></svg>';
  assert.notDeepEqual(stilkonform(falscherRahmen, machart), [], 'fremde viewBox müsste auffallen');
});

test('jede Symbol-Datei hält die Machart der Vorlage', () => {
  const machart = vorlageMachart();
  const dateien = svgDateien();
  assert.equal(
    dateien.length,
    5,
    `${dateien.length} Symbol-Dateien statt 5 — hier liegen nur die ausgelieferten. ` +
      `Die Gegenentwürfe gehören in den Postausgang, nicht in ein Produktionsverzeichnis.`,
  );
  for (const f of dateien) {
    const roh = readFileSync(join(SYMBOL_DIR, f), 'utf8');
    assert.deepEqual(stilkonform(roh, machart), [], `${f} hält die Machart nicht`);
  }
});

test('die vier Zeilen des Kopfblocks haben je ein eigenes Symbol', () => {
  const {html, gesetzt, offen} = kopfsymboleEinsetzen(KOPFBLOCK_HTML);
  assert.deepEqual(
    gesetzt,
    ['one-eye', 'gitterchip-zweiteilig', 'diamant-gefasst', 'alpha-charge'],
    'nicht alle vier Zeilen in Christians Reihenfolge getroffen',
  );
  assert.deepEqual(offen, [], `Zeilen ohne Symbol: ${offen.join(' | ')}`);
  assert.equal((html.match(/<svg/g) || []).length, 4, 'nicht genau vier Symbole gesetzt');
  // Der Text bleibt Wort für Wort unberuehrt -- er gehört einem anderen Auftrag.
  for (const zeile of [
    '"The One Eye" - Look',
    'Zweiteiliger Gitterchip™',
    'Hochreiner Natur Diamant eingelassen in den Gitterchip™',
    'Alpha Charge - Limitiert auf 100 Stück',
  ]) {
    assert.ok(html.includes(zeile), `Zeile verändert: ${zeile}`);
  }
});

test('TRENNSCHAERFE: keine Regel greift die Zeile einer anderen', () => {
  const zeilen = {
    '"The One Eye" - Look': 'one-eye',
    'Zweiteiliger Gitterchip™': 'gitterchip-zweiteilig',
    'Hochreiner Natur Diamant eingelassen in den Gitterchip™': 'diamant-gefasst',
    'Alpha Charge - Limitiert auf 100 Stück': 'alpha-charge',
  };
  for (const [text, erwartet] of Object.entries(zeilen)) {
    const treffer = ZUORDNUNG.filter((r) => r.erkennung.test(text));
    assert.equal(
      treffer.length,
      1,
      `„${text}" wird von ${treffer.length} Regeln erkannt (${treffer
        .map((t) => t.symbol)
        .join(', ')}) -- die Reihenfolge entscheidet dann still`,
    );
    assert.equal(treffer[0].symbol, erwartet, `„${text}" bekommt ${treffer[0].symbol}`);
  }
});

test('FAIL-SOFT: fremdes HTML bleibt unveraendert, und ein zweiter Lauf verdoppelt nichts', () => {
  const fremd = '<div><ul><li>Irgendeine andere Zeile</li></ul></div>';
  const a = kopfsymboleEinsetzen(fremd);
  assert.equal(a.html, fremd, 'fremdes HTML wurde angefasst');
  assert.deepEqual(a.gesetzt, []);
  assert.deepEqual(a.offen, ['Irgendeine andere Zeile'], 'Restbericht fehlt');

  const einmal = kopfsymboleEinsetzen(KOPFBLOCK_HTML).html;
  const zweimal = kopfsymboleEinsetzen(einmal).html;
  assert.equal(zweimal, einmal, 'zweiter Durchlauf setzt ein zweites Symbol');

  for (const leer of [null, undefined, '']) {
    assert.doesNotThrow(() => kopfsymboleEinsetzen(leer), `wirft bei ${String(leer)}`);
  }
});

test('das ausgelieferte Markup trägt keine feste Farbe und die Machart der Vorlage', () => {
  const machart = vorlageMachart();
  for (const name of Object.keys(QIMASTER_SYMBOL_PFADE)) {
    const markup = symbolMarkup(name);
    assert.deepEqual(stilkonform(markup, machart), [], `${name}: ausgeliefertes Markup`);
    assert.ok(markup.includes('aria-hidden="true"'), `${name}: nicht als dekorativ ausgezeichnet`);
  }
  assert.equal(symbolMarkup('gibt-es-nicht'), '', 'unbekannter Name muss leer bleiben');
});

test('die generierte Datei stimmt mit den SVG-Dateien ueberein', async () => {
  const {lesePfade, baueDatei, ZIEL} = await import('../bin/qimaster-symbole-gen.mjs');
  assert.equal(
    readFileSync(ZIEL, 'utf8'),
    baueDatei(lesePfade()),
    'app/lib/qi-master-symbole.generated.js weicht von app/assets/qi-master-symbole/*.svg ab ' +
      '-> node bin/qimaster-symbole-gen.mjs',
  );
});

test('die sechste Zeile der Nutzenliste steht zuletzt und ist wie ihre Nachbarn gesetzt', () => {
  const quelle = readFileSync(QIMASTER_JSX, 'utf8');
  const ab = quelle.indexOf('export function QiMasterBenefitList');
  assert.ok(ab > 0, 'QiMasterBenefitList nicht gefunden');
  const liste = quelle.slice(ab, quelle.indexOf('function MainFeatures', ab));

  assert.ok(
    /<b>0% Finanzierung<\/b> mit PayPal und Klarna/.test(liste),
    'Christians Wortlaut fehlt oder ist anders ausgezeichnet (fett ist NUR „0% Finanzierung")',
  );
  // „als letzten Punkt" (Christian): hinter dem Gewaehrleistungs-Slot.
  assert.ok(
    liste.indexOf('{zusatzPunkt}') < liste.indexOf('0% Finanzierung'),
    'die Finanzierungszeile steht vor der Gewaehrleistung statt dahinter',
  );
  // Gleiche Auszeichnung wie die Nachbarn: <b> um den vorderen Teil, kein eigener Stil.
  assert.ok(
    !/0% Finanzierung[\s\S]{0,80}(style=|className=)/.test(liste),
    'die neue Zeile trägt eigenen Stil -- kein Element ist wichtiger als seine Nachbarn',
  );
  assert.ok(
    liste.includes("QIMASTER_SYMBOL_PFADE['finanzierung-null']"),
    'die Zeile zeichnet ihr Symbol nicht aus der gemeinsamen Quelle',
  );
});
