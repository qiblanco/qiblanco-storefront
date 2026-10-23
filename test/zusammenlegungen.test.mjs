/**
 * app/lib/zusammenlegungen.js — die zusammengelegten Seiten (Job
 * 20261007-seo-zusammenlegung-duenne-seiten-301-umsetzen).
 *
 * Geprüft wird, was über die Grenze muss: der 301 trägt Query-String UND
 * Anker, jede Quell-Route wirft ihn über den einen Träger, keine Weiterleitung
 * steht in einer Sitemap, keine Kette, die gesperrten Seiten bleiben stehen,
 * und kein Baustein rendert einen rohen Link auf eine Weiterleitung.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

import {
  ZUSAMMENGELEGT,
  adresse,
  leiteUm,
  zusammenlegungFuer,
} from '../app/lib/zusammenlegungen.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {WEITERGELEITETE_PAGES_HANDLES} from '../app/lib/sitemap-weiterleitungen.js';

const WURZEL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const lies = (rel) => fs.readFileSync(path.join(WURZEL, rel), 'utf8');

/** Wirft leiteUm und liefert die geworfene Response. */
function wurf(url, pfad) {
  try {
    leiteUm(new Request(url), pfad);
  } catch (e) {
    return e;
  }
  return null;
}

test('der 301 trägt Query-String und Anker, in dieser Reihenfolge', () => {
  const r = wurf(
    'https://qiblanco.com/pages/lexikon-energie?fbclid=abc&utm_source=x',
    '/pages/lexikon-energie',
  );
  assert.ok(r instanceof Response, 'leiteUm wirft keine Response');
  assert.equal(r.status, 301);
  assert.equal(
    r.headers.get('Location'),
    '/pages/lexikon?fbclid=abc&utm_source=x#lexikon-energie',
  );
  const ohne = wurf('https://qiblanco.com/pages/support-1', '/pages/support-1');
  assert.equal(ohne.status, 301);
  assert.equal(ohne.headers.get('Location'), '/pages/support');
});

test('eine Adresse ohne Eintrag ist ein Baufehler, kein stiller 200', () => {
  assert.throws(
    () => leiteUm(new Request('https://qiblanco.com/pages/x'), '/pages/x'),
    /Keine Zusammenlegung/,
  );
});

test('adresse() zeigt aufs Ziel, alles andere bleibt unverändert', () => {
  assert.equal(adresse('/pages/lexikon-energie'), '/pages/lexikon#lexikon-energie');
  assert.equal(adresse('/products/qione-1'), '/products/qione-2-pro');
  assert.equal(adresse('/pages/lexikon-elektrosmog'), '/pages/lexikon-elektrosmog');
});

test('Bedingung 1: die gesperrten und die zurückgestellte Seite bleiben stehen', () => {
  for (const p of [
    '/pages/lexikon-elektrosmog',
    '/pages/kann-elektrosmog-den-schlaf-stoeren',
    '/pages/wie-funktioniert-der-gitterchip-im-qione',
  ]) {
    assert.equal(zusammenlegungFuer(p), undefined, `${p} darf nicht umgeleitet werden`);
  }
});

test('keine Kette: kein Ziel ist selbst eine Quelle', () => {
  for (const [von, z] of Object.entries(ZUSAMMENGELEGT)) {
    assert.equal(ZUSAMMENGELEGT[z.ziel], undefined, `${von} -> ${z.ziel} ist eine Kette`);
    assert.notEqual(von, z.ziel);
  }
});

test('jede /pages-Quelle mit eigener Route wirft den 301 über den einen Träger', () => {
  for (const von of Object.keys(ZUSAMMENGELEGT)) {
    if (!von.startsWith('/pages/')) continue;
    const slug = von.slice('/pages/'.length);
    const datei = `app/routes/pages.${slug}.jsx`;
    if (!fs.existsSync(path.join(WURZEL, datei))) {
      // Shopify-Seite ohne eigene Route: dann trägt pages.$handle.jsx sie.
      assert.match(lies('app/routes/pages.$handle.jsx'), /zusammenlegungFuer\(alterPfad\)/);
      continue;
    }
    const src = lies(datei);
    assert.match(src, new RegExp(`const PFAD = '${von}';`), `${datei}: PFAD stimmt nicht`);
    assert.match(src, /leiteUm\(request, PFAD\)/, `${datei}: wirft den 301 nicht`);
  }
  assert.match(lies('app/routes/products.$handle.jsx'), /zusammenlegungFuer\(alterPfad\)/);
});

