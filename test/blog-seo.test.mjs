/**
 * Hermetischer Test der Blog-Meta (node --test, ohne Bundler).
 *
 * Kernpunkt ist der Wächter gegen das Hydrogen-Scaffold: der Befund L7 war
 * nicht "die description fehlt", sondern "im Titel steht der Name unseres
 * Frameworks". Das darf nie zurückkommen — auch nicht durch eine neue
 * Blog-Route, die jemand aus dem Scaffold kopiert.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {blogMeta, MARKEN_SUFFIX} from '../app/lib/blog-seo.js';

test('kein Framework-Name im Titel — der eigentliche L7-Befund', () => {
  const faelle = [
    blogMeta({pfad: '/blogs', titel: 'Magazin', beschreibung: 'x'}),
    blogMeta({pfad: '/blogs/news', titel: 'News'}),
    blogMeta({pfad: '/blogs/news/artikel', titel: 'Ein Artikel', typ: 'article'}),
    blogMeta({pfad: '/blogs'}), // Titel fehlt: Rückfall auf die Marke
  ];
  for (const m of faelle) {
    const titel = m.find((d) => d.title).title;
    assert.ok(!/hydrogen/i.test(titel), `Framework-Name im Titel: ${titel}`);
    assert.ok(titel.includes('Qi Blanco'), `Marke fehlt im Titel: ${titel}`);
  }
});

test('fehlender Titel ergibt die Marke, nicht " | Qi Blanco"', () => {
  // Ein leerer Titelanfang wäre ein sichtbarer Darstellungsfehler im
  // Suchergebnis — der Scaffold-Code lieferte bei fehlenden Daten genau das.
  const t = blogMeta({pfad: '/blogs'}).find((d) => d.title).title;
  assert.equal(t, MARKEN_SUFFIX);
  assert.ok(!t.startsWith('|'), 'Titel beginnt mit einem Trennstrich');
});

test('Canonical ist ein echtes <link> und absolut', () => {
  for (const pfad of ['/blogs', '/blogs/news', '/blogs/news/mein-artikel']) {
    const canon = blogMeta({pfad, titel: 'T'}).find((d) => d.rel === 'canonical');
    assert.equal(canon.tagName, 'link', `${pfad}: Canonical ist kein <link>`);
    assert.equal(canon.href, `https://qiblanco.com${pfad}`);
  }
});

test('ohne gepflegte Beschreibung wird KEINE description gerendert', () => {
  // Bewusste Entscheidung: lieber keine als eine wortgleich duplizierte.
  const m = blogMeta({pfad: '/blogs/news', titel: 'News'});
  assert.equal(m.find((d) => d.name === 'description'), undefined);
  assert.equal(m.find((d) => d.property === 'og:description'), undefined);
});

test('mit Beschreibung sind description und og:description identisch', () => {
  const m = blogMeta({pfad: '/blogs', titel: 'Magazin', beschreibung: 'Hallo'});
  assert.equal(m.find((d) => d.name === 'description').content, 'Hallo');
  assert.equal(m.find((d) => d.property === 'og:description').content, 'Hallo');
});

test('og:type unterscheidet Artikel von Übersicht', () => {
  const uebersicht = blogMeta({pfad: '/blogs', titel: 'M'});
  const artikel = blogMeta({pfad: '/blogs/n/a', titel: 'A', typ: 'article'});
  assert.equal(uebersicht.find((d) => d.property === 'og:type').content, 'website');
  assert.equal(artikel.find((d) => d.property === 'og:type').content, 'article');
});

test('og:image nur bei vorhandenem Bild', () => {
  assert.equal(
    blogMeta({pfad: '/blogs', titel: 'M'}).find((d) => d.property === 'og:image'),
    undefined,
  );
  assert.equal(
    blogMeta({pfad: '/blogs', titel: 'M', bildUrl: 'https://x/y.jpg'})
      .find((d) => d.property === 'og:image').content,
    'https://x/y.jpg',
  );
});

test('KEINE Blog-Route trägt noch den Scaffold-Titel', () => {
  // Findet die Route, die jemand vergisst — der Ausgangsbefund betraf alle drei.
  const dateien = readdirSync('app/routes').filter(
    (f) => f.startsWith('blogs') && f.endsWith('.jsx'),
  );
  assert.ok(dateien.length >= 3, `nur ${dateien.length} Blog-Routen gefunden`);
  for (const f of dateien) {
    const quelle = readFileSync(`app/routes/${f}`, 'utf8');
    assert.ok(
      !/title:\s*`Hydrogen/.test(quelle),
      `${f}: trägt noch den Hydrogen-Scaffold-Titel`,
    );
    assert.ok(quelle.includes('blogMeta'), `${f}: nicht an blogMeta verdrahtet`);
  }
});
