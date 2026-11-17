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
// Zahlwörter („vierzehn", „zwei", „ein Jahr") gelten wie Ziffern. Eine Zahl
// zählt nur MIT ihrer Einheit (Tage, Werktage, Wochen, Monate, Jahre, Euro):
// der unabhängige Gegenprüfer von s03 fand, dass sonst „§ 14 BGB" die 14 Tage,
// „20. Juli 2025" die 20 und der Absatz „(2)" die zwei Jahre belegte.
// Gliederungsmarker (§ N, Abs., Nr., (N), Datum) zählen nie. „100 %" gilt nur
// als „volle Geld-zurück…" oder „vollen Kaufpreis" (die AGB-Formulierung).
//
// RUNDE 2 (zweiter Gegenprüfer, 13 grüne Falschaussagen von 32 Mutanten):
//  - VERWEIS ZÄHLT NICHT: ein Satz, der auf einen ANDEREN AGB-Paragrafen
//    verweist („vierzehntägiges Widerrufsrecht nach § 7"), belegt in diesem
//    Abschnitt nichts; sonst trug der Garantieabschnitt „14 Tage Rücknahme".
//    Ebenso zählt ein Name wie „20-Tage-Zufriedenheitsgarantie" nicht als Frist.
//  - ZUSAMMEN, WAS ZUSAMMEN STEHT: Zahlen, die in der Angabe in EINEM
//    Satzglied stehen („ab 500 Euro 12"), müssen auch in der Quelle in einem
//    Satzglied zusammen stehen; nennt das Satzglied einen Kernbegriff
//    (Gewährleistung, Widerruf, Garantie, Raten), steht er dort mit. Sonst
//    belegte die Rügefrist „7 Tagen … anzuzeigen" (§ 9) „7 Tage Gewährleistung"
//    und jede Zahl irgendwo in der FAQ jede Ratenstufe.
//
// RUNDE 3 (dritter Gegenprüfer, 8 grüne Falschaussagen):
//  - Absätze für UNTERNEHMER („Wenn Sie Unternehmer im Sinne des § 14 BGB
//    sind …") belegen nichts auf einer Seite für Verbraucher; sonst trug
//    „Gewährleistungsfrist beträgt ein Jahr" (§ 9 (4)) „ein Jahr Gewährleistung".
//  - Ein Glied, das nur eine Euro-Schwelle nennt („ab 500 Euro und mehr …"),
//    gehört zum folgenden Glied: Schwelle und Ratenzahl bleiben ein Paar.
//  - Kernbegriff RÜCKNAHME (zurückgeben, testen, Rücknahme): „2 Jahre Rücknahme"
//    wird nicht mehr von der Gewährleistungsfrist getragen.
//  - „100 %" nur noch als „vollen Kaufpreis": die Klammer „(volle
//    Geld-zurück-Garantie)" allein trägt nicht, wenn davor „halben" stünde.
//  - Gleiche Dauer, andere Einheit gilt gleich: 2 Wochen = 14 Tage,
//    2 Jahre = 24 Monate (sonst wurde eine WAHRE Umformulierung rot).
//
// RUNDE 4 (vierter Gegenprüfer, 13 grüne Falschaussagen): zusammengesetzte
// Zahlwörter (fünfzehn, sechzig, vierundzwanzig); Stunden, Kalenderwochen und
// „Prozent" als Einheit; eine Zahl ohne bekannte Einheit passt nur zu einer
// Zahl ohne Einheit; die Namensregel gilt nur in der Quelle; „vollen
// Kaufpreis" trägt 100 % nicht neben einem anderen Anteil; der EU-Hinweis
// zählt nur mit seinen Zeichenketten, nicht mit Code-Konstanten.
// RUNDE 5 (fünfter Gegenprüfer): hundert/tausend; Rücknahme auch als
// zurückzugeben/zurückschicken/nehmen … zurück/Retoure; die FAQ-Frage gibt
// ihren Kern auf der Quellseite nur an Glieder ohne eigenen Kern; jeder Absatz,
// der Unternehmer nennt, fällt; „§ 7 Abs. 1" und „Ziffer 7" sind AGB-Verweise;
// „vgl."/„s." beenden keinen Satz; „1.000,00".
// GRENZE (benannt, nicht regelbar ohne Sprachverständnis): Verneinung („nicht
// in bis zu 24"), richtig zitierte Zahl in falschem Zusammenhang („bis zu
// zwei Jahre länger"), Kernbegriff jenseits eines Kommas.
const ZAHLWORT = [
  ['vierzehn', '14'],
  ['dreißig', '30'],
  ['zwanzig', '20'],
  ['zwölf', '12'],
  ['zehn', '10'],
  ['zwei', '2'],
  ['drei', '3'],
  ['vier', '4'],
  ['sechs', '6'],
  ['sieben', '7'],
];
// Kurze Zahlwörter nur als ganzes Wort oder vor -tägig/-jährig („acht" ≠ „achten").
const ZAHLWORT_GANZ = [
  ['fünf', '5'],
  ['acht', '8'],
  ['neun', '9'],
  ['elf', '11'],
];
const ZEIT = 'jahr|monat|woche|werktag|kalendertag|tag';

