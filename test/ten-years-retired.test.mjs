// Durchsetzer für den stillgelegten Jubilaeums-Sale
// (Job 20260821-shopmgr-s04-totes-kampagnenversprechen, 2026-08-22).
// Wie ad-weiche.test.mjs: node:test/node:assert sind Bordmittel, KEIN Netz,
// kein neuer Runner. Ausfuehren: node --test test/ten-years-retired.test.mjs
//
// WARUM ES DIESEN TEST GIBT
// -------------------------
// Die Kampagne wurde am 2026-08-05 stillgelegt, indem ihre ERREICHBARKEIT
// abgeschaltet wurde (TEN_YEARS_SALE_RETIRED = true). Ihre ZAHLEN blieben
// stehen: zwei Rabattcodes, die in Shopify seit 2026-06-17 abgelaufen sind,
// und rabattierte Preise in fuenf Deals. Erreichbar war davon nichts — aber
// ein einziges `TEN_YEARS_SALE_RETIRED = false` haette alles auf einen Schlag
// wieder scharf gestellt, und keine Zusage wäre noch wahr gewesen.
//
// Eine Stilllegung, die nur die Tuer zusperrt, lässt die Mine im Raum. Dieser
// Test ist der Zuender-Entferner: solange die Kampagne stillgelegt ist, darf
// sie KEINE kommerzielle Zusage tragen. Wer sie reaktiviert, muss Preise und
// Codes neu erheben — dieser Test hoert dann auf zu fordern (er greift nur bei
// RETIRED === true) und die Messung liegt wieder bei shop-manager landkarte.
//
// ER PRUEFT ZWEI DINGE, UND DAS ZWEITE IST DAS WICHTIGERE
// -------------------------------------------------------
// 1. Keine Zusage mehr — in BEIDEN Haelften. Die Daten (ten-years-deals.js)
//    liest ein Monitor; die Copy-Tabelle in TenYearsDealPage.jsx liest keiner.
//    Genau diese zweite Haelfte fuehrte dieselben Betraege ein zweites Mal.
// 2. Der 404-ZAUN IST NOCH DA. Der naheliegende "gruendlichere" Fix wäre
//    gewesen, die Deal-Eintraege ganz zu loeschen. Das wäre der gefaehrlichere
//    Weg: `getTenYearsDealByHandle` speist den Zaun in products.$handle.jsx,
//    und hinter den Alias-Handles stehen echte Shopify-Produkte im Status
//    DRAFT ("Sale: QiBracelet" 687ghgf4ed, "Sale: QiHome(R) Air" 56huz67dds,
//    gemessen 2026-08-22). Ohne Zaun veroeffentlicht ein Admin-Klick
//    DRAFT->ACTIVE eine "Sale:"-Seite zum vollen Preis. Ein Test, der nur die
//    Zusage prueft, würde dieses Loeschen gruen durchwinken.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  TEN_YEARS_DEALS,
  TEN_YEARS_SALE_RETIRED,
  getTenYearsDealByHandle,
  istStillgelegteJSaleSeite,
} from '../app/data/ten-years-deals.js';

const KOMPONENTE = new URL(
  '../app/components/campaign/TenYearsDealPage.jsx',
  import.meta.url,
);

// Jeder Handle und Alias, der am 2026-08-22 den 404-Zaun bekam. Bewusst als
// Literal-Liste und NICHT aus TEN_YEARS_DEALS abgeleitet: eine abgeleitete
// Liste schrumpft lautlos mit, wenn jemand einen Eintrag loescht — dann prueft
// der Test seine eigene Kopie des Schadens und bleibt gruen.
const ZAUN_HANDLES = [
  'jhsdhze783',
  '734husd8hh',
  'sale-qibracelet',
  'bf-qibracelet',
  '687ghgf4ed',
  'sale-qihome-air',
  'bf-qihome-air',
  '56huz67dds',
  'awcr37shyj',
  'aw783hfn',
  '37cr378n',
];

// --- 1. Keine kommerzielle Zusage, solange stillgelegt ----------------------

test('stillgelegt: kein Deal trägt einen Rabattcode', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    assert.equal(
      deal.discountCode,
      undefined,
      `Deal '${deal.key}' trägt discountCode '${deal.discountCode}'. Ein ` +
        `stillgelegter Deal darf keinen Code versprechen — er wird nicht ` +
        `eingeloest und niemand misst ihn.`,
    );
  }
});

