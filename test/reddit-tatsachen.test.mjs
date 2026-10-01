// Hermetische Tests der Tatsachenseite /pages/was-auf-reddit-ueber-qi-blanco-steht
// (Job 20261001-s07vm-tatsachenseite-reddit). Bauform 1:1 von
// test/neu-oder-gebraucht.test.mjs. node:test/node:assert, KEIN Netz.
// Ausfuehren: node --test test/reddit-tatsachen.test.mjs
//
// WAS DIESE DATEI PRUEFT UND WAS NICHT: die ZUSAGEN des Baus am Quelltext —
// indexierbar, Schema aus sichtbarem Text, Zahlen aus der Fadenliste, keine
// Zitate und kein Link auf spottende Faeden, eingehender Link der FAQ. Ob die
// Seite LIVE hell ist, misst homepage-bauer/pruefungen/
// probe_zweifelsseite_dunkel.py --flaeche reddit am ausgelieferten HTML.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {ohneProsa} from './_quelltext.mjs';

import {
  BERICHTE_STUDIE,
  FAEDEN,
  FRAGEN,
  GENANNT,
  KOPF,
  STAND,
  ZAHL,
  zahlwort,
} from '../app/data/reddit-tatsachen.js';
import {buildFaqPageJsonLd} from '../app/lib/faq-schema.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {FAQ_ALLE} from '../app/data/faq-seite.js';

const lies = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

// Der Dateiname der Route folgt dem Pfad; er wird abgeleitet, nicht getippt.
const PFAD_SLUG = '/pages/was-auf-reddit-ueber-qi-blanco-steht'.split('/').pop();
const ROUTE = ohneProsa(
  lies(`../app/routes/pages.${PFAD_SLUG}.jsx`),
);
const KOMPONENTE = ohneProsa(
  lies('../app/components/campaign/RedditTatsachenSeite.jsx'),
);
const CSS = ohneProsa(lies('../app/styles/reddit-tatsachen.css'));
const DATEN_ROH = lies('../app/data/reddit-tatsachen.js');
const PFAD = '/pages/was-auf-reddit-ueber-qi-blanco-steht';

// ---------------------------------------------------------------------------
// Abrufbar UND indexierbar.
// ---------------------------------------------------------------------------

test('die Route trägt KEIN noindex und KEINEN X-Robots-Tag', () => {
  assert.ok(!/noindex/i.test(ROUTE), 'noindex im Programmtext der Route');
  assert.ok(!/headers\s*=/.test(ROUTE), 'die Route exportiert headers()');
});

