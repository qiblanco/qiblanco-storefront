/**
 * PAKETPREIS-KANON — der Kartenpreis darf nicht am Größen-Dropdown hängen,
 * und er muss der Betrag sein, den die Kasse verlangt.
 *
 * Anlass: Job 20260912-paketkarte-preis-hängt-am-dropdown-und-ist-an-der-
 * kasse-nicht-herstellbar. Am 2026-09-12 am Kundenrand gemessen:
 *   Karte 6.756 / Kasse 6.757,45 · Karte 9.242 / Kasse 9.240,95
 *   · Karte 17.397 / Kasse 17.397,04
 * und die Karte zeigte je nach Kettenlaengen-Wahl 6.756 ODER 6.757 (Unabhängig
 * 9.240/9.241/9.242, Residenz 17.397/17.398).
 *
 * DER ERSTE ARM IST DER WICHTIGERE, und er ist bewusst erschoepfend statt
 * stichprobenartig: er faehrt JEDE Zeilenstruktur ab, die die Groessenwahl
 * erzeugen kann (jedes Paar entweder gebündelt zu einer Zeile mit Menge 2 oder
 * getrennt in zwei Zeilen mit Menge 1) und verlangt EINEN Preis. Eine Stichprobe
 * haette den Fehler nicht gefunden -- der Default-Fall war ja gerade einer der
 * beiden Werte und sah richtig aus.
 *
 * ROT VOR GRUEN: die alte Rechnung (Math.round JE ZEILE) ist unten als
 * `alteRechnung` nachgebaut und wird im dritten Block gegen dieselben Strukturen
 * gefahren. Sie MUSS schwanken -- taete sie es nicht, würde dieser Test nichts
 * beweisen, weil er auch über einer nie kaputten Groesse gruen wäre.
 */
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {paketBetraege} from '../app/lib/paket-preis.js';

// Netto-Einzelpreise, Storefront-API am 2026-09-12 (mess/preise.json).
const NETTO = {
  'qihome-air': 4187.4,
  'qione-2-pro': 913.45,
  'qione-kette': 78.99,
  qibracelet: 1326.05,
};

// Die drei Pakete aus ExclusiveSolutions.jsx: feste Positionen + die Positionen
// mit Groessenwahl (je zwei gleiche Produkte, die buendeln können).
const PAKETE = {
  Fundament: {
    rabatt: 0.08,
    rabattFest: 494.97,
    fest: [['qihome-air', 1], ['qione-2-pro', 2]],
    waehlbar: ['qione-kette'],
    erwartet: {preis: 6756, compare: 7345},
  },
  'Unabhängig': {
    rabatt: 0.12,
    rabattFest: 1063.04,
    fest: [['qihome-air', 1], ['qione-2-pro', 2]],
    waehlbar: ['qibracelet', 'qione-kette'],
    erwartet: {preis: 9236, compare: 10501},
  },
  'Erholungs-Residenz': {
    rabatt: 0.15,
    rabattFest: 2585.73,
    fest: [['qihome-air', 3], ['qione-2-pro', 2]],
    waehlbar: ['qibracelet', 'qione-kette'],
    erwartet: {preis: 17390, compare: 20467},
  },
};

const zeile = (handle, quantity, waehrung = 'EUR') => ({
  handle,
  quantity,
  einzelNetto: NETTO[handle],
  waehrung,
});

/** Jede Zeilenstruktur, die die Groessenwahl erzeugen kann. */
function strukturen(p, waehrung = 'EUR') {
  const out = [];
  for (let maske = 0; maske < 1 << p.waehlbar.length; maske += 1) {
    const lines = p.fest.map(([h, q]) => zeile(h, q, waehrung));
    p.waehlbar.forEach((h, i) => {
      if (maske & (1 << i)) {
        lines.push(zeile(h, 2, waehrung)); // gleiche Groesse -> eine Zeile
      } else {
        lines.push(zeile(h, 1, waehrung), zeile(h, 1, waehrung)); // zwei Zeilen
      }
    });
    out.push(lines);
  }
  return out;
}

/** Die Fassung vor dem 2026-09-12: Math.round JE ZEILE. */
function alteRechnung(lines, p) {
  let preis = 0;
  for (const line of lines) {
    const rabattProEinheit = Math.floor(line.einzelNetto * p.rabatt * 100) / 100;
    preis += Math.round(
      (line.einzelNetto - rabattProEinheit) * line.quantity * 1.19,
    );
  }
  return preis;
}

describe('Paketpreis hängt nicht an der Groessenwahl', () => {
  for (const [name, p] of Object.entries(PAKETE)) {
    it(`${name}: EIN Preis über alle Zeilenstrukturen`, () => {
      const preise = new Set();
      const compares = new Set();
      for (const lines of strukturen(p)) {
        const r = paketBetraege(lines, p);
        assert.ok(r, 'Betraege duerfen hier nicht null sein');
        preise.add(r.preis);
        compares.add(r.compare);
      }
      assert.equal(
        preise.size,
        1,
        `Kartenpreis schwankt über die Groessenwahl: ${[...preise].join('/')}`,
      );
      assert.equal(compares.size, 1);
    });
  }
});

describe('Der Kartenpreis ist der Betrag, den die Kasse verlangt', () => {
  for (const [name, p] of Object.entries(PAKETE)) {
    it(`${name}: Festbetrag ergibt den beworbenen ganzen Euro`, () => {
      const r = paketBetraege(strukturen(p)[0], p);
      assert.equal(r.preis, p.erwartet.preis);
      assert.equal(r.compare, p.erwartet.compare);
    });
  }
});

describe('ROT VOR GRUEN: die alte Rechnung schwankt wirklich', () => {
  for (const [name, p] of Object.entries(PAKETE)) {
    it(`${name}: Math.round je Zeile ergibt mehr als einen Preis`, () => {
      const preise = new Set(strukturen(p).map((l) => alteRechnung(l, p)));
      assert.ok(
        preise.size > 1,
        `Die alte Rechnung war für ${name} stabil — dann misst der erste ` +
          `Block nichts. Gemessen: ${[...preise].join('/')}`,
      );
    });
  }
});

describe('Fremdwaehrung: der EUR-Festbetrag wird NICHT auf CHF angewendet', () => {
  it('CHF rechnet weiter mit dem Prozentsatz', () => {
    const p = PAKETE['Unabhängig'];
    const chf = paketBetraege(strukturen(p, 'CHF')[0], p);
    // anzeigeSatz gibt für CHF 0 zurück (Markets-Preis IST der Endbetrag),
    // und der Festbetrag-Pfad greift nicht -- sonst wäre ein EUR-Betrag von
    // einem CHF-Preis abgezogen worden.
    const nettoSumme = strukturen(p, 'CHF')[0].reduce(
      (s, l) => s + l.einzelNetto * l.quantity,
      0,
    );
    assert.equal(chf.waehrung, 'CHF');
    assert.equal(chf.compare, Math.round(nettoSumme));
    assert.notEqual(chf.preis, Math.round(nettoSumme - p.rabattFest));
  });
});

describe('fail-closed', () => {
  it('leere Zeilen -> null', () => {
    assert.equal(paketBetraege([], PAKETE.Fundament), null);
  });
  it('unbrauchbarer Preis -> null', () => {
    const lines = [{handle: 'qihome-air', quantity: 1, einzelNetto: NaN, waehrung: 'EUR'}];
    assert.equal(paketBetraege(lines, PAKETE.Fundament), null);
  });
});
