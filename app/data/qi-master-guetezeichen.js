/**
 * Die drei Gütezeichen über den Diamantbildern auf /products/qi-master —
 * Zeile und Symbol an EINER Stelle.
 *
 * Christian am 2026-09-17: „Optisch grösser machen — also 3 zentrale
 * Qualitätselemente, wieder goldene Gimmicks dazu entwerfen. Und oberhalb der
 * Diamantenbilder anbringen."
 *
 * WAS SICH GEGENÜBER DEM 2026-09-16 GEÄNDERT HAT: der Block stand als vier
 * mittige Zeilen UNTER den Bildern (QiMaster.jsx, `RisikofreiErleben`), die
 * erste davon die Überschrift „Lass dich vom Qi Master® tragen." Christian hat
 * diese Zeile gestrichen und den Rest nach oben geholt. Aus einer Fusszeile
 * unter dem Bildpaar wird damit ein eigener Block davor — das ist die
 * Bewegung, und die Schriftgrösse trägt sie mit.
 *
 * DIE ÜBERSCHRIFT IST ZURÜCK, SEIT DEM 2026-09-22 (Christian, Auftrag
 * CW-20260922-9561b2f2): „Lass dich vom Qi Master® tragen." steht wieder an
 * der ersten Stelle des Blocks, jetzt als Überschrift ÜBER den drei
 * Gütezeichen in ihrer neuen Form — nicht als Wiederbelebung des alten
 * `RisikofreiErleben`-Blocks unter den Bildern. Der 17.09. (Streichung, PR
 * #482) ist in DIESEM einen Punkt abgelöst, nicht verletzt: Christian am
 * 2026-09-23, CW-20260923-b67684aa, „Bei solchen Fällen immer die neueste
 * Version vom Datum her nehmen." Die zwei anderen Sätze vom 17.09. bleiben
 * gestrichen. Gebaut von Job
 * 20260922-zwanzig-tage-block-vier-zeilen-und-die-probe-misst-wieder-das-soll-wv1.
 *
 * DIE ÜBERSCHRIFT IST KEIN VIERTES GÜTEZEICHEN: sie trägt kein Symbol und
 * keine Zusage, sie steht deshalb nicht in QIMASTER_GUETEZEICHEN, sondern
 * daneben. Die Liste bleibt drei Einträge lang.
 *
 * WARUM DIE TEXTE HIER UND NICHT IM MARKUP LEBEN: dieselbe Trennung, die
 * qi-master-texte.js und qi-master-diamantbilder.js tragen — jede Aussage
 * steht bei ihrer Quelle.
 *
 * DIE ZEILEN SIND WORTGENAU CHRISTIANS FASSUNG und werden nicht geglättet.
 * „100%" ohne Leerzeichen, der Punkt am Ende jeder Zeile: so getippt, so
 * gesetzt.
 *
 * DIE SYMBOLE SIND SELBST GEZEICHNET, kein fremdes Zeichensatz-Symbol
 * übernommen. Machart wie im Haus (MmKit.jsx, ExclusiveSolutions.jsx):
 * viewBox 0 0 24 24, fill none, stroke currentColor, runde Enden. Die
 * Strichstärke ist 2 statt der 1.5 des Bestands — Christians „optisch grösser"
 * gilt dem ganzen Block, und ein 1.5er Strich wird neben 20-25px Schrift dünn.
 *
 * KEINE FESTE FARBE IN DER ZEICHNUNG, und das ist der Punkt, den Christian
 * ausdrücklich nennt: „golden heißt hier: in der Farbe, die das Haus für diese
 * Zeichen verwendet — nicht ein hart eingetragenes Gelb." `currentColor` holt
 * sie aus dem Stylesheet, dort steht `--color-accent-primary` — derselbe Wert,
 * den `.BenefitList svg` und `.qm-kopfsymbol` ziehen. Wechselt das Haus seinen
 * Akzent, wechseln die drei mit.
 *
 * KEIN COUNTDOWN, KEINE SANDUHR (GL-SPR-0009). Das Kalenderblatt zeigt eine
 * Frist, die dem Kunden GEHÖRT — es zählt nichts herunter.
 *
 * WARUM NUR PFADE UND KEIN <circle>: ein einziger Knotentyp hält das Markup
 * uniform und die Zeichnungen untereinander vergleichbar. Der Kreis von
 * `zufriedenheit` ist deshalb als Pfad geschrieben (zwei Halbbögen, r=9).
 */
// Christians Wortlaut vom 2026-09-22, mit ®, nicht umformuliert.
export const QIMASTER_GUETE_UEBERSCHRIFT = 'Lass dich vom Qi Master® tragen.';

export const QIMASTER_GUETEZEICHEN = [
  {
    id: 'zufriedenheit',
    text: '100% Zufriedenheitsgarantie.',
    // Haken im Kreis.
    pfade: ['M21 12a9 9 0 1 1-18 0 9 9 0 1 1 18 0', 'M8 12.3l2.9 2.9L16.3 9'],
  },
  {
    id: 'zwanzig-tage',
    text: '20 Tage nach Erhalt testen.',
    // Kalenderblatt mit zwei Aufhängern und zwei Eintragszeilen.
    pfade: [
      'M3 7.5a2.5 2.5 0 0 1 2.5-2.5h13A2.5 2.5 0 0 1 21 7.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5z',
      'M3 10h18',
      'M8 3v4',
      'M16 3v4',
      'M7.5 14h9',
      'M7.5 17h5',
    ],
  },
  {
    id: 'erstattung',
    text: '100% Geld-zurück-Garantie.',
    // Zurückweisender Pfeil: ein Bogen, der nach links zurückläuft.
    pfade: ['M20.5 16.5A8 8 0 0 0 12.5 8.5H4.5', 'M8.5 4.5L4.5 8.5l4 4'],
  },
];
