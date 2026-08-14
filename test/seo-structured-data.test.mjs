// Hermetische Tests der Entitäts-Signale (Job 20260814-dach-lowhang-seo-
// autonom-umsetzen-prio1, Befundklasse A_entitaet des SEO-Wochenlaufs W33).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausführen: node --test test/seo-structured-data.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  ORGANISATION,
  ORG_ID,
  SITE_ID,
  MARKEN_PROFILE,
  WISSENSGRAPH_ENTITAETEN,
  organizationSchema,
  websiteSchema,
  entityGraph,
} from '../app/lib/entity-schema.js';

const IMPRESSUM = readFileSync(
  new URL('../app/routes/pages.impressum.jsx', import.meta.url),
  'utf8',
);
const STARTSEITE = readFileSync(
  new URL('../app/routes/_index.jsx', import.meta.url),
  'utf8',
);

// --- Der eigentliche Befund: es MUSS überhaupt ein Schema geben ------------
test('entityGraph liefert Organization UND WebSite', () => {
  const g = entityGraph();
  assert.equal(g['@context'], 'https://schema.org');
  assert.deepEqual(
    g['@graph'].map((k) => k['@type']),
    ['Organization', 'WebSite'],
  );
});

// --- Der stille Ausfall, den react-router einbaut ---------------------------
test('entityGraph ist serialisierbar (sonst rendert der Router STILL nichts)', () => {
  // react-router kapselt JSON.stringify des script:ld+json-Descriptors in
  // try/catch und gibt bei einem Fehler null zurück — der Block verschwindet
  // dann ohne jede Fehlermeldung. Genau diesen Fall fängt dieser Test.
  const roh = JSON.stringify(entityGraph({logoUrl: 'https://cdn.example/l.png'}));
  assert.equal(typeof roh, 'string');
  assert.equal(JSON.parse(roh)['@graph'].length, 2);
});

test('POSITIV-KONTROLLE: ein nicht serialisierbarer Wert würde auffallen', () => {
  // Ein Test, der nicht rot werden kann, belegt nichts. Beweis, dass die
  // Serialisierungs-Prüfung oben überhaupt etwas misst: ein Zyklus wirft.
  const zyklus = {}; zyklus.self = zyklus;
  assert.throws(() => JSON.stringify(zyklus), TypeError);
});

// --- Die Kopplung der Knoten ------------------------------------------------
test('WebSite.publisher zeigt auf die Organization-@id (sonst zwei Fremde)', () => {
  assert.equal(websiteSchema().publisher['@id'], ORG_ID);
  assert.equal(organizationSchema()['@id'], ORG_ID);
  assert.equal(websiteSchema()['@id'], SITE_ID);
  assert.notEqual(ORG_ID, SITE_ID);
});

// --- NAP-Gleichheit mit dem Impressum (der eigentliche Drift-Wächter) ------
test('Stammdaten stehen BYTE-GLEICH im Impressum', () => {
  // WARUM: eine vom Impressum abweichende Adresse im Markup ist für die
  // Entitätsauflösung schlechter als GAR KEIN Markup — zwei widersprechende
  // NAP-Angaben derselben Firma. Dieser Test ist die Kopplung, die verhindert,
  // dass eine Impressums-Änderung das Schema still falsch werden lässt.
  for (const feld of [
    'legalName',
    'streetAddress',
    'postalCode',
    'addressLocality',
    'vatID',
    'handelsregister',
  ]) {
    assert.ok(
      IMPRESSUM.includes(ORGANISATION[feld]),
      `ORGANISATION.${feld} = ${JSON.stringify(ORGANISATION[feld])} steht NICHT im Impressum`,
    );
  }
});

test('POSITIV-KONTROLLE: erfundene Stammdaten würden auffallen', () => {
  assert.equal(IMPRESSUM.includes('Musterstr. 1'), false);
});

