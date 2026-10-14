// Hermetischer Test des Set-Schritts am Warenkorb (app/lib/kakao-set-zeile.server.js).
// Kein Netz. Ausführen: node --test test/kakao-set-zeile-server.test.mjs
//
// Gegenstand: Großjob vom 13.10.2026 „Warenkorb hängt", Segment s02. Christian:
// „die seite crystal cacao hängt voll im warenkorb … dauerhaft abstellen". Hinter
// jeder Kundenaktion standen bis zu zwei Shopify-Mutationen und vier Abfragen.
// Neu: Zeilen aus der Mutationsantwort, alle Varianten in einer Abfrage, und beim
// Festbetrag-Anker das Set direkt in einer Mutation. Die Preisregel bleibt.
//
// Jeder Ablauf läuft zweimal gegen denselben Fake-Shop:
//   KLASSISCH wie qiblanco.com (kein Vorladen, kein `direkt`, Mutationsantwort
//   ohne Zeilen) und NEU wie der Kakao-Laden (Vorladen, `direkt`,
//   kakaoStepperDirekt, Antwort mit Zeilen). Geprüft wird: derselbe Warenkorb am
//   Ende (Zeilen, Beträge), und wie viele Rundreisen es brauchte.
//
// Rot-vor-Grün: KAKAO_SERVER_MODUL=<alte Datei> node --test … lädt statt der
// Datei im Baum eine andere Fassung. Gegen die Fassung vor s02 müssen die Arme
// „NEU" rot sein; die Arme „KLASSISCH" pinnen den bisherigen Ablauf und bleiben
// grün (qiblanco.com fragt unverändert).
//
// Der Fake bildet nach, worauf es ankommt (gemessen 13./14.10. an der
// Storefront-API, DE/CH/US/AT): die Automatik zählt die Einzelpackungen beider
// Sorten zusammen und trägt ab 4 Packungen 30 %; Sets tragen keine Automatik,
// dort greift der Partnercode; ab 4 Packungen kosten die Sets in DE/AT, CH und
// US die Festbeträge; ein Sprung aufs Set an Ort behält die Zeilen-id; eine
// Mutation mit einem Fehler ändert nichts.
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {pathToFileURL} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spez, kontext, nächster) {
    if (spez.startsWith('~/')) {
      const pfad = APP + spez.slice(2);
      return nächster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    // Eine Fassung außerhalb des Baums (Rot-Arm) findet node_modules von hier.
    if (spez === '@shopify/hydrogen') {
      return nächster(spez, {...kontext, parentURL: import.meta.url});
    }
    return nächster(spez, kontext);
  },
});

const MODUL = process.env.KAKAO_SERVER_MODUL
  ? pathToFileURL(process.env.KAKAO_SERVER_MODUL).href
  : new URL('../app/lib/kakao-set-zeile.server.js', import.meta.url).href;
const server = await import(MODUL);
const {legeKakaoSetZeile, kakaoPackungenEingabe} = server;
const {
  KAKAO_EINZEL,
  KAKAO_FESTBETRAG_CENT,
  KAKAO_SETS,
  KAKAO_ZEILEN,
  kakaoFestbetragGetroffen,
  kakaoPreisschutz,
  kakaoSollZeilen,
} = await import('../app/lib/kakao-set-zeile.js');
const {setzePreismodus} = await import('../app/lib/preismodus.js');

const A = KAKAO_EINZEL.awake;
const C = KAKAO_EINZEL.create;
const FREMD = 'crystal-cacao-angebot';
const ANDERES = 'qibracelet-gold';
const WAEHRUNG = {DE: 'EUR', AT: 'EUR', CH: 'CHF', US: 'USD'};
const EINZEL_CENT = {
  DE: {awake: 7600, create: 7600},
  AT: {awake: 7600, create: 7600},
  CH: {awake: 7800, create: 7700},
  US: {awake: 9900, create: 9900},
};
const CODE = 'PARTNER10';

const vid = (handle) => `gid://shopify/ProductVariant/${handle}`;

// Automatik "Mengenrabatt" über die Einzelpackungen beider Sorten zusammen.
function satz(n) {
  if (n >= 3) return 0.3;
  return n === 2 ? 0.1 : 0;
}

