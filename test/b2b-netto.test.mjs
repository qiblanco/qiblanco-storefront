// Wächter: „Als Firma ohne MwSt bestellen“ im Warenkorb (node --test, ohne
// Bundler, ohne Netz). Job 20261108-prio2-folge-storefront-knopf-firma-ohne-mwst-netto-weg.
// Christian 08.11.2026: „… dass die Rechnung und die Zahlung gleich ohne
// Mehrwertsteuer erfolgt und auch gleich eine Prüfung einbauen, dass die
// Mehrwertsteuer[-Nummer] geprüft wird.“
//
// Gemessen wird die Route WIRKLICH (loader und action von
// app/routes/b2b-netto.jsx mit gestelltem Warenkorb und gestellter Tür über
// globalThis.fetch), nicht ihr Quelltext:
//   - Sichtbarkeit nur bei netto=an (intern auch bei trocken), 60 s gemerkt,
//   - Warenkorbzeilen kommen aus dem Warenkorb der Sitzung, nie aus dem Browser,
//   - Tracking-Schlüssel reisen als merkmale (Cross-Boundary), personenbezogene
//     nur mit Einwilligung,
//   - weitergeleitet wird nur auf eine Shopify-Bezahlseite,
//   - die NAHT zur Tür: jeder Schlüssel, den der Shop schickt und der in die
//     Bestellung gehört, passiert die Allowlist des Servers (netto.MERKMAL_ERLAUBT).
// ROT VOR GRÜN: auf origin/main db0ee97e fehlen app/lib/b2b-netto*.js und die
// Route (Import scheitert, alle Tests rot).
// Ausführen: node --test test/b2b-netto.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {existsSync, readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';

const APP = new URL('../app/', import.meta.url).href;

