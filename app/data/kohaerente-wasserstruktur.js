/**
 * DER KONSUMENT — eine Quelle, zwei Ausspielungen.
 *
 * Christian, 22.09.2026: „Gib den Inhalt an Anna weiter, damit sie dieselbe
 * Erklärung gibt wie die Seite — eine Quelle, zwei Ausspielungen."
 *
 * DIE QUELLE IST NICHT DIESE DATEI. Sie liegt im Brain unter
 *   qi-brain/brain/Marketing/ (die Wasserstruktur-Gegenüberstellung, YAML)
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
 * FASSUNG 2 (23.09.2026): DREI STUFEN STATT ZWEI SPALTEN. Christian fragte,
 * ob wir zwischen kohärenter Domäne und hexagonalem Wasser unterscheiden. Die
 * Quellen tragen drei Stufen: normales Wasser, kohärente Domäne, EZ-Wasser
 * (SSoT Teil A2 `stufen`, Tabelle `vergleich`). Die zweispaltige
 * Gegenüberstellung ist entfallen, im Storefront und im SSoT.
 *
 * DREI ZAHLEN AUS CHRISTIANS SKIZZE STEHEN HIER NICHT, UND DAS IST ABSICHT.
 * Den größeren Winkel ordnet Warnkes Buch einem anderen Zustand zu (Rydberg-
 * Zonen-Wasser, keine hexagonale Struktur mehr); die Energieangabe steht in
 * keiner der fünf Quellen; H₃O ohne Ladung ist keine Formel, Pollacks EZ-Formel
 * H₃O₂⁻ steht in der EZ-Spalte. Die Begründung je Wert steht im SSoT unter
 * `widerlegt:` und `weitere_zustaende:`. Christians eigene Regel dazu lautet:
 * „Findet sich zu einer Zahl keine Fundstelle, wird sie nicht gezeigt."
 *
 * KEIN SATZ ÜBER DEN MENSCHLICHEN KÖRPER. Christian wörtlich: „Nichts in diesem
 * Element spricht über den menschlichen Körper. Es geht um die Struktur von
 * Wasser." Warnkes Vortrag trägt reichlich körperbezogenes Material; davon geht
 * nichts hier hinein.
 */

/**
 * Die drei Bilder, in der Reihenfolge des SSoT (`bilder:`): Winkel, Domäne,
 * Struktur. Sie zeigen die Übergänge zwischen den drei Stufen der Tabelle.
 * Die ids bleiben, drei Proben und Annas Vertrag lesen sie.
 */
export const bilder = [
  {
    id: 'winkel',
    titel: 'Der Winkel weitet sich auf',
    text:
      'Nimmt das Wassermolekül Energie auf, rücken seine beiden Wasserstoff-Atome näher an den Sauerstoff. Beide sind positiv geladen, also stoßen sie sich ab, und der Winkel zwischen ihnen wird größer.',
    folge: 'Bei 109,5° entstehen im Wasser hexagonale Strukturen.',
    // `grad` trägt die Zahl, aus der das SVG seine Geometrie RECHNET, auch die
    // Aufweitung dazwischen. Bild und Beschriftung kommen aus demselben Wert.
    von: {grad: 104.5, anzeige: '104,5°', was: 'normal'},
    nach: {grad: 109.5, anzeige: '109,5°', was: 'energiereich'},
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
  {
    id: 'struktur',
    titel: 'Die Struktur ordnet sich',
    text:
      'An Oberflächen hält die Ordnung. Die Moleküle legen sich zu sechseckigen Schichten, Pollack nennt sie EZ-Wasser. Diese Schicht ist weit stabiler als die Domäne.',
    folge: 'Hexagonalstruktur gilt Warnke als Anzeichen für energiereiches Wasser.',
    von: {anzeige: 'normales Wasser', was: 'ungeordnet'},
    nach: {anzeige: 'EZ-Wasser', was: 'hexagonal geordnet'},
  },
];

/**
 * Die drei Stufen (SSoT Teil A2 `stufen:`). `null` heißt: keine der Quellen
 * sagt dazu etwas. Das Fenster zeigt dann einen Strich, nie einen geratenen Wert.
 */
export const stufen = [
  {
    id: 'normal',
    name: 'normales Wasser',
    winkel: '104,5°',
    formel: 'H₂O',
    ordnung: 'Wasserstoffbrücken lösen sich und bilden sich neu',
    energie: 'Grundzustand',
    bestaendigkeit: 'Brücken halten Sekundenbruchteile',
    ort: 'zwischen den Domänen',
    hydronium: 'bleibt als Säure',
  },
  {
    id: 'domaene',
    name: 'kohärente Domäne',
    winkel: '109,5°',
    formel: 'H₂O',
    ordnung: 'Moleküle schwingen im Gleichtakt',
    energie: '12,06 eV',
    bestaendigkeit: 'wechselt ständig mit normalem Wasser',
    ort: 'Inseln im Wasser',
    hydronium: null,
  },
  {
    id: 'ez',
    name: 'EZ-Wasser',
    zusatz: 'hexagonal geordnet',
    winkel: '109,5°',
    formel: 'H₃O₂⁻',
    ordnung: 'sechseckige Schichten',
    energie: '12,06 eV',
    bestaendigkeit: 'weit stabiler als die Domäne',
    ort: 'an Oberflächen',
    hydronium: 'wird neutralisiert',
  },
];

/**
 * Die Vergleichstabelle (SSoT `vergleich:`): Spalten in der Reihenfolge von
 * `stufen`, Zeilen mit Label, die Werte liest das Bauteil aus `stufen`.
 * Christian: „Keine Zeile mit gleichem Wert in allen Spalten."
 */
export const vergleich = {
  spalten: ['normal', 'domaene', 'ez'],
  zeilen: [
    {feld: 'winkel', label: 'Bindungswinkel'},
    {feld: 'ordnung', label: 'Ordnung'},
    {feld: 'formel', label: 'Formel'},
    {feld: 'energie', label: 'Energieniveau'},
    {feld: 'bestaendigkeit', label: 'Beständigkeit'},
    {feld: 'ort', label: 'Wo'},
    {feld: 'hydronium', label: 'Hydronium H₃O⁺'},
  ],
};

export const wasserstruktur = {
  titel: 'Kohärente Wasserstruktur',
  einleitung:
    'Wasser verändert seine Form, wenn es Energie aufnimmt. Drei Dinge verschieben sich dabei.',
  bilder,
  stufen,
  vergleich,
  // Die Aussageklasse steht als eigene Überschrift über dem Absatz, nie als
  // Vorbehalt mitten im Satz. Die Sätze sind die `grenzen` des SSoT ohne die
  // mit „Kein" beginnenden: die sind Verbote an Anna und keine Auskunft
  // (dieselbe Regel wie Annas Generator).
  einordnung: {
    titel: 'Einordnung',
    saetze: [
      'Warnke stützt sich auf das Modell kohärenter Domänen von Preparata und Del Giudice.',
      'Das EZ-Wasser hat Prof. Dr. Gerald H. Pollack beschrieben. Del Giudice leitet es aus den kohärenten Domänen ab.',
    ],
  },
  // SSoT `quelle_anzeige`, eine Zeile je Werk.
  quelle: [
    'Warnke, U. (2018): Vortrag Baden-Baden, 3. November 2018, und Bionisches Wasser.',
    'Pollack, G. H. (2013): The Fourth Phase of Water.',
    'Del Giudice, E. u. a. (2015): Fields of the Cell, S. 95–111.',
  ],
};

export default wasserstruktur;
