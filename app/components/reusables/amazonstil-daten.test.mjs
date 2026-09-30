/*
 * Hermetischer Wächter für amazonstil-daten.js (Amazon-Stil Stufe 2, s04).
 * Aufruf: node --test app/components/reusables/amazonstil-daten.test.mjs
 * Liegt neben der Datei, weil die Deploy-Allowlist test/ nur namentlich
 * freigibt. Bewacht: Auswahl der Kundenfragen und EIN FAQPage-Schema, Preis
 * wie die Kaufbox, Rückweg über beide Schalter, Bestand (Fragen, Studien),
 * keine gesperrten Wörter.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  KUNDENFRAGEN,
  SORTENVERGLEICH,
  VERGLEICH,
  amazonstilAn,
  berichtQuelle,
  ladeSortenPreise,
  ladeVergleichsPreise,
  preisAnzeige,
  ratenAnzeige,
  sortenAn,
  sortenSpalten,
  sortenStilAn,
  teileFragen,
  vergleichAn,
  vergleichSpalten,
} from './amazonstil-daten.js';
import {FAQ_CACAO, FAQ_QIBRACELET, FAQ_QIHOME_AIR, FAQ_QIONE_2_PRO} from '../../data/product-faqs.js';
import {faqPageJsonLdString, isSchemaSafe} from '../../lib/faq-schema.js';

const HIER = dirname(fileURLToPath(import.meta.url));
const APP = join(HIER, '..', '..');
const SEITEN = {
  'qione-2-pro': FAQ_QIONE_2_PRO,
  qibracelet: FAQ_QIBRACELET,
  'qihome-air': FAQ_QIHOME_AIR,
};

test('Kundenfragen: oben mindestens 3, alle sauber, unten keine saubere, nichts doppelt, nichts verloren', () => {
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {oben, unten} = teileFragen(handle, items);
    assert.ok(oben.length >= 3, `${handle}: nur ${oben.length} Fragen oben`);
    assert.ok(oben.every((it) => isSchemaSafe(it)), `${handle}: ungeprüfte Antwort oben`);
    assert.ok(unten.every((it) => !isSchemaSafe(it)), `${handle}: saubere Frage unten geblieben`);
    assert.equal(oben.length + unten.length, items.length, `${handle}: Frage verloren oder doppelt`);
    for (const it of items) {
      assert.equal(Number(oben.includes(it)) + Number(unten.includes(it)), 1, `${handle}: ${it.q}`);
    }
  }
});

test('Kundenfragen: Reihenfolge nach dem Zähler (Tragen, Sauna, Preis/Raten, Material)', () => {
  assert.deepEqual(teileFragen('qione-2-pro', FAQ_QIONE_2_PRO).oben.map((it) => it.q), [
    'Kann ich den QiOne® an einer anderen Kette tragen?',
    'Darf der QiOne® in die Sauna bzw. nass werden?',
    'Wie funktioniert die Finanzierung über Klarna?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
  ]);
  assert.deepEqual(teileFragen('qibracelet', FAQ_QIBRACELET).oben.map((it) => it.q), [
    'Darf das QiBracelet® nass werden, bzw. in die Sauna?',
    'Wie funktioniert die Finanzierung über Klarna?',
    'Ist das QiBracelet® sicher für Anwender mit Allergien?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
  ]);
  assert.deepEqual(teileFragen('qihome-air', FAQ_QIHOME_AIR).oben.map((it) => it.q), [
    'Wie funktioniert die Finanzierung über Klarna?',
    'Aus welchem Material bestehen die Qi Blanco® Produkte?',
    'Kann ich mit dem QiHome® Air reisen?',
  ]);
});

test('Schema: genau ein FAQPage je Seite, byte-gleich zum Stand vor s04', () => {
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {unten} = teileFragen(handle, items);
    // Vorher gab ProductFAQ faqPageJsonLdString(items) aus. Jetzt gibt der
    // Block oben GENAU diesen Aufruf aus (AmazonStil.jsx, Kundenfragen),
    // die FAQ unten bekommt `unten` und darf nichts mehr ausgeben.
    assert.equal(faqPageJsonLdString(unten), null, `${handle}: FAQ unten gäbe ein zweites FAQPage aus`);
    assert.notEqual(faqPageJsonLdString(items), null, `${handle}: kein Schema mehr`);
  }
  const quelle = readFileSync(join(HIER, 'AmazonStil.jsx'), 'utf8');
  assert.match(quelle, /faqPageJsonLdString\(alle\)/, 'Kundenfragen gibt das Schema nicht über die VOLLE Liste aus');
});

test('Rückweg Schalter Kundenfragen: seiten=[] -> oben leer, unten DIESELBE Liste', () => {
  const aus = {...KUNDENFRAGEN, seiten: []};
  for (const [handle, items] of Object.entries(SEITEN)) {
    const {oben, unten} = teileFragen(handle, items, aus);
    assert.equal(oben.length, 0);
    assert.equal(unten, items, `${handle}: unten ist nicht dasselbe Array (Seite nicht byte-gleich)`);
  }
});

test('Rückweg Schalter Vergleich: produkte=[] -> keine Spalten, keine Abfrage, kein Stylesheet', async () => {
  const aus = {...VERGLEICH, produkte: []};
  assert.equal(vergleichAn(aus), false);
  assert.deepEqual(vergleichSpalten('qione-2-pro', {}, aus), []);
  let gefragt = false;
  const storefront = {query: async () => { gefragt = true; return {}; }, CacheShort: () => ({})};
  assert.equal(await ladeVergleichsPreise(storefront, aus), null);
  assert.equal(gefragt, false, 'Loader fragt trotz Schalter aus');
  for (const handle of Object.keys(SEITEN)) {
    assert.equal(amazonstilAn(handle, aus, {...KUNDENFRAGEN, seiten: []}), false);
    assert.equal(amazonstilAn(handle), true);
  }
});

test('Preis: dieselbe Rechnung wie die Kaufbox (ProductPrice), Raten wie KaufZusage', () => {
  // QiOne 2 Pro netto 913,45 -> Kaufbox "1.087,- €" (Kopf von markt-pricing.js).
  const qione = {amount: '913.45', currencyCode: 'EUR'};
  assert.equal(preisAnzeige(qione, 'qione-2-pro', 'DE'), '1.087,- €');
  assert.equal(ratenAnzeige(qione, 'qione-2-pro', 'DE'), '12 Raten à 91 €²');
  assert.equal(ratenAnzeige(qione, 'qione-2-pro', 'AT'), null, 'Raten nur im Markt DE');
  assert.equal(preisAnzeige({amount: '1383.0', currencyCode: 'USD'}, 'qione-2-pro', 'US'), '$1,383');
  assert.equal(preisAnzeige(null, 'qione-2-pro', 'DE'), null);
});

test('Spalten: eigenes Gerät zuerst, eigener Preis aus der Kaufbox, Name/Bild aus PRODUKT_TRIO', () => {
  const preise = {
    'qione-2-pro': {amount: '913.45', currencyCode: 'EUR'},
    qibracelet: {amount: '1326.05', currencyCode: 'EUR'},
    'qihome-air': {amount: '4187.39', currencyCode: 'EUR'},
  };
  const s = vergleichSpalten('qibracelet', {preise, eigenerPreis: {amount: '1000', currencyCode: 'EUR'}, land: 'DE'});
  assert.deepEqual(s.map((x) => x.handle), ['qibracelet', 'qione-2-pro', 'qihome-air']);
  assert.equal(s[0].eigenes, true);
  assert.equal(s[0].preis, '1.190,- €', 'eigenes Gerät nimmt den Kaufbox-Preis');
  assert.equal(s[1].preis, '1.087,- €');
  for (const x of s) {
    assert.ok(x.name && x.bild && x.alt, `${x.handle}: Name/Bild fehlt`);
  }
});

test('Loader: fail-soft bei Ausfall der Abfrage, Preise je Handle bei Erfolg', async () => {
  const kaputt = {query: async () => { throw new Error('netz'); }, CacheShort: () => ({})};
  const alt = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await ladeVergleichsPreise(kaputt), {});
  } finally {
    console.error = alt;
  }
  const money = (a) => ({selectedOrFirstAvailableVariant: {price: {amount: a, currencyCode: 'EUR'}}});
  const gut = {
    query: async () => ({
      qione: {handle: 'qione-2-pro', ...money('913.45')},
      bracelet: {handle: 'qibracelet', ...money('1326.05')},
      qihome: {handle: 'qihome-air', ...money('4187.39')},
    }),
    CacheShort: () => ({}),
  };
  const p = await ladeVergleichsPreise(gut);
  assert.deepEqual(Object.keys(p).sort(), ['qibracelet', 'qihome-air', 'qione-2-pro']);
});

test('Bestand: jede Frage der Rangliste steht wörtlich in product-faqs.js', () => {
  const alle = new Set([...FAQ_QIONE_2_PRO, ...FAQ_QIBRACELET, ...FAQ_QIHOME_AIR, ...FAQ_CACAO].map((it) => it.q));
  for (const t of KUNDENFRAGEN.rang) {
    for (const q of t.fragen) assert.ok(alle.has(q), `Frage nicht (mehr) im Bestand: ${q}`);
  }
});

test('Bestand: jede Studie des Vergleichs hat ihre Datei und ihre Seite', () => {
  const dir = join(APP, 'data', 'studien');
  const slugs = new Set(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).slug),
  );
  for (const g of VERGLEICH.produkte) {
    assert.ok(g.studien.length >= 1, `${g.handle}: keine Studie`);
    for (const st of g.studien) {
      const slug = st.href.replace('/pages/', '');
      assert.ok(slugs.has(slug), `${g.handle}: Studie ${slug} nicht in data/studien`);
      assert.ok(existsSync(join(APP, 'routes', `pages.${slug}.jsx`)), `${g.handle}: Route pages.${slug} fehlt`);
    }
  }
});

test('Wortlaut: keine gesperrten Angaben im Vergleich (300 m², Stärke-Rangfolge, kohärent)', () => {
  const texte = [
    VERGLEICH.titel,
    ...Object.values(VERGLEICH.zeilen),
    ...VERGLEICH.produkte.flatMap((g) => [g.einsatz, g.material, g.wasser, ...g.studien.map((s) => s.text)]),
    KUNDENFRAGEN.titel,
  ].join('\n');
  assert.doesNotMatch(texte, /m²|m2\b|quadratmeter/i, 'Fläche in m² ist gesperrt (GL-SPR-0007)');
  assert.doesNotMatch(texte, /stärker|stärkste|besser als/i, 'kein Stärke-Vergleich');
  assert.doesNotMatch(texte, /koh(ä|ae)rent/i, 'Kanon: nicht mit "kohärent" einsteigen');
});

/* ---- Sortenvergleich Crystal Cacao® (s03, 30.09.2026) --------------------- */

