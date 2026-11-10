// Hermetische Tests der Anmeldelogik /pages/webinar-die-nacht-entscheidet
// (Grossjob 20261023-webinar-lp-die-nacht-entscheidet-serie-1511, s03).
// Bordmittel node:test/node:assert, KEIN Netz. Ausführen:
//   node --test app/components/campaign/nacht-webinar.test.mjs
// ARME: TERMIN (Text aus /w, ohne Termin kein Datum), ANTWORT (202/404/409/
// 400/403/429/503/Netz), LEAD (nur nach 202, Meta nur bei gebootetem Pixel),
// T (Serverzeit), UTM (Säuberung), KALENDER (F9), SEITE (Quelltext-Pflichten).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import * as L from './nacht-webinar.js';

const hier = dirname(fileURLToPath(import.meta.url));
const TERMIN = {
  webinar_id: 'longevity-esmog-wasser-2026-11-15',
  start: '2026-11-15T10:00:00+01:00',
  ende: '2026-11-15T11:00:00+01:00',
  utc: '2026-11-15T09:00:00Z',
};
const ANZEIGE = {
  art: 'webinar',
  einwilligung: 'Satz',
  einwilligung_id: '50873feedb1e',
  knopf: 'Kostenlos anmelden',
  vorname_feld: 'Dein Vorname',
  email_feld: 'Deine E-Mail-Adresse',
  termin: TERMIN,
};

test('TERMIN: Text aus der Quelle, Berliner Zeit', () => {
  assert.equal(L.terminText(L.terminAus(ANZEIGE)), 'Sonntag, 15. November, 10 Uhr');
  const halb = {...TERMIN, utc: '2026-11-29T09:30:00Z'};
  assert.equal(L.terminText(halb), 'Sonntag, 29. November, 10:30 Uhr');
});

test('TERMIN: fehlt er, steht kein Datum da', () => {
  for (const a of [null, {}, {termin: null, termin_fehler: 'kein_termin'}, {termin: {webinar_id: 'x'}}]) {
    const t = L.terminAus(a);
    assert.equal(t, null);
    const text = L.terminText(t);
    assert.equal(text, L.OHNE_TERMIN);
    assert.doesNotMatch(text, /\d/);
  }
});

test('ANTWORT: jeder Zweig des Vertrags', () => {
  const ok = L.antwortZustand(202, {ok: true, text: 'Mail kommt'});
  assert.deepEqual(ok, {zustand: 'fertig', meldung: 'Mail kommt', lead: true});
  assert.equal(L.antwortZustand(202, {ok: false}).lead, false);
  assert.equal(L.antwortZustand(202, null).zustand, 'bereit');
  assert.equal(L.antwortZustand(404, {fehler: 'formular_unbekannt'}).meldung, L.OEFFNET_BALD);
  assert.equal(L.antwortZustand(409, {fehler: 'einwilligung_veraltet'}).zustand, 'neu_laden');
  assert.match(L.antwortZustand(400, {}).meldung, /E-Mail-Adresse/);
  for (const s of [429, 503, 500]) {
    const z = L.antwortZustand(s, null);
    assert.equal(z.zustand, 'bereit');
    assert.equal(z.lead, false);
    assert.match(z.meldung, /nicht geklappt.*ein paar Minuten/);
  }
});

// Elina EL-20261103-ca2f6465: Fehlermeldung nur bei echtem Fehler.
const UNKLAR =
  'Wir konnten gerade nicht prüfen, ob deine Anmeldung angekommen ist. Schau bitte in dein Postfach. Kommt in ein paar Minuten keine Mail von uns, versuch es noch einmal.';
const GESPERRT = 'Diese Adresse ist bei uns gesperrt, zum Beispiel nach einer Abmeldung.';

test('ANTWORT: keine Antwort (Netz weg) sagt "unklar", nie "nicht geklappt"', () => {
  for (const antwort of [null, {}]) {
    const z = L.antwortZustand(0, antwort);
    assert.deepEqual(z, {zustand: 'bereit', meldung: UNKLAR, lead: false});
    assert.doesNotMatch(z.meldung, /nicht geklappt/);
  }
});

test('ANTWORT: 403 zeigt den Sperr-Hinweis des Endpunkts', () => {
  const z = L.antwortZustand(403, {ok: false, fehler: 'gesperrt', text: GESPERRT});
  assert.deepEqual(z, {zustand: 'bereit', meldung: GESPERRT, lead: false});
  // Ohne Text bleibt es beim allgemeinen Satz, nie eine leere Meldung.
  for (const antwort of [null, {ok: false}, {ok: false, text: '  '}, {ok: false, text: 7}]) {
    assert.match(L.antwortZustand(403, antwort).meldung, /nicht geklappt/);
  }
  // Ein Text zählt nur bei 403: andere Fehlerstatus zeigen nie einen Text aus der Antwort.
  assert.match(L.antwortZustand(503, {ok: false, text: GESPERRT}).meldung, /nicht geklappt/);
});

