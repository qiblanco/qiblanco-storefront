/**
 * LEXIKON — der Vertrag zwischen Daten, Routen und strukturierten Daten.
 *
 * WOGEGEN DIESER TEST GEBAUT IST: der STILLE Verlust. Ein Eintrag, der aus
 * app/data/lexikon.js verschwindet, nimmt seine Seite mit — und weil der Hub
 * seine Liste aus denselben Daten baut, sieht die Live-Probe danach eine
 * kleinere, in sich stimmige Welt und bleibt gruen. Genauso still ist der
 * Ausschluss aus dem Schema: `hubSchema` filtert Eintraege, die ihr
 * Deny-Muster nicht in ihrer Grenze einfangen, und liefert dann einfach ein
 * kuerzeres JSON-LD. Die Seite bliebe sichtbar und würde nur für Maschinen
 * aermer, ohne eine einzige Fehlermeldung.
 *
 * KEINE GEPINNTE ZAHL. Jeder Sollwert hier kommt aus `LEXIKON.length`.
 * Waechst das Lexikon, waechst der Sollwert mit; ein Verify-Vertrag, der eine
 * wachsende Zahl festschreibt, ist rot-by-construction beim nächsten Eintrag.
 *
 * ROT VOR GRUEN: die Arme `deny-netz greift` und `eintrag ohne grenze` fahren
 * den Ausschluss mit einer eigens gebauten Attrappe wirklich vor. Ein Gate,
 * das nie ausgeschlagen hat, ist unbewiesen — und dieses hier ist an genau
 * einer Stelle MILDER als das FAQ-Netz, aus dem es stammt.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';

import {LEXIKON, QUELLEN, eintragFuer, quellenFuer, zielName} from '../app/data/lexikon.js';
import {
  hubSchema,
  eintragSchema,
  istSchemaSicher,
  ungedeckteMuster,
} from '../app/lib/lexikon-schema.js';

const WURZEL = path.resolve(import.meta.dirname, '..');
const DATUM = {datePublished: '2026-09-15T00:00:00+02:00', dateModified: '2026-09-15T00:00:00+02:00'};

test('jeder Eintrag trägt die fünf Pflichtteile und seine Grenze', () => {
  assert.ok(LEXIKON.length > 0, 'LEXIKON ist leer');
  for (const e of LEXIKON) {
    assert.ok(e.slug && e.begriff, `Eintrag ohne slug/begriff: ${JSON.stringify(e).slice(0, 80)}`);
    assert.equal(e.pfad, `/pages/${e.slug}`, `${e.slug}: pfad passt nicht zum slug`);
    assert.ok(e.definition?.trim(), `${e.slug}: keine Definition`);
    assert.ok(e.gebrauch?.length, `${e.slug}: kein Gebrauch`);
    assert.ok(e.physik?.length, `${e.slug}: keine Physik`);
    assert.ok(e.uebertragung_satz?.trim(), `${e.slug}: keine Übertragung`);
    // Die Grenze ist der Wirkmechanismus dieser Flaeche, nicht ein Feld.
    assert.ok(e.grenze?.trim(), `${e.slug}: KEINE GRENZE — ein Eintrag ohne sie wäre Werbung`);
  }
});

test('jeder Eintrag hat eine eigene Route, und der Hub auch', () => {
  for (const e of LEXIKON) {
    const datei = path.join(WURZEL, 'app', 'routes', `pages.${e.slug}.jsx`);
    assert.ok(fs.existsSync(datei), `${e.slug}: Routendatei fehlt (${datei})`);
  }
  assert.ok(fs.existsSync(path.join(WURZEL, 'app', 'routes', 'pages.lexikon.jsx')));
});

test('jede Eintragsseite rendert den Grenz-Marker data-geo="grenze"', () => {
  // Der Marker ist ein VERTRAG mit der Abnahme, kein Klassenname: er steht in
  // der gemeinsamen Komponente, und genau dort wird er geprueft. Ein Umbau des
  // Stils darf ihn nicht versehentlich mitnehmen.
  const quelle = fs.readFileSync(
    path.join(WURZEL, 'app', 'components', 'campaign', 'LexikonEintrag.jsx'),
    'utf8',
  );
  assert.match(quelle, /data-geo="grenze"/);
  assert.match(quelle, /\{eintrag\.grenze\}/, 'der Grenz-Satz selbst muss gerendert werden');
});

test('jede zitierte Quelle ist aufloesbar', () => {
  for (const e of LEXIKON) {
    for (const k of e.quellen || []) {
      assert.ok(QUELLEN[k], `${e.slug}: Quellenschluessel "${k}" steht nicht in QUELLEN`);
    }
    assert.equal(quellenFuer(e).length, (e.quellen || []).length, `${e.slug}: Quelle verloren`);
  }
});

test('jeder Weiterlesen-Verweis hat eine belegte Beschriftung', () => {
  for (const e of LEXIKON) {
    for (const p of e.verlinkt_auf || []) {
      assert.ok(
        zielName(p),
        `${e.slug}: Verweis ${p} hat keine Beschriftung — er faellt still aus der Seite`,
      );
      if (p.startsWith('/pages/lexikon-')) {
        assert.ok(eintragFuer(p.slice('/pages/'.length)), `${e.slug}: Verweis ${p} zeigt ins Leere`);
      }
    }
  }
});

test('das Hub-Schema verliert keinen Eintrag (Sollwert aus den Daten)', () => {
  const graph = hubSchema(LEXIKON, DATUM)['@graph'];
  const set = graph.find((n) => n['@type'] === 'DefinedTermSet');
  const liste = graph.find((n) => n['@type'] === 'ItemList');
  assert.equal(
    set.hasDefinedTerm.length,
    LEXIKON.length,
    'DefinedTerm-Knoten fehlen — ein Eintrag ist still aus dem Schema gefallen: ' +
      JSON.stringify(LEXIKON.filter((e) => !istSchemaSicher(e)).map((e) => [e.slug, ungedeckteMuster(e)])),
  );
  assert.equal(liste.numberOfItems, LEXIKON.length);
  for (const e of LEXIKON) {
    assert.ok(eintragSchema(e, DATUM), `${e.slug}: kein Eintrags-Schema`);
  }
});

test('jede DefinedTerm-Beschreibung trägt ihre Grenze mit', () => {
  // Ein Antwortsystem uebernimmt oft genau dieses eine Feld. Stuende die
  // Grenze nur daneben, könnte die Behauptung ohne ihre Reichweite zitiert
  // werden — also genau das, was dieses Lexikon verhindern soll.
  const set = hubSchema(LEXIKON, DATUM)['@graph'].find((n) => n['@type'] === 'DefinedTermSet');
  for (const t of set.hasDefinedTerm) {
    const e = LEXIKON.find((x) => x.begriff === t.name);
    assert.ok(t.description.includes(e.grenze.replace(/\s+/g, ' ').trim()));
  }
});

test('ROT-ARM: ein ungedecktes Deny-Muster schließt den Eintrag aus', () => {
  // Attrappe, hermetisch: sie nennt ein Muster des geerbten Netzes im
  // Anspruchstext und schweigt in ihrer Grenze dazu.
  const attrappe = {
    slug: 'attrappe-ungedeckt',
    begriff: 'Attrappe',
    definition: 'Dieses Mittel wirkt immer und bei jedem.',
    gebrauch: ['-'],
    physik: ['-'],
    uebertragung_satz: '-',
    uebertragung_begruendung: [],
    grenze: 'Eine Grenze, die von der Behauptung nichts zuruecknimmt.',
    grenze_begruendung: [],
    quellen: [],
    verlinkt_auf: [],
    pfad: '/pages/attrappe-ungedeckt',
  };
  assert.deepEqual(ungedeckteMuster(attrappe), ['(wirken|wirkt)\\s+immer']);
  assert.equal(istSchemaSicher(attrappe), false);
  assert.equal(eintragSchema(attrappe, DATUM), null);
  const graph = hubSchema([...LEXIKON, attrappe], DATUM)['@graph'];
  assert.equal(
    graph.find((n) => n['@type'] === 'DefinedTermSet').hasDefinedTerm.length,
    LEXIKON.length,
  );
});

test('GRUEN-ARM: dasselbe Muster, in der Grenze eingefangen, geht durch', () => {
  // Die Gegenprobe zum Rot-Arm und der eigentliche Grund für die Schaerfung:
  // ein umstrittenes Wort DARF genannt werden, wenn im selben Eintrag steht,
  // wo es aufhört. Ohne diesen Arm wäre der Rot-Arm auch dann gruen, wenn
  // das Gate schlicht alles ausschliesst.
  const gedeckt = {
    slug: 'attrappe-gedeckt',
    begriff: 'Attrappe',
    definition: 'Manche sagen, das wirkt immer.',
    gebrauch: ['-'],
    physik: ['-'],
    uebertragung_satz: '-',
    uebertragung_begruendung: [],
    grenze: 'Nichts wirkt immer, und dieser Satz ist keine Ausnahme.',
    grenze_begruendung: [],
    quellen: [],
    verlinkt_auf: [],
    pfad: '/pages/attrappe-gedeckt',
  };
  assert.deepEqual(ungedeckteMuster(gedeckt), []);
  assert.equal(istSchemaSicher(gedeckt), true);
});

test('ROT-ARM: ein Eintrag ohne Grenze faellt aus dem Schema', () => {
  const ohne = {...LEXIKON[0], slug: 'attrappe-grenzenlos', grenze: '   '};
  assert.equal(istSchemaSicher(ohne), false);
  assert.match(ungedeckteMuster(ohne)[0], /kein Feld/);
});

test('ANKER-ARM: optionale H3-Anker sind eindeutig, und der Hub rendert sie als id', () => {
  // Seit 2026-11-10 (Job 20261019-ki-lernschleife-bau-dach-589a3d). Ein Anker
  // darf weder doppelt vorkommen noch mit einer li-id (slug) kollidieren: zwei
  // gleiche ids machen das Sprungziel unbestimmt.
  const anker = LEXIKON.filter((e) => e.anker !== undefined).map((e) => e.anker);
  for (const a of anker) assert.match(a, /^[a-z0-9-]+$/, `Anker unbrauchbar: ${a}`);
  const ids = [...anker, ...LEXIKON.map((e) => e.slug)];
  assert.equal(new Set(ids).size, ids.length, 'Ein Anker ist doppelt oder gleich einem slug');
  if (anker.length) {
    const hub = fs
      .readFileSync(path.join(WURZEL, 'app', 'components', 'campaign', 'LexikonHub.jsx'), 'utf8')
      .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ');
    assert.match(hub, /<h3 id=\{e\.anker \|\| undefined\}>/, 'der Hub rendert den Anker nicht an der H3');
  }
});

test('hexagonales Wasser: Karte auf die BESTEHENDE Seite, keine zweite Lexikon-Seite (KI-Lernschleife)', () => {
  // ki_lernschleife.py ziel sucht den Begriff wörtlich als Überschrift
  // (lexikon-eintrag:hexagonales-wasser). Die Karte zeigt auf die seit
  // 2026-10-09 bestehende Seite; eine eigene /pages/lexikon-hexagonales-wasser
  // wäre eine zweite, dünne Seite zum selben Begriff (GEO R9, Christian 25.09.).
  const e = LEXIKON.find((x) => x.begriff === 'hexagonales Wasser');
  assert.ok(e, 'Der Begriff „hexagonales Wasser" fehlt im Lexikon');
  assert.equal(e.pfad, '/pages/was-ist-hexagonales-wasser');
  assert.equal(e.anker, 'hexagonales-wasser');
  assert.ok(
    !fs.existsSync(path.join(WURZEL, 'app', 'routes', 'pages.lexikon-hexagonales-wasser.jsx')),
    'eine zweite Seite zum Begriff ist entstanden',
  );
  // Jeder Satz der Karte steht wortgleich auf der bestehenden Seite.
  const seite = fs
    .readFileSync(path.join(WURZEL, 'app', 'data', 'hexagonales-wasser-seite.js'), 'utf8')
    .replace(/\s*\{q:[a-z0-9-]+\}/g, '');
  const saetze = [e.definition, ...e.gebrauch, ...e.physik, e.uebertragung_satz,
    ...e.uebertragung_begruendung, e.grenze, ...e.grenze_begruendung]
    .flatMap((t) => t.split(/(?<=[.:])\s+/));
  // Die eine erklärte Abweichung (Kommentar am Eintrag): „das Modell von
  // Pollack" steht auf der Seite als Zwischenüberschrift, der Satz dort endet
  // mit „das Modell.". Geprüft wird beides, nicht erlassen.
  const ABWEICHUNG = [' das Modell von Pollack.', ' das Modell.'];
  assert.ok(seite.includes('das Modell von Pollack'), 'Bezug „das Modell von Pollack" fehlt auf der Seite');
  for (const satz of saetze) {
    const soll = satz.endsWith(ABWEICHUNG[0]) ? satz.slice(0, -ABWEICHUNG[0].length) + ABWEICHUNG[1] : satz;
    assert.ok(seite.includes(soll), `Satz steht nicht auf der bestehenden Seite: ${satz}`);
  }
});

test('ROLLE KURZDEFINITION: /pages/lexikon-elektrosmog führt die Definition vorn und gibt die Langfrage ab', () => {
  // Seit 2026-11-11 (SEO-Maßnahme M-SP-20261017-lexikon-elektrosmog). Die
  // Frage „Was ist Elektrosmog?" gehört /pages/was-ist-elektrosmog; diese
  // Seite trägt nur die Definition. Der Kopf kommt als Prop von der Route,
  // damit Hub, Schema und die übrigen Einträge unverändert bleiben.
  const route = fs.readFileSync(
    path.join(WURZEL, 'app', 'routes', 'pages.lexikon-elektrosmog.jsx'),
    'utf8',
  );
  assert.match(route, /const TITEL = `Elektrosmog Definition/, 'Titel führt „Elektrosmog Definition" nicht vorn');
  assert.match(route, /const BESCHREIBUNG = `Elektrosmog Definition/, 'Beschreibung führt den Begriff nicht vorn');
  assert.match(route, /pfad: '\/pages\/was-ist-elektrosmog'/, 'die Langfrage wird nicht abgegeben');
  assert.match(route, /text: 'Was ist Elektrosmog\?'/, 'Linktext ist nicht die Frage');
  assert.match(route, /ueberschrift=\{UEBERSCHRIFT\} frage=\{FRAGE\}/, 'Route reicht den Kopf nicht durch');
  assert.ok(
    fs.existsSync(path.join(WURZEL, 'app', 'routes', 'pages.was-ist-elektrosmog.jsx')) ||
      zielName('/pages/was-ist-elektrosmog'),
    'Ziel der Abgabe ist nicht belegt',
  );
  // Die Komponente faellt ohne Props auf den bisherigen Kopf zurück: alle
  // anderen Einträge rendern wie vorher.
  const komp = fs.readFileSync(
    path.join(WURZEL, 'app', 'components', 'campaign', 'LexikonEintrag.jsx'),
    'utf8',
  );
  assert.match(komp, /<h1>\{ueberschrift \|\| eintrag\.begriff\}<\/h1>/);
  assert.match(komp, /\{frage && \(/);
});
