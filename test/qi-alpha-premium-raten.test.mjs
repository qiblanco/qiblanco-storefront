/**
 * Raten (geteilte Zahlung) im Qi-Alpha®-Premium-Bereich (node --test) —
 * Job 20261101-prio10-qi-alpha-premium-checkout-raten.
 *
 * DER WEG: Schritt 1 aus /products/qi-alpha-reserviert/<schlüssel> trägt den
 * Schlüssel als Warenkorb-Merkmal _qa_reservierung an Bestellung 1; der
 * Wächter (qi-alpha-teilzahlung) hängt ihn als `&reservierung=` an den
 * Rest-Link; cart.$lines.jsx setzt damit `_reservierung` und den Namen an die
 * Nummern-Zeile, und die Sperre (reservierungsSperre) lässt die reservierte
 * Nummer stehen. Gemessen: Schritt-1-Link, Merkmale aus der Adresse, die
 * Permalink-Regel, die NAHT Permalink -> Sperre, die NAHT zum Vertrag des
 * Wächters und die Verdrahtung in Kaufseite und Permalink.
 * ROT VOR GRÜN: auf der Basis 8c39db23 (Premium ohne Raten) fehlen
 * permalinkReservierung und TEILZAHLUNG.reservierung, der Import scheitert.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {registerHooks} from 'node:module';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

// Server-Dateien mit `~/`-Importen (wie kakao-set-zeile-server.test.mjs).
const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, naechster) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spez, kontext);
  },
});

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');
const tz = await import(join(WURZEL, 'app/lib/qi-alpha-teilzahlung.js'));
const rs = await import(join(WURZEL, 'app/lib/qi-alpha-reservierung.js'));
const pm = await import(
  join(WURZEL, 'app/lib/qi-alpha-reservierung-permalink.server.js')
);
const VERTRAG_PFAD =
  process.env.QA_VERTRAG ||
  '/srv/openclaw/shared-state/qi-alpha-teilzahlung/config/vertrag.json';

const S = 'abcdEFGH12345678wxyz';
const FREMD = 'zzzzYYYY12345678abcd';
const LISTE = [
  {schluessel: S, nummern: [{n: 2, name: 'Daniela'}, {n: 99, name: 'Matthias'}]},
  {schluessel: FREMD, nummern: [{n: 88, name: 'Lisa'}]},
];
const V = (n) => `gid://shopify/ProductVariant/${n}`;

test('Schritt-1-Link trägt den Schlüssel als _qa_reservierung, eine fremde Form nie', () => {
  const mit = new URL(
    tz.teil1Link({vorgang: 'qa-x-1', konfig: 'k', reservierung: S}),
    'https://x.invalid',
  );
  assert.equal(mit.searchParams.get('_qa_reservierung'), S);
  for (const r of [null, '', 'kurz', 'abc&discount=GRATIS1234567', `${S}/`]) {
    const ohne = new URL(
      tz.teil1Link({vorgang: 'qa-x-1', konfig: 'k', reservierung: r}),
      'https://x.invalid',
    );
    assert.equal(ohne.searchParams.has('_qa_reservierung'), false, String(r));
  }
});

test('Merkmale aus der Adresse: _qa_reservierung nur, wenn die Server-Liste den Schlüssel kennt', () => {
  const q = new URLSearchParams({
    _qa_vorgang: 'qa-x-1',
    _qa_konfig: 'qi-alpha=1;nummer=2;kette=-;partner=-',
    _qa_reservierung: S,
  });
  const bekannt = (s) => s === S;
  const mit = tz.merkmaleAusQuery(q, {reservierungBekannt: bekannt});
  assert.deepEqual(
    mit.find((m) => m.key === '_qa_reservierung'),
    {key: '_qa_reservierung', value: S},
  );
  // Ohne Prüfer (Vorgabe) und mit unbekanntem Schlüssel: kein Merkmal.
  assert.equal(tz.merkmaleAusQuery(q).some((m) => m.key === '_qa_reservierung'), false);
  q.set('_qa_reservierung', FREMD);
  assert.equal(
    tz.merkmaleAusQuery(q, {reservierungBekannt: bekannt}).some(
      (m) => m.key === '_qa_reservierung',
    ),
    false,
  );
  // Die zwei Vertrags-Merkmale bleiben unverändert.
  assert.deepEqual(tz.TEILZAHLUNG.merkmale, {vorgang: '_qa_vorgang', konfig: '_qa_konfig'});
});

test('Permalink-Regel: nur Nummern-Zeilen DIESER Reservierung bekommen Schlüssel und Namen', () => {
  const res = rs.reservierungZu(LISTE, S);
  const zeilen = [
    {merchandiseId: V(1), quantity: 1},
    {merchandiseId: V(902), quantity: 1},
    {merchandiseId: V(988), quantity: 1},
    {merchandiseId: V(3), quantity: 1},
  ];
  const nummern = new Map([
    [V(902), 2],
    [V(988), 88],
  ]);
  const aus = pm.permalinkReservierung(zeilen, nummern, res);
  assert.deepEqual(aus[1].attributes, [
    {key: '_reservierung', value: S},
    {key: 'Reservierung', value: 'Daniela'},
  ]);
  assert.equal(aus[0].attributes, undefined, 'Qi Alpha ohne Merkmal');
  assert.equal(aus[2].attributes, undefined, 'fremde reservierte Nummer ohne Merkmal');
  assert.equal(aus[3].attributes, undefined, 'Kette ohne Merkmal');
  // Ohne Reservierung: unverändert.
  assert.deepEqual(pm.permalinkReservierung(zeilen, nummern, null), zeilen);
});

test('NAHT Permalink -> Sperre: Rest-Link mit Schlüssel behält die Nummer, ohne Schlüssel fällt sie', () => {
  const res = rs.reservierungZu(LISTE, S);
  const zeilen = [{merchandiseId: V(902), quantity: 1}];
  const nummern = new Map([[V(902), 2]]);
  const imKorb = (z, i) => ({id: `l${i}`, nummer: nummern.get(z.merchandiseId), attributes: z.attributes});
  const mit = pm.permalinkReservierung(zeilen, nummern, res).map(imKorb);
  assert.deepEqual(rs.reservierungsSperre(mit, LISTE), []);
  const ohne = zeilen.map(imKorb);
  assert.deepEqual(rs.reservierungsSperre(ohne, LISTE), ['l0']);
  // Schlüssel eines FREMDEN Links: die Nummer 2 gehört nicht dazu, also kein
  // Merkmal und die Sperre nimmt sie heraus.
  const fremd = pm
    .permalinkReservierung(zeilen, nummern, rs.reservierungZu(LISTE, FREMD))
    .map(imKorb);
  assert.deepEqual(rs.reservierungsSperre(fremd, LISTE), ['l0']);
});

test('NAHT Vertrag: Merkmal, Parameter und Schlüssel-Form = vertrag.json Abschnitt reservierung', () => {
  assert.ok(existsSync(VERTRAG_PFAD), `Vertrag fehlt: ${VERTRAG_PFAD}`);
  const v = JSON.parse(readFileSync(VERTRAG_PFAD, 'utf8'));
  assert.ok(v.reservierung, 'Vertrag ohne Abschnitt reservierung');
  assert.equal(tz.TEILZAHLUNG.reservierung.merkmal, v.reservierung.merkmal);
  assert.equal(tz.TEILZAHLUNG.reservierung.param, v.reservierung.link_param);
  assert.equal(`^${rs.SCHLUESSEL_RX.source.replace(/^\^|\$$/g, '')}$`, v.reservierung.format);
  // Der Wächter baut .../cart/<qi>:1,<nr>:1?discount=<CODE>&reservierung=<S>:
  // der Permalink liest genau diesen Parameter.
  const rest = new URL(
    `https://qiblanco.com/cart/1:1,2:1?discount=QA-REST-1-ABCD&${v.reservierung.link_param}=${S}`,
  );
  assert.equal(rest.searchParams.get(tz.TEILZAHLUNG.reservierung.param), S);
  assert.deepEqual(tz.rabattcodesAusQuery(rest.searchParams), ['QA-REST-1-ABCD']);
});

test('Verdrahtung: Kaufseite bietet Raten auch im Premium-Bereich, je Gerät; Permalink setzt den Schlüssel', () => {
  const seite = lies('app/components/campaign/TheAlphaShop.jsx');
  assert.doesNotMatch(seite, /ratenAn = !premium/, 'Premium ohne Raten (alter Stand)');
  assert.match(seite, /const ratenAn = !rabatt && ratenMarkt\(\{waehrung, land\}\)/);
  assert.match(seite, /ratenJeGeraet = premium && einheiten\.length > 1/);
  assert.match(seite, /reservierung: ratenGeraet\?\.name \? reservierung\.schluessel : null/);
  const daten = lies('app/components/campaign/the-alpha-shop-daten.js');
  assert.match(daten, /jeGeraet:/);
  const permalink = lies('app/routes/cart.$lines.jsx');
  assert.match(permalink, /reservierungAmPermalink\(/);
  assert.match(permalink, /merkmaleAusQuery\(searchParams, \{sitzungsCodes, reservierungBekannt\}\)/);
  assert.match(permalink, /lines: zeilen,/, 'cart.create nimmt die Zeilen mit Merkmal');
  // Reihenfolge: Merkmal vor der Sperre (bindeQiMasterAddons).
  assert.ok(
    permalink.indexOf('reservierungAmPermalink(') < permalink.indexOf('bindeQiMasterAddons({'),
  );
  // Die Server-Liste bleibt aus dem Browser-Paket.
  const server = lies('app/lib/qi-alpha-reservierung-permalink.server.js');
  assert.match(server, /qi-alpha-reservierungen\.server/);
  assert.doesNotMatch(
    lies('app/lib/qi-alpha-teilzahlung.js'),
    /qi-alpha-reservierungen\.server/,
  );
});

/*
 * LINK MIT EIGENEM RABATT (Job 20261101-prio10-qi-alpha-premium-raten-deploy):
 * am Link 2+99 setzt rabattCodeKorrektur seit 02.11.2026 genau seinen Code und
 * nimmt jeden anderen heraus, sobald eine Zeile den Schlüssel trägt. Im
 * Rest-Korb wäre das QA-REST mit der Anrechnung der 10.000 €. Gemessen an den
 * ECHTEN Server-Listen: ein Rabatt-Schlüssel trägt keine Raten, die übrigen ja.
 */
