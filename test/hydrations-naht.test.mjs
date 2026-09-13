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
 *   4. Ein Datum, das OHNE `timeZone` formatiert wird (Job 20260913-blog-
 *      hydration-...-zeitzonen-datum). `Intl.DateTimeFormat` und
 *      `toLocaleDateString` nehmen ohne diese Angabe die Zone der UMGEBUNG:
 *      auf dem Server UTC, im Browser die des Kunden. Faellt der Zeitstempel
 *      zwischen beide Zonen, schreibt der Server einen anderen Tag als der
 *      Client liest -- derselbe Textknoten-Bruch wie bei 2., anderer Weg.
 *      Gemessen am 2026-09-13 auf /blogs/wissen, Zone als einzige Variable:
 *      UTC 0 Fehler, Europe/Berlin 41. Der Wächter dafür steht unten.
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
import {tagLang} from '../app/lib/datum.js';

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

test('ROT-VOR-GRUEN: der Wächter erkennt ein zurueckgeschriebenes head-Skript', () => {
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
    'Der Wächter sieht sein eigenes Gegenbeispiel nicht — er ist blind.',
  );
});

// ── URSACHE 4: Datum ohne Zeitzone ─────────────────────────────────────────
// DIE EIGENSCHAFT, NICHT DER ORT: gemessen wird nicht "liegt die Datei unter
// app/routes/blogs*", sondern "formatiert dieser Aufruf ein Datum, ohne die
// Zone zu nennen". Ein Zaun aus zwei Dateinamen hätte den nächsten Fall
// (app/lib/konto-texte.js, hinter dem Login und deshalb leiser) nicht gesehen
// -- er war am selben Tag schon da.
//
// KALIBRIERT AM ECHTBESTAND, bevor dieser Wächter scharf wurde: 6 Aufrufe im
// app/-Baum, davon 4 ohne Zone (2x Blog, 1x konto-texte, und die beiden
// Währungs-Formatierer zählen nicht mit, s.u.). Nach dem Fix: 0. Kein
// Fluter, deshalb ein hartes Urteil und keine blosse Markierung.
//
// WAS AUSDRÜCKLICH NICHT MITGEMESSEN WIRD: `toLocaleString` auf ZAHLEN
// (Preise in CacaoProductForm.jsx und markt-pricing.js). Die haben keine Zone,
// können diesen Bruch baulich nicht auslösen, und wer sie mitmeldet, erzieht
// zum Wegklicken des Waechters.

/**
 * Datums-Formatierungen samt ihrem Argument-Block. Erfasst beide Bauformen --
 * `new Intl.DateTimeFormat(...)` und `.toLocaleDateString(...)` /
 * `.toLocaleTimeString(...)` -- und liest den Block bis zur passenden
 * schließenden Klammer, damit ein mehrzeiliges Options-Objekt ganz drin ist.
 */
