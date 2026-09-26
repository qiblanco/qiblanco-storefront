/**
 * Hermetischer Test: DER STEUERSATZ FOLGT DEM MARKT, NICHT DER WAEHRUNG
 * (node --test test/markt-steuersatz.test.mjs).
 *
 * ANLASS (Job 20260913-at-paketkarte-rechnet-19-prozent-kasse-nimmt-20-prio8).
 * Die Paketkarte /pages/exclusive-solutions nannte im oesterreichischen Markt
 * dieselben Betraege wie im deutschen, waehrend die Kasse mehr verlangte.
 * Gemessen am Kundenrand am 2026-09-13 (`runningTotal` der Kassenseite gegen
 * die Netto-Zwischensumme, je Fall zwei Zeugen):
 *
 *     AT  Fundament     Karte  6.756   Kasse  6.814,24   +58,24
 *     AT  Unabhängig    Karte  9.242   Kasse  9.318,60   +76,60
 *     AT  Residenz      Karte 17.397   Kasse 17.543,22  +146,22
 *
 * (Die Rabattcodes zu diesen drei Paketen stehen in app/lib/markt-pricing.js;
 * hier stehen die Paketnamen, damit die Tabelle ohne einen zweiten Blick
 * lesbar ist.)
 *
 * Ursache war eine Achse zu wenig: `anzeigeSatz` entschied den Satz allein an
 * der WAEHRUNG, und AT ist ein EUR-Markt. Der Kunde zahlte nicht zu viel --
 * die Kasse war die ganze Zeit richtig; die ANZEIGE nannte zu wenig.
 *
 * DREI ACHSEN, GETRENNT GEPRUEFT:
 *  (A) RECHNET der Kanon je Markt richtig?     -> Betragstests unten
 *  (B) UNTERSCHEIDET er die Maerkte ueberhaupt? -> Negativ-Kontrolle unten
 *  (C) FRAGT ihn auch jeder Aufrufer MIT Markt? -> Aufrufer-Deckung unten
 *
 * (C) ist die Achse, die hier den Schaden getragen hat, und sie ist die
 * einzige, die ein Vorgabewert unsichtbar machen kann: `taxRateForHandle`
 * faellt ohne Land fail-closed auf DE zurück. Das ist richtig gebaut (eine
 * leere Preisanzeige wäre schlimmer) und genau deshalb von einem Defekt
 * nicht zu unterscheiden, solange niemand die Aufrufer zählt. Die Bauform
 * ist aus test/preis-eine-quelle.test.mjs (B) uebernommen, nicht neu erfunden
 * -- dort hat dieselbe Frage schon einmal einen Preisfehler gefangen.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

import {anzeigeSatz, bruttoAnzeige, ganzEuroAnzeige} from '../app/lib/markt-pricing.js';
import {
  taxRateForHandle,
  getCartLineGrossDisplayTotalExact,
  STEUER_LAENDER,
  STEUER_LAND_DEFAULT,
} from '../app/lib/cart-display-pricing.js';

/* Netto-Betraege und Steuerbetraege der Kassenseite, gemessen 2026-09-13
   (mess/satz_de_at.json bzw. mess/VORHER_de_at.json im Jobordner). Sie stehen
   hier als EINGABE und als der Betrag, den die Kasse WIRKLICH belastet -- nicht
   als gewuenschtes Ergebnis. */
const FAELLE = [
  // handle,               netto,      land, Steuer der Kasse, erwartete Anzeige
  // AT seit 2026-09-26 AUFgerundet (markt-pricing.js, ganzEuroAnzeige; Job
  // 20260926-at-kakao-einzelpackung-78-beworben-kasse-78-13-beide-laeden):
  // 1096 / 78 / 6814 lagen je unter der Kasse (1096,14 / 78,13 / 6814,24).
  ['qione-2-pro',          '913.45',   'DE', '173.56', 1087],
  ['qione-2-pro',          '913.45',   'AT', '182.69', 1097],
  ['crystal-cacao-awake',  '71.03',    'DE', '4.97',     76],
  ['crystal-cacao-awake',  '71.03',    'AT', '7.10',     79],
  // Der Anlassfall: Netto des Fundament-Pakets nach Rabatt.
  ['qione-2-pro',          '5678.53',  'DE', '1078.92', 6757],
  ['qione-2-pro',          '5678.53',  'AT', '1135.71', 6815],
];

