// Hermetische Tests der Tatsachenseite /pages/neu-oder-gebraucht (Job
// 20260912-GROSSJOB-googles-ki-antwort-raet-vom-kauf-ab-…, Segment s05).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/neu-oder-gebraucht.test.mjs
//
// WAS DIESE DATEI PRUEFT UND WAS NICHT: sie prueft die ZUSAGEN des Baus am
// Quelltext — Schema aus sichtbarem Text, keine gesperrte Seite, jede Angabe
// mit Beleg, keine Kritik-Wiederholung. Ob die Seite LIVE hell ist, kann sie
// nicht wissen; das misst homepage-bauer/pruefungen/probe_neu_oder_gebraucht_
// hell.py am ausgelieferten HTML.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  FRAGEN,
  FRISTEN,
  IM_PREIS,
  NICHT_ENTHALTEN,
  PREIS_HINWEIS,
  RUECKWEG,
} from '../app/data/kauf-tatsachen.js';
import {buildFaqPageJsonLd} from '../app/lib/faq-schema.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {FAQ_ALLE} from '../app/data/faq-seite.js';

const lies = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

/**
 * DER CODE OHNE SEINE PROSA.
 *
 * Eigener Befund beim Bau dieser Datei, und er ist eine bekannte Klasse: drei
 * Pruefungen schlugen an, weil die Begründung im Dateikopf die verbotenen
 * Woerter NENNT — `noindex`, `{rel:'canonical'}` und die Zahl 440 stehen dort
 * als Erklaerung, warum sie NICHT im Code stehen. Ein Zensus, der Prosa
 * mitliest, misst den Kommentar und nicht den Gegenstand; die Folge wäre ein
 * Dauer-Rot, das man nur durch Loeschen der Begründung heilt. Gemessen wird
 * deshalb der Programmtext.
 */
const ohneProsa = (t) =>
  t.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');

const ROUTE_MIT_PROSA = lies('../app/routes/pages.neu-oder-gebraucht.jsx');
const ROUTE = ohneProsa(ROUTE_MIT_PROSA);
const KOMPONENTE = ohneProsa(
  lies('../app/components/campaign/NeuOderGebrauchtSeite.jsx'),
);
const CSS = lies('../app/styles/neu-oder-gebraucht.css');
const PFAD = '/pages/neu-oder-gebraucht';

// ---------------------------------------------------------------------------
// Die haerteste Bedingung: die Seite muss abrufbar UND indexierbar sein.
// ---------------------------------------------------------------------------

test('die Route trägt KEIN noindex und KEINEN X-Robots-Tag', () => {
  // Eine Seite auf noindex kann in einer KI-Antwort baulich nie zitiert
  // werden. Das ist der Grund dieses Segments, nicht eine Formalie.
  assert.ok(!/noindex/i.test(ROUTE), 'noindex im Programmtext der Route');
  assert.ok(!/headers\s*=/.test(ROUTE), 'die Route exportiert headers()');
});

