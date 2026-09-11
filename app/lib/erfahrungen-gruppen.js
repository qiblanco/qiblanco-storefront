import {ERFAHRUNGS_BEITRAEGE} from '~/data/erfahrungen-beitraege';

/**
 * EIN MENSCH, EIN EINTRAG — die Gruppierung der Erfahrungs-Beitraege.
 *
 * ANLASS (Christian am 2026-09-11, woertlich): „nur Yann und Scott ist doppelt
 * — wenn jemand zwei Videos hat, sollte das vereint werden."
 *
 * SEIN BEFUND STIMMTE, WAR ABER UNVOLLSTAENDIG: gemessen am ausgelieferten HTML
 * standen 17 `h3.erf__name` für 13 Menschen — Yann Sura DREIMAL, Constantin
 * Preis und Scott Schwenk je zweimal. Wer nur die zwei genannten Namen
 * zusammenfuehrt, lässt den dritten Fall stehen. Deshalb gruppiert diese
 * Funktion GENERISCH über das Feld `sprecher` statt eine Namensliste zu
 * fuehren — ein vierter Doppel-Beitrag im Datenmodul ist damit von selbst
 * richtig dargestellt und braucht keine Code-Aenderung.
 *
 * WARUM DIE GRUPPIERUNG HIER STEHT UND NICHT IM DATENMODUL: die 17 Beitraege
 * sind die SSoT und tragen je eine EIGENE, treue Zusammenfassung ihres eigenen
 * Videos (Herkunftsregel 1 im Kopf des Datenmoduls: kein Wortlaut, indirekte
 * Rede je Video). Zwei Zusammenfassungen zu EINER zu verschmelzen hiesse, einen
 * Text zu schreiben, den niemand geprueft hat. Zusammengefuehrt wird deshalb die
 * ANSICHT (ein Name, ein Abschnitt), nicht der Inhalt (zwei Videos, zwei Texte).
 *
 * WARUM DAS MEHR IST ALS ORDNUNG: zwei Abschnitte zu derselben Person lesen sich
 * wie zwei Stimmen und sind eine. Wer das bemerkt, misstraut der ganzen Seite —
 * auf einer Flaeche, deren einziges Kapital Glaubwuerdigkeit ist, ist das der
 * teuerste Fehler.
 *
 * REIHENFOLGE: die Beitraege im Datenmodul stehen nach Reichweite (Aufrufe
 * absteigend). Die Gruppen erben diese Ordnung über ihr ERSTES Video — die
 * Zusage „nach Reichweite geordnet" im Seitentext bleibt damit wahr, ohne dass
 * hier eine Aufruf-Zahl geführt werden muss (die veraltet und müsste gepflegt
 * werden; die Reihenfolge im Datenmodul ist der bereits gepflegte Traeger).
 *
 * SPRACHE: eine Gruppe erbt die Sprache ihres ersten Videos. Gemessen am
 * 2026-09-11 ist das eindeutig — keiner der drei Mehrfach-Sprecher hat Videos in
 * zwei Sprachen. Faende sich spaeter einer, stuende er EINMAL im Abschnitt seiner
 * ersten Sprache und traege dort BEIDE Videos; er verschwindet also nicht, und
 * `sprachen` nennt den Fall ausdrücklich, statt ihn zu verschweigen.
 */

/** Anker-Slug aus einem Namen: für die `url` der VideoObject-Knoten und als
 *  stabile React-Kennung der Gruppe. Bewusst ASCII-reduziert — ein Anker mit
 *  Umlaut ueberlebt Kopieren und Weiterleiten nicht zuverlaessig. */
export function sprecherSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @typedef {{
 *   sprecher: string,
 *   slug: string,
 *   sprache: string,
 *   sprachen: string[],
 *   videos: Array<object>,
 * }} SprecherGruppe
 */

/**
 * Gruppiert Beitraege zu je einem Eintrag pro Mensch.
 * @param {Array<object>} [beitraege]
 * @returns {SprecherGruppe[]}
 */
export function gruppiereNachSprecher(beitraege = ERFAHRUNGS_BEITRAEGE) {
  /** @type {Map<string, SprecherGruppe>} */
  const nachName = new Map();
  for (const b of beitraege) {
    const name = b.sprecher;
    let gruppe = nachName.get(name);
    if (!gruppe) {
      gruppe = {
        sprecher: name,
        slug: sprecherSlug(name),
        sprache: b.sprache,
        sprachen: [],
        videos: [],
      };
      nachName.set(name, gruppe);
    }
    gruppe.videos.push(b);
    if (!gruppe.sprachen.includes(b.sprache)) gruppe.sprachen.push(b.sprache);
  }
  return [...nachName.values()];
}

/**
 * Die Gruppen einer Sprache — Grundlage der beiden Seitenabschnitte.
 * Gefiltert wird über `sprache` (die FUEHRENDE Sprache der Gruppe), nicht über
 * `sprachen`: sonst stuende ein zweisprachiger Mensch in beiden Abschnitten und
 * wäre damit wieder doppelt — genau der Zustand, den dieses Modul beseitigt.
 * @param {string} sprache
 * @param {Array<object>} [beitraege]
 */
export function gruppenNachSprache(sprache, beitraege = ERFAHRUNGS_BEITRAEGE) {
  return gruppiereNachSprecher(beitraege).filter((g) => g.sprache === sprache);
}
