/**
 * Chat-Widget über dem Kaufknopf: die reine Entscheidung, hermetisch.
 *
 * Anlass: Job 20260926-chat-widget-verdeckt-kaufknopf-desktop. Live am
 * 2026-09-26 bei 1280x800 trafen 12 von 20 Punkten der Knopf-Mittellinie den
 * Kaufknopf, der Rest das geschlossene Widget. Die Lagen unten sind diese
 * gemessenen Rechtecke.
 *
 * Ein grüner Test hier ist KEIN Wirkungsnachweis. Ob der Knopf im gerenderten
 * Shop treffbar ist, misst der Hit-Test am Rand (Job-Ordner,
 * pruefungen/probe_kaufknopf_chat_frei.py).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';

import {
  ABSTAND_PX,
  ueberdecktKaufknopf,
} from '../app/lib/kaufknopf-chat.js';

const r = (left, top, right, bottom) => ({left, top, right, bottom});

// Gemessen live 1280x800, Ruhelage: Knopf und geschlossenes Widget samt Blase.
const KNOPF_1280 = r(701, 715, 1101, 785);
const RAHMEN_1280 = r(926, 640, 1258, 793);

const lage = (abweichung = {}) => ({
  rahmen: RAHMEN_1280,
  knoepfe: [KNOPF_1280],
  fensterHoehe: 800,
  angedockt: false,
  beruehrt: false,
  ...abweichung,
});

test('der gemessene Befund: geschlossenes Widget über dem Knopf wird unterdrückt', () => {
  assert.equal(ueberdecktKaufknopf(lage()), true);
});

test('Knopf weit oberhalb des Widgets: Widget bleibt stehen', () => {
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [r(701, 365, 1101, 435)]})), false);
});

test('Knopf knapp neben dem Widget (innerhalb der Luft) zählt als Überdeckung', () => {
  const knapp = r(701, 715, RAHMEN_1280.left - ABSTAND_PX + 1, 785);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [knapp]})), true);
  const frei = r(701, 715, RAHMEN_1280.left - ABSTAND_PX - 1, 785);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [frei]})), false);
});

test('der offene Chat wird nie unterdrückt: angedockt', () => {
  assert.equal(ueberdecktKaufknopf(lage({angedockt: true})), false);
});

test('der offene Chat wird nie unterdrückt: höher als 60 % des Fensters', () => {
  // Offenes Overlay auf dem Handy: fast so hoch wie der Schirm.
  assert.equal(
    ueberdecktKaufknopf(lage({rahmen: r(8, 40, 406, 848), fensterHoehe: 896,
      knoepfe: [r(10, 700, 404, 770)]})),
    false,
  );
});

test('der offene Chat wird nie unterdrückt: der Kunde hat hineingeklickt', () => {
  assert.equal(ueberdecktKaufknopf(lage({beruehrt: true})), false);
});

test('ohne Rahmen, ohne Kasten oder ohne Knopf: keine Unterdrückung', () => {
  assert.equal(ueberdecktKaufknopf(lage({rahmen: null})), false);
  assert.equal(ueberdecktKaufknopf(lage({rahmen: r(0, 0, 0, 0)})), false);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: []})), false);
  assert.equal(ueberdecktKaufknopf(lage({knoepfe: [r(0, 0, 0, 0)]})), false);
});

test('ein zweiter Knopf, der überdeckt, genügt', () => {
  assert.equal(
    ueberdecktKaufknopf(lage({knoepfe: [r(701, 100, 1101, 170), KNOPF_1280]})),
    true,
  );
});

// NAHT Signal -> app.css (Nachzug 2026-09-28, Vollzug ov1f0335e4ad): der Loader
// läuft vor der Hydration, das Signal danach. app.css muss das Widget
// ausblenden, solange genau das Attribut fehlt, das die Komponente setzt.
// Zwei Namen, zwei Dateien: nur dieser Test hält sie zusammen.
test('app.css blendet das Widget aus, bis das Signal bereit ist', async () => {
  const {readFileSync} = await import('node:fs');
  const {BEREIT_ATTRIBUT, RAHMEN_ID} = await import('../app/lib/kaufknopf-chat.js');
  const css = readFileSync(new URL('../app/styles/app.css', import.meta.url), 'utf8');
  const regel = new RegExp(
    `html:not\\(\\[${BEREIT_ATTRIBUT}\\]\\)\\s*#${RAHMEN_ID}\\s*\\{[^}]*visibility:\\s*hidden`,
  );
  assert.match(css, regel);
  const komponente = readFileSync(
    new URL('../app/components/KaufknopfChatSignal.jsx', import.meta.url),
    'utf8',
  );
  assert.match(komponente, /setAttribute\(BEREIT_ATTRIBUT/);
});

// LP-Knöpfe (Job 20261001-lp-kaufknoepfe-chatblase-verdeckt): die Ausgänge
// einer Landingpage zur Kaufseite zählen als Kaufknopf, am Pfad entschieden.
test('LP-Kaufausgang: genau die Kaufziele des LP-Blocks, nicht ihre Nachbarpfade', async () => {
  const {istLpKaufausgang, LP_KAUFZIELE, LP_KAUFAUSGANG_VORFILTER} = await import(
    '../app/lib/kaufknopf-chat.js'
  );
  assert.deepEqual(
    [...LP_KAUFZIELE].sort(),
    ['/pages/qibracelet', '/pages/qihome-air', '/pages/qione-2-pro'],
  );
  for (const pfad of LP_KAUFZIELE) {
    assert.equal(istLpKaufausgang(pfad), true, pfad);
    assert.equal(istLpKaufausgang(pfad + '/'), true, pfad + '/');
    assert.ok(LP_KAUFAUSGANG_VORFILTER.includes(`main a[href*="${pfad}"]`));
  }
  for (const pfad of [
    '/pages/qione-2-pro-details',
    '/pages/qione-2-pro-2x',
    '/products/qione-2-pro',
    '/pages/E-Smog-Schutz',
    '/',
    '',
    undefined,
  ]) {
    assert.equal(istLpKaufausgang(pfad), false, String(pfad));
  }
});

// Öffentlicher Block (Job 20261001-oeffentlicher-block-chatblase-verdeckt-
// produktknoepfe): Knöpfe zur Produkt- bzw. Kaufseite, erkannt an Ziel und
// Knopf-Optik. Die Werte unten sind die im Zensus gemessenen.
test('öffentliches Produktziel: jede /products/<handle> und die Detailseiten, sonst nichts', async () => {
  const {
    istOeffentlichesProduktziel,
    OEFFENTLICHE_DETAILZIELE,
    OEFFENTLICH_KNOPF_VORFILTER,
  } = await import('../app/lib/kaufknopf-chat.js');
  assert.deepEqual(
    [...OEFFENTLICHE_DETAILZIELE].sort(),
    ['/pages/qibracelet-details', '/pages/qihome-details', '/pages/qione-2-pro-details'],
  );
  assert.ok(OEFFENTLICH_KNOPF_VORFILTER.includes('main a[href*="/products/"]'));
  for (const pfad of [
    '/products/qione-2-pro',
    '/products/qione-2-pro/',
    '/products/qi-master',
    '/products/crystal-cacao-create',
    ...OEFFENTLICHE_DETAILZIELE,
  ]) {
    assert.equal(istOeffentlichesProduktziel(pfad), true, pfad);
    if (OEFFENTLICHE_DETAILZIELE.includes(pfad)) {
      assert.ok(OEFFENTLICH_KNOPF_VORFILTER.includes(`main a[href*="${pfad}"]`));
    }
  }
  for (const pfad of [
    '/products',
    '/products/',
    '/products/qione-2-pro/reviews',
    '/pages/partner-details',
    '/pages/qione-2-pro',
    '/pages/erfahrungen',
    '/collections/zeremonie-kakao',
    '/collections/zeremonie-kakao/products/crystal-cacao-create',
    '/cart',
    '/',
    '',
    undefined,
  ]) {
    assert.equal(istOeffentlichesProduktziel(pfad), false, String(pfad));
  }
});

test('Knopf-Optik: Fläche oder Rahmen an vier Seiten, kein Textlink, keine Karte', async () => {
  const {hatKnopfOptik, KNOPF_MAX_HOEHE_PX} = await import('../app/lib/kaufknopf-chat.js');
  const optik = (abweichung = {}) => ({
    display: 'block',
    flaeche: false,
    raender: [0, 0, 0, 0],
    hoehe: 58,
    hatBild: false,
    ...abweichung,
  });
  // erf__weiter auf /pages/erfahrungen: inline-block, gefüllt, ohne Rahmen
  assert.equal(hatKnopfOptik(optik({display: 'inline-block', flaeche: true})), true);
  // btn--secondary und btn--text qb-gv__weg: 2 px Rahmen, keine Fläche
  assert.equal(hatKnopfOptik(optik({raender: [2, 2, 2, 2], hoehe: 47})), true);
  // UpsellLink „Mehr erfahren" in der Produktkarte: block, weder Fläche noch Rahmen
  assert.equal(hatKnopfOptik(optik({hoehe: 29})), false);
  // qbp__produkt auf /pages/podcasts: nur eine Unterlinie
  assert.equal(hatKnopfOptik(optik({raender: [0, 0, 1, 0], hoehe: 25})), false);
  // Link im Fließtext, auch mit Marker-Hintergrund
  assert.equal(hatKnopfOptik(optik({display: 'inline', flaeche: true, hoehe: 18})), false);
  // Produktkarte mit Fläche: zu hoch (lp-pw-produkt 186 px) oder mit Bild
  assert.equal(hatKnopfOptik(optik({flaeche: true, hoehe: 186})), false);
  assert.equal(hatKnopfOptik(optik({flaeche: true, hoehe: 72, hatBild: true})), false);
  assert.equal(hatKnopfOptik(optik({flaeche: true, hoehe: KNOPF_MAX_HOEHE_PX})), true);
  assert.equal(hatKnopfOptik(optik({flaeche: true, hoehe: KNOPF_MAX_HOEHE_PX + 1})), false);
  // ohne Kasten oder mit kaputter Eingabe: kein Knopf
  assert.equal(hatKnopfOptik(optik({flaeche: true, hoehe: 0})), false);
  assert.equal(hatKnopfOptik(optik({raender: [2, 2, 2]})), false);
  assert.equal(hatKnopfOptik(optik({raender: undefined})), false);
});

test('farbeDeckt: transparent und Alpha 0 decken nicht, beide Schreibweisen', async () => {
  const {farbeDeckt} = await import('../app/lib/kaufknopf-chat.js');
  for (const farbe of ['rgb(0, 0, 0)', 'rgb(199, 162, 88)', 'rgba(0, 0, 0, 0.5)',
    'rgb(0 0 0 / 0.5)', 'rgb(0 0 0 / 40%)', 'rgb(12 34 56)', 'oklch(0.7 0.1 80)',
    'color(srgb 0 0 0 / 1)']) {
    assert.equal(farbeDeckt(farbe), true, farbe);
  }
  for (const farbe of ['rgba(0, 0, 0, 0)', 'rgb(0 0 0 / 0)', 'rgb(0 0 0 / 0%)',
    'rgba(255, 255, 255, 0.04)', 'transparent', '', undefined, null]) {
    assert.equal(farbeDeckt(farbe), false, String(farbe));
  }
});