const DATUMS_AUFRUF =
  /(?:new\s+Intl\.DateTimeFormat|\.toLocale(?:Date|Time)String)\s*\(/g;

/** Ab `von` (Index der oeffnenden Klammer) bis zur passenden schließenden. */
function klammerBlock(code, von) {
  let tiefe = 0;
  for (let i = von; i < code.length; i++) {
    if (code[i] === '(') tiefe++;
    else if (code[i] === ')') {
      tiefe--;
      if (tiefe === 0) return code.slice(von, i + 1);
    }
  }
  return code.slice(von);
}

/** Alle Datums-Aufrufe einer Datei als {zeile, block}. */
function datumsAufrufe(code) {
  const raus = [];
  for (const m of code.matchAll(DATUMS_AUFRUF)) {
    const klammer = m.index + m[0].length - 1;
    raus.push({
      zeile: code.slice(0, m.index).split('\n').length,
      block: klammerBlock(code, klammer),
    });
  }
  return raus;
}

test('kein Datum wird ohne timeZone formatiert (SSR und Client würden driften)', () => {
  const alle = dateien(APP);
  assert.ok(
    alle.length > 50,
    `Positiv-Kontrolle: nur ${alle.length} Dateien unter app/ gefunden -- ` +
      'die Suchmechanik greift nicht mehr, der Wächter wäre wirkungslos',
  );

  let gesehen = 0;
  const treffer = [];
  for (const datei of alle) {
    const code = readFileSync(datei, 'utf8');
    for (const {zeile, block} of datumsAufrufe(code)) {
      gesehen++;
      if (!/\btimeZone\s*:/.test(block)) {
        treffer.push(`${relative(APP, datei)}:${zeile}`);
      }
    }
  }

  // ZWEITE POSITIV-KONTROLLE: findet der Wächter ueberhaupt noch Aufrufe?
  // Sinkt das auf 0, misst er nichts mehr und wäre gruen by construction --
  // von einem echten Freispruch nicht zu unterscheiden.
  assert.ok(
    gesehen >= 4,
    `Positiv-Kontrolle: nur ${gesehen} Datums-Formatierungen gefunden ` +
      '(erwartet mindestens 4) -- das Suchmuster greift nicht mehr',
  );

  assert.deepEqual(
    treffer,
    [],
    'Diese Aufrufe formatieren ein Datum ohne `timeZone` und nehmen damit die ' +
      'Zone der Umgebung: auf dem Server UTC, im Browser die des Kunden. ' +
      'Faellt der Zeitstempel zwischen beide, rendert der Server einen anderen ' +
      'Tag als der Client liest -- React bricht beim Hydrieren (#418/#423/#425) ' +
      'auf jeder Seite, die das Datum zeigt. Nimm die Helfer aus ' +
      'app/lib/datum.js (tagLang / tagLangZweistellig); sie tragen die Zone ' +
      'mit. Soll die Zone wirklich vom Leser abhaengen, gehört sie hinter die ' +
      'Hydration (useEffect), nie in den SSR-Pfad.\n' +
      `Treffer:\n  ${treffer.join('\n  ')}`,
  );
});

test('ROT-VOR-GRUEN: der Wächter erkennt ein zonenloses Datum', () => {
  // Der Rot-Zustand wird HERGESTELLT, nicht behauptet -- und zwar an genau der
  // Mechanik, die der Echtlauf oben benutzt. Wäre der Wächter blind, bliebe
  // dieser Arm gruen und das Gruen daneben würde nichts bedeuten.
  const kaputt = `
    const d = new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(article.publishedAt));
  `;
  const heil = `
    const d = new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Berlin',
    }).format(new Date(article.publishedAt));
  `;
  const ohneZone = (code) =>
    datumsAufrufe(code).filter(({block}) => !/\btimeZone\s*:/.test(block));

  assert.equal(
    ohneZone(kaputt).length,
    1,
    'Der Wächter sieht die zonenlose Fassung NICHT -- sein Gruen im Test ' +
      'darueber belegt damit nichts.',
  );
  assert.equal(
    ohneZone(heil).length,
    0,
    'Der Wächter meldet die HEILE Fassung -- er würde den richtigen Bau ' +
      'bestrafen und zum Wegklicken erziehen.',
  );
});

test('tagLang rendert denselben Tag, egal in welcher Zone die Umgebung läuft', () => {
  // Das ist die eigentliche Zusage an den Kunden, und sie wird am VERHALTEN
  // gemessen, nicht am Quelltext: ein Artikel erscheint an EINEM Tag -- nicht
  // an einem anderen, nur weil jemand ihn aus Honolulu liest.
  //
  // 2026-08-31T22:30:00Z ist der Zeitstempel aus dem Anlassfall: in UTC noch
  // der 31. August, in Europe/Berlin schon der 1. September. Genau dieses
  // Paar stand am 2026-09-13 im Diff zwischen SSR-HTML und hydriertem DOM.
  const ISO = '2026-08-31T22:30:00Z';
  const zonen = ['UTC', 'America/New_York', 'Pacific/Honolulu',
                 'Europe/Berlin', 'Pacific/Kiritimati'];

  /** Formatierung OHNE Zone -- der Zustand vor dem Fix, als Kontrollgruppe. */
  const ohneZone = (iso) =>
    new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));

  const alt = process.env.TZ;
  const gesehen = new Set();
  const kontrolle = new Set();
  try {
    for (const zone of zonen) {
      process.env.TZ = zone;
      gesehen.add(tagLang(ISO));
      kontrolle.add(ohneZone(ISO));
    }
  } finally {
    if (alt === undefined) delete process.env.TZ;
    else process.env.TZ = alt;
  }

  // KONTROLLGRUPPE ZUERST, sonst ist die Zusage gruen by construction: wenn
  // das Umstellen von process.env.TZ in dieser Node-Fassung gar nicht wirkt,
  // sieht eine wirkungslose Messung genauso aus wie ein geheilter Bau. Die
  // zonenlose Fassung MUSS über dieselben Zonen auseinanderlaufen.
  assert.ok(
    kontrolle.size > 1,
    'MESSAUSFALL: die zonenlose Kontrollfassung liefert über ' +
      `${zonen.length} Zonen nur ${kontrolle.size} verschiedenen Tag ` +
      `(${[...kontrolle].join(' | ')}). Dann wirkt das Umstellen der ` +
      'Umgebungszone hier nicht, und der Test unten belegt nichts.',
  );

  assert.deepEqual(
    [...gesehen],
    ['1. September 2026'],
    'tagLang liefert je nach Umgebungszone verschiedene Tage ' +
      `(${[...gesehen].join(' | ')}) -- genau daran bricht die Hydration. ` +
      'Erwartet ist ueberall der Berliner Kalendertag.',
  );
});

