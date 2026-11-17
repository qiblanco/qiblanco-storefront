// BELEGTREUE der nachprüfbaren Tatsachen (app/data/kauf-tatsachen.js):
// jede Zahl, die eine Angabe nennt, steht auch an der Stelle, die ihre
// Quellzeile zitiert.
//
// ANLASS (s03 des Grossjobs seo-2026-w43-l26-neu-oder-gebraucht-26c6,
// 2026-11-17): auf /pages/neu-oder-gebraucht stand seit #414 unter „20 Tage"
// die Quelle „AGB, § 7 Widerrufsrecht". § 7 nennt vierzehn Tage, die 20 stehen
// im Abschnitt „Freiwillige 20-Tage-Zufriedenheitsgarantie". Und unter
// „100 % Geld-zurück-Garantie" stand „auf jeder Seite in der Kopfleiste"; die
// Kopfleiste nennt keine Garantie. Die bestehende Prüfung („jede Frist trägt
// einen Beleg", test/neu-oder-gebraucht.test.mjs) sah nur, DASS eine Quelle
// dasteht, nie, ob sie die Zahl trägt. Diese Datei schließt die Klasse.
//
// WIE: die Quellen, die im Repo liegen, werden aus ihrem Quelltext gelesen
//  - /pages/agb      -> app/routes/pages.agb.jsx, je <h2>-Abschnitt. Zitiert
//                       ist ein Abschnitt, wenn die Quellzeile sein „§ N"
//                       oder das letzte Wort seiner Überschrift nennt.
//  - /pages/faq      -> die Antworten der FAQ (FAQ_ALLE).
//  - Richtlinie (EU) 2025/1960 ohne Pfad -> app/lib/eu-gewaehrleistungslabel.js
//    (der Gewährleistungshinweis, aus dem der Wortlaut stammt).
// Was nicht im Repo liegt (die Shopify-Versandrichtlinie), steht namentlich
// in EXTERN; eine NEUE nicht prüfbare Quelle mit Zahl macht diesen Test rot,
// statt still durchzugehen.
//
// Zahlwörter („vierzehn", „zwei") gelten wie Ziffern, „100 %" wie „voll"
// (die AGB sagen „volle Geld-zurück-Garantie").
//
// Ausführen: node --test test/kauf-tatsachen-belegtreue.test.mjs
// Rot-vor-Grün: BELEGTREUE_MUTANTE=alt-beleg setzt die alten Quellzeilen ein
// und muss rot werden (gemessen beim Bau, Beleg im RESULT des Jobs).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  FRAGEN,
  FRAGE_GEBRAUCHT,
  FRISTEN,
  VORTEILE,
  IM_PREIS,
} from '../app/data/kauf-tatsachen.js';
import {FAQ_ALLE} from '../app/data/faq-seite.js';

const lies = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

const ZAHLWORT = [
  ['vierzehn', '14'],
  ['zwanzig', '20'],
  ['zwölf', '12'],
  ['zehn', '10'],
  ['zwei', '2'],
  ['drei', '3'],
  ['vier', '4'],
  ['sechs', '6'],
  ['sieben', '7'],
];

/** Text ohne Auszeichnung, Zahlwörter als Ziffern, Tausenderpunkt weg. */
export function normiere(t) {
  let s = String(t)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{' '\}/g, ' ')
    .replace(/&nbsp;| /g, ' ')
    .toLowerCase();
  for (const [wort, ziffer] of ZAHLWORT) {
    // Als Wortanfang: „vierzehntägiges", „zweijährige", „zwei Jahre".
    s = s.replace(new RegExp(`(^|[^a-zäöüß])${wort}`, 'g'), `$1 ${ziffer} `);
  }
  return s.replace(/(\d)\.(\d{3})\b/g, '$1$2');
}

/** Die Zahlen einer Angabe; „100 %" als eigenes Merkmal. */
export function zahlen(t) {
  const s = normiere(t);
  const out = new Set();
  for (const m of s.matchAll(/(?<![\d/])(\d+)(?![\d/])(\s*%)?/g)) {
    out.add(m[2] ? `${m[1]} %` : m[1]);
  }
  return [...out];
}

