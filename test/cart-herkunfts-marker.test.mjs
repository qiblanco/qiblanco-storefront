// Regressionstest zu den consent-FREIEN Herkunfts-Markern an den drei
// Cart-Eintrittspunkten
// (Job 20260907-fbc-klick-id-überlebt-checkout-grenze-nicht-ads-unbewertbar-prio8, s02).
// Stil wie test/checkout-tracking-signallos.test.mjs: node:test/node:assert als
// Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/cart-herkunfts-marker.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT (s01, gemessen 2026-09-07 an
// orders.jsonl, DACH 30 T, n=28): 14 von 28 Orders trugen GAR KEIN
// note_attribute. Diese EINE leere Liste beantwortete DREI Fragen mit
// demselben Zustand — "kein Marketing-Consent" (rechtmaessig), "Kauf lief am
// instrumentierten Hydrogen-Cart vorbei" (Defekt) und "Identitaet vorher
// verloren" (Defekt). Solange die drei ununterscheidbar sind, ist jeder Fix
// auf eine von ihnen geraten.
//
// Der Fix vom 2026-08-09 machte den Marker INNEN unbedingt
// (buildAttributionCartAttributes). Der Frueh-Ausstieg eine Ebene HOEHER stand
// unverändert: ohne Consent lief die innere Funktion gar nicht erst an.
//
// WARUM DIESE DATEI DIE ROUTEN WIRKLICH AUSFUEHRT statt ihren Quelltext zu
// lesen: eine Quelltext-Zusicherung ist gegen genau diesen Defekt blind — der
// Marker STAND ja im Code, er wurde nur nie erreicht. Der `~/`-Alias wird
// dafür per module.registerHooks aufgeloest (Bordmittel seit Node 22.15).
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const APP = new URL('../app/', import.meta.url).href;
registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      // Der Alias kommt ohne Endung ('~/lib/checkout-tracking') — Vite loest
      // das auf, nacktes node nicht.
      // ACHTUNG: nicht auf "irgendeine Endung" prüfen — '~/lib/
      // cart-attribution.server' sieht sonst aus, als haette es schon eine
      // ('.server'), und die Aufloesung schlaegt fehl.
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs|ts|tsx)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
  load(url, kontext, naechster) {
    // Beide Cart-Routen sind .jsx, enthalten aber KEINE JSX-Syntax (ihre
    // Komponenten geben null zurück). Node kennt die Endung nicht und
    // braucht das Format ausdrücklich genannt.
    if (url.endsWith('.jsx')) {
      return {
        format: 'module',
        shortCircuit: true,
        source: readFileSync(fileURLToPath(url), 'utf8'),
      };
    }
    return naechster(url, kontext);
  },
});

const {persistAttributionOnCartResult} = await import(
  '../app/lib/cart-attribution.server.js'
);
const {action: attributionAction} = await import(
  '../app/routes/cart.attribution.jsx'
);
const {loader: linesLoader} = await import('../app/routes/cart.$lines.jsx');
const {classifyUserAgent, consentStateFromCookies} = await import(
  '../app/lib/checkout-tracking.js'
);
const {
  INTERN_NETZE,
  INTERN_UA_MARKER,
  istInterneIp,
  istInternerUserAgent,
} = await import('../app/lib/interner-verkehr.js');

// --- Sprachgebrauch -------------------------------------------------------
// HERKUNFT = die drei consent-freien Marker. PERSONENBEZOGEN = alles, was an
// eine Person ruecklesbar ist und deshalb consent-gegatet BLEIBEN muss.
// 2026-09-22 (Job 20260922-blinde-menge-...): `ad_params_seen` ist der VIERTE
// consent-freie Marker. Er steht bewusst HIER und nicht in PERSONENBEZOGEN: er
// traegt eine reine Ja/Nein-Auskunft ueber das VORHANDENSEIN eines
// Parameter-NAMENS, nie den Wert eines Ad-Parameters.
//
// DIESE LISTE IST DER ZAUN VON ARM-F6 und bleibt eine ERSCHOEPFENDE
// Aufzaehlung: ein fuenfter, unabsichtlich entstandener Schluessel faellt dort
// weiterhin auf. Sie wird nur mit einer bewussten Entscheidung verlaengert.
const HERKUNFT = [
  'attribution_source',
  'consent_state',
  'ua_class',
  'ad_params_seen',
];
const PERSONENBEZOGEN = [
  '_fbc',
  '_fbp',
  '_qpx_anon',
  'fbclid',
  'gclid',
  'landing_page',
  'referrer',
  'attribution_saved_at',
  // Upstream 2026-09-07 (Grossjob ads-rabattcode-sonde s03) dazugekommen:
  // aus trackingParams abgeleitet, also consent-gegatet — und damit ein Key,
  // der ohne Consent NICHT auftauchen darf.
  'qb_ad_id',
];

