import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, unlinkSync} from 'node:fs';

/**
 * BEWERTUNGSLEISTE MIT 50 KARTEN (Christian 12.11.2026, Job 20261112-prio1-bewertungsleiste-
 * neueste-50-google-bewertungen-laden: „ruhig mal die letzten 50 Bewertungen laden und anzeigen").
 *
 * Der Reputon-Feed fuehrt nur rund 40 Fuenf-Sterne-Texte; die 50 kommen aus dem Business-API-Export
 * (BEWERTUNGS_EXPORT_URL). ROT-ARM: am Stand vor diesem Bau liest der Loader nur Reputon, die Leiste
 * bekommt dann hoechstens die Karten des Feeds, und BEWERTUNGSLEISTE_ANZAHL ist 20.
 *
 * googleRating.server.js nutzt den Vite-Alias `~/lib/…`: Schattenkopie wie in
 * google-reviews-ausschluss.test.mjs (Hausmuster), danach wieder entfernt.
 */
const originalUrl = new URL('../app/lib/googleRating.server.js', import.meta.url);
const schattenUrl = new URL(`../app/lib/.test-gr50-${process.pid}.mjs`, import.meta.url);
writeFileSync(
  schattenUrl,
  readFileSync(originalUrl, 'utf8').replace(
    /from '~\/lib\/([A-Za-z0-9_.-]+)'/g,
    (_m, name) => `from './${name}${name.endsWith('.js') ? '' : '.js'}'`,
  ),
);
let modul;
try {
  modul = await import(schattenUrl.href);
} finally {
  unlinkSync(schattenUrl);
}

function feed(n, praefix) {
  const jetzt = Math.floor(Date.now() / 1000);
  return {
    business: [
      {
        rating: 4.8,
        reviewsNumber: 447,
        reviews: Array.from({length: n}, (_, i) => ({
          id: `${praefix}${i}`,
          hashId: `${praefix}${i}`,
          authorName: `Name ${i}`,
          profilePhotoUrl: '',
          rating: 5,
          text: `Text ${i}`,
          time: jetzt - i * 86400,
          relativeTimeDescription: '',
          images: [],
          hide: false,
        })),
      },
    ],
  };
}

async function mitFetch(antworten, fn) {
  const alt = globalThis.fetch;
  const gerufen = [];
  globalThis.fetch = async (url) => {
    gerufen.push(String(url));
    const a = antworten[String(url)];
    if (!a) return {ok: false, status: 404, json: async () => ({})};
    if (a === 'wirft') throw new Error('Zeitgrenze');
    return {ok: true, status: 200, json: async () => a};
  };
  try {
    return {wert: await fn(), gerufen};
  } finally {
    globalThis.fetch = alt;
  }
}

test('Loader liest zuerst den Business-API-Export und liefert 50 Karten', async () => {
  const {BEWERTUNGS_EXPORT_URL, REPUTON_FEED_URL, ladeGoogleRating} = modul;
  assert.equal(typeof BEWERTUNGS_EXPORT_URL, 'string', 'BEWERTUNGS_EXPORT_URL fehlt (Altstand: nur Reputon)');
  const {wert, gerufen} = await mitFetch(
    {[BEWERTUNGS_EXPORT_URL]: feed(60, 'api'), [REPUTON_FEED_URL]: feed(39, 'rep')},
    () => ladeGoogleRating({env: {}}),
  );
  assert.equal(gerufen[0], BEWERTUNGS_EXPORT_URL);
  assert.equal(wert.reviews.length, 50);
  assert.equal(wert.reviews[0].quellId, 'api0', 'neueste zuerst');
  assert.equal(wert.source, 'google-api');
});

test('faellt der Export aus, liest der Loader wie bisher Reputon', async () => {
  const {BEWERTUNGS_EXPORT_URL, REPUTON_FEED_URL, ladeGoogleRating} = modul;
  for (const ausfall of [undefined, 'wirft']) {
    const antworten = {[REPUTON_FEED_URL]: feed(39, 'rep')};
    if (ausfall) antworten[BEWERTUNGS_EXPORT_URL] = ausfall;
    const {wert} = await mitFetch(antworten, () => ladeGoogleRating({env: {}}));
    assert.equal(wert.source, 'reputon');
    assert.equal(wert.reviews.length, 39);
  }
});

test('Leiste zeigt 50, der Server rendert davon die ersten 20 (Nachladen)', () => {
  const leiste = readFileSync(
    new URL('../app/components/reusables/GoogleBewertungsleiste.jsx', import.meta.url),
    'utf8',
  );
  assert.match(leiste, /export const BEWERTUNGSLEISTE_ANZAHL = 50;/);
  assert.match(leiste, /startAnzahl=\{BEWERTUNGSLEISTE_ERSTE\}/);
  const slider = readFileSync(
    new URL('../app/components/index-components/ReputonWidget.jsx', import.meta.url),
    'utf8',
  );
  assert.match(slider, /sichtbareReviews\.map\(/, 'Kartenreihe rendert nicht die nachgeladene Liste');
  assert.match(slider, /loading="lazy"/, 'Profilbilder nicht lazy');
});
