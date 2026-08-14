// Hermetische Tests des Canonical-Helpers (Auftrag
// seo-2026-w33-l11-canonical-site-weit-von-meta, Befundklasse F_canonical).
// node:test/node:assert sind Bordmittel, KEIN Netz, kein neuer Runner.
// Ausfuehren: node --test test/seo-canonical.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CANONICAL_ORIGIN,
  absoluteCanonical,
  canonicalLink,
} from '../app/lib/seo.js';

// --- Der eigentliche Befund: es MUSS ein <link> werden, kein <meta> ---------
// react-router-7 rendert einen meta-Descriptor nur dann als <link>, wenn
// `tagName` gesetzt und laut isValidMetaTag = /^(meta|link)$/ gültig ist.
// Ohne tagName faellt der Router auf createElement('meta', {...props}) zurück
// — genau der wirkungslose Zustand, den dieser Auftrag beseitigt.
test('canonicalLink trägt tagName=link (sonst rendert react-router <meta>)', () => {
  const d = canonicalLink('/pages/studien');
  assert.equal(d.tagName, 'link');
  assert.match(d.tagName, /^(meta|link)$/); // isValidMetaTag des Routers
  assert.equal(d.rel, 'canonical');
});

test('canonicalLink hat KEINE Keys, die der Router vorher abfaengt', () => {
  // Reihenfolge der Renderschleife: tagName -> title -> charset/charSet ->
  // script:ld+json -> Fallback <meta>. Ein versehentliches `title` würde den
  // Descriptor zu einem <title> machen.
  const d = canonicalLink('/pages/studien');
  for (const key of ['title', 'charset', 'charSet', 'script:ld+json']) {
    assert.equal(key in d, false, `Descriptor darf kein '${key}' tragen`);
  }
});

// --- Absolute URL -----------------------------------------------------------
test('absoluteCanonical macht aus einem Pfad eine absolute Produktions-URL', () => {
  assert.equal(
    absoluteCanonical('/pages/studien'),
    'https://qiblanco.com/pages/studien',
  );
  assert.equal(CANONICAL_ORIGIN, 'https://qiblanco.com');
});

test('absoluteCanonical: Root behaelt den Slash', () => {
  assert.equal(absoluteCanonical('/'), 'https://qiblanco.com/');
  assert.equal(absoluteCanonical(''), 'https://qiblanco.com/');
  assert.equal(absoluteCanonical(undefined), 'https://qiblanco.com/');
});

test('absoluteCanonical: Query und Hash fallen weg', () => {
  assert.equal(
    absoluteCanonical('/pages/studien?utm_source=meta&x=1'),
    'https://qiblanco.com/pages/studien',
  );
  assert.equal(
    absoluteCanonical('/pages/studien#abschnitt'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical: abschliessender Slash wird getrimmt (ausser Root)', () => {
  assert.equal(
    absoluteCanonical('/pages/studien/'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical: fuehrender Slash wird ergänzt', () => {
  assert.equal(
    absoluteCanonical('pages/studien'),
    'https://qiblanco.com/pages/studien',
  );
});

test('absoluteCanonical zeigt NIE auf einen Preview-/Oxygen-Host', () => {
  // Der Grund für absolute Canonicals: react-router merged meta nicht
  // baumweit, ein relativer Canonical würde auf Preview-Hosts die
  // Preview-URL selbst kanonisieren.
  for (const p of ['/pages/studien', '/products/qione-2-pro', '/']) {
    assert.ok(absoluteCanonical(p).startsWith('https://qiblanco.com'));
  }
});

// --- Die 5 gemeldeten Ziele des SEO-Wochenlaufs 2026-W33 --------------------
test('die gemeldeten Ziele bekommen je einen wirksamen Canonical', () => {
  const ziele = [
    '/pages/studien',
    '/pages/technologie',
    '/pages/crystal-cacao',
    '/pages/support',
    '/products/qione-2-pro',
  ];
  for (const p of ziele) {
    const d = canonicalLink(p);
    assert.equal(d.tagName, 'link');
    assert.equal(d.href, `https://qiblanco.com${p}`);
  }
});