test('stillgelegt: kein Link loest einen Rabattcode ein', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const feld of ['path', 'listingHref', 'redirectTo']) {
      const wert = deal[feld];
      if (typeof wert !== 'string') continue;
      assert.ok(
        !wert.includes('/discount/'),
        `Deal '${deal.key}' hat ${feld}='${wert}'. Ein /discount/-Link ` +
          `loest einen Code ein; stillgelegt gibt es keinen gueltigen.`,
      );
    }
  }
});

test('stillgelegt: keine Variante trägt einen Preis', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const variante of deal.variants ?? []) {
      assert.equal(
        variante.price,
        undefined,
        `Deal '${deal.key}', Variante '${variante.title}' trägt ` +
          `price=${variante.price}. Das ist eine Endpreis-Zusage gegen einen ` +
          `Warenkorb, der sie nicht mehr einloest.`,
      );
      assert.equal(
        variante.compareAtPrice,
        undefined,
        `Deal '${deal.key}', Variante '${variante.title}' trägt ` +
          `compareAtPrice=${variante.compareAtPrice} — ein Streichpreis ` +
          `behauptet eine Ermaessigung, die es nicht gibt.`,
      );
    }
  }
});

test('stillgelegt: keine benefits-Zeile nennt Code oder Euro-Betrag', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  for (const deal of TEN_YEARS_DEALS) {
    for (const zeile of deal.benefits ?? []) {
      assert.ok(
        !/rabattcode/i.test(zeile),
        `Deal '${deal.key}': benefits-Zeile nennt einen Rabattcode — "${zeile}"`,
      );
      assert.ok(
        !/\d[\d.,]*\s*(€|EUR|Euro)/i.test(zeile),
        `Deal '${deal.key}': benefits-Zeile verspricht einen Betrag — "${zeile}"`,
      );
    }
  }
});

// Die zweite Haelfte: Copy in der Komponente. Sie steht in keinem Array mit
// `variants` und trägt keinen `discountCode` — kein Monitor liest sie. Der
// Test liest sie deshalb als QUELLTEXT; die Tabelle ist nicht exportiert.
test('stillgelegt: die Copy-Tabelle der Komponente nennt keinen Sparbetrag', () => {
  if (!TEN_YEARS_SALE_RETIRED) return;
  const quelltext = readFileSync(KOMPONENTE, 'utf8');
  const treffer = [];
  for (const zeile of quelltext.split('\n')) {
    if (!/^\s*(heroSavings|savingText|ctaButton|ctaHeader)\s*:/.test(zeile)) continue;
    if (/\d[\d.,]*\s*(€|EUR|Euro)/i.test(zeile)) treffer.push(zeile.trim());
  }
  assert.deepEqual(
    treffer,
    [],
    `Die Copy-Tabelle in TenYearsDealPage.jsx verspricht wieder Betraege:\n` +
      `${treffer.join('\n')}\n` +
      `Das ist die Haelfte, die kein Monitor liest — sie muss hier gehalten werden.`,
  );
});

// --- 2. Der Zaun steht noch (Chesterton) ------------------------------------

test('der 404-Zaun deckt weiterhin jeden Handle und Alias', () => {
  for (const handle of ZAUN_HANDLES) {
    assert.ok(
      getTenYearsDealByHandle(handle),
      `Handle '${handle}' findet keinen Deal mehr. products.$handle.jsx ` +
        `wirft seinen 404 NUR für bekannte Deal-Handles — ohne Eintrag ` +
        `faellt der Handle in die normale Produkt-Query. Hinter ` +
        `687ghgf4ed/56huz67dds stehen Shopify-Produkte "Sale: ..." im Status ` +
        `DRAFT; ein Admin-Klick auf ACTIVE veroeffentlicht sie dann zum ` +
        `vollen Preis. Eintrag NICHT loeschen — nur seine Zusage entfernen.`,
    );
  }
});

test('die Seiten-Stilllegung ist unveraendert scharf', () => {
  assert.equal(TEN_YEARS_SALE_RETIRED, true);
  assert.equal(istStillgelegteJSaleSeite('/pages/10-jahre-sale'), true);
  assert.equal(istStillgelegteJSaleSeite('/pages/10-jahre-pre-access'), true);
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro-2x'), true);
  // Nachbarpfade duerfen NICHT mitgerissen werden (kein Praefix-Match).
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro'), false);
  assert.equal(istStillgelegteJSaleSeite('/pages/qione-2-pro-details'), false);
});

