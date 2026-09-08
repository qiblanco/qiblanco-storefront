import {STRAENGE} from '~/data/werk';

/**
 * Die Werk-Ordnung des Wissensforums — Schalter und Zuordnung.
 *
 * WARUM DIESER SCHALTER EXISTIERT, und warum er auf `false` steht:
 * Die BENENNUNG der Straenge ("Was ist an dem Trend wirklich dran?") und der
 * Einstiegstext sind eine INHALTLICHE Entscheidung und liegen als Vorlage bei
 * Christian — review.db, Item
 * `blog-redaktion:entscheidung:werk-straenge-benennung-20260908` (Stand
 * 2026-09-08: status `vorgelegt`, `christian_entscheidung` leer). Der
 * MECHANISMUS darf gebaut sein, die Benennung darf noch nicht ausgeliefert
 * werden. Ein `Ja` legt genau diese eine Zeile auf `true` um und braucht
 * keinen zweiten Bau.
 *
 * WAS DER SCHALTER NICHT IST: eine Vorsichtsmassnahme, die man irgendwann
 * vergisst. Steht er nach der Entscheidung noch auf `false`, ist das ein
 * BEFUND — die stehende Probe
 * `homepage-bauer/pruefungen/probe_werk_straenge_schalter.py` meldet genau
 * diesen Fall und
 * nennt die Entscheidung, gegen die sie misst. Ohne diesen Traeger wäre ein
 * vergessener Schalter von einer bewussten Entscheidung nicht zu
 * unterscheiden, und das Wahrscheinlichere von beidem ist das Vergessen.
 */
export const STRAENGE_LIVE = false;

/**
 * Ordnet die vom Shop gelieferten Artikel den Straengen zu.
 *
 * DIE ZUORDNUNG WIRD NICHT HIER ENTSCHIEDEN, sondern in blog-redaktion aus dem
 * Bestand ABGELEITET und über `app/data/werk.js` hereingetragen — hier steht
 * nur das Nachschlagen. Das ist der Grund, warum ein neuer Artikel niemanden
 * zwingt, eine Liste zu pflegen.
 *
 * FAIL-SOFT UND VOLLSTAENDIG: ein Artikel, den der Auszug (noch) nicht kennt,
 * geht NICHT verloren — er landet in `rest`. Ein stiller Verlust wäre hier
 * besonders teuer, weil er wie eine bewusste redaktionelle Auswahl aussaehe.
 * Genau diese Klasse hat der Blog schon einmal bezahlt: `pageBy: 4` liess bei
 * sechs Artikeln zwei hinter einem "Mehr laden"-Link verschwinden.
 *
 * @param {Array<{handle?: string}>} artikel  Artikel in Shop-Reihenfolge
 * @returns {{gruppen: Array<{id: string, frage: string, kurz: string,
 *            artikel: Array<object>}>, rest: Array<object>}}
 */
export function gruppiereNachStraengen(artikel) {
  const offen = new Map();
  for (const a of artikel || []) {
    if (a?.handle) offen.set(a.handle, a);
  }

  const gruppen = [];
  for (const strang of STRAENGE) {
    const zugeordnet = [];
    for (const eintrag of strang.slugs || []) {
      // BEIDE FORMEN, und das ist kein Schluder, sondern die Antwort auf eine
      // Naht, die schon einmal gerissen ist: der Auszug wird von einem FREMDEN
      // Modul erzeugt (blog-redaktion über homepage-bauer/bin/werk-snapshot).
      // Der Erzeuger ist am 2026-09-08 von blossen Strings auf das BENANNTE
      // Feld {"slug": "..."} umgestellt — aus gutem Grund: das Umlaut-Gate
      // maskiert Slugs nur in dieser Form, und Slugs müssen ASCII bleiben.
      // Der Verbraucher hier zog nicht nach und ordnete danach NICHTS mehr zu:
      // `Map.get(objekt)` trifft einen String-Schlüssel nie, jeder Strang war
      // leer, alle Artikel fielen in die Restgruppe — der Bau hätte fertig
      // ausgesehen und nichts bewirkt. Wer eine Form erzwingt, verstummt beim
      // nächsten Mal genauso still; deshalb wird hier gelesen, nicht verlangt.
      const slug = typeof eintrag === 'string' ? eintrag : eintrag?.slug;
      const treffer = slug ? offen.get(slug) : undefined;
      if (treffer) {
        zugeordnet.push(treffer);
        offen.delete(slug);
      }
    }
    // Eine Ueberschrift ohne Artikel darunter ist kein Strang, sondern ein
    // leeres Versprechen — und die ZIEL-Probe des Auftrags zählt sie
    // ausdrücklich nicht mit.
    if (zugeordnet.length) {
      gruppen.push({
        id: strang.id,
        frage: strang.frage,
        kurz: strang.kurz,
        artikel: zugeordnet,
      });
    }
  }

  return {gruppen, rest: [...offen.values()]};
}
