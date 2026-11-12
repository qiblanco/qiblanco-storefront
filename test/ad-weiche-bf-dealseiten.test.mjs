// BF-DEAL-SEITEN UND AD-WEICHE (Elina EL-20261111-fa47cfd9 / EL-20261111-1c477a01, 12.11.2026).
//
// Gemessen live 12.11. 06:02Z: /products/j7hcyb802kn?utm_source=meta&utm_medium=paid&... gab 302 auf
// LP A (lp_m=w). Die Kakao-Anzeige DE zeigt genau dorthin; ihr Klick landete auf der Schlaf-Seite.
// Die Deal-Seiten sollen laut Elinas Dauerregel über Ads erreichbar sein. Dieser Test hält:
//   1. jede Deal-Seite aus BF_DEAL_SEITEN und jede reine alte Kakao-Deal-Adresse ist bis BF_DEAL_ENDE
//      von der Weiche ausgenommen,
//   2. die Liste kommt aus den Deal-Daten (eine neue Deal-Seite kommt ohne Zeile in der Weiche mit),
//   3. Originalseiten (/products/qione-2-pro, die nurEuro-Set-Seiten) leiten weiter um,
//   4. nach BF_DEAL_ENDE leitet die Weiche auch die Deal-Handles wieder um.
// Hermetisch: nur entscheideAdWeiche()/istAusgeschlossen(), kein Abruf.

import test from 'node:test';
import assert from 'node:assert/strict';

import {entscheideAdWeiche, istAusgeschlossen, LP_A_PFAD} from '../app/lib/ad-weiche.server.js';
import {
  BF_DEAL_ENDE,
  BF_DEAL_SEITEN,
  BF_KAKAO_UMLEITUNGEN,
} from '../app/components/black-friday-2026/bf-deals-daten.js';

const BASIS = 'https://qiblanco.com';
const VOR_ENDE = Date.parse('2026-11-12T06:00:00Z');
const NACH_ENDE = Date.parse(BF_DEAL_ENDE) + 1000;
const KAKAO_AD =
  '/products/j7hcyb802kn?utm_source=meta&utm_medium=paid&utm_campaign=bf26-presale-retargeting&utm_content=crystal-cacao';

function zielPfad(entscheidung) {
  return entscheidung ? new URL(entscheidung.ziel, BASIS).pathname : null;
}

test('Kakao-Anzeige DE: volle Anzeigen-URL wird bis BF-Ende NICHT umgeleitet', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}${KAKAO_AD}`, VOR_ENDE), null);
  assert.equal(entscheideAdWeiche(`${BASIS}${KAKAO_AD}&set=2x-awake`, VOR_ENDE), null);
  assert.equal(entscheideAdWeiche(`${BASIS}${KAKAO_AD}&set=create-awake`, VOR_ENDE), null);
  assert.equal(entscheideAdWeiche(`${BASIS}/products/j7hcyb802kn?utm_medium=paid`, VOR_ENDE), null);
});

test('jede Deal-Seite aus BF_DEAL_SEITEN ist mit utm_medium=paid und Click-ID offen', () => {
  const handles = Object.keys(BF_DEAL_SEITEN);
  assert.ok(handles.length >= 7, `erwartet mindestens 7 Deal-Seiten, gefunden ${handles.length}`);
  for (const h of ['8kendiw34hd', 'pjdz538hgs0', 'jhsdhze783', '734husd8hh', '687ghgf4ed', '56huz67dds', 'j7hcyb802kn']) {
    assert.ok(handles.includes(h), `${h} fehlt in BF_DEAL_SEITEN`);
  }
  for (const h of handles) {
    assert.equal(istAusgeschlossen(`/products/${h}`, VOR_ENDE), true, `${h} muss ausgeschlossen sein`);
    for (const q of ['utm_medium=paid', 'utm_source=meta&utm_medium=paid&fbclid=X', 'ttclid=abc']) {
      assert.equal(entscheideAdWeiche(`${BASIS}/products/${h}?${q}`, VOR_ENDE), null, `${h}?${q}`);
    }
  }
});

test('reine alte Kakao-Deal-Adressen sind offen, die nurEuro-Set-Seiten nicht', () => {
  for (const [h, u] of Object.entries(BF_KAKAO_UMLEITUNGEN)) {
    const e = entscheideAdWeiche(`${BASIS}/products/${h}?utm_medium=paid`, VOR_ENDE);
    if (u.nurEuro) {
      assert.equal(zielPfad(e), LP_A_PFAD, `${h} ist eine normale Set-Seite und bleibt in der Weiche`);
    } else {
      assert.equal(e, null, `${h} leitet selbst auf die Kakao-Deal-Seite`);
    }
  }
});

test('Gegenprobe: Originalseiten leiten weiter auf LP A um', () => {
  for (const p of ['/products/qione-2-pro', '/products/qibracelet', '/products/qihome-air', '/products/bundle-1x-awake-1x-create']) {
    assert.equal(zielPfad(entscheideAdWeiche(`${BASIS}${p}?utm_medium=paid`, VOR_ENDE)), LP_A_PFAD, p);
  }
  // Ähnliche, aber andere Pfade decken nicht mit.
  assert.equal(zielPfad(entscheideAdWeiche(`${BASIS}/products/j7hcyb802knx?utm_medium=paid`, VOR_ENDE)), LP_A_PFAD);
  assert.equal(zielPfad(entscheideAdWeiche(`${BASIS}/pages/j7hcyb802kn?utm_medium=paid`, VOR_ENDE)), LP_A_PFAD);
});

test('Ziel-URL bleibt mit UTM erhalten, weil gar nicht umgeleitet wird; ohne Paid ändert sich nichts', () => {
  assert.equal(entscheideAdWeiche(`${BASIS}/products/j7hcyb802kn?utm_medium=cpc`, VOR_ENDE), null);
  assert.equal(entscheideAdWeiche(`${BASIS}/products/j7hcyb802kn`, VOR_ENDE), null);
});

test('nach BF-Ende leitet die Weiche die Deal-Handles wieder um', () => {
  for (const h of Object.keys(BF_DEAL_SEITEN)) {
    assert.equal(istAusgeschlossen(`/products/${h}`, NACH_ENDE), false, h);
    assert.equal(zielPfad(entscheideAdWeiche(`${BASIS}/products/${h}?utm_medium=paid`, NACH_ENDE)), LP_A_PFAD, h);
  }
});

test('/pages/bf-deals bleibt offen (#1436)', () => {
  assert.equal(
    entscheideAdWeiche(`${BASIS}/pages/bf-deals?utm_source=meta&utm_medium=paid&utm_campaign=x`, VOR_ENDE),
    null,
  );
});
