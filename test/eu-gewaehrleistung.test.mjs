/**
 * Hermetischer Test der EU-Gewaehrleistungs-Mitteilung (node --test, ohne
 * Bundler) -- Hausmuster wie test/blog-seo.test.mjs.
 *
 * Die Sprachlogik wird als reine Funktion geprüft. Die Auflagen, die man
 * einer Datei NICHT ansieht, werden am Quelltext bewacht -- denn genau sie
 * gehen bei einer spaeteren, gut gemeinten Änderung als Erstes verloren:
 *
 *   1. Auf der Produktseite steht NUR der Text-Link. Wer die Grafik eines
 *      Tages "der Sichtbarkeit zuliebe" offen daneben stellt, baut genau die
 *      Abweichung zurück, die am 2026-08-25 ausdrücklich kassiert wurde.
 *   2. Die Grafik im Overlay muss GENÜGEND groß bleiben, damit der QR-Code
 *      scanbar ist. Seit sie nur noch dort vorkommt, hängt die Scanbarkeit
 *      allein an dieser einen Zahl -- und eine CSS-Zahl aendert man schnell.
 *   3. Die amtliche Grafik darf nicht nachbearbeitet werden.
 *   4. Der Rueckfall muss Englisch sein, nie "kein Bild".
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, sep} from 'node:path';

import {
  EU_SPRACHEN,
  LABEL_ASSETS,
  QR_DEFEKT,
  QR_GRENZFALL,
  QR_ANTEIL_DER_BILDBREITE_MIN,
  QR_MINDESTKANTE_MM,
  MM_JE_CSS_PIXEL,
  RUECKFALL_SPRACHE,
  labelFuerSprache,
  LABEL_ALT_DE,
  RECHTE_LINK,
} from '../app/lib/eu-gewaehrleistungslabel.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const KOMPONENTE = join(HIER, '..', 'app', 'components', 'EuGewaehrleistungsLabel.jsx');
const CSS = join(HIER, '..', 'app', 'styles', 'eu-gewaehrleistung.css');

/**
 * Kommentare entfernen, BEVOR am Quelltext gezaehlt oder gesucht wird.
 *
 * Ein frueherer Anlauf zaehlte 6 Overlays statt 1 -- die Treffer standen in
 * der Prosa. Ein Quelltext-Waechter, der den NAMEN einer Sache zählt statt
 * die Sache, misst die Dokumentation mit und schlaegt genau dann Alarm, wenn
 * jemand gut kommentiert. Das gilt hier doppelt: der Dateikopf ZITIERT die
 * alte, offene Darstellung, um zu erklären, warum es sie nicht mehr gibt.
 */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

function cssBlock(css, selektor) {
  const ab = css.indexOf(selektor + ' {');
  assert.ok(ab >= 0, `Regelblock fehlt: ${selektor}`);
  return css.slice(ab, css.indexOf('}', ab));
}

