/*
 * /pages/partner-details — Hilfe für angemeldete Partner (Job 20260924-
 * GROSSJOB-partnerlinks-sauber-in-die-kasse-partnerseite-und-mail-an-elina).
 * Begründung, Abgrenzung und noindex stehen im Kopf der Route.
 *
 * INHALTS-DISZIPLIN, jede Aussage am 2026-09-24 gemessen:
 *   Rabattlink /discount/<CODE>?redirect=<pfad>&sca_ref=<ref>: Code liegt in
 *     der Kasse, Kassen-URL trägt sca_ref (Playwright, bis vor die Zahlung).
 *   Empfehlungslink ?sca_ref=: Zuordnung ja, und seit PR #616 legt der
 *     Server den Code in den Warenkorb, wenn dort noch keiner liegt
 *     (gemessen am Rand mit dem Test-Partner: Code im Warenkorb, Abzug in
 *     der Kasse; Job 20260924-partnerlink-setzt-code-automatisch-...).
 *     Neue Partner: täglicher Abgleich, also ab dem Folgetag.
 *   Kassen-Adressen: eingebettet net::ERR_BLOCKED_BY_RESPONSE (Shopify).
 *   Warenkorb-Permalinks qiblanco.com/cart/…: eingebettet Weiter-Seite.
 *   Kasse zeigt netto + "Geschätzte Steuern", Endbetrag = Seitenpreis
 *     (shop.taxesIncluded=false, Admin-API).
 *   10 % auf den Netto-Warenwert ohne Steuern und Versand, PayPal oder Bank
 *     (UpPromote GET /programs: exclude_product_tax, exclude_shipping).
 *
 * KEINE PRODUKT-WIRKAUSSAGEN: der Leser ist Partner, kein Käufer.
 * DESIGN: Token-Quelle styles/schlaf-zellen-schutz.css (.lp-a3), lp-pp-* aus
 * affiliate-partnerprogramm.css, additive lp-pd-* in partner-details.css.
 *
 * EINSATZ JE KANAL (Christian 2026-09-24, Job 20260924-update-partnerseite-
 * zeigt-je-kanal-wie-und-wofuer-die-links-eingesetzt-werden): Übersicht
 * Kanal x Link x Ziel, je Kanal eine Karte mit schlichtem Mockup (eigene
 * Darstellung, keine fremden Logos oder App-Oberflächen), Schritten und
 * Beispieltext. Die Texte setzen Code und Link aus dem Baukasten ein; der
 * Baukasten-Zustand liegt deshalb in PartnerDetails. Den QR-Code rechnet
 * qrKodieren() im Browser, Download als PNG/SVG ohne Abruf.
 *
 * WARUM INHALTE UND QR-KODIERER IN DIESER DATEI STEHEN: Gate 12 ordnet einen
 * Diff über die Import-Karte der Seiten zu, und die kennt neue Module erst
 * nach dem nächsten täglichen Lauf. Als eigene Dateien waren sie deshalb
 * "Reichweite unbekannt", der Umbau nicht als seitenlokal belegbar. Hier
 * stehen sie in der Komponente, die nur diese Seite lädt.
 */
import {useEffect, useMemo, useState} from 'react';

/* ══════════════════════════════════════════════════════════════════════════
   INHALTE JE KANAL
   ══════════════════════════════════════════════════════════════════════════ */
/*
 * Inhalte für /pages/partner-details: wo ein Partner welchen Link einsetzt,
 * wie er ihn dort setzt und mit welchem Text (Christian 2026-09-24, Job
 * 20260924-update-partnerseite-zeigt-je-kanal-wie-und-wofuer-die-links-
 * eingesetzt-werden). Reine Daten und eine reine Funktion, damit der Test
 * ohne React läuft.
 *
 * PLATTFORM-ANGABEN, Stand 2026-09-24, Quellen im RESULT des Jobs:
 *   Instagram: bis zu fünf Links in der Bio; Link-Sticker für alle Konten;
 *     Text unter Beiträgen nicht klickbar (help.instagram.com).
 *   TikTok: Link in der Bio ab 1.000 Followern oder mit Unternehmenskonto.
 *   YouTube: Links in Beschreibung und Kommentar klickbar, bei Shorts seit
 *     31.08.2023 nicht (support.google.com/youtube/answer/13748639).
 *   Druck: QR mindestens 2 x 2 cm, Ruhezone 4 Module (qrcode.com).
 *   Kennzeichnung: "Werbung"/"Anzeige" vorn oder Sternchen mit Erklärsatz
 *     (Leitfaden der Medienanstalten). Beschrieben, wie es üblich ist.
 *
 * BEISPIELTEXTE: keine Heil- oder Körperschutzaussage; Erfahrung und
 * Empfindung dürfen stehen (GL-SPR-0008). Platzhalter:
 *   {CODE} {LINK} {TIPP} {BUCHSTABIERT}
 */

export const ZIELE = [
  {
    pfad: '/products/qione-2-pro',
    name: 'QiOne® 2 Pro',
    tipp: 'der QiOne® 2 Pro von Qi Blanco',
    wann: 'Du zeigst oder trägst den Anhänger.',
  },
  {
    pfad: '/products/qibracelet',
    name: 'QiBracelet',
    tipp: 'das QiBracelet von Qi Blanco',
    wann: 'Es geht um das Armband, im Alltag, beim Sport oder auf Reisen.',
  },
  {
    pfad: '/products/qihome-air',
    name: 'QiHome Air',
    tipp: 'QiHome Air von Qi Blanco für den ganzen Raum',
    wann: 'Du sprichst über Zuhause, Praxis oder Büro.',
  },
  {
    pfad: '/products/qione-kette',
    name: 'Necklace für QiOne®',
    tipp: 'die Necklace für den QiOne® von Qi Blanco',
    wann: 'Dein Gegenüber hat schon einen QiOne® und sucht die passende Kette.',
  },
  {
    pfad: '/pages/studien',
    name: 'Studien',
    tipp: 'die Studien von Qi Blanco',
    wann:
      'Deine Leute wollen erst lesen. Die Seite fasst fünf veröffentlichte ' +
      'Arbeiten verständlich zusammen.',
  },
  {
    pfad: '/',
    name: 'Startseite',
    tipp: 'Qi Blanco',
    wann: 'Du empfiehlst Qi Blanco allgemein, etwa in der Bio oder der Signatur.',
  },
];

export const GRUPPEN = [
  {id: 'instagram', titel: 'Instagram'},
  {id: 'video', titel: 'Video und Podcast'},
  {id: 'schreiben', titel: 'Newsletter, Website, Nachrichten'},
  {id: 'vor-ort', titel: 'Vor Ort und im Gespräch'},
];

