// Der gemeinsame Haken „fester Kaufknopf sichtbar?“ (lib/kaufleiste-sicht.js)
// und seine vier Nutzer. Lauf: node --test (findet *.test.mjs im ganzen Baum).
//
// Die iPhone-Lage nachgestellt: dieselbe Scrollposition einmal mit
// Browserleisten (Fenster 690 px hoch, iPhone-Chrome-Profil der Geräteprobe)
// und einmal ohne (690 + 110 px). Die kleine Bildschirmhöhe (100svh) bleibt
// dabei 690. Ein Zustand, der sich nur dadurch ändert, ist ein Wackeln.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  RUHE_PX,
  beobachteLage,
  imBildRuhig,
  lageRuhig,
  lageZusammen,
} from './kaufleiste-sicht.js';
import {kaufleisteSichtbar} from '../components/reusables/kaufleiste-lage.js';
import {stickySichtbar} from '../components/rookie/start/sticky-lage.js';

const SVH = 690;
const LVH = SVH + 110;

test('imBildRuhig: herein ab Oberkante < 100svh, hinaus erst RUHE_PX darunter', () => {
  assert.equal(imBildRuhig({oben: SVH - 1, unten: SVH + 60}, SVH, false), true);
  assert.equal(imBildRuhig({oben: SVH + 1, unten: SVH + 60}, SVH, false), false);
  // schon drin: bleibt drin bis RUHE_PX unter dem Rand
  assert.equal(imBildRuhig({oben: SVH + RUHE_PX - 1, unten: SVH + 200}, SVH, true), true);
  assert.equal(imBildRuhig({oben: SVH + RUHE_PX, unten: SVH + 200}, SVH, true), false);
  // oben hinaus: ebenso RUHE_PX
  assert.equal(imBildRuhig({oben: -300, unten: -RUHE_PX + 1}, SVH, true), true);
  assert.equal(imBildRuhig({oben: -300, unten: -RUHE_PX}, SVH, true), false);
});

test('lageRuhig/lageZusammen: darüber, darunter, mehrere, keines', () => {
  assert.deepEqual(lageRuhig({oben: -500, unten: -100}, SVH, false), {
    imBild: false, darueber: true, darunter: false, unten: -100,
  });
  assert.equal(lageRuhig({oben: 900, unten: 1000}, SVH, false).darunter, true);
  const z = lageZusammen([
    lageRuhig({oben: 900, unten: 1000}, SVH, false),
    lageRuhig({oben: 100, unten: 300}, SVH, false),
  ]);
  assert.equal(z.da, true);
  assert.equal(z.imBild, true);
  assert.equal(lageZusammen([]).da, false);
});

// ---------------------------------------------------------------------------
// Nachgestellter Browser: eine Seite, ein Bezugspunkt (Knopf der Kaufbox bei
// y=1800..1870), Fuß ab 5000, Seitenhöhe 5600. getBoundingClientRect folgt
// der Scrollposition; innerHeight springt mit den Leisten, 100svh nicht.
function welt() {
  const w = {scrollY: 0, innerHeight: SVH, hoerer: {}, rafs: []};
  const rect = (y0, y1) => ({
    getBoundingClientRect: () => ({top: y0 - w.scrollY, bottom: y1 - w.scrollY}),
  });
  w.knopf = rect(1800, 1870);
  w.kopf = rect(0, 900);
  w.ende = rect(4200, 4900);
  globalThis.window = {
    get innerHeight() { return w.innerHeight; },
    addEventListener: (t, f) => { w.hoerer[t] = f; },
    removeEventListener: (t) => { delete w.hoerer[t]; },
    requestAnimationFrame: (f) => w.rafs.push(f),
  };
  globalThis.document = {
    createElement: () => ({
      setAttribute() {},
      style: {},
      remove() {},
      // 100svh: die kleine Höhe, unabhängig von den Leisten
      getBoundingClientRect: () => ({height: SVH}),
    }),
    body: {appendChild() {}},
  };
  w.scrolle = (y) => {
    w.scrollY = y;
    w.hoerer.scroll?.();
    w.rafs.splice(0).forEach((f) => f());
  };
  w.leisten = (ein) => {
    w.innerHeight = ein ? SVH : LVH;
    w.hoerer.resize?.();
    w.rafs.splice(0).forEach((f) => f());
  };
  return w;
}

// Die alte Messung (IntersectionObserver): im Bild = Oberkante < innerHeight.
const alteRegel = (w) => w.knopf.getBoundingClientRect().top < w.innerHeight;