// ── URSACHE 5: fremder Einschub VOR Reacts erstem body-Kind ────────────────
// Ursache 3 oben schloss den Einschub im <head>. Er war damit nicht weg,
// sondern VERLEGT: Cookiebots Banner kommt aus cc.js und geht nach
// body-Index 0 (gemessen 178 von 178 Einschueben, Job 20260913-restbruch-
// hydration-standardseiten-ursache-unbekannt). Landet er vor Reacts
// Hydration-Commit, rueckt jedes von React gehaltene body-Kind um eins --
// #418 vielfach plus #423, und React raeumt den Banner wieder weg.
//
// DIE GEGENMASSNAHME ist app/lib/einschub-weiche.js: derselbe Knoten, ans
// body-ENDE umgelenkt. A/B mit einer Variablen (Ort), Zeit festgehalten:
// Anfang 8 von 8 rot und 1 von 8 ueberlebt, Ende 0 von 8 rot und 8 von 8
// ueberlebt.
//
// DIE WIRKUNG misst homepage-bauer/pruefungen/_diag_hydration_einschub.py am
// echten Browser (--weiche-aus-repo zieht GENAU diese Datei). Die Waechter
// hier sind der billige Vorposten: sie fallen schon im PR.

const WEICHE_QUELLE = new URL('../app/lib/einschub-weiche.js', import.meta.url);

/**
 * Der kleinste Baum, an dem sich die Frage entscheidet: ein Elternknoten mit
 * insertBefore/appendChild/firstChild und ein querySelector, der genau den
 * Selektor kann, den die Weiche benutzt.
 *
 * BEWUSST KEIN jsdom: die Weiche hängt sich an EINE Methode EINES Knotens,
 * und genau das soll gemessen werden. Ein vollstaendiges DOM würde die Frage
 * nicht schaerfer machen, aber eine Abhaengigkeit einführen.
 */
class Kn {
  constructor(tag, id) {
    this.tagName = String(tag).toUpperCase();
    this.nodeType = 1;
    this.id = id || '';
    this.childNodes = [];
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  // Beide Methoden LOESEN den Knoten zuerst von seinem alten Platz. Das ist
  // echtes DOM-Verhalten (ein bereits eingehaengter Knoten wird VERSCHOBEN,
  // nicht gedoppelt) und hier tragend: die Weiche schiebt den geparkten Banner
  // nach dem Commit von hinten nach vorn. Ein Nachbau ohne dieses Loesen wäre
  // nachsichtiger als die Wirklichkeit -- und ein Gruen daran hiesse nichts.
  #loesen(n) {
    const i = this.childNodes.indexOf(n);
    if (i >= 0) this.childNodes.splice(i, 1);
  }
  // `parentNode` wird mitgefuehrt, weil die Weiche es LIEST: sie schiebt nach
  // dem Commit nur zurück, was noch im body hängt. Ein Nachbau ohne dieses
  // Feld lässt die Bedingung still fehlschlagen -- der Test wäre dann rot,
  // obwohl der Quelltext stimmt, und man sucht den Fehler an der falschen
  // Stelle (genau so passiert).
  appendChild(n) {
    this.#loesen(n);
    this.childNodes.push(n);
    n.parentNode = this;
    return n;
  }
  insertBefore(n, ref) {
    this.#loesen(n);
    const i = ref ? this.childNodes.indexOf(ref) : -1;
    if (i < 0) this.childNodes.push(n);
    else this.childNodes.splice(i, 0, n);
    n.parentNode = this;
    return n;
  }
  querySelector(sel) {
    const m = /^\[id\^="([^"]+)"\]$/.exec(sel);
    assert.ok(
      m,
      `Der Nachbau kennt nur [id^="..."], die Weiche fragt nach ${sel}. ` +
        'Wenn die Weiche ihren Selektor aendert, gehört der Nachbau mit.',
    );
    const suche = (k) => {
      for (const kind of k.childNodes) {
        if (kind.id && kind.id.startsWith(m[1])) return kind;
        const tief = suche(kind);
        if (tief) return tief;
      }
      return null;
    };
    return suche(this);
  }
}

