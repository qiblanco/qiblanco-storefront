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

  assert.match(
    code,
    /<EuGewaehrleistungsHinweis\s*\/>/,
    '/products/qione-2-pro montiert die Mitteilung nicht selbst -- zusammen ' +
      'mit dem abgeschalteten Default unten faellt sie auf dieser Kaufflaeche ' +
      'ersatzlos weg.',
  );
  assert.match(
    code,
    /import\s*\{\s*EuGewaehrleistungsHinweis\s*\}/,
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

test('JEDE andere Kaufflaeche behaelt die Mitteilung unter dem Kauf-Knopf', () => {
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
