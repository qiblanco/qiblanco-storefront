/**
 * /pages/faq — die Fragen, die Kundinnen und Kunden WIRKLICH stellen.
 *
 * REINE DATENFABRIK: kein React-Import, damit dieses Modul ohne Build-Toolchain
 * lesbar und in Node-Unit-Tests direkt aufrufbar ist (dieselbe Bauform wie
 * app/lib/faq-schema.js und app/lib/produkt-schema.js).
 *
 * ── WOHER DIE FRAGEN KOMMEN ──────────────────────────────────────────────
 * NICHT aus dem Kopf. Reihenfolge und Auswahl folgen der GEMESSENEN Nachfrage
 * aus /srv/openclaw/datawarehouse/comms.db, Tabelle `gorgias_chats` (1.798
 * Zeilen, 1.793 mit `customer_q`), ausgezählt über die 1.023 deutsch-
 * sprachigen Chats:
 *     1. Tragen/Grösse/Kette      272  (26,6 %)   <- zugleich das am
 *                                                     SCHWÄCHSTEN beantwortete
 *                                                     Thema und der grösste
 *                                                     Abbruchtreiber
 *     2. Wirkung/Skepsis/Beweis    216  (21,1 %)
 *     3. Wasser/Sauna/Duschen      187  (18,3 %)
 *     4. QiHome Platzierung        169  (16,5 %)
 *     6. Reichweite                 97   (9,5 %)   <- DACH-Spezialität,
 *                                                     5x häufiger als US
 *     7. Preis/Finanzierung         87   (8,5 %)
 *     8. Haltbarkeit                86   (8,4 %)
 *     9. Rückgabe/20-Tage-Test     46   (4,5 %)
 * Gegenprobe an der unabhängigen Vollanalyse vom 2026-06-08
 * (shared-state/support-gorgias-vollanalyse, DE+EN, n=1.798): Tragen/Grösse
 * 22,0 %, Wasser/Sauna 21,5 % — dieselben zwei an der Spitze.
 *
 * BEWUSST NICHT als Rangliste benutzt: die `theme`-Spalte von `fd_tickets`
 * (daraus stammt die kursierende Zahl „12,8 % Zweifel"). Sie ist als Kennzahl
 * disqualifiziert — der Klassifikator existiert nicht mehr, 28,4 % des
 * Zählers ist unsere eigene Ausgangspost, und der Wert ist ein Sechsjahres-
 * Mittel über einen Niveaubruch (Grossjob 20260827-wirkfrage-ist-
 * vertrauensfrage-zeitverlauf-anna-statistikmanager-prio6).
 *
 * ── WOHER DIE ANTWORTEN KOMMEN ───────────────────────────────────────────
 * Jede Antwort trägt unten ihre Quelle im Feld `quelle`. KEINE Zahl, keine
 * Zusage und kein Studienbefund ist hier neu erfunden; alles stammt aus einem
 * bereits freigegebenen Bestand (Produktseiten, Rechtstexte, Salesbot-Skills,
 * Studien-Registry). Wo der Bestand nichts hergibt, steht das in der Antwort
 * — statt einer Zahl, die gut klingt.
 *
 * ── DREI HARTE SCHREIBREGELN ─────────────────────────────────────────────
 * (1) DUZEN, durchgehend. Der Shop duzt (product-faqs.js: „ein Geschenk an
 *     Dich"). Der Anrede-Mix Sie/Du war einer der Mängel, wegen derer
 *     Christian am 2026-08-31 /pages/wirkt-das aus dem Index genommen hat
 *     (Commit f3cf31f) — ausdrücklich wegen der AUSFÜHRUNG, nicht wegen des
 *     Zwecks. Übernommene Sätze von dort sind deshalb umgestellt.
 * (2) REICHWEITE NUR ALS RADIUS, NIE IN QUADRATMETERN. Wörtliche Auflage aus
 *     qi-salesbot/src/server/chat-skills.ts (Skill QiHome, Prio 940):
 *     „Reichweitenangaben als Auslegung und immer als Radius formulieren […],
 *     nie in Quadratmetern und nicht als sichere Eignungszusage; sprich von
 *     Einsatzbereich oder Auslegung, nie von 'Wirkungsradius' oder
 *     'Wirkbereich'." Die alte 300-m2-Angabe ist dort als FALSCH UND GESPERRT
 *     vermerkt. Der Kunde fragt in Quadratmetern — beantwortet wird trotzdem
 *     als Radius, und die Seite sagt WARUM.
 * (3) KEIN WORT AUS DEM DENY-NETZ. app/lib/faq-schema.js filtert Items mit
 *     Eso-/Wirkmechanismus-Vokabular STILL aus dem FAQPage-JSON-LD heraus —
 *     sie werden nicht rot, sie verschwinden nur. Ein Text mit „kohärent"
 *     wäre also sichtbar, aber für Google unauszeichenbar. Das deckt sich
 *     mit der Kundensprache-Regel des Kaufüberzeugungs-Kanons („MEIDEN:
 *     kohärentes Wasser — unser Marketingwort, kein Kundenwort").
 *     Das Deny-Netz faengt BEIDE Schreibungen (/koh(ä|ae)rent/) — die
 *     ASCII-Form ist also kein Schlupfloch.
 *     Die Probe test/faq-seite.test.mjs prüft das mechanisch, statt sich auf
 *     Disziplin zu verlassen.
 *
 * KEIN Item hier trägt ein `flag` — anders als 21 der 40 Items in
 * product-faqs.js, die auf Christians freigegebene Umformulierung warten.
 * Genau deshalb geht dieser Bestand vollständig ins FAQPage-Schema.
 */