const KAKAO = ['crystal-cacao-awake', 'crystal-cacao-create'];
const KAKAO_AUS = {...KUNDENFRAGEN, seiten: KUNDENFRAGEN.seiten.filter((h) => !KAKAO.includes(h))};
const SORTEN_AUS = {...SORTENVERGLEICH, sorten: []};
const ROUTE = (h) => readFileSync(join(APP, 'routes', `products.${h}.jsx`), 'utf8');
const SEITE = (k) => readFileSync(join(APP, 'components', 'product-pages', `${k}.jsx`), 'utf8');
// Quellen ausserhalb dieses Repos (Server). Fehlen sie (CI), wird der Arm
// übersprungen, nicht grün gerechnet.
const SERVER = '/srv/openclaw/shared-state';
const ausserhalb = (pfad) => (existsSync(pfad) ? readFileSync(pfad, 'utf8') : null);

test('Kakao Kundenfragen: Zubereitung, Für wen, Wie oft, Psychoaktiv oben, die drei geflaggten unten', () => {
  for (const h of KAKAO) {
    const {oben, unten} = teileFragen(h, FAQ_CACAO);
    assert.deepEqual(oben.map((it) => it.q), [
      'Wie wird zeremonieller Kakao zubereitet?',
      'Für wen ist Kakao (un)geeignet?',
      'Wie oft darf man zeremoniellen Kakao trinken?',
      'Was bedeutet psychoaktiv in diesem Zusammenhang?',
    ]);
    assert.ok(unten.length === 3 && unten.every((it) => it.flag), `${h}: unten nicht genau die geflaggten`);
    assert.equal(faqPageJsonLdString(unten), null, `${h}: FAQ unten gäbe ein zweites FAQPage aus`);
    assert.notEqual(faqPageJsonLdString(FAQ_CACAO), null);
  }
});

