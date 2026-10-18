/**
 * Tests der Seiten-Weiche (experiment-weiche.server.js), node --test.
 * Grossjob 20261006-GROSSJOB-rookie-15pct-qione-2-pro-und-startseite, s05.
 * Dritter Eintrag pb-e1-gs107 (Beratungsseite, 50 %): Grossjob
 * 20261008-GROSSJOB-produktberatung-christians-text-und-seite-optimieren, s02.
 *
 * Mutanten, die rot werden müssen: Anteil, Salz, Bot-Regel, _routes-Streichung
 * (Matrix im RESULT des Segments).
 * Eigener Desktop-Anteil der Startseite (Grossjob vom 10.10.2026 „LP-Tests
 * Geräte getrennt", s06): Anteil je Gerät,
 * Desktop-Kill, Geräteklasse zeichengleich mit entry.server.jsx.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  SEITEN_EXPERIMENTE,
  SUCH_UND_VORSCHAU_CRAWLER,
  anteilProzentFuer,
  entscheideSeitenExperiment,
  geraeteKlasse,
  istSuchOderVorschauCrawler,
  seitenExperimentAktiv,
  zielSuche,
} from './experiment-weiche.server.js';
import {E1, besucherEimer, fnv1a} from './lp-ab-v2.server.js';

const START = 'start-e1-gs081';
const SHOP = 'q2p-e1-gs080';
const PB = 'pb-e1-gs107';
const ALLE = [START, SHOP, PB];
const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36';
const DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const FB_INAPP =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.40.97;FBBV/620000000;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/de_DE;FBOP/5]';
const CUBOT =
  'Mozilla/5.0 (Linux; Android 10; CUBOT X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const MENSCHEN = [IPHONE, ANDROID, DESKTOP, FB_INAPP, CUBOT];

function req(pfadMitQuery, {ip = '203.0.113.7', ua = IPHONE, method = 'GET'} = {}) {
  const headers = new Headers();
  if (ua) headers.set('user-agent', ua);
  if (ip) headers.set('oxygen-buyer-ip', ip);
  return new Request(`https://qiblanco.com${pfadMitQuery}`, {method, headers});
}

/** Deterministische Pseudo-Zufallsfolge (LCG), damit jeder Lauf dieselbe Population sieht. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

function population(n, seed = 20261006) {
  const r = lcg(seed);
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const ip = `${(r() % 223) + 1}.${r() % 256}.${r() % 256}.${r() % 256}`;
    out.push({ip, ua: MENSCHEN[r() % MENSCHEN.length]});
  }
  return out;
}

/** Wilson-Intervall 95 %. */
function wilson(k, n, z = 1.96) {
  const p = k / n;
  const nenner = 1 + (z * z) / n;
  const mitte = (p + (z * z) / (2 * n)) / nenner;
  const halb = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / nenner;
  return [mitte - halb, mitte + halb];
}

/** Arm-Funktion über die echte Entscheidung (nicht über besucherEimer direkt). */
function istB(id, {ip, ua}) {
  return entscheideSeitenExperiment(req(SEITEN_EXPERIMENTE[id].pfad_a, {ip, ua}), {}, id) !== null;
}

const POP = population(20000);