registerHooks({
  resolve(spezifizierer, kontext, naechster) {
    if (spezifizierer.startsWith('~/')) {
      const pfad = APP + spezifizierer.slice(2);
      return naechster(/\.(js|jsx|mjs)$/.test(pfad) ? pfad : pfad + '.js', kontext);
    }
    return naechster(spezifizierer, kontext);
  },
  load(url, kontext, naechster) {
    // Die Route ist .jsx, enthält aber keine JSX-Syntax.
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

const lib = await import('../app/lib/b2b-netto.js');
const srv = await import('../app/lib/b2b-netto.server.js');
const route = await import('../app/routes/b2b-netto.jsx');

const COOKIE_CONSENT_JA =
  'CookieConsent={stamp:%27x%27,necessary:true,preferences:false,statistics:false,marketing:true,method:%27explicit%27,ver:1,utc:' +
  Date.now() +
  ',region:%27de%27,qbv:%272.0%27}';
const UA_KUNDE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

function zeile(id, menge = 1, extra = {}) {
  return {
    id: `gid://shopify/CartLine/${id}`,
    quantity: menge,
    attributes: [],
    discountAllocations: [],
    merchandise: {id: `gid://shopify/ProductVariant/${id}`},
    ...extra,
  };
}
function warenkorb(zeilen, extra = {}) {
  return {
    id: 'gid://shopify/Cart/abc',
    checkoutUrl: 'https://checkout.qiblanco.com/cart/c/abc',
    lines: {nodes: zeilen},
    cost: {subtotalAmount: {amount: '100.00', currencyCode: 'EUR'}},
    discountCodes: [],
    appliedGiftCards: [],
    attributes: [
      {key: '_fbc', value: 'fb.1.1000.KLICK'},
      {key: 'utm_source', value: 'facebook'},
      {key: 'attribution_source', value: 'storefront'},
    ],
    ...extra,
  };
}

/** Stellt die Tür: /healthz und /api/netto, zeichnet jede Anfrage auf. */
function tuer({stand = 'an', antwort = null, status = 200} = {}) {
  const auf = [];
  globalThis.fetch = async (url, init = {}) => {
    auf.push({url: String(url), init});
    if (String(url).endsWith('/healthz')) {
      return new Response(JSON.stringify({ok: true, netto: stand}), {status: 200});
    }
    return new Response(
      JSON.stringify(
        antwort ?? {ok: true, url: 'https://qi-blanco.myshopify.com/123/invoices/abc'},
      ),
      {status},
    );
  };
  return auf;
}

function formular(felder = {}) {
  const f = new FormData();
  const voll = {
    firma: 'Muster GmbH',
    uid: 'ATU16370905',
    vorname: 'Anna',
    nachname: 'Muster',
    anschrift: 'Ringstraße 1',
    plz: '1010',
    ort: 'Wien',
    land: 'AT',
    email: 'einkauf@muster.at',
    website: '',
    ...felder,
  };
  for (const [k, v] of Object.entries(voll)) f.set(k, v);
  return f;
}

function postAnfrage(form, cookie = COOKIE_CONSENT_JA) {
  const kopf = new Headers({'User-Agent': UA_KUNDE});
  if (cookie) kopf.set('Cookie', cookie);
  return new Request('https://qiblanco.com/b2b-netto', {
    method: 'POST',
    headers: kopf,
    body: form,
  });
}

const kontext = (cart) => ({
  cart: {get: async () => cart},
  env: {},
});

// ---------------------------------------------------------------- Regeln --

test('nettoWegMoeglich: normaler Warenkorb ja, alles mit Verlust nein', () => {
  assert.equal(lib.nettoWegMoeglich(warenkorb([zeile(1, 2), zeile(2)])), true);
  assert.equal(lib.nettoWegMoeglich(warenkorb([])), false, 'leer');
  assert.equal(lib.nettoWegMoeglich(null), false, 'kein Warenkorb');
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1, 1, {attributes: [{key: '_qb_addon', value: 'wunschnummer'}]})]),
    ),
    false,
    'Zeilen-Merkmal (Wunschnummer) ginge verloren',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([
        zeile(1, 1, {discountAllocations: [{discountedAmount: {amount: '10.0'}}]}),
      ]),
    ),
    false,
    'Zeilenrabatt ginge verloren',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1)], {discountCodes: [{code: 'X', applicable: true}]}),
    ),
    false,
    'Rabattcode',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1)], {discountCodes: [{code: 'X', applicable: false}]}),
    ),
    true,
    'nicht anwendbarer Code ändert nichts am Preis',
  );
  assert.equal(
    lib.nettoWegMoeglich(warenkorb([zeile(1)], {appliedGiftCards: [{lastCharacters: 'abcd'}]})),
    false,
    'Geschenkkarte',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1)], {cost: {subtotalAmount: {amount: '1', currencyCode: 'CHF'}}}),
    ),
    false,
    'CHF',
  );
  assert.equal(
    lib.nettoWegMoeglich(warenkorb([zeile(1, 1, {sellingPlanAllocation: {x: 1}})])),
    false,
    'Ratenplan',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1)], {
        cost: {
          subtotalAmount: {amount: '100.00', currencyCode: 'EUR'},
          totalAmount: {amount: '90.00', currencyCode: 'EUR'},
        },
      }),
    ),
    false,
    'automatischer Rabatt auf den ganzen Warenkorb (total < subtotal) ginge verloren',
  );
  assert.equal(
    lib.nettoWegMoeglich(
      warenkorb([zeile(1)], {
        cost: {
          subtotalAmount: {amount: '100.00', currencyCode: 'EUR'},
          totalAmount: {amount: '100.00', currencyCode: 'EUR'},
        },
      }),
    ),
    true,
    'total = subtotal ist kein Rabatt',
  );
  assert.equal(
    lib.nettoWegMoeglich(warenkorb([zeile(1)], {note: 'Bitte als Geschenk verpacken'})),
    false,
    'Notiz am Warenkorb ginge verloren',
  );
  assert.equal(
    lib.nettoWegMoeglich(warenkorb([zeile(1)], {attributes: [{key: 'geschenk', value: 'ja'}]})),
    false,
    'Geschenk-Vermerk am Warenkorb ginge verloren',
  );
  assert.equal(
    lib.nettoWegMoeglich(warenkorb([zeile(1)], {attributes: [{key: 'geschenk', value: 'nein'}]})),
    true,
    'geschenk=nein verliert nichts',
  );
});

