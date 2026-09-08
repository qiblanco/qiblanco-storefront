/**
 * Autorenkasten: die SCHALTLOGIK, hermetisch.
 *
 * Anlass: Segment s03 des Grossjobs 20260908-BAU-fachartikel-autorenkasten-
 * us-parallelausgabe-takt-und-schnelle-bilder; Stand nachgezogen am 2026-09-08
 * vom Job 20260908-UPDATE-autorenkasten-foto-selbst-wählen-und-absatz-
 * veroeffentlichen. Christian hat den Lesevorbehalt an diesem Tag
 * zurueckgenommen ("natürlich wird der Absatz veroeffentlicht, den lese ich
 * dann spaeter"), der Kasten ist seither SICHTBAR.
 *
 * WAS DIESE TESTS ABSICHERN UND WAS NICHT: sie prüfen die Entscheidung
 * "sichtbar ja/nein" und die Unversehrtheit des Textes. Ob ein Mensch den
 * Kasten am Artikelende WIRKLICH sieht, ist eine Aussage über die
 * ausgelieferte Seite und wird von blog-redaktion/pruefungen/
 * probe_autorenkasten_rand.py am Rand gemessen - nicht hier. Ein gruener
 * Test hier ist KEIN Wirkungsnachweis.
 *
 * DER WICHTIGSTE ARM IST WEITER DER GESCHLOSSENE — er wird jetzt nur anders
 * geführt. Bis zum 2026-09-08 las er die Konstante direkt und bewies "das Flag
 * ist zu, und zu heißt unsichtbar". Damit war er an den Zustand verdrahtet,
 * den dieser Bau abloest: beim Umlegen auf `true` wäre ausgerechnet der Arm rot
 * geworden, der die ZU-Richtung absichert, und die bequeme Heilung (Arm
 * loeschen) haette den RUECKWEG ab genau dem Moment ungeprueft gelassen, in dem
 * man ihn braucht. Deshalb nimmt `autorenkastenSichtbarkeit` das Flag jetzt als
 * zweiten Parameter entgegen (Vorgabewert = die Konstante, die Route ruft
 * unveraendert mit einem Argument auf), und die Probe führt BEIDE Regime:
 *   REGIME LIVE  (live=true)  -> jede Artikel-URL zeigt den Kasten.
 *   REGIME ZU    (live=false) -> nur der Vorschauweg öffnet, alles andere
 *                               bleibt zu, auch eine unbrauchbare URL.
 * Ein Flag, das sein Zu-Sein nicht beweist, ist keine Sperre, sondern eine
 * Absichtserklaerung — und das gilt auch für ein Flag, das gerade offen steht.
 */
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

import {
  AUTORENKASTEN,
  AUTORENKASTEN_LIVE,
  AUTORENKASTEN_SSOT_SHA256,
  AUTORENKASTEN_VORSCHAU_PARAM,
  AUTORENKASTEN_VORSCHAU_WERT,
  autorenkastenSichtbarkeit,
} from '../app/lib/autorenkasten.js';

const ARTIKEL =
  'https://qiblanco.com/blogs/wissen/kohaerentes-wasser-was-die-forschung-misst';

