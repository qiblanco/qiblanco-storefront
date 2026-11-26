// Produktnamen nie trennen (Job 20261122-prio1-shop-design-header-...): reine Funktion.
import test from 'node:test';
import assert from 'node:assert/strict';
import {schuetze, nachMarke} from '../app/components/reusables/produktnamen-umbruch.js';

const NB = ' ';
test('QiOne-Namen bleiben zusammen', () => {
  assert.equal(schuetze('wie der QiOne® 1.'), `wie der QiOne®${NB}1.`);
  assert.equal(schuetze('Mit dem QiOne® 2 Pro hielt'), `Mit dem QiOne®${NB}2${NB}Pro hielt`);
  assert.equal(schuetze('QiOne 2'), `QiOne${NB}2`);
});
test('Qi Alpha, QiHome Air, Zahl+Einheit', () => {
  assert.equal(schuetze('der Qi Alpha® ist'), `der Qi${NB}Alpha® ist`);
  assert.equal(schuetze('QiHome Air hilft'), `QiHome${NB}Air hilft`);
  assert.equal(schuetze('fiel auf 60,5 Prozent.'), `fiel auf 60,5${NB}Prozent.`);
  assert.equal(schuetze('20 Tage testen'), `20${NB}Tage testen`);
  assert.equal(schuetze('8 x so viel'), `8${NB}x so viel`);
});
test('keine falschen Treffer und idempotent', () => {
  assert.equal(schuetze('5 Gründe'), '5 Gründe');
  assert.equal(schuetze('2 mehr'), '2 mehr');
  assert.equal(schuetze('20 Tagesgeld'), '20 Tagesgeld');
  const einmal = schuetze('QiOne® 2 Pro und 20 Tage');
  assert.equal(schuetze(einmal), einmal);
});
test('Text hinter abgesetztem ®', () => {
  assert.equal(nachMarke(' 1.'), `${NB}1.`);
  assert.equal(nachMarke(' 2 Pro hielt'), `${NB}2${NB}Pro hielt`);
  assert.equal(nachMarke(' Air'), `${NB}Air`);
  assert.equal(nachMarke(' hat'), ' hat');
});

// Repair 20261122-prio6-repair-qiblanco-hydration-umbruchschutz: Text in einer
// noch nicht hydrierten Suspense-Grenze nie anfassen (sonst React #418/#425/#422).
import {zustand} from '../app/components/reusables/produktnamen-umbruch.js';

function el(name, kinder = [], extra = {}) {
  const e = {nodeType: 1, nodeName: name, childNodes: kinder, parentNode: null, ...extra};
  kinder.forEach((k) => { k.parentNode = e; });
  return e;
}
const txt = (v, extra = {}) => ({nodeType: 3, nodeValue: v, parentNode: null, ...extra});
const marke = (data) => ({nodeType: 8, data, parentNode: null});
// Übernommener (committeter) Fiber: Weg zur Wurzel (tag 3) ohne Placement/Hydrating.
const WURZEL = {tag: 3, flags: 0, return: null, alternate: null};
const fiber = (o, props, f = {tag: 5, flags: 0, return: WURZEL, alternate: null}) => {
  o['__reactFiber$abc'] = f;
  if (props) o['__reactProps$abc'] = props;
  return o;
};

test('zustand: hydrierter Text ist frei, Grenze ohne Hydration wartet', () => {
  const hydriert = txt('QiOne® 2 Pro');
  const span = fiber(el('SPAN', [hydriert]));
  const offen = txt('QiHome® Air');
  const innen = el('P', [offen]);
  const body = fiber(el('BODY', [span, marke('$'), innen, marke('/$')]), {children: []});
  assert.equal(zustand(hydriert), 'frei');
  assert.equal(zustand(offen), 'warten');
  // nach der Hydration trägt das Elternelement den React-Schlüssel
  fiber(innen);
  assert.equal(zustand(offen), 'frei');
  assert.ok(body);
});