export const KANAELE = [
  {
    id: 'instagram-bio',
    kurz: 'Fester Einstieg',
    gruppe: 'instagram',
    name: 'Instagram: Bio',
    wofuer: 'Dein fester Einstieg. Jeder Beitrag kann darauf verweisen.',
    link: 'Rabattlink',
    ziel: 'Startseite oder dein Hauptprodukt',
    mock: 'ig-bio',
    schritte: [
      'Tippe in deinem Profil auf „Profil bearbeiten“ und dann auf „Links“.',
      'Wähle „Externen Link hinzufügen“ und füge deinen Rabattlink ein. Als Titel passt „5 % bei Qi Blanco“.',
      'Schreib deinen Code zusätzlich in den Bio-Text. Dann kommt der Rabatt auch an, wenn jemand später am Laptop kauft.',
    ],
    hinweis: 'Instagram erlaubt bis zu fünf Links in der Bio.',
    texte: [
      {
        titel: 'Bio-Text',
        vorlage:
          'Mein Tipp: {TIPP} · 5 % mit Code {CODE} über meinen Link (Werbung)',
      },
    ],
  },
  {
    id: 'instagram-story',
    kurz: 'Schnelle Aktion',
    gruppe: 'instagram',
    name: 'Instagram: Story mit Link-Sticker',
    wofuer:
      'Schnelle Aktion. Die Story steht 24 Stunden, ein Tipp auf den Sticker führt direkt zum Produkt.',
    link: 'Rabattlink im Link-Sticker',
    ziel: 'Das Produkt aus deiner Story',
    mock: 'ig-story',
    schritte: [
      'Nimm deine Story auf und tippe oben auf das Sticker-Symbol.',
      'Wähle den Sticker „Link“ und füge deinen Rabattlink ein.',
      'Tippe auf „Sticker-Text anpassen“ und schreib deinen Code hinein.',
      'Setz den Sticker groß in die Bildmitte, dort tippen die meisten.',
    ],
    texte: [
      {titel: 'Sticker-Text', vorlage: '5 % mit {CODE}'},
      {
        titel: 'Text in der Story',
        vorlage:
          'Werbung · Mein Tipp für dich: {TIPP}. Mit meinem Code {CODE} bekommst du 5 %. Tipp auf den Link.',
      },
    ],
  },
  {
    id: 'instagram-beitrag',
    kurz: 'Reichweite',
    gruppe: 'instagram',
    name: 'Instagram: Beitrag und Reel',
    wofuer:
      'Reichweite. Der Text unter dem Beitrag ist nicht klickbar, deshalb nennt er den Code und verweist auf deine Bio.',
    link: 'Code im Text, Rabattlink in der Bio',
    ziel: 'Der Link in deiner Bio',
    mock: 'ig-beitrag',
    schritte: [
      'Zeig im Bild oder Video, worum es geht: den Anhänger, das Armband, den Raum.',
      'Schreib deinen Code in die ersten zwei Zeilen. Dort liest ihn jeder, ohne auf „mehr“ zu tippen.',
      'Verweise auf den Link in deiner Bio.',
      'Blende den Code im Reel zusätzlich als Text ein.',
    ],
    texte: [
      {
        titel: 'Text unter dem Beitrag',
        vorlage:
          'Werbung | 5 % bei Qi Blanco mit meinem Code {CODE}\n\n' +
          'Mein Tipp: {TIPP}. Viele von euch haben mich danach gefragt, und für mich gehört Qi Blanco zum Alltag.\n\n' +
          'Der Link steht in meiner Bio, der Code ist dort schon eingetragen.',
      },
    ],
  },
  {
    id: 'tiktok',
    kurz: 'Reichweite bei neuen Leuten',
    gruppe: 'video',
    name: 'TikTok',
    wofuer:
      'Reichweite bei neuen Leuten. Der Code bleibt im Kopf, auch wenn niemand klickt.',
    link: 'Code im Video, Rabattlink in der Bio',
    ziel: 'Das Produkt aus deinem Video',
    mock: 'tiktok',
    schritte: [
      'Sag deinen Code im Video und blende ihn als Text ein.',
      'Setz deinen Rabattlink in die Bio. TikTok zeigt ihn ab 1.000 Followern oder mit einem Unternehmenskonto.',
      'Schreib Code und „Link in Bio“ in die Beschreibung.',
    ],
    texte: [
      {
        titel: 'Beschreibung',
        vorlage:
          'Werbung | Code {CODE} = 5 % bei Qi Blanco. Link in meiner Bio.',
      },
      {
        titel: 'Im Video sagen',
        vorlage:
          'Mit meinem Code {CODE} bekommst du fünf Prozent bei Qi Blanco. Der Link ist in meiner Bio.',
      },
    ],
  },
  {
    id: 'youtube',
    kurz: 'Ausführliche Vorstellung',
    gruppe: 'video',
    name: 'YouTube',
    wofuer:
      'Ausführliche Vorstellung. Ein Video wird noch Monate später über die Suche gefunden.',
    link: 'Rabattlink in Beschreibung und angepinntem Kommentar, Code im Video',
    ziel: 'Das Produkt aus deinem Video',
    mock: 'youtube',
    schritte: [
      'Setz deinen Rabattlink in die erste Zeile der Beschreibung. Sie ist sichtbar, bevor jemand „mehr“ öffnet.',
      'Schreib denselben Link als Kommentar und hefte ihn oben an: drei Punkte am Kommentar, dann „Anpinnen“.',
      'Sag deinen Code im Video, einmal am Anfang und einmal am Ende.',
      'Bei Shorts sind Links in Beschreibung und Kommentar nicht klickbar. Nenne dort den Code und verknüpfe dein langes Video.',
    ],
    texte: [
      {
        titel: 'Beschreibung und angepinnter Kommentar',
        vorlage:
          'Werbung: 5 % bei Qi Blanco mit meinem Code {CODE}. Mein Tipp: {TIPP}.\n' +
          '{LINK}\n' +
          'Über den Link ist der Code schon eingetragen.',
      },
      {
        titel: 'Im Video sagen',
        vorlage:
          'Den Link findest du in der Beschreibung. Mit meinem Code {CODE} bekommst du fünf Prozent.',
      },
    ],
  },
  {
    id: 'podcast',
    kurz: 'Vertrauen beim Hören',
    gruppe: 'video',
    name: 'Podcast',
    wofuer:
      'Vertrauen. Deine Hörer kennen deine Stimme und hören unterwegs, oft ohne klicken zu können.',
    link: 'Gesprochener Code, Rabattlink in den Shownotes',
    ziel: 'Die Studien oder das Produkt aus der Folge',
    mock: 'podcast',
    schritte: [
      'Nenne deinen Code in der Folge und buchstabiere ihn einmal.',
      'Setz den Rabattlink ganz nach oben in die Shownotes.',
      'Wiederhole den Code am Ende der Folge.',
    ],
    hinweis:
      'Ein kurzer Code, der sich leicht sprechen lässt, bleibt am besten hängen.',
    texte: [
      {
        titel: 'In der Folge sagen',
        vorlage:
          'Ein Tipp aus meinem Alltag, und das ist Werbung: {TIPP}. Mit meinem Code {CODE} bekommst du fünf Prozent. ' +
          'Ich buchstabiere: {BUCHSTABIERT}. Der Link steht in den Shownotes.',
      },
      {
        titel: 'Shownotes',
        vorlage:
          'Werbung: 5 % bei Qi Blanco mit meinem Code {CODE}. Direkt mit eingetragenem Code: {LINK}',
      },
    ],
  },
  {
    id: 'newsletter',
    kurz: 'Vertrauen beim Lesen',
    gruppe: 'schreiben',
    name: 'Newsletter',
    wofuer: 'Vertrauen. Deine Leser haben dich abonniert und lesen in Ruhe.',
    link: 'Rabattlink als Knopf',
    ziel: 'Das Produkt, um das es geht, oder die Studien',
    mock: 'newsletter',
    schritte: [
      'Schreib zwei, drei Sätze, warum du Qi Blanco empfiehlst.',
      'Füge einen Knopf ein und hinterlege deinen Rabattlink. Beschrifte ihn mit dem, was der Leser bekommt, etwa „Zum QiOne® 2 Pro mit 5 %“.',
      'Nenne den Code zusätzlich im Text.',
      'Schick dir die Mail selbst und tippe einmal auf den Knopf.',
    ],
    texte: [
      {
        titel: 'Abschnitt für deinen Newsletter',
        vorlage:
          'Betreff: Mein Tipp für dich, mit 5 % Rabatt\n\n' +
          'Viele von euch fragen mich nach Qi Blanco. Mein Tipp: {TIPP}.\n\n' +
          'Mit meinem Code {CODE} bekommst du 5 % Rabatt. Über diesen Link ist er schon eingetragen:\n{LINK}\n\n' +
          '*Werbung: Das ist ein Empfehlungslink. Kaufst du darüber, erhalte ich eine Provision. Dein Preis bleibt gleich, abzüglich deines Rabatts.',
      },
    ],
  },
  {
    id: 'website',
    kurz: 'Dauerhafte Empfehlung',
    gruppe: 'schreiben',
    name: 'Website und Blog',
    wofuer: 'Dauerhafte Empfehlung. Ein Artikel wird über Jahre gefunden.',
    link: 'Rabattlink als normaler Link oder Knopf, in neuem Fenster',
    ziel: 'Das Produkt aus deinem Artikel',
    mock: 'website',
    schritte: [
      'Setz den Rabattlink als normalen Link oder Knopf an die Stelle, an der du das Produkt nennst.',
      'Lass ihn in einem neuen Fenster öffnen. Als eingebetteter Baustein zeigt der Shop nur einen Knopf zum Öffnen.',
      'Gib dem Link rel="sponsored" mit. So erkennen Suchmaschinen die Empfehlung mit Provision.',
    ],
    texte: [
      {
        titel: 'Absatz für deinen Artikel',
        vorlage:
          'Werbung | Mein Tipp: {TIPP}. Mit meinem Code {CODE} bekommst du 5 % Rabatt. Über diesen Link ist er schon eingetragen: {LINK}',
      },
      {
        titel: 'Knopf als HTML',
        vorlage:
          '<a href="{LINK}" target="_blank" rel="sponsored noopener">5 % bei Qi Blanco mit {CODE}</a>',
      },
    ],
  },
  {
    id: 'messenger',
    kurz: 'Persönliche Empfehlung',
    gruppe: 'schreiben',
    name: 'WhatsApp, Telegram, Signal',
    wofuer: 'Persönliche Empfehlung an Menschen, die dich gefragt haben.',
    link: 'Rabattlink und Code in einer Nachricht',
    ziel: 'Das Produkt, über das ihr gesprochen habt',
    mock: 'messenger',
    schritte: [
      'Schick Link und Code zusammen in einer einzigen Nachricht.',
      'Warte kurz, bis die Vorschau mit Bild erscheint, dann sende.',
      'Der Code steht dabei, falls dein Kontakt den Link in einem anderen Browser öffnet.',
    ],
    texte: [
      {
        titel: 'Nachricht',
        vorlage:
          'Hier ist der Link, von dem ich dir erzählt habe. Mein Code {CODE} ist schon eingetragen, du bekommst 5 %:\n{LINK}\n\n' +
          'Falls der Rabatt in der Kasse fehlt: Code {CODE} ins Feld „Rabattcode oder Gutschein“. (Werbung: Ich bekomme dafür eine kleine Provision.)',
      },
    ],
  },
  {
    id: 'signatur',
    kurz: 'Nebenbei bei jeder Mail',
    gruppe: 'schreiben',
    name: 'E-Mail-Signatur',
    wofuer:
      'Nebenbei, bei jeder Mail. Nach dem Einrichten kostet es dich keine Minute mehr.',
    link: 'Rabattlink als kurze Zeile',
    ziel: 'Startseite',
    mock: 'signatur',
    schritte: [
      'Öffne in deinem Mailprogramm die Einstellungen zur Signatur.',
      'Füge die Zeile unter deinen Namen ein und verlinke sie mit deinem Rabattlink.',
      'Schick dir eine Testmail und klick auf den Link.',
    ],
    texte: [
      {
        titel: 'Zeile für die Signatur',
        vorlage:
          'Meine Empfehlung: Qi Blanco, 5 % mit Code {CODE} · {LINK} (Werbung)',
      },
    ],
  },
  {
    id: 'flyer',
    kurz: 'Empfehlung vor Ort',
    gruppe: 'vor-ort',
    name: 'Flyer, Visitenkarte, Aufsteller',
    wofuer:
      'Empfehlung vor Ort, in deiner Praxis, deinem Studio oder deinem Laden. Wer scannt, landet mit Rabatt im Shop.',
    link: 'QR-Code aus dem Baukasten und dein Code',
    ziel: 'Dein Hauptprodukt oder die Startseite',
    mock: 'flyer',
    schritte: [
      'Bau im Link-Baukasten deinen Rabattlink und lade den QR-Code als PNG oder SVG.',
      'Setz ihn mindestens 2 × 2 cm groß und mit weißem Rand auf Flyer, Visitenkarte oder Aufsteller.',
      'Druck deinen Code gut lesbar daneben. Wer nicht scannt, tippt ihn in der Kasse ein.',
      'Scanne den Probedruck einmal mit dem Handy, bevor du alles druckst.',
    ],
    texte: [
      {
        titel: 'Text für Flyer und Aufsteller',
        vorlage:
          'Anzeige\n5 % bei Qi Blanco\nCode: {CODE}\nQR-Code scannen, der Code ist schon eingetragen.\nEmpfohlen von [dein Name oder deine Praxis]',
      },
    ],
  },
  {
    id: 'vortrag',
    kurz: 'Viele Zuhörer auf einmal',
    gruppe: 'vor-ort',
    name: 'Vortrag und Workshop',
    wofuer: 'Viele Menschen auf einmal, die dir gerade zuhören.',
    link: 'Code und QR-Code auf der letzten Folie',
    ziel: 'Die Studien oder die Startseite',
    mock: 'vortrag',
    schritte: [
      'Setz deinen Code groß auf die letzte Folie und den QR-Code daneben.',
      'Lass die Folie stehen, solange Fragen kommen. So hat jeder Zeit zum Scannen.',
      'Sag den Code einmal laut.',
    ],
    texte: [
      {
        titel: 'Folie',
        vorlage:
          'Werbung · 5 % bei Qi Blanco mit dem Code {CODE}\nQR-Code scannen, der Code ist schon eingetragen.',
      },
      {
        titel: 'Dazu sagen',
        vorlage:
          'Wer Qi Blanco ausprobieren möchte: Mit meinem Code {CODE} bekommt ihr fünf Prozent.',
      },
    ],
  },
  {
    id: 'gespraech',
    kurz: 'Die stärkste Empfehlung',
    gruppe: 'vor-ort',
    name: 'Persönliches Gespräch',
    wofuer: 'Die stärkste Empfehlung. Dein Gegenüber vertraut dir.',
    link: 'Code nennen, Rabattlink per Nachricht nachschicken',
    ziel: 'Das Produkt, über das ihr gesprochen habt',
    mock: 'gespraech',
    schritte: [
      'Nenne deinen Code im Gespräch.',
      'Frag, ob du den Link schicken darfst, und schick ihn gleich danach.',
      'Liegt eine Visitenkarte mit QR-Code bereit, gib sie mit.',
    ],
    texte: [
      {
        titel: 'Nachricht nach dem Gespräch',
        vorlage:
          'Schön, dass wir heute über Qi Blanco gesprochen haben. Hier ist mein Link, mein Code {CODE} ist schon eingetragen:\n{LINK}\n' +
          '(Werbung: Ich bekomme dafür eine kleine Provision.)',
      },
    ],
  },
];

