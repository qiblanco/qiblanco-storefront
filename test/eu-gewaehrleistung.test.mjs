/**
 * Hermetischer Test der EU-Gewaehrleistungs-Mitteilung (node --test, ohne
 * Bundler) -- Hausmuster wie test/blog-seo.test.mjs.
 *
 * Die Sprachlogik wird als reine Funktion geprueft. Die Auflagen, die man
 * einer Datei NICHT ansieht, werden am Quelltext bewacht -- denn genau sie
 * gehen bei einer spaeteren, gut gemeinten Aenderung als Erstes verloren:
 *
 *   1. Im Seitenfluss steht kein Bild, das die AMTLICHE Grafik ist. Wer sie
 *      eines Tages "der Sichtbarkeit zuliebe" offen daneben stellt, baut
 *      genau die Abweichung zurück, die am 2026-08-25 kassiert wurde. Seit
 *      dem 2026-09-08 steht dort ein Schmuck-Schild (Elina
 *      EL-20260908-d8349a01) — die Zusage misst deshalb die QUELLE je Bild,
 *      nicht mehr die Zahl der <img>.
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
  AUSLOESER_TEXT_FOOTER,
  AUSLOESER_TEXT_PDP,
  AUSLOESER_ZEICHEN,
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
 *
 * REIHENFOLGE KORRIGIERT AM 2026-09-08 -- das hier war ein stiller Frass.
 * Die erste Regel lautete `\{\s*\/\*[\s\S]*?\*\/\s*\}` und sollte den
 * JSX-Kommentar `{/* … *​/}` treffen. Sie traf aber auch die oeffnende
 * Klammer eines FUNKTIONSKOERPERS, wenn direkt darauf ein JSDoc folgt:
 *
 *     export default function Product() {
 *       /** @type {LoaderReturnData} *​/          <-- Start des Frasses
 *       …
 *       {/* … *​/}                                <-- Ende des Frasses
 *
 * Alles dazwischen verschwand. An app/routes/products.qione-2-pro.jsx
 * gemessen: 4,7 kB Quelltext weg, darunter der komplette Rumpf. Eine
 * ABWESENHEITS-Zusage auf so vorbehandeltem Text kann strukturell nie
 * ausschlagen -- sie wäre für immer gruen gewesen.
 *
 * Jetzt werden Blockkommentare ZUERST entfernt (nicht-gierig, also je
 * Kommentar einzeln); vom JSX-Kommentar bleibt danach die leere Klammer
 * `{}` uebrig, die zuletzt faellt. Dass dabei auch ein echtes leeres
 * Objektliteral verschwindet, ist für eine Textsuche folgenlos.
 */
function ohneKommentare(quelle) {
  return quelle
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\s*\}/g, '');
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

/*
 * DIESE ZUSAGE HAT AM 2026-09-08 IHRE MESSGROESSE GEWECHSELT, NICHT IHREN
 * SINN -- und der Unterschied ist wichtig genug, um ihn hier auszuschreiben.
 *
 * VORHER stand hier "der Produktseiten-Baustein enthält kein <img>". Das
 * war eine Naeherung: gemeint war immer die AMTLICHE GRAFIK (Anhang I,
 * QR-Code, Verordnungstext), gemessen wurde aber die Bauart <img>. Solange
 * es nur ein einziges Bild in der Datei gab, fielen beide zusammen.
 *
 * Elina EL-20260908-d8349a01 stellt ein Schmuck-Schild neben den Link. Damit
 * fallen sie auseinander, und die alte Zaehlung wäre ab jetzt in BEIDE
 * Richtungen falsch:
 *   - falsch ROT, weil ein harmloses Zeichen sie ausloest;
 *   - falsch GRUEN wäre sie geworden, wenn man sie einfach auf "zwei <img>"
 *     hochgezaehlt haette -- ein Tausch von AUSLOESER_ZEICHEN gegen
 *     LABEL_ASSETS.de haette die Zahl nicht verändert und die amtliche
 *     Grafik still offen in den Seitenfluss gestellt.
 * Gemessen wird deshalb jetzt die QUELLE je Bild, nicht ihre Anzahl.
 */
test('die AMTLICHE Grafik steht nur im Overlay -- nie offen im Seitenfluss', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const dialogAb = code.indexOf('<dialog');
  const dialogBis = code.indexOf('</dialog>');
  assert.ok(dialogAb >= 0 && dialogBis > dialogAb, 'kein <dialog> gefunden');

  // Jedes <img> der Datei mit seiner Quelle und seiner Lage einsammeln.
  const bilder = [];
  for (const m of code.matchAll(/<img\b[\s\S]*?\/>/g)) {
    bilder.push({
      markup: m[0],
      imOverlay: m.index > dialogAb && m.index < dialogBis,
    });
  }
  assert.ok(bilder.length >= 1, 'kein einziges <img> in der Komponente');

  const amtliche = bilder.filter((b) => /src=\{label\.url\}/.test(b.markup));
  assert.equal(
    amtliche.length,
    1,
    `die amtliche Grafik muss genau EINMAL vorkommen, gefunden: ${amtliche.length}`,
  );
  assert.ok(
    amtliche[0].imOverlay,
    'Die amtliche Grafik steht ausserhalb des Overlays -- das ist genau die ' +
      'Abweichung, die am 2026-08-25 kassiert wurde.',
  );

  for (const b of bilder.filter((x) => !x.imOverlay)) {
    assert.match(
      b.markup,
      /src=\{quellen\.src\}/,
      'Ein Bild im Seitenfluss zieht seine Quelle nicht aus AUSLOESER_ZEICHEN. ' +
        'Erlaubt ist dort NUR das Schmuck-Schild -- kein LABEL_ASSETS-Bild, ' +
        'keine hart geschriebene CDN-URL.',
    );
    assert.match(
      b.markup,
      /alt=""/,
      'Das Zeichen im Seitenfluss trägt einen alt-Text. Es ist Schmuck neben ' +
        'einem Link, der dasselbe sagt -- ein alt-Text macht daraus eine ' +
        'zweite, konkurrierende Ansage.',
    );
  }
});

