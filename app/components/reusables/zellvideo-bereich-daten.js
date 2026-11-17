/*
 * zellvideo-bereich-daten.js — der Bereich „Zellvideos“ je Kaufseite, als EINE Datenquelle.
 *
 * AUFTRAG (Christian 16.11.2026 ~09:45 Bangkok, Job 20261116-prio2-produktseiten-
 * zellvideo-bereich-je-studie-bracelet-home-qione2pro-de-us), wörtlich:
 * „bei allen 3 Produkten, dass wir noch einen Bereich unten reinbauen mit den
 * Zellvideos … und eben ganz klar, what do I get hinschreiben, ohne Ausflüchte.“
 * Ort (09:52, Screenshot): genau oberhalb von „Ruhe, die du immer bei dir trägst“,
 * also als erstes Element im Slot „wissen“ der Alpha-Vorlage.
 *
 * ZUORDNUNG VIDEO <-> STUDIE <-> PRODUKT (belegt, nicht geraten):
 *   qione-2-pro  230413_cellstudy_comparison_1x1_DE.mp4  Darmepithelzellen,
 *                Studie e0002 (/pages/studie-darmbarriere, Applied Cell Biology 2021,
 *                DOI 10.53043/2320-1991.acb90012). Beleg: produkt-videos.js
 *                (id zellen-qione-2-pro) und das PDF „protective-effect-of-qionereg-
 *                2-pro-on-cultured-intestinal-epithelial“ an derselben Stelle im
 *                US-Theme (sections/zellstudien-video-lazyloaded.liquid).
 *   qibracelet   Bracelet_Study_1x1_DE.mp4  Leberzellen unter oxidativem Stress,
 *                Studie e0003 (/pages/studie-oxidativer-stress, Applied Cell
 *                Biology 12.01.2024). Beleg: produkt-videos.js (id zellen-qibracelet).
 *   qihome-air   Studie e0005 (/pages/studie-qihome-air, Neurodegenerative
 *                Diseases: Current Research 2026). Eigenes Zellvideo: siehe Eintrag.
 *
 * ZAHLEN: wörtlich aus den Studien-Daten app/data/studien/e000N.json
 * (laienSummary bzw. tabellen), keine eigene Rechnung.
 *
 * SCHALTER (Rückweg ohne Code): `aktiv: false` nimmt den Bereich einer Seite
 * heraus; die Seite rendert dann byte-gleich zum Stand vor diesem Bau.
 *
 * Christian schreibt seine Seitentexte selbst: sein Wortlaut ersetzt titel/text
 * 1:1, ohne dass jemand die Komponente anfasst.
 */

export const ZELLVIDEO_BEREICH = {
  'qione-2-pro': {
    aktiv: true,
    etikett: 'Im Labor gefilmt',
    titel: 'Mit dem QiOne® 2 Pro erholen sich Zellen trotz Handystrahlung.',
    vergleich: [
      {wert: '−60 %', zeile: 'Zellregeneration ohne Schutz'},
      {wert: '−15 %', zeile: 'mit dem QiOne® 2 Pro, fast wie ohne Strahlung', gold: true},
    ],
    text: 'Prof. Dr. Peter C. Dartsch hat Darmzellen im Labor vier Stunden mit Handystrahlung belastet. Ohne Schutz sank ihre Regeneration um etwa 60 Prozent. Mit dem QiOne® 2 Pro waren es nur etwa 15 Prozent, so wenig wie bei Zellen ganz ohne Strahlung.',
    video: {
      pfad: '230413_cellstudy_comparison_1x1_DE.mp4',
      ersatzbild:
        'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--zellvideo-poster-230413-cellstudy-comparison-1x1-de--a112f9ac7cd0.jpg?v=1790462921',
      bildzeile: 'Echtzeit-Aufnahme aus der Studie. Oben ohne Schutz: die Lücke bleibt offen. Unten mit Gitterchip®: die Zellen wachsen wieder zusammen.',
    },
    quelle: 'Veröffentlicht in Applied Cell Biology, 2021',
    link: {text: 'Zur Studie', href: '/pages/studie-darmbarriere'},
  },
  qibracelet: {
    aktiv: true,
    etikett: 'Im Labor gefilmt',
    titel: 'Mit dem QiBracelet® halten Zellen oxidativem Stress stand.',
    vergleich: [
      {wert: '5 von 5', zeile: 'getesteten Zellarten besser geschützt'},
      {wert: '+47,3 %', zeile: 'Schutz bei Leberzellen mit dem QiBracelet®', gold: true},
    ],
    text: 'Prof. Dr. Peter C. Dartsch hat fünf Arten menschlicher und tierischer Zellen im Labor oxidativem Stress ausgesetzt, wie ihn Umweltbelastungen im Körper auslösen. Mit dem QiBracelet® überstanden alle fünf den Stress besser als ohne. Am stärksten die Leberzellen: 47,3 Prozent mehr Schutz.',
    video: {
      pfad: 'Bracelet_Study_1x1_DE.mp4',
      ersatzbild:
        'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--zellvideo-poster-bracelet-study-1x1-de--f625cf3d49ae.jpg?v=1790462925',
      bildzeile: 'Echtzeit-Aufnahme aus der Studie. Oben ohne Schutz, unten mit Gitterchip®: Leberzellen unter oxidativem Stress.',
    },
    quelle: 'Veröffentlicht in Applied Cell Biology, 12. Januar 2024',
    link: {text: 'Zur Studie', href: '/pages/studie-oxidativer-stress'},
  },
  'qihome-air': {
    aktiv: true,
    etikett: 'Zellstudie im Labor',
    titel: 'Neben dem QiHome® Air regenerieren Nervenzellen schneller.',
    vergleich: [
      {wert: '25,2 %', zeile: 'offene Wunde im Zellrasen nach zehn Stunden, ohne Gerät'},
      {wert: '11,8 %', zeile: 'neben dem QiHome® Air: 53,3 Prozent bessere Regeneration', gold: true},
    ],
    text: 'Prof. Dr. Peter C. Dartsch hat im Labor eine Wunde in einen Rasen aus Nervenzellen gesetzt. Neben dem QiHome® Air wuchs sie deutlich schneller zu als bei Zellen ohne Gerät.',
    // Eigenes Zellvideo der QiHome®-Air-Studie: im Bestand nicht gefunden
    // (Suche 16.11.2026, siehe RESULT des Jobs). Ohne Video zeigt der Bereich
    // Aussage, Zahlen und Studienlink; das Video kommt mit dem Folgejob dazu.
    video: null,
    quelle: 'Veröffentlicht in Neurodegenerative Diseases: Current Research, 2026',
    link: {text: 'Zur Studie', href: '/pages/studie-qihome-air'},
  },
};

/** Der Bereich eines Handles oder null (unbekannt oder abgeschaltet). */
export function zellvideoBereich(handle) {
  const b = ZELLVIDEO_BEREICH[handle];
  return b && b.aktiv ? b : null;
}
