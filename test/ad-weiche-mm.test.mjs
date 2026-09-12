// Hermetische Tests des MESSAGE-MATCH-ARMS der Ad-Traffic-Weiche (Grossjob
// 20260911-...-tracking-landingpage-hypothesen, Segment s04).
// Bordmittel wie ad-weiche.test.mjs: node:test/node:assert, KEIN Netz.
// Ausfuehren: node --test test/ad-weiche-mm.test.mjs
//
// WELCHE ARME HIER BELEGT WERDEN (Hausregel: wer einen Rot-Nachweis führt,
// nennt den Arm — ein Exit-Code allein unterscheidet Geschwisterarme nicht):
//   ARM-SCHALTER    ad_weiche_mm fehlt/falsch  -> LP A (die dekretierte Lage)
//   ARM-KARTE       Ad nicht zugeordnet        -> LP A
//   ARM-SCHLEIFE    Ziel == aktueller Pfad     -> kein Redirect
//   ARM-PIN         lp_mm=an/aus               -> deterministisch beide Arme
//   ARM-QUERY       Original-Query byte-identisch auf dem MM-Ziel
//   ARM-RABATT      Rabattcode setzt AUF dem MM-Ziel auf, nicht auf LP A
import test from 'node:test';
import assert from 'node:assert/strict';

import {LP_A_PFAD, mmAktivAusRoh, pruefeAdWeiche} from '../app/lib/ad-weiche.server.js';
import {
  MM_ANTEIL_PROZENT,
  MM_ZIELE,
  MM_ZIELPFADE,
  mmZielPfad,
} from '../app/lib/ad-weiche-ziele.js';

const BASIS = 'https://qiblanco.com';
// Eine echte, aktive Anzeige aus der Karte: B3 Alltagsdemo Hook1.
const AD_B3 = '120251810451900704';
// Echte, aktive Anzeigen, die BEWUSST nicht in der Karte stehen:
// TOF-A (kein besseres Ziel als LP A) und TOF-C (ihr Ziel /pages/zell-schutz
// faellt mit frisch gemessenen 78 durch das Beauty-Gate).
const AD_TOFA = '120250590409220704';
const AD_TOFC = '120251220869070704';

const PAID = `utm_source=facebook&utm_medium=paid&utm_campaign=120250590399490704&fbclid=IwAR0abc`;

function sp(query) {
  return new URL(`${BASIS}/?${query}`).searchParams;
}

/** Zuteilung-Attrappe: liefert genau das ROH-JSON, das die Weiche fetcht. */
function fetchAttrappe(zuteilung, adCodes = null) {
  return async (url) => {
    if (String(url).includes('zuteilung.json')) {
      return {ok: true, json: async () => zuteilung};
    }
    if (String(url).includes('ad-codes.json')) {
      return adCodes ? {ok: true, json: async () => adCodes} : {ok: false, status: 404};
    }
    return {ok: false, status: 404};
  };
}

const AN = {ad_weiche_mm: 'an'};

function req(pfad, query) {
  return new Request(`${BASIS}${pfad}?${query}`);
}

// --- ARM-SCHALTER: die Fail-Richtung zeigt auf das Dekret ---------------------

