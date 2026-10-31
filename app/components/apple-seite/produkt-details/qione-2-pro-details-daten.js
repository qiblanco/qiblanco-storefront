/*
 * APPLE-FASSUNG /pages/qione-2-pro-details (Grossjob 20261029-GROSSJOB-alle-
 * shop-seiten-apple-niveau-ausser-seo-geo, s05; Christian Z3 nennt die Seite).
 *
 * Die Seite erklärt das Gerät, die Kaufseite /products/qione-2-pro verkauft
 * es. Deshalb: wenige Abschnitte, ein Gedanke je Abschnitt, jeder Kaufknopf
 * führt auf die Kaufseite (mit Preis daneben, Sicht-Tor kaufknopf_kontext).
 *
 * Texte: Bestand der live Apple-Kaufseite (product-pages/qione-2-pro-alpha-
 * daten.js, PR + Sales frei) und die Expertenstimmen der heutigen Seite im
 * Wortlaut (ganze Sätze, nichts umgestellt). Kein Preisanker, keine Note,
 * keine Nutzerzahl (Christian 29.10.2026).
 */

import {PRODUKT_VIDEOS, WIE_FUNKTIONIERT_PFAD} from '../../../data/produkt-videos.js';
import {wasserstruktur} from '../../../data/kohaerente-wasserstruktur.js';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750';

export const KAUFSEITE = '/products/qione-2-pro';

const BILD = Object.freeze({
  qione: {
    url: `${CDN}/files/qb-video360-ersatzbild--360-qione-front-1440--f0024fcab5ec.jpg?v=1793414659`,
    // 360-Grad-Drehung an dieser Stelle (AsBild -> Produkt360Video), das Bild bleibt Ersatzbild.
    drehung: 'qione',
    alt: 'QiOne® 2 Pro von vorn, Gehäuse aus Chirurgenstahl mit goldenem Gitterchip®',
    breite: 1440,
    hoehe: 1440,
  },
  gitterchip: {
    url: `${CDN}/files/QiOne_Gitterchip-1680.webp?v=1793415850`,
    alt: 'Gitterchip® des QiOne® 2 Pro: goldfarbene Scheibe mit gleichmäßigem, wabenartigem Gittermuster',
    breite: 1680,
    hoehe: 1680,
  },
  hand: {
    url: `${CDN}/products/2021-04-qiblanco-bali-16_e66b45ce-857c-4bd8-a123-05e0b2d4229e.jpg?v=1698259307`,
    alt: 'QiOne® 2 Pro an der Kette in einer offenen Hand',
    breite: 2579,
    hoehe: 2579,
  },
});

/** Das Video der heutigen Seite (60 s), mit Vorschaubild. */
export const VIDEO = Object.freeze({
  titel: 'Der QiOne® 2 Pro in 60 Sekunden.',
  pfad: 'VIDEO-QiOne60s-DE-2021.mov',
  poster: `${CDN}/files/fallback-image-qione-detail.webp?v=1747735933`,
});

/** Platzhalter für die zwei Videos (eigene Kinder, kein Baukasten-Typ). */
export const VIDEO_PLATZ = Object.freeze({art: 'video'});
export const MIKROSKOP_PLATZ = Object.freeze({art: 'mikroskop'});

/*
 * SO WIRKT ER: die Technik in vier Schritten, je kurz und mit „Mehr erfahren“
 * (Auftrag 20261030-update-shop-startseite-detailseite-technologie-wissen-
 * mehr-knopf). Anna 30.10.2026: „Es ist zu wenig Detailwissen für die
 * Technologien … Da muss ein Button kommen für mehr.“ Christian, selber Abend:
 * „von statisches Feld erzeugt kohärentes Wasser und dann unten drunter, was
 * macht kohärentes Wasser im Körper?“ Die Reihenfolge der Schritte ist seine.
 *
 * TEXTE: Christians Wortlaut, wo es ihn gibt, wortgleich (Gitterchip,
 * 16.09.2026 Qi-Master-Spalte; Superzustand und rote Blutkörperchen,
 * 20.09.2026 Wirkprinzip; „Fünf publizierte Studien …“, 20.09.2026
 * Kopfabsatz). „GitterChip™“ steht dort als Gitterchip® (Christian
 * 28.10.2026). Alles andere aus dem Bestand mit Fundstelle: Gitterchip-
 * Seite, Info-Seite kohärentes Wasser, die fünf Dartsch-Studien
 * (app/data/studien/e000*.json). Geprüft mit stimme check, stil-pruefe,
 * Sprach- und Menschlichkeits-Prüfung und dem PR-Chef (RESULT des Jobs).
 *
 * „Mehr“ ist ein <details>: der ausführliche Text steht im Server-HTML (GEO
 * R2), ohne JavaScript bedienbar. Jeder Schritt trägt ein Bild, ein Video
 * oder eine Animation (`medium`). Die Probe am Kundenrand liest
 * [data-tk-schritt], [data-tk-mehr] und [data-tk-medium].
 */
