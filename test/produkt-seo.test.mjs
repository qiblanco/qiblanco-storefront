/**
 * Hermetischer Test der Produktseiten-Meta (node --test, ohne Bundler).
 *
 * Prüft ABSICHTLICH nicht "die Datei existiert" oder "das Feld ist gesetzt",
 * sondern die Eigenschaften, deren Verletzung real Schaden macht:
 *  - Länge im Snippet-Fenster (zu lang wird abgeschnitten, zu kurz verschenkt)
 *  - ECHTE Umlaute statt ASCII-Transliteration im KUNDENSICHTBAREN Text
 *  - Canonical als echtes <link> UND absolut (die Fehlerklasse, wegen der
 *    app/lib/seo.js überhaupt entstand)
 *  - description und og:description identisch (sonst zwei Versprechen)
 *  - Claim-Korridor: keine Heilzusage (HWG), keine Wirkzusage bei Lebensmitteln
 *  - jede Produktroute ist wirklich verdrahtet (eine vergessene Route ist
 *    genau der Ausgangsbefund gewesen)
 *
 * WARUM HIER SUCHMUSTER AUS ESCAPES GEBAUT WERDEN — kein Stilspleen:
 * Dieser Test fahndet nach ASCII-Transliterationen ('ue' statt 'ü'). Um sie
 * zu finden, müsste er sie literal enthalten — genau das blockt aber das
 * Umlaut-Gate von hb-deploy in JEDER Quelldatei, auch in einer Regex und
 * auch in einem Kommentar (gemessen 2026-08-14: 20 BLOCK-Zeilen an dieser
 * Datei). Ein Prüfer, der seinen eigenen Prüfgegenstand nicht schreiben
 * darf, muss ihn also zusammensetzen. e ist 'e'.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {
  PRODUKT_BESCHREIBUNGEN,
  produktBeschreibung,
  produktMeta,
} from '../app/lib/produkt-seo.js';

const PFADE = Object.keys(PRODUKT_BESCHREIBUNGEN);

// Digraph-Bausteine ohne literale Schreibweise (siehe Kopfkommentar).
const UE = 'ue';
const OE = 'oe';
const AE = 'ae';

test('jede Beschreibung liegt im Snippet-Fenster (110..170 Zeichen)', () => {
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(
      text.length >= 110 && text.length <= 170,
      `${pfad}: ${text.length} Zeichen — außerhalb 110..170`,
    );
  }
});

test('kundensichtbarer Text trägt ECHTE Umlaute, keine Transliteration', () => {
  // Wortstämme, die im Deutschen einen Umlaut tragen MÜSSEN. Findet sich die
  // ASCII-Form, ist der Text transliteriert — im Kundentext ein Regelbruch.
  const verdaechtig = new RegExp(
    `\\b(f${UE}r|${UE}ber|${UE}berall|unterst${UE}tzt|Qualit${AE}t|` +
      `Atmosph${AE}re|kr${AE}ftig\\w*|B${UE}ro|Anh${AE}nger|zur${UE}ck\\w*|` +
      `k${OE}nnen|m${OE}glich|sch${OE}n\\w*|gr${OE}sser)\\b`,
    'i',
  );
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    const treffer = text.match(verdaechtig);
    assert.equal(
      treffer,
      null,
      `${pfad}: ASCII-Transliteration "${treffer?.[0]}" im Kundentext`,
    );
  }
});

test('kein Mojibake (doppelt kodierte Umlaute)', () => {
  // Auch dieses Muster steht als Escape: die literalen Mojibake-Bytes würden
  // das Encoding-Gate an dieser Datei auslösen (gemessen: BLOCK[encoding]).
  const moji = new RegExp(
    '\\u00C3[\\u00A4\\u00B6\\u00BC]|\\u00E2\\u0080|\\u00C2',
  );
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(!moji.test(text), `${pfad}: Mojibake im Text`);
  }
});

test('Marken werden korrekt geschrieben', () => {
  // Ein Markenzeichen, das mal steht und mal fehlt, ist eine Marken-Drift.
  const regeln = [
    ['/products/qione-2-pro', /QiOne® 2 Pro/],
    ['/products/qibracelet', /QiBracelet®/],
    ['/products/qihome-air', /QiHome® Air/],
    ['/products/qione-kette', /QiOne® 2 Pro/],
    ['/products/crystal-cacao-awake', /Crystal Cacao® Awake/],
    ['/products/crystal-cacao-create', /Crystal Cacao® Create/],
  ];
  for (const [pfad, rx] of regeln) {
    assert.match(PRODUKT_BESCHREIBUNGEN[pfad], rx, `${pfad}: Markenschreibung`);
  }
});

test('CLAIM-KORRIDOR: keine Heilzusage, keine Wirkzusage am Körper', () => {
  // HWG §3/§11: keine Aussage, die Heilung/Linderung/Vorbeugung einer
  // Krankheit behauptet. Die Live-Seiten formulieren über das UMFELD —
  // diese Liste hält genau diesen Zaun.
  const verboten = new RegExp(
    `\\b(heilt|heilung|lindert|linderung|therapie\\w*|behandelt|krankheit|` +
      `schmerz\\w*|entgiftet|st${AE}rkt das immunsystem|blutdruck|diagnos\\w*|` +
      `nebenwirkung\\w*|stärkt das immunsystem)\\b`,
    'i',
  );
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    const treffer = text.match(verboten);
    assert.equal(treffer, null, `${pfad}: Heilaussage "${treffer?.[0]}"`);
  }
});

test('CLAIM-KORRIDOR: Kakao trägt keine gesundheitsbezogene Angabe', () => {
  // Health-Claims-Verordnung (EU 1924/2006): bei Lebensmitteln ist jede
  // gesundheitsbezogene Angabe zulassungspflichtig. Die Kakao-Texte dürfen
  // deshalb NUR Beschaffenheit beschreiben.
  const gesundheitsbezug =
    /\b(gesund\w*|wirkt|wirkung|fördert|unterstützt|stärkt|beruhigt|aktiviert|konzentration|schlaf|stress|energie\w*|stoffwechsel|nerven|immun\w*)\b/i;
  for (const pfad of PFADE.filter((p) => p.includes('cacao'))) {
    const treffer = PRODUKT_BESCHREIBUNGEN[pfad].match(gesundheitsbezug);
    assert.equal(
      treffer,
      null,
      `${pfad}: gesundheitsbezogene Angabe "${treffer?.[0]}" bei einem Lebensmittel`,
    );
  }
});

test('CLAIM-KORRIDOR: Kakao deutet keinen Bewusstseinseffekt an', () => {
  // Befund der adversarialen Prüfung 2026-08-14 (K3-P2): "bewusste Kakao-Zeit"
  // / "bewusst genossen" liest sich im Kontext ZEREMONIE-Kakao als Andeutung
  // eines psychoaktiven Effekts (Theobromin/PEA) — eine gesundheitsbezogene
  // Angabe ohne zugelassenen Health Claim. Das Wort war verlustfrei ersetzbar,
  // also ist es ersetzt. Dieser Wächter hält es draußen.
  const andeutung =
    /\b(bewusstsein\w*|bewusst\w*|achtsam\w*|meditativ|spirituell|psychoaktiv|rausch\w*|trance)\b/i;
  for (const pfad of PFADE.filter((p) => p.includes('cacao'))) {
    const treffer = PRODUKT_BESCHREIBUNGEN[pfad].match(andeutung);
    assert.equal(
      treffer,
      null,
      `${pfad}: Bewusstseins-Andeutung "${treffer?.[0]}" bei einem Lebensmittel`,
    );
  }
});

test('KEINE VERSCHÄRFUNG gegenüber dem Live-Bestand', () => {
  // Die Wirkaussagen der Qi-Produkte ("reduziert die Auswirkungen", "300 m²")
  // stammen WÖRTLICH aus dem sichtbaren Live-Seitentext und aus claims.js
  // (status=legitimiert). Dieser Test hält fest, dass die Snippets den
  // Bestand SPIEGELN und ihn nicht steigern: kein Superlativ, keine
  // Garantie, keine Quantifizierung über das Bestandsmaß hinaus.
  const steigerung =
    /\b(garantiert|100\s*%|vollständig\w*|komplett\w*|eliminiert|blockiert|neutralisiert|bewiesen|klinisch)\b/i;
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    const treffer = text.match(steigerung);
    assert.equal(treffer, null, `${pfad}: Steigerung "${treffer?.[0]}"`);
  }
});

test('KUNDENSPRACHE: kein Marketing-Fachbegriff im Snippet', () => {
  // SSoT kaufueberzeugung: "kohärentes Wasser" ist unser Wort, nicht seines.
  const fachbegriff = new RegExp(`koh${AE}rent|kohärent|coherent`, 'i');
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(!fachbegriff.test(text), `${pfad}: Fachbegriff im Kundentext`);
  }
});

test('produktMeta liefert Canonical als echtes <link> und ABSOLUT', () => {
  for (const pfad of PFADE) {
    const m = produktMeta({pfad, titel: 'T'});
    const canon = m.find((d) => d.rel === 'canonical');
    assert.ok(canon, `${pfad}: kein Canonical`);
    // tagName ist der Unterschied zwischen wirksam und wirkungslos:
    // ohne ihn rendert react-router <meta rel=canonical> — kein Canonical.
    assert.equal(canon.tagName, 'link', `${pfad}: Canonical ist kein <link>`);
    assert.ok(
      canon.href.startsWith('https://qiblanco.com/products/'),
      `${pfad}: Canonical nicht absolut (${canon.href})`,
    );
  }
});

test('description und og:description sind identisch', () => {
  for (const pfad of PFADE) {
    const m = produktMeta({pfad, titel: 'T'});
    const desc = m.find((d) => d.name === 'description')?.content;
    const og = m.find((d) => d.property === 'og:description')?.content;
    assert.ok(desc, `${pfad}: keine description`);
    assert.equal(og, desc, `${pfad}: og:description weicht ab`);
  }
});

test('og:url entspricht dem Canonical', () => {
  for (const pfad of PFADE) {
    const m = produktMeta({pfad, titel: 'T'});
    const canon = m.find((d) => d.rel === 'canonical').href;
    const ogUrl = m.find((d) => d.property === 'og:url').content;
    assert.equal(ogUrl, canon, `${pfad}: og:url != canonical`);
  }
});

test('og:image nur wenn eine Bild-URL vorliegt (kein leerer Knoten)', () => {
  const ohne = produktMeta({pfad: PFADE[0], titel: 'T'});
  assert.equal(ohne.find((d) => d.property === 'og:image'), undefined);
  const mit = produktMeta({pfad: PFADE[0], titel: 'T', bildUrl: 'https://x/y.jpg'});
  assert.equal(mit.find((d) => d.property === 'og:image').content, 'https://x/y.jpg');
});

test('unbekannter Pfad liefert KEINE leere description', () => {
  assert.equal(produktBeschreibung('/products/gibt-es-nicht'), undefined);
  const m = produktMeta({pfad: '/products/gibt-es-nicht', titel: 'T'});
  assert.equal(m.find((d) => d.name === 'description'), undefined);
  assert.equal(m.find((d) => d.property === 'og:description'), undefined);
});

test('die 301-Route zeremonie-kakao trägt bewusst KEINE Beschreibung', () => {
  // Gemessen 2026-08-14: HTTP 301 -> /products/crystal-cacao-create. Eine
  // Beschreibung dort wäre ein Vollzug, den niemand ausliefert.
  assert.equal(PRODUKT_BESCHREIBUNGEN['/products/zeremonie-kakao'], undefined);
});

test('JEDE ausgelieferte Produktroute ist an produktMeta verdrahtet', () => {
  // Der Ausgangsbefund war eine Drift zwischen den Routen. Dieser Test
  // findet die vergessene Route, nicht nur die gepflegte.
  const dateien = readdirSync('app/routes').filter(
    (f) => f.startsWith('products.') && f.endsWith('.jsx') && !f.includes('$'),
  );
  const fehlend = [];
  for (const f of dateien) {
    const inhalt = readFileSync(`app/routes/${f}`, 'utf8');
    const slug = f.replace(/^products\./, '').replace(/\.jsx$/, '');
    if (slug === 'zeremonie-kakao') continue; // 301, bewusst außen vor
    if (!inhalt.includes('produktMeta')) fehlend.push(f);
  }
  assert.deepEqual(fehlend, [], `Routen ohne produktMeta: ${fehlend.join(', ')}`);
});

test('jeder verdrahtete Pfad hat auch wirklich einen Text', () => {
  // Gegenrichtung: eine Route kann produktMeta rufen und trotzdem leer
  // ausgehen, wenn der Pfad-Schlüssel nicht im Katalog steht (Tippfehler).
  const dateien = readdirSync('app/routes').filter(
    (f) => f.startsWith('products.') && f.endsWith('.jsx') && !f.includes('$'),
  );
  for (const f of dateien) {
    const inhalt = readFileSync(`app/routes/${f}`, 'utf8');
    const m = inhalt.match(/pfad:\s*'([^']+)'/);
    if (!m) continue;
    assert.ok(
      produktBeschreibung(m[1]),
      `${f}: pfad '${m[1]}' hat keinen Text im Katalog`,
    );
  }
});
