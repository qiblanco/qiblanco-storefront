import {EINSTIEG, STRAENGE} from '~/data/werk';

/**
 * Die Werk-Ordnung des Wissensforums — Schalter und Einstiegsweg.
 *
 * DER SCHALTER STEHT AUF `true`, SEIT DER ENTSCHEIDUNG VOM 2026-09-26:
 * review.db, Item `blog-redaktion:entscheidung:werk-straenge-benennung-20260908`,
 * entschieden vom AI-CEO (Nordstern Kl.10, Shop-Texte/Navigation): die
 * Strang-Fragen und der Einstiegstext "Wo Sie anfangen" gehen live, leere
 * Stränge erst, wenn sie Artikel tragen; die Quellenübersicht bleibt unter
 * /pages/quellen.
 *
 * WAS ER SCHALTET: den Wegweiser über dem chronologischen Raster auf Seite 1
 * von /blogs/wissen (Begründung der Bauform im Kopf von `Wegweiser` in
 * app/routes/blogs.$blogHandle._index.jsx). `false` nimmt ihn vollständig
 * zurück, die Übersicht ist dann byte-gleich die Blätterliste.
 *
 * DER TRÄGER: die stehende Probe
 * `homepage-bauer/pruefungen/probe_werk_straenge_schalter.py` misst, ob der
 * Schalter auf origin/main zur Entscheidungslage passt — in beide Richtungen.
 */
export const STRAENGE_LIVE = true;

/**
 * Der Einstiegsweg: je belegtem Strang die Strang-Frage und EIN Artikel.
 *
 * WELCHER Artikel, entscheidet blog-redaktion (src/werk.py, meiste
 * eingehende Querverweise) und trägt es über `app/data/werk.js` herein —
 * hier steht nur das Auflösen gegen den Bestand, den der Shop liefert.
 *
 * FAIL-SOFT IN DIE RICHTIGE RICHTUNG: ein Einstieg, dessen Artikel der Shop
 * (noch) nicht liefert, fällt WEG. Ein Link ins Leere am wichtigsten Klick
 * der Seite wäre schlimmer als ein kürzerer Weg. Ein Strang ohne Artikel
 * steht gar nicht erst im Auszug (Erzeuger homepage-bauer/bin/werk-snapshot).
 *
 * @param {Array<{handle?: string, title?: string}>} artikel  der ganze Bestand
 * @returns {Array<{id: string, frage: string, kurz?: string, handle: string,
 *            titel: string}>}
 */
export function einstiegsWeg(artikel) {
  const nachHandle = new Map();
  for (const a of artikel || []) {
    if (a?.handle) nachHandle.set(a.handle, a);
  }
  const straenge = new Map(STRAENGE.map((s) => [s.id, s]));
  const weg = [];
  for (const e of EINSTIEG || []) {
    const strang = straenge.get(e.strang);
    const treffer = nachHandle.get(e.slug);
    if (!strang || !treffer) continue;
    weg.push({
      id: strang.id,
      frage: strang.frage,
      kurz: strang.kurz,
      handle: treffer.handle,
      titel: treffer.title || e.titel,
    });
  }
  return weg;
}