/** Interner Link, den die Antwort am Ende anbietet (der „nächste Klick"). */

export const FAQ_ALLTAG = [
  {
    q: 'Ich habe ein schmales Handgelenk — welche Größe brauche ich beim QiBracelet®?',
    a:
      'Miss die BREITE deines Handgelenks, nicht den Umfang. Das ist der häufigste Grund für eine ' +
      'Fehlbestellung: Die meisten geben uns einen Umfang in Zentimetern an, unsere Tabelle rechnet ' +
      'aber mit der Breite. Leg ein Lineal an die breiteste Stelle deines Handgelenks — dort, wo du ' +
      'an beiden Seiten die Knochen fühlst —, schließ ein Auge und lies den Wert ab. ' +
      'Danach gilt: 4,5 cm und 5 cm brauchen S. 5,5 cm ist der Grenzfall — locker M, anliegend S. ' +
      '6 cm ist M. 6,5 cm ist locker L und anliegend M. 7 cm und 7,5 cm brauchen L. ' +
      'Das QiBracelet® lässt sich vorsichtig dehnen und wieder verengen, deshalb passen die meisten ' +
      'Handgelenke in zwei Größen — je nachdem, ob es locker mitlaufen oder anliegen soll. ' +
      'Wenn du unsicher bist, schreib uns die gemessene Breite, dann sagen wir dir die Größe.',
    /*
     * Zusätzliche SICHTBARE Lesehilfe — bewusst KEIN Ersatz für den Fliesstext
     * oben: `a` muss für sich allein vollständig sein, weil genau dieser String
     * (und nur er) in `acceptedAnswer.text` des FAQPage-Schemas landet. Eine
     * Antwort, die ihre Zahlen nur in einer Tabelle führt, ist für Google und
     * für KI-Antwortsysteme leer. Reine Daten, kein JSX — dieses Modul bleibt
     * eine Datenfabrik.
     */
    tabelle: {
      caption:
        'Handgelenksbreite (nicht Umfang!) — gemessen an der breitesten Stelle. ' +
        'Quelle: Größentabelle der QiBracelet®-Produktseite.',
      kopf: ['Deine Handgelenksbreite', 'Locker (bewegt sich)', 'Anliegend (liegt an)'],
      zeilen: [
        ['4,5 cm', 'S', '—'],
        ['5 cm', 'S', 'S, verengt'],
        ['5,5 cm', 'M', 'S'],
        ['6 cm', 'M', 'M, verengt'],
        ['6,5 cm', 'L', 'M'],
        ['7 cm', 'L', 'L, verengt'],
        ['7,5 cm', 'L, gedehnt', 'L'],
      ],
    },
    quelle:
      'app/components/product-pages/QiBracelet.jsx, Abschnitt „Finde die perfekte Passform" ' +
      '(Messanleitung + Größentabelle Loose Fit / Tight Fit), live am 2026-09-02 nachgelesen. ' +
      'Der Hinweis „Breite, nicht Umfang" ist der Befund aus den Kundenzitaten: gefragt wird ' +
      'in Umfang („mein Armumfang ist 16,5cm brauche ich S oder M"), geantwortet wird in Breite.',
  },
  {
    q: 'Darf der QiOne® 2 Pro nass werden — Dusche, Meer, Sauna?',
    a:
      'Ja. Die Technik ist unempfindlich gegenüber Wasser. QiOne® 2 Pro und QiBracelet® sind ' +
      'resistent gegen Chlor- und Meerwasser, Schweiß, Sonneneinstrahlung und Hitze. Du kannst sie ' +
      'beim Duschen, beim Schwimmen, in der Sauna und beim Sport anlassen.',
    quelle:
      'app/data/product-faqs.js, Item „Darf der QiOne® in die Sauna bzw. nass werden?" (ungeflaggt), ' +
      'wortgleich live auf /products/qione-2-pro nachgemessen 2026-09-02.',
  },
  {
    q: 'Wo und wie trage ich den QiOne® 2 Pro?',
    a:
      'An jeder Stelle am Körper, die dir passt — eine vorgeschriebene Position gibt es nicht. ' +
      'Für eine Kette hat er eine Bohrung von 2,5 mm Durchmesser. Das mitgelieferte Baumwollbändchen ' +
      'ist ein Geschenk, damit du ihn sofort tragen kannst; du darfst es jederzeit durch deine ' +
      'Lieblingskette ersetzen. Ein praktischer Hinweis dazu: Ketten aus (Edel-)Metall sind härter ' +
      'als das Gehäuse und können es verkratzen — für diesen Fall gibt es unser Necklace aus ' +
      'Edelstahl. Und wenn du gar nichts um den Hals tragen möchtest, geht auch die Hosentasche.',
    quelle:
      'app/data/product-faqs.js, Items „Wie sollte ich den QiOne® tragen?" und „Kann ich den QiOne® ' +
      'an einer anderen Kette tragen?". BEWUSST WEGGELASSEN: der Satz „Der Effekt wird mit ' +
      'Hautkontakt stärker" und der Absatz über „zu intensives" Empfinden — beide tragen im ' +
      'Bestand das flag `unfalsifizierbar` und warten auf Christians Umformulierung.',
  },
  {
    q: 'Muss ich den QiOne® 2 Pro laden, warten oder irgendwann austauschen?',
    a:
      'Nein. Im QiOne® 2 Pro steckt keine Elektronik, kein Akku und keine Batterie — es gibt nichts ' +
      'zu laden, nichts nachzufüllen und keine Verschleißteile. Das Gehäuse ist aus Chirurgenstahl, ' +
      'der GitterChip™ aus einer maßgeschneiderten 750er Goldlegierung, von Hand fertiggestellt. ' +
      'Du kaufst ihn einmal, danach entstehen keine Folgekosten.',
    quelle:
      'app/data/product-faqs.js: „enthält keinerlei elektronische Bauteile" + Material-Item ' +
      '(ungeflaggt). KEINE Lebensdauer-Zahl genannt: Kunden fragen danach („Jahrzehnte heißt ' +
      'mindestens 20 Jahre?"), aber im Bestand steht keine belegte Zahl. Eine erfundene wäre der ' +
      'bequeme Weg gewesen.',
  },
];