const UA_META =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 [FBAN/FBIOS;FBDV/iPhone14,3]';
const COOKIE_CONSENT_JA = 'CookieConsent={stamp:%27x%27,marketing:true}';
const COOKIE_CONSENT_NEIN = 'CookieConsent={stamp:%27x%27,marketing:false}';
// Ein voll bestueckter Besucher: Klick-ID in der URL, Identitaets-Cookies da.
const COOKIES_PERSONENBEZOGEN = '_fbp=fb.1.1000.222; _qpx_anon=anon-abc-123';
const URL_MIT_KLICK =
  'https://qiblanco.com/cart?fbclid=IwZXh0bgNhZW0BMABhTESTKLICK';

function anfrage({url = URL_MIT_KLICK, cookie = '', ua = UA_META, ip = ''} = {}) {
  const kopf = new Headers();
  if (cookie) kopf.set('Cookie', cookie);
  if (ua) kopf.set('User-Agent', ua);
  // `oxygen-buyer-ip` ist der einzige auf Oxygen belegte Traeger der Buyer-IP
  // (Begründung im Kopf von app/routes/collect.jsx).
  if (ip) kopf.set('oxygen-buyer-ip', ip);
  return new Request(url, {headers: kopf});
}

/** Merkt sich, womit cart.updateAttributes/cart.create aufgerufen wurde. */
function cartAttrappe({
  checkoutUrl = 'https://checkout.qiblanco.com/c/1',
  // Vorbestand am Warenkorb. Default leer = unveraendertes Verhalten fuer alle
  // Arme, die es vor ARM-G gab; ARM-G7 braucht ihn fuer die Monotonie-Regel.
  bestand = [],
} = {}) {
  const spur = {updateAttributes: null, create: null};
  return {
    spur,
    cart: {
      get: async () => ({id: 'gid://cart/1', checkoutUrl, attributes: bestand}),
      updateAttributes: async (attributes) => {
        spur.updateAttributes = attributes;
        return {cart: {id: 'gid://cart/1', checkoutUrl, attributes}};
      },
      create: async (eingabe) => {
        spur.create = eingabe;
        return {cart: {id: 'gid://cart/1', checkoutUrl, attributes: eingabe.attributes ?? []}};
      },
      setCartId: () => new Headers(),
    },
  };
}

const alsMap = (attrs) =>
  new Map((attrs ?? []).map((a) => [a.key, a.value]));

/**
 * Der gemeinsame Kern beider Haelften — je Aufrufer mit eigenem MARKER-Text,
 * damit ein roter Arm am Text erkennbar ist und nicht nur am Exit-Code.
 */
function pruefeHerkunftImmer(attrs, marker) {
  const m = alsMap(attrs);
  for (const key of HERKUNFT) {
    assert.ok(
      m.has(key),
      `${marker}: Herkunfts-Marker "${key}" fehlt — der Frueh-Ausstieg ist zurück`,
    );
    assert.ok(m.get(key), `${marker}: "${key}" ist leer`);
  }
  assert.equal(m.get('attribution_source'), 'qiblanco_hydrogen', marker);
}

function pruefeKeinPersonenbezug(attrs, marker) {
  const m = alsMap(attrs);
  for (const key of PERSONENBEZOGEN) {
    assert.ok(
      !m.has(key),
      `${marker}: personenbezogener Key "${key}" wurde OHNE Consent geschrieben — die Aenderung weitet die Datenmenge aus, das ist genau das Verbotene`,
    );
  }
}

// ===========================================================================
// ARM A — persistAttributionOnCartResult (app/lib/cart-attribution.server.js)
// ===========================================================================

test('ARM-A1 OHNE Consent: persistAttributionOnCartResult schreibt die drei Herkunfts-Marker', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({cookie: `${COOKIE_CONSENT_NEIN}; ${COOKIES_PERSONENBEZOGEN}`}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  assert.ok(
    spur.updateAttributes,
    'ARM-A1: updateAttributes wurde GAR NICHT gerufen — der Frueh-Ausstieg `if (!hasAttributionConsent(...)) return result` steht wieder da',
  );
  pruefeHerkunftImmer(spur.updateAttributes, 'ARM-A1');
});

test('ARM-A2 OHNE Consent: KEIN personenbezogener Key (die harte Grenze)', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({cookie: `${COOKIE_CONSENT_NEIN}; ${COOKIES_PERSONENBEZOGEN}`}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  pruefeKeinPersonenbezug(spur.updateAttributes, 'ARM-A2');
});