test('keine Weiterleitung in der Sitemap', () => {
  const nurRoute = new Set(NUR_ROUTE_SEITEN.map((e) => e.pfad));
  for (const von of Object.keys(ZUSAMMENGELEGT)) {
    assert.ok(!nurRoute.has(von), `${von} steht noch in NUR_ROUTE_SEITEN`);
  }
  assert.ok(WEITERGELEITETE_PAGES_HANDLES.includes('support-1'));
});

test('kein Baustein rendert einen rohen Link auf eine Weiterleitung', () => {
  // Datenmodule (fragen.js, lexikon.js) dürfen die alte Adresse als KENNUNG
  // führen; gerendert wird sie über adresse(). Ein wörtliches href oder to auf
  // eine Quelle in Komponenten, Routen oder Hub-Listen wäre ein Link auf die
  // Weiterleitung.
  const dateien = [];
  const lauf = (rel) => {
    for (const n of fs.readdirSync(path.join(WURZEL, rel), {withFileTypes: true})) {
      const r = path.join(rel, n.name);
      if (n.isDirectory()) lauf(r);
      else if (/\.(jsx?|mjs)$/.test(n.name)) dateien.push(r);
    }
  };
  lauf('app/components');
  lauf('app/routes');
  dateien.push('app/lib/hub-seiten.js');
  const quellen = Object.keys(ZUSAMMENGELEGT);
  for (const d of dateien) {
    const src = lies(d);
    for (const von of quellen) {
      const roh = new RegExp(
        `(href|to)\\s*[=:]\\s*["'{\`]+${von.replace(/[/-]/g, '\\$&')}["'\`#?]`,
      );
      assert.ok(!roh.test(src), `${d}: roher Link auf ${von}`);
      assert.ok(!src.includes(`pfad: '${von}'`), `${d}: Listeneintrag auf ${von}`);
    }
  }
});

test('Rückweg: eine zurückgenommene Seite antwortet selbst, steht in der Sitemap, und ihr Abschnitt auf dem Ziel bleibt', () => {
  // Folgeauftrag des Wirkungskreislaufs zur Hypothese H-537022f708: die
  // Zielseite fiel am Kontrollpunkt Tag 7 ab, der 301 kam zurück. Geprüft wird die ganze Grenze, nicht nur die Liste: kein Eintrag,
  // keine Weiterleitung in der Route, ein Sitemap-Eintrag, Links zeigen auf
  // die Seite selbst, und der übernommene Abschnitt auf der Zielseite hängt
  // nicht mehr an der Liste (sonst verschwände er still mit dem Eintrag).
  // H-395796ad98 (23.10.): /pages/faq fiel am Kontrollpunkt Tag 14 ab. Die
  // FAQ braucht adresse() weiter für ihre Fragenliste; ihr Abschnitt hängt
  // dort am Slug (seiteFuer), nicht am Anker der Liste. Dafür `merkmal` und
  // `listeErlaubt`: dann darf nur ankerFuer() nicht vorkommen.
  const paare = [
    {
      von: '/pages/lexikon-kohaerentes-wasser',
      ziel: 'app/components/campaign/KohaerentesWasserSeite.jsx',
    },
    {
      von: '/pages/armband-duschen-sauna',
      ziel: 'app/components/faq/FaqSeite.jsx',
      merkmal: "seiteFuer('armband-duschen-sauna')",
      listeErlaubt: true,
    },
  ];
  const nurRoute = new Set(NUR_ROUTE_SEITEN.map((e) => e.pfad));
  for (const {von, ziel, merkmal, listeErlaubt} of paare) {
    assert.equal(zusammenlegungFuer(von), undefined, `${von} leitet noch um`);
    assert.equal(adresse(von), von, `${von}: Links zeigen nicht auf die Seite`);
    const src = lies(`app/routes/pages.${von.slice('/pages/'.length)}.jsx`);
    assert.doesNotMatch(src, /leiteUm\(/, `${von}: Route wirft noch den 301`);
    assert.match(src, /export default function/, `${von}: Route rendert nichts`);
    assert.ok(nurRoute.has(von), `${von} fehlt in NUR_ROUTE_SEITEN (Sitemap)`);
    const zsrc = lies(ziel);
    if (listeErlaubt) {
      assert.doesNotMatch(zsrc, /ankerFuer\(/, `${ziel}: Abschnitt hängt an der Liste`);
    } else {
      assert.doesNotMatch(zsrc, /^import .*from '~\/lib\/zusammenlegungen'/m, `${ziel}: Abschnitt hängt an der Liste`);
    }
    const kennung = merkmal || `'${von}'`;
    assert.ok(zsrc.includes(kennung), `${ziel}: Abschnitt nennt ${kennung} nicht (Anker)`);
  }
});