test('Kakao Rückweg: beide Schalter aus -> kein Vergleich, keine Abfrage, kein Stylesheet, FAQ unten DIESELBE Liste', async () => {
  assert.equal(sortenAn(SORTEN_AUS), false);
  assert.deepEqual(sortenSpalten('crystal-cacao-awake', {}, SORTEN_AUS), []);
  let gefragt = false;
  const storefront = {query: async () => { gefragt = true; return {}; }, CacheShort: () => ({})};
  assert.equal(await ladeSortenPreise(storefront, SORTEN_AUS), null);
  assert.equal(gefragt, false, 'Loader fragt trotz Schalter aus');
  for (const h of KAKAO) {
    const {oben, unten} = teileFragen(h, FAQ_CACAO, KAKAO_AUS);
    assert.equal(oben.length, 0);
    assert.equal(unten, FAQ_CACAO, `${h}: unten ist nicht dasselbe Array (Seite nicht byte-gleich)`);
    assert.equal(sortenStilAn(h, SORTEN_AUS, KAKAO_AUS), false, `${h}: Stylesheet trotz Schalter aus`);
    assert.equal(sortenStilAn(h), true);
  }
  // Geräteseiten bleiben vom Kakao-Schalter unberührt und umgekehrt.
  assert.equal(amazonstilAn('qione-2-pro', VERGLEICH, KAKAO_AUS), true);
  // Ohne Prop bleibt die Seitenkomponente wie vorher (volle FAQ).
  for (const k of ['Awake', 'Create']) {
    assert.match(SEITE(k), /\{faqItems = FAQ_CACAO\} = \{\}/, `${k}: Default ist nicht die volle Liste`);
  }
});