test('ANTWORT: Erfolg bleibt Erfolg (202 mit ok)', () => {
  const z = L.antwortZustand(202, {ok: true, status: 'bitte_bestaetigen', text: 'Schau in dein Postfach.'});
  assert.deepEqual(z, {zustand: 'fertig', meldung: 'Schau in dein Postfach.', lead: true});
});

test('LEAD: qpx immer, Meta nur bei gebootetem Pixel', () => {
  const qpx = [];
  const fbq = [];
  const qpxTrack = (...a) => qpx.push(a);
  const fenster = {fbq: (...a) => fbq.push(a)};
  let aus = L.leadSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, utm: '', eventId: 'e1'});
  assert.deepEqual(aus, {qpx: true, meta: false});
  assert.deepEqual(qpx[0], ['lead', {formular: 'webinar-nacht', webinar_id: TERMIN.webinar_id, event_id: 'e1'}]);
  assert.equal(fbq.length, 0);
  fenster._qiblancoMetaPixelBooted = true;
  aus = L.leadSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, utm: 'wns-a1', eventId: 'e2'});
  assert.deepEqual(aus, {qpx: true, meta: true});
  assert.equal(qpx[1][1].utm_content, 'wns-a1');
  assert.deepEqual(fbq[0], ['track', 'Lead', L.META_LEAD, {eventID: 'e2'}]);
  const kaputt = L.leadSenden({qpxTrack: () => { throw new Error('x'); }, fenster: {}, webinarId: ''});
  assert.deepEqual(kaputt, {qpx: false, meta: false});
});

// s02 (Grossjob webinar-livegang-longevity-esmog-wasser-2026-11-15): CompleteRegistration nach dem Double-Opt-In.
test('BESTAETIGUNG: qpx einmal, Meta erst nach Pixel-Boot und nur einmal, dieselbe Id', () => {
  const qpx = [];
  const fbq = [];
  const qpxTrack = (...a) => qpx.push(a);
  const fenster = {fbq: (...a) => fbq.push(a)};
  let g = L.bestaetigungSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, eventId: 'qbm-1', gesendet: {qpx: false, meta: false}});
  assert.deepEqual(g, {qpx: true, meta: false});
  assert.deepEqual(qpx, [['complete_registration', {formular: 'webinar-nacht', webinar_id: TERMIN.webinar_id, event_id: 'qbm-1'}]]);
  assert.equal(fbq.length, 0);
  g = L.bestaetigungSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, eventId: 'qbm-1', gesendet: g});
  assert.equal(qpx.length, 1);
  assert.equal(fbq.length, 0);
  fenster._qiblancoMetaPixelBooted = true;
  g = L.bestaetigungSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, eventId: 'qbm-1', gesendet: g});
  assert.deepEqual(g, {qpx: true, meta: true});
  assert.deepEqual(fbq, [['track', 'CompleteRegistration', L.META_COMPLETE_REGISTRATION, {eventID: 'qbm-1'}]]);
  g = L.bestaetigungSenden({qpxTrack, fenster, webinarId: TERMIN.webinar_id, eventId: 'qbm-1', gesendet: g});
  assert.equal(fbq.length, 1);
  assert.equal(qpx.length, 1);
  const ohneId = L.bestaetigungSenden({qpxTrack, fenster, webinarId: '', eventId: '', gesendet: {qpx: false, meta: false}});
  assert.deepEqual(ohneId, {qpx: false, meta: false});
  const kaputt = L.bestaetigungSenden({
    qpxTrack: () => { throw new Error('x'); },
    fenster: {_qiblancoMetaPixelBooted: true, fbq: () => { throw new Error('y'); }},
    webinarId: '', eventId: 'qbm-2', gesendet: {qpx: false, meta: false},
  });
  assert.deepEqual(kaputt, {qpx: false, meta: false});
});

test('BESTAETIGUNG: Adresse ohne angemeldet=bestaetigt, Rest bleibt', () => {
  const b = 'https://qiblanco.com/pages/webinar-die-nacht-entscheidet';
  assert.equal(L.adresseOhneBestaetigung(`${b}?angemeldet=bestaetigt`), '/pages/webinar-die-nacht-entscheidet');
  assert.equal(
    L.adresseOhneBestaetigung(`${b}?utm_content=wns-1&angemeldet=bestaetigt#anmelden`),
    '/pages/webinar-die-nacht-entscheidet?utm_content=wns-1#anmelden',
  );
  assert.equal(L.adresseOhneBestaetigung(b), null);
  assert.equal(L.adresseOhneBestaetigung(`${b}?angemeldet=ja`), null);
  assert.equal(L.adresseOhneBestaetigung('kein url'), null);
});

