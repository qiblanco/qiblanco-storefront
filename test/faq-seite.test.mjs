// Durchsetzer für /pages/faq (Grossjob-Segment s04, 2026-09-02).
// Bordmittel node:test/node:assert, KEIN Netz, kein neuer Runner.
// Ausführen: node --test test/faq-seite.test.mjs
//
// WARUM ES DIESEN TEST GIBT — die Fehlerklasse ist ein STILLER VERLUST
// --------------------------------------------------------------------
// app/lib/faq-schema.js filtert Q&A-Items mit Eso-/Wirkmechanismus-Vokabular
// aus dem FAQPage-JSON-LD heraus (zweistufig: explizites `flag` + Deny-Netz
// FORBIDDEN_PATTERNS). Der sichtbare Text bleibt dabei UNVERÄNDERT stehen.
// Das ist für den Bestand richtig gebaut — 21 der 40 Items in product-faqs.js
// warten so auf Christians freigegebene Umformulierung, ohne dass jemand den
// Shoptext anfassen muss.
//
// Für DIESE Seite dreht sich genau das ins Gegenteil: Schreibt jemand später
// „kohärente Wasserstruktur" in eine Antwort, dann
//   - bleibt die Antwort auf der Seite sichtbar,
//   - fällt sie STILL aus den strukturierten Daten,
//   - wird NICHTS rot, und
//   - die Seite verliert für Google genau den Teil, für den sie gebaut wurde.
// Ein Verlust, der nicht rot wird, ist die teuerste Sorte. Deshalb prüft
// Test 2 nicht „ist ein Schema da", sondern „ist JEDES Item drin".
//
// ROT VOR GRÜN: jeder der fünf Arme ist am 2026-09-02 einzeln rot nachgewiesen
// worden, indem der jeweilige Vertrag im Prüfling verletzt wurde (Deny-Wort in
// eine Antwort gesetzt / Siez-Form eingefügt / Fragezeichen entfernt /
// Quellenfeld geleert / Blockliste gekürzt). Die Nachweise stehen im RESULT
// des Segments.
//
// KEIN ZÄHLER IST GEPINNT. Nirgends steht „13 Fragen" oder „4 Blöcke": eine
// hinzugefügte Frage muss diese Zusagen richtig lassen, nicht rot machen
// (Regel: ein Verify-Vertrag pinnt nie einen wachsenden Zähler). Geprüft wird
// die EIGENSCHAFT jedes Items, nicht ihre Anzahl.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {FAQ_ALLE, FAQ_BLOECKE} from '../app/data/faq-seite.js';
import {
  buildFaqPageJsonLd,
  isSchemaSafe,
  FORBIDDEN_PATTERNS,
} from '../app/lib/faq-schema.js';

const ROUTE = readFileSync(
  new URL('../app/routes/pages.faq.jsx', import.meta.url),
  'utf8',
);

test('1 — jedes Item hat eine echte Frage, eine Antwort und eine benannte Quelle', () => {
  assert.ok(FAQ_ALLE.length > 0, 'FAQ_ALLE ist leer — die Seite hätte keinen Inhalt');

  for (const item of FAQ_ALLE) {
    assert.equal(typeof item.q, 'string', `Frage fehlt: ${JSON.stringify(item)}`);
    assert.equal(typeof item.a, 'string', `Antwort fehlt bei: ${item.q}`);

    // Eine Frage ohne Fragezeichen ist eine Überschrift, keine Frage — und im
    // FAQPage-Schema eine falsch ausgezeichnete Entität.
    assert.ok(item.q.trim().endsWith('?'), `Keine Frage (kein Fragezeichen): ${item.q}`);

    // Zu kurze Antworten sind der Normalfall des Verfalls: jemand kürzt, und
    // übrig bleibt ein Satz, der die Frage nicht beantwortet.
    assert.ok(item.a.length >= 120, `Antwort zu kurz (${item.a.length} Z.): ${item.q}`);

    // Der eigentliche Vertrag dieser Seite: KEINE Antwort ohne benannte
    // Herkunft. Eine erfundene Zahl ist genau das, was hier nicht passieren
    // darf, und ein leeres Quellenfeld ist ihr Einfallstor.
    assert.equal(typeof item.quelle, 'string', `Quellenangabe fehlt bei: ${item.q}`);
    assert.ok(item.quelle.length >= 40, `Quellenangabe zu dünn bei: ${item.q}`);
  }
});

