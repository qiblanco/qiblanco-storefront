/**
 * PREISMODUS netto|brutto — der Kanon rechnet in BEIDEN Welten den Betrag, den
 * die Kasse verlangt (Grossjob 20260924-kasse-zeigt-bruttopreise-wie-
 * produktseite-prio10, s02; Christian-Auftrag CW-20260924-094bcdd4).
 *
 * DIE TRAGENDE EIGENSCHAFT IST EINE INVARIANZ: derselbe Kunde sieht vor und
 * nach dem Kipp dieselbe Zahl. Vorher liefert die API netto und der Kanon
 * schlägt auf; nachher liefert sie brutto (s04 schreibt die Basispreise um,
 * AT bekommt über "Dynamisch" basis/1,19*1,20) und der Kanon schlägt NICHT
 * auf. Deshalb vergleicht jeder Arm unten die netto-Welt mit der brutto-Welt.
 *
 * ROT VOR GRÜN: ein Kanon, der den Modus ignoriert (brutto-Preis x 1,19),
 * muss hier rot werden. Belegt per Mutant (anzeigeSatz ohne istBrutto-Zweig,
 * bruttoZeileRoh ohne istBrutto-Zweig, paket-preis ohne Heimatsatz-Abzug) --
 * Kommandos und Ausgabe im RESULT des Segments. Die Mutanten zielen je auf
 * EINEN Arm; der Arm, der rot werden soll, steht im Namen.
 */