test('zielErlaubt: nur Shopify-Bezahlseiten über https', () => {
  assert.equal(lib.zielErlaubt('https://qi-blanco.myshopify.com/1/invoices/x'), true);
  assert.equal(lib.zielErlaubt('https://checkout.qiblanco.com/1/invoices/x'), true);
  assert.equal(lib.zielErlaubt('http://checkout.qiblanco.com/x'), false);
  assert.equal(lib.zielErlaubt('https://evil.example/x'), false);
  assert.equal(lib.zielErlaubt('https://myshopify.com.evil.example/x'), false);
  assert.equal(lib.zielErlaubt('https://fremder-laden.myshopify.com/1/invoices/x'), false, 'fremder Shop');
  assert.equal(lib.zielErlaubt('javascript:alert(1)'), false);
  assert.equal(lib.zielErlaubt(undefined), false);
});

test('Länder: EU ohne Deutschland, deckungsgleich mit b2b_ust.EU', (t) => {
  assert.equal(lib.LAND_CODES.has('DE'), false);
  assert.equal(lib.LAND_CODES.size, 26);
  const quelle = '/srv/openclaw/shared-state/b2b-ust/src/b2b_ust.py';
  // Sichtbar übersprungen statt still grün, wo die Tür-Quelle fehlt (CI, anderer Rechner).
  if (!existsSync(quelle)) return t.skip('b2b_ust.py fehlt hier');
  const m = readFileSync(quelle, 'utf8').match(/^EU = \{([^}]*)\}/m);
  assert.ok(m, 'EU-Menge in b2b_ust.py nicht gefunden');
  const server = new Set([...m[1].matchAll(/"([A-Z]{2})"/g)].map((x) => x[1]));
  server.delete('DE');
  assert.deepEqual([...lib.LAND_CODES].sort(), [...server].sort());
});

// ------------------------------------------------------- Weiche (loader) --

test('Weiche: an nur bei netto=an; intern auch bei trocken; aus/kein Server = nie', async () => {
  for (const [stand, kunde, intern] of [
    ['an', true, true],
    ['trocken', false, true],
    ['aus', false, false],
  ]) {
    srv.vergiss();
    tuer({stand});
    const r = await route.loader({
      request: new Request('https://qiblanco.com/b2b-netto?w=1', {
        headers: {'User-Agent': UA_KUNDE},
      }),
      context: {env: {}},
    });
    assert.equal((await r.json()).an, kunde, `Kunde bei ${stand}`);
    assert.equal(srv.knopfSichtbar(stand, true), intern, `intern bei ${stand}`);
  }
  srv.vergiss();
  globalThis.fetch = async () => {
    throw new Error('Server weg');
  };
  const r = await route.loader({
    request: new Request('https://qiblanco.com/b2b-netto?w=1'),
    context: {env: {}},
  });
  assert.equal((await r.json()).an, false, 'Server weg -> kein Knopf');
  const ohneW = await route.loader({
    request: new Request('https://qiblanco.com/b2b-netto'),
    context: {env: {}},
  });
  assert.equal(ohneW.status, 404);
});

test('Weiche: /healthz höchstens einmal je 60 s', async () => {
  srv.vergiss();
  const auf = tuer({stand: 'an'});
  const t0 = 1_000_000;
  assert.equal(await srv.nettoStand({env: {}}, {jetzt: t0}), 'an');
  assert.equal(await srv.nettoStand({env: {}}, {jetzt: t0 + 59_000}), 'an');
  assert.equal(auf.length, 1, 'zweiter Abruf innerhalb 60 s ging ans Netz');
  tuer({stand: 'aus'});
  assert.equal(await srv.nettoStand({env: {}}, {jetzt: t0 + 61_000}), 'aus');
});

// --------------------------------------------------------------- action --