export const FAQ_QIHOME = [
  {
    q: 'Wie weit reicht ein QiHome® Air — reicht ein Gerät für meine Wohnung?',
    a:
      'Das QiHome® Air ist auf einen Einsatzbereich von bis zu 160 m Radius ausgelegt ' +
      '(Herstellerangabe). Damit ist eine Wohnung, ein Einfamilienhaus und auch eine Büro- oder ' +
      'Praxisfläche abgedeckt — für die allermeisten Haushalte reicht ein einziges Gerät, auch über ' +
      'mehrere Stockwerke oder Wände hinweg. Zwei Einschränkungen, die dazugehören: Wie stark das im ' +
      'Alltag ankommt, hängt vom Umfeld ab, und in technisch stark belasteten Umgebungen ordnen wir ' +
      'es vorsichtiger ein. Eine Angabe in Quadratmetern wirst du bei uns bewusst nicht finden: ' +
      'Eine früher kursierende Zahl von 300 m² war schlicht falsch, und wir verwenden sie nicht ' +
      'mehr.',
    quelle:
      'qi-salesbot/src/server/chat-skills.ts, Skill QiHome (Prio 940), Evidenz-Zeile wörtlich: ' +
      '„Ausgelegt auf einen Radius von bis zu 160 m (rund 8 Hektar, Herstellerangabe) […] Die alte ' +
      '300-m2-Angabe ist falsch und gesperrt." Formulierung folgt der dortigen Auflage: als ' +
      'AUSLEGUNG und als RADIUS, nie in Quadratmetern, nie als sichere Eignungszusage.',
  },
  {
    q: 'Wo stelle ich das QiHome® Air am besten hin — und muss es in die Steckdose?',
    a:
      'In die Steckdose muss es nicht. Das QiHome® Air arbeitet ohne Stromanschluss; es lässt sich ' +
      'zwar in eine europäische Schuko-Steckdose stecken, für die Funktion nötig ist das aber nicht. ' +
      'Stell es dorthin, wo du dich viel aufhältst — bewährt haben sich das Schlafzimmer und ein ' +
      'zentral genutzter Raum. Halte im Umkreis von etwa 0,5 m leistungsstarke Elektrogeräte fern: ' +
      'Mikrowelle, PC oder WLAN-Router können den Aufbau stören. Gib ihm außerdem Zeit — nach dem ' +
      'Aufstellen baut sich das Feld über mehrere Stunden auf und nach dem Wegnehmen über Stunden ' +
      'wieder ab. Kurzes Umstellen oder ein Steckdosenwechsel ist deshalb unkritisch.',
    quelle:
      'qi-salesbot/src/server/chat-skills.ts, Skill QiHome, Platzierungs-Evidenz (0,5-m-Umkreis, ' +
      'Schlafzimmer/zentraler Raum, Auf- und Abbau über Stunden; Zahl-SSoT ' +
      'data/referenzzahlen-vertrag.json, Eintrag qihome-platzierung-abstand-m) + product-faqs.js ' +
      'Item „Muss das QiHome® Air in die Steckdose eingesteckt werden?" (ungeflaggt).',
  },
];

