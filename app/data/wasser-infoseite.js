import {bilder, stufen} from '~/data/kohaerente-wasserstruktur';
import {AUTORENKASTEN} from '~/lib/autorenkasten';
import {absoluteCanonical} from '~/lib/seo';
import {isoMitZone} from '~/lib/datum';

/**
 * DER INHALT DER INFO-SEITE „KOHÄRENTES WASSER" — /pages/was-ist-kohaerentes-wasser.
 *
 * Auftrag: Großjob vom 23.09.2026 „Info-Seite kohärentes Wasser"
 * (Christian, 23.09.2026). Zwei Teile: „einfach erklärt" für den Laien, dann
 * „harte Fakten" mit Quellen. Jede Zahl trägt ihre Fundstelle als Zitatmarke
 * {q:id}; das Quellenverzeichnis unten nennt Werk, DOI oder PubMed-Link und
 * die Kernaussage. Die DOIs sind am 2026-09-23 einzeln gegen doi.org und
 * Crossref geprüft (Prüfbericht im Jobordner, QUELLEN-VERIFIZIERT-20260923.md).
 *
 * EINE ZAHLENHALTUNG FÜR DIE DREI STUFEN. Winkel, Formel, Energieniveau,
 * Dichte und Abstand der kohärenten Wasserstruktur stehen im Brain-SSoT
 * (im qi-brain unter brain/Marketing, die Wasserstruktur-Gegenüberstellung)
 * und kommen über das Datenmodul der Wasserstruktur hierher. Diese Datei
 * setzt sie in Sätze ein (Template-Literale), sie tippt sie nicht ein zweites
 * Mal. Die drei im SSoT als widerlegt geführten Werte stehen hier nicht.
 *
 * GRENZEN, die jeder Satz hier einhält (Christian, GL-SPR-0008 und die
 * Hausregeln):
 *  - Die Seite beschreibt Wasser, nicht den menschlichen Körper. Kein Satz
 *    verspricht eine Wirkung auf Gesundheit, Zellen oder Krankheiten.
 *  - Was gemessen ist, steht als Messung; was ein Modell erklärt, steht als
 *    Modell. Die Aussageklasse steht als Überschrift über dem Abschnitt,
 *    nicht als Vorbehalt im Satz.
 *  - Keine Selbstentwertung, kein Katalog der Kritik.
 *  - Hausstimme: Antwort zuerst, ein Gedanke je Satz, kein Satz über die
 *    Seite selbst (homepage-bauer/bin/stil-pruefe misst es).
 */

const WINKEL = bilder.find((b) => b.id === 'winkel');
const DOMAENE = bilder.find((b) => b.id === 'domaene');
const STUFE = Object.fromEntries(stufen.map((s) => [s.id, s]));
// Nur die Dichte: den Abstand aus dem SSoT zeigt diese Seite nicht (keine
// Primärquelle, Prüfbericht Abschnitt C; offene Flanke an den SSoT-Eigner).
const [DICHTE] = DOMAENE.schwellen;
const VON = WINKEL.von.anzeige;
const NACH = WINKEL.nach.anzeige;
const ENERGIE = DOMAENE.energie.anzeige;
const FORMEL_EZ = STUFE.ez.formel;

export const PFAD = '/pages/was-ist-kohaerentes-wasser';

/**
 * DATUM ALS KONSTANTE, NICHT ALS LAUFZEIT-UHR: ein `dateModified`, das sich
 * bei jedem Abruf bewegt, behauptet eine Pflege, die nicht stattfindet. WER
 * DEN TEXT ÄNDERT, ZIEHT `GEAENDERT` NACH — und `lastmod` in NUR_ROUTE_SEITEN
 * (app/lib/seo.js) im selben Commit.
 */
const VEROEFFENTLICHT = '2026-09-23';
const GEAENDERT = '2026-09-23';

export const SEITE = {
  pfad: PFAD,
  titel: 'Kohärentes Wasser einfach erklärt, mit Quellen | Qi Blanco',
  beschreibung:
    'Kohärentes und hexagonales Wasser einfach erklärt: Winkel, kohärente Domäne, EZ-Wasser. Dann die harten Fakten mit animierten Grafiken und Primärquellen.',
  marke: 'Deep Dive',
  h1: 'Was ist kohärentes Wasser?',
  unterzeile:
    'Was es ist, woher es kommt und was es von normalem Wasser unterscheidet. Erst einfach erklärt, dann mit harten Fakten und Primärquellen.',
  kurzTitel: 'Kurz gesagt',
  kurz: 'Kohärentes Wasser ist Wasser, dessen Moleküle sich ordnen und gemeinsam verhalten. In normalem Wasser lösen sich die Verbindungen zwischen den Molekülen ständig und bilden sich neu. Im kohärenten Zustand schwingen die Moleküle im Gleichtakt, in sogenannten kohärenten Domänen. An wasserliebenden Oberflächen legen sie sich zu stabilen, sechseckigen Schichten, die Prof. Dr. Gerald H. Pollack EZ-Wasser nennt.',
  autorName: AUTORENKASTEN.name,
  autorRolle: AUTORENKASTEN.rolle,
  autorZeile: `Von ${AUTORENKASTEN.name}`,
  veroeffentlicht: isoMitZone(VEROEFFENTLICHT),
  geaendert: isoMitZone(GEAENDERT),
  standAnzeige: '23. September 2026',
  standZeile:
    'Stand: 23. September 2026. Jede Zahl trägt ihre Quelle. Neue Veröffentlichungen nehmen wir auf, sobald sie erscheinen.',
  leitLegende: `Nimmt das Wassermolekül Energie auf, weitet sich sein Winkel von ${VON} auf ${NACH}. Dann ordnen sich die Nachbarn zu einem Sechseck.`,
};

export const INHALT = [
  {id: 'einfach', titel: 'Teil 1: einfach erklärt'},
  {id: 'fakten', titel: 'Teil 2: harte Fakten'},
  {id: 'stufen', titel: 'Die drei Stufen im Vergleich'},
  {id: 'begriffe', titel: 'Hexagonal, strukturiert, kohärent: die Begriffe'},
  {id: 'fragen', titel: 'Häufige Fragen'},
  {id: 'quellen', titel: 'Quellen'},
];

/* ======================================================================== */
/* TEIL 1 — EINFACH ERKLÄRT                                                 */
/* ======================================================================== */