test('die Route setzt ein echtes canonical über canonicalLink()', () => {
  assert.match(ROUTE, /canonicalLink\(PFAD\)/);
  assert.ok(!/\{rel:\s*'canonical'/.test(ROUTE));
  assert.match(ROUTE, new RegExp(`const PFAD = '${PFAD}'`));
});

test('die Seite steht in NUR_ROUTE_SEITEN und nennt dort ihre Wache', () => {
  const e = NUR_ROUTE_SEITEN.find((s) => s.pfad === PFAD);
  assert.ok(e, 'kein NUR_ROUTE_SEITEN-Eintrag');
  assert.match(e.grund, /probe_zweifelsseite_dunkel\.py --flaeche reddit/);
  assert.match(e.lastmod, /^\d{4}-\d{2}-\d{2}T/);
});

test('robots.txt sperrt diesen Pfad nicht', () => {
  const robots = lies('../app/routes/[robots.txt].jsx');
  assert.ok(!robots.includes(`Disallow: ${PFAD}`));
});

test('die indexierte FAQ verlinkt hierher, ohne ihren bestehenden Weg zu verlieren', () => {
  // `auch` ist ein Objekt oder eine Liste (seit 2026-10-01 eine Liste, Job
  // 20261001-s07vm-tatsachenseite-trustpilot).
  const wege = (i) => [].concat(i.auch || []);
  const treffer = FAQ_ALLE.filter((i) => wege(i).some((a) => a.pfad === PFAD));
  assert.equal(treffer.length, 1);
  assert.ok(wege(treffer[0]).find((a) => a.pfad === PFAD).text.length > 20);
  // Der Eintrag trägt weiter seinen alten Weg zu /pages/bewertungen: ein
  // zweiter Link darf den ersten nicht verdrängen.
  assert.equal(treffer[0].weiter?.pfad, '/pages/bewertungen');
  // Und die Komponente rendert das Feld überhaupt.
  const faq = ohneProsa(lies('../app/components/faq/FaqSeite.jsx'));
  assert.match(faq, /\[\]\.concat\(item\.auch/);
  assert.match(faq, /auch\.pfad/);
});

// ---------------------------------------------------------------------------
// Das Schema entsteht AUS dem sichtbaren Text.
// ---------------------------------------------------------------------------

test('jede Frage passiert das Deny-Netz', () => {
  const schema = buildFaqPageJsonLd(FRAGEN, {inLanguage: 'de-DE'});
  assert.ok(schema, 'kein Schema entstanden');
  assert.equal(schema.mainEntity.length, FRAGEN.length);
  assert.ok(FRAGEN.length >= 5);
});

test('jede Schema-Frage steht auch sichtbar auf der Seite', () => {
  assert.match(KOMPONENTE, /FRAGEN\.map/);
  assert.match(KOMPONENTE, /\{f\.q\}/);
  assert.match(KOMPONENTE, /\{f\.a\}/);
  assert.match(ROUTE, /buildFaqPageJsonLd\(FRAGEN/);
});

test('das Schema trägt Datum als Konstanten, nicht als Uhr', () => {
  assert.match(ROUTE, /const RDT_VEROEFFENTLICHT = '\d{4}-\d{2}-\d{2}'/);
  assert.match(ROUTE, /const RDT_GEAENDERT = '\d{4}-\d{2}-\d{2}'/);
  assert.ok(!/new Date\(\)/.test(ROUTE));
});

// ---------------------------------------------------------------------------
// Die Zahlen kommen aus der Fadenliste, nicht aus der Hand.
// ---------------------------------------------------------------------------

test('die Zählung stimmt mit der Fadenliste überein', () => {
  assert.equal(ZAHL.alle, FAEDEN.length);
  assert.equal(ZAHL.fremd + ZAHL.genannt, ZAHL.alle);
  // Jeder Faden einmal: eine doppelte Reddit-Kennung zählte doppelt.
  assert.equal(new Set(FAEDEN.map((f) => f.id)).size, FAEDEN.length);
  assert.ok(KOPF.lead.includes(`${zahlwort(ZAHL.alle)} Fäden`));
});

test('der Kopfsatz "niemand trägt" ist an die Daten gebunden', () => {
  // Die Seite sagt, in keinem Faden berichte jemand vom eigenen Tragen. Das
  // ist nur wahr, solange die Zählung null ergibt. Wer einen Faden mit einem
  // Tragebericht ergänzt, muss den Text ändern, sonst wird hier rot.
  assert.equal(ZAHL.tragen, 0);
  assert.match(KOPF.lead, /steht in keinem/);
});

test('Titel und Fliesstext tragen keine Fadenzahl als Ziffer', () => {
  // Gemessen am Programmtext: eine Ziffer im Titel wäre ein Literal, das
  // beim nächsten Faden still falsch würde.
  assert.ok(!/Reddit: \d/.test(ROUTE));
  assert.match(ROUTE, /zahlwort\(ZAHL\.alle\)/);
});

test('die Studienzahl deckt sich mit der Studie e0004', () => {
  const e0004 = JSON.parse(lies('../app/data/studien/e0004.json'));
  assert.equal(parseInt(e0004.eckdaten.material, 10), BERICHTE_STUDIE);
});

test('Stand ist ein Datum und steht sichtbar in der Quellenzeile', () => {
  assert.match(STAND, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(KOPF.quelle, /Stand: \d{1,2}\. \S+ \d{4}/);
  assert.match(KOMPONENTE, /KOPF\.quelle/);
});

// ---------------------------------------------------------------------------
// Bestmögliches Licht: kein Zitat, kein Link auf spottende Fäden.
// ---------------------------------------------------------------------------

test('kein Faden aus dem Satire-Forum und keine spottende Antwort ist verlinkt', () => {
  for (const f of FAEDEN) {
    if (['kleinanzeige', 'fundstueck', 'nebensatz'].includes(f.gruppe)) {
      assert.equal(f.link, null, `${f.id} darf nicht verlinkt sein`);
    }
  }
  for (const f of FAEDEN.filter((x) => x.link)) {
    assert.match(f.link, /^https:\/\/www\.reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+\/$/);
    assert.ok(f.link.includes(f.id));
  }
});

test('kein Fremdwortlaut aus den Fäden steht im Datenmodul', () => {
  // Die Wörter, mit denen Beiträge in den Fäden urteilen. Auf der Seite steht,
  // WAS dort steht, nicht, was dort gesagt wird.
  const text = ohneProsa(DATEN_ROH);
  for (const wort of [/scam/i, /Betrug/i, /Schwurbler/i, /useless/i, /advert/i, /Unsinn/i, /Quarks/i, /Science\s*Cops/i]) {
    assert.ok(!wort.test(text), `Fremdwortlaut im Datenmodul: ${wort}`);
  }
});

test('die zwei unbeantworteten Fragen sind der Beleg und deshalb verlinkt', () => {
  const frage = GENANNT.eintraege.find((e) => e.id === 'frage');
  assert.equal(frage.faeden.length, 2);
  for (const f of frage.faeden) assert.ok(f.link, `${f.id} ohne Link`);
  assert.equal(ZAHL.frageAntworten, 0);
});

// ---------------------------------------------------------------------------
// Design-Tokens: keine freien Werte ausserhalb :root, EIN Akzent.
// ---------------------------------------------------------------------------

test('die CSS erfindet ausserhalb :root keine Farbe', () => {
  const rumpf = CSS.slice(CSS.indexOf('}', CSS.indexOf(':root')) + 1);
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(rumpf), 'Farb-Literal im Rumpf');
  assert.ok(!/rgba?\(/i.test(rumpf), 'rgb()-Literal im Rumpf');
});

test('der Scope ist .rdt und fremde Scopes fehlen', () => {
  assert.ok(!/\.nog\b/.test(CSS));
  assert.match(KOMPONENTE, /className="rdt"/);
});
