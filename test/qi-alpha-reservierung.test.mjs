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

test('einheitenLinien: zwei Geräte = Qi Alpha® Menge 2, zwei Nummern mit Name, zwei Ketten', () => {
  const haupt = {id: 'qa'};
  const n2 = {id: 'n2'};
  const n99 = {id: 'n99'};
  const gold = {id: 'gold60'};
  const stahl = {id: 'stahl60'};
  const s = RESERVIERUNGEN[2].schluessel;
  const linien = r.einheitenLinien({
    haupt,
    linie: addonLinien,
    einheiten: [
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
  const zweiGold = r.einheitenLinien({
    haupt,
    linie: addonLinien,
    einheiten: [
      {nummer: n2, kette: gold},
      {nummer: n99, kette: gold},
    ],
  });
  assert.equal(zweiGold.filter((l) => l.merchandiseId === 'gold60').length, 2);
  assert.deepEqual(
    r.einheitenLinien({haupt, linie: addonLinien, einheiten: []}),
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

test('Warenkorb-Sperre liest 250 Zeilen, nicht Hydrogens Vorgabe 100', () => {
  // Gegenprüfung 01.11.2026: eine reservierte Nummer als erste von 101 Zeilen
  // blieb ohne Schlüssel im Korb, weil cart.get ohne numCartLines nur 100 liest.
  const bindung = readFileSync(
    join(WURZEL, 'app/lib/qi-master-addons.server.js'),
    'utf8',
  );
  const rumpf = bindung.slice(bindung.indexOf('export async function bindeQiMasterAddons'));
  assert.match(rumpf, /cart\.get\(\{cartId, numCartLines: 250\}\)/);
});

test('Namen der Reservierungen stehen nur in der Server-Liste', () => {
  const vergeben = readFileSync(
    join(WURZEL, 'app/components/campaign/the-alpha-daten-serie-vergeben.js'),
    'utf8',
  );
  for (const r of RESERVIERUNGEN)
    for (const x of r.nummern) assert.ok(!vergeben.includes(x.name), x.name);
});

/* Rabatt am persönlichen Link (Christian 02.11.2026, Job 20261102-prio1-qi-
 * alpha-link-daniela-matthias-1500-rabatt-wunschnummer-gratis). */
const {RESERVIERUNGS_RABATTE} = await import(
  join(WURZEL, 'app/lib/qi-alpha-reservierung-rabatte.server.js')
);
const LINK = 'wSIMCnsmwwigXD36YlzcmS';
const GEHEIM = RESERVIERUNGS_RABATTE[LINK].code;
const mitLink = {attributes: [{key: '_reservierung', value: LINK}]};

test('Rabatt: nur der eine Link, 1.500 € je Qi Alpha, Code nie im Browser', () => {
  assert.deepEqual(Object.keys(RESERVIERUNGS_RABATTE), [LINK]);
  assert.equal(r.rabattAngabe(RESERVIERUNGS_RABATTE, 'zrtdN1K39oTMjNu4gqfp7n'), null);
  assert.equal(r.rabattAngabe(RESERVIERUNGS_RABATTE, '90TDcbhtcWSZCCyM47GABe'), null);
  const a = r.rabattAngabe(RESERVIERUNGS_RABATTE, LINK);
  assert.deepEqual(a, {jeAlphaEur: 1500, wunschnummerWertEur: 2000});
  assert.ok(!JSON.stringify(a).includes(GEHEIM));
  for (const datei of [
    'app/lib/qi-alpha-reservierung.js',
    'app/components/campaign/TheAlphaShop.jsx',
    'app/components/CartLineItem.jsx',
  ]) {
    assert.ok(!readFileSync(join(WURZEL, datei), 'utf8').includes(GEHEIM), datei);
  }
});

test('Rabatt-Regel: Schlüssel setzt den Code und verdrängt jeden anderen', () => {
  const k = RESERVIERUNGS_RABATTE;
  assert.deepEqual(r.rabattCodeKorrektur([mitLink], [], k), [GEHEIM]);
  assert.deepEqual(r.rabattCodeKorrektur([mitLink], ['HEALWORLD5'], k), [GEHEIM]);
  assert.deepEqual(r.rabattCodeKorrektur([mitLink], [GEHEIM, 'PARTNER5'], k), [GEHEIM]);
  assert.equal(r.rabattCodeKorrektur([mitLink], [GEHEIM], k), null);
});

test('Rabatt-Regel: ohne Schlüssel fällt der Code heraus, fremde Codes bleiben', () => {
  const k = RESERVIERUNGS_RABATTE;
  assert.deepEqual(r.rabattCodeKorrektur([{attributes: []}], [GEHEIM], k), []);
  assert.deepEqual(r.rabattCodeKorrektur([], [GEHEIM.toLowerCase(), 'X'], k), ['X']);
  assert.equal(r.rabattCodeKorrektur([{attributes: []}], ['HEALWORLD5'], k), null);
  const lisa = {attributes: [{key: '_reservierung', value: 'zrtdN1K39oTMjNu4gqfp7n'}]};
  assert.equal(r.rabattCodeKorrektur([lisa], [], k), null);
  assert.equal(r.rabattCodeKorrektur([lisa], ['PARTNER5'], k), null);
});

test('Alpha-Zeile trägt den Schlüssel nur am Link mit Rabatt, auch ohne Nummer', () => {
  const haupt = {id: 'A'};
  const merkmale = [{key: '_reservierung', value: LINK}];
  const ohne = r.einheitenLinien({
    haupt,
    linie: addonLinien,
    einheiten: [{nummer: null, kette: null}],
    hauptMerkmale: merkmale,
  });
  assert.equal(ohne.length, 1);
  assert.equal(ohne[0].quantity, 1);
  assert.deepEqual(ohne[0].attributes, merkmale);
  const lisa = r.einheitenLinien({
    haupt,
    linie: addonLinien,
    einheiten: [{nummer: {id: 'N'}, kette: null}],
  });
  assert.equal(lisa.at(-1).attributes, undefined);
});

test('Warenkorb-Anzeige: gratis und Vorteil lesen die Zeile', () => {
  const nummer = {
    cost: {amountPerQuantity: {amount: '0.0'}, compareAtAmountPerQuantity: {amount: '2000.0'}},
  };
  assert.equal(r.gratisWert(nummer), 2000);
  assert.equal(r.gratisWert({cost: {amountPerQuantity: {amount: '2000.0'}}}), null);
  assert.equal(r.gratisWert({cost: {amountPerQuantity: {amount: '0.0'}}}), null);
  const alpha = {
    ...mitLink,
    quantity: 2,
    discountAllocations: [{discountedAmount: {amount: '3000.0'}}],
  };
  assert.equal(r.vorteilJeStueck(alpha), 1500);
  assert.equal(r.vorteilJeStueck({...alpha, attributes: []}), null);
  assert.equal(r.vorteilJeStueck({...mitLink, discountAllocations: []}), null);
});
