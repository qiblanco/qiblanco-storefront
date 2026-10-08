/**
 * TEXTE der Stufe-B-Seite /pages/menschen-alltag — EINE Stelle für jeden neuen
 * Satz der Seite (Grossjob 20261007-GROSSJOB-funnel-manager-customer-journey-
 * ad-lp, s02).
 *
 * HERKUNFT: jeder Block kommt aus der Text-Werkstatt (text-werkstatt/bin/
 * schreibe --zweck lp-block, Sprachmodul Christian) und ist dort mit seiner
 * Text-ID registriert und an den Test fm-b1-menschen-alltag:b gebunden.
 * Freigabe je Block: Menschlichkeits-Freigabe mit --freigabe --zweck lp-block
 * (Werkzeug im Modul menschlichkeit/bin, exit 0). Gewählt wurde auf Seitenebene, damit kein Satz zweimal auf der
 * Seite steht. Verändert wurde KEIN Wort — die Zeichenketten unten sind
 * maschinell aus den Werkstatt-Ergebnissen übernommen (Überschrift = erste
 * Zeile, Absätze = Leerzeilen-Blöcke).
 *
 * PLATZ FÜR CHRISTIANS WORTLAUT (marken-stimme: „Den Seitentext schreibt
 * Christian selbst"): jede Textstelle der Seite trägt data-textplatz=
 * "menschen-alltag.<block>". Setzt Christian seinen Text ein, ersetzt er hier
 * genau einen Block; die Seite selbst bleibt unverändert.
 *
 * NICHT HIER: der Kaufweg (Knopftext, Preis, Vertrauenszeile, Produktkarten)
 * gehört A und steht in MenschenAlltag.jsx; die Menschen-Karten zeigen die
 * schon veröffentlichten Zusammenfassungen aus app/data/erfahrungen-beitraege.js.
 */
export const MENSCHEN_ALLTAG_TEXTE = Object.freeze({
  kopf: Object.freeze({
    ueberschrift: "Ruhe zu Hause, obwohl überall WLAN ist",
    absaetze: Object.freeze([
      "Warum fühlen sich so viele Menschen gerade nicht mehr sicher? Handy, WLAN und Laptop laufen den ganzen Tag, auch abends auf dem Sofa.",
      "Viele, die den QiOne 2 Pro jeden Tag tragen, erzählen, dass die Sicherheit zurückkommt. Abends wird es ruhiger, und der Schlaf wird tiefer. Schau ihn dir in Ruhe an.",
    ]),
    // Werkstatt tw-20261007-lp-aa1e05, Lauf 20261007T053021Z-lp-block-9a7384, Fassung A;
    // Freigabe 2026-10-07: gesamt 84, Menschlichkeit 82.
    text_id: "tw-20261007-lp-aa1e05",
  }),
  einwand: Object.freeze({
    ueberschrift: "Wirkt das überhaupt?",
    absaetze: Object.freeze([
      "Tiefer Schlaf und innere Ruhe, das berichten viele von unseren Kunden. Wie stark du es spürst, ist bei jedem anders.",
      "Christian Bauer hat Maschinenbau studiert und den QiOne 2 Pro entwickelt. Im Labor von Prof. Dr. Peter C. Dartsch wurde er an menschlichen Zellen unter Belastung getestet, mit einem Schutzeffekt. Das ist Grundlagenforschung im Labor, kein Heilversprechen.",
      "Am Ende zählt, was du in deinem Alltag merkst, und das findest du am besten selbst heraus. Du kannst ihn 20 Tage nach Erhalt risikofrei testen, und überzeugt er dich nicht, bekommst du 100 % zurück.",
    ]),
    // Werkstatt tw-20261008-lp-2fdcfa (registriert 2026-10-08, Job 20261008-aiceo-k2-j4-lp-menschen-alltag-
    // einwand-block-freigabe): Absatz 1 und 2 wortgleich aus tw-20261007-lp-47c3d7 (Lauf 20261007T053734Z-lp-block-
    // 09c3bb, Kandidat 4 von 5); Absatz 3 neu verbunden, weil das KI-Klang-Tor 1.1.0 (menschlichkeit, 08.10.)
    // dort Kurzsatz-Takt (6,5 Woerter je Satz) und den Stakkato-Befehl "Probier es selbst." fand.
    // Freigabe 2026-10-08: gesamt 83, Menschlichkeit 69, KI-Klang p 0,166 (vorher 0,927).
    text_id: "tw-20261008-lp-2fdcfa",
  }),
  produkte: Object.freeze({
    ueberschrift: "Welcher davon passt zu dir?",
    absaetze: Object.freeze([
      "Christian Bauer hat alle drei selbst entwickelt. Den QiOne 2 Pro trägst du als Kette, Tag und Nacht. Das QiBracelet trägst du am Handgelenk, mit eingearbeitetem Gitter, für unterwegs. Den QiHome Air stellst du zu Hause in den Raum, zum Beispiel ins Schlafzimmer.",
      "Die meisten fangen mit dem QiOne 2 Pro an. Hole dir jetzt den QiOne 2 Pro und werde jetzt ein Teil der Revolution. Oder such dir deinen aus.",
    ]),
    // Werkstatt tw-20261007-lp-67478b, Lauf 20261007T055156Z-lp-block-531b40, Fassung A;
    // Freigabe 2026-10-07: gesamt 76, Menschlichkeit 73.
    text_id: "tw-20261007-lp-67478b",
  }),
  schluss: Object.freeze({
    ueberschrift: "Tiefer Schlaf, starker Fokus und innere Ruhe, spürst du das auch?",
    absaetze: Object.freeze([
      "„Seit über zwei Jahren trage ich meinen QiOne 2 Pro und ich möchte ihn nicht mehr missen.“ So steht es in einer Google-Bewertung. Erfahre es jetzt selbst.",
      "20 Tage nach Erhalt risikofrei testen. Passt es nicht, bekommst du dein Geld zurück, ohne Wenn und Aber. Zahlen geht auch in Raten mit Klarna oder PayPal. Jetzt kaufen.",
    ]),
    // Werkstatt tw-20261007-lp-509726, Lauf 20261007T054719Z-lp-block-f9d223, Fassung A;
    // Freigabe 2026-10-07: gesamt 90, Menschlichkeit 79.
    text_id: "tw-20261007-lp-509726",
  }),
});