test('action: Zeilen aus dem Warenkorb, Adresse aus dem Formular, ok -> Bezahlseite', async () => {
  srv.vergiss();
  const auf = tuer();
  const res = await route.action({
    request: postAnfrage(formular()),
    context: kontext(warenkorb([zeile(44685294567692, 2), zeile(7)])),
  });
  const antwort = await res.json();
  assert.deepEqual(antwort, {
    ok: true,
    url: 'https://qi-blanco.myshopify.com/123/invoices/abc',
  });
  assert.equal(auf.length, 1);
  assert.equal(auf[0].url, 'https://b2b.dienst.qiblanco.com/api/netto');
  const body = JSON.parse(auf[0].init.body);
  assert.deepEqual(body.zeilen, [
    {variante: 'gid://shopify/ProductVariant/44685294567692', menge: 2},
    {variante: 'gid://shopify/ProductVariant/7', menge: 1},
  ]);
  assert.equal(body.uid, 'ATU16370905');
  assert.equal(body.firma, 'Muster GmbH');
  assert.equal(body.email, 'einkauf@muster.at');
  assert.deepEqual(body.adresse, {
    vorname: 'Anna',
    nachname: 'Muster',
    "strasse": 'Ringstraße 1',
    zusatz: '',
    plz: '1010',
    ort: 'Wien',
    land: 'AT',
    telefon: '',
  });
});

test('action: Tracking-Schlüssel reisen mit; personenbezogene Cookies nur mit Einwilligung', async () => {
  const cookies = '_qpx_anon=anon-abc-123; _fbp=fb.1.1000.222';
  for (const [einwilligung, erwartetAnon] of [
    [true, 'anon-abc-123'],
    [false, undefined],
  ]) {
    const auf = tuer();
    await route.action({
      request: postAnfrage(
        formular(),
        einwilligung ? `${COOKIE_CONSENT_JA}; ${cookies}` : cookies,
      ),
      context: kontext(warenkorb([zeile(1)])),
    });
    const m = JSON.parse(auf.at(-1).init.body).merkmale;
    assert.equal(m._fbc, 'fb.1.1000.KLICK', 'am Warenkorb gespeicherter _fbc fehlt');
    assert.equal(m.utm_source, 'facebook', 'utm vom Warenkorb fehlt');
    assert.equal(m._qpx_anon, erwartetAnon, `_qpx_anon bei Einwilligung=${einwilligung}`);
    assert.equal(m._fbp, einwilligung ? 'fb.1.1000.222' : undefined);
  }
});

test('action: abgelehnt -> Satz der Tür, nie eine Weiterleitung', async () => {
  const fall = [
    [{ok: false, grund: 'uid_ungueltig', text: 'Die EU-Datenbank (VIES) kennt diese USt-IdNr. nicht.'}, 200, /VIES/],
    [{ok: true, url: 'https://evil.example/x'}, 200, /nicht geklappt/],
    [{ok: true}, 200, /nicht geklappt/],
    [{ok: false, text: 'Heute schon sehr viele.'}, 429, /sehr viele/],
  ];
  for (const [antwort, status, rx] of fall) {
    tuer({antwort, status});
    const r = await (
      await route.action({
        request: postAnfrage(formular()),
        context: kontext(warenkorb([zeile(1)])),
      })
    ).json();
    assert.equal(r.ok, false, JSON.stringify(antwort));
    assert.equal(r.url, undefined);
    assert.match(r.text, rx);
  }
  globalThis.fetch = async () => {
    throw new Error('Zeitüberschreitung');
  };
  const r = await (
    await route.action({
      request: postAnfrage(formular()),
      context: kontext(warenkorb([zeile(1)])),
    })
  ).json();
  assert.equal(r.ok, false);
  assert.match(r.text, /normal zur Kasse/);
});

test('action: Warenkorb mit Rabatt, DE-Lieferung oder Honigtopf fragt die Tür gar nicht', async () => {
  for (const [form, cart, warum] of [
    [formular(), warenkorb([zeile(1)], {discountCodes: [{code: 'X', applicable: true}]}), 'Rabatt'],
    [formular({land: 'DE'}), warenkorb([zeile(1)]), 'DE'],
    [formular({land: 'CH'}), warenkorb([zeile(1)]), 'CH'],
    [formular({website: 'spam'}), warenkorb([zeile(1)]), 'Honigtopf'],
    [formular(), null, 'kein Warenkorb'],
  ]) {
    const auf = tuer();
    const r = await (
      await route.action({request: postAnfrage(form), context: kontext(cart)})
    ).json();
    assert.equal(r.ok, false, warum);
    assert.equal(auf.length, 0, `${warum}: Tür wurde gefragt`);
  }
});