/** Steht die Zahl im Quelltext? Ganze Zahl, nie als Teil von 2025. */
export function stehtIn(zahl, quelle) {
  const s = normiere(quelle);
  if (zahl === '100 %') return /100\s*%/.test(s) || /(^|[^a-zäöüß])voll/.test(s);
  const roh = zahl.replace(' %', '');
  return new RegExp(`(?<![\\d/])${roh}(?![\\d/])`).test(s);
}

/** pages.agb.jsx in Abschnitte je <h2>. */
export function agbAbschnitte(quelle) {
  const teile = quelle.split(/<h2>/).slice(1);
  return teile.map((t) => {
    const ende = t.indexOf('</h2>');
    const titel = t.slice(0, ende).replace(/\s+/g, ' ').trim();
    const ohneKlammer = titel.replace(/\s*\(.*\)\s*$/, '');
    const paragraf = (ohneKlammer.match(/^§\s*(\d+)/) || [])[1] || null;
    const letztesWort = ohneKlammer.split(' ').pop();
    return {titel, paragraf, letztesWort, text: t.slice(ende + 5)};
  });
}

const GANZES_WORT = (w) =>
  new RegExp(`(^|[^\\wäöüßÄÖÜ-])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\wäöüßÄÖÜ-])`);

/** Welche AGB-Abschnitte nennt diese Quellzeile? */
export function zitierteAbschnitte(beleg, abschnitte) {
  return abschnitte.filter(
    (a) =>
      (a.paragraf && new RegExp(`§\\s*${a.paragraf}(?!\\d)`).test(beleg)) ||
      GANZES_WORT(a.letztesWort).test(beleg),
  );
}

// Nicht im Repo, mit Grund. Eine Quelle MIT Zahl, die weder hier noch in den
// Lesern unten steht, ist ein Befund.
export const EXTERN = {
  '/policies/shipping-policy':
    'Shopify-Versandrichtlinie, gepflegt im Shopify-Admin, nicht im Repo',
};

const ALTE_BELEGE = {
  ruecknahme: ['unsere eigene Zusage, auf jeder Seite in der Kopfleiste', null],
  widerruf: ['AGB, § 7 Widerrufsrecht', '/pages/agb'],
};

/** Alle Angaben mit Beleg, flach: {wo, id, behauptung, beleg, belegPfad}. */
export function angaben() {
  const mutante = process.env.BELEGTREUE_MUTANTE === 'alt-beleg';
  const fristBeleg = (id) => {
    const f = FRISTEN.find((x) => x.id === id);
    return mutante && ALTE_BELEGE[id]
      ? {beleg: ALTE_BELEGE[id][0], belegPfad: ALTE_BELEGE[id][1]}
      : {beleg: f.beleg, belegPfad: f.belegPfad};
  };
  // Die Mutante tauscht die Belege so, wie die Seite sie vor s03 zeigte
  // (VORTEILE/FRAGEN erben aus FRISTEN; f-frist erbte den Widerruf).
  const erbe = {
    'FRISTEN:ruecknahme': 'ruecknahme',
    'FRISTEN:widerruf': 'widerruf',
    'VORTEILE:ruecknahme': 'widerruf',
    'VORTEILE:garantie': 'ruecknahme',
    'FRAGEN:f-frist': 'widerruf',
  };
  const liste = [];
  const nimm = (wo, e) => {
    if (!e.beleg) return;
    const behauptung = [e.titel, e.text, e.q, e.a].filter(Boolean).join(' ');
    let {beleg, belegPfad} = e;
    if (mutante && erbe[`${wo}:${e.id}`]) ({beleg, belegPfad} = fristBeleg(erbe[`${wo}:${e.id}`]));
    liste.push({wo, id: e.id, behauptung, beleg, belegPfad});
  };
  for (const f of FRISTEN) nimm('FRISTEN', f);
  for (const v of VORTEILE) nimm('VORTEILE', v);
  for (const f of FRAGEN) nimm('FRAGEN', f);
  nimm('FRAGE_GEBRAUCHT', FRAGE_GEBRAUCHT);
  for (const p of IM_PREIS) nimm('IM_PREIS', p);
  return liste;
}

