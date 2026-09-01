/**
 * Hermetischer Node-Test der Blog-Bestands-Logik (kein Netz, kein Shopify).
 *
 *   node test/blog-bestand.test.mjs      # exit 0 = gruen
 *
 * Der Test deckt bewusst die Faelle ab, die in Betrieb NICHT ausloesbar sind
 * und die deshalb sonst niemand prueft: den leeren Anker-Blog (Selbstbezug
 * der Weiterleitung) und die kaputte Antwort (Fehlmessung darf nie einen
 * befuellten Blog aus dem Netz nehmen).
 */
import assert from 'node:assert/strict';
import {
  ANKER_BLOG_HANDLE,
  BLOG_BESTAND_FRAGMENT,
  hatArtikel,
  istEigenstaendig,
  leereHandles,
} from '../app/lib/blog-bestand.js';

const leer = (handle) => ({handle, bestand: {nodes: []}});
const voll = (handle) => ({handle, bestand: {nodes: [{id: 'gid://a/1'}]}});

let gruen = 0;
function pruefe(name, fn) {
  fn();
  gruen += 1;
  console.log(`  ok  ${name}`);
}

pruefe('leerer Blog hat keine Artikel', () => {
  assert.equal(hatArtikel(leer('news')), false);
});

pruefe('befuellter Blog hat Artikel', () => {
  assert.equal(hatArtikel(voll('wissen')), true);
});

pruefe('leerer Blog ist nicht eigenstaendig', () => {
  assert.equal(istEigenstaendig('news', leer('news')), false);
  assert.equal(istEigenstaendig('e-smog', leer('e-smog')), false);
});

pruefe('befuellter Blog ist eigenstaendig', () => {
  assert.equal(istEigenstaendig('news', voll('news')), true);
});

// Der Fall, der HEUTE nicht ausloesbar ist: wäre der Anker leer, zeigten die
// beiden Weiterleitungen ins Leere. Er bleibt deshalb eigenstaendig.
pruefe('leerer ANKER bleibt eigenstaendig (kein Zeigen ins Leere)', () => {
  assert.equal(istEigenstaendig(ANKER_BLOG_HANDLE, leer(ANKER_BLOG_HANDLE)), true);
});

// Fail-safe in die milde Richtung: was nicht gemessen wurde, gilt als befuellt.
pruefe('kaputte/fehlende Antwort gilt als befuellt', () => {
  assert.equal(hatArtikel({handle: 'x'}), true);
  assert.equal(hatArtikel({handle: 'x', bestand: null}), true);
  assert.equal(hatArtikel(null), true);
  assert.equal(hatArtikel(undefined), true);
  assert.equal(istEigenstaendig('x', {handle: 'x'}), true);
});

pruefe('leereHandles findet genau die leeren, nie den Anker', () => {
  const verbindung = {
    nodes: [voll(ANKER_BLOG_HANDLE), leer('news'), leer('e-smog')],
  };
  assert.deepEqual(leereHandles(verbindung), ['news', 'e-smog']);
});

pruefe('leereHandles: leerer Anker fliegt NICHT aus der Sitemap', () => {
  const verbindung = {nodes: [leer(ANKER_BLOG_HANDLE), leer('news')]};
  assert.deepEqual(leereHandles(verbindung), ['news']);
});

pruefe('leereHandles vertraegt fehlende/kaputte Verbindung', () => {
  assert.deepEqual(leereHandles(null), []);
  assert.deepEqual(leereHandles({}), []);
  assert.deepEqual(leereHandles({nodes: null}), []);
});

// GEGENPROBE (Rot vor Gruen): der Zaun misst die EIGENSCHAFT, nicht den
// Namen. Ein vierter, anders heissender leerer Blog muss genauso fallen —
// haette hier jemand eine Handle-Liste ["news","e-smog"] gebaut, wäre genau
// dieser Fall unsichtbar geblieben.
pruefe('ein NEUER leerer Blog faellt ohne Code-Aenderung mit', () => {
  const verbindung = {nodes: [voll(ANKER_BLOG_HANDLE), leer('gibt-es-noch-nicht')]};
  assert.deepEqual(leereHandles(verbindung), ['gibt-es-noch-nicht']);
  assert.equal(
    istEigenstaendig('gibt-es-noch-nicht', leer('gibt-es-noch-nicht')),
    false,
  );
});

// Der Feldname im Fragment und der Leser in hatArtikel() sind EINE Zusage.
// Driftet einer, misst der Filter still nichts mehr und alles bliebe 200.
pruefe('Fragment und Leser nennen dasselbe Feld', () => {
  assert.match(BLOG_BESTAND_FRAGMENT, /fragment BlogBestand on Blog/);
  assert.match(BLOG_BESTAND_FRAGMENT, /bestand:\s*articles\(first:\s*1\)/);
});

console.log(`\nblog-bestand: ${gruen} Pruefungen gruen`);