/** Text ohne Auszeichnung, Zahlwörter als Ziffern, Tausenderpunkt weg. */
function normiere(t) {
  let s = String(t)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{' '\}/g, ' ')
    .replace(/€/g, ' euro')
    .replace(/&nbsp;| /g, ' ')
    .toLowerCase();
  // Runde 4: zusammengesetzte Zahlwörter zuerst („vierundzwanzig", „fünfzehn",
  // „sechzig"), sonst blieb „vierundzwanzig" eine 4 und „fünfzehn" gar keine Zahl.
  const EINER = {ein: 1, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6, sieben: 7, acht: 8, neun: 9};
  const ZEHNER = {zwanzig: 20, dreißig: 30, vierzig: 40, fünfzig: 50, sechzig: 60, siebzig: 70, achtzig: 80, neunzig: 90};
  const e = Object.keys(EINER).join('|');
  const z = Object.keys(ZEHNER).join('|');
  // Runde 5: „hundert", „achthundert", „fünftausend" (vorher keine Zahl, also ungeprüft).
  s = s.replace(new RegExp(`(^|[^a-zäöüß])(${e})?(hundert|tausend)`, 'g'), (_, a, x, y) =>
    `${a} ${(x ? EINER[x] : 1) * (y === 'hundert' ? 100 : 1000)} `,
  );
  s = s
    .replace(new RegExp(`(^|[^a-zäöüß])(${e})und(${z})`, 'g'), (_, a, x, y) => `${a} ${EINER[x] + ZEHNER[y]} `)
    .replace(/(^|[^a-zäöüß])(drei|vier|fünf|sech|sieb|acht|neun)zehn/g, (_, a, x) =>
      `${a} ${10 + {drei: 3, vier: 4, fünf: 5, sech: 6, sieb: 7, acht: 8, neun: 9}[x]} `)
    .replace(new RegExp(`(^|[^a-zäöüß])(${z})`, 'g'), (_, a, y) => `${a} ${ZEHNER[y]} `);
  for (const [wort, ziffer] of ZAHLWORT) {
    // Als Wortanfang: „vierzehntägiges", „zweijährige", „zwei Jahre".
    s = s.replace(new RegExp(`(^|[^a-zäöüß])${wort}`, 'g'), `$1 ${ziffer} `);
  }
  for (const [wort, ziffer] of ZAHLWORT_GANZ) {
    s = s.replace(
      new RegExp(`(^|[^a-zäöüß])${wort}(?=$|[^a-zäöüß]|tägig|jährig|wöchig|monatig)`, 'g'),
      `$1 ${ziffer} `,
    );
  }
  // „ein Jahr", „einen Monat", „einjährig": nur vor einer Zeiteinheit eine Zahl.
  s = s
    .replace(new RegExp(`(^|[^a-zäöüß])ein(e|en|em|er|es)?\\s+(?=${ZEIT})`, 'g'), '$1 1 ')
    .replace(/(^|[^a-zäöüß])ein(?=tägig|jährig|wöchig|monatig)/g, '$1 1 ');
  // Bruchteile eines Jahres als Monate: „1/2 Jahr", „ein halbes Jahr" = 6 Monate (Runde 4).
  s = s
    .replace(/(^|[^a-zäöüß])(ein\s+)?halbes\s+(?=jahr)/g, '$1 1/2 ')
    .replace(/(?<![\d/])(\d+)\s*\/\s*(\d+)\s+jahr/g, (m, n, d) =>
      (12 * n) % d === 0 ? ` ${(12 * n) / d} monat` : m,
    );
  return s.replace(/(\d)\.(\d{3})\b/g, '$1$2').replace(/(\d),00\b/g, '$1'); // „1.000,00 Euro"
}

const EINHEIT = [
  [/^werktag/, 'werktag'],
  [/^stunde/, 'stunde'],
  [/^kalenderwoche/, 'woche'],
  [/^(kalendertag|tag|tägig)/, 'tag'],
  [/^(woche|wöchig)/, 'woche'],
  [/^(jahr|jährig)/, 'jahr'],
  [/^monat/, 'monat'],
  [/^euro/, 'euro'],
];
const MONATE =
  'januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember';