test('auf der Produktseite hängt der Ausloeser MIT Zeichen, im Footer OHNE', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const ab = code.indexOf('function EuLabelHinweisFlaeche');
  assert.ok(ab >= 0, 'der Produktseiten-Baustein fehlt');
  const pdpKoerper = code.slice(ab, code.indexOf('export function EuGewaehrleistungsLink'));

  assert.match(
    pdpKoerper,
    /<EuLabelAusloeser\b/,
    'Der Produktseiten-Baustein rendert keinen Ausloeser mehr -- dann gibt ' +
      'es auf der Kaufflaeche gar keinen Hinweis.',
  );
  assert.match(
    pdpKoerper,
    /zeichen=\{AUSLOESER_ZEICHEN\}/,
    'Das Zeichen fehlt auf der Produktseite (Elina EL-20260908-d8349a01).',
  );
  assert.match(
    pdpKoerper,
    /beschriftung=\{AUSLOESER_TEXT_PDP\}/,
    'Die Produktseite beschriftet den Ausloeser nicht mehr aus der Konstante ' +
      '-- dann laufen Text und Test auseinander.',
  );

  // Positiv-Kontrolle: ohne sie wäre ein leerer Ausschnitt (z.B. weil sich
  // ein Funktionsname geaendert hat) ununterscheidbar von "sauber".
  assert.ok(
    pdpKoerper.includes('eu-gwl--pdp'),
    'Ausschnitt leer oder verrutscht -- die Aussage oben trägt dann nichts.',
  );

  // Der Footer bleibt auf Anweisung unveraendert: kein Zeichen, kurzer Text.
  const footer = code.slice(code.indexOf('export function EuGewaehrleistungsLink'));
  assert.doesNotMatch(
    footer,
    /zeichen=/,
    'Der Footer hat ein Zeichen bekommen. Bestellt war ausdrücklich: ' +
      '"Footer-Version bleibt unveraendert".',
  );
  assert.match(
    footer,
    /beschriftung=\{AUSLOESER_TEXT_FOOTER\}/,
    'Der Footer beschriftet den Ausloeser nicht mehr aus seiner eigenen Konstante.',
  );
});

test('die beiden Beschriftungen sind wirklich verschieden -- und die richtige ist wo', () => {
  // Der Sinn: eine spaetere "Vereinheitlichung" würde beide Konstanten auf
  // denselben Wert ziehen und dabei genau die Unterscheidung loeschen, die
  // am 2026-09-08 bestellt wurde. Zwei gleiche Werte faellt sonst niemandem
  // auf -- die Seiten sehen beide vollstaendig aus.
  assert.equal(AUSLOESER_TEXT_PDP, 'Garantierte gesetzliche Gewährleistung');
  assert.equal(AUSLOESER_TEXT_FOOTER, 'Gesetzliche Gewährleistung');
  assert.notEqual(
    AUSLOESER_TEXT_PDP,
    AUSLOESER_TEXT_FOOTER,
    'Produktseite und Footer tragen wieder denselben Text -- eine der beiden ' +
      'Anweisungen ist damit still zurueckgenommen.',
  );
});