// Preis je Einheit im Markt. Ab 4 Packungen die Festbeträge (DE und AT
// dieselben Euro, aber nur DE hat die Tabelle), 2 bis 3 Packungen: DE/AT
// centgleich zur Automatik, CH Create-Sets 1 Franken teurer, US Sorten-Sets
// 10 Dollar billiger und gemischte 20 (also unter dem Sorten-Set).
function preisCent(handle, land) {
  const je = KAKAO_ZEILEN[handle];
  if (!je) return handle === FREMD ? 5000 : 3000;
  const e = EINZEL_CENT[land];
  const n = je.awake + je.create;
  if (n === 1) return je.awake ? e.awake : e.create;
  if (n >= 4) {
    if (land === 'CH') return KAKAO_FESTBETRAG_CENT.CH.CHF[`${je.awake}+${je.create}`];
    if (land === 'US') return KAKAO_FESTBETRAG_CENT.US.USD[n];
    return KAKAO_FESTBETRAG_CENT.DE.EUR[n];
  }
  const einzelweg = Math.round((je.awake * e.awake + je.create * e.create) * (1 - satz(n)));
  if (land === 'CH' && je.awake === 0) return einzelweg + 100;
  if (land === 'US') return einzelweg - (je.awake && je.create ? 2000 : 1000);
  return einzelweg;
}

const traegtAutomatik = (handle) =>
  handle === FREMD || handle === A || handle === C;

/**
 * Fake von Storefront-API und Hydrogen-Cart-Handler.
 * mitZeilen: die Mutationsantwort trägt die Zeilen (Fragment des Kakao-Ladens).
 */
