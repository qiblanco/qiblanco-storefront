// Hermetische Tests des Canonical-Helpers (Auftrag
// seo-2026-w33-l11-canonical-site-weit-von-meta, Befundklasse F_canonical).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/seo-canonical.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {ohneProsa} from './_quelltext.mjs';

import {
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  CANONICAL_ORIGIN,
  NICHT_INDEXIERBARE_SEITEN,
  NICHT_INDEXIERBARE_SEITEN_DEF,
  absoluteCanonical,
  canonicalLink,
  istNichtIndexierbar,
  noindexHeader,
  noindexMeta,
} from '../app/lib/seo.js';

// --- Der eigentliche Befund: es MUSS ein <link> werden, kein <meta> ---------
// react-router-7 rendert einen meta-Descriptor nur dann als <link>, wenn
// `tagName` gesetzt und laut isValidMetaTag = /^(meta|link)$/ gültig ist.
// Ohne tagName faellt der Router auf createElement('meta', {...props}) zurück
// — genau der wirkungslose Zustand, den dieser Auftrag beseitigt.
test('canonicalLink trägt tagName=link (sonst rendert react-router <meta>)', () => {
  const d = canonicalLink('/pages/studien');
  assert.equal(d.tagName, 'link');
  assert.match(d.tagName, /^(meta|link)$/); // isValidMetaTag des Routers
  assert.equal(d.rel, 'canonical');
});

test('canonicalLink hat KEINE Keys, die der Router vorher abfaengt', () => {
  // Reihenfolge der Renderschleife: tagName -> title -> charset/charSet ->
  // script:ld+json -> Fallback <meta>. Ein versehentliches `title` würde den
  // Descriptor zu einem <title> machen.
  const d = canonicalLink('/pages/studien');
  for (const key of ['title', 'charset', 'charSet', 'script:ld+json']) {
    assert.equal(key in d, false, `Descriptor darf kein '${key}' tragen`);
  }
});

// --- Absolute URL -----------------------------------------------------------
test('absoluteCanonical macht aus einem Pfad eine absolute Produktions-URL', () => {
  assert.equal(
    absoluteCanonical('/pages/studien'),
    'https://qiblanco.com/pages/studien',
  );
  assert.equal(CANONICAL_ORIGIN, 'https://qiblanco.com');
});

test('absoluteCanonical: Root behaelt den Slash', () => {
  assert.equal(absoluteCanonical('/'), 'https://qiblanco.com/');
  assert.equal(absoluteCanonical(''), 'https://qiblanco.com/');
  assert.equal(absoluteCanonical(undefined), 'https://qiblanco.com/');
});

