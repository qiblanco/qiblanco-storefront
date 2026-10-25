/**
 * THE ALPHA, Variante B (Server): Texte der Seite /pages/The-Alpha-C
 * (Grossjob 20261025-prio1-the-alpha-landingpage-figma-vorlage-a-server-b-ki-c,
 * Segment s04).
 *
 * WARUM DIESE SEITE: Christian 25.10.2026 zur Vorgängerseite
 * /pages/qi-master-vorverkauf: „Hat sich jeamnd mal über die vorteile von dem
 * qi alpha gedanken geamcht?“, „WHAT DO I GET!?“. B beantwortet die Frage
 * deshalb ganz oben, bevor irgendetwas anderes kommt.
 *
 * EINE DATENSTELLE NUR FÜR DAS, WAS B NEU HAT. Bilder, Kopftext und die drei
 * Säulen der Vorlage kommen aus the-alpha-daten.js (Variante A, Christians
 * Wortlaut) und werden importiert, nicht kopiert.
 *
 * QUELLEN DER AUSSAGEN (nichts erfunden):
 *  - Ruhe/Schlaf und Energie: häufigste Rückmeldungen in 171 Erfahrungs-
 *    berichten zum Gitterchip™ (STUDIEN_FAKTENBLATT.md e0004, QiOne 2 Pro +
 *    QiBracelet), darum „Viele unserer Kunden erzählen …“.
 *  - Fünf Arbeiten aus dem Labor Dartsch: gemessen am QiOne® 2 Pro,
 *    QiBracelet und QiHome Air (pr-manager/wissen/qi-alpha-live-launch.md §3).
 *    Keine Zellwerte auf Qi-Alpha-Seiten (Christian 28.09.).
 *  - Walach: Wortlaut nach pr-manager §3, Person nach Christian 25.10.
 *    („der hier: https://en.wikipedia.org/wiki/Harald_Walach“).
 *  - Wasser/Sauna: app/data/product-faqs.js (Qi-Master-FAQ, Christians Satz).
 *  - Preis fest, Politur, Versand: Christians Sätze der Kaufseite
 *    /products/qi-alpha-b.
 *  - Ein Diamant, keine Karat-Angabe; 111 Stück; Live 08.11.: Christian
 *    25.10. (NACHTRAG-CHRISTIAN-entscheidungen-2026-10-25.md).
 */

/** Erster Bildschirm: was der Mensch bekommt, der den Qi Alpha trägt. */
export const TAB_NUTZEN = {
  auge: 'Qi Alpha · nur 111 Stück',
  // Die Überschrift IST die Antwort (Challenger-Runde 2: eine Überschrift, die
  // die Antwort nur ankündigt, beantwortet die Frage nicht).
  titel: 'Ruhe, Schutz und ein Diamant für nur 111 Menschen',
  // Was es ist und was es kostet (Challenger-Runde 1: „was für ein Gegenstand
  // … kein Preis“). „Zum Umhängen“: Christians FAQ zum Qi Master.
  gegenstand: 'Ein Anhänger mit Gitterchip™ aus 750er Gold und einem Naturdiamanten.',
  preiszeile: '10.639 € · Versand ab Mitte Januar 2027',
  vorteile: [
    {
      id: 'ruhe',
      titel: 'Ruhige Nächte, wache Tage',
      grundlage: 'Viele unserer Kunden erzählen von tieferem Schlaf und mehr Energie.',
    },
    {
      id: 'schutz',
      titel: 'Schutz vor Strahlung, jeden Tag',
      grundlage:
        'Der Gitterchip™ arbeitet ohne Strom. Das Labor von Prof. Dr. Dartsch hat ihn in fünf Fachartikeln untersucht.',
    },
    {
      id: 'ueberall',
      titel: 'Immer dabei: Dusche, Sauna, Meer',
      grundlage: 'Der Gitterchip™ ist unempfindlich gegenüber Wasser, Salz, Schweiß und Hitze.',
    },
    {
      id: 'einzig',
      titel: 'Einer von 111',
      grundlage: 'Ein Diamant, deine eigene Nummer, von Hand poliert.',
    },
  ],
  liveVerweis: 'Erst live kennenlernen: Sonntag, 8. November',
};

