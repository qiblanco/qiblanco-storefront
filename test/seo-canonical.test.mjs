// Hermetische Tests des Canonical-Helpers (Auftrag
// seo-2026-w33-l11-canonical-site-weit-von-meta, Befundklasse F_canonical).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/seo-canonical.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

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
  // Handle-Literal einfuehrt.
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
  assert.match(
    quelle,
    /pages:\s*AUS_SITEMAP_ENTFERNTE_SEITEN/,
    'pages muss AN die abgeleitete Sitemap-Sicht gehaengt sein, nicht an ein eigenes Array',
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

test('NAHT: pre-access trägt noindex und bleibt VORERST in der Sitemap', () => {
  // Der konkrete Fall, wegen dem die Trennung gebaut wurde. Dieser Test wird
  // rot, wenn jemand den Eintrag auf ausSitemap:true kippt, BEVOR das noindex
  // gewirkt hat — und er ist damit auch die Stelle, an der man ihn spaeter
  // bewusst umdreht statt es nebenbei zu tun.
  assert.equal(istNichtIndexierbar('pre-access'), true);
  assert.equal(
    AUS_SITEMAP_ENTFERNTE_SEITEN.includes('pre-access'),
    false,
    'pre-access darf noch NICHT aus der Sitemap fliegen (Discovery-Pfad)',
  );
});

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
