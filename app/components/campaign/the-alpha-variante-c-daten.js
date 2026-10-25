/**
 * THE ALPHA, Variante C (KI-optimiert): Texte der Seite /pages/The-Alpha-B
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * Segment s05).
 *
 * WARUM DIESE SEITE: Christian Z5 „noch eine Variante C (AI OPtimiert“, Z6
 * „C wäre dann https://qiblanco.com/pages/The-Alpha-B“. C ist die Fassung, die
 * der Server aus seinen Daten auf den nächsten Klick zur Kaufseite baut. Jede
 * Abweichung von A steht mit ihrem Beleg im Segment-RESULT (Tabelle
 * Änderung | Beleg | Quelle | Belastbarkeitsklasse).
 *
 * EINE DATENSTELLE NUR FÜR DAS, WAS C NEU HAT. Bilder, Kopftext und die drei
 * Säulen der Vorlage kommen aus the-alpha-daten.js (Variante A, Christians
 * Wortlaut) und werden importiert, nicht kopiert.
 *
 * QUELLEN DER AUSSAGEN (nichts erfunden):
 *  - Ruhe/Schlaf und Energie: häufigste Rückmeldungen in 171 Erfahrungs-
 *    berichten zum Gitterchip™ (STUDIEN_FAKTENBLATT.md e0004).
 *  - Fünf Arbeiten aus dem Labor Dartsch: gemessen am QiOne® 2 Pro,
 *    QiBracelet und QiHome Air (pr-manager/wissen/qi-alpha-live-launch.md §3).
 *    Keine Zellwerte auf Qi-Alpha-Seiten (Christian 28.09.).
 *  - Walach: Wortlaut nach pr-manager §3.
 *  - Wasser/Sauna: app/data/product-faqs.js (Qi-Master-FAQ, Christians Satz).
 *  - 20 Tage Rückgaberecht: Kaufseite des Qi Alpha
 *    (app/components/product-pages/QiMaster.jsx, „20 Tage volles
 *    Rückgaberecht nach Erhalt der Ware“) und sales-manager/wissen/
 *    qi-alpha-live-launch.md („20 Tage erleben mit vollem Kaufpreis zurück“).
 *  - NICHT auf dieser Seite: Sterne, „14.000 Nutzer“, Zellwerte, Karat
 *    (für den Qi Alpha gesperrt, pr-manager §3); Raten (Raten-Code am
 *    25.10. noch nicht live, sales-manager: „Bis zur Prüfung keine Raten
 *    zusagen“); Partnercode (die Seite sagt „fester Preis, kein Rabatt“).
 *  - Preis fest, Politur, Versand: Christians Sätze der Kaufseite
 *    /products/qi-alpha-b.
 *  - Ein Diamant, keine Karat-Angabe; 111 Stück; Live 08.11.: Christian
 *    25.10. (NACHTRAG-CHRISTIAN-entscheidungen-2026-10-25.md).
 */

/** Erster Bildschirm: Produkt, Antwort, Preis, Knopf, was das Risiko nimmt. */
export const TAC_HELD = {
  // Christians Wortlaut aus der Vorlage („Limited 1st. Edition“, „111/111“).
  auge: 'Limited 1st. Edition · nur 111 Stück',
  // Idee des stärksten Ads-Hooks im Global Deutsch-Shop (ads.db,
  // tof-unternehmer-h2 „Das ist kein Schmuck. Das ist Technologie.“, CTR 8,75 %
  // bei 89.701 Impressionen) ohne dessen Abgrenzungston, Gegenstand im ersten
  // Satz (Hook-DB K-H-02), danach die Auflage.
  titel: 'Mehr als Schmuck: dein Gitterchip™ mit Naturdiamant, nur 111 Mal',
  gegenstand:
    'Im Qi Alpha steckt unser Gitterchip™ aus 750er Gold, gefasst mit einem hochreinen ' +
    'Naturdiamanten. Du trägst ihn jeden Tag bei dir, und er trägt deine ganz eigene Nummer.',
  // Hinter dem Preis aus der Storefront (Rückfall: TAC_ABSCHLUSS.festpreis).
  preisZusatz: 'fester Preis, nie im Sale',
  // Direkt unter dem Knopf, was das Risiko nimmt (Kanon: Risikoumkehr ist ein
  // Abschluss-Thema; Einwand „Testfrist ab Zustellung rechnen und das sagen“).
  sicher: [
    '20 Tage ab Erhalt in Ruhe testen, voller Kaufpreis zurück',
    'Versand ab Mitte Januar 2027, zu 100 % versichert',
  ],
};