test('(A) die Anzeige trifft den Betrag, den die Kasse belastet -- je Markt', () => {
  for (const [handle, netto, land, steuer, erwartet] of FAELLE) {
    const anzeige = bruttoAnzeige(netto, handle, 'EUR', land);
    assert.equal(
      anzeige,
      erwartet,
      `${land}/${handle} netto ${netto} -> erwartet ${erwartet}, war ${anzeige}`,
    );
    // Die eigentliche Zusage: die Anzeige liegt unter einer Waehrungseinheit
    // neben dem gemessenen Kassenbetrag. Die Karte nennt ganze Euro, die Kasse
    // rechnet in Cent -- darunter ist Rundung, darueber ist ein Defekt.
    const kasse = Number(netto) + Number(steuer);
    assert.ok(
      Math.abs(anzeige - kasse) < 1,
      `${land}/${handle}: Anzeige ${anzeige} gegen Kasse ${kasse.toFixed(2)} ` +
        `-- Abstand ${Math.abs(anzeige - kasse).toFixed(2)} >= 1,00`,
    );
  }
});

test('(A) beide Steuerklassen haben je Markt ihren gemessenen Satz', () => {
  assert.equal(taxRateForHandle('qione-2-pro', 'DE'), 0.19);
  assert.equal(taxRateForHandle('qione-2-pro', 'AT'), 0.2);
  assert.equal(taxRateForHandle('crystal-cacao-awake', 'DE'), 0.07);
  assert.equal(taxRateForHandle('crystal-cacao-awake', 'AT'), 0.1);
});

test('(A) fehlendes oder unbekanntes Land faellt auf den Status quo zurück', () => {
  for (const land of [undefined, null, '', 'XX', 'ZZ']) {
    assert.equal(
      taxRateForHandle('qione-2-pro', land),
      taxRateForHandle('qione-2-pro', STEUER_LAND_DEFAULT),
      `Land ${JSON.stringify(land)} muss den Vorgabesatz liefern`,
    );
  }
  assert.ok(
    STEUER_LAENDER.includes(STEUER_LAND_DEFAULT),
    'der Vorgabewert muss selbst in der Tabelle stehen',
  );
  // Kleinschreibung darf nicht am Vorgabewert landen, sondern am richtigen Satz.
  assert.equal(taxRateForHandle('qione-2-pro', 'at'), 0.2);
});

test('(A) Nicht-EUR bleibt Endbetrag -- das Land aendert daran nichts', () => {
  for (const land of ['DE', 'AT', 'CH', 'US']) {
    assert.equal(anzeigeSatz('qione-2-pro', 'CHF', land), 0);
    assert.equal(anzeigeSatz('crystal-cacao-awake', 'USD', land), 0);
  }
  assert.equal(bruttoAnzeige('1048.00', 'qione-2-pro', 'CHF', 'CH'), 1048);
});

test('(A) der Warenkorb rechnet denselben Satz wie die Seite davor', () => {
  // Der Warenkorb ist der letzte Ort vor der Kasse. Rechnete er weiter mit 19 %,
  // stiege der Betrag dem AT-Kunden erst im Checkout -- also genau dort, wo er
  // nichts mehr vergleichen kann.
  const zeile = (handle, netto) => ({
    quantity: 1,
    merchandise: {product: {handle}},
    cost: {totalAmount: {amount: netto, currencyCode: 'EUR'}},
  });
  assert.equal(getCartLineGrossDisplayTotalExact(zeile('qione-2-pro', '913.45'), 'DE'), 1087.01);
  assert.equal(getCartLineGrossDisplayTotalExact(zeile('qione-2-pro', '913.45'), 'AT'), 1096.14);
  // 1096,14 ist der Betrag, den die AT-Kasse am 2026-09-13 belastet hat
  // (netto 913,45 + Steuer 182,69) -- cent-genau, nicht ungefaehr.
  assert.equal(getCartLineGrossDisplayTotalExact(zeile('crystal-cacao-awake', '71.03'), 'AT'), 78.13);
  // Fremdwaehrung bleibt Endbetrag, auch mit Land.
  const chf = {
    quantity: 1,
    merchandise: {product: {handle: 'qione-2-pro'}},
    cost: {totalAmount: {amount: '1048.00', currencyCode: 'CHF'}},
  };
  assert.equal(getCartLineGrossDisplayTotalExact(chf, 'AT'), 1048);
});

