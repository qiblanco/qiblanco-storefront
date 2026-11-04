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
// Kette mit Länge darunter. Seit 28.10.2026 Z14 (Grossjob 20261028-qi-alpha-
// kopf-99-…, s06): Nummer als „Wunschnummer“, darunter „19/111 - 1st.
// Edition“; Reihenfolge Qi Alpha®, Wunschnummer, Kette.
const addons = await import('../app/lib/qi-master-addons.js');
const addonLinie = (handle, titel, optionen = [], produktTitel = 'P') => ({
  merchandise: {
    title: titel,
    product: {handle, title: produktTitel},
    selectedOptions: optionen,
  },
});

test('Nummer in allen vier Schreibweisen wird „N/111“', () => {
  for (const t of ['Alpha 19/100', 'Alpha 19/111', '19/111', '19/111 - 1st. Edition']) {
    assert.equal(addons.nummerKurz(t), '19/111', t);
  }
  assert.equal(addons.nummerKurz('60 cm'), null);
  assert.equal(addons.nummerKurz('19/111 - 2nd. Edition'), null);
});

test('Nummern-Zeile heißt „Qi Alpha® 19/111 – Wunschnummer“, auch mit Edition-Variante (01.11. vor Z14)', () => {
  for (const t of ['Alpha 19/111', '19/111', '19/111 - 1st. Edition']) {
    for (const produkt of ['Qi Alpha®', 'Qi Alpha® Wunschnummer']) {
      const z = addons.addonZeile(
        addonLinie('qi-alpha-wunschnummer', t, [{name: 'Nummer', value: t}], produkt),
      );
      assert.deepEqual(z, {titel: 'Qi Alpha® 19/111 – Wunschnummer', unterzeilen: []}, t);
    }
  }
});

test('Kette: Produkttitel, darunter nur die Länge', () => {
  const z = addons.addonZeile(
    addonLinie('qi-alpha-goldkette', '60 cm', [{name: 'Länge', value: '60 cm'}],
      'Qi Blanco® Goldkette – 750er ethisches Vollgold'),
  );
  assert.deepEqual(z, {
    titel: 'Qi Blanco® Goldkette – 750er ethisches Vollgold',
    unterzeilen: ['60 cm'],
  });
});

const zeileH = (handle, id) => ({id, merchandise: {product: {handle}}});

test('Warenkorb-Anzeige: Qi Alpha, Wunschnummer, Kette — egal wie hinzugefügt (Z14)', () => {
  // So liefert Shopify, wenn erst der Qi Alpha, dann Kette, dann Nummer kam
  // (gemessen 29.10.2026, s06 mess-reihenfolge.json Arm A).
  const shopify = [
    zeileH('qi-alpha-wunschnummer', 'n'),
    zeileH('kakao-zeremonie', 'x'),
    zeileH('qi-alpha-goldkette', 'k'),
    zeileH('qi-alpha', 'q'),
  ];
  assert.deepEqual(addons.sortiereWarenkorb(shopify).map((z) => z.id), ['q', 'n', 'k', 'x']);
  assert.deepEqual(addons.sortiereWarenkorb(undefined), []);
});

test('Inklusive Stahlkette (#1126) steht wie die Goldkette nach der Wunschnummer', () => {
  // the-alpha-kauf-laden legt Qi Alpha + Stahlkette (0 €) + Nummer an.
  const shopify = [
    zeileH('qi-alpha-stahlkette', 's'),
    zeileH('kakao-zeremonie', 'x'),
    zeileH('qi-alpha-wunschnummer', 'n'),
    zeileH('qi-alpha', 'q'),
  ];
  assert.deepEqual(addons.sortiereWarenkorb(shopify).map((z) => z.id), ['q', 'n', 's', 'x']);
  const z = (handle, id) => ({id, quantity: 1, handle, merchandiseId: `gid://v/${id}`, attributes: []});
  const plan = addons.reihenfolgeKorrektur([z('qi-alpha-stahlkette', 's'), z('qi-alpha-wunschnummer', 'n'), z('qi-alpha', 'q')]);
  assert.deepEqual(plan.entfernen, ['s', 'n', 'q']);
  assert.deepEqual(plan.hinzufuegen.map((e) => e.merchandiseId), ['gid://v/s', 'gid://v/n', 'gid://v/q']);
});

test('Kasse: reihenfolgeKorrektur nimmt die Gruppe heraus und legt sie umgekehrt wieder hinein', () => {
  const z = (handle, id, attributes = []) => ({
    id, handle, quantity: 1, merchandiseId: `gid://v/${id}`, attributes,
  });
  // schon richtig: nichts tun
  assert.equal(
    addons.reihenfolgeKorrektur([z('qi-alpha', 'q'), z('kakao', 'x'), z('qi-alpha-wunschnummer', 'n'), z('qi-alpha-goldkette', 'k')]),
    null,
  );
  assert.equal(addons.reihenfolgeKorrektur([]), null);
  // falsch (Permalink QA,Kette,Nummer): Shopify führt Nummer, Kette, QA
  const plan = addons.reihenfolgeKorrektur([
    z('qi-alpha-wunschnummer', 'n', [{key: '_qm_addon', value: 'wunschnummer'}]),
    z('qi-alpha-goldkette', 'k'),
    z('kakao', 'x'),
    z('qi-alpha', 'q'),
  ]);
  assert.deepEqual(plan.entfernen, ['n', 'k', 'q']);
  // Shopify setzt das LETZTE Element eines Aufrufs nach vorn -> Kette, Nummer, QA
  assert.deepEqual(plan.hinzufuegen.map((l) => l.merchandiseId), ['gid://v/k', 'gid://v/n', 'gid://v/q']);
  assert.deepEqual(plan.hinzufuegen[1].attributes, [{key: '_qm_addon', value: 'wunschnummer'}]);
  assert.equal(plan.hinzufuegen[0].attributes, undefined);
});