import {describe, it, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {
  PREISMODUS_VORGABE,
  istBrutto,
  preismodus,
  preismodusStand,
  preismodusZuruecksetzen,
  setzePreismodus,
  uebernehmeMetafeld,
  ladePreismodus,
  vorschauModus,
  rootDatenGesehen,
  rootDatenZuAlt,
  PREISMODUS_MAX_ALTER_MS,
} from '../app/lib/preismodus.js';
import {anzeigeSatz, bruttoAnzeige} from '../app/lib/markt-pricing.js';
import {
  getCartLineGrossDisplayTotalExact,
  taxRateForHandle,
} from '../app/lib/cart-display-pricing.js';
import {paketBetraege, festAbzugBrutto} from '../app/lib/paket-preis.js';

const r2 = (x) => Math.round(x * 100) / 100;

// Netto-Basis (Storefront-API 2026-09-12/24) und der Bruttowert, den s04
// schreibt: der Betrag, den die Seite HEUTE zeigt.
const FAELLE = [
  {handle: 'qione-2-pro', netto: 913.45, brutto: 1087.0},
  {handle: 'qihome-air', netto: 4187.4, brutto: 4983.0},
  {handle: 'crystal-cacao-awake', netto: 71.03, brutto: 76.0},
  {handle: 'bundle-2x-awake', netto: 114.02, brutto: 122.0},
];

/** Was Shopify unter "Dynamisch" in AT liefert: basis/(1+heimat)*(1+land). */
function atPreisBrutto(handle, bruttoDe) {
  return r2(
    (bruttoDe / (1 + taxRateForHandle(handle, 'DE'))) *
      (1 + taxRateForHandle(handle, 'AT')),
  );
}

const cartLine = (handle, amount, quantity = 1, currencyCode = 'EUR') => ({
  quantity,
  merchandise: {product: {handle}},
  cost: {totalAmount: {amount: String(amount), currencyCode}},
});

beforeEach(() => preismodusZuruecksetzen());

describe('Träger: Metafeld-Wert und Rückfall-Reihenfolge', () => {
  it('Deploy-Vorgabe ist netto (heutiger Shop-Zustand)', () => {
    assert.equal(PREISMODUS_VORGABE, 'netto');
    assert.deepEqual(preismodusStand(), {modus: 'netto', quelle: 'vorgabe'});
  });

  it('gültiger Metafeld-Wert gewinnt, normalisiert', () => {
    assert.deepEqual(uebernehmeMetafeld(' Brutto '), {
      modus: 'brutto',
      quelle: 'metafeld',
    });
    assert.equal(istBrutto(), true);
  });

  it('unlesbar NACH einem gelesenen Wert: letzter Wert, nicht die Vorgabe', () => {
    uebernehmeMetafeld('brutto');
    assert.deepEqual(uebernehmeMetafeld(null), {
      modus: 'brutto',
      quelle: 'zuletzt',
    });
  });

  it('unlesbar ohne je gelesen zu haben: Vorgabe, als solche markiert', () => {
    assert.deepEqual(uebernehmeMetafeld(null), {
      modus: 'netto',
      quelle: 'vorgabe',
    });
  });

  it('unbekannter Wert erzeugt keinen dritten Zustand', () => {
    assert.equal(setzePreismodus('inkl'), false);
    assert.equal(preismodus(), 'netto');
    uebernehmeMetafeld('brutto');
    assert.equal(uebernehmeMetafeld('inkl').modus, 'brutto');
  });

  it('ladePreismodus: Storefront-Fehler wirft nicht, fällt zurück', async () => {
    const kaputt = {
      query: async () => {
        throw new Error('503');
      },
    };
    assert.deepEqual(await ladePreismodus(kaputt), {
      modus: 'netto',
      quelle: 'vorgabe',
    });
    const heil = {
      query: async () => ({shop: {metafield: {value: 'brutto'}}}),
    };
    assert.equal((await ladePreismodus(heil)).quelle, 'metafeld');
    assert.equal((await ladePreismodus(kaputt)).quelle, 'zuletzt');
    assert.equal(preismodus(), 'brutto');
  });
});

describe('ARM A anzeigeSatz/bruttoAnzeige: vor und nach dem Kipp dieselbe Zahl', () => {
  for (const f of FAELLE) {
    for (const land of ['DE', 'AT']) {
      it(`${f.handle} ${land}`, () => {
        setzePreismodus('netto');
        const vorher = bruttoAnzeige(f.netto, f.handle, 'EUR', land);
        setzePreismodus('brutto');
        const api =
          land === 'DE' ? f.brutto : atPreisBrutto(f.handle, f.brutto);
        const nachher = bruttoAnzeige(api, f.handle, 'EUR', land);
        assert.equal(nachher, vorher, `vorher ${vorher}, nachher ${nachher}`);
      });
    }
  }

  it('brutto schlägt NICHTS auf, der enthaltene Satz bleibt lesbar', () => {
    setzePreismodus('brutto');
    assert.equal(anzeigeSatz('qione-2-pro', 'EUR', 'AT'), 0);
    assert.equal(taxRateForHandle('qione-2-pro', 'AT'), 0.2);
    assert.equal(bruttoAnzeige('1087.00', 'qione-2-pro', 'EUR', 'DE'), 1087);
  });

  it('Nicht-EUR bleibt in beiden Modi Endbetrag', () => {
    for (const m of ['netto', 'brutto']) {
      setzePreismodus(m);
      assert.equal(bruttoAnzeige('1048.00', 'qione-2-pro', 'CHF', 'CH'), 1048);
    }
  });
});

describe('ARM B Warenkorbzeile: Zeilenbetrag = Kassenbetrag', () => {
  for (const f of FAELLE) {
    it(`${f.handle} DE x2`, () => {
      setzePreismodus('netto');
      const vorher = getCartLineGrossDisplayTotalExact(
        cartLine(f.handle, r2(f.netto * 2), 2),
        'DE',
      );
      setzePreismodus('brutto');
      const nachher = getCartLineGrossDisplayTotalExact(
        cartLine(f.handle, f.brutto * 2, 2),
        'DE',
      );
      // Nach dem Kipp ist die Zeile cent-genau der gerundete Seitenpreis;
      // vorher lag sie höchstens einen Cent daneben (netto*1,19).
      assert.ok(
        Math.abs(nachher - vorher) <= 0.02,
        `vorher ${vorher}, nachher ${nachher}`,
      );
      assert.equal(nachher, f.brutto * 2);
    });
  }

  it('Sale-Kakao: im Modus brutto zählt der API-Betrag, nicht die Konstante', () => {
    setzePreismodus('brutto');
    assert.equal(
      getCartLineGrossDisplayTotalExact(cartLine('37cr378n', 150.0, 2), 'DE'),
      150,
    );
  });
});

describe('ARM C Paketkarte mit Festbetrag: vor und nach dem Kipp derselbe Kartenpreis', () => {
  const NETTO = {'qihome-air': 4187.4, 'qione-2-pro': 913.45, 'qione-kette': 78.99};
  const BRUTTO = {'qihome-air': 4983.0, 'qione-2-pro': 1087.0, 'qione-kette': 94.0};
  const paket = {rabatt: 0.08, rabattFest: 494.97};
  const lines = (preise, land) =>
    [
      ['qihome-air', 1],
      ['qione-2-pro', 2],
      ['qione-kette', 2],
    ].map(([handle, quantity]) => ({
      handle,
      quantity,
      einzelNetto:
        land === 'AT' && preise === BRUTTO
          ? atPreisBrutto(handle, preise[handle])
          : preise[handle],
      waehrung: 'EUR',
    }));

  it('DE Fundament', () => {
    setzePreismodus('netto');
    const vorher = paketBetraege(lines(NETTO, 'DE'), paket, 'DE');
    setzePreismodus('brutto');
    const nachher = paketBetraege(lines(BRUTTO, 'DE'), paket, 'DE');
    assert.equal(vorher.rabattart, 'fest');
    assert.equal(nachher.rabattart, 'fest');
    assert.equal(nachher.compare, vorher.compare);
    assert.equal(nachher.preis, vorher.preis);
  });

  it('Brutto-Festbetrag legt die Kasse auf ganze Euro (Werte für s04)', () => {
    // Paketsummen in DE-Brutto: Fundament 7345, Unabhängig 10501, Residenz 20467
    for (const [summe, fest, soll] of [
      [7345, 494.97, 589.0],
      [10501, 1063.04, 1265.0],
      [20467, 2585.73, 3077.0],
    ]) {
      const abzug = festAbzugBrutto(summe, fest, 0.19);
      assert.equal(abzug, soll);
      assert.equal(Number.isInteger(Math.round((summe - abzug) * 100) / 100), true);
    }
  });

  it('AT Fundament: Festbetrag aus der Heimat-Summe, nicht mit dem AT-Satz', () => {
    setzePreismodus('brutto');
    const r = paketBetraege(lines(BRUTTO, 'AT'), paket, 'AT');
    assert.equal(r.rabattart, 'fest');
    // AT-Summe 7406,72 minus derselbe Brutto-Code 589,00 wie in DE
    assert.equal(r.preis, 6818);
  });

  it('gemischte Heimatsätze nehmen den Festbetrag-Pfad nicht', () => {
    setzePreismodus('brutto');
    const r = paketBetraege(
      [
        {handle: 'qione-2-pro', quantity: 1, einzelNetto: 1087, waehrung: 'EUR'},
        {handle: 'crystal-cacao-awake', quantity: 1, einzelNetto: 76, waehrung: 'EUR'},
      ],
      paket,
      'DE',
    );
    assert.equal(r.rabattart, 'prozent');
  });
});

describe('Vorschau-Weiche: nur auf Hosts ohne Kunden', () => {
  it('localhost und Oxygen-Vorschau nehmen den Parameter', () => {
    assert.equal(vorschauModus('http://localhost:3000/products/x?preismodus=brutto'), 'brutto');
    assert.equal(vorschauModus('https://abc-123.o2.myshopify.dev/?preismodus=netto'), 'netto');
  });
  it('Kundenhosts ignorieren ihn', () => {
    for (const u of [
      'https://qiblanco.com/products/qione-2-pro?preismodus=brutto',
      'https://www.qiblanco.com/?preismodus=brutto',
      'https://crystal-cacao.com/?preismodus=brutto',
      'https://qi-master.qiblanco.com/?preismodus=brutto',
      'https://localhost.boese.de/?preismodus=brutto',
      'https://myshopify.dev.boese.de/?preismodus=brutto',
    ]) {
      assert.equal(vorschauModus(u), null, u);
    }
  });
  it('unbekannter Wert und kaputte URL: keine Weiche', () => {
    assert.equal(vorschauModus('http://localhost/?preismodus=inkl'), null);
    assert.equal(vorschauModus('kein url'), null);
  });
});

describe('Altersdeckel der root-Daten (offene Tabs über den Kipp)', () => {
  it('frisch nicht zu alt, nach dem Deckel zu alt, neuer Datensatz setzt zurück', () => {
    const t0 = 1_000_000;
    assert.equal(rootDatenZuAlt(t0), false); // nie gesehen: kein Neuladen erzwingen
    const a = {modus: 'netto'};
    rootDatenGesehen(a, t0);
    assert.equal(rootDatenZuAlt(t0 + 1000), false);
    rootDatenGesehen(a, t0 + PREISMODUS_MAX_ALTER_MS); // dasselbe Objekt: Uhr läuft weiter
    assert.equal(rootDatenZuAlt(t0 + PREISMODUS_MAX_ALTER_MS + 1), true);
    rootDatenGesehen({modus: 'brutto'}, t0 + PREISMODUS_MAX_ALTER_MS + 2);
    assert.equal(rootDatenZuAlt(t0 + PREISMODUS_MAX_ALTER_MS + 3), false);
  });
});
