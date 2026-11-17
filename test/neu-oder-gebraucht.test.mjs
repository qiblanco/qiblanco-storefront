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
  FRAGE_GEBRAUCHT,
  FRISTEN,
  VORTEILE,
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
  // Mit der Gebrauchtkauf-Frage (2026-11-10) sind es sechs, und keine fällt
  // aus dem Netz.
  const mit = buildFaqPageJsonLd([FRAGE_GEBRAUCHT, ...FRAGEN], {inLanguage: 'de-DE'});
  assert.equal(mit.mainEntity.length, 6);
  assert.equal(mit.mainEntity[0].name, FRAGE_GEBRAUCHT.q);
});

test('jede Schema-Frage steht auch sichtbar auf der Seite', () => {
  // Die Komponente rendert {f.q} und {f.a} aus derselben Liste. Faellt der
  // Abschnitt weg, ist das Schema eine Auszeichnung für unsichtbaren Text.
  assert.match(KOMPONENTE, /const fragen = \[\.\.\.zusatzFragen, \.\.\.FRAGEN\]/);
  assert.match(KOMPONENTE, /fragen\.map/);
  assert.match(KOMPONENTE, /\{f\.q\}/);
  assert.match(KOMPONENTE, /\{f\.a\}/);
  // NAHT Route -> Komponente (seit 2026-11-10): übergibt die Route
  // zusatzFragen, baut sie das Schema aus GENAU dieser Liste vor FRAGEN.
  // Ohne Übergabe (Gewinnerfassung) bleibt es buildFaqPageJsonLd(FRAGEN, …).
  const zusatz = ROUTE.match(/zusatzFragen=\{(\w+)\}/);
  if (zusatz) {
    assert.ok(
      ROUTE.includes(`buildFaqPageJsonLd([...${zusatz[1]}, ...FRAGEN]`),
      `Schema ohne die sichtbaren zusatzFragen ${zusatz[1]}`,
    );
  } else {
    assert.match(ROUTE, /buildFaqPageJsonLd\(FRAGEN,/);
  }
});

test('die Gebrauchtkauf-Frage: Antwort im ersten Satz, nur über unser Angebot', () => {
  const {q, a} = FRAGE_GEBRAUCHT;
  assert.match(q, /EMF-Armband/);
  assert.match(q, /gebraucht/);
  const erster = a.split(/(?<=\.)\s+/)[0];
  // Echtheit, Rückgabe, Garantie und Gewährleistung im ERSTEN Satz.
  for (const teil of [/im Original/, /Seriennummer/, /20 Tage zu Hause testen/, /100 % Geld-zurück-Garantie/, /Gewährleistung/]) {
    assert.match(erster, teil);
  }
  assert.match(erster, /Elektrosmog-Armband/);
  assert.equal(FRAGE_GEBRAUCHT.belegPfad, '/pages/agb');
  assert.match(FRAGE_GEBRAUCHT.beleg, /Zufriedenheitsgarantie/);
  // Nicht in FRAGEN: die Gewinnerfassung rendert FRAGEN unverändert.
  assert.ok(!FRAGEN.some((f) => f.id === FRAGE_GEBRAUCHT.id));
  // Christian 28.09.: kein Satz über den Gebrauchtmarkt.
  assert.ok(!/privat|Kleinanzeige|Gebrauchtmarkt|Verkäufer|eBay/i.test(a));
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
  for (const g of VORTEILE) {
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
  // Sichtbar EINMAL, unter „20 Tage zu Hause testen" (kein eigener Punkt).
  assert.equal(VORTEILE.find((g) => g.id === 'ruecknahme').text, w.text);
  assert.equal(VORTEILE.find((g) => g.id === 'ruecknahme').belegPfad, '/pages/agb');
  assert.equal(VORTEILE.filter((g) => /14/.test(`${g.titel} ${g.text || ''}`)).length, 1);
});

// ---------------------------------------------------------------------------
// Christians Nachtrag 28.09.2026 (s14, umgesetzt 2026-11-01): positiv, warum
// direkt bei Qi Blanco kaufen; Katalog und Kleinanzeigen-Kommentar ersatzlos.
// ---------------------------------------------------------------------------

test('die Gründe für den Direktkauf stehen in Christians Reihenfolge', () => {
  const titel = VORTEILE.map((g) => g.titel).join(' | ');
  assert.match(titel, /20 Tage zu Hause testen/);
  assert.match(titel, /100 % Geld-zurück-Garantie/);
  assert.match(titel, /Gewährleistung/);
  assert.match(titel, /Bestellnummer/);
  assert.match(titel, /original/i);
  assert.match(KOMPONENTE, /VORTEILE\.map/);
  assert.equal(VORTEILE.length, 5);
  // Die Quellen kommen aus FRISTEN, nie abgeschrieben.
  for (const [vid, fid] of [['ruecknahme', 'widerruf'], ['gewaehrleistung', 'gewaehrleistung']]) {
    assert.equal(
      VORTEILE.find((g) => g.id === vid).beleg,
      FRISTEN.find((f) => f.id === fid).beleg,
    );
  }
});

test('Christians beanstandete Sätze stehen nirgends mehr', () => {
  const sichtbar = [
    ...[FRAGE_GEBRAUCHT, ...FRAGEN].flatMap((f) => [f.q, f.a]),
    ...FRISTEN.flatMap((f) => [f.titel, f.text]),
    ...VORTEILE.flatMap((g) => [g.titel, g.text]),
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
    ...[FRAGE_GEBRAUCHT, ...FRAGEN].flatMap((f) => [f.q, f.a]),
    ...FRISTEN.flatMap((f) => [f.titel, f.text]),
    ...IM_PREIS.map((p) => p.text),
    ...VORTEILE.flatMap((g) => [g.titel, g.text]),
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
    ...[FRAGE_GEBRAUCHT, ...FRAGEN].map((f) => f.a),
    ...FRISTEN.map((f) => f.text),
    ...IM_PREIS.map((p) => p.text),
    ...VORTEILE.map((g) => g.text),
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
    ...[FRAGE_GEBRAUCHT, ...FRAGEN].map((f) => f.a),
    ...FRISTEN.map((f) => f.text),
    ...IM_PREIS.map((p) => p.text),
    ...VORTEILE.flatMap((g) => [g.titel, g.text]),
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

// ---------------------------------------------------------------------------
// BELEGTREUE der nachprüfbaren Tatsachen (app/data/kauf-tatsachen.js):
// jede Zahl, die eine Angabe nennt, steht auch an der Stelle, die ihre
// Quellzeile zitiert.
//
// ANLASS (s03 des Grossjobs seo-2026-w43-l26-neu-oder-gebraucht-26c6,
// 2026-11-17): auf /pages/neu-oder-gebraucht stand seit #414 unter „20 Tage"
// die Quelle „AGB, § 7 Widerrufsrecht". § 7 nennt vierzehn Tage, die 20 stehen
// im Abschnitt „Freiwillige 20-Tage-Zufriedenheitsgarantie". Und unter
// „100 % Geld-zurück-Garantie" stand „auf jeder Seite in der Kopfleiste"; die
// Kopfleiste nennt keine Garantie. Die bestehende Prüfung („jede Frist trägt
// einen Beleg", test/neu-oder-gebraucht.test.mjs) sah nur, DASS eine Quelle
// dasteht, nie, ob sie die Zahl trägt. Dieser Abschnitt schließt die Klasse.
// (Hier und nicht als eigene Datei: die Scope-Allowlist von hb-deploy führt
// Tests einzeln, diese Datei ist freigegeben.)
//
// WIE: die Quellen, die im Repo liegen, werden aus ihrem Quelltext gelesen
//  - /pages/agb      -> app/routes/pages.agb.jsx, je <h2>-Abschnitt. Zitiert
//                       ist ein Abschnitt, wenn die Quellzeile sein „§ N"
//                       oder das letzte Wort seiner Überschrift nennt.
//  - /pages/faq      -> die Antworten der FAQ (FAQ_ALLE).
//  - Richtlinie (EU) 2025/1960 ohne Pfad -> app/lib/eu-gewaehrleistungslabel.js
//    (der Gewährleistungshinweis, aus dem der Wortlaut stammt).
// Was nicht im Repo liegt (die Shopify-Versandrichtlinie), steht namentlich
// in EXTERN; eine NEUE nicht prüfbare Quelle mit Zahl macht diesen Test rot,
// statt still durchzugehen.
//
// Zahlwörter („vierzehn", „zwei") gelten wie Ziffern, „100 %" wie „voll"
// (die AGB sagen „volle Geld-zurück-Garantie").
//
// Ausführen: node --test test/neu-oder-gebraucht.test.mjs (Abschnitt BELEGTREUE)
// Rot-vor-Grün: BELEGTREUE_MUTANTE=alt-beleg setzt die alten Quellzeilen ein
// und muss rot werden (gemessen beim Bau, Beleg im RESULT des Jobs).
const ZAHLWORT = [
  ['vierzehn', '14'],
  ['zwanzig', '20'],
  ['zwölf', '12'],
  ['zehn', '10'],
  ['zwei', '2'],
  ['drei', '3'],
  ['vier', '4'],
  ['sechs', '6'],
  ['sieben', '7'],
];

/** Text ohne Auszeichnung, Zahlwörter als Ziffern, Tausenderpunkt weg. */
function normiere(t) {
  let s = String(t)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{' '\}/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .toLowerCase();
  for (const [wort, ziffer] of ZAHLWORT) {
    // Als Wortanfang: „vierzehntägiges", „zweijährige", „zwei Jahre".
    s = s.replace(new RegExp(`(^|[^a-zäöüß])${wort}`, 'g'), `$1 ${ziffer} `);
  }
  return s.replace(/(\d)\.(\d{3})\b/g, '$1$2');
}

/** Die Zahlen einer Angabe; „100 %" als eigenes Merkmal. */
function zahlen(t) {
  const s = normiere(t);
  const out = new Set();
  for (const m of s.matchAll(/(?<![\d/])(\d+)(?![\d/])(\s*%)?/g)) {
    out.add(m[2] ? `${m[1]} %` : m[1]);
  }
  return [...out];
}

/** Steht die Zahl im Quelltext? Ganze Zahl, nie als Teil von 2025. */
function stehtIn(zahl, quelle) {
  const s = normiere(quelle);
  if (zahl === '100 %') return /100\s*%/.test(s) || /(^|[^a-zäöüß])voll/.test(s);
  const roh = zahl.replace(' %', '');
  return new RegExp(`(?<![\\d/])${roh}(?![\\d/])`).test(s);
}

/** pages.agb.jsx in Abschnitte je <h2>. */
function agbAbschnitte(quelle) {
  const teile = quelle.split(/<h2>/).slice(1);
  return teile.map((t) => {
    const ende = t.indexOf('</h2>');
    const titel = t.slice(0, ende).replace(/\s+/g, ' ').trim();
    const ohneKlammer = titel.replace(/\s*\(.*\)\s*$/, '');
    const paragraf = (ohneKlammer.match(/^§\s*(\d+)/) || [])[1] || null;
    const letztesWort = ohneKlammer.split(' ').pop();
    return {titel, paragraf, letztesWort, text: t.slice(ende + 5)};
  });
}

const GANZES_WORT = (w) =>
  new RegExp(`(^|[^\\wäöüßÄÖÜ-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\wäöüßÄÖÜ-])`);

/** Welche AGB-Abschnitte nennt diese Quellzeile? */
function zitierteAbschnitte(beleg, abschnitte) {
  return abschnitte.filter(
    (a) =>
      (a.paragraf && new RegExp(`§\\s*${a.paragraf}(?!\\d)`).test(beleg)) ||
      GANZES_WORT(a.letztesWort).test(beleg),
  );
}

// Nicht im Repo, mit Grund. Eine Quelle MIT Zahl, die weder hier noch in den
// Lesern unten steht, ist ein Befund.
const EXTERN = {
  '/policies/shipping-policy':
    'Shopify-Versandrichtlinie, gepflegt im Shopify-Admin, nicht im Repo',
};

const ALTE_BELEGE = {
  ruecknahme: ['unsere eigene Zusage, auf jeder Seite in der Kopfleiste', null],
  widerruf: ['AGB, § 7 Widerrufsrecht', '/pages/agb'],
};

/** Alle Angaben mit Beleg, flach: {wo, id, behauptung, beleg, belegPfad}. */
function angaben() {
  const mutante = process.env.BELEGTREUE_MUTANTE === 'alt-beleg';
  const fristBeleg = (id) => {
    const f = FRISTEN.find((x) => x.id === id);
    return mutante && ALTE_BELEGE[id]
      ? {beleg: ALTE_BELEGE[id][0], belegPfad: ALTE_BELEGE[id][1]}
      : {beleg: f.beleg, belegPfad: f.belegPfad};
  };
  // Die Mutante tauscht die Belege so, wie die Seite sie vor s03 zeigte
  // (VORTEILE/FRAGEN erben aus FRISTEN; f-frist erbte den Widerruf).
  const erbe = {
    'FRISTEN:ruecknahme': 'ruecknahme',
    'FRISTEN:widerruf': 'widerruf',
    'VORTEILE:ruecknahme': 'widerruf',
    'VORTEILE:garantie': 'ruecknahme',
    'FRAGEN:f-frist': 'widerruf',
  };
  const liste = [];
  const nimm = (wo, e) => {
    if (!e.beleg) return;
    const behauptung = [e.titel, e.text, e.q, e.a].filter(Boolean).join(' ');
    let {beleg, belegPfad} = e;
    if (mutante && erbe[`${wo}:${e.id}`]) ({beleg, belegPfad} = fristBeleg(erbe[`${wo}:${e.id}`]));
    liste.push({wo, id: e.id, behauptung, beleg, belegPfad});
  };
  for (const f of FRISTEN) nimm('FRISTEN', f);
  for (const v of VORTEILE) nimm('VORTEILE', v);
  for (const f of FRAGEN) nimm('FRAGEN', f);
  nimm('FRAGE_GEBRAUCHT', FRAGE_GEBRAUCHT);
  for (const p of IM_PREIS) nimm('IM_PREIS', p);
  return liste;
}

const AGB = agbAbschnitte(lies('../app/routes/pages.agb.jsx'));
const FAQ_TEXT = FAQ_ALLE.map((f) => `${f.q} ${f.a}`).join('\n');
const EU_HINWEIS = lies('../app/lib/eu-gewaehrleistungslabel.js');

/** Der Quelltext, den eine Quellzeile zitiert, oder null (nicht prüfbar). */
function quelleVon(a) {
  if (a.belegPfad === '/pages/agb') {
    const z = zitierteAbschnitte(a.beleg, AGB);
    return {art: 'agb', abschnitte: z.map((x) => x.titel), text: z.map((x) => x.text).join('\n')};
  }
  if (a.belegPfad === '/pages/faq') return {art: 'faq', abschnitte: ['FAQ'], text: FAQ_TEXT};
  if (a.belegPfad === null && /2025\/1960/.test(a.beleg)) {
    return {art: 'eu', abschnitte: ['Gewährleistungshinweis'], text: EU_HINWEIS};
  }
  return null;
}

test('die Leser finden ihre Quellen (Positivkontrolle der Zerlegung)', () => {
  // Ohne diese Kontrolle wäre ein kaputter Leser (0 Abschnitte, leerer
  // Text) still grün, weil nichts zu prüfen bliebe.
  const titel = AGB.map((a) => a.titel);
  assert.ok(AGB.length >= 10, `AGB-Abschnitte: ${AGB.length}`);
  assert.ok(titel.some((t) => /^§ 7 Widerrufsbelehrung$/.test(t)), titel.join(' | '));
  assert.ok(titel.some((t) => /20-Tage-Zufriedenheitsgarantie/.test(t)), titel.join(' | '));
  const p7 = AGB.find((a) => a.paragraf === '7');
  const gar = AGB.find((a) => /Zufriedenheitsgarantie/.test(a.titel));
  assert.ok(stehtIn('14', p7.text), '§ 7 nennt vierzehn Tage');
  assert.ok(!stehtIn('20', p7.text), '§ 7 nennt die 20 Tage NICHT');
  assert.ok(stehtIn('20', gar.text) && stehtIn('100 %', gar.text));
  assert.deepEqual(zahlen('ab 1.000 Euro bis zu 24, Richtlinie (EU) 2025/1960'), ['1000', '24']);
  assert.deepEqual(zahlen('100 % Geld-zurück-Garantie, 20 Tage'), ['100 %', '20']);
  assert.ok(FAQ_TEXT.length > 1000 && EU_HINWEIS.length > 1000);
  // Die Prüfung hat Gegenstand: mindestens die drei AGB-Angaben der Fristen.
  assert.ok(angaben().filter((a) => a.belegPfad === '/pages/agb').length >= 4);
});

test('jede AGB-Quellzeile nennt einen echten Abschnitt', () => {
  for (const a of angaben().filter((x) => x.belegPfad === '/pages/agb')) {
    const q = quelleVon(a);
    assert.ok(
      q.abschnitte.length > 0,
      `${a.wo}:${a.id} — „${a.beleg}" nennt keinen Abschnitt der AGB (Überschriften: ${AGB.map((x) => x.titel).join(' | ')})`,
    );
  }
});

test('jede genannte Zahl steht in der zitierten Quelle', () => {
  const befunde = [];
  for (const a of angaben()) {
    const zz = zahlen(a.behauptung);
    if (!zz.length) continue;
    const q = quelleVon(a);
    if (!q) {
      if (!(a.belegPfad in EXTERN)) {
        befunde.push(
          `${a.wo}:${a.id} nennt ${zz.join(', ')}, Quelle „${a.beleg}" (${a.belegPfad}) ist im Repo nicht prüfbar und nicht in EXTERN`,
        );
      }
      continue;
    }
    for (const z of zz) {
      if (!stehtIn(z, q.text)) {
        befunde.push(
          `${a.wo}:${a.id} nennt „${z}", die Quelle „${a.beleg}" (${q.abschnitte.join(' + ')}) nennt es nicht`,
        );
      }
    }
  }
  assert.deepEqual(befunde, []);
});
