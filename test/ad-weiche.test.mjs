// Hermetische Tests der Ad-Traffic-Weiche (Auftrag
// 20260724-ads-umleiten-schlafzellen-v2). Wie catchall.test.mjs:
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/ad-weiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LP_A_PFAD,
  entscheideAdWeiche,
  klassifizierePaid,
  istAusgeschlossen,
  adWeicheAktiv,
  pruefeAdWeiche,
} from '../app/lib/ad-weiche.server.js';

const BASIS = 'https://qiblanco.com';

function sp(query) {
  return new URL(`${BASIS}/?${query}`).searchParams;
}

// --- Klassifikation: Paid-Erkennung -----------------------------------------

test('meta-paid: utm_medium=paid (echtes Meta-Template)', () => {
  assert.equal(
    klassifizierePaid(
      sp('utm_source=facebook&utm_medium=paid&utm_campaign=120250590399490704&utm_content=120250590409220704&fbclid=IwAR0abc'),
    ),
    'meta-paid',
  );
});

test('google-paid: gclid / gbraid / wbraid', () => {
  assert.equal(klassifizierePaid(sp('gclid=Cj0KCQ')), 'google-paid');
  assert.equal(klassifizierePaid(sp('gbraid=abc')), 'google-paid');
  assert.equal(klassifizierePaid(sp('wbraid=abc')), 'google-paid');
});

test('weitere-paid: ttclid / msclkid (Dekret "ggf. weitere")', () => {
  assert.equal(klassifizierePaid(sp('ttclid=abc')), 'weitere-paid');
  assert.equal(klassifizierePaid(sp('msclkid=abc')), 'weitere-paid');
});

test('fbclid ALLEIN ist KEIN Paid-Marker (organische Shares)', () => {
  assert.equal(klassifizierePaid(sp('fbclid=IwAR0abc')), null);
});

test('leere Query / reine UTM-Organik -> null', () => {
  assert.equal(klassifizierePaid(sp('')), null);
  assert.equal(klassifizierePaid(sp('utm_source=newsletter')), null);
});

// --- Vetos: NIE umleiten ----------------------------------------------------

test('Veto r3check (synthetische Healthcheck-Probe) schlaegt paid', () => {
  assert.equal(klassifizierePaid(sp('utm_source=r3check&utm_medium=paid')), null);
});

test('Veto link_in_bio schlaegt fbclid+paid', () => {
  assert.equal(
    klassifizierePaid(sp('utm_content=link_in_bio&utm_medium=paid&fbclid=x')),
    null,
  );
});

test('Veto utm_medium social/email/referral/company_profile', () => {
  for (const medium of ['social', 'email', 'referral', 'company_profile', 'Social']) {
    assert.equal(klassifizierePaid(sp(`utm_medium=${medium}&gclid=x`)), null);
  }
});

// --- Ausschluss-Pfade -------------------------------------------------------

test('LP A selbst + /go sind ausgeschlossen (Loop unmöglich)', () => {
  assert.equal(istAusgeschlossen(LP_A_PFAD), true);
  assert.equal(istAusgeschlossen('/go'), true);
  assert.equal(entscheideAdWeiche(`${BASIS}${LP_A_PFAD}?utm_medium=paid`), null);
  assert.equal(entscheideAdWeiche(`${BASIS}/go?utm_medium=paid`), null);
});

test('Infra-Segmente ausgeschlossen', () => {
  for (const pfad of [
    '/collect', '/b', '/api/x', '/cart', '/checkouts/c/123', '/account',
    '/policies/privacy-policy', '/assets/x.js', '/build/x', '/cdn/x',
    '/.well-known/x',
  ]) {
    assert.equal(istAusgeschlossen(pfad), true, pfad);
  }
});

test('Prefix-Ausschluesse (__qb, sitemap, robots, favicon, apple-)', () => {
  for (const pfad of [
    '/__qb-catchall/locale_strip', '/sitemap.xml', '/sitemap_products_1.xml',
    '/robots.txt', '/favicon.ico', '/apple-touch-icon.png',
  ]) {
    assert.equal(istAusgeschlossen(pfad), true, pfad);
  }
});

test('/blogs faellt NICHT unter /b (Segment-Grenze) und wird umgeleitet', () => {
  assert.equal(istAusgeschlossen('/blogs/news/artikel'), false);
  const r = entscheideAdWeiche(`${BASIS}/blogs/news/artikel?utm_medium=paid`);
  assert.ok(r);
  assert.equal(r.erkennung, 'meta-paid');
});

// --- Entscheidung: Redirect-Faelle ------------------------------------------

test('Startseite + Meta-Template -> LP A, Query byte-identisch + lp_m=w', () => {
  const query =
    '?utm_source=facebook&utm_medium=paid&utm_campaign=120250590399490704&utm_content=120250590409220704&fbclid=AbC%2F123';
  const r = entscheideAdWeiche(`${BASIS}/${query}`);
  assert.ok(r);
  assert.equal(r.erkennung, 'meta-paid');
  assert.equal(r.ziel, `${LP_A_PFAD}${query}&lp_m=w`);
});