// --- 3. Struktur, die die Komponente weiterhin braucht -----------------------
// Ohne das könnte "Zusage entfernen" zu "Variante entfernen" verrutschen:
// TenYearsDealPage liest deal.variants[0].id ungeprueft.
test('jeder Deal behaelt mindestens eine Variante mit id', () => {
  for (const deal of TEN_YEARS_DEALS) {
    assert.ok(
      Array.isArray(deal.variants) && deal.variants.length > 0,
      `Deal '${deal.key}' hat keine Varianten mehr — TenYearsDealPage greift ` +
        `ungeprueft auf deal.variants[0].id zu.`,
    );
    for (const variante of deal.variants) {
      assert.ok(variante.id, `Deal '${deal.key}': Variante ohne id`);
    }
  }
});

// --- 2b. Der ZAUN-AUFRUFER steht noch (die andere Haelfte derselben Naht) ----
//
// WARUM DIESER TEIL 2026-09-05 DAZUKAM (Job 20260901-jsale-zaun-aufrufer-und-
// takt-hypothese-ungewacht, aus dem Selbst-Debug-Lauf des Eltern-Jobs):
// Die Probe darueber ("der 404-Zaun deckt weiterhin jeden Handle") hält die
// DATEN-Haelfte des Zauns — sie belegt, dass getTenYearsDealByHandle() jeden
// Handle noch findet. Sie sagt nichts darueber, ob den Fund noch jemand
// BENUTZT. Wer in products.$handle.jsx die drei Zeilen
//
//     if (TEN_YEARS_SALE_RETIRED) {
//       throw new Response(null, {status: 404});
//     }
//
// entfernt, lässt jeden Deal-Handle in die normale Produkt-Query fallen —
// und alle acht Proben oben blieben gruen. Das ist die verankerte Klasse
// "ein Regelwerk ohne Aufrufer ist wirkungslos" in ihrer Umkehrung: der
// Aufrufer ist da, der Waechter schaut nur auf die halbe Naht.
//
// GEMESSEN WIRD QUELLTEXT, NICHT VERHALTEN — und das ist eine Grenze, keine
// Bequemlichkeit: die Route ist JSX und importiert Hydrogen; `node --test`
// kann sie nicht laden. Ein Quelltext-Test kann durch eine Umformulierung
// falsch rot werden. Dagegen steht die Strenge unten: gemessen wird der
// ENTKOMMENTIERTE Rumpf von loader(), per Klammer-Zaehlung ausgeschnitten,
// nicht ein grep über die Datei. Wer nur den Kommentarblock stehen lässt
// und den Code entfernt, faellt durch (Fall 2 des Rot-Nachweises).
const ROUTE = new URL('../app/routes/products.$handle.jsx', import.meta.url);

/**
 * Kommentare und String-INHALTE laengentreu durch Leerzeichen ersetzen, damit
 * Positionen und Klammer-Zaehlung des Originals erhalten bleiben. Ohne diesen
 * Schritt würde der große Kommentarblock über dem Zaun (er zitiert "404")
 * einen entfernten Zaun weiter bezeugen.
 */