test('absoluteCanonical: Query und Hash fallen weg', () => {
  assert.equal(
    absoluteCanonical('/pages/studien?utm_source=meta&x=1'),
    'https://qiblanco.com/pages/studien',
  );
  assert.equal(
    absoluteCanonical('/pages/studien#abschnitt'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical: abschliessender Slash wird getrimmt (ausser Root)', () => {
  assert.equal(
    absoluteCanonical('/pages/studien/'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical: fuehrender Slash wird ergänzt', () => {
  assert.equal(
    absoluteCanonical('pages/studien'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical zeigt NIE auf einen Preview-/Oxygen-Host', () => {
  // Der Grund für absolute Canonicals: react-router merged meta nicht
  // baumweit, ein relativer Canonical würde auf Preview-Hosts die
  // Preview-URL selbst kanonisieren.
  for (const p of ['/pages/studien', '/products/qione-2-pro', '/']) {
    assert.ok(absoluteCanonical(p).startsWith('https://qiblanco.com'));
  }
});

// --- Die 5 gemeldeten Ziele des SEO-Wochenlaufs 2026-W33 --------------------
test('die gemeldeten Ziele bekommen je einen wirksamen Canonical', () => {
  const ziele = [
    '/pages/studien',
    '/pages/technologie',
    '/pages/crystal-cacao',
    '/pages/support',
    '/products/qione-2-pro',
  ];
  for (const p of ziele) {
    const d = canonicalLink(p);
    assert.equal(d.tagName, 'link');
    assert.equal(d.href, `https://qiblanco.com${p}`);
  }
});

// ===========================================================================
// Stufe S0 — Index-Hygiene (Job 20260814-seo-stufen-s0-s3-live-qiblanco)
// ===========================================================================
// Was hier GETESTET wird, ist der Vertrag: Liste + Helfer + die Naht gegen
// Listen-Drift. Was hier BEWUSST NICHT getestet wird, ist die echte Sitemap —
// eine handgebaute XML-Fixture würde meine eigene Vorstellung der Ausgabe
// messen, nicht Shopifys. Dafür gibt es die Live-Probe des nachbau-audit.

test('istNichtIndexierbar trennt die Entwicklungsseite von echten Seiten', () => {
  assert.equal(istNichtIndexierbar('development-nicht-loschen'), true);
  // Gegenprobe: der Detektor darf NICHT einfach immer true sagen.
  for (const echt of ['studien', 'technologie', 'crystal-cacao', 'support']) {
    assert.equal(istNichtIndexierbar(echt), false, `${echt} muss indexierbar bleiben`);
  }
  assert.equal(istNichtIndexierbar(undefined), false);
  assert.equal(istNichtIndexierbar(''), false);
});

test('istNichtIndexierbar trifft NICHT den laengeren Namensvetter', () => {
  // Genau die Substring-Kollision, gegen die der Sitemap-Filter auf </loc>
  // verankert ist. Hier auf der Listen-Ebene abgesichert.
  assert.equal(istNichtIndexierbar('development-nicht-loschen-2'), false);
  assert.equal(istNichtIndexierbar('development-nicht-loschen-alt'), false);
});

test('noindexMeta ist ein robots-meta, das react-router als <meta> rendert', () => {
  const d = noindexMeta();
  assert.equal(d.name, 'robots');
  assert.match(d.content, /noindex/);
  // KEIN tagName: dieser Descriptor SOLL ein <meta> werden (anders als der
  // Canonical). Ein versehentliches tagName='link' machte ihn wirkungslos.
  assert.equal('tagName' in d, false);
});

test('die Liste ist nicht leer — sonst wäre der ganze Mechanismus stumm', () => {
  // Eine Abdeckungs-Aussage über der leeren Menge ist wahr und wertlos:
  // ohne diesen Test bliebe eine versehentlich geleerte Liste unbemerkt,
  // und alle Tests oben blieben trotzdem gruen.
  assert.ok(NICHT_INDEXIERBARE_SEITEN.length >= 1);
  assert.ok(NICHT_INDEXIERBARE_SEITEN.includes('development-nicht-loschen'));
});

test('NAHT: die Sitemap-Route liest DIESELBE Quelle, statt eine zweite zu fuehren', async () => {
  // Der Sinn der geteilten Quelle ist, dass "noindex gesetzt" und "aus der
  // Sitemap raus" nicht auseinanderlaufen können. Genau das prueft dieser
  // Test — er wird rot, sobald jemand in der Sitemap-Route wieder ein eigenes
  // Handle-Literal einführt.
  //
  // UMGEDREHT AM 2026-08-23 (s05), NICHT GELOESCHT: bis dahin pinnte er
  // `pages: NICHT_INDEXIERBARE_SEITEN`, also die IDENTITAET beider Listen.
  // Genau die ist jetzt bewusst aufgegeben — die Sitemap liest die TEILMENGE
  // `AUS_SITEMAP_ENTFERNTE_SEITEN`. Was der Test schuetzt, bleibt unveraendert
  // (eine Quelle, kein zweites Array in der Route); was er pinnt, ist die neue
  // Zusage. Ein geloeschter Test haette die Drift-Sicherung mit entfernt.
  const {readFile} = await import('node:fs/promises');
  const {fileURLToPath} = await import('node:url');
  const pfad = fileURLToPath(
    new URL('../app/routes/sitemap.$type.$page[.xml].jsx', import.meta.url),
  );
  const quelle = await readFile(pfad, 'utf8');
  // Auf die VERDRAHTUNG zielen, nicht auf den Namen: ein blosses
  // /AUS_SITEMAP_ENTFERNTE_SEITEN/ trifft auch die Import-Zeile und bliebe
  // gruen, wenn jemand die Liste importiert und trotzdem ein eigenes Array
  // einhaengt (im Mutationstest genau so passiert).
  // NACHGEZOGEN AM 2026-09-13, NICHT AUFGEWEICHT: `pages` hängt jetzt an
  // `NICHT_IN_PAGES_SITEMAP` — der Vereinigung aus der noindex-Teilmenge und
  // den WEITERGELEITETEN Handles (~/lib/sitemap-weiterleitungen). Zwei Klassen
  // fliegen aus derselben Sitemap, und sie sind nicht dasselbe: ein `noindex`
  // widerspricht dem Sitemap-Eintrag, ein 301 widerspricht ihm aus einem
  // anderen Grund. Was dieser Test schuetzt, ist unveraendert (EIN Name in der
  // Verdrahtung, kein Handle-Literal in der Route); was er pinnt, ist die neue
  // Zusage — dieselbe Bewegung wie am 2026-08-23, als er von der Identitaet
  // auf die Teilmenge umgestellt wurde.
  assert.match(
    quelle,
    /pages:\s*NICHT_IN_PAGES_SITEMAP/,
    'pages muss AN die EINE vereinigte Sicht gehaengt sein, nicht an ein eigenes Array',
  );
  // Die Vereinigung selbst darf nur aus den beiden abgeleiteten Quellen
  // bestehen — sonst wäre sie das zweite Array durch die Hintertür.
  assert.match(
    quelle,
    /const NICHT_IN_PAGES_SITEMAP = \[\s*\.\.\.AUS_SITEMAP_ENTFERNTE_SEITEN,\s*\.\.\.WEITERGELEITETE_PAGES_HANDLES,\s*\]/,
    'die Vereinigung muss aus genau den beiden Quellen gebildet sein',
  );
  assert.match(quelle, /from\s+'~\/lib\/seo'/, 'Import muss aus ~/lib/seo kommen');
  for (const handle of NICHT_INDEXIERBARE_SEITEN) {
    assert.equal(
      quelle.includes(`'${handle}'`),
      false,
      `Sitemap darf '${handle}' NICHT als eigenes Literal fuehren (Listen-Drift)`,
    );
  }
  // Positiv-Kontrolle: die Datei wurde wirklich gelesen und ist die richtige.
  assert.match(quelle, /getSitemap/, 'Fixture-Kontrolle: das ist die Sitemap-Route');
});

// --- Die neue Naht: noindex und Sitemap-Entfernung sind ZEITLICH getrennt ---
// Der teure Befund von s05: ein einziger Listeneintrag loeste beide Wirkungen
// gleichzeitig aus. Für eine Seite OHNE eingehende interne Links ist die
// Sitemap der einzige Weg, auf dem Google das frische `noindex` je liest —
// wer sie im selben Deploy dort herausnimmt, friert sie im Index ein.

test('NAHT: die Sitemap-Sicht ist eine echte TEILMENGE der noindex-Sicht', () => {
  // Die Richtung ist tragend: aus der Sitemap darf nur fliegen, was ohnehin
  // schon noindex trägt. Umgekehrt entstuende genau der Zustand, den dieser
  // ganze Mechanismus verhindern soll — unauffindbar, aber indexierbar.
  for (const handle of AUS_SITEMAP_ENTFERNTE_SEITEN) {
    assert.ok(
      NICHT_INDEXIERBARE_SEITEN.includes(handle),
      `${handle} fliegt aus der Sitemap, trägt aber kein noindex`,
    );
  }
  assert.ok(
    AUS_SITEMAP_ENTFERNTE_SEITEN.length <= NICHT_INDEXIERBARE_SEITEN.length,
  );
});

// ABGEBAUT 2026-09-13: „NAHT: pre-access trägt noindex und bleibt VORERST in
// der Sitemap" — die Zusage wurde EINGELÖST, nicht gebrochen.
//
// Der Arm war eine Stolperdraht-Zusicherung auf einen HANDGEPFLEGTEN Wert:
// `pre-access` sollte `ausSitemap: false` behalten, bis das noindex gewirkt
// hat. Er sollte laut eigenem Kommentar „die Stelle sein, an der man ihn
// spaeter bewusst umdreht". Genau das ist passiert: PR #383 (75e7517,
// 2026-09-12) hat die Übergangsstufe aufgelöst und 19 Einträge auf
// `ausSitemap: true` gekippt, `pre-access` als ersten — gemessen mit
// `gsc-seitenstand` an allen 16 damaligen Einträgen, Lesart je
// `coverageState` im Kopf von ~/lib/seo.js. Der Draht ist also gerissen, wie
// vorgesehen; zurückgesetzt hat ihn niemand. Er stand von 75e7517 bis
// 2026-09-13 rot (Job 20260913-drei-rote-testarme-…).
//
// WARUM HIER KEIN ERSATZ-ARM STEHT, sondern nur diese Notiz:
//  (a) Eine allgemeine Fassung („wer ausSitemap:false trägt, steht nicht in
//      AUS_SITEMAP_ENTFERNTE_SEITEN") wäre GRUEN AUS KONSTRUKTION.
//      `AUS_SITEMAP_ENTFERNTE_SEITEN` ist `…_DEF.filter((e) => e.ausSitemap)`
//      — beide Seiten der Gleichung kommen aus demselben Feld, die Aussage
//      kann gar nicht falsch werden. Dasselbe gilt für `istNichtIndexierbar`.
//      Ein Arm, der nicht rot werden kann, ist kein Schutz, sondern ein
//      Platzhalter, der wie einer aussieht.
//  (b) Die Frage, die WIRKLICH etwas beweist — hält der SITEMAP-LESER sich an
//      die Liste? — ist bereits gebaut und nicht konstruktionsgruen:
//      `test/sitemap-nur-route-seiten.test.mjs` faehrt die echte Route gegen
//      eine Storefront-Attrappe, entfernt `AUS_SITEMAP_ENTFERNTE_SEITEN[0]`
//      (zur Laufzeit gewählt, nicht als Handle benannt) und prueft in der
//      Gegenrichtung, dass ein NICHT versteckter Handle stehenbleibt. Beides
//      hier zu doppeln wäre P10-Bruch.
//
// Wer die Übergangsstufe für einen neuen Handle wieder braucht, findet ihre
// Begründung und die Auflösungsbedingung im Kopf von ~/lib/seo.js — nicht in
// einem Arm, der eine Jahreszahl alt wird.

test('NAHT: development-nicht-loschen bleibt in BEIDEN Sichten (kein Rueckschritt)', () => {
  // Der Bestandsfall darf durch die Umstellung nichts verlieren.
  assert.equal(istNichtIndexierbar('development-nicht-loschen'), true);
  assert.ok(AUS_SITEMAP_ENTFERNTE_SEITEN.includes('development-nicht-loschen'));
});

test('jeder Definitionseintrag trägt Handle, Sitemap-Entscheid UND Begründung', () => {
  // Ohne `grund` wäre die Liste in einem halben Jahr eine Sammlung von
  // Zeichenketten, die niemand mehr zu entfernen wagt.
  assert.ok(NICHT_INDEXIERBARE_SEITEN_DEF.length >= 2);
  for (const e of NICHT_INDEXIERBARE_SEITEN_DEF) {
    assert.equal(typeof e.handle, 'string');
    assert.ok(e.handle.length > 0);
    assert.equal(typeof e.ausSitemap, 'boolean', `${e.handle}: ausSitemap fehlt`);
    assert.ok(e.grund && e.grund.length > 10, `${e.handle}: Begründung fehlt`);
  }
  // Keine Dublette — ein doppelter Handle wäre still folgenlos und ein
  // Zeichen dafür, dass zwei Leute dieselbe Seite unabhängig eingetragen haben.
  assert.equal(
    new Set(NICHT_INDEXIERBARE_SEITEN).size,
    NICHT_INDEXIERBARE_SEITEN.length,
  );
});

test('noindexHeader ist der X-Robots-Tag mit demselben Wortlaut wie die Einzelrouten', () => {
  const h = noindexHeader();
  assert.deepEqual(Object.keys(h), ['X-Robots-Tag']);
  assert.match(h['X-Robots-Tag'], /noindex/);
  assert.match(h['X-Robots-Tag'], /nofollow/);
});

test('NAHT: die Page-Route verdrahtet auch die ZWEITE Haelfte des Doppelgates', async () => {
  // Gegenstueck zum meta()-Verdrahtungstest unten, und aus demselben Grund
  // eine Quelltext-Prüfung: die Route lässt sich in nacktem node nicht
  // importieren. Geprueft wird die KETTE, nicht die Existenz eines Namens —
  // ein `headers`-Export allein bewirkt nichts, wenn der Loader den Header
  // nie setzt, und ein gesetzter Loader-Header erreicht das Dokument nie
  // ohne den `headers`-Export.
  const {readFile} = await import('node:fs/promises');
  const {fileURLToPath} = await import('node:url');
  const quelle = await readFile(
    fileURLToPath(new URL('../app/routes/pages.$handle.jsx', import.meta.url)),
    'utf8',
  );
  assert.match(quelle, /getSitemap|export async function loader/, 'Fixture-Kontrolle');
  assert.match(quelle, /noindexHeader\(\)/, 'der Loader muss den Header AUSGEBEN');
  assert.match(
    quelle,
    /export const headers\s*=/,
    'ohne headers-Export erreicht der Loader-Header das Dokument nie',
  );
  assert.match(
    quelle,
    /loaderHeaders\??\.get\('X-Robots-Tag'\)/,
    'der headers-Export muss genau diesen Header durchreichen',
  );
  assert.match(
    quelle,
    /new Headers\(parentHeaders\)/,
    'Elternheader müssen geerbt statt ersetzt werden',
  );
});

test('NAHT: die Page-Route verdrahtet den noindex wirklich in ihr meta()', async () => {
  // Dieser Test existiert wegen eines EIGENEN Messfehlers: die Tests oben
  // prüfen den Helfer-Vertrag und die Sitemap-Naht — beim Mutationstest
  // blieben aber ALLE 14 gruen, als `tags.push(noindexMeta())` aus der Route
  // entfernt wurde. Ein Orakel, das die Verdrahtung nicht prueft, kodiert nur
  // eine FORM des Defekts. Bewusst eine Quelltext-Prüfung: die Route lässt
  // sich in nacktem node nicht importieren (~/-Alias + react-router), und die
  // Naht ist hier statisch (ein Aufruf), nicht dynamisch.
  const {readFile} = await import('node:fs/promises');
  const {fileURLToPath} = await import('node:url');
  const quelle = await readFile(
    fileURLToPath(new URL('../app/routes/pages.$handle.jsx', import.meta.url)),
    'utf8',
  );
  assert.match(quelle, /getriebe|export const meta/, 'Fixture-Kontrolle: Route hat ein meta()');
  assert.match(quelle, /istNichtIndexierbar\(/, 'meta() muss die Liste ABFRAGEN');
  assert.match(quelle, /noindexMeta\(\)/, 'meta() muss den noindex-Descriptor AUSGEBEN');
  assert.match(quelle, /from\s+'~\/lib\/seo'/, 'beides muss aus der geteilten Quelle kommen');
});

// ===========================================================================
// s04 (2026-08-26): ENTWEDER noindex ODER canonical — nie beides
// ---------------------------------------------------------------------------
// Anlass: 49 DACH-Seiten lieferten gar keinen canonical. Live gemessen trugen
// 30 davon bereits `noindex` — ihr fehlender canonical war also KEIN Defekt,
// sondern die schon in `pages.uebersicht.jsx` niedergeschriebene Entscheidung
// („noindex plus ein canonical auf eine andere URL sind widersprüchliche
// Signale"). Diese Tests halten genau diese Ausschließlichkeit fest, damit
// ein späterer Lauf sie nicht als vermeintliche Lücke wieder aufmacht.
// ===========================================================================

// GEMESSEN WIRD DER PROGRAMMTEXT, NICHT DIE BEGRÜNDUNG. Die Routen dieses
// Repos erklären ihre SEO-Regeln ausfuehrlich im Kommentar — `pages.$handle`
// zitiert die Regel „noindex plus canonical sind widersprüchliche Signale"
// woertlich. Ein Muster, das in dieser Prosa Halt findet, misst die Erklaerung
// statt den Code; dieselbe Klasse hielt `test/neu-oder-gebraucht.test.mjs`
// seit seinem Geburts-Commit rot. Der Helfer steht in ./_quelltext.mjs.
const s04Quelle = async (datei) => {
  const {readFile} = await import('node:fs/promises');
  const {fileURLToPath} = await import('node:url');
  return ohneProsa(
    await readFile(
      fileURLToPath(new URL(`../app/${datei}`, import.meta.url)),
      'utf8',
    ),
  );
};

/**
 * DER BLOCK HINTER EINEM `if (<wachter>(…))` UND SEIN `else if`-ZWEIG.
 *
 * Warum geklammert statt per Regex: die Vorfassung verlangte
 * `\{[^}]*canonicalLink\(` — „zwischen der Klammer und dem Aufruf steht kein
 * `}`". Das war nie eine Eigenschaft des Codes, sondern seiner SCHREIBWEISE,
 * und ein Template-Literal bringt eine schliessende Klammer mit: seit
 * 388fa8c (#388) steht im else-Zweig `const pfad = \`/pages/${params.handle}\`;`
 * — das `}` von `${…}` beendete die Zeichenklasse, und der Arm stand rot,
 * obwohl die zugesicherte STRUKTUR unveraendert da war. Gezählt werden
 * deshalb Klammern.
 */
const zweigeNach = (quelle, wachter) => {
  const kopf = new RegExp(`if\\s*\\(\\s*${wachter}\\s*\\(`);
  const t = quelle.match(kopf);
  assert.ok(t, `kein \`if (${wachter}(…))\` in der Quelle`);
  const block = (ab) => {
    const auf = quelle.indexOf('{', ab);
    assert.ok(auf > -1, 'Block-Klammer nicht gefunden');
    let tiefe = 0;
    for (let i = auf; i < quelle.length; i += 1) {
      if (quelle[i] === '{') tiefe += 1;
      else if (quelle[i] === '}') {
        tiefe -= 1;
        if (tiefe === 0) return {rumpf: quelle.slice(auf + 1, i), ende: i};
      }
    }
    throw new Error('unbalancierte Klammern');
  };
  const wenn = block(t.index);
  const rest = quelle.slice(wenn.ende + 1);
  const sonst = /^\s*else\s+if\s*\(/.test(rest)
    ? block(wenn.ende + 1 + rest.indexOf('else'))
    : null;
  return {wenn: wenn.rumpf, sonst: sonst && sonst.rumpf};
};

test('s04: die fünf leeren Restseiten stehen in der noindex-Liste', () => {
  for (const handle of [
    'qiblanco',
    'linkseite',
    'one-inch',
    'ketogenes-wochenende',
    'superhuman-kurs',
  ]) {
    assert.equal(istNichtIndexierbar(handle), true, `${handle} muss noindex tragen`);
  }
});

test('s04: die Kollektions-Liste kennt nur INTERNE Handles, keine Kategorien', async () => {
  const {
    NICHT_INDEXIERBARE_KOLLEKTIONEN,
    istNichtIndexierbareKollektion,
  } = await import('../app/lib/seo.js');
  for (const handle of [
    'frontpage',
    'products',
    'slider',
    'cross-selling',
    'digital-goods-vat-tax',
  ]) {
    assert.equal(istNichtIndexierbareKollektion(handle), true, `${handle} ist intern`);
  }
  // GEGENFALL — der eigentliche Zweck dieses Tests: eine heute LEERE
  // Saison-Kollektion ist trotzdem eine echte Kundenkategorie. Wer sie aus
  // Bequemlichkeit mit aufnimmt, nimmt dem Shop eine Kategorie aus dem Index,
  // die nächste Saison wieder gefüllt wird.
  for (const handle of [
    'valentinstag-angebote',
    'blackfriday-sale-artikel',
    'digitale-kurse',
    'zeremonie-kakao',
    'all',
  ]) {
    assert.equal(
      istNichtIndexierbareKollektion(handle),
      false,
      `${handle} ist eine Kundenkategorie und darf NICHT noindex sein`,
    );
  }
  assert.equal(NICHT_INDEXIERBARE_KOLLEKTIONEN.length, 5);
});

test('s04: kein Handle steht zugleich in der Seiten- UND der Kollektions-Liste', async () => {
  // Getrennte Namensräume sind erlaubt und gewollt — eine ÜBERSCHNEIDUNG wäre
  // aber fast sicher ein Kopierfehler, weil kein Handle beides sein kann.
  const {NICHT_INDEXIERBARE_KOLLEKTIONEN} = await import('../app/lib/seo.js');
  const doppelt = NICHT_INDEXIERBARE_KOLLEKTIONEN.filter((h) =>
    NICHT_INDEXIERBARE_SEITEN.includes(h),
  );
  assert.deepEqual(doppelt, []);
});

test('s04 NAHT: die Page-Route setzt den canonical im else-Zweig des noindex', async () => {
  // Die STRUKTUR ist der Gegenstand, nicht die blosse Anwesenheit beider
  // Aufrufe: ein `tags.push(canonicalLink(...))` VOR oder NEBEN dem
  // noindex-Zweig erzeugt genau das widersprüchliche Signalpaar. Der Test
  // verlangt deshalb die Kette if(noindex){…} else if(…){canonicalLink}.
  const quelle = await s04Quelle('routes/pages.$handle.jsx');
  const {wenn, sonst} = zweigeNach(quelle, 'istNichtIndexierbar');

  // Die noindex-Hälfte steht im if — und der canonical steht dort NICHT.
  assert.match(wenn, /noindexMeta\(\)/, 'der if-Zweig muss noindex setzen');
  assert.ok(
    !/canonicalLink\(/.test(wenn),
    'canonical im noindex-Zweig — genau das widersprüchliche Signalpaar',
  );

  // …und die canonical-Hälfte steht im else if, also unerreichbar für eine
  // Seite, die gerade auf noindex gesetzt wird.
  assert.ok(sonst, 'dem noindex-Zweig muss ein `else if` folgen');
  assert.match(sonst, /canonicalLink\(/, 'canonical muss im else-Zweig stehen');

  // Der canonical zeigt auf den Handle, unter dem Shopify die Seite führt.
  // Gemessen wird das ZIEL, nicht die Schreibweise: seit 388fa8c (#388) geht
  // der Pfad über eine Zwischenvariable, weil `seitenSignale` denselben Wert
  // braucht — `canonicalLink(`/pages/${params.handle}`)` als Literal zu
  // verlangen hiesse, diese Zusammenfuehrung zu verbieten.
  assert.match(
    sonst,
    /`\/pages\/\$\{params\.handle\}`/,
    'der canonical-Pfad muss aus params.handle gebaut sein',
  );
  // Kein zweiter canonical ausserhalb der Verzweigung.
  assert.equal(
    (quelle.match(/canonicalLink\(/g) || []).length,
    1,
    'canonicalLink darf genau einmal vorkommen',
  );
});

test('s04 NAHT: die Kollektions-Route trägt beide Hälften und schließt sie aus', async () => {
  const quelle = await s04Quelle('routes/collections.$handle.jsx');
  // noindex-Zweig verlässt meta() SOFORT (return), erreicht den canonical also nie.
  assert.match(
    quelle,
    /if\s*\(\s*istNichtIndexierbareKollektion\([^)]*\)\s*\)\s*\{[^}]*noindexMeta\(\)[^}]*return\s+tags;[^}]*\}/s,
    'der noindex-Zweig muss vor dem canonical zurückkehren',
  );
  assert.match(quelle, /canonicalLink\(`\/collections\/\$\{params\.handle\}`\)/);
  // Zweite Hälfte des Doppelgates: Loader-Header UND headers-Export.
  assert.match(quelle, /noindexHeader\(\)/, 'Loader muss X-Robots-Tag setzen');
  assert.match(quelle, /export const headers\s*=/, 'headers-Export muss ihn durchreichen');
  assert.match(quelle, /loaderHeaders\?\.get\('X-Robots-Tag'\)/);
});

test('s04 NAHT: /cart trägt noindex und BEWUSST keinen canonical', async () => {
  const quelle = await s04Quelle('routes/cart.jsx');
  assert.match(quelle, /noindexMeta\(\)/, '/cart muss noindex tragen');
  assert.equal(
    /canonicalLink\(/.test(quelle),
    false,
    '/cart darf KEINEN canonical tragen (widersprüchliches Signalpaar)',
  );
});

test('s04 NAHT: Kategorie- und Rechtstext-Routen setzen einen Selbst-canonical', async () => {
  assert.match(
    await s04Quelle('routes/collections.all.jsx'),
    /canonicalLink\('\/collections\/all'\)/,
  );
  // ZWEI ZUSICHERUNGEN STATT EINER WORTLAUT-PINNUNG (2026-09-13, Job 20260912-
  // sieben-indexierbare-seiten-ohne-sitemap-und-ohne-auszeichnung-prio22):
  // bis hierher stand hier EIN Regex auf den genauen Aufruf
  // `canonicalLink(\`/policies/${params.handle}\`)`. Die Route baut den Pfad
  // jetzt in eine Konstante, weil ihn seit diesem Job ZWEI Aufrufer brauchen
  // (canonicalLink und seitenSignale) — derselbe Pfad zweimal getippt wäre die
  // Drift, gegen die dieser Test antritt. Der alte Regex war damit rot, obwohl
  // der Canonical unveraendert gesetzt wird: ein gepinnter WORTLAUT misst die
  // Schreibweise, nicht die Zusage. Gepruefert wird deshalb beides einzeln —
  // DASS die Route einen Canonical setzt, und DASS ihr Pfad aus dem
  // angefragten Handle entsteht. Zusammen ist das dieselbe Zusage, ohne die
  // Schreibweise festzuschreiben.
  const policies = await s04Quelle('routes/policies.$handle.jsx');
  assert.match(policies, /canonicalLink\(/, 'Rechtstext-Route braucht einen canonical');
  assert.match(
    policies,
    /`\/policies\/\$\{params\.handle\}`/,
    'der canonical-Pfad muss aus params.handle entstehen, nicht aus den Daten',
  );
});


// --- Die zweite Klasse: WEITERGELEITETE Handles (neu 2026-09-13) ---
// Gemessen an diesem Tag: 2 von 44 URLs der ausgelieferten `sitemap/pages/1.xml`
// antworteten mit 301. Die Sitemap sagt dann „das ist die kanonische URL", die
// Antwort sagt „nein, eine andere".

test('NAHT: weitergeleitete Handles sind eine EIGENE Klasse, nicht noindex', async () => {
  const {WEITERGELEITETE_PAGES_DEF, WEITERGELEITETE_PAGES_HANDLES} =
    await import('../app/lib/sitemap-weiterleitungen.js');

  // Die Richtung ist tragend und der Grund für die eigene Datei: eine
  // 301-Antwort hat keinen Rumpf und kann gar kein `noindex` tragen. Stuende
  // ein Handle in beiden Listen, wäre eine der beiden Begründungen falsch.
  for (const handle of WEITERGELEITETE_PAGES_HANDLES) {
    assert.equal(
      NICHT_INDEXIERBARE_SEITEN.includes(handle),
      false,
      `${handle} ist weitergeleitet UND als noindex geführt — eine der beiden Begruendungen stimmt nicht`,
    );
  }

  // Jeder Eintrag muss seinen Grund und sein Ziel nennen: eine Liste ohne
  // Begründung ist in einem Jahr nicht mehr entscheidbar.
  for (const e of WEITERGELEITETE_PAGES_DEF) {
    assert.ok(e.handle && !e.handle.startsWith('/'), 'handle ist ein Handle, kein Pfad');
    assert.match(e.ziel, /^\//, `${e.handle}: ziel muss ein Pfad sein`);
    assert.ok(e.grund && e.grund.length > 40, `${e.handle}: grund fehlt oder ist zu dünn`);
    assert.match(e.seit, /^\d{4}-\d{2}-\d{2}$/, `${e.handle}: seit fehlt`);
  }

  // Leer-Kontrolle: eine versehentlich geleerte Liste bliebe sonst unbemerkt,
  // und alle Zusagen darüber blieben grün.
  assert.ok(WEITERGELEITETE_PAGES_HANDLES.length >= 1);
});
