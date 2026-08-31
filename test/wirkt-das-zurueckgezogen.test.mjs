// Durchsetzer für die zurückgezogene Zweifelseite /pages/wirkt-das
// (Job 20260831-vollzug-wirkt-das-aus-menue-und-index-nehmen-prio6, 2026-08-31).
// Wie ten-years-retired.test.mjs: node:test/node:assert sind Bordmittel, KEIN
// Netz, kein neuer Runner.
// Ausführen: node --test test/wirkt-das-zurueckgezogen.test.mjs
//
// WARUM ES DIESEN TEST GIBT
// -------------------------
// Christian hat die Seite am 2026-08-31 wegen ihrer Textqualität zurückgezogen:
// „raus aus dem Reiter und nicht mehr crawlbar". Vollzogen wurde das an VIER
// Stellen — Menü (Shopify-Daten), noindex (eigene Route), Sitemap (Handle in
// app/lib/seo.js) und die internen Verweise (ZweifelBeleg auf PDP + Warenkorb).
// Drei davon liegen im Repo und können still zurückfallen; die Seite selbst
// bleibt HTTP 200 und sieht dabei unverändert gesund aus. Genau das ist die
// Gefahr: ein Rückfall ist an der Seite NICHT zu sehen, weil sie ja lädt.
//
// DIE EIGENTLICHE FALLE, gegen die der dritte Test steht
// ------------------------------------------------------
// Das noindex steht NICHT über die Liste in app/lib/seo.js, obwohl der Handle
// dort geführt ist. `/pages/wirkt-das` hat eine EIGENE Route, die den Katchall
// `pages.$handle.jsx` sticht — die Sicht NICHT_INDEXIERBARE_SEITEN erreicht sie
// baulich nie. Wer den Handle in der Liste sieht und daraus schließt, das
// noindex sei versorgt, irrt; wer den `noindexMeta()`-Aufruf aus der Route
// entfernt, macht die Seite wieder indexierbar, während die Liste weiter
// vollständig aussieht. Zwei Stellen, EIN Signal — und nur eine davon wirkt.
//
// DIE VERWEIS-PRÜFUNG IST AN DER EIGENSCHAFT GEMESSEN, NICHT AM ORT
// -----------------------------------------------------------------
// Test 4 zählt keine bekannte Dateiliste ab, sondern durchsucht den gesamten
// app/-Baum nach einem `to=`/`href=` auf den Pfad. Eine neue Datei, die den
// Verweis wieder einführt, fällt damit auf — eine Liste bekannter Fundorte
// hätte genau sie übersehen.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';

import {
  NICHT_INDEXIERBARE_SEITEN_DEF,
  AUS_SITEMAP_ENTFERNTE_SEITEN,
  NICHT_INDEXIERBARE_SEITEN,
} from '../app/lib/seo.js';

const HANDLE = 'wirkt-das';
const PFAD = `/pages/${HANDLE}`;
const ROUTE = 'app/routes/pages.wirkt-das.jsx';

const routenQuelle = readFileSync(ROUTE, 'utf8');

/** Alle .js/.jsx-Dateien unter app/, rekursiv. */
function quellDateien(wurzel = 'app') {
  const raus = [];
  for (const eintrag of readdirSync(wurzel)) {
    const pfad = join(wurzel, eintrag);
    if (statSync(pfad).isDirectory()) {
      raus.push(...quellDateien(pfad));
    } else if (/\.(js|jsx)$/.test(eintrag)) {
      raus.push(pfad);
    }
  }
  return raus;
}

test('zurückgezogen: der Handle fliegt aus der Sitemap', () => {
  const eintrag = NICHT_INDEXIERBARE_SEITEN_DEF.find((e) => e.handle === HANDLE);
  assert.ok(
    eintrag,
    `${HANDLE} fehlt in NICHT_INDEXIERBARE_SEITEN_DEF — die Seite käme zurück in die Sitemap`,
  );
  assert.equal(
    eintrag.ausSitemap,
    true,
    'ausSitemap muss true sein: die Seite ist in der Crawl-Frontier, es gibt keine Übergangsstufe',
  );
  assert.ok(
    AUS_SITEMAP_ENTFERNTE_SEITEN.includes(HANDLE),
    'die abgeleitete Sitemap-Sicht führt den Handle nicht',
  );
  assert.ok(
    NICHT_INDEXIERBARE_SEITEN.includes(HANDLE),
    'die abgeleitete noindex-Sicht führt den Handle nicht (Rückfall-Netz, falls die eigene Route je wegfällt)',
  );
});

test('zurückgezogen: die eigene Route trägt noindex — und KEINEN canonical', () => {
  assert.match(
    routenQuelle,
    /noindexMeta\(\)/,
    'die Route setzt kein noindex-meta mehr — die Liste in seo.js erreicht sie NICHT, sie ist eigene Route',
  );
  assert.match(
    routenQuelle,
    /export const headers\s*=/,
    'der X-Robots-Tag-Header fehlt (zweite, vom HTML unabhängige Sperre)',
  );
  assert.match(routenQuelle, /noindexHeader\(\)/, 'headers liefert nicht noindexHeader()');
  assert.doesNotMatch(
    routenQuelle,
    /canonicalLink\(/,
    'noindex UND canonical sind widersprüchliche Signale — der canonical muss weg sein, nicht auskommentiert',
  );
});

test('zurückgezogen: kein interner Verweis führt noch auf die Seite', () => {
  const treffer = [];
  for (const datei of quellDateien()) {
    const zeilen = readFileSync(datei, 'utf8').split('\n');
    zeilen.forEach((zeile, i) => {
      // Nur echte Verweise (to=/href=), nicht die Begründungen in den
      // Kommentaren — die sollen den Vorgang ausdrücklich erklären dürfen.
      if (new RegExp(`(to|href)=["'\`]${PFAD}`).test(zeile)) {
        treffer.push(`${datei}:${i + 1}`);
      }
    });
  }
  assert.deepEqual(
    treffer,
    [],
    `interne Verweise auf die zurückgezogene Seite: ${treffer.join(', ')}`,
  );
});

test('der Ersatz-Beleg zeigt auf eine Seite, die selbst indexierbar ist', () => {
  const quelle = readFileSync('app/components/reusables/ZweifelBeleg.jsx', 'utf8');
  const ziel = quelle.match(/<Link to="\/pages\/([a-z0-9-]+)"/)?.[1];
  assert.ok(ziel, 'ZweifelBeleg hat kein erkennbares /pages/-Ziel mehr');
  assert.ok(
    !NICHT_INDEXIERBARE_SEITEN.includes(ziel),
    `ZweifelBeleg führt auf ${ziel} — eine Seite, die selbst aus dem Index genommen ist. ` +
      'Die Zeile steht auf Produktseite und im Warenkorb: sie darf nie in eine Sackgasse führen.',
  );
});