function nurCode(quelltext) {
  const aus = quelltext.split('');
  const leer = (von, bis) => {
    for (let k = von; k < bis && k < aus.length; k += 1) {
      if (aus[k] !== '\n') aus[k] = ' ';
    }
  };
  // Zeichen, nach denen ein '/' einen regulaeren Ausdruck eroeffnet und keine
  // Division ist. Ohne diese Unterscheidung frisst /\s+/ den Rest der Datei.
  const VOR_REGEX = new Set([
    '(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-',
    '*', '%', '~', '^', '<', '>', 'return', undefined,
  ]);
  let i = 0;
  let letztes;
  while (i < quelltext.length) {
    const c = quelltext[i];
    if (c === '/' && quelltext[i + 1] === '/') {
      const ende = quelltext.indexOf('\n', i);
      leer(i, ende === -1 ? quelltext.length : ende);
      i = ende === -1 ? quelltext.length : ende;
      continue;
    }
    if (c === '/' && quelltext[i + 1] === '*') {
      const ende = quelltext.indexOf('*/', i + 2);
      leer(i, ende === -1 ? quelltext.length : ende + 2);
      i = ende === -1 ? quelltext.length : ende + 2;
      continue;
    }
    if (c === '/' && VOR_REGEX.has(letztes)) {
      // Zeichenklassen mitzaehlen: in /[/]+/ beendet das '/' den Ausdruck
      // NICHT. Ohne diese Unterscheidung frisst der Stripper den Rest der
      // Zeile — gefunden von der Selbstkontrolle unten, nicht vermutet.
      let j = i + 1;
      let inKlasse = false;
      while (j < quelltext.length && quelltext[j] !== '\n') {
        if (quelltext[j] === '\\') j += 2;
        else if (quelltext[j] === '[') {
          inKlasse = true;
          j += 1;
        } else if (quelltext[j] === ']') {
          inKlasse = false;
          j += 1;
        } else if (quelltext[j] === '/' && !inKlasse) break;
        else j += 1;
      }
      leer(i + 1, j);
      i = j + 1;
      letztes = '/';
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      let j = i + 1;
      while (j < quelltext.length) {
        if (quelltext[j] === '\\') j += 2;
        else if (quelltext[j] === c) break;
        else j += 1;
      }
      leer(i + 1, j);
      i = j + 1;
      letztes = c;
      continue;
    }
    if (!/\s/.test(c)) letztes = c;
    i += 1;
  }
  return aus.join('');
}

/** Rumpf einer Funktion ab `marke` per Klammer-Zaehlung ausschneiden. */
function rumpfAb(code, marke) {
  const start = code.indexOf(marke);
  if (start === -1) return null;
  const auf = code.indexOf('{', start);
  if (auf === -1) return null;
  let tiefe = 0;
  for (let k = auf; k < code.length; k += 1) {
    if (code[k] === '{') tiefe += 1;
    else if (code[k] === '}') {
      tiefe -= 1;
      if (tiefe === 0) return {text: code.slice(auf, k + 1), offset: auf};
    }
  }
  return null;
}

/** Block/Statement, das auf `if (...)` ab Index `iIf` folgt. */
function folgeBlock(code, iIf) {
  let k = code.indexOf('(', iIf);
  if (k === -1) return '';
  let tiefe = 0;
  for (; k < code.length; k += 1) {
    if (code[k] === '(') tiefe += 1;
    else if (code[k] === ')') {
      tiefe -= 1;
      if (tiefe === 0) break;
    }
  }
  let j = k + 1;
  while (j < code.length && /\s/.test(code[j])) j += 1;
  if (code[j] === '{') {
    const r = rumpfAb(code.slice(j), '{');
    return r ? r.text : '';
  }
  const semi = code.indexOf(';', j);
  return code.slice(j, semi === -1 ? code.length : semi + 1);
}

// Positiv-Kontrolle für das Messgeraet selbst. Ohne sie ist ein "kein
// Treffer" keine Aussage, sondern womoeglich nur ein kaputter Stripper.
test('Selbstkontrolle: nurCode() entfernt Prosa und behaelt Code', () => {
  const probe = [
    "const a = 1; // if (TEN_YEARS_SALE_RETIRED) throw new Response(null,{status:404});",
    '/* if (TEN_YEARS_SALE_RETIRED) { throw new Response(null, {status: 404}); } */',
    "const pfad = '//nicht-ein-kommentar'; const b = 2;",
    "const c = 'x'.replace(/[/]+/g, '') ; const d = 3;",
  ].join('\n');
  const code = nurCode(probe);
  assert.equal(
    /TEN_YEARS_SALE_RETIRED/.test(code),
    false,
    'nurCode() lässt Kommentar-Prosa stehen — dann bezeugt ein Kommentar den ' +
      'entfernten Zaun weiter.',
  );
  for (const kern of ['const a = 1;', 'const b = 2;', 'const d = 3;']) {
    assert.ok(
      code.includes(kern),
      `nurCode() hat echten Code verschluckt ("${kern}") — ein Stripper, der ` +
        `zu viel frisst, macht jede Aussage darunter wertlos.`,
    );
  }
  assert.equal(code.length, probe.length, 'nurCode() ist nicht laengentreu.');
});