export const PLATZHALTER_CODE = 'DEINCODE';
export const PLATZHALTER_LINK = '[dein Rabattlink]';

/**
 * Setzt Code, Link und Ziel des Partners in eine Vorlage ein. Ohne Angaben
 * stehen gut sichtbare Platzhalter im Text.
 */
export function fuelleVorlage(vorlage, {code, link, pfad} = {}) {
  const c = code || PLATZHALTER_CODE;
  const ziel = ZIELE.find((z) => z.pfad === pfad) || ZIELE[0];
  const buchstabiert = c.toUpperCase().split('').join(' ');
  return vorlage
    .split('{CODE}')
    .join(c)
    .split('{LINK}')
    .join(link || PLATZHALTER_LINK)
    .split('{TIPP}')
    .join(ziel.tipp)
    .split('{BUCHSTABIERT}')
    .join(buchstabiert);
}

/* ══════════════════════════════════════════════════════════════════════════
   QR-KODIERER
   ══════════════════════════════════════════════════════════════════════════ */
/*
 * QR-Code für den Link-Baukasten auf /pages/partner-details (Job 20260924-
 * update-partnerseite-zeigt-je-kanal-wie-und-wofuer-die-links-eingesetzt-
 * werden). Rechnet ausschließlich im Browser bzw. beim Rendern: kein Abruf,
 * kein Dienst eines Dritten, nichts wird gespeichert.
 *
 * Kodierung nach ISO/IEC 18004, Byte-Modus, Fehlerkorrektur M (15 %), Version
 * und Maske automatisch. Der Aufbau folgt der Referenz-Implementierung
 * "QR Code generator library" von Project Nayuki (MIT-Lizenz), auf das
 * Nötige gekürzt: nur Byte-Modus, nur Stufe M.
 *
 * WARUM EIGENER CODE STATT PAKET: das Repo hat keine QR-Abhängigkeit, und
 * package.json liegt außerhalb der Deploy-Allowlist. Geprüft wird gegen einen
 * unabhängigen Dekodierer (OpenCV QRCodeDetector) über alle Versionen 1-40,
 * Testskript im Job-Ordner.
 */

// Stufe M: Fehlerkorrektur-Codewörter je Block und Blockzahl, Index = Version.
const ECC_JE_BLOCK = [
  -1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26,
  26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28,
  28, 28, 28,
];
const BLOECKE = [
  -1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17,
  18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49,
];
const FORMAT_BITS_M = 0;

function rohModule(ver) {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const ausr = Math.floor(ver / 7) + 2;
    n -= (25 * ausr - 10) * ausr - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
}

function datenCodewoerter(ver) {
  return Math.floor(rohModule(ver) / 8) - ECC_JE_BLOCK[ver] * BLOECKE[ver];
}

