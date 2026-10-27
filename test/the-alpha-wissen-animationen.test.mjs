/**
 * Wächter: die vier Wissens-Zeichnungen als Animation (node --test, ohne
 * Bundler und ohne Browser). Job 20261027-qi-alpha-wissen-4-grafiken-high-
 * end-animationen, Christian 27.10.2026: „diese 4 grafiken auf high end
 * niveau animaitonen umsetzen“.
 *
 * Gemessen wird an den Zeichenbefehlen, nicht an Pixeln: jede Szene zeichnet
 * in einen Aufzeichnungs-Kontext, Zahlen auf zwei Stellen gerundet.
 *  - Der Loop schließt: Bild bei t und bei t + PERIODE_S sind derselbe
 *    Befehlsstrom (Rot-Beleg beim Bau: ein im Übergang mit m gewichteter
 *    Drehwinkel ergab dort einen sichtbaren Sprung).
 *  - Das Poster ist das Startbild: sein Abdruck ist der Abdruck der Szene bei
 *    POSTER_T. Wer eine Szene ändert, muss das Poster neu rechnen und den
 *    Abdruck nachtragen (sonst springt das Bild beim Start).
 *  - Der Papierton der Szenen ist der Ton der Fläche im CSS.
 *  - Die Leinwand läuft nur im Sichtbereich und nie bei reduzierter Bewegung.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (f) => readFileSync(join(WURZEL, f), 'utf8');

// Ein Dokument, das Kugel-Sprites als messbare Objekte liefert.
const leererKontext = () =>
  new Proxy(
    {},
    {
      get: (_, k) =>
        k === 'createImageData'
          ? (w, h) => ({data: new Uint8ClampedArray(w * h * 4)})
          : () => ({addColorStop() {}}),
      set: () => true,
    },
  );
globalThis.document = {
  createElement: () => ({width: 0, height: 0, getContext: leererKontext}),
};
const anim = await import(join(WURZEL, 'app/components/the-alpha-shop/wissen-animationen.js'));
const wissen = await import(join(WURZEL, 'app/components/the-alpha-shop/the-alpha-wissen-daten.js'));

const wert = (x) => {
  if (typeof x === 'number') return x.toFixed(2);
  if (x && typeof x === 'object' && 'width' in x) return `sprite${x.width}`;
  if (typeof x === 'string') return x.replace(/\d+\.\d+/g, (z) => Number(z).toFixed(2));
  return typeof x;
};
function befehle(id, t, px = 1000) {
  const log = [];
  const ctx = new Proxy(
    {},
    {
      get: (_, k) => (...a) => {
        log.push(`${String(k)}(${a.map(wert).join(',')})`);
        return {addColorStop: (...b) => log.push(`stop(${b.map(wert).join(',')})`)};
      },
      set: (_, k, v) => {
        log.push(`${String(k)}=${wert(v)}`);
        return true;
      },
    },
  );
  anim.SZENEN[id](ctx, px, t);
  return log;
}
export const abdruck = (id) =>
  createHash('sha256').update(befehle(id, anim.POSTER_T[id]).join('\n')).digest('hex').slice(0, 16);

const IDS = ['diamant', 'kristall', 'gleichtakt', 'licht'];

test('vier Szenen, genau für die vier Abschnitte mit Zeichnung', () => {
  const mitBild = wissen.THE_ALPHA_WISSEN.filter((a) => a.bild).map((a) => a.id);
  assert.deepEqual(mitBild, IDS);
  assert.deepEqual(Object.keys(anim.SZENEN).sort(), [...IDS].sort());
  for (const id of IDS) assert.ok(befehle(id, 1).length > 50, `${id} zeichnet nichts`);
});

test('Loop schließt: t und t + PERIODE_S zeichnen dasselbe', () => {
  for (const id of IDS) {
    for (const t of [0, 1.3, 5.75, 9.9]) {
      const a = befehle(id, t);
      const b = befehle(id, t + anim.PERIODE_S);
      const erste = a.findIndex((z, i) => z !== b[i]);
      assert.equal(erste, -1, `${id} t=${t}: Befehl ${erste} weicht ab: ${a[erste]} | ${b[erste]}`);
    }
  }
});

test('Bewegung: die Szene ändert sich über die Zeit', () => {
  for (const id of IDS) {
    assert.notDeepEqual(befehle(id, 0), befehle(id, anim.PERIODE_S / 3), `${id} steht still`);
  }
});

test('Poster ist das Startbild: Abdruck, CDN, Alternativtext', () => {
  for (const id of IDS) {
    const p = anim.WISSEN_POSTER[id];
    assert.ok(p, `${id} ohne Poster`);
    assert.match(p.src, /^https:\/\/cdn\.shopify\.com\/s\/files\/.+\.webp\?v=\d+$/);
    assert.ok(p.alt.length > 40 && /[äöüß]/.test(p.alt), `${id}: Alternativtext`);
    assert.equal(p.abdruck, abdruck(id), `${id}: Szene geändert, Poster neu rechnen (Abdruck ${abdruck(id)})`);
  }
});

test('Papierton der Szene = Fläche im CSS', () => {
  const ton = lies('app/styles/the-alpha-produkt.css').match(/--tas-papier:\s*(#[0-9a-f]{6})/i)?.[1];
  assert.equal(ton?.toLowerCase(), anim.PAPIER.toLowerCase());
  const css = lies('app/styles/the-alpha-shop.css');
  assert.match(css, /\.taw-anim \{[^}]*background: var\(--tas-papier\);/);
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{\s*\.taw-leinwand\s*\{\s*display: none;/);
});

test('Komponente: Leinwand mit Marke, Start im Sichtbereich, reduzierte Bewegung bleibt Standbild', () => {
  const k = lies('app/components/the-alpha-shop/TheAlphaWissen.jsx');
  assert.match(k, /data-wissen-anim=\{id\}/);
  assert.match(k, /new IntersectionObserver/);
  assert.match(k, /prefers-reduced-motion: reduce/);
  assert.match(k, /if \(ruhe\?\.matches\) return undefined;/);
  assert.match(k, /visibilitychange/);
  assert.match(k, /aria-hidden="true"/);
});