test('Kakao Spalten: eigene Sorte zuerst, eigene Variante aus der Kaufbox, andere aus dem Loader', () => {
  const v = (a) => ({price: {amount: a, currencyCode: 'EUR'}});
  const s = sortenSpalten('crystal-cacao-create', {varianten: {'crystal-cacao-awake': v('71.03'), 'crystal-cacao-create': v('1')}, eigeneVariante: v('71.03')});
  assert.deepEqual(s.map((x) => x.handle), ['crystal-cacao-create', 'crystal-cacao-awake']);
  assert.equal(s[0].eigenes, true);
  assert.equal(s[0].variante.price.amount, '71.03', 'eigene Sorte nimmt die Kaufbox-Variante');
  assert.equal(s[1].variante.price.amount, '71.03');
  assert.equal(sortenSpalten('crystal-cacao-awake', {})[1].variante, null, 'ohne Preis: null, Komponente zeigt "–"');
});

test('Kakao Preis: Komponente rechnet mit der Funktion der Kaufbox (cacaoPricing, EINE Packung)', () => {
  const quelle = readFileSync(join(HIER, 'AmazonStil.jsx'), 'utf8');
  assert.match(quelle, /import \{cacaoPricing\} from '~\/components\/CacaoProductForm'/);
  assert.match(quelle, /cacaoPricing\('1', s\.variante, s\.handle, land\)\.price/);
  assert.match(readFileSync(join(APP, 'components', 'CacaoPriceDisplay.jsx'), 'utf8'), /cacaoPricing\(quantity, selectedVariant, handle, marktLand\)/,
    'Kaufbox rechnet nicht mehr mit cacaoPricing: Vergleich und Kaufbox könnten auseinanderlaufen');
});

