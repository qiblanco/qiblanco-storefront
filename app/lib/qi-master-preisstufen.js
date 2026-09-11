/**
 * QiMaster-Vorverkaufstreppe — die Rechnung, EINMAL.
 *
 * WARUM ES DIESE DATEI GIBT: die Treppe steht auf zwei Flächen (Produktseite
 * /products/qi-master und Landingpage /pages/qi-master-vorverkauf) und wird
 * zusätzlich von einer Wache im shop-manager geprüft. Jede Fläche, die selbst
 * rechnet, ist eine zweite Wahrheit; jede hingeschriebene 7.989,89 ist eine
 * dritte. Deshalb: EINE Quelle (app/data/qi-master-preisstufen.json, nur
 * Prozentsätze) und EINE Rechnung (hier).
 *
 * KEINE IMPORTE, ABSICHTLICH: dieses Modul nimmt die Quelle als Argument
 * entgegen, statt sie selbst zu importieren. Nur so lässt es sich aus einem
 * nackten `node` heraus gegen die Python-Kontrollrechnung stellen
 * (claude-jobs/<job>/proben/probe_rechenweg_naht.py) — ein `~/data/…`-Alias
 * wäre dort nicht auflösbar, und die Naht-Probe könnte den ausgelieferten
 * Rechenweg baulich nicht messen.
 *
 * IN CENT GERECHNET: 10639.00 * 0.751 ist in IEEE-754 nicht 7989.889, und wer
 * auf Euro-Ebene rundet, sammelt den Fehler ein. Gerechnet wird deshalb auf
 * ganzen Cent, gerundet genau einmal.
 *
 * RUNDUNGS-NAHT (festgehalten, weil sie heute NICHT weh tut und später schon):
 * `Math.round` rundet den halben Cent nach OBEN, Pythons eingebautes `round()`
 * auf GERADE. Bei den vier heutigen Sätzen entsteht kein halber Cent
 * (798988,9 / 851120,0 / 904315,0 / 957510,0) — bei einem künftigen Satz wie
 * 12,5 % schon (930912,5). Die Python-Kontrollseite rechnet darum mit
 * Decimal+ROUND_HALF_UP, und die Naht-Probe vergleicht beide Wege über ALLE
 * Stufen, nicht über eine. Wer hier `Math.round` ersetzt, bricht diese Naht.
 *
 * NAMEN OHNE UMLAUT-DIGRAPHEN: der Listenpreis heißt im JSON und hier
 * `listenpreis`, die laufende Stufe heißt `aktiv`. Grund ist kein Geschmack,
 * sondern Gate 7b (umlaut_gate): sein Lexikon trifft die Digraph-Schreibweise
 * deutscher Umlaut-Wörter auch mitten in einem Bezeichner — und ein Bezeichner
 * mit echtem Umlaut wäre die schlechtere Antwort. Wer hier umbenennt, prüft mit
 * `python3 homepage-bauer/src/umlaut_gate.py scan <datei>`.
 */

/** Listenpreis (String im JSON, damit er unverfälscht lesbar bleibt) -> ganze Cent. */
export function listenpreisCent(quelle) {
  return Math.round(Number(quelle.listenpreis_brutto_eur) * 100);
}

/**
 * Preis einer Stufe in ganzen Cent.
 * Genau EINE Rundung, am Ende, auf Cent. Siehe Rundungs-Naht im Kopf.
 */
export function preisCent(basisCent, prozent) {
  return Math.round(basisCent * (1 - Number(prozent) / 100));
}