/* ─────────────────────────────────────────────────────────────────────────
   (B) NEGATIV-KONTROLLE: der Test muss ROT werden können.

   Ein Test, der nur bestaetigt, dass 20 % gerechnet wird, bleibt auch dann
   gruen, wenn jemand DE ebenfalls auf 20 % stellt -- dann ist der Defekt
   zurück, nur in die andere Richtung. Geprueft wird deshalb der
   UNTERSCHIED: zwei EUR-Maerkte müssen für dieselbe Ware und denselben
   Nettobetrag verschiedene Zahlen ergeben. Faellt die Markt-Achse weg (jemand
   entfernt den Parameter, benennt das Feld um, oder `anzeigeSatz` ignoriert
   ihn wieder), wird genau dieser Arm rot -- und zwar als einziger.
   ────────────────────────────────────────────────────────────────────── */
test('(B) zwei EUR-Maerkte duerfen nicht dieselbe Zahl ergeben', () => {
  const de = bruttoAnzeige('5678.53', 'qione-2-pro', 'EUR', 'DE');
  const at = bruttoAnzeige('5678.53', 'qione-2-pro', 'EUR', 'AT');
  assert.notEqual(
    de,
    at,
    'DE und AT rechnen wieder dieselbe Zahl -- die Markt-Achse ist wirkungslos',
  );
  // Und der Anlassfall namentlich: 6.756 war die Zahl, die AT NIE haette
  // zeigen duerfen (die Kasse verlangte 6.814,24).
  assert.notEqual(at, 6756, 'AT zeigt wieder den deutschen Paketpreis');
  assert.ok(at > de, 'AT führt den hoeheren Satz, also die hoehere Anzeige');
});

/* ─────────────────────────────────────────────────────────────────────────
   (C) AUFRUFER-DECKUNG: jeder Aufruf des Kanons nennt sein Markt-Land.

   Gemessen wird die EIGENSCHAFT (Aufruf einer Kanon-Funktion mit zu wenigen
   Argumenten), nicht eine Datei-Liste: eine Liste wäre ein zweiter,
   unbewachter Enforcer und genau die Bauform, an der diese Klasse hier schon
   durchgerutscht ist.

   DECKUNGSGRENZE, BENANNT STATT VERSCHWIEGEN: dieser Arm liest Quelltext, also
   sieht er einen Aufruf, dessen Land-Argument zur LAUFZEIT `undefined` ist,
   NICHT. Dass der Wert wirklich ankommt, misst allein der Kundenrand
   (werkzeug/abnahme_karte_gegen_korb.py --markt AT und die preiswatch-Wache).
   Jeder Lauf druckt, was er NICHT beurteilt hat -- ohne diesen Restbericht
   wäre die Auswahl eine stille Behauptung über Vollstaendigkeit.
   ────────────────────────────────────────────────────────────────────── */

// Kanon-Funktion -> Zahl der Argumente, ab der ein Markt dabei ist.
const MINDEST_ARGUMENTE = {
  anzeigeSatz: 3,
  bruttoAnzeige: 4,
  taxRateForHandle: 2,
  getCartLineTaxRate: 2,
  getCartLineGrossDisplayTotal: 2,
  getCartLineGrossDisplayTotalExact: 2,
  getCartLinePriceDisplay: 2,
  getCartLinePriceDisplayExact: 2,
  // MITTELBARER KONSUMENT, und er ist der Grund, warum diese Liste nicht bei
  // den vier Kanon-Funktionen endet: `produktSchema` rechnet den Bruttopreis
  // über `bruttoAnzeige`, gibt also einen Markt weiter, den es selbst
  // bekommen muss. Am 2026-09-13 war genau dieser Aufrufer der eine, den die
  // erste Fassung dieses Arms nicht sah -- die Produkt-Auszeichnung zeichnete
  // in AT den deutschen Preis aus, waehrend die Seite darunter schon den
  // richtigen zeigte. Gefunden hat ihn nicht dieser Test, sondern die Messung
  // am lokalen Produktionsbundle; deshalb steht er jetzt hier.
  produktSchema: 2,
};

// Die Dateien, die den Kanon DEFINIEREN. Kein Ortszaun, sondern der
// Pruefgegenstand selbst: dort stehen die Signaturen und die internen Aufrufe,
// die ihr Land per Parameter durchreichen.
const KANON_DATEIEN = new Set([
  'app/lib/markt-pricing.js',
  'app/lib/cart-display-pricing.js',
  'app/lib/produkt-schema.js',
]);