test('Kakao Loader: fail-soft bei Ausfall, Varianten je Handle bei Erfolg', async () => {
  const alt = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await ladeSortenPreise({query: async () => { throw new Error('netz'); }, CacheShort: () => ({})}), {});
  } finally {
    console.error = alt;
  }
  const v = {selectedOrFirstAvailableVariant: {price: {amount: '71.03', currencyCode: 'EUR'}}};
  const p = await ladeSortenPreise({
    query: async () => ({awake: {handle: 'crystal-cacao-awake', ...v}, create: {handle: 'crystal-cacao-create', ...v}}),
    CacheShort: () => ({}),
  });
  assert.deepEqual(Object.keys(p).sort(), KAKAO);
});

test('Kakao Messanker und Einbau: Anker laut ANKER-VERTRAG, Einbau direkt nach den Instagram-Stimmen', () => {
  const quelle = readFileSync(join(HIER, 'AmazonStil.jsx'), 'utf8');
  for (const anker of ['data-qb-sortenvergleich', 'data-qb-vergleich-produkt', 'data-qb-vergleich-preis', 'data-qb-sorten-liste', 'data-qb-analysebericht']) {
    assert.ok(quelle.includes(anker), `Anker fehlt: ${anker}`);
  }
  for (const [h, k] of [['crystal-cacao-awake', 'Awake'], ['crystal-cacao-create', 'Create']]) {
    const r = ROUTE(h);
    const folge = ['<IgTestimonialSlideshow produkt="Kakao" />', '<Sortenvergleich', `<Kundenfragen handle="${h}"`, `<${k} faqItems={fragen.unten} />`]
      .map((m) => r.indexOf(m));
    assert.ok(folge.every((i) => i > 0), `${h}: Baustein fehlt (${folge})`);
    assert.deepEqual([...folge].sort((a, b) => a - b), folge, `${h}: Reihenfolge falsch`);
    assert.match(r, new RegExp(`teileFragen\\('${h}', FAQ_CACAO\\)`));
    assert.match(r, new RegExp(`sortenStilAn\\('${h}'\\)`));
  }
});

test('Kakao Fundstellen: Wofür, Profil, Bio stehen so im Bestand dieser Seiten', () => {
  const [awake, create] = SORTENVERGLEICH.sorten;
  assert.equal(awake.handle, 'crystal-cacao-awake');
  assert.ok(ROUTE('crystal-cacao-awake').includes(`>${awake.wofuer[0]}<`), 'Awake-Claim nicht die Überschrift der Seite');
  assert.ok(ROUTE('crystal-cacao-create').includes(`>${create.wofuer[0]}<`), 'Create-Claim nicht die Überschrift der Seite');
  assert.ok(SEITE('Awake').includes('Theobromin: 950 mg / 100g') && awake.profil.includes('Theobromin 950 mg'));
  assert.ok(SEITE('Create').includes('Theobromin: 1.050 mg / 100g & Koffein: 140 mg / 100g'));
  assert.ok(create.profil.includes('Theobromin 1.050 mg') && create.profil.includes('Koffein 140 mg'));
  assert.ok(SEITE('Awake').includes('Piura-Tals im Norden Perus') && awake.bohne.includes('Piura'));
  assert.ok(SEITE('Create').includes('Departamento Amazonas') && create.bohne.includes('Departamento Amazonas'));
  for (const h of KAKAO) assert.ok(ROUTE(h).includes('Bio-zertifiziert nach DE-ÖKO-006'));
  for (const s of SORTENVERGLEICH.sorten) assert.equal(s.bio, 'Bio-zertifiziert nach DE-ÖKO-006');
});