export const TEIL_EINFACH = {
  id: 'einfach',
  nr: 'Teil 1',
  titel: 'Kohärentes Wasser einfach erklärt',
  einleitung:
    'Vier Fragen, vier kurze Antworten. Ohne Formeln, dafür mit Bildern.',
  abschnitte: [
    {
      id: 'gleichtakt',
      titel: 'Was heißt kohärent?',
      absaetze: [
        'Kohärent heißt: im Gleichtakt. Kohärentes Wasser ist Wasser, in dem viele Moleküle dasselbe tun, statt jedes für sich.',
        'Stell dir einen Chor vor. In normalem Wasser singt jedes Molekül seine eigene Melodie, und die Verbindungen zu den Nachbarn wechseln ständig. In kohärentem Wasser singen viele Moleküle im selben Takt, nach dem Modell von Del Giudice rund sechs Millionen in einer einzigen Domäne {q:delgiudice2010}.',
      ],
    },
    {
      id: 'woher',
      titel: 'Woher kommt es?',
      absaetze: ['Drei Dinge bringen Wasser in Ordnung.'],
      karten: [
        {
          titel: 'Oberflächen',
          text: 'Wo Wasser eine wasserliebende Fläche berührt, ordnet es sich zu einer Schicht. Gele, Kunststoffe, Pflanzenfasern und manche Metalle sind solche Flächen {q:zheng2006}{q:chai2012}.',
        },
        {
          titel: 'Licht',
          text: 'Licht lässt die geordnete Schicht wachsen, am stärksten Infrarot. Nach einer Stunde war sie im Versuch sechsmal so breit {q:chai2009}.',
        },
        {
          titel: 'Nähe',
          text: 'Rücken die Moleküle eng genug zusammen, beginnen sie gemeinsam zu schwingen. So entsteht nach dem Modell von Preparata und Del Giudice eine kohärente Domäne {q:arani1995}.',
        },
      ],
    },
    {
      id: 'unterschied',
      titel: 'Was ist der Unterschied zu normalem Wasser?',
      stufenbilder: true,
      video: true,
      absaetze: [
        'Normales Wasser ist ständig in Bewegung: Die Brücken zwischen seinen Molekülen halten nur Billionstel Sekunden {q:fecko2003}. Geordnetes Wasser hält seine Form. Drei Schritte führen dorthin.',
      ],
      nachGrafik: [
        `Der Winkel ist der erste Schritt. Im freien Wassermolekül stehen die beiden Wasserstoff-Atome im Winkel von ${VON} zueinander {q:csaszar2005}. Nach dem Modell von Dr. Ulrich Warnke weitet sich der Winkel auf ${NACH}, wenn das Molekül Energie aufnimmt {q:warnke2019}. ${NACH} ist der Winkel, in dem die Moleküle im Eis ihr sechseckiges Gitter bilden {q:kuhs1981}.`,
      ],
    },
    {
      id: 'was-bringt-es',
      titel: 'Was bringt es?',
      absaetze: [
        'Geordnetes Wasser verhält sich messbar anders als gewöhnliches Wasser. Vier Eigenschaften:',
      ],
      karten: [
        {
          titel: 'Ordnung, die hält',
          text: 'An einer Oberfläche bleibt die geordnete Schicht bestehen, typischerweise mehrere hundert Mikrometer breit {q:zheng2006}.',
        },
        {
          titel: 'Getrennte Ladung',
          text: 'Die geordnete Schicht ist negativ geladen, das Wasser davor positiv {q:das2013}. Prof. Dr. Pollack vergleicht das mit einer Batterie.',
        },
        {
          titel: 'Energie aus Licht',
          text: 'Unter Licht wächst die Schicht, und vor ihr sammelt sich Säure {q:chai2009}. Aus Strahlung wird so Ordnung und getrennte Ladung.',
        },
        {
          titel: 'Eine Zone, die frei bleibt',
          text: 'Die Schicht schiebt gelöste Teilchen hinaus {q:zheng2003}. Daher kommt ihr Name: Ausschlusszone, englisch Exclusion Zone, kurz EZ.',
        },
      ],
    },
  ],
};

/* ======================================================================== */
/* TEIL 2 — HARTE FAKTEN                                                    */
/* ======================================================================== */

