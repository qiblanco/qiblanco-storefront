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
  // Stärkster Ads-Hook im Global Deutsch-Shop (ads.db, tof-unternehmer-h2,
  // CTR 8,75 % bei 89.701 Impressionen), danach Gegenstand und Auflage.
  titel: 'Kein Schmuck. Technologie mit einem Diamanten, nur 111 Mal.',
  gegenstand:
    'Der Qi Alpha trägt den Gitterchip™ aus 750er Gold und einen Naturdiamanten. ' +
    'Du trägst ihn jeden Tag, mit deiner eigenen Nummer.',
  // Hinter dem Preis aus der Storefront (Rückfall: TAC_ABSCHLUSS.festpreis).
  preisZusatz: 'fester Preis, kein Sale',
  // Direkt unter dem Knopf, was das Risiko nimmt (Kanon: Risikoumkehr ist ein
  // Abschluss-Thema; Einwand „Testfrist ab Zustellung rechnen und das sagen“).
  sicher: [
    '20 Tage ab Erhalt testen, voller Kaufpreis zurück',
    'Versand ab Mitte Januar 2027, versichert',
  ],
};

/** Was der Mensch bekommt, der den Qi Alpha trägt. */
export const TAC_NUTZEN = {
  titel: 'Was du mit dem Qi Alpha bekommst',
  vorteile: [
    {
      id: 'schutz',
      // Christians Wort aus der Vorlage („Starker Schutz.“).
      titel: 'Starker Schutz, jeden Tag',
      grundlage:
        'Der Gitterchip™ arbeitet ohne Strom und Akku. Das Labor von Prof. Dr. Dartsch hat ihn ' +
        'in fünf Arbeiten untersucht, gemessen am QiOne® 2 Pro, am QiBracelet und am QiHome Air.',
    },
    {
      id: 'ruhe',
      titel: 'Ruhige Nächte, mehr Energie',
      grundlage: 'Das berichten Gitterchip™-Träger in 171 Erfahrungsberichten am häufigsten.',
    },
    {
      id: 'alltag',
      titel: 'Immer dabei: Dusche, Sauna, Meer',
      grundlage: 'Der Gitterchip™ ist unempfindlich gegenüber Wasser, Salz, Schweiß und Hitze.',
    },
    {
      id: 'einzig',
      titel: 'Einer von 111, mit deiner Nummer',
      grundlage: 'Ein Naturdiamant, eine Seriennummer von 1 bis 111, von Hand poliert.',
    },
  ],
};

/** Was im Qi Alpha steckt (unter den Produktbildern). */
export const TAC_INHALT = {
  titel: 'Was du in der Hand hältst',
  punkte: [
    {
      titel: '„The One Eye“',
      text: 'Ein hochreiner Naturdiamant, gefasst am Gitterchip™. Rund um das Auge laufen 108 Striche.',
    },
    {
      titel: 'Gitterchip™ aus 750er Gold',
      text: 'Eine eigene Goldlegierung, deren Atome in einer festen Ordnung stehen. Ohne Elektronik, ohne Verschleiß.',
    },
    {
      titel: 'Deine Nummer',
      text: 'Jeder Qi Alpha trägt eine eigene Seriennummer von 1 bis 111. Deine Wunschnummer kostet 2.000 € extra.',
    },
    {
      titel: 'Von Hand vollendet',
      text: 'Die finale Politur machen Goldschmiede per Hand.',
    },
  ],
};

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/** Belege: Menschen mit Namen, nur was im Bestand belegt ist. */
export const TAC_BELEGE = {
  titel: 'Wer den Gitterchip™ prüft',
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
  titel: 'Bevor du reservierst',
  fragen: [
    {
      frage: 'Und wenn ich nichts spüre?',
      antwort:
        'Du testest deinen Qi Alpha 20 Tage ab Erhalt. Passt er nicht zu dir, schickst du ihn ' +
        'zurück und bekommst den vollen Kaufpreis.',
    },
    {
      frage: 'Warum kostet er 10.639 €?',
      antwort:
        'Es gibt nur 111 Stück. In jedem sitzt ein Naturdiamant, jeder trägt eine eigene Nummer, ' +
        'und Goldschmiede polieren ihn von Hand. Der Preis bleibt fest: kein Rabatt, kein Sale.',
    },
    {
      frage: 'Wann bekomme ich ihn?',
      antwort: 'Der Versand startet ab Mitte Januar 2027, weltweit und zu 100 % versichert.',
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
    'Versand ab Mitte Januar 2027, versichert',
  ],
  beratung: {
    text: 'Du hast noch Fragen? Christian nimmt sich persönlich Zeit für dich.',
    knopf: 'Persönliches Gespräch buchen',
    ziel: '/pages/produktberatung?von=qi-alpha-live',
  },
};

/** Fester Kaufknopf mobil (ab dem zweiten Bildschirm). */
export const TAC_STICKY = {
  name: 'Qi Alpha · 10.639 €',
};

/** Live-Vorstellung 08.11. (Coming-Home-Spezial, coming-home/config/themen.json). */
export const TAC_LIVE = {
  anker: 'live',
  titel: 'Erst live kennenlernen',
  wann: 'Sonntag, 8. November 2026, 12 Uhr (Berlin), auf Zoom',
  text:
    'Christian stellt den Qi Alpha zum ersten Mal live vor. Du siehst ihn aus nächster Nähe ' +
    'und kannst Christian alles fragen. Das Live wird aufgezeichnet.',
};

/** Fragen zum Ablauf (FAQ). */
export const TAC_FRAGEN = {
  titel: 'Fragen zum Qi Alpha',
  liste: [
    {
      frage: 'Kann ich meine Nummer wählen?',
      antwort:
        'Ja. Jeder Qi Alpha trägt eine eigene Seriennummer von 1 bis 111. Deine Wunschnummer kostet ' +
        '2.000 € extra. Ohne Wunschnummer bekommst du beim Versand eine freie Nummer der Serie.',
    },
    {
      frage: 'Was für ein Diamant sitzt im Qi Alpha?',
      antwort: '„The One Eye“: ein hochreiner Naturdiamant, gefasst am Gitterchip™.',
    },
    {
      frage: 'Kann ich damit in die Sauna oder ins Meer?',
      antwort:
        'Ja. Der Gitterchip™ ist unempfindlich gegenüber Wasser, Chlor, Salzwasser, Schweiß und Hitze. ' +
        'Die Goldkette sollte nicht dauerhaft Chlorwasser ausgesetzt werden.',
    },
    {
      frage: 'Wie funktioniert der Gitterchip™?',
      antwort:
        'Er braucht keinen Strom und keinen Akku. ' +
        'Sein statisches Feld entsteht aus der Anordnung der Goldatome in der Legierung.',
    },
    {
      frage: 'Gibt es eine Aufzeichnung vom Live?',
      antwort: 'Ja, wir zeichnen das Live auf. Fragen stellen kannst du Christian aber nur live.',
    },
  ],
};