/** Was im Qi Alpha steckt (unter den Produktbildern). */
export const TAB_INHALT = {
  titel: 'Was in deinem Qi Alpha steckt',
  punkte: [
    {
      titel: '„The One Eye“',
      text: 'Ein hochreiner Naturdiamant, gefasst am Gitterchip™. Rund um das Auge laufen 108 Striche.',
    },
    {
      titel: 'Gitterchip™ aus eigener Goldlegierung',
      text: 'Eine 750er Goldlegierung, deren Atome in einer festen Ordnung stehen. Ohne Elektronik, ohne Verschleiß.',
    },
    {
      titel: 'Deine Nummer',
      text: 'Jeder Qi Alpha trägt eine eigene Seriennummer von 1 bis 111. Deine Wunschnummer kostet 2.000 € extra.',
    },
    {
      titel: 'Von Hand vollendet',
      text: 'Die finale Politur wird per Hand von Goldschmieden mit meisterhafter Genauigkeit durchgeführt.',
    },
  ],
};

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/** Belege: Menschen mit Namen, nur was im Bestand belegt ist. */
export const TAB_BELEGE = {
  titel: 'Wer den Gitterchip™ prüft',
  personen: [
    {
      id: 'dartsch',
      name: 'Prof. Dr. Peter C. Dartsch',
      text:
        'Sein Labor hat den Gitterchip™ in fünf veröffentlichten Arbeiten untersucht: vier an Zellen, ' +
        'eine mit 171 Erfahrungsberichten. Gemessen am QiOne® 2 Pro, am QiBracelet und am QiHome Air. ' +
        'Zellen im Labor haben keine Erwartung.',
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

/** Einwände: erst die Stärke, dann der Beleg (Anna, Verkaufs-Gebot 23.09.). */
export const TAB_EINWAENDE = {
  titel: 'Was Kunden vor dem Kauf fragen',
  fragen: [
    {
      frage: 'Wirkt das wirklich?',
      antwort:
        'Zellen im Labor haben keine Erwartung, darum misst Prof. Dartsch an Zellen. ' +
        'Und du testest deinen Qi Alpha 20 Tage selbst, mit vollem Kaufpreis zurück.',
    },
    {
      frage: 'Wird er irgendwann günstiger?',
      antwort:
        'Den Qi Alpha wird es nie in einem Sale geben wie Black Friday oder Sommer Sale. ' +
        'Durch seine sehr aufwendige Herstellung ist der Preis fixiert.',
    },
    {
      frage: 'Wie funktioniert der Gitterchip™?',
      antwort:
        'Ohne Elektronik und ohne Akku: Sein statisches Feld entsteht aus der Anordnung der Goldatome. ' +
        'Erfunden hat ihn ein Ingenieur.',
    },
  ],
};

/** Preisblock unter dem Preisanker. */
export const TAB_PREIS = {
  titel: 'Dein Qi Alpha',
  // Rückfall, wenn die Storefront nicht antwortet: Christians Endpreis
  // (25.10.2026: „nur einen finalen preis. 10.639€ kein Rabatt, kein nichts.“).
  festpreis: {amount: '10639.0', currencyCode: 'EUR'},
  nutzer: '+ 14.000 Gitterchip™-Nutzer',
  zeilen: [
    'Fester Preis: kein Rabatt, kein Sale.',
    'Wunschnummer von 1 bis 111: + 2.000 €',
    'Versand ab Mitte Januar 2027, weltweit und zu 100 % versichert.',
    '20 Tage testen, voller Kaufpreis zurück.',
  ],
  beratung: {
    text: 'Du hast noch Fragen? Christian nimmt sich persönlich Zeit für dich.',
    knopf: 'Persönliches Gespräch buchen',
    ziel: '/pages/produktberatung?von=qi-alpha-live',
  },
};

/** Live-Vorstellung 08.11. (Coming-Home-Spezial, coming-home/config/themen.json). */
export const TAB_LIVE = {
  anker: 'live',
  titel: 'Qi Alpha live mit Christian',
  wann: 'Sonntag, 8. November 2026, 12 Uhr (Berlin), auf Zoom',
  text:
    'Christian stellt den Qi Alpha zum ersten Mal live vor. Du siehst ihn aus nächster Nähe ' +
    'und kannst Christian alles fragen. Das Live ist ein Coming-Home-Spezial und wird aufgezeichnet.',
};

/** Fragen zum Ablauf (FAQ). */
export const TAB_FRAGEN = {
  titel: 'Fragen zum Qi Alpha',
  liste: [
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
      frage: 'Was, wenn er nicht zu mir passt?',
      antwort:
        'Du hast 20 Tage nach Erhalt, um ihn in Ruhe zu testen. Passt er nicht, bekommst du den vollen Kaufpreis zurück.',
    },
    {
      frage: 'Gibt es eine Aufzeichnung vom Live?',
      antwort: 'Ja, wir zeichnen das Live auf. Fragen stellen kannst du Christian aber nur live.',
    },
  ],
};
