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

// --- Bewusste Unterlassungen festhalten ------------------------------------
test('KEIN sameAs ohne belegte Profil-URL', () => {
  // Bewusste Unterlassung, kein Versäumnis: gemessen 2026-08-14 verlinkt die
  // Live-Startseite kein Marken-Profil (nur YouTube-Embeds einzelner Videos),
  // und es gibt keinen Wikidata-Eintrag. Ein geratenes Profil wäre eine
  // unbelegte Identitätsbehauptung. Dieser Test hält die Unterlassung fest,
  // damit sie bewusst aufgehoben wird statt versehentlich zu entstehen.
  assert.equal('sameAs' in organizationSchema(), false);
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
