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
import {paketBetraege, rabattCodeFuer} from '../app/lib/paket-preis.js';

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

/* ───────────────────────────────────────────────────────────────────────────
   NACHTRAG 2026-09-13 (Job 20260913-paketkarte-fremdmarkt-festbetragspfad-
   dann-umstellung): DIE RABATTART UND DER RABATTCODE SIND EINE ENTSCHEIDUNG.

   WAS AM KUNDENRAND GEMESSEN WURDE. Die Karte rechnete in CHF/USD mit dem
   PROZENTSATZ und legte gleichzeitig den FESTBETRAG-Code in den Warenkorb.
   Shopify rechnet einen EUR-Festbetrag an der Kasse mit einem eigenen
   Wechselkurs um -- empirisch aus zwei Codes uebereinstimmend auf fuenf Stellen:
   CHF/EUR 0,96586 und USD/EUR 1,18322. Ergebnis: CH +77,26 und +155,58 CHF,
   US +282,19 und +663,51 USD zulasten des Kunden.

   Die Kopplung ist der Punkt: `paketBetraege` sagt jetzt, welche Art es
   gerechnet hat, und `rabattCodeFuer` loest genau die ein.
   ─────────────────────────────────────────────────────────────────────────── */

// CHF-Listenpreise, Storefront-API live gelesen 2026-09-13 (mess/markt_preise.json).
const NETTO_CHF = {
  'qihome-air': 4247,
  'qione-2-pro': 1048,
  'qione-kette': 81,
  qibracelet: 1345,
};

/** Dieselbe Zeilenstruktur, aber mit den echten CHF-Preisen des Markts. */
const nachChf = (lines) =>
  lines.map((l) => ({...l, waehrung: 'CHF', einzelNetto: NETTO_CHF[l.handle]}));

describe('Rabattart und Rabattcode sind EINE Entscheidung', () => {
  for (const [name, p] of Object.entries(PAKETE)) {
    it(`${name}: EUR rechnet fest -> Festbetrag-Code`, () => {
      const b = paketBetraege(strukturen(p)[0], p);
      assert.equal(b.rabattart, 'fest');
      assert.equal(rabattCodeFuer({discountCode: 'PAKET-X'}, b.rabattart),
                   'PAKET-X');
    });

    it(`${name}: CHF rechnet prozent -> Prozent-Code`, () => {
      const b = paketBetraege(nachChf(strukturen(p)[0]), p);
      assert.equal(b.rabattart, 'prozent');
      assert.equal(rabattCodeFuer({discountCode: 'PAKET-X'}, b.rabattart),
                   'PAKET-X-INTL');
    });
  }

  // ROT VOR GRUEN AM SCHADEN, nicht am Code: der alte Bau nahm IMMER
  // p.discountCode. Dieser Arm rechnet nach, was das den CHF-Kunden kostet, und
  // MUSS den Schaden finden -- sonst beweisen die gruenen Arme oben nichts.
  const KURS_CHF_JE_EUR = 0.96586;
  for (const [name, p] of Object.entries(PAKETE)) {
    it(`ROT VOR GRUEN ${name}: der alte Bau kostet den CHF-Kunden Geld`, () => {
      const lines = nachChf(strukturen(p)[0]);
      const b = paketBetraege(lines, p);
      const listeChf = lines.reduce(
        (sum, l) => sum + l.einzelNetto * l.quantity, 0,
      );
      // So haette die Kasse gerechnet, wenn der EUR-Festbetrag-Code gegolten
      // haette: Shopify zieht den UMGERECHNETEN Festbetrag ab.
      const kasseMitFestCode = listeChf - p.rabattFest * KURS_CHF_JE_EUR;
      const schaden = kasseMitFestCode - b.preis;
      assert.ok(
        schaden > 35,
        `der alte Bau muss den CHF-Kunden messbar mehr kosten (gemessen wurden ` +
          `+41,93 bis +155,58 CHF); hier ${schaden.toFixed(2)}`,
      );
      // Der neue Bau loest genau den Code ein, der diesen Schaden vermeidet.
      assert.equal(rabattCodeFuer({discountCode: 'PAKET-X'}, b.rabattart),
                   'PAKET-X-INTL');
    });
  }

  it('fail-closed: ohne Namensstamm wird kein Code erfunden', () => {
    assert.equal(rabattCodeFuer({}, 'prozent'), undefined);
    assert.equal(rabattCodeFuer(null, 'fest'), undefined);
  });
});
