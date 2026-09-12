/**
 * Hermetischer Test der /pages-Signale (node --test, ohne Bundler).
 *
 * Er prüft ABSICHTLICH nicht "die Funktion existiert" oder "das Feld ist
 * gesetzt", sondern genau die Eigenschaften, deren Verletzung real Schaden
 * macht — und jede einzelne davon ist eine Fehlerklasse, die in diesem Repo
 * schon einmal eingetreten ist:
 *
 *  - KEIN DOPPELTES TAG in einer meta-Liste. Auf der Startseite standen live
 *    zwei og:image (PR #197 und #198, an verschiedenen Zeilen geändert, von
 *    git konfliktfrei gemergt). Ein Duplikat sieht im Diff nach nichts aus.
 *  - twitter:card NUR MIT og:image. `summary_large_image` ohne Bild ist eine
 *    Zusage ohne Deckung; genau so begründet der Kakao-Laden seine Abwesenheit.
 *  - description und og:description IDENTISCH — sonst zeigt ein geteilter Link
 *    etwas anderes als das Suchergebnis (zwei Versprechen).
 *  - DIE ENTITÄTS-ANKER STIMMEN MIT app/lib/entity-schema.js ÜBEREIN. Sie sind
 *    dort NICHT importiert, sondern neu gebildet (Begründung im Dateikopf von
 *    seiten-seo.js: eine Import-Kante zöge 31 Seiten in die Gate-12-Prüfmenge).
 *    Dieser Test IST der Riegel gegen die Drift, die dadurch möglich wird —
 *    ohne ihn wäre die Begründung dort eine Zusage ohne Träger.
 *  - JEDE /pages-ROUTE, DIE DIE HILFE BRAUCHT, RUFT SIE AUCH AUF. Eine
 *    vergessene Route ist der Ausgangsbefund dieses Baus gewesen: 32 von 38
 *    indexierbaren /pages-URLs trugen kein og:image, weil jede Route ihr
 *    Social-Markup selbst baute oder eben nicht.
 *
 * WARUM HIER SUCHMUSTER AUS ESCAPES GEBAUT WERDEN — kein Stilspleen, dieselbe
 * Begründung wie in test/produkt-seo.test.mjs: dieser Test fahndet nach
 * ASCII-Transliterationen; sie literal hinzuschreiben blockt das Umlaut-Gate
 * von hb-deploy in JEDER Quelldatei, auch in einer Regex.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {
  MARKE,
  MARKEN_TEILBILD,
  ORG_ID,
  SITE_ID,
  TEILBILDER,
  brotkrume,
  kurzName,
  seitenSignale,
  teilbild,
  teilbildTags,
} from '../app/lib/seiten-seo.js';
import {
  ORG_ID as ORG_ID_ENTITAET,
  SITE_ID as SITE_ID_ENTITAET,
} from '../app/lib/entity-schema.js';
import {CANONICAL_ORIGIN} from '../app/lib/seo.js';

const UE = 'u' + 'e';
const OE = 'o' + 'e';
const AE = 'a' + 'e';
const SS = 's' + 's';

/** Alle meta-Descriptoren, die ein Tag-artiges Feld tragen, als Schlüssel. */
function tagSchluessel(liste) {
  return liste
    .filter((d) => d.property || d.name)
    .map((d) => d.property || d.name);
}

function nurLdKnoten(liste) {
  return liste.filter((d) => d['script:ld+json']).map((d) => d['script:ld+json']);
}

const BEISPIEL = {
  pfad: '/pages/e-smog',
  titel: 'Qi Blanco | E-Smog',
};

test('die Entitäts-Anker sind byte-gleich zu entity-schema.js', () => {
  // Ohne diese Zusicherung wäre die Neu-Bildung in seiten-seo.js eine zweite
  // Wahrheit ohne Riegel. Sie ist der Grund, warum die Neu-Bildung erlaubt ist.
  assert.equal(ORG_ID, ORG_ID_ENTITAET);
  assert.equal(SITE_ID, SITE_ID_ENTITAET);
  assert.ok(ORG_ID.startsWith(CANONICAL_ORIGIN));
});