test('die Route setzt ein echtes canonical über canonicalLink()', () => {
  assert.match(ROUTE, /canonicalLink\(PFAD\)/);
  // Ein {rel:'canonical'} ohne tagName wäre ein <meta rel="canonical"> und
  // damit wirkungslos (Befund L11).
  assert.ok(!/\{rel:\s*'canonical'/.test(ROUTE));
});

test('die Seite steht in NUR_ROUTE_SEITEN und nennt dort ihre Wache', () => {
  // Ohne den Eintrag liefert sie HTTP 200 und steht in keiner Sitemap:
  // gebaut und für die Suche unsichtbar.
  const e = NUR_ROUTE_SEITEN.find((s) => s.pfad === PFAD);
  assert.ok(e, 'kein NUR_ROUTE_SEITEN-Eintrag');
  assert.match(e.grund, /probe_neu_oder_gebraucht_hell\.py/);
  assert.match(e.lastmod, /^\d{4}-\d{2}-\d{2}T/);
});

test('robots.txt sperrt diesen Pfad nicht', () => {
  const robots = lies('../app/routes/[robots.txt].jsx');
  assert.ok(
    !robots.includes(`Disallow: ${PFAD}`),
    'robots.txt trägt eine Disallow-Zeile für diese Seite',
  );
});

test('eine indexierte Nachbarseite verlinkt hierher', () => {
  // Der Menue-Eintrag trägt das nicht: Shopify rendert die Kinder
  // clientseitig, im Server-HTML stehen sie nicht.
  const treffer = FAQ_ALLE.filter((i) => i.weiter?.pfad === PFAD);
  assert.equal(treffer.length, 1);
  assert.ok(treffer[0].weiter.text.length > 20);
});

// ---------------------------------------------------------------------------
// Das Schema entsteht AUS dem sichtbaren Text — nicht daneben.
// ---------------------------------------------------------------------------

test('alle fünf Fragen passieren das Deny-Netz', () => {
  // Der stille Verlust ist der teure Fall: buildFaqPageJsonLd wirft Items aus
  // und liefert ein kuerzeres Schema, ohne Fehlermeldung.
  const schema = buildFaqPageJsonLd(FRAGEN, {inLanguage: 'de-DE'});
  assert.ok(schema, 'kein Schema entstanden');
  assert.equal(schema.mainEntity.length, FRAGEN.length);
  assert.equal(FRAGEN.length, 5);
});

test('jede Schema-Frage steht auch sichtbar auf der Seite', () => {
  // Die Komponente rendert {f.q} und {f.a} aus derselben Liste. Faellt der
  // Abschnitt weg, ist das Schema eine Auszeichnung für unsichtbaren Text.
  assert.match(KOMPONENTE, /FRAGEN\.map/);
  assert.match(KOMPONENTE, /\{f\.q\}/);
  assert.match(KOMPONENTE, /\{f\.a\}/);
  assert.match(ROUTE, /buildFaqPageJsonLd\(FRAGEN/);
});

test('das Schema trägt Autor und Datum als Konstanten, nicht als Uhr', () => {
  assert.match(ROUTE, /const NOG_VEROEFFENTLICHT = '\d{4}-\d{2}-\d{2}'/);
  assert.match(ROUTE, /const NOG_GEAENDERT = '\d{4}-\d{2}-\d{2}'/);
  assert.ok(!/new Date\(\)/.test(ROUTE), 'Laufzeit-Uhr im dateModified');
});

// ---------------------------------------------------------------------------
// Jede Angabe nennt ihre Quelle.
// ---------------------------------------------------------------------------

test('jede Frist und jeder Preisposten trägt einen Beleg', () => {
  for (const f of FRISTEN) {
    assert.ok(f.beleg && f.beleg.length > 5, `Frist ohne Beleg: ${f.id}`);
  }
  for (const p of IM_PREIS) {
    assert.ok(p.beleg && p.beleg.length > 5, `Posten ohne Beleg: ${p.id}`);
  }
  // Und die Komponente zeigt ihn auch an — ein Beleg im Datenmodul, den
  // niemand sieht, ist kein Beleg.
  assert.match(KOMPONENTE, /Quelle:/);
});

test('die Zufriedenheitszahl ist kein Literal', () => {
  // Sie bewegt sich real (438 -> 439 -> 440 an einem Tag). Ein Literal wäre
  // am Tag seiner Niederschrift richtig und danach falsch.
  assert.match(KOMPONENTE, /useGoogleRating\(\)/);
  assert.match(KOMPONENTE, /\{g\.total\}/);
  assert.ok(
    !/\b4[.,]8\b/.test(KOMPONENTE) && !/\b4[34][0-9]\b/.test(KOMPONENTE),
    'harte Bewertungszahl in der Komponente',
  );
});

test('die Zahl sagt, was sie ist: eine Bewertung des Unternehmens', () => {
  // Ohne diesen Halbsatz wäre sie eine Produktbewertung mit falschem
  // Subjekt — genau der Verstoss, den s04 vermieden hat.
  assert.match(KOMPONENTE, /nicht ein\s+einzelnes Produkt/);
});

test('beide Fristen stehen nebeneinander und sind unterschieden', () => {
  const ids = FRISTEN.map((f) => f.id);
  assert.deepEqual(ids, ['ruecknahme', 'widerruf', 'gewaehrleistung']);
  const r = FRISTEN.find((f) => f.id === 'ruecknahme');
  const w = FRISTEN.find((f) => f.id === 'widerruf');
  assert.match(r.text, /20 Tage/);
  assert.match(w.text, /14 Tage/);
  assert.match(w.text, /nicht dasselbe/);
});

// ---------------------------------------------------------------------------
// Die Grenzen dieses Auftrags, maschinell gehalten.
// ---------------------------------------------------------------------------

test('kein Vorwurf wird wiederholt und kein Kritiker genannt', () => {
  // Wer die Vorwuerfe nachdruckt, verstaerkt die Verbindung. Geprueft wird
  // der ganze sichtbare Text, nicht nur eine Ueberschrift.
  const sichtbar = [
    ...FRAGEN.flatMap((f) => [f.q, f.a]),
    ...FRISTEN.flatMap((f) => [f.titel, f.text]),
    ...IM_PREIS.map((p) => p.text),
    ...NICHT_ENTHALTEN.flatMap((n) => [n.titel, n.text]),
    PREIS_HINWEIS,
    ...RUECKWEG,
  ].join(' ');
  for (const wort of [
    'WDR',
    'Quarks',
    'Science Cops',
    'Scharlatan',
    'Betrug',
    'Abzocke',
    'Placebo',
    'unseriös',
  ]) {
    assert.ok(
      !new RegExp(wort, 'i').test(sichtbar),
      `Kritik-Vokabel auf der Seite: ${wort}`,
    );
  }
});

test('keine Wirkaussage auf dieser Flaeche', () => {
  const sichtbar = [
    ...FRAGEN.map((f) => f.a),
    ...FRISTEN.map((f) => f.text),
    ...IM_PREIS.map((p) => p.text),
    ...NICHT_ENTHALTEN.map((n) => n.text),
    PREIS_HINWEIS,
  ].join(' ');
  for (const wort of ['heilt', 'Heilung', 'Studie', 'Zellstudie', 'kohärent']) {
    assert.ok(
      !new RegExp(wort, 'i').test(sichtbar),
      `Wirk-/Studienaussage auf der Kaufflaeche: ${wort}`,
    );
  }
});

test('keine Rueckgabequote — auch nicht geschaetzt', () => {
  // Sie ist heute nicht belastbar messbar (Shopify-Lesepfad erreicht 57,4
  // Tage). Eine Zahl aus einem Zwei-Monats-Fenster saehe wie eine Messung aus.
  const alles = [
    ...FRAGEN.map((f) => f.a),
    ...FRISTEN.map((f) => f.text),
    ...IM_PREIS.map((p) => p.text),
    ...NICHT_ENTHALTEN.map((n) => n.text),
  ].join(' ');
  assert.ok(!/Rückgabequote|Ruecknahmequote|Retourenquote/i.test(alles));
  assert.ok(!/%/.test(alles), 'Prozentzahl ohne Quelle auf der Seite');
});

test('der Gebrauchtmarkt-Abschnitt urteilt über UNSER Angebot', () => {
  // Keine Bewertung fremder Verkaeufer, keine Rechtsauslegung für deren
  // Geschaefte. Jede Zeile ist eine Aussage darueber, wogegen der Kaeufer
  // Ansprueche hat — und das können wir nur für uns beantworten.
  assert.equal(NICHT_ENTHALTEN.length, 4);
  for (const wort of ['Betrüger', 'Fälschung', 'gefälscht', 'illegal']) {
    const t = NICHT_ENTHALTEN.map((n) => n.text).join(' ');
    assert.ok(!new RegExp(wort, 'i').test(t), `Angriff auf Dritte: ${wort}`);
  }
  assert.match(PREIS_HINWEIS, /Angebotspreis/);
});

// ---------------------------------------------------------------------------
// Design: das Token-System ist die messbare Haelfte des Beauty-Gates.
// ---------------------------------------------------------------------------

test('die CSS erfindet ausserhalb von :root keinen freien Wert', () => {
  const rumpf = CSS.slice(CSS.indexOf('.nog {'));
  // Farb-Literale ausserhalb des Token-Blocks wären der zweite Goldton.
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(rumpf), 'Farb-Literal im CSS-Rumpf');
});

test('genau EIN Akzent-Token und hoechstens neun Schriftgroessen', () => {
  const root = CSS.slice(CSS.indexOf(':root'), CSS.indexOf('.nog {'));
  const akzente = [...root.matchAll(/--nog-akzent[\w-]*:/g)];
  assert.equal(akzente.length, 1);
  const stufen = [...root.matchAll(/--nog-fs-[\w-]+:/g)];
  assert.ok(stufen.length <= 9, `${stufen.length} Schriftgroessen`);
});

test('der Messcontainer heißt so, dass die Pruefliste ihn findet', () => {
  // Der Gestaltungs-Pruefliste faellt ein Textcontainer nur auf, wenn sein
  // Klassenname ein Container-Wort trägt. Ohne das werden Zeilenlaenge und
  // Innenabstaende nicht rot, sondern gar nicht erst gemessen.
  assert.match(CSS, /\.nog__inhalt\s*\{/);
  assert.match(KOMPONENTE, /className="nog__inhalt"/);
});