export const TEIL_FAKTEN = {
  id: 'fakten',
  nr: 'Teil 2',
  titel: 'Kohärentes Wasser: harte Fakten',
  einleitung:
    'Jede Zahl mit ihrer Fundstelle. Über jedem Abschnitt steht, ob er eine Messung beschreibt oder ein Modell.',
  abschnitte: [
    {
      id: 'wassermolekuel',
      titel: 'Das Wassermolekül und das Eis',
      klasse: 'Messung',
      absaetze: [
        `Ein Wassermolekül besteht aus einem Sauerstoff-Atom und zwei Wasserstoff-Atomen. Im freien Molekül stehen die beiden Bindungen im Winkel von 104,48° zueinander, gerundet ${VON} {q:csaszar2005}.`,
        'Im Eis sitzt jedes Molekül in der Mitte eines Tetraeders aus vier Nachbarn {q:kuhs1981}. Der Tetraederwinkel beträgt 109,47°, in Grad und Minuten 109° 28′. Aus diesen Tetraedern baut sich das sechseckige Gitter des gewöhnlichen Eises auf, Eis Ih {q:bernal1933}.',
        'Wasser ist dabei ein ungewöhnlicher Stoff. Am dichtesten ist es nicht als Eis, sondern bei 3,983 °C mit 999,975 kg/m³ {q:tanaka2001}. Deshalb schwimmt Eis, und Seen frieren von oben zu.',
      ],
    },
    {
      id: 'winkel-modell',
      titel: 'Der Winkel im Modell von Dr. Warnke',
      klasse: 'Modell',
      absaetze: [
        `Dr. Ulrich Warnke beschreibt den Weg zu geordnetem Wasser über den Winkel: Nimmt das Molekül Energie auf, weitet sich der Winkel von ${VON} auf ${NACH} {q:warnke2019}{q:warnke2018}.`,
        'Bei 109° 28′ entstehen nach seinem Modell die hexagonalen Strukturen, aus denen kohärente Domänen und EZ-Wasser bestehen {q:warnke2019}. Das ist genau der Tetraederwinkel des Eises. Das Modell verbindet so die gemessene Geometrie des Eises mit dem geordneten Zustand im flüssigen Wasser.',
        'In seinem Buch „Bionisches Wasser", geschrieben mit Florian Warnke, führt Dr. Warnke die Arbeiten von Pollack, Del Giudice und Preparata zusammen {q:warnke2019}.',
      ],
    },
    {
      id: 'bruecken',
      titel: 'Wasserstoffbrücken: ein Netz, das sich ständig umbaut',
      klasse: 'Messung',
      absaetze: [
        'Jedes Wassermolekül kann über Wasserstoffbrücken an bis zu vier Nachbarn binden {q:nilsson2015}.',
        'Im flüssigen Wasser sind diese Brücken extrem kurzlebig. Eine Brücke schwingt mit einer Periode von 170 Femtosekunden, und das ganze Netz ordnet sich innerhalb von 1,2 Pikosekunden um {q:fecko2003}. Eine gelöste Brücke findet nach weniger als 200 Femtosekunden einen neuen Partner {q:eaves2005}.',
        'Röntgenmessungen zeigen, dass die meisten Moleküle im flüssigen Wasser zwei starke Brücken tragen, nicht vier wie im Eis {q:wernet2004}. Die Struktur schwankt zwischen einer tetraedrisch geordneten und einer ungeordneten Anordnung {q:nilsson2015}.',
      ],
      grafik: {
        typ: 'bruecken',
        werte: {
          links: {
            titel: 'normales Wasser',
            text: 'Brücken wechseln in Pikosekunden',
          },
          rechts: {titel: 'geordnet', text: 'ein sechseckiges Netz'},
        },
        legende:
          'Links lösen sich die Brücken ständig und bilden sich neu. Rechts halten sie ein sechseckiges Netz wie im Eis.',
      },
    },
    {
      id: 'domaenen',
      titel: 'Kohärente Domänen: das Modell von Preparata und Del Giudice',
      klasse: 'Modell',
      absaetze: [
        '1988 beschrieben die Physiker Emilio Del Giudice, Giuliano Preparata und Giuseppe Vitiello Wasser mit den Mitteln der Quantenelektrodynamik {q:delgiudice1988}. Nach ihrem Modell schwingen die Moleküle in kleinen Bereichen im Gleichtakt mit einem gemeinsamen elektromagnetischen Feld.',
        'Diese Bereiche heißen kohärente Domänen. Eine Domäne misst 75 bis 100 Nanometer und enthält rund sechs Millionen Moleküle {q:preparata1995}{q:delgiudice2010}.',
        `Die Moleküle einer Domäne schwingen zwischen ihrem Grundzustand und einem angeregten Zustand bei ${ENERGIE}. Das liegt knapp unter 12,60 eV, der Schwelle, an der ein Elektron das Molekül verlässt {q:delgiudice2010}{q:delgiudice2015}.`,
        `Ab einer kritischen Dichte gehen die Moleküle in den kohärenten Zustand über. Für das Niveau von ${ENERGIE} berechnet Preparata ${DICHTE.anzeige} {q:preparata1995}. Flüssiges Wasser besteht nach dem Modell bei jeder Temperatur aus beiden Anteilen, die ständig ineinander übergehen {q:arani1995}. Eine ausführliche Herleitung geben Bono, Del Giudice, Gamberale und Henry {q:bono2012}.`,
      ],
      grafik: {
        typ: 'domaene',
        werte: {
          energie: ENERGIE,
          groesse: '0,1 µm',
          innen: 'Domäne',
          aussen: 'dazwischen ungeordnet',
        },
        legende:
          'Außen schwingt jedes Molekül für sich, in der Domäne alle im selben Takt. Modell nach Del Giudice und Preparata.',
      },
    },
    {
      id: 'ez-wasser',
      titel: 'EZ-Wasser: die Ausschlusszone an Oberflächen',
      klasse: 'Messung',
      absaetze: [
        '2003 beobachteten Jian-Ming Zheng und Gerald H. Pollack an der University of Washington eine Zone vor wasserliebenden Gelen, aus der gelöste Mikrokugeln verdrängt werden. Die Zone war rund 100 Mikrometer breit, und die Autoren zeigten, dass sie kein Messartefakt ist {q:zheng2003}.',
        'Diese Ausschlusszone, englisch Exclusion Zone, gab dem EZ-Wasser seinen Namen. Sie ist typischerweise mehrere hundert Mikrometer breit und bildet sich an Hydrogelen, Polymeren, Monolagen und Ionentauschern {q:zheng2006}. Neben dem übrigen Wasser besteht sie unbegrenzt {q:zheng2006}.',
        'Auch an Metallen wie Zink entsteht sie, dort bis etwa 200 Mikrometer breit {q:chai2012}. In den Leitgefäßen von Pflanzen misst sie beim Kürbis bis 240 Mikrometer {q:wang2024}. An Kügelchen wächst sie mit dem Durchmesser der Kugel {q:nhan2011}.',
        'Eine unabhängige Gruppe der Semmelweis-Universität Budapest hat die Zone mit optischen Pinzetten vermessen: An Nafion überschreitet sie binnen Minuten 100 Mikrometer {q:huszar2014}. Mehrere Labore haben sie inzwischen beschrieben {q:elton2020}.',
      ],
      grafik: {
        typ: 'ausschlusszone',
        werte: {
          oberflaeche: 'wasserliebende Oberfläche',
          zone: 'Ausschlusszone (EZ)',
          verdraengt: 'Teilchen werden verdrängt',
          ladungZone: 'negativ geladen',
          ladungWasser: 'positiv geladen',
          breite: 'Breite: 100 bis einige 100 µm',
        },
        legende:
          'An einer wasserliebenden Oberfläche wächst die Zone und schiebt gelöste Teilchen hinaus. Sie ist negativ geladen, das Wasser davor positiv.',
      },
    },
    {
      id: 'skala',
      titel: 'Vom Molekül zur Zone: die Größen',
      absaetze: [
        'Die drei Stufen spielen auf sehr verschiedenen Größen. Zwei benachbarte Moleküle trennen im flüssigen Wasser rund 0,31 Nanometer {q:preparata1995}. Eine Domäne ist im Modell etwa dreihundertmal so groß {q:delgiudice2010}, die Ausschlusszone noch einmal tausendmal größer {q:zheng2006}.',
      ],
      grafik: {
        typ: 'skala',
        werte: {
          achse: ['0,1 nm', '1 mm'],
          marken: [
            {was: 'Molekülabstand', anzeige: '0,31 nm', meter: 3.1e-10},
            {was: 'Domäne (Modell)', anzeige: '0,1 µm', meter: 1e-7},
            {
              was: 'Ausschlusszone',
              anzeige: '100 µm und mehr',
              meter: 1e-4,
              meterBis: 5e-4,
            },
          ],
        },
        legende:
          'Sieben Zehnerpotenzen auf einer Linie: jeder Strich ist zehnmal so groß wie der vorige.',
      },
    },
    {
      id: 'messungen',
      titel: 'Wie man die Zone misst',
      klasse: 'Messung',
      absaetze: [
        'Die Zone unterscheidet sich vom übrigen Wasser in mehreren Messgrößen. Jede lässt sich im Labor nachprüfen.',
      ],
      tabelle: {
        spalten: ['Methode', 'Befund'],
        zeilen: [
          [
            'Mikrokugeln unter dem Mikroskop',
            'Die Zone bleibt frei von Teilchen, 100 bis mehrere hundert Mikrometer breit {q:zheng2003}{q:zheng2006}',
          ],
          [
            'UV-Spektroskopie',
            'Absorptionsbande bei rund 270 Nanometern {q:chai2008}',
          ],
          [
            'Elektroden',
            'Negatives Potenzial gegenüber dem übrigen Wasser, rund −100 bis −200 mV {q:das2013}{q:pollack2009}',
          ],
          [
            'pH-Farbstoff',
            'Hinter der Zone sammelt sich Säure, der pH-Wert fällt unter 3 {q:chai2009}',
          ],
          [
            'Kernspinresonanz (NMR)',
            'Kürzere Relaxationszeiten und langsamere Selbstdiffusion als freies Wasser {q:yoo2011}',
          ],
          ['Fallkugel', 'Die Zone ist zäher als freies Wasser {q:pollack2013}'],
          [
            'Schmelzendes Eis',
            'Die 270-nm-Bande erscheint kurz und verschwindet im flüssigen Wasser {q:so2011}',
          ],
        ],
      },
      grafik: {
        typ: 'spektrum',
        werte: {
          maximumNm: 270,
          bereichNm: [200, 400],
          zoneText: 'EZ-Wasser: Maximum bei 270 nm',
          wasserText: 'übriges Wasser',
          achseText: 'Lichtabsorption im UV (schematisch)',
        },
        legende:
          'Schematisch nach Chai, Zheng, Zhao und Pollack 2008: EZ-Wasser absorbiert ultraviolettes Licht mit einem Maximum bei rund 270 Nanometern.',
      },
    },
    {
      id: 'formel',
      titel: `Warum die Formel ${FORMEL_EZ}?`,
      klasse: 'Modell',
      absaetze: [
        `Prof. Dr. Pollack beschreibt die Zone als Stapel flacher Wabenschichten. In jeder Schicht kommen auf zwei Sauerstoff-Atome drei Wasserstoff-Atome, und jede Wabeneinheit trägt eine negative Ladung. Daraus ergibt sich die Formel ${FORMEL_EZ} {q:pollack2013}.`,
        `Das Ion ${FORMEL_EZ} selbst ist in der Chemie gemessen. Es entsteht, wenn ein Hydroxid-Ion ein Wassermolekül bindet, und wurde als Ion in der Gasphase spektroskopisch untersucht {q:robertson2003}{q:diken2005}.`,
        'Pollacks Modell erklärt damit zweierlei: die negative Ladung der Zone und die Säure, die sich vor ihr sammelt {q:chai2009}.',
      ],
    },
    {
      id: 'licht',
      titel: 'Licht lässt die Zone wachsen',
      klasse: 'Messung',
      absaetze: [
        'Licht vergrößert die Ausschlusszone, umkehrbar und abhängig von der Wellenlänge {q:chai2009}.',
        'Am stärksten wirkt Infrarot bei 3,1 Mikrometern. Nach 10 Minuten war die Zone 3,7-mal so breit, nach 30 Minuten 4,7-mal und nach einer Stunde 6,1-mal {q:chai2009}. Schon schwaches Infrarot, das das Wasser um höchstens 1 °C erwärmte, vervierfachte sie in 10 Minuten {q:pollack2009}.',
        'Das passt zur Absorption des Wassers: Am stärksten schluckt Wasser Licht bei 2,95 Mikrometern, dort dringt es weniger als einen Mikrometer tief ein {q:hale1973}. Auch mittleres Infrarot wirkt, fünf Minuten vergrößern die Zone um den Faktor 1,41 {q:wang2021}.',
        'Während die Zone wächst, sammelt sich vor ihr Säure. Der pH-Wert fällt direkt dahinter unter 3 und bleibt bis 10 Millimeter Abstand gesenkt {q:chai2009}. Das Wasser trennt so Ladung. Prof. Dr. Pollack vergleicht das mit einer Batterie, die Licht auflädt {q:pollack2013}.',
      ],
      grafik: {
        typ: 'licht',
        werte: {
          ohne: 'ohne Infrarot',
          mit: 'mit Infrarot (3,1 µm)',
          licht: 'Infrarot',
          zusatz: 'Nach einer Stunde Infrarot ist die Zone 6,1-mal so breit.',
        },
        legende:
          'Schematisch nach Chai, Yoo und Pollack 2009: Unter Infrarot wächst die Zone, nach 10 Minuten auf das 3,7-Fache.',
      },
    },
    {
      id: 'stufen',
      titel: 'Von der Domäne zur Schicht: die drei Stufen',
      klasse: 'Modell',
      stufentafel: true,
      absaetze: [
        'Del Giudice und Kollegen verbinden die beiden Stränge. An wasserliebenden Oberflächen wird der kohärente Anteil größer und bleibt zeitlich stabil {q:delgiudice2013}. Aus Domänen-Wasser wird so EZ-Wasser {q:delgiudice2015}.',
        'Im kohärenten Zustand ist ein Elektron je Molekül nur schwach gebunden, mit rund 0,4 eV {q:delgiudice2013}. So ergeben sich drei Stufen mit wachsender Ordnung und Beständigkeit: normales Wasser, kohärente Domäne und EZ-Wasser {q:warnke2019}.',
      ],
    },
    {
      id: 'natur',
      titel: 'Grenzflächenwasser in der Natur',
      klasse: 'Messung',
      absaetze: [
        'Die Zone ist kein Sonderfall des Labors. Sie bildet sich an Cellulose, dem Baustoff der Pflanzen {q:sulbaran2014}. In den Leitgefäßen von Kohl, Sellerie und Spargel ist sie 133 bis 142 Mikrometer breit, beim Kürbis bis 240 Mikrometer, und sie verdrängt dort Kunststoff- wie Glaskügelchen {q:wang2024}.',
        'Beim Schmelzen von Eis erscheint die UV-Signatur der Zone für kurze Zeit. Pollacks Gruppe deutet die Zone deshalb als Zwischenstufe zwischen Eis und flüssigem Wasser {q:so2011}.',
      ],
    },
    {
      id: 'begriffe',
      titel: 'Hexagonales, strukturiertes, kohärentes Wasser: die Begriffe',
      begriffe: true,
      absaetze: [
        'Viele Namen meinen Ähnliches, aber nicht dasselbe. Hexagonal beschreibt die Form, kohärent das Verhalten, EZ den Ort.',
      ],
    },
  ],
};

