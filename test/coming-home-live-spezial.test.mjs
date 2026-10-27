/**
 * /pages/live, Spezial beim Gastgeber (Grossjob 20261025-webinar-heal-world-
 * 0111, s03, Naht N1).
 *
 * WAS DIESER TEST BEWEIST: ein Vorschau-Artikel mit Tag ch-anmeldung-extern
 * wird zur Termin-Karte mit Zoom-Anmeldung des Gastgebers, und NUR eine
 * Zoom-Registrierung kommt als Knopf auf die Seite. Der Artikel unten ist die
 * Ausgabe von coming-home/src/text/vorschau.py baue() für den 01.11.2026
 * (s02, Stand 26.10.2026), nicht nachgeschrieben.
 *
 * NEGATIV-KONTROLLEN SIND TRAGEND: „extern erkannt“ wäre auch grün, wenn jede
 * URL durchginge. Deshalb je ein Fall mit fremder Domain, Zoom-Beitrittslink,
 * Unterdomain-Trick, http und Pfad-Anhang, und ein Fall ohne Tag.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  ANMELDE_URL_RX,
  DAUER_MIN,
  FIXTUR_ANMELDE_URL,
  anmeldungExtern,
  berlinZuUtc,
  fixturArtikel,
  seitenDaten,
  teaserOhnePflicht,
  terminAusArtikel,
} from '../app/lib/coming-home-live.server.js';
import {ohneProsa} from './_quelltext.mjs';

const HEAL = 'https://us06web.zoom.us/meeting/register/e2KpczYcTpCqbsHQIh9iPg';

// Ausgabe von coming-home baue('2026-11-01', ...) (s02), Tags laut s02-coming-home.md.
const SPEZIAL = {
  handle: 'coming-home-2026-11-01',
  title: 'Coming Home Spezial: Live bei Heal World Summit',
  excerpt:
    'Am Sonntag, 1. November 2026, um 11 Uhr (Berlin) spricht Christian live beim Heal World Summit: „Physikalische Eigenschaften von kohärentem Wasser und welche Bedeutung dies für uns hat“. Anmeldung notwendig.',
  contentHtml:
    '<p>Am Sonntag, 1. November 2026, um 11 Uhr (Berlin) ist Coming Home Spezial. Christian hält live einen Vortrag beim Heal World Summit.</p>\n' +
    '<p>Sein Thema: „Physikalische Eigenschaften von kohärentem Wasser und welche Bedeutung dies für uns hat“.</p>\n' +
    '<p>Anmeldung notwendig: Der Heal World Summit lädt über eine eigene Zoom-Anmeldung ein. Nach der Anmeldung bekommst du den Zugang per Mail.</p>\n' +
    `<p><a href="${HEAL}">Zur Anmeldung beim Heal World Summit</a></p>\n` +
    '<p>An diesem Sonntag gilt der Link des Heal World Summit. Am Sonntag, 8. November 2026, sind wir wieder bei Coming Home.</p>',
  tags: ['ch-termin', 'ch-datum-2026-11-01', 'ch-zeit-1100', 'ch-vorschau', 'ch-anmeldung-extern'],
};

function vorschau(datum, title) {
  return {
    handle: `coming-home-${datum}`,
    title,
    excerpt: `Am Sonntag treffen wir uns wieder auf Zoom. Unser Thema: ${title}.`,
    contentHtml: '<p>Anmelden geht mit Name und E-Mail auf qiblanco.com unter Live.</p>',
    tags: ['ch-termin', `ch-datum-${datum}`, 'ch-zeit-1200', 'ch-vorschau'],
  };
}

const FOLGE = [
  vorschau('2026-11-08', 'Coming Home Spezial: Qi Alpha Live-Präsentation – für alle, die wollen'),
  vorschau('2026-11-15', 'Angst – unterbewusste Blockaden erkennen und auflösen'),
  vorschau('2026-11-22', 'Drama kreieren, um zu fühlen, dass man lebt'),
];

const mitLink = (href, text = 'Zur Anmeldung beim Heal World Summit') => ({
  ...SPEZIAL,
  contentHtml: `<p>Text.</p><p><a href="${href}">${text}</a></p>`,
});

test('s02-Artikel: Tag ch-anmeldung-extern -> extern mit Heal-URL und Gastgeber', () => {
  const t = terminAusArtikel(SPEZIAL);
  assert.equal(t.art, 'vorschau');
  assert.equal(t.zeit, '1100');
  assert.deepEqual(t.extern, {url: HEAL, gastgeber: 'Heal World Summit'});
  assert.equal(t.start.toISOString(), '2026-11-01T10:00:00.000Z');
});

test('Seitendaten 27.10.: nächster Termin 01.11. 11:00 extern, drei Sonntage danach', () => {
  const d = seitenDaten([...FOLGE, SPEZIAL], new Date('2026-10-27T08:00:00Z'));
  const n = d.naechster;
  assert.equal(n.datum, '2026-11-01');
  assert.equal(n.quelle, 'blog');
  assert.equal(n.uhrzeit, '11:00 Uhr');
  assert.equal(n.titel, 'Coming Home Spezial: Live bei Heal World Summit');
  assert.equal(n.extern.url, HEAL);
  assert.match(n.teaser, /kohärentem Wasser/);
  // „Anmeldung notwendig“ steht als eigene Zeile auf der Karte, nicht doppelt.
  assert.doesNotMatch(n.teaser, /Anmeldung notwendig/);
  assert.deepEqual(
    d.weitere.map((w) => [w.datum, w.extern]),
    [['2026-11-08', null], ['2026-11-15', null], ['2026-11-22', null]],
  );
  assert.match(d.weitere[2].titel, /^Drama kreieren/);
});

test('nach dem Vortrag (01.11. 11:00 + DAUER_MIN) ist der 08.11. der nächste Termin', () => {
  const ende = berlinZuUtc('2026-11-01', '1100').getTime() + DAUER_MIN * 60000;
  const kurz = seitenDaten([...FOLGE, SPEZIAL], new Date(ende - 60000));
  assert.equal(kurz.naechster.datum, '2026-11-01');
  const d = seitenDaten([...FOLGE, SPEZIAL], new Date(ende + 60000));
  assert.equal(d.naechster.datum, '2026-11-08');
  assert.equal(d.naechster.extern, null);
});

test('Allowlist: nur Zoom-Registrierung, sonst keine URL (kein toter Knopf)', () => {
  const fremd = [
    'https://example.com/meeting/register/e2KpczYcTpCqbsHQIh9iPg',
    'https://us06web.zoom.us/j/81234567890',
    'https://zoom.us.example.com/meeting/register/abc123',
    'http://us06web.zoom.us/meeting/register/e2KpczYcTpCqbsHQIh9iPg',
    `${HEAL}?pwd=1`,
    `${HEAL}/extra`,
    'javascript:alert(1)//zoom.us/meeting/register/x',
  ];
  for (const href of fremd) {
    assert.equal(ANMELDE_URL_RX.test(href), false, href);
    const t = terminAusArtikel(mitLink(href));
    assert.deepEqual(t.extern, {url: null, gastgeber: ''}, href);
  }
  for (const href of [HEAL, 'https://zoom.us/meeting/register/AbC_-9']) {
    assert.equal(terminAusArtikel(mitLink(href)).extern.url, href);
  }
});

test('der erste PASSENDE Link zählt, ein fremder davor wird übersprungen', () => {
  const a = {
    ...SPEZIAL,
    contentHtml:
      '<p><a href="https://example.com/x">Mehr</a></p>' +
      `<p><a class="k" href='${HEAL}'>Zur Anmeldung bei der <b>Heal&amp;Co</b> Runde</a></p>` +
      '<p><a href="https://zoom.us/meeting/register/Zweiter">Zweiter</a></p>',
  };
  assert.deepEqual(terminAusArtikel(a).extern, {url: HEAL, gastgeber: 'Heal&Co Runde'});
  assert.deepEqual(anmeldungExtern(`<a href="${HEAL}">Jetzt anmelden</a>`), {url: HEAL, gastgeber: ''});
  assert.equal(anmeldungExtern(`<a href="${HEAL.replace('register', 'regis&amp;ter')}">x</a>`).url, null);
});

test('ohne Tag kein extern, auch mit Zoom-Link; ein Rückblick ist nie extern', () => {
  const ohneTag = {...SPEZIAL, tags: SPEZIAL.tags.filter((t) => t !== 'ch-anmeldung-extern')};
  assert.equal(terminAusArtikel(ohneTag).extern, null);
  const rueck = {
    ...SPEZIAL,
    tags: ['ch-termin', 'ch-datum-2026-11-01', 'ch-zeit-1100', 'ch-rueckblick', 'ch-anmeldung-extern'],
  };
  assert.equal(terminAusArtikel(rueck).extern, null);
  const d = seitenDaten([ohneTag], new Date('2026-10-27T08:00:00Z'));
  assert.equal(d.naechster.extern, null);
  assert.match(d.naechster.teaser, /Anmeldung notwendig\.$/);
});

test('teaserOhnePflicht nimmt nur den Schluss', () => {
  assert.equal(teaserOhnePflicht('Thema X. Anmeldung notwendig.'), 'Thema X.');
  assert.equal(teaserOhnePflicht('Anmeldung notwendig ist gut, sagt X.'), 'Anmeldung notwendig ist gut, sagt X.');
});

test('Fixtur spezial: extern mit Attrappen-URL, drei Sonntage danach, auch Sonntagnachmittag', () => {
  for (const jetzt of [
    new Date('2026-10-27T08:00:00Z'), // Dienstag
    new Date('2026-11-01T08:00:00Z'), // Sonntag vor 11 Uhr Berlin
    new Date('2026-11-01T15:00:00Z'), // Sonntag nach dem Termin
  ]) {
    const d = seitenDaten(fixturArtikel('spezial', jetzt), jetzt);
    assert.equal(d.naechster.extern.url, FIXTUR_ANMELDE_URL, jetzt.toISOString());
    assert.ok(ANMELDE_URL_RX.test(FIXTUR_ANMELDE_URL));
    assert.equal(d.weitere.length, 3);
    assert.equal(d.rueckblicke.length, 2);
  }
  const spaet = seitenDaten(fixturArtikel('spezial', new Date('2026-11-01T15:00:00Z')), new Date('2026-11-01T15:00:00Z'));
  assert.equal(spaet.naechster.datum, '2026-11-08');
});

// MARKER-VERTRAG (Grossjob 20261020-coming-home-live-seite-neu, s05, 27.10.2026):
// data-ch-live-eintrag heißt „ein Rückblick-Eintrag“. So lesen ihn fünf Proben
// aus drei Grossjobs (coming-home probe_live_seite Z, probe_live_bild_ausklappen A,
// probe_live_namen_tipp, probe_coming_home_ziel S; worker-pool Naht s01). #1025
// setzte ihn auch an die Liste „Die nächsten Sonntage“. Seit dem 27.10. 03:38Z
// (Vorschau 08.11. live) standen 6 Marker bei 5 Rückblicken, und drei Proben
// waren falsch rot. Die Liste trägt deshalb data-ch-live-weitere-eintrag.
//
// Gemessen am Quelltext, nicht am Render (kein Test hier rendert JSX): je
// Element mit data-ch-live="<block>" seine Ausdehnung bis zum passenden
// Schluss-Tag, dann liegt jeder Marker in einem Rückblick-Block oder nirgends.
const ROUTE = ohneProsa(
  readFileSync(new URL('../app/routes/pages.live.jsx', import.meta.url), 'utf8'),
);

/** Index des „>“, das den Tag ab i schließt; Klammern {…} und Strings zählen nicht. */
function tagEnde(code, i) {
  let tiefe = 0;
  let zitat = '';
  for (let k = i; k < code.length; k++) {
    const c = code[k];
    if (zitat) {
      if (c === zitat) zitat = '';
    } else if (c === '"' || c === "'" || c === '`') zitat = c;
    else if (c === '{') tiefe++;
    else if (c === '}') tiefe--;
    else if (c === '>' && tiefe === 0) return k;
  }
  return -1;
}

