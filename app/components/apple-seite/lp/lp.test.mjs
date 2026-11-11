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
import {MENSCHEN_ALLTAG_SEKTIONEN, mitMarken, saetze, satzListe} from './lp-menschen-alltag.js';
import {MENSCHEN_ALLTAG_TEXTE} from '../../campaign/menschenAlltagTexte.js';

const SEITEN = {
  '/pages/haelt-das-mein-leben-aus': ALLTAG_SEKTIONEN,
  '/pages/das-20-tage-versprechen': VERSPRECHEN_SEKTIONEN,
  '/pages/kette-oder-armband': TRAGEFORM_SEKTIONEN,
  '/pages/so-funktioniert-der-qione': EINFACH_SEKTIONEN,
  '/pages/so-wirkt-kohaerentes-wasser': MECHANISMUS_SEKTIONEN,
  '/pages/wir-machen-ihn-auf': SKEPTIKER_SEKTIONEN,
  '/pages/tiefer-schlaf': SCHLAF_SEKTIONEN,
  '/pages/E-Smog-Schutz': ESMOGSCHUTZ_SEKTIONEN,
  '/pages/menschen-alltag': MENSCHEN_ALLTAG_SEKTIONEN,
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
  for (const [name, s] of Object.entries({ALLTAG_SEKTIONEN, VERSPRECHEN_SEKTIONEN, TRAGEFORM_SEKTIONEN, EINFACH_SEKTIONEN, MECHANISMUS_SEKTIONEN, SKEPTIKER_SEKTIONEN, SCHLAF_SEKTIONEN, ESMOGSCHUTZ_SEKTIONEN, MENSCHEN_ALLTAG_SEKTIONEN})) {
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
  // Ohne width-Attribut gab die alte Datei die Breite vor: Maße aus der Tabelle
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=3" style="display: block">`),
    `<img width="480" height="480" src="${cdn}Kreislauf_Biohacking.png_1.webp?v=3&amp;width=960" style="display: block">`,
  );
  // Füllt die Spalte: Datei breiter als die Spalte, lazy, weil weit unter der ersten Ansicht
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}qiblanco-com-qione-2-pro-transparent_1.webp?v=166659147">`),
    `<img width="1120" height="1120" loading="lazy" src="${cdn}QiOne2Pro_01_transparent.png?v=1683116991&amp;width=1120">`,
  );
  // Bereits ein width-Attribut: das bleibt maßgeblich, auch ohne Leerzeichen davor
  assert.equal(
    scharfeLektionsbilder(`<img alt="a"width="100" src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=3">`),
    `<img alt="a"width="100" src="${cdn}Kreislauf_Biohacking.png_1.webp?v=3&amp;width=200">`,
  );
  // data-mce-src bleibt, ein "src=" im alt-Wert auch, ein ">" im alt-Wert beendet den Tag nicht
  assert.equal(
    scharfeLektionsbilder(`<img alt="1 > 0 src=b width=9" data-mce-src="${cdn}x.webp" src="${cdn}Christian_480x480.webp?v=1" width="233">`),
    `<img alt="1 > 0 src=b width=9" data-mce-src="${cdn}x.webp" src="${cdn}Christian.webp?v=1&amp;width=466" width="233">`,
  );
  // Porträt ohne größeres Original: das größere Foto Christian.webp in derselben Anzeigebreite 232 (s07-r17)
  assert.equal(
    scharfeLektionsbilder(`<img alt="Christian Bauer" src="${cdn}Christian-Bauer-290x300_1_240x240.webp?v=1667505773" left="" float:="">`),
    `<img width="232" height="297" alt="Christian Bauer" src="${cdn}Christian.webp?v=1667505773&amp;width=464" left="" float:="">`,
  );
  // Deckel (s07-r17): Quelle byte-gleich, Breite = Dateibreite / 1,8, Marke für die Zentrierung
  assert.equal(
    scharfeLektionsbilder(`<img src="${cdn}chlorella_algen-1024x576.jpg_1.webp?v=1667505820" alt="Chlorella" class="text-center">`),
    `<img data-bild-deckel width="568" height="320" src="${cdn}chlorella_algen-1024x576.jpg_1.webp?v=1667505820" alt="Chlorella" class="text-center">`,
  );
  assert.equal(
    scharfeLektionsbilder(`<img class="text-center" alt="Zeolith" src="${cdn}Zeolithe-1024x576.jpg_1.webp?v=1667505832">`),
    `<img data-bild-deckel width="568" height="320" class="text-center" alt="Zeolith" src="${cdn}Zeolithe-1024x576.jpg_1.webp?v=1667505832">`,
  );
  assert.equal(
    scharfeLektionsbilder(`<img alt="Dose" src="${cdn}61brbD89MGL._AC_SL1500.jpg?v=1701215564">`),
    `<img data-bild-deckel width="533" height="768" alt="Dose" src="${cdn}61brbD89MGL._AC_SL1500.jpg?v=1701215564">`,
  );
  // Byte-gleich bleiben: unbekannte Datei (auch mit Größen-Namen), fremder Host, vorhandenes srcset, width nicht positiv-numerisch,
  // height ohne width, Tabelleneintrag ohne Breite, img im Attributwert, anderer Tagname, Text ohne Bild
  for (const roh of [
    `<img src="${cdn}chlorella_algen-1024x576.jpg_1.webp?v=1" width="300">`,
    `<img src="${cdn}Zeolithe-1024x576.jpg_1.webp?v=1" style="width: 50%">`,
    `<img src="${cdn}Christian-Bauer-290x300_1.webp?v=2">`,
    `<img src="${cdn}banner_1920x1080.jpg?v=1">`,
    '<img src="https://i.ytimg.com/vi/x/hqdefault.jpg">',
    `<img src="${cdn}Christian_480x480.webp" srcset="${cdn}Christian_480x480.webp 1x">`,
    `<img src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=1" width="100%">`,
    `<img alt="a>b" src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=1" width="0">`,
    `<img src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp?v=1" height="50">`,
    `<img alt="width=233" src="${cdn}Christian_480x480.webp?v=1">`,
    '<img src="https://example.com/s/files/files/Christian_480x480.webp">',
    `<a title="<img src='${cdn}Kreislauf_Biohacking.png_1_480x480.webp'>">x</a>`,
    `<img-foo src="${cdn}Kreislauf_Biohacking.png_1_480x480.webp">`,
    '<p>ohne Bild</p>',
    '',
  ]) assert.equal(scharfeLektionsbilder(roh), roh);
});