test('alle 24 EU-Amtssprachen haben ein Asset', () => {
  assert.equal(EU_SPRACHEN.length, 24, 'die EU hat 24 Amtssprachen');
  for (const iso of EU_SPRACHEN) {
    const a = LABEL_ASSETS[iso];
    assert.ok(a, `Sprachfassung fehlt: ${iso}`);
    assert.match(a.url, /^https:\/\/cdn\.shopify\.com\//, `${iso}: keine Shopify-URL`);
    assert.ok(a.breite > 0 && a.hoehe > 0, `${iso}: Masse fehlen`);
  }
});

test('Sprachaufloesung ist tolerant in der Eingabe, streng in der Ausgabe', () => {
  const faelle = [
    ['DE', 'de'],
    ['de', 'de'],
    ['de-AT', 'de'],   // Hydrogen-i18n kann eine Region mitliefern
    ['fr_FR', 'fr'],   // Unterstrich-Schreibweise aus Metafeldern
    ['SV', 'sv'],
  ];
  for (const [ein, soll] of faelle) {
    assert.equal(labelFuerSprache(ein).iso, soll, `${ein} -> ${soll}`);
  }
});

test('Rueckfall ist Englisch -- nie ein fehlendes Bild', () => {
  for (const ein of ['ja', 'zh-CN', 'tr', '', null, undefined, 'xx']) {
    const r = labelFuerSprache(ein);
    assert.equal(r.iso, RUECKFALL_SPRACHE, `${ein} muss auf Englisch fallen`);
    assert.equal(r.rueckfall, true);
    assert.ok(r.url, 'auch im Rueckfall muss eine URL herauskommen');
  }
});

/* ------------------------------------------------------------------ */
/* Der Kern der Korrektur vom 2026-08-25                               */
/* ------------------------------------------------------------------ */

test('auf der Produktseite steht NUR der Text-Link -- keine offene Grafik', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const ab = code.indexOf('export function EuGewaehrleistungsHinweis');
  assert.ok(ab >= 0, 'der Produktseiten-Baustein fehlt');
  const pdp = code.slice(ab);
  const pdpKoerper = pdp.slice(0, pdp.indexOf('export function EuGewaehrleistungsLink'));

  assert.doesNotMatch(
    pdpKoerper,
    /<img\b/,
    'Der Produktseiten-Baustein rendert wieder ein <img>. Bestellt ist: NUR ' +
      'der Text-Link im Seitenfluss, die Grafik ausschließlich im Overlay ' +
      'nach Klick.',
  );

  assert.match(
    pdpKoerper,
    /<EuLabelAusloeser\b/,
    'Der Produktseiten-Baustein rendert keinen Ausloeser mehr -- dann gibt ' +
      'es auf der Kaufflaeche gar keinen Hinweis.',
  );

  // Positiv-Kontrolle: ohne sie wäre ein leerer Ausschnitt (z.B. weil sich
  // ein Funktionsname geändert hat) ununterscheidbar von "sauber".
  assert.ok(
    pdpKoerper.includes('eu-gwl--pdp'),
    'Ausschnitt leer oder verrutscht -- die Aussage oben trägt dann nichts.',
  );
});

test('genau EIN <img> in der ganzen Komponente, und es sitzt im Overlay', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const bilder = code.match(/<img\b/g) ?? [];
  assert.equal(
    bilder.length,
    1,
    `es darf genau ein <img> geben (im Overlay), gefunden: ${bilder.length}`,
  );

  // Und es muss INNERHALB des Dialogs stehen, nicht irgendwo sonst.
  const dialogAb = code.indexOf('<dialog');
  const dialogBis = code.indexOf('</dialog>');
  assert.ok(dialogAb >= 0 && dialogBis > dialogAb, 'kein <dialog> gefunden');
  const imgPos = code.indexOf('<img');
  assert.ok(
    imgPos > dialogAb && imgPos < dialogBis,
    'Das einzige <img> steht ausserhalb des Overlays.',
  );
});

test('die CSS kennt keinen Regelblock mehr für eine offene Produktseiten-Grafik', () => {
  const css = readFileSync(CSS, 'utf8');
  const ohneCssKommentare = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    ohneCssKommentare,
    /\.eu-gwl__bild\s*\{/,
    'Ein .eu-gwl__bild-Block ist zurück -- das ist die Gestaltung für die ' +
      'offen sichtbare Produktseiten-Grafik, die es nicht mehr geben soll.',
  );
});

/* ------------------------------------------------------------------ */
/* Scanbarkeit hängt jetzt allein am Overlay                          */
/* ------------------------------------------------------------------ */

