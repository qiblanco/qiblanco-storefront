// node --test app/components/apple-seite/lp/lp.test.mjs
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pruefeSeite, texteVon} from '../apple-seite-logik.js';
import {APPLE_SEITEN} from '../../../lib/apple-seiten.js';
import {ALLTAG_SEKTIONEN} from './lp-alltag.js';
import {VERSPRECHEN_SEKTIONEN} from './lp-versprechen.js';
import {TRAGEFORM_SEKTIONEN} from './lp-trageform.js';
import {EINFACH_SEKTIONEN} from './lp-einfach.js';
import {MECHANISMUS_SEKTIONEN} from './lp-mechanismus.js';
import {SKEPTIKER_SEKTIONEN} from './lp-skeptiker.js';
import {SCHLAF_SEKTIONEN} from './lp-schlaf.js';
import {ESMOGSCHUTZ_SEKTIONEN} from './lp-esmogschutz.js';

const SEITEN = {
  '/pages/haelt-das-mein-leben-aus': ALLTAG_SEKTIONEN,
  '/pages/das-20-tage-versprechen': VERSPRECHEN_SEKTIONEN,
  '/pages/kette-oder-armband': TRAGEFORM_SEKTIONEN,
  '/pages/so-funktioniert-der-qione': EINFACH_SEKTIONEN,
  '/pages/so-wirkt-kohaerentes-wasser': MECHANISMUS_SEKTIONEN,
  '/pages/wir-machen-ihn-auf': SKEPTIKER_SEKTIONEN,
  '/pages/tiefer-schlaf': SCHLAF_SEKTIONEN,
  '/pages/E-Smog-Schutz': ESMOGSCHUTZ_SEKTIONEN,
};

test('jede Seite besteht pruefeSeite (Hero zuerst, Anna, kein Preisanker, kein Konjunktiv)', () => {
  for (const [pfad, s] of Object.entries(SEITEN)) assert.deepEqual(pruefeSeite(s), [], pfad);
});

test('jede Seite hat einen Schalter in der Tabelle', () => {
  const pfade = new Set(Object.values(APPLE_SEITEN).map((e) => e.pfad));
  for (const pfad of Object.keys(SEITEN)) assert.ok(pfade.has(pfad), pfad);
});

test('jedes Ziel trägt je Seite genau eine Beschriftung, Ziele intern oder Shopify-CDN', () => {
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    const je = new Map();
    for (const s of sektionen) {
      for (const c of [s.cta, s.cta2, s.link].filter(Boolean)) {
        assert.match(c.href, /^(\/|https:\/\/cdn\.shopify\.com\/)/, `${pfad}: ${c.href}`);
        je.set(c.href, new Set([...(je.get(c.href) ?? []), c.text]));
      }
    }
    for (const [href, texte] of je) assert.equal(texte.size, 1, `${pfad}: ${href} ${[...texte]}`);
  }
});

test('kein Kaufknopf ohne Preis: CTA-Texte sind keine Kauf-Wörter (Sicht-Tor kaufknopf_kontext)', () => {
  const KAUF = /(in den warenkorb|jetzt kaufen|kaufen$|^kaufen|jetzt bestellen|zur kasse)/i;
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    for (const s of sektionen) for (const c of [s.cta, s.cta2].filter(Boolean)) assert.ok(!KAUF.test(c.text), `${pfad}: ${c.text}`);
  }
});

test('keine Sterne, keine Note in den Stimmen', () => {
  for (const [pfad, sektionen] of Object.entries(SEITEN)) {
    for (const t of texteVon(sektionen)) assert.ok(!/★|\d[.,]\d\s*\/\s*5/.test(t), `${pfad}: ${t}`);
  }
});

/* 360-Grad (s02, Christian 30.10.2026): kein 360-Ersatzbild ohne Drehung, und
   die Drehung passt zum Gerät im Dateinamen. Hero zuerst, damit der Kopf dreht. */
