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
  // btn--secondary: 2 px sichtbarer Rahmen, keine Fläche
  assert.equal(hatKnopfOptik(optik({raender: [2, 2, 2, 2], hoehe: 73})), true);
  // btn--text qb-gv__weg (Geschwister-Vergleich): 2 px Rahmen in durchsichtiger
  // Farbe; die Komponente meldet ihn deshalb als 0 und der Link ist kein Knopf
  assert.equal(hatKnopfOptik(optik({raender: [0, 0, 0, 0], hoehe: 47})), false);
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

// ─── s03 (25.10.2026): das Gesicht rutscht über die Kaufleiste ─────────────
// Gemessen live 25.10.2026, /products/qione-2-pro, 390x844: Kugel-Rahmen
// [309,763,74,74], Leiste [0,781,390,63], Knopf der Leiste ab y≈789.
const KUGEL = {left: 309, top: 763, right: 383, bottom: 837};
const LEISTE = {left: 0, top: 781, right: 390, bottom: 844};
const LEISTEN_KNOPF = {left: 150, top: 789, right: 374, bottom: 836};

test('chatHub: Unterkante des Rahmens 8 px über der Leiste, aus beiden Rechtecken', async () => {
  const {chatHub, ABSTAND_PX} = await import('../app/lib/kaufknopf-chat.js');
  const hub = chatHub({ruhe: KUGEL, leisten: [LEISTE], fensterHoehe: 844, angedockt: false, an: true});
  assert.equal(hub, 837 - 781 + ABSTAND_PX);
  // Blase (größer) rutscht um dieselbe Regel, nicht um eine Konstante
  const blase = {left: 85, top: 612, right: 383, bottom: 837};
  assert.equal(chatHub({ruhe: blase, leisten: [LEISTE], fensterHoehe: 844, angedockt: false, an: true}), 64);
  // höhere Leiste -> größerer Hub
  assert.equal(chatHub({ruhe: KUGEL, leisten: [{...LEISTE, top: 760}], fensterHoehe: 844,
    angedockt: false, an: true}), 837 - 760 + 8);
});

test('chatHub: kein Hub ohne Leiste, bei offenem Chat, angedockt, Schalter aus', async () => {
  const {chatHub} = await import('../app/lib/kaufknopf-chat.js');
  const basis = {ruhe: KUGEL, leisten: [LEISTE], fensterHoehe: 844, angedockt: false, an: true};
  assert.equal(chatHub({...basis, leisten: []}), 0);
  assert.equal(chatHub({...basis, angedockt: true}), 0);
  assert.equal(chatHub({...basis, an: false}), 0);
  // offenes Fenster auf dem Handy (fast so hoch wie der Schirm)
  assert.equal(chatHub({...basis, ruhe: {left: 8, top: 60, right: 382, bottom: 836}}), 0);
  // Leiste unter dem Fenster (versteckt: translateY(110%)) zählt nicht
  assert.equal(chatHub({...basis, leisten: [{left: 0, top: 850, right: 390, bottom: 913}]}), 0);
  // Leiste nicht waagrecht unter dem Rahmen
  assert.equal(chatHub({...basis, leisten: [{left: 0, top: 781, right: 200, bottom: 844}]}), 0);
  // Rahmen ohne Kasten (display:none bei offenem Dialog)
  assert.equal(chatHub({...basis, ruhe: {left: 0, top: 0, right: 0, bottom: 0}}), 0);
  // Rahmen schon frei über der Leiste
  assert.equal(chatHub({...basis, ruhe: {left: 309, top: 600, right: 383, bottom: 700}}), 0);
});

test('Hochrutschen: Zielrechteck deckt den Knopf der Leiste nicht, die Ruhelage schon', async () => {
  const {chatHub, verschoben, ueberdecktKaufknopf} = await import('../app/lib/kaufknopf-chat.js');
  const lage = (rahmen) => ueberdecktKaufknopf({rahmen, knoepfe: [LEISTEN_KNOPF], fensterHoehe: 844,
    angedockt: false, beruehrt: false});
  assert.equal(lage(KUGEL), true, 'Stand vor s03: Ausblenden');
  const hub = chatHub({ruhe: KUGEL, leisten: [LEISTE], fensterHoehe: 844, angedockt: false, an: true});
  assert.equal(lage(verschoben(KUGEL, hub)), false);
});

test('verschiebungY/ruhelage: Zwischenwert des Übergangs wird herausgerechnet', async () => {
  const {verschiebungY, ruhelage} = await import('../app/lib/kaufknopf-chat.js');
  assert.equal(verschiebungY('none'), 0);
  assert.equal(verschiebungY(''), 0);
  assert.equal(verschiebungY(undefined), 0);
  assert.equal(verschiebungY('matrix(1, 0, 0, 1, 0, -31.5)'), -31.5);
  assert.equal(verschiebungY('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -64, 0, 1)'), -64);
  assert.equal(verschiebungY('matrix(kaputt)'), 0);
  // mitten im Hochrutschen gemessen: top 731.5 bei ty -31.5 -> Ruhelage 763
  const r = ruhelage({left: 309, top: 731.5, right: 383, bottom: 805.5}, -31.5);
  assert.deepEqual(r, KUGEL);
  assert.equal(ruhelage(null, 3), null);
});

test('rahmenOffen: angedockt oder höher als der Deckel', async () => {
  const {rahmenOffen} = await import('../app/lib/kaufknopf-chat.js');
  assert.equal(rahmenOffen({rahmen: KUGEL, fensterHoehe: 844, angedockt: false}), false);
  assert.equal(rahmenOffen({rahmen: KUGEL, fensterHoehe: 844, angedockt: true}), true);
  assert.equal(rahmenOffen({rahmen: {left: 8, top: 60, right: 382, bottom: 836}, fensterHoehe: 844,
    angedockt: false}), true);
  assert.equal(rahmenOffen({rahmen: null, fensterHoehe: 844, angedockt: false}), false);
});

test('jede Sticky-Kaufleiste trägt data-qb-chat-weicht (s03-r2, Christian 26.10.: Gesicht rutscht hoch)', async () => {
  // Eigenschaft statt Liste: jede Komponente, die eine Leiste per
  // `<name>-sticky--sichtbar` bzw. `qb-kaufleiste--sichtbar` einblendet, muss
  // der Kugel sagen, dass sie ausweichen soll. Belegfall: /pages/start-b
  // (StickyKaufknopf) - die Kugel lag auf „Jetzt kaufen“.
  const {readFileSync, readdirSync, statSync} = await import('node:fs');
  const {join} = await import('node:path');
  const wurzel = new URL('../app/components/', import.meta.url).pathname;
  const dateien = [];
  const lauf = (d) => {
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) lauf(p);
      else if (n.endsWith('.jsx')) dateien.push(p);
    }
  };
  lauf(wurzel);
  // Zweites Merkmal (s03-r5, 31.10.): data-section="…sticky-kaufknopf" am
  // eigenen Element. Die Apple-Fassung von LP B blendet ihren festen Knopf per
  // `szs-fest--sichtbar` ein und fiel durch den Klassennamen-Zaun.
  const leisten = dateien.filter((p) =>
    /(-sticky|qb-kaufleiste)--sichtbar|data-section="[^"]*sticky-kaufknopf"/.test(readFileSync(p, 'utf8')));
  assert.ok(leisten.length >= 4, `zu wenige Leisten gefunden: ${leisten.length}`);
  const ohne = leisten.filter((p) => !readFileSync(p, 'utf8').includes("data-qb-chat-weicht={sichtbar ? '' : undefined}"));
  assert.deepEqual(ohne, []);
});