test('die Mindestbreite im Overlay hält den QR-Code über 2 x 2 cm', () => {
  const css = readFileSync(CSS, 'utf8');

  const m = css.match(/--eu-gwl-bild-mindestbreite:\s*(\d+(?:\.\d+)?)px/);
  assert.ok(
    m,
    'Die Mindestbreite steht nicht mehr in der CSS. Ohne sie schrumpft die ' +
      'Grafik auf schmalen Viewports mit -- und der QR-Code mit ihr.',
  );
  const mindestbreite = Number(m[1]);

  // Der Wert muss auch WIRKEN, nicht nur dastehen.
  const bild = cssBlock(css, '.eu-gwl-dialog__bild');
  assert.match(
    bild,
    /min-width:\s*var\(--eu-gwl-bild-mindestbreite/,
    '.eu-gwl-dialog__bild benutzt die Mindestbreite nicht -- die Zahl oben ' +
      'ist dann Dekoration.',
  );

  const qrKanteMm = mindestbreite * QR_ANTEIL_DER_BILDBREITE_MIN * MM_JE_CSS_PIXEL;
  assert.ok(
    qrKanteMm >= QR_MINDESTKANTE_MM,
    `Bei ${mindestbreite} px Mindestbreite misst der QR-Code in der ` +
      `schmalsten Sprachfassung nur ${qrKanteMm.toFixed(1)} mm; ` +
      `gefordert sind ${QR_MINDESTKANTE_MM} mm.`,
  );
});

test('der Ueberstand ist erreichbar -- die Buehne scrollt waagerecht', () => {
  const css = readFileSync(CSS, 'utf8');
  const buehne = cssBlock(css, '.eu-gwl-dialog__buehne');
  assert.match(
    buehne,
    /overflow-x:\s*auto/,
    'Ohne waagerechten Scroll ist die Grafik auf schmalen Viewports zwar ' +
      'groß genug, aber teilweise unerreichbar -- das wäre faktisch ein ' +
      'Beschnitt.',
  );

  // Das Bild muss auch tatsaechlich IN der Buehne hängen, sonst scrollt der
  // Dialog selbst und der Schließen-Knopf wandert mit aus dem Bild.
  //
  // Diese Prüfung war zuerst eine Naehe-Heuristik ("<img> steht innerhalb
  // der nächsten 400 Zeichen"). Ein Mutant, der die Buehne leer lässt und
  // das Bild direkt dahinter hängt, hat sie überlebt -- Naehe ist eben
  // keine Verschachtelung. Jetzt wird die Verschachtelung selbst geprüft.
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));
  const tag = code.match(/<div className="eu-gwl-dialog__buehne"([^>]*)>/);
  assert.ok(tag, 'die Buehne fehlt in der Komponente');
  assert.ok(
    !tag[1].trim().endsWith('/'),
    'Die Buehne ist selbstschliessend -- sie enthält gar nichts.',
  );

  const nachDemTag = code.slice(tag.index + tag[0].length);
  const zu = nachDemTag.indexOf('</div>');
  assert.ok(zu > 0, 'die Buehne wird nicht geschlossen');
  assert.match(
    nachDemTag.slice(0, zu),
    /<img\b/,
    'Das <img> steht nicht INNERHALB der Buehne -- dann scrollt der Dialog ' +
      'selbst und der Schließen-Knopf wandert seitlich aus dem Bild.',
  );
});

/* ------------------------------------------------------------------ */
/* Unveraendert gueltige Auflagen                                      */
/* ------------------------------------------------------------------ */

test('genau EIN Overlay je Seite', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));
  const dialoge = code.match(/<dialog\b/g) ?? [];
  assert.equal(dialoge.length, 1, 'es darf genau einen <dialog> geben');

  // Positiv-Kontrolle: ohne sie wäre eine 0 (z.B. weil das Strippen zu
  // gierig war) ununterscheidbar von "sauber genau einer".
  assert.ok(
    code.includes('EuLabelProvider'),
    'Kommentar-Strippen hat den Code mit entfernt -- die Zaehlung sagt nichts.',
  );
});

test('der Ausloeser ist ein echtes button-Element -- auf beiden Flaechen', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const ab = code.indexOf('function EuLabelAusloeser');
  assert.ok(ab >= 0, 'der gemeinsame Ausloeser fehlt');
  const ausloeser = code.slice(ab, ab + 600);
  assert.match(ausloeser, /<button\s+type="button"/, 'kein echtes button-Element');

  // Beide Flaechen müssen ihn auch benutzen -- sonst wäre der Test oben
  // eine Aussage über toten Code.
  for (const baustein of ['EuGewaehrleistungsHinweis', 'EuGewaehrleistungsLink']) {
    const von = code.indexOf(`export function ${baustein}`);
    assert.ok(von >= 0, `${baustein} fehlt`);
    assert.match(
      code.slice(von, von + 700),
      /<EuLabelAusloeser\b/,
      `${baustein} benutzt den gemeinsamen Ausloeser nicht`,
    );
  }
});

test('beide Flaechen sind im Markup unterscheidbar', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));
  for (const flaeche of ['pdp', 'footer']) {
    assert.ok(
      code.includes(`flaeche="${flaeche}"`),
      `Messmarke fehlt: ${flaeche}. Ohne sie lässt sich am Live-HTML nicht ` +
        `nachweisen, dass die Flaeche den Hinweis trägt.`,
    );
  }
});