const VIDEO_GITTERCHIP = PRODUKT_VIDEOS['qione-2-pro'].videos.find((v) => v.id === 'gitterchip-in-aktion');
const VIDEO_ZELLEN = PRODUKT_VIDEOS['qione-2-pro'].videos.find((v) => v.id === 'zellen-qione-2-pro');

/** Platzhalter in der Sektionsliste (eigenes Kind, kein Baukasten-Typ). */
export const TECHNIK_PLATZ = Object.freeze({art: 'technik'});

export const TECHNIK = Object.freeze({
  etikett: 'So wirkt er',
  titel: 'Vom Gitterchip® bis in deine Zellen.',
  schritte: [
    {
      id: 'feld',
      kurzname: 'Feld',
      etikett: 'Schritt 1 · Das statische Feld',
      titel: 'Ein Gitter aus Gold, das ohne Strom arbeitet.',
      kurz: [
        'Im Kern sitzt der Gitterchip® 2.0: eine Goldlegierung, deren Atome in einer einmalig definierten Ordnung stehen. Kohärent wirkend und ihre Umgebung aktiv prägend.',
        // Christian 30.10.2026 wortgleich (Gespräch mit Anna, Auftrag dieses Umbaus).
        'Das statische Feld erzeugt kohärentes Wasser.',
      ],
      medium: {art: 'bild', bild: BILD.gitterchip},
      mehr: {
        knopf: 'Mehr zum Gitterchip®',
        absaetze: ['Der Gitterchip® braucht weder Akku noch Strom.'],
        // Grundlage des statischen Felds: Materialbeschreibung in e0001 (Methodenteil).
        quellen: [
          'Dartsch, P. C. (2021): QiOne® 2 Pro – Investigations on its Potential for the Exclusion of Unwanted Cellular Effects of Mobile Phone Radiation. Japan Journal of Medicine. Darin beschrieben: ein Gitterchip® aus einer Goldlegierung, der ein statisches Feld erzeugt.',
        ],
        liste: {
          titel: 'Was in ihm steckt',
          punkte: [
            {titel: 'Gitterchip® 2.0', text: '750er Goldlegierung, von Hand fertiggestellt.'},
            {titel: 'Gehäuse', text: 'Chirurgenstahl, wasserfest in Sauna, Meer und Chlor.'},
            {titel: 'Herkunft', text: 'Entwickelt und gefertigt in Deutschland.'},
          ],
        },
        link: {text: 'Wie funktioniert der Gitterchip® im QiOne?', href: WIE_FUNKTIONIERT_PFAD},
      },
    },
    {
      id: 'wasser',
      kurzname: 'Wasser',
      etikett: 'Schritt 2 · Kohärentes Wasser',
      titel: 'Aus normalem Wasser wird geordnetes Wasser.',
      kurz: [
        'Der Gitterchip® ermöglicht es den umliegenden Wassermolekülen, in den kohärenten Zustand überzugehen – den Superzustand des Wassers. Aus normalem Wasser wird energetisch hoch aufgeladenes Wasser, mit deutlich mehr Elektronenvolt.',
      ],
      medium: {
        art: 'video',
        mp4: VIDEO_GITTERCHIP.mp4,
        poster: VIDEO_GITTERCHIP.poster,
        breite: 1920,
        hoehe: 1080,
        dauer_s: VIDEO_GITTERCHIP.dauer_s,
        legende: 'Über dem Gitterchip® ordnen sich Wassermoleküle zu Sechsecken.',
      },
      mehr: {
        knopf: 'Was ist kohärentes Wasser?',
        absaetze: [
          'Kohärent heißt: im Gleichtakt. Das beschreibt ein Modell von Prof. Giuliano Preparata und Prof. Emilio Del Giudice. Darin schwingen rund sechs Millionen Wassermoleküle zusammen, wie ein Chor im selben Takt.',
          'Dr. Ulrich Warnke beschreibt in seinem Buch „Bionisches Wasser“, wie Wasser Energie aufnimmt und sich dabei zu Sechsecken ordnet.',
        ],
        quellen: wasserstruktur.quelle.filter((q) => !q.startsWith('Pollack')),
        link: {text: 'Im Video erklärt Christian die kohärente Struktur, 8 Minuten.', href: 'https://www.youtube.com/watch?v=6rNuQoIrdZQ', extern: true},
      },
    },
    {
      id: 'zelle',
      kurzname: 'Körper',
      etikett: 'Schritt 3 · Im Körper',
      titel: 'Was macht kohärentes Wasser im Körper?',
      kurz: [
        'Der QiOne® 2 Pro strukturiert dort Wasser, wo es darauf ankommt. In deinen Zellen. Das ist die Grundlage für Zellprozesse im Körper: Sie verfügen über mehr Energie, etwa für die Verformung der roten Blutkörperchen, die sich falten müssen, um die engen Kapillaren zu passieren.',
      ],
      medium: {
        art: 'animation',
        legende: 'An der Zelle wächst eine geordnete Wasserschicht und schiebt gelöste Teilchen hinaus. Nach Prof. Dr. Pollack.',
      },
      mehr: {
        knopf: 'Was passiert an der Zelle?',
        absaetze: [
          'Jede Zelle ist von Wasser umgeben und besteht selbst zum größten Teil daraus. Prof. Dr. Gerald Pollack erforscht an der University of Washington, was Wasser an solchen Oberflächen tut.',
          'Er hat gemessen: An wasserliebenden Oberflächen bildet sich eine Schicht, die gelöste Teilchen hinausschiebt. Er beschreibt sie als sechseckige Schichten und nennt sie Ausschlusszone, kurz EZ. Prof. Dr. Pollack nennt sie die vierte Phase des Wassers, neben fest, flüssig und gasförmig.',
          'Er vergleicht sie mit einer Batterie: innen negativ geladen, davor positiv, und Licht lädt sie auf.',
        ],
        quellen: wasserstruktur.quelle.filter((q) => q.startsWith('Pollack')),
        link: {text: 'Was ist kohärentes Wasser?', href: '/pages/was-ist-kohaerentes-wasser'},
      },
    },
    {
      id: 'forschung',
      kurzname: 'Forschung',
      etikett: 'Schritt 4 · Was die Forschung zeigt',
      titel: 'Was Zellen im Labor unter Strahlung zeigen.',
      kurz: [
        'Prof. Dr. Peter C. Dartsch hat den QiOne® 2 Pro an menschlichen Zellen getestet, unter E-Smog, also der unsichtbaren Strahlung von Handy und WLAN. Im Labor zeigten die Zellen mit dem QiOne® 2 Pro deutlich bessere Werte.',
      ],
      // Werte wie die Gitterchip-Seite (app/data/gitterchip-seite.js, je mit
      // Fundstelle): e0001 laienSummary 60,5/84,7 % der unbestrahlten
      // Kontrolle; e0002 Abb. 5 TEER relativ zur Kontrolle 6,0/72,6 %;
      // e0002 Abb. 3 geschlossene Fläche 56,3/85,5 %.
      zahlen: [
        {
          titel: 'Abwehrleistung von Immunzellen unter Handystrahlung',
          einheit: 'im Vergleich zu Zellen ohne Strahlung',
          ohne: '60,5 %',
          mit: '84,7 %',
          quelle: {text: 'Dartsch, Japan Journal of Medicine 2021', href: '/pages/studie-immunzellen'},
        },
        {
          titel: 'Wie dicht die Zellschicht unter E-Smog hält',
          einheit: 'im Vergleich zu Zellen ohne Strahlung',
          ohne: '6,0 %',
          mit: '72,6 %',
          quelle: {text: 'Dartsch, Applied Cell Biology 2021', href: '/pages/studie-darmbarriere'},
        },
        {
          titel: 'Wie weit Zellen eine künstlich gesetzte Lücke unter E-Smog wieder schließen',
          einheit: 'geschlossene Fläche',
          ohne: '56,3 %',
          mit: '85,5 %',
          quelle: {text: 'Dartsch, Applied Cell Biology 2021', href: '/pages/studie-darmbarriere'},
        },
      ],
      medium: {
        art: 'video',
        mp4: VIDEO_ZELLEN.mp4,
        poster: VIDEO_ZELLEN.poster,
        breite: 1080,
        hoehe: 1080,
        dauer_s: VIDEO_ZELLEN.dauer_s,
        legende: 'Darmzellen unter E-Smog im Mikroskop: oben ohne, unten mit der Gitterchip®-Technik.',
      },
      mehr: {
        knopf: 'Mehr zu den fünf Studien',
        absaetze: [
          'Fünf publizierte Studien – so gut untersucht ist in diesem Bereich sonst kein Produkt. Mit der Gitterchip®-Technik hat Prof. Dr. Dartsch auch Leberzellen unter oxidativem Stress gemessen, einer Art Rost in der Zelle, und Nervenzellen neben dem QiHome® Air.',
          'Die fünfte Publikation wertet 171 Erfahrungsberichte von Menschen aus, die den QiOne® 2 Pro oder das QiBracelet® tragen. Am häufigsten erzählten sie von mehr Ruhe und Gelassenheit, von tieferem Schlaf und von mehr Energie.',
        ],
        quellen: [
          'Dartsch, P. C. (2024): Protective Effect of the QiBracelet® Against Oxidative Stress. Applied Cell Biology.',
          'Dartsch, P. C. (2026): Beneficial Effect of the QiHome® Air on Cultured Neuronal and Inflammation-Mediating Cells. Neurodegenerative Diseases: Current Research.',
          'Dartsch, P. C. (2024): QTA Gitterchip Technology: Relationship Between Individual User Observations and Experimental Preclinical Data. Advances in Bioengineering & Biomedical Science Research.',
        ],
        link: {text: 'Alle fünf Studien', href: '/pages/studien'},
      },
    },
  ],
});