// --- sameAs: die Unterlassung wurde BEWUSST aufgehoben ---------------------
// Der Vorgänger-Test hier hieß "KEIN sameAs ohne belegte Profil-URL" und
// verlangte ausdrücklich, die Unterlassung "bewusst aufzuheben statt
// versehentlich entstehen zu lassen". Genau das ist am 2026-08-14 geschehen
// (Auftrag S1): für drei Profile wurde KONTROLLE live nachgewiesen, nicht
// Namensähnlichkeit. Der Test wurde deshalb nicht gelöscht, sondern auf die
// Invariante umgehängt, die ihn überlebt — die Regel war nie "kein sameAs",
// sondern "kein UNBELEGTES sameAs".
test('sameAs führt NUR belegte Profile, und jedes trägt seinen Beleg', () => {
  const s = organizationSchema().sameAs;
  assert.ok(Array.isArray(s), 'sameAs fehlt oder ist kein Array');
  assert.ok(s.length >= 3, `Abnahmeziel >=3 belegte Profile, ist ${s.length}`);
  assert.equal(s.length, new Set(s).size, 'doppelte URL in sameAs');
  // Die Gleichheit bindet sameAs an die DEKLARIERTEN Listen: nichts darf im
  // Schema landen, was nicht durch eine der beiden Aufnahme-Regeln gegangen
  // ist. Bewusst KEIN gepinnter Zahlenwert — wächst eine Liste ehrlich, wächst
  // die Erwartung mit; wer dagegen am Schema vorbei einträgt, fällt auf.
  assert.equal(
    s.length,
    MARKEN_PROFILE.length + WISSENSGRAPH_ENTITAETEN.length,
    'sameAs enthält Einträge, die in keiner der beiden belegten Listen stehen',
  );
  for (const p of MARKEN_PROFILE) {
    assert.ok(
      p.url.startsWith('https://'),
      `Profil-URL nicht absolut/https: ${p.url}`,
    );
    // Ein Eintrag ohne Beleg ist genau die unbelegte Identitätsbehauptung,
    // gegen die die Liste gebaut ist. Länge statt bloßer Existenz, damit ein
    // leerer String nicht durchrutscht.
    assert.ok(
      typeof p.beleg === 'string' && p.beleg.trim().length > 30,
      `Profil ohne belastbaren Beleg: ${p.url}`,
    );
  }
});

test('sameAs enthält NICHT die ausdrücklich ausgeschlossenen Flächen', () => {
  // Trustpilot beansprucht Christian separat (Auftrags-Ausnahme 2026-08-14);
  // LinkedIn ist unbelegt (kein Credential, HTTP 999 = Messausfall, kein
  // Eigentumsnachweis). Beide wären geraten. Dieser Test ist der Riegel
  // dagegen, dass sie später "der Vollständigkeit halber" dazukommen.
  const s = organizationSchema().sameAs.join(' ').toLowerCase();
  for (const verboten of ['trustpilot', 'linkedin']) {
    assert.equal(
      s.includes(verboten),
      false,
      `${verboten} steht in sameAs, ist aber nicht als Eigentum belegt`,
    );
  }
});

// --- Wikidata-Rückverweis (Auftrag 20260814-wikidata-qid-backref) ----------
// Der Wikidata-Eintrag ist der Anker, an dem eine Suchmaschine die Marke als
// ENTITÄT auflöst. Er steht bewusst in einer EIGENEN Liste: MARKEN_PROFILE
// verlangt den Nachweis von Kontrolle, und den kann ein öffentlich
// editierbares Wiki baulich nie erfüllen. Die Regel hier ist der Rückverweis.
test('WISSENSGRAPH_ENTITAETEN trägt QID, absolute URL und Beleg', () => {
  assert.ok(
    WISSENSGRAPH_ENTITAETEN.length >= 1,
    'keine Wissensgraph-Entität deklariert',
  );
  for (const e of WISSENSGRAPH_ENTITAETEN) {
    assert.match(e.qid, /^Q\d+$/, `QID hat nicht die Form Q<zahl>: ${e.qid}`);
    assert.ok(
      e.url.startsWith('https://'),
      `Entitäts-URL nicht absolut/https: ${e.url}`,
    );
    // Der häufigste stille Fehler beim Nachtragen wäre eine URL, die auf ein
    // ANDERES Item zeigt als das qid-Feld daneben behauptet. Dann stimmte das
    // Markup nicht mit der Kennung überein, und beide sähen einzeln richtig aus.
    assert.ok(
      e.url.includes(e.qid),
      `URL ${e.url} zeigt nicht auf die daneben deklarierte QID ${e.qid}`,
    );
    assert.ok(
      typeof e.beleg === 'string' && e.beleg.trim().length > 30,
      `Wissensgraph-Eintrag ohne belastbaren Beleg: ${e.url}`,
    );
    // Der Beleg dieser Klasse IST der Rückverweis — steht er nicht drin, ist
    // die Aufnahme-Regel nicht angewandt, sondern nur behauptet worden.
    assert.ok(
      e.beleg.includes('P856'),
      `Beleg nennt P856 (official website) nicht — die Rückrichtung ist damit ` +
        `nicht dokumentiert: ${e.url}`,
    );
  }
});

test('sameAs führt den Wikidata-Rückverweis (der eigentliche Auftrag)', () => {
  const s = organizationSchema().sameAs;
  const wd = s.filter((u) => /wikidata\.org/.test(u));
  assert.equal(wd.length, 1, `erwartet genau 1 Wikidata-URL in sameAs, ist ${wd.length}`);
  assert.equal(wd[0], WISSENSGRAPH_ENTITAETEN[0].url);
});