/** Ein body wie unserer: erstes Kind ist ein von React gehaltenes <script>. */
function bauBody() {
  const body = new Kn('body');
  const skript = new Kn('script');
  skript['__reactFiber$924ze5tvaok'] = {}; // live so vorgefunden
  body.appendChild(skript);
  body.appendChild(new Kn('div'));
  return body;
}

/** Cookiebots Banner: <div id="cookiebanner"> mit einem Cybot-Nachkommen. */
function bauBanner() {
  const banner = new Kn('div', 'cookiebanner');
  banner.appendChild(new Kn('a', 'CybotCookiebotDialogBodyButtonDecline'));
  return banner;
}

/** Genau der Einschub aus cc.js 2.135.0, displaydialog(). */
function wieCookiebot(body, knoten) {
  return body.firstChild
    ? body.insertBefore(knoten, body.firstChild)
    : body.appendChild(knoten);
}

/**
 * Lädt den ausgelieferten Quelltext und hängt ihn an `body`.
 *
 * Gibt ein `hydriert()` mit zurück: die Weiche parkt nur, SOLANGE React nicht
 * hydriert hat, und schiebt Geparktes danach zurück. Beide Phasen gehören
 * gemessen -- die zweite ist die, an der die erste Fix-Fassung gescheitert ist
 * (am body-Ende war der Dialog mit der Tastatur nicht mehr erreichbar).
 */
async function weicheStarten(body, quelltext) {
  const src =
    quelltext ?? (await import(WEICHE_QUELLE.href)).einschubWeicheQuelle();
  const hörer = [];
  const doc = {
    getElementsByTagName: (t) => (t === 'body' ? [body] : []),
    addEventListener: (typ, fn) => hörer.push([typ, fn]),
  };
  // requestAnimationFrame wird SYNCHRON ausgefuehrt: der Nachbau misst, WAS
  // zurueckgeschoben wird, nicht WANN der Browser das Bild zeichnet.
  const win = {requestAnimationFrame: (fn) => fn()};
  new Function('document', 'window', src)(doc, win);
  return {
    body,
    hydriert() {
      win.__qbHydriert = true;
      for (const [typ, fn] of hörer) if (typ === 'qb:hydriert') fn();
    },
  };
}

test('ROT-VOR-GRUEN: ohne Weiche landet der Banner auf body-Index 0', () => {
  const body = bauBody();
  wieCookiebot(body, bauBanner());
  assert.equal(
    body.childNodes.indexOf(body.childNodes.find((k) => k.id === 'cookiebanner')),
    0,
    'MESSAUSFALL: der Nachbau erzeugt den Defekt nicht. Dann belegt der ' +
      'Test darunter nichts.',
  );
});

test('mit Weiche landet derselbe Banner am body-ENDE -- und bleibt drin', async () => {
  const {body} = await weicheStarten(bauBody());
  const banner = bauBanner();
  const zurück = wieCookiebot(body, banner);

  assert.equal(
    body.childNodes.indexOf(banner),
    body.childNodes.length - 1,
    'Der Banner steht nicht am Ende. Auf body-Index 0 verschiebt er jedes ' +
      'von React gehaltene Geschwister -- #418 plus #423.',
  );
  assert.equal(
    zurück,
    banner,
    'insertBefore gibt den eingefuegten Knoten zurück, und Cookiebot ' +
      'rechnet damit (this.DOM = bodyObj.insertBefore(...)). Die Weiche darf ' +
      'diesen Vertrag nicht brechen.',
  );
});

