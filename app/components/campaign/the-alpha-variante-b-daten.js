/**
 * THE ALPHA, Variante B (Server/Designmeister): was B über Christians
 * Geschichte hinaus hat, Seite /pages/The-Alpha-C.
 *
 * SEIT 26.10.2026 (Grossjob 20261026-prio1-the-alpha-variante-a-designmeister-
 * premium-gestaltung, s02): B erzählt dieselbe Film-Geschichte wie A
 * (Christian Z7/Z8: „gleiche Geschichte und Kernaussage, andere Feinheiten“).
 * Die Fassung vom 25.10. begann mit „Ruhe, Schutz und ein Diamant für nur 111
 * Menschen“ und hatte Christians Konzept verlassen (Z6). Ihre Texte (Nutzen-
 * Block, Inhalt, Belege, Einwände, Preisanker) stehen im git-Verlauf dieser
 * Datei; was davon trägt, ist hier zu Akzenten und Fragen verdichtet.
 *
 * DIE FEINHEIT VON B (Z9): unter Christians drei Zeilen je Kapitel ein kurzer
 * Satz, was das für den Menschen heißt. Christians Wortlaut, Bilder und die
 * Datenstelle des Knopfs kommen aus the-alpha-daten.js (importiert, nicht
 * kopiert).
 *
 * QUELLEN DER AUSSAGEN (nichts erfunden, alles aus der Fassung vom 25.10.):
 *  - Schlaf und Energie: häufigste Rückmeldungen in 171 Erfahrungsberichten
 *    zum Gitterchip™ (STUDIEN_FAKTENBLATT.md e0004), darum „erzählen viele
 *    unserer Kunden“. Keine Zellwerte auf Qi-Alpha-Seiten (Christian 28.09.).
 *  - Ohne Strom, ohne Akku; Wasser, Salz, Schweiß, Hitze: Christians FAQ zum
 *    Qi Master (app/data/product-faqs.js).
 *  - Ohne Elektronik, ohne Verschleiß; Politur von Hand; fester Preis;
 *    Versand ab Mitte Januar 2027; 20 Tage testen: Christians Sätze der
 *    Kaufseite /products/qi-alpha-b.
 *  - Live 08.11.: Christian 25.10. (NACHTRAG-CHRISTIAN-entscheidungen-
 *    2026-10-25.md), Termin aus coming-home/config/themen.json.
 */

/** Nutzen-Akzent je Kapitel, ein Satz, als Zustand des Menschen. */
export const TAB_AKZENT = {
  manifestation: 'Ruhige Nächte, wache Tage: davon erzählen viele unserer Kunden.',
  protection:
    'Schutz vor Strahlung, jeden Tag und überall: ohne Strom, ohne Akku, auch in Dusche, Sauna und Meer.',
  longevity:
    'Ein Begleiter für dein Leben: ohne Elektronik, ohne Verschleiß, von Goldschmieden von Hand poliert.',
};

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files';

/** Bildwahl von B für Longevity: die Unterseite mit der Gravur „Made in
 * Germany“, randlos zwischen zwei schwarzen Szenen (Schnitt Hell/Dunkel,
 * Z38). Original-Rendering 2048 px. */
export const TAB_UNTERSEITE = {
  url: `${CDN}/qi-alpha-04-unterseite.jpg?v=1792849274`,
  alt: 'Unterseite des Qi Alpha mit der Gravur Made in Germany',
  width: 2048,
  height: 2048,
};

/** Seitenansicht für die Szene THE ALPHA: dasselbe Seitenband wie A
 * (Zuschnitt 2:1 aus dem Original 05_side), damit der Name in allen drei
 * Varianten am selben Bild aufgeht. */
export const TAB_SEITENBAND = {
  url: `${CDN}/the-alpha-seitenband-2zu1.jpg?v=1793010108`,
  alt: 'Seitenband des Qi Alpha mit der Gravur Qi Alpha',
  width: 1936,
  height: 968,
};

/** Kauf-Element von B im Abschluss: der Preis, kleiner als der Titel, und
 * eine ruhige Zeile darunter. Der Betrag kommt zur Laufzeit von der Kaufseite
 * (Route-Loader); antwortet sie nicht, gilt Christians Endpreis
 * (25.10.2026: „nur einen finalen preis. 10.639€ kein Rabatt, kein nichts.“). */
export const TAB_ABSCHLUSS = {
  festpreis: {amount: '10639.0', currencyCode: 'EUR'},
  zeilen: ['Fester Preis, kein Sale', 'Versand ab Mitte Januar 2027', '20 Tage testen'],
};

/** Live-Vorstellung 08.11., ruhig NACH dem Knopf. */
export const TAB_LIVE = {
  anker: 'live',
  titel: 'Erst live kennenlernen?',
  wann: 'Sonntag, 8. November 2026, 12 Uhr (Berlin), auf Zoom',
  text:
    'Christian stellt den Qi Alpha zum ersten Mal live vor. Du siehst ihn aus nächster Nähe ' +
    'und kannst Christian alles fragen.',
};

/** Fragen vor dem Kauf, hinter dem Abschluss. */
export const TAB_FRAGEN = {
  titel: 'Fragen zum Qi Alpha',
  liste: [
    {
      frage: 'Wirkt das wirklich?',
      antwort:
        'Das findest du am besten selbst heraus: Du trägst deinen Qi Alpha 20 Tage. ' +
        'Spürst du nichts, schickst du ihn zurück und bekommst den vollen Kaufpreis.',
    },
    {
      frage: 'Wird er irgendwann günstiger?',
      antwort:
        'Den Qi Alpha wird es nie in einem Sale geben wie Black Friday oder Sommer Sale. ' +
        'Durch seine sehr aufwendige Herstellung ist der Preis fixiert.',
    },
    {
      frage: 'Wann bekomme ich meinen Qi Alpha?',
      antwort: 'Der Versand startet ab Mitte Januar 2027, weltweit und zu 100 % versichert.',
    },
    {
      frage: 'Kann ich meine Nummer wählen?',
      antwort:
        'Ja. Jeder Qi Alpha trägt eine eigene Seriennummer von 1 bis 111. Deine Wunschnummer kostet ' +
        '2.000 € extra. Ohne Wunschnummer bekommst du beim Versand eine freie Nummer der Serie.',
    },
    {
      frage: 'Kann ich damit in die Sauna oder ins Meer?',
      antwort:
        'Ja. Der Gitterchip™ ist unempfindlich gegenüber Wasser, Chlor, Salzwasser, Schweiß und Hitze. ' +
        'Die Goldkette sollte nicht dauerhaft Chlorwasser ausgesetzt werden.',
    },
    {
      frage: 'Gibt es eine Aufzeichnung vom Live?',
      antwort: 'Ja, wir zeichnen das Live auf. Fragen stellen kannst du Christian aber nur live.',
    },
  ],
};