function gfMal(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function rsTeiler(grad) {
  const r = new Array(grad).fill(0);
  r[grad - 1] = 1;
  let wurzel = 1;
  for (let i = 0; i < grad; i++) {
    for (let j = 0; j < r.length; j++) {
      r[j] = gfMal(r[j], wurzel);
      if (j + 1 < r.length) r[j] ^= r[j + 1];
    }
    wurzel = gfMal(wurzel, 0x02);
  }
  return r;
}

function rsRest(daten, teiler) {
  const r = teiler.map(() => 0);
  for (const b of daten) {
    const f = b ^ r.shift();
    r.push(0);
    teiler.forEach((k, i) => {
      r[i] ^= gfMal(k, f);
    });
  }
  return r;
}

function utf8(text) {
  if (typeof TextEncoder !== 'undefined') {
    return Array.from(new TextEncoder().encode(text));
  }
  return Array.from(unescape(encodeURIComponent(text)), (c) => c.charCodeAt(0));
}

function bit(x, i) {
  return ((x >>> i) & 1) !== 0;
}

/**
 * Kodiert einen Text als QR-Code. Liefert {groesse, dunkel(x, y)} oder null,
 * wenn der Text zu lang ist (über 2331 Byte, Version 40-M).
 */
export function qrKodieren(text) {
  const bytes = utf8(String(text || ''));
  let ver = 1;
  for (; ver <= 40; ver++) {
    const zaehlBits = ver <= 9 ? 8 : 16;
    if (4 + zaehlBits + bytes.length * 8 <= datenCodewoerter(ver) * 8) break;
  }
  if (ver > 40) return null;

  // Bitstrom: Modus Byte (0100), Länge, Daten, Abschluss, Füllbytes.
  const bits = [];
  const schreib = (wert, n) => {
    for (let i = n - 1; i >= 0; i--) bits.push((wert >>> i) & 1);
  };
  schreib(4, 4);
  schreib(bytes.length, ver <= 9 ? 8 : 16);
  bytes.forEach((b) => schreib(b, 8));
  const kap = datenCodewoerter(ver) * 8;
  schreib(0, Math.min(4, kap - bits.length));
  schreib(0, (8 - (bits.length % 8)) % 8);
  for (let f = 0xec; bits.length < kap; f ^= 0xec ^ 0x11) schreib(f, 8);
  const daten = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    daten.push(b);
  }

  // Fehlerkorrektur je Block, dann verschränken.
  const nBloecke = BLOECKE[ver];
  const eccLen = ECC_JE_BLOCK[ver];
  const roh = Math.floor(rohModule(ver) / 8);
  const nKurz = nBloecke - (roh % nBloecke);
  const kurzLen = Math.floor(roh / nBloecke);
  const teiler = rsTeiler(eccLen);
  const bloecke = [];
  for (let i = 0, k = 0; i < nBloecke; i++) {
    const d = daten.slice(k, k + kurzLen - eccLen + (i < nKurz ? 0 : 1));
    k += d.length;
    const ecc = rsRest(d, teiler);
    if (i < nKurz) d.push(0);
    bloecke.push(d.concat(ecc));
  }
  const alle = [];
  for (let i = 0; i < bloecke[0].length; i++) {
    bloecke.forEach((blk, j) => {
      if (i !== kurzLen - eccLen || j >= nKurz) alle.push(blk[i]);
    });
  }

  const n = ver * 4 + 17;
  const mod = Array.from({length: n}, () => new Array(n).fill(false));
  const fest = Array.from({length: n}, () => new Array(n).fill(false));
  const setz = (x, y, d) => {
    mod[y][x] = d;
    fest[y][x] = true;
  };

  // Funktionsmuster: Takt, Suchmuster, Ausrichtung, Format, Version.
  for (let i = 0; i < n; i++) {
    setz(6, i, i % 2 === 0);
    setz(i, 6, i % 2 === 0);
  }
  const sucher = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx;
        const y = cy + dy;
        if (x >= 0 && x < n && y >= 0 && y < n) setz(x, y, d !== 2 && d !== 4);
      }
    }
  };
  sucher(3, 3);
  sucher(n - 4, 3);
  sucher(3, n - 4);
  if (ver > 1) {
    const nA = Math.floor(ver / 7) + 2;
    const schritt =
      ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (nA * 2 - 2)) * 2;
    const pos = [6];
    for (let p = n - 7; pos.length < nA; p -= schritt) pos.splice(1, 0, p);
    for (let i = 0; i < nA; i++) {
      for (let j = 0; j < nA; j++) {
        const ecke =
          (i === 0 && j === 0) ||
          (i === 0 && j === nA - 1) ||
          (i === nA - 1 && j === 0);
        if (ecke) continue;
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            setz(
              pos[i] + dx,
              pos[j] + dy,
              Math.max(Math.abs(dx), Math.abs(dy)) !== 1,
            );
          }
        }
      }
    }
  }
  const format = (maske) => {
    const d = (FORMAT_BITS_M << 3) | maske;
    let r = d;
    for (let i = 0; i < 10; i++) r = (r << 1) ^ ((r >>> 9) * 0x537);
    const b = ((d << 10) | r) ^ 0x5412;
    for (let i = 0; i <= 5; i++) setz(8, i, bit(b, i));
    setz(8, 7, bit(b, 6));
    setz(8, 8, bit(b, 7));
    setz(7, 8, bit(b, 8));
    for (let i = 9; i < 15; i++) setz(14 - i, 8, bit(b, i));
    for (let i = 0; i < 8; i++) setz(n - 1 - i, 8, bit(b, i));
    for (let i = 8; i < 15; i++) setz(8, n - 15 + i, bit(b, i));
    setz(8, n - 8, true);
  };
  format(0);
  if (ver >= 7) {
    let r = ver;
    for (let i = 0; i < 12; i++) r = (r << 1) ^ ((r >>> 11) * 0x1f25);
    const b = (ver << 12) | r;
    for (let i = 0; i < 18; i++) {
      const a = n - 11 + (i % 3);
      const c = Math.floor(i / 3);
      setz(a, c, bit(b, i));
      setz(c, a, bit(b, i));
    }
  }

  // Codewörter im Zickzack eintragen.
  let bi = 0;
  for (let rechts = n - 1; rechts >= 1; rechts -= 2) {
    if (rechts === 6) rechts = 5;
    for (let v = 0; v < n; v++) {
      for (let j = 0; j < 2; j++) {
        const x = rechts - j;
        const hoch = ((rechts + 1) & 2) === 0;
        const y = hoch ? n - 1 - v : v;
        if (!fest[y][x] && bi < alle.length * 8) {
          mod[y][x] = bit(alle[bi >>> 3], 7 - (bi & 7));
          bi++;
        }
      }
    }
  }

  const maskiere = (m) => {
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let inv;
        switch (m) {
          case 0:
            inv = (x + y) % 2 === 0;
            break;
          case 1:
            inv = y % 2 === 0;
            break;
          case 2:
            inv = x % 3 === 0;
            break;
          case 3:
            inv = (x + y) % 3 === 0;
            break;
          case 4:
            inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
            break;
          case 5:
            inv = ((x * y) % 2) + ((x * y) % 3) === 0;
            break;
          case 6:
            inv = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
            break;
          default:
            inv = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
        }
        if (!fest[y][x] && inv) mod[y][x] = !mod[y][x];
      }
    }
  };

  // Maske mit der kleinsten Strafpunktzahl wählen (Norm, Abschnitt 7.8.3).
  let beste = 0;
  let besteStrafe = Infinity;
  for (let m = 0; m < 8; m++) {
    maskiere(m);
    format(m);
    const s = strafe(mod, n);
    if (s < besteStrafe) {
      besteStrafe = s;
      beste = m;
    }
    maskiere(m);
  }
  maskiere(beste);
  format(beste);

  return {groesse: n, version: ver, dunkel: (x, y) => mod[y][x]};
}

function strafe(mod, n) {
  let s = 0;
  const lauf = (get) => {
    for (let a = 0; a < n; a++) {
      let farbe = false;
      let len = 0;
      const hist = [0, 0, 0, 0, 0, 0, 0];
      const add = (l) => {
        if (hist[0] === 0) l += n;
        hist.pop();
        hist.unshift(l);
      };
      const muster = () => {
        const k = hist[1];
        const kern =
          k > 0 &&
          hist[2] === k &&
          hist[3] === k * 3 &&
          hist[4] === k &&
          hist[5] === k;
        return (
          (kern && hist[0] >= k * 4 && hist[6] >= k ? 1 : 0) +
          (kern && hist[6] >= k * 4 && hist[0] >= k ? 1 : 0)
        );
      };
      for (let b = 0; b < n; b++) {
        if (get(a, b) === farbe) {
          len++;
          if (len === 5) s += 3;
          else if (len > 5) s++;
        } else {
          add(len);
          if (!farbe) s += muster() * 40;
          farbe = get(a, b);
          len = 1;
        }
      }
      if (farbe) {
        add(len);
        len = 0;
      }
      add(len + n);
      s += muster() * 40;
    }
  };
  lauf((a, b) => mod[a][b]);
  lauf((a, b) => mod[b][a]);
  let dunkel = 0;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (mod[y][x]) dunkel++;
      if (
        y < n - 1 &&
        x < n - 1 &&
        mod[y][x] === mod[y][x + 1] &&
        mod[y][x] === mod[y + 1][x] &&
        mod[y][x] === mod[y + 1][x + 1]
      ) {
        s += 3;
      }
    }
  }
  const gesamt = n * n;
  s += (Math.ceil(Math.abs(dunkel * 20 - gesamt * 10) / gesamt) - 1) * 10;
  return s;
}

/** SVG-Pfad der dunklen Module, versetzt um den Rand (in Modulen). */
export function qrPfad(qr, rand = 4) {
  let d = '';
  for (let y = 0; y < qr.groesse; y++) {
    for (let x = 0; x < qr.groesse; x++) {
      if (qr.dunkel(x, y)) d += `M${x + rand} ${y + rand}h1v1h-1z`;
    }
  }
  return d;
}

/** Vollständige SVG-Datei: weißer Grund, schwarze Module, Ruhezone 4 Module. */
export function qrSvgDatei(qr, rand = 4) {
  const k = qr.groesse + rand * 2;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${k} ${k}" ` +
    `width="${k * 10}" height="${k * 10}" shape-rendering="crispEdges">` +
    `<rect width="${k}" height="${k}" fill="#ffffff"/>` +
    `<path d="${qrPfad(qr, rand)}" fill="#000000"/></svg>`
  );
}

const PARTNERKONTO = 'https://aff.revolution.qiblanco.com/login';
const KONTAKT = 'info@qiblanco.com';

const CDN = 'https://cdn.shopify.com/s/files/1/0279/3095/1750/files/';

/* Bildschirmfotos vom 2026-09-24 (Test-Partner, Code und Referenz
   unkenntlich). Breite/Höhe = Pixelmaß der Datei, gegen Layout-Sprung.
   Kassen-Ausschnitte und die Weiter-Seite in doppelter Dichte (Alle-Formate-
   Prüfung: Quelle >= 1,8 x Anzeigebreite). */
const BILDER = {
  konto: {
    src: `${CDN}qb-partner-details--partner-details-01-partnerkonto-login--535fa00def01.webp?v=1790255474`,
    alt: 'Anmeldeseite des Qi Blanco Partnerkontos',
    w: 1280,
    h: 800,
  },
  konditionen: {
    src: `${CDN}qb-partner-details--partner-details-02-partnerprogramm--f67abced6296.webp?v=1790255477`,
    alt: 'Die Konditionen des Partnerprogramms: 10 % Provision, eigener 5-%-Code, 30 Tage Zuordnung',
    w: 1280,
    h: 800,
  },
  produkt: {
    src: `${CDN}qb-partner-details--partner-details-03-produktseite-handy--7c73f0dbd60f.webp?v=1790255480`,
    alt: 'Produktseite QiOne 2 Pro auf dem Handy, geöffnet über einen Rabattlink',
    w: 780,
    h: 1688,
  },
  warenkorb: {
    src: `${CDN}qb-partner-details--partner-details-04-warenkorb-handy--1a24160c2ce2.webp?v=1790255483`,
    alt: 'Warenkorb auf dem Handy, der Rabatt ist schon abgezogen',
    w: 780,
    h: 1688,
  },
  kasse: {
    src: `${CDN}qb-partner-details--partner-details-05-kasse-mit-code-2x--4f714628a029.webp?v=1790256449`,
    alt: 'Kasse mit angewendetem Partnercode und Abzug von 5 Prozent',
    w: 980,
    h: 760,
  },
  codefeld: {
    src: `${CDN}qb-partner-details--partner-details-06-kasse-code-eingeben-2x--518a6dbbe57d.webp?v=1790256452`,
    alt: 'Kasse ohne Code, das Feld Rabattcode oder Gutschein ist markiert',
    w: 980,
    h: 700,
  },
  eingebettet: {
    src: `${CDN}qb-partner-details--partner-details-07-eingebettet-weiter-2x--a6c210f86e7e.webp?v=1790256455`,
    alt: 'Ein eingebetteter Link zeigt den Knopf Jetzt öffnen statt einer Fehlermeldung',
    w: 1800,
    h: 1040,
  },
};

