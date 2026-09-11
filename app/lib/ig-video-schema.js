/**
 * VideoObject-Auszeichnung für die Instagram-Stimmen einer Produktseite.
 *
 * Reine Datenfabrik ohne React-Import — dieselbe Bauform wie app/lib/seo.js,
 * app/lib/produkt-seo.js und app/lib/produkt-schema.js, damit sie unter
 * `node --test` ohne Bundler ladbar bleibt.
 *
 * WARUM ES DIESE DATEI GIBT: die Slideshow bringt bis zu 43 Videos auf eine
 * Produktseite. Ohne Auszeichnung sieht eine Suchmaschine dort gar kein Video —
 * sie kann den Inhalt eines <iframe> eines Drittanbieters nicht als Video der
 * Seite werten, und in der Fassaden-Bauform entsteht dieser <iframe> ohnehin
 * erst nach dem Klick. Die Auszeichnung ist damit die EINZIGE Stelle, an der
 * die Seite maschinenlesbar sagt, dass hier Videos stehen.
 *
 * ═════════════════════════════════════════════════════════════════════════
 * DIE EINE REGEL, DIE DEN KNOTEN ENTSTEHEN ODER AUSFALLEN LÄSST
 * ═════════════════════════════════════════════════════════════════════════
 *
 * EIN VideoObject AUF EINEM EINTRAG OHNE VIDEO WÄRE EINE LÜGE. Drei Einträge
 * des Korpus sind Bild-/Karussell-Posts (`video: false`, über die GANZE
 * Grundmenge von 65 Codes im Browser gemessen, nicht über die Verdächtigen).
 * Sie bekommen in der Fläche keinen Play-Knopf — und hier keinen Knoten.
 *
 * Dieselbe Linie gilt für die PFLICHTFELDER. Google verlangt für ein
 * VideoObject `name`, `thumbnailUrl` und `uploadDate`; fehlt eines, steht der
 * Knoten dauerhaft als Fehler in der Search Console, während ein FEHLENDER
 * Knoten nur nichts bewirkt. Das ist dieselbe Entscheidung, die
 * produkt-schema.js für den Product-Knoten schon getroffen hat, und sie ist
 * hier als Bedingung gebaut, nicht als Zusage: ein Eintrag ohne Datum oder
 * ohne Poster erzeugt keinen Knoten.
 *
 * (Zum Zeitpunkt des Baus trifft das auf KEINEN Eintrag zu: alle 63
 * Video-Einträge tragen Datum und Poster. Bis zum 2026-09-11 fehlte bei 11
 * das Datum — nicht weil die Plattform keines nennt, sondern weil das
 * Messmuster einen Präfix verlangte, den Instagram nur setzt, wenn es Like-
 * Zahlen rendert. Die Bedingung bleibt trotzdem stehen: sie ist der Schutz
 * gegen den nächsten Nachschub, nicht gegen den heutigen Bestand.)
 *
 * ═════════════════════════════════════════════════════════════════════════
 * WAS BEWUSST NICHT DRINSTEHT
 * ═════════════════════════════════════════════════════════════════════════
 *
 * `contentUrl` — wir haben keine direkte Videodatei. Der Weg zum Video führt
 * über die Einbettung; `embedUrl` sagt genau das und behauptet nichts anderes.
 *
 * `duration`, `interactionStatistic`, `aggregateRating` — nicht gemessen.
 * Eine geschätzte Laufzeit ist eine erfundene Zahl in strukturierten Daten,
 * und die kostet im Zweifel die ganze Domain (siehe produkt-schema.js).
 *
 * `creator` als Person — wir wissen, auf welchem KONTO ein Beitrag liegt; ob
 * dahinter eine natürliche Person oder eine Marke steht, wissen wir nicht.
 *
 * ═════════════════════════════════════════════════════════════════════════
 * DER NAME KOMMT AUS DEM LADEVORGANG, NICHT AUS EINER LISTE HIER
 * ═════════════════════════════════════════════════════════════════════════
 *
 * `produktTitel` ist der Titel, den die Seite dem Kunden zeigt (aus dem
 * Shopify-Produkt). Eine eigene Namensliste in dieser Datei wäre eine zweite
 * Wahrheit über die Markenschreibung und würde beim nächsten Umbenennen im
 * Shop still auseinanderlaufen. Fehlt der Titel (Ladevorgang unvollständig),
 * entsteht der Name ohne Produktzusatz statt mit einem geratenen.
 */
import {absoluteCanonical} from './seo.js';
import {IG_TESTIMONIALS} from '../data/ig-testimonials.js';