test('ARM-A3 MIT Consent: Herkunfts-Marker UND personenbezogene Keys', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({cookie: `${COOKIE_CONSENT_JA}; ${COOKIES_PERSONENBEZOGEN}`}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  pruefeHerkunftImmer(spur.updateAttributes, 'ARM-A3');
  const m = alsMap(spur.updateAttributes);
  assert.equal(
    m.get('fbclid'),
    'IwZXh0bgNhZW0BMABhTESTKLICK',
    'ARM-A3: mit Consent muss die Klick-ID weiterhin ankommen — sonst hat der Bau die Attribution KAPUTT gemacht statt sie messbar',
  );
  assert.equal(m.get('_qpx_anon'), 'anon-abc-123', 'ARM-A3');
  assert.equal(m.get('consent_state'), 'granted', 'ARM-A3');
});

// ===========================================================================
// ARM B — cart.attribution.jsx (der Kassen-Knopf)
// ===========================================================================

test('ARM-B1 OHNE Consent: der Kassen-Knopf schreibt die drei Herkunfts-Marker', async () => {
  const {spur, cart} = cartAttrappe();
  await attributionAction({
    request: anfrage({cookie: `${COOKIE_CONSENT_NEIN}; ${COOKIES_PERSONENBEZOGEN}`}),
    context: {cart, env: {}},
  });
  assert.ok(
    spur.updateAttributes,
    'ARM-B1: der Kassen-Knopf setzte GAR KEIN Attribut — genau der Zustand, der 14 von 28 DACH-Orders leer liess',
  );
  pruefeHerkunftImmer(spur.updateAttributes, 'ARM-B1');
  pruefeKeinPersonenbezug(spur.updateAttributes, 'ARM-B1');
});

test('ARM-B2 MIT Consent: der Kassen-Knopf trägt zusaetzlich die Klick-ID', async () => {
  const {spur, cart} = cartAttrappe();
  await attributionAction({
    request: anfrage({cookie: `${COOKIE_CONSENT_JA}; ${COOKIES_PERSONENBEZOGEN}`}),
    context: {cart, env: {}},
  });
  pruefeHerkunftImmer(spur.updateAttributes, 'ARM-B2');
  assert.equal(
    alsMap(spur.updateAttributes).get('fbclid'),
    'IwZXh0bgNhZW0BMABhTESTKLICK',
    'ARM-B2',
  );
});

// ===========================================================================
// ARM C — cart.$lines.jsx (Direkt-zur-Kasse-Link)
// ===========================================================================

test('ARM-C1 OHNE Consent: der Direktlink legt den Cart MIT Herkunfts-Markern an', async () => {
  const {spur, cart} = cartAttrappe();
  await linesLoader({
    request: anfrage({
      url: 'https://qiblanco.com/cart/41007289663544:1?fbclid=IwZXh0bgNhZW0BMABhTESTKLICK',
      cookie: `${COOKIE_CONSENT_NEIN}; ${COOKIES_PERSONENBEZOGEN}`,
    }),
    context: {cart, env: {}},
    params: {lines: '41007289663544:1'},
  });
  assert.ok(spur.create, 'ARM-C1: cart.create wurde nicht gerufen');
  assert.ok(
    spur.create.attributes,
    'ARM-C1: der Cart wurde OHNE jedes Attribut angelegt — die Order ist danach nicht von einem Cart-Bypass zu unterscheiden',
  );
  pruefeHerkunftImmer(spur.create.attributes, 'ARM-C1');
  pruefeKeinPersonenbezug(spur.create.attributes, 'ARM-C1');
});

test('ARM-C2 MIT Consent: der Direktlink trägt zusaetzlich die Klick-ID', async () => {
  const {spur, cart} = cartAttrappe();
  await linesLoader({
    request: anfrage({
      url: 'https://qiblanco.com/cart/41007289663544:1?fbclid=IwZXh0bgNhZW0BMABhTESTKLICK',
      cookie: `${COOKIE_CONSENT_JA}; ${COOKIES_PERSONENBEZOGEN}`,
    }),
    context: {cart, env: {}},
    params: {lines: '41007289663544:1'},
  });
  pruefeHerkunftImmer(spur.create.attributes, 'ARM-C2');
  assert.equal(
    alsMap(spur.create.attributes).get('fbclid'),
    'IwZXh0bgNhZW0BMABhTESTKLICK',
    'ARM-C2',
  );
});

// ===========================================================================
// ARM D — die Werte selbst
// ===========================================================================