/** Gliederungsmarker und Daten tragen keine Frist: § 14, Abs. 1, Nr. 3, (2), 20. Juli. */
function ohneMarker(s) {
  return s
    .replace(/§§?\s*\d+[a-z]?/g, ' ')
    .replace(/(^|[^a-zäöüß])(abs|nr|art)\.\s*\d+/g, '$1 ')
    .replace(/\(\d+\)/g, ' ')
    .replace(new RegExp(`\\d+\\.\\s*(${MONATE})`, 'g'), ' ');
}

/** Die Zahlen einer Angabe als „Zahl Einheit" („20 tag", „100 %", „25 euro"), sonst nackt. */
function zahlen(t, schonNormiert = false) {
  const s = schonNormiert ? t : ohneMarker(normiere(t));
  const out = new Set();
  for (const m of s.matchAll(/(?<![\d/])(\d+)(?![\d/])\s*-?\s*(%|[a-zäöüß]+)?/g)) {
    if (m[2] === '%' || /^prozent/.test(m[2] || '')) {
      out.add(`${m[1]} %`);
      continue;
    }
    const e = m[2] && EINHEIT.find(([re]) => re.test(m[2]));
    out.add(e ? `${m[1]} ${e[1]}` : m[1]);
  }
  return [...out];
}

// Kernbegriffe: steht einer im Satzglied der Angabe, muss er im Satzglied der
// Quelle mitstehen. „verjährungsfrist" ist in § 9 das Wort für die Frist der
// Gewährleistung, „kaufpreis" das der Garantie.
const KERN = [
  ['gewährleistung', /gewährleist/, /gewährleist|verjährungsfrist/],
  ['widerruf', /widerruf/, /widerruf/],
  ['garantie', /garantie/, /garantie|kaufpreis/],
  ['raten', /(^|[^a-zäöüß])(monats)?raten|ratenzahlung/, /(^|[^a-zäöüß])(monats)?raten|ratenzahlung/],
  [
    'rücknahme',
    /rücknahme|rückgabe|zurück(zu)?(geb|send|schick|nehm)|rücksend|retour|nehm\S*\s.*zurück|(^|[^a-zäöüß])testen/,
    /rücknahme|rückgabe|zurück(zu)?(geb|send|schick|nehm)|rücksend|retour|nehm\S*\s.*zurück|(^|[^a-zäöüß])testen|kaufpreis\s+zurück/,
  ],
];

/** Satzglieder (Komma, Semikolon, Doppelpunkt, Satzende, „und"), normiert. */
function satzglieder(t, quelle = false) {
  const n = ohneMarker(normiere(t));
  // „20-tage-zufriedenheitsgarantie" ist in der QUELLE ein Name, keine Frist.
  // In der Angabe zählt „30-Tage-Rückgabe" dagegen als Zahl (Runde 4).
  return (quelle ? n.replace(/\d+\s*-\s*[a-zäöüß]+-[a-zäöüß-]+/g, ' ') : n)
    .split(/[,;:!?]|\.(?!\d)|\s(?:und|sowie|oder)\s/)
    .map((g) => g.trim())
    .filter(Boolean)
    .reduce((acc, g) => {
      // Ein Glied, dessen Zahlen nur Euro-Schwellen sind, gehört zum nächsten.
      const vorher = acc[acc.length - 1];
      if (vorher && vorher.offen) {
        acc[acc.length - 1] = {text: `${vorher.text} ${g}`, offen: false};
      } else acc.push({text: g, offen: false});
      const z = zahlen(acc[acc.length - 1].text, true);
      acc[acc.length - 1].offen = z.length > 0 && z.every((x) => x.endsWith(' euro'));
      return acc;
    }, [])
    .map((g) => g.text);
}

const kerneIn = (t) => KERN.filter(([, re]) => re.test(normiere(t))).map(([k]) => k);

/**
 * Je Satzglied der Angabe: seine Zahlen und Kernbegriffe. `frage` (bei FAQ-
 * Einträgen): ihr Kernbegriff gilt für jedes Glied der Antwort („Wie lange habe
 * ich Gewährleistung?" – „Ein Jahr ab Lieferung" ist eine Gewährleistungsfrist).
 */
function zahlgruppen(t, frage = '') {
  const ausFrage = kerneIn(frage);
  return satzglieder(t)
    .map((g) => ({
      glied: g,
      zahlen: zahlen(g, true),
      kerne: [...new Set([...kerneIn(g), ...ausFrage])],
    }))
    .filter((g) => g.zahlen.length);
}

/** Gleiche Dauer in einer Einheit: Wochen als Tage, Jahre als Monate. */
function kanon(z) {
  const [n, e] = z.split(' ');
  if (e === 'woche') return `${Number(n) * 7} tag`;
  if (e === 'jahr') return `${Number(n) * 12} monat`;
  return z;
}