const LINKARTEN = [
  {
    titel: 'Rabattlink',
    marke: 'Unsere Empfehlung',
    text:
      'Dein Code liegt sofort im Warenkorb, und der Kauf wird dir ' +
      'zugeordnet. Überall, wo man tippen kann: Bio, Story, Newsletter, ' +
      'Website, Nachricht.',
    beispiel:
      'qiblanco.com/discount/DEINCODE?redirect=/products/qione-2-pro&sca_ref=DEINE-REFERENZ',
  },
  {
    titel: 'Empfehlungslink aus dem Partnerkonto',
    text:
      'Ordnet dir jeden Kauf 30 Tage lang zu und legt deinen Code gleich ' +
      'in den Warenkorb. Neue Konten: ab dem Tag nach der Freischaltung.',
    beispiel: 'qiblanco.com/?sca_ref=DEINE-REFERENZ',
  },
  {
    titel: 'Dein Code allein',
    text:
      'Für Gespräche, Podcasts und Videos. Dein Kunde tippt ihn in der ' +
      'Kasse in das Feld „Rabattcode oder Gutschein“. Zugeordnet wird der ' +
      'Kauf über den Code.',
    beispiel: 'DEINCODE',
  },
  {
    titel: 'Diese Adressen bitte nicht teilen',
    warnung: true,
    text:
      'Adressen aus der Kasse oder dem Warenkorb zeigen auf einen einzelnen ' +
      'Warenkorb. Sie laufen ab und öffnen sich in Vorschauen und ' +
      'eingebetteten Bausteinen nicht.',
    beispiel: 'checkout.qiblanco.com/…  ·  qiblanco.com/cart/…',
  },
];

const HILFE = [
  {
    frage:
      'Die Seite öffnet sich nicht, es steht „hat die Verbindung abgelehnt“.',
    antwort:
      'Der Link wurde eingebettet geöffnet, etwa in einer Vorschau oder ' +
      'einem Website-Baustein. Setze ihn als normalen Link. Seit dem ' +
      '24. September zeigt ein eingebetteter Link statt des Fehlers einen ' +
      'Knopf „Jetzt öffnen“, der den Shop in einem eigenen Fenster öffnet. ' +
      'Kassen-Adressen bleiben eingebettet gesperrt, das legt Shopify fest.',
    bild: 'eingebettet',
  },
  {
    frage: 'In der Kasse fehlt der Rabatt.',
    antwort:
      'Dein Empfehlungslink und der Rabattlink legen den Code in den ' +
      'Warenkorb. Hatte dein Kunde schon einen anderen Code eingegeben, ' +
      'bleibt seiner stehen. Dann gibt er deinen Code in der Kasse in das ' +
      'Feld „Rabattcode oder Gutschein“ ein und tippt auf „Anwenden“.',
    bild: 'codefeld',
  },
  {
    frage: 'Der Link wird in Instagram, TikTok oder Facebook geöffnet.',
    antwort:
      'Diese Apps öffnen Links in einem eigenen kleinen Browser. Dort gehen ' +
      'Rabatt und Zuordnung manchmal verloren. Empfiehl deinen Leuten ' +
      '„Im Browser öffnen“ über die drei Punkte oben rechts. Der Code ' +
      'funktioniert in jedem Fall.',
  },
  {
    frage: 'Der QR-Code lässt sich nicht scannen.',
    antwort:
      'Druck ihn größer, mindestens 2 × 2 cm, und lass rundherum einen ' +
      'weißen Rand. Auf glänzender Folie spiegelt er, mattes Papier ' +
      'scannt sicherer. Neben dem QR-Code steht dein Code: den kann jeder ' +
      'in der Kasse eintippen.',
  },
  {
    frage: 'Ein Kauf wurde mir nicht zugeordnet.',
    antwort:
      'Die Zuordnung über den Link gilt 30 Tage im selben Browser auf ' +
      'demselben Gerät. Wer am Handy klickt und später am Laptop kauft, wird ' +
      'dir über den Code zugeordnet. Deshalb gehört der Code in jede ' +
      'Empfehlung.',
  },
  {
    frage: 'Ich will meinen Link selbst testen.',
    antwort:
      'Öffne ihn einmal im normalen Browser und einmal in einem privaten ' +
      'Fenster und geh bis in die Kasse. Dort siehst du deinen Code mit dem ' +
      'Abzug. Eigene Käufe bringen keine Provision, der Rabatt greift ' +
      'trotzdem.',
  },
];

function Bild({name, klasse}) {
  const b = BILDER[name];
  return (
    <img
      className={klasse}
      src={b.src}
      alt={b.alt}
      width={b.w}
      height={b.h}
      loading="lazy"
      decoding="async"
    />
  );
}

/* Referenz aus einem eingefügten Link oder als nackter Wert. */
function referenzAus(eingabe) {
  const text = (eingabe || '').trim();
  const treffer = text.match(/sca_ref=([0-9]+\.[A-Za-z0-9]+)/);
  if (treffer) return treffer[1];
  return /^[0-9]+\.[A-Za-z0-9]+$/.test(text) ? text : '';
}

function codeAus(eingabe) {
  const text = (eingabe || '').trim();
  return /^[A-Za-z0-9_-]{2,40}$/.test(text) ? text : '';
}

/* Baut den Rabattlink. Exportiert für den Test. */
export function baueRabattlink(code, referenzEingabe, pfad) {
  const c = codeAus(code);
  if (!c) return {link: '', hinweis: 'Trag deinen Gutscheincode ein.'};
  const ref = referenzAus(referenzEingabe);
  const ziel = ZIELE.some((z) => z.pfad === pfad) ? pfad : '/';
  let link =
    `https://qiblanco.com/discount/${encodeURIComponent(c)}` +
    `?redirect=${ziel}`;
  if (ref) link += `&sca_ref=${ref}`;
  const hinweis = ref
    ? 'Fertig: Rabatt und Zuordnung stecken im Link.'
    : 'Ohne Empfehlungslink kommt der Rabatt an, zugeordnet wird dann über den Code.';
  return {link, hinweis};
}

/* Kopieren mit Rückfall für ältere In-App-Browser ohne Clipboard-API. */
function kopiereAlt(text) {
  try {
    const feld = document.createElement('textarea');
    feld.value = text;
    feld.setAttribute('readonly', '');
    feld.style.position = 'fixed';
    feld.style.opacity = '0';
    document.body.appendChild(feld);
    feld.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(feld);
    return ok;
  } catch {
    return false;
  }
}

function kopiereText(text) {
  if (
    typeof navigator !== 'undefined' &&
    navigator.clipboard &&
    typeof window !== 'undefined' &&
    window.isSecureContext
  ) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => kopiereAlt(text),
    );
  }
  return Promise.resolve(kopiereAlt(text));
}

function KopierKnopf({text, label, primaer}) {
  const [stand, setStand] = useState('');
  useEffect(() => setStand(''), [text]);
  return (
    <button
      type="button"
      className={primaer ? 'lp-vp-btn' : 'lp-vp-btn lp-vp-btn--secondary'}
      onClick={() =>
        kopiereText(text).then((ok) =>
          setStand(ok ? 'Kopiert' : 'Bitte markieren und kopieren'),
        )
      }
      disabled={!text}
      data-lp-pd-kopieren
    >
      {stand || label}
    </button>
  );
}

function ladeDatei(name, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function QrSvg({qr, klasse, label}) {
  const k = qr.groesse + 8;
  return (
    <svg
      className={klasse}
      viewBox={`0 0 ${k} ${k}`}
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
      shapeRendering="crispEdges"
    >
      <rect width={k} height={k} fill="#ffffff" />
      <path d={qrPfad(qr)} fill="#000000" />
    </svg>
  );
}

function QrBlock({qr, code}) {
  if (!qr) {
    return (
      <p className="lp-pd-hinweis" data-lp-pd-qr-leer>
        Mit deinem Code erscheint hier der QR-Code zu deinem Rabattlink, zum
        Laden als PNG oder SVG.
      </p>
    );
  }
  const name = `qi-blanco-rabattlink-${(code || 'qr').toLowerCase()}`;
  function svgLaden() {
    ladeDatei(
      `${name}.svg`,
      new Blob([qrSvgDatei(qr)], {type: 'image/svg+xml'}),
    );
  }
  function pngLaden() {
    const px = 16;
    const k = qr.groesse + 8;
    const leinwand = document.createElement('canvas');
    leinwand.width = k * px;
    leinwand.height = k * px;
    const ctx = leinwand.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, leinwand.width, leinwand.height);
    ctx.fillStyle = '#000000';
    for (let y = 0; y < qr.groesse; y++) {
      for (let x = 0; x < qr.groesse; x++) {
        if (qr.dunkel(x, y)) ctx.fillRect((x + 4) * px, (y + 4) * px, px, px);
      }
    }
    leinwand.toBlob((b) => b && ladeDatei(`${name}.png`, b), 'image/png');
  }
  return (
    <div className="lp-pd-qr" data-lp-pd-qr>
      <QrSvg
        qr={qr}
        klasse="lp-pd-qr__bild"
        label="QR-Code zu deinem Rabattlink"
      />
      <div className="lp-pd-qr__text">
        <p className="lp-pd-qr__titel">
          Dein QR-Code für Flyer, Visitenkarte und Aufsteller
        </p>
        <p className="lp-pd-hinweis">
          Druck ihn mindestens 2 × 2 cm groß, mit weißem Rand. Scanne den
          Probedruck einmal mit dem Handy.
        </p>
        <div className="lp-pd-qr__knoepfe">
          <button
            type="button"
            className="lp-vp-btn lp-vp-btn--secondary"
            onClick={pngLaden}
          >
            QR als PNG laden
          </button>
          <button
            type="button"
            className="lp-vp-btn lp-vp-btn--secondary"
            onClick={svgLaden}
          >
            QR als SVG laden
          </button>
        </div>
      </div>
    </div>
  );
}

