/*
 * ohne-risiko-daten.js — Texte und Schalter des Abschnitts „ohne Risiko
 * kaufen" auf der Kaufseite /products/qibracelet (und ihrem Spiegel
 * /pages/qibracelet, dieselbe Komponente QiBraceletSeite). Komponente:
 * ./OhneRisikoKaufen.jsx, Stil: styles/qb-ohne-risiko.css (.qb-or), Test:
 * ./ohne-risiko-daten.test.mjs.
 *
 * WARUM (Auftrag zs-marke-energie-schmuck-20260927-s02, Zielsteuerung, KPI „Marke zum
 * Thema Energie Schmuck", 26.10.2026): zwei der fünf Kundenfragen dieser KPI
 * fragen nach Rückgabe und Raten. Für Raten stand Qi Blanco in 0 von 6
 * Läufen (11.–25.10.) auf Seite 1 von google.de. Die Kaufseite beantwortet
 * beides nur als Akkordeon-Knopf ohne Überschrift („Wie funktioniert die
 * Finanzierung über Klarna?") und weit unten in Markenform. Hier stehen die
 * zwei Fragen so, wie Kunden sie stellen, als Überschrift, die Antwort offen
 * darunter (Gewinnermuster D1, seo-manager konzept-serp-testsystem).
 *
 * KEIN NEUER TEXT: jede Aussage ist Bestand.
 *  - Rückgabe: app/data/kauf-tatsachen.js FRISTEN `ruecknahme` (importiert,
 *    nicht kopiert) und der Satz zum Widerrufsrecht aus app/data/faq-seite.js
 *    FAQ_KAUF („Dieser 20-Tage-Test gilt zusätzlich zum gesetzlichen
 *    Widerrufsrecht von 14 Tagen."). Die Frage ist wörtlich die der FAQ seit
 *    2026-10-09 (KI-Lernschleife). Die Rückgabe hängt am Zeitraum, nie am
 *    Spüren (ads-Falle F-002): kein Halbsatz „wenn du nichts merkst".
 *  - Raten: „mit 0 % Finanzierung mit PayPal und Klarna" ist Christians
 *    Wortlaut vom 28.09.2026 (reusables/KaufZusage.jsx); Staffel und die zwei
 *    Einschränkungen aus kauf-tatsachen.js IM_PREIS `raten` und der
 *    Footer-Fußnote 2. Den Bestandssatz „garantiert ist sie nicht" sagt die
 *    Antwort positiv („entscheiden Klarna und PayPal"), gleicher Inhalt: der
 *    KI-Klang-Richter verwarf ihn am 26.10.2026 (3 von 3).
 *
 * RATEN NICHT NACH MARKT AUSGEBLENDET, anders als die Kaufzusage-Zeile: die
 * Zeile dort ist ein Versprechen ohne Einschränkung und steht deshalb nur im
 * Markt DE. Diese Antwort nennt die Einschränkung (deutscher Wohnsitz) selbst,
 * wie die FAQ. Und der Markt hängt am Land des Abrufs
 * (oxygen-buyer-country, lib/markt-pricing.js resolveCountry): ein Abruf aus
 * den USA bekommt die Kaufzusage-Zeile nicht (gemessen 26.10.2026 mit
 * ?markt=US). Eine marktabhängige Überschrift sähe Google, das meist aus den
 * USA liest, nie.
 *
 * DER WEG ZUR SAUNA-ANTWORT (SAUNA_WEG): eine sichtbare Zeile direkt unter dem
 * Block „Kunden fragen", dessen erste QiBracelet-Frage Wasser und Sauna ist.
 * Er führt auf /pages/armband-duschen-sauna, die Seite, deren Titel die
 * Kundenfrage stellt. Nicht IN den Block geschrieben: AmazonStil.jsx und
 * amazonstil-daten.js sind mit /products/qione-2-pro und /products/qihome-air
 * geteilt, und jede Änderung dort zöge beide Seiten in den Deploy (Gate 12,
 * gemessen 26.10.2026). Diese Datei und OhneRisikoKaufen.jsx erreicht nur die
 * QiBracelet-Seite. Linktext wie im Lexikon-Eintrag Elektrosmog
 * (data/lexikon.js).
 *
 * RÜCKWEG OHNE CODE-LOGIK: OHNE_RISIKO.seiten = [] (kein Abschnitt) und
 * SAUNA_WEG.seiten = [] (keine Zeile); beide aus = Seite byte-gleich zum Stand
 * davor. Mit Code: hb-deploy revert.
 *
 * Nur relative Importe, kein React: läuft unter `node --test` ohne Build.
 */
import {FRISTEN} from '../../data/kauf-tatsachen.js';

const ruecknahme = FRISTEN.find((f) => f.id === 'ruecknahme');

export const OHNE_RISIKO = {
  // Schalter: Seiten (Handle), auf denen der Abschnitt steht. [] = aus.
  // Nur das QiBracelet: /products/qione-2-pro bleibt unberührt, dort nahm
  // die Rankingwache am 18.10.2026 eine FAQ-Änderung zurück.
  seiten: ['qibracelet'],
  // Eine Überschrift für die eine Absicht, im Kundenwort (Elektrosmog,
  // Armband) und mit beiden Fragen.
  titel: 'Elektrosmog-Armband ohne Risiko kaufen: Rückgabe und Ratenzahlung',
  fragen: [
    {
      id: 'elektrosmog-armband-zurueckgeben',
      // Wörtlich FAQ_KAUF[0].q (faq-seite.js), so wie die Frage gesucht wird.
      frage: 'Kann man ein Elektrosmog-Armband zurückgeben, wenn es keine Wirkung zeigt?',
      absaetze: [
        `Ja. ${ruecknahme ? ruecknahme.text : ''}`.trim(),
        'Die 20 Tage gelten zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen.',
      ],
    },
    {
      id: 'elektrosmog-schutz-raten',
      // Wörtlich die KPI-Frage (seo-manager conf/ki-fragen.yaml, dach-raten).
      frage: 'Kann man Elektrosmog-Schutz in Raten bezahlen?',
      absaetze: [
        'Ja, mit 0 % Finanzierung mit PayPal und Klarna. Bei Klarna sind ab 25 € ' +
          'Warenwert 6 Monatsraten möglich, ab 500 € 12 und ab 1.000 € bis zu 24. ' +
          'Die Ratenzahlung wählst du an der Kasse.',
        'Ob die Ratenzahlung möglich ist, entscheiden Klarna und PayPal bei der Bestellung. ' +
          'Möglich ist sie derzeit für Kundinnen und Kunden mit deutschem Wohnsitz.',
      ],
    },
  ],
};

/** Steht der Abschnitt auf dieser Seite (Schalter: OHNE_RISIKO.seiten)? */
export function ohneRisikoAn(handle, daten = OHNE_RISIKO) {
  return Array.isArray(daten?.seiten) && daten.seiten.includes(handle);
}

export const SAUNA_WEG = {
  // Schalter wie oben. [] = aus.
  seiten: ['qibracelet'],
  vorspann: 'Wasser, Duschen und Sauna:',
  pfad: '/pages/armband-duschen-sauna',
  text: 'Kann man ein Armband gegen Elektrosmog beim Duschen und in der Sauna tragen?',
};
