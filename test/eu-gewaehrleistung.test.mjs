/**
 * Hermetischer Test der EU-Gewaehrleistungs-Mitteilung (node --test, ohne
 * Bundler) -- Hausmuster wie test/blog-seo.test.mjs.
 *
 * Die Sprachlogik wird als reine Funktion geprueft. Die Auflagen, die man
 * einer Datei NICHT ansieht, werden am Quelltext bewacht -- denn genau sie
 * gehen bei einer spaeteren, gut gemeinten Aenderung als Erstes verloren:
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
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

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
  // ein Funktionsname geaendert hat) ununterscheidbar von "sauber".
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
  // das Bild direkt dahinter hängt, hat sie ueberlebt -- Naehe ist eben
  // keine Verschachtelung. Jetzt wird die Verschachtelung selbst geprueft.
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
  // Der Sinn dieses Tests: die Listen duerfen nur ISO-Codes enthalten, die es
  // auch gibt, und sie duerfen sich nicht ueberschneiden. Zwei leere Listen
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

/* ---------------------------------------------------------------------------
 * MONTAGE-ORT (Elina EL-20260901-3fb38a2a, gebaut 2026-09-06).
 *
 * Die Mitteilung darf NICHT mehr im globalen Seitengeruest und nicht in der
 * Footer-Komponente haengen, sondern ausschliesslich dort, wo ein Produkt
 * gekauft werden kann. Diese drei Waechter halten den Zuschnitt fest.
 *
 * WARUM HIER NICHT GESTRIPPT WIRD (Lehre aus der Vorrunde, teuer bezahlt):
 * `ohneKommentare()` entfernt an app/root.jsx rund 14 kB und damit auch
 * Code-Zeilen. Eine ABWESENHEITS-Zusage auf vorbehandeltem Text kann
 * strukturell nie ausschlagen -- sie waere fuer immer gruen. Positiv-Zusagen
 * duerfen strippen, Negativ-Zusagen nie.
 *
 * Gemessen wird deshalb die JSX-VERWENDUNG ('<EuLabelProvider') statt des
 * blossen Namens: der Name steht bewusst noch in den erklaerenden
 * Kommentaren beider Dateien, und ein Waechter, der ihn verbietet, wuerde
 * die Begruendung seiner eigenen Regel loeschen lassen.
 * ------------------------------------------------------------------------ */

const ROOT = join(HIER, '..', 'app', 'root.jsx');
const FOOTER = join(HIER, '..', 'app', 'components', 'Footer.jsx');

test('das Label haengt NICHT im globalen Seitengeruest', () => {
  const roh = readFileSync(ROOT, 'utf8');

  assert.equal(
    roh.includes('<EuLabelProvider'),
    false,
    'app/root.jsx montiert den Provider wieder global (Elina EL-20260901-3fb38a2a verbietet das)',
  );
  assert.match(
    roh,
    /<PageLayout\s/,
    'Positiv-Kontrolle: <PageLayout> fehlt -- die Datei wurde nicht gelesen wie erwartet, die Abwesenheit oben sagt dann nichts',
  );
});

test('der Footer-Baustein ist zurueckgestellt, nicht heimlich wieder montiert', () => {
  const roh = readFileSync(FOOTER, 'utf8');

  assert.equal(
    roh.includes('<EuGewaehrleistungsLink'),
    false,
    'Footer.jsx montiert Punkt 4 wieder (Elina: "bewusst weglassen und fuer spaeter zurueckstellen")',
  );
  assert.match(
    roh,
    /<PaymentIcons\s*\/>/,
    'Positiv-Kontrolle: der Nachbar-Baustein <PaymentIcons /> fehlt -- die Abwesenheit oben sagt dann nichts',
  );
});

test('beide oeffentlichen Bausteine bringen ihr Overlay SELBST mit', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  // Das ist der Kern des Zuschnitts. Frueher hing GENAU EIN Provider im
  // Seitengeruest; faellt der weg, ohne dass die Bausteine ihn selbst
  // mitbringen, liefert `EuGewaehrleistungsHinweis` STILL `null` -- die
  // Seite antwortet weiter HTTP 200, sieht vollstaendig aus, und die
  // gesetzliche Pflichtmitteilung fehlt. Erreichbarkeit ist nicht Inhalt.
  for (const [name, marke] of [
    ['EuGewaehrleistungsHinweis', '<EuLabelHinweisFlaeche'],
    ['EuGewaehrleistungsLink', '<EuLabelAusloeser'],
  ]) {
    const ab = code.indexOf(`export function ${name}(`);
    assert.ok(ab >= 0, `${name} fehlt`);
    const koerper = code.slice(ab, ab + 500);

    assert.match(
      koerper,
      /<EuLabelProvider>/,
      `${name} montiert keinen eigenen EuLabelProvider -- ohne Kontext rendert die Pflichtmitteilung still nichts bzw. wirft`,
    );
    assert.ok(
      koerper.includes(marke),
      `${name} rendert seinen Inhalt (${marke}) nicht mehr -- der Provider waere dann leer`,
    );
  }

  // Positiv-Kontrolle gegen zu gieriges Strippen (Vorrunde: 24229 -> 9406 B).
  assert.ok(
    code.includes('export function EuLabelProvider'),
    'Kommentar-Strippen hat den Code mit entfernt -- die Zusagen oben sagen nichts',
  );
});