test('Startseite + gclid -> LP A (google-paid)', () => {
  const r = entscheideAdWeiche(`${BASIS}/?gclid=Cj0KCQ`);
  assert.ok(r);
  assert.equal(r.erkennung, 'google-paid');
  assert.equal(r.ziel, `${LP_A_PFAD}?gclid=Cj0KCQ&lp_m=w`);
});

test('beliebige Seite (pages.qione) + paid -> LP A (Dekret ALLE)', () => {
  const r = entscheideAdWeiche(`${BASIS}/pages/qione?utm_medium=paid&utm_source=facebook`);
  assert.ok(r);
  assert.equal(r.ziel, `${LP_A_PFAD}?utm_medium=paid&utm_source=facebook&lp_m=w`);
});

test('unbekannter Pfad (Fehl-Ad) + paid -> LP A statt 404', () => {
  const r = entscheideAdWeiche(`${BASIS}/pages/gibt-es-nicht?utm_medium=paid`);
  assert.ok(r);
});

// --- PDP-Sonderfall (Merchant-Center-Policy) --------------------------------

test('google-paid auf /products/* wird NICHT umgeleitet (Shopping-Pflicht)', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}/products/qihome-air?gclid=x`), null);
  assert.equal(entscheideAdWeiche(`${BASIS}/products/qibracelet?wbraid=x`), null);
});

test('meta-paid auf /products/* WIRD umgeleitet (Dekret ALLE)', () => {
  const r = entscheideAdWeiche(`${BASIS}/products/qione?utm_medium=paid`);
  assert.ok(r);
  assert.equal(r.erkennung, 'meta-paid');
});

// --- Nicht-Dokument-Requests ------------------------------------------------

test('.data-Requests (React Router) werden nie umgeleitet', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}/_root.data?utm_medium=paid`), null);
  assert.equal(entscheideAdWeiche(`${BASIS}/pages/qione.data?utm_medium=paid`), null);
});

test('_data-Query (Legacy-Remix) wird nie umgeleitet', () => {
  assert.equal(
    entscheideAdWeiche(`${BASIS}/?utm_medium=paid&_data=routes%2F_index`),
    null,
  );
});

// --- Schalter (zuteilung.json ROH-Feld ad_weiche) ---------------------------

function fakeFetch(body, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

test('Schalter: Feld abwesend = AKTIV (dekretierter Zustand)', async () => {
  assert.equal(await adWeicheAktiv(fakeFetch({modus: 'aus'})), true);
});

test('Schalter: ad_weiche="on" = AKTIV', async () => {
  assert.equal(await adWeicheAktiv(fakeFetch({modus: 'aus', ad_weiche: 'on'})), true);
});

test('Schalter: NUR explizit ad_weiche="aus" deaktiviert', async () => {
  assert.equal(await adWeicheAktiv(fakeFetch({modus: 'aus', ad_weiche: 'aus'})), false);
});

test('Schalter: Fetch-Fehler/Status!=200 = AKTIV (fail-soft Richtung Dekret)', async () => {
  assert.equal(await adWeicheAktiv(async () => { throw new Error('netz'); }), true);
  assert.equal(await adWeicheAktiv(fakeFetch({}, 503)), true);
});

// --- Glue pruefeAdWeiche ----------------------------------------------------

test('pruefeAdWeiche: GET paid -> Ziel-String, Fetch nur bei Marker', async () => {
  let fetches = 0;
  const zaehlFetch = async () => { fetches += 1; return {ok: true, status: 200, json: async () => ({})}; };
  const ziel = await pruefeAdWeiche(
    new Request(`${BASIS}/?utm_medium=paid&fbclid=AbC%2F123`),
    zaehlFetch,
  );
  assert.equal(ziel, `${LP_A_PFAD}?utm_medium=paid&fbclid=AbC%2F123&lp_m=w`);
  assert.equal(fetches, 1);

  const organisch = await pruefeAdWeiche(new Request(`${BASIS}/`), zaehlFetch);
  assert.equal(organisch, null);
  assert.equal(fetches, 1); // organischer Traffic loest KEINEN Zuteilungs-Fetch aus
});

test('pruefeAdWeiche: HEAD erlaubt, POST nie', async () => {
  const f = fakeFetch({});
  assert.ok(await pruefeAdWeiche(new Request(`${BASIS}/?utm_medium=paid`, {method: 'HEAD'}), f));
  assert.equal(await pruefeAdWeiche(new Request(`${BASIS}/?utm_medium=paid`, {method: 'POST'}), f), null);
});

test('pruefeAdWeiche: Schalter aus -> null trotz Paid-Marker', async () => {
  const ziel = await pruefeAdWeiche(
    new Request(`${BASIS}/?utm_medium=paid`),
    fakeFetch({ad_weiche: 'aus'}),
  );
  assert.equal(ziel, null);
});
