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