test('BESTAETIGUNG: beide Fassungen rufen den Haken, Lead-Id aus meta-event-id.js', () => {
  const seite = readFileSync(join(hier, 'NachtWebinarSeite.jsx'), 'utf8');
  const apple = readFileSync(join(hier, '../apple-seite/lp/NachtWebinarApple.jsx'), 'utf8');
  for (const q of [seite, apple]) assert.match(q, /useBestaetigung\(daten\.bestaetigt, /);
  assert.match(seite, /return META_EVENT_ID_PRAEFIX \+ uuid\(\);/);
  assert.doesNotMatch(seite, /crypto\.randomUUID/);
  assert.match(seite, /subscribeConsentChanges\(/);
  assert.match(seite, /window\.history\.replaceState\(window\.history\.state, '', neu\)/);
});

test('T und Nutzlast: Serverzeit, alle Vertragsfelder', () => {
  const werte = new Map(Object.entries({vorname: 'Ina', email: 'a@b.de', frage: 'Hals?', website: ''}));
  const n = L.nutzlast({werte, t: 1000.4 + 30000, anzeige: ANZEIGE, termin: TERMIN, seite: '/pages/x', utm: 'h1'});
  assert.deepEqual(n, {
    vorname: 'Ina', email: 'a@b.de', frage: 'Hals?', webinar_id: TERMIN.webinar_id, website: '',
    t: '31000', einwilligung_id: '50873feedb1e', seite: '/pages/x', utm_content: 'h1',
  });
  const ohne = L.nutzlast({werte, t: 5, anzeige: ANZEIGE, termin: null, seite: '/', utm: ''});
  assert.equal(ohne.webinar_id, '');
  assert.equal('utm_content' in ohne, false);
});

test('UTM: nur saubere Werte bis 64 Zeichen', () => {
  assert.equal(L.utmContent('?utm_content=wns-07_b'), 'wns-07_b');
  assert.equal(L.utmContent('?utm_content=a%20b'), '');
  assert.equal(L.utmContent('?utm_content=<x>'), '');
  assert.equal(L.utmContent(`?utm_content=${'a'.repeat(65)}`), '');
  assert.equal(L.utmContent(''), '');
});

test('KALENDER: nur mit sicherem Abstand zum Start (F9)', () => {
  const start = Date.parse(TERMIN.utc);
  assert.equal(L.kalenderErlaubt(TERMIN, start - 60 * 60 * 1000), true);
  assert.equal(L.kalenderErlaubt(TERMIN, start - 60 * 1000), false);
  assert.equal(L.kalenderErlaubt(TERMIN, start + 1), false);
  assert.equal(L.kalenderErlaubt(null, 0), false);
  const ics = L.icsText(TERMIN, 0);
  assert.match(ics, /DTSTART:20261115T090000Z/);
  assert.match(ics, /DTEND:20261115T100000Z/);
  assert.doesNotMatch(ics, /zoom\.us/i);
});

test('ANZEIGE: unvollständige Texte gelten nicht', () => {
  assert.equal(L.anzeigeVollstaendig(ANZEIGE), true);
  assert.equal(L.anzeigeVollstaendig({...ANZEIGE, einwilligung: ' '}), false);
  assert.equal(L.anzeigeVollstaendig({...ANZEIGE, art: 'anmeldung'}), false);
});

test('SEITE: Marker, noindex, Pflichtsätze, Verbotenes', () => {
  const seite = readFileSync(join(hier, 'NachtWebinarSeite.jsx'), 'utf8');
  const route = readFileSync(join(hier, '../../routes/pages.webinar-die-nacht-entscheidet.jsx'), 'utf8');
  assert.match(seite, /data-webinar=\{THEMA\}/);
  assert.match(seite, /Eine placebokontrollierte Humanstudie mit HRV-Messung ist in Vorbereitung, Prof\. Dr\. Dr\. Walach berät uns\./);
  assert.match(seite, /Live, keine Aufzeichnung/);
  assert.match(route, /noindex,nofollow/);
  assert.match(route, /'X-Robots-Tag': 'noindex, nofollow'/);
  assert.doesNotMatch(route, /rel: *'canonical'|canonicalLink/);
  for (const verboten of [/Heal World/i, /Jana/, /01\.11\./, /Mitte 50/, /Wallach/, /Countdown/i, /€|EUR/]) {
    assert.doesNotMatch(seite, verboten);
  }
  assert.doesNotMatch(seite + route, /2026-11-15|15\.11\.2026|15\. November/);
});

// Elina EL-20261107-af9594f2, Punkt 4: die Anmeldung geht über den Rückfall-Puffer, nie mehr als nackter fetch.
test('PUFFER: Seite sendet über zustellen(), zeigt den ehrlichen Satz, schickt beim Aufruf nach', () => {
  const seite = readFileSync(join(hier, 'NachtWebinarSeite.jsx'), 'utf8');
  assert.match(seite, /await zustellen\(/);
  assert.match(seite, /starteNachschicken\(\{endpunkt: ANMELDE_ENDPUNKT\}\)/);
  assert.match(seite, /data-webinar-zustand="gepuffert"/);
  assert.doesNotMatch(seite, /fetch\(`\$\{ANMELDE_ENDPUNKT\}\/f\//);
  assert.match(L.PUFFER_TEXT.wartet, /^Wir haben deine Anmeldung\. Sie wird gleich übertragen\.$/);
  assert.match(L.PUFFER_TEXT.gemerkt, /^Wir haben deine Anmeldung\./);
  assert.doesNotMatch(L.PUFFER_TEXT.gemerkt + L.PUFFER_TEXT.wartet, /nicht geklappt|Fehler/);
});
