/*
 * Reine Regeln der Alpha-Vorlage (alpha-vorlage-logik.js), ohne Build:
 *   node --test app/components/product-pages/alpha-vorlage-logik.test.mjs
 * ALPHA_VORLAGE_LOGIK=<pfad> prüft eine Kopie (Mutationsmatrix des Grossjobs
 * 20261027-…-apple-konfigurator-…-ab, s05: jeder Mutant muss hier rot werden).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {dirname, join, resolve} from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const ZIEL = process.env.ALPHA_VORLAGE_LOGIK
  ? resolve(process.env.ALPHA_VORLAGE_LOGIK)
  : join(HIER, 'alpha-vorlage-logik.js');
const L = await import(pathToFileURL(ZIEL).href);

const v = (id, title, opts, frei = true) => ({
  id,
  title,
  availableForSale: frei,
  selectedOptions: opts,
  price: {amount: '1326.05', currencyCode: 'EUR'},
});

// QiBracelet wie in Shopify am 28.10.2026: eine Option „Größe“, drei Werte.
const S = v('gid://v/S', 'S – 17', [{name: 'Größe', value: 'S – 17'}]);
const M = v('gid://v/M', 'M – 19', [{name: 'Größe', value: 'M – 19'}]);
const Lg = v('gid://v/L', 'L – 21', [{name: 'Größe', value: 'L – 21'}], false);
const ARMBAND = {
  options: [
    {
      name: 'Größe',
      optionValues: [
        {name: 'S – 17', firstSelectableVariant: S},
        {name: 'M – 19', firstSelectableVariant: M},
        {name: 'L – 21', firstSelectableVariant: Lg},
      ],
    },
  ],
  selectedOrFirstAvailableVariant: S,
  adjacentVariants: [M, Lg],
};
// QiOne® 2 Pro / QiHome® Air: nur „Default Title“.
const EINS = v('gid://v/1', 'Default Title', [{name: 'Title', value: 'Default Title'}]);
const EINZEL = {
  options: [{name: 'Title', optionValues: [{name: 'Default Title', firstSelectableVariant: EINS}]}],
  selectedOrFirstAvailableVariant: EINS,
  adjacentVariants: [],
};

test('variantenOptionen: Größen des Armbands, Default Title entfällt', () => {
  const o = L.variantenOptionen(ARMBAND);
  assert.equal(o.length, 1);
  assert.equal(o[0].name, 'Größe');
  assert.deepEqual(o[0].werte.map((w) => w.name), ['S – 17', 'M – 19', 'L – 21']);
  assert.deepEqual(o[0].werte.map((w) => w.verfuegbar), [true, true, false]);
  assert.deepEqual(L.variantenOptionen(EINZEL), []);
  assert.deepEqual(L.variantenOptionen(null), []);
  // Eine Option mit nur EINEM echten Wert ist keine Wahl: kein Schritt.
  const einWert = {options: [{name: 'Farbe', optionValues: [{name: 'Gold', firstSelectableVariant: EINS}]}]};
  assert.deepEqual(L.variantenOptionen(einWert), []);
});

test('startWahl: Auswahl der Startvariante', () => {
  assert.deepEqual(L.startWahl(ARMBAND), {Größe: 'S – 17'});
  assert.deepEqual(L.startWahl({}), {});
});

test('varianteZurWahl: passende Variante, sonst null; ohne Option die Startvariante', () => {
  assert.equal(L.varianteZurWahl(ARMBAND, {Größe: 'M – 19'}).id, 'gid://v/M');
  assert.equal(L.varianteZurWahl(ARMBAND, {Größe: 'L – 21'}).id, 'gid://v/L');
  assert.equal(L.varianteZurWahl(ARMBAND, {Größe: 'XL'}), null);
  assert.equal(L.varianteZurWahl(EINZEL, {}).id, 'gid://v/1');
});

test('ratenAngebot: nur DE, nur EUR, ab 500 €, Hausformel ceil/12', () => {
  assert.deepEqual(L.ratenAngebot({brutto: 1087, waehrung: 'EUR', land: 'DE'}), {
    anzahl: 12,
    rate: 91,
    text: '91 €',
  });
  assert.equal(L.ratenAngebot({brutto: 4983, land: 'DE'}).rate, 416);
  assert.equal(L.ratenAngebot({brutto: 1087, land: 'AT'}), null);
  assert.equal(L.ratenAngebot({brutto: 1087, waehrung: 'CHF', land: 'DE'}), null);
  assert.equal(L.ratenAngebot({brutto: 499, land: 'DE'}), null);
});

test('bezahlOptionen + mitRate: Platzhalter ersetzt, ohne Angebot nur direkt', () => {
  const opts = [
    {id: 'direkt', titel: 'Direkt bezahlen', zeile: 'Einmal zahlen, fertig.'},
    {id: 'paypal', titel: 'PayPal Ratenzahlung', zeile: '12 × {rate12} € im Monat'},
    {id: 'klarna', titel: 'Klarna Ratenzahlung', zeile: '12 × {rate} € im Monat'},
  ];
  const an = L.ratenAngebot({brutto: 1087, land: 'DE'});
  const mit = L.bezahlOptionen(opts, an);
  assert.deepEqual(mit.map((o) => o.id), ['direkt', 'paypal', 'klarna']);
  assert.equal(mit[1].zeile, '12 × 91 € im Monat');
  assert.equal(mit[2].zeile, '12 × 91 € im Monat');
  assert.deepEqual(L.bezahlOptionen(opts, null).map((o) => o.id), ['direkt']);
  assert.equal(L.mitRate('ohne Platzhalter', an), 'ohne Platzhalter');
  assert.equal(L.mitRate('{rate} €', null), '{rate} €');
});

test('zusammenfassung: Posten, Summe, Rate der Summe nur bei Raten', () => {
  const k = {name: '45 cm Kette aus Chirurgenstahl'};
  const z = L.zusammenfassung({
    name: 'QiOne® 2 Pro',
    variante: EINS,
    hauptPreis: 1087,
    kette: k,
    kettePreis: 94,
    zahlart: 'paypal',
    land: 'DE',
  });
  assert.deepEqual(z.posten.map((p) => p.name), ['QiOne® 2 Pro', '45 cm Kette aus Chirurgenstahl']);
  assert.equal(z.summe, 1181);
  assert.equal(z.rate.rate, 99);
  const d = L.zusammenfassung({name: 'QiBracelet®', variante: M, hauptPreis: 1578, land: 'DE'});
  assert.equal(d.posten[0].name, 'QiBracelet® · M – 19');
  assert.equal(d.summe, 1578);
  assert.equal(d.rate, null);
});

test('boxInhalt: feste Teile, die Kette nur wenn gewählt', () => {
  assert.deepEqual(L.boxInhalt(['QiOne® 2 Pro', 'Baumwollband', ' ']), ['QiOne® 2 Pro', 'Baumwollband']);
  assert.deepEqual(L.boxInhalt(['QiOne® 2 Pro'], {box: '45 cm - Kette aus Chirurgenstahl'}), [
    'QiOne® 2 Pro',
    '45 cm - Kette aus Chirurgenstahl',
  ]);
  assert.deepEqual(L.boxInhalt(null), []);
});

test('mitBreite + laengeCm', () => {
  assert.equal(L.mitBreite('https://x/a.jpg?v=1', 600), 'https://x/a.jpg?v=1&width=600');
  assert.equal(L.mitBreite('https://x/a.jpg', 600), 'https://x/a.jpg?width=600');
  assert.equal(L.laengeCm('S - 45cm'), 45);
  assert.equal(L.laengeCm('XL - 75 cm'), 75);
  assert.equal(L.laengeCm('Default Title'), null);
});

test('kettenKacheln: nur kaufbare Längen, kurz nach lang', () => {
  const kette = {
    variants: {
      nodes: [
        v('k60', 'L - 60 cm', []),
        v('k40', 'XS - 40 cm', []),
        v('k50', 'M - 50 cm', [], false),
        v('k45', 'S - 45cm', []),
      ],
    },
  };
  const texte = {name: (cm) => `${cm} cm Kette`, box: (cm) => `${cm} cm - Kette`};
  const k = L.kettenKacheln(kette, 'stahl', texte);
  assert.deepEqual(k.map((x) => x.cm), [40, 45, 60]);
  assert.equal(k[0].schluessel, 'stahl-40');
  assert.equal(k[1].box, '45 cm - Kette');
  assert.deepEqual(L.kettenKacheln(null, 'stahl', texte), []);
});

test('warenkorbZeilen: Gerät zuerst, Kette danach, ohne kaufbares Gerät leer', () => {
  const z = L.warenkorbZeilen(EINS, {variante: {id: 'k45'}});
  assert.deepEqual(z.map((x) => x.merchandiseId), ['gid://v/1', 'k45']);
  assert.deepEqual(L.warenkorbZeilen(EINS).map((x) => x.merchandiseId), ['gid://v/1']);
  assert.deepEqual(L.warenkorbZeilen(Lg), []);
  assert.deepEqual(L.warenkorbZeilen(null), []);
});

test('schrittAbschnitt: Name für die cookielose Zählung', () => {
  assert.equal(L.schrittAbschnitt('bezahlart'), 'konfig-bezahlart');
  assert.match(L.schrittAbschnitt('was ist drin?'), /^[A-Za-z0-9_.:-]{1,64}$/);
});
