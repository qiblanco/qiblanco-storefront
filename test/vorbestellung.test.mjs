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
  warenkorbUnterzeile,
} from '../app/lib/vorbestellung.js';

const wurzel = new URL('../', import.meta.url);
const lies = (pfad) => readFileSync(fileURLToPath(new URL(pfad, wurzel)), 'utf8');

const linie = (handle, titel) => ({
  merchandise: {product: {handle, title: titel}},
});

// Qi Alpha heißt bis 2026-10-17 Qi Master; der Shopify-Handle wechselt erst
// in s09 des Umbenennungs-Grossjobs. Beide Handles müssen denselben Text tragen.
const QI_MASTER = linie('qi-master', 'Qi Alpha');
const QI_ALPHA = linie('qi-alpha', 'Qi Alpha');
const ANDERES = linie('qione-2-pro', 'QiOne® 2 Pro');

test('Warenkorbzeile der Vorbestellung trägt Christians Wortlaut (Name seit 17.10.: Qi Alpha)', () => {
  assert.equal(warenkorbTitel(QI_ALPHA), 'Qi Alpha®');
  assert.equal(warenkorbTitel(QI_MASTER), 'Qi Alpha®');
  assert.equal(warenkorbUnterzeile(QI_ALPHA), 'Vorbestellung · Versand Jan 2027');
  assert.equal(warenkorbUnterzeile(ANDERES), null);
  assert.equal(versandhinweisFürLinien([QI_ALPHA]), 'Versandbereit für Dich: Jan 2027');
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

// Warenkorb der Qi-Alpha-Konfiguration wie die Kasse (Christian 27.10.2026,
// Job 20261027-qi-alpha-immer-mit-registered-zeichen): „Qi Alpha immer mit R“,
// Nummer als „Qi Alpha® 19/111“, Kette mit Länge darunter.
const addons = await import('../app/lib/qi-master-addons.js');
const addonLinie = (handle, titel, optionen = [], produktTitel = 'P') => ({
  merchandise: {
    title: titel,
    product: {handle, title: produktTitel},
    selectedOptions: optionen,
  },
});

test('Nummer in allen drei Schreibweisen wird „N/111“', () => {
  for (const t of ['Alpha 19/100', 'Alpha 19/111', '19/111']) {
    assert.equal(addons.nummerKurz(t), '19/111', t);
  }
  assert.equal(addons.nummerKurz('60 cm'), null);
});

test('Nummern-Zeile heißt „Qi Alpha® 19/111 – Wunschnummer“, ohne Unterzeile', () => {
  for (const t of ['Alpha 19/111', '19/111']) {
    const z = addons.addonZeile(
      addonLinie('qi-alpha-wunschnummer', t, [{name: 'Nummer', value: t}], 'Qi Alpha®'),
    );
    assert.deepEqual(z, {titel: 'Qi Alpha® 19/111 – Wunschnummer', unterzeilen: []});
  }
});

test('Kette: Produkttitel, darunter nur die Länge', () => {
  const z = addons.addonZeile(
    addonLinie('qi-alpha-goldkette', '60 cm', [{name: 'Länge', value: '60 cm'}],
      'Qi Blanco® Goldkette - 750iger ethisches Vollgold'),
  );
  assert.deepEqual(z, {
    titel: 'Qi Blanco® Goldkette - 750iger ethisches Vollgold',
    unterzeilen: ['60 cm'],
  });
});

test('Hauptprodukt und Fremdes sind keine Add-on-Zeile', () => {
  assert.equal(addons.addonZeile(addonLinie('qi-alpha', 'Default Title')), null);
  assert.equal(addons.addonZeile(addonLinie('qione-2-pro', 'Default Title')), null);
  assert.equal(addons.addonZeile({}), null);
});

test('CartLineItem: Titel aus addonZeile, zweite Zeile klein darunter statt „Name: Wert“', () => {
  const src = lies('app/components/CartLineItem.jsx');
  assert.match(src, /<strong>\{addon\?\.titel \|\| warenkorbTitel\(line\)\}<\/strong>/);
  assert.match(src, /\(unterzeilen \?\? \[\]\)\.map\(\(zeile\) => \([\s\S]*?<br \/>[\s\S]*?<small>\{zeile\}<\/small>/);
  assert.match(src, /\(unterzeilen \? \[\] : selectedOptions\)\.map/);
  // der Wortlaut steht in den libs, nicht in der Komponente
  assert.doesNotMatch(src, /Vorbestellung · Versand|Qi Alpha®/);
});