/* ======================================================================== */
/* STUFENTAFEL, BEGRIFFE, VIDEO                                             */
/* ======================================================================== */

export const STUFENTAFEL = {
  titel: 'Die drei Stufen des Wassers im Vergleich',
  erklaerung: {
    normal:
      'Normales Wasser: Die Brücken zwischen den Molekülen lösen sich ständig und bilden sich neu. Das ist der Grundzustand.',
    domaene:
      'Kohärente Domäne: Inseln im Wasser, in denen die Moleküle im Gleichtakt schwingen. Sie wechseln ständig mit normalem Wasser.',
    ez: 'EZ-Wasser: An Oberflächen hält die Ordnung und wird zu sechseckigen Schichten. Das ist die beständigste der drei Stufen.',
  },
};

export const BEGRIFFE = {
  legende:
    'Acht Begriffe, die oft vermischt werden, und was jeder genau meint.',
  spalten: ['Begriff', 'Was gemeint ist', 'Herkunft'],
  zeilen: [
    {
      begriff: 'Kohärentes Wasser',
      bedeutung:
        'Wasser, dessen Moleküle im Gleichtakt schwingen (Domäne) oder sich an Oberflächen geordnet schichten (EZ).',
      herkunft:
        'Dr. Ulrich Warnke, nach dem Modell von Preparata und Del Giudice {q:warnke2019}',
    },
    {
      begriff: 'Kohärente Domäne',
      bedeutung:
        'Bereich von rund 0,1 µm, in dem Moleküle im Gleichtakt mit einem gemeinsamen Feld schwingen.',
      herkunft:
        'Del Giudice, Preparata und Vitiello, seit 1988 {q:delgiudice1988}',
    },
    {
      begriff: 'EZ-Wasser',
      bedeutung:
        'Geordnete, negativ geladene Schicht an wasserliebenden Oberflächen, die gelöste Teilchen ausschließt.',
      herkunft: 'Zheng und Pollack, seit 2003 {q:zheng2003}',
    },
    {
      begriff: 'Vierte Phase des Wassers',
      bedeutung:
        'Pollacks Name für EZ-Wasser, als Zustand zwischen Eis und flüssigem Wasser.',
      herkunft: 'Pollack 2013 {q:pollack2013}',
    },
    {
      begriff: 'Hexagonales Wasser',
      bedeutung:
        'Wasser mit sechseckiger Anordnung der Moleküle. Gemessen im Eis, im EZ-Modell als Wabenschicht.',
      herkunft:
        'Eis: Kuhs und Lehmann {q:kuhs1981}; EZ: Pollack {q:pollack2013}',
    },
    {
      begriff: 'Strukturiertes Wasser',
      bedeutung:
        'Sammelbegriff für Wasser mit mehr Ordnung als gewöhnlich, ohne feste Definition.',
      herkunft: 'Umgangssprache und Handel',
    },
    {
      begriff: 'Belebtes Wasser',
      bedeutung: 'Handelsbegriff für Wasser, das mit Geräten aufbereitet wird.',
      herkunft: 'Handel',
    },
    {
      begriff: 'Eis Ih',
      bedeutung:
        'Das gewöhnliche Eis: ein sechseckiges Gitter aus Molekülen im Tetraederwinkel.',
      herkunft: 'Kristallografie {q:kuhs1981}',
    },
  ],
};

export const VIDEO = {
  id: '6rNuQoIrdZQ',
  titel:
    'Was macht Wasser im Körper mit deiner Energie? Die kohärente Struktur erklärt',
  posterAlt: 'Vorschaubild des Videos zur kohärenten Wasserstruktur',
  legende:
    'Christian Bauer erklärt die kohärente Struktur im Video (8 Minuten).',
  playlistUrl:
    'https://www.youtube.com/watch?v=6rNuQoIrdZQ&list=PLkq_JoKriG7QvyBETfGuAeRHd6G6oa_RR',
  playlistText: 'Alle Videos der Reihe auf YouTube',
  // Ernte des eigenen Kanals (homepage-bauer/data/erfahrungen/videos.json,
  // erhoben 2026-09-07): publishedAt und contentDetails.duration. Der Titel
  // ist der heutige (oEmbed 2026-09-23); der Kanal hat das Video umbenannt.
  hochgeladen: '2020-11-10T14:21:11Z',
  dauer: 'PT8M3S',
};

/* ======================================================================== */
/* HÄUFIGE FRAGEN                                                           */
/* ======================================================================== */

/**
 * Die Antworten sind reiner Text (FaqListe rendert Zeichenketten). Zitatmarken
 * stehen deshalb NICHT in den Antworten, sondern in `quellen`: sie laufen als
 * Nachweis mit, und der Test prüft, dass jede genannte Quelle existiert.
 */
