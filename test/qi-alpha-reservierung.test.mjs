/*
 * Premium-Kunden-Checkout für reservierte Qi-Alpha®-Nummern (Christian
 * 01.11.2026, Job 20261101-prio2-qi-alpha-premium-checkout-reservierte-
 * nummern-links). Reine Regeln aus app/lib/qi-alpha-reservierung.js und die
 * Liste app/lib/qi-alpha-reservierungen.server.js.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = await import(join(WURZEL, 'app/lib/qi-alpha-reservierung.js'));
const {RESERVIERUNGEN} = await import(
  join(WURZEL, 'app/lib/qi-alpha-reservierungen.server.js')
);
const {THE_ALPHA_VERGEBEN, THE_ALPHA_SERIE} = await import(
  join(WURZEL, 'app/components/campaign/the-alpha-daten-serie-vergeben.js')
);
const {addonLinien} = await import(join(WURZEL, 'app/lib/qi-master-addons.js'));
const {gravurText} = await import(
  join(WURZEL, 'app/components/campaign/the-alpha-kauf-laden.js')
);

test('Liste: fehlerfrei, Christians vier Nummern, 2 und 99 in EINEM Link', () => {
  assert.deepEqual(r.listeFehler(RESERVIERUNGEN, THE_ALPHA_SERIE), []);
  const je = Object.fromEntries(
    RESERVIERUNGEN.flatMap((x) => x.nummern.map((y) => [y.n, y.name])),
  );
  assert.equal(je[88], 'Lisa');
  assert.equal(je[44], 'Verena');
  assert.equal(je[2], 'Daniela');
  assert.equal(je[99], 'Matthias');
  const c = RESERVIERUNGEN.find((x) => x.nummern.some((y) => y.n === 2));
  assert.deepEqual(
    c.nummern.map((y) => y.n).sort((a, b) => a - b),
    [2, 99],
  );
});

test('Sperre im normalen Shop: jede reservierte Nummer steht in THE_ALPHA_VERGEBEN', () => {
  for (const n of r.reservierteNummern(RESERVIERUNGEN)) {
    assert.ok(
      THE_ALPHA_VERGEBEN.includes(n),
      `Nr. ${n} fehlt in THE_ALPHA_VERGEBEN`,
    );
  }
});

test('listeFehler: Rot-Arm (doppelte Nummer, schlechter Schlüssel, leerer Name)', () => {
  const s = 'A'.repeat(22);
  assert.ok(
    r.listeFehler([{schluessel: 'kurz', nummern: [{n: 1, name: 'X'}]}]).length,
  );
  assert.ok(
    r.listeFehler([{schluessel: s, nummern: [{n: 1, name: ' '}]}]).length,
  );
  assert.ok(
    r.listeFehler([
      {schluessel: s, nummern: [{n: 5, name: 'X'}]},
      {schluessel: 'B'.repeat(22), nummern: [{n: 5, name: 'Y'}]},
    ]).length,
  );
  assert.ok(
    r.listeFehler([{schluessel: s, nummern: [{n: 112, name: 'X'}]}]).length,
  );
});

test('kaufZiel: nur mit gültigem Schlüssel in den Premium-Bereich', () => {
  const s = RESERVIERUNGEN[0].schluessel;
  assert.equal(
    r.kaufZiel('/products/qi-alpha', s),
    `/products/qi-alpha-reserviert/${s}`,
  );
  assert.equal(r.kaufZiel('/products/qi-alpha', null), '/products/qi-alpha');
  assert.equal(r.kaufZiel('/products/qi-alpha', '../x'), '/products/qi-alpha');
  assert.equal(r.kaufZiel('/products/qi-alpha', 'abc'), '/products/qi-alpha');
  assert.equal(r.kaufZiel('/products/anderes', s), '/products/anderes');
});

test('reservierungZu: liefert nur die eigene Reservierung, unbekannt = null', () => {
  const c = RESERVIERUNGEN[2];
  const x = r.reservierungZu(RESERVIERUNGEN, c.schluessel);
  assert.deepEqual(x, {schluessel: c.schluessel, nummern: c.nummern});
  assert.equal(r.reservierungZu(RESERVIERUNGEN, 'Z'.repeat(22)), null);
  assert.equal(r.reservierungZu(RESERVIERUNGEN, undefined), null);
  assert.equal(
    r.reservierungZu(RESERVIERUNGEN, c.schluessel, 'englisch'),
    null,
  );
});

test('Sperre im Warenkorb: reservierte Nummer nur mit dem Schlüssel IHRES Links', () => {
  const a = RESERVIERUNGEN[0];
  const c = RESERVIERUNGEN[2];
  const zeilen = [
    {id: 'ohne', nummer: 88, attributes: []},
    {
      id: 'fremd',
      nummer: 88,
      attributes: [{key: '_reservierung', value: c.schluessel}],
    },
    {
      id: 'echt',
      nummer: 88,
      attributes: [{key: '_reservierung', value: a.schluessel}],
    },
    {id: 'frei', nummer: 17, attributes: []},
    {
      id: 'c2',
      nummer: 2,
      attributes: [{key: '_reservierung', value: c.schluessel}],
    },
  ];
  assert.deepEqual(r.reservierungsSperre(zeilen, RESERVIERUNGEN), [
    'ohne',
    'fremd',
  ]);
});

test('reserviertStand: kaufbar = reserviert, gekauft (Shopify gesperrt) = vergeben', () => {
  const c = r.reservierungZu(RESERVIERUNGEN, RESERVIERUNGEN[2].schluessel);
  const st = r.reserviertStand(c, [
    {id: 'v2', title: '2/111', availableForSale: true},
    {id: 'v99', title: '99/111', availableForSale: false},
  ]);
  assert.deepEqual(
    st.map((x) => [x.n, x.status, x.variante?.id ?? null]),
    [
      [2, 'reserviert', 'v2'],
      [99, 'vergeben', null],
    ],
  );
});

test('geraeteLinien: zwei Geräte = Qi Alpha® Menge 2, zwei Nummern mit Name, zwei Ketten', () => {
  const haupt = {id: 'qa'};
  const n2 = {id: 'n2'};
  const n99 = {id: 'n99'};
  const gold = {id: 'gold60'};
  const stahl = {id: 'stahl60'};
  const s = RESERVIERUNGEN[2].schluessel;
  const linien = r.geraeteLinien({
    haupt,
    linie: addonLinien,
    geraete: [
      {
        nummer: n2,
        merkmale: r.reservierungsMerkmale(s, 'Daniela'),
        kette: gold,
      },
      {
        nummer: n99,
        merkmale: r.reservierungsMerkmale(s, 'Matthias'),
        kette: stahl,
      },
    ],
  });
  const qa = linien.filter((l) => l.merchandiseId === 'qa');
  assert.equal(qa.length, 1);
  assert.equal(qa[0].quantity, 2);
  assert.equal(linien.at(-1).merchandiseId, 'qa');
  const nr2 = linien.find((l) => l.merchandiseId === 'n2');
  assert.deepEqual(
    nr2.attributes.map((a) => [a.key, a.value]),
    [
      ['_qm_addon', 'wunschnummer'],
      ['_reservierung', s],
      ['Reservierung', 'Daniela'],
    ],
  );
  assert.equal(linien.filter((l) => l.merchandiseId === 'gold60').length, 1);
  assert.equal(linien.filter((l) => l.merchandiseId === 'stahl60').length, 1);
  assert.equal(linien.length, 5);
  // zwei Goldketten = zwei Zeilen derselben Variante (Shopify fasst sie zu Menge 2)
  const zweiGold = r.geraeteLinien({
    haupt,
    linie: addonLinien,
    geraete: [
      {nummer: n2, kette: gold},
      {nummer: n99, kette: gold},
    ],
  });
  assert.equal(zweiGold.filter((l) => l.merchandiseId === 'gold60').length, 2);
  assert.deepEqual(
    r.geraeteLinien({haupt, linie: addonLinien, geraete: []}),
    [],
  );
});

test('Gravur ohne Namen: nur Nummer und Edition', () => {
  assert.equal(gravurText(88), '88/111 - 1st. Edition');
  assert.doesNotMatch(gravurText(88), /Lisa|reserv/i);
});

test('Seite: Spiegel nutzt Kaufseite und Loader, Liste nur auf dem Server', () => {
  const route = readFileSync(
    join(WURZEL, 'app/routes/products.qi-alpha-reserviert.$schluessel.jsx'),
    'utf8',
  );
  assert.match(
    route,
    /export \{default, links\} from '\.\/products\.qi-alpha'/,
  );
  assert.match(route, /noindex,nofollow/);
  assert.match(route, /redirect\('\/products\/qi-alpha', 302\)/);
  // Die Schlüssel-Liste darf nur von .server-Modulen und Routen-Loadern gelesen werden.
  const shop = readFileSync(
    join(WURZEL, 'app/components/campaign/TheAlphaShop.jsx'),
    'utf8',
  );
  assert.doesNotMatch(shop, /qi-alpha-reservierungen/);
  const bindung = readFileSync(
    join(WURZEL, 'app/lib/qi-master-addons.server.js'),
    'utf8',
  );
  assert.match(bindung, /reservierungsSperre\(/);
});