test('POSITIV-KONTROLLE: eine QID/URL-Verwechslung würde auffallen', () => {
  // Beweis, dass die Kopplungs-Prüfung oben etwas misst und nicht nur
  // durchläuft: ein Eintrag, dessen URL auf ein anderes Item zeigt als sein
  // qid-Feld, muss die Bedingung verletzen.
  const falsch = {url: 'https://www.wikidata.org/wiki/Q1', qid: 'Q999'};
  assert.equal(falsch.url.includes(falsch.qid), false);
});

test('@id bleibt der lokale Organization-Anker, NICHT die Wikidata-URI', () => {
  // Der Auftrag stellte das Umhängen von @id auf die Wikidata-Entity-URI als
  // Option frei. Es wäre falsch: websiteSchema().publisher zeigt auf ORG_ID,
  // und ein Umhängen zerrisse genau die Kopplung, die den Graphen zu EINER
  // Entität macht. Wikidata gehört baulich in sameAs. Dieser Test hält die
  // Entscheidung fest, damit sie nicht versehentlich zurückgedreht wird.
  const org = organizationSchema();
  assert.equal(org['@id'], ORG_ID);
  assert.equal(/wikidata/.test(org['@id']), false);
  assert.equal(websiteSchema().publisher['@id'], ORG_ID);
});

test('identifier behält das Handelsregister UND trägt die Wikidata-Kennung', () => {
  // Die Erweiterung auf ein Array ist genau die Stelle, an der eine
  // Bestandsangabe still verschwinden könnte. Beide werden deshalb geprüft.
  const ids = organizationSchema().identifier;
  assert.ok(Array.isArray(ids), 'identifier ist kein Array');
  const hr = ids.find((i) => i.value === ORGANISATION.handelsregister);
  assert.ok(hr, 'Handelsregister-identifier ist verlorengegangen');
  assert.equal(hr.name, ORGANISATION.registergericht);
  const wd = ids.find((i) => i.propertyID === 'wikidata');
  assert.ok(wd, 'kein Wikidata-identifier');
  assert.equal(wd.value, WISSENSGRAPH_ENTITAETEN[0].qid);
  for (const i of ids) assert.equal(i['@type'], 'PropertyValue');
});

test('Startseite liefert og:image (der einzige fehlende OG-Wert am 14.08.)', () => {
  assert.match(STARTSEITE, /'og:image'/);
});

test('logo wird nur gesetzt, wenn wirklich eine URL vorliegt', () => {
  assert.equal('logo' in organizationSchema(), false);
  assert.equal('logo' in organizationSchema({logoUrl: ''}), false);
  const mit = organizationSchema({logoUrl: 'https://cdn.example/logo.png'});
  assert.equal(mit.logo['@type'], 'ImageObject');
  assert.equal(mit.logo.url, 'https://cdn.example/logo.png');
});

// --- Absolute URLs ----------------------------------------------------------
test('alle URLs im Graph sind absolut auf die Produktions-Domain', () => {
  for (const k of entityGraph()['@graph']) {
    if (k.url) {
      assert.ok(
        k.url.startsWith('https://qiblanco.com'),
        `${k['@type']}.url ist nicht absolut: ${k.url}`,
      );
    }
  }
});

// --- Der Startseiten-Vertrag ------------------------------------------------
test('Startseite liefert description, canonical, og und JSON-LD', () => {
  // Diese vier fehlten am 2026-08-14 alle gleichzeitig. Der Test bindet die
  // Route an ihren Zweck, damit ein späterer Umbau sie nicht still verliert.
  assert.match(STARTSEITE, /name: 'description'/);
  assert.match(STARTSEITE, /canonicalLink\('\/'\)/);
  assert.match(STARTSEITE, /'og:title'/);
  assert.match(STARTSEITE, /'script:ld\+json'/);
});

test('Beschreibung bleibt unter der Snippet-Kappung und ohne Heilaussage', () => {
  const m = STARTSEITE.match(/const BESCHREIBUNG =\s*([\s\S]*?);\n/);
  assert.ok(m, 'BESCHREIBUNG nicht gefunden');
  const text = m[1].replace(/\s*\+\s*/g, '').replace(/'/g, '').trim();
  assert.ok(text.length <= 160, `Beschreibung zu lang: ${text.length} Zeichen`);
  // Auftragsvorgabe „keine Heilversprechen": diese Verben behaupten Wirkung.
  for (const wort of ['heilt', 'heilen', 'lindert', 'schützt vor', 'wirkt gegen']) {
    assert.equal(
      text.toLowerCase().includes(wort),
      false,
      `Heil-/Wirkaussage in der Beschreibung: ${wort}`,
    );
  }
});