/** Einbettungs-URL — dieselbe Form wie in der Komponente (`typ` trennt /reel/ von /p/). */
function einbettung(t) {
  return `https://www.instagram.com/${t.typ}/${t.code}/embed/`;
}

/**
 * Wer spricht. T3 sind unsere EIGENEN Beiträge ohne nennbare Person; sie
 * bekommen in der Fläche keine Namenszeile und hier keinen fremden Namen —
 * dieselbe Grenze, wörtlich dieselbe Begründung: ein Beitrag ohne Namen ist
 * erlaubt, ein Beitrag mit falschem Namen nicht.
 */
function urheber(t) {
  return t.stufe === 'T3' ? 'Qi Blanco' : `@${t.profil}`;
}

/** ISO-Datum als deutsches Datum. Reine Umformung, kein Kalenderwissen. */
function deutschesDatum(iso) {
  const [j, m, tg] = iso.split('-');
  return `${tg}.${m}.${j}`;
}

/**
 * Die VideoObject-Knoten einer Produktseite — einer je Eintrag MIT Video.
 *
 * @param {{produkt: string, pfad: string, produktTitel?: string,
 *          eintraege?: Array<object>}} args
 * @returns {Array<object>} schema.org-Knoten, leer wenn es nichts zu sagen gibt
 */
export function igVideoKnoten({produkt, pfad, produktTitel, eintraege = IG_TESTIMONIALS}) {
  const url = absoluteCanonical(pfad);
  // „auf der Seite zu X" und NICHT „zu X" — der Unterschied ist gemessen, nicht
  // stilistisch: die Produktzuordnung des Korpus stammt aus Christians Liste,
  // der BILDTEXT eines Beitrags handelt aber nicht zwingend vom Produkt dieser
  // Seite. Von den vier Kakao-Beiträgen nennt genau EINER den Kakao; einer
  // spricht ausdrücklich über einen QiOne-Anhänger (am gemessenen Bildtext in
  // reels-gemessen.json nachgelesen, 2026-09-11). „Beitrag zu X" wäre damit
  // für drei von vier eine Behauptung, die der Inhalt nicht deckt. Wo der
  // Beitrag STEHT, wissen wir dagegen sicher — und genau das steht hier.
  const aufSeite = produktTitel ? ` auf der Seite zu ${produktTitel}` : ' auf dieser Seite';
  return eintraege
    .filter((t) => t.produkt === produkt)
    .filter((t) => t.video !== false && t.datum && t.posterPfad)
    .map((t) => ({
      '@type': 'VideoObject',
      // Eigene @id mit Fragment, damit der Knoten neben Product und
      // BreadcrumbList derselben Seite eindeutig bleibt (Muster produkt-schema.js).
      '@id': `${url}#ig-video-${t.code}`,
      // Das Datum steht im Namen, damit die Knoten UNTERSCHEIDBAR sind: auf
      // /products/qione-2-pro tragen 26 Beiträge denselben Urheber (uns), und
      // 26-mal derselbe Name wäre eine Liste, die nichts benennt.
      name: `Instagram-Beitrag von ${urheber(t)} vom ${deutschesDatum(t.datum)}`,
      description:
        `Instagram-Beitrag von ${urheber(t)} vom ${deutschesDatum(t.datum)}, ` +
        `gezeigt in der Instagram-Reihe${aufSeite}.`,
      thumbnailUrl: t.posterPfad,
      uploadDate: t.datum,
      embedUrl: einbettung(t),
      inLanguage: t.sprache === 'en' ? 'en' : 'de',
      isPartOf: {'@id': `${url}#product`},
    }));
}

/**
 * Fertiger meta-Descriptor (react-router 7 rendert ihn nativ als
 * `<script type="application/ld+json">` und maskiert den Inhalt selbst).
 *
 * EIN Knoten-Container statt 43 einzelner `<script>`-Blöcke: `@graph` ist die
 * dokumentierte Form für mehrere Knoten desselben Dokuments, und 43 getrennte
 * Blöcke wären 43-mal derselbe `@context`-Kopf im `<head>`.
 *
 * Gibt `null` zurück, wenn die Seite kein Video zeigt — der Aufrufer hängt
 * dann bewusst nichts an, statt einen leeren Container auszuliefern.
 *
 * @returns {{'script:ld+json': object} | null}
 */
export function igVideoDescriptor(args) {
  const knoten = igVideoKnoten(args);
  if (knoten.length === 0) return null;
  return {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@graph': knoten,
    },
  };
}
