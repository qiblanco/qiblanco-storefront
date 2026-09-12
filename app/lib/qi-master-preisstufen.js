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
 * DIE RUNDUNGSREGEL IST EINE EINGABE, KEIN CODE (seit 2026-09-12): sie steht im
 * Feld `rundung` der Quelle, und ALLE Rechenwege lesen sie von dort — dieser
 * hier, die stehende Wache shop-manager/src/qm_quelle.py und die
 * Python-Kontrollrechnung qm_stufen.py. Vorher stand dieselbe Regel dreimal als
 * Code da, und genau das ist schiefgegangen: der Shop rundete kaufmännisch auf
 * Cent (7.989,89), die Mailkette abwärts auf volle Euro (7.989) — zwei
 * Kundenflächen, zwei Preise für dasselbe Stück.
 *
 * WARUM DAS FELD UND NICHT VIER EDITS: die Python-Seiten lesen die Quelle per
 * `git show origin/main:…`. Solange das Feld dort nicht steht, verhalten sie
 * sich unverändert; in dem Moment, in dem es landet, kippen alle Rechenwege
 * ZUGLEICH. Ohne diesen Schalter gäbe es ein Fenster, in dem die eine Seite
 * schon abwärts und die andere noch kaufmännisch rundet — und die Naht-Probe
 * meldete einen Widerspruch, den niemand gebaut hat.
 *
 * FEHLT das Feld, gilt die alte kaufmännische Cent-Rundung (rückwärtskompatibel
 * für einen älteren Stand der Quelle). Ein UNBEKANNTER Wert ist ein Fehler und
 * nie stillschweigend die alte Regel: eine Rundungsregel, die man errät, ist
 * genau die zweite Wahrheit, die dieses Modul verhindern soll.
 *
 * RUNDUNGS-NAHT (sie besteht weiter, sie hat nur eine zweite Stufe bekommen):
 * `Math.round` rundet den halben Cent nach OBEN, Pythons eingebautes `round()`
 * auf GERADE — die Python-Kontrollseite rechnet darum mit Decimal+ROUND_HALF_UP.
 * Unter `abrunden_ganze_euro` kommt ein zweiter Schritt dazu, und der ist der
 * heiklere: vor dem Abschneiden auf ganze Euro wird das IEEE-754-Rauschen auf
 * Milli-Cent weggeschnappt. Ohne das macht ein Satz, der rechnerisch GENAU auf
 * einem Euro landet, aus 900000,0000000001 bzw. 899999,9999999999 einmal 9000
 * und einmal 8999 — ein Ein-Euro-Sprung aus reiner Gleitkomma-Laune, und er
 * träfe nur eine der beiden Seiten. Die Naht-Probe vergleicht beide Wege über
 * ALLE Stufen, nicht über eine.
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

/** Die beiden Rundungsregeln, die die Quelle nennen darf. */
export const RUNDUNG_CENT = 'kaufmaennisch_cent';
export const RUNDUNG_EURO = 'abrunden_ganze_euro';

/**
 * Die Rundungsregel der Quelle — gelesen, nicht geraten.
 * Fehlt `rundung`, gilt die alte kaufmännische Cent-Rundung (ein älterer Stand
 * der Quelle rechnet damit unverändert weiter). Ein unbekannter Wert wirft:
 * ohne gültige Regel gibt es keinen Preis, und ein stiller Rückfall auf die
 * alte Regel wäre von einer richtigen Rechnung nicht zu unterscheiden.
 */
export function rundungsregel(quelle) {
  const r = quelle?.rundung ?? RUNDUNG_CENT;
  if (r !== RUNDUNG_CENT && r !== RUNDUNG_EURO) {
    throw new Error(
      `qi-master-preisstufen: unbekannte Rundungsregel ${JSON.stringify(r)} — ` +
        `erlaubt sind '${RUNDUNG_CENT}' und '${RUNDUNG_EURO}'`,
    );
  }
  return r;
}

/**
 * Preis einer Stufe in ganzen Cent.
 *
 * `kaufmaennisch_cent`: genau EINE Rundung, am Ende, auf Cent.
 * `abrunden_ganze_euro`: danach ABWÄRTS auf den vollen Euro. Die Richtung ist
 * tragend und Christians Vorgabe — der Kunde zahlt nie mehr, als die
 * Prozentrechnung ergäbe; der genannte Satz ist die Überschrift, der genannte
 * PREIS ist der verbindliche, und der tatsächliche Nachlass liegt dadurch
 * minimal über dem Satz.
 *
 * Das `* 1000` vor dem Abschneiden ist kein Zierrat: es schnappt das
 * IEEE-754-Rauschen auf Milli-Cent weg, bevor `Math.floor` urteilt. Siehe
 * Rundungs-Naht im Kopf.
 */
export function preisCent(basisCent, prozent, rundung = RUNDUNG_CENT) {
  const roh = basisCent * (1 - Number(prozent) / 100);
  if (rundung === RUNDUNG_EURO) {
    return Math.floor(Math.round(roh * 1000) / 1000 / 100) * 100;
  }
  return Math.round(roh);
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
 * 798900 -> '7.989' unter `abrunden_ganze_euro`, sonst '7.989,00'.
 *
 * DIE NACHKOMMASTELLEN FOLGEN DER REGEL, NICHT DEM WERT. Das ist der
 * Unterschied, an dem man sich hier vertut: ein wertgetriebenes „lass ',00'
 * weg, wenn der Betrag glatt ist" schriebe unter der CENT-Regel aus dem
 * Listenpreis 10.639,00 ein '10.639' — und das ist genau die Zeile, die heute
 * live mit Nachkommastellen dasteht. Gefragt ist die Regel der Quelle.
 *
 * Christians Vorgabe für die Euro-Regel lautet ausdrücklich „keine
 * Nachkommastellen"; ein '7.989,00' wäre rechnerisch richtig und trotzdem die
 * falsche Zeile, weil die Mail '7.989' schreibt.
 */
export function betragText(cent, rundung = RUNDUNG_CENT) {
  if (rundung !== RUNDUNG_EURO) return centText(cent);
  const euro = Math.round(cent / 100);
  return String(euro).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
  const regel = rundungsregel(quelle);
  const laufende = aktiveStufe(quelle, jetzt);
  return quelle.stufen
    .filter((s) => s.in_tabelle !== false)
    .map((s) => {
      const cent = preisCent(basis, s.prozent, regel);
      return {
        id: s.id,
        prozent: Number(s.prozent),
        zeitraum: s.zeitraum ?? '',
        preisCent: cent,
        ersparnisCent: basis - cent,
        preisText: betragText(cent, regel),
        ersparnisText: betragText(basis - cent, regel),
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
  const regel = rundungsregel(quelle);
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
    listenpreisText: betragText(listenpreisCent(quelle), regel),
    aktivId: laufende?.id ?? null,
    vorlaufHinweis:
      laufende && laufende.in_tabelle === false ? (laufende.hinweis ?? '') : '',
    nieRabattAb: quelle.nie_rabatt_ab,
    /** Was Warten kostet: beste minus schwächste Rabattstufe. */
    spannweiteText:
      Number.isFinite(kleinste) && groesste > kleinste
        ? betragText(groesste - kleinste, regel)
        : '',
  };
}