/* menschen-alltag (s07-r19): Absätze nur aus dem Textmodul von C, Wort für Wort
   (bis auf das ® an den Marken), kein Satz zweimal auf der Seite. */
test('menschen-alltag: jeder Satz steht ganz so im Textmodul von C, kein Satz doppelt', () => {
  const quelle = new Set(Object.values(MENSCHEN_ALLTAG_TEXTE).flatMap((b) => b.absaetze.map(mitMarken).flatMap(satzListe)));
  const absaetze = MENSCHEN_ALLTAG_SEKTIONEN.flatMap((s) => [s.unter, ...(s.absaetze ?? []), ...(Array.isArray(s.text) ? s.text : [s.text])]).filter(Boolean);
  assert.ok(absaetze.length >= 7, `zu wenige Absätze: ${absaetze.length}`);
  const alle = absaetze.flatMap(satzListe);
  for (const satz of alle) assert.ok(quelle.has(satz), `kein ganzer Satz aus dem Textmodul: ${satz}`);
  assert.equal(new Set(alle).size, alle.length, 'ein Satz steht zweimal');
  assert.ok(!texteVon(MENSCHEN_ALLTAG_SEKTIONEN).some((t) => /QiOne 2 Pro|QiBracelet(?!®)|QiHome Air/.test(t)), 'Marke ohne ®');
  assert.deepEqual(satzListe('Eins. Im Labor von Prof. Dr. Peter C. Dartsch getestet. Vier!'), ['Eins.', 'Im Labor von Prof. Dr. Peter C. Dartsch getestet.', 'Vier!']);
  assert.equal(saetze('Eins. Zwei. Drei.', 2), 'Eins. Zwei.');
});