test('zustand: fremdes DOM und dangerouslySetInnerHTML sind frei, Ablage S: nie', () => {
  const fremd = txt('Zeigt uns, welche Seiten');
  const dialog = el('DIV', [el('LABEL', [el('SPAN', [fremd])])], {id: 'qb-einwilligung-dialog'});
  const html = txt('mit dem QiOne® 2 Pro');
  const host = fiber(el('DIV', [el('P', [el('B', [html])])]), {dangerouslySetInnerHTML: {__html: ''}});
  const abgelegt = txt('20 Tage testen');
  const ablage = el('DIV', [el('P', [abgelegt])], {hidden: true, id: 'S:0'});
  fiber(el('BODY', [dialog, host, ablage]), {children: []});
  assert.equal(zustand(fremd), 'frei');
  assert.equal(zustand(html), 'frei');
  assert.equal(zustand(abgelegt), 'nie');
});

test('zustand: verschachtelte Grenzen, geschlossene Grenze davor, ohne React frei', () => {
  const tief = txt('8 x so viel');
  const aussen = el('DIV', [marke('$?'), el('SPAN', [tief]), marke('/$')]);
  const nach = txt('60 Prozent');
  const danach = el('P', [nach]);
  fiber(el('MAIN', [marke('$'), aussen, marke('/$'), danach]), {children: []});
  assert.equal(zustand(tief), 'warten');
  assert.equal(zustand(nach), 'frei'); // liegt hinter der geschlossenen Grenze, fremd
  const ohneReact = txt('20 Tage');
  el('BODY', [el('P', [ohneReact])]);
  assert.equal(zustand(ohneReact), 'frei');
  const skript = txt('var a = 2 Tage');
  fiber(el('BODY', [el('SCRIPT', [skript])]));
  assert.equal(zustand(skript), 'nie');
});

// Rückfall 24./25.11.2026 (Job 20261126-aiceo-k2-hydration-425-rueckfall): React setzt
// __reactFiber$ schon WÄHREND der Hydration einer Grenze. Wird sie unterbrochen und neu
// begonnen, vergleicht React den Text noch einmal; der Schutz hatte ihn da schon geändert
// (Fußzeile „QiOne® 2 Pro“, DOM mit U+00A0, Client mit Leerzeichen -> #425, dann #418).
import {montiert} from '../app/components/reusables/produktnamen-umbruch.js';

test('zustand: Schlüssel aus einer laufenden Hydration reicht nicht, erst die Übernahme', () => {
  // <li><a>QiOne® 2 Pro</a></li> in einer Grenze: Text ist einziges Kind -> kein eigener Schlüssel
  const fragment = {tag: 7, flags: 4096, return: {tag: 13, flags: 0, return: WURZEL, alternate: null}, alternate: null};
  const liF = {tag: 5, flags: 0, return: fragment, alternate: null};
  const name = txt('QiOne® 2 Pro');
  const a = fiber(el('A', [name]), {children: 'QiOne® 2 Pro'}, {tag: 5, flags: 0, return: liF, alternate: null});
  fiber(el('LI', [a]), {children: []}, liF);
  assert.equal(montiert(a), false);
  assert.equal(zustand(name), 'warten');
  // Übernahme: React löscht Hydrating am Fragment
  fragment.flags = 0;
  assert.equal(montiert(a), true);
  assert.equal(zustand(name), 'frei');
});

test('zustand: eigener Textknoten und eingefügte Knoten folgen derselben Regel', () => {
  const t = txt('20 Tage testen');
  const neuF = {tag: 5, flags: 2, return: WURZEL, alternate: null}; // Placement, noch nicht eingefügt
  const pEl = fiber(el('P', [t]), {children: []}, neuF);
  fiber(t, null, {tag: 6, flags: 0, return: neuF, alternate: null});
  assert.equal(zustand(t), 'warten');
  neuF.flags = 0;
  assert.equal(zustand(t), 'frei');
  // ohne Weg zur Wurzel (losgelöster Arbeitsstand) nie frei
  const los = txt('QiHome Air');
  fiber(el('SPAN', [los]), {children: []}, {tag: 5, flags: 0, return: null, alternate: null});
  assert.equal(zustand(los), 'warten');
  // aktualisierter Knoten (alternate gesetzt) zählt wie in React ohne Flag-Prüfung
  const upd = txt('QiOne 2');
  const altF = {tag: 5, flags: 0, return: WURZEL};
  fiber(el('SPAN', [upd]), {children: []}, {tag: 5, flags: 4, return: WURZEL, alternate: altF});
  assert.equal(zustand(upd), 'frei');
  assert.ok(pEl);
});
