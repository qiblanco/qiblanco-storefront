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