test('Tabelle: drei Experimente, Salz = id, Anteile Start 15 / Shop 15 oder 50 (Rampe) / Beratung 50, eigene Marker, keine Kollision mit E1', () => {
  assert.deepEqual(Object.keys(SEITEN_EXPERIMENTE).sort(), [PB, SHOP, START].sort());
  const s = SEITEN_EXPERIMENTE[START];
  const q = SEITEN_EXPERIMENTE[SHOP];
  const k = SEITEN_EXPERIMENTE[PB];
  assert.equal(k.salz, PB);
  assert.equal(k.pfad_a, '/pages/produktberatung');
  assert.equal(k.pfad_b, '/pages/produktberatung-b');
  assert.equal(k.anteil_prozent, 50);
  // bewusst derselbe Pin wie q2p (Auftraege s02/s05 messen B mit ?shop_exp=b); jeder Loader fragt nur seine id ab
  assert.equal(k.pin_param, 'shop_exp');
  assert.equal(k.env_kill, 'EXP_PB_MODE');
  assert.equal(k.hypothese_id, 'GS-107');
  assert.equal(s.salz, START);
  assert.equal(q.salz, SHOP);
  assert.equal(s.pfad_a, '/');
  assert.equal(s.pfad_b, '/pages/start-b');
  assert.equal(q.pfad_a, '/pages/qione-2-pro');
  assert.equal(q.pfad_b, '/pages/qione-2-pro-b');
  assert.equal(s.anteil_prozent, 15);
  // Eigener Desktop-Anteil nur auf der Startseite (s06, Anhebungsregel #52 je Gerät); Shop und Beratung ohne
  assert.equal(s.anteil_prozent_desktop, 50);
  assert.equal(s.env_kill_desktop, 'EXP_START_DESKTOP_MODE');
  assert.equal(q.anteil_prozent_desktop, undefined);
  assert.equal(k.anteil_prozent_desktop, undefined);
  // Shopseite: Rampe nach vorab festgeschriebener Regel (Entscheidung Coworker A 07.10.2026 im Auftrag
  // Christians): 15 % ab Start, 50 % nach 7 Tagen ohne Schaden, zurück auf 15 % bei Guardrail-
  // Verschlechterung (heatmap-manager experimente.yaml anteil_ruecklauf). Jeder andere Wert ist ein Fehler.
  assert.ok([15, 50].includes(q.anteil_prozent), `Shop-Anteil ${q.anteil_prozent} liegt nicht auf der Rampe 15/50`);
  assert.equal(s.pin_param, 'start_exp');
  assert.equal(q.pin_param, 'shop_exp');
  assert.equal(s.env_kill, 'EXP_START_MODE');
  assert.equal(q.env_kill, 'EXP_SHOP_MODE');
  const belegt = new Set(['w', 'r', 'f', 'v', 'x', 'm', 'h', 'p', 'b', 'n']);
  assert.ok(!belegt.has(s.marker) && !belegt.has(q.marker) && !belegt.has(k.marker));
  assert.equal(new Set([s.marker, q.marker, k.marker]).size, 3);
  assert.notEqual(s.salz, E1.salz);
  assert.notEqual(q.salz, E1.salz);
  assert.notEqual(k.salz, E1.salz);
});

test('Goldwerte: Eimer = fnv1a(salz|ip|ua) % 100 je Experiment-Salz (festgeschrieben 06.10.2026)', () => {
  assert.equal(besucherEimer('203.0.113.7', IPHONE, START), fnv1a(`${START}|203.0.113.7|${IPHONE}`) % 100);
  const gold = {
    [START]: [65, 31, 56, 24, 57, 23],
    [SHOP]: [77, 91, 12, 40, 81, 87],
    [PB]: [26, 58, 55, 97, 64, 72], // festgeschrieben 08.10.2026
  };
  for (const id of ALLE) {
    const salz = SEITEN_EXPERIMENTE[id].salz;
    const ist = ['198.51.100.23', '203.0.113.7', '192.0.2.44'].flatMap((ip) => [
      besucherEimer(ip, ANDROID, salz),
      besucherEimer(ip, IPHONE, salz),
    ]);
    assert.deepEqual(ist, gold[id], `${id}: Salz oder Hash weicht ab`);
  }
});

// Band 4 Sigma (z 3,89) wie beim Unabhängigkeitstest unten, nicht 95 %: die 20 000 Besucher sind EINE feste
// Stichprobe, und drei Experimente mit je einem 95-%-Intervall reißen schon durch Zufall. Belegfall 13.10.2026:
// q2p auf 50 % ergibt hier 49,10 % (2,6 Sigma); 200 000 frische Besucher je Startwert ergeben 49,9 bis 50,2 %.
// Grobe Fehler (Vergleich gedreht bei 15 %, Feld fehlt = alle auf B, Prozent als Anteil) bleiben weit außerhalb.
// Je Geräteklasse gegen ihren eigenen Soll-Anteil (s06): gepoolt gäbe es kein festes Soll, der Mix hängt an der
// Geräteverteilung der Population.
const istDesktop = (b) => geraeteKlasse(b.ua) === 'desktop';
for (const id of ALLE) {
  const exp = SEITEN_EXPERIMENTE[id];
  for (const [wort, teil, soll] of [
    ['mobil', POP.filter((b) => !istDesktop(b)), exp.anteil_prozent / 100],
    ['desktop', POP.filter(istDesktop), (exp.anteil_prozent_desktop ?? exp.anteil_prozent) / 100],
  ]) {
    test(`${id} ${wort}: Anteil B über ${teil.length} synthetische Besucher, 4-Sigma-Wilson-Intervall enthält ${soll * 100} %`, () => {
      assert.ok(teil.length >= 3000, `${wort}: nur ${teil.length} Besucher`);
      const k = teil.filter((b) => istB(id, b)).length;
      const [lo, hi] = wilson(k, teil.length, 3.89);
      assert.ok(lo <= soll && soll <= hi, `${id} ${wort}: ${k}/${teil.length} = ${(k / teil.length).toFixed(4)}, Wilson [${lo.toFixed(4)}, ${hi.toFixed(4)}]`);
    });
  }

  test(`${id}: stabil je Besucher (derselbe Arm bei jedem Aufruf, auch per .data)`, () => {
    for (const b of POP.slice(0, 500)) {
      const erst = entscheideSeitenExperiment(req(SEITEN_EXPERIMENTE[id].pfad_a, b), {}, id);
      const zweit = entscheideSeitenExperiment(req(`${SEITEN_EXPERIMENTE[id].pfad_a}?utm_source=x`, b), {}, id);
      const daten = entscheideSeitenExperiment(
        req(`${SEITEN_EXPERIMENTE[id].pfad_a}?_routes=routes%2F_index`, b),
        {},
        id,
      );
      assert.equal(erst === null, zweit === null);
      assert.equal(erst === null, daten === null);
      if (erst) assert.equal(erst.eimer, besucherEimer(b.ip, b.ua, SEITEN_EXPERIMENTE[id].salz));
    }
  });
}