/** Was der Mensch bekommt, der den Qi Alpha trägt. */
export const TAC_NUTZEN = {
  titel: 'Was du mit deinem Qi Alpha bekommst',
  vorteile: [
    {
      id: 'schutz',
      // Christians Wort aus der Vorlage („Starker Schutz.“).
      titel: 'Starker Schutz, Tag und Nacht',
      // Challenger s05 #1: die Messungen gelten anderen Geräten; das steht sichtbar da.
      grundlage:
        'Der Gitterchip™ arbeitet ganz ohne Strom und Akku. Das Labor von Prof. Dr. Dartsch hat ihn ' +
        'in fünf Arbeiten untersucht, gemessen am QiOne® 2 Pro, am QiBracelet und am QiHome Air. ' +
        'Eine eigene Messung am Qi Alpha gibt es noch nicht.',
    },
    {
      id: 'ruhe',
      // Challenger s05 #4: Erfahrung, kein Versprechen (R3-Form), Herkunft der Berichte sichtbar.
      titel: 'Ruhigere Nächte, mehr Energie: davon erzählen Träger',
      grundlage:
        'In 171 Erfahrungsberichten zu unseren Produkten mit Gitterchip™ erzählen Menschen vor allem ' +
        'davon. Berichte zum Qi Alpha selbst gibt es noch nicht, er kommt erst im Januar zu dir.',
    },
    {
      id: 'alltag',
      titel: 'Immer an dir, unter der Dusche wie im Meer',
      grundlage: 'Wasser, Salz, Schweiß und die Hitze der Sauna machen dem Gitterchip™ nichts aus.',
    },
    {
      id: 'einzig',
      titel: 'Einer von 111, und er trägt deine Nummer',
      grundlage:
        'Jeder Qi Alpha hat seinen eigenen Naturdiamanten und eine Seriennummer von 1 bis 111. ' +
        'Die letzte Politur macht ein Goldschmied von Hand.',
    },
  ],
};

/** Was im Qi Alpha steckt (unter den Produktbildern). */
export const TAC_INHALT = {
  titel: 'Was du in der Hand hältst',
  punkte: [
    {
      titel: '„The One Eye“',
      text: 'Ein hochreiner Naturdiamant sitzt mitten im Gitterchip™, rund um das Auge laufen 108 feine Striche.',
    },
    {
      titel: 'Gitterchip™ aus 750er Gold',
      // Christians Wortlaut der Kaufseite (QiMaster.jsx, „Der Gitterchip™ der
      // ultimativen Generation“).
      text:
        'Der Kern des Qi Alpha ist ein zweiteiliger Gitterchip™, definiert durch die über ein ' +
        'Jahrzehnt andauernde Forschung am QiOne®: eine Goldlegierung, deren Atome in einer ' +
        'einmalig definierten Ordnung stehen.',
    },
    {
      titel: 'Deine Nummer',
      text:
        'Jeder Qi Alpha trägt seine eigene Seriennummer von 1 bis 111. Du hast eine Lieblingszahl? ' +
        'Deine Wunschnummer bekommst du für 2.000 € extra.',
    },
    {
      titel: 'Von Hand vollendet',
      // Christians Sätze der Kaufseite (app/data/qi-master-wortlaut.json).
      text:
        'Spezialisten mit jahrzehntelanger Erfahrung begleiten jeden Qi Alpha Stück für Stück durch ' +
        'die Fertigung. Die finale Politur führen Goldschmiede per Hand mit meisterhafter Genauigkeit durch.',
    },
  ],
};

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/** Belege: Menschen mit Namen, nur was im Bestand belegt ist. */
export const TAC_BELEGE = {
  // Challenger s05 #2/#3: „prüft“ klang nach laufender Prüfung des Qi Alpha.
  titel: 'Wer am Gitterchip™ forscht',
  personen: [
    {
      id: 'dartsch',
      name: 'Prof. Dr. Peter C. Dartsch',
      text:
        'Sein Labor hat den Gitterchip™ in fünf veröffentlichten Arbeiten untersucht. ' +
        'Gemessen hat er am QiOne® 2 Pro, am QiBracelet und am QiHome Air.',
      foto: {
        src: `${CDN}webinar-nacht-dartsch-portraet.jpg?v=1792770671`,
        b: 1132,
        h: 1400,
        alt: 'Prof. Dr. Peter C. Dartsch am Mikroskop',
        vermerk: 'Foto: Dartsch Scientific',
      },
      link: {text: 'Alle Arbeiten ansehen', ziel: '/pages/studien'},
    },
    {
      id: 'walach',
      name: 'Prof. Dr. Dr. Harald Walach',
      text:
        'Eine placebokontrollierte Humanstudie mit HRV-Messung ist in Vorbereitung. ' +
        'Prof. Walach berät uns.',
      foto: {
        src: `${CDN}webinar-nacht-walach-portraet.jpg?v=1792770676`,
        b: 1400,
        h: 933,
        alt: 'Prof. Dr. Dr. Harald Walach',
        vermerk: 'Foto: Anja Jahn',
      },
    },
  ],
};

/**
 * Abschluss: die drei Einwände, die im Global Deutsch-Shop vor dem Kauf am
 * häufigsten kommen (Preis, Wirkung, Testzeit), dann Preis und Knopf.
 *
 * PREIS-DREIZEILER OHNE NUTZERZAHL: Sterne und „+ 14.000 Nutzer“ sind
 * Bestandszahlen des QiOne 2 Pro und für den Qi Alpha gesperrt
 * (pr-manager/wissen/qi-alpha-live-launch.md §3, QiMaster.jsx). Den Anker
 * tragen deshalb Christians Edition-Zeilen; Banner „Ultimate Power“ wie im
 * Haus (qb-preisanker.css).
 */