export const FRAGEN = [
  {
    q: 'Was ist kohärentes Wasser?',
    a: 'Kohärentes Wasser ist Wasser, dessen Moleküle geordnet sind und sich gemeinsam verhalten. Nach dem Modell von Preparata und Del Giudice schwingen sie in kohärenten Domänen im Gleichtakt. An wasserliebenden Oberflächen bilden sie stabile, sechseckige Schichten, das EZ-Wasser von Prof. Dr. Gerald H. Pollack.',
    quellen: ['delgiudice1988', 'zheng2006', 'pollack2013'],
  },
  {
    q: 'Was ist hexagonales Wasser?',
    a: 'Hexagonales Wasser ist Wasser mit sechseckiger Ordnung der Moleküle. Im Eis ist diese Ordnung gemessen: Die Moleküle sitzen in einem sechseckigen Gitter, jedes im Tetraederwinkel zu vier Nachbarn. Im flüssigen Wasser beschreibt Prof. Dr. Pollack sechseckige Wabenschichten an Oberflächen, das EZ-Wasser. Im Handel steht der Begriff oft für aufbereitetes Wasser.',
    quellen: ['kuhs1981', 'pollack2013'],
  },
  {
    q: 'Was ist der Unterschied zwischen hexagonalem und kohärentem Wasser?',
    a: 'Hexagonal beschreibt die Form, kohärent das Verhalten. Hexagonal heißt, dass sich die Moleküle zu Sechsecken ordnen. Kohärent heißt, dass sie im Gleichtakt schwingen. EZ-Wasser ist beides: eine sechseckig geordnete und zugleich kohärente Schicht.',
    quellen: ['pollack2013', 'delgiudice2013'],
  },
  {
    q: 'Was ist EZ-Wasser?',
    a: 'EZ steht für Exclusion Zone, Ausschlusszone. So heißt die geordnete Wasserschicht, die sich an wasserliebenden Oberflächen bildet und gelöste Teilchen hinausschiebt. Sie ist typischerweise mehrere hundert Mikrometer breit, negativ geladen und absorbiert UV-Licht bei rund 270 Nanometern.',
    quellen: ['zheng2003', 'zheng2006', 'das2013', 'chai2008'],
  },
  {
    q: 'Was ist die vierte Phase des Wassers?',
    a: 'So nennt Prof. Dr. Gerald H. Pollack das EZ-Wasser, in seinem Buch „The Fourth Phase of Water" von 2013. Gemeint ist ein Zustand zwischen Eis und flüssigem Wasser: geordnet wie Eis, aber flüssig und an Oberflächen gebunden. Beim Schmelzen von Eis erscheint kurz seine UV-Signatur.',
    quellen: ['pollack2013', 'so2011'],
  },
  {
    q: 'Was sind kohärente Domänen?',
    a: 'Kohärente Domänen sind Bereiche von rund 0,1 Mikrometern, in denen Wassermoleküle im Gleichtakt mit einem gemeinsamen elektromagnetischen Feld schwingen. So beschreibt es das Modell von Del Giudice, Preparata und Vitiello aus der Quantenelektrodynamik, erstmals 1988. Eine Domäne enthält rund sechs Millionen Moleküle.',
    quellen: ['delgiudice1988', 'delgiudice2010'],
  },
  {
    q: 'Wie entsteht kohärentes Wasser?',
    a: 'An wasserliebenden Oberflächen, durch Licht und durch die Nähe der Moleküle. Die Ausschlusszone bildet sich an Gelen, Kunststoffen, Pflanzenfasern und manchen Metallen. Licht, vor allem Infrarot, lässt sie wachsen.',
    quellen: ['zheng2006', 'chai2012', 'chai2009'],
  },
  {
    q: 'Welche Rolle spielt Licht?',
    a: 'Licht liefert die Energie für die Ordnung. Infrarot bei 3,1 Mikrometern ließ die Ausschlusszone im Versuch nach einer Stunde auf das 6,1-Fache wachsen. Dabei sammelt sich vor der Zone Säure: Das Wasser trennt Ladung.',
    quellen: ['chai2009'],
  },
  {
    q: 'Wie misst man EZ-Wasser?',
    a: 'Mit Mikrokugeln unter dem Mikroskop, die aus der Zone verdrängt werden. Dazu kommen UV-Spektroskopie mit einer Bande bei 270 Nanometern, Elektroden mit rund −100 bis −200 mV, pH-Farbstoffe, Kernspinresonanz und optische Pinzetten.',
    quellen: [
      'zheng2003',
      'chai2008',
      'das2013',
      'chai2009',
      'yoo2011',
      'huszar2014',
    ],
  },
  {
    q: `Warum hat EZ-Wasser die Formel ${FORMEL_EZ}?`,
    a: `In Pollacks Wabenschichten kommen auf zwei Sauerstoff-Atome drei Wasserstoff-Atome, und jede Einheit trägt eine negative Ladung. Das ergibt ${FORMEL_EZ}. Das Ion selbst ist in der Chemie spektroskopisch gemessen.`,
    quellen: ['pollack2013', 'robertson2003', 'diken2005'],
  },
  {
    q: `Was bedeuten ${VON} und ${NACH}?`,
    a: `${VON} ist der Winkel zwischen den beiden Bindungen im freien Wassermolekül, gemessen mit 104,48°. ${NACH} ist der Tetraederwinkel, in dem die Moleküle im Eis zu ihren Nachbarn stehen. Nach dem Modell von Dr. Ulrich Warnke weitet sich der Winkel auf ${NACH}, wenn das Molekül Energie aufnimmt, und dann entstehen hexagonale Strukturen.`,
    quellen: ['csaszar2005', 'kuhs1981', 'warnke2019'],
  },
  {
    q: 'Was davon ist gemessen, was ist Modell?',
    a: `Gemessen ist die Ausschlusszone: ihre Breite, ihre Ladung, ihre UV-Bande und ihr Wachstum unter Licht, von mehreren Laboren. Modelle sind die kohärenten Domänen der Quantenelektrodynamik, die Formel ${FORMEL_EZ} für die Zone und die Aufweitung des Winkels. Wie die Zone entsteht, erklärt Prof. Dr. Pollack mit einer eigenen, geordneten Phase des Wassers.`,
    quellen: [
      'zheng2006',
      'huszar2014',
      'elton2020',
      'delgiudice1988',
      'pollack2013',
    ],
  },
  {
    q: 'Ist kohärentes Wasser dasselbe wie belebtes Wasser?',
    a: 'Nein. Belebtes Wasser ist ein Handelsbegriff für Wasser, das mit Geräten aufbereitet wird. Kohärentes Wasser und EZ-Wasser beschreiben geordnete Zustände des Wassers, wie sie Physiker in Fachzeitschriften untersuchen.',
    quellen: ['delgiudice1988', 'zheng2006'],
  },
];

/* ======================================================================== */
/* GLOSSAR                                                                  */
/* ======================================================================== */

export const GLOSSAR = [
  {
    id: 'bindungswinkel',
    begriff: 'Bindungswinkel',
    definition:
      'Der Winkel zwischen den beiden Bindungen eines Wassermoleküls. Im freien Molekül beträgt er 104,48° {q:csaszar2005}.',
  },
  {
    id: 'tetraederwinkel',
    begriff: 'Tetraederwinkel',
    definition:
      'Der Winkel zwischen den Ecken eines Tetraeders, von der Mitte aus gesehen: 109,47° oder 109° 28′. So stehen die Moleküle im Eis zu ihren Nachbarn {q:kuhs1981}.',
  },
  {
    id: 'wasserstoffbruecke',
    begriff: 'Wasserstoffbrücke',
    definition:
      'Eine schwache Bindung zwischen dem Wasserstoff eines Moleküls und dem Sauerstoff eines Nachbarn. Im flüssigen Wasser lebt sie nur Billionstel Sekunden {q:fecko2003}.',
  },
  {
    id: 'gleichtakt',
    begriff: 'Kohärenz',
    definition:
      'Gleichtakt: Viele Teilchen schwingen mit derselben Frequenz und in fester Phase zueinander.',
  },
  {
    id: 'domaene',
    begriff: 'Kohärente Domäne',
    definition:
      'Ein Bereich von rund 0,1 Mikrometern, in dem Wassermoleküle nach dem Modell von Del Giudice und Preparata im Gleichtakt schwingen {q:delgiudice2010}.',
  },
  {
    id: 'ez-wasser',
    begriff: 'EZ-Wasser',
    definition:
      'Exclusion-Zone-Wasser: die geordnete, negativ geladene Wasserschicht an wasserliebenden Oberflächen, die gelöste Teilchen ausschließt {q:zheng2006}.',
  },
  {
    id: 'vierte-phase',
    begriff: 'Vierte Phase des Wassers',
    definition:
      'Pollacks Name für EZ-Wasser, als Zustand zwischen Eis und flüssigem Wasser {q:pollack2013}.',
  },
  {
    id: 'hexagonales-wasser',
    begriff: 'Hexagonales Wasser',
    definition:
      'Wasser mit sechseckiger Ordnung der Moleküle, wie im Eis Ih und in den Wabenschichten des EZ-Wassers.',
  },
  {
    id: 'hydrophil',
    begriff: 'Hydrophil',
    definition:
      'Wasserliebend. Eine hydrophile Oberfläche zieht Wasser an und wird leicht benetzt.',
  },
  {
    id: 'hydronium',
    begriff: 'Hydronium',
    definition:
      'H₃O⁺, ein Wassermolekül mit einem zusätzlichen Proton. Es macht Wasser sauer.',
  },
  {
    id: 'h3o2',
    begriff: 'H₃O₂⁻',
    definition:
      'Ein Hydroxid-Ion mit gebundenem Wassermolekül. Pollack ordnet diese Zusammensetzung dem EZ-Wasser zu {q:pollack2013}.',
  },
  {
    id: 'elektronenvolt',
    begriff: 'Elektronenvolt (eV)',
    definition:
      'Eine Energieeinheit der Atomphysik: die Energie, die ein Elektron beim Durchlaufen einer Spannung von einem Volt gewinnt.',
  },
  {
    id: 'qed',
    begriff: 'Quantenelektrodynamik (QED)',
    definition:
      'Die Theorie der Wechselwirkung von Licht und Materie. Auf ihr beruht das Modell der kohärenten Domänen {q:delgiudice1988}.',
  },
  {
    id: 'eis-ih',
    begriff: 'Eis Ih',
    definition:
      'Die gewöhnliche Form von Eis. Die Moleküle bilden ein sechseckiges Gitter {q:kuhs1981}.',
  },
  {
    id: 'infrarot',
    begriff: 'Infrarot',
    definition:
      'Licht mit Wellenlängen jenseits des sichtbaren Rots, als Wärme spürbar. Wasser absorbiert es am stärksten bei 2,95 Mikrometern {q:hale1973}.',
  },
];