test('2 — JEDES Item landet im FAQPage-Schema (kein stiller Verlust)', () => {
  // Erst je Item einzeln, damit die Fehlermeldung den Schuldigen NENNT statt
  // nur eine Zahl zu vergleichen.
  for (const item of FAQ_ALLE) {
    const treffer = FORBIDDEN_PATTERNS.filter((re) => re.test(`${item.q}\n${item.a}`));
    assert.deepEqual(
      treffer.map(String),
      [],
      `Deny-Netz-Treffer — dieses Item fiele STILL aus den strukturierten ` +
        `Daten: "${item.q}"`,
    );
    assert.equal(item.flag, undefined, `Diese Seite trägt keine geflaggten Items: ${item.q}`);
    assert.ok(isSchemaSafe(item), `Nicht schema-tauglich: ${item.q}`);
  }

  // Und dann die Gesamtaussage am echten Erzeugnis.
  const schema = buildFaqPageJsonLd(FAQ_ALLE, {inLanguage: 'de-DE'});
  assert.ok(schema, 'Kein FAQPage-Schema erzeugt');
  assert.equal(schema['@type'], 'FAQPage');
  assert.equal(schema.inLanguage, 'de-DE');
  assert.equal(
    schema.mainEntity.length,
    FAQ_ALLE.length,
    'Es sind Items auf dem Weg ins Schema verloren gegangen',
  );
  for (const frage of schema.mainEntity) {
    assert.equal(frage['@type'], 'Question');
    assert.equal(frage.acceptedAnswer['@type'], 'Answer');
    assert.ok(frage.acceptedAnswer.text.length > 0);
  }
});

test('3 — durchgehend geduzt, kein Anrede-Mix', () => {
  // Der Anrede-Mix Sie/Du war einer der Mängel, wegen derer Christian am
  // 2026-08-31 /pages/wirkt-das aus dem Index genommen hat. Teile dieser Seite
  // sind aus jener Seite übernommen, die stellenweise siezt — die Umstellung
  // ist genau die Arbeit, die dabei vergessen werden kann.
  //
  // DIESER ARM KONNTE ZUERST NICHT ROT WERDEN, und das ist der lehrreiche Teil.
  // Die erste Fassung trug einen negativen Lookbehind `(?<![.!?]\s)`, um ein
  // satzanfängliches „Sie" (Plural) nicht fälschlich zu melden. Im Rot-Nachweis
  // am 2026-09-02 wurde genau der wahrscheinlichste Verstoß eingebaut —
  // „Ja. Sie können die Technik …" — und die Probe blieb GRÜN: die Siez-Form
  // steht fast immer am Satzanfang, also exakt dort, wo die Ausnahme sie
  // unsichtbar machte. Eine Ausnahme, die den Hauptfall deckt, ist keine
  // Ausnahme, sondern eine Abschaltung.
  //
  // Jetzt wird jede großgeschriebene Höflichkeitsform gemeldet. Der Preis ist
  // bekannt und bewusst gewählt: ein Satz, der mit dem PLURAL „Sie" beginnt,
  // löst einen Fehlalarm aus und muss umformuliert werden. Auf einer Seite, die
  // durchgehend duzt, ist das ein zumutbarer Preis für einen Arm, der wirkt.
  // Der Prüftext ist bewusst nur `q` + `a` — das Quellenfeld zitiert Rechtstexte
  // wörtlich („Sie tragen die unmittelbaren Kosten der Rücksendung") und ist
  // kein Kundentext.
  const SIEZFORM = /\b(Sie|Ihnen|Ihre[rmns]?|Ihr)\b/;
  for (const item of FAQ_ALLE) {
    const treffer = `${item.q} ${item.a}`.match(SIEZFORM);
    assert.equal(treffer, null, `Siez-Form "${treffer?.[0]}" gefunden in: ${item.q}`);
  }
});

