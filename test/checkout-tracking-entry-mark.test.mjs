// Regressionstest zur Bereinigung von `landing_page`/`referrer`, bevor sie als
// Order-note_attribute bei Shopify landen (Job 20260809-fj1, gerettet aus PR #163).
// Stil wie checkout-tracking-signallos.test.mjs: node:test/node:assert als
// Bordmittel, KEIN Netz, kein neuer Runner.
// Ausführen: node --test test/checkout-tracking-entry-mark.test.mjs
//
// DER DEFEKT, DEN DIESE DATEI FESTNAGELT:
//   `landing_page`/`referrer` trugen den VOLLEN href inklusive Query und
//   Fragment in ein Order-note_attribute. Ein Query-String kann personen-
//   beziehbar sein (`?email=`, `?token=`, `?phone=`). Gemessen am 2026-08-10
//   trugen 12 von 21 realen Werten eine Query — ausschließlich Ad-/Kampagnen-
//   Keys, also KEIN aktiver Leak. Der Sanitizer ist ein PRÄVENTIVER Riegel,
//   keine Behebung eines laufenden Vorfalls; die Tests halten ihn scharf.
//
// DIE FEHLERRICHTUNG IST DER KERN: bereinigt wird per DENYLIST, nicht per
// Allowlist. Fremde Backend-Parser (hyros-eigenbau own_source/_landing_params
// + herkunft, capi-rueckspeisung, google-rueckspeisung, funnel-substrat) lesen
// aus genau dieser Query Keys wie `sca_ref`, `gad_campaignid`, `source`, die in
// TRACKING_PARAM_NAMES bewusst NICHT stehen. Eine Allowlist wäre eine hand-
// gepflegte Cross-Repo-Spiegelliste ohne Durchsetzer: ein übersehener Key
// wäre ein STILLER Attributionsverlust. Bei der Denylist ist ein übersehener
// Key unveränderter Bestand.
//
// NICHT Gegenstand dieser Datei: ob `landing_page` auch OHNE Tracking-Signal
// geschrieben werden soll. Das `hasTrackingSignal`-Gate stammt aus PR #174
// (Datensparsamkeit) und bleibt hier absichtlich unangetastet.
import test from 'node:test';
import assert from 'node:assert/strict';

import {buildAttributionCartAttributes} from '../app/lib/checkout-tracking.js';

const ANON = 'a184b103-5aa6-41be-bbf5-90d37d1b07f9';

// Ein Ad-Signal ist nötig, sonst greift das hasTrackingSignal-Gate aus #174
// und landing_page/referrer werden ohnehin nicht geschrieben.
const SIGNAL = '?fbclid=IwAR0test';

function attributionCookie({href, referrer} = {}) {
  const payload = JSON.stringify({
    href: href ?? 'https://qiblanco.com/products/qione-2-pro',
    referrer: referrer ?? 'https://www.google.com/',
    savedAt: '2026-08-10T09:00:00.000Z',
  });
  return `qiblanco_checkout_attribution=${encodeURIComponent(payload)}; _qpx_anon=${ANON}`;
}

function bauen({href, referrer} = {}) {
  const attrs = buildAttributionCartAttributes({
    searchParams: SIGNAL,
    cookieHeader: attributionCookie({href, referrer}),
    includeCookies: true,
  });
  return new Map(attrs.map((a) => [a.key, a.value]));
}

test('Identitäts-Query-Keys werden aus landing_page entfernt', () => {
  const m = bauen({
    href: 'https://qiblanco.com/pages/schlaf?email=kunde%40example.com&gclid=abc123',
  });
  const lp = m.get('landing_page');
  assert.ok(lp, 'landing_page muss gesetzt sein');
  assert.ok(!lp.includes('email'), `email darf nicht durchkommen: ${lp}`);
  assert.ok(!lp.includes('example.com'), `Adresswert darf nicht durchkommen: ${lp}`);
});