export const TAC_ABSCHLUSS = {
  titel: 'Was dich vielleicht noch beschäftigt',
  fragen: [
    {
      frage: 'Und wenn ich nichts spüre?',
      antwort:
        'Dann musst du ihn nicht behalten. Ab dem Tag, an dem er bei dir ankommt, hast du 20 Tage ' +
        'Zeit, ihn in Ruhe zu tragen. Passt er nicht zu dir, schickst du ihn zurück und bekommst ' +
        'den vollen Kaufpreis.',
    },
    {
      frage: 'Warum kostet er 10.639 €?',
      // Christians Wortlaut der Kaufseite („Durch seine sehr aufwendige Herstellung ...“).
      antwort:
        'Durch seine sehr aufwendige Herstellung ist der Preis fest. Es gibt nur 111 Stück, jedes ' +
        'mit eigenem Naturdiamanten und eigener Nummer, und diese Auflage wird es nie in einem Sale ' +
        'geben, weder am Black Friday noch im Sommer.',
    },
    {
      frage: 'Wann bekomme ich ihn?',
      antwort: 'Ab Mitte Januar 2027 geht dein Qi Alpha auf die Reise, weltweit und zu 100 % versichert.',
    },
  ],
  anker: ['Limited 1st. Edition', '111 Stück, jedes mit eigener Nummer'],
  // Rückfall, wenn die Storefront nicht antwortet: Christians Endpreis
  // (25.10.2026: „nur einen finalen preis. 10.639€ kein Rabatt, kein nichts.“).
  festpreis: {amount: '10639.0', currencyCode: 'EUR'},
  banner: 'Ultimate Power',
  zeilen: [
    'Wunschnummer von 1 bis 111: + 2.000 €',
    '20 Tage ab Erhalt testen, voller Kaufpreis zurück',
    'Versand ab Mitte Januar 2027, zu 100 % versichert',
  ],
  beratung: {
    // Christians eigener Satz (KI-Klang-Lehre: seine warmen Sätze tragen).
    text: 'Du hast noch Fragen? Christian nimmt sich persönlich Zeit für dich!',
    knopf: 'Persönliches Gespräch mit Christian buchen',
    ziel: '/pages/produktberatung?von=qi-alpha-live',
  },
};

/** Fester Kaufknopf mobil (ab dem zweiten Bildschirm). */
export const TAC_STICKY = {
  // Dahinter der Preis aus der Storefront wie oben und im Abschluss.
  name: 'Qi Alpha',
};

/** Live-Vorstellung 08.11. (Coming-Home-Spezial, coming-home/config/themen.json). */
export const TAC_LIVE = {
  anker: 'live',
  titel: 'Lern den Qi Alpha zuerst live kennen',
  wann: 'Sonntag, 8. November 2026, 12 Uhr (Berlin), auf Zoom',
  text:
    'Am 8. November stellt Christian den Qi Alpha zum ersten Mal live vor. Du siehst ihn aus ' +
    'nächster Nähe, und deine Fragen beantwortet Christian dir direkt. Wir freuen uns auf dich!',
};

/** Fragen zum Ablauf (FAQ). */
export const TAC_FRAGEN = {
  titel: 'Fragen zum Qi Alpha',
  liste: [
    {
      frage: 'Kann ich meine Nummer wählen?',
      antwort:
        'Ja, sehr gern! Jeder Qi Alpha trägt seine eigene Seriennummer von 1 bis 111. Deine ' +
        'Wunschnummer kostet 2.000 € extra, und ohne Wunsch bekommst du beim Versand eine freie ' +
        'Nummer der Serie.',
    },
    {
      frage: 'Was für ein Diamant sitzt im Qi Alpha?',
      antwort: '„The One Eye“ ist ein hochreiner Naturdiamant, der mitten im Gitterchip™ gefasst ist.',
    },
    {
      frage: 'Kann ich damit in die Sauna oder ins Meer?',
      antwort:
        // Christians Wortlaut der Qi-Alpha-FAQ (app/data/product-faqs.js); der
        // Pflegehinweis zur Goldkette steht dort und auf der Kaufseite.
        'Ja! Der Gitterchip™ ist unempfindlich gegenüber Wasser, Chlor, Salzwasser, Schweiß und ' +
        'Hitze. Du kannst deinen Qi Alpha also unter der Dusche, in der Sauna und im Meer tragen.',
    },
    {
      frage: 'Wie funktioniert der Gitterchip™?',
      antwort:
        'Ganz ohne Strom und ohne Akku: Sein statisches Feld entsteht aus der Anordnung der ' +
        'Goldatome in unserer Legierung.',
    },
    {
      frage: 'Gibt es eine Aufzeichnung vom Live?',
      antwort:
        'Ja, wir zeichnen das Live auf. Wenn du Christian etwas fragen möchtest, sei am besten ' +
        'live dabei!',
    },
  ],
};