test('4 — die Reichweite wird als Radius genannt, nie in Quadratmetern', () => {
  // Wörtliche Auflage aus qi-salesbot chat-skills.ts (Skill QiHome, Prio 940):
  // „immer als Radius formulieren […], nie in Quadratmetern […]; sprich von
  // Einsatzbereich oder Auslegung, nie von 'Wirkungsradius' oder 'Wirkbereich'."
  // Der Kunde FRAGT in Quadratmetern — die Versuchung, ihm in seiner Einheit zu
  // antworten, ist genau der Verstoss.
  const VERBOTEN = [/Wirkungsradius/i, /Wirkbereich/i, /Wirkungsbereich/i];

  for (const item of FAQ_ALLE) {
    const hay = `${item.q} ${item.a}`;
    for (const re of VERBOTEN) {
      assert.ok(!re.test(hay), `Gesperrte Reichweiten-Vokabel ${re} in: ${item.q}`);
    }
    // Quadratmeter dürfen NUR in der Zurückweisung der alten Falschangabe
    // vorkommen. Wer sie als eigene Zusage einführt, fällt auf.
    if (/\bm²|\bQuadratmeter/i.test(hay)) {
      assert.ok(
        /falsch/i.test(hay),
        `Quadratmeter-Angabe ohne die Klarstellung, dass sie falsch war: ${item.q}`,
      );
    }
  }
});

test('5 — Struktur der Seite: Blöcke vollständig, Closer am Ende', () => {
  for (const block of FAQ_BLOECKE) {
    assert.ok(block.id && /^[a-z-]+$/.test(block.id), `Block-ID unbrauchbar: ${block.id}`);
    assert.ok(block.titel?.length > 0, `Block ohne Titel: ${block.id}`);
    assert.ok(block.intro?.length > 0, `Block ohne Intro: ${block.id}`);
    assert.ok(block.items?.length > 0, `Block ohne Fragen: ${block.id}`);
  }

  // Kanon-Reihenfolge: Neugier-Themen zuerst, Closer zuletzt („Beweis ist ein
  // Closer, kein Hook" — ihn nach vorne zu ziehen verschenkt ihn).
  const ids = FAQ_BLOECKE.map((b) => b.id);
  assert.equal(ids[0], 'alltag', 'Der Einstieg muss das Neugier-Thema sein');
  assert.equal(ids[ids.length - 1], 'kauf', 'Der Closer-Block gehört ans Ende');

  // FAQ_ALLE muss die Blöcke wirklich abbilden — sonst zeigt die Seite etwas
  // anderes an, als sie auszeichnet.
  assert.equal(FAQ_ALLE.length, FAQ_BLOECKE.reduce((n, b) => n + b.items.length, 0));
});

test('6 — die Route ist indexierbar gebaut: Canonical ja, noindex nein', () => {
  assert.match(ROUTE, /canonicalLink\(PFAD\)/, 'Canonical fehlt — die Seite soll gefunden werden');

  // GEMESSEN WIRD DER AUFRUF, NICHT DAS WORT — und das ist hier kein Detail,
  // sondern der Kern derselben Regel, die diese Seite überall befolgt: ein Zaun
  // wird an der EIGENSCHAFT gemessen, nicht an einem Literal. Die erste Fassung
  // dieses Arms suchte /noindex/i im Dateitext und schlug prompt an — auf den
  // KOMMENTAR der Route, der die Hausregel „entweder noindex oder canonical"
  // erklärt. Eine Wache, die die Dokumentation ihres eigenen Vertrags für einen
  // Verstoß hält, erzieht dazu, sie wegzuklicken. Geprüft wird deshalb der
  // wirksame Mechanismus: die Aufrufe noindexMeta()/noindexHeader().
  const CODE = ROUTE.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ');
  assert.ok(
    !/noindexMeta\s*\(|noindexHeader\s*\(/.test(CODE),
    'noindex auf einer Seite, die ausdrücklich zum Gefundenwerden gebaut ist',
  );
  // Hausregel: ENTWEDER noindex ODER canonical, nie beides.
  assert.match(ROUTE, /buildFaqPageJsonLd/, 'Das FAQPage-Schema wird nicht emittiert');
  assert.match(
    ROUTE,
    /from '~\/lib\/faq-schema'/,
    'Das Schema muss aus der Bestands-Fabrik kommen, nicht aus einer zweiten Serialisierung',
  );
});