function quellDateien(wurzel) {
  const raus = [];
  for (const e of readdirSync(wurzel)) {
    const p = join(wurzel, e);
    if (statSync(p).isDirectory()) raus.push(...quellDateien(p));
    else if (/\.(jsx?|mjs)$/.test(e)) raus.push(p);
  }
  return raus;
}

/** Argumente eines Aufrufs -- klammerbalanciert, damit `f(g(a,b), c)` als 2 zählt. */
function argumente(quelle, ab) {
  let tiefe = 0;
  let puffer = '';
  const teile = [];
  for (let i = ab; i < quelle.length; i += 1) {
    const z = quelle[i];
    if (z === '(' || z === '[' || z === '{') tiefe += 1;
    if (z === ')' || z === ']' || z === '}') {
      tiefe -= 1;
      if (tiefe === 0) {
        if (puffer.trim()) teile.push(puffer.trim());
        return teile;
      }
    }
    if (z === ',' && tiefe === 1) {
      teile.push(puffer.trim());
      puffer = '';
      continue;
    }
    if (tiefe >= 1 && !(tiefe === 1 && z === '(' && i === ab)) puffer += z;
  }
  return null; // unbalanciert -> kein Urteil
}

/** Kommentare weg, damit ein Beispiel im Fliesstext kein Befund wird. */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

test('(C) jeder Aufruf des Steuer-Kanons gibt ein Markt-Land mit', () => {
  const wurzel = new URL('../app', import.meta.url).pathname;
  const repo = new URL('..', import.meta.url).pathname;
  const blind = [];
  const rest = [];
  let geprueft = 0;

  for (const datei of quellDateien(wurzel)) {
    const rel = datei.slice(repo.length);
    if (KANON_DATEIEN.has(rel)) {
      rest.push(`${rel}: Kanon-Definition selbst (Pruefgegenstand, kein Aufrufer)`);
      continue;
    }
    const quelle = ohneKommentare(readFileSync(datei, 'utf8'));
    for (const [name, mindest] of Object.entries(MINDEST_ARGUMENTE)) {
      const re = new RegExp(`\\b${name}\\s*\\(`, 'g');
      let m;
      while ((m = re.exec(quelle)) !== null) {
        const auf = quelle.indexOf('(', m.index);
        const args = argumente(quelle, auf);
        if (args === null) {
          rest.push(`${rel}: ${name}( -- Klammern unbalanciert, kein Urteil`);
          continue;
        }
        geprueft += 1;
        if (args.length < mindest) {
          blind.push(`${rel}: ${name}(${args.join(', ')}) -- ${args.length} statt ${mindest} Argumente`);
        }
      }
    }
  }

  // SELBSTPRUEFUNG GEGEN DAUERHAFTE NULLZAEHLUNG: findet dieser Arm keinen
  // Aufruf mehr, ist er blind geworden und nicht der Baum sauber.
  //
  // Die Zahl ist eine UNTERGRENZE und bewusst KEINE Zaehlung des Bestands: am
  // 2026-09-13 waren es 9 Aufrufe, und ein Vertrag auf 9 wäre beim nächsten
  // Preisbaustein falsch-rot (Hausregel: ein Verify-Vertrag pinnt nie einen
  // wachsenden Zaehler). 6 liegt deutlich unter dem Bestand und deutlich über
  // dem Zustand, den dieser Arm fangen soll -- naemlich dass das Suchmuster
  // ins Leere greift, weil jemand die Kanon-Funktionen umbenannt hat.
  assert.ok(
    geprueft >= 6,
    `nur ${geprueft} Kanon-Aufrufe gefunden -- sucht dieser Arm noch richtig?`,
  );
  if (rest.length) console.log('[REST] nicht beurteilt:\n  ' + rest.join('\n  '));
  assert.deepEqual(blind, [], `Aufrufe ohne Markt-Land:\n  ${blind.join('\n  ')}`);
});

test('(C) der Markt kommt aus einer Quelle, nicht aus einem zweiten Schluss', () => {
  const repo = new URL('..', import.meta.url).pathname;
  const root = readFileSync(join(repo, 'app/root.jsx'), 'utf8');
  assert.match(
    root,
    /marktLand:\s*storefront\.i18n\.country/,
    'der root-Loader muss das aufgeloeste Markt-Land ausliefern',
  );
  const land = readFileSync(join(repo, 'app/lib/markt-land.js'), 'utf8');
  assert.match(land, /useRouteLoaderData\('root'\)/, 'der Hook liest die root-Daten');
  // Kein Framework-Import im node-pruefbaren Kanon (Begründung im Kopf von
  // markt-pricing.js): sonst ist genau dieser Test nicht mehr fahrbar.
  const kanon = readFileSync(join(repo, 'app/lib/markt-pricing.js'), 'utf8');
  assert.ok(
    !/from '(react|react-router|@shopify\/hydrogen)/.test(kanon),
    'markt-pricing.js muss frei von Framework-Importen bleiben',
  );
});

