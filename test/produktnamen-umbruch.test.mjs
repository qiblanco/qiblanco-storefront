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
const fiber = (o, props) => {
  o['__reactFiber$abc'] = {};
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
