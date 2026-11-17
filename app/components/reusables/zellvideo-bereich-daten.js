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
      // Zahlen positiv (Christian 16.11. 17:30/17:35): was erhalten BLEIBT, nicht
      // was verloren geht. Aus e0002 laienSummary: Regeneration ohne Schutz um
      // etwa 60 % gesenkt (= etwa 40 % bleiben), mit QiOne® 2 Pro um etwa 15 %
      // (= etwa 85 % bleiben); Tabelle tab1 bestaetigt (offene Flaeche 43,7 %
      // gegen 14,5 %, Kontrolle 13,8 %).
      {wert: '40 %', zeile: 'der Zellregeneration bleiben ohne Schutz'},
      {wert: '85 %', zeile: 'bleiben mit dem QiOne® 2 Pro, fast wie ganz ohne Strahlung', gold: true},
    ],
    text: 'Prof. Dr. Peter C. Dartsch hat Darmzellen im Labor vier Stunden mit Handystrahlung belastet. Ohne Schutz blieben nur etwa 40 Prozent ihrer Regeneration übrig. Mit dem QiOne® 2 Pro waren es etwa 85 Prozent, fast so viel wie bei Zellen ganz ohne Strahlung.',
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
    // Kernaussage QiHome (Christian 16.11. 17:42, verbindlich): „+53,3 % bessere
    // Regeneration“ vorn. Zweite Zahl nach dem QiBracelet-Muster (zwei Plus-Zahlen),
    // aus e0005 laienSummary: 34 % mehr Zellen ueberstanden kuenstlichen Zellstress.
    // Die Wund-Restflaechen 25,2 %/11,8 % stehen nur noch im Erklaertext.
    vergleich: [
      {wert: '+53,3 %', zeile: 'bessere Regeneration neben dem QiHome® Air', gold: true},
      {wert: '+34 %', zeile: 'mehr Zellen überstehen künstlichen Zellstress'},
    ],
    text: 'Prof. Dr. Peter C. Dartsch hat im Labor eine Wunde in einen Rasen aus Nervenzellen gesetzt. Neben dem QiHome® Air wuchs sie deutlich schneller zu. Nach zehn Stunden waren dort nur noch 11,8 Prozent offen, ohne Gerät 25,2 Prozent.',
    // Zellvideo der QiHome®-Air-Studie (Christian 16.11. ~19:15: „hat ENES erstellt, in
    // Farbe"): gefunden 17.11.2026 im Drive-Ordner „KI Ad's (Enis)/260818_Mikroskopaufnahme_QiHome",
    // Datei „QiHome Mikroskop Regeneration" (Wundheilung neuronaler Zellen), 1:1 zugeschnitten.
    video: {
      pfad: 'QiHome_Study_1x1_DE.mp4',
      ersatzbild:
        'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/qb-produktseite-stimmen--qihome-study-poster-de--ff5ab637c21d.jpg?v=1794875839',
      bildzeile: 'Echtzeit-Aufnahme aus der Studie. Oben ohne Schutz: die Lücke bleibt offen. Unten neben dem QiHome® Air: die Nervenzellen wachsen wieder zusammen.',
    },
    quelle: 'Veröffentlicht in Neurodegenerative Diseases: Current Research, 2026',
    link: {text: 'Zur Studie', href: '/pages/studie-qihome-air'},
  },
};

/** Der Bereich eines Handles oder null (unbekannt oder abgeschaltet). */
export function zellvideoBereich(handle) {
  const b = ZELLVIDEO_BEREICH[handle];
  return b && b.aktiv ? b : null;
}