test('ARM-SCHALTER: ohne ad_weiche_mm bleibt alles auf LP A (dekretierte Lage)', async () => {
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${AD_B3}`),
    fetchAttrappe({default: LP_A_PFAD}),
  );
  assert.ok(ziel.startsWith(LP_A_PFAD), `erwartet LP A, war: ${ziel}`);
  assert.ok(ziel.endsWith('&lp_m=w'), 'Weichen-Marker w erwartet');
});

test('ARM-SCHALTER: jeder andere Wert als "an" ist AUS', async () => {
  for (const wert of ['aus', 'AN', 'true', '1', true, null, undefined]) {
    assert.equal(mmAktivAusRoh({ad_weiche_mm: wert}), false, `Wert ${String(wert)} darf nicht aktivieren`);
  }
  assert.equal(mmAktivAusRoh(AN), true);
  // Ein kaputter/fehlender Fetch liefert null — das darf nie aktivieren.
  assert.equal(mmAktivAusRoh(null), false);
});

test('ARM-SCHALTER: Fetch-Ausfall der Zuteilung => LP A, nicht MM', async () => {
  const kaputt = async () => {
    throw new Error('netz weg');
  };
  const ziel = await pruefeAdWeiche(req('/', `${PAID}&utm_content=${AD_B3}`), kaputt);
  assert.ok(ziel.startsWith(LP_A_PFAD), `Fail-Richtung muss LP A sein, war: ${ziel}`);
});

// --- ARM-KARTE ---------------------------------------------------------------

test('ARM-KARTE: nicht zugeordnete Anzeigen (TOF-A, TOF-C) gehen auf LP A', async () => {
  for (const ad of [AD_TOFA, AD_TOFC]) {
    const ziel = await pruefeAdWeiche(
      req('/', `${PAID}&utm_content=${ad}&lp_mm=an`),
      fetchAttrappe(AN),
    );
    assert.ok(ziel.startsWith(LP_A_PFAD), `${ad} steht bewusst nicht in der Karte, war: ${ziel}`);
  }
});

test('ARM-KARTE: ein Klick ohne Ad-ID geht auf LP A', async () => {
  const ziel = await pruefeAdWeiche(req('/', `${PAID}&lp_mm=an`), fetchAttrappe(AN));
  assert.ok(ziel.startsWith(LP_A_PFAD));
});

test('ARM-KARTE: jedes Kartenziel ist ein absoluter Pfad ohne Query und ohne //', () => {
  for (const [adId, pfad] of Object.entries(MM_ZIELE)) {
    assert.match(adId, /^[0-9]{10,20}$/, `Ad-ID ${adId} ist keine Plattform-ID`);
    assert.ok(pfad.startsWith('/'), `${pfad} ist kein absoluter Pfad`);
    assert.ok(!pfad.includes('//'), `${pfad} würde die Phishing-Bremse der Rabatt-Route ausloesen`);
    assert.ok(!pfad.includes('?'), `${pfad} darf keinen Query tragen`);
    assert.notEqual(pfad, LP_A_PFAD, 'LP A ist der Kontrollarm, nie ein Kartenziel');
  }
});

// --- ARM-SCHLEIFE: der Fall, der ohne Schutz endlos liefe --------------------

test('ARM-SCHLEIFE: Ziel == aktueller Pfad => kein Redirect', () => {
  // Der Fall ist nicht theoretisch: die Weiche feuert auf JEDER Dokument-Route,
  // auch auf der Zielseite selbst. Ohne diesen Schutz leitete eine zugeordnete
  // Anzeige, deren Klick auf ihrer eigenen Seite ankommt, endlos auf sich selbst.
  assert.equal(mmZielPfad('/pages/haelt-das-mein-leben-aus', AD_B3, sp('lp_mm=an'), true), null);
  // Gegenprobe: von woanders aus greift dieselbe Zuordnung sehr wohl.
  assert.equal(mmZielPfad('/', AD_B3, sp('lp_mm=an'), true), '/pages/haelt-das-mein-leben-aus');
});

test('ARM-SCHLEIFE: greift für JEDES Kartenziel, nicht nur für TOF-C', () => {
  for (const [adId, pfad] of Object.entries(MM_ZIELE)) {
    assert.equal(
      mmZielPfad(pfad, adId, sp('lp_mm=an'), true),
      null,
      `Selbstumleitung auf ${pfad} nicht verhindert`,
    );
  }
});

// --- ARM-PIN -----------------------------------------------------------------

test('ARM-PIN: lp_mm=an erzwingt den MM-Arm, lp_mm=aus den Kontrollarm', () => {
  const immerKontrollarm = () => 0.999;
  const immerMmArm = () => 0.0;
  assert.equal(
    mmZielPfad('/', AD_B3, sp('lp_mm=an'), true, immerKontrollarm),
    '/pages/haelt-das-mein-leben-aus',
    'Pin muss den Wuerfel ueberstimmen',
  );
  assert.equal(
    mmZielPfad('/', AD_B3, sp('lp_mm=aus'), true, immerMmArm),
    null,
    'Pin aus muss den Wuerfel ueberstimmen',
  );
  // Der Kill-Schalter dominiert AUCH den Pin.
  assert.equal(mmZielPfad('/', AD_B3, sp('lp_mm=an'), false, immerMmArm), null);
});

test('ARM-PIN: der Wuerfel trennt wirklich zwei Arme (kein toter Split)', () => {
  const ziel = MM_ZIELE[AD_B3];
  assert.equal(mmZielPfad('/', AD_B3, sp(''), true, () => 0.0), ziel, 'Wurf 0 muss MM ergeben');
  assert.equal(mmZielPfad('/', AD_B3, sp(''), true, () => 0.999), null, 'Wurf ~1 muss Kontrolle ergeben');
  assert.ok(MM_ANTEIL_PROZENT > 0 && MM_ANTEIL_PROZENT < 100, 'ein Arm ohne Gegenarm misst nichts');
});

// --- ARM-QUERY: die Tracking-Naht -------------------------------------------

test('ARM-QUERY: der komplette Original-Query kommt byte-identisch auf dem MM-Ziel an', async () => {
  const query = `${PAID}&utm_content=${AD_B3}&utm_term=120251810451890704&gclid=Cj0KCQ&_qpx_anon=abc123`;
  const ziel = await pruefeAdWeiche(req('/', `${query}&lp_mm=an`), fetchAttrappe(AN));
  assert.ok(ziel.startsWith('/pages/haelt-das-mein-leben-aus?'), `MM-Ziel erwartet, war: ${ziel}`);
  const zielQuery = new URL(`${BASIS}${ziel}`).searchParams;
  // JEDER ankommende Schluessel muss unveraendert wieder herauskommen.
  for (const [k, v] of new URL(`${BASIS}/?${query}`).searchParams) {
    assert.equal(zielQuery.get(k), v, `Schluessel ${k} ging über die Weiche verloren`);
  }
  assert.equal(zielQuery.get('lp_m'), 'm', 'Message-Match-Marker erwartet');
});

test('ARM-QUERY: die Weiche führt keinen NEUEN Identitaets-Key ein', async () => {
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${AD_B3}&lp_mm=an`),
    fetchAttrappe(AN),
  );
  const rein = new Set([...new URL(`${BASIS}/?${PAID}&utm_content=${AD_B3}&lp_mm=an`).searchParams.keys()]);
  for (const k of new URL(`${BASIS}${ziel}`).searchParams.keys()) {
    assert.ok(rein.has(k) || k === 'lp_m', `unerwarteter neuer Schluessel: ${k}`);
  }
});

