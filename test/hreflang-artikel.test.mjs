// Hermetische Probe der ARTIKEL-hreflang-Gegenrichtung (Job 20260908-BAU-
// hreflang-gegenrichtung-hydrogen-artikel-metafeld).
//
// WARUM HERMETISCH UND NICHT AM LIVE-RAND: es gibt heute NULL veroeffentlichte
// englische Artikel — der US-Shop führt ueberhaupt keinen Blog (gemessen
// 2026-09-08). Eine Live-Probe gegen eine Seite, die es noch nicht geben darf,
// wäre bis zum Go-Live zwangslaeufig rot, würde als 'widerlegt' gebucht und
// schickte einen Reparaturjob gegen gesunden Code. Die Messluecke ist im RESULT
// als solche gemeldet, statt durch eine gruene Zwischenstufe ersetzt zu werden.
//
// JEDER ARM TRÄGT EINEN EIGENEN MARKER (assert-Botschaft), weil ein Exit-Code
// Geschwisterarme nicht trennt: 'exit 1' sagt nicht, WELCHE Zusage brach.
//
// Ausfuehren: node --test test/hreflang-artikel.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DACH_ORIGIN,
  US_ORIGIN,
  artikelHreflangLinks,
  hreflangLinks,
  istPartnerPfad,
} from '../app/lib/hreflang.js';

const DE = '/blogs/wissen/schlafqualitaet-wasser-drei-studien';
const EN = '/blogs/knowledge/sleep-quality-hydration-three-studies';

// --- ARM A: MIT Metafeld -> genau die drei Links, in der Form der US-Seite ---
test('ARM-A-MIT-METAFELD: Artikel mit custom.hreflang_en trägt en/de/x-default', () => {
  const links = artikelHreflangLinks(DE, EN);

  // KARDINALITAET, NICHT ANWESENHEIT (Lehre seo-manager 2026-08-15): ">= 1"
  // haette eine Doppelausgabe nie gesehen. "genau 3" faengt Ausfall UND Dublette.
  assert.equal(links.length, 3, 'ARM-A: es müssen GENAU drei Links sein');
  assert.deepEqual(
    links.map((l) => l.hrefLang),
    ['en', 'de', 'x-default'],
    'ARM-A: Reihenfolge muss die der US-Seite spiegeln (en, de, x-default)',
  );
  for (const l of links) {
    assert.equal(l.tagName, 'link', 'ARM-A: ohne tagName rendert react-router <meta> statt <link>');
    assert.equal(l.rel, 'alternate', 'ARM-A: rel muss alternate sein');
  }
  assert.equal(links[0].href, `${US_ORIGIN}${EN}`, 'ARM-A: en zeigt auf die US-Fassung');
  assert.equal(links[1].href, `${DACH_ORIGIN}${DE}`, 'ARM-A: de zeigt auf die DACH-Fassung');
  // x-default IST die US-Fassung — woertlich das, was die US-Seite bereits
  // erklärt. Eine abweichende Angabe innerhalb der Gruppe wäre ein
  // Widerspruch und damit schlechter als gar keine Auszeichnung.
  assert.equal(
    links[2].href,
    links[0].href,
    'ARM-A: x-default muss mit der en-Angabe uebereinstimmen (Gruppen-Konsistenz)',
  );
});

// --- ARM B: OHNE Metafeld -> KEIN EINZIGER Link, kein Rueckfall -------------
test('ARM-B-OHNE-METAFELD: fehlender/unbrauchbarer Wert gibt NICHTS aus', () => {
  // Ein Rueckfall auf '/' hiesse als hreflang gelesen "die englische Fassung
  // dieses Artikels ist die Startseite" — eine Falschaussage auf jedem noch
  // nicht zugeordneten Artikel. Deshalb ist die leere Liste die Zusage.
  const leer = [
    ['undefined (Metafeld fehlt ganz)', undefined],
    ['null (Storefront-API bei fehlendem Wert)', null],
    ['leerer String', ''],
    ['nur Leerzeichen', '   '],
    ['ohne fuehrenden Slash', 'blogs/knowledge/x'],
    ['protokoll-relativ (fremde Domain!)', '//fremde.example/x'],
    ['voller URL', 'https://qi-blanco.com/blogs/knowledge/x'],
    ['nackter Slash (der Startseiten-Rueckfall)', '/'],
    ['Pfad mit Leerzeichen', '/blogs/knowledge/a b'],
    ['Zahl statt String', 42],
  ];
  for (const [was, wert] of leer) {
    assert.deepEqual(
      artikelHreflangLinks(DE, wert),
      [],
      `ARM-B: ${was} muss eine LEERE Liste geben — kein Rueckfall, kein geratener Pfad`,
    );
  }
});

// --- ARM C: die Seiten-Naht bleibt unberuehrt -------------------------------
test('ARM-C-SEITEN-NAHT-UNBERUEHRT: kein Artikelpfad in hreflangLinks()', () => {
  // Die Route gibt ihre Links per meta-Descriptor aus, root.jsx gibt die
  // Seiten-Naht aus. Spraechen beide auf derselben Seite, stuenden zwei
  // hreflang-Gruppen im Kopf — schlechter als eine. hreflangLinks() muss
  // Artikelpfade deshalb weiterhin NICHT kennen.
  assert.deepEqual(
    hreflangLinks(DE),
    [],
    'ARM-C: hreflangLinks() darf einen Artikelpfad nicht aufloesen (sonst doppelte Gruppe)',
  );
  // Und die Seiten-Naht selbst muss weiter funktionieren — der Artikelfall ist
  // ein ZUSATZ, kein Ersatz.
  assert.equal(
    hreflangLinks('/').length,
    3,
    'ARM-C: die Startseiten-Naht muss unveraendert drei Links liefern',
  );
});

// --- ARM D: der Torwaechter selbst -----------------------------------------
test('ARM-D-TORWAECHTER: istPartnerPfad nimmt genau einen fuehrenden Slash an', () => {
  assert.equal(istPartnerPfad('/blogs/knowledge/x'), true, 'ARM-D: normaler Pfad muss durch');
  assert.equal(istPartnerPfad('//x'), false, 'ARM-D: protokoll-relativ muss fallen');
  assert.equal(istPartnerPfad('/'), false, 'ARM-D: der nackte Slash muss fallen');
  assert.equal(istPartnerPfad(undefined), false, 'ARM-D: undefined muss fallen');
});