test('Salze unabhängig: Start, Shop, Beratung und LP-E1 (szs-e1-gs050) teilen paarweise wie Zufall', () => {
  const lpB = (b) => besucherEimer(b.ip, b.ua, E1.salz) < E1.anteil_prozent;
  const arme = {start: (b) => istB(START, b), shop: (b) => istB(SHOP, b), pb: (b) => istB(PB, b), lp: lpB};
  // Start hat einen eigenen Desktop-Anteil: sein Randanteil ist das Mittel über die Population. Die anderen Arme
  // haben je Gerät denselben Anteil, also gilt P(beide) = Randanteil x Randanteil weiter.
  const randStart = POP.reduce((s, b) => s + anteilProzentFuer(SEITEN_EXPERIMENTE[START], b.ua, {}), 0) / POP.length / 100;
  const anteil = {
    start: randStart,
    shop: SEITEN_EXPERIMENTE[SHOP].anteil_prozent / 100,
    pb: SEITEN_EXPERIMENTE[PB].anteil_prozent / 100,
    lp: E1.anteil_prozent / 100,
  };
  const n = POP.length;
  const paare = [['start', 'shop'], ['start', 'lp'], ['shop', 'lp'], ['pb', 'start'], ['pb', 'shop'], ['pb', 'lp']];
  for (const [x, y] of paare) {
    const p = anteil[x] * anteil[y];
    const toleranz = 4 * Math.sqrt(n * p * (1 - p));
    const beide = POP.filter((b) => arme[x](b) && arme[y](b)).length;
    assert.ok(Math.abs(beide - n * p) < toleranz, `${x}×${y}: beide B ${beide}, erwartet ${(n * p).toFixed(0)} ± ${toleranz.toFixed(0)}`);
  }
});

function einBBesucher(id) {
  const b = POP.find((x) => istB(id, x));
  assert.ok(b, 'Population ohne B-Besucher');
  return b;
}

test('Bots sehen A: jede Liste-Kennung, Google, Meta, Vorschau und generische Bots', () => {
  const uas = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0)',
    'Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)',
    'AdsBot-Google (+http://www.google.com/adsbot.html)',
    'Mediapartners-Google',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
    'WhatsApp/2.23.20.0',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
    'Mozilla/5.0 (compatible; SomeNewCrawler/1.0; +https://example.org/crawler)',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0.0.0 Safari/537.36',
    ...SUCH_UND_VORSCHAU_CRAWLER.map((k) => `Mozilla/5.0 (compatible; ${k}/1.0)`),
  ];
  for (const id of ALLE) {
    // eine IP, die mit Menschen-UA in B fällt: der Bot darf trotzdem nie umgeleitet werden
    for (const ua of uas) {
      for (const b of POP.slice(0, 400)) {
        assert.equal(entscheideSeitenExperiment(req(SEITEN_EXPERIMENTE[id].pfad_a, {ip: b.ip, ua}), {}, id), null, `${id}: ${ua}`);
      }
    }
  }
});