const {RESERVIERUNGEN} = await import(
  join(WURZEL, 'app/lib/qi-alpha-reservierungen.server.js')
);
const {RESERVIERUNGS_RABATTE} = await import(
  join(WURZEL, 'app/lib/qi-alpha-reservierung-rabatte.server.js')
);
const keinNetz = {
  CacheNone: () => ({}),
  query: () => {
    throw new Error('Storefront gefragt');
  },
};

test('Rabatt-Link: Schlüssel gilt für die Raten als unbekannt, kein Merkmal an Bestellung 1', () => {
  const mitRabatt = Object.keys(RESERVIERUNGS_RABATTE);
  assert.ok(mitRabatt.length >= 1, 'Messgrundlage: kein Link mit Rabatt in der Liste');
  for (const k of mitRabatt) {
    assert.ok(rs.reservierungZu(RESERVIERUNGEN, k), `Rabatt-Schlüssel ohne Reservierung: ${k}`);
    assert.equal(pm.reservierungBekannt(k), false, k);
    const q = new URLSearchParams({_qa_vorgang: 'qa-x-1', _qa_reservierung: k});
    const m = tz.merkmaleAusQuery(q, {reservierungBekannt: pm.reservierungBekannt});
    assert.equal(m.some((x) => x.key === '_qa_reservierung'), false, k);
  }
  const ohne = RESERVIERUNGEN.map((r) => r.schluessel).filter(
    (k) => !RESERVIERUNGS_RABATTE[k],
  );
  assert.ok(ohne.length >= 1, 'Messgrundlage: kein Link ohne Rabatt');
  for (const k of ohne) assert.equal(pm.reservierungBekannt(k), true, k);
});