const DREHUNG_AUS_DATEI = {"360-qione-front": "qione", "360-qibracelet-winkel": "qibracelet", "360-qihome-front": "qihome"};
function pruefe360(bilder, name) {
  let n = 0;
  for (const b of bilder) {
    const m = /qb-video360-ersatzbild--(360-[a-z]+-[a-z]+)(?:-\d+)?--/.exec(b?.url || "");
    if (!m) continue;
    n++;
    assert.equal(b.drehung, DREHUNG_AUS_DATEI[m[1]], `${name}: ${m[1]} steht als Standbild`);
  }
  return n;
}

test('360: jede LP-Ansicht der Geräte dreht (kein Standbild)', () => {
  let n = 0;
  for (const [name, s] of Object.entries({ALLTAG_SEKTIONEN, VERSPRECHEN_SEKTIONEN, TRAGEFORM_SEKTIONEN, EINFACH_SEKTIONEN, MECHANISMUS_SEKTIONEN, SKEPTIKER_SEKTIONEN, SCHLAF_SEKTIONEN, ESMOGSCHUTZ_SEKTIONEN})) {
    n += pruefe360(s.map((x) => x.bild), name);
  }
  assert.ok(n >= 3, `mindestens die drei bekannten 360-Stellen, gefunden ${n}`);
});

test('Kurs-Lektionsbilder: schärfere Datei, Anzeigebreite gleich, kein srcset (Flanke #279)', async () => {
  const {scharfeLektionsbilder} = await import('./kurs-bilder.js');
  const cdn = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';
  // Mit width-Attribut: Datei in 2 x W, das Attribut bleibt
  assert.equal(
    scharfeLektionsbilder(`<p>Text</p><img style="float: left" src="${cdn}Christian_480x480.webp?v=1733929584" width="233" height="298">`),
    `<p>Text</p><img style="float: left" src="${cdn}Christian.webp?v=1733929584&amp;width=466" width="233" height="298">`,
  );
  // Ohne width-Attribut gab die alte Datei die Breite vor: sie wird als Attribut gesetzt
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}Christian-Bauer-290x300_1_240x240.webp?v=2">`),
    `<img width="232" src="${cdn}Christian-Bauer-290x300_1.webp?v=2&amp;width=464">`,
  );
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=3" style="display: block">`),
    `<img width="480" src="${cdn}Kreislauf_Biohacking.png_1.webp?v=3&amp;width=960" style="display: block">`,
  );
  // Füllt die Spalte: Datei breiter als die Spalte, kein width-Attribut
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}qiblanco-com-qione-2-pro-transparent_1.webp?v=166659147">`),
    `<img src="${cdn}QiOne2Pro_01_transparent.png?v=1683116991&amp;width=1232">`,
  );
  // data-mce-src bleibt, ein "src=" im alt-Wert auch
  const mce = scharfeLektionsbilder(`<img alt="a src=b width=9" data-mce-src="${cdn}x.webp" src="${cdn}Christian_480x480.webp?v=1" width="233">`);
  assert.equal(mce, `<img alt="a src=b width=9" data-mce-src="${cdn}x.webp" src="${cdn}Christian.webp?v=1&amp;width=466" width="233">`);
  // Kein srcset in keiner Form; byte-gleich bleiben: unbekannte Datei (auch mit Größen-Namen), fremder Host,
  // vorhandenes srcset, width nicht numerisch, width nur im alt-Wert bei Tabelleneintrag ohne Anzeige, Text ohne Bild
  for (const roh of [
    `<img src="${cdn}chlorella_algen-1024x576.jpg_1.webp?v=1">`,
    `<img src="${cdn}banner_1920x1080.jpg?v=1">`,
    '<img src="https://i.ytimg.com/vi/x/hqdefault.jpg">',
    `<img src="${cdn}Christian_480x480.webp" srcset="${cdn}Christian_480x480.webp 1x">`,
    `<img src="${cdn}Christian_480x480.webp?v=1" width="100%">`,
    `<img alt="width=233" src="${cdn}Christian_480x480.webp?v=1">`,
    `<img src="https://example.com/s/files/files/Christian_480x480.webp">`,
    '<p>ohne Bild</p>',
    '',
  ]) assert.equal(scharfeLektionsbilder(roh), roh);
});
