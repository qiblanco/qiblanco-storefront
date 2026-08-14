/**
 * Hermetischer Test der Produktseiten-Meta (node --test, ohne Bundler).
 *
 * Prueft ABSICHTLICH nicht "die Datei existiert" oder "das Feld ist gesetzt",
 * sondern die Eigenschaften, deren Verletzung real Schaden macht:
 *  - Laenge im Snippet-Fenster (zu lang wird abgeschnitten, zu kurz verschenkt)
 *  - ECHTE Umlaute statt ASCII-Transliteration im KUNDENSICHTBAREN Text
 *    (bindende Regel, Gate live, auf diesem Server schon zweimal verletzt)
 *  - Canonical als echtes <link> UND absolut (die Fehlerklasse, wegen der
 *    app/lib/seo.js ueberhaupt entstand)
 *  - description und og:description identisch (sonst zwei Versprechen)
 *  - Claim-Korridor: keine Heilzusage (HWG), keine Wirkzusage bei Lebensmitteln
 *  - jede Produktroute ist wirklich verdrahtet (eine vergessene Route ist
 *    genau der Ausgangsbefund gewesen)
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

test('jede Beschreibung liegt im Snippet-Fenster (110..170 Zeichen)', () => {
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(
      text.length >= 110 && text.length <= 170,
      `${pfad}: ${text.length} Zeichen — ausserhalb 110..170`,
    );
  }
});

test('kundensichtbarer Text traegt ECHTE Umlaute, keine Transliteration', () => {
  // Wortstaemme, die im Deutschen einen Umlaut tragen MUESSEN. Findet sich die
  // ASCII-Form, ist der Text transliteriert — im Kundentext ein Regelbruch.
  const verdaechtig = /\b(fuer|ueber|ueberall|unterstuetzt|Qualitaet|Atmosphaere|kraeftig\w*|Buero|Anhaenger|zurueck\w*|koennen|moeglich)\b/i;
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
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(!/Ã[¤¶¼ŸŒ]|â€|Â/.test(text), `${pfad}: Mojibake im Text`);
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

test('CLAIM-KORRIDOR: keine Heilzusage, keine Wirkzusage am Koerper', () => {
  // HWG §3/§11: keine Aussage, die Heilung/Linderung/Vorbeugung einer
  // Krankheit behauptet. Die Live-Seiten formulieren ueber das UMFELD —
  // diese Liste haelt genau diesen Zaun.
  const verboten =
    /\b(heilt|heilung|lindert|linderung|therapie|therapiert|behandelt|krankheit|schmerz\w*|entgiftet|immunsystem staerk\w*|blutdruck|diagnos\w*|nebenwirkung\w*)\b/i;
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    const treffer = text.match(verboten);
    assert.equal(treffer, null, `${pfad}: Heilaussage "${treffer?.[0]}"`);
  }
});

test('CLAIM-KORRIDOR: Kakao traegt keine gesundheitsbezogene Angabe', () => {
  // Health-Claims-Verordnung (EU 1924/2006): bei Lebensmitteln ist jede
  // gesundheitsbezogene Angabe zulassungspflichtig. Die Kakao-Texte duerfen
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
  // Befund der adversarialen Pruefung 2026-08-14 (K3-P2): "bewusste Kakao-Zeit"
  // / "bewusst genossen" liest sich im Kontext ZEREMONIE-Kakao als Andeutung
  // eines psychoaktiven Effekts (Theobromin/PEA) — eine gesundheitsbezogene
  // Angabe ohne zugelassenen Health Claim. Das Wort war verlustfrei ersetzbar,
  // also ist es ersetzt. Dieser Waechter haelt es draussen.
  const bewusstsein =
    /\b(bewusstsein\w*|bewusst\w*|achtsam\w*|meditativ|spirituell|psychoaktiv|rausch\w*|trance)\b/i;
  for (const pfad of PFADE.filter((p) => p.includes('cacao'))) {
    const treffer = PRODUKT_BESCHREIBUNGEN[pfad].match(bewusstsein);
    assert.equal(
      treffer,
      null,
      `${pfad}: Bewusstseins-Andeutung "${treffer?.[0]}" bei einem Lebensmittel`,
    );
  }
});

test('KEINE VERSCHAERFUNG gegenueber dem Live-Bestand', () => {
  // Die Wirkaussagen der Qi-Produkte ("reduziert die Auswirkungen", "300 m²")
  // stammen WOERTLICH aus dem sichtbaren Live-Seitentext und aus claims.js
  // (status=legitimiert). Dieser Test haelt fest, dass die Snippets den
  // Bestand SPIEGELN und ihn nicht steigern: kein Superlativ, keine
  // Garantie, keine Quantifizierung ueber das Bestandsmass hinaus.
  const steigerung =
    /\b(garantiert|100\s*%|vollständig\w*|komplett\w*|eliminiert|blockiert|neutralisiert|beweisen|bewiesen|klinisch|zertifiziert wirksam)\b/i;
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    const treffer = text.match(steigerung);
    assert.equal(treffer, null, `${pfad}: Steigerung "${treffer?.[0]}"`);
  }
});

test('KUNDENSPRACHE: kein Marketing-Fachbegriff im Snippet', () => {
  // SSoT kaufueberzeugung: "kohaerentes Wasser" ist unser Wort, nicht seines.
  for (const [pfad, text] of Object.entries(PRODUKT_BESCHREIBUNGEN)) {
    assert.ok(
      !/kohärent|koharent|coherent/i.test(text),
      `${pfad}: Fachbegriff im Kundentext`,
    );
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

test('die 301-Route zeremonie-kakao traegt bewusst KEINE Beschreibung', () => {
  // Gemessen 2026-08-14: HTTP 301 -> /products/crystal-cacao-create. Eine
  // Beschreibung dort waere ein Vollzug, den niemand ausliefert.
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
    const quelle = readFileSync(`app/routes/${f}`, 'utf8');
    const slug = f.replace(/^products\./, '').replace(/\.jsx$/, '');
    if (slug === 'zeremonie-kakao') continue; // 301, bewusst aussen vor
    if (!quelle.includes('produktMeta')) fehlend.push(f);
  }
  assert.deepEqual(fehlend, [], `Routen ohne produktMeta: ${fehlend.join(', ')}`);
});

test('jeder verdrahtete Pfad hat auch wirklich einen Text', () => {
  // Gegenrichtung: eine Route kann produktMeta rufen und trotzdem leer
  // ausgehen, wenn der Pfad-Schluessel nicht im Katalog steht (Tippfehler).
  const dateien = readdirSync('app/routes').filter(
    (f) => f.startsWith('products.') && f.endsWith('.jsx') && !f.includes('$'),
  );
  for (const f of dateien) {
    const quelle = readFileSync(`app/routes/${f}`, 'utf8');
    const m = quelle.match(/pfad:\s*'([^']+)'/);
    if (!m) continue;
    assert.ok(
      produktBeschreibung(m[1]),
      `${f}: pfad '${m[1]}' hat keinen Text im Katalog`,
    );
  }
});
