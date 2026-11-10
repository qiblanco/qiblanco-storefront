/**
 * Wächter: KEINE STEUERANGABE AM PREIS AUF DEN LANDINGPAGES (node --test, ohne Bundler).
 *
 * Christian 27.10.2026 Z1: „das mit dne mehrwertsteurn, das wird nirgednwo
 * angezeigt, das zeigen wir erst im checkout“ (Shop-Regel S1_kein_mwst_hinweis,
 * gilt für produkt, konfigurator UND landing). Die Produktseiten bewacht
 * test/the-alpha-shop.test.mjs (Z233), hier gilt dasselbe für /pages/*:
 * Job 20261029-lp-mwst-hinweis-raus-s1-folge-partner (AI-CEO-Entscheid 29.10.).
 *
 * Gemessen wird die Eigenschaft und nicht eine Dateiliste. Geprüft werden alle
 * Kampagnen-Komponenten, die Apple-Fassungen der LPs, jede Route
 * app/routes/pages.* und der Hero-Block der LP-Shopseite /pages/qibracelet.
 * Das gilt auch für Fassungen, die heute hinter einem Schalter oder einer
 * LP-Pause liegen: ein umgelegter Schalter brächte den Hinweis sonst zurück.
 * Kommentare sind ausgenommen (sie werden nicht ausgeliefert). Gezählt wird
 * das Kürzel „MwSt“, die Form des Hinweises am Preis. Ausgeschrieben steht
 * „Mehrwertsteuer“/„Umsatzsteuer“ nur in Erklärtext ohne unseren Preis
 * (Provisionsrechnung, Fremdpreise Healy, AGB, Impressum, USt-ID). Der ist
 * nicht Gegenstand von S1.
 * ROT VOR GRÜN: auf origin/main 71e70f3d rot (QiOneZellschutz, TieferSchlaf,
 * ZellSchutz, ExclusiveSolutions, QiBraceletHeroBullets).
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const ohneKommentare = (s) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
const STEUER = /MwSt/;

function dateien(verzeichnis, muster) {
  const voll = join(WURZEL, verzeichnis);
  const aus = [];
  for (const name of readdirSync(voll)) {
    const pfad = join(voll, name);
    if (statSync(pfad).isDirectory()) aus.push(...dateien(relative(WURZEL, pfad), muster));
    else if (muster.test(name)) aus.push(relative(WURZEL, pfad));
  }
  return aus;
}

test('Landingpages zeigen keine Steuerangabe am Preis', () => {
  const pruefliste = [
    ...dateien('app/components/campaign', /\.jsx?$/),
    ...dateien('app/components/apple-seite', /\.jsx?$/),
    ...dateien('app/routes', /^pages\..*\.jsx$/),
    'app/components/product-pages/QiBraceletHeroBullets.jsx',
  ];
  assert.ok(pruefliste.length >= 30, `Dateien gefunden: ${pruefliste.length}`);
  const funde = pruefliste.filter((f) =>
    STEUER.test(ohneKommentare(readFileSync(join(WURZEL, f), 'utf8'))),
  );
  assert.deepEqual(funde, []);
});

test('Preis-Unterzeile der LPs bleibt „einmalig“', () => {
  for (const f of ['QiOneZellschutz', 'TieferSchlaf', 'ZellSchutz']) {
    const s = readFileSync(join(WURZEL, `app/components/campaign/${f}.jsx`), 'utf8');
    assert.match(s, /lp-vp-final-cta__price-meta">einmalig</, f);
  }
  const es = readFileSync(join(WURZEL, 'app/components/campaign/ExclusiveSolutions.jsx'), 'utf8');
  assert.match(es, /Einmalig, kein Abo, kein Verschleiß\. 20 Tage risikofrei\. 100% Versicherter Versand/);
  const qb = readFileSync(
    join(WURZEL, 'app/components/product-pages/QiBraceletHeroBullets.jsx'),
    'utf8',
  );
  assert.match(qb, /Versandkostenfrei innerhalb Deutschlands/);
});