function fakeShop({land = 'DE', mitZeilen = false, stoerung = {}} = {}) {
  const log = [];
  let korb = null;
  let n = 0;
  const nichtVerfuegbar = new Set(stoerung.nichtVerfuegbar || []);
  const storefront = {
    i18n: {country: land, language: 'DE'},
    CacheShort: () => ({mode: 'short'}),
    CacheNone: () => ({mode: 'none'}),
    async query(q, opt = {}) {
      if (q.includes('KakaoSetVarianten(')) {
        log.push('Q:varianten');
        if (stoerung.variantenWirft) throw new Error('Netz weg');
        const daten = {};
        for (const m of q.matchAll(/k(\d+): product\(handle: "([^"]+)"\)/g)) {
          daten[`k${m[1]}`] = produkt(m[2]);
        }
        return daten;
      }
      if (q.includes('KakaoSetVariante(')) {
        log.push('Q:variante');
        return {product: produkt(opt.variables.handle)};
      }
      if (q.includes('KakaoSetZeilen(')) {
        log.push('Q:zeilen');
        return {cart: korb ? {lines: {nodes: knoten()}} : null};
      }
      throw new Error(`unbekannte Abfrage ${q.slice(0, 60)}`);
    },
  };
  function produkt(handle) {
    if (stoerung.fehlt === handle) return null;
    const ctx = storefront.i18n.country;
    return {
      selectedOrFirstAvailableVariant: {
        id: vid(handle),
        availableForSale: !nichtVerfuegbar.has(handle),
        price: {amount: (preisCent(handle, ctx) / 100).toFixed(2), currencyCode: WAEHRUNG[ctx]},
      },
    };
  }
  function zeilenKosten() {
    const einzelN = korb.zeilen
      .filter((z) => traegtAutomatik(z.handle))
      .reduce((s, z) => s + z.quantity, 0);
    return korb.zeilen.map((z) => {
      const brutto = preisCent(z.handle, korb.land) * z.quantity;
      const auto = traegtAutomatik(z.handle) ? Math.round(brutto * satz(einzelN)) : 0;
      const code = korb.code && !auto && KAKAO_ZEILEN[z.handle] ? Math.round(brutto * 0.1) : 0;
      return {z, brutto, auto, code, total: brutto - auto - code};
    });
  }
  function knoten() {
    return zeilenKosten().map(({z, auto, code, total}) => ({
      id: z.id,
      quantity: z.quantity,
      merchandise: {id: vid(z.handle), product: {handle: z.handle}},
      cost: {totalAmount: {amount: (total / 100).toFixed(2), currencyCode: WAEHRUNG[korb.land]}},
      discountAllocations: [
        ...(auto ? [{discountedAmount: {amount: (auto / 100).toFixed(2)}}] : []),
        ...(code ? [{discountedAmount: {amount: (code / 100).toFixed(2)}, code: CODE}] : []),
      ],
    }));
  }
  function antwort(fehler) {
    if (!korb) return {cart: null, userErrors: fehler ? [fehler] : [], warnings: []};
    const cart = {
      id: korb.id,
      totalQuantity: korb.zeilen.reduce((s, z) => s + z.quantity, 0),
      checkoutUrl: 'https://kasse.example/k',
    };
    if (mitZeilen) {
      cart.lines = {nodes: knoten()};
      if (stoerung.antwortOhneZuteilung) {
        for (const k of cart.lines.nodes) delete k.discountAllocations;
      }
    }
    return {cart, userErrors: fehler ? [fehler] : [], warnings: []};
  }
  const handleVon = (merchandiseId) => merchandiseId.split('/').pop();
  function anlegen(lines) {
    for (const l of lines) {
      if (nichtVerfuegbar.has(handleVon(l.merchandiseId))) {
        return {message: 'nicht verfügbar', code: 'MERCHANDISE_NOT_AVAILABLE'};
      }
    }
    for (const l of lines) {
      const handle = handleVon(l.merchandiseId);
      const da = korb.zeilen.find((z) => z.handle === handle);
      if (da) da.quantity += l.quantity;
      else korb.zeilen.unshift({id: `gid://shopify/CartLine/L${++n}`, handle, quantity: l.quantity});
    }
    return null;
  }
  const cart = {
    getCartId: () => korb?.id,
    async create({lines}) {
      log.push('M:create');
      korb = {id: 'gid://shopify/Cart/k1', land: storefront.i18n.country, zeilen: [], code: false};
      return antwort(anlegen(lines));
    },
    async addLines(lines) {
      if (!korb) return this.create({lines});
      log.push('M:add');
      return antwort(anlegen(lines));
    },
    async updateLines(lines) {
      log.push('M:update');
      if (stoerung.updateScheitert && stoerung.updateScheitert-- > 0) {
        return antwort({message: 'Fehler', code: 'INVALID'});
      }
      for (const l of lines) {
        if (!korb.zeilen.some((z) => z.id === l.id)) return antwort({message: 'Zeile fehlt'});
        if (l.merchandiseId && nichtVerfuegbar.has(handleVon(l.merchandiseId))) {
          return antwort({message: 'nicht verfügbar', code: 'MERCHANDISE_NOT_AVAILABLE'});
        }
      }
      for (const l of lines) {
        const z = korb.zeilen.find((x) => x.id === l.id);
        if (l.merchandiseId) z.handle = handleVon(l.merchandiseId);
        z.quantity = l.quantity;
      }
      korb.zeilen = korb.zeilen.filter((z) => z.quantity > 0);
      return antwort();
    },
    async removeLines(ids) {
      log.push('M:remove');
      korb.zeilen = korb.zeilen.filter((z) => !ids.includes(z.id));
      return antwort();
    },
  };
  return {
    cart,
    storefront,
    log,
    // Ausgangslage direkt setzen (ohne Log): [[handle, menge], …]
    lege(zeilen, {code = false, korbLand} = {}) {
      korb = {id: 'gid://shopify/Cart/k1', land: korbLand || land, zeilen: [], code};
      for (const [handle, quantity] of zeilen) {
        korb.zeilen.push({id: `gid://shopify/CartLine/L${++n}`, handle, quantity});
      }
    },
    // Endzustand, vergleichbar zwischen zwei Läufen (ohne Zeilen-ids).
    stand() {
      if (!korb) return null;
      return zeilenKosten()
        .map(({z, total}) => `${z.handle} x${z.quantity} = ${total} ${WAEHRUNG[korb.land]}`)
        .sort();
    },
    zeile: (handle) => korb?.zeilen.find((z) => z.handle === handle),
  };
}