/** [anfang, ende) jedes Elements mit data-ch-live="<art>". */
function bloecke(code, art) {
  const out = [];
  const rx = new RegExp(`data-ch-live="${art}"`, 'g');
  for (let m; (m = rx.exec(code)); ) {
    const anfang = code.lastIndexOf('<', m.index);
    const name = /^<([A-Za-z][\w.]*)/.exec(code.slice(anfang))?.[1];
    assert.ok(name, `kein Tag vor data-ch-live="${art}" an ${m.index}`);
    const tags = new RegExp(`<(/?)${name}(?=[\\s>/])`, 'g');
    tags.lastIndex = anfang;
    let tiefe = 0;
    let ende = -1;
    for (let t; (t = tags.exec(code)); ) {
      const zu = tagEnde(code, t.index);
      if (t[1]) tiefe--;
      else if (code[zu - 1] !== '/') tiefe++;
      if (tiefe === 0) {
        ende = zu + 1;
        break;
      }
    }
    assert.ok(ende > anfang, `<${name} data-ch-live="${art}"> ohne Schluss-Tag`);
    out.push([anfang, ende]);
  }
  return out;
}

// Wer trägt die Stelle i? Der Tag-Anfang mit Klasse; Zeilennummern taugen nicht,
// ohneProsa zieht Kommentare zu einem Leerzeichen zusammen.
const traeger = (i) => {
  const a = ROUTE.lastIndexOf('<', i);
  const k = /className="([^"]*)"/.exec(ROUTE.slice(a, i));
  return `<${/^<([\w.]+)/.exec(ROUTE.slice(a))?.[1]}${k ? ` .${k[1]}` : ''}>`;
};
const stellen = (rx) => [...ROUTE.matchAll(rx)].map((m) => m.index);