test('Server ordnet nur nach dem Hinzufügen und legt bei Fehler die alte Folge zurück', () => {
  const src = lies('app/lib/qi-master-addons.server.js');
  assert.match(src, /if \(action !== CartForm\.ACTIONS\.LinesAdd\) return neu;/);
  assert.match(src, /reihenfolgeKorrektur\(zeilen\)/);
  assert.match(src, /cart\.addLines\(vorher, \{cartId\}\)/);
});

test('Reservierter Link: Schlüssel und Rabatt überleben Umordnung und neuen Variantentitel', async () => {
  const r = await import('../app/lib/qi-alpha-reservierung.js');
  const liste = [{schluessel: 'a'.repeat(16), nummern: [{n: 88, name: 'Test'}]}];
  const rabatte = {['a'.repeat(16)]: {code: 'GEHEIM'}};
  // Die Variante heißt nach dem Shopify-Write „88/111 - 1st. Edition“.
  assert.equal(r.nummerAusVariantenTitel('88/111 - 1st. Edition'), 88);
  const merkmale = r.reservierungsMerkmale('a'.repeat(16), 'Test');
  const plan = addons.reihenfolgeKorrektur([
    {id: 'n', handle: 'qi-alpha-wunschnummer', quantity: 1, merchandiseId: 'gid://v/n', attributes: merkmale},
    {id: 'q', handle: 'qi-alpha', quantity: 1, merchandiseId: 'gid://v/q', attributes: []},
  ]);
  const zeile = plan.hinzufuegen.find((l) => l.merchandiseId === 'gid://v/n');
  assert.deepEqual(zeile.attributes, merkmale);
  // Wieder im Korb: die Sperre lässt die Nummer stehen, der Code bleibt.
  const danach = [{id: 'n2', nummer: 88, attributes: zeile.attributes}];
  assert.deepEqual(r.reservierungsSperre(danach, liste), []);
  assert.equal(r.rabattCodeKorrektur(danach, ['GEHEIM'], rabatte), null);
});

test('Server: Sperre und Rabattcode laufen vor der Umordnung, Nachlesen mit 250 Zeilen', () => {
  const src = lies('app/lib/qi-master-addons.server.js');
  assert.match(src, /if \(entfernen\.length \|\| aendern\.length \|\| codes\) \{/);
  assert.ok(src.indexOf('reservierungsSperre(') < src.indexOf('ordneQiAlphaZeilen({'));
  assert.match(src, /stand = await cart\.get\(\{cartId, numCartLines: 250\}\)/);
});

test('CartMain zeichnet die Zeilen sortiert', () => {
  const src = lies('app/components/CartMain.jsx');
  assert.match(src, /sortiereWarenkorb\(cart\?\.lines\?\.nodes\)\.map\(\(line\) =>/);
});

test('Hauptprodukt und Fremdes sind keine Add-on-Zeile', () => {
  assert.equal(addons.addonZeile(addonLinie('qi-alpha', 'Default Title')), null);
  assert.equal(addons.addonZeile(addonLinie('qione-2-pro', 'Default Title')), null);
  assert.equal(addons.addonZeile({}), null);
});

test('CartLineItem: Titel aus addonZeile, zweite Zeile klein darunter statt „Name: Wert“', () => {
  const src = lies('app/components/CartLineItem.jsx');
  // ® klein hochgestellt über mitMarkeR (Z1/Z14)
  assert.match(src, /<strong>\{mitMarkeR\(addon\?\.titel \|\| warenkorbTitel\(line\)\)\}<\/strong>/);
  assert.match(src, /\(unterzeilen \?\? \[\]\)\.map\(\(zeile\) => \([\s\S]*?<br \/>[\s\S]*?<small>\{zeile\}<\/small>/);
  assert.match(src, /\(unterzeilen \? \[\] : selectedOptions\)\.map/);
  // der Wortlaut steht in den libs, nicht in der Komponente
  assert.doesNotMatch(src, /Vorbestellung · Versand|Qi Alpha®/);
});

test('Necklace 2: Termin je Material in Zeile und Lieferhinweis, ohne Material kein Eintrag', () => {
  const zeile = (material) => ({
    merchandise: {
      product: {handle: 'necklace-2', title: 'Necklace 2'},
      selectedOptions: [
        {name: 'Material', value: material},
        {name: 'Länge', value: '60 cm'},
      ],
    },
  });
  const gold = zeile('750er ethisches Vollgold');
  const stahl = zeile('Chirurgenstahl');
  assert.match(warenkorbUnterzeile(gold), /60 cm · Vorbestellung, lieferbar ab Januar 2027/);
  assert.match(warenkorbUnterzeile(stahl), /lieferbar ab 1\. Quartal 2027/);
  assert.equal(versandhinweisFürLinien([gold]), 'Lieferbar für Dich: ab Januar 2027');
  assert.equal(versandhinweisFürLinien([stahl]), 'Lieferbar für Dich: ab 1. Quartal 2027');
  assert.equal(versandhinweisFürLinien([zeile('Silber')]), STANDARD_VERSANDHINWEIS);
});