export const QIONE_2_PRO_DETAILS = Object.freeze([
  {
    art: 'hero',
    overline: 'QiOne® 2 Pro im Detail',
    titel: 'Der QiOne® 2 Pro',
    unter: 'Messbare Effekte auf Zellebene.',
    bild: BILD.qione,
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  TECHNIK_PLATZ,
  {
    art: 'fakten',
    titel: 'Gebaut für ein ganzes Leben.',
    kacheln: [
      {zahl: 'Jahrzehnte', titel: 'Vererbbar', satz: 'Erst trägst du ihn. Dann die nächste Generation.'},
      {zahl: 'Wasserfest', titel: 'Überall mit dir', satz: 'Sauna, Meer, Chlor, Schweiß, Sonne. Er bleibt dran.'},
      {zahl: '8×', titel: 'Leistungsvolumen', satz: 'Achtmal so viel wie der QiOne® 1.'},
    ],
  },
  VIDEO_PLATZ,
  {
    art: 'stimmen',
    titel: 'Was Menschen sagen, die damit arbeiten.',
    stimmen: [
      {
        text: 'Der QiOne® spielte von Anfang an in einer anderen Liga.',
        quelle: 'Matthias Cebula, Dipl. Ernährungspädagoge',
      },
      {
        text: 'Der QiOne gibt mir gerade in Gebäuden, in denen ich mich nicht vor Elektrosmogbelastung oder Fremdenergien schützen kann, das Gefühl der maximalen Sicherheit.',
        quelle: 'Daniela Cebula',
      },
      {
        text: 'Ich hab damit vom ersten Tag an eine Veränderung gespürt.',
        quelle: 'Patrick Thiele, Mentaltrainer für Spitzensportler',
      },
    ],
  },
  {
    art: 'faq',
    titel: 'Deine Fragen zum QiOne® 2 Pro.',
    fragen: [
      {
        f: 'Wie trage ich den QiOne® 2 Pro?',
        a: 'Du trägst ihn, wo du willst: an der Kette um den Hals oder in der Hosentasche, nah am Körper. Manche erleben die ersten Tage als intensiv. Dann trag ihn über der Kleidung oder leg ihn nachts ab, bis du dich an ihn gewöhnt hast.',
      },
      {
        f: 'Wie lange hält der QiOne® 2 Pro?',
        a: 'Jahrzehnte. Ohne Akku und ohne Elektronik gibt es nichts, das leer wird. Du trägst ihn, solange du willst, und vererbst ihn dann.',
      },
      {
        f: 'Kann ich ihn zurückgeben, wenn er nicht zu mir passt?',
        a: 'Ja. Du testest ihn 20 Tage zu Hause, ab dem Tag, an dem er bei dir ankommt. Passt er nicht, schickst du ihn kostenlos zurück. Du bekommst den vollen Kaufpreis erstattet.',
      },
    ],
  },
  {
    art: 'cta',
    titel: '20 Tage zu Hause testen.',
    text: 'Passt er nicht, bekommst du den vollen Kaufpreis zurück.',
    cta: {text: 'Jetzt kaufen', href: KAUFSEITE},
  },
  {art: 'anna'},
]);