// Die Warenkorb-Action, wie sie die zwei Läden rufen.
async function aktion(shop, {laden, art, inputs, env = {}}) {
  const {cart, storefront} = shop;
  const messung = {};
  const neu = laden === 'kakao';
  if (neu) server.kakaoVariantenVorladen(storefront);
  let result;
  if (art === 'LinesAdd') {
    result = await cart.addLines(inputs.lines);
  } else if (art === 'LinesUpdate') {
    const direkt = neu
      ? await server.kakaoStepperDirekt({storefront, inputs, cart, env, messung})
      : null;
    result =
      direkt ??
      (await cart.updateLines(
        await kakaoPackungenEingabe({storefront, inputs, cart, ...(neu ? {messung} : {})}),
      ));
  } else {
    result = await cart.removeLines(inputs.lineIds);
  }
  result = await legeKakaoSetZeile({
    cart,
    storefront,
    env,
    action: art,
    result,
    ...(neu ? {direkt: true, messung} : {}),
  });
  return {result, messung};
}

const nur = (log, praefix) => log.filter((x) => x.startsWith(praefix));

// Stepper-Eingabe, wie CartLineItem sie schickt.
function stepper(shop, handle, packungen) {
  const z = shop.zeile(handle);
  assert.ok(z, `keine Zeile ${handle}`);
  return {
    lines: [{id: z.id, quantity: z.quantity}],
    kakaoPackungen: {lineId: z.id, handle, packungen},
  };
}

/** Beide Läden, gleiche Ausgangslage, gleiche Aktion. */
async function beide({land = 'DE', vorher = [], code = false, korbLand, art, eingabe, env, stoerung}) {
  const laeufe = {};
  for (const laden of ['qiblanco', 'kakao']) {
    const shop = fakeShop({land, mitZeilen: laden === 'kakao', stoerung: stoerung && {...stoerung}});
    if (vorher.length || korbLand) shop.lege(vorher, {code, korbLand});
    const inputs = typeof eingabe === 'function' ? eingabe(shop) : eingabe;
    const {result, messung} = await aktion(shop, {laden, art, inputs, env});
    laeufe[laden] = {shop, result, messung, log: shop.log, stand: shop.stand()};
  }
  return laeufe;
}

test.beforeEach(() => setzePreismodus('brutto', 'test'));

// --- Gleichwertigkeit: der Direktweg entscheidet wie der Preisschutz ---------

test('Festbetrag getroffen => kakaoPreisschutz sagt anker_festbetrag für JEDEN lesbaren Einzelweg', () => {
  let faelle = 0;
  for (const land of ['DE', 'CH', 'US']) {
    for (let packungen = 4; packungen <= 22; packungen += 1) {
      for (let awake = 0; awake <= packungen; awake += 1) {
        const je = {awake, create: packungen - awake};
        const soll = kakaoSollZeilen(je);
        if (!soll) continue;
        const sets = soll.map((s) => ({
          packungen: s.je.awake + s.je.create,
          je: s.je,
          cent: preisCent(s.handle, land),
        }));
        const getroffen = kakaoFestbetragGetroffen({land, waehrung: WAEHRUNG[land], brutto: true, sets});
        assert.equal(getroffen, true, `${land} ${awake}+${packungen - awake}`);
        const setCent = soll.reduce((s, z, i) => s + sets[i].cent * z.quantity, 0);
        for (const zeileCent of [0, 1, setCent - 5000, setCent - 1, setCent, setCent + 1, setCent + 5000, 1e9]) {
          const schutz = kakaoPreisschutz({
            packungen,
            gemischt: awake > 0 && awake < packungen,
            setCent,
            zeileCent,
            einzelZeilen: (awake > 0) + (awake < packungen),
            umgerechnet: false,
            setStueck: soll.reduce((s, z) => s + z.quantity, 0),
            festbetrag: getroffen,
          });
          assert.deepEqual(schutz, {ok: true, grund: 'anker_festbetrag'}, `${land} ${awake}+${packungen - awake} zeile ${zeileCent}`);
          faelle += 1;
        }
      }
    }
  }
  assert.ok(faelle > 3000, `nur ${faelle} Fälle`);
});

