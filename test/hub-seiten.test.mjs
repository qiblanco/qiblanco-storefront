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
    // Seit 2026-10-06 importiert Footer.jsx aus derselben Datei auch die
    // Fußspalte „Wissen & Vertrauen"; geprüft wird, dass themenLinks dabei ist.
    /import\s*\{[^}]*\bthemenLinks\b[^}]*\}\s*from\s*'~\/lib\/hub-seiten'/,
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

/* ==========================================================================
 * WISSEN & VERTRAUEN (Großjob 20261006-GROSSJOB-seo-strategie-seiten-
 * bewertung-crawl-kannibalisierung, Segment s06): Fußspalte, Übersicht
 * /pages/wissen-und-vertrauen und Leiste „Weiterlesen" aus EINER Liste.
 * Geprüft werden die Eigenschaften, deren Verletzung Schaden macht: die Liste
 * erreicht alle drei Flächen, der Fuß bleibt schlank und ohne Dublette, die
 * Zweifelsseiten bleiben aus dem Fuß, jedes Ziel und jedes Geschwister
 * existiert als Route, die Leiste steht außerhalb von <main>.
 * ======================================================================== */
import {existsSync} from 'node:fs';
import {
  WV_GRUPPEN,
  WV_HUB,
  wvSeiten,
  wvFussLinks,
  wvWeiterFuer,
} from '../app/lib/hub-seiten.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {FRAGEN} from '../app/data/fragen.js';
import {LEXIKON, zielName} from '../app/data/lexikon.js';

const quelle = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const LAYOUT = quelle('app/components/PageLayout.jsx');
const HUB_KOMP = quelle('app/components/campaign/WissenVertrauenHub.jsx');
const HUB_ROUTE = quelle('app/routes/pages.wissen-und-vertrauen.jsx');
const LEX_HUB = quelle('app/components/campaign/LexikonHub.jsx');
const routeDa = (to) =>
  existsSync(new URL(`../app/routes/pages.${to.replace(/^\/pages\//, '')}.jsx`, import.meta.url));

test('WV: die Fußspalte ist verdrahtet und rendert wvFussLinks', () => {
  assert.match(FOOTER, /import\s*\{[^}]*\bwvFussLinks\b[^}]*\}\s*from\s*'~\/lib\/hub-seiten'/);
  assert.match(FOOTER, /wvFussLinks\(\)\.map\(/, 'Footer.jsx rendert die Spalte nicht');
  assert.match(FOOTER, /<FooterWissenVertrauen\s*\/>/, 'die Spalte hängt nicht im Fuß');
  assert.match(FOOTER, /<details[\s\S]*?className="footer-wv"/, 'die Spalte ist nicht zuklappbar');
});

test('WV: Fußspalte höchstens fünf Seiten plus Übersicht, Übersicht zuletzt', () => {
  const fuss = wvFussLinks();
  assert.ok(fuss.length >= 2 && fuss.length <= 6, `Fußspalte hat ${fuss.length} Links`);
  assert.equal(fuss.at(-1).to, WV_HUB.to, 'der letzte Link der Spalte ist nicht die Übersicht');
  assert.equal(new Set(fuss.map((l) => l.to)).size, fuss.length, 'Dublette in der Spalte');
});

test('WV: kein Ziel der Spalte steht schon anderswo im Fuß', () => {
  for (const {to} of wvFussLinks()) {
    assert.ok(
      !FOOTER.includes(`'${to}'`),
      `${to} steht literal in Footer.jsx UND in der Spalte — zwei Links auf dasselbe Ziel`,
    );
  }
  for (const {to} of wvFussLinks()) {
    assert.ok(!hubPfade().includes(to), `${to} steht auch in HUB_LINKS ("Themen")`);
  }
});

test('WV: Zweifelsseiten bleiben aus der Fußspalte (Kaufpfad-Zaun)', () => {
  const zaun = [
    '/pages/kritik',
    '/pages/hypothesen',
    ['/pages/was-auf-reddit', 'ber-qi-blanco-steht'].join('-ue'),
  ];
  const fussZiele = new Set(wvFussLinks().map((l) => l.to));
  for (const z of zaun) {
    assert.ok(wvSeiten().some((s) => s.to === z), `${z} fehlt in der Übersicht`);
    assert.ok(!fussZiele.has(z), `${z} steht als eigener Link in der Fußspalte`);
  }
});

test('WV: jedes Ziel ist eine Route, jedes Geschwister ein Mitglied', () => {
  const pfade = new Set(wvSeiten().map((s) => s.to));
  assert.equal(pfade.size, wvSeiten().length, 'ein Pfad steht zweimal in WV_GRUPPEN');
  assert.ok(routeDa(WV_HUB.to), 'die Route der Übersicht fehlt');
  for (const s of wvSeiten()) {
    assert.match(s.to, /^\/pages\/[a-z0-9-]+$/, `kein sauberer Pfad: ${s.to}`);
    assert.ok(routeDa(s.to), `${s.to}: keine Route app/routes/pages.<slug>.jsx`);
    if (s.weiter) {
      assert.ok(s.weiter.length >= 1 && s.weiter.length <= 2, `${s.to}: ${s.weiter.length} Geschwister`);
      for (const g of s.weiter) {
        assert.ok(pfade.has(g), `${s.to}: Geschwister ${g} steht nicht in der Übersicht`);
        assert.notEqual(g, s.to, `${s.to} nennt sich selbst als Geschwister`);
      }
    }
  }
  for (const g of WV_GRUPPEN) assert.ok(g.seiten.length >= 2, `Gruppe ${g.id} ist leer`);
});