// KONZEPT 2.3 wörtlich (nicht aus dem Modul gelesen, sonst wäre eine gestrichene Kennung unsichtbar).
const KONZEPT_CRAWLER = [
  'googlebot', 'google-inspectiontool', 'adsbot', 'mediapartners', 'apis-google', 'storebot-google',
  'bingbot', 'duckduckbot', 'yandexbot', 'baiduspider', 'applebot', 'facebookexternalhit', 'facebot',
  'meta-externalagent', 'twitterbot', 'linkedinbot', 'slackbot', 'whatsapp', 'telegrambot', 'petalbot',
  'semrush', 'ahrefs', 'gptbot', 'claudebot', 'ccbot',
];

test('Such- und Vorschau-Crawler sehen A auch mit Pin b; Messwerkzeug (HeadlessChrome) erreicht B per Pin', () => {
  for (const id of ALLE) {
    const exp = SEITEN_EXPERIMENTE[id];
    for (const k of KONZEPT_CRAWLER) {
      const ua = `Mozilla/5.0 (compatible; ${k[0].toUpperCase()}${k.slice(1)}/1.0)`;
      assert.equal(entscheideSeitenExperiment(req(`${exp.pfad_a}?${exp.pin_param}=b`, {ua}), {}, id), null, `${id}: ${k}`);
    }
    const headless = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0.0.0 Safari/537.36';
    assert.ok(entscheideSeitenExperiment(req(`${exp.pfad_a}?${exp.pin_param}=b`, {ua: headless}), {}, id));
  }
});

test('Menschen-UAs gelten nicht als Crawler (In-App-Browser, CUBOT)', () => {
  for (const ua of MENSCHEN) assert.equal(istSuchOderVorschauCrawler(ua), false, ua);
});

test('Eigener Verkehr sieht A: Server-IP und Marker-UA', () => {
  for (const id of ALLE) {
    const b = einBBesucher(id);
    const pfad = SEITEN_EXPERIMENTE[id].pfad_a;
    assert.equal(entscheideSeitenExperiment(req(pfad, {ip: '65.108.150.121', ua: b.ua}), {}, id), null);
    assert.equal(entscheideSeitenExperiment(req(pfad, {ip: b.ip, ua: `${b.ua} QiBlancoInternal`}), {}, id), null);
  }
});

test('Ohne Client-IP: A (60 verschiedene Geräte)', () => {
  for (const id of ALLE) {
    for (let i = 0; i < 60; i += 1) {
      const ua = `${MENSCHEN[i % MENSCHEN.length]} v${i}`;
      assert.equal(entscheideSeitenExperiment(req(SEITEN_EXPERIMENTE[id].pfad_a, {ip: '', ua}), {}, id), null);
    }
  }
});

test('Pin a und b, je Experiment nur sein eigener Parameter', () => {
  for (const id of ALLE) {
    const exp = SEITEN_EXPERIMENTE[id];
    const anderer = id === START ? 'shop_exp' : 'start_exp';
    const b = einBBesucher(id);
    assert.equal(entscheideSeitenExperiment(req(`${exp.pfad_a}?${exp.pin_param}=a`, b), {}, id), null);
    const pinB = entscheideSeitenExperiment(req(`${exp.pfad_a}?${exp.pin_param}=b`, {ip: '65.108.150.121', ua: 'x QiBlancoInternal'}), {}, id);
    assert.equal(pinB.ziel, `${exp.pfad_b}?${exp.pin_param}=b&lp_m=${exp.marker}`);
    assert.equal(pinB.eimer, -1);
    assert.equal(entscheideSeitenExperiment(req(`${exp.pfad_a}?${anderer}=b`, {ip: '65.108.150.121', ua: 'x QiBlancoInternal'}), {}, id), null);
  }
});

test('Kill: Env-Wert off und Code-Schalter; andere Env-Werte schalten nicht ab', () => {
  for (const id of ALLE) {
    const exp = SEITEN_EXPERIMENTE[id];
    const b = einBBesucher(id);
    assert.ok(entscheideSeitenExperiment(req(exp.pfad_a, b), {}, id));
    assert.ok(entscheideSeitenExperiment(req(exp.pfad_a, b), {[exp.env_kill]: 'on'}, id));
    assert.equal(entscheideSeitenExperiment(req(exp.pfad_a, b), {[exp.env_kill]: 'off'}, id), null);
    assert.equal(entscheideSeitenExperiment(req(`${exp.pfad_a}?${exp.pin_param}=b`, b), {[exp.env_kill]: 'off'}, id), null);
    const aus = {[id]: {...exp, aktiv: false}};
    assert.equal(entscheideSeitenExperiment(req(exp.pfad_a, b), {}, id, aus), null);
    assert.equal(seitenExperimentAktiv(exp, {[exp.env_kill]: 'off'}), false);
  }
  // Kill des einen Experiments lässt die anderen laufen
  const bS = einBBesucher(START);
  assert.ok(entscheideSeitenExperiment(req('/', bS), {EXP_SHOP_MODE: 'off'}, START));
  assert.ok(entscheideSeitenExperiment(req('/', bS), {EXP_PB_MODE: 'off'}, START));
  const bP = einBBesucher(PB);
  assert.ok(entscheideSeitenExperiment(req('/pages/produktberatung', bP), {EXP_SHOP_MODE: 'off'}, PB));
});

