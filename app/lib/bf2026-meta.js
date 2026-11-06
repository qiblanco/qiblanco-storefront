/*
 * META DER BLACK-FRIDAY-SEITEN 2026 (s04). vorschau: noindex, kein canonical
 * daneben (wie die Vorlagen ohne Indexwert). on: indexierbar, canonical auf sich
 * selbst. Beide Fälle tragen denselben Titel.
 */
import {BF2026} from '~/data/black-friday-2026';
import {BF2026_KOPF} from '~/components/black-friday-2026/bf2026-texte';
import {canonicalLink, noindexMeta} from '~/lib/seo';
import {MARKE} from '~/lib/produkt-seo';

export function bf2026Meta(seite) {
  if (!seite) return [];
  const titel = seite.art === 'angebot'
    ? `Black Friday: ${seite.angebot.titel} | ${MARKE}`
    : `Black Friday: ${BF2026.angebote.length} Angebote | ${MARKE}`;
  const beschreibung = {name: 'description', content: BF2026_KOPF.unter};
  if (seite.modus === 'on') {
    return [{title: titel}, beschreibung, canonicalLink(seite.pfad)];
  }
  return [{title: titel}, beschreibung, noindexMeta()];
}

/**
 * headers() einer Route: reicht nur das X-Robots-Tag der Vorschau aus dem Loader
 * durch. Alles andere bleibt, wie es ohne headers-Export wäre (parentHeaders);
 * die Sammelroute products.$handle.jsx liefert damit für jedes andere Produkt
 * dieselben Köpfe wie vorher.
 */
export function bf2026HeaderAusLoader({loaderHeaders, parentHeaders}) {
  const kopf = new Headers(parentHeaders);
  const robots = loaderHeaders.get('X-Robots-Tag');
  if (robots) kopf.set('X-Robots-Tag', robots);
  return kopf;
}
