/**
 * HYDRATIONS-NAHT: Markup, das der Server anders schreibt, als der Browser es liest.
 *
 * ANLASS (Job 20260913-huelle-hydration-...-prio30). Auf JEDER Seite von
 * qiblanco.com meldete React beim Hydrieren Fehler in Serie -- gemessen am
 * 2026-09-13 auf /search 15x #418 + 1x #423 je Viewport. Die Design-Rubrik zog
 * dafür 60 der 100 Hygiene-Punkte ab. Es waren ZWEI voneinander unabhaengige
 * Ursachen, und beide sind am Quelltext erkennbar:
 *
 *   1. <dialog> in einem <p> (Fuß). Der HTML-Parser schließt das <p> davor
 *      und hebt den Dialog heraus -> ab da hydriert React gegen einen
 *      verschobenen Baum. Wächter dafür: test/eu-gewaehrleistung.test.mjs.
 *
 *   2. <style>{`... input[type='text'] ...`}</style> im React-Baum (dieser
 *      Wächter). Das ist der Fall unten.
 *
 * WARUM EIN <style> MIT TEXTKIND BRICHT, und warum es zugleich still kaputt ist:
 * React MASKIERT Textkinder beim Serverrendern. Aus input[type='text'] wird im
 * SSR-HTML input[type=&#x27;text&#x27;]. <style> ist aber ein RAW-TEXT-Element --
 * der HTML-Parser löst Maskierungen darin NICHT auf. Also gilt beides:
 *   - der Client-Baum trägt ', der Server-Baum &#x27;  -> Hydrations-Bruch (#425),
 *   - und der ausgelieferte Selektor ist UNGUELTIG      -> die Regel greift nicht.
 * Der zweite Schaden ist der groessere: die Regeln sind bis zur Hydration tot,
 * und das sieht man der Seite nicht an.
 *
 * DIE EIGENSCHAFT, NICHT DER ORT: gemessen wird nicht "gibt es ein <style>",
 * sondern "enthält sein Textkind ein Zeichen, das React maskiert". Ein
 * <style>{`.a .b{margin-top:30px;}`}</style> ist völlig in Ordnung und bleibt
 * es -- app/components/product-pages/QiOne2Pro.jsx tut genau das.
 *
 * DER RICHTIGE WEG, wenn CSS wirklich in die Komponente muss, ist
 * dangerouslySetInnerHTML (app/components/ShopSwitch.jsx macht es vor): dort
 * maskiert React nicht. Besser ist eine Datei unter app/styles/.
 *
 * KALIBRIERT AM ECHTBESTAND, bevor dieser Wächter scharf wurde: im ganzen
 * app/-Baum gab es GENAU EINEN Treffer -- den behobenen Fall in Footer.jsx.
 * Kein Fluter, deshalb ein hartes Urteil und keine blosse Markierung.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, readFileSync, statSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join, relative} from 'node:path';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', 'app');

/** Zeichen, die React im Textkind maskiert -- und die <style> nicht zurueckholt. */
const MASKIERT = /['"&<>]/;

/** <style ...>{`...`}</style> bzw. <style>{'...'}</style> mit Textkind. */
const STYLE_MIT_TEXTKIND = /<style(?![^>]*dangerouslySetInnerHTML)[^>]*>\s*\{\s*([`'"])([\s\S]*?)\1\s*\}\s*<\/style>/g;

function dateien(verzeichnis) {
  const raus = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const voll = join(verzeichnis, eintrag);
    if (statSync(voll).isDirectory()) raus.push(...dateien(voll));
    else if (/\.(jsx?|tsx?)$/.test(eintrag)) raus.push(voll);
  }
  return raus;
}

test('kein <style> im React-Baum, dessen CSS von React maskiert wird', () => {
  const alle = dateien(APP);

  // POSITIV-KONTROLLE zuerst: findet die Mechanik ueberhaupt Dateien? Ohne sie
  // wäre der Wächter gruen, sobald der Pfad nicht mehr stimmt -- also gruen
  // by construction und von einem echten Freispruch nicht zu unterscheiden.
  assert.ok(
    alle.length > 50,
    `Positiv-Kontrolle: nur ${alle.length} Dateien unter app/ gefunden -- ` +
      'die Suchmechanik greift nicht mehr, der Wächter wäre wirkungslos',
  );

  const treffer = [];
  for (const datei of alle) {
    const code = readFileSync(datei, 'utf8');
    for (const [, , css] of code.matchAll(STYLE_MIT_TEXTKIND)) {
      if (MASKIERT.test(css)) {
        const zeichen = [...new Set(css.match(/['"&<>]/g))].join(' ');
        treffer.push(`${relative(APP, datei)} (maskierte Zeichen: ${zeichen})`);
      }
    }
  }

  assert.deepEqual(
    treffer,
    [],
    'Diese <style>-Bloecke tragen Zeichen, die React beim Serverrendern ' +
      'maskiert. <style> ist ein Raw-Text-Element -- der Parser löst die ' +
      'Maskierung nicht auf. Folge: Hydrations-Bruch auf jeder Seite, die den ' +
      'Baustein rendert, UND ein serverseitig ungültiger Selektor, der still ' +
      'nicht greift. Weg damit nach app/styles/*.css, oder (wenn es wirklich ' +
      'in die Komponente muss) dangerouslySetInnerHTML wie in ShopSwitch.jsx.\n' +
      `Treffer:\n  ${treffer.join('\n  ')}`,
  );
});