test('pb-e1: geteilter Pin shop_exp wirkt nur über die eigene id; das Ziel trägt den Marker k', () => {
  const intern = {ip: '65.108.150.121', ua: 'x QiBlancoInternal'};
  const pin = entscheideSeitenExperiment(req('/pages/produktberatung?shop_exp=b', intern), {}, PB);
  assert.equal(pin.ziel, '/pages/produktberatung-b?shop_exp=b&lp_m=k');
  assert.equal(entscheideSeitenExperiment(req('/pages/produktberatung?shop_exp=a', intern), {}, PB), null);
  // Die Weiche selbst prüft keinen Pfad: dass q2p und pb sich nicht in die Quere kommen, sichern die
  // Loader, die je nur ihre id abfragen (pages.qione-2-pro.jsx bzw. pages.produktberatung.jsx).
  const bP = einBBesucher(PB);
  const roh = '?von=warenkorb-mail&termin=2026-10-15T14%3A00%3A00%2B02%3A00&utm_source=mail';
  assert.equal(entscheideSeitenExperiment(req(`/pages/produktberatung${roh}`, bP), {}, PB).ziel, `/pages/produktberatung-b${roh}&lp_m=k`);
});

test('.data-Request (React Router: Pfad ohne .data, mit _routes) bleibt im Arm, Ziel ohne _routes und index', () => {
  const b = einBBesucher(START);
  const ent = entscheideSeitenExperiment(req('/?_routes=root%2Croutes%2F_index&fbclid=AbC_1-2', b), {}, START);
  assert.equal(ent.ziel, '/pages/start-b?fbclid=AbC_1-2&lp_m=s');
  const nurIntern = entscheideSeitenExperiment(req('/?_routes=routes%2F_index&index', b), {}, START);
  assert.equal(nurIntern.ziel, '/pages/start-b?lp_m=s');
  const bq = einBBesucher(SHOP);
  const shop = entscheideSeitenExperiment(req('/pages/qione-2-pro?utm_source=meta&_routes=routes%2Fpages.qione-2-pro', bq), {}, SHOP);
  assert.equal(shop.ziel, '/pages/qione-2-pro-b?utm_source=meta&lp_m=q');
});

test('Roher Query byte-gleich plus Marker (fbclid, gclid, gad_*, utm_*, Kodierung, Reihenfolge)', () => {
  const roh =
    '?utm_source=facebook&utm_medium=social&utm_campaign=Herbst%20Aktion&fbclid=IwZXh0bgNhZW0BMABhZGlkAasb%2B_x&gclid=Cj0K-x_y&gad_source=1&gad_campaignid=22841&a=1&&b=';
  for (const id of ALLE) {
    const exp = SEITEN_EXPERIMENTE[id];
    const b = einBBesucher(id);
    const ent = entscheideSeitenExperiment(req(`${exp.pfad_a}${roh}`, b), {}, id);
    assert.equal(ent.ziel, `${exp.pfad_b}${roh}&lp_m=${exp.marker}`);
    const leer = entscheideSeitenExperiment(req(exp.pfad_a, b), {}, id);
    assert.equal(leer.ziel, `${exp.pfad_b}?lp_m=${exp.marker}`);
  }
  assert.equal(zielSuche(roh), roh);
  assert.equal(zielSuche(''), '');
  assert.equal(zielSuche('?_routes=x'), '');
  assert.equal(zielSuche('?a=1&_routes=x&b=2'), '?a=1&b=2');
});