export const FAQ_BELEGE = [
  {
    q: 'Wirkt das überhaupt? Was ist wirklich belegt — und was nicht?',
    a:
      'Fünf Arbeiten sind veröffentlicht, und wie stark sie sind, sagen wir dir gleich mit: Vier ' +
      'davon sind Zellstudien im Labor, also in vitro. Die fünfte wertet 171 freiwillige ' +
      'Erfahrungsberichte aus und hat weder Kontrollgruppe noch Verblindung. Eine kontrollierte ' +
      'Studie am Menschen gibt es nicht — keine einzige. Das heißt: Was im Labor an Zellen messbar ' +
      'war, ist gemessen worden. Ob und wie du selbst etwas merkst, folgt daraus nicht. Alle fünf ' +
      'Publikationen liegen bei uns offen als PDF, mit Methode, Zahlen und den Grenzen, die die ' +
      'Autoren selbst benennen — du kannst sie im Original nachlesen, ohne uns etwas zu glauben.',
    quelle:
      'app/components/campaign/MmWirktDas.jsx, Konstanten STUDIEN/GRENZEN (ihrerseits aus der ' +
      'faktengegateten Registry app/data/studien/e0001…e0005.json). Inhaltsgrenze wie dort: ' +
      'wörtlich „in vitro", ausdrücklich kein klinischer Wirknachweis am Menschen.',
  },
  {
    q: 'Es gibt öffentliche Kritik an Qi Blanco, auch Videos von Wissenschaftlern. Was sagt ihr dazu?',
    a:
      'Ja, die gibt es — und der härteste Punkt darin ist berechtigt: Für unsere Produkte liegt kein ' +
      'Wirknachweis am Menschen vor. Drei weitere Punkte, die wir nicht bestreiten: Alle fünf Arbeiten ' +
      'stammen von demselben Labor, dem Dartsch Scientific Institut von Prof. Dr. Peter C. Dartsch. ' +
      'Wir haben sie bezahlt und die Geräte gestellt — das ist bei Produktforschung üblich und macht ' +
      'Ergebnisse nicht falsch, aber es heißt, dass eine unabhängige Wiederholung durch ein zweites ' +
      'Labor aussteht. Und das Erklärungsmodell dahinter ist in der etablierten Wissenschaft nicht ' +
      'anerkannt; die Publikationen führen es selbst als Hypothese. Was wir dem entgegensetzen, ist ' +
      'kein Gegenargument, sondern ein Angebot: Du musst uns nichts glauben. Du kannst es 20 Tage ' +
      'lang an dir selbst prüfen und ohne Angabe von Gründen zurückgeben.',
    quelle:
      'MmWirktDas.jsx GRENZEN 1–4 (wörtlich: „Es gibt keine Studie am Menschen", „Alle fünf ' +
      'Arbeiten stammen von demselben Labor", „Wir haben sie bezahlt", „Die Erklärung dahinter ist ' +
      'eine Hypothese") + ZWEIFEL-Item „Und wenn mich das alles nicht überzeugt?". ' +
      'NAMEN BEWUSST NICHT GENANNT (Entscheid s04, Begründung im RESULT): die namentliche Fassung ' +
      'liegt Christian als Vorlage vor.',
  },
  {
    q: 'Wie funktioniert das eigentlich — ganz ohne Elektronik?',
    a:
      'Im Inneren sitzt der GitterChip™ aus einer eigens entwickelten 750er Goldlegierung. ' +
      'Elektronik, Akku oder Batterie gibt es nicht, es wird nichts gesendet und nichts abgeschirmt. ' +
      'Zum Erklärungsmodell dahinter sind wir lieber ehrlich als eindrucksvoll: Es dreht sich um die ' +
      'Ordnung von Wasser, es ist in der etablierten Wissenschaft nicht anerkannt, und unsere ' +
      'Publikationen kennzeichnen es selbst als Hypothese. Das ist weniger schlimm, als es klingt, ' +
      'und wichtiger, als es aussieht: Die Messwerte hängen nicht von der Erklärung ab. Was in den ' +
      'Zellschalen passiert ist, wurde gemessen — warum es passiert ist, ist offen.',
    quelle:
      'MmWirktDas.jsx GRENZE 4 (wörtlich übernommen, Anrede angepasst) + product-faqs.js ' +
      'Material-Item (ungeflaggt). BEWUSST WEGGELASSEN: die Mechanismus-Erklärung aus ' +
      'product-faqs.js, die im Bestand die flags `eso-buzzword` und `wirkmechanismus` trägt.',
  },
];

