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

import {ohneProsa} from './_quelltext.mjs';

import {
  FRAGEN,
  FRISTEN,
  GRUENDE,
  IM_PREIS,
  RUECKWEG,
} from '../app/data/kauf-tatsachen.js';
import {buildFaqPageJsonLd} from '../app/lib/faq-schema.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {FAQ_ALLE} from '../app/data/faq-seite.js';

const lies = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

/**
 * DER CODE OHNE SEINE PROSA — der Helfer steht seit 2026-09-13 in
 * `./_quelltext.mjs`, weil dieselbe Klasse eine zweite Datei traf.
 *
 * Eigener Befund beim Bau dieser Datei: drei Prüfungen schlugen an, weil die
 * Begründung im Dateikopf die verbotenen Wörter NENNT — `noindex`,
 * `{rel:'canonical'}` und die Zahl 440 stehen dort als Erklaerung, warum sie
 * NICHT im Code stehen. Ein Zensus, der Prosa mitliest, misst den Kommentar
 * und nicht den Gegenstand; die Folge ist ein Dauer-Rot, das man nur durch
 * Löschen der Begründung heilt. Gemessen wird deshalb der Programmtext.
 */

const ROUTE_MIT_PROSA = lies('../app/routes/pages.neu-oder-gebraucht.jsx');
const ROUTE = ohneProsa(ROUTE_MIT_PROSA);
const KOMPONENTE = ohneProsa(
  lies('../app/components/campaign/NeuOderGebrauchtSeite.jsx'),
);
// DIE AUSGELASSENE DRITTE QUELLE. ROUTE und KOMPONENTE gingen von Anfang an
// durch `ohneProsa`, die CSS nicht — und nur sie trug einen Arm, der deshalb
// seit dem Geburts-Commit 408c0fd (#414) NIE gruen war. Das einzige
// Farb-Literal im Rumpf ist `#F2BF72` in einem Kommentar; es beschreibt den
// fremden ActiveCampaign-Ocker, den der Block darunter gerade überschreibt.
// Der Kommentar war also der BELEG für die Einhaltung der Regel und wurde
// als ihr Bruch gemessen.
const CSS = ohneProsa(lies('../app/styles/neu-oder-gebraucht.css'));
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
  for (const g of GRUENDE) {
    assert.ok(g.beleg && g.beleg.length > 5, `Grund ohne Beleg: ${g.id}`);
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
  // Seit 2026-11-01 ohne die Antithese „…, nicht ein einzelnes Produkt"
  // (Christian 28.09.: „X, nicht Y" ist AI-Sprache), das Subjekt bleibt.
  assert.match(KOMPONENTE, /Google-Bewertungen für Qi Blanco/);
  assert.ok(!/nicht ein\s+einzelnes Produkt/.test(KOMPONENTE));
});

test('die GEO-Tatsache steht als eine Aussage: 20 Tage bei uns, 14 im Gesetz', () => {
  const ids = FRISTEN.map((f) => f.id);
  assert.deepEqual(ids, ['ruecknahme', 'widerruf', 'gewaehrleistung']);
  const r = FRISTEN.find((f) => f.id === 'ruecknahme');
  const w = FRISTEN.find((f) => f.id === 'widerruf');
  assert.match(r.text, /20 Tage/);
  // Beide Zahlen in EINER Aussage, mit Quelle (AGB) - so kann ein
  // Antwortsystem sie zusammen zitieren.
  assert.match(w.text, /14 Tage/);
  assert.match(w.text, /20 Tage/);
  assert.equal(w.belegPfad, '/pages/agb');
  assert.equal(GRUENDE.find((g) => g.id === 'widerruf').text, w.text);
});

// ---------------------------------------------------------------------------
// Christians Nachtrag 28.09.2026 (s14, umgesetzt 2026-11-01): positiv, warum
// direkt bei Qi Blanco kaufen; Katalog und Kleinanzeigen-Kommentar ersatzlos.
// ---------------------------------------------------------------------------

test('die Gründe für den Direktkauf stehen in Christians Reihenfolge', () => {
  const titel = GRUENDE.map((g) => g.titel).join(' | ');
  assert.match(titel, /20 Tage zu Hause testen/);
  assert.match(titel, /100 % Geld-zurück-Garantie/);
  assert.match(titel, /Gewährleistung/);
  assert.match(titel, /Bestellnummer/);
  assert.match(titel, /original/i);
  assert.match(KOMPONENTE, /GRUENDE\.map/);
  // Die Quellen kommen aus FRISTEN, nie abgeschrieben.
  for (const id of ['ruecknahme', 'widerruf', 'gewaehrleistung']) {
    assert.equal(
      GRUENDE.find((g) => g.id === id).beleg,
      FRISTEN.find((f) => f.id === id).beleg,
    );
  }
});

test('Christians beanstandete Sätze stehen nirgends mehr', () => {
  const sichtbar = [
    ...FRAGEN.flatMap((f) => [f.q, f.a]),
    ...FRISTEN.flatMap((f) => [f.titel, f.text]),
    ...GRUENDE.flatMap((g) => [g.titel, g.text]),
    ...IM_PREIS.map((p) => p.text),
    ...RUECKWEG,
    KOMPONENTE,
    ROUTE,
  ].join(' ');
  for (const satz of [
    /von privat/i,
    /Kleinanzeige/i,
    /Angebotspreis/i,
    /Privatperson/i,
    /nicht bei uns/i,
    /ab 99 Euro/i,
  ]) {
    assert.ok(!satz.test(sichtbar), `wieder da: ${satz}`);
  }
});

test('f-preis IST IM_PREIS: der Versandsatz wörtlich, auch im Schema', () => {
  // Bis 2026-11-01 trug die Antwort eine eigene Fassung (DE erst ab 99 Euro,
  // Zoll für AT) und widersprach IM_PREIS auf derselben Seite.
  const a = FRAGEN.find((f) => f.id === 'f-preis').a;
  for (const id of ['versand']) {
    const t = IM_PREIS.find((p) => p.id === id).text;
    assert.ok(a.includes(t), `f-preis trägt IM_PREIS.${id} nicht wörtlich`);
  }
  const schema = buildFaqPageJsonLd(FRAGEN, {inLanguage: 'de-DE'});
  const q = schema.mainEntity.find((e) => e.name === 'Was ist im Preis enthalten?');
  assert.ok(q, 'f-preis fehlt im Schema');
  assert.ok(
    q.acceptedAnswer.text.includes(IM_PREIS.find((p) => p.id === 'versand').text),
    'Schema-Antwort weicht von IM_PREIS ab',
  );
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
    ...GRUENDE.flatMap((g) => [g.titel, g.text]),
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
    ...GRUENDE.map((g) => g.text),
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
    ...GRUENDE.flatMap((g) => [g.titel, g.text]),
  ].join(' ');
  assert.ok(!/Rückgabequote|Ruecknahmequote|Retourenquote/i.test(alles));
  // Die eine erlaubte Prozentangabe ist Christians Wortlaut „100 %
  // Geld-zurück-Garantie" (28.09.2026); jede andere Prozentzahl wäre eine
  // Zahl ohne Quelle.
  const ohneGarantie = alles.replace(/100 % Geld-zurück-Garantie/g, '');
  assert.ok(!/%/.test(ohneGarantie), 'Prozentzahl ohne Quelle auf der Seite');
});

// ---------------------------------------------------------------------------
// Design: das Token-System ist die messbare Hälfte des Beauty-Gates.
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