test('ARM-D1 ua_class: zeichengleich mit dem Bestands-Klassifikator (hyros-eigenbau basis.py ua_klasse)', () => {
  // P10: die Erwartungswerte sind die Ausgaben von
  // hyros-eigenbau/receiver/src/basis.py::ua_klasse für dieselben Eingaben
  // (Paritaet 18/18 gemessen 2026-09-07). Ein zweiter, abweichender
  // Klassifikator wäre in der späteren Auswertung nicht mehr zu trennen.
  const faelle = [
    [UA_META, 'webview_meta'],
    ['Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Instagram 302.0.0.23.113', 'webview_meta'],
    ['Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 musical_ly_2022', 'webview_andere'],
    ['Mozilla/5.0 (Linux; Android 13; wv) AppleWebKit/537.36 Chrome/120', 'webview_andere'],
    ['Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 MicroMessenger/8.0.40', 'webview_andere'],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
      'browser',
    ],
    [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
      'webview_vermutet',
    ],
    ['Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 CriOS/120.0 Mobile/15E148 Safari/604.1', 'browser'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36', 'browser'],
    ['', 'unbekannt'],
    [null, 'unbekannt'],
  ];
  for (const [ua, erwartet] of faelle) {
    assert.equal(
      classifyUserAgent(ua),
      erwartet,
      `ARM-D1: Klassifikator weicht vom Bestand ab für "${String(ua).slice(0, 50)}"`,
    );
  }
});

test('ARM-D2 ua_class: leerer User-Agent ergibt NIE "browser"', () => {
  // Der Bestand begründet das ausdrücklich: ein Default auf 'browser' wäre
  // ein erfundener Messwert in genau der entlastenden Richtung.
  assert.notEqual(classifyUserAgent(''), 'browser', 'ARM-D2');
  assert.notEqual(classifyUserAgent(undefined), 'browser', 'ARM-D2');
});

test('ARM-D3 consent_state ist DREIwertig — "kein Stempel" ist nicht "abgelehnt"', () => {
  assert.equal(consentStateFromCookies(COOKIE_CONSENT_JA), 'granted', 'ARM-D3');
  assert.equal(consentStateFromCookies(COOKIE_CONSENT_NEIN), 'denied', 'ARM-D3');
  assert.equal(consentStateFromCookies('foo=bar'), 'unknown', 'ARM-D3');
  assert.equal(consentStateFromCookies(''), 'unknown', 'ARM-D3');
  assert.equal(consentStateFromCookies(null), 'unknown', 'ARM-D3');
});

// ===========================================================================
// ARM E — _fbc-Auffrischung in public/qiblanco-tracker.js
// ===========================================================================
// Der Tracker ist ein Browser-IIFE ohne Export. Statt seinen Quelltext zu
// lesen (was gegen genau diesen Defekt blind wäre — der Code STAND ja da),
// läuft er hier in node:vm gegen eine Mini-DOM-Attrappe. Der Preview-Schalter
// data-qiblanco-tracking-preview öffnet trackingAllowed() ohne Cookiebot.

