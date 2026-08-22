// Durchsetzer für den stillgelegten Jubilaeums-Sale
// (Job 20260821-shopmgr-s04-totes-kampagnenversprechen, 2026-08-22).
// Wie ad-weiche.test.mjs: node:test/node:assert sind Bordmittel, KEIN Netz,
// kein neuer Runner. Ausfuehren: node --test test/ten-years-retired.test.mjs
//
// WARUM ES DIESEN TEST GIBT
// -------------------------
// Die Kampagne wurde am 2026-08-05 stillgelegt, indem ihre ERREICHBARKEIT
// abgeschaltet wurde (TEN_YEARS_SALE_RETIRED = true). Ihre ZAHLEN blieben
// stehen: zwei Rabattcodes, die in Shopify seit 2026-06-17 abgelaufen sind,
// und rabattierte Preise in fuenf Deals. Erreichbar war davon nichts — aber
// ein einziges `TEN_YEARS_SALE_RETIRED = false` haette alles auf einen Schlag
// wieder scharf gestellt, und keine Zusage wäre noch wahr gewesen.
//
// Eine Stilllegung, die nur die Tuer zusperrt, lässt die Mine im Raum. Dieser
// Test ist der Zuender-Entferner: solange die Kampagne stillgelegt ist, darf
// sie KEINE kommerzielle Zusage tragen. Wer sie reaktiviert, muss Preise und
// Codes neu erheben — dieser Test hoert dann auf zu fordern (er greift nur bei
// RETIRED === true) und die Messung liegt wieder bei shop-manager landkarte.
//
// ER PRUEFT ZWEI DINGE, UND DAS ZWEITE IST DAS WICHTIGERE
// -------------------------------------------------------
// 1. Keine Zusage mehr — in BEIDEN Haelften. Die Daten (ten-years-deals.js)
//    liest ein Monitor; die Copy-Tabelle in TenYearsDealPage.jsx liest keiner.
//    Genau diese zweite Haelfte fuehrte dieselben Betraege ein zweites Mal.
// 2. Der 404-ZAUN IST NOCH DA. Der naheliegende "gruendlichere" Fix wäre
//    gewesen, die Deal-Eintraege ganz zu loeschen. Das wäre der gefaehrlichere
//    Weg: `getTenYearsDealByHandle` speist den Zaun in products.$handle.jsx,
//    und hinter den Alias-Handles stehen echte Shopify-Produkte im Status
//    DRAFT ("Sale: QiBracelet" 687ghgf4ed, "Sale: QiHome(R) Air" 56huz67dds,
//    gemessen 2026-08-22). Ohne Zaun veroeffentlicht ein Admin-Klick
//    DRAFT->ACTIVE eine "Sale:"-Seite zum vollen Preis. Ein Test, der nur die
//    Zusage prueft, würde dieses Loeschen gruen durchwinken.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  TEN_YEARS_DEALS,
  TEN_YEARS_SALE_RETIRED,
  getTenYearsDealByHandle,
  istStillgelegteJSaleSeite,
} from '../app/data/ten-years-deals.js';

const KOMPONENTE = new URL(
  '../app/components/campaign/TenYearsDealPage.jsx',
  import.meta.url,
);

// Jeder Handle und Alias, der am 2026-08-22 den 404-Zaun bekam. Bewusst als
// Literal-Liste und NICHT aus TEN_YEARS_DEALS abgeleitet: eine abgeleitete
// Liste schrumpft lautlos mit, wenn jemand einen Eintrag loescht — dann prueft
// der Test seine eigene Kopie des Schadens und bleibt gruen.
const ZAUN_HANDLES = [
  'jhsdhze783',
  '734husd8hh',
  'sale-qibracelet',
  'bf-qibracelet',
  '687ghgf4ed',
  'sale-qihome-air',
  'bf-qihome-air',
  '56huz67dds',
  'awcr37shyj',
  'aw783hfn',
  '37cr378n',
];

// --- 1. Keine kommerzielle Zusage, solange stillgelegt ----------------------

test('stillgelegt: kein Deal trägt einen Rabattcode', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    assert.equal(
      deal.discountCode,
      undefined,
      `Deal '${deal.key}' trägt discountCode '${deal.discountCode}'. Ein ` +
        `stillgelegter Deal darf keinen Code versprechen — er wird nicht ` +
        `eingeloest und niemand misst ihn.`,
    );
  }
});

test('stillgelegt: kein Link loest einen Rabattcode ein', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const feld of ['path', 'listingHref', 'redirectTo']) {
      const wert = deal[feld];
      if (typeof wert !== 'string') continue;
      assert.ok(
        !wert.includes('/discount/'),
        `Deal '${deal.key}' hat ${feld}='${wert}'. Ein /discount/-Link ` +
          `loest einen Code ein; stillgelegt gibt es keinen gueltigen.`,
      );
    }
  }
});