test('POST, PUT und unbekannte Experiment-id: null; HEAD wird geteilt wie GET', () => {
  for (const id of ALLE) {
    const exp = SEITEN_EXPERIMENTE[id];
    const b = einBBesucher(id);
    assert.equal(entscheideSeitenExperiment(req(exp.pfad_a, {...b, method: 'POST'}), {}, id), null);
    assert.equal(entscheideSeitenExperiment(req(exp.pfad_a, {...b, method: 'PUT'}), {}, id), null);
    assert.ok(entscheideSeitenExperiment(req(exp.pfad_a, {...b, method: 'HEAD'}), {}, id));
  }
  assert.equal(entscheideSeitenExperiment(req('/', einBBesucher(START)), {}, 'gibt-es-nicht'), null);
  assert.equal(entscheideSeitenExperiment(null, {}, START), null);
});

test('Geräteklasse: mobil, Tablet und Desktop wie die anonyme Zählung (Receiver basis.device_class)', () => {
  const IPAD =
    'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
  const ANDROID_TABLET =
    'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
  const MAC =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
  assert.equal(geraeteKlasse(IPHONE), 'mobile');
  assert.equal(geraeteKlasse(ANDROID), 'mobile');
  assert.equal(geraeteKlasse(FB_INAPP), 'mobile');
  assert.equal(geraeteKlasse(CUBOT), 'mobile');
  assert.equal(geraeteKlasse(IPAD), 'tablet');
  assert.equal(geraeteKlasse(ANDROID_TABLET), 'tablet');
  assert.equal(geraeteKlasse(DESKTOP), 'desktop');
  assert.equal(geraeteKlasse(MAC), 'desktop');
  const s = SEITEN_EXPERIMENTE[START];
  assert.equal(anteilProzentFuer(s, DESKTOP, {}), 50);
  assert.equal(anteilProzentFuer(s, MAC, {}), 50);
  // Tablet zählt zu mobil (Geräte-Regel des Heatmap-Managers): eigener Anteil nur für desktop
  for (const ua of [IPHONE, ANDROID, FB_INAPP, CUBOT, IPAD, ANDROID_TABLET]) assert.equal(anteilProzentFuer(s, ua, {}), 15);
  for (const id of [SHOP, PB]) {
    for (const ua of [IPHONE, DESKTOP]) assert.equal(anteilProzentFuer(SEITEN_EXPERIMENTE[id], ua, {}), SEITEN_EXPERIMENTE[id].anteil_prozent);
  }
});

test('Desktop-Kill: EXP_START_DESKTOP_MODE=off setzt Desktop auf anteil_prozent zurück, mobil bleibt unberührt', () => {
  const s = SEITEN_EXPERIMENTE[START];
  assert.equal(anteilProzentFuer(s, DESKTOP, {EXP_START_DESKTOP_MODE: 'off'}), 15);
  assert.equal(anteilProzentFuer(s, DESKTOP, {EXP_START_DESKTOP_MODE: 'on'}), 50);
  assert.equal(anteilProzentFuer(s, IPHONE, {EXP_START_DESKTOP_MODE: 'off'}), 15);
  const desk = POP.filter(istDesktop);
  const bAus = desk.filter((b) => entscheideSeitenExperiment(req('/', b), {EXP_START_DESKTOP_MODE: 'off'}, START) !== null);
  for (const b of bAus) assert.ok(besucherEimer(b.ip, b.ua, s.salz) < 15);
  // der Gesamt-Kill wirkt weiter auf beide Geräte
  assert.equal(desk.filter((b) => entscheideSeitenExperiment(req('/', b), {EXP_START_MODE: 'off'}, START) !== null).length, 0);
});

test('Arm-Treue beim Wechsel 15 -> 50 % auf Desktop: wer vorher B sah, bleibt B; neu B sind genau die Eimer 15-49', () => {
  const s = SEITEN_EXPERIMENTE[START];
  for (const b of POP.filter(istDesktop)) {
    const e = besucherEimer(b.ip, b.ua, s.salz);
    const jetzt = entscheideSeitenExperiment(req('/', b), {}, START) !== null;
    if (e < 15) assert.ok(jetzt, `Eimer ${e}: war B, ist A`);
    assert.equal(jetzt, e < 50, `Eimer ${e}`);
  }
});

test('Naht: geraeteKlasse ist zeichengleich mit der Zählung in entry.server.jsx', () => {
  const rumpf = (text) => {
    const m = text.match(/export function geraeteKlasse\(ua\) \{\n[\s\S]*?\n\}\n/);
    assert.ok(m, 'geraeteKlasse nicht gefunden');
    return m[0];
  };
  const hier = readFileSync(new URL('./experiment-weiche.server.js', import.meta.url), 'utf8');
  const zaehlung = readFileSync(new URL('../entry.server.jsx', import.meta.url), 'utf8');
  assert.equal(rumpf(hier), rumpf(zaehlung));
});
