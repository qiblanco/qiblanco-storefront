/**
 * DER KONSUMENT — eine Quelle, zwei Ausspielungen.
 *
 * Christian, 22.09.2026: „Gib den Inhalt an Anna weiter, damit sie dieselbe
 * Erklärung gibt wie die Seite — eine Quelle, zwei Ausspielungen."
 *
 * DIE QUELLE IST NICHT DIESE DATEI. Sie ist
 *   qi-brain/brain/Marketing/kohaerente-wasserstruktur-gegenueberstellung.yaml
 * (angelegt von Segment s01 dieses Großjobs, jede Zeile dort mit `beleg:` auf
 * Werk und Zeitstelle). Diese Datei ist ihr Storefront-Konsument: sie trägt die
 * Werte in den Bausatz, und sie hält keine eigene Meinung über eine Zahl.
 *
 * WER EINE ZAHL ÄNDERN WILL, ÄNDERT SIE IM SSoT UND ZIEHT DIESE DATEI NACH.
 * Die Naht zwischen beiden misst
 *   homepage-bauer/pruefungen/probe_wasserstruktur_naht_eine_zahlenhaltung__20260922.py
 * Sie wird rot, sobald ein Bauteil eine dieser Zahlen selbst tippt — nicht weil
 * die getippte Zahl falsch wäre, sondern weil sie ab diesem Tag ein zweites Mal
 * gepflegt werden müsste. Zwei Stellen führen dieselbe Größe, und die falsche
 * gewinnt still.
 *
 * DREI ZAHLEN AUS CHRISTIANS SKIZZE STEHEN HIER NICHT, UND DAS IST ABSICHT.
 * s01 hat die Warnke-Quellen gelesen und gemessen: 180° kommt dort nicht vor
 * (der belegte Endpunkt der Aufweitung ist 109,5°), 13,5 eV kommt dort nicht vor
 * (belegt sind 12,06 eV, 12,56 eV, 0,5 eV), und H₃O ist bei Warnke das
 * Hydronium — also die Säure, die hexagonale Strukturen neutralisieren, nicht
 * die Summenformel des geordneten Wassers. Christians eigene Regel dazu lautet:
 * „Findet sich zu einer Zahl keine Fundstelle, wird sie nicht gezeigt."
 * Die Begründung je Wert steht im SSoT unter `widerlegt:`.
 *
 * KEIN SATZ ÜBER DEN MENSCHLICHEN KÖRPER. Christian wörtlich: „Nichts in diesem
 * Element spricht über den menschlichen Körper. Es geht um die Struktur von
 * Wasser." Warnkes Vortrag trägt reichlich körperbezogenes Material; davon geht
 * nichts hier hinein.
 */

/** Die drei Bilder, in der Reihenfolge des SSoT (`bilder:`). */
export const bilder = [
  {
    id: 'winkel',
    titel: 'Der Winkel weitet sich auf',
    text:
      'Nimmt das Wassermolekül Energie auf, rücken seine beiden Wasserstoff-Atome näher an den Sauerstoff. Beide sind positiv geladen, also stoßen sie sich ab, und der Winkel zwischen ihnen wird größer.',
    folge: 'Bei 109,5° entstehen im Wasser hexagonale Strukturen.',
    // `grad` trägt die Zahl, aus der das SVG seine Geometrie RECHNET. Damit
    // kann das Bild nicht von der Beschriftung abweichen: beide kommen aus
    // demselben Wert.
    von: {grad: 104.5, anzeige: '104,5°', was: 'normal'},
    nach: {grad: 109.5, anzeige: '109,5°', was: 'energiereich'},
  },
  {
    id: 'struktur',
    titel: 'Die Struktur ordnet sich',
    text:
      'Flüssiges Bulkwasser ist ungeordnet. Seine Wasserstoffbrücken lösen sich ständig und bilden sich neu. Die hexagonale Struktur hält dieselbe Ordnung fest.',
    folge: 'Hexagonalstruktur gilt Warnke als Anzeichen für energiereiches Wasser.',
    von: {anzeige: 'Bulkwasser', was: 'ungeordnet'},
    nach: {anzeige: 'Hexagonalstruktur', was: 'geordnet'},
  },
  {
    id: 'domaene',
    titel: 'Die kohärente Domäne entsteht',
    text:
      'Wird das Wasser dicht genug und rücken die Moleküle nah genug zusammen, schwingen sie in gleicher Ausrichtung und gleicher Frequenz. Das entstehende Feld zieht weitere Moleküle hinein.',
    folge: 'Der Verband arbeitet auf einem eigenen Energieniveau.',
    schwellen: [
      {anzeige: '0,31 g/cm³', was: 'Dichte'},
      {anzeige: '< 0,3 nm', was: 'Abstand'},
    ],
    energie: {anzeige: '12,06 eV', was: 'Energieniveau'},
  },
];

/** Christians zwei Spalten (SSoT `gegenueberstellung:`). */
export const gegenueberstellung = {
  spalteLinks: 'kohärente Struktur',
  spalteRechts: 'normales Wasser',
  zeilen: [
    {
      id: 'summenformel',
      label: 'Summenformel',
      links: 'H₂O',
      rechts: 'H₂O',
    },
    {
      id: 'hydronium',
      label: 'Hydronium H₃O⁺',
      links: 'wird neutralisiert',
      rechts: 'bleibt als Säure',
    },
    {
      id: 'winkel',
      label: 'Bindungswinkel',
      links: 'bis 109,5°',
      rechts: '104,5°',
    },
    {
      id: 'struktur',
      label: 'Anordnung',
      links: 'hexagonal, geordnet',
      rechts: 'Bulkwasser, ungeordnet',
    },
    {
      id: 'wasserstoffbruecken',
      label: 'Wasserstoffbrücken',
      links: 'halten die Ordnung',
      rechts: 'lösen sich und bilden sich neu',
    },
    {
      id: 'energie',
      label: 'Energieniveau',
      links: '12,06 eV',
      rechts: 'Bezugspunkt',
    },
  ],
};

export const wasserstruktur = {
  titel: 'Kohärente Wasserstruktur',
  einleitung:
    'Wasser verändert seine Form, wenn es Energie aufnimmt. Drei Dinge verschieben sich dabei.',
  bilder,
  gegenueberstellung,
  // Die Aussageklasse steht als eigene Überschrift über dem Absatz, nie als
  // Vorbehalt mitten im Satz.
  einordnung: {
    titel: 'Einordnung',
    text:
      'Warnkes Modell der kohärenten Domänen geht auf Preparata und Del Giudice zurück. Es ist kein Lehrbuch-Konsens der Physikochemie.',
  },
  quelle: 'Warnke, U. (2018): Vortrag Baden-Baden, 3. November 2018.',
};

export default wasserstruktur;
