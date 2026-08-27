// Hermetische Tests der Ad-Traffic-Weiche (Auftrag
// 20260724-ads-umleiten-schlafzellen-v2). Wie catchall.test.mjs:
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/ad-weiche.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LP_A_PFAD,
  AUSNAHME_ZIELSEITEN,
  entscheideAdWeiche,
  entscheideAdWeicheDetail,
  klassifizierePaid,
  istAusgeschlossen,
  istAusnahmeZielseite,
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

test('LP V3 (Review-Artefakt) ist ausgeschlossen — geteilter Link mit fbclid rendert V3', () => {
  assert.equal(istAusgeschlossen('/pages/schlaf-zellen-schutz-v3-67a7'), true);
  assert.equal(
    entscheideAdWeiche(`${BASIS}/pages/schlaf-zellen-schutz-v3-67a7?fbclid=IwAR0abc&utm_medium=paid`),
    null,
  );
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

// --- ZIELSEITEN-AUSNAHME (Auftrag 20260827-ad-weiche-ausnahme-mof-beweis-ad) --
// Die Anzeige qb45-c12 verspricht woertlich "Vier Studien offen einsehbar —
// lies sie selbst". Der bezahlte Klick MUSS dort landen, sonst bricht die
// Anzeige ihr eigenes Versprechen. Jeder Test hier hat sein Gegenstueck in der
// Gruppe darunter: der Zaun darf nur an dieser einen Stelle Tuer sein.

test('Ausnahme: meta-paid auf /pages/studien wird NICHT umgeleitet', () => {
  assert.equal(istAusnahmeZielseite('/pages/studien'), true);
  assert.equal(
    entscheideAdWeiche(
      `${BASIS}/pages/studien?fbclid=IwAR0abc&utm_source=facebook&utm_medium=paid`,
    ),
    null,
  );
});

test('Ausnahme: google-paid (gclid/gbraid/wbraid) auf /pages/studien ebenso', () => {
  for (const q of ['gclid=EAIaX', 'gbraid=0AAA', 'wbraid=Cj0KC']) {
    assert.equal(entscheideAdWeiche(`${BASIS}/pages/studien?${q}`), null);
  }
});

test('Ausnahme ist ERKANNT und bewusst gelassen — nicht "war nie bezahlt"', () => {
  // Genau diese Unterscheidung macht die Verschiebung sichtbar statt still:
  // ein Ausschluss liefert null, die Ausnahme liefert den Grund mit.
  const d = entscheideAdWeicheDetail(`${BASIS}/pages/studien?utm_medium=paid`);
  assert.equal(d.erkennung, 'meta-paid');
  assert.equal(d.ziel, null);
  assert.equal(d.ausnahme, 'zielseite');
  // Gegenstueck: eine Seite ohne Paid-Marker ist gar keine Entscheidung.
  assert.equal(entscheideAdWeicheDetail(`${BASIS}/pages/studien`), null);
  // Gegenstueck: ein echter Ausschluss traegt keinen Grund.
  assert.equal(entscheideAdWeicheDetail(`${BASIS}/cart?utm_medium=paid`), null);
});

test('Ausnahme unterlaeuft die VETOS nicht (organisch bleibt organisch)', () => {
  // Ein Veto heisst "kein Paid-Klick" — dann gibt es auch nichts auszunehmen,
  // und die Seite rendert wie immer. Sonst waere die Ausnahme ein zweiter,
  // stiller Klassifikator neben klassifizierePaid.
  assert.equal(
    entscheideAdWeicheDetail(`${BASIS}/pages/studien?utm_medium=social`),
    null,
  );
  assert.equal(
    entscheideAdWeicheDetail(`${BASIS}/pages/studien?utm_source=r3check&utm_medium=paid`),
    null,
  );
});

test('pruefeAdWeiche: Ausnahme -> null OHNE Zuteilungs-Fetch (Schalter irrelevant)', async () => {
  let fetches = 0;
  const zaehlFetch = async () => {
    fetches += 1;
    return {ok: true, status: 200, json: async () => ({})};
  };
  const ziel = await pruefeAdWeiche(
    new Request(`${BASIS}/pages/studien?utm_medium=paid`),
    zaehlFetch,
  );
  assert.equal(ziel, null);
  assert.equal(fetches, 0); // 'an' und 'aus' fuehren hier zum selben Ergebnis
});

// --- GEGENPROBE: der Zaun steht ueberall sonst unveraendert ------------------

test('Gegenprobe: NUR der versprochene Pfad ist Tuer — Nachbarn nicht', () => {
  // Suffix-Slug ist ein ANDERER Pfad (Muster istAusgeschlossen: exakt oder
  // '<eintrag>/...'). Ohne diesen Test waere ein Praefix-Match unbemerkt.
  for (const pfad of ['/pages/studien-alt', '/pages/studienlage', '/pages/studie']) {
    assert.equal(istAusnahmeZielseite(pfad), false);
    const d = entscheideAdWeicheDetail(`${BASIS}${pfad}?utm_medium=paid`);
    assert.equal(d.ziel, `${LP_A_PFAD}?utm_medium=paid&lp_m=w`);
  }
  // Unterpfad gehoert dagegen zur versprochenen Seite.
  assert.equal(istAusnahmeZielseite('/pages/studien/immunzellen'), true);
});

test('Gegenprobe: die uebrigen Ad-Ziele behalten ihr Verhalten (Dekret ALLE)', () => {
  // Startseite, PDP, generische Seiten und die 6 Message-Match-LPs vom
  // 2026-07-23 — alles, was die Weiche vor dieser Aenderung umgeleitet hat.
  for (const pfad of [
    '/',
    '/products/qibracelet',
    '/pages/qione-2-pro',
    '/pages/wir-machen-ihn-auf',
    '/pages/haelt-das-mein-leben-aus',
    '/pages/kette-oder-armband',
    '/pages/so-wirkt-kohaerentes-wasser',
    '/pages/zellstudien-ehrlich',
    '/pages/das-20-tage-versprechen',
  ]) {
    const ziel = entscheideAdWeiche(`${BASIS}${pfad}?utm_medium=paid&utm_source=facebook`);
    assert.ok(ziel, `kein Redirect mehr fuer ${pfad}`);
    assert.equal(ziel.ziel, `${LP_A_PFAD}?utm_medium=paid&utm_source=facebook&lp_m=w`);
  }
});

test('Gegenprobe: die Ausnahmen-Liste bleibt eine bewusste Einzelmenge', () => {
  // Eine Liste, die unbemerkt waechst, hebelt das Dekret aus. Waechst sie
  // absichtlich, faellt dieser Test auf und zwingt zur Begruendung im Kopf.
  assert.deepEqual(AUSNAHME_ZIELSEITEN, ['/pages/studien']);
});

test('Gegenprobe: google-paid auf /products/* bleibt durchgelassen (Shopping)', () => {
  const d = entscheideAdWeicheDetail(`${BASIS}/products/qione-2-pro?gclid=EAIaX`);
  assert.equal(d.ziel, null);
  assert.equal(d.ausnahme, 'shopping-pdp');
  assert.equal(entscheideAdWeiche(`${BASIS}/products/qione-2-pro?gclid=EAIaX`), null);
});