test('die amtliche Grafik wird nicht nachbearbeitet (Anhang I Nr. 1 und 5)', () => {
  const css = readFileSync(CSS, 'utf8');
  const block = cssBlock(css, '.eu-gwl-dialog__bild');

  assert.match(block, /filter:\s*none/, 'filter muss ausdrücklich none sein');
  assert.match(block, /height:\s*auto/, 'height:auto hält das Seitenverhaeltnis');
  assert.match(block, /border-radius:\s*0/, 'Radius würde die Ecken beschneiden');
  assert.doesNotMatch(block, /object-fit:\s*cover/, 'cover beschneidet die Grafik');
  assert.doesNotMatch(block, /mix-blend-mode/, 'Blendmodus faerbt nach');
});

test('Alt-Text trägt die Substanz, nicht nur ein Etikett', () => {
  assert.ok(LABEL_ALT_DE.length > 400, 'Alt-Text ist zu kurz für den Inhalt der Grafik');
  for (const wort of ['zwei Jahren', 'Gewährleistung', 'Verkäufer']) {
    assert.ok(LABEL_ALT_DE.includes(wort), `Alt-Text nennt "${wort}" nicht`);
  }
});

test('der Rechte-Link zeigt auf das amtliche Portal', () => {
  assert.match(RECHTE_LINK, /^https:\/\/europa\.eu\/youreurope\//);
});

test('QR_DEFEKT und QR_GRENZFALL sind gemessene Listen, keine stillen Ausnahmen', () => {
  // Der Sinn dieses Tests: die Listen dürfen nur ISO-Codes enthalten, die es
  // auch gibt, und sie dürfen sich nicht überschneiden. Zwei leere Listen
  // sind der SOLL-Zustand nach dem PNG-Ersatz -- sie sollen dann gruen
  // bleiben, ohne dass jemand den Test anfasst.
  for (const [name, liste] of [['QR_DEFEKT', QR_DEFEKT], ['QR_GRENZFALL', QR_GRENZFALL]]) {
    for (const iso of liste) {
      assert.ok(EU_SPRACHEN.includes(iso), `unbekannter ISO-Code in ${name}: ${iso}`);
      assert.ok(LABEL_ASSETS[iso], `${name} nennt ${iso} ohne Asset`);
    }
  }

  const doppelt = QR_DEFEKT.filter((iso) => QR_GRENZFALL.includes(iso));
  assert.deepEqual(
    doppelt,
    [],
    `dieselbe Sprache steht in beiden Listen: ${doppelt.join(', ')} -- ` +
      `"gar nicht lesbar" und "nur mit Muehe lesbar" schließen sich aus.`,
  );

  assert.equal(labelFuerSprache('sv').qrDefekt, QR_DEFEKT.includes('sv'));
});

/* ------------------------------------------------------------------ *
 * MONTAGE-ORT (Elina EL-20260901-3fb38a2a, 2026-09-01)
 *
 * "der Overlay-Baustein und der Trigger-Link dürfen NICHT im globalen
 *  Seitengerüst oder in der Footer-Komponente liegen, sondern ausschließlich
 *  auf den betroffenen Produktseiten-Routen eingebunden werden, damit KEINE
 *  Änderung an einer überall mitlaufenden Komponente entsteht."
 *
 * Bis hierher konnte KEIN Test diese Auflage sehen: die Suite prüft die
 * Komponente und die CSS, nie den Ort, an dem sie hängt. Genau deshalb lief
 * die globale Fassung durch 15 gruene Tests.
 *
 * Die Trägerliste wird BERECHNET, nicht aufgeschrieben: wer morgen eine neue
 * Produktseite anlegt, die den Hinweis rendert, fällt hier auf -- eine
 * abgetippte Liste würde ihn stillschweigend auslassen.
 * ------------------------------------------------------------------ */

const APP = join(HIER, '..', 'app');

function jsxDateien(verzeichnis) {
  const raus = [];
  for (const e of readdirSync(verzeichnis, {withFileTypes: true})) {
    const p = join(verzeichnis, e.name);
    if (e.isDirectory()) raus.push(...jsxDateien(p));
    else if (/\.(jsx|js)$/.test(e.name)) raus.push(p);
  }
  return raus;
}

/** Routen, die den Hinweis über IRGENDEINE Verschachtelungstiefe rendern. */
function traegerRouten() {
  const dateien = new Map();
  for (const p of jsxDateien(APP)) dateien.set(p, readFileSync(p, 'utf8'));

  // Komponentenname -> definierende Datei
  const definiert = new Map();
  for (const [p, src] of dateien) {
    for (const m of src.matchAll(
      /export\s+(?:default\s+)?(?:function|const)\s+([A-Z]\w*)/g,
    )) {
      if (!definiert.has(m[1])) definiert.set(m[1], new Set());
      definiert.get(m[1]).add(p);
    }
  }

  const traeger = new Set(
    [...dateien].filter(([, s]) => s.includes('<EuGewaehrleistungsHinweis')).map(([p]) => p),
  );
  for (let wieder = true; wieder; ) {
    wieder = false;
    const komponenten = new Set(
      [...definiert].filter(([, ps]) => [...ps].some((p) => traeger.has(p))).map(([k]) => k),
    );
    for (const [p, src] of dateien) {
      if (traeger.has(p)) continue;
      for (const m of src.matchAll(/<([A-Z]\w*)/g)) {
        if (komponenten.has(m[1])) {
          traeger.add(p);
          wieder = true;
          break;
        }
      }
    }
  }
  return [...traeger].filter((p) => p.includes(`${sep}routes${sep}`)).sort();
}

test('jede Route, die den Hinweis trägt, bindet auch das Overlay', () => {
  const routen = traegerRouten();

  // Rot-vor-Gruen-Schutz: fällt die Berechnung auf 0 zurück (Umbenennung,
  // Umbau der Ordnerstruktur), wäre dieser Test leer wahr und könnte nie
  // wieder ausschlagen.
  assert.ok(
    routen.length >= 8,
    `nur ${routen.length} Träger-Routen gefunden -- die Berechnung greift ` +
      `nicht mehr; der Test wäre ohne diese Schranke leer wahr.`,
  );

  const ohne = routen.filter((p) => !readFileSync(p, 'utf8').includes('withEuLabel'));
  assert.deepEqual(
    ohne,
    [],
    `Diese Routen rendern die Pflichtmitteilung, binden aber kein Overlay. ` +
      `Ohne Kontext rendert EuGewaehrleistungsHinweis STILL null -- die ` +
      `Mitteilung fällt aus, ohne dass etwas kaputt aussieht:\n  ` +
      ohne.join('\n  '),
  );
});

test('das Label hängt NICHT im globalen Seitengerüst', () => {
  for (const datei of ['root.jsx', join('components', 'PageLayout.jsx'), join('components', 'Footer.jsx')]) {
    const p = join(APP, datei);
    const code = ohneKommentare(readFileSync(p, 'utf8'));
    for (const baustein of ['EuLabelProvider', 'withEuLabel', 'EuGewaehrleistungsLink']) {
      assert.ok(
        !code.includes(baustein),
        `${datei} montiert ${baustein}. Das ist eine überall mitlaufende ` +
          `Komponente -- Elina EL-20260901-3fb38a2a schließt genau das aus.`,
      );
    }
  }
});

test('der Footer-Baustein ist zurückgestellt, nicht heimlich wieder montiert', () => {
  // Elina: Footer-Teil "jetzt bewusst weglassen und für spaeter
  // zurückstellen". Der Baustein DARF also existieren -- er darf nur
  // nirgends gerendert werden.
  const code = readFileSync(KOMPONENTE, 'utf8');
  assert.ok(
    code.includes('export function EuGewaehrleistungsLink'),
    'der zurückgestellte Footer-Baustein wurde geloescht statt geparkt',
  );

  const montiert = jsxDateien(APP)
    .filter((p) => p !== KOMPONENTE)
    .filter((p) => ohneKommentare(readFileSync(p, 'utf8')).includes('<EuGewaehrleistungsLink'));
  assert.deepEqual(montiert, [], `Footer-Baustein ist wieder montiert in:\n  ${montiert.join('\n  ')}`);
});