function Baukasten({eingaben, setEingaben, link, hinweis, qr}) {
  const {code, referenz, pfad} = eingaben;
  const setze = (feld) => (e) =>
    setEingaben((alt) => ({...alt, [feld]: e.target.value}));
  return (
    <div className="lp-pd-baukasten" data-lp-pd-baukasten>
      <label className="lp-pd-feld">
        <span>Dein Gutscheincode</span>
        <input
          type="text"
          value={code}
          autoComplete="off"
          spellCheck="false"
          placeholder="zum Beispiel DEINCODE"
          onChange={setze('code')}
        />
      </label>
      <label className="lp-pd-feld">
        <span>Dein Empfehlungslink aus dem Partnerkonto</span>
        <input
          type="text"
          value={referenz}
          autoComplete="off"
          spellCheck="false"
          placeholder="https://qiblanco.com/?sca_ref=…"
          onChange={setze('referenz')}
        />
      </label>
      <label className="lp-pd-feld">
        <span>Wohin soll der Link führen?</span>
        <select value={pfad} onChange={setze('pfad')}>
          {ZIELE.map((z) => (
            <option key={z.pfad} value={z.pfad}>
              {z.name}
            </option>
          ))}
        </select>
      </label>
      <div className="lp-pd-ergebnis" aria-live="polite">
        <code data-lp-pd-link>{link || '…'}</code>
        <KopierKnopf text={link} label="Link kopieren" primaer />
      </div>
      <p className="lp-pd-hinweis">{hinweis}</p>
      <QrBlock qr={qr} code={codeAus(code)} />
      <p className="lp-pd-hinweis">
        Der Baukasten rechnet nur in deinem Browser und speichert nichts.
      </p>
    </div>
  );
}

function Hero() {
  return (
    <section
      className="lp-a-hero"
      aria-labelledby="lp-pd-hero-title"
      data-section="lp-pd-hero"
    >
      <div className="lp-a-hero__inner lp-pd-hero__inner">
        <div className="lp-a-hero__copy">
          <span className="lp-a-hero__eyebrow">Für Partner</span>
          <h1 id="lp-pd-hero-title" className="lp-a-hero__title">
            So setzt du deinen Link ein: für jeden Kanal, mit fertigem Text.
          </h1>
          <ul className="lp-a-hero__dreizeiler">
            <li>Welcher Link wohin gehört.</li>
            <li>Schritt für Schritt, mit Bild.</li>
            <li>Texte mit deinem Code zum Kopieren.</li>
          </ul>
          <p className="lp-a-hero__subline">
            Deine Empfehlung kommt zweimal an: bei deinen Leuten als 5&nbsp;%
            Rabatt und bei dir als Provision. Für Instagram, TikTok, YouTube,
            Podcast, Newsletter, Website, Nachrichten und vor Ort siehst du, wie
            das geht und wie es aussieht.
          </p>
          <div className="lp-pd-hero__knoepfe">
            <a className="lp-vp-btn lp-vp-btn--lg" href="#baukasten">
              Rabattlink bauen
            </a>
            <a className="lp-pd-textlink" href="#kanaele">
              Zu den Kanälen
            </a>
            <a className="lp-pd-textlink" href={PARTNERKONTO} rel="noopener">
              Zum Partnerkonto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Uebersicht() {
  return (
    <section
      id="uebersicht"
      aria-labelledby="lp-pd-uebersicht-title"
      data-section="lp-pd-uebersicht"
    >
      <span className="eyebrow">Übersicht</span>
      <h2 id="lp-pd-uebersicht-title">Wo setze ich welchen Link ein?</h2>
      <p className="lp-vp-section__lede">
        Die Faustregel: Wo man tippen kann, gehört dein Rabattlink hin. Wo man
        nur sieht oder hört, dein Code. Am besten steht beides da.
      </p>
      <table className="lp-pd-tabelle">
        <thead>
          <tr>
            <th scope="col">Kanal</th>
            <th scope="col">Welcher Link</th>
            <th scope="col">Wofür</th>
            <th scope="col">Ziel</th>
          </tr>
        </thead>
        <tbody>
          {KANAELE.map((k) => (
            <tr key={k.id}>
              <th scope="row">
                <a href={`#kanal-${k.id}`}>{k.name}</a>
              </th>
              <td data-titel="Link">{k.link}</td>
              <td data-titel="Wofür">{k.kurz}</td>
              <td data-titel="Ziel">{k.ziel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function BaukastenSektion(props) {
  return (
    <section
      id="baukasten"
      aria-labelledby="lp-pd-baukasten-title"
      data-section="lp-pd-baukasten"
    >
      <span className="eyebrow">Link-Baukasten</span>
      <h2 id="lp-pd-baukasten-title">
        Deinen Rabattlink in zehn Sekunden bauen
      </h2>
      <p className="lp-vp-section__lede">
        Code eintragen, Empfehlungslink einfügen, Ziel wählen. Der fertige Link
        bringt deinen Rabatt in den Warenkorb und den Kauf zu dir. Dazu gibt es
        den QR-Code, und jeder Beispieltext übernimmt Code und Link.
      </p>
      <Baukasten {...props} />
    </section>
  );
}

/* ─── Mockups: schlicht, eigene Formen, keine fremden Oberflächen ────────── */

function LinkSymbol() {
  return (
    <svg
      className="lp-pd-mock__symbol"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.5 9.5l3-3M7 4.5l1-1a2.5 2.5 0 013.5 3.5l-1 1M9 11.5l-1 1A2.5 2.5 0 014.5 9l1-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Z({b = 80, hell}) {
  return (
    <span
      className={`lp-pd-mock__z lp-pd-mock__z--${b}${hell ? ' lp-pd-mock__z--hell' : ''}`}
    />
  );
}

let startseitenQr = null;
function beispielQr(werte) {
  if (werte.qr) return werte.qr;
  if (!startseitenQr) startseitenQr = qrKodieren('https://qiblanco.com/');
  return startseitenQr;
}

function Mock({art, werte}) {
  const code = werte.code || PLATZHALTER_CODE;
  const kurzlink = (
    <>
      qiblanco.com/
      <wbr />
      discount/
      <wbr />
      {code}
    </>
  );
  switch (art) {
    case 'ig-bio':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--handy"
          role="img"
          aria-label="Profil mit Bio-Text, Code und Rabattlink"
        >
          <div className="lp-pd-mock__kopf">
            <span className="lp-pd-mock__avatar" />
            <span className="lp-pd-mock__zeilen">
              <Z b={60} />
              <Z b={40} />
            </span>
          </div>
          <span className="lp-pd-mock__zeilen">
            <Z b={100} />
            <span className="lp-pd-mock__text">5 % mit Code {code}</span>
            <span className="lp-pd-mock__link">
              <LinkSymbol />
              {kurzlink}
            </span>
          </span>
          <span className="lp-pd-mock__raster">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} />
            ))}
          </span>
        </div>
      );
    case 'ig-story':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--handy lp-pd-mock--dunkel"
          role="img"
          aria-label="Story mit Link-Sticker in der Bildmitte"
        >
          <Z b={100} hell />
          <span className="lp-pd-mock__mitte">
            <span className="lp-pd-mock__sticker">
              <LinkSymbol />5 % mit {code}
            </span>
          </span>
          <span className="lp-pd-mock__zeilen">
            <Z b={60} hell />
            <Z b={40} hell />
          </span>
        </div>
      );
    case 'ig-beitrag':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--handy"
          role="img"
          aria-label="Beitrag mit Code in der ersten Zeile und Verweis auf die Bio"
        >
          <div className="lp-pd-mock__kopf">
            <span className="lp-pd-mock__avatar" />
            <Z b={40} />
          </div>
          <span className="lp-pd-mock__foto" />
          <span className="lp-pd-mock__zeilen">
            <span className="lp-pd-mock__text">Werbung | 5 % mit {code}</span>
            <Z b={80} />
            <span className="lp-pd-mock__text lp-pd-mock__text--akzent">
              Link in meiner Bio
            </span>
          </span>
        </div>
      );
    case 'tiktok':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--handy lp-pd-mock--dunkel"
          role="img"
          aria-label="Hochkant-Video mit eingeblendetem Code und Hinweis auf den Link in der Bio"
        >
          <span className="lp-pd-mock__seite">
            <span />
            <span />
            <span />
          </span>
          <span className="lp-pd-mock__mitte">
            <span className="lp-pd-mock__einblendung">Code {code}</span>
          </span>
          <span className="lp-pd-mock__zeilen">
            <Z b={60} hell />
            <span className="lp-pd-mock__text lp-pd-mock__text--hell">
              Link in Bio
            </span>
          </span>
        </div>
      );
    case 'youtube':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer"
          role="img"
          aria-label="Video mit Rabattlink in der ersten Zeile der Beschreibung und im angepinnten Kommentar"
        >
          <span className="lp-pd-mock__film">
            <span className="lp-pd-mock__play" />
          </span>
          <span className="lp-pd-mock__zeilen">
            <Z b={80} />
            <span className="lp-pd-mock__link">
              <LinkSymbol />
              {kurzlink}
            </span>
            <Z b={60} />
          </span>
          <span className="lp-pd-mock__kommentar">
            <span className="lp-pd-mock__marke">Angepinnt</span>
            <span className="lp-pd-mock__link">
              <LinkSymbol />5 % mit {code}
            </span>
          </span>
        </div>
      );
    case 'podcast':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer"
          role="img"
          aria-label="Podcast-Folge mit gesprochenem Code und Link in den Shownotes"
        >
          <span className="lp-pd-mock__player">
            <span className="lp-pd-mock__cover" />
            <span className="lp-pd-mock__welle">
              {[3, 6, 4, 8, 5, 7, 3, 6, 8, 4, 6, 3].map((h, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={i} className={`lp-pd-mock__balken--${h}`} />
              ))}
            </span>
          </span>
          <span className="lp-pd-mock__text">„Mein Code ist {code}.“</span>
          <span className="lp-pd-mock__zeilen">
            <span className="lp-pd-mock__text lp-pd-mock__text--leise">
              Shownotes
            </span>
            <span className="lp-pd-mock__link">
              <LinkSymbol />
              {kurzlink}
            </span>
          </span>
        </div>
      );
    case 'newsletter':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer"
          role="img"
          aria-label="Newsletter mit einem Knopf, hinter dem der Rabattlink liegt"
        >
          <span className="lp-pd-mock__text lp-pd-mock__text--leise">
            Betreff: Mein Tipp für dich
          </span>
          <span className="lp-pd-mock__zeilen">
            <Z b={100} />
            <Z b={80} />
            <Z b={60} />
          </span>
          <span className="lp-pd-mock__knopf">5 % bei Qi Blanco</span>
          <Z b={40} />
        </div>
      );
    case 'website':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer lp-pd-mock--fenster"
          role="img"
          aria-label="Artikel auf einer Website mit einem Knopf, der in einem neuen Fenster öffnet"
        >
          <span className="lp-pd-mock__leiste">
            <span />
            <span />
            <span />
          </span>
          <span className="lp-pd-mock__zeilen">
            <Z b={60} />
            <Z b={100} />
            <Z b={80} />
          </span>
          <span className="lp-pd-mock__knopf">5 % bei Qi Blanco ↗</span>
          <Z b={60} />
        </div>
      );
    case 'messenger':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--handy"
          role="img"
          aria-label="Nachricht mit Rabattlink, Vorschau und Code"
        >
          <span className="lp-pd-mock__blase">
            <Z b={80} />
          </span>
          <span className="lp-pd-mock__blase lp-pd-mock__blase--eigen">
            <span className="lp-pd-mock__vorschau" />
            <span className="lp-pd-mock__text">
              Code {code} ist eingetragen
            </span>
            <span className="lp-pd-mock__link">
              <LinkSymbol />
              {kurzlink}
            </span>
          </span>
        </div>
      );
    case 'signatur':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer"
          role="img"
          aria-label="E-Mail mit einer Empfehlungszeile in der Signatur"
        >
          <span className="lp-pd-mock__zeilen">
            <Z b={100} />
            <Z b={80} />
          </span>
          <span className="lp-pd-mock__text">Viele Grüße</span>
          <Z b={40} />
          <span className="lp-pd-mock__trenner" />
          <span className="lp-pd-mock__link">
            <LinkSymbol />
            Meine Empfehlung: 5 % mit {code}
          </span>
        </div>
      );
    case 'flyer':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--karte"
          role="img"
          aria-label="Aufsteller mit QR-Code und Code"
        >
          <span className="lp-pd-mock__titel">5 % bei Qi Blanco</span>
          <QrSvg qr={beispielQr(werte)} klasse="lp-pd-mock__qr" />
          <span className="lp-pd-mock__code">Code: {code}</span>
          <Z b={60} />
        </div>
      );
    case 'vortrag':
      return (
        <div
          className="lp-pd-mock lp-pd-mock--quer lp-pd-mock--folie"
          role="img"
          aria-label="Letzte Folie eines Vortrags mit Code und QR-Code"
        >
          <span className="lp-pd-mock__zeilen">
            <span className="lp-pd-mock__titel">5 % mit {code}</span>
            <Z b={80} />
            <Z b={60} />
          </span>
          <QrSvg qr={beispielQr(werte)} klasse="lp-pd-mock__qr" />
        </div>
      );
    default:
      return (
        <div
          className="lp-pd-mock lp-pd-mock--gespraech"
          role="img"
          aria-label="Im Gespräch den Code nennen und danach den Link als Nachricht schicken"
        >
          <span className="lp-pd-mock__blase lp-pd-mock__blase--laut">
            „Mein Code ist {code}.“
          </span>
          <span className="lp-pd-mock__blase lp-pd-mock__blase--eigen">
            <span className="lp-pd-mock__text">Hier ist mein Link</span>
            <span className="lp-pd-mock__link">
              <LinkSymbol />
              {kurzlink}
            </span>
          </span>
        </div>
      );
  }
}