/** Passt eine Zahl der Angabe zu den Zahlen eines Satzglieds der Quelle? */
function passt(zahl, glied) {
  // „vollen Kaufpreis" trägt 100 % nur, wenn im Glied kein anderer Anteil
  // steht („50 % vom vollen Kaufpreis", Runde 4).
  if (
    zahl === '100 %' &&
    /(^|[^a-zäöüß])vollen\s+kaufpreis/.test(glied) &&
    !zahlen(glied, true).some((x) => x.endsWith(' %') && x !== '100 %')
  )
    return true;
  const da = zahlen(glied, true);
  // Eine Zahl ohne bekannte Einheit passt nur zu einer Zahl ohne Einheit
  // (Runde 4: „20 Stunden" war nackt und passte zu „20 Tagen").
  if (!zahl.includes(' ')) return da.includes(zahl);
  return da.map(kanon).includes(kanon(zahl));
}

/**
 * Steht diese Zahlgruppe (alle Zahlen + Kernbegriffe) in EINEM Satzglied der
 * Quelle? `quelle` ist Text oder eine Liste {frage, text} (FAQ: die Frage gibt
 * ihren Kernbegriff an die Antwort weiter, wie bei der Angabe). AGB-Überschriften
 * geben NICHTS weiter: sonst wäre die Rügefrist in „§ 9 Gewährleistung" wieder
 * eine Gewährleistungsfrist.
 */
function gruppeSteht(gruppe, quelle) {
  const teile = Array.isArray(quelle) ? quelle : [{frage: '', text: quelle}];
  return teile.some(({frage, text}) =>
    satzglieder(text, true).some(
      (glied) =>
        gruppe.zahlen.every((z) => passt(z, glied)) &&
        gruppe.kerne.every(
          (k) =>
            KERN.find(([n]) => n === k)[2].test(glied) ||
            // Die Frage gibt ihren Kern nur an Glieder OHNE eigenen Kern weiter
            // („… zum gesetzlichen Widerrufsrecht von 14 Tagen" bleibt Widerruf, Runde 5).
            (kerneIn(frage).includes(k) && !KERN.some(([, , re]) => re.test(glied))),
        ),
    ),
  );
}

/** Steht die Zahl (allein) in der Quelle? Für die Positivkontrolle. */
function stehtIn(zahl, quelle) {
  return satzglieder(quelle, true).some((g) => passt(zahl, g));
}

/**
 * Sätze, die auf einen ANDEREN AGB-Paragrafen verweisen („nach § 7",
 * „(siehe § 7)"), fallen aus dem Abschnitt; Gesetzesverweise („§ 13 BGB",
 * „§ 438 Abs. 1 Nr. 3 BGB", „§§ 433 ff.") bleiben, sie sind kein AGB-Verweis.
 */
function ohneVerweise(text, eigenerParagraf) {
  // Gesetz = „§ N [Abs. N] [Nr. N] BGB|ff|…"; „§ 7 Abs. 1" ohne Gesetz ist ein AGB-Verweis,
  // ebenso „Ziffer 7" (Runde 5).
  const gesetz = '(?:\\s*abs\\.?\\s*\\d+)?(?:\\s*(?:s|satz)\\.?\\s*\\d+)?(?:\\s*nr\\.?\\s*\\d+)?\\s*(?:ff|bgb|egbgb|hgb|ustg|ao|pangv|ttdsg|dsgvo|odr)';
  const fremd = new RegExp(`(?:§|ziffer|ziff\\.)\\s*(\\d+)(?![\\d])(?!${gesetz})`, 'gi');
  return text
    .replace(/<[^>]+>/g, ' ')
    // Abkürzungen beenden keinen Satz: „vgl. § 7", „s. § 7", „i. S. d.".
    .replace(/(^|[^a-zäöüß])(vgl|ziff|bzw|ggf|ca|abs|nr|s|d|i)\.(?=\s)/gi, '$1$2')
    .split(/(?=\(\d+\))/)
    .filter((absatz) => !/unternehmer/i.test(absatz)) // Absatz für Unternehmer (jede Fassung, Runde 5)
    .join(' ')
    .split(/(?<=[.!?])\s+|(?=\(\d+\))/)
    .filter((satz) => ![...satz.matchAll(fremd)].some((m) => m[1] !== eigenerParagraf))
    .join(' ');
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
// JE ANGABE, nicht je Pfad (Runde 2): sonst konnte jede Angabe in diesen Pfad
// ausweichen und war ungeprüft (Garantie-Beleg auf die Versandrichtlinie).
// Seit 2026-11-17 leer: IM_PREIS:versand und FRAGEN:f-preis zitieren die
// FAQ-Versandantwort statt der Shopify-Versandrichtlinie (die trug weder
// Franken noch Tageskurs, WORTTREUE unten) und sind damit im Repo prüfbar.
const EXTERN = {};

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
    // Mit Punkt verbunden: Titel, Text, Frage und Antwort sind je eigene Sätze.
    const behauptung = [e.titel, e.text, e.q, e.a].filter(Boolean).join('. ');
    let {beleg, belegPfad} = e;
    if (mutante && erbe[`${wo}:${e.id}`]) ({beleg, belegPfad} = fristBeleg(erbe[`${wo}:${e.id}`]));
    liste.push({wo, id: e.id, behauptung, frage: e.q || '', beleg, belegPfad});
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
const FAQ_EINTRAEGE = FAQ_ALLE.map((f) => ({frage: f.q, text: `${f.q}. ${f.a}`}));
// Ohne Kommentare: gezählt wird der ausgelieferte Wortlaut, nicht die Begründung daneben.
// Nur die Zeichenketten der Datei (der ausgelieferte Wortlaut), nicht ihr Code:
// sonst belegten Konstanten wie `qr_mindestkante_mm = 20` „20 Stunden" (Runde 4).
const EU_HINWEIS = [
  ...ohneProsa(lies('../app/lib/eu-gewaehrleistungslabel.js')).matchAll(/'((?:[^'\\\n]|\\.)*)'/g),
]
  .map((m) => m[1])
  .join('');

