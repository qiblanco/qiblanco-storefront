/**
 * THE ALPHA, Variante C (KI-optimiert): was C über Christians Film-Geschichte
 * hinaus hat, Seite /pages/The-Alpha-B. Seit 26.10.2026 (Grossjob 20261026-
 * prio1-the-alpha-variante-a-designmeister-premium-gestaltung, s03) erzählt C
 * dieselbe Geschichte wie A; die Fassung vom 25.10. (Grossjob 20261025, s05)
 * begann mit „Limited 1st. Edition · nur 111 Stück / Mehr als Schmuck …“ und
 * hatte Christians Konzept verlassen (Z5/Z6).
 *
 * KI-OPTIMIERT HEISST HIER (Christian Z9: „C: KI-optimiert (Messdaten), aber
 * auf derselben Geschichte“): die Messdaten der alten C-Fassung werden zu
 * Feinheiten INNERHALB der Szenen, nicht zu eigenen Abschnitten.
 *  - Länge: C ist der kurze Schnitt. Lernkarte scrollklippe (Klasse A, n=673
 *    und n=16928): keine Sektion der unteren Seitenhälfte erreicht mehr als
 *    2,8 % der Aufrufe. Darum kürzere Bühnen und nichts nach dem Knopf.
 *  - Kauf-Element: ein ruhiger zweiter Knopf nach Protection (Experiment
 *    szs-e1-gs050, Klasse B: Knopf nach dem Mechanismus plus fester Knopf
 *    gewann mobil 23,0 % gegen 18,4 %); die feste Kaufleiste kommt aus dem
 *    Gerüst (Lernkarte sticky-kaufknopf, Klasse A, 14,5 %).
 *  - Abschluss: Preis klein, darunter Rückgabe, Raten und Versand direkt unter
 *    dem roten Knopf. Kaufüberzeugungs-Kanon: Preis (17), Wirkungsskepsis (12)
 *    sind die häufigsten Einwände im Global Deutsch-Shop, Zahlbarkeit (n=52) und
 *    Risikoumkehr (n=22) die Closer. Closer gehören an den Abschluss, nie in
 *    den Hook.
 *
 * Christians Wortlaut (Titel, Wörterbuch, drei Zeilen je Kapitel samt
 * „Starke Zellen.“, Etiketten, Edition) kommt unverändert aus
 * the-alpha-daten.js und wird nicht kopiert.
 *
 * QUELLEN DER ZEILEN (nichts erfunden):
 *  - Preis: Christian 25.10.2026 „nur einen finalen preis. 10.639€ kein
 *    Rabatt, kein nichts.“ Zur Laufzeit kommt der Betrag aus der Storefront.
 *  - 20 Tage: Kaufseite /products/the-alpha „20 Tage volles Rückgaberecht nach
 *    Erhalt der Ware“.
 *  - Raten: Kaufseite /products/the-alpha (PayPal und Klarna, Ratencode von
 *    Anna, qi-salesbot/config/ratencode-anna.conf RATENCODE_ANNA=an).
 *  - Versand: Kaufseite „Versand startet ab Mitte Januar 2027“, „100 %
 *    versicherter weltweiter Versand“.
 */

export const TAC_ABSCHLUSS = {
  // Rückfall, wenn die Storefront nicht antwortet (data-preis-quelle="fest").
  festpreis: {amount: '10639.0', currencyCode: 'EUR'},
  // Direkt unter dem roten Knopf: was das Risiko nimmt und wie man zahlt.
  // Geschützte Leerzeichen halten „Mitte Januar 2027“ und „100 %“ zusammen
  // (Challenger 26.10.: „Januar / 2027“ brach am Handy um).
  sicher: [
    '20 Tage ab Erhalt testen, voller Kaufpreis zurück',
    'Auch in Raten zahlbar',
    'Versand ab Mitte\u00a0Januar\u00a02027, zu 100\u00a0% versichert',
  ],
};