function trackerLaufen({search, cookiesVorher, gepuffertesFbclid = ''}) {
  const jar = new Map(Object.entries(cookiesVorher));
  // Der sessionStorage-Puffer ist NICHT Beiwerk: ohne ihn kann ARM-E3 gar nicht
  // rot werden (gemessen — die Mutation "gepufferter fbclid darf
  // überschreiben" liess den Arm gruen, weil die Attrappe nie einen Puffer
  // hatte). Eine Prüfung, die nicht rot werden kann, belegt nichts.
  const puffer = new Map();
  if (gepuffertesFbclid) {
    puffer.set(
      'qiblanco_checkout_attribution',
      JSON.stringify({params: [['fbclid', gepuffertesFbclid]], href: 'https://qiblanco.com/', savedAt: '2026-09-01T00:00:00.000Z'}),
    );
  }
  const attrs = {'data-qiblanco-tracking-preview': 'true'};
  const dom = {
    documentElement: {getAttribute: (n) => attrs[n] ?? null},
    get cookie() {
      return [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set cookie(zeile) {
      const [paar] = String(zeile).split(';');
      const i = paar.indexOf('=');
      jar.set(paar.slice(0, i).trim(), paar.slice(i + 1).trim());
    },
    head: {appendChild() {}},
    createElement: () => ({setAttribute() {}, style: {}}),
    addEventListener() {},
    referrer: '',
    title: '',
  };
  const fenster = {
    location: {search, href: 'https://qiblanco.com/' + search, hostname: 'qiblanco.com', protocol: 'https:'},
    history: {pushState() {}, replaceState() {}},
    addEventListener() {},
    setTimeout: () => 0,
    navigator: {userAgent: UA_META, sendBeacon: () => true},
    sessionStorage: {
      getItem: (k) => puffer.get(k) ?? null,
      setItem: (k, v) => puffer.set(k, v),
      removeItem: (k) => puffer.delete(k),
    },
    localStorage: {getItem: () => null, setItem() {}, removeItem() {}},
    Cookiebot: undefined,
    screen: {width: 390, height: 844},
    JSON,
    URLSearchParams,
    Date,
  };
  fenster.window = fenster;
  fenster.document = dom;
  const kontext = vm.createContext(fenster);
  const quelle = readFileSync(
    fileURLToPath(new URL('../public/qiblanco-tracker.js', import.meta.url)),
    'utf8',
  );
  try {
    vm.runInContext(quelle, kontext);
  } catch {
    // Der Tracker macht danach noch Netz-/Beacon-Dinge, die die Attrappe nicht
    // kennt. Für diesen Arm zählt allein, was bis dahin im Cookie-Jar steht.
  }
  return jar.get('_fbc') || '';
}

const FBCLID_ALT = 'IwZXh0bgNhZW0BMABhALT0000000';
const FBCLID_NEU = 'IwZXh0bgNhZW0BMABhNEU00000000';
const fbclidAus = (fbc) => (String(fbc).split('.')[3] ?? ''); // Feld [3]! [1] ist die FORMAT-VERSION

test('ARM-E1 DER FIX: neuer Ad-Klick frischt ein veraltetes _fbc auf', () => {
  // Gemessen (events.db, ganze Historie): 10083 von 179495 fbclid-Events mit
  // _fbc trugen eine veraltete Klick-ID, 8837 davon eine fruehere fbclid
  // DESSELBEN Besuchers. Die Quote wächst entlang des Trichters bis
  // 42,31 % bei initiate_checkout.
  const fbc = trackerLaufen({
    search: `?fbclid=${FBCLID_NEU}`,
    cookiesVorher: {_fbc: `fb.1.1000000000.${FBCLID_ALT}`},
  });
  assert.equal(
    fbclidAus(fbc),
    FBCLID_NEU,
    'ARM-E1: das _fbc trägt weiter die ALTE fbclid — der Frueh-Ausstieg `if (readCookie("_fbc")) return;` ist zurück, und die Klick-Identitaet friert 90 Tage ein',
  );
});

test('ARM-E2 GEGENRICHTUNG: gleiche fbclid wird NICHT neu gestempelt', () => {
  // Sonst wanderte der Zeitstempel bei jedem Seitenaufruf und das
  // Lookback-Fenster liesse sich nie schließen.
  const vorher = `fb.1.1000000000.${FBCLID_ALT}`;
  const fbc = trackerLaufen({
    search: `?fbclid=${FBCLID_ALT}`,
    cookiesVorher: {_fbc: vorher},
  });
  assert.equal(fbc, vorher, 'ARM-E2: das _fbc wurde ohne neuen Klick neu gestempelt');
});

test('ARM-E3 GEGENRICHTUNG: ein GEPUFFERTER fbclid darf ein vorhandenes _fbc NIE ueberschreiben', () => {
  // Der Puffer kann aelter sein als das, was fbevents.js gerade geschrieben
  // hat — überschreiben hiesse, eine frische Klick-Identitaet durch eine
  // aeltere zu ersetzen. Der Puffer ist hier ECHT bestueckt und trägt eine
  // ANDERE fbclid als das Cookie; ohne beides wäre der Arm gruen by
  // construction und würde nichts belegen.
  const vorher = `fb.1.1000000000.${FBCLID_ALT}`;
  const fbc = trackerLaufen({
    search: '',
    cookiesVorher: {_fbc: vorher},
    gepuffertesFbclid: FBCLID_NEU,
  });
  assert.equal(
    fbc,
    vorher,
    'ARM-E3: der gepufferte fbclid hat das vorhandene _fbc ueberschrieben — eine moeglicherweise AELTERE Klick-Identitaet hat eine frischere verdraengt',
  );
});

test('ARM-E4 Bestand: ohne vorhandenes _fbc wird aus der fbclid eines gebaut', () => {
  const fbc = trackerLaufen({search: `?fbclid=${FBCLID_NEU}`, cookiesVorher: {}});
  assert.equal(fbclidAus(fbc), FBCLID_NEU, 'ARM-E4');
  assert.match(fbc, /^fb\.1\.\d+\./, 'ARM-E4: Meta-Format fb.1.<ts>.<fbclid> verletzt');
});


// ===========================================================================
// ARM F — `intern`: unser EIGENER Messverkehr ist vom Kunden unterscheidbar
// (Job 20260913-GROSSJOB-eigener-messverkehr..., Segment s02)
//
// WARUM: `kaufweg-nachlauf` legt 72x am Tag über beide Storefronts einen
// Warenkorb an. Bis hierher trug der `ua_class` dieser Koerbe den Wert
// `browser` — denselben wie ein Kunde.
//
// DIE TEURERE RICHTUNG IST DIE ÜBERSPERRUNG, und sie fällt STILL aus: ein
// Kunde, der fälschlich `intern` trägt, verschwindet aus genau den Zahlen,
// die dieser Bau sauber machen soll, und die Zahl sieht danach nur kleiner
// aus. F3 bis F6 sind deshalb Negativ-Kontrollen, nicht Beiwerk.
// ===========================================================================

const UA_INTERN =
  'QiBlancoInternal/1.0 (kaufweg-nachlauf) (+https://qiblanco.com; interner Server-Zugriff, nicht tracken)';
const UA_ECHT_DESKTOP =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const IP_INTERN_V4 = '65.108.150.121';
const IP_INTERN_V6 = '2a01:4f9:c014:781e::2';

test('ARM-F1 der Marker-UA ergibt ua_class=intern', () => {
  assert.equal(classifyUserAgent(UA_INTERN), 'intern', 'ARM-F1');
  assert.equal(
    classifyUserAgent('qiblanco-monitoring-leitstand/2'),
    'intern',
    'ARM-F1 zweiter SSoT-Marker',
  );
});

test('ARM-F2 die IP-Achse trägt AUCH bei echtem Browser-UA (zwei Achsen)', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({ua: UA_ECHT_DESKTOP, ip: IP_INTERN_V4}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  assert.equal(
    alsMap(spur.updateAttributes).get('ua_class'),
    'intern',
    'ARM-F2: eine Wache, die ihren Marker-UA vergisst, muss an der IP erkannt werden',
  );
});

test('ARM-F2b und die UA-Achse trägt OHNE jede IP (Shopify-Liquid hat keine)', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({ua: UA_INTERN}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  assert.equal(alsMap(spur.updateAttributes).get('ua_class'), 'intern', 'ARM-F2b');
});

test('ARM-F2c IPv6 aus unserem /64 zählt ebenfalls', () => {
  assert.equal(istInterneIp(IP_INTERN_V6), true, 'ARM-F2c');
  assert.equal(istInterneIp('2a01:4f9:c014:781e:1:2:3:4'), true, 'ARM-F2c voll');
});

test('ARM-F3 ÜBERSPERRUNG: echte Kunden-UAs sind NIE intern', () => {
  const echte = [
    UA_ECHT_DESKTOP,
    UA_META,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  ];
  for (const ua of echte) {
    assert.notEqual(classifyUserAgent(ua), 'intern', `ARM-F3: "${ua}"`);
  }
  // Die Marke allein reicht NICHT — "qiblanco" ist kein SSoT-Marker, und ein
  // Kunde könnte sie in einem Zweck-String tragen.
  assert.equal(istInternerUserAgent('qiblanco'), false, 'ARM-F3 Marke allein');
  assert.equal(istInternerUserAgent(''), false, 'ARM-F3 leer');
  assert.equal(istInternerUserAgent(null), false, 'ARM-F3 null');
});

test('ARM-F4 ÜBERSPERRUNG: Nachbar-IPs und Unsinn sind NIE intern', () => {
  const fremde = [
    '65.108.150.120', // direkt daneben, /32 heißt /32
    '65.108.150.122',
    '65.108.151.121',
    '65.108.0.0',
    '2a01:4f9:c014:781f::1', // Nachbar-/64
    '2a01:4f9:c014:781::1',
    '::1',
    '', 'kaputt', '999.1.1.1', '65.108.150', '::ffff:65.108.150.121',
  ];
  for (const ip of fremde) {
    assert.equal(istInterneIp(ip), false, `ARM-F4: "${ip}" darf NICHT intern sein`);
  }
  assert.equal(istInterneIp(undefined), false, 'ARM-F4 undefined');
});

test('ARM-F5 ein Kunde mit Kunden-IP behält seine echte Klasse', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({ua: UA_META, ip: '203.0.113.7'}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  assert.equal(
    alsMap(spur.updateAttributes).get('ua_class'),
    'webview_meta',
    'ARM-F5: der Meta-Webview darf durch den neuen Wert nicht verlorengehen',
  );
});

test('ARM-F6 `intern` ist ein WERT, kein neuer Schlüssel (Checkout-Grenze)', async () => {
  const {spur, cart} = cartAttrappe();
  await persistAttributionOnCartResult({
    cart,
    request: anfrage({ua: UA_INTERN, ip: IP_INTERN_V4}),
    env: {},
    result: {cart: {id: 'gid://cart/1', attributes: []}},
  });
  const keys = (spur.updateAttributes ?? []).map((a) => a.key).sort();
  // WAS DIESER ARM WIRKLICH BEWACHT: dass die Klasse `intern` ein WERT in
  // `ua_class` bleibt und sich keinen eigenen Schluessel nimmt. Er zaehlt dafuer
  // die Schluesselmenge gegen HERKUNFT — also gegen eine benannte Liste, nicht
  // gegen eine eingefrorene Zahl.
  //
  // KORREKTUR DER BEGRUENDUNG 2026-09-22: hier stand, ein neuer Schluessel
  // muesste in TRACKING_COOKIE_NAMES nachgetragen werden und fiele sonst an der
  // Domaingrenze weg (der `_qpx_anon`-Bug). Das gilt fuer einen COOKIE, der die
  // Checkout-Domaingrenze ueberqueren muss — nicht fuer ein Cart-Attribut, das
  // per `cart.updateAttributes` direkt in den Warenkorb geht. Der lebende Beleg
  // steht in dieser Liste selbst: `consent_state` und `ua_class` sind am
  // 2026-09-07 als neue Schluessel entstanden, TRACKING_COOKIE_NAMES blieb
  // unberuehrt, und nichts ist weggefallen.
  assert.deepEqual(
    keys,
    [...HERKUNFT].sort(),
    'ARM-F6: es darf KEIN zusaetzlicher Schlüssel entstehen',
  );
  pruefeKeinPersonenbezug(spur.updateAttributes, 'ARM-F6');
});

test('ARM-F7 der SSoT-Spiegel ist nicht leer (Deko-Schutz)', () => {
  assert.ok(INTERN_UA_MARKER.length >= 1, 'ARM-F7 UA-Marker');
  assert.ok(INTERN_NETZE.length >= 1, 'ARM-F7 Netze');
  // Ein Marker, der in einem echten Browser-UA vorkaeme, würde Kunden
  // aussperren — dieselbe Sperre hat die SSoT im Loader.
  for (const m of INTERN_UA_MARKER) {
    assert.ok(m.length >= 8, `ARM-F7: Marker "${m}" ist zu unspezifisch`);
    assert.equal(
      UA_ECHT_DESKTOP.toLowerCase().includes(m.toLowerCase()),
      false,
      `ARM-F7: Marker "${m}" kommt in einem echten Browser-UA vor`,
    );
  }
});

// ===========================================================================
// ARM G — ad_params_seen: der consent-freie Ankunfts-Marker
// (Job 20260922-blinde-menge-attributionscookie-macht-anzeigenwirkung-
// unentscheidbar)
//
// DER ZUSTAND, DEN DIESE ARME FESTNAGELN (gemessen 2026-09-22, Vollerhebung
// d30, Nenner 41 Orders): 27 Orders trugen KEIN Feld aus dem gespeicherten
// Attributions-Cookie. Dieser EINE Zustand entsteht aus ZWEI Lagen — "kam ohne
// Ad-Parameter" (rechtmaessig) und "kam mit, aber der Cookie ueberlebte nicht"
// (Blindstelle). Solange beide gleich aussehen, ist Anzeigenwirkung auf
// Order-Ebene unentscheidbar.
//
// DIE HARTE GRENZE, die ARM-G8 bewacht: der Marker darf den WERT eines
// Ad-Parameters weder lesen noch schreiben. Er beantwortet ausschliesslich, OB
// ein Parameter-NAME vorkam.
// ===========================================================================

const AD_ID_TEST = '9990000000000922'; // Praefix 999 — keine echte Anzeige.

/** POST auf /cart/attribution, wahlweise mit dem versteckten Feld. */
function kassenAnfrage({
  url = 'https://qiblanco.com/cart',
  cookie = '',
  ua = UA_META,
  feld = undefined,
  referer = '',
} = {}) {
  const kopf = new Headers();
  if (cookie) kopf.set('Cookie', cookie);
  if (ua) kopf.set('User-Agent', ua);
  if (referer) kopf.set('Referer', referer);
  const koerper = new FormData();
  if (feld !== undefined) koerper.set('ad_params_seen', feld);
  return new Request(url, {method: 'POST', headers: kopf, body: koerper});
}

async function kasseMarker(optionen) {
  const {spur, cart} = cartAttrappe(optionen?.attrappe);
  await attributionAction({
    request: kassenAnfrage(optionen),
    context: {cart, env: {}},
  });
  return {marker: alsMap(spur.updateAttributes).get('ad_params_seen'), spur};
}

test('ARM-G1 OHNE Consent: der Client-Marker "yes" wird zu yes_client', async () => {
  const {marker, spur} = await kasseMarker({
    cookie: COOKIE_CONSENT_NEIN,
    feld: 'yes',
  });
  assert.equal(marker, 'yes_client', 'ARM-G1');
  // Der ganze Zweck: OHNE Zustimmung, und trotzdem entscheidbar.
  pruefeKeinPersonenbezug(spur.updateAttributes, 'ARM-G1');
});

test('ARM-G2 der Client-Marker "no" wird zu no — belegte Abwesenheit', async () => {
  const {marker} = await kasseMarker({cookie: COOKIE_CONSENT_NEIN, feld: 'no'});
  assert.equal(marker, 'no', 'ARM-G2');
});

test('ARM-G3 KEIN Feld ist "unknown", NIE "no" (Lesefehler ist kein Leerwert)', async () => {
  const {marker} = await kasseMarker({cookie: COOKIE_CONSENT_NEIN});
  assert.equal(
    marker,
    'unknown',
    'ARM-G3: ohne JavaScript/Tracker faellt der Marker auf unknown — ein "no" waere hier eine erfundene Tatsache',
  );
});

test('ARM-G4 Fremdeingabe wird NIE durchgereicht', async () => {
  // Das Feld kommt aus dem Browser. Jeder Wert ausser den zwei bekannten
  // Woertern faellt auf unknown — auch einer, der wie ein gueltiger aussieht.
  for (const boese of ['<script>alert(1)</script>', 'yes_query', 'YES', '', 'ja']) {
    const {marker} = await kasseMarker({cookie: COOKIE_CONSENT_NEIN, feld: boese});
    assert.equal(marker, 'unknown', `ARM-G4: "${boese}" haette nicht durchgehen duerfen`);
  }
});

test('ARM-G5 der Referer traegt die Antwort ohne jedes JavaScript', async () => {
  const {marker} = await kasseMarker({
    cookie: COOKIE_CONSENT_NEIN,
    referer: `https://qiblanco.com/pages/schlaf-zellen-schutz?utm_source=facebook&utm_content=${AD_ID_TEST}`,
  });
  assert.equal(marker, 'yes_referer', 'ARM-G5');
});

test('ARM-G6 der Direkt-zur-Kasse-Link traegt sie in der eigenen Query', async () => {
  const {spur, cart} = cartAttrappe();
  await linesLoader({
    request: anfrage({
      url: `https://qiblanco.com/cart/41007289663544:1?utm_content=${AD_ID_TEST}`,
      cookie: COOKIE_CONSENT_NEIN,
    }),
    context: {cart, env: {}},
    params: {lines: '41007289663544:1'},
  });
  assert.equal(
    alsMap(spur.create.attributes).get('ad_params_seen'),
    'yes_query',
    'ARM-G6',
  );
});

test('ARM-G7 MONOTON: ein belegtes yes_ wird nie abgewertet', async () => {
  const {marker} = await kasseMarker({
    cookie: COOKIE_CONSENT_NEIN,
    feld: 'no',
    attrappe: {bestand: [{key: 'ad_params_seen', value: 'yes_query'}]},
  });
  assert.equal(
    marker,
    'yes_query',
    'ARM-G7: mergeCartAttributes ueberschreibt bedingungslos — ohne die Monotonie-Regel wuerde ein spaeterer, schlechter informierter Lauf die belegte Ankunft still loeschen',
  );
});

test('ARM-G8 DIE HARTE GRENZE: der WERT des Ad-Parameters taucht nirgends auf', async () => {
  const {spur} = await kasseMarker({
    cookie: COOKIE_CONSENT_NEIN, // KEINE Zustimmung
    feld: 'yes',
    referer: `https://qiblanco.com/pages/x?utm_content=${AD_ID_TEST}&fbclid=TESTKLICK999`,
  });
  const alles = JSON.stringify(spur.updateAttributes ?? []);
  assert.ok(
    !alles.includes(AD_ID_TEST),
    'ARM-G8: die Ad-Id steht in den Attributen — der Marker darf das VORHANDENSEIN melden, nie den WERT',
  );
  assert.ok(!alles.includes('TESTKLICK999'), 'ARM-G8: Klick-Id durchgereicht');
  pruefeKeinPersonenbezug(spur.updateAttributes, 'ARM-G8');
});

test('ARM-G9 NEGATIVKONTROLLE: ohne jeden Ad-Parameter entsteht NIE ein yes_', async () => {
  // Diese Probe kann rot werden: sie wuerde anschlagen, sobald irgendeine der
  // vier Achsen "ja" sagt, ohne dass ein Ad-Parameter im Spiel war — also
  // genau dann, wenn der Marker jeden Direktbesucher zum Ad-Klicker macht.
  const {marker} = await kasseMarker({
    url: 'https://qiblanco.com/cart',
    cookie: COOKIE_CONSENT_NEIN,
    feld: 'no',
    referer: 'https://www.google.com/',
  });
  assert.equal(marker, 'no', 'ARM-G9: ein Direktbesucher wurde als Ad-Klicker gezaehlt');
});

test('ARM-G10 MIT Consent aendert der Marker sein Verhalten NICHT', async () => {
  // Die Zustimmung ist fuer diesen Marker gegenstandslos — er liest nur
  // Request-Metadaten. Waere er consent-abhaengig, waere er fuer die blinde
  // Menge (ueberwiegend Besucher ohne gespeicherte Attribution) wertlos.
  const ohne = await kasseMarker({cookie: COOKIE_CONSENT_NEIN, feld: 'yes'});
  const mit = await kasseMarker({cookie: COOKIE_CONSENT_JA, feld: 'yes'});
  assert.equal(ohne.marker, mit.marker, 'ARM-G10');
});