/** Der Quelltext, den eine Quellzeile zitiert, oder null (nicht prüfbar). */
function quelleVon(a) {
  if (a.belegPfad === '/pages/agb') {
    const z = zitierteAbschnitte(a.beleg, AGB);
    return {
      art: 'agb',
      abschnitte: z.map((x) => x.titel),
      text: z.map((x) => ohneVerweise(x.text, x.paragraf)).join('\n'),
    };
  }
  if (a.belegPfad === '/pages/faq') return {art: 'faq', abschnitte: ['FAQ'], text: FAQ_EINTRAEGE};
  if (a.belegPfad === null && /2025\/1960|Gewährleistungshinweis/.test(a.beleg)) {
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
  assert.ok(stehtIn('14 tag', p7.text), '§ 7 nennt vierzehn Tage');
  assert.ok(!stehtIn('20 tag', p7.text), '§ 7 nennt die 20 Tage NICHT');
  assert.ok(stehtIn('20 tag', gar.text) && stehtIn('100 %', gar.text));
  // Die Fehlgriffe des Gegenprüfers (s03) sind keine Belege mehr:
  const p9 = AGB.find((a) => a.paragraf === '9');
  assert.ok(!stehtIn('14 tag', p9.text), '„§ 14 BGB" belegt keine 14 Tage');
  assert.ok(!stehtIn('100 %', AGB.find((a) => a.paragraf === '1').text), '„vollendet" ist keine Garantie');
  assert.ok(!stehtIn('100 %', AGB.find((a) => a.paragraf === '4').text), '„vollständig" ist keine Garantie');
  assert.ok(!stehtIn('2 jahr', gar.text), 'Absatz „(2)" belegt keine zwei Jahre');
  assert.deepEqual(zahlen('ab 1.000 Euro bis zu 24, Richtlinie (EU) 2025/1960'), ['1000 euro', '24']);
  assert.deepEqual(zahlen('100 % Geld-zurück-Garantie, 20 Tage, 20-tägige'), ['100 %', '20 tag']);
  assert.deepEqual(zahlen('(2) nach § 14 BGB, Abs. 1, am 20. Juli'), []);
  assert.ok(FAQ_TEXT.length > 1000 && EU_HINWEIS.length > 1000);
  // Runde 2 (zweiter Gegenprüfer):
  assert.deepEqual(zahlen('Ein Jahr ab Lieferung, einen Monat, einjährig'), ['1 jahr', '1 monat']);
  assert.deepEqual(zahlen('20 Werktage, drei Wochen, fünf Tage, achten'), ['20 werktag', '3 woche', '5 tag']);
  const garOhne = ohneVerweise(gar.text, gar.paragraf);
  assert.ok(!stehtIn('14 tag', garOhne), 'der Verweis „vierzehntägiges Widerrufsrecht nach § 7" belegt keine 14 Tage');
  assert.ok(stehtIn('20 tag', garOhne) && stehtIn('100 %', garOhne), 'die Garantie selbst bleibt belegt');
  assert.ok(
    !gruppeSteht({zahlen: ['7 tag'], kerne: ['gewährleistung']}, ohneVerweise(p9.text, '9')),
    'die Rügefrist „7 Tagen … anzuzeigen" ist keine Gewährleistungsfrist',
  );
  assert.ok(gruppeSteht({zahlen: ['2 jahr'], kerne: ['gewährleistung']}, ohneVerweise(p9.text, '9')));
  assert.ok(gruppeSteht({zahlen: ['500 euro', '12'], kerne: ['raten']}, FAQ_EINTRAEGE));
  assert.ok(!gruppeSteht({zahlen: ['500 euro', '24'], kerne: []}, FAQ_EINTRAEGE), 'Ratenstufen gehören paarweise zusammen');
  assert.ok(
    !gruppeSteht({zahlen: ['1 jahr'], kerne: ['gewährleistung']}, EU_HINWEIS),
    '„nicht weniger als ein Jahr" (Gebrauchtware) ist nicht unsere Gewährleistung',
  );
  assert.deepEqual(
    zahlgruppen('Ein Jahr ab Lieferung.', 'Wie lange habe ich Gewährleistung?').map((g) => g.kerne),
    [['gewährleistung']],
  );
  // Runde 3 (dritter Gegenprüfer):
  const p9ohne = ohneVerweise(p9.text, '9');
  assert.ok(!gruppeSteht({zahlen: ['1 jahr'], kerne: ['gewährleistung']}, p9ohne), 'Unternehmerfrist (§ 9 (4)) gilt nicht');
  assert.ok(!gruppeSteht({zahlen: ['2 jahr'], kerne: ['rücknahme']}, p9ohne), 'Gewährleistung ist keine Rücknahme');
  assert.deepEqual(satzglieder('ab 500 Euro und mehr sogar bis zu 24'), ['ab 500 euro mehr sogar bis zu 24']);
  assert.ok(!gruppeSteht({zahlen: ['500 euro', '24'], kerne: []}, FAQ_EINTRAEGE));
  assert.ok(!stehtIn('100 %', 'den halben Kaufpreis zurück (volle Geld-zurück-Garantie)'));
  assert.ok(stehtIn('2 woche', ohneVerweise(p7.text, '7')) && stehtIn('24 monat', EU_HINWEIS), 'gleiche Dauer, andere Einheit');
  // Runde 4 (vierter Gegenprüfer):
  assert.deepEqual(zahlen('vierundzwanzig, fünfzehn Tage, sechzig Tage, einundzwanzig Tage'), ['24', '15 tag', '60 tag', '21 tag']);
  assert.deepEqual(zahlen('20 Stunden, 20 Kalenderwochen, 3 Prozent'), ['20 stunde', '20 woche', '3 %']);
  assert.ok(!stehtIn('20 stunde', gar.text) && !stehtIn('20', gar.text), 'nackte oder fremde Einheit passt nicht zu 20 Tagen');
  assert.deepEqual(zahlen(satzglieder('Mit der 30-Tage-Rückgabe testen')[0], true), ['30 tag']);
  assert.ok(!stehtIn('100 %', 'erhalten 50 % vom vollen Kaufpreis zurück'));
  assert.deepEqual(zahlen('Mindestens 1/2 Jahr, ein halbes Jahr'), ['6 monat']);
  // Runde 5 (fünfter Gegenprüfer):
  assert.deepEqual(zahlen('Hundert Tage, ab achthundert Euro, ab fünftausend Euro, ab 1.000,00 Euro'), ['100 tag', '800 euro', '5000 euro', '1000 euro']);
  assert.deepEqual(zahlgruppen('Wir nehmen es 14 Tage lang zurück.').map((g) => g.kerne), [['rücknahme']]);
  assert.ok(!gruppeSteht({zahlen: ['14 tag'], kerne: ['rücknahme']}, ohneVerweise(p7.text, '7')), '§ 7 ist Widerruf, keine Rücknahme');
  assert.ok(!stehtIn('14 tag', ohneVerweise('(1) Zusätzlich (vgl. § 7 Abs. 1) gilt: 14 Tage Widerruf. (2) Sind Sie Unternehmer, gilt ein Jahr.', null)));
  assert.ok(!stehtIn('1 jahr', ohneVerweise('(1) Gut. (2) Gegenüber Unternehmern beträgt die Frist ein Jahr.', '9')));
  assert.ok(!/qr_mindestkante|25\.4/.test(EU_HINWEIS) && /mindestens zwei Jahren/.test(EU_HINWEIS));
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
      if (EXTERN[`${a.wo}:${a.id}`]?.pfad !== a.belegPfad) {
        befunde.push(
          `${a.wo}:${a.id} nennt ${zz.join(', ')}, Quelle „${a.beleg}" (${a.belegPfad}) ist im Repo nicht prüfbar und nicht in EXTERN`,
        );
      }
      continue;
    }
    for (const g of zahlgruppen(a.behauptung, a.frage)) {
      if (!gruppeSteht(g, q.text)) {
        const was = [...g.zahlen, ...g.kerne].join(' + ');
        befunde.push(
          `${a.wo}:${a.id} nennt „${was}" („${g.glied}"), die Quelle „${a.beleg}" (${q.abschnitte.join(' + ')}) nennt es nicht zusammen`,
        );
      }
    }
  }
  assert.deepEqual(befunde, []);
});