test('kein Tag kommt in einer meta-Liste doppelt vor', () => {
  for (const pfad of [...Object.keys(TEILBILDER), '/pages/impressum']) {
    const liste = seitenSignale({pfad, titel: 'Beispiel | Qi Blanco'});
    const schluessel = tagSchluessel(liste);
    assert.equal(
      new Set(schluessel).size,
      schluessel.length,
      'doppeltes Tag für ' + pfad + ': ' + schluessel.join(','),
    );
  }
});

test('twitter:card steht nie ohne og:image', () => {
  for (const liste of [
    seitenSignale(BEISPIEL),
    teilbildTags('/pages/studien'),
  ]) {
    const schluessel = tagSchluessel(liste);
    if (schluessel.includes('twitter:card')) {
      assert.ok(
        schluessel.includes('og:image'),
        'twitter:card ohne og:image — Zusage ohne Deckung',
      );
    }
  }
});

test('og:image trägt gemessene Maße und einen alt-Text', () => {
  const alle = [MARKEN_TEILBILD, ...Object.values(TEILBILDER)];
  for (const bild of alle) {
    assert.match(bild.url, /^https:\/\/cdn\.shopify\.com\//);
    assert.ok(Number.isInteger(bild.breite) && bild.breite >= 600, bild.url);
    assert.ok(Number.isInteger(bild.hoehe) && bild.hoehe >= 315, bild.url);
    assert.ok(bild.alt && bild.alt.length >= 10, 'alt fehlt: ' + bild.url);
    // Kein og:image:type: der Content-Type folgt hier nicht der Endung
    // (gemessen 2026-09-12). Das Feld darf deshalb gar nicht entstehen.
    assert.equal(bild.typ, undefined);
  }
});

test('og:description ist identisch zur kuratierten Beschreibung', () => {
  // /pages/e-smog hat einen kuratierten Text in seiten-beschreibung.js; der
  // Helfer MUSS denselben liefern, nicht einen zweiten.
  const liste = seitenSignale(BEISPIEL);
  const og = liste.find((d) => d.property === 'og:description');
  assert.ok(og, 'og:description fehlt, obwohl ein Text gepflegt ist');
  assert.match(og.content, /Tag 4 des Kurses/);
});

test('ohne Text entsteht KEIN leeres og:description', () => {
  const liste = seitenSignale({pfad: '/pages/gibt-es-nicht', titel: 'X'});
  assert.equal(
    liste.find((d) => d.property === 'og:description'),
    undefined,
  );
});

test('der Shopify-Wert schlaegt den kuratierten Text', () => {
  const liste = seitenSignale({...BEISPIEL, beschreibung: '  Aus Shopify.  '});
  const og = liste.find((d) => d.property === 'og:description');
  assert.equal(og.content, 'Aus Shopify.');
});

test('WebPage- und Brotkrume-Knoten tragen verschiedene @id', () => {
  const knoten = nurLdKnoten(seitenSignale(BEISPIEL));
  assert.equal(knoten.length, 2);
  const [seite, weg] = knoten;
  assert.equal(seite['@type'], 'WebPage');
  assert.equal(weg['@type'], 'BreadcrumbList');
  assert.notEqual(seite['@id'], weg['@id']);
  assert.equal(seite.isPartOf['@id'], SITE_ID);
  assert.equal(seite.publisher['@id'], ORG_ID);
});

test('hauptknoten:false liefert NUR die Brotkrume', () => {
  const knoten = nurLdKnoten(seitenSignale({...BEISPIEL, hauptknoten: false}));
  assert.equal(knoten.length, 1);
  assert.equal(knoten[0]['@type'], 'BreadcrumbList');
});

test('die Brotkrume behauptet keinen dritten, nicht existierenden Schritt', () => {
  const weg = brotkrume({url: CANONICAL_ORIGIN + '/pages/x', name: 'X'});
  assert.equal(weg.itemListElement.length, 2);
  assert.equal(weg.itemListElement[0].item, CANONICAL_ORIGIN + '/');
  assert.equal(weg.itemListElement[1].name, 'X');
});

test('kurzName schneidet den Marken-Suffix in beiden Stellungen', () => {
  assert.equal(kurzName('Impressum | ' + MARKE), 'Impressum');
  assert.equal(kurzName(MARKE + ' | E-Smog'), 'E-Smog');
  assert.equal(kurzName(MARKE), MARKE);
  assert.equal(kurzName(''), MARKE);
  assert.equal(kurzName(undefined), MARKE);
});

test('ein unbekannter Pfad bekommt das gepflegte Standardbild, nie nichts', () => {
  assert.deepEqual(teilbild('/pages/gibt-es-nicht'), MARKEN_TEILBILD);
});

test('kundensichtbarer Text trägt echte Umlaute, keine Transliteration', () => {
  const texte = [MARKEN_TEILBILD.alt, ...Object.values(TEILBILDER).map((b) => b.alt)];
  for (const t of texte) {
    for (const digraph of [UE, OE, AE, SS]) {
      assert.ok(
        !new RegExp('[a-z]' + digraph + '[a-z]').test(t),
        'ASCII-Digraph in kundensichtbarem alt-Text: ' + t,
      );
    }
  }
});

test('jede /pages-Route mit og-Bedarf ruft die gemeinsame Hilfe auf', () => {
  // DER ZAUN FOLGT DER EIGENSCHAFT, NICHT EINER LISTE: geprüfte Menge sind
  // ALLE Routendateien app/routes/pages.*, die ein `meta` exportieren und
  // einen canonicalLink setzen — also alle, die sich selbst für indexierbar
  // halten. Wer eine neue solche Route anlegt und die Hilfe vergisst, wird
  // hier rot, ohne dass jemand diesen Test pflegen muss.
  //
  // AUSGENOMMEN, MIT GRUND UND GEZÄHLT (nie stillschweigend):
  //   pages.$handle.jsx  ruft die Hilfe im indexierbaren Zweig auf, aber
  //                      nicht neben `canonicalLink(` in einer Array-Zeile —
  //                      er baut seine Liste mit push(). Wird separat geprueft.
  const dir = new URL('../app/routes/', import.meta.url);
  const dateien = readdirSync(dir).filter(
    (f) => f.startsWith('pages.') && /\.(jsx|tsx|js|ts)$/.test(f),
  );
  const ohne = [];
  let geprueft = 0;
  for (const f of dateien) {
    const quelle = readFileSync(new URL(f, dir), 'utf8');
    if (!/export (const|function|async function) meta\b/.test(quelle)) continue;
    if (!/canonicalLink\(/.test(quelle)) continue;
    // Routen, die sich selbst auf noindex setzen, brauchen kein Teilbild.
    if (/noindexMeta\(\)/.test(quelle) && !/seitenSignale\(/.test(quelle)) {
      continue;
    }
    // AUSGENOMMEN NACH EIGENSCHAFT, NICHT NACH NAMEN: eine Route, die ihr
    // og:image selbst setzt, liefert bereits ein Teilbild — sie braucht die
    // gemeinsame Hilfe nicht, und sie in eine Namensliste zu schreiben wäre
    // genau der Ortszaun, den dieser Test vermeiden soll. Betroffen sind
    // heute die Studienseiten und /pages/erfahrungen (je eigenes Motiv aus
    // ihrer Datenschicht); wächst die Menge, wächst die Ausnahme mit.
    if (/'og:image'/.test(quelle) && !/seitenSignale\(|teilbildTags\(/.test(quelle)) {
      continue;
    }
    geprueft += 1;
    if (!/seitenSignale\(|teilbildTags\(/.test(quelle)) ohne.push(f);
  }
  assert.ok(geprueft >= 30, 'zu wenige Routen geprueft: ' + geprueft);
  assert.deepEqual(ohne, [], 'Routen ohne gemeinsame Hilfe: ' + ohne.join(', '));
});

test('der Katchall setzt die Signale NUR im indexierbaren Zweig', () => {
  const quelle = readFileSync(
    new URL('../app/routes/pages.$handle.jsx', import.meta.url),
    'utf8',
  );
  const nachNoindex = quelle.slice(quelle.indexOf('noindexMeta()'));
  const bisElse = nachNoindex.slice(0, nachNoindex.indexOf('return tags'));
  // Im noindex-Zweig (vor dem else) darf die Hilfe nicht stehen.
  const vorElse = bisElse.slice(0, bisElse.indexOf('} else if'));
  assert.ok(!/seitenSignale\(/.test(vorElse), 'og-Signale auf einer noindex-Seite');
  assert.ok(/seitenSignale\(/.test(bisElse), 'der Katchall ruft die Hilfe nicht auf');
});
