// Naht-Test zur Vorbestellungs-Anzeige im Warenkorb
// (Job 20260916-warenkorb-sagt-zwei-tage-bei-einer-vorbestellung-für-januar).
// Stil wie die uebrigen Tests hier: node:test/node:assert als Bordmittel,
// KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/vorbestellung.test.mjs
//
// WAS HIER DIE NAHT IST: der Zeilentitel kommt aus CartLineItem, der
// Lieferhinweis aus CartSummary — zwei Komponenten, ein Versprechen. Wäre je
// ein Text dort fest eingetragen, könnte die eine Haelfte gepflegt werden und
// die andere nicht; der Kunde sähe dann "Vorbestellung Jan 2027" über "In 2
// bis 3 Tagen bei dir!". Dieser Test prüft deshalb BEIDES: dass die Texte aus
// derselben Quelle kommen (Verhalten) und dass keine der beiden Komponenten
// ihren Text noch selbst hält (Quelltext). Die LIVE-Wirkung misst
// homepage-bauer/bin/probe_warenkorb_vorbestellung.py am gerenderten
// Warenkorb — dieser Test ersetzt sie nicht, er fängt den Rückfall im Bau.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

import {
  STANDARD_VERSANDHINWEIS,
  VORBESTELLUNGEN,
  versandhinweisFürLinien,
  vorbestellungFürHandle,
  warenkorbTitel,
} from '../app/lib/vorbestellung.js';

const wurzel = new URL('../', import.meta.url);
const lies = (pfad) => readFileSync(fileURLToPath(new URL(pfad, wurzel)), 'utf8');

const linie = (handle, titel) => ({
  merchandise: {product: {handle, title: titel}},
});

const QI_MASTER = linie('qi-master', 'Qi Master®');
const ANDERES = linie('qione-2-pro', 'QiOne® 2 Pro');

test('Warenkorbzeile der Vorbestellung trägt Christians Wortlaut', () => {
  assert.equal(warenkorbTitel(QI_MASTER), 'Qi Master® - Vorbestellung Jan 2027');
});

test('jedes andere Produkt behält seinen Produkttitel', () => {
  assert.equal(warenkorbTitel(ANDERES), 'QiOne® 2 Pro');
});

test('Lieferhinweis nennt den Vorbestellungs-Termin, sobald sie im Korb liegt', () => {
  assert.equal(
    versandhinweisFürLinien([QI_MASTER]),
    'Versandbereit für Dich: Jan 2027',
  );
  // auch gemischt: eine Bestellung geht als EINE Sendung raus
  assert.equal(
    versandhinweisFürLinien([ANDERES, QI_MASTER]),
    'Versandbereit für Dich: Jan 2027',
  );
});

test('ohne Vorbestellung bleibt der Standardtext unverändert', () => {
  assert.equal(versandhinweisFürLinien([ANDERES]), STANDARD_VERSANDHINWEIS);
  assert.equal(versandhinweisFürLinien([]), STANDARD_VERSANDHINWEIS);
  assert.equal(versandhinweisFürLinien(undefined), STANDARD_VERSANDHINWEIS);
  assert.equal(STANDARD_VERSANDHINWEIS, 'In 2 bis 3 Tagen bei dir!');
});

test('unbekanntes Produkt faellt nicht auf die Vorbestellung zurück', () => {
  assert.equal(vorbestellungFürHandle('gibt-es-nicht'), null);
  assert.equal(vorbestellungFürHandle(undefined), null);
  assert.equal(warenkorbTitel({}), '');
});

test('NAHT: beide Komponenten lesen die SSoT und halten keinen eigenen Text', () => {
  const zeile = lies('app/components/CartLineItem.jsx');
  const summe = lies('app/components/CartSummary.jsx');

  assert.match(zeile, /from '~\/lib\/vorbestellung'/);
  assert.match(summe, /from '~\/lib\/vorbestellung'/);
  assert.match(zeile, /warenkorbTitel\(line\)/);
  assert.match(summe, /versandhinweisFürLinien\(lines\)/);

  // Kein Text-Literal mehr in den Komponenten: sonst gaebe es zwei Quellen.
  for (const [name, quelle] of [['CartLineItem', zeile], ['CartSummary', summe]]) {
    for (const text of [
      VORBESTELLUNGEN['qi-master'].warenkorbTitel,
      VORBESTELLUNGEN['qi-master'].versandhinweis,
    ]) {
      assert.ok(
        !quelle.includes(text),
        `${name} hält "${text}" selbst — der Text gehört in app/lib/vorbestellung.js`,
      );
    }
  }
  // Der Standardtext steht nur noch in der SSoT, nicht mehr in CartSummary.
  assert.ok(
    !summe.includes(STANDARD_VERSANDHINWEIS),
    'CartSummary hält den Standard-Lieferhinweis noch selbst',
  );
});