// WORTTREUE: jedes Zusagewort einer Angabe steht auch an der Stelle, die ihre
// Quellzeile zitiert. BELEGTREUE oben prüft nur Zahlen.
//
// ANLASS (Folgeauftrag 20261117-nog-quellzeilen-wortzusagen-original-
// seriennummer-versand aus s03): der K3-Gegenprüfer fand Quellen, die das Wort
// nicht tragen. „Seriennummer" stand nicht in den AGB, die die Gebrauchtfrage
// zitierte; die Quelle „Produktseiten … QiHome Air" nannte eine Seite ohne
// Seriennummer; „Franken zum Tageskurs" steht nicht in der Versandrichtlinie;
// „Kaufnachweis" zitierte /pages/support, das ihn nur über den Fußhinweis
// trägt. Live gemessen am 2026-11-17 (Sitemap: 112 Adressen, Startseite): die Wörter stehen
// in der FAQ-Versandantwort, im Gewährleistungshinweis und als Gravur auf den
// Produktfotos von QiOne® 2 Pro, QiBracelet® und Qi Alpha®.
//
// „Original(ware)" steht auf keiner Seite. Es ist in OFFEN namentlich geführt
// und an Christian gemeldet; die Zusage bleibt, bis er entscheidet. Eine NEUE
// Angabe mit einem Zusagewort ohne Quelle macht diesen Test rot.
const ZUSAGEWORTE = [
  ['seriennummer', /seriennummer/],
  // „Originalverpackung" (AGB § 7) ist keine Echtheitszusage.
  ['original', /(^|[^a-zäöüß])original(ware)?($|[^a-zäöüß])/],
  ['versandkostenfrei', /versandkostenfrei/],
  ['franken', /(^|[^a-zäöüß])franken/],
  ['tageskurs', /tageskurs/],
  ['zoll', /(^|[^a-zäöüß])zoll/],
  ['kaufnachweis', /kaufnachweis/],
  ['bestellnummer', /bestellnummer/],
];
const worteIn = (t) =>
  ZUSAGEWORTE.filter(([, re]) => re.test(String(t).toLowerCase())).map(([w]) => w);

