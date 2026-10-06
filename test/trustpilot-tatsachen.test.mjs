// Hermetische Tests der Tatsachenseite /pages/qi-blanco-auf-trustpilot
// (Job 20261001-s07vm-tatsachenseite-trustpilot). Bauform 1:1 von
// test/reddit-tatsachen.test.mjs. node:test/node:assert, KEIN Netz.
// Ausfuehren: node --test test/trustpilot-tatsachen.test.mjs
//
// WAS DIESE DATEI PRUEFT UND WAS NICHT: die ZUSAGEN des Baus am Quelltext —
// indexierbar, Schema aus sichtbarem Text, KEINE Anzahl von Bewertungen,
// keine Namen und keine Fremdnote, das Profil nicht als unseres ausgegeben,
// eingehender Link der FAQ. Ob die Seite LIVE hell ist, misst homepage-bauer/
// pruefungen/probe_zweifelsseite_dunkel.py --flaeche trustpilot; ob ihr
// TrustScore noch stimmt, seo-manager/pruefungen/
// probe_trustpilot_stand_auf_der_seite.py.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {ohneProsa} from './_quelltext.mjs';

import {
  BERICHTE_STUDIE,
  FRAGEN,
  FREMD,
  KOPF,
  PROFIL,
  PROFIL_ABSCHNITT,
  STAND,
  UNTER_VIER_KURZ,
  ZAHL,
} from '../app/data/trustpilot-tatsachen.js';
import {buildFaqPageJsonLd} from '../app/lib/faq-schema.js';
import {NUR_ROUTE_SEITEN} from '../app/lib/seo.js';
import {FAQ_ALLE} from '../app/data/faq-seite.js';
import {MARKEN_PROFILE} from '../app/lib/entity-schema.js';

const lies = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

const PFAD = '/pages/qi-blanco-auf-trustpilot';
// Der Dateiname der Route folgt dem Pfad; er wird abgeleitet, nicht getippt.
const ROUTE = ohneProsa(lies(`../app/routes/pages.${PFAD.split('/').pop()}.jsx`));
const KOMPONENTE = ohneProsa(
  lies('../app/components/campaign/TrustpilotTatsachenSeite.jsx'),
);
const CSS = ohneProsa(lies('../app/styles/trustpilot-tatsachen.css'));
const DATEN = ohneProsa(lies('../app/data/trustpilot-tatsachen.js'));

// ---------------------------------------------------------------------------
// Abrufbar UND indexierbar.
// ---------------------------------------------------------------------------

test('die Route trägt KEIN noindex und KEINEN X-Robots-Tag', () => {
  assert.ok(!/noindex/i.test(ROUTE), 'noindex im Programmtext der Route');
  assert.ok(!/headers\s*=/.test(ROUTE), 'die Route exportiert headers()');
});