/** 798989 -> '7.989,89' (deutsche Schreibweise, genau so steht sie im HTML). */
export function centText(cent) {
  const negativ = cent < 0;
  const s = String(Math.abs(cent)).padStart(3, '0');
  const ganz = s.slice(0, -2);
  const nach = s.slice(-2);
  const mitPunkt = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${negativ ? '-' : ''}${mitPunkt},${nach}`;
}

/**
 * 24.9 -> '24,9' · 20 -> '20'.
 * Ein naheliegendes `String(p).replace(/\.?0+$/,'')` machte aus 20 eine 2 —
 * dieselbe Falle hat s01 schon einmal live gefunden. Deshalb über die Stellen,
 * nie über einen Zeichen-Abschnitt.
 */
export function satzText(prozent) {
  return String(Number(prozent)).replace('.', ',');
}

/**
 * Heutiges Datum in der Zeitzone der Quelle als 'YYYY-MM-DD'.
 * Über Intl, nicht über einen Stundenversatz: Berlin wechselt zweimal im Jahr
 * den Versatz, und die Stufengrenzen liegen auf Monatsersten — ein falscher
 * Versatz verschöbe den Stufenwechsel um bis zu zwei Stunden ins Vortagsdatum.
 */
export function tagIn(zeitzone, jetzt = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zeitzone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(jetzt);
}

/**
 * Die heute laufende Stufe. Grenzen sind INKLUSIV: der 30.09. gehört noch zur
 * September-Stufe, der 01.10. schon zur Oktober-Stufe. `von: null` heißt
 * "seit jeher", `bis: null` heißt "ohne Ende".
 * Gibt null zurück, wenn keine Stufe trägt — das ist eine Lücke in der Quelle
 * und wird von der Fläche als "keine Aussage" behandelt, nie als 0 %.
 */
export function aktiveStufe(quelle, jetzt = new Date()) {
  const heute = tagIn(quelle.zeitzone, jetzt);
  return (
    quelle.stufen.find(
      (s) => (!s.von || s.von <= heute) && (!s.bis || heute <= s.bis),
    ) ?? null
  );
}

/**
 * Die Zeilen, die der Kunde sieht: alle Stufen mit `in_tabelle !== false`.
 * Die Vorlaufstufe ist keine Zeile — sie entscheidet nur, welche Zeile als
 * laufend markiert ist.
 */
export function tabellenZeilen(quelle, jetzt = new Date()) {
  const basis = listenpreisCent(quelle);
  const laufende = aktiveStufe(quelle, jetzt);
  return quelle.stufen
    .filter((s) => s.in_tabelle !== false)
    .map((s) => {
      const cent = preisCent(basis, s.prozent);
      return {
        id: s.id,
        prozent: Number(s.prozent),
        zeitraum: s.zeitraum ?? '',
        preisCent: cent,
        ersparnisCent: basis - cent,
        preisText: centText(cent),
        ersparnisText: centText(basis - cent),
        satzText: satzText(s.prozent),
        aktiv: Boolean(laufende) && laufende.id === s.id,
      };
    });
}

/**
 * Alles, was eine Fläche braucht — in EINEM Aufruf, damit keine Seite ihre
 * eigene Teilrechnung baut. Wird SERVERSEITIG (im Loader) aufgerufen: welche
 * Stufe läuft, hängt am Datum, und ein erst im Browser berechneter Wert stünde
 * nicht im ausgelieferten HTML — die Abnahme-Probe könnte ihn dann baulich
 * nicht sehen, und zwischen Server- und Browser-Datum entstünde an jedem
 * Stufenwechsel ein Hydrations-Widerspruch.
 */
export function treppe(quelle, jetzt = new Date()) {
  const laufende = aktiveStufe(quelle, jetzt);
  const zeilen = tabellenZeilen(quelle, jetzt);
  const groesste = zeilen.reduce(
    (a, z) => (z.ersparnisCent > a ? z.ersparnisCent : a),
    0,
  );
  const kleinste = zeilen
    .filter((z) => z.ersparnisCent > 0)
    .reduce((a, z) => (z.ersparnisCent < a ? z.ersparnisCent : a), Infinity);
  return {
    zeilen,
    listenpreisText: centText(listenpreisCent(quelle)),
    aktivId: laufende?.id ?? null,
    vorlaufHinweis:
      laufende && laufende.in_tabelle === false ? (laufende.hinweis ?? '') : '',
    nieRabattAb: quelle.nie_rabatt_ab,
    /** Was Warten kostet: beste minus schwächste Rabattstufe. */
    spannweiteText:
      Number.isFinite(kleinste) && groesste > kleinste
        ? centText(groesste - kleinste)
        : '',
  };
}