const AGB = agbAbschnitte(lies('../app/routes/pages.agb.jsx'));
const FAQ_TEXT = FAQ_ALLE.map((f) => `${f.q} ${f.a}`).join('\n');
const EU_HINWEIS = lies('../app/lib/eu-gewaehrleistungslabel.js');

/** Der Quelltext, den eine Quellzeile zitiert, oder null (nicht prüfbar). */
function quelleVon(a) {
  if (a.belegPfad === '/pages/agb') {
    const z = zitierteAbschnitte(a.beleg, AGB);
    return {art: 'agb', abschnitte: z.map((x) => x.titel), text: z.map((x) => x.text).join('\n')};
  }
  if (a.belegPfad === '/pages/faq') return {art: 'faq', abschnitte: ['FAQ'], text: FAQ_TEXT};
  if (a.belegPfad === null && /2025\/1960/.test(a.beleg)) {
    return {art: 'eu', abschnitte: ['Gewährleistungshinweis'], text: EU_HINWEIS};
  }
  return null;
}

test('die Leser finden ihre Quellen (Positivkontrolle der Zerlegung)', () => {
  // Ohne diese Kontrolle wäre ein kaputter Leser (0 Abschnitte, leerer
  // Text) still grün, weil nichts zu prüfen bliebe.
  const titel = AGB.map((a) => a.titel);
  assert.ok(AGB.length >= 10, `AGB-Abschnitte: ${AGB.length}`);
  assert.ok(titel.some((t) => /^§ 7 Widerrufsbelehrung$/.test(t)), titel.join(' | '));
  assert.ok(titel.some((t) => /20-Tage-Zufriedenheitsgarantie/.test(t)), titel.join(' | '));
  const p7 = AGB.find((a) => a.paragraf === '7');
  const gar = AGB.find((a) => /Zufriedenheitsgarantie/.test(a.titel));
  assert.ok(stehtIn('14', p7.text), '§ 7 nennt vierzehn Tage');
  assert.ok(!stehtIn('20', p7.text), '§ 7 nennt die 20 Tage NICHT');
  assert.ok(stehtIn('20', gar.text) && stehtIn('100 %', gar.text));
  assert.deepEqual(zahlen('ab 1.000 Euro bis zu 24, Richtlinie (EU) 2025/1960'), ['1000', '24']);
  assert.deepEqual(zahlen('100 % Geld-zurück-Garantie, 20 Tage'), ['100 %', '20']);
  assert.ok(FAQ_TEXT.length > 1000 && EU_HINWEIS.length > 1000);
  // Die Prüfung hat Gegenstand: mindestens die drei AGB-Angaben der Fristen.
  assert.ok(angaben().filter((a) => a.belegPfad === '/pages/agb').length >= 4);
});

test('jede AGB-Quellzeile nennt einen echten Abschnitt', () => {
  for (const a of angaben().filter((x) => x.belegPfad === '/pages/agb')) {
    const q = quelleVon(a);
    assert.ok(
      q.abschnitte.length > 0,
      `${a.wo}:${a.id} — „${a.beleg}" nennt keinen Abschnitt der AGB (Überschriften: ${AGB.map((x) => x.titel).join(' | ')})`,
    );
  }
});

test('jede genannte Zahl steht in der zitierten Quelle', () => {
  const befunde = [];
  for (const a of angaben()) {
    const zz = zahlen(a.behauptung);
    if (!zz.length) continue;
    const q = quelleVon(a);
    if (!q) {
      if (!(a.belegPfad in EXTERN)) {
        befunde.push(
          `${a.wo}:${a.id} nennt ${zz.join(', ')}, Quelle „${a.beleg}" (${a.belegPfad}) ist im Repo nicht prüfbar und nicht in EXTERN`,
        );
      }
      continue;
    }
    for (const z of zz) {
      if (!stehtIn(z, q.text)) {
        befunde.push(
          `${a.wo}:${a.id} nennt „${z}", die Quelle „${a.beleg}" (${q.abschnitte.join(' + ')}) nennt es nicht`,
        );
      }
    }
  }
  assert.deepEqual(befunde, []);
});
