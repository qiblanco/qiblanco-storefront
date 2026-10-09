/**
 * Jede Aufrufstelle von <CallToAction> nennt die Masse ihrer Masterdatei.
 *
 * Anlass: Job 20261009-schluss-cta-rand-unter-chatpille-prio45. Ohne
 * `imgBreite`/`imgHoehe` trägt das Bild nur width=500 und ist bis zum Laden
 * 0 px hoch (loading="lazy"); live sprang der Schluss-CTA dann um 358 px unter
 * Annas Chat-Pille. Begründung und Messung stehen in CallToAction.jsx.
 *
 * WAS DIESER TEST PRÜFT UND WAS NICHT: dass keine Aufrufstelle die beiden
 * Angaben vergisst, und dass sie positive ganze Zahlen sind. Ob sie zur
 * Masterdatei PASSEN, prüft er nicht (dafür bräuchte er das CDN). Ob die
 * Seite dadurch nicht mehr springt, misst der Browser:
 * homepage-bauer/pruefungen/probe_oeffentlich_knopf_chatblase.py.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, dirname, relative} from 'node:path';
import {fileURLToPath} from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');

function jsxDateien(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) liste.push(...jsxDateien(pfad));
    else if (/\.(jsx|tsx)$/.test(name)) liste.push(pfad);
  }
  return liste;
}

/**
 * Die Props eines Elements bis zu seinem Ende. JSX-Werte in {...} können
 * selbst `>` und `/>` enthalten (der text-Prop trägt ganze Absätze), also wird
 * die Klammertiefe gezählt.
 */
export function elementKoepfe(quelle, name) {
  const koepfe = [];
  const re = new RegExp(`<${name}(?=[\\s/>])`, 'g');
  let m;
  while ((m = re.exec(quelle))) {
    let tiefe = 0;
    let i = m.index + m[0].length;
    for (; i < quelle.length; i++) {
      const z = quelle[i];
      if (z === '{') tiefe++;
      else if (z === '}') tiefe--;
      else if (tiefe === 0 && z === '>') break;
    }
    koepfe.push({start: m.index, kopf: quelle.slice(m.index, i + 1)});
  }
  return koepfe;
}

export function fehlendeMasse(kopf) {
  const fehlt = [];
  for (const prop of ['imgBreite', 'imgHoehe']) {
    const m = new RegExp(`\\b${prop}=\\{\\s*(\\d+)\\s*\\}`).exec(kopf);
    if (!m || !(Number(m[1]) > 0)) fehlt.push(prop);
  }
  return fehlt;
}

test('jede Aufrufstelle von <CallToAction> nennt imgBreite und imgHoehe', () => {
  const funde = [];
  let gezaehlt = 0;
  for (const datei of jsxDateien(join(WURZEL, 'app'))) {
    if (datei.endsWith('CallToAction.jsx')) continue;
    const quelle = readFileSync(datei, 'utf8');
    for (const {start, kopf} of elementKoepfe(quelle, 'CallToAction')) {
      gezaehlt++;
      const fehlt = fehlendeMasse(kopf);
      if (fehlt.length) {
        const zeile = quelle.slice(0, start).split('\n').length;
        funde.push(`${relative(WURZEL, datei)}:${zeile} ohne ${fehlt.join(', ')}`);
      }
    }
  }
  // Ohne Aufrufstelle wäre der Test grün ohne Gegenstand.
  assert.ok(gezaehlt >= 1, 'keine einzige <CallToAction>-Aufrufstelle gefunden');
  assert.deepEqual(funde, []);
});

test('Gegenprobe: ein Kopf ohne Masse und einer mit text-Prop voller JSX', () => {
  const quelle = `
    <CallToAction img={"a.webp"} text={<><h2>x</h2><br /></>} link="/p" />
    <CallToAction img="b.webp" imgBreite={526} imgHoehe={296} text={<p>y</p>} />
    <CallToAction img="c.webp" imgBreite={0} imgHoehe={10} />`;
  const koepfe = elementKoepfe(quelle, 'CallToAction');
  assert.equal(koepfe.length, 3);
  assert.deepEqual(fehlendeMasse(koepfe[0].kopf), ['imgBreite', 'imgHoehe']);
  assert.deepEqual(fehlendeMasse(koepfe[1].kopf), []);
  assert.deepEqual(fehlendeMasse(koepfe[2].kopf), ['imgBreite']);
});
