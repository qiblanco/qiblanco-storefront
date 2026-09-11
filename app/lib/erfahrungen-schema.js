import {CANONICAL_ORIGIN, absoluteCanonical} from '~/lib/seo';
import {gruppiereNachSprecher} from '~/lib/erfahrungen-gruppen';

/**
 * STRUKTURIERTE DATEN FÜR /pages/erfahrungen — die Videos als das auszeichnen,
 * was sie sind.
 *
 * DER BEFUND, DER DIESES MODUL AUSLOEST (gemessen 2026-09-11 am ausgelieferten
 * HTML): die Seite trug NULL `application/ld+json`. Für eine Maschine war eine
 * Flaeche mit 17 Videos, in denen 13 namentlich genannte Menschen selbst
 * sprechen, nicht von Text mit Bildern zu unterscheiden.
 *
 * WARUM GERADE VIDEO (und warum das kein Schmuck ist): auf den Zweifels-
 * Suchbegriffen unserer Marke zitiert Googles KI-Antwort gemessen null eigene
 * Quellen von sechs, und der meistzitierte Host ist youtube.com mit 36 von 66
 * Zitatzeilen. Video ist also nachweislich die Quellenklasse, die dort gelesen
 * wird. Wir haben sie — wir haben sie nur nicht gekennzeichnet.
 *
 * WAS BEWUSST FEHLT — `Review` UND `aggregateRating`. Das ist die eine
 * Auszeichnung, die man auf einer Erfahrungsseite reflexhaft setzt, und sie ist
 * hier falsch, aus zwei unabhaengigen Gruenden: (1) Google spielt Rezensions-
 * Sternchen für die EIGENE Organisation auf der EIGENEN Domain seit 2019
 * ausdrücklich nicht aus („self-serving reviews") — der Ertrag ist null.
 * (2) Eine Sternebewertung wäre eine ZAHL, die wir über fremde Aussagen
 * bilden; niemand hier hat eine Note vergeben. Der Beleg dieser Seite ist das
 * Video, in dem ein namentlicher Mensch selbst spricht — nicht eine Kennziffer,
 * die wir daraus errechnen. Wer das spaeter ergänzen will, aendert damit die
 * Aussage der Seite, nicht nur ihr Markup.
 *
 * BAUFORM UEBERNOMMEN, NICHT ERFUNDEN (P10): dieselbe Struktur wie
 * app/lib/podcast-daten.server.js `schemaGraph()` — CollectionPage +
 * BreadcrumbList + ItemList mit VideoObject-Knoten. Die dortigen Pflichtfelder
 * (name, description, thumbnailUrl, uploadDate, duration, embedUrl, contentUrl)
 * wurden auf dem US-Shop maschinell geprueft. Nicht importiert wird das Modul,
 * weil es podcast-spezifisch und server-only ist; uebernommen wird die FORM.
 *
 * `Person` JE SPRECHER: der Knoten sagt aus, WER spricht, und hängt als
 * `subjectOf`/`actor` am Video. Bewusst OHNE `jobTitle`, `sameAs` oder
 * Beschreibung — jede weitere Angabe wäre eine Behauptung über einen echten
 * Menschen, die wir nicht aus seinem Video, sondern von aussen holen muessten.
 * Genannt wird der Name, den er auf einer Verkaufsflaeche des Hauses ohnehin
 * schon trägt (Herkunftsregel 2 im Kopf des Datenmoduls).
 */

const PFAD = '/pages/erfahrungen';

/** Vorschaubild eines Videos in der Aufloesung, die YouTube für JEDE Kennung
 *  garantiert. `maxresdefault` ist schoener, existiert aber nicht für jedes
 *  Video — ein 404 in `thumbnailUrl` ist ein kaputtes Pflichtfeld und damit
 *  schlechter als ein kleineres Bild, das immer da ist. */
export function vorschaubild(videoId) {
  return `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
}

/**
 * Der komplette `@graph` der Seite.
 * @param {Array<object>} [beitraege]
 */
export function erfahrungenSchema(beitraege) {
  const seiteUrl = absoluteCanonical(PFAD);
  const gruppen = gruppiereNachSprecher(beitraege);
  const organisation = {
    '@type': 'Organization',
    name: 'Qi Blanco',
    url: CANONICAL_ORIGIN,
  };

  /** Ein Personen-Knoten je Mensch, EINMAL — mit eigener @id, auf die jedes
   *  seiner Videos zeigt. Genau das ist die Auszeichnungs-Entsprechung zu
   *  „ein Mensch, ein Eintrag": drei Videos von Yann Sura ergeben drei
   *  VideoObject-Knoten und EINE Person, nicht drei Personen mit gleichem
   *  Namen. */
  const personen = gruppen.map((g) => ({
    '@type': 'Person',
    '@id': `${seiteUrl}#person-${g.slug}`,
    name: g.sprecher,
  }));

  let position = 0;
  const videos = [];
  for (const g of gruppen) {
    for (const b of g.videos) {
      position += 1;
      videos.push({
        '@type': 'VideoObject',
        '@id': `${seiteUrl}#video-${b.videoId}`,
        position,
        name: b.titel,
        // Die gepruefte Zusammenfassung ist die Beschreibung. Sie ist indirekte
        // Rede und nie Wortlaut — dieselbe Quelle, die der Mensch daneben liest.
        description: b.zusammenfassung,
        thumbnailUrl: vorschaubild(b.videoId),
        uploadDate: b.veroeffentlicht,
        duration: b.dauer,
        embedUrl: `https://www.youtube-nocookie.com/embed/${b.videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${b.videoId}`,
        url: `${seiteUrl}#${g.slug}`,
        inLanguage: b.sprache,
        actor: {'@id': `${seiteUrl}#person-${g.slug}`},
        publisher: organisation,
        creator: organisation,
      });
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${seiteUrl}#erfahrungen`,
        url: seiteUrl,
        name: 'Erfahrungen mit Qi Blanco',
        description:
          `${gruppen.length} Menschen berichten in ${videos.length} eigenen ` +
          'Videos, was sie mit QiOne, QiBracelet und QiHome Air erlebt haben.',
        inLanguage: 'de-DE',
        isPartOf: {'@type': 'WebSite', url: CANONICAL_ORIGIN, name: 'Qi Blanco'},
        about: organisation,
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${seiteUrl}#brotkrumen`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Startseite',
            item: `${CANONICAL_ORIGIN}/`,
          },
          {'@type': 'ListItem', position: 2, name: 'Erfahrungen', item: seiteUrl},
        ],
      },
      ...personen,
      {
        '@type': 'ItemList',
        '@id': `${seiteUrl}#videoliste`,
        name: 'Erfahrungsberichte auf Video',
        numberOfItems: videos.length,
        itemListElement: videos,
      },
    ],
  };
}