test('data-ch-live-eintrag steht nur im Rückblick, auch wenn „Die nächsten Sonntage“ Punkte hat', () => {
  // Der Fall von #1025: mit Rückblicken UND weiteren Sonntagen steht beides auf der Seite.
  const d = seitenDaten(fixturArtikel('spezial', new Date('2026-10-27T08:00:00Z')), new Date('2026-10-27T08:00:00Z'));
  assert.ok(d.weitere.length > 0 && d.rueckblicke.length > 0);

  const rueck = bloecke(ROUTE, 'rueckblick');
  const weitere = bloecke(ROUTE, 'weitere');
  assert.ok(rueck.length >= 1, 'kein Block data-ch-live="rueckblick"');
  assert.ok(weitere.length >= 1, 'kein Block data-ch-live="weitere"');
  const drin = (i, bs) => bs.some(([a, e]) => i > a && i < e);

  const eintraege = stellen(/data-ch-live-eintrag=/g);
  // Positivkontrolle: jeder Rückblick-Block trägt den Marker weiter.
  for (const [a, e] of rueck) {
    assert.ok(eintraege.some((i) => i > a && i < e), `Rückblick ${traeger(a + 1)} ohne data-ch-live-eintrag`);
  }
  const fremd = eintraege.filter((i) => !drin(i, rueck)).map(traeger);
  assert.deepEqual(fremd, [], `data-ch-live-eintrag außerhalb des Rückblicks an ${fremd}`);

  // Die Punkte der Liste tragen ihren eigenen Marker, und nur dort steht er.
  const listenMarker = stellen(/data-ch-live-weitere-eintrag=\{w\.datum\}/g);
  assert.ok(listenMarker.length >= 1, 'Liste „Die nächsten Sonntage“ ohne data-ch-live-weitere-eintrag');
  for (const i of listenMarker) assert.ok(drin(i, weitere), `data-ch-live-weitere-eintrag außerhalb der Liste an ${traeger(i)}`);
});