test('stillgelegt: keine Variante trägt einen Preis', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const variante of deal.variants ?? []) {
      assert.equal(
        variante.price,
        undefined,
        `Deal '${deal.key}', Variante '${variante.title}' trägt ` +
          `price=${variante.price}. Das ist eine Endpreis-Zusage gegen einen ` +
          `Warenkorb, der sie nicht mehr einloest.`,
      );
      assert.equal(
        variante.compareAtPrice,
        undefined,
        `Deal '${deal.key}', Variante '${variante.title}' trägt ` +
          `compareAtPrice=${variante.compareAtPrice} — ein Streichpreis ` +
          `behauptet eine Ermaessigung, die es nicht gibt.`,
      );
    }
  }
});

test('stillgelegt: keine benefits-Zeile nennt Code oder Euro-Betrag', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const zeile of deal.benefits ?? []) {
      assert.ok(
        !/rabattcode/i.test(zeile),
        `Deal '${deal.key}': benefits-Zeile nennt einen Rabattcode — "${zeile}"`,
      );
      assert.ok(
        !/\d[\d.,]*\s*(€|EUR|Euro)/i.test(zeile),
        `Deal '${deal.key}': benefits-Zeile verspricht einen Betrag — "${zeile}"`,
      );
    }
  }
});

// Die zweite Haelfte: Copy in der Komponente. Sie steht in keinem Array mit
// `variants` und trägt keinen `discountCode` — kein Monitor liest sie. Der
// Test liest sie deshalb als QUELLTEXT; die Tabelle ist nicht exportiert.
test('stillgelegt: die Copy-Tabelle der Komponente nennt keinen Sparbetrag', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  const quelltext = readFileSync(KOMPONENTE, 'utf8');
  const treffer = [];
  for (const zeile of quelltext.split('\n')) {
    if (!/^\s*(heroSavings|savingText|ctaButton|ctaHeader)\s*:/.test(zeile)) continue;
    if (/\d[\d.,]*\s*(€|EUR|Euro)/i.test(zeile)) treffer.push(zeile.trim());
  }
  assert.deepEqual(
    treffer,
    [],
    `Die Copy-Tabelle in TenYearsDealPage.jsx verspricht wieder Betraege:\n` +
      `${treffer.join('\n')}\n` +
      `Das ist die Haelfte, die kein Monitor liest — sie muss hier gehalten werden.`,
  );
});

// --- 2. Der Zaun steht noch (Chesterton) ------------------------------------

test('der 404-Zaun deckt weiterhin jeden Handle und Alias', () => {
  for (const handle of ZAUN_HANDLES) {
    assert.ok(
      getTenYearsDealByHandle(handle),
      `Handle '${handle}' findet keinen Deal mehr. products.$handle.jsx ` +
        `wirft seinen 404 NUR für bekannte Deal-Handles — ohne Eintrag ` +
        `faellt der Handle in die normale Produkt-Query. Hinter ` +
        `687ghgf4ed/56huz67dds stehen Shopify-Produkte "Sale: ..." im Status ` +
        `DRAFT; ein Admin-Klick auf ACTIVE veroeffentlicht sie dann zum ` +
        `vollen Preis. Eintrag NICHT loeschen — nur seine Zusage entfernen.`,
    );
  }
});

test('die Seiten-Stilllegung ist unveraendert scharf', () => {
  assert.equal(TEN_YEARS_SALE_RETIRED, true);
  assert.equal(istStillgelegteJSaleSeite('/pages/10-jahre-sale'), true);
  assert.equal(istStillgelegteJSaleSeite('/pages/10-jahre-pre-access'), true);
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro-2x'), true);
  // Nachbarpfade duerfen NICHT mitgerissen werden (kein Praefix-Match).
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro'), false);
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro-details'), false);
});

// --- 3. Struktur, die die Komponente weiterhin braucht -----------------------
// Ohne das könnte "Zusage entfernen" zu "Variante entfernen" verrutschen:
// TenYearsDealPage liest deal.variants[0].id ungeprueft.
test('jeder Deal behaelt mindestens eine Variante mit id', () => {
  for (const deal of TEN_YEARS_DEALS) {
    assert.ok(
      Array.isArray(deal.variants) && deal.variants.length > 0,
      `Deal '${deal.key}' hat keine Varianten mehr — TenYearsDealPage greift ` +
        `ungeprueft auf deal.variants[0].id zu.`,
    );
    for (const variante of deal.variants) {
      assert.ok(variante.id, `Deal '${deal.key}': Variante ohne id`);
    }
  }
});
