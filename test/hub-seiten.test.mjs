/**
 * Hermetischer Test der Hub-Verlinkung (node --test, ohne Bundler) — SEO S5.
 *
 * Prüft ABSICHTLICH nicht "die Datei existiert" oder "die Liste ist nicht
 * leer", sondern die Eigenschaften, deren Verletzung real Schaden macht:
 *
 *  - Die zwei Ziele, die die Knopfdruck-Probe des Master-Konzepts als Paket L8
 *    führt (/pages/crystal-cacao, /pages/technologie), sind wirklich drin.
 *    Genau ihr Fehlen war der Ausgangsbefund; eine Liste, die sie verliert,
 *    hat ihren Zweck verloren, egal wie viele andere Eintraege sie hat.
 *  - Die Liste ist wirklich VERDRAHTET. Eine gepflegte Datenliste, die keine
 *    Komponente rendert, ist die teuerste Form von "sieht fertig aus".
 *  - Keine Dublette gegen die Produktliste des Footers: derselbe Link zweimal
 *    im selben Footer verwaessert den Ankertext, statt ihn zu schaerfen.
 *  - Jeder Pfad ist ein absoluter /pages/-Pfad. Ein relativer oder externer
 *    Eintrag würde als Hub-Signal nichts beitragen.
 *  - Der Ankertext trägt ECHTE Umlaute (kundensichtbarer Text) und ist kurz
 *    genug, um als Sitelink-Titel zu taugen.
 *  - Die Titel-Hygiene-Flanke WAECHST NICHT unbemerkt: Seiten mit
 *    Scaffold-Titel sind namentlich bekannt und begrenzt.
 *
 * WARUM HIER SUCHMUSTER AUS ESCAPES GEBAUT WERDEN — kein Stilspleen:
 * Dieser Test fahndet nach ASCII-Transliterationen ('ue' statt 'ü'). Um sie
 * zu finden, müsste er sie literal enthalten — genau das blockt aber das
 * Umlaut-Gate von hb-deploy in JEDER Quelldatei, auch in einer Regex und
 * auch in einem Kommentar. Ein Prüfer, der seinen eigenen Prüfgegenstand
 * nicht schreiben darf, muss ihn also zusammensetzen. (Dieselbe Bauweise und
 * dieselbe Begründung wie in test/produkt-seo.test.mjs.)
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  HUB_LINKS,
  hubPfade,
  pruefe_titel_hygiene,
  themenLinks,
} from '../app/lib/hub-seiten.js';

const FOOTER = readFileSync(
  new URL('../app/components/Footer.jsx', import.meta.url),
  'utf8',
);

// Die zwei Ziele des Knopfdruck-Pakets L8 (SEO/AI-Master-Konzept DACH).
const L8_ZIELE = ['/pages/crystal-cacao', '/pages/technologie'];

test('die L8-Ziele sind enthalten — sie sind der Ausgangsbefund', () => {
  for (const ziel of L8_ZIELE) {
    assert.ok(
      hubPfade().includes(ziel),
      `${ziel} fehlt in HUB_LINKS — genau dieses Ziel war der Befund, ` +
        'der die Stufe S5 ausgeloest hat',
    );
  }
});

test('die Liste ist im Footer verdrahtet, nicht nur gepflegt', () => {
  assert.match(
    FOOTER,
    /import\s*\{\s*themenLinks\s*\}\s*from\s*'~\/lib\/hub-seiten'/,
    'Footer.jsx importiert themenLinks nicht',
  );
  assert.match(
    FOOTER,
    /themenLinks\([\s\S]*?\)\.map\(/,
    'Footer.jsx rendert themenLinks nicht — die Liste erreicht kein HTML',
  );
});

test('jeder Eintrag ist ein absoluter /pages/-Pfad mit Ankertext', () => {
  assert.ok(HUB_LINKS.length >= 4, 'weniger als 4 Hub-Seiten ist kein Hub');
  for (const {to, label} of HUB_LINKS) {
    assert.match(to, /^\/pages\/[a-z0-9-]+$/, `kein sauberer Pfad: ${to}`);
    assert.ok(label && label.trim().length > 0, `kein Ankertext für ${to}`);
    // Sitelink-Titel werden abgeschnitten; ein Ankertext, der nicht als
    // Sitelink-Titel taugt, verschenkt genau die Flaeche, um die es geht.
    assert.ok(label.length <= 32, `Ankertext zu lang für ${to}: ${label}`);
  }
});

test('keine Dublette im Fuß: jeder Hub steht dort genau einmal', () => {
  // Seit dem Rebase auf main (2026-09-26) führt der Fuß drei Hubs bereits in
  // eigenen Zeilen (INHALT_LINKS, NACHLESEN_LINKS, #636). Geprüft wird darum
  // nicht mehr "kein Hub steht literal im Footer", sondern die Eigenschaft
  // dahinter: jeder Hub erreicht den Fuß GENAU EINMAL — entweder über eine
  // bestehende Zeile oder über "Themen", nie über beide.
  for (const to of hubPfade()) {
    const treffer = FOOTER.split(`'${to}'`).length - 1;
    assert.ok(
      treffer <= 1,
      `${to} steht ${treffer}-mal literal im Footer — doppelter Link ` +
        'verwässert den Ankertext',
    );
  }
  for (const liste of ['PRODUCT_LINKS', 'INHALT_LINKS', 'NACHLESEN_LINKS', 'LEGAL_LINKS']) {
    assert.match(
      FOOTER,
      new RegExp(`themenLinks\\([\\s\\S]*?\\.\\.\\.${liste}[\\s\\S]*?\\)\\.map\\(`),
      `themenLinks bekommt ${liste} nicht als "schon im Fuß" — Dublette möglich`,
    );
  }
  assert.equal(
    new Set(hubPfade()).size,
    hubPfade().length,
    'ein Pfad steht zweimal in HUB_LINKS',
  );
});

test('themenLinks lässt genau die schon verlinkten Hubs weg', () => {
  const liste = [
    {to: '/pages/a', label: 'A'},
    {to: '/pages/b', label: 'B'},
    {to: '/pages/c', label: 'C'},
  ];
  assert.deepEqual(
    themenLinks(['/pages/b', '/pages/x'], liste).map((h) => h.to),
    ['/pages/a', '/pages/c'],
  );
  assert.equal(themenLinks([], liste).length, 3);
  // Echtbestand: nichts verschwindet ganz — was "Themen" weglässt, steht
  // literal in einer anderen Zeile des Fußes.
  const gerendert = new Set(
    themenLinks(hubPfade().filter((p) => FOOTER.includes(`'${p}'`))).map((h) => h.to),
  );
  for (const to of hubPfade()) {
    assert.ok(
      gerendert.has(to) || FOOTER.includes(`'${to}'`),
      `${to} erreicht den Fuß gar nicht`,
    );
  }
});

test('Ankertext trägt echte Umlaute (kundensichtbarer Text)', () => {
  // Aus Escapes gebaut, siehe Kopf: 'ue', 'oe', 'ae', 'ss' als Digraph-Fahndung.
  const u = 'ue';
  const o = 'oe';
  const a = 'ae';
  const digraph = new RegExp(`(${u}|${o}|${a})`, 'i');
  for (const {label, to} of HUB_LINKS) {
    // Bekannte echte Wörter mit diesen Buchstabenfolgen ausnehmen wäre hier
    // unnötig: keiner der Ankertexte enthält legitim 'ue'/'oe'/'ae'.
    assert.ok(
      !digraph.test(label),
      `Ankertext von ${to} enthält eine ASCII-Transliteration: ${label}`,
    );
  }
});

test('die Titel-Hygiene-Flanke ist benannt und waechst nicht unbemerkt', () => {
  const offen = pruefe_titel_hygiene();
  // Der Test pinnt bewusst die MENGE der bekannten Faelle, nicht eine Zahl:
  // wird eine geheilt, darf er nicht rot werden; kommt eine NEUE Hub-Seite
  // mit Scaffold-Titel dazu, muss er rot werden.
  //
  // Stand 2026-08-14 standen hier '/pages/superhuman' und
  // '/pages/zeremonie-kakao-kurs'. Am 2026-09-07 am ausgelieferten HTML
  // nachgemessen (Titel gelesen, nicht Statuscode): beide tragen einen
  // echten Titel, die Menge ist LEER. Die Schutzrichtung bleibt damit
  // unveraendert und wird sogar schaerfer — jeder Eintrag in `offen` ist
  // jetzt ein Befund.
  const bekannt = new Set([]);
  for (const pfad of offen) {
    assert.ok(
      bekannt.has(pfad),
      `neue Hub-Seite mit Scaffold-Titel: ${pfad} — erst S0-Titelfix, ` +
        'dann als Hub bewerben',
    );
  }
});

test('der Hygiene-Melder ist lebendig, nicht bloß gerade still', () => {
  // WARUM DIESER ARM SEIT 2026-09-07 EXISTIERT: solange zwei Faelle offen
  // waren, bewies der Test darueber nebenbei, dass pruefe_titel_hygiene()
  // ueberhaupt etwas findet. Seit die Menge leer ist, ist genau dieser
  // Beweis weg: eine kaputte Filter-Bedingung liefert dieselbe leere Liste
  // wie ein gesunder Bestand, und der Test darueber bliebe gruen. Also wird
  // die MECHANIK an einer eigenen Liste geprueft, nicht am Bestand.
  const gefunden = pruefe_titel_hygiene([
    {to: '/pages/heil', titel_ok: true},
    {to: '/pages/kaputt', titel_ok: false},
  ]);
  assert.deepEqual(
    gefunden,
    ['/pages/kaputt'],
    'pruefe_titel_hygiene() meldet eine Seite mit titel_ok:false nicht mehr ' +
      '— der Melder ist tot, nicht der Bestand sauber',
  );
});

test('die gemessenen Ankertexte stehen wirklich in der Liste', () => {
  // Zwei am 2026-09-07 live nachgemessene Werte, die dieser Bau geaendert
  // hat. Sie stehen hier, damit ein spaeterer Ruecksetzer laut wird statt
  // still: '/pages/support' hiess bis dahin 'Support & FAQ', obwohl die
  // Seite den Titel 'Kontakt & Hilfe' trägt und der Fußbereich daneben
  // bereits 'Häufige Fragen' für die ANDERE Seite /pages/faq führt.
  const nach = Object.fromEntries(HUB_LINKS.map((h) => [h.to, h.label]));
  assert.equal(nach['/pages/support'], 'Kontakt & Hilfe');
  // Kein Ankertext darf 'FAQ' tragen: der Fußbereich führt diesen Begriff
  // bereits ausgeschrieben für /pages/faq, zwei Etiketten für zwei
  // verschiedene Seiten sind für den Besucher verwechselbar.
  for (const {to, label} of HUB_LINKS) {
    assert.ok(
      !/\bFAQ\b/i.test(label),
      `Ankertext von ${to} greift den FAQ-Begriff auf: ${label}`,
    );
  }
});