// Produktfotos, deren Bildbeschreibung die Seriennummer nennt. Im Repo, wo der
// Alt-Text im Repo steht; sonst mit Grund (wie EXTERN). Eine Quellzeile, die
// ein Produkt ohne Eintrag nennt (QiHome Air), ist ein Befund.
const PRODUKTFOTO = [
  [/QiOne(®)?\s*2\s*Pro/, 'QiOne 2 Pro', {
    extern: ['seriennummer'],
    grund:
      'Bildbeschreibung des Shopify-Produktbilds QiOne3.webp („Rückseite des QiOne® 2 Pro ' +
      'mit Seriennummer und Gravur Made in Germany"), gepflegt im Shopify-Admin; das Foto ' +
      'zeigt „S/N: A - 00001", live gemessen 2026-11-17',
  }],
  [/QiBracelet/, 'QiBracelet', {datei: '../app/components/apple-seite/produkt-details/qibracelet-details-daten.js'}],
  [/Qi\s*Alpha/, 'Qi Alpha', {datei: '../app/components/campaign/the-alpha-shop-daten.js'}],
  [/QiHome(®)?\s*Air/, 'QiHome Air', null],
];
const altTexte = (datei) =>
  [...ohneProsa(lies(datei)).matchAll(/\balt[:=]\s*(['"])(.*?)\1/g)].map((m) => m[2]).join('\n');

// Gemeldet, nicht belegt. Je Angabe die Wörter, die (noch) keine Quelle haben.
const OFFEN = {
  'VORTEILE:original': {
    worte: ['original'],
    grund: 'steht auf keiner Seite von qiblanco.com, an Christian gemeldet (Job 20261117-nog-quellzeilen-wortzusagen-…)',
  },
  'FRAGE_GEBRAUCHT:f-gebraucht': {
    worte: ['original'],
    grund: 'wie VORTEILE:original („im Original"), an Christian gemeldet',
  },
};

/** Die Stücke, in denen die Wörter einer Angabe stehen dürfen: [{wo, text, worte?}]. */
function wortQuellen(a) {
  const stuecke = [];
  const q = quelleVon(a);
  if (q) {
    const texte = Array.isArray(q.text) ? q.text.map((t) => t.text) : [q.text];
    for (const t of texte) stuecke.push({wo: q.abschnitte.join(' + '), text: t});
  }
  const fehlt = [];
  if (/Produktfoto/.test(a.beleg)) {
    for (const [re, name, ort] of PRODUKTFOTO) {
      if (!re.test(a.beleg)) continue;
      if (!ort) fehlt.push(name);
      else if (ort.extern) stuecke.push({wo: `Foto ${name} (extern)`, text: '', worte: ort.extern});
      else stuecke.push({wo: `Foto ${name}`, text: altTexte(ort.datei)});
    }
  }
  return {stuecke, fehlt};
}

function wortBefunde(liste) {
  const befunde = [];
  for (const a of liste) {
    const worte = worteIn(a.behauptung);
    const {stuecke, fehlt} = wortQuellen(a);
    for (const name of fehlt) {
      befunde.push(`${a.wo}:${a.id} — Quelle „${a.beleg}" nennt ein Produktfoto von ${name}, dessen Bild keine Seriennummer trägt`);
    }
    for (const w of worte) {
      const belegt = stuecke.some((s) => (s.worte || worteIn(s.text)).includes(w));
      if (belegt || OFFEN[`${a.wo}:${a.id}`]?.worte.includes(w)) continue;
      befunde.push(
        `${a.wo}:${a.id} sagt „${w}" zu, die Quelle „${a.beleg}" (${a.belegPfad}) trägt das Wort nicht` +
          (stuecke.length ? ` (gelesen: ${stuecke.map((s) => s.wo).join(', ')})` : ' (im Repo nicht prüfbar)'),
      );
    }
  }
  return befunde;
}

test('WORTTREUE: die Leser finden die Zusagewörter (Positivkontrolle)', () => {
  // Ohne diese Kontrolle wäre ein kaputter Leser still grün.
  const versand = FAQ_EINTRAEGE.find((e) => /Was kostet der Versand/.test(e.frage));
  assert.ok(versand, 'FAQ-Versandantwort gefunden');
  assert.deepEqual(
    ['versandkostenfrei', 'franken', 'tageskurs', 'zoll'].filter((w) => !worteIn(versand.text).includes(w)),
    [],
  );
  assert.ok(worteIn(EU_HINWEIS).includes('kaufnachweis') && worteIn(EU_HINWEIS).includes('bestellnummer'));
  for (const [, name, ort] of PRODUKTFOTO) {
    if (ort?.datei) assert.ok(worteIn(altTexte(ort.datei)).includes('seriennummer'), `Foto ${name}`);
  }
  // Die Fehlgriffe, die der Gegenprüfer fand, sind keine Quellen:
  assert.ok(!AGB.some((x) => worteIn(x.text).includes('seriennummer')), 'die AGB nennen keine Seriennummer');
  assert.ok(!AGB.some((x) => worteIn(x.text).includes('original')), '„Originalverpackung" ist keine Echtheitszusage');
  assert.deepEqual(worteIn('Originalverpackung, im Original, Zollgebühren'), ['original', 'zoll']);
  // Die Prüfung hat Gegenstand: mindestens vier Angaben mit Zusagewort.
  assert.ok(angaben().filter((a) => worteIn(a.behauptung).length).length >= 4);
});

test('WORTTREUE: jedes Zusagewort steht in der zitierten Quelle', () => {
  assert.deepEqual(wortBefunde(angaben()), []);
});

test('WORTTREUE: die alten Quellzeilen wären rot (Rot vor Grün, im Test selbst)', () => {
  // Die Quellzeilen, wie die Seite sie bis 2026-11-17 zeigte. Fällt einer
  // dieser Befunde weg, ist die Prüfung blind geworden, nicht die Seite gut.
  const alt = {
    'IM_PREIS:versand': ['Versandrichtlinie', '/policies/shipping-policy'],
    'VORTEILE:kaufnachweis': ['unser Kundenservice', '/pages/support'],
    'VORTEILE:original': ['Produktseiten QiOne 2 Pro, QiBracelet, QiHome Air, Qi Alpha®', '/products/qione-2-pro'],
    'FRAGE_GEBRAUCHT:f-gebraucht': ['AGB: 20-Tage-Zufriedenheitsgarantie und Gewährleistung', '/pages/agb'],
  };
  const liste = angaben().map((a) => {
    const x = alt[`${a.wo}:${a.id}`];
    return x ? {...a, beleg: x[0], belegPfad: x[1]} : a;
  });
  const befunde = wortBefunde(liste).join('\n');
  assert.match(befunde, /IM_PREIS:versand sagt „franken" zu/);
  assert.match(befunde, /IM_PREIS:versand sagt „tageskurs" zu/);
  assert.match(befunde, /VORTEILE:kaufnachweis sagt „kaufnachweis" zu/);
  assert.match(befunde, /VORTEILE:original sagt „seriennummer" zu/);
  assert.match(befunde, /FRAGE_GEBRAUCHT:f-gebraucht sagt „seriennummer" zu/);
  // Und die QiHome-Air-Falle mit „Produktfoto" im Namen:
  const qihome = {...liste.find((a) => a.id === 'original'), beleg: 'Produktfotos von QiBracelet® und QiHome® Air'};
  assert.match(wortBefunde([qihome]).join('\n'), /Produktfoto von QiHome Air/);
});