test('WV: Ankertext, Kurzname und Teaser tragen echte Umlaute; Teaser ist EIN Satz', () => {
  // „Frequenz", „neue", „Bauer" tragen die Folge legitim: nach q, e und a
  // ist sie kein Umlaut-Ersatz.
  const digraph = new RegExp(`((?<![qea])${'u'}e|${'o'}e|${'a'}e)`, 'i');
  for (const s of wvSeiten()) {
    for (const [feld, wert] of [['label', s.label], ['fuss', s.fuss], ['teaser', s.teaser]]) {
      if (wert === undefined) continue;
      assert.ok(!digraph.test(wert), `${s.to} ${feld}: ASCII-Transliteration in "${wert}"`);
    }
    assert.match(s.teaser, /^[^.!?]+[.?!]$/, `${s.to}: Teaser ist nicht genau ein Satz`);
    assert.ok(s.teaser.split(/\s+/).length <= 30, `${s.to}: Teaser über 30 Wörter`);
    assert.ok(!/[–—]/.test(s.teaser + s.label), `${s.to}: Gedankenstrich im Kundentext`);
  }
});

test('WV: Leiste für Mitglieder, nichts für andere Seiten, Pfad normalisiert', () => {
  const k = wvWeiterFuer('/pages/kritik');
  assert.ok(k && k.geschwister.length >= 1 && k.hub.to === WV_HUB.to);
  assert.deepEqual(wvWeiterFuer('/EN-US/pages/kritik/'), k, 'Länderpräfix/Schrägstrich ändern die Leiste');
  assert.equal(wvWeiterFuer('/products/qione-2-pro'), null, 'Leiste auf einer Kaufseite');
  assert.equal(wvWeiterFuer('/'), null, 'Leiste auf der Startseite');
  assert.equal(wvWeiterFuer('/pages/studien'), null, 'Leiste auf /pages/studien (SERP-Messphase m03)');
  // Mechanik an einer eigenen Liste: ein Geschwister, das es nicht gibt,
  // fällt still heraus statt einen toten Link zu rendern.
  const eigen = [{id: 'x', titel: 'X', seiten: [
    {to: '/pages/a', label: 'A', teaser: 'A.', weiter: ['/pages/b', '/pages/fehlt']},
    {to: '/pages/b', label: 'B', teaser: 'B.'},
  ]}];
  assert.deepEqual(wvWeiterFuer('/pages/a', eigen).geschwister.map((g) => g.to), ['/pages/b']);
  assert.equal(wvWeiterFuer('/pages/b', eigen), null);
});

test('WV: die Leiste steht im Layout NACH </main>, nicht darin', () => {
  const i = LAYOUT.indexOf('<main>{children}</main>');
  const j = LAYOUT.indexOf('<WissenVertrauenWeiter />');
  const f = LAYOUT.indexOf('<Footer');
  assert.ok(i >= 0 && j > i && f > j, 'Leiste nicht zwischen </main> und <Footer>');
});

test('WV: die Übersicht rendert alle Gruppen aus der Liste und steht in der Sitemap', () => {
  assert.match(HUB_KOMP, /WV_GRUPPEN\.map\(/);
  assert.match(HUB_KOMP, /g\.seiten\.map\(/);
  assert.match(HUB_ROUTE, /canonicalLink\(PFAD\)/);
  assert.ok(!/noindex/.test(HUB_ROUTE), 'noindex in der Übersicht');
  const e = NUR_ROUTE_SEITEN.find((x) => x.pfad === WV_HUB.to);
  assert.ok(e && e.lastmod, 'Übersicht fehlt in NUR_ROUTE_SEITEN');
  // Titel ohne die Suchbegriffe der Seiten, die sie stärken soll.
  const titel = HUB_ROUTE.match(/const TITEL = `([^`]+)`/)[1];
  assert.ok(!/erfahrung|seri|kritik|bewertung/i.test(titel), `Titel konkurriert: ${titel}`);
});

test('WV: Lexikon und „Was ist Elektrosmog?" verlinken sich gegenseitig', () => {
  const frage = FRAGEN.find((s) => s.slug === 'was-ist-elektrosmog');
  assert.ok(frage.weiter.some((w) => w.pfad === '/pages/lexikon'), 'Frage -> Lexikon fehlt');
  const eintrag = LEXIKON.find((e) => e.slug === 'lexikon-elektrosmog');
  assert.equal(eintrag.frage, '/pages/was-ist-elektrosmog');
  assert.equal(zielName(eintrag.frage), 'Was ist Elektrosmog?');
  assert.match(LEX_HUB, /e\.frage && zielName\(e\.frage\)/, 'Lexikon-Hub rendert `frage` nicht');
});
