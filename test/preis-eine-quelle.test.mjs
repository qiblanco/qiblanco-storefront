/**
 * Hermetischer Test: EIN Preis, EINE Quelle (node --test, ohne Bundler).
 * Ausfuehren: node --test test/preis-eine-quelle.test.mjs
 *
 * ANLASS (Job 20260910-REPAIR-qiblanco-dieselbe-ware-kostet-gleichzeitig-53-
 * und-85-euro): für DIESELBE Ware — Crystal Cacao Create, 420 g, SKU 6666 —
 * zeigte qiblanco.com am 2026-09-09 gleichzeitig
 *   /products/crystal-cacao-create      76,- €   (1x-Zeile)
 *   /products/crystal-cacao-adfiefiale  85,- €
 *   /collections/zeremonie-kakao        €71.03
 * waehrend die Kasse 76,00 € bzw. 44,08 € belastete.
 *
 * ZWEI ACHSEN, DIE HIER GETRENNT GEPRUEFT WERDEN:
 *  (A) RECHNET der Kanon richtig?  -> Betragstest unten
 *  (B) FRAGT ihn auch jeder Aufrufer? -> Aufrufer-Zaehlung unten
 * (A) allein war schon immer gruen: `cart-display-pricing.js` kannte den
 * 7-%-Satz für die Dublette seit dem 2026-07-29 (PR #144). Rot war
 * ausschließlich (B) — die Kaufseite hat nie gefragt. Ein Test nur auf (A)
 * haette den Defekt an keinem Tag gesehen.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

import {anzeigeSatz, bruttoAnzeige, formatPreis} from '../app/lib/markt-pricing.js';
import {taxRateForHandle} from '../app/lib/cart-display-pricing.js';

// Netto-Beträge aus der Storefront-API, gemessen 2026-09-09. Sie stehen hier
// als EINGABE der Rechnung, nicht als erwarteter Preis — wächst der Katalog,
// fällt dieser Test nicht falsch-rot, weil er keinen Katalog-Umfang pinnt.
const NETTO_PACKUNG = '71.03';
const NETTO_QIONE = '913.45';

test('(A) dieselbe Ware, derselbe Satz — egal unter welchem Handle', () => {
  // create und adfiefiale sind SKU 6666, 420 g, identische Ware.
  for (const h of ['crystal-cacao-create', 'crystal-cacao-adfiefiale']) {
    assert.equal(taxRateForHandle(h), 0.07, `${h} muss den Lebensmittelsatz tragen`);
    assert.equal(bruttoAnzeige(NETTO_PACKUNG, h, 'EUR'), 76, `${h} -> 76`);
  }
  // Der Anlassfall in einer Zeile: der Regelsatz erzeugt genau die 85.
  assert.equal(Math.round(Number(NETTO_PACKUNG) * 1.19), 85);
  assert.notEqual(bruttoAnzeige(NETTO_PACKUNG, 'crystal-cacao-adfiefiale', 'EUR'), 85);
});

test('(A) der Regelsatz bleibt für Nicht-Lebensmittel unangetastet', () => {
  assert.equal(taxRateForHandle('qione-2-pro'), 0.19);
  assert.equal(bruttoAnzeige(NETTO_QIONE, 'qione-2-pro', 'EUR'), 1087);
  // Unbekanntes Handle -> Regelsatz (fail-safe in die teurere Richtung).
  assert.equal(taxRateForHandle('gibt-es-nicht'), 0.19);
});

test('(A) Nicht-EUR-Maerkte liefern den Endbetrag, keine deutsche Steuer', () => {
  assert.equal(anzeigeSatz('crystal-cacao-create', 'CHF'), 0);
  assert.equal(bruttoAnzeige('72.00', 'crystal-cacao-create', 'CHF'), 72);
});

test('(A) das Anzeigeformat ist deutsch, nie das rohe US-Format', () => {
  const txt = formatPreis(bruttoAnzeige(NETTO_PACKUNG, 'crystal-cacao-create', 'EUR'), 'EUR', 'lp');
  assert.equal(txt, '76 €');
  assert.equal(formatPreis(1087, 'EUR', 'pdp'), '1.087,- €');
  // Genau die Schreibweise, die der Preis-Waechter nicht sehen kann:
  assert.ok(!/€\d/.test(txt), `US-Format "€76" darf nie entstehen, war: ${txt}`);
});

/* ─────────────────────────────────────────────────────────────────────────
   (B) DIE AUFRUFER-ACHSE.

   Die Abdeckung wird GEZAEHLT, nicht aufgeschrieben: der Baum wird abgesucht,
   jeder gefundene <ProductPrice ...> ist ein Kandidat. Eine Datei-Liste in
   dieser Datei wäre ein zweiter, unbewachter Enforcer — genau die Bauform,
   an der die Klasse hier schon einmal durchgerutscht ist.

   ZULAESSIG ist genau zweierlei:
     handle={...}   -> der Satz kommt aus dem Kanon (Regelfall, Kaufseiten)
     taxRate={...}  -> ausdrueckliche Ausnahme (Warenkorb: schon brutto)
   Wer beides weglaesst, rechnet wieder still mit 19 %.
   ────────────────────────────────────────────────────────────────────── */
function jsxDateien(wurzel) {
  const raus = [];
  for (const e of readdirSync(wurzel)) {
    const p = join(wurzel, e);
    if (statSync(p).isDirectory()) raus.push(...jsxDateien(p));
    else if (e.endsWith('.jsx')) raus.push(p);
  }
  return raus;
}

function produktPreisAufrufe(quelle) {
  // Props-Block eines Aufrufs: ab '<ProductPrice' bis zum schliessenden '/>'.
  return [...quelle.matchAll(/<ProductPrice\b([\s\S]*?)\/>/g)].map((m) => m[1]);
}

test('(B) jeder ProductPrice-Aufruf nennt seine Steuersatz-Quelle', () => {
  const dateien = jsxDateien(new URL('../app', import.meta.url).pathname);
  const blind = [];
  let gesamt = 0;
  for (const datei of dateien) {
    const quelle = readFileSync(datei, 'utf8');
    if (datei.endsWith('ProductPrice.jsx')) continue; // die Definition selbst
    for (const props of produktPreisAufrufe(quelle)) {
      gesamt++;
      if (!/\bhandle=/.test(props) && !/\btaxRate=/.test(props)) blind.push(datei);
    }
  }
  assert.ok(gesamt >= 9, `zu wenige Aufrufe gefunden (${gesamt}) — sucht der Test noch richtig?`);
  assert.deepEqual(blind, [], `Aufrufe ohne Steuersatz-Quelle: ${blind.join(', ')}`);
});

test('(B) auf Kachel- und Suchflaechen steht kein roher <Money>-Betrag', () => {
  // <Money> gibt den API-Betrag unverändert und in Shop-Locale aus — auf einer
  // Netto-Flaeche ist das der Betrag, den die Kasse nie belastet.
  // AUSDRÜCKLICH ERLAUBT bleibt <Money> im Konto (account.orders.*): dort ist
  // die Zahl die WIRKLICH belastete aus der Bestellung, nicht unsere Rechnung.
  for (const rel of ['components/ProductItem.jsx', 'components/SearchResults.jsx',
                     'components/SearchResultsPredictive.jsx']) {
    const p = new URL(`../app/${rel}`, import.meta.url).pathname;
    assert.ok(!/<Money\b/.test(readFileSync(p, 'utf8')), `${rel} rendert wieder roh`);
  }
});