export const FAQ_KAUF = [
  {
    q: 'Wie läuft der 20-Tage-Test — und was, wenn ich nichts merke?',
    a:
      'Zusätzlich zum gesetzlichen Widerrufsrecht von 14 Tagen kannst du bei uns 20 Tage ab Erhalt ' +
      'der Ware zurückgeben, ohne einen Grund zu nennen. Du darfst das Produkt in dieser Zeit tragen ' +
      'und benutzen — genau dafür ist die Frist da. Der Ablauf: Melde dich bei uns, sende zurück, du ' +
      'bekommst den Kaufpreis erstattet. Die unmittelbaren Kosten der Rücksendung trägst du. Und ja: ' +
      '„Ich merke nichts" ist ein völlig ausreichender Grund — du musst ohnehin keinen angeben.',
    quelle:
      'Kopfleiste jeder Seite („Jetzt 20 Tage risikofrei erleben!"), Bedingungen im Repo ' +
      '(„Frist: 20 Tage ab Erhalt · Grund: keiner nötig"), /policies/refund-policy für die ' +
      'gesetzliche 14-Tage-Frist und den Satz „Sie tragen die unmittelbaren Kosten der Rücksendung". ' +
      'Beide Fristen stehen NEBENEINANDER, weil sie zwei verschiedene Instrumente sind — genau die ' +
      'Lesart, die Segment s03 am 2026-09-01 für merchantReturnDays = 20 begründet hat.',
  },
  {
    q: 'Kann ich in Raten zahlen?',
    a:
      'Ja, über Klarna. Leg dein Produkt in den Warenkorb, geh zur Kasse und wähle „Klarna — Sofort ' +
      'oder später bezahlen". Im Klarna-Fenster wählst du dann „Ratenzahlung" und deine Laufzeit. ' +
      'Ab 25 € Warenwert sind 6 Monatsraten möglich, ab 500 € sind es 12 und ab 1.000 € bis zu 24. ' +
      'Zwei Dinge solltest du vorher wissen: Die Ratenzahlung wird von Klarna beziehungsweise PayPal ' +
      'selbst geprüft und ist nicht garantiert, und sie steht derzeit nur Kundinnen und Kunden mit ' +
      'deutschem Wohnsitz offen.',
    quelle:
      'app/data/product-faqs.js, Klarna-Item (ungeflaggt) für die Staffel 25/500/1.000 €; ' +
      'Footer-Fußnote 2 (app/components/Footer.jsx) wörtlich für die zwei Einschränkungen: ' +
      '„Eine Genehmigung für Ratenzahlungen ist nicht garantiert […] Ratenzahlung aktuell nur für ' +
      'Kunden mit deutschem Wohnsitz möglich." Der zweite Punkt beantwortet eine real gestellte ' +
      'Kundenfrage („kann man den qi one auch in der schweiz über klarna in raten zahlen?").',
  },
  {
    q: 'Warum kostet das so viel?',
    a:
      'Der Preis kommt aus dem Stück selbst: Gehäuse aus Chirurgenstahl, der GitterChip™ aus einer ' +
      'maßgeschneiderten 750er Goldlegierung, von Oberflächenveredlern und Goldschmieden in ' +
      'Handarbeit fertiggestellt. Es gibt keine Batterie, kein Abo und keinen Nachkauf — du zahlst ' +
      'einmal, danach kostet es nichts mehr. Was der Preis ausdrücklich nicht kauft, ist ein ' +
      'bewiesener Effekt beim Menschen; wie unsere Belege stehen, liest du weiter oben nach. Ob es ' +
      'dir das wert ist, musst du nicht vorher entscheiden — dafür sind die 20 Tage da.',
    quelle:
      'app/data/product-faqs.js Material-Item (ungeflaggt) für Chirurgenstahl/750er Goldlegierung/ ' +
      'Handarbeit; „keine Elektronik" ebenda. Der Evidenz-Satz ist derselbe wie oben und wird ' +
      'NICHT abgeschwächt, weil hier von Geld die Rede ist.',
  },
  {
    q: 'Was kostet der Versand und wie lange dauert er?',
    a:
      'Innerhalb Deutschlands 5,90 €, ab 99 € Warenwert versandkostenfrei. QiOne® 2 Pro, ' +
      'QiBracelet®, QiHome® Air und das Necklace liegen über dieser Schwelle und gehen damit ' +
      'versandkostenfrei raus. Nach Österreich kostet der Versand 6,90 €, in die Schweiz 21,00 €. ' +
      'Die Lieferzeit steht auf jeder Produktseite; für QiOne® 2 Pro, QiBracelet®, QiHome® Air und ' +
      'das Necklace sind es 2 bis 3 Tage, für die Crystal Cacao®-Sorten 1 bis 3 Werktage.',
    quelle:
      '/policies/shipping-policy, wörtlich „Deutschland 5,90 € (Versandkostenfrei ab 99€)", ' +
      '„Österreich 6,90 €", „Schweiz 21,00 €". Lieferzeiten aus der Messreihe von Segment s03 über ' +
      'alle 13 DACH-Produktseiten (2026-09-01): „In 2-3 Tagen bei Dir" auf den vier Geräteseiten, ' +
      '„Lieferung in 1–3 Werktagen" auf den Kakao-Seiten. Bewusst KEINE pauschale Zahl für „den ' +
      'Shop" — sieben der dreizehn Seiten nennen gar keine.',
  },
];