test('das Zeichen ist NICHT die amtliche Grafik -- und geht über die Bildleiter', () => {
  // Drei Eigenschaften, jede mit einem eigenen Schadensbild:
  //   1. eigene Quelle  -> sonst stuende die Mitteilung offen im Seitenfluss
  //   2. Masse gesetzt  -> sonst springt das Layout beim Nachladen (CLS)
  //   3. anzeigeBreite  -> ohne sie liefert bildQuellen die Masterdatei
  const alleLabelUrls = Object.values(LABEL_ASSETS).map((a) => a.url);
  assert.ok(
    !alleLabelUrls.includes(AUSLOESER_ZEICHEN.url),
    'Das Zeichen zeigt auf eine der 24 amtlichen Sprachfassungen.',
  );
  assert.match(AUSLOESER_ZEICHEN.url, /^https:\/\/cdn\.shopify\.com\//);
  assert.ok(
    AUSLOESER_ZEICHEN.breite > 0 && AUSLOESER_ZEICHEN.hoehe > 0,
    'ohne Masse rechnet der Browser kein Seitenverhaeltnis -- das Layout springt',
  );
  assert.ok(
    AUSLOESER_ZEICHEN.anzeigeBreite > 0 &&
      AUSLOESER_ZEICHEN.anzeigeBreite <= AUSLOESER_ZEICHEN.breite,
    'die Anzeigebreite muss gesetzt sein und darf die Masterbreite nicht ueberzeichnen',
  );

  // Und die Zahl muss zur Gestaltung passen: steht in der CSS eine andere
  // Breite, rechnet die srcset-Leiter an der Flaeche vorbei.
  const css = readFileSync(CSS, 'utf8');
  const block = cssBlock(css, '.eu-gwl__zeichen');
  const m = block.match(/width:\s*(\d+(?:\.\d+)?)px/);
  assert.ok(m, '.eu-gwl__zeichen setzt keine Breite in px -- die Leiter hängt in der Luft');
  assert.equal(
    Number(m[1]),
    AUSLOESER_ZEICHEN.anzeigeBreite,
    'CSS-Breite und AUSLOESER_ZEICHEN.anzeigeBreite sind auseinandergelaufen',
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
  for (const baustein of [
    'EuGewaehrleistungsHinweis',
    'EuGewaehrleistungsListenpunkt',
    'EuGewaehrleistungsLink',
  ]) {
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
 * Footer-Komponente hängen, sondern ausschließlich dort, wo ein Produkt
 * gekauft werden kann. Diese drei Waechter halten den Zuschnitt fest.
 *
 * WARUM HIER NICHT GESTRIPPT WIRD (Lehre aus der Vorrunde, teuer bezahlt):
 * `ohneKommentare()` entfernt an app/root.jsx rund 14 kB und damit auch
 * Code-Zeilen. Eine ABWESENHEITS-Zusage auf vorbehandeltem Text kann
 * strukturell nie ausschlagen -- sie wäre für immer gruen. Positiv-Zusagen
 * duerfen strippen, Negativ-Zusagen nie.
 *
 * Gemessen wird deshalb die JSX-VERWENDUNG ('<EuLabelProvider') statt des
 * blossen Namens: der Name steht bewusst noch in den erklaerenden
 * Kommentaren beider Dateien, und ein Waechter, der ihn verbietet, würde
 * die Begründung seiner eigenen Regel loeschen lassen.
 * ------------------------------------------------------------------------ */

const ROOT = join(HIER, '..', 'app', 'root.jsx');
const FOOTER = join(HIER, '..', 'app', 'components', 'Footer.jsx');

test('das Label hängt NICHT im globalen Seitengeruest', () => {
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

/*
 * ZURÜCKGENOMMEN am 2026-09-07 (Elina EL-20260907-cda3d376). Der Vorgänger
 * dieses Wächters hielt die Anweisung vom 2026-09-01 fest: "den Footer-Teil
 * bewusst weglassen und für später zurückstellen". Ihre Begründung war die
 * seitenweite Format-Prüfung, die "wegen fremder Bilder auf 5 anderen Seiten
 * rot" sei. Gemessen am 2026-09-07 trägt diese Begründung nicht: die
 * Bild-Befunde sind seit dem Regressions-Urteil (s05) durchgängig als
 * VORBESTEHEND erlassen und haben den Footer-Link nie blockiert -- er ging am
 * 2026-09-04 mit #301 an genau dieser Bildschuld vorbei live.
 *
 * Deshalb kehrt die Zusage hier ihre Richtung um: der Footer TRÄGT Punkt 4.
 * Die beiden Nachbar-Wächter (kein Provider im globalen Seitengerüst, der
 * Warenkorb montiert selbst) bleiben unverändert -- der Zuschnitt "jeder
 * Baustein bringt sein Overlay selbst mit" ist von der Rücknahme nicht
 * betroffen und bleibt scharf.
 */
test('der Footer trägt Punkt 4 (Gesetzliche Gewährleistung) wieder', () => {
  const roh = readFileSync(FOOTER, 'utf8');

  assert.match(
    roh,
    /<EuGewaehrleistungsLink\s*\/>/,
    'Footer.jsx montiert Punkt 4 nicht mehr -- die Pflichtmitteilung fällt auf jeder Seite weg, die keinen eigenen Träger hat',
  );
  assert.match(
    roh,
    /from '\.\/EuGewaehrleistungsLabel'/,
    'der Import fehlt -- der Baustein oben wäre dann undefiniert und die Seite bräche beim Rendern',
  );
  assert.match(
    roh,
    /<PaymentIcons\s*\/>/,
    'Positiv-Kontrolle: der Nachbar-Baustein <PaymentIcons /> fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

test('beide öffentlichen Bausteine bringen ihr Overlay SELBST mit', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  // Das ist der Kern des Zuschnitts. früher hing GENAU EIN Provider im
  // Seitengeruest; faellt der weg, ohne dass die Bausteine ihn selbst
  // mitbringen, liefert `EuGewaehrleistungsHinweis` STILL `null` -- die
  // Seite antwortet weiter HTTP 200, sieht vollstaendig aus, und die
  // gesetzliche Pflichtmitteilung fehlt. Erreichbarkeit ist nicht Inhalt.
  for (const [name, marke] of [
    ['EuGewaehrleistungsHinweis', '<EuLabelHinweisFlaeche'],
    ['EuGewaehrleistungsListenpunkt', '<EuLabelListenpunktFlaeche'],
    ['EuGewaehrleistungsLink', '<EuLabelAusloeser'],
  ]) {
    const ab = code.indexOf(`export function ${name}(`);
    assert.ok(ab >= 0, `${name} fehlt`);
    const Körper = code.slice(ab, ab + 500);

    assert.match(
      Körper,
      /<EuLabelProvider>/,
      `${name} montiert keinen eigenen EuLabelProvider -- ohne Kontext rendert die Pflichtmitteilung still nichts bzw. wirft`,
    );
    assert.ok(
      Körper.includes(marke),
      `${name} rendert seinen Inhalt (${marke}) nicht mehr -- der Provider wäre dann leer`,
    );
  }

  // Positiv-Kontrolle gegen zu gieriges Strippen (Vorrunde: 24229 -> 9406 B).
  assert.ok(
    code.includes('export function EuLabelProvider'),
    'Kommentar-Strippen hat den Code mit entfernt -- die Zusagen oben sagen nichts',
  );
});

/* ---------------------------------------------------------------------------
 * WARENKORB (Elina EL-20260907-14710d1d, gebaut 2026-09-07).
 *
 * DER DEFEKT, DEN DIESER WÄCHTER FESTHÄLT: /cart ist eine Kauffläche
 * (probe_live_pdp.py, ZUSATZ_PFADE), trug die Pflichtmitteilung aber nie
 * selbst — sie kam über den Footer-Link im globalen Seitengerüst. Als der
 * am 2026-09-06 zurückgestellt wurde, verlor /cart sie ERSATZLOS und STILL:
 * HTTP 200 blieb, 13 Produktseiten blieben grün, nur der Warenkorb war leer.
 * Kein Test hat das gesehen, weil die Deckung von /cart nirgends zugesagt
 * war — sie war ein Nebeneffekt eines Bausteins an ganz anderer Stelle.
 *
 * Deshalb steht die Zusage jetzt hier, an der Route, wo sie hingehört.
 * ------------------------------------------------------------------------ */

const CART_ROUTE = join(HIER, '..', 'app', 'routes', 'cart.jsx');

test('der Warenkorb montiert die Pflichtmitteilung selbst', () => {
  const code = ohneKommentare(readFileSync(CART_ROUTE, 'utf8'));

  assert.match(
    code,
    /<EuGewaehrleistungsHinweis\s*\/>/,
    '/cart rendert die Pflichtmitteilung nicht mehr -- die Kauffläche Warenkorb wäre wieder ohne Mitteilung, bei weiterhin HTTP 200',
  );
  assert.match(
    code,
    /import\s*\{\s*EuGewaehrleistungsHinweis\s*\}/,
    '/cart rendert die Mitteilung, importiert sie aber nicht -- das baut nicht',
  );

  // Positiv-Kontrolle gegen zu gieriges Strippen: bliebe von der Datei nur
  // Prosa übrig, wären die beiden Zusagen oben wertlos.
  assert.match(
    code,
    /<CartMain\s/,
    'Positiv-Kontrolle: <CartMain> fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

/* ---------------------------------------------------------------------------
 * DIE VERSCHIEBUNG (Elina EL-20260908-d8349a01, gebaut 2026-09-08).
 *
 * BESTELLT: auf der Produktseite faellt der Satz "Wirkt das ueberhaupt? …"
 * ersatzlos weg, und an genau seine Stelle rueckt der Gewaehrleistungs-
 * Trigger, der bisher weiter oben unter dem Kauf-Knopf hing.
 *
 * DIE GEFAHR, DIE DIESE DREI WAECHTER HALTEN, ist nicht die Verschiebung
 * selbst -- die sieht man auf der Seite. Es ist ihr Nebeneffekt: die Naht
 * unter dem Kauf-Knopf sitzt in ProductForm und trägt damit JEDE
 * Kaufflaeche, auch die Dutzenden ohne eigene Route-Datei (Catch-all
 * products.$handle). Wer sie dort herausnimmt statt sie für EINE Seite
 * abzuschalten, nimmt die gesetzliche Pflichtmitteilung still von allen
 * anderen -- bei weiterhin HTTP 200 und vollstaendig aussehender Seite.
 *
 * Der dritte Waechter (Durchreichung) ist der unscheinbarste und der
 * wichtigste: faellt die Prop in der Buy-Box weg, wird das `false` der Route
 * lautlos verschluckt und die Mitteilung steht ZWEIMAL auf der Seite. Auch
 * das sieht man an keinem Exit-Code.
 * ------------------------------------------------------------------------ */

const PDP_ROUTE = join(HIER, '..', 'app', 'routes', 'products.qione-2-pro.jsx');
const PRODUCT_FORM = join(HIER, '..', 'app', 'components', 'ProductForm.jsx');
const BUY_BOX = join(
  HIER, '..', 'app', 'components', 'product-pages', 'QiOneBuyBox.jsx',
);

test('die PDP montiert die Mitteilung selbst -- und der Zweifel-Satz ist weg', () => {
  const code = ohneKommentare(readFileSync(PDP_ROUTE, 'utf8'));

  // SEIT ELINA EL-20260909-395f848c IST DIE BAUFORM EINE ANDERE (Listenpunkt
  // statt Block), die Zusage aber dieselbe: die Route montiert die Mitteilung
  // SELBST. Nur der Name des Bausteins hat gewechselt -- wer hier den alten
  // erwartet, misst ab jetzt eine Bauform, die es nicht mehr gibt.
  assert.match(
    code,
    /<EuGewaehrleistungsListenpunkt\s*\/>/,
    '/products/qione-2-pro montiert die Mitteilung nicht selbst -- zusammen ' +
      'mit dem abgeschalteten Default unten faellt sie auf dieser Kaufflaeche ' +
      'ersatzlos weg.',
  );
  assert.match(
    code,
    /import\s*\{\s*EuGewaehrleistungsListenpunkt\s*\}/,
    'die Route rendert die Mitteilung, importiert sie aber nicht -- das baut nicht',
  );
  assert.match(
    code,
    /gewaehrleistungsHinweis=\{false\}/,
    'die Route montiert die Mitteilung selbst, schaltet den Default in ' +
      'ProductForm aber nicht ab -- sie stuende dann zweimal auf der Seite',
  );

  // Ersatzlos heißt ersatzlos: weder die Zeile noch ihr Stylesheet.
  assert.doesNotMatch(
    code,
    /<ZweifelBeleg\b/,
    'Die Zweifel-Zeile ist zurück. Bestellt war: ersatzlos vollstaendig ' +
      'entfernen, keine Ersatzformulierung.',
  );
  assert.doesNotMatch(
    code,
    /zweifel-beleg\.css/,
    'Das Stylesheet der entfernten Zeile wird noch geladen -- ein Abruf ohne ' +
      'Wirkung, der beim nächsten Leser wie ein Beleg für ihre Anwesenheit aussieht',
  );

  // Positiv-Kontrolle gegen zu gieriges Strippen: bliebe von der Datei nur
  // Prosa uebrig, wären die beiden Abwesenheits-Zusagen oben wertlos.
  assert.match(
    code,
    /<QiOneBuyBox\b/,
    'Positiv-Kontrolle: <QiOneBuyBox> fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

test('der Default in ProductForm trägt die Flaechen ohne eigene Nutzen-Liste', () => {
  // BIS ZUM 2026-09-09 HIESS DIESE ZUSAGE "JEDE ANDERE KAUFFLAECHE" -- das ist
  // seit Elina EL-20260909-8c4001d1 falsch: acht Kaufflaechen montieren die
  // Mitteilung inzwischen selbst. Gemessen hat der Test das nie; er misst den
  // DEFAULT, und der trägt weiterhin genau die Gruppe, um die es hier geht:
  // die Kaufflaechen OHNE eigene Nutzen-Liste, allen voran die vielen über
  // den Catch-all products.$handle. Ein Titel, der mehr verspricht als die
  // Zusage darunter hält, ist im nächsten Befund die falsche Faehrte.
  const code = ohneKommentare(readFileSync(PRODUCT_FORM, 'utf8'));

  assert.match(
    code,
    /gewaehrleistungsHinweis\s*=\s*true/,
    'Der Default in ProductForm ist nicht mehr true. Damit verlieren alle ' +
      'Kaufflaechen ohne eigene Route-Datei (Catch-all products.$handle) die ' +
      'Pflichtmitteilung -- still, bei weiterhin HTTP 200.',
  );
  assert.match(
    code,
    /gewaehrleistungsHinweis\s*\?\s*<EuGewaehrleistungsHinweis\s*\/>/,
    'ProductForm rendert die Mitteilung nicht mehr -- der Default oben wäre ' +
      'dann eine Prop ohne Wirkung',
  );

  assert.match(
    code,
    /<AddToCartButton/,
    'Positiv-Kontrolle: der Kauf-Knopf fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

test('die Buy-Box reicht den Schalter durch, statt ihn zu schlucken', () => {
  const code = ohneKommentare(readFileSync(BUY_BOX, 'utf8'));

  assert.match(
    code,
    /gewaehrleistungsHinweis\s*=\s*true/,
    'QiOneBuyBox kennt die Prop nicht mehr -- das `false` der PDP kommt nie an',
  );
  assert.match(
    code,
    /gewaehrleistungsHinweis=\{gewaehrleistungsHinweis\}/,
    'QiOneBuyBox nimmt die Prop entgegen, gibt sie aber nicht an ProductForm ' +
      'weiter. Das `false` der Route wird dann lautlos verschluckt und die ' +
      'Mitteilung steht ZWEIMAL auf der Seite.',
  );

  assert.match(
    code,
    /<ProductForm/,
    'Positiv-Kontrolle: <ProductForm> fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

/* ---------------------------------------------------------------------------
 * DER FÜNFTE LISTENPUNKT (Elina EL-20260909-395f848c, gebaut 2026-09-09).
 *
 * BESTELLT WAR EIN EINDRUCK: der Gewaehrleistungs-Hinweis soll "optisch wie
 * ein weiterer, fuenfter Punkt der bestehenden Icon-Liste wirken, nicht wie
 * ein separater Block darunter" -- gleicher Zeilenabstand, gleiche
 * Icon-Groesse, gleiche Schrift, und trotzdem ein erkennbarer Link.
 *
 * GEMESSEN WIRD DIE BAUFORM, NICHT DER EINDRUCK, und das ist Absicht: Abstand,
 * Schriftgroesse und Icon-Hoehe sind genau dann dauerhaft gleich, wenn sie
 * GEERBT sind (<li> in derselben <ul>). Ein Nachbau derselben Zahlen sieht am
 * Tag des Baus identisch aus und läuft danach still auseinander -- niemand
 * sieht es, weil die Seite vollstaendig aussieht. Die vier Waechter unten
 * halten deshalb die Vererbung fest, nicht die Zahlen.
 * ------------------------------------------------------------------------ */

const APP_CSS = join(HIER, '..', 'app', 'styles', 'app.css');
const RESET_CSS = join(HIER, '..', 'app', 'styles', 'reset.css');

/** CSS-Kommentare weg, BEVOR nach Regelbloecken gesucht wird. */
function ohneCssKommentare(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

test('der Gewaehrleistungs-Punkt hängt IN der Nutzen-Liste -- und sein Overlay mit ihm', () => {
  const code = ohneKommentare(readFileSync(KOMPONENTE, 'utf8'));

  const ab = code.indexOf('export function EuGewaehrleistungsListenpunkt');
  assert.ok(ab >= 0, 'die Listen-Bauform fehlt');
  const Körper = code.slice(ab, code.indexOf('function EuLabelListenpunktFlaeche'));

  const liAuf = Körper.indexOf('<li ');
  const liZu = Körper.indexOf('</li>');
  assert.ok(liAuf >= 0 && liZu > liAuf, 'die Bauform liefert kein <li>');

  // DER KERN: der Provider -- und mit ihm der <dialog> -- muss INNERHALB der
  // <li> liegen. Stuende er aussen, wäre der <dialog> ein direktes Kind der
  // <ul> und damit ungueltiges HTML: der Browser-Parser hebt ihn beim Einlesen
  // aus der Liste heraus, der Serverbau hat ihn drin, und React hydriert gegen
  // einen anderen Baum als es geschrieben hat. Das faellt in keinem Build auf,
  // sondern beim Kunden -- und dann ist die Pflichtmitteilung nicht zu öffnen.
  assert.match(
    Körper.slice(liAuf, liZu),
    /<EuLabelProvider>/,
    'Der Provider steht ausserhalb der <li>. Dann hängt der <dialog> als ' +
      'direktes Kind in der <ul> -- ungueltiges HTML und ein Hydrierungsbruch.',
  );

  // Die Liste muss den Punkt auch aufnehmen, und zwar INNERHALB ihrer <ul>.
  const liste = ohneKommentare(readFileSync(BUY_BOX, 'utf8'));
  const ulAuf = liste.indexOf('<ul>');
  const ulZu = liste.indexOf('</ul>');
  assert.ok(ulAuf >= 0 && ulZu > ulAuf, 'die Nutzen-Liste hat keine <ul> mehr');
  assert.match(
    liste.slice(ulAuf, ulZu),
    /\{zusatzPunkt\}/,
    'Der Slot steht nicht innerhalb der <ul>. Ausserhalb wäre der Punkt ' +
      'wieder ein Block neben der Liste -- genau der Zustand, der weg sollte.',
  );

  // Und die Route muss ihn benutzen -- sonst wäre alles oben toter Code.
  const route = ohneKommentare(readFileSync(PDP_ROUTE, 'utf8'));
  assert.match(
    route,
    /zusatzPunkt=\{<EuGewaehrleistungsListenpunkt \/>\}/,
    'Die Kaufseite hängt den Punkt nicht in die Liste.',
  );
});

test('der Listenpunkt ERBT Abstand und Schrift der Liste, statt sie nachzubauen', () => {
  const css = ohneCssKommentare(readFileSync(CSS, 'utf8'));

  // 1. Kein eigener Kasten. Ein `margin`/`padding` auf .eu-gwl--listenpunkt
  //    schlaegt `li { margin-bottom: 0.5rem }` aus reset.css (hoehere
  //    Spezifitaet) -- ausgerechnet den Zeilenabstand, der hergestellt werden
  //    soll. Ein "Reset" wäre hier also das Gegenteil eines Resets.
  for (const m of css.matchAll(/\.eu-gwl--listenpunkt\s*\{([^}]*)\}/g)) {
    assert.doesNotMatch(
      m[1],
      /(^|[\s;])(margin|padding)\s*:/,
      'Der Listenpunkt setzt einen eigenen Aussen-/Innenabstand und ' +
        'ueberschreibt damit den Zeilenabstand der Liste, den er teilen soll.',
    );
  }

  // 2. Schrift: geerbt, nicht neu gesetzt.
  //
  // DER SELEKTOR MUSS EIN KIND-SELEKTOR SEIN. In dieser Bauform liegt der
  // <dialog> INNERHALB der <li>, und im Overlay steht ein ZWEITER
  // .eu-gwl__link (der Verweis aufs amtliche Portal). Ein Nachfahren-
  // Selektor greift auf ihn mit durch und nimmt ihm Goldton und Fettung --
  // am Overlay sollte aber nichts geaendert werden. Gemessen am 2026-09-09.
  const link = css.match(/\.eu-gwl--listenpunkt > \.eu-gwl__link\s*\{([^}]*)\}/);
  assert.ok(
    link,
    'der Listenpunkt gestaltet seinen Link nicht als DIREKTES Kind -- ohne ' +
      '">" faerbt die Regel den Portal-Link im Overlay mit um.',
  );
  assert.match(
    link[1],
    /font-weight:\s*inherit/,
    'Der Link behaelt font-weight: 600 aus der Block-Bauform -- bestellt war ' +
      'das gleiche Schriftgewicht wie bei den vier Nachbarpunkten.',
  );
  assert.match(
    link[1],
    /color:\s*inherit/,
    'Der Link behaelt die Goldschrift der Block-Bauform statt der Listenfarbe.',
  );
  assert.doesNotMatch(
    link[1],
    /font-size:/,
    'Der Link setzt eine eigene Schriftgroesse. Sie muss aus der Liste kommen ' +
      '(p, li in reset.css), sonst ist sie ab der nächsten Aenderung dort ' +
      'eine andere als bei den vier Nachbarn.',
  );
});

test('der Listenpunkt bleibt als Link erkennbar -- Maus UND Tastatur', () => {
  const css = ohneCssKommentare(readFileSync(CSS, 'utf8'));

  // Er sieht jetzt aus wie Text. Ohne Zeiger-Zustand wäre nicht mehr zu
  // sehen, dass dahinter die Pflichtmitteilung liegt -- ausdrücklich
  // bestellt: "damit klar bleibt dass er anklickbar ist".
  const ab = css.indexOf('.eu-gwl--listenpunkt > .eu-gwl__link:hover');
  assert.ok(
    ab >= 0,
    'der Listenpunkt hat keinen Hover-Zustand als direktes Kind (siehe ' +
      'Kind-Selektor-Begründung im Test darueber)',
  );
  const selektor = css.slice(ab, css.indexOf('{', ab));
  const regel = css.slice(css.indexOf('{', ab), css.indexOf('}', ab));

  assert.match(regel, /text-decoration:\s*underline/, 'Hover unterstreicht nicht');
  assert.match(regel, /color:/, 'Hover aendert die Farbe nicht');
  assert.match(
    selektor,
    /:focus-visible/,
    'Nur die Maus bekommt den Hinweis. Wer mit der Tastatur navigiert, sieht ' +
      'denselben Link dann als blossen Text.',
  );
});

test('das Overlay hängt seine Schrift nicht an den Ort, an dem es montiert ist', () => {
  const css = ohneCssKommentare(readFileSync(CSS, 'utf8'));
  const block = css.slice(
    css.indexOf('.eu-gwl-dialog {'),
    css.indexOf('}', css.indexOf('.eu-gwl-dialog {')),
  );

  // In der Listen-Bauform liegt der <dialog> INNERHALB der <li> (er muss
  // dort liegen, sonst ist die <ul> ungueltig) und erbt damit deren
  // 1.2rem/1.4 -- auf jeder anderen Kaufflaeche erbt er 1rem/normal vom
  // <body>. Sichtbar ist das heute nicht: jeder Texttraeger im Overlay setzt
  // seine Groesse selbst. Genau deshalb steht die Zusage hier -- ein
  // Unterschied, den man nicht sieht, wird beim nächsten Zusatz im Overlay
  // zu einem, den man sieht, und dann sucht ihn niemand an der Stelle, an
  // der das Fenster HÄNGT.
  assert.match(
    block,
    /font-size:\s*1rem/,
    'Das Overlay setzt seine Schriftgroesse nicht selbst. Es erbt sie dann ' +
      'von seinem Montageort -- und der ist seit dem 2026-09-09 nicht mehr ' +
      'auf allen Kaufflaechen derselbe.',
  );
  assert.match(
    block,
    /line-height:\s*normal/,
    'Das Overlay setzt seine Zeilenhoehe nicht selbst -- gleiche Begründung ' +
      'wie bei der Schriftgroesse; halb gesetzt ist hier schlechter als gar ' +
      'nicht, weil es wie geloest aussieht.',
  );
});

test('das Zeichen im Listenpunkt ist so groß wie die Nachbar-Icons', () => {
  const appCss = ohneCssKommentare(readFileSync(APP_CSS, 'utf8'));

  // 1. EIN Abstand für alle fünf Icons -- als gemeinsame Regel, nicht als
  //    zweite Zahl daneben, die beim nächsten Mal nur halb nachgezogen wird.
  assert.match(
    appCss,
    /\.BenefitList svg,\s*\.BenefitList \.eu-gwl__zeichen\s*\{[^}]*margin-right:/,
    'Der Icon-Abstand der Liste gilt nicht für das Zeichen des fünften ' +
      'Punktes -- dann beginnt sein Text auf einer anderen Kante als die vier ' +
      'darueber.',
  );

  // 2. Hoehe wie die vier <svg> (die tragen height="1em" als Attribut),
  //    Breite aus dem Seitenverhaeltnis. Eine px-Zahl wäre ab der nächsten
  //    Aenderung der Listenschrift daneben, ohne dass es jemand sieht.
  const bloecke = [
    ...appCss.matchAll(/\.BenefitList \.eu-gwl__zeichen\s*\{([^}]*)\}/g),
  ].map((m) => m[1]);
  assert.ok(
    bloecke.some((b) => /height:\s*1em/.test(b) && /width:\s*auto/.test(b)),
    'Das Zeichen wird nicht auf Icon-Hoehe (1em) gebracht -- es bleibt auf ' +
      'den 36 px der Block-Bauform und ueberragt die vier Nachbar-Icons.',
  );

  // 3. RICHTUNGS-ZUSAGE FÜR DIE BILDLEITER. In der Liste ist die Flaeche
  //    kleiner als AUSLOESER_ZEICHEN.anzeigeBreite; das ist hingenommen (das
  //    Bild kommt schaerfer herein als nötig, ein paar hundert Byte).
  //    Der umgekehrte Fall darf NICHT eintreten: waechst die Listenschrift
  //    über die Anzeigebreite hinaus, liefert die Leiter zu wenig Pixel und
  //    das Zeichen wird sichtbar unscharf. Genau diese Richtung steht hier.
  const reset = ohneCssKommentare(readFileSync(RESET_CSS, 'utf8'));
  const pLi = reset.match(/p,\s*li\s*\{([^}]*)\}/);
  assert.ok(pLi, 'die Schriftgroesse der Liste steht nicht mehr in reset.css');
  const rem = pLi[1].match(/font-size:\s*([\d.]+)rem/);
  assert.ok(rem, 'p, li führt keine Schriftgroesse in rem');

  const WURZEL_PX = 16; // Browser-Vorgabe; die Storefront setzt kein html{font-size}
  const zeichenHoehePx = Number(rem[1]) * WURZEL_PX;
  const zeichenBreitePx =
    (zeichenHoehePx * AUSLOESER_ZEICHEN.breite) / AUSLOESER_ZEICHEN.hoehe;

  assert.ok(
    AUSLOESER_ZEICHEN.anzeigeBreite >= zeichenBreitePx,
    `Die Bildleiter rechnet mit ${AUSLOESER_ZEICHEN.anzeigeBreite} px, der ` +
      `Listenpunkt zeigt das Zeichen aber ${zeichenBreitePx.toFixed(1)} px ` +
      'breit. Das Zeichen wird damit sichtbar unscharf ausgeliefert.',
  );
});

/* ---------------------------------------------------------------------------
 * DIE AUSWEITUNG (Elina EL-20260909-8c4001d1, gebaut 2026-09-09).
 *
 * BESTELLT WAR EINE REGEL, KEINE SEITENLISTE. Elinas Auftrag zählt zwar
 * Seiten auf ("QiHome Air, QiBracelet und die Necklace-Seiten … die
 * Crystal-Cacao-Kakao-Produktseiten"), schließt aber mit dem Satz, der die
 * eigentliche Trennlinie zieht: "auf allen anderen Produktseiten OHNE solche
 * Icon-Liste bleibt der Hinweis unveraendert wie bisher unter dem
 * Kauf-Button". Die Frage ist also nicht, welche Seite gemeint war, sondern
 * ob eine Kaufflaeche eine eigene Nutzen-Liste hat.
 *
 * DER WAECHTER SUCHT DIE FLAECHEN DESHALB, STATT SIE ZU KENNEN. Eine
 * hart notierte Liste wäre ab der nächsten neuen Kaufflaeche unvollstaendig,
 * ohne dass es jemandem auffaellt -- und genau dort faellt die
 * Pflichtmitteilung dann still zwischen die beiden Bauformen: der Default ist
 * abgeschaltet, der Listenpunkt fehlt, die Seite antwortet weiter HTTP 200.
 *
 * ZWEI RICHTUNGEN, weil eine allein nichts wert wäre:
 *   - Flaeche MIT Liste  -> Punkt IN der Liste UND Default abgeschaltet.
 *   - Flaeche OHNE Liste -> Default NICHT abgeschaltet (Elinas Schlusssatz).
 * ------------------------------------------------------------------------ */

import {readdirSync} from 'node:fs';

/** Rendert die Datei eine Nutzen-Liste? (Die Definition der geteilten Liste in
 *  QiOneBuyBox.jsx zählt NICHT -- sie rendert sich nicht selbst.) */
const LISTE_GERENDERT = /<(?:QiOne|Cacao)?BenefitList[\s/>]/;
/** Rendert die Datei ueberhaupt einen Kauf-Knopf-Traeger? */
const KAUFFLAECHE = /<(?:Cacao)?ProductForm[\s/>]|<QiOneBuyBox[\s/>]/;

function jsxDateien(...verzeichnisse) {
  const treffer = [];
  for (const v of verzeichnisse) {
    const abs = join(HIER, '..', ...v);
    for (const name of readdirSync(abs)) {
      if (!name.endsWith('.jsx')) continue;
      treffer.push({
        pfad: [...v, name].join('/'),
        code: ohneKommentare(readFileSync(join(abs, name), 'utf8')),
      });
    }
  }
  return treffer;
}

const ALLE_FLAECHEN = jsxDateien(
  ['app', 'routes'],
  ['app', 'components', 'product-pages'],
  ['app', 'components', 'campaign'],
);

test('jede Kaufflaeche MIT Nutzen-Liste trägt den Punkt IN der Liste', () => {
  const mitListe = ALLE_FLAECHEN.filter(
    (d) => LISTE_GERENDERT.test(d.code) && KAUFFLAECHE.test(d.code),
  );

  // POSITIV-KONTROLLE ZUERST. Ohne sie wäre ein zu enger Sucher nicht rot,
  // sondern GRUEN über der leeren Menge -- und das sieht aus wie ein
  // bestandener Lauf. Die acht Flaechen sind am 2026-09-09 gemessen; kommt
  // eine dazu, faellt sie in die Zusagen darunter, nicht hier heraus.
  const gefunden = mitListe.map((d) => d.pfad).sort();
  for (const pflicht of [
    'app/components/product-pages/QiBraceletShop.jsx',
    'app/components/product-pages/QiHomeAirShop.jsx',
    'app/components/product-pages/QiOne2Pro2xShop.jsx',
    'app/components/product-pages/QiOne2ProShop.jsx',
    'app/routes/products.crystal-cacao-awake.jsx',
    'app/routes/products.crystal-cacao-create.jsx',
    'app/routes/products.qibracelet.jsx',
    'app/routes/products.qihome-air.jsx',
    'app/routes/products.qione-2-pro.jsx',
    'app/routes/products.qione-kette.jsx',
  ]) {
    assert.ok(
      gefunden.includes(pflicht),
      `Positiv-Kontrolle: ${pflicht} wird vom Sucher nicht mehr als ` +
        'Kaufflaeche-mit-Nutzen-Liste erkannt. Die Zusagen unten laufen dann ' +
        `über einer zu kleinen Menge (gefunden: ${gefunden.join(', ')}).`,
    );
  }

  for (const {pfad, code} of mitListe) {
    // GEMESSEN WIRD DIE MONTAGE, NICHT DER NAME. Eine blosse Namenssuche war
    // der erste Anlauf und ueberlebte die Mutationsprobe: der Name steht auch
    // in der import-Zeile, also blieb die Zusage gruen, nachdem der Punkt aus
    // der Liste GELOESCHT war. Ein Waechter, der den Namen einer Sache zählt
    // statt die Sache, misst hier die Einfuhr und nicht die Montage.
    const montiert = /<EuGewaehrleistungsListenpunkt\s*\/>/;
    assert.match(
      code,
      montiert,
      `${pfad} hat eine eigene Nutzen-Liste, hängt die Pflichtmitteilung aber ` +
        'nicht hinein. Bestellt (Elina EL-20260909-8c4001d1): wo eine solche ' +
        'Liste steht, ist der Hinweis ihr letzter Punkt.',
    );
    assert.match(
      code,
      /import\s*\{[^}]*EuGewaehrleistungsListenpunkt/,
      `${pfad} rendert den Listenpunkt, führt ihn aber nicht ein -- das baut nicht.`,
    );
    // UND ER MUSS IN DER LISTE STEHEN, nicht daneben. Sonst ist er wieder
    // genau der Block, der weg sollte -- nur mit einer <li>-Huelle, die
    // ausserhalb einer <ul> ungueltiges HTML ist. Zwei erlaubte Orte: direkt
    // zwischen <ul> und </ul> der eigenen Liste, oder als `zusatzPunkt` an
    // die geteilte QiOneBenefitList uebergeben (die ihn INNERHALB ihrer <ul>
    // einsetzt -- das prueft die Zusage weiter oben an QiOneBuyBox.jsx).
    const stelle = code.search(montiert);
    const alsSlot = /zusatzPunkt=\{<EuGewaehrleistungsListenpunkt \/>\}/.test(code);
    const inListe = [...code.matchAll(/<ul[\s>]/g)].some((auf) => {
      const zu = code.indexOf('</ul>', auf.index);
      return zu > auf.index && stelle > auf.index && stelle < zu;
    });
    assert.ok(
      alsSlot || inListe,
      `${pfad} montiert den Listenpunkt AUSSERHALB der Nutzen-Liste. Dann ist ` +
        'er wieder ein Block daneben -- und eine <li> ausserhalb einer <ul> ' +
        'ist ausserdem ungueltiges HTML.',
    );
    assert.match(
      code,
      /gewaehrleistungsHinweis=\{false\}/,
      `${pfad} montiert den Listenpunkt, schaltet den Default unter dem ` +
        'Kauf-Knopf aber nicht ab -- die Mitteilung stuende zweimal auf der Seite.',
    );
  }
});

test('jede Kaufflaeche OHNE Nutzen-Liste behaelt ihn unter dem Kauf-Knopf', () => {
  const ohneListe = ALLE_FLAECHEN.filter(
    (d) => KAUFFLAECHE.test(d.code) && !LISTE_GERENDERT.test(d.code),
  );

  // Wieder zuerst die Positiv-Kontrolle: die Gegenrichtung wäre sonst eine
  // Zusage über der leeren Menge. products.$handle ist der Catch-all, über
  // den die MEISTEN Kaufflaechen des Shops laufen; zeremonie-kakao ist die
  // Kakao-Seite, die als einzige keine Nutzen-Liste hat.
  const gefunden = ohneListe.map((d) => d.pfad).sort();
  for (const pflicht of [
    'app/routes/products.$handle.jsx',
    'app/routes/products.zeremonie-kakao.jsx',
  ]) {
    assert.ok(
      gefunden.includes(pflicht),
      `Positiv-Kontrolle: ${pflicht} steht nicht mehr in der Gegenprobe ` +
        `(gefunden: ${gefunden.join(', ')}).`,
    );
  }

  for (const {pfad, code} of ohneListe) {
    assert.doesNotMatch(
      code,
      /gewaehrleistungsHinweis=\{false\}/,
      `${pfad} schaltet die Pflichtmitteilung unter dem Kauf-Knopf ab, hat ` +
        'aber keine Nutzen-Liste, in der sie stattdessen stuende. Sie faellt ' +
        'auf dieser Flaeche ersatzlos weg -- bei weiterhin HTTP 200.',
    );
  }
});

test('die Kakao-Naht reicht den Schalter durch, statt ihn zu schlucken', () => {
  const code = ohneKommentare(
    readFileSync(join(HIER, '..', 'app', 'components', 'CacaoProductForm.jsx'), 'utf8'),
  );

  assert.match(
    code,
    /gewaehrleistungsHinweis\s*=\s*true/,
    'CacaoProductForm kennt die Prop nicht (mehr) -- dann verlieren alle ' +
      'Kakao-Flaechen ohne eigene Liste die Pflichtmitteilung oder tragen sie ' +
      'doppelt.',
  );
  assert.match(
    code,
    /gewaehrleistungsHinweis\s*\?\s*<EuGewaehrleistungsHinweis\s*\/>/,
    'CacaoProductForm nimmt die Prop entgegen, rendert die Mitteilung aber ' +
      'unabhängig davon -- der Schalter wäre eine Prop ohne Wirkung.',
  );
  assert.match(
    code,
    /<AddToCartButton/,
    'Positiv-Kontrolle: der Kauf-Knopf fehlt -- die Datei wurde nicht gelesen wie erwartet',
  );
});

test('das Zeichen in der Kakao-Liste ist so groß wie die Emoji daneben', () => {
  const appCss = ohneCssKommentare(readFileSync(APP_CSS, 'utf8'));

  const bloecke = [
    ...appCss.matchAll(/\.CacaoBenefitList \.eu-gwl__zeichen\s*\{([^}]*)\}/g),
  ].map((m) => m[1]);
  assert.ok(bloecke.length > 0, 'die Kakao-Liste regelt ihr Zeichen nicht');

  // 1. Hoehe in em, nicht in px. Diese Liste setzt ihre Schrift SELBST
  //    (.CacaoBenefitList li { font-size: 0.9rem }) und damit anders als jede
  //    andere -- eine px-Zahl wäre hier von vornherein die falsche.
  assert.ok(
    bloecke.some((b) => /height:\s*1em/.test(b) && /width:\s*auto/.test(b)),
    'Das Zeichen wird nicht auf Zeilenhoehe (1em) gebracht -- es bliebe auf ' +
      'den 36 px der Block-Bauform und wäre zweieinhalbmal so hoch wie die ' +
      'fünf Emoji darueber.',
  );

  // 2. Ohne display: inline-block rutscht das Bild auf eine eigene Zeile
  //    (Preflight stellt <img> auf display: block). Der Punkt stuende dann
  //    zweizeilig zwischen fünf einzeiligen -- sichtbar, aber niemand
  //    vermutet die Ursache in einer Basisregel.
  assert.ok(
    bloecke.some((b) => /display:\s*inline-block/.test(b)),
    'Das Zeichen bleibt display: block und bricht die Zeile auf.',
  );

  // 3. RICHTUNGS-ZUSAGE für DIE BILDLEITER, wie bei der .BenefitList: die
  //    Anzeigebreite darf die tatsaechliche Flaeche nie UNTERschreiten, sonst
  //    liefert die srcset-Leiter zu wenig Pixel und das Zeichen wird unscharf.
  const cacaoLi = appCss.match(/\.CacaoBenefitList li\s*\{([^}]*)\}/);
  assert.ok(cacaoLi, 'die Kakao-Liste führt keine eigene Schriftgroesse mehr');
  const rem = cacaoLi[1].match(/font-size:\s*([\d.]+)rem/);
  assert.ok(rem, '.CacaoBenefitList li führt keine Schriftgroesse in rem');

  const WURZEL_PX = 16;
  const breitePx =
    ((Number(rem[1]) * WURZEL_PX) * AUSLOESER_ZEICHEN.breite) /
    AUSLOESER_ZEICHEN.hoehe;
  assert.ok(
    AUSLOESER_ZEICHEN.anzeigeBreite >= breitePx,
    `Die Bildleiter rechnet mit ${AUSLOESER_ZEICHEN.anzeigeBreite} px, die ` +
      `Kakao-Liste zeigt das Zeichen aber ${breitePx.toFixed(1)} px breit.`,
  );
});