test('(C) jeder produktMeta-Aufruf nennt sein Markt-Land', () => {
  // `produktMeta` nimmt EIN Objekt, also zählt der Argument-Arm oben hier
  // nicht. Geprueft wird deshalb das Feld. Sieben Flaggschiff-Routen laufen
  // hierueber und tragen die Produkt-Auszeichnung -- dieselbe Zahl, die Google
  // mit der sichtbaren Seite vergleicht.
  const wurzel = new URL('../app/routes', import.meta.url).pathname;
  const repo = new URL('..', import.meta.url).pathname;
  const blind = [];
  let gefunden = 0;
  for (const datei of quellDateien(wurzel)) {
    const quelle = ohneKommentare(readFileSync(datei, 'utf8'));
    const re = /produktMeta\s*\(/g;
    let m;
    while ((m = re.exec(quelle)) !== null) {
      const args = argumente(quelle, quelle.indexOf('(', m.index));
      if (args === null) continue;
      gefunden += 1;
      if (!args.some((a) => /\bmarktLand\b/.test(a))) {
        blind.push(datei.slice(repo.length));
      }
    }
  }
  assert.ok(gefunden >= 5, `nur ${gefunden} produktMeta-Aufrufe gefunden`);
  assert.deepEqual(blind, [], `produktMeta ohne Markt-Land: ${blind.join(', ')}`);
});

/* GANZ-EURO-REGEL JE LAND (Job 20260926-at-kakao-einzelpackung-78-beworben-
   kasse-78-13-beide-laeden): in AT nannte die Kakao-Kaufseite 78 für eine
   Packung, die Kasse nahm 78,13. Zwei Hälften, beide Pflicht: AT rundet AUF
   (nie unter der Kasse), DE bleibt kaufmännisch (sonst QiOne 1.088 statt 1.087
   und Kakao-Staffel 3x 54 statt 53). */
test('AT: aufgerundet, nie unter der Kasse', () => {
  // [netto, Satz, Kasse (Cent), erwartete Anzeige]
  const faelle = [
    [71.03, 0.1, 78.13, 79], // Kakao 1x
    [(71.03 * 2 - 28.04) / 2, 0.1, 62.71, 63], // Kasse je Packung 2x
    [913.45, 0.2, 1096.14, 1097], // QiOne 2 Pro
  ];
  for (const [netto, satz, kasse, soll] of faelle) {
    const ist = ganzEuroAnzeige(netto * (1 + satz), 'AT');
    assert.equal(ist, soll, `${netto} x ${1 + satz}`);
    assert.ok(ist >= kasse, `${ist} < Kasse ${kasse}`);
  }
  assert.equal(bruttoAnzeige('71.03', 'crystal-cacao-awake', 'EUR', 'AT'), 79);
});

test('glatter Betrag bleibt glatt, auch aufgerundet', () => {
  // 71,03 x 1,07 = 76,0021 -- auf Cent 76,00, also 76 und nicht 77
  assert.equal(ganzEuroAnzeige(71.03 * 1.07, 'AT'), 76);
  assert.equal(ganzEuroAnzeige(71, 'CH'), 71);
  assert.equal(ganzEuroAnzeige(99, 'US'), 99);
});

test('DE bleibt kaufmännisch gerundet (Gegenrichtung)', () => {
  assert.equal(ganzEuroAnzeige(913.45 * 1.19, 'DE'), 1087);
  assert.equal(ganzEuroAnzeige((71.03 - 21.3) * 1.07, 'DE'), 53);
  assert.equal(ganzEuroAnzeige(71.03 * 1.07, 'DE'), 76);
  // ohne Land = DE (fail-closed wie taxRateForHandle)
  assert.equal(ganzEuroAnzeige(913.45 * 1.19), 1087);
  assert.equal(bruttoAnzeige('71.03', 'crystal-cacao-awake', 'EUR', 'DE'), 76);
  assert.equal(bruttoAnzeige('913.45', 'qione-2-pro', 'EUR'), 1087);
});