test('Rabatt-Link: Rest-Permalink bleibt unverändert und fragt die Storefront nicht', async () => {
  const zeilen = [{merchandiseId: V(5), quantity: 1}];
  for (const k of Object.keys(RESERVIERUNGS_RABATTE)) {
    const aus = await pm.reservierungAmPermalink({
      storefront: keinNetz,
      zeilen,
      schluessel: k,
    });
    assert.equal(aus, zeilen, k);
  }
});

test('Link ohne Rabatt: Rest-Permalink setzt Schlüssel und Namen an die Nummer', async () => {
  const r = RESERVIERUNGEN.find((x) => !RESERVIERUNGS_RABATTE[x.schluessel]);
  const n = r.nummern[0];
  const storefront = {
    CacheNone: () => ({}),
    query: async () => ({
      nodes: [
        {id: V(7), title: `${n.n} / Gold`, product: {handle: 'qi-alpha-wunschnummer'}},
        {id: V(8), title: 'Default Title', product: {handle: 'qi-alpha'}},
      ],
    }),
  };
  const aus = await pm.reservierungAmPermalink({
    storefront,
    zeilen: [
      {merchandiseId: V(8), quantity: 1},
      {merchandiseId: V(7), quantity: 1},
    ],
    schluessel: r.schluessel,
  });
  const nummer = aus.find((z) => z.merchandiseId === V(7));
  const werte = Object.fromEntries((nummer.attributes || []).map((a) => [a.key, a.value]));
  assert.equal(werte[rs.MERKMAL_SCHLUESSEL], r.schluessel);
  assert.equal(aus.find((z) => z.merchandiseId === V(8)).attributes, undefined);
});