test('die Weiche lässt alles andere unangetastet (fail-safe nach aussen)', async () => {
  // 1. Ein fremder Knoten OHNE Einwilligungs-Merkmal bleibt, wo er hin soll.
  const {body: a} = await weicheStarten(bauBody());
  const fremd = new Kn('div', 'irgendwas');
  a.insertBefore(fremd, a.firstChild);
  assert.equal(a.childNodes.indexOf(fremd), 0, 'fremder Knoten wurde umgelenkt');

  // 2. Ein Knoten, den REACT einfuegt, bleibt unangetastet -- auch wenn er
  //    nach Einwilligung aussieht. React soll seinen eigenen Baum bauen.
  const {body: b} = await weicheStarten(bauBody());
  const reactKnoten = bauBanner();
  reactKnoten['__reactFiber$abc'] = {};
  b.insertBefore(reactKnoten, b.firstChild);
  assert.equal(
    b.childNodes.indexOf(reactKnoten),
    0,
    'Ein React-eigener Knoten wurde umgelenkt -- das bricht Reacts Baum.',
  );

  // 3. Ein Einschub, der NICHT vor das erste Kind geht, bleibt an Ort und
  //    Stelle. Umgelenkt wird nur die eine gemessene Bauform.
  const {body: c} = await weicheStarten(bauBody());
  const banner = bauBanner();
  c.insertBefore(banner, c.childNodes[1]);
  assert.equal(c.childNodes.indexOf(banner), 1, 'Einschub in der Mitte wurde verschoben');
});

test('nach dem Hydrations-Signal kehrt der Banner auf body-Index 0 zurück', async () => {
  // DIE ZWEITE HÄLFTE DES BAUS, und die teurere: am body-Ende ist der
  // Einwilligungs-Dialog mit der Tastatur nicht mehr erreichbar (gemessen:
  // Tab 1/2/3/5 auf Index 0 gegen KEINEN Treffer in 60 Tabs am Ende). Geparkt
  // wird deshalb nur bis zum Commit.
  const {body, hydriert} = await weicheStarten(bauBody());
  const banner = bauBanner();
  wieCookiebot(body, banner);
  assert.equal(
    body.childNodes.indexOf(banner),
    body.childNodes.length - 1,
    'Vorbedingung: im Fenster vor dem Commit steht der Banner am Ende.',
  );

  hydriert();

  assert.equal(
    body.childNodes.indexOf(banner),
    0,
    'Der Banner ist nach dem Commit nicht auf Index 0 zurück. Dann bleibt die ' +
      'Einwilligung für Tastatur-Bedienung am Seitenende liegen.',
  );
});

test('nach dem Hydrations-Signal wird nicht mehr umgelenkt', async () => {
  const {body, hydriert} = await weicheStarten(bauBody());
  hydriert();
  const banner = bauBanner();
  wieCookiebot(body, banner);
  assert.equal(
    body.childNodes.indexOf(banner),
    0,
    'Nach dem Commit ist der Einschub auf Index 0 harmlos (s01: 160 Läufe, ' +
      'alle grün). Dann soll die Weiche nichts mehr tun.',
  );
});

test('die Weiche hängt sich genau einmal ein', async () => {
  const body = bauBody();
  await weicheStarten(body);
  const nachEinmal = body.insertBefore;
  await weicheStarten(body);
  assert.equal(
    body.insertBefore,
    nachEinmal,
    'Zweiter Durchlauf hängt erneut ein. Jede Schicht ruft die darunter ' +
      'auf -- aus einem Einschub würden mehrere.',
  );
});

test('die Weiche steht im Bootstrap VOR dem Cookiebot-Loader', () => {
  const text = readFileSync(QUELLE, 'utf8');
  const a = text.indexOf('einschubWeicheQuelle()');
  const e = text.indexOf('var s=document.createElement("script")');
  assert.ok(a > 0, 'cookiebotBootstrap ruft einschubWeicheQuelle() nicht auf');
  assert.ok(e > 0, 'der Cookiebot-Loader im Bootstrap wurde nicht gefunden');
  assert.ok(
    a < e,
    'Die Weiche steht NACH dem Loader. Dann kann uc.js schon angefordert ' +
      'sein, bevor sie hängt -- und der Einschub geht an ihr vorbei.',
  );
});

test('ROT-VOR-GRUEN: der Waechter erkennt eine ausgebaute Weiche', async () => {
  const quelle = (await import(WEICHE_QUELLE.href)).einschubWeicheQuelle();
  // Mutant: die Bedingung wird unerfuellbar, die Weiche reicht alles durch.
  const kaputt = quelle.replace('bezug===this.firstChild', 'false');
  assert.notEqual(kaputt, quelle, 'Mutant liess sich nicht bauen');

  const {body} = await weicheStarten(bauBody(), kaputt);
  const banner = bauBanner();
  wieCookiebot(body, banner);
  assert.equal(
    body.childNodes.indexOf(banner),
    0,
    'Der Mutant lenkt immer noch um. Dann misst der Test oben nicht die ' +
      'Weiche, sondern irgendetwas anderes.',
  );
});