test('Kakao Fundstellen (Server): Wofür wörtlich aus sorten-profil.js, Koffein Awake aus dem Verkaufs-Chat', (t) => {
  const profil = ausserhalb(`${SERVER}/crystal-cacao-node/repo/app/lib/sorten-profil.js`);
  const wissen = ausserhalb(`${SERVER}/qi-salesbot/data/seeds/qiblanco-knowledge.json`);
  if (!profil || !wissen) return t.skip('Serverquellen nicht erreichbar (CI)');
  const flach = profil.replace(/'\s*\+\s*'/g, '');
  for (const s of SORTENVERGLEICH.sorten) {
    for (const zeile of s.wofuer) assert.ok(flach.includes(`'${zeile}'`), `nicht wörtlich in sorten-profil.js: ${zeile}`);
  }
  assert.ok(wissen.includes('Theobromin 950 mg, Koffein 120 mg'), 'Awake-Koffein 120 mg nicht (mehr) im Bestand');
});

test('Kakao Analyseberichte: je Sorte drei, Adresse/Labor/Datum wie der Zeugnis-Vertrag', (t) => {
  for (const s of SORTENVERGLEICH.sorten) {
    assert.deepEqual(s.berichte.map((b) => b.art), ['Schadstoff-Prüfzeugnis', 'Nährstoff-Analyse', 'Mineralstoff-Analyse']);
    for (const b of s.berichte) {
      assert.match(b.url, /^https:\/\/cdn\.shopify\.com\/s\/files\/1\/0279\/3095\/1750\/files\/[a-z0-9-]+\.pdf\?v=\d+$/);
      assert.ok(berichtQuelle(b).startsWith(`${b.labor}, ${b.datum}, PDF `));
    }
  }
  const vertrag = ausserhalb(`${SERVER}/qi-salesbot/data/zeugnis-vertrag.json`);
  if (!vertrag) return t.skip('Zeugnis-Vertrag nicht erreichbar (CI)');
  const dok = JSON.parse(vertrag).dokumente;
  const datum = (iso) => iso.split('-').reverse().join('.');
  for (const s of SORTENVERGLEICH.sorten) {
    const soll = dok.filter((d) => d.produkt_keys.includes(s.handle));
    assert.equal(soll.length, 3, `${s.handle}: Vertrag nennt ${soll.length} Dokumente`);
    for (const b of s.berichte) {
      const d = soll.find((x) => x.url === b.url);
      assert.ok(d, `${s.handle}: Adresse nicht im Vertrag: ${b.url}`);
      assert.equal(datum(d.geprueft_am), b.datum, `${s.handle}: Datum`);
      assert.equal(d.sprache, b.sprache, `${s.handle}: Sprache`);
      assert.ok(d.titel.startsWith(`${b.art} · `), `${s.handle}: Art ${b.art} gegen ${d.titel}`);
      for (const teil of b.labor.split(' und ')) assert.ok(d.labor.includes(teil), `${s.handle}: Labor ${teil}`);
    }
  }
});

test('Kakao Wortlaut: Analyseberichte statt Studien, kein "kohärent", nichts in m²', () => {
  const texte = [
    SORTENVERGLEICH.titel,
    ...Object.values(SORTENVERGLEICH.zeilen),
    ...SORTENVERGLEICH.sorten.flatMap((s) => [s.name, ...s.wofuer, s.bohne, s.profil, s.bio, ...s.berichte.map((b) => `${b.art} ${berichtQuelle(b)}`)]),
  ].join('\n');
  assert.doesNotMatch(texte, /studie/i, 'Christian: nicht die Studien, sondern die Analyseberichte');
  assert.doesNotMatch(texte, /koh(ä|ae)rent/i);
  assert.doesNotMatch(texte, /stärker|stärkste|besser als/i, 'kein Stärke-Vergleich');
});