test('die Route setzt ein echtes canonical über canonicalLink()', () => {
  assert.match(ROUTE, /canonicalLink\(PFAD\)/);
  assert.ok(!/\{rel:\s*'canonical'/.test(ROUTE));
  assert.match(ROUTE, new RegExp(`const PFAD = '${PFAD}'`));
});

test('die Seite steht in NUR_ROUTE_SEITEN und nennt dort ihre Wache', () => {
  const e = NUR_ROUTE_SEITEN.find((s) => s.pfad === PFAD);
  assert.ok(e, 'kein NUR_ROUTE_SEITEN-Eintrag');
  assert.match(e.grund, /probe_zweifelsseite_dunkel\.py ' \+\s*'--flaeche trustpilot|--flaeche trustpilot/);
  assert.match(e.lastmod, /^\d{4}-\d{2}-\d{2}T/);
});

test('robots.txt sperrt diesen Pfad nicht', () => {
  const robots = lies('../app/routes/[robots.txt].jsx');
  assert.ok(!robots.includes(`Disallow: ${PFAD}`));
});

test('die indexierte FAQ verlinkt hierher, ohne ihre bestehenden Wege zu verlieren', () => {
  const wege = (i) => [].concat(i.auch || []);
  const treffer = FAQ_ALLE.filter((i) => wege(i).some((a) => a.pfad === PFAD));
  assert.equal(treffer.length, 1);
  assert.ok(wege(treffer[0]).find((a) => a.pfad === PFAD).text.length > 20);
  // Der Eintrag behält seinen Weg zu /pages/bewertungen und den zur
  // Reddit-Seite: ein weiterer Link darf keinen bestehenden verdrängen.
  assert.equal(treffer[0].weiter?.pfad, '/pages/bewertungen');
  assert.ok(
    wege(treffer[0]).some((a) => a.pfad === '/pages/was-auf-reddit-ueber-qi-blanco-steht'),
  );
  const faq = ohneProsa(lies('../app/components/faq/FaqSeite.jsx'));
  assert.match(faq, /\[\]\.concat\(item\.auch/);
});

// ---------------------------------------------------------------------------
// Das Schema entsteht AUS dem sichtbaren Text.
// ---------------------------------------------------------------------------

test('jede Frage passiert das Deny-Netz', () => {
  const schema = buildFaqPageJsonLd(FRAGEN, {inLanguage: 'de-DE'});
  assert.ok(schema, 'kein Schema entstanden');
  assert.equal(schema.mainEntity.length, FRAGEN.length);
  assert.ok(FRAGEN.length >= 5);
});

test('jede Schema-Frage steht auch sichtbar auf der Seite', () => {
  assert.match(KOMPONENTE, /FRAGEN\.map/);
  assert.match(KOMPONENTE, /\{f\.q\}/);
  assert.match(KOMPONENTE, /\{f\.a\}/);
  assert.match(ROUTE, /buildFaqPageJsonLd\(FRAGEN/);
});

test('das Schema trägt Datum als Konstanten, nicht als Uhr', () => {
  assert.match(ROUTE, /const TPT_VEROEFFENTLICHT = '\d{4}-\d{2}-\d{2}'/);
  assert.match(ROUTE, /const TPT_GEAENDERT = '\d{4}-\d{2}-\d{2}'/);
  assert.ok(!/new Date\(\)/.test(ROUTE));
});

// ---------------------------------------------------------------------------
// KEINE ANZAHL (Christian 2026-10-06, Job 20261006-bau-trustpilot-scroller-ki-
// seiten-und-faq, Feste Grenze 2): „nicht die Gesamtanzahl anzeigen, da es nur
// 27 sind". Weder Gesamt- noch Teilanzahl, weder in Ziffern noch als Zahlwort,
// weder im sichtbaren Text noch in Titel, Beschreibung oder FAQPage-Schema.
// Die Zählung bleibt im Datenmodul, weil der Satz „keine unter vier Sternen"
// an ihr hängt.
// ---------------------------------------------------------------------------

// Alles, was die Seite über Trustpilot sichtbar sagt (das Schema kommt aus FRAGEN).
const SICHTBAR = [
  UNTER_VIER_KURZ,
  KOPF.vorspann,
  KOPF.titel,
  KOPF.lead,
  KOPF.quelle,
  PROFIL_ABSCHNITT.titel,
  PROFIL_ABSCHNITT.einleitung,
  ...PROFIL_ABSCHNITT.punkte.flatMap((p) => [p.titel, p.text]),
  ...FRAGEN.flatMap((f) => [f.q, f.a]),
];
const ZAHLWORT = '(?:eine[rn]?|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf)';
const ANZAHL = [
  // „27 Bewertungen", „26 der 27", „27 Stimmen", „Alle 27"
  /\b\d+\s+(?:der\s+\d+\s+)?(?:Trustpilot-)?(?:Bewertungen|Bewertung|Stimmen|Rezensionen)\b/i,
  /\b\d+\s+der\s+\d+\b/,
  /\bAlle\s+\d+\b/i,
  // „eine gibt vier", „zwei Bewertungen", „alle bis auf eine"
  new RegExp(`\\b${ZAHLWORT}\\s+(?:gibt|geben|Bewertung|Bewertungen|Stimme|Stimmen)\\b`, 'i'),
  /\balle\s+bis\s+auf\b/i,
  /\bbasierend\s+auf\b/i,
  // Verteilungszeile „5 Sterne: 26"
  /Sterne?\s*:\s*\d/,
];
const ZAHLEN_DES_PROFILS = [ZAHL.alle, ZAHL.voll, ZAHL.vier].filter((n) => n > 1);

test('kein sichtbarer Satz nennt eine Anzahl von Trustpilot-Bewertungen', () => {
  for (const satz of SICHTBAR) {
    for (const m of ANZAHL) assert.ok(!m.test(satz), `Anzahl (${m}) in: ${satz}`);
    for (const n of ZAHLEN_DES_PROFILS) {
      assert.ok(!new RegExp(`\\b${n}\\b`).test(satz), `Profilzahl ${n} in: ${satz}`);
    }
  }
});

test('auch das FAQPage-Schema nennt keine Anzahl', () => {
  const schema = JSON.stringify(buildFaqPageJsonLd(FRAGEN, {inLanguage: 'de-DE'}));
  for (const m of ANZAHL) assert.ok(!m.test(schema), `Anzahl (${m}) im Schema`);
  for (const n of ZAHLEN_DES_PROFILS) {
    assert.ok(!new RegExp(`\\b${n}\\b`).test(schema), `Profilzahl ${n} im Schema`);
  }
});

test('Route und Komponente geben keine Zählung aus', () => {
  // Titel und Beschreibung stehen in der Route; sie importiert ZAHL gar nicht
  // erst. Die Komponente rendert keine Verteilung und keine Zahl im Linktext.
  assert.ok(!/\bZAHL\b/.test(ROUTE), 'die Route liest ZAHL');
  assert.ok(!/ZAHL\.(?:alle|voll|vier)/.test(KOMPONENTE), 'die Komponente gibt eine Anzahl aus');
  assert.ok(!/VERTEILUNG|tpt__verteilung|\.anzahl\b/.test(KOMPONENTE), 'Verteilung gerendert');
  for (const name of ['TITEL', 'BESCHREIBUNG']) {
    const m = ROUTE.match(new RegExp(`const ${name} =([\\s\\S]*?);`));
    assert.ok(m, `${name} fehlt in der Route`);
    const rest = m[1].replace(/\$\{(?:PROFIL\.trustscore|UNTER_VIER_KURZ)\}/g, '');
    assert.ok(!/\$\{/.test(rest), `${name} setzt etwas anderes ein als TrustScore und Satzglied`);
    for (const a of ANZAHL) assert.ok(!a.test(m[1]), `Anzahl (${a}) in ${name}`);
  }
});

test('was bleibt: TrustScore mit Stand, keine unter vier Sternen, ohne Einladung', () => {
  // Die Stand-Wache (seo-manager/pruefungen/probe_trustpilot_stand_auf_der_seite.py)
  // liest den TrustScore aus genau dieser Wendung.
  assert.match(KOPF.lead, new RegExp(`TrustScore von ${PROFIL.trustscore} von 5`));
  assert.match(KOPF.lead, /ohne Einladung/);
  assert.match(KOPF.lead, /nicht beansprucht/);
  assert.match(KOPF.quelle, /Stand: /);
  assert.match(ROUTE, /\$\{PROFIL\.trustscore\}/);
});

test('die Zählung im Datenmodul ist die Summe der Sterne', () => {
  const s = PROFIL.sterne;
  assert.equal(ZAHL.alle, s[5] + s[4] + s[3] + s[2] + s[1]);
});

test('die Verteilung passt zu den Prozentwerten, die Trustpilot zeigt', () => {
  // Trustpilot zeigte am Stand 96 % / 4 % / 0 / 0 / 0. Gerundet muss die
  // Verteilung genau das ergeben, sonst ist sie falsch abgeschrieben.
  const pct = (n) => Math.round((100 * PROFIL.sterne[n]) / ZAHL.alle);
  assert.deepEqual([5, 4, 3, 2, 1].map(pct), [96, 4, 0, 0, 0]);
});

test('der Satz "keine unter vier Sternen" ist an die Daten gebunden', () => {
  // Wer die Verteilung ändert, bekommt den anderen Zweig des Satzes von selbst.
  assert.equal(ZAHL.unterVier, 0);
  assert.equal(PROFIL_ABSCHNITT.einleitung, 'Die meisten Bewertungen geben fünf Sterne.');
  assert.match(KOPF.lead, /Keine Bewertung liegt unter vier Sternen/);
  const schlechte = FRAGEN.find((f) => f.id === 'schlechte');
  assert.match(schlechte.a, /^Nein\./);
});

test('die Studienzahl deckt sich mit der Studie e0004', () => {
  const e0004 = JSON.parse(lies('../app/data/studien/e0004.json'));
  assert.equal(parseInt(e0004.eckdaten.material, 10), BERICHTE_STUDIE);
});

test('Stand ist ein Datum und steht sichtbar in der Quellenzeile', () => {
  assert.match(STAND, /^\d{4}-\d{2}-\d{2}$/);
  assert.match(KOPF.quelle, /Stand: \d{1,2}\. \S+ \d{4}/);
  assert.match(KOMPONENTE, /KOPF\.quelle/);
});

// ---------------------------------------------------------------------------
// Das Profil ist nicht unseres, und Dritte werden nicht vorgeführt.
// ---------------------------------------------------------------------------

test('das Profil wird als Quelle verlinkt, nicht als eigenes Profil geführt', () => {
  assert.equal(PROFIL.beansprucht, false);
  assert.match(PROFIL.url, /^https:\/\/de\.trustpilot\.com\/review\/qiblanco\.com$/);
  // nofollow am Trustpilot-Link, und keine Aufnahme in MARKEN_PROFILE (sameAs):
  // eine Zugehörigkeit zu behaupten wäre ohne Beanspruchung unbelegt.
  assert.match(KOMPONENTE, /href=\{PROFIL\.url\}[\s\S]{0,80}rel="noopener noreferrer nofollow"/);
  assert.ok(!MARKEN_PROFILE.some((p) => /trustpilot/i.test(p.url)));
});

test('kein Name und kein Bewertungsdatum im Datenmodul', () => {
  // Namen sind Daten Dritter; Einzeldaten kamen in der Nachlese widersprüchlich
  // an. Die Seite nennt deshalb nur Summe und Stand.
  for (const muster of [/Morgenstern/, /Goldmann/, /Vecchione/]) {
    assert.ok(!muster.test(DATEN), `im Datenmodul: ${muster}`);
  }
  // Jahreszahlen nur im Stand: die Studie (2024) steht in STIMMEN, nicht hier.
  const ueberTrustpilot = JSON.stringify([KOPF, PROFIL_ABSCHNITT, FREMD, FRAGEN]);
  assert.ok(!/\b20(23|24|25)\b/.test(ueberTrustpilot), 'Einzeldatum im Text');
});

test('die fremden Profile werden benannt, nicht benotet', () => {
  assert.match(FREMD.text, /BLANCO/);
  assert.ok(!/\d,\d/.test(FREMD.text), 'Note eines fremden Unternehmens im Text');
  assert.ok(!/von 5/.test(FREMD.text));
});

// ---------------------------------------------------------------------------
// Design-Tokens: keine freien Werte ausserhalb :root, EIN Akzent.
// ---------------------------------------------------------------------------

test('die CSS erfindet ausserhalb :root keine Farbe', () => {
  const rumpf = CSS.slice(CSS.indexOf('}', CSS.indexOf(':root')) + 1);
  assert.ok(!/#[0-9a-f]{3,8}\b/i.test(rumpf), 'Farb-Literal im Rumpf');
  assert.ok(!/rgba?\(/i.test(rumpf), 'rgb()-Literal im Rumpf');
});

test('der Scope ist .tpt und fremde Scopes fehlen', () => {
  assert.ok(!/\.rdt\b/.test(CSS));
  assert.ok(!/\.nog\b/.test(CSS));
  assert.match(KOMPONENTE, /className="tpt"/);
});
