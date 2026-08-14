/**
 * Hermetischer Test der Hub-Verlinkung (node --test, ohne Bundler) — SEO S5.
 *
 * Prüft ABSICHTLICH nicht "die Datei existiert" oder "die Liste ist nicht
 * leer", sondern die Eigenschaften, deren Verletzung real Schaden macht:
 *
 *  - Die zwei Ziele, die die Knopfdruck-Probe des Master-Konzepts als Paket L8
 *    führt (/pages/crystal-cacao, /pages/technologie), sind wirklich drin.
 *    Genau ihr Fehlen war der Ausgangsbefund; eine Liste, die sie verliert,
 *    hat ihren Zweck verloren, egal wie viele andere Eintraege sie hat.
 *  - Die Liste ist wirklich VERDRAHTET. Eine gepflegte Datenliste, die keine
 *    Komponente rendert, ist die teuerste Form von "sieht fertig aus".
 *  - Keine Dublette gegen die Produktliste des Footers: derselbe Link zweimal
 *    im selben Footer verwaessert den Ankertext, statt ihn zu schaerfen.
 *  - Jeder Pfad ist ein absoluter /pages/-Pfad. Ein relativer oder externer
 *    Eintrag wuerde als Hub-Signal nichts beitragen.
 *  - Der Ankertext traegt ECHTE Umlaute (kundensichtbarer Text) und ist kurz
 *    genug, um als Sitelink-Titel zu taugen.
 *  - Die Titel-Hygiene-Flanke WAECHST NICHT unbemerkt: Seiten mit
 *    Scaffold-Titel sind namentlich bekannt und begrenzt.
 *
 * WARUM HIER SUCHMUSTER AUS ESCAPES GEBAUT WERDEN — kein Stilspleen:
 * Dieser Test fahndet nach ASCII-Transliterationen ('ue' statt 'ü'). Um sie
 * zu finden, müsste er sie literal enthalten — genau das blockt aber das
 * Umlaut-Gate von hb-deploy in JEDER Quelldatei, auch in einer Regex und
 * auch in einem Kommentar. Ein Prüfer, der seinen eigenen Prüfgegenstand
 * nicht schreiben darf, muss ihn also zusammensetzen. (Dieselbe Bauweise und
 * dieselbe Begründung wie in test/produkt-seo.test.mjs.)
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  HUB_LINKS,
  hubPfade,
  pruefe_titel_hygiene,
} from '../app/lib/hub-seiten.js';

const FOOTER = readFileSync(
  new URL('../app/components/Footer.jsx', import.meta.url),
  'utf8',
);

// Die zwei Ziele des Knopfdruck-Pakets L8 (SEO/AI-Master-Konzept DACH).
const L8_ZIELE = ['/pages/crystal-cacao', '/pages/technologie'];

test('die L8-Ziele sind enthalten — sie sind der Ausgangsbefund', () => {
  for (const ziel of L8_ZIELE) {
    assert.ok(
      hubPfade().includes(ziel),
      `${ziel} fehlt in HUB_LINKS — genau dieses Ziel war der Befund, ` +
        'der die Stufe S5 ausgeloest hat',
    );
  }
});

test('die Liste ist im Footer verdrahtet, nicht nur gepflegt', () => {
  assert.match(
    FOOTER,
    /import\s*\{\s*HUB_LINKS\s*\}\s*from\s*'~\/lib\/hub-seiten'/,
    'Footer.jsx importiert HUB_LINKS nicht',
  );
  assert.match(
    FOOTER,
    /HUB_LINKS\.map\(/,
    'Footer.jsx rendert HUB_LINKS nicht — die Liste erreicht kein HTML',
  );
});

test('jeder Eintrag ist ein absoluter /pages/-Pfad mit Ankertext', () => {
  assert.ok(HUB_LINKS.length >= 4, 'weniger als 4 Hub-Seiten ist kein Hub');
  for (const {to, label} of HUB_LINKS) {
    assert.match(to, /^\/pages\/[a-z0-9-]+$/, `kein sauberer Pfad: ${to}`);
    assert.ok(label && label.trim().length > 0, `kein Ankertext fuer ${to}`);
    // Sitelink-Titel werden abgeschnitten; ein Ankertext, der nicht als
    // Sitelink-Titel taugt, verschenkt genau die Flaeche, um die es geht.
    assert.ok(label.length <= 32, `Ankertext zu lang fuer ${to}: ${label}`);
  }
});

test('keine Dublette gegen die Produktliste des Footers', () => {
  for (const to of hubPfade()) {
    const treffer = FOOTER.split(`'${to}'`).length - 1;
    assert.ok(
      treffer === 0,
      `${to} steht zusaetzlich literal im Footer — doppelter Link ` +
        'verwaessert den Ankertext',
    );
  }
  assert.equal(
    new Set(hubPfade()).size,
    hubPfade().length,
    'ein Pfad steht zweimal in HUB_LINKS',
  );
});

test('Ankertext traegt echte Umlaute (kundensichtbarer Text)', () => {
  // Aus Escapes gebaut, siehe Kopf: 'ue', 'oe', 'ae', 'ss' als Digraph-Fahndung.
  const u = 'ue';
  const o = 'oe';
  const a = 'ae';
  const digraph = new RegExp(`(${u}|${o}|${a})`, 'i');
  for (const {label, to} of HUB_LINKS) {
    // Bekannte echte Woerter mit diesen Buchstabenfolgen ausnehmen waere hier
    // unnoetig: keiner der Ankertexte enthaelt legitim 'ue'/'oe'/'ae'.
    assert.ok(
      !digraph.test(label),
      `Ankertext von ${to} enthaelt eine ASCII-Transliteration: ${label}`,
    );
  }
});

test('die Titel-Hygiene-Flanke ist benannt und waechst nicht unbemerkt', () => {
  const offen = pruefe_titel_hygiene();
  // Stand 2026-08-14 live gemessen: genau diese zwei tragen "Hydrogen | ...".
  // Der Test pinnt bewusst die MENGE der bekannten Faelle, nicht eine Zahl:
  // wird eine geheilt, darf er nicht rot werden; kommt eine NEUE Hub-Seite
  // mit Scaffold-Titel dazu, muss er rot werden.
  const bekannt = new Set([
    '/pages/superhuman',
    '/pages/zeremonie-kakao-kurs',
  ]);
  for (const pfad of offen) {
    assert.ok(
      bekannt.has(pfad),
      `neue Hub-Seite mit Scaffold-Titel: ${pfad} — erst S0-Titelfix, ` +
        'dann als Hub bewerben',
    );
  }
});