test('Ad-/Kampagnen-Keys ÜBERLEBEN die Bereinigung (sonst Attributionsverlust)', () => {
  const m = bauen({
    href: 'https://qiblanco.com/pages/schlaf?gclid=abc123&sca_ref=partner7&gad_campaignid=8925560332&utm_source=google',
  });
  const lp = m.get('landing_page');
  for (const key of ['gclid=abc123', 'sca_ref=partner7', 'gad_campaignid=8925560332', 'utm_source=google']) {
    assert.ok(lp.includes(key), `${key} muss erhalten bleiben, fehlte in: ${lp}`);
  }
});

test('ohne zu entfernenden Key bleibt der Wert BYTE-IDENTISCH', () => {
  // Der Eingabewert MUSS einer sein, den `new URL().toString()` verändern
  // würde — sonst ist der Test vakuum-gruen und hält den Durchlass gar nicht
  // fest. (Genau das ist hier beim ersten Anlauf passiert: mit einer bereits
  // normalisierten URL überlebte der Mutant "Durchlass entfernt" unbemerkt.)
  const roh = 'https://qiblanco.com/pages/../pages/schlaf?utm_content=a b&gclid=abc';
  assert.notEqual(
    new URL(roh).toString(),
    roh,
    'Vorbedingung: dieser Wert muss normalisiert werden, sonst testet der Fall nichts',
  );

  const m = bauen({href: roh});
  assert.equal(
    m.get('landing_page'),
    roh,
    'keine URL-Normalisierung als Nebenwirkung — fremde Parser lesen den Rohwert',
  );
});

test('der Fragment-Teil wird abgeschnitten', () => {
  const m = bauen({href: 'https://qiblanco.com/pages/schlaf?gclid=abc#token=geheim'});
  const lp = m.get('landing_page');
  assert.ok(!lp.includes('#'), `Fragment muss weg sein: ${lp}`);
  assert.ok(!lp.includes('geheim'), `Fragment-Inhalt muss weg sein: ${lp}`);
});

test('nicht-http(s)-Referrer werden verworfen (javascript:/data:)', () => {
  for (const boese of ['javascript:alert(1)', 'data:text/html,<script>x</script>']) {
    const m = bauen({referrer: boese});
    assert.equal(
      m.get('referrer'),
      undefined,
      `nicht-Web-Protokoll darf kein note_attribute werden: ${boese}`,
    );
  }
});

test('kaputte URL wird verworfen statt roh durchgereicht', () => {
  const m = bauen({referrer: 'nicht mal eine url'});
  assert.equal(m.get('referrer'), undefined);
});

test('der Sanitizer ruehrt das hasTrackingSignal-Gate aus #174 NICHT an', () => {
  // Ohne Ad-Signal: Marker ja, landing_page/referrer nein — unverändertes
  // Verhalten aus PR #174. Wäre das hier kaputt, haette der Sanitizer eine
  // fremde Datensparsamkeits-Entscheidung mitgerissen.
  //
  // ACHTUNG (beim Schreiben dieses Tests einmal reingefallen): der Cookie
  // `_qpx_anon` steht selbst in TRACKING_COOKIE_NAMES und IST damit bereits ein
  // Signal. Der signal-lose Fall braucht deshalb einen Cookie-Header, der NUR
  // den Attributions-Record trägt.
  const payload = JSON.stringify({
    href: 'https://qiblanco.com/products/qione-2-pro',
    referrer: 'https://www.google.com/',
    savedAt: '2026-08-10T09:00:00.000Z',
  });
  const attrs = buildAttributionCartAttributes({
    searchParams: '',
    cookieHeader: `qiblanco_checkout_attribution=${encodeURIComponent(payload)}`,
    includeCookies: true,
  });
  const m = new Map(attrs.map((a) => [a.key, a.value]));
  assert.equal(m.get('attribution_source'), 'qiblanco_hydrogen');
  assert.equal(m.get('landing_page'), undefined);
  assert.equal(m.get('referrer'), undefined);
});
