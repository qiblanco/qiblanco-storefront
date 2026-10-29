/**
 * Hermetischer Test (node --test): die Qi-Alpha-Komponenten tragen als
 * eigene Bildliterale nur Qi-Alpha-Renderings.
 *
 * Christian 25.10.2026: „für den qi alpha keine fotos verwenden vom qione 2
 * pro, weil es ein anderes logo hat“. QiMaster.jsx hatte das Paar-Foto von
 * 2023 (die Frau trägt einen QiOne) am 25.10. ersetzt; QiAlphaShopB.jsx trug
 * es weiter und ging am 29.10. mit #1081 auf /products/qi-alpha-b live.
 *
 * Gemessen wird die EIGENSCHAFT, nicht ein Dateiname: jedes Bildliteral in
 * den Komponenten (ausserhalb von Kommentaren) heisst qi-alpha-*. Ein neues
 * Lifestyle-Foto mit anderem Namen faellt genauso wie das alte. Bilder aus
 * den Datenmodulen (Diamant, Literatur, Studien-Titelseiten) kuratieren diese
 * Module selbst und stehen hier nicht als Literal.
 *
 * Grossjob 20261025-qi-alpha-produktseite-englisch-aufbauen-a-auf-b-niveau,
 * Segment s04-r1-r2.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const WURZEL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KOMPONENTEN = [
  'app/components/product-pages/QiAlphaShopB.jsx',
  'app/components/product-pages/QiMaster.jsx',
];

function bildliterale(quelle) {
  const ohneKommentare = quelle
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  const treffer = ohneKommentare.match(
    /[A-Za-z0-9_.%-]+\.(?:jpe?g|png|webp|avif|gif)\b/gi,
  );
  return [...new Set(treffer || [])];
}

for (const datei of KOMPONENTEN) {
  test(`${datei}: nur Qi-Alpha-Renderings als Bildliteral`, () => {
    const bilder = bildliterale(readFileSync(path.join(WURZEL, datei), 'utf8'));
    assert.ok(bilder.length > 0, 'kein Bildliteral gefunden: der Test misst den falschen Ort');
    const fremd = bilder.filter((b) => !/^qi-alpha-/i.test(b));
    assert.deepEqual(fremd, [], `Fremdbild auf der Qi-Alpha-Seite: ${fremd.join(', ')}`);
  });
}