/* ======================================================================== */
/* QUELLEN                                                                  */
/* ======================================================================== */

/**
 * Reihenfolge = Nummer im Verzeichnis. Jede DOI ist am 2026-09-23 gegen
 * doi.org (HTTP 302 zum Verlag) und Crossref geprüft, jede Kernaussage am
 * Abstract, Volltext oder Buch gelesen (Prüfbericht im Jobordner). `art`
 * steuert nur den schema.org-Typ (Book oder ScholarlyArticle).
 */
const DOI = (d) => `https://doi.org/${d}`;
const QUELLEN_ROH = [
  {
    id: 'csaszar2005',
    autoren: 'Császár AG, Czakó G, Furtenbacher T u. a.',
    jahr: '2005',
    titel: 'On equilibrium structures of the water molecule',
    ort: 'J. Chem. Phys. 122, 214305',
    url: DOI('10.1063/1.1924506'),
    kern: 'H-O-H-Winkel des freien Moleküls: 104,48°.',
  },
  {
    id: 'kuhs1981',
    autoren: 'Kuhs WF, Lehmann MS',
    jahr: '1981',
    titel:
      'Bond-lengths, bond angles and transition barrier in ice Ih by neutron scattering',
    ort: 'Nature 294, 432–434',
    url: DOI('10.1038/294432a0'),
    kern: 'Im Eis Ih ist die Anordnung tetraedrisch (Neutronenbeugung bei 60 K).',
  },
  {
    id: 'bernal1933',
    autoren: 'Bernal JD, Fowler RH',
    jahr: '1933',
    titel:
      'A Theory of Water and Ionic Solution, with Particular Reference to Hydrogen and Hydroxyl Ions',
    ort: 'J. Chem. Phys. 1, 515–548',
    url: DOI('10.1063/1.1749327'),
    kern: 'Erstes Strukturmodell des flüssigen Wassers und des Eises.',
  },
  {
    id: 'tanaka2001',
    autoren: 'Tanaka M, Girard G, Davis R, Peuto A, Bignell N',
    jahr: '2001',
    titel:
      'Recommended table for the density of water between 0 °C and 40 °C based on recent experimental reports',
    ort: 'Metrologia 38, 301–309',
    url: DOI('10.1088/0026-1394/38/4/3'),
    kern: 'Dichtemaximum 999,975 kg/m³ bei 3,983 °C.',
  },
  {
    id: 'nilsson2015',
    autoren: 'Nilsson A, Pettersson LGM',
    jahr: '2015',
    titel: 'The structural origin of anomalous properties of liquid water',
    ort: 'Nat. Commun. 6, 8998',
    url: DOI('10.1038/ncomms9998'),
    kern: 'Bis zu vier Brücken je Molekül; die Struktur schwankt zwischen zwei Klassen lokaler Anordnung.',
  },
  {
    id: 'fecko2003',
    autoren: 'Fecko CJ, Eaves JD, Loparo JJ, Tokmakoff A, Geissler PL',
    jahr: '2003',
    titel:
      'Ultrafast Hydrogen-Bond Dynamics in the Infrared Spectroscopy of Water',
    ort: 'Science 301, 1698–1702',
    url: DOI('10.1126/science.1087251'),
    kern: 'Brückenschwingung 170 fs, Umordnung des Netzes in 1,2 ps.',
  },
  {
    id: 'eaves2005',
    autoren: 'Eaves JD, Loparo JJ, Fecko CJ u. a.',
    jahr: '2005',
    titel: 'Hydrogen bonds in liquid water are broken only fleetingly',
    ort: 'PNAS 102, 13019–13022',
    url: DOI('10.1073/pnas.0505125102'),
    kern: 'Nach weniger als 200 fs findet ein Molekül einen neuen Brückenpartner.',
  },
  {
    id: 'wernet2004',
    autoren: 'Wernet P, Nordlund D, Bergmann U u. a.',
    jahr: '2004',
    titel: 'The structure of the first coordination shell in liquid water',
    ort: 'Science 304, 995–999',
    url: DOI('10.1126/science.1096205'),
    kern: 'Die meisten Moleküle tragen im flüssigen Wasser zwei starke Brücken.',
  },
  {
    id: 'hale1973',
    autoren: 'Hale GM, Querry MR',
    jahr: '1973',
    titel:
      'Optical Constants of Water in the 200-nm to 200-µm Wavelength Region',
    ort: 'Appl. Opt. 12, 555–563',
    url: DOI('10.1364/AO.12.000555'),
    kern: 'Stärkste Absorption bei 2,95 µm.',
  },
  {
    id: 'zheng2003',
    autoren: 'Zheng J-M, Pollack GH',
    jahr: '2003',
    titel: 'Long-range forces extending from polymer-gel surfaces',
    ort: 'Phys. Rev. E 68, 031408',
    url: DOI('10.1103/PhysRevE.68.031408'),
    kern: 'Erstbeschreibung: Mikrokugeln werden aus rund 100 µm vor einem Gel verdrängt.',
  },
  {
    id: 'zheng2006',
    autoren: 'Zheng J-M, Chin W-C, Khijniak E, Khijniak E Jr, Pollack GH',
    jahr: '2006',
    titel:
      'Surfaces and interfacial water: Evidence that hydrophilic surfaces have long-range impact',
    ort: 'Adv. Colloid Interface Sci. 127, 19–27',
    url: DOI('10.1016/j.cis.2006.07.002'),
    kern: 'Zone typischerweise mehrere hundert µm breit, an vielen hydrophilen Oberflächen.',
  },
  {
    id: 'chai2008',
    autoren: 'Chai B-H, Zheng J-M, Zhao Q, Pollack GH',
    jahr: '2008',
    titel: 'Spectroscopic Studies of Solutes in Aqueous Solution',
    ort: 'J. Phys. Chem. A 112, 2242–2247',
    url: DOI('10.1021/jp710105n'),
    kern: 'Absorptionsbande des EZ-Wassers bei rund 270 nm.',
  },
  {
    id: 'chai2009',
    autoren: 'Chai B, Yoo H, Pollack GH',
    jahr: '2009',
    titel: 'Effect of Radiant Energy on Near-Surface Water',
    ort: 'J. Phys. Chem. B 113, 13953–13958',
    url: DOI('10.1021/jp908163w'),
    kern: 'Infrarot 3,1 µm: Zone ×3,7 nach 10 min, ×6,1 nach 1 h; pH < 3 jenseits der Zone.',
  },
  {
    id: 'pollack2009',
    autoren: 'Pollack GH, Figueroa X, Zhao Q',
    jahr: '2009',
    titel:
      'Molecules, Water, and Radiant Energy: New Clues for the Origin of Life',
    ort: 'Int. J. Mol. Sci. 10, 1419–1429',
    url: DOI('10.3390/ijms10041419'),
    kern: '100–200 mV zwischen Zone und Wasser; schwaches Infrarot vervierfacht die Zone in 10 min.',
  },
  {
    id: 'yoo2011',
    autoren: 'Yoo H, Paranji R, Pollack GH',
    jahr: '2011',
    titel:
      'Impact of Hydrophilic Surfaces on Interfacial Water Dynamics Probed with NMR Spectroscopy',
    ort: 'J. Phys. Chem. Lett. 2, 532–536',
    url: DOI('10.1021/jz200057g'),
    kern: 'Kürzere Relaxationszeiten und kleinere Selbstdiffusion nahe hydrophiler Flächen.',
  },
  {
    id: 'das2013',
    autoren: 'Das R, Pollack GH',
    jahr: '2013',
    titel: 'Charge-Based Forces at the Nafion–Water Interface',
    ort: 'Langmuir 29, 2651–2658',
    url: DOI('10.1021/la304418p'),
    kern: 'Die Zone ist gegenüber dem übrigen Wasser negativ, rund −100 mV.',
  },
  {
    id: 'so2011',
    autoren: 'So E, Stahlberg R, Pollack GH',
    jahr: '2011',
    titel: 'Exclusion zone as intermediate between ice and water',
    ort: 'WIT Trans. Ecol. Environ. (Water and Society), 3–11',
    url: DOI('10.2495/WS110011'),
    kern: 'Beim Schmelzen von Eis erscheint die 270-nm-Bande vorübergehend.',
  },
  {
    id: 'nhan2011',
    autoren: 'Nhan DT, Pollack GH',
    jahr: '2011',
    titel: 'Effect of particle diameter on exclusion-zone size',
    ort: 'Int. J. Des. Nat. Ecodyn. 6, 139–144',
    url: DOI('10.2495/DNE-V6-N2-139-144'),
    kern: 'An Kügelchen von 15 bis 300 µm wächst die Zone mit der Kugelgröße.',
  },
  {
    id: 'chai2012',
    autoren: 'Chai B, Mahtani AG, Pollack GH',
    jahr: '2012',
    titel: 'Unexpected presence of solute-free zones at metal-water interfaces',
    ort: 'Contemporary Materials III-1, 1–12',
    url: DOI('10.7251/COM1201001C'),
    kern: 'Ausschlusszonen auch an Metallen, an Zink bis etwa 200 µm.',
  },
  {
    id: 'huszar2014',
    autoren: 'Huszár IN, Mártonfalvi Z, Laki AJ, Iván K, Kellermayer M',
    jahr: '2014',
    titel:
      'Exclusion-Zone Dynamics Explored with Microfluidics and Optical Tweezers',
    ort: 'Entropy 16, 4322–4337',
    url: DOI('10.3390/e16084322'),
    kern: 'Unabhängige Bestätigung an Nafion: über 100 µm binnen Minuten.',
  },
  {
    id: 'wang2021',
    autoren: 'Wang A, Pollack GH',
    jahr: '2021',
    titel:
      'Effect of infrared radiation on interfacial water at hydrophilic surfaces',
    ort: 'Colloid Interface Sci. Commun. 42, 100397',
    url: DOI('10.1016/j.colcom.2021.100397'),
    kern: 'Mittleres Infrarot, 5 min: Zone ×1,41.',
  },
  {
    id: 'wang2024',
    autoren: 'Wang A, Pollack GH',
    jahr: '2024',
    titel: 'Exclusion-zone water inside and outside of plant xylem vessels',
    ort: 'Sci. Rep. 14, 12071',
    url: DOI('10.1038/s41598-024-62983-3'),
    kern: 'EZ-Wasser in Pflanzengefäßen, beim Kürbis bis 240 µm.',
  },
  {
    id: 'sulbaran2014',
    autoren: 'Sulbarán B, Toriz G, Allan GG, Pollack GH, Delgado E',
    jahr: '2014',
    titel: 'The dynamic development of exclusion zones on cellulosic surfaces',
    ort: 'Cellulose 21, 1143–1148',
    url: DOI('10.1007/s10570-014-0165-y'),
    kern: 'Ausschlusszonen an Cellulose.',
  },
  {
    id: 'elton2020',
    autoren: 'Elton DC, Spencer PD, Riches JD, Williams ED',
    jahr: '2020',
    titel:
      'Exclusion Zone Phenomena in Water—A Critical Review of Experimental Findings and Theories',
    ort: 'Int. J. Mol. Sci. 21, 5041',
    url: DOI('10.3390/ijms21145041'),
    kern: 'Übersicht über die Messungen mehrerer Labore.',
  },
  {
    id: 'pollack2013',
    art: 'buch',
    autoren: 'Pollack GH',
    jahr: '2013',
    titel: 'The Fourth Phase of Water: Beyond Solid, Liquid, and Vapor',
    ort: 'Ebner & Sons, Seattle. ISBN 978-0-9626895-4-3',
    url: null,
    kern: 'Kap. 3: 270 nm, Viskosität; Kap. 4: −120 bis −200 mV, Wabenschicht H₃O₂⁻.',
  },
  {
    id: 'robertson2003',
    autoren: 'Robertson WH, Diken EG, Price EA, Shin J-W, Johnson MA',
    jahr: '2003',
    titel:
      'Spectroscopic Determination of the OH⁻ Solvation Shell in the OH⁻·(H₂O)ₙ Clusters',
    ort: 'Science 299, 1367–1372',
    url: DOI('10.1126/science.1080695'),
    kern: 'Hydroxid-Ion mit gebundenen Wassermolekülen, spektroskopisch gemessen.',
  },
  {
    id: 'diken2005',
    autoren: 'Diken EG, Headrick JM, Roscioli JR u. a.',
    jahr: '2005',
    titel:
      'Fundamental Excitations of the Shared Proton in the H₃O₂⁻ and H₅O₂⁺ Complexes',
    ort: 'J. Phys. Chem. A 109, 1487–1490',
    url: DOI('10.1021/jp044155v'),
    kern: 'Das Ion H₃O₂⁻ in der Gasphase gemessen.',
  },
  {
    id: 'delgiudice1988',
    autoren: 'Del Giudice E, Preparata G, Vitiello G',
    jahr: '1988',
    titel: 'Water as a Free Electric Dipole Laser',
    ort: 'Phys. Rev. Lett. 61, 1085–1088',
    url: DOI('10.1103/PhysRevLett.61.1085'),
    kern: 'Grundlegendes Modell: Wasser-Dipole und Strahlungsfeld bilden kollektive Moden.',
  },
  {
    id: 'arani1995',
    autoren: 'Arani R, Bono I, Del Giudice E, Preparata G',
    jahr: '1995',
    titel: 'QED coherence and the thermodynamics of water',
    ort: 'Int. J. Mod. Phys. B 9, 1813–1841',
    url: DOI('10.1142/S0217979295000744'),
    kern: 'Oberhalb einer kritischen Dichte geht Wasser in einen kohärenten Zustand über.',
  },
  {
    id: 'preparata1995',
    art: 'buch',
    autoren: 'Preparata G',
    jahr: '1995',
    titel: 'QED Coherence in Matter',
    ort: 'World Scientific, Singapur',
    url: DOI('10.1142/2738'),
    kern: 'Kap. 10: kritische Dichte 0,310 g/cm³ für 12,06 eV; Domänen rund 750 Å; Molekülabstand ≈ 3,1 Å.',
  },
  {
    id: 'delgiudice2010',
    autoren: 'Del Giudice E, Spinetti PR, Tedeschi A',
    jahr: '2010',
    titel: 'Water Dynamics at the Root of Metamorphosis in Living Organisms',
    ort: 'Water 2, 566–586',
    url: DOI('10.3390/w2030566'),
    kern: '12,06 eV, Ionisationsschwelle 12,60 eV, Domäne 0,1 µm mit rund sechs Millionen Molekülen.',
  },
  {
    id: 'bono2012',
    autoren: 'Bono I, Del Giudice E, Gamberale L, Henry M',
    jahr: '2012',
    titel: 'Emergence of the Coherent Structure of Liquid Water',
    ort: 'Water 4, 510–532',
    url: DOI('10.3390/w4030510'),
    kern: 'Herleitung der kohärenten Struktur aus der Quantenelektrodynamik.',
  },
  {
    id: 'delgiudice2013',
    autoren: 'Del Giudice E, Tedeschi A, Vitiello G, Voeikov V',
    jahr: '2013',
    titel: 'Coherent structures in liquid water close to hydrophilic surfaces',
    ort: 'J. Phys.: Conf. Ser. 442, 012028',
    url: DOI('10.1088/1742-6596/442/1/012028'),
    kern: 'An Oberflächen ist der kohärente Anteil größer und stabil; Verbindung zu Pollacks EZ.',
  },
  {
    id: 'delgiudice2015',
    autoren: 'Del Giudice E, Voeikov V, Tedeschi A, Vitiello G',
    jahr: '2015',
    titel:
      'The origin and the special role of coherent water in living systems',
    ort: 'In: Fels D, Cifra M, Scholkmann F (Hrsg.): Fields of the Cell, Research Signpost, S. 95–111. ISBN 978-81-308-0544-3',
    url: null,
    art: 'buch',
    kern: 'S. 100: 12,06 eV; S. 104–105: aus Domänen-Wasser wird EZ-Wasser.',
  },
  {
    id: 'warnke2019',
    art: 'buch',
    autoren: 'Warnke U, Warnke F',
    jahr: '2019',
    titel: 'Bionisches Wasser',
    ort: 'Arkana, München. ISBN 978-3-442-34247-1',
    url: null,
    kern: 'S. 57: 12,06 eV; S. 81: Aufweitung von 104,5° auf 109° 28′.',
  },
  {
    id: 'warnke2018',
    art: 'buch',
    autoren: 'Warnke U',
    jahr: '2018',
    titel: 'Vortrag Baden-Baden, 3. November 2018',
    ort: 'Folien 49 bis 56',
    url: null,
    kern: 'Winkel, Domäne und EZ-Wasser als drei Zustände.',
  },
];