// --- ARM-RABATT --------------------------------------------------------------

test('ARM-RABATT: der ad-scharfe Code setzt AUF dem MM-Ziel auf, nicht auf LP A', async () => {
  const codes = {aktiv: true, codes: {[AD_B3]: 'QB5K2YM'}};
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${AD_B3}&lp_mm=an`),
    fetchAttrappe(AN, codes),
  );
  assert.ok(ziel.startsWith('/discount/QB5K2YM?redirect=/pages/haelt-das-mein-leben-aus'), ziel);
  assert.ok(!ziel.includes(`redirect=${LP_A_PFAD}`), 'der Rabattweg darf nicht auf LP A zurueckfallen');
});

test('ARM-RABATT: ohne MM-Arm bleibt der Rabattweg wie bisher auf LP A', async () => {
  const codes = {aktiv: true, codes: {[AD_B3]: 'QB5K2YM'}};
  const ziel = await pruefeAdWeiche(
    req('/', `${PAID}&utm_content=${AD_B3}&lp_mm=aus`),
    fetchAttrappe(AN, codes),
  );
  assert.ok(ziel.startsWith(`/discount/QB5K2YM?redirect=${LP_A_PFAD}`), ziel);
});

// --- Kartenpflege ------------------------------------------------------------

test('MM_ZIELPFADE ist die entdoppelte Zielmenge der Karte', () => {
  assert.deepEqual([...MM_ZIELPFADE].sort(), [...new Set(Object.values(MM_ZIELE))].sort());
});
