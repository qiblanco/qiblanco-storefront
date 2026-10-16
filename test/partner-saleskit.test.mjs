// Hermetische Tests: Sales-Kit Stufe 2 im Partnerbereich
// (Job 20261007-sales-kit-stufe2-einbindung-partnerbereich).
// node:test/node:assert, kein Netz. Ausfuehren: node --test test/partner-saleskit.test.mjs
// Die Texte des Kits stehen nicht in diesem Repo; die Beispiele hier sind erfunden.
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  EREIGNIS_ROUTE,
  LINK_PLATZHALTER,
  PARTNER_EREIGNIS_API,
  ereignisAusFormular,
  ereignisWeiterleiten,
  gruppiere,
  hatPlatzhalter,
  linkFuerProdukt,
  pruefeEreignis,
  textMitLink,
  textTeile,
} from '../app/lib/partner-saleskit.js';

const KONTO = {
  link: 'https://qiblanco.com/?sca_ref=1.A',
  links: [
    {
      name: 'QiOne® 2 Pro',
      link: 'https://qiblanco.com/products/qione-2-pro?sca_ref=1.A',
    },
    {name: 'QiBracelet®', link: null},
  ],
};

test('Ereignis: gueltige Formen kommen durch', () => {
  assert.deepEqual(pruefeEreignis({abschnitt: 'fragen', art: 'aufgeklappt'}), {
    abschnitt: 'fragen',
    art: 'aufgeklappt',
    id: '',
  });
  assert.deepEqual(
    pruefeEreignis({abschnitt: 'einwaende', art: 'aufgeklappt', id: 'KE-11'}),
    {
      abschnitt: 'einwaende',
      art: 'aufgeklappt',
      id: 'KE-11',
    },
  );
  assert.deepEqual(
    pruefeEreignis({
      abschnitt: 'beispieltexte',
      art: 'kopiert',
      id: 'BT-qione-instagram',
    }),
    {abschnitt: 'beispieltexte', art: 'kopiert', id: 'BT-qione-instagram'},
  );
});

test('Ereignis: Freitext, fremde Abschnitte und Kopieren ohne Text fallen raus', () => {
  const falsch = [
    null,
    'fragen',
    {abschnitt: 'preise', art: 'aufgeklappt'},
    {abschnitt: 'fragen', art: 'geklickt'},
    {abschnitt: 'fragen', art: 'aufgeklappt', id: 'Wie teuer ist das?'},
    {abschnitt: 'fragen', art: 'aufgeklappt', id: 'KF-1234'},
    {abschnitt: 'beispieltexte', art: 'kopiert'},
    {abschnitt: 'fragen', art: 'kopiert', id: 'KF-01'},
    {abschnitt: 'beispieltexte', art: 'kopiert', id: 'BT-ABC'},
    {abschnitt: 'beispieltexte', art: 'kopiert', id: 42},
  ];
  for (const roh of falsch)
    assert.equal(pruefeEreignis(roh), null, JSON.stringify(roh));
});

test('Ereignis aus Formular: so wie sendBeacon es schickt', () => {
  const f = new URLSearchParams({
    abschnitt: 'beispieltexte',
    art: 'kopiert',
    id: 'BT-a-b',
  });
  assert.deepEqual(ereignisAusFormular(f), {
    abschnitt: 'beispieltexte',
    art: 'kopiert',
    id: 'BT-a-b',
  });
  assert.equal(
    ereignisAusFormular(new URLSearchParams({abschnitt: 'x'})),
    null,
  );
});

test('Weiterleiten: Token und Ereignis gehen an den Dienst, Antwortstatus kommt zurück', async () => {
  const gesehen = [];
  const status = await ereignisWeiterleiten({
    token: 'tok_x',
    ereignis: {abschnitt: 'fragen', art: 'aufgeklappt', id: ''},
    fetchImpl: async (url, init) => {
      gesehen.push({url, init});
      return {status: 204};
    },
  });
  assert.equal(status, 204);
  assert.equal(gesehen.length, 1);
  assert.equal(gesehen[0].url, PARTNER_EREIGNIS_API);
  assert.equal(gesehen[0].init.method, 'POST');
  assert.equal(gesehen[0].init.headers.Authorization, 'tok_x');
  assert.deepEqual(JSON.parse(gesehen[0].init.body), {
    abschnitt: 'fragen',
    art: 'aufgeklappt',
    id: '',
  });
});

test('Weiterleiten: Netzfehler wirft nie, sondern gibt 0', async () => {
  const status = await ereignisWeiterleiten({
    token: 't',
    ereignis: {abschnitt: 'fragen', art: 'aufgeklappt', id: ''},
    fetchImpl: async () => {
      throw new Error('weg');
    },
  });
  assert.equal(status, 0);
});

test('Adressen: Seite meldet an die eigene Route, die Route an den Dienst', () => {
  assert.equal(EREIGNIS_ROUTE, '/account/partner/ereignis');
  assert.match(
    PARTNER_EREIGNIS_API,
    /^https:\/\/partner\.[a-z0-9.-]+\/v1\/ereignis$/,
  );
});

test('Link: Produktlink vor allgemeinem Link, sonst null', () => {
  assert.equal(linkFuerProdukt(KONTO, 'QiOne® 2 Pro'), KONTO.links[0].link);
  assert.equal(linkFuerProdukt(KONTO, 'QiBracelet®'), KONTO.link);
  assert.equal(linkFuerProdukt(KONTO, 'Unbekannt'), KONTO.link);
  assert.equal(linkFuerProdukt({links: []}, 'QiOne® 2 Pro'), null);
  assert.equal(linkFuerProdukt(undefined, 'QiOne® 2 Pro'), null);
});

test('Platzhalter: jeder [dein Link] wird ersetzt, ohne Link bleibt er stehen', () => {
  const text = `Schau hier: ${LINK_PLATZHALTER}\nOder hier: ${LINK_PLATZHALTER}`;
  assert.equal(
    textMitLink(text, 'https://x.de/?a=1'),
    'Schau hier: https://x.de/?a=1\nOder hier: https://x.de/?a=1',
  );
  assert.equal(textMitLink(text, null), text);
  const teile = textTeile(text, 'L');
  assert.deepEqual(
    teile.map((t) => t.art),
    ['text', 'link', 'text', 'link'],
  );
  assert.deepEqual(textTeile('ohne', 'L'), [{art: 'text', wert: 'ohne'}]);
  assert.deepEqual(textTeile(LINK_PLATZHALTER, 'L'), [
    {art: 'link', wert: 'L'},
  ]);
});

test('Platzhalter: offene Stellen wie [Name] werden erkannt, ein eingesetzter Link nicht', () => {
  assert.equal(hatPlatzhalter('Hallo [Name], schau mal'), true);
  assert.equal(
    hatPlatzhalter(textMitLink(`Hier: ${LINK_PLATZHALTER}`, 'https://x.de')),
    false,
  );
  assert.equal(hatPlatzhalter(`Hier: ${LINK_PLATZHALTER}`), true);
});

test('Gruppieren: Reihenfolge des ersten Auftretens bleibt', () => {
  const g = gruppiere(
    [
      {w: 'b', n: 1},
      {w: 'a', n: 2},
      {w: 'b', n: 3},
    ],
    (e) => e.w,
  );
  assert.deepEqual(
    g.map((x) => [x.schluessel, x.eintraege.map((e) => e.n)]),
    [
      ['b', [1, 3]],
      ['a', [2]],
    ],
  );
  assert.deepEqual(
    gruppiere(undefined, (e) => e),
    [],
  );
});