test('der 404-Zaun-AUFRUFER steht noch in products.$handle.jsx', () => {
  const code = nurCode(readFileSync(ROUTE, 'utf8'));
  const loader = rumpfAb(code, 'export async function loader');
  assert.ok(
    loader,
    'In products.$handle.jsx ist kein `export async function loader` mehr zu ' +
      'finden. Ohne Loader gibt es keinen Zaun — und diese Probe kann nichts ' +
      'mehr aussagen.',
  );
  const rumpf = loader.text;

  assert.ok(
    /getTenYearsDealByHandle\s*\(/.test(rumpf),
    'Der Loader ruft getTenYearsDealByHandle() nicht mehr auf. Damit ist der ' +
      'Zaun ohne Eingabe: jeder Deal-Handle faellt in die normale ' +
      'Produkt-Query, obwohl die Deal-Eintraege noch da sind.',
  );

  const iZaun = rumpf.search(/if\s*\(\s*TEN_YEARS_SALE_RETIRED\s*\)/);
  assert.notEqual(
    iZaun,
    -1,
    'Im Loader von products.$handle.jsx steht kein `if (TEN_YEARS_SALE_RETIRED)` ' +
      'mehr (Kommentare zählen hier nicht). Ohne diesen Zweig rendert jeder ' +
      'Deal-Handle wieder — hinter 687ghgf4ed/56huz67dds stehen Shopify-' +
      'Produkte "Sale: ..." im Status DRAFT, ein Admin-Klick auf ACTIVE ' +
      'veroeffentlicht sie dann zum vollen Preis.',
  );

  const block = folgeBlock(rumpf, iZaun);
  assert.ok(
    /throw\s+new\s+Response\s*\(/.test(block),
    'Der Zweig `if (TEN_YEARS_SALE_RETIRED)` wirft nichts mehr:\n' +
      `${block.trim().slice(0, 200)}\n` +
      'Der Zaun besteht genau aus diesem Wurf — ohne ihn läuft der Loader weiter.',
  );
  assert.ok(
    /status\s*:\s*404/.test(block),
    'Der Zweig `if (TEN_YEARS_SALE_RETIRED)` wirft keine 404 mehr:\n' +
      `${block.trim().slice(0, 200)}\n` +
      'Ein anderer Status ist kein Zaun: nur das 404 lässt zugleich den in ' +
      'Shopify gepflegten storefrontRedirect greifen.',
  );
});

test('der 404-Wurf steht VOR dem 301-Redirect und vor der Produkt-Query', () => {
  const code = nurCode(readFileSync(ROUTE, 'utf8'));
  const loader = rumpfAb(code, 'export async function loader');
  assert.ok(loader, 'kein loader in products.$handle.jsx');
  const rumpf = loader.text;

  const iDealZweig = rumpf.search(/if\s*\(\s*campaignDeal\s*\)/);
  const iZaun = rumpf.search(/if\s*\(\s*TEN_YEARS_SALE_RETIRED\s*\)/);
  const iRedirect = rumpf.search(/campaignDeal\s*\.\s*redirectTo/);
  const iQuery = rumpf.search(/loadCriticalData\s*\(/);

  assert.notEqual(iDealZweig, -1, 'kein `if (campaignDeal)`-Zweig mehr im Loader');
  assert.notEqual(iZaun, -1, 'kein `if (TEN_YEARS_SALE_RETIRED)` mehr im Loader');
  assert.notEqual(iQuery, -1, 'der Loader ruft loadCriticalData() nicht mehr auf');

  assert.ok(
    iDealZweig < iZaun,
    'Der Zaun steht nicht mehr im `if (campaignDeal)`-Zweig. Ausserhalb wirft ' +
      'er entweder für JEDE Produktseite 404 oder für keine.',
  );
  assert.ok(
    iZaun < iQuery,
    'Der Zaun steht NACH loadCriticalData(): dann läuft die Produkt-Query ' +
      'zuerst und die stillgelegte Sale-Seite wird gerendert, bevor der 404 ' +
      'faellt (bzw. ist unerreichbar).',
  );
  if (iRedirect !== -1) {
    assert.ok(
      iZaun < iRedirect,
      'Der Zaun steht NACH dem 301 auf campaignDeal.redirectTo. Dann leitet ' +
        'ein Alt-Handle auf die ebenfalls stillgelegte Campaign-PDP um, statt ' +
        'den Shopify-Redirect greifen zu lassen.',
    );
  }
});