describe('Autorenkasten - das Flag, REGIME LIVE (der heutige Stand)', () => {
  it('steht offen, seit Christian den Lesevorbehalt zurueckgenommen hat', () => {
    // ABSICHTLICH an den heutigen Zustand gebunden. Legt jemand das Flag
    // zurück, faellt dieser Arm auf - und genau dann SOLL jemand hinschauen,
    // weil das Umlegen in beide Richtungen die Freigabe-Handlung ist.
    assert.equal(AUTORENKASTEN_LIVE, true);
  });

  it('zeigt den Kasten auf einer normalen Artikel-URL', () => {
    assert.deepEqual(autorenkastenSichtbarkeit(ARTIKEL, true), {
      sichtbar: true,
      vorschau: false,
    });
  });

  it('nennt die Live-Auslieferung KEINE Vorschau - sonst würde sie noindex tragen', () => {
    // Der Fehler wäre teuer und stumm: die Route hängt ihre noindex-
    // Entscheidung an `vorschau`. Kaeme der Live-Kasten als Vorschau herein,
    // würde jede Artikelseite auf noindex laufen - der Kasten wäre sichtbar
    // und der ganze Blog aus dem Index. Deshalb ein eigener Arm dafür.
    const url = `${ARTIKEL}?${AUTORENKASTEN_VORSCHAU_PARAM}=${AUTORENKASTEN_VORSCHAU_WERT}`;
    assert.equal(autorenkastenSichtbarkeit(url, true).vorschau, false);
    assert.equal(autorenkastenSichtbarkeit(ARTIKEL, true).vorschau, false);
  });

  it('hängt im Live-Regime an keiner URL - auch eine kaputte zeigt den Kasten', () => {
    // Im Live-Regime gibt es nichts zu verschliessen: der Kasten steht unter
    // JEDEM Artikel. Das ist keine Nachlaessigkeit, sondern der Gegenstand.
    for (const kaputt of [null, undefined, '', 'nicht-mal-eine-url', {}]) {
      assert.equal(autorenkastenSichtbarkeit(kaputt, true).sichtbar, true);
    }
  });
});

describe('Autorenkasten - das Flag, REGIME ZU (der Rueckweg)', () => {
  // Diese Arme messen den Zustand, in den ein Rueckzug führt. Sie sind KEIN
  // toter Code: ohne sie wäre der Rueckweg genau ab dem Tag ungeprueft, an dem
  // das Flag geöffnet wurde - also ab dem Tag, an dem man ihn braucht.
  it('hält eine normale Artikel-URL geschlossen', () => {
    assert.deepEqual(autorenkastenSichtbarkeit(ARTIKEL, false), {
      sichtbar: false,
      vorschau: false,
    });
  });

  it('hält einen falschen Parameterwert geschlossen', () => {
    for (const u of [
      `${ARTIKEL}?autorenkasten=ja`,
      `${ARTIKEL}?autorenkasten=`,
      `${ARTIKEL}?vorschau=vorschau`,
    ]) {
      assert.equal(autorenkastenSichtbarkeit(u, false).sichtbar, false, u);
    }
  });

  it('öffnet genau für den Vorschauweg - und markiert ihn als Vorschau', () => {
    const url = `${ARTIKEL}?${AUTORENKASTEN_VORSCHAU_PARAM}=${AUTORENKASTEN_VORSCHAU_WERT}`;
    assert.deepEqual(autorenkastenSichtbarkeit(url, false), {
      sichtbar: true,
      vorschau: true,
    });
    // Das Vorschau-Kennzeichen trägt die noindex-Entscheidung der Route.
    // Wäre es false, entstuende eine zweite indexierbare Fassung derselben
    // Seite - ein stiller Duplicate-Content-Erzeuger.
  });

  it('faellt bei unbrauchbarer URL geschlossen aus, nicht offen', () => {
    for (const kaputt of [null, undefined, '', 'nicht-mal-eine-url', {}]) {
      assert.equal(
        autorenkastenSichtbarkeit(kaputt, false).sichtbar,
        false,
        `fail-closed verletzt für: ${String(kaputt)}`,
      );
    }
  });

  it('nimmt auch ein URL-Objekt entgegen (das gibt der Loader nicht, aber die Probe)', () => {
    const u = new URL(`${ARTIKEL}?autorenkasten=vorschau`);
    assert.equal(autorenkastenSichtbarkeit(u, false).sichtbar, true);
  });
});

describe('Autorenkasten - der Vorgabewert bindet an die Konstante', () => {
  it('entscheidet ohne zweites Argument genau wie das Flag es sagt', () => {
    // Der Parameter darf die Route nicht von der Konstante abkoppeln: sonst
    // pruefte die Probe eine Mechanik, die im Betrieb niemand benutzt.
    assert.deepEqual(
      autorenkastenSichtbarkeit(ARTIKEL),
      autorenkastenSichtbarkeit(ARTIKEL, AUTORENKASTEN_LIVE),
    );
  });
});