/**
 * NUMMERIERUNG NACH ERSTEM AUFTRETEN, wie in einem Fachtext: die erste Quelle,
 * die der Leser im Text trifft, ist [1]. Die Reihenfolge wird aus den Texten
 * GELESEN, nicht von Hand gepflegt; eine Quelle ohne Zitat im Text steht am
 * Ende (der Test meldet sie).
 */
function reihenfolge() {
  const texte = [
    SEITE.kurz,
    ...TEIL_EINFACH.abschnitte.flatMap((a) => [
      ...(a.absaetze || []),
      ...(a.karten || []).map((k) => k.text),
      ...(a.nachGrafik || []),
    ]),
    ...TEIL_FAKTEN.abschnitte.flatMap((a) => [
      ...(a.absaetze || []),
      ...(a.tabelle ? a.tabelle.zeilen.flat() : []),
      a.grafik ? a.grafik.legende : '',
      ...(a.begriffe
        ? BEGRIFFE.zeilen.map((z) => `${z.bedeutung} ${z.herkunft}`)
        : []),
    ]),
    ...FRAGEN.map((f) => (f.quellen || []).map((id) => `{q:${id}}`).join(' ')),
    ...GLOSSAR.map((g) => g.definition),
  ];
  const ids = [];
  for (const t of texte) {
    for (const m of String(t).matchAll(/\{q:([a-z0-9-]+)\}/g)) {
      if (!ids.includes(m[1])) ids.push(m[1]);
    }
  }
  return ids;
}