/**
 * Die vier Bloecke in Anzeige-Reihenfolge. Sie folgt dem Kaufueberzeugungs-
 * Kanon: NEUGIER-Themen zuerst (Alltag/Reichweite sind die gemessenen
 * DACH-Einstiegsfragen), CLOSER zuletzt (Zahlbarkeit, Risikoumkehr,
 * Preisrechtfertigung). Der Beweis-Block steht dazwischen und nicht oben —
 * „Beweis ist ein Closer, kein Hook": ihn nach vorne zu ziehen verschenkt ihn.
 */
export const FAQ_BLOECKE = [
  {
    id: 'alltag',
    titel: 'Im Alltag',
    intro: 'Größe, Wasser, Tragen, Haltbarkeit — die Fragen, die am häufigsten gestellt werden.',
    items: FAQ_ALLTAG,
  },
  {
    id: 'qihome',
    titel: 'QiHome® Air im Raum',
    intro: 'Wie weit es reicht und wohin es gehört.',
    items: FAQ_QIHOME,
  },
  {
    id: 'belege',
    titel: 'Belege und Kritik',
    intro: 'Was gemessen ist, was nicht — und wie wir mit der Kritik daran umgehen.',
    items: FAQ_BELEGE,
  },
  {
    id: 'kauf',
    titel: 'Kaufen ohne Risiko',
    intro: 'Rückgabe, Raten, Preis und Versand.',
    items: FAQ_KAUF,
  },
];

/** Alle Q&A der Seite in Anzeige-Reihenfolge — die Quelle des FAQPage-Schemas. */
export const FAQ_ALLE = FAQ_BLOECKE.flatMap((b) => b.items);