describe('Autorenkasten - der Text', () => {
  it('trägt zwei bis vier Saetze Werdegang (Christians Vorgabe)', () => {
    assert.ok(AUTORENKASTEN.saetze.length >= 2);
    assert.ok(AUTORENKASTEN.saetze.length <= 4);
  });

  it('nennt den VOLLEN Namen, nicht die Altfassung', () => {
    assert.equal(AUTORENKASTEN.name, 'Dipl.-Ing. (FH) Christian Bernd Bauer');
  });

  it('trägt echte Umlaute, keine Transliteration (Hausregel Web-Content)', () => {
    const text = [AUTORENKASTEN.name, AUTORENKASTEN.rolle, ...AUTORENKASTEN.saetze].join(' ');
    assert.ok(/[äöüÄÖÜß]/.test(text), 'kein einziger echter Umlaut');
    assert.ok(!/\b(ae|oe|ue)\b/.test(text));
    // MOJIBAKE WIRD AUS ESCAPES GEBAUT, NIE ALS LITERAL GESCHRIEBEN: ein
    // Mojibake-Literal in einer Quelldatei ist von echtem Mojibake baulich
    // nicht zu unterscheiden, und das Encoding-Gate von hb-deploy kann die
    // Testabsicht nicht sehen -- es hat genau diese Zeile am 2026-09-08
    // blockiert, und zwar zu Recht.
    const mojibakeVorzeichen = new RegExp(`[\u00c3\u00c2]`);
    assert.ok(!mojibakeVorzeichen.test(text), 'Mojibake im kundensichtbaren Text');
  });

  it('hält die Markenschreibung ein', () => {
    assert.ok(AUTORENKASTEN.saetze.some((s) => s.includes('GitterChip™')));
  });

  it('ohne Foto ist ein gueltiger Zustand, kein leeres Bild', () => {
    // Wäre bild_id leer UND würde trotzdem gerendert, entstuende ein <img>
    // ohne Quelle. Die Komponente entscheidet an genau diesem Feld.
    assert.equal(typeof AUTORENKASTEN.foto.bild_id, 'string');
  });

  it('der SSoT-Hash beschreibt WIRKLICH diesen Inhalt', () => {
    // Ohne diesen Arm könnte der Hash beliebig danebenliegen, und die
    // Drift-Probe (probe_autorenkasten_naht.py, Arm A0) würde eine
    // Uebereinstimmung prüfen, die es hier nie gab.
    // DAS REZEPT IST TRAGEND UND STEHT IN app/lib/autorenkasten.js: Doku-
    // Schluessel (fuehrender Unterstrich) fallen weg, Schluessel sortiert,
    // keine Leerzeichen, UTF-8 unescaped. JSON.stringify sortiert NICHT von
    // selbst -- wer das vergisst, bekommt einen anderen Hash und hält den
    // richtigen für falsch (genau hier passiert, 2026-09-08).
    const kanonisch = (x) => {
      if (Array.isArray(x)) return x.map(kanonisch);
      if (x && typeof x === 'object') {
        return Object.fromEntries(
          Object.keys(x)
            .filter((k) => !k.startsWith('_'))
            .sort()
            .map((k) => [k, kanonisch(x[k])]),
        );
      }
      return x;
    };
    const kern = kanonisch({
      foto: AUTORENKASTEN.foto,
      name: AUTORENKASTEN.name,
      rolle: AUTORENKASTEN.rolle,
      saetze: AUTORENKASTEN.saetze,
    });
    const roh = JSON.stringify(kern);
    const sha = createHash('sha256').update(roh, 'utf8').digest('hex');
    assert.equal(sha, AUTORENKASTEN_SSOT_SHA256);
  });
});
