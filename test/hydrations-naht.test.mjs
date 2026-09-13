/**
 * HYDRATIONS-NAHT: Markup, das der Server anders schreibt, als der Browser es liest.
 *
 * ANLASS (Job 20260913-huelle-hydration-...-prio30). Auf JEDER Seite von
 * qiblanco.com meldete React beim Hydrieren Fehler in Serie -- gemessen am
 * 2026-09-13 auf /search 15x #418 + 1x #423 je Viewport. Die Design-Rubrik zog
 * dafür 60 der 100 Hygiene-Punkte ab. Es waren ZWEI voneinander unabhaengige
 * Ursachen, und beide sind am Quelltext erkennbar:
 *
 *   1. <dialog> in einem <p> (Fuß). Der HTML-Parser schließt das <p> davor
 *      und hebt den Dialog heraus -> ab da hydriert React gegen einen
 *      verschobenen Baum. Wächter dafür: test/eu-gewaehrleistung.test.mjs.
 *
 *   2. <style>{`... input[type='text'] ...`}</style> im React-Baum (dieser
 *      Wächter). Das ist der Fall unten.
 *
 *   3. Ein von React gerendertes <script> im <head> (Job 20260913-head-ohne-
 *      react-scripts-...-prio22). Hier schreibt der Server nichts falsch --
 *      ein FREMDER hängt zur Laufzeit dazwischen. Cookiebot sucht
 *      `document.getElementsByTagName("script")[0]` und fuegt seine zwei
 *      eigenen Skripte davor in DESSEN Elternknoten ein. Ist dieses erste
 *      Skript ein React-Knoten im <head>, verschieben sich alle Geschwister
 *      dahinter und React hydriert gegen einen verschobenen Baum -- dieselbe
 *      Folge wie bei 1., anderer Weg dorthin. Die Wächter dafür stehen
 *      ebenfalls unten.
 *
 * WARUM EIN <style> MIT TEXTKIND BRICHT, und warum es zugleich still kaputt ist:
 * React MASKIERT Textkinder beim Serverrendern. Aus input[type='text'] wird im
 * SSR-HTML input[type=&#x27;text&#x27;]. <style> ist aber ein RAW-TEXT-Element --
 * der HTML-Parser löst Maskierungen darin NICHT auf. Also gilt beides:
 *   - der Client-Baum trägt ', der Server-Baum &#x27;  -> Hydrations-Bruch (#425),
 *   - und der ausgelieferte Selektor ist UNGUELTIG      -> die Regel greift nicht.
 * Der zweite Schaden ist der groessere: die Regeln sind bis zur Hydration tot,
 * und das sieht man der Seite nicht an.
 *
 * DIE EIGENSCHAFT, NICHT DER ORT: gemessen wird nicht "gibt es ein <style>",
 * sondern "enthält sein Textkind ein Zeichen, das React maskiert". Ein
 * <style>{`.a .b{margin-top:30px;}`}</style> ist völlig in Ordnung und bleibt
 * es -- app/components/product-pages/QiOne2Pro.jsx tut genau das.
 *
 * DER RICHTIGE WEG, wenn CSS wirklich in die Komponente muss, ist
 * dangerouslySetInnerHTML (app/components/ShopSwitch.jsx macht es vor): dort
 * maskiert React nicht. Besser ist eine Datei unter app/styles/.
 *
 * KALIBRIERT AM ECHTBESTAND, bevor dieser Wächter scharf wurde: im ganzen
 * app/-Baum gab es GENAU EINEN Treffer -- den behobenen Fall in Footer.jsx.
 * Kein Fluter, deshalb ein hartes Urteil und keine blosse Markierung.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', 'app');

/** Zeichen, die React im Textkind maskiert -- und die <style> nicht zurueckholt. */
const MASKIERT = /['"&<>]/;

/** <style ...>{`...`}</style> bzw. <style>{'...'}</style> mit Textkind. */
const STYLE_MIT_TEXTKIND =
  /<style(?![^>]*dangerouslySetInnerHTML)[^>]*>\s*\{\s*([`'"])([\s\S]*?)\1\s*\}\s*<\/style>/g;

function dateien(verzeichnis) {
  const raus = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const voll = join(verzeichnis, eintrag);
    if (statSync(voll).isDirectory()) raus.push(...dateien(voll));
    else if (/\.(jsx?|tsx?)$/.test(eintrag)) raus.push(voll);
  }
  return raus;
}

test('kein <style> im React-Baum, dessen CSS von React maskiert wird', () => {
  const alle = dateien(APP);

  // POSITIV-KONTROLLE zuerst: findet die Mechanik ueberhaupt Dateien? Ohne sie
  // wäre der Wächter gruen, sobald der Pfad nicht mehr stimmt -- also gruen
  // by construction und von einem echten Freispruch nicht zu unterscheiden.
  assert.ok(
    alle.length > 50,
    `Positiv-Kontrolle: nur ${alle.length} Dateien unter app/ gefunden -- ` +
      'die Suchmechanik greift nicht mehr, der Wächter wäre wirkungslos',
  );

  const treffer = [];
  for (const datei of alle) {
    const code = readFileSync(datei, 'utf8');
    for (const [, , css] of code.matchAll(STYLE_MIT_TEXTKIND)) {
      if (MASKIERT.test(css)) {
        const zeichen = [...new Set(css.match(/['"&<>]/g))].join(' ');
        treffer.push(`${relative(APP, datei)} (maskierte Zeichen: ${zeichen})`);
      }
    }
  }

  assert.deepEqual(
    treffer,
    [],
    'Diese <style>-Bloecke tragen Zeichen, die React beim Serverrendern ' +
      'maskiert. <style> ist ein Raw-Text-Element -- der Parser löst die ' +
      'Maskierung nicht auf. Folge: Hydrations-Bruch auf jeder Seite, die den ' +
      'Baustein rendert, UND ein serverseitig ungültiger Selektor, der still ' +
      'nicht greift. Weg damit nach app/styles/*.css, oder (wenn es wirklich ' +
      'in die Komponente muss) dangerouslySetInnerHTML wie in ShopSwitch.jsx.\n' +
      `Treffer:\n  ${treffer.join('\n  ')}`,
  );
});

// ── URSACHE 3: von React gerendertes <script> im <head> ────────────────────
// Die WIRKUNG misst homepage-bauer/pruefungen/probe_head_ohne_react_skript.py
// am echten Browser (zwei Arme, Positiv-Kontrolle je Arm). Die Wächter hier
// sind der billige Vorposten: sie fallen schon im PR.

const QUELLE = new URL('../app/root.jsx', import.meta.url);

/** Der <head>-Abschnitt des JSX aus root.jsx. */
function kopfAbschnitt(text) {
  const a = text.indexOf('\n      <head>');
  const e = text.indexOf('\n      </head>');
  assert.ok(a >= 0, 'oeffnendes <head> im JSX nicht gefunden');
  assert.ok(e > a, 'schliessendes </head> im JSX nicht gefunden');
  return text.slice(a, e);
}

test('im <head> von root.jsx steht kein von React gerendertes <script>', () => {
  const kopf = kopfAbschnitt(readFileSync(QUELLE, 'utf8'));
  const treffer = kopf.match(/<script\b/g) || [];
  assert.deepEqual(
    treffer,
    [],
    'Ein <script> im <head> macht Cookiebots Einschub wieder zum ' +
      'Hydrationsbruch. Es gehört in den <body> — siehe den Kommentarblock ' +
      'am Anfang des <body> in app/root.jsx.',
  );
});

test('<Meta /> wird im <head> nicht direkt gerendert, sondern aufgeteilt', () => {
  const text = readFileSync(QUELLE, 'utf8');
  const kopf = kopfAbschnitt(text);
  assert.ok(
    !/<Meta\s*\/>/.test(kopf),
    '<Meta /> rendert die JSON-LD-Descriptoren als <script> in den <head>. ' +
      'Im <head> gehört {metaKopf} zu stehen.',
  );
  assert.ok(kopf.includes('{metaKopf}'), '{metaKopf} fehlt im <head>');
  assert.ok(
    text.includes('{metaRumpf}'),
    '{metaRumpf} fehlt — die JSON-LD-Bloecke würden dann gar nicht mehr ' +
      'ausgeliefert (SEO-Verlust statt Hydrationsfix)',
  );
});

test('metaAufteilen wird unbedingt aufgerufen (Hook-Reihenfolge)', () => {
  const text = readFileSync(QUELLE, 'utf8');
  const zeile = text
    .split('\n')
    .find((z) => z.includes('metaAufteilen(Meta())'));
  assert.ok(zeile, 'der Aufruf metaAufteilen(Meta()) fehlt');
  // Ein `&&`, `?` oder `if` auf derselben Zeile wäre eine bedingte
  // Ausfuehrung — die Hooks von Meta() laufen im Slot der aufrufenden
  // Komponente, ihre Reihenfolge darf zwischen zwei Renderdurchlaeufen nicht
  // wandern.
  assert.ok(
    !/[?&]|\bif\b/.test(zeile),
    `metaAufteilen(Meta()) steht bedingt: ${zeile.trim()}`,
  );
});

test('ROT-VOR-GRUEN: der Waechter erkennt ein zurueckgeschriebenes head-Skript', () => {
  const text = readFileSync(QUELLE, 'utf8');
  // Den Defekt hermetisch nachbauen statt ihn zu behaupten.
  const kaputt = text.replace(
    '\n      </head>',
    '\n        <script src="/rueckfall.js" />\n      </head>',
  );
  assert.notEqual(kaputt, text, 'Mutant liess sich nicht bauen');
  const treffer = kopfAbschnitt(kaputt).match(/<script\b/g) || [];
  assert.equal(
    treffer.length,
    1,
    'Der Waechter sieht sein eigenes Gegenbeispiel nicht — er ist blind.',
  );
});