// ----------------------------------------------------------------- Nähte --

test('NAHT Tür: jeder Schlüssel, den der Kassenweg an die Bestellung schreibt, passiert netto.MERKMAL_ERLAUBT', async (t) => {
  // Grundmenge ist NICHT eine getippte Liste, sondern genau das, was der
  // normale Kassenweg schreibt (dieselben zwei Helfer wie cart.attribution.jsx),
  // bei einem voll bestückten Besucher. Gemessen 08.11.2026: _gcl_gb und die vier
  // Herkunfts-Marker fielen an der Tür weg, bis b2b-ust sie aufnahm.
  const quelle = '/srv/openclaw/shared-state/b2b-ust/src/netto.py';
  if (!existsSync(quelle)) return t.skip('netto.py fehlt hier');
  const py = readFileSync(quelle, 'utf8');
  const m = py.match(/MERKMAL_ERLAUBT = re\.compile\(([\s\S]*?)\)\n/);
  assert.ok(m, 'MERKMAL_ERLAUBT nicht gefunden');
  const rx = new RegExp([...m[1].matchAll(/r"([^"]*)"/g)].map((x) => x[1]).join(''));
  const ct = await import('../app/lib/checkout-tracking.js');
  const sp = new URLSearchParams(
    'fbclid=F&gclid=G&ttclid=T&wbraid=W&gbraid=GB&msclkid=M&utm_source=s&utm_medium=m&utm_campaign=c&utm_term=t&utm_content=co&utm_id=i',
  );
  const cookie =
    '_qpx_anon=a; _fbc=fb.1.1.x; _fbp=fb.1.1.y; _gcl_aw=GCL.1.a; _gcl_gb=GCL.1.b; hyros_id=h1; hyros_session_id=h2; hyros_sid=h3; hyros_visitor_id=h4';
  const schluessel = [
    ...ct.buildAttributionCartAttributes({searchParams: sp, cookieHeader: cookie, includeCookies: true}),
    ...ct.buildOriginCartAttributes({userAgent: UA_KUNDE, cookieHeader: cookie, searchParams: sp}),
  ].map((a) => a.key);
  assert.ok(schluessel.length >= 20, `Grundmenge zu klein: ${schluessel}`);
  const weg = [...new Set(schluessel)].filter((k) => !rx.test(k));
  assert.deepEqual(weg, [], `fallen an der Tür weg: ${weg}`);
});

test('action: Herkunfts-Marker reisen auch ohne Einwilligung mit', async () => {
  const auf = tuer();
  await route.action({
    request: postAnfrage(formular(), ''),
    context: kontext(warenkorb([zeile(1)], {attributes: []})),
  });
  const m = JSON.parse(auf.at(-1).init.body).merkmale;
  assert.ok(m.attribution_source, `attribution_source fehlt: ${JSON.stringify(m)}`);
  assert.ok(m.ua_class, 'ua_class fehlt');
  assert.equal(m._qpx_anon, undefined);
  assert.equal(m.ad_params_seen, 'unknown', 'ohne Ankunfts-Wort weiß der Server es nicht');

  // Das Ankunfts-Wort aus dem Formular reist wie am Kassenknopf (cart.attribution.jsx).
  const auf2 = tuer();
  await route.action({
    request: postAnfrage(formular({ad_params_seen: 'yes'}), ''),
    context: kontext(warenkorb([zeile(1)], {attributes: []})),
  });
  assert.equal(JSON.parse(auf2.at(-1).init.body).merkmale.ad_params_seen, 'yes_client');
});

test('NAHT Warenkorb: der Weg steht in CartSummary unter dem Kassenknopf', () => {
  const s = readFileSync(fileURLToPath(new URL('components/CartSummary.jsx', APP)), 'utf8');
  const kasse = s.indexOf('<CartCheckoutActions');
  const b2b = s.indexOf('<B2bNettoWeg');
  assert.ok(kasse > 0 && b2b > kasse, 'B2bNettoWeg fehlt oder steht über dem Kassenknopf');
});
