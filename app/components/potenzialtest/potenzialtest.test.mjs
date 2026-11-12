// node --test app/components/potenzialtest/potenzialtest.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PT} from './potenzialtest-spec.js';
import {
  FRAGEN_IDS,
  anfrageAusFormular,
  ergebnisAusAntwort,
  gespraechGewuenscht,
  mailSatz,
  quelleAusSuche,
  quelleSaeubern,
  terminwegZeigen,
} from './potenzialtest-logik.js';

/** FormData-Ersatz: get() wie im Browser. */
function formular(werte) {
  const m = new Map(Object.entries(werte));
  return {get: (k) => (m.has(k) ? m.get(k) : null)};
}

const ALLE = Object.fromEntries(FRAGEN_IDS.map((id) => [id, '3']));
const VOLL = {
  ...ALLE,
  q_interesse: 'qione',
  q_gespraech: 'ja',
  vorname: 'Test',
  email: 'test@example.org',
  einwilligung: 'ja',
  quelle: 'linkedin/post-1',
};

const ANTWORT = {
  ok: true,
  ergebnis_id: 'pt-abc',
  index: 50,
  dimensionen: {energie: 50, erholung: 50, schlaf: 50, druck: 50, fokus: 50},
  typ: 'schlaf',
  typ_name: 'Der Nachtdenker',
  satz: 'Satz.',
  hebel: ['a', 'b', 'c'],
  gespraech_angeboten: true,
  mail_status: 'versandt',
  pdf_url: 'https://potenzialtest.65-108-150-121.sslip.io/potenzialtest/v1/ergebnis/pt-abc.pdf?t=x',
};

test('Spezifikation: 15 Fragen, 5 Labels, 5 Bereiche, 4 Interessen', () => {
  assert.equal(PT.fragen.length, 15);
  assert.equal(PT.skala.length, 5);
  assert.equal(PT.dimensionen.length, 5);
  assert.deepEqual(
    PT.qInteresse.optionen.map((o) => o.id),
    ['qione', 'qibracelet', 'qialpha', 'nur_ergebnis'],
  );
});

test('Anfrage hat genau die Felder des Vertrags', () => {
  const {anfrage, fehler} = anfrageAusFormular(formular(VOLL));
  assert.equal(fehler, undefined);
  assert.deepEqual(Object.keys(anfrage).sort(), [
    'antworten',
    'einwilligung',
    'email',
    'q_gespraech',
    'q_interesse',
    'quelle',
    'test_lauf',
    'vorname',
  ]);
  assert.equal(Object.keys(anfrage.antworten).length, 15);
  assert.equal(anfrage.antworten.e1, 3);
  assert.equal(anfrage.einwilligung, true);
  assert.equal(anfrage.test_lauf, false);
});

test('fehlende Antwort, leere Mail, fehlender Haken werden abgewiesen', () => {
  const ohneF3 = {...VOLL};
  delete ohneF3.f3;
  assert.equal(anfrageAusFormular(formular(ohneF3)).fehler.feld, 'f3');
  assert.equal(anfrageAusFormular(formular({...VOLL, e1: '6'})).fehler.feld, 'e1');
  assert.equal(anfrageAusFormular(formular({...VOLL, email: ''})).fehler.feld, 'email');
  assert.equal(anfrageAusFormular(formular({...VOLL, email: 'kein@punkt'})).fehler.feld, 'email');
  assert.equal(
    anfrageAusFormular(formular({...VOLL, einwilligung: null})).fehler.feld,
    'einwilligung',
  );
});

test('ohne Produktinteresse gilt q_gespraech nein, auch wenn ja mitkommt', () => {
  const {anfrage} = anfrageAusFormular(
    formular({...VOLL, q_interesse: 'nur_ergebnis', q_gespraech: 'ja'}),
  );
  assert.equal(anfrage.q_gespraech, 'nein');
});

test('1:1-Regel: Terminweg nur bei Produkt UND ja UND Angebot des Dienstes', () => {
  const e = ergebnisAusAntwort(ANTWORT);
  assert.equal(terminwegZeigen(e, 'qione', 'ja'), true);
  assert.equal(terminwegZeigen(e, 'qione', 'nein'), false);
  assert.equal(terminwegZeigen(e, 'nur_ergebnis', 'ja'), false);
  assert.equal(terminwegZeigen({...e, gespraech_angeboten: false}, 'qione', 'ja'), false);
  assert.equal(gespraechGewuenscht('erfunden', 'ja'), false);
});

test('Quelle: utm_source/utm_campaign, gesäubert, sonst direkt', () => {
  assert.equal(quelleAusSuche(new URLSearchParams('')), 'direkt');
  assert.equal(
    quelleAusSuche(new URLSearchParams('utm_source=LinkedIn&utm_campaign=post 1')),
    'linkedin/post1',
  );
  assert.equal(quelleAusSuche(new URLSearchParams('utm_source=linkedin')), 'linkedin');
  assert.equal(quelleSaeubern('<script>/x/y'), 'script/x');
  assert.equal(quelleSaeubern(''), 'direkt');
});

test('Antwort des Dienstes: unvollständig ist kein Ergebnis', () => {
  assert.ok(ergebnisAusAntwort(ANTWORT));
  assert.equal(ergebnisAusAntwort({...ANTWORT, ok: false}), null);
  assert.equal(ergebnisAusAntwort({...ANTWORT, index: 101}), null);
  assert.equal(
    ergebnisAusAntwort({...ANTWORT, dimensionen: {...ANTWORT.dimensionen, fokus: undefined}}),
    null,
  );
  assert.equal(ergebnisAusAntwort({...ANTWORT, hebel: []}), null);
  assert.equal(ergebnisAusAntwort(null), null);
  assert.equal(ergebnisAusAntwort({...ANTWORT, pdf_url: 'http://x'}).pdf_url, null);
});

test('Mail-Satz verspricht die Mail nur, wenn sie versandt ist', () => {
  assert.match(mailSatz('versandt'), /per Mail, mit PDF/);
  assert.doesNotMatch(mailSatz('fehler'), /kommt auch per Mail/);
  assert.doesNotMatch(mailSatz('test_unterdrueckt'), /kommt auch per Mail/);
  assert.doesNotMatch(mailSatz('gedrosselt'), /kommt auch per Mail/);
});