function Vorlage({titel, text}) {
  const html = text.startsWith('<a ');
  return (
    <div className="lp-pd-vorlage">
      <p className="lp-pd-vorlage__titel">{titel}</p>
      <p className="lp-pd-vorlage__text" data-lp-pd-vorlage>
        {text}
      </p>
      <KopierKnopf
        text={text}
        label={html ? 'HTML kopieren' : 'Text kopieren'}
      />
    </div>
  );
}

function KanalKarte({kanal, werte}) {
  return (
    <article
      className="lp-pd-kanal"
      id={`kanal-${kanal.id}`}
      data-kanal={kanal.id}
    >
      <div className="lp-pd-kanal__bild">
        <Mock art={kanal.mock} werte={werte} />
      </div>
      <div className="lp-pd-kanal__inhalt">
        <h3 className="lp-vp-benefit__title lp-pd-kanal__titel">
          {kanal.name}
        </h3>
        <dl className="lp-pd-kanal__fakten">
          <div>
            <dt>Wofür</dt>
            <dd>{kanal.wofuer}</dd>
          </div>
          <div>
            <dt>Welcher Link</dt>
            <dd>{kanal.link}</dd>
          </div>
          <div>
            <dt>Ziel</dt>
            <dd>{kanal.ziel}</dd>
          </div>
        </dl>
        <p className="lp-pd-kanal__zwischen">So geht’s</p>
        <ol className="lp-pd-kanal__schritte">
          {kanal.schritte.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        {kanal.hinweis ? (
          <p className="lp-pd-hinweis">{kanal.hinweis}</p>
        ) : null}
        <p className="lp-pd-kanal__zwischen">Beispieltext zum Kopieren</p>
        {kanal.texte.map((t) => (
          <Vorlage
            key={t.titel}
            titel={t.titel}
            text={fuelleVorlage(t.vorlage, werte)}
          />
        ))}
      </div>
    </article>
  );
}

function Kanaele({werte}) {
  const ziel = ZIELE.find((z) => z.pfad === werte.pfad) || ZIELE[0];
  return (
    <section
      id="kanaele"
      aria-labelledby="lp-pd-kanaele-title"
      data-section="lp-pd-kanaele"
    >
      <span className="eyebrow">Je Kanal</span>
      <h2 id="lp-pd-kanaele-title">So setzt du deinen Link ein</h2>
      <p className="lp-vp-section__lede">
        Für jeden Kanal: wofür er taugt, welcher Link hingehört, wie du ihn
        setzt und wie es aussieht. Dazu ein Beispieltext zum Kopieren. Pass ihn
        an dich an, deine eigenen Worte wirken am stärksten.
      </p>
      <div className="lp-pd-kanaele__kopf">
        <p className="lp-pd-stand" aria-live="polite" data-lp-pd-stand>
          {werte.code ? (
            <>
              In jedem Text stehen dein Code <strong>{werte.code}</strong> und
              dein Link zu <strong>{ziel.name}</strong>.{' '}
              <a href="#baukasten">Ändern</a>
            </>
          ) : (
            <>
              Trag im <a href="#baukasten">Link-Baukasten</a> deinen Code und
              deinen Empfehlungslink ein. Dann stehen beide in jedem Text.
            </>
          )}
        </p>
        <p className="lp-pd-kennzeichnung">
          <strong>Kennzeichnung:</strong> Üblich ist „Werbung“ oder „Anzeige“ am
          Anfang eines Beitrags. Bei einem Link reicht ein Sternchen mit dem
          Satz „*Empfehlungslink: Kaufst du darüber, erhalte ich eine
          Provision.“ Die Beispieltexte tragen den Hinweis schon.
        </p>
        <nav className="lp-pd-sprung" aria-label="Kanäle">
          {GRUPPEN.map((g) => (
            <a key={g.id} href={`#gruppe-${g.id}`}>
              {g.titel}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}

function KanalGruppe({gruppe, werte}) {
  return (
    <section
      className="lp-pd-gruppe"
      id={`gruppe-${gruppe.id}`}
      aria-labelledby={`lp-pd-gruppe-${gruppe.id}`}
      data-section={`lp-pd-gruppe-${gruppe.id}`}
    >
      <span className="eyebrow">Je Kanal</span>
      <h2 id={`lp-pd-gruppe-${gruppe.id}`}>{gruppe.titel}</h2>
      <div className="lp-pd-gruppe__karten">
        {KANAELE.filter((k) => k.gruppe === gruppe.id).map((k) => (
          <KanalKarte key={k.id} kanal={k} werte={werte} />
        ))}
      </div>
    </section>
  );
}

function Ziele({pfad, waehle}) {
  return (
    <section
      id="ziele"
      aria-labelledby="lp-pd-ziele-title"
      data-section="lp-pd-ziele"
    >
      <span className="eyebrow">Ziele</span>
      <h2 id="lp-pd-ziele-title">Wohin soll dein Link führen?</h2>
      <p className="lp-vp-section__lede">
        Zeigst du ein Produkt, verlinke genau dieses Produkt. Dein Kunde landet
        dort, wo er kaufen kann, statt auf der Startseite zu suchen.
      </p>
      <div className="lp-pd-karten lp-pd-ziele">
        {ZIELE.map((z) => (
          <article className="lp-a-benefit" key={z.pfad}>
            <h3 className="lp-vp-benefit__title">{z.name}</h3>
            <p className="lp-vp-benefit__body">{z.wann}</p>
            <code className="lp-pd-beispiel">
              {z.pfad === '/' ? 'qiblanco.com' : z.pfad}
            </code>
            <a
              className="lp-pd-textlink lp-pd-ziel__waehlen"
              href="#baukasten"
              onClick={() => waehle(z.pfad)}
              aria-current={pfad === z.pfad ? 'true' : undefined}
            >
              {pfad === z.pfad ? 'Im Baukasten gewählt' : 'Im Baukasten wählen'}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function Konto() {
  return (
    <section aria-labelledby="lp-pd-konto-title" data-section="lp-pd-konto">
      <span className="eyebrow">Dein Partnerkonto</span>
      <h2 id="lp-pd-konto-title">
        Link, Code und Zahlen liegen im Partnerkonto
      </h2>
      <div className="lp-pd-zweispaltig">
        <div className="lp-pd-text">
          <p>
            Du meldest dich unter{' '}
            <a href={PARTNERKONTO} rel="noopener">
              aff.revolution.qiblanco.com
            </a>{' '}
            an. Dort findest du deinen Empfehlungslink, deinen Gutscheincode,
            deine vermittelten Käufe und deine Auszahlungen.
          </p>
          <p>
            Den Empfehlungslink und den Code brauchst du gleich im Baukasten.
          </p>
        </div>
        <figure className="lp-pd-bild">
          <Bild name="konto" />
          <figcaption>Die Anmeldung zum Partnerkonto.</figcaption>
        </figure>
      </div>
    </section>
  );
}

function Linkarten() {
  return (
    <section aria-labelledby="lp-pd-links-title" data-section="lp-pd-links">
      <span className="eyebrow">Linkarten</span>
      <h2 id="lp-pd-links-title">Welcher Link wofür</h2>
      <div className="lp-pd-karten">
        {LINKARTEN.map((l) => (
          <article
            className={`lp-a-benefit${l.warnung ? ' lp-pd-karte--warnung' : ''}`}
            key={l.titel}
          >
            {l.marke ? <span className="lp-pd-marke">{l.marke}</span> : null}
            <h3 className="lp-vp-benefit__title">{l.titel}</h3>
            <p className="lp-vp-benefit__body">{l.text}</p>
            <code className="lp-pd-beispiel">{l.beispiel}</code>
          </article>
        ))}
      </div>
    </section>
  );
}

function Kunde() {
  return (
    <section aria-labelledby="lp-pd-kunde-title" data-section="lp-pd-kunde">
      <span className="eyebrow">Beim Kunden</span>
      <h2 id="lp-pd-kunde-title">So sieht es dein Kunde</h2>
      <div className="lp-pd-schritte">
        <figure className="lp-pd-bild lp-pd-bild--handy">
          <Bild name="produkt" />
          <figcaption>1. Dein Rabattlink öffnet die Produktseite.</figcaption>
        </figure>
        <figure className="lp-pd-bild lp-pd-bild--handy">
          <Bild name="warenkorb" />
          <figcaption>
            2. Im Warenkorb ist dein Rabatt schon abgezogen.
          </figcaption>
        </figure>
        <figure className="lp-pd-bild">
          <Bild name="kasse" />
          <figcaption>
            3. In der Kasse steht dein Code mit dem Abzug von 5&nbsp;%.
          </figcaption>
        </figure>
      </div>
      <p className="lp-a-note">
        Die Kasse zeigt die Preise zurzeit ohne Mehrwertsteuer und rechnet sie
        als „Geschätzte Steuern“ dazu. Der Endbetrag ist der Preis der
        Produktseite abzüglich deines Rabatts. Fragt dich jemand danach, kannst
        du genau das sagen.
      </p>
    </section>
  );
}

function Provision() {
  return (
    <section
      aria-labelledby="lp-pd-provision-title"
      data-section="lp-pd-provision"
    >
      <span className="eyebrow">Provision</span>
      <h2 id="lp-pd-provision-title">Provision und Auszahlung</h2>
      <div className="lp-pd-zweispaltig">
        <article className="lp-a-benefit">
          <ul className="lp-pp-liste lp-pp-liste--ja">
            <li>
              10&nbsp;% auf den Netto-Warenwert, also ohne Steuern und Versand.
            </li>
            <li>
              Gutgeschrieben wird, sobald der Kauf abgeschlossen und nicht
              widerrufen ist.
            </li>
            <li>
              Ausgezahlt wird per PayPal oder Banküberweisung. Die Verbindung
              hinterlegst du im Partnerkonto.
            </li>
            <li>
              Deine vermittelten Käufe und dein Guthaben siehst du im
              Partnerkonto.
            </li>
          </ul>
        </article>
        <figure className="lp-pd-bild">
          <Bild name="konditionen" />
          <figcaption>
            Die Konditionen im Überblick auf{' '}
            <a href="/pages/affiliate-partnerprogramm">
              der Seite zum Partnerprogramm
            </a>
            .
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Hilfe() {
  return (
    <section aria-labelledby="lp-pd-hilfe-title" data-section="lp-pd-hilfe">
      <span className="eyebrow">Hilfe</span>
      <h2 id="lp-pd-hilfe-title">Wenn es nicht funktioniert</h2>
      <dl className="lp-pp-faq lp-pd-hilfe">
        {HILFE.map((h) => (
          <div className="lp-pp-faq__item" key={h.frage}>
            <dt>{h.frage}</dt>
            <dd>
              {h.antwort}
              {h.bild ? (
                <figure className="lp-pd-bild lp-pd-bild--klein">
                  <Bild name={h.bild} />
                </figure>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Kontakt() {
  return (
    <section
      className="lp-vp-final-cta"
      aria-labelledby="lp-pd-kontakt-title"
      data-section="lp-pd-kontakt"
    >
      <div className="lp-pp-cta__inner">
        <span className="eyebrow">Kontakt</span>
        <h2 id="lp-pd-kontakt-title">Wir helfen dir weiter</h2>
        <p className="lp-vp-final-cta__lede">
          Schreib uns den Link, den du nutzt, und wo du ihn geteilt hast. Dann
          sagen wir dir, woran es liegt.
        </p>
        <a className="lp-vp-btn lp-vp-btn--lg" href={`mailto:${KONTAKT}`}>
          {KONTAKT}
        </a>
        <p className="lp-pp-konto lp-pp-konto--dunkel">
          <a href={PARTNERKONTO} rel="noopener">
            Zum Partnerkonto
          </a>
        </p>
      </div>
    </section>
  );
}

export function PartnerDetails() {
  const [eingaben, setEingaben] = useState({
    code: '',
    referenz: '',
    pfad: ZIELE[0].pfad,
  });
  const {link, hinweis} = baueRabattlink(
    eingaben.code,
    eingaben.referenz,
    eingaben.pfad,
  );
  const qr = useMemo(() => (link ? qrKodieren(link) : null), [link]);
  const werte = {code: codeAus(eingaben.code), link, pfad: eingaben.pfad, qr};
  const waehle = (pfad) => setEingaben((alt) => ({...alt, pfad}));
  return (
    <div className="lp-vp lp-a3 lp-pp lp-pd" data-qbp-route="partner-details">
      <Hero />
      <Uebersicht />
      <Linkarten />
      <Konto />
      <BaukastenSektion
        eingaben={eingaben}
        setEingaben={setEingaben}
        link={link}
        hinweis={hinweis}
        qr={qr}
      />
      <Kanaele werte={werte} />
      {GRUPPEN.map((g) => (
        <KanalGruppe key={g.id} gruppe={g} werte={werte} />
      ))}
      <Ziele pfad={eingaben.pfad} waehle={waehle} />
      <Kunde />
      <Provision />
      <Hilfe />
      <Kontakt />
    </div>
  );
}