test('ohne Festbetrag (AT, netto, 1 Cent daneben, unter 4) entscheidet weiter der Einzelweg', () => {
  const set4 = [{packungen: 4, je: {awake: 4, create: 0}, cent: 21300}];
  assert.equal(kakaoFestbetragGetroffen({land: 'AT', waehrung: 'EUR', brutto: true, sets: set4}), false);
  assert.equal(kakaoFestbetragGetroffen({land: 'DE', waehrung: 'EUR', brutto: false, sets: set4}), false);
  assert.equal(
    kakaoFestbetragGetroffen({land: 'DE', waehrung: 'EUR', brutto: true, sets: [{...set4[0], cent: 21301}]}),
    false,
  );
  // Gleicher Betrag, aber 3 Packungen: der Anker greift erst ab 4.
  const schutz = kakaoPreisschutz({packungen: 3, gemischt: false, setCent: 21300, zeileCent: 15960, einzelZeilen: 1, festbetrag: true});
  assert.notEqual(schutz.grund, 'anker_festbetrag');
});

// --- KLASSISCH: qiblanco.com fragt unverändert --------------------------------

test('KLASSISCH: In den Warenkorb 3x Awake = 2 Mutationen, Nachlesen und Variante wie bisher', async () => {
  const shop = fakeShop({land: 'DE'});
  await aktion(shop, {laden: 'qiblanco', art: 'LinesAdd', inputs: {lines: [{merchandiseId: vid(A), quantity: 3}]}});
  assert.deepEqual(shop.log, ['M:create', 'Q:zeilen', 'Q:variante', 'M:update']);
  assert.deepEqual(shop.stand(), ['bundle-3x-awake x1 = 15960 EUR']);
});

test('KLASSISCH: Stepper 3er-Set -> 4 geht über die Einzelpackungen (2 Mutationen, 3 Abfragen)', async () => {
  const shop = fakeShop({land: 'DE'});
  shop.lege([['bundle-3x-awake', 1]]);
  await aktion(shop, {laden: 'qiblanco', art: 'LinesUpdate', inputs: stepper(shop, 'bundle-3x-awake', 4)});
  assert.deepEqual(shop.log, ['Q:variante', 'M:update', 'Q:zeilen', 'Q:variante', 'M:update']);
  assert.deepEqual(shop.stand(), ['bundle-4x-awake x1 = 21300 EUR']);
});

test('KLASSISCH: Antwort ohne Zeilen -> es wird nachgelesen', async () => {
  const shop = fakeShop({land: 'DE'});
  shop.lege([[A, 1]]);
  await aktion(shop, {laden: 'qiblanco', art: 'LinesAdd', inputs: {lines: [{merchandiseId: vid(A), quantity: 1}]}});
  assert.equal(nur(shop.log, 'Q:zeilen').length, 1);
  assert.deepEqual(shop.stand(), ['bundle-2x-awake x1 = 13680 EUR']);
});

// --- NEU: weniger Rundreisen, derselbe Warenkorb ----------------------------

test('NEU: Stepper 3er-Set -> 4 (DE): EINE Mutation, gleicher Warenkorb, Zeilen-id bleibt', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['bundle-4x-awake x1 = 21300 EUR']);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update']);
  assert.deepEqual(nur(l.kakao.log, 'Q:'), ['Q:varianten']);
  assert.equal(l.kakao.messung.mutationen, 1);
  assert.equal(l.kakao.messung.abfragen ?? 0, 0);
  assert.equal(l.kakao.shop.zeile('bundle-4x-awake').id, 'gid://shopify/CartLine/L1');
});