const ZITIERT = reihenfolge();
export const QUELLEN = [
  ...ZITIERT.map((id) => QUELLEN_ROH.find((q) => q.id === id)).filter(Boolean),
  ...QUELLEN_ROH.filter((q) => !ZITIERT.includes(q.id)),
];
export const ZITATMARKEN = ZITIERT;

export const WEITER = [
  {
    to: '/pages/technologie',
    titel: 'Die Technologie',
    text: 'Wie der GitterChip™ gebaut ist und was er mit geordnetem Wasser zu tun hat.',
  },
  {
    to: '/pages/studien',
    titel: 'Die Studien',
    text: 'Fünf Laborstudien in Japan und den USA, mit Methode und Ergebnis.',
  },
  {
    to: '/pages/kohaerentes-wasser',
    titel: 'Der Kurs, Tag 5',
    text: 'Kohärente Wasserstrukturen als Lektion im Gratis-Kurs „In 5 Stufen zum Superhuman".',
  },
];

/** Laufende Nummer einer Quelle im Verzeichnis (1-basiert). */
export function quellenNummer(id) {
  const i = QUELLEN.findIndex((q) => q.id === id);
  if (i < 0) {
    // FAIL-LOUD: eine Zitatmarke ohne Quelle wäre eine Zahl ohne Fundstelle.
    throw new Error(`Zitatmarke {q:${id}} ohne Eintrag in QUELLEN`);
  }
  return i + 1;
}

/* ======================================================================== */
/* STRUKTURIERTE DATEN                                                      */
/* ======================================================================== */

/**
 * GL-SPR-0008 als Sperre an der Stelle, an der Text maschinenlesbar wird.
 * ANDERS als app/lib/faq-schema.js: dort sperrt die Produkt-FAQ-Leitplanke
 * (Juli 2026) das Wort „kohärent" selbst und jede Nanometer-Angabe. Auf einer
 * Seite, deren Gegenstand kohärentes Wasser ist, bliebe damit nichts übrig,
 * und Christians Auftrag verlangt FAQPage und DefinedTerm ausdrücklich. Die
 * Sperre hier sitzt deshalb auf dem, was die Regel meint: Heil- und
 * Körperschutzzusagen. Trifft sie, fliegt der Eintrag aus dem Schema, und der
 * Test der Seite (test/wasser-infoseite.test.mjs) wird rot (nichts fällt still weg).
 */
export const KOERPER_SPERRE = [
  /st(ä|ae)rk\w* (dein|das|ihr|unser) Immunsystem/i,
  /sch(ü|ue)tz\w* (deine |die |unsere )?Zellen/i,
  /vor Viren/i,
  /\bheil(t|en|ung|end)\b/i,
  /verhinder\w* Krankheit/i,
  /sch(ü|ue)tz\w* (dich|deinen K(ö|oe)rper) vor/i,
  /Therapie|therapeut/i,
  /Krankheit|Erkrankung/i,
];

export function istSchemaSicher(text) {
  return !KOERPER_SPERRE.some((rx) => rx.test(String(text)));
}

function ohneMarken(text) {
  return String(text)
    .replace(/\{q:[a-z0-9-]+\}/g, '')
    .replace(/\{l:[^}|]+\|([^}]+)\}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function strukturierteDaten() {
  const url = absoluteCanonical(PFAD);
  const autor = {
    '@type': 'Person',
    name: SEITE.autorName,
    jobTitle: SEITE.autorRolle,
    worksFor: {
      '@type': 'Organization',
      name: 'Qi Blanco',
      url: absoluteCanonical('/'),
    },
  };
  const herausgeber = {
    '@type': 'Organization',
    name: 'Qi Blanco',
    url: absoluteCanonical('/'),
  };
  const zitate = QUELLEN.filter((q) => q.url).map((q) => ({
    '@type': q.art === 'buch' ? 'Book' : 'ScholarlyArticle',
    name: q.titel,
    author: q.autoren,
    datePublished: q.jahr,
    url: q.url,
  }));
  const artikel = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#artikel`,
    headline: SEITE.h1,
    alternativeHeadline: SEITE.titel.replace(/\s*\|\s*Qi Blanco$/, ''),
    description: SEITE.beschreibung,
    abstract: SEITE.kurz,
    inLanguage: 'de-DE',
    url,
    mainEntityOfPage: url,
    datePublished: SEITE.veroeffentlicht,
    dateModified: SEITE.geaendert,
    author: autor,
    publisher: herausgeber,
    about: [
      {'@type': 'Thing', name: 'Kohärentes Wasser'},
      {'@type': 'Thing', name: 'Hexagonales Wasser'},
      {'@type': 'Thing', name: 'EZ-Wasser'},
    ],
    citation: zitate,
    video: {'@id': `${url}#video-${VIDEO.id}`},
    hasPart: [TEIL_EINFACH, TEIL_FAKTEN].map((t) => ({
      '@type': 'WebPageElement',
      name: t.titel,
      url: `${url}#${t.id}`,
    })),
  };
  const fragen = FRAGEN.filter((f) => istSchemaSicher(`${f.q}\n${f.a}`));
  const faq = fragen.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${url}#fragen`,
        inLanguage: 'de-DE',
        mainEntity: fragen.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {'@type': 'Answer', text: ohneMarken(f.a)},
        })),
      }
    : null;
  const glossar = GLOSSAR.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${url}#glossar`,
        name: 'Glossar: kohärentes Wasser',
        inLanguage: 'de-DE',
        hasDefinedTerm: GLOSSAR.filter((g) =>
          istSchemaSicher(g.definition),
        ).map((g) => ({
          '@type': 'DefinedTerm',
          '@id': `${url}#begriff-${g.id}`,
          name: g.begriff,
          description: ohneMarken(g.definition),
          inDefinedTermSet: `${url}#glossar`,
        })),
      }
    : null;
  const video = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${url}#video-${VIDEO.id}`,
    name: VIDEO.titel,
    description: SEITE.beschreibung,
    thumbnailUrl: `https://i.ytimg.com/vi/${VIDEO.id}/hqdefault.jpg`,
    uploadDate: VIDEO.hochgeladen,
    duration: VIDEO.dauer,
    embedUrl: `https://www.youtube.com/embed/${VIDEO.id}`,
    contentUrl: `https://www.youtube.com/watch?v=${VIDEO.id}`,
  };
  return [artikel, faq, glossar, video].filter(Boolean);
}