function wackelstellen(regel) {
  const w = welt();
  const zustand = {sichtbar: null};
  const weg = regel(w, zustand);
  const stellen = [];
  for (let y = 0; y <= 5600 - SVH; y += 10) {
    w.leisten(true);
    w.scrolle(y);
    const ein = zustand.sichtbar;
    w.leisten(false);
    const aus = zustand.sichtbar;
    w.leisten(true);
    const wieder = zustand.sichtbar;
    if (ein !== aus || ein !== wieder) stellen.push(y);
  }
  return {stellen, w, zustand, weg};
}

test('ROT VOR GRÜN: die alte Messung an der Fensterunterkante wackelt mit den Leisten', () => {
  const {stellen} = wackelstellen((w, z) => {
    const neu = () => {
      z.sichtbar = !alteRegel(w);
    };
    w.hoerer = {scroll: neu, resize: neu};
    neu();
    return null;
  });
  assert.ok(stellen.length > 0, 'die alte Regel muss im 110-px-Streifen umklappen');
});

test('Kaufleiste über den Haken: Leisten ein/aus ändern nichts, am Seitenende aktiv', () => {
  const {stellen, w, zustand, weg} = wackelstellen((w, z) =>
    beobachteLage({knopf: w.knopf}, (lage) => {
      z.sichtbar = kaufleisteSichtbar({
        geraetAn: true,
        gemessen: lage.knopf.da,
        kaufknopfImBild: lage.knopf.imBild,
      });
    }),
  );
  assert.deepEqual(stellen, []);
  // ganz oben: Knopf unter dem Fenster -> Leiste steht
  w.scrolle(0);
  assert.equal(zustand.sichtbar, true);
  // Knopf der Kaufbox im Bild -> weg
  w.scrolle(1500);
  assert.equal(zustand.sichtbar, false);
  // Seitenende, Leisten ein und aus -> steht
  w.scrolle(5600 - SVH);
  assert.equal(zustand.sichtbar, true);
  w.leisten(false);
  assert.equal(zustand.sichtbar, true);
  weg();
});

test('Start-B-Knopf über den Haken: ruhig, ab dem zweiten Bildschirm, am Ende aktiv', () => {
  const {stellen, w, zustand, weg} = wackelstellen((w, z) =>
    beobachteLage({kopf: w.kopf, knopf: w.knopf}, (lage) => {
      z.sichtbar = stickySichtbar({
        kopfImBild: lage.kopf.imBild,
        kopfUnterkante: lage.kopf.unten,
        kaufknopfImBild: lage.knopf.imBild,
      });
    }),
  );
  assert.deepEqual(stellen, []);
  w.scrolle(0);
  assert.equal(zustand.sichtbar, false);
  w.scrolle(5600 - SVH);
  assert.equal(zustand.sichtbar, true);
  weg();
});

test('Schlaf-Zellen-Schutz-Knopf über den Haken: weg am Preisblock, ruhig', () => {
  const {stellen, w, zustand, weg} = wackelstellen((w, z) =>
    beobachteLage({kopf: w.kopf, enden: [w.ende]}, (lage) => {
      z.sichtbar = !lage.kopf.imBild && !lage.enden.imBild;
    }),
  );
  assert.deepEqual(stellen, []);
  w.scrolle(2500);
  assert.equal(zustand.sichtbar, true);
  w.scrolle(4000);
  assert.equal(zustand.sichtbar, false);
  weg();
});

// ---------------------------------------------------------------------------
// Die vier Leisten hängen am Haken, keine misst mehr selbst an der Fensterkante.
const ohneKommentare = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const lies = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');

test('alle vier festen Kaufknöpfe benutzen useKaufleisteSicht, keiner IntersectionObserver', () => {
  const dateien = [
    '../components/reusables/Kaufleiste.jsx',
    '../components/rookie/start/StickyKaufknopf.jsx',
    '../components/apple-seite/schlaf-zellen-schutz/SchlafZellenSchutzApple.jsx',
  ];
  for (const d of dateien) {
    const code = ohneKommentare(lies(d));
    assert.match(code, /useKaufleisteSicht\(/, d);
    assert.doesNotMatch(code, /IntersectionObserver/, d);
  }
  // Kampagnen-Fassung: nur ihr StickyKaufknopf (die Seite hat weitere Teile).
  const szs = ohneKommentare(lies('../components/campaign/SchlafZellenSchutz.jsx'));
  const sticky = szs.slice(szs.indexOf('function StickyKaufknopf'), szs.indexOf('return (', szs.indexOf('function StickyKaufknopf')));
  assert.match(sticky, /useKaufleisteSicht\(/);
  assert.doesNotMatch(sticky, /IntersectionObserver/);
});

test('Messung gegen 100svh per style.cssText (die Geräteprobe schreibt genau das um)', () => {
  const code = ohneKommentare(lies('./kaufleiste-sicht.js'));
  assert.match(code, /style\.cssText\s*=\s*\n?\s*'[^']*height:100svh/);
});