test('NEU: Stepper je Zusammensetzung 3 -> 4..7 und 8 (DE, CH, US): gleicher Warenkorb, eine Mutation', async () => {
  for (const land of ['DE', 'CH', 'US']) {
    for (const [handle, packungen] of [
      ['bundle-3x-awake', 4],
      ['bundle-2x-awake-1x-create', 4],
      ['bundle-1x-awake-2x-create', 4],
      ['mengenrabatt-3x-create', 4],
      ['bundle-2x-awake-2x-create', 5],
      ['bundle-3x-awake-2x-create', 6],
      ['bundle-6x-create', 7],
      ['bundle-7x-awake', 8],
      ['bundle-4x-awake', 8],
    ]) {
      const l = await beide({land, vorher: [[handle, 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, handle, packungen)});
      const fall = `${land} ${handle} -> ${packungen}`;
      assert.deepEqual(l.kakao.stand, l.qiblanco.stand, fall);
      assert.equal(l.kakao.stand.length, 1, `${fall}: ${l.kakao.stand}`);
      assert.match(l.kakao.stand[0], /^bundle-/, fall);
      assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update'], fall);
      assert.ok(nur(l.qiblanco.log, 'M:').length >= 2, fall);
    }
  }
});

test('NEU: Stepper 4 -> 3 (unter dem Festbetrag): Umweg bleibt, aber ohne Nachlesen', async () => {
  const l = await beide({vorher: [['bundle-4x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-4x-awake', 3)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['bundle-3x-awake x1 = 15960 EUR']);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update', 'M:update']);
  assert.deepEqual(nur(l.kakao.log, 'Q:'), ['Q:varianten']);
});

test('NEU: In den Warenkorb 3x Awake: 2 Mutationen ohne Abfrage dazwischen', async () => {
  const l = await beide({art: 'LinesAdd', eingabe: {lines: [{merchandiseId: vid(A), quantity: 3}]}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:create', 'M:update']);
  assert.deepEqual(nur(l.kakao.log, 'Q:'), ['Q:varianten']);
});

test('NEU: 1 Awake zum 4er-Set dazu (DE): Normalform direkt, 2 statt 3 Mutationen', async () => {
  const l = await beide({vorher: [['bundle-4x-awake', 1]], art: 'LinesAdd', eingabe: {lines: [{merchandiseId: vid(A), quantity: 1}]}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['bundle-5x-awake x1 = 26600 EUR']);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:add', 'M:update']);
  assert.deepEqual(nur(l.qiblanco.log, 'M:'), ['M:add', 'M:update', 'M:update']);
});

test('NEU: gemischtes Set 2+1 plus 1 Create (CH): direkt auf 2+2 zum Festbetrag', async () => {
  const l = await beide({land: 'CH', vorher: [['bundle-2x-awake-1x-create', 1]], art: 'LinesAdd', eingabe: {lines: [{merchandiseId: vid(C), quantity: 1}]}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['bundle-2x-awake-2x-create x1 = 21700 CHF']);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:add', 'M:update']);
});

test('NEU: Partnercode am Warenkorb: dieselben Beträge, Zuteilungen aus der Antwort', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], code: true, art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['bundle-4x-awake x1 = 19170 EUR']);
});

// --- NEU, wo der Preisschutz den Einzelweg braucht: alles wie bisher ---------

test('NEU: AT (Euro, keine Festbetrag-Tabelle): kein Sprung, Einzelpackungen bleiben wie bisher', async () => {
  const l = await beide({land: 'AT', vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['crystal-cacao-awake x4 = 21280 EUR']);
});

test('NEU: Preismodus netto: kein Sprung, der Einzelweg entscheidet wie bisher', async () => {
  setzePreismodus('netto', 'test');
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['crystal-cacao-awake x4 = 21280 EUR']);
});

test('NEU: 2 bis 3 Packungen gemischt (US): Sorten-Set-Anker wie bisher', async () => {
  const l = await beide({land: 'US', vorher: [['bundle-2x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-2x-awake', 3)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  const m = await beide({land: 'US', art: 'LinesAdd', eingabe: {lines: [{merchandiseId: vid(A), quantity: 1}, {merchandiseId: vid(C), quantity: 1}]}});
  assert.deepEqual(m.kakao.stand, m.qiblanco.stand);
  assert.ok(m.kakao.stand.every((z) => !z.startsWith('bundle-1x-awake-1x-create')), String(m.kakao.stand));
});

test('NEU: CH Create-Set 3 teurer als der Einzelweg: bleibt Einzelpackung wie bisher', async () => {
  const l = await beide({land: 'CH', vorher: [['bundle-4x-create', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-4x-create', 3)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['crystal-cacao-create x3 = 16170 CHF']);
});

test('NEU: fremde Kakao-Zeile daneben: Sprung wird von der Normalform zurückgelegt, Ende wie bisher', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1], [FREMD, 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.ok(l.kakao.stand.some((z) => z.startsWith(`${A} x4`)), String(l.kakao.stand));
});

test('NEU: zweite Kakao-Zeile daneben (Set 4 + Set 3, Stepper auf dem 3er): Ende wie bisher', async () => {
  const l = await beide({vorher: [['bundle-4x-awake', 1], ['mengenrabatt-3x-create', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'mengenrabatt-3x-create', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  // 4 Awake + 4 Create = 8 Packungen: Set 2+2 x2 zum Festbetrag je 213 €.
  assert.deepEqual(l.kakao.stand, ['bundle-2x-awake-2x-create x2 = 42600 EUR']);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update', 'M:update']);
});

test('NEU: andere Ware im Warenkorb stört den Sprung nicht', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1], [ANDERES, 2]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update']);
});

// --- FAIL-SOFT ---------------------------------------------------------------

test('FAIL-SOFT: Warenkorb in CHF, Laden fragt in DE -> Sprung zurück, Ende wie bisher', async () => {
  const l = await beide({land: 'DE', korbLand: 'CH', vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4)});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.ok(l.kakao.stand.every((z) => z.endsWith('CHF')));
});

test('FAIL-SOFT: Set nicht verfügbar -> kein Sprung, Ende wie bisher', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4), stoerung: {nichtVerfuegbar: ['bundle-4x-awake']}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(l.kakao.stand, ['crystal-cacao-awake x4 = 21280 EUR']);
});

test('FAIL-SOFT: Varianten-Abfrage scheitert -> einzeln wie bisher, gleicher Warenkorb', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4), stoerung: {variantenWirft: true}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.ok(nur(l.kakao.log, 'Q:variante').length >= 1);
});

test('FAIL-SOFT: direkte Mutation scheitert -> klassischer Weg, gleicher Warenkorb', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4), stoerung: {updateScheitert: 1}});
  // Im klassischen Lauf trifft die Störung die erste Mutation des Umwegs.
  assert.deepEqual(l.kakao.stand, ['bundle-4x-awake x1 = 21300 EUR']);
});

test('FAIL-SOFT: Antwort ohne Rabatt-Zuteilungen -> es wird nachgelesen', async () => {
  const l = await beide({vorher: [[A, 1]], art: 'LinesAdd', eingabe: {lines: [{merchandiseId: vid(A), quantity: 1}]}, stoerung: {antwortOhneZuteilung: true}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.equal(nur(l.kakao.log, 'Q:zeilen').length, 1);
});

test('Kill-Schalter KAKAO_SET_DIREKT=off: derselbe Ablauf wie klassisch, nur aus der Antwort gelesen', async () => {
  const l = await beide({vorher: [['bundle-3x-awake', 1]], art: 'LinesUpdate', eingabe: (s) => stepper(s, 'bundle-3x-awake', 4), env: {KAKAO_SET_DIREKT: 'off'}});
  assert.deepEqual(l.kakao.stand, l.qiblanco.stand);
  assert.deepEqual(nur(l.kakao.log, 'M:'), ['M:update', 'M:update']);
});

test('Kill-Schalter KAKAO_SET_ZEILE=off: kein Set-Schritt, auch kein Sprung', async () => {
  const shop = fakeShop({land: 'DE', mitZeilen: true});
  shop.lege([['bundle-3x-awake', 1]]);
  await aktion(shop, {laden: 'kakao', art: 'LinesUpdate', inputs: stepper(shop, 'bundle-3x-awake', 4), env: {KAKAO_SET_ZEILE: 'off'}});
  assert.deepEqual(shop.stand(), ['crystal-cacao-awake x4 = 21280 EUR']);
});

test('Set-Tabelle: jeder Handle der Normalform ist in der einen Varianten-Abfrage', () => {
  for (const h of [...Object.values(KAKAO_SETS), A, C]) assert.ok(KAKAO_ZEILEN[h], h);
});
